// S115 · Batch BP surface evidence captures — the register rotation (the
// BP1 headline: the BO1 register note's 243/124 counts describe the
// pre-s114-rider tree; the post-BO final-tree re-derivation is 245 importers
// / 126 carriers / 0 stale / 119 usage-line-free — the doctrine's own
// predicted drift, closed by the register rotation, not a pin change) +
// the s115 MID-BAND LIGHT evidence-frame rotation — the rotation program's
// SECOND PASS's cycle three (the first pass exhausted the theme axis at
// s112 [mid-band light with MathSolver + AIAssistant]; the second pass
// re-opens the cells with the views whose only prior frames are the
// same-cell dark flips — s113 desktop light [Flashcards + Timetable],
// s114 mobile-portrait light [Dashboard + Notes], this cycle the mid-band
// light cell with the s108 pair).
//
// BP frames (the GUARDED surfaces, on the final build, both seeded-data
// deterministic — zero persistent state BY CONSTRUCTION, no dialog, no
// mutation, no route abort; the S102 lesson-2 doctrine: a seeded-data
// frame is the cleanest rotation — the seed is the deterministic driver
// that already ran): the rotation program's 30 committed frames cover
// 1280×800 desktop ×10 dark (s100–s104) + ×4 light (s109 — Events +
// Analytics; s113 — Flashcards + Timetable), 390×844 mobile-portrait ×4
// dark (s105–s106) + ×4 light (s110 — Settings + Files; s114 — Dashboard
// + Notes), 844×390 mobile-landscape ×2 dark (s107 — the drawer nav-scroll
// + Tasks) + ×2 light (s111 — Calendar + FocusTimer), 768×1024 mid-band
// ×2 dark (s108 — PracticeTests + StudyGroups) + ×2 light (s112 —
// MathSolver + AIAssistant). The second pass's cycle three rotates onto
// the MID-BAND LIGHT cell (768×1024 — now the tied-thinnest light
// coverage, alongside the landscape-light cell) with the two views whose
// prior rotation frames are ALL dark-side AND whose only prior frames are
// the same-cell dark flips (the BN selection shape, two cells deeper):
// PracticeTests and StudyGroups — the s108 pair, both taking their FIRST
// light-side frames (the below-lg app-bar + hamburger chrome renders at
// 768 BY CONSTRUCTION while the lg:flex desktop rail stays hidden).
//
// Frame 1: the PRACTICETESTS view at 768×1024 in LIGHT — the view's FIRST
// light-side rotation frame (its 1 prior frame dark [s108 mid-band dark]).
// The h1 "Practice Tests" + subtitle "Test yourself with practice exams",
// the 2-COLUMN GRID (the mid-band-only structural discriminator: the
// computed gridTemplateColumns carries EXACTLY 2 px tracks at 768 — 1
// column at mobile-portrait, 3 at desktop-lg — the column-count boundary
// asserted BOTH sides, the S106 lesson-2 adapted), both seeded cards
// side-by-side in ONE row ("Vectors practice set" + "Biology Review"),
// the card metadata lines ("30 min · 2 questions" / "45 min · 3
// questions"), the aria-labeled "Open navigation menu" hamburger + the
// .sf-clock-date clock chip (the below-lg app bar), and the mid-band
// no-overflow contract (scrollWidth <= 768).
//
// Frame 2: the STUDYGROUPS view at 768×1024 in LIGHT — the view's FIRST
// light-side rotation frame (its 1 prior frame dark [s108 mid-band dark]).
// The aside (aria-label="Study groups pane") at its FULL 320px mid-band
// width (the S78/AE13 content-driven floor: the aside shrinks to ~222px at
// 390 while the mid-band renders the full w-80 negotiation), the aside's
// h1 "Study Groups" (the two-pane view carries no ViewHeader subtitle),
// the seeded "Calc Crew" group button with "2 members" + the Mathematics
// SubjectChip, the detail pane (aria-label="Study group detail pane")
// rendering the deterministic null-selection empty state — the S8-Z
// TWO-VARIANT boundary asserted on the rendered side: ONE seeded group +
// null selection renders the PLAIN "Select a group" variant ("Choose a
// study group from the sidebar or create a new one"), while the 80px
// gradient Users EmptyState renders ONLY at zero groups — the gate asserts
// the plain variant present AND the icon block ABSENT — both panes
// side-by-side (the two-pane contract), and the mid-band no-overflow
// contract (scrollWidth <= 768).
//
// Both frames md5-DISTINCT (the AR7 gate; the s93 I5 shape: the explicit
// boolean gate, the failure path prints its own line, the success line
// keys on the booleans). The AX3 catch shape: a mid-run throw exits 1
// through the script-owned failure line. The S4 restore on EVERY
// path: the theme back to violet/light (this capture runs on the
// PERSISTENT custom.db — the API PATCH is the only mutation and the
// finally restores it awaited; light IS the closing state, the PATCH
// still explicit and awaited so a failed run can never strand a dark
// window).
//
// Usage: node scripts/capture-s115-evidence.mjs
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

