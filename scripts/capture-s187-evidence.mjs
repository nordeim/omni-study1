// S187 evidence capture — the five self-verifying frames (the dev server
// at :3000 carries the current ported code). Each frame DOM-asserts its
// markers BEFORE the shot (the self-verifying convention): Frame 1 the
// separated Exams header + filter row (desktop 1440 — the header's 2-kid
// census + the sibling filter row's geometry); Frame 2 the mobile 390
// filter rows (Exams column + the 160px select; the Assignments 160px
// selects); Frame 3 the sf-card border family (the Dashboard stat card
// slate-100) + the Calendar month card's slate-200 no-shadow side (the
// measured BY-VIEW boundary); Frame 4 the Tasks one-line mobile toolbar
// (the collapsed search + the 36px row); Frame 5 the desktop Tasks search
// (the definite 256px md:w-64).
// Usage: node scripts/capture-s187-evidence.mjs
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const CLONE = "http://localhost:3000";
const OUT = "docs/screenshots";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${CLONE}/login`);
  await page.fill("input[type=email]", "demo@studyflow.app");
  await page.fill("input[type=password]", "Demo1234!");
  await page.waitForFunction(() => { const b = document.querySelector("button[type=submit]"); return b && !b.disabled; }, null, { timeout: 15_000 });
  await page.click("button[type=submit]");
  await page.waitForFunction(() => document.querySelector("nav a") !== null && document.querySelector("h1, h2") !== null, null, { timeout: 30_000 });
  await page.waitForTimeout(1500);

  // Frame 1: the separated Exams header + filter row at desktop.
  await page.goto(`${CLONE}/Exams`);
  await page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true", null, { timeout: 15_000 });
  await page.waitForTimeout(1200);
  const f1 = await page.evaluate(() => {
    const h1 = document.querySelector("main h1");
    let header = h1.parentElement;
    for (let i = 0; i < 6 && header; i++) {
      if (getComputedStyle(header).display === "flex") break;
      header = header.parentElement;
    }
    const sib = header.nextElementSibling;
    const scs = getComputedStyle(sib);
    const search = sib.querySelector("input");
    const select = sib.querySelector("[role=combobox]");
    return {
      headerKids: header.children.length,
      headerInputs: header.querySelectorAll("input").length,
      rowDir: scs.flexDirection,
      rowGap: scs.gap,
      searchW: search ? Math.round(search.getBoundingClientRect().width) : null,
      selectW: select ? Math.round(select.getBoundingClientRect().width) : null,
      searchPl: search ? getComputedStyle(search).paddingLeft : null,
    };
  });
  if (!f1 || f1.headerKids !== 2 || f1.headerInputs !== 0 || f1.rowDir !== "row" || f1.rowGap !== "16px" || f1.selectW !== 160 || f1.searchPl !== "40px") {
    throw new Error(`Frame 1 markers failed: ${JSON.stringify(f1)}`);
  }
  await page.screenshot({ path: `${OUT}/187-exams-separated-desktop.png` });

  // Frame 3 (desktop half): the sf-card border family + the Calendar side.
  await page.goto(`${CLONE}/Dashboard`);
  await page.waitForTimeout(1500);
  const f3a = await page.evaluate(() => {
    const card = document.querySelector("main .sf-card");
    if (!card) return null;
    const cs = getComputedStyle(card);
    return { bc: cs.borderTopColor };
  });
  if (!f3a || f3a.bc !== "rgb(241, 245, 249)") throw new Error(`Frame 3a markers failed: ${JSON.stringify(f3a)}`);
  await page.goto(`${CLONE}/Calendar`);
  await page.waitForTimeout(1500);
  const f3b = await page.evaluate(() => {
    const card = document.querySelector('[aria-label="Calendar month"]');
    if (!card) return null;
    const cs = getComputedStyle(card);
    return { bc: cs.borderTopColor, shadow: cs.boxShadow };
  });
  if (!f3b || f3b.bc !== "rgb(226, 232, 240)" || f3b.shadow !== "none") throw new Error(`Frame 3b markers failed: ${JSON.stringify(f3b)}`);
  await page.screenshot({ path: `${OUT}/187-card-border-boundary.png` });
  console.log("frames 1+3 ok:", JSON.stringify({ f1, f3a, f3b }));
  await ctx.close();

  // ---- Frames 2/4/5: the mobile + Tasks frames ----
  const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page2 = await ctx2.newPage();
  await page2.goto(`${CLONE}/login`);
  await page2.fill("input[type=email]", "demo@studyflow.app");
  await page2.fill("input[type=password]", "Demo1234!");
  await page2.waitForFunction(() => { const b = document.querySelector("button[type=submit]"); return b && !b.disabled; }, null, { timeout: 15_000 });
  await page2.click("button[type=submit]");
  await page2.waitForFunction(() => document.querySelector("nav a") !== null && document.querySelector("h1, h2") !== null, null, { timeout: 30_000 });
  await page2.waitForTimeout(1500);

  // Frame 2: the mobile filter rows — Exams column + 160px select; the
  // Assignments 160px selects.
  await page2.goto(`${CLONE}/Exams`);
  await page2.waitForFunction(() => document.documentElement.dataset.appHydrated === "true", null, { timeout: 15_000 });
  await page2.waitForTimeout(1200);
  const f2a = await page2.evaluate(() => {
    const h1 = document.querySelector("main h1");
    let header = h1.parentElement;
    for (let i = 0; i < 6 && header; i++) {
      if (getComputedStyle(header).display === "flex") break;
      header = header.parentElement;
    }
    const sib = header.nextElementSibling;
    const scs = getComputedStyle(sib);
    const select = sib.querySelector("[role=combobox]");
    return { rowDir: scs.flexDirection, selectW: select ? Math.round(select.getBoundingClientRect().width) : null };
  });
  if (!f2a || f2a.rowDir !== "column" || f2a.selectW !== 160) throw new Error(`Frame 2a markers failed: ${JSON.stringify(f2a)}`);
  await page2.screenshot({ path: `${OUT}/187-exams-filter-mobile.png` });

  await page2.goto(`${CLONE}/Assignments`);
  await page2.waitForTimeout(1200);
  const f2b = await page2.evaluate(() => {
    const combos = [...document.querySelectorAll("main [role=combobox]")];
    return { ws: combos.map((c) => Math.round(c.getBoundingClientRect().width)) };
  });
  if (!f2b || f2b.ws.length !== 2 || !f2b.ws.every((w) => w === 160)) throw new Error(`Frame 2b markers failed: ${JSON.stringify(f2b)}`);
  await page2.screenshot({ path: `${OUT}/187-assignments-selects-mobile.png` });
  console.log("frame 2 ok:", JSON.stringify({ f2a, f2b }));

  // Frame 4: the Tasks one-line mobile toolbar (the collapsed search).
  await page2.goto(`${CLONE}/Tasks`);
  await page2.waitForTimeout(1200);
  const f4 = await page2.evaluate(() => {
    const input = [...document.querySelectorAll("main input")].find((i) => (i.placeholder || "").toLowerCase().includes("search"));
    const wrap = input.closest("div");
    let tb = wrap;
    while (tb && !(getComputedStyle(tb).display === "flex" && getComputedStyle(tb).flexWrap === "wrap")) tb = tb.parentElement;
    return { wrapW: Math.round(wrap.getBoundingClientRect().width), tbH: tb ? Math.round(tb.getBoundingClientRect().height) : null };
  });
  if (!f4 || f4.wrapW > 130 || f4.tbH !== 36) throw new Error(`Frame 4 markers failed: ${JSON.stringify(f4)}`);
  await page2.screenshot({ path: `${OUT}/187-tasks-oneline-toolbar-mobile.png` });
  await ctx2.close();
  console.log("frame 4 ok:", JSON.stringify(f4));

  // Frame 5: the desktop Tasks search (the definite 256px).
  const ctx3 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page3 = await ctx3.newPage();
  await page3.goto(`${CLONE}/login`);
  await page3.fill("input[type=email]", "demo@studyflow.app");
  await page3.fill("input[type=password]", "Demo1234!");
  await page3.waitForFunction(() => { const b = document.querySelector("button[type=submit]"); return b && !b.disabled; }, null, { timeout: 15_000 });
  await page3.click("button[type=submit]");
  await page3.waitForFunction(() => document.querySelector("nav a") !== null && document.querySelector("h1, h2") !== null, null, { timeout: 30_000 });
  await page3.waitForTimeout(1500);
  await page3.goto(`${CLONE}/Tasks`);
  await page3.waitForTimeout(1200);
  const f5 = await page3.evaluate(() => {
    const input = [...document.querySelectorAll("main input")].find((i) => (i.placeholder || "").toLowerCase().includes("search"));
    const wrap = input.closest("div");
    return { wrapW: Math.round(wrap.getBoundingClientRect().width) };
  });
  if (!f5 || f5.wrapW !== 256) throw new Error(`Frame 5 markers failed: ${JSON.stringify(f5)}`);
  await page3.screenshot({ path: `${OUT}/187-tasks-search-256-desktop.png` });
  await ctx3.close();
  console.log("frame 5 ok:", JSON.stringify(f5));
} finally {
  await browser.close();
}
console.log("ALL 5 S187 FRAMES CAPTURED + SELF-VERIFIED");
