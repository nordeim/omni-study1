// S184 micro-probe 6 — cleanup: delete the S184 Probe Deck; on the way,
// capture the deck-detail ZERO-CARDS full anatomy (the last unmeasured
// family surface), then verify TRUE ZERO.
// Usage: REF_PROBE_EMAIL=… REF_PROBE_PASSWORD=… node scripts/ref-probe-s184-empty6.mjs
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

  // select the deck (row click) to render the deck-detail zero-cards state
  const deckRow = page.locator("main div[role=button], main button").filter({ hasText: "S184 Probe Deck" }).first();
  out.deckFound = (await deckRow.count()) > 0;
  if (out.deckFound) {
    await deckRow.click({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(1800);
    out.deckDetailZeroCards = await page.evaluate(() => {
      const main = document.querySelector("main");
      const aside = main?.querySelector("aside") ||
        [...(main || document).querySelectorAll("div")].find((el) => (el.className || "").includes("w-80"));
      const wrapper = [...(main || document).querySelectorAll("div")].find((el) =>
        (el.className || "").includes("w-20") && (el.className || "").includes("mb-6") &&
        (!aside || !aside.contains(el)));
      const container = wrapper ? wrapper.parentElement : null;
      return {
        found: !!wrapper,
        containerClass: container ? container.className.slice(0, 140) : null,
        children: container ? [...container.children].map((el) => ({
          tag: el.tagName,
          cls: (el.className || "").toString().slice(0, 100),
          text: (el.textContent || "").trim().slice(0, 50),
        })) : null,
      };
    });

    // delete: hover the row, ellipsis menu, Delete item
    await deckRow.hover().catch(() => {});
    await page.waitForTimeout(800);
    const ell = page.locator("main button:has(svg.lucide-ellipsis), main button:has(svg.lucide-more-horizontal), main button:has(svg.lucide-more-vertical)").first();
    if ((await ell.count()) > 0) {
      await ell.click({ timeout: 4000 }).catch(() => {});
      await page.waitForTimeout(900);
      const del = page.locator("[role=menu] [role=menuitem]").filter({ hasText: /delete/i }).first();
      out.menuDeleteItemFound = (await del.count()) > 0;
      if (out.menuDeleteItemFound) {
        await del.click({ timeout: 5000 }).catch(() => {});
        await page.waitForTimeout(1200);
      }
    }
    // a confirm dialog may be up
    const confirm = page.locator("[role=alertdialog] button, [role=dialog] button").filter({ hasText: /delete|confirm|remove/i }).last();
    if ((await confirm.count()) > 0) {
      await confirm.click({ timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(1200);
    }
  }
  out.flashcardsFinalText = await page.evaluate(() =>
    (document.querySelector("main")?.innerText || "").replace(/\s+/g, " ").slice(0, 220));
} catch (err) {
  console.error("PROBE6-FAIL:", String(err).slice(0, 400));
  process.exitCode = 1;
} finally {
  await browser.close();
}
writeFileSync("docs/probe-evidence/s184/ref-deck-cleanup.json", JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 1).slice(0, 2400));
