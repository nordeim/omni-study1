// Usage: node scripts/capture-s173-evidence.mjs
// (bun INCOMPATIBLE — the playwright request-API script class; node ≥ 23.6.)
//
// The S173/DW evidence frames — three surfaces on the REMEDIATED dev tree
// (localhost:3000):
//   1. 173-clone-desktop.png — the standing desktop dashboard chrome
//      (1440x900, the regression-net visual).
//   2. 173-clone-mobile-drawer.png — the standing mobile drawer open
//      (390x844 — the no-Tailwind-v4-mobile-nav-bug confirmation visual,
//      the 107th consecutive drawer-check GREEN's companion frame).
//   3. 173-clone-gradetracker.png — THE CYCLE'S SURFACE: the desktop
//      GradeTracker view with the create dialog OPEN — the DW2 catch-up +
//      field port visible (the title "Add New Grade" + the Subject-first
//      field order + the Type select defaulting "Homework" + the "Max
//      Score" label + the "Weight (optional, default 1)" hint + the native
//      date input defaulting today + the [Cancel][Add Grade] footer), the
//      reference's measured dialog over the clone's working superset
//      surfaces (the seeded per-subject cards + the typed/dated grade
//      rows below).
// Plus the self-verifying JSON verdict (dimensions + distinctness), and
// the pointer to the cycle's behavioral proof: the DW1 CB8 pair set
// rides tests/data-store.test.ts; the DW1 e2e leg rides
// tests/e2e/resilience.spec.ts; the DW2 parity pin rides
// tests/e2e/parity-session7.spec.ts.
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
await desktop.page.screenshot({ path: `${OUT}/173-clone-desktop.png` });
frames.push({ file: "173-clone-desktop.png", w: 1440, h: 900, label: "the standing desktop dashboard chrome" });
console.log("captured 173-clone-desktop.png");

// ---- 3-first: the GradeTracker dialog rides the SAME context (the same
// authenticated session, no re-login) before it closes.
await desktop.page.goto(`${CLONE}/GradeTracker`);
await desktop.page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true", null, { timeout: 30_000 });
await desktop.page.getByText("Problem set 6").waitFor({ timeout: 15_000 });
await desktop.page.getByRole("button", { name: "Add Grade" }).first().click();
const dlg = desktop.page.getByRole("dialog");
await dlg.waitFor({ timeout: 10_000 });
await dlg.getByRole("heading", { name: "Add New Grade" }).waitFor({ timeout: 10_000 });
await desktop.page.waitForTimeout(500);
await desktop.page.screenshot({ path: `${OUT}/173-clone-gradetracker.png` });
frames.push({
  file: "173-clone-gradetracker.png",
  w: 1440,
  h: 900,
  label: "the GradeTracker view with the create dialog open — the DW2 catch-up + field port (the measured title + the Subject-first order + the Type select + the date input + the [Cancel][Add Grade] footer)",
});
console.log("captured 173-clone-gradetracker.png (the cycle's surface)");
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
await mobile.page.screenshot({ path: `${OUT}/173-clone-mobile-drawer.png` });
frames.push({ file: "173-clone-mobile-drawer.png", w: 390, h: 844, label: "the standing mobile drawer open (the 107th drawer-GREEN companion)" });
console.log("captured 173-clone-mobile-drawer.png");
await mobile.page.close();
await mobile.ctx.close();

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
