// S108 · Batch BI surface evidence captures — the register rotation (the
// BI1 headline: the BH1 register note's 229/110 counts describe the
// pre-s107-rider tree; the post-BH final-tree re-derivation is 231 importers
// / 112 carriers / 0 stale / 119 usage-line-free — the doctrine's own
// predicted drift, closed by the register rotation, not a pin change) +
// the s108 MID-BAND evidence-frame rotation — the viewport-band matrix's
// LAST never-varied cell.
//
// BI frames (the GUARDED surfaces, on the final build, both seeded-data
// deterministic — zero persistent state BY CONSTRUCTION, no dialog, no
// mutation, no route abort; the S102 lesson-2 doctrine: a seeded-data
// frame is the cleanest rotation — the seed is the deterministic driver
// that already ran): the rotation program's 16 committed frames cover
// exactly three viewport cells — 1280×800 desktop (s96–s104, dark),
// 390×844 mobile-portrait (s105–s106, dark) and 844×390 mobile-landscape
// (s107, dark) — and 768×1024 MID-BAND has NEVER been varied (the S107
// lesson-1's own band-matrix enumeration — desktop / mid-band /
// mobile-portrait / mobile-landscape — three of four cells covered, the
// mid-band the LAST never-touched cell; the S34 midband sweep pins the
// LIGHT-mode 768×1024 drawer navigation e2e, so the band's DARK rotation
// frames are additionally the theme-side novelty). Both frames below
// render at 768×1024 in DARK — the below-lg glass app bar chrome (the
// lg:hidden mobile-chrome header renders at 768 BY CONSTRUCTION, the
// desktop rail hidden lg:flex absent) with the md: view layouts at full
// mid-band width.
//
// Frame 1: the PRACTICETESTS view at 768×1024 in DARK — the view's FIRST
// rotation frame (the coverage gap: zero rotation frames across the
// entire 16-frame lineage touch PracticeTests). The 2-COLUMN GRID = the
// MID-BAND-ONLY structural discriminator: the test-card grid
// `grid gap-4 md:grid-cols-2 lg:grid-cols-3` renders 1 column at
// mobile-portrait, EXACTLY 2 tracks at the md-mid-band, 3 at desktop-lg
// — the computed gridTemplateColumns track count is the boundary
// asserted BOTH sides (the S106 lesson-2 adapted to the column-count
// boundary: 2, never 1, never 3); both seeded cards render side-by-side
// in ONE row ("Vectors practice set" 30 min · 2 questions + "Biology
// Review" 45 min · 3 questions with their SubjectChips); the leg is a
// pure seed read, ZERO interaction.
//
// Frame 2: the STUDYGROUPS view at 768×1024 in DARK — the view's FIRST
// rotation frame (the same coverage-gap class). The TWO-PANE FLEX
// NEGOTIATION at mid-band width: the aside
// (aria-label="Study groups pane", w-80) renders at its FULL 320px —
// the S78/AE13 content-driven floor negotiation (the ref's own aside
// SHRINKS to ~222px at 390 while the right pane starves to ~112; at ≥sm
// the w-80 never shrinks — the mid-band renders both panes at full
// negotiation) — carrying the seeded "Calc Crew" group button ("2
// members" + the Mathematics SubjectChip), while the detail pane
// (aria-label="Study group detail pane") renders the deterministic
// null-selection empty state — the S8-Z TWO-VARIANT boundary asserted
// on the side the seed produces: with ONE seeded group the unselected
// detail renders the PLAIN "Select a group" variant (the 80px gradient
// Users EmptyState renders ONLY at zero groups — the gate asserts the
// rendered subset, never the invented one, the S107 lesson-3);
// selectedId defaults null, ZERO interaction.
//
// Both frames md5-DISTINCT (the AR7 gate; the s93 I5 shape: the explicit
// boolean gate, the failure path prints its own line, the completion line
// only on green — the S95/AV2 exit-code semantics: process.exitCode = 1 on
// the failure branch; the AX3 catch generalized to EVERY failed path,
// carried here). The S4 restore lesson on EVERY path: the theme back to
// violet/light (this capture runs on the PERSISTENT custom.db — the API
// PATCH is the only mutation and the finally restores it awaited).
//
// Usage: node scripts/capture-s108-evidence.mjs
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

