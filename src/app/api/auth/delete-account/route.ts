// ---------------------------------------------------------------------------
// POST /api/auth/delete-account — the ownership exit (S25/ADR-023).
// Rate-limited 10/15-min per user. The password is verified FIRST (a wrong
// password → 400, PRE-WRITE), then the ONE cascade write: db.user.delete
// wipes every collection (all 22 user relations carry onDelete: Cascade).
// The session cookie is cleared with the account (maxAge 0 — the logout
// mechanism).
// ---------------------------------------------------------------------------

import { NextResponse, type NextRequest } from "next/server";

import { checkRateLimit, decrementRateLimit, secureCookieFlag, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { deleteAccountSchema } from "@/lib/validation";
import { clearSessionCookie, requireUser } from "@/lib/server/auth";
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
    // S140/CO2 (Audit B M-1): the shared authBurnGlobal: aggregate — this
    // route burns login's synchronous scrypt pair (the password verify)
    // under only a per-user budget. See change-password's comment block.
    const burnLimit = checkRateLimit("authBurnGlobal:", 40);
    if (!burnLimit.ok) {
      return rateLimitedResponse(
        burnLimit.retryAfterSec,
        "Too many attempts. Try again shortly.",
      );
    }
    const limit = checkRateLimit(`delAcc:${user.id}`, 10);
    if (!limit.ok) {
      return rateLimitedResponse(limit.retryAfterSec, "Too many attempts. Try again shortly.");
    }

    const { password } = parseWith(deleteAccountSchema, await readJson(request));

    const stored = await db.user.findUnique({
      where: { id: user.id },
      select: { passwordHash: true },
    });
    if (!stored || !verifyPassword(password, stored.passwordHash)) {
      return errorResponse(400, "Your password is incorrect.");
    }

    // The ONE cascade write — subjects, tasks, notes, decks, grades, files,
    // chat, RUM events, tokens: every user relation carries Cascade.
    await db.user.delete({ where: { id: user.id } });

    // S140/CO2: the CM3 discharge (net-of-successes — see login's route).
    decrementRateLimit("authBurnGlobal:");

    // S121/BV2: the clear rides the proxy-aware derivation (the user row
    // is gone — the cookie is doubly dead — but the browser must actually
    // DROP it on the plain-HTTP posture).
    return clearSessionCookie(NextResponse.json({ ok: true }), {
      secure: secureCookieFlag(
        request.headers.get("x-forwarded-proto"),
        request.nextUrl.protocol,
      ),
    });
  } catch (err: unknown) {
    return toErrorResponse(err);
  }
}
