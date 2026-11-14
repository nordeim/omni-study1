// S185 reference probe 4 — the label carrier + the cell-click behavior +
// the MOBILE pass. Settles:
//   A. the hour-label INNER element (the ink measured slate-400 16px at
//      x306 — the cell's own computed color was inherited neutral-50, so a
//      nested element carries text-slate-400; capture its tag/class),
//   B. the day-column CELL CLICK: cursor-pointer + hover:bg-slate-50/50 is
//      measured on the columns — click an empty cell and record what opens
//      (the Add Class dialog? prefilled with the day/hour?), then CLOSE
//      without creating (zero-residue discipline),
//   C. the MOBILE anatomy at 390x844 (the recorded mobile anatomy was the
//      clone's own accordion — the reference's own mobile surface has
//      never been measured): the full structure + the My Classes panel.
// Usage: REF_PROBE_EMAIL=… REF_PROBE_PASSWORD=… node scripts/ref-probe-s185-week4.mjs
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const REF = "https://omni-study1.base44.app";
const OUT = "docs/probe-evidence/s185";
mkdirSync(OUT, { recursive: true });

const LABEL_INNER = `(() => {
  const grid = [...document.querySelectorAll("div")].filter((el) => {
    const r = el.getBoundingClientRect();
    return r.height > 500 && (el.className || "").toString().includes("grid-cols-8");
  })[0];
  if (!grid) return JSON.stringify({ present: false });
  const timeCol = [...grid.children].find((c) => (c.textContent || "").trim().startsWith("7 AM"));
  if (!timeCol) return JSON.stringify({ present: false });
  const first = [...timeCol.children].find((c) => (c.textContent || "").trim() === "7 AM");
  if (!first) return JSON.stringify({ present: false, note: "no first label cell" });
  const inner = [...first.children].map((k) => {
    const s = getComputedStyle(k);
    return { tag: k.tagName, cls: (k.className || "").toString().slice(0, 90), text: (k.textContent || "").trim().slice(0, 8), color: s.color, size: s.fontSize, weight: s.fontWeight, display: s.display };
  });
  return JSON.stringify({
    present: true, cellCls: first.className.toString().slice(0, 90),
    childCount: first.children.length, inner,
    directText: first.childNodes.length ? [...first.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim().slice(0, 6)) : [],
  });
})()`;

