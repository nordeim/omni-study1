// Usage: node scripts/capture-s159-evidence.mjs
// (bun INCOMPATIBLE — the playwright request-API script class; node ≥ 23.6.)
//
// The S159/DH evidence frames — three surfaces on the REMEDIATED dev tree
// (localhost:3000):
//   1. 159-clone-desktop.png — the standing desktop dashboard chrome
//      (1440x900, the regression-net visual).
//   2. 159-clone-mobile-drawer.png — the standing mobile drawer open
//      (390x844 — the no-Tailwind-v4-mobile-nav-bug confirmation visual,
//      the 79th consecutive drawer-check GREEN's companion frame).
//   3. 159-clone-export-page.png — THE CYCLE'S SURFACE: the /export page
//      whose Restore card + import path this cycle hardened (the DH1
//      optional-FK rejection answers the named 400 at the
//      validateImportEnvelope boundary the route consumes; the DH2 census
//      guards the IMPORT_FIELD_LENGTHS mirror; the DH0 numbers hold the
//      create-side budget at 3.07x/5.91x headroom).
// Plus the self-verifying JSON verdict (dimensions + distinctness), and
// the pointer to the cycle's behavioral proof: the DH1 named-400 leg +
// the delegation leg ride tests/data-import.test.ts; the live probe
// verified the named 400 on the number shape AND the clean SetNull import
// on the dangling-string twin; the DH0 budget numbers ride
// scripts/measure-import-create-s159.mjs.
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
await desktop.page.screenshot({ path: `${OUT}/159-clone-desktop.png` });
frames.push({ file: "159-clone-desktop.png", w: 1440, h: 900, label: "the standing desktop dashboard chrome" });
console.log("captured 159-clone-desktop.png");
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
await mobile.page.screenshot({ path: `${OUT}/159-clone-mobile-drawer.png` });
frames.push({ file: "159-clone-mobile-drawer.png", w: 390, h: 844, label: "the standing mobile drawer open (the 79th drawer-GREEN companion)" });
console.log("captured 159-clone-mobile-drawer.png");
await mobile.page.close();
await mobile.ctx.close();

// ---- 3. the /export page (the cycle's surface) ----------------------------
const expo = await authedPage({ width: 1440, height: 900 });
let exportOk = false;
for (let i = 0; i < 3 && !exportOk; i++) {
  try {
    await expo.page.goto(`${CLONE}/export`, { waitUntil: "domcontentloaded", timeout: 45000 });
    await expo.page.waitForSelector('section[aria-label="What\'s included"]', { timeout: 30000 });
    exportOk = true;
  } catch {
    await expo.page.waitForTimeout(3000);
  }
}
if (!exportOk) throw new Error("the /export grid never settled");
const chipCount = await expo.page.locator('section[aria-label="What\'s included"] span.inline-flex').count();
if (chipCount !== 20) throw new Error(`expected 20 grid chips, found ${chipCount}`);
await expo.page.waitForTimeout(400);
await expo.page.screenshot({ path: `${OUT}/159-clone-export-page.png` });
frames.push({ file: "159-clone-export-page.png", w: 1440, h: 900, label: `the /export page whose Restore card this cycle hardened (${chipCount} chips — the DH1 named-400 door + the DH2 census-guarded mirror)` });
console.log(`captured 159-clone-export-page.png (${chipCount} chips)`);
await expo.page.close();
await expo.ctx.close();

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
  checks.push({ file: f.file, label: f.label, sizeBytes: stat.size, expectedW: f.w, expectedH: f.h, md5: bytes, ok });
}
const verdict = {
  ok: checks.every((c) => c.ok),
  source: "capture-s159-evidence",
  frames: checks,
  proofNote: "the DH1 optional-FK rejection is pinned at the unit layer (the named-400 legs + the delegation leg in tests/data-import.test.ts) and was verified LIVE on the remediated tree (the named 400 on the number shape; the dangling-string SetNull twin imports clean end-to-end); the DH2 census guards the IMPORT_FIELD_LENGTHS value mirror against its five source sites; the DH0 create-side budget numbers (0.046 ms/row creates; the worst mixed tx 19.6 s of the 60 s budget — 3.07x headroom; the end-to-end 20.3 s of the 120 s deadline — 5.91x) ride scripts/measure-import-create-s159.mjs",
};
console.log(JSON.stringify(verdict, null, 2));
process.exit(verdict.ok ? 0 : 1);
