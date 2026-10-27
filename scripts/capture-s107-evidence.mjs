// S107 · Batch BH surface evidence captures — the register rotation (the
// BH1 headline: the BG1 register note's 227/108 counts describe the
// pre-BG-rider tree; the post-BG final-tree re-derivation is 229 importers
// / 110 carriers / 0 stale / 119 usage-line-free — the doctrine's own
// predicted drift, closed by the register rotation, not a pin change) +
// the s107 LANDSCAPE evidence-frame rotation — the viewport axis's LAST
// never-varied band.
//
// BH frames (the GUARDED surfaces, on the final build, both seeded-data
// deterministic — zero persistent state BY CONSTRUCTION, no dialog, no
// mutation, no route abort; the S102 lesson-2 doctrine: a seeded-data
// frame is the cleanest rotation — the seed is the deterministic driver
// that already ran): the rotation program's 14 committed frames cover
// exactly two viewport cells — 1280×800 desktop (s96–s104, dark) and
// 390×844 mobile-portrait (s105–s106, dark) — and 844×390 LANDSCAPE has
// NEVER been varied (the S105 lesson-1: an axis never varied is an axis
// never verified; the S105 precedent opened mobile, this cycle opens
// landscape). Both frames below render at 844×390 in DARK.
//
// Frame 1: the DRAWER NAV-SCROLL at 844×390 in DARK — the below-lg chrome
// renders at 844 wide BY CONSTRUCTION (the 1024 lg breakpoint), the
// slide-in drawer (w-72 max-w-[85vw], the 89px S3-L brand header with the
// border-b divider) with its nav list nav[aria-label="Primary"] — the
// sf-scroll flex flex-1 flex-col overflow-y-auto p-4 container: at the
// 390px viewport height the 20-link list MUST SCROLL (scrollHeight >
// clientHeight — the LANDSCAPE-ONLY discriminator: at portrait-mobile the
// list fits unscrolled, at ≥1024 the desktop rail replaces the drawer);
// the surface is landscape-only BY CONSTRUCTION — the strongest-candidate
// class generalized from the S105 lesson-2 [viewport-band-uncapturable at
// the other bands]; the drawer leg is open-capture-close — no navigation,
// the auto-close contract untouched, ZERO persistent state (the
// mobileMenuOpen store is client-local).
//
// Frame 2: the TASKS view at 844×390 in DARK — the FIRST rotation frame
// for the Tasks view (the coverage gap: zero rotation frames across the
// entire 14-frame lineage touch Tasks — the view standing-covered only by
// the era-2/e2e evidence); the pill-family row asserted BOTH sides of the
// seed's boundary (the S106 lesson-2): the overdue "Return library books"
// row carries .sf-pill-red (the S92/AS1 red-700 family — the at(-2)
// seeded past; the today-due rows render red too, daysUntil <= 0), the
// boundary row "Weekly vocabulary review" (repeat: weekly, NO dueDate)
// renders the violet RepeatPill + the slate SubjectChip and NO DuePill —
// the class-overlap trap honored (the SubjectChip shares bg-slate-100
// text-slate-600 dark:bg-slate-800 dark:text-slate-300 with the future
// DuePill — the gate discriminates by ROW scoping + the .sf-pill-red
// family, never by the slate class alone); the leg is a pure seed read,
// ZERO interaction.
//
// Both frames md5-DISTINCT (the AR7 gate; the s93 I5 shape: the explicit
// boolean gate, the failure path prints its own line, the completion line
// only on green — the S95/AV2 exit-code semantics: process.exitCode = 1 on
// the failure branch; the AX3 catch generalized to EVERY failed path,
// carried here). The S4 restore lesson on EVERY path: the theme back to
// violet/light (this capture runs on the PERSISTENT custom.db — the API
// PATCH is the only mutation and the finally restores it awaited).
//
// Usage: node scripts/capture-s107-evidence.mjs
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

