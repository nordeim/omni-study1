import { describe, expect, it } from "vitest";
import { normalizeMembers } from "@/lib/group-members";

// The normalizeMembers contract (S85/AL1): the API boundary ships `members`
// as an ARRAY (membersFromRow); the pre-seam parseMembers JSON.parsed that
// array into a throw and returned [] — every group rendered "0 members",
// addMember wiped the existing members, and the edit-dialog save wiped them
// too. This table pins the seam's every shape: the array the API ships, the
// legacy JSON string the column stores, and the malformed edges.

describe("normalizeMembers", () => {
  it("validates the API's ARRAY shape (the shipped boundary)", () => {
    expect(
      normalizeMembers([
        { name: "Ari", email: "ari@example.com" },
        { name: "Sam", email: "sam@example.com" },
      ]),
    ).toEqual([
      { name: "Ari", email: "ari@example.com" },
      { name: "Sam", email: "sam@example.com" },
    ]);
  });

  it("tolerates the legacy JSON-STRING shape (the column's own storage form)", () => {
    expect(
      normalizeMembers('[{"name":"Ari","email":"ari@example.com"}]'),
    ).toEqual([{ name: "Ari", email: "ari@example.com" }]);
  });

  it("an empty array stays empty (the fresh-group zero state)", () => {
    expect(normalizeMembers([])).toEqual([]);
  });

  it("an empty/absent/whitespace-only members value drops to []", () => {
    expect(normalizeMembers(undefined)).toEqual([]);
    expect(normalizeMembers(null)).toEqual([]);
    expect(normalizeMembers("")).toEqual([]);
    expect(normalizeMembers("   ")).toEqual([]);
  });

  it("corrupt JSON string drops to [] (never throws to the view)", () => {
    expect(normalizeMembers("[object Object]")).toEqual([]);
    expect(normalizeMembers('{"name":"not-an-array"}')).toEqual([]);
  });

  it("drops malformed items individually (the valid ones survive)", () => {
    expect(
      normalizeMembers([
        { name: "Ari", email: "ari@example.com" },
        { name: "", email: "x@example.com" }, // blank name drops
        { name: "No Email" }, // missing email drops
        { email: "no-name@example.com" }, // missing name drops
        "garbage", // non-object drops
        null, // null drops
      ]),
    ).toEqual([{ name: "Ari", email: "ari@example.com" }]);
  });

  it("a non-array non-string value drops to []", () => {
    expect(normalizeMembers({ name: "Ari", email: "a@b.c" })).toEqual([]);
    expect(normalizeMembers(42)).toEqual([]);
  });
});
