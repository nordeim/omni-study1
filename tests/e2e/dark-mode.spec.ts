import { expect, test, type Page } from "@playwright/test";

/**
 * Session-10 pins — dark-mode consistency.
 *
 * Governing discovery (docs/remediation-plan-session10.md): the reference's
 * Dark/System options are a Base44 platform NO-OP — html.dark + a dark body,
 * but the app markup (canvas gradient, glass sidebar, white cards) never
 * re-themes. The clone's full dark mode is therefore the documented SUPERSET
 * and is audited for INTERNAL consistency; the pins below assert the repo's
 * own .dark token values (the values globals.css already declares — this
 * session only made them reachable by the generated utilities).
 *
 * Root cause pinned here (S10-1): the shadcn base tokens were LITERAL values
 * inside `@theme inline`, so utilities like bg-card/bg-popover/bg-muted/
 * border-input compiled with the light value inlined — the .dark overrides
 * could never reach them (outline buttons and dialogs rendered white-on-white
 * in dark mode). The fix routes them through hsl(var(--x)) runtime
 * indirection; the LIGHT values are byte-identical (guarded by the final
 * regression test + the entire light-mode pin family in the other specs).
 *
 * Families:
 *  S10-1  token utilities re-theme (outline button, dialog, dropdown menu)
 *  S10-2  dashboard overdue banner gradient
 *  S10-3  MyDay amber progress card gradient
 *  S10-4  timetable today-header + calendar today-cell accent tints
 *  S10-5  sidebar clock chip gradient + time text
 *  S10-6  settings selected theme-mode card tint
 *  S10-7  analytics SVG charts (area fill, axis labels, gridlines)
 *  +      mobile drawer dark panel (standing priority) + light regression guard
 *
 * Mode strategy: each test PATCHes themeMode via the API (the storageState
 * cookie rides page.request — no extra UI navigation, no rate-limited
 * logins). afterEach ALWAYS restores light and awaits the response (the S4
 * accent-restore lesson: a torn-down page must never abort the in-flight
 * restore — the shared user record feeds every later spec).
 */

const PREFERENCES = "/api/settings/preferences";

async function setMode(page: Page, mode: "dark" | "light") {
  const res = await page.request.patch(PREFERENCES, { data: { themeMode: mode } });
  expect(res.ok()).toBeTruthy();
}

/** Navigate and wait for the theme store to apply the user's dark preference
 *  (html.dark + the accent var — both land post-hydration). */
async function gotoDark(page: Page, path: string) {
  await setMode(page, "dark");
  await page.goto(path);
  await page.waitForFunction(
    () =>
      document.documentElement.classList.contains("dark") &&
      document.documentElement.style.getPropertyValue("--sf-primary") !== "",
  );
}

test.afterEach(async ({ page }) => {
  // Guarantee the shared user record is light again even when a pin failed
  // mid-test (later spec files read it on every page load).
  await page.request.patch(PREFERENCES, { data: { themeMode: "light" } });
});

// The repo's own .dark token values (globals.css), pre-converted:
const CARD_DARK = "rgb(14, 14, 17)"; // hsl(240 10% 5.92%)
const POPOVER_DARK = "rgb(9, 9, 11)"; // hsl(240 10% 3.92%)
const INPUT_DARK = "rgb(39, 39, 42)"; // hsl(240 3.7% 15.9%)
const STRONG_DARK = "rgb(196, 181, 253)"; // violet-300 (--sf-primary-strong-dark)
const SLATE_800 = "rgb(30, 41, 59)"; // #1e293b (pinned)
const SLATE_400 = "rgb(148, 163, 184)"; // #94a3b8 (pinned)

