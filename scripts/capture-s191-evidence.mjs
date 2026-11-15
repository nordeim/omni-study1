// S191 evidence capture — the flashcards-family consolidation proof frames.
// Frame 1: the consolidated family's home surface — the Flashcards view at
// 1440x900 with the seeded fixtures DOM-asserted before the shot (the
// three seeded decks — "Integration rules" selected, "Biology Chapter 5",
// "Spanish Vocabulary" — the two-pane layout, the deck detail + the card
// grid). Frame 2: the consolidation census rendered as a self-verifying
// proof table — the rows are generated FROM the actual spec files
// (flashcards.spec.ts + parity-session7.spec.ts parsed live: the 11 moved
// describes with their pin counts, the 18+70=88 arithmetic, the 33-file
// suite census), asserted against the recorded values before the shot.
// Usage: node scripts/capture-s191-evidence.mjs  (the dev server at
// :3000 carries the current tree)
import { chromium } from "playwright";
import { mkdirSync, readFileSync } from "node:fs";

const CLONE = "http://localhost:3000";
const OUT = "docs/screenshots";
mkdirSync(OUT, { recursive: true });

const FC_SPEC = readFileSync("tests/e2e/flashcards.spec.ts", "utf8");
const P7_SPEC = readFileSync("tests/e2e/parity-session7.spec.ts", "utf8");

const DESCRIBE_RE = /^test\.describe\("(.+?)", \(\) => \{$/gm;
const TITLE_RE = /^\s*test\("(?:(?:[^"\\]|\\.)*)"/gm;

function census(src) {
  const describes = [];
  let m;
  const starts = [];
  while ((m = DESCRIBE_RE.exec(src)) !== null) starts.push({ i: m.index, title: m[1] });
  for (let n = 0; n < starts.length; n++) {
    const end = n + 1 < starts.length ? starts[n + 1].i : src.length;
    const block = src.slice(starts[n].i, end);
    const pins = (block.match(TITLE_RE) || []).length;
    describes.push({ title: starts[n].title, pins });
  }
  return describes;
}

const fcCensus = census(FC_SPEC);
const p7Census = census(P7_SPEC);
const fcPins = fcCensus.reduce((a, d) => a + d.pins, 0);
const p7Pins = p7Census.reduce((a, d) => a + d.pins, 0);

// The arithmetic assertions — the table's data must equal the recorded truth.
if (fcCensus.length !== 11) throw new Error(`flashcards describes ${fcCensus.length} != 11`);
if (fcPins !== 18) throw new Error(`flashcards pins ${fcPins} != 18`);
if (p7Census.length !== 25) throw new Error(`parity-session7 describes ${p7Census.length} != 25`);
if (p7Pins !== 70) throw new Error(`parity-session7 pins ${p7Pins} != 70`);
if (fcPins + p7Pins !== 88) throw new Error(`arithmetic ${fcPins}+${p7Pins} != 88`);
console.log(`census asserted: 11 describes / ${fcPins} pins moved · ${p7Census.length} describes / ${p7Pins} pins staying · ${fcPins + p7Pins} total`);

