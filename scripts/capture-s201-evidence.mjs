// S201 evidence capture — the self-verifying frames for the Sidebar-chrome
// AXIS-home e2e consolidation (Batch EY), ridden against the fresh :3200
// standalone (the demo account, READ-ONLY surfaces — zero writes on the
// persistent demo account; the collapse toggle is client-state only, the
// pin's own interaction surface, restored before the shot set ends). The
// consolidation is a pure test-organization refactor — the frames document
// the CONSOLIDATED FAMILY's surface (the chrome the 4 moved pins drive):
//   1. 201-sidebar.png — the sidebar chrome (S8-A's contracts: the 20
//      nav links with the measured lucide set, the active gradient's
//      violet-500 + indigo-500 stops, the untruncated brand tagline, the
//      collapse button's 34–36px band + 8px radius)
//   2. 201-devserver-dashboard.png — the dev server :3000 dashboard
//   3. 201-devserver-sidebar.png — the dev server :3000 sidebar surface
//      (the moved family's chrome; the collapse toggle round-trip, a
//      client-state interaction restored to expanded before the shot)
//   4. 201-devserver-mobile-drawer.png — the dev server :3000 mobile
//      drawer (the operator's standing mobile-nav watch)
// Every frame is DOM-asserted BEFORE the shot and pixel-verified
// non-blank after (the standing evidence discipline). The family map
// lives in docs/remediation-plan-session201.md.
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
  const { statSync, readFileSync } = await import("node:fs");
  const size = statSync(`${OUT}/${file}`).size;
  if (size < 10_000) return { ok: false, why: `too small: ${size}B` };
  const buf = readFileSync(`${OUT}/${file}`);
  return { ok: buf.length > 10_000 && buf[1] === 0x50 && buf[2] === 0x4e, why: `${size}B png` };
}

const browser = await chromium.launch();

// ---- frame 1: the sidebar family contracts (:3200) ------------------------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await login(page, STANDALONE);
  await page.goto(`${STANDALONE}/Dashboard`);
  await hydrated(page);
  const nav = page.locator("nav");
  await nav.waitFor({ state: "visible", timeout: 20_000 });
  const iconCount = await page.locator("nav a svg").count();
  const tasksIcon = await page.locator("nav a").nth(2).locator("svg").getAttribute("class");
  const active = page.locator('nav a[aria-current="page"] > span').first();
  const bg = await active.evaluate((el) => getComputedStyle(el).backgroundImage);
  const tag = page.getByText("Your study companion", { exact: true });
  const tagCs = await tag.evaluate((el) => {
    const s = getComputedStyle(el);
    return { overflow: s.overflow, textOverflow: s.textOverflow, whiteSpace: s.whiteSpace };
  });
  const btn = page.locator('button[aria-label="Collapse sidebar"]');
  const btnCs = await btn.evaluate((el) => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return { w: Math.round(r.width), h: Math.round(r.height), radius: s.borderRadius };
  });
  const ok =
    iconCount === 20 &&
    tasksIcon.includes("lucide-square-check-big") &&
    bg.includes("rgba(139, 92, 246, 0.1)") &&
    bg.includes("rgba(99, 102, 241, 0.1)") &&
    tagCs.textOverflow === "clip" &&
    btnCs.w >= 34 && btnCs.w <= 36 &&
    btnCs.h >= 34 && btnCs.h <= 36 &&
    btnCs.radius === "8px";
  verdict["201-sidebar.png"] = {
    ok,
    contracts: { iconCount, tasksIcon: tasksIcon.slice(0, 30), bgHasViolet: bg.includes("rgba(139, 92, 246, 0.1)"), bgHasIndigo: bg.includes("rgba(99, 102, 241, 0.1)"), tagCs, btnCs },
  };
  await page.screenshot({ path: `${OUT}/201-sidebar.png` });
  await ctx.close();
}

// ---- frames 2-4: the dev-server set (:3000) --------------------------------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await login(page, DEV);
  await page.goto(`${DEV}/Dashboard`);
  await hydrated(page);
  await page.getByRole("heading", { level: 1 }).waitFor({ state: "visible", timeout: 20_000 });
  const navLinks = await page.evaluate(() => document.querySelectorAll("nav a").length);
  verdict["201-devserver-dashboard.png"] = { ok: navLinks === 20, contracts: { navLinks } };
  await page.screenshot({ path: `${OUT}/201-devserver-dashboard.png` });

  // the moved family's surface: the collapse toggle round-trip (client-state
  // only, restored to expanded before the shot)
  const collapseBtn = page.getByRole("button", { name: "Collapse sidebar" });
  await collapseBtn.click();
  await page.waitForTimeout(400);
  const asideW = await page.locator("aside").evaluate((el) => Math.round(el.getBoundingClientRect().width));
  await page.getByRole("button", { name: "Expand sidebar" }).click();
  await page.waitForTimeout(400);
  const restoredW = await page.locator("aside").evaluate((el) => Math.round(el.getBoundingClientRect().width));
  const okSidebar = asideW === 80 && restoredW === 260;
  verdict["201-devserver-sidebar.png"] = {
    ok: okSidebar,
    contracts: { collapsedAsideW: asideW, restoredAsideW: restoredW },
  };
  await page.screenshot({ path: `${OUT}/201-devserver-sidebar.png` });

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
  const okDrawer = panel !== null && panel.w === 288 && panel.links === 20;
  verdict["201-devserver-mobile-drawer.png"] = { ok: okDrawer, contracts: panel };
  await page.screenshot({ path: `${OUT}/201-devserver-mobile-drawer.png` });
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
