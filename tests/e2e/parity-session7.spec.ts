import { expect, test, type Page } from "@playwright/test";

/**
 * Session-7 parity pins — lightly-probed views (the Flashcards family moved to
 * tests/e2e/flashcards.spec.ts at S191/EO).
 *
 * Every pin here was measured on the live reference
 * (https://omni-study1.base44.app, authed) after creating a real reference
 * deck + card ("Audit Biology Deck") and probing the Timetable / Analytics /
 * Grade Tracker / Study Groups / Practice Tests / Notes surfaces. See
 * docs/remediation-plan-session7.md for the measured values:
 *
 *  S7-A Flashcards two-panel layout: colored deck rows, swatch dialog,
 *      card grid + difficulty badges, 3D-flip study mode, AI Generate
 *  S7-A/AD/S80/S81[AH6]/S82/S88/S89/BX8/BZ1 — the flashcards
 *      family MOVED to tests/e2e/flashcards.spec.ts at S191/EO
 *      (the flashcards-family consolidation: every
 *      pure-flashcards describe now lives there; this file
 *      keeps the non-flashcards families — see
 *      docs/remediation-plan-session191.md)
 *  S7-B Study Groups swatch palette + Practice Tests dialog (questions +
 *      AI Generate Questions)
 *  S7-C Timetable grid-cols-8 week grid (day heads, 60px hours, "7 AM"
 *      labels, mobile accordion) + My Classes today-date header — MOVED
 *      to tests/e2e/timetable.spec.ts at S193/EQ (the timetable-family
 *      consolidation: every pure-timetable describe now lives there;
 *      this file keeps the non-timetable families — see
 *      docs/remediation-plan-session193.md)
 *  S7-D Analytics icon-block stat cards + 7-day chart cards
 *  S7-E Grade Tracker summary icons (award/target/chart-column, w-8 h-8)
 *  S7-F Notes editor title input — MOVED to tests/e2e/notes.spec.ts
 *    at S189/EM (the notes-family consolidation: every notes-view
 *    describe now lives there; this file keeps the non-notes
 *    families — see docs/remediation-plan-session189.md)
 */

const hydrated = (page: Page) =>
  page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true");

const rgb = (r: number, g: number, b: number) => `rgb(${r}, ${g}, ${b})`;

test.describe("S7-B · Study Groups + Practice Tests dialogs", () => {
  test("the group dialog swatches are the measured emerald/amber set", async ({ page }) => {
    await page.goto("/StudyGroups");
    await hydrated(page);
    // S8-H rework: the desktop pane's create affordance is the 36px gradient
    // plus button (aria-label "Create study group").
    await page.getByRole("button", { name: "Create study group" }).click();
    const swatches = page.getByRole("dialog").locator('[aria-label="Group color swatches"] > button');
    await expect(swatches).toHaveCount(6);
    const colors = await swatches.evaluateAll((els) =>
      els.map((el) => getComputedStyle(el).backgroundColor),
    );
    expect(colors[0]).toBe(rgb(139, 92, 246)); // violet-500
    expect(colors[2]).toBe(rgb(16, 185, 129)); // emerald-500 (measured)
    expect(colors[3]).toBe(rgb(245, 158, 11)); // amber-500 (measured)
    expect(colors[4]).toBe(rgb(239, 68, 68)); // red-500 before pink (measured order)
    expect(colors[5]).toBe(rgb(236, 72, 153)); // pink-500
  });

  test("the practice-test dialog renders title + time limit + AI Generate Questions", async ({ page }) => {
    await page.goto("/PracticeTests");
    await hydrated(page);
    await page.getByRole("button", { name: "Create Test" }).first().click();
    const dlg = page.getByRole("dialog");
    await expect(dlg.getByText("Test Title")).toBeVisible();
    await expect(dlg.getByText("Time Limit (minutes)")).toBeVisible();
    const timeInput = dlg.locator('input[type="number"]');
    await expect(timeInput).toHaveValue("60");
    await expect(dlg.getByRole("button", { name: "AI Generate Questions" })).toBeVisible();
    await expect(dlg.getByText(/questions added/)).toBeVisible();
    // Seeded tests expose their questions in the list view.
  });

  test("a seeded practice test exposes its question count", async ({ page }) => {
    await page.goto("/PracticeTests");
    await hydrated(page);
    const card = page.locator("main").locator("div", { hasText: "Vectors practice set" }).filter({
      has: page.getByText(/question/i),
    });
    await expect(card.first()).toBeVisible();
  });
});



test.describe("S7-D · Analytics stat cards + charts", () => {
  test("stat cards are r12 border-0 cards with 48px tinted icon blocks", async ({ page }) => {
    await page.goto("/Analytics");
    await hydrated(page);
    const card = page.locator('[aria-label="Analytics stats"] > *', { hasText: "Tasks Completed" }).first();
    await expect(card).toBeVisible();
    const cs = await card.evaluate((el) => {
      const s = getComputedStyle(el);
      return { radius: s.borderRadius, borderWidth: s.borderTopWidth };
    });
    expect(cs.radius).toBe("12px");
    expect(cs.borderWidth).toBe("0px"); // border-0
    const icon = card.locator("div[class*='w-12']").first();
    const iconCs = await icon.evaluate((el) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return { bg: s.backgroundColor, w: r.width, h: r.height };
    });
    expect(iconCs.w).toBe(48);
    expect(iconCs.h).toBe(48);
    expect(iconCs.bg).toBe(rgb(237, 233, 254)); // violet-100 (measured)
    // Fraction value + completion-rate sub.
    await expect(card.getByText(/\d+\/\d+/)).toBeVisible();
    await expect(card.getByText(/completion rate/)).toBeVisible();
  });

  test("the four measured stat labels + icon tints render", async ({ page }) => {
    await page.goto("/Analytics");
    await hydrated(page);
    const stats = page.locator('[aria-label="Analytics stats"]');
    for (const label of ["Tasks Completed", "Assignments", "Focus Time", "Upcoming Exams"]) {
      await expect(stats.getByText(label, { exact: true })).toBeVisible();
    }
    const assignments = stats.locator("> *", { hasText: "Assignments" }).first();
    const blue = await assignments.locator("div[class*='w-12']").evaluate((el) =>
      getComputedStyle(el).backgroundColor,
    );
    expect(blue).toBe(rgb(219, 234, 254)); // blue-100
    const focus = stats.locator("> *", { hasText: "Focus Time" }).first();
    const green = await focus.locator("div[class*='w-12']").evaluate((el) =>
      getComputedStyle(el).backgroundColor,
    );
    expect(green).toBe(rgb(220, 252, 231)); // green-100 (measured on the reference)
    const exams = stats.locator("> *", { hasText: "Upcoming Exams" }).first();
    const orange = await exams.locator("div[class*='w-12']").evaluate((el) =>
      getComputedStyle(el).backgroundColor,
    );
    expect(orange).toBe(rgb(255, 237, 213)); // orange-100
  });

  test("chart cards carry the measured 7-day titles", async ({ page }) => {
    await page.goto("/Analytics");
    await hydrated(page);
    await expect(page.getByText("Task Activity (Last 7 Days)")).toBeVisible();
    await expect(page.getByText("Focus Time (Last 7 Days)")).toBeVisible();
  });
});


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



