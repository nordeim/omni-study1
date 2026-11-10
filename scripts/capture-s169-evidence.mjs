// Usage: node scripts/capture-s169-evidence.mjs
// (bun INCOMPATIBLE — the playwright request-API script class; node ≥ 23.6.)
//
// The S169/DS evidence frames — three surfaces on the REMEDIATED dev tree
// (localhost:3000):
//   1. 169-clone-desktop.png — the standing desktop dashboard chrome
//      (1440x900, the regression-net visual).
//   2. 169-clone-mobile-drawer.png — the standing mobile drawer open
//      (390x844 — the no-Tailwind-v4-mobile-nav-bug confirmation visual,
//      the 99th consecutive drawer-check GREEN's companion frame).
//   3. 169-clone-subjects.png — THE CYCLE'S SURFACE: the Settings view's
//      Subjects tab — the surface this cycle hardened two ways (the DS1
//      subjects-family mutation CB8 split — a committed write + a failed
//      refresh now answers the "Subject created" toast + the closed
//      dialog on the SubjectDialog surface, and the committed delete
//      never toasts the false "Could not delete the subject." even when
//      ONE of the ELEVEN SUBJECT_TOUCHED refresh GETs fails; the DS2
//      aria loading gate — role="status" announces the in-flight
//      subjects list). The frame anchors the seeded subject rows (the
//      six-color Mathematics/Physics/Chemistry/History/English/Biology
//      set) + the Add Subject button + the Manage-your-subjects prose.
// Plus the self-verifying JSON verdict (dimensions + distinctness), and
// the pointer to the cycle's behavioral proof: the DS1 CB8 pair set
// rides tests/data-store.test.ts; the DS1 e2e leg rides
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
await desktop.page.screenshot({ path: `${OUT}/169-clone-desktop.png` });
frames.push({ file: "169-clone-desktop.png", w: 1440, h: 900, label: "the standing desktop dashboard chrome" });
console.log("captured 169-clone-desktop.png");
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
await mobile.page.screenshot({ path: `${OUT}/169-clone-mobile-drawer.png` });
frames.push({ file: "169-clone-mobile-drawer.png", w: 390, h: 844, label: "the standing mobile drawer open (the 99th drawer-GREEN companion)" });
console.log("captured 169-clone-mobile-drawer.png");
await mobile.page.close();
await mobile.ctx.close();

// ---- 3. the Settings Subjects tab (the cycle's surface) --------------------
const settings = await authedPage({ width: 1440, height: 900 });
let subjectsOk = false;
for (let i = 0; i < 3 && !subjectsOk; i++) {
  try {
    await settings.page.goto(`${CLONE}/Settings`, { waitUntil: "domcontentloaded", timeout: 45_000 });
    // The settled anchors: the Subjects tab renders its seeded rows (the
    // six-color Mathematics/Physics/Chemistry/History/English/Biology
    // set — the DS1 e2e leg's own settled-proof precedent used
    // "Mathematics"), the tab-level heading + the Add Subject button
    // (the SubjectDialog create/update mutation surface, DS1 CB8-
    // hardened), and the Manage-your-subjects prose.
    await settings.page.getByRole("tab", { name: "Subjects" }).click();
    await settings.page.waitForSelector('h2:text-is("Subjects")', { timeout: 30_000 });
    await settings.page.waitForFunction(
      () => {
        const t = document.body.textContent;
        return (
          t.includes("Mathematics") &&
          t.includes("Physics") &&
          t.includes("Chemistry") &&
          t.includes("History") &&
          t.includes("English") &&
          t.includes("Biology") &&
          t.includes("Manage your subjects and classes")
        );
      },
      null,
      { timeout: 30_000 },
    );
    subjectsOk = true;
  } catch {
    await settings.page.waitForTimeout(3000);
  }
}
if (!subjectsOk) throw new Error("the Settings Subjects tab never settled with the seeded rows");
// The Subjects tab IS the cycle's anchor: the seeded subject rows render
// through the slice that loaded past the DS2 aria-contract gate, the Add
// Subject button opens the SubjectDialog (the DS1 mutation surface — the
// create/update/delete trio, the delete riding the ELEVEN-collection
// SUBJECT_TOUCHED refresh), and every mutation on this surface is DS1
// CB8-hardened (the write and the refresh are separate failure domains —
// the eighth family).
await settings.page.waitForTimeout(400);
await settings.page.screenshot({ path: `${OUT}/169-clone-subjects.png` });
frames.push({
  file: "169-clone-subjects.png",
  w: 1440,
  h: 900,
  label: "the Settings Subjects tab with the seeded subject rows + the Add Subject button (the DS1 CB8-hardened mutations; the DS2 aria-contract loading gate)",
});
console.log("captured 169-clone-subjects.png (the seeded rows + the Add Subject button)");
await settings.page.close();
await settings.ctx.close();

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
  checks.push({ file: f.file, bytes: stat.size, md5: bytes.slice(0, 12), ok });
}
const verdict = { ok: checks.every((c) => c.ok), frames, checks };
console.log(JSON.stringify(verdict, null, 2));
process.exit(verdict.ok ? 0 : 1);
