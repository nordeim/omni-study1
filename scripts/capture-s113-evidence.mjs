// S113 · Batch BN surface evidence captures — the register rotation (the
// BN1 headline: the BM1 register note's 239/120 counts describe the
// pre-s112-rider tree; the post-BM final-tree re-derivation is 241 importers
// / 122 carriers / 0 stale / 119 usage-line-free — the doctrine's own
// predicted drift, closed by the register rotation, not a pin change) +
// the s113 DESKTOP LIGHT evidence-frame rotation — the rotation program's
// SECOND PASS's opening cycle (the exhaustion cycle closed at s112: both
// the theme axis [all four viewport cells × both sides] AND the view-level
// rotation program [every nav view carrying at least one rotation frame]
// complete; the second pass re-probes any cell, any view, fresh).
//
// BN frames (the GUARDED surfaces, on the final build, both seeded-data
// deterministic — zero persistent state BY CONSTRUCTION, no dialog, no
// mutation, no route abort; the S102 lesson-2 doctrine: a seeded-data
// frame is the cleanest rotation — the seed is the deterministic driver
// that already ran): the rotation program's 26 committed frames cover all
// four viewport cells on BOTH sides (1280×800 desktop ×10 dark, s100–s104,
// + ×2 light, s109 — Events + Analytics; 390×844 mobile-portrait ×4 dark,
// s105–s106, + ×2 light, s110 — Settings + Files; 844×390
// mobile-landscape ×2 dark, s107, + ×2 light, s111 — Calendar +
// FocusTimer; 768×1024 mid-band ×2 dark, s108, + ×2 light, s112 —
// MathSolver + AIAssistant). The second pass opens at the DESKTOP LIGHT
// cell (1280×800 — the home band, its light coverage the thinnest of the
// four cells) with the two views whose prior rotation frames are ALL
// dark-side: Flashcards (s103 desktop-dark + s106 mobile-dark) and
// Timetable (s104 desktop-dark + s105 mobile-dark) — both views' FIRST
// light-side frames and first desktop-light re-probes.
//
// Frame 1: the FLASHCARDS view at 1280×800 in LIGHT — the view's FIRST
// light-side rotation frame. The h1 "Flashcards" (the view carries no
// subtitle), the aria-label="Deck list pane" aside with the New Deck
// button and the aria-label="Search decks" input at its "Search decks…"
// rest placeholder, the aria-label="Deck rows" list with the three seeded
// decks in their seeded order — "Integration rules" (4 cards) / "Biology
// Chapter 5" (2 cards) / "Spanish Vocabulary" (0 cards) — the
// aria-label="Deck detail" pane with the auto-selected first deck
// "Integration rules" + its description "Derivatives and
// antiderivatives", the AI Generate / Add Card / Study buttons, the Edit
// deck / Delete deck buttons, and the aria-label="Card grid" grid with
// the four seeded cards of the selected deck — Chain rule (Medium) /
// "What does ATP stand for?" (Easy) / Enzyme function definition
// (Medium) / Krebs cycle location (Hard) — each card carrying its Edit
// card / Delete card buttons — all deterministic from the seed with ZERO
// interaction. The desktop no-overflow contract (scrollWidth <= 1280).
//
// Frame 2: the TIMETABLE view at 1280×800 in LIGHT — the view's FIRST
// light-side rotation frame. The h1 "Timetable" + subtitle "Manage your
// class schedule", the aria-label="Week filter" combobox at its "All
// Weeks" rest value, the Grid Builder / Add Class buttons, the month-label
// h2 at the "Month YYYY" pattern ("October 2026" at plan time — the live
// clock's own signature, the s111 Calendar precedent), the
// aria-label="Week banner" group with its Previous week / Next week
// buttons, the aria-label="Week grid" with the aria-label="Week header"
// day row and the aria-label="Hour cells" column carrying the five seeded
// classes in their day columns — Calculus II 9:00–10:30 · M201 (Monday) /
// Physics 11:00–12:30 · P105 (Tuesday, Week A) / World History
// 9:00–10:30 · H14 (Wednesday) / English Literature 13:00–14:30 · E3
// (Thursday) / Chemistry Lab 14:00–16:00 · Sci 2 (Friday, Week B) — and
// the h2 "My Classes" + the aria-label="My Classes header" side panel
// (the current-date line — the live clock) listing the five classes with
// their rooms / durations / week types — pure seed read, ZERO interaction.
// The desktop no-overflow contract (scrollWidth <= 1280).
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
// Usage: node scripts/capture-s113-evidence.mjs
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

