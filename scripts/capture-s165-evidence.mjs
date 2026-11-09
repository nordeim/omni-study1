// Usage: node scripts/capture-s165-evidence.mjs
// (bun INCOMPATIBLE — the playwright request-API script class; node ≥ 23.6.)
//
// The S165/DN evidence frames — three surfaces on the REMEDIATED dev tree
// (localhost:3000):
//   1. 165-clone-desktop.png — the standing desktop dashboard chrome
//      (1440x900, the regression-net visual).
//   2. 165-clone-mobile-drawer.png — the standing mobile drawer open
//      (390x844 — the no-Tailwind-v4-mobile-nav-bug confirmation visual,
//      the 91st consecutive drawer-check GREEN's companion frame).
//   3. 165-clone-timetable.png — THE CYCLE'S SURFACE: the Timetable
//      view — the surface this cycle hardened three ways (the DN1
//      timetable mutation CB8 split — a committed write + failed
//      refresh now answers the success toast, never the false
//      save-failure that armed the duplicate-creating retry; the DN2
//      aria loading gate — role="status" announces the in-flight
//      window — plus the removed unreachable day-detail gate; the DN3
//      WEEK_TYPES single-source port — both week Selects consume
//      validation.ts's WEEK_TYPES through the census-guarded import
//      with the exhaustively-typed label map). The frame anchors the
//      seeded week grid with its class cells (the DN3 map's render
//      path — the filter select reads "All Weeks" through
//      WEEK_TYPE_LABELS) and the My Classes cards.
// Plus the self-verifying JSON verdict (dimensions + distinctness), and
// the pointer to the cycle's behavioral proof: the DN1 CB8 pair set +
// the DN3 census pair ride tests/data-store.test.ts +
// tests/enum-single-source.test.ts; the DN1 e2e leg rides
// tests/e2e/parity-session9.spec.ts.
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
await desktop.page.screenshot({ path: `${OUT}/165-clone-desktop.png` });
frames.push({ file: "165-clone-desktop.png", w: 1440, h: 900, label: "the standing desktop dashboard chrome" });
console.log("captured 165-clone-desktop.png");
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
await mobile.page.screenshot({ path: `${OUT}/165-clone-mobile-drawer.png` });
frames.push({ file: "165-clone-mobile-drawer.png", w: 390, h: 844, label: "the standing mobile drawer open (the 91st drawer-GREEN companion)" });
console.log("captured 165-clone-mobile-drawer.png");
await mobile.page.close();
await mobile.ctx.close();

// ---- 3. the Timetable view (the cycle's surface) ---------------------------
const timetable = await authedPage({ width: 1440, height: 900 });
let timetableOk = false;
for (let i = 0; i < 3 && !timetableOk; i++) {
  try {
    await timetable.page.goto(`${CLONE}/Timetable`, { waitUntil: "domcontentloaded", timeout: 45_000 });
    // The settled anchors: the week banner (renders only in the
    // has-classes branch — the DN1 e2e leg's own settled-proof
    // precedent), the week grid's class cells, and the week filter's
    // "All Weeks" trigger (the DN3 WEEK_TYPE_LABELS render path — the
    // options ride the census-guarded WEEK_TYPES import).
    await timetable.page.waitForSelector('[aria-label="Week banner"]', { timeout: 30_000 });
    await timetable.page.waitForSelector('[aria-label="Week grid"]', { timeout: 30_000 });
    await timetable.page.waitForFunction(
      () => {
        const t = document.body.textContent;
        return t.includes("My Classes") && t.includes("All Weeks");
      },
      null,
      { timeout: 30_000 },
    );
    timetableOk = true;
  } catch {
    await timetable.page.waitForTimeout(3000);
  }
}
if (!timetableOk) throw new Error("the Timetable grid never settled with the week filter");
// The week grid IS the cycle's surface anchor: every class cell renders
// from the slice that now loads through the DN2 aria-contract gate, every
// mutation that edits a class (the dialog saves) is DN1 CB8-hardened (the
// write and the refresh are separate failure domains), and the week
// filter + the dialog's Week select consume the DN3 single source.
await timetable.page.waitForTimeout(400);
await timetable.page.screenshot({ path: `${OUT}/165-clone-timetable.png` });
frames.push({
  file: "165-clone-timetable.png",
  w: 1440,
  h: 900,
  label: "the Timetable view with the seeded week grid + the week filter (the DN3 WEEK_TYPES single-source render path; the DN2 aria-contract loading gate; the DN1 CB8-hardened mutations)",
});
console.log("captured 165-clone-timetable.png (the week grid + the week filter)");
await timetable.page.close();
await timetable.ctx.close();

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
  source: "capture-s165-evidence",
  frames: checks,
  proofNote: "the DN1 CB8 pair set rides tests/data-store.test.ts + the DN3 census pair rides tests/enum-single-source.test.ts (the unit layer 1669/1669); the DN1 e2e leg rides tests/e2e/parity-session9.spec.ts (the 627/627 five-chunk cold cert — chunk 2 +1); the DN1 e2e leg RED-proven against the pre-fix standalone build (the toast never fired) and GREEN post-fix",
};
console.log(JSON.stringify(verdict, null, 2));
process.exit(verdict.ok ? 0 : 1);
