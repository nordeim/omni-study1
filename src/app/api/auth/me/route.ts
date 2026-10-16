// ---------------------------------------------------------------------------
// GET /api/auth/me — the current session's user (hashless; `name` is the
// API's public field). The shell's hydrate() and the theme store's
// loadFromUser both consume this.
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";

import { publicUser } from "@/lib/server/auth";
import { withUser } from "@/lib/server/http";

export const GET = withUser(async (user) =>
  NextResponse.json({ user: publicUser(user) }),
);
