// S184 reference micro-probe 3 — the full CTA shadow + the Flashcards
// "Select a deck" anatomy + the RESIDUE CLEANUP (the S135 parity-probe task
// + the S79 probe deck — the zero-residue doctrine) + the post-cleanup Tasks
// empty state.
// Usage: REF_PROBE_EMAIL=… REF_PROBE_PASSWORD=… node scripts/ref-probe-s184-empty3.mjs
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

  // ---- the full CTA shadow (Assignments) ----
  await page.locator("nav a").filter({ hasText: "Assignments" }).first().click({ timeout: 15_000 });
  await page.waitForTimeout(1800);
  out.ctaFullShadow = await page.evaluate(() => {
    const main = document.querySelector("main");
    const btn = main && [...main.querySelectorAll("button")].find((b) => /add assignment/i.test((b.textContent || "")));
    return btn ? getComputedStyle(btn).boxShadow : null;
  });

  // ---- the Flashcards "Select a deck" empty anatomy ----
  await page.locator("nav a").filter({ hasText: "Flashcards" }).first().click({ timeout: 15_000 });
  await page.waitForTimeout(2000);
  out.flashcardsSelectADeck = await page.evaluate(() => {
    const main = document.querySelector("main");
    const wrapper = [...(main || document).querySelectorAll("div")].find((el) =>
      (el.className || "").includes("w-20") && (el.className || "").includes("mb-6"));
    const container = wrapper ? wrapper.parentElement : null;
    if (!container) return null;
    return {
      containerClass: container.className,
      children: [...container.children].map((el) => ({
        tag: el.tagName,
        cls: (el.className || "").toString().slice(0, 110),
        text: (el.textContent || "").trim().slice(0, 50),
      })),
    };
  });

  // ---- cleanup 1: the S135 parity-probe task ----
  await page.locator("nav a").filter({ hasText: "Tasks" }).first().click({ timeout: 15_000 });
  await page.waitForTimeout(1800);
  const taskRow = page.locator("main div").filter({ hasText: /S135 parity probe task/i }).last();
  out.taskFound = (await page.locator("main").filter({ hasText: "S135 parity probe task" }).count()) > 0;
  if (out.taskFound) {
    // hover the row to reveal hover actions, then the trash button
    await taskRow.hover().catch(() => {});
    await page.waitForTimeout(600);
    const trash = page.locator("main button:has(svg.lucide-trash2)").first();
    if ((await trash.count()) > 0) {
      await trash.click({ timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(800);
      out.taskDeletedViaRowTrash = true;
    } else {
      // the row may carry an ellipsis menu
      const ell = page.locator("main button:has(svg.lucide-ellipsis)").first();
      if ((await ell.count()) > 0) {
        await ell.click({ timeout: 5000 }).catch(() => {});
        await page.waitForTimeout(700);
        const del = page.locator("[role=menu] [role=menuitem]").filter({ hasText: /delete/i }).first();
        if ((await del.count()) > 0) { await del.click({ timeout: 5000 }).catch(() => {}); out.taskDeletedViaMenu = true; }
      }
    }
    await page.waitForTimeout(1200);
  }
  out.tasksAfterCleanup = await page.evaluate(() =>
    (document.querySelector("main")?.innerText || "").replace(/\s+/g, " ").slice(0, 220));

  // ---- cleanup 2: the S79 probe deck ----
  await page.locator("nav a").filter({ hasText: "Flashcards" }).first().click({ timeout: 15_000 });
  await page.waitForTimeout(2000);
  const deckRow = page.locator("main button").filter({ hasText: /S79 Probe Deck/i }).first();
  out.deckFound = (await deckRow.count()) > 0;
  if (out.deckFound) {
    await deckRow.hover().catch(() => {});
    await page.waitForTimeout(800);
    // the deck row's hover controls (trash or ellipsis)
    const controls = page.locator("main button:has(svg.lucide-trash2), main button:has(svg.lucide-ellipsis), main button:has(svg.lucide-more-horizontal)");
    out.deckControlCount = await controls.count();
    const shot = await page.screenshot({ fullPage: false });
    writeFileSync("docs/probe-evidence/s184/deck-row-debug.png", shot);
    for (let i = 0; i < await controls.count(); i++) {
      const c = controls.nth(i);
      if (await c.isVisible().catch(() => false)) {
        await c.click({ timeout: 4000 }).catch(() => {});
        await page.waitForTimeout(800);
        // a confirm dialog or menu may have opened
        const confirm = page.locator("[role=alertdialog] button, [role=dialog] button, [role=menu] [role=menuitem]").filter({ hasText: /delete|remove/i }).last();
        if ((await confirm.count()) > 0) {
          await confirm.click({ timeout: 5000 }).catch(() => {});
          await page.waitForTimeout(1000);
          out.deckDeleted = true;
          break;
        }
      }
    }
  }
  out.flashcardsAfterCleanup = await page.evaluate(() =>
    (document.querySelector("main")?.innerText || "").replace(/\s+/g, " ").slice(0, 260));

  // ---- the post-cleanup Tasks empty state ----
  await page.locator("nav a").filter({ hasText: "Tasks" }).first().click({ timeout: 15_000 });
  await page.waitForTimeout(1800);
  out.tasksEmptyAfterCleanup = await page.evaluate(() => {
    const main = document.querySelector("main");
    const wrapper = [...(main || document).querySelectorAll("div")].find((el) =>
      (el.className || "").includes("w-20") && (el.className || "").includes("mb-6"));
    const container = wrapper ? wrapper.parentElement : null;
    return container ? {
      containerClass: container.className,
      children: [...container.children].map((el) => ({
        tag: el.tagName,
        cls: (el.className || "").toString().slice(0, 110),
        text: (el.textContent || "").trim().slice(0, 50),
      })),
    } : (main?.innerText || "").replace(/\s+/g, " ").slice(0, 200);
  });
} catch (err) {
  console.error("PROBE3-FAIL:", String(err).slice(0, 400));
  process.exitCode = 1;
} finally {
  await browser.close();
}
writeFileSync("docs/probe-evidence/s184/ref-empty-cleanup.json", JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 1).slice(0, 3000));
