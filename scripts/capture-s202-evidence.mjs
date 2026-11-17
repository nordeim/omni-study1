// S202/EZ evidence capture — one-shot, session-staged (never committed).
// Frames: 202-upgraded-standalone.png (:3200 on next 16.4.6, DOM-asserted
// before the shot) + 202-devserver-dashboard.png (:3000, 1440x900) +
// 202-devserver-mobile-drawer.png (:3000, 390x844, the standing
// mobile-nav watch). Every contract DOM-asserted BEFORE the shot; every
// frame pixel-verified non-blank after.
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const SHOTS = "/home/z/my-project/omni-study1/docs/screenshots";
const results = {};

async function login(page, base) {
  await page.goto(`${base}/login`);
  await page.fill("input[type=email]", "demo@studyflow.app");
  await page.fill("input[type=password]", "Demo1234!");
  await page.click("button[type=submit]");
  await page.waitForFunction(
    () => document.querySelector("nav, aside") !== null && document.querySelector("main") !== null,
    null, { timeout: 30000 },
  );
  await page.waitForTimeout(2000);
}

const DASH_PROBE = `(() => {
  const nav = document.querySelector("nav") || document.querySelector("aside");
  const links = nav ? nav.querySelectorAll("a").length : 0;
  const greeting = (document.querySelector("h1") || {}).textContent || "";
  const statCards = [...document.querySelectorAll("main [class*='grid'] > div")].length;
  return JSON.stringify({ links, greeting: greeting.slice(0, 30), statCards });
})()`;

const DRAWER_PROBE = `(() => {
  const dialog = document.querySelector('[role=dialog]');
  const panel = dialog ? [...dialog.querySelectorAll('div')].find(d => (d.className||'').includes('w-72')) : null;
  return JSON.stringify({ open: !!dialog, width: panel ? Math.round(panel.getBoundingClientRect().width) : null, links: panel ? panel.querySelectorAll('a').length : null });
})()`;

const browser = await chromium.launch();

// Frame 1: the upgraded standalone :3200 (next 16.4.6)
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await login(page, "http://localhost:3200");
  const probe = JSON.parse(await page.evaluate(DASH_PROBE));
  const ok = probe.links === 20 && probe.statCards >= 4 && probe.greeting.startsWith("Good");
  await page.screenshot({ path: `${SHOTS}/202-upgraded-standalone.png` });
  results.standalone = { ok, probe };
  await ctx.close();
}

// Frame 2: the dev server :3000 dashboard
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await login(page, "http://localhost:3000");
  const probe = JSON.parse(await page.evaluate(DASH_PROBE));
  const ok = probe.links === 20 && probe.statCards >= 4 && probe.greeting.startsWith("Good");
  await page.screenshot({ path: `${SHOTS}/202-devserver-dashboard.png` });
  results.devserverDashboard = { ok, probe };
  await ctx.close();
}

// Frame 3: the dev server :3000 mobile drawer (the standing watch)
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await login(page, "http://localhost:3000");
  await page.waitForTimeout(800);
  const burger = page.getByRole("button", { name: "Open navigation menu" });
  await burger.click();
  await page.waitForTimeout(800);
  const probe = JSON.parse(await page.evaluate(DRAWER_PROBE));
  const ok = probe.open && probe.width === 288 && probe.links === 20;
  await page.screenshot({ path: `${SHOTS}/202-devserver-mobile-drawer.png` });
  results.devserverMobileDrawer = { ok, probe };
  await ctx.close();
}

await browser.close();
writeFileSync("/tmp/s202-evidence.json", JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
const allOk = Object.values(results).every((r) => r.ok && r.probe);
console.log("DOM-ASSERTS:", allOk ? "ok:true" : "ok:false");
// The pixel-non-blank verification runs in Python (PIL) over the written
// frames — the standing session pattern (no one-shot deps added).
