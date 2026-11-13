// S181 reference probe — the B-8-family audit of the remaining notes toolbar
// rows (the tag row's mb-4 vs mt-2 drift — the S180 plan's recorded
// out-of-scope posture, now its own cycle) + the standing Subjects/Holidays
// rotation (the tripwire re-probe). One consolidated pass:
//   LEG A  the draft TEXT toolbar row stack (title row → Font row → tag row
//          → Attach row → editor card): every row's wrapper classes + the
//          computed margins + the bounding-box gap matrix; the tag pill
//          anatomy (the AD6 family re-probe) + the "Add tag..." input
//   LEG B  the EDIT surface (a saved probe note opened → Edit → the same
//          row stack + gap matrix)
//   LEG C  the CODING draft (tag row present, no Font row)
//   LEG D  the saved note's VIEW mode (the tag pill render on a saved note)
//   LEG E  the Settings → Subjects tab (the standing rotation re-probe)
//   LEG F  the Settings → Holidays tab (the standing rotation re-probe)
//   LEG G  cleanup — trash the probe note, verify ZERO residue
// Incremental saves: each leg's measurement lands in /tmp/s181-probe.json
// the moment it is taken (a crash never loses a measurement). No draft is
// ever SAVED except the ONE probe note, trashed in LEG G.
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const REF = "https://omni-study1.base44.app";
const OUT = "/tmp/s181-probe.json";
const store = {};
const save = () => writeFileSync(OUT, JSON.stringify(store, null, 2));
const log = (...a) => { console.log(...a); };
const PROBE_TITLE = "S181 Row Probe";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

// ---- login (the S179 residue-check recipe) ----
await page.goto(`${REF}/login`, { timeout: 60_000, waitUntil: "domcontentloaded" });
await page.waitForTimeout(2500);
await page.fill("input[type=email]", process.env.REF_PROBE_EMAIL);
await page.fill("input[type=password]", process.env.REF_PROBE_PASSWORD);
await page.waitForFunction(
  () => {
    const btn = document.querySelector("button[type=submit]");
    return btn !== null && !btn.disabled;
  },
  null,
  { timeout: 30_000 },
);
await page.click("button[type=submit]");
await page.waitForFunction(() => document.querySelector("nav a") !== null, null, { timeout: 30_000 });
await page.waitForTimeout(1500);
await page.evaluate(() => {
  const a = [...document.querySelectorAll("nav a")].find((x) => x.textContent.trim().startsWith("Notes"));
  if (a) a.click();
});
await page.waitForTimeout(2500);
log("logged in, on Notes");

// ---- the row-stack probe (shared by LEG A/B/C) ----
const ROW_STACK = `(() => {
  const pane = document.querySelector("main") ?? document.body;
  const findRow = (pred) => [...pane.querySelectorAll("div")].find(pred) ?? null;
  const fontRow = findRow((d) => d.textContent.trim().startsWith("Font:"));
  const addTagInput = [...pane.querySelectorAll("input")].find((i) => (i.placeholder || "").startsWith("Add tag"));
  const tagRow = addTagInput ? addTagInput.closest("div.flex, div[class*='flex']") : null;
  const attachLabel = [...pane.querySelectorAll("span,label,p")].find((el) => el.textContent.trim() === "Attach File");
  const attachRow = attachLabel ? attachLabel.closest("div.flex, div[class*='flex']") : null;
  const titleInput = [...pane.querySelectorAll("input")].find((i) => (i.placeholder || "").toLowerCase().includes("title"));
  const titleRow = titleInput ? titleInput.closest("div.flex, div[class*='flex']") : null;
  const editor = pane.querySelector(".ql-container, textarea");
  const editorCard = editor ? editor.closest("div.rounded-2xl, div[class*='rounded']") : null;
  const cls = (el) => (el ? el.className ?? null : null);
  const geo = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return {
      y: Math.round(r.y), h: Math.round(r.height),
      mt: s.marginTop, mb: s.marginBottom, pt: s.paddingTop, pb: s.paddingBottom,
      display: s.display, gap: s.gap, width: Math.round(r.width),
    };
  };
  const gap = (a, b) => a && b ? Math.round(b.getBoundingClientRect().y - (a.getBoundingClientRect().y + a.getBoundingClientRect().height)) : null;
  return {
    titleRow: { cls: cls(titleRow), geo: geo(titleRow), inputCls: titleInput ? titleInput.className : null, inputPh: titleInput ? titleInput.placeholder : null },
    fontRow: fontRow ? { cls: cls(fontRow), geo: geo(fontRow) } : null,
    tagRow: tagRow ? { cls: cls(tagRow), geo: geo(tagRow), inputCls: addTagInput ? addTagInput.className : null } : null,
    attachRow: attachRow ? { cls: cls(attachRow), geo: geo(attachRow) } : null,
    editorCard: editorCard ? { cls: cls(editorCard), geo: geo(editorCard) } : null,
    gaps: {
      titleToFont: gap(titleRow, fontRow),
      fontToTag: gap(fontRow, tagRow),
      tagToAttach: gap(tagRow, attachRow),
      attachToEditor: gap(attachRow, editorCard),
      tagToEditorNoAttach: attachRow ? null : gap(tagRow, editorCard),
    },
  };
})()`;

