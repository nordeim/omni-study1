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

    // The one-shot consumption rides the SAME transaction as the write.
    // S119/BT3: the single-use guarantee is now CONDITIONAL — the where
    // clause `usedAt: null AND expiresAt > now` is the arbiter, not the
    // pre-check above (two concurrent replays both passed it — the
    // ~50-100ms scrypt window between the findUnique and the commit let
    // BOTH transactions run; the pre-S119 unconditional update consumed
    // twice and both replays returned 200). Only ONE updateMany matches;
    // the loser reads count 0 and takes the invalid-token 400.
    // S118/BS1: the sessionVersion bump rides the same transaction too —
    // a pre-reset cookie cannot outlive the reset it predates.
    const now = new Date();
    const consumed = await db.$transaction(async (tx) => {
      const res = await tx.passwordResetToken.updateMany({
        where: { id: record.id, usedAt: null, expiresAt: { gt: now } },
        data: { usedAt: now },
      });
      if (res.count === 0) return false;
      await tx.user.update({
        where: { id: record.userId },
        data: {
          passwordHash: hashPassword(password),
          sessionVersion: { increment: 1 },
        },
      });
      return true;
    });
    if (!consumed) {
      return errorResponse(400, "That reset link is invalid or has expired. Request a new one.");
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    return toErrorResponse(err);
  }
}
