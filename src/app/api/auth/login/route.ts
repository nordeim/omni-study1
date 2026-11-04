// ---------------------------------------------------------------------------
// POST /api/auth/login — the credential exchange. Rate-limited 10/IP/15 min;
// uniform "Invalid email or password" on any credential failure (no user
// enumeration); unverified accounts are gated behind the reference's inline
// copy (403 — the S15 gate). Success sets the sf_session cookie.
// ---------------------------------------------------------------------------

import { NextResponse, type NextRequest } from "next/server";

import { checkRateLimit, resetRateLimit, verifyLoginCredentials, burnLoginScryptWork, needsRehash, hashPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validation";
import { secureCookieFlag } from "@/lib/auth";
import { clientIp, publicUser, setSessionCookie } from "@/lib/server/auth";
import {
  errorResponse,
  parseWith,
  rateLimitedResponse,
  readJson,
  toErrorResponse,
} from "@/lib/server/http";

// S131/CF10: un-exported — route files cannot export shared symbols (the
// http.ts layering rule; nothing in src/ or tests/ imports these), and the
// copy is pinned at the e2e layer (tests/e2e/auth-flows.spec.ts).
const INVALID_CREDENTIALS = "Invalid email or password";
const UNVERIFIED_COPY =
  "Please verify your email before logging in. Check your email for the verification code.";

export async function POST(request: NextRequest) {
  try {
    // S136/CK1 (audit A-H1): the process-wide containment budget, BEFORE
    // the per-IP key — the registerGlobal: doctrine of S132/CG11 applied to
    // login, the endpoint where EVERY request burns the full synchronous
    // scrypt pair (~0.5 s measured). Under the default
    // TRUSTED_PROXY_HOPS-unset posture the per-IP key below is the FIRST
    // x-forwarded-for hop — forgeable per request — and a flood of
    // non-existent emails skips the per-account bucket entirely (it only
    // fires when the user exists): pre-CK1 nothing bounded a ~2 req/s
    // rotated-XFF flood from starving the single worker for ALL routes.
    // 40/15-min process-wide bounds that churn (the register sizing
    // mirrored: 4x the per-IP budget; the e2e login-heaviest chunk runs
    // ~21 POSTs and every chunk re-boots the server, so the in-process
    // bucket never trips in tests outside the dedicated terminal flood
    // pin). A volume-containment 429 leaks nothing the per-IP 429 doesn't
    // already — the copy is IDENTICAL. The SUCCESS-RESET below is the
    // progressive model extended to the global budget: only FAILED logins
    // accumulate (the attack shape never succeeds); an interleaved
    // legitimate burst never inherits a flood's spend.
    const globalLimit = checkRateLimit("loginGlobal:", 40);
    if (!globalLimit.ok) {
      return rateLimitedResponse(
        globalLimit.retryAfterSec,
        "Too many login attempts. Try again shortly.",
      );
    }

    // The limiter sits BEFORE validation — invalid payloads consume budget.
    const ip = clientIp(request);
    const limit = checkRateLimit(`login:${ip}`, 10);
    if (!limit.ok) {
      return rateLimitedResponse(
        limit.retryAfterSec,
        "Too many login attempts. Try again shortly.",
      );
    }

    const body = await readJson(request);
    const { email, password } = parseWith(loginSchema, body);

    const user = await db.user.findUnique({
      // passwordHash is read ONLY for the scrypt verification and never
      // leaves this handler (publicUser selects its own fields).
      where: { email: email.toLowerCase() },
    });
    // S127/CB12 — the per-account budget (the S123/BX2 doctrine applied to
    // the credential exchange): the per-IP limiter below is the only brake
    // a correct password guess faces, and its key material is client-
    // forgeable in the default TRUSTED_PROXY_HOPS-unset posture (the first
    // x-forwarded-for hop). When the account exists, the account bucket
    // (10/15-min) is checked BEFORE the scrypt burn; an EXHAUSTED bucket
    // answers the SAME uniform 401 (never a distinguishable 429 — the
    // no-user branch never budgets, so a per-account 429 would be an
    // account-existence oracle, the exact BX2 discipline) and the correct
    // password fails with it, so guessing is bounded per account.
    if (user) {
      const accountLimit = checkRateLimit(`loginAcct:${user.id}`, 10);
      if (!accountLimit.ok) {
        // S132/CG1: burn the SAME scrypt work the no-user branch pays —
        // the exhausted branch answered the uniform 401 with ZERO crypto
        // work while the miss branch burned DUMMY_LOGIN_HASH, a ~30-36 ms
        // timing account-existence oracle (the BX4 class reopened on the
        // CB12 account bucket; the register route's own verified-exists
        // branch already equalizes this way). Response shape and status
        // are unchanged — only the timing equalizes.
        // S134/CI1: the burn is the UNIFORM PAIR now — burnLoginScryptWork
        // burns the dummy verify PLUS the transition complement, exactly
        // the work every other login attempt pays (the raw
        // verifyPassword+DUMMY form would burn one parameter set short).
        burnLoginScryptWork(password);
        return errorResponse(401, INVALID_CREDENTIALS);
      }
    }
    // Uniform rejection for both "no such user" and "wrong password" — and
    // (S117/BR3) the SAME scrypt burn either way: the helper runs BEFORE the
    // null check, so the miss branch verifies against the dummy hash and
    // response timing cannot enumerate accounts.
    const credentialsOk = verifyLoginCredentials(user, password);
    if (!user || !credentialsOk) {
      return errorResponse(401, INVALID_CREDENTIALS);
    }

    // S134/CI1 — the rehash drain: a successful login on a legacy-format
    // stored hash upgrades the row to the current parameter set in place
    // (the standard rehash-on-login migration). The password proof already
    // completed, so the drain is safe to run before the unverified gate;
    // the sessionVersion is NEVER bumped (a rehash is not a rotation).
    if (needsRehash(user.passwordHash)) {
      await db.user.update({
        where: { id: user.id },
        data: { passwordHash: hashPassword(password) },
      });
    }
    if (!user.emailVerified) {
      return errorResponse(403, UNVERIFIED_COPY);
    }

    // Successful sign-ins RESET the IP limiter (the documented progressive-
    // throttling model — only FAILED attempts consume budget; a legitimate
    // user's later logins must never inherit an attacker's spent bucket).
    // S127/CB12: the account bucket resets too — successes never accumulate
    // (the same progressive model on the harder key).
    // S136/CK1: the GLOBAL bucket resets too — the containment budget
    // exists to bound the ANONYMOUS FLOOD shape (a rotated-XFF stream of
    // non-existent emails, every attempt a FAILURE); an interleaved
    // legitimate burst (successes) must never inherit the flood's spend.
    // The attack shape never succeeds, so the containment still trips at
    // 40 consecutive failures — and a mixed crowd's successful logins keep
    // the sitewide window open. (The first draft reset neither: the e2e
    // chunk-5 login census — the budget/429 specs' own failed attempts —
    // accumulated past 40 mid-chunk and 429'd every subsequent login.)
    resetRateLimit(`login:${ip}`);
    resetRateLimit(`loginAcct:${user.id}`);
    resetRateLimit("loginGlobal:");

    return setSessionCookie(NextResponse.json({ user: publicUser(user) }), user.id, {
      // S120/BU15: the proxy-aware derivation (see verify-email).
      secure: secureCookieFlag(request.headers.get("x-forwarded-proto"), request.nextUrl.protocol),
      // S118/BS1: the fresh token embeds the user's current session version
      // (a password reset bumped it — the new sign-in must carry the new v).
      sessionVersion: user.sessionVersion,
    });
  } catch (err: unknown) {
    return toErrorResponse(err);
  }
}
