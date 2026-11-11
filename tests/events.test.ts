// S162/DK5 — the events recurrence-expansion seam (the S161-recorded
// F-7 deferral, executed). expandOccurrences lived view-local in
// events-view.tsx:72-94 for its entire life with ZERO unit pins — the
// recurrence rules (none/daily/weekly/monthly, the past-start guard,
// the DST-rounding absorption, the start-day-only parity rule) were
// verified by code-reading audits but never machine-guarded. The S161
// remediation plan §8 recorded the promotion: "the events
// expandOccurrences promotion to a src/lib/ seam with unit pins (the
// F-7 candidate, recorded for the next events-family cycle)" — this
// cycle is that cycle. The function moved VERBATIM to src/lib/events.ts
// (the structural param type keeps the seam pure — no data.ts import;
// EventRow satisfies { startDate: string | Date; repeat: string }
// structurally, so the view's call site is unchanged).
//
// The pinned semantics (each verified against the pre-move source by
// direct read before the move):
//   • none          — hits ONLY the start day (diffDays === 0).
//   • daily         — hits every window day from the start (inclusive).
//   • weekly        — pure day-diff % 7 — NO week anchoring, so hits
//                     cross month boundaries (a Wednesday start hits
//                     Wednesdays across Oct→Nov).
//   • monthly       — same DATE-OF-MONTH (a Jan 31 start simply skips
//                     February — the short-month semantics).
//   • past-start    — days before the start never hit (the guard).
//   • DST           — Math.round over 86,400,000 absorbs the ±1 h
//                     midnight shift across a DST transition.
//   • multi-day     — hits ONLY the start day (the parity rule: the
//                     Calendar's day detail filters isSameDay(startDate);
//                     the occurrence model has no spanning).
//   • return shape  — the hits ARE the window's own day values (the
//                     promoted API contract for future callers).
import { describe, expect, it } from "vitest";
import { addDays } from "../src/lib/date";
import { expandOccurrences } from "../src/lib/events";

// A window helper anchored like the view's own (seven days from a focus
// day — events-view.tsx's windowDays useMemo shape).
const windowFrom = (focus: Date): Date[] =>
  Array.from({ length: 7 }, (_, i) => addDays(focus, i));

// The minimal structural event — the seam's own param type.
const event = (startDate: string, repeat: string): { startDate: string | Date; repeat: string } => ({
  startDate,
  repeat,
});

describe("expandOccurrences (S162/DK5 — the promoted seam)", () => {
  it("none: hits ONLY the start day", () => {
    const focus = new Date(2026, 10, 9); // Mon Nov 9 2026
    const days = windowFrom(focus);
    const hits = expandOccurrences(event("2026-11-09T10:00", "none"), days);
    expect(hits.map((d) => d.toDateString())).toEqual([focus.toDateString()]);
  });

  it("daily: hits every window day from the start (inclusive)", () => {
    const focus = new Date(2026, 10, 9);
    const days = windowFrom(focus);
    const hits = expandOccurrences(event("2026-11-11T08:30", "daily"), days);
    // Starts Wednesday Nov 11 → hits Nov 11..15 (the window ends Sun 15).
    expect(hits.map((d) => d.getDate())).toEqual([11, 12, 13, 14, 15]);
  });

  it("weekly: pure day-diff % 7 crosses the month boundary (no week anchoring)", () => {
    // Window Nov 4 → Nov 10; the start is Oct 7 — 28 days before Nov 4.
    // A week-ANCHORED implementation (ISO/US week logic) would key off the
    // week containing the start; the pure day-diff rule just answers
    // 28 % 7 === 0 → the recurrence continues across the Oct→Nov boundary.
    const focus = new Date(2026, 10, 4);
    const days = windowFrom(focus);
    const hits = expandOccurrences(event("2026-10-07T09:00", "weekly"), days);
    expect(hits.map((d) => d.toDateString())).toEqual([
      new Date(2026, 10, 4).toDateString(),
    ]);
  });

  it("monthly: same date-of-month — a Jan 31 start skips February entirely", () => {
    // Window Feb 25 → Mar 3; start Jan 31.
    const focus = new Date(2026, 1, 25);
    const days = windowFrom(focus);
    const hits = expandOccurrences(event("2026-01-31T10:00", "monthly"), days);
    // February 2026 has no 31st (25..28 ≠ 31) and Mar 1..3 (1..3 ≠ 31):
    // ZERO hits. The Jan 31 monthly event simply skips February — the
    // documented date-of-month semantics (no clamp-to-month-end).
    expect(hits).toEqual([]);
  });

  it("monthly: hits the same date-of-month inside the window", () => {
    const focus = new Date(2026, 10, 9); // Nov 9..15
    const days = windowFrom(focus);
    const hits = expandOccurrences(event("2026-06-12T10:00", "monthly"), days);
    expect(hits.map((d) => d.getDate())).toEqual([12]);
  });

  it("days before the start never hit (the past-start guard)", () => {
    const focus = new Date(2026, 10, 9); // window Nov 9..15
    const days = windowFrom(focus);
    const hits = expandOccurrences(event("2026-11-13T10:00", "daily"), days);
    // The event starts Nov 13 — Nov 9..12 are before the start: no hits.
    expect(hits.map((d) => d.getDate())).toEqual([13, 14, 15]);
  });

  it("daily across the US DST transition: Math.round absorbs the ±1h shift", () => {
    // US DST ends Sun Nov 1 2026 (2:00→1:00). A daily event starting the
    // day BEFORE the transition, windowed across it: every day hits —
    // the day-diff rounding over 86,400,000 ms absorbs the shifted
    // local-midnight instants (23h/25h days).
    const focus = new Date(2026, 9, 30); // Fri Oct 30 → Thu Nov 5
    const days = windowFrom(focus);
    const hits = expandOccurrences(event("2026-10-30T00:00", "daily"), days);
    expect(hits).toHaveLength(7);
  });

  it("a multi-day event hits ONLY its start day (the parity rule — the Calendar filters isSameDay(startDate))", () => {
    const focus = new Date(2026, 10, 9);
    const days = windowFrom(focus);
    // Starts Nov 10 with an end Nov 12 — the occurrence model has NO
    // spanning: the endDate is the occurrence's own end, never a
    // recurrence-until, and the event appears only on its start day.
    const hits = expandOccurrences(event("2026-11-10T10:00", "none"), days);
    expect(hits.map((d) => d.getDate())).toEqual([10]);
  });

  it("the returned hits ARE the window's own day values (the promoted API's return contract)", () => {
    const focus = new Date(2026, 10, 9);
    const days = windowFrom(focus);
    const hits = expandOccurrences(event("2026-11-09T10:00", "none"), days);
    // Identity: the hit elements are the windowDays elements themselves
    // — callers map them per-day by identity/equality.
    expect(hits[0]).toBe(days[0]);
  });

  it("a Date-typed startDate is accepted (the structural param covers both wire forms)", () => {
    const focus = new Date(2026, 10, 9);
    const days = windowFrom(focus);
    const hits = expandOccurrences({ startDate: new Date(2026, 10, 10), repeat: "none" }, days);
    expect(hits.map((d) => d.getDate())).toEqual([10]);
  });
});