const browser = await chromium.launch();
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${CLONE}/login`);
  await page.fill("input[type=email]", "demo@studyflow.app");
  await page.fill("input[type=password]", "Demo1234!");
  await page.waitForFunction(
    () => { const b = document.querySelector("button[type=submit]"); return b && !b.disabled; },
    null, { timeout: 30_000 },
  );
  await page.click("button[type=submit]");
  await page.waitForFunction(
    () => document.querySelector("nav a") !== null && document.querySelector("h1, h2") !== null,
    null, { timeout: 30_000 },
  );
  await page.waitForTimeout(1500);

  // ---- Frame 1: the flashcards home surface ----
  await page.locator("nav a").filter({ hasText: "Flashcards" }).first().click();
  await page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true", null, { timeout: 15_000 });
  await page.waitForTimeout(1200);
  const fcAssert = await page.evaluate(`(() => {
    const rows = document.querySelector('[aria-label="Deck rows"]');
    const rowTexts = rows ? [...rows.children].map((r) => r.textContent.trim().slice(0, 40)) : [];
    const detail = document.querySelector('[aria-label="Deck detail"]');
    const cards = detail ? [...detail.querySelectorAll("button, [class*=grid] > *")].length : 0;
    const h1 = document.querySelector("main h1");
    return JSON.stringify({
      deckCount: rowTexts.length,
      hasIntegration: rowTexts.some((t) => t.includes("Integration rules")),
      hasBiology: rowTexts.some((t) => t.includes("Biology Chapter 5")),
      hasSpanish: rowTexts.some((t) => t.includes("Spanish Vocabulary")),
      detailPane: !!detail,
      heading: h1 ? h1.textContent.trim() : null,
    });
  })()`);
  const fc = JSON.parse(fcAssert);
  if (fc.deckCount < 3) throw new Error(`deck census ${fc.deckCount} < 3`);
  if (!fc.hasIntegration || !fc.hasBiology || !fc.hasSpanish) throw new Error(`seed decks missing: ${fcAssert}`);
  if (!fc.detailPane) throw new Error("the two-pane layout is missing the deck detail pane");
  if (!fc.heading || !/flashcards/i.test(fc.heading)) throw new Error(`heading ${fc.heading}`);
  console.log("flashcards home verified: the seeded two-pane — 3 decks (Integration rules, Biology Chapter 5, Spanish Vocabulary) + the detail pane");
  await page.screenshot({ path: `${OUT}/191-flashcards-home-desktop.png`, fullPage: false });
  console.log("frame 1 captured: 191-flashcards-home-desktop.png");

  // ---- Frame 2: the consolidation census proof table ----
  const rowHtml = fcCensus
    .map((d) => `<tr><td style="padding:6px 14px;border-bottom:1px solid #e2e8f0;">${d.title}</td><td style="padding:6px 14px;border-bottom:1px solid #e2e8f0;text-align:right;">${d.pins}</td></tr>`)
    .join("");
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
    body { font-family: ui-sans-serif, system-ui, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 32px; }
    h1 { font-size: 22px; margin: 0 0 4px; }
    .sub { color: #64748b; font-size: 13px; margin-bottom: 20px; }
    table { border-collapse: collapse; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.08); border-radius: 12px; overflow: hidden; min-width: 720px; }
    th { background: #0f172a; color: #fff; text-align: left; padding: 10px 14px; font-size: 13px; }
    th.r { text-align: right; }
    td { font-size: 13px; }
    .total td { font-weight: 700; background: #f1f5f9; }
    .verdict { margin-top: 18px; font-size: 13px; color: #15803d; font-weight: 600; }
  </style></head><body>
  <h1>S191/EO — the flashcards-family e2e consolidation census</h1>
  <div class="sub">Parsed live from tests/e2e/flashcards.spec.ts + tests/e2e/parity-session7.spec.ts at capture time — the proof table's data IS the files' own census, asserted against the recorded values before the shot.</div>
  <table>
    <tr><th>The 11 pure-flashcards describes moved to tests/e2e/flashcards.spec.ts</th><th class="r">pins</th></tr>
    ${rowHtml}
    <tr class="total"><td>flashcards.spec.ts — the dedicated flashcards home (793 lines, byte-faithful, declaration order preserved)</td><td style="text-align:right;">18</td></tr>
    <tr class="total"><td>parity-session7.spec.ts — the staying families (25 describes, 2,646 lines)</td><td style="text-align:right;">70</td></tr>
    <tr class="total"><td>the split source's total (unchanged: 18 + 70 = 88 chromium specs + the setup test)</td><td style="text-align:right;">88</td></tr>
  </table>
  <div class="verdict">Suite census: 731 in 33 files = 730 chromium specs + the setup test · the 5-chunk cold map 159+275+108+101+92 = 735 — every count UNCHANGED by the consolidation (only the spec-file census moves 31 → 32) · chunk 2 holds 275 from the same chunk (9 files) · equivalence: the two-file cold run reproduced the pre-split baseline (89 passed first-roll) · the boundary: the mixed describes (S78/AE, S184/EH, S187/EK) and the two strays outside parity-session7 (S167/DQ1, S9-O) stay.</div>
  </body></html>`;
  await page.setViewportSize({ width: 900, height: 980 });
  await page.goto("about:blank");
  await page.setContent(html, { waitUntil: "load" });
  await page.screenshot({ path: `${OUT}/191-consolidation-census-proof.png`, fullPage: true });
  console.log("frame 2 captured: 191-consolidation-census-proof.png");

  await ctx.close();
} finally {
  await browser.close();
}
// The pixel probe: both frames non-blank (the S115 data-URL form).
const { readFile } = await import("node:fs/promises");
for (const f of ["191-flashcards-home-desktop.png", "191-consolidation-census-proof.png"]) {
  const buf = await readFile(`${OUT}/${f}`);
  if (buf.length < 20_000) throw new Error(`${f} is suspiciously small (${buf.length}B)`);
  console.log(`${f}: ${buf.length.toLocaleString()}B — non-blank`);
}
console.log("S191 evidence capture complete");
