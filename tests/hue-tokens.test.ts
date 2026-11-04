import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// The hue-consumer token contract (S92/AS1 — the s80-era L4 standing debt
// closed): the AG-pinned dark-pill hue families are centralized as
// sf-pill-* / sf-alert-* utilities in globals.css, the palette steps they
// ride are ALL pinned to the v3 hexes in @theme (trap 2/10 — an unpinned
// v4-oklch step drifts 1–3 units/channel and serializes as lab()), and the
// canonical consumer sites reference the utilities instead of raw
// dark:bg-*-950 class strings. Three legs, the AP3 source-scan precedent
// (computed-style pins cannot discriminate a utility from the raw classes —
// that is the point: byte-identical rendering, centralized family).

const CSS = readFileSync(
  path.resolve(process.cwd(), "src/app/globals.css"),
  "utf8",
);

// S98/AY3 (the s97 audit's I2): the census counts REAL CSS only — block
// comments are stripped before both counts, so a prose "@utility" mention
// (e.g. a future `/* the @utility census note */`) cannot inflate the token
// census into a loud false failure. globals.css carries ONLY the block form
// (zero `//` lines — CSS does not define them), so the block strip is the
// complete comment grammar here. A commented-out `@utility` block is not
// real CSS either — it does not win at runtime — so stripping it from the
// census is the CORRECT semantics, not a workaround.
function stripCssComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

const CSS_NO_COMMENTS = stripCssComments(CSS);

function readConsumer(rel: string): string {
  return readFileSync(path.resolve(process.cwd(), rel), "utf8");
}

// The v3 palette pins the families ride. The five S92 additions close the
// trap-2/10 drift liability the census exposed (these steps were consumed
// by exams/assignments surfaces as raw v4-oklch before this cycle).
const FAMILY_STEPS: Record<string, string> = {
  // pill family (100-step light + 950/300 dark)
  "--color-red-100": "#fee2e2",
  "--color-red-300": "#fca5a5",
  "--color-red-700": "#b91c1c",
  "--color-red-950": "#450a0a", // S80/AG3
  "--color-orange-100": "#ffedd5",
  "--color-orange-300": "#fdba74", // S92/AS1 (was unpinned)
  "--color-orange-700": "#c2410c",
  "--color-orange-950": "#431407", // S92/AS1 (was unpinned)
  "--color-yellow-100": "#fef9c3",
  "--color-yellow-300": "#fde047", // S92/AS1 (was unpinned)
  "--color-yellow-700": "#a16207",
  "--color-yellow-950": "#422006",
  "--color-emerald-100": "#d1fae5",
  "--color-emerald-300": "#6ee7b7",
  "--color-emerald-700": "#047857",
  "--color-emerald-950": "#022c22", // S80/AG4
  "--color-sky-100": "#e0f2fe",
  "--color-sky-300": "#7dd3fc", // S80/AG4
  "--color-sky-700": "#0369a1",
  "--color-sky-950": "#082f49", // S80/AG4
  "--color-amber-100": "#fef3c7",
  "--color-amber-300": "#fcd34d",
  "--color-amber-700": "#b45309",
  "--color-amber-950": "#451a03", // S80/AG4
  // soft-pill family (50-step light)
  "--color-amber-50": "#fffbeb",
  "--color-yellow-50": "#fefce8",
  "--color-blue-50": "#eff6ff",
  "--color-blue-600": "#2563eb",
  "--color-blue-300": "#93c5fd", // S92/AS1 (was unpinned)
  "--color-blue-950": "#172554", // S92/AS1 (was unpinned)
  "--color-blue-100": "#dbeafe", // S120/BU8: the exams ≥2-days pill (the live reference drift yellow → blue)
  "--color-blue-700": "#1d4ed8", // S120/BU8: the AA superset text step (5.49:1 on blue-100)
  // alert family (border + 50 light / border-900 + 200 dark)
  "--color-red-50": "#fef2f2",
  "--color-red-200": "#fecaca",
  "--color-red-900": "#7f1d1d",
  "--color-emerald-200": "#a7f3d0", // S81/AH3
  "--color-emerald-50": "#ecfdf5",
  "--color-emerald-900": "#064e3b",
};

