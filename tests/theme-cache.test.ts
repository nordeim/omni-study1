import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

import {
  ACCENTS,
  accentCssVars,
  BOOT_TOKEN_SUFFIXES,
  THEME_BOOT_SCRIPT,
  THEME_CACHE_KEY,
  parseThemeCache,
  themeCachePayload,
} from "@/lib/theme";

// S11-1 — the localStorage cache contract between applyToDocument (the
// writer, src/lib/store.ts) and the pre-paint boot script (the reader,
// injected into <head> by layout.tsx). The script is a hand-maintained
// inline string that cannot import this module — THESE tests are the sync
// contract: change the payload shape here and the script must follow.

describe("theme cache payload", () => {
  it("serializes mode + accent as compact JSON", () => {
    expect(themeCachePayload("dark", "violet")).toBe('{"mode":"dark","accent":"violet"}');
    expect(themeCachePayload("system", "teal")).toBe('{"mode":"system","accent":"teal"}');
  });

  it("round-trips through parseThemeCache", () => {
    for (const mode of ["light", "dark", "system"] as const) {
      const parsed = parseThemeCache(themeCachePayload(mode, "blue"));
      expect(parsed).toEqual({ mode, accent: "blue" });
    }
  });
});

describe("parseThemeCache (the boot script's parse, pinned)", () => {
  it("accepts a valid payload", () => {
    expect(parseThemeCache('{"mode":"dark","accent":"red"}')).toEqual({ mode: "dark", accent: "red" });
  });

  it("returns null for null / empty / garbage", () => {
    expect(parseThemeCache(null)).toBeNull();
    expect(parseThemeCache("")).toBeNull();
    expect(parseThemeCache("not json")).toBeNull();
    expect(parseThemeCache("{")).toBeNull();
  });

  it("returns null for structurally valid JSON with invalid values", () => {
    expect(parseThemeCache('{"mode":"neon","accent":"violet"}')).toBeNull();
    expect(parseThemeCache('{"mode":"dark","accent":"chartreuse"}')).toBeNull();
    expect(parseThemeCache('{"accent":"violet"}')).toBeNull();
    expect(parseThemeCache("[]")).toBeNull();
    expect(parseThemeCache("42")).toBeNull();
  });
});

describe("THEME_CACHE_KEY", () => {
  it("is the key the boot script reads (sf-theme)", () => {
    // The boot script hardcodes the literal — this pin fails if the key
    // drifts, forcing the script string to be updated in the same change.
    expect(THEME_CACHE_KEY).toBe("sf-theme");
  });
});

describe("THEME_BOOT_SCRIPT (S12-C1 — the print handlers, pinned)", () => {
  it("registers beforeprint/afterprint listeners that force light for print", () => {
    // The script is hand-maintained and cannot import this module — these
    // presence pins are the sync contract: removing or renaming the print
    // handlers must fail here and force the string to be updated in the
    // same change (the S11 cache-format convention, applied to S12).
    expect(THEME_BOOT_SCRIPT).toContain("beforeprint");
    expect(THEME_BOOT_SCRIPT).toContain("afterprint");
    // The handler must remember the pre-print dark state so afterprint can
    // restore it (the __sfPrintDark flag is the script's own convention).
    expect(THEME_BOOT_SCRIPT).toContain("__sfPrintDark");
  });

  it("still applies the cached mode pre-paint (the S11 contract holds)", () => {
    // S118/BS12 re-anchor: the script now READS THROUGH its own var KEY
    // (interpolated from THEME_CACHE_KEY) instead of a parallel literal —
    // the pin proves the constant is both injected AND consumed (a key
    // rename can no longer desync the hand-maintained script silently).
    expect(THEME_BOOT_SCRIPT).toContain('var KEY = "sf-theme"');
    expect(THEME_BOOT_SCRIPT).toContain("localStorage.getItem(KEY)");
    expect(THEME_BOOT_SCRIPT).toContain("classList.add(\"dark\")");
  });
});

// S132/CG9 — the boot-script token derivation + pin
// (docs/remediation-plan-session132.md).
//
// The s132 FE audit's L: THEME_BOOT_SCRIPT paired seven hand-maintained
// TOKENS name arrays with Object.values(ACCENT_TOKENS[a]) POSITIONALLY — a
// mid-object token insertion in AccentToken silently mis-mapped every
// later --sf-primary-* var pre-paint on every accent, and nothing failed
// (the script is a string; the presence pins never checked alignment).
// CG9 replaces the seven arrays with ONE exported BOOT_TOKEN_SUFFIXES list
// embedded into the script; this pin reconstructs the var list the script
// would emit and deep-equals it against accentCssVars's ACTUAL keys for
// EVERY accent — the positional alignment is now machine-enforced.
describe("S132/CG9 · THEME_BOOT_SCRIPT token derivation (the positional alignment pinned)", () => {
  it("derives the boot var list from the single BOOT_TOKEN_SUFFIXES source — the hand-maintained per-accent arrays are gone", () => {
    const src = readFileSync(
      path.resolve(process.cwd(), "src/lib/theme.ts"),
      "utf8",
    );
    // Pre-CG9: no exported suffix list existed — the RED discriminator.
    expect(src).toContain("export const BOOT_TOKEN_SUFFIXES");
    // The script embeds the derived list (no hand-maintained names).
    expect(THEME_BOOT_SCRIPT).toContain("var SUFFIXES =");
    expect(THEME_BOOT_SCRIPT).not.toMatch(/var TOKENS = \{/);
  });

  it("for EVERY accent, the SUFFIXES-derived var list deep-equals accentCssVars's keys (a mid-object insertion fails loudly)", () => {
    // The script's own reconstruction rule, pinned: "--sf-primary" for the
    // bare primary token, "--sf-primary-<suffix>" for every other entry.
    const reconstruct = (suffixes: readonly string[]): string[] =>
      suffixes.map((s) => (s === "primary" ? "--sf-primary" : `--sf-primary-${s}`));
    for (const accent of ACCENTS) {
      expect(
        reconstruct(BOOT_TOKEN_SUFFIXES),
        `${accent}: the boot script's derived var list must match accentCssVars's keys exactly — a token insertion without updating BOOT_TOKEN_SUFFIXES fails HERE before it ships a silent pre-paint mis-map`,
      ).toEqual(Object.keys(accentCssVars(accent)));
    }
  });

  it("the suffix list carries the full 19-token census (the count the sweeps depend on)", () => {
    // S135/CJ3: 17 → 18 (the edge border tint joins the set — the same
    // lockstep the S3-J pin enforces on accentCssVars). S161/DJ4:
    // 18 → 19 (the edge-dark border tint joins the set — the
    // VIOLET_RESIDUALS harmonization pass).
    expect(BOOT_TOKEN_SUFFIXES.length).toBe(19);
    // The derived list contains the historically-late additions the
    // hand-maintained arrays once missed risk on: clock-date-dark (S88/AO5),
    // empty (S121/BV15), edge (S135/CJ3), and edge-dark (S161/DJ4).
    expect(BOOT_TOKEN_SUFFIXES).toContain("clock-date-dark");
    expect(BOOT_TOKEN_SUFFIXES).toContain("empty");
    expect(BOOT_TOKEN_SUFFIXES).toContain("edge");
    expect(BOOT_TOKEN_SUFFIXES).toContain("edge-dark");
    // kebab-case only (the S8 e2e lesson: camelCase suffixes resolve no var).
    for (const s of BOOT_TOKEN_SUFFIXES) {
      expect(s).toMatch(/^[a-z]+(-[a-z]+)*$/);
    }
  });
});