// The MID-BAND viewport — 768×1024, the rotation program's mid-band cell
// (its committed light frames: MathSolver + AIAssistant at s112; the second
// pass's cycle three rotates here with the s108 pair); the below-lg app bar
// + the aria-labeled hamburger render BY CONSTRUCTION while the lg:flex
// desktop rail chrome stays hidden — the full mid-band light shape.
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 768, height: 1024 } });
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

  // ============ BP · the guarded surface, leg 1 (mid-band light tests) ==
  // LIGHT mode (the S10 API pattern — the gotoDark spec contract inverted:
  // PATCH the preference, then NAVIGATE; the boot script applies the mode
  // on load). The PATCH is explicit — the demo user's stored mode is the
  // closing state (light) but a prior failed run must never strand a dark
  // window for this leg.
  await page.request.patch(`${BASE}${PREFERENCES}`, { data: { accentColor: "violet", themeMode: "light" } });
  await page.goto(`${BASE}/PracticeTests`);
  await page.waitForFunction(
    () =>
      !document.documentElement.classList.contains("dark") &&
      document.documentElement.style.getPropertyValue("--sf-primary") !== "",
    null,
    { timeout: 15000 },
  );
  // The mid-band-light PracticeTests' guarded families — the view header
  // (h1 "Practice Tests" + the "Test yourself with practice exams"
  // subtitle — the static ViewHeader copy), the 2-COLUMN GRID (the
  // MID-BAND-ONLY structural discriminator: the computed
  // gridTemplateColumns carries EXACTLY 2 px tracks at 768 — 1 column at
  // mobile-portrait, 3 at desktop-lg — the column-count boundary asserted
  // BOTH sides, the S106 lesson-2 adapted), both seeded cards
  // side-by-side in ONE row ("Vectors practice set" + "Biology Review" —
  // same row top, horizontally adjacent), the card metadata lines ("30
  // min · 2 questions" / "45 min · 3 questions"), the below-lg app bar
  // (the aria-labeled hamburger + the clock chip), and the mid-band
  // no-overflow contract (scrollWidth <= 768). The CONTENT gate, never
  // the shell alone (the S114 lesson-2).
  await page.waitForFunction(
    () => {
      const html = document.documentElement;
      const lightShell = !html.classList.contains("dark");
      const main = document.querySelector("main");
      const h1 = main?.querySelector("h1");
      const sub = h1?.parentElement?.querySelector("p");
      const headerOk =
        !!h1 && h1.textContent?.trim() === "Practice Tests";
      const subtitleOk =
        !!sub && sub.textContent?.trim() === "Test yourself with practice exams";
      const cardTitles = [...document.querySelectorAll("h2")].filter((h2) =>
        ["Vectors practice set", "Biology Review"].includes(h2.textContent?.trim() ?? ""),
      );
      const bothCards = cardTitles.length === 2;
      const grid = cardTitles[0]?.closest("div.grid") ?? null;
      const gridClass = grid ? (grid.getAttribute("class") ?? "") : "";
      const gridIsResponsive = gridClass.includes("md:grid-cols-2") && gridClass.includes("lg:grid-cols-3");
      const tracks = grid
        ? getComputedStyle(grid).gridTemplateColumns.split(" ").filter((t) => t.endsWith("px")).length
        : 0;
      const twoTracks = tracks === 2;
      const r1 = cardTitles[0]?.getBoundingClientRect();
      const r2 = cardTitles[1]?.getBoundingClientRect();
      const sameRow = !!r1 && !!r2 && Math.abs(r1.top - r2.top) < 8 && r1.right <= r2.left + 8;
      const body = document.body.innerText;
      const meta = body.includes("30 min · 2 questions") && body.includes("45 min · 3 questions");
      const appBar = !!document.querySelector('button[aria-label="Open navigation menu"]');
      const clockChip = !!document.querySelector(".sf-clock-date");
      const noOverflow = document.documentElement.scrollWidth <= 768;
      return (
        lightShell && headerOk && subtitleOk && bothCards && gridIsResponsive &&
        twoTracks && sameRow && meta && appBar && clockChip && noOverflow
      );
    },
    null,
    { timeout: 15000 },
  );
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/115-clone-bp-rotation-light-midband-practicetests.png` });

  // ============ BP · leg 2 — the mid-band light study groups ============
  // Still light (the same PATCH owns the window) — NAVIGATE to the Study
  // Groups view; the two-pane flex negotiation and the seeded aside row
  // render.
  await page.goto(`${BASE}/StudyGroups`);
  await page.waitForFunction(
    () =>
      !document.documentElement.classList.contains("dark") &&
      document.documentElement.style.getPropertyValue("--sf-primary") !== "",
    null,
    { timeout: 15000 },
  );
  // The mid-band-light StudyGroups' guarded families — the aside
  // (aria-label="Study groups pane", w-80) at its FULL 320px mid-band
  // width (the S78/AE13 content-driven floor: the aside shrinks to
  // ~222px at 390 while the mid-band renders the full w-80 negotiation —
  // the mid-band discriminator), the aside's h1 "Study Groups" (the
  // two-pane view carries no ViewHeader subtitle), the seeded "Calc
  // Crew" group button with "2 members" + the Mathematics SubjectChip,
  // the detail pane (aria-label="Study group detail pane") rendering the
  // deterministic null-selection empty state — the S8-Z TWO-VARIANT
  // boundary asserted on the rendered side: ONE seeded group + null
  // selection renders the PLAIN "Select a group" variant ("Choose a
  // study group from the sidebar or create a new one"), while the 80px
  // gradient Users EmptyState renders ONLY at zero groups — the gate
  // asserts the plain variant present AND the icon block ABSENT (the
  // boundary discriminates the two empty states), both panes
  // side-by-side (the two-pane contract), and the mid-band no-overflow
  // contract (scrollWidth <= 768). The CONTENT gate, never the shell
  // alone (the S114 lesson-2).
  await page.waitForFunction(
    () => {
      const html = document.documentElement;
      const lightShell = !html.classList.contains("dark");
      const aside = document.querySelector('aside[aria-label="Study groups pane"]');
      const asideWidth = aside ? Math.round(aside.getBoundingClientRect().width) : 0;
      const asideH1 = aside?.querySelector("h1");
      const asideHeader = !!asideH1 && asideH1.textContent?.trim() === "Study Groups";
      const groupBtn = aside
        ? [...aside.querySelectorAll("button")].find((b) => b.textContent?.includes("Calc Crew"))
        : undefined;
      const crewSeeded = !!groupBtn;
      const crewMembers = !!groupBtn && groupBtn.textContent?.includes("2 members") === true;
      const crewChip = !!groupBtn && groupBtn.textContent?.includes("Mathematics") === true;
      const detail = document.querySelector('section[aria-label="Study group detail pane"]');
      const detailMounted = !!detail;
      const emptyState =
        !!detail &&
        detail.textContent?.includes("Select a group") === true &&
        detail.textContent?.includes("Choose a study group from the sidebar or create a new one") === true;
      // The S8-Z boundary: ONE seeded group renders the PLAIN variant — the
      // 80px gradient Users EmptyState (the zero-groups icon state) is ABSENT
      // on the seeded side of the boundary (the rendered-subset contract).
      const plainVariant = !detail?.querySelector(".size-20");
      const asideRight = aside?.getBoundingClientRect().right ?? 0;
      const detailLeft = detail?.getBoundingClientRect().left ?? 0;
      const twoPane = detailMounted && asideRight > 0 && detailLeft >= asideRight - 1;
      const noOverflow = document.documentElement.scrollWidth <= 768;
      return (
        lightShell && asideWidth === 320 && asideHeader && crewSeeded && crewMembers &&
        crewChip && detailMounted && emptyState && plainVariant && twoPane && noOverflow
      );
    },
    null,
    { timeout: 15000 },
  );
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/115-clone-bp-rotation-light-midband-studygroups.png` });

  // ---- The distinct-frame verification — the AR7 gate, the s93 I5 shape --
  const md5 = (p) => createHash("md5").update(readFileSync(p)).digest("hex");
  const frames = [
    `${OUT}/115-clone-bp-rotation-light-midband-practicetests.png`,
    `${OUT}/115-clone-bp-rotation-light-midband-studygroups.png`,
  ].map(md5);
  const distinct = new Set(frames).size === frames.length;
  if (!distinct) {
    // The failure path prints its OWN line — no success-shaped prose on a
    // failed gate. The S95/AV2 semantics: process.exitCode = 1 (the
    // S91/AR7 gate semantics — an exit-code-checking wrapper must see the
    // failure).
    console.log(`S115 BP frames DUPLICATE: ${frames.join(" ")} — the md5 gate FAILS this run`);
    process.exitCode = 1;
    md5Failed = true;
  } else {
    console.log(`S115 BP frames: ${frames.join(" ")} — all DISTINCT`);
  }
} catch (err) {
  // The AX3 shape (the s96 audit's I3): the failure path is gate-OWNED — a
  // mid-run throw exits 1 through this catch with a script-owned failure
  // line, not through node's unhandled-rejection spew. The md5Failed
  // shape generalized: every failure path sets process.exitCode = 1, and
  // the completion line below keys on the explicit booleans.
  console.error(`S115 BP surface captures FAILED: ${err?.message ?? err}`);
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
if (!md5Failed && !thrown) console.log("S115 BP surface captures complete");
