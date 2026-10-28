// S109 · Batch BJ surface evidence captures — the register rotation (the
// BJ1 headline: the BI1 register note's 231/112 counts describe the
// pre-s108-rider tree; the post-BI final-tree re-derivation is 233 importers
// / 114 carriers / 0 stale / 119 usage-line-free — the doctrine's own
// predicted drift, closed by the register rotation, not a pin change) +
// the s109 LIGHT evidence-frame rotation — the theme axis's never-varied
// side.
//
// BJ frames (the GUARDED surfaces, on the final build, both seeded-data
// deterministic — zero persistent state BY CONSTRUCTION, no dialog, no
// mutation, no route abort; the S102 lesson-2 doctrine: a seeded-data
// frame is the cleanest rotation — the seed is the deterministic driver
// that already ran): the rotation program's 18 committed frames cover
// exactly four viewport cells — 1280×800 desktop (s100–s104, dark),
// 390×844 mobile-portrait (s105–s106, dark), 844×390 mobile-landscape
// (s107, dark) and 768×1024 mid-band (s108, dark) — the viewport-band
// matrix COMPLETE, and the THEME axis has NEVER been varied: 18/18
// committed rotation frames are DARK, LIGHT = 0 (the S105 axis-enumeration
// logic applied one axis later: that cycle opened the viewport axis after
// the desktop era saturated it; the S107 lesson-1 exhausted the band
// matrix; the theme axis is the remaining never-opened axis). Both frames
// below render at the program's HOME BAND (1280×800 desktop — its 10
// frames all dark, desktop×light never varied) in LIGHT — the full
// desktop chrome (the lg:flex rail, the glass app-bar absent) with the
// md:/lg: view layouts at full desktop width.
//
// Frame 1: the EVENTS view at 1280×800 in LIGHT — the view's FIRST
// rotation frame (the coverage gap: zero rotation frames across the
// entire 18-frame lineage touch the Events MAIN view; only its error
// state rendered at s100). The WITHIN-VIEW THEME BOUNDARY = the
// LIGHT-ONLY structural discriminator: the terminal panel is bg-slate-900,
// INTENTIONALLY dark in BOTH themes per the view's own header contract
// ("no dark: overrides inside"), so the light frame's own read is the
// BOUNDARY ITSELF — the panel computes rgb(15, 23, 42) while the page h1
// computes the light-side slate-800 rgb(30, 41, 59) (the dark:text-
// slate-100 override never fires) — a pair ONLY light mode produces; in
// dark mode the boundary is invisible, shell and panel sharing the
// darkness (the S106 lesson-2 boundary discipline applied to the THEME
// boundary: both sides asserted by construction). The carousel chrome
// (the "New Event" CTA + the CW line + the big date) and the three seeded
// events in the 7-day list ("Study group — calculus" + "Advisor meeting"
// + "Chemistry lab session"); the leg is a pure seed read, ZERO
// interaction (the day-focus defaults to today).
//
// Frame 2: the ANALYTICS view at 1280×800 in LIGHT — the view's FIRST
// rotation frame (the same coverage-gap class). The light-side
// WITHIN-ELEMENT theme reads: a chart SVG's axis text computes the
// light-only #666 rgb(102, 102, 102) (the dark:fill-slate-400 override
// never fires) and a StatBlock card computes the light-only bg-white
// rgb(255, 255, 255) (the dark:bg-card override never fires) — the same
// boundary-by-construction shape, read through the ELEMENTS' own computed
// styles. The seeded stat values ("2/12" Tasks Completed — 2 of 12 seeded
// tasks complete; "0/6" Assignments — no seeded assignment at 100%;
// "4" Upcoming Exams — all 4 seeded exams future-dated), the stat grid's
// EXACTLY 4 px tracks at the desktop band (grid-cols-2 below-lg,
// lg:grid-cols-4 at 1280 — the band identity asserted BOTH sides by
// construction, the S108 lesson-2 track-count doctrine at the desktop
// band), the three chart surfaces (Task activity chart + Focus time chart
// + Grade trend), and the h1 "Analytics" + the subtitle; ZERO interaction.
//
// Both frames md5-DISTINCT (the AR7 gate; the s93 I5 shape: the explicit
// boolean gate, the failure path prints its own line, the completion line
// only on green — the S95/AV2 exit-code semantics: process.exitCode = 1 on
// the failure branch; the AX3 catch generalized to EVERY failed path,
// carried here). The S4 restore lesson on EVERY path: the theme back to
// violet/light (this capture runs on the PERSISTENT custom.db — the API
// PATCH is the only mutation and the finally restores it awaited; light
// IS the closing state, the PATCH still explicit and awaited so a failed
// run can never strand a dark window).
//
// Usage: node scripts/capture-s109-evidence.mjs
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

