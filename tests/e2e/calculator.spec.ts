import { expect, test, type Page } from "@playwright/test";

// Calculator + theme switching: the pure engines are unit-tested in
// Vitest (tests/calculator.test.ts, tests/theme.test.ts); these specs pin
// the UI wiring — keypad arithmetic, tabs, and accent/mode persistence.

test.use({ viewport: { width: 1440, height: 900 } });

// Hydration gate (module scope — shared by the theme-system and S15
// keyboard describes): the HydrationMarker contract (S124/BY7) — page.tsx
// sets data-app-hydrated on the shell COMMIT, which per ADR-014 only
// happens after auth AND the active view's initial collections resolve.
// (The old --sf-primary var gate resolved pre-paint via the boot script —
// true at t=0, proving nothing; see the BF4 comment below for why the
// keyboard specs gate on an even stronger view-observable.)
const hydrated = (page: Page) =>
  page.waitForFunction(
    () => document.documentElement.dataset.appHydrated === "true",
  );

// S105/BF4 — the view-mounted gate for the S15 physical-keyboard specs.
// hydrated() alone is NOT a sufficient readiness gate for keystrokes: the
// PRE-PAINT BOOT SCRIPT stamps --sf-primary at first paint (src/lib/theme.ts
// THEME_BOOT_SCRIPT — cache or violet default), i.e. BEFORE the auth gate
// resolves and the Calculator view mounts its window-level keydown
// listener (the useEffect in calculator-view.tsx). Keystrokes dispatched
// in that window are lost — no queueing — and the assert then reads a
// partial display. Verified live on the standalone host: a keystroke
// dispatched at the hydrated() instant reads back a lost display ("00" —
// the two zero paragraphs). Gate on the OBSERVABLE end state instead: the
// Calculator display rendering its initial zero proves the auth gate
// passed AND the view committed (the listener rides the same commit's
// effect flush). The order-dependent flake class documented in AGENTS.md
// ("a click right after goto can silently no-op"), hit once under cert
// load in the s105 re-cert chunk 4; closed the BC4 way — the readiness
// gate strengthened to the observable end state, census unchanged.
const s15Ready = async (page: Page) => {
  await page.goto("/Calculator");
  await hydrated(page);
  await expect(page.getByLabel("Calculator display")).toContainText("0");
};

test.describe("calculator suite", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/Calculator");
  });

  test("basic arithmetic through the keypad", async ({ page }) => {
    // Scope to the Basic tabpanel: the Scientific pane keeps its own keypad
    // mounted in the DOM, so unscoped role lookups are ambiguous.
    const basic = page.getByRole("tabpanel", { name: "Basic" });
    await basic.getByRole("button", { name: "Insert 7" }).click();
    await basic.getByRole("button", { name: "Insert ×" }).click();
    await basic.getByRole("button", { name: "Insert 8" }).click();
    await basic.getByRole("button", { name: "Equals" }).click();
    await expect(page.getByLabel("Calculator display")).toContainText("56");
  });

  test("chain operations and clear", async ({ page }) => {
    const basic = page.getByRole("tabpanel", { name: "Basic" });
    await basic.getByRole("button", { name: "Insert 1" }).click();
    await basic.getByRole("button", { name: "Insert 2" }).click();
    await basic.getByRole("button", { name: "Insert +" }).click();
    await basic.getByRole("button", { name: "Insert 3" }).click();
    await basic.getByRole("button", { name: "Equals" }).click();
    await expect(page.getByLabel("Calculator display")).toContainText("15");
    await basic.getByRole("button", { name: "Clear" }).click();
    await expect(page.getByLabel("Calculator display")).toContainText("0");
  });

  test("all four calculator tabs switch", async ({ page }) => {
    for (const tab of ["Basic", "Scientific", "GPA Calculator", "Unit Converter"]) {
      await page.getByRole("tab", { name: tab }).click();
      // Radix tabs expose data-state="active" + aria-selected (not "selected").
      await expect(page.getByRole("tab", { name: tab })).toHaveAttribute(
        "aria-selected",
        "true",
      );
    }
    await expect(page.getByRole("tabpanel", { name: "Unit Converter" }).getByLabel("Value")).toBeVisible();
  });

  test("the GPA tab computes a weighted GPA", async ({ page }) => {
    await page.getByRole("tab", { name: "GPA Calculator" }).click();
    // Seeded rows: A (4.0 × 3cr) + B+ (3.3 × 4cr) → 25.2/7 = 3.6
    await expect(page.getByText("3.60")).toBeVisible();
  });

  test("the converter converts meters to feet", async ({ page }) => {
    await page.getByRole("tab", { name: "Unit Converter" }).click();
    const panel = page.getByRole("tabpanel", { name: "Unit Converter" });
    await panel.getByLabel("Value").fill("1");
    // defaults: m -> ft (1 / 0.3048 = 3.2808398…)
    await expect(page.getByText(/3\.2808/).first()).toBeVisible();
  });
});

