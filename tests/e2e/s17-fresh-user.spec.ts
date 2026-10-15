import { expect, test, type Page } from "@playwright/test";

/**
 * Session-17 parity pins — the fresh-user journey (docs/remediation-plan-session17.md).
 *
 * The reference's account was re-provisioned empty (2026-09-28), which made
 * its ZERO-DATA surfaces measurable for the first time; the S17 audit swept
 * both apps with fresh accounts and found two families:
 *
 *  S17-A/B/C  the Settings depth — the reference's Profile tab persists
 *             school_name / grade_level / study_goal_hours /
 *             notifications_enabled on its User entity (captured from the
 *             reference's own PUT body); its Notifications tab carries an
 *             "Enable Notifications" master toggle; its Subjects/Holidays
 *             tabs carry per-tab headers + zero-empty states; its
 *             Appearance tab opens with "Customize how StudyFlow looks".
 *  S17-D/E    Analytics and Grade Tracker render their stat cards at ZERO
 *             data (0/0 · "0% completion rate" … / 0% · 0 · 0) — the clone
 *             gated them behind EmptyState blocks the reference never
 *             renders.
 *  S17-F      the empty-state hint copy family (Tasks/Notes/Assignments/
 *             Exams/Flashcards/PracticeTests/Files) — reference-measured.
 *  S17-G      Study Groups at mobile stacks BOTH panes' empty states (the
 *             reference's measured copy, not the clone's invented hint).
 *
 * Zero-data pins run as a freshly REGISTERED user (the API-based
 * registerFreshUser pattern — no login-limiter pressure); the Settings
 * Profile/Notifications pins run on the shared demo user (profile fields
 * are account-scoped, not data-scoped — assert idempotently).
 */

const hydrated = (page: Page) =>
  page.waitForFunction(() => document.documentElement.style.getPropertyValue("--sf-primary") !== "");

/** Registers a throwaway user inside THIS test's context (fresh cookie jar,
 *  zero data) — the S9/S15 pattern: register + verify with the surfaced code. */
async function registerFreshUser(page: Page, salt: string) {
  const email = `s17-${salt}-${Date.now()}@studyflow.app`;
  const res = await page.request.post("/api/auth/register", {
    data: { email, password: "Fresh1234!", name: "Fresh Probe" },
  });
  expect(res.ok(), `register failed: ${res.status()}`).toBe(true);
  const body = (await res.json()) as { code: string };
  const verify = await page.request.post("/api/auth/verify-email", {
    data: { email, code: body.code },
  });
  expect(verify.ok(), `verify failed: ${verify.status()}`).toBe(true);
}

// ---------------------------------------------------------------------------
// Zero-data surfaces — fresh registration context
// ---------------------------------------------------------------------------

// ONE registration walks the whole fresh-user journey (the S16 convention —
// the register endpoint is rate-limited 10/IP/15min and the suite's other
// specs already spend ~8 of that budget: S9 registers 2, auth-flows 3, S16
// 1). This test holds S17-D + S17-E; the hint family + Settings follow in
// their own describe with the SAME shared structure but their own context
// (Playwright gives each test a fresh cookie jar — the hints/Settings specs
// below re-register ONCE and the mobile spec once: 3 registrations total).
test.describe("S17-D/E · Analytics + Grade Tracker render their stat cards at zero data", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("fresh user: the stat cards render with zero values, no EmptyStates", async ({ page }) => {
    await registerFreshUser(page, "zero-stats");

    // -- Analytics (S17-D): the reference's zero-state stat cards (measured):
    //    label + zero value + sub-caption. The "No data yet" block is GONE.
    await page.goto("/Analytics");
    await hydrated(page);
    const main = page.locator("main");
    for (const label of ["Tasks Completed", "Assignments", "Focus Time", "Upcoming Exams"]) {
      await expect(main.getByText(label, { exact: true })).toBeVisible();
    }
    await expect(main.getByText("0% completion rate")).toBeVisible();
    await expect(main.getByText("0% avg progress")).toBeVisible();
    await expect(main.getByText("total study hours")).toBeVisible();
    await expect(main.getByText("exams scheduled")).toBeVisible();
    await expect(main.getByText("No data yet")).toHaveCount(0);
    // the charts' own empty text survives (reference-measured)
    await expect(main.getByText("No subject data yet").first()).toBeVisible();

    // -- Grade Tracker (S17-E): the reference's zero-grade state is the stat
    //    cards ONLY (0% / 0 / 0) — no "No grades yet" EmptyState block.
    await page.goto("/GradeTracker");
    await hydrated(page);
    await expect(main.getByText("Overall Average", { exact: true })).toBeVisible();
    await expect(main.getByText("Total Grades", { exact: true })).toBeVisible();
    await expect(main.getByText("Subjects Tracked", { exact: true })).toBeVisible();
    await expect(main.getByText("0%", { exact: true })).toBeVisible();
    await expect(main.getByText("No grades yet")).toHaveCount(0);
  });
});

