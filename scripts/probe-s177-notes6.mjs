// S177 probe 6 — robust: wait for the notes view's OWN content (the "All
// Notebooks" filter or the h2/h1 "Notes" heading inside the view), then
// the full draft lifecycle with trusted clicks. Screenshots at each step.
import { chromium } from "playwright";

const REF = "https://omni-study1.base44.app";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(`${REF}/login`);
await page.fill("input[type=email]", process.env.REF_PROBE_EMAIL);
await page.fill("input[type=password]", process.env.REF_PROBE_PASSWORD);
await page.click("button[type=submit]");
await page.waitForFunction(() => document.querySelector("main") !== null && document.querySelector("nav") !== null, null, { timeout: 30000 });
await page.waitForTimeout(2500);
await page.locator("nav a").filter({ hasText: /^Notes/ }).first().click({ timeout: 8000 });

// Wait for the view content: the "All Notebooks" filter button (notes-specific)
await page.locator("button", { hasText: "All Notebooks" }).first().waitFor({ state: "visible", timeout: 20000 });
await page.waitForTimeout(1500);
const out = {};
await page.screenshot({ path: "/tmp/s177-p6-a.png" });

out.empty = await page.evaluate(() => {
  const m = document.querySelector("main");
  const t = m.textContent.replace(/\s+/g, " ").trim();
  const i = t.search(/no notes yet/i);
  return i >= 0 ? t.slice(i, i + 120) : "(no empty text)";
});

// Trusted click on New Note
const cta = page.locator("button").filter({ hasText: /^New Note$/ }).first();
out.ctaVisible = await cta.isVisible();
await cta.click({ timeout: 8000 });

// Wait for the draft's title input to appear VISIBLE
try {
  await page.locator("input[placeholder='Note title...']").waitFor({ state: "visible", timeout: 10000 });
  out.draftOpened = true;
} catch {
  out.draftOpened = false;
}
await page.waitForTimeout(1200);
await page.screenshot({ path: "/tmp/s177-p6-b.png" });

