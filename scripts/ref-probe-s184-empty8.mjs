// S184 micro-probe 8 — the family's CONTAINER PLACEMENT: does the reference
// render each view's empty state BARE in the view content or inside a card?
// The clone's assignments/exams/studygroups/tasks/timetable empties ride an
// sf-card wrapper; the S7-P pin already proved Practice Tests bare.
// Usage: REF_PROBE_EMAIL=… REF_PROBE_PASSWORD=… node scripts/ref-probe-s184-empty8.mjs
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

  for (const label of ["Tasks", "Assignments", "Exams", "Notes", "Practice Tests", "Study Groups", "Files", "Timetable"]) {
    await page.locator("nav a").filter({ hasText: label }).first().click({ timeout: 15_000 });
    await page.waitForTimeout(1800);
    out[label] = await page.evaluate(() => {
      const main = document.querySelector("main");
      const wrapper = [...(main || document).querySelectorAll("div")].find((el) =>
        (el.className || "").includes("w-20") && (el.className || "").includes("mb-6"));
      const container = wrapper ? wrapper.parentElement : null;
      if (!container) return { found: false };
      // walk up: card-ish ancestors (bg-white + border + rounded + shadow)?
      const chain = [];
      let el = container.parentElement;
      for (let i = 0; i < 6 && el && el !== document.body; i++) {
        const cs = getComputedStyle(el);
        chain.push({
          tag: el.tagName,
          cls: (el.className || "").toString().slice(0, 70),
          cardish: cs.backgroundColor === "rgb(255, 255, 255)" && cs.borderTopWidth !== "0px",
        });
        el = el.parentElement;
      }
      return { found: true, chain };
    });
  }
} catch (err) {
  console.error("PROBE8-FAIL:", String(err).slice(0, 400));
  process.exitCode = 1;
} finally {
  await browser.close();
}
writeFileSync("docs/probe-evidence/s184/ref-empty-placement.json", JSON.stringify(out, null, 2));
for (const [k, v] of Object.entries(out)) {
  console.log(`=== ${k} ===`);
  console.log(JSON.stringify(v.chain?.map((c) => `${c.tag}.${c.cls.slice(0, 40)}${c.cardish ? " [CARD]" : ""}`)));
}