// The MID-BAND viewport — 768×1024, the viewport-band matrix's last
// never-varied cell (the rotation program's prior cells: 1280×800 desktop,
// 390×844 mobile-portrait, 844×390 mobile-landscape); the md breakpoint
// renders the md: view layouts AT 768 BY CONSTRUCTION while the below-lg
// glass app-bar chrome still renders (lg:hidden) and the desktop rail
// stays absent (hidden lg:flex) — the tablet-portrait shape.
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

  // ============ BI · the guarded surface, leg 1 (mid-band dark tests) ==
  // DARK mode (the S10 API pattern — the gotoDark spec contract: PATCH the
  // preference, then NAVIGATE; the boot script applies the mode on load).
  await page.request.patch(`${BASE}${PREFERENCES}`, { data: { accentColor: "violet", themeMode: "dark" } });
  await page.goto(`${BASE}/PracticeTests`);
  await page.waitForFunction(
    () =>
      document.documentElement.classList.contains("dark") &&
      document.documentElement.style.getPropertyValue("--sf-primary") !== "",
    null,
    { timeout: 15000 },
  );
  // The mid-band PracticeTests' guarded families — the view header (h1
  // "Practice Tests" — the static ViewHeader title, no derived label), the
  // 2-COLUMN GRID (the MID-BAND-ONLY structural discriminator: the
  // computed gridTemplateColumns carries EXACTLY 2 px tracks at 768 —
  // 1 column at mobile-portrait, 3 at desktop-lg — the column-count
  // boundary asserted BOTH sides, the S106 lesson-2 adapted), both seeded
  // cards side-by-side in ONE row ("Vectors practice set" + "Biology
  // Review" — same row top, horizontally adjacent), the card metadata
  // lines ("30 min · 2 questions" / "45 min · 3 questions"), and the
  // mid-band no-overflow contract (scrollWidth <= 768).
  await page.waitForFunction(
    () => {
      const h1 = document.querySelector("h1");
      const header = !!h1 && h1.textContent?.trim() === "Practice Tests";
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
      const noOverflow = document.documentElement.scrollWidth <= 768;
      return header && bothCards && gridIsResponsive && twoTracks && sameRow && meta && noOverflow;
    },
    null,
    { timeout: 15000 },
  );
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/108-clone-bi-rotation-midband-dark-practicetests.png` });

  // ============ BI · leg 2 — the mid-band dark study groups ============
  // Still dark (the same PATCH owns the window) — NAVIGATE to the Study
  // Groups view; the two-pane flex negotiation and the seeded aside row
  // render.
  await page.goto(`${BASE}/StudyGroups`);
  await page.waitForFunction(
    () =>
      document.documentElement.classList.contains("dark") &&
      document.documentElement.style.getPropertyValue("--sf-primary") !== "",
    null,
    { timeout: 15000 },
  );
  // The mid-band StudyGroups' guarded families — the aside
  // (aria-label="Study groups pane", w-80) at its FULL 320px mid-band
  // width (the S78/AE13 content-driven floor: the aside shrinks to ~222px
  // at 390 while the mid-band renders the full w-80 negotiation — the
  // mid-band discriminator), the aside's h1 "Study Groups", the seeded
  // "Calc Crew" group button with "2 members" + the Mathematics SubjectChip,
  // the detail pane (aria-label="Study group detail pane") rendering the
  // deterministic null-selection empty state — the S8-Z TWO-VARIANT boundary
  // asserted on the rendered side: ONE seeded group + null selection renders
  // the PLAIN "Select a group" variant ("Choose a study group from the sidebar
  // or create a new one"), while the 80px gradient Users EmptyState renders
  // ONLY at zero groups — the gate asserts the plain variant present AND the
  // icon block ABSENT (the boundary discriminates the two empty states, the
  // S106 lesson-2 discipline applied to the state boundary), both panes
  // side-by-side (the two-pane contract), and the mid-band no-overflow
  // contract (scrollWidth <= 768).
  await page.waitForFunction(
    () => {
      const aside = document.querySelector('aside[aria-label="Study groups pane"]');
      const asideWidth = aside ? Math.round(aside.getBoundingClientRect().width) : 0;
      const asideH1 = aside?.querySelector("h1");
      const asideHeader = !!asideH1 && asideH1.textContent?.trim() === "Study Groups";
      const groupBtn = aside
        ? [...aside.querySelectorAll("button")].find((b) => b.textContent?.includes("Calc Crew"))
        : undefined;
      const crewSeeded = !!groupBtn;
      const crewMembers = !!groupBtn && groupBtn.textContent?.includes("2 members") === true;
      const detail = document.querySelector('section[aria-label="Study group detail pane"]');
      const detailMounted = !!detail;
      const emptyState =
        !!detail &&
        detail.textContent?.includes("Select a group") === true &&
        detail.textContent?.includes("Choose a study group from the sidebar or create a new one") === true;
      // The S8-Z boundary: ONE seeded group renders the PLAIN variant — the
      // 80px gradient Users EmptyState (the zero-groups icon state) is ABSENT
      // on the seeded side of the boundary (the rendered-subset contract, the
      // S107 lesson-3 — the gate lives-debugged through its own diagnostic
      // probe this cycle).
      const plainVariant = !detail?.querySelector(".size-20");
      const asideRight = aside?.getBoundingClientRect().right ?? 0;
      const detailLeft = detail?.getBoundingClientRect().left ?? 0;
      const twoPane = detailMounted && asideRight > 0 && detailLeft >= asideRight - 1;
      const noOverflow = document.documentElement.scrollWidth <= 768;
      return (
        asideWidth === 320 &&
        asideHeader &&
        crewSeeded &&
        crewMembers &&
        detailMounted &&
        emptyState &&
        plainVariant &&
        twoPane &&
        noOverflow
      );
    },
    null,
    { timeout: 15000 },
  );
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/108-clone-bi-rotation-midband-dark-studygroups.png` });

  // ---- The distinct-frame verification — the AR7 gate, the s93 I5 shape --
  const md5 = (p) => createHash("md5").update(readFileSync(p)).digest("hex");
  const frames = [
    `${OUT}/108-clone-bi-rotation-midband-dark-practicetests.png`,
    `${OUT}/108-clone-bi-rotation-midband-dark-studygroups.png`,
  ].map(md5);
  const distinct = new Set(frames).size === frames.length;
  if (!distinct) {
    // The failure path prints its OWN line — no success-shaped prose on a
    // failed gate. The S95/AV2 semantics: process.exitCode = 1 (the
    // S91/AR7 gate semantics — an exit-code-checking wrapper must see the
    // failure).
    console.log(`S108 BI frames DUPLICATE: ${frames.join(" ")} — the md5 gate FAILS this run`);
    process.exitCode = 1;
    md5Failed = true;
  } else {
    console.log(`S108 BI frames: ${frames.join(" ")} — all DISTINCT`);
  }
} catch (err) {
  // The AX3 shape (the s96 audit's I3): the failure path is gate-OWNED — a
  // mid-run throw exits 1 through this catch with a script-owned failure
  // line, not through node's unhandled-rejection spew. The md5Failed
  // shape generalized: every failure path sets process.exitCode = 1, and
  // the completion line below keys on the explicit booleans.
  console.error(`S108 BI surface captures FAILED: ${err?.message ?? err}`);
  process.exitCode = 1;
  thrown = true;
} finally {
  // The S4 restore lesson: the shared demo surface is restored (accent
  // violet, mode LIGHT) on EVERY path — awaited, so a failed pin can
  // never poison the shared user record for later specs (the S4
  // accent-restore lesson; the only mutation this capture makes).
  await page.request
    .patch(`${BASE}${PREFERENCES}`, { data: { accentColor: "violet", themeMode: "light" } })
    .catch(() => {});
  await context.close().catch(() => {});
  await browser.close().catch(() => {});
  await prisma.$disconnect().catch(() => {});
}
// The s93 I5 shape: the completion line is gated on the explicit boolean
// (the AX3 shape: both of them — no success-shaped prose on any failed path).
if (!md5Failed && !thrown) console.log("S108 BI surface captures complete");
