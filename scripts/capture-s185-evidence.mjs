// S185 evidence capture — the four self-verifying frames (the dev server
// at :3000 carries the current ported code). Each frame DOM-asserts its
// markers BEFORE the shot (the self-verifying convention): Frame 1 the
// desktop grid FLUSH + the "Time" corner + the today violet pair; Frame 2
// the desktop hour labels' span carriers + the clickable cells; Frame 3
// the mobile flat rows + the stacked tile + all-collapsed; Frame 4 the
// expanded empty day's slate-50 block + the near-black Add Class button.
// Usage: node scripts/capture-s185-evidence.mjs
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const CLONE = "http://localhost:3000";
const OUT = "docs/screenshots";

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
  await page.waitForTimeout(1500);
  const link = page.locator("nav a").filter({ hasText: "Timetable" }).first();
  await link.click({ timeout: 15_000 });
  await page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true");
  await page.waitForTimeout(1200);

  // ---- Frame 1: the flush grid + the "Time" corner + the today pair ----
  const f1 = await page.evaluate(() => {
    const grid = document.querySelector('[aria-label="Week grid"]');
    const card = grid ? grid.closest("section") : null;
    const head = grid ? grid.querySelector('[aria-label="Week header"]') : null;
    const corner = head ? head.children[0] : null;
    const today = head ? head.querySelector("[data-today-header]") : null;
    return {
      cardPad: card ? getComputedStyle(card).paddingLeft : null,
      cornerText: corner ? corner.textContent.trim() : null,
      cornerColor: corner ? getComputedStyle(corner).color : null,
      stripBorderB: head ? getComputedStyle(head).borderBottomWidth : null,
      todayRadius: today ? getComputedStyle(today).borderRadius : null,
      todayBg: today ? getComputedStyle(today).backgroundColor : null,
      todayNameColor: today ? getComputedStyle(today.querySelectorAll("p")[0]).color : null,
      todayDateColor: today ? getComputedStyle(today.querySelectorAll("p")[1]).color : null,
    };
  });
  const ok1 = f1.cardPad === "0px" && f1.cornerText === "Time" && f1.stripBorderB === "1px" &&
    f1.todayRadius === "0px" && f1.todayBg === "rgb(245, 243, 255)" &&
    f1.todayNameColor === "rgb(124, 58, 237)" && f1.todayDateColor === "rgb(109, 40, 217)";
  console.log("FRAME1-ASSERT:", JSON.stringify(f1), "OK:", ok1);
  await page.screenshot({ path: `${OUT}/185-clone-desktop-flush-corner.png` });

  // ---- Frame 2: the hour labels + the clickable cells (the 9 AM band) ----
  const f2 = await page.evaluate(() => {
    const cells = document.querySelector('[aria-label="Hour cells"]');
    const firstLabel = cells ? cells.children[0] : null;
    const span = firstLabel ? firstLabel.querySelector("span") : null;
    const firstDayCell = cells ? [...cells.children].find((c) => (c.className || "").includes("relative")) : null;
    return {
      labelPad: firstLabel ? getComputedStyle(firstLabel).paddingLeft : null,
      spanColor: span ? getComputedStyle(span).color : null,
      spanSize: span ? getComputedStyle(span).fontSize : null,
      cellCursor: firstDayCell ? getComputedStyle(firstDayCell).cursor : null,
      cellBorderL: firstDayCell ? getComputedStyle(firstDayCell).borderLeftColor : null,
    };
  });
  const ok2 = f2.labelPad === "12px" && f2.spanColor === "rgb(100, 116, 139)" &&
    f2.spanSize === "12px" && f2.cellCursor === "pointer" && f2.cellBorderL === "rgb(241, 245, 249)";
  console.log("FRAME2-ASSERT:", JSON.stringify(f2), "OK:", ok2);
  await page.screenshot({ path: `${OUT}/185-clone-desktop-labels-cells.png` });

  // ---- Frame 3: the mobile flat rows + the stacked tile (all collapsed) ----
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(1400);
  const f3 = await page.evaluate(() => {
    const section = document.querySelector('section[class~="md:hidden"]');
    if (!section) return { present: false };
    const stack = section.firstElementChild;
    const rows = [...stack.children];
    const first = rows[0];
    const btn = first ? first.querySelector("button[aria-expanded]") : null;
    const tile = btn ? btn.querySelector("span.flex") : null;
    const spans = tile ? [...tile.querySelectorAll("span")].map((s) => s.textContent.trim()) : [];
    const chip = [...section.querySelectorAll("div")].some((d) => (d.textContent || "").trim().startsWith("Today") && (d.textContent || "").trim().length < 30);
    const chev = btn ? btn.querySelector("svg") : null;
    const expandedAll = rows.map((r) => (r.querySelector("button[aria-expanded]") || {}).getAttribute ? r.querySelector("button[aria-expanded]").getAttribute("aria-expanded") : null);
    return {
      present: true,
      rowCount: rows.length,
      row1Radius: first ? getComputedStyle(first).borderRadius : null,
      stackDivide: getComputedStyle(rows[0]).borderBottomWidth,
      tileSpans: spans,
      tileDir: tile ? getComputedStyle(tile).flexDirection : null,
      chip: !!chip,
      chevron: !!chev,
      allCollapsed: expandedAll.every((e) => e === "false"),
    };
  });
  const ok3 = f3.present && f3.rowCount === 7 && f3.row1Radius === "0px" && f3.tileDir === "column" &&
    f3.tileSpans.length === 2 && !f3.chip && !f3.chevron && f3.allCollapsed;
  console.log("FRAME3-ASSERT:", JSON.stringify(f3), "OK:", ok3);
  await page.screenshot({ path: `${OUT}/185-clone-mobile-flat-rows.png` });

  // ---- Frame 4: the expanded empty day + the Add Class button ----
  // Sunday's row (the seed's classes sit on ISO Mon–Fri) — click it.
  const sundayBtn = page.locator('section[class~="md:hidden"] button[aria-expanded]').first();
  await sundayBtn.click();
  await page.waitForTimeout(900);
  const f4 = await page.evaluate(() => {
    const block = document.querySelector('section[class~="md:hidden"] div.bg-slate-50');
    if (!block) return { present: false };
    const btn = [...block.querySelectorAll("button")].find((b) => /Add Class/.test(b.textContent || ""));
    const p = [...block.querySelectorAll("p")].find((el) => /^No classes$/.test((el.textContent || "").trim()));
    const s = btn ? getComputedStyle(btn) : null;
    return {
      present: true,
      bg: getComputedStyle(block).backgroundColor,
      pad: getComputedStyle(block).paddingLeft,
      lineText: p ? p.textContent.trim() : null,
      lineAlign: p ? getComputedStyle(p).textAlign : null,
      btnBg: s ? s.backgroundColor : null,
      btnColor: s ? s.color : null,
      btnH: btn ? Math.round(btn.getBoundingClientRect().height) : null,
    };
  });
  const ok4 = f4.present && f4.bg === "rgb(248, 250, 252)" && f4.pad === "16px" &&
    f4.lineText === "No classes" && f4.lineAlign === "center" &&
    f4.btnBg === "rgb(10, 10, 10)" && f4.btnColor === "rgb(250, 250, 250)" && f4.btnH === 32;
  console.log("FRAME4-ASSERT:", JSON.stringify(f4), "OK:", ok4);
  await page.screenshot({ path: `${OUT}/185-clone-mobile-expanded-empty.png` });

  console.log(JSON.stringify({ ok: ok1 && ok2 && ok3 && ok4, frames: { f1: ok1, f2: ok2, f3: ok3, f4: ok4 } }));
  if (!(ok1 && ok2 && ok3 && ok4)) process.exitCode = 1;
} catch (err) {
  console.error("CAPTURE-FAIL:", String(err).slice(0, 500));
  process.exitCode = 1;
} finally {
  await browser.close();
}
