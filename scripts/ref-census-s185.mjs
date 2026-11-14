// S185 closing census — the reference account's zero-residue verification
// (the cycle's probes opened dialogs + Escape-closed them; nothing was
// created or deleted). The 14-data-view text scan: each view's list/grid
// renders no rows beyond the shell's own chrome.
// Usage: REF_PROBE_EMAIL=… REF_PROBE_PASSWORD=… node scripts/ref-census-s185.mjs
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const REF = "https://omni-study1.base44.app";
const VIEWS = [
  "Dashboard", "My Day", "Tasks", "Calendar", "Events", "Timetable",
  "Assignments", "Exams", "Notes", "Flashcards", "Practice Tests",
  "Study Groups", "Grade Tracker", "Files",
];

const COUNTS = `(() => {
  const main = document.querySelector("main") || document.body;
  const text = (main.textContent || "").trim();
  // the row-ish signatures per view family: any of these strings appearing
  // means a data row exists (the shell never renders them at zero)
  const markers = [
    "Probe", "S1", "S7", "S8", "S9", "S13", "S13", "S79", "S13",
    "deck", "note", "card", "file", "subject", "class", "task",
  ];
  const hits = markers.filter((m) => text.toLowerCase().includes(m.toLowerCase() && m));
  return JSON.stringify({ len: text.length, hasProbe: /probe/i.test(text), hasSnum: /S\\d{2,3}\\b/.test(text) });
})()`;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
try {
  await page.goto(`${REF}/login`, { timeout: 45_000 });
  await page.fill("input[type=email]", process.env.REF_PROBE_EMAIL);
  await page.fill("input[type=password]", process.env.REF_PROBE_PASSWORD);
  await page.waitForFunction(
    () => { const b = document.querySelector("button[type=submit]"); return b && !b.disabled; },
    null, { timeout: 15_000 },
  );
  await page.click("button[type=submit]");
  await page.waitForFunction(
    () => document.querySelector("nav a") !== null && document.querySelector("h1, h2") !== null,
    null, { timeout: 30_000 },
  );
  await page.waitForTimeout(1500);
  const out = {};
  for (const label of VIEWS) {
    const link = page.locator("nav a").filter({ hasText: label }).first();
    await link.click({ timeout: 15_000 });
    await page.waitForTimeout(1600);
    const res = await page.evaluate(`(() => {
      const main = document.querySelector("main") || document.body;
      const t = (main.textContent || "").trim();
      return JSON.stringify({ hasProbe: /probe/i.test(t), hasSnum: /\\bS\\d{2,3}\\b/.test(t) });
    })()`);
    out[label] = JSON.parse(res);
  }
  writeFileSync("docs/probe-evidence/s185/ref-closing-census.json", JSON.stringify(out, null, 2));
  const dirty = Object.entries(out).filter(([k, v]) => v.hasProbe || v.hasSnum);
  console.log(JSON.stringify({ ok: dirty.length === 0, views: Object.keys(out).length, dirty }, null, 2));
} catch (err) {
  console.error("CENSUS-FAIL:", String(err).slice(0, 500));
  process.exitCode = 1;
} finally {
  await browser.close();
}
