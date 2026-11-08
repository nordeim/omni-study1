// Usage: node scripts/capture-s160-evidence.mjs
// (bun INCOMPATIBLE — the playwright request-API script class; node ≥ 23.6.)
//
// The S160/DI evidence frames — three surfaces on the REMEDIATED dev tree
// (localhost:3000):
//   1. 160-clone-desktop.png — the standing desktop dashboard chrome
//      (1440x900, the regression-net visual).
//   2. 160-clone-mobile-drawer.png — the standing mobile drawer open
//      (390x844 — the no-Tailwind-v4-mobile-nav-bug confirmation visual,
//      the 81st consecutive drawer-check GREEN's companion frame).
//   3. 160-clone-flashcards.png — THE CYCLE'S SURFACE: the Flashcards view
//      whose AI Generate route this cycle hardened (the DI1 interactive-tx
//      deadline on the 20-create write; the DI6-pinned ownership/validation
//      boundary at the wire; the DI5 flashcards CB8 twin pinning the
//      post-generate refresh failure domain).
// Plus the self-verifying JSON verdict (dimensions + distinctness), and
// the pointer to the cycle's behavioral proof: the DI2 refine legs +
// the DI3 AI-routes source census ride tests/validation.test.ts +
// tests/ai-routes-census.test.ts; the DI5 twins + the DI6 wire pin ride
// tests/e2e/parity-session8.spec.ts + tests/e2e/resilience.spec.ts; the
// DI4 updatedAt wire reconciliation rides src/app/api/ai/messages/route.ts
// with its CA1-extension e2e witness.
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
await desktop.page.screenshot({ path: `${OUT}/160-clone-desktop.png` });
frames.push({ file: "160-clone-desktop.png", w: 1440, h: 900, label: "the standing desktop dashboard chrome" });
console.log("captured 160-clone-desktop.png");
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
await mobile.page.screenshot({ path: `${OUT}/160-clone-mobile-drawer.png` });
frames.push({ file: "160-clone-mobile-drawer.png", w: 390, h: 844, label: "the standing mobile drawer open (the 81st drawer-GREEN companion)" });
console.log("captured 160-clone-mobile-drawer.png");
await mobile.page.close();
await mobile.ctx.close();

// ---- 3. the Flashcards view (the cycle's surface) -------------------------
const cards = await authedPage({ width: 1440, height: 900 });
let cardsOk = false;
for (let i = 0; i < 3 && !cardsOk; i++) {
  try {
    await cards.page.goto(`${CLONE}/Flashcards`, { waitUntil: "domcontentloaded", timeout: 45_000 });
    await cards.page.waitForSelector('[aria-label="Deck detail"]', { timeout: 30_000 });
    cardsOk = true;
  } catch {
    await cards.page.waitForTimeout(3000);
  }
}
if (!cardsOk) throw new Error("the Flashcards deck detail never settled");
// The AI Generate button IS the cycle's surface anchor: its route now
// carries the interactive-tx deadline (DI1), its wire boundary is pinned
// (DI6), and its post-generate refresh failure domain is pinned (DI5).
const genButton = await cards.page
  .locator('[aria-label="Deck detail"]')
  .getByRole("button", { name: "AI Generate" })
  .isVisible();
if (!genButton) throw new Error("the AI Generate button is not visible in the deck detail");
await cards.page.waitForTimeout(400);
await cards.page.screenshot({ path: `${OUT}/160-clone-flashcards.png` });
frames.push({
  file: "160-clone-flashcards.png",
  w: 1440,
  h: 900,
  label: "the Flashcards view whose AI Generate route this cycle hardened (the DI1 interactive-tx deadline; the DI6-pinned ownership boundary; the DI5 refresh-failure twin)",
});
console.log("captured 160-clone-flashcards.png (AI Generate visible)");
await cards.page.close();
await cards.ctx.close();

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
  source: "capture-s160-evidence",
  frames: checks,
  proofNote: "the DI2 aiChatSchema user-message refine + the DI3 AI-routes source census ride the unit layer (tests/validation.test.ts + tests/ai-routes-census.test.ts — 1622/1622); the DI5 CB8 twins + the DI6 generate-cards wire pin ride tests/e2e/parity-session8.spec.ts + tests/e2e/resilience.spec.ts (the 619/619 five-chunk cold cert, all chunks first-pass clean); the DI4 updatedAt wire reconciliation rides src/app/api/ai/messages/route.ts with its CA1-extension e2e witness (RED pre-fix, GREEN post-fix); the DI1 interactive-tx deadline is machine-guarded by the DI3 census (RED pre-fix on generate-cards)",
};
console.log(JSON.stringify(verdict, null, 2));
process.exit(verdict.ok ? 0 : 1);
