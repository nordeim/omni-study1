// S111 · Batch BL surface evidence captures — the register rotation (the
// BL1 headline: the BK1 register note's 235/116 counts describe the
// pre-s110-rider tree; the post-BK final-tree re-derivation is 237 importers
// / 118 carriers / 0 stale / 119 usage-line-free — the doctrine's own
// predicted drift, closed by the register rotation, not a pin change) +
// the s111 MOBILE-LANDSCAPE LIGHT evidence-frame rotation — the theme
// axis's never-varied LANDSCAPE cell.
//
// BL frames (the GUARDED surfaces, on the final build, both seeded-data
// deterministic — zero persistent state BY CONSTRUCTION, no dialog, no
// mutation, no route abort; the S102 lesson-2 doctrine: a seeded-data
// frame is the cleanest rotation — the seed is the deterministic driver
// that already ran): the rotation program's 22 committed frames cover all
// four viewport cells on DARK (1280×800 desktop ×10, s100–s104;
// 390×844 mobile-portrait ×4, s105–s106; 844×390 mobile-landscape ×2,
// s107; 768×1024 mid-band ×2, s108) plus the home band and the mobile
// band on LIGHT (1280×800 desktop ×2, s109 — Events + Analytics;
// 390×844 mobile-portrait ×2, s110 — Settings + Files). The theme
// axis's REMAINING never-varied cells: mobile-landscape×light,
// mid-band×light. Both frames below rotate onto the MOBILE-LANDSCAPE
// LIGHT cell (844×390 — the landscape band the program opened at s107
// on dark; the below-lg app-bar + hamburger chrome renders at 844 BY
// CONSTRUCTION while the lg:flex desktop rail stays absent) with the two
// VIEW-LEVEL gap candidates across the entire 22-frame lineage: Calendar
// and FocusTimer — the two of the last four views with ZERO rotation
// frames (Settings + Files closed at s110; MathSolver + AIAssistant
// remain for the mid-band×light cell).
//
// Frame 1: the CALENDAR view at 844×390 in LIGHT — the view's FIRST
// rotation frame. The A4/S5-G/S9-F-pinned mode switch (the bordered
// rounded-lg 8px segmented control, the Calendar tab aria-pressed=true
// in the sf-selected-tint violet-600 rgb(124, 58, 237), the Timeline
// tab unpressed), the "Calendar month" section (the month-label h2 at
// the "Month YYYY" pattern, the Previous/Next month icon buttons), the
// 7-column "Calendar weekdays" header, the "Calendar days" grid with
// the today cell data-today="true" selected by default (the selected
// state's sf-selected-tint — the same violet-600; the seeded events at
// dayOffsets 0/2/4 land in the current month at capture time, today's
// cell carrying the calculus-event dot) — all deterministic from the
// seed with ZERO interaction. The landscape no-overflow contract
// (scrollWidth <= 844).
//
// Frame 2: the FOCUSTIMER view at 844×390 in LIGHT — the view's FIRST
// rotation frame. The three StatCards (the hint→previousElementSibling
// value read, the S7-D anatomy): "Pomodoros" value 7 / hint "All-time
// focus sessions", "Sessions" value 7 / hint "Total sessions logged"
// (the seed's seven focus-mode sessions — both values deterministic)
// and "Today" / hint "Sessions completed today" (the dayOffset-0
// session — pinned at 0-or-1, BOTH sides of the seed's midnight
// boundary per the S106 lesson-2), the mode tabs role="group"
// aria-label="Timer mode" with Focus aria-pressed=true (the sf-gradient
// selected state), the Pomodoro 25/5/15 preset aria-pressed=true with
// the border-sf-primary violet rgb(139, 92, 246) against the unpressed
// Deep Work 50/10/30, the SVG ring role="img" aria-label="Timer
// progress", the role="timer" display at the deterministic 25:00 rest
// state, the h1 "Focus Timer" + subtitle "Stay focused with timed
// sessions" — pure seed read, ZERO interaction.
//
// Both frames md5-DISTINCT (the AR7 gate; the s93 I5 shape: the
// explicit boolean gate, the failure path prints its own line, the
// completion line only on green — the S95/AV2 exit-code semantics:
// process.exitCode = 1 on the failure branch; the AX3 catch generalized
// to EVERY failed path, carried here). The S4 restore lesson on EVERY
// path: the theme back to violet/light (this capture runs on the
// PERSISTENT custom.db — the API PATCH is the only mutation and the
// finally restores it awaited; light IS the closing state, the PATCH
// still explicit and awaited so a failed run can never strand a dark
// window).
//
// Usage: node scripts/capture-s111-evidence.mjs
//        (clone :3200 standalone first — the S86 daemon recipe; node
//        >= 23.6 for uniformity with the resweep class — NOT bun: the
//        S97/AX2 finding observed on the RESWEEP's verify-email POST [a
//        Set-Cookie response], playwright-core's APIRequestContext
//        crashing in _parseSetCookieHeader under bun 1.3.14; this
//        capture flow's own requests are untested under bun — node is
//        the uniform class convention, the AY2-honest scope)
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

