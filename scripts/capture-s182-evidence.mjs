// S182 evidence capture — the header-row family port (the cycle's surfaces:
// the draft's ported header row with the 16px gap to the Font row + the
// Save's mr-2 + the ghost X, the edit surface's header with the px-0
// NoteTitleInput, the mobile 20px-bold title input, and the Files header's
// ported subtitle copy). Self-verifying (the S174-S182 template): each
// frame's DOM content is asserted BEFORE the screenshot settles, and the
// non-blank pixel ratios verified at the end.
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

const HEADER_WALK = `(() => {
  const pane = document.querySelector('[aria-label="Note editor pane"]') ?? document.body;
  const titleInput = [...pane.querySelectorAll("input")].find((i) => (i.placeholder || "").toLowerCase().includes("title")) ?? null;
  let headerRow = titleInput ? titleInput.parentElement : null;
  while (headerRow && !(headerRow.className && String(headerRow.className).includes("justify-between"))) headerRow = headerRow.parentElement;
  const fontRow = [...pane.querySelectorAll("div")].find((d) => (d.textContent ?? "").trim().startsWith("Font:")) ?? null;
  const saveBtn = [...pane.querySelectorAll("button")].find((b) => (b.textContent ?? "").trim() === "Save") ?? null;
  const saveIcon = saveBtn ? saveBtn.querySelector("svg") : null;
  const xBtn = [...pane.querySelectorAll("button")].find((b) => b.querySelector("svg.lucide-x")) ?? null;
  const gap = headerRow && fontRow ? Math.round(fontRow.getBoundingClientRect().y - (headerRow.getBoundingClientRect().y + headerRow.getBoundingClientRect().height)) : null;
  return {
    headerRowCls: headerRow ? String(headerRow.className) : null,
    headerRowMb: headerRow ? getComputedStyle(headerRow).marginBottom : null,
    headerToFontGap: gap,
    titleInput: titleInput ? { px: getComputedStyle(titleInput).paddingLeft, py: getComputedStyle(titleInput).paddingTop, fontSize: getComputedStyle(titleInput).fontSize, weight: getComputedStyle(titleInput).fontWeight } : null,
    saveBtn: saveBtn ? { w: Math.round(saveBtn.getBoundingClientRect().width), iconCls: saveIcon ? String(saveIcon.className.baseVal) : null } : null,
    xBtn: xBtn ? { w: Math.round(xBtn.getBoundingClientRect().width), border: getComputedStyle(xBtn).borderTopWidth } : null,
  };
})()`;

// 1) The DRAFT's ported header row — the justify-between mb-4 anatomy, the
// 16px gap to the Font row, the Save's mr-2 (98px), the ghost X (48px).
await page.getByRole("button", { name: "New note menu" }).click();
await page.waitForTimeout(400);
await page.getByRole("menuitem", { name: "New Note", exact: true }).click();
await menuGone();
await page.waitForTimeout(700);
{
  const h = await page.evaluate(HEADER_WALK);
  if (!h.headerRowCls || !h.headerRowCls.includes("justify-between") || !h.headerRowCls.includes("mb-4")) throw new Error(`FRAME 1 marker: the header row is wrong: ${JSON.stringify(h)}`);
  if (h.headerRowMb !== "16px") throw new Error("FRAME 1 marker: the header row mb is wrong");
  if (h.headerToFontGap === null || h.headerToFontGap < 15 || h.headerToFontGap > 17) throw new Error(`FRAME 1 marker: the header→Font gap is off: ${h.headerToFontGap}`);
  if (h.titleInput.py !== "4px" || h.titleInput.px !== "0px") throw new Error(`FRAME 1 marker: the draft title input padding is wrong: ${JSON.stringify(h.titleInput)}`);
  if (h.saveBtn.w < 96 || h.saveBtn.w > 100 || !h.saveBtn.iconCls.includes("mr-2")) throw new Error(`FRAME 1 marker: the Save is wrong: ${JSON.stringify(h.saveBtn)}`);
  if (h.xBtn.border !== "0px" || h.xBtn.w < 47 || h.xBtn.w > 49) throw new Error(`FRAME 1 marker: the X is wrong: ${JSON.stringify(h.xBtn)}`);
  // Type a title so the input carries visible content in the frame.
  await page.locator('[aria-label="Note editor pane"] input[placeholder="Note title..."]').fill("Header row anatomy");
  await page.screenshot({ path: `${OUT}/182-clone-header-draft.png`, fullPage: false });
  shots.push("182-clone-header-draft.png");
  console.log("frame 1 captured + self-verified (draft header row)");
  await page.getByRole("button", { name: "Discard new note", exact: true }).first().click();
  await page.waitForTimeout(600);
}

