// S184 micro-probe 7 — the final zero-residue cleanup: delete the
// S184 Probe Deck via the probe-3 path (hover the row, click the first
// visible trash/ellipsis control, confirm in the dialog), then the
// account-wide zero census.
// Usage: REF_PROBE_EMAIL=… REF_PROBE_PASSWORD=… node scripts/ref-probe-s184-empty7.mjs
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const REF = "https://omni-study1.base44.app";
const out = {};

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
try {
  await page.goto(`${REF}/login`, { timeout: 45_000 });
  await page.fill("input[type=email]", process.env.REF_PROBE_EMAIL);
  await page.fill("input[type=password]", process.env.REF_PROBE_PASSWORD);
  await page.waitForFunction(() => { const b = document.querySelector("button[type=submit]"); return b && !b.disabled; }, null, { timeout: 15_000 });
  await page.click("button[type=submit]");
  await page.waitForFunction(() => document.querySelector("nav a") !== null && document.querySelector("h1, h2") !== null, null, { timeout: 30_000 });
  await page.waitForTimeout(1500);

  await page.locator("nav a").filter({ hasText: "Flashcards" }).first().click({ timeout: 15_000 });
  await page.waitForTimeout(2000);

  // dump the deck row's controls so the delete path is visible
  out.rowControls = await page.evaluate(() => {
    const main = document.querySelector("main");
    const row = [...(main || document).querySelectorAll("button, div[role=button]")].find((el) =>
      /S184 Probe Deck/i.test((el.textContent || "")) && (el.textContent || "").trim().length < 60);
    if (!row) return null;
    return [...row.querySelectorAll("button, [role=menuitem]")].map((el) => ({
      tag: el.tagName,
      aria: el.getAttribute("aria-label"),
      svg: el.querySelector("svg")?.getAttribute("class")?.slice(0, 60),
      text: (el.textContent || "").trim().slice(0, 25),
      visible: el.getBoundingClientRect().width > 0,
    }));
  });

  // select the row first (probe-3's deck was selected; the controls may be
  // revealed by hover+selection)
  const deckRow = page.locator("main div[role=button], main button").filter({ hasText: "S184 Probe Deck" }).first();
  await deckRow.click({ timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(1000);
  // deck-detail toolbar may carry the delete (the clone's own pattern)
  out.detailToolbar = await page.evaluate(() => {
    const main = document.querySelector("main");
    const aside = main?.querySelector("aside") ||
      [...(main || document).querySelectorAll("div")].find((el) => (el.className || "").includes("w-80"));
    const pane = [...(main || document).querySelectorAll("div")].find((el) =>
      !aside?.contains(el) && (el.textContent || "").includes("S184 Probe Deck") && el.querySelector("button"));
    return pane ? [...pane.querySelectorAll("button, [role=menuitem]")].map((el) => ({
      aria: el.getAttribute("aria-label"),
      svg: el.querySelector("svg")?.getAttribute("class")?.slice(0, 60),
      text: (el.textContent || "").trim().slice(0, 25),
    })).slice(0, 12) : null;
  });

  // hover the row, click the first VISIBLE trash/ellipsis control (probe-3 path)
  await deckRow.hover().catch(() => {});
  await page.waitForTimeout(800);
  const controls = page.locator("main button:has(svg.lucide-trash2), main button:has(svg.lucide-ellipsis), main button:has(svg.lucide-more-horizontal), main button:has(svg.lucide-more-vertical)");
  out.controlCount = await controls.count();
  for (let i = 0; i < out.controlCount; i++) {
    const c = controls.nth(i);
    if (await c.isVisible().catch(() => false)) {
      await c.click({ timeout: 4000 }).catch(() => {});
      await page.waitForTimeout(900);
      const confirm = page.locator("[role=alertdialog] button, [role=dialog] button, [role=menu] [role=menuitem]").filter({ hasText: /delete|remove|confirm/i }).last();
      if ((await confirm.count()) > 0) {
        await confirm.click({ timeout: 5000 }).catch(() => {});
        await page.waitForTimeout(1300);
        out.deletedVia = "row-control+confirm";
        break;
      }
    }
  }
  out.flashcardsAfterDelete = await page.evaluate(() =>
    (document.querySelector("main")?.innerText || "").replace(/\s+/g, " ").slice(0, 200));

  // account-wide zero census (the 11 data views)
  const census = {};
  for (const label of ["Tasks", "Notes", "Flashcards", "Practice Tests", "Study Groups", "Files", "Assignments", "Exams", "Events", "Calendar", "Timetable", "Grade Tracker", "Analytics", "My Day"]) {
    await page.locator("nav a").filter({ hasText: label }).first().click({ timeout: 15_000 });
    await page.waitForTimeout(900);
    census[label] = await page.evaluate(() => {
      const t = (document.querySelector("main")?.innerText || "").replace(/\s+/g, " ");
      return /probe|S\d{2,3} |S1[0-9]{2}/i.test(t) ? "RESIDUE!" : "clean";
    });
  }
  out.census = census;
} catch (err) {
  console.error("PROBE7-FAIL:", String(err).slice(0, 400));
  process.exitCode = 1;
} finally {
  await browser.close();
}
writeFileSync("docs/probe-evidence/s184/ref-final-cleanup.json", JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 1).slice(0, 2600));
