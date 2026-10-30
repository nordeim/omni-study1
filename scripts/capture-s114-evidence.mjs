// S114 · Batch BO surface evidence captures — the register rotation (the
// BO1 headline: the BN1 register note's 241/122 counts describe the
// pre-s113-rider tree; the post-BN final-tree re-derivation is 243 importers
// / 124 carriers / 0 stale / 119 usage-line-free — the doctrine's own
// predicted drift, closed by the register rotation, not a pin change) +
// the s114 MOBILE-PORTRAIT LIGHT evidence-frame rotation — the rotation
// program's SECOND PASS's cycle two (the exhaustion cycle closed at s112;
// the second pass re-probes any cell, any view, fresh — the BN close's own
// named next step).
//
// BO frames (the GUARDED surfaces, on the final build, both seeded-data
// deterministic — zero persistent state BY CONSTRUCTION, no dialog, no
// mutation, no route abort; the S102 lesson-2 doctrine: a seeded-data
// frame is the cleanest rotation — the seed is the deterministic driver
// that already ran): the rotation program's 28 committed frames — 1280×800
// desktop ×10 dark (s100–s104) + ×4 light (s109 Events + Analytics; s113
// Flashcards + Timetable), 390×844 mobile-portrait ×4 dark (s105–s106) +
// ×2 light (s110 — Settings + Files), 844×390 mobile-landscape ×2 dark
// (s107) + ×2 light (s111 — Calendar + FocusTimer), 768×1024 mid-band ×2
// dark (s108) + ×2 light (s112 — MathSolver + AIAssistant). The second
// pass's cycle two rotates onto the MOBILE-PORTRAIT LIGHT cell (390×844 —
// the mobile home band, now the tied-thinnest light coverage) with the two
// views whose prior rotation frames are ALL dark-side AND whose only prior
// frames are the same-cell dark flips (the BN selection shape, one cell
// deeper): Dashboard (1 prior frame — s105 mobile-portrait dark; the view's
// FIRST light-side frame and first mobile-light re-probe — the home view,
// its entire lineage dark-side) and Notes (1 prior frame — s106
// mobile-portrait dark; the view's FIRST light-side frame and first
// mobile-light re-probe — the view where the reference carries its own
// mobile overflow defect [scrollWidth 416 on /Notes], the clone's clean-390
// contract now documented on the light side too).
//
// Frame 1: the DASHBOARD view at 390×844 in LIGHT — the view's FIRST
// light-side rotation frame. The greeting-bucket h1 ("Good evening, Demo 👋"
// at pin time — the "Good (morning|afternoon|evening), Demo" pattern, the
// live clock's own signature, the reference-probed greeting buckets
// unit-pinned) + the long-date subtitle (the "(Weekday), (Month) D, YYYY"
// pattern — the live clock), the conditional sf-overdue-banner
// [aria-label="Overdue alert"] ("You have 1 overdue item" — the seeded
// incomplete at(-2) "Return library books" task, the S9-A-pinned surface),
// the [aria-label="Today's tasks"] region with the seeded due-today rows,
// the four stat cards ("Today's Progress" / "Pending Tasks 10" / "Due Soon"
// / "Focus Time" — the 10-pending stable across the window: 12 seeded
// tasks − 2 completed), the "Upcoming Exams" section with its seeded
// "Calculus II Midterm" row, the "Upcoming Assignments" section with its
// seeded "Physics reading — ch. 12" row, the fixed glass mobile app bar
// (the aria-labeled "Open navigation menu" hamburger + the .sf-clock-date
// clock chip) — all deterministic from the seed with ZERO interaction.
// The mobile no-overflow contract (scrollWidth <= 390).
//
// Frame 2: the NOTES view at 390×844 in LIGHT — the view's FIRST
// light-side rotation frame. The h1 "Notes" (the view carries no
// subtitle), the [aria-label="Notes list pane"] (the AE6 surface) with all
// four seeded rows — "Dot product intuition" / "Integration techniques" /
// "Kinetics summary" / "Essay sources" — the pane chrome comboboxes ("All
// Notebooks" / "All Tags"), the input[aria-label="Search notes"] at its
// "Search notes…" rest placeholder, the button[aria-label="Filter by tag"]
// (the E6 superset), the button[aria-label="New note"] mobile create FAB —
// sf-gradient sf-gradient-shadow fixed bottom-20 right-4 z-30 size-14
// rounded-full md:hidden, fully inside the viewport (the S79/AF6 superset
// surface, its first LIGHT-side mobile evidence frame), and the fixed
// glass app bar — pure seed read, ZERO interaction. The mobile
// no-overflow contract (scrollWidth <= 390) — the reference's own 416
// overflow defect on /Notes NOT reproduced, now documented on the light
// side too.
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
// Usage: node scripts/capture-s114-evidence.mjs
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

