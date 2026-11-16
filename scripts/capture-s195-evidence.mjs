// S195 evidence capture — the self-verifying frames for the analytics +
// gradetracker two-family e2e consolidation (Batch ES), ridden against the
// fresh :3200 standalone (the demo account, read-only surfaces — the four
// moved describes issue ZERO writes, so no fixture cleanup applies). The
// consolidation is a pure test-organization refactor — the frames document
// the CONSOLIDATED FAMILIES' surfaces (the views the 6 moved pins drive):
//   1. 195-analytics-desktop.png — the seeded Analytics view at 1440
//      (S7-D's contract: the four stat cards with the 48px tinted icon
//      blocks violet/blue/green/orange-100, the fraction value + the
//      completion-rate sub) + S127/CB13's seeded "0/6" fraction on the
//      Assignments card
//   2. 195-gradetracker-dialog.png — the Grade Tracker view at 1440 with
//      the create dialog open (S7-E's contract: the award/target/
//      chart-column summary icons at w-8 h-8; S173/DW2's contract: the
//      "Add New Grade" title, the Max Score label, the native date input,
//      the Cancel-before-submit footer order)
//   3. 195-devserver-analytics.png — the dev server :3000 Analytics view
//      (the operator's standing dev-server screenshot request)
//   4. 195-devserver-gradetracker.png — the dev server :3000 GradeTracker
//      view (the second family's surface on the remediated tree)
// Every frame is DOM-asserted BEFORE the shot and pixel-verified non-blank
// after (the standing evidence discipline). The assertions mirror the
// moved pins' own contracts (S7-D/S127/S7-E/S173-DW2) — the family map
// lives in docs/remediation-plan-session195.md.
import { chromium } from "playwright";
import { mkdirSync, statSync } from "node:fs";

const OUT = "docs/screenshots";
mkdirSync(OUT, { recursive: true });

