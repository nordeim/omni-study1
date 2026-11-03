// ---------------------------------------------------------------------------
// POST /api/auth/forgot-password — the 3-state reset flow's request leg
// (S15/ADR-013). ALWAYS answers 200 (no account oracle). No SMTP: the reset
// URL rides the response when the account exists — that IS the delivery.
// The 30-minute one-shot PasswordResetToken is created here, consumed by
// reset-password.
// ---------------------------------------------------------------------------

import { NextResponse, type NextRequest } from "next/server";

import { checkRateLimit, generateResetToken, hashResetToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { forgotPasswordSchema } from "@/lib/validation";
import { inAppDeliveryGates } from "@/lib/env-check";
import { clientIp } from "@/lib/server/auth";
import {
  parseWith,
  rateLimitedResponse,
  readJson,
  toErrorResponse,
} from "@/lib/server/http";

const TOKEN_TTL_MS = 30 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const ip = clientIp(request);
    const limit = checkRateLimit(`forgot:${ip}`, 10);
    if (!limit.ok) {
      return rateLimitedResponse(
        limit.retryAfterSec,
        "Too many reset requests. Try again shortly.",
      );
    }

    // S118/BS2: the shared validation.ts schema (the inline twin is gone —
    // its z.string().email() lacked the trim/max atoms).
    const { email } = parseWith(forgotPasswordSchema, await readJson(request));

    // S132/CG3: the per-EMAIL budget — the CF1 pattern completed across the
    // three siblings (register/resend got *Acct: keys in s131; forgot rode
    // only the forgeable per-IP key). Keyed by the request PAYLOAD so the
    // 429 answers identically for known and unknown emails (the CF1
    // no-enumeration shape — both burn the same budget; only a DB-keyed
    // budget could distinguish). This bounds the supersede-DoS: under the
    // legacy XFF posture a rotated header minted a fresh per-IP key per
    // request, and each flood request deleteMany'd the victim's just-issued
    // one-shot reset link (the newest link is the one the user clicks) plus
    // unauthenticated PasswordResetToken write churn. Checked BEFORE the
    // user lookup — an over-budget ask reads nothing.
    //
    // HONEST CORRECTION against the plan's §2 (recorded in §5): the
    // exhausted branch answers the HONEST 429 — the CF1 siblings' own
    // shipped shape (registerAcct:/resendAcct: both 429) — not the uniform
    // {ok:true}. Pretending a reset email is coming on a rejected request
    // is the exact CF8 "resend 429 honesty" defect class; and the
    // payload-keyed budget keeps the no-oracle property regardless.
    const emailLimit = checkRateLimit(`forgotAcct:${email.toLowerCase()}`, 5);
    if (!emailLimit.ok) {
      return rateLimitedResponse(
        emailLimit.retryAfterSec,
        "Too many reset requests. Try again shortly.",
      );
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true },
    });

    if (user) {
      const token = generateResetToken();
      // S120/BU22 → S121/BV11b: the prune widens to ALL prior tokens — a new
      // issue SUPERSEDES (the shipped expired/used-only prune left N live
      // one-shot takeover links per account after N requests inside 30 min;
      // exactly one live link per account is the bounded, least-surprise
      // posture — the newest email is the one the user will click).
      await db.passwordResetToken.deleteMany({
        where: { userId: user.id },
      });
      await db.passwordResetToken.create({
        data: {
          userId: user.id,
          // S117/BR6 — hashed at rest: the row stores the SHA-256 digest; the
          // raw token rides the URL only. A DB read must never yield a live
          // account-takeover link.
          token: hashResetToken(token),
          expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
        },
      });
      // The absolute URL derives from the REQUEST origin (the e2e suite
      // serves the app on a non-default port; siteUrl() is the metadata
      // origin, not the serving origin).
      const origin = request.nextUrl.origin;
      // S120/BU2: hardened deployments omit the reset URL — the no-link
      // shape is the IDENTICAL response an unknown email gets (the
      // route's own no-enumeration contract, extended to the gate).
      if (inAppDeliveryGates(process.env).reset) {
        return NextResponse.json({ ok: true });
      }
      return NextResponse.json({
        ok: true,
        resetPath: `/reset-password?token=${token}`,
        resetUrl: `${origin}/reset-password?token=${token}`,
      });
    }

    // Unknown email: the identical 200 with no link (no enumeration).
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    return toErrorResponse(err);
  }
}
