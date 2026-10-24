import { readFileSync } from "node:fs";
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

// The consumer sweep: each canonical site references its utilities (the
// machine-guard against silent raw-class reintroduction — a new consumer
// must ride the family, not fork the classes).
const CONSUMERS: Record<string, string[]> = {
  "src/components/views/shared.tsx": ["sf-pill-red"],
  "src/components/views/exams-view.tsx": ["sf-pill-red", "sf-pill-orange", "sf-pill-yellow", "sf-alert-red"],
  "src/components/views/flashcards-view.tsx": ["sf-pill-yellow", "sf-alert-red"],
  "src/components/views/gradetracker-view.tsx": ["sf-pill-emerald", "sf-pill-sky", "sf-pill-amber", "sf-pill-red"],
  "src/components/views/assignments-view.tsx": ["sf-pill-red", "sf-pill-soft-amber", "sf-pill-soft-blue", "sf-pill-soft-yellow", "sf-alert-red"],
  "src/components/views/dashboard-view.tsx": ["sf-pill-red"],
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
  it("references the expected utility families per file (as QUOTED class strings — a comment mention is not a consumer; the mutation proof caught the substring form passing on prose)", () => {
    for (const [file, utilities] of Object.entries(CONSUMERS)) {
      const src = readConsumer(file);
      for (const u of utilities) {
        // A real consumer carries the utility as a CLASS STRING — a quote
        // immediately BEFORE it (the whole value "sf-pill-red" or the first
        // class of a composed string "sf-pill-red hover:…"). Prose mentions
        // ("the sf-pill-red utility") have a word boundary, never a quote.
        expect(
          src,
          `${file} must USE ${u} in a class string (not just mention it)`,
        ).toMatch(new RegExp(`["']${u}["'\\s]`));
      }
    }
  });
});