describe("the hue-token palette contract (S92/AS1 leg 1)", () => {
  it("pins every family palette step to the v3 hex in @theme", () => {
    for (const [step, hex] of Object.entries(FAMILY_STEPS)) {
      const line = CSS.match(new RegExp(`${step}:\\s*([^;\\s]+)`));
      expect(line, `${step} missing from @theme`).not.toBeNull();
      expect(line?.[1], `${step} must carry the v3 ${hex}`).toBe(hex);
    }
  });

  // S93/AT2 (the s92 audit's I3): the leg above reads the FIRST
  // occurrence — a duplicate LATER definition would win at runtime by
  // the CSS last-definition rule while the pin stays green on the first
  // match. Exactly one definition per step (the duplicate-later-
  // definition mutant enters the kill set; mutation-proven s93).
  // S95/AV1 (the s94 audit's L1): the guard covers EVERY
  // first-occurrence-read record — the AU steps (amber-200/800) joined
  // after a planted later duplicate left all 923 pins green (the blind
  // spot demonstrated live on the pre-change tree); mutation-proven s95.
  it("defines every guarded palette step EXACTLY once (a duplicate later definition would win at runtime)", () => {
    const GUARDED_STEPS = { ...FAMILY_STEPS, ...AU_STEPS };
    for (const step of Object.keys(GUARDED_STEPS)) {
      const count = [...CSS.matchAll(new RegExp(`${step}:\\s*[^;\\s]+`, "g"))].length;
      expect(count, `${step} must appear exactly once in globals.css (found ${count})`).toBe(1);
    }
  });
});

// The utility families: each utility's light branch + .dark & branch must
// reference the pinned palette vars (the @theme pin stays the single
// source — a literal hex here would fork the truth).
const UTILITY_CONTRACT: Record<string, { bg: string; text: string; darkBg: string; darkText: string; border?: string; darkBorder?: string }> = {
  "sf-pill-red": { bg: "red-100", text: "red-700", darkBg: "red-950", darkText: "red-300" },
  "sf-pill-orange": { bg: "orange-100", text: "orange-700", darkBg: "orange-950", darkText: "orange-300" },
  "sf-pill-yellow": { bg: "yellow-100", text: "yellow-700", darkBg: "yellow-950", darkText: "yellow-300" },
  "sf-pill-emerald": { bg: "emerald-100", text: "emerald-700", darkBg: "emerald-950", darkText: "emerald-300" },
  "sf-pill-sky": { bg: "sky-100", text: "sky-700", darkBg: "sky-950", darkText: "sky-300" },
  "sf-pill-amber": { bg: "amber-100", text: "amber-700", darkBg: "amber-950", darkText: "amber-300" },
  "sf-pill-soft-amber": { bg: "amber-50", text: "amber-700", darkBg: "amber-950", darkText: "amber-300" },
  "sf-pill-soft-yellow": { bg: "yellow-50", text: "yellow-700", darkBg: "yellow-950", darkText: "yellow-300" },
  "sf-pill-soft-blue": { bg: "blue-50", text: "blue-600", darkBg: "blue-950", darkText: "blue-300" },
  "sf-pill-blue": { bg: "blue-100", text: "blue-700", darkBg: "blue-950", darkText: "blue-300" }, // S120/BU8
  "sf-alert-red": { bg: "red-50", text: "red-700", darkBg: "red-950", darkText: "red-200", border: "red-200", darkBorder: "red-900" },
  "sf-alert-emerald": { bg: "emerald-50", text: "emerald-700", darkBg: "emerald-950", darkText: "emerald-200", border: "emerald-200", darkBorder: "emerald-900" },
};

function utilityBlock(name: string): string {
  const m = CSS.match(new RegExp(`@utility ${name} \\{`));
  if (!m) return "";
  const start = m.index! + m[0].length;
  let depth = 1;
  let i = start;
  for (; i < CSS.length && depth > 0; i++) {
    if (CSS[i] === "{") depth++;
    if (CSS[i] === "}") depth--;
  }
  return CSS.slice(start, i - 1);
}

describe("the sf-pill/sf-alert utility families (S92/AS1 leg 2)", () => {
  it("carries every utility with the pinned-var declarations in both branches", () => {
    for (const [name, c] of Object.entries(UTILITY_CONTRACT)) {
      const block = utilityBlock(name);
      expect(block.length, `@utility ${name} missing from globals.css`).toBeGreaterThan(0);
      expect(block, `${name} light bg`).toContain(`background-color: var(--color-${c.bg})`);
      expect(block, `${name} light text`).toContain(`color: var(--color-${c.text})`);
      expect(block, `${name} dark branch`).toMatch(/\.dark &/);
      const dark = block.split(/\.dark &/)[1] ?? "";
      expect(dark, `${name} dark bg`).toContain(`background-color: var(--color-${c.darkBg})`);
      expect(dark, `${name} dark text`).toContain(`color: var(--color-${c.darkText})`);
      if (c.border) {
        expect(block, `${name} light border`).toContain(`border: 1px solid var(--color-${c.border})`);
        expect(dark, `${name} dark border`).toContain(`border-color: var(--color-${c.darkBorder})`);
      }
    }
  });
});

