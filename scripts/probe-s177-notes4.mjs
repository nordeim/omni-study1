// S177 probe 4 — trusted Playwright clicks (not evaluate clicks) on the
// reference's New Note affordance + explicit wait for the draft's title
// input to become VISIBLE + stepwise screenshots + the save lifecycle.
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
await page.getByRole("link", { name: /^Notes/ }).click();
await page.waitForTimeout(2500);

const out = {};
out.step = "notes-view-loaded";
await page.screenshot({ path: "/tmp/s177-p4-a.png" });

// Trusted click on the New Note CTA (the empty state's button)
const cta = page.getByRole("button", { name: "New Note" }).first();
out.ctaCount = await page.getByRole("button", { name: "New Note" }).count();
await cta.click({ timeout: 8000 });

// Wait for the draft title input to be visible
try {
  await page.locator("input[placeholder='Note title...']").waitFor({ state: "visible", timeout: 8000 });
  out.draftOpened = true;
} catch {
  out.draftOpened = false;
}
await page.waitForTimeout(1200);
await page.screenshot({ path: "/tmp/s177-p4-b.png" });

if (out.draftOpened) {
  // The draft anatomy, visibility-aware
  out.draft = await page.evaluate(() => {
    const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden'; };
    const main = document.querySelector("main");
    const ti = main.querySelector("input[placeholder='Note title...']");
    const tagIn = [...main.querySelectorAll("input")].find((el) => (el.getAttribute("placeholder") || "").match(/add tag/i));
    const ed = main.querySelector(".ql-editor[contenteditable='true']");
    const save = [...main.querySelectorAll("button")].find((b) => /^save$/i.test((b.textContent || "").trim()));
    const emptyStill = [...main.querySelectorAll("div")].find((d) => /no notes yet/i.test(d.textContent || "") && vis(d));
    return {
      titleVisible: vis(ti), titleRect: ti ? { x: Math.round(ti.getBoundingClientRect().x), y: Math.round(ti.getBoundingClientRect().y), w: Math.round(ti.getBoundingClientRect().width) } : null,
      titleFontSize: ti ? getComputedStyle(ti).fontSize : null, titleFontWeight: ti ? getComputedStyle(ti).fontWeight : null,
      tagVisible: tagIn ? vis(tagIn) : false, tagRect: tagIn ? { w: Math.round(tagIn.getBoundingClientRect().width) } : null,
      editorVisible: ed ? vis(ed) : false, editorRect: ed ? { x: Math.round(ed.getBoundingClientRect().x), y: Math.round(ed.getBoundingClientRect().y), w: Math.round(ed.getBoundingClientRect().width), h: Math.round(ed.getBoundingClientRect().height) } : null,
      saveVisible: save ? vis(save) : false, saveRect: save ? { w: Math.round(save.getBoundingClientRect().width), h: Math.round(save.getBoundingClientRect().height) } : null,
      saveCls: save ? ((save.className || "").toString().match(/(gradient|rounded-\w+|text-\w+-\d+)/g) || []).slice(0, 4) : null,
      emptyStateStillVisible: !!emptyStill,
    };
  });

  // Type title + body with trusted input
  await page.locator("input[placeholder='Note title...']").fill("S177 probe C — delete me");
  const body = page.locator(".ql-editor[contenteditable='true']");
  await body.click({ timeout: 5000 });
  await body.type("probe body C", { delay: 40 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "/tmp/s177-p4-c.png" });

  // Count list rows before save
  out.rowsBeforeSave = await page.evaluate(() => {
    const aside = document.querySelector("aside");
    const rows = aside ? [...aside.querySelectorAll("button")].filter((el) => el.querySelector("h3, [class*='font-semibold'], [class*='font-medium']")) : [];
    return rows.length;
  });

  // Click Save (trusted) — the lifecycle measurement
  await page.locator("main button", { hasText: /^Save$/ }).first().click({ timeout: 6000 });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "/tmp/s177-p4-d.png" });
  out.rowsAfterSave = await page.evaluate(() => {
    const aside = document.querySelector("aside");
    const rows = aside ? [...aside.querySelectorAll("button")].filter((el) => el.querySelector("h3, [class*='font-semibold'], [class*='font-medium']")) : [];
    return { count: rows.length, titles: rows.slice(0, 4).map((el) => el.textContent.trim().slice(0, 50)) };
  });
  out.editorStillOpenAfterSave = await page.evaluate(() => {
    const ti = document.querySelector("main input[placeholder='Note title...']");
    return !!ti && ti.value;
  });

  // Residue cleanup — delete the created note through the UI
  try {
    const row = page.locator("aside button").filter({ hasText: "S177 probe C" }).first();
    if (await row.count() > 0) {
      await row.click({ timeout: 5000 });
      await page.waitForTimeout(1800);
      await page.screenshot({ path: "/tmp/s177-p4-e.png" });
      // The note's actions: find delete affordance (hover may be needed)
      await page.locator("aside button").filter({ hasText: "S177 probe C" }).first().hover();
      await page.waitForTimeout(700);
      const cleanupInfo = await page.evaluate(() => {
        const btns = [...document.querySelectorAll("button")];
        const byAria = btns.filter((b) => (b.getAttribute("aria-label") || "").match(/delete|trash|remove/i));
        return byAria.map((b) => ({ aria: b.getAttribute("aria-label"), inAside: !!b.closest("aside"), w: Math.round(b.getBoundingClientRect().width) }));
      });
      out.deleteAffordances = cleanupInfo;
      const asideDel = page.locator("aside button[aria-label*='Delete'], aside button[aria-label*='delete'], aside button[aria-label*='Trash'], aside button[aria-label*='trash']").first();
      if (await asideDel.count() > 0) {
        await asideDel.click({ timeout: 4000 });
        await page.waitForTimeout(1500);
      } else {
        await page.evaluate(() => {
          const b = [...document.querySelectorAll("main button")].find((el) => (el.getAttribute("aria-label") || "").match(/delete|trash/i));
          if (b) b.click();
        });
        await page.waitForTimeout(1500);
      }
      // confirm any dialog
      await page.evaluate(() => {
        const d = document.querySelector('[role="dialog"], [role="alertdialog"]');
        if (d) {
          const ok = [...d.querySelectorAll("button")].find((b) => /delete|confirm|remove/i.test(b.textContent || ""));
          if (ok) ok.click();
        }
      });
      await page.waitForTimeout(2000);
    }
  } catch (e) {
    out.cleanupError = String(e).slice(0, 150);
  }
  out.rowsAfterCleanup = await page.evaluate(() => {
    const aside = document.querySelector("aside");
    const rows = aside ? [...aside.querySelectorAll("button")].filter((el) => el.querySelector("h3, [class*='font-semibold'], [class*='font-medium']")) : [];
    return { count: rows.length, titles: rows.slice(0, 4).map((el) => el.textContent.trim().slice(0, 50)) };
  });
}

console.log(JSON.stringify(out, null, 1));
await ctx.close();
await browser.close();
