import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";

// Family F — the Lighthouse-equivalent a11y sweep across all 20 authed views.
//
// Lighthouse's a11y category IS axe-core (13.x runs tags wcag2a+wcag2aa plus
// an explicit rule table — core/gather/gatherers/accessibility.js). Session
// 61 certified the two surfaces Lighthouse can reach by URL (/login, /) at
// a11y 100; the other views are client-switched inside the single-route
// shell, so Lighthouse cannot reach them by URL. This sweep runs THE SAME
// axe configuration on EVERY view — Lighthouse-equivalent by construction.
//
// The Dashboard test doubles as the equivalence anchor: it passed a real
// Lighthouse 13.5 audit at 100 (session 61), so it must also pass here —
// if it doesn't, this file's rule table has drifted from Lighthouse's.
//
// Pin: zero violations of the Lighthouse rule set on every authed view.
// ("incomplete" results are axe's "needs review" — Lighthouse does not score
// them either, so they are reported but not pinned.)

test.use({ viewport: { width: 1440, height: 900 } });

// Mirror of Lighthouse 13.x core/gather/gatherers/accessibility.js (verified
// against the installed 13.5.0 source). Keep in sync when bumping Lighthouse.
const LIGHTHOUSE_AXE_OPTIONS = {
  runOnly: { type: "tag" as const, values: ["wcag2a", "wcag2aa"] },
  rules: {
    accesskeys: { enabled: true },
    "area-alt": { enabled: false },
    "aria-allowed-role": { enabled: true },
    "aria-braille-equivalent": { enabled: false },
    "aria-conditional-attr": { enabled: true },
    "aria-deprecated-role": { enabled: true },
    "aria-dialog-name": { enabled: true },
    "aria-prohibited-attr": { enabled: true },
    "aria-roledescription": { enabled: false },
    "aria-treeitem-name": { enabled: true },
    "aria-text": { enabled: true },
    "autocomplete-valid": { enabled: true },
    "audio-caption": { enabled: false },
    blink: { enabled: false },
    "duplicate-id": { enabled: false },
    "empty-heading": { enabled: true },
    "frame-focusable-content": { enabled: false },
    "frame-title-unique": { enabled: false },
    "heading-order": { enabled: true },
    "html-xml-lang-mismatch": { enabled: true },
    "identical-links-same-purpose": { enabled: true },
    "image-redundant-alt": { enabled: true },
    "input-button-name": { enabled: true },
    "label-content-name-mismatch": { enabled: true },
    "landmark-one-main": { enabled: true },
    "link-in-text-block": { enabled: true },
    marquee: { enabled: false },
    "meta-viewport": { enabled: true },
    "nested-interactive": { enabled: false },
    "no-autoplay-audio": { enabled: false },
    "presentation-role-conflict": { enabled: true },
    "role-img-alt": { enabled: false },
    "scrollable-region-focusable": { enabled: false },
    "select-name": { enabled: true },
    "server-side-image-map": { enabled: false },
    "skip-link": { enabled: true },
    "summary-name": { enabled: false },
    "svg-img-alt": { enabled: true },
    tabindex: { enabled: true },
    "table-duplicate-name": { enabled: true },
    "table-fake-caption": { enabled: true },
    "target-size": { enabled: true },
    "td-has-header": { enabled: true },
    "aria-tab-name": { enabled: false },
  },
};

const AXE_SOURCE = readFileSync(
  join(process.cwd(), "node_modules", "axe-core", "axe.min.js"),
  "utf8",
);

// The 20 authed views — the same map as navigation.spec.ts (the headline
// heading doubles as the semantic "view is mounted" marker, per AP-102:
// waits need semantically precise markers, not satisfiable-pre-mount ones).
const VIEWS: { path: string; heading: string | RegExp }[] = [
  { path: "/Dashboard", heading: /Good (morning|afternoon|evening)/ },
  { path: "/MyDay", heading: "My Day" },
  { path: "/Tasks", heading: "All Tasks" },
  { path: "/Calendar", heading: "Calendar" },
  { path: "/Events", heading: "Events & Reminders" },
  { path: "/Timetable", heading: "Timetable" },
  { path: "/Assignments", heading: "Assignments" },
  { path: "/Exams", heading: "Exams" },
  { path: "/Notes", heading: "Notes" },
  { path: "/Flashcards", heading: "Flashcards" },
  { path: "/PracticeTests", heading: "Practice Tests" },
  { path: "/StudyGroups", heading: "Study Groups" },
  { path: "/GradeTracker", heading: "Grade Tracker" },
  { path: "/Analytics", heading: "Analytics" },
  { path: "/Files", heading: "Files" },
  { path: "/Calculator", heading: "Calculator Suite" },
  { path: "/MathSolver", heading: "Math Solver" },
  { path: "/AIAssistant", heading: "AI Study Assistant" },
  { path: "/FocusTimer", heading: "Focus Timer" },
  { path: "/Settings", heading: "Settings" },
];

async function runLighthouseSetAxe(page: import("@playwright/test").Page) {
  await page.addScriptTag({ content: AXE_SOURCE });
  return page.evaluate(async (options) => {
    const axe = (window as unknown as { axe: { run: (c: Document, o: unknown) => Promise<{ violations: AxeViolation[]; incomplete: AxeViolation[] }> } }).axe;
    return axe.run(document, options);
  }, LIGHTHOUSE_AXE_OPTIONS);
}

type AxeNode = { target: string[]; html?: string; failureSummary?: string };
type AxeViolation = { id: string; impact: string | null; help: string; nodes: AxeNode[] };

function formatViolations(violations: AxeViolation[]): string {
  return violations
    .map((v) => {
      const nodes = v.nodes
        .slice(0, 5)
        .map((n) => `    - ${n.target.join(" ")}\n      html: ${(n.html ?? "").slice(0, 160)}`)
        .join("\n");
      return `  ${v.id} [${v.impact ?? "n/a"}] ${v.help} — ${v.nodes.length} node(s)\n${nodes}`;
    })
    .join("\n");
}

test.describe("Family F — Lighthouse-set a11y sweep (all 20 authed views)", () => {
  for (const view of VIEWS) {
    test(`F · ${view.path} — zero Lighthouse-set a11y violations`, async ({ page }) => {
      await page.goto(view.path);
      // Semantic mount marker: the view's own headline (same map the
      // navigation suite pins). Prevents the S8-G/S26 class of cold races.
      await expect(
        page.getByRole("heading", { name: view.heading }).first(),
      ).toBeVisible();

      const result = await runLighthouseSetAxe(page);

      const incompleteNote =
        result.incomplete.length > 0
          ? `\n  (also ${result.incomplete.length} incomplete rule(s) — needs-review, unscored: ${result.incomplete
              .map((v) => v.id)
              .join(", ")})`
          : "";
      expect(
        formatViolations(result.violations),
        `${view.path}: ${result.violations.length} Lighthouse-set violation(s)` +
          (result.violations.length > 0 ? `\n${formatViolations(result.violations)}` : incompleteNote),
      ).toBe("");
    });
  }
});
