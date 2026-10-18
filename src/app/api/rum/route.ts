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
import { z } from "zod";

import { checkRateLimit } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/server/auth";
import {
  parseWith,
  rateLimitedResponse,
  readJson,
  toErrorResponse,
} from "@/lib/server/http";
import { RUM_METRIC_ORDER } from "@/lib/rum-diagnostics";

const rumEventSchema = z.object({
  metric: z.enum(["TTFB", "FCP", "LCP", "CLS", "INP"]),
  value: z.number().min(0).max(6_000_000),
  rating: z.enum(["good", "needs-improvement", "poor"]),
  navigationType: z.string().min(1).max(40),
  path: z.string().max(500).optional().default("/"),
  userAgent: z.string().max(400).optional().default(""),
});

const rumBatchSchema = z.object({
  sessionId: z.string().min(1).max(100),
  events: z.array(rumEventSchema).min(1).max(20),
});

export const POST = async (request: NextRequest) => {
  try {
    const user = await requireUser();

    const limit = checkRateLimit(`rum:${user.id}`, 1000);
    if (!limit.ok) return rateLimitedResponse(limit.retryAfterSec, "Too many RUM reports");

    const raw: unknown = await readJson(request);
    const { sessionId, events } = parseWith(rumBatchSchema, raw);

    for (const event of events) {
      await db.rumEvent.upsert({
        where: {
          sessionId_metric: { sessionId, metric: event.metric },
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

  // 7-day trend series per metric (oldest → newest daily mean).
  const trends: Record<string, number[]> = {};
  const dayMs = 86_400_000;
  const dayKey = (ts: number) => Math.floor(ts / dayMs);
  const todayKey = dayKey(Date.now());
  for (const metric of RUM_METRIC_ORDER) {
    const rows = events.filter((e) => e.metric === metric);
    if (rows.length === 0) continue;
    const series: number[] = [];
    for (let d = 6; d >= 0; d--) {
      const key = todayKey - d;
      const dayRows = rows.filter((e) => dayKey(e.createdAt.getTime()) === key);
      if (dayRows.length === 0) {
        series.push(0);
        continue;
      }
      // The day's NEWEST sample (events are most-recent-first) — the
      // final-value-wins semantics carried into the trend (S20 contract:
      // a freshly posted probe value IS its day's bucket).
      series.push(dayRows[0].value);
    }
    trends[metric] = series;
  }

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
