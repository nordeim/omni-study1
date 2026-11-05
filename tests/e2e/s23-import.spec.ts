import { expect, test, type Page } from "@playwright/test";

// S23 pins — the data import / restore (docs/remediation-plan-session23.md):
//
// (1) THE ROUND-TRIP: POST /api/import/data with a hand-crafted valid
//     envelope → 200 + the per-collection created/updated summary; the
//     rows land in the live collections (GET back through the app's own
//     API); a dangling OPTIONAL FK imports nulled (the SetNull semantics).
//
// (2) THE IDEMPOTENT RE-IMPORT: the same envelope again → created=0,
//     updated=N, row count UNCHANGED (upsert-by-id — an import never
//     duplicates and never deletes).
//
// (3) THE VALIDATION 400 FAMILY: wrong format / future version / dangling
//     REQUIRED FK / duplicate ids → 400 with the actionable message; the
//     all-or-nothing rollback leaves the database unchanged.
//
// (4) THE ANON API GATE: 401 JSON for anonymous callers (the AP-67
//     explicit EMPTY storageState).
//
// (5) THE PANEL JOURNEY: /export renders the Restore card; a real
//     setInputFiles import → the result summary renders.
//
// Rate-limit budget (S135/CJ6 recount → S145/CT4 recount, audit A-L1): this
// file makes exactly 10 DEMO-user import POSTs against the 10/15-min
// per-user budget — ZERO HEADROOM: any NEW demo-session import POST added
// here 429s at the limiter (a future leg must ride a fresh TEST-NET user,
// a different chunk, or displace one of these). The enumeration: round-trip
// 1 + re-import 1 + the 400 family 4 + the panel journey 1 (the in-app
// POST — the app's own fetch through the demo page, invisible to the
// script-conventions census, which pins the 9 fixture sites) + the S117
// cards round-trip 1 + the S144/CS3 merge-guard leg 1 + the S140/CO1
// hostile-note leg 1 — the dangling-FK probe rides the round-trip
// envelope, no standalone POST). Other spec files DO POST this route (the
// S92/A4-era exclusivity claim was false): resilience.spec.ts carries 9 demo-user
// POSTs (8 fixture + 1 demo.request — the BW11 over-cap 413:
// the limiter fires before the body read, consuming budget; the BY3
// acceptance; the S135/CJ4+CJ5 400-message pins, relocated there after
// the first draft HERE tripped chunk 5's registerGlobal: 40 cap — two
// wasted fresh-user registrations [the pins rode this file's demo
// storageState anyway] pushed the chunk's register census over 40 and the
// LAST registering test 429'd; the S137/CL1 equal-times leg; the S139
// CN2-empty + CN7 pins; the S144/CS5 row-cap 413 — the same budget shape
// as the BW11 leg, the limiter fires before the row-count check; and the
// S139 cross-account 409 probe's demo-context POST — one slot free) and
// s14-hardening.spec.ts POSTs on fresh users (the CA5/CA2/CJ1 window
// probes). Safety is the CHUNK MAP, not exclusivity: resilience rides
// chunk 3 and this file rides chunk 5 — different server boots, and both
// the import limiter and the registerGlobal cap are per-process in-memory
// (each chunk re-boots clean). The register census is ALSO chunk-scoped:
// chunk 5 carries ~40 register POSTs (auth-flows' 13 sites incl. the CI3
// quartet's 11 + the verify-OTP re-register pairs + greeting-clock/s18/
// s24/s25/s26's fresh journeys) — at the registerGlobal: 40 cap with zero
// headroom; any NEW chunk-5 pin that registers a user must reuse the demo
// session or displace a register elsewhere. Keep them apart.
// S119/BT1: the perimeter pins below POST on a FRESH TEST-NET-registered
// user (192.0.2.119) — the demo user's import budget is untouched.
test.use({ storageState: "tests/e2e/.auth/user.json" });

function envelope(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    format: "studyflow-data-export",
    version: 1,
    exportedAt: "2026-10-01T00:00:00.000Z",
    user: { id: "u-old", email: "old@account.dev", name: "Old Account" },
    counts: {},
    data: {
      subjects: [{ id: "s23-subject", name: "S23 Probe Subject", color: "#8b5cf6", createdAt: "2026-09-01T00:00:00.000Z" }],
      tasks: [
        {
          id: "s23-task-linked",
          title: "S23 probe task (linked)",
          subjectId: "s23-subject",
          createdAt: "2026-09-02T00:00:00.000Z",
          updatedAt: "2026-09-02T00:00:00.000Z",
        },
        {
          id: "s23-task-dangling",
          title: "S23 probe task (dangling subject)",
          subjectId: "no-such-subject-anywhere",
          createdAt: "2026-09-03T00:00:00.000Z",
          updatedAt: "2026-09-03T00:00:00.000Z",
        },
      ],
    },
    ...overrides,
  };
}

