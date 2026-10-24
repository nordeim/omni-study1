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
    const ctrl = page.locator('main button[aria-label^="Filter tasks"]');
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
    // h2 since session 61 (Lighthouse heading-order fix; visual no-op).
    const h2 = banner.getByRole("heading", { level: 2 });
    const h2Color = await h2.evaluate((el) => getComputedStyle(el).color);
    expect(h2Color).toBe("rgb(252, 165, 165)"); // red-300
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
      () => !document.documentElement.classList.contains("dark") && !!document.querySelector('main button[aria-label^="Filter tasks"]'),
    );
    const ctrl = page.locator('main button[aria-label^="Filter tasks"]');
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

// S78/AE3 (the s78 code audit): the Quill snow theme pins the blank editor's
// placeholder (.ql-blank::before) to rgba(0,0,0,0.6) — ~1.07:1 on the
// slate-900 dark editor card, effectively invisible. The S77 dark block
// never covered it because no sweep ever rendered a BLANK note in dark.
test.describe("S78/AE3 · the dark-mode Quill placeholder", () => {
  test("a blank note's placeholder reads slate-400 in dark mode", async ({ page }) => {
    await gotoDark(page, "/Notes");
    // Create a blank note through the real flow (the New note menu → dialog).
    await page.getByRole("button", { name: "New note menu" }).click();
    // exact: true — "New note" substring-matches "New Notebook" too.
    await page.getByRole("menuitem", { name: "New Note", exact: true }).click();
    await page.getByLabel("Name").fill("S78 dark placeholder probe");
    await page.getByRole("dialog").getByRole("button", { name: "Save", exact: true }).click();
    // The new note is selected and BLANK — the placeholder renders.
    const editor = page.locator(".ql-editor.ql-blank");
    await expect(editor).toBeVisible();
    const phColor = await editor.evaluate((el) => getComputedStyle(el, "::before").color);
    expect(phColor).toBe(SLATE_400); // not snow's rgba(0, 0, 0, 0.6)
  });
});

// S79/AF5 (the standing dark-sweep artifact, closed): the sidebar clock
// DATE read violet-950 (rgb(76,29,149)) on the dark chip — 1.78:1,
// flagged unreadable on ALL 20 views by the standing dark sweep. The
// theme system's own token comments name strong/strongDark as the
// clock-date pair (theme.ts: "strong: 600 — clock date" / "strongDark:
// 300 — dark-mode strong counterpart"), and the ref's dark mode is its
// own half-broken family (its sidebar stays fully light-themed —
// measured through its own Settings Theme→Dark), so the clone's full
// dark theme remains the documented superset: the date moves to the
// accent-aware 400 step — now its OWN dedicated token
// (--sf-primary-clock-date-dark, S88/AO5 — the I2 decoupling; the
// values are the same 400 step the avatar gradient start carries) —
// one step dimmer than the time's 300, mirroring light's 700/600
// hierarchy, ~5.8:1 on the dark chip.
test.describe("S79/AF5 · the dark-mode clock date reads the 400 step", () => {
  test("the sidebar clock date computes violet-400 in dark (readable, accent-aware)", async ({ page }) => {
    await gotoDark(page, "/Dashboard");
    const date = page.locator(".sf-clock-date");
    await expect(date).toBeVisible();
    const dateColor = await date.evaluate((el) => getComputedStyle(el).color);
    // The avatarFrom token under the default violet accent: violet-400.
    expect(dateColor).toBe("rgb(167, 139, 250)");
  });

  test("light mode keeps the clock date at violet-600 (the regression guard)", async ({ page }) => {
    await page.goto("/Dashboard");
    await page.waitForFunction(
      () => document.documentElement.style.getPropertyValue("--sf-primary") !== "",
    );
    const date = page.locator(".sf-clock-date");
    await expect(date).toBeVisible();
    const dateColor = await date.evaluate((el) => getComputedStyle(el).color);
    // Unchanged: the light rule still resolves --sf-primary-strong.
    expect(dateColor).toBe("rgb(124, 58, 237)");
  });
});