// The DESKTOP viewport — 1280×800, the rotation program's home-band cell
// (its committed light frames: Events + Analytics at s109; the second
// pass opens here); the lg:flex desktop rail renders BY CONSTRUCTION
// while the below-lg app-bar + hamburger chrome stays absent — the full
// desktop light shape.
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

  // ============ BN · the guarded surface, leg 1 (desktop light flashcards)
  // LIGHT mode (the S10 API pattern — the gotoDark spec contract inverted:
  // PATCH the preference, then NAVIGATE; the boot script applies the mode
  // on load). The PATCH is explicit — the demo user's stored mode is the
  // closing state (light) but a prior failed run must never strand a dark
  // window for this leg.
  await page.request.patch(`${BASE}${PREFERENCES}`, { data: { accentColor: "violet", themeMode: "light" } });
  await page.goto(`${BASE}/Flashcards`);
  await page.waitForFunction(
    () =>
      !document.documentElement.classList.contains("dark") &&
      document.documentElement.style.getPropertyValue("--sf-primary") !== "",
    null,
    { timeout: 15000 },
  );
  // The desktop-light Flashcards's guarded families — the h1 "Flashcards"
  // (the view carries no subtitle — the h1's parent carries no p), the
  // "Deck list pane" aside with the New Deck button and the "Search
  // decks" input at its "Search decks…" rest placeholder, the "Deck
  // rows" list with the three seeded decks in their seeded order, the
  // "Deck detail" pane with the auto-selected first deck + its
  // description and its AI Generate / Add Card / Study / Edit deck /
  // Delete deck buttons, the "Card grid" with the four seeded cards each
  // carrying its Edit card / Delete card buttons, and the desktop
  // no-overflow contract (scrollWidth <= 1280).
  await page.waitForFunction(
    () => {
      const html = document.documentElement;
      const lightShell = !html.classList.contains("dark");
      const main = document.querySelector("main");
      const h1 = main?.querySelector("h1");
      const headerOk =
        h1?.textContent?.trim() === "Flashcards" &&
        (h1?.parentElement?.querySelector("p") ?? null) === null;
      const pane = main?.querySelector('[aria-label="Deck list pane"]');
      const newDeck = [...(pane?.querySelectorAll("button") ?? [])].find(
        (b) => b.getAttribute("aria-label") === "New Deck",
      );
      const search = pane?.querySelector('input[aria-label="Search decks"]');
      const paneOk =
        !!pane && !!newDeck && !!search && search.placeholder === "Search decks…" && search.value === "";
      const rows = main?.querySelector('[aria-label="Deck rows"]');
      const rowsText = rows?.textContent ?? "";
      const rowsOk =
        !!rows &&
        rowsText.includes("Integration rules") && rowsText.includes("4 cards") &&
        rowsText.includes("Biology Chapter 5") && rowsText.includes("2 cards") &&
        rowsText.includes("Spanish Vocabulary") && rowsText.includes("0 cards");
      const detail = main?.querySelector('[aria-label="Deck detail"]');
      const detailButtons = [...(detail?.querySelectorAll("button") ?? [])].map((b) => b.textContent?.trim() ?? "");
      const detailOk =
        !!detail &&
        detail.querySelector("h2")?.textContent?.trim() === "Integration rules" &&
        (detail.textContent ?? "").includes("Derivatives and antiderivatives") &&
        detailButtons.includes("AI Generate") &&
        detailButtons.includes("Add Card") &&
        detailButtons.includes("Study");
      const grid = main?.querySelector('[aria-label="Card grid"]');
      const gridText = grid?.textContent ?? "";
      const editCards = [...(grid?.querySelectorAll("button") ?? [])].filter(
        (b) => b.getAttribute("aria-label") === "Edit card",
      ).length;
      const deleteCards = [...(grid?.querySelectorAll("button") ?? [])].filter(
        (b) => b.getAttribute("aria-label") === "Delete card",
      ).length;
      // The difficulty pills' raw textContent is LOWERCASE ("medium" /
      // "easy" / "hard") — the capitalization is the CSS transform, not the
      // DOM text (the S112 lesson-2 element-tag doctrine applied to the
      // text-form axis, live-probed BEFORE this gate ran).
      const gridOk =
        !!grid &&
        gridText.includes("Chain rule") && gridText.includes("medium") &&
        gridText.includes("What does ATP stand for?") && gridText.includes("easy") &&
        gridText.includes("Enzyme function definition") &&
        gridText.includes("Krebs cycle location") && gridText.includes("hard") &&
        editCards === 4 && deleteCards === 4;
      const noOverflow = document.documentElement.scrollWidth <= 1280;
      return lightShell && headerOk && paneOk && rowsOk && detailOk && gridOk && noOverflow;
    },
    null,
    { timeout: 15000 },
  );
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/113-clone-bn-rotation-light-desktop-flashcards.png` });

  // ============ BN · leg 2 — the desktop light timetable ================
  // Still light (the same PATCH owns the window) — NAVIGATE to the
  // Timetable view; the week grid, the seeded classes and the My Classes
  // panel render.
  await page.goto(`${BASE}/Timetable`);
  await page.waitForFunction(
    () =>
      !document.documentElement.classList.contains("dark") &&
      document.documentElement.style.getPropertyValue("--sf-primary") !== "",
    null,
    { timeout: 15000 },
  );
  // The desktop-light Timetable's guarded families — the h1 "Timetable" +
  // subtitle "Manage your class schedule", the "Week filter" combobox at
  // its "All Weeks" rest value, the Grid Builder / Add Class buttons, the
  // month-label h2 at the "Month YYYY" pattern (the live clock's own
  // signature — the s111 Calendar precedent), the "Week banner" group
  // with its Previous week / Next week buttons, the "Week grid" with its
  // "Week header" day row and its "Hour cells" column carrying the five
  // seeded classes in their day columns, the h2 "My Classes" + the "My
  // Classes header" side panel listing the five classes with their
  // week types, and the desktop no-overflow contract
  // (scrollWidth <= 1280) — ZERO interaction.
  await page.waitForFunction(
    () => {
      const html = document.documentElement;
      const lightShell = !html.classList.contains("dark");
      const main = document.querySelector("main");
      const h1 = main?.querySelector("h1");
      const sub = h1?.parentElement?.querySelector("p");
      const headerOk =
        h1?.textContent?.trim() === "Timetable" &&
        sub?.textContent?.trim() === "Manage your class schedule";
      const filter = main?.querySelector('button[aria-label="Week filter"]');
      const filterOk = !!filter && filter.getAttribute("role") === "combobox" &&
        (filter.textContent ?? "").includes("All Weeks");
      const buttons = [...(main?.querySelectorAll("button") ?? [])].map((b) => b.textContent?.trim() ?? "");
      const chromeOk = buttons.includes("Grid Builder") && buttons.includes("Add Class");
      const monthOk = [...(main?.querySelectorAll("h2") ?? [])].some((h) =>
        /^(January|February|March|April|May|June|July|August|September|October|November|December) \d{4}$/.test(
          h.textContent?.trim() ?? "",
        ),
      );
      const banner = main?.querySelector('[aria-label="Week banner"]');
      const prev = [...(banner?.querySelectorAll("button") ?? [])].find(
        (b) => b.getAttribute("aria-label") === "Previous week",
      );
      const next = [...(banner?.querySelectorAll("button") ?? [])].find(
        (b) => b.getAttribute("aria-label") === "Next week",
      );
      const bannerOk = !!banner && !!prev && !!next;
      const grid = main?.querySelector('[aria-label="Week grid"]');
      const gridText = grid?.textContent ?? "";
      const classesOk =
        !!grid &&
        gridText.includes("Calculus II") && gridText.includes("9:00–10:30 · M201") &&
        gridText.includes("Physics") && gridText.includes("11:00–12:30 · P105") &&
        gridText.includes("World History") && gridText.includes("9:00–10:30 · H14") &&
        gridText.includes("English Literature") && gridText.includes("13:00–14:30 · E3") &&
        gridText.includes("Chemistry Lab") && gridText.includes("14:00–16:00 · Sci 2");
      const structureOk =
        !!grid?.querySelector('[aria-label="Week header"]') &&
        !!grid?.querySelector('[aria-label="Hour cells"]');
      const listHeader = main?.querySelector('[aria-label="My Classes header"]');
      // The class LIST lives in the header's parent section (the sf-card) —
      // the header div itself carries only the "My Classes" h2 + the
      // current-date line (live-probed BEFORE this gate ran; the list rows
      // are the section's children, not the header's).
      const listText = listHeader?.parentElement?.textContent ?? "";
      const listOk =
        [...(main?.querySelectorAll("h2") ?? [])].some((h) => h.textContent?.trim() === "My Classes") &&
        !!listHeader &&
        listText.includes("Calculus II") && listText.includes("M201") &&
        listText.includes("Physics") && listText.includes("Week A") &&
        listText.includes("World History") && listText.includes("H14") &&
        listText.includes("English Literature") && listText.includes("E3") &&
        listText.includes("Chemistry Lab") && listText.includes("Week B");
      const noOverflow = document.documentElement.scrollWidth <= 1280;
      return lightShell && headerOk && filterOk && chromeOk && monthOk && bannerOk && classesOk && structureOk && listOk && noOverflow;
    },
    null,
    { timeout: 15000 },
  );
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/113-clone-bn-rotation-light-desktop-timetable.png` });

  // ---- The distinct-frame verification — the AR7 gate, the s93 I5 shape --
  const md5 = (p) => createHash("md5").update(readFileSync(p)).digest("hex");
  const frames = [
    `${OUT}/113-clone-bn-rotation-light-desktop-flashcards.png`,
    `${OUT}/113-clone-bn-rotation-light-desktop-timetable.png`,
  ].map(md5);
  const distinct = new Set(frames).size === frames.length;
  if (!distinct) {
    // The failure path prints its OWN line — no success-shaped prose on a
    // failed gate. The S95/AV2 semantics: process.exitCode = 1 (the
    // S91/AR7 gate semantics — an exit-code-checking wrapper must see the
    // failure).
    console.log(`S113 BN frames DUPLICATE: ${frames.join(" ")} — the md5 gate FAILS this run`);
    process.exitCode = 1;
    md5Failed = true;
  } else {
    console.log(`S113 BN frames: ${frames.join(" ")} — all DISTINCT`);
  }
} catch (err) {
  // The AX3 shape (the s96 audit's I3): the failure path is gate-OWNED — a
  // mid-run throw exits 1 through this catch with a script-owned failure
  // line, not through node's unhandled-rejection spew. The md5Failed
  // shape generalized: every failure path sets process.exitCode = 1, and
  // the completion line below keys on the explicit booleans.
  console.error(`S113 BN surface captures FAILED: ${err?.message ?? err}`);
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
if (!md5Failed && !thrown) console.log("S113 BN surface captures complete");