test.describe("S10-1 · shadcn token utilities re-theme in dark mode", () => {
  test("outline button, dialog and dropdown render on dark tokens", async ({ page }) => {
    await gotoDark(page, "/Tasks");

    // The S9-C outline filter button: bg-card + border-input must resolve to
    // the dark tokens (was: inlined white bg + near-white inherited text at
    // contrast 1.04 — invisible).
    const ctrl = page.locator('main button[aria-label="Filter tasks"]');
    await expect(ctrl).toBeVisible();
    const ctrlBg = await ctrl.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(ctrlBg).toBe(CARD_DARK);
    const ctrlBorder = await ctrl.evaluate((el) => getComputedStyle(el).borderColor);
    expect(ctrlBorder).toBe(INPUT_DARK);

    // The task dialog: bg-card content (was a WHITE dialog with near-white
    // title text — unreadable).
    await page.getByRole("button", { name: /add task/i }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    const dlgBg = await dialog.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(dlgBg).toBe(CARD_DARK);
    const title = dialog.getByRole("heading", { level: 2 });
    await expect(title).toBeVisible();
    const titleColor = await title.evaluate((el) => getComputedStyle(el).color);
    expect(titleColor).toBe("rgb(250, 250, 250)"); // --color-foreground (dark)
    await page.keyboard.press("Escape");

    // The filter DropdownMenu: bg-popover content (was a white menu).
    await ctrl.click();
    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();
    const menuBg = await menu.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(menuBg).toBe(POPOVER_DARK);
    const itemColor = await menu
      .locator('[role="menuitem"]')
      .first()
      .evaluate((el) => getComputedStyle(el).color);
    expect(itemColor).toBe("rgb(250, 250, 250)"); // --popover-foreground (dark)
  });
});

test.describe("S10-2/3/5 · banner, amber card and clock chip re-theme", () => {
  test("dashboard overdue banner carries a dark red/orange wash", async ({ page }) => {
    await gotoDark(page, "/Dashboard");
    const banner = page.locator('main [aria-label="Overdue alert"]');
    await expect(banner).toBeVisible();
    const bg = await banner.evaluate((el) => getComputedStyle(el).backgroundImage.replace(/\s+/g, " "));
    // .dark .sf-overdue-banner: rgb(127 29 29 / 0.2) → rgb(124 45 18 / 0.14)
    // (red-800 / orange-900 washes; serializes as rgba per trap 10).
    expect(bg).toContain("127, 29, 29");
    expect(bg).toContain("124, 45, 18");
    // The existing dark: text variants now read correctly on the dark wash.
    const h3 = banner.getByRole("heading", { level: 3 });
    const h3Color = await h3.evaluate((el) => getComputedStyle(el).color);
    expect(h3Color).toBe("rgb(252, 165, 165)"); // red-300
  });

  test("MyDay amber progress card carries a dark amber wash", async ({ page }) => {
    await gotoDark(page, "/MyDay");
    const card = page.locator('main [aria-label="Today progress"]');
    await expect(card).toBeVisible();
    const bg = await card.evaluate((el) => getComputedStyle(el).backgroundImage.replace(/\s+/g, " "));
    // .dark .sf-amber-card: rgb(120 53 15 / 0.22) → rgb(124 45 18 / 0.16)
    // (amber-800 / orange-900 washes).
    expect(bg).toContain("120, 53, 15");
    expect(bg).toContain("124, 45, 18");
    const label = card.getByText("Today's Progress");
    const labelColor = await label.evaluate((el) => getComputedStyle(el).color);
    expect(labelColor).toBe("rgb(251, 191, 36)"); // amber-400 (dark: variant)
  });

  test("sidebar clock chip carries the dark accent wash + violet-300 time", async ({ page }) => {
    await gotoDark(page, "/Dashboard");
    // S3-B locator convention (navigation.spec): the aside's rounded-xl chip.
    const chip = page.locator("aside div.rounded-xl").filter({ hasText: /AM|PM/ }).first();
    await expect(chip).toBeVisible();
    const bg = await chip.evaluate((el) => getComputedStyle(el).backgroundImage.replace(/\s+/g, " "));
    // .dark .sf-clock-chip: soft-dark stops at 0.35 / 0.12 (the calc-display
    // dark treatment — the two surfaces are design siblings).
    expect(bg).toContain("76, 29, 149");
    const time = chip.locator("p").first();
    const timeColor = await time.evaluate((el) => getComputedStyle(el).color);
    expect(timeColor).toBe(STRONG_DARK); // violet-300 on the dark chip
  });
});

test.describe("S10-4 · timetable and calendar accent tints re-theme", () => {
  test("timetable today header uses the dark accent tint + strong-dark date", async ({ page }) => {
    await gotoDark(page, "/Timetable");
    const head = page.locator("[data-today-header]").first();
    await expect(head).toBeVisible();
    const bg = await head.evaluate((el) => getComputedStyle(el).backgroundColor);
    // .dark .sf-today-tint: rgb(var(--sf-primary-soft-dark) / 0.3)
    expect(bg).toContain("76, 29, 149");
    const date = head.locator("p.text-lg");
    const dateColor = await date.evaluate((el) => getComputedStyle(el).color);
    expect(dateColor).toBe(STRONG_DARK); // dark:text-sf-primary-strong-dark
  });

  test("calendar today cell (unselected) uses the dark accent tint", async ({ page }) => {
    await gotoDark(page, "/Calendar");
    const grid = page.locator('[aria-label="Calendar days"]');
    await expect(grid).toBeVisible();
    // Deselect today (selected = today by default) to expose the tint cell.
    await grid.locator("button").filter({ hasText: "15" }).first().click();
    // transition-all animates the tint — poll the FINAL computed value (S8 lesson).
    await page.waitForFunction(() => {
      const el = document.querySelector('[aria-label="Calendar days"] button[data-today]');
      return el !== null && getComputedStyle(el).backgroundColor.includes("76, 29, 149");
    });
    const today = grid.locator("button[data-today]");
    const todayBg = await today.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(todayBg).toContain("76, 29, 149");
    // The day number keeps its readable dark variant (strong-dark).
    const dayNum = today.locator("span").first();
    const dayColor = await dayNum.evaluate((el) => getComputedStyle(el).color);
    expect(dayColor).toBe(STRONG_DARK);
  });
});

test.describe("S10-6/7 · settings tint and analytics charts re-theme", () => {
  test("settings selected theme card uses the dark accent tint", async ({ page }) => {
    await gotoDark(page, "/Settings");
    const selected = page.getByRole("button", { name: "Dark", exact: true });
    await expect(selected).toBeVisible();
    await expect(selected).toHaveAttribute("aria-pressed", "true");
    const bg = await selected.evaluate((el) => getComputedStyle(el).backgroundColor);
    // .dark .sf-selected-tint: rgb(var(--sf-primary-soft-dark) / 0.3)
    expect(bg).toContain("76, 29, 149");
    const label = selected.getByText("Dark", { exact: true });
    const labelColor = await label.evaluate((el) => getComputedStyle(el).color);
    expect(labelColor).toBe("rgb(241, 245, 249)"); // slate-100 (dark: variant)
  });

  test("analytics area chart, axis labels and gridlines re-theme", async ({ page }) => {
    await gotoDark(page, "/Analytics");
    const chart = page.locator('[aria-label="Task activity chart"]');
    await expect(chart).toBeVisible();
    // The Task Activity area fill: #e2e8f0 in light, slate-800 in dark.
    const area = chart.locator('path[fill="#e2e8f0"]').first();
    await expect(area).toBeVisible();
    const areaFill = await area.evaluate((el) => getComputedStyle(el).fill);
    expect(areaFill).toBe(SLATE_800);
    // Axis labels: #666 in light, slate-400 in dark (computed fill).
    const axis = chart.locator("text").first();
    const axisFill = await axis.evaluate((el) => getComputedStyle(el).fill);
    expect(axisFill).toBe(SLATE_400);
    // Dashed gridlines: #f1f5f9 in light, slate-800 in dark (computed stroke).
    const gridline = chart.locator('line[stroke-dasharray="3 3"]').first();
    const gridStroke = await gridline.evaluate((el) => getComputedStyle(el).stroke);
    expect(gridStroke).toBe(SLATE_800);
  });
});

test.describe("standing priority · the mobile drawer in dark mode", () => {
  test("drawer panel is dark with light links; Escape closes (clone superset)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoDark(page, "/Dashboard");
    await page.getByRole("button", { name: "Open navigation menu" }).click();
    // The drawer panel is the nav's direct parent (mobile-chrome.tsx):
    // w-72 white / dark:bg-slate-950.
    const panel = page
      .getByRole("navigation", { name: "Primary" })
      .locator("xpath=ancestor::div[1]");
    await expect(panel).toBeVisible();
    const panelBg = await panel.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(panelBg).toBe("rgb(2, 6, 23)"); // dark:bg-slate-950 (measured)
    const link = panel.getByRole("link").first();
    const linkColor = await link.evaluate((el) => getComputedStyle(el).color);
    expect(linkColor).toBe("rgb(250, 250, 250)"); // light links on the dark panel
    // The reference's drawer does NOT close on Escape; the clone's does
    // (Radix-standard superset — pinned so it never regresses).
    await page.keyboard.press("Escape");
    await expect(page.getByRole("navigation", { name: "Primary" })).toBeHidden();
  });
});

