// S182 probe 5 — the standing rotation leg: the Timetable + Files families
// (the S181 close's named cadence successor). Compact class-level probes of
// the ref's surfaces: headings, empty states, the row anatomy, the add
// dialogs. Incremental saves to /tmp/s182-probe5.json. Zero residue.
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const REF = "https://omni-study1.base44.app";
const store = {};
const save = () => writeFileSync("/tmp/s182-probe5.json", JSON.stringify(store, null, 2));
const log = (...a) => { console.log(...a); };

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(`${REF}/login`, { timeout: 60_000, waitUntil: "domcontentloaded" });
await page.waitForTimeout(2500);
await page.fill("input[type=email]", process.env.REF_PROBE_EMAIL);
await page.fill("input[type=password]", process.env.REF_PROBE_PASSWORD);
await page.waitForFunction(() => {
  const btn = document.querySelector("button[type=submit]");
  return btn !== null && !btn.disabled;
}, null, { timeout: 30_000 });
await page.click("button[type=submit]");
await page.waitForFunction(() => document.querySelector("nav a") !== null, null, { timeout: 30_000 });
await page.waitForTimeout(2000);

const SURFACE = `(() => {
  const pane = document.querySelector("main") ?? document.body;
  const headings = [...pane.querySelectorAll("h1, h2, h3")].map((h) => ({
    text: h.textContent.trim().slice(0, 40),
    cls: String(h.className).slice(0, 120),
  })).slice(0, 10);
  const buttons = [...pane.querySelectorAll("button")].map((b) => ({
    text: b.textContent.trim().slice(0, 30),
    cls: String(b.className).slice(0, 100),
    ariaLabel: b.getAttribute("aria-label"),
  })).filter((b) => b.text || b.ariaLabel).slice(0, 14);
  const emptyState = [...pane.querySelectorAll("div")].find((d) =>
    d.className && String(d.className).includes("text-center") && d.querySelector("svg"));
  return {
    headings, buttons,
    emptyState: emptyState ? {
      cls: String(emptyState.className).slice(0, 140),
      text: emptyState.textContent.trim().slice(0, 120),
      svgCls: emptyState.querySelector("svg") ? String(emptyState.querySelector("svg").className.baseVal).slice(0, 60) : null,
    } : null,
    bodySnippet: pane.textContent.trim().slice(0, 300),
  };
})()`;

// ---- Timetable ----
await page.evaluate(() => {
  const a = [...document.querySelectorAll("nav a")].find((x) => x.textContent.trim().startsWith("Timetable"));
  if (a) a.click();
});
await page.waitForTimeout(2600);
store.timetable = await page.evaluate(SURFACE);
save();
log("timetable:", JSON.stringify(store.timetable, null, 1));

// ---- Files ----
await page.evaluate(() => {
  const a = [...document.querySelectorAll("nav a")].find((x) => x.textContent.trim().startsWith("Files"));
  if (a) a.click();
});
await page.waitForTimeout(2600);
store.files = await page.evaluate(SURFACE);
save();
log("files:", JSON.stringify(store.files, null, 1));

await ctx.close();
await browser.close();
log("PROBE 5 COMPLETE — store at /tmp/s182-probe5.json");
