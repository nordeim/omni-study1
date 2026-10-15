import { expect, test } from "@playwright/test";

// S20 pins — the RUM panel v3 (docs/remediation-plan-session20.md):
//
// (1) THE EXPORT ROUND-TRIP: GET /api/rum/export answers text/csv with the
//     S13/S14 download header contract (attachment + RFC 5987 filename,
//     nosniff, private no-store) and the posted probe row rides the body.
//
// (2) THE ANON GATE: the export is an API route — 401 JSON for anonymous
//     callers (the AP-67 explicit EMPTY storageState lesson: a "manual"
//     context inherits the file-level storageState and is NOT anonymous).
//
// (3) THE TRENDS CONTRACT: GET /api/rum gains `trends` (per metric, the
//     most recent values, oldest → newest) — additive to the aggregate.
//
// (4) THE PANEL RENDERS THE V3 CHROME: sampled metric cards carry a
//     sparkline polyline; the Export CSV action link exists on the panel.
test.use({ storageState: "tests/e2e/.auth/user.json" });

test.describe("S20 the RUM export + trends", () => {
  test("GET /api/rum/export answers text/csv with the download header contract + the probe row", async ({
    request,
  }) => {
    const sessionId = `e2e-s20-${Date.now()}`;
    const post = await request.post("/api/rum", {
      data: {
        sessionId,
        events: [
          { metric: "LCP", value: 4111, rating: "poor", navigationType: "navigate", path: "/e2e-s20-probe" },
        ],
      },
    });
    expect(post.status()).toBe(200);

    const res = await request.get("/api/rum/export");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("text/csv");
    // The S13/S14 download contract: attachment (+ RFC 5987 filename),
    // no sniffing, no intermediary caching.
    expect(res.headers()["content-disposition"]).toContain("attachment");
    expect(res.headers()["content-disposition"]).toContain("filename=");
    expect(res.headers()["x-content-type-options"]).toBe("nosniff");
    expect(res.headers()["cache-control"]).toContain("private, no-store");

    const body = await res.text();
    expect(body.split("\n")[0]).toBe("metric,value,rating,navigationType,path,sessionId,createdAt");
    expect(body).toContain("LCP,4111,poor,navigate,/e2e-s20-probe");
  });

  test("GET /api/rum/export rejects anonymous callers (401)", async ({ browser }) => {
    // AP-67: an explicit EMPTY storageState overrides the inherited one.
    const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await ctx.newPage();
    const res = await page.request.get("/api/rum/export");
    expect(res.status()).toBe(401);
    await ctx.close();
  });

  test("GET /api/rum carries the trends field (additive aggregate extension)", async ({ request }) => {
    const sessionId = `e2e-s20-trends-${Date.now()}`;
    await request.post("/api/rum", {
      data: {
        sessionId,
        events: [
          { metric: "INP", value: 321, rating: "poor", navigationType: "navigate", path: "/e2e-s20-trends" },
        ],
      },
    });
    const res = await request.get("/api/rum");
    expect(res.status()).toBe(200);
    const body = (await res.json()) as { p75: Record<string, number>; trends: Record<string, number[]> };
    // The additive contract: the aggregate still answers p75 AND now trends.
    expect(Array.isArray(body.trends.INP)).toBe(true);
    expect(body.trends.INP).toContain(321);
  });

  test("the panel renders sparklines on sampled cards + the Export CSV action", async ({ page, request }) => {
    const sessionId = `e2e-s20-panel-${Date.now()}`;
    await request.post("/api/rum", {
      data: {
        sessionId,
        events: [
          { metric: "LCP", value: 4222, rating: "poor", navigationType: "navigate", path: "/e2e-s20-panel" },
        ],
      },
    });

    await page.goto("/rum");
    await expect(page.getByRole("heading", { name: "Performance Diagnostics" })).toBeVisible();

    // The cards region carries at least one sparkline polyline (sampled
    // metrics render their trend line; unsampled cards render none).
    const cards = page.getByRole("region", { name: "Core Web Vitals at p75" });
    await expect(cards.locator("polyline").first()).toBeVisible();

    // The export action: a real navigation link to the authed endpoint.
    await expect(page.locator('a[href="/api/rum/export"]')).toBeVisible();
  });
});
