import { expect, test } from "@playwright/test";

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
// Rate-limit budget: this file makes exactly 8 import POSTs against the
// 10/15-min per-user budget (round-trip 1 + re-import 1 + dangling-FK 1 +
// the 400 family 4 + the panel journey 1) — counted and documented; no
// other spec file POSTs the route.
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

    // A real file through the panel (the last import POST — budget #8).
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
});
