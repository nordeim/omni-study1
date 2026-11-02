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

// S125/BZ6 — the grade range guard at the wire. The schema capped each leg
// independently (score 0..1000, maxScore 1..1000) but never checked the
// pair: 900/100 persisted and rendered 900%. The CREATE shape now carries
// the .check(); the PATCH legs go through the checkGradeRangeMerge
// beforeWrite seam (zod4's .partial() injects the maxScore default, so a
// schema-side update check would read the injected denominator — the sent
// pair must be compared against the STORED row).
test.describe("S125/BZ6: the grade score ≤ maxScore guard at the wire", () => {
  test("an inverted create pair 400s; the single-leg PATCH legs guard against the stored row (RED pre-fix: both write)", async ({ request }) => {
    const stamp = Date.now();
    // Both-legs create, inverted: 900 out of 100 → 400 (RED pre-fix: 201).
    const bad = await request.post("/api/grades", {
      data: { title: `BZ6 bad ${stamp}`, score: 900, maxScore: 100 },
    });
    expect(bad.status()).toBe(400);

    // A legal create to PATCH against (cleaned up in the finally below).
    const created = await request.post("/api/grades", {
      data: { title: `BZ6 ok ${stamp}`, score: 85, maxScore: 100 },
    });
    expect(created.status()).toBe(201);
    const row = (await created.json()) as { id: string };
    try {
      // Single-leg maxScore PATCH below the stored score → 400
      // (RED pre-fix: 200 — the 85/50 row persists and renders 170%).
      const shrink = await request.patch(`/api/grades/${row.id}`, {
        data: { maxScore: 50 },
      });
      expect(shrink.status()).toBe(400);
      // Single-leg score PATCH above the stored maxScore → 400
      // (RED pre-fix: 200).
      const inflate = await request.patch(`/api/grades/${row.id}`, {
        data: { score: 900 },
      });
      expect(inflate.status()).toBe(400);
      // The legal single-leg pairs still write.
      const ok = await request.patch(`/api/grades/${row.id}`, {
        data: { score: 90 },
      });
      expect(ok.status()).toBe(200);
      const legal = await request.patch(`/api/grades/${row.id}`, {
        data: { score: 900, maxScore: 1000 },
      });
      expect(legal.status()).toBe(200);
    } finally {
      await request.delete(`/api/grades/${row.id}`);
    }
  });
});

// S125/BZ8 — files/link's create response carries the SAME metadata shape
// as the LIST and the files POST (S82/AI6: "the base64 data column never
// rides a JSON response body"). Pre-fix the route returned the FULL row —
// `data` is null for links so nothing leaked, but the shape drifted from
// the documented contract.
test.describe("S125/BZ8: the files/link create response shape", () => {
  test("a link create answers the metadata shape — no data key (RED pre-fix: the full row)", async ({ request }) => {
    const stamp = Date.now();
    const res = await request.post("/api/files/link", {
      data: { name: `BZ8 link ${stamp}`, url: `https://example.com/bz8-${stamp}` },
    });
    expect(res.status()).toBe(201);
    const body = (await res.json()) as { id?: string; name?: string; data?: unknown };
    // RED pre-fix: the full row carries data: null.
    expect(body).not.toHaveProperty("data");
    expect(body.name).toBe(`BZ8 link ${stamp}`);
    // Cleanup: the created link row.
    if (body.id) await request.delete(`/api/files/${body.id}`);
  });
});

