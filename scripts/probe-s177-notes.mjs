// S177 one-shot probe — Part A: the per-cycle dialog re-verify sweep (the
// S176 ports: events/studygroups/tasks + the S175/S174 subjects/holidays —
// no re-drift); Part B: the Notes create-flow deep measurement (the B-5
// deferral from the S176 plan — the inline-draft lifecycle). Computed DOM
// is ground truth (the repo doctrine). Zero residue on the write path.
import { chromium } from "playwright";

const REF = "https://omni-study1.base44.app";

const DIALOG_CENSUS = `(() => {
  const d = document.querySelector('[role="dialog"]');
  if (!d) return null;
  const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden'; };
  const fields = [...d.querySelectorAll("input, select, textarea")].filter(vis).map((el) => ({
    tag: el.tagName.toLowerCase(),
    type: el.getAttribute("type"),
    placeholder: el.getAttribute("placeholder"),
    ariaLabel: el.getAttribute("aria-label"),
  }));
  const buttons = [...d.querySelectorAll("button")].filter(vis).map((el) => el.textContent.replace(/\\s+/g, " ").trim().slice(0, 36));
  const labels = [...d.querySelectorAll("label")].filter(vis).map((l) => l.textContent.replace(/\\s+/g, " ").trim().slice(0, 40));
  const selects = [...d.querySelectorAll("select")].filter(vis).map((s) => ({ options: [...s.options].map(o => o.textContent.trim()) }));
  const swatches = [...d.querySelectorAll("button, div")].filter((el) => {
    const r = el.getBoundingClientRect();
    return vis(el) && r.width > 0 && r.width <= 40 && r.height > 0 && r.height <= 40 && ((el.className || "").toString().match(/rounded-full/) && r.width === r.height);
  }).map((el) => ({ w: Math.round(el.getBoundingClientRect().width), selected: el.getAttribute("aria-pressed"), boxShadow: getComputedStyle(el).boxShadow.slice(0, 90), transform: getComputedStyle(el).transform }));
  return { labels, fields, buttons, selects, swatchCount: swatches.length, swatch0: swatches[0] || null };
})()`;

