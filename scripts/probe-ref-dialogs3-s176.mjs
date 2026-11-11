// S176 diagnostic part 3 — the Settings Subjects/Holidays re-verify with
// REAL locator clicks (the synthetic evaluate-click does not activate the
// reference's tabs; the S175 probe used locator clicks). One-shot.
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

await page.evaluate(() => { const a = [...document.querySelectorAll("nav a")].find((x) => x.textContent.trim().startsWith("Settings")); if (a) a.click(); });
await page.waitForTimeout(2200);
await page.getByRole("tab", { name: "Subjects" }).click({ timeout: 8000 });
await page.waitForTimeout(2500);
console.log("## SUBJECTS TAB (locator click) buttons: " + JSON.stringify(await page.evaluate(() => [...document.querySelectorAll("main button")].filter((b) => b.getBoundingClientRect().width > 0).map((b) => (b.textContent.replace(/\s+/g, " ").trim().slice(0, 36) || b.getAttribute("aria-label") || "(icon)")).slice(0, 14))));
try {
  await page.getByRole("button", { name: /add subject/i }).first().click({ timeout: 6000 });
  await page.waitForTimeout(1400);
  console.log("## ADD SUBJECT DIALOG: " + JSON.stringify(await page.evaluate(CENSUS), null, 1));
  await page.keyboard.press("Escape");
  await page.waitForTimeout(700);
} catch (e) { console.log("## ADD SUBJECT: " + String(e).slice(0, 140)); }

await page.getByRole("tab", { name: "Holidays" }).click({ timeout: 8000 });
await page.waitForTimeout(2500);
console.log("## HOLIDAYS TAB (locator click) buttons: " + JSON.stringify(await page.evaluate(() => [...document.querySelectorAll("main button")].filter((b) => b.getBoundingClientRect().width > 0).map((b) => (b.textContent.replace(/\s+/g, " ").trim().slice(0, 36) || b.getAttribute("aria-label") || "(icon)")).slice(0, 14))));
try {
  await page.getByRole("button", { name: /add holiday/i }).first().click({ timeout: 6000 });
  await page.waitForTimeout(1400);
  console.log("## ADD HOLIDAY DIALOG: " + JSON.stringify(await page.evaluate(CENSUS), null, 1));
  await page.keyboard.press("Escape");
  await page.waitForTimeout(700);
} catch (e) { console.log("## ADD HOLIDAY: " + String(e).slice(0, 140)); }
await ctx.close();
await browser.close();
