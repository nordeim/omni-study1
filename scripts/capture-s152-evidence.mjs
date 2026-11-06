// Usage: node scripts/capture-s152-evidence.mjs
// (bun INCOMPATIBLE — the playwright request-API script class; node ≥ 23.6.)
//
// The S152/DA evidence frames — five surfaces on the REMEDIATED dev tree
// (localhost:3000):
//   1. 152-clone-desktop.png — the standing desktop dashboard chrome
//      (1440x900, the regression-net visual).
//   2. 152-clone-mobile-drawer.png — the standing mobile drawer open
//      (390x844 — the no-Tailwind-v4-mobile-nav-bug confirmation visual,
//      the 67th consecutive drawer-check GREEN's companion frame).
//   3. 152-clone-events-guard.png — the DA2 surface: the Events create
//      dialog with an EMPTY title submitted — the hand-guard's inline
//      "Please enter a title." error (the copy that used to arrive as the
//      server's raw Zod issue text; the S127/CB17 pattern generalized).
//   4. 152-clone-flashcards.png — the DA1 surface: the Flashcards deck
//      grid (the delete buttons whose handlers now carry the per-row
//      in-flight latch — the chrome is unchanged; the latch is the
//      double-fire guard).
//   5. 152-clone-practicetests.png — the DA3 surface: the practice-test
//      editor dialog with the AI Generate Questions button (the click
//      that now opens the replace-confirm when drafts exist instead of
//      silently replacing them — the adjudicated product decision).
//      The DA4 (the 401-order) + DA5 (the fullName trim) proofs ride the
//      unit layer (the S152/DA4 + S152/DA5 legs — the CW2 runtime-split
//      precedent: a status-code order and a schema transform are not
//      screenshot-provable).
// SELF-VERIFYING: every frame is re-read from disk — exists, > 10 KiB,
// byte-diverse (the non-blank pixel-variance proxy: the PNG buffer's
// distinct-byte census + dominant-byte share), and the five md5-distinct.
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
  // S134: also wait for hydration — a goto issued while the auth gate is
  // still redirecting aborts (net::ERR_ABORTED, the mid-boot bounce).
  await page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true", null, { timeout: 30_000 });
  return { page, ctx };
}

// ---- 1. the desktop dashboard ---------------------------------------------
const desktop = await authedPage({ width: 1440, height: 900 });
await desktop.page.waitForTimeout(800);
await desktop.page.screenshot({ path: `${OUT}/152-clone-desktop.png` });
console.log("captured 152-clone-desktop.png");
await desktop.page.close();
await desktop.ctx.close();

// ---- 2. the mobile drawer -------------------------------------------------
const mobile = await authedPage({ width: 390, height: 844 });
await mobile.page.getByRole("button", { name: "Open navigation menu" }).click();
await mobile.page.waitForTimeout(600);
await mobile.page.screenshot({ path: `${OUT}/152-clone-mobile-drawer.png` });
console.log("captured 152-clone-mobile-drawer.png");
await mobile.page.close();
await mobile.ctx.close();

// ---- 3. the Events dialog hand-guard (the DA2 surface) ---------------------
// The create dialog opened, the title left EMPTY, the submit pressed — the
// hand-guard's inline error renders in the dialog's error slot (the human
// copy that replaced the server's raw Zod issue text; no network round-trip
// fires — the guard returns before the fetch).
{
  const { page, ctx } = await authedPage({ width: 1440, height: 900 });
  await page.goto(`${CLONE}/Events`);
  await page.getByRole("heading", { name: "Events" }).waitFor({ state: "visible", timeout: 15_000 });
  await page.getByRole("button", { name: "New Event" }).first().click();
  const dlg = page.getByRole("dialog");
  await dlg.waitFor({ state: "visible", timeout: 15_000 });
  // The empty submit — the hand-guard answers in the dialog, no POST.
  await dlg.getByRole("button", { name: "Create event" }).click();
  await dlg.getByText("Please enter a title.").waitFor({ state: "visible", timeout: 10_000 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/152-clone-events-guard.png` });
  console.log("captured 152-clone-events-guard.png");
  await page.close();
  await ctx.close();
}

// ---- 4. the Flashcards deck grid (the DA1 surface) -------------------------
// The deck grid with its hover delete affordances (the handlers now carry
// the per-row deletingIds latch — the double-click no-op instead of the
// spurious "Delete failed." 404 toast; the chrome unchanged).
{
  const { page, ctx } = await authedPage({ width: 1440, height: 900 });
  await page.goto(`${CLONE}/Flashcards`);
  await page.getByRole("heading", { name: "Flashcards" }).waitFor({ state: "visible", timeout: 15_000 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/152-clone-flashcards.png` });
  console.log("captured 152-clone-flashcards.png");
  await page.close();
  await ctx.close();
}

// ---- 5. the practice-test editor (the DA3 surface) -------------------------
// The Create Test dialog with the AI Generate Questions button + the
// Add question scaffold — the surface whose Generate click now opens the
// replace-confirm when drafts exist (one draft added first, so the gate's
// precondition is visible in the frame).
{
  const { page, ctx } = await authedPage({ width: 1440, height: 900 });
  await page.goto(`${CLONE}/PracticeTests`);
  await page.getByRole("heading", { name: "Practice Tests" }).waitFor({ state: "visible", timeout: 15_000 });
  await page.getByRole("button", { name: "Create Test" }).first().click();
  const dlg = page.getByRole("dialog");
  await dlg.waitFor({ state: "visible", timeout: 15_000 });
  await dlg.locator("input").first().fill("S152 evidence frame");
  // One draft question added — the gate's precondition (drafts.length > 0).
  await dlg.getByRole("button", { name: /Add question/ }).click();
  await dlg.getByText(/questions added/).waitFor({ state: "visible", timeout: 10_000 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/152-clone-practicetests.png` });
  console.log("captured 152-clone-practicetests.png");
  await page.close();
  await ctx.close();
}

await browser.close();

// ---- the self-verification (the s143 convention) -------------------------
const frames = [
  "152-clone-desktop.png",
  "152-clone-mobile-drawer.png",
  "152-clone-events-guard.png",
  "152-clone-flashcards.png",
  "152-clone-practicetests.png",
];
const verdict = { frames: {}, ok: true };
const md5s = new Set();
for (const name of frames) {
  const path = `${OUT}/${name}`;
  const info = statSync(path);
  const buf = readFileSync(path);
  const distinct = new Set(buf).size;
  const dominant =
    [...buf.slice(0, 200_000)].reduce((m, b) => {
      m.set(b, (m.get(b) ?? 0) + 1);
      return m;
    }, new Map());
  const dominantShare =
    Math.max(...dominant.values()) / Math.min(buf.length, 200_000);
  const md5 = createHash("md5").update(buf).digest("hex");
  md5s.add(md5);
  const checks = {
    exists: info.isFile(),
    sizeKiB: Math.round(info.size / 1024),
    bigEnough: info.size > 10 * 1024,
    byteDiverse: distinct > 40,
    dominantShareLt95: dominantShare < 0.95,
  };
  verdict.frames[name] = checks;
  if (!Object.values(checks).every(Boolean)) verdict.ok = false;
}
if (md5s.size !== frames.length) {
  verdict.ok = false;
  verdict.md5Distinct = false;
}

console.log(JSON.stringify(verdict, null, 2));
process.exit(verdict.ok ? 0 : 1);
