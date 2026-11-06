// Usage: node scripts/capture-s149-evidence.mjs
// (bun INCOMPATIBLE — the playwright request-API script class; node ≥ 23.6.)
//
// The S149/CX evidence frames — four surfaces on the REMEDIATED dev tree
// (localhost:3000):
//   1. 149-clone-desktop.png — the standing desktop dashboard chrome
//      (1440x900, the regression-net visual).
//   2. 149-clone-mobile-drawer.png — the standing mobile drawer open
//      (390x844 — the no-Tailwind-v4-mobile-nav-bug confirmation visual,
//      the 64th consecutive drawer-check GREEN's companion frame).
//   3. 149-clone-studygroups.png — the CX2 surface: the study-groups detail
//      (the members panel whose add/remove handlers now ride the per-group
//      members chain — the B-M2 fix's surface; the demo group's member list
//      + the inline add-member form).
//   4. 149-clone-settings-profile.png — the CX5 surface: the Settings
//      Profile tab (the Account card whose me-fetch failure now surfaces
//      the red alert + Retry — the B-L3 fix's surface; the demo session's
//      success shape: the email line + the createdAt line, the alert
//      absent, the child cards below).
//      The CX1 surface (the tasks/myday row toggles) rides the s148
//      standing desktop frame's task surfaces + the machine proof on the
//      UNIT layer (tests/data-store.test.ts — the three S149/CX1 chain
//      legs + the two wiring censuses; a double-click race is not
//      screenshot-provable, the CW2 runtime-split precedent).
// SELF-VERIFYING: every frame is re-read from disk — exists, > 10 KiB,
// byte-diverse (the non-blank pixel-variance proxy: the PNG buffer's
// distinct-byte census + dominant-byte share), and the four md5-distinct.
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
await desktop.page.screenshot({ path: `${OUT}/149-clone-desktop.png` });
console.log("captured 149-clone-desktop.png");
await desktop.page.close();

// ---- 2. the mobile drawer -------------------------------------------------
const mobile = await authedPage({ width: 390, height: 844 });
await mobile.page.getByRole("button", { name: "Open navigation menu" }).click();
await mobile.page.waitForTimeout(600);
await mobile.page.screenshot({ path: `${OUT}/149-clone-mobile-drawer.png` });
console.log("captured 149-clone-mobile-drawer.png");
await mobile.page.close();

// ---- 3. the study-groups detail (the CX2 surface) --------------------------
// The members panel: the demo group's member list + the inline add-member
// form — the surface whose add/remove handlers ride the per-group chain.
// (Direct-path navigation — the navigation.spec pattern, not a sidebar click.)
{
  const { page, ctx } = await authedPage({ width: 1440, height: 900 });
  await page.goto(`${CLONE}/StudyGroups`);
  // The pane is an <aside aria-label> (role=complementary, not region — the
  // detail pane's <section aria-label> is the region).
  await page
    .locator('aside[aria-label="Study groups pane"]')
    .waitFor({ state: "visible", timeout: 15_000 });
  // Select the first group (the demo seed ships at least one).
  await page.locator('aside[aria-label="Study groups pane"] button[aria-pressed]').first().click();
  await page
    .getByRole("region", { name: "Study group detail pane" })
    .waitFor({ state: "visible", timeout: 15_000 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/149-clone-studygroups.png` });
  console.log("captured 149-clone-studygroups.png");
  await page.close();
  await ctx.close();
}

// ---- 4. the Settings Profile tab (the CX5 surface) -------------------------
// The Account card — the surface whose failed me-fetch now renders the red
// alert + Retry (absent in the demo session's success shape: the email line
// + the createdAt line + the child cards). (Direct-path navigation — the
// auth.spec pattern.)
{
  const { page, ctx } = await authedPage({ width: 1440, height: 900 });
  await page.goto(`${CLONE}/Settings`);
  await page.getByRole("heading", { name: "Settings" }).waitFor({ state: "visible", timeout: 15_000 });
  await page.getByRole("tab", { name: "Profile" }).click();
  await page.getByRole("heading", { name: "Account" }).waitFor({ state: "visible", timeout: 15_000 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/149-clone-settings-profile.png` });
  console.log("captured 149-clone-settings-profile.png");
  await page.close();
  await ctx.close();
}

await browser.close();

// ---- the self-verification (the s143 convention) -------------------------
const frames = [
  "149-clone-desktop.png",
  "149-clone-mobile-drawer.png",
  "149-clone-studygroups.png",
  "149-clone-settings-profile.png",
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
