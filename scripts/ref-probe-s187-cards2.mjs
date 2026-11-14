// S187 reference probe 2 — the CARD-BORDER census (the sf-card border
// token family: the clone's #e2e8f0/slate-200 vs the standing record's
// slate-100, first measured on the S185 Timetable card). This probe
// censuses the white rounded card surfaces across views at desktop,
// measuring borderColor/width/radius/bg + the full class list. The
// reference account rides DARK (the owner's persisted state) but its
// view-layer cards stay bg-white with STATIC slate border classes (the
// S185/S186 record) — mode-independent, verifiable against the light-era
// measurements. The probe also captures the select-trigger border family
// (border-input token — DARK-SCOPED, recorded for the format only).
// Usage (node >= 23.6 — bun INCOMPATIBLE):
//   REF_PROBE_EMAIL=… REF_PROBE_PASSWORD=… node scripts/ref-probe-s187-cards2.mjs
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const REF = "https://omni-study1.base44.app";
const OUT = "docs/probe-evidence/s187";
mkdirSync(OUT, { recursive: true });

// The card finder: inside main, the white rounded bordered block surfaces
// (the sf-card equivalents) — direct-ish children of the view layout,
// radius >= 12px, bg white, a real border.
const CARDS = `(() => {
  const main = document.querySelector("main") || document.body;
  const out = [];
  const seen = new Set();
  for (const el of main.querySelectorAll("div, section, article")) {
    if (seen.has(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 120 || r.height < 60) continue;
    const cs = getComputedStyle(el);
    const radius = parseFloat(cs.borderTopLeftRadius) || 0;
    const bg = cs.backgroundColor;
    if (radius < 12) continue;
    if (cs.borderTopWidth === "0px" || cs.borderTopStyle === "none") continue;
    // White-ish card (the S186 record: the cards stay bg-white in dark).
    if (!bg.includes("255, 255, 255")) continue;
    // Skip if an ancestor is already captured (dedupe to the OUTER shell).
    let p = el.parentElement;
    let covered = false;
    while (p && p !== main) { if (seen.has(p)) { covered = true; break; } p = p.parentElement; }
    if (covered) continue;
    seen.add(el);
    out.push({
      cls: (el.className || "").toString().slice(0, 150),
      w: Math.round(r.width),
      h: Math.round(r.height),
      radius: cs.borderTopLeftRadius,
      bg,
      borderColor: cs.borderTopColor,
      borderWidth: cs.borderTopWidth,
      shadow: cs.boxShadow.slice(0, 80),
      text: (el.textContent || "").trim().replace(/\\s+/g, " ").slice(0, 50),
    });
    if (out.length >= 6) break;
  }
  return JSON.stringify(out);
})()`;

// The select-trigger border family (the filter-row triggers) — token-
// driven (border-input), DARK-scoped, recorded for format only.
const TRIGGERS = `(() => {
  const main = document.querySelector("main") || document.body;
  const out = [];
  for (const el of main.querySelectorAll("button, [role=combobox]")) {
    const cs = getComputedStyle(el);
    const cls = (el.className || "").toString();
    if (!cls.includes("justify-between")) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 40) continue;
    out.push({
      text: (el.textContent || "").trim().slice(0, 24),
      cls: cls.slice(0, 130),
      h: Math.round(r.height),
      w: Math.round(r.width),
      borderColor: cs.borderTopColor,
      bg: cs.backgroundColor,
      radius: cs.borderTopLeftRadius,
    });
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
await page.waitForFunction(() => { const b = document.querySelector("button[type=submit]"); return b && !b.disabled; }, null, { timeout: 15_000 });
await page.click("button[type=submit]");
await page.waitForFunction(() => document.querySelector("nav a") !== null && (document.querySelector("h1") || document.querySelector("h2")), null, { timeout: 30_000 });
await page.waitForTimeout(1500);

const mode = await page.evaluate(() => ({
  htmlClass: document.documentElement.className,
  bodyBg: getComputedStyle(document.body).backgroundColor,
}));

const out = { mode, cards: {}, triggers: {} };
for (const view of ["Dashboard", "Tasks", "Assignments", "Exams", "Notes", "StudyGroups", "Analytics", "Settings", "Timetable"]) {
  await page.goto(`${REF}/${view}`);
  await page.waitForTimeout(2200);
  out.cards[view] = JSON.parse(await page.evaluate(CARDS));
  out.triggers[view] = JSON.parse(await page.evaluate(TRIGGERS));
}
await ctx.close();
await browser.close();
writeFileSync(`${OUT}/ref-card-borders.json`, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
