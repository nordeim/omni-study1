// ---------------------------------------------------------------------------
// /api/ai/messages — the transcript store. GET answers the conversation
// (oldest → newest, the assistant + solver surfaces combined — the client
// filters); DELETE clears the signed-in user's transcript.
// S126/CA1: the GET serves the NEWEST 500 (the calculator form — desc +
// take + reverse + the id tiebreak). The pre-CA1 `asc + take: 500` selected
// the OLDEST window: past 500 rows every post-send refresh REPLACED the
// store with a stale window and the just-sent exchange vanished (rows
// persisted, export fine, UI blind). The retention trim now lives at the
// write sites (persistTranscriptPair).
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";

import { checkRateLimit } from "@/lib/auth";
import { db } from "@/lib/db";
import { TRANSCRIPT_WINDOW } from "@/lib/server/ai";
import { rateLimitedResponse, withUser } from "@/lib/server/http";

export const GET = withUser(async (user) => {
  const messages = await db.aiChatMessage.findMany({
    where: { userId: user.id },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: TRANSCRIPT_WINDOW,
  });
  return NextResponse.json(
    messages.reverse().map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      surface: m.surface,
      createdAt: m.createdAt.toISOString(),
    })),
  );
});

export const DELETE = withUser(async (user) => {
  // S130/CE6: the transcript-clear budget (the write bucket — the shared
  // one-budget-per-user posture; a scripted clear-all churns the table).
  const limit = checkRateLimit(`write:${user.id}`, 600);
  if (!limit.ok) {
    return rateLimitedResponse(limit.retryAfterSec, "Too many requests. Please slow down.");
  }
  await db.aiChatMessage.deleteMany({ where: { userId: user.id } });
  return NextResponse.json({ ok: true });
});
