// Usage: node scripts/capture-s133-evidence.mjs
// (bun INCOMPATIBLE — the playwright request-API script class; node ≥ 23.6.)
//
// The S133/CH evidence frames — three surfaces on the REMEDIATED dev tree
// (localhost:3000, demo session):
//   1. 133-clone-desktop-dashboard.png — the desktop chrome (sidebar 260px,
//      the KPI row — the remediated tree's regression-net visual).
//   2. 133-clone-mobile-drawer.png — the mobile drawer open (the 42nd
//      consecutive no-Tailwind-v4-mobile-nav-bug confirmation's visual).
//   3. 133-clone-export-counts-refresh.png — the cycle's NEW UI surface:
//      CH7's router.refresh() — the /export panel after an in-panel import:
//      the success summary AND the honest refreshed "What's included" count
//      grid (pre-CH7 the grid kept stale pre-import numbers). The probe row
//      is deleted afterwards (the DB-quiescence discipline).
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

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
  return page;
}

// ---- 1. the desktop dashboard -------------------------------------------
let page = await authedPage({ width: 1440, height: 900 });
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/133-clone-desktop-dashboard.png` });
console.log("captured 133-clone-desktop-dashboard.png");

// ---- 2. the mobile drawer ------------------------------------------------
page = await authedPage({ width: 390, height: 844 });
await page.getByRole("button", { name: "Open navigation menu" }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/133-clone-mobile-drawer.png` });
console.log("captured 133-clone-mobile-drawer.png");

// ---- 3. the CH7 counts-refresh on /export --------------------------------
// A unique-id task envelope through the panel's real file input; the frame
// captures the summary + the grid AFTER router.refresh() flipped the Tasks
// chip (pre-CH7 the chip kept the pre-import count). The probe row is
// deleted on every exit path (the quiescence discipline). The login is
// API-level (the s132 capture precedent — the cookie rides the context jar;
// no live login page races the /export navigation).
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  const login = await ctx.request.post(`${CLONE}/api/auth/login`, {
    data: { email: "demo@studyflow.app", password: "Demo1234!" },
  });
  if (!login.ok()) throw new Error(`demo login failed: ${login.status()}`);
  await p.goto(`${CLONE}/export`, { waitUntil: "domcontentloaded" });
  const grid = p.locator('section[aria-label="What\'s included"]');
  const tasksChip = grid.locator("span.inline-flex", { hasText: /^Tasks/ });
  await tasksChip.waitFor({ state: "visible", timeout: 15_000 });
  const before = parseInt((await tasksChip.innerText()).replace(/[^0-9]/g, ""), 10);
  if (Number.isNaN(before)) throw new Error("could not read the pre-import Tasks count");

  const probeId = `s133-evidence-${Date.now()}`;
  const envelope = {
    format: "studyflow-data-export",
    version: 1,
    exportedAt: new Date().toISOString(),
    user: {},
    counts: {},
    data: {
      subjects: [],
      tasks: [
        {
          id: probeId,
          title: "CH7 evidence probe (deleted after capture)",
          createdAt: "2026-11-03T00:00:00.000Z",
        },
      ],
    },
  };
  const fileInput = p.locator('input[type="file"]');
  await fileInput.setInputFiles({
    name: "studyflow-data-ch7-evidence.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(envelope)),
  });
  await p.getByRole("button", { name: "Import" }).click();
  const summary = p.getByRole("status");
  await summary.waitFor({ state: "visible", timeout: 30_000 });
  // The refreshed chip (router.refresh() re-ran the server counts).
  await p
    .locator("span.inline-flex", { hasText: new RegExp(`^Tasks\\s*${before + 1}\\b`) })
    .first()
    .waitFor({ state: "visible", timeout: 15_000 });
  await p.waitForTimeout(300);
  await p.screenshot({ path: `${OUT}/133-clone-export-counts-refresh.png` });
  console.log(`captured 133-clone-export-counts-refresh.png (Tasks ${before} -> ${before + 1})`);

  // Quiescence: the probe row never outlives the capture.
  const cleanup = await ctx.request.delete(`${CLONE}/api/tasks/${probeId}`);
  if (!cleanup.ok()) throw new Error(`probe cleanup failed: ${cleanup.status()}`);
  await ctx.close();
}

await browser.close();
console.log("\nCAPTURE S133: DONE");
