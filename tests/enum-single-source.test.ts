import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// S161/DJ3 — the view enum single-source census (the s161 audit B/F-3).
//
// exams-view carried a LOCAL 6-value EXAM_TYPES twin beside validation.ts's
// exported single source — value-equal today, so no live bug, but the exact
// S127/CB9 drift class (the assignments-view twin was missing "worksheet",
// so Edit on the seeded worksheet rows blanked the Type select and the type
// was un-creatable from the UI) and the S130/CE9 GRADE_LEVELS class
// (settings-view imports the single source; a forked twin would drop the
// schema's accepted options from the UI). The CB9/CH2 fixes converted the
// two siblings to imports but pinned NOTHING — the single-source doctrine
// for view-consumed enums had no machine guard, which is exactly how the
// exams twin survived nine cycles of audits that each verified the FIXED
// sites without guarding the FAMILY.
//
// This census is the DI3 shape (the S160 AI-routes source-census
// precedent) applied to view enum imports: every view that renders a
// schema-enum's options must import the enum from validation.ts's single
// source and must not declare a local twin. A future forked twin (a new
// schema value the view twin misses) fails the unit layer BEFORE it ships
// the CB9 blanked-select class.
//
// S162/DK2: the census's FOURTH site — events-view's REPEATS rendered as
// four hard-coded SelectItems (the inline-twin form; the no-local-twin
// leg guards the const form, the import leg + tsc's noUnusedLocals gate
// the inline form: an import that stops feeding the render fails
// typecheck).

const SITES = [
  {
    view: "src/components/views/exams-view.tsx",
    enumName: "EXAM_TYPES",
    why: "the S161/F-3 twin (a local 6-value array beside validation.ts:122 — value-equal, the CB9 drift class)",
  },
  {
    view: "src/components/views/assignments-view.tsx",
    enumName: "ASSIGNMENT_TYPES",
    why: "the S127/CB9 fix surface (the local twin missed 'worksheet' — blanked Edit select on seeded rows)",
  },
  {
    view: "src/components/views/settings-view.tsx",
    enumName: "GRADE_LEVELS",
    why: "the S130/CE9 fix surface (the 12 reference-measured options the profile tab renders)",
  },
  {
    view: "src/components/views/events-view.tsx",
    enumName: "REPEATS",
    why: "the S162/DK2 twin (four hard-coded SelectItems beside validation.ts:102's single source — value-equal, the CB9 drift class)",
  },
  {
    view: "src/components/views/assignments-view.tsx",
    enumName: "ASSIGNMENT_PRIORITIES",
    why: "the S164/DM3 twin (the local 4-value PRIORITIES array beside validation.ts:101's single source — value-equal, the aliased-twin form the four prior sites never guarded)",
  },
] as const;

function readView(rel: string): string {
  return readFileSync(path.resolve(process.cwd(), rel), "utf8");
}

describe("the view enum single-source census (S161/DJ3)", () => {
  for (const site of SITES) {
    it(`${site.view} imports ${site.enumName} from validation.ts's single source (${site.why})`, () => {
      const src = readView(site.view);
      // The import must name the enum and point at the single source.
      expect(
        src,
        `${site.view} must import ${site.enumName} from @/lib/validation`,
      ).toMatch(
        new RegExp(
          `import\\s*\\{[^}]*\\b${site.enumName}\\b[^}]*\\}\\s*from\\s*["']@/lib/validation["']`,
        ),
      );
    });

    it(`${site.view} declares NO local ${site.enumName} twin (a forked twin drops schema values from the UI)`, () => {
      const src = readView(site.view);
      expect(
        src,
        `${site.view} must not declare a local ${site.enumName} — import the validation.ts single source (the CB9 class)`,
      ).not.toMatch(new RegExp(`^const\\s+${site.enumName}\\s*=`, "m"));
    });
  }
});
