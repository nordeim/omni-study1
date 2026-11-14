// S185 reference probe 6 — the mobile day-row CONTAINER anatomy (390x844):
// each row's bounding rect (y positions), the date tile ("Sun 8") inner
// structure with fonts/colors, the chevron, and the today row's tile
// state. This settles the row geometry the pixel profile couldn't.
// Usage: REF_PROBE_EMAIL=… REF_PROBE_PASSWORD=… node scripts/ref-probe-s185-week6.mjs
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
  const cardRect = card.getBoundingClientRect();
  // the row containers: the card's direct children (or grandchildren) that
  // each own exactly one weekday name
  const rows = [...card.querySelectorAll("div, button")].filter((el) => {
    if (!vis(el) || el === card) return false;
    const t = (el.textContent || "").trim();
    return days.some((d) => t.startsWith(d)) && /classes/.test(t) && t.length < 45 && ![...el.querySelectorAll("div,button")].some((g) => (g.textContent || "").trim().startsWith(days.find((d) => t.startsWith(d.slice(0, 3))) || "") && /classes/.test(g.textContent || ""));
  });
  const out = rows.map((row) => {
    const r = row.getBoundingClientRect();
    const s = getComputedStyle(row);
    const tile = [...row.children].find((k) => vis(k) && !/classes/.test(k.textContent || "") && (k.textContent || "").trim().length < 10) || [...row.children][0];
    const tileOut = tile ? (() => {
      const ts = getComputedStyle(tile);
      const inner = [...tile.querySelectorAll("div, span, p, svg")].slice(0, 6).map((k) => {
        const ks = getComputedStyle(k);
        return { tag: k.tagName, cls: (k.className || "").toString().slice(0, 70), text: (k.textContent || "").trim().slice(0, 8), font: { size: ks.fontSize, weight: ks.fontWeight, color: ks.color } };
      });
      return { tag: tile.tagName, cls: (tile.className || "").toString().slice(0, 110), text: (tile.textContent || "").trim().slice(0, 8), w: Math.round(tile.getBoundingClientRect().width), h: Math.round(tile.getBoundingClientRect().height), bg: ts.backgroundColor, radius: ts.borderRadius, display: ts.display, inner };
    })() : null;
    const chev = [...row.querySelectorAll("svg")].map((sv) => ({ cls: (sv.getAttribute("class") || "").slice(0, 60), w: Math.round(sv.getBoundingClientRect().width), h: Math.round(sv.getBoundingClientRect().height) }));
    const kids = [...row.children].filter(vis).map((k) => {
      const ks = getComputedStyle(k);
      return { tag: k.tagName, cls: (k.className || "").toString().slice(0, 70), text: (k.textContent || "").trim().slice(0, 16), w: Math.round(k.getBoundingClientRect().width), h: Math.round(k.getBoundingClientRect().height), display: ks.display };
    });
    return {
      text: (row.textContent || "").trim().slice(0, 22), tag: row.tagName,
      y: Math.round(r.y), h: Math.round(r.height), w: Math.round(r.width),
      cls: (row.className || "").toString().slice(0, 120),
      pad: { x: s.paddingLeft, y: s.paddingTop }, border: s.borderBottomWidth + " " + s.borderBottomColor,
      cursor: s.cursor, role: row.getAttribute("role"), expanded: row.getAttribute("aria-expanded"),
      tile: tileOut, chev, kids,
    };
  });
  return JSON.stringify({ present: true, cardY: Math.round(cardRect.y), cardH: Math.round(cardRect.height), cardCls: card.className.toString().slice(0, 100), rowCount: rows.length, rows: out });
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
  writeFileSync(`${OUT}/ref-week-mobile-containers.json`, JSON.stringify(rows, null, 2));
  console.log(JSON.stringify({ present: rows.present, rowCount: rows.rowCount, cardY: rows.cardY, cardH: rows.cardH }));
} catch (err) {
  console.error("PROBE-FAIL:", String(err).slice(0, 500));
  process.exitCode = 1;
} finally {
  await browser.close();
}
