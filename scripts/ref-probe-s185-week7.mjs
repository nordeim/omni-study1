// S185 reference probe 7 — the REAL mobile row containers (390x844): the
// parents of the text-left name/count columns — the row's own anatomy
// (tag/classes/pad/border/cursor), the date tile ("Sun 8" block: tag,
// classes, size, bg, radius, inner element fonts, the TODAY tile state),
// the chevron, and the Saturday name's rendered ink (y 793-817).
// Usage: REF_PROBE_EMAIL=… REF_PROBE_PASSWORD=… node scripts/ref-probe-s185-week7.mjs
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const REF = "https://omni-study1.base44.app";
const OUT = "docs/probe-evidence/s185";
mkdirSync(OUT, { recursive: true });

const ROWS = `(() => {
  const main = document.querySelector("main") || document.body;
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.display !== "none" && cs.visibility !== "hidden";
  };
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const cards = [...main.querySelectorAll("div")].filter((el) => {
    if (!vis(el)) return false;
    const t = el.textContent || "";
    return days.every((d) => t.includes(d)) && (el.className || "").toString().includes("overflow-hidden");
  });
  const card = cards[0];
  if (!card) return JSON.stringify({ present: false });
  // the text-left columns (probe 5/6's rows)
  const cols = [...card.querySelectorAll("div")].filter((el) => {
    if (!vis(el)) return false;
    const t = (el.textContent || "").trim();
    return days.some((d) => t.startsWith(d)) && /classes/.test(t) && t.length < 40;
  });
  // the ROW = the parent of each column (up to the card)
  const rows = cols.map((col) => {
    const row = col.parentElement && col.parentElement !== card ? col.parentElement : col;
    const s = getComputedStyle(row);
    const r = row.getBoundingClientRect();
    // the tile: the row's first child that is NOT the text column (carries
    // the abbreviated day + date number)
    const kids = [...row.children].filter(vis);
    const tile = kids.find((k) => k !== col) || null;
    const tileOut = tile ? (() => {
      const ts = getComputedStyle(tile);
      const tr = tile.getBoundingClientRect();
      const inner = [...tile.children].filter(vis).map((k) => {
        const ks = getComputedStyle(k);
        return { tag: k.tagName, cls: (k.className || "").toString().slice(0, 80), text: (k.textContent || "").trim().slice(0, 6), font: { size: ks.fontSize, weight: ks.fontWeight, color: ks.color, lh: ks.lineHeight } };
      });
      return {
        tag: tile.tagName, cls: (tile.className || "").toString().slice(0, 130),
        text: (tile.textContent || "").trim().slice(0, 10),
        w: Math.round(tr.width), h: Math.round(tr.height),
        bg: ts.backgroundColor, radius: ts.borderRadius, display: ts.display,
        pad: { x: ts.paddingLeft, y: ts.paddingTop }, gap: ts.gap,
        inner,
      };
    })() : null;
    // the chevron svgs in the row
    const chev = [...row.querySelectorAll("svg")].filter(vis).map((sv) => {
      const ss = getComputedStyle(sv);
      return { cls: (sv.getAttribute("class") || "").slice(0, 70), w: Math.round(sv.getBoundingClientRect().width), h: Math.round(sv.getBoundingClientRect().height), color: ss.color };
    });
    return {
      text: (row.textContent || "").trim().slice(0, 20),
      tag: row.tagName, cls: (row.className || "").toString().slice(0, 130),
      y: Math.round(r.y), h: Math.round(r.height), w: Math.round(r.width),
      pad: { x: s.paddingLeft, y: s.paddingTop },
      border: s.borderBottomWidth + " " + s.borderBottomColor + " / t:" + s.borderTopWidth + " " + s.borderTopColor,
      cursor: s.cursor, role: row.getAttribute("role"), expanded: row.getAttribute("aria-expanded"),
      display: s.display, gap: s.gap, align: s.alignItems,
      tile: tileOut, chev,
    };
  });
  // the Saturday name's own rect (the ink check)
  const satName = [...card.querySelectorAll("p")].find((p) => vis(p) && (p.textContent || "").trim() === "Saturday");
  const satRect = satName ? satName.getBoundingClientRect() : null;
  return JSON.stringify({
    present: true, rowCount: rows.length, rows,
    satNameY: satRect ? Math.round(satRect.y) : null,
    satNameH: satRect ? Math.round(satRect.height) : null,
    satNameCls: satName ? satName.className.toString().slice(0, 60) : null,
  });
})()`;

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
  const rows = JSON.parse(await page.evaluate(ROWS));
  writeFileSync(`${OUT}/ref-week-mobile-rows2.json`, JSON.stringify(rows, null, 2));
  console.log(JSON.stringify({ present: rows.present, rowCount: rows.rowCount, satNameY: rows.satNameY, satNameH: rows.satNameH, satNameCls: rows.satNameCls }));
} catch (err) {
  console.error("PROBE-FAIL:", String(err).slice(0, 500));
  process.exitCode = 1;
} finally {
  await browser.close();
}
