// S186 reference probe — the OUTLINE-BUTTON FAMILY, the exploratory census.
// The S185 close's first named candidate: "the outline-button family
// re-rotation (the reference's --background token renders its ENTIRE
// outline family near-black — rgb(10,10,10) + near-white text, the Grid
// Builder measured live; the clone's outline family stays white)".
// This pass censuses EVERY visible button across 10 reference views
// (desktop 1440x900), recording computed bg/color/border/radius/shadow —
// then classifies the near-black family vs gradient vs ghost vs other.
// Zero-residue discipline: navigation only, no dialogs opened, nothing
// created or deleted.
// Usage (node >= 23.6 — bun INCOMPATIBLE):
//   REF_PROBE_EMAIL=… REF_PROBE_PASSWORD=… node scripts/ref-probe-s186-outline1.mjs
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const REF = "https://omni-study1.base44.app";
const OUT = "docs/probe-evidence/s186";
mkdirSync(OUT, { recursive: true });

const VIEWS = [
  "Dashboard", "Tasks", "Calendar", "Events", "Timetable",
  "Assignments", "Notes", "Flashcards", "Files", "Settings",
];

const BUTTON_CENSUS = `(() => {
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.display !== "none" && cs.visibility !== "hidden";
  };
  const main = document.querySelector("main") || document.body;
  const out = [];
  const seen = new Set();
  for (const btn of main.querySelectorAll("button, a[role=\\"button\\"]")) {
    if (!vis(btn) || seen.has(btn)) continue;
    seen.add(btn);
    const cs = getComputedStyle(btn);
    const r = btn.getBoundingClientRect();
    out.push({
      text: (btn.textContent || "").trim().slice(0, 34),
      bg: cs.backgroundColor,
      color: cs.color,
      border: cs.borderTopWidth + " " + cs.borderTopColor,
      radius: cs.borderRadius,
      shadow: cs.boxShadow === "none" ? "none" : cs.boxShadow.slice(0, 58),
      h: Math.round(r.height),
      fs: cs.fontSize,
      fw: cs.fontWeight,
      cls: (btn.className || "").toString().slice(0, 120),
    });
  }
  return JSON.stringify(out);
})()`;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(`${REF}/login`);
await page.fill("input[type=email]", process.env.REF_PROBE_EMAIL);
await page.fill("input[type=password]", process.env.REF_PROBE_PASSWORD);
await page.waitForFunction(
  () => {
    const btn = document.querySelector("button[type=submit]");
    return btn !== null && !btn.disabled;
  },
  null,
  { timeout: 15_000 },
);
await page.click("button[type=submit]");
await page.waitForFunction(
  () =>
    document.querySelector("nav a") !== null &&
    (document.querySelector("h1") !== null || document.querySelector("h2") !== null),
  null,
  { timeout: 30_000 },
);
await page.waitForTimeout(1500);

const census = {};
for (const view of VIEWS) {
  await page.goto(`${REF}/${view}`);
  await page.waitForTimeout(2200);
  const rows = JSON.parse(await page.evaluate(BUTTON_CENSUS));
  census[view] = rows;
  console.log(`[s186-outline1] ${view}: ${rows.length} visible buttons`);
}

// The login page's own buttons (logged-out surface).
await ctx.close();
const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page2 = await ctx2.newPage();
await page2.goto(`${REF}/login`);
await page2.waitForTimeout(2200);
const loginRows = JSON.parse(await page2.evaluate(BUTTON_CENSUS));
census["/login (anon)"] = loginRows;
await ctx2.close();
await browser.close();

// Classification: the near-black family = bg rgb(10,10,10)-ish.
const classify = (b) => {
  if (/rgb\\(10, ?10, ?10\\)/.test(b.bg)) return "near-black";
  if (b.bg.includes("gradient")) return "gradient";
  if (b.bg === "rgba(0, 0, 0, 0)" || b.bg === "transparent") return b.border.startsWith("0px") || b.border.startsWith("1px") ? "ghost/borderless" : "transparent-bordered";
  return "other:" + b.bg;
};
const summary = {};
for (const [view, rows] of Object.entries(census)) {
  summary[view] = rows.map((r) => ({ t: r.text, k: classify(r), bg: r.bg, color: r.color, h: r.h }));
}

writeFileSync(`${OUT}/ref-outline-census.json`, JSON.stringify({ census, summary }, null, 2));
console.log("\\n=== the near-black family members (candidate outline ports) ===");
for (const [view, rows] of Object.entries(census)) {
  for (const r of rows) {
    if (classify(r) === "near-black") {
      console.log(`${view}: "${r.text}" bg=${r.bg} color=${r.color} h=${r.h} border=${r.border} radius=${r.radius} shadow=${r.shadow}`);
    }
  }
}
console.log("\\n=== full census at docs/probe-evidence/s186/ref-outline-census.json ===");
