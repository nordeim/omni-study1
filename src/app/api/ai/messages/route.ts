// ---------------------------------------------------------------------------
// /api/ai/messages — the transcript store. GET answers the conversation
// (oldest → newest, the assistant + solver surfaces combined — the client
// filters); DELETE clears the signed-in user's transcript.
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { withUser } from "@/lib/server/http";

export const GET = withUser(async (user) => {
  const messages = await db.aiChatMessage.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    take: 500,
  });
  return NextResponse.json(
    messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      surface: m.surface,
      createdAt: m.createdAt.toISOString(),
    })),
  );
});

export const DELETE = withUser(async (user) => {
  await db.aiChatMessage.deleteMany({ where: { userId: user.id } });
  return NextResponse.json({ ok: true });
});
