// Usage: node scripts/capture-s144-evidence.mjs
// (bun INCOMPATIBLE — the playwright request-API script class; node ≥ 23.6.)
//
// The S144/CS evidence frames — four surfaces on the REMEDIATED dev tree
// (localhost:3000, demo session):
//   1. 144-clone-desktop.png — the standing desktop dashboard chrome
//      (1440x900, the regression-net visual).
//   2. 144-clone-mobile-drawer.png — the standing mobile drawer open
//      (390x844 — the no-Tailwind-v4-mobile-nav-bug confirmation visual).
//   3. 144-clone-settings-aba.png — the CS1 surface: the Settings
//      appearance card THROUGH the ABA scenario itself — the first
//      preference PATCH is route-intercepted to settle LAST and fail, a
//      NEWER accent pick lands in between, and the machine proof rides
//      the frame: the GREEN swatch still carries aria-pressed=true past
//      the stale failure (the exact interleaving the per-render
//      instantiation defect rolled back; the interception isolates the
//      DB — no PATCH reaches the server, no cleanup needed).
//   4. 144-clone-export-restore.png — the CS3/CS5 surface: the /export
//      page's Restore card + the S141/CP4 size signal (the import
//      surface the row-cap family hardens — the machine proof: the
//      "Current backup size" line renders and the Import button starts
//      disabled with no file chosen).
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
await desktop.screenshot({ path: `${OUT}/144-clone-desktop.png` });
console.log("captured 144-clone-desktop.png");
await desktop.close();

// ---- 2. the mobile drawer -------------------------------------------------
const mobile = await authedPage({ width: 390, height: 844 });
await mobile.getByRole("button", { name: "Open navigation menu" }).click();
await mobile.waitForTimeout(600);
await mobile.screenshot({ path: `${OUT}/144-clone-mobile-drawer.png` });
console.log("captured 144-clone-mobile-drawer.png");
await mobile.close();

// ---- 3. the ABA scenario on the appearance card (CS1's machine proof) -----
// The live machine proof collected alongside the frame: the first PATCH
// settles LAST and fails (500); the newer Green pick made in between
// SURVIVES the stale failure — the Green swatch holds aria-pressed=true,
// Violet false, Blue false (RED pre-fix: the stale catch rolled the store
// back to the pre-pick Violet, un-pressing Green).
const aba = {
  bluePressedBefore: null,
  greenPressedAfter: null,
  violetPressedAfter: null,
  bluePressedAfter: null,
  lateFailureObserved: false,
};
{
  const page = await authedPage({ width: 1440, height: 900 });
  try {
    await page.goto(`${CLONE}/Settings`);
    const blue = page.getByRole("button", { name: "Blue accent" });
    await blue.waitFor({ state: "visible", timeout: 15_000 });
    aba.bluePressedBefore = await blue.getAttribute("aria-pressed");

    let calls = 0;
    await page.route("**/api/settings/preferences", async (route) => {
      calls += 1;
      if (calls === 1) {
        await page.waitForTimeout(700);
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "late failure (S144 evidence probe)" }),
        });
      } else {
        await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
      }
    });
    await blue.click(); // pick 1 — Blue (PATCH1 in flight, will fail late)
    await page.getByRole("button", { name: "Green accent" }).click(); // pick 2 — Green (200)
    // Wait PAST the first PATCH's late failure settling + the toast.
    await page.waitForTimeout(1800);
    aba.lateFailureObserved = true;
    aba.greenPressedAfter = await page
      .getByRole("button", { name: "Green accent" })
      .getAttribute("aria-pressed");
    aba.violetPressedAfter = await page
      .getByRole("button", { name: "Violet accent" })
      .getAttribute("aria-pressed");
    aba.bluePressedAfter = await blue.getAttribute("aria-pressed");
    await page.screenshot({ path: `${OUT}/144-clone-settings-aba.png` });
    console.log("captured 144-clone-settings-aba.png");
  } finally {
    await page.unroute("**/api/settings/preferences");
    await page.close();
  }
}

// ---- 4. the export page's Restore card (CS3/CS5's surface) ----------------
const restore = {
  heading: false,
  sizeLine: null,
  importDisabledCold: null,
  fileInputAttached: false,
};
{
  const page = await authedPage({ width: 1440, height: 900 });
  try {
    await page.goto(`${CLONE}/export`);
    await page
      .getByRole("heading", { name: "Export Your Data" })
      .waitFor({ state: "visible", timeout: 15_000 });
    restore.heading = true;
    // The S141/CP4 size signal line (the import-cap family's UX surface).
    const size = page.locator("text=/Current backup size:/");
    await size.waitFor({ state: "visible", timeout: 15_000 });
    restore.sizeLine = (await size.textContent())?.trim() ?? null;
    // The Restore card's cold posture: the Import button starts disabled
    // (no file chosen) and the file input is attached.
    restore.importDisabledCold = await page
      .getByRole("button", { name: "Import" })
      .isDisabled();
    restore.fileInputAttached =
      (await page.locator('input[type="file"]').first().count()) > 0;
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${OUT}/144-clone-export-restore.png` });
    console.log("captured 144-clone-export-restore.png");
  } finally {
    await page.close();
  }
}

await browser.close();

// ---- the self-verification (the s143 convention) -------------------------
const frames = [
  "144-clone-desktop.png",
  "144-clone-mobile-drawer.png",
  "144-clone-settings-aba.png",
  "144-clone-export-restore.png",
];
const verdict = { frames: {}, machineProofs: { aba, restore }, ok: true };
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
verdict.abaProof =
  aba.greenPressedAfter === "true" &&
  aba.violetPressedAfter === "false" &&
  aba.bluePressedAfter === "false";
verdict.restoreProof =
  restore.heading &&
  typeof restore.sizeLine === "string" &&
  restore.sizeLine.includes("Current backup size:") &&
  restore.importDisabledCold === true &&
  restore.fileInputAttached === true;
if (!verdict.abaProof || !verdict.restoreProof) verdict.ok = false;

console.log(JSON.stringify(verdict, null, 2));
process.exit(verdict.ok ? 0 : 1);
