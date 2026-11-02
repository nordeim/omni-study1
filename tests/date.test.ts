import { describe, expect, it } from "vitest";
import {
  addDays,
  addMonths,
  fromDatetimeLocalInput,
  fromDueDateInput,
  toDateInputValue,
  toDatetimeLocalValue,
  dayBucketLabel,
  daysUntil,
  formatHHMMRange,
  formatLongDate,
  formatMinutes,
  formatDueDateShort,
  formatFocusHours,
  formatShortDate,
  formatTime12h,
  isSameDay,
  isSameMonth,
  isoWeekNumber,
  isoWeekday,
  minutesToHHMM,
  monthGrid,
  parseHHMM,
  referenceWeekNumber,
  startOfDay,
} from "@/lib/date";

describe("isoWeekNumber", () => {
  it("computes the ISO calendar week (the Events panel's CW label)", () => {
    // The reference rendered "Oct 2026 CW 41" for Wednesday, October 7 2026.
    expect(isoWeekNumber(new Date(2026, 9, 7))).toBe(41);
    // Year boundaries: Jan 1 2026 is in week 1; Dec 28 2026 is in week 53.
    expect(isoWeekNumber(new Date(2026, 0, 1))).toBe(1);
    expect(isoWeekNumber(new Date(2026, 11, 28))).toBe(53);
    // Mon Oct 5 and Sun Oct 11 2026 share week 41.
    expect(isoWeekNumber(new Date(2026, 9, 5))).toBe(41);
    expect(isoWeekNumber(new Date(2026, 9, 11))).toBe(41);
  });
});

describe("referenceWeekNumber (the Events panel's CW, session-63)", () => {
  // The reference's CW is NOT ISO 8601: measured on the live reference,
  // Sunday 2026-10-18 rendered "CW 43" (ISO says 42) and stepping the
  // carousel back to Saturday 2026-10-17 rendered "CW 42". The convention
  // that produces both values: US week-of-year — weeks start SUNDAY and
  // week 1 is the week containing Jan 1.
  it("reads one ahead of ISO on Sunday-dated views (the ref-measured values)", () => {
    expect(referenceWeekNumber(new Date(2026, 9, 18))).toBe(43); // Sun — ref: CW 43
    expect(referenceWeekNumber(new Date(2026, 9, 17))).toBe(42); // Sat — ref: CW 42
    expect(isoWeekNumber(new Date(2026, 9, 18))).toBe(42); // the old label, wrong
  });
  it("keeps the US week-1 rule: week 1 is the week containing Jan 1 of the date's own year", () => {
    expect(referenceWeekNumber(new Date(2026, 0, 1))).toBe(1); // Jan 1 2026 (Thu)
    expect(referenceWeekNumber(new Date(2026, 0, 3))).toBe(1); // its week's Saturday
    expect(referenceWeekNumber(new Date(2026, 11, 28))).toBe(53); // the year's 53rd week
  });
  it("agrees with ISO mid-week (the divergence only shows across a Sunday)", () => {
    // Wed Oct 14: both conventions count the same week ordinal.
    expect(referenceWeekNumber(new Date(2026, 9, 14))).toBe(42);
    expect(isoWeekNumber(new Date(2026, 9, 14))).toBe(42);
  });
});

describe("isoWeekday / startOfDay / isSameDay", () => {
  it("treats Monday as index 0 (ISO)", () => {
    expect(isoWeekday(new Date(2026, 9, 5))).toBe(0); // Mon Oct 5 2026
    expect(isoWeekday(new Date(2026, 9, 6))).toBe(1); // Tue
    expect(isoWeekday(new Date(2026, 9, 11))).toBe(6); // Sun
  });

  it("startOfDay zeroes the clock", () => {
    const d = startOfDay(new Date(2026, 9, 6, 23, 59, 30));
    expect(d.getHours()).toBe(0);
    expect(d.getMinutes()).toBe(0);
    expect(d.getSeconds()).toBe(0);
  });

  it("isSameDay compares calendar days only", () => {
    expect(isSameDay(new Date(2026, 9, 6, 1), new Date(2026, 9, 6, 23))).toBe(true);
    expect(isSameDay(new Date(2026, 9, 6), new Date(2026, 9, 7))).toBe(false);
  });
});

