// S185 reference probe 5 — the MOBILE day-row inner anatomy (390x844).
// The reference's mobile timetable card renders 7 day rows: "Sun8" + "Sunday"
// + "0 classes". This probe captures each row's full anatomy — the row
// container (tag, classes, pad, border), the date tile (size, bg, radius,
// fonts — the TODAY tile vs the others), the name/count column fonts, any
// chevron, and the ROW CLICK behavior (accordion? dialog? nothing). Also
// the My Classes "Saturday, November 14" line's own anatomy.
// Usage: REF_PROBE_EMAIL=… REF_PROBE_PASSWORD=… node scripts/ref-probe-s185-week5.mjs
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const REF = "https://omni-study1.base44.app";
const OUT = "docs/probe-evidence/s185";
mkdirSync(OUT, { recursive: true });

const ROW_ANATOMY = `(() => {
  const main = document.querySelector("main") || document.body;
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.display !== "none" && cs.visibility !== "hidden";
  };
  // the mobile day-rows card: the overflow-hidden rounded-2xl card whose
  // text carries all seven weekday names
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const cards = [...main.querySelectorAll("div")].filter((el) => {
    if (!vis(el)) return false;
    const t = el.textContent || "";
    return days.every((d) => t.includes(d)) && (el.className || "").toString().includes("overflow-hidden");
  });
  const card = cards[0] || null;
  if (!card) return JSON.stringify({ present: false, cards: cards.length });
  // the rows: the card's descendants that directly own a weekday name and
  // a "N classes" count text (leaf-ish rows)
  const rows = [...card.querySelectorAll("div, button, section")].filter((el) => {
    if (!vis(el) || el.children.length === 0 || el.children.length > 8) return false;
    const t = (el.textContent || "").trim();
    return days.some((d) => t.startsWith(d)) && /classes/.test(t) && t.length < 40;
  });
  const rowOut = rows.map((row) => {
    const s = getComputedStyle(row);
    const kids = [...row.children].filter(vis).map((k) => {
      const ks = getComputedStyle(k);
      return {
        tag: k.tagName, cls: (k.className || "").toString().slice(0, 110),
        text: (k.textContent || "").trim().slice(0, 22),
        w: Math.round(k.getBoundingClientRect().width), h: Math.round(k.getBoundingClientRect().height),
        bg: ks.backgroundColor, radius: ks.borderRadius, display: ks.display,
        color: ks.color, size: ks.fontSize, weight: ks.fontWeight,
      };
    });
    return {
      tag: row.tagName, cls: (row.className || "").toString().slice(0, 120),
      text: (row.textContent || "").trim().slice(0, 24),
      h: Math.round(row.getBoundingClientRect().height),
      pad: { x: s.paddingLeft, y: s.paddingTop }, border: s.borderBottomWidth + " " + s.borderBottomColor,
      display: s.display, role: row.getAttribute("role"), expanded: row.getAttribute("aria-expanded"),
      cursor: s.cursor, kids,
    };
  });
  return JSON.stringify({ present: true, cardCls: card.className.toString().slice(0, 120), rowCount: rows.length, rows: rowOut });
})()`;

