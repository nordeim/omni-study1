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
