import { expect, test, type Page } from "@playwright/test";

/**
 * PracticeTests-family parity pins — the consolidated practicetests home
 * (S196/ET).
 *
 * Split out of parity-session7.spec.ts (the S195 close's named next
 * candidate — the studygroups + practicetests two-family consolidation,
 * the SECOND two-family cycle, executed in the census-clean window the
 * standing audit confirmed, the sixth consecutive clean window): every
 * pure-PracticeTests describe in the split source moved here
 * BYTE-FAITHFULLY, declaration order preserved — 3 describes / 3 pins:
 * the S7-P founding stray (the bare zero-state on a FRESH registered
 * account — the S17 pattern, empty storageState + register/verify), the
 * S130/CE2 True/False default answer (a one-question True/False test
 * saves without touching the correct-answer select — the displayed
 * default is the stored default), and the S172/DV2 create-dialog parity
 * catch-up (the "Create Practice Test" title, the measured labels,
 * placeholder, counter, and footer order). The non-practicetests
 * families stay in parity-session7 (S7-B is MIXED — studygroups +
 * practicetests — and stays per the S78/AE boundary precedent); the
 * PracticeTests strays outside the split source (the a11y-sweep
 * /PracticeTests leg, the navigation legs, the parity-session5/8/9
 * batch homes, the s17-fresh-user zero-data legs, the resilience legs)
 * stay in their coverage-axis homes (the S189-S195 boundary precedent —
 * see docs/remediation-plan-session196.md).
 *
 * The pins' contracts (unchanged by the move):
 *  - S7-P registers its OWN fresh account (empty storageState — immune
 *    to every predecessor's demo-user residue by construction); the
 *    register/verify POSTs ride WITH the pin inside chunk 2, so the
 *    chunk's register budget is unchanged.
 *  - S130/CE2 creates and asserts its OWN uniquely-titled row ("CE2
 *    True/False default probe" — no predecessor writes that string);
 *    S172/DV2 is READ-ONLY dialog anatomy (never submits — the "AI
 *    Generate Questions" assertion is a visibility check, not an API
 *    call).
 *  - CHUNK 2 home (scripts/e2e-chunked-cert.sh) — the SAME chunk as the
 *    split source; the file sorts 10th in the chunk's alphabetical
 *    order (parity-session9 < practicetests < s14-hardening) — AFTER
 *    the split source's 8th position, so the direction-1 immunity proof
 *    rides each pin's own isolation (fresh account / unique titles /
 *    read-only anatomy — the plan §4).
 *  - The full family map: docs/remediation-plan-session196.md.
 */


const hydrated = (page: Page) =>
  page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true");

test.describe("S7-P · Practice Tests bare empty state", () => {
  // The demo seed ships practice tests — the zero state needs a fresh
  // account (the S17 pattern: empty storageState + register/verify).
  test.use({ storageState: { cookies: [], origins: [] } });

  test("the empty state sits BARE on the canvas with the file-question icon (S7-P pin)", async ({ page }) => {
    // Reference (measured s69): the PT zero state floats directly on the
    // canvas — NO white card wrapper — and the icon block carries
    // file-question (the clone wrapped EmptyState in an sf-card and used
    // the pre-Y1 file-text glyph).
    const email = `s7p-${Date.now()}@studyflow.app`;
    const res = await page.request.post("/api/auth/register", {
      data: { email, password: "Fresh1234!", name: "S7P Probe" },
    });
    expect(res.ok(), `register failed: ${res.status()}`).toBe(true);
    const { code } = (await res.json()) as { code: string };
    await page.request.post("/api/auth/verify-email", { data: { email, code } });
    await page.goto("/PracticeTests");
    await hydrated(page);
    const title = page.getByRole("heading", { name: "No practice tests yet" });
    await expect(title).toBeVisible();
    const boxed = await title.evaluate((el) => {
      let node: Element | null = el;
      for (let i = 0; i < 6 && node; i++) {
        node = node.parentElement;
        if (!node) break;
        const cs = getComputedStyle(node);
        if (cs.borderTopWidth !== "0px" && cs.backgroundColor !== "rgba(0, 0, 0, 0)") {
          return { found: true, cls: node.className.slice(0, 120) };
        }
      }
      return { found: false, cls: "" };
    });
    expect(boxed.found).toBe(false);
    const icon = title.locator("xpath=preceding-sibling::div[1]").locator("svg");
    const cls = await icon.evaluate((el) => el.getAttribute("class") ?? "");
    expect(cls).toContain("lucide-file-question");
  });
});


