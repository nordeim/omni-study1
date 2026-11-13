// S181 probe 3 — the completion pass: (1) the corrected notes row-stack gap
// matrix (probe 1 scoped the tag ROW to the input wrapper; the row is
// `flex flex-wrap items-center gap-2 mb-4`), (2) the EDIT-surface tag row
// (corrected), (3) the Settings Subjects/Holidays tab surfaces at full depth
// (probe 2's rows filter matched the tab strip), (4) the Add Subject + Add
// Holiday dialogs (open, measure, close — never saved). The reference is in
// DARK mode (the account's persisted state — probe 2 verified html.dark);
// classes are the theme-independent parity contract, computed tokens are
// recorded per-mode. Incremental saves to /tmp/s181-probe3.json. Zero residue.
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const REF = "https://omni-study1.base44.app";
const store = {};
const save = () => writeFileSync("/tmp/s181-probe3.json", JSON.stringify(store, null, 2));
const log = (...a) => { console.log(...a); };
const PROBE_TITLE = "S181 Row Probe 3";

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

// ---- (1) the draft row stack with the corrected tag row ----
const STACK = `(() => {
  const pane = document.querySelector("main") ?? document.body;
  const findRow = (pred) => [...pane.querySelectorAll("div")].find(pred) ?? null;
  const fontRow = findRow((d) => d.textContent.trim().startsWith("Font:"));
  const addTagInput = [...pane.querySelectorAll("input")].find((i) => (i.placeholder || "").startsWith("Add tag"));
  let tagRow = addTagInput ? addTagInput.parentElement : null;
  while (tagRow && !(tagRow.className && String(tagRow.className).includes("flex-wrap"))) tagRow = tagRow.parentElement;
  const attachLabel = [...pane.querySelectorAll("span,label,p")].find((el) => el.textContent.trim() === "Attach File");
  let attachRow = attachLabel ? attachLabel.parentElement : null;
  while (attachRow && !(attachRow.className && String(attachRow.className).includes("flex-wrap"))) attachRow = attachRow.parentElement;
  const titleInput = [...pane.querySelectorAll("input")].find((i) => (i.placeholder || "").toLowerCase().includes("title"));
  let titleRow = titleInput ? titleInput.parentElement : null;
  while (titleRow && !(titleRow.className && String(titleRow.className).includes("flex-wrap"))) titleRow = titleRow.parentElement;
  const editor = pane.querySelector(".ql-container, textarea");
  let editorCard = editor ? editor.parentElement : null;
  while (editorCard && !(editorCard.className && String(editorCard.className).includes("rounded"))) editorCard = editorCard.parentElement;
  const cls = (el) => (el ? el.className ?? null : null);
  const geo = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return { y: Math.round(r.y), h: Math.round(r.height), mt: s.marginTop, mb: s.marginBottom, w: Math.round(r.width) };
  };
  const gap = (a, b) => a && b ? Math.round(b.getBoundingClientRect().y - (a.getBoundingClientRect().y + a.getBoundingClientRect().height)) : null;
  return {
    rows: {
      titleRow: { cls: cls(titleRow), geo: geo(titleRow), inputCls: titleInput ? titleInput.className : null, inputPh: titleInput ? titleInput.placeholder : null },
      fontRow: fontRow ? { cls: cls(fontRow), geo: geo(fontRow) } : null,
      tagRow: tagRow ? { cls: cls(tagRow), geo: geo(tagRow), inputCls: addTagInput ? addTagInput.className : null } : null,
      attachRow: attachRow ? { cls: cls(attachRow), geo: geo(attachRow) } : null,
      editorCard: editorCard ? { cls: cls(editorCard), geo: geo(editorCard) } : null,
    },
    gaps: {
      titleToFont: gap(titleRow, fontRow),
      fontToTag: gap(fontRow, tagRow),
      tagToAttach: gap(tagRow, attachRow),
      attachToEditor: gap(attachRow, editorCard),
    },
  };
})()`;

await page.locator("button:has(svg.lucide-plus)").first().click();
await page.waitForTimeout(600);
await page.getByRole("menuitem", { name: "New Note", exact: true }).click();
await page.waitForFunction(() => !document.querySelector('[role="menuitem"]'), null, { timeout: 10_000 });
await page.waitForTimeout(900);
store.draftStackCorrected = await page.evaluate(STACK);
save();
log("draft stack corrected:", JSON.stringify(store.draftStackCorrected, null, 1));
await page.getByRole("button", { name: "X", exact: true }).first().click().catch(() => {});
await page.waitForTimeout(600);

// ---- (2) the EDIT-surface stack (save one probe note) ----
await page.locator("button:has(svg.lucide-plus)").first().click();
await page.waitForTimeout(600);
await page.getByRole("menuitem", { name: "New Note", exact: true }).click();
await page.waitForFunction(() => !document.querySelector('[role="menuitem"]'), null, { timeout: 10_000 });
await page.waitForTimeout(900);
await page.locator('input[placeholder*="Title" i], input[placeholder*="title" i]').first().fill(PROBE_TITLE);
await page.getByRole("button", { name: "Save", exact: true }).first().click();
await page.waitForTimeout(3500);
await page.locator('button:has-text("Edit")').first().click();
await page.waitForTimeout(1100);
store.editStackCorrected = await page.evaluate(STACK);
save();
log("edit stack corrected:", JSON.stringify(store.editStackCorrected, null, 1));
await page.getByRole("button", { name: "X", exact: true }).first().click().catch(() => {});
await page.waitForTimeout(600);

