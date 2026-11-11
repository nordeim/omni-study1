import { chromium } from "playwright";
const REF = "https://omni-study1.base44.app";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(`${REF}/login`);
await page.fill("input[type=email]", process.env.REF_PROBE_EMAIL);
await page.fill("input[type=password]", process.env.REF_PROBE_PASSWORD);
await page.click("button[type=submit]");
await page.waitForFunction(() => document.querySelector("main") !== null && document.querySelector("nav") !== null, null, { timeout: 30000 });
await page.waitForTimeout(2500);
await page.evaluate(() => { const a = [...document.querySelectorAll("nav a")].find((x) => x.textContent.trim().startsWith("Tasks")); if (a) a.click(); });
await page.waitForTimeout(2200);
await page.getByRole("button", { name: /add task/i }).first().click({ timeout: 6000 });
await page.waitForTimeout(1400);
await page.getByRole("button", { name: /add due date/i }).first().click({ timeout: 5000 });
await page.waitForTimeout(1200);
const dayBtn = page.locator('[role="grid"] button', { hasText: /^15$/ }).first();
try {
  await dayBtn.click({ timeout: 4000 });
  await page.waitForTimeout(900);
  const after = await page.evaluate(`(() => {
    const d = document.querySelector('[role="dialog"]');
    const btns = [...d.querySelectorAll("button")].filter((b) => b.textContent.trim()).map((b) => b.textContent.trim());
    const dueArea = [...d.querySelectorAll("div, button, span, p")].filter((el) => /due|Due|remove|Remove|Nov|Dec|×|x/i.test(el.textContent) && el.getBoundingClientRect().width > 0 && el.textContent.length < 50).map((el) => ({ tag: el.tagName, text: el.textContent.trim().slice(0, 50), cls: (el.getAttribute("class") || "").slice(0, 70) })).slice(0, 10);
    const popover = document.querySelector("[data-radix-popper-content-wrapper]");
    return { btns, dueArea, popoverOpen: !!popover };
  })()`);
  console.log("## TASK DUE-DATE AFTER PICK: " + JSON.stringify(after, null, 1));
} catch (e) { console.log("## PICK FAIL: " + String(e).slice(0, 150)); }
await page.keyboard.press("Escape");
await ctx.close();
await browser.close();
