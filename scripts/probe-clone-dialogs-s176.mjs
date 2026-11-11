// S176 clone-side dialog census — the same CENSUS probe as the reference
// scripts, against the local dev tree (:3000), for the four families this
// cycle swept (tasks, events, studygroups) + the notes surface structure.
import { chromium } from "playwright";

const CLONE = "http://localhost:3000";
const CENSUS = `(() => {
  const d = document.querySelector('[role="dialog"]');
  if (!d) return { error: "no dialog" };
  const fields = [...d.querySelectorAll("input, select, textarea")].filter((el) => el.getBoundingClientRect().width > 0).map((el) => ({
    tag: el.tagName.toLowerCase(), type: el.getAttribute("type"),
    placeholder: el.getAttribute("placeholder"), ariaLabel: el.getAttribute("aria-label"),
  }));
  const labels = [...d.querySelectorAll("label")].filter((l) => l.getBoundingClientRect().width > 0).map((l) => l.textContent.replace(/\\s+/g, " ").trim().slice(0, 40));
  const buttons = [...d.querySelectorAll("button")].filter((b) => b.textContent.trim()).map((b) => b.textContent.replace(/\\s+/g, " ").trim().slice(0, 30));
  const swatches = [...d.querySelectorAll("button")].filter((b) => { const r = b.getBoundingClientRect(); return r.width > 0 && r.width <= 40 && r.height > 0 && r.width === r.height && !b.textContent.trim(); });
  const title = d.querySelector("h1, h2, h3") ? d.querySelector("h1, h2, h3").textContent.trim().slice(0, 40) : null;
  return { title, labels, fields, buttons, swatchCount: swatches.length, swatchW: swatches[0] ? Math.round(swatches[0].getBoundingClientRect().width) : null };
})()`;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(`${CLONE}/login`);
await page.fill("input[type=email]", "demo@studyflow.app");
await page.fill("input[type=password]", "Demo1234!");
await page.click("button[type=submit]");
await page.waitForFunction(() => document.querySelector("main") !== null && document.querySelector("nav") !== null, null, { timeout: 30000 });
await page.waitForTimeout(2000);

const out = {};
// Tasks
await page.evaluate(() => { const a = [...document.querySelectorAll("nav a")].find((x) => x.textContent.trim().startsWith("Tasks")); if (a) a.click(); });
await page.waitForTimeout(1800);
try {
  await page.getByRole("button", { name: /add task/i }).first().click({ timeout: 6000 });
  await page.waitForTimeout(1200);
  out.tasks = await page.evaluate(CENSUS);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(600);
} catch (e) { out.tasks = { error: String(e).slice(0, 120) }; }

// Events
await page.evaluate(() => { const a = [...document.querySelectorAll("nav a")].find((x) => x.textContent.trim().startsWith("Events")); if (a) a.click(); });
await page.waitForTimeout(1800);
try {
  await page.getByRole("button", { name: /add event|new event/i }).first().click({ timeout: 6000 });
  await page.waitForTimeout(1200);
  out.events = await page.evaluate(CENSUS);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(600);
} catch (e) { out.events = { error: String(e).slice(0, 120) }; }

// StudyGroups
await page.evaluate(() => { const a = [...document.querySelectorAll("nav a")].find((x) => x.textContent.trim().startsWith("Study Groups")); if (a) a.click(); });
await page.waitForTimeout(1800);
try {
  await page.getByRole("button", { name: /add group|create group|new group/i }).first().click({ timeout: 6000 });
  await page.waitForTimeout(1200);
  out.studygroups = await page.evaluate(CENSUS);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(600);
} catch (e) { out.studygroups = { error: String(e).slice(0, 120) }; }

// Notes surface
await page.evaluate(() => { const a = [...document.querySelectorAll("nav a")].find((x) => x.textContent.trim().startsWith("Notes")); if (a) a.click(); });
await page.waitForTimeout(1800);
out.notesSurface = await page.evaluate(() => {
  const btns = [...document.querySelectorAll("main button")].filter((b) => b.getBoundingClientRect().width > 0).map((b) => (b.textContent.replace(/\s+/g, " ").trim().slice(0, 36) || b.getAttribute("aria-label") || "(icon)")).slice(0, 10);
  const inputs = [...document.querySelectorAll("main input, main textarea, main [contenteditable='true']")].filter((el) => el.getBoundingClientRect().width > 0).map((el) => ({ tag: el.tagName.toLowerCase(), ph: el.getAttribute("placeholder"), ce: el.getAttribute("contenteditable") })).slice(0, 6);
  return { btns, inputs };
});
console.log(JSON.stringify(out, null, 1));
await ctx.close();
await browser.close();
