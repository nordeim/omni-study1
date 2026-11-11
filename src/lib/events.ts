// ---------------------------------------------------------------------------
// S162/DK5 — the events recurrence-expansion seam (the S161-recorded F-7
// deferral, executed). This function lived view-local in events-view.tsx
// for its entire life with ZERO unit pins — the recurrence rules were
// verified by code-reading audits but never machine-guarded. The S161
// remediation plan §8 recorded the promotion "for the next events-family
// cycle"; this cycle is that cycle. The body moved VERBATIM (the
// semantics are parity-measured design — the reference's own recurrence
// surfaces were probed in the S6/S66 eras); the parameter is typed
// STRUCTURALLY so EventRow satisfies it without a data.ts import (the
// layer model: lib seams stay pure; string covers the wire's datetime
// instants, Date covers any future caller's local values).
//
// Pinned by tests/events.test.ts (none/daily/weekly/monthly rules, the
// past-start guard, the DST-rounding absorption, the start-day-only
// parity rule — the Calendar's day detail filters isSameDay(startDate),
// so the occurrence model has no spanning; endDate is the occurrence's
// own end, never a recurrence-until: occurrences run forward unboundedly
// by design).
// ---------------------------------------------------------------------------

import { startOfDay } from "./date";

/**
 * The days in `windowDays` on which `event` occurs, in window order.
 *
 * The rules: `none` hits only the start day; `daily` hits every day from
 * the start (inclusive); `weekly` is a pure day-diff `% 7` (no week
 * anchoring — recurrences cross month boundaries); `monthly` hits the
 * same date-of-month (a Jan 31 start simply skips February). Days before
 * the start never hit. The returned elements ARE the window's own day
 * values (callers map them per-day).
 */
export function expandOccurrences(
  event: { startDate: string | Date; repeat: string },
  windowDays: Date[],
): Date[] {
  const start = startOfDay(new Date(event.startDate));
  const hits: Date[] = [];
  for (const day of windowDays) {
    const d = startOfDay(day);
    const diffDays = Math.round((d.getTime() - start.getTime()) / 86_400_000);
    if (diffDays < 0) continue;
    switch (event.repeat) {
      case "daily":
        hits.push(day);
        break;
      case "weekly":
        if (diffDays % 7 === 0) hits.push(day);
        break;
      case "monthly":
        if (d.getDate() === start.getDate()) hits.push(day);
        break;
      // S176/DZ1: the same month+day across years — the monthly seam's
      // calendar-truth posture (no synthetic shifting: a Feb-29 start
      // hits only leap-year Feb 29s, the Jan-31-skips-February
      // precedent).
      case "yearly":
        if (d.getMonth() === start.getMonth() && d.getDate() === start.getDate()) hits.push(day);
        break;
      default:
        if (diffDays === 0) hits.push(day);
    }
  }
  return hits;
}
