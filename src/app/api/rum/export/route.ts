// ---------------------------------------------------------------------------
// GET /api/rum/export — the RUM CSV export (S20/ADR-018). The owner's raw
// sampled events render through the pinned toRumCsv seam (RFC-4180 escaping,
// RAW analysis-grade values) and answer as a text/csv attachment under the
// S13/S14 download contract (nosniff + private no-store).
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/server/auth";
import { downloadHeaders, toErrorResponse } from "@/lib/server/http";
import { toRumCsv, type RumCsvEvent } from "@/lib/rum-diagnostics";

export const GET = async () => {
  try {
    const user = await requireUser();

    const events = await db.rumEvent.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    const rows: RumCsvEvent[] = events.map((e) => ({
      metric: e.metric,
      value: e.value,
      rating: e.rating,
      navigationType: e.navigationType,
      path: e.path,
      sessionId: e.sessionId,
      createdAt: e.createdAt.toISOString(),
    }));

    const stamp = new Date().toISOString().slice(0, 10);
    const body = toRumCsv(rows);
    return new NextResponse(body, {
      status: 200,
      headers: downloadHeaders(`rum-export-${stamp}.csv`, "text/csv; charset=utf-8"),
    });
  } catch (err: unknown) {
    return toErrorResponse(err);
  }
};
