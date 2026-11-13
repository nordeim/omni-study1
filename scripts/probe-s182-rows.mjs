// S182 probe 1 — the B-8 next-tier audit: the notes draft's TITLE-ROW +
// NOTEBOOK-ROW anatomy (the s181 probes' titleRow leg returned null twice —
// the walk-up looked for flex-wrap, which the title row does not carry; this
// probe records the FULL ancestor chain of the title input and the notebook
// combobox so the real anatomy is visible), plus the draft header row's
// geometry (palette/Save/X). Computed styles are ground truth (the repo
// doctrine). Incremental saves to /tmp/s182-probe1.json. Zero residue.
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const REF = "https://omni-study1.base44.app";
const store = {};
const save = () => writeFileSync("/tmp/s182-probe1.json", JSON.stringify(store, null, 2));
const log = (...a) => { console.log(...a); };

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(`${REF}/login`, { timeout: 60_000, waitUntil: "domcontentloaded" });
await page.waitForTimeout(2500);
await page.fill("input[type=email]", process.env.REF_PROBE_EMAIL);
await page.fill("input[type=password]", process.env.REF_PROBE_PASSWORD);
await page.waitForFunction(() => {
  const btn = document.querySelector("button[type=submit]");
  return btn !== null && !btn.disabled;
}, null, { timeout: 30_000 });
await page.click("button[type=submit]");
await page.waitForFunction(() => document.querySelector("nav a") !== null, null, { timeout: 30_000 });
await page.waitForTimeout(2000);
await page.evaluate(() => {
  const a = [...document.querySelectorAll("nav a")].find((x) => x.textContent.trim().startsWith("Notes"));
  if (a) a.click();
});
await page.waitForTimeout(2500);

// Open the draft (the S180/ED recipe: the + menu -> New Note).
await page.locator("button:has(svg.lucide-plus)").first().click();
await page.waitForTimeout(600);
await page.getByRole("menuitem", { name: "New Note", exact: true }).click();
await page.waitForFunction(() => !document.querySelector('[role="menuitem"]'), null, { timeout: 10_000 });
await page.waitForTimeout(900);

// The title-row + notebook-row anatomy: the FULL ancestor chain of the
// title input (the walk-up FIX — no flex-wrap assumption), the notebook
// combobox chain, and the header row geometry.
const ANATOMY = `(() => {
  const pane = document.querySelector("main") ?? document.body;
  const titleInput = [...pane.querySelectorAll("input")].find((i) => (i.placeholder || "").toLowerCase().includes("title"));
  if (!titleInput) return { note: "no title input" };
  const chain = (el, n) => {
    const out = [];
    let cur = el;
    for (let i = 0; i < n && cur && cur !== document.body; i++) {
      const r = cur.getBoundingClientRect();
      const s = getComputedStyle(cur);
      out.push({
        tag: cur.tagName, cls: String(cur.className).slice(0, 160),
        y: Math.round(r.y), x: Math.round(r.x), w: Math.round(r.width), h: Math.round(r.height),
        mt: s.marginTop, mb: s.marginBottom, display: s.display,
      });
      cur = cur.parentElement;
    }
    return out;
  };
  const geo = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return { y: Math.round(r.y), x: Math.round(r.x), w: Math.round(r.width), h: Math.round(r.height), mt: s.marginTop, mb: s.marginBottom };
  };
  // The notebook combobox: the select whose trigger shows "None".
  const notebookTrigger = [...pane.querySelectorAll("button")].find((b) => b.getAttribute("role") === "combobox" && b.textContent.trim() === "None");
  const paletteBtn = [...pane.querySelectorAll("button")].find((b) => b.querySelector("svg.lucide-palette"));
  const saveBtn = [...pane.querySelectorAll("button")].find((b) => b.textContent.trim() === "Save");
  const xBtn = [...pane.querySelectorAll("button")].find((b) => b.querySelector("svg.lucide-x"));
  // The font row (the S180 ED6 record) for the gap reference.
  const fontRow = [...pane.querySelectorAll("div")].find((d) => d.textContent.trim().startsWith("Font:"));
  const inputCs = getComputedStyle(titleInput);
  return {
    titleInput: {
      ph: titleInput.placeholder, cls: String(titleInput.className).slice(0, 200),
      geo: geo(titleInput), fontSize: inputCs.fontSize, weight: inputCs.fontWeight,
      color: inputCs.color, bg: inputCs.backgroundColor, border: inputCs.border,
      h: Math.round(titleInput.getBoundingClientRect().height),
    },
    titleChain: chain(titleInput, 4),
    notebookTrigger: notebookTrigger ? {
      text: notebookTrigger.textContent.trim(), geo: geo(notebookTrigger),
      cls: String(notebookTrigger.className).slice(0, 200), role: notebookTrigger.getAttribute("role"),
      ariaLabel: notebookTrigger.getAttribute("aria-label"),
    } : null,
    notebookChain: notebookTrigger ? chain(notebookTrigger, 4) : null,
    paletteBtn: paletteBtn ? { geo: geo(paletteBtn), cls: String(paletteBtn.className).slice(0, 120) } : null,
    saveBtn: saveBtn ? { geo: geo(saveBtn), cls: String(saveBtn.className).slice(0, 160) } : null,
    xBtn: xBtn ? { geo: geo(xBtn), cls: String(xBtn.className).slice(0, 120) } : null,
    fontRow: fontRow ? { geo: geo(fontRow), cls: String(fontRow.className).slice(0, 160) } : null,
  };
})()`;
store.draftAnatomy = await page.evaluate(ANATOMY);
save();
log("draft anatomy:", JSON.stringify(store.draftAnatomy, null, 1));

// Close the draft (the X in the draft header).
await page.getByRole("button", { name: "X", exact: true }).first().click().catch(() => {});
await page.waitForTimeout(700);

// Zero-residue verification (no note was saved).
store.residue = await page.evaluate(() => ({
  noNotesYet: document.querySelector("main")?.textContent?.includes("No notes yet") ?? false,
}));
save();
log("residue:", JSON.stringify(store.residue));

await ctx.close();
await browser.close();
log("PROBE COMPLETE — store at /tmp/s182-probe1.json");
if (!store.residue.noNotesYet) throw new Error("RESIDUE");
log("ZERO RESIDUE CONFIRMED");
