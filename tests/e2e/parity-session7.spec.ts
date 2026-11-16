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
 *      AI Generate Questions) — the MIXED family STAYS (the S78/AE
 *      boundary precedent; its studygroups/practicetests strays are
 *      resolved by view at S196/ET)
 *  S7-C Timetable grid-cols-8 week grid (day heads, 60px hours, "7 AM"
 *      labels, mobile accordion) + My Classes today-date header — MOVED
 *      to tests/e2e/timetable.spec.ts at S193/EQ (the timetable-family
 *      consolidation: every pure-timetable describe now lives there;
 *      this file keeps the non-timetable families — see
 *      docs/remediation-plan-session193.md)
 *  S7-D Analytics icon-block stat cards + 7-day chart cards — MOVED
 *    to tests/e2e/analytics.spec.ts at S195/ES (the analytics-family
 *    consolidation: every pure-analytics describe in this file moved
 *    there; see docs/remediation-plan-session195.md)
 *  S7-E Grade Tracker summary icons (award/target/chart-column, w-8 h-8)
 *    — MOVED to tests/e2e/gradetracker.spec.ts at S195/ES (the
 *    gradetracker-family consolidation: every pure-gradetracker describe
 *    in this file moved there; see
 *    docs/remediation-plan-session195.md)
 *  S7-F Notes editor title input — MOVED to tests/e2e/notes.spec.ts
 *    at S189/EM (the notes-family consolidation: every notes-view
 *    describe now lives there; this file keeps the non-notes
 *    families — see docs/remediation-plan-session189.md)
 *  S183/EG Files toolbar + sections + cards + the filter/search/move
 *      ports — MOVED to tests/e2e/files.spec.ts at S194/ER (the
 *      files-family consolidation: every pure-files describe now lives
 *      there; this file keeps the non-files families — see
 *      docs/remediation-plan-session194.md)
 *  S127/CB13 the analytics Assignments-card avg-progress derivation —
 *      MOVED to tests/e2e/analytics.spec.ts at S195/ES
 *  S7-P Practice Tests bare empty state (the fresh-account zero
 *      state) + S130/CE2 (the True/False default answer) + S172/DV2
 *      (the practiceTests create-dialog catch-up) — MOVED to
 *      tests/e2e/practicetests.spec.ts at S196/ET (the practicetests-
 *      family consolidation: every pure-practicetests describe in this
 *      file moved there; see docs/remediation-plan-session196.md)
 *  S171/DU2 (the studygroups create-dialog catch-up + the description
 *      round-trip) + S176/DZ2 (the studygroups create-dialog + swatch
 *      idiom port) — MOVED to tests/e2e/studygroups.spec.ts at
 *      S196/ET (the studygroups-family consolidation: every pure-
 *      studygroups describe in this file moved there; see
 *      docs/remediation-plan-session196.md)
 *  S173/DW2 the grades create-dialog parity catch-up — MOVED to
 *      tests/e2e/gradetracker.spec.ts at S195/ES
 *  S174/DX4 (the holidays create-dialog catch-up) + S175/DY1 (the
 *      subject create-dialog catch-up) + S176/DZ1 (the events create-dialog
 *      + reminders-rows port) + S176/DZ3 (the tasks create-dialog
 *      placeholder catch-up) — MOVED to tests/e2e/dialogs.spec.ts at
 *      S197/EU (the dialog catch-up family consolidation — the FIRST axis
 *      home: the family's binding axis is the dialog anatomy, not a view;
 *      see docs/remediation-plan-session197.md)
 *  S184/EH (the shared EmptyState family re-rotation) + S186/EJ (the
 *      view-header row family) + S187/EK (the filter-row separation + the
 *      sf-card border + the Tasks search width) — MOVED to
 *      tests/e2e/emptystates.spec.ts + tests/e2e/viewheaders.spec.ts +
 *      tests/e2e/filterrows.spec.ts at S198/EV (the cross-view three-family
 *      consolidation — the SECOND axis-home kind: each family's binding
 *      axis is a UI pattern measured across views, not a view; see
 *      docs/remediation-plan-session198.md)
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
