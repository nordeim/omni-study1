// Usage: node scripts/capture-s147-evidence.mjs
// (bun INCOMPATIBLE — the playwright request-API script class; node ≥ 23.6.)
//
// The S147/CV evidence frames — three surfaces on the REMEDIATED dev tree
// (localhost:3000):
//   1. 147-clone-desktop.png — the standing desktop dashboard chrome
//      (1440x900, the regression-net visual).
//   2. 147-clone-mobile-drawer.png — the standing mobile drawer open
//      (390x844 — the no-Tailwind-v4-mobile-nav-bug confirmation visual,
//      the 62nd consecutive drawer-check GREEN's companion frame).
//   3. 147-clone-login-surface.png — the cycle's axis surface: the
//      unauthenticated auth door (the login surface — the FE the
//      FE/views + auth/crypto rotation swept; the CV1 wiring rides the
//      server boot behind this door).
//      The CV1 machine proof rides the UNIT layer (tests/env-check.test.ts —
//      the six S147/CV1 legs: the pure seam is the layer where the miscased
//      NODE_ENV is reachable; the wiring is census-pinned in the same file).
// SELF-VERIFYING: every frame is re-read from disk — exists, > 10 KiB,
// byte-diverse (the non-blank pixel-variance proxy: the PNG buffer's
// distinct-byte census + dominant-byte share), and the three md5-distinct.
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
await desktop.page.screenshot({ path: `${OUT}/147-clone-desktop.png` });
console.log("captured 147-clone-desktop.png");
await desktop.page.close();

// ---- 2. the mobile drawer -------------------------------------------------
const mobile = await authedPage({ width: 390, height: 844 });
await mobile.page.getByRole("button", { name: "Open navigation menu" }).click();
await mobile.page.waitForTimeout(600);
await mobile.page.screenshot({ path: `${OUT}/147-clone-mobile-drawer.png` });
console.log("captured 147-clone-mobile-drawer.png");
await mobile.page.close();

// ---- 3. the login surface (the cycle's axis surface) -----------------------
// A FRESH context (no session) — the unauthenticated auth door as the
// reference-facing surface: the sign-in card with the brand chrome. The
// machine proof for CV1 rides the unit layer (see the header note).
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${CLONE}/login`);
  await page.getByRole("button", { name: "Sign in" }).waitFor({ state: "visible", timeout: 15_000 });
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}/147-clone-login-surface.png` });
  console.log("captured 147-clone-login-surface.png");
  await page.close();
}

await browser.close();

// ---- the self-verification (the s143 convention) -------------------------
const frames = [
  "147-clone-desktop.png",
  "147-clone-mobile-drawer.png",
  "147-clone-login-surface.png",
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
