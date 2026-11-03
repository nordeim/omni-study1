// ---------------------------------------------------------------------------
// POST /api/auth/verify-email — the OTP completion (S15/ADR-013). The code
// is normalized (pasted formatting tolerated), matched against the LATEST
// UNEXPIRED token for the account, consumed, and — on success — the account
// is marked verified AND signed in (verify = the email proof).
// Rate-limited 20/IP/15 min (S117/BR2): the 6-digit code space is small and
// success signs the caller in — unthrottled guessing is an account-takeover
// vector. The limiter sits BEFORE validation (invalid payloads consume
// budget — the login route's own convention).
// ---------------------------------------------------------------------------

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import {
  checkRateLimit,
  hashOtpCode,
  normalizeVerificationCode,
  timingSafeEqualBuffer,
} from "@/lib/auth";
import { db } from "@/lib/db";
import { secureCookieFlag } from "@/lib/auth";
import { clientIp, publicUser, setSessionCookie } from "@/lib/server/auth";
import { emailField } from "@/lib/validation";
import {
  errorResponse,
  parseWith,
  rateLimitedResponse,
  readJson,
  toErrorResponse,
} from "@/lib/server/http";

/** Relaxed on purpose: the code is normalized AFTER the parse (the strict
 *  6-digit regex lives in verifyEmailSchema, but pasted "123 456" must
 *  survive the boundary too). */
// S119/BT4: the shared emailField atom (trim + email + max-200 — was a
// bare z.string().email()).
const verifyBodySchema = z.object({
  email: emailField,
  code: z.string().min(1).max(32),
});

export async function POST(request: NextRequest) {
  try {
    // The OTP brute-force gate (S117/BR2) — before parsing, like login.
    const ip = clientIp(request);
    const limit = checkRateLimit(`verify:${ip}`, 20);
    if (!limit.ok) {
      return rateLimitedResponse(
        limit.retryAfterSec,
        "Too many verification attempts. Try again shortly.",
      );
    }

    const { email, code } = parseWith(verifyBodySchema, await readJson(request));
    const normalized = normalizeVerificationCode(code);
    if (!normalized) {
      return errorResponse(400, "Enter the 6-digit code from your email.");
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, emailVerified: true, sessionVersion: true },
    });
    if (!user) {
      // Uniform rejection — no account-state oracle.
      return errorResponse(400, "That code is invalid or has expired.");
    }

    // S123/BX2: the per-ACCOUNT attempt budget. The per-IP limiter above is
    // the outer gate, but its key is client-forgeable in the default
    // TRUSTED_PROXY_HOPS-unset posture (a forged x-forwarded-for mints a
    // fresh key per request), and a correct guess SIGNS THE CALLER IN —
    // 10 failed attempts per account per 15 min makes the 10^6 code space
    // unguessable inside the 15-min code TTL no matter how many IPs are
    // forged. The exhausted branch answers the SAME uniform 400 as every
    // other rejection: a distinguishable 429 here would be an
    // account-EXISTENCE oracle (the no-user branch above never budgets),
    // a worse leak than the guessing surface this closes.
    const accountLimit = checkRateLimit(`verifyAcct:${user.id}`, 10);
    if (!accountLimit.ok) {
      return errorResponse(400, "That code is invalid or has expired.");
    }

    // S131/CF7 → S132/CG2: the compare runs on the PEPPERED HMAC DIGESTS —
    // the token stores the digest (the BR6 posture: a DB read never yields
    // a live sign-in credential) and the presented code digests through
    // the SAME peppered seam (an HMAC digest only matches under the same
    // process secret — an unkeyed digest of the 10^6 space would fall to
    // a <1 s offline sweep).
    // timingSafeEqualBuffer is the codebase's one timing-safe compare
    // idiom (passwords, session MACs); the OTP was the last plaintext
    // short-circuit compare. Both sides are 64-char hex, equal length.
    const presentedDigest = hashOtpCode(normalized);
    const token = await db.verificationToken.findFirst({
      where: { userId: user.id, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });
    if (
      !token ||
      !timingSafeEqualBuffer(token.code, presentedDigest)
    ) {
      return errorResponse(400, "That code is invalid or has expired.");
    }

    // S121/BV11a: the CONDITIONAL single-use consumption — the deleteMany
    // itself carries the code + expiry in its WHERE, so two concurrent
    // replays race on the SAME delete and exactly one wins (the BT3
    // reset-token pattern applied to the OTP family; the shipped
    // read-then-transact shape let both replays pass the read and both
    // get sessions in the ~100ms window).
    const consumed = await db.verificationToken.deleteMany({
      where: {
        userId: user.id,
        code: presentedDigest,
        expiresAt: { gt: new Date() },
      },
    });
    if (consumed.count === 0) {
      return errorResponse(400, "That code is invalid or has expired.");
    }

    // The verification mark + the residual-token cleanup in one transaction.
    const [verifiedUser] = await db.$transaction([
      db.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      }),
      db.verificationToken.deleteMany({ where: { userId: user.id } }),
    ]);

    return setSessionCookie(
      NextResponse.json({ ok: true, user: publicUser(verifiedUser) }),
      user.id,
      {
        // S120/BU15: the proxy-aware derivation — X-Forwarded-Proto wins
        // when present (the documented Docker posture terminates TLS
        // upstream); otherwise the request protocol.
        secure: secureCookieFlag(request.headers.get("x-forwarded-proto"), request.nextUrl.protocol),
        // S118/BS1: embed the current session version in the fresh token.
        sessionVersion: user.sessionVersion,
      },
    );
  } catch (err: unknown) {
    return toErrorResponse(err);
  }
}