// The LANDSCAPE viewport — 844×390, the viewport axis's last never-varied
// band (the rotation program's prior cells: 1280×800 desktop, 390×844
// mobile-portrait); the below-1024 chrome renders at 844 wide BY
// CONSTRUCTION, so the mobile drawer + the below-lg app bar are the
// landscape surface.
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

  // ============ BH · the guarded surface, leg 1 (landscape dark drawer) =
  // DARK mode (the S10 API pattern — the gotoDark spec contract: PATCH the
  // preference, then NAVIGATE; the boot script applies the mode on load).
  await page.request.patch(`${BASE}${PREFERENCES}`, { data: { accentColor: "violet", themeMode: "dark" } });
  await page.goto(`${BASE}/Dashboard`);
  await page.waitForFunction(
    () =>
      document.documentElement.classList.contains("dark") &&
      document.documentElement.style.getPropertyValue("--sf-primary") !== "",
    null,
    { timeout: 15000 },
  );
  // Open the drawer (the below-lg hamburger — renders at 844 wide BY
  // CONSTRUCTION), then assert the LANDSCAPE nav-scroll geometry: the
  // nav[aria-label="Primary"] list (sf-scroll overflow-y-auto) with its 20
  // NavItemLinks MUST SCROLL at the 390px viewport height — scrollHeight >
  // clientHeight, the landscape-only discriminator (portrait fits, ≥1024
  // replaces the drawer with the desktop rail); the S3-L brand header
  // contract (the border-b divider block, "StudyFlow" + "Your study
  // companion"); the w-72 panel inside the 844 viewport.
  await page.click('button[aria-label="Open navigation menu"]');
  await page.waitForFunction(
    () => {
      const dialog = document.querySelector('div[role="dialog"][aria-label="Navigation menu"]');
      const dialogMounted = !!dialog;
      // Scoped to the DIALOG — the desktop sidebar's nav carries the SAME
      // aria-label="Primary" and renders FIRST in DOM order (hidden
      // lg:flex → display:none at 844 → the unscoped selector reads the
      // hidden element's 0/0 geometry); the dialog-scoped query is the
      // drawer's own nav.
      const nav = dialog?.querySelector('nav[aria-label="Primary"]') ?? null;
      const panel = dialog?.querySelector(".sf-slide-in") ?? null;
      const panelWidth = panel ? Math.round(panel.getBoundingClientRect().width) : 0;
      const panelDark = panel ? (panel.getAttribute("class") ?? "").includes("dark:bg-slate-950") : false;
      const navScroll =
        !!nav &&
        (nav.getAttribute("class") ?? "").includes("overflow-y-auto") &&
        nav.scrollHeight > nav.clientHeight + 200;
      const navLinks = nav ? nav.querySelectorAll("a").length : 0;
      const brand =
        !!dialog &&
        dialog.textContent?.includes("StudyFlow") === true &&
        dialog.textContent?.includes("Your study companion") === true;
      const brandDivider = !!dialog?.querySelector(".border-b");
      const closeBtn = !!dialog?.querySelector('button[aria-label="Close menu"]');
      const backdrop = !!dialog?.querySelector('button[aria-label="Close navigation menu"]');
      return (
        dialogMounted &&
        panelDark &&
        panelWidth === 288 &&
        navScroll &&
        navLinks === 20 &&
        brand &&
        brandDivider &&
        closeBtn &&
        backdrop
      );
    },
    null,
    { timeout: 15000 },
  );
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/107-clone-bh-rotation-landscape-dark-drawer-navscroll.png` });
  // Close the drawer through its own X — the drawer UNMOUNTS (the
  // zero-persistent-state close; no navigation, the route untouched).
  await page.click('div[role="dialog"] button[aria-label="Close menu"]');
  await page.waitForFunction(
    () => !document.querySelector('div[role="dialog"][aria-label="Navigation menu"]'),
    null,
    { timeout: 10000 },
  );

  // ============ BH · leg 2 — the landscape dark Tasks (the pill family) =
  // Still dark (the same PATCH owns the window) — NAVIGATE to the Tasks
  // view; the seeded rows and the pill families render.
  await page.goto(`${BASE}/Tasks`);
  await page.waitForFunction(
    () =>
      document.documentElement.classList.contains("dark") &&
      document.documentElement.style.getPropertyValue("--sf-primary") !== "",
    null,
    { timeout: 15000 },
  );
  // The landscape Tasks' guarded families — the view header (h1 "All
  // Tasks" — the default-list label, the view's own h1 renders the ACTIVE
  // list's name, not a static "Tasks"), the two-pane landscape layout (the
  // aria-label="Task views" aside is hidden below md and renders AT 844 —
  // the md:flex mid-band, part of the landscape frame's novelty), the
  // overdue "Return library books" row carrying .sf-pill-red (the S92/AS1
  // red-700 family — the at(-2) seeded past; the today-due rows render
  // red too, daysUntil <= 0), the boundary row "Weekly vocabulary review"
  // (repeat: weekly, NO dueDate) rendering the violet RepeatPill + the
  // slate SubjectChip and NO .sf-pill-red inside the row (the S106
  // lesson-2: assert BOTH sides of the seed's boundary; the class-overlap
  // trap — the SubjectChip shares the future DuePill's slate classes, so
  // the gate discriminates by ROW scoping + the red family, never by the
  // slate class alone), and the landscape no-overflow contract (scrollWidth
  // <= 844).
  await page.waitForFunction(
    () => {
      const h1 = document.querySelector("h1");
      const header = !!h1 && h1.textContent?.trim() === "All Tasks";
      const aside = !!document.querySelector('aside[aria-label="Task views"]');
      const rows = [...document.querySelectorAll(".group.rounded-xl")];
      const overdueRow = rows.find((r) => r.textContent?.includes("Return library books"));
      const overdueRed = !!overdueRow?.querySelector(".sf-pill-red");
      const boundaryRow = rows.find((r) => r.textContent?.includes("Weekly vocabulary review"));
      const boundaryRepeat = !!boundaryRow?.querySelector(
        'span.bg-violet-100, span[class*="bg-violet-100"]',
      );
      const boundaryNoRed = !!boundaryRow && !boundaryRow.querySelector(".sf-pill-red");
      const boundaryChip = !!boundaryRow?.querySelector(
        'span.bg-slate-100[class*="text-slate-600"], span[class*="bg-slate-100"][class*="text-slate-600"]',
      );
      const seededRows = ["Finish calculus problem set", "Read chapter 4 — vectors"].every((n) =>
        document.body.innerText.includes(n),
      );
      const noOverflow = document.documentElement.scrollWidth <= 844;
      return header && aside && overdueRed && boundaryRepeat && boundaryNoRed && boundaryChip && seededRows && noOverflow;
    },
    null,
    { timeout: 15000 },
  );
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/107-clone-bh-rotation-landscape-dark-tasks.png` });

  // ---- The distinct-frame verification — the AR7 gate, the s93 I5 shape --
  const md5 = (p) => createHash("md5").update(readFileSync(p)).digest("hex");
  const frames = [
    `${OUT}/107-clone-bh-rotation-landscape-dark-drawer-navscroll.png`,
    `${OUT}/107-clone-bh-rotation-landscape-dark-tasks.png`,
  ].map(md5);
  const distinct = new Set(frames).size === frames.length;
  if (!distinct) {
    // The failure path prints its OWN line — no success-shaped prose on a
    // failed gate. The S95/AV2 semantics: process.exitCode = 1 (the
    // S91/AR7 gate semantics — an exit-code-checking wrapper must see the
    // failure).
    console.log(`S107 BH frames DUPLICATE: ${frames.join(" ")} — the md5 gate FAILS this run`);
    process.exitCode = 1;
    md5Failed = true;
  } else {
    console.log(`S107 BH frames: ${frames.join(" ")} — all DISTINCT`);
  }
} catch (err) {
  // The AX3 shape (the s96 audit's I3): the failure path is gate-OWNED — a
  // mid-run throw exits 1 through this catch with a script-owned failure
  // line, not through node's unhandled-rejection spew. The md5Failed
  // shape generalized: every failure path sets process.exitCode = 1, and
  // the completion line below keys on the explicit booleans.
  console.error(`S107 BH surface captures FAILED: ${err?.message ?? err}`);
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
if (!md5Failed && !thrown) console.log("S107 BH surface captures complete");