test.describe("S78 · Batch AE hardening (the s78 audit)", () => {
  test("AE1: an immediate Save during the editor's load window never PATCHes empty content", async ({ page }) => {
    await page.goto("/Notes");
    await hydrated(page);

    // Capture every note PATCH's body.
    const patches: { url: string; body: string }[] = [];
    await page.route(/\/api\/notes\//, async (route) => {
      const req = route.request();
      if (req.method() === "PATCH") {
        patches.push({ url: req.url(), body: req.postData() ?? "" });
      }
      await route.continue();
    });
    // Delay every not-yet-loaded chunk — the next chunk request after the
    // note click IS the Quill dynamic import, so the editor's load window
    // becomes deterministic (~1.5s).
    await page.route(/\/static\/chunks\/.+\.js$/, async (route) => {
      await new Promise((r) => setTimeout(r, 1500));
      await route.continue();
    });

    // Select the populated note, then click Save DURING the load window
    // (before the Quill instance exists — the empty-overwrite scenario).
    // S178/EB: the note opens in VIEW — the Quill (and its dynamic
    // import) mounts on the EDIT switch, so the load window rides the
    // Edit click now; the Save clicks DURING it (the same race).
    await page.getByRole("button", { name: /Dot product intuition/ }).first().click();
    await page.locator('[aria-label="Note editor pane"]').getByRole("button", { name: "Edit", exact: true }).click();
    await page.getByRole("button", { name: "Save", exact: true }).click();

    // The Save PATCH must have fired — carrying the ORIGINAL content (the
    // `?? selected.content` fallback), never "" (the data-loss bug).
    await page.waitForTimeout(400);
    expect(patches.length).toBeGreaterThanOrEqual(1);
    const savePatch = patches[0];
    const payload = JSON.parse(savePatch.body) as { content?: string };
    expect(payload.content).toBeTruthy();
    expect(payload.content).toContain("dot product measures alignment");
    for (const p of patches) {
      const body = JSON.parse(p.body) as { content?: string };
      expect(body.content).not.toBe("");
    }

    await page.unroute(/\/api\/notes\//);
    await page.unroute(/\/static\/chunks\/.+\.js$/);
  });

  test("AE2: an aborted autosave PATCH surfaces exactly one failure toast per streak", async ({ page }) => {
    await page.goto("/Notes");
    await hydrated(page);
    await page.getByRole("button", { name: /Dot product intuition/ }).first().click();
    // S178/EB: the note opens in VIEW — the autosave surface is the edit
    // toolbar now (the re-anchor: the Edit switch first).
    await page.locator('[aria-label="Note editor pane"]').getByRole("button", { name: "Edit", exact: true }).click();
    const editor = page.locator(".ql-editor");
    await expect(editor).toBeVisible();

    // Abort every note PATCH — the transport failure class (offline).
    await page.route(/\/api\/notes\//, async (route) => {
      if (route.request().method() === "PATCH") await route.abort("failed");
      else await route.continue();
    });

    const toasts = page.getByRole("region", { name: "Notifications" }).locator("button");
    // First burst: type → debounce (600ms) → the PATCH aborts → ONE toast.
    await editor.click();
    await page.keyboard.type("first burst");
    await page.waitForTimeout(1100);
    await expect(toasts).toHaveCount(1);
    await expect(toasts.first()).toContainText(/offline|autosave/i);

    // Second burst in the same failure streak: another debounce + abort,
    // but NO second toast (once per streak — the dedup).
    await page.keyboard.type(" more");
    await page.waitForTimeout(1100);
    await expect(toasts).toHaveCount(1);

    // S79/AF3 (the s79 audit, F2): switching notes resets the streak flag
    // — note B's FIRST failure must get its own toast (the pre-fix flag
    // latched across the switch and silently swallowed B's failure).
    // S178/EB: the switch lands in VIEW — note B's Edit switch rides too.
    await page.getByRole("button", { name: /Kinetics summary/ }).first().click();
    await page.locator('[aria-label="Note editor pane"]').getByRole("button", { name: "Edit", exact: true }).click();
    const editorB = page.locator(".ql-editor");
    await expect(editorB).toBeVisible();
    await editorB.click();
    await page.keyboard.type("note b burst");
    await page.waitForTimeout(1100);
    await expect(toasts).toHaveCount(2);

    await page.unroute(/\/api\/notes\//);
  });

  // S79/AF1 REWRITE: the s78 pin assumed the deck list stays interactive
  // during study — the s79 reference re-measure showed the ref's study
  // mode REPLACES the whole view (the deck list is ABSENT during study at
  // BOTH viewports; the ref's innerText during study is exactly
  // "Exit Study N / M [card] Click card to flip"). The switch semantics
  // the old pin drove (a mid-study deck click) cannot happen on the ref's
  // UI; the index-reset contract now lives in the exit → switch → Study
  // path (startStudy always resets to card 1 of the newly selected deck).
  test("AE4/S79: during study the deck list is absent; Study after switching decks starts the new deck at card 1", async ({ page }) => {
    await page.goto("/Flashcards");
    await hydrated(page);
    // S126/CA6: the journey rides Biology (3 cards) → Spanish (2 cards) —
    // the remediated seed's honest multi-card decks (the old leg pinned
    // the mislabeled 4-card "Integration rules" + the mislabeled 2-card
    // "Biology" that actually held the Spanish cards).
    await page.locator('[aria-label="Deck rows"] > *', { hasText: "Biology Chapter 5" }).first().click();
    await page.locator('[aria-label="Deck detail"]').getByRole("button", { name: "Study" }).click();
    const study = page.locator('[aria-label="Study mode"]');
    await expect(study.getByText(/^1 \/ 3$/)).toBeVisible();
    await study.locator("[data-flip-card]").click();
    await study.getByRole("button", { name: "Correct", exact: true }).click();
    await expect(study.getByText(/^2 \/ 3$/)).toBeVisible();

    // During study the deck list is ABSENT (the ref's measured
    // full-replacement shape — the whole two-pane layout swaps out).
    await expect(page.locator('[aria-label="Deck list pane"]')).toHaveCount(0);
    await expect(page.locator('[aria-label="Deck detail"]')).toHaveCount(0);

    // Exit Study restores the two-pane layout…
    await study.getByRole("button", { name: "Exit Study" }).click();
    await expect(page.locator('[aria-label="Deck list pane"]')).toBeVisible();
    await expect(page.locator('[aria-label="Deck detail"]')).toBeVisible();

    // …and switching decks THEN studying starts the new deck from card 1
    // — never the stale 2-of-3 index into the 2-card Spanish deck.
    await page.locator('[aria-label="Deck rows"] > *', { hasText: "Spanish Vocabulary" }).first().click();
    await page.locator('[aria-label="Deck detail"]').getByRole("button", { name: "Study" }).click();
    await expect(study.getByText(/^1 \/ 2$/)).toBeVisible();
  });

  // S79/AF1 (measured on the reference at 1280×800): the study column
  // centers in the CONTENT area (not the squeezed right pane) — the Exit
  // button anchors the `w-full max-w-2xl` column's LEFT edge and the
  // counter rides the same justify-between row's RIGHT edge (the ref
  // measured Exit x=434, counter x=1070, one row, y-aligned).
  test("AF1: the study chrome centers in the content area with the Exit+counter on one justify-between row", async ({ page }) => {
    await page.goto("/Flashcards");
    await hydrated(page);
    // S126/CA6: the chrome geometry rides the 3-card Biology deck.
    await page.locator('[aria-label="Deck rows"] > *', { hasText: "Biology Chapter 5" }).first().click();
    await page.locator('[aria-label="Deck detail"]').getByRole("button", { name: "Study" }).click();
    const study = page.locator('[aria-label="Study mode"]');
    await expect(study).toBeVisible();

    // The Exit + counter share ONE row: y-aligned, counter to the RIGHT
    // of the Exit button (the ref's justify-between chrome).
    const exit = study.getByRole("button", { name: "Exit Study" });
    const counter = study.getByText(/^1 \/ 3$/);
    await expect(exit).toBeVisible();
    await expect(counter).toBeVisible();
    const exitBox = await exit.boundingBox();
    const counterBox = await counter.boundingBox();
    expect(exitBox).not.toBeNull();
    expect(counterBox).not.toBeNull();
    expect(Math.abs(exitBox!.y - counterBox!.y)).toBeLessThan(12); // one row
    expect(counterBox!.x).toBeGreaterThan(exitBox!.x + exitBox!.width); // counter right

    // The study column centers in the viewport's content area (the shell
    // sidebar owns the left 260px at 1280): the column's center ≈ the
    // content area's center (770 ± 40px tolerance for the pane padding).
    const flip = study.locator("[data-flip-card]");
    const flipBox = await flip.boundingBox();
    expect(flipBox).not.toBeNull();
    const columnCenter = flipBox!.x + flipBox!.width / 2;
    expect(Math.abs(columnCenter - 770)).toBeLessThan(40);
  });
});


test.describe("S81 · the calculator keypad structural guard (AH4b, re-anchored S190/EN)", () => {
  test("AH4b: the Basic pad is the measured row-1 pair + the single-cell gradient Equals", async ({ page }) => {
    await page.goto("/Calculator");
    await hydrated(page);

    // S190/EN re-anchor: the reference's Basic pad re-measured 2026-11-15 —
    // the old AH4b footer (Backspace + ^ + col-span-2 Equals) was drift;
    // the measured pad is the near-black Clear + icon-only Backspace row-1
    // pair over the 4×4 digit grid with the single-cell gradient Equals.
    // (The full anatomy lives in calculator.spec.ts's S190 describe; this
    // pin keeps the S81 structural vantage — the spans and the fill.)
    const backspace = page.getByRole("button", { name: "Backspace" });
    await expect(backspace).toBeVisible();
    const bs = await backspace.evaluate((el) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return { bg: s.backgroundColor, h: r.height, w: Math.round(r.width), text: el.textContent.trim() };
    });
    expect(bs.bg).toBe("rgb(10, 10, 10)"); // the near-black row-1 family (measured)
    expect(bs.h).toBe(56); // h-14 — both hosts
    expect(bs.w).toBeGreaterThanOrEqual(200); // span-2 ≈ 203px at 1440
    expect(bs.text).toBe(""); // icon-only (measured)

    // No caret key on Basic anymore — the power function is xʸ on Scientific.
    await expect(page.getByRole("button", { name: "Insert ^" })).toHaveCount(0);

    // The Equals is a SINGLE-CELL key inside the digit grid (the inverse of
    // the old col-span-2 footer contract — the S82/AI4 anti-tautology
    // discipline, re-anchored to the measured shape).
    const equals = page.getByRole("button", { name: "Equals" });
    await expect(equals).toBeVisible();
    const eqBox = await equals.boundingBox();
    expect(eqBox).not.toBeNull();
    expect(eqBox!.width).toBeLessThanOrEqual(102); // one cell ≈ 98px at 1440
    const eqBg = await equals.evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(eqBg).toContain("linear-gradient"); // the sf-gradient
  });
});


// S82 · Batch AI (session-82) — the sixteenth delegate. The AH8
// sent-keys filter lives ONLY in makeOwnedDelegate.update; the
// hand-written flashcardCardDelegate (Flashcard carries no userId —
// ownership rides the deck join) still writes the FULL parsed object,
// and flashcardSchema carries create-time defaults
// (difficulty:"medium", mastered:false) that zod@4's .partial()
// materializes on every partial PATCH:
//   AI1a the study-rating payload {mastered:true} silently reverts a
//        hard card's difficulty to "medium" (flashcards-view rate()).
//   AI1b the edit-dialog payload {front,back,difficulty} silently
//        un-masters a mastered card (mastered resets to false).
//   AI1c the study-mode UI round-trip — Correct on a hard card keeps
//        the card hard end-to-end (the full user path).
// ---------------------------------------------------------------------------



