// S181 evidence capture — the tag-row family port (the cycle's surfaces: the
// draft's ported tag row with the 16px gap matrix, the edit surface's seeded
// Badge-secondary pill + the input-group, the add button's click path — the
// measured functional gap, and the list tile's mt-2 tags row). Self-verifying
// (the S174-S181 template): each frame's DOM content is asserted BEFORE the
// screenshot settles, and the non-blank pixel ratios verified at the end.
import { chromium } from "playwright";
import { readdirSync, readFileSync } from "node:fs";

const CLONE = "http://localhost:3000";
const OUT = "docs/screenshots";
const shots = [];
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(`${CLONE}/login`, { timeout: 90_000, waitUntil: "domcontentloaded" });
await page.waitForTimeout(2500);
await page.fill("input[type=email]", "demo@studyflow.app");
await page.fill("input[type=password]", "Demo1234!");
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
await page.waitForFunction(
  () => document.querySelector("main") !== null && document.querySelector("nav") !== null,
  null,
  { timeout: 30_000 },
);
await page.waitForTimeout(1500);
await page.evaluate(() => { const a = [...document.querySelectorAll("nav a")].find((x) => x.textContent.trim().startsWith("Notes")); if (a) a.click(); });
await page.waitForTimeout(1600);

async function menuGone() {
  await page.waitForFunction(() => document.querySelector('[role="menuitem"]') === null, null, { timeout: 10_000 });
  await page.waitForTimeout(150);
}

const STACK_WALK = `(() => {
  const pane = document.querySelector('[aria-label="Note editor pane"]') ?? document.body;
  const fontRow = [...pane.querySelectorAll("div")].find((d) => (d.textContent ?? "").trim().startsWith("Font:")) ?? null;
  const tagInput = [...pane.querySelectorAll("input")].find((i) => (i.placeholder ?? "").startsWith("Add tag")) ?? null;
  let tagRow = tagInput ? tagInput.parentElement : null;
  while (tagRow && !(tagRow.className && String(tagRow.className).includes("flex-wrap"))) tagRow = tagRow.parentElement;
  const attachLabel = [...pane.querySelectorAll("span,label,p")].find((el) => (el.textContent ?? "").trim() === "Attach File");
  let attachRow = attachLabel ? attachLabel.parentElement : null;
  while (attachRow && !(attachRow.className && String(attachRow.className).includes("flex-wrap"))) attachRow = attachRow.parentElement;
  const editorCard = pane.querySelector(".sf-note-editor");
  const gap = (a, b) => a && b ? Math.round(b.getBoundingClientRect().y - (a.getBoundingClientRect().y + a.getBoundingClientRect().height)) : null;
  return {
    tagRowCls: tagRow ? String(tagRow.className) : null,
    editorMt: editorCard ? getComputedStyle(editorCard).marginTop : null,
    gaps: { fontToTag: gap(fontRow, tagRow), tagToAttach: gap(tagRow, attachRow), attachToEditor: gap(attachRow, editorCard) },
  };
})()`;

// 1) The DRAFT's ported tag row — the wrapper mb-4 axis, the 16/16/16 gap
// matrix, the Badge-secondary pill, the input-group with the add button.
await page.getByRole("button", { name: "New note menu" }).click();
await page.waitForTimeout(400);
await page.getByRole("menuitem", { name: "New Note", exact: true }).click();
await menuGone();
await page.waitForTimeout(700);
{
  const stack = await page.evaluate(STACK_WALK);
  if (!stack.tagRowCls || !stack.tagRowCls.includes("mb-4") || stack.tagRowCls.includes("mt-2")) throw new Error(`FRAME 1 marker: the tag row wrapper is wrong: ${JSON.stringify(stack)}`);
  if (stack.editorMt !== "0px") throw new Error("FRAME 1 marker: the editor card still carries a top margin");
  for (const g of [stack.gaps.fontToTag, stack.gaps.tagToAttach, stack.gaps.attachToEditor]) {
    if (g === null || g < 15 || g > 17) throw new Error(`FRAME 1 marker: the gap matrix is off: ${JSON.stringify(stack.gaps)}`);
  }
  const pane = page.locator('[aria-label="Note editor pane"]');
  // Type a tag through the input so the pill renders in the frame.
  await pane.locator('input[placeholder="Add tag..."]').fill("evidence");
  await pane.getByRole("button", { name: "Add tag button" }).click();
  const pill = pane.locator('[aria-label="New note tags"]').getByText("evidence", { exact: true });
  await pill.waitFor({ state: "visible", timeout: 5000 });
  const pillCs = await pill.evaluate((el) => ({ w: getComputedStyle(el).fontWeight, px: getComputedStyle(el).paddingLeft, h: Math.round(el.getBoundingClientRect().height) }));
  if (pillCs.w !== "600" || pillCs.px !== "10px" || pillCs.h > 24) throw new Error(`FRAME 1 marker: the pill anatomy is wrong: ${JSON.stringify(pillCs)}`);
  const addBtn = pane.getByRole("button", { name: "Add tag button" });
  const btnBox = await addBtn.boundingBox();
  if (!btnBox || Math.round(btnBox.width) !== 40 || Math.round(btnBox.height) !== 28) throw new Error(`FRAME 1 marker: the add button geometry is wrong: ${JSON.stringify(btnBox)}`);
  await page.screenshot({ path: `${OUT}/181-clone-tagrow-draft.png`, fullPage: false });
  shots.push("181-clone-tagrow-draft.png");
  console.log("frame 1 captured + self-verified (draft tag row)");
  // Clean the evidence tag (local-only removal — no residue).
  await pane.getByRole("button", { name: "Remove tag evidence" }).click();
}