// S80/AG (the standing dark sweep's untracked flashbulb family — 7 entries,
// measured on BOTH hosts): four surfaces where the clone's dark canvas
// carried light islands the reference does not render in dark (AG1/AG2 —
// the s69 "dark superset inverts the ramp" decisions, re-measured against
// the live ref in dark: the ref does NOT re-theme these buttons, they stay
// neutral-950 rgb(10,10,10) with light text), plus the un-themed pill
// family (AG3/AG4 — the house dark-pill treatment, `dark:bg-*-950
// dark:text-*-300`, the dashboard Today-pill/assignments/exams precedent),
// plus the Tasks aside active row (AG5 — the ref KEEPS its violet-50 light
// pill in dark, but the clone's own dark nav active surfaces all re-theme;
// the pill moves to the sf-today-tint dark token pair for internal
// consistency, the same doctrine that fixed the AF5 clock date).
test.describe("S80/AG · the dark-canvas flashbulb family", () => {
  // AG11a rides here too (the s80 audit, I3): the AF5 accent-awareness
  // claim was unpinned — this block's afterEach restores the accent the
  // calculator.spec.ts way (the S4/S11 leak lesson).
  test.afterEach(async ({ page }) => {
    await page.request.patch(PREFERENCES, { data: { accentColor: "violet" } });
  });

  test("AG1: the More Options button stays neutral-950 in dark (the ref's measured dark)", async ({ page }) => {
    await gotoDark(page, "/MyDay");
    const more = page.getByRole("button", { name: "More Options" });
    await expect(more).toBeVisible();
    const cs = await more.evaluate((el) => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, color: s.color };
    });
    // Reference dark (measured s80, agent-browser through its Settings
    // Theme→Dark): bg rgb(10,10,10), text rgb(250,250,250) — the ref does
    // NOT re-theme this button; the s69 clone inversion (dark:#f5f5f5)
    // was drift, and a standing dark-sweep flashbulb.
    expect(cs.bg).toBe("rgb(10, 10, 10)");
    expect(cs.color).toBe("rgb(250, 250, 250)");
  });

  test("AG2: the Calculator History button is the ref's near-black pill in dark", async ({ page }) => {
    await gotoDark(page, "/Calculator");
    const history = page.getByRole("button", { name: "History" });
    await expect(history).toBeVisible();
    const cs = await history.evaluate((el) => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, color: s.color };
    });
    // Reference dark (measured s80): rgb(10,10,10) + rgb(250,250,250) —
    // the clone's dark:bg-slate-100 inversion was drift.
    expect(cs.bg).toBe("rgb(10, 10, 10)");
    expect(cs.color).toBe("rgb(250, 250, 250)");
  });

  test("AG3: the Calculator AC key takes the house dark red pill (red-950 / red-300)", async ({ page }) => {
    await gotoDark(page, "/Calculator");
    const clear = page.getByRole("button", { name: "Clear" });
    await expect(clear).toBeVisible();
    const cs = await clear.evaluate((el) => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, color: s.color };
    });
    // The house dark-pill family (dashboard Today pill, assignments and
    // exams urgency pills): -950 fill / -300 text. The ref's own dark
    // Clear key (near-black + red-600 among its white digit keys) is its
    // half-broken keypad family — the clone's dark keypad re-themes.
    expect(cs.bg).toBe("rgb(69, 10, 10)"); // red-950 #450a0a
    expect(cs.color).toBe("rgb(252, 165, 165)"); // red-300 #fca5a5
  });

  test("AG4: the GradeTracker score pills re-theme per the house dark ramp", async ({ page }) => {
    await gotoDark(page, "/GradeTracker");
    // Seeded rows (the AP-117 lesson: locate through the row's title, never
    // bare pill text — single-grade subjects render the same value twice).
    // The pill is addressed BY ITS TEXT ("92/100") — the row also carries a
    // rounded-full SubjectChip (dark:bg-slate-800) that a class-based
    // locator collides with (the first-draft bug).
    const read = async (rowTitle: string, pillText: string) => {
      const row = page.locator("main .sf-card").filter({ hasText: rowTitle });
      const pill = row.getByText(pillText, { exact: true });
      await expect(pill).toBeVisible();
      return pill.evaluate((el) => {
        const s = getComputedStyle(el);
        return { bg: s.backgroundColor, color: s.color };
      });
    };
    const eCs = await read("Problem set 6", "92/100");
    expect(eCs.bg).toBe("rgb(2, 44, 34)"); // emerald-950
    expect(eCs.color).toBe("rgb(110, 231, 183)"); // emerald-300
    const sCs = await read("Quiz 4", "85/100");
    expect(sCs.bg).toBe("rgb(8, 47, 73)"); // sky-950
    expect(sCs.color).toBe("rgb(125, 211, 252)"); // sky-300
    const aCs = await read("Kinetics quiz", "78/100");
    expect(aCs.bg).toBe("rgb(69, 26, 3)"); // amber-950
    expect(aCs.color).toBe("rgb(252, 211, 77)"); // amber-300
  });

  test("AG5: the Tasks aside active row re-themes to the accent-dark tint in dark", async ({ page }) => {
    await gotoDark(page, "/Tasks");
    const active = page.locator('aside button[aria-pressed="true"]').first();
    await expect(active).toBeVisible();
    const cs = await active.evaluate((el) => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, color: s.color };
    });
    // The sf-today-tint dark pattern: rgb(var(--sf-primary-soft-dark) / 0.3)
    // serializes as legacy rgba (the raw-rgb() branch) + strong-dark text.
    // Violet: softDark 76 29 149, strongDark 196 181 253.
    expect(cs.bg).toBe("rgba(76, 29, 149, 0.3)");
    expect(cs.color).toBe(STRONG_DARK);
  });

  test("AG5 guard: the Tasks aside active row keeps the exact light values", async ({ page }) => {
    await setMode(page, "light");
    await page.goto("/Tasks");
    await page.waitForFunction(
      () => !document.documentElement.classList.contains("dark") && !!document.querySelector('aside button[aria-pressed="true"]'),
    );
    const active = page.locator('aside button[aria-pressed="true"]').first();
    const cs = await active.evaluate((el) => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, color: s.color };
    });
    // Byte-identical to the S6-A pin's measured values (the utility's light
    // branch emits the same rgb() forms the inline style did).
    expect(cs.bg).toBe("rgb(245, 243, 255)"); // violet-50 (softest)
    expect(cs.color).toBe("rgb(109, 40, 217)"); // violet-700 (deep)
  });

  test("AG11a: the dark clock date is accent-aware (blue-400 under the blue accent)", async ({ page }) => {
    const res = await page.request.patch(PREFERENCES, { data: { accentColor: "blue" } });
    expect(res.ok()).toBeTruthy();
    await gotoDark(page, "/Dashboard");
    const date = page.locator(".sf-clock-date");
    await expect(date).toBeVisible();
    const dateColor = await date.evaluate((el) => getComputedStyle(el).color);
    // The AF5 pin asserted violet-400 only (the s80 audit, I3): a
    // regression hardcoding violet-400 passed it. The blue accent's
    // avatarFrom token is blue-400 rgb(96,165,250).
    expect(dateColor).toBe("rgb(96, 165, 250)");
  });
});