// Part B — the notes-surface census (both panes, live state).
const NOTES_CENSUS = `(() => {
  const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden'; };
  const aside = document.querySelector("aside");
  const main = document.querySelector("main") || document.body;
  const rows = aside ? [...aside.querySelectorAll("button, a")].filter((el) => {
    const t = el.textContent.trim();
    return t.length > 0 && !el.querySelector("input") && el.querySelector("h3, h4, p, [class*='font-semibold'], [class*='font-medium']");
  }) : [];
  const dialog = document.querySelector('[role="dialog"]');
  const titleInput = main.querySelector("input[placeholder*='itle'], input[placeholder*='title']");
  const tagInput = [...main.querySelectorAll("input")].find((el) => (el.getAttribute("placeholder") || "").match(/tag/i));
  const editorBody = main.querySelector(".ql-editor[contenteditable='true'], [contenteditable='true'].ql-editor");
  const emptyState = main.querySelector("[class*='text-center'], [class*='items-center']");
  const newNoteButtons = [...document.querySelectorAll("button")].filter(vis).map((el) => el.textContent.replace(/\\s+/g, " ").trim().slice(0, 24)).filter((t) => /new note|add note/i.test(t));
  return {
    noteRowCount: rows.length,
    firstRowTitles: rows.slice(0, 3).map((el) => el.textContent.trim().slice(0, 40)),
    hasDialog: !!dialog,
    dialogTitle: dialog ? (dialog.querySelector("h1, h2, h3") || {}).textContent : null,
    titlePlaceholder: titleInput ? titleInput.getAttribute("placeholder") : null,
    titleValue: titleInput ? titleInput.value : null,
    titleWidth: titleInput ? Math.round(titleInput.getBoundingClientRect().width) : null,
    tagPlaceholder: tagInput ? tagInput.getAttribute("placeholder") : null,
    tagWidth: tagInput ? Math.round(tagInput.getBoundingClientRect().width) : null,
    hasEditor: !!editorBody,
    editorHtml: editorBody ? editorBody.innerHTML.slice(0, 60) : null,
    editorVisible: editorBody ? vis(editorBody) : false,
    newNoteButtons,
    rightPaneText: main.textContent.replace(/\\s+/g, " ").trim().slice(0, 220),
  };
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
console.log("# logged into reference");

// ---------- Part A: the dialog re-verify sweep ----------
const REVERIFY = [
  { nav: "Events", button: /new event/i, family: "events" },
  { nav: "Study Groups", button: /new group|create group/i, family: "studygroups" },
  { nav: "Tasks", button: /add task/i, family: "tasks" },
];
const partA = {};
let lastNav = "";
for (const v of REVERIFY) {
  try {
    if (v.nav !== lastNav) {
      await page.evaluate((navText) => {
        const a = [...document.querySelectorAll("nav a")].find((x) => x.textContent.trim().startsWith(navText));
        if (a) a.click();
        return !!a;
      }, v.nav);
      await page.waitForTimeout(2200);
      lastNav = v.nav;
    }
    const btn = page.getByRole("button", { name: v.button }).first();
    await btn.click({ timeout: 6000 });
    await page.waitForTimeout(1400);
    const census = await page.evaluate(DIALOG_CENSUS);
    partA[v.family] = census || { error: "no dialog" };
    await page.keyboard.press("Escape");
    await page.waitForTimeout(700);
  } catch (e) {
    partA[v.family] = { error: String(e).slice(0, 120) };
    await page.keyboard.press("Escape").catch(() => {});
    await page.waitForTimeout(500);
  }
}
console.log("PART A (dialog re-verify):");
console.log(JSON.stringify(partA, null, 1));

// ---------- Part B: the Notes create-flow deep measurement ----------
const partB = {};
try {
  await page.evaluate(() => {
    const a = [...document.querySelectorAll("nav a")].find((x) => x.textContent.trim().startsWith("Notes"));
    if (a) a.click();
    return !!a;
  });
  await page.waitForTimeout(2500);
  partB.before = await page.evaluate(NOTES_CENSUS);

  // Find the New Note button — locator census first (where does it live?)
  const locs = await page.evaluate(() => {
    const out = [];
    for (const b of [...document.querySelectorAll("button")]) {
      const t = (b.textContent || "").replace(/\s+/g, " ").trim();
      if (/new note/i.test(t) || /notebook/i.test(t)) {
        const r = b.getBoundingClientRect();
        const inAside = !!(b.closest("aside"));
        out.push({ text: t.slice(0, 24), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), inAside, aria: b.getAttribute("aria-label") });
      }
    }
    return out;
  });
  partB.buttonLocs = locs;

  // The primary click — the reference's create affordance (the left-pane
  // dropdown item per the S77 measurement, or the empty-state button, or a
  // header button — measured, not assumed).
  let clicked = null;
  // 1st candidate: a direct visible "New Note"/"New note" button
  const direct = await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((el) => {
      const t = (el.textContent || "").replace(/\s+/g, " ").trim();
      const r = el.getBoundingClientRect();
      return r.width > 0 && /^new note$/i.test(t);
    });
    if (b) { b.click(); return { via: "direct-button", text: b.textContent.trim() }; }
    return null;
  });
  clicked = direct;

  if (!clicked) {
    // 2nd candidate: the left-pane 36px gradient dropdown → "New note" item
    try {
      const trigger = await page.locator("aside button[aria-label*='ew'], aside button[class*='gradient']").first();
      await trigger.click({ timeout: 3000 });
      await page.waitForTimeout(800);
      const item = await page.evaluate(() => {
        const it = [...document.querySelectorAll('[role="menuitem"], [role="menu"] button')].find((el) => /new note/i.test(el.textContent || ""));
        if (it) { it.click(); return true; }
        return false;
      });
      clicked = item ? { via: "dropdown-item" } : null;
    } catch { clicked = null; }
  }
  partB.clickVia = clicked;
  await page.waitForTimeout(1500);
  partB.afterClick = await page.evaluate(NOTES_CENSUS);

  // Did a list row appear immediately (persisted-on-click vs draft-only)?
  partB.rowAppearedImmediately = partB.afterClick.noteRowCount !== partB.before.noteRowCount;

  // Type a title into the draft editor
  if (partB.afterClick.titlePlaceholder) {
    const ti = page.locator("main input[placeholder*='itle'], main input[placeholder*='title']").first();
    await ti.fill("S177 probe note — delete me");
    await page.waitForTimeout(3000);
    partB.afterTitleType = await page.evaluate(NOTES_CENSUS);
    // Type body content
    const body = page.locator(".ql-editor[contenteditable='true']").first();
    if (await body.count() > 0) {
      await body.click({ timeout: 3000 });
      await body.type("probe body", { delay: 30 });
      await page.waitForTimeout(3500);
      partB.afterBodyType = await page.evaluate(NOTES_CENSUS);
    }
  }
  partB.netRowDelta =
    (partB.afterBodyType || partB.afterTitleType || partB.afterClick).noteRowCount - partB.before.noteRowCount;
} catch (e) {
  partB.error = String(e).slice(0, 200);
}
console.log("PART B (notes create-flow):");
console.log(JSON.stringify(partB, null, 1));

// ---------- Residue cleanup: delete any note created by this probe ----------
try {
  const residue = await page.evaluate(() => {
    const aside = document.querySelector("aside");
    const rows = aside ? [...aside.querySelectorAll("button, a")].filter((el) => {
      const t = el.textContent.trim();
      return t.length > 0 && !el.querySelector("input") && el.querySelector("h3, h4, p, [class*='font-semibold'], [class*='font-medium']");
    }) : [];
    return rows.map((el) => el.textContent.trim().slice(0, 50)).filter((t) => /S177 probe/i.test(t));
  });
  if (residue.length > 0) {
    // open the probe note, use its actions to delete
    const row = page.locator("aside button, aside a").filter({ hasText: "S177 probe" }).first();
    await row.click({ timeout: 5000 });
    await page.waitForTimeout(1500);
    // the reference's note actions: MoreVertical-style button or a trash button
    const del = await page.evaluate(() => {
      const btns = [...document.querySelectorAll("main button")];
      const trash = btns.find((b) => (b.getAttribute("aria-label") || "").match(/delete|trash/i));
      if (trash) { trash.click(); return "aria-label"; }
      return null;
    });
    await page.waitForTimeout(1200);
    // confirm dialog if any
    const conf = await page.evaluate(() => {
      const d = document.querySelector('[role="dialog"], [role="alertdialog"]');
      if (d) {
        const ok = [...d.querySelectorAll("button")].find((b) => /delete|confirm|remove/i.test(b.textContent || ""));
        if (ok) { ok.click(); return "confirmed"; }
      }
      return null;
    });
    partB.cleanup = { residueRows: residue.length, del, conf };
    await page.waitForTimeout(1800);
    partB.afterCleanup = await page.evaluate(NOTES_CENSUS);
  } else {
    partB.cleanup = { residueRows: 0 };
  }
} catch (e) {
  partB.cleanupError = String(e).slice(0, 150);
}
console.log("PART B cleanup:");
console.log(JSON.stringify({ cleanup: partB.cleanup, cleanupError: partB.cleanupError, afterCleanupRowCount: partB.afterCleanup ? partB.afterCleanup.noteRowCount : undefined }, null, 1));

await ctx.close();
await browser.close();
