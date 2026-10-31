// ---------------------------------------------------------------------------
// The RUM diagnostics seam (S19/ADR-017 + S20/ADR-018). Pure, zero imports —
// unit-pinned by tests/rum-diagnostics.test.ts. Three concerns:
//
//  1. the PUBLIC Core Web Vitals rating bounds (classifyP75 re-derives the
//     rating from the p75 VALUE — field-data convention; the per-event
//     ratings the beacon posted are its own in-the-moment calls),
//  2. the display model the /rum panel renders (buildPanelRows — cards in
//     the stable metric order, unsampled slots kept, trend series attached),
//  3. the sparkline geometry (buildSparklinePoints) and the CSV export body
//     (toRumCsv — RFC-4180 escaping, RAW analysis-grade values).
// ---------------------------------------------------------------------------

export type RumMetric = "TTFB" | "FCP" | "LCP" | "CLS" | "INP";
export type RumRating = "good" | "needs-improvement" | "poor";

/** web-vitals v6 metric set, in the panel's stable display order. */
export const RUM_METRIC_ORDER: RumMetric[] = ["TTFB", "FCP", "LCP", "CLS", "INP"];

/** The public good / needs-improvement bounds per metric (ni = poor above). */
export const CWV_THRESHOLDS: Record<RumMetric, { good: number; ni: number }> = {
  TTFB: { good: 800, ni: 1800 },
  FCP: { good: 1800, ni: 3000 },
  LCP: { good: 2500, ni: 4000 },
  CLS: { good: 0.1, ni: 0.25 },
  INP: { good: 200, ni: 500 },
};

/** Human names for the panel cards. */
export const RUM_METRIC_LABELS: Record<RumMetric, string> = {
  TTFB: "Time to First Byte",
  FCP: "First Contentful Paint",
  LCP: "Largest Contentful Paint",
  CLS: "Cumulative Layout Shift",
  INP: "Interaction to Next Paint",
};

/** Re-derive the public rating from a p75 value (boundary-exact: ≤ good,
 *  ≤ ni, else poor). Unknown metrics classify as poor (defensive). */
export function classifyP75(metric: string, value: number): RumRating {
  const bounds = CWV_THRESHOLDS[metric as RumMetric];
  if (!bounds) return "poor";
  if (value <= bounds.good) return "good";
  if (value <= bounds.ni) return "needs-improvement";
  return "poor";
}

/** Panel formatting: ms metrics render as whole milliseconds with the unit;
 *  CLS is unitless with two decimals (it has no ms dimension). */
export function formatMetricValue(metric: string, value: number): string {
  if (metric === "CLS") return value.toFixed(2);
  return `${Math.round(value)} ms`;
}

// ---- the display model -------------------------------------------------------

export type RumRecentSample = {
  metric: string;
  value: number;
  rating: string;
  navigationType: string;
  path: string;
  sessionId: string;
  createdAt: string;
};

export type RumAggregate = {
  p75: Record<string, number>;
  samples: number;
  total: number;
  recent: RumRecentSample[];
  trends?: Record<string, number[]>;
};

export type RumCard = {
  metric: RumMetric;
  label: string;
  sampled: boolean;
  formatted: string | null;
  rating: RumRating | null;
  points: number[];
};

export type RumPanelRows = {
  hasData: boolean;
  cards: RumCard[];
  recent: RumRecentSample[];
};

/** Build the panel's display model: one card slot per metric (in the stable
 *  order — unsampled metrics keep their slot), ratings derived from the p75
 *  value, each card carrying its finite-filtered trend series. The recent
 *  samples pass through untouched (the caller formats times). */
export function buildPanelRows(aggregate: RumAggregate): RumPanelRows {
  const hasData =
    aggregate.samples > 0 ||
    aggregate.total > 0 ||
    Object.keys(aggregate.p75).length > 0;

  const cards: RumCard[] = RUM_METRIC_ORDER.map((metric) => {
    const p75 = aggregate.p75[metric];
    const sampled = typeof p75 === "number" && Number.isFinite(p75);
    const rawTrend = aggregate.trends?.[metric];
    const points = Array.isArray(rawTrend)
      ? rawTrend.filter((v) => typeof v === "number" && Number.isFinite(v))
      : [];
    return {
      metric,
      label: RUM_METRIC_LABELS[metric],
      sampled,
      formatted: sampled ? formatMetricValue(metric, p75 as number) : null,
      rating: sampled ? classifyP75(metric, p75 as number) : null,
      points,
    };
  });

  return { hasData, cards, recent: aggregate.recent };
}

// ---- the sparkline geometry (S20) ----------------------------------------------

export type SparkPoint = { x: number; y: number };

const SPARK_PAD = 2;

/** Normalize a value series into polyline points across width × height.
 *  Edge cases are first-class: an empty series renders no SVG ([]); a
 *  single value is promoted to a VISIBLE flat line (two centered points
 *  spanning the width); a flat series parks every point at the vertical
 *  center. Larger values → smaller y (the natural chart orientation). */
export function buildSparklinePoints(
  values: number[],
  width: number,
  height: number,
): SparkPoint[] {
  if (values.length === 0) return [];
  if (values.length === 1) {
    return [
      { x: 0, y: height / 2 },
      { x: width, y: height / 2 },
    ];
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const span = height - SPARK_PAD * 2;

  return values.map((value, index) => {
    const x = (index * width) / (values.length - 1);
    const y =
      range === 0
        ? height / 2
        : SPARK_PAD + (1 - (value - min) / range) * span;
    return { x, y };
  });
}

// ---- the CSV export body (S20) --------------------------------------------------

export type RumCsvEvent = {
  metric: string;
  value: number;
  rating: string;
  navigationType: string;
  path: string;
  sessionId: string;
  createdAt: string;
};

const CSV_HEADER =
  "metric,value,rating,navigationType,path,sessionId,createdAt";

/** Escape one CSV field RFC-4180 style: fields carrying a comma, quote, or
 *  line break are wrapped in quotes with inner quotes doubled. S118/BS6:
 *  a field BEGINNING with a spreadsheet formula trigger (= + - @ tab CR)
 *  is additionally prefixed with a neutralizing apostrophe — the beacon's
 *  path/userAgent/sessionId/navigationType are client-controlled strings
 *  and the export opens in Excel/LibreOffice. */
function csvField(raw: string): string {
  const guarded = /^[=+\-\t\r@]/.test(raw) ? `'${raw}` : raw;
  if (/[",\n\r]/.test(guarded)) {
    return `"${guarded.replace(/"/g, '""')}"`;
  }
  return guarded;
}

/** Render the export body: the header line + one RAW row per event (no
 *  display formatting — the values stay analysis-grade; CLS keeps its
 *  decimals, ms metrics keep theirs). Rows preserve the caller's order. */
export function toRumCsv(events: RumCsvEvent[]): string {
  const lines = [CSV_HEADER];
  for (const event of events) {
    lines.push(
      [
        csvField(event.metric),
        csvField(String(event.value)),
        csvField(event.rating),
        csvField(event.navigationType),
        csvField(event.path),
        csvField(event.sessionId),
        csvField(event.createdAt),
      ].join(","),
    );
  }
  return lines.join("\n") + "\n";
}
