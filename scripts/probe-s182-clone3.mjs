// S182 clone edit-input probe — the edit surface's NoteTitleInput computed
// px/py (the ref: px=0 py=4) + the Save/X geometry on the edit surface.
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const CLONE = "http://localhost:3000";
const store = {};
const save = () => writeFileSync("/tmp/s182-clone3.json", JSON.stringify(store, null, 2));

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(`${CLONE}/login`, { timeout: 60_000, waitUntil: "domcontentloaded" });
await page.waitForTimeout(1200);
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
await page.getByRole("button", { name: /Dot product intuition/ }).first().click();
await page.waitForTimeout(900);
await page.locator('[aria-label="Note editor pane"]').getByRole("button", { name: "Edit", exact: true }).click();
await page.waitForTimeout(900);

store.editSurface = await page.evaluate(`(() => {
  const pane = document.querySelector('[aria-label="Note editor pane"]') ?? document.body;
  const titleInput = [...pane.querySelectorAll("input")].find((i) => (i.placeholder || "").toLowerCase().includes("title"));
  const saveBtn = [...pane.querySelectorAll("button")].find((b) => b.textContent.trim() === "Save");
  const xBtn = [...pane.querySelectorAll("button")].find((b) => b.querySelector("svg.lucide-x"));
  const fontRow = [...pane.querySelectorAll("div")].find((d) => (d.textContent ?? "").trim().startsWith("Font:"));
  let headerRow = titleInput ? titleInput.parentElement : null;
  while (headerRow && !(headerRow.className && String(headerRow.className).includes("justify-between"))) headerRow = headerRow.parentElement;
  const row = headerRow && headerRow.className ? headerRow : (titleInput ? titleInput.parentElement : null);
  const cs = (el) => {
    if (!el) return null;
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return { cls: String(el.className).slice(0, 150), w: Math.round(r.width), h: Math.round(r.height), y: Math.round(r.y), px: s.paddingLeft, py: s.paddingTop, mt: s.marginTop, mb: s.marginBottom, border: s.borderTopWidth, fontSize: s.fontSize, weight: s.fontWeight };
  };
  const gap = row && fontRow && row.getBoundingClientRect().height
    ? Math.round(fontRow.getBoundingClientRect().y - (row.getBoundingClientRect().y + row.getBoundingClientRect().height))
    : null;
  return {
    headerRow: cs(row),
    titleInput: titleInput ? { ...cs(titleInput), fullCls: String(titleInput.className) } : null,
    saveBtn: cs(saveBtn),
    xBtn: cs(xBtn),
    fontRowY: fontRow ? Math.round(fontRow.getBoundingClientRect().y) : null,
    headerToFontGap: gap,
  };
})()`);
save();
console.log(JSON.stringify(store.editSurface, null, 1));
await ctx.close();
await browser.close();
console.log("EDIT-SURFACE PROBE COMPLETE");
