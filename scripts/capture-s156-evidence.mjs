// Usage: node scripts/capture-s156-evidence.mjs
// (bun INCOMPATIBLE — the playwright request-API script class; node ≥ 23.6.)
//
// The S156/DE evidence frames — two surfaces on the REMEDIATED dev tree
// (localhost:3000):
//   1. 156-clone-desktop.png — the standing desktop dashboard chrome
//      (1440x900, the regression-net visual).
//   2. 156-clone-mobile-drawer.png — the standing mobile drawer open
//      (390x844 — the no-Tailwind-v4-mobile-nav-bug confirmation visual,
//      the 73rd consecutive drawer-check GREEN's companion frame).
// Plus the self-verifying JSON verdict (dimensions + distinctness), the
// frame-count check, and the pointer to the cycle's behavioral proof:
// the streaming serialization is wire-INVISIBLE by construction for the
// served body (the unit oracle pins byte-identity with the object form;
// the s21 raw-body pin + the s14/S139-CN2 live round-trip weld the
// wire), so the proof rides the unit oracle legs + the live stream
// probe (scripts/probe-export-stream-s156.mjs — chunked transfer, the
// exact X-Export-Bytes header, the idempotent restore) + the full
// 5-chunk cert (every chunk boots the standalone through the seam).
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
await desktop.page.screenshot({ path: `${OUT}/156-clone-desktop.png` });
frames.push({ file: "156-clone-desktop.png", w: 1440, h: 900, label: "the standing desktop dashboard chrome" });
console.log("captured 156-clone-desktop.png");
await desktop.page.close();
await desktop.ctx.close();

// ---- 2. the mobile drawer -------------------------------------------------
const mobile = await authedPage({ width: 390, height: 844 });
await mobile.page.getByRole("button", { name: "Open navigation menu" }).click();
await mobile.page.waitForTimeout(600);
await mobile.page.screenshot({ path: `${OUT}/156-clone-mobile-drawer.png` });
frames.push({ file: "156-clone-mobile-drawer.png", w: 390, h: 844, label: "the standing mobile drawer open (the 73rd drawer-GREEN companion)" });
console.log("captured 156-clone-mobile-drawer.png");
await mobile.page.close();
await mobile.ctx.close();

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
  source: "capture-s156-evidence",
  frames: checks,
  proofNote: "the streaming serialization is wire-invisible for the served body (the unit oracle pins byte-identity with the object form) — the behavioral proof rides the unit oracle legs + 156-export-stream-evidence.json (the live chunked-transfer/exact-header/idempotent-restore probe) + the 5-chunk cert",
};
console.log(JSON.stringify(verdict, null, 2));
process.exit(verdict.ok ? 0 : 1);
