// S192 mode-aware re-measure — detects the reference account's standing
// theme mode (the S188/§6.3 protocol: the mode is RECORDED, never assumed),
// then measures both hosts in the SAME mode for the adjudication surfaces
// (AI quick cards / composer / Files toolbar / Settings panel / Calendar
// day header). The clone's demo account theme is set to MATCH the
// reference's mode (a write to the CLONE only — the reference stays
// read-only).
// Usage: REF_PROBE_EMAIL=… REF_PROBE_PASSWORD=… node scripts/probe-s192-mode.mjs
import { chromium } from "playwright";

const REF = "https://omni-study1.base44.app";
const CLONE = "http://localhost:3200";

async function session(browser, base, creds) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${base}/login`, { timeout: 45_000 });
  await page.fill("input[type=email]", creds.email);
  await page.fill("input[type=password]", creds.password);
  await page.waitForFunction(
    () => {
      const b = document.querySelector("button[type=submit]");
      return b !== null && !b.disabled;
    },
    null,
    { timeout: 20_000 },
  );
  await page.click("button[type=submit]");
  await page.waitForFunction(
    () =>
      document.querySelector("nav a") !== null &&
      (document.querySelector("h1") !== null || document.querySelector("h2") !== null),
    null,
    { timeout: 30_000 },
  );
  await page.waitForTimeout(1500);
  return { ctx, page };
}

const nav = async (page, label) => {
  await page.locator("nav a").filter({ hasText: label }).first().click({ timeout: 15_000 });
  await page.waitForTimeout(1500);
};

const MODE = `(() => {
  const de = document.documentElement;
  const body = getComputedStyle(document.body);
  return JSON.stringify({
    htmlClass: de.className,
    dataTheme: de.getAttribute("data-theme") || de.dataset.theme || null,
    bodyBg: body.backgroundColor,
    bodyColor: body.color,
  });
})()`;

const browser = await chromium.launch();
const out = {};

// 1. Detect the reference's standing mode.
const r = await session(browser, REF, { email: process.env.REF_PROBE_EMAIL, password: process.env.REF_PROBE_PASSWORD });
out.refMode = JSON.parse(await r.page.evaluate(MODE));
const refDark = /dark/i.test(out.refMode.htmlClass) || out.refMode.bodyBg === "rgb(10, 10, 10)";
out.refModeIsDark = refDark;

// 2. Measure the reference in its standing mode (all adjudication surfaces).
const AI = `(() => {
  const main = document.querySelector("main") || document.body;
  const card = [...main.querySelectorAll("button")].find((b) => b.textContent.trim().startsWith("Explain Concept"));
  let cardOut = null;
  if (card) {
    const cs = getComputedStyle(card);
    const inner = card.querySelector("h1,h2,h3,h4,[role=heading],span,div");
    const ics = inner ? getComputedStyle(inner) : null;
    cardOut = {
      border: cs.borderColor, radius: cs.borderRadius, bg: cs.backgroundColor,
      pad: cs.padding, cls: (card.className || "").toString().slice(0, 130),
      innerTag: inner?.tagName, innerCls: inner ? (inner.className || "").toString().slice(0, 90) : null,
      innerFs: ics?.fontSize, innerFw: ics?.fontWeight, innerColor: ics?.color, innerMt: ics?.marginTop,
      gridCols: getComputedStyle(card.parentElement).gridTemplateColumns,
      gap: getComputedStyle(card.parentElement).gap,
    };
  }
  const greet = [...main.querySelectorAll("h1,h2,h3,h4,p,span,div")].find((e) => e.children.length === 0 && /how can i help you study today/i.test(e.textContent || ""));
  const ta = main.querySelector("textarea");
  const composer = ta?.closest("form, div");
  const composerBtns = composer ? [...composer.querySelectorAll("button")].map((b) => ({
    aria: (b.getAttribute("aria-label") || "").slice(0, 30), text: b.textContent.trim().slice(0, 20),
    w: Math.round(b.getBoundingClientRect().width), h: Math.round(b.getBoundingClientRect().height),
    bg: getComputedStyle(b).backgroundColor, radius: getComputedStyle(b).borderRadius,
    cls: (b.className || "").toString().slice(0, 110),
  })) : [];
  const emptyP = [...main.querySelectorAll("p")].find((p) => p.getBoundingClientRect().width > 0 && /ask|study|start/i.test(p.textContent));
  const h2sub = main.querySelector("h1")?.parentElement?.querySelector("p, div");
  return JSON.stringify({
    card: cardOut,
    greet: greet ? { tag: greet.tagName, cls: (greet.className || "").toString().slice(0, 80), fs: getComputedStyle(greet).fontSize } : null,
    greetParentCls: greet?.parentElement ? (greet.parentElement.className || "").toString().slice(0, 80) : null,
    composerBtns,
    emptyCopy: emptyP ? emptyP.textContent.trim().slice(0, 90) : null,
    subtitle: h2sub ? h2sub.textContent.trim().slice(0, 60) : null,
    taCls: ta ? (ta.className || "").toString().slice(0, 140) : null, taFs: ta ? getComputedStyle(ta).fontSize : null,
    taMinH: ta ? getComputedStyle(ta).minHeight : null,
    hint: (main.innerText.match(/Press Enter[^\\n]*/) || [""])[0].slice(0, 70),
  });
})()`;

await nav(r.page, "AI Assistant");
out.aiRef = JSON.parse(await r.page.evaluate(AI));

const FILES = `(() => {
  const main = document.querySelector("main") || document.body;
  const nf = [...main.querySelectorAll("button")].find((b) => b.textContent.trim() === "New Folder");
  const up = [...main.querySelectorAll("button, label")].find((b) => /upload/i.test(b.textContent || ""));
  const cs = (el) => el ? {
    tag: el.tagName, w: Math.round(el.getBoundingClientRect().width), h: Math.round(el.getBoundingClientRect().height),
    bg: getComputedStyle(el).backgroundColor, color: getComputedStyle(el).color,
    border: getComputedStyle(el).borderColor, radius: getComputedStyle(el).borderRadius,
    cls: (el.className || "").toString().slice(0, 130),
    isLabel: el.tagName === "LABEL",
  } : null;
  return JSON.stringify({ newFolder: cs(nf), upload: cs(up) });
})()`;

await nav(r.page, "Files");
out.filesRef = JSON.parse(await r.page.evaluate(FILES));

const SETTINGS = `(() => {
  const main = document.querySelector("main") || document.body;
  const panel = main.querySelector("[role=tabpanel]") || main;
  const title = [...panel.querySelectorAll("h1,h2,h3,h4,p,div,span")].find((e) => e.children.length === 0 && e.textContent.trim() === "Appearance");
  const desc = [...panel.querySelectorAll("p,div,span")].find((e) => e.children.length === 0 && /customize how studyflow looks/i.test(e.textContent || ""));
  const cs = (el) => el ? { tag: el.tagName, cls: (el.className || "").toString().slice(0, 100), fs: getComputedStyle(el).fontSize, fw: getComputedStyle(el).fontWeight, color: getComputedStyle(el).color } : null;
  return JSON.stringify({ title: cs(title), desc: cs(desc) });
})()`;

await nav(r.page, "Settings");
out.settingsRef = JSON.parse(await r.page.evaluate(SETTINGS));

const CAL = `(() => {
  const h = [...document.querySelectorAll("main h1, main h2, main h3")].map((e) => e.textContent.trim()).filter(Boolean);
  return JSON.stringify({ dayHeader: h.find((t) => /(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday),/.test(t)) || null });
})()`;

await nav(r.page, "Calendar");
out.calRef = JSON.parse(await r.page.evaluate(CAL));
await r.ctx.close();

// 3. Set the CLONE demo account to the SAME mode, then measure.
const c = await session(browser, CLONE, { email: "demo@studyflow.app", password: "Demo1234!" });
out.cloneModeBefore = JSON.parse(await c.page.evaluate(MODE));
if (refDark) {
  // flip the clone's theme to dark through its own toggle (the theme-chip)
  const chip = c.page.locator("button").filter({ hasText: "Dark" }).first();
  await chip.click({ timeout: 10_000 }).catch(() => {});
  await c.page.waitForTimeout(1200);
}
out.cloneModeAfter = JSON.parse(await c.page.evaluate(MODE));

await nav(c.page, "AI Assistant");
out.aiClone = JSON.parse(await c.page.evaluate(AI));
await nav(c.page, "Files");
out.filesClone = JSON.parse(await c.page.evaluate(FILES));
await nav(c.page, "Settings");
out.settingsClone = JSON.parse(await c.page.evaluate(SETTINGS));
await nav(c.page, "Calendar");
out.calClone = JSON.parse(await c.page.evaluate(CAL));
await c.ctx.close();

await browser.close();
console.log(JSON.stringify(out, null, 1));