const MY_CLASSES_LINE = `(() => {
  const main = document.querySelector("main") || document.body;
  const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.display !== "none" && cs.visibility !== "hidden"; };
  const panel = [...main.querySelectorAll("div")].filter((el) => vis(el) && (el.textContent || "").trim().startsWith("My Classes") && (el.className || "").toString().includes("rounded-2xl"))[0];
  if (!panel) return JSON.stringify({ present: false });
  const kids = [...panel.children].filter(vis).map((k) => {
    const ks = getComputedStyle(k);
    return { tag: k.tagName, cls: (k.className || "").toString().slice(0, 100), text: (k.textContent || "").trim().slice(0, 50), font: { size: ks.fontSize, weight: ks.fontWeight, color: ks.color }, h: Math.round(k.getBoundingClientRect().height), display: ks.display };
  });
  // the header row + the date line inside it
  const hdr = [...panel.children].find((k) => (k.textContent || "").includes("My Classes"));
  const hdrKids = hdr ? [...hdr.children].filter(vis).map((k) => {
    const ks = getComputedStyle(k);
    return { tag: k.tagName, cls: (k.className || "").toString().slice(0, 90), text: (k.textContent || "").trim().slice(0, 40), font: { size: ks.fontSize, weight: ks.fontWeight, color: ks.color } };
  }) : null;
  const emptyLine = [...panel.querySelectorAll("p, div")].filter((el) => vis(el) && /No subjects|No classes/i.test(el.textContent || "")).map((el) => {
    const ks = getComputedStyle(el);
    return { tag: el.tagName, cls: (el.className || "").toString().slice(0, 90), text: (el.textContent || "").trim().slice(0, 60), font: { size: ks.fontSize, weight: ks.fontWeight, color: ks.color }, pad: { x: ks.paddingLeft, y: ks.paddingTop }, align: ks.textAlign };
  });
  return JSON.stringify({ present: true, panelCls: panel.className.toString().slice(0, 110), kids, hdrKids, emptyLine });
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
  // Mobile 390: the sidebar nav is hidden (the drawer posture) — navigate
  // by URL instead of clicking the invisible link.
  await page.goto(`${REF}/Timetable`, { timeout: 45_000 });
  await page.waitForFunction(
    () => document.querySelector("h1, h2") !== null && /Timetable/.test(document.body.textContent || ""),
    null, { timeout: 30_000 },
  );
  await page.waitForTimeout(2200);
  const rows = JSON.parse(await page.evaluate(ROW_ANATOMY));
  writeFileSync(`${OUT}/ref-week-mobile-rows.json`, JSON.stringify(rows, null, 2));
  console.log("ROWS:", JSON.stringify({ present: rows.present, rowCount: rows.rowCount }));
  const myClasses = JSON.parse(await page.evaluate(MY_CLASSES_LINE));
  writeFileSync(`${OUT}/ref-week-myclasses.json`, JSON.stringify(myClasses, null, 2));
  console.log("MY-CLASSES:", JSON.stringify({ present: myClasses.present, empty: myClasses.emptyLine }));

  // ---- the row click: does a day row expand (accordion) or open a dialog? ----
  const clickOut = {};
  try {
    const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    // click the Saturday row (today)
    const row = page.locator("div, button").filter({ hasText: /^Saturday$/ }).first();
    // find the row that contains "Saturday" and "classes"
    const rowsLoc = page.locator('[class*="cursor-pointer"], button').filter({ hasText: "classes" });
    const rowCount = await rowsLoc.count();
    clickOut.matchingRows = rowCount;
    // the row's card: click the LAST matching (Saturday) row's container
    const card = page.locator("div.overflow-hidden").filter({ hasText: "Saturday" }).first();
    const before = await page.locator('[role="dialog"]').count();
    // click the tile/name region of Saturday's row
    const satName = page.locator("text=Saturday").first();
    await satName.click({ timeout: 8_000 });
    await page.waitForTimeout(1200);
    clickOut.dialogAfter = await page.locator('[role="dialog"]').count();
    // did the row expand? compare the card height + a "No classes" line
    const cardH = await card.boundingBox();
    clickOut.cardH = cardH ? Math.round(cardH.height) : null;
    clickOut.noClassesLine = await page.locator("text=/No classes/i").count();
    // today's date line in My Classes
    clickOut.todayLine = await page.locator("text=Saturday, November 14").count();
  } catch (err) {
    clickOut.error = String(err).slice(0, 300);
  }
  writeFileSync(`${OUT}/ref-week-mobile-click.json`, JSON.stringify(clickOut, null, 2));
  console.log("CLICK:", JSON.stringify(clickOut));
} catch (err) {
  console.error("PROBE-FAIL:", String(err).slice(0, 500));
  process.exitCode = 1;
} finally {
  await browser.close();
}
