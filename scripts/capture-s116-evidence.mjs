// S116 · Batch BQ surface evidence captures — the register rotation (the
// BQ1 headline: the BP1 register note's 245/126 counts describe the
// pre-s115-rider tree; the post-BP final-tree re-derivation is 247 importers
// / 128 carriers / 0 stale / 119 usage-line-free — the doctrine's own
// predicted drift, closed by the register rotation, not a pin change) +
// the s116 MOBILE-LANDSCAPE LIGHT evidence-frame rotation — the rotation
// program's SECOND PASS's cycle four, the LIGHT QUARTET's closing cell
// (the second pass has second-passed desktop light [s113 — Flashcards +
// Timetable], mobile-portrait light [s114 — Dashboard + Notes], mid-band
// light [s115 — PracticeTests + StudyGroups]; this cycle closes the
// quartet with the landscape-light cell and the s107 pair, both surfaces'
// FIRST light-side frames).
//
// BQ frames (the GUARDED surfaces, on the final build, both seeded-data
// deterministic — zero persistent state BY CONSTRUCTION on the Tasks leg,
// open-capture-close zero-persistent-state on the drawer leg, no dialog
// mutation, no route abort; the S102 lesson-2 doctrine: a seeded-data
// frame is the cleanest rotation — the seed is the deterministic driver
// that already ran): the rotation program's 32 committed frames cover
// 1280×800 desktop ×10 dark (s100–s104) + ×4 light (s109 — Events +
// Analytics; s113 — Flashcards + Timetable), 390×844 mobile-portrait ×4
// dark (s105–s106) + ×4 light (s110 — Settings + Files; s114 — Dashboard
// + Notes), 844×390 mobile-landscape ×2 dark (s107 — the drawer nav-scroll
// + Tasks) + ×2 light (s111 — Calendar + FocusTimer), 768×1024 mid-band
// ×2 dark (s108 — PracticeTests + StudyGroups) + ×4 light (s112 —
// MathSolver + AIAssistant; s115 — PracticeTests + StudyGroups). The
// second pass's cycle four rotates onto the LANDSCAPE LIGHT cell (844×390
// — the thinnest light coverage, ×2, the light quartet's LAST
// never-second-passed cell) with the two surfaces whose prior rotation
// frames are ALL dark-side AND whose only prior frames are the same-cell
// dark flips (the BN selection shape): the DRAWER NAV-SCROLL and the TASKS
// view — the s107 pair, both taking their FIRST light-side frames (the
// landscape chrome is the below-lg app-bar + hamburger BY CONSTRUCTION at
// 844, the lg:flex desktop rail absent).
//
// Frame 1: the DRAWER NAV-SCROLL at 844×390 in LIGHT — the surface's FIRST
// light-side rotation frame (its 1 prior frame dark [s107 landscape dark]).
// The below-1024 chrome (the aria-labeled "Open navigation menu" hamburger
// + the .sf-clock-date clock chip), the 288px w-72 panel (max-w-[85vw])
// over the light rgb(255,255,255) surface, the S3-L brand header (the
// border-b divider, "StudyFlow" + "Your study companion"), the 20
// NavItemLinks, and the LANDSCAPE-ONLY structural discriminator: the nav
// list sf-scroll flex flex-1 flex-col overflow-y-auto with scrollHeight >
// clientHeight (992 > 301 at the pinning probe — the 20-link list MUST
// scroll at the 390px viewport height while the portrait 390×844 list
// fits unscrolled), the dialog semantics [role="dialog",
// aria-label="Navigation menu"], and the landscape no-overflow contract
// (scrollWidth <= 844). The drawer leg open-capture-close, no navigation,
// ZERO persistent state (the s107 doctrine).
//
// Frame 2: the TASKS view at 844×390 in LIGHT — the view's FIRST
// light-side rotation frame (its 1 prior frame dark [s107 landscape
// dark]). The active-list h1 "All Tasks" (the S107 lesson-3 — the DERIVED
// value the seed deterministically produces, never the route name), the
// two-pane landscape layout (the md:flex aside rendered AT 844 — the
// band's structural discriminator vs the 390 stacked form, the aside
// side-by-side with the task list), the pill family asserted BOTH sides
// of the seed's boundary (the S106 lesson-2): the overdue "Return library
// books" row carries the .sf-pill-red family (the at(-2) seeded past —
// the RED FAMILY is the gate, NEVER the exact date: the pill's date text
// is day-relative and ages across midnight), the boundary row "Weekly
// vocabulary review" (repeat: weekly, NO dueDate) renders the violet
// RepeatPill + the slate SubjectChip and NO red pill inside the row (the
// class-overlap trap honored — the SubjectChip shares the slate classes
// with the future DuePill; the gate discriminates by ROW scoping + the
// red family, never the slate class alone), the below-lg app bar (the
// aria-labeled hamburger + the clock chip), and the landscape
// no-overflow contract (scrollWidth <= 844). The CONTENT gate, never the
// shell alone (the S114 lesson-2).
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
// Usage: node scripts/capture-s116-evidence.mjs
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

