import { chromium } from "playwright";
const REF = "https://omni-study1.base44.app";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
let lastStatus = null;
page.on("response", (r) => { if (r.url().includes("login") || r.url().includes("auth")) lastStatus = `${r.status()} ${r.url().slice(-40)}`; });
await page.goto(`${REF}/login`, { timeout: 60_000, waitUntil: "domcontentloaded" });
await page.waitForTimeout(3000);
await page.fill("input[type=email]", process.env.REF_PROBE_EMAIL);
await page.fill("input[type=password]", process.env.REF_PROBE_PASSWORD);
await page.waitForFunction(() => {
  const btn = document.querySelector("button[type=submit]");
  return btn !== null && !btn.disabled;
}, null, { timeout: 30_000 });
await page.click("button[type=submit]");
await page.waitForTimeout(6000);
const state = await page.evaluate(() => ({
  url: location.pathname,
  hasNav: !!document.querySelector("nav"),
  hasMain: !!document.querySelector("main"),
  alert: document.querySelector('[role="alert"]')?.textContent?.trim().slice(0, 150) ?? null,
  bodySnippet: (document.body.textContent || "").slice(0, 200),
}));
console.log("last auth response:", lastStatus);
console.log("state:", JSON.stringify(state, null, 1));
await ctx.close(); await browser.close();
