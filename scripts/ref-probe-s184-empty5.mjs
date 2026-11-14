// S184 micro-probe 5 — the reference deck-detail ZERO-CARDS state (create a
// disposable deck via the UI, capture the empty anatomy, delete it — the
// zero-residue discipline holds; deck create is NOT the 402-blocked upload
// endpoint).
// Usage: REF_PROBE_EMAIL=… REF_PROBE_PASSWORD=… node scripts/ref-probe-s184-empty5.mjs
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

  // open the create-deck dialog via the sidebar empty's Create Deck button
  const createBtn = page.locator("main button").filter({ hasText: "Create Deck" }).first();
  out.createBtnVisible = await createBtn.count();
  await createBtn.click({ timeout: 5000 });
  await page.waitForTimeout(800);

  // fill the dialog's name input and submit
  const nameInput = page.locator("[role=dialog] input").first();
  if ((await nameInput.count()) > 0) {
    await nameInput.fill("S184 Probe Deck");
    const submit = page.locator("[role=dialog] button").filter({ hasText: /create|save|add/i }).first();
    await submit.click({ timeout: 5000 });
    await page.waitForTimeout(1800);
  }

  // capture the deck-detail zero-cards state
  out.deckDetailZeroCards = await page.evaluate(() => {
    const main = document.querySelector("main");
    // the detail pane is everything NOT in the aside
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
      detailText: (() => {
        if (!aside) return "";
        const els = [...((main || document).querySelectorAll("div"))]
          .filter((el) => el.childElementCount > 0 && !aside.contains(el))
          .map((el) => (el.textContent || "").trim())
          .filter((t) => t.length > 10);
        return (els.slice(-1)[0] || "").replace(/\s+/g, " ").slice(0, 300);
      })(),
    };
  });

  // delete the deck (zero residue) — select it, use the row's ellipsis > Delete
  const deckRow = page.locator("main button, main div[role=button]").filter({ hasText: "S184 Probe Deck" }).first();
  out.deckRowFound = (await deckRow.count()) > 0;
  if (out.deckRowFound) {
    await deckRow.hover().catch(() => {});
    await page.waitForTimeout(700);
    const ell = page.locator("main button:has(svg.lucide-ellipsis), main button:has(svg.lucide-more-horizontal)").first();
    if ((await ell.count()) > 0) {
      await ell.click({ timeout: 4000 }).catch(() => {});
      await page.waitForTimeout(800);
      const del = page.locator("[role=menu] [role=menuitem]").filter({ hasText: /delete/i }).first();
      if ((await del.count()) > 0) { await del.click({ timeout: 5000 }).catch(() => {}); out.deckDeleted = true; }
    }
    await page.waitForTimeout(1500);
  }
  out.flashcardsFinalText = await page.evaluate(() =>
    (document.querySelector("main")?.innerText || "").replace(/\s+/g, " ").slice(0, 200));
} catch (err) {
  console.error("PROBE5-FAIL:", String(err).slice(0, 400));
  process.exitCode = 1;
} finally {
  await browser.close();
}
writeFileSync("docs/probe-evidence/s184/ref-deck-detail-zero.json", JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 1).slice(0, 2400));
