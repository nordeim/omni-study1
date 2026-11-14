// S184 micro-probe 4 — the reference Flashcards SIDEBAR empty anatomy (the
// w-80 pane's own "No decks yet" block — the one family surface the clone's
// two-pane split renders differently), plus the reference Notes zero-DOM
// structure (which pane owns the family empty).
// Usage: REF_PROBE_EMAIL=… REF_PROBE_PASSWORD=… node scripts/ref-probe-s184-empty4.mjs
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

  // ---- Flashcards: the sidebar's empty anatomy ----
  await page.locator("nav a").filter({ hasText: "Flashcards" }).first().click({ timeout: 15_000 });
  await page.waitForTimeout(2000);
  out.flashcardsSidebarEmpty = await page.evaluate(() => {
    const main = document.querySelector("main");
    const aside = main?.querySelector("aside") ||
      [...(main || document).querySelectorAll("div")].find((el) => (el.className || "").includes("w-80"));
    if (!aside) return { aside: false };
    const wrapper = [...aside.querySelectorAll("div")].find((el) =>
      (el.className || "").includes("rounded-2xl") && el.querySelector(":scope > svg"));
    const container = wrapper ? wrapper.parentElement : null;
    return {
      asideClass: (aside.className || "").slice(0, 120),
      asideW: Math.round(aside.getBoundingClientRect().width),
      wrapperClass: wrapper ? wrapper.className.slice(0, 150) : null,
      containerClass: container ? container.className.slice(0, 150) : null,
      children: container ? [...container.children].map((el) => ({
        tag: el.tagName,
        cls: (el.className || "").toString().slice(0, 100),
        text: (el.textContent || "").trim().slice(0, 45),
      })) : null,
      sidebarText: (aside.innerText || "").replace(/\s+/g, " ").slice(0, 200),
    };
  });

  // ---- Notes: which pane owns the family empty at zero ----
  await page.locator("nav a").filter({ hasText: "Notes" }).first().click({ timeout: 15_000 });
  await page.waitForTimeout(2000);
  out.notesZero = await page.evaluate(() => {
    const main = document.querySelector("main");
    const wrapper = [...(main || document).querySelectorAll("div")].find((el) =>
      (el.className || "").includes("w-20") && (el.className || "").includes("mb-6"));
    let c = wrapper ? wrapper.parentElement : null;
    const chain = [];
    let el = c;
    for (let i = 0; i < 5 && el; i++) {
      chain.push({ tag: el.tagName, cls: (el.className || "").toString().slice(0, 90) });
      el = el.parentElement;
    }
    return {
      found: !!wrapper,
      containerClass: c ? c.className.slice(0, 140) : null,
      ancestorChain: chain,
      mainText: (main?.innerText || "").replace(/\s+/g, " ").slice(0, 300),
    };
  });
} catch (err) {
  console.error("PROBE4-FAIL:", String(err).slice(0, 400));
  process.exitCode = 1;
} finally {
  await browser.close();
}
writeFileSync("docs/probe-evidence/s184/ref-flashcards-notes.json", JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 1).slice(0, 2600));