// S127/CB13 — the analytics "avg progress" derivation (the s127 FE audit's
// M-7): the caption computed the completion RATIO (the share of
// assignments at 100%) while the label promises the average progress. The
// seeded state: 80/40/45/25/60/0 → mean 41.67 → "42% avg progress" (the
// pre-fix completion ratio rendered "0% avg progress" — 0 of 6 at 100%).
// The reference's own populated semantics are unmeasurable (its demo data
// carries no assignments — verified live 2026-11-02: its Tasks view reads
// 0 tasks, its calendar only the one Nov 12 exam), so the label-honest
// derivation ships.
test.describe("S127/CB13 · the analytics Assignments card renders the true average progress", () => {
  test("the seeded state renders the mean of progress (42%), not the completion ratio", async ({ page }) => {
    await page.goto("/Analytics");
    await hydrated(page);
    const stats = page.locator('[aria-label="Analytics stats"]');
    const assignments = stats.locator("> *", { hasText: "Assignments" }).first();
    await expect(assignments.getByText("42% avg progress")).toBeVisible();
    // The fraction stays the completion census: 0 of 6 seeded assignments
    // sit at 100%.
    await expect(assignments.getByText("0/6")).toBeVisible();
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


// ---------------------------------------------------------------------------
// S171/DU2 — the studygroups create-dialog parity catch-up + the
// description port (the s171 audit B/L-1 + I-1). Measured live at the
// s171 gated write-path probe (one throwaway row created, captured,
// DELETEd — zero residue verified): the reference's create dialog reads
// title "Create Study Group", a name INPUT (placeholder "e.g., Math
// Study Squad"), a description TEXTAREA (placeholder "What's this group
// about?"), the six swatches (the clone's GROUP_COLORS already match
// exactly), and the footer's DOM order submit-then-secondary ("Create
// Group" then "Close"). The clone's copy was scaffold-era (git -S
// provenance: the "New Study Group" title + "e.g. Calculus cram crew"
// placeholder date from the initial 7b1e78d implementation and were
// never re-measured) and the family carried NO description field
// end-to-end. The description ports bounded at 500 (the deck family's
// 1_000-char description the precedent; the bounded-everything posture)
// with the clone's visible-Label superset over the reference's
// placeholder-only inputs. The reference's own create→list flow is
// BROKEN (the POST commits, the list GET returns [] — measured), so the
// round-trip leg pins the CLONE's working surface (the documented
// superset posture).
// ---------------------------------------------------------------------------
test.describe("S171/DU2 · the studygroups create-dialog parity catch-up + the description round-trip", () => {
  test("the create dialog carries the reference's measured title, placeholders, and footer", async ({ page }) => {
    await page.goto("/StudyGroups");
    await hydrated(page);
    await page.getByRole("button", { name: "Create study group" }).click();
    const dlg = page.getByRole("dialog");
    await expect(dlg).toBeVisible();
    // The measured title (RED pre-fix: the scaffold-era "New Study
    // Group").
    await expect(dlg.getByRole("heading", { name: "Create Study Group" })).toBeVisible();
    // The measured name placeholder (S176/DZ2 re-measured the label —
    // "Group Name \*" now, the scaffold-era "Name" retired).
    await expect(dlg.getByLabel("Group Name *")).toHaveAttribute("placeholder", "e.g., Math Study Squad");
    // The measured description textarea (the clone's visible-Label
    // superset over the reference's placeholder-only input).
    const description = dlg.getByLabel("Description");
    await expect(description).toHaveAttribute("placeholder", "What's this group about?");
    await expect(description).toBeVisible();
    // The measured footer: submit "Create Group" + secondary "Close".
    // The secondary is scoped to the FORM — the clone's shared shadcn
    // dialog chrome adds a top-right X whose sr-only name is also
    // "Close" (the documented superset; the reference carries no X —
    // its measured dialog has ONE Close, the footer text button).
    const submit = dlg.getByRole("button", { name: "Create Group", exact: true });
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
          .filter((b) => b.text === "Create Group" || b.text === "Close"),
      );
    expect(order.map((b) => b.text)).toEqual(["Create Group", "Close"]);
  });

  test("a description entered in the create dialog survives the round-trip into the detail pane", async ({ page }) => {
    const stamp = `s171-du2-${Date.now()}`;
    await page.goto("/StudyGroups");
    await hydrated(page);
    await page.getByRole("button", { name: "Create study group" }).click();
    const dlg = page.getByRole("dialog");
    await expect(dlg).toBeVisible();
    await dlg.getByLabel("Group Name *").fill(`S171-DU2 description probe ${stamp}`);
    await dlg.getByLabel("Description").fill("We drill problem sets every Tuesday before the bus leaves.");
    const saved = page.waitForResponse(
      (r) => r.request().method() === "POST" && r.url().includes("/api/study-groups"),
    );
    await dlg.getByRole("button", { name: "Create Group", exact: true }).click();
    const res = await saved;
    expect(res.ok()).toBe(true);
    const createdId = ((await res.json()) as { id: string }).id;
    try {
      // The success toast + the closed dialog (the create resolved).
      await expect(page.getByText("Study group created")).toBeVisible({ timeout: 10_000 });
      await expect(dlg).toBeHidden();
      // Select the new group — the detail pane renders the description.
      await page.getByRole("button", { name: new RegExp(`S171-DU2 description probe ${stamp}`) }).first().click();
      const detail = page.locator('[aria-label="Study group detail pane"]');
      await expect(detail.getByText("We drill problem sets every Tuesday before the bus leaves.")).toBeVisible();
    } finally {
      // Zero residue on the shared demo user (the CC4/AR3 convention).
      await page.request.delete(`/api/study-groups/${createdId}`);
    }
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


// S174/DX4 — the holidays create-dialog parity catch-up + the
// start/end/type field port (the s174 audit B/L-3). Measured live at the
// s174 gated probe (the reference's Add Holiday dialog opened on a fresh
// account: title "Add Holiday" (an H2), "Name *" (placeholder "e.g.,
// Winter Break"), "Start Date *" + "End Date *" (both native date
// inputs, required, NO defaults — the pristine dialog measured empty),
// "Type" (a three-option selector: Holiday / Break / No School; the
// default reads "Holiday"), and the footer's DOM order
// Cancel-then-submit ([Cancel][Add Holiday])). The clone's dialog was
// scaffold-era (label "Name" + placeholder "e.g. Spring break" + a
// SINGLE "Date" field + no Type selector). The port: the HOLIDAY_TYPES
// vocabulary + the `endDate`/`type` columns (schema + validation + row +
// dialog + list render + seed + the import vocabulary — the S173/DW2
// field-port precedent). The reference's own create flow is BROKEN (the
// entity POST answers 403 "Permission denied for create operation on
// Holiday entity" — reproduced through the real dialog AND directly
// against the entity API with the page's own Bearer token) — the
// reference's list could not be measured; the dialog's FIELD SET is the
// port authority and the clone's create flow keeps working (the
// functional superset). The visible-Label pattern is the clone's a11y
// superset (the S172/DV2 adjudication-7 precedent) — the label COPY
// ports ("Name *", "Start Date *", "End Date *", "Type"). The submit
// stays "Add Holiday" on both hosts — identical pre-fix and post-fix.
// ---------------------------------------------------------------------------
test.describe("S174/DX4 · the holidays create-dialog parity catch-up + the start/end/type field port", () => {
  test("the create dialog carries the reference's measured labels, range fields, type selector, and footer", async ({ page }) => {
    await page.goto("/Settings");
    await hydrated(page);
    await page.getByRole("tab", { name: "Holidays" }).click();
    await expect(page.getByRole("heading", { name: "Holidays & Breaks" })).toBeVisible();
    await page.getByRole("button", { name: "Add Holiday" }).first().click();
    const dlg = page.getByRole("dialog");
    await expect(dlg).toBeVisible();
    // The measured label copy (RED pre-fix: the scaffold-era "Name"
    // without the asterisk + the placeholder "e.g. Spring break").
    await expect(dlg.getByText("Name *", { exact: true })).toBeVisible();
    await expect(dlg.locator("#holiday-name")).toHaveAttribute("placeholder", "e.g., Winter Break");
    // The measured RANGE fields — both native date inputs, required,
    // with NO defaults (the pristine measurement: both empty).
    const start = dlg.locator("#holiday-start");
    const end = dlg.locator("#holiday-end");
    await expect(start).toHaveAttribute("type", "date");
    await expect(end).toHaveAttribute("type", "date");
    await expect(start).toHaveValue("");
    await expect(end).toHaveValue("");
    await expect(dlg.getByText("Start Date *", { exact: true })).toBeVisible();
    await expect(dlg.getByText("End Date *", { exact: true })).toBeVisible();
    // The measured TYPE selector: three buttons in the measured order
    // with "Holiday" active by default (the aria-pressed idiom).
    await expect(dlg.getByText("Type", { exact: true })).toBeVisible();
    const typeButtons = dlg.getByRole("button", { name: /^(Holiday|Break|No School)$/ });
    await expect(typeButtons).toHaveCount(3);
    await expect(typeButtons.nth(0)).toHaveAttribute("aria-pressed", "true");
    await expect(typeButtons.nth(1)).toHaveAttribute("aria-pressed", "false");
    await expect(typeButtons.nth(2)).toHaveAttribute("aria-pressed", "false");
    // The measured footer: [Cancel][Add Holiday] — the secondary renders
    // BEFORE the submit (both scoped to the form's footer).
    const submit = dlg.getByRole("button", { name: "Add Holiday", exact: true });
    const cancel = dlg.locator("form").getByRole("button", { name: "Cancel", exact: true });
    await expect(submit).toBeVisible();
    await expect(cancel).toBeVisible();
    const order = await dlg
      .locator("form")
      .getByRole("button")
      .evaluateAll((els) =>
        els
          .map((el, i) => ({ i, text: (el.textContent ?? "").trim() }))
          .filter((b) => b.text === "Add Holiday" || b.text === "Cancel"),
      );
    expect(order.map((b) => b.text)).toEqual(["Cancel", "Add Holiday"]);
  });
});


// S175/DY1 — the subject-dialog parity catch-up + the teacher/room field
// port (the s175 audit B/M-1). Measured live at the s175 reference probe
// (the reference's Add Subject dialog opened on the seeded account: the
// asterisked "Subject Name *" label + the "e.g., Mathematics" placeholder;
// the "Color" field over a SEVENTEEN-swatch palette at 32px/rounded-lg —
// the Tailwind v3 500-ramp order red #ef4444 → … → rose #f43f5e, the
// violet #8b5cf6 pristine default at index 12 carrying the white-ring +
// scale(1.1) selection state; the "Teacher (optional)" field + the
// "e.g., Mr. Smith" placeholder; the "Room (optional)" field + the
// "e.g., Room 101" placeholder; the footer [Cancel][Add Subject]). The
// clone's dialog was s169-era (label "Name" + placeholder "e.g. Biology" +
// 8-color scaffold palette at 28px rounded-full + no teacher/room). The
// port: the `teacher`/`room` columns (schema + validation + row + the
// row's teacher/room metadata render + seed — the S174/DX4 field-port
// precedent). The reference's write path WORKS this time (the probe
// exercised create → row render → delete live, zero residue — the H3
// name 16px/600 + teacher 14px slate-500 + room 12px slate-400), so both
// the FIELD SET and the ROW RENDER are measured authorities. The clone's
// aria-pressed swatches + aria-labels + the Custom color input + the
// labeled-controls a11y surface STAY (the documented superset — the
// S172/DV2 adjudication-7 precedent); the swatch GEOMETRY ports (the
// fresh s175 measurement supersedes the s169-era guess — the DX2
// icon-drift precedent).
// ---------------------------------------------------------------------------
test.describe("S175/DY1 · the subject create-dialog parity catch-up + the teacher/room field port", () => {
  test("the create dialog carries the reference's measured labels, 17-swatch palette, teacher/room fields, and footer", async ({ page }) => {
    await page.goto("/Settings");
    await hydrated(page);
    await page.getByRole("tab", { name: "Subjects" }).click();
    await expect(page.getByRole("heading", { name: "Subjects" })).toBeVisible();
    await page.getByRole("button", { name: "Add Subject" }).first().click();
    const dlg = page.getByRole("dialog");
    await expect(dlg).toBeVisible();
    // The measured label copy (RED pre-fix: the s169-era "Name" without
    // the asterisk).
    await expect(dlg.getByText("Subject Name *", { exact: true })).toBeVisible();
    await expect(dlg.locator("#subject-name")).toHaveAttribute("placeholder", "e.g., Mathematics");
    // The measured TEACHER + ROOM fields — both optional, both absent
    // pre-fix (RED at the label assertions).
    await expect(dlg.getByText("Teacher (optional)", { exact: true })).toBeVisible();
    await expect(dlg.locator("#subject-teacher")).toHaveAttribute("placeholder", "e.g., Mr. Smith");
    await expect(dlg.getByText("Room (optional)", { exact: true })).toBeVisible();
    await expect(dlg.locator("#subject-room")).toHaveAttribute("placeholder", "e.g., Room 101");
    // The measured palette: SEVENTEEN swatches (RED pre-fix: the
    // 8-color scaffold set renders).
    const swatches = dlg.locator("button[aria-label^='Color #']");
    await expect(swatches).toHaveCount(17);
    // The measured pristine default: violet #8b5cf6 pressed (the s175
    // probe measured the index-12 swatch selected on a fresh open).
    const pressed = dlg.locator("button[aria-label^='Color #'][aria-pressed='true']");
    await expect(pressed).toHaveCount(1);
    await expect(pressed.first()).toHaveAttribute("aria-label", "Color #8b5cf6");
    // The measured swatch geometry: 32px rounded-lg (the s175 probe's
    // computed width/radius — the s169-era 28px rounded-full was the
    // scaffold guess).
    const box = await swatches.first().boundingBox();
    expect(box?.width).toBe(32);
    await expect(swatches.first()).toHaveCSS("border-radius", "8px");
    // The measured footer: [Cancel][Add Subject] — the secondary renders
    // BEFORE the submit (both scoped to the form's footer).
    const submit = dlg.getByRole("button", { name: "Add Subject", exact: true });
    const cancel = dlg.locator("form").getByRole("button", { name: "Cancel", exact: true });
    await expect(submit).toBeVisible();
    await expect(cancel).toBeVisible();
    const order = await dlg
      .locator("form")
      .getByRole("button")
      .evaluateAll((els) =>
        els
          .map((el) => ({ text: (el.textContent ?? "").trim() }))
          .filter((b) => b.text === "Add Subject" || b.text === "Cancel"),
      );
    expect(order.map((b) => b.text)).toEqual(["Cancel", "Add Subject"]);
  });
});


// S175/DY4 — the gradetracker/settings-CRUD + AlertDialog-confirm e2e legs
// (the recorded coverage gap since the S168-era ledger). Four legs, each
// owning its data (the unique-stamp doctrine) and leaving zero residue
// (the delete-through-the-UI cleanup). DY4a/DY4b (the grade edit + delete
// journeys) and DY4d (the subject delete + the SetNull-consequences
// confirm) are green-on-arrival coverage — the behavior works, the gap is
// the missing spec; DY4c additionally exercises the DY1 port's round-trip
// (create-with-fields → row metadata → edit → update) — the same
// round-trip the reference probe exercised live, now pinned on the clone.
// ---------------------------------------------------------------------------
const dyStamp = () => `DY Probe ${Date.now()}-${Math.floor(Math.random() * 1000)}`;


test.describe("S175/DY4 · the gradetracker/settings-CRUD + AlertDialog-confirm journeys", () => {
  test("DY4a: a created grade edits through the dialog and the updated row + toast render", async ({ page }) => {
    await page.goto("/GradeTracker");
    await hydrated(page);
    await expect(page.getByRole("heading", { name: "Grade Tracker" })).toBeVisible();
    // Create the owned row (the unique stamp — the spec owns its data).
    const title = dyStamp();
    await page.getByRole("button", { name: "Add Grade" }).first().click();
    const dlg = page.getByRole("dialog");
    await dlg.locator("#grade-title").fill(title);
    await dlg.locator("#grade-score").fill("80");
    await dlg.locator("#grade-max").fill("100");
    await dlg.getByRole("button", { name: "Add Grade", exact: true }).click();
    await expect(dlg).toHaveCount(0);
    const row = page.locator("div.group", { hasText: title });
    await expect(row).toBeVisible();
    // The edit journey: the hover-revealed Edit button opens the dialog
    // seeded with the row's values; a score change lands the toast + the
    // updated badge.
    await row.getByRole("button", { name: `Edit ${title}` }).click();
    await expect(dlg.getByRole("heading", { name: "Edit Grade" })).toBeVisible();
    await expect(dlg.locator("#grade-title")).toHaveValue(title);
    await dlg.locator("#grade-score").fill("95");
    await dlg.getByRole("button", { name: "Save changes" }).click();
    await expect(dlg).toHaveCount(0);
    await expect(page.getByText("Grade updated")).toBeVisible();
    await expect(page.locator("div.group", { hasText: title }).first()).toContainText("95/100");
    // Zero residue: the edit leg's row is DY4b's input; deleted there.
  });

  test("DY4b: the grade delete journey confirms through the AlertDialog and the row is gone", async ({ page }) => {
    await page.goto("/GradeTracker");
    await hydrated(page);
    await expect(page.getByRole("heading", { name: "Grade Tracker" })).toBeVisible();
    const title = dyStamp();
    await page.getByRole("button", { name: "Add Grade" }).first().click();
    const dlg = page.getByRole("dialog");
    await dlg.locator("#grade-title").fill(title);
    await dlg.locator("#grade-score").fill("50");
    await dlg.locator("#grade-max").fill("100");
    await dlg.getByRole("button", { name: "Add Grade", exact: true }).click();
    await expect(dlg).toHaveCount(0);
    const row = page.locator("div.group", { hasText: title });
    await expect(row).toBeVisible();
    // The delete journey: the AlertDialog confirms with the measured
    // copy ("Delete this grade?" + the will-be-removed sentence).
    await row.getByRole("button", { name: `Delete ${title}` }).click();
    const confirm = page.getByRole("alertdialog");
    await expect(confirm.getByRole("heading", { name: "Delete this grade?" })).toBeVisible();
    await expect(confirm.getByText(`${title} will be removed from your tracker. This cannot be undone.`)).toBeVisible();
    await confirm.getByRole("button", { name: "Delete", exact: true }).click();
    await expect(confirm).toHaveCount(0);
    // Zero residue: the row is gone (the delete has no success toast —
    // the honest silence the S145 posture documents).
    await expect(page.locator("div.group", { hasText: title })).toHaveCount(0);
  });

  test("DY4c: a created subject carries the ported teacher/room fields through the row and the edit round-trip", async ({ page }) => {
    await page.goto("/Settings");
    await hydrated(page);
    await page.getByRole("tab", { name: "Subjects" }).click();
    await expect(page.getByRole("heading", { name: "Subjects" })).toBeVisible();
    // The DY1 port's round-trip: create with the measured fields.
    const name = dyStamp();
    await page.getByRole("button", { name: "Add Subject" }).first().click();
    const dlg = page.getByRole("dialog");
    await dlg.locator("#subject-name").fill(name);
    await dlg.locator("#subject-teacher").fill("Mr. Probe");
    await dlg.locator("#subject-room").fill("Room 101");
    await dlg.getByRole("button", { name: "Add Subject", exact: true }).click();
    await expect(dlg).toHaveCount(0);
    await expect(page.getByText("Subject created")).toBeVisible();
    // The row renders the ported metadata (the measured typography
    // shape: the teacher + the room under the name).
    const row = page.locator("li", { hasText: name });
    await expect(row).toBeVisible();
    await expect(row).toContainText("Mr. Probe");
    await expect(row).toContainText("Room 101");
    // The edit round-trip: the dialog seeds the ported fields; a
    // teacher change lands the toast + the updated row.
    await row.getByRole("button", { name: `Edit ${name}` }).click();
    await expect(dlg.getByRole("heading", { name: "Edit Subject" })).toBeVisible();
    await expect(dlg.locator("#subject-teacher")).toHaveValue("Mr. Probe");
    await dlg.locator("#subject-teacher").fill("Ms. Probe");
    await dlg.getByRole("button", { name: "Save changes" }).click();
    await expect(dlg).toHaveCount(0);
    await expect(page.getByText("Subject updated")).toBeVisible();
    await expect(page.locator("li", { hasText: name })).toContainText("Ms. Probe");
    // Zero residue: the row is DY4d's input; deleted there.
  });

  test("DY4d: the subject delete journey confirms through the AlertDialog's SetNull-consequences copy and the row is gone", async ({ page }) => {
    await page.goto("/Settings");
    await hydrated(page);
    await page.getByRole("tab", { name: "Subjects" }).click();
    await expect(page.getByRole("heading", { name: "Subjects" })).toBeVisible();
    const name = dyStamp();
    await page.getByRole("button", { name: "Add Subject" }).first().click();
    const dlg = page.getByRole("dialog");
    await dlg.locator("#subject-name").fill(name);
    await dlg.getByRole("button", { name: "Add Subject", exact: true }).click();
    await expect(dlg).toHaveCount(0);
    const row = page.locator("li", { hasText: name });
    await expect(row).toBeVisible();
    // The delete journey: the AlertDialog's SetNull-consequences copy
    // ("every task, exam, and note in it becomes unassigned").
    await row.getByRole("button", { name: `Delete ${name}` }).click();
    const confirm = page.getByRole("alertdialog");
    await expect(confirm.getByRole("heading", { name: "Delete this subject?" })).toBeVisible();
    await expect(confirm.getByText(`${name} will be removed and every task, exam, and note in it becomes unassigned. This cannot be undone.`)).toBeVisible();
    await confirm.getByRole("button", { name: "Delete", exact: true }).click();
    await expect(confirm).toHaveCount(0);
    // Zero residue: the row is gone (the seeded subjects stay — the
    // spec owned only its stamped row).
    await expect(page.locator("li", { hasText: name })).toHaveCount(0);
  });
});


// ---------------------------------------------------------------------------
// S176/DZ — the events/studygroups/tasks dialog catch-up (the s176
// reference probe: the FIRST placeholder-level + geometry-level
// measurement of the older families' dialogs — the events dialog's
// placeholder trio ["Event title"/"Room or meeting URL"/"Event
// details..."], the SIX-swatch 32px rounded-full palette with the white
// 2px + slate 4px double-ring + scale(1.1) selected state, the
// repeating-ROWS reminders control [number + unit select + Add], the
// FIVE-option repeat select (Yearly present), the "Create Event"
// submit copy; the studygroups "Group Name *" + "Description" labels +
// the same swatch idiom; the tasks "Task name..." placeholder). The
// notes create-flow port (the reference's inline-draft editor) is the
// recorded deferral — one rotation's worth on its own.
// ---------------------------------------------------------------------------
test.describe("S176/DZ1 · the events create-dialog parity catch-up + the reminders-rows port", () => {
  test("the New Event dialog carries the reference's measured placeholders, palette, reminders rows, repeat options, and submit copy", async ({ page }) => {
    await page.goto("/Events");
    await hydrated(page);
    await page.getByRole("button", { name: "New Event" }).first().click();
    const dlg = page.getByRole("dialog");
    await expect(dlg).toBeVisible();
    // The measured placeholder trio (RED pre-fix: the scaffold-era
    // "Study group — calculus" / "Room 210 or https://…" / no description
    // placeholder).
    await expect(dlg.locator("#event-title")).toHaveAttribute("placeholder", "Event title");
    await expect(dlg.locator("#event-location")).toHaveAttribute("placeholder", "Room or meeting URL");
    await expect(dlg.locator("#event-description")).toHaveAttribute("placeholder", "Event details...");
    // The measured SIX-swatch palette (RED pre-fix: the eight-color
    // scaffold set with teal/slate extras) at 32px rounded-full. The
    // geometry assert reads an UNSELECTED swatch — the selected one
    // scales 1.1 (the reference's own first-swatch reading was 35px for
    // exactly this reason; the base is 32).
    const swatches = dlg.locator("button[aria-label^='Choose color #']");
    await expect(swatches).toHaveCount(6);
    // A rounded read (the dialog's x lands fractionally — 31.99px
    // measured in the full-file run; the base is 32).
    const box = await swatches.nth(1).boundingBox();
    expect(Math.round(box?.width ?? 0)).toBe(32);
    const radius = await swatches.nth(1).evaluate((el) => getComputedStyle(el).borderRadius);
    expect(Number.parseFloat(radius)).toBeGreaterThan(1000); // rounded-full
    // The measured pristine default: violet #8b5cf6 pressed.
    const pressed = dlg.locator("button[aria-label^='Choose color #'][aria-pressed='true']");
    await expect(pressed).toHaveCount(1);
    await expect(pressed.first()).toHaveAttribute("aria-label", "Choose color #8b5cf6");
    // The measured selected-swatch state: the white 2px + slate 4px
    // double ring + the scale(1.1) transform (RED pre-fix: the plain
    // ring-2 ring-slate-900 with no transform).
    const sel = await pressed.first().evaluate((el) => {
      const s = getComputedStyle(el);
      return { shadow: s.boxShadow, transform: s.transform };
    });
    expect(sel.shadow).toContain("rgb(255, 255, 255) 0px 0px 0px 2px");
    expect(sel.shadow).toContain("148, 163, 184) 0px 0px 0px 4px");
    expect(sel.transform).toContain("1.1");
    // The measured reminders ROWS: a number input + a unit select on a
    // fresh open, with the Add button appending a new row (RED pre-fix:
    // the [15/30/60] toggle chips).
    await expect(dlg.getByLabel("Reminder value 1")).toBeVisible();
    await expect(dlg.getByLabel("Reminder unit 1")).toBeVisible();
    await dlg.getByRole("button", { name: "Add", exact: true }).click();
    await expect(dlg.getByLabel("Reminder value 2")).toBeVisible();
    await expect(dlg.getByLabel("Remove reminder 1")).toBeVisible();
    // The measured FIVE-option repeat select — Yearly present (RED
    // pre-fix: the four-option REPEATS vocabulary).
    await dlg.locator("#event-repeat").click();
    await expect(page.getByRole("option", { name: "Yearly", exact: true })).toBeVisible();
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    // The measured submit copy: "Create Event" (RED pre-fix: the
    // lower-case "Create event"). The clone's All-day superset stays.
    await expect(dlg.getByRole("button", { name: "Create Event", exact: true })).toBeVisible();
    await expect(dlg.getByText("All day", { exact: true })).toBeVisible();
    await dlg.getByRole("button", { name: "Close" }).click();
  });

  test("DZ1b: the reminders rows round-trip — 20 minutes + 2 hours persist and re-render through the edit dialog", async ({ page }) => {
    await page.goto("/Events");
    await hydrated(page);
    const name = `DZ Probe ${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    await page.getByRole("button", { name: "New Event" }).first().click();
    const dlg = page.getByRole("dialog");
    await expect(dlg).toBeVisible();
    await dlg.locator("#event-title").fill(name);
    // Today at 16:00 local — inside the day-focus window the list reads.
    const pad = (n: number) => String(n).padStart(2, "0");
    const now = new Date();
    const dt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T16:00`;
    await dlg.locator("#event-start").fill(dt);
    // Row 1: 20 minutes (the fresh-open default row).
    await dlg.getByLabel("Reminder value 1").fill("20");
    // Row 2: 2 hours via the Add button + the unit select (the Radix
    // select — click the trigger, then the option).
    await dlg.getByRole("button", { name: "Add", exact: true }).click();
    await dlg.getByLabel("Reminder value 2").fill("2");
    await dlg.getByLabel("Reminder unit 2").click();
    await page.getByRole("option", { name: "hours", exact: true }).click();
    await dlg.getByRole("button", { name: "Create Event", exact: true }).click();
    await expect(dlg).toHaveCount(0);
    // The created row renders in the day list (the day-focus window
    // includes today).
    const row = page.locator("article", { hasText: name });
    await expect(row).toBeVisible();
    // The edit round-trip: the stored minutes [20, 120] re-render as
    // the seam's rows (the largest-clean-unit derivation — 120 → "2
    // hours").
    await row.getByRole("button", { name: `Edit ${name}` }).click();
    await expect(dlg).toBeVisible();
    await expect(dlg.locator("#event-title")).toHaveValue(name);
    await expect(dlg.getByLabel("Reminder value 1")).toHaveValue("20");
    await expect(dlg.getByLabel("Reminder unit 1")).toHaveText("minutes");
    await expect(dlg.getByLabel("Reminder value 2")).toHaveValue("2");
    await expect(dlg.getByLabel("Reminder unit 2")).toHaveText("hours");
    // The events dialog carries no Cancel (the measured reference footer
    // = [Create Event] + the header Close) — close via the Close button.
    await dlg.getByRole("button", { name: "Close" }).click();
    await expect(dlg).toHaveCount(0);
    // Zero residue: the row is this leg's own; deleted through the UI.
    await row.getByRole("button", { name: `Delete ${name}` }).click();
    await expect(page.locator("article", { hasText: name })).toHaveCount(0);
  });
});


test.describe("S176/DZ2 · the studygroups create-dialog parity catch-up + the swatch idiom port", () => {
  test("the Create Study Group dialog carries the reference's measured labels, palette geometry, and selected state", async ({ page }) => {
    await page.goto("/StudyGroups");
    await hydrated(page);
    await page.getByRole("button", { name: "Create study group" }).first().click();
    const dlg = page.getByRole("dialog");
    await expect(dlg).toBeVisible();
    // The measured labels (RED pre-fix: the scaffold-era "Name" and
    // "Description (optional)").
    await expect(dlg.getByText("Group Name *", { exact: true })).toBeVisible();
    await expect(dlg.locator("#group-name")).toHaveAttribute("placeholder", "e.g., Math Study Squad");
    await expect(dlg.getByText("Description", { exact: true })).toBeVisible();
    await expect(dlg.locator("#group-description")).toHaveAttribute("placeholder", "What's this group about?");
    // The measured swatch idiom: SIX 32px rounded-full swatches with the
    // white 2px + slate 4px double-ring + scale(1.1) selected state
    // (RED pre-fix: the 28px size-7 with the plain slate ring). The
    // geometry assert reads an UNSELECTED swatch (the selected scales).
    const swatches = dlg.locator("button[aria-label^='Choose color #']");
    await expect(swatches).toHaveCount(6);
    // A rounded read (the dialog's flex layout lands the swatch at a
    // fractional x — 31.95px measured; the base is 32).
    const box = await swatches.nth(1).boundingBox();
    expect(Math.round(box?.width ?? 0)).toBe(32);
    const sel = await dlg.locator("button[aria-label^='Choose color #'][aria-pressed='true']").first().evaluate((el) => {
      const s = getComputedStyle(el);
      return { shadow: s.boxShadow, transform: s.transform };
    });
    expect(sel.shadow).toContain("rgb(255, 255, 255) 0px 0px 0px 2px");
    expect(sel.transform).toContain("1.1");
    // The S171-measured footer holds: [Create Group] submit. The dialog
    // carries TWO "Close" buttons (the footer secondary + the header ×) —
    // scope to the form's footer.
    await expect(dlg.getByRole("button", { name: "Create Group", exact: true })).toBeVisible();
    await dlg.locator("form").getByRole("button", { name: "Close" }).click();
  });
});


test.describe("S176/DZ3 · the tasks create-dialog placeholder catch-up", () => {
  test("the Create Task dialog carries the reference's measured placeholder trio", async ({ page }) => {
    await page.goto("/Tasks");
    await hydrated(page);
    await page.getByRole("button", { name: "Add Task" }).first().click();
    const dlg = page.getByRole("dialog");
    await expect(dlg).toBeVisible();
    // The measured placeholder (RED pre-fix: "Task name" without the
    // ellipsis) + the holding pair re-pinned.
    await expect(dlg.locator("#task-title")).toHaveAttribute("placeholder", "Task name...");
    await expect(dlg.getByLabel("Add a subtask")).toHaveAttribute("placeholder", "Add a subtask...");
    await expect(dlg.locator("textarea")).toHaveAttribute("placeholder", "Add notes...");
    await dlg.getByRole("button", { name: "Cancel", exact: true }).click();
    await expect(dlg).toHaveCount(0);
  });
});


// ---------------------------------------------------------------------------
// S183/EG — the Files type-filter / view-mode / move-port family (the S183
// axis, measured live 2026-11-14 — docs/probe-evidence/s183/). SEVEN
// consolidated pins at ELEVEN upload-budget units: the demo user's
// files+folders+link POST budget is 20 per 15 min and the whole chunk
// (this block + the chunk's existing consumers — the ED attach pins, the
// s14 upload/link pins) shares ONE in-memory window per fresh server. The
// first design's 17 units 429'd the chunk's own s14 pins mid-run (the
// s183 lesson); 11 + the existing ~8 fit under 20 with margin.
//
// The fixture shapes (the raw-API idiom, the ED/C3 precedent): a REAL
// decodable 8×8 PNG (naturalWidth 8 — the S183 fixture lesson: signature-
// only bytes decode to naturalWidth 0), a .txt (the measured "Other"
// class), a minimal .pdf, and folders via the JSON POST (the UI path is
// what the pins exercise; the fixtures are setup, not subject).
// ---------------------------------------------------------------------------


test.describe("S183/EG · the Files toolbar + sections + cards + the filter/search/move ports", () => {
  // A real 8×8 grayscale PNG — decodable by <img> (naturalWidth 8).
  const EG_PNG_B64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAFklEQVR4nGP8z8DwnwEPYMInOXwUVAX///8GQQCU2QO4AAAAAElFTkSuQmCC";

  const egStamp = () => `s183eg${Date.now().toString(36)}`;

  const egPost = (page: Page, path: string, body: unknown) =>
    page.evaluate(
      async ({ path, body }) => {
        const res = await fetch(path, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify(body),
        });
        return { status: res.status, row: (await res.json()) as { id?: string } };
      },
      { path, body },
    );

  const egUpload = (page: Page, name: string, mime: string, b64: string) =>
    page.evaluate(
      async ({ name, mime, b64 }) => {
        const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
        const form = new FormData();
        form.append("file", new File([bytes], name, { type: mime }));
        const res = await fetch("/api/files", { method: "POST", body: form, credentials: "same-origin" });
        return { status: res.status, row: (await res.json()) as { id?: string } };
      },
      { name, mime, b64 },
    );

  const egTextUpload = (page: Page, name: string, mime: string, text: string) =>
    page.evaluate(
      async ({ name, mime, text }) => {
        const form = new FormData();
        form.append("file", new File([text], name, { type: mime }));
        const res = await fetch("/api/files", { method: "POST", body: form, credentials: "same-origin" });
        return { status: res.status, row: (await res.json()) as { id?: string } };
      },
      { name, mime, text },
    );

  const gotoFiles = async (page: Page) => {
    await page.goto("/Files");
    await hydrated(page);
  };

  test("EG1: the zero-row toolbar — the search, the All Types select, the toggle, the section label, the empty state", async ({ page }) => {
    await gotoFiles(page);
    // The breadcrumb home: the reference's crumb contract (slate-800 at
    // root + the violet HOVER accent — the active-accent drift closes).
    const home = page.getByRole("button", { name: "All Files" });
    await expect(home).toBeVisible();
    const homeCls = await home.evaluate((el) => String(el.className));
    expect(homeCls).toContain("hover:text-violet-600");
    expect(homeCls).toContain("text-slate-800");
    expect(homeCls).toContain("font-medium");

    // The toolbar row: the search wrap + the icon + the pl-10 input.
    const search = page.locator('input[placeholder="Search files..."]');
    await expect(search).toBeVisible();
    const wrapCls = await search.evaluate((el) => String(el.parentElement?.className));
    expect(wrapCls).toContain("relative");
    expect(wrapCls).toContain("flex-1");
    const iconCls = await search.evaluate((el) => {
      const sib = el.parentElement?.querySelector("svg");
      return sib ? String(sib.getAttribute("class")) : null;
    });
    expect(iconCls).toContain("lucide-search");
    expect(iconCls).toContain("left-3");
    const searchCls = await search.evaluate((el) => String(el.className));
    expect(searchCls).toContain("pl-10");

    // The All Types select: the shadcn trigger at the measured w-40 (160px).
    const combo = page.locator('[role=combobox]');
    await expect(combo).toBeVisible();
    await expect(combo).toHaveText(/All Types/);
    const comboW = await combo.evaluate((el) => Math.round(el.getBoundingClientRect().width));
    expect(comboW).toBeGreaterThanOrEqual(155);
    expect(comboW).toBeLessThanOrEqual(165);

    // The five options (opened — the reference's verbatim labels).
    await combo.click();
    await expect(page.getByRole("option", { name: "All Types", exact: true })).toBeVisible();
    await expect(page.getByRole("option", { name: "Images", exact: true })).toBeVisible();
    await expect(page.getByRole("option", { name: "PDFs", exact: true })).toBeVisible();
    await expect(page.getByRole("option", { name: "Documents", exact: true })).toBeVisible();
    await expect(page.getByRole("option", { name: "Other", exact: true })).toBeVisible();
    await page.keyboard.press("Escape");

    // The view toggle: the reference's bordered strip, h-9 w-9 pair, the
    // slate-100 active face (the sf-primary-soft active closes out). The
    // aria-labels are the clone's a11y superset (the S5-K/S9-G pins).
    const toggle = page.getByRole("group", { name: "View mode" });
    await expect(toggle).toBeVisible();
    const stripCls = await toggle.evaluate((el) => String(el.className));
    expect(stripCls).toContain("rounded-lg");
    expect(stripCls).toContain("overflow-hidden");
    const gridBtn = page.getByRole("button", { name: "Grid view" });
    const activeCls = await gridBtn.evaluate((el) => String(el.className));
    expect(activeCls).toContain("bg-slate-100");
    const btnBox = await gridBtn.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height) };
    });
    expect(btnBox.w).toBe(36);
    expect(btnBox.h).toBe(36);

    // The Files section label: the measured p.text-xs uppercase mb-3 (a
    // <p>, NEVER a heading — the resilience heading pins ride on that).
    const label = page.locator("main p", { hasText: /^Files$/ }).first();
    await expect(label).toBeVisible();
    const labelCls = await label.evaluate((el) => String(el.className));
    expect(labelCls).toContain("text-xs");
    expect(labelCls).toContain("uppercase");
    expect(labelCls).toContain("mb-3");

    // The empty state lives INSIDE the Files section (measured).
    await expect(page.getByText("No files yet", { exact: true })).toBeVisible();
  });

  test("EG2: the sectioned grid — the labels, the 2/4/6 grid, both cards, the two ellipsis menus", async ({ page }) => {
    await gotoFiles(page);
    const stamp = egStamp();
    const folderName = `${stamp}-folder`;
    const pngName = `${stamp}-probe.png`;
    const folder = await egPost(page, "/api/files/folders", { name: folderName });
    expect(folder.status).toBe(201);
    const png = await egUpload(page, pngName, "image/png", EG_PNG_B64);
    expect(png.status).toBe(201);
    await page.reload();
    await hydrated(page);

    // The Folders label joins the Files label (both p.text-xs uppercase).
    const foldersLabel = page.locator("main p", { hasText: /^Folders$/ }).first();
    await expect(foldersLabel).toBeVisible();
    await expect(page.locator("main p", { hasText: /^Files$/ }).first()).toBeVisible();

    // The grids: the measured 2/4/6 columns at gap-3 (the 2/3-at-gap-4
    // drift closes).
    const gridCls = await foldersLabel.evaluate((el) => String(el.nextElementSibling?.className));
    expect(gridCls).toContain("grid-cols-2");
    expect(gridCls).toContain("md:grid-cols-4");
    expect(gridCls).toContain("lg:grid-cols-6");
    expect(gridCls).toContain("gap-3");

    // The folder card: the accent tile + the name + the NEVER-singularized
    // count (the reference renders "0 files" — measured, twice).
    const folderCard = page.locator("main div.group").filter({ hasText: folderName }).first();
    await expect(folderCard.getByText("0 files", { exact: true })).toBeVisible();
    const tileCls = await folderCard.evaluate((el) => {
      const tile = el.querySelector("span[class*=sf-primary-soft], [class*=bg-violet]");
      return tile ? String(tile.className) : null;
    });
    expect(tileCls).toContain("sf-primary-soft");

    // The folder menu: Delete + the clone's Rename superset (the item texts
    // carry the icon's whitespace — trim before the exact match).
    await folderCard.locator('button[aria-haspopup="menu"]').click();
    const menuItems = (await page.locator("[role=menuitem]").allTextContents()).map((t) => t.trim());
    expect(menuItems).toContain("Delete");
    expect(menuItems).toContain("Rename");
    await page.keyboard.press("Escape");
    // The menu-GONE wait (the ED idiom): the page-scoped item query below
    // sees BOTH menus if the first's close races under chunk load — the
    // S183 cert finding (the chunk context is slower than the isolated
    // run; Escape + 500ms lost the race and the file items read the
    // folder menu's items too).
    await page.waitForFunction(() => !document.querySelector('[role="menuitem"]'), null, { timeout: 10_000 });
    await page.waitForTimeout(150);

    // The file card: the ellipsis row + the aspect-square image tile
    // (the inline preview src) + the name + the size.
    const fileCard = page.locator("main div.group").filter({ hasText: pngName }).first();
    await expect(fileCard).toBeVisible();
    const tile = fileCard.locator(".aspect-square").first();
    const tileInfo = await tile.evaluate((el) => {
      const img = el.querySelector("img");
      return { cls: String(el.className), imgSrc: img?.getAttribute("src") ?? null };
    });
    expect(tileInfo.cls).toContain("cursor-pointer");
    expect(tileInfo.imgSrc).toMatch(/\/api\/files\/.+\?inline=1/);
    await expect(fileCard.getByText("81 B", { exact: true })).toBeVisible();

    // The file menu: the reference's measured four items.
    await fileCard.locator('button[aria-haspopup="menu"]').click();
    const fileItems = (await page.locator("[role=menuitem]").allTextContents()).map((t) => t.trim());
    expect(fileItems).toEqual(["View", "Download", "Move to Folder", "Delete"]);
    await page.keyboard.press("Escape");
    await page.waitForFunction(() => !document.querySelector('[role="menuitem"]'), null, { timeout: 10_000 });
    await page.waitForTimeout(150);
  });

  test("EG3: the type filter + the search — the measured semantics (the .txt is Other, folders immune, no-match empties)", async ({ page }) => {
    await gotoFiles(page);
    const stamp = egStamp();
    const pngName = `${stamp}-alpha.png`;
    const txtName = `${stamp}-beta.txt`;
    expect((await egUpload(page, pngName, "image/png", EG_PNG_B64)).status).toBe(201);
    expect((await egTextUpload(page, txtName, "text/plain", "s183 eg3 probe")).status).toBe(201);
    await page.reload();
    await hydrated(page);

    // Images → the PNG, never the TXT.
    await page.locator('[role=combobox]').click();
    await page.getByRole("option", { name: "Images", exact: true }).click();
    await expect(page.getByText(pngName, { exact: true })).toBeVisible();
    await expect(page.getByText(txtName, { exact: true })).toHaveCount(0);

    // Other → the TXT (the naive text/*→Documents guess is WRONG — measured).
    await page.locator('[role=combobox]').click();
    await page.getByRole("option", { name: "Other", exact: true }).click();
    await expect(page.getByText(txtName, { exact: true })).toBeVisible();
    await expect(page.getByText(pngName, { exact: true })).toHaveCount(0);

    // Documents → neither (the office set only).
    await page.locator('[role=combobox]').click();
    await page.getByRole("option", { name: "Documents", exact: true }).click();
    await expect(page.getByText(pngName, { exact: true })).toHaveCount(0);
    await expect(page.getByText(txtName, { exact: true })).toHaveCount(0);

    // Back to All Types → both (the state is local, every filter pass).
    await page.locator('[role=combobox]').click();
    await page.getByRole("option", { name: "All Types", exact: true }).click();
    await expect(page.getByText(pngName, { exact: true })).toBeVisible();
    await expect(page.getByText(txtName, { exact: true })).toBeVisible();

    // The search: a name substring narrows to the PNG.
    await page.locator('input[placeholder="Search files..."]').fill(`${stamp}-alpha`);
    await expect(page.getByText(pngName, { exact: true })).toBeVisible();
    await expect(page.getByText(txtName, { exact: true })).toHaveCount(0);

    // A no-match search renders the empty state INSIDE the Files section.
    await page.locator('input[placeholder="Search files..."]').fill(`${stamp}-zzz-no-match`);
    await expect(page.getByText("No files yet", { exact: true })).toBeVisible();

    // Filter state resets on reload (local state, measured).
    await page.reload();
    await hydrated(page);
    await expect(page.getByText(pngName, { exact: true })).toBeVisible();
    await expect(page.getByText(txtName, { exact: true })).toBeVisible();
  });

  test("EG4: the in-folder navigation + the move — the crumb pair, the separator, the folders' immunity, the click-moves dialog", async ({ page }) => {
    await gotoFiles(page);
    const stamp = egStamp();
    const parentName = `${stamp}-parent`;
    const subName = `${stamp}-sub`;
    const pngName = `${stamp}-file.png`;
    const parent = await egPost(page, "/api/files/folders", { name: parentName });
    expect(parent.status).toBe(201);
    const sub = await egPost(page, "/api/files/folders", { name: subName, parentId: parent.row?.id });
    expect(sub.status).toBe(201);
    expect((await egUpload(page, pngName, "image/png", EG_PNG_B64)).status).toBe(201);
    await page.reload();
    await hydrated(page);

    // Navigate INTO the parent (the whole card opens — the reference's own
    // card anatomy, the clone's valid-HTML form).
    await page.getByRole("button", { name: `Open folder ${parentName}` }).click();
    await expect(page.getByRole("button", { name: `Open folder ${subName}` })).toBeVisible();

    // The crumb pair: the home goes slate-500 (inactive) + the chevron
    // separator + the folder crumb carries slate-800 font-medium.
    const home = page.getByRole("button", { name: "All Files" });
    const homeCls = await home.evaluate((el) => String(el.className));
    expect(homeCls).toContain("text-slate-500");
    const crumb = page.getByRole("button", { name: parentName, exact: true }).first();
    const crumbCls = await crumb.evaluate((el) => String(el.className));
    expect(crumbCls).toContain("text-slate-800");
    expect(crumbCls).toContain("font-medium");
    const separator = await crumb.evaluate((el) => {
      const sib = el.previousElementSibling;
      return sib && sib.tagName.toLowerCase() === "svg" ? String(sib.getAttribute("class")) : null;
    });
    expect(separator).toContain("lucide-chevron-right");

    // The in-folder Folders section: the subfolder card renders inside.
    await expect(page.locator("main p", { hasText: /^Folders$/ }).first()).toBeVisible();

    // The folders' immunity: a no-match search keeps BOTH folder cards
    // visible while the Files section empties (measured).
    await page.locator('input[placeholder="Search files..."]').fill(`${stamp}-zzz-no-match`);
    await expect(page.getByRole("button", { name: `Open folder ${subName}` })).toBeVisible();
    await expect(page.getByText("No files yet", { exact: true })).toBeVisible();

    // Clear the search before the move — the query is COMPONENT state and
    // survives the in-app folder navigation (the view never remounts); the
    // row would stay hidden and the move's card menu unreachable.
    await page.locator('input[placeholder="Search files..."]').fill("");

    // Back to root, then the MOVE: the card menu → the dialog → the click.
    await page.getByRole("button", { name: "All Files" }).click();
    await expect(page.getByRole("button", { name: `Open folder ${parentName}` })).toBeVisible();
    const fileCard = page.locator("main div.group").filter({ hasText: pngName }).first();
    await fileCard.locator('button[aria-haspopup="menu"]').click();
    await page.getByRole("menuitem", { name: "Move to Folder" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText("Move to Folder", { exact: true })).toBeVisible();
    // The destination list: General (Root) first, every folder after.
    await expect(dialog.getByRole("button", { name: /General \(Root\)/ })).toBeVisible();
    await expect(dialog.getByRole("button", { name: parentName, exact: true })).toBeVisible();
    await expect(dialog.getByRole("button", { name: subName, exact: true })).toBeVisible();
    await dialog.getByRole("button", { name: parentName, exact: true }).click();

    // The click IS the move: the root view loses the row, the folder's
    // count reads "1 files" (never singularized).
    await expect(page.getByText(pngName, { exact: true })).toHaveCount(0);
    const parentCard = page.locator("main div.group").filter({ hasText: parentName }).first();
    await expect(parentCard.getByText("1 files", { exact: true })).toBeVisible();
  });

  test("EG5: the list mode — the row anatomy, the General-root meta line, the four hover controls", async ({ page }) => {
    await gotoFiles(page);
    const stamp = egStamp();
    const txtName = `${stamp}-row.txt`;
    expect((await egTextUpload(page, txtName, "text/plain", "s183 eg5 list row")).status).toBe(201);
    await page.reload();
    await hydrated(page);

    // The toggle branches NOW (the pre-fix viewMode state was a visual
    // no-op — the S183 head).
    await page.getByRole("button", { name: "List view" }).click();
    const row = page.locator("main div.group").filter({ hasText: txtName }).first();
    await expect(row).toBeVisible();
    const rowCls = await row.evaluate((el) => String(el.className));
    expect(rowCls).toContain("flex");
    expect(rowCls).toContain("items-center");
    expect(rowCls).toContain("gap-4");
    expect(rowCls).toContain("p-4");

    // The meta line: the measured folder • size • MMM d, yyyy (the root's
    // display name is "General" — the reference's own root pseudo-folder).
    const meta = await row.locator("p.text-xs").first().textContent();
    expect(meta).toMatch(/^General • \d+ B • [A-Z][a-z]{2} \d{1,2}, \d{4}$/);

    // The mime icon tile + the four hover controls: the eye button, the
    // download ANCHOR (role=link — the reference's own idiom), the move
    // button, the red trash.
    await expect(row.locator("svg.lucide-file, svg.lucide-image, svg.lucide-link2").first()).toBeVisible();
    await expect(row.getByRole("button", { name: `View ${txtName}` })).toBeVisible();
    await expect(row.getByRole("link", { name: `Download ${txtName}` })).toBeVisible();
    await expect(row.getByRole("button", { name: `Move ${txtName} to a folder` })).toBeVisible();
    const trash = row.getByRole("button", { name: `Delete ${txtName}` });
    await expect(trash).toBeVisible();
    const trashCls = await trash.evaluate((el) => String(el.className));
    expect(trashCls).toContain("text-red-500");

    // The grid toggle returns the card anatomy.
    await page.getByRole("button", { name: "Grid view" }).click();
    const cardAgain = page.locator("main div.group").filter({ hasText: txtName }).first();
    await expect(cardAgain.locator(".aspect-square").first()).toBeVisible();
  });

  test("EG6: the View dialog — the tile click, the inline img loads, the anchor controls, the Close", async ({ page }) => {
    await gotoFiles(page);
    const stamp = egStamp();
    const pngName = `${stamp}-view.png`;
    expect((await egUpload(page, pngName, "image/png", EG_PNG_B64)).status).toBe(201);
    await page.reload();
    await hydrated(page);

    const fileCard = page.locator("main div.group").filter({ hasText: pngName }).first();
    await fileCard.locator('button[aria-label^="Preview"]').click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(pngName, { exact: true })).toBeVisible();

    // The img serves INLINE (the ?inline=1 bytes — a real decodable PNG,
    // naturalWidth 8; the attachment disposition would 0 it).
    const imgInfo = await dialog.locator("img").first().evaluate((el) => ({
      src: el.getAttribute("src") ?? "",
      naturalW: (el as HTMLImageElement).naturalWidth,
    }));
    expect(imgInfo.src).toMatch(/\/api\/files\/.+\?inline=1/);
    expect(imgInfo.naturalW).toBe(8);

    // The measured controls: the two ANCHORS + the Close button.
    await expect(dialog.getByRole("link", { name: "Open in New Tab" })).toHaveAttribute(
      "href",
      /\/api\/files\/.+\?inline=1/,
    );
    await expect(dialog.getByRole("link", { name: "Download" })).toHaveAttribute("href", /\/api\/files\/[^?]+$/);
    await dialog.getByRole("button", { name: "Close" }).click();
    await expect(dialog).toHaveCount(0);
  });

  test("EG7: the non-image tile + the link file — the icon tile, the no-img dialog, the link anchor", async ({ page }) => {
    await gotoFiles(page);
    const stamp = egStamp();
    const pdfName = `${stamp}-doc.pdf`;
    const linkName = `${stamp}-link`;
    const pdfBytes = btoa(
      "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]>>endobj\ntrailer<</Size 4/Root 1 0 R>>\n%%EOF",
    );
    expect((await egUpload(page, pdfName, "application/pdf", pdfBytes)).status).toBe(201);
    expect((await egPost(page, "/api/files", { name: linkName, url: "https://example.com/s183" })).status).toBe(201);
    await page.reload();
    await hydrated(page);

    // The PDF's tile: the icon form (bg-slate-50 + the file-text icon,
    // no img — measured).
    const pdfCard = page.locator("main div.group").filter({ hasText: pdfName }).first();
    const pdfTile = pdfCard.locator(".aspect-square").first();
    expect(await pdfTile.locator("img").count()).toBe(0);
    const pdfTileCls = await pdfTile.evaluate((el) => String(el.className));
    expect(pdfTileCls).toContain("bg-slate-50");
    await expect(pdfTile.locator("svg.lucide-file-text").first()).toBeVisible();

    // The PDF's View dialog: no img, the controls present (measured).
    await pdfCard.locator('button[aria-haspopup="menu"]').click();
    await page.getByRole("menuitem", { name: "View", exact: true }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(pdfName, { exact: true })).toBeVisible();
    expect(await dialog.locator("img").count()).toBe(0);
    await expect(dialog.getByRole("link", { name: "Download" })).toBeVisible();
    await dialog.getByRole("button", { name: "Close" }).click();

    // The link file: the name renders as the anchor to the stored URL
    // (the clone's link superset), and classifies under no image tile.
    const linkCard = page.locator("main div.group").filter({ hasText: linkName }).first();
    await expect(linkCard.getByRole("link", { name: linkName })).toHaveAttribute(
      "href",
      "https://example.com/s183",
    );
    expect(await linkCard.locator(".aspect-square img").count()).toBe(0);
  });
});


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
    // but this file's OWN EG pins leave uploaded files behind in the demo
    // account (the AN1-cleanup exception: uploads ride the 20/15-min POST
    // budget), so the zero state is FORCED here the EA3 way (only the GET
    // intercepted; every other method passes through). Order-independent
    // by construction.
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



// ---------------------------------------------------------------------------
// S186/EJ — the view-header ROW family (Batch EJ, the S186 cycle). The
// reference's toolbar-carrying headers measured `flex flex-col md:flex-row
// md:items-center justify-between gap-4` — at mobile the toolbar STACKS
// BELOW the h1 block (column, 16px gap); at desktop a row (items-center).
// The clone's flex-wrap rows (the S78/AE9-AE12 records) wrapped the
// toolbar INSIDE a row and reflowed at sm (640) not md (768). Evidence:
// docs/probe-evidence/s186/ref-header-rows.json (all 20 views censused at
// 1440x900 + 390x844, 2026-11-15).
// ---------------------------------------------------------------------------
test.describe("S186/EJ · the view-header row family (mobile-stacked)", () => {
  // The ancestor walk: from the h1, up to the nearest flex container that
  // carries a toolbar (button/select/input) — the view-header row.
  const rowOf = () => `(() => {
    const h1 = document.querySelector("main h1");
    let el = h1 ? h1.parentElement : null;
    for (let i = 0; i < 6 && el; i++) {
      const cs = getComputedStyle(el);
      const ctrl = "button, a, select, input, [role=combobox]";
      const sibling = [...el.children].some((k) => !k.contains(h1) && (k.matches(ctrl) || k.querySelector(ctrl) !== null));
      if (cs.display === "flex" && sibling) break;
      el = el.parentElement;
    }
    if (!el) return null;
    const s = getComputedStyle(el);
    const r = { dir: s.flexDirection, gap: s.gap, items: s.alignItems, wrap: s.flexWrap, cls: (el.className || "").toString(), toolbarGap: null };
    const second = el.children[1];
    if (second) { const sc = getComputedStyle(second); if (sc.display === "flex") r.toolbarGap = sc.gap; }
    return r;
  })()`;

  test("EJ4: the Tasks header stacks its toolbar below the h1 at mobile and rows at desktop (RED pre-fix: flex-wrap row + gap 12px)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/Tasks");
    await hydrated(page);
    const header = page.locator("[aria-label='Tasks header']");
    await expect(header).toBeVisible();
    const mob = await header.evaluate((el) => {
      const s = getComputedStyle(el);
      return { dir: s.flexDirection, gap: s.gap };
    });
    expect(mob.dir).toBe("column"); // the stacked form
    expect(mob.gap).toBe("16px"); // gap-4
    // The h1 block is the FIRST child; the toolbar (search/filter/Add Task) stacks below.
    const kids = await header.evaluate((el) => [...el.children].map((k) => k.tagName));
    expect(kids.length).toBe(2); // h1-block + toolbar (the measured 2-kid form)
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(400);
    const desk = await header.evaluate((el) => {
      const s = getComputedStyle(el);
      return { dir: s.flexDirection, items: s.alignItems, mb: s.marginBottom };
    });
    expect(desk.dir).toBe("row"); // md:flex-row
    expect(desk.items).toBe("center"); // md:items-center
    expect(desk.mb).toBe("24px"); // mb-6 (the measured Tasks rider)
  });

  test("EJ5: the Timetable header stacks + the toolbar gap reads 12px (RED pre-fix: row + 8px)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/Timetable");
    await hydrated(page);
    await expect(page.getByRole("heading", { name: "Timetable" })).toBeVisible();
    const mob = (await page.evaluate(rowOf())) as Record<string, string | null>;
    expect(mob.dir).toBe("column");
    expect(mob.gap).toBe("16px");
    expect(mob.toolbarGap).toBe("12px"); // gap-3 — the measured toolbar family
  });

  test("EJ6: the Files header stacks at mobile (RED pre-fix: ViewHeader row-always)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/Files");
    await hydrated(page);
    await expect(page.getByRole("heading", { name: "Files", exact: true })).toBeVisible();
    const mob = (await page.evaluate(rowOf())) as Record<string, string | null>;
    expect(mob.dir).toBe("column");
    expect(mob.gap).toBe("16px");
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(400);
    const desk = (await page.evaluate(rowOf())) as Record<string, string | null>;
    expect(desk.dir).toBe("row");
    expect(desk.items).toBe("center");
  });

  test("EJ7: the Dashboard greeting header stacks at mobile (RED pre-fix: flex-wrap)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/Dashboard");
    await hydrated(page);
    await expect(page.getByRole("heading", { name: /Good (morning|afternoon|evening)/ })).toBeVisible();
    const mob = (await page.evaluate(rowOf())) as Record<string, string | null>;
    expect(mob.dir).toBe("column");
    expect(mob.gap).toBe("16px");
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(400);
    const desk = (await page.evaluate(rowOf())) as Record<string, string | null>;
    expect(desk.dir).toBe("row");
  });

  test("EJ8: the Exams header stacks at mobile (RED pre-fix: row-always)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/Exams");
    await hydrated(page);
    await expect(page.getByRole("heading", { name: "Exams" })).toBeVisible();
    const mob = (await page.evaluate(rowOf())) as Record<string, string | null>;
    expect(mob.dir).toBe("column");
    expect(mob.gap).toBe("16px");
  });

  test("EJ9: the Calculator header stays a row at mobile, items-center (RED pre-fix: items-start + flex-wrap)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/Calculator");
    await hydrated(page);
    await expect(page.getByRole("heading", { name: "Calculator Suite" })).toBeVisible();
    const mob = (await page.evaluate(rowOf())) as Record<string, string | null>;
    expect(mob.dir).toBe("row"); // the row family — Calculator never stacks
    expect(mob.items).toBe("center"); // items-center (was items-start)
    expect(mob.wrap).toBe("nowrap"); // the wrap retired
  });
});


