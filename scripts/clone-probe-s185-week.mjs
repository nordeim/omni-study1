// S185 clone-side probe — the pre-change week-strip anatomy at :3000
// (desktop 1440x900 + mobile 390x844): the grid card wrapper (padding),
// the header strip (container border, the corner cell, the date colors,
// the today cell), the time labels (font/align/color), the day cells
// (border-l color, cursor/hover), the mobile rows (the chip, the bordered
// cards, the chevron, the tile content, the count size, the default-open
// state), and the My Classes header spacing. Computed styles are ground
// truth. Usage: node scripts/clone-probe-s185-week.mjs
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const CLONE = "http://localhost:3000";
const OUT = "docs/probe-evidence/s185";
mkdirSync(OUT, { recursive: true });

const DESKTOP = `(() => {
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.display !== "none" && cs.visibility !== "hidden";
  };
  const out = {};
  // the grid card wrapper (the sf-card with p-6?)
  const grids = [...document.querySelectorAll('[aria-label="Week grid"]')];
  const grid = grids[0] || null;
  if (grid) {
    let p = grid.parentElement;
    const chain = [];
    for (let i = 0; i < 3 && p; i++) {
      const s = getComputedStyle(p);
      chain.push({ tag: p.tagName, cls: (p.className || "").toString().slice(0, 110), pad: { x: s.paddingLeft, y: s.paddingTop }, bg: s.backgroundColor, radius: s.borderRadius, overflow: s.overflow, w: Math.round(p.getBoundingClientRect().width) });
      p = p.parentElement;
    }
    out.gridParents = chain;
    // the header strip
    const head = grid.querySelector('[aria-label="Week header"]');
    if (head) {
      const hcs = getComputedStyle(head);
      out.headerStrip = { cls: head.className.toString().slice(0, 120), display: hcs.display, borderB: hcs.borderBottomWidth + " " + hcs.borderBottomColor, w: Math.round(head.getBoundingClientRect().width) };
      const cells = [...head.children].filter(vis);
      out.headerCells = cells.slice(0, 8).map((c, i) => {
        const ccs = getComputedStyle(c);
        const ps = [...c.children].filter(vis);
        const nameP = ps[0], dateP = ps[1];
        const nameCs = nameP ? getComputedStyle(nameP) : null;
        const dateCs = dateP ? getComputedStyle(dateP) : null;
        return {
          i, tag: c.tagName, cls: (c.className || "").toString().slice(0, 110),
          bg: ccs.backgroundColor, radius: ccs.borderRadius,
          text: (c.textContent || "").trim().slice(0, 12),
          nameColor: nameCs ? nameCs.color : null, nameCls: nameP ? nameP.className.toString().slice(0, 60) : null,
          dateColor: dateCs ? dateCs.color : null, dateCls: dateP ? dateP.className.toString().slice(0, 80) : null,
        };
      });
    }
    // the time labels + the day cells
    const hourRows = grid.querySelector('[aria-label="Hour cells"]');
    if (hourRows) {
      const firstLabel = [...hourRows.children].find((el) => (el.textContent || "").trim().match(/^\\d{1,2} (AM|PM)$/));
      if (firstLabel) {
        const s = getComputedStyle(firstLabel);
        out.timeLabel = { cls: firstLabel.className.toString().slice(0, 110), font: { size: s.fontSize, weight: s.fontWeight, color: s.color }, pad: { x: s.paddingLeft, y: s.paddingTop }, align: s.textAlign, h: Math.round(firstLabel.getBoundingClientRect().height), text: (firstLabel.textContent || "").trim() };
      }
      // the first day cell (the second child of the row after the label)
      const firstDayCell = [...hourRows.children].filter((el) => (el.className || "").toString().includes("relative"))[0];
      if (firstDayCell) {
        const s = getComputedStyle(firstDayCell);
        out.dayCell = { cls: firstDayCell.className.toString().slice(0, 110), cursor: s.cursor, borderL: s.borderLeftWidth + " " + s.borderLeftColor, borderB: s.borderBottomWidth + " " + s.borderBottomColor, h: Math.round(firstDayCell.getBoundingClientRect().height) };
      }
      out.hourRowCount = [...hourRows.children].filter((el) => (el.textContent || "").trim().match(/^\\d{1,2} (AM|PM)$/)).length;
    }
  }
  return JSON.stringify(out);
})()`;

