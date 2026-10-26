// S102 · Batch BC surface evidence captures — the register rotation (the
// BC1 headline: the BB1 register note's 217/98 counts describe the
// pre-BB-rider tree; the post-BB final-tree re-derivation is 219 importers
// / 100 carriers / 0 stale / 119 usage-line-free — the doctrine's own
// predicted drift, closed by the register rotation, not a pin change) +
// the s102 evidence-frame rotation rendered live on two CONSUMERS-map
// surfaces NO prior evidence frame has covered.
//
// BC frames (the GUARDED surfaces, on the final build, both seeded-data
// deterministic — zero persistent state BY CONSTRUCTION, no dialog, no
// mutation, no route abort): Frame 1: the GRADE TRACKER view in DARK —
// gradetracker-view.tsx's scoreBadgeClass pills, the AG4-pinned surface:
// the seeded grade rows render THREE families in one frame (the emerald
// "92/100" on Problem set 6, the sky "85/100" on Quiz 4 + "88/100" on
// Midterm essay, the amber "78/100" on Kinetics quiz). Frame 2: the
// ASSIGNMENTS view in DARK — assignments-view.tsx's sf-pill-soft family,
// the S6-pinned surface: the seeded rows render the soft-blue due-in
// pills + the soft-yellow priority pills — the SOFT family's FIRST
// rotation frame (no prior s99/s100/s101 frame covered any
// sf-pill-soft-* consumer). Both frames md5-DISTINCT (the AR7 gate; the
// s93 I5 shape: the explicit boolean gate, the failure path prints its
// own line, the completion line only on green — the S95/AV2 exit-code
// semantics: process.exitCode = 1 on the failure branch; the AX3 catch
// generalized to EVERY failed path, carried here). The S4 restore lesson
// on EVERY path: the theme back to violet/light (this capture runs on
// the PERSISTENT custom.db — the API PATCH is the only mutation and the
// finally restores it awaited).
//
// Usage: node scripts/capture-s102-evidence.mjs
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

  // ============ BC · the guarded surface, leg 1 (dark GradeTracker) ======
  // DARK mode (the S10 API pattern — the gotoDark spec contract: PATCH the
  // preference, then NAVIGATE; the boot script applies the mode on load).
  await page.request.patch(`${BASE}${PREFERENCES}`, { data: { accentColor: "violet", themeMode: "dark" } });
  await page.goto(`${BASE}/GradeTracker`);
  await page.waitForFunction(
    () =>
      document.documentElement.classList.contains("dark") &&
      document.documentElement.style.getPropertyValue("--sf-primary") !== "",
    null,
    { timeout: 15000 },
  );
  // The grade rows' THREE pill families — the seeded grades render the
  // scoreBadgeClass ramp deterministically (92/100 + 95/100 → emerald,
  // 85/100 + 88/100 → sky, 78/100 → amber; no seeded grade lands in the
  // red band — the CONSUMERS map's gradetracker-view entry, live on the
  // surface, the AG4-pinned trio).
  await page.waitForFunction(
    () =>
      document.querySelectorAll(".sf-pill-emerald").length >= 1 &&
      document.querySelectorAll(".sf-pill-sky").length >= 1 &&
      document.querySelectorAll(".sf-pill-amber").length >= 1,
    null,
    { timeout: 15000 },
  );
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/102-clone-bc-rotation-dark-gradetracker.png` });

  // ============ BC · leg 2 — the dark Assignments (the soft family) =====
  // Still dark (the same PATCH owns the window) — NAVIGATE to the
  // assignments view; the seeded rows render the soft families.
  await page.goto(`${BASE}/Assignments`);
  await page.waitForFunction(
    () =>
      document.documentElement.classList.contains("dark") &&
      document.documentElement.style.getPropertyValue("--sf-primary") !== "",
    null,
    { timeout: 15000 },
  );
  // The assignments rows' SOFT pill families — the seeded due dates are
  // all future (the soft-blue due-in pills: "2 days"…"8 days" +
  // "Tomorrow") and every row carries the soft-yellow priority pill
  // (high/urgent/medium/low) — the SOFT family's first rotation frame
  // (the CONSUMERS map's assignments-view entry, live on the surface,
  // the S6-pinned pair).
  await page.waitForFunction(
    () =>
      document.querySelectorAll(".sf-pill-soft-blue").length >= 1 &&
      document.querySelectorAll(".sf-pill-soft-yellow").length >= 1,
    null,
    { timeout: 15000 },
  );
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/102-clone-bc-rotation-dark-assignments.png` });

  // ---- The distinct-frame verification — the AR7 gate, the s93 I5 shape --
  const md5 = (p) => createHash("md5").update(readFileSync(p)).digest("hex");
  const frames = [
    `${OUT}/102-clone-bc-rotation-dark-gradetracker.png`,
    `${OUT}/102-clone-bc-rotation-dark-assignments.png`,
  ].map(md5);
  const distinct = new Set(frames).size === frames.length;
  if (!distinct) {
    // The failure path prints its OWN line — no success-shaped prose on a
    // failed gate. The S95/AV2 semantics: process.exitCode = 1 (the
    // S91/AR7 gate semantics — an exit-code-checking wrapper must see
    // the failure).
    console.log(`S102 BC frames DUPLICATE: ${frames.join(" ")} — the md5 gate FAILS this run`);
    process.exitCode = 1;
    md5Failed = true;
  } else {
    console.log(`S102 BC frames: ${frames.join(" ")} — all DISTINCT`);
  }
} catch (err) {
  // The AX3 shape (the s96 audit's I3): the failure path is gate-OWNED — a
  // mid-run throw exits 1 through this catch with a script-owned failure
  // line, not through node's unhandled-rejection spew. The md5Failed
  // shape generalized: every failure path sets process.exitCode = 1, and
  // the completion line below keys on the explicit booleans.
  console.error(`S102 BC surface captures FAILED: ${err?.message ?? err}`);
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
if (!md5Failed && !thrown) console.log("S102 BC surface captures complete");
