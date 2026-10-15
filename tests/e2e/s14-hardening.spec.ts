import { expect, test } from "@playwright/test";

// S14 hardening pins — the ambient states the per-request specs never
// exercise. Families from docs/remediation-plan-session14.md:
//   A0   a global offline banner (role=status) appears when the context goes
//        offline and disappears when back online; ABSENT while online
//        (light-mode byte-parity preserved by construction)
//   A0b  a transport failure toasts the human offline message (not raw
//        "Failed to fetch", not the generic unavailable fallback)
//   B3   the settings route rejects a whitespace-only display name (400) and
//        stores a padded name trimmed
//   C1   the AI route enforces a per-user budget (20/15 min): 21 rapid
//        invalid POSTs -> 20x 400 then 429 with Retry-After
//   C3   the file download response carries X-Content-Type-Options: nosniff
//        and Cache-Control: private, no-store
//   D1/D2 the AI transcript is an aria-live=polite region and toggles
//        aria-busy while a request is held
//   D3   the math solver's solution card is an aria-live=polite region

test.describe("connectivity banner (S14-A0)", () => {
  test("A0: the offline banner appears offline, disappears online, and is ABSENT while online", async ({ page, context }) => {
    await page.goto("/Dashboard");
    // The dashboard h1 is the time-aware greeting — assert on the app shell.
    await expect(page.locator("main")).toBeVisible();
    await expect(page.getByRole("heading", { name: /^Good (morning|afternoon|evening)/ })).toBeVisible();

    // Byte-parity guard: nothing offline-themed in the DOM while online.
    await expect(page.locator('[role="status"][data-offline], [data-offline]')).toHaveCount(0);
    await expect(page.getByText(/offline/i)).toHaveCount(0);

    await context.setOffline(true);
    // The banner is a role=status surface announcing the state change.
    await expect(page.getByRole("status").filter({ hasText: /offline/i })).toBeVisible({ timeout: 5000 });

    await context.setOffline(false);
    await expect(page.getByRole("status").filter({ hasText: /offline/i })).toHaveCount(0, { timeout: 5000 });
  });

  test("A0b: an offline AI send toasts the human offline message", async ({ page, context }) => {
    await page.goto("/AIAssistant");
    await expect(page.getByRole("heading", { name: "AI Study Assistant" })).toBeVisible();

    const composer = page.getByLabel("Message the assistant");
    await composer.fill("s14 hardening probe A0b");
    await context.setOffline(true);
    try {
      await composer.press("Enter");
      // The transport failure maps to the human message (S14-A0b seam).
      await expect(page.getByText(/appear to be offline/i)).toBeVisible({ timeout: 6000 });
      // And the S13 rollback still owns the composer state.
      await expect
        .poll(() => composer.inputValue(), { timeout: 6000 })
        .toBe("s14 hardening probe A0b");
    } finally {
      await context.setOffline(false);
    }
  });
});

test.describe("settings display-name guard (S14-B3)", () => {
  test("B3: whitespace-only name is rejected 400; a padded name is stored trimmed", async ({ request }) => {
    const blank = await request.patch("/api/settings/preferences", {
      data: { name: "   " },
    });
    expect(blank.status()).toBe(400);
    const blankBody = (await blank.json()) as { error?: string };
    expect(blankBody.error).toContain("Display name");

    const padded = await request.patch("/api/settings/preferences", {
      data: { name: "  S14 Probe Name  " },
    });
    expect(padded.status()).toBe(200);
    const me = await request.get("/api/auth/me");
    const { user } = (await me.json()) as { user: { name?: string } };
    expect(user.name).toBe("S14 Probe Name");

    // Restore the demo name for later specs.
    await request.patch("/api/settings/preferences", { data: { name: "Demo Student" } });
  });
});

test.describe("AI route rate limit (S14-C1)", () => {
  test("C1: 21 rapid invalid AI POSTs -> 20x 400 then 429 with Retry-After", async ({ request }) => {
    const statuses: number[] = [];
    for (let i = 0; i < 21; i++) {
      const res = await request.post("/api/ai/chat", {
        data: { messages: "not-an-array" },
      });
      statuses.push(res.status());
    }
    // First 20: the invalid payload 400s (the limiter sits before validation).
    expect(statuses.slice(0, 20)).toEqual(Array(20).fill(400));
    // The 21st: the budget is exhausted -> 429.
    const blocked = statuses[20]!;
    expect(blocked).toBe(429);

    // Retry-After header on the 429 (probe once more to read headers).
    const again = await request.post("/api/ai/chat", { data: { messages: "not-an-array" } });
    expect(again.status()).toBe(429);
    expect(again.headers()["retry-after"]).toBeTruthy();

    // The limiter is AFTER auth: unauthenticated requests still 401.
    const anon = await request.post("/api/ai/chat", {
      data: { messages: "not-an-array" },
      headers: { cookie: "" },
      maxRedirects: 0,
    });
    expect(anon.status()).toBe(401);
  });
});

test.describe("download hardening headers (S14-C3)", () => {
  test("C3: file downloads carry nosniff + private no-store", async ({ request }) => {
    // Upload a probe file via multipart.
    const up = await request.post("/api/files", {
      multipart: {
        file: {
          name: "s14-header-probe.txt",
          mimeType: "text/plain",
          buffer: Buffer.from("s14 header probe"),
        },
      },
    });
    expect(up.status()).toBe(201);
    const created = (await up.json()) as { id: string };

    try {
      const dl = await request.get(`/api/files/${created.id}`);
      expect(dl.status()).toBe(200);
      const headers = dl.headers();
      expect(headers["x-content-type-options"]).toBe("nosniff");
      expect(headers["cache-control"]).toContain("no-store");
      // The S13 disposition seam is still intact alongside the new headers.
      expect(headers["content-disposition"]).toContain("attachment");
    } finally {
      await request.delete(`/api/files/${created.id}`);
    }
  });
});

test.describe("AI-surface live regions (S14-D1/D2/D3)", () => {
  test("D1/D2: the transcript is aria-live=polite and toggles aria-busy while a request is held", async ({ page }) => {
    await page.goto("/AIAssistant");
    await expect(page.getByRole("heading", { name: "AI Study Assistant" })).toBeVisible();

    // D1 — the message pane (the sf-scroll container holding the <ul>) is a
    // polite live region.
    const pane = page.locator("main .sf-scroll").first();
    await expect(pane).toHaveAttribute("aria-live", "polite");
    await expect(pane).toHaveAttribute("aria-busy", "false");

    // D2 — hold the chat route, send, and watch aria-busy flip true.
    await page.route("**/api/ai/chat", () => {
      /* held — never fulfills (unrouted in finally per the S11 lesson) */
    });
    try {
      const composer = page.getByLabel("Message the assistant");
      await composer.fill("s14 hardening probe D2");
      await composer.press("Enter");
      await expect(pane).toHaveAttribute("aria-busy", "true", { timeout: 5000 });
    } finally {
      await page.unroute("**/api/ai/chat");
    }
    // Busy clears once the route is gone and the send settles/rejects.
    await expect(pane).toHaveAttribute("aria-busy", "false", { timeout: 10000 });
  });

  test("D3: the math solver's solution card is aria-live=polite", async ({ page }) => {
    await page.goto("/MathSolver");
    await expect(page.getByRole("heading", { name: "Math Solver" })).toBeVisible();

    const solutionCard = page.locator('[aria-label="Math solution"]');
    await expect(solutionCard).toHaveAttribute("aria-live", "polite");
    await expect(solutionCard).toHaveAttribute("aria-busy", "false");
  });
});
