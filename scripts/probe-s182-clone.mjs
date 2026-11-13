// S182 clone probe — the same draft header-row anatomy on the clone dev
// server (localhost:3000): the title input, the notebook select trigger,
// palette/Save/X, and the header-row geometry vs the reference record
// (/tmp/s182-probe1.json). Computed styles are ground truth.
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const CLONE = "http://localhost:3000";
const store = {};
const save = () => writeFileSync("/tmp/s182-clone.json", JSON.stringify(store, null, 2));
const log = (...a) => { console.log(...a); };

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(`${CLONE}/login`, { timeout: 60_000, waitUntil: "domcontentloaded" });
await page.fill("input[type=email]", "demo@studyflow.app");
await page.fill("input[type=password]", "Demo1234!");
await page.waitForFunction(() => {
  const btn = document.querySelector("button[type=submit]");
  return btn !== null && !btn.disabled;
}, null, { timeout: 30_000 });
await page.click("button[type=submit]");
await page.waitForFunction(() => document.querySelector("main") !== null, null, { timeout: 30_000 });
await page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true", null, { timeout: 30_000 });
await page.waitForTimeout(1500);
await page.evaluate(() => {
  const a = [...document.querySelectorAll("nav a")].find((x) => x.textContent.trim().startsWith("Notes"));
  if (a) a.click();
});
await page.waitForTimeout(2500);

// Open the draft (the clone's + menu -> New Note — the S177 recipe).
await page.locator("button:has(svg.lucide-plus)").first().click();
await page.waitForTimeout(600);
await page.getByRole("menuitem", { name: "New Note", exact: true }).click();
await page.waitForFunction(() => !document.querySelector('[role="menuitem"]'), null, { timeout: 10_000 });
await page.waitForTimeout(900);

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
  const notebookTrigger = [...pane.querySelectorAll("button")].find((b) => b.getAttribute("role") === "combobox" && b.textContent.trim() === "None");
  const paletteBtn = [...pane.querySelectorAll("button")].find((b) => b.querySelector("svg.lucide-palette"));
  const saveBtn = [...pane.querySelectorAll("button")].find((b) => b.textContent.trim() === "Save");
  const xBtn = [...pane.querySelectorAll("button")].find((b) => b.querySelector("svg.lucide-x"));
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
store.cloneDraftAnatomy = await page.evaluate(ANATOMY);
save();
log("clone draft anatomy:", JSON.stringify(store.cloneDraftAnatomy, null, 1));

// Close the draft (discard).
await page.getByRole("button", { name: "X", exact: true }).first().click().catch(() => {});
await page.waitForTimeout(700);

await ctx.close();
await browser.close();
log("CLONE PROBE COMPLETE — store at /tmp/s182-clone.json");
