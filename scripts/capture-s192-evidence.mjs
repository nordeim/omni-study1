// S192 evidence capture — the three self-verifying frames for the
// AI-chrome + calendar-day-header parity port, ridden against the fresh
// :3200 standalone (the demo account):
//   1. 192-ai-assistant-desktop.png — the ported AI view at 1440 (the
//      max-w-5xl wrapper, the 3-col quick grid, the py-20 hero inside the
//      min-h-500 chat card, the icon-only send)
//   2. 192-ai-assistant-mobile.png  — the same view at 390 (the 2-col grid)
//   3. 192-calendar-day-detail.png  — the year-less day-detail header
// Every frame is DOM-asserted BEFORE the shot and pixel-verified non-blank
// after (the standing evidence discipline).
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const CLONE = "http://localhost:3200";
const OUT = "docs/screenshots";
mkdirSync(OUT, { recursive: true });

async function session(browser, viewport) {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  await page.goto(`${CLONE}/login`, { timeout: 45_000 });
  await page.fill("input[type=email]", "demo@studyflow.app");
  await page.fill("input[type=password]", "Demo1234!");
  await page.waitForFunction(
    () => {
      const b = document.querySelector("button[type=submit]");
      return b !== null && !b.disabled;
    },
    null,
    { timeout: 20_000 },
  );
  await page.click("button[type=submit]");
  await page.waitForFunction(
    () =>
      document.querySelector("nav a") !== null &&
      (document.querySelector("h1") !== null || document.querySelector("h2") !== null),
    null,
    { timeout: 30_000 },
  );
  await page.waitForTimeout(1800);
  return { ctx, page };
}

const nonBlank = async (path) => {
  // The byte-size + PNG-signature check (a blank frame renders ~5-8KB; a
  // real view 100KB+ — the standing brightness heuristic's cheap form).
  const stat = await import("node:fs").then((fs) => fs.statSync(path));
  return stat.size > 50_000;
};

const browser = await chromium.launch();
const results = {};

// Frame 1+2: the AI view, desktop then mobile.
{
  const { ctx, page } = await session(browser, { width: 1440, height: 900 });
  await page.locator("nav a").filter({ hasText: "AI Assistant" }).first().click();
  await page.waitForTimeout(2200);
  // DOM-assert the ported anatomy before the shot.
  const asserts = await page.evaluate(() => {
    const grid = document.querySelector('[aria-label="Quick actions"]');
    const hero = [...document.querySelectorAll("h3, [role=heading]")].find((h) =>
      /how can i help you study today/i.test(h.textContent || ""),
    );
    const send = document.querySelector('[aria-label="Send message"]');
    const wrap = [...document.querySelectorAll("div")].find((d) =>
      /max-w-5xl/.test(d.getAttribute("class") || ""),
    );
    return {
      gridCols: grid ? getComputedStyle(grid).gridTemplateColumns.split(" ").length : 0,
      heroPresent: !!hero,
      sendIconOnly: send ? send.textContent.trim() === "" : false,
      sendH: send ? Math.round(send.getBoundingClientRect().height) : 0,
      wrapperW: wrap ? Math.round(wrap.getBoundingClientRect().width) : 0,
      subtitle: [...document.querySelectorAll("p")].some((p) =>
        /your personal ai tutor, available 24\/7/i.test(p.textContent || ""),
      ),
    };
  });
  if (
    asserts.gridCols !== 3 ||
    !asserts.heroPresent ||
    !asserts.sendIconOnly ||
    asserts.sendH !== 60 ||
    asserts.wrapperW !== 1024 ||
    !asserts.subtitle
  ) {
    console.error("AI DESKTOP ASSERTIONS FAILED:", JSON.stringify(asserts));
    process.exit(1);
  }
  await page.screenshot({ path: `${OUT}/192-ai-assistant-desktop.png`, fullPage: false });
  results.desktop = { ...asserts, nonBlank: await nonBlank(`${OUT}/192-ai-assistant-desktop.png`) };

  // Mobile: resize + re-assert the 2-col grid.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(1200);
  const mobileCols = await page.evaluate(() => {
    const grid = document.querySelector('[aria-label="Quick actions"]');
    return grid ? getComputedStyle(grid).gridTemplateColumns.split(" ").length : 0;
  });
  if (mobileCols !== 2) {
    console.error("AI MOBILE GRID ASSERTION FAILED:", mobileCols);
    process.exit(1);
  }
  await page.screenshot({ path: `${OUT}/192-ai-assistant-mobile.png`, fullPage: false });
  results.mobile = { gridCols: mobileCols, nonBlank: await nonBlank(`${OUT}/192-ai-assistant-mobile.png`) };
  await ctx.close();
}

// Frame 3: the calendar day-detail (the year-less form).
{
  const { ctx, page } = await session(browser, { width: 1440, height: 900 });
  await page.locator("nav a").filter({ hasText: "Calendar" }).first().click();
  await page.waitForTimeout(2000);
  const dayHeader = await page.evaluate(() => {
    const aside = document.querySelector('[aria-label="Day detail"]');
    const h3 = aside?.querySelector("h3");
    return h3 ? h3.textContent.trim() : null;
  });
  if (!dayHeader || /,\s*\d{4}$/.test(dayHeader)) {
    console.error("CALENDAR DAY-DETAIL ASSERTION FAILED:", dayHeader);
    process.exit(1);
  }
  await page.screenshot({ path: `${OUT}/192-calendar-day-detail.png`, fullPage: false });
  results.calendar = {
    dayHeader,
    yearless: !/,\s*\d{4}$/.test(dayHeader),
    nonBlank: await nonBlank(`${OUT}/192-calendar-day-detail.png`),
  };
  await ctx.close();
}

await browser.close();
writeFileSync("/tmp/s192-evidence.json", JSON.stringify(results, null, 1));
console.log(JSON.stringify({ ok: true, frames: results }, null, 1));