// ---- LEG A: the draft TEXT toolbar row stack ----
await page.locator("button:has(svg.lucide-plus)").first().click();
await page.waitForTimeout(600);
await page.getByRole("menuitem", { name: "New Note", exact: true }).click();
await page.waitForFunction(() => !document.querySelector('[role="menuitem"]'), null, { timeout: 10_000 });
await page.waitForTimeout(900);
store.draftTextStack = await page.evaluate(ROW_STACK);
save();
log("LEG A: draft tagRow", JSON.stringify(store.draftTextStack?.tagRow ?? null));
log("LEG A: draft gaps", JSON.stringify(store.draftTextStack?.gaps ?? null));

// The tag pill anatomy (type a probe tag — the draft's local state only).
await page.locator('input[placeholder^="Add tag"]').fill("s181probe");
await page.keyboard.press("Enter");
await page.waitForTimeout(400);
store.draftTagPill = await page.evaluate(`(() => {
  const pane = document.querySelector("main") ?? document.body;
  const pill = [...pane.querySelectorAll("span,div")].find((el) => el.childElementCount <= 2 && el.textContent.trim() === "s181probe");
  if (!pill) return null;
  const s = getComputedStyle(pill);
  return {
    cls: pill.className,
    bg: s.backgroundColor, color: s.color, radius: s.borderRadius,
    size: s.fontSize, weight: s.fontWeight, h: Math.round(pill.getBoundingClientRect().height),
    px: s.paddingLeft,
  };
})()`);
save();
log("LEG A: draft tag pill", JSON.stringify(store.draftTagPill));

// The "Add tag..." input computed tokens.
store.draftTagInput = await page.evaluate(`(() => {
  const pane = document.querySelector("main") ?? document.body;
  const i = [...pane.querySelectorAll("input")].find((x) => (x.placeholder || "").startsWith("Add tag"));
  if (!i) return null;
  const s = getComputedStyle(i);
  return { cls: i.className, size: s.fontSize, h: Math.round(i.getBoundingClientRect().height), w: Math.round(i.getBoundingClientRect().width), ph: s.color, radius: s.borderRadius };
})()`);
save();
log("LEG A: draft tag input", JSON.stringify(store.draftTagInput));

// Exit the draft WITHOUT saving (no residue).
await page.getByRole("button", { name: "X", exact: true }).first().click().catch(() => {});
await page.waitForTimeout(600);

// ---- LEG C: the CODING draft (tag row present, no Font row) ----
await page.locator("button:has(svg.lucide-plus)").first().click();
await page.waitForTimeout(600);
await page.getByRole("menuitem", { name: /Coding Note/i }).click();
await page.waitForFunction(() => !document.querySelector('[role="menuitem"]'), null, { timeout: 10_000 });
await page.waitForTimeout(900);
store.draftCodingStack = await page.evaluate(ROW_STACK);
save();
log("LEG C: coding tagRow", JSON.stringify(store.draftCodingStack?.tagRow ?? null));
log("LEG C: coding gaps", JSON.stringify(store.draftCodingStack?.gaps ?? null));
await page.getByRole("button", { name: "X", exact: true }).first().click().catch(() => {});
await page.waitForTimeout(600);

// ---- LEG B/D: save ONE probe note, measure the EDIT stack + the VIEW pill ----
await page.locator("button:has(svg.lucide-plus)").first().click();
await page.waitForTimeout(600);
await page.getByRole("menuitem", { name: "New Note", exact: true }).click();
await page.waitForFunction(() => !document.querySelector('[role="menuitem"]'), null, { timeout: 10_000 });
await page.waitForTimeout(900);
await page.locator('input[placeholder*="Title" i], input[placeholder*="title" i]').first().fill(PROBE_TITLE);
await page.locator('input[placeholder^="Add tag"]').fill("s181probe");
await page.keyboard.press("Enter");
await page.waitForTimeout(400);
await page.getByRole("button", { name: "Save", exact: true }).first().click();
await page.waitForTimeout(3500);
// The saved note's VIEW mode: the tag pill render.
store.savedViewPill = await page.evaluate(`(() => {
  const pane = document.querySelector("main") ?? document.body;
  const pill = [...pane.querySelectorAll("span,div")].find((el) => el.childElementCount <= 2 && el.textContent.trim() === "s181probe");
  if (!pill) return null;
  const s = getComputedStyle(pill);
  return { cls: pill.className, bg: s.backgroundColor, color: s.color, radius: s.borderRadius, size: s.fontSize };
})()`);
save();
log("LEG D: saved view pill", JSON.stringify(store.savedViewPill));
// EDIT: open the edit toolbar.
const editBtn = page.locator('button:has-text("Edit")').first();
if (await editBtn.count() > 0) {
  await editBtn.click();
  await page.waitForTimeout(1000);
  store.editStack = await page.evaluate(ROW_STACK);
  save();
  log("LEG B: edit tagRow", JSON.stringify(store.editStack?.tagRow ?? null));
  log("LEG B: edit gaps", JSON.stringify(store.editStack?.gaps ?? null));
  // The edit-surface pill + input.
  store.editTagInput = await page.evaluate(`(() => {
    const pane = document.querySelector("main") ?? document.body;
    const i = [...pane.querySelectorAll("input")].find((x) => (x.placeholder || "").startsWith("Add tag"));
    if (!i) return null;
    const s = getComputedStyle(i);
    return { cls: i.className, size: s.fontSize, h: Math.round(i.getBoundingClientRect().height), w: Math.round(i.getBoundingClientRect().width) };
  })()`);
  save();
  await page.getByRole("button", { name: "X", exact: true }).first().click().catch(() => {});
  await page.waitForTimeout(600);
} else {
  store.editStack = { note: "no Edit button found" };
  save();
}

