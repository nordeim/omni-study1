import { expect, test, type Page } from "@playwright/test";

/**
 * Session-11 pins — theme-system application lifecycle + accent-dark
 * re-theming (docs/remediation-plan-session11.md).
 *
 * Family A (the root cause): the theme class was applied ONLY by client
 * store code AFTER /api/auth/me resolved — nothing themed the first paint
 * (FOUC for dark users), the login route (dead dark: variants there), or a
 * runtime OS switch (System mode resolved once, no matchMedia listener).
 * The fix: a pre-paint boot script driven by a localStorage cache that
 * applyToDocument writes on every apply + installSystemThemeTracking().
 *
 * Family B (the S10 inline-style pattern, 4 remaining accent surfaces): the
 * active nav item (inline --sf-primary-strong/-primary colors), ViewAllLink
 * (text-sf-primary-strong with no dark pair), the timetable mobile today
 * chip (bg-sf-primary-soft, a mobile-only surface the S10 desktop sweep
 * never rendered), and the settings avatar emoji swatch (inline soft tint).
 * In dark mode all four must follow the repo convention — the 300-level
 * --sf-primary-strong-dark tone — while light values stay byte-identical
 * (the final light regression guard + every prior pin).
 *
 * Family C: a minimal @media print block (hide chrome, white canvas).
 *
 * Mode strategy follows dark-mode.spec.ts: API PATCH + waitForFunction; the
 * afterEach ALWAYS restores light (+ the avatar emoji, mutated by the B4
 * pin) so a failed pin can never poison the shared user record.
 */

const PREFERENCES = "/api/settings/preferences";

