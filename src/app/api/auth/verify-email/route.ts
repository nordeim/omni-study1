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

import { checkRateLimit, normalizeVerificationCode } from "@/lib/auth";
import { db } from "@/lib/db";
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

    const token = await db.verificationToken.findFirst({
      where: { userId: user.id, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });
    if (!token || token.code !== normalized) {
      return errorResponse(400, "That code is invalid or has expired.");
    }

    // The one-shot consumption + the verification mark in one transaction.
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
        secure: request.nextUrl.protocol === "https:",
        // S118/BS1: embed the current session version in the fresh token.
        sessionVersion: user.sessionVersion,
      },
    );
  } catch (err: unknown) {
    return toErrorResponse(err);
  }
}
