// S187 reference probe 4 — the follow-up card census: the CALENDAR cards
// (the S8-era light-mode record says border-slate-200) + the GradeTracker
// stat cards (the EK6 pin's surface family) — completing the S187
// card-border census that skipped these views.
// Usage (node >= 23.6 — bun INCOMPATIBLE):
//   REF_PROBE_EMAIL=… REF_PROBE_PASSWORD=… node scripts/ref-probe-s187-cards4.mjs
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const REF = "https://omni-study1.base44.app";
const OUT = "docs/probe-evidence/s187";
mkdirSync(OUT, { recursive: true });

const CARDS = `(() => {
  const main = document.querySelector("main") || document.body;
  const out = [];
  const seen = new Set();
  for (const el of main.querySelectorAll("div, section, article, aside")) {
    if (seen.has(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 120 || r.height < 60) continue;
    const cs = getComputedStyle(el);
    const radius = parseFloat(cs.borderTopLeftRadius) || 0;
    const bg = cs.backgroundColor;
    if (radius < 12) continue;
    if (cs.borderTopWidth === "0px" || cs.borderTopStyle === "none") continue;
    if (!bg.includes("255, 255, 255")) continue;
    let p = el.parentElement;
    let covered = false;
    while (p && p !== main) { if (seen.has(p)) { covered = true; break; } p = p.parentElement; }
    if (covered) continue;
    seen.add(el);
    out.push({
      tag: el.tagName,
      cls: (el.className || "").toString().slice(0, 150),
      w: Math.round(r.width),
      radius: cs.borderTopLeftRadius,
      bg,
      borderColor: cs.borderTopColor,
      text: (el.textContent || "").trim().replace(/\\s+/g, " ").slice(0, 40),
    });
    if (out.length >= 6) break;
  }
  return JSON.stringify(out);
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

const out = { mode: await page.evaluate(() => document.documentElement.className), cards: {} };
for (const view of ["Calendar", "GradeTracker", "MyDay", "Analytics", "Flashcards", "FocusTimer"]) {
  await page.goto(`${REF}/${view}`);
  await page.waitForTimeout(2200);
  out.cards[view] = JSON.parse(await page.evaluate(CARDS));
}
await ctx.close();
await browser.close();
writeFileSync(`${OUT}/ref-card-borders2.json`, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
