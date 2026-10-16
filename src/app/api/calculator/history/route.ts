// ---------------------------------------------------------------------------
// /api/calculator/history — the persisted calculations (GET list, POST
// append, DELETE clear-all). The Calculator view's history rail round-trips
// through here.
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { calculatorHistorySchema } from "@/lib/validation";
import { parseWith, readJson, toErrorResponse, withUser } from "@/lib/server/http";

export const GET = withUser(async (user) => {
  const history = await db.calculatorHistoryEntry.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(history);
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
    return NextResponse.json(entry, { status: 201 });
  } catch (err: unknown) {
    return toErrorResponse(err);
  }
});

export const DELETE = withUser(async (user) => {
  await db.calculatorHistoryEntry.deleteMany({ where: { userId: user.id } });
  return NextResponse.json({ ok: true });
});
