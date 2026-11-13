// S180 micro-probe — the remaining unmeasured positions: the draft row order
// (Font/Attach/tag), the edit row order, and the coding note's VIEW mode
// (the Attachments section on a coding note). Zero residue at the end.
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const REF = "https://omni-study1.base44.app";
const store = {};
const save = () => writeFileSync("/tmp/s180-probe3.json", JSON.stringify(store, null, 2));
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
await page.waitForTimeout(1500);
await page.evaluate(() => {
  const a = [...document.querySelectorAll("nav a")].find((x) => x.textContent.trim().startsWith("Notes"));
  if (a) a.click();
});
await page.waitForTimeout(2500);

// ---- the text draft row order ----
await page.locator("button:has(svg.lucide-plus)").first().click();
await page.waitForTimeout(700);
await page.getByRole("menuitem", { name: "New Note", exact: true }).click();
await page.waitForFunction(() => !document.querySelector('[role="menuitem"]'), null, { timeout: 10_000 });
await page.waitForTimeout(900);
store.draftRowOrder = await page.evaluate(() => {
  const main = document.querySelector("main") ?? document.body;
  const flexRows = [...main.querySelectorAll("div")].filter((d) => {
    if (!(d.className && typeof d.className === "string")) return false;
    return /^flex items-center gap-\d mb-4/.test(d.className) || /Add tag/.test(d.textContent ?? "");
  });
  const rows = flexRows
    .filter((d) => d.parentElement === (flexRows.find((x) => x.contains(d))?.parentElement ?? d.parentElement))
    .slice(0, 8);
  return rows.map((d) => ({
    cls: d.className,
    leads: (d.textContent ?? "").trim().slice(0, 28),
  }));
});
// fallback: simpler walk — the editor pane's direct children classes
store.draftPaneChildren = await page.evaluate(() => {
  const label = [...document.querySelectorAll("span")].find((el) => el.textContent.trim() === "Attach File");
  const row = label?.closest("div");
  const pane = row?.parentElement;
  return pane ? [...pane.children].map((c) => ({
    tag: c.tagName,
    cls: String(c.className).slice(0, 60),
    text: (c.textContent ?? "").trim().slice(0, 24),
  })) : null;
});
save();
console.log("draft pane children:", JSON.stringify(store.draftPaneChildren, null, 1));
await page.getByRole("button", { name: "X", exact: true }).first().click().catch(() => {});
await page.waitForTimeout(600);

// ---- the coding draft + save it to inspect the coding VIEW section ----
await page.locator("button:has(svg.lucide-plus)").first().click();
await page.waitForTimeout(700);
await page.getByRole("menuitem", { name: /New Coding Note/i }).click();
await page.waitForFunction(() => !document.querySelector('[role="menuitem"]'), null, { timeout: 10_000 });
await page.waitForTimeout(900);
writeFileSync("/tmp/s180-probe-file3.txt", "s180 probe 3 coding payload\n");
await page.setInputFiles("input[type=file]", "/tmp/s180-probe-file3.txt");
await page.waitForTimeout(3500);
store.codingDraftPane = await page.evaluate(() => {
  const label = [...document.querySelectorAll("span")].find((el) => el.textContent.trim() === "Attach File");
  const row = label?.closest("div");
  const pane = row?.parentElement;
  return pane ? [...pane.children].map((c) => ({
    tag: c.tagName,
    cls: String(c.className).slice(0, 60),
    text: (c.textContent ?? "").trim().slice(0, 24),
  })) : null;
});
save();
console.log("coding draft pane:", JSON.stringify(store.codingDraftPane, null, 1));
await page.fill("input[placeholder*='Title' i], input[placeholder*='title' i]", "S180 Coding Probe");
await page.waitForTimeout(300);
await page.getByRole("button", { name: "Save", exact: true }).first().click();
await page.waitForTimeout(3500);
store.codingViewSection = await page.evaluate(() => {
  const h = [...document.querySelectorAll("p,div")].find((el) => el.textContent.trim() === "Attachments");
  const section = h ? h.parentElement : null;
  return {
    sectionPresent: !!section,
    sectionClasses: section?.className ?? null,
    sectionSibling: section?.previousElementSibling?.className ?? null,
    pills: section ? section.querySelectorAll("a").length : 0,
  };
});
save();
console.log("coding view section:", JSON.stringify(store.codingViewSection));

// ---- the edit row order on the coding note ----
await page.getByRole("button", { name: "Edit", exact: true }).click();
await page.waitForTimeout(1000);
store.codingEditPane = await page.evaluate(() => {
  const label = [...document.querySelectorAll("span")].find((el) => el.textContent.trim() === "Attach File");
  const row = label?.closest("div");
  const pane = row?.parentElement;
  return pane ? [...pane.children].map((c) => ({
    tag: c.tagName,
    cls: String(c.className).slice(0, 60),
    text: (c.textContent ?? "").trim().slice(0, 24),
  })) : null;
});
save();
console.log("coding edit pane:", JSON.stringify(store.codingEditPane, null, 1));
await page.getByRole("button", { name: "X", exact: true }).first().click().catch(() => {});
await page.waitForTimeout(600);

// ---- cleanup ----
for (let round = 0; round < 5; round++) {
  const present = await page.evaluate(() =>
    [...document.querySelectorAll("button")].some((b) => b.textContent.includes("S180 Coding Probe")));
  if (!present) break;
  await page.locator("button", { hasText: "S180 Coding Probe" }).first().click();
  await page.waitForTimeout(1300);
  await page.locator("button:has(svg.lucide-trash2), button:has(svg.lucide-trash)").last().click().catch(() => {});
  await page.waitForTimeout(2500);
}
store.residue = await page.evaluate(() => ({
  probeRows: [...document.querySelectorAll("button")].filter((b) =>
    b.textContent.includes("S180 Coding Probe") || b.textContent.includes("S180 Attach Probe")).length,
}));
save();
await ctx.close(); await browser.close();
console.log("residue:", JSON.stringify(store.residue));
if (store.residue.probeRows !== 0) throw new Error("RESIDUE");
console.log("MICRO-PROBE COMPLETE — zero residue");