// The @utility census — hoisted out of the family describe by S97/AX1
// (the s96 audit's L2-adjacent I-finding: the completeness guard owns the
// WHOLE file, not the pill/alert families). S96/AW1 guarded every
// conventionally-shaped header; S97/AX1 (the s96 audit's L1) closes the
// shape-variant escape: the original regex `/@utility ([a-z0-9-]+) \{/g`
// demanded exactly one space and a lowercase-dash name, so a duplicate
// written `@utility sf-pill-red{` (no space) or `@utility SF_PILL {`
// (uppercase/underscore) was invisible to BOTH the census and the dupe
// guard — demonstrated LIVE on the pre-change tree: the planted variant
// left all 930 pins green while the CSS cascade would let it win at
// runtime. The widened form below counts every header shape, and the
// token-reconciliation pin catches any `@utility` token the header regex
// still misses (a header that falls out of the census fails LOUDLY, never
// silently).
describe("the @utility census (S96/AW1 + S97/AX1 + S98/AY3)", () => {
  it("defines every @utility block EXACTLY once — widened to every header shape (a shape-variant duplicate would win at runtime)", () => {
    const headers = [...CSS_NO_COMMENTS.matchAll(/@utility\s+([A-Za-z0-9_-]+)\s*\{/g)].map((m) => m[1]);
    expect(headers.length, "the @utility census ran (globals.css carries its utility families)").toBeGreaterThan(30);
    const dupes = headers.filter((h, i) => headers.indexOf(h) !== i);
    expect(
      dupes,
      `duplicate @utility blocks (a later definition wins at runtime — collapse them to one): ${[...new Set(dupes)].join(", ")}`,
    ).toEqual([]);
  });

  it("reconciles the @utility token count against the matched-header census (an unmatchable header shape must fail LOUDLY, never fall out of the census)", () => {
    const tokens = [...CSS_NO_COMMENTS.matchAll(/@utility(?![a-zA-Z0-9_-])/g)].length;
    const headers = [...CSS_NO_COMMENTS.matchAll(/@utility\s+([A-Za-z0-9_-]+)\s*\{/g)].length;
    expect(
      tokens,
      `the @utility token count (${tokens}) must equal the matched-header count (${headers}) — a header the census regex cannot match escapes BOTH the dupe guard and the census; write it in the conventional form or widen the regex`,
    ).toBe(headers);
  });

  it("strips block comments before the census — a prose @utility mention is not a header (S98/AY3, the s97 audit's I2)", () => {
    const sample =
      "/* the @utility census note: prose mention */\n@utility sf-pill-red {\n  color: red;\n}\n";
    const stripped = stripCssComments(sample);
    expect(stripped, "the block comment is removed entirely").not.toContain("the @utility census note");
    expect(stripped, "the real header survives the strip").toContain("@utility sf-pill-red {");
    const tokens = [...stripped.matchAll(/@utility(?![a-zA-Z0-9_-])/g)].length;
    const headers = [...stripped.matchAll(/@utility\s+([A-Za-z0-9_-]+)\s*\{/g)].length;
    expect(
      tokens,
      "the comment's @utility mention no longer inflates the token census (1 === 1)",
    ).toBe(headers);
  });

  it("an inline-comment header form NORMALIZES under the strip — the census sees the conventional duplicate (the dupe check's discriminator), not an unmatchable form (S99/AZ1, the s98 audit's L1)", () => {
    // The S97-era Plant B shape (`@utility sf-pill-red /* dup */ {`) carried
    // an inline comment. Under the AY3 strip the comment is removed FIRST,
    // so the line normalizes to the conventional header shape — a
    // duplicate of it trips the DUPE check, NOT the reconciliation pin
    // (verified live at S99: the S98 record's Plant B sentence described
    // the PRE-strip mapping). The reconciliation pin's live discriminator
    // is the wildcard/unmatchable-NAME form (the AY4/I3 by-design case).
    // The shape-true matrix this pin machine-checks: A (shape-variant
    // duplicate) → dupe; the inline-comment form → dupe (normalization);
    // the wildcard form → reconciliation; a prose comment → NOTHING.
    const sample =
      "@utility sf-pill-red {\n  color: red;\n}\n@utility sf-pill-red /* dup */ {\n  color: orange;\n}\n";
    const stripped = stripCssComments(sample);
    const headers = [...stripped.matchAll(/@utility\s+([A-Za-z0-9_-]+)\s*\{/g)].map((m) => m[1]);
    expect(
      headers.filter((h) => h === "sf-pill-red").length,
      "the inline-comment form normalizes to a conventional header the census CAN match (the dupe check owns this plant shape)",
    ).toBe(2);
    const tokens = [...stripped.matchAll(/@utility(?![a-zA-Z0-9_-])/g)].length;
    expect(
      tokens,
      "tokens and headers stay reconciled through the normalization (the reconciliation pin does NOT own this shape — if this fails, the strip stopped stripping)",
    ).toBe(headers.length);
  });
});

// The consumer sweep: each canonical site references its utilities (the
// machine-guard against silent raw-class reintroduction — a new consumer
// must ride the family, not fork the classes).
const CONSUMERS: Record<string, string[]> = {
  // S121/BV15: RepeatPill rides the accent-token utility (light
  // rgb(var(--sf-primary-empty)) / text strong; dark soft-dark bg / strong-dark
  // text — at violet EXACTLY the measured violet-100/600/950/300 family).
  "src/components/views/shared.tsx": ["sf-pill-red", "sf-repeat-pill"],
  // S120/BU8: the ≥2-days badge rode sf-pill-yellow until the live
  // reference drifted it to blue (measured 2026-11-01 on an 11-day exam);
  // the family follows — yellow stays on flashcards + dashboard priority.
  "src/components/views/exams-view.tsx": ["sf-pill-red", "sf-pill-orange", "sf-pill-blue", "sf-alert-red"],
  "src/components/views/flashcards-view.tsx": ["sf-pill-yellow", "sf-alert-red"],
  "src/components/views/gradetracker-view.tsx": ["sf-pill-emerald", "sf-pill-sky", "sf-pill-amber", "sf-pill-red"],
  "src/components/views/assignments-view.tsx": ["sf-pill-red", "sf-pill-soft-amber", "sf-pill-soft-blue", "sf-pill-soft-yellow", "sf-alert-red"],
  "src/components/views/dashboard-view.tsx": ["sf-pill-red", "sf-pill-yellow"],
  "src/components/views/calculator-view.tsx": ["sf-pill-red"],
  "src/components/rum/rum-panel.tsx": ["sf-pill-emerald", "sf-pill-amber", "sf-pill-red"],
  "src/components/views/practicetests-view.tsx": ["sf-pill-red"],
  "src/components/auth/login-surface.tsx": ["sf-alert-emerald"],
  "src/components/export/export-panel.tsx": ["sf-alert-emerald", "sf-alert-red"],
  "src/components/ui/toast.tsx": ["sf-alert-red", "sf-alert-emerald"],
  "src/components/views/events-view.tsx": ["sf-alert-red"],
  "src/components/views/notes-view.tsx": ["sf-alert-red"],
  "src/components/views/timetable-view.tsx": ["sf-alert-red"],
};

describe("the canonical consumer sites ride the utilities (S92/AS1 leg 3)", () => {
  it("references the expected utility families per file (as QUOTED class strings — the whole value or the FIRST class of a composed string; prose mentions have a word boundary, never a leading quote)", () => {
    for (const [file, utilities] of Object.entries(CONSUMERS)) {
      const src = readConsumer(file);
      for (const u of utilities) {
        // A real consumer carries the utility as a CLASS STRING — a quote
        // immediately BEFORE it. The discriminator's real semantics (the
        // s93 audit's L3): it matches the utility as the WHOLE value or
        // as the FIRST class of a composed string ("sf-pill-red px-2…")
        // — the utility-first convention every consumer follows. Two
        // known edges, documented here because the regex owns them: a
        // comment that QUOTES the class ("the sf-pill-red utility")
        // still matches, and a consumer composing the utility MID-string
        // ("rounded-full sf-pill-red") does NOT — keep new consumers
        // utility-first and the pin discriminates consumers from prose.
        expect(
          src,
          `${file} must USE ${u} in a class string (not just mention it)`,
        ).toMatch(new RegExp(`["']${u}["'\\s]`));
      }
    }
  });
});

// The documented residual register (S93/AT1 leg 4): the divergent
// single-site variants the census left site-local BY DECISION. Each is
// file:line-anchored — the register is machine-guarded, not
// convention-guarded (the s93 audit's L1: the AGENTS convention line
// claimed a negative guard the pins did not provide).
// S94/AU2: the connectivity banner entry REMOVED — the register's first
// TREATED site (the trap-10 closure: the banner rides
// sf-connectivity-pill now; the raw amber classes are gone, so the
// register's second direction would fail on the stale entry).
const RESIDUALS: ReadonlyArray<{ file: string; line: number; why: string }> = [
  { file: "src/components/auth/login-surface.tsx", line: 28, why: "the bg-red-50/70 translucent alert (the reference's measured login chrome)" },
  { file: "src/components/views/dashboard-view.tsx", line: 209, why: "the overdue icon chip (bg-only pair — the icon carries its own text color)" },
  { file: "src/components/rum/rum-panel.tsx", line: 143, why: "the borderless red-600 alert (the /rum owner panel's measured style; line re-anchored S130/CE4 — the load-state machine comments above shifted it)" },
];

function listSrcFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listSrcFiles(p));
    else if (/\.(tsx|ts)$/.test(entry.name)) out.push(p);
  }
  return out;
}

describe("the raw-family negative sweep (S93/AT1 leg 4)", () => {
  it("carries ZERO raw dark:bg-*-950 family sites outside globals.css and the documented residuals (the machine guard behind the convention line)", () => {
    const family = /dark:bg-(?:red|orange|yellow|emerald|sky|amber|blue)-950\b/;
    const files = listSrcFiles(path.resolve(process.cwd(), "src")).filter(
      (f) => !f.endsWith(path.join("app", "globals.css")),
    );
    expect(files.length, "the src file census ran").toBeGreaterThan(100);
    const offenders: string[] = [];
    for (const file of files) {
      const src = readConsumer(file);
      const rel = path.relative(process.cwd(), file);
      src.split("\n").forEach((lineText, i) => {
        if (!family.test(lineText)) return;
        const residual = RESIDUALS.find(
          (r) => r.file === rel && r.line === i + 1,
        );
        if (!residual) offenders.push(`${rel}:${i + 1}`);
      });
    }
    expect(
      offenders,
      `raw family sites outside the register (either ride the sf-pill/sf-alert utilities or extend the residual register): ${offenders.join(", ")}`,
    ).toEqual([]);
  });

  it("the residual register itself stays anchored (every documented site still carries its raw class at the recorded line)", () => {
    const family = /dark:bg-(?:red|orange|yellow|emerald|sky|amber|blue)-950\b/;
    for (const r of RESIDUALS) {
      const lineText = readConsumer(r.file).split("\n")[r.line - 1] ?? "";
      expect(
        family.test(lineText),
        `${r.file}:${r.line} no longer carries its raw family class — ${r.why}; update the register if the site was treated`,
      ).toBe(true);
    }
  });
});

// S93/AT1.2 (the s93 audit's L2): the files-view folder tile's dark half.
// The tile is the myday 56px sun-block's sibling (bg-amber-100 +
// dark:bg-amber-900/40 + the amber-300 icon) — a latent flashbulb class
// on a swept view the seed never rendered (no seeded folders), found by
// the s93 audit's census. RED-first: the tile shipped light-only before
// this cycle.
describe("the files-view folder tile's dark half (S93/AT1.2)", () => {
  it("carries the myday sibling pattern's dark branch on the tile and the amber-300 icon", () => {
    const src = readConsumer("src/components/views/files-view.tsx");
    // The tile span: bg-amber-100 + the dark half…
    expect(src).toMatch(/["']rounded-lg bg-amber-100 p-2 text-amber-600 dark:bg-amber-900\/40 dark:text-amber-300["']/);
    // …the sibling pattern byte-matched at myday-view's sun block.
    const myday = readConsumer("src/components/views/myday-view.tsx");
    expect(myday).toMatch(/bg-amber-100 dark:bg-amber-900\/40/);
    expect(myday).toMatch(/text-amber-600 dark:text-amber-300/);
  });
});

// The S94/AU1 leg — the connectivity trap-10 closure (the residual
// register's first TREATED site): the banner rode UNPINN amber-200/
// amber-800 — the LAST unpinned steps of the amber family (50/100/300/
// 400/500/600/700/900/950 all carried the v3 hexes) — so both branches
// serialized through v4-oklch and drifted 1–3 units/channel (trap-10,
// the AH3b class; demonstrated RED live: the border computed
// lab(91.7203 -0.505269 49.9084) vs the v3 rgb(253, 230, 138)). The
// pins + the utility close the drift; the dark border rides the
// raw-rgb() convention (legacy rgba serialization, never
// color-mix(in oklab) — the sf-today-cell-tint precedent).
const AU_STEPS: Record<string, string> = {
  "--color-amber-200": "#fde68a", // S94/AU1 (was unpinned) — the banner's light border / dark ink
  "--color-amber-800": "#92400e", // S94/AU1 (was unpinned) — the banner's light ink / the dark border's base
};

describe("the connectivity amber pins (S94/AU1 leg 5)", () => {
  it("pins the banner's amber-200/800 steps to the v3 hexes in @theme", () => {
    for (const [step, hex] of Object.entries(AU_STEPS)) {
      const line = CSS.match(new RegExp(`${step}:\\s*([^;\\s]+)`));
      expect(line, `${step} missing from @theme`).not.toBeNull();
      expect(line?.[1], `${step} must carry the v3 ${hex}`).toBe(hex);
    }
  });

  it("carries the sf-connectivity-pill utility with the pinned-var declarations in both branches, and the banner rides it", () => {
    const block = utilityBlock("sf-connectivity-pill");
    expect(block.length, "@utility sf-connectivity-pill missing from globals.css").toBeGreaterThan(0);
    // Light: border amber-200 / bg amber-100 / ink amber-800 — palette-var
    // references (the @theme pin stays the single source, never a literal).
    expect(block, "light border").toContain("border: 1px solid var(--color-amber-200)");
    expect(block, "light bg").toContain("background-color: var(--color-amber-100)");
    expect(block, "light ink").toContain("color: var(--color-amber-800)");
    // Dark: the raw-rgb() alpha border (amber-800 #92400e at /60 — legacy
    // rgba serialization, never color-mix) + the pinned bg/ink pair.
    expect(block, "dark branch").toMatch(/\.dark &/);
    const dark = block.split(/\.dark &/)[1] ?? "";
    expect(dark, "dark border").toContain("border-color: rgb(146 64 14 / 0.6)");
    expect(dark, "dark bg").toContain("background-color: var(--color-amber-950)");
    expect(dark, "dark ink").toContain("color: var(--color-amber-200)");
    // The consumer: the banner rides the utility as a QUOTED class string,
    // utility-FIRST (the leg-3 discriminator's documented convention).
    const banner = readConsumer("src/components/layout/connectivity-banner.tsx");
    expect(banner, "the banner must USE sf-connectivity-pill in a class string (not just mention it)").toMatch(
      /["']sf-connectivity-pill["'\s]/,
    );
  });
});

// ---------------------------------------------------------------------------
// S130/CE8 · the analytics accent tokenization (docs/remediation-plan-session130.md).
//
// The s130 FE audit's I5, promoted: analytics-view hardcoded the violet
// accent literal `#8b5cf6` at five chart sites (the gradient stops, two
// line strokes, the bar fill) — the last hardcoded accent hexes on a
// themed surface outside the button's documented measured literals. The
// rum-panel sparkline already showed the token form
// (`stroke="rgb(var(--sf-primary))"`). CE8 tokenizes the five sites; the
// S9-K e2e pin (which asserted the old hex) is corrected with the
// provenance in-line. This sweep machine-guards the regression.
// ---------------------------------------------------------------------------
describe("the analytics accent tokenization (S130/CE8)", () => {
  it("carries ZERO #8b5cf6 literals in analytics-view (the accent rides rgb(var(--sf-primary)))", () => {
    const src = readConsumer("src/components/views/analytics-view.tsx");
    const offenders: string[] = [];
    src.split("\n").forEach((lineText, i) => {
      if (lineText.includes("#8b5cf6")) offenders.push(`line ${i + 1}`);
    });
    expect(
      offenders,
      `raw violet literals remaining (the accent system owns the chart colors): ${offenders.join(", ")}`,
    ).toEqual([]);
  });

  it("the five chart surfaces reference the primary token", () => {
    const src = readConsumer("src/components/views/analytics-view.tsx");
    const tokens = src.split("\n").filter((l) => l.includes("rgb(var(--sf-primary))")).length;
    expect(tokens, "the gradient stops ×2, two line strokes, and the bar fill").toBeGreaterThanOrEqual(5);
  });
});

// ---------------------------------------------------------------------------
// S134/CI8 → S135/CJ3 — the accent-semantic violet register, RE-SHAPED to
// its dark half. The CI8 era registered four LIGHT hardcoded-violet sites
// (three violet-200 borders + one violet-100 chip). S135/CJ3 closed the
// light half — the parity measurement CI8 lacked is now gathered (the
// reference is single-accent; all four light values re-verified live, the
// tasks hover and flashcards face at class/computed level, the analytics
// chip computed rgb(237, 233, 254)): the 200-level border tint earned
// its own token at THREE uniform consumers (--sf-primary-edge, the S92
// second-consumer doctrine), the notes bg rides the EXISTING softest token
// (violet-50 byte-identical), and the chip bg rides the EXISTING empty
// token (violet-100 byte-identical). What remains site-local is the DARK
// half of each site — deliberately (the S92 divergent-variant doctrine):
// the reference's Dark option is the measured platform no-op, so the dark
// tints have NO reference ground truth (clone-superset design), and the
// three dark border values are DIVERGENT (800/800/900) — a dark-edge token
// family waits for a harmonization pass that changes dark-mode rendering
// at three sites. The register machine-guards the remainder: the negative
// leg fails when a FIFTH dark violet site appears unregistered; the
// anchored leg fails when a registered site moves or sheds its class; the
// NEW treated-light-half census (the S94/AU2 precedent) pins the five
// migrated sites to their tokens with the S92 quote-adjacency discriminator
// (the class string, never a comment mention).
// ---------------------------------------------------------------------------
const VIOLET_RESIDUALS: ReadonlyArray<{ file: string; line: number; pattern: RegExp; why: string }> = [
  { file: "src/components/views/tasks-view.tsx", line: 115, pattern: /dark:hover:border-violet-800/, why: "the row-card hover border's DARK half (the light half rides --sf-primary-edge since S135/CJ3; no reference ground truth for dark — the clone's dark mode is the documented superset)" },
  { file: "src/components/views/flashcards-view.tsx", line: 394, pattern: /dark:border-violet-800/, why: "the study-card face border's DARK half (the light half rides --sf-primary-edge since S135/CJ3; the 800-vs-900 divergence from notes is the S92 divergent-variant class)" },
  { file: "src/components/views/notes-view.tsx", line: 686, pattern: /dark:border-violet-900/, why: "the selected-note row border's DARK half (the light border rides --sf-primary-edge and the bg rides --sf-primary-softest since S135/CJ3; softDark's 900 value is byte-equal but the dark-edge family waits for a uniform design pass)" },
  { file: "src/components/views/analytics-view.tsx", line: 429, pattern: /dark:bg-violet-900\/50/, why: "the Tasks-Completed chip's DARK half (the light bg rides --sf-primary-empty since S135/CJ3; the /50 opacity serializes through the trap-7 family — a dark empty-step token would change the form)" },
];

// The S135/CJ3 treated-light-half census: the five migrations, pinned to
// their tokens at file:line anchors (quote-adjacency — the class VALUE, not
// a prose mention; the S92/AS1 discriminator).
const EDGE_CONSUMERS: ReadonlyArray<{ file: string; line: number; pattern: RegExp; why: string }> = [
  { file: "src/components/views/tasks-view.tsx", line: 115, pattern: /hover:border-sf-primary-edge/, why: "the row-card hover border" },
  { file: "src/components/views/flashcards-view.tsx", line: 394, pattern: /border-sf-primary-edge/, why: "the study-card face border" },
  { file: "src/components/views/notes-view.tsx", line: 686, pattern: /border-sf-primary-edge/, why: "the selected-note row border" },
  { file: "src/components/views/notes-view.tsx", line: 686, pattern: /bg-sf-primary-softest/, why: "the selected-note row tint" },
  { file: "src/components/views/analytics-view.tsx", line: 429, pattern: /bg-sf-primary-empty/, why: "the Tasks-Completed chip" },
];

describe("the accent-semantic violet register (S134/CI8 → S135/CJ3, the dark half)", () => {
  it("carries ZERO unregistered dark violet sites in the views (a fifth dark site fails this leg)", () => {
    const family = /dark:(?:hover:)?(?:border|bg)-violet-(?:800|900)/;
    const viewFiles = listSrcFiles(
      path.resolve(process.cwd(), "src/components/views"),
    );
    expect(viewFiles.length, "the views census ran").toBeGreaterThan(20);
    const offenders: string[] = [];
    for (const file of viewFiles) {
      const src = readConsumer(file);
      const rel = path.relative(process.cwd(), file);
      src.split("\n").forEach((lineText, i) => {
        if (!family.test(lineText)) return;
        const residual = VIOLET_RESIDUALS.find(
          (r) => r.file === rel && r.line === i + 1,
        );
        if (!residual) offenders.push(`${rel}:${i + 1}`);
      });
    }
    expect(
      offenders,
      `dark violet sites outside the register (accent-semantic surfaces ride the accent tokens or join the register with a why): ${offenders.join(", ")}`,
    ).toEqual([]);
  });

  it("carries ZERO unregistered LIGHT border-violet-200 sites (the CI8 sweep direction, now fully clean)", () => {
    const family = /border-violet-200/;
    const viewFiles = listSrcFiles(
      path.resolve(process.cwd(), "src/components/views"),
    );
    const offenders: string[] = [];
    for (const file of viewFiles) {
      const src = readConsumer(file);
      const rel = path.relative(process.cwd(), file);
      src.split("\n").forEach((lineText, i) => {
        if (!family.test(lineText)) return;
        offenders.push(`${rel}:${i + 1}`);
      });
    }
    expect(
      offenders,
      `border-violet-200 sites anywhere in the views (the light half rides --sf-primary-edge since S135/CJ3 — a new hardcoded site fails here): ${offenders.join(", ")}`,
    ).toEqual([]);
  });

  it("the register stays anchored (every registered site still carries its dark violet class at the recorded line)", () => {
    for (const r of VIOLET_RESIDUALS) {
      const src = readConsumer(path.resolve(process.cwd(), r.file));
      const lineText = src.split("\n")[r.line - 1];
      expect(
        lineText,
        `${r.file}:${r.line} — the registered site must keep its dark violet class (${r.why})`,
      ).toMatch(r.pattern);
    }
  });

  it("the S135/CJ3 treated sites carry their accent tokens at the recorded lines (the consumer census — the class VALUE, never a comment)", () => {
    for (const c of EDGE_CONSUMERS) {
      const src = readConsumer(path.resolve(process.cwd(), c.file));
      const lineText = src.split("\n")[c.line - 1];
      expect(
        lineText,
        `${c.file}:${c.line} — the treated site must keep its accent-token class (${c.why})`,
      ).toMatch(c.pattern);
    }
  });
});

// ---------------------------------------------------------------------------
// S136/CK5 (audits B-M4 + B-M5) — the census widening to INLINE-STYLE
// literals: the CJ3 register's negative sweeps match CLASS-NAME patterns
// and could not see the dashboard KPI icon gradient (an inline
// background-image hardcoding the accent pair rgb(139, 92, 246) →
// rgb(79, 70, 229) — byte-equal to --sf-primary → --sf-primary-gradient-to)
// nor the .sf-canvas dark wash (rgb(76 29 149 / 0.12) — violet-900 =
// --sf-primary-soft-dark). Both drift under the 6 non-violet accents with
// the census green — the class-pattern blind spot, closed here: the
// inline-hex shapes join the register's sweep scope.
// ---------------------------------------------------------------------------
describe("the accent-semantic INLINE-HEX register (S136/CK5 — the class-pattern blind spot)", () => {
  it("carries ZERO inline accent-pair/violet-900 hex literals in component code (a hardcoded gradient or dark wash fails this leg)", () => {
    // The measured shapes: the violet-600 accent stop, the indigo-600
    // gradient-to stop, and the violet-900 soft-dark wash (both serial
    // forms — the comma-joined and the raw-rgb alpha convention).
    // The S92/AS1 quote-adjacency doctrine: the VALUE, never a comment —
    // comment lines (the //, /*, * forms) document values legitimately
    // (the sf-chip-dark wash note in settings-view is prose, not a site).
    const literals = [
      /rgb\(139,\s*92,\s*246\)/,
      /rgb\(79,\s*70,\s*229\)/,
      /rgb\(76\s+29\s+149/,
      /rgb\(76,\s*29,\s*149\)/,
    ];
    const isCommentLine = (lineText: string) => {
      const trimmed = lineText.trim();
      return trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*");
    };
    const files = listSrcFiles(path.resolve(process.cwd(), "src/components"));
    expect(files.length, "the components census ran").toBeGreaterThan(40);
    const offenders: string[] = [];
    for (const file of files) {
      const src = readConsumer(file);
      const rel = path.relative(process.cwd(), file);
      src.split("\n").forEach((lineText, i) => {
        if (isCommentLine(lineText)) return;
        for (const lit of literals) {
          if (lit.test(lineText)) offenders.push(`${rel}:${i + 1} (${lit.source})`);
        }
      });
    }
    expect(
      offenders,
      `inline accent hexes in component code (ride the runtime vars — rgb(var(--sf-primary)) etc., the AGENTS no-hardcoded-violet-hexes rule extended to inline styles): ${offenders.join(", ")}`,
    ).toEqual([]);
  });

  it("the dashboard KPI accent-icon gradient rides the runtime token pair (the first KPI block is the ACCENT slot; the blue/orange/pink siblings are the fixed categorical palette measured on the reference)", () => {
    const src = readConsumer(
      path.resolve(process.cwd(), "src/components/views/dashboard-view.tsx"),
    );
    // Pre-CK5: the gradient hardcoded the violet pair — the RED discriminator.
    expect(src).toMatch(
      /rgb\(var\(--sf-primary\)\),\s*rgb\(var\(--sf-primary-gradient-to\)\)/,
    );
    // The three categorical siblings stay FIXED (measured on the reference:
    // blue, orange, pink — only the first slot is accent-semantic).
    expect(src).toMatch(/rgb\(59,\s*130,\s*246\),\s*rgb\(8,\s*145,\s*178\)/);
    expect(src).toMatch(/rgb\(249,\s*115,\s*22\),\s*rgb\(217,\s*119,\s*6\)/);
    expect(src).toMatch(/rgb\(236,\s*72,\s*153\),\s*rgb\(225,\s*29,\s*72\)/);
  });

  it("the sf-canvas dark wash rides the soft-dark token (the raw-rgb alpha convention — the sf-today-tint precedent; byte-identical at violet)", () => {
    const css = readConsumer(path.resolve(process.cwd(), "src/app/globals.css"));
    // Pre-CK5: the dark branch pinned rgb(76 29 149 / 0.12) — the RED
    // discriminator. The light branch's softest stop is the same idiom's
    // already-treated form (the S135/CJ-era precedent).
    expect(css).toMatch(/rgb\(var\(--sf-primary-soft-dark\) \/ 0\.12\)/);
    expect(css).not.toMatch(/rgb\(76\s+29\s+149/);
  });
});