test.describe("S187/EK · the filter-row separation + the sf-card border + the Tasks search width", () => {
  // The S187 measurements (docs/probe-evidence/s187/, three reference
  // probes 2026-11-15, zero residue): the reference's Assignments/Exams
  // headers carry ONLY the add button — the search + selects render in a
  // SEPARATE row below (`flex flex-col md:flex-row gap-4`, selects w-40
  // at BOTH viewports, never full-width); the search inputs ride
  // pl-10 (40px) + text-base md:text-sm (16/14 — the S183 Files
  // convention, now measured on all three views); every measured sf-card
  // surface carries border-slate-100 (rgb(241,245,249)); the Tasks search
  // wrapper is `relative flex-1 md:w-64` (256 desktop / the flex-1
  // collapse at mobile — one-line toolbar).

  test("EK1: the Exams header carries only the Add Exam button (RED pre-fix: the search + select bundled in the toolbar)", async ({ page }) => {
    await page.goto("/Exams");
    await hydrated(page);
    await expect(page.getByRole("heading", { name: "Exams" })).toBeVisible();
    const hdr = (await page.evaluate(`(() => {
      const h1 = document.querySelector("main h1");
      let el = h1 ? h1.parentElement : null;
      for (let i = 0; i < 6 && el; i++) {
        const cs = getComputedStyle(el);
        const ctrl = "button, a, select, input, [role=combobox]";
        const sibling = [...el.children].some((k) => !k.contains(h1) && (k.matches(ctrl) || k.querySelector(ctrl) !== null));
        if (cs.display === "flex" && sibling) break;
        el = el.parentElement;
      }
      if (!el) return null;
      const inputs = el.querySelectorAll("input").length;
      const combos = el.querySelectorAll("[role=combobox]").length;
      const buttons = [...el.querySelectorAll("button")].filter((b) => b.getBoundingClientRect().width > 0);
      return { kids: el.children.length, inputs, combos, buttons: buttons.length, btnTexts: buttons.map((b) => (b.textContent || "").trim()) };
    })()`)) as { kids: number; inputs: number; combos: number; buttons: number; btnTexts: string[] } | null;
    expect(hdr).not.toBeNull();
    expect(hdr!.kids).toBe(2); // the h1 block + the add button (the measured 2-kid form)
    expect(hdr!.inputs).toBe(0); // the search lives OUTSIDE the header
    expect(hdr!.combos).toBe(0); // the filter select lives OUTSIDE the header
    expect(hdr!.buttons).toBe(1);
    expect(hdr!.btnTexts[0]).toContain("Add Exam");
  });

  test("EK2: the Exams filter row stacks below the header (RED pre-fix: no filter row — the first sibling is the card grid)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/Exams");
    await hydrated(page);
    await expect(page.getByRole("heading", { name: "Exams" })).toBeVisible();
    const row = (await page.evaluate(`(() => {
      const h1 = document.querySelector("main h1");
      let el = h1 ? h1.parentElement : null;
      for (let i = 0; i < 6 && el; i++) {
        const cs = getComputedStyle(el);
        const ctrl = "button, a, select, input, [role=combobox]";
        const sibling = [...el.children].some((k) => !k.contains(h1) && (k.matches(ctrl) || k.querySelector(ctrl) !== null));
        if (cs.display === "flex" && sibling) break;
        el = el.parentElement;
      }
      const sib = el ? el.nextElementSibling : null;
      if (!sib) return null;
      const s = getComputedStyle(sib);
      return { cls: (sib.className || "").toString(), display: s.display, dir: s.flexDirection, gap: s.gap,
        inputs: sib.querySelectorAll("input").length, combos: sib.querySelectorAll("[role=combobox]").length };
    })()`)) as { cls: string; display: string; dir: string; gap: string; inputs: number; combos: number } | null;
    // The measured filter-row family: flex flex-col md:flex-row gap-4.
    expect(row).not.toBeNull();
    expect(row!.display).toBe("flex");
    expect(row!.dir).toBe("column"); // stacks at mobile (RED pre-fix: the sibling is the card GRID — display grid)
    expect(row!.gap).toBe("16px"); // gap-4
    expect(row!.inputs).toBe(1); // the search
    expect(row!.combos).toBe(1); // the ONE status select
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(400);
    const deskRow = (await page.evaluate(`(() => {
      const h1 = document.querySelector("main h1");
      let el = h1 ? h1.parentElement : null;
      for (let i = 0; i < 6 && el; i++) {
        const cs = getComputedStyle(el);
        const ctrl = "button, a, select, input, [role=combobox]";
        const sibling = [...el.children].some((k) => !k.contains(h1) && (k.matches(ctrl) || k.querySelector(ctrl) !== null));
        if (cs.display === "flex" && sibling) break;
        el = el.parentElement;
      }
      const sib = el ? el.nextElementSibling : null;
      if (!sib) return null;
      const s = getComputedStyle(sib);
      return { dir: s.flexDirection, gap: s.gap };
    })()`)) as { dir: string; gap: string } | null;
    expect(deskRow).not.toBeNull();
    expect(deskRow!.dir).toBe("row"); // md:flex-row
    expect(deskRow!.gap).toBe("16px");
  });

  test("EK3: the Exams select trigger is 160px at both viewports (RED pre-fix: 130px)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/Exams");
    await hydrated(page);
    const trigger = page.locator("[role=combobox]").first();
    await expect(trigger).toBeVisible();
    const mobW = await trigger.evaluate((el) => Math.round(el.getBoundingClientRect().width));
    expect(mobW).toBe(160); // w-40 (RED pre-fix: 130px w-[130px])
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(400);
    const deskW = await trigger.evaluate((el) => Math.round(el.getBoundingClientRect().width));
    expect(deskW).toBe(160); // w-40 at desktop too (never full-width)
  });

  test("EK4: the Assignments selects stay 160px at mobile (RED pre-fix: full-width 358px)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/Assignments");
    await hydrated(page);
    const combos = page.locator("[role=combobox]");
    await expect(combos.first()).toBeVisible();
    expect(await combos.count()).toBe(2); // status + subject
    const ws = await combos.evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().width)));
    expect(ws[0]).toBe(160); // w-40 (RED pre-fix: 358px w-full)
    expect(ws[1]).toBe(160); // w-40
  });

  test("EK5: the search inputs render pl-10 + text-base md:text-sm (RED pre-fix: pl-9 + text-sm)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const readSearch = (page: Page) =>
      page.evaluate(`(() => {
        const input = [...document.querySelectorAll("main input")].find((i) => (i.placeholder || "").toLowerCase().includes("search"));
        if (!input) return null;
        const s = getComputedStyle(input);
        return { pl: s.paddingLeft, fs: s.fontSize };
      })()`);
    for (const view of ["Assignments", "Exams", "Tasks"]) {
      await page.goto(`/${view}`);
      await hydrated(page);
      const mob = (await readSearch(page)) as Record<string, string>;
      expect(mob, `${view} mobile search`).not.toBeNull();
      expect(mob.pl, `${view} mobile padding-left`).toBe("40px"); // pl-10 (RED pre-fix: 36px pl-9)
      expect(mob.fs, `${view} mobile font-size`).toBe("16px"); // text-base (RED pre-fix: 14px)
    }
    await page.setViewportSize({ width: 1280, height: 800 });
    for (const view of ["Assignments", "Exams", "Tasks"]) {
      await page.goto(`/${view}`);
      await hydrated(page);
      const desk = (await readSearch(page)) as Record<string, string>;
      expect(desk.fs, `${view} desktop font-size`).toBe("14px"); // md:text-sm
      expect(desk.pl, `${view} desktop padding-left`).toBe("40px"); // pl-10 holds
    }
  });

  test("EK6: the sf-card border reads slate-100 + the Calendar/GT family stays slate-200 (the measured two-family boundary)", async ({ page }) => {
    // The complete S187 census (probes 2/4/5): the reference's card
    // surfaces split BY VIEW — the Dashboard stat cards + the Timetable
    // trio + the FocusTimer cards carry border-slate-100 (the sf-card
    // utility's family, rgb(241,245,249)); the Calendar cards + the
    // GradeTracker stat cards carry border-slate-200 with NO shadow
    // (their own component classes, the S8-era record re-measured).
    await page.goto("/Dashboard");
    await hydrated(page);
    const statCard = page.locator("main .sf-card").first();
    await expect(statCard).toBeVisible();
    const bc = await statCard.evaluate((el) => getComputedStyle(el).borderTopColor);
    expect(bc).toBe(rgb(241, 245, 249)); // border-slate-100 (RED pre-fix: rgb(226,232,240))
    await page.goto("/Calendar");
    await hydrated(page);
    const monthCard = page.locator('[aria-label="Calendar month"]');
    await expect(monthCard).toBeVisible();
    const calBc = await monthCard.evaluate((el) => getComputedStyle(el).borderTopColor);
    expect(calBc).toBe(rgb(226, 232, 240)); // the slate-200 side of the boundary (the S8 pin's family, re-measured S187)
    const calShadow = await monthCard.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(calShadow).toBe("none"); // the measured no-shadow form (the sf-card shadow-sm retired on this family)
    await page.goto("/GradeTracker");
    await hydrated(page);
    const gtCard = page.locator("[data-testid='gt-stat'], main .rounded-2xl.border-slate-200").first();
    const gtBc = await gtCard.evaluate((el) => getComputedStyle(el).borderTopColor);
    expect(gtBc).toBe(rgb(226, 232, 240)); // the GT stat cards ride the measured slate-200 family
  });

  test("EK7: the Tasks search collapses at mobile + 256px at desktop, one-line toolbar (RED pre-fix: w-48 fixed + 2-line toolbar)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/Tasks");
    await hydrated(page);
    const mob = (await page.evaluate(`(() => {
      const input = [...document.querySelectorAll("main input")].find((i) => (i.placeholder || "").toLowerCase().includes("search"));
      if (!input) return null;
      const wrap = input.closest("div");
      let tb = wrap;
      while (tb && !(getComputedStyle(tb).display === "flex" && getComputedStyle(tb).flexWrap === "wrap")) tb = tb.parentElement;
      return { wrapW: Math.round(wrap.getBoundingClientRect().width), tbH: tb ? Math.round(tb.getBoundingClientRect().height) : null };
    })()`)) as { wrapW: number; tbH: number | null } | null;
    expect(mob).not.toBeNull();
    expect(mob!.wrapW).toBeLessThanOrEqual(130); // the flex-1 collapse (RED pre-fix: 192px w-48)
    expect(mob!.tbH).toBe(36); // ONE line (RED pre-fix: 84 — the wrapped 2-line toolbar)
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(400);
    const desk = (await page.evaluate(`(() => {
      const input = [...document.querySelectorAll("main input")].find((i) => (i.placeholder || "").toLowerCase().includes("search"));
      if (!input) return null;
      const wrap = input.closest("div");
      return { wrapW: Math.round(wrap.getBoundingClientRect().width) };
    })()`)) as { wrapW: number } | null;
    expect(desk).not.toBeNull();
    expect(desk!.wrapW).toBe(256); // md:w-64 (RED pre-fix: 192px)
  });
});
