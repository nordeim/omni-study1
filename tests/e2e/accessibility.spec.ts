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

/** Wait for hydration (the HydrationMarker contract, S124/BY7: the shell
 *  commit implies auth + the active view's initial collections resolved —
 *  the old --sf-primary gate was true at t=0 via the pre-paint boot script). */
const hydrated = (page: Page) =>
  page.waitForFunction(
    () => document.documentElement.dataset.appHydrated === "true",
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
    // S102/BC4: the STATUS-GATED marker, not the weak --sf-primary gate —
    // the boot script sets the var PRE-PAINT, so the weak gate passes while
    // the auth gate is still resolving (the LOADING state renders the skip
    // link WITHOUT main#main-content; the Tab+Enter then finds no focus
    // target and the 15s ceiling expires — the S8-A lesson's own trap,
    // cold-start probe-measured: appHydrated ABSENT / mainExists false).
    // data-app-hydrated fires ONLY when the authed shell renders.
    await page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true");
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
    // Poll for the hash-target focus instead of a fixed sleep — a cold
    // server's late hydration re-mounts the shell after the fixed 400ms
    // read and the focus had not landed yet. S81/AH5: the ceiling is
    // 15s — the S81 cold re-cert's one chunk-4 flake rode the 10s window
    // against a late-hydration tail on the shared cold server.
    await page.waitForFunction(
      () => document.activeElement?.tagName === "MAIN" && document.activeElement?.id === "main-content",
      null,
      { timeout: 15_000 },
    );
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

  // S83/AJ5 (the s83 standing-suite layer's print findings — five active-
  // state white-text surfaces whose fills carry NO print-color-adjust):
  // in print media the backgrounds drop and the white text goes invisible
  // on the forced white body. All five A/B-verified on the received tree
  // (changes stashed) — the received defect family, not a regression from
  // this cycle. Each pin asserts the S12-C2 convention on its surface.
  test("AJ5a: the Calendar segmented control's ACTIVE tab keeps its fill (sf-selected-tint prints)", async ({ page }) => {
    await gotoMode(page, "/Calendar", "light");
    await hydrated(page);
    const adjust = await page.locator('main button[aria-pressed="true"]', { hasText: "Calendar" }).evaluate((el) => {
      let node = el as HTMLElement | null;
      while (node && node !== document.body) {
        const cs = getComputedStyle(node);
        if (cs.printColorAdjust === "exact") return "exact";
        node = node.parentElement;
      }
      return getComputedStyle(el).printColorAdjust;
    });
    expect(adjust).toBe("exact");
  });

  test("AJ5b: the Timetable today badge keeps its fill (sf-selected-tint prints)", async ({ page }) => {
    await gotoMode(page, "/Timetable", "light");
    await hydrated(page);
    await page.waitForTimeout(1200);
    const adjust = await page.locator("main .sf-selected-tint").first().evaluate((el) => getComputedStyle(el).printColorAdjust);
    expect(adjust).toBe("exact");
  });

  test("AJ5c: the Exams topic chips keep their near-black fill (white text prints readable)", async ({ page }) => {
    await gotoMode(page, "/Exams", "light");
    await hydrated(page);
    await page.waitForTimeout(1200);
    const adjust = await page.locator("main span.bg-neutral-800").first().evaluate((el) => getComputedStyle(el).printColorAdjust);
    expect(adjust).toBe("exact");
  });

  test("AJ5d: the Calculator History toggle keeps its near-black pill (the S80/AG2 measured surface)", async ({ page }) => {
    await gotoMode(page, "/Calculator", "light");
    await hydrated(page);
    const adjust = await page.getByRole("button", { name: "History", exact: true }).evaluate((el) => {
      let node = el as HTMLElement | null;
      while (node && node !== document.body) {
        const cs = getComputedStyle(node);
        if (cs.printColorAdjust === "exact") return "exact";
        node = node.parentElement;
      }
      return getComputedStyle(el).printColorAdjust;
    });
    expect(adjust).toBe("exact");
  });

  test("AJ5e: the Settings ACTIVE theme tile keeps its fill (sf-selected-tint prints)", async ({ page }) => {
    await gotoMode(page, "/Settings", "light");
    await hydrated(page);
    const adjust = await page.locator('main button[aria-pressed="true"]').first().evaluate((el) => getComputedStyle(el).printColorAdjust);
    expect(adjust).toBe("exact");
  });

  // S84/AK2 (the s84 Mode-C audit's L2 — the S83 lesson-5 follow-through):
  // the print-enumeration closure. Five MORE white-text-on-fill surfaces
  // carry no print-color-adjust. The mid-cycle discovery (the AK2a RED):
  // the Flashcards deck list lives inside an <aside> — print-hidden by the
  // S12 print design — so its deck swatch never prints at all (the same
  // class as the sidebar avatar: the inline property is convention
  // completeness, not a visible fix). AK2a therefore pins the REAL print
  // contract for that surface (the aside-hiding rule); the other three
  // surfaces print visibly and pin the S12-C2 convention directly.
  test("AK2a: the Flashcards deck list is print-hidden (the aside contract; its swatch never prints)", async ({ page }) => {
    await gotoMode(page, "/Flashcards", "light");
    await hydrated(page);
    // The beforeEach already emulates print media — the deck-list aside is
    // display:none, so its deck swatch (white initial on deck.color) cannot
    // print invisible text because it cannot print at all. The inline
    // printColorAdjust on the swatch stays as convention completeness for a
    // future layout change. Walk UP from the swatch to its aside ancestor
    // and pin the hiding rule itself.
    const display = await page.locator("main span.h-10.w-10.text-white").first().evaluate((el) => {
      let node: HTMLElement | SVGElement | null = el;
      while (node && node !== document.body) {
        if (node.tagName === "ASIDE") return getComputedStyle(node).display;
        node = node.parentElement;
      }
      return "no-aside-ancestor";
    });
    expect(display).toBe("none");
  });

  test("AK2b: the Practice Tests result circles keep their green/red fills", async ({ page }) => {
    await gotoMode(page, "/PracticeTests", "light");
    await hydrated(page);
    // Drive the real flow to the results screen: start the first test,
    // walk to the last question, submit.
    await page.getByRole("button", { name: "Start Test" }).first().click();
    for (let guard = 0; guard < 20; guard++) {
      const next = page.getByRole("button", { name: "Next", exact: true });
      if (await next.count() === 0) break;
      await next.click();
    }
    await page.getByRole("button", { name: "Submit test" }).click();
    const circle = page.locator("main span.rounded-full.text-white").first();
    await expect(circle).toBeVisible();
    const adjust = await circle.evaluate((el) => getComputedStyle(el).printColorAdjust);
    expect(adjust).toBe("exact");
  });

  test("AK2c: the My Day header gradient block keeps its amber fill (the white Sun prints readable)", async ({ page }) => {
    await gotoMode(page, "/MyDay", "light");
    await hydrated(page);
    const adjust = await page.locator('[aria-label="My Day header block"]').evaluate((el) => getComputedStyle(el).printColorAdjust);
    expect(adjust).toBe("exact");
  });

  test("AK2d: the Math Solver image-remove chip keeps its near-black fill", async ({ page }) => {
    await gotoMode(page, "/MathSolver", "light");
    await hydrated(page);
    // Attach a real (tiny) image so the remove chip renders.
    await page.locator('input[type="file"]').setInputFiles({
      name: "ak2d-attach.png",
      mimeType: "image/png",
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
        "base64",
      ),
    });
    const chip = page.locator('button[aria-label="Remove attached image"]');
    await expect(chip).toBeVisible();
    const adjust = await chip.evaluate((el) => getComputedStyle(el).printColorAdjust);
    expect(adjust).toBe("exact");
  });

  // S85/AL1 (the s85 Mode-C audit's L1 — the AK2 closure completion): the
  // Study Groups member avatar chip is the one avatar-gradient consumer the
  // AK2 enumeration missed. It PRINTS (the Members card lives in the detail
  // <section>, not a print-hidden <aside>), so under print the inline
  // gradient drops and the white initials render white-on-white — the exact
  // S12-C2 class. The pin walks the REAL flow: select the seeded group so
  // the detail pane renders, then assert the fill contract on the chip.
  // (The group-list aside is print-hidden by the S12 design, so the
  // selection click runs under screen media — the events/timetable/calendar
  // pin's pattern — before the print assertion.)
  // AM3 (the s86 audit's I2): re-titled from "AL1:" — the title meant the
  // s85 AUDIT's L1 finding, but the batch numbering calls this workstream
  // AL2 (AL1 is the members resurrection); two meanings of "AL1" in one
  // commit made the pin unfindable by its batch tag.
  test("AL2: the Study Groups member avatar chip keeps its gradient fill", async ({ page }) => {
    await page.emulateMedia({ media: "screen" });
    await gotoMode(page, "/StudyGroups", "light");
    await hydrated(page);
    // Select the seeded "Calc Crew" group — the detail pane (with its
    // member chips) renders only after a group is selected.
    await page.getByRole("button", { name: /Calc Crew/ }).first().click();
    const chip = page.locator('section[aria-label="Study group detail pane"] span.rounded-full.text-white').first();
    await expect(chip).toBeVisible();
    await page.emulateMedia({ media: "print" });
    const adjust = await chip.evaluate((el) => getComputedStyle(el).printColorAdjust);
    expect(adjust).toBe("exact");
  });
});

