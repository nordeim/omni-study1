// S188 scoping probe — the reference account's standing mode record (the
// dark-mode measurement constraint adjudication). Read-only: logs in,
// records html.dark + body bg + the settings-surface theme indicator,
// logs out. Zero content residue; the theme is LEFT AS FOUND (the S186+
// discipline — never toggled by a probe).
// Usage: REF_PROBE_EMAIL=... REF_PROBE_PASSWORD=... node scripts/ref-probe-s188-mode.mjs
import { chromium } from "playwright";

const REF = "https://omni-study1.base44.app";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(`${REF}/login`);
await page.fill("input[type=email]", process.env.REF_PROBE_EMAIL);
await page.fill("input[type=password]", process.env.REF_PROBE_PASSWORD);
await page.waitForFunction(() => { const b = document.querySelector("button[type=submit]"); return b && !b.disabled; }, null, { timeout: 15_000 });
await page.click("button[type=submit]");
await page.waitForFunction(() => document.querySelector("nav a") !== null, null, { timeout: 30_000 });
await page.waitForTimeout(1500);

const record = await page.evaluate(() => {
  const html = document.documentElement;
  const body = getComputedStyle(document.body);
  return {
    htmlClass: html.className,
    isDark: html.classList.contains("dark"),
    bodyBg: body.backgroundColor,
    bodyColor: body.color,
    colorScheme: html.style.colorScheme || getComputedStyle(html).colorScheme,
  };
});

console.log(JSON.stringify({ mode: record, at: new Date().toISOString() }, null, 2));
await browser.close();
