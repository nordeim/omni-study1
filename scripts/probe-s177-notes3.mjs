// S177 probe 3 — debug the draft state visually + the visibility census of
// the title input vs the empty state. Screenshot as ground truth.
import { chromium } from "playwright";
import fs from "node:fs";

const REF = "https://omni-study1.base44.app";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(`${REF}/login`);
await page.fill("input[type=email]", process.env.REF_PROBE_EMAIL);
await page.fill("input[type=password]", process.env.REF_PROBE_PASSWORD);
await page.click("button[type=submit]");
await page.waitForFunction(() => document.querySelector("main") !== null && document.querySelector("nav") !== null, null, { timeout: 30000 });
await page.waitForTimeout(2500);
await page.evaluate(() => {
  const a = [...document.querySelectorAll("nav a")].find((x) => x.textContent.trim().startsWith("Notes"));
  if (a) a.click();
});
await page.waitForTimeout(2500);
await page.screenshot({ path: "/tmp/s177-notes-before.png" });

await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find((el) => {
    const t = (el.textContent || "").replace(/\s+/g, " ").trim();
    return /^new note$/i.test(t);
  });
  if (b) b.click();
});
await page.waitForTimeout(1800);
await page.screenshot({ path: "/tmp/s177-notes-draft.png" });

const state = await page.evaluate(() => {
  const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden' && cs.opacity !== '0'; };
  const main = document.querySelector("main");
  const titleInput = main.querySelector("input[placeholder*='itle'], input[placeholder*='title']");
  const emptyBlock = [...main.querySelectorAll("div")].find((d) => /no notes yet/i.test(d.textContent || "") && d.querySelector("button"));
  return {
    titleInput: titleInput ? {
      placeholder: titleInput.getAttribute("placeholder"),
      visible: vis(titleInput),
      rect: (() => { const r = titleInput.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; })(),
      display: getComputedStyle(titleInput).display,
      ancestorDisplay: (() => { let el = titleInput.parentElement; const chain = []; while (el && chain.length < 6) { chain.push(getComputedStyle(el).display); el = el.parentElement; } return chain; })(),
    } : null,
    emptyBlockStillInDom: !!emptyBlock,
    emptyBlockVisible: emptyBlock ? vis(emptyBlock) : null,
    emptyBlockDisplay: emptyBlock ? getComputedStyle(emptyBlock).display : null,
  };
});
console.log(JSON.stringify(state, null, 1));

// With the state understood, retry the fill via a visible-locator OR evaluate
await ctx.close();
await browser.close();