const MOBILE_STRUCTURE = `(() => {
  const main = document.querySelector("main") || document.body;
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.display !== "none" && cs.visibility !== "hidden";
  };
  const out = { vw: window.innerWidth };
  // the top-level blocks of main (visible, 2 hops)
  const blocks = [];
  const walk = (el, depth) => {
    if (depth > 2 || blocks.length > 40) return;
    for (const c of el.children) {
      if (!vis(c)) continue;
      const r = c.getBoundingClientRect();
      blocks.push({ d: depth, tag: c.tagName, cls: (c.className || "").toString().slice(0, 100), w: Math.round(r.width), h: Math.round(r.height), text: (c.textContent || "").trim().slice(0, 40) });
      walk(c, depth + 1);
    }
  };
  walk(main, 0);
  out.blocks = blocks;
  // the day-accordion-ish rows: buttons/headers carrying weekday names
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const dayRows = [...main.querySelectorAll("div,button,section")].filter((el) => {
    if (!vis(el)) return false;
    const t = (el.textContent || "").trim();
    return days.some((d) => t.startsWith(d)) && t.length < 30 && el.children.length <= 5;
  }).slice(0, 10);
  out.dayRows = dayRows.map((el) => {
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      tag: el.tagName, cls: (el.className || "").toString().slice(0, 110),
      text: (el.textContent || "").trim().slice(0, 26), w: Math.round(r.width), h: Math.round(r.height),
      bg: s.backgroundColor, radius: s.borderRadius, border: s.borderTopWidth + " " + s.borderTopColor,
      display: s.display, role: el.getAttribute("role"), expanded: el.getAttribute("aria-expanded"),
    };
  });
  // the My Classes panel
  const myClasses = [...main.querySelectorAll("div,section,h2,h3")].filter((el) => vis(el) && (el.textContent || "").trim().startsWith("My Classes")).slice(0, 3);
  out.myClasses = myClasses.map((el) => {
    const s = getComputedStyle(el);
    return { tag: el.tagName, cls: (el.className || "").toString().slice(0, 100), text: (el.textContent || "").trim().slice(0, 60), font: { size: s.fontSize, weight: s.fontWeight, color: s.color }, h: Math.round(el.getBoundingClientRect().height) };
  });
  // the today chip (a strip carrying Today + date?)
  const todayEl = [...main.querySelectorAll("div")].filter((el) => vis(el) && (el.textContent || "").trim().startsWith("Today") && (el.textContent || "").trim().length < 30).slice(0, 2);
  out.todayChip = todayEl.map((el) => {
    const s = getComputedStyle(el);
    return { cls: (el.className || "").toString().slice(0, 110), text: (el.textContent || "").trim().slice(0, 24), bg: s.backgroundColor, radius: s.borderRadius, font: { size: s.fontSize, weight: s.fontWeight, color: s.color }, pad: { x: s.paddingLeft, y: s.paddingTop } };
  });
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

  // ---- A. the label inner carrier ----
  const labelInner = JSON.parse(await page.evaluate(LABEL_INNER));
  console.log("LABEL-INNER:", JSON.stringify(labelInner));

  // ---- B. the cell click ----
  const clickOut = {};
  try {
    const grid = page.locator('div.grid-cols-8').filter({ has: page.locator('text=7 AM') }).first();
    // the Saturday column (last day column): its 3rd cell (9 AM band)
    const dayCols = grid.locator('div.cursor-pointer');
    const colCount = await dayCols.count();
    clickOut.dayColumns = colCount;
    const satCol = dayCols.nth(colCount - 1);
    const cells = satCol.locator("> div");
    const cellCount = await cells.count();
    clickOut.cellsPerColumn = cellCount;
    const target = cells.nth(2); // the 9 AM cell
    await target.click({ timeout: 8_000 });
    await page.waitForTimeout(1200);
    // what opened? a dialog?
    const dlg = page.locator('[role="dialog"]');
    clickOut.dialogCount = await dlg.count();
    if (await dlg.count() > 0) {
      const d = dlg.first();
      clickOut.dialogVisible = await d.isVisible();
      const title = d.locator("h2, h3, [class*=title]").first();
      clickOut.dialogTitle = (await title.count()) ? await title.textContent() : null;
      // the dialog's inputs (prefilled?)
      const inputs = d.locator("input, select");
      const vals = [];
      const n = await inputs.count();
      for (let i = 0; i < Math.min(n, 8); i++) {
        const el = inputs.nth(i);
        try {
          vals.push({ type: await el.getAttribute("type"), value: await el.inputValue(), ph: await el.getAttribute("placeholder") });
        } catch { vals.push({ skip: true }); }
      }
      clickOut.dialogInputs = vals;
      // close via Escape (no creation — zero residue)
      await page.keyboard.press("Escape");
      await page.waitForTimeout(600);
      clickOut.dialogAfterEscape = await page.locator('[role="dialog"]').count();
      if (await page.locator('[role="dialog"]').count() > 0) {
        // try an X button
        const x = page.locator('[role="dialog"] button').first();
        await x.click({ timeout: 4_000 }).catch(() => {});
        await page.waitForTimeout(600);
        clickOut.dialogAfterX = await page.locator('[role="dialog"]').count();
      }
    }
  } catch (err) {
    clickOut.error = String(err).slice(0, 300);
  }
  console.log("CLICK:", JSON.stringify(clickOut));

  // ---- C. the mobile pass ----
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(1400);
  const mobile = JSON.parse(await page.evaluate(MOBILE_STRUCTURE));
  writeFileSync(`${OUT}/ref-week-mobile.json`, JSON.stringify(mobile, null, 2));
  await page.screenshot({ path: `${OUT}/ref-timetable-mobile.png` });
  console.log("MOBILE:", JSON.stringify({
    blocks: mobile.blocks.length, dayRows: mobile.dayRows.length,
    myClasses: mobile.myClasses.length, todayChip: mobile.todayChip.length,
  }));
  writeFileSync(`${OUT}/ref-week-label-click.json`, JSON.stringify({ labelInner, clickOut }, null, 2));
} catch (err) {
  console.error("PROBE-FAIL:", String(err).slice(0, 500));
  process.exitCode = 1;
} finally {
  await browser.close();
}