// ---------------------------------------------------------------------------
// S81 · Batch AH dark pins — the emerald-200 @theme pin (the success
// toast's dark text — the last unpinned hue on a certified surface) + the
// overdue-banner / error-toast / calculator-footer dark pairs. See
// docs/remediation-plan.md Cycle 31 (AH3/AH4).
//
// Trap-10 (the standing Tailwind v4 lesson): an unpinned v4-oklch hue
// serializes in computed styles as `lab(90.2247 -31.039 9.47084)` — the
// AH3b RED. The pin declares the v3 hex `#a7f3d0` in @theme so the dark
// text computes rgb(167, 243, 208) like every other certified hue.
// ---------------------------------------------------------------------------

test.describe("S81 · the dark toast/banner/footer pairs (AH3/AH4)", () => {
  test("AH3a: the dashboard overdue banner keeps the house dark pair (red-950 icon block / red-300 title)", async ({ page }) => {
    await gotoDark(page, "/Dashboard");
    const banner = page.locator('[aria-label="Overdue alert"]');
    await expect(banner).toBeVisible();
    const iconBlock = banner.locator("div").first();
    const title = banner.getByRole("heading");
    const [iconCs, titleCs] = await Promise.all([
      iconBlock.evaluate((el) => getComputedStyle(el).backgroundColor),
      title.evaluate((el) => getComputedStyle(el).color),
    ]);
    expect(iconCs).toBe("rgb(69, 10, 10)"); // red-950 #450a0a
    expect(titleCs).toBe("rgb(252, 165, 165)"); // red-300 #fca5a5
  });

  test("AH3b: the success toast's dark text computes the pinned emerald-200 hex", async ({ page }) => {
    await gotoDark(page, "/Notes");
    await page.getByRole("button", { name: /Dot product intuition/ }).first().click();
    await expect(page.locator(".ql-editor")).toBeVisible();

    await page.getByRole("button", { name: "Save", exact: true }).click();
    const toast = page.getByRole("region", { name: "Notifications" }).locator("button").filter({ hasText: "Note saved." });
    await expect(toast.first()).toBeVisible();
    const color = await toast.first().evaluate((el) => getComputedStyle(el).color);
    // emerald-200 #a7f3d0 (the @theme pin). Unpinned, the v4-oklch hue
    // computes lab(90.2247 -31.039 9.47084) — the trap-10 RED.
    expect(color).toBe("rgb(167, 243, 208)");
  });

  test("AH3c: the error toast's dark text keeps the pinned red-200 hex", async ({ page }) => {
    await gotoDark(page, "/Notes");
    await page.getByRole("button", { name: /Dot product intuition/ }).first().click();
    await expect(page.locator(".ql-editor")).toBeVisible();

    // Abort every note PATCH — the autosave failure toast fires.
    await page.route(/\/api\/notes\//, async (route) => {
      if (route.request().method() === "PATCH") await route.abort("failed");
      else await route.continue();
    });
    const editor = page.locator(".ql-editor");
    await editor.click();
    await page.keyboard.type("dark probe");
    const toast = page.getByRole("region", { name: "Notifications" }).locator("button").filter({ hasText: /offline|autosave|not saved/i });
    await expect(toast.first()).toBeVisible();
    const color = await toast.first().evaluate((el) => getComputedStyle(el).color);
    expect(color).toBe("rgb(254, 202, 202)"); // red-200 #fecaca
    await page.unroute(/\/api\/notes\//);
  });

  test("AH4a: the calculator footer's Backspace key keeps the dark slate pair", async ({ page }) => {
    await gotoDark(page, "/Calculator");
    const backspace = page.getByRole("button", { name: "Backspace" });
    await expect(backspace).toBeVisible();
    const cs = await backspace.evaluate((el) => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, border: s.borderColor, color: s.color };
    });
    expect(cs.bg).toBe("rgb(15, 23, 42)"); // slate-900 #0f172a
    expect(cs.border).toBe("rgb(51, 65, 85)"); // slate-700 #334155
    expect(cs.color).toBe("rgb(203, 213, 225)"); // slate-300 #cbd5e1
  });
});