async function setMode(page: Page, mode: "light" | "dark" | "system") {
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

// The repo's own token values (globals.css / theme.ts), pre-converted:
const STRONG_DARK = "rgb(196, 181, 253)"; // violet-300 (--sf-primary-strong-dark)
const STRONG_LIGHT = "rgb(124, 58, 237)"; // violet-600 (--sf-primary-strong)
const PRIMARY_LIGHT = "rgb(139, 92, 246)"; // violet-500 (--sf-primary)
const SOFT_DARK = "76, 29, 149"; // violet-900 (--sf-primary-soft-dark)

test.afterEach(async ({ page }) => {
  // Guarantee the shared user record resting state (light, no emoji) even
  // when a pin failed mid-test (the S4/S10 restore lesson).
  await page.request.patch(PREFERENCES, { data: { themeMode: "light", avatarEmoji: "" } });
});

test.describe("S11-1 · the theme applies pre-paint (no FOUC, no auth round-trip)", () => {
  test("dark renders immediately on reload with /api/auth/me aborted", async ({ page }) => {
    await setMode(page, "dark");
    await page.goto("/Dashboard");
    await page.waitForFunction(() => document.documentElement.classList.contains("dark"));
    // The cache is written; now starve the auth round-trip and hard-reload:
    // the boot script must apply dark BEFORE any fetch resolves. (The auth
    // failure bounces to /login — the boot script themes that route too.)
    await page.route("**/api/auth/me", (route) => route.abort());
    try {
      await page.reload();
      await expect(page.locator("html")).toHaveClass(/dark/);
      // Still dark after the auth failure settles (login route, boot script).
      await page.waitForTimeout(600);
      await expect(page.locator("html")).toHaveClass(/dark/);
    } finally {
      await page.unroute("**/api/auth/me");
    }
  });

  test("login page themes dark for a fresh dark-OS visitor (system fallback)", async ({ browser }) => {
    // A FRESH context: no sf_session cookie, empty localStorage — only the
    // OS preference can theme the login route (the A2 probe: html stayed
    // class-less for dark-OS visitors before the boot script).
    const context = await browser.newContext({ colorScheme: "dark" });
    const login = await context.newPage();
    try {
      await login.goto("/login");
      await expect(login.locator("html")).toHaveClass(/dark/);
      // The login card re-themes (dark:bg-slate-900/95 family) — pin via the
      // "or" divider chip's solid dark:bg-slate-900 (pinned hex #0f172a).
      const chip = login.getByText("or", { exact: true });
      await expect(chip).toBeVisible();
      const bg = await chip.evaluate((el) => getComputedStyle(el).backgroundColor);
      expect(bg).toBe("rgb(15, 23, 42)"); // slate-900 (pinned)
    } finally {
      await context.close();
    }
  });

  test("applyToDocument persists the theme cache", async ({ page }) => {
    await gotoMode(page, "/Dashboard", "dark");
    const raw = await page.evaluate(() => localStorage.getItem("sf-theme"));
    expect(raw).toBeTruthy();
    expect(raw).toContain('"mode":"dark"');
    expect(raw).toContain('"accent":"violet"');
  });
});

test.describe("S11-1 · System mode tracks OS changes at runtime", () => {
  test("system + OS switch re-themes without a reload", async ({ page }) => {
    await setMode(page, "system");
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/Dashboard");
    await page.waitForFunction(() => document.documentElement.classList.contains("dark"));
    // OS switches to light at runtime — the listener must re-apply.
    await page.emulateMedia({ colorScheme: "light" });
    await page.waitForFunction(() => !document.documentElement.classList.contains("dark"));
    // And back to dark — symmetric.
    await page.emulateMedia({ colorScheme: "dark" });
    await page.waitForFunction(() => document.documentElement.classList.contains("dark"));
  });
});

test.describe("S11-1 · theme-color meta follows the effective mode", () => {
  test("plain meta tracks dark/light", async ({ page }) => {
    await gotoMode(page, "/Dashboard", "dark");
    const meta = page.locator('meta[name="theme-color"]:not([media])');
    await expect(meta).toHaveCount(1);
    await expect(meta).toHaveAttribute("content", "#020617");

    await gotoMode(page, "/Dashboard", "light");
    await expect(meta).toHaveAttribute("content", "#ffffff");
  });
});

test.describe("S11-2..5 · accent surfaces re-theme in dark (the 300-level convention)", () => {
  test("active nav item text and icon use strong-dark in dark", async ({ page }) => {
    await gotoMode(page, "/Dashboard", "dark");
    const link = page.locator('aside a[aria-current="page"]');
    await expect(link).toBeVisible();
    const label = link.locator("span.truncate");
    const labelColor = await label.evaluate((el) => getComputedStyle(el).color);
    expect(labelColor).toBe(STRONG_DARK);
    const icon = link.locator("svg");
    const iconColor = await icon.evaluate((el) => getComputedStyle(el).color);
    expect(iconColor).toBe(STRONG_DARK);
  });

  test("ViewAllLink uses strong-dark in dark", async ({ page }) => {
    await gotoMode(page, "/Dashboard", "dark");
    const link = page.getByRole("button", { name: "View All" }).first();
    await expect(link).toBeVisible();
    const color = await link.evaluate((el) => getComputedStyle(el).color);
    expect(color).toBe(STRONG_DARK);
  });

  test("timetable mobile today chip uses the dark accent pair", async ({ page }) => {
    await gotoMode(page, "/Timetable", "dark");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(900); // accordion re-render on breakpoint change
    // Stable locator across RED→GREEN: the conditional class list keeps the
    // light utility substring in both states (attribute substring match).
    // Exact class token — the S8 softest-tint header swap put the substring
    // "bg-sf-primary-soft" on the DESKTOP header's dark variant too, and DOM
    // order made that hidden element win the substring match. The literal
    // utility lives only on the mobile chip (the comment's own contract).
    const chip = page.locator("div.bg-sf-primary-soft");
    await expect(chip).toBeVisible();
    const bg = await chip.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).toContain(SOFT_DARK);
    const color = await chip.evaluate((el) => getComputedStyle(el).color);
    expect(color).toBe(STRONG_DARK);
  });

  test("settings avatar emoji swatch uses the dark accent wash when selected", async ({ page }) => {
    await gotoMode(page, "/Settings", "dark");
    // The emoji grid lives on the APPEARANCE tab (the default) — buttons are
    // labelled "Choose avatar <emoji>".
    const swatch = page.getByRole("button", { name: "Choose avatar 🎓" });
    await swatch.click();
    await expect(swatch).toBeVisible();
    // transition-all animates the tint — poll the FINAL computed value (S8
    // lesson: an immediate read catches a mid-transition blend).
    await page.waitForFunction(() => {
      const el = document.querySelector('[aria-label="Choose avatar 🎓"]');
      return el !== null && getComputedStyle(el).backgroundColor.includes("76, 29, 149");
    });
    const bg = await swatch.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).toContain(SOFT_DARK);
  });
});

const hydrated = (page: Page) =>
  page.waitForFunction(() => document.documentElement.style.getPropertyValue("--sf-primary") !== "");

