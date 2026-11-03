// Usage: node scripts/capture-s132-evidence.mjs
// (bun INCOMPATIBLE — the playwright request-API script class; node ≥ 23.6.)
//
// The S132/CG evidence frames — three surfaces on the REMEDIATED dev tree
// (localhost:3000, demo session):
//   1. 132-clone-desktop-dashboard.png — the desktop chrome (sidebar 260px,
//      the KPI row, the guarded CTAs in place — CG7's anatomy unchanged).
//   2. 132-clone-mobile-drawer.png — the mobile drawer open (the 40th
//      consecutive no-Tailwind-v4-mobile-nav-bug confirmation's visual).
//   3. 132-clone-boot-data-failure-bar.png — the cycle's NEW UI surface:
//      CG5's amber role="alert" data-failure bar with the Retry affordance
//      (every /api/* but /api/auth/me routed to abort — the dead-data-plane
//      boot; the shell commits, the bar surfaces).
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
  return page;
}

// ---- 1. the desktop dashboard -------------------------------------------
let page = await authedPage({ width: 1440, height: 900 });
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/132-clone-desktop-dashboard.png` });
console.log("captured 132-clone-desktop-dashboard.png");

// ---- 2. the mobile drawer ------------------------------------------------
page = await authedPage({ width: 390, height: 844 });
await page.getByRole("button", { name: "Open navigation menu" }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/132-clone-mobile-drawer.png` });
console.log("captured 132-clone-mobile-drawer.png");

// ---- 3. the CG5 boot data-failure bar ------------------------------------
// The demo cookie rides the CONTEXT jar (API-level login — no live UI page
// racing the route interception), then /api/auth/me is the ONLY live route:
// the shell commits while every data route dies and the bar surfaces.
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const login = await ctx.request.post(`${CLONE}/api/auth/login`, {
    data: { email: "demo@studyflow.app", password: "Demo1234!" },
  });
  if (!login.ok()) throw new Error(`demo login failed: ${login.status()}`);
  await page.route("**/api/*", (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === "/api/auth/me") return route.continue();
    return route.abort("failed");
  });
  await page.goto(`${CLONE}/Dashboard`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true");
  const bar = page.getByRole("alert").filter({ hasText: /couldn't load/i });
  await bar.waitFor({ state: "visible", timeout: 15_000 });
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/132-clone-boot-data-failure-bar.png` });
  console.log("captured 132-clone-boot-data-failure-bar.png");
  await ctx.close();
}

await browser.close();
console.log("\nCAPTURE S132: DONE");
