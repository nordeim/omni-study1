// S184 reference probe 2 — the residue cleanup + the unmeasured views.
// Finds: (1) the leftover S79-era flashcard deck (delete via the UI — the
// zero-residue doctrine), (2) the Flashcards empty state at true zero,
// (3) what Tasks/Calendar/Events/Timetable/Grade Tracker/Analytics render
// at zero (the no-empty-DOM class), (4) the CTA button's exact computed
// style on the family, (5) the container's exact child order.
// Usage: REF_PROBE_EMAIL=… REF_PROBE_PASSWORD=… node scripts/ref-probe-s184-empty2.mjs
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const REF = "https://omni-study1.base44.app";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const out = {};
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

  // ---- 1. The Flashcards residue census + cleanup via the UI ----
  await page.locator("nav a").filter({ hasText: "Flashcards" }).first().click({ timeout: 15_000 });
  await page.waitForTimeout(2000);
  const decksBefore = await page.evaluate(() =>
    [...document.querySelectorAll("main button, main div")]
      .map((el) => (el.textContent || "").trim())
      .filter((t) => /deck/i.test(t) && t.length < 60),
  );
  out.flashcardsDecksBefore = [...new Set(decksBefore)].slice(0, 10);

  // The deck row's ellipsis/delete path: hover the deck row, open its menu.
  const deckRow = page.locator("main button").filter({ hasText: /deck/i }).first();
  if ((await deckRow.count()) > 0) {
    await deckRow.hover();
    await page.waitForTimeout(600);
    // try the visible trash/ellipsis in the row first
    const trash = deckRow.locator("button:has(svg.lucide-trash2), button:has(svg.lucide-ellipsis), button:has(svg.lucide-more-horizontal)").first();
    let deleted = false;
    if ((await trash.count()) > 0) {
      await trash.click({ timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(700);
      const confirm = page.locator("[role=dialog] button, main button").filter({ hasText: /delete|remove/i }).last();
      if ((await confirm.count()) > 0) {
        await confirm.click({ timeout: 5000 }).catch(() => {});
        await page.waitForTimeout(1000);
        deleted = true;
      }
    }
    out.deckDeleteAttempt = deleted;
    await page.waitForTimeout(1500);
  }

  // ---- 2. The Flashcards empty state at (hopefully) zero ----
  await page.reload({ waitUntil: "domcontentloaded" }).catch(() => {});
  await page.waitForTimeout(2500);
  out.flashcardsZeroDom = await page.evaluate(() => {
    const main = document.querySelector("main") || document.body;
    const txt = main.innerText.replace(/\s+/g, " ").slice(0, 500);
    const blocks = [...main.querySelectorAll("div")];
    const wrapper = blocks.find((el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return r.width >= 60 && r.width <= 200 && cs.display.includes("flex") && el.querySelector(":scope > svg");
    });
    return { text: txt, wrapper: wrapper ? wrapper.className.slice(0, 160) : null };
  });

  // ---- 3. The no-empty-DOM class: what they render at zero ----
  for (const label of ["Tasks", "Calendar", "Events", "Timetable", "Grade Tracker", "Analytics"]) {
    await page.locator("nav a").filter({ hasText: label }).first().click({ timeout: 15_000 });
    await page.waitForTimeout(1800);
    out[label] = await page.evaluate(() => {
      const main = document.querySelector("main") || document.body;
      const centered = [...main.querySelectorAll("div")].filter((el) => {
        const cs = getComputedStyle(el);
        return cs.display.includes("flex") && cs.flexDirection === "column" &&
          cs.textAlign === "center" && cs.paddingTop === "64px";
      }).map((el) => el.className.slice(0, 120));
      const text = main.innerText.replace(/\s+/g, " ").slice(0, 400);
      const empties = [...main.querySelectorAll("h1,h2,h3,p")].map((el) => ({
        tag: el.tagName, text: (el.textContent || "").trim().slice(0, 60),
        cls: el.className.slice(0, 90),
      })).filter((x) => /no |nothing|empty|start|create|add |upload|first|yet|found/i.test(x.text)).slice(0, 8);
      return { centeredContainers: centered.slice(0, 3), emptyTexts: empties, text };
    });
  }

  // ---- 4. The family CTA button's computed style (Assignments) ----
  await page.locator("nav a").filter({ hasText: "Assignments" }).first().click({ timeout: 15_000 });
  await page.waitForTimeout(1800);
  out.ctaButton = await page.evaluate(() => {
    const main = document.querySelector("main");
    const btn = main && [...main.querySelectorAll("button")].find((b) => /add assignment/i.test((b.textContent || "")));
    if (!btn) return null;
    const cs = getComputedStyle(btn);
    const r = btn.getBoundingClientRect();
    return {
      class: btn.className.slice(0, 220),
      bg: cs.backgroundImage.slice(0, 160) || cs.backgroundColor,
      h: Math.round(r.height), w: Math.round(r.width),
      pad: { x: cs.paddingLeft, y: cs.paddingTop },
      font: { size: cs.fontSize, weight: cs.fontWeight },
      shadow: cs.boxShadow.slice(0, 120),
      radius: cs.borderRadius,
    };
  });

  // ---- 5. The container's exact child order (Assignments) ----
  out.containerChildren = await page.evaluate(() => {
    const main = document.querySelector("main");
    const wrapper = [...(main || document).querySelectorAll("div")].find((el) =>
      (el.className || "").includes("w-20") && (el.className || "").includes("mb-6"));
    let container = wrapper ? wrapper.parentElement : null;
    if (!container) return null;
    return [...container.children].map((el) => ({
      tag: el.tagName,
      cls: (el.className || "").toString().slice(0, 90),
      text: (el.textContent || "").trim().slice(0, 40),
    }));
  });

  // ---- final residue census across the data views ----
  const residue = {};
  for (const label of ["Tasks", "Notes", "Flashcards", "Practice Tests", "Study Groups", "Files", "Events", "Calendar", "Assignments", "Exams", "Timetable"]) {
    await page.locator("nav a").filter({ hasText: label }).first().click({ timeout: 15_000 });
    await page.waitForTimeout(900);
    residue[label] = await page.evaluate(() => {
      const main = document.querySelector("main");
      const t = (main?.innerText || "").replace(/\s+/g, " ");
      return /no (tasks|notes|decks|tests|groups|files|events|items) (yet|found)|no upcoming|nothing here|create your first|add your first|upload your first/i.test(t) ? "EMPTY" : "HAS-DATA";
    });
  }
  out.finalResidue = residue;
} catch (err) {
  console.error("PROBE2-FAIL:", String(err).slice(0, 400));
  process.exitCode = 1;
} finally {
  await browser.close();
}
writeFileSync("docs/probe-evidence/s184/ref-empty-followup.json", JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 1).slice(0, 3500));
