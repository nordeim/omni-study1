// S112 · Batch BM surface evidence captures — the register rotation (the
// BM1 headline: the BL1 register note's 237/118 counts describe the
// pre-s111-rider tree; the post-BL final-tree re-derivation is 239 importers
// / 120 carriers / 0 stale / 119 usage-line-free — the doctrine's own
// predicted drift, closed by the register rotation, not a pin change) +
// the s112 MID-BAND LIGHT evidence-frame rotation — the theme axis's LAST
// never-varied cell (the exhaustion cycle: with these two frames both the
// theme axis [all four viewport cells × both sides] AND the view-level
// rotation program [every nav view carrying at least one rotation frame]
// complete in one cycle).
//
// BM frames (the GUARDED surfaces, on the final build, both seeded-data
// deterministic — zero persistent state BY CONSTRUCTION, no dialog, no
// mutation, no route abort; the S102 lesson-2 doctrine: a seeded-data
// frame is the cleanest rotation — the seed is the deterministic driver
// that already ran): the rotation program's 24 committed frames cover all
// four viewport cells on DARK (1280×800 desktop ×10, s100–s104;
// 390×844 mobile-portrait ×4, s105–s106; 844×390 mobile-landscape ×2,
// s107; 768×1024 mid-band ×2, s108) plus three of the four light cells
// (1280×800 desktop ×2, s109 — Events + Analytics; 390×844
// mobile-portrait ×2, s110 — Settings + Files; 844×390
// mobile-landscape ×2, s111 — Calendar + FocusTimer). The theme axis's
// LAST never-varied cell: mid-band×light. Both frames below rotate onto
// the MID-BAND LIGHT cell (768×1024 — the mid-band the program opened at
// s108 on dark; the below-lg app-bar + hamburger chrome renders at 768 BY
// CONSTRUCTION while the lg:flex desktop rail stays absent) with the two
// LAST view-level gap candidates across the entire 24-frame lineage:
// MathSolver and AIAssistant — the final two of the nav views with ZERO
// rotation frames (Settings + Files closed at s110; Calendar +
// FocusTimer at s111).
//
// Frame 1: the MATHSOLVER view at 768×1024 in LIGHT — the view's FIRST
// rotation frame. The h1 "Math Solver" + subtitle "Type a problem or
// upload an image to get step-by-step solutions", the aria-label="Math
// problem" textarea at its rest chrome, the Upload Image / Clear buttons,
// the Solve button disabled at rest (zero input — the rest-state chrome),
// the aria-label="Math solution" region's rest-state copy "Type a problem
// or attach a photo, then press Solve — step-by-step help appears here.",
// and the aria-label="Recent Problems" section's seed-deterministic empty
// state "Problems you solve will be saved here." (the seed creates no
// solver-history rows) — all deterministic from the seed with ZERO
// interaction. The mid-band no-overflow contract (scrollWidth <= 768).
//
// Frame 2: the AIASSISTANT view at 768×1024 in LIGHT — the view's FIRST
// rotation frame. The h1 "AI Study Assistant" + subtitle "Your study
// copilot", the empty-transcript intro "Ask anything about your studies —
// or start with a quick prompt." (the seed creates no AI chat rows), the
// aria-label="Quick actions" group with its six sf-card prompt buttons —
// Explain Concept / Study Tips / Summarize Notes / Solve Problem / Essay
// Ideas / Translate — at their rest chrome, the aria-label="Message the
// assistant" composer (the shadcn Input — an <input> element, NOT a
// textarea: the S111 lesson-2 composed-surface doctrine re-hit — the
// accessibility tree names both "textbox"; the element tag is the gate's
// truth, live-probed) with the Send message button disabled at rest, and
// the composer hint "Press Enter to send, Shift + Enter for a new line" —
// pure seed read, ZERO interaction. The mid-band no-overflow contract
// (scrollWidth <= 768).
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
// Usage: node scripts/capture-s112-evidence.mjs
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
// (its 2 committed frames both dark — s108; mid-band × LIGHT never
// varied); the below-lg chrome renders BY CONSTRUCTION (the glass app-bar
// + the hamburger) while the lg:flex desktop rail stays absent — the full
// mid-band light shape.
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

  // ============ BM · the guarded surface, leg 1 (mid-band light mathsolver)
  // LIGHT mode (the S10 API pattern — the gotoDark spec contract inverted:
  // PATCH the preference, then NAVIGATE; the boot script applies the mode
  // on load). The PATCH is explicit — the demo user's stored mode is the
  // closing state (light) but a prior failed run must never strand a dark
  // window for this leg.
  await page.request.patch(`${BASE}${PREFERENCES}`, { data: { accentColor: "violet", themeMode: "light" } });
  await page.goto(`${BASE}/MathSolver`);
  await page.waitForFunction(
    () =>
      !document.documentElement.classList.contains("dark") &&
      document.documentElement.style.getPropertyValue("--sf-primary") !== "",
    null,
    { timeout: 15000 },
  );
  // The mid-band-light MathSolver's guarded families — the h1 "Math
  // Solver" + subtitle "Type a problem or upload an image to get
  // step-by-step solutions", the aria-label="Math problem" textarea, the
  // Upload Image / Clear buttons, the Solve button disabled at rest
  // (zero input), the "Math solution" region's rest-state copy, the
  // "Recent Problems" section's seed-deterministic empty state, and the
  // mid-band no-overflow contract (scrollWidth <= 768).
  await page.waitForFunction(
    () => {
      const html = document.documentElement;
      const lightShell = !html.classList.contains("dark");
      const main = document.querySelector("main");
      const h1 = main?.querySelector("h1");
      const sub = h1?.parentElement?.querySelector("p");
      const headerOk =
        h1?.textContent?.trim() === "Math Solver" &&
        sub?.textContent?.trim() === "Type a problem or upload an image to get step-by-step solutions";
      const problem = main?.querySelector('textarea[aria-label="Math problem"]');
      const problemOk =
        !!problem &&
        problem.value === "";
      const buttons = [...(main?.querySelectorAll("button") ?? [])];
      const upload = buttons.find((b) => b.textContent?.trim() === "Upload Image");
      const clear = buttons.find((b) => b.textContent?.trim() === "Clear");
      const solve = buttons.find((b) => b.textContent?.trim() === "Solve");
      const buttonsOk =
        !!upload && !!clear && !!solve &&
        solve.disabled === true;
      const solution = main?.querySelector('[aria-label="Math solution"]');
      const solutionOk =
        !!solution &&
        solution.textContent?.includes("Type a problem or attach a photo, then press Solve — step-by-step help appears here.");
      const recent = main?.querySelector('[aria-label="Recent Problems"]');
      const recentOk =
        !!recent &&
        recent.querySelector("h2")?.textContent?.trim() === "Recent Problems" &&
        recent.textContent?.includes("Problems you solve will be saved here.");
      const noOverflow = document.documentElement.scrollWidth <= 768;
      return lightShell && headerOk && problemOk && buttonsOk && solutionOk && recentOk && noOverflow;
    },
    null,
    { timeout: 15000 },
  );
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/112-clone-bm-rotation-light-midband-mathsolver.png` });

  // ============ BM · leg 2 — the mid-band light aiassistant ==============
  // Still light (the same PATCH owns the window) — NAVIGATE to the
  // AIAssistant view; the empty transcript, the quick actions, the
  // composer and its hint render.
  await page.goto(`${BASE}/AIAssistant`);
  await page.waitForFunction(
    () =>
      !document.documentElement.classList.contains("dark") &&
      document.documentElement.style.getPropertyValue("--sf-primary") !== "",
    null,
    { timeout: 15000 },
  );
  // The mid-band-light AIAssistant's guarded families — the h1 "AI Study
  // Assistant" + subtitle "Your study copilot", the empty-transcript
  // intro "Ask anything about your studies — or start with a quick
  // prompt.", the aria-label="Quick actions" group with its six sf-card
  // prompt buttons (Explain Concept / Study Tips / Summarize Notes /
  // Solve Problem / Essay Ideas / Translate), the aria-label="Message the
  // assistant" composer (the shadcn Input — an <input> element, NOT a
  // textarea: the S111 lesson-2 composed-surface doctrine re-hit — the
  // accessibility tree names both "textbox"; the element tag is the gate's
  // truth, live-probed) with the Send message button disabled at rest,
  // the composer hint "Press Enter to send, Shift + Enter for a new
  // line", and the mid-band no-overflow contract (scrollWidth <= 768) —
  // ZERO interaction.
  await page.waitForFunction(
    () => {
      const html = document.documentElement;
      const lightShell = !html.classList.contains("dark");
      const main = document.querySelector("main");
      const h1 = main?.querySelector("h1");
      const sub = h1?.parentElement?.querySelector("p");
      const headerOk =
        h1?.textContent?.trim() === "AI Study Assistant" &&
        sub?.textContent?.trim() === "Your study copilot";
      const introOk =
        main?.textContent?.includes("Ask anything about your studies — or start with a quick prompt.") === true;
      const quick = main?.querySelector('[aria-label="Quick actions"]');
      const quickButtons = [...(quick?.querySelectorAll("button") ?? [])].map((b) => b.textContent?.trim() ?? "");
      const quickOk =
        !!quick &&
        quickButtons.length === 6 &&
        quickButtons[0] === "Explain Concept" &&
        quickButtons[1] === "Study Tips" &&
        quickButtons[2] === "Summarize Notes" &&
        quickButtons[3] === "Solve Problem" &&
        quickButtons[4] === "Essay Ideas" &&
        quickButtons[5] === "Translate";
      const composer = main?.querySelector('input[aria-label="Message the assistant"]');
      const composerOk =
        !!composer &&
        composer.value === "";
      const send = main?.querySelector('button[aria-label="Send message"]');
      const sendOk = !!send && send.disabled === true;
      const hintOk =
        main?.textContent?.includes("Press Enter to send, Shift + Enter for a new line") === true;
      const noOverflow = document.documentElement.scrollWidth <= 768;
      return lightShell && headerOk && introOk && quickOk && composerOk && sendOk && hintOk && noOverflow;
    },
    null,
    { timeout: 15000 },
  );
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/112-clone-bm-rotation-light-midband-aiassistant.png` });

  // ---- The distinct-frame verification — the AR7 gate, the s93 I5 shape --
  const md5 = (p) => createHash("md5").update(readFileSync(p)).digest("hex");
  const frames = [
    `${OUT}/112-clone-bm-rotation-light-midband-mathsolver.png`,
    `${OUT}/112-clone-bm-rotation-light-midband-aiassistant.png`,
  ].map(md5);
  const distinct = new Set(frames).size === frames.length;
  if (!distinct) {
    // The failure path prints its OWN line — no success-shaped prose on a
    // failed gate. The S95/AV2 semantics: process.exitCode = 1 (the
    // S91/AR7 gate semantics — an exit-code-checking wrapper must see the
    // failure).
    console.log(`S112 BM frames DUPLICATE: ${frames.join(" ")} — the md5 gate FAILS this run`);
    process.exitCode = 1;
    md5Failed = true;
  } else {
    console.log(`S112 BM frames: ${frames.join(" ")} — all DISTINCT`);
  }
} catch (err) {
  // The AX3 shape (the s96 audit's I3): the failure path is gate-OWNED — a
  // mid-run throw exits 1 through this catch with a script-owned failure
  // line, not through node's unhandled-rejection spew. The md5Failed
  // shape generalized: every failure path sets process.exitCode = 1, and
  // the completion line below keys on the explicit booleans.
  console.error(`S112 BM surface captures FAILED: ${err?.message ?? err}`);
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
if (!md5Failed && !thrown) console.log("S112 BM surface captures complete");
