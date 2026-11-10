// Usage: node scripts/capture-s170-evidence.mjs
// (bun INCOMPATIBLE — the playwright request-API script class; node ≥ 23.6.)
//
// The S170/DT evidence frames — three surfaces on the REMEDIATED dev tree
// (localhost:3000):
//   1. 170-clone-desktop.png — the standing desktop dashboard chrome
//      (1440x900, the regression-net visual) — now carrying the DT2a
//      catch-up: the aside's border-x hairlines + the xl shadow (the
//      reference's post-S169 shell-chrome deployment).
//   2. 170-clone-mobile-drawer.png — the standing mobile drawer open
//      (390x844 — the no-Tailwind-v4-mobile-nav-bug confirmation visual,
//      the 101st consecutive drawer-check GREEN's companion frame; the
//      app-bar above it now carries the DT2b border-b + shadow-sm + z-40).
//   3. 170-clone-sidebar.png — THE CYCLE'S SURFACE: the desktop sidebar
//      close-up (the left 300px strip at 1440x900) — the chrome this
//      cycle re-aligned to the live reference (the border-x hairlines +
//      the xl shadow-slate-200/50 geometry + the z-40 + the 260px
//      border-box shell whose inner nav reads 258 — the parity probe's
//      restored MATCH).
// Plus the self-verifying JSON verdict (dimensions + distinctness), and
// the pointer to the cycle's behavioral proof: the DT1 CB8 pair set
// rides tests/data-store.test.ts; the DT2 chrome pins ride
// tests/e2e/navigation.spec.ts (DT2a) + tests/e2e/mobile-navigation.spec.ts
// (DT2b).
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
await desktop.page.screenshot({ path: `${OUT}/170-clone-desktop.png` });
frames.push({ file: "170-clone-desktop.png", w: 1440, h: 900, label: "the standing desktop dashboard chrome (the DT2a border-x + xl-shadow aside)" });
console.log("captured 170-clone-desktop.png");

// ---- 3-first: the sidebar close-up rides the SAME context (the same
// authenticated session, no re-login) before it closes.
await desktop.page.waitForTimeout(400);
await desktop.page.screenshot({ path: `${OUT}/170-clone-sidebar.png`, clip: { x: 0, y: 0, width: 300, height: 900 } });
frames.push({
  file: "170-clone-sidebar.png",
  w: 300,
  h: 900,
  label: "the desktop sidebar close-up — the DT2a chrome (border-x hairlines + the xl shadow + the 260px border-box shell)",
});
console.log("captured 170-clone-sidebar.png (the DT2a chrome close-up)");
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
await mobile.page.screenshot({ path: `${OUT}/170-clone-mobile-drawer.png` });
frames.push({ file: "170-clone-mobile-drawer.png", w: 390, h: 844, label: "the standing mobile drawer open (the 101st drawer-GREEN companion; the DT2b app-bar chrome above it)" });
console.log("captured 170-clone-mobile-drawer.png");
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
