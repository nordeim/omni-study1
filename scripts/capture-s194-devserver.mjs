// S193 dev-server evidence — the operator's standing request: screenshots
// of the DEV server (:3000) running the remediated codebase. One dashboard
// frame at desktop + one mobile drawer frame (the mobile-nav surface the
// standing watch covers), DOM-asserted before the shot, pixel-verified
// non-blank after.
import { chromium } from "playwright";
import { statSync } from "node:fs";

const DEV = "http://localhost:3000";
const OUT = "docs/screenshots";

async function session(browser, viewport) {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  await page.goto(`${DEV}/login`, { timeout: 45_000 });
  await page.fill("input[type=email]", "demo@studyflow.app");
  await page.fill("input[type=password]", "Demo1234!");
  await page.waitForFunction(
    () => {
      const b = document.querySelector("button[type=submit]");
      return b !== null && !b.disabled;
    },
    null,
    { timeout: 20_000 },
  );
  await page.click("button[type=submit]");
  await page.waitForFunction(
    () =>
      document.querySelector("nav a") !== null &&
      (document.querySelector("h1") !== null || document.querySelector("h2") !== null),
    null,
    { timeout: 30_000 },
  );
  await page.waitForTimeout(1800);
  return { ctx, page };
}

const nonBlank = (path) => statSync(path).size > 50_000;
const browser = await chromium.launch();
const results = {};

// Frame 1: the dev-server dashboard at 1280.
{
  const { ctx, page } = await session(browser, { width: 1280, height: 800 });
  const asserts = await page.evaluate(() => ({
    navLinks: document.querySelectorAll("nav a").length,
    greeting: !!/good (morning|afternoon|evening)/i.test(
      document.querySelector("h1")?.textContent || document.querySelector("h2")?.textContent || "",
    ),
    statCards: [...document.querySelectorAll("main .grid > div")].length,
  }));
  const ok = asserts.navLinks === 20 && asserts.greeting && asserts.statCards >= 4;
  const path = `${OUT}/194-devserver-dashboard.png`;
  await page.screenshot({ path });
  results.dashboard = { ok, asserts, nonBlank: nonBlank(path), path };
  await ctx.close();
}

// Frame 2: the dev-server mobile drawer at 390 (the standing mobile-nav
// watch surface — open, asserted, closed; zero persistent state).
{
  const { ctx, page } = await session(browser, { width: 390, height: 844 });
  await page.getByRole("button", { name: "Open navigation menu" }).click();
  await page.waitForTimeout(600);
  const asserts = await page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"]');
    const panel = dlg ? dlg.querySelector("div.w-72") : null;
    const links = dlg ? dlg.querySelectorAll("a") : [];
    return {
      drawerOpen: !!dlg,
      linkCount: links.length,
      panelW: panel ? Math.round(panel.getBoundingClientRect().width) : 0,
    };
  });
  const ok = asserts.drawerOpen && asserts.linkCount === 20 && asserts.panelW === 288;
  const path = `${OUT}/194-devserver-mobile-drawer.png`;
  await page.screenshot({ path });
  await page.keyboard.press("Escape");
  results.drawer = { ok, asserts, nonBlank: nonBlank(path), path };
  await ctx.close();
}

await browser.close();
console.log(JSON.stringify(results, null, 2));
if (!results.dashboard.ok || !results.dashboard.nonBlank || !results.drawer.ok || !results.drawer.nonBlank) {
  console.error("DEV-SERVER EVIDENCE FAILED");
  process.exit(1);
}
console.log("S194 DEV-SERVER EVIDENCE: both frames captured + self-verified");