// The HOME-BAND viewport — 1280×800 desktop, the rotation program's home
// cell (its 10 committed frames all dark — s100–s104; desktop×light never
// varied); the lg breakpoint renders the desktop rail (lg:flex) and the
// lg: view layouts AT 1280 BY CONSTRUCTION while the below-lg glass app-bar
// chrome stays absent (lg:hidden) — the full-desktop light shape.
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
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

  // ============ BJ · the guarded surface, leg 1 (desktop light events) ==
  // LIGHT mode (the S10 API pattern — the gotoDark spec contract inverted:
  // PATCH the preference, then NAVIGATE; the boot script applies the mode
  // on load). The PATCH is explicit — the demo user's stored mode is the
  // closing state (light) but a prior failed run must never strand a dark
  // window for this leg.
  await page.request.patch(`${BASE}${PREFERENCES}`, { data: { accentColor: "violet", themeMode: "light" } });
  await page.goto(`${BASE}/Events`);
  await page.waitForFunction(
    () =>
      !document.documentElement.classList.contains("dark") &&
      document.documentElement.style.getPropertyValue("--sf-primary") !== "",
    null,
    { timeout: 15000 },
  );
  // The desktop-light Events' guarded families — the WITHIN-VIEW THEME
  // BOUNDARY (the LIGHT-ONLY structural discriminator): the terminal panel
  // (section[aria-label="Events panel"], bg-slate-900 — INTENTIONALLY dark
  // in BOTH themes) computes rgb(15, 23, 42) while the page h1 "Events &
  // Reminders" computes the LIGHT-side slate-800 rgb(30, 41, 59) (the
  // dark:text-slate-100 override never fires — the boundary asserted BOTH
  // sides by construction, the S106 lesson-2 applied to the THEME
  // boundary), the carousel chrome (the "New Event" CTA + the CW line +
  // the big date — today's date number, the day-focus defaults to today),
  // the three seeded events in the 7-day list ("Study group — calculus" +
  // "Advisor meeting" + "Chemistry lab session"), and the desktop
  // no-overflow contract (scrollWidth <= 1280).
  await page.waitForFunction(
    () => {
      const html = document.documentElement;
      const lightShell = !html.classList.contains("dark");
      const h1 = document.querySelector("h1");
      const h1Ok =
        !!h1 &&
        h1.textContent?.trim() === "Events & Reminders" &&
        getComputedStyle(h1).color === "rgb(30, 41, 59)";
      const panel = document.querySelector('section[aria-label="Events panel"]');
      const panelDark =
        !!panel && getComputedStyle(panel).backgroundColor === "rgb(15, 23, 42)";
      const panelText = panel?.textContent ?? "";
      const chromeOk =
        !!panel &&
        [...panel.querySelectorAll("button")].some((b) =>
          b.textContent?.trim() === "New Event",
        ) &&
        /CW \d+/.test(panelText);
      const bigDate = panel?.querySelector("span.text-4xl");
      const bigDateOk =
        !!bigDate && bigDate.textContent?.trim() === String(new Date().getDate());
      const seededEvents =
        panelText.includes("Study group — calculus") &&
        panelText.includes("Advisor meeting") &&
        panelText.includes("Chemistry lab session");
      const noOverflow = document.documentElement.scrollWidth <= 1280;
      return lightShell && h1Ok && panelDark && chromeOk && bigDateOk && seededEvents && noOverflow;
    },
    null,
    { timeout: 15000 },
  );
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/109-clone-bj-rotation-light-events.png` });

  // ============ BJ · leg 2 — the desktop light analytics ==============
  // Still light (the same PATCH owns the window) — NAVIGATE to the
  // Analytics view; the stat cards, the charts, and the light-side element
  // reads render.
  await page.goto(`${BASE}/Analytics`);
  await page.waitForFunction(
    () =>
      !document.documentElement.classList.contains("dark") &&
      document.documentElement.style.getPropertyValue("--sf-primary") !== "",
    null,
    { timeout: 15000 },
  );
  // The desktop-light Analytics' guarded families — the light-side
  // WITHIN-ELEMENT theme reads (a StatBlock card computing the light-only
  // bg-white rgb(255, 255, 255) — the dark:bg-card override never fires;
  // a chart SVG's axis text computing the light-only #666 rgb(102, 102,
  // 102) — the dark:fill-slate-400 override never fires), the seeded stat
  // values ("2/12" Tasks Completed + "0/6" Assignments + "4" Upcoming
  // Exams), the stat grid's EXACTLY 4 px tracks at the desktop band
  // (grid-cols-2 below-lg, lg:grid-cols-4 at 1280 — the S108 lesson-2
  // track-count doctrine at the home band), the three chart surfaces (Task
  // activity chart + Focus time chart + Grade trend), the h1 "Analytics" +
  // the subtitle "Insights across your study activity", and the desktop
  // no-overflow contract (scrollWidth <= 1280).
  await page.waitForFunction(
    () => {
      const html = document.documentElement;
      const lightShell = !html.classList.contains("dark");
      const h1 = document.querySelector("h1");
      const h1Ok =
        !!h1 && h1.textContent?.trim() === "Analytics" && getComputedStyle(h1).color !== "";
      const subtitle = document.body.innerText.includes("Insights across your study activity");
      const grid = document.querySelector('div[aria-label="Analytics stats"]');
      const tracks = grid
        ? getComputedStyle(grid).gridTemplateColumns.split(" ").filter((t) => t.endsWith("px")).length
        : 0;
      const fourTracks = tracks === 4;
      const firstCard = grid?.querySelector("div.rounded-xl") ?? null;
      const cardLight =
        !!firstCard && getComputedStyle(firstCard).backgroundColor === "rgb(255, 255, 255)";
      const body = document.body.innerText;
      const seededValues =
        body.includes("2/12") &&
        body.includes("Tasks Completed") &&
        body.includes("0/6") &&
        body.includes("Assignments") &&
        body.includes("4") &&
        body.includes("Upcoming Exams");
      const taskChart = document.querySelector('svg[aria-label="Task activity chart"]');
      const focusChart = document.querySelector('svg[aria-label="Focus time chart"]');
      const gradeTrend = document.querySelector('svg[aria-label="Grade trend"]');
      const chartsMounted = !!taskChart && !!focusChart && !!gradeTrend;
      const axisText = taskChart?.querySelector("text") ?? null;
      const axisLight =
        !!axisText && getComputedStyle(axisText).fill === "rgb(102, 102, 102)";
      const noOverflow = document.documentElement.scrollWidth <= 1280;
      return (
        lightShell &&
        h1Ok &&
        subtitle &&
        fourTracks &&
        cardLight &&
        seededValues &&
        chartsMounted &&
        axisLight &&
        noOverflow
      );
    },
    null,
    { timeout: 15000 },
  );
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/109-clone-bj-rotation-light-analytics.png` });

  // ---- The distinct-frame verification — the AR7 gate, the s93 I5 shape --
  const md5 = (p) => createHash("md5").update(readFileSync(p)).digest("hex");
  const frames = [
    `${OUT}/109-clone-bj-rotation-light-events.png`,
    `${OUT}/109-clone-bj-rotation-light-analytics.png`,
  ].map(md5);
  const distinct = new Set(frames).size === frames.length;
  if (!distinct) {
    // The failure path prints its OWN line — no success-shaped prose on a
    // failed gate. The S95/AV2 semantics: process.exitCode = 1 (the
    // S91/AR7 gate semantics — an exit-code-checking wrapper must see the
    // failure).
    console.log(`S109 BJ frames DUPLICATE: ${frames.join(" ")} — the md5 gate FAILS this run`);
    process.exitCode = 1;
    md5Failed = true;
  } else {
    console.log(`S109 BJ frames: ${frames.join(" ")} — all DISTINCT`);
  }
} catch (err) {
  // The AX3 shape (the s96 audit's I3): the failure path is gate-OWNED — a
  // mid-run throw exits 1 through this catch with a script-owned failure
  // line, not through node's unhandled-rejection spew. The md5Failed
  // shape generalized: every failure path sets process.exitCode = 1, and
  // the completion line below keys on the explicit booleans.
  console.error(`S109 BJ surface captures FAILED: ${err?.message ?? err}`);
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
if (!md5Failed && !thrown) console.log("S109 BJ surface captures complete");
