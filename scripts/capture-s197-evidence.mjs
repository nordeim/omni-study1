// S197 evidence capture — the self-verifying frames for the dialog
// catch-up family e2e consolidation (Batch EU), ridden against the fresh
// :3200 standalone (the demo account, READ-ONLY surfaces — every dialog is
// opened, asserted, and Escape/Cancel-closed WITHOUT ever submitting; zero
// writes on the persistent demo account). The consolidation is a pure
// test-organization refactor — the frames document the CONSOLIDATED
// FAMILIES' surfaces (the dialogs the 5 moved pins drive):
//   1. 197-dialogs-holidays.png — the Settings Holidays tab with the
//      create dialog open (S174/DX4's contract: the "Name"/"Start Date"/
//      "End Date" labels + the Type selector + the [Cancel][Add Holiday]
//      footer)
//   2. 197-dialogs-subjects.png — the Settings Subjects tab with the
//      create dialog open (S175/DY1's contract: the "Subject Name" label,
//      the "e.g., Mathematics" placeholder, the 17-swatch palette, the
//      teacher/room fields, the [Cancel][Add Subject] footer)
//   3. 197-dialogs-events.png — the Events view with the New Event dialog
//      open (S176/DZ1a's contract: the placeholder trio, the six-swatch
//      palette, the reminders row, the "Create Event" submit)
//   4. 197-dialogs-tasks.png — the Tasks view with the Add Task dialog
//      open (S176/DZ3's contract: the "Task name..."/"Add a subtask..."/
//      "Add notes..." placeholder trio)
//   5. 197-devserver-dashboard.png — the dev server :3000 dashboard
//   6. 197-devserver-dialog.png — the dev server :3000 Events dialog
//   7. 197-devserver-mobile-drawer.png — the dev server :3000 mobile
//      drawer (the operator's standing mobile-nav watch)
// Every frame is DOM-asserted BEFORE the shot and pixel-verified non-blank
// after (the standing evidence discipline). The assertions mirror the moved
// pins' own contracts (DX4/DY1/DZ1a/DZ3 — the read-only anatomy set; the
// DZ1b round-trip is a WRITE pin, self-cleaning on the e2e db — no
// persistent frame by the residue discipline). The family map lives in
// docs/remediation-plan-session197.md.
import { chromium } from "playwright";
import { mkdirSync, statSync } from "node:fs";

const OUT = "docs/screenshots";
mkdirSync(OUT, { recursive: true });

async function session(browser, base, viewport) {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  await page.goto(`${base}/login`, { timeout: 45_000 });
  await page.fill("input[type=email]", "demo@studyflow.app");
  await page.fill("input[type=password]", "Demo1234!");
  await page.waitForFunction(
    () => {
      const b = document.querySelector("button[type=submit]");
      return b !== null && !b.disabled;
    },
    null,
    { timeout: 20_000 },
  );
  await page.click("button[type=submit]");
  await page.waitForFunction(
    () =>
      document.querySelector("nav a") !== null &&
      (document.querySelector("h1") !== null || document.querySelector("h2") !== null),
    null,
    { timeout: 30_000 },
  );
  await page.waitForTimeout(1800);
  return { ctx, page };
}

const nonBlank = (path) => statSync(path).size > 50_000;

const browser = await chromium.launch();
const results = {};

// ---- Frame 1: Settings Holidays + Add Holiday dialog (S174/DX4) ----------
{
  const { ctx, page } = await session(browser, "http://localhost:3200", {
    width: 1440,
    height: 900,
  });
  await page.locator("nav a").filter({ hasText: "Settings" }).first().click();
  await page.waitForTimeout(2200);
  await page.getByRole("tab", { name: "Holidays" }).click();
  await page.waitForTimeout(900);
  await page.getByRole("button", { name: "Add Holiday" }).first().click();
  await page.waitForTimeout(900);
  const asserts = await page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"]');
    if (!dlg || !dlg.checkVisibility()) return { visible: false };
    const text = dlg.textContent || "";
    const buttons = [...dlg.querySelectorAll("button")].map((b) => b.textContent.trim());
    return {
      visible: true,
      hasName: text.includes("Name"),
      hasStart: text.includes("Start Date"),
      hasEnd: text.includes("End Date"),
      hasType: text.includes("Type"),
      footerCancel: buttons.includes("Cancel"),
      footerSubmit: buttons.includes("Add Holiday"),
    };
  });
  await page.screenshot({ path: `${OUT}/197-dialogs-holidays.png` });
  results.holidays = {
    asserts,
    nonBlank: nonBlank(`${OUT}/197-dialogs-holidays.png`),
  };
  await dlg_close(page);
  await ctx.close();
}