const MOBILE = `(() => {
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.display !== "none" && cs.visibility !== "hidden";
  };
  const out = { vw: window.innerWidth };
  const main = document.querySelector("main") || document.body;
  // the mobile section (md:hidden sf-card)
  const sections = [...main.querySelectorAll("section")].filter((el) => vis(el) && (el.className || "").toString().includes("md:hidden"));
  const sect = sections[0] || null;
  if (sect) {
    const scs = getComputedStyle(sect);
    out.mobileSection = { cls: sect.className.toString().slice(0, 110), pad: { x: scs.paddingLeft, y: scs.paddingTop }, text: (sect.textContent || "").trim().slice(0, 40) };
    // the Today chip (if present)
    const chip = [...sect.querySelectorAll("div")].find((el) => vis(el) && (el.textContent || "").trim().startsWith("Today") && (el.textContent || "").trim().length < 30);
    out.todayChip = chip ? { cls: chip.className.toString().slice(0, 110), text: chip.textContent.trim().slice(0, 24) } : null;
    // the rows: the bordered rounded-xl wrappers
    const rows = [...sect.querySelectorAll("div")].filter((el) => vis(el) && (el.className || "").toString().includes("rounded-xl") && el.querySelector('button[aria-expanded]'));
    out.rowCount = rows.length;
    out.rows = rows.slice(0, 7).map((row) => {
      const rcs = getComputedStyle(row);
      const btn = row.querySelector('button[aria-expanded]');
      const bcs = btn ? getComputedStyle(btn) : null;
      const tile = btn ? btn.querySelector("span.flex") : null;
      const tcs = tile ? getComputedStyle(tile) : null;
      const tileText = tile ? (tile.textContent || "").trim() : null;
      const nameP = btn ? [...btn.querySelectorAll("span.block")][0] : null;
      const countP = btn ? [...btn.querySelectorAll("span.text-xs, span.text-sm")][0] : null;
      const chev = btn ? btn.querySelector("svg") : null;
      const expanded = btn ? btn.getAttribute("aria-expanded") : null;
      return {
        rowCls: row.className.toString().slice(0, 100),
        border: rcs.borderBottomWidth + " " + rcs.borderBottomColor + " / all:" + rcs.borderWidth,
        btnCls: btn ? btn.className.toString().slice(0, 110) : null,
        btnBg: bcs ? bcs.backgroundColor : null,
        expanded,
        tileCls: tile ? tile.className.toString().slice(0, 110) : null,
        tileBg: tcs ? tcs.backgroundColor : null,
        tileText, tileH: tile ? Math.round(tile.getBoundingClientRect().height) : null,
        nameCls: nameP ? nameP.className.toString().slice(0, 70) : null,
        countCls: countP ? countP.className.toString().slice(0, 70) : null,
        countFont: countP ? (() => { const s = getComputedStyle(countP); return { size: s.fontSize, color: s.color }; })() : null,
        chev: chev ? { cls: (chev.getAttribute("class") || "").slice(0, 60) } : null,
        text: row.textContent.trim().slice(0, 24),
      };
    });
  }
  // the My Classes header spacing
  const myHdr = document.querySelector('[aria-label="My Classes header"]');
  if (myHdr) {
    const s = getComputedStyle(myHdr);
    out.myClasses = { cls: myHdr.className.toString().slice(0, 90), mb: s.marginBottom, text: myHdr.textContent.trim().slice(0, 40) };
    const emptyP = [...(myHdr.parentElement ? myHdr.parentElement.querySelectorAll("p") : [])].find((el) => vis(el) && /No classes/.test(el.textContent || ""));
    out.myClassesEmpty = emptyP ? { cls: emptyP.className.toString().slice(0, 90), text: emptyP.textContent.trim().slice(0, 60), font: (() => { const c = getComputedStyle(emptyP); return { size: c.fontSize, color: c.color }; })() } : null;
  }
  return JSON.stringify(out);
})()`;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
try {
  await page.goto(`${CLONE}/login`);
  await page.fill("input[type=email]", "demo@studyflow.app");
  await page.fill("input[type=password]", "Demo1234!");
  await page.waitForFunction(
    () => { const b = document.querySelector("button[type=submit]"); return b && !b.disabled; },
    null, { timeout: 15_000 },
  );
  await page.click("button[type=submit]");
  await page.waitForFunction(
    () => document.querySelector("nav a") !== null && document.querySelector("h1, h2") !== null,
    null, { timeout: 30_000 },
  );
  await page.waitForTimeout(1800);
  const link = page.locator("nav a").filter({ hasText: "Timetable" }).first();
  await link.click({ timeout: 15_000 });
  await page.waitForTimeout(2000);
  const desktop = JSON.parse(await page.evaluate(DESKTOP));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(1400);
  const mobile = JSON.parse(await page.evaluate(MOBILE));
  writeFileSync(`${OUT}/clone-week-pre.json`, JSON.stringify({ desktop, mobile }, null, 2));
  console.log(JSON.stringify({
    ok: true,
    gridParents: desktop.gridParents ? desktop.gridParents.map((p) => p.cls.slice(0, 60)) : null,
    headerStrip: desktop.headerStrip ? { borderB: desktop.headerStrip.borderB, w: desktop.headerStrip.w } : null,
    headerCell0: desktop.headerCells ? desktop.headerCells[0] : null,
    headerCell7: desktop.headerCells ? desktop.headerCells[7] : null,
    timeLabel: desktop.timeLabel,
    dayCell: desktop.dayCell,
    hourRowCount: desktop.hourRowCount,
    mobileRowCount: mobile.rowCount,
    todayChip: mobile.todayChip ? mobile.todayChip.text : null,
    firstRow: mobile.rows ? mobile.rows[0] : null,
    todayRow: mobile.rows ? mobile.rows[6] : null,
    myClasses: mobile.myClasses,
  }, null, 2));
} catch (err) {
  console.error("PROBE-FAIL:", String(err).slice(0, 500));
  process.exitCode = 1;
} finally {
  await browser.close();
}
