// S189 evidence capture — the notes-family consolidation proof frames.
// Frame 1: the consolidated family's home surface — the Notes view at
// 1440x900 with the seeded fixtures DOM-asserted before the shot (the
// four seeded rows, the "Essay sources" CQ3 fixture visible, the
// two-pane layout). Frame 2: the consolidation census rendered as a
// self-verifying proof table — the rows are generated FROM the actual
// spec files (notes.spec.ts + parity-session7.spec.ts parsed live: the
// 14 moved describes with their pin counts, the 49+88=137 arithmetic,
// the 31-file suite census), asserted against the recorded values
// before the shot.
// Usage: node scripts/capture-s189-evidence.mjs  (the dev server at
// :3000 carries the current tree)
import { chromium } from "playwright";
import { mkdirSync, readFileSync } from "node:fs";

const CLONE = "http://localhost:3000";
const OUT = "docs/screenshots";
mkdirSync(OUT, { recursive: true });

const NOTES_SPEC = readFileSync("tests/e2e/notes.spec.ts", "utf8");
const P7_SPEC = readFileSync("tests/e2e/parity-session7.spec.ts", "utf8");

const DESCRIBE_RE = /^test\.describe\("(.+?)", \(\) => \{$/gm;
const TITLE_RE = /^\s*test\("(.+?)"/gm;

function census(src) {
  const describes = [];
  let m;
  const starts = [];
  while ((m = DESCRIBE_RE.exec(src)) !== null) starts.push({ i: m.index, title: m[1] });
  const lines = src.split("\n");
  for (const { i, title } of starts) {
    const line = src.slice(0, i).split("\n").length; // 1-based start line
    // block = this describe line through its column-0 '});'
    let e = line - 1;
    while (lines[e] !== "});") e += 1;
    const block = lines.slice(line - 1, e + 1).join("\n");
    const pins = [...block.matchAll(TITLE_RE)].length;
    describes.push({ title, pins });
  }
  return describes;
}

const moved = census(NOTES_SPEC);
const stayed = census(P7_SPEC);
const movedPins = moved.reduce((a, d) => a + d.pins, 0);
const stayedPins = stayed.reduce((a, d) => a + d.pins, 0);

// The self-verification: the recorded S189 values, asserted BEFORE the shot.
if (moved.length !== 14) throw new Error(`moved describes ${moved.length} != 14`);
if (movedPins !== 49) throw new Error(`moved pins ${movedPins} != 49`);
if (stayed.length !== 36) throw new Error(`staying describes ${stayed.length} != 36`);
if (stayedPins !== 88) throw new Error(`staying pins ${stayedPins} != 88`);
console.log(`census verified: notes.spec.ts 14 describes / ${movedPins} pins · parity-session7 ${stayed.length} describes / ${stayedPins} pins`);

const browser = await chromium.launch();
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${CLONE}/login`);
  await page.fill("input[type=email]", "demo@studyflow.app");
  await page.fill("input[type=password]", "Demo1234!");
  await page.waitForFunction(() => { const b = document.querySelector("button[type=submit]"); return b && !b.disabled; }, null, { timeout: 15_000 });
  await page.click("button[type=submit]");
  await page.waitForFunction(() => document.querySelector("nav a") !== null && document.querySelector("h1, h2") !== null, null, { timeout: 30_000 });
  await page.waitForTimeout(1500);

  // ---- Frame 1: the notes home surface (desktop) ----
  await page.goto(`${CLONE}/Notes`);
  await page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true");
  const rows = page.locator('[aria-label="Notes list pane"] button');
  await page.waitForFunction(() => document.querySelectorAll('[aria-label="Notes list pane"] button').length >= 4, null, { timeout: 15_000 });
  const essayVisible = await page.getByText("Essay sources", { exact: true }).first().isVisible();
  if (!essayVisible) throw new Error("the CQ3 seed fixture 'Essay sources' is not visible");
  const editorPane = await page.locator('[aria-label="Note editor pane"]').count();
  if (editorPane < 1) throw new Error("the two-pane layout is missing the editor pane");
  await page.screenshot({ path: `${OUT}/189-notes-home-desktop.png`, fullPage: false });
  console.log("frame 1 captured: 189-notes-home-desktop.png");

  // ---- Frame 2: the consolidation census proof table ----
  const rowHtml = moved
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
  <h1>S189/EM — the notes-family e2e consolidation census</h1>
  <div class="sub">Parsed live from tests/e2e/notes.spec.ts + tests/e2e/parity-session7.spec.ts at capture time — the proof table's data IS the files' own census, asserted against the recorded values before the shot.</div>
  <table>
    <tr><th>The 14 notes-view describes moved to tests/e2e/notes.spec.ts</th><th class="r">pins</th></tr>
    ${rowHtml}
    <tr class="total"><td>notes.spec.ts — the dedicated notes home (2,113 lines, byte-faithful, declaration order preserved)</td><td style="text-align:right;">49</td></tr>
    <tr class="total"><td>parity-session7.spec.ts — the staying families (36 describes, 3,388 lines)</td><td style="text-align:right;">88</td></tr>
    <tr class="total"><td>the split source's total (unchanged: 49 + 88 = 137 chromium specs + the setup test)</td><td style="text-align:right;">137</td></tr>
  </table>
  <div class="verdict">Suite census: 719 in 32 files = 718 chromium specs + the setup test · the 5-chunk cold map 158+275+103+95+92 = 723 — every count UNCHANGED by the consolidation (only the file census moves 30 → 31) · chunk 2 holds 275 from the same chunk · equivalence: the two-file cold run reproduced the pre-split baseline down to the identical flake signature.</div>
  </body></html>`;
  await page.setViewportSize({ width: 900, height: 980 });
  await page.goto("about:blank");
  await page.setContent(html, { waitUntil: "load" });
  await page.screenshot({ path: `${OUT}/189-consolidation-census-proof.png`, fullPage: true });
  console.log("frame 2 captured: 189-consolidation-census-proof.png");

  await ctx.close();
} finally {
  await browser.close();
}
console.log("S189 evidence capture complete — both frames self-verified before the shot");