describe("addDays / addMonths", () => {
  it("addDays crosses month boundaries", () => {
    expect(addDays(new Date(2026, 9, 30), 2).getDate()).toBe(1); // Oct 30 + 2 = Nov 1
  });

  it("addMonths clamps to the first of the month", () => {
    const next = addMonths(new Date(2026, 9, 31), 1);
    expect(next.getMonth()).toBe(10);
    expect(next.getDate()).toBe(1);
  });
});

describe("formatters", () => {
  it("formatLongDate renders 'October 6, 2026'", () => {
    expect(formatLongDate(new Date(2026, 9, 6))).toBe("October 6, 2026");
  });

  it("formatTime12h renders 12-hour clock with padded minutes and 2-digit hour (measured: '03:43 AM')", () => {
    expect(formatTime12h(new Date(2026, 9, 6, 0, 5))).toBe("12:05 AM");
    expect(formatTime12h(new Date(2026, 9, 6, 3, 43))).toBe("03:43 AM");
    expect(formatTime12h(new Date(2026, 9, 6, 9, 7))).toBe("09:07 AM");
    expect(formatTime12h(new Date(2026, 9, 6, 13, 29))).toBe("01:29 PM");
    expect(formatTime12h(new Date(2026, 9, 6, 23, 0))).toBe("11:00 PM");
    expect(formatTime12h(new Date(2026, 9, 6, 12, 0))).toBe("12:00 PM");
  });

  it("formatShortDate renders 'Tue, Oct 6'", () => {
    expect(formatShortDate(new Date(2026, 9, 6))).toBe("Tue, Oct 6");
  });

  it("formatMinutes renders hours and minutes", () => {
    expect(formatMinutes(45)).toBe("45m");
    expect(formatMinutes(60)).toBe("1h");
    expect(formatMinutes(135)).toBe("2h 15m");
  });

  // S4-K (measured s68): the reference dashboard's Focus Time stat reads
  // "0h" + hint "this month" — MONTH-scoped hours, not today-minutes. The
  // stat renders fractional hours with the trailing ".0" trimmed; only the
  // zero state is reference-verifiable (the ref account holds no focus
  // data) — the fractional format is the documented interpolation.
  it("formatFocusHours renders month hours with trimmed decimals", () => {
    expect(formatFocusHours(0)).toBe("0h");
    expect(formatFocusHours(60)).toBe("1h");
    expect(formatFocusHours(90)).toBe("1.5h");
    expect(formatFocusHours(45)).toBe("0.8h");
    expect(formatFocusHours(-5)).toBe("0h");
  });

  it("isSameMonth compares calendar months only", () => {
    expect(isSameMonth(new Date(2026, 9, 6), new Date(2026, 9, 19))).toBe(true);
    expect(isSameMonth(new Date(2026, 8, 30), new Date(2026, 9, 1))).toBe(false);
    expect(isSameMonth(new Date(2025, 9, 6), new Date(2026, 9, 6))).toBe(false);
  });
});

describe("monthGrid", () => {
  // S9-E (re-measured live on the reference): the reference's calendar month
  // grid is SUNDAY-FIRST — weekday header runs Sun…Sat and October 2026
  // starts at Sep 27 (Sunday) with exactly 35 cells (5 weeks).
  it("produces a Sunday-first grid (October 2026 = 35 cells, starts Sep 27)", () => {
    const cells = monthGrid(2026, 9); // October 2026 starts on Thursday
    expect(cells).toHaveLength(35);
    expect(cells[0]!.date.getDay()).toBe(0); // Sunday
    expect(cells[0]!.date.getDate()).toBe(27); // Sep 27
    expect(cells[0]!.date.getMonth()).toBe(8); // September
    expect(cells[0]!.inMonth).toBe(false);
    expect(cells.filter((c) => c.inMonth)).toHaveLength(31);
    // Last cell covers Oct 31 (Saturday) — no sixth week.
    expect(cells[34]!.date.getDate()).toBe(31);
    expect(cells[34]!.inMonth).toBe(true);
  });

  it("rounds up to a sixth week when the month spills past five", () => {
    // November 2026 starts on a Sunday: lead 0 + 30 days = 30 → 5 weeks.
    expect(monthGrid(2026, 10)).toHaveLength(35);
    // January 2027 starts on a Friday: lead 5 + 31 = 36 → 6 weeks.
    expect(monthGrid(2027, 0)).toHaveLength(42);
  });
});

