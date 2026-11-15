// S192 adjudication probe round 2 — the deep structure follow-up on the
// AI quick-action card anatomy (inner heading typography + border token),
// the AI composer (submit affordance + greeting), the Files toolbar (Upload
// affordance), and the Settings Appearance panel (heading structure).
// READ-ONLY on the reference. Usage:
//   REF_PROBE_EMAIL=… REF_PROBE_PASSWORD=… node scripts/probe-s192-adjudicate2.mjs
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
  await page.waitForTimeout(1400);
};

const browser = await chromium.launch();
const out = {};

// --- AI assistant deep probe ----------------------------------------------
const AI_PROBE = `(() => {
  const main = document.querySelector("main") || document.body;
  // The first quick-action card
  const card = [...main.querySelectorAll("button")].find((b) => b.textContent.trim().startsWith("Explain Concept"));
  const cardOut = card ? (() => {
    const cs = getComputedStyle(card);
    const inner = card.querySelector("h1,h2,h3,h4,[role=heading],span,div");
    const innerCs = inner ? getComputedStyle(inner) : null;
    const icon = card.querySelector("svg");
    return {
      cls: (card.className || "").toString().slice(0, 120),
      border: cs.borderColor, bw: cs.borderWidth, radius: cs.borderRadius,
      bg: cs.backgroundColor, shadow: cs.boxShadow.slice(0, 70), pad: cs.padding,
      innerTag: inner ? inner.tagName : null,
      innerRole: inner?.getAttribute?.("role") || null,
      innerCls: inner ? (inner.className || "").toString().slice(0, 100) : null,
      innerFs: innerCs?.fontSize, innerFw: innerCs?.fontWeight, innerColor: innerCs?.color,
      iconSize: icon ? getComputedStyle(icon).width : null, iconColor: icon ? getComputedStyle(icon).color : null,
      gridCols: card.parentElement ? getComputedStyle(card.parentElement).gridTemplateColumns : null,
      gap: card.parentElement ? getComputedStyle(card.parentElement).gap : null,
    };
  })() : null;
  // The composer area: everything after the transcript — buttons near the textarea
  const ta = main.querySelector("textarea");
  const composer = ta ? ta.closest("form, div") : null;
  const composerBtns = composer
    ? [...composer.querySelectorAll("button")].map((b) => ({
        label: (b.getAttribute("aria-label") || b.textContent.trim() || "").slice(0, 30),
        html: b.innerHTML.replace(/\\s+/g, " ").slice(0, 80),
        w: Math.round(b.getBoundingClientRect().width),
      }))
    : [];
  // The greeting heading location
  const greet = [...main.querySelectorAll("h1,h2,h3,h4,p,span,div")].find((e) => e.children.length === 0 && /how can i help you study today/i.test(e.textContent || ""));
  const greetOut = greet ? {
    tag: greet.tagName, cls: (greet.className || "").toString().slice(0, 90),
    fs: getComputedStyle(greet).fontSize, fw: getComputedStyle(greet).fontWeight,
    color: getComputedStyle(greet).color, ta: getComputedStyle(greet).textAlign,
    parentTag: greet.parentElement?.tagName,
    parentCls: (greet.parentElement?.className || "").toString().slice(0, 90),
  } : null;
  // The empty-state copy above the quick actions
  const emptyP = [...main.querySelectorAll("p")].find((p) => p.textContent.trim().length > 10 && p.getBoundingClientRect().width > 0 && /study|ask|start/i.test(p.textContent));
  const taCls = ta ? { cls: (ta.className || "").toString().slice(0, 110), ph: ta.placeholder } : null;
  return JSON.stringify({ card: cardOut, composerBtns, greet: greetOut, emptyCopy: emptyP ? emptyP.textContent.trim().slice(0, 90) : null, ta: taCls, fullText: main.innerText.replace(/\\s+/g, " ").slice(0, 600) });
})()`;

{
  const r = await session(browser, REF, { email: process.env.REF_PROBE_EMAIL, password: process.env.REF_PROBE_PASSWORD });
  await nav(r.page, "AI Assistant");
  out.aiRef = JSON.parse(await r.page.evaluate(AI_PROBE));
  await r.ctx.close();

  const c = await session(browser, CLONE, { email: "demo@studyflow.app", password: "Demo1234!" });
  await nav(c.page, "AI Assistant");
  out.aiClone = JSON.parse(await c.page.evaluate(AI_PROBE));
  await c.ctx.close();
}

// --- Files toolbar probe ----------------------------------------------------
const FILES_PROBE = `(() => {
  const main = document.querySelector("main") || document.body;
  const btns = [...main.querySelectorAll("button")].map((b) => {
    const r = b.getBoundingClientRect();
    if (r.width === 0) return null;
    const cs = getComputedStyle(b);
    return {
      label: (b.getAttribute("aria-label") || "").slice(0, 40),
      text: b.textContent.trim().replace(/\\s+/g, " ").slice(0, 40),
      html: b.innerHTML.replace(/\\s+/g, " ").slice(0, 110),
      w: Math.round(r.width), h: Math.round(r.height),
      bg: cs.backgroundColor, color: cs.color, radius: cs.borderRadius,
      border: cs.borderColor, fw: cs.fontWeight, fs: cs.fontSize,
    };
  }).filter(Boolean).slice(0, 10);
  return JSON.stringify({ btns, text: main.innerText.replace(/\\s+/g, " ").slice(0, 350) });
})()`;

{
  const r = await session(browser, REF, { email: process.env.REF_PROBE_EMAIL, password: process.env.REF_PROBE_PASSWORD });
  await nav(r.page, "Files");
  out.filesRef = JSON.parse(await r.page.evaluate(FILES_PROBE));
  await r.ctx.close();

  const c = await session(browser, CLONE, { email: "demo@studyflow.app", password: "Demo1234!" });
  await nav(c.page, "Files");
  out.filesClone = JSON.parse(await c.page.evaluate(FILES_PROBE));
  await c.ctx.close();
}

// --- Settings Appearance panel probe ---------------------------------------
const SETTINGS_PROBE = `(() => {
  const main = document.querySelector("main") || document.body;
  const panel = main.querySelector("[role=tabpanel]") || main;
  const heads = [...panel.querySelectorAll("h1,h2,h3,h4")].map((e) => {
    const cs = getComputedStyle(e);
    return { tag: e.tagName, t: e.textContent.trim().slice(0, 40), fs: cs.fontSize, fw: cs.fontWeight, cls: (e.className || "").toString().slice(0, 80), visible: e.getBoundingClientRect().width > 0 };
  });
  const first = panel.querySelector("h2, h3, p");
  return JSON.stringify({
    heads,
    panelText: panel.innerText.replace(/\\s+/g, " ").slice(0, 300),
    activeTab: document.querySelector("[role=tab][aria-selected=true], [role=tab][data-state=active]")?.textContent?.trim() || null,
  });
})()`;

{
  const r = await session(browser, REF, { email: process.env.REF_PROBE_EMAIL, password: process.env.REF_PROBE_PASSWORD });
  await nav(r.page, "Settings");
  out.settingsRef = JSON.parse(await r.page.evaluate(SETTINGS_PROBE));
  await r.ctx.close();

  const c = await session(browser, CLONE, { email: "demo@studyflow.app", password: "Demo1234!" });
  await nav(c.page, "Settings");
  out.settingsClone = JSON.parse(await c.page.evaluate(SETTINGS_PROBE));
  await c.ctx.close();
}

await browser.close();
console.log(JSON.stringify(out, null, 1));
