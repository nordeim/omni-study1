"use client";

// ---------------------------------------------------------------------------
// The ADR-016 RUM beacon: ZERO DOM (visual parity is byte-preserved — the
// component renders null always). The AUTH GATE lives at the MOUNT POINT:
// the authed shell renders this component only inside its signed-in branch
// (the httpOnly session cookie was never readable from the client — the
// old document.cookie gate never opened; S140/CO4e re-aligned this header
// with the inline mount-point comment). After mount it dynamic-imports
// web-vitals and reports each metric into the S179/EC3 BATCHER — one 1.5s
// flush window coalesces the boot's metric burst (TTFB/FCP/LCP/CLS/INP)
// into ONE keepalive POST per window (the S178 rum-write/boot-read
// contention root cause: the per-metric POSTs — up to 5 concurrent —
// timeshared the SQLite writer against the boot's hydration-gate reads;
// src/lib/rum-batch.ts owns the window contract, unit-pinned).
// Failures are swallowed SILENTLY: no toast, no console spam — telemetry
// must never become user-visible noise (the beacon owns the silence; the
// batcher seam never swallows — the S118/BS9 class).
// ---------------------------------------------------------------------------

import * as React from "react";

import { createRumBatcher, type RumBatchEvent } from "@/lib/rum-batch";

type Metric = import("web-vitals").Metric;

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

    // S179/EC3: the batcher owns the window; the beacon's send owns the
    // transport AND its failure (the fetch chain swallows internally —
    // the silent-telemetry contract; the batcher never catches).
    const batcher = createRumBatcher((events) => {
      // The keepalive POST survives the page unload that LCP/INP sometimes
      // ride; every failure is silent by contract.
      void fetch("/api/rum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          sessionId,
          events: events.map((event: RumBatchEvent) => ({
            metric: event.metric,
            value: event.value,
            rating: event.rating,
            navigationType: event.navigationType,
            path: event.path,
            userAgent: event.userAgent,
          })),
        }),
      }).catch(() => {
        // silent — the beacon never surfaces its own failures
      });
    });

    const onReport = (metric: Metric): void => {
      batcher.push({
        metric: metric.name,
        value: metric.value,
        rating: metric.rating,
        navigationType: metric.navigationType,
        path: window.location.pathname,
        userAgent: window.navigator.userAgent,
      });
    };

    // The pagehide flush: the last open window must not lose its batch to
    // the unload (the keepalive contract rides the send).
    const onPageHide = (): void => batcher.flushNow();
    window.addEventListener("pagehide", onPageHide);

    void (async () => {
      try {
        const vitals = await import("web-vitals");
        vitals.onTTFB(onReport);
        vitals.onFCP(onReport);
        vitals.onLCP(onReport);
        vitals.onCLS(onReport);
        vitals.onINP(onReport);
      } catch {
        // silent — a failed dynamic import must never disturb the session
      }
    })();

    return () => {
      window.removeEventListener("pagehide", onPageHide);
      batcher.flushNow();
    };
  }, []);

  return null;
}
