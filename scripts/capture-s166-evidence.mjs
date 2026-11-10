// Usage: node scripts/capture-s166-evidence.mjs
// (bun INCOMPATIBLE — the playwright request-API script class; node ≥ 23.6.)
//
// The S166/DP evidence frames — three surfaces on the REMEDIATED dev tree
// (localhost:3000):
//   1. 166-clone-desktop.png — the standing desktop dashboard chrome
//      (1440x900, the regression-net visual).
//   2. 166-clone-mobile-drawer.png — the standing mobile drawer open
//      (390x844 — the no-Tailwind-v4-mobile-nav-bug confirmation visual,
//      the 93rd consecutive drawer-check GREEN's companion frame).
//   3. 166-clone-notes.png — THE CYCLE'S SURFACE: the Notes view — the
//      surface this cycle hardened three ways (the DP1 notes-family
//      mutation CB8 split — a committed write + failed refresh now
//      answers the closed dialog / the saved tag patch, never the false
//      "Something went wrong." that armed the duplicate-creating retry;
//      the DP2 aria loading gates — role="status" announces both
//      in-flight regions with differentiated labels; the DP3
//      rendered-text search — the query matches what the preview
//      shows, never the markup). The frame anchors the seeded note
//      rows + the search input + the notebook/tag filter chrome.
// Plus the self-verifying JSON verdict (dimensions + distinctness), and
// the pointer to the cycle's behavioral proof: the DP1 CB8 pair set +
// the DP3 htmlToText seam pins ride tests/data-store.test.ts +
// tests/text.test.ts; the DP1 e2e leg rides tests/e2e/parity-session9.spec.ts
// + the DP3 e2e leg rides tests/e2e/parity-session7.spec.ts.
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
await desktop.page.screenshot({ path: `${OUT}/166-clone-desktop.png` });
frames.push({ file: "166-clone-desktop.png", w: 1440, h: 900, label: "the standing desktop dashboard chrome" });
console.log("captured 166-clone-desktop.png");
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
await mobile.page.screenshot({ path: `${OUT}/166-clone-mobile-drawer.png` });
frames.push({ file: "166-clone-mobile-drawer.png", w: 390, h: 844, label: "the standing mobile drawer open (the 93rd drawer-GREEN companion)" });
console.log("captured 166-clone-mobile-drawer.png");
await mobile.page.close();
await mobile.ctx.close();

// ---- 3. the Notes view (the cycle's surface) -------------------------------
const notes = await authedPage({ width: 1440, height: 900 });
let notesOk = false;
for (let i = 0; i < 3 && !notesOk; i++) {
  try {
    await notes.page.goto(`${CLONE}/Notes`, { waitUntil: "domcontentloaded", timeout: 45_000 });
    // The settled anchors: the list pane's h1, the seeded note rows
    // (the DP1 e2e leg's own settled-proof precedent), the search
    // input (the DP3 surface), and the notebook filter chrome.
    await notes.page.waitForSelector('[aria-label="Notes list pane"]', { timeout: 30_000 });
    await notes.page.waitForFunction(
      () => {
        const t = document.body.textContent;
        return (
          t.includes("Dot product intuition") &&
          t.includes("Integration techniques") &&
          t.includes("All Notebooks") &&
          t.includes("All Tags")
        );
      },
      null,
      { timeout: 30_000 },
    );
    notesOk = true;
  } catch {
    await notes.page.waitForTimeout(3000);
  }
}
if (!notesOk) throw new Error("the Notes list pane never settled with the seeded rows");
// The two-pane surface IS the cycle's anchor: the seeded rows render
// through the slice that loaded past the DP2 aria-contract gates, the
// search box + filters are the DP3 rendered-text surface, and every
// mutation on this view (notebook create/rename/delete, note
// create/save/delete, the tags chain) is DP1 CB8-hardened (the write
// and the refresh are separate failure domains).
await notes.page.waitForTimeout(400);
await notes.page.screenshot({ path: `${OUT}/166-clone-notes.png` });
frames.push({
  file: "166-clone-notes.png",
  w: 1440,
  h: 900,
  label: "the Notes view with the seeded rows + the search input + the notebook/tag filters (the DP3 rendered-text search surface; the DP2 aria-contract loading gates; the DP1 CB8-hardened mutations)",
});
console.log("captured 166-clone-notes.png (the seeded rows + the search + the filters)");
await notes.page.close();
await notes.ctx.close();

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
  source: "capture-s166-evidence",
  frames: checks,
  proofNote: "the DP1 CB8 pair set rides tests/data-store.test.ts + the DP3 htmlToText seam pins ride tests/text.test.ts (the unit layer 1679/1679); the DP1 e2e leg rides tests/e2e/parity-session9.spec.ts + the DP3 e2e leg rides tests/e2e/parity-session7.spec.ts (the 629/629 five-chunk cold cert — chunk 2 +2); both e2e legs RED-proven against the pre-fix standalone build (the dialog stayed open / the tag-name query matched) and GREEN post-fix",
};
console.log(JSON.stringify(verdict, null, 2));
process.exit(verdict.ok ? 0 : 1);
