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
import { siteUrl } from "@/lib/site";
import { forgotPasswordSchema } from "@/lib/validation";
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
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true },
    });

    if (user) {
      const token = generateResetToken();
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
