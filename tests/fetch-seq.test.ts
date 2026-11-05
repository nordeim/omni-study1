// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";

import { createFetchSeq } from "@/lib/fetch-seq";

// S143/CR5 (audit A-L3): the S142/CQ7 appearance-pickers' rollback guard
// compared VALUES ("store still equals the failed next"), citing the
// fetchSeq idiom — but fetchSeq compares a REQUEST SEQUENCE, not a
// value. The same-value ABA: pick(A) at t0 (PATCH1 in flight), pick(A)
// again at t1, PATCH1 fails at t2 → the store holds A === next → the
// guard rolls back to prev, clobbering the second pick's optimism while
// its PATCH (presumably) succeeds — store/server diverge until reload.
// The fix is the true idiom: per-field sequence tickets. This file pins
// the pure seam's semantics directly (the picker call sites carry the
// script-conventions census markers).

describe("createFetchSeq (S143/CR5 — the sequence-ticket CAS)", () => {
  it("begin() returns monotonically increasing tickets", () => {
    const seq = createFetchSeq();
    const a = seq.begin();
    const b = seq.begin();
    const c = seq.begin();
    expect(a).toBeLessThan(b);
    expect(b).toBeLessThan(c);
  });

  it("isCurrent is true for the latest ticket and false for every earlier one", () => {
    const seq = createFetchSeq();
    const first = seq.begin();
    expect(seq.isCurrent(first)).toBe(true);
    const second = seq.begin();
    expect(seq.isCurrent(first)).toBe(false);
    expect(seq.isCurrent(second)).toBe(true);
  });

  it("the same-value re-pick mints a NEW ticket (the ABA closed — the value never enters the comparison)", () => {
    const seq = createFetchSeq();
    const first = seq.begin(); // pick(A) — PATCH1 in flight
    const second = seq.begin(); // pick(A) again — same VALUE, new request
    // PATCH1 fails late: its ticket is stale → NO rollback over the
    // second pick's optimism (the exact pre-fix ABA this seam closes).
    expect(seq.isCurrent(first)).toBe(false);
    expect(seq.isCurrent(second)).toBe(true);
  });

  it("interleaved guards are independent (per-field tickets — theme/accent/avatar)", () => {
    const themeSeq = createFetchSeq();
    const accentSeq = createFetchSeq();
    const themePick = themeSeq.begin();
    const accentPick = accentSeq.begin();
    expect(themeSeq.isCurrent(themePick)).toBe(true);
    expect(accentSeq.isCurrent(accentPick)).toBe(true);
    // A newer THEME pick must not stale the ACCENT ticket.
    themeSeq.begin();
    expect(themeSeq.isCurrent(themePick)).toBe(false);
    expect(accentSeq.isCurrent(accentPick)).toBe(true);
  });
});
