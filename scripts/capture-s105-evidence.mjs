// S105 · Batch BF surface evidence captures — the register rotation (the
// BF1 headline: the BE1 register note's 223/104 counts describe the
// pre-BE-rider tree; the post-BE final-tree re-derivation is 225 importers
// / 106 carriers / 0 stale / 119 usage-line-free — the doctrine's own
// predicted drift, closed by the register rotation, not a pin change) +
// the s105 MOBILE evidence-frame rotation rendered live on two guarded
// surfaces NO prior evidence frame has covered.
//
// BF frames (the GUARDED surfaces, on the final build, both seeded-data
// deterministic — zero persistent state BY CONSTRUCTION, no dialog, no
// mutation, no route abort, ZERO INTERACTION; the S102 lesson-2 doctrine:
// a seeded-data frame is the cleanest rotation — the seed is the
// deterministic driver that already ran): the VIEWPORT AXIS the rotation
// program has NEVER varied — every s87–s104 frame is a desktop 1280×800
// capture, the AP-79/AP-80 lesson class (an axis never varied is an axis
// never verified), while the standing mobile captures are LIGHT
// dashboard/drawer/tasks only; both frames below render at 390×844 (the
// S33 mobile canonical) in DARK, both e2e-pinned by the S33 mobile sweep +
// the S36 dark-mobile sweep (all 20 views through the drawer at 390×844 in
// both modes) + their own surface pins.
//
// Frame 1: the TIMETABLE view MOBILE at 390×844 in DARK — the `md:hidden`
// day accordion (timetable-view.tsx), a surface that CANNOT exist at
// desktop (max-md:hidden week grid) and has NEVER been captured in ANY
// mode by ANY prior evidence frame: the `sf-chip-dark` "Today" chip (the
// S11 mobile today chip — the family's first rotation-frame subject; its
// only other consumer is the Settings avatar chip, standing-covered) +
// the today accordion header's `sf-today-tint` + the today date chip's
// `sf-selected-tint` (the 2-digit day-of-month span); `openDay` defaults
// to `today.getDay()` — the today section renders OPEN deterministically
// every day; the seeded Mon–Fri classes render in the day sections —
// Physics (dayOfWeek 1, the ISO Tuesday column) in the open today section
// at capture time; the fixed glass mobile app bar (brand + 2-digit-hour
// clock) above; the desktop week grid hidden at this viewport.
//
// Frame 2: the DASHBOARD view MOBILE at 390×844 in DARK — the stacked
// mobile dashboard, the mobile DARK surface never captured anywhere (the
// standing set carries desktop dark + mobile LIGHT only): the conditional
// `sf-overdue-banner` (dashboard-view.tsx's S9-A-pinned surface — the
// seeded incomplete overdue task "Return library books", at(-2), renders
// the "You have 1 overdue item" alert; the family's first MOBILE evidence
// frame — standing-covered at desktop dark only) + the four stat cards +
// today's tasks at the stacked layout; the mobile app bar above.
//
// Both frames md5-DISTINCT (the AR7 gate; the s93 I5 shape: the explicit
// boolean gate, the failure path prints its own line, the completion line
// only on green — the S95/AV2 exit-code semantics: process.exitCode = 1 on
// the failure branch; the AX3 catch generalized to EVERY failed path,
// carried here). The S4 restore lesson on EVERY path: the theme back to
// violet/light (this capture runs on the PERSISTENT custom.db — the API
// PATCH is the only mutation and the finally restores it awaited).
//
// Usage: node scripts/capture-s105-evidence.mjs
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

