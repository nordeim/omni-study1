import { chromium } from "playwright";
const REF = "https://omni-study1.base44.app";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(`${REF}/login`, { timeout: 60_000, waitUntil: "domcontentloaded" });
await page.waitForTimeout(2500);
await page.fill("input[type=email]", process.env.REF_PROBE_EMAIL);
await page.fill("input[type=password]", process.env.REF_PROBE_PASSWORD);
await page.waitForFunction(() => {
  const btn = document.querySelector("button[type=submit]");
  return btn !== null && !btn.disabled;
}, null, { timeout: 30_000 });
await page.click("button[type=submit]");
await page.waitForFunction(() => document.querySelector("nav a") !== null, null, { timeout: 30_000 });
await page.waitForTimeout(1500);
await page.evaluate(() => {
  const a = [...document.querySelectorAll("nav a")].find((x) => x.textContent.trim().startsWith("Notes"));
  if (a) a.click();
});
await page.waitForTimeout(3000);
const dump = await page.evaluate(() => {
  const h1 = [...document.querySelectorAll("h1,h2")].find((x) => x.textContent.includes("Notes"));
  const header = h1 ? h1.parentElement : null;
  const btns = header ? [...header.querySelectorAll("button")].map((b) => ({
    cls: b.className, label: b.getAttribute("aria-label"), icon: b.querySelector("svg")?.getAttribute("class"),
  })) : [];
  return { h1: h1?.textContent?.trim(), headerCls: header?.className, btns };
});
console.log(JSON.stringify(dump, null, 1));
await ctx.close(); await browser.close();
