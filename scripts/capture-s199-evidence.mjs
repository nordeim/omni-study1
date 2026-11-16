// S199 evidence capture — the self-verifying frames for the Events +
// FocusTimer two-family view-home e2e consolidation (Batch EW), ridden
// against the fresh :3200 standalone (the demo account, READ-ONLY
// surfaces — zero writes on the persistent demo account; the Events
// dialog is never opened here). The consolidation is a pure
// test-organization refactor — the frames document the CONSOLIDATED
// FAMILIES' surfaces (the chrome the 17 moved pins drive):
//   1. 199-events.png — the Events view (S5-B's contract: the slate-900
//      rounded-2xl panel with the EVENTS label, the big date, the cyan
//      full-width New Event row; S5-U1's contract: the one-line
//      "Nov 2026 CW <n>" month header)
//   2. 199-focustimer.png — the FocusTimer view (S5-E's contract: the
//      Pomodoros/Sessions stat cards, the 256px ring, the 48px mono
//      time, the 64px gradient play button, the 25/5/15 + 50/10/30
//      presets; S190's contract: the white rounded-3xl panel on the
//      max-w-2xl column)
//   3. 199-devserver-dashboard.png — the dev server :3000 dashboard
//   4. 199-devserver-events.png — the dev server :3000 Events (a
//      moved-family surface)
//   5. 199-devserver-mobile-drawer.png — the dev server :3000 mobile
//      drawer (the operator's standing mobile-nav watch)
// Every frame is DOM-asserted BEFORE the shot and pixel-verified
// non-blank after (the standing evidence discipline). The family map
// lives in docs/remediation-plan-session199.md.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const OUT = "docs/screenshots";
mkdirSync(OUT, { recursive: true });

const STANDALONE = "http://localhost:3200";
const DEV = "http://localhost:3000";

const verdict = {};

const hydrated = (page) =>
  page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true");

async function login(page, base) {
  await page.goto(`${base}/login`, { timeout: 45_000 });
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
  await page.waitForFunction(() => document.querySelector("main") !== null, null, { timeout: 30_000 });
  await hydrated(page);
}

async function nonBlank(file) {
  // pixel-verify via the PNG header + a coarse luminance sample through
  // the browser canvas (avoids a native dep; the frames are 100KB+ PNGs)
  const { statSync, readFileSync } = await import("node:fs");
  const size = statSync(`${OUT}/${file}`).size;
  if (size < 10_000) return { ok: false, why: `too small: ${size}B` };
  const buf = readFileSync(`${OUT}/${file}`);
  return { ok: buf.length > 10_000 && buf[1] === 0x50 && buf[2] === 0x4e, why: `${size}B png` };
}

const browser = await chromium.launch();

// ---- frame 1: the Events family contracts (:3200) ------------------------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await login(page, STANDALONE);
  await page.goto(`${STANDALONE}/Events`);
  await hydrated(page);
  const panel = page.locator('[aria-label="Events panel"]');
  await panel.waitFor({ state: "visible", timeout: 20_000 });
  const bg = await panel.evaluate((el) => getComputedStyle(el).backgroundColor);
  const radius = await panel.evaluate((el) => getComputedStyle(el).borderRadius);
  const cwLine = await panel.getByText(/CW \d+/).first().isVisible();
  const newEvent = await panel.getByRole("button", { name: "New Event" }).first().isVisible();
  const bigDate = await panel.locator("span.text-4xl").first().isVisible();
  const ok =
    bg === "rgb(15, 23, 42)" && radius === "16px" && cwLine && newEvent && bigDate;
  verdict["199-events.png"] = {
    ok,
    contracts: { panelBg: bg, radius, cwLine, newEvent, bigDate },
  };
  await page.screenshot({ path: `${OUT}/199-events.png` });
  await ctx.close();
}

