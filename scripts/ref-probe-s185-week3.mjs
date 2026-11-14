// S185 reference probe 3 — the week-strip inner elements + the grid parent
// chain + the visual frame. The exploratory pass's suspicious inherited
// rgb(250,250,250) label color (neutral-50 — near-white) needs settling:
// either the inner label elements carry their own colors (and the
// inheritance is a red herring), or the reference's own labels are
// low-contrast (its defect class). This probe:
//   A. the header strip's INNER elements (day-name + date fonts, the today
//      cell's inner fonts),
//   B. the time column's labels (fixed detector — probe 2's exclusion of
//      "8 PM" rejected the column itself; the reference carries 14 labels
//      7 AM..8 PM),
//   C. the grid's parent chain (the card container: bg/pad/radius/border/
//      shadow/overflow + the geometry at 1440),
//   D. a desktop PNG frame of the reference timetable (visual reference).
// Computed styles are ground truth (the repo doctrine).
// Usage: REF_PROBE_EMAIL=… REF_PROBE_PASSWORD=… node scripts/ref-probe-s185-week3.mjs
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const REF = "https://omni-study1.base44.app";
const OUT = "docs/probe-evidence/s185";
mkdirSync(OUT, { recursive: true });

const PROBE = `(() => {
  const main = document.querySelector("main") || document.body;
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.display !== "none" && cs.visibility !== "hidden";
  };
  const out = {};
  // ---- A. the header strip inner elements ----
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const strips = [...main.querySelectorAll("div")].filter((el) => {
    if (!vis(el)) return false;
    const kids = [...el.children].filter(vis);
    if (kids.length < 6 || kids.length > 9) return false;
    let dayNames = 0;
    for (const k of kids) {
      const t = (k.textContent || "").trim();
      if (days.some((d) => t.startsWith(d.slice(0, 3)))) dayNames++;
    }
    return dayNames >= 6;
  });
  const strip = strips[0];
  if (strip) {
    const cells = [...strip.children].filter(vis);
    out.stripInner = cells.map((c, i) => {
      const inner = [...c.children].filter(vis);
      return {
        i, cellText: (c.textContent || "").trim().slice(0, 20),
        innerCount: inner.length,
        inner: inner.map((k) => {
          const s = getComputedStyle(k);
          return {
            tag: k.tagName, cls: (k.className || "").toString().slice(0, 90),
            text: (k.textContent || "").trim().slice(0, 12),
            font: { size: s.fontSize, weight: s.fontWeight, color: s.color, lh: s.lineHeight },
            mb: s.marginBottom, display: s.display,
          };
        }),
      };
    });
  }
  // ---- B. the time column labels (fixed detector) ----
  const grid = [...main.querySelectorAll("div")].filter((el) => vis(el) && (el.className || "").toString().includes("grid-cols-8") && el.getBoundingClientRect().height > 500)[0];
  if (grid) {
    const timeCol = [...grid.children].find((c) => vis(c) && (c.textContent || "").trim().startsWith("7 AM"));
    if (timeCol) {
      out.timeLabels = [...timeCol.children].filter(vis).map((c) => {
        const s = getComputedStyle(c);
        return {
          text: (c.textContent || "").trim().slice(0, 8),
          cls: (c.className || "").toString().slice(0, 90),
          h: Math.round(c.getBoundingClientRect().height),
          font: { size: s.fontSize, weight: s.fontWeight, color: s.color },
          pad: { x: s.paddingLeft, y: s.paddingTop },
          align: s.textAlign, display: s.display,
          bg: s.backgroundColor,
          borderB: s.borderBottomWidth + " " + s.borderBottomColor,
        };
      });
      const tcs = getComputedStyle(timeCol);
      out.timeCol = { cls: timeCol.className.toString().slice(0, 90), bg: tcs.backgroundColor, color: tcs.color, borderR: tcs.borderRightWidth + " " + tcs.borderRightColor, w: Math.round(timeCol.getBoundingClientRect().width) };
      // the inherited color chain: walk up recording color until it changes
      const chain = [];
      let el = timeCol;
      for (let i = 0; i < 8 && el; i++) {
        const s = getComputedStyle(el);
        chain.push({ tag: el.tagName, cls: (el.className || "").toString().slice(0, 70), color: s.color, bg: s.backgroundColor });
        el = el.parentElement;
      }
      out.colorChain = chain;
    }
    // ---- C. the grid's parent chain ----
    const pchain = [];
    let p = grid.parentElement;
    for (let i = 0; i < 4 && p; i++) {
      const s = getComputedStyle(p);
      pchain.push({
        tag: p.tagName, cls: (p.className || "").toString().slice(0, 130),
        bg: s.backgroundColor, pad: { x: s.paddingLeft, y: s.paddingTop },
        radius: s.borderRadius, border: s.borderTopWidth + " " + s.borderTopColor,
        shadow: s.boxShadow.slice(0, 90), overflowX: s.overflowX, overflowHidden: s.overflow,
        w: Math.round(p.getBoundingClientRect().width), display: s.display,
      });
      p = p.parentElement;
    }
    out.gridParents = pchain;
  }
  return JSON.stringify(out);
})()`;

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
  const probe = JSON.parse(await page.evaluate(PROBE));
  writeFileSync(`${OUT}/ref-week-inner.json`, JSON.stringify(probe, null, 2));
  await page.screenshot({ path: `${OUT}/ref-timetable-desktop.png` });
  console.log(JSON.stringify({
    ok: true,
    stripCells: probe.stripInner ? probe.stripInner.length : 0,
    timeLabels: probe.timeLabels ? probe.timeLabels.length : 0,
    firstLabel: probe.timeLabels ? probe.timeLabels[0] : null,
    todayInner: probe.stripInner ? probe.stripInner[7] : null,
  }, null, 2));
} catch (err) {
  console.error("PROBE-FAIL:", String(err).slice(0, 500));
  process.exitCode = 1;
} finally {
  await browser.close();
}
