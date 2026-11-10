// S170 one-shot probe — the reference task dialog's COMPLETE field census
// (inputs/selects/buttons with attributes), so the list-picker question is
// settled at the DOM level.
import { chromium } from "playwright";

const REF = "https://omni-study1.base44.app";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(`${REF}/login`);
await page.fill("input[type=email]", process.env.REF_PROBE_EMAIL);
await page.fill("input[type=password]", process.env.REF_PROBE_PASSWORD);
await page.click("button[type=submit]");
await page.waitForFunction(() => document.querySelector("main") !== null, null, { timeout: 30000 });
await page.waitForTimeout(2500);
await page.evaluate(`(() => {
  const link = [...document.querySelectorAll("a")].find((a) => a.textContent.trim().startsWith("Tasks"));
  if (link) link.click();
})()`);
await page.waitForTimeout(2500);
await page.getByRole("button", { name: /add task/i }).first().click();
await page.waitForTimeout(1200);
const census = await page.evaluate(`(() => {
  const d = document.querySelector('[role="dialog"]');
  if (!d) return null;
  const fields = [...d.querySelectorAll("input, select, textarea, button")].map((el) => ({
    tag: el.tagName.toLowerCase(),
    type: el.getAttribute("type"),
    id: el.id || null,
    ariaLabel: el.getAttribute("aria-label"),
    placeholder: el.getAttribute("placeholder"),
    text: el.tagName === "BUTTON" ? el.textContent.replace(/\\s+/g, " ").trim().slice(0, 30) : undefined,
    name: el.getAttribute("name"),
  }));
  const labelTexts = [...d.querySelectorAll("label")].map((l) => l.textContent.trim().slice(0, 30));
  return { fields, labelTexts };
})()`);
console.log(JSON.stringify(census, null, 1));
await ctx.close();
await browser.close();
