// S104 · Batch BE surface evidence captures — the register rotation (the
// BE1 headline: the BD1 register note's 221/100 counts describe the
// pre-BD-rider tree; the post-BD final-tree re-derivation is 223 importers
// / 104 carriers / 0 stale / 119 usage-line-free — the doctrine's own
// predicted drift, closed by the register rotation, not a pin change) +
// the s104 evidence-frame rotation rendered live on two guarded surfaces
// NO prior evidence frame has covered.
//
// BE frames (the GUARDED surfaces, on the final build, both seeded-data
// deterministic — zero persistent state BY CONSTRUCTION, no dialog, no
// mutation, no route abort; the S102 lesson-2 doctrine: a seeded-data
// frame is the cleanest rotation — the seed is the deterministic driver
// that already ran): Frame 1: the TIMETABLE view in DARK —
// timetable-view.tsx's sf-today-tint today-header, the S10-4-pinned
// surface: the `[data-today-header]` chip renders on the current week's
// today column EVERY day by construction (weekStart = today −
// sundayOffset ⇒ today is always in the displayed week); the seeded
// class grid (weekType "ALL" default) renders all five Mon–Fri classes
// across the week — the today column at Tuesday capture time carries
// Physics (dayOfWeek 1); the sf-timetable-canvas week grid's first
// rotation frame. Frame 2: the
// MYDAY view in DARK — myday-view.tsx's sf-progress-card, the
// S10-2/3/5-pinned surface: the "Today's Progress" amber card renders
// UNCONDITIONALLY — zero-state by construction, no empty-state branch to
// drive; the seeded My Day task rows ("Finish calculus problem set" +
// "Read chapter 4 — vectors", both myDay: true, due today) render beneath
// it with their sf-pill-red date-form DuePills (a task due today or
// overdue rides overdue = daysUntil <= 0 — the S6/S92-pinned family;
// the rows' subject tags are the PLAIN slate SubjectChip — the
// sf-subject-chip accent family rides the Exams/Assignments rows, not
// the task rows); the sf-progress-card family's first rotation frame
// anywhere (its ONLY consumer is the MyDay view). Both frames md5-DISTINCT (the AR7 gate;
// the s93 I5 shape: the explicit boolean gate, the failure path prints
// its own line, the completion line only on green — the S95/AV2
// exit-code semantics: process.exitCode = 1 on the failure branch; the
// AX3 catch generalized to EVERY failed path, carried here). The S4
// restore lesson on EVERY path: the theme back to violet/light (this
// capture runs on the PERSISTENT custom.db — the API PATCH is the only
// mutation and the finally restores it awaited).
//
// Usage: node scripts/capture-s104-evidence.mjs
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

  // ============ BE · the guarded surface, leg 1 (dark Timetable) ==========
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
  // The timetable's guarded families — the seeded classes render the week
  // grid deterministically (the weekType "ALL" default shows all five
  // Mon–Fri classes; the today-header renders on the current week's today
  // column EVERY day by construction — weekStart = today − sundayOffset;
  // the today column at Tuesday capture time carries Physics [dayOfWeek 1],
  // the other four classes ride their own columns) — the CONSUMERS map's
  // timetable-view entry, live on the surface, the S10-4-pinned
  // today-header tint.
  await page.waitForFunction(
    () =>
      document.querySelectorAll("[data-today-header]").length >= 1 &&
      !!document.querySelector('[aria-label="Week grid"]') &&
      document.body.innerText.includes("Calculus II") &&
      document.body.innerText.includes("Physics"),
    null,
    { timeout: 15000 },
  );
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/104-clone-be-rotation-dark-timetable.png` });

  // ============ BE · leg 2 — the dark MyDay (progress card) ==============
  // Still dark (the same PATCH owns the window) — NAVIGATE to the MyDay
  // view; the seeded My Day rows render beneath the progress card.
  await page.goto(`${BASE}/MyDay`);
  await page.waitForFunction(
    () =>
      document.documentElement.classList.contains("dark") &&
      document.documentElement.style.getPropertyValue("--sf-primary") !== "",
    null,
    { timeout: 15000 },
  );
  // The MyDay's guarded families — the progress card renders
  // UNCONDITIONALLY (the S10-2/3/5-pinned amber card); the seeded My Day
  // rows ("Finish calculus problem set" + "Read chapter 4 — vectors",
  // both myDay: true, due at the seed's day-0) render their sf-pill-red
  // date-form DuePills (a task due today OR overdue rides
  // overdue = daysUntil <= 0 — the S6/S92-pinned family; the seed's
  // day-0 dates read overdue-or-today relative to the live clock, red
  // either way). The rows' subject tags are the PLAIN SubjectChip (the
  // slate form — the sf-subject-chip accent family rides the Exams and
  // Assignments rows, not the task rows), so the gate counts exactly the
  // two guarded families the view actually renders.
  await page.waitForFunction(
    () =>
      !!document.querySelector('[aria-label="Today progress"]') &&
      document.querySelectorAll(".sf-pill-red").length >= 1 &&
      document.body.innerText.includes("Finish calculus problem set"),
    null,
    { timeout: 15000 },
  );
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/104-clone-be-rotation-dark-myday.png` });

  // ---- The distinct-frame verification — the AR7 gate, the s93 I5 shape --
  const md5 = (p) => createHash("md5").update(readFileSync(p)).digest("hex");
  const frames = [
    `${OUT}/104-clone-be-rotation-dark-timetable.png`,
    `${OUT}/104-clone-be-rotation-dark-myday.png`,
  ].map(md5);
  const distinct = new Set(frames).size === frames.length;
  if (!distinct) {
    // The failure path prints its OWN line — no success-shaped prose on a
    // failed gate. The S95/AV2 semantics: process.exitCode = 1 (the
    // S91/AR7 gate semantics — an exit-code-checking wrapper must see
    // the failure).
    console.log(`S104 BE frames DUPLICATE: ${frames.join(" ")} — the md5 gate FAILS this run`);
    process.exitCode = 1;
    md5Failed = true;
  } else {
    console.log(`S104 BE frames: ${frames.join(" ")} — all DISTINCT`);
  }
} catch (err) {
  // The AX3 shape (the s96 audit's I3): the failure path is gate-OWNED — a
  // mid-run throw exits 1 through this catch with a script-owned failure
  // line, not through node's unhandled-rejection spew. The md5Failed
  // shape generalized: every failure path sets process.exitCode = 1, and
  // the completion line below keys on the explicit booleans.
  console.error(`S104 BE surface captures FAILED: ${err?.message ?? err}`);
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
if (!md5Failed && !thrown) console.log("S104 BE surface captures complete");
