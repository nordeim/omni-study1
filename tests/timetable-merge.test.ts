// S122/BW7 — the timetable single-leg ordering merge.
//
// BU22 shipped the end≥start ordering guard for EVENTS (create shape +
// both-legs update + the BV1 single-leg merge against the stored row); the
// timetable classes had no guard at all — `startTime: "10:00", endTime:
// "09:00"` persisted verbatim on create AND on PATCH. Zero-padded hhmm
// strings compare lexicographically, so the guard is a plain string
// comparison (no Date.parse needed — no offsets exist in hhmm atoms).
//
// This file pins both layers, mirroring tests/event-merge.test.ts:
// the pure checkTimetableOrderingMerge seam (the single-leg PATCH vs the
// stored row) and the schema shapes (create + both-legs update).
import { describe, expect, it } from "vitest";

import { checkTimetableOrderingMerge } from "@/lib/server/entities";
import { timetableClassCreateSchema, timetableClassUpdateSchema } from "@/lib/validation";

const END_BEFORE_START = "End time must be after the start time";

describe("checkTimetableOrderingMerge (S122/BW7 — the single-leg PATCH guard)", () => {
  it("an endTime-only PATCH earlier than the stored startTime is rejected", () => {
    const existing = { startTime: "09:00", endTime: "10:00" };
    expect(() => checkTimetableOrderingMerge(existing, { endTime: "08:00" })).toThrowError(
      END_BEFORE_START,
    );
  });

  it("a startTime-only PATCH later than the stored endTime is rejected", () => {
    const existing = { startTime: "09:00", endTime: "10:00" };
    expect(() => checkTimetableOrderingMerge(existing, { startTime: "12:00" })).toThrowError(
      END_BEFORE_START,
    );
  });

  it("a legal endTime-only move past the stored startTime passes", () => {
    const existing = { startTime: "09:00", endTime: "10:00" };
    expect(() => checkTimetableOrderingMerge(existing, { endTime: "11:00" })).not.toThrow();
  });

  it("a legal startTime-only move before the stored endTime passes", () => {
    const existing = { startTime: "09:00", endTime: "10:00" };
    expect(() => checkTimetableOrderingMerge(existing, { startTime: "08:00" })).not.toThrow();
  });

  it("a write touching neither leg never throws", () => {
    const existing = { startTime: "09:00", endTime: "10:00" };
    expect(() => checkTimetableOrderingMerge(existing, { name: "Renamed" })).not.toThrow();
  });

  it("both legs arriving together pass through (the update schema's both-legs check owns that case)", () => {
    const existing = { startTime: "09:00", endTime: "10:00" };
    // Both-legs inversions are the UPDATE SCHEMA's contract, not the
    // merge's — the merge must not double-throw or interfere.
    expect(() => checkTimetableOrderingMerge(existing, { startTime: "11:00", endTime: "10:30" })).not.toThrow();
  });

  it("a stored row with a missing leg never throws (legacy defense)", () => {
    // The write needs the STORED row's other leg for the comparison — a
    // stored row missing that leg skips (a sends-endTime PATCH against a
    // row with no startTime). Note the mirror case (stored startTime,
    // sent endTime) IS a legal comparison — it throws on inversion.
    const existing = { endTime: "10:00" } as Record<string, unknown>;
    expect(() => checkTimetableOrderingMerge(existing, { endTime: "08:00" })).not.toThrow();
  });

  it("equal legs are legal (a zero-length class is not an inversion)", () => {
    const existing = { startTime: "09:00", endTime: "10:00" };
    expect(() => checkTimetableOrderingMerge(existing, { endTime: "09:00" })).not.toThrow();
  });

  // The live-probe catch (the BV1 Date-fixture lesson, the hhmm form): the
  // SEED writes unpadded hours ("9:00" — Prisma directly, past the Zod
  // boundary), and a raw string compare would read "11:00" < "9:00" —
  // rejecting every legal move against a legacy row. Minutes-normalized.
  it("an UNPADDED legacy stored leg compares by minutes, not lexicographically", () => {
    const existing = { startTime: "9:00", endTime: "10:30" };
    expect(() => checkTimetableOrderingMerge(existing, { endTime: "11:00" })).not.toThrow();
    expect(() => checkTimetableOrderingMerge(existing, { endTime: "08:00" })).toThrowError(
      END_BEFORE_START,
    );
  });

  it("a malformed legacy leg skips the comparison entirely", () => {
    const existing = { startTime: "not-a-time", endTime: "10:00" };
    expect(() => checkTimetableOrderingMerge(existing, { endTime: "08:00" })).not.toThrow();
  });
});

describe("the timetable schema ordering checks (S122/BW7)", () => {
  const base = {
    name: "BW7 probe",
    dayOfWeek: 1,
    subjectId: null,
    room: "",
    weekType: "ALL" as const,
  };

  it("the create schema rejects endTime before startTime", () => {
    const res = timetableClassCreateSchema.safeParse({ ...base, startTime: "10:00", endTime: "09:00" });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues.some((i) => i.message === END_BEFORE_START)).toBe(true);
    }
  });

  it("the create schema accepts a legal span", () => {
    const res = timetableClassCreateSchema.safeParse({ ...base, startTime: "09:00", endTime: "10:00" });
    expect(res.success).toBe(true);
  });

  it("the update schema rejects an inverted both-legs PATCH", () => {
    const res = timetableClassUpdateSchema.safeParse({ startTime: "10:00", endTime: "09:00" });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues.some((i) => i.message === END_BEFORE_START)).toBe(true);
    }
  });

  it("the update schema accepts a legal both-legs PATCH and single legs", () => {
    expect(timetableClassUpdateSchema.safeParse({ startTime: "08:00", endTime: "09:00" }).success).toBe(true);
    expect(timetableClassUpdateSchema.safeParse({ endTime: "11:00" }).success).toBe(true);
    expect(timetableClassUpdateSchema.safeParse({ name: "Renamed" }).success).toBe(true);
  });
});
