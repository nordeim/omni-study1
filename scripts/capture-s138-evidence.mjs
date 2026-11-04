// S138 (Batch CM) evidence capture — the exemption-hardening + KPI-gate +
// containment-decrement + honest-form set. Three frames on the REMEDIATED
// tree:
//   1. the standing desktop dashboard (1440x900) — the CM2 KPI row in its
//      SETTLED state (the four honest stat cards; the OR-form gate only
//      owns the row while a primary source is in flight, pinned at the
//      wire by the resilience leg)
//   2. the standing mobile drawer (390x844)
//   3. the cycle's own surface — the timetable's Grid Builder button in
//      its honest stateless form (CM6): the parity-pinned outline button,
//      now with NO pressed semantics — self-verifying before the frame
//      (the pre-fix form announced aria-pressed, a state that never did
//      anything; the reference's own button, measured live this cycle, is
//      the same no-op). Clicking it changes nothing — the frame captures
//      the unchanged toolbar.
// Usage: node scripts/capture-s138-evidence.mjs
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

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
  return page;
}

// ---- 1. the desktop dashboard -------------------------------------------
let page = await authedPage({ width: 1440, height: 900 });
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/138-clone-desktop-dashboard.png` });
console.log("captured 138-clone-desktop-dashboard.png");
await page.close();

// ---- 2. the mobile drawer ------------------------------------------------
page = await authedPage({ width: 390, height: 844 });
await page.getByRole("button", { name: "Open navigation menu" }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/138-clone-mobile-drawer.png` });
console.log("captured 138-clone-mobile-drawer.png");
await page.close();

// ---- 3. the CM6 timetable Grid Builder honest form ------------------------
{
  const page3 = await authedPage({ width: 1280, height: 900 });
  try {
    await page3.goto(`${CLONE}/Timetable`);
    await page3.waitForFunction(() => document.documentElement.dataset.appHydrated === "true", null, { timeout: 30_000 });
    // The SELF-VERIFYING wait: the frame only captures once the toolbar's
    // Grid Builder button carries NO pressed semantics (the pre-fix form
    // flipped aria-pressed on click, announcing a state that never existed).
    await page3.waitForFunction(() => {
      const btn = [...document.querySelectorAll("button")].find(
        (b) => b.textContent?.trim() === "Grid Builder",
      );
      return !!btn && btn.getAttribute("aria-pressed") === null;
    }, null, { timeout: 15_000 });
    // Click it — the honest no-op (the reference's own measured behavior).
    await page3.getByRole("button", { name: "Grid Builder" }).click();
    await page3.waitForTimeout(400);
    await page3.screenshot({ path: `${OUT}/138-clone-timetable-grid-builder.png` });
    console.log("captured 138-clone-timetable-grid-builder.png");
    // The post-click verification: still no pressed semantics, no dialog,
    // the toolbar unchanged (the stateless honest form).
    const stillClean = await page3.evaluate(() => {
      const btn = [...document.querySelectorAll("button")].find(
        (b) => b.textContent?.trim() === "Grid Builder",
      );
      return (
        btn?.getAttribute("aria-pressed") === null &&
        !document.querySelector('[role="dialog"], [role="alertdialog"]')
      );
    });
    console.log(`grid builder stays stateless after click: ${stillClean}`);
  } finally {
    await page3.close();
  }
}

await browser.close();
console.log("S138 evidence capture complete.");
