// S103 · Batch BD surface evidence captures — the register rotation (the
// BD1 headline: the BC1 register note's 219/100 counts describe the
// pre-BC-rider tree; the post-BC final-tree re-derivation is 221 importers
// / 102 carriers / 0 stale / 119 usage-line-free — the doctrine's own
// predicted drift, closed by the register rotation, not a pin change) +
// the s103 evidence-frame rotation rendered live on two CONSUMERS-map
// surfaces NO prior evidence frame has covered.
//
// BD frames (the GUARDED surfaces, on the final build, both seeded-data
// deterministic — zero persistent state BY CONSTRUCTION, no dialog, no
// mutation, no route abort; the S102 lesson-2 doctrine: a seeded-data
// frame is the cleanest rotation — the seed is the deterministic driver
// that already ran): Frame 1: the EXAMS view in DARK — exams-view.tsx's
// urgency pills, the S6/S9-J-pinned surface: the seeded exam rows render
// TWO families in one frame (the orange "Tomorrow" on Calculus II
// Midterm [the +1-day seeded date] + the yellow "3 days"/"4 days" on
// Chemistry Quiz 5 / Quiz — Integration [the +3/+4-day seeded dates];
// the orange family's first rotation frame since s100's Events). Frame
// 2: the FLASHCARDS view in DARK — flashcards-view.tsx's sf-pill-yellow
// difficulty pills, the S7-pinned surface: the seeded cards render the
// difficulty badges (easy/medium/hard on the seeded rows) — the
// flashcards entry's first rotation frame. Both frames md5-DISTINCT
// (the AR7 gate; the s93 I5 shape: the explicit boolean gate, the
// failure path prints its own line, the completion line only on green —
// the S95/AV2 exit-code semantics: process.exitCode = 1 on the failure
// branch; the AX3 catch generalized to EVERY failed path, carried here).
// The S4 restore lesson on EVERY path: the theme back to violet/light
// (this capture runs on the PERSISTENT custom.db — the API PATCH is the
// only mutation and the finally restores it awaited).
//
// Usage: node scripts/capture-s103-evidence.mjs
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

  // ============ BD · the guarded surface, leg 1 (dark Exams) ============
  // DARK mode (the S10 API pattern — the gotoDark spec contract: PATCH the
  // preference, then NAVIGATE; the boot script applies the mode on load).
  await page.request.patch(`${BASE}${PREFERENCES}`, { data: { accentColor: "violet", themeMode: "dark" } });
  await page.goto(`${BASE}/Exams`);
  await page.waitForFunction(
    () =>
      document.documentElement.classList.contains("dark") &&
      document.documentElement.style.getPropertyValue("--sf-primary") !== "",
    null,
    { timeout: 15000 },
  );
  // The exam rows' urgency pill families — the seeded exam dates render
  // the urgency() ramp deterministically (+1 day → the orange "Tomorrow"
  // on Calculus II Midterm; +3/+4/+12 days → the yellow "3 days"/"4
  // days"/"12 days" on Chemistry Quiz 5, Quiz — Integration, Physics
  // Final; no seeded exam is today or past — the red and slate families
  // stay unrendered, by seed construction) — the CONSUMERS map's
  // exams-view entry, live on the surface, the S6/S9-J-pinned pair.
  await page.waitForFunction(
    () =>
      document.querySelectorAll(".sf-pill-orange").length >= 1 &&
      document.querySelectorAll(".sf-pill-yellow").length >= 2,
    null,
    { timeout: 15000 },
  );
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/103-clone-bd-rotation-dark-exams.png` });

  // ============ BD · leg 2 — the dark Flashcards (difficulty pills) ====
  // Still dark (the same PATCH owns the window) — NAVIGATE to the
  // flashcards view; the seeded cards render the difficulty badges.
  await page.goto(`${BASE}/Flashcards`);
  await page.waitForFunction(
    () =>
      document.documentElement.classList.contains("dark") &&
      document.documentElement.style.getPropertyValue("--sf-primary") !== "",
    null,
    { timeout: 15000 },
  );
  // The flashcards' difficulty pills — the seeded cards render the
  // sf-pill-yellow badges (easy/medium/hard across the seeded rows —
  // "Chain rule" medium, "What does ATP stand for?" easy, the hard rows
  // below; the pill is always-visible, only the row ACTIONS are
  // hover-gated) — the CONSUMERS map's flashcards-view entry, live on
  // the surface, the S7-pinned badge.
  await page.waitForFunction(
    () => document.querySelectorAll(".sf-pill-yellow").length >= 1,
    null,
    { timeout: 15000 },
  );
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/103-clone-bd-rotation-dark-flashcards.png` });

  // ---- The distinct-frame verification — the AR7 gate, the s93 I5 shape --
  const md5 = (p) => createHash("md5").update(readFileSync(p)).digest("hex");
  const frames = [
    `${OUT}/103-clone-bd-rotation-dark-exams.png`,
    `${OUT}/103-clone-bd-rotation-dark-flashcards.png`,
  ].map(md5);
  const distinct = new Set(frames).size === frames.length;
  if (!distinct) {
    // The failure path prints its OWN line — no success-shaped prose on a
    // failed gate. The S95/AV2 semantics: process.exitCode = 1 (the
    // S91/AR7 gate semantics — an exit-code-checking wrapper must see
    // the failure).
    console.log(`S103 BD frames DUPLICATE: ${frames.join(" ")} — the md5 gate FAILS this run`);
    process.exitCode = 1;
    md5Failed = true;
  } else {
    console.log(`S103 BD frames: ${frames.join(" ")} — all DISTINCT`);
  }
} catch (err) {
  // The AX3 shape (the s96 audit's I3): the failure path is gate-OWNED — a
  // mid-run throw exits 1 through this catch with a script-owned failure
  // line, not through node's unhandled-rejection spew. The md5Failed
  // shape generalized: every failure path sets process.exitCode = 1, and
  // the completion line below keys on the explicit booleans.
  console.error(`S103 BD surface captures FAILED: ${err?.message ?? err}`);
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
if (!md5Failed && !thrown) console.log("S103 BD surface captures complete");
