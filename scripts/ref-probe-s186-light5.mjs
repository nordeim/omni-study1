// S186 reference probe 5 — the LIGHT round-trip + the axis surfaces.
// The account sits in Dark (the owner's persisted state — S185's
// "invisible names"/"near-black outline" findings were dark-token values).
// The parity axis needs LIGHT measurements. This probe switches the theme
// to Light THROUGH THE REAL UI (Settings → Appearance), measures the axis
// surfaces, then RESTORES DARK (the account left exactly as found) — the
// S27 set-through-the-real-path-and-restore doctrine.
// Measured in light: the outline-button family (Tasks Active, Timetable
// Grid Builder, Files New Folder, Notes New Note), the view-header rows
// (desktop + mobile 390), the sf-card borders, the primary CTA colors.
// Usage (node >= 23.6 — bun INCOMPATIBLE):
//   REF_PROBE_EMAIL=… REF_PROBE_PASSWORD=… node scripts/ref-probe-s186-light5.mjs
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const REF = "https://omni-study1.base44.app";
const OUT = "docs/probe-evidence/s186";
mkdirSync(OUT, { recursive: true });

const login = async (page) => {
  await page.goto(`${REF}/login`);
  await page.fill("input[type=email]", process.env.REF_PROBE_EMAIL);
  await page.fill("input[type=password]", process.env.REF_PROBE_PASSWORD);
  await page.waitForFunction(() => { const b = document.querySelector("button[type=submit]"); return b && !b.disabled; }, null, { timeout: 15_000 });
  await page.click("button[type=submit]");
  await page.waitForFunction(() => document.querySelector("nav a") !== null && (document.querySelector("h1") || document.querySelector("h2")), null, { timeout: 30_000 });
  await page.waitForTimeout(1500);
};

const setTheme = async (page, mode) => {
  await page.goto(`${REF}/Settings`);
  await page.waitForTimeout(2400);
  // The mode cards: buttons containing the mode name (Light/Dark/System).
  const card = page.locator(`button:has-text("${mode}")`).first();
  await card.click();
  await page.waitForTimeout(1800);
  const cls = await page.evaluate(() => document.documentElement.className);
  return cls;
};

const AXIS = `(() => {
  const main = document.querySelector("main") || document.body;
  const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.display !== "none" && cs.visibility !== "hidden"; };
  const pick = (re) => { const b = [...main.querySelectorAll("button")].find(x => re.test((x.textContent || "").trim())); if (!b) return null; const cs = getComputedStyle(b); return { bg: cs.backgroundColor, color: cs.color, bi: cs.backgroundImage.slice(0, 80), border: cs.borderTopWidth + " " + cs.borderTopColor, shadow: cs.boxShadow === "none" ? "none" : cs.boxShadow.slice(0, 50), h: Math.round(b.getBoundingClientRect().height), radius: cs.borderRadius }; };
  // The view-header row: the container of the h1 (flex-col md:flex-row probe).
  const h1 = main.querySelector("h1");
  const hdrRow = h1 ? h1.closest("div.flex, header") : null;
  const hdrCs = hdrRow ? getComputedStyle(hdrRow) : null;
  const card = [...main.querySelectorAll("div")].filter(vis).find(d => /rounded-2xl/.test(d.className || "") && d.getBoundingClientRect().width > 300);
  const cardCs = card ? getComputedStyle(card) : null;
  return JSON.stringify({
    addTask: pick(/^Add Task$/), active: pick(/^Active$/), gridBuilder: pick(/^Grid Builder$/),
    newFolder: pick(/^New Folder$/), newNote: pick(/^New Note$/), createTask: pick(/^Create Task$/),
    headerRow: hdrCs ? { display: hdrCs.display, direction: hdrCs.flexDirection, wrap: hdrCs.flexWrap, gap: hdrCs.gap, cls: (hdrRow.className || "").toString().slice(0, 110) } : null,
    card: cardCs ? { bg: cardCs.backgroundColor, border: cardCs.borderTopWidth + " " + cardCs.borderTopColor, radius: cardCs.borderRadius, cls: (card.className || "").toString().slice(0, 110) } : null,
    bodyBg: getComputedStyle(document.body).backgroundColor,
    baseText: getComputedStyle(document.body).color,
  });
})()`;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await login(page);

const before = await page.evaluate(() => document.documentElement.className);
console.log(`[s186-light5] theme before: "${before}"`);

// ---- Switch to LIGHT through the real UI ----
const afterLight = await setTheme(page, "Light");
console.log(`[s186-light5] after Light click: "${afterLight}"`);

const light = {};
for (const view of ["Tasks", "Timetable", "Files", "Notes", "Settings", "Dashboard"]) {
  await page.goto(`${REF}/${view}`);
  await page.waitForTimeout(2300);
  light[view] = JSON.parse(await page.evaluate(AXIS));
  console.log(`[s186-light5] light ${view}: addTask=${JSON.stringify(light[view].addTask)} headerRow=${JSON.stringify(light[view].headerRow)}`);
}

// The mobile view-header rows (390x844) in light.
await page.setViewportSize({ width: 390, height: 844 });
const mobile = {};
for (const view of ["Tasks", "Timetable", "Files"]) {
  await page.goto(`${REF}/${view}`);
  await page.waitForTimeout(2300);
  mobile[view] = JSON.parse(await page.evaluate(AXIS));
  console.log(`[s186-light5] mobile ${view}: headerRow=${JSON.stringify(mobile[view].headerRow)}`);
}
await page.setViewportSize({ width: 1440, height: 900 });

// ---- RESTORE DARK (the account as found) ----
const restored = await setTheme(page, "Dark");
console.log(`[s186-light5] theme restored: "${restored}"`);

await ctx.close();
await browser.close();
writeFileSync(`${OUT}/ref-light-roundtrip.json`, JSON.stringify({ before, afterLight, light, mobile, restored }, null, 2));
console.log("saved docs/probe-evidence/s186/ref-light-roundtrip.json");