// The LANDSCAPE viewport — 844×390, the rotation program's
// mobile-landscape cell (its committed light frames: Calendar +
// FocusTimer at s111; the second pass's cycle four rotates here with the
// s107 pair); the below-lg app bar + the aria-labeled hamburger render
// BY CONSTRUCTION at 844 while the lg:flex desktop rail chrome stays
// hidden — the full landscape light shape — and the 390px viewport
// height makes the drawer's 20-link nav list scroll (the landscape-only
// discriminator).
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

  // ============ BQ · the guarded surface, leg 1 (landscape light drawer) ==
  // LIGHT mode (the S10 API pattern — the gotoDark spec contract inverted:
  // PATCH the preference, then NAVIGATE; the boot script applies the mode
  // on load). The PATCH is explicit — the demo user's stored mode is the
  // closing state (light) but a prior failed run must never strand a dark
  // window for this leg.
  await page.request.patch(`${BASE}${PREFERENCES}`, { data: { accentColor: "violet", themeMode: "light" } });
  await page.goto(`${BASE}/Tasks`);
  await page.waitForFunction(
    () =>
      !document.documentElement.classList.contains("dark") &&
      document.documentElement.style.getPropertyValue("--sf-primary") !== "",
    null,
    { timeout: 15000 },
  );
  // The landscape-light drawer's guarded families — the CONTENT gate first
  // (the S114 lesson-2): open the drawer through the aria-labeled
  // hamburger (the REAL click path), then gate on the drawer's own
  // surfaces: the dialog semantics [role="dialog", aria-label="Navigation
  // menu"], the 288px w-72 panel (max-w-[85vw]) over the light
  // rgb(255,255,255) surface, the S3-L brand header ("StudyFlow" + "Your
  // study companion" — the border-b divider block), the 20 NavItemLinks,
  // and the LANDSCAPE-ONLY structural discriminator: the nav list's
  // scrollHeight > clientHeight (the 20-link list MUST scroll at the 390px
  // viewport height — at portrait 390×844 the list fits unscrolled; the
  // scroll geometry is the landscape-band-only evidence), plus the
  // below-lg app bar chrome that renders at 844 BY CONSTRUCTION, and the
  // landscape no-overflow contract (scrollWidth <= 844). The S107
  // lesson-2 honored: the drawer queries are DIALOG-SCOPED (the hidden
  // desktop rail shares aria-label="Primary" and renders first in DOM
  // order — an unscoped selector reads the hidden element's 0/0 geometry).
  await page.click('button[aria-label="Open navigation menu"]');
  await page.waitForFunction(
    () => {
      const html = document.documentElement;
      const lightShell = !html.classList.contains("dark");
      const dialog = document.querySelector('[role="dialog"][aria-label="Navigation menu"]');
      const dialogMounted = !!dialog;
      const panel = dialog?.querySelector(".sf-slide-in") ?? null;
      const panelW = panel ? Math.round(panel.getBoundingClientRect().width) : 0;
      const panelLight = panel ? getComputedStyle(panel).backgroundColor === "rgb(255, 255, 255)" : false;
      const brandTitle = panel?.querySelector("p")?.textContent?.trim();
      const brandOk = brandTitle === "StudyFlow";
      const subtitleOk = panel?.textContent?.includes("Your study companion") === true;
      const brandDivider = panel ? !!panel.querySelector(".border-b") : false;
      // DIALOG-SCOPED nav (the S107 lesson-2): the links inside the dialog
      // only — the hidden desktop rail never enters the count.
      const navLinks = dialog
        ? [...dialog.querySelectorAll("a")].filter((a) => a.getBoundingClientRect().width > 0)
        : [];
      const navCount = navLinks.length;
      const navSetOk =
        navCount === 20 &&
        ["Dashboard", "My Day", "Tasks", "Settings"].every((l) =>
          navLinks.some((a) => a.textContent?.trim() === l),
        );
      const list = dialog?.querySelector(".sf-scroll") ?? null;
      const scrolls = list ? list.scrollHeight > list.clientHeight : false;
      const listOk = list ? list.classList.contains("overflow-y-auto") : false;
      const noOverflow = document.documentElement.scrollWidth <= 844;
      return (
        lightShell && dialogMounted && panelW === 288 && panelLight && brandOk &&
        subtitleOk && brandDivider && navSetOk && navCount === 20 && scrolls && listOk && noOverflow
      );
    },
    null,
    { timeout: 15000 },
  );
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/116-clone-bq-rotation-light-landscape-drawer-navscroll.png` });
  // The drawer leg: open-capture-close, no navigation, ZERO persistent
  // state (the s107 doctrine). A REAL Escape keypress closes (the
  // standing mobile-nav contract).
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => !document.querySelector('[role="dialog"]'), null, { timeout: 10000 });

  // ============ BQ · leg 2 — the landscape light tasks ================
  // Still light (the same PATCH owns the window) — NAVIGATE to the Tasks
  // view; the two-pane md:flex layout renders AT 844 and the seeded rows
  // ride the pure seed read (ZERO interaction).
  await page.goto(`${BASE}/Tasks`);
  await page.waitForFunction(
    () =>
      !document.documentElement.classList.contains("dark") &&
      document.documentElement.style.getPropertyValue("--sf-primary") !== "",
    null,
    { timeout: 15000 },
  );
  // The landscape-light Tasks' guarded families — the CONTENT gate, never
  // the shell alone (the S114 lesson-2): the active-list h1 "All Tasks"
  // (the S107 lesson-3 — the DERIVED value the seed deterministically
  // produces, never the route name), the two-pane landscape layout (the
  // md:flex aside rendered AT 844, side-by-side with the task list — the
  // band's structural discriminator vs the 390 stacked form), the pill
  // family asserted BOTH sides of the seed's boundary (the S106 lesson-2):
  // the overdue "Return library books" row carries the .sf-pill-red family
  // (the at(-2) seeded past — the RED FAMILY is the gate, NEVER the exact
  // date: the pill's date text is day-relative and ages across midnight),
  // the boundary row "Weekly vocabulary review" (repeat: weekly, NO
  // dueDate) renders the violet RepeatPill + the slate SubjectChip and NO
  // red pill inside the row (the class-overlap trap honored — the
  // SubjectChip shares the slate classes with the future DuePill; the gate
  // discriminates by ROW scoping + the red family, never the slate class
  // alone), the below-lg app bar (the aria-labeled hamburger + the clock
  // chip), and the landscape no-overflow contract (scrollWidth <= 844).
  await page.waitForFunction(
    () => {
      const html = document.documentElement;
      const lightShell = !html.classList.contains("dark");
      const main = document.querySelector("main");
      const h1 = main?.querySelector("h1");
      const headerOk = !!h1 && h1.textContent?.trim() === "All Tasks";
      // The two-pane landscape layout: the md:flex aside renders AT 844
      // (side-by-side, not the 390 stacked form). The task rows themselves
      // prove the split — a row's left edge sits right of the aside (the
      // row container is the div.group.rounded-xl card, never a ul/li —
      // the S112 lesson-2 element-axis doctrine: probe the tag before the
      // gate is written).
      const aside = main?.querySelector("aside") ?? null;
      const asideMounted = !!aside;
      const asideRect = aside?.getBoundingClientRect();
      const asideSideBySide = asideRect ? asideRect.width >= 150 && asideRect.height > 100 : false;
      // The overdue row: the RED FAMILY on the seeded at(-2) task (never
      // the exact date — day-relative text ages across midnight). The row
      // is the rounded-xl card containing the title <p>.
      const rows = [...(main?.querySelectorAll("div.rounded-xl") ?? [])];
      const overdue = rows.find((r) => r.textContent?.includes("Return library books"));
      const overdueRow = !!overdue;
      const overdueRedPill = overdue ? !!overdue.querySelector(".sf-pill-red") : false;
      const overdueRect = overdue?.getBoundingClientRect();
      const panesSplit =
        !!overdueRect && !!asideRect && overdueRect.left >= asideRect.right - 1;
      // The boundary row: the violet RepeatPill + the slate SubjectChip,
      // NO red pill inside the row (ROW-scoped — the class-overlap trap).
      const boundary = rows.find((r) => r.textContent?.includes("Weekly vocabulary review"));
      const boundaryRow = !!boundary;
      const boundaryViolet = boundary
        ? [...boundary.querySelectorAll("[class*='violet']")].some((el) =>
            getComputedStyle(el).color.includes("124, 58, 237"),
          )
        : false;
      const boundarySlateChip = boundary
        ? !!boundary.querySelector("[class*='bg-slate-100'], [class*='bg-slate-200']")
        : false;
      const boundaryNoRed = boundary ? !boundary.querySelector(".sf-pill-red") : false;
      const appBar = !!document.querySelector('button[aria-label="Open navigation menu"]');
      const clockChip = !!document.querySelector(".sf-clock-date");
      const noOverflow = document.documentElement.scrollWidth <= 844;
      return (
        lightShell && headerOk && asideMounted && asideSideBySide && panesSplit &&
        overdueRow && overdueRedPill && boundaryRow && boundaryViolet &&
        boundarySlateChip && boundaryNoRed && appBar && clockChip && noOverflow
      );
    },
    null,
    { timeout: 15000 },
  );
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/116-clone-bq-rotation-light-landscape-tasks.png` });

  // ---- The distinct-frame verification — the AR7 gate, the s93 I5 shape --
  const md5 = (p) => createHash("md5").update(readFileSync(p)).digest("hex");
  const frames = [
    `${OUT}/116-clone-bq-rotation-light-landscape-drawer-navscroll.png`,
    `${OUT}/116-clone-bq-rotation-light-landscape-tasks.png`,
  ].map(md5);
  const distinct = new Set(frames).size === frames.length;
  if (!distinct) {
    // The failure path prints its OWN line — no success-shaped prose on a
    // failed gate. The S95/AV2 semantics: process.exitCode = 1 (the
    // S91/AR7 gate semantics — an exit-code-checking wrapper must see the
    // failure).
    console.log(`S116 BQ frames DUPLICATE: ${frames.join(" ")} — the md5 gate FAILS this run`);
    process.exitCode = 1;
    md5Failed = true;
  } else {
    console.log(`S116 BQ frames: ${frames.join(" ")} — all DISTINCT`);
  }
} catch (err) {
  // The AX3 shape (the s96 audit's I3): the failure path is gate-OWNED — a
  // mid-run throw exits 1 through this catch with a script-owned failure
  // line, not through node's unhandled-rejection spew. The md5Failed
  // shape generalized: every failure path sets process.exitCode = 1, and
  // the completion line below keys on the explicit booleans.
  console.error(`S116 BQ surface captures FAILED: ${err?.message ?? err}`);
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
if (!md5Failed && !thrown) console.log("S116 BQ surface captures complete");
