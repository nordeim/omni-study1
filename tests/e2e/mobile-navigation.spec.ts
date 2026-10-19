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