test.describe("regression guard · light mode is byte-identical", () => {
  test("light surfaces keep their exact measured values after the rework", async ({ page }) => {
    await setMode(page, "light");
    await page.goto("/Tasks");
    await page.waitForFunction(
      () => !document.documentElement.classList.contains("dark") && !!document.querySelector('main button[aria-label="Filter tasks"]'),
    );
    const ctrl = page.locator('main button[aria-label="Filter tasks"]');
    const ctrlBg = await ctrl.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(ctrlBg).toBe("rgb(255, 255, 255)"); // card (light) — unchanged

    await page.goto("/Dashboard");
    await page.waitForFunction(() => !document.documentElement.classList.contains("dark"));
    const banner = page.locator('main [aria-label="Overdue alert"]');
    await expect(banner).toBeVisible();
    const bg = await banner.evaluate((el) => getComputedStyle(el).backgroundImage.replace(/\s+/g, " "));
    expect(bg).toContain("rgb(254, 242, 242)"); // red-50 — the S9-A light pin
    expect(bg).toContain("rgb(255, 247, 237)"); // orange-50

    const chip = page.locator("aside div.rounded-xl").filter({ hasText: /AM|PM/ }).first();
    const chipBg = await chip.evaluate((el) => getComputedStyle(el).backgroundImage.replace(/\s+/g, " "));
    expect(chipBg).toContain("rgb(245, 243, 255)"); // violet-50 — the S3-B light pin
    expect(chipBg).toContain("rgb(238, 242, 255)"); // indigo-50
    const time = chip.locator("p").first();
    const timeColor = await time.evaluate((el) => getComputedStyle(el).color);
    expect(timeColor).toBe("rgb(109, 40, 217)"); // --sf-primary-deep — S3-C light pin
  });
});
