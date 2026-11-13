import { describe, expect, it, vi } from "vitest";

import { createRumBatcher, RUM_BATCH_WINDOW_MS, type RumBatchEvent } from "@/lib/rum-batch";

// ---------------------------------------------------------------------------
// S179/EC3 · the rum-beacon batching seam (docs/remediation-plan-session179.md
// §4 — the S178 lesson-2 candidate, closed).
//
// The S178 root-cause record: the beacon fired ONE POST PER METRIC (up to 5
// concurrent /api/rum POSTs on every shell boot — TTFB/FCP/LCP/CLS/INP each
// carried their own fetch), and the route's sequential upsert loop timeshares
// the SQLite writer against the boot's hydration-gate reads — the measured
// ~30s first-navigation stall class (the isolated-variable proof: blocking
// /api/rum in the browser made it deterministically clean). The route ALREADY
// accepts the multi-event batch shape ({ sessionId, events: [...] } — the
// rumBatchSchema contract); the fix is CLIENT-side: one flush window
// coalesces the per-metric reports into ONE POST.
//
// The seam contract (the plan §4): push() buffers; the window timer flushes
// ALL buffered events in ONE send(events) call; flushNow() drains the
// pending buffer on demand (the pagehide/unmount path — the keepalive
// contract); the seam NEVER swallows a send failure — the CALLER owns the
// silence (the beacon's own silent-telemetry contract; a swallowed send
// error here would hide transport failures from every future caller).
//
// The s18-rum e2e spec's own comment records the trail tolerance ("the flush
// can trail 3.5s" — the aggregate poll loops up to 20s), so the 1.5s window
// rides inside every existing consumer's budget.
// ---------------------------------------------------------------------------

const ev = (metric: string): RumBatchEvent => ({
  metric,
  value: 100,
  rating: "good",
  navigationType: "navigate",
  path: "/",
  userAgent: "test",
});

describe("S179/EC3 · the rum batcher", () => {
  it("coalesces every metric pushed inside one window into ONE send", () => {
    vi.useFakeTimers();
    try {
      const send = vi.fn();
      const batcher = createRumBatcher(send);

      // The boot shape: all five web-vitals metrics report within ~1s.
      batcher.push(ev("TTFB"));
      batcher.push(ev("FCP"));
      batcher.push(ev("LCP"));
      batcher.push(ev("CLS"));
      batcher.push(ev("INP"));

      expect(send).not.toHaveBeenCalled(); // nothing flushes early
      vi.advanceTimersByTime(RUM_BATCH_WINDOW_MS);

      // ONE POST carrying all five — the pre-fix beacon fired five.
      expect(send).toHaveBeenCalledTimes(1);
      const batch = send.mock.calls[0][0] as RumBatchEvent[];
      expect(batch.map((e) => e.metric).sort()).toEqual(["CLS", "FCP", "INP", "LCP", "TTFB"]);
    } finally {
      vi.useRealTimers();
    }
  });

  it("the window rides the FIRST push (late metrics join the open window, not a second one)", () => {
    vi.useFakeTimers();
    try {
      const send = vi.fn();
      const batcher = createRumBatcher(send);

      batcher.push(ev("TTFB"));
      vi.advanceTimersByTime(RUM_BATCH_WINDOW_MS - 200); // window still open
      batcher.push(ev("FCP")); // joins the OPEN window
      vi.advanceTimersByTime(200); // the first push's timer fires NOW

      expect(send).toHaveBeenCalledTimes(1);
      expect((send.mock.calls[0][0] as RumBatchEvent[]).map((e) => e.metric)).toEqual(["TTFB", "FCP"]);
    } finally {
      vi.useRealTimers();
    }
  });

  it("two windows send two batches (the steady-state rhythm)", () => {
    vi.useFakeTimers();
    try {
      const send = vi.fn();
      const batcher = createRumBatcher(send);

      batcher.push(ev("TTFB"));
      vi.advanceTimersByTime(RUM_BATCH_WINDOW_MS);
      batcher.push(ev("LCP"));
      vi.advanceTimersByTime(RUM_BATCH_WINDOW_MS);

      expect(send).toHaveBeenCalledTimes(2);
      expect((send.mock.calls[0][0] as RumBatchEvent[]).map((e) => e.metric)).toEqual(["TTFB"]);
      expect((send.mock.calls[1][0] as RumBatchEvent[]).map((e) => e.metric)).toEqual(["LCP"]);
    } finally {
      vi.useRealTimers();
    }
  });

  it("an empty buffer never sends (the idle timer contract)", () => {
    vi.useFakeTimers();
    try {
      const send = vi.fn();
      const batcher = createRumBatcher(send);

      batcher.push(ev("TTFB"));
      vi.advanceTimersByTime(RUM_BATCH_WINDOW_MS);
      expect(send).toHaveBeenCalledTimes(1);

      // No further pushes: advancing far past the window must NOT re-send.
      vi.advanceTimersByTime(RUM_BATCH_WINDOW_MS * 10);
      expect(send).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it("flushNow drains the pending buffer immediately and re-arms cleanly", () => {
    vi.useFakeTimers();
    try {
      const send = vi.fn();
      const batcher = createRumBatcher(send);

      batcher.push(ev("TTFB"));
      batcher.push(ev("FCP"));
      batcher.flushNow();

      expect(send).toHaveBeenCalledTimes(1);
      expect((send.mock.calls[0][0] as RumBatchEvent[]).map((e) => e.metric)).toEqual(["TTFB", "FCP"]);

      // The flushed window's timer must NOT double-send the drained batch.
      vi.advanceTimersByTime(RUM_BATCH_WINDOW_MS * 2);
      expect(send).toHaveBeenCalledTimes(1);

      // And the batcher still works after the drain.
      batcher.push(ev("LCP"));
      vi.advanceTimersByTime(RUM_BATCH_WINDOW_MS);
      expect(send).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it("a send failure propagates to the CALLER — the seam never owns the silence", () => {
    vi.useFakeTimers();
    try {
      // The beacon's own contract owns the silence (its send swallows
      // internally); a DIFFERENT caller may want the rejection. The seam
      // must not add a swallow of its own (the S118/BS9 class).
      const send = vi.fn(() => {
        throw new Error("transport down");
      });
      const batcher = createRumBatcher(send);

      batcher.push(ev("TTFB"));
      expect(() => batcher.flushNow()).toThrow("transport down");

      // The buffered batch was CONSUMED by the attempt (no infinite retry
      // loop re-firing a dead transport on every timer tick).
      vi.advanceTimersByTime(RUM_BATCH_WINDOW_MS * 2);
      expect(send).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });
});
