import { expect, test, type Page } from "@playwright/test";

/**
 * Session-12 pins — forced-colors, print & keyboard accessibility
 * (docs/remediation-plan-session12.md).
 *
 * Family A (forced-colors / Windows High Contrast): the forced palette
 * wipes every fill/tint the app uses to ENCODE STATE — the calendar
 * selected day, the today markers, the mode-switch active segment, the
 * Settings active tab, the active nav item, the assignment slider fill.
 * The fix restores state with system colors (inset `Highlight` outlines +
 * a bold active nav) in one `@media (forced-colors: active)` block; the
 * slider fill opts out via `forced-color-adjust: none` (WCAG 1.4.11 —
 * an essential non-text graphic).
 *
 * Family B (WCAG 2.4.1 Bypass Blocks): 21 sidebar stops precede the main
 * content on every view — the fix is a visually-hidden skip link as the
 * first focusable element of the shell, landing on main#main-content.
 *
 * Family C (print): dark mode printed invisible text (the print media
 * never un-themed — every dark:text-* utility kept rendering light text on
 * the print-white canvas), essential-background surfaces lost their fills
 * when browsers drop backgrounds (white-on-color text), and the timetable
 * week table clipped Saturday (min-w-[900px] > printable width). The fix:
 * beforeprint/afterprint handlers in the theme boot script force light for
 * the print duration; `print-color-adjust: exact` on the essential
 * surfaces; a print-scoped min-width reset on the timetable canvas.
 *
 * Family D (prefers-reduced-motion): the standard reduce block collapses
 * animations/transitions.
 *
 * Mode strategy follows dark-mode.spec.ts / theme-system.spec.ts: API PATCH
 * + waitForFunction; the afterEach ALWAYS restores light so a failed pin
 * can never poison the shared user record.
 */

const PREFERENCES = "/api/settings/preferences";

async function setMode(page: Page, mode: "light" | "dark") {
  const res = await page.request.patch(PREFERENCES, { data: { themeMode: mode } });
  expect(res.ok()).toBeTruthy();
}

/** Navigate and wait for the theme store to apply the user's preference. */
async function gotoMode(page: Page, path: string, mode: "dark" | "light") {
  await setMode(page, mode);
  await page.goto(path);
  await page.waitForFunction(
    (dark) => document.documentElement.classList.contains("dark") === dark,
    mode === "dark",
  );
}

/** Wait for hydration (the theme store's inline --sf-primary var). */
const hydrated = (page: Page) =>
  page.waitForFunction(
    () => document.documentElement.style.getPropertyValue("--sf-primary") !== "",
  );

/** Read a forced-colors "state outline": style solid + width >= 2px. */
async function stateOutline(page: Page, selector: string) {
  return page.locator(selector).first().evaluate((el) => {
    const cs = getComputedStyle(el);
    return { style: cs.outlineStyle, width: parseFloat(cs.outlineWidth) };
  });
}

test.afterEach(async ({ page }) => {
  // Guarantee the shared user record resting state even when a pin failed
  // mid-test (the S4/S10/S11 restore lesson).
  await page.request.patch(PREFERENCES, { data: { themeMode: "light" } });
});

test.describe("S12-A · forced-colors keeps state indication (Windows High Contrast)", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active" });
  });
  test.afterEach(async ({ page }) => {
    await page.emulateMedia({ forcedColors: "none" });
  });

  test("the calendar selected day carries a visible state outline", async ({ page }) => {
    await gotoMode(page, "/Calendar", "light");
    await hydrated(page);
    // The selected day is today by default (aria-pressed=true).
    const r = await stateOutline(page, '[aria-label="Calendar days"] button[aria-pressed="true"]');
    expect(r.style).toBe("solid");
    expect(r.width).toBeGreaterThanOrEqual(2);
  });

  test("the calendar today cell and the timetable today header carry outlines", async ({ page }) => {
    await gotoMode(page, "/Calendar", "light");
    await hydrated(page);
    const today = await stateOutline(page, "[data-today]");
    expect(today.style).toBe("solid");
    expect(today.width).toBeGreaterThanOrEqual(2);

    await page.goto("/Timetable");
    await page.waitForTimeout(1200);
    const head = await stateOutline(page, ".sf-today-tint");
    expect(head.style).toBe("solid");
    expect(head.width).toBeGreaterThanOrEqual(2);
  });

  test("the calendar mode-switch active segment carries an outline", async ({ page }) => {
    await gotoMode(page, "/Calendar", "light");
    await hydrated(page);
    const r = await stateOutline(page, '[aria-label="Calendar mode"] button[aria-pressed="true"]');
    expect(r.style).toBe("solid");
    expect(r.width).toBeGreaterThanOrEqual(2);
  });

  test("the Settings active tab carries an outline", async ({ page }) => {
    await gotoMode(page, "/Settings", "light");
    await hydrated(page);
    const r = await stateOutline(page, '[role="tab"][data-state="active"]');
    expect(r.style).toBe("solid");
    expect(r.width).toBeGreaterThanOrEqual(2);
  });

  test("the active nav item renders bold (the Fluent selected-item convention)", async ({ page }) => {
    await gotoMode(page, "/Dashboard", "light");
    await hydrated(page);
    const weight = await page
      .locator('aside nav a[aria-current="page"] span.truncate')
      .evaluate((el) => getComputedStyle(el).fontWeight);
    expect(weight).toBe("700");
  });

  test("the assignment slider keeps its progress gradient (essential graphic)", async ({ page }) => {
    await gotoMode(page, "/Assignments", "light");
    await hydrated(page);
    await page.waitForTimeout(800);
    const fill = await page.locator("[data-slot=slider-fill]").first().evaluate((el) => {
      const cs = getComputedStyle(el);
      return cs.backgroundImage;
    });
    expect(fill).toContain("linear-gradient");
  });
});