// ---------------------------------------------------------------------------
// S176/DZ1 — the Yearly repeat leg (the s176 reference probe: the
// reference's event-dialog repeat select carries FIVE options —
// No repeat/Daily/Weekly/Monthly/Yearly — while the clone's REPEATS
// single source (validation.ts:102) shipped four). The yearly rule
// follows the monthly seam's calendar-truth posture: the same
// month+day across years, no synthetic shifting (a Feb-29 start hits
// only leap-year Feb 29s — the Jan-31-skips-February precedent).
// The pins ride the same structural param the seam exposes.
// ---------------------------------------------------------------------------
describe("expandOccurrences — yearly (S176/DZ1)", () => {
  it("yearly: hits the same month+day anniversary inside the window", () => {
    // Start Mar 10 2026; the window spans the 2027 anniversary.
    const focus = new Date(2027, 2, 8); // Mon Mar 8 → Sun Mar 14 2027
    const days = windowFrom(focus);
    const hits = expandOccurrences(event("2026-03-10T10:00", "yearly"), days);
    expect(hits.map((d) => d.toDateString())).toEqual([
      new Date(2027, 2, 10).toDateString(),
    ]);
  });

  it("yearly: the event's own start day hits AND a mid-window non-anniversary day never does", () => {
    // Window Nov 8 → 14 2026; the start is Nov 10 2026 (the start day
    // itself is an occurrence — the none/daily family contract).
    const focus = new Date(2026, 10, 8);
    const days = windowFrom(focus);
    const hits = expandOccurrences(event("2026-11-10T10:00", "yearly"), days);
    expect(hits.map((d) => d.getDate())).toEqual([10]);
  });

  it("yearly: a Feb-29 start hits ONLY leap-year Feb 29s (the calendar-truth posture)", () => {
    // Start Feb 29 2024 (a leap year). 2026 is NOT a leap year — a
    // window across Feb 25 → Mar 3 2026 has no Feb 29: zero hits.
    const focus2026 = new Date(2026, 1, 25);
    expect(expandOccurrences(event("2024-02-29T10:00", "yearly"), windowFrom(focus2026))).toEqual([]);
    // 2028 IS a leap year — the window Feb 27 → Mar 4 2028 hits Feb 29.
    const focus2028 = new Date(2028, 1, 27);
    const hits = expandOccurrences(event("2024-02-29T10:00", "yearly"), windowFrom(focus2028));
    expect(hits.map((d) => d.toDateString())).toEqual([
      new Date(2028, 1, 29).toDateString(),
    ]);
  });

  it("yearly: days before the start never hit (the past-start guard holds at the new value)", () => {
    // Window Nov 8 → 14 2026; the start is Nov 12 2027 — the whole
    // window is BEFORE the start: zero hits.
    const focus = new Date(2026, 10, 8);
    expect(expandOccurrences(event("2027-11-12T10:00", "yearly"), windowFrom(focus))).toEqual([]);
  });
});
