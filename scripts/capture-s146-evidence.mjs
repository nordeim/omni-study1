// Usage: node scripts/capture-s146-evidence.mjs
// (bun INCOMPATIBLE — the playwright request-API script class; node ≥ 23.6.)
//
// The S146/CU evidence frames — three surfaces on the REMEDIATED dev tree
// (localhost:3000, demo session):
//   1. 146-clone-desktop.png — the standing desktop dashboard chrome
//      (1440x900, the regression-net visual).
//   2. 146-clone-mobile-drawer.png — the standing mobile drawer open
//      (390x844 — the no-Tailwind-v4-mobile-nav-bug confirmation visual,
//      the 61st consecutive drawer-check GREEN's companion frame).
//   3. 146-clone-files-view.png — the CU1 surface: the Files view with a
//      clean .pdf upload visible in the list — the machine proof rides
//      the API alongside the frame: the clean upload answers 201 with
//      the extension-derived mime echo, and the row renders in the view;
//      the hostile 150-char DECLARED part Content-Type answers 400 with
//      the guard's copy on THIS runtime (the dev daemon = the Node-parse
//      path — the layer where B-M1's declared-type bloat is reachable;
//      the shipped Bun postures derive from the filename extension and
//      are structurally bounded — the e2e derivation tripwire pins that
//      split).
// SELF-VERIFYING: every frame is re-read from disk — exists, > 10 KiB,
// byte-diverse (the non-blank pixel-variance proxy: the PNG buffer's
// distinct-byte census + dominant-byte share), and the three md5-distinct.
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
  return { page, ctx };
}

// ---- 1. the desktop dashboard ---------------------------------------------
const desktop = await authedPage({ width: 1440, height: 900 });
await desktop.page.waitForTimeout(800);
await desktop.page.screenshot({ path: `${OUT}/146-clone-desktop.png` });
console.log("captured 146-clone-desktop.png");
await desktop.page.close();

// ---- 2. the mobile drawer -------------------------------------------------
const mobile = await authedPage({ width: 390, height: 844 });
await mobile.page.getByRole("button", { name: "Open navigation menu" }).click();
await mobile.page.waitForTimeout(600);
await mobile.page.screenshot({ path: `${OUT}/146-clone-mobile-drawer.png` });
console.log("captured 146-clone-mobile-drawer.png");
await mobile.page.close();

// ---- 3. the files view + the CU1 machine proofs ----------------------------
// The live machine proof collected alongside the frame: (a) a hostile
// 150-char DECLARED part Content-Type answers 400 with the guard's copy on
// this runtime (the dev daemon = the Node-parse path — RED pre-guard: 201,
// the hostile mime stored verbatim, len 150; the probe evidence of the
// defect); (b) the clean .pdf upload answers 201 with the registry-derived
// mime echo and renders in the Files list; cleanup deletes the row.
const mimeGuard = {
  hostileDeclaredTypeStatus: null,
  hostileDeclaredTypeCopy: null,
  cleanUploadStatus: null,
  cleanUploadMime: null,
  rowVisibleInFilesView: null,
};
{
  const { page, ctx } = await authedPage({ width: 1440, height: 900 });
  try {
    // (a) the guard fires on the Node-parse path (the dev daemon).
    const hostile = await ctx.request.post(`${CLONE}/api/files`, {
      multipart: {
        file: {
          name: "146-hostile-declared-type.txt",
          mimeType: "a".repeat(150),
          buffer: Buffer.from("146 hostile declared type probe"),
        },
      },
    });
    mimeGuard.hostileDeclaredTypeStatus = hostile.status();
    const hostileBody = await hostile.json().catch(() => ({}));
    mimeGuard.hostileDeclaredTypeCopy = hostileBody.error ?? null;

    // (b) the clean upload round-trips (the guard never over-fires).
    const clean = await ctx.request.post(`${CLONE}/api/files`, {
      multipart: {
        file: {
          name: "146-clone-clean-probe.pdf",
          mimeType: "application/pdf",
          buffer: Buffer.from("146 clone clean probe"),
        },
      },
    });
    mimeGuard.cleanUploadStatus = clean.status();
    const cleanRow = await clean.json().catch(() => ({}));
    mimeGuard.cleanUploadMime = cleanRow.mime ?? null;

    // The frame: the Files view with the clean row visible.
    await page.goto(`${CLONE}/Files`);
    await page
      .getByRole("heading", { name: "Files" })
      .waitFor({ state: "visible", timeout: 15_000 });
    await page.waitForTimeout(900);
    const row = page.getByText("146-clone-clean-probe.pdf");
    await row.waitFor({ state: "visible", timeout: 15_000 });
    mimeGuard.rowVisibleInFilesView = (await row.count()) > 0;
    await page.screenshot({ path: `${OUT}/146-clone-files-view.png` });
    console.log("captured 146-clone-files-view.png");
  } finally {
    // the cleanup — the probe row leaves no residue
    const list = await ctx.request.get(`${CLONE}/api/files`);
    const files = await list.json().catch(() => []);
    for (const f of files) {
      if (f.name === "146-clone-clean-probe.pdf" || f.name === "146-hostile-declared-type.txt") {
        await ctx.request.delete(`${CLONE}/api/files/${f.id}`);
      }
    }
    await page.close();
  }
}

await browser.close();

// ---- the self-verification (the s143 convention) -------------------------
const frames = [
  "146-clone-desktop.png",
  "146-clone-mobile-drawer.png",
  "146-clone-files-view.png",
];
const verdict = { frames: {}, machineProofs: { mimeGuard }, ok: true };
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

// The machine proof's own verdict: the guard 400s the hostile declared type
// with its copy on the Node-parse path; the clean upload echoes the registry
// mime and renders in the view.
verdict.mimeGuardProof =
  mimeGuard.hostileDeclaredTypeStatus === 400 &&
  typeof mimeGuard.hostileDeclaredTypeCopy === "string" &&
  mimeGuard.hostileDeclaredTypeCopy.includes("File types are limited to 100 characters.") &&
  mimeGuard.cleanUploadStatus === 201 &&
  mimeGuard.cleanUploadMime === "application/pdf" &&
  mimeGuard.rowVisibleInFilesView === true;
if (!verdict.mimeGuardProof) verdict.ok = false;

console.log(JSON.stringify(verdict, null, 2));
process.exit(verdict.ok ? 0 : 1);