describe("dayBucketLabel / daysUntil", () => {
  const today = new Date(2026, 9, 6);
  it("labels Today, Tomorrow and full dates", () => {
    expect(dayBucketLabel(today, today)).toBe("Today");
    expect(dayBucketLabel(addDays(today, 1), today)).toBe("Tomorrow");
    expect(dayBucketLabel(addDays(today, 2), today)).toBe("Thursday, October 8, 2026");
  });

  it("daysUntil counts whole days and goes negative in the past", () => {
    expect(daysUntil(addDays(today, 0), today)).toBe(0);
    expect(daysUntil(addDays(today, 7), today)).toBe(7);
    expect(daysUntil(addDays(today, -3), today)).toBe(-3);
  });
});

describe("formatDueDateShort (AC8 — the ref task pill's date form)", () => {
  // Measured on the reference (ref-ac-remeasure3-s76.mjs): the task row's
  // due pill ALWAYS renders the date form — month-short + day, no weekday,
  // no relative labels — for due-today ("Oct 20"), tomorrow ("Oct 22"),
  // far-future ("Oct 28") and past ("Oct 4") rows alike.
  it("renders month-short + day for every bucket", () => {
    const today = new Date(2026, 9, 20);
    expect(formatDueDateShort(today)).toBe("Oct 20");
    expect(formatDueDateShort(addDays(today, 1))).toBe("Oct 21");
    expect(formatDueDateShort(addDays(today, 8))).toBe("Oct 28");
    expect(formatDueDateShort(addDays(today, -16))).toBe("Oct 4");
    // Double-digit days and month rollovers.
    expect(formatDueDateShort(new Date(2026, 10, 4))).toBe("Nov 4");
    expect(formatDueDateShort(new Date(2026, 0, 9))).toBe("Jan 9");
  });
});

describe("HH:MM helpers", () => {
  it("parseHHMM accepts valid stamps and rejects the rest", () => {
    expect(parseHHMM("09:00")).toBe(540);
    expect(parseHHMM("23:59")).toBe(1439);
    expect(parseHHMM("9:5")).toBeNull();
    expect(parseHHMM("24:00")).toBeNull();
    expect(parseHHMM("09:60")).toBeNull();
    expect(parseHHMM("")).toBeNull();
  });

  it("minutesToHHMM zero-pads", () => {
    expect(minutesToHHMM(540)).toBe("09:00");
    expect(minutesToHHMM(1439)).toBe("23:59");
  });

  it("formatHHMMRange renders the span between two stamps", () => {
    expect(formatHHMMRange("09:00", "10:30")).toBe("1h 30m");
    expect(formatHHMMRange("10:30", "09:00")).toBe("0m"); // reversed clamps to 0
    expect(formatHHMMRange("bad", "inputs")).toBe("");
  });
});

