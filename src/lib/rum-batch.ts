// ---------------------------------------------------------------------------
// S179/EC3 — the rum-beacon batcher (the S178 lesson-2 candidate, closed).
//
// The S178 root-cause record (docs/remediation-plan-session178.md §1, the
// rum-write/boot-read contention): the beacon fired ONE POST PER METRIC —
// up to 5 concurrent /api/rum POSTs on every shell boot (TTFB/FCP/LCP/CLS/
// INP each carried their own keepalive fetch) — and the route's sequential
// upsert loop timeshares the SQLite writer against the boot's
// hydration-gate reads (the measured ~30s first-navigation stall class;
// the isolated-variable proof: blocking /api/rum in the browser made it
// deterministically clean). The route ALREADY accepts the multi-event
// batch shape ({ sessionId, events: [...] } — the rumBatchSchema
// contract), so the fix is CLIENT-side: one flush window coalesces the
// per-metric reports into ONE POST.
//
// The seam contract (docs/remediation-plan-session179.md §4):
//   • push(event) buffers; the FIRST push of a window opens it (late
//     metrics JOIN the open window — they do not open a second one).
//   • When the window closes, the batcher drains the buffer into ONE
//     send(events) call.
//   • flushNow() drains on demand (the pagehide/unmount path — the
//     keepalive contract rides the caller's send) and cancels the pending
//     timer (a drained batch must never double-send).
//   • The seam NEVER swallows a send failure — the CALLER owns the
//     silence (the beacon's own silent-telemetry contract; a swallowed
//     error here would hide transport failures from every future caller
//     — the S118/BS9 class). A failed send CONSUMES its batch (no retry
//     loop re-firing a dead transport on every timer tick).
//
// Pure and dependency-free (timer injection via the windowMs-bound
// setTimeout/clearTimeout globals; the unit layer pins it under fake
// timers). The s18-rum e2e spec's aggregate poll tolerates a 3.5s+ trail
// (its own comment records it; the poll loops up to 20s), so the 1.5s
// window rides inside every existing consumer's budget.
// ---------------------------------------------------------------------------

/** One web-vitals report — the route's rumEventSchema shape (the caller
 *  fills path/userAgent; the schema keys are the route's own). */
export type RumBatchEvent = {
  metric: string;
  value: number;
  rating: string;
  navigationType: string;
  path?: string;
  userAgent?: string;
};

/** The flush window: coalesces the boot's metric burst (TTFB+FCP report
 *  within ~1s of load; LCP can trail) into one POST while staying far
 *  inside the s18 aggregate-poll's 20s budget. */
export const RUM_BATCH_WINDOW_MS = 1_500;

export type RumBatcher = {
  /** Buffer one metric report; opens the flush window on the first push. */
  push(event: RumBatchEvent): void;
  /** Drain the pending buffer NOW (pagehide/unmount) and cancel the
   *  pending window timer — a drained batch never double-sends. */
  flushNow(): void;
};

export function createRumBatcher(
  send: (events: RumBatchEvent[]) => void,
  windowMs: number = RUM_BATCH_WINDOW_MS,
): RumBatcher {
  let buffer: RumBatchEvent[] = [];
  let timer: ReturnType<typeof setTimeout> | null = null;

  const drain = (): void => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
    if (buffer.length === 0) return; // an idle timer never sends
    const events = buffer;
    buffer = [];
    // No try/catch by contract: the caller's send owns its failure
    // handling (the beacon swallows internally; other callers may not).
    send(events);
  };

  return {
    push(event: RumBatchEvent): void {
      buffer.push(event);
      if (timer === null) {
        // The window rides the FIRST push — metrics reporting later in
        // the same window join this batch, not a second one.
        timer = setTimeout(drain, windowMs);
      }
    },
    flushNow(): void {
      drain();
    },
  };
}
