import { chromium } from "playwright";
const REF = "https://omni-study1.base44.app";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(`${REF}/login`);
await page.fill("input[type=email]", process.env.REF_PROBE_EMAIL);
await page.fill("input[type=password]", process.env.REF_PROBE_PASSWORD);
await page.waitForFunction(() => { const b = document.querySelector("button[type=submit]"); return b && !b.disabled; }, null, { timeout: 15000 });
await page.click("button[type=submit]");
await page.waitForFunction(() => document.querySelector("nav a") && (document.querySelector("h1") || document.querySelector("h2")), null, { timeout: 30000 });
await page.waitForTimeout(1500);
await page.goto(`${REF}/Notes`);
await page.waitForTimeout(3000);
const dump = await page.evaluate(() => {
  const notes = [...document.querySelectorAll("h3")].map(h => h.textContent.trim().slice(0, 40));
  // find candidate row containers
  const asides = [...document.querySelectorAll("aside, [class*='w-80'], [class*='overflow-y-auto']")].slice(0, 6).map(el => ({
    cls: (el.className || "").toString().slice(0, 80),
    tag: el.tagName,
    buttons: el.querySelectorAll("button").length,
  }));
  return { notes, asides };
});
console.log(JSON.stringify(dump, null, 2));
await browser.close();
