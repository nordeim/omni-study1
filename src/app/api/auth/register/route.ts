// ---------------------------------------------------------------------------
// POST /api/auth/register — the UNVERIFIED account creation (S15/ADR-013,
// no auto-login). Rate-limited 10/IP/15 min. No SMTP: the response IS the
// delivery — the freshly issued 6-digit code rides the body (the verify
// screen's self-hosted code note). Re-registering an existing UNVERIFIED
// address re-issues a code; an existing VERIFIED address answers the same
// success shape without a code (no enumeration, nothing changed).
// ---------------------------------------------------------------------------

import { NextResponse, type NextRequest } from "next/server";

import {
  checkRateLimit,
  generateVerificationCode,
  hashPassword,
  hashOtpCode,
  verifyPassword,
  DUMMY_LOGIN_HASH,
} from "@/lib/auth";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validation";
import { inAppDeliveryGates } from "@/lib/env-check";
import { clientIp } from "@/lib/server/auth";
import {
  parseWith,
  rateLimitedResponse,
  readJson,
  toErrorResponse,
} from "@/lib/server/http";

const CODE_TTL_MS = 15 * 60 * 1000; // the 15-minute verification window

/** The e2e/client payloads say `name`; the schema says `fullName` — alias
 *  before parsing (the schema strips unknown keys otherwise). */
type RegisterBody = { name?: unknown; fullName?: unknown };