// ---- LEG E/F: the Settings → Subjects + Holidays tabs (standing rotation) ----
await page.evaluate(() => {
  const a = [...document.querySelectorAll("nav a")].find((x) => x.textContent.trim().startsWith("Settings"));
  if (a) a.click();
});
await page.waitForTimeout(2200);
const TAB_PROBE = `((tabName) => {
  const pane = document.querySelector("main") ?? document.body;
  const tab = [...pane.querySelectorAll("[role=tab], button")].find((b) => b.textContent.trim().toLowerCase().includes(tabName));
  if (tab) tab.click();
  return !!tab;
})`;
store.subjectsTabClicked = await page.evaluate(`${TAB_PROBE}("subjects")`);
await page.waitForTimeout(1200);
store.subjectsTab = await page.evaluate(`(() => {
  const pane = document.querySelector("main") ?? document.body;
  const h2 = [...pane.querySelectorAll("h2, h3")].map((h) => h.textContent.trim()).filter(Boolean).slice(0, 6);
  const btns = [...pane.querySelectorAll("button")].map((b) => b.textContent.trim()).filter((t) => t && t.length < 30).slice(0, 14);
  const cards = [...pane.querySelectorAll("div[class*='rounded']")].filter((d) => d.childElementCount > 1).slice(0, 3).map((d) => d.className);
  return { headings: h2, buttons: btns, cardClasses: cards };
})()`);
save();
log("LEG E: subjects tab", JSON.stringify(store.subjectsTab));

// The subject ROW anatomy.
store.subjectsRows = await page.evaluate(`(() => {
  const pane = document.querySelector("main") ?? document.body;
  const rows = [...pane.querySelectorAll("div")].filter((d) => d.className && String(d.className).includes("rounded") && d.textContent.trim().length > 4 && d.textContent.trim().length < 60 && !d.querySelector("div[class*='rounded']"));
  return rows.slice(0, 6).map((r) => ({ cls: r.className, text: r.textContent.trim().slice(0, 40) }));
})()`);
save();

// Holidays tab.
store.holidaysTabClicked = await page.evaluate(`${TAB_PROBE}("holidays")`);
await page.waitForTimeout(1200);
store.holidaysTab = await page.evaluate(`(() => {
  const pane = document.querySelector("main") ?? document.body;
  const h2 = [...pane.querySelectorAll("h2, h3")].map((h) => h.textContent.trim()).filter(Boolean).slice(0, 6);
  const btns = [...pane.querySelectorAll("button")].map((b) => b.textContent.trim()).filter((t) => t && t.length < 30).slice(0, 14);
  return { headings: h2, buttons: btns };
})()`);
save();
log("LEG F: holidays tab", JSON.stringify(store.holidaysTab));

// The holiday ROW anatomy.
store.holidaysRows = await page.evaluate(`(() => {
  const pane = document.querySelector("main") ?? document.body;
  const rows = [...pane.querySelectorAll("div")].filter((d) => d.className && String(d.className).includes("rounded") && d.textContent.trim().length > 4 && d.textContent.trim().length < 60 && !d.querySelector("div[class*='rounded']"));
  return rows.slice(0, 6).map((r) => ({ cls: r.className, text: r.textContent.trim().slice(0, 40) }));
})()`);
save();

// ---- LEG G: cleanup — trash the probe note, verify ZERO residue ----
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
    (b.textContent ?? "").includes(t) || (b.textContent ?? "").trim() === "s181probe").length,
  noNotesYet: document.querySelector("main")?.textContent?.includes("No notes yet") ?? false,
}), PROBE_TITLE);
save();
log("LEG G: residue", JSON.stringify(store.residue));

await ctx.close();
await browser.close();
log("PROBE COMPLETE — store at", OUT);
if (store.residue.probeRows !== 0) throw new Error("RESIDUE");
log("ZERO RESIDUE CONFIRMED");