// S130/CE2 — the True/False default answer (docs/remediation-plan-session130.md).
//
// The s130 FE audit: the question editor's True/False Select rendered
// `value={draft.correctAnswer || "True"}` — the UI SHOWED "True" selected
// while the stored draft kept correctAnswer "" — and the submit loop then
// rejected with "Question N needs a correct answer" even though the user
// saw an answer selected (the user had to re-pick True to unstick it).
// The fix seeds the stored default at the type switch (switching a draft
// TO true_false sets correctAnswer "True" — the displayed default becomes
// the stored default). The pin builds a one-question True/False test
// WITHOUT ever touching the correct-answer Select and asserts the save
// succeeds — pre-fix the toast error blocks it (RED).
test.describe("S130/CE2 · the True/False default answer", () => {
  test("a True/False question saves without touching the correct-answer select (the displayed default is the stored default)", async ({ page }) => {
    await page.goto("/PracticeTests");
    await hydrated(page);
    await page.getByRole("button", { name: "Create Test" }).first().click();
    const dlg = page.getByRole("dialog");
    await expect(dlg).toBeVisible();
    await dlg.getByLabel("Test Title").fill("CE2 True/False default probe");
    await dlg.getByLabel("Time Limit (minutes)").fill("10");
    await dlg.getByRole("button", { name: "Add question" }).click();
    // Switch the single question's type to True / False.
    await dlg.getByRole("combobox", { name: "Question 1 type" }).click();
    await page.getByRole("option", { name: "True / False" }).click();
    await dlg.getByLabel("Question 1 text").fill("The stored default matches the displayed default.");
    // Save WITHOUT touching the correct-answer Select — the displayed
    // "True" must be the stored value. (The submit button inside the
    // dialog reads "Create Test" — same name as the page's opener, so the
    // locator is dialog-scoped.)
    await dlg.getByRole("button", { name: "Create Test" }).click();
    await expect(dlg).not.toBeVisible();
    // The saved card surfaces in the list with its question count.
    await expect(page.locator("main").getByText("CE2 True/False default probe").first()).toBeVisible();
  });
});


// S172/DV2 — the practiceTests create-dialog parity catch-up (the s172
// audit B/L-1). Measured live at the s172 gated write-path probe (TWO
// throwaway rows created through the real dialog, captured, DELETEd —
// zero residue verified after each): the reference's create dialog reads
// title "Create Practice Test" (an H2), a title INPUT with label
// "Test Title *" (the required asterisk) and placeholder "e.g., Biology
// Chapter 5 Review", a "N questions added" counter (the clone's
// "{n} questions added" already matches exactly), and the footer's DOM
// order submit-then-secondary ("Create Test" then "Close"). The clone's
// copy was scaffold-era (git -S provenance: the "Create Test" title +
// "e.g. Algebra Chapter 4 Quiz" placeholder date from the initial
// 7b1e78d implementation and were never re-measured) and the footer was
// Cancel-BEFORE-submit. The reference carries NO manual add-question
// affordance, NO subject picker, and NO edit affordance at all (the card
// menu measured Delete-only twice) — the clone's manual editor + Subject
// select + Edit leg are the documented supersets and stay. The submit
// stays "Create Test" on both hosts — identical pre-fix and post-fix.
// ---------------------------------------------------------------------------
test.describe("S172/DV2 · the practiceTests create-dialog parity catch-up", () => {
  test("the create dialog carries the reference's measured title, label, placeholder, and footer", async ({ page }) => {
    await page.goto("/PracticeTests");
    await hydrated(page);
    await page.getByRole("button", { name: "Create Test" }).first().click();
    const dlg = page.getByRole("dialog");
    await expect(dlg).toBeVisible();
    // The measured title (RED pre-fix: the scaffold-era "Create Test").
    await expect(dlg.getByRole("heading", { name: "Create Practice Test" })).toBeVisible();
    // The measured label — the required asterisk included (exact).
    await expect(dlg.getByText("Test Title *", { exact: true })).toBeVisible();
    // The measured title placeholder.
    await expect(dlg.locator("#test-title")).toHaveAttribute(
      "placeholder",
      "e.g., Biology Chapter 5 Review",
    );
    // The measured footer: submit "Create Test" + secondary "Close".
    // The secondary is scoped to the FORM — the clone's shared shadcn
    // dialog chrome adds a top-right X whose sr-only name is also
    // "Close" (the documented superset; the reference carries no X —
    // its measured dialog has ONE Close, the footer text button).
    const submit = dlg.getByRole("button", { name: "Create Test", exact: true });
    const close = dlg.locator("form").getByRole("button", { name: "Close", exact: true });
    await expect(submit).toBeVisible();
    await expect(close).toBeVisible();
    // The measured DOM ORDER: the submit renders BEFORE the secondary
    // (both scoped to the form's footer).
    const order = await dlg
      .locator("form")
      .getByRole("button")
      .evaluateAll((els) =>
        els
          .map((el, i) => ({ i, text: (el.textContent ?? "").trim() }))
          .filter((b) => b.text === "Create Test" || b.text === "Close"),
      );
    expect(order.map((b) => b.text)).toEqual(["Create Test", "Close"]);
  });
});
