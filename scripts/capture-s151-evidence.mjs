// Usage: node scripts/capture-s151-evidence.mjs
// (bun INCOMPATIBLE — the playwright request-API script class; node ≥ 23.6.)
//
// The S151/CZ evidence frames — five surfaces on the REMEDIATED dev tree
// (localhost:3000):
//   1. 151-clone-desktop.png — the standing desktop dashboard chrome
//      (1440x900, the regression-net visual).
//   2. 151-clone-mobile-drawer.png — the standing mobile drawer open
//      (390x844 — the no-Tailwind-v4-mobile-nav-bug confirmation visual,
//      the 66th consecutive drawer-check GREEN's companion frame).
//   3. 151-clone-notes-tags.png — the CZ1 surface: the Notes editor with
//      the tag row (the seeded "Dot product intuition" note — the tags
//      group + the Add tag input whose addTag/removeTag now declare
//      effects through the per-note setNoteTags chain instead of PATCHing
//      absolute arrays off the render snapshot — the B-M1 fix's surface).
//   4. 151-clone-files.png — the CZ2 surface: the Files view (the private
//      loader whose failed initial GET now surfaces the alert + Retry
//      instead of settling into the false "No files yet" — the B-L1 fix's
//      happy-path surface; the error leg is state-gated, so the seeded
//      list renders here).
//   5. 151-clone-focustimer.png — the CZ3 surface: the Focus Timer (the
//      Complete button whose never-started click now gates with its
//      reason instead of minting the phantom 1-second session — the
//      B-L3 fix's surface; the gate is behavioral, the chrome unchanged).
//      The CZ4 surface (the unit-save success toast) is a transient toast
//      — its machine proof rides the census layer (tests/
//      script-conventions.test.ts — the S151/CZ4 leg; the CW2 runtime-
//      split precedent: a transient toast is not screenshot-provable).
// SELF-VERIFYING: every frame is re-read from disk — exists, > 10 KiB,
// byte-diverse (the non-blank pixel-variance proxy: the PNG buffer's
// distinct-byte census + dominant-byte share), and the five md5-distinct.
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
  // S134: also wait for hydration — a goto issued while the auth gate is
  // still redirecting aborts (net::ERR_ABORTED, the mid-boot bounce).
  await page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true", null, { timeout: 30_000 });
  return { page, ctx };
}

// ---- 1. the desktop dashboard ---------------------------------------------
const desktop = await authedPage({ width: 1440, height: 900 });
await desktop.page.waitForTimeout(800);
await desktop.page.screenshot({ path: `${OUT}/151-clone-desktop.png` });
console.log("captured 151-clone-desktop.png");
await desktop.page.close();
await desktop.ctx.close();

// ---- 2. the mobile drawer -------------------------------------------------
const mobile = await authedPage({ width: 390, height: 844 });
await mobile.page.getByRole("button", { name: "Open navigation menu" }).click();
await mobile.page.waitForTimeout(600);
await mobile.page.screenshot({ path: `${OUT}/151-clone-mobile-drawer.png` });
console.log("captured 151-clone-mobile-drawer.png");
await mobile.page.close();
await mobile.ctx.close();

// ---- 3. the Notes editor tag row (the CZ1 surface) --------------------------
// The seeded "Dot product intuition" note open in the right pane — the
// editor title + the Note tags group + the Add tag input (the surface whose
// addTag/removeTag now ride the per-note chain). (The parity-session7 S7-F
// selection pattern.)
{
  const { page, ctx } = await authedPage({ width: 1440, height: 900 });
  await page.goto(`${CLONE}/Notes`);
  await page
    .getByRole("button", { name: /Dot product intuition/ })
    .first()
    .click();
  await page
    .locator('[aria-label="Note tags"]')
    .waitFor({ state: "visible", timeout: 15_000 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/151-clone-notes-tags.png` });
  console.log("captured 151-clone-notes-tags.png");
  await page.close();
  await ctx.close();
}

// ---- 4. the Files view (the CZ2 surface) ------------------------------------
// The private loader's happy-path chrome — the seeded files list + the
// Upload CTA (the failed-load alert + Retry is state-gated: only a failed
// initial GET renders it; the seeded happy path renders the list). The
// B-L1 fix's surface. (Direct-path navigation — the navigation.spec
// pattern.)
{
  const { page, ctx } = await authedPage({ width: 1440, height: 900 });
  await page.goto(`${CLONE}/Files`);
  await page.getByRole("heading", { name: "Files" }).waitFor({ state: "visible", timeout: 15_000 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/151-clone-files.png` });
  console.log("captured 151-clone-files.png");
  await page.close();
  await ctx.close();
}

// ---- 5. the Focus Timer (the CZ3 surface) -----------------------------------
// The timer chrome with the gated Complete button (the mode tabs + the
// ring + the Start/Pause, Reset, Complete controls — the never-started
// Complete now toasts its reason instead of minting the phantom session).
{
  const { page, ctx } = await authedPage({ width: 1440, height: 900 });
  await page.goto(`${CLONE}/FocusTimer`);
  await page
    .getByRole("heading", { name: "Focus Timer" })
    .waitFor({ state: "visible", timeout: 15_000 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/151-clone-focustimer.png` });
  console.log("captured 151-clone-focustimer.png");
  await page.close();
  await ctx.close();
}

await browser.close();

// ---- the self-verification (the s143 convention) -------------------------
const frames = [
  "151-clone-desktop.png",
  "151-clone-mobile-drawer.png",
  "151-clone-notes-tags.png",
  "151-clone-files.png",
  "151-clone-focustimer.png",
];
const verdict = { frames: {}, ok: true };
const md5s = new Set();
for (const name of frames) {
  const path = `${OUT}/${name}`;
  const info = statSync(path);
  const buf = readFileSync(path);
  const distinct = new Set(buf).size;
  const dominant =
    [...buf.slice(0, 200_000)].reduce((m, b) => {
      m.set(b, (m.get(b) ?? 0) + 1);
      return m;
    }, new Map());
  const dominantShare =
    Math.max(...dominant.values()) / Math.min(buf.length, 200_000);
  const md5 = createHash("md5").update(buf).digest("hex");
  md5s.add(md5);
  const checks = {
    exists: info.isFile(),
    sizeKiB: Math.round(info.size / 1024),
    bigEnough: info.size > 10 * 1024,
    byteDiverse: distinct > 40,
    dominantShareLt95: dominantShare < 0.95,
  };
  verdict.frames[name] = checks;
  if (!Object.values(checks).every(Boolean)) verdict.ok = false;
}
if (md5s.size !== frames.length) {
  verdict.ok = false;
  verdict.md5Distinct = false;
}

console.log(JSON.stringify(verdict, null, 2));
process.exit(verdict.ok ? 0 : 1);
