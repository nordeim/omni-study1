// S200 evidence capture — the self-verifying frames for the Calendar +
// Dashboard + MyDay three-family view-home e2e consolidation (Batch EX),
// ridden against the fresh :3200 standalone (the demo account, READ-ONLY
// surfaces — zero writes on the persistent demo account; the day-cell
// selection and the suggestions toggle are client-state only, the pins'
// own interaction surface). The consolidation is a pure test-organization
// refactor — the frames document the CONSOLIDATED FAMILIES' surfaces (the
// chrome the 12 moved pins drive):
//   1. 200-calendar.png — the Calendar view (S8-C's contracts: the p-6
//      border-slate-200 month card, the text-xl h2, the two chevron nav
//      buttons, the accent-fill selected cell, the day-detail card)
//   2. 200-dashboard.png — the Dashboard view (S8-B's contracts: the flush
//      divide-y exam card body, the p-4 exam rows with the rounded-full
//      badge, the assignment 4px color strip)
//   3. 200-myday.png — the MyDay view (S8-D's contracts: the 56px amber
//      gradient sun block, the bare suggestions toggle, the slate-50
//      suggestion rows)
//   4. 200-devserver-dashboard.png — the dev server :3000 dashboard
//   5. 200-devserver-calendar.png — the dev server :3000 Calendar (a
//      moved-family surface)
//   6. 200-devserver-mobile-drawer.png — the dev server :3000 mobile
//      drawer (the operator's standing mobile-nav watch)
// Every frame is DOM-asserted BEFORE the shot and pixel-verified
// non-blank after (the standing evidence discipline). The family map
// lives in docs/remediation-plan-session200.md.
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
  // pixel-verify via the PNG header + a coarse size check (the frames are
  // 100KB+ PNGs — the standing no-native-dep discipline)
  const { statSync, readFileSync } = await import("node:fs");
  const size = statSync(`${OUT}/${file}`).size;
  if (size < 10_000) return { ok: false, why: `too small: ${size}B` };
  const buf = readFileSync(`${OUT}/${file}`);
  return { ok: buf.length > 10_000 && buf[1] === 0x50 && buf[2] === 0x4e, why: `${size}B png` };
}

const browser = await chromium.launch();

// ---- frame 1: the Calendar family contracts (:3200) ------------------------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await login(page, STANDALONE);
  await page.goto(`${STANDALONE}/Calendar`);
  await hydrated(page);
  const card = page.locator('[aria-label="Calendar month"]');
  await card.waitFor({ state: "visible", timeout: 20_000 });
  const cardCs = await card.evaluate((el) => {
    const s = getComputedStyle(el);
    return { pad: s.padding, border: s.borderColor };
  });
  const h2 = await card.locator("h2").evaluate((el) => getComputedStyle(el).fontSize);
  const prevBtn = await page.getByRole("button", { name: "Previous month" }).count();
  const nextBtn = await page.getByRole("button", { name: "Next month" }).count();
  const grid = page.locator('[aria-label="Calendar days"]');
  const selected = grid.locator("button[aria-pressed=true]");
  const selCs = await selected.evaluate((el) => getComputedStyle(el).backgroundColor);
  const aside = page.locator('[aria-label="Day detail"]');
  const asideVisible = await aside.isVisible().catch(() => false);
  const ok =
    cardCs.pad === "24px" &&
    cardCs.border === "rgb(226, 232, 240)" &&
    h2 === "20px" &&
    prevBtn === 1 &&
    nextBtn === 1 &&
    selCs === "rgb(124, 58, 237)" &&
    asideVisible;
  verdict["200-calendar.png"] = {
    ok,
    contracts: { cardCs, h2, prevBtn, nextBtn, selCs, asideVisible },
  };
  await page.screenshot({ path: `${OUT}/200-calendar.png` });
  await ctx.close();
}

