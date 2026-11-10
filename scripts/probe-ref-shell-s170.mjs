// S170 one-shot probe — the reference app-shell parent chain (why 258@x=1).
// Dumps the nav's ancestor chain with geometry + class so the 2px shell
// change is characterized at its source (border strip? container border?
// scrollbar gutter?) before any clone-side decision.
import { chromium } from "playwright";

const REF = "https://omni-study1.base44.app";

const PROBE = `(() => {
  const nav = document.querySelector("nav");
  if (!nav) return JSON.stringify({ nav: null });
  const chain = [];
  let el = nav;
  for (let i = 0; el && i < 6; i++) {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    chain.push({
      tag: el.tagName,
      cls: String(el.className || "").slice(0, 120),
      x: Math.round(r.x * 100) / 100,
      w: Math.round(r.width * 100) / 100,
      right: Math.round(r.right * 100) / 100,
      display: cs.display,
      borderL: cs.borderLeftWidth,
      borderR: cs.borderRightWidth,
      marginL: cs.marginLeft,
      paddingL: cs.paddingLeft,
      overflow: cs.overflow,
    });
    el = el.parentElement;
  }
  const html = document.documentElement, body = document.body;
  const hcs = getComputedStyle(html), bcs = getComputedStyle(body);
  const firstNav = document.querySelector("nav");
  const prev = firstNav ? firstNav.previousElementSibling : null;
  return JSON.stringify({
    chain,
    htmlMargin: hcs.margin, bodyMargin: bcs.margin,
    htmlOverflow: hcs.overflow, bodyOverflowX: bcs.overflowX,
    docScrollW: html.scrollWidth, clientW: html.clientWidth,
    prevSibling: prev ? { tag: prev.tagName, cls: String(prev.className || "").slice(0, 80), x: Math.round(prev.getBoundingClientRect().x * 100) / 100, w: Math.round(prev.getBoundingClientRect().width * 100) / 100 } : null,
    mainX: (() => { const m = document.querySelector("main"); return m ? Math.round(m.getBoundingClientRect().x * 100) / 100 : null; })(),
    mainW: (() => { const m = document.querySelector("main"); return m ? Math.round(m.getBoundingClientRect().width * 100) / 100 : null; })(),
  });
})()`;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(`${REF}/login`);
await page.fill("input[type=email]", process.env.REF_PROBE_EMAIL);
await page.fill("input[type=password]", process.env.REF_PROBE_PASSWORD);
await page.click("button[type=submit]");
await page.waitForFunction(() => document.querySelector("main") !== null, null, { timeout: 30000 });
await page.waitForTimeout(2500);
console.log(await page.evaluate(PROBE));
await ctx.close();
await browser.close();
