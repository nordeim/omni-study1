// ---------------------------------------------------------------------------
// S176/DZ1 — the reminder-rows seam (the s176 reference probe: the
// reference's event-dialog reminders control is a REPEATING-ROWS shape —
// a number input (min=1, w-20) + a unit select (minutes/hours/days) per
// row + an "Add" button that appends a new row with the measured
// 30-minutes default; the clone shipped three toggle chips [15/30/60]).
// The EVENT MODEL is untouched: reminders stays the minutes JSON array
// on the wire (EventInput.reminders — the API/import surfaces
// unchanged). This seam owns the row↔minutes conversion the dialog
// needs, so the arithmetic is unit-pinned like every other pure seam
// (tests/reminder-rows.test.ts).
//
// The largest-clean-unit derivation is the DISPLAY heuristic for
// re-opening a saved event: 1440 renders as "1 day", 120 as "2 hours",
// 90 as "90 minutes". The derivation is lossless — every minutes value
// converts to a row and back to the same minutes (the round-trip
// identity the spec pins).
// ---------------------------------------------------------------------------

export type ReminderUnit = "minutes" | "hours" | "days";

export interface ReminderRow {
  value: number;
  unit: ReminderUnit;
}

const UNIT_FACTOR: Record<ReminderUnit, number> = {
  minutes: 1,
  hours: 60,
  days: 1440,
};

/** The minutes a row represents (`value ×` the unit's factor). */
export function rowToMinutes(row: ReminderRow): number {
  return row.value * UNIT_FACTOR[row.unit];
}

/**
 * The row that DISPLAYS `minutes` — the largest clean unit: whole days
 * first, then whole hours, else plain minutes. The unit's own factor is
 * exact, so the derivation is lossless for every positive integer.
 */
export function minutesToRow(minutes: number): ReminderRow {
  if (minutes >= UNIT_FACTOR.days && minutes % UNIT_FACTOR.days === 0) {
    return { value: minutes / UNIT_FACTOR.days, unit: "days" };
  }
  if (minutes >= UNIT_FACTOR.hours && minutes % UNIT_FACTOR.hours === 0) {
    return { value: minutes / UNIT_FACTOR.hours, unit: "hours" };
  }
  return { value: minutes, unit: "minutes" };
}

/** The display rows for a saved minutes array (order preserved). */
export function minutesToRows(minutes: number[]): ReminderRow[] {
  return minutes.map(minutesToRow);
}

/**
 * The minutes array a row list represents — the guarded write surface:
 * non-finite/non-positive rows are dropped (the dialog's inputs are
 * min=1, but a stale draft or a programmatic caller must never write a
 * non-positive reminder), then the values are deduped (two rows that
 * resolve to the same minutes are ONE reminder) and sorted ascending
 * (the wire's historical order — the seed's "[15,60]" idiom).
 */
export function rowsToMinutes(rows: ReminderRow[]): number[] {
  const seen = new Set<number>();
  for (const row of rows) {
    if (!Number.isFinite(row.value) || row.value <= 0) continue;
    seen.add(rowToMinutes(row));
  }
  return [...seen].sort((a, b) => a - b);
}
