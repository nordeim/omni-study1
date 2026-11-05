// Usage: node scripts/capture-s143-evidence.mjs
// (bun INCOMPATIBLE — the playwright request-API script class; node ≥ 23.6.)
//
// The S143/CR evidence frames — four surfaces on the REMEDIATED dev tree
// (localhost:3000, demo session):
//   1. 143-clone-desktop.png — the standing desktop dashboard chrome
//      (1440x900, the regression-net visual).
//   2. 143-clone-mobile-drawer.png — the standing mobile drawer open
//      (390x844 — the no-Tailwind-v4-mobile-nav-bug confirmation visual).
//   3. 143-clone-notes-actions.png — the CR3 surface: the note-actions
//      popover open on a seeded note with the notebook-mover combobox
//      holding focus AND carrying its new accessible name ("Move note to
//      notebook" — the WCAG 4.1.2 label the CQ3 surface was missing).
//   4. 143-clone-notes-nontext.png — the CR2 surface: the PLANTED legacy
//      note (scripts/e2e-plant-nontext-note.ts) open in the editor — the
//      non-text family (script/style/textarea/option/xmp) dies WHOLE at
//      the render door while the container family (noscript/template)
//      still unwraps to visible text. The machine proof rides the frame:
//      the editor DOM contains the container-family text and NONE of the
//      non-text-family text.
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
await desktop.screenshot({ path: `${OUT}/143-clone-desktop.png` });
console.log("captured 143-clone-desktop.png");
await desktop.close();

// ---- 2. the mobile drawer -------------------------------------------------
const mobile = await authedPage({ width: 390, height: 844 });
await mobile.getByRole("button", { name: "Open navigation menu" }).click();
await mobile.waitForTimeout(600);
await mobile.screenshot({ path: `${OUT}/143-clone-mobile-drawer.png` });
console.log("captured 143-clone-mobile-drawer.png");
await mobile.close();

// ---- 3. the note-actions popover (CR3's accessible name) -------------------
// The live machine proof collected alongside the frame: the mover's
// combobox holds focus the moment the popover opens (the CQ3 contract)
// AND carries the S143/CR3 accessible name (aria-label) — the label the
// named-combobox e2e locator now pins.
const actions = {
  popoverOpened: false,
  moverFocused: false,
  moverLabel: null,
  moverNamed: false,
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
    // first tab stop) and the combobox CARRIES ITS NAME (the CR3 fix).
    const focus = await page.evaluate(() => {
      const el = document.activeElement;
      // Radix SelectTrigger renders the trigger button with role=combobox;
      // the aria-label sits on it (or the closest combobox ancestor).
      const combo = el?.closest('[role="combobox"]') ?? el;
      return {
        role: el?.getAttribute("role") ?? null,
        label: combo?.getAttribute("aria-label") ?? null,
        text: el?.textContent?.trim().slice(0, 30) ?? null,
      };
    });
    actions.moverFocused = focus.role === "combobox";
    actions.moverLabel = focus.label ?? focus.text;
    actions.moverNamed = focus.label === "Move note to notebook";
    actions.deleteVisible = await page
      .getByRole("button", { name: "Delete note" })
      .isVisible()
      .catch(() => false);
    await page.screenshot({ path: `${OUT}/143-clone-notes-actions.png` });
    console.log("captured 143-clone-notes-actions.png");
  } finally {
    await page.close();
  }
}

// ---- 4. the CR2 non-text door policy (the planted legacy note) -------------
// The planted row (scripts/e2e-plant-nontext-note.ts) carries the
// non-text corpus (script/style/textarea/option/xmp — text must DIE at
// the render door) beside the container family (noscript/template —
// text SURVIVES at both doors, the unchanged semantics). The machine
// proof: the editor DOM contains the container text and NONE of the
// non-text text. (The probe row is cleaned from the dev db after the
// capture — the demo-surface-restoration convention.)
const nontext = {
  noteOpened: false,
  editorText: null,
  scriptTextGone: false,
  styleTextGone: false,
  textareaTextGone: false,
  optionTextGone: false,
  xmpTextGone: false,
  containerTextPresent: false,
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
    const row = page
      .locator('[aria-label="Notes list pane"]')
      .getByRole("button", { name: /CR2 non-text legacy note/ });
    await row.first().waitFor({ state: "visible", timeout: 15_000 });
    await row.first().click();
    await page.waitForFunction(
      () => document.querySelector(".ql-editor") !== null,
      null,
      { timeout: 20_000 },
    );
    await page.waitForTimeout(600);
    const editorText = await page.evaluate(
      () => document.querySelector(".ql-editor")?.innerText ?? "",
    );
    nontext.noteOpened = true;
    nontext.editorText = editorText.slice(0, 220);
    nontext.scriptTextGone = !editorText.includes("die-whole");
    nontext.styleTextGone = !editorText.includes(".steal");
    nontext.textareaTextGone = !editorText.includes("ta-secret");
    nontext.optionTextGone = !editorText.includes("opt-secret");
    nontext.xmpTextGone = !editorText.includes("xmp-secret");
    nontext.containerTextPresent =
      editorText.includes("noscript-kept") && editorText.includes("template-kept");
    await page.screenshot({ path: `${OUT}/143-clone-notes-nontext.png` });
    console.log("captured 143-clone-notes-nontext.png");
  } finally {
    await page.close();
  }
}

await browser.close();

// ---- SELF-VERIFY ------------------------------------------------------------
// Per frame: exists · > 10 KiB · byte-diverse (non-blank). Then the four
// md5-distinct + the live CR3/CR2 proofs. A JSON verdict; exit 1 on any
// failure (missing / blank / duplicate / live-contract regression).
const FRAMES = [
  "143-clone-desktop.png",
  "143-clone-mobile-drawer.png",
  "143-clone-notes-actions.png",
  "143-clone-notes-nontext.png",
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
const actionsProofOk =
  actions.popoverOpened && actions.moverFocused && actions.moverNamed && actions.deleteVisible;
const nontextProofOk =
  nontext.noteOpened &&
  nontext.scriptTextGone &&
  nontext.styleTextGone &&
  nontext.textareaTextGone &&
  nontext.optionTextGone &&
  nontext.xmpTextGone &&
  nontext.containerTextPresent;

const verdict = {
  ranAt: new Date().toISOString(),
  source: "capture-s143-evidence.mjs",
  frames,
  allDistinct,
  actionsProof: actions,
  nontextProof: nontext,
  verdict: framesOk && allDistinct && actionsProofOk && nontextProofOk ? "GREEN" : "RED",
};
console.log(JSON.stringify(verdict, null, 2));
process.exit(verdict.verdict === "GREEN" ? 0 : 1);
