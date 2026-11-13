// S181 probe 4 — the final micro-pass: (1) the tag row's FULL children dump
// (the S177 record names an "h-7 px-3 add button" beside the "Add tag..."
// input — an input-group the clone may lack), (2) the saved note's VIEW-mode
// tag pills (probe 1 caught the container `flex flex-wrap gap-1 mt-2` — the
// pills inside it + their position in the view), (3) the edit-surface tag row
// children. Incremental saves to /tmp/s181-probe4.json. Zero residue.
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const REF = "https://omni-study1.base44.app";
const store = {};
const save = () => writeFileSync("/tmp/s181-probe4.json", JSON.stringify(store, null, 2));
const log = (...a) => { console.log(...a); };
const PROBE_TITLE = "S181 Row Probe 4";

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

// ---- (1) the draft tag row full children ----
await page.locator("button:has(svg.lucide-plus)").first().click();
await page.waitForTimeout(600);
await page.getByRole("menuitem", { name: "New Note", exact: true }).click();
await page.waitForFunction(() => !document.querySelector('[role="menuitem"]'), null, { timeout: 10_000 });
await page.waitForTimeout(900);
store.draftTagRowChildren = await page.evaluate(`(() => {
  const pane = document.querySelector("main") ?? document.body;
  const addTagInput = [...pane.querySelectorAll("input")].find((i) => (i.placeholder || "").startsWith("Add tag"));
  if (!addTagInput) return { note: "no input" };
  let row = addTagInput.parentElement;
  while (row && !(row.className && String(row.className).includes("flex-wrap"))) row = row.parentElement;
  const kids = [...row.children].map((c) => {
    const r = c.getBoundingClientRect();
    return {
      tag: c.tagName,
      cls: String(c.className).slice(0, 110),
      text: (c.textContent ?? "").trim().slice(0, 24),
      w: Math.round(r.width), h: Math.round(r.height),
    };
  });
  // The input's own group (the wrapper between the row and the input).
  let group = addTagInput.parentElement;
  const groupDump = group && group !== row ? {
    cls: String(group.className),
    kids: [...group.children].map((c) => ({
      tag: c.tagName, cls: String(c.className).slice(0, 110),
      text: (c.textContent ?? "").trim().slice(0, 20),
      w: Math.round(c.getBoundingClientRect().width), h: Math.round(c.getBoundingClientRect().height),
      svg: c.querySelector("svg") ? c.querySelector("svg").getAttribute("class") : null,
      variant: c.tagName === "BUTTON" ? "button" : null,
    })),
  } : null;
  return { rowCls: row.className, children: kids, group: groupDump };
})()`);
save();
log("draft tag row children:", JSON.stringify(store.draftTagRowChildren, null, 1));
await page.getByRole("button", { name: "X", exact: true }).first().click().catch(() => {});
await page.waitForTimeout(600);

// ---- (2) the saved view's tag pills ----
await page.locator("button:has(svg.lucide-plus)").first().click();
await page.waitForTimeout(600);
await page.getByRole("menuitem", { name: "New Note", exact: true }).click();
await page.waitForFunction(() => !document.querySelector('[role="menuitem"]'), null, { timeout: 10_000 });
await page.waitForTimeout(900);
await page.locator('input[placeholder^="Add tag"]').fill("s181p4");
await page.keyboard.press("Enter");
await page.waitForTimeout(400);
await page.locator('input[placeholder*="Title" i], input[placeholder*="title" i]').first().fill(PROBE_TITLE);
await page.getByRole("button", { name: "Save", exact: true }).first().click();
await page.waitForTimeout(3500);
store.savedViewTags = await page.evaluate(`(() => {
  const pane = document.querySelector("main") ?? document.body;
  // The view-mode tags: the container holding the pill that reads s181p4.
  const pill = [...pane.querySelectorAll("span, div")].find((el) => el.childElementCount <= 2 && el.textContent.trim() === "s181p4" && !el.querySelector("input"));
  if (!pill) return { note: "no pill found in view" };
  const s = getComputedStyle(pill);
  let cont = pill.parentElement;
  const contCls = cont ? cont.className : null;
  const contS = cont ? getComputedStyle(cont) : null;
  // Where does the container sit? Its previous sibling (the title?) and next sibling.
  return {
    pillCls: pill.className,
    pillBg: s.backgroundColor, pillColor: s.color, pillRadius: s.borderRadius, pillSize: s.fontSize,
    pillWeight: s.fontWeight, pillH: Math.round(pill.getBoundingClientRect().height), pillPx: s.paddingLeft,
    containerCls: contCls,
    containerMt: contS ? contS.marginTop : null, containerGap: contS ? contS.gap : null,
    prevSiblingCls: cont?.previousElementSibling?.className ?? null,
    prevSiblingText: cont?.previousElementSibling?.textContent?.trim().slice(0, 30) ?? null,
    nextSiblingCls: cont?.nextElementSibling?.className ?? null,
  };
})()`);
save();
log("saved view tags:", JSON.stringify(store.savedViewTags, null, 1));

// ---- (3) the edit-surface tag row children ----
await page.locator('button:has-text("Edit")').first().click();
await page.waitForTimeout(1100);
store.editTagRowChildren = await page.evaluate(`(() => {
  const pane = document.querySelector("main") ?? document.body;
  const addTagInput = [...pane.querySelectorAll("input")].find((i) => (i.placeholder || "").startsWith("Add tag"));
  if (!addTagInput) return { note: "no input" };
  let row = addTagInput.parentElement;
  while (row && !(row.className && String(row.className).includes("flex-wrap"))) row = row.parentElement;
  return { rowCls: row.className, children: [...row.children].map((c) => ({ tag: c.tagName, cls: String(c.className).slice(0, 90), text: (c.textContent ?? "").trim().slice(0, 20) })) };
})()`);
save();
log("edit tag row children:", JSON.stringify(store.editTagRowChildren, null, 1));
await page.getByRole("button", { name: "X", exact: true }).first().click().catch(() => {});
await page.waitForTimeout(600);

// ---- cleanup ----
await page.waitForTimeout(400);
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
if (store.residue.probeRows !== 0) throw new Error("RESIDUE");
log("PROBE 4 COMPLETE — ZERO RESIDUE");
