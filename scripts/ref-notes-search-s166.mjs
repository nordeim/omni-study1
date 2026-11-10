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
const inputs = await page.evaluate(() => [...document.querySelectorAll("input")].map(i => ({ a: i.getAttribute("aria-label"), p: i.getAttribute("placeholder"), t: i.type })));
console.log("INPUTS:", JSON.stringify(inputs));
const search = page.locator("input[type=search], input[placeholder*='earch'], input[aria-label*='earch']").first();
const vis = await search.isVisible().catch(() => false);
console.log("searchVisible:", vis);
if (vis) {
  const counts = {};
  for (const q of ["", "span", "div", "integration", "zzz-not-a-word"]) {
    await search.fill(q);
    await page.waitForTimeout(800);
    counts[q || "empty"] = await page.evaluate(() => document.querySelectorAll("h3").length);
  }
  console.log("ROW COUNTS (h3):", JSON.stringify(counts));
}
await browser.close();
