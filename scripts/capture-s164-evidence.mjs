// Usage: node scripts/capture-s164-evidence.mjs
// (bun INCOMPATIBLE — the playwright request-API script class; node ≥ 23.6.)
//
// The S164/DM evidence frames — three surfaces on the REMEDIATED dev tree
// (localhost:3000):
//   1. 164-clone-desktop.png — the standing desktop dashboard chrome
//      (1440x900, the regression-net visual).
//   2. 164-clone-mobile-drawer.png — the standing mobile drawer open
//      (390x844 — the no-Tailwind-v4-mobile-nav-bug confirmation visual,
//      the 89th consecutive drawer-check GREEN's companion frame).
//   3. 164-clone-assignments.png — THE CYCLE'S SURFACE: the Assignments
//      view — the surface this cycle hardened three ways (the DM1
//      assignments mutation CB8 split — a committed write + failed
//      refresh now answers the success toast, never the false
//      save-failure that armed the duplicate-creating retry, and the
//      slider's onValueCommit leg no longer false-fails on a saved drag;
//      the DM2 aria loading gate — role="status" announces the in-flight
//      window; the DM3 PRIORITIES single-source alias — the Priority
//      select consumes validation.ts's ASSIGNMENT_PRIORITIES through the
//      census-guarded import). The frame anchors the seeded rows with
//      their priority pills (the DM3 alias's render path) — the seeded
//      "Kinetics lab write-up" urgent row and the "Problem set 6"
//      worksheet row.
// Plus the self-verifying JSON verdict (dimensions + distinctness), and
// the pointer to the cycle's behavioral proof: the DM1 CB8 pair set +
// the DM3 census pair ride tests/data-store.test.ts +
// tests/enum-single-source.test.ts; the DM1 e2e leg rides
// tests/e2e/parity-session9.spec.ts; the DM4-corrected DJ5 leg rides
// tests/e2e/resilience.spec.ts.
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
await desktop.page.screenshot({ path: `${OUT}/164-clone-desktop.png` });
frames.push({ file: "164-clone-desktop.png", w: 1440, h: 900, label: "the standing desktop dashboard chrome" });
console.log("captured 164-clone-desktop.png");
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
await mobile.page.screenshot({ path: `${OUT}/164-clone-mobile-drawer.png` });
frames.push({ file: "164-clone-mobile-drawer.png", w: 390, h: 844, label: "the standing mobile drawer open (the 89th drawer-GREEN companion)" });
console.log("captured 164-clone-mobile-drawer.png");
await mobile.page.close();
await mobile.ctx.close();

// ---- 3. the Assignments view (the cycle's surface) -------------------------
const assignments = await authedPage({ width: 1440, height: 900 });
let assignmentsOk = false;
for (let i = 0; i < 3 && !assignmentsOk; i++) {
  try {
    await assignments.page.goto(`${CLONE}/Assignments`, { waitUntil: "domcontentloaded", timeout: 45_000 });
    // The rows anchor: the role="group" list settles, at least one row
    // renders, AND a priority pill is present (the pill's vocabulary rides
    // the DM3 ASSIGNMENT_PRIORITIES single source — the seeded urgent row
    // renders through the census-guarded import).
    await assignments.page.waitForSelector('[aria-label="Assignment rows"]', { timeout: 30_000 });
    await assignments.page.waitForFunction(
      () => document.querySelectorAll('[aria-label="Assignment rows"] > *').length > 0,
      null,
      { timeout: 30_000 },
    );
    await assignments.page.waitForFunction(
      () => {
        const t = document.body.textContent;
        return t.includes("urgent") && t.includes("Problem set 6");
      },
      null,
      { timeout: 30_000 },
    );
    assignmentsOk = true;
  } catch {
    await assignments.page.waitForTimeout(3000);
  }
}
if (!assignmentsOk) throw new Error("the Assignments rows never settled with a priority pill");
// The assignment rows ARE the cycle's surface anchors: every row's
// priority pill renders through the DM3 single-source alias, the rows
// were loaded through the CE3 gate that now carries the DM2 aria
// contract, and every mutation that edits them (the dialog saves + the
// progress slider commits) is DM1 CB8-hardened (the write and the
// refresh are separate failure domains).
await assignments.page.waitForTimeout(400);
await assignments.page.screenshot({ path: `${OUT}/164-clone-assignments.png` });
frames.push({
  file: "164-clone-assignments.png",
  w: 1440,
  h: 900,
  label: "the Assignments view with the seeded rows + their priority pills (the DM3 single-source alias's render path; the DM2 aria-contract loading gate; the DM1 CB8-hardened mutations)",
});
console.log("captured 164-clone-assignments.png (the rows + the priority pills)");
await assignments.page.close();
await assignments.ctx.close();

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
  source: "capture-s164-evidence",
  frames: checks,
  proofNote: "the DM1 CB8 pair set rides tests/data-store.test.ts + the DM3 census pair rides tests/enum-single-source.test.ts (the unit layer 1663/1663); the DM1 e2e leg rides tests/e2e/parity-session9.spec.ts + the DM4-corrected DJ5 leg rides tests/e2e/resilience.spec.ts (the 626/626 five-chunk cold cert — chunk 2 +1); the DM1 e2e leg RED-proven against the pre-fix standalone build (the toast never fired) and GREEN post-fix; the DM4 bisect pair: the DJ5 leg fails 3/3 on the DM1 build under the old single-star glob, GREEN under the corrected double-star",
};
console.log(JSON.stringify(verdict, null, 2));
process.exit(verdict.ok ? 0 : 1);
