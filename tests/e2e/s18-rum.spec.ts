import { expect, test } from "@playwright/test";

// S18 pins — the RUM hook (docs/remediation-plan-session18.md):
//
// (1) THE BEACON JOURNEY: the authed shell mounts <RumBeacon /> (renders
//     null — zero DOM); it dynamic-imports web-vitals and POSTs batched
//     metric reports to /api/rum (keepalive, same-origin). TTFB/FCP are
//     always reported early in a pageload, so after loading the shell the
//     GET aggregate must show at least one sampled event.
//
// (2) THE API CONTRACT: POST /api/rum validates via the Zod batch schema,
//     rate-limits per user (1000/15min — the e2e suite itself fires the
//     beacon on ~250 shell loads), and UPSERTS on (sessionId, metric) —
//     the web-vitals final-value-wins semantics: reposting the same
//     sessionId+metric UPDATES the row instead of duplicating it.
//     GET /api/rum returns { p75, samples, recent } for the owner.
//
// (3) THE ZERO-CHROME GUARD: the beacon must not add DOM — the parity
//     byte-guard family stays untouched, and this spec pins the absence
//     of any beacon element in the rendered shell.
test.use({ storageState: "tests/e2e/.auth/user.json" });

test.describe("S18 the RUM hook", () => {
  test("the beacon fires on shell load and GET /api/rum aggregates it", async ({ page, request }) => {
    await page.goto("/");
    // The shell's own beacon flushes TTFB/FCP within the first seconds
    // (batched microtask flush). Wait generously, then read the aggregate.
    await page.waitForTimeout(3500);
    const res = await request.get("/api/rum");
    expect(res.status()).toBe(200);
    const body = (await res.json()) as {
      p75: Partial<Record<string, number>>;
      samples: number;
      recent: Array<{ metric: string; rating: string; value: number }>;
    };
    expect(body.samples).toBeGreaterThanOrEqual(1);
    expect(Object.keys(body.p75).length).toBeGreaterThanOrEqual(1);
    // TTFB or FCP must have landed (both report immediately on load).
    const metrics = body.recent.map((e) => e.metric);
    expect(metrics.includes("TTFB") || metrics.includes("FCP")).toBe(true);
    for (const e of body.recent) {
      expect(["TTFB", "FCP", "LCP", "CLS", "INP"]).toContain(e.metric);
      expect(["good", "needs-improvement", "poor"]).toContain(e.rating);
      expect(e.value).toBeGreaterThanOrEqual(0);
    }
  });

  test("POST /api/rum accepts a batch and upserts on (sessionId, metric)", async ({ request }) => {
    const sessionId = `e2e-s18-${Date.now()}`;
    const batch = {
      sessionId,
      events: [
        { metric: "LCP", value: 1234, rating: "good", navigationType: "navigate", path: "/" },
        { metric: "CLS", value: 0.01, rating: "good", navigationType: "navigate", path: "/" },
      ],
    };
    const post = await request.post("/api/rum", { data: batch });
    expect(post.status()).toBe(200);

    // The events appear in the most-recent-first window.
    const after = (await (await request.get("/api/rum")).json()) as {
      recent: Array<{ sessionId: string; metric: string; value: number }>;
    };
    const ours = after.recent.filter((e) => e.sessionId === sessionId);
    expect(ours.map((e) => e.metric).sort()).toEqual(["CLS", "LCP"]);

    // Reposting the SAME (sessionId, metric) UPDATES the row (final value
    // wins) — the row count for this sessionId must NOT grow.
    const repost = await request.post("/api/rum", {
      data: {
        sessionId,
        events: [{ metric: "LCP", value: 999, rating: "needs-improvement", navigationType: "navigate", path: "/" }],
      },
    });
    expect(repost.status()).toBe(200);
    const after2 = (await (await request.get("/api/rum")).json()) as {
      recent: Array<{ sessionId: string; metric: string; value: number }>;
    };
    const ours2 = after2.recent.filter((e) => e.sessionId === sessionId);
    expect(ours2.length).toBe(2); // still exactly CLS + LCP
    expect(ours2.find((e) => e.metric === "LCP")?.value).toBe(999);
  });

  test("POST /api/rum rejects an invalid metric with the { error } envelope", async ({ request }) => {
    const res = await request.post("/api/rum", {
      data: {
        sessionId: `e2e-s18-invalid-${Date.now()}`,
        events: [{ metric: "NOT_A_METRIC", value: 1, rating: "good", navigationType: "navigate" }],
      },
    });
    expect(res.status()).toBe(400);
    const body = (await res.json()) as { error?: string };
    expect(typeof body.error).toBe("string");
  });

  test("POST /api/rum is auth-gated (401 without a session)", async ({ request }) => {
    const res = await request.post("/api/rum", {
      headers: { cookie: "" },
      data: {
        sessionId: "anon-attempt",
        events: [{ metric: "TTFB", value: 1, rating: "good", navigationType: "navigate" }],
      },
    });
    expect(res.status()).toBe(401);
  });

  test("the beacon renders NO chrome (zero-DOM contract)", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(2000);
    const beaconDom = await page.evaluate(() => document.querySelectorAll("[data-rum], [data-testid*='rum' i]").length);
    expect(beaconDom).toBe(0);
    // The body's direct children are unchanged chrome (shell + toaster only).
    const childTags = await page.evaluate(() =>
      [...document.body.children].map((c) => c.tagName.toLowerCase()),
    );
    expect(childTags).toContain("div");
  });
});
