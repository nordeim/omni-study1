import { expect, test, type Page } from "@playwright/test";

/**
 * Shared-EmptyState family parity pins — the consolidated emptystates
 * home, the SECOND AXIS home (S198/EV).
 *
 * Split out of parity-session7.spec.ts (the S197 close's named next
 * candidate — the cross-view three-family consolidation, executed in
 * the census-clean window the standing audit confirmed, the eighth
 * consecutive clean window). The family's binding axis is the
 * EmptyState ANATOMY, not a view: the one describe covers SIX views
 * (Files + Tasks + Flashcards + Exams + Timetable + Assignments),
 * every pin a zero-state anatomy port from the s184 live reference
 * re-measurement (the account at TRUE zero). The block moved here
 * BYTE-FAITHFULLY, declaration order preserved — 1 describe / 6 pins:
 *  - S184/EH the shared EmptyState family re-rotation (the py-16 px-4
 *    container, the wrapper mb-6, the 20px semibold title with mb-2,
 *    the max-w-sm hint, the PLAIN sf-gradient-shadow CTA where present;
 *    per-view: Files no-CTA, Tasks "Create Task", the Flashcards
 *    sidebar "Create Deck" + main "Select a deck" two-pane split, the
 *    Exams spanning-cell empty, the Timetable always-grid + slim
 *    My-Classes empty, the Assignments bare empty — all six zero-forced
 *    via the EA3 GET-interception pattern, all read-only, never
 *    submits).
 *
 * The non-emptystates families stay in parity-session7; the EmptyState
 * strays outside it (the s17-fresh-user zero-data legs, the a11y-sweep
 * empty-state legs, the dark-mode washes, the parity-session9
 * dashboard and MyDay empty-state pins — each in its own coverage-axis
 * or batch home) stay in their homes (the S189-S197 boundary
 * precedent — see docs/remediation-plan-session198.md).
 *
 * The pins' contracts (unchanged by the move):
 *  - CHUNK 2 home (scripts/e2e-chunked-cert.sh) — the SAME chunk as
 *    the split source, so the write budgets hold by construction (the
 *    family issues ZERO writes); the file sorts 4th in the chunk's
 *    alphabetical order (a11y-sweep, then analytics, then dialogs,
 *    then emptystates, then files) — strictly FEWER predecessors than
 *    the split source's 11th position (the S194/S195 safe direction).
 *  - The full family map: docs/remediation-plan-session198.md.
 */


const hydrated = (page: Page) =>
  page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true");



