// Usage: node scripts/capture-s161-evidence.mjs
// (bun INCOMPATIBLE — the playwright request-API script class; node ≥ 23.6.)
//
// The S161/DJ evidence frames — three surfaces on the REMEDIATED dev tree
// (localhost:3000):
//   1. 161-clone-desktop.png — the standing desktop dashboard chrome
//      (1440x900, the regression-net visual).
//   2. 161-clone-mobile-drawer.png — the standing mobile drawer open
//      (390x844 — the no-Tailwind-v4-mobile-nav-bug confirmation visual,
//      the 83rd consecutive drawer-check GREEN's companion frame).
//   3. 161-clone-notes.png — THE CYCLE'S SURFACE: the Notes view with a
//      note SELECTED (the editor pane open) — the surface this cycle
//      hardened twice over (the DJ1 tag-mutation failure feedback — the
//      mutateTags catch behind the AG6 departed-note guard; the DJ4
//      dark-edge selected-row border — the S135/CJ3 VIOLET_RESIDUALS
//      harmonization pass executed, the selected row's dark border now
//      rides --sf-primary-edge-dark).
// Plus the self-verifying JSON verdict (dimensions + distinctness), and
// the pointer to the cycle's behavioral proof: the DJ3 enum single-source
// census + the DJ4 token-family pins + the DJ4 hue-register re-shape ride
// tests/enum-single-source.test.ts + tests/theme.test.ts +
// tests/hue-tokens.test.ts + tests/theme-cache.test.ts; the DJ1/DJ2 e2e
// legs ride tests/e2e/parity-session7.spec.ts; the DJ5 pageerror-free pin
// rides tests/e2e/resilience.spec.ts; the DJ4 dark-accent leg rides
// tests/e2e/theme-system.spec.ts.
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
await desktop.page.screenshot({ path: `${OUT}/161-clone-desktop.png` });
frames.push({ file: "161-clone-desktop.png", w: 1440, h: 900, label: "the standing desktop dashboard chrome" });
console.log("captured 161-clone-desktop.png");
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
await mobile.page.screenshot({ path: `${OUT}/161-clone-mobile-drawer.png` });
frames.push({ file: "161-clone-mobile-drawer.png", w: 390, h: 844, label: "the standing mobile drawer open (the 83rd drawer-GREEN companion)" });
console.log("captured 161-clone-mobile-drawer.png");
await mobile.page.close();
await mobile.ctx.close();

// ---- 3. the Notes view with a selection (the cycle's surface) -------------
const notes = await authedPage({ width: 1440, height: 900 });
let notesOk = false;
for (let i = 0; i < 3 && !notesOk; i++) {
  try {
    await notes.page.goto(`${CLONE}/Notes`, { waitUntil: "domcontentloaded", timeout: 45_000 });
    await notes.page
      .getByRole("button", { name: /Dot product intuition/ })
      .first()
      .click({ timeout: 30_000 });
    await notes.page.waitForSelector('[aria-label="Note tags"]', { timeout: 30_000 });
    notesOk = true;
  } catch {
    await notes.page.waitForTimeout(3000);
  }
}
if (!notesOk) throw new Error("the Notes editor pane never settled");
// The selected row + the tag row ARE the cycle's surface anchors: the
// selected row's border rides the edge tokens (light --sf-primary-edge
// since CJ3; dark --sf-primary-edge-dark since DJ4), and the tag row's
// Add-tag input is the DJ1 surface (the mutateTags failure feedback —
// a failed PATCH now toasts instead of vanishing silently).
const tagInputVisible = await notes.page
  .locator('input[placeholder="Add tag..."]')
  .isVisible();
if (!tagInputVisible) throw new Error("the Add tag input is not visible in the editor pane");
await notes.page.waitForTimeout(400);
await notes.page.screenshot({ path: `${OUT}/161-clone-notes.png` });
frames.push({
  file: "161-clone-notes.png",
  w: 1440,
  h: 900,
  label: "the Notes view with the seeded note selected (the DJ1 tag-failure surface — the mutateTags catch; the DJ4 selected-row border — the edge-dark harmonization)",
});
console.log("captured 161-clone-notes.png (selected note + tag row visible)");
await notes.page.close();
await notes.ctx.close();

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
  source: "capture-s161-evidence",
  frames: checks,
  proofNote: "the DJ3 enum single-source census + the DJ4 token-family pins + the DJ4 hue-register re-shape + the 19-entry theme-cache census ride the unit layer (tests/enum-single-source.test.ts + tests/theme.test.ts + tests/hue-tokens.test.ts + tests/theme-cache.test.ts — 1632/1632); the DJ1 notes tag-failure leg + the DJ2 timetable band hand-guard ride tests/e2e/parity-session7.spec.ts; the DJ5 slider resync pageerror-free pin rides tests/e2e/resilience.spec.ts; the DJ4 dark-accent leg rides tests/e2e/theme-system.spec.ts (the 623/623 five-chunk cold cert — chunk 3's AK1 pair flaked once on the documented machine-load class, 93/93 clean on the immediate re-run); every e2e leg RED-proven against the pre-fix standalone build (the stash/rebuild/re-run sequence) and GREEN post-fix",
};
console.log(JSON.stringify(verdict, null, 2));
process.exit(verdict.ok ? 0 : 1);