// ---- frame 2: the Dashboard family contracts (:3200) -----------------------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await login(page, STANDALONE);
  await page.goto(`${STANDALONE}/Dashboard`);
  await hydrated(page);
  await page.waitForSelector('h2:has-text("Upcoming Exams")', { timeout: 20_000 });
  const body = await page
    .locator("section", { has: page.locator('h2:has-text("Upcoming Exams")') })
    .first()
    .evaluate((el) => {
      const b = el.children[el.children.length - 1];
      const s = getComputedStyle(b);
      return { pad: s.padding, cls: b.className };
    });
  const row = page.locator('[aria-label="Upcoming exams"] > li').first();
  const rowCs = await row.evaluate((el) => getComputedStyle(el).padding);
  const badge = row.locator("span").filter({ hasText: /^(?:\d+d|Today!|Tomorrow)$/ }).first();
  const badgeCs = await badge.evaluate((el) => {
    const s = getComputedStyle(el);
    return { radius: s.borderRadius, bg: s.backgroundColor };
  });
  const strip = page.locator('[aria-label="Upcoming assignments"] > li > span, [aria-label="Upcoming assignments"] > li > div').first();
  const stripBox = await strip.boundingBox();
  const ok =
    body.pad === "0px" &&
    body.cls.includes("divide-y") &&
    rowCs === "16px" &&
    (badgeCs.radius === "9999px" || badgeCs.radius === "3.35544e+07px") &&
    badgeCs.bg === "rgb(241, 245, 249)" &&
    Math.round(stripBox?.width ?? 0) === 4;
  verdict["200-dashboard.png"] = {
    ok,
    contracts: { bodyPad: body.pad, divideY: body.cls.includes("divide-y"), rowCs, badgeCs, stripW: Math.round(stripBox?.width ?? 0) },
  };
  await page.screenshot({ path: `${OUT}/200-dashboard.png` });
  await ctx.close();
}

// ---- frame 3: the MyDay family contracts (:3200) ---------------------------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await login(page, STANDALONE);
  await page.goto(`${STANDALONE}/MyDay`);
  await hydrated(page);
  const block = page.locator('[aria-label="My Day header block"]');
  await block.waitFor({ state: "visible", timeout: 20_000 });
  const blockCs = await block.evaluate((el) => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return { w: Math.round(r.width), h: Math.round(r.height), bg: s.backgroundImage };
  });
  const toggle = page.locator('button[aria-controls="my-day-suggestions"]');
  const toggleVisible = await toggle.isVisible().catch(() => false);
  const expanded = toggleVisible ? await toggle.getAttribute("aria-expanded") : null;
  if (toggleVisible && expanded !== "true") await toggle.click();
  const row = page.locator('[aria-label="Suggested tasks"] > div').first();
  const rowVisible = await row.isVisible().catch(() => false);
  const rowCs = rowVisible
    ? await row.evaluate((el) => ({ bg: getComputedStyle(el).backgroundColor, radius: getComputedStyle(el).borderRadius }))
    : null;
  const ok =
    blockCs.w === 56 &&
    blockCs.h === 56 &&
    blockCs.bg.includes("rgb(251, 191, 36)") &&
    toggleVisible &&
    rowVisible &&
    rowCs.bg === "rgb(248, 250, 252)" &&
    rowCs.radius === "12px";
  verdict["200-myday.png"] = {
    ok,
    contracts: { blockCs, toggleVisible, rowCs },
  };
  await page.screenshot({ path: `${OUT}/200-myday.png` });
  await ctx.close();
}

// ---- frames 4-6: the dev-server set (:3000) --------------------------------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await login(page, DEV);
  await page.goto(`${DEV}/Dashboard`);
  await hydrated(page);
  // the auto-waiting visible wait (the S9 lesson: bare isVisible() races)
  await page.getByRole("heading", { level: 1 }).waitFor({ state: "visible", timeout: 20_000 });
  const navLinks = await page.evaluate(() => document.querySelectorAll("nav a").length);
  verdict["200-devserver-dashboard.png"] = { ok: navLinks === 20, contracts: { navLinks } };
  await page.screenshot({ path: `${OUT}/200-devserver-dashboard.png` });

  await page.goto(`${DEV}/Calendar`);
  await hydrated(page);
  const calCard = page.locator('[aria-label="Calendar month"]');
  await calCard.waitFor({ state: "visible", timeout: 20_000 });
  const calPad = await calCard.evaluate((el) => getComputedStyle(el).padding);
  verdict["200-devserver-calendar.png"] = {
    ok: calPad === "24px",
    contracts: { calPad },
  };
  await page.screenshot({ path: `${OUT}/200-devserver-calendar.png` });

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
  verdict["200-devserver-mobile-drawer.png"] = { ok, contracts: panel };
  await page.screenshot({ path: `${OUT}/200-devserver-mobile-drawer.png` });
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
