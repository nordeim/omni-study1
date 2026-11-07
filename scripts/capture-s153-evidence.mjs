// Usage: node scripts/capture-s153-evidence.mjs
// (bun INCOMPATIBLE — the playwright request-API script class; node ≥ 23.6.)
//
// The S153/DB evidence frames — three surfaces on the REMEDIATED dev tree
// (localhost:3000):
//   1. 153-clone-desktop.png — the standing desktop dashboard chrome
//      (1440x900, the regression-net visual).
//   2. 153-clone-mobile-drawer.png — the standing mobile drawer open
//      (390x844 — the no-Tailwind-v4-mobile-nav-bug confirmation visual,
//      the 68th consecutive drawer-check GREEN's companion frame).
//   3. 153-clone-export-budget.png — the DB2 surface: the /export page's
//      rate-limited amber render — the 11th view in a window on the demo
//      user's exportPage: budget (the first 10 render the panel; the 11th
//      skips the counts + the envelope entirely and answers the honest
//      alert; the capture loop awaits the alert text before the frame —
//      the machine proof riding the same load).
//      The DB1 (the capped discharge) proof rides the unit layer + the
//      wire pin (the S153/DB1 legs + the parity-session8 trip pin — the
//      CW2 runtime-split precedent: a limiter's bound is not
//      screenshot-provable).
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
await desktop.page.screenshot({ path: `${OUT}/153-clone-desktop.png` });
console.log("captured 153-clone-desktop.png");
await desktop.page.close();
await desktop.ctx.close();

// ---- 2. the mobile drawer -------------------------------------------------
const mobile = await authedPage({ width: 390, height: 844 });
await mobile.page.getByRole("button", { name: "Open navigation menu" }).click();
await mobile.page.waitForTimeout(600);
await mobile.page.screenshot({ path: `${OUT}/153-clone-mobile-drawer.png` });
console.log("captured 153-clone-mobile-drawer.png");
await mobile.page.close();
await mobile.ctx.close();

// ---- 3. the DB2 surface: the export page's rate-limited render ------------
// The demo user's exportPage: budget (10/15-min) spent by ten prior views,
// the 11th answering the honest amber alert (the render that skips the
// counts + the envelope entirely — the cheap-by-construction proof).
{
  const { page, ctx } = await authedPage({ width: 1440, height: 900 });
  // The first 10 views render the panel (the budget never interferes with
  // legitimate use before its ceiling).
  for (let i = 1; i <= 10; i++) {
    await page.goto(`${CLONE}/export`);
    await page.getByRole("link", { name: "Download JSON" }).waitFor({ state: "visible", timeout: 15_000 });
  }
  // The 11th: the honest rate-limited render — awaited BEFORE the frame
  // (the machine proof riding the same load).
  await page.goto(`${CLONE}/export`);
  await page.getByText("Too many export page views").waitFor({ state: "visible", timeout: 15_000 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/153-clone-export-budget.png` });
  console.log("captured 153-clone-export-budget.png");
  await page.close();
  await ctx.close();
}

await browser.close();

// ---- the self-verification (the s143 convention) -------------------------
const frames = [
  "153-clone-desktop.png",
  "153-clone-mobile-drawer.png",
  "153-clone-export-budget.png",
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
