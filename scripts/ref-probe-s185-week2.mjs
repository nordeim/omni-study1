// S185 reference probe 2 — the focused week-strip pass (desktop 1440x900).
// Target 1: the DAY-HEADER STRIP (the row of day-name+date cells above the
//   week grid) — its container, each cell's classes, the TODAY cell's tint,
//   the name/date font stacks, borders.
// Target 2: the TIME COLUMN's full label list (all hour labels, the label
//   cell's computed styles + the column's own background — the exploratory
//   pass read a suspicious rgb(250,250,250) label color that needs its
//   context captured).
// Target 3: the BANNER fonts (the month-year heading + the range line).
// Target 4: the TODAY column tint on the grid's day columns (today = the
//   last column, Saturday Nov 14 2026).
// Target 5: the view header row (H1 + the toolbar's buttons/select).
// Computed styles are ground truth (the repo doctrine).
// Usage: REF_PROBE_EMAIL=… REF_PROBE_PASSWORD=… node scripts/ref-probe-s185-week2.mjs
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
  const csOf = (el, keys) => {
    const cs = getComputedStyle(el);
    const o = {};
    for (const k of keys) o[k] = cs[k];
    return o;
  };
  const out = {};
  // ---- Target 1: the day-header strip ----
  // Detector: a visible element whose direct children (>= 6) each contain a
  // full weekday name (Sunday..Saturday) AND a 1-2 digit date text.
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
  const strip = strips[0] || null;
  out.headerStrip = strip ? (() => {
    const cs = getComputedStyle(strip);
    const cells = [...strip.children].filter(vis).map((c) => {
      const ccs = getComputedStyle(c);
      const nameEl = [...c.children].find((k) => vis(k) && /^(p|div|span|h\\d)$/.test(k.tagName) && (k.textContent || "").trim().length < 12) || c;
      const dateEl = [...c.children].find((k) => vis(k) && k !== nameEl && /^(p|div|span|h\\d|strong)$/.test(k.tagName)) || null;
      const ncs = getComputedStyle(nameEl);
      const dcs = dateEl ? getComputedStyle(dateEl) : null;
      return {
        tag: c.tagName, cls: (c.className || "").toString().slice(0, 120),
        w: Math.round(c.getBoundingClientRect().width), h: Math.round(c.getBoundingClientRect().height),
        text: (c.textContent || "").trim().slice(0, 24),
        bg: ccs.backgroundColor, pad: { x: ccs.paddingLeft, y: ccs.paddingTop },
        radius: ccs.borderRadius, border: ccs.borderTopWidth + " " + ccs.borderTopColor + " / l:" + ccs.borderLeftWidth + " " + ccs.borderLeftColor,
        nameTag: nameEl.tagName, nameCls: (nameEl.className || "").toString().slice(0, 100),
        nameFont: { size: ncs.fontSize, weight: ncs.fontWeight, color: ncs.color, lh: ncs.lineHeight },
        nameMb: ncs.marginBottom,
        dateTag: dateEl ? dateEl.tagName : null,
        dateCls: dateEl ? (dateEl.className || "").toString().slice(0, 100) : null,
        dateFont: dcs ? { size: dcs.fontSize, weight: dcs.fontWeight, color: dcs.color, lh: dcs.lineHeight } : null,
        dateText: dateEl ? (dateEl.textContent || "").trim().slice(0, 8) : null,
      };
    });
    return {
      tag: strip.tagName, cls: (strip.className || "").toString().slice(0, 140),
      display: cs.display, cols: cs.gridTemplateColumns ? cs.gridTemplateColumns.slice(0, 130) : null,
      w: Math.round(strip.getBoundingClientRect().width), h: Math.round(strip.getBoundingClientRect().height),
      mb: cs.marginBottom, mt: cs.marginTop,
      bg: cs.backgroundColor, cells,
    };
  })() : null;
  // ---- Target 2: the time column's labels ----
  const timeCol = [...main.querySelectorAll("div")].find((el) => vis(el) && (el.textContent || "").trim().startsWith("7 AM") && /8 PM|10 PM|9 PM/.test(el.textContent || "") === false && (el.textContent || "").includes("7 AM") && (el.textContent || "").trim().length < 120 && el.children.length >= 12);
  out.timeColumn = timeCol ? (() => {
    const cs = getComputedStyle(timeCol);
    const labels = [...timeCol.children].filter(vis).map((c) => {
      const ccs = getComputedStyle(c);
      return {
        text: (c.textContent || "").trim().slice(0, 8),
        cls: (c.className || "").toString().slice(0, 90),
        h: Math.round(c.getBoundingClientRect().height),
        font: { size: ccs.fontSize, weight: ccs.fontWeight, color: ccs.color },
        pad: { x: ccs.paddingLeft, y: ccs.paddingTop }, align: ccs.textAlign,
        borderB: ccs.borderBottomWidth + " " + ccs.borderBottomColor,
        bg: ccs.backgroundColor,
      };
    });
    return {
      cls: timeCol.className.toString().slice(0, 100),
      w: Math.round(timeCol.getBoundingClientRect().width), h: Math.round(timeCol.getBoundingClientRect().height),
      bg: cs.backgroundColor, border: cs.borderRightWidth + " " + cs.borderRightColor,
      labelCount: labels.length, labels,
      parentCls: timeCol.parentElement ? timeCol.parentElement.className.toString().slice(0, 120) : null,
    };
  })() : null;
  // ---- Target 4: the TODAY tint on the grid's day columns ----
  const grid = [...main.querySelectorAll("div")].filter((el) => vis(el) && (el.className || "").toString().includes("grid-cols-8") && el.getBoundingClientRect().height > 500)[0] || null;
  out.gridColumns = grid ? [...grid.children].filter(vis).map((c, i) => {
    const cs = getComputedStyle(c);
    return { i, cls: (c.className || "").toString().slice(0, 120), bg: cs.backgroundColor, text: (c.textContent || "").trim().slice(0, 30) };
  }) : null;
  // ---- Target 3: the banner fonts ----
  const banner = [...main.querySelectorAll("div")].filter((el) => {
    if (!vis(el)) return false;
    const t = (el.textContent || "").trim();
    return /\\d{4}/.test(t) && t.length < 50 && el.querySelectorAll("svg").length === 2;
  }).sort((a, b) => a.getBoundingClientRect().width - b.getBoundingClientRect().width)[0] || null;
  out.banner = banner ? (() => {
    const center = [...banner.children].find((c) => vis(c) && !c.querySelector("svg"));
    const monthEl = center ? [...center.children].find((k) => /\\d{4}/.test(k.textContent || "")) : null;
    const rangeEl = center ? [...center.children].find((k) => k !== monthEl) : null;
    const mcs = monthEl ? getComputedStyle(monthEl) : null;
    const rcs = rangeEl ? getComputedStyle(rangeEl) : null;
    const btns = [...banner.children].filter((c) => c.tagName === "BUTTON");
    const bcs = btns.map((b) => {
      const s = getComputedStyle(b);
      return { cls: (b.className || "").toString().slice(0, 140), w: Math.round(b.getBoundingClientRect().width), h: Math.round(b.getBoundingClientRect().height), radius: s.borderRadius, bg: s.backgroundColor, hoverBg: s.backgroundColor, ariaLabel: b.getAttribute("aria-label") };
    });
    return {
      monthTag: monthEl ? monthEl.tagName : null,
      monthText: monthEl ? monthEl.textContent.trim() : null,
      monthFont: mcs ? { size: mcs.fontSize, weight: mcs.fontWeight, color: mcs.color, family: mcs.fontFamily.slice(0, 40) } : null,
      monthCls: monthEl ? (monthEl.className || "").toString().slice(0, 90) : null,
      rangeTag: rangeEl ? rangeEl.tagName : null,
      rangeText: rangeEl ? rangeEl.textContent.trim() : null,
      rangeFont: rcs ? { size: rcs.fontSize, weight: rcs.fontWeight, color: rcs.color } : null,
      rangeCls: rangeEl ? (rangeEl.className || "").toString().slice(0, 90) : null,
      btns: bcs,
    };
  })() : null;
  // ---- Target 5: the view header row (H1 + toolbar) ----
  const h1 = main.querySelector("h1, h2");
  const hdrRow = h1 ? h1.closest("div.flex") || h1.parentElement : null;
  out.viewHeader = hdrRow ? (() => {
    const cs = getComputedStyle(hdrRow);
    const controls = [...hdrRow.querySelectorAll("button, [role=combobox], select")].filter(vis).map((b) => {
      const s = getComputedStyle(b);
      return { tag: b.tagName, text: (b.textContent || "").trim().slice(0, 26), cls: (b.className || "").toString().slice(0, 120), w: Math.round(b.getBoundingClientRect().width), h: Math.round(b.getBoundingClientRect().height), radius: s.borderRadius, ariaLabel: b.getAttribute("aria-label") };
    });
    return {
      rowCls: (hdrRow.className || "").toString().slice(0, 130),
      h1Font: (() => { const s = getComputedStyle(h1); return { size: s.fontSize, weight: s.fontWeight, color: s.color }; })(),
      controls,
    };
  })() : null;
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
  writeFileSync(`${OUT}/ref-week-focused.json`, JSON.stringify(probe, null, 2));
  console.log(JSON.stringify({
    ok: true,
    headerStrip: !!probe.headerStrip,
    headerStripCells: probe.headerStrip ? probe.headerStrip.cells.length : 0,
    timeLabels: probe.timeColumn ? probe.timeColumn.labelCount : 0,
    gridCols: probe.gridColumns ? probe.gridColumns.length : 0,
    banner: !!probe.banner,
  }, null, 2));
} catch (err) {
  console.error("PROBE-FAIL:", String(err).slice(0, 500));
  process.exitCode = 1;
} finally {
  await browser.close();
}