// ---- (3) the Settings tabs at full depth ----
await page.evaluate(() => {
  const a = [...document.querySelectorAll("nav a")].find((x) => x.textContent.trim().startsWith("Settings"));
  if (a) a.click();
});
await page.waitForTimeout(2500);
await page.locator('[role=tab]', { hasText: "Subjects" }).first().click();
await page.waitForTimeout(1400);
const TAB_CONTENT = `(() => {
  const pane = document.querySelector("main") ?? document.body;
  // The settings body: the region BELOW the tab strip.
  const tablist = pane.querySelector("[role=tablist]");
  const body = tablist ? tablist.parentElement : pane;
  const headings = [...body.querySelectorAll("h1, h2, h3, h4")].map((h) => h.textContent.trim()).filter(Boolean).slice(0, 8);
  const paras = [...body.querySelectorAll("p")].map((p) => p.textContent.trim()).filter((t) => t.length > 8 && t.length < 160).slice(0, 8);
  const buttons = [...body.querySelectorAll("button")].map((b) => b.textContent.trim()).filter((t) => t && t.length < 30).slice(0, 20);
  // The empty state (if the tab has no data): the gradient tile + hint.
  const emptyTile = [...body.querySelectorAll("div")].find((d) => d.className && String(d.className).includes("rounded-2xl") && d.querySelector("svg"));
  return {
    headings, paras, buttons,
    emptyTileCls: emptyTile ? emptyTile.className : null,
    bodyText: body.textContent.trim().slice(0, 400),
  };
})()`;
store.subjectsTabDeep = await page.evaluate(TAB_CONTENT);
save();
log("subjects tab deep:", JSON.stringify(store.subjectsTabDeep, null, 1));

// The Add Subject dialog (open, measure, close).
await page.locator('button:has-text("Add Subject")').first().click().catch(() => {});
await page.waitForTimeout(900);
store.addSubjectDialog = await page.evaluate(`(() => {
  const dlg = document.querySelector('[role="dialog"]');
  if (!dlg) return null;
  const title = [...dlg.querySelectorAll("h2, h3, [class*='font-semibold']")].map((h) => h.textContent.trim()).slice(0, 3);
  const labels = [...dlg.querySelectorAll("label")].map((l) => l.textContent.trim()).slice(0, 8);
  const inputs = [...dlg.querySelectorAll("input")].map((i) => ({ ph: i.placeholder, type: i.type, cls: String(i.className).slice(0, 80) })).slice(0, 8);
  const btns = [...dlg.querySelectorAll("button")].map((b) => b.textContent.trim()).filter(Boolean).slice(0, 8);
  return { title, labels, inputs, btns, dialogCls: dlg.className };
})()`);
save();
log("add subject dialog:", JSON.stringify(store.addSubjectDialog, null, 1));
await page.keyboard.press("Escape");
await page.waitForTimeout(700);

await page.locator('[role=tab]', { hasText: "Holidays" }).first().click();
await page.waitForTimeout(1400);
store.holidaysTabDeep = await page.evaluate(TAB_CONTENT);
save();
log("holidays tab deep:", JSON.stringify(store.holidaysTabDeep, null, 1));

// The Add Holiday dialog.
await page.locator('button:has-text("Add Holiday")').first().click().catch(() => {});
await page.waitForTimeout(900);
store.addHolidayDialog = await page.evaluate(`(() => {
  const dlg = document.querySelector('[role="dialog"]');
  if (!dlg) return null;
  const title = [...dlg.querySelectorAll("h2, h3, [class*='font-semibold']")].map((h) => h.textContent.trim()).slice(0, 3);
  const labels = [...dlg.querySelectorAll("label")].map((l) => l.textContent.trim()).slice(0, 8);
  const inputs = [...dlg.querySelectorAll("input")].map((i) => ({ ph: i.placeholder, type: i.type })).slice(0, 8);
  const selects = [...dlg.querySelectorAll("button[role=combobox], select")].map((s) => s.textContent.trim()).slice(0, 6);
  const btns = [...dlg.querySelectorAll("button")].map((b) => b.textContent.trim()).filter(Boolean).slice(0, 8);
  return { title, labels, inputs, selects, btns };
})()`);
save();
log("add holiday dialog:", JSON.stringify(store.addHolidayDialog, null, 1));
await page.keyboard.press("Escape");
await page.waitForTimeout(700);

// ---- (4) cleanup — trash the probe note, verify ZERO residue ----
await page.evaluate(() => {
  const a = [...document.querySelectorAll("nav a")].find((x) => x.textContent.trim().startsWith("Notes"));
  if (a) a.click();
});
await page.waitForTimeout(2500);
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
log("PROBE 3 COMPLETE — store at /tmp/s181-probe3.json");
if (store.residue.probeRows !== 0) throw new Error("RESIDUE");
log("ZERO RESIDUE CONFIRMED");
