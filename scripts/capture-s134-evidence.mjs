// Usage: node scripts/capture-s134-evidence.mjs
// (bun INCOMPATIBLE — the playwright request-API script class; node ≥ 23.6.)
//
// The S134/CI evidence frames — three surfaces on the REMEDIATED dev tree
// (localhost:3000, demo session):
//   1. 134-clone-desktop-dashboard.png — the desktop chrome (sidebar 260px,
//      the KPI row — the remediated tree's regression-net visual).
//   2. 134-clone-mobile-drawer.png — the mobile drawer open (the 44th
//      consecutive no-Tailwind-v4-mobile-nav-bug confirmation's visual).
//   3. 134-clone-calculator-history-gate.png — the cycle's NEW UI surface:
//      CI5's CE3 loading gate — the calculator History panel while the
//      history GET is HELD: the Spinner owns the zero branch (pre-CI5 the
//      false "Your calculations will appear here." rendered on in-flight
//      data). The route is released in the finally (the S13/S14 lesson —
//      held routes never outlive the probe).
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
  // S134: also wait for hydration — a goto issued while the auth gate is
  // still redirecting aborts (net::ERR_ABORTED, the mid-boot bounce).
  await page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true", null, { timeout: 30_000 });
  return page;
}

// ---- 1. the desktop dashboard -------------------------------------------
let page = await authedPage({ width: 1440, height: 900 });
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/134-clone-desktop-dashboard.png` });
console.log("captured 134-clone-desktop-dashboard.png");

// ---- 2. the mobile drawer ------------------------------------------------
page = await authedPage({ width: 390, height: 844 });
await page.getByRole("button", { name: "Open navigation menu" }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/134-clone-mobile-drawer.png` });
console.log("captured 134-clone-mobile-drawer.png");

// ---- 3. the CI5 calculator History loading gate ---------------------------
{
  const page3 = await authedPage({ width: 1280, height: 900 });
  const HELD = "**/api/calculator/history";
  try {
    // the s132/s133 capture lesson: warm the dev-server route FIRST (the
    // cold Turbopack compile of /Calculator can outrun the goto timeout),
    // THEN hold the history GET and reload into the gated window.
    try {
      await page3.goto(`${CLONE}/Calculator`, { waitUntil: "domcontentloaded", timeout: 60_000 });
    } catch {
      // the mid-boot bounce can abort the first navigation — one retry
      await page3.goto(`${CLONE}/Calculator`, { waitUntil: "domcontentloaded", timeout: 60_000 });
    }
    await page3.waitForFunction(() => document.documentElement.dataset.appHydrated === "true", null, { timeout: 30_000 });
    await page3.goto(`${CLONE}/Dashboard`);
    await page3.route(HELD, () => {
      /* never fulfills — the loading branch owns the panel */
    });
    await page3.goto(`${CLONE}/Calculator`);
    await page3.waitForFunction(() => document.documentElement.dataset.appHydrated === "true", null, { timeout: 30_000 });
    await page3.getByRole("button", { name: "History", exact: true }).click();
    await page3.locator(".animate-spin").first().waitFor({ state: "visible", timeout: 10_000 });
    await page3.screenshot({ path: `${OUT}/134-clone-calculator-history-gate.png` });
    console.log("captured 134-clone-calculator-history-gate.png");
  } finally {
    // the S13/S14 lesson: unroute the held route and settle the page — a
    // held route must never outlive the probe.
    await page3.unroute(HELD);
    await page3.waitForTimeout(1200);
  }
}

await browser.close();
console.log("S134 evidence capture complete.");
