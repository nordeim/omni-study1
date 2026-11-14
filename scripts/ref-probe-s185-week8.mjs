// S185 reference probe 8 — the EXPANDED mobile row's content (390x844).
// The click test (probe 5) expanded Saturday's row: the card grew 540→668
// and a "No classes" line appeared. Capture the expanded section's exact
// anatomy (the wrapper, the line's tag/classes/fonts) + the ROW WRAPPER
// (the p-4 parent — its border/pad/tint) + confirm the today row carries
// NO row-level tint (pixel-region check via DOM bg reads).
// Usage: REF_PROBE_EMAIL=… REF_PROBE_PASSWORD=… node scripts/ref-probe-s185-week8.mjs
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const REF = "https://omni-study1.base44.app";
const OUT = "docs/probe-evidence/s185";
mkdirSync(OUT, { recursive: true });

const EXPANDED = `(() => {
  const main = document.querySelector("main") || document.body;
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.display !== "none" && cs.visibility !== "hidden";
  };
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const cards = [...main.querySelectorAll("div")].filter((el) => {
    if (!vis(el)) return false;
    const t = el.textContent || "";
    return days.every((d) => t.includes(d)) && (el.className || "").toString().includes("overflow-hidden");
  });
  const card = cards[0];
  if (!card) return JSON.stringify({ present: false });
  // every direct child of the card = a row wrapper
  const wrappers = [...card.children].filter(vis).map((w, i) => {
    const s = getComputedStyle(w);
    const r = w.getBoundingClientRect();
    return {
      i, tag: w.tagName, cls: (w.className || "").toString().slice(0, 110),
      h: Math.round(r.height), pad: { x: s.paddingLeft, y: s.paddingTop },
      bg: s.backgroundColor, border: s.borderBottomWidth + " " + s.borderBottomColor,
      text: (w.textContent || "").trim().slice(0, 26),
    };
  });
  return JSON.stringify({ present: true, cardCls: card.className.toString().slice(0, 100), wrappers });
})()`;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
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
  await page.goto(`${REF}/Timetable`, { timeout: 45_000 });
  await page.waitForFunction(
    () => document.querySelector("h1, h2") !== null && /Timetable/.test(document.body.textContent || ""),
    null, { timeout: 30_000 },
  );
  await page.waitForTimeout(2200);

  // capture the collapsed wrappers first
  const collapsed = JSON.parse(await page.evaluate(EXPANDED));

  // expand Saturday's row (click the tile's name region)
  await page.locator("p").filter({ hasText: /^Saturday$/ }).first().click({ timeout: 8_000 });
  await page.waitForTimeout(1200);
  const expanded = JSON.parse(await page.evaluate(EXPANDED));

  // the expanded content line: the "No classes" text's own anatomy
  const noClasses = await page.evaluate(`(() => {
    const els = [...document.querySelectorAll("p, div, span")].filter((el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && cs.display !== "none" && /^No classes/.test((el.textContent || "").trim());
    });
    return els.map((el) => {
      const s = getComputedStyle(el);
      const p = el.parentElement;
      const ps = p ? getComputedStyle(p) : null;
      return {
        tag: el.tagName, cls: (el.className || "").toString().slice(0, 100),
        text: (el.textContent || "").trim().slice(0, 60),
        font: { size: s.fontSize, weight: s.fontWeight, color: s.color },
        pad: { x: s.paddingLeft, y: s.paddingTop }, mt: s.marginTop, mb: s.marginBottom,
        parentCls: p ? (p.className || "").toString().slice(0, 110) : null,
        parentPad: ps ? { x: ps.paddingLeft, y: ps.paddingTop } : null,
        parentTag: p ? p.tagName : null,
      };
    });
  })()`);
  writeFileSync(`${OUT}/ref-week-mobile-expanded.json`, JSON.stringify({ collapsed, expanded, noClasses }, null, 2));
  console.log("WRAPPERS(collapsed):", JSON.stringify(collapsed.wrappers.map((w) => ({ i: w.i, h: w.h, pad: w.pad, border: w.border, bg: w.bg, cls: w.cls.slice(0, 50) }))));
  console.log("WRAPPERS(expanded):", JSON.stringify(expanded.wrappers.map((w) => ({ i: w.i, h: w.h, text: w.text.slice(0, 22) }))));
  console.log("NO-CLASSES:", JSON.stringify(noClasses));
} catch (err) {
  console.error("PROBE-FAIL:", String(err).slice(0, 500));
  process.exitCode = 1;
} finally {
  await browser.close();
}