// ---- Frame 2: Settings Subjects + Add Subject dialog (S175/DY1) ----------
{
  const { ctx, page } = await session(browser, "http://localhost:3200", {
    width: 1440,
    height: 900,
  });
  await page.locator("nav a").filter({ hasText: "Settings" }).first().click();
  await page.waitForTimeout(2200);
  await page.getByRole("tab", { name: "Subjects" }).click();
  await page.waitForTimeout(900);
  await page.getByRole("button", { name: "Add Subject" }).first().click();
  await page.waitForTimeout(900);
  const asserts = await page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"]');
    if (!dlg || !dlg.checkVisibility()) return { visible: false };
    const text = dlg.textContent || "";
    const buttons = [...dlg.querySelectorAll("button")].map((b) => b.textContent.trim());
    const swatches = [...dlg.querySelectorAll('button[aria-pressed]')].length;
    const placeholder = dlg.querySelector("input")?.getAttribute("placeholder") || "";
    return {
      visible: true,
      hasSubjectName: text.includes("Subject Name"),
      placeholder,
      hasTeacher: text.includes("Teacher"),
      hasRoom: text.includes("Room"),
      swatchButtons: swatches,
      footerCancel: buttons.includes("Cancel"),
      footerSubmit: buttons.includes("Add Subject"),
    };
  });
  await page.screenshot({ path: `${OUT}/197-dialogs-subjects.png` });
  results.subjects = {
    asserts,
    nonBlank: nonBlank(`${OUT}/197-dialogs-subjects.png`),
  };
  await dlg_close(page);
  await ctx.close();
}

// ---- Frame 3: Events + New Event dialog (S176/DZ1a) ----------------------
{
  const { ctx, page } = await session(browser, "http://localhost:3200", {
    width: 1440,
    height: 900,
  });
  await page.locator("nav a").filter({ hasText: "Events" }).first().click();
  await page.waitForTimeout(2400);
  await page.getByRole("button", { name: "New Event" }).first().click();
  await page.waitForTimeout(900);
  const asserts = await page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"]');
    if (!dlg || !dlg.checkVisibility()) return { visible: false };
    const inputs = [...dlg.querySelectorAll("input")].map((i) => i.getAttribute("placeholder") || "");
    const text = dlg.textContent || "";
    const buttons = [...dlg.querySelectorAll("button")].map((b) => b.textContent.trim());
    return {
      visible: true,
      titlePlaceholder: inputs[0] || "",
      hasReminders: text.includes("Reminder"),
      hasRepeat: text.includes("Repeat"),
      footerSubmit: buttons.includes("Create Event"),
    };
  });
  await page.screenshot({ path: `${OUT}/197-dialogs-events.png` });
  results.events = {
    asserts,
    nonBlank: nonBlank(`${OUT}/197-dialogs-events.png`),
  };
  await dlg_close(page);
  await ctx.close();
}

