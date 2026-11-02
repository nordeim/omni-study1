// ---------------------------------------------------------------------------
// POST /api/auth/resend-verification — re-issue the 6-digit code for an
// UNVERIFIED account (the verify screen's resend action). Uniform 200 for
// every caller — the response shape's `code` presence is the only signal
// (no SMTP: the self-hosted delivery), and unknown/verified accounts never
// get one (no enumeration).
// ---------------------------------------------------------------------------

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import {
  checkRateLimit,
  generateVerificationCode,
  hashResetToken,
} from "@/lib/auth";
import { db } from "@/lib/db";
import { inAppDeliveryGates } from "@/lib/env-check";
import { clientIp } from "@/lib/server/auth";
import { emailField } from "@/lib/validation";
import {
  parseWith,
  rateLimitedResponse,
  readJson,
  toErrorResponse,
} from "@/lib/server/http";

const CODE_TTL_MS = 15 * 60 * 1000;
// S119/BT4: the shared emailField atom (was a bare z.string().email()).
const resendSchema = z.object({ email: emailField });

export async function POST(request: NextRequest) {
  try {
    const ip = clientIp(request);
    const limit = checkRateLimit(`resend:${ip}`, 10);
    if (!limit.ok) {
      return rateLimitedResponse(
        limit.retryAfterSec,
        "Too many verification requests. Try again shortly.",
      );
    }

    const { email } = parseWith(resendSchema, await readJson(request));

    // S131/CF1: the per-EMAIL budget — the payload-keyed CB12/BX2 pattern
    // (a 429 answers identically for known and unknown emails — the
    // anti-enumeration shape holds). The per-IP key above is forgeable
    // under the legacy XFF posture; without this budget a rotated-XFF
    // flood minted unlimited live code rows for a known unverified email.
    // Checked BEFORE the user lookup — an over-budget ask reads nothing.
    const emailLimit = checkRateLimit(
      `resendAcct:${email.toLowerCase()}`,
      5,
    );
    if (!emailLimit.ok) {
      return rateLimitedResponse(
        emailLimit.retryAfterSec,
        "Too many verification requests. Try again shortly.",
      );
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, emailVerified: true },
    });

    if (user && !user.emailVerified) {
      const code = generateVerificationCode();
      // S131/CF7: the digest at rest — the BR6 posture extended to the OTP
      // (a DB read must never yield a live sign-in credential; a correct
      // code SIGNS THE CALLER IN). The RESPONSE still carries the plaintext
      // code (the ADR-013 in-band delivery); only the at-rest form changes.
      // S121/BV8: the register route's own pruning, mirrored here — the
      // account's EXPIRED tokens never outlive a resend either (bounded
      // auth tables; the shipped branch only ever created, so abandoned
      // unverified accounts accumulated expired rows).
      await db.verificationToken.deleteMany({
        where: { userId: user.id, expiresAt: { lt: new Date() } },
      });
      await db.verificationToken.create({
        data: {
          userId: user.id,
          code: hashResetToken(code),
          expiresAt: new Date(Date.now() + CODE_TTL_MS),
        },
      });
      // S120/BU2: hardened deployments omit the code (the off-switch).
      if (inAppDeliveryGates(process.env).otp) {
        return NextResponse.json({ ok: true });
      }
      return NextResponse.json({ ok: true, code });
    }

    // Uniform 200 — unknown or already-verified callers learn nothing.
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    return toErrorResponse(err);
  }
}
