"use client";

// ---------------------------------------------------------------------------
// The ADR-016 RUM beacon: ZERO DOM (visual parity is byte-preserved — the
// component renders null always). After mount, only when a session cookie is
// present, it dynamic-imports web-vitals and POSTs each metric the moment it
// reports to /api/rum (the server upserts the (sessionId, metric) pair —
// final value wins). Failures are swallowed SILENTLY: no toast, no console
// spam — telemetry must never become user-visible noise.
// ---------------------------------------------------------------------------

import * as React from "react";

type Metric = import("web-vitals").Metric;

function reportMetric(sessionId: string, metric: Metric): void {
  // The keepalive POST survives the page unload that LCP/INP sometimes
  // ride; every failure is silent by contract.
  void fetch("/api/rum", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: JSON.stringify({
      sessionId,
      events: [
        {
          metric: metric.name,
          value: metric.value,
          rating: metric.rating,
          navigationType: metric.navigationType,
          path: window.location.pathname,
          userAgent: window.navigator.userAgent,
        },
      ],
    }),
  }).catch(() => {
    // silent — the beacon never surfaces its own failures
  });
}

export function RumBeacon() {
  React.useEffect(() => {
    // Auth gating lives at the MOUNT POINT: the shell renders this component
    // only inside its authed branch. The previous document.cookie gate could
    // never open — the session cookie is httpOnly, so document.cookie never
    // contains it and the beacon silently never fired.
    const sessionId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `sf-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    void (async () => {
      try {
        const vitals = await import("web-vitals");
        const onReport = (metric: Metric) => reportMetric(sessionId, metric);
        vitals.onTTFB(onReport);
        vitals.onFCP(onReport);
        vitals.onLCP(onReport);
        vitals.onCLS(onReport);
        vitals.onINP(onReport);
      } catch {
        // silent — a failed dynamic import must never disturb the session
      }
    })();
  }, []);

  return null;
}
