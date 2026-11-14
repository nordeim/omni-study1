// S186 reference probe 2 — the THEME-STATE disambiguation. The census found
// near-white base text everywhere + the Settings "Dark" mode card carrying
// the selected tint + YELLOW (rgb(255,255,0)) on primary-foreground texts.
// Hypotheses: (a) the reference account's persisted theme was switched to
// Dark since the S185 close and the reference's dark mode NOW WORKS (the
// S10 "platform no-op" record invalidated); (b) an accent change. This
// probe captures: the html/body/card computed colors, the theme-store
// state if reachable, full-page screenshots (Tasks, Settings, Timetable,
// Dashboard) + the pixel ink of the Add Task button band.
// Usage (node >= 23.6 — bun INCOMPATIBLE):
//   REF_PROBE_EMAIL=… REF_PROBE_PASSWORD=… node scripts/ref-probe-s186-theme2.mjs
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const REF = "https://omni-study1.base44.app";
const OUT = "docs/probe-evidence/s186";
mkdirSync(OUT, { recursive: true });

const THEME_PROBE = `(() => {
  const html = document.documentElement;
  const body = document.body;
  const card = document.querySelector("[class*='rounded-2xl']");
  const main = document.querySelector("main");
  const addBtn = [...document.querySelectorAll("button")].find(b => /Add Task|Add Class|Add Assignment/.test(b.textContent || ""));
  const cs = (el) => el ? { bg: getComputedStyle(el).backgroundColor, color: getComputedStyle(el).color, cls: (el.className || "").toString().slice(0, 80) } : null;
  return JSON.stringify({
    htmlClass: html.className,
    htmlBg: getComputedStyle(html).backgroundColor,
    bodyBg: getComputedStyle(body).backgroundColor,
    bodyColor: getComputedStyle(body).color,
    mainBg: main ? getComputedStyle(main).backgroundColor : null,
    card: cs(card),
    localStorage: (() => { try { const keys = Object.keys(localStorage); return keys.map(k => k + "=" + String(localStorage[k]).slice(0, 60)); } catch { return "blocked"; } })(),
    addBtn: cs(addBtn),
    cssVars: (() => {
      const s = getComputedStyle(html);
      const names = ["--background", "--foreground", "--primary", "--primary-foreground", "--card", "--card-foreground", "--secondary"];
      const out = {};
      for (const n of names) { const v = s.getPropertyValue(n); if (v) out[n] = v.trim().slice(0, 40); }
      return out;
    })(),
  });
})()`;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(`${REF}/login`);
await page.fill("input[type=email]", process.env.REF_PROBE_EMAIL);
await page.fill("input[type=password]", process.env.REF_PROBE_PASSWORD);
await page.waitForFunction(
  () => { const btn = document.querySelector("button[type=submit]"); return btn !== null && !btn.disabled; },
  null, { timeout: 15_000 },
);
await page.click("button[type=submit]");
await page.waitForFunction(
  () => document.querySelector("nav a") !== null && (document.querySelector("h1") !== null || document.querySelector("h2") !== null),
  null, { timeout: 30_000 },
);
await page.waitForTimeout(1500);

// The login page theme state first (pre-login surface).
const results = {};
for (const view of ["Dashboard", "Tasks", "Settings", "Timetable"]) {
  await page.goto(`${REF}/${view}`);
  await page.waitForTimeout(2400);
  results[view] = JSON.parse(await page.evaluate(THEME_PROBE));
  await page.screenshot({ path: `${OUT}/ref-theme-${view.toLowerCase()}.png`, fullPage: false });
  console.log(`[s186-theme2] ${view} captured`);
}

// Pixel ink check on the Add Task button (Tasks view).
await page.goto(`${REF}/Tasks`);
await page.waitForTimeout(2400);
const ink = await page.evaluate(`(() => {
  const btn = [...document.querySelectorAll("button")].find(b => (b.textContent || "").trim() === "Add Task");
  if (!btn) return JSON.stringify({ err: "no-btn" });
  const r = btn.getBoundingClientRect();
  const canvas = document.createElement("canvas");
  const ctx2 = canvas.getContext("2d");
  return JSON.stringify({ rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }, bg: getComputedStyle(btn).backgroundColor, color: getComputedStyle(btn).color });
})()`);
results.addTaskRect = JSON.parse(ink);
writeFileSync(`${OUT}/ref-theme-state.json`, JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
await ctx.close();
await browser.close();
