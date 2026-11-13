// S182 clone rotation probe — the Timetable + Files surfaces on the clone
// dev server, same probe as probe-s182-rows5.mjs (the standing rotation
// comparison). Note: the clone's demo account carries SEEDED timetable rows
// (data-shaped differences are expected; the class-level anatomy is the
// contract). Incremental saves to /tmp/s182-clone-rot.json.
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const CLONE = "http://localhost:3000";
const store = {};
const save = () => writeFileSync("/tmp/s182-clone-rot.json", JSON.stringify(store, null, 2));
const log = (...a) => { console.log(...a); };

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(`${CLONE}/login`, { timeout: 60_000, waitUntil: "domcontentloaded" });
await page.waitForTimeout(1200);
await page.fill("input[type=email]", "demo@studyflow.app");
await page.fill("input[type=password]", "Demo1234!");
await page.waitForFunction(() => {
  const btn = document.querySelector("button[type=submit]");
  return btn !== null && !btn.disabled;
}, null, { timeout: 30_000 });
await page.click("button[type=submit]");
await page.waitForFunction(() => document.querySelector("main") !== null, null, { timeout: 30_000 });
await page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true", null, { timeout: 30_000 });
await page.waitForTimeout(1500);

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
log("CLONE ROTATION PROBE COMPLETE — store at /tmp/s182-clone-rot.json");
