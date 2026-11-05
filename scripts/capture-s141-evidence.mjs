// Usage: node scripts/capture-s141-evidence.mjs
// (bun INCOMPATIBLE — the playwright request-API script class; node ≥ 23.6.)
//
// The S141/CP evidence frames — four surfaces on the REMEDIATED dev tree
// (localhost:3000, demo session):
//   1. 141-clone-desktop.png — the standing desktop dashboard chrome
//      (1440x900, the regression-net visual).
//   2. 141-clone-mobile-drawer.png — the standing mobile drawer open
//      (390x844 — the no-Tailwind-v4-mobile-nav-bug confirmation visual).
//   3. 141-clone-notes-rendergate.png — the cycle's H surface: CP1's
//      fragment-snapshot fix. The planted LEGACY hostile note (the S141
//      fixture corpus: the S140 top-level pixel/iframe/handler bait PLUS
//      the WRAPPED payloads — div/section scaffolding around remote imgs,
//      the shape the dead moved-children walk let escape) opens in the
//      Notes editor and must render NEUTRALIZED. The machine proof rides
//      the frame (the e2e render-gate leg's belt shape): both fixture
//      .example origins are route-aborted and COUNTED — attempts must
//      stay ZERO — and the live editor DOM must carry no remote img, no
//      iframe, while the benign paragraph text survives (an allowlist,
//      not scorched earth). The fixture must already be planted in the
//      DEV db:
//        DATABASE_URL="file:../db/custom.db" bun scripts/e2e-plant-legacy-note.ts
//   4. 141-clone-export-size.png — the CP4 size signal: the /export panel
//      (the server-gated owner surface) carrying the "Current backup size:"
//      line beside the restore cap.
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
await desktop.screenshot({ path: `${OUT}/141-clone-desktop.png` });
console.log("captured 141-clone-desktop.png");
await desktop.close();

// ---- 2. the mobile drawer -------------------------------------------------
const mobile = await authedPage({ width: 390, height: 844 });
await mobile.getByRole("button", { name: "Open navigation menu" }).click();
await mobile.waitForTimeout(600);
await mobile.screenshot({ path: `${OUT}/141-clone-mobile-drawer.png` });
console.log("captured 141-clone-mobile-drawer.png");
await mobile.close();

// ---- 3. the legacy hostile note (CP1's render gate) ------------------------
// The live machine proof collected alongside the frame (the e2e belt):
// zero outbound attempts to either fixture origin, no remote img / iframe
// in the mounted editor, the benign text present.
const gate = {
  titleLoaded: false,
  benignText: false,
  remoteImgs: -1,
  iframes: -1,
  wrappedImgs: -1,
  attempts: 0,
};
{
  const page = await authedPage({ width: 1440, height: 900 });
  try {
    // Belt: abort any attempted request to the fixture's reserved origins
    // (RFC 2606 .example — never resolves) and COUNT what was attempted.
    // S141/CP1: BOTH fixture origins — the planted corpus grew WRAPPED
    // payloads (div/section scaffolding around remote imgs).
    await page.route("**/a-l3-legacy.example/**", (route) => {
      gate.attempts += 1;
      return route.abort();
    });
    await page.route("**/a-l3-wrapped.example/**", (route) => {
      gate.attempts += 1;
      return route.abort();
    });

    await page.goto(`${CLONE}/Notes`);
    await page.waitForFunction(
      () => document.querySelector('[aria-label="Notes list pane"]') !== null,
      null,
      { timeout: 30_000 },
    );

    // Open the planted legacy note (its row button carries the title).
    const row = page
      .locator('[aria-label="Notes list pane"]')
      .getByRole("button", { name: /A-L3 legacy hostile note/ });
    await row.first().waitFor({ state: "visible", timeout: 15_000 });
    await row.first().click();

    // The editor mounts and the render gate has pasted the SANITIZED form:
    // the title input carries the note's title and the benign paragraph
    // text survives inside .ql-editor (Quill's load window is dynamic —
    // one waitForFunction covers both).
    await page.waitForFunction(() => {
      const input = document.querySelector('input[aria-label="Note title"]');
      if (!input || input.value !== "A-L3 legacy hostile note (render-gate fixture)") return false;
      const editor = document.querySelector(".ql-editor");
      return editor !== null && (editor.textContent ?? "").includes("Legacy row planted pre-fix");
    }, null, { timeout: 20_000 });
    gate.titleLoaded = true;
    gate.benignText = true;
    await page.waitForTimeout(600);
    // The hostile elements never materialize in the live editor DOM (the
    // WRAPPED payloads included — the src-form census catches them).
    gate.remoteImgs = await page.locator(".ql-editor img[src^='http']").count();
    gate.iframes = await page.locator(".ql-editor iframe").count();
    gate.wrappedImgs = await page.locator(".ql-editor img[src*='a-l3-wrapped.example']").count();
    await page.screenshot({ path: `${OUT}/141-clone-notes-rendergate.png` });
    console.log("captured 141-clone-notes-rendergate.png");
  } finally {
    await page.close();
  }
}

