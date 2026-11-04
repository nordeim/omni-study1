// S139 (Batch CN) evidence capture — the parity-integrality + round-trip-
// witness + covering-index + bounded-walk set. Three frames on the
// REMEDIATED tree:
//   1. the standing desktop dashboard (1440x900)
//   2. the standing mobile drawer (390x844)
//   3. the cycle's own surface — the /export panel, the portability
//      family's home (the CN2 round-trip witness territory: the count
//      grid + the Restore card whose POST the e2e leg finally proves
//      restores the demo's own export verbatim). Self-verifying before
//      the frame: the "What's included" chip grid and the Restore card
//      heading are both visible.
// Usage: node scripts/capture-s139-evidence.mjs
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
await page.screenshot({ path: `${OUT}/139-clone-desktop-dashboard.png` });
console.log("captured 139-clone-desktop-dashboard.png");
await page.close();

// ---- 2. the mobile drawer ------------------------------------------------
page = await authedPage({ width: 390, height: 844 });
await page.getByRole("button", { name: "Open navigation menu" }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/139-clone-mobile-drawer.png` });
console.log("captured 139-clone-mobile-drawer.png");
await page.close();

// ---- 3. the /export panel (the portability family's home) ----------------
{
  const page3 = await authedPage({ width: 1280, height: 900 });
  try {
    await page3.goto(`${CLONE}/export`);
    // The SELF-VERIFYING wait (the s23 panel-journey idiom — /export is a
    // server-gated owner surface without the SPA shell, so the wait is the
    // panel's own pinned headings, not appHydrated): the frame only
    // captures once the panel's count grid (the "What's included" chips)
    // and the Restore card are both rendered — the surface whose POST the
    // S139/CN2 round-trip witness proves restores the demo's own export
    // verbatim.
    await page3.waitForFunction(() => {
      const text = document.body.innerText;
      return (
        text.includes("Export Your Data") &&
        text.includes("What's included") &&
        document.querySelector('input[type="file"]') !== null
      );
    }, null, { timeout: 15_000 });
    await page3.waitForTimeout(400);
    await page3.screenshot({ path: `${OUT}/139-clone-export-panel.png` });
    console.log("captured 139-clone-export-panel.png");
    const verified = await page3.evaluate(() => {
      const text = document.body.innerText;
      return (
        text.includes("Export Your Data") &&
        text.includes("What's included") &&
        document.querySelector('input[type="file"]') !== null
      );
    });
    console.log(`export panel verified (count grid + restore card): ${verified}`);
  } finally {
    await page3.close();
  }
}

await browser.close();
console.log("S139 evidence capture complete.");
