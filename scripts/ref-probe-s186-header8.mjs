// S186 reference probe 8 — the VIEW-HEADER ROW census (all 20 views).
// The measured form so far: flex flex-col md:flex-row md:items-center
// justify-between gap-4 (Tasks carries mb-6; Dashboard carries
// md:justify-between) vs the clone's flex-wrap (S78/AE12). This probe
// censuses the h1's closest flex container on every view at desktop
// (1440x900) AND mobile (390x844) — full class + computed direction.
// Usage (node >= 23.6 — bun INCOMPATIBLE):
//   REF_PROBE_EMAIL=… REF_PROBE_PASSWORD=… node scripts/ref-probe-s186-header8.mjs
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const REF = "https://omni-study1.base44.app";
const OUT = "docs/probe-evidence/s186";
mkdirSync(OUT, { recursive: true });

const VIEWS = ["Dashboard", "MyDay", "Tasks", "Calendar", "Events", "Timetable", "Assignments", "Exams", "Notes", "Flashcards", "PracticeTests", "StudyGroups", "GradeTracker", "Analytics", "Files", "Calculator", "MathSolver", "AIAssistant", "FocusTimer", "Settings"];

const HDR = `(() => {
  const main = document.querySelector("main") || document.body;
  const h1 = main.querySelector("h1, h2");
  if (!h1) return JSON.stringify({ err: "no-h1" });
  // The closest ancestor flex container that also carries the toolbar.
  let row = h1.parentElement;
  for (let i = 0; i < 4 && row && row !== main; i++) {
    const cs = getComputedStyle(row);
    if (cs.display === "flex" && row.querySelectorAll("button, select, input").length > 0) break;
    row = row.parentElement;
  }
  if (!row || row === main) { row = h1.parentElement; }
  const cs = getComputedStyle(row);
  const kids = [...row.children].map(k => ({ tag: k.tagName, cls: (k.className || "").toString().slice(0, 60), w: Math.round(k.getBoundingClientRect().width) }));
  return JSON.stringify({
    heading: h1.textContent.trim().slice(0, 30),
    rowCls: (row.className || "").toString().slice(0, 130),
    display: cs.display, dir: cs.flexDirection, wrap: cs.flexWrap, gap: cs.gap, items: cs.alignItems, justify: cs.justifyContent,
    rowH: Math.round(row.getBoundingClientRect().height),
    kids,
  });
})()`;

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

const out = { desktop: {}, mobile: {} };
for (const view of VIEWS) {
  await page.goto(`${REF}/${view}`);
  await page.waitForTimeout(2000);
  out.desktop[view] = JSON.parse(await page.evaluate(HDR));
}
await page.setViewportSize({ width: 390, height: 844 });
for (const view of VIEWS) {
  await page.goto(`${REF}/${view}`);
  await page.waitForTimeout(2000);
  out.mobile[view] = JSON.parse(await page.evaluate(HDR));
}
await ctx.close();
await browser.close();
writeFileSync(`${OUT}/ref-header-rows.json`, JSON.stringify(out, null, 2));
for (const [view, d] of Object.entries(out.desktop)) {
  console.log(`D ${view}: dir=${d.dir} wrap=${d.wrap} gap=${d.gap} h=${d.rowH} cls="${(d.rowCls || "").slice(0, 90)}"`);
}
console.log("---");
for (const [view, d] of Object.entries(out.mobile)) {
  console.log(`M ${view}: dir=${d.dir} wrap=${d.wrap} gap=${d.gap} h=${d.rowH} kids=${(d.kids || []).length}`);
}