// ---------------------------------------------------------------------------
// S94 · Batch AU dark pins — the connectivity trap-10 closure (the
// amber-200/amber-800 @theme pins + the sf-connectivity-pill utility —
// the s93 residual register's first TREATED site) + the residual
// census's dark guards. See docs/remediation-plan.md Cycle 44 (AU1–AU4).
//
// Trap-10 (the standing Tailwind v4 lesson, the AH3b class): the banner
// rode UNPINN amber-200/amber-800 — both branches serialized through
// v4-oklch and drifted 1–3 units/channel (demonstrated RED live against
// the pre-change build earlier in this session: the ink computed
// lab(91.7203 -0.505269 49.9084)). AU3a is the dark discriminator: the
// pinned pair computes the v3 hexes now (the dark border through the
// raw-rgb() convention serializes as legacy rgba — never color-mix).
// AU3b/c are the AH3-precedent characterization guards for the register's
// remaining site-local residuals: they pin the CURRENT correct dark
// values (all steps already pinned) against silent drift — green by
// design on the pre-change tree, like the AG5 guard.
// ---------------------------------------------------------------------------

test.describe("S94 · the connectivity banner + the residual dark guards (AU3)", () => {
  test("AU3a: the offline banner computes the pinned dark amber pair (amber-950 / amber-200 / the rgba border)", async ({ page, context }) => {
    await gotoDark(page, "/Dashboard");
    await expect(page.getByRole("heading", { name: /^Good (morning|afternoon|evening)/ })).toBeVisible();

    await context.setOffline(true);
    const banner = page.getByRole("status").filter({ hasText: /offline/i });
    await expect(banner).toBeVisible({ timeout: 5000 });
    const cs = await banner.evaluate((el) => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, color: s.color, border: s.borderColor };
    });
    // amber-950 #451a03 (pinned S80/AG4), amber-200 #fde68a (pinned
    // S94/AU1 — unpinned, the v4-oklch step computed lab() drift), the
    // amber-800/60 border at the raw-rgb() convention: rgb(146 64 14 /
    // 0.6) serializes as legacy rgba — never color-mix(in oklab).
    expect(cs.bg).toBe("rgb(69, 26, 3)"); // amber-950 #451a03
    expect(cs.color).toBe("rgb(253, 230, 138)"); // amber-200 #fde68a
    expect(cs.border).toBe("rgba(146, 64, 14, 0.6)"); // amber-800 #92400e at /60

    await context.setOffline(false);
    await expect(banner).toHaveCount(0, { timeout: 5000 });
  });

  test("AU3b: the RUM panel's error alert keeps the house dark pair (red-950 / red-300)", async ({ page }) => {
    // The mount-fetch abort drives the panel's role=alert error surface —
    // the residual register's borderless red-600/red-300 variant,
    // numerically guarded here (every step it reads is already @theme-
    // pinned; the register keeps the site site-local BY DECISION).
    await page.route("**/api/rum", async (route) => {
      if (route.request().method() === "GET") await route.abort("failed");
      else await route.continue();
    });
    try {
      await gotoDark(page, "/rum");
      // Scoped by text: Next's __next-route-announcer__ ALSO carries
      // role=alert (the strict-mode collision auth.spec documented).
      const alert = page.getByRole("alert").filter({ hasText: /offline|load the|diagnostics/i });
      await expect(alert).toBeVisible({ timeout: 10000 });
      const cs = await alert.evaluate((el) => {
        const s = getComputedStyle(el);
        return { bg: s.backgroundColor, color: s.color };
      });
      expect(cs.bg).toBe("rgb(69, 10, 10)"); // red-950 #450a0a
      expect(cs.color).toBe("rgb(252, 165, 165)"); // red-300 #fca5a5
    } finally {
      await page.unroute("**/api/rum");
    }
  });

  test("AU3c: the events dialog's error banner keeps the sf-alert-red dark pair (red-950 / red-200 / red-900 border)", async ({ page }) => {
    // The create-submit failure renders the dialog's role=alert banner —
    // the sf-alert-red family's dark values numerically guarded (the
    // family's first computed-value dark pin; the source-scan unit pin
    // cannot see the rendered pair).
    await page.route("**/api/events", async (route) => {
      if (route.request().method() === "POST") await route.abort("failed");
      else await route.continue();
    });
    try {
      await gotoDark(page, "/Events");
      await page.getByRole("button", { name: "New Event" }).first().click();
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await dialog.locator("#event-title").fill("s94 au3c probe");
      await dialog.getByRole("button", { name: "Create event" }).click();
      const banner = dialog.getByRole("alert");
      await expect(banner).toBeVisible({ timeout: 8000 });
      const cs = await banner.evaluate((el) => {
        const s = getComputedStyle(el);
        return { bg: s.backgroundColor, color: s.color, border: s.borderColor };
      });
      expect(cs.bg).toBe("rgb(69, 10, 10)"); // red-950 #450a0a
      expect(cs.color).toBe("rgb(254, 202, 202)"); // red-200 #fecaca
      expect(cs.border).toBe("rgb(127, 29, 29)"); // red-900 #7f1d1d
    } finally {
      await page.unroute("**/api/events");
    }
  });
});
