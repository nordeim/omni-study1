// S181 probe 5 — the final micro-pass: (1) the tag row's ADD BUTTON variant
// (probe 4 caught its shape h-7 px-3 + Plus w-3 h-3 but not its variant
// colors), (2) the list-tile tag pill classes (the container is
// `flex flex-wrap gap-1 mt-2`; the pills inside it). Incremental saves.
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const REF = "https://omni-study1.base44.app";
const store = {};
const save = () => writeFileSync("/tmp/s181-probe5.json", JSON.stringify(store, null, 2));
const log = (...a) => { console.log(...a); };
const PROBE_TITLE = "S181 Row Probe 5";

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

// ---- (1) the add button in the draft tag row ----
await page.locator("button:has(svg.lucide-plus)").first().click();
await page.waitForTimeout(600);
await page.getByRole("menuitem", { name: "New Note", exact: true }).click();
await page.waitForFunction(() => !document.querySelector('[role="menuitem"]'), null, { timeout: 10_000 });
await page.waitForTimeout(900);
store.addButton = await page.evaluate(`(() => {
  const pane = document.querySelector("main") ?? document.body;
  const addTagInput = [...pane.querySelectorAll("input")].find((i) => (i.placeholder || "").startsWith("Add tag"));
  if (!addTagInput) return { note: "no input" };
  let group = addTagInput.parentElement;
  while (group && group.children.length < 2) group = group.parentElement;
  const btn = group ? [...group.querySelectorAll("button")].find((b) => b.querySelector("svg.lucide-plus")) : null;
  if (!btn) return { note: "no add button" };
  const s = getComputedStyle(btn);
  return {
    cls: btn.className,
    bg: s.backgroundColor, color: s.color, border: s.borderTopColor + " " + s.borderTopWidth,
    h: Math.round(btn.getBoundingClientRect().height), w: Math.round(btn.getBoundingClientRect().width),
    radius: s.borderRadius, shadow: s.boxShadow.slice(0, 50),
    ariaLabel: btn.getAttribute("aria-label"),
    type: btn.getAttribute("type"),
  };
})()`);
save();
log("add button:", JSON.stringify(store.addButton, null, 1));
await page.getByRole("button", { name: "X", exact: true }).first().click().catch(() => {});
await page.waitForTimeout(600);

// ---- (2) the list-tile tag pills (save a note with a tag, read the tile) ----
await page.locator("button:has(svg.lucide-plus)").first().click();
await page.waitForTimeout(600);
await page.getByRole("menuitem", { name: "New Note", exact: true }).click();
await page.waitForFunction(() => !document.querySelector('[role="menuitem"]'), null, { timeout: 10_000 });
await page.waitForTimeout(900);
await page.locator('input[placeholder^="Add tag"]').fill("s181p5");
await page.keyboard.press("Enter");
await page.waitForTimeout(400);
await page.locator('input[placeholder*="Title" i], input[placeholder*="title" i]').first().fill(PROBE_TITLE);
await page.getByRole("button", { name: "Save", exact: true }).first().click();
await page.waitForTimeout(3500);
store.listTilePills = await page.evaluate(`(() => {
  const pane = document.querySelector("main") ?? document.body;
  // The list tile: the selected note's tile carries bg-violet-50.
  const tile = [...pane.querySelectorAll("div")].find((d) => d.className && String(d.className).includes("bg-violet-50"));
  if (!tile) return { note: "no tile" };
  const cont = [...tile.querySelectorAll("div, p")].find((el) => el.className && String(el.className).includes("flex-wrap"));
  const pills = cont ? [...cont.children].map((c) => {
    const s = getComputedStyle(c);
    return {
      tag: c.tagName, cls: c.className,
      bg: s.backgroundColor, color: s.color, radius: s.borderRadius,
      size: s.fontSize, weight: s.fontWeight,
      h: Math.round(c.getBoundingClientRect().height), px: s.paddingLeft, py: s.paddingTop,
    };
  }) : null;
  return { tileCls: tile.className, containerCls: cont ? cont.className : null, pills };
})()`);
save();
log("list tile pills:", JSON.stringify(store.listTilePills, null, 1));

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
log("PROBE 5 COMPLETE — ZERO RESIDUE");