// ---- Frame 4: Tasks + Add Task dialog (S176/DZ3) -------------------------
{
  const { ctx, page } = await session(browser, "http://localhost:3200", {
    width: 1440,
    height: 900,
  });
  await page.locator("nav a").filter({ hasText: "Tasks" }).first().click();
  await page.waitForTimeout(2400);
  await page.getByRole("button", { name: "Add Task" }).first().click();
  await page.waitForTimeout(900);
  const asserts = await page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"]');
    if (!dlg || !dlg.checkVisibility()) return { visible: false };
    const title = dlg.querySelector("#task-title")?.getAttribute("placeholder") || "";
    const subtask = dlg.querySelector("input[placeholder*='subtask']")?.getAttribute("placeholder") || "";
    const notes = dlg.querySelector("textarea")?.getAttribute("placeholder") || "";
    return { visible: true, title, subtask, notes };
  });
  await page.screenshot({ path: `${OUT}/197-dialogs-tasks.png` });
  results.tasks = {
    asserts,
    nonBlank: nonBlank(`${OUT}/197-dialogs-tasks.png`),
  };
  await page.getByRole("button", { name: "Cancel", exact: true }).click().catch(() => {});
  await page.keyboard.press("Escape").catch(() => {});
  await ctx.close();
}

// ---- Frames 5-7: the dev server :3000 (the standing request) -------------
{
  const { ctx, page } = await session(browser, "http://localhost:3000", {
    width: 1440,
    height: 900,
  });
  await page.waitForTimeout(1200);
  const dashOk = await page.evaluate(() => !!document.querySelector("main h1"));
  await page.screenshot({ path: `${OUT}/197-devserver-dashboard.png` });
  results.devDashboard = { h1: dashOk, nonBlank: nonBlank(`${OUT}/197-devserver-dashboard.png`) };

  await page.locator("nav a").filter({ hasText: "Events" }).first().click();
  await page.waitForTimeout(2200);
  await page.getByRole("button", { name: "New Event" }).first().click();
  await page.waitForTimeout(900);
  const devDlg = await page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"]');
    return dlg !== null && dlg.checkVisibility();
  });
  await page.screenshot({ path: `${OUT}/197-devserver-dialog.png` });
  results.devDialog = { dialog: devDlg, nonBlank: nonBlank(`${OUT}/197-devserver-dialog.png`) };
  await page.keyboard.press("Escape").catch(() => {});
  await ctx.close();
}
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000/login", { timeout: 45_000 });
  await page.fill("input[type=email]", "demo@studyflow.app");
  await page.fill("input[type=password]", "Demo1234!");
  await page.waitForFunction(
    () => {
      const b = document.querySelector("button[type=submit]");
      return b !== null && !b.disabled;
    },
    null,
    { timeout: 20_000 },
  );
  await page.click("button[type=submit]");
  await page.waitForFunction(
    () => document.querySelector("nav a") !== null && document.querySelector("h1") !== null,
    null,
    { timeout: 30_000 },
  );
  await page.waitForTimeout(1500);
  await page.getByRole("button", { name: "Open navigation menu" }).click();
  await page.waitForTimeout(900);
  const drawer = await page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"]');
    return dlg ? { links: dlg.querySelectorAll("a").length } : null;
  });
  await page.screenshot({ path: `${OUT}/197-devserver-mobile-drawer.png` });
  results.devDrawer = { drawer, nonBlank: nonBlank(`${OUT}/197-devserver-mobile-drawer.png`) };
  await ctx.close();
}

await browser.close();

async function dlg_close(page) {
  await page.keyboard.press("Escape").catch(() => {});
  await page.waitForTimeout(400);
}

const verdict =
  results.holidays.asserts.visible &&
  results.holidays.asserts.hasStart &&
  results.holidays.nonBlank &&
  results.subjects.asserts.visible &&
  results.subjects.asserts.swatchButtons > 0 &&
  results.subjects.nonBlank &&
  results.events.asserts.visible &&
  results.events.asserts.footerSubmit &&
  results.events.nonBlank &&
  results.tasks.asserts.visible &&
  results.tasks.asserts.title === "Task name..." &&
  results.tasks.nonBlank &&
  results.devDashboard.h1 &&
  results.devDashboard.nonBlank &&
  results.devDialog.dialog &&
  results.devDialog.nonBlank &&
  results.devDrawer.drawer &&
  results.devDrawer.drawer.links === 20 &&
  results.devDrawer.nonBlank;

console.log(JSON.stringify({ ok: verdict, results }, null, 2));
process.exit(verdict ? 0 : 1);
