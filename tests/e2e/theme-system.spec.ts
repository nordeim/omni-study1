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
  page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true");

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

  test("the avatar vocabulary is the reference's 24-emoji list (S11-7c pin, s70)", async ({ page }) => {
    // Reference (RE-measured s70, probe #2 scoped visible-tile dump —
    // AP-108): the s69 Z12 dump reported 22, but the reference renders 24
    // — ⭐ sits at index 6 (between 🚀 and 🌟) and ⚽ at index 19 (between
    // 🎮 and 🏀). The s69 scan dropped both glyphs.
    await page.goto("/Settings");
    await hydrated(page);
    const pane = page.locator('[aria-label="Appearance"]');
    const tiles = pane.locator("button").filter({ hasText: /^\p{Extended_Pictographic}$/u });
    await expect(tiles).toHaveCount(24);
    const glyphs = await tiles.evaluateAll((els) => els.map((el) => el.textContent.trim()));
    expect(glyphs[6]).toBe("⭐");
    expect(glyphs[19]).toBe("⚽");
    expect(glyphs.filter((g) => g === "⭐")).toHaveLength(1);
    expect(glyphs.filter((g) => g === "⚽")).toHaveLength(1);
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

// S127/CB15 — the appearance pickers' failed-save rollback (the s127 FE
// audit's L-1): pickTheme/pickAccent/pickAvatar applied the new value to
// the theme store (and the localStorage cache) BEFORE the PATCH and only
// toasted on failure — the visible selection lied about what would
// persist until the next /api/auth/me hydration silently reverted it. The
// pin aborts the preferences PATCH and demands the pressed selection
// revert to the persisted value.
test.describe("S127/CB15 · a failed theme save reverts the visible selection", () => {
  test("aborted PATCH leaves Light pressed (was: Dark stayed pressed, lying about persistence)", async ({ page }) => {
    // Normalise the persisted mode to light first (the pin's baseline).
    await page.request.patch("/api/settings/preferences", { data: { themeMode: "light" } });
    await page.goto("/Settings");
    await hydrated(page);
    // The Appearance pane's mode buttons.
    const pane = page.locator('[aria-label="Appearance"]');
    await expect(pane).toBeVisible();
    const light = pane.getByRole("button", { name: "Light" });
    await expect(light).toHaveAttribute("aria-pressed", "true");

    // The save fails (the flaky-network condition).
    await page.route("**/api/settings/preferences", (route) => route.abort("failed"));

    // Pick Dark — pre-fix the button flipped to pressed with no rollback.
    await pane.getByRole("button", { name: "Dark" }).click();
    // Post-fix: the revert restores the persisted selection.
    await expect(light).toHaveAttribute("aria-pressed", "true", { timeout: 5_000 });
    // Restore the route so later state is honest.
    await page.unroute("**/api/settings/preferences");
    await page.request.patch("/api/settings/preferences", { data: { themeMode: "light" } });
  });
});

// S129/CD1 — the overlay animation parity (docs/remediation-plan-session129.md).
//
// The audit's M2, measured LIVE on both hosts: the reference's dialog
// overlay AND content run animation-name "enter" at animation-duration
// "0.15s" (the tailwindcss-animate family present in its stylesheets —
// .animate-in { animation: enter 0.15s }, .fade-in-0, .zoom-in-95), while
// the clone's animate-in/out classes were INERT (tw-animate-css declared in
// package.json but never imported; Tailwind v4 silently drops unknown
// utilities) — every dialog/dropdown/select opened and closed instantly.
// The fix wires the v4 port (@import "tw-animate-css") and restores the
// overlay fade classes. This pin holds the clone to the reference-measured
// computed values on BOTH nodes of the Add Task dialog.
test.describe("S135/CJ3 · the accent-edge token tracks the accent (the violet-200 border family)", () => {
  test("the notes selected-row border follows the accent: violet-200 → blue-200 (RED pre-fix: hardcoded violet ignores the switch)", async ({ page }) => {
    // The accent-switch rides the REAL settings API (the S27 doctrine);
    // the restore rides afterEach + the explicit finally PATCH.
    await page.request.patch(PREFERENCES, { data: { accentColor: "violet" } });
    await page.goto("/Notes");
    await page.waitForFunction(() => {
      const root = document.documentElement;
      return root.style.getPropertyValue("--sf-primary") === "139 92 246";
    });
    const row = page.getByRole("button", { name: /Dot product intuition/ }).first();
    await row.click();
    // transition-colors races the class swap (the AD7 pin's settle note).
    await page.waitForTimeout(300);
    const violetBorder = await row.evaluate((el) => getComputedStyle(el).borderTopColor);
    expect(violetBorder).toContain("rgb(221, 214, 254)"); // violet-200 (the measured parity value)

    try {
      await page.request.patch(PREFERENCES, { data: { accentColor: "blue" } });
      // The accent reaches the DOM through a fresh load (the AG11a pattern —
      // a raw API PATCH does not notify the live store; the boot applies the
      // stored accent on the next navigation).
      await page.goto("/Notes");
      await page.waitForFunction(() => {
        const root = document.documentElement;
        return root.style.getPropertyValue("--sf-primary") === "59 130 246";
      });
      const rowBlue = page.getByRole("button", { name: /Dot product intuition/ }).first();
      await rowBlue.click();
      await page.waitForTimeout(300);
      const blueBorder = await rowBlue.evaluate((el) => getComputedStyle(el).borderTopColor);
      // RED pre-fix: the hardcoded border-violet-200 stays rgb(221, 214, 254).
      expect(blueBorder).toContain("rgb(191, 219, 254)"); // blue-200 (--sf-primary-edge at blue)
    } finally {
      await page.request.patch(PREFERENCES, { data: { accentColor: "violet" } });
    }
  });
});

// S161/DJ4 — the CJ3 sweep's DARK sibling: the selected-row border's dark
// half rides --sf-primary-edge-dark (the 800-level step of the accent's
// own hue family) instead of the hardcoded violet-900 the S135/CJ3
// VIOLET_RESIDUALS register deferred ("a dark-edge token family waits
// for a harmonization pass"). This cycle executed the pass. RED pre-fix:
// under blue + dark the border stays violet-900 rgb(76, 29, 149).
test.describe("S161/DJ4 · the dark-edge token tracks the accent (the violet-900 border family's dark half)", () => {
  test("the notes selected-row DARK border follows the accent: violet-900 → blue-800 (RED pre-fix: the hardcoded violet ignores the switch)", async ({ page }) => {
    // The accent + mode switch rides the REAL settings API (the S27
    // doctrine); the restore rides afterEach + the explicit finally PATCH.
    await page.request.patch(PREFERENCES, { data: { accentColor: "blue", themeMode: "dark" } });
    try {
      await page.goto("/Notes");
      await page.waitForFunction(() => {
        const root = document.documentElement;
        return (
          root.style.getPropertyValue("--sf-primary") === "59 130 246" &&
          root.classList.contains("dark")
        );
      });
      const row = page.getByRole("button", { name: /Dot product intuition/ }).first();
      await row.click();
      // transition-colors races the class swap (the AD7 pin's settle note).
      await page.waitForTimeout(300);
      const darkBorder = await row.evaluate((el) => getComputedStyle(el).borderTopColor);
      // RED pre-fix: the hardcoded dark:border-violet-900 stays
      // rgb(76, 29, 149) under every accent.
      expect(darkBorder).toContain("rgb(30, 64, 175)"); // blue-800 (--sf-primary-edge-dark at blue)
    } finally {
      await page.request.patch(PREFERENCES, { data: { accentColor: "violet", themeMode: "light" } });
    }
  });
});

test.describe("S129/CD1 · the Radix overlay animation parity (the reference-measured enter family)", () => {
  test("the Add Task dialog's overlay and content run the enter animation at the reference's 0.15s (pre-fix: none/0s — the family was inert)", async ({ page }) => {
    await page.goto("/Tasks");
    await hydrated(page);
    await page.getByRole("button", { name: "Add Task" }).click();

    // The dialog content — the zoom+fade enter family.
    const content = page.getByRole("dialog");
    await expect(content).toBeVisible();
    const contentAnim = await content.evaluate((el) => {
      const s = getComputedStyle(el);
      return { name: s.animationName, duration: s.animationDuration };
    });
    expect(contentAnim.name).toBe("enter");
    expect(contentAnim.duration).toBe("0.15s");

    // The overlay — the reference's fade-in family (pre-CD1 the clone's
    // DialogOverlay carried NO animation classes at all). This Radix
    // version sets no data-radix-dialog-overlay attribute; the overlay is
    // the full-screen scrim div (the bg-black/80 class shape).
    const overlay = page.locator('div[class*="bg-black/80"]');
    await expect(overlay).toBeVisible();
    const overlayAnim = await overlay.evaluate((el) => {
      const s = getComputedStyle(el);
      return { name: s.animationName, duration: s.animationDuration };
    });
    expect(overlayAnim.name).toBe("enter");
    expect(overlayAnim.duration).toBe("0.15s");
  });
});

test.describe("S136/CK5 · the KPI accent-icon gradient tracks the accent (the inline-hex family)", () => {
  test("the dashboard's first KPI icon gradient follows the accent: the violet pair → the blue pair (RED pre-fix: the hardcoded inline hexes ignore the switch)", async ({ page }) => {
    // The accent-switch rides the REAL settings API (the S27 doctrine);
    // the restore rides the explicit finally PATCH. The first KPI block
    // ("Today's Progress") is the ACCENT slot — the blue/orange/pink
    // siblings are the fixed categorical palette measured on the reference
    // (only the first slot re-themes; that is the family's whole point).
    await page.request.patch(PREFERENCES, { data: { accentColor: "violet" } });
    await page.goto("/Dashboard");
    await page.waitForFunction(() => {
      const root = document.documentElement;
      return root.style.getPropertyValue("--sf-primary") === "139 92 246";
    });
    const firstIcon = page.locator('main [style*="linear-gradient(to right bottom"]').first();
    await expect(firstIcon).toBeVisible();
    const violetGradient = await firstIcon.evaluate((el) => getComputedStyle(el).backgroundImage);
    // The violet baseline: --sf-primary (violet-600) → --sf-primary-gradient-to
    // (indigo-600) — the reference's own measured value, byte-identical.
    expect(violetGradient).toContain("rgb(139, 92, 246)");
    expect(violetGradient).toContain("rgb(79, 70, 229)");

    try {
      await page.request.patch(PREFERENCES, { data: { accentColor: "blue" } });
      // The accent reaches the DOM through a fresh load (the AG11a pattern).
      await page.goto("/Dashboard");
      await page.waitForFunction(() => {
        const root = document.documentElement;
        return root.style.getPropertyValue("--sf-primary") === "59 130 246";
      });
      const firstIconBlue = page.locator('main [style*="linear-gradient(to right bottom"]').first();
      await expect(firstIconBlue).toBeVisible();
      const blueGradient = await firstIconBlue.evaluate((el) => getComputedStyle(el).backgroundImage);
      // RED pre-fix: the hardcoded rgb(139, 92, 246), rgb(79, 70, 229) pair
      // stays violet under the blue accent. GREEN: blue-500 → sky-600.
      expect(blueGradient).toContain("rgb(59, 130, 246)");
      expect(blueGradient).toContain("rgb(2, 132, 199)");
      expect(blueGradient).not.toContain("rgb(139, 92, 246)");

      // The categorical siblings stay FIXED under the blue accent (measured
      // on the reference — blue/orange/pink are not accent-semantic).
      const all = page.locator('main [style*="linear-gradient(to right bottom"]');
      const count = await all.count();
      expect(count).toBeGreaterThanOrEqual(4);
      const secondGradient = await all.nth(1).evaluate((el) => getComputedStyle(el).backgroundImage);
      expect(secondGradient).toContain("rgb(59, 130, 246)"); // the blue KPI stays blue-500→cyan-700
      expect(secondGradient).toContain("rgb(8, 145, 178)");
    } finally {
      await page.request.patch(PREFERENCES, { data: { accentColor: "violet" } });
    }
  });
});
