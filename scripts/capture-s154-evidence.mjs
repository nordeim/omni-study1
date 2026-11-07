// Usage: node scripts/capture-s154-evidence.mjs
// (bun INCOMPATIBLE — the playwright request-API script class; node ≥ 23.6.)
//
// The S154/DC evidence frames + the wire proof — three surfaces on the
// REMEDIATED dev tree (localhost:3000):
//   1. 154-clone-desktop.png — the standing desktop dashboard chrome
//      (1440x900, the regression-net visual).
//   2. 154-clone-mobile-drawer.png — the standing mobile drawer open
//      (390x844 — the no-Tailwind-v4-mobile-nav-bug confirmation visual,
//      the 69th consecutive drawer-check GREEN's companion frame).
//   3. 154-clone-reimport-elision.png — the DC1 surface: the /export
//      page's Restore card with the COMPLETED RE-IMPORT result — the
//      demo user's own export re-imported through the panel (the
//      idempotent re-import: created 0, updated N — the elision's
//      user-visible wire proof, the report counting every row as
//      updated while the pre-tx diff elided every write).
// Plus the JSON evidence record: 154-import-elision-evidence.json —
// the wire round-trip numbers (import #1 created N / import #2
// created 0, updated N — the counted-as-updated contract) + the
// measurement table (the S141 condition answered).
// The DC2 (the questions mirror) proof rides the unit layer (the
// mirror leg); the DC1 diff's proof rides the unit trio + the censuses
// (the CW2 runtime-split precedent).
// SELF-VERIFYING: every frame is re-read from disk — exists, > 10 KiB,
// byte-diverse, dominant-share < 95%, and the md5s distinct.
// JSON verdict with per-frame checks; exit 1 on any failure.
import { chromium } from "playwright";
import { mkdirSync, statSync, readFileSync, writeFileSync } from "node:fs";
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

// ---- 1. the desktop dashboard ---------------------------------------------
const desktop = await authedPage({ width: 1440, height: 900 });
await desktop.page.waitForTimeout(800);
await desktop.page.screenshot({ path: `${OUT}/154-clone-desktop.png` });
console.log("captured 154-clone-desktop.png");
await desktop.page.close();
await desktop.ctx.close();

// ---- 2. the mobile drawer -------------------------------------------------
const mobile = await authedPage({ width: 390, height: 844 });
await mobile.page.getByRole("button", { name: "Open navigation menu" }).click();
await mobile.page.waitForTimeout(600);
await mobile.page.screenshot({ path: `${OUT}/154-clone-mobile-drawer.png` });
console.log("captured 154-clone-mobile-drawer.png");
await mobile.page.close();
await mobile.ctx.close();

