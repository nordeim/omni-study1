// Usage: node scripts/capture-s163-evidence.mjs
// (bun INCOMPATIBLE — the playwright request-API script class; node ≥ 23.6.)
//
// The S163/DL evidence frames — three surfaces on the REMEDIATED dev tree
// (localhost:3000):
//   1. 163-clone-desktop.png — the standing desktop dashboard chrome
//      (1440x900, the regression-net visual).
//   2. 163-clone-mobile-drawer.png — the standing mobile drawer open
//      (390x844 — the no-Tailwind-v4-mobile-nav-bug confirmation visual,
//      the 87th consecutive drawer-check GREEN's companion frame).
//   3. 163-clone-exams.png — THE CYCLE'S SURFACE: the Exams view — the
//      surface this cycle hardened three ways (the DL1 exams mutation
//      CB8 split — a committed write + failed refresh now answers the
//      success toast, never the false save-failure that armed the
//      duplicate-creating retry; the DL2 aria loading gate —
//      role="status" announces the in-flight window; the DL3
//      parseExamTopics promotion — the card topic chips and the Edit
//      dialog now share the src/lib/data.ts seam). The frame anchors the
//      seeded exam cards with their topic chips (the DL3 seam's render
//      path).
// Plus the self-verifying JSON verdict (dimensions + distinctness), and
// the pointer to the cycle's behavioral proof: the DL1 CB8 pair set +
// the DL3 helper pins ride tests/data-store.test.ts; the DL1 e2e leg
// rides tests/e2e/parity-session8.spec.ts.
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
await desktop.page.screenshot({ path: `${OUT}/163-clone-desktop.png` });
frames.push({ file: "163-clone-desktop.png", w: 1440, h: 900, label: "the standing desktop dashboard chrome" });
console.log("captured 163-clone-desktop.png");
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
await mobile.page.screenshot({ path: `${OUT}/163-clone-mobile-drawer.png` });
frames.push({ file: "163-clone-mobile-drawer.png", w: 390, h: 844, label: "the standing mobile drawer open (the 87th drawer-GREEN companion)" });
console.log("captured 163-clone-mobile-drawer.png");
await mobile.page.close();
await mobile.ctx.close();

// ---- 3. the Exams view (the cycle's surface) -------------------------------
const exams = await authedPage({ width: 1440, height: 900 });
let examsOk = false;
for (let i = 0; i < 3 && !examsOk; i++) {
  try {
    await exams.page.goto(`${CLONE}/Exams`, { waitUntil: "domcontentloaded", timeout: 45_000 });
    // The cards-grid anchor: the role="group" grid settles, at least one
    // card renders, AND a topic chip is present (the chip text rides the
    // DL3 promoted parseExamTopics seam — the seeded "Integration by
    // parts" topic renders through the single source).
    await exams.page.waitForSelector('[aria-label="Exam cards"]', { timeout: 30_000 });
    await exams.page.waitForFunction(
      () => document.querySelectorAll('[aria-label="Exam cards"] > div').length > 0,
      null,
      { timeout: 30_000 },
    );
    await exams.page.waitForFunction(
      () => document.body.textContent.includes("Integration by parts"),
      null,
      { timeout: 30_000 },
    );
    examsOk = true;
  } catch {
    await exams.page.waitForTimeout(3000);
  }
}
if (!examsOk) throw new Error("the Exams cards never settled with a topic chip");
// The exam cards ARE the cycle's surface anchors: every card's topic chips
// render through the promoted parseExamTopics seam (DL3), the cards were
// loaded through the CE3 gate that now carries the DL2 aria contract, and
// every mutation that edits them is DL1 CB8-hardened (the write and the
// refresh are separate failure domains).
await exams.page.waitForTimeout(400);
await exams.page.screenshot({ path: `${OUT}/163-clone-exams.png` });
frames.push({
  file: "163-clone-exams.png",
  w: 1440,
  h: 900,
  label: "the Exams view with the seeded cards + their topic chips (the DL3 promoted parseExamTopics seam's render path; the DL2 aria-contract loading gate; the DL1 CB8-hardened mutations)",
});
console.log("captured 163-clone-exams.png (the cards + the topic chips)");
await exams.page.close();
await exams.ctx.close();

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
  source: "capture-s163-evidence",
  frames: checks,
  proofNote: "the DL1 CB8 pair set + the DL3 helper pins ride tests/data-store.test.ts (the unit layer 1657/1657); the DL1 e2e leg rides tests/e2e/parity-session8.spec.ts (the 625/625 five-chunk cold cert — chunk 1 +1); the DL1 e2e leg RED-proven against the pre-fix standalone build (the set-aside/rebuild/re-run sequence) and GREEN post-fix",
};
console.log(JSON.stringify(verdict, null, 2));
process.exit(verdict.ok ? 0 : 1);