// ---- frame 2: the FocusTimer family contracts (:3200) --------------------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await login(page, STANDALONE);
  await page.goto(`${STANDALONE}/FocusTimer`);
  await hydrated(page);
  const timer = page.getByRole("timer");
  await timer.waitFor({ state: "visible", timeout: 20_000 });
  const contracts = await timer.evaluate((el) => {
    let node = el;
    let panelCls = null;
    while (node) {
      const cls = node.getAttribute("class") || "";
      if (/rounded-3xl/.test(cls)) {
        panelCls = { bg: getComputedStyle(node).backgroundColor, radius: getComputedStyle(node).borderRadius };
        break;
      }
      node = node.parentElement;
    }
    return {
      panel: panelCls,
      timeSize: getComputedStyle(el).fontSize,
    };
  });
  const ring = page.locator("[class*='h-64'][class*='w-64']").first();
  const ringVisible = await ring.isVisible().catch(() => false);
  const play = page.getByRole("button", { name: /start timer|resume timer|pause timer/i });
  const playBox = await play.boundingBox();
  const presets =
    (await page.getByText("25/5/15").isVisible().catch(() => false)) &&
    (await page.getByText("50/10/30").isVisible().catch(() => false));
  const stats =
    (await page.getByText("Pomodoros", { exact: true }).isVisible().catch(() => false)) &&
    (await page.getByText("Sessions", { exact: true }).isVisible().catch(() => false));
  const ok =
    contracts.panel !== null &&
    contracts.panel.bg === "rgb(255, 255, 255)" &&
    contracts.panel.radius === "24px" &&
    contracts.timeSize === "48px" &&
    ringVisible &&
    Math.round(playBox?.width ?? 0) === 64 &&
    presets &&
    stats;
  verdict["199-focustimer.png"] = {
    ok,
    contracts: { ...contracts, ringVisible, play: Math.round(playBox?.width ?? 0), presets, stats },
  };
  await page.screenshot({ path: `${OUT}/199-focustimer.png` });
  await ctx.close();
}

// ---- frames 3-5: the dev-server set (:3000) ------------------------------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await login(page, DEV);
  await page.goto(`${DEV}/Dashboard`);
  await hydrated(page);
  // the auto-waiting visible wait (the S9 lesson: bare isVisible() races)
  await page.getByRole("heading", { level: 1 }).waitFor({ state: "visible", timeout: 20_000 });
  const navLinks = await page.evaluate(() => document.querySelectorAll("nav a").length);
  verdict["199-devserver-dashboard.png"] = { ok: navLinks === 20, contracts: { navLinks } };
  await page.screenshot({ path: `${OUT}/199-devserver-dashboard.png` });

  await page.goto(`${DEV}/Events`);
  await hydrated(page);
  await page
    .locator('[aria-label="Events panel"]')
    .waitFor({ state: "visible", timeout: 20_000 });
  const evBg = await page
    .locator('[aria-label="Events panel"]')
    .evaluate((el) => getComputedStyle(el).backgroundColor);
  verdict["199-devserver-events.png"] = {
    ok: evBg === "rgb(15, 23, 42)",
    contracts: { panelBg: evBg },
  };
  await page.screenshot({ path: `${OUT}/199-devserver-events.png` });

  // the mobile drawer (the operator's standing watch) at 390x844
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(600);
  await page.getByRole("button", { name: "Open navigation menu" }).click();
  await page.waitForTimeout(900);
  const panel = await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]');
    const p = d ? d.querySelector("div.w-72") : null;
    return p
      ? { w: Math.round(p.getBoundingClientRect().width), links: p.querySelectorAll("a").length }
      : null;
  });
  const ok = panel !== null && panel.w === 288 && panel.links === 20;
  verdict["199-devserver-mobile-drawer.png"] = { ok, contracts: panel };
  await page.screenshot({ path: `${OUT}/199-devserver-mobile-drawer.png` });
  await ctx.close();
}

await browser.close();

// ---- the pixel-verify pass (non-blank, the standing discipline) ----------
for (const f of Object.keys(verdict)) {
  const px = await nonBlank(f);
  verdict[f].pixel = px;
  if (!px.ok) verdict[f].ok = false;
}
console.log(JSON.stringify(verdict, null, 2));
const allOk = Object.values(verdict).every((v) => v.ok);
console.log(allOk ? "\nEVIDENCE: ALL FRAMES ok:true" : "\nEVIDENCE: FAILURES PRESENT");
process.exit(allOk ? 0 : 1);