// S123/BX3 — the datetime-local round-trip helpers (the tasks-view
// local-noon pattern, adapted for datetime-local). The exams/events edit
// dialogs populated with `row.date.slice(0, 16)` — the UTC WALL-CLOCK of
// the stored instant — and submitted the TZ-less string raw, which the
// server's datesOnWrite re-interprets in the SERVER's zone: on any
// non-UTC deployment the card (toLocaleTimeString — correct) and the
// dialog (UTC wall-clock) disagreed, and each untouched edit cycle
// re-interpreted the UTC wall-clock as local — a per-save drift of the
// UTC offset. These helpers own both boundaries in the USER's zone.
describe("S123/BX3: the datetime-local round-trip helpers", () => {
  it("fromDatetimeLocalInput produces a full UTC ISO instant from the local input", () => {
    const iso = fromDatetimeLocalInput("2031-03-15T14:30");
    // The wire contract: a full ISO string the server's new Date() parses
    // zone-INDEPENDENTLY (the Z suffix — never a TZ-less string again).
    expect(iso).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    // The instant is the input interpreted in the PROCESS zone (the
    // browser's zone at runtime) — the TZ-independent formulation.
    expect(Date.parse(iso)).toBe(Date.parse("2031-03-15T14:30:00"));
  });

  it("toDatetimeLocalValue returns the 16-char local wall-clock (never a Z-suffixed UTC clock)", () => {
    expect(toDatetimeLocalValue("2031-03-15T14:30:00.000Z")).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/,
    );
    // The drift-kill property, part 1: the value never carries the UTC
    // marker (the slice(0,16) form DID — it was the UTC wall-clock).
    expect(toDatetimeLocalValue("2031-03-15T14:30:00.000Z")).not.toContain("Z");
  });

  it("the round-trip preserves the instant for minute-aligned inputs (the drift-kill property)", () => {
    // In ANY process timezone: a minute-aligned instant, converted to the
    // local wall-clock and back, is the SAME instant. The slice(0,16)
    // form fails this in every non-UTC zone (it round-trips through the
    // UTC wall-clock and re-anchors it as local — the per-save drift).
    for (const iso of [
      "2031-03-15T14:30:00.000Z",
      "2026-01-01T00:00:00.000Z",
      "2026-12-31T23:59:00.000Z",
    ]) {
      const round = fromDatetimeLocalInput(toDatetimeLocalValue(iso));
      expect(Date.parse(round)).toBe(Date.parse(iso));
    }
  });

  it("drops sub-minute precision (the datetime-local granularity, truncated)", () => {
    const iso = "2031-03-15T14:30:45.123Z";
    const local = toDatetimeLocalValue(iso);
    // Seconds never survive the datetime-local boundary — the input's own
    // granularity — and the truncation never rounds UP: the rebuilt
    // instant is within one minute BELOW the original, in any zone.
    expect(local).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    const rebuilt = Date.parse(fromDatetimeLocalInput(local));
    const original = Date.parse(iso);
    expect(rebuilt).toBeLessThanOrEqual(original);
    expect(original - rebuilt).toBeLessThan(60_000);
  });

  it("the empty and malformed legs return empty strings (never invented instants)", () => {
    expect(toDatetimeLocalValue("")).toBe("");
    expect(toDatetimeLocalValue("garbage")).toBe("");
    expect(fromDatetimeLocalInput("")).toBe("");
    // A date-only ISO string still PARSES (UTC midnight, per the spec) —
    // the formatter renders it rather than inventing a rejection; the
    // form's required + min/max gates own the rest. Only UNPARSEABLE
    // input yields "".
    expect(toDatetimeLocalValue("2031-03-15")).toMatch(/^2031-03-1[45]T/);
  });
});

// ---------------------------------------------------------------------------
// S127/CB2 — the date-only input twins, promoted to shared date.ts atoms
// (the BX3 doctrine for the date-only family): tasks shipped the local-
// noon pair as view-local helpers while assignments submitted the RAW
// yyyy-mm-dd (the server stores a UTC-midnight instant — a one-day drift
// in every UTC-negative zone) and edit-populated via the UTC slice. One
// source now serves tasks, assignments, and the holidays dialog.
// ---------------------------------------------------------------------------
describe("S127/CB2 · the date-only input twins (the local-noon round-trip)", () => {
  it("fromDueDateInput produces the local-noon ISO instant from yyyy-mm-dd", () => {
    // The expected wire form is computed in the TEST's zone — the same
    // zone the browser serializes in (the runner and browser share the
    // host clock): noon local, anchored to UTC by toISOString.
    expect(fromDueDateInput("2031-03-15")).toBe(
      new Date("2031-03-15T12:00:00").toISOString(),
    );
  });

  it("fromDueDateInput maps the cleared input to the empty string", () => {
    expect(fromDueDateInput("")).toBe("");
  });

  it("toDateInputValue extracts the LOCAL wall-clock date — never the UTC slice", () => {
    // 03:00 LOCAL on Mar 15 is Mar 14 in UTC for any positive offset —
    // a .slice(0, 10) implementation returns 2031-03-14 here.
    const iso = new Date(2031, 2, 15, 3, 0).toISOString();
    expect(toDateInputValue(iso)).toBe("2031-03-15");
  });

  it("round-trips: toDateInputValue(fromDueDateInput(x)) === x", () => {
    expect(toDateInputValue(fromDueDateInput("2031-06-09"))).toBe("2031-06-09");
  });

  it("toDateInputValue maps null/invalid to the empty string", () => {
    expect(toDateInputValue(null)).toBe("");
    expect(toDateInputValue("garbage")).toBe("");
  });
});
