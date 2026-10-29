// S110 · Batch BK surface evidence captures — the register rotation (the
// BK1 headline: the BJ1 register note's 233/114 counts describe the
// pre-s109-rider tree; the post-BJ final-tree re-derivation is 235 importers
// / 116 carriers / 0 stale / 119 usage-line-free — the doctrine's own
// predicted drift, closed by the register rotation, not a pin change) +
// the s110 MOBILE-PORTRAIT LIGHT evidence-frame rotation — the theme
// axis's never-varied MOBILE cell.
//
// BK frames (the GUARDED surfaces, on the final build, both seeded-data
// deterministic — zero persistent state BY CONSTRUCTION, no dialog, no
// mutation, no route abort; the S102 lesson-2 doctrine: a seeded-data
// frame is the cleanest rotation — the seed is the deterministic driver
// that already ran): the rotation program's 20 committed frames cover all
// four viewport cells on DARK (1280×800 desktop ×10, s100–s104;
// 390×844 mobile-portrait ×4, s105–s106; 844×390 mobile-landscape ×2,
// s107; 768×1024 mid-band ×2, s108) plus the home band on LIGHT
// (1280×800 desktop ×2, s109 — Events + Analytics, the theme axis
// OPENED). The theme axis's REMAINING never-varied cells:
// mobile-portrait×light, mobile-landscape×light, mid-band×light. Both
// frames below rotate onto the MOBILE-PORTRAIT LIGHT cell (390×844 —
// the standing 31's mobile captures are LIGHT dashboard/drawer/tasks
// only, so the cell itself is standing-covered while remaining
// rotation-program-new) with the two VIEW-LEVEL gap candidates across
// the entire 20-frame lineage: Settings and Files — the last two views
// with ZERO rotation frames (Events + Analytics closed at s109).
//
// Frame 1: the SETTINGS view at 390×844 in LIGHT — the view's FIRST
// rotation frame. The Appearance tab's measured chrome (all S69/S4-
// pinned surfaces): the ONE max-w-4xl bg-card card ("Appearance" +
// "Customize how StudyFlow looks"), the h-[88px] theme buttons with the
// selected LIGHT button's violet border rgb(139, 92, 246) (border-
// sf-primary through the token var — the S69-measured selected state),
// the 48px accent swatches (size-12 rounded-xl, the violet one
// aria-pressed=true), the emoji avatar tile grid, and the Save
// Preferences gradient CTA — all deterministic from the seed with ZERO
// interaction (the demo user's stored themeMode IS light — the closing
// state — but the PATCH is still explicit so a prior failed run can
// never strand a dark window). The mobile no-overflow contract
// (scrollWidth <= 390) — the S105/S106 mobile-frame doctrine at the
// theme axis's light side.
//
// Frame 2: the FILES view at 390×844 in LIGHT — the view's FIRST
// rotation frame. The mobile stacked layout (the md:flex aside renders
// at 390 as the stacked list pane per the AE6 surface), the S5-K-pinned
// chrome (the "All Files" breadcrumb text link at its 20px measured
// height, the View mode bordered strip at rounded-lg 8px with the Grid
// view aria-pressed, the icon-only Add link), the S17-pinned zero-data
// empty state the SEED produces for the demo account (the seed creates
// no folders/files: the sf-card "No files yet" EmptyState with the
// gradient Upload a file CTA — the reference-measured hint "Upload your
// first file to get started") — ZERO interaction, pure seed read.
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
// Usage: node scripts/capture-s110-evidence.mjs
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
// home cell (its 4 committed frames all dark — s105–s106; mobile-portrait
// × LIGHT never varied); the below-lg chrome renders BY CONSTRUCTION (the
// glass app-bar + the hamburger drawer) while the lg:flex desktop rail
// stays absent — the full mobile light shape.
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

  // ============ BK · the guarded surface, leg 1 (mobile light settings) ==
  // LIGHT mode (the S10 API pattern — the gotoDark spec contract inverted:
  // PATCH the preference, then NAVIGATE; the boot script applies the mode
  // on load). The PATCH is explicit — the demo user's stored mode is the
  // closing state (light) but a prior failed run must never strand a dark
  // window for this leg.
  await page.request.patch(`${BASE}${PREFERENCES}`, { data: { accentColor: "violet", themeMode: "light" } });
  await page.goto(`${BASE}/Settings`);
  await page.waitForFunction(
    () =>
      !document.documentElement.classList.contains("dark") &&
      document.documentElement.style.getPropertyValue("--sf-primary") !== "",
    null,
    { timeout: 15000 },
  );
  // The mobile-light Settings' guarded families — the Appearance tab's
  // measured chrome (the S69/S4-pinned surfaces): the ONE max-w-4xl
  // bg-card card with the "Appearance" h2 + the "Customize how StudyFlow
  // looks" first line, the three h-[88px] theme buttons (Light/Dark/System)
  // with the selected LIGHT button carrying the violet border
  // rgb(139, 92, 246) through the --sf-primary token, the 48px accent
  // swatches (size-12, the violet one aria-pressed), the emoji avatar tile
  // grid, the Save Preferences gradient CTA, and the mobile no-overflow
  // contract (scrollWidth <= 390).
  await page.waitForFunction(
    () => {
      const html = document.documentElement;
      const lightShell = !html.classList.contains("dark");
      const main = document.querySelector("main");
      const text = main?.textContent ?? "";
      const cardOk =
        text.includes("Appearance") &&
        text.includes("Customize how StudyFlow looks") &&
        text.includes("Save Preferences");
      const themeBtns = [...(main?.querySelectorAll("button[aria-pressed]") ?? [])].filter((b) =>
        ["Light", "Dark", "System"].includes(b.textContent?.trim() ?? ""),
      );
      const threeButtons = themeBtns.length === 3;
      const lightBtn = themeBtns.find((b) => b.textContent?.trim() === "Light");
      const lightSelected =
        !!lightBtn &&
        lightBtn.getAttribute("aria-pressed") === "true" &&
        getComputedStyle(lightBtn).borderColor === "rgb(139, 92, 246)";
      const swatches = [...(main?.querySelectorAll("button[aria-pressed]") ?? [])].filter((b) =>
        (b.getAttribute("aria-label") ?? "").endsWith(" accent"),
      );
      const swatchesOk =
        swatches.length === 7 &&
        swatches.some((s) => s.getAttribute("aria-label") === "Violet accent" && s.getAttribute("aria-pressed") === "true");
      const noOverflow = document.documentElement.scrollWidth <= 390;
      return lightShell && cardOk && threeButtons && lightSelected && swatchesOk && noOverflow;
    },
    null,
    { timeout: 15000 },
  );
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/110-clone-bk-rotation-light-mobile-settings.png` });

  // ============ BK · leg 2 — the mobile light files =====================
  // Still light (the same PATCH owns the window) — NAVIGATE to the Files
  // view; the mobile stacked layout and the seeded zero-data empty state
  // render.
  await page.goto(`${BASE}/Files`);
  await page.waitForFunction(
    () =>
      !document.documentElement.classList.contains("dark") &&
      document.documentElement.style.getPropertyValue("--sf-primary") !== "",
    null,
    { timeout: 15000 },
  );
  // The mobile-light Files' guarded families — the S5-K-pinned chrome (the
  // "All Files" breadcrumb text link at its <=24px measured height, the
  // View mode bordered strip at rounded-lg 8px with the Grid view button
  // aria-pressed, the icon-only Add link) + the S17-pinned zero-data empty
  // state the SEED produces (no folders, no files: the sf-card "No files
  // yet" EmptyState, the reference-measured hint "Upload your first file
  // to get started", the gradient "Upload a file" CTA) + the mobile
  // no-overflow contract (scrollWidth <= 390) — ZERO interaction.
  await page.waitForFunction(
    () => {
      const html = document.documentElement;
      const lightShell = !html.classList.contains("dark");
      const main = document.querySelector("main");
      const text = main?.textContent ?? "";
      const crumb = [...(main?.querySelectorAll("button") ?? [])].find(
        (b) => b.textContent?.trim() === "All Files",
      );
      const crumbOk = !!crumb && crumb.getBoundingClientRect().height <= 24;
      const toggle = main?.querySelector('[role="group"][aria-label="View mode"]') ?? null;
      const toggleOk = !!toggle && getComputedStyle(toggle).borderRadius === "8px";
      const gridBtn = main?.querySelector('button[aria-label="Grid view"]') ?? null;
      const gridPressed = !!gridBtn && gridBtn.getAttribute("aria-pressed") === "true";
      const addLink = main?.querySelector('button[aria-label="Add link"]') ?? null;
      const addLinkOk =
        !!addLink &&
        addLink.textContent?.trim() === "" &&
        !!addLink.querySelector("svg");
      const emptyOk =
        text.includes("No files yet") &&
        text.includes("Upload your first file to get started") &&
        text.includes("Upload a file");
      const noOverflow = document.documentElement.scrollWidth <= 390;
      return lightShell && crumbOk && toggleOk && gridPressed && addLinkOk && emptyOk && noOverflow;
    },
    null,
    { timeout: 15000 },
  );
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/110-clone-bk-rotation-light-mobile-files.png` });

  // ---- The distinct-frame verification — the AR7 gate, the s93 I5 shape --
  const md5 = (p) => createHash("md5").update(readFileSync(p)).digest("hex");
  const frames = [
    `${OUT}/110-clone-bk-rotation-light-mobile-settings.png`,
    `${OUT}/110-clone-bk-rotation-light-mobile-files.png`,
  ].map(md5);
  const distinct = new Set(frames).size === frames.length;
  if (!distinct) {
    // The failure path prints its OWN line — no success-shaped prose on a
    // failed gate. The S95/AV2 semantics: process.exitCode = 1 (the
    // S91/AR7 gate semantics — an exit-code-checking wrapper must see the
    // failure).
    console.log(`S110 BK frames DUPLICATE: ${frames.join(" ")} — the md5 gate FAILS this run`);
    process.exitCode = 1;
    md5Failed = true;
  } else {
    console.log(`S110 BK frames: ${frames.join(" ")} — all DISTINCT`);
  }
} catch (err) {
  // The AX3 shape (the s96 audit's I3): the failure path is gate-OWNED — a
  // mid-run throw exits 1 through this catch with a script-owned failure
  // line, not through node's unhandled-rejection spew. The md5Failed
  // shape generalized: every failure path sets process.exitCode = 1, and
  // the completion line below keys on the explicit booleans.
  console.error(`S110 BK surface captures FAILED: ${err?.message ?? err}`);
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
if (!md5Failed && !thrown) console.log("S110 BK surface captures complete");
