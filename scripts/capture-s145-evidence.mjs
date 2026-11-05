// Usage: node scripts/capture-s145-evidence.mjs
// (bun INCOMPATIBLE — the playwright request-API script class; node ≥ 23.6.)
//
// The S145/CT evidence frames — four surfaces on the REMEDIATED dev tree
// (localhost:3000, demo session):
//   1. 145-clone-desktop.png — the standing desktop dashboard chrome
//      (1440x900, the regression-net visual).
//   2. 145-clone-mobile-drawer.png — the standing mobile drawer open
//      (390x844 — the no-Tailwind-v4-mobile-nav-bug confirmation visual,
//      the 60th consecutive drawer-check GREEN's companion frame).
//   3. 145-clone-focustimer-window.png — the CT1 surface: the focus timer
//      THROUGH the completion-window scenario itself — the fake clock
//      drives the pomodoro to 00:00, the POST is route-intercepted to
//      settle late and fail, and the machine proof rides the frame: the
//      Start button was DISABLED through the in-flight window, exactly
//      ONE POST fired, and after the stale failure the clock re-latches
//      to a fresh 25:00 (never the phantom entry at 00:00; the
//      interception isolates the DB — no POST reaches the server, no
//      cleanup needed).
//   4. 145-clone-export-gradient.png — the CT3 surface: the /export page
//      whose two primary CTAs (Download JSON + Import) now ride the
//      house gradient surface — the machine proof: both elements
//      compute linear-gradient backgrounds (the codebase's only two
//      solid-accent CTAs are gone), the Import button starts cold-
//      disabled with no file chosen, and the S141/CP4 size line renders.
// SELF-VERIFYING: every frame is re-read from disk — exists, > 10 KiB,
// byte-diverse (the non-blank pixel-variance proxy: the PNG buffer's
// distinct-byte census + dominant-byte share), and the four md5-distinct.
// JSON verdict with per-frame checks; exit 1 on any failure.
import { chromium } from "playwright";
import { mkdirSync, statSync } from "node:fs";
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
  return page;
}

// ---- 1. the desktop dashboard ---------------------------------------------
const desktop = await authedPage({ width: 1440, height: 900 });
await desktop.waitForTimeout(800);
await desktop.screenshot({ path: `${OUT}/145-clone-desktop.png` });
console.log("captured 145-clone-desktop.png");
await desktop.close();

// ---- 2. the mobile drawer -------------------------------------------------
const mobile = await authedPage({ width: 390, height: 844 });
await mobile.getByRole("button", { name: "Open navigation menu" }).click();
await mobile.waitForTimeout(600);
await mobile.screenshot({ path: `${OUT}/145-clone-mobile-drawer.png` });
console.log("captured 145-clone-mobile-drawer.png");
await mobile.close();

// ---- 3. the focus-timer completion window (CT1's machine proof) -------------
// The live machine proof collected alongside the frame: the fake clock
// drives the pomodoro to 00:00; the completion POST is intercepted to
// settle late (700 ms) and fail (500). The Start button must be DISABLED
// through the in-flight window (the CT1b affordance), exactly ONE POST
// fires, and past the stale failure the clock RE-LATCHES to a fresh 25:00
// (the CT1c failure path — RED pre-fix: stuck at 00:00 forever, and a
// Play press re-fires the phantom full-duration session).
const window1 = {
  startDisabledDuringWindow: null,
  postsThroughWindow: null,
  clockAfterFailure: null,
  toastAfterFailure: null,
  retryRunsFreshSession: null,
};
{
  const page = await authedPage({ width: 1440, height: 900 });
  try {
    await page.clock.install({ time: new Date("2026-11-05T10:00:00Z") });
    await page.goto(`${CLONE}/FocusTimer`);
    await page.getByRole("heading", { name: "Focus Timer" }).waitFor({ state: "visible", timeout: 15_000 });

    let posts = 0;
    await page.route("**/api/focus-sessions", async (route) => {
      if (route.request().method() !== "POST") {
        await route.continue();
        return;
      }
      posts += 1;
      if (posts === 1) {
        await page.waitForTimeout(700);
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "late failure (S145 evidence probe)" }),
        });
      } else {
        await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ ok: true }) });
      }
    });

    const start = page.getByRole("button", { name: "Start timer" });
    await start.click();
    await page.clock.runFor(25 * 60 * 1000);
    await page.waitForTimeout(500);
    // The in-flight window: the Start button is disabled (the affordance).
    window1.startDisabledDuringWindow = await start.isDisabled();
    window1.postsThroughWindow = posts;
    // Past the late failure's settle: the toast + the re-latch.
    await page.waitForTimeout(1200);
    window1.clockAfterFailure = (await page.getByRole("timer").textContent()) ?? null;
    window1.toastAfterFailure =
      (await page.getByText("late failure (S145 evidence probe)").count()) > 0;
    await page.screenshot({ path: `${OUT}/145-clone-focustimer-window.png` });
    console.log("captured 145-clone-focustimer-window.png");
    // The retry press: a FRESH session (running), never a new POST.
    await start.click();
    await page.waitForTimeout(400);
    window1.retryRunsFreshSession =
      (await page.getByRole("button", { name: "Pause timer" }).count()) > 0 && posts === 1;
  } finally {
    await page.unroute("**/api/focus-sessions");
    await page.close();
  }
}

