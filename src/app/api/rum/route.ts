// ---------------------------------------------------------------------------
// /api/rum — the RUM ingestion + aggregate endpoint (S18/ADR-016).
//
//   POST { sessionId, events: [{ metric, value, rating, navigationType, path?, userAgent? }] }
//     → validated by the Zod batch schema, rate-limited per user
//       (1000/15min — the shell beacon fires on every load), and UPSERTED on
//       the (sessionId, metric) pair — web-vitals' final-value-wins.
//   GET → { p75, samples, total, recent, trends } for the owner's panel.
//
// Anonymous callers get the 401 envelope — the beacon only runs with a
// session cookie anyway (the zero-noise contract).
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { checkRateLimit } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/server/auth";
import {
  parseWith,
  rateLimitedResponse,
  readJson,
  toErrorResponse,
} from "@/lib/server/http";
import { rumBatchSchema } from "@/lib/validation";
import { buildTrends, RUM_METRIC_ORDER } from "@/lib/rum-diagnostics";

export const POST = async (request: NextRequest) => {
  try {
    const user = await requireUser();

    const limit = checkRateLimit(`rum:${user.id}`, 1000);
    if (!limit.ok) return rateLimitedResponse(limit.retryAfterSec, "Too many RUM reports");

    const raw: unknown = await readJson(request);
    const { sessionId, events } = parseWith(rumBatchSchema, raw);

    for (const event of events) {
      await db.rumEvent.upsert({
        // S120/BU4: the compound carries the user — a second user posting
        // the same sessionId+metric lands in the CREATE branch (their own
        // row), never the update leg of the first user's row.
        where: {
          userId_sessionId_metric: { userId: user.id, sessionId, metric: event.metric },
        },
        create: {
          userId: user.id,
          sessionId,
          metric: event.metric,
          value: event.value,
          rating: event.rating,
          navigationType: event.navigationType,
          path: event.path,
          userAgent: event.userAgent,
        },
        update: {
          value: event.value,
          rating: event.rating,
          navigationType: event.navigationType,
          path: event.path,
          userAgent: event.userAgent,
        },
      });
    }

    return NextResponse.json({ ok: true, accepted: events.length });
  } catch (err: unknown) {
    return toErrorResponse(err);
  }
};

export const GET = async () => {
  try {
    const user = await requireUser();

    const events = await db.rumEvent.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  // p75 per metric (rank-75th of the sampled values — field-data convention
  // enough for a single-owner panel).
  const byMetric = new Map<string, number[]>();
  for (const e of events) {
    const list = byMetric.get(e.metric) ?? [];
    list.push(e.value);
    byMetric.set(e.metric, list);
  }
  const p75: Record<string, number> = {};
  for (const metric of RUM_METRIC_ORDER) {
    const list = byMetric.get(metric);
    if (!list || list.length === 0) continue;
    const sorted = [...list].sort((a, b) => a - b);
    const idx = Math.max(0, Math.min(sorted.length - 1, Math.ceil(sorted.length * 0.75) - 1));
    p75[metric] = sorted[idx];
  }

  // S124/BY6: the series construction lives in the pure seam (unit-pinned
  // on the gap/newest/window contracts). The UTC-day buckets are the
  // documented single-owner choice; an unsampled day is a null GAP (never
  // a fabricated 0 — the panel's finite filter drops it; a 0 CLS would
  // read as a GOOD score on idle days), and each sampled day carries the
  // day's NEWEST sample (final-value-wins, order-independent).
  const trends = buildTrends(events, Date.now());

    const recent = events.slice(0, 50).map((e) => ({
      metric: e.metric,
      value: e.value,
      rating: e.rating,
      navigationType: e.navigationType,
      path: e.path,
      sessionId: e.sessionId,
      createdAt: e.createdAt.toISOString(),
    }));

    return NextResponse.json({
      p75,
      samples: events.length,
      total: events.length,
      recent,
      trends,
    });
  } catch (err: unknown) {
    return toErrorResponse(err);
  }
};