test.describe("S11-7 · the Appearance tab is the reference's single card (s69)", () => {
  test("the appearance pane renders ONE max-w-4xl card with the ref's anatomy", async ({ page }) => {
    // Reference (measured s69): ONE `rounded-xl border bg-card shadow`
    // card, 896px (max-w-4xl) centered, containing the Appearance title,
    // the "Customize how StudyFlow looks" description, the Theme /
    // Accent Color / Avatar labels, and the Save Preferences gradient
    // button. The clone rendered THREE sf-cards at max-w-2xl.
    await page.goto("/Settings");
    await hydrated(page);
    const pane = page.locator('[aria-label="Appearance"]');
    await expect(pane.getByText("Customize how StudyFlow looks")).toBeVisible();
    const cards = pane.locator("div.rounded-xl.border");
    await expect(cards).toHaveCount(1);
    const cs = await cards.first().evaluate((el) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        bg: s.backgroundColor,
        radius: s.borderRadius,
        w: Math.round(r.width),
        x: Math.round(r.x),
      };
    });
    expect(cs.radius).toBe("12px");
    expect(Math.abs(cs.w - 896)).toBeLessThanOrEqual(8);
    // centered in the content area right of the 260px sidebar
    const vw = await page.evaluate(() => window.innerWidth);
    expect(Math.abs(cs.x - (260 + (vw - 260 - 896) / 2))).toBeLessThanOrEqual(8);
    for (const label of ["Theme", "Accent Color", "Avatar"]) {
      await expect(pane.getByText(label, { exact: true })).toBeVisible();
    }
    await expect(pane.getByRole("button", { name: /save preferences/i })).toBeVisible();
  });

  test("theme buttons + swatches + emoji tiles carry the measured geometry", async ({ page }) => {
    // Reference (measured s69): theme buttons flex-1 h-88 rounded-xl
    // border-2 with a 24px icon; accent swatches 48px rounded-xl; emoji
    // tiles 48px rounded-xl on a slate-100 fill (NO border) in a
    // flex-wrap gap-2 row.
    await page.goto("/Settings");
    await hydrated(page);
    const light = page.getByRole("button", { name: "Light", exact: true });
    const tcs = await light.evaluate((el) => {
      const s = getComputedStyle(el);
      const svg = el.querySelector("svg")!;
      return {
        h: Math.round(el.getBoundingClientRect().height),
        radius: s.borderRadius,
        border: s.borderTopWidth,
        icon: Math.round(svg.getBoundingClientRect().width),
      };
    });
    expect(tcs.h).toBe(88);
    expect(tcs.radius).toBe("12px");
    expect(tcs.border).toBe("2px");
    expect(tcs.icon).toBe(24);
    const swatch = page.getByRole("button", { name: "Violet accent" });
    const scs = await swatch.evaluate((el) => {
      const s = getComputedStyle(el);
      return { size: Math.round(el.getBoundingClientRect().width), radius: s.borderRadius };
    });
    expect(scs.size).toBe(48);
    expect(scs.radius).toBe("12px");
    const tile = page.getByRole("button", { name: "Choose avatar 🎓" });
    const tiles = await tile.evaluate((el) => {
      const s = getComputedStyle(el);
      const parent = el.parentElement!;
      return {
        size: Math.round(el.getBoundingClientRect().width),
        radius: s.borderRadius,
        border: s.borderTopWidth,
        bg: s.backgroundColor,
        parentDisplay: getComputedStyle(parent).display,
        gap: getComputedStyle(parent).gap,
      };
    });
    expect(tiles.size).toBe(48);
    expect(tiles.radius).toBe("12px");
    expect(tiles.border).toBe("0px");
    expect(tiles.bg).toBe("rgb(241, 245, 249)"); // slate-100 fill
    expect(tiles.parentDisplay).toBe("flex");
    expect(tiles.gap).toBe("8px");
  });
});

test.describe("S11-6 · minimal print styles (superset)", () => {
  test("print emulation hides the chrome and resets the canvas", async ({ page }) => {
    await gotoMode(page, "/Dashboard", "light");
    await page.emulateMedia({ media: "print" });
    const asideVisible = await page.locator("aside").evaluate((el) => getComputedStyle(el).display);
    expect(asideVisible).toBe("none");
    const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bodyBg).toBe("rgb(255, 255, 255)");
    await page.emulateMedia({ media: "screen" });
  });
});

test.describe("light regression guard (S11)", () => {
  test("the B-family surfaces keep their exact light values", async ({ page }) => {
    await gotoMode(page, "/Dashboard", "light");
    const link = page.locator('aside a[aria-current="page"]');
    const labelColor = await link.locator("span.truncate").evaluate((el) => getComputedStyle(el).color);
    expect(labelColor).toBe(STRONG_LIGHT); // violet-600 — unchanged
    const iconColor = await link.locator("svg").evaluate((el) => getComputedStyle(el).color);
    expect(iconColor).toBe(PRIMARY_LIGHT); // violet-500 — unchanged

    const viewAll = page.getByRole("button", { name: "View All" }).first();
    await expect(viewAll).toBeVisible();
    const viewAllColor = await viewAll.evaluate((el) => getComputedStyle(el).color);
    expect(viewAllColor).toBe(STRONG_LIGHT); // violet-600 — unchanged

    // Timetable mobile today chip: light soft tint + strong text (violet-100).
    await page.goto("/Timetable");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(900);
    // Exact class token — the S8 softest-tint header swap put the substring
    // "bg-sf-primary-soft" on the DESKTOP header's dark variant too, and DOM
    // order made that hidden element win the substring match. The literal
    // utility lives only on the mobile chip (the comment's own contract).
    const chip = page.locator("div.bg-sf-primary-soft");
    await expect(chip).toBeVisible();
    const bg = await chip.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).toBe("rgb(243, 232, 255)"); // violet-100 (--sf-primary-soft)
    const color = await chip.evaluate((el) => getComputedStyle(el).color);
    expect(color).toBe(STRONG_LIGHT);
  });
});
