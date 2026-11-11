// S176 deep probe — the reference's event + task dialog DETAILS: the 6
// event swatch hexes + selection ring geometry, the reminders row shape,
// the task dialog's "Add due date" reveal behavior, and the select option
// vocabularies. Computed DOM authority.
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

// ---- EVENTS dialog details ----
await page.evaluate(() => { const a = [...document.querySelectorAll("nav a")].find((x) => x.textContent.trim().startsWith("Events")); if (a) a.click(); });
await page.waitForTimeout(2200);
await page.getByRole("button", { name: /new event/i }).first().click({ timeout: 6000 });
await page.waitForTimeout(1400);
const eventDetails = await page.evaluate(`(() => {
  const d = document.querySelector('[role="dialog"]');
  if (!d) return null;
  const swatchEls = [...d.querySelectorAll("button")].filter((b) => { const r = b.getBoundingClientRect(); return r.width > 20 && r.width <= 45 && r.height > 20 && r.height <= 45 && !b.textContent.trim(); });
  const swatches = swatchEls.map((b) => {
    const r = b.getBoundingClientRect();
    const cs = getComputedStyle(b);
    return { w: Math.round(r.width), bg: cs.backgroundColor, radius: cs.borderRadius, ring: (cs.boxShadow || "").slice(0, 60), cls: (b.getAttribute("class") || "").match(/size-\\[?\\d+\\]?|h-\\d+|w-\\d+|rounded-(full|lg|md)/g) };
  });
  // the reminders row: number input + Add button + unit select
  const num = d.querySelector("input[type=number]");
  const selects = [...d.querySelectorAll("select")].map((s) => [...s.options].map((o) => o.textContent.trim()));
  // the description textarea placeholder
  const ta = d.querySelector("textarea");
  // button row texts incl case
  const btns = [...d.querySelectorAll("button")].filter((b) => b.textContent.trim()).map((b) => b.textContent.trim());
  // any "all day" text?
  const allDay = d.textContent.toLowerCase().includes("all day");
  const title = d.querySelector("h1, h2, h3") ? d.querySelector("h1, h2, h3").textContent.trim() : null;
  const phs = [...d.querySelectorAll("input, textarea")].map((el) => el.getAttribute("placeholder")).filter(Boolean);
  return { title, swatchCount: swatches.length, swatches, numInput: num ? { min: num.min, max: num.max, step: num.step, w: Math.round(num.getBoundingClientRect().width) } : null, selects, taPh: ta ? ta.getAttribute("placeholder") : null, btns, allDay, phs };
})()`);
console.log("## EVENT DETAILS: " + JSON.stringify(eventDetails, null, 1));
await page.keyboard.press("Escape");
await page.waitForTimeout(700);

// ---- TASKS dialog details + Add due date reveal ----
await page.evaluate(() => { const a = [...document.querySelectorAll("nav a")].find((x) => x.textContent.trim().startsWith("Tasks")); if (a) a.click(); });
await page.waitForTimeout(2200);
await page.getByRole("button", { name: /add task/i }).first().click({ timeout: 6000 });
await page.waitForTimeout(1400);
const taskBefore = await page.evaluate(`(() => {
  const d = document.querySelector('[role="dialog"]');
  if (!d) return null;
  return {
    phs: [...d.querySelectorAll("input, textarea")].map((el) => el.getAttribute("placeholder")).filter(Boolean),
    selects: [...d.querySelectorAll("select")].map((s) => [...s.options].map((o) => o.textContent.trim())),
    dateInput: !!d.querySelector("input[type=date], input[type=datetime-local]"),
    btns: [...d.querySelectorAll("button")].filter((b) => b.textContent.trim()).map((b) => b.textContent.trim()),
    title: d.querySelector("h1, h2, h3") ? d.querySelector("h1, h2, h3").textContent.trim() : null,
  };
})()`);
console.log("## TASK BEFORE: " + JSON.stringify(taskBefore, null, 1));
// click "Add due date"
try {
  await page.getByRole("button", { name: /add due date/i }).first().click({ timeout: 4000 });
  await page.waitForTimeout(1000);
  const taskAfter = await page.evaluate(`(() => {
    const d = document.querySelector('[role="dialog"]');
    if (!d) return null;
    return {
      phs: [...d.querySelectorAll("input, textarea")].map((el) => el.getAttribute("placeholder")).filter(Boolean),
      dateType: (d.querySelector("input[type=date], input[type=datetime-local]") || {}).type || null,
      btns: [...d.querySelectorAll("button")].filter((b) => b.textContent.trim()).map((b) => b.textContent.trim()).slice(0, 12),
      clearBtn: [...d.querySelectorAll("button")].filter((b) => /remove|clear|delete/i.test(b.textContent)).map((b) => b.textContent.trim()).slice(0, 4),
    };
})()`);
  console.log("## TASK AFTER ADD-DUE-DATE: " + JSON.stringify(taskAfter, null, 1));
} catch (e) { console.log("## TASK ADD-DUE-DATE: " + String(e).slice(0, 100)); }
await page.keyboard.press("Escape");
await page.waitForTimeout(700);

// ---- STUDYGROUPS label + swatch detail ----
await page.evaluate(() => { const a = [...document.querySelectorAll("nav a")].find((x) => x.textContent.trim().startsWith("Study Groups")); if (a) a.click(); });
await page.waitForTimeout(2200);
await page.getByRole("button", { name: /new group|add group|create group/i }).first().click({ timeout: 6000 });
await page.waitForTimeout(1400);
const sgDetails = await page.evaluate(`(() => {
  const d = document.querySelector('[role="dialog"]');
  if (!d) return null;
  const labels = [...d.querySelectorAll("label")].map((l) => l.textContent.replace(/\\s+/g, " ").trim());
  const swatchEls = [...d.querySelectorAll("button")].filter((b) => { const r = b.getBoundingClientRect(); return r.width > 20 && r.width <= 45 && r.height > 20 && r.height <= 45 && !b.textContent.trim(); });
  const swatches = swatchEls.map((b) => { const cs = getComputedStyle(b); return { w: Math.round(b.getBoundingClientRect().width), bg: cs.backgroundColor, radius: cs.borderRadius }; });
  const nameInput = d.querySelector("input");
  return { labels, swatches, namePh: nameInput ? nameInput.getAttribute("placeholder") : null, btns: [...d.querySelectorAll("button")].filter((b) => b.textContent.trim()).map((b) => b.textContent.trim()) };
})()`);
console.log("## STUDYGROUP DETAILS: " + JSON.stringify(sgDetails, null, 1));
await page.keyboard.press("Escape");
await ctx.close();
await browser.close();
