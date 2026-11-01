// S120/BU10 — the slate text-pair guard (the hue-tokens doctrine extended to
// the slate body-text family).
//
// The audit census counted 51 static `text-slate-500` sites and 8
// `text-slate-400` TEXT sites with no `dark:text-slate-` sibling in the same
// className string — dark-mode contrast ~4.0:1 (below AA) and light-mode
// 2.56:1 respectively, against the codebase's own 82-paired convention
// (sidebar.tsx deliberately avoids bare slate-400 text for exactly this
// reason). This guard scans the STATIC className strings of the view layer
// so an unpaired site can never land again.
//
// Scope (documented): static `className="…"` / className={`…`} strings in
// src/components/** and src/app/** — dynamic cn() composition is out of
// scope (the audit's own census methodology). Two rules:
//   A. unprefixed `text-slate-500` must carry a dark:text-slate-* sibling
//      (any variant depth) — the 51-site BU10 sweep.
//   B. the inverted `text-slate-400 dark:text-slate-500` pair is a
//      violation (light-side AA failure) — the BU11 flipped family.
// Bare `text-slate-400` on ICON glyphs (the events-terminal/tool idiom,
// ~50 axe-passing sites) is deliberately NOT enforced — a source scan
// cannot distinguish glyph from text; the e2e axe sweep owns contrast.
// EXCEPTIONS carry a reason:
//   - flashcards-view.tsx "Click card to flip" — the hint's slate-400 IS a
//     measured parity pin (parity-session7.spec.ts:645-648,
//     rgb(148,163,184) — the reference's own value; the Q1/Q2 rule).
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const ROOTS = ["src/components", "src/app"];
const CLS = /className=(?:"([^"]*)"|\{`([^`]*)`\})/g;

/** file-path-ish → the reason it is exempt (each entry verified by hand). */
const EXCEPTIONS: RegExp[] = [
  /flashcards-view\.tsx$/, // the parity-pinned "Click card to flip" hint (slate-400, measured)
];

function* walk(dir: string): Generator<string> {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) yield* walk(full);
    else if (entry.endsWith(".tsx")) yield full;
  }
}

/** A dark-mode text-slate override exists at ANY variant depth
 *  (dark:text-slate-400, dark:data-[state=…]:text-slate-400, …). */
const HAS_DARK_SLATE_TEXT = /dark:(?:[a-z-\[\]=]+:)*text-slate-/;

function unpairedSites(): string[] {
  const sites: string[] = [];
  for (const root of ROOTS) {
    for (const file of walk(root)) {
      if (EXCEPTIONS.some((re) => re.test(path.basename(file)))) continue;
      const src = readFileSync(file, "utf8");
      for (const m of src.matchAll(CLS)) {
        const cls = m[1] ?? m[2] ?? "";
        // Rule A: an unprefixed text-slate-500 must carry its dark sibling
        // (the 51-site BU10 class — light 4.6:1 / dark ~4.0:1 without it).
        const bare500 = /(?<![\w[-])text-slate-500(?![-\w])/.test(cls);
        // Rule B: the INVERTED pair (400-light/500-dark) is the light-mode
        // AA failure family (2.56:1 on white) — the BU11 flipped sites.
        const inverted = /text-slate-400\s+dark:text-slate-500/.test(cls);
        if ((bare500 || inverted) && !HAS_DARK_SLATE_TEXT.test(cls)) {
          const line = src.slice(0, m.index ?? 0).split("\n").length;
          sites.push(`${file}:${line}: ${cls.trim().slice(0, 90)}`);
        }
      }
    }
  }
  return sites;
}

describe("the slate text-pair guard (S120/BU10)", () => {
  it("every static text-slate-500 / text-slate-400 site carries its dark:text-slate- sibling", () => {
    const sites = unpairedSites();
    expect(
      sites,
      `unpaired slate text sites (pair them: text-slate-500 dark:text-slate-400, or flip \` |
|text-slate-400\` light-side text to the 500/400 pair — see the audit census):\
\n${sites.join("\n")}`,
    ).toEqual([]);
  });

  it("the guard's class census is non-trivial (the scan actually ran)", () => {
    // The paired family is large (80+ sites at S120) — a count of zero
    // matched files means the walker or regex stopped matching.
    let paired = 0;
    for (const root of ROOTS) {
      for (const file of walk(root)) {
        const src = readFileSync(file, "utf8");
        for (const m of src.matchAll(CLS)) {
          const cls = m[1] ?? m[2] ?? "";
          if (cls.includes("text-slate-500") && cls.includes("dark:text-slate-")) paired++;
        }
      }
    }
    expect(paired, "the paired-family census ran").toBeGreaterThan(50);
  });
});
