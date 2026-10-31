// ---------------------------------------------------------------------------
// POST /api/auth/reset-password — the 3-state reset flow's completion leg.
// The 48-hex token is ONE-SHOT (usedAt set inside the same transaction as
// the password write) and expires 30 minutes after issue. The response is
// the success signal the login screen's note renders.
// S118/BS1: the reset also BUMPS sessionVersion — every session cookie
// issued before the reset is revoked (the canonical compromise-recovery
// action; change-password keeps its documented session-survives contract
// because that path proves the CURRENT password — ADR-022).
// S118/BS12: rate-limited 10/IP/15 min (the rubric's reset shape; the token
// itself is a 24-byte random so brute force is infeasible — the limiter is
// coverage, closing the last unthrottled auth POST).
// ---------------------------------------------------------------------------

import { NextResponse, type NextRequest } from "next/server";

import { checkRateLimit, hashPassword, hashResetToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { resetPasswordSchema } from "@/lib/validation";
import { clientIp } from "@/lib/server/auth";
import {
  errorResponse,
  parseWith,
  rateLimitedResponse,
  readJson,
  toErrorResponse,
} from "@/lib/server/http";

export async function POST(request: NextRequest) {
  try {
    // S118/BS12 — limiter-before-validation (the login convention).
    const ip = clientIp(request);
    const limit = checkRateLimit(`reset:${ip}`, 10);
    if (!limit.ok) {
      return rateLimitedResponse(
        limit.retryAfterSec,
        "Too many reset attempts. Try again shortly.",
      );
    }

    const { token, password } = parseWith(
      resetPasswordSchema,
      await readJson(request),
    );

    // S117/BR6 — the row stores the SHA-256 digest, so the presented raw
    // token is hashed before the lookup.
    const record = await db.passwordResetToken.findUnique({
      where: { token: hashResetToken(token) },
      select: { id: true, userId: true, usedAt: true, expiresAt: true },
    });
    if (!record || record.usedAt || record.expiresAt <= new Date()) {
      return errorResponse(400, "That reset link is invalid or has expired. Request a new one.");
    }

    // The one-shot consumption rides the SAME transaction as the write —
    // a replay can never land between them. S118/BS1: the sessionVersion
    // bump rides the same transaction too — a pre-reset cookie cannot
    // outlive the reset it predates.
    await db.$transaction([
      db.user.update({
        where: { id: record.userId },
        data: {
          passwordHash: hashPassword(password),
          sessionVersion: { increment: 1 },
        },
      }),
      db.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    return toErrorResponse(err);
  }
}