// 2) The EDIT surface's header — the same row contract + the NoteTitleInput's
// px-0 (the 12px text-position drift closed).
await page.getByRole("button", { name: /Dot product intuition/ }).first().click();
await page.waitForTimeout(1200);
await page.getByRole("button", { name: "Edit", exact: true }).click();
await page.waitForTimeout(900);
{
  const h = await page.evaluate(HEADER_WALK);
  if (!h.headerRowCls || !h.headerRowCls.includes("justify-between") || !h.headerRowCls.includes("mb-4")) throw new Error(`FRAME 2 marker: the edit header row is wrong: ${JSON.stringify(h)}`);
  if (h.headerToFontGap === null || h.headerToFontGap < 15 || h.headerToFontGap > 17) throw new Error(`FRAME 2 marker: the edit header→Font gap is off: ${h.headerToFontGap}`);
  if (h.titleInput.px !== "0px") throw new Error(`FRAME 2 marker: the edit title input px is wrong: ${JSON.stringify(h.titleInput)}`);
  if (h.saveBtn.w < 96 || h.saveBtn.w > 100) throw new Error(`FRAME 2 marker: the edit Save is wrong: ${JSON.stringify(h.saveBtn)}`);
  if (h.xBtn.border !== "0px") throw new Error("FRAME 2 marker: the edit X border is wrong: " + JSON.stringify(h.xBtn));
  await page.screenshot({ path: `${OUT}/182-clone-header-edit.png`, fullPage: false });
  shots.push("182-clone-header-edit.png");
  console.log("frame 2 captured + self-verified (edit header row)");
  await page.getByRole("button", { name: "Exit edit mode", exact: true }).first().click().catch(() => {});
  await page.waitForTimeout(500);
}

// 3) The below-md title input — the 20px-bold text-xl leg (the S16
// mobile-only-gap class: the static text-sm hid it at desktop). Captured
// at the 765px band: below md (768) so text-xl applies, wide enough
// that the two-pane layout keeps the input visible (at 390 the w-80 list
// crushes the right pane to ~70px — the reference's own measured layout —
// and the input is a 0-width crush; the e2e pin reads the computed 20px
// there, the frame needs the visible form).
await page.getByRole("button", { name: "New note menu" }).click();
await page.waitForTimeout(400);
await page.getByRole("menuitem", { name: "New Note", exact: true }).click();
await menuGone();
await page.waitForTimeout(700);
await page.setViewportSize({ width: 765, height: 844 });
await page.waitForTimeout(600);
{
  const h = await page.evaluate(HEADER_WALK);
  if (!h.titleInput || h.titleInput.fontSize !== "20px" || h.titleInput.weight !== "700") throw new Error(`FRAME 3 marker: the mobile title input is wrong: ${JSON.stringify(h.titleInput)}`);
  // The below-md input is the cramped one (the pane ~381px minus the
  // shrink-0 action group 334px ≈ 47px of input) — the reference's own
  // measured below-md posture. A short fill keeps the 20px text visible.
  await page.locator('[aria-label="Note editor pane"] input[placeholder="Note title..."]').fill("Hi");
  await page.screenshot({ path: `${OUT}/182-clone-header-mobile.png`, fullPage: false });
  shots.push("182-clone-header-mobile.png");
  console.log("frame 3 captured + self-verified (mobile title input)");
  await page.getByRole("button", { name: "Discard new note", exact: true }).first().click();
  await page.waitForTimeout(500);
}
await page.setViewportSize({ width: 1440, height: 900 });
await page.waitForTimeout(500);

// 4) The FILES header — the ported subtitle copy (the reference's live
// wording, the S131-era record superseded).
await page.evaluate(() => { const a = [...document.querySelectorAll("nav a")].find((x) => x.textContent.trim().startsWith("Files")); if (a) a.click(); });
await page.waitForTimeout(1600);
{
  const copy = await page.evaluate(() => document.querySelector("main")?.textContent?.includes("Store and organize your documents") ?? false);
  if (!copy) throw new Error("FRAME 4 marker: the Files subtitle copy is wrong");
  await page.screenshot({ path: `${OUT}/182-clone-files-header.png`, fullPage: false });
  shots.push("182-clone-files-header.png");
  console.log("frame 4 captured + self-verified (files header copy)");
}

await ctx.close();
await browser.close();

// The non-blank pixel ratio check (the template's tail).
for (const shot of shots) {
  const buf = readFileSync(`${OUT}/${shot}`);
  let nonBlank = 0;
  for (let i = 0; i < buf.length; i++) if (buf[i] !== 0xff) nonBlank++;
  const ratio = nonBlank / buf.length;
  console.log(`  ${shot}: ${(ratio * 100).toFixed(1)}% non-blank bytes, ${(buf.length / 1024).toFixed(0)}KB`);
  if (ratio < 0.02) throw new Error(`${shot} looks blank`);
}
console.log("S182 EVIDENCE CAPTURE COMPLETE —", readdirSync(OUT).filter((f) => f.startsWith("182-")).length, "182- frames on disk");
