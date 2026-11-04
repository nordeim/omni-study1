// ---------------------------------------------------------------------------
// POST /api/auth/change-password — the account-security rotation
// (S24/ADR-022). Rate-limited 10/15-min per user. The current password is
// verified against the stored scrypt hash FIRST (a wrong current → 400
// "Your current password is incorrect.", PRE-WRITE). The session SURVIVES
// the rotation by design — the cookie is an HMAC over AUTH_SECRET, not the
// password (revoking other sessions is ADR-022's rejected alternative).
// ---------------------------------------------------------------------------

import { NextResponse, type NextRequest } from "next/server";

import { checkRateLimit, decrementRateLimit, hashPassword, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { changePasswordSchema } from "@/lib/validation";
import { requireUser } from "@/lib/server/auth";
import {
  errorResponse,
  parseWith,
  rateLimitedResponse,
  readJson,
  toErrorResponse,
} from "@/lib/server/http";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    // S140/CO2 (Audit B M-1 — the CK1 containment family swept to its
    // siblings): this route burns the same synchronous scrypt pair login
    // does (verify current + hash new), so the process-wide aggregate
    // bounds a scripted fleet the per-user 10/15-min key cannot (open
    // registration + the in-band OTP make authed sessions scriptable).
    // 40/15-min mirrors loginGlobal (the S136 sizing doctrine: 4x the
    // per-key budget; the e2e authed-family usage per chunk is ~25 POSTs,
    // under the cap). Discharged by the S138/CM3 DECREMENT on legitimate
    // success below — one requester's success proves only their own
    // legitimacy, never the window's other spends.
    const burnLimit = checkRateLimit("authBurnGlobal:", 40);
    if (!burnLimit.ok) {
      return rateLimitedResponse(
        burnLimit.retryAfterSec,
        "Too many attempts. Try again shortly.",
      );
    }
    const limit = checkRateLimit(`changePw:${user.id}`, 10);
    if (!limit.ok) {
      return rateLimitedResponse(limit.retryAfterSec, "Too many attempts. Try again shortly.");
    }

    const { currentPassword, newPassword } = parseWith(
      changePasswordSchema,
      await readJson(request),
    );

    const stored = await db.user.findUnique({
      where: { id: user.id },
      select: { passwordHash: true },
    });
    if (!stored || !verifyPassword(currentPassword, stored.passwordHash)) {
      return errorResponse(400, "Your current password is incorrect.");
    }

    await db.user.update({
      where: { id: user.id },
      data: { passwordHash: hashPassword(newPassword) },
    });

    // S140/CO2: the CM3 discharge — the aggregate's net-of-successes form
    // (a success nets -1; consecutive successes oscillate just under the
    // bound; a pure flood still trips at 40 net).
    decrementRateLimit("authBurnGlobal:");

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    return toErrorResponse(err);
  }
}
