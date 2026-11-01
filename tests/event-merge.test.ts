// S121/BV1 + BV10 — the events single-leg ordering merge.
//
// BU22 shipped the end≥start ordering guard on the CREATE shape and on the
// both-legs-arrive UPDATE shape — but a single-leg PATCH (`{"endDate": …}`
// alone) validated against nothing: the delegate wrote the leg verbatim and
// an inverted span persisted (the validation.ts comment even documented a
// "merge with the stored row" that no code implemented). This seam is that
// merge: when exactly ONE of the two legs is in the writes, it is compared
// against the STORED row's other leg — an inversion throws the same
// END_BEFORE_START ValidationError the schema shapes throw.
//
// BV10 rides the same change: the comparisons use Date.parse values, never
// raw string ordering — mixed-offset ISO forms ("…T10:00:00+14:00" is
// EARLIER than "…T09:00:00Z" despite sorting later lexicographically) evade
// a string compare.
import { describe, expect, it } from "vitest";

import { checkEventOrderingMerge } from "@/lib/server/entities";
import { eventCreateSchema, eventUpdateSchema } from "@/lib/validation";

const END_BEFORE_START = "End date must be after the start date";

describe("checkEventOrderingMerge (S121/BV1 — the single-leg PATCH guard)", () => {
  it("an endDate-only PATCH earlier than the stored startDate is rejected", () => {
    const existing = { startDate: "2026-11-01T09:00:00", endDate: "2026-11-01T10:00:00" };
    expect(() => checkEventOrderingMerge(existing, { endDate: "2026-11-01T08:00:00" })).toThrowError(
      END_BEFORE_START,
    );
  });

  it("a startDate-only PATCH later than the stored endDate is rejected", () => {
    const existing = { startDate: "2026-11-01T09:00:00", endDate: "2026-11-01T10:00:00" };
    expect(() => checkEventOrderingMerge(existing, { startDate: "2026-11-01T12:00:00" })).toThrowError(
      END_BEFORE_START,
    );
  });

  it("a legal endDate-only move past the stored startDate passes", () => {
    const existing = { startDate: "2026-11-01T09:00:00", endDate: "2026-11-01T10:00:00" };
    expect(() => checkEventOrderingMerge(existing, { endDate: "2026-11-01T11:00:00" })).not.toThrow();
  });

  it("a legal startDate-only move before the stored endDate passes", () => {
    const existing = { startDate: "2026-11-01T09:00:00", endDate: "2026-11-01T10:00:00" };
    expect(() => checkEventOrderingMerge(existing, { startDate: "2026-11-01T08:00:00" })).not.toThrow();
  });

  it("a single leg that only touches other fields never throws", () => {
    const existing = { startDate: "2026-11-01T09:00:00", endDate: "2026-11-01T10:00:00" };
    expect(() => checkEventOrderingMerge(existing, { title: "Renamed" })).not.toThrow();
  });

  it("an explicit null leg clears without throwing (the three-state clear)", () => {
    const existing = { startDate: "2026-11-01T09:00:00", endDate: "2026-11-01T10:00:00" };
    expect(() => checkEventOrderingMerge(existing, { endDate: null })).not.toThrow();
  });

  it("both legs arriving together pass through (the schema's both-legs check owns that case)", () => {
    const existing = { startDate: "2026-11-01T09:00:00", endDate: "2026-11-01T10:00:00" };
    // Both-legs inversions are the UPDATE SCHEMA's contract, not the merge's —
    // the seam stays silent and the schema (pinned below) rejects.
    expect(() =>
      checkEventOrderingMerge(existing, { startDate: "2026-11-01T12:00:00", endDate: "2026-11-01T11:00:00" }),
    ).not.toThrow();
    expect(() => eventUpdateSchema.parse({ startDate: "2026-11-01T12:00:00", endDate: "2026-11-01T11:00:00" })).toThrowError(
      END_BEFORE_START,
    );
  });

  it("a Date-object stored row (the Prisma shape) is normalized and compared — the live-caught gap", () => {
    // The first live probe caught the string-only form silently skipping:
    // Prisma returns Date objects for the stored row, the write is a string.
    const existing = {
      startDate: new Date("2026-11-01T09:00:00Z"),
      endDate: new Date("2026-11-01T10:00:00Z"),
    };
    expect(() => checkEventOrderingMerge(existing, { endDate: "2026-11-01T08:00:00" })).toThrowError(
      END_BEFORE_START,
    );
    expect(() => checkEventOrderingMerge(existing, { startDate: "2026-11-01T12:00:00" })).toThrowError(
      END_BEFORE_START,
    );
    expect(() => checkEventOrderingMerge(existing, { endDate: "2026-11-01T11:00:00" })).not.toThrow();
  });

  it("BV10: a mixed-offset single leg that sorts LATER as a string but is EARLIER in time is rejected", () => {
    // "2026-11-01T10:00:00+14:00" == 2026-10-31T20:00:00Z — earlier than the
    // stored 09:00Z start, but lexicographically "10" > "09" (a pure string
    // compare passes it; Date.parse catches it).
    const existing = { startDate: "2026-11-01T09:00:00Z", endDate: "2026-11-01T10:00:00Z" };
    expect(() => checkEventOrderingMerge(existing, { endDate: "2026-11-01T10:00:00+14:00" })).toThrowError(
      END_BEFORE_START,
    );
  });
});

describe("the event schema ordering checks on Date.parse values (S121/BV10)", () => {
  it("BV10: the create schema rejects a mixed-offset inversion a string compare misses", () => {
    expect(() =>
      eventCreateSchema.parse({
        title: "Mixed offset probe",
        startDate: "2026-11-01T09:00:00Z",
        endDate: "2026-11-01T10:00:00+14:00",
      }),
    ).toThrowError(END_BEFORE_START);
  });

  it("BV10: the update schema's both-legs check compares parsed time, not strings", () => {
    expect(() =>
      eventUpdateSchema.parse({ startDate: "2026-11-01T09:00:00Z", endDate: "2026-11-01T10:00:00+14:00" }),
    ).toThrowError(END_BEFORE_START);
  });

  it("a legal mixed-offset span passes (the offset itself is never a rejection)", () => {
    expect(() =>
      eventCreateSchema.parse({
        title: "Legal mixed offset",
        startDate: "2026-11-01T01:00:00+08:00",
        endDate: "2026-11-01T09:00:00Z",
      }),
    ).not.toThrow();
  });
});
