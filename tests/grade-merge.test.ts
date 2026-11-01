// S125/BZ6 — the grade range merge (the events BV1 pattern on the
// score/maxScore pair, with one structural difference the events family
// could not have): the UPDATE path owns NO schema-side .check(), because
// zod4's .partial() injects gradeSchema's `maxScore` default (100) into
// every parsed payload — a schema-side compare would read the injected
// denominator instead of the stored one, and the sent-keys filter (which
// drops the injected key before the write) runs AFTER parse, outside the
// schema's reach. So THIS seam owns every combination: one unified compare
// over the EFFECTIVE pair (sent leg wins, stored leg fills), covering
// both-legs-sent, score-only, and maxScore-only in the same comparison —
// the BX1 "normalized at EVERY enforcement site" doctrine.
import { describe, expect, it } from "vitest";

import { checkGradeRangeMerge } from "@/lib/server/entities";
import { GRADE_SCORE_ABOVE_MAX } from "@/lib/validation";

describe("checkGradeRangeMerge (S125/BZ6 — the effective-pair compare)", () => {
  it("a score-only PATCH above the stored maxScore is rejected", () => {
    const existing = { title: "Midterm", score: 85, maxScore: 100 };
    expect(() => checkGradeRangeMerge(existing, { score: 900 })).toThrowError(
      GRADE_SCORE_ABOVE_MAX,
    );
  });

  it("a maxScore-only PATCH below the stored score is rejected", () => {
    const existing = { title: "Midterm", score: 85, maxScore: 100 };
    expect(() => checkGradeRangeMerge(existing, { maxScore: 50 })).toThrowError(
      GRADE_SCORE_ABOVE_MAX,
    );
  });

  it("both legs arriving inverted together are rejected (the merge owns the both-sent case for grades — the schema cannot)", () => {
    const existing = { title: "Midterm", score: 85, maxScore: 100 };
    expect(() => checkGradeRangeMerge(existing, { score: 900, maxScore: 100 })).toThrowError(
      GRADE_SCORE_ABOVE_MAX,
    );
  });

  it("a legal single-leg score PATCH passes (the stored denominator is the honest one)", () => {
    const existing = { title: "Midterm", score: 85, maxScore: 1000 };
    expect(() => checkGradeRangeMerge(existing, { score: 900 })).not.toThrow();
  });

  it("a legal both-legs PATCH passes", () => {
    const existing = { title: "Midterm", score: 85, maxScore: 100 };
    expect(() => checkGradeRangeMerge(existing, { score: 900, maxScore: 1000 })).not.toThrow();
  });

  it("neither leg is a no-op (a title-only PATCH never throws)", () => {
    const existing = { title: "Midterm", score: 85, maxScore: 100 };
    expect(() => checkGradeRangeMerge(existing, { title: "Renamed" })).not.toThrow();
  });

  it("a non-numeric stored leg skips (the legacy-seed defense — the BW7 hhmm lesson)", () => {
    // The stored score is a legacy string and the SENT leg is maxScore, so
    // the effective pair falls back to the stored string leg — the guard
    // skips rather than comparing "85" against 50.
    const existing = { title: "Legacy", score: "85", maxScore: 100 };
    expect(() => checkGradeRangeMerge(existing, { maxScore: 50 })).not.toThrow();
  });
});
