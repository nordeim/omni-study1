// S182 probe 3 — the ref Save/X buttons' child anatomy (icon width, text
// width) to close the 8px Save-width question, plus the X's icon size and
// the palette trigger's full class. Incremental saves to /tmp/s182-probe3.json.
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const REF = "https://omni-study1.base44.app";
const store = {};
const save = () => writeFileSync("/tmp/s182-probe3.json", JSON.stringify(store, null, 2));

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
await page.locator("button:has(svg.lucide-plus)").first().click();
await page.waitForTimeout(600);
await page.getByRole("menuitem", { name: "New Note", exact: true }).click();
await page.waitForFunction(() => !document.querySelector('[role="menuitem"]'), null, { timeout: 10_000 });
await page.waitForTimeout(900);

store.refBtnKids = await page.evaluate(`(() => {
  const pane = document.querySelector("main") ?? document.body;
  const saveBtn = [...pane.querySelectorAll("button")].find((b) => b.textContent.trim() === "Save");
  const xBtn = [...pane.querySelectorAll("button")].find((b) => b.querySelector("svg.lucide-x"));
  const paletteBtn = [...pane.querySelectorAll("button")].find((b) => b.querySelector("svg.lucide-palette"));
  const textW = (el) => {
    const range = document.createRange();
    range.selectNodeContents(el);
    return Math.round(range.getBoundingClientRect().width);
  };
  const describe = (btn) => {
    if (!btn) return null;
    const kids = [...btn.childNodes].map((n) => {
      if (n.tagName === 'svg') return { svg: true, cls: String(n.className.baseVal ?? n.className), w: Math.round(n.getBoundingClientRect().width), h: Math.round(n.getBoundingClientRect().height) };
      if (n.nodeType === 3) return { text: n.textContent };
      if (n.tagName) return { tag: n.tagName, w: Math.round(n.getBoundingClientRect().width) };
      return null;
    }).filter(Boolean);
    return {
      w: Math.round(btn.getBoundingClientRect().width),
      px: getComputedStyle(btn).paddingLeft, gap: getComputedStyle(btn).gap,
      fontSize: getComputedStyle(btn).fontSize, weight: getComputedStyle(btn).fontWeight,
      letterSpacing: getComputedStyle(btn).letterSpacing,
      fontFamily: getComputedStyle(btn).fontFamily.slice(0, 80),
      kids, rangeW: textW(btn),
    };
  };
  return { saveBtn: describe(saveBtn), xBtn: describe(xBtn), paletteBtn: describe(paletteBtn) };
})()`);
save();
console.log(JSON.stringify(store.refBtnKids, null, 1));

await page.getByRole("button", { name: "X", exact: true }).first().click().catch(() => {});
await page.waitForTimeout(500);
store.residue = await page.evaluate(() => ({
  noNotesYet: document.querySelector("main")?.textContent?.includes("No notes yet") ?? false,
}));
save();
await ctx.close();
await browser.close();
console.log("PROBE 3 COMPLETE", JSON.stringify(store.residue));
