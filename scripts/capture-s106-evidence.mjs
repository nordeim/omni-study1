// S106 · Batch BG surface evidence captures — the register rotation (the
// BG1 headline: the BF1 register note's 225/106 counts describe the
// pre-BF-rider tree; the post-BF final-tree re-derivation is 227 importers
// / 108 carriers / 0 stale / 119 usage-line-free — the doctrine's own
// predicted drift, closed by the register rotation, not a pin change) +
// the s106 MOBILE evidence-frame rotation, the SECOND mobile cycle —
// exhausting the mobile-only md:hidden class in the views.
//
// BG frames (the GUARDED surfaces, on the final build, both seeded-data
// deterministic — zero persistent state BY CONSTRUCTION, no dialog, no
// mutation, no route abort, ZERO INTERACTION; the S102 lesson-2 doctrine:
// a seeded-data frame is the cleanest rotation — the seed is the
// deterministic driver that already ran): the mobile axis the program
// varied for the first time at s105 (the S105 lesson-1: an axis never
// varied is an axis never verified); the views' mobile-only md:hidden
// class is THREE surfaces total — the Timetable day accordion (s105
// Frame 1), the Flashcards in-row Study affordance, and the Notes mobile
// create FAB — and this cycle rotates onto the LAST TWO, EXHAUSTING the
// class: every md:hidden surface in the views now carries an evidence
// frame. Both frames below render at 390×844 (the S33 mobile canonical)
// in DARK, both e2e-pinned by the S33 mobile sweep + the S36 dark-mobile
// sweep + their own surface pins.
//
// Frame 1: the FLASHCARDS view MOBILE at 390×844 in DARK — the deck list
// pane at mobile (the S78/AE6 surface: the asides render at ALL widths)
// + the in-row Study affordance on the seeded card-carrying deck rows
// (flashcards-view.tsx — `bg-neutral-950 dark:bg-neutral-800`, the
// family's first rotation-frame subject; the S79/AF1 superset surface,
// pinned with the bounding-box contract in mobile-navigation.spec.ts;
// the seeded 0-card "Spanish Vocabulary" deck renders NO affordance —
// the count > 0 seeded discriminator BY CONSTRUCTION); the mobile-only
// affordance CANNOT exist at desktop (md:hidden) — the S105 lesson-2
// strongest-candidate class, desktop-uncapturable, guaranteed-novel
// evidence by CONSTRUCTION; the fixed glass mobile app bar above.
//
// Frame 2: the NOTES view MOBILE at 390×844 in DARK — the notes list
// pane at mobile (the S78/AE6 surface: the seeded "Kinetics summary"
// row visible) + the mobile create FAB (notes-view.tsx — the
// sf-gradient sf-gradient-shadow fixed bottom-20 right-4 size-14
// rounded-full md:hidden Button, the S79/AF6 superset quick-action; the
// gradient family's first MOBILE evidence frame — the family
// standing-covered at desktop via the Tasks CTAs and the parity pins);
// mobile-only CANNOT exist at desktop — the same strongest-candidate
// class; the fixed glass mobile app bar above.
//
// Both frames md5-DISTINCT (the AR7 gate; the s93 I5 shape: the explicit
// boolean gate, the failure path prints its own line, the completion line
// only on green — the S95/AV2 exit-code semantics: process.exitCode = 1 on
// the failure branch; the AX3 catch generalized to EVERY failed path,
// carried here). The S4 restore lesson on EVERY path: the theme back to
// violet/light (this capture runs on the PERSISTENT custom.db — the API
// PATCH is the only mutation and the finally restores it awaited).
//
// Usage: node scripts/capture-s106-evidence.mjs
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
// rotation program first varied at s105; this cycle exhausts the views'
// mobile-only md:hidden class.
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

  // ============ BG · the guarded surface, leg 1 (mobile dark Flashcards) ==
  // DARK mode (the S10 API pattern — the gotoDark spec contract: PATCH the
  // preference, then NAVIGATE; the boot script applies the mode on load).
  await page.request.patch(`${BASE}${PREFERENCES}`, { data: { accentColor: "violet", themeMode: "dark" } });
  await page.goto(`${BASE}/Flashcards`);
  await page.waitForFunction(
    () =>
      document.documentElement.classList.contains("dark") &&
      document.documentElement.style.getPropertyValue("--sf-primary") !== "",
    null,
    { timeout: 15000 },
  );
  // The mobile Flashcards' guarded families — the deck list pane at mobile
  // (the AE6 surface: the aside renders at ALL widths), the in-row Study
  // affordance on the seeded card-carrying rows (bg-neutral-950
  // dark:bg-neutral-800 — the family's first rotation-frame subject; the
  // AF1 bounding-box contract: fully inside the viewport), the seeded
  // 0-card "Spanish Vocabulary" deck rendering NO affordance (the count >
  // 0 seeded discriminator), the fixed glass app bar, and the S33 mobile
  // no-overflow contract (scrollWidth ≤ 390).
  await page.waitForFunction(
    () => {
      const pane = document.querySelector('[aria-label="Deck list pane"]');
      const paneVisible = !!pane && pane.getBoundingClientRect().width > 0;
      const affordances = [...document.querySelectorAll('button[aria-label^="Study "]')];
      const carried = affordances
        .map((b) => b.getAttribute("aria-label") ?? "")
        .filter((n) => n === "Study Integration rules" || n === "Study Biology Chapter 5");
      const spanishAffordance = affordances.some(
        (b) => (b.getAttribute("aria-label") ?? "") === "Study Spanish Vocabulary",
      );
      const inViewport = carried.length === 2 &&
        carried.every(() => true) &&
        affordances
          .filter((b) => {
            const n = b.getAttribute("aria-label") ?? "";
            return n === "Study Integration rules" || n === "Study Biology Chapter 5";
          })
          .every((b) => {
            const r = b.getBoundingClientRect();
            return r.width > 0 && r.x >= 0 && r.x + r.width <= 390;
          });
      const appBar = !!document.querySelector('button[aria-label="Open navigation menu"]');
      const noOverflow = document.documentElement.scrollWidth <= 390;
      const seededRows = ["Integration rules", "Biology Chapter 5", "Spanish Vocabulary"].every((n) =>
        document.body.innerText.includes(n),
      );
      return paneVisible && carried.length === 2 && !spanishAffordance && inViewport && appBar && noOverflow && seededRows;
    },
    null,
    { timeout: 15000 },
  );
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/106-clone-bg-rotation-mobile-dark-flashcards.png` });

  // ============ BG · leg 2 — the mobile dark Notes (the create FAB) ======
  // Still dark (the same PATCH owns the window) — NAVIGATE to the Notes
  // view; the seeded rows and the mobile FAB render.
  await page.goto(`${BASE}/Notes`);
  await page.waitForFunction(
    () =>
      document.documentElement.classList.contains("dark") &&
      document.documentElement.style.getPropertyValue("--sf-primary") !== "",
    null,
    { timeout: 15000 },
  );
  // The mobile Notes' guarded families — the notes list pane at mobile (the
  // AE6 surface: the seeded "Kinetics summary" row visible), the mobile
  // create FAB (sf-gradient sf-gradient-shadow — the S79/AF6 superset
  // surface, the gradient family's first MOBILE evidence frame; fixed
  // bottom-20 right-4, fully inside the viewport), the fixed glass app
  // bar, and the S33 mobile no-overflow contract.
  await page.waitForFunction(
    () => {
      const pane = document.querySelector('[aria-label="Notes list pane"]');
      const paneVisible = !!pane && pane.getBoundingClientRect().width > 0;
      const seededRow = document.body.innerText.includes("Kinetics summary");
      const fab = document.querySelector('button[aria-label="New note"]');
      const fabFamily =
        !!fab &&
        (fab.getAttribute("class") ?? "").includes("sf-gradient") &&
        (fab.getAttribute("class") ?? "").includes("sf-gradient-shadow");
      const fabInViewport = (() => {
        if (!fab) return false;
        const r = fab.getBoundingClientRect();
        return r.width > 0 && r.x >= 0 && r.x + r.width <= 390 && r.y >= 0;
      })();
      const appBar = !!document.querySelector('button[aria-label="Open navigation menu"]');
      const noOverflow = document.documentElement.scrollWidth <= 390;
      return paneVisible && seededRow && fabFamily && fabInViewport && appBar && noOverflow;
    },
    null,
    { timeout: 15000 },
  );
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/106-clone-bg-rotation-mobile-dark-notes.png` });

  // ---- The distinct-frame verification — the AR7 gate, the s93 I5 shape --
  const md5 = (p) => createHash("md5").update(readFileSync(p)).digest("hex");
  const frames = [
    `${OUT}/106-clone-bg-rotation-mobile-dark-flashcards.png`,
    `${OUT}/106-clone-bg-rotation-mobile-dark-notes.png`,
  ].map(md5);
  const distinct = new Set(frames).size === frames.length;
  if (!distinct) {
    // The failure path prints its OWN line — no success-shaped prose on a
    // failed gate. The S95/AV2 semantics: process.exitCode = 1 (the
    // S91/AR7 gate semantics — an exit-code-checking wrapper must see the
    // failure).
    console.log(`S106 BG frames DUPLICATE: ${frames.join(" ")} — the md5 gate FAILS this run`);
    process.exitCode = 1;
    md5Failed = true;
  } else {
    console.log(`S106 BG frames: ${frames.join(" ")} — all DISTINCT`);
  }
} catch (err) {
  // The AX3 shape (the s96 audit's I3): the failure path is gate-OWNED — a
  // mid-run throw exits 1 through this catch with a script-owned failure
  // line, not through node's unhandled-rejection spew. The md5Failed
  // shape generalized: every failure path sets process.exitCode = 1, and
  // the completion line below keys on the explicit booleans.
  console.error(`S106 BG surface captures FAILED: ${err?.message ?? err}`);
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
if (!md5Failed && !thrown) console.log("S106 BG surface captures complete");
