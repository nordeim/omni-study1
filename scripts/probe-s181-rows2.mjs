// S181 probe 2 — the diagnostic pass: (1) the reference's THEME state (probe 1
// read muted-foreground ≈ rgb(250,250,250) — the DARK-theme value; every
// measurement must name its mode), (2) the tag row/pill/input anatomy with
// corrected selectors (probe 1 matched the ROW wrapper as the "pill"), (3) the
// Settings tab switch (probe 1's click never left the Appearance tab).
// Incremental saves to /tmp/s181-probe2.json. Zero residue at the end.
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const REF = "https://omni-study1.base44.app";
const store = {};
const save = () => writeFileSync("/tmp/s181-probe2.json", JSON.stringify(store, null, 2));
const log = (...a) => { console.log(...a); };

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

// ---- (1) the theme state ----
store.themeState = await page.evaluate(`(() => {
  const html = document.documentElement;
  const body = document.body;
  return {
    htmlClass: html.className,
    bodyBg: getComputedStyle(body).backgroundColor,
    cardBg: (() => { const c = document.querySelector(".rounded-xl, [class*='bg-card']"); return c ? getComputedStyle(c).backgroundColor : null; })(),
    mutedFg: (() => { const el = document.querySelector("input"); return el ? getComputedStyle(el).color : null; })(),
  };
})()`);
save();
log("theme state:", JSON.stringify(store.themeState));

// ---- (2) the notes tag anatomy (corrected selectors) ----
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
await page.locator('input[placeholder^="Add tag"]').fill("s181p2");
await page.keyboard.press("Enter");
await page.waitForTimeout(400);
store.tagAnatomy = await page.evaluate(`(() => {
  const pane = document.querySelector("main") ?? document.body;
  const addTagInput = [...pane.querySelectorAll("input")].find((i) => (i.placeholder || "").startsWith("Add tag"));
  if (!addTagInput) return { note: "no Add tag input" };
  // The tag ROW wrapper: the closest ancestor that carries the flex-wrap.
  let row = addTagInput.parentElement;
  while (row && !(row.className && String(row.className).includes("flex-wrap"))) row = row.parentElement;
  // The PILL: inside the row, the element whose text is exactly the tag.
  const pill = [...row.querySelectorAll("span, div, button")].find((el) => el.textContent.trim() === "s181p2" && el !== row);
  const pillInner = pill ?? null;
  const pillX = pill ? [...pill.querySelectorAll("svg, button")].map((s) => s.getAttribute("class")) : null;
  const cs = (el) => {
    if (!el) return null;
    const s = getComputedStyle(el);
    return { bg: s.backgroundColor, color: s.color, radius: s.borderRadius, size: s.fontSize, weight: s.fontWeight, h: Math.round(el.getBoundingClientRect().height), px: s.paddingLeft, border: s.borderColor, cls: el.className };
  };
  const rcs = row ? getComputedStyle(row) : null;
  return {
    rowCls: row ? row.className : null,
    rowMb: rcs ? rcs.marginBottom : null,
    rowMt: rcs ? rcs.marginTop : null,
    rowGap: rcs ? rcs.gap : null,
    pill: cs(pillInner),
    pillXIcon: pillX,
    inputCls: addTagInput.className,
    inputW: Math.round(addTagInput.getBoundingClientRect().width),
    inputH: Math.round(addTagInput.getBoundingClientRect().height),
    inputPlaceholderColor: getComputedStyle(addTagInput).color,
  };
})()`);
save();
log("tag anatomy:", JSON.stringify(store.tagAnatomy, null, 1));
await page.getByRole("button", { name: "X", exact: true }).first().click().catch(() => {});
await page.waitForTimeout(600);

// ---- (3) the Settings tab switch (Subjects + Holidays) ----
await page.evaluate(() => {
  const a = [...document.querySelectorAll("nav a")].find((x) => x.textContent.trim().startsWith("Settings"));
  if (a) a.click();
});
await page.waitForTimeout(2500);
// What does the Settings surface render? Dump the structure first.
store.settingsStructure = await page.evaluate(`(() => {
  const pane = document.querySelector("main") ?? document.body;
  const tabs = [...pane.querySelectorAll("[role=tab]")].map((t) => ({ txt: t.textContent.trim(), state: t.getAttribute("data-state") ?? t.getAttribute("aria-selected") }));
  const navBtns = [...pane.querySelectorAll("button")].map((b) => b.textContent.trim()).filter((t) => t && t.length < 26).slice(0, 20);
  return { tabs, navBtns };
})()`);
save();
log("settings structure:", JSON.stringify(store.settingsStructure, null, 1));

// Click the Subjects tab through the role=tab list (or the button by exact text).
const subjectsTab = page.locator('[role=tab]', { hasText: "Subjects" }).first();
if (await subjectsTab.count() > 0) {
  await subjectsTab.click();
  await page.waitForTimeout(1400);
} else {
  const btn = page.locator('button', { hasText: "Subjects" }).first();
  await btn.click().catch(() => {});
  await page.waitForTimeout(1400);
}
store.subjectsTab = await page.evaluate(`(() => {
  const pane = document.querySelector("main") ?? document.body;
  // The active panel: the visible content region right of the settings rail.
  const h = [...pane.querySelectorAll("h2, h3, h1")].map((x) => x.textContent.trim()).filter(Boolean).slice(0, 8);
  const buttons = [...pane.querySelectorAll("button")].map((b) => b.textContent.trim()).filter((t) => t && t.length < 30).slice(0, 20);
  const tables = [...pane.querySelectorAll("table")].map((t) => ({ heads: [...t.querySelectorAll("th")].map((th) => th.textContent.trim()) }));
  const rows = [...pane.querySelectorAll("div")].filter((d) => d.className && String(d.className).includes("rounded") && d.textContent.trim().length > 4 && d.textContent.trim().length < 60 && !d.querySelector("div[class*='rounded']")).slice(0, 6).map((r) => ({ cls: r.className, text: r.textContent.trim().slice(0, 44) }));
  return { headings: h, buttons, tables, rows };
})()`);
save();
log("subjects tab:", JSON.stringify(store.subjectsTab, null, 1));

// Holidays tab.
const holidaysTab = page.locator('[role=tab]', { hasText: "Holidays" }).first();
if (await holidaysTab.count() > 0) {
  await holidaysTab.click();
  await page.waitForTimeout(1400);
} else {
  const btn = page.locator('button', { hasText: "Holidays" }).first();
  await btn.click().catch(() => {});
  await page.waitForTimeout(1400);
}
store.holidaysTab = await page.evaluate(`(() => {
  const pane = document.querySelector("main") ?? document.body;
  const h = [...pane.querySelectorAll("h2, h3, h1")].map((x) => x.textContent.trim()).filter(Boolean).slice(0, 8);
  const buttons = [...pane.querySelectorAll("button")].map((b) => b.textContent.trim()).filter((t) => t && t.length < 30).slice(0, 20);
  const rows = [...pane.querySelectorAll("div")].filter((d) => d.className && String(d.className).includes("rounded") && d.textContent.trim().length > 4 && d.textContent.trim().length < 60 && !d.querySelector("div[class*='rounded']")).slice(0, 6).map((r) => ({ cls: r.className, text: r.textContent.trim().slice(0, 44) }));
  return { headings: h, buttons, rows };
})()`);
save();
log("holidays tab:", JSON.stringify(store.holidaysTab, null, 1));

await ctx.close();
await browser.close();
log("PROBE 2 COMPLETE — store at /tmp/s181-probe2.json");
