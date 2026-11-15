// S192 20-view reference census — the axis-discovery instrument (the S190
// instrument re-created for the S192 cycle: the prior copy lived in the
// session scratch area which the sandbox recycle wiped). Rides the FRESH
// :3200 standalone (scripts/launch-standalone-s192.py — the S192 lesson-1
// pin: shell-provided DATABASE_URL) against the live reference.
//
// Posture (the standing doctrine): READ-ONLY on the reference — login +
// navigation only, zero rows created or deleted. The clone rides its seeded
// demo account. Every delta adjudicates against the S123 data-shaped class
// (the reference account's zero-data empty-state CTAs vs the seeded clone)
// BEFORE any gap is claimed; the code check (the S191 lesson 2) is the
// closing half: grep the clone's empty-state paths for each CTA the
// reference renders at zero data.
//
// Usage: REF_PROBE_EMAIL=… REF_PROBE_PASSWORD=… node scripts/ref-census-s192.mjs
import { chromium } from "playwright";

const REF = "https://omni-study1.base44.app";
const CLONE = "http://localhost:3200";

const VIEWS = [
  { id: "dashboard", nav: null },
  { id: "myday", nav: "My Day" },
  { id: "tasks", nav: "Tasks" },
  { id: "calendar", nav: "Calendar" },
  { id: "events", nav: "Events" },
  { id: "timetable", nav: "Timetable" },
  { id: "assignments", nav: "Assignments" },
  { id: "exams", nav: "Exams" },
  { id: "notes", nav: "Notes" },
  { id: "flashcards", nav: "Flashcards" },
  { id: "practicetests", nav: "Practice Tests" },
  { id: "studygroups", nav: "Study Groups" },
  { id: "gradetracker", nav: "Grade Tracker" },
  { id: "analytics", nav: "Analytics" },
  { id: "files", nav: "Files" },
  { id: "calculator", nav: "Calculator" },
  { id: "mathsolver", nav: "Math Solver" },
  { id: "aiassistant", nav: "AI Assistant" },
  { id: "focustimer", nav: "Focus Timer" },
  { id: "settings", nav: "Settings" },
];

const SNAP = `(() => {
  const main = document.querySelector("main") || document.body;
  const h = (sel) => [...main.querySelectorAll(sel)].map((e) => e.textContent.trim().replace(/\\s+/g, " ")).filter(Boolean);
  const btns = h("button").slice(0, 16);
  const tabs = h("[role=tab]").slice(0, 10);
  const heads = [...h("h1"), ...h("h2"), ...h("h3")].slice(0, 10);
  const inputs = [...main.querySelectorAll("input")].map((i) => i.placeholder || i.type).slice(0, 8);
  const selects = [...main.querySelectorAll("select")].map((s) => s.selectedOptions[0]?.textContent?.trim() ?? "").slice(0, 5);
  const text = (main.innerText || "").replace(/\\s+/g, " ").slice(0, 900);
  return JSON.stringify({ heads, btns, tabs, inputs, selects, text });
})()`;

async function session(browser, base, creds) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${base}/login`, { timeout: 45_000 });
  await page.fill("input[type=email]", creds.email);
  await page.fill("input[type=password]", creds.password);
  await page.waitForFunction(
    () => {
      const b = document.querySelector("button[type=submit]");
      return b !== null && !b.disabled;
    },
    null,
    { timeout: 20_000 },
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
  const out = {};
  for (const v of VIEWS) {
    if (v.nav) {
      const link = page.locator("nav a").filter({ hasText: v.nav }).first();
      await link.click({ timeout: 15_000 });
      await page.waitForTimeout(1400);
    } else {
      await page.locator('nav a').filter({ hasText: "Dashboard" }).first().click();
      await page.waitForTimeout(1400);
    }
    out[v.id] = JSON.parse(await page.evaluate(SNAP));
  }
  await ctx.close();
  return out;
}

const browser = await chromium.launch();
const ref = await session(browser, REF, {
  email: process.env.REF_PROBE_EMAIL,
  password: process.env.REF_PROBE_PASSWORD,
});
const clone = await session(browser, CLONE, {
  email: "demo@studyflow.app",
  password: "Demo1234!",
});
await browser.close();

// Known data-shaped markers (the S123 doctrine): strings the reference's
// ZERO-DATA account renders that the seeded clone replaces with data rows,
// and vice versa. A delta matching ONLY these classes is data shape, not a
// gap. The code check (grep the clone's empty-state paths) closes each one.
const DATA_SHAPED = [
  /Start My Day/i, /Create Task/i, /New Note/i, /Create Deck/i,
  /Create Group/i, /classes/i, /0 tasks/i, /\b0\b/, /Good (morning|afternoon|evening)/i,
  /Demo\b/, /sepnetflix/i, /👋/,
];

const verdict = {};
for (const v of VIEWS) {
  const r = ref[v.id];
  const c = clone[v.id];
  const deltas = [];
  // Structural: buttons/tabs/heads present on one side only.
  for (const key of ["btns", "tabs", "heads"]) {
    const rs = new Set(r[key]);
    const cs = new Set(c[key]);
    for (const x of rs) if (!cs.has(x)) deltas.push(`ref-only ${key}: ${x.slice(0, 60)}`);
    for (const x of cs) if (!rs.has(x)) deltas.push(`clone-only ${key}: ${x.slice(0, 60)}`);
  }
  const dataShaped = deltas.filter((d) => DATA_SHAPED.some((re) => re.test(d)));
  const real = deltas.filter((d) => !DATA_SHAPED.some((re) => re.test(d)));
  verdict[v.id] = {
    totalDeltas: deltas.length,
    dataShapedCount: dataShaped.length,
    realGaps: real,
  };
}

console.log(JSON.stringify({ census: "s192-20-view", verdict }, null, 1));
const realCount = Object.values(verdict).reduce((n, v) => n + v.realGaps.length, 0);
console.log(`\nCENSUS VERDICT: ${realCount === 0 ? "REFERENCE UNCHANGED (every delta data-shaped)" : `${realCount} REAL GAPS to adjudicate`}`);
process.exitCode = realCount === 0 ? 0 : 2;