// S125/BZ5 — the factory write budget. Only login-family, upload, AI,
// export/import, and rum carried checkRateLimit; every
// makeCollectionRoutes POST (16 routes) was unthrottled — an authenticated
// script grew the single-node SQLite at line rate (the exact rationale
// S118/BS3 documented for uploads). The factory POST now enforces
// `write:${user.id}` 600/15-min (after auth, BEFORE readJson — the C1
// convention; the limiter after auth keeps anon requests 401).
//
// The exhaustion leg rides a FRESH REGISTERED USER (the S17/S25 convention
// — the demo user is never mutated): playwright runs spec files
// alphabetically, so s14-hardening runs BEFORE tasks.spec and theme-system
// in this chunk — exhausting the DEMO user's write budget here would 429
// every later create in the chunk (the first cert run's six collateral
// tasks.spec failures, the exact mid-flight-collision class). The fresh
// user's budget is its own; the demo user's stays clean. Self-calibrating:
// POST until the budget trips (cap 620), so the pin never depends on a
// count. The exhausted user + its ~600 scratch rows die with the chunk's
// db/e2e.db (the per-chunk rm; no cleanup API can run under the 429).
// The register rides a distinct TEST-NET client IP (the s25 convention —
// the suite's loopback register budget is at its 10/IP cap).
test.describe("S125/BZ5: the factory write budget (600/15-min)", () => {
  test("rapid valid creates exhaust to 429 + Retry-After; anon still 401s (RED pre-fix: 620x 201, never 429)", async ({ request }) => {
    test.setTimeout(180_000);
    const stamp = Date.now();
    const email = `s125-bz5-${stamp}@studyflow.app`;
    // The fresh user rides THIS test's request fixture: the login REPLACES
    // the jar's demo cookie for this test only (each test gets a fresh jar
    // from the storageState, so the later specs' demo session is intact).

    // Register + verify + sign in the throwaway user (the s25 pattern).
    const reg = await request.post("/api/auth/register", {
      headers: { "x-forwarded-for": "192.0.2.125" },
      data: { email, password: "Fresh1234!", name: "S125 BZ5 Probe" },
    });
    expect(reg.ok(), `register failed: ${reg.status()}`).toBe(true);
    const { code } = (await reg.json()) as { code: string };
    const verify = await request.post("/api/auth/verify-email", {
      headers: { "x-forwarded-for": "192.0.2.125" },
      data: { email, code },
    });
    expect(verify.ok(), `verify failed: ${verify.status()}`).toBe(true);
    const login = await request.post("/api/auth/login", {
      headers: { "x-forwarded-for": "192.0.2.125" },
      data: { email, password: "Fresh1234!" },
    });
    expect(login.ok(), `login failed: ${login.status()}`).toBe(true);

    // Exhaust the FRESH user's write budget (self-calibrating to the 429).
    let tripped = false;
    for (let i = 0; i < 620; i++) {
      const res = await request.post("/api/tasks", {
        data: { title: `BZ5 write ${stamp} ${i}` },
      });
      if (res.status() === 429) {
        expect(res.headers()["retry-after"]).toBeTruthy();
        tripped = true;
        break;
      }
      // The budget never interferes with legitimate flows before exhaust.
      expect(res.status()).toBe(201);
    }
    // RED pre-fix: the loop ran 620 all-201 iterations and never tripped.
    expect(tripped).toBe(true);
    // The limiter sits AFTER auth: unauthenticated requests still 401.
    const anon = await request.post("/api/tasks", {
      data: { title: "anon" },
      headers: { cookie: "" },
      maxRedirects: 0,
    });
    expect(anon.status()).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// S126/CA1 · the AI transcript GET serves the NEWEST 500 (the s126
// persistence audit's B-M1): the route read `orderBy createdAt asc, take
// 500` — an ascending sort capped at 500 selects the OLDEST window, so past
// 500 rows every post-send refresh REPLACED the store with a stale window
// and the just-sent exchange vanished. The calculator route already shipped
// the correct form (desc + take + reverse). The pin rides a FRESH TEST-NET
// user (the BZ5 lesson — the demo user is never mutated): import 505
// chatMessages with strictly-increasing createdAt, then GET the transcript.
// ---------------------------------------------------------------------------
test.describe("S126/CA1 · the AI transcript window is the newest 500", () => {
  test("505 imported messages → GET answers 500, the NEWEST window (RED pre-fix: the OLDEST 500)", async ({ request }) => {
    test.setTimeout(120_000);
    const stamp = Date.now();
    const email = `s126-ca1-${stamp}@studyflow.app`;
    const ip = "192.0.2.126";

    const reg = await request.post("/api/auth/register", {
      headers: { "x-forwarded-for": ip },
      data: { email, password: "Fresh1234!", name: "S126 CA1 Probe" },
    });
    expect(reg.ok(), `register failed: ${reg.status()}`).toBe(true);
    const { code } = (await reg.json()) as { code: string };
    const verify = await request.post("/api/auth/verify-email", {
      headers: { "x-forwarded-for": ip },
      data: { email, code },
    });
    expect(verify.ok()).toBe(true);
    const login = await request.post("/api/auth/login", {
      headers: { "x-forwarded-for": ip },
      data: { email, password: "Fresh1234!" },
    });
    expect(login.ok()).toBe(true);

    // 505 messages, createdAt strictly increasing — the newest 500 are
    // rows 5..504; the oldest 5 are the ones a correct window drops.
    const base = Date.now() - 505_000;
    const chatMessages = Array.from({ length: 505 }, (_, i) => ({
      id: `s126-ca1-msg-${i}`,
      role: i % 2 === 0 ? "user" : "assistant",
      content: `CA1 window probe ${i}`,
      surface: "assistant",
      createdAt: new Date(base + i * 1000).toISOString(),
      updatedAt: new Date(base + i * 1000).toISOString(),
    }));
    const res = await request.post("/api/import/data", {
      data: {
        format: "studyflow-data-export",
        version: 1,
        exportedAt: "2026-11-02T00:00:00.000Z",
        user: { id: "u-ca1", email, name: "S126 CA1 Probe" },
        counts: {},
        data: { chatMessages },
      },
    });
    expect(res.ok(), `import failed: ${res.status()}`).toBe(true);

    const messages = (await (await request.get("/api/ai/messages")).json()) as Array<{
      id: string;
    }>;
    // RED pre-fix: length 500 but the OLDEST window (row[0] = msg-0).
    expect(messages.length).toBe(500);
    expect(messages[0].id, "the window must start at the newest-500 boundary").toBe(
      "s126-ca1-msg-5",
    );
    expect(messages[499].id).toBe("s126-ca1-msg-504");
    expect(messages.some((m) => m.id === "s126-ca1-msg-0")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// S126/CA5 · the factory collection lists serve the NEWEST 500 (the s126
// persistence audit's B-L1/B-M1 note): the BZ13 `take: 500` shipped on the
// ASCENDING orderBy — the same oldest-window consequence on all 16
// collection routes. The fix mirrors CA1: fetch desc + take, reverse to the
// configured asc presentation, id-tiebreak. Fresh TEST-NET user, 505 tasks.
// ---------------------------------------------------------------------------
test.describe("S126/CA5 · the factory list window is the newest 500", () => {
  test("505 imported tasks → GET /api/tasks answers 500, the NEWEST window (RED pre-fix: the OLDEST 500)", async ({ request }) => {
    test.setTimeout(120_000);
    const stamp = Date.now();
    const email = `s126-ca5-${stamp}@studyflow.app`;
    const ip = "192.0.2.127";

    const reg = await request.post("/api/auth/register", {
      headers: { "x-forwarded-for": ip },
      data: { email, password: "Fresh1234!", name: "S126 CA5 Probe" },
    });
    expect(reg.ok(), `register failed: ${reg.status()}`).toBe(true);
    const { code } = (await reg.json()) as { code: string };
    const verify = await request.post("/api/auth/verify-email", {
      headers: { "x-forwarded-for": ip },
      data: { email, code },
    });
    expect(verify.ok()).toBe(true);
    const login = await request.post("/api/auth/login", {
      headers: { "x-forwarded-for": ip },
      data: { email, password: "Fresh1234!" },
    });
    expect(login.ok()).toBe(true);

    const base = Date.now() - 505_000;
    const tasks = Array.from({ length: 505 }, (_, i) => ({
      id: `s126-ca5-task-${i}`,
      title: `CA5 window probe ${i}`,
      completed: false,
      createdAt: new Date(base + i * 1000).toISOString(),
      updatedAt: new Date(base + i * 1000).toISOString(),
    }));
    const res = await request.post("/api/import/data", {
      data: {
        format: "studyflow-data-export",
        version: 1,
        exportedAt: "2026-11-02T00:00:00.000Z",
        user: { id: "u-ca5", email, name: "S126 CA5 Probe" },
        counts: {},
        data: { tasks },
      },
    });
    expect(res.ok(), `import failed: ${res.status()}`).toBe(true);

    const list = (await (await request.get("/api/tasks")).json()) as Array<{
      id: string;
      title: string;
    }>;
    // RED pre-fix: length 500 but the OLDEST window (row[0] = task-0).
    expect(list.length).toBe(500);
    expect(list[0].id, "the window must start at the newest-500 boundary").toBe(
      "s126-ca5-task-5",
    );
    expect(list[499].id).toBe("s126-ca5-task-504");
    expect(list.some((t) => t.id === "s126-ca5-task-0")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// S126/CA2 · the import route rejects empty ids and null collections (the
// s126 persistence audit's B-M2): the route's inline validator checked only
// `typeof id === "string"` — an `id: ""` row imported and minted a row with
// an empty-string primary key no /api/[collection]/[id] route can address,
// while the unit-pinned seam (parseImportEnvelope) rejected it — twin
// validators that had drifted. The fix: one shared row-id validator + the
// null-collection leg merged into the array check. Fresh TEST-NET user (the
// RED run's residue stays on the disposable account).
// ---------------------------------------------------------------------------
test.describe("S126/CA2 · the import rejects empty ids and null collections", () => {
  test("an id:\"\" row 400s and a null collection 400s (RED pre-fix: 200 + an empty-PK row mints)", async ({ request }) => {
    test.setTimeout(120_000);
    const stamp = Date.now();
    const email = `s126-ca2-${stamp}@studyflow.app`;
    const ip = "192.0.2.128";

    const reg = await request.post("/api/auth/register", {
      headers: { "x-forwarded-for": ip },
      data: { email, password: "Fresh1234!", name: "S126 CA2 Probe" },
    });
    expect(reg.ok(), `register failed: ${reg.status()}`).toBe(true);
    const { code } = (await reg.json()) as { code: string };
    const verify = await request.post("/api/auth/verify-email", {
      headers: { "x-forwarded-for": ip },
      data: { email, code },
    });
    expect(verify.ok()).toBe(true);
    const login = await request.post("/api/auth/login", {
      headers: { "x-forwarded-for": ip },
      data: { email, password: "Fresh1234!" },
    });
    expect(login.ok()).toBe(true);

    const envelope = (data: Record<string, unknown>) => ({
      format: "studyflow-data-export",
      version: 1,
      exportedAt: "2026-11-02T00:00:00.000Z",
      user: { id: "u-ca2", email, name: "S126 CA2 Probe" },
      counts: {},
      data,
    });

    // The empty-id row: 400 (RED pre-fix: 200, created 1 — a row no
    // detail/update/delete route can ever address).
    const emptyId = await request.post("/api/import/data", {
      data: envelope({
        tasks: [
          {
            id: "",
            title: "CA2 empty-id probe",
            createdAt: "2026-11-01T00:00:00.000Z",
            updatedAt: "2026-11-01T00:00:00.000Z",
          },
        ],
      }),
    });
    expect(emptyId.status()).toBe(400);

    // The null collection: 400 — a null block is not an array (the seam's
    // contract; RED pre-fix: silently skipped with a 200).
    const nullCollection = await request.post("/api/import/data", {
      data: envelope({ tasks: null }),
    });
    expect(nullCollection.status()).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// S126/CA8 · the input placeholder AA guard (the s126 shell audit's A-L4,
// HONESTLY RESOLVED): the audit flagged text-muted-foreground as ≈#9ca3af
// (2.5:1) — but the computed truth is hsl(220 9% 46%) = rgb(107,114,128) =
// gray-500 = 4.82:1, ALREADY AA-compliant. The auditor trusted the input's
// own "gray-400 placeholders" comment over the computed value (the AP-130
// lesson class: comments are not ground truth). The real defect was the
// misleading comment (now fixed); this pin LOCKS the compliant computed
// value as a regression guard — green by design, pre- and post-fix.
// ---------------------------------------------------------------------------
test.describe("S126/CA8 · the input placeholder meets AA contrast", () => {
  test("the /login email placeholder computes the AA-compliant gray-500 (4.82:1 on white)", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    const color = await page.getByLabel("Email", { exact: true }).evaluate((el) => {
      return getComputedStyle(el, "::placeholder").color;
    });
    expect(color).toBe("rgb(107, 114, 128)"); // gray-500 — 4.83:1 on white
  });
});

// ---------------------------------------------------------------------------
// S127/CB3 · generate-questions accepts the cleared-subject empty string
// (the s127 server audit's H-3 — the BX5 dead-transform twin at the third
// route): `subjectId: idField.nullish().transform(v => v === "" ? null : v)`
// — idField's min(1) rejected "" BEFORE the transform, so the no-subject
// default path (practicetests-view sends subjectId: "") 400'd at the
// validation boundary and the Create Test dialog's AI generation failed
// whenever no subject was selected. The fix is the shared nullableId atom.
// The pin rides a FRESH TEST-NET user (the BZ5 doctrine — the demo user's
// AI budget is never touched; the C1 pin's exact 20-then-429 count stays
// deterministic).
// ---------------------------------------------------------------------------
test.describe("S127/CB3: generate-questions accepts subjectId \"\"", () => {
  test("the cleared-subject path passes validation (pre-fix: the dead transform 400'd)", async ({ request }) => {
    test.setTimeout(150_000);
    const email = `s127-cb3-${Date.now()}@studyflow.app`;
    const reg = await request.post("/api/auth/register", {
      headers: { "x-forwarded-for": "192.0.2.127" },
      data: { email, password: "Fresh1234!", name: "S127 CB3 Probe" },
    });
    expect(reg.ok(), `register failed: ${reg.status()}`).toBe(true);
    const { code } = (await reg.json()) as { code: string };
    const verify = await request.post("/api/auth/verify-email", {
      headers: { "x-forwarded-for": "192.0.2.127" },
      data: { email, code },
    });
    expect(verify.ok(), `verify failed: ${verify.status()}`).toBe(true);
    const login = await request.post("/api/auth/login", {
      headers: { "x-forwarded-for": "192.0.2.127" },
      data: { email, password: "Fresh1234!" },
    });
    expect(login.ok(), `login failed: ${login.status()}`).toBe(true);

    // The default no-subject shape. Pre-fix: 400 at the validation
    // boundary (the dead transform). Post-fix: validation passes and the
    // AI layer answers on its own merits — 201 with a live backend, a
    // clean 5xx when the sandbox lacks AI credentials. Anything but the
    // validation 400.
    const res = await request.post("/api/ai/generate-questions", {
      data: { title: "S127 CB3 probe", subjectId: "", count: 1, persist: false },
    });
    expect([201, 200, 408, 429, 500, 502, 503, 504]).toContain(res.status());
  });
});

// ---------------------------------------------------------------------------
// S127/CB7 · the mutate write budget (the BZ5 mirror, the s127 cycle's
// documented next-cycle candidate): the factory write budget covered only
// the collection POSTs — PATCH and DELETE rode unthrottled (the http.ts
// comment's own "next-cycle candidate"). Both now join the SAME shared
// `write:${user.id}` 600/15-min bucket (after auth, BEFORE readJson — the
// C1 convention). The e2e census: the demo user's per-chunk mutation
// volume is tens — far below 600 — so no legitimate spec trips. Both legs
// ride FRESH TEST-NET users (the BZ5 lesson — the demo user is never
// mutated; the BZ5 POST-leg pin's own budget stays untouched).
// ---------------------------------------------------------------------------
test.describe("S127/CB7: the mutate write budget (PATCH + DELETE, 600/15-min shared)", () => {
  test("rapid PATCHes exhaust to 429 + Retry-After; anon still 401s (RED pre-fix: 620x 200, never 429)", async ({ request }) => {
    test.setTimeout(180_000);
    const email = `s127-cb7a-${Date.now()}@studyflow.app`;
    const reg = await request.post("/api/auth/register", {
      headers: { "x-forwarded-for": "192.0.2.129" },
      data: { email, password: "Fresh1234!", name: "S127 CB7a Probe" },
    });
    expect(reg.ok()).toBe(true);
    const { code } = (await reg.json()) as { code: string };
    await request.post("/api/auth/verify-email", {
      headers: { "x-forwarded-for": "192.0.2.129" },
      data: { email, code },
    });
    const login = await request.post("/api/auth/login", {
      headers: { "x-forwarded-for": "192.0.2.129" },
      data: { email, password: "Fresh1234!" },
    });
    expect(login.ok()).toBe(true);

    // One row to mutate (the create also rides the shared bucket).
    const created = await request.post("/api/tasks", {
      data: { title: `S127 CB7 anchor ${Date.now()}` },
    });
    expect(created.status()).toBe(201);
    const { id } = (await created.json()) as { id: string };

    // Self-calibrating: PATCH until the shared budget trips (cap 620 —
    // 1 create consumed, 619 PATCHes remain inside the window).
    let tripped = false;
    for (let i = 0; i < 620; i++) {
      const res = await request.patch(`/api/tasks/${id}`, {
        data: { completed: i % 2 === 0 },
      });
      if (res.status() === 429) {
        expect(res.headers()["retry-after"]).toBeTruthy();
        tripped = true;
        break;
      }
      expect(res.status()).toBe(200);
    }
    // RED pre-fix: the loop ran 620 all-200 iterations and never tripped.
    expect(tripped).toBe(true);

    // The limiter sits AFTER auth: unauthenticated requests still 401.
    const anon = await request.patch(`/api/tasks/${id}`, {
      data: { completed: true },
      headers: { cookie: "" },
      maxRedirects: 0,
    });
    expect(anon.status()).toBe(401);
  });

  test("create+delete pairs exhaust to 429 (RED pre-fix: the deletes never trip)", async ({ request }) => {
    test.setTimeout(180_000);
    const email = `s127-cb7b-${Date.now()}@studyflow.app`;
    const reg = await request.post("/api/auth/register", {
      headers: { "x-forwarded-for": "192.0.2.130" },
      data: { email, password: "Fresh1234!", name: "S127 CB7b Probe" },
    });
    expect(reg.ok()).toBe(true);
    const { code } = (await reg.json()) as { code: string };
    await request.post("/api/auth/verify-email", {
      headers: { "x-forwarded-for": "192.0.2.130" },
      data: { email, code },
    });
    const login = await request.post("/api/auth/login", {
      headers: { "x-forwarded-for": "192.0.2.130" },
      data: { email, password: "Fresh1234!" },
    });
    expect(login.ok()).toBe(true);

    // Each pair consumes TWO budget units (the create + the delete) —
    // the shared bucket trips around pair 300. The cap is 310 pairs: the
    // RED state stays under the EXISTING POST-only budget (310 creates <
    // 600 — pre-fix the loop must finish without tripping on either leg).
    const stamp = Date.now();
    let tripped = false;
    for (let i = 0; i < 310; i++) {
      const create = await request.post("/api/tasks", {
        data: { title: `S127 CB7 del ${stamp} ${i}` },
      });
      if (create.status() === 429) {
        tripped = true;
        break;
      }
      expect(create.status()).toBe(201);
      const { id } = (await create.json()) as { id: string };
      const del = await request.delete(`/api/tasks/${id}`);
      if (del.status() === 429) {
        tripped = true;
        break;
      }
      expect(del.status()).toBe(200);
    }
    expect(tripped).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// S127/CB20 · the twin link-file entry points agree on size (the s127
// server audit's L-6): files/link stored `url.length` while the files POST
// JSON leg stored 0 — identical user actions produced rows that render
// different sizes. Both now store url.length (the dedicated route's
// semantics). Fresh TEST-NET user (the demo user is never mutated).
// ---------------------------------------------------------------------------
test.describe("S127/CB20: both link-file paths store url.length", () => {
  test("the files POST JSON leg stores the URL length (pre-fix: 0)", async ({ request }) => {
    const email = `s127-cb20-${Date.now()}@studyflow.app`;
    const reg = await request.post("/api/auth/register", {
      headers: { "x-forwarded-for": "192.0.2.131" },
      data: { email, password: "Fresh1234!", name: "S127 CB20 Probe" },
    });
    expect(reg.ok()).toBe(true);
    const { code } = (await reg.json()) as { code: string };
    await request.post("/api/auth/verify-email", {
      headers: { "x-forwarded-for": "192.0.2.131" },
      data: { email, code },
    });
    const login = await request.post("/api/auth/login", {
      headers: { "x-forwarded-for": "192.0.2.131" },
      data: { email, password: "Fresh1234!" },
    });
    expect(login.ok()).toBe(true);

    const url = "https://example.com/s127-cb20";
    const res = await request.post("/api/files", {
      data: { name: "S127 CB20 probe", url },
    });
    expect(res.status()).toBe(201);
    const row = (await res.json()) as { size: number };
    expect(row.size).toBe(url.length);
  });
});
