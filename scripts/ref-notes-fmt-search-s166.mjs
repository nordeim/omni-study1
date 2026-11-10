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
await page.waitForTimeout(2500);
await page.getByRole("button", { name: "New Note" }).click();
await page.waitForTimeout(1200);
const ui = await page.evaluate(() => ({
  dlg: !!document.querySelector("[role=dialog]"),
  inputs: [...document.querySelectorAll("input")].filter(i => i.offsetParent !== null).map(i => ({ a: i.getAttribute("aria-label"), p: i.getAttribute("placeholder") })),
  visButtons: [...document.querySelectorAll("button")].filter(b => b.offsetParent !== null).map(b => (b.getAttribute("aria-label") || b.textContent || "").trim().slice(0, 24)).filter(Boolean),
}));
console.log("UI:", JSON.stringify(ui));
await browser.close();