// The MOBILE-PORTRAIT viewport — 390×844, the rotation program's mobile
// home-band cell (its committed light frames: Settings + Files at s110; the
// second pass's cycle two rotates here); the fixed glass app bar + the
// aria-labeled hamburger render BY CONSTRUCTION while the lg:flex desktop
// rail chrome stays hidden — the full mobile light shape.
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
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

  // ============ BO · the guarded surface, leg 1 (mobile light dashboard)
  // LIGHT mode (the S10 API pattern — the gotoDark spec contract inverted:
  // PATCH the preference, then NAVIGATE; the boot script applies the mode
  // on load). The PATCH is explicit — the demo user's stored mode is the
  // closing state (light) but a prior failed run must never strand a dark
  // window for this leg.
  await page.request.patch(`${BASE}${PREFERENCES}`, { data: { accentColor: "violet", themeMode: "light" } });
  await page.goto(`${BASE}/Dashboard`);
  await page.waitForFunction(
    () =>
      !document.documentElement.classList.contains("dark") &&
      document.documentElement.style.getPropertyValue("--sf-primary") !== "",
    null,
    { timeout: 15000 },
  );
  // The mobile-light Dashboard's guarded families — the greeting-bucket h1
  // (the live clock's own signature — the reference-probed greeting
  // buckets unit-pinned; pattern-gated, never a hard-coded bucket) + the
  // long-date subtitle (pattern-gated the same way), the conditional
  // sf-overdue-banner Overdue alert (the S9-A-pinned surface: the seeded
  // incomplete at(-2) "Return library books" task renders the alert; the
  // family's first LIGHT-side evidence frame — standing-covered at desktop
  // dark + mobile dark only), the Today's tasks region with the seeded
  // due-today rows, the four stat-card labels with the stable 10-pending
  // integer (12 seeded tasks − 2 completed — date-independent), the
  // Upcoming Exams + Upcoming Assignments sections with their seeded rows,
  // the fixed glass app bar (the aria-labeled hamburger + the clock chip),
  // and the S33 mobile no-overflow contract (scrollWidth <= 390).
  await page.waitForFunction(
    () => {
      const html = document.documentElement;
      const lightShell = !html.classList.contains("dark");
      const main = document.querySelector("main");
      const h1 = main?.querySelector("h1");
      const sub = h1?.parentElement?.querySelector("p");
      const greetingOk =
        !!h1 && /^Good (morning|afternoon|evening), Demo/.test(h1.textContent?.trim() ?? "");
      const dateOk =
        !!sub &&
        /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday), (January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}, \d{4}$/.test(
          sub.textContent?.trim() ?? "",
        );
      const banner = document.querySelector('[aria-label="Overdue alert"]');
      const bannerFamily = !!banner && (banner.getAttribute("class") ?? "").includes("sf-overdue-banner");
      const bannerTextOk = (banner?.textContent ?? "").includes("overdue item");
      const todayTasks = document.querySelector('[aria-label="Today\'s tasks"]');
      const statText = (main?.textContent ?? "");
      const statsOk =
        statText.includes("Today's Progress") &&
        statText.includes("Pending Tasks") &&
        statText.includes("Due Soon") &&
        statText.includes("Focus Time") &&
        statText.includes("10");
      const sectionsOk =
        statText.includes("Upcoming Exams") && statText.includes("Calculus II Midterm") &&
        statText.includes("Upcoming Assignments") && statText.includes("Physics reading — ch. 12");
      const appBar = !!document.querySelector('button[aria-label="Open navigation menu"]');
      const clockChip = !!document.querySelector(".sf-clock-date");
      const noOverflow = document.documentElement.scrollWidth <= 390;
      return (
        lightShell && greetingOk && dateOk && bannerFamily && bannerTextOk &&
        !!todayTasks && statsOk && sectionsOk && appBar && clockChip && noOverflow
      );
    },
    null,
    { timeout: 15000 },
  );
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/114-clone-bo-rotation-light-mobile-dashboard.png` });

  // ============ BO · leg 2 — the mobile light Notes (the create FAB) ====
  // Still light (the same PATCH owns the window) — NAVIGATE to the Notes
  // view; the seeded rows, the mobile FAB and the app bar render.
  await page.goto(`${BASE}/Notes`);
  await page.waitForFunction(
    () =>
      !document.documentElement.classList.contains("dark") &&
      document.documentElement.style.getPropertyValue("--sf-primary") !== "",
    null,
    { timeout: 15000 },
  );
  // The mobile-light Notes' guarded families — the h1 "Notes" (the view
  // carries no subtitle), the notes list pane at mobile (the AE6 surface)
  // with ALL FOUR seeded rows — "Dot product intuition" / "Integration
  // techniques" / "Kinetics summary" / "Essay sources" — the pane chrome
  // comboboxes ("All Notebooks" / "All Tags"), the "Search notes" input at
  // its "Search notes…" rest placeholder, the "Filter by tag" button (the
  // E6 superset), the mobile create FAB (sf-gradient sf-gradient-shadow —
  // the S79/AF6 superset surface, the gradient family's first LIGHT-side
  // MOBILE evidence frame; fixed bottom-20 right-4, fully inside the
  // viewport), the fixed glass app bar, and the S33 mobile no-overflow
  // contract (scrollWidth <= 390 — the reference's own 416 overflow defect
  // on /Notes NOT reproduced, now on the light side too).
  await page.waitForFunction(
    () => {
      const html = document.documentElement;
      const lightShell = !html.classList.contains("dark");
      const main = document.querySelector("main");
      const h1 = main?.querySelector("h1");
      const headerOk =
        h1?.textContent?.trim() === "Notes" &&
        (h1?.parentElement?.querySelector("p") ?? null) === null;
      const pane = document.querySelector('[aria-label="Notes list pane"]');
      const paneVisible = !!pane && pane.getBoundingClientRect().width > 0;
      const paneText = pane?.textContent ?? "";
      const rowsOk =
        paneText.includes("Dot product intuition") &&
        paneText.includes("Integration techniques") &&
        paneText.includes("Kinetics summary") &&
        paneText.includes("Essay sources");
      const chromeOk = paneText.includes("All Notebooks") && paneText.includes("All Tags");
      const search = main?.querySelector('input[aria-label="Search notes"]');
      const searchOk = !!search && search.placeholder === "Search notes…" && search.value === "";
      const tagFilter = !!main?.querySelector('button[aria-label="Filter by tag"]');
      const fab = document.querySelector('button[aria-label="New note"]');
      const fabFamily =
        !!fab &&
        (fab.getAttribute("class") ?? "").includes("sf-gradient") &&
        (fab.getAttribute("class") ?? "").includes("sf-gradient-shadow");
      const fabInViewport = (() => {
        if (!fab) return false;
        const r = fab.getBoundingClientRect();
        return r.width > 0 && r.x >= 0 && r.x + r.width <= 390 && r.y >= 0 && r.y + r.height <= 844;
      })();
      const appBar = !!document.querySelector('button[aria-label="Open navigation menu"]');
      const noOverflow = document.documentElement.scrollWidth <= 390;
      return (
        lightShell && headerOk && paneVisible && rowsOk && chromeOk &&
        searchOk && tagFilter && fabFamily && fabInViewport && appBar && noOverflow
      );
    },
    null,
    { timeout: 15000 },
  );
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/114-clone-bo-rotation-light-mobile-notes.png` });

  // ---- The distinct-frame verification — the AR7 gate, the s93 I5 shape --
  const md5 = (p) => createHash("md5").update(readFileSync(p)).digest("hex");
  const frames = [
    `${OUT}/114-clone-bo-rotation-light-mobile-dashboard.png`,
    `${OUT}/114-clone-bo-rotation-light-mobile-notes.png`,
  ].map(md5);
  const distinct = new Set(frames).size === frames.length;
  if (!distinct) {
    // The failure path prints its OWN line — no success-shaped prose on a
    // failed gate. The S95/AV2 semantics: process.exitCode = 1 (the
    // S91/AR7 gate semantics — an exit-code-checking wrapper must see the
    // failure).
    console.log(`S114 BO frames DUPLICATE: ${frames.join(" ")} — the md5 gate FAILS this run`);
    process.exitCode = 1;
    md5Failed = true;
  } else {
    console.log(`S114 BO frames: ${frames.join(" ")} — all DISTINCT`);
  }
} catch (err) {
  // The AX3 shape (the s96 audit's I3): the failure path is gate-OWNED — a
  // mid-run throw exits 1 through this catch with a script-owned failure
  // line, not through node's unhandled-rejection spew. The md5Failed
  // shape generalized: every failure path sets process.exitCode = 1, and
  // the completion line below keys on the explicit booleans.
  console.error(`S114 BO surface captures FAILED: ${err?.message ?? err}`);
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
if (!md5Failed && !thrown) console.log("S114 BO surface captures complete");
