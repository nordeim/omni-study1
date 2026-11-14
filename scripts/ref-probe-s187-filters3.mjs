// S187 reference probe 3 — the FILTER-ROW micro-details: the search input
// anatomy (placeholder, height, padding, border, icon), the select
// trigger FULL classes + geometry, and the option lists (the popover
// opened read-only + Escape — zero residue). Assignments + Exams + the
// Tasks search, at desktop + mobile.
// Usage (node >= 23.6 — bun INCOMPATIBLE):
//   REF_PROBE_EMAIL=… REF_PROBE_PASSWORD=… node scripts/ref-probe-s187-filters3.mjs
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const REF = "https://omni-study1.base44.app";
const OUT = "docs/probe-evidence/s187";
mkdirSync(OUT, { recursive: true });

const INPUTS = `(() => {
  const main = document.querySelector("main") || document.body;
  const out = [];
  for (const input of main.querySelectorAll("input")) {
    const ph = input.placeholder || "";
    if (!ph.toLowerCase().includes("search")) continue;
    const cs = getComputedStyle(input);
    const wrap = input.closest("div");
    const icon = wrap ? wrap.querySelector("svg") : null;
    const ics = icon ? getComputedStyle(icon) : null;
    out.push({
      placeholder: ph,
      cls: (input.className || "").toString().slice(0, 130),
      h: Math.round(input.getBoundingClientRect().height),
      w: Math.round(input.getBoundingClientRect().width),
      pl: cs.paddingLeft,
      fs: cs.fontSize,
      borderColor: cs.borderTopColor,
      bg: cs.backgroundColor,
      radius: cs.borderTopLeftRadius,
      wrapCls: wrap ? (wrap.className || "").toString().slice(0, 120) : null,
      iconCls: icon ? (icon.getAttribute("class") || "").slice(0, 100) : null,
      iconPos: icon ? JSON.stringify({ pos: getComputedStyle(icon).position, left: ics ? ics.left : null, size: Math.round(icon.getBoundingClientRect().width) }) : null,
    });
    if (out.length >= 2) break;
  }
  return JSON.stringify(out);
})()`;

const TRIGGER_FULL = `(() => {
  const main = document.querySelector("main") || document.body;
  const out = [];
  for (const el of main.querySelectorAll("button")) {
    const cls = (el.className || "").toString();
    if (!cls.includes("justify-between")) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 40) continue;
    out.push({ text: (el.textContent || "").trim().slice(0, 30), cls, w: Math.round(r.width), h: Math.round(r.height) });
    if (out.length >= 3) break;
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

const out = { mode: await page.evaluate(() => document.documentElement.className), desktop: {}, mobile: {}, options: {} };

// The option lists (read-only popover open + Escape — zero residue).
for (const view of ["Assignments", "Exams"]) {
  await page.goto(`${REF}/${view}`);
  await page.waitForTimeout(2200);
  const triggers = page.locator("main button[class*=justify-between]");
  const n = await triggers.count();
  const lists = [];
  for (let i = 0; i < Math.min(n, 3); i++) {
    await triggers.nth(i).click();
    await page.waitForTimeout(700);
    const items = await page
      .evaluate(() => {
        const pop = document.querySelector('[role="listbox"]');
        if (!pop) return null;
        return {
          popCls: (pop.className || "").toString().slice(0, 110),
          items: [...pop.querySelectorAll('[role="option"]')].map((o) => ({
            text: (o.textContent || "").trim(),
            state: o.getAttribute("data-state"),
            cls: (o.className || "").toString().slice(0, 90),
          })),
        };
      })
      .catch(() => null);
    lists.push(items);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(400);
  }
  out.options[view] = lists;
  out.desktop[view] = JSON.parse(await page.evaluate(INPUTS));
  out.desktop[view + "Triggers"] = JSON.parse(await page.evaluate(TRIGGER_FULL));
}
await page.goto(`${REF}/Tasks`);
await page.waitForTimeout(2200);
out.desktop.TasksInputs = JSON.parse(await page.evaluate(INPUTS));

await page.setViewportSize({ width: 390, height: 844 });
for (const view of ["Assignments", "Exams", "Tasks"]) {
  await page.goto(`${REF}/${view}`);
  await page.waitForTimeout(2200);
  out.mobile[view] = JSON.parse(await page.evaluate(INPUTS));
  out.mobile[view + "Triggers"] = JSON.parse(await page.evaluate(TRIGGER_FULL));
}
await ctx.close();
await browser.close();
writeFileSync(`${OUT}/ref-filter-details.json`, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