// S184/EH — the shared EmptyState family re-rotation (the s184 measured
// cycle: docs/remediation-plan-session184.md). The live reference
// re-measurement (2026-11-14, the account at TRUE zero — the S135 task +
// S79 deck residue found and cleaned through the reference's own UI):
// the family anatomy is IDENTICAL on every site — the container
// `flex flex-col items-center justify-center py-16 px-4 text-center`
// (px-4, not px-6), the wrapper `w-20 h-20 rounded-2xl … mb-6`, the
// H3 `text-xl font-semibold text-slate-800 mb-2` (the clone keeps h2 —
// the S77/AD7 heading-laxity deviation), the hint
// `text-slate-500 max-w-sm mb-6`, the CTA as the DIRECT child computing
// the PLAIN sf-gradient-shadow (the S5 lg claim superseded), and every
// empty BARE (no sf-card ancestor anywhere). Per-view: the Tasks CTA
// reads "Create Task"; the Flashcards SIDEBAR owns the zero-decks family
// empty ("Create Deck") while the MAIN pane shows "Select a deck" even
// at zero; the exams empty sits in the grid's spanning cell; the
// timetable renders the grid ALWAYS with the slim My-Classes empty.
test.describe("S184/EH · the shared EmptyState family re-rotation", () => {
  test("EH1: the family anatomy on Files — px-4, the wrapper mb-6, the title mb-2, the hint max-w-sm, no CTA", async ({ page }) => {
    // Files is the one view the seed leaves empty (the S4-C convention) —
    // but the EG pins (now the dedicated files home
    // tests/e2e/files.spec.ts, which sorts BEFORE this file in the
    // chunk's alphabetical run order) leave uploaded files behind in the
    // demo account (the AN1-cleanup exception: uploads ride the 20/15-min
    // POST budget), so the zero state is FORCED here the EA3 way (only
    // the GET intercepted; every other method passes through).
    // Order-independent by construction.
    await page.route(/\/api\/files$/, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
      } else {
        await route.continue();
      }
    });
    await page.goto("/Files");
    await hydrated(page);
    // Settled-state first (the S142 lesson): the view's loading gate ALSO
    // carries py-16 — a bare [class*='py-16'] .first() races the in-flight
    // window and reads the gate (paddingLeft 0). The heading's visibility
    // proves the EMPTY state is the rendered branch before any computed
    // style is read.
    const titleWait = page.getByRole("heading", { name: "No files yet" });
    await expect(titleWait).toBeVisible();
    const empty = page.locator("main [class*='py-16']").first();
    await expect(empty).toBeVisible();
    // The measured container: py-16 px-4 (the clone's px-6 is the drift).
    const padX = await empty.evaluate((el) => getComputedStyle(el).paddingLeft);
    expect(padX).toBe("16px");
    const padY = await empty.evaluate((el) => getComputedStyle(el).paddingTop);
    expect(padY).toBe("64px");
    // The wrapper carries mb-6 (the measured spacing rides the WRAPPER,
    // not the title's mt-4).
    const wrapper = empty.locator("div.rounded-2xl").first();
    const mb = await wrapper.evaluate((el) => getComputedStyle(el).marginBottom);
    expect(mb).toBe("24px");
    // The title: 20px/600 with mb-2 (8px), no mt-4.
    const title = empty.getByRole("heading", { name: /no files yet/i });
    await expect(title).toHaveCSS("font-size", "20px");
    await expect(title).toHaveCSS("font-weight", "600");
    const titleMb = await title.evaluate((el) => getComputedStyle(el).marginBottom);
    expect(titleMb).toBe("8px");
    const titleMt = await title.evaluate((el) => getComputedStyle(el).marginTop);
    expect(titleMt).toBe("0px");
    // The hint: max-w-sm (384px) — the measured shape.
    const hint = empty.locator("p").last();
    const maxW = await hint.evaluate((el) => getComputedStyle(el).maxWidth);
    expect(maxW).toBe("384px");
    // Files' empty carries NO CTA (measured).
    expect(await empty.getByRole("button").count()).toBe(0);
    await page.unroute(/\/api\/files$/);
  });

  test("EH2: the Tasks empty CTA reads Create Task and computes the PLAIN gradient shadow", async ({ page }) => {
    // Zero-data via the intercepted GET (the EA3 pattern — only the GET
    // routes to [], everything else passes through).
    await page.route(/\/api\/tasks$/, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
      } else {
        await route.continue();
      }
    });
    await page.goto("/Tasks");
    await hydrated(page);
    await page.waitForTimeout(800);
    // The measured CTA copy: "Create Task" (the toolbar's own Add Task is a
    // different surface and keeps its label).
    const cta = page.locator('[aria-label="Task rows"]').getByRole("button", { name: "Create Task", exact: true });
    await expect(cta).toBeVisible();
    // The measured shadow: the PLAIN sf-gradient-shadow — the 1px/3px pair
    // present, the lg's 10px 15px -3px glow ABSENT (the S5 record
    // superseded by the S184 direct measurement).
    const shadow = await cta.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(shadow).toContain("0px 1px 3px");
    expect(shadow).not.toContain("10px 15px -3px");
    await page.unroute(/\/api\/tasks$/);
  });

  test("EH3: the Flashcards two-pane zero split — the SIDEBAR family empty with Create Deck, the MAIN Select-a-deck family empty", async ({ page }) => {
    await page.route(/\/api\/flashcards\/decks$/, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
      } else {
        await route.continue();
      }
    });
    await page.goto("/Flashcards");
    await hydrated(page);
    await page.waitForTimeout(800);
    // The SIDEBAR owns the zero-decks family empty (the measured split):
    // the H3 + the hint + the Create Deck CTA inside the deck list pane.
    const sidebar = page.locator('[aria-label="Deck list pane"]');
    await expect(sidebar.getByRole("heading", { name: "No decks yet" })).toBeVisible();
    await expect(sidebar.getByText("Create your first flashcard deck", { exact: true })).toBeVisible();
    await expect(sidebar.getByRole("button", { name: "Create Deck", exact: true })).toBeVisible();
    // The MAIN pane carries the Select-a-deck family empty — rendered
    // even at zero decks (the measured reference shape; pre-port the
    // main pane carried the whole zero-decks EmptyState in an sf-card).
    const detail = page.locator('[aria-label="Deck detail"]');
    await expect(detail.getByRole("heading", { name: "Select a deck" })).toBeVisible();
    await expect(detail.getByText("Choose a flashcard deck from the sidebar", { exact: true })).toBeVisible();
    // Both family empties render BARE (no sf-card ancestor — measured).
    for (const scope of [sidebar, detail]) {
      const cards = await scope.locator(".sf-card").count();
      expect(cards).toBe(0);
    }
    await page.unroute(/\/api\/flashcards\/decks$/);
  });

  test("EH4: the Exams empty sits BARE inside the grid's spanning cell", async ({ page }) => {
    await page.route(/\/api\/exams$/, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
      } else {
        await route.continue();
      }
    });
    await page.goto("/Exams");
    await hydrated(page);
    await page.waitForTimeout(800);
    // The grid renders (the measured shape: the empty occupies the grid's
    // spanning cell, the grid itself never disappears).
    const grid = page.locator('[aria-label="Exam cards"]');
    await expect(grid).toBeVisible();
    const empty = grid.getByRole("heading", { name: "No exams found" });
    await expect(empty).toBeVisible();
    // The spanning cell: md:col-span-2 lg:col-span-3 on the empty's cell.
    const cell = empty.locator("xpath=ancestor::div[contains(@class,'col-span')][1]");
    const cls = await cell.evaluate((el) => String(el.className));
    expect(cls).toContain("sm:col-span-2");
    expect(cls).toContain("lg:col-span-3");
    // BARE: no sf-card ancestor between the empty and the grid.
    const wrapperCount = await grid.locator(".sf-card").count();
    expect(wrapperCount).toBe(0);
    await page.unroute(/\/api\/exams$/);
  });

  test("EH5: the Timetable zero state — the grid ALWAYS renders + the My Classes slim empty", async ({ page }) => {
    await page.route(/\/api\/timetable$/, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
      } else {
        await route.continue();
      }
    });
    await page.goto("/Timetable");
    await hydrated(page);
    await page.waitForTimeout(800);
    // The grid renders at zero classes (the measured reference shape —
    // pre-port the EmptyState replaced the whole grid).
    const grid = page.locator('[aria-label="Week grid"]');
    await expect(grid).toBeVisible();
    // No family EmptyState anywhere (the retired branch).
    expect(await page.locator("main [class*='py-16']").count()).toBe(0);
    // The My Classes panel carries the slim empty (the measured SHAPE —
    // the clone-accurate copy per the plan §6.9).
    await expect(page.getByText(/no classes yet/i).first()).toBeVisible();
    const slim = page.getByText(/no classes yet/i).first();
    const slimCls = await slim.evaluate((el) => String(el.className));
    expect(slimCls).toContain("text-center");
    await page.unroute(/\/api\/timetable$/);
  });

  test("EH6: the Assignments empty is BARE with the family spacing + the plain-shadow CTA", async ({ page }) => {
    await page.route(/\/api\/assignments$/, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
      } else {
        await route.continue();
      }
    });
    await page.goto("/Assignments");
    await hydrated(page);
    await page.waitForTimeout(800);
    const empty = page.locator("main [class*='py-16']").first();
    await expect(empty).toBeVisible();
    await expect(empty.getByRole("heading", { name: "No assignments yet" })).toBeVisible();
    // BARE: the pre-port sf-card wrapper retires (the measured chain —
    // container → layout div → p-4 lg:p-8 → main, no card).
    expect(await empty.locator("xpath=ancestor::div[contains(@class,'sf-card')]").count()).toBe(0);
    // The hint's max-w-sm + the CTA's plain shadow (no lg glow).
    const hint = empty.locator("p").last();
    const maxW = await hint.evaluate((el) => getComputedStyle(el).maxWidth);
    expect(maxW).toBe("384px");
    const cta = empty.getByRole("button", { name: "Add Assignment", exact: true });
    await expect(cta).toBeVisible();
    const shadow = await cta.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(shadow).toContain("0px 1px 3px");
    expect(shadow).not.toContain("10px 15px -3px");
    await page.unroute(/\/api\/assignments$/);
  });
});
