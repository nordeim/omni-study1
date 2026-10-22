import { expect, test } from "@playwright/test";

// Mobile navigation (390×844 — the reference's mobile chrome): the app bar
// with hamburger, the slide-in drawer with brand header + close button +
// all 20 nav links, and navigation behavior. The reference app renders its
// sidebar only at lg (≥1024) — below that everything goes through the
// drawer. Contexts arrive AUTHENTICATED (setup-project storageState).

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

test.describe("mobile navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/Dashboard");
  });

  test("app bar renders fixed+glass with hamburger, brand and live clock", async ({ page }) => {
    // Reference (measured 390×844): lg:hidden fixed top-0 left-0 right-0 h-16
    // glass z-40 … justify-between px-4 shadow-sm — left: hamburger + 32px
    // gradient brand chip + "StudyFlow"; right: a live clock "03:45 AM".
    const bar = page.getByRole("banner");
    await expect(bar).toBeVisible();
    await expect(bar).toHaveCSS("height", "64px");
    await expect(bar).toHaveCSS("position", "fixed");
    await expect(bar).toHaveCSS("background-color", "rgba(255, 255, 255, 0.8)");
    await expect(bar).toHaveCSS("backdrop-filter", /blur\(20px\)/);
    await expect(bar.getByRole("button", { name: "Open navigation menu" })).toBeVisible();
    // S3-I part 1 (session-67 node dump): the app-bar brand span is
    // text-base — 16px/24px; the clone's text-lg read 18px/28px here.
    const barBrand = bar.getByText("StudyFlow", { exact: true });
    await expect(barBrand).toBeVisible();
    await expect(barBrand).toHaveCSS("font-size", "16px");
    await expect(barBrand).toHaveCSS("line-height", "24px");
    // The header clock renders the reference's 2-digit-hour 12-hour format.
    const barClock = bar.getByText(/^\d{2}:\d{2} (AM|PM)$/, { exact: true });
    await expect(barClock).toBeVisible();
    // S3-L part 1 (measured s68): the reference app-bar clock reads 14px /
    // 500 / slate-600 (rgb(71,85,105)) — the clone shipped 600 / slate-700.
    await expect(barClock).toHaveCSS("font-weight", "500");
    await expect(barClock).toHaveCSS("color", "rgb(71, 85, 105)");
  });

  test("mobile content starts at 80px — no dead gap under the fixed bar (S3-E pin)", async ({ page }) => {
    // Reference: fixed header overlays content; its main is pt-16 (64px)
    // plus an inner p-4 wrapper — first heading at 80px. The clone models
    // the same offset as main pt-20 (64 bar + 16 breathing room). The old
    // sticky-header + pt-20 model STACKED both offsets (144px dead gap).
    const h1 = page.getByRole("heading", { name: /Good (morning|afternoon|evening)/ });
    await expect(h1).toBeVisible();
    const box = await h1.boundingBox();
    expect(Math.round(box?.y ?? 0)).toBe(80);
    const main = page.locator("main");
    await expect(main).toHaveCSS("padding-top", "80px");
  });

  test("the sidebar is hidden below lg", async ({ page }) => {
    const aside = page.locator("aside");
    await expect(aside).toBeHidden();
  });

  test("hamburger opens the drawer with all 20 links + brand + close", async ({ page }) => {
    await page.getByRole("button", { name: "Open navigation menu" }).tap();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("StudyFlow", { exact: true })).toBeVisible();
    await expect(dialog.getByText("Your study companion")).toBeVisible();

    for (const label of [
      "Dashboard",
      "My Day",
      "Tasks",
      "Calendar",
      "Events",
      "Timetable",
      "Assignments",
      "Exams",
      "Notes",
      "Flashcards",
      "Practice Tests",
      "Study Groups",
      "Grade Tracker",
      "Analytics",
      "Files",
      "Calculator",
      "Math Solver",
      "AI Assistant",
      "Focus Timer",
      "Settings",
    ]) {
      await expect(dialog.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
    await expect(dialog.getByRole("button", { name: "Close menu" })).toBeVisible();
  });

  test("the drawer panel mirrors the reference: 288px, light blurred backdrop, icon nav items, no footer (S3-F pin)", async ({ page }) => {
    await page.getByRole("button", { name: "Open navigation menu" }).tap();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Panel: w-72 = 288px, white, shadow-2xl, no right border. (±1px
    // tolerance — Chromium occasionally rounds the fractional layout box
    // under mobile DPR emulation; the reference measures 288.)
    const panel = dialog.locator("div.absolute.inset-y-0.left-0");
    const box = await panel.boundingBox();
    expect(Math.round(box?.width ?? 0)).toBeGreaterThanOrEqual(287);
    expect(Math.round(box?.width ?? 0)).toBeLessThanOrEqual(288);
    await expect(panel).toHaveCSS("background-color", "rgb(255, 255, 255)");
    await expect(panel).toHaveCSS("border-right-width", "0px");

    // Backdrop: bg-black/20 + a 4px backdrop blur (reference measured; the
    // computed color serializes as oklab(0 0 0 / 0.2) in Chromium — same
    // 20% black the reference's rgba(0,0,0,0.2) produces).
    // S4-A pin: v4's backdrop-blur-sm computes 8px — v3's blur-sm (the
    // reference's class) is v4's blur-xs. The amount must be 4px.
    const backdrop = dialog.getByRole("button", { name: "Close navigation menu" });
    const backdropBg = await backdrop.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(backdropBg).toMatch(/rgba\(0, 0, 0, 0\.2\)|oklab\(0 0 0 \/ 0\.2\)/);
    await expect(backdrop).toHaveCSS("backdrop-filter", /blur\(4px\)/);

    // Nav items carry icons (20px) + labels like the desktop sidebar.
    const firstLink = dialog.getByRole("link", { name: "Dashboard", exact: true });
    const icon = firstLink.locator("svg").first();
    await expect(icon).toBeVisible();
    const iconBox = await icon.boundingBox();
    expect(Math.round(iconBox?.width ?? 0)).toBe(20);

    // The reference drawer has NO footer section (brand header + nav only).
    await expect(panel.locator("footer, [data-testid=drawer-footer]")).toHaveCount(0);
    await expect(panel.getByText(/@/)).toHaveCount(0);
  });

  test("the drawer brand header typography matches the measured reference (S3-I pin)", async ({ page }) => {
    // Reference (measured 390×844, session-67): drawer brand title 16px
    // bold / 24px line-height (text-base defaults), subtitle 12px / 16px
    // (text-xs defaults) — the subtitle fits ONE line in the 288px panel.
    // The clone shipped text-lg (18px) + text-sm (14px), which read
    // visibly larger and wrapped the subtitle to two lines. (S3-I; the
    // S3-H sibling pins the desktop sidebar brand header.)
    await page.getByRole("button", { name: "Open navigation menu" }).tap();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    const title = dialog.getByText("StudyFlow", { exact: true });
    await expect(title).toBeVisible();
    await expect(title).toHaveCSS("font-size", "16px");
    await expect(title).toHaveCSS("font-weight", "700");
    await expect(title).toHaveCSS("line-height", "24px");

    const subtitle = dialog.getByText("Your study companion", { exact: true });
    await expect(subtitle).toBeVisible();
    await expect(subtitle).toHaveCSS("font-size", "12px");
    await expect(subtitle).toHaveCSS("line-height", "16px");
    // ONE line at 16px lh — the reference never wraps (two lines ≈ 32px).
    const subBox = await subtitle.boundingBox();
    expect(subBox?.height ?? 0).toBeLessThan(20);
  });

  test("the drawer chrome matches the s68-measured reference (S3-L pin)", async ({ page }) => {
    // Reference (measured s68, 390×844): the drawer brand block is p-6 with
    // a border-b divider (1px slate-100) and renders 89px tall — the clone's
    // p-6 pb-4 block was 80px with NO divider. The nav rows start at y ≈ 105
    // (89 + the nav's p-4) and sit FLUSH (48px pitch — the clone's gap-1
    // produced 52px). The drawer subtitle reads slate-400 (the clone's
    // slate-500 was the same drift the desktop sidebar carried).
    await page.getByRole("button", { name: "Open navigation menu" }).tap();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    const panel = dialog.locator("div.absolute.inset-y-0.left-0");
    // The brand block is the panel's first div child (its next sibling is
    // the <nav> — no intermediate divs).
    const brandBlock = panel.locator("div").first();
    await expect(brandBlock).toHaveCSS("padding-top", "24px");
    await expect(brandBlock).toHaveCSS("padding-bottom", "24px");
    await expect(brandBlock).toHaveCSS("border-bottom-width", "1px");
    await expect(brandBlock).toHaveCSS("border-bottom-color", "rgb(241, 245, 249)");
    const blockH = await brandBlock.evaluate((el) => el.getBoundingClientRect().height);
    expect(blockH).toBe(89);

    const subtitle = dialog.getByText("Your study companion", { exact: true });
    // The reference renders slate-400 (2.56:1 — an axe failure); the clone
    // keeps slate-500 (4.76:1) — the documented a11y-superset deviation.
    await expect(subtitle).toHaveCSS("color", "rgb(100, 116, 139)"); // slate-500

    // FLUSH 48px row pitch; the first row sits at y ≈ 105.
    const rows = panel.locator("a");
    const geo = await rows.evaluateAll((as) => {
      const vis = as.filter((a) => a.getBoundingClientRect().width > 0);
      return vis.length >= 2
        ? {
            first: vis[0].getBoundingClientRect().y,
            pitch: vis[1].getBoundingClientRect().y - vis[0].getBoundingClientRect().y,
          }
        : null;
    });
    expect(geo).not.toBeNull();
    expect(Math.round(geo!.first)).toBe(105);
    expect(geo!.pitch).toBe(48);
  });

  test("drawer links navigate and the drawer closes", async ({ page }) => {
    await page.getByRole("button", { name: "Open navigation menu" }).tap();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("link", { name: "Tasks", exact: true }).tap();
    await expect(page).toHaveURL(/\/Tasks\/?$/);
    await expect(page.getByRole("heading", { name: "All Tasks", exact: true })).toBeVisible();
    await expect(page.getByRole("dialog")).toBeHidden();

    // Navigate again from Tasks to Settings through the drawer.
    await page.getByRole("button", { name: "Open navigation menu" }).tap();
    await page.getByRole("dialog").getByRole("link", { name: "Settings", exact: true }).tap();
    await expect(page).toHaveURL(/\/Settings\/?$/);
    await expect(
      page.getByRole("heading", { name: "Settings", exact: true }),
    ).toBeVisible();
  });

  test("the drawer closes on Escape and on backdrop tap", async ({ page }) => {
    await page.getByRole("button", { name: "Open navigation menu" }).tap();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();

    await page.getByRole("button", { name: "Open navigation menu" }).tap();
    await expect(dialog).toBeVisible();
    // Tap the backdrop on the RIGHT side (the drawer panel spans the left
    // 288px at 390px wide, so the element's center is covered by it).
    await page
      .getByRole("button", { name: "Close navigation menu" })
      .click({ position: { x: 360, y: 400 } });
    await expect(dialog).toBeHidden();
  });

  test("the app bar keeps the brand and clock after navigation (reference behavior)", async ({ page }) => {
    await page.getByRole("button", { name: "Open navigation menu" }).tap();
    await page.getByRole("dialog").getByRole("link", { name: "Calendar", exact: true }).tap();
    await expect(page).toHaveURL(/\/Calendar\/?$/);
    // The reference header always shows the StudyFlow brand + clock — it
    // does NOT switch to the current view's title.
    const bar = page.getByRole("banner");
    await expect(bar.getByText("StudyFlow", { exact: true })).toBeVisible();
    await expect(bar.getByText(/^\d{2}:\d{2} (AM|PM)$/, { exact: true })).toBeVisible();
  });

  test("the Start My Day CTA hugs its content on mobile (S3-G pin)", async ({ page }) => {
    // Reference: 155×36 inline-flex CTA at 390px — NOT stretched. The old
    // flex-col parent stretched the unconstrained child to 358px. (S4-K,
    // measured s68: the CTA is an anchor with a sparkles icon — the button
    // locator corrected per AP-108.)
    const cta = page.getByRole("link", { name: "Start My Day" });
    await expect(cta).toBeVisible();
    const box = await cta.boundingBox();
    expect(Math.round(box?.height ?? 0)).toBe(36);
    expect(Math.round(box?.width ?? 0)).toBeLessThan(200);
  });
});

