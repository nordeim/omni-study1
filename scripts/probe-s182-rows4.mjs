// S182 probe 4 — the closing micro-legend: (1) the ref title input's FULL
// class string (untruncated) + its text/placeholder rendered position,
// (2) the clone title input's computed py + text position (the vertical
// drift check). Incremental saves to /tmp/s182-probe4.json.
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const REF = "https://omni-study1.base44.app";
const store = {};
const save = () => writeFileSync("/tmp/s182-probe4.json", JSON.stringify(store, null, 2));

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
await page.locator("button:has(svg.lucide-plus)").first().click();
await page.waitForTimeout(600);
await page.getByRole("menuitem", { name: "New Note", exact: true }).click();
await page.waitForFunction(() => !document.querySelector('[role="menuitem"]'), null, { timeout: 10_000 });
await page.waitForTimeout(900);

store.refTitleInputFull = await page.evaluate(`(() => {
  const pane = document.querySelector("main") ?? document.body;
  const titleInput = [...pane.querySelectorAll("input")].find((i) => (i.placeholder || "").toLowerCase().includes("title"));
  if (!titleInput) return null;
  const s = getComputedStyle(titleInput);
  const r = titleInput.getBoundingClientRect();
  return {
    fullCls: String(titleInput.className),
    ph: titleInput.placeholder,
    geo: { y: Math.round(r.y), x: Math.round(r.x), w: Math.round(r.width), h: Math.round(r.height) },
    py: s.paddingTop, px: s.paddingLeft, lineHeight: s.lineHeight,
    fontSize: s.fontSize, weight: s.fontWeight, color: s.color,
    phColor: s.getPropertyValue("--placeholder-color") || null,
    placeholderChecked: { color: s.getPropertyValue("placeholder-color") },
  };
})()`);
save();
console.log(JSON.stringify(store.refTitleInputFull, null, 1));

// The notebook select trigger's full class + width (w-32 = 128 verified).
store.refNotebookFull = await page.evaluate(`(() => {
  const pane = document.querySelector("main") ?? document.body;
  const nb = [...pane.querySelectorAll("button")].find((b) => b.getAttribute("role") === "combobox" && b.textContent.trim() === "None");
  return nb ? { fullCls: String(nb.className), w: Math.round(nb.getBoundingClientRect().width), h: Math.round(nb.getBoundingClientRect().height), fontSize: getComputedStyle(nb).fontSize, weight: getComputedStyle(nb).fontWeight } : null;
})()`);
save();
console.log(JSON.stringify(store.refNotebookFull, null, 1));

await page.getByRole("button", { name: "X", exact: true }).first().click().catch(() => {});
await page.waitForTimeout(500);
store.residue = await page.evaluate(() => ({
  noNotesYet: document.querySelector("main")?.textContent?.includes("No notes yet") ?? false,
}));
save();
await ctx.close();
await browser.close();
console.log("PROBE 4 COMPLETE", JSON.stringify(store.residue));