test.describe("theme system", () => {
  // Hydration gate: see the module-level hydrated helper (S15 hoist — the
  // physical-keyboard describe needs the same gate).

  test("switching the accent recolors the active nav chip", async ({ page }) => {
    await page.goto("/Settings");
    await hydrated(page);
    // S11 hardening (cold-db flake, observed after a fresh db/e2e.db): the
    // swatch's savePreferences PATCH is fire-and-forget — asserting the
    // persistence on a re-navigation can race the PATCH (goto's
    // /api/auth/me returns the OLD user while the PATCH lands after). Await
    // the PATCH response BEFORE the navigation, exactly like the restore
    // below (the S4 lesson applied to the SET, not just the restore).
    await Promise.all([
      page.waitForResponse(
        (r) => r.url().includes("/api/settings/preferences") && r.request().method() === "PATCH",
      ),
      page.getByRole("button", { name: "Teal accent" }).click(),
    ]);
    // The token change is applied to <html> as an RGB triplet var. The var
    // lands on the NEXT React render after the click — an immediate evaluate
    // races it (observed as a fast-fail flake); poll for the final value.
    await page.waitForFunction(
      () => document.documentElement.style.getPropertyValue("--sf-primary").trim() === "20 184 166",
    );
    // It persists (saved to the user record).
    await page.goto("/Dashboard");
    await page.waitForFunction(
      () => document.documentElement.style.getPropertyValue("--sf-primary").trim() === "20 184 166",
    );
    const after = await page.evaluate(
      () => getComputedStyle(document.documentElement).getPropertyValue("--sf-primary").trim(),
    );
    expect(after).toBe("20 184 166");
    // Restore the default accent — later specs (and the shared user record)
    // must not inherit this test's teal. The restore PATCH must LAND before
    // the test ends: ending right after the click can abort the in-flight
    // request (page teardown), persisting teal and poisoning every later
    // violet-computed pin (observed as an order-dependent full-suite flake,
    // session 4).
    await page.goto("/Settings");
    await hydrated(page);
    await Promise.all([
      page.waitForResponse(
        (r) => r.url().includes("/api/settings/preferences") && r.request().method() === "PATCH",
      ),
      page.getByRole("button", { name: "Violet accent" }).click(),
    ]);
    // And the applied token is violet again (same render-race hardening).
    await page.waitForFunction(
      () => document.documentElement.style.getPropertyValue("--sf-primary").trim() === "139 92 246",
    );
  });

  // S11 safety net: a failure ABOVE the in-test restore (e.g. the persistence
  // assert) used to leak teal into every later violet-computed spec — the
  // restore only ran at the END of the test body. The afterEach guarantees
  // the shared user record is violet again even when a pin fails mid-test
  // (the same per-hook pattern as dark-mode.spec.ts / theme-system.spec.ts).
  test.afterEach(async ({ page }) => {
    await page.request.patch("/api/settings/preferences", { data: { accentColor: "violet" } });
  });

  test("dark mode toggles the html class", async ({ page }) => {
    await page.goto("/Settings");
    await hydrated(page);
    await page.getByRole("button", { name: "Dark", exact: true }).click();
    await expect(page.locator("html")).toHaveClass(/dark/);
    await page.getByRole("button", { name: "Light", exact: true }).click();
    await expect(page.locator("html")).not.toHaveClass(/dark/);
  });
});