// The MOBILE viewport — the S33 mobile canonical (390×844), the axis the
// rotation program never varied before this cycle.
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

  // ============ BF · the guarded surface, leg 1 (mobile dark Timetable) ==
  // DARK mode (the S10 API pattern — the gotoDark spec contract: PATCH the
  // preference, then NAVIGATE; the boot script applies the mode on load).
  await page.request.patch(`${BASE}${PREFERENCES}`, { data: { accentColor: "violet", themeMode: "dark" } });
  await page.goto(`${BASE}/Timetable`);
  await page.waitForFunction(
    () =>
      document.documentElement.classList.contains("dark") &&
      document.documentElement.style.getPropertyValue("--sf-primary") !== "",
    null,
    { timeout: 15000 },
  );
  // The mobile accordion's guarded families — the today chip (sf-chip-dark,
  // the family's first rotation-frame subject), the today accordion header
  // (sf-today-tint, open by construction: openDay defaults to
  // today.getDay()), the today date chip (sf-selected-tint on the
  // day-of-month span), the seeded Physics class in the open today section
  // (dayOfWeek 1 — the ISO Tuesday column), the fixed glass app bar, the
  // desktop week grid HIDDEN at this viewport (the md contract), and the
  // S33 mobile no-overflow contract (scrollWidth ≤ 390).
  await page.waitForFunction(
    () => {
      const todayChip = document.querySelector(".sf-chip-dark");
      const todayHeader = [...document.querySelectorAll("button.sf-today-tint")].find(
        (b) => b.getAttribute("aria-expanded") === "true",
      );
      const todayNum = String(new Date().getDate());
      const todayDateChip = [...document.querySelectorAll("span.sf-selected-tint")].some(
        (el) => (el.textContent ?? "").trim() === todayNum,
      );
      const weekGrid = document.querySelector('[aria-label="Week grid"]');
      const gridHidden = !weekGrid || weekGrid.getBoundingClientRect().width === 0;
      const appBar = !!document.querySelector('button[aria-label="Open navigation menu"]');
      const noOverflow = document.documentElement.scrollWidth <= 390;
      return (
        !!todayChip &&
        (todayChip.textContent ?? "").includes("Today") &&
        !!todayHeader &&
        todayDateChip &&
        gridHidden &&
        appBar &&
        noOverflow &&
        document.body.innerText.includes("Physics")
      );
    },
    null,
    { timeout: 15000 },
  );
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/105-clone-bf-rotation-mobile-dark-timetable.png` });

  // ============ BF · leg 2 — the mobile dark Dashboard (overdue banner) ==
  // Still dark (the same PATCH owns the window) — NAVIGATE to the Dashboard
  // view; the seeded overdue task renders the conditional banner.
  await page.goto(`${BASE}/Dashboard`);
  await page.waitForFunction(
    () =>
      document.documentElement.classList.contains("dark") &&
      document.documentElement.style.getPropertyValue("--sf-primary") !== "",
    null,
    { timeout: 15000 },
  );
  // The mobile dashboard's guarded families — the conditional overdue
  // banner (sf-overdue-banner, the S9-A-pinned surface: the seeded
  // incomplete "Return library books" task at(-2) renders the alert; the
  // family's first MOBILE evidence frame — standing-covered at desktop
  // dark only) + today's tasks list + the fixed glass app bar + the S33
  // no-overflow contract.
  await page.waitForFunction(
    () => {
      const banner = document.querySelector('[aria-label="Overdue alert"]');
      const bannerFamily = !!banner && (banner.getAttribute("class") ?? "").includes("sf-overdue-banner");
      const todayTasks = !!document.querySelector('[aria-label="Today\'s tasks"]');
      const appBar = !!document.querySelector('button[aria-label="Open navigation menu"]');
      const noOverflow = document.documentElement.scrollWidth <= 390;
      return (
        bannerFamily &&
        (banner?.textContent ?? "").includes("overdue item") &&
        todayTasks &&
        appBar &&
        noOverflow
      );
    },
    null,
    { timeout: 15000 },
  );
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/105-clone-bf-rotation-mobile-dark-dashboard.png` });

  // ---- The distinct-frame verification — the AR7 gate, the s93 I5 shape --
  const md5 = (p) => createHash("md5").update(readFileSync(p)).digest("hex");
  const frames = [
    `${OUT}/105-clone-bf-rotation-mobile-dark-timetable.png`,
    `${OUT}/105-clone-bf-rotation-mobile-dark-dashboard.png`,
  ].map(md5);
  const distinct = new Set(frames).size === frames.length;
  if (!distinct) {
    // The failure path prints its OWN line — no success-shaped prose on a
    // failed gate. The S95/AV2 semantics: process.exitCode = 1 (the
    // S91/AR7 gate semantics — an exit-code-checking wrapper must see the
    // failure).
    console.log(`S105 BF frames DUPLICATE: ${frames.join(" ")} — the md5 gate FAILS this run`);
    process.exitCode = 1;
    md5Failed = true;
  } else {
    console.log(`S105 BF frames: ${frames.join(" ")} — all DISTINCT`);
  }
} catch (err) {
  // The AX3 shape (the s96 audit's I3): the failure path is gate-OWNED — a
  // mid-run throw exits 1 through this catch with a script-owned failure
  // line, not through node's unhandled-rejection spew. The md5Failed
  // shape generalized: every failure path sets process.exitCode = 1, and
  // the completion line below keys on the explicit booleans.
  console.error(`S105 BF surface captures FAILED: ${err?.message ?? err}`);
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
if (!md5Failed && !thrown) console.log("S105 BF surface captures complete");