test.describe("S23 the data import (restore)", () => {
  test("the round-trip: POST a valid envelope → 200 summary, rows land, dangling FK nulls", async ({
    request,
  }) => {
    const res = await request.post("/api/import/data", { data: envelope() });
    expect(res.status()).toBe(200);
    const body = (await res.json()) as {
      imported: Record<string, { created: number; updated: number }>;
      created: number;
      updated: number;
      total: number;
    };
    expect(body.imported.subjects).toEqual({ created: 1, updated: 0 });
    expect(body.imported.tasks).toEqual({ created: 2, updated: 0 });
    expect(body.created).toBe(3);
    expect(body.updated).toBe(0);
    expect(body.total).toBe(3);

    // The rows land through the app's own API (the storageState cookie rides).
    const tasks = await request.get("/api/tasks");
    expect(tasks.status()).toBe(200);
    const list = (await tasks.json()) as Array<{ id: string; title: string; subjectId: string | null }>;
    const linked = list.find((t) => t.id === "s23-task-linked");
    const dangling = list.find((t) => t.id === "s23-task-dangling");
    expect(linked?.title).toBe("S23 probe task (linked)");
    expect(linked?.subjectId).toBe("s23-subject");
    // The dangling OPTIONAL FK imported NULLED (the SetNull semantics).
    expect(dangling?.subjectId).toBeNull();

    const subjects = await request.get("/api/subjects");
    const subjectList = (await subjects.json()) as Array<{ id: string; name: string }>;
    expect(subjectList.some((s) => s.id === "s23-subject" && s.name === "S23 Probe Subject")).toBe(true);
  });

  test("the idempotent re-import: created=0, updated=3, row count unchanged", async ({ request }) => {
    const before = await request.get("/api/tasks");
    const beforeCount = ((await before.json()) as unknown[]).length;

    const res = await request.post("/api/import/data", { data: envelope() });
    expect(res.status()).toBe(200);
    const body = (await res.json()) as { created: number; updated: number };
    expect(body.created).toBe(0);
    expect(body.updated).toBe(3);

    const after = await request.get("/api/tasks");
    const afterCount = ((await after.json()) as unknown[]).length;
    // Upsert-by-id: an import never duplicates (and never deletes).
    expect(afterCount).toBe(beforeCount);
  });

  test("the cards round-trip (S117/BR1): a card under an EXISTING owned deck imports — the deck-scoped write probe", async ({
    request,
  }) => {
    // RED demonstrated live on the pre-change tree: the export→import
    // round-trip of an account with flashcards returned HTTP 500 — the write
    // loop probed { id, userId } on the flashcard delegate (Flashcard has NO
    // userId column) → PrismaClientValidationError → the whole all-or-nothing
    // transaction rolled back. The fix scopes EVERY cards ownership probe
    // through { deck: { userId } }, exactly like the knownIds loop above it.
    // The stamped id keeps the pin re-run-safe on an aged scratch db (the
    // S46 lesson — fixed ids read created:0 on the second run).
    const decks = await request.get("/api/flashcards/decks");
    expect(decks.status()).toBe(200);
    const deckList = (await decks.json()) as Array<{ id: string }>;
    expect(deckList.length).toBeGreaterThan(0);
    const deckId = deckList[0].id;

    const stamped = `s117-card-${Date.now()}`;
    try {
      const res = await request.post("/api/import/data", {
        data: envelope({
          data: {
            cards: [
              {
                id: stamped,
                front: "BR1 front — the deck-scoped probe",
                back: "BR1 back",
                deckId,
                difficulty: "medium",
                mastered: false,
                createdAt: "2026-10-01T00:00:00.000Z",
                updatedAt: "2026-10-01T00:00:00.000Z",
              },
            ],
          },
        }),
      });
      expect(res.status()).toBe(200);
      const body = (await res.json()) as {
        imported: Record<string, { created: number; updated: number }>;
      };
      // Account-aware REQUIRED-FK resolution: the deck exists in the importer's
      // account (not in the envelope) — the card imports against it.
      expect(body.imported.cards).toEqual({ created: 1, updated: 0 });

      // The card landed through the app's own API (deck-scoped list).
      const cards = await request.get("/api/flashcards/cards");
      expect(cards.status()).toBe(200);
      const list = (await cards.json()) as Array<{ id: string; deckId: string }>;
      const mine = list.find((c) => c.id === stamped);
      expect(mine?.deckId).toBe(deckId);
    } finally {
      // The AM5 convention: cleanup rides every failure path.
      await request.delete(`/api/flashcards/cards/${stamped}`);
    }
  });

  test("the validation 400 family: format, future version, required FK, duplicate ids — and the rollback", async ({
    request,
  }) => {
    const tasksBefore = await request.get("/api/tasks");
    const countBefore = ((await tasksBefore.json()) as unknown[]).length;

    // Wrong format identity.
    const badFormat = await request.post("/api/import/data", {
      data: envelope({ format: "someone-elses-export" }),
    });
    expect(badFormat.status()).toBe(400);
    expect(((await badFormat.json()) as { error: string }).error).toContain("studyflow-data-export");

    // A future version.
    const futureVersion = await request.post("/api/import/data", {
      data: envelope({ version: 2 }),
    });
    expect(futureVersion.status()).toBe(400);
    expect(((await futureVersion.json()) as { error: string }).error).toContain("newer version");

    // A dangling REQUIRED FK (cards.deckId).
    const withCard = envelope() as { data: Record<string, unknown[]> };
    withCard.data.cards = [{ id: "s23-card", front: "f", back: "b", deckId: "no-such-deck" }];
    const badCard = await request.post("/api/import/data", { data: withCard });
    expect(badCard.status()).toBe(400);
    const cardError = ((await badCard.json()) as { error: string }).error;
    expect(cardError).toContain("cards");
    expect(cardError).toContain("deckId");

    // Duplicate ids within one collection.
    const withDup = envelope() as { data: Record<string, unknown[]> };
    withDup.data.subjects = [
      { id: "s23-dup", name: "A" },
      { id: "s23-dup", name: "B" },
    ];
    const dup = await request.post("/api/import/data", { data: withDup });
    expect(dup.status()).toBe(400);
    expect(((await dup.json()) as { error: string }).error).toContain("s23-dup");

    // The all-or-nothing rollback: nothing landed from ANY of the rejected
    // envelopes (the subjects never existed; the task count is unchanged).
    const subjectsNow = await request.get("/api/subjects");
    const subjectList = (await subjectsNow.json()) as Array<{ id: string }>;
    expect(subjectList.some((s) => s.id === "s23-dup")).toBe(false);
    const tasksNow = await request.get("/api/tasks");
    expect(((await tasksNow.json()) as unknown[]).length).toBe(countBefore);
  });

  test("the anon API gate: 401 JSON for anonymous callers", async ({ browser }) => {
    // The AP-67 lesson: an explicit EMPTY storageState — browser.newContext()
    // inherits the file-level one otherwise.
    const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await ctx.newPage();
    const res = await page.request.post("/api/import/data", { data: envelope() });
    expect(res.status()).toBe(401);
    expect(((await res.json()) as { error: string }).error).toContain("Authentication required");
    await ctx.close();
  });

  test("the panel journey: /export renders the Restore card and a real file import reports the summary", async ({
    page,
  }) => {
    await page.goto("/export");
    // The pinned S21 surfaces stay byte-identical (the regression net's own
    // spec re-proves the count grid + Download JSON anchor; here: present).
    await expect(page.getByRole("heading", { name: "Export Your Data" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Download JSON" })).toBeVisible();

    // The Restore card.
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeAttached();
    await expect(page.getByRole("button", { name: "Import" })).toBeDisabled();

    // A real file through the panel (the import POST #9 of 10 — the
    // S145/CT4 recount: the panel journey's in-app POST is one of this
    // file's TEN demo-session POSTs, the census-invisible one).
    await fileInput.setInputFiles({
      name: "studyflow-data-2026-10-01.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(envelope())),
    });
    const importBtn = page.getByRole("button", { name: "Import" });
    await expect(importBtn).toBeEnabled();
    await importBtn.click();

    // The result summary renders with the upsert counts (created 0 — the
    // earlier specs already imported these exact ids; updated 3).
    const result = page.getByRole("status");
    await expect(result).toBeVisible();
    await expect(result).toContainText("3");
    await expect(result).toContainText("updated");
  });

  // S144/CS3 (audit B-M2): the import route's IMPORT_MERGE_GUARDS wiring —
  // the UPDATE-branch merge guards against single-leg inverted rows (the
  // B-I1 mitigation) — was pinned by NOTHING (zero test references; the
  // seam functions are unit-pinned, the interactive delegates are
  // census-pinned, the import route was the unpinned third site). The
  // behavioral pin: a stored grade leg created through the INTERACTIVE
  // door (score 40, maxScore 50), then a hand-crafted partial envelope
  // carrying ONLY {id, score: 90} — the exact hand-crafted shape every
  // interactive route rejects — must answer the named 400 and leave the
  // stored row unchanged (the all-or-nothing posture). Rides the demo
  // session's import budget 8 → 9/10 (the header recount above).
  test("S144/CS3: the UPDATE branch runs the merge guard (a single-leg inverted grade row answers the named 400; the stored row is unchanged)", async ({
    request,
  }) => {
    // The stored partner leg, through the interactive door.
    const create = await request.post("/api/grades", {
      data: { title: "S144 merge probe", score: 40, maxScore: 50 },
    });
    expect(create.status()).toBe(201);
    const created = (await create.json()) as { id: string; score: number };
    expect(created.score).toBe(40);

    // The hand-crafted partial envelope: score 90 against the stored 50.
    const res = await request.post("/api/import/data", {
      headers: { "content-type": "application/json" },
      data: envelope({ data: { grades: [{ id: created.id, score: 90 }] } }),
    });
    expect(res.status()).toBe(400);
    const body = (await res.json()) as { error?: string };
    expect(body.error).toContain("Score cannot be higher than the maximum score.");

    // All-or-nothing: the stored row is unchanged (no partial write).
    const rows = await request.get("/api/grades");
    const list = (await rows.json()) as Array<{ id: string; score: number }>;
    const row = list.find((g) => g.id === created.id);
    expect(row?.score).toBe(40);
  });
});


// S119/BT1 — the import perimeter. The route previously read its body with
// NO Content-Type gate (a cross-site text/plain form POST rides the
// sameSite=lax cookie straight into the JSON parser — the exact CSRF class
// BR5 closed at readJson) and persisted envelope fields VERBATIM (a
// hand-edited backup could store a javascript: files[].url — the BR4
// http(s)-only rule's unguarded third entry point — and wrong field types
// surfaced as Prisma 500s). Both pins run on a FRESH TEST-NET user so the
// demo import budget (9/10 above) is untouched.
const PROBE_IP = "192.0.2.119";

async function registerFreshUser(page: Page, salt: string): Promise<void> {
  const email = `s119-${salt}-${Date.now()}@studyflow.app`;
  const res = await page.request.post("/api/auth/register", {
    headers: { "x-forwarded-for": PROBE_IP },
    data: { email, password: "Fresh1234!", name: "S119 Probe" },
  });
  expect(res.ok(), `register failed: ${res.status()}`).toBe(true);
  const body = (await res.json()) as { code: string };
  const verify = await page.request.post("/api/auth/verify-email", {
    headers: { "x-forwarded-for": PROBE_IP },
    data: { email, code: body.code },
  });
  expect(verify.ok(), `verify failed: ${verify.status()}`).toBe(true);
}

test.describe("S119/BT1 the import perimeter (fresh TEST-NET user)", () => {
  test("BT1a: a text/plain POST never reaches the JSON parser (the BR5 policy at the import route)", async ({ page }) => {
    await registerFreshUser(page, "gate");
    const res = await page.request.post("/api/import/data", {
      headers: { "content-type": "text/plain" },
      data: JSON.stringify(envelope()),
    });
    expect(res.status()).toBe(400);
    expect(((await res.json()) as { error: string }).error).toContain("JSON");
  });

  test("BT1b: a files row carrying a javascript: url is rejected before the write", async ({ page }) => {
    await registerFreshUser(page, "guard");
    const evil = envelope({
      data: {
        files: [
          {
            id: "s119-evil-link",
            name: "Evil link",
            mime: "text/plain",
            size: 0,
            url: "javascript:alert(1)",
            folderId: null,
            createdAt: "2026-09-01T00:00:00.000Z",
            updatedAt: "2026-09-01T00:00:00.000Z",
          },
        ],
      },
    });
    const res = await page.request.post("/api/import/data", { data: evil });
    expect(res.status()).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toContain("files");
    expect(body.error).toContain("http(s)");
  });
});

// S128/CC1 — the profile-patch whitelist's route-level leg (the s128
// client-layer audit's M-1, demonstrated at the HTTP boundary). A
// hand-edited envelope whose user block carries `displayName` (the
// preferencesSchema alias for the fullName column — a column the User
// model does not have) rolled back the ENTIRE restore with a misleading
// "row whose fields do not match" 400 (PrismaClientValidationError inside
// the all-or-nothing transaction). The whitelist keeps name-shaped
// identity off the patch: the restore succeeds and the seven preference
// fields still apply. Rides a FRESH TEST-NET user (the BT1 convention —
// the demo import budget stays at its documented 9/10).
test.describe("S128/CC1 the displayName-bearing envelope (fresh TEST-NET user)", () => {
  test("a spliced displayName in the user block restores 200 — preferences apply, the name never does", async ({ page }) => {
    await registerFreshUser(page, "cc1");
    // UNIQUE row ids: the base envelope's s23-* ids were already minted in
    // the demo session's data this run — the id is the GLOBAL primary key,
    // so a same-id import under the fresh user P2002s with a 409 long
    // before the profile patch (the BT1b/S117 unique-id convention).
    const spliced = envelope({
      user: {
        id: "u-old",
        email: "old@account.dev",
        name: "Old Account",
        displayName: "Spliced Name",
        themeMode: "dark",
        accentColor: "blue",
      },
      data: {
        subjects: [
          {
            id: "s128-cc1-subject",
            name: "S128 CC1 Probe Subject",
            color: "#8b5cf6",
            createdAt: "2026-09-01T00:00:00.000Z",
          },
        ],
        tasks: [],
      },
    });
    const res = await page.request.post("/api/import/data", { data: spliced });
    // Pre-fix: 400 "row whose fields do not match" — the whole restore died.
    expect(res.status()).toBe(200);

    // The preferences rode the whitelist; the name-shaped field did not.
    const me = await page.request.get("/api/auth/me");
    expect(me.ok()).toBe(true);
    const { user } = (await me.json()) as { user: { themeMode: string; accentColor: string; name: string } };
    expect(user.themeMode).toBe("dark");
    expect(user.accentColor).toBe("blue");
    expect(user.name).not.toBe("Spliced Name");
  });
});

// S130/CE7 — the id-length atom at the import boundary (the s130 server
// audit's L2): importRowIdError bounded the row id to NON-EMPTY ONLY while
// every interactive boundary bounds ids at 64 (idField) — a hand-crafted
// envelope could mint a 1 M-char primary key (every index entry and FK
// probe carries it). The fix bounds the id at 64 through the shared seam
// (both the perimeter guard and the write loop). Rides the FRESH TEST-NET
// user (the BT1 convention — the demo import budget stays at its
// documented 9/10).
test.describe("S130/CE7 the id-length atom (fresh TEST-NET user)", () => {
  test("a 65-char row id is rejected with the named message; a 64-char id restores clean", async ({ page }) => {
    await registerFreshUser(page, "ce7");
    const longId = "x".repeat(65);
    const evil = envelope({
      data: {
        subjects: [],
        tasks: [
          {
            id: longId,
            title: "CE7 id-length probe",
            createdAt: "2026-09-01T00:00:00.000Z",
          },
        ],
      },
    });
    const res = await page.request.post("/api/import/data", { data: evil });
    expect(res.status()).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toContain("id");
    // The boundary itself imports clean (the atom's own edge).
    const ok = envelope({
      data: {
        subjects: [],
        tasks: [
          {
            id: "x".repeat(64),
            title: "CE7 id-length boundary probe",
            createdAt: "2026-09-01T00:00:00.000Z",
          },
        ],
      },
    });
    const res2 = await page.request.post("/api/import/data", { data: ok });
    expect(res2.status()).toBe(200);
  });
});

// S133/CH2 + CH7 — the import-parity completion and the counts-refresh,
// on FRESH TEST-NET users (the S119/BT1 budget-isolation precedent: the
// demo user's 9-of-10 import budget above is untouched — each leg
// registers its own user, so the 10/15-min bucket starts at zero).
test.describe("S133/CH2+CH7 the import parity + the counts refresh (fresh TEST-NET users)", () => {
  test("CH2: a hand-edited timetable class with an out-of-vocabulary weekType answers the actionable 400", async ({
    page,
  }) => {
    await registerFreshUser(page, "ch2");
    // A stamped id — the pin stays re-run-safe against a non-cold scratch
    // db (the fixed-id S46 re-run class the cold-reset exists for).
    const probeId = `s133-ch2-weektype-${Date.now()}`;
    const evil = envelope({
      data: {
        subjects: [],
        timetableClasses: [
          {
            id: probeId,
            name: "Z-Week Class",
            dayOfWeek: 1,
            startTime: "09:00",
            endTime: "10:00",
            weekType: "Z",
          },
        ],
      },
    });
    const res = await page.request.post("/api/import/data", { data: evil });
    expect(res.status()).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toContain("weekType");
    // The row never landed (the all-or-nothing contract).
    const classes = await page.request.get("/api/timetable");
    const rows = (await classes.json()) as Array<{ id: string }>;
    expect(rows.some((c) => c.id === probeId)).toBe(false);
  });

  test("CH7: the /export count grid refreshes after an in-panel import (no stale pre-import numbers)", async ({
    page,
  }) => {
    await registerFreshUser(page, "ch7");
    // The fresh user's grid starts at zero Tasks (the chip's count pill).
    await page.goto("/export");
    const grid = page.locator('section[aria-label="What\'s included"]');
    const tasksChip = grid.locator("span.inline-flex", { hasText: /^Tasks/ });
    await expect(tasksChip).toHaveCount(1);
    await expect(tasksChip).toContainText("0");

    // A unique-id task envelope through the panel's real file input.
    const unique = `s133-ch7-${Date.now()}`;
    const env = envelope({
      data: {
        subjects: [],
        tasks: [
          {
            id: unique,
            title: "CH7 counts-refresh probe",
            createdAt: "2026-09-01T00:00:00.000Z",
          },
        ],
      },
    });
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "studyflow-data-ch7.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(env)),
    });
    await page.getByRole("button", { name: "Import" }).click();

    // The success summary renders…
    const result = page.getByRole("status");
    await expect(result).toBeVisible();
    await expect(result).toContainText("1");

    // …and the server-rendered count grid goes honest WITHOUT a reload:
    // the Tasks chip flips 0 → 1 (router.refresh() re-runs the page's
    // 20 db counts; pre-CH7 the grid kept showing the pre-import zero).
    await expect(tasksChip).toContainText("1", { timeout: 10_000 });
  });
});

// S140/CO1 — the note-HTML sanitize leg on the IMPORT door (A-L3 closed).
// A hostile "backup" note (remote tracking pixel + script + inline handler)
// imports 200 — the round-trip contract is untouched — but the STORED
// content comes back sanitized: no remote img src, no script tag, no
// event handler. This is the import door's half of the A-L3 fix (the API
// door is covered by the delegate writeTransform + the render gate by the
// legacy-note leg in parity-session9). Rides the DEMO session (budget #10
// of 10 — the LAST of this file's zero-headroom TEN, the S145/CT4 recount;
// the chunk-5 register census has zero headroom, so no fresh user).
test.describe("S140/CO1 the note-HTML sanitize on import (A-L3)", () => {
  test("a hostile note imports clean: the stored content carries no remote img, script, or handler", async ({
    request,
  }) => {
    const hostile = envelope({
      data: {
        notes: [
          {
            id: "s140-hostile-note",
            title: "S140 hostile note probe",
            content:
              "<p>legit text</p>" +
              '<img src="https://a-l3-import.example/px.gif" alt="pixel">' +
              "<script>alert(1)</script>" +
              '<p onclick="steal()">bait</p>' +
              '<iframe src="https://a-l3-import.example/frame"></iframe>',
            tags: "[]",
            notebookId: null,
            subjectId: null,
            createdAt: "2026-09-05T00:00:00.000Z",
            updatedAt: "2026-09-05T00:00:00.000Z",
          },
        ],
      },
    });
    const res = await request.post("/api/import/data", { data: hostile });
    expect(res.status()).toBe(200);
    const body = (await res.json()) as { created: number; updated: number };
    expect(body.created).toBe(1);

    // The STORED row reads back sanitized (the render gate and the CSP are
    // defense-in-depth; the import write loop itself strips the payload).
    const notes = await request.get("/api/notes");
    expect(notes.status()).toBe(200);
    const list = (await notes.json()) as Array<{ id: string; content: string }>;
    const note = list.find((n) => n.id === "s140-hostile-note");
    expect(note).toBeDefined();
    expect(note!.content).toContain("<p>legit text</p>");
    expect(note!.content).not.toContain("a-l3-import.example");
    expect(note!.content.toLowerCase()).not.toContain("<script");
    expect(note!.content.toLowerCase()).not.toContain("onclick");
    expect(note!.content.toLowerCase()).not.toContain("<iframe");
  });
});
