// ---------------------------------------------------------------------------
// Local-time date math and formatters. Pure — unit-pinned by tests/date.test.ts.
// Conventions (AGENTS.md): local-time semantics; TimetableClass.dayOfWeek is
// ISO-minus-one (0=Monday … 6=Sunday); the calendar month grid is SUNDAY-first
// (S9-E, reference-measured).
// ---------------------------------------------------------------------------

export const CALENDAR_WEEKDAYS = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
] as const;

/** ISO weekday: Monday = 0 … Sunday = 6. */
export function isoWeekday(date: Date): number {
  return (date.getDay() + 6) % 7;
}

/** Zero the clock (local midnight). */
export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/** Add months, clamping to the first of the resulting month (Oct 31 +1 → Nov 1). */
export function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

/** ISO 8601 calendar week (the Events panel's CW label). */
export function isoWeekNumber(date: Date): number {
  const d = startOfDay(date);
  // Thursday of this ISO week decides the year.
  d.setDate(d.getDate() - isoWeekday(d) + 3);
  const week1 = new Date(d.getFullYear(), 0, 4);
  // Week 1's Monday:
  week1.setDate(week1.getDate() - isoWeekday(week1));
  return Math.round((d.getTime() - week1.getTime()) / (7 * 86_400_000)) + 1;
}

/**
 * The reference's calendar-week convention (the Events panel's "CW <n>"):
 * US week-of-year — weeks start SUNDAY and week 1 is the week containing
 * Jan 1 of the date's own year. Measured on the live reference
 * (session-63): Sunday 2026-10-18 rendered "CW 43" (ISO says 42) and the
 * carousel's Saturday 2026-10-17 rendered "CW 42" — only this rule
 * produces both values. The Events panel must use THIS, not
 * {@link isoWeekNumber}; mid-week the two agree, across a Sunday they
 * drift by one.
 */
export function referenceWeekNumber(date: Date): number {
  const d = startOfDay(date);
  // This week's Sunday (getDay(): 0 = Sunday).
  const weekStart = addDays(d, -d.getDay());
  const jan1 = new Date(d.getFullYear(), 0, 1);
  // Week 1's Sunday (the Sunday on or before Jan 1).
  const week1Start = addDays(startOfDay(jan1), -jan1.getDay());
  return Math.round((weekStart.getTime() - week1Start.getTime()) / (7 * 86_400_000)) + 1;
}

export type MonthCell = { date: Date; inMonth: boolean };

/**
 * Sunday-first month grid (S9-E): leads with the first week's Sunday and
 * sizes dynamically — 35 cells for five-week months, 42 when the month
 * spills past five weeks (October 2026 → 35 cells starting Sep 27).
 */
export function monthGrid(year: number, month: number): MonthCell[] {
  const first = new Date(year, month, 1);
  const lead = first.getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks = Math.ceil((lead + daysInMonth) / 7);
  const cells: MonthCell[] = [];
  for (let i = 0; i < weeks * 7; i++) {
    const date = new Date(year, month, 1 - lead + i);
    cells.push({ date, inMonth: date.getMonth() === month });
  }
  return cells;
}

const LONG_DATE = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});
const LONG_DATE_WITH_WEEKDAY = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});
const SHORT_DATE = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
});


/** "Friday, October 17, 2026" — the dashboard date (S4-I pin: weekday kept). */
export function formatLongDateWithWeekday(date: Date): string {
  return LONG_DATE_WITH_WEEKDAY.format(date);
}

const WEEKDAY_MONTH_DAY = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
});

/** "Friday, October 17" — the MyDay subtitle (no year, S4-D pin). */
export function formatWeekdayMonthDay(date: Date): string {
  return WEEKDAY_MONTH_DAY.format(date);
}

/** "October 6, 2026" */
export function formatLongDate(date: Date): string {
  return LONG_DATE.format(date);
}

/** "Tue, Oct 6" */
export function formatShortWithYear(date: Date): string {
  return SHORT_DATE.format(date);
}

/** 12-hour clock, padded hour + minutes — "03:43 AM" (the reference clock). */
export function formatTime12h(date: Date): string {
  let hours = date.getHours() % 12;
  if (hours === 0) hours = 12;
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours.toString().padStart(2, "0")}:${minutes} ${date.getHours() < 12 ? "AM" : "PM"}`;
}

/** "45m" | "1h" | "2h 15m" */
export function formatMinutes(totalMinutes: number): string {
  const m = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(m / 60);
  const minutes = m % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

/**
 * Month-hours for the dashboard Focus Time stat (S4-K, measured s68): the
 * reference renders "0h" + hint "this month" — whole hours with one
 * fractional decimal, trailing ".0" trimmed. Only the zero state is
 * reference-verifiable; the fractional format is the documented
 * interpolation (see tests/date.test.ts).
 */
export function formatFocusHours(totalMinutes: number): string {
  const h = Math.max(0, totalMinutes) / 60;
  const rounded = Math.round(h * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}h`;
}

/** Calendar-month equality (the Focus Time stat's month scope). */
export function isSameMonth(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
  );
}

/** Whole-day difference (negative in the past) between two calendar days. */
export function daysUntil(date: Date, from: Date): number {
  return Math.round(
    (startOfDay(date).getTime() - startOfDay(from).getTime()) / 86_400_000,
  );
}

/** "Today" | "Tomorrow" | the weekday-inclusive long date. */
export function dayBucketLabel(date: Date, today: Date): string {
  const diff = daysUntil(date, today);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return LONG_DATE_WITH_WEEKDAY.format(date);
}

/** "09:00" → 540; rejects "9:5", "24:00", "09:60", "". */
export function parseHHMM(value: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/** 540 → "09:00" */
export function minutesToHHMM(totalMinutes: number): string {
  const m = Math.min(1439, Math.max(0, Math.round(totalMinutes)));
  return `${Math.floor(m / 60).toString().padStart(2, "0")}:${(m % 60).toString().padStart(2, "0")}`;
}

/** The span between two HH:MM stamps — "1h 30m"; reversed clamps to "0m". */
export function formatHHMMRange(start: string, end: string): string {
  const a = parseHHMM(start);
  const b = parseHHMM(end);
  if (a === null || b === null) return "";
  return formatMinutes(Math.max(0, b - a));
}
