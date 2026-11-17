import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  SECURITY_FLOORS,
  parseResolvedVersions,
  parseSemverTriple,
  satisfiesFloor,
} from "@/lib/security-floor";

// The S202/EZ security-floor seam: the dependency-security floor pins.
// The dep-audit envelope (the S30 seam) probes the SHIPPED surface (the
// standalone trace); this gate pins the LOCKFILE — every resolved
// occurrence of a floored package must satisfy its floor. The two REAL
// pins at the bottom are the cycle's honest RED → GREEN: they failed
// against next@16.4.2 / zod@4.6.5 before the upgrade and pass on the
// floored tree (next@16.4.6 / zod@4.6.7).

// A bun.lock fragment carrying the shapes the parser must discriminate:
// array entries (resolved versions) vs workspaces manifest-range lines
// (string entries) vs the prefix trap (next vs eslint-config-next).
const LOCK_FRAGMENT = [
  "{",
  '  "lockfileVersion": 1,',
  '  "workspaces": {',
  '    "": {',
  '      "name": "omni-study",',
  '      "dependencies": {',
  '        "next": "^16.4.2",',
  '        "zod": "^4.6.5",',
  "      },",
  "    },",
  "  },",
  '  "packages": {',
  '    "next": ["next@16.4.6", "", {}, "sha512-…"],',
  '    "eslint-config-next": ["eslint-config-next@16.4.2", "", {}, "sha512-…"],',
  '    "@prisma/client": ["@prisma/client@6.11.1", "", {}, "sha512-…"],',
  '    "zod": ["zod@4.6.7", "", {}, "sha512-…"],',
  "  },",
  "}",
  "",
].join("\n");

describe("parseResolvedVersions", () => {
  it("parses a plain package's resolved version from the array entry", () => {
    expect(parseResolvedVersions(LOCK_FRAGMENT, "next")).toEqual(["16.4.6"]);
  });

  it("parses a scoped package's resolved version", () => {
    expect(parseResolvedVersions(LOCK_FRAGMENT, "@prisma/client")).toEqual(["6.11.1"]);
  });

  it("returns [] for an absent package (no matches, never undefined)", () => {
    expect(parseResolvedVersions(LOCK_FRAGMENT, "quill-delta")).toEqual([]);
  });

  it("never matches a longer key ending in the probe name (next ≠ eslint-config-next)", () => {
    // The prefix trap: the array head must carry the FULL package name,
    // so the eslint-config-next entry cannot satisfy a `next` probe.
    expect(parseResolvedVersions(LOCK_FRAGMENT, "next")).toEqual(["16.4.6"]);
    expect(parseResolvedVersions(LOCK_FRAGMENT, "eslint-config-next")).toEqual(["16.4.2"]);
  });

  it("never matches the workspaces manifest-range lines (string entries, not arrays)", () => {
    // The workspaces section lists "next": "^16.4.2" — a RANGE string,
    // not a resolved array. The parser must return the packages
    // section's resolution, never the caret range.
    expect(parseResolvedVersions(LOCK_FRAGMENT, "next")).not.toContain("^16.4.2");
    expect(parseResolvedVersions(LOCK_FRAGMENT, "zod")).toEqual(["4.6.7"]);
  });
});

describe("satisfiesFloor / parseSemverTriple", () => {
  it("satisfies above the floor", () => {
    expect(satisfiesFloor("16.4.6", "16.4.5")).toBe(true);
    expect(satisfiesFloor("4.6.7", "4.6.6")).toBe(true);
  });

  it("satisfies AT the floor (the floor itself satisfies)", () => {
    expect(satisfiesFloor("16.4.5", "16.4.5")).toBe(true);
    expect(satisfiesFloor("4.6.6", "4.6.6")).toBe(true);
  });

  it("fails below the floor", () => {
    expect(satisfiesFloor("16.4.2", "16.4.5")).toBe(false);
    expect(satisfiesFloor("4.6.5", "4.6.6")).toBe(false);
    expect(satisfiesFloor("16.3.9", "16.4.5")).toBe(false);
  });

  it("fails closed on null/unparseable segments (the honest-RED shape)", () => {
    expect(parseSemverTriple("2.0.0-rc.5")).toBeNull(); // prerelease suffix
    expect(parseSemverTriple("16.4")).toBeNull(); // not a triple
    expect(parseSemverTriple("latest")).toBeNull(); // a tag, not a version
    expect(satisfiesFloor("2.0.0-rc.5", "2.0.0")).toBe(false);
    expect(satisfiesFloor("unparseable", "16.4.5")).toBe(false);
  });
});

describe("the real bun.lock floor pins (S202/EZ)", () => {
  const lockText = readFileSync(path.join(__dirname, "..", "bun.lock"), "utf8");

  it("every resolved next in bun.lock satisfies >= 16.4.5 (GHSA-mfr8-8qww-v76h)", () => {
    const versions = parseResolvedVersions(lockText, "next");
    // At least one resolution must exist (an absent dependency cannot
    // hide behind the empty list), and every occurrence must satisfy.
    expect(versions.length).toBeGreaterThan(0);
    for (const v of versions) {
      expect(
        satisfiesFloor(v, SECURITY_FLOORS.next),
        `next@${v} is below the security floor ${SECURITY_FLOORS.next} (GHSA-mfr8-8qww-v76h) — run: bun add next@^16.4.5`,
      ).toBe(true);
    }
  });

  it("every resolved zod in bun.lock satisfies >= 4.6.6 (GHSA-mrhx-c7xc-m3w5)", () => {
    const versions = parseResolvedVersions(lockText, "zod");
    expect(versions.length).toBeGreaterThan(0);
    for (const v of versions) {
      expect(
        satisfiesFloor(v, SECURITY_FLOORS.zod),
        `zod@${v} is below the security floor ${SECURITY_FLOORS.zod} (GHSA-mrhx-c7xc-m3w5) — run: bun add zod@^4.6.6`,
      ).toBe(true);
    }
  });
});