async function session(browser, base, viewport) {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  await page.goto(`${base}/login`, { timeout: 45_000 });
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

// ---- Frame 1: the seeded Analytics view at 1440 (S7-D + S127/CB13) -------
{
  const { ctx, page } = await session(browser, "http://localhost:3200", {
    width: 1440,
    height: 900,
  });
  await page.locator("nav a").filter({ hasText: "Analytics" }).first().click();
  await page.waitForTimeout(2400);
  const asserts = await page.evaluate(() => {
    const stats = document.querySelector('[aria-label="Analytics stats"]');
    const cards = stats ? [...stats.children] : [];
    const labels = ["Tasks Completed", "Assignments", "Focus Time", "Upcoming Exams"];
    const hasAll = labels.every((l) =>
      stats ? stats.textContent.includes(l) : false,
    );
    // S7-D: the first card's icon block is violet-100 at 48px.
    const first = cards[0];
    const icon = first ? first.querySelector("div[class*='w-12']") : null;
    const iconCs = icon ? getComputedStyle(icon) : null;
    const iconRect = icon ? icon.getBoundingClientRect() : null;
    // S127/CB13: the Assignments card carries the seeded "0/6" fraction.
    const fraction = stats ? stats.textContent.includes("0/6") : false;
    // The 7-day chart titles.
    const body = document.body.textContent || "";
    return {
      statsPresent: !!stats,
      cardCount: cards.length,
      hasAllLabels: hasAll,
      iconBg: iconCs ? iconCs.backgroundColor : null,
      iconW: iconRect ? Math.round(iconRect.width) : null,
      fraction06: fraction,
      chartTitles:
        body.includes("Task Activity (Last 7 Days)") &&
        body.includes("Focus Time (Last 7 Days)"),
    };
  });
  const ok =
    asserts.statsPresent &&
    asserts.cardCount === 4 &&
    asserts.hasAllLabels &&
    asserts.iconBg === "rgb(237, 233, 254)" && // violet-100 (measured)
    asserts.iconW === 48 &&
    asserts.fraction06 &&
    asserts.chartTitles;
  await page.screenshot({
    path: `${OUT}/195-analytics-desktop.png`,
    fullPage: false,
  });
  results.analytics = {
    ok,
    asserts,
    nonBlank: nonBlank(`${OUT}/195-analytics-desktop.png`),
  };
  await ctx.close();
}

// ---- Frame 2: the GradeTracker view + the create dialog (S7-E + S173/DW2) -
{
  const { ctx, page } = await session(browser, "http://localhost:3200", {
    width: 1440,
    height: 900,
  });
  await page.locator("nav a").filter({ hasText: "Grade Tracker" }).first().click();
  await page.waitForTimeout(2400);
  // S7-E: the summary icons (award/target/chart-column at w-8 h-8).
  const summaryAsserts = await page.evaluate(() => {
    const summary = document.querySelector('[aria-label="Grade summary"]');
    if (!summary) return { present: false };
    const svgs = [...summary.querySelectorAll("svg")].map((s) => s.getAttribute("class") ?? "");
    const joined = svgs.join(" ");
    const allW8 = svgs.length > 0 && svgs.every((c) => c.includes("h-8") && c.includes("w-8"));
    return {
      present: true,
      award: joined.includes("lucide-award"),
      target: joined.includes("lucide-target"),
      chartColumn: joined.includes("lucide-chart-column"),
      allW8,
    };
  });
  // S173/DW2: open the create dialog and assert its anatomy (never submit).
  await page.getByRole("button", { name: "Add Grade" }).first().click();
  await page.waitForTimeout(900);
  const dlgAsserts = await page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"]');
    if (!dlg) return { visible: false };
    const text = dlg.textContent || "";
    const date = dlg.querySelector("#grade-date");
    const buttons = [...dlg.querySelectorAll("form button")].map((b) =>
      (b.textContent || "").trim(),
    );
    const filtered = buttons.filter((t) => t === "Add Grade" || t === "Cancel");
    const today = new Date();
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
      today.getDate(),
    ).padStart(2, "0")}`;
    return {
      visible: true,
      title: text.includes("Add New Grade"),
      maxScore: text.includes("Max Score"),
      weightHint: text.includes("Weight (optional, default 1)"),
      dateType: date ? date.getAttribute("type") === "date" : false,
      dateDefault: date ? date.value === iso : false,
      footerOrder: filtered.length === 2 && filtered[0] === "Cancel" && filtered[1] === "Add Grade",
    };
  });
  const ok =
    summaryAsserts.present &&
    summaryAsserts.award &&
    summaryAsserts.target &&
    summaryAsserts.chartColumn &&
    summaryAsserts.allW8 &&
    dlgAsserts.visible &&
    dlgAsserts.title &&
    dlgAsserts.maxScore &&
    dlgAsserts.weightHint &&
    dlgAsserts.dateType &&
    dlgAsserts.dateDefault &&
    dlgAsserts.footerOrder;
  await page.screenshot({
    path: `${OUT}/195-gradetracker-dialog.png`,
    fullPage: false,
  });
  // Close the dialog without submitting (read-only discipline).
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);
  results.gradetracker = {
    ok,
    summaryAsserts,
    dlgAsserts,
    nonBlank: nonBlank(`${OUT}/195-gradetracker-dialog.png`),
  };
  await ctx.close();
}

// ---- Frames 3+4: the dev server :3000 (the operator's standing request) ---
for (const [key, nav, file] of [
  ["devserverAnalytics", "Analytics", "195-devserver-analytics.png"],
  ["devserverGradetracker", "Grade Tracker", "195-devserver-gradetracker.png"],
]) {
  const { ctx, page } = await session(browser, "http://localhost:3000", {
    width: 1440,
    height: 900,
  });
  await page.locator("nav a").filter({ hasText: nav }).first().click();
  await page.waitForTimeout(2400);
  const heading = await page.evaluate(() => {
    const h = document.querySelector("h1");
    return h ? h.textContent.trim() : null;
  });
  await page.screenshot({ path: `${OUT}/${file}`, fullPage: false });
  results[key] = {
    ok: heading !== null && nonBlank(`${OUT}/${file}`),
    heading,
    nonBlank: nonBlank(`${OUT}/${file}`),
  };
  await ctx.close();
}

await browser.close();
console.log(JSON.stringify(results, null, 2));
const allOk = Object.values(results).every((r) => r.ok && r.nonBlank);
console.log(allOk ? "S195 EVIDENCE: ALL FRAMES GREEN" : "S195 EVIDENCE: FAILURES PRESENT");
process.exitCode = allOk ? 0 : 1;
