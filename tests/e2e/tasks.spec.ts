import { expect, test } from "@playwright/test";

// Task CRUD golden path: create → complete → important → edit → delete,
// exercised through the real UI against the seeded e2e database.

test.use({ viewport: { width: 1440, height: 900 } });

// The e2e database persists across runs — title tasks uniquely so repeated
// runs never trip strict-mode locators on stale rows.
const stamp = `${Date.now()}`;

test.describe("tasks golden path", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/Tasks");
  });

  test("create a task through the dialog", async ({ page }) => {
    await page.getByRole("button", { name: "Add Task" }).first().click();
    await page.getByLabel("Title").fill(`E2E — write the report ${stamp}`);
    await page.getByLabel("Notes").fill("Created by the e2e suite");
    await page.getByRole("button", { name: "Create Task" }).click();
    await expect(page.getByText(`E2E — write the report ${stamp}`)).toBeVisible();
  });

  test("completing a task strikes it through", async ({ page }) => {
    await page.getByRole("button", { name: "Add Task" }).first().click();
    await page.getByLabel("Title").fill(`E2E — complete me ${stamp}`);
    await page.getByRole("button", { name: "Create Task" }).click();
    // S6-A: task rows are standalone card DIVs inside the rows container.
    const row = page.locator('[aria-label="Task rows"] > div', { hasText: `E2E — complete me ${stamp}` });
    await row.getByRole("checkbox").click();
    // Completed tasks leave the default "Active" filter view.
    await expect(page.getByText(`E2E — complete me ${stamp}`)).toHaveCount(0);
    // S9-C: the status filter is now an outline button + DropdownMenu (the
    // reference's chrome) — not a combobox.
    await page.getByRole("button", { name: "Filter tasks" }).click();
    await page.getByRole("menuitem", { name: "Completed" }).click();
    await expect(page.getByText(`E2E — complete me ${stamp}`)).toBeVisible();
    const style = await page
      .locator('[aria-label="Task rows"] > div', { hasText: `E2E — complete me ${stamp}` })
      .locator("p")
      .first()
      .evaluate((el) => getComputedStyle(el).textDecorationLine);
    expect(style).toContain("line-through");
  });

  test("search filters the task list", async ({ page }) => {
    await page.getByLabel("Search tasks").fill("vectors");
    // The seeded "Read chapter 4 — vectors" task matches; other seeded
    // tasks do not render.
    await expect(page.getByText("Read chapter 4 — vectors")).toBeVisible();
    await expect(page.getByText("Annotate Keats ode")).toHaveCount(0);
  });

  test("the Important bucket lists starred tasks", async ({ page }) => {
    await page.getByRole("button", { name: "Important 1" }).click();
    await expect(page.getByText("Read chapter 4 — vectors")).toBeVisible();
    await expect(page.getByText("Lab report: pendulum experiment")).toHaveCount(0);
  });

  test("a task can be deleted from its menu", async ({ page }) => {
    await page.getByRole("button", { name: "Add Task" }).first().click();
    await page.getByLabel("Title").fill(`E2E — delete me ${stamp}`);
    await page.getByRole("button", { name: "Create Task" }).click();
    const row = page.locator('[aria-label="Task rows"] > div', { hasText: `E2E — delete me ${stamp}` });
    await row.getByRole("button", { name: /^Task menu for/ }).click();
    await page.getByRole("menuitem", { name: "Delete" }).click();
    await expect(page.getByText(`E2E — delete me ${stamp}`)).toHaveCount(0);
  });
});

test.describe("my day quick add", () => {
  test("quick-add creates a task for today (Enter submits — S9-Q)", async ({ page }) => {
    await page.goto("/MyDay");
    await page.getByLabel("Add a task for today").fill(`E2E — my day task ${stamp}`);
    // S9-Q: the reference's quick-add row has no submit button — Enter
    // submits the form.
    await page.getByLabel("Add a task for today").press("Enter");
    await expect(page.getByText(`E2E — my day task ${stamp}`)).toBeVisible();
  });
});

