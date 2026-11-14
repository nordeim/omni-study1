// S186 reference probe 6 — the Light-switch mechanism. The s186-light5
// click on the "Light" card left html.dark unchanged. This probe dumps the
// Appearance tab's mode-card DOM (tag/aria/state), clicks Light with a
// reload, and — if the class flips — measures the axis surfaces in LIGHT,
// then restores Dark. Zero content residue.
// Usage (node >= 23.6 — bun INCOMPATIBLE):
//   REF_PROBE_EMAIL=… REF_PROBE_PASSWORD=… node scripts/ref-probe-s186-light6.mjs
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const REF = "https://omni-study1.base44.app";
const OUT = "docs/probe-evidence/s186";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(`${REF}/login`);
await page.fill("input[type=email]", process.env.REF_PROBE_EMAIL);
await page.fill("input[type=password]", process.env.REF_PROBE_PASSWORD);
await page.waitForFunction(() => { const b = document.querySelector("button[type=submit]"); return b && !b.disabled; }, null, { timeout: 15_000 });
await page.click("button[type=submit]");
await page.waitForFunction(() => document.querySelector("nav a") !== null && (document.querySelector("h1") || document.querySelector("h2")), null, { timeout: 30_000 });
await page.waitForTimeout(1500);

await page.goto(`${REF}/Settings`);
await page.waitForTimeout(2600);

// 1. Dump the Appearance tab area: find elements containing "Light"/"Dark"/"System".
const dump = await page.evaluate(`(() => {
  const out = [];
  for (const el of document.querySelectorAll("main *")) {
    const t = (el.textContent || "").trim();
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    if (["Light", "Dark", "System"].includes(t) && r.width > 0 && cs.display !== "none") {
      out.push({ tag: el.tagName, text: t, cls: (el.className || "").toString().slice(0, 90), bg: cs.backgroundColor, w: Math.round(r.width), h: Math.round(r.height), ariaPressed: el.getAttribute("aria-pressed"), dataState: el.getAttribute("data-state") });
    }
  }
  return JSON.stringify(out);
})()`);
console.log("[s186-light6] mode-card dump:", dump.slice(0, 1600));

// 2. Click the element whose exact text is "Light" — try button first, then any.
const clicked = await page.evaluate(`(() => {
  const find = () => {
    for (const el of document.querySelectorAll("main button, main [role=button], main div, main span")) {
      const t = (el.textContent || "").trim();
      const r = el.getBoundingClientRect();
      if (t === "Light" && r.width > 0 && getComputedStyle(el).display !== "none") return el;
    }
    return null;
  };
  const el = find();
  if (!el) return "not-found";
  el.scrollIntoView({ block: "center" });
  el.click();
  return "clicked:" + el.tagName + "." + (el.className || "").toString().slice(0, 60);
})()`);
console.log(`[s186-light6] ${clicked}`);
await page.waitForTimeout(2500);
let cls = await page.evaluate(() => document.documentElement.className);
console.log(`[s186-light6] class after click: "${cls}"`);

// 3. Reload — the theme may apply from persisted state after a reload.
await page.reload();
await page.waitForTimeout(3000);
cls = await page.evaluate(() => document.documentElement.className);
console.log(`[s186-light6] class after reload: "${cls}"`);

// 4. If light applied, measure the axis; then restore dark either way.
const state = { dump: JSON.parse(dump), clicked, classAfterClick: cls, axis: null };
if (!cls.includes("dark")) {
  const AXIS = `(() => {
    const main = document.querySelector("main") || document.body;
    const pick = (re) => { const b = [...main.querySelectorAll("button")].find(x => re.test((x.textContent || "").trim())); if (!b) return null; const cs = getComputedStyle(b); return { bg: cs.backgroundColor, color: cs.color, bi: cs.backgroundImage.slice(0, 70), border: cs.borderTopWidth + " " + cs.borderTopColor, h: Math.round(b.getBoundingClientRect().height) }; };
    return JSON.stringify({ addTask: pick(/^Add Task$/), active: pick(/^Active$/), gridBuilder: pick(/^Grid Builder$/), newFolder: pick(/^New Folder$/), bodyBg: getComputedStyle(document.body).backgroundColor, baseText: getComputedStyle(document.body).color });
  })()`;
  const axis = {};
  for (const view of ["Tasks", "Timetable", "Files"]) {
    await page.goto(`${REF}/${view}`);
    await page.waitForTimeout(2300);
    axis[view] = JSON.parse(await page.evaluate(AXIS));
    console.log(`[s186-light6] LIGHT ${view}: ${JSON.stringify(axis[view])}`);
  }
  state.axis = axis;
}

// 5. Restore dark (as found).
const restore = await page.evaluate(`(() => {
  for (const el of document.querySelectorAll("main button, main [role=button], main div, main span")) {
    const t = (el.textContent || "").trim();
    const r = el.getBoundingClientRect();
    if (t === "Dark" && r.width > 0 && getComputedStyle(el).display !== "none") { el.scrollIntoView({ block: "center" }); el.click(); return "clicked"; }
  }
  return "not-found";
})()`);
await page.waitForTimeout(2000);
await page.reload();
await page.waitForTimeout(3000);
const finalCls = await page.evaluate(() => document.documentElement.className);
console.log(`[s186-light6] restored: "${restore}" class="${finalCls}"`);
state.restore = restore;
state.finalClass = finalCls;

await ctx.close();
await browser.close();
writeFileSync(`${OUT}/ref-light-mechanism.json`, JSON.stringify(state, null, 2));
