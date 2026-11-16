import { expect, test, type Page } from "@playwright/test";

/**
 * Sidebar-chrome axis parity pins — the consolidated sidebar home, the
 * 5th AXIS home (S201/EY).
 *
 * Split out of parity-session8.spec.ts (the S200 close's named next
 * candidate — "the S8-A Sidebar chrome [4 pins] as its largest remaining
 * pure cross-view family (its own future AXIS-home candidate)", executed
 * in the census-clean window the standing audit confirmed, the eleventh
 * consecutive clean window). The family's binding axis is the SIDEBAR
 * CHROME measured across the shell (the nav surface, not a view): the
 * reference's lucide nav-icon set, the active-nav gradient's avatarTo
 * stop, the untruncated brand tagline, and the reference's 36px collapse
 * button — every pin a computed-style port measured on the live
 * reference. The block moved here BYTE-FAITHFULLY, declaration order
 * preserved.
 *
 * The other parity-session8 families stay in their file (the boundary
 * doctrine, the S200 §2 record — see docs/remediation-plan-session201.md
 * for the full boundary ledger).
 *
 * The pins' contracts (unchanged by the move):
 *  - CHUNK 1 home (scripts/e2e-chunked-cert.sh) — the SAME chunk as
 *    the split source, so the write budgets hold by construction (the
 *    family issues ZERO writes — not even a click); the file sorts
 *    LAST in the chunk's alphabetical order — strictly MORE
 *    predecessors than the pins' old exposure inside parity-session8's
 *    first describe (the after-position direction, the S198 doctrine):
 *    every pin is a read-only computed-style assert on shell chrome
 *    whose state no predecessor can mutate (the accent derives from the
 *    user record — no chunk-1 file PATCHes the theme; the collapse
 *    preference lives in per-context localStorage, empty at start).
 *  - The full family map: docs/remediation-plan-session201.md.
 */


const hydrated = (page: Page) =>
  page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true");

test.describe("S8-A · Sidebar chrome", () => {
  test("nav icons match the reference's lucide set (6 swaps)", async ({ page }) => {
    await page.goto("/Dashboard");
    // The nav svg set only exists once the authed shell commits — the
    // --sf-primary wait resolves pre-paint (boot script), so gate on the
    // shell-level hydration marker (S8-A spec hygiene).
    await page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true");
    const icons = await page.locator("nav a svg").evaluateAll((svgs) =>
      svgs.map((s) => s.getAttribute("class") ?? ""),
    );
    expect(icons).toHaveLength(20);
    expect(icons[2]).toContain("lucide-square-check-big"); // Tasks
    expect(icons[3]).toContain("lucide-calendar"); // Calendar (no -days)
    expect(icons[3]).not.toContain("lucide-calendar-days");
    expect(icons[4]).toContain("lucide-calendar-days"); // Events
    expect(icons[8]).toContain("lucide-book-open"); // Notes
    expect(icons[14]).toContain("lucide-folder-open"); // Files
    expect(icons[16]).toContain("lucide-calculator"); // Math Solver
    expect(icons[16]).not.toContain("lucide-square-radical");
  });

  test("active nav gradient ends at indigo-500 (avatarTo), not violet-600", async ({ page }) => {
    await page.goto("/Dashboard");
    await hydrated(page);
    const active = page.locator('nav a[aria-current="page"] > span').first();
    const bg = await active.evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(bg).toContain("rgba(139, 92, 246, 0.1)"); // violet-500 stop
    expect(bg).toContain("rgba(99, 102, 241, 0.1)"); // indigo-500 stop
    expect(bg).not.toContain("rgba(124, 58, 237");
  });

  test("brand tagline never truncates", async ({ page }) => {
    await page.goto("/Dashboard");
    await hydrated(page);
    const tag = page.getByText("Your study companion", { exact: true });
    const cs = await tag.evaluate((el) => {
      const s = getComputedStyle(el);
      return { overflow: s.overflow, textOverflow: s.textOverflow, whiteSpace: s.whiteSpace };
    });
    expect(cs.textOverflow).toBe("clip");
    expect(cs.overflow).not.toBe("hidden");
  });

  test("collapse button is the reference's h-9 w-9 rounded-lg", async ({ page }) => {
    await page.goto("/Dashboard");
    await hydrated(page);
    const btn = page.locator('button[aria-label="Collapse sidebar"]');
    const cs = await btn.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return { w: r.width, h: r.height, radius: s.borderRadius };
    });
    // The reference's own button flex-shrinks to 34.2×36 inside the header
    // row — accept the 34–36 band (measured live, S8-A).
    expect(cs.w).toBeGreaterThanOrEqual(34);
    expect(cs.w).toBeLessThanOrEqual(36);
    expect(cs.h).toBeGreaterThanOrEqual(34);
    expect(cs.h).toBeLessThanOrEqual(36);
    expect(cs.radius).toBe("8px"); // rounded-lg
  });
});
