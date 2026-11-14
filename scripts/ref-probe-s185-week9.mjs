// S185 reference probe 9 — the expanded mobile day's ADD CLASS button:
// its anatomy (tag/classes/size — the variant family) + the click's
// prefill (the day? the hour?) — then Escape (zero residue).
// Usage: REF_PROBE_EMAIL=… REF_PROBE_PASSWORD=… node scripts/ref-probe-s185-week9.mjs
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const REF = "https://omni-study1.base44.app";
const OUT = "docs/probe-evidence/s185";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
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
  await page.goto(`${REF}/Timetable`, { timeout: 45_000 });
  await page.waitForFunction(
    () => document.querySelector("h1, h2") !== null && /Timetable/.test(document.body.textContent || ""),
    null, { timeout: 30_000 },
  );
  await page.waitForTimeout(2200);
  // expand Tuesday's row (a non-today day — the prefill should carry its day)
  await page.locator("p").filter({ hasText: /^Tuesday$/ }).first().click({ timeout: 8_000 });
  await page.waitForTimeout(1200);
  const btnInfo = await page.evaluate(`(() => {
    const block = [...document.querySelectorAll("div")].find((el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && cs.display !== "none" &&
        /No classes/.test(el.textContent || "") && /Add Class/.test(el.textContent || "") &&
        (el.className || "").toString().includes("bg-slate-50");
    });
    if (!block) return { present: false };
    const btn = [...block.querySelectorAll("button")].find((b) => /Add Class/.test(b.textContent || ""));
    if (!btn) return { present: true, btnPresent: false, blockCls: block.className.toString().slice(0, 90), blockText: block.textContent.trim().slice(0, 50) };
    const s = getComputedStyle(btn);
    const r = btn.getBoundingClientRect();
    return {
      present: true, btnPresent: true,
      blockCls: block.className.toString().slice(0, 90),
      blockText: (block.textContent || "").trim().slice(0, 50),
      btnTag: btn.tagName, btnText: (btn.textContent || "").trim().slice(0, 20),
      btnCls: (btn.className || "").toString().slice(0, 170),
      btnW: Math.round(r.width), btnH: Math.round(r.height),
      btnBg: s.backgroundImage.slice(0, 90) || s.backgroundColor,
      btnRadius: s.borderRadius, btnColor: s.color,
      btnJustify: s.justifyContent, btnDisplay: s.display,
      svgCount: btn.querySelectorAll("svg").length,
    };
  })()`);
  console.log("BUTTON:", JSON.stringify(btnInfo));
  // click it — the dialog + prefill
  const click = {};
  try {
    const btn = page.locator("button").filter({ hasText: "Add Class" }).first();
    await btn.click({ timeout: 8_000 });
    await page.waitForTimeout(1000);
    const dlg = page.locator('[role="dialog"]');
    click.dialogCount = await dlg.count();
    if (await dlg.count() > 0) {
      click.title = await dlg.locator("h2, h3").first().textContent();
      const inputs = dlg.locator("input, select");
      const n = await inputs.count();
      const vals = [];
      for (let i = 0; i < Math.min(n, 8); i++) {
        const el = inputs.nth(i);
        try { vals.push({ type: await el.getAttribute("type"), value: await el.inputValue() }); }
        catch { vals.push({ skip: true }); }
      }
      click.inputs = vals;
      await page.keyboard.press("Escape");
      await page.waitForTimeout(600);
      click.afterEscape = await page.locator('[role="dialog"]').count();
    }
  } catch (err) {
    click.error = String(err).slice(0, 200);
  }
  console.log("CLICK:", JSON.stringify(click));
  writeFileSync(`${OUT}/ref-week-expanded-button.json`, JSON.stringify({ btnInfo, click }, null, 2));
} catch (err) {
  console.error("PROBE-FAIL:", String(err).slice(0, 500));
  process.exitCode = 1;
} finally {
  await browser.close();
}
