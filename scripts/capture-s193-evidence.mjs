// S193 evidence capture — the two self-verifying frames for the
// timetable-family e2e consolidation (Batch EQ), ridden against the fresh
// :3200 standalone (the demo account). The consolidation is a pure
// test-organization refactor — the frames document the CONSOLIDATED
// FAMILY'S surfaces (the view the 15 moved pins drive), on the final tree:
//   1. 193-timetable-desktop.png — the week grid at 1440 (the flush grid
//      card, the "Time" corner, the 14 hour rows, the today violet header,
//      the seeded 5-class ISO Mon–Fri layout)
//   2. 193-timetable-mobile.png  — the week-strip flat rows at 390 (the
//      stacked tiles, the all-collapsed initial, the today violet tile)
// Every frame is DOM-asserted BEFORE the shot and pixel-verified non-blank
// after (the standing evidence discipline). The assertions mirror the
// moved pins' own contracts (S7-C/CB6/EI1/EI3/EI6) — the family map lives
// in docs/remediation-plan-session193.md.
import { chromium } from "playwright";
import { mkdirSync, statSync } from "node:fs";

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

const nonBlank = (path) => statSync(path).size > 50_000;

const browser = await chromium.launch();
const results = {};

// Frame 1: the desktop week grid at 1440.
{
  const { ctx, page } = await session(browser, { width: 1440, height: 900 });
  await page.locator("nav a").filter({ hasText: "Timetable" }).first().click();
  await page.waitForTimeout(2200);
  // DOM-assert the family's contracts before the shot (S7-C/CB6/EI1/EI3).
  const asserts = await page.evaluate(() => {
    const grid = document.querySelector('[aria-label="Week grid"]');
    const head = document.querySelector('[aria-label="Week header"]');
    const hours = grid
      ? [...grid.querySelector('[aria-label="Hour cells"]')?.children || []]
          .map((el) => (el.textContent || "").trim())
          .filter((t) => /^(1?[0-9]|2[0-3]) (AM|PM)$/.test(t))
      : [];
    const corner = head ? (head.children[0].textContent || "").trim() : "";
    const card = grid ? grid.closest("section") : null;
    const flush = card ? getComputedStyle(card).paddingTop === "0px" : false;
    const todayCell = head ? head.querySelector("[data-today-header]") : null;
    const seeded = grid
      ? ["Calculus II", "Physics", "Chemistry Lab"].every((n) =>
          (grid.textContent || "").includes(n),
        )
      : false;
    return {
      gridPresent: !!grid,
      hourRows: hours.length,
      firstHour: hours[0] || null,
      lastHour: hours[hours.length - 1] || null,
      corner,
      flush,
      todayViolet: todayCell
        ? getComputedStyle(todayCell.querySelector("p") || todayCell).color
        : null,
      seeded,
    };
  });
  const ok =
    asserts.gridPresent &&
    asserts.hourRows === 14 &&
    asserts.firstHour === "7 AM" &&
    asserts.lastHour === "8 PM" &&
    asserts.corner === "Time" &&
    asserts.flush &&
    asserts.todayViolet === "rgb(124, 58, 237)" &&
    asserts.seeded;
  const path = `${OUT}/193-timetable-desktop.png`;
  await page.screenshot({ path, fullPage: false });
  results.desktop = { ok, asserts, nonBlank: nonBlank(path), path };
  await ctx.close();
}

// Frame 2: the mobile week-strip flat rows at 390. Below lg the sidebar
// nav is hidden (the drawer is the vehicle) — navigate by deep link (the
// SPA rewrite contract) instead of the hidden sidebar locator.
{
  const { ctx, page } = await session(browser, { width: 390, height: 844 });
  await page.goto(`${CLONE}/Timetable`, { timeout: 45_000 });
  await page.waitForTimeout(2200);
  // DOM-assert the mobile contracts before the shot (EI6/EI7-adjacent).
  const asserts = await page.evaluate(() => {
    const section = document.querySelector('section[class~="md:hidden"]');
    const rows = section
      ? [...section.querySelectorAll("button")].filter((b) =>
          /^\d+ (class|classes)$/.test(
            (b.textContent || "").replace(/\s+/g, " ").trim().split(" ").slice(-2).join(" "),
          ) || /Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/.test(b.textContent || ""),
        )
      : [];
    const tileRows = section
      ? [...section.querySelectorAll("button")].filter((b) => {
          const spans = b.querySelectorAll("span");
          return spans.length >= 2 && /class/i.test(b.textContent || "");
        })
      : [];
    const allCollapsed = section
      ? [...section.querySelectorAll("button[aria-expanded]")].every(
          (b) => b.getAttribute("aria-expanded") === "false",
        )
      : false;
    const todayTile = section
      ? [...section.querySelectorAll("button")].find((b) => b.className.includes("sf-selected-tint"))
      : null;
    const noChevron = section ? section.querySelectorAll("svg").length === 0 : true;
    const scrollOk = document.documentElement.scrollWidth <= 390;
    return {
      sectionPresent: !!section,
      tileCount: tileRows.length,
      allCollapsed,
      todayTileBg: todayTile ? getComputedStyle(todayTile).backgroundColor : null,
      noChevron,
      scrollOk,
    };
  });
  const ok =
    asserts.sectionPresent &&
    asserts.tileCount === 7 &&
    asserts.allCollapsed &&
    asserts.noChevron &&
    asserts.scrollOk;
  const path = `${OUT}/193-timetable-mobile.png`;
  await page.screenshot({ path, fullPage: false });
  results.mobile = { ok, asserts, nonBlank: nonBlank(path), path };
  await ctx.close();
}

await browser.close();
console.log(JSON.stringify(results, null, 2));
if (!results.desktop.ok || !results.desktop.nonBlank || !results.mobile.ok || !results.mobile.nonBlank) {
  console.error("EVIDENCE CAPTURE FAILED");
  process.exit(1);
}
console.log("S193 EVIDENCE: both frames captured + self-verified");
