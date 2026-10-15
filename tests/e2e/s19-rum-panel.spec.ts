import { expect, test } from "@playwright/test";

// S19 pins — the RUM diagnostics panel (docs/remediation-plan-session19.md):
//
// (1) THE ANON GATE: /rum is a server-gated route — an unauthenticated
//     visit redirects to /login BEFORE any render (no client flash).
//
// (2) THE PANEL RENDERS THE FIELD DATA: a deterministic batch POSTed via
//     the API surfaces in the metric cards and the recent-samples table;
//     the explainer + samples line render; the document title carries the
//     page's metadata.
//
// (3) THE ZERO-NAV-LINKAGE GUARD: the panel is URL-direct (owner-facing
//     diagnostics) — NO surface links to /rum. The sidebar/drawer are
//     parity-pinned (20 links); the shell must stay link-free.
test.use({ storageState: "tests/e2e/.auth/user.json" });

test.describe("S19 the RUM diagnostics panel", () => {
  test("/rum redirects anonymous visitors to /login (the server gate)", async ({ browser }) => {
    // NOTE (Playwright lesson): browser.newContext() inherits the file-level
    // test.use({ storageState }) — a "manual" context is NOT anonymous. An
    // explicit EMPTY storageState forces the clean cookie jar.
    const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await ctx.newPage();
    await page.goto("/rum");
    await expect(page).toHaveURL(/\/login(\?|$)/);
    await ctx.close();
  });

  test("the panel renders the posted field data (cards + recent table + chrome)", async ({ page, request }) => {
    // Deterministic data: POST a batch with recognizable values, then the
    // panel must surface it. The recent table is most-recent-first and
    // carries the exact posted value; the cards carry the formatted p75s
    // (the p75 window is shared with the suite's own beacon rows, so the
    // card pin asserts the SURFACE renders every metric card with its
    // label, not the exact p75 number — the p75 math is unit-pinned).
    const sessionId = `e2e-s19-${Date.now()}`;
    const batch = {
      sessionId,
      events: [
        { metric: "LCP", value: 4001, rating: "poor", navigationType: "navigate", path: "/e2e-s19-probe" },
        { metric: "CLS", value: 0.26, rating: "poor", navigationType: "navigate", path: "/e2e-s19-probe" },
        { metric: "TTFB", value: 799, rating: "good", navigationType: "navigate", path: "/e2e-s19-probe" },
      ],
    };
    const post = await request.post("/api/rum", { data: batch });
    expect(post.status()).toBe(200);

    await page.goto("/rum");
    // The panel's chrome: the heading + the p75 explainer.
    await expect(page.getByRole("heading", { name: "Performance Diagnostics" })).toBeVisible();
    await expect(page.getByText(/p75/i).first()).toBeVisible();

    // Every metric card renders with its human label (scoped to the cards
    // region — the recent table's Metric column repeats the same labels).
    const cards = page.getByRole("region", { name: "Core Web Vitals at p75" });
    for (const label of [
      "Time to First Byte",
      "First Contentful Paint",
      "Largest Contentful Paint",
      "Cumulative Layout Shift",
      "Interaction to Next Paint",
    ]) {
      await expect(cards.getByText(label, { exact: true })).toBeVisible();
    }

    // The recent table carries the probe row (the exact posted value rides
    // a table CELL — the card's p75 window is shared with the suite's own
    // beacon rows and is not deterministic).
    await expect(page.getByRole("cell", { name: "4001 ms", exact: true }).first()).toBeVisible();
    await expect(page.getByText("/e2e-s19-probe").first()).toBeVisible();

    // The document title rides the layout's template.
    await expect.poll(() => page.title()).toBe("Performance Diagnostics · StudyFlow");
  });

  test("the panel's own refresh re-fetches the aggregate", async ({ page, request }) => {
    const sessionId = `e2e-s19-refresh-${Date.now()}`;
    await request.post("/api/rum", {
      data: {
        sessionId,
        events: [
          { metric: "INP", value: 501, rating: "poor", navigationType: "navigate", path: "/e2e-s19-refresh" },
        ],
      },
    });
    await page.goto("/rum");
    await expect(page.getByRole("heading", { name: "Performance Diagnostics" })).toBeVisible();
    await page.getByRole("button", { name: /refresh/i }).click();
    await expect(page.getByText("/e2e-s19-refresh").first()).toBeVisible();
  });

  test("the shell links to /rum NOWHERE (zero-nav-linkage guard)", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1500);
    const rumLinks = await page.evaluate(() => document.querySelectorAll('a[href="/rum"]').length);
    expect(rumLinks).toBe(0);
  });
});
