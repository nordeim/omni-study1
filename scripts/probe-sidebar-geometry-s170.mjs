// S170 one-shot probe — desktop sidebar geometry, both hosts.
// Re-derives the s141 formal probe's navWidth check with full detail:
// border widths, box-sizing, offsetWidth vs computed width, so the
// 258-vs-260 divergence is characterized precisely.
import { chromium } from "playwright";

const REF = "https://omni-study1.base44.app";
const CLONE = "http://localhost:3000";

const PROBE = `(() => {
  let nav = document.querySelector("nav") || document.querySelector("aside");
  if (!nav) {
    // Fallback: the widest left-anchored column before main (the shell's
    // sidebar even when it is a plain div).
    const main = document.querySelector("main");
    if (main) {
      let best = null;
      for (const el of document.body.querySelectorAll("div, section")) {
        const r = el.getBoundingClientRect();
        if (r.x === 0 && r.width > 150 && r.width < 400 && r.right <= main.getBoundingClientRect().x + 2) {
          if (!best || r.width < best.getBoundingClientRect().width) best = el;
        }
      }
      nav = best;
    }
  }
  if (!nav) return JSON.stringify({ nav: null, bodyClass: document.body.className.slice(0, 80), hasMain: !!document.querySelector("main") });
  const cs = getComputedStyle(nav);
  const r = nav.getBoundingClientRect();
  // The first inner container (the visual shell) + the first nav link row.
  const inner = nav.firstElementChild;
  const ics = inner ? getComputedStyle(inner) : null;
  const ir = inner ? inner.getBoundingClientRect() : null;
  const firstLink = nav.querySelector("a");
  const fl = firstLink ? firstLink.getBoundingClientRect() : null;
  return JSON.stringify({
    tag: nav.tagName,
    width: cs.width,
    offsetWidth: nav.offsetWidth,
    rectWidth: Math.round(r.width * 100) / 100,
    rectX: Math.round(r.x * 100) / 100,
    borderLeft: cs.borderLeftWidth,
    borderRight: cs.borderRightWidth,
    boxSizing: cs.boxSizing,
    innerWidth: ics ? ics.width : null,
    innerOffsetWidth: inner ? inner.offsetWidth : null,
    innerBorderL: ics ? ics.borderLeftWidth : null,
    innerBorderR: ics ? ics.borderRightWidth : null,
    innerRectX: ir ? Math.round(ir.x * 100) / 100 : null,
    innerRectW: ir ? Math.round(ir.width * 100) / 100 : null,
    firstLinkX: fl ? Math.round(fl.x * 100) / 100 : null,
    mainX: (() => { const m = document.querySelector("main"); return m ? Math.round(m.getBoundingClientRect().x * 100) / 100 : null; })(),
  });
})()`;

async function probe(browser, base, creds) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${base}/login`);
  await page.fill("input[type=email]", creds.email);
  await page.fill("input[type=password]", creds.password);
  await page.click("button[type=submit]");
  await page.waitForFunction(() => document.querySelector("main") !== null, null, { timeout: 30000 });
  await page.waitForTimeout(2000);
  const result = JSON.parse(await page.evaluate(PROBE));
  await ctx.close();
  return result;
}

const browser = await chromium.launch();
const reference = await probe(browser, REF, {
  email: process.env.REF_PROBE_EMAIL,
  password: process.env.REF_PROBE_PASSWORD,
});
const clone = await probe(browser, CLONE, { email: "demo@studyflow.app", password: "Demo1234!" });
await browser.close();
console.log(JSON.stringify({ reference, clone }, null, 2));
