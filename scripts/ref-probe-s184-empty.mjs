// S184 reference probe — the shared EmptyState family, re-measured live.
// The reference account sits at TRUE ZERO residue (the S183 close), so every
// view renders its empty state RIGHT NOW — the family's one clean window.
// Per view: the full empty-state anatomy (container classes/padding, the
// gradient wrapper, the icon, the title tag/size/weight/margins, the hint,
// the CTA). Computed styles are ground truth (the repo doctrine).
// Usage (node ≥ 23.6 — bun INCOMPATIBLE):
//   REF_PROBE_EMAIL=… REF_PROBE_PASSWORD=… node scripts/ref-probe-s184-empty.mjs
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const REF = "https://omni-study1.base44.app";
const OUT = "docs/probe-evidence/s184";
mkdirSync(OUT, { recursive: true });

// The 20 nav labels (drawer/sidebar order — measured across 140+ probes).
const VIEWS = [
  "Dashboard", "My Day", "Tasks", "Calendar", "Events", "Timetable",
  "Assignments", "Exams", "Notes", "Flashcards", "Practice Tests",
  "Study Groups", "Grade Tracker", "Analytics", "Files", "Calculator",
  "Math Solver", "AI Assistant", "Focus Timer", "Settings",
];

// One view's empty-state anatomy, read from the live DOM. The detector: a
// centered column that owns an icon-carrying block (rounded, ≥ 40px) and a
// short text block — the shared family's signature. The whole <main> is
// scanned so per-view wrappers (cards, sections) are captured too.
const ANATOMY = `(() => {
  const main = document.querySelector("main") || document.body;
  const blocks = [...main.querySelectorAll("div")];
  // The gradient/icon wrapper: a rounded block >= 40px carrying a single svg.
  const wrapper = blocks.find((el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width >= 40 && r.width <= 200 && cs.display.includes("flex") &&
      el.querySelector(":scope > svg") && !el.querySelector(":scope > svg ~ svg");
  });
  if (!wrapper) return JSON.stringify({ present: false });
  const wcs = getComputedStyle(wrapper);
  const icon = wrapper.querySelector(":scope > svg");
  const ics = icon ? getComputedStyle(icon) : null;
  // The container: the nearest ancestor flex-column with text-center or the
  // wrapper's parent chain up to 3 hops that is NOT full-width.
  let container = wrapper.parentElement;
  for (let i = 0; i < 3 && container; i++) {
    const cs = getComputedStyle(container);
    if (cs.display.includes("flex") && cs.flexDirection === "column") break;
    container = container.parentElement;
  }
  const ccs = container ? getComputedStyle(container) : null;
  // Title/hint: the text siblings following the wrapper inside the container.
  const title = container ? [...container.children].find((el) => /^(H[1-6]|P)$/.test(el.tagName) && (el.textContent || "").trim().length > 2 && el !== wrapper) : null;
  const hint = title ? [...container.children].find((el) => el !== title && el !== wrapper && (el.textContent || "").trim().length > 2) : null;
  const tcs = title ? getComputedStyle(title) : null;
  const hcs = hint ? getComputedStyle(hint) : null;
  const cta = container ? [...container.querySelectorAll("button, a")].filter((el) => (el.textContent || "").trim().length > 1) : [];
  return JSON.stringify({
    present: true,
    wrapperClass: wrapper.className.slice(0, 160),
    wrapperW: Math.round(wrapper.getBoundingClientRect().width),
    wrapperH: Math.round(wrapper.getBoundingClientRect().height),
    wrapperRadius: wcs.borderRadius,
    wrapperBg: wcs.backgroundImage.slice(0, 120) || wcs.backgroundColor,
    wrapperMb: wcs.marginBottom,
    iconSize: ics ? { w: ics.width, color: ics.color } : null,
    iconClass: icon ? (icon.getAttribute("class") || "").slice(0, 80) : null,
    containerTag: container ? container.tagName : null,
    containerClass: container ? container.className.slice(0, 200) : null,
    containerPad: ccs ? { x: ccs.paddingLeft, y: ccs.paddingTop } : null,
    titleTag: title ? title.tagName : null,
    titleClass: title ? title.className.slice(0, 120) : null,
    titleText: title ? title.textContent.trim().slice(0, 60) : null,
    titleSize: tcs ? { font: tcs.fontSize, weight: tcs.fontWeight, mt: tcs.marginTop, mb: tcs.marginBottom, color: tcs.color } : null,
    hintTag: hint ? hint.tagName : null,
    hintClass: hint ? hint.className.slice(0, 120) : null,
    hintText: hint ? hint.textContent.trim().slice(0, 80) : null,
    hintSize: hcs ? { font: hcs.fontSize, mt: hcs.marginTop, color: hcs.color } : null,
    ctaCount: cta.length,
    ctaFirst: cta[0] ? { tag: cta[0].tagName, text: cta[0].textContent.trim().slice(0, 30), class: (cta[0].className || "").slice(0, 100) } : null,
  });
})()`;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
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

  const out = {};
  for (const label of VIEWS) {
    const link = page.locator("nav a").filter({ hasText: label }).first();
    await link.click({ timeout: 15_000 });
    await page.waitForTimeout(1800);
    const probe = JSON.parse(await page.evaluate(ANATOMY));
    out[label] = probe;
    console.log(`${label}: ${probe.present ? "EMPTY-STATE PRESENT" : "no empty-state DOM"}`);
  }
  writeFileSync(`${OUT}/ref-empty-anatomy.json`, JSON.stringify(out, null, 2));
  console.log(JSON.stringify({ ok: true, views: Object.keys(out).length, present: Object.values(out).filter((v) => v.present).length }));
} catch (err) {
  console.error("PROBE-FAIL:", String(err).slice(0, 500));
  process.exitCode = 1;
} finally {
  await browser.close();
}
