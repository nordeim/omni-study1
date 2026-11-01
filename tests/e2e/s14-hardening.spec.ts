import { expect, test, type Route } from "@playwright/test";

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

  test("A0c: the offline banner computes the pinned amber hexes (S94/AU1 — the trap-10 closure)", async ({ page, context }) => {
    await page.goto("/Dashboard");
    await expect(page.getByRole("heading", { name: /^Good (morning|afternoon|evening)/ })).toBeVisible();

    await context.setOffline(true);
    const banner = page.getByRole("status").filter({ hasText: /offline/i });
    await expect(banner).toBeVisible({ timeout: 5000 });
    const cs = await banner.evaluate((el) => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, color: s.color, border: s.borderColor };
    });
    // The S94/AU1 pins: amber-200 #fde68a (border) and amber-800 #92400e
    // (ink) were UNPINN @theme steps — the banner serialized both through
    // v4-oklch and drifted 1–3 units/channel (trap-10, the AH3b class; the
    // amber-100 bg was already pinned and stays byte-identical). The exact
    // v3 hexes are what the @theme pin restores; the dark pair rides AU3a.
    expect(cs.border).toBe("rgb(253, 230, 138)"); // amber-200 #fde68a
    expect(cs.bg).toBe("rgb(254, 243, 199)"); // amber-100 #fef3c7 (pinned)
    expect(cs.color).toBe("rgb(146, 64, 14)"); // amber-800 #92400e

    await context.setOffline(false);
    await expect(banner).toHaveCount(0, { timeout: 5000 });
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

  // S120/BU16 — the page-level security headers. The app shipped NO
  // headers() block: the authenticated SPA was framable (clickjacking on
  // the destructive surfaces), no page-level nosniff, no Referrer-Policy.
  // The three baseline headers ride every route (HSTS is the TLS-at-app
  // posture's addition — the Docker posture terminates TLS upstream).
  test("S120/BU16: page responses carry nosniff + frame-ancestors DENY + Referrer-Policy", async ({ request }) => {
    const page = await request.get("/login");
    expect(page.status()).toBe(200);
    const headers = page.headers();
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    // The API route family carries them too (the block is global).
    const api = await request.get("/api/health");
    expect(api.headers()["x-content-type-options"]).toBe("nosniff");
    expect(api.headers()["x-frame-options"]).toBe("DENY");
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
    // S122/BW1: the held route is ABORTED (not just unrouted) — the
    // pre-fix finally released the in-flight request to the REAL server,
    // which only looked harmless because C1 (earlier in this file) had
    // already exhausted the demo user's AI budget; in isolation it fired
    // a real AI POST that persisted a probe row in the shared transcript
    // (the exact shared-mutable-e2e-state hazard the repo bans).
    let heldRoute: Route | undefined;
    await page.route("**/api/ai/chat", (route) => {
      heldRoute = route;
      /* held — never fulfills (aborted in finally per the S11 lesson) */
    });
    try {
      const composer = page.getByLabel("Message the assistant");
      await composer.fill("s14 hardening probe D2");
      await composer.press("Enter");
      await expect(pane).toHaveAttribute("aria-busy", "true", { timeout: 5000 });
    } finally {
      // Kill the in-flight request — the abort rejection is the real
      // busy-clearing path this pin asserts below.
      await heldRoute?.abort("failed");
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

// S124/BY1 — the gradeLevel clear round-trip at the wire. The Study Profile
// card ships a "Not set" option, but no valid payload could clear the stored
// grade: the UI mapped "none" → undefined (JSON.stringify drops the key, the
// route's sent-keys filter skips it) while the schema's enum rejected "".
// A user picked "Not set", saved, got the success toast — and the stored
// grade silently persisted. The "" clear form is now first-class.
test.describe("S124/BY1: the gradeLevel clear round-trip (the study-profile wire)", () => {
  test('PATCH gradeLevel "" clears the stored grade; a real value sets it (RED pre-fix: "" → 400)', async ({ request }) => {
    // The restore rides a finally: a RED-step failure must not leave a
    // mutated seeded field behind for later specs (the theme-spec lesson).
    try {
      // Set a real grade first (idempotent from the seeded "9th Grade").
      const set = await request.patch("/api/settings/preferences", {
        data: { gradeLevel: "10th Grade" },
      });
      expect(set.status()).toBe(200);
      const me1 = (await (await request.get("/api/auth/me")).json()) as { user: { gradeLevel?: string } };
      expect(me1.user.gradeLevel).toBe("10th Grade");

      // The clear leg — RED pre-fix: the enum 400s the empty string.
      const clear = await request.patch("/api/settings/preferences", {
        data: { gradeLevel: "" },
      });
      expect(clear.status()).toBe(200);
      const me2 = (await (await request.get("/api/auth/me")).json()) as { user: { gradeLevel?: string } };
      expect(me2.user.gradeLevel).toBe("");
    } finally {
      // Restore the seeded grade for later specs (the B3 restore convention).
      await request.patch("/api/settings/preferences", { data: { gradeLevel: "9th Grade" } });
    }
  });
});

// S124/BY9 — the avatarEmoji vocabulary at the wire. The schema accepted ANY
// ≤8-code-point string while the picker is pinned to 24 emojis — an arbitrary
// string stored and rendered as the avatar (React-escaped; the Settings grid
// then shows no selected tile).
test.describe("S124/BY9: the avatarEmoji vocabulary at the wire", () => {
  test("an unlisted avatar string 400s; a listed emoji persists (RED pre-fix: 200)", async ({ request }) => {
    const bogus = await request.patch("/api/settings/preferences", {
      data: { avatarEmoji: "sneaky" },
    });
    expect(bogus.status()).toBe(400); // RED pre-fix: 200
    const bogusBody = (await bogus.json()) as { error?: string };
    expect(bogusBody.error).toBeTruthy();

    const ok = await request.patch("/api/settings/preferences", {
      data: { avatarEmoji: "🎓" },
    });
    expect(ok.status()).toBe(200);
    const me = (await (await request.get("/api/auth/me")).json()) as { user: { avatarEmoji?: string } };
    expect(me.user.avatarEmoji).toBe("🎓");

    // Restore the seeded default (the initial-letter avatar) for later specs.
    await request.patch("/api/settings/preferences", { data: { avatarEmoji: "" } });
  });
});