// S83/AJ6 (the s83 standing-suite layer's focus finding, A/B-verified on
// the received tree): the Dashboard SectionLink nests a focusable <button>
// inside the focusable <a> — the anchor owns the focus-visible ring but
// the BUTTON's own tab stop carries outline-none and no ring, so keyboard
// focus lands on an indicator-less control.
test.describe("S83/AJ6 · the SectionLink button tab stop carries its own focus indicator", () => {
  test("the View All button shows a visible ring under keyboard focus", async ({ page }) => {
    await gotoMode(page, "/Dashboard", "light");
    await hydrated(page);
    // REAL keyboard traversal (synthetic events do not set the keyboard
    // focus modality, so :focus-visible would never match). The button
    // sits deep in the tab order — bounded Tab presses with an
    // activeElement poll.
    let focused = false;
    for (let i = 0; i < 45 && !focused; i += 1) {
      await page.keyboard.press("Tab");
      focused = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        return !!el && el.tagName === "BUTTON" && (el.textContent || "").includes("View All");
      });
    }
    expect(focused).toBe(true);
    const indicator = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      const cs = getComputedStyle(el);
      return {
        ring: cs.boxShadow !== "none",
        outlineWidth: cs.outlineWidth !== "0px" && cs.outlineStyle !== "none",
      };
    });
    // A visible indicator on the button's own tab stop: either the ring
    // or the outline suffices — the assertion is "SOMETHING visible".
    expect(indicator.ring || indicator.outlineWidth).toBe(true);
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