// ---------------------------------------------------------------------------
// S15 — the physical-keyboard SUPERSET pins (the reference's calculator is
// click-only, verified on the live reference; the clone additionally maps
// physical keys onto the same press/submit pipeline — mapPhysicalKey is
// unit-pinned in tests/calculator.test.ts).
// ---------------------------------------------------------------------------

test.describe("S15 physical keyboard (superset)", () => {
  test("typing an expression on the physical keyboard evaluates it", async ({ page }) => {
    await s15Ready(page);
    await page.keyboard.type("12+3", { delay: 40 });
    await expect(page.getByLabel("Calculator display")).toContainText("12+3");
    await page.keyboard.press("Enter");
    await expect(page.getByLabel("Calculator display")).toContainText("15");
  });

  test("physical * and / display as the keypad glyphs × and ÷", async ({ page }) => {
    await s15Ready(page);
    await page.keyboard.type("6*8", { delay: 40 });
    await expect(page.getByLabel("Calculator display")).toContainText("6×8");
    await page.keyboard.press("Enter");
    await expect(page.getByLabel("Calculator display")).toContainText("48");
    await page.keyboard.type("9/4", { delay: 40 });
    await expect(page.getByLabel("Calculator display")).toContainText("9÷4");
    await page.keyboard.press("Enter");
    await expect(page.getByLabel("Calculator display")).toContainText("2.25");
  });

  test("Backspace deletes and Escape clears the display", async ({ page }) => {
    await s15Ready(page);
    await page.keyboard.type("123", { delay: 40 });
    await page.keyboard.press("Backspace");
    await expect(page.getByLabel("Calculator display")).toContainText("12");
    await page.keyboard.press("Escape");
    await expect(page.getByLabel("Calculator display")).toContainText("0");
  });

  test("form inputs keep their keystrokes (the listener never hijacks fields)", async ({ page }) => {
    await s15Ready(page);
    await page.getByRole("tab", { name: "GPA Calculator" }).click();
    const grade = page.getByRole("textbox").first();
    await grade.click();
    await grade.fill(""); // the seeded GPA rows carry a default grade
    await page.keyboard.type("A", { delay: 40 });
    await expect(grade).toHaveValue("A");
    // The calculator display never picked the keystroke up (the display
    // unmounts on the GPA tab — flip back and assert it is untouched).
    await page.getByRole("tab", { name: "Basic" }).click();
    await expect(page.getByLabel("Calculator display")).toContainText("0");
  });

  // ---- S119/BT7 — the history panel's non-modal focus lifecycle -------------

  test("S119/BT7: the history panel closes on Escape and restores focus to the toggle", async ({ page }) => {
    await s15Ready(page);
    const toggle = page.getByRole("button", { name: "History", exact: true });
    await toggle.click();
    const panel = page.locator("#calc-history-panel");
    await expect(panel).toBeVisible();
    // focus landed in the panel on open
    await expect(panel).toBeFocused();
    // Escape closes the panel — and ONLY closes it (the display keeps its
    // value: the S15 display-clear mapping stays dormant while open)
    await page.keyboard.type("12", { delay: 30 });
    await expect(page.getByLabel("Calculator display")).toContainText("12");
    await page.keyboard.press("Escape");
    await expect(panel).not.toBeVisible();
    await expect(toggle).toBeFocused();
    await expect(page.getByLabel("Calculator display")).toContainText("12");
    // with the panel CLOSED, Escape reverts to the pinned display-clear
    await page.keyboard.press("Escape");
    await expect(page.getByLabel("Calculator display")).toContainText("0");
  });

  test("S119/BT12: a failed history save never toasts the evaluation message", async ({ page }) => {
    await s15Ready(page);
    // Route the history POST to a 500: the evaluation must succeed, the
    // display must show the result, and the toast must be the
    // history-specific message — never "could not be evaluated".
    await page.route("**/api/calculator/history", (route) =>
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "The history service is unavailable." }),
      }),
    );
    await page.keyboard.type("1+1", { delay: 30 });
    await page.keyboard.press("Enter");
    await expect(page.getByLabel("Calculator display")).toContainText("2");
    await expect(page.getByText("The history service is unavailable.")).toBeVisible();
    await expect(page.getByText("could not be evaluated")).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// S190 · Batch EN — the measured Basic-keypad anatomy port (the never-