// ---- 3. the DC1 surface: the Restore card's completed RE-IMPORT -----------
// The demo user's own export, re-imported through the panel — the
// idempotent re-import IS the elision's dominant heavy case (every
// update-branch row's payload already holds). The wire proof rides the
// request API (the same numbers the panel renders); the frame awaits
// the result summary BEFORE the capture (the machine proof riding the
// same load). The demo data is UNCHANGED by construction (the re-import
// writes nothing — that is the point).
const wire = { firstImport: null, reImport: null };
{
  const { page, ctx } = await authedPage({ width: 1440, height: 900 });

  // Download the demo user's own export through the API (the same
  // envelope the Download JSON anchor serves).
  const exportRes = await page.request.get(`${CLONE}/api/export/data`);
  if (exportRes.status() !== 200) throw new Error(`export GET failed: ${exportRes.status()}`);
  const envelope = await exportRes.text();

  // Import #1 through the API: every row rides the CREATE branch (the
  // throwaway copy lands on distinct ids? NO — same ids, same account:
  // every row already exists → the UPDATE branch → the elision's exact
  // scenario. Import #1 IS the re-import.)
  const imp1 = await page.request.post(`${CLONE}/api/import/data`, {
    data: envelope,
    headers: { "content-type": "application/json" },
  });
  wire.firstImport = { status: imp1.status(), body: await imp1.json() };

  // The frame: the panel's Restore card drives the SAME envelope
  // through the UI — the result summary renders the counted-as-updated
  // wire (created 0, updated N — the elision invisible by design).
  await page.goto(`${CLONE}/export`);
  await page.getByRole("link", { name: "Download JSON" }).waitFor({ state: "visible", timeout: 15_000 });
  const fileInput = page.getByLabel("Choose a backup file");
  await fileInput.setInputFiles({
    name: "studyflow-backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(envelope, "utf8"),
  });
  // The panel's two-step: the picker arms the file, the Import button
  // fires the POST (the s23 panel-journey flow).
  await page.getByRole("button", { name: "Import", exact: true }).click();
  await page.getByText(/Import complete —/).waitFor({ state: "visible", timeout: 30_000 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/154-clone-reimport-elision.png` });
  console.log("captured 154-clone-reimport-elision.png");

  // Import #2 (the wire double-check): the SECOND re-import of the same
  // envelope — still created 0, updated N (the idempotence contract).
  const imp2 = await page.request.post(`${CLONE}/api/import/data`, {
    data: envelope,
    headers: { "content-type": "application/json" },
  });
  wire.reImport = { status: imp2.status(), body: await imp2.json() };
  await page.close();
  await ctx.close();
}

await browser.close();

// ---- the evidence JSON (the wire proof + the measurement record) ----------
{
  const evidence = {
    cycle: "S154/DC1 — the no-op update elision",
    wire: {
      firstImport: {
        status: wire.firstImport.status,
        created: wire.firstImport.body.created,
        updated: wire.firstImport.body.updated,
      },
      reImport: {
        status: wire.reImport.status,
        created: wire.reImport.body.created,
        updated: wire.reImport.body.updated,
      },
      contract:
        "the re-import answers created 0 + updated N (the counted-as-" +
        "updated wire) while the pre-tx diff elided every update write — " +
        "the response shape is UNCHANGED by construction",
    },
    measurement: {
      probe: "the exact tx shape (sequential per-row updates + chunked " +
        "createMany inside $transaction({timeout:60_000, maxWait:5_000})) " +
        "against a throwaway db/measure.db",
      rows: [
        { rows: 1000, updateLoopMs: 430, fullRowProbeMs: 24 },
        { rows: 10000, updateLoopMs: 3543, fullRowProbeMs: 298 },
        { rows: 50000, updateLoopMs: 16005, fullRowProbeMs: 1173 },
        { rows: 100000, updateLoopMs: 31972, fullRowProbeMs: 2088 },
      ],
      verdict:
        "0.32 ms/row, linear — 32 s at the IMPORT_MAX_ROWS cap, 1.9x " +
        "headroom inside the 60 s timeout: the A-M3 stage-2 chunked " +
        "sub-tx stays deferred ON MEASUREMENT (the S141 condition " +
        "answered); the elision collapses the dominant heavy case (the " +
        "idempotent re-import) from N lock-held writes to one bounded " +
        "read pass (2.1 s at the cap, 15x cheaper)",
    },
  };
  writeFileSync(`${OUT}/154-import-elision-evidence.json`, JSON.stringify(evidence, null, 2) + "\n");
  console.log("wrote 154-import-elision-evidence.json");
}

// ---- the self-verification (the s143 convention) -------------------------
const frames = [
  "154-clone-desktop.png",
  "154-clone-mobile-drawer.png",
  "154-clone-reimport-elision.png",
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
// The wire contract: both imports answered 200 with created 0 (the
// re-import shape — the elision's counted-as-updated proof).
if (
  wire.firstImport.status !== 200 ||
  wire.reImport.status !== 200 ||
  wire.firstImport.body.created !== 0 ||
  wire.reImport.body.created !== 0 ||
  !(wire.reImport.body.updated > 0)
) {
  verdict.ok = false;
  verdict.wireContract = false;
}

console.log(JSON.stringify(verdict, null, 2));
process.exit(verdict.ok ? 0 : 1);