// S121/BV7 — the owned-FK guard on the interactive CRUD path.
//
// makeOwnedDelegate wrote parsed subjectId/listId/notebookId verbatim — a
// task referencing a subject id that exists but belongs to ANOTHER account
// (or no account at all) satisfied the Prisma FK and persisted as an
// owner-view dangling reference. The factory now ownership-checks every
// non-null sent FK (the files/folders + ai/generate convention: 404 "That
// subject does not exist."). API-level on the shared demo session.
test.describe("S121/BV7: owned-FK guards", () => {
  test("a task POST with a foreign/nonexistent subjectId answers the actionable 404", async ({ request }) => {
    const foreign = await request.post("/api/tasks", {
      data: {
        title: `E2E — BV7 foreign subject ${stamp}`,
        subjectId: "cm ForeignSubject0000000000000001",
      },
    });
    expect(foreign.status()).toBe(404);
    expect((await foreign.json()) as { error?: string }).toMatchObject({
      error: "That subject does not exist.",
    });
    // The legal path is untouched: an OWN subject still accepts the task.
    const subjects = await request.get("/api/subjects");
    expect(subjects.ok()).toBe(true);
    const rows = (await subjects.json()) as { id: string }[];
    if (rows.length > 0) {
      const legal = await request.post("/api/tasks", {
        data: { title: `E2E — BV7 own subject ${stamp}`, subjectId: rows[0].id },
      });
      expect(legal.ok()).toBe(true);
      // Cleanup: the probe rows never outlive the pin.
      await request.delete(`/api/tasks/${((await legal.json()) as { id: string }).id}`);
    }
  });

  test("a task POST with a nonexistent listId answers the actionable 404", async ({ request }) => {
    const foreign = await request.post("/api/tasks", {
      data: {
        title: `E2E — BV7 foreign list ${stamp}`,
        listId: "cm ForeignList000000000000000000001",
      },
    });
    expect(foreign.status()).toBe(404);
    expect((await foreign.json()) as { error?: string }).toMatchObject({
      error: "That list does not exist.",
    });
  });
});

// S127/CB16 — the toggleTask read-modify-write race (the s127 FE audit's
// L-2, the BX10 class closed at the store): two rapid toggles before the
// first refetch landed both read the SAME stale base and both PATCHed the
// same value — the second toggle was silently lost (a double-click that
// should net to unchecked left the task checked). The fix chains per-id:
// each toggle re-reads the store AFTER the previous one settles. The pin
// HOLDS the tasks GET so the race window is deterministic, then asserts
// the persisted final state through the API.
test.describe("S127/CB16 · a rapid double toggle nets to the original state", () => {
  test("two unchecked-to-checked-to-unchecked clicks persist completed=false (was: true)", async ({ page }) => {
    const stamp = Date.now();
    const created = await page.request.post("/api/tasks", {
      data: { title: `E2E — double toggle ${stamp}` },
    });
    expect(created.ok()).toBe(true);
    const { id } = (await created.json()) as { id: string };

    await page.goto("/Tasks");
    const row = page.locator('[aria-label="Task rows"] > div', {
      hasText: `E2E — double toggle ${stamp}`,
    });
    await expect(row).toBeVisible();

    // Hold every tasks GET — the first toggle's refetch cannot land
    // between the two clicks, so the race window is deterministic.
    let release: () => void = () => {};
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route("**/api/tasks*", async (route) => {
      if (route.request().method() === "GET") await gate;
      return route.continue();
    });

    // The double click — no await of any refetch between them.
    const box = row.getByRole("checkbox");
    await box.click();
    await box.click();

    // Let the held GETs drain, then read the persisted truth.
    release();
    await page.waitForTimeout(800);
    try {
      const rows = (await (await page.request.get("/api/tasks")).json()) as {
        id: string;
        completed: boolean;
      }[];
      const mine = rows.find((r) => r.id === id);
      // Pre-fix: both toggles read completed=false and both PATCHed true —
      // the net-zero double toggle persisted completed=true.
      expect(mine?.completed).toBe(false);
    } finally {
      // Zero residue on the shared demo user — in a FINALLY (S128/CC4,
      // the AR3 convention).
      await page.request.delete(`/api/tasks/${id}`);
    }
  });
});
