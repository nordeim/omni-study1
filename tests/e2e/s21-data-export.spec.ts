import { expect, test } from "@playwright/test";

// S21 pins — the full-data export (docs/remediation-plan-session21.md):
//
// (1) THE DOWNLOAD ROUND-TRIP: GET /api/export/data answers a versioned
//     JSON envelope with the S13/S14 download header contract
//     (attachment + RFC 5987 filename, nosniff, private no-store); the
//     seeded demo content rides the collections.
//
// (2) THE ANON API GATE: the export is an API route — 401 JSON for
//     anonymous callers (the AP-67 explicit EMPTY storageState lesson).
//
// (3) THE PAGE RENDERS: /export (server-gated) shows the per-collection
//     count grid + the Download JSON action; the metadata title rides
//     the layout template.
//
// (4) THE ANON PAGE REDIRECT: an anonymous visit to /export lands on
//     /login (the server-side gate — no panel chrome flash).
//
// (5) THE ZERO-NAV-LINKAGE GUARD: the shell stays /export-link-free
//     (the ADR-017 owner-surface pattern — the sidebar/drawer keep
//     exactly 20 links).
test.use({ storageState: "tests/e2e/.auth/user.json" });

test.describe("S21 the full-data export", () => {
  test("GET /api/export/data answers the versioned JSON envelope with the download header contract", async ({
    request,
  }) => {
    const res = await request.get("/api/export/data");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("application/json");
    // The S13/S14 download contract: attachment (+ RFC 5987 filename),
    // no sniffing, no intermediary caching.
    expect(res.headers()["content-disposition"]).toContain("attachment");
    expect(res.headers()["content-disposition"]).toContain("filename=");
    expect(res.headers()["content-disposition"]).toContain("studyflow-data-");
    expect(res.headers()["x-content-type-options"]).toBe("nosniff");
    expect(res.headers()["cache-control"]).toContain("private, no-store");

    const body = (await res.json()) as {
      format: string;
      version: number;
      exportedAt: string;
      user: { email: string };
      counts: Record<string, number>;
      data: Record<string, Array<{ title?: string }>>;
    };
    // The envelope identity (ADR-019).
    expect(body.format).toBe("studyflow-data-export");
    expect(body.version).toBe(1);
    expect(typeof body.exportedAt).toBe("string");
    expect(body.user.email).toBe("demo@studyflow.app");

    // The seeded demo content rides the collections (the seed's tasks).
    expect(body.data.tasks?.length).toBeGreaterThanOrEqual(5);
    const titles = (body.data.tasks ?? []).map((t) => t.title ?? "");
    expect(titles).toContain("Read chapter 4 — vectors");
    expect(titles).toContain("Return library books");

    // The secret guard, e2e-side: the hash never rides the download.
    expect(JSON.stringify(body)).not.toContain("passwordHash");
    // The excluded families never ride the export.
    expect(body.data).not.toHaveProperty("rumEvents");
    expect(body.data).not.toHaveProperty("verificationTokens");
    expect(body.data).not.toHaveProperty("passwordResetTokens");
  });

  test("GET /api/export/data rejects anonymous callers (401)", async ({ browser }) => {
    // AP-67: an explicit EMPTY storageState overrides the inherited one.
    const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await ctx.newPage();
    const res = await page.request.get("/api/export/data");
    expect(res.status()).toBe(401);
    await ctx.close();
  });

  test("the /export page renders the count grid + the Download JSON action", async ({ page }) => {
    await page.goto("/export");
    await expect(page.getByRole("heading", { name: "Export Your Data" })).toBeVisible();

    // The count grid: the collections summary (the seeded tasks chip).
    const grid = page.getByRole("region", { name: "What's included" });
    await expect(grid).toBeVisible();
    await expect(grid.getByText("Tasks", { exact: true })).toBeVisible();

    // The download action: a real navigation link to the authed endpoint.
    await expect(page.locator('a[href="/api/export/data"]')).toBeVisible();

    // The metadata title rides the layout's template.
    await expect(page).toHaveTitle(/Export Your Data/);
  });

  test("an anonymous visit to /export redirects to /login (the server gate)", async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await ctx.newPage();
    await page.goto("/export");
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: "Welcome to StudyFlow" })).toBeVisible();
    await ctx.close();
  });

  test("the shell stays /export-link-free (zero nav linkage)", async ({ page }) => {
    await page.goto("/Dashboard");
    await expect(page.getByRole("heading", { name: "Good ", exact: false })).toBeVisible();
    // No link ANYWHERE in the shell points at the owner-only surface.
    expect(await page.locator('a[href*="/export"]').count()).toBe(0);
    // The nav inventory stays exactly 20 links (the standing parity pin).
    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav.getByRole("link")).toHaveCount(20);
  });
});
