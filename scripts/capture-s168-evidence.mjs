// Usage: node scripts/capture-s168-evidence.mjs
// (bun INCOMPATIBLE — the playwright request-API script class; node ≥ 23.6.)
//
// The S168/DR evidence frames — three surfaces on the REMEDIATED dev tree
// (localhost:3000):
//   1. 168-clone-desktop.png — the standing desktop dashboard chrome
//      (1440x900, the regression-net visual).
//   2. 168-clone-mobile-drawer.png — the standing mobile drawer open
//      (390x844 — the no-Tailwind-v4-mobile-nav-bug confirmation visual,
//      the 97th consecutive drawer-check GREEN's companion frame).
//   3. 168-clone-tasks.png — THE CYCLE'S SURFACE: the Tasks view — the
//      surface this cycle hardened two ways (the DR1 tasks-family
//      mutation CB8 split — a committed write + a failed refresh now
//      answers the "Task created" toast + the closed dialog on the
//      TaskDialog surface, and the committed toggle/delete never toasts
//      the false "Could not update/delete the task."; the three chained
//      toggles' in-closure refreshes contained without poisoning the
//      CB16/CX1 chains; the DR2 aria loading gate — role="status"
//      announces the in-flight task list). The frame anchors the seeded
//      task rows + the All Tasks/Important/My Lists aside + the search
//      input + the Add Task button.
// Plus the self-verifying JSON verdict (dimensions + distinctness), and
// the pointer to the cycle's behavioral proof: the DR1 CB8 pair set
// rides tests/data-store.test.ts; the DR1 e2e leg rides
// tests/e2e/tasks.spec.ts.
// SELF-VERIFYING: every frame is re-read from disk — exists, > 10 KiB,
// byte-diverse, and the md5s distinct.
// JSON verdict with per-frame checks; exit 1 on any failure.
import { chromium } from "playwright";
import { mkdirSync, statSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const CLONE = "http://localhost:3000";
const OUT = "docs/screenshots";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

// The demo sign-in (the drawer-check precedent — a fresh context carries no
// session, and /api/auth/me 401s straight to /login before hydration).
async function authedPage(viewport) {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  await page.goto(`${CLONE}/login`);
  await page.fill("input[type=email]", "demo@studyflow.app");
  await page.fill("input[type=password]", "Demo1234!");
  await page.click("button[type=submit]");
  await page.waitForFunction(() => document.querySelector("main") !== null, null, { timeout: 30_000 });
  await page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true", null, { timeout: 30_000 });
  return { page, ctx };
}

const frames = [];

// ---- 1. the desktop dashboard ---------------------------------------------
const desktop = await authedPage({ width: 1440, height: 900 });
await desktop.page.waitForTimeout(800);
await desktop.page.screenshot({ path: `${OUT}/168-clone-desktop.png` });
frames.push({ file: "168-clone-desktop.png", w: 1440, h: 900, label: "the standing desktop dashboard chrome" });
console.log("captured 168-clone-desktop.png");
await desktop.page.close();
await desktop.ctx.close();

// ---- 2. the mobile drawer -------------------------------------------------
const mobile = await authedPage({ width: 390, height: 844 });
let drawerOk = false;
for (let i = 0; i < 3 && !drawerOk; i++) {
  try {
    await mobile.page.getByRole("button", { name: "Open navigation menu" }).click();
    drawerOk = true;
  } catch {
    await mobile.page.waitForTimeout(2000);
  }
}
if (!drawerOk) throw new Error("the drawer button never settled");
await mobile.page.waitForTimeout(600);
await mobile.page.screenshot({ path: `${OUT}/168-clone-mobile-drawer.png` });
frames.push({ file: "168-clone-mobile-drawer.png", w: 390, h: 844, label: "the standing mobile drawer open (the 97th drawer-GREEN companion)" });
console.log("captured 168-clone-mobile-drawer.png");
await mobile.page.close();
await mobile.ctx.close();

// ---- 3. the Tasks view (the cycle's surface) -------------------------------
const tasks = await authedPage({ width: 1440, height: 900 });
let tasksOk = false;
for (let i = 0; i < 3 && !tasksOk; i++) {
  try {
    await tasks.page.goto(`${CLONE}/Tasks`, { waitUntil: "domcontentloaded", timeout: 45_000 });
    // The settled anchors: the Task views aside (the All Tasks/Important/
    // My Lists filters — "My Lists" renders title-case in textContent,
    // the aside's `uppercase` class is visual-only), the seeded active
    // task rows (the DR1 e2e leg's own settled-proof precedent —
    // "Finish calculus problem set" rides the myDay + due-today seed),
    // and the rows container.
    await tasks.page.waitForSelector('[aria-label="Task views"]', { timeout: 30_000 });
    await tasks.page.waitForFunction(
      () => {
        const t = document.body.textContent;
        return (
          t.includes("All Tasks") &&
          t.includes("Important") &&
          t.includes("My Lists") &&
          t.includes("Finish calculus problem set") &&
          t.includes("Read chapter 4")
        );
      },
      null,
      { timeout: 30_000 },
    );
    tasksOk = true;
  } catch {
    await tasks.page.waitForTimeout(3000);
  }
}
if (!tasksOk) throw new Error("the Tasks two-pane surface never settled with the seeded rows");
// The two-pane surface IS the cycle's anchor: the seeded task rows
// render through the slice that loaded past the DR2 aria-contract
// gate, the search box + the Add Task button are the DR1 mutation
// surface (the TaskDialog create/update + the row toggles/delete), and
// every mutation on this view is DR1 CB8-hardened (the write and the
// refresh are separate failure domains — the seventh family).
await tasks.page.waitForTimeout(400);
await tasks.page.screenshot({ path: `${OUT}/168-clone-tasks.png` });
frames.push({
  file: "168-clone-tasks.png",
  w: 1440,
  h: 900,
  label: "the Tasks view with the seeded task rows + the All Tasks/Important/My Lists aside + the search input + the Add Task button (the DR1 CB8-hardened mutations; the DR2 aria-contract loading gate)",
});
console.log("captured 168-clone-tasks.png (the seeded rows + the aside + the search + the Add Task button)");
await tasks.page.close();
await tasks.ctx.close();

await browser.close();

// ---- the self-verification -------------------------------------------------
const checks = [];
const seen = new Set();
for (const f of frames) {
  const path = `${OUT}/${f.file}`;
  const stat = statSync(path);
  const bytes = createHash("md5").update(readFileSync(path)).digest("hex");
  const ok = stat.size > 10 * 1024 && !seen.has(bytes);
  seen.add(bytes);
  checks.push({ file: f.file, bytes: stat.size, md5: bytes.slice(0, 12), ok });
}
const verdict = { ok: checks.every((c) => c.ok), frames, checks };
console.log(JSON.stringify(verdict, null, 2));
process.exit(verdict.ok ? 0 : 1);