// ---- 4. the /export size signal (CP4) --------------------------------------
{
  const page = await authedPage({ width: 1440, height: 900 });
  try {
    // /export is the server-gated owner surface without the SPA shell (the
    // s23 panel-journey idiom — the wait is the panel's own pinned content,
    // not appHydrated): the frame only captures once CP4's size line has
    // rendered — the exact byte size the download serves, beside the cap.
    await page.goto(`${CLONE}/export`);
    await page.waitForFunction(
      () => document.body.innerText.includes("Current backup size:"),
      null,
      { timeout: 20_000 },
    );
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${OUT}/141-clone-export-size.png` });
    console.log("captured 141-clone-export-size.png");
  } finally {
    await page.close();
  }
}

await browser.close();

// ---- SELF-VERIFY ------------------------------------------------------------
// Per frame: exists · > 10 KiB · byte-diverse (non-blank). Then the four
// md5-distinct + the live render-gate proof. A JSON verdict; exit 1 on any
// failure (missing / blank / duplicate / live-gate regression).
const FRAMES = [
  "141-clone-desktop.png",
  "141-clone-mobile-drawer.png",
  "141-clone-notes-rendergate.png",
  "141-clone-export-size.png",
];

function frameCheck(name) {
  const path = `${OUT}/${name}`;
  let exists = true;
  let bytes = 0;
  let md5 = "";
  let distinctBytes = 0;
  let dominantShare = 1;
  try {
    bytes = statSync(path).size;
  } catch {
    exists = false;
  }
  if (exists && bytes > 0) {
    const buf = readFileSync(path);
    md5 = createHash("md5").update(buf).digest("hex");
    const counts = new Uint32Array(256);
    for (let i = 0; i < buf.length; i += 1) counts[buf[i]] += 1;
    let dominant = 0;
    for (let v = 0; v < 256; v += 1) {
      if (counts[v] > 0) distinctBytes += 1;
      if (counts[v] > dominant) dominant = counts[v];
    }
    dominantShare = dominant / buf.length;
  }
  const sizeOk = exists && bytes > 10 * 1024;
  const nonBlank = exists && distinctBytes >= 32 && dominantShare < 0.95;
  return {
    name,
    exists,
    bytes,
    sizeOk,
    distinctBytes,
    dominantShare: Number(dominantShare.toFixed(4)),
    nonBlank,
    md5,
  };
}

const frames = FRAMES.map(frameCheck);
const md5s = frames.map((f) => f.md5);
const allDistinct = new Set(md5s).size === FRAMES.length;
const renderGatePass =
  gate.titleLoaded &&
  gate.benignText &&
  gate.remoteImgs === 0 &&
  gate.iframes === 0 &&
  gate.wrappedImgs === 0 &&
  gate.attempts === 0;
const pass =
  frames.every((f) => f.exists && f.sizeOk && f.nonBlank) && allDistinct && renderGatePass;

const verdict = {
  session: "S141",
  frames,
  renderGate: gate,
  renderGatePass,
  allDistinct,
  pass,
};

console.log(`\nS141 CAPTURE VERDICT: ${pass ? "PASS" : "FAIL"}`);
console.log(JSON.stringify(verdict, null, 2));

if (!pass) {
  console.error(
    "\nS141 EVIDENCE CAPTURE FAILED — " +
      (frames.some((f) => !f.exists)
        ? "frame(s) missing"
        : frames.some((f) => !f.sizeOk || !f.nonBlank)
          ? "frame(s) undersized/blank"
          : !allDistinct
            ? "duplicate frames (md5 collision)"
            : "render-gate regression (attempts/imgs/iframes > 0 or benign text missing)"),
  );
  process.exit(1);
}
console.log("\nS141 evidence capture complete.");