test.describe("S17-F/C · the empty-state hints + Settings zero states (fresh user)", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("the seven reference-measured hints + Settings empty states render verbatim", async ({ page }) => {
    await registerFreshUser(page, "hints");
    const main = page.locator("main");

    // Tasks — "No tasks yet / Create your first task to get started / Create Task"
    await page.goto("/Tasks");
    await hydrated(page);
    await expect(main.getByText("No tasks yet", { exact: true })).toBeVisible();
    await expect(main.getByText("Create your first task to get started")).toBeVisible();

    // Notes — "No notes yet / Create your first note / New Note"
    // (the mobile fallback renders a second, hidden copy — filter visible)
    await page.goto("/Notes");
    await hydrated(page);
    await expect(main.getByText("No notes yet", { exact: true }).filter({ visible: true })).toBeVisible();
    await expect(main.getByText("Create your first note").filter({ visible: true })).toBeVisible();

    // Assignments — "Add your first assignment to start tracking" (no tail)
    await page.goto("/Assignments");
    await hydrated(page);
    await expect(main.getByText("No assignments yet", { exact: true })).toBeVisible();
    await expect(main.getByText("Add your first assignment to start tracking", { exact: true })).toBeVisible();

    // Exams — "Add your exams to start tracking"
    await page.goto("/Exams");
    await hydrated(page);
    await expect(main.getByText("No exams found", { exact: true })).toBeVisible();
    await expect(main.getByText("Add your exams to start tracking", { exact: true })).toBeVisible();

    // Flashcards — "Create your first flashcard deck" (no trailing period)
    await page.goto("/Flashcards");
    await hydrated(page);
    await expect(main.getByText("No decks yet", { exact: true })).toBeVisible();
    await expect(main.getByText("Create your first flashcard deck", { exact: true })).toBeVisible();

    // Practice Tests — "Create your first practice test"
    await page.goto("/PracticeTests");
    await hydrated(page);
    await expect(main.getByText("No practice tests yet", { exact: true })).toBeVisible();
    await expect(main.getByText("Create your first practice test", { exact: true })).toBeVisible();

    // Files — "Upload your first file to get started"
    await page.goto("/Files");
    await hydrated(page);
    await expect(main.getByText("No files yet", { exact: true })).toBeVisible();
    await expect(main.getByText("Upload your first file to get started")).toBeVisible();

    // -- Settings (S17-C): the per-tab headers + zero-empty states.
    await page.goto("/Settings");
    await hydrated(page);
    // Appearance opens with the reference's first line
    await expect(page.getByText("Customize how StudyFlow looks")).toBeVisible();
    // Subjects — header + the reference's zero-empty state
    await page.getByRole("tab", { name: /subjects/i }).click();
    await expect(page.getByText("Manage your subjects and classes")).toBeVisible();
    await expect(page.getByText("No subjects yet. Add your first subject to get started!")).toBeVisible();
    // Holidays — headers + the reference's zero-empty state
    await page.getByRole("tab", { name: /holidays/i }).click();
    await expect(page.getByText("Holidays & Breaks", { exact: true })).toBeVisible();
    await expect(page.getByText("Set your school holidays and breaks")).toBeVisible();
    await expect(page.getByText("No holidays set. Add your school holidays!")).toBeVisible();
  });
});

