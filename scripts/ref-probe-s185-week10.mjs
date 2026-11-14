// S185 reference probe 10 — the desktop cell-click PREFILL disambiguation.
// Probe 4 clicked SATURDAY's 9 AM cell (day 6 + 09:00/10:00 — ambiguous:
// prefill OR today-default). Probe 9's expanded-button click (Tuesday) ALSO
// opened day=6 + 09:00/10:00 — suggesting DEFAULTS, not prefill. Decide:
// click TUESDAY's 11 AM cell. day=2 + 11:00/12:00 => prefill; day=6 +
// 09:00 => defaults (the reference's own gap — record, don't port).
// Usage: REF_PROBE_EMAIL=… REF_PROBE_PASSWORD=… node scripts/ref-probe-s185-week10.mjs
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const REF = "https://omni-study1.base44.app";
const OUT = "docs/probe-evidence/s185";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
try {
  await page.goto(`${REF}/login`, { timeout: 45_000 });
  await page.fill("input[type=email]", process.env.REF_PROBE_EMAIL);
  await page.fill("input[type=password]", process.env.REF_PROBE_PASSWORD);
  await page.waitForFunction(
    () => { const b = document.querySelector("button[type=submit]"); return b && !b.disabled; },
    null, { timeout: 15_000 },
  );
  await page.click("button[type=submit]");
  await page.waitForFunction(
    () => document.querySelector("nav a") !== null && document.querySelector("h1, h2") !== null,
    null, { timeout: 30_000 },
  );
  await page.waitForTimeout(1500);
  const link = page.locator("nav a").filter({ hasText: "Timetable" }).first();
  await link.click({ timeout: 15_000 });
  await page.waitForTimeout(2200);
  const out = {};
  try {
    // the header strip cells: [Time, Sun, Mon, Tue, ...] — Tuesday = index 3
    const grid = page.locator('div.grid-cols-8').filter({ has: page.locator('text=7 AM') }).first();
    const dayCols = grid.locator("div.cursor-pointer");
    const tueCol = dayCols.nth(2); // Sun=0, Mon=1, Tue=2
    const cells = tueCol.locator("> div");
    // the 11 AM cell = index 4 (7,8,9,10,11)
    const target = cells.nth(4);
    const tText = await target.textContent();
    out.cellText = tText ? tText.trim() : null;
    await target.click({ timeout: 8_000 });
    await page.waitForTimeout(1000);
    const dlg = page.locator('[role="dialog"]');
    out.dialogCount = await dlg.count();
    if (await dlg.count() > 0) {
      out.title = await dlg.locator("h2, h3").first().textContent();
      const inputs = dlg.locator("input, select");
      const n = await inputs.count();
      const vals = [];
      for (let i = 0; i < Math.min(n, 8); i++) {
        const el = inputs.nth(i);
        try { vals.push({ type: await el.getAttribute("type"), value: await el.inputValue() }); }
        catch { vals.push({ skip: true }); }
      }
      out.inputs = vals;
      await page.keyboard.press("Escape");
      await page.waitForTimeout(500);
      out.afterEscape = await page.locator('[role="dialog"]').count();
    }
  } catch (err) {
    out.error = String(err).slice(0, 300);
  }
  writeFileSync(`${OUT}/ref-week-click-prefill.json`, JSON.stringify(out, null, 2));
  console.log(JSON.stringify(out, null, 2));
} catch (err) {
  console.error("PROBE-FAIL:", String(err).slice(0, 500));
  process.exitCode = 1;
} finally {
  await browser.close();
}