test.describe("S12-B · the skip-to-content link (WCAG 2.4.1)", () => {
  test("first Tab stop is the skip link; it appears on focus and lands on main", async ({ page }) => {
    await gotoMode(page, "/Dashboard", "light");
    await hydrated(page);
    await page.keyboard.press("Tab");
    const first = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el) return { tag: "none" };
      const r = el.getBoundingClientRect();
      return { tag: el.tagName, text: (el.textContent || "").trim(), x: Math.round(r.x), y: Math.round(r.y) };
    });
    expect(first.tag).toBe("A");
    expect(first.text).toBe("Skip to main content");
    // Focused ⇒ on-screen (the visually-hidden link slides into view).
    expect(first.x).toBeGreaterThanOrEqual(0);
    expect(first.y).toBeGreaterThanOrEqual(0);

    // Enter navigates to main#main-content (tabIndex -1 ⇒ it takes focus).
    await page.keyboard.press("Enter");
    await page.waitForTimeout(400);
    const landed = await page.evaluate(() => {
      const el = document.activeElement;
      return { tag: el?.tagName, id: el?.id };
    });
    expect(landed.tag).toBe("MAIN");
    expect(landed.id).toBe("main-content");
  });

  test("the skip link is off-screen (invisible) when unfocused — zero visual parity impact", async ({ page }) => {
    await gotoMode(page, "/Dashboard", "light");
    await hydrated(page);
    const box = await page.locator("a.sf-skip-link").evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.x), w: Math.round(r.width) };
    });
    expect(box.x).toBeLessThan(0);
    expect(box.w).toBeGreaterThan(0); // rendered (focusable), just off-screen
  });
});

test.describe("S12-C1 · printing forces light (beforeprint/afterprint in the boot script)", () => {
  test("beforeprint un-themes dark AND the text goes dark; afterprint restores", async ({ page }) => {
    await gotoMode(page, "/Dashboard", "dark");
    await hydrated(page);
    const h1ColorDark = await page.locator("main h1").first().evaluate((el) => getComputedStyle(el).color);
    expect(h1ColorDark).toBe("rgb(241, 245, 249)"); // slate-100 in dark mode

    // Print: the boot script's beforeprint handler must remove .dark.
    await page.evaluate(() => window.dispatchEvent(new Event("beforeprint")));
    await page.waitForFunction(() => !document.documentElement.classList.contains("dark"));
    const h1ColorPrint = await page.locator("main h1").first().evaluate((el) => getComputedStyle(el).color);
    expect(h1ColorPrint).toBe("rgb(30, 41, 59)"); // slate-800 — readable on the white canvas

    // After the dialog closes: the user's dark theme comes back.
    await page.evaluate(() => window.dispatchEvent(new Event("afterprint")));
    await page.waitForFunction(() => document.documentElement.classList.contains("dark"));
  });

  test("light mode is untouched by the print handlers (no dark to remove)", async ({ page }) => {
    await gotoMode(page, "/Dashboard", "light");
    await hydrated(page);
    await page.evaluate(() => window.dispatchEvent(new Event("beforeprint")));
    await page.waitForTimeout(200);
    const isDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
    expect(isDark).toBe(false);
    await page.evaluate(() => window.dispatchEvent(new Event("afterprint")));
    const stillLight = await page.evaluate(() => document.documentElement.classList.contains("dark"));
    expect(stillLight).toBe(false);
  });
});