// ---- 4. the export page's gradient CTAs (CT3's surface) ---------------------
const gradient = {
  heading: false,
  downloadBg: null,
  importBg: null,
  importDisabledCold: null,
  sizeLine: null,
};
{
  const page = await authedPage({ width: 1440, height: 900 });
  try {
    await page.goto(`${CLONE}/export`);
    await page
      .getByRole("heading", { name: "Export Your Data" })
      .waitFor({ state: "visible", timeout: 15_000 });
    gradient.heading = true;
    // The S141/CP4 size signal line (the standing surface check).
    const size = page.locator("text=/Current backup size:/");
    await size.waitFor({ state: "visible", timeout: 15_000 });
    gradient.sizeLine = (await size.textContent())?.trim() ?? null;
    // The two CTAs ride the gradient surface (the machine proof — a solid
    // CTA computes background-image "none").
    gradient.downloadBg = await page
      .getByRole("link", { name: "Download JSON" })
      .evaluate((el) => getComputedStyle(el).backgroundImage);
    gradient.importBg = await page
      .getByRole("button", { name: "Import" })
      .evaluate((el) => getComputedStyle(el).backgroundImage);
    gradient.importDisabledCold = await page
      .getByRole("button", { name: "Import" })
      .isDisabled();
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${OUT}/145-clone-export-gradient.png` });
    console.log("captured 145-clone-export-gradient.png");
  } finally {
    await page.close();
  }
}

await browser.close();

// ---- the self-verification (the s143 convention) -------------------------
const frames = [
  "145-clone-desktop.png",
  "145-clone-mobile-drawer.png",
  "145-clone-focustimer-window.png",
  "145-clone-export-gradient.png",
];
const verdict = { frames: {}, machineProofs: { completionWindow: window1, gradient }, ok: true };
const md5s = new Set();
for (const name of frames) {
  const path = `${OUT}/${name}`;
  const info = statSync(path);
  const buf = await import("node:fs").then((fs) => fs.readFileSync(path));
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

// The machine proofs' own verdicts.
verdict.completionWindowProof =
  window1.startDisabledDuringWindow === true &&
  window1.postsThroughWindow === 1 &&
  window1.clockAfterFailure === "25:00" &&
  window1.toastAfterFailure === true &&
  window1.retryRunsFreshSession === true;
verdict.gradientProof =
  gradient.heading &&
  typeof gradient.downloadBg === "string" &&
  gradient.downloadBg.includes("linear-gradient") &&
  typeof gradient.importBg === "string" &&
  gradient.importBg.includes("linear-gradient") &&
  gradient.importDisabledCold === true &&
  typeof gradient.sizeLine === "string" &&
  gradient.sizeLine.includes("Current backup size:");
if (!verdict.completionWindowProof || !verdict.gradientProof) verdict.ok = false;

console.log(JSON.stringify(verdict, null, 2));
process.exit(verdict.ok ? 0 : 1);
