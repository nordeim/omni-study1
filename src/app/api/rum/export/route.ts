// ---------------------------------------------------------------------------
// GET /api/rum/export — the RUM CSV export (S20/ADR-018). The owner's raw
// sampled events render through the pinned toRumCsv seam (RFC-4180 escaping,
// RAW analysis-grade values) and answer as a text/csv attachment under the
// S13/S14 download contract (nosniff + private no-store).
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/auth";
import { requireUser } from "@/lib/server/auth";
import { downloadHeaders, rateLimitedResponse, toErrorResponse } from "@/lib/server/http";
import { toRumCsv, type RumCsvEvent } from "@/lib/rum-diagnostics";

export const GET = async () => {
  try {
    const user = await requireUser();

    // S124/BY5: the CSV enumeration joins the SHARED `export:${user.id}`
    // 10/15-min budget (the sibling GET's key — the ai: shared-key
    // precedent; exhausting one route 429s the other).
    const limit = checkRateLimit(`export:${user.id}`, 10);
    if (!limit.ok) {
      return rateLimitedResponse(limit.retryAfterSec, "Too many export requests");
    }

    const events = await db.rumEvent.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      // S120/BU5: the documented cap (AGENTS.md: "the user's most recent
      // 2000 events") — the code now matches the doc, and the CSV assembly
      // is bounded on the single-node SQLite deployment.
      take: 2000,
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
