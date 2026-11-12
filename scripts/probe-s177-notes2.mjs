// S177 probe 2 — the reference's draft-editor ANATOMY (deeper than S77's
// measurement: the title row's full census — the "None" element, Save,
// Font row, Divider, "Attach File") + the SAVE lifecycle (click Save with a
// typed title → the row appears?) + the full residue cleanup. Computed DOM
// is ground truth. Also probes the left-pane icon dropdown affordance.
import { chromium } from "playwright";

const REF = "https://omni-study1.base44.app";

const EDITOR_ANATOMY = `(() => {
  const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden'; };
  const main = document.querySelector("main") || document.body;
  const btns = [...main.querySelectorAll("button")].filter(vis).map((b) => ({
    text: (b.textContent || "").replace(/\\s+/g, " ").trim().slice(0, 28),
    aria: b.getAttribute("aria-label"),
    w: Math.round(b.getBoundingClientRect().width),
    h: Math.round(b.getBoundingClientRect().height),
    bg: getComputedStyle(b).backgroundColor,
    cls: ((b.className || "").toString().match(/(gradient|bg-\\w+-\\d+|rounded-\\w+)/g) || []).slice(0, 4),
  }));
  const inputs = [...main.querySelectorAll("input")].filter(vis).map((i) => ({
    placeholder: i.getAttribute("placeholder"),
    w: Math.round(i.getBoundingClientRect().width),
    fontSize: getComputedStyle(i).fontSize,
    fontWeight: getComputedStyle(i).fontWeight,
  }));
  const selects = [...main.querySelectorAll("select")].filter(vis).map((s) => ({
    options: [...s.options].map((o) => o.textContent.trim()).slice(0, 8),
    w: Math.round(s.getBoundingClientRect().width),
  }));
  const pills = [...main.querySelectorAll("span, div")].filter((el) => {
    const t = (el.textContent || "").trim();
    return vis(el) && el.children.length === 0 && t.length > 0 && t.length < 20 && /rounded-(full|md|lg)/.test((el.className || "").toString());
  }).slice(0, 8).map((el) => ({ text: el.textContent.trim().slice(0, 20), cls: ((el.className || "").toString().match(/bg-\\w+-\\d+/g) || []).slice(0, 2) }));
  const editorCard = main.querySelector(".ql-editor") ? main.querySelector(".ql-editor").closest("div[class*='rounded'], div[class*='bg-white'], div[class*='card']") : null;
  return {
    buttons: btns,
    inputs,
    selects,
    pills,
    editorCardCls: editorCard ? ((editorCard.className || "").toString().match(/(rounded-\\w+|bg-\\w+-\\d+|shadow-\\w+|p-\\d+)/g) || []).slice(0, 6) : null,
    toolbar: main.querySelector(".ql-toolbar") ? [...main.querySelectorAll(".ql-toolbar button, .ql-toolbar .ql-picker")].slice(0, 14).map((el) => (el.getAttribute("class") || "").replace("ql-", "").split(" ")[0]) : null,
  };
})()`;

const LIST_CENSUS = `(() => {
  const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden'; };
  const aside = document.querySelector("aside");
  const rows = aside ? [...aside.querySelectorAll("button, a")].filter((el) => {
    const t = el.textContent.trim();
    return t.length > 0 && !el.querySelector("input") && el.querySelector("h3, h4, p, [class*='font-semibold'], [class*='font-medium']");
  }) : [];
  return { noteRowCount: rows.length, rowTitles: rows.slice(0, 5).map((el) => el.textContent.trim().slice(0, 50)) };
})()`;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(`${REF}/login`);
await page.fill("input[type=email]", process.env.REF_PROBE_EMAIL);
await page.fill("input[type=password]", process.env.REF_PROBE_PASSWORD);
await page.click("button[type=submit]");
await page.waitForFunction(() => document.querySelector("main") !== null && document.querySelector("nav") !== null, null, { timeout: 30000 });
await page.waitForTimeout(2500);
await page.evaluate(() => {
  const a = [...document.querySelectorAll("nav a")].find((x) => x.textContent.trim().startsWith("Notes"));
  if (a) a.click();
});
await page.waitForTimeout(2500);