test.describe("lg breakpoint navigation", () => {
  test.use({ viewport: { width: 1024, height: 800 } });

  test("the fixed sidebar appears at lg and the hamburger disappears", async ({ page }) => {
    await page.goto("/Dashboard");
    const aside = page.locator("aside");
    await expect(aside).toBeVisible();
    await expect(aside).toHaveCSS("width", "260px");
    await expect(page.getByRole("button", { name: "Open navigation menu" })).toBeHidden();
    // The main content is offset by the fixed sidebar width.
    const main = page.locator("main");
    await expect(main).toHaveCSS("margin-left", "260px");
  });
});

// S78/AE6 (measured on the reference at 390×844): the ref renders the Notes
// list pane (w-80 @320px) and the Flashcards deck list (239px) SIDE BY SIDE
// with their right panes — the clone hid both asides below md (the mobile-only
// h2 + FAB pattern), so a 390px user could not browse or select existing
// notes/decks at all. The fix renders the asides at ALL widths (the
// StudyGroups pattern); the right panes keep min-w-0 so scrollWidth stays
// ≤ 390 (the ref's own 416px overflow is its bug, not a clone goal).
test.describe("S78 · mobile two-pane parity — the list panes render at 390", () => {
  test("Notes renders the list pane and selects a note from it", async ({ page }) => {
    await page.goto("/Notes");
    await page.waitForFunction(
      () => document.documentElement.style.getPropertyValue("--sf-primary") !== "",
    );

    const aside = page.getByRole("complementary", { name: "Notes list pane" });
    await expect(aside).toBeVisible();
    // The h1 lives in the now-visible list pane (the ref's own shape).
    await expect(aside.getByRole("heading", { name: "Notes", exact: true })).toBeVisible();
    await expect(aside.getByLabel("Search notes")).toBeVisible();
    // A seeded note row is visible.
    const row = aside.getByRole("button", { name: /Kinetics summary/ }).first();
    await expect(row).toBeVisible();
    // No horizontal overflow in the no-selection state (the state the ref
    // itself measured 416px on — its own overflow bug; the clone's min-w-0
    // keeps the squeezed right pane inside 390).
    const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollW).toBeLessThanOrEqual(390);
    // Tapping the row selects the note — the editor's title input mounts
    // with the note's title (the browse+select capability the hidden pane
    // previously made impossible at 390).
    await row.tap();
    await expect(page.getByLabel("Note title")).toHaveValue("Kinetics summary");
  });

  test("Flashcards renders the deck list and switches decks from it", async ({ page }) => {
    await page.goto("/Flashcards");
    await page.waitForFunction(
      () => document.documentElement.style.getPropertyValue("--sf-primary") !== "",
    );

    const aside = page.getByRole("complementary", { name: "Deck list pane" });
    await expect(aside).toBeVisible();
    await expect(aside.getByRole("heading", { name: "Flashcards", exact: true })).toBeVisible();
    // The auto-selected detail renders SOME seeded deck (the collection
    // orders by createdAt — not pinned to a specific first deck) …
    const detail = page.getByLabel("Deck detail");
    await expect(
      detail.getByRole("heading", { name: /^(Integration rules|Spanish Vocabulary|Biology Chapter 5)$/ }),
    ).toBeVisible();
    // … and the deck rows are visible; tapping one switches the detail.
    // S79/AF1 calibration: the row now also carries the mobile-only Study
    // affordance at its right edge — tap the row's NAME (the select
    // gesture; a center tap would land on the affordance).
    // S80/AG11b (the s80 audit, I4): the old `.first()` role locator
    // matched BOTH the row and its affordance (the row's accessible name
    // absorbs "Study Biology Chapter 5") and only DOM order saved it —
    // the deck-rows child locator scopes to the ROW by structure.
    const row = page.locator('[aria-label="Deck rows"] > *', { hasText: "Biology Chapter 5" }).first();
    await row.locator("h2").tap();
    await expect(detail.getByRole("heading", { name: "Biology Chapter 5" })).toBeVisible();
    const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollW).toBeLessThanOrEqual(390);
  });

  // S78/AE9-13 (the standing mobile sweep's finding layer, encoded as an e2e
  // guard): five header/toolbar rows overflowed 390px (Timetable 402, Exams
  // 584, Files 499, Calculator 427, StudyGroups 393 — element-attributed by
  // scripts/mobile-overflow-probe-s78.mjs). The ref itself overflows on
  // Timetable (395) and Calculator (429) — its own bug family; the clone's
  // no-overflow contract wins everywhere (flex-wrap / scrollable tabs /
  // the ref's own shrinkable StudyGroups aside).
  test("the five remediated views keep scrollWidth within 390 (S78/AE9-13)", async ({ page }) => {
    for (const v of ["Timetable", "Exams", "Files", "Calculator", "StudyGroups"]) {
      await page.goto(`/${v}`);
      await page.waitForFunction(
        () => document.documentElement.style.getPropertyValue("--sf-primary") !== "",
      );
      await page.waitForTimeout(900);
      const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(scrollW, `${v} overflowed`).toBeLessThanOrEqual(390);
    }
  });
});