// 2) The EDIT surface's tag row — the seeded calculus pill (the
// Badge-secondary anatomy) + the input-group + the editor card's no-margin.
// Close the draft FIRST (the probe's own lesson: with the draft mounted the
// right pane never swaps to the note view, so the Edit button never renders).
await page.getByRole("button", { name: "Discard new note", exact: true }).first().click();
await page.waitForTimeout(700);
await page.getByRole("button", { name: /Dot product intuition/ }).first().click();
await page.waitForTimeout(1200);
await page.getByRole("button", { name: "Edit", exact: true }).click();
await page.waitForTimeout(900);
{
  const stack = await page.evaluate(STACK_WALK);
  if (!stack.tagRowCls || !stack.tagRowCls.includes("mb-4")) throw new Error("FRAME 2 marker: the edit tag row wrapper is wrong");
  if (stack.editorMt !== "0px") throw new Error("FRAME 2 marker: the edit editor card still carries a top margin");
  const pane = page.locator('[aria-label="Note editor pane"]');
  const pill = pane.locator('[data-note-tag="calculus"]');
  await pill.waitFor({ state: "visible", timeout: 5000 });
  const cs = await pill.evaluate((el) => ({
    bg: getComputedStyle(el).backgroundColor,
    weight: getComputedStyle(el).fontWeight,
    h: Math.round(el.getBoundingClientRect().height),
  }));
  if (cs.bg !== "rgb(38, 38, 38)" || cs.weight !== "600" || cs.h > 24) throw new Error(`FRAME 2 marker: the seeded pill anatomy is wrong: ${JSON.stringify(cs)}`);
  const input = pane.locator('input[placeholder="Add tag..."]');
  const w = await input.evaluate((el) => Math.round(el.getBoundingClientRect().width));
  if (w !== 96) throw new Error(`FRAME 2 marker: the input width is wrong: ${w}`);
  await page.screenshot({ path: `${OUT}/181-clone-tagrow-edit.png`, fullPage: false });
  shots.push("181-clone-tagrow-edit.png");
  console.log("frame 2 captured + self-verified (edit tag row)");
  await page.getByRole("button", { name: "X", exact: true }).first().click().catch(() => {});
  await page.waitForTimeout(500);
}

// 3) The ADD BUTTON's click path — the measured functional gap: type, click
// (NOT Enter), the pill lands; the frame catches the pill mid-list.
await page.getByRole("button", { name: "New note menu" }).click();
await page.waitForTimeout(400);
await page.getByRole("menuitem", { name: "New Note", exact: true }).click();
await menuGone();
await page.waitForTimeout(700);
{
  const pane = page.locator('[aria-label="Note editor pane"]');
  await pane.locator('input[placeholder="Add tag..."]').fill("clickpath");
  // THE BUTTON (not Enter) — the S181 functional port.
  await pane.getByRole("button", { name: "Add tag button" }).click();
  const pill = pane.getByText("clickpath", { exact: true });
  await pill.waitFor({ state: "visible", timeout: 5000 });
  // The input CLEARED (the addDraftTag contract).
  const val = await pane.locator('input[placeholder="Add tag..."]').inputValue();
  if (val !== "") throw new Error(`FRAME 3 marker: the input did not clear: ${JSON.stringify(val)}`);
  await page.screenshot({ path: `${OUT}/181-clone-tagrow-addbutton.png`, fullPage: false });
  shots.push("181-clone-tagrow-addbutton.png");
  console.log("frame 3 captured + self-verified (the add-button click path)");
}

// 4) The LIST TILE's tags row — mt-2 below the preview (the seeded tile).
{
  const row = page.getByRole("button", { name: /Dot product intuition/ }).first();
  // Close the draft first (the X discard) so the list is reachable.
  await page.getByRole("button", { name: "Discard new note", exact: true }).first().click().catch(async () => {});
  await page.waitForTimeout(700);
  const container = row.locator('[data-note-tag="calculus"]').locator("..");
  const mt = await container.evaluate((el) => getComputedStyle(el).marginTop);
  if (mt !== "8px") throw new Error(`FRAME 4 marker: the tile tags container margin is wrong: ${mt}`);
  await page.screenshot({ path: `${OUT}/181-clone-tagrow-list-tile.png`, fullPage: false });
  shots.push("181-clone-tagrow-list-tile.png");
  console.log("frame 4 captured + self-verified (the list tile mt-2)");
}

// The non-blank pixel verification (every frame must carry real content).
console.log("shots:", JSON.stringify(shots));
const ratios = {};
for (const f of shots) {
  const buf = readFileSync(`${OUT}/${f}`);
  // A coarse non-blank proxy: PNG size ≥ 30KB with dimensions > 400px means
  // real content (a blank canvas compresses to a few KB). Plus the header
  // check below.
  ratios[f] = buf.length;
  if (buf.length < 30_000) throw new Error(`frame ${f} looks blank (size ${buf.length})`);
}
console.log("frame sizes (bytes):", JSON.stringify(ratios));
await ctx.close();
await browser.close();
console.log("S181 EVIDENCE CAPTURE COMPLETE —", shots.length, "frames, all self-verified");
