// Quick probe: what does the Settings → Subjects tab render right now?
import { chromium } from "playwright";

const CLONE = "http://localhost:3000";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(`${CLONE}/login`);
await page.fill("input[type=email]", "demo@studyflow.app");
await page.fill("input[type=password]", "Demo1234!");
await page.click("button[type=submit]");
await page.waitForFunction(() => document.querySelector("main") !== null, null, { timeout: 30_000 });
await page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true", null, { timeout: 30_000 });
await page.goto(`${CLONE}/Settings`);
await page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true", null, { timeout: 30_000 });
const tabs = await page.getByRole("tab").allTextContents();
console.log("TABS:", JSON.stringify(tabs));
await page.getByRole("tab", { name: "Subjects" }).click();
await page.getByRole("heading", { name: "Subjects" }).waitFor({ timeout: 15_000 });
await page.waitForTimeout(3000);
const body = await page.evaluate(() => document.body.innerText.slice(600, 2400));
console.log("BODY TEXT:\n" + body);
await browser.close();
