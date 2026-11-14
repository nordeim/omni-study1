// S185 reference probe — the Timetable WEEK-STRIP ROWS, the exploratory pass.
// The S184 close's first named S185 candidate: "the Timetable week-strip
// rows (the visibility-scoped pass, the mobile anatomy already recorded)".
// The reference account sits at TRUE ZERO residue (the S184 close
// re-censused 14 views), so its /Timetable renders the full empty grid —
// exactly the week-strip skeleton this axis measures.
// This pass maps the structure (desktop 1440x900): the view header row, the
// week banner strip, the grid container, its header strip (the day cells)
// and its ROW structure — every row recorded with its VISIBILITY state
// (the visibility-scoping: hidden rows are listed, visible rows are
// measured). Computed styles are ground truth (the repo doctrine).
// Usage (node >= 23.6 — bun INCOMPATIBLE):
//   REF_PROBE_EMAIL=… REF_PROBE_PASSWORD=… node scripts/ref-probe-s185-week1.mjs
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
  // ---- 1. the view's top-level children (3 hops deep, visible only) ----
  const shallow = [];
  const walk = (el, depth, path) => {
    if (depth > 3 || shallow.length > 90) return;
    for (const c of el.children) {
      if (!vis(c)) continue;
      const r = c.getBoundingClientRect();
      shallow.push({
        path, tag: c.tagName, cls: (c.className || "").toString().slice(0, 110),
        w: Math.round(r.width), h: Math.round(r.height),
        text: (c.textContent || "").trim().slice(0, 46),
      });
      walk(c, depth + 1, path + "/" + c.tagName + "[" + ((c.textContent || "").trim().slice(0, 12)) + "]");
    }
  };
  walk(main, 0, "");
  // ---- 2. the week banner strip: the row carrying < > chevrons ----
  const banners = [...main.querySelectorAll("div, section, header")].filter((el) => {
    if (!vis(el)) return false;
    const t = (el.textContent || "").trim();
    const svgs = el.querySelectorAll("svg");
    return svgs.length === 2 && /\\d{4}/.test(t) && t.length < 60;
  });
  const banner = banners.sort((a, b) => a.getBoundingClientRect().width - b.getBoundingClientRect().width)[0] || null;
  const bannerOut = banner ? (() => {
    const cs = getComputedStyle(banner);
    const kids = [...banner.children].map((k) => {
      const kcs = getComputedStyle(k);
      return { tag: k.tagName, cls: (k.className || "").toString().slice(0, 90), text: (k.textContent || "").trim().slice(0, 30), display: kcs.display, w: Math.round(k.getBoundingClientRect().width) };
    });
    return { cls: banner.className.toString().slice(0, 150), tag: banner.tagName, display: cs.display, bg: cs.backgroundColor, radius: cs.borderRadius, pad: { x: cs.paddingLeft, y: cs.paddingTop }, border: cs.borderTopWidth + " " + cs.borderTopColor, shadow: cs.boxShadow.slice(0, 70), justify: cs.justifyContent, kids };
  })() : null;
  // ---- 3. the grid: the widest container with many same-height rows ----
  // Detector: a visible element whose visible child count >= 6, children
  // mostly same height, and total height >= 300px (the hour-row stack).
  const allDivs = [...main.querySelectorAll("div")].filter(vis);
  let grid = null;
  for (const el of allDivs) {
    const kids = [...el.children].filter(vis);
    if (kids.length < 6) continue;
    const hs = kids.map((k) => Math.round(k.getBoundingClientRect().height));
    const sameH = hs.filter((h) => Math.abs(h - hs[0]) <= 4).length;
    const r = el.getBoundingClientRect();
    if (sameH >= 6 && r.height >= 300 && r.width >= 400) {
      if (!grid || r.width > grid.getBoundingClientRect().width) grid = el;
    }
  }
  const gridOut = grid ? (() => {
    const cs = getComputedStyle(grid);
    const kids = [...grid.children].map((k) => {
      const kcs = getComputedStyle(k);
      const kr = k.getBoundingClientRect();
      return { tag: k.tagName, cls: (k.className || "").toString().slice(0, 110), w: Math.round(kr.width), h: Math.round(kr.height), display: kcs.display, cols: kcs.gridTemplateColumns ? kcs.gridTemplateColumns.split(" ").length : null, text: (k.textContent || "").trim().slice(0, 40) };
    });
    return { tag: grid.tagName, cls: grid.className.toString().slice(0, 150), display: cs.display, cols: cs.display.includes("grid") ? cs.gridTemplateColumns.slice(0, 140) : null, bg: cs.backgroundColor, pad: { x: cs.paddingLeft, y: cs.paddingTop }, border: cs.borderTopWidth + " " + cs.borderTopColor, radius: cs.borderRadius, overflowX: cs.overflowX, minWidth: cs.minWidth, w: Math.round(grid.getBoundingClientRect().width), h: Math.round(grid.getBoundingClientRect().height), kids };
  })() : null;
  // ---- 4. the HOUR-ROW STACK: within the grid, the repeating rows ----
  // The rows = the grid's children if they repeat; else walk deeper. Record
  // EVERY row with its visibility state (the visibility-scoping) and the
  // first two visible rows in computed-style detail.
  const rowsOut = [];
  if (grid) {
    let rowList = [...grid.children].filter((el) => getComputedStyle(el).display.includes("grid") || el.children.length > 3);
    if (rowList.length < 5) {
      for (const c of grid.children) {
        if ([...c.children].filter((g) => getComputedStyle(g).display.includes("grid")).length >= 5) { rowList = [...c.children]; break; }
      }
    }
    let i = 0;
    for (const row of rowList) {
      if (i > 24) break;
      const rcs = getComputedStyle(row);
      const rr = row.getBoundingClientRect();
      rowsOut.push({
        i, tag: row.tagName, cls: (row.className || "").toString().slice(0, 100),
        w: Math.round(rr.width), h: Math.round(rr.height), display: rcs.display,
        cols: rcs.display.includes("grid") ? rcs.gridTemplateColumns.slice(0, 120) : null,
        visible: vis(row), text: (row.textContent || "").trim().slice(0, 44),
        cells: [...row.children].slice(0, 9).map((c) => ({
          tag: c.tagName, cls: (c.className || "").toString().slice(0, 70), text: (c.textContent || "").trim().slice(0, 18), w: Math.round(c.getBoundingClientRect().width), visible: vis(c),
        })),
      });
      i++;
    }
    // the first two visible rows in computed detail
    const det = [];
    for (const row of rowList.filter(vis).slice(0, 3)) {
      const rcs = getComputedStyle(row);
      const first = [...row.children].find(vis);
      const fcs = first ? getComputedStyle(first) : null;
      det.push({
        rowCls: (row.className || "").toString().slice(0, 120), rowH: rcs.height,
        rowBorderB: rcs.borderBottomWidth + " " + rcs.borderBottomColor,
        rowCols: rcs.gridTemplateColumns ? rcs.gridTemplateColumns.slice(0, 130) : null,
        firstCellTag: first ? first.tagName : null,
        firstCellCls: first ? (first.className || "").toString().slice(0, 100) : null,
        firstCellText: first ? (first.textContent || "").trim().slice(0, 22) : null,
        firstCellFont: fcs ? { size: fcs.fontSize, weight: fcs.fontWeight, color: fcs.color, align: fcs.textAlign } : null,
        firstCellPad: fcs ? { x: fcs.paddingLeft, y: fcs.paddingTop } : null,
        firstCellH: first ? Math.round(first.getBoundingClientRect().height) : null,
        firstCellW: first ? Math.round(first.getBoundingClientRect().width) : null,
      });
    }
    rowsOut.push({ detail: det });
  }
  // ---- 5. the view header (the page's own H1 + toolbar) ----
  const h = main.querySelector("h1, h2");
  const headerOut = h ? { tag: h.tagName, text: h.textContent.trim().slice(0, 40), cls: (h.className || "").toString().slice(0, 120) } : null;
  return JSON.stringify({ headerOut, bannerOut, gridOut, rowsOut, shallowCount: shallow.length });
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
  writeFileSync(`${OUT}/ref-week-structure.json`, JSON.stringify(probe, null, 2));
  console.log(JSON.stringify({ ok: true, banner: !!probe.bannerOut, grid: !!probe.gridOut, rows: probe.rowsOut.length - 1, header: probe.headerOut }, null, 2));
} catch (err) {
  console.error("PROBE-FAIL:", String(err).slice(0, 500));
  process.exitCode = 1;
} finally {
  await browser.close();
}
