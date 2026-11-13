// S181 clone-side probe — measure the clone's notes draft row stack with the
// SAME probe used on the reference (probe-s181-rows3.mjs's STACK): the gap
// matrix between the Font row / tag row / attach row / editor card. The
// flex-column parent means margins ADD (no collapse) — the clone's tag row
// carries mt-2 (no mb) so the tag→attach gap may be 0 (the flush defect).
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const CLONE = "http://localhost:3000";
const store = {};
const save = () => writeFileSync("/tmp/s181-clone-stack.json", JSON.stringify(store, null, 2));
const log = (...a) => { console.log(...a); };

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(`${CLONE}/login`, { timeout: 30_000, waitUntil: "domcontentloaded" });
await page.waitForFunction(
  () => {
    const btn = document.querySelector("button[type=submit]");
    return btn !== null && !btn.disabled;
  },
  null,
  { timeout: 30_000 },
);
await page.fill("input[type=email]", "demo@studyflow.app");
await page.fill("input[type=password]", "Demo1234!");
await page.click("button[type=submit]");
try {
  await page.waitForFunction(() => document.querySelector("nav a") !== null, null, { timeout: 12_000 });
} catch {
  // The hydration race (the S9 lesson): re-fill and re-submit once.
  await page.waitForTimeout(1500);
  await page.fill("input[type=email]", "demo@studyflow.app");
  await page.fill("input[type=password]", "Demo1234!");
  await page.click("button[type=submit]");
  await page.waitForFunction(() => document.querySelector("nav a") !== null, null, { timeout: 30_000 });
}
await page.waitForTimeout(1500);
await page.evaluate(() => {
  const a = [...document.querySelectorAll("nav a")].find((x) => x.textContent.trim().startsWith("Notes"));
  if (a) a.click();
});
await page.waitForTimeout(2500);

// Open the draft: the menu trigger, then the New Note item, then the
// menu-unmount wait (the EB3 lesson — Radix menus unmount async).
await page.locator('button[aria-label="New note menu"]').first().click();
await page.waitForTimeout(500);
await page.getByRole("menuitem", { name: "New Note", exact: true }).click();
await page.waitForFunction(() => !document.querySelector('[role="menuitem"]'), null, { timeout: 10_000 });
await page.waitForTimeout(900);

const STACK = `(() => {
  const pane = document.querySelector('[aria-label="Note editor pane"]') ?? document.querySelector("main") ?? document.body;
  const findRow = (pred) => [...pane.querySelectorAll("div")].find(pred) ?? null;
  const fontRow = findRow((d) => d.textContent.trim().startsWith("Font:"));
  const addTagInput = [...pane.querySelectorAll("input")].find((i) => (i.placeholder || "").startsWith("Add tag"));
  let tagRow = addTagInput ? addTagInput.parentElement : null;
  while (tagRow && !(tagRow.className && String(tagRow.className).includes("flex-wrap"))) tagRow = tagRow.parentElement;
  const attachLabel = [...pane.querySelectorAll("span,label,p")].find((el) => el.textContent.trim() === "Attach File");
  let attachRow = attachLabel ? attachLabel.parentElement : null;
  while (attachRow && !(attachRow.className && String(attachRow.className).includes("flex-wrap"))) attachRow = attachRow.parentElement;
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
      fontRow: fontRow ? { cls: cls(fontRow), geo: geo(fontRow) } : null,
      tagRow: tagRow ? { cls: cls(tagRow), geo: geo(tagRow), inputCls: addTagInput ? addTagInput.className : null } : null,
      attachRow: attachRow ? { cls: cls(attachRow), geo: geo(attachRow) } : null,
      editorCard: editorCard ? { cls: cls(editorCard), geo: geo(editorCard) } : null,
    },
    gaps: {
      fontToTag: gap(fontRow, tagRow),
      tagToAttach: gap(tagRow, attachRow),
      attachToEditor: gap(attachRow, editorCard),
    },
  };
})()`;
store.cloneDraftStack = await page.evaluate(STACK);
save();
log("clone draft stack:", JSON.stringify(store.cloneDraftStack, null, 1));
// Close the draft (the X discard) so the right pane can show the note view.
await page.locator('button[aria-label="Discard new note"]').first().click();
await page.waitForTimeout(700);

// The clone's tag pill + input (the seeded "calculus" pill on the EDIT surface).
await page.waitForFunction(() => [...document.querySelectorAll("button")].some((b) => (b.textContent ?? "").includes("Dot product intuition")), null, { timeout: 20_000 });
await page.getByRole("button", { name: /Dot product intuition/ }).first().click();
await page.waitForTimeout(1200);
await page.getByRole("button", { name: "Edit", exact: true }).first().click();
await page.waitForTimeout(900);
store.cloneEditStack = await page.evaluate(STACK);
save();
log("clone edit stack:", JSON.stringify(store.cloneEditStack, null, 1));
store.cloneTagDetails = await page.evaluate(`(() => {
  const pane = document.querySelector('[aria-label="Note editor pane"]') ?? document.body;
  const pill = pane.querySelector('[aria-label="Note tags"] span');
  const addTagInput = [...pane.querySelectorAll("input")].find((i) => (i.placeholder || "").startsWith("Add tag"));
  const row = addTagInput ? addTagInput.parentElement : null;
  const pillCs = pill ? getComputedStyle(pill) : null;
  return {
    pillCls: pill ? pill.className : null,
    pillH: pill ? Math.round(pill.getBoundingClientRect().height) : null,
    pillWeight: pillCs ? pillCs.fontWeight : null,
    pillPx: pillCs ? pillCs.paddingLeft : null,
    inputCls: addTagInput ? addTagInput.className : null,
    inputW: addTagInput ? Math.round(addTagInput.getBoundingClientRect().width) : null,
    inputH: addTagInput ? Math.round(addTagInput.getBoundingClientRect().height) : null,
    rowCls: row ? row.className : null,
  };
})()`);
save();
log("clone tag details:", JSON.stringify(store.cloneTagDetails, null, 1));

await ctx.close();
await browser.close();
log("CLONE PROBE COMPLETE");
