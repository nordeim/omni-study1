// ---------------------------------------------------------------------------
// /api/calculator/history — the persisted calculations (GET list, POST
// append, DELETE clear-all). The Calculator view's history rail round-trips
// through here.
//
// S122/BW5: the family bounded-growth form (the ai/messages + rum
// precedent). GET answers the newest HISTORY_WINDOW rows in the UI's
// oldest-first order (take desc, reversed); POST trims the table beyond
// the newest HISTORY_WINDOW per user — the table is bounded WITHOUT a
// user-visible failure mode (a rate limit would silently drop history for
// a legitimately fast calculator; the trim never rejects a write).
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";

import { checkRateLimit } from "@/lib/auth";
import { db } from "@/lib/db";
import { calculatorHistorySchema } from "@/lib/validation";
import { parseWith, rateLimitedResponse, readJson, toErrorResponse, withUser } from "@/lib/server/http";

const HISTORY_WINDOW = 500;

export const GET = withUser(async (user) => {
  // Newest 500, served oldest-first (the rail's chronological order).
  const newest = await db.calculatorHistoryEntry.findMany({
    where: { userId: user.id },
    // S126/CA5: the id tiebreak rider (the BZ10 trim already had it; the
    // GET window did not — same-millisecond ties were nondeterministic).
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: HISTORY_WINDOW,
  });
  return NextResponse.json(newest.reverse());
});

export const POST = withUser(async (user, request) => {
  try {
    const { expression, result, mode } = parseWith(
      calculatorHistorySchema,
      await readJson(request),
    );
    const entry = await db.calculatorHistoryEntry.create({
      data: { userId: user.id, expression, result, mode },
    });
    // The retention trim: keep the newest HISTORY_WINDOW rows, drop the
    // rest (the self-join-free form — count, then delete by offset).
    // S125/BZ10: the count→skip→delete sequence now runs inside ONE
    // transaction with an id-tiebroken orderBy — the pre-fix shape could
    // interleave with a concurrent POST, and same-millisecond createdAt
    // ties made the skip-trim nondeterministic (it could trim a NEWER row
    // while keeping an older twin). SQLite serializes interactive
    // transactions, and the id tiebreak is monotonic per row.
    await db.$transaction(async (tx) => {
      const total = await tx.calculatorHistoryEntry.count({ where: { userId: user.id } });
      if (total > HISTORY_WINDOW) {
        const stale = await tx.calculatorHistoryEntry.findMany({
          where: { userId: user.id },
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          skip: HISTORY_WINDOW,
          // S130/CE9: the bounded stale-select (the ai.ts twin — the BW4
          // class on this route's own 5 s default).
          take: 1000,
          select: { id: true },
        });
        if (stale.length > 0) {
          await tx.calculatorHistoryEntry.deleteMany({
            where: { userId: user.id, id: { in: stale.map((row) => row.id) } },
          });
        }
      }
    });
    return NextResponse.json(entry, { status: 201 });
  } catch (err: unknown) {
    return toErrorResponse(err);
  }
});

export const DELETE = withUser(async (user) => {
  // S130/CE6: the history-clear budget (the write bucket — the ai/messages
  // twin; the POST stays the documented trimmed-table exception below).
  const limit = checkRateLimit(`write:${user.id}`, 600);
  if (!limit.ok) {
    return rateLimitedResponse(limit.retryAfterSec, "Too many requests. Please slow down.");
  }
  await db.calculatorHistoryEntry.deleteMany({ where: { userId: user.id } });
  return NextResponse.json({ ok: true });
});
