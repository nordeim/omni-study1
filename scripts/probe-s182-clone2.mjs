// S182 clone micro-probe — the draft Save/X buttons' computed anatomy vs the
// reference record (/tmp/s182-probe2.json): isolates the Save's 8px width
// drift (px/py/gap/icon/text widths) and the X's border drift.
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const CLONE = "http://localhost:3000";
const store = {};
const save = () => writeFileSync("/tmp/s182-clone2.json", JSON.stringify(store, null, 2));

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
await page.locator("button:has(svg.lucide-plus)").first().click();
await page.waitForTimeout(600);
await page.getByRole("menuitem", { name: "New Note", exact: true }).click();
await page.waitForFunction(() => !document.querySelector('[role="menuitem"]'), null, { timeout: 10_000 });
await page.waitForTimeout(900);

store.cloneMicro = await page.evaluate(`(() => {
  const pane = document.querySelector("main") ?? document.body;
  const full = (el) => el ? {
    cls: String(el.className),
    w: Math.round(el.getBoundingClientRect().width), h: Math.round(el.getBoundingClientRect().height),
    px: getComputedStyle(el).paddingLeft, py: getComputedStyle(el).paddingTop,
    gap: getComputedStyle(el).gap, fontSize: getComputedStyle(el).fontSize,
    border: getComputedStyle(el).border.slice(0, 40), letterSpacing: getComputedStyle(el).letterSpacing,
    fontFamily: getComputedStyle(el).fontFamily.slice(0, 60),
  } : null;
  const saveBtn = [...pane.querySelectorAll("button")].find((b) => b.textContent.trim() === "Save");
  const xBtn = [...pane.querySelectorAll("button")].find((b) => b.querySelector("svg.lucide-x"));
  const kids = (el) => el ? [...el.childNodes].map((n) => {
    if (n.tagName === 'svg') return { svg: true, w: Math.round(n.getBoundingClientRect().width) };
    if (n.nodeType === 3) return { text: n.textContent, w: 0 };
    if (n.tagName === 'SPAN' || n.tagName === 'DIV') return { span: true, w: Math.round(n.getBoundingClientRect().width), text: n.textContent };
    return { other: n.tagName };
  }) : null;
  // A range measurement of the text width.
  const textW = (el) => {
    if (!el) return null;
    const range = document.createRange();
    range.selectNodeContents(el);
    return Math.round(range.getBoundingClientRect().width);
  };
  return {
    saveBtn: full(saveBtn), saveKids: kids(saveBtn), saveTextW: textW(saveBtn),
    xBtn: full(xBtn),
  };
})()`);
save();
console.log(JSON.stringify(store.cloneMicro, null, 1));

await page.getByRole("button", { name: "X", exact: true }).first().click().catch(() => {});
await page.waitForTimeout(500);
await ctx.close();
await browser.close();
console.log("CLONE MICRO COMPLETE");
