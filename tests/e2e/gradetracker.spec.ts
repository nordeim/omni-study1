import { expect, test, type Page } from "@playwright/test";

/**
 * GradeTracker-family parity pins — the consolidated gradetracker home
 * (S195/ES).
 *
 * Split out of parity-session7.spec.ts (the S194 close's named next
 * candidate — the last S7-era founding strays + their same-file pure
 * siblings — executed in the census-clean window the standing audit
 * confirmed, the fifth consecutive clean window): every pure-GradeTracker
 * describe in the split source moved here BYTE-FAITHFULLY, declaration
 * order preserved — 2 describes / 2 pins: the S7-E founding set (the
 * award/target/chart-column summary icons at w-8 h-8) and the S173/DW2
 * grades create-dialog anatomy (the "Add New Grade" title, the Max
 * Score/Weight labels, the capitalized type select, the native date
 * input defaulting to today, the Cancel-before-submit footer order).
 * The non-gradetracker families stay in parity-session7; the
 * GradeTracker strays outside it (the a11y-sweep /GradeTracker leg, the
 * dark-mode GradeTracker washes, the navigation legs, the
 * parity-session5 batch home, the s17-fresh-user zero-data legs, the
 * resilience legs, the mixed S175/DY4 gradetracker/settings journeys,
 * the S187/EK GT-stat border leg) stay in their coverage-axis homes
 * (the S189/S191/S193/S194 boundary precedent — see
 * docs/remediation-plan-session195.md).
 *
 * The pins' contracts (unchanged by the move):
 *  - SEED-ANCHORED + READ-ONLY: the S7-E pin asserts the seeded summary
 *    icons; the S173/DW2 pin opens the create dialog and asserts its
 *    anatomy WITHOUT ever submitting — the family issues ZERO writes,
 *    never another spec's residue, no budget units at all.
 *  - CHUNK 2 home (scripts/e2e-chunked-cert.sh) — the SAME chunk as the
 *    split source, so the POST/register budgets hold by construction;
 *    the file sorts 5th in the chunk's alphabetical order (a11y-sweep <
 *    analytics < files < flashcards < gradetracker < notes) — strictly
 *    FEWER predecessors than the split source's 6th position (the two
 *    residue directions analyzed in the plan §4).
 *  - The full family map: docs/remediation-plan-session195.md.
 */


const hydrated = (page: Page) =>
  page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true");

test.describe("S7-E · Grade Tracker summary icons", () => {
  test("summary icons are the measured award/target/chart-column at w-8 h-8", async ({ page }) => {
    await page.goto("/GradeTracker");
    await hydrated(page);
    const summary = page.locator('[aria-label="Grade summary"]');
    await expect(summary).toBeVisible();
    const svgs = await summary.locator("svg").evaluateAll((els) =>
      els.map((el) => el.getAttribute("class") ?? ""),
    );
    expect(svgs.join(" ")).toContain("lucide-award");
    expect(svgs.join(" ")).toContain("lucide-target");
    expect(svgs.join(" ")).toContain("lucide-chart-column");
    for (const cls of svgs) {
      expect(cls).toContain("h-8");
      expect(cls).toContain("w-8");
    }
  });
});


// S173/DW2 — the grades create-dialog parity catch-up + the type/date
// field port (the s173 audit B/L-1). Measured live at the s173 gated
// write-path probe (TWO throwaway grade rows created through the real
// dialog — one without a subject, one with a throwaway "Probe Math"
// subject created through the reference's own Settings → Subjects
// surface — captured, DELETEd via the entity API, zero residue verified
// after each): the reference's create dialog reads title "Add New Grade"
// (an H2), a SUBJECT select FIRST, a TYPE select defaulting "Homework"
// with the six measured options (Homework / Quiz / Test / Midterm /
// Final / Project), placeholder-labeled number inputs "Score" (required)
// / "Max Score" (required) / "Weight (optional, default 1)", a NATIVE
// date input defaulting to today, and the footer's DOM order
// Cancel-then-submit ([Cancel][Add Grade]). The clone's copy was
// scaffold-era (git -S provenance: the "Add Grade" title + "e.g.
// Midterm exam" placeholder date from the initial 7b1e78d implementation
// and were never re-measured) and its Grade model could record NEITHER
// the reference's type NOR its date. The port: the GRADE_TYPES
// vocabulary + the `type`/`date` columns (schema + validation + row +
// dialog + seed + the import vocabulary — the S171/DU2b description-port
// precedent). The reference's surface carries NO title field, NO edit
// affordance, and NO delete affordance (measured: the "Add Grade" opener
// is the ONLY interactive element in main; the grade pills are read-only
// spans) — the clone's Title input + Edit icon + AlertDialog confirm are
// the documented supersets and stay. The visible-Label pattern is the
// clone's a11y superset (the S172/DV2 adjudication-7 precedent) — the
// label COPY ports ("Max Score", "Weight (optional, default 1)").
// The submit stays "Add Grade" on both hosts — identical pre-fix and
// post-fix.
// ---------------------------------------------------------------------------
test.describe("S173/DW2 · the grades create-dialog parity catch-up + the type/date field port", () => {
  test("the create dialog carries the reference's measured title, labels, type select, date input, and footer", async ({ page }) => {
    await page.goto("/GradeTracker");
    await hydrated(page);
    await page.getByRole("button", { name: "Add Grade" }).first().click();
    const dlg = page.getByRole("dialog");
    await expect(dlg).toBeVisible();
    // The measured title (RED pre-fix: the scaffold-era "Add Grade").
    await expect(dlg.getByRole("heading", { name: "Add New Grade" })).toBeVisible();
    // The measured label copy — the capital-S "Max Score" and the
    // "(optional, default 1)" weight hint (exact).
    await expect(dlg.getByText("Max Score", { exact: true })).toBeVisible();
    await expect(dlg.getByText("Weight (optional, default 1)", { exact: true })).toBeVisible();
    // The measured TYPE select: the trigger renders the "homework" default
    // capitalized — the GRADE_TYPES single source's lowercase value with
    // the exams-view `capitalize` idiom (the CSS transform owns the visual
    // "Homework"; the DOM text carries the schema value).
    await expect(dlg.locator("#grade-type")).toHaveText(/homework/);
    await expect(dlg.locator("#grade-type")).toHaveClass(/capitalize/);
    // The measured NATIVE date input (type="date"), defaulting to today.
    const dateInput = dlg.locator("#grade-date");
    await expect(dateInput).toHaveAttribute("type", "date");
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    await expect(dateInput).toHaveValue(`${yyyy}-${mm}-${dd}`);
    // The measured footer: [Cancel][Add Grade] — the secondary renders
    // BEFORE the submit (both scoped to the form's footer).
    const submit = dlg.getByRole("button", { name: "Add Grade", exact: true });
    const cancel = dlg.locator("form").getByRole("button", { name: "Cancel", exact: true });
    await expect(submit).toBeVisible();
    await expect(cancel).toBeVisible();
    const order = await dlg
      .locator("form")
      .getByRole("button")
      .evaluateAll((els) =>
        els
          .map((el, i) => ({ i, text: (el.textContent ?? "").trim() }))
          .filter((b) => b.text === "Add Grade" || b.text === "Cancel"),
      );
    expect(order.map((b) => b.text)).toEqual(["Cancel", "Add Grade"]);
  });
});
