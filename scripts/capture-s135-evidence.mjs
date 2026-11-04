// Usage: node scripts/capture-s135-evidence.mjs
// (bun INCOMPATIBLE — the playwright request-API script class; node ≥ 23.6.)
//
// The S135/CJ evidence frames — three surfaces on the REMEDIATED dev tree
// (localhost:3000, demo session):
//   1. 135-clone-desktop-dashboard.png — the desktop chrome (sidebar 260px,
//      the KPI row — the remediated tree's regression-net visual).
//   2. 135-clone-mobile-drawer.png — the mobile drawer open (the 46th
//      consecutive no-Tailwind-v4-mobile-nav-bug confirmation's visual).
//   3. 135-clone-notes-accent-edge.png — the cycle's NEW UI surface:
//      CJ3's accent-edge token — the notes selected row under the BLUE
//      accent: the border tracks the accent (rgb(191, 219, 254) blue-200)
//      where the pre-CJ3 hardcoded violet-200 ignored the switch. The
//      frame is SELF-VERIFYING: the capture waits on the computed border
//      color itself (the S27 doctrine — the applied state rides the
//      probe), and the accent rides the REAL settings API with the violet
//      restore in the finally.
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
await page.screenshot({ path: `${OUT}/135-clone-desktop-dashboard.png` });
console.log("captured 135-clone-desktop-dashboard.png");

// ---- 2. the mobile drawer ------------------------------------------------
page = await authedPage({ width: 390, height: 844 });
await page.getByRole("button", { name: "Open navigation menu" }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/135-clone-mobile-drawer.png` });
console.log("captured 135-clone-mobile-drawer.png");

// ---- 3. the CJ3 accent-edge token under the blue accent ------------------
{
  const page3 = await authedPage({ width: 1280, height: 900 });
  try {
    // The accent rides the REAL settings API (the S27 doctrine); the DOM
    // sees it through a fresh load (the AG11a pattern — a raw PATCH does
    // not notify the live store).
    await page3.request.patch(`${CLONE}/api/settings/preferences`, { data: { accentColor: "blue" } });
    await page3.goto(`${CLONE}/Notes`);
    await page3.waitForFunction(() => {
      const root = document.documentElement;
      return root.style.getPropertyValue("--sf-primary") === "59 130 246";
    }, null, { timeout: 30_000 });
    await page3.getByRole("button", { name: /Dot product intuition/ }).first().click();
    // transition-colors races the class swap (the AD7 settle note) + the
    // SELF-VERIFYING wait: the frame only captures once the selected row's
    // border actually computes blue-200 — the token family's own evidence.
    await page3.waitForFunction(() => {
      const el = document.activeElement?.closest?.("button") ?? null;
      const rows = [...document.querySelectorAll('button')];
      const row = rows.find((r) => (r.textContent ?? "").includes("Dot product intuition"));
      return row !== undefined && getComputedStyle(row).borderTopColor === "rgb(191, 219, 254)";
    }, null, { timeout: 15_000 });
    await page3.waitForTimeout(400);
    await page3.screenshot({ path: `${OUT}/135-clone-notes-accent-edge.png` });
    console.log("captured 135-clone-notes-accent-edge.png");
  } finally {
    // The closing restore (the AP-79 lesson): the shared demo record never
    // rests on the probe's accent.
    await page3.request.patch(`${CLONE}/api/settings/preferences`, { data: { accentColor: "violet" } });
    await page3.waitForTimeout(600);
  }
}

await browser.close();
console.log("S135 evidence capture complete.");
