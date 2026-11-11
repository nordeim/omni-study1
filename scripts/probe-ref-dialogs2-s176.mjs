// S176 diagnostic part 2 — the Settings Subjects/Holidays tab button dumps
// + the New Event / New Note dialog censuses. One-shot, read-only.
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

const CENSUS = `(() => {
  const d = document.querySelector('[role="dialog"]');
  if (!d) return { error: "no dialog" };
  const fields = [...d.querySelectorAll("input, select, textarea")].filter((el) => el.getBoundingClientRect().width > 0).map((el) => ({
    tag: el.tagName.toLowerCase(), type: el.getAttribute("type"),
    placeholder: el.getAttribute("placeholder"), ariaLabel: el.getAttribute("aria-label"),
  }));
  const labels = [...d.querySelectorAll("label")].filter((l) => l.getBoundingClientRect().width > 0).map((l) => l.textContent.replace(/\\s+/g, " ").trim().slice(0, 40));
  const buttons = [...d.querySelectorAll("button")].filter((b) => b.textContent.trim()).map((b) => b.textContent.replace(/\\s+/g, " ").trim().slice(0, 30));
  const swatches = [...d.querySelectorAll("button")].filter((b) => { const r = b.getBoundingClientRect(); return r.width > 0 && r.width <= 40 && r.height > 0 && r.width === r.height && !b.textContent.trim() && !b.getAttribute("aria-label"); });
  const title = d.querySelector("h1, h2, h3") ? d.querySelector("h1, h2, h3").textContent.trim().slice(0, 40) : null;
  return { title, labels, fields, buttons, swatchCount: swatches.length, swatchW: swatches[0] ? Math.round(swatches[0].getBoundingClientRect().width) : null };
})()`;

// 1) Settings → Subjects tab button dump.
await page.evaluate(() => { const a = [...document.querySelectorAll("nav a")].find((x) => x.textContent.trim().startsWith("Settings")); if (a) a.click(); });
await page.waitForTimeout(2000);
await page.evaluate(() => { const t = [...document.querySelectorAll("[role='tab']")].find((b) => b.textContent.trim() === "Subjects"); if (t) t.click(); });
await page.waitForTimeout(1600);
const subjBtns = await page.evaluate(() => [...document.querySelectorAll("main button")].filter((b) => b.getBoundingClientRect().width > 0).map((b) => (b.textContent.replace(/\s+/g, " ").trim().slice(0, 36) || b.getAttribute("aria-label") || b.getAttribute("title") || "(icon)")).slice(0, 24));
console.log("## SUBJECTS TAB BUTTONS: " + JSON.stringify(subjBtns));
// open the Add Subject dialog if present.
const addSubj = page.getByRole("button", { name: /subject/i }).filter({ hasText: /add|new/i }).first();
try {
  await addSubj.click({ timeout: 4000 });
  await page.waitForTimeout(1200);
  console.log("## ADD SUBJECT DIALOG: " + JSON.stringify(await page.evaluate(CENSUS), null, 1));
  await page.keyboard.press("Escape");
  await page.waitForTimeout(600);
} catch (e) { console.log("## ADD SUBJECT DIALOG: not clickable — " + String(e).slice(0, 100)); }

// 2) Settings → Holidays tab.
await page.evaluate(() => { const t = [...document.querySelectorAll("[role='tab']")].find((b) => b.textContent.trim() === "Holidays"); if (t) t.click(); });
await page.waitForTimeout(1600);
const holBtns = await page.evaluate(() => [...document.querySelectorAll("main button")].filter((b) => b.getBoundingClientRect().width > 0).map((b) => (b.textContent.replace(/\s+/g, " ").trim().slice(0, 36) || b.getAttribute("aria-label") || b.getAttribute("title") || "(icon)")).slice(0, 24));
console.log("## HOLIDAYS TAB BUTTONS: " + JSON.stringify(holBtns));
try {
  await page.getByRole("button", { name: /add holiday|new holiday/i }).first().click({ timeout: 4000 });
  await page.waitForTimeout(1200);
  console.log("## ADD HOLIDAY DIALOG: " + JSON.stringify(await page.evaluate(CENSUS), null, 1));
  await page.keyboard.press("Escape");
  await page.waitForTimeout(600);
} catch (e) { console.log("## ADD HOLIDAY DIALOG: not clickable — " + String(e).slice(0, 100)); }

// 3) Events → New Event dialog.
await page.evaluate(() => { const a = [...document.querySelectorAll("nav a")].find((x) => x.textContent.trim().startsWith("Events")); if (a) a.click(); });
await page.waitForTimeout(2200);
await page.getByRole("button", { name: /new event/i }).first().click({ timeout: 6000 });
await page.waitForTimeout(1400);
console.log("## NEW EVENT DIALOG: " + JSON.stringify(await page.evaluate(CENSUS), null, 1));
await page.keyboard.press("Escape");
await page.waitForTimeout(600);

// 4) Notes → New Note (what appears?).
await page.evaluate(() => { const a = [...document.querySelectorAll("nav a")].find((x) => x.textContent.trim().startsWith("Notes")); if (a) a.click(); });
await page.waitForTimeout(2200);
await page.getByRole("button", { name: /new note/i }).first().click({ timeout: 6000 });
await page.waitForTimeout(1600);
const noteState = await page.evaluate(() => {
  const d = document.querySelector('[role="dialog"]');
  const h = document.querySelector("main h1, main h2, main h3");
  const inputs = [...document.querySelectorAll("main input, main textarea, main [contenteditable='true']")].filter((el) => el.getBoundingClientRect().width > 0).map((el) => ({ tag: el.tagName.toLowerCase(), ph: el.getAttribute("placeholder"), ce: el.getAttribute("contenteditable") }));
  return { dialog: !!d, heading: h ? h.textContent.trim().slice(0, 40) : null, mainInputs: inputs.slice(0, 8) };
});
console.log("## NEW NOTE STATE: " + JSON.stringify(noteState, null, 1));
await ctx.close();
await browser.close();
