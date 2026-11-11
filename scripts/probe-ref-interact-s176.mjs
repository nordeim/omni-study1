// S176 interactive probe — the reference's task "Add due date" reveal, the
// event reminders Add flow + chip display, and the selected-swatch state
// details. Computed DOM authority.
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

// ---- Task dialog: Add due date behavior ----
await page.evaluate(() => { const a = [...document.querySelectorAll("nav a")].find((x) => x.textContent.trim().startsWith("Tasks")); if (a) a.click(); });
await page.waitForTimeout(2200);
await page.getByRole("button", { name: /add task/i }).first().click({ timeout: 6000 });
await page.waitForTimeout(1400);
await page.getByRole("button", { name: /add due date/i }).first().click({ timeout: 5000 });
await page.waitForTimeout(1200);
const dueDateState = await page.evaluate(`(() => {
  // any popover appeared?
  const pop = document.querySelector('[role="dialog"] [data-radix-popper-content-wrapper], body > [data-radix-popper-content-wrapper], [data-state="open"][role="dialog"] ~ *');
  const d = document.querySelector('[role="dialog"]');
  // buttons with calendar / date icons in the dialog
  const dateEls = d ? [...d.querySelectorAll("input[type=date], input[type=datetime-local], [data-radix-popper-content-wrapper], [role='grid'], table")].map((el) => ({ tag: el.tagName, role: el.getAttribute("role"), grid: el.querySelector ? !!el.querySelector("table, [role='grid']") : false })) : [];
  const popovers = [...document.querySelectorAll("[data-radix-popper-content-wrapper], [data-radix-popup-content], [role='grid'], [class*='popover'], [class*='Popover'], [class*='calendar'], [class*='Calendar']")].filter((el) => el.getBoundingClientRect().width > 0).map((el) => ({ tag: el.tagName, role: el.getAttribute("role"), cls: (el.getAttribute("class") || "").slice(0, 80), text: el.textContent.replace(/\\s+/g, " ").trim().slice(0, 80) }));
  const btns = d ? [...d.querySelectorAll("button")].filter((b) => b.textContent.trim()).map((b) => b.textContent.trim()) : [];
  return { popovers, dateEls, btns };
})()`);
console.log("## ADD-DUE-DATE STATE: " + JSON.stringify(dueDateState, null, 1));
await page.keyboard.press("Escape");
await page.waitForTimeout(700);

// ---- Event dialog: reminders Add flow ----
await page.evaluate(() => { const a = [...document.querySelectorAll("nav a")].find((x) => x.textContent.trim().startsWith("Events")); if (a) a.click(); });
await page.waitForTimeout(2200);
await page.getByRole("button", { name: /new event/i }).first().click({ timeout: 6000 });
await page.waitForTimeout(1400);
// type 20 in the number input, click Add
await page.evaluate(`(() => {
  const d = document.querySelector('[role="dialog"]');
  const num = d && d.querySelector("input[type=number]");
  if (num) { const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set; setter.call(num, "20"); num.dispatchEvent(new Event("input", { bubbles: true })); }
})()`);
await page.getByRole("button", { name: "Add", exact: true }).first().click({ timeout: 5000 });
await page.waitForTimeout(1000);
const remindersState = await page.evaluate(`(() => {
  const d = document.querySelector('[role="dialog"]');
  if (!d) return null;
  // look for reminder chips/badges
  const chips = [...d.querySelectorAll("button, span, div")].filter((el) => { const t = el.textContent.trim(); return /^20|minutes|hours|days|remove|×|x$/i.test(t) && el.getBoundingClientRect().width > 0 && el.getBoundingClientRect().width < 120; }).map((el) => ({ tag: el.tagName, text: el.textContent.replace(/\\s+/g, " ").trim().slice(0, 30), cls: (el.getAttribute("class") || "").match(/rounded|badge|chip|pill|bg-\\S+/g) }));
  const num = d.querySelector("input[type=number]");
  return { chips: chips.slice(0, 10), numValue: num ? num.value : null };
})()`);
console.log("## REMINDERS ADD STATE: " + JSON.stringify(remindersState, null, 1));

// ---- Event swatch selection interaction (click the 3rd swatch) ----
const swatchClick = await page.evaluate(`(() => {
  const d = document.querySelector('[role="dialog"]');
  const swatches = [...d.querySelectorAll("button")].filter((b) => { const r = b.getBoundingClientRect(); return r.width > 20 && r.width <= 45 && !b.textContent.trim(); });
  if (swatches[2]) swatches[2].click();
  return swatches.length;
})()`);
await page.waitForTimeout(600);
const selState = await page.evaluate(`(() => {
  const d = document.querySelector('[role="dialog"]');
  const swatches = [...d.querySelectorAll("button")].filter((b) => { const r = b.getBoundingClientRect(); return r.width > 20 && r.width <= 45 && !b.textContent.trim(); });
  return swatches.map((b) => { const cs = getComputedStyle(b); return { w: Math.round(b.getBoundingClientRect().width), bg: cs.backgroundColor, ring: (cs.boxShadow || "").slice(0, 70), scale: cs.transform }; });
})()`);
console.log("## EVENT SWATCH SELECT STATE (clicked idx2, count=" + swatchClick + "): " + JSON.stringify(selState, null, 1));
await page.keyboard.press("Escape");
await ctx.close();
await browser.close();