test.describe("S12-C2 · essential backgrounds print (print-color-adjust: exact)", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ media: "print" });
  });
  test.afterEach(async ({ page }) => {
    await page.emulateMedia({ media: "screen" });
  });

  test("the gradient CTAs keep their background (white text stays readable)", async ({ page }) => {
    await gotoMode(page, "/Tasks", "light");
    await hydrated(page);
    const adjust = await page.locator("main button.sf-gradient").first().evaluate((el) => {
      const cs = getComputedStyle(el);
      return cs.printColorAdjust || (cs as unknown as { webkitPrintColorAdjust?: string }).webkitPrintColorAdjust;
    });
    expect(adjust).toBe("exact");
  });

  test("the events terminal panel, timetable canvas and calendar month card keep their fills", async ({ page }) => {
    await gotoMode(page, "/Events", "light");
    await hydrated(page);
    const events = await page.locator(".sf-print-exact").first().evaluate((el) => getComputedStyle(el).printColorAdjust);
    expect(events).toBe("exact");

    await page.emulateMedia({ media: "screen" });
    await page.goto("/Timetable");
    await page.waitForTimeout(1200);
    await page.emulateMedia({ media: "print" });
    const tt = await page.locator(".sf-timetable-canvas").evaluate((el) => {
      const cs = getComputedStyle(el);
      return { adjust: cs.printColorAdjust, minWidth: cs.minWidth };
    });
    expect(tt.adjust).toBe("exact");
    // S12-D — the min-w-[900px] canvas resets so all 8 columns fit the page.
    expect(tt.minWidth).toBe("0px");

    await page.emulateMedia({ media: "screen" });
    await page.goto("/Calendar");
    await page.waitForTimeout(1200);
    await page.emulateMedia({ media: "print" });
    const cal = await page.locator('[aria-label="Calendar days"]').evaluate((el) => {
      let node = el as HTMLElement | null;
      while (node && node !== document.body) {
        if (node.classList.contains("sf-print-exact")) return getComputedStyle(node).printColorAdjust;
        node = node.parentElement;
      }
      return "missing";
    });
    expect(cal).toBe("exact");
  });
});

test.describe("S12-D · the timetable week table fits the printable width", () => {
  test("the canvas min-width resets and the scroll container opens under print media", async ({ page }) => {
    await gotoMode(page, "/Timetable", "light");
    await hydrated(page);
    await page.emulateMedia({ media: "print" });
    const r = await page.locator(".sf-timetable-canvas").evaluate((el) => {
      const cs = getComputedStyle(el);
      return { minWidth: cs.minWidth, overflowX: cs.overflowX, scrollW: el.scrollWidth, clientW: el.clientWidth };
    });
    expect(r.minWidth).toBe("0px");
    expect(r.scrollW).toBeLessThanOrEqual(r.clientW + 2);
    await page.emulateMedia({ media: "screen" });
  });
});

test.describe("S12-E · prefers-reduced-motion collapses motion", () => {
  test("a transition-all cell computes a ~0 duration under reduce", async ({ page }) => {
    await gotoMode(page, "/Calendar", "light");
    await hydrated(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    const dur = await page
      .locator('[aria-label="Calendar days"] button')
      .first()
      .evaluate((el) => getComputedStyle(el).transitionDuration);
    expect(parseFloat(dur)).toBeLessThanOrEqual(0.01);
    await page.emulateMedia({ reducedMotion: "no-preference" });
  });
});

test.describe("light regression guard (S12)", () => {
  test("the A-family surfaces keep their exact prior values in normal media", async ({ page }) => {
    await gotoMode(page, "/Calendar", "light");
    await hydrated(page);
    // No forced-colors outlines in normal media:
    const selected = await stateOutline(page, '[aria-label="Calendar days"] button[aria-pressed="true"]');
    expect(selected.style).toBe("none");
    await page.goto("/Settings");
    await page.waitForTimeout(1000);
    const tab = await stateOutline(page, '[role="tab"][data-state="active"]');
    expect(tab.style).toBe("none");
    // The active nav weight stays font-medium/500 (normal media):
    await page.goto("/Dashboard");
    await page.waitForTimeout(800);
    const weight = await page
      .locator('aside nav a[aria-current="page"] span.truncate')
      .evaluate((el) => getComputedStyle(el).fontWeight);
    expect(weight).toBe("500");
    // The slider fill gradient is intact (it was always there in light):
    await page.goto("/Assignments");
    await page.waitForTimeout(800);
    const fill = await page.locator("[data-slot=slider-fill]").first().evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(fill).toContain("linear-gradient");
  });
});