const BASE = "http://localhost:3200";
const OUT = "docs/screenshots";
mkdirSync(OUT, { recursive: true });
const PREFERENCES = "/api/settings/preferences";

// The env pin — this script owns its own DATABASE_URL, never the caller's
// environment (the cwv-volume-stress convention).
const prisma = new PrismaClient({ datasources: { db: { url: "file:../db/custom.db" } } });

// The MOBILE-LANDSCAPE viewport — 844×390, the rotation program's
// landscape cell (its 2 committed frames both dark — s107;
// mobile-landscape × LIGHT never varied); the below-lg chrome renders
// BY CONSTRUCTION (the glass app-bar + the hamburger) while the lg:flex
// desktop rail stays absent — the full landscape light shape.
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 844, height: 390 } });
const page = await context.newPage();
let md5Failed = false; // the s93 I5 shape: the explicit completion gate
let thrown = false; // the AX3 shape: the catch path's completion-gate boolean

try {
  const demo = await prisma.user.findUnique({ where: { email: "demo@studyflow.app" } });
  if (!demo) throw new Error("demo user missing — run bun run db:seed");

  await page.goto(`${BASE}/login`);
  await page.fill("input[type=email]", "demo@studyflow.app");
  await page.fill("input[type=password]", "Demo1234!");
  await page.click("button[type=submit]");
  await page.waitForURL(`${BASE}/Dashboard`, { timeout: 20000 });
  await page.waitForFunction(() => !!document.querySelector(".sf-clock-date"), null, { timeout: 15000 });

  // ============ BL · the guarded surface, leg 1 (landscape light calendar)
  // LIGHT mode (the S10 API pattern — the gotoDark spec contract inverted:
  // PATCH the preference, then NAVIGATE; the boot script applies the mode
  // on load). The PATCH is explicit — the demo user's stored mode is the
  // closing state (light) but a prior failed run must never strand a dark
  // window for this leg.
  await page.request.patch(`${BASE}${PREFERENCES}`, { data: { accentColor: "violet", themeMode: "light" } });
  await page.goto(`${BASE}/Calendar`);
  await page.waitForFunction(
    () =>
      !document.documentElement.classList.contains("dark") &&
      document.documentElement.style.getPropertyValue("--sf-primary") !== "",
    null,
    { timeout: 15000 },
  );
  // The landscape-light Calendar's guarded families — the A4/S5-G/S9-F
  // mode switch (the bordered rounded-lg 8px segmented control with the
  // Calendar tab aria-pressed=true in the sf-selected-tint violet-600
  // rgb(124, 58, 237), the Timeline tab unpressed), the "Calendar month"
  // section (the month-label h2 at the "Month YYYY" pattern, the
  // Previous/Next month icon buttons), the 7-column "Calendar weekdays"
  // header, the "Calendar days" grid with the today cell data-today
  // selected by default in the same violet-600, and the landscape
  // no-overflow contract (scrollWidth <= 844).
  await page.waitForFunction(
    () => {
      const html = document.documentElement;
      const lightShell = !html.classList.contains("dark");
      const main = document.querySelector("main");
      const h1 = main?.querySelector("h1");
      const h1Ok = !!h1 && h1.textContent?.trim() === "Calendar";
      const modeSwitch = main?.querySelector('[aria-label="Calendar mode"]');
      const modeSwitchOk =
        !!modeSwitch && getComputedStyle(modeSwitch).borderRadius === "8px";
      const tabs = [...(modeSwitch?.querySelectorAll("button[aria-pressed]") ?? [])];
      const calTab = tabs.find((b) => b.textContent?.trim() === "Calendar");
      const tlTab = tabs.find((b) => b.textContent?.trim() === "Timeline");
      const tabsOk =
        tabs.length === 2 &&
        !!calTab &&
        calTab.getAttribute("aria-pressed") === "true" &&
        getComputedStyle(calTab).backgroundColor === "rgb(124, 58, 237)" &&
        !!tlTab &&
        tlTab.getAttribute("aria-pressed") === "false";
      const monthSection = main?.querySelector('[aria-label="Calendar month"]');
      const monthLabel = monthSection?.querySelector("h2")?.textContent?.trim() ?? "";
      const monthLabelOk =
        /^(January|February|March|April|May|June|July|August|September|October|November|December) \d{4}$/.test(
          monthLabel,
        );
      const prevOk = !!monthSection?.querySelector('button[aria-label="Previous month"]');
      const nextOk = !!monthSection?.querySelector('button[aria-label="Next month"]');
      const weekdays = main?.querySelector('[aria-label="Calendar weekdays"]');
      const weekdaysOk = !!weekdays && weekdays.querySelectorAll("span").length === 7;
      const days = main?.querySelector('[aria-label="Calendar days"]');
      const todayCell = days?.querySelector('[data-today="true"]');
      const todayOk =
        !!todayCell &&
        !!todayCell.textContent?.trim() &&
        getComputedStyle(todayCell).backgroundColor === "rgb(124, 58, 237)";
      const noOverflow = document.documentElement.scrollWidth <= 844;
      return lightShell && h1Ok && modeSwitchOk && tabsOk && monthLabelOk && prevOk && nextOk && weekdaysOk && todayOk && noOverflow;
    },
    null,
    { timeout: 15000 },
  );
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/111-clone-bl-rotation-light-landscape-calendar.png` });

  // ============ BL · leg 2 — the landscape light focustimer ==============
  // Still light (the same PATCH owns the window) — NAVIGATE to the
  // FocusTimer view; the seeded stats, the mode tabs, the preset and the
  // rest-state timer render.
  await page.goto(`${BASE}/FocusTimer`);
  await page.waitForFunction(
    () =>
      !document.documentElement.classList.contains("dark") &&
      document.documentElement.style.getPropertyValue("--sf-primary") !== "",
    null,
    { timeout: 15000 },
  );
  // The landscape-light FocusTimer's guarded families — the three
  // StatCards (the hint→previousElementSibling value read, the S7-D
  // anatomy): "Pomodoros" value 7 / "All-time focus sessions" and
  // "Sessions" value 7 / "Total sessions logged" (the seed's seven
  // focus-mode sessions) + "Today" / "Sessions completed today" at the
  // 0-or-1 midnight boundary (the S106 lesson-2: BOTH sides of the
  // seed's boundary); the mode tabs role="group" aria-label="Timer
  // mode" with Focus aria-pressed=true; the Pomodoro 25/5/15 preset
  // aria-pressed=true with the border-sf-primary violet rgb(139, 92,
  // 246) against the unpressed Deep Work 50/10/30; the SVG ring
  // role="img" aria-label="Timer progress"; the role="timer" display at
  // the deterministic 25:00 rest state; the h1 + subtitle; the landscape
  // no-overflow contract (scrollWidth <= 844) — ZERO interaction.
  await page.waitForFunction(
    () => {
      const html = document.documentElement;
      const lightShell = !html.classList.contains("dark");
      const main = document.querySelector("main");
      const h1 = main?.querySelector("h1");
      const sub = h1?.parentElement?.querySelector("p");
      const headerOk =
        h1?.textContent?.trim() === "Focus Timer" &&
        sub?.textContent?.trim() === "Stay focused with timed sessions";
      const statValue = (hint) => {
        const el = [...(main?.querySelectorAll("p") ?? [])].find(
          (p) => p.textContent?.trim() === hint,
        );
        return el?.previousElementSibling?.textContent?.trim();
      };
      const pomodoros = statValue("All-time focus sessions");
      const today = statValue("Sessions completed today");
      const sessions = statValue("Total sessions logged");
      const statsOk =
        pomodoros === "7" &&
        sessions === "7" &&
        (today === "0" || today === "1");
      const modeGroup = main?.querySelector('[role="group"][aria-label="Timer mode"]');
      const modeTabs = [...(modeGroup?.querySelectorAll("button[aria-pressed]") ?? [])];
      const focusTab = modeTabs.find((b) => b.textContent?.trim() === "Focus");
      const modeOk =
        modeTabs.length === 3 &&
        !!focusTab &&
        focusTab.getAttribute("aria-pressed") === "true";
      const presets = [...(main?.querySelectorAll("button[aria-pressed]") ?? [])].filter((b) =>
        /Pomodoro|Deep Work/.test(b.textContent ?? ""),
      );
      const pomodoro = presets.find((b) => /Pomodoro/.test(b.textContent ?? ""));
      const deep = presets.find((b) => /Deep Work/.test(b.textContent ?? ""));
      const presetsOk =
        presets.length === 2 &&
        !!pomodoro &&
        pomodoro.getAttribute("aria-pressed") === "true" &&
        getComputedStyle(pomodoro).borderColor === "rgb(139, 92, 246)" &&
        !!deep &&
        deep.getAttribute("aria-pressed") === "false";
      const ringOk = !!main?.querySelector('[role="img"][aria-label="Timer progress"]');
      const timerOk = main?.querySelector('[role="timer"]')?.textContent?.trim() === "25:00";
      const noOverflow = document.documentElement.scrollWidth <= 844;
      return lightShell && headerOk && statsOk && modeOk && presetsOk && ringOk && timerOk && noOverflow;
    },
    null,
    { timeout: 15000 },
  );
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/111-clone-bl-rotation-light-landscape-focustimer.png` });

  // ---- The distinct-frame verification — the AR7 gate, the s93 I5 shape --
  const md5 = (p) => createHash("md5").update(readFileSync(p)).digest("hex");
  const frames = [
    `${OUT}/111-clone-bl-rotation-light-landscape-calendar.png`,
    `${OUT}/111-clone-bl-rotation-light-landscape-focustimer.png`,
  ].map(md5);
  const distinct = new Set(frames).size === frames.length;
  if (!distinct) {
    // The failure path prints its OWN line — no success-shaped prose on a
    // failed gate. The S95/AV2 semantics: process.exitCode = 1 (the
    // S91/AR7 gate semantics — an exit-code-checking wrapper must see the
    // failure).
    console.log(`S111 BL frames DUPLICATE: ${frames.join(" ")} — the md5 gate FAILS this run`);
    process.exitCode = 1;
    md5Failed = true;
  } else {
    console.log(`S111 BL frames: ${frames.join(" ")} — all DISTINCT`);
  }
} catch (err) {
  // The AX3 shape (the s96 audit's I3): the failure path is gate-OWNED — a
  // mid-run throw exits 1 through this catch with a script-owned failure
  // line, not through node's unhandled-rejection spew. The md5Failed
  // shape generalized: every failure path sets process.exitCode = 1, and
  // the completion line below keys on the explicit booleans.
  console.error(`S111 BL surface captures FAILED: ${err?.message ?? err}`);
  process.exitCode = 1;
  thrown = true;
} finally {
  // The S4 restore lesson: the shared demo surface is restored (accent
  // violet, mode LIGHT) on EVERY path — awaited, so a failed pin can
  // never poison the shared user record for later specs (the S4
  // accent-restore lesson; the only mutation this capture makes; light IS
  // the closing state, the PATCH still explicit and awaited).
  await page.request
    .patch(`${BASE}${PREFERENCES}`, { data: { accentColor: "violet", themeMode: "light" } })
    .catch(() => {});
  await context.close().catch(() => {});
  await browser.close().catch(() => {});
  await prisma.$disconnect().catch(() => {});
}
// The s93 I5 shape: the completion line is gated on the explicit boolean
// (the AX3 shape: both of them — no success-shaped prose on any failed path).
if (!md5Failed && !thrown) console.log("S111 BL surface captures complete");
