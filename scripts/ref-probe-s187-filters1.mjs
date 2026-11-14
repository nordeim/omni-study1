// S187 reference probe 1 — the FILTER-ROW anatomy below the header on
// Assignments + Exams (the S186 §6.6 recorded drift: the reference's
// selects render in a separate row BELOW the header, not bundled in the
// toolbar). Never measured before. Also re-measures the Tasks toolbar
// search width (the S186 107px mobile record) and records the account's
// theme mode at open (the S186 dark-mode discovery constraint: every
// probe records the mode it rode).
// Usage (node >= 23.6 — bun INCOMPATIBLE):
//   REF_PROBE_EMAIL=… REF_PROBE_PASSWORD=… node scripts/ref-probe-s187-filters1.mjs
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const REF = "https://omni-study1.base44.app";
const OUT = "docs/probe-evidence/s187";
mkdirSync(OUT, { recursive: true });

// The filter-row finder: walk down from the h1's header row and inspect
// the SIBLING blocks below it that carry form controls (input/select/
// button triggers). The reference renders the selects in a separate row.
const FILTERS = `(() => {
  const main = document.querySelector("main") || document.body;
  const h1 = main.querySelector("h1, h2");
  if (!h1) return JSON.stringify({ err: "no-h1" });
  // The header row: the closest flex ancestor of the h1 (the S186 family).
  let header = h1.parentElement;
  for (let i = 0; i < 4 && header && header !== main; i++) {
    if (getComputedStyle(header).display === "flex") break;
    header = header.parentElement;
  }
  // Walk UP from the header to the view content block, then inspect the
  // next 3 element siblings of the header inside the same parent.
  const parent = header ? header.parentElement : null;
  const rows = [];
  if (parent) {
    let sib = header.nextElementSibling;
    let n = 0;
    while (sib && n < 3) {
      const cs = getComputedStyle(sib);
      const controls = [...sib.querySelectorAll("input, select, button, [role=combobox]")].filter(el => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && getComputedStyle(el).visibility !== "hidden";
      });
      rows.push({
        tag: sib.tagName,
        cls: (sib.className || "").toString().slice(0, 140),
        display: cs.display,
        dir: cs.flexDirection,
        wrap: cs.flexWrap,
        gap: cs.gap,
        items: cs.alignItems,
        h: Math.round(sib.getBoundingClientRect().height),
        mt: cs.marginTop,
        controlCount: controls.length,
        kids: [...sib.children].map(k => ({
          tag: k.tagName,
          cls: (k.className || "").toString().slice(0, 90),
          w: Math.round(k.getBoundingClientRect().width),
          text: (k.textContent || "").trim().replace(/\\s+/g, " ").slice(0, 40),
        })),
      });
      sib = sib.nextElementSibling;
      n++;
    }
  }
  const hcs = header ? getComputedStyle(header) : null;
  return JSON.stringify({
    headerCls: header ? (header.className || "").toString().slice(0, 130) : null,
    headerDir: hcs ? hcs.flexDirection : null,
    siblings: rows,
  });
})()`;

// The Tasks toolbar search width (the S186 record: flex-1 md:w-64, 107 at
// mobile / 256 at desktop).
const TASKS_SEARCH = `(() => {
  const main = document.querySelector("main") || document.body;
  const input = [...main.querySelectorAll("input")].find(i => (i.placeholder || "").toLowerCase().includes("search"));
  if (!input) return JSON.stringify({ err: "no-search-input" });
  const wrap = input.closest("div");
  const r = input.getBoundingClientRect();
  const wr = wrap ? wrap.getBoundingClientRect() : null;
  return JSON.stringify({
    placeholder: input.placeholder,
    inputW: Math.round(r.width),
    inputH: Math.round(r.height),
    wrapCls: wrap ? (wrap.className || "").toString().slice(0, 120) : null,
    wrapW: wr ? Math.round(wr.width) : null,
  });
})()`;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(`${REF}/login`);
await page.fill("input[type=email]", process.env.REF_PROBE_EMAIL);
await page.fill("input[type=password]", process.env.REF_PROBE_PASSWORD);
await page.waitForFunction(() => { const b = document.querySelector("button[type=submit]"); return b && !b.disabled; }, null, { timeout: 15_000 });
await page.click("button[type=submit]");
await page.waitForFunction(() => document.querySelector("nav a") !== null && (document.querySelector("h1") || document.querySelector("h2")), null, { timeout: 30_000 });
await page.waitForTimeout(1500);

// The mode this probe rode (the S186 constraint).
const mode = await page.evaluate(() => ({
  htmlClass: document.documentElement.className,
  bodyBg: getComputedStyle(document.body).backgroundColor,
}));

const out = { mode, desktop: {}, mobile: {} };
for (const view of ["Assignments", "Exams", "Tasks"]) {
  await page.goto(`${REF}/${view}`);
  await page.waitForTimeout(2200);
  out.desktop[view] = JSON.parse(await page.evaluate(FILTERS));
  if (view === "Tasks") out.desktop.TasksSearch = JSON.parse(await page.evaluate(TASKS_SEARCH));
}
await page.setViewportSize({ width: 390, height: 844 });
for (const view of ["Assignments", "Exams", "Tasks"]) {
  await page.goto(`${REF}/${view}`);
  await page.waitForTimeout(2200);
  out.mobile[view] = JSON.parse(await page.evaluate(FILTERS));
  if (view === "Tasks") out.mobile.TasksSearch = JSON.parse(await page.evaluate(TASKS_SEARCH));
}
await ctx.close();
await browser.close();
writeFileSync(`${OUT}/ref-filter-rows.json`, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
