// S177 overflow bisect — which element pushes scrollWidth past 390 on /Notes mobile.
import { chromium } from "playwright";

const CLONE = "http://localhost:3100";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
await page.goto(`${CLONE}/login`);
await page.fill("input[type=email]", "demo@studyflow.app");
await page.fill("input[type=password]", "Demo1234!");
await page.click("button[type=submit]");
await page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true", null, { timeout: 20000 });
await page.goto(`${CLONE}/Notes`);
await page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true", null, { timeout: 20000 });
await page.waitForTimeout(1500);

const out = await page.evaluate(() => {
  const docW = document.documentElement.scrollWidth;
  // Find every element whose right edge exceeds the viewport width.
  const offenders = [];
  for (const el of document.querySelectorAll("main *")) {
    const r = el.getBoundingClientRect();
    if (r.right > 391 && r.width > 0) {
      offenders.push({
        tag: el.tagName,
        cls: (el.className || "").toString().slice(0, 70),
        right: Math.round(r.right),
        w: Math.round(r.width),
        text: (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 30),
      });
    }
  }
  // The deepest (smallest) offenders first — the cause, not the containers.
  offenders.sort((a, b) => a.w - b.w);
  return { scrollWidth: docW, offenders: offenders.slice(0, 10) };
});
console.log(JSON.stringify(out, null, 1));
await ctx.close();
await browser.close();