// S79/AF1 (measured on the reference at 390×844): the ref's Flashcards
// study mode is a FULL VIEW REPLACEMENT — entering study swaps out the
// entire two-pane layout (desktop innerText during study is exactly
// "Exit Study N / M [card] Click card to flip"), and at 390 the study
// pane renders FULL WIDTH (Exit x=16, scrollWidth 390, the deck list
// ABSENT). The clone rendered the study pane inside the squeezed ~46px
// right pane — the deck-detail toolbar's Study button sat at x=360..432
// (clipped outside the viewport; a tap silently missed) and the study
// chrome was unusable: a 390px user could not enter or use study mode.
// The fix: study replaces the whole view (the ref's layout) + a
// below-md IN-ROW Study affordance keeps the entry one tap away (the
// ref's own mobile deck-detail is its overflow-bug family — reachable
// only by panning to its 836px scrollWidth — so the clone's contained
// squeeze + the in-row entry is the superset answer).
test.describe("S79 · mobile Flashcards study mode (the full-replacement parity fix)", () => {
  test("the in-row Study affordance enters the full-width study pane at 390; Exit restores the layout", async ({ page }) => {
    await page.goto("/Flashcards");
    await page.waitForFunction(
      () => document.documentElement.style.getPropertyValue("--sf-primary") !== "",
    );

    // The 4-card deck's row carries the below-md Study affordance, fully
    // inside the viewport (the deck-detail toolbar's Study button is
    // clipped by the squeezed pane at 390 — the documented contained
    // squeeze, so the ROW is the mobile entry). exact: true — the deck
    // ROW's role=button accessible name absorbs the affordance's label
    // (the substring-collision lesson).
    const rowBtn = page.getByRole("button", { name: "Study Integration rules", exact: true });
    await expect(rowBtn).toBeVisible();
    const btnBox = await rowBtn.boundingBox();
    expect(btnBox).not.toBeNull();
    expect(btnBox!.x).toBeGreaterThanOrEqual(0);
    expect(btnBox!.x + btnBox!.width).toBeLessThanOrEqual(390);

    // Enter study: the study pane replaces the WHOLE view (the ref's
    // measured mobile shape — the deck list is ABSENT during study).
    await rowBtn.tap();
    const study = page.locator('[aria-label="Study mode"]');
    await expect(study).toBeVisible();
    await expect(page.getByRole("complementary", { name: "Deck list pane" })).toHaveCount(0);
    await expect(page.getByLabel("Deck detail")).toHaveCount(0);

    // The Exit button is FULLY inside the viewport (the ref measured
    // x=16; the pre-fix clone clipped it at x=347..419).
    const exit = study.getByRole("button", { name: "Exit Study" });
    await expect(exit).toBeVisible();
    const exitBox = await exit.boundingBox();
    expect(exitBox).not.toBeNull();
    expect(exitBox!.x).toBeGreaterThanOrEqual(0);
    expect(exitBox!.x + exitBox!.width).toBeLessThanOrEqual(390);

    // No horizontal overflow in the study state (the ref measured 390).
    const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollW).toBeLessThanOrEqual(390);

    // The counter renders for the row's OWN deck (the ref's "1 / 4" shape).
    await expect(study.getByText(/^1 \/ 4$/)).toBeVisible();

    // Exit Study restores the two-pane layout (the deck list returns).
    await exit.tap();
    await expect(page.getByRole("complementary", { name: "Deck list pane" })).toBeVisible();
    await expect(page.getByLabel("Deck detail")).toBeVisible();
  });
});
