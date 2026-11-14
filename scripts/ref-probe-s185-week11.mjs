// S185 reference probe 11 — the expanded block's Add Class button VARIANT
// (the full class list + computed backgroundColor/backgroundImage), so the
// port lands the exact button family. Also the block's own geometry.
// Usage: REF_PROBE_EMAIL=… REF_PROBE_PASSWORD=… node scripts/ref-probe-s185-week11.mjs
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
  await page.locator("p").filter({ hasText: /^Monday$/ }).first().click({ timeout: 8_000 });
  await page.waitForTimeout(1200);
  const info = await page.evaluate(`(() => {
    const block = [...document.querySelectorAll("div")].find((el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && cs.display !== "none" &&
        /No classes/.test(el.textContent || "") && /Add Class/.test(el.textContent || "") &&
        (el.className || "").toString().includes("bg-slate-50");
    });
    if (!block) return { present: false };
    const btn = [...block.querySelectorAll("button")].find((b) => /Add Class/.test(b.textContent || ""));
    const s = btn ? getComputedStyle(btn) : null;
    const r = btn ? btn.getBoundingClientRect() : null;
    const svg = btn ? btn.querySelector("svg") : null;
    const scs = svg ? getComputedStyle(svg) : null;
    return {
      present: true,
      blockCls: block.className.toString(),
      blockW: Math.round(block.getBoundingClientRect().width),
      blockH: Math.round(block.getBoundingClientRect().height),
      btnCls: btn ? btn.className.toString() : null,
      btnW: r ? Math.round(r.width) : null, btnH: r ? Math.round(r.height) : null,
      btnBgColor: s ? s.backgroundColor : null,
      btnBgImage: s ? s.backgroundImage.slice(0, 130) : null,
      btnColor: s ? s.color : null,
      btnShadow: s ? s.boxShadow.slice(0, 90) : null,
      svgW: scs ? scs.width : null, svgH: scs ? scs.height : null,
      btnText: btn ? btn.textContent.trim() : null,
    };
  })()`);
  writeFileSync(`${OUT}/ref-week-expanded-btn2.json`, JSON.stringify(info, null, 2));
  console.log(JSON.stringify(info, null, 2));
} catch (err) {
  console.error("PROBE-FAIL:", String(err).slice(0, 500));
  process.exitCode = 1;
} finally {
  await browser.close();
}