if (out.draftOpened) {
  out.draft = await page.evaluate(() => {
    const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden'; };
    const m = document.querySelector("main");
    const ti = m.querySelector("input[placeholder='Note title...']");
    const tagIn = [...m.querySelectorAll("input")].find((el) => (el.getAttribute("placeholder") || "").match(/add tag/i));
    const ed = m.querySelector(".ql-editor[contenteditable='true']");
    const save = [...m.querySelectorAll("button")].find((b) => /^save$/i.test((b.textContent || "").trim()));
    const empty = [...m.querySelectorAll("div")].find((d) => /no notes yet/i.test(d.textContent || "") && vis(d) && d.querySelector("button"));
    const toolbar = m.querySelector(".ql-toolbar");
    const fontSel = [...m.querySelectorAll("select")].find((s) => [...s.options].some((o) => /default/i.test(o.textContent || "")));
    const divider = [...m.querySelectorAll("button")].find((b) => /^divider$/i.test((b.textContent || "").trim()));
    const none = [...m.querySelectorAll("button")].find((b) => /^none$/i.test((b.textContent || "").trim()));
    return {
      title: { visible: vis(ti), w: ti ? Math.round(ti.getBoundingClientRect().width) : null, fs: ti ? getComputedStyle(ti).fontSize : null, fw: ti ? getComputedStyle(ti).fontWeight : null },
      tag: { visible: tagIn ? vis(tagIn) : false, w: tagIn ? Math.round(tagIn.getBoundingClientRect().width) : null },
      editor: { visible: ed ? vis(ed) : false, html: ed ? ed.innerHTML.slice(0, 40) : null },
      save: { visible: save ? vis(save) : false, w: save ? Math.round(save.getBoundingClientRect().width) : null, cls: save ? ((save.className || "").toString().match(/(gradient|rounded-\w+)/g) || []).slice(0, 3) : null },
      fontSel: fontSel ? { options: [...fontSel.options].map((o) => o.textContent.trim()).slice(0, 10), w: Math.round(fontSel.getBoundingClientRect().width) } : null,
      divider: divider ? { w: Math.round(divider.getBoundingClientRect().width), bg: getComputedStyle(divider).backgroundColor } : null,
      noneBtn: none ? { w: Math.round(none.getBoundingClientRect().width), cls: ((none.className || "").toString().match(/rounded-\w+/g) || [])[0] || null } : null,
      toolbarVisible: toolbar ? vis(toolbar) : false,
      emptyStillVisible: !!empty,
    };
  });

  // The save lifecycle: type title + body, count rows, Save, count rows
  await page.locator("input[placeholder='Note title...']").fill("S177 probe D — delete me");
  const body = page.locator(".ql-editor[contenteditable='true']");
  await body.click({ timeout: 5000 });
  await body.type("probe body D", { delay: 40 });
  await page.waitForTimeout(2500);
  out.rowsBeforeSave = await page.evaluate(() => {
    const aside = document.querySelector("aside");
    return aside ? [...aside.querySelectorAll("button")].filter((el) => el.querySelector("h3, [class*='font-semibold'], [class*='font-medium']")).length : null;
  });
  await page.locator("main button").filter({ hasText: /^Save$/ }).first().click({ timeout: 6000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: "/tmp/s177-p6-c.png" });
  out.afterSave = await page.evaluate(() => {
    const aside = document.querySelector("aside");
    const rows = aside ? [...aside.querySelectorAll("button")].filter((el) => el.querySelector("h3, [class*='font-semibold'], [class*='font-medium']")) : [];
    const ti = document.querySelector("main input[placeholder='Note title...']");
    return { rowCount: rows.length, titles: rows.slice(0, 4).map((el) => el.textContent.trim().slice(0, 50)), titleInputGone: !ti };
  });

  // Residue cleanup — the created note
  try {
    const row = page.locator("aside button").filter({ hasText: "S177 probe D" }).first();
    if (await row.count() > 0) {
      await row.click({ timeout: 5000 });
      await page.waitForTimeout(2000);
      await page.screenshot({ path: "/tmp/s177-p6-d.png" });
      // Look for a delete affordance: hover the row first (hover actions), then any trash aria-label anywhere
      await row.hover();
      await page.waitForTimeout(700);
      out.aff = await page.evaluate(() => {
        const btns = [...document.querySelectorAll("button")];
        return btns.filter((b) => (b.getAttribute("aria-label") || "").match(/delete|trash|remove/i)).map((b) => ({ aria: b.getAttribute("aria-label"), inAside: !!b.closest("aside"), vis: b.getBoundingClientRect().width > 0 }));
      });
      const del = page.locator("button[aria-label*='Delete'], button[aria-label*='delete'], button[aria-label*='Trash'], button[aria-label*='trash'], button[aria-label*='Remove'], button[aria-label*='remove']").first();
      if (await del.count() > 0) {
        await del.click({ timeout: 4000 });
        await page.waitForTimeout(1500);
        const dlg = page.locator('[role="dialog"], [role="alertdialog"]');
        if (await dlg.count() > 0) {
          await page.locator('[role="dialog"] button, [role="alertdialog"] button').filter({ hasText: /delete|confirm|remove/i }).first().click({ timeout: 4000 });
        }
        await page.waitForTimeout(2200);
      }
    }
  } catch (e) {
    out.cleanupError = String(e).slice(0, 160);
  }
  out.afterCleanup = await page.evaluate(() => {
    const aside = document.querySelector("aside");
    const rows = aside ? [...aside.querySelectorAll("button")].filter((el) => el.querySelector("h3, [class*='font-semibold'], [class*='font-medium']")) : [];
    return { rowCount: rows.length, titles: rows.slice(0, 4).map((el) => el.textContent.trim().slice(0, 50)) };
  });
  await page.screenshot({ path: "/tmp/s177-p6-e.png" });
}

console.log(JSON.stringify(out, null, 1));
await ctx.close();
await browser.close();