const out = {};

// The left-pane icon dropdown affordance (the S77-measured 36px gradient dropdown)
out.leftPaneButtons = await page.evaluate(() => {
  const outb = [];
  for (const b of [...document.querySelectorAll("aside button")]) {
    const r = b.getBoundingClientRect();
    if (r.width > 0) {
      outb.push({ text: (b.textContent || "").replace(/\s+/g, " ").trim().slice(0, 20), aria: b.getAttribute("aria-label"), w: Math.round(r.width), h: Math.round(r.height), cls: ((b.className || "").toString().match(/(gradient|rounded-\\w+|size-\\d+|w-\\d+|h-\\d+)/g) || []).slice(0, 5) });
    }
  }
  return outb;
});

// Open the draft via the empty-state CTA
await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find((el) => {
    const t = (el.textContent || "").replace(/\s+/g, " ").trim();
    return /^new note$/i.test(t);
  });
  if (b) b.click();
});
await page.waitForTimeout(1600);
out.draftAnatomy = await page.evaluate(EDITOR_ANATOMY);

// Type a title, then click Save — the lifecycle measurement
await page.locator("main input[placeholder*='itle'], main input[placeholder*='title']").first().fill("S177 probe note B — delete me");
await page.waitForTimeout(600);
out.beforeSave = await page.evaluate(LIST_CENSUS);
const saveBtn = await page.evaluate(() => {
  const b = [...document.querySelectorAll("main button")].find((el) => /^save$/i.test((el.textContent || "").trim()));
  return !!b;
});
if (saveBtn) {
  await page.locator("main button", { hasText: /^Save$/ }).first().click({ timeout: 4000 }).catch(async (e) => {
    // fallback: evaluate-click
    await page.evaluate(() => {
      const b = [...document.querySelectorAll("main button")].find((el) => /^save$/i.test((el.textContent || "").trim()));
      if (b) b.click();
    });
  });
  await page.waitForTimeout(2500);
  out.afterSave = await page.evaluate(LIST_CENSUS);
}

// Residue cleanup — delete the created note through the UI
try {
  const row = page.locator("aside button, aside a").filter({ hasText: "S177 probe note B" }).first();
  if (await row.count() > 0) {
    await row.click({ timeout: 5000 });
    await page.waitForTimeout(1500);
    // find a delete affordance in the note editor area
    const del = await page.evaluate(() => {
      const btns = [...document.querySelectorAll("main button, [role='dialog'] button")];
      const byAria = btns.find((b) => (b.getAttribute("aria-label") || "").match(/delete|trash|remove/i));
      return byAria ? "aria" : null;
    });
    if (del === "aria") {
      await page.locator("main button[aria-label*='elete'], main button[aria-label*='rash'], main button[aria-label*='emove']").first().click({ timeout: 4000 });
    } else {
      // hover the row for hover actions
      await page.locator("aside button, aside a").filter({ hasText: "S177 probe note B" }).first().hover();
      await page.waitForTimeout(600);
      await page.evaluate(() => {
        const b = [...document.querySelectorAll("aside button")].find((el) => (el.getAttribute("aria-label") || "").match(/delete|trash/i));
        if (b) b.click();
      });
    }
    await page.waitForTimeout(1200);
    // confirm if a dialog appeared
    await page.evaluate(() => {
      const d = document.querySelector('[role="dialog"], [role="alertdialog"]');
      if (d) {
        const ok = [...d.querySelectorAll("button")].find((b) => /delete|confirm|remove/i.test(b.textContent || ""));
        if (ok) ok.click();
      }
    });
    await page.waitForTimeout(2000);
  }
  out.afterCleanup = await page.evaluate(LIST_CENSUS);
} catch (e) {
  out.cleanupError = String(e).slice(0, 150);
  out.afterCleanup = await page.evaluate(LIST_CENSUS);
}

console.log(JSON.stringify(out, null, 1));
await ctx.close();
await browser.close();
