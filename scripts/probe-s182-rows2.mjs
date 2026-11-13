// S182 probe 2 — the header-row micro-probe: the exact tokens the port needs
// (the Save/X buttons' computed padding + borders, the title input's shadow,
// the full class strings) on BOTH surfaces (draft + edit). The edit surface:
// save one probe note, open Edit, measure, then trash it (zero residue).
// Incremental saves to /tmp/s182-probe2.json.
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const REF = "https://omni-study1.base44.app";
const store = {};
const save = () => writeFileSync("/tmp/s182-probe2.json", JSON.stringify(store, null, 2));
const log = (...a) => { console.log(...a); };
const PROBE_TITLE = "S182 Header Probe";

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

// Open the draft.
await page.locator("button:has(svg.lucide-plus)").first().click();
await page.waitForTimeout(600);
await page.getByRole("menuitem", { name: "New Note", exact: true }).click();
await page.waitForFunction(() => !document.querySelector('[role="menuitem"]'), null, { timeout: 10_000 });
await page.waitForTimeout(900);

const MICRO = `(() => {
  const pane = document.querySelector("main") ?? document.body;
  const full = (el) => el ? {
    tag: el.tagName, cls: String(el.className),
    w: Math.round(el.getBoundingClientRect().width), h: Math.round(el.getBoundingClientRect().height),
    px: getComputedStyle(el).paddingLeft, py: getComputedStyle(el).paddingTop,
    fontSize: getComputedStyle(el).fontSize, weight: getComputedStyle(el).fontWeight,
    border: getComputedStyle(el).border, shadow: getComputedStyle(el).boxShadow.slice(0, 80),
    bg: getComputedStyle(el).backgroundColor, color: getComputedStyle(el).color,
    gap: getComputedStyle(el).gap, radius: getComputedStyle(el).borderRadius,
  } : null;
  const saveBtn = [...pane.querySelectorAll("button")].find((b) => b.textContent.trim() === "Save");
  const xBtn = [...pane.querySelectorAll("button")].find((b) => b.querySelector("svg.lucide-x"));
  const titleInput = [...pane.querySelectorAll("input")].find((i) => (i.placeholder || "").toLowerCase().includes("title"));
  const paletteBtn = [...pane.querySelectorAll("button")].find((b) => b.querySelector("svg.lucide-palette"));
  const inputCs = titleInput ? getComputedStyle(titleInput) : null;
  return {
    saveBtn: full(saveBtn),
    xBtn: full(xBtn),
    paletteBtn: full(paletteBtn),
    titleInput: titleInput ? {
      cls: String(titleInput.className), ph: titleInput.placeholder,
      w: Math.round(titleInput.getBoundingClientRect().width), h: Math.round(titleInput.getBoundingClientRect().height),
      px: inputCs.paddingLeft, py: inputCs.paddingTop, shadow: inputCs.boxShadow.slice(0, 80),
      border: inputCs.border, fontSize: inputCs.fontSize, weight: inputCs.fontWeight,
      color: inputCs.color, bg: inputCs.backgroundColor,
    } : null,
  };
})()`;
store.draftMicro = await page.evaluate(MICRO);
save();
log("draft micro:", JSON.stringify(store.draftMicro, null, 1));

// Save the probe note (to open the edit surface), then Edit.
await page.locator('input[placeholder*="Title" i], input[placeholder*="title" i]').first().fill(PROBE_TITLE);
await page.getByRole("button", { name: "Save", exact: true }).first().click();
await page.waitForTimeout(3500);
await page.locator('button:has-text("Edit")').first().click();
await page.waitForTimeout(1100);

const EDIT_MICRO = `(() => {
  const pane = document.querySelector("main") ?? document.body;
  const full = (el) => el ? {
    tag: el.tagName, cls: String(el.className),
    w: Math.round(el.getBoundingClientRect().width), h: Math.round(el.getBoundingClientRect().height),
    y: Math.round(el.getBoundingClientRect().y),
    px: getComputedStyle(el).paddingLeft, py: getComputedStyle(el).paddingTop,
    border: getComputedStyle(el).border,
  } : null;
  const titleInput = [...pane.querySelectorAll("input")].find((i) => (i.placeholder || "").toLowerCase().includes("title"));
  // The edit header row: the row that CONTAINS the title input.
  let headerRow = titleInput ? titleInput.parentElement : null;
  while (headerRow && !(headerRow.className && String(headerRow.className).includes("justify-between"))) headerRow = headerRow.parentElement;
  const saveBtn = [...pane.querySelectorAll("button")].find((b) => b.textContent.trim() === "Save");
  const xBtn = [...pane.querySelectorAll("button")].find((b) => b.querySelector("svg.lucide-x"));
  const fontRow = [...pane.querySelectorAll("div")].find((d) => d.textContent.trim().startsWith("Font:"));
  const geo = (el) => el ? { y: Math.round(el.getBoundingClientRect().y), h: Math.round(el.getBoundingClientRect().height), mb: getComputedStyle(el).marginBottom } : null;
  return {
    headerRow: full(headerRow), headerGeo: geo(headerRow),
    titleInput: titleInput ? { cls: String(titleInput.className), geo: geo(titleInput), w: Math.round(titleInput.getBoundingClientRect().width) } : null,
    saveBtn: full(saveBtn), xBtn: full(xBtn), fontRowGeo: geo(fontRow),
    gapHeaderToFont: headerRow && fontRow ? Math.round(fontRow.getBoundingClientRect().y - (headerRow.getBoundingClientRect().y + headerRow.getBoundingClientRect().height)) : null,
  };
})()`;
store.editMicro = await page.evaluate(EDIT_MICRO);
save();
log("edit micro:", JSON.stringify(store.editMicro, null, 1));

// Close the edit surface, then trash the probe note (zero residue).
await page.getByRole("button", { name: "X", exact: true }).first().click().catch(() => {});
await page.waitForTimeout(700);
for (let round = 0; round < 5; round++) {
  const present = await page.evaluate((t) =>
    [...document.querySelectorAll("button, div[role=button], a")].some((b) => (b.textContent ?? "").includes(t)), PROBE_TITLE);
  if (!present) break;
  await page.locator(`button:has-text("${PROBE_TITLE}")`).first().click().catch(() => {});
  await page.waitForTimeout(1300);
  await page.locator("button:has(svg.lucide-trash2), button:has(svg.lucide-trash)").last().click().catch(() => {});
  await page.waitForTimeout(2500);
}
store.residue = await page.evaluate((t) => ({
  probeRows: [...document.querySelectorAll("button, div, span, p")].filter((b) =>
    (b.textContent ?? "").includes(t)).length,
  noNotesYet: document.querySelector("main")?.textContent?.includes("No notes yet") ?? false,
}), PROBE_TITLE);
save();
log("residue:", JSON.stringify(store.residue));

await ctx.close();
await browser.close();
log("PROBE 2 COMPLETE — store at /tmp/s182-probe2.json");
if (store.residue.probeRows !== 0) throw new Error("RESIDUE");
log("ZERO RESIDUE CONFIRMED");
