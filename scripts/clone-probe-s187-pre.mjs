// S187 clone-side probe — the PRE-CHANGE state of the axis surfaces (the
// RED-marker design input): the Exams header + toolbar, the Assignments
// selects, the search paddings/sizes on all three views, the Tasks search
// wrapper geometry at both viewports, and a representative sf-card border.
// Runs against the dev tree on :3000 (with-dev-server wrapper).
// Usage: node scripts/clone-probe-s187-pre.mjs   (node >= 23.6)
import { chromium } from "playwright";

const CLONE = "http://localhost:3000";

const HDR = `(() => {
  const main = document.querySelector("main") || document.body;
  const h1 = main.querySelector("h1, h2");
  if (!h1) return JSON.stringify({ err: "no-h1" });
  let header = h1.parentElement;
  for (let i = 0; i < 4 && header && header !== main; i++) {
    if (getComputedStyle(header).display === "flex") break;
    header = header.parentElement;
  }
  const controls = [...header.querySelectorAll("input, button")].filter(el => el.getBoundingClientRect().width > 0);
  return JSON.stringify({
    headerCls: (header.className || "").toString().slice(0, 120),
    controlTexts: controls.map(c => (c.getAttribute("aria-label") || c.textContent || c.placeholder || "input").trim().slice(0, 30)),
    kidCount: header.children.length,
  });
})()`;

const FILTERROW = `(() => {
  const main = document.querySelector("main") || document.body;
  const h1 = main.querySelector("h1, h2");
  let header = h1.parentElement;
  for (let i = 0; i < 4 && header && header !== main; i++) {
    if (getComputedStyle(header).display === "flex") break;
    header = header.parentElement;
  }
  const sib = header.nextElementSibling;
  if (!sib) return JSON.stringify({ err: "no-sibling-row" });
  const cs = getComputedStyle(sib);
  return JSON.stringify({
    cls: (sib.className || "").toString().slice(0, 120),
    dir: cs.flexDirection, gap: cs.gap,
    kidWs: [...sib.children].map(k => Math.round(k.getBoundingClientRect().width)),
  });
})()`;

const SEARCH = `(() => {
  const main = document.querySelector("main") || document.body;
  const input = [...main.querySelectorAll("input")].find(i => (i.placeholder || "").toLowerCase().includes("search"));
  if (!input) return JSON.stringify({ err: "none" });
  const wrap = input.closest("div");
  const cs = getComputedStyle(input);
  return JSON.stringify({
    ph: input.placeholder,
    pl: cs.paddingLeft,
    fs: cs.fontSize,
    inputW: Math.round(input.getBoundingClientRect().width),
    wrapCls: wrap ? (wrap.className || "").toString().slice(0, 90) : null,
    wrapW: wrap ? Math.round(wrap.getBoundingClientRect().width) : null,
  });
})()`;

const SELECTS = `(() => {
  const main = document.querySelector("main") || document.body;
  const out = [];
  for (const el of main.querySelectorAll("button[role=combobox], [role=combobox]")) {
    out.push({ w: Math.round(el.getBoundingClientRect().width), h: Math.round(el.getBoundingClientRect().height), text: (el.textContent || "").trim().slice(0, 24) });
    if (out.length >= 3) break;
  }
  return JSON.stringify(out);
})()`;

const TOOLBAR_H = `(() => {
  const main = document.querySelector("main") || document.body;
  const input = [...main.querySelectorAll("input")].find(i => (i.placeholder || "").toLowerCase().includes("search"));
  if (!input) return JSON.stringify({ err: "none" });
  let tb = input.closest("div.flex");
  return JSON.stringify({ toolbarCls: tb ? (tb.className || "").toString().slice(0, 90) : null, h: tb ? Math.round(tb.getBoundingClientRect().height) : null });
})()`;

const SF_CARD = `(() => {
  const main = document.querySelector("main") || document.body;
  const card = main.querySelector(".sf-card");
  if (!card) return JSON.stringify({ err: "none" });
  const cs = getComputedStyle(card);
  return JSON.stringify({ bc: cs.borderTopColor, bw: cs.borderTopWidth, radius: cs.borderTopLeftRadius, bg: cs.backgroundColor });
})()`;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(`${CLONE}/login`);
await page.fill("input[type=email]", "demo@studyflow.app");
await page.fill("input[type=password]", "Demo1234!");
await page.waitForFunction(() => { const b = document.querySelector("button[type=submit]"); return b && !b.disabled; }, null, { timeout: 15_000 });
await page.click("button[type=submit]");
await page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true" && document.querySelector("main"), null, { timeout: 30_000 });
await page.waitForTimeout(1500);

const out = { desktop: {}, mobile: {} };
for (const view of ["Exams", "Assignments", "Tasks", "GradeTracker"]) {
  await page.goto(`${CLONE}/${view}`);
  await page.waitForTimeout(1400);
  const r = {};
  r.header = JSON.parse(await page.evaluate(HDR));
  if (view === "Exams" || view === "Assignments") r.filterRow = JSON.parse(await page.evaluate(FILTERROW));
  r.search = JSON.parse(await page.evaluate(SEARCH));
  if (view === "Exams" || view === "Assignments") r.selects = JSON.parse(await page.evaluate(SELECTS));
  if (view === "Tasks") r.toolbar = JSON.parse(await page.evaluate(TOOLBAR_H));
  if (view === "GradeTracker") r.sfCard = JSON.parse(await page.evaluate(SF_CARD));
  out.desktop[view] = r;
}
await page.setViewportSize({ width: 390, height: 844 });
for (const view of ["Exams", "Assignments", "Tasks"]) {
  await page.goto(`${CLONE}/${view}`);
  await page.waitForTimeout(1400);
  const r = {};
  r.header = JSON.parse(await page.evaluate(HDR));
  if (view === "Exams" || view === "Assignments") r.filterRow = JSON.parse(await page.evaluate(FILTERROW));
  r.search = JSON.parse(await page.evaluate(SEARCH));
  if (view === "Exams" || view === "Assignments") r.selects = JSON.parse(await page.evaluate(SELECTS));
  if (view === "Tasks") r.toolbar = JSON.parse(await page.evaluate(TOOLBAR_H));
  out.mobile[view] = r;
}
await ctx.close();
await browser.close();
console.log(JSON.stringify(out, null, 1));
