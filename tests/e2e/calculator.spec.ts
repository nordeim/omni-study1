import { expect, test, type Page } from "@playwright/test";

// Calculator + theme switching: the pure engines are unit-tested in
// Vitest (tests/calculator.test.ts, tests/theme.test.ts); these specs pin
// the UI wiring — keypad arithmetic, tabs, and accent/mode persistence.

test.use({ viewport: { width: 1440, height: 900 } });

// Hydration gate (module scope — shared by the theme-system and S15
// keyboard describes): the store stamps an inline --sf-primary var on
// <html> the moment it applies the user's saved preferences, which only
// happens post-hydration (see the original comment below).
const hydrated = (page: Page) =>
  page.waitForFunction(
    () => document.documentElement.style.getPropertyValue("--sf-primary") !== "",
  );

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
    await page.goto("/Calculator");
    await hydrated(page);
    await page.keyboard.type("12+3", { delay: 40 });
    await expect(page.getByLabel("Calculator display")).toContainText("12+3");
    await page.keyboard.press("Enter");
    await expect(page.getByLabel("Calculator display")).toContainText("15");
  });

  test("physical * and / display as the keypad glyphs × and ÷", async ({ page }) => {
    await page.goto("/Calculator");
    await hydrated(page);
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
    await page.goto("/Calculator");
    await hydrated(page);
    await page.keyboard.type("123", { delay: 40 });
    await page.keyboard.press("Backspace");
    await expect(page.getByLabel("Calculator display")).toContainText("12");
    await page.keyboard.press("Escape");
    await expect(page.getByLabel("Calculator display")).toContainText("0");
  });

  test("form inputs keep their keystrokes (the listener never hijacks fields)", async ({ page }) => {
    await page.goto("/Calculator");
    await hydrated(page);
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
});
