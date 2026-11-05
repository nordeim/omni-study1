// Usage: node scripts/capture-s142-evidence.mjs
// (bun INCOMPATIBLE — the playwright request-API script class; node ≥ 23.6.)
//
// The S142/CQ evidence frames — four surfaces on the REMEDIATED dev tree
// (localhost:3000, demo session):
//   1. 142-clone-desktop.png — the standing desktop dashboard chrome
//      (1440x900, the regression-net visual).
//   2. 142-clone-mobile-drawer.png — the standing mobile drawer open
//      (390x844 — the no-Tailwind-v4-mobile-nav-bug confirmation visual).
//   3. 142-clone-notes-actions.png — the cycle's CQ3 surface: the
//      note-actions POPOVER (the BZ3-pattern conversion) open on a seeded
//      note, showing the notebook-mover Select as a real tab stop beside
//      the Delete action — the keyboard-reachability fix visual. The
//      machine proof rides the frame: the mover's combobox is the FIRST
//      focusable control inside the open popover (focus lands on it the
//      moment the popover opens — the probed contract the e2e leg pins).
//   4. 142-clone-export-size.png — the CQ2 byte-based size signal: the
//      /export panel's "Current backup size:" line (now the UTF-8 byte
//      count — the same number the X-Export-Bytes header serves).
// SELF-VERIFYING: every frame is re-read from disk — exists, > 10 KiB,
// byte-diverse (the non-blank pixel-variance proxy: the PNG buffer's
// distinct-byte census + dominant-byte share), and the four md5-distinct.
// JSON verdict with per-frame checks; exit 1 on any failure.
import { chromium } from "playwright";
import { mkdirSync, readFileSync, statSync } from "node:fs";
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
await desktop.screenshot({ path: `${OUT}/142-clone-desktop.png` });
console.log("captured 142-clone-desktop.png");
await desktop.close();

// ---- 2. the mobile drawer -------------------------------------------------
const mobile = await authedPage({ width: 390, height: 844 });
await mobile.getByRole("button", { name: "Open navigation menu" }).click();
await mobile.waitForTimeout(600);
await mobile.screenshot({ path: `${OUT}/142-clone-mobile-drawer.png` });
console.log("captured 142-clone-mobile-drawer.png");
await mobile.close();

// ---- 3. the note-actions popover (CQ3's keyboard reachability) -------------
// The live machine proof collected alongside the frame: the mover's
// combobox (role=combobox) holds focus the moment the popover opens —
// the FIRST tab stop, keyboard-reachable by construction (pre-fix the
// Select lived inside role="menu" where no keyboard sequence could land).
const actions = {
  popoverOpened: false,
  moverFocused: false,
  moverLabel: null,
  deleteVisible: false,
};
{
  const page = await authedPage({ width: 1440, height: 900 });
  try {
    await page.goto(`${CLONE}/Notes`);
    await page.waitForFunction(
      () => document.querySelector('[aria-label="Notes list pane"]') !== null,
      null,
      { timeout: 30_000 },
    );
    // Open a seeded note ("Essay sources" lives in Reading Journal — the
    // mover shows that value; no db mutation happens in this frame).
    const row = page
      .locator('[aria-label="Notes list pane"]')
      .getByRole("button", { name: /Essay sources/ });
    await row.first().waitFor({ state: "visible", timeout: 15_000 });
    await row.first().click();
    await page.waitForFunction(
      () => document.querySelector(".ql-editor") !== null,
      null,
      { timeout: 20_000 },
    );
    // Open the actions surface (the S142/CQ3 Popover).
    await page.getByRole("button", { name: "Note actions" }).click();
    await page.waitForFunction(
      () => document.querySelector('[data-slot="popover-content"]') !== null,
      null,
      { timeout: 10_000 },
    );
    actions.popoverOpened = true;
    await page.waitForTimeout(500);
    // THE contract: focus sits on the mover's combobox (auto-focus on the
    // first tab stop — probed live, pinned by the e2e leg).
    const focus = await page.evaluate(() => ({
      role: document.activeElement?.getAttribute("role") ?? null,
      text: document.activeElement?.textContent?.trim().slice(0, 30) ?? null,
    }));
    actions.moverFocused = focus.role === "combobox";
    actions.moverLabel = focus.text;
    actions.deleteVisible = await page
      .getByRole("button", { name: "Delete note" })
      .isVisible()
      .catch(() => false);
    await page.screenshot({ path: `${OUT}/142-clone-notes-actions.png` });
    console.log("captured 142-clone-notes-actions.png");
  } finally {
    await page.close();
  }
}

// ---- 4. the /export byte-based size signal (CQ2) ---------------------------
{
  const page = await authedPage({ width: 1440, height: 900 });
  try {
    // /export is the server-gated owner surface without the SPA shell (the
    // s23 panel-journey idiom — the wait is the panel's own pinned
    // content, not appHydrated): the frame only captures once the size
    // line has rendered — the exact UTF-8 byte count the download serves,
    // beside the cap.
    await page.goto(`${CLONE}/export`);
    await page.waitForFunction(
      () => document.body.innerText.includes("Current backup size:"),
      null,
      { timeout: 20_000 },
    );
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${OUT}/142-clone-export-size.png` });
    console.log("captured 142-clone-export-size.png");
  } finally {
    await page.close();
  }
}

await browser.close();

// ---- SELF-VERIFY ------------------------------------------------------------
// Per frame: exists · > 10 KiB · byte-diverse (non-blank). Then the four
// md5-distinct + the live CQ3 proof. A JSON verdict; exit 1 on any
// failure (missing / blank / duplicate / live-contract regression).
const FRAMES = [
  "142-clone-desktop.png",
  "142-clone-mobile-drawer.png",
  "142-clone-notes-actions.png",
  "142-clone-export-size.png",
];

function frameCheck(name) {
  const path = `${OUT}/${name}`;
  let exists = true;
  let bytes = 0;
  let md5 = "";
  let distinctBytes = 0;
  let dominantShare = 1;
  try {
    const buf = readFileSync(path);
    bytes = statSync(path).size;
    md5 = createHash("md5").update(buf).digest("hex");
    const counts = new Map();
    for (const b of buf) counts.set(b, (counts.get(b) ?? 0) + 1);
    distinctBytes = counts.size;
    dominantShare = Math.max(...counts.values()) / buf.length;
  } catch {
    exists = false;
  }
  return {
    frame: name,
    exists,
    bytes,
    md5,
    distinctBytes,
    dominantShare,
    sizeOk: bytes > 10 * 1024,
    diverseOk: distinctBytes > 64 && dominantShare < 0.995,
  };
}

const frames = FRAMES.map(frameCheck);
const md5s = frames.map((f) => f.md5);
const allDistinct = new Set(md5s).size === md5s.length;
const framesOk = frames.every((f) => f.exists && f.sizeOk && f.diverseOk);
const proofOk = actions.popoverOpened && actions.moverFocused && actions.deleteVisible;

const verdict = {
  ranAt: new Date().toISOString(),
  source: "capture-s142-evidence.mjs",
  frames,
  allDistinct,
  actionsProof: actions,
  verdict: framesOk && allDistinct && proofOk ? "GREEN" : "RED",
};
console.log(JSON.stringify(verdict, null, 2));
process.exit(verdict.verdict === "GREEN" ? 0 : 1);
