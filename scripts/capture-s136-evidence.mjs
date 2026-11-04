// Usage: node scripts/capture-s136-evidence.mjs
// (bun INCOMPATIBLE — the playwright request-API script class; node ≥ 23.6.)
//
// The S136/CK evidence frames — three surfaces on the REMEDIATED dev tree
// (localhost:3000, demo session):
//   1. 136-clone-desktop-dashboard.png — the desktop chrome (sidebar 260px,
//      the KPI row — the remediated tree's regression-net visual; the first
//      KPI icon block now rides the accent token pair).
//   2. 136-clone-mobile-drawer.png — the mobile drawer open (the 48th
//      consecutive no-Tailwind-v4-mobile-nav-bug confirmation's visual).
//   3. 136-clone-dashboard-accent-gradient.png — the cycle's NEW UI surface:
//      CK5's inline-hex family — the dashboard's first KPI icon gradient
//      under the BLUE accent: the computed pair tracks the accent switch
//      (blue-500 → sky-600: rgb(59, 130, 246), rgb(2, 132, 199)) where the
//      pre-CK5 hardcoded violet pair ignored it. The frame is
//      SELF-VERIFYING: the capture waits on the computed background-image
//      itself (the S27 doctrine), and the accent rides the REAL settings
//      API with the violet restore in the finally.
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
await page.screenshot({ path: `${OUT}/136-clone-desktop-dashboard.png` });
console.log("captured 136-clone-desktop-dashboard.png");

// ---- 2. the mobile drawer ------------------------------------------------
page = await authedPage({ width: 390, height: 844 });
await page.getByRole("button", { name: "Open navigation menu" }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/136-clone-mobile-drawer.png` });
console.log("captured 136-clone-mobile-drawer.png");

// ---- 3. the CK5 KPI accent-gradient under the blue accent -----------------
{
  const page3 = await authedPage({ width: 1280, height: 900 });
  try {
    // The accent rides the REAL settings API (the S27 doctrine); the DOM
    // sees it through a fresh load (the AG11a pattern — a raw PATCH does
    // not notify the live store).
    await page3.request.patch(`${CLONE}/api/settings/preferences`, { data: { accentColor: "blue" } });
    await page3.goto(`${CLONE}/Dashboard`);
    await page3.waitForFunction(() => {
      const root = document.documentElement;
      return root.style.getPropertyValue("--sf-primary") === "59 130 246";
    }, null, { timeout: 30_000 });
    // The SELF-VERIFYING wait: the frame only captures once the first KPI
    // icon block's computed gradient actually carries the blue pair — the
    // inline-hex family's own evidence (the violet pair would read
    // rgb(139, 92, 246), rgb(79, 70, 229)).
    await page3.waitForFunction(() => {
      const icons = [...document.querySelectorAll('main [style*="linear-gradient(to right bottom"]')];
      if (icons.length < 4) return false;
      const bg = getComputedStyle(icons[0]).backgroundImage;
      return bg.includes("rgb(59, 130, 246)") && bg.includes("rgb(2, 132, 199)");
    }, null, { timeout: 15_000 });
    await page3.waitForTimeout(400);
    await page3.screenshot({ path: `${OUT}/136-clone-dashboard-accent-gradient.png` });
    console.log("captured 136-clone-dashboard-accent-gradient.png");
  } finally {
    // The closing restore (the AP-79 lesson): the shared demo record never
    // rests on the probe's accent.
    await page3.request.patch(`${CLONE}/api/settings/preferences`, { data: { accentColor: "violet" } });
    await page3.waitForTimeout(600);
  }
}

await browser.close();
console.log("S136 evidence capture complete.");
