// S187 reference probe 5 — the Calendar + GradeTracker card FULL styles
// (the two-family boundary's slate-200 side: border + shadow + bg + radius).
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
const REF = "https://omni-study1.base44.app";
const OUT = "docs/probe-evidence/s187";
mkdirSync(OUT, { recursive: true });
const FULL = `(() => {
  const main = document.querySelector("main") || document.body;
  const out = [];
  for (const el of main.querySelectorAll("div, section, aside")) {
    const r = el.getBoundingClientRect();
    if (r.width < 120 || r.height < 60) continue;
    const cs = getComputedStyle(el);
    if (!cs.backgroundColor.includes("255, 255, 255")) continue;
    if ((parseFloat(cs.borderTopLeftRadius) || 0) < 12) continue;
    if (cs.borderTopWidth === "0px") continue;
    out.push({ tag: el.tagName, cls: (el.className || "").toString().slice(0, 160), w: Math.round(r.width),
      bc: cs.borderTopColor, bw: cs.borderTopWidth, radius: cs.borderTopLeftRadius, bg: cs.backgroundColor,
      shadow: cs.boxShadow.slice(0, 90) });
    if (out.length >= 4) break;
  }
  return JSON.stringify(out);
})()`;
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(`${REF}/login`);
await page.fill("input[type=email]", process.env.REF_PROBE_EMAIL);
await page.fill("input[type=password]", process.env.REF_PROBE_PASSWORD);
await page.waitForFunction(() => { const b = document.querySelector("button[type=submit]"); return b && !b.disabled; }, null, { timeout: 15000 });
await page.click("button[type=submit]");
await page.waitForFunction(() => document.querySelector("nav a") !== null && (document.querySelector("h1") || document.querySelector("h2")), null, { timeout: 30000 });
await page.waitForTimeout(1500);
const out = { mode: await page.evaluate(() => document.documentElement.className), cards: {} };
for (const view of ["Calendar", "GradeTracker", "Dashboard"]) {
  await page.goto(`${REF}/${view}`);
  await page.waitForTimeout(2200);
  out.cards[view] = JSON.parse(await page.evaluate(FULL));
}
await ctx.close(); await browser.close();
writeFileSync(`${OUT}/ref-card-borders3.json`, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 1));