export async function POST(request: NextRequest) {
  try {
    // S132/CG11: the GLOBAL containment budget — the honest bound on the
    // CF1 residual. The per-IP and per-email keys below are individually
    // forgeable/bypassable under the legacy XFF posture (a rotated header
    // mints a fresh per-IP key per request; a distinct-email flood passes
    // every per-email key), and each passing request costs one scrypt burn
    // + up to two unauthenticated rows (User + VerificationToken) from ONE
    // host. 40/15-min process-wide bounds that churn (generous: the e2e
    // fresh-user journeys register ≤ 3 per chunk and each chunk re-boots
    // the server, so the in-process bucket never trips in tests; a
    // legitimate multi-user deploy fronted by a proxy with
    // TRUSTED_PROXY_HOPS≥1 derives per-IP keys that never sum here). A
    // volume-containment 429 leaks nothing the per-IP 429 doesn't already.
    const globalLimit = checkRateLimit("registerGlobal:", 40);
    if (!globalLimit.ok) {
      return rateLimitedResponse(
        globalLimit.retryAfterSec,
        "Too many registration attempts. Try again shortly.",
      );
    }

    const ip = clientIp(request);
    const limit = checkRateLimit(`register:${ip}`, 10);
    if (!limit.ok) {
      return rateLimitedResponse(
        limit.retryAfterSec,
        "Too many registration attempts. Try again shortly.",
      );
    }

    // S121/BV4: a JSON `null` (or any non-object) body is validation-INVALID
    // input, not a server error — the pre-Zod deref below threw a 500 on
    // `raw.fullName` of null. Coerce to {} and let the schema answer 400
    // with the specific field messages.
    const read = await readJson(request);
    const raw = (read && typeof read === "object" ? read : {}) as RegisterBody;
    const body: unknown =
      raw.fullName === undefined && raw.name !== undefined
        ? { ...raw, fullName: raw.name }
        : raw;
    const { fullName, email, password } = parseWith(registerSchema, body);

    // S131/CF1 (narrowed S132/CG11): the per-EMAIL budget — the CB12/BX2
    // per-account pattern, keyed by the request PAYLOAD (a 429 answers
    // identically for known and unknown emails — no enumeration oracle).
    // The per-IP key above is forgeable under the legacy XFF posture (a
    // rotated header mints a fresh key per request), and every register
    // branch burns scryptSync — a rotated-XFF flood was a single-worker CPU
    // DoS plus unbounded unauthenticated User/VerificationToken growth.
    // Checked BEFORE the user lookup and every scrypt burn: an over-budget
    // ask costs neither. RESIDUAL (honest): distinct-email floods pass this
    // key too — the registerGlobal: bucket above is the containment bound;
    // adopt TRUSTED_PROXY_HOPS≥1 (front the app with a proxy that appends
    // the real client) before any exposure.
    const normalizedEmail = email.toLowerCase();
    const emailLimit = checkRateLimit(`registerAcct:${normalizedEmail}`, 5);
    if (!emailLimit.ok) {
      return rateLimitedResponse(
        emailLimit.retryAfterSec,
        "Too many registration attempts. Try again shortly.",
      );
    }

    const existing = await db.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, emailVerified: true },
    });

    if (existing?.emailVerified) {
      // Uniform 200, no code, no re-issue — the account exists and is
      // verified; saying anything more would be an enumeration oracle.
      // (S120/BU14: every branch answers 200 — the shipped 201-vs-200 split
      // distinguished new accounts from existing ones.)
      // S123/BX4: burn the same scrypt work the other branches pay — the
      // fast path's ~50-100 ms asymmetry was a timing enumeration oracle
      // (the verifyLoginCredentials/DUMMY_LOGIN_HASH equalizer precedent).
      verifyPassword(password, DUMMY_LOGIN_HASH);
      return NextResponse.json({ ok: true });
    }

    const code = generateVerificationCode();
    // S131/CF7 → S132/CG2: the PEPPERED digest at rest — the BR6 posture
    // extended to the OTP (a DB read must never yield a live sign-in
    // credential; a correct code SIGNS THE CALLER IN), now HMAC-keyed by
    // AUTH_SECRET: the 10^6 code space made the unkeyed SHA-256 digest
    // offline-brute-forceable in <1 s from any DB read, voiding CF7's
    // guarantee. The RESPONSE still carries the plaintext code (the
    // ADR-013 in-band delivery); only the at-rest form changes.
    // Pre-existing rows hold unkeyed-SHA digests that never match an HMAC
    // — bounded by the 15-min TTL + the re-issue paths, exactly CF7's own
    // rollout (no data migration).
    const tokenData = {
      code: hashOtpCode(code),
      expiresAt: new Date(Date.now() + CODE_TTL_MS),
    };

    if (existing) {
      // Existing UNVERIFIED account: re-issue a fresh code (the S25/S26
      // flow re-registers and reads the new code from the response).
      // S120/BU22: opportunistic pruning — the account's expired tokens
      // never outlive a re-register (bounded auth tables).
      await db.verificationToken.deleteMany({
        where: { userId: existing.id, expiresAt: { lt: new Date() } },
      });
      // S121/BV6: the re-typed password + name WIN — the shipped branch
      // kept the FIRST registration's hash, so a user who re-registered
      // with a different password and verified could not sign in with the
      // password they last typed (a 401 + a forced forgot-password dance).
      // The account is unverified: there is no verified identity to
      // protect, and any abuse self-heals on the next re-register.
      await db.user.update({
        where: { id: existing.id },
        data: { passwordHash: hashPassword(password), fullName },
      });
      await db.verificationToken.create({
        data: { ...tokenData, userId: existing.id },
      });
      // S120/BU14: 200 (was 200 — unchanged) + the S120/BU2 gate: hardened
      // deployments omit the code (the off-switch contract).
      if (inAppDeliveryGates(process.env).otp) {
        return NextResponse.json({ ok: true });
      }
      return NextResponse.json({ ok: true, code });
    }

    // S125/BZ9: the create-race branch answers the uniform 200. Two
    // concurrent same-email registrations both passed the findUnique above;
    // the loser's create throws P2002 → toErrorResponse → 409 "That record
    // already exists." — the exact enumeration oracle S120/BU14 closed,
    // re-opened in the millisecond window. The loser answers the
    // verified-exists branch's shape. NO code leg: the loser's own token
    // was never stored (echoing its code would send the user down a dead
    // verification path); the winner's client carries the working one.
    let userId: string;
    try {
      const user = await db.user.create({
        data: {
          email: normalizedEmail,
          passwordHash: hashPassword(password),
          fullName,
          // emailVerified stays false — the schema default. No session
          // cookie: the register→verify journey completes only after the
          // code matches.
        },
        select: { id: true },
      });
      userId = user.id;
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as { code?: string }).code === "P2002"
      ) {
        return NextResponse.json({ ok: true });
      }
      throw err;
    }
    await db.verificationToken.create({
      data: { ...tokenData, userId },
    });

    // S120/BU14: the SAME 200 as every other branch (was 201 — the status
    // split was an enumeration oracle); the S120/BU2 delivery gate rides.
    if (inAppDeliveryGates(process.env).otp) {
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ ok: true, code });
  } catch (err: unknown) {
    return toErrorResponse(err);
  }
}
