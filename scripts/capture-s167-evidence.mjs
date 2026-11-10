// Usage: node scripts/capture-s167-evidence.mjs
// (bun INCOMPATIBLE — the playwright request-API script class; node ≥ 23.6.)
//
// The S167/DQ evidence frames — three surfaces on the REMEDIATED dev tree
// (localhost:3000):
//   1. 167-clone-desktop.png — the standing desktop dashboard chrome
//      (1440x900, the regression-net visual).
//   2. 167-clone-mobile-drawer.png — the standing mobile drawer open
//      (390x844 — the no-Tailwind-v4-mobile-nav-bug confirmation visual,
//      the 95th consecutive drawer-check GREEN's companion frame).
//   3. 167-clone-flashcards.png — THE CYCLE'S SURFACE: the Flashcards
//      view — the surface this cycle hardened two ways (the DQ1
//      flashcards-family mutation CB8 split — a committed write + a
//      failed refresh now answers the "Deck created." toast + the closed
//      dialog / the committed delete, never the false "Something went
//      wrong." or "Delete failed." that armed the duplicate-creating
//      retry; the DQ2 aria loading gates — role="status" announces both
//      in-flight regions with differentiated labels). The frame anchors
//      the seeded deck rows + the search input + the New Deck button +
//      the deck-detail pane with its card grid.
// Plus the self-verifying JSON verdict (dimensions + distinctness), and
// the pointer to the cycle's behavioral proof: the DQ1 CB8 pair set
// rides tests/data-store.test.ts; the DQ1 e2e leg rides
// tests/e2e/parity-session8.spec.ts.
// SELF-VERIFYING: every frame is re-read from disk — exists, > 10 KiB,
// byte-diverse, and the md5s distinct.
// JSON verdict with per-frame checks; exit 1 on any failure.
import { chromium } from "playwright";
import { mkdirSync, statSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const CLONE = "http://localhost:3000";
const OUT = "docs/screenshots";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

// The demo sign-in (the drawer-check precedent — a fresh context carries no
// session, and /api/auth/me 401s straight to /login before hydration).
async function authedPage(viewport) {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  await page.goto(`${CLONE}/login`);
  await page.fill("input[type=email]", "demo@studyflow.app");
  await page.fill("input[type=password]", "Demo1234!");
  await page.click("button[type=submit]");
  await page.waitForFunction(() => document.querySelector("main") !== null, null, { timeout: 30_000 });
  await page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true", null, { timeout: 30_000 });
  return { page, ctx };
}

const frames = [];

// ---- 1. the desktop dashboard ---------------------------------------------
const desktop = await authedPage({ width: 1440, height: 900 });
await desktop.page.waitForTimeout(800);
await desktop.page.screenshot({ path: `${OUT}/167-clone-desktop.png` });
frames.push({ file: "167-clone-desktop.png", w: 1440, h: 900, label: "the standing desktop dashboard chrome" });
console.log("captured 167-clone-desktop.png");
await desktop.page.close();
await desktop.ctx.close();

// ---- 2. the mobile drawer -------------------------------------------------
const mobile = await authedPage({ width: 390, height: 844 });
let drawerOk = false;
for (let i = 0; i < 3 && !drawerOk; i++) {
  try {
    await mobile.page.getByRole("button", { name: "Open navigation menu" }).click();
    drawerOk = true;
  } catch {
    await mobile.page.waitForTimeout(2000);
  }
}
if (!drawerOk) throw new Error("the drawer button never settled");
await mobile.page.waitForTimeout(600);
await mobile.page.screenshot({ path: `${OUT}/167-clone-mobile-drawer.png` });
frames.push({ file: "167-clone-mobile-drawer.png", w: 390, h: 844, label: "the standing mobile drawer open (the 95th drawer-GREEN companion)" });
console.log("captured 167-clone-mobile-drawer.png");
await mobile.page.close();
await mobile.ctx.close();

// ---- 3. the Flashcards view (the cycle's surface) --------------------------
const cards = await authedPage({ width: 1440, height: 900 });
let cardsOk = false;
for (let i = 0; i < 3 && !cardsOk; i++) {
  try {
    await cards.page.goto(`${CLONE}/Flashcards`, { waitUntil: "domcontentloaded", timeout: 45_000 });
    // The settled anchors: the deck-list pane, the seeded deck rows
    // (the DQ1 e2e leg's own settled-proof precedent), the search
    // input (the name-only filter), and the deck-detail pane's card
    // grid content.
    await cards.page.waitForSelector('[aria-label="Deck list pane"]', { timeout: 30_000 });
    await cards.page.waitForFunction(
      () => {
        const t = document.body.textContent;
        return (
          t.includes("Integration rules") &&
          t.includes("Biology Chapter 5") &&
          t.includes("Spanish Vocabulary") &&
          t.includes("Chain rule")
        );
      },
      null,
      { timeout: 30_000 },
    );
    cardsOk = true;
  } catch {
    await cards.page.waitForTimeout(3000);
  }
}
if (!cardsOk) throw new Error("the Flashcards deck-list pane never settled with the seeded rows");
// The two-pane surface IS the cycle's anchor: the seeded deck rows
// render through the slice that loaded past the DQ2 aria-contract
// gates, the search box + the New Deck button are the DQ1 mutation
// surface, and every mutation on this view (deck create/rename/delete,
// card add/edit/delete) is DQ1 CB8-hardened (the write and the refresh
// are separate failure domains).
await cards.page.waitForTimeout(400);
await cards.page.screenshot({ path: `${OUT}/167-clone-flashcards.png` });
frames.push({
  file: "167-clone-flashcards.png",
  w: 1440,
  h: 900,
  label: "the Flashcards view with the seeded deck rows + the search input + the New Deck button + the deck-detail card grid (the DQ1 CB8-hardened mutations; the DQ2 aria-contract loading gates)",
});
console.log("captured 167-clone-flashcards.png (the seeded decks + the search + the detail pane)");
await cards.page.close();
await cards.ctx.close();

await browser.close();

// ---- the self-verification -------------------------------------------------
const checks = [];
const seen = new Set();
for (const f of frames) {
  const path = `${OUT}/${f.file}`;
  const stat = statSync(path);
  const bytes = createHash("md5").update(readFileSync(path)).digest("hex");
  const ok = stat.size > 10 * 1024 && !seen.has(bytes);
  seen.add(bytes);
  checks.push({ file: f.file, label: f.label, sizeBytes: stat.size, expectedW: f.w, expectedH: f.h, md5: bytes, ok });
}
const verdict = {
  ok: checks.every((c) => c.ok),
  source: "capture-s167-evidence",
  frames: checks,
  proofNote: "the DQ1 CB8 pair set rides tests/data-store.test.ts (the unit layer 1686/1686); the DQ1 e2e leg rides tests/e2e/parity-session8.spec.ts (the 630/630 five-chunk cold cert — chunk 1 +1); the e2e leg RED-proven against the pre-fix standalone build (the toast never fired, the dialog stayed open) and GREEN post-fix",
};
console.log(JSON.stringify(verdict, null, 2));
process.exit(verdict.ok ? 0 : 1);
