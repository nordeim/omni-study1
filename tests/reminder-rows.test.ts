// S176/DZ1 — the reminder-rows seam (the s176 reference probe: the
// reference's event-dialog reminders control is a REPEATING-ROWS shape —
// a number input (min=1, w-20) + a unit select (minutes/hours/days) per
// row + an "Add" button that appends a new row (the measured 30-minutes
// default) — while the clone shipped three toggle chips [15/30/60]. The
// EVENT MODEL is untouched: reminders stays the minutes JSON array on
// the wire (EventInput.reminders — the API/import surfaces unchanged);
// this seam owns the row↔minutes conversion the dialog needs.
//
// The largest-clean-unit derivation is the DISPLAY heuristic: 1440 →
// "1 day", 120 → "2 hours", 90 → "90 minutes" — every minutes value
// round-trips (minutesToRows → rowsToMinutes is the identity on the
// filtered/sorted domain).
import { describe, expect, it } from "vitest";
import {
  minutesToRow,
  minutesToRows,
  rowToMinutes,
  rowsToMinutes,
} from "../src/lib/reminder-rows";

describe("rowToMinutes (S176/DZ1 — the unit factors)", () => {
  it("minutes/hours/days map 1/60/1440", () => {
    expect(rowToMinutes({ value: 20, unit: "minutes" })).toBe(20);
    expect(rowToMinutes({ value: 2, unit: "hours" })).toBe(120);
    expect(rowToMinutes({ value: 1, unit: "days" })).toBe(1440);
  });

  it("non-positive/non-finite row values never produce a reminder (the defensive filter)", () => {
    expect(rowToMinutes({ value: 0, unit: "minutes" })).toBe(0);
    expect(rowToMinutes({ value: -5, unit: "hours" })).toBe(-300);
    // The caller filters: rowsToMinutes is the guarded surface.
    expect(rowsToMinutes([
      { value: 0, unit: "minutes" },
      { value: 15, unit: "minutes" },
      { value: -5, unit: "hours" },
      { value: Number.NaN, unit: "minutes" },
    ])).toEqual([15]);
  });
});

describe("minutesToRow (S176/DZ1 — the largest-clean-unit derivation)", () => {
  it("1440 → 1 day; 2880 → 2 days", () => {
    expect(minutesToRow(1440)).toEqual({ value: 1, unit: "days" });
    expect(minutesToRow(2880)).toEqual({ value: 2, unit: "days" });
  });

  it("multiples of 60 (below a day) → hours; everything else stays minutes", () => {
    expect(minutesToRow(120)).toEqual({ value: 2, unit: "hours" });
    expect(minutesToRow(60)).toEqual({ value: 1, unit: "hours" });
    expect(minutesToRow(90)).toEqual({ value: 90, unit: "minutes" });
    expect(minutesToRow(15)).toEqual({ value: 15, unit: "minutes" });
  });
});

describe("the rows↔minutes round-trip (S176/DZ1 — the identity contract)", () => {
  it("minutesToRows preserves the stored order; rowsToMinutes returns the sorted identity", () => {
    // The wire's stored array is ascending (rowsToMinutes sorts on every
    // write, the seed's "[15,60]" idiom), so the display rows come back
    // in that order — the map itself never re-sorts.
    const minutes = [15, 20, 120, 1440];
    const rows = minutesToRows(minutes);
    expect(rows).toEqual([
      { value: 15, unit: "minutes" },
      { value: 20, unit: "minutes" },
      { value: 2, unit: "hours" },
      { value: 1, unit: "days" },
    ]);
    expect(rowsToMinutes(rows)).toEqual(minutes);
    // An UNsorted input round-trips to the sorted identity (the write
    // side owns the canonical order).
    expect(rowsToMinutes(minutesToRows([1440, 15, 120, 20]))).toEqual(minutes);
  });

  it("duplicate minutes collapse at the WRITE side (two rows that resolve to the same minutes are one reminder)", () => {
    expect(rowsToMinutes([
      { value: 120, unit: "minutes" },
      { value: 2, unit: "hours" },
    ])).toEqual([120]);
    // The display side is a pure map (a saved array never carries
    // duplicates — the write side deduped it); a programmatic duplicate
    // input maps 1:1 and the next write collapses it.
    expect(minutesToRows([60, 60])).toEqual([
      { value: 1, unit: "hours" },
      { value: 1, unit: "hours" },
    ]);
  });
});
