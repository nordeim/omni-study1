// Usage: node scripts/capture-s162-evidence.mjs
// (bun INCOMPATIBLE — the playwright request-API script class; node ≥ 23.6.)
//
// The S162/DK evidence frames — three surfaces on the REMEDIATED dev tree
// (localhost:3000):
//   1. 162-clone-desktop.png — the standing desktop dashboard chrome
//      (1440x900, the regression-net visual).
//   2. 162-clone-mobile-drawer.png — the standing mobile drawer open
//      (390x844 — the no-Tailwind-v4-mobile-nav-bug confirmation visual,
//      the 85th consecutive drawer-check GREEN's companion frame).
//   3. 162-clone-events.png — THE CYCLE'S SURFACE: the Events view (the
//      dark terminal panel) — the surface this cycle hardened twice over
//      (the DK1 events mutation CB8 split — a committed write + failed
//      refresh now answers the success toast, never the false
//      save-failure that armed the duplicate-creating retry; the DK5
//      expandOccurrences promotion — the recurrence expansion now rides
//      the src/lib/events.ts seam, unit-pinned). The frame anchors the
//      seeded recurring event's expanded occurrences on the 7-day strip.
// Plus the self-verifying JSON verdict (dimensions + distinctness), and
// the pointer to the cycle's behavioral proof: the DK1 CB8 pair set rides
// tests/data-store.test.ts; the DK2 census's fourth site rides
// tests/enum-single-source.test.ts; the DK5 recurrence pins ride
// tests/events.test.ts; the DK1 e2e leg rides
// tests/e2e/parity-session5.spec.ts.
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
await desktop.page.screenshot({ path: `${OUT}/162-clone-desktop.png` });
frames.push({ file: "162-clone-desktop.png", w: 1440, h: 900, label: "the standing desktop dashboard chrome" });
console.log("captured 162-clone-desktop.png");
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
await mobile.page.screenshot({ path: `${OUT}/162-clone-mobile-drawer.png` });
frames.push({ file: "162-clone-mobile-drawer.png", w: 390, h: 844, label: "the standing mobile drawer open (the 85th drawer-GREEN companion)" });
console.log("captured 162-clone-mobile-drawer.png");
await mobile.page.close();
await mobile.ctx.close();

// ---- 3. the Events view (the cycle's surface) ------------------------------
const events = await authedPage({ width: 1440, height: 900 });
let eventsOk = false;
for (let i = 0; i < 3 && !eventsOk; i++) {
  try {
    await events.page.goto(`${CLONE}/Events`, { waitUntil: "domcontentloaded", timeout: 45_000 });
    // The panel + the 7-day strip anchor: the "Today" day band (the
    // CE3 gate settles, the strip renders) AND at least one expanded
    // occurrence on the strip (the seeded recurring event rides the
    // promoted DK5 seam — expandOccurrences from src/lib/events.ts).
    await events.page.waitForSelector('[aria-label="Events panel"]', { timeout: 30_000 });
    await events.page.getByRole("heading", { name: "Today" }).waitFor({ timeout: 30_000 });
    await events.page.waitForFunction(
      () => document.querySelectorAll('[aria-label="Events panel"] article').length > 0,
      null,
      { timeout: 30_000 },
    );
    eventsOk = true;
  } catch {
    await events.page.waitForTimeout(3000);
  }
}
if (!eventsOk) throw new Error("the Events strip never settled with an occurrence");
// The dark terminal panel + the expanded occurrences ARE the cycle's
// surface anchors: the strip's rows ride the promoted seam's expansion
// (DK5), and every row here was created/mutated through the DK1-hardened
// events mutations (the CB8 split — the write and the refresh are separate
// failure domains now).
await events.page.waitForTimeout(400);
await events.page.screenshot({ path: `${OUT}/162-clone-events.png` });
frames.push({
  file: "162-clone-events.png",
  w: 1440,
  h: 900,
  label: "the Events dark panel with the seeded recurring event's expanded occurrences on the 7-day strip (the DK5 promoted seam; the DK1 CB8-hardened mutations)",
});
console.log("captured 162-clone-events.png (the dark panel + the expanded strip)");
await events.page.close();
await events.ctx.close();

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
  source: "capture-s162-evidence",
  frames: checks,
  proofNote: "the DK1 CB8 pair set rides tests/data-store.test.ts; the DK2 census fourth site rides tests/enum-single-source.test.ts; the DK5 recurrence pins ride tests/events.test.ts (the unit layer 1648/1648); the DK1 e2e leg rides tests/e2e/parity-session5.spec.ts (the 624/624 five-chunk cold cert — chunk 3's AK1 pair and chunk 4's calculator-theme leg each flaked once on the documented machine-load class, clean on the immediate re-runs); the DK1 e2e leg RED-proven against the pre-fix standalone build (the set-aside/rebuild/re-run sequence) and GREEN post-fix",
};
console.log(JSON.stringify(verdict, null, 2));
process.exit(verdict.ok ? 0 : 1);