// re-measured surface: the session-2 E2 fix was the last live measurement;
// the reference re-measured 2026-11-15 in LIGHT mode carries
// Clear(span-2)+icon-only-backspace(span-2) on row 1, dark slate-800
// operators, the 6px radius family, and NO ±/^/(/) on Basic — those live
// on Scientific (xʸ, (, ), %). See docs/remediation-plan-session190.md §3.1.
// ---------------------------------------------------------------------------
test.describe("S190 · the measured Basic-keypad anatomy port", () => {
  test.beforeEach(async ({ page }) => {
    await s15Ready(page);
  });

  test("EN1: the Clear key is the near-black span-2 red-labeled key", async ({ page }) => {
    const basic = page.getByRole("tabpanel", { name: "Basic" });
    const clear = basic.getByRole("button", { name: "Clear", exact: true });
    await expect(clear).toBeVisible();
    const cs = await clear.evaluate((el) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const icon = el.querySelector("svg");
      return {
        bg: s.backgroundColor,
        color: s.color,
        radius: s.borderRadius,
        fs: s.fontSize,
        w: Math.round(r.width),
        h: Math.round(r.height),
        iconColor: icon ? getComputedStyle(icon).color : null,
      };
    });
    expect(cs.bg).toBe("rgb(10, 10, 10)"); // near-black literal (not slate-900 rgb(15,23,42))
    // The measured reference label is red-600 rgb(220,38,38) — but that
    // pair on the near-black measures 4.10:1 (axe color-contrast, serious;
    // the a11y-sweep's zero-violation pin). The Family F precedent: ONE
    // step for contrast — red-500 rgb(239,68,68) measures 5.27:1.
    expect(cs.color).toBe("rgb(239, 68, 68)");
    expect(cs.iconColor).toBe("rgb(239, 68, 68)"); // the undo icon rides the label color
    expect(cs.radius).toBe("6px"); // the measured key-family radius
    expect(cs.fs).toBe("14px"); // the Clear label's smaller face (digits are 18px)
    expect(cs.w).toBeGreaterThanOrEqual(200); // span-2 ≈ 203px at 1440
    expect(cs.h).toBe(56); // h-14 — both hosts
  });

  test("EN2: row 1 pairs Clear with an icon-only near-black Backspace key", async ({ page }) => {
    const basic = page.getByRole("tabpanel", { name: "Basic" });
    const bs = basic.getByRole("button", { name: "Backspace" });
    await expect(bs).toBeVisible();
    const cs = await bs.evaluate((el) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const icon = el.querySelector("svg");
      return {
        bg: s.backgroundColor,
        text: el.textContent.trim(),
        w: Math.round(r.width),
        y: Math.round(r.y),
        iconColor: icon ? getComputedStyle(icon).color : null,
      };
    });
    expect(cs.bg).toBe("rgb(10, 10, 10)"); // the same near-black row-1 family
    expect(cs.text).toBe(""); // ICON-ONLY — no visible glyph (measured)
    expect(cs.iconColor).toBe("rgb(250, 250, 250)"); // the white 16px icon
    expect(cs.w).toBeGreaterThanOrEqual(200); // span-2
    // Same row as the Clear key (the measured row-1 pair).
    const clear = basic.getByRole("button", { name: "Clear", exact: true });
    const clearY = await clear.evaluate((el) => Math.round(el.getBoundingClientRect().y));
    expect(Math.abs(cs.y - clearY)).toBeLessThan(2);
  });

  test("EN3: the four operators are the dark slate-800 family", async ({ page }) => {
    const basic = page.getByRole("tabpanel", { name: "Basic" });
    for (const op of ["÷", "×", "-", "+"]) {
      const key = basic.getByRole("button", { name: `Insert ${op}` });
      await expect(key).toBeVisible();
      const cs = await key.evaluate((el) => {
        const s = getComputedStyle(el);
        return { bg: s.backgroundColor, color: s.color, radius: s.borderRadius, border: s.borderWidth };
      });
      expect(cs.bg).toBe("rgb(30, 41, 59)"); // slate-800 (was violet-soft)
      expect(cs.color).toBe("rgb(255, 255, 255)");
      expect(cs.border).toBe("0px"); // borderless against the digits' 1px
      expect(cs.radius).toBe("6px");
    }
  });

  test("EN4: digits are white bordered font-semibold with the 6px radius", async ({ page }) => {
    const basic = page.getByRole("tabpanel", { name: "Basic" });
    const seven = basic.getByRole("button", { name: "Insert 7" });
    await expect(seven).toBeVisible();
    const cs = await seven.evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        bg: s.backgroundColor,
        color: s.color,
        fw: s.fontWeight,
        border: s.borderColor,
        radius: s.borderRadius,
        w: Math.round(el.getBoundingClientRect().width),
      };
    });
    expect(cs.bg).toBe("rgb(255, 255, 255)");
    expect(cs.color).toBe("rgb(30, 41, 59)"); // slate-800 label (measured)
    expect(cs.fw).toBe("600"); // font-semibold (measured; was 500)
    expect(cs.border).toBe("rgb(226, 232, 240)"); // slate-200
    expect(cs.radius).toBe("6px");
    expect(cs.w).toBeLessThanOrEqual(102); // single cell (≈98px at 1440)
  });

  test("EN5: Equals is a single-cell gradient key inside the digit grid", async ({ page }) => {
    const basic = page.getByRole("tabpanel", { name: "Basic" });
    const eq = basic.getByRole("button", { name: "Equals" });
    await expect(eq).toBeVisible();
    const cs = await eq.evaluate((el) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        bgImage: s.backgroundImage,
        radius: s.borderRadius,
        w: Math.round(r.width),
        y: Math.round(r.y),
      };
    });
    expect(cs.bgImage).toContain("linear-gradient");
    expect(cs.bgImage).toContain("rgb(139, 92, 246)"); // violet-500 → indigo-600
    expect(cs.bgImage).toContain("rgb(79, 70, 229)");
    expect(cs.radius).toBe("6px");
    expect(cs.w).toBeLessThanOrEqual(102); // single cell — NOT span-2
    // Row 5: the same row as the 0 key (the measured 0 . = + row).
    const zero = basic.getByRole("button", { name: "Insert 0" });
    const zeroY = await zero.evaluate((el) => Math.round(el.getBoundingClientRect().y));
    expect(Math.abs(cs.y - zeroY)).toBeLessThan(2);
  });

  test("EN6: the Basic census is the reference's 18 keys; the fn keys live on Scientific", async ({ page }) => {
    const basic = page.getByRole("tabpanel", { name: "Basic" });
    const basicKeys = await basic.locator("button").evaluateAll((els) =>
      els
        .filter((el) => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.y > 200; // the keypad region below the display
        })
        .map((el) => el.textContent.trim()),
    );
    expect(basicKeys).toHaveLength(18); // 16 grid + Clear + the icon-only backspace
    expect(basicKeys.filter(Boolean)).toHaveLength(17); // Clear + 16 labeled keys (backspace is icon-only)
    const joined = basicKeys.join("");
    expect(joined).not.toContain("±"); // no negate key on Basic (measured)
    expect(joined).not.toContain("^"); // the power key lives on Scientific as xʸ
    expect(joined).not.toContain("("); // parens live on Scientific (measured)
    expect(joined).not.toContain(")");
    // The scientific tab carries the reference's fn set.
    await page.getByRole("tab", { name: "Scientific" }).click();
    const sci = page.getByRole("tabpanel", { name: "Scientific" });
    for (const fn of ["sin", "cos", "tan", "π", "√", "x²", "xʸ", "log", "(", ")", "%", "e"]) {
      await expect(sci.getByRole("button", { name: `Insert ${fn}` })).toBeVisible();
    }
  });
});