test.describe("E · the Lighthouse audit pins (dashboard, light)", () => {
  // Family E pins the four findings of the first Lighthouse pass on the
  // production bundle (docs/lighthouse/, session 61): heading-order skips,
  // the slate-400 stat hints (2.56:1), the red-600 overdue badges (3.95:1),
  // and the aria-label on the roleless toast viewport. The color fixes
  // darken reference-measured muted tokens by exactly one step (slate-400
  // → slate-500 = 4.76:1, red-600 → red-700 = 5.32:1); dark values are
  // untouched.
  test("dashboard headings never skip a level (Lighthouse heading-order)", async ({ page }) => {
    await page.goto("/Dashboard");
    await hydrated(page);
    // hydrated covers the theme var only, not the Dashboard collection
    // round-trip (the S8-G lesson) — bound-wait for the mounted content
    // before the read-all.
    await expect(page.locator("main h1").first()).toBeVisible();
    await expect(page.locator("main .sf-card h2").first()).toBeVisible();
    const levels = await page
      .locator("main h1, main h2, main h3, main h4, main h5, main h6")
      .evaluateAll((els) => els.map((el) => Number(el.tagName[1])));
    expect(levels.length).toBeGreaterThan(3);
    expect(levels[0]).toBe(1); // the greeting h1 leads
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i], `heading #${i} (h${levels[i]}) after h${levels[i - 1]}`).toBeLessThanOrEqual(
        levels[i - 1] + 1,
      );
    }
  });

  test("stat-card hint text meets WCAG AA contrast (slate-500)", async ({ page }) => {
    await page.goto("/Dashboard");
    await hydrated(page);
    // The four KPI hints ("due this week" &c.) under the stat values.
    const hints = page.locator("main .sf-card p.mt-1");
    await expect(hints.first()).toBeVisible();
    const count = await hints.count();
    expect(count).toBeGreaterThanOrEqual(4);
    for (let i = 0; i < count; i++) {
      const color = await hints.nth(i).evaluate((el) => getComputedStyle(el).color);
      expect(color).toBe("rgb(100, 116, 139)"); // slate-500 — was slate-400 (2.56:1)
    }
  });

  test("the overdue badge text meets WCAG AA contrast (red-700)", async ({ page }) => {
    await page.goto("/Dashboard");
    await hydrated(page);
    // S120/BU7 re-anchor: the dashboard's red-pill family collapsed to the
    // TODAY exam badge alone ("Today!" — the measured form); the seeded
    // demo carries no today-exam, so the pin creates its own (the
    // self-owning-data doctrine, the BU7 pin's mechanism). The pin's
    // intent is unchanged: every sf-pill-red on the dashboard computes
    // red-700 text (5.32:1 on red-100 — the Lighthouse session-61 fix;
    // red-600 measured 3.95:1 and failed).
    const todayId = `a11y-s120-red-${Date.now()}`;
    let created = false;
    try {
      created = await page.evaluate(async (id) => {
        const subjects = await fetch("/api/subjects", { credentials: "same-origin" });
        const rows = (await subjects.json()) as Array<{ id: string }>;
        if (!Array.isArray(rows) || rows.length === 0) return false;
        const d = new Date();
        const pad = (n: number) => String(n).padStart(2, "0");
        const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T09:00:00`;
        const res = await fetch("/api/exams", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ title: id, subjectId: rows[0].id, date, type: "test", duration: 30 }),
        });
        return res.ok;
      }, todayId);
      expect(created, "the today-exam probe row was created").toBe(true);
      await page.reload();
      await hydrated(page);
      const badges = page.locator("main span.sf-pill-red");
      await expect(badges.first()).toBeVisible();
      const count = await badges.count();
      expect(count).toBeGreaterThanOrEqual(1);
      for (let i = 0; i < count; i++) {
        const color = await badges.nth(i).evaluate((el) => getComputedStyle(el).color);
        expect(color).toBe("rgb(185, 28, 28)"); // red-700 — was red-600 (3.95:1)
      }
    } finally {
      if (created) {
        await page.evaluate(async (id) => {
          const rows = (await (await fetch("/api/exams", { credentials: "same-origin" })).json()) as Array<{ id: string; title: string }>;
          const probe = rows.find((r) => r.title === id);
          if (probe) await fetch(`/api/exams/${probe.id}`, { method: "DELETE", credentials: "same-origin" });
        }, todayId);
      }
    }
  });

  test("the toast viewport is a named region (Lighthouse aria-prohibited-attr)", async ({ page }) => {
    await page.goto("/Dashboard");
    await hydrated(page);
    // aria-label needs a role; the viewport becomes a named region
    // (the radix-toast pattern) instead of a roleless div.
    const viewport = page.locator('div[role="region"][aria-label="Notifications"]');
    await expect(viewport).toBeAttached();
    await expect(viewport).toHaveAttribute("aria-live", "polite");
  });

  test("the auth surface carries the one-main landmark (Lighthouse landmark-one-main)", async ({
    page,
  }) => {
    // /login is a standalone page (no shell) — its root is <main> since
    // session 61; the sub-screens swap inside it.
    await page.goto("/login");
    await expect(page.locator("main").first()).toBeVisible();
    await expect(page.getByRole("main")).toHaveCount(1);
  });
});

// S124/BY8 — the checked priority checkbox prints its state. AGENTS.md's
// S12 contract claims print-exact coverage on "the checked checkboxes";
// the code carried none — PriorityCheckbox's checked branch is an accent
// fill + a WHITE glyph, so print (which strips backgrounds) rendered
// checked and unchecked identically as bare 2px-bordered circles. The
// checked branch now carries sf-print-exact: the fill + glyph survive.
test.describe("S124/BY8 · the checked checkbox keeps its accent fill + glyph in print", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ media: "print" });
  });
  test.afterEach(async ({ page }) => {
    await page.emulateMedia({ media: "screen" });
  });

  test("a seeded checked task's checkbox carries print-color-adjust: exact (RED pre-fix: auto)", async ({ page }) => {
    await gotoMode(page, "/Tasks", "light");
    await hydrated(page);
    // The Tasks status filter defaults to "active" — switch it to
    // "Completed" so the seed's checked rows render (ZERO mutations: the
    // pin never toggles a task). The button's accessible name carries the
    // measured prefix "Filter tasks: " + the current value.
    await page.getByRole("button", { name: "Filter tasks: Active" }).click();
    await page.getByRole("menuitem", { name: "Completed", exact: true }).click();
    const checked = page
      .getByRole("checkbox", { name: "Set up study group chat" })
      .and(page.locator('[aria-checked="true"]'));
    await expect(checked).toBeVisible();

    const adjust = await checked.evaluate((el) => getComputedStyle(el).printColorAdjust);
    expect(adjust).toBe("exact"); // RED pre-fix: "auto" — the fill + white glyph strip in print
  });
});

// S124/BY13 — forced-colors selection state on the Appearance pickers. The
// S12 restoration covered the calendar/tabs/today/nav/slider set; the theme/
// accent/avatar tiles marked selection purely with fills/rings that
// forced-colors strips — under Windows HC a user could not tell which theme
// or accent was selected. The restoration now extends to the labeled picker
// families (the Appearance tab container — the doctrine: container-scoped,
// never bare aria-pressed rules).
test.describe("S124/BY13 · forced-colors keeps the Appearance pickers' selection", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active" });
  });
  test.afterEach(async ({ page }) => {
    await page.emulateMedia({ forcedColors: "none" });
  });

  test("the selected accent swatch carries a visible state outline (RED pre-fix: none)", async ({ page }) => {
    await gotoMode(page, "/Settings", "light");
    await hydrated(page);
    await page.getByRole("tab", { name: "Appearance" }).click();

    // The selected swatch is aria-pressed=true inside the labeled Appearance
    // container; the [role="dialog"] family (the color pickers) shares the
    // rule — this pin locks the doctrine's canonical case.
    const r = await stateOutline(page, '[aria-label="Appearance"] button[aria-pressed="true"]');
    expect(r.style).toBe("solid"); // RED pre-fix: "none"
    expect(r.width).toBeGreaterThanOrEqual(2);
  });
});

// ---------------------------------------------------------------------------
// S126/CA3 · the fixed mobile chrome does not print (the s126 shell audit's
// A-M1): the print stylesheet hid chrome via `aside { display: none }` only
// — the mobile app bar is a `<header ... lg:hidden>` and at portrait paper
// width (~816px < 1024px) the lg: media query stops applying, so the fixed
// header (hamburger, brand, the live clock) printed on every page; the
// fixed offline pill had no print guard either. The existing print family
// runs at DESKTOP viewports where lg:hidden still applies — the structural
// blind spot. The fix: print:hidden on both fixed chrome elements. This pin
// runs the family's missing leg: the MOBILE viewport under print emulation.
// ---------------------------------------------------------------------------
test.describe("S126/CA3 · the mobile chrome stays out of print", () => {
  test("at 390px under print emulation the app bar and the offline pill are hidden (RED pre-fix: the fixed header renders)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoMode(page, "/Dashboard", "light");
    await hydrated(page);
    await page.emulateMedia({ media: "print" });

    // The mobile app bar: hidden on paper (RED pre-fix: display flex).
    await expect(page.locator("header.glass.fixed")).toBeHidden();

    // The offline pill: force the offline state — the pill RENDERS
    // (attached) but stays HIDDEN under print emulation (the print:hidden
    // guard; waiting for "visible" here would be self-defeating: hidden
    // under print IS the fix).
    await page.context().setOffline(true);
    await page.waitForSelector("div[role='status'].fixed", { state: "attached" });
    await expect(page.locator("div[role='status'].fixed")).toBeHidden();
    await page.context().setOffline(false);
    await page.emulateMedia({ media: "screen" });
  });
});
