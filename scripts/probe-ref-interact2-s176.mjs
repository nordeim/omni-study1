// S176 final interactive probe — the event reminders real-Add chip display
// (Playwright fill, not synthetic setters) + the task due-date popover
// day-pick result. Computed DOM authority.
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

// ---- Event reminders: real fill + Add ----
await page.evaluate(() => { const a = [...document.querySelectorAll("nav a")].find((x) => x.textContent.trim().startsWith("Events")); if (a) a.click(); });
await page.waitForTimeout(2200);
await page.getByRole("button", { name: /new event/i }).first().click({ timeout: 6000 });
await page.waitForTimeout(1400);
const num = page.locator('[role="dialog"] input[type=number]');
await num.fill("20");
await page.getByRole("button", { name: "Add", exact: true }).first().click();
await page.waitForTimeout(900);
const r1 = await page.evaluate(`(() => {
  const d = document.querySelector('[role="dialog"]');
  // reminder chips: look for small pill/badge-like elements with a time text
  const pills = [...d.querySelectorAll("button, span, div")].filter((el) => {
    const t = el.textContent.trim();
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.width < 100 && /^\\d+\\s*(min|hour|day|minute)/i.test(t);
  }).map((el) => ({ tag: el.tagName, text: el.textContent.replace(/\\s+/g, " ").trim().slice(0, 30), cls: (el.getAttribute("class") || "").slice(0, 90) }));
  const num = d.querySelector("input[type=number]");
  return { pills: pills.slice(0, 8), numValue: num ? num.value : null };
})()`);
console.log("## REMINDER AFTER REAL ADD: " + JSON.stringify(r1, null, 1));
// add a second one in hours
await page.locator('[role="dialog"] select').last().selectOption("hours");
await num.fill("2");
await page.getByRole("button", { name: "Add", exact: true }).first().click();
await page.waitForTimeout(900);
const r2 = await page.evaluate(`(() => {
  const d = document.querySelector('[role="dialog"]');
  const pills = [...d.querySelectorAll("button, span, div")].filter((el) => {
    const t = el.textContent.trim();
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.width < 100 && /^\\d+\\s*(min|hour|day|minute)/i.test(t);
  }).map((el) => ({ tag: el.tagName, text: el.textContent.replace(/\\s+/g, " ").trim().slice(0, 30), cls: (el.getAttribute("class") || "").slice(0, 90) }));
  return pills.slice(0, 8);
})()`);
console.log("## REMINDER SECOND ADD: " + JSON.stringify(r2, null, 1));
await page.keyboard.press("Escape");
await page.waitForTimeout(700);

// ---- Task due date: popover day-pick ----
await page.evaluate(() => { const a = [...document.querySelectorAll("nav a")].find((x) => x.textContent.trim().startsWith("Tasks")); if (a) a.click(); });
await page.waitForTimeout(2200);
await page.getByRole("button", { name: /add task/i }).first().click({ timeout: 6000 });
await page.waitForTimeout(1400);
await page.getByRole("button", { name: /add due date/i }).first().click({ timeout: 5000 });
await page.waitForTimeout(1200);
// click a day cell (e.g., the 15th of the current month grid)
const gridButtons = page.locator('[role="dialog"] [role="grid"] button, [data-radix-popper-content-wrapper] [role="grid"] button, [role="gridcell"]');
const cnt = await gridButtons.count();
console.log("## GRID BUTTONS: " + cnt);
if (cnt > 0) {
  // pick the button labeled "15"
  try {
    await page.locator('[role="grid"] button', { hasText: /^15$/ }).first().click({ timeout: 4000 });
    await page.waitForTimeout(900);
    const after = await page.evaluate(`(() => {
      const d = document.querySelector('[role="dialog"]');
      const btns = [...d.querySelectorAll("button")].filter((b) => b.textContent.trim()).map((b) => b.textContent.trim());
      const dateEls = [...d.querySelectorAll("input[type=date], input[type=datetime-local]")].map((el) => el.value);
      const dueArea = [...d.querySelectorAll("div, button, span")].filter((el) => /due|Due|Remove|remove|Nov|Dec/i.test(el.textContent) && el.getBoundingClientRect().width > 0 && el.textContent.length < 40).map((el) => ({ tag: el.tagName, text: el.textContent.trim().slice(0, 40) })).slice(0, 8);
      const pop = document.querySelector("[data-radix-popper-content-wrapper]");
      return { btns, dateEls, dueArea, popoverStill: !!pop };
    })()`);
    console.log("## TASK DUE-DATE AFTER PICK: " + JSON.stringify(after, null, 1));
  } catch (e) { console.log("## TASK DUE-DATE PICK: " + String(e).slice(0, 120)); }
}
await page.keyboard.press("Escape");
await ctx.close();
await browser.close();
