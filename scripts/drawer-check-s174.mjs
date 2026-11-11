// Standing mobile-drawer priority check — session 174 (S174), the 109th
// consecutive. Clone-only formal check on the remediated dev tree
// (localhost:3000) at 390x844: the drawer opens, backdrop
// rgba(0,0,0,0.2)+blur(4px), 288px white shadow-2xl panel, 20 links, no
// footer, Escape-close, the app-bar z-40 stacking. The no-Tailwind-v4-
// mobile-nav-bug confirmation (the standing operator watch).
// Usage: node scripts/drawer-check-s174.mjs  (bun INCOMPATIBLE — node ≥ 23.6)
import { chromium } from "playwright";

const CLONE = "http://localhost:3000";

const DRAWER_PROBE = `(() => {
  const visible = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && cs.display !== 'none' && cs.visibility !== 'hidden'; };
  const dialog = document.querySelector('[role="dialog"][aria-label*="avigation"], [role="dialog"]');
  const root = dialog && visible(dialog) ? dialog : document.body;
  const backdrop = [...root.querySelectorAll('button, div')].find(el => (el.className || '').includes('bg-black') && visible(el)) || null;
  const panel = [...root.querySelectorAll('div')].find(el => (el.className || '').includes('w-72') && visible(el)) || null;
  const links = panel ? [...panel.querySelectorAll('a')] : [];
  const footer = panel ? panel.querySelector('footer') : null;
  const cs = (el) => el ? { bg: getComputedStyle(el).backgroundColor, blur: getComputedStyle(el).backdropFilter, w: getComputedStyle(el).width, shadow: getComputedStyle(el).boxShadow.slice(0, 60) } : null;
  return JSON.stringify({
    backdrop: cs(backdrop),
    panel: cs(panel),
    linkCount: links.length,
    firstLink: links[0] ? links[0].textContent.trim().slice(0, 20) : null,
    hasFooter: !!footer,
  });
})()`;

const APPBAR_PROBE = `(() => {
  const bar = [...document.querySelectorAll('header, div')].find(el => (el.className || '').match(/z-40/) && el.getBoundingClientRect().width > 300 && getComputedStyle(el).position !== 'static');
  return JSON.stringify(bar ? { z: getComputedStyle(bar).zIndex, pos: getComputedStyle(bar).position } : null);
})()`;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
await page.goto(`${CLONE}/login`);
await page.fill("input[type=email]", "demo@studyflow.app");
await page.fill("input[type=password]", "Demo1234!");
await page.click("button[type=submit]");
await page.waitForFunction(() => document.querySelector("main") !== null, null, { timeout: 30_000 });
await page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true", null, { timeout: 30_000 });
await page.waitForTimeout(1200);

// The app-bar z-40 stacking BEFORE the drawer opens (the S14 trap-7 set).
const appbar = JSON.parse(await page.evaluate(APPBAR_PROBE));

// Open the drawer.
await page.getByRole("button", { name: "Open navigation menu" }).click();
await page.waitForTimeout(900);
const probe = JSON.parse(await page.evaluate(DRAWER_PROBE));

// Escape-close (the clone superset).
const escapeClosed = await page.evaluate(() => {
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  return true;
});
await page.waitForTimeout(700);
const dialogGone = !(await page.evaluate(() => {
  const d = document.querySelector('[role="dialog"]');
  return !!d && d.getBoundingClientRect().width > 0;
}));

// Navigate + auto-close: reopen, click a link, the drawer closes.
await page.getByRole("button", { name: "Open navigation menu" }).click();
await page.waitForTimeout(700);
const navAutoClosed = await page.evaluate(() => {
  const panel = [...document.querySelectorAll('div')].find(el => (el.className || '').includes('w-72') && el.getBoundingClientRect().width > 0);
  if (!panel) return false;
  const link = panel.querySelector('a');
  if (link) link.click();
  return !!link;
});
await page.waitForTimeout(900);
const autoClosed = !(await page.evaluate(() => {
  const d = document.querySelector('[role="dialog"]');
  return !!d && d.getBoundingClientRect().width > 0;
}));

await browser.close();

const checks = {
  appbar,
  backdrop: probe.backdrop,
  panel: probe.panel,
  linkCount: probe.linkCount,
  firstLink: probe.firstLink,
  hasFooter: probe.hasFooter,
  escapeClosed: escapeClosed && dialogGone,
  navigateAutoClosed: navAutoClosed && autoClosed,
};
const ok =
  checks.backdrop && /rgba\\(0, ?0, ?0, ?0\\.2\\)|oklab/.test(String(checks.backdrop.bg)) &&
  checks.panel && checks.panel.w === "288px" &&
  checks.linkCount === 20 &&
  !checks.hasFooter &&
  checks.escapeClosed &&
  checks.navigateAutoClosed &&
  checks.appbar && checks.appbar.z === "40";
console.log(JSON.stringify({ ok, checks }, null, 2));
process.exit(ok ? 0 : 1);
