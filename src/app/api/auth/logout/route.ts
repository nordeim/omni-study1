// ---------------------------------------------------------------------------
// POST /api/auth/logout — clears the sf_session cookie (maxAge 0). The
// stateless token dies client-side; the cookie is doubly dead afterwards.
// S121/BV2: the clear rides the same proxy-aware Secure derivation the SET
// rides (secureCookieFlag) — a NODE_ENV-derived Secure flag made the clear
// Set-Cookie DROPPABLE by browsers on the plain-HTTP Docker posture, so the
// live 7-day session cookie survived "logout".
// ---------------------------------------------------------------------------

import { NextResponse, type NextRequest } from "next/server";

import { secureCookieFlag } from "@/lib/auth";
import { clearSessionCookie } from "@/lib/server/auth";

export async function POST(request: NextRequest) {
  return clearSessionCookie(NextResponse.json({ ok: true }), {
    secure: secureCookieFlag(
      request.headers.get("x-forwarded-proto"),
      request.nextUrl.protocol,
    ),
  });
}
