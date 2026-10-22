import { describe, expect, it } from "vitest";
import { sentKeysPatch } from "@/lib/server/entities";

// The sentKeysPatch contract (S81/AH8 → S82/AI1 → S84/AK4): a partial
// PATCH writes only the keys the caller ACTUALLY sent. The failure class
// this guards: a zod `.default()` MATERIALIZES a key into `parsed` that
// the caller never sent — writing the full parsed object then silently
// overwrites stored data with the default (the AH8 data-loss bug, caught
// live when the exam delegate's schema gained `.default(null)` and every
// rename cleared its parent). The e2e round-trips cover the convention
// end-to-end; this table pins the helper's own seam directly.

describe("sentKeysPatch", () => {
  it("writes a sent key", () => {
    expect(sentKeysPatch({ name: "new" }, { name: "new", parentId: null })).toEqual({
      name: "new",
    });
  });

  it("writes multiple sent keys and drops unsent ones", () => {
    expect(sentKeysPatch({ name: "a", parentId: "p" }, { name: "a", parentId: "p" })).toEqual({
      name: "a",
      parentId: "p",
    });
    expect(sentKeysPatch({ name: "a" }, { name: "a", parentId: "p2" })).toEqual({ name: "a" });
  });

  it("does NOT write a materialized default the caller never sent (the AH8 class)", () => {
    // parsed.parentId materialized from `.default(null)`; input omits it.
    expect(sentKeysPatch({ name: "renamed" }, { name: "renamed", parentId: null })).toEqual({
      name: "renamed",
    });
  });

  it("treats an explicitly-sent null as a sent key (re-rooting)", () => {
    expect(sentKeysPatch({ parentId: null }, { name: "kept", parentId: null })).toEqual({
      parentId: null,
    });
  });

  it("treats an explicitly-sent empty string as a sent key (schemas may transform)", () => {
    // The folder schema transforms "" → null AFTER validation; the helper
    // is upstream of transform semantics — it only filters sent-ness.
    expect(sentKeysPatch({ name: "" }, { name: "" })).toEqual({ name: "" });
  });

  it("skips keys whose input value is undefined (JSON never sends undefined)", () => {
    expect(sentKeysPatch({ name: undefined, parentId: "p" }, { name: "d", parentId: "p" })).toEqual(
      { parentId: "p" },
    );
  });

  it("drops sent keys that did not survive schema validation", () => {
    // S82/AI5: unknown keys are stripped by zod before parsed — the
    // intersection with parsed keeps them out of the write.
    expect(
      sentKeysPatch({ name: "n", evil: "x" } as Record<string, unknown>, { name: "n" }),
    ).toEqual({ name: "n" });
  });

  it("returns an empty write for an empty input object", () => {
    expect(sentKeysPatch({}, { name: "d", parentId: null })).toEqual({});
  });

  it("returns an empty write for null/undefined input", () => {
    expect(sentKeysPatch(null, { name: "d" })).toEqual({});
    expect(sentKeysPatch(undefined, { name: "d" })).toEqual({});
  });

  it("returns an empty write when parsed is empty (nothing validated)", () => {
    expect(sentKeysPatch({ name: "n" }, {})).toEqual({});
  });
});
