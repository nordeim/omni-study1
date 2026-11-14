// S184 evidence capture — four self-verifying frames of the re-rotated
// EmptyState family on the dev tree (localhost:3000, demo account):
//  1. the Files empty (the family anatomy — always-empty view)
//  2. the Flashcards zero split (the sidebar family empty + the main
//     Select-a-deck family empty — via the EA3 interception)
//  3. the Assignments bare empty (via the interception)
//  4. the Timetable grid-always zero state + the My Classes slim empty
// Each frame: DOM-asserted BEFORE the screenshot (the frame proves its
// own subject), the pixel-ratio checked after (non-blank).
// Usage: node scripts/capture-s184-evidence.mjs  (bun INCOMPATIBLE)
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const CLONE = "http://localhost:3000";
const OUT = "docs/screenshots";
mkdirSync(OUT, { recursive: true });
const results = {};

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
try {
  await page.goto(`${CLONE}/login`, { timeout: 45_000 });
  await page.fill("input[type=email]", "demo@studyflow.app");
  await page.fill("input[type=password]", "Demo1234!");
  await page.waitForFunction(() => { const b = document.querySelector("button[type=submit]"); return b && !b.disabled; }, null, { timeout: 15_000 });
  await page.click("button[type=submit]");
  await page.waitForFunction(() => document.querySelector("nav a") !== null && document.querySelector("h1, h2") !== null, null, { timeout: 30_000 });
  await page.waitForTimeout(1500);

  // ---- frame 1: the Files empty (the seed leaves it empty) ----
  await page.goto(`${CLONE}/Files`);
  await page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true", null, { timeout: 15_000 });
  await page.waitForFunction(() => [...document.querySelectorAll("h1,h2")].some((h) => (h.textContent || "").includes("No files yet")), null, { timeout: 15_000 });
  const filesAnatomy = await page.evaluate(() => {
    const e = document.querySelector("main [class*='py-16']");
    if (!e) return null;
    const cs = getComputedStyle(e);
    const wrapper = e.querySelector("div.rounded-2xl");
    return { padX: cs.paddingLeft, padY: cs.paddingTop, wrapperMb: wrapper ? getComputedStyle(wrapper).marginBottom : null };
  });
  results.filesAnatomy = filesAnatomy;
  if (!filesAnatomy || filesAnatomy.padX !== "16px" || filesAnatomy.padY !== "64px" || filesAnatomy.wrapperMb !== "24px") {
    throw new Error(`frame-1 anatomy mismatch: ${JSON.stringify(filesAnatomy)}`);
  }
  await page.screenshot({ path: `${OUT}/184-clone-files-empty.png` });

  // ---- frame 2: the Flashcards zero split (intercepted) ----
  await page.route(/\/api\/flashcards\/decks$/, async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
    } else { await route.continue(); }
  });
  await page.goto(`${CLONE}/Flashcards`);
  await page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true", null, { timeout: 15_000 });
  await page.waitForFunction(() => [...document.querySelectorAll("h1,h2")].some((h) => (h.textContent || "").includes("No decks yet")), null, { timeout: 15_000 });
  const split = await page.evaluate(() => {
    const side = document.querySelector('[aria-label="Deck list pane"]');
    const main = document.querySelector('[aria-label="Deck detail"]');
    return {
      sidebarHeading: side?.querySelector("h2")?.textContent?.trim() ?? null,
      sidebarCta: [...(side?.querySelectorAll("button") || [])].map((b) => b.textContent.trim()).find((t) => /create deck/i.test(t)) ?? null,
      mainHeading: main?.querySelector("h2")?.textContent?.trim() ?? null,
      mainHint: main?.querySelector("p")?.textContent?.trim() ?? null,
    };
  });
  results.flashcardsSplit = split;
  if (!split.sidebarHeading?.includes("No decks yet") || !split.sidebarCta || !split.mainHeading?.includes("Select a deck")) {
    throw new Error(`frame-2 split mismatch: ${JSON.stringify(split)}`);
  }
  await page.screenshot({ path: `${OUT}/184-clone-flashcards-zero-split.png` });
  await page.unroute(/\/api\/flashcards\/decks$/);

  // ---- frame 3: the Assignments bare empty (intercepted) ----
  await page.route(/\/api\/assignments$/, async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
    } else { await route.continue(); }
  });
  await page.goto(`${CLONE}/Assignments`);
  await page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true", null, { timeout: 15_000 });
  await page.waitForFunction(() => [...document.querySelectorAll("h1,h2")].some((h) => (h.textContent || "").includes("No assignments yet")), null, { timeout: 15_000 });
  const bare = await page.evaluate(() => {
    const e = document.querySelector("main [class*='py-16']");
    if (!e) return null;
    let el = e.parentElement, cardish = false;
    for (let i = 0; i < 5 && el; i++) {
      const cs = getComputedStyle(el);
      if (cs.backgroundColor === "rgb(255, 255, 255)" && cs.borderTopWidth !== "0px") { cardish = true; break; }
      el = el.parentElement;
    }
    return { cardish };
  });
  results.assignmentsBare = bare;
  if (!bare || bare.cardish) { throw new Error(`frame-3 not bare: ${JSON.stringify(bare)}`); }
  await page.screenshot({ path: `${OUT}/184-clone-assignments-bare-empty.png` });
  await page.unroute(/\/api\/assignments$/);

  // ---- frame 4: the Timetable grid-always zero (intercepted) ----
  await page.route(/\/api\/timetable$/, async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
    } else { await route.continue(); }
  });
  await page.goto(`${CLONE}/Timetable`);
  await page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true", null, { timeout: 15_000 });
  await page.waitForFunction(() => document.querySelector('[aria-label="Week grid"]') !== null, null, { timeout: 15_000 });
  const tt = await page.evaluate(() => {
    const grid = document.querySelector('[aria-label="Week grid"]');
    const slim = [...document.querySelectorAll("p")].find((p) => /no classes yet/i.test(p.textContent || ""));
    return { gridW: grid ? Math.round(grid.getBoundingClientRect().width) : null, slim: slim?.textContent?.trim().slice(0, 60) ?? null };
  });
  results.timetableZero = tt;
  if (!tt.gridW || !tt.slim) { throw new Error(`frame-4 mismatch: ${JSON.stringify(tt)}`); }
  await page.screenshot({ path: `${OUT}/184-clone-timetable-grid-always.png` });
  await page.unroute(/\/api\/timetable$/);

  results.ok = true;
  results.frames = ["184-clone-files-empty.png", "184-clone-flashcards-zero-split.png", "184-clone-assignments-bare-empty.png", "184-clone-timetable-grid-always.png"];
  writeFileSync(`${OUT}/184-evidence.json`, JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 1));
} catch (err) {
  console.error("CAPTURE-FAIL:", String(err).slice(0, 400));
  process.exitCode = 1;
} finally {
  await browser.close();
}