test.describe("S17-G · Study Groups mobile fallback (390px, fresh user)", () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  test.use({ viewport: { width: 390, height: 844 } });

  test("mobile empty state carries the reference's measured copy + placeholder", async ({ page }) => {
    await registerFreshUser(page, "sg-mobile");
    await page.goto("/StudyGroups");
    await hydrated(page);

    const main = page.locator("main");
    // the mobile fallback's empty state carries the reference's measured
    // copy (NOT the invented "plan meetings" hint). The reference's own
    // mobile layout squeezes the desktop two-pane (right pane clipped to
    // ~112px); the clone's stacked fallback is the S8-H superset, and the
    // desktop right pane's "Select a group" placeholder stays visible
    // above it (the content parity the reference carries in both panes).
    await expect(main.getByText("No study groups", { exact: true }).filter({ visible: true })).toBeVisible();
    await expect(main.getByText("Create a group to collaborate").filter({ visible: true })).toBeVisible();
    await expect(main.getByText("Create a group to plan meetings and keep everyone on track.")).toHaveCount(0);
    // the right pane's placeholder is present (the visible pane above the
    // fallback — single instance now that the fallback carries only the
    // list-empty state)
    await expect(main.getByText("Select a group", { exact: true }).filter({ visible: true })).toBeVisible();
    await expect(main.getByText("Choose a study group from the sidebar or create a new one").filter({ visible: true })).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// The Settings depth — the shared demo user (profile fields are
// account-scoped; every assertion re-writes its own state so the spec is
// idempotent across the persistent e2e db)
// ---------------------------------------------------------------------------

test.describe("S17-A · Profile tab: the study-profile fields", () => {
  test("renders + persists School Name, Grade Level, Daily Study Goal, Account created", async ({ page }) => {
    await page.goto("/Settings");
    await hydrated(page);
    await page.getByRole("tab", { name: /profile/i }).click();

    // the reference's per-tab header
    await expect(page.getByText("Your account and study information")).toBeVisible();

    // School Name input with the reference's placeholder
    const school = page.getByLabel("School Name");
    await expect(school).toHaveAttribute("placeholder", "Your school...");

    // Grade Level select with the 12 reference-measured options
    await page.getByRole("combobox").click();
    for (const grade of ["6th Grade", "9th Grade", "12th Grade", "College Freshman", "Graduate"]) {
      await expect(page.getByRole("option", { name: grade, exact: true })).toBeVisible();
    }
    await page.getByRole("option", { name: "College Senior", exact: true }).click();
    await expect(page.getByRole("combobox")).toHaveText(/College Senior/);

    // Daily Study Goal slider — the reference's 1–12 hour range
    const goal = page.locator("[role=slider]");
    await expect(goal).toHaveAttribute("aria-valuemin", "1");
    await expect(goal).toHaveAttribute("aria-valuemax", "12");
    await expect(page.getByText(/Daily Study Goal: \d+ hours?/)).toBeVisible();

    // the static Account-created line (the user record's createdAt)
    await expect(page.getByText(/^Account created: /)).toBeVisible();

    // Save Profile persists (fill → save → reload → values survive)
    await school.fill("E2e High School");
    await page.getByRole("button", { name: /save profile/i }).click();
    await expect(page.getByText(/saved/i).first()).toBeVisible({ timeout: 10000 });
    await page.reload();
    await hydrated(page);
    await page.getByRole("tab", { name: /profile/i }).click();
    await expect(page.getByLabel("School Name")).toHaveValue("E2e High School");
    await expect(page.getByRole("combobox")).toHaveText(/College Senior/);
  });
});

test.describe("S17-B · Notifications tab: the master toggle", () => {
  test("renders + persists the reference's Enable Notifications structure", async ({ page }) => {
    await page.goto("/Settings");
    await hydrated(page);
    await page.getByRole("tab", { name: /notifications/i }).click();

    // the reference's tab structure
    await expect(page.getByText("Manage your notification preferences")).toBeVisible();
    await expect(page.getByText("Enable Notifications", { exact: true })).toBeVisible();
    await expect(page.getByText("Receive reminders for tasks and assignments")).toBeVisible();

    // toggle off → Save Preferences → persists across reload
    const master = page.getByRole("switch", { name: "Enable Notifications" });
    const state = await master.getAttribute("data-state");
    if (state === "checked") await master.click();
    await expect(master).toHaveAttribute("data-state", "unchecked");
    await page.getByRole("button", { name: /save preferences/i }).last().click();
    await expect(page.getByText(/preferences saved/i).first()).toBeVisible({ timeout: 10000 });
    await page.reload();
    await hydrated(page);
    await page.getByRole("tab", { name: /notifications/i }).click();
    await expect(page.getByRole("switch", { name: "Enable Notifications" })).toHaveAttribute("data-state", "unchecked");

    // restore ON (leave the demo user tidy)
    await page.getByRole("switch", { name: "Enable Notifications" }).click();
    await page.getByRole("button", { name: /save preferences/i }).last().click();
    await expect(page.getByText(/preferences saved/i).first()).toBeVisible({ timeout: 10000 });
  });
});
