// S178 one-shot probe — the view/edit MODE SPLIT deep measurement (the
// S177 plan §1 B-3 deferral, this cycle's axis). Computed DOM is ground
// truth (the repo doctrine). Trusted Playwright clicks only (the s177
// lesson); the pre-hydration fill trap guarded (submit-enabled wait);
// zero residue on the write path (the cleanup rides the reference's own
// trash — the s177 lesson-2 discipline).
import { chromium } from "playwright";

const REF = "https://omni-study1.base44.app";

const PANE_CENSUS = `(() => {
  const main = document.querySelector("main");
  const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.display !== "none" && cs.visibility !== "hidden"; };
  const btns = main ? [...main.querySelectorAll("button")] : [];
  const inputs = main ? [...main.querySelectorAll("input")] : [];
  const titleInput = inputs.find((el) => (el.getAttribute("placeholder") || "").match(/note title/i)) || null;
  const anyTitle = titleInput || [...main.querySelectorAll("input")].find((el) => el.closest(".flex-1, [class*='flex-1']") === null && el.getBoundingClientRect().width > 200) || null;
  const prose = main ? main.querySelector(".prose, [class*='note-content']") : null;
  const ql = main ? main.querySelector(".ql-editor") : null;
  const tagIn = [...(main ? main.querySelectorAll("input") : [])].find((el) => (el.getAttribute("placeholder") || "").match(/add tag/i));
  const fontRow = [...(main ? main.querySelectorAll("span, div") : [])].find((el) => /^font:$/i.test((el.textContent || "").trim()) && vis(el));
  const attach = [...(main ? main.querySelectorAll("button, label, span") : [])].find((el) => /attach file/i.test((el.textContent || "").trim()) && vis(el));
  const save = btns.find((b) => /^save$/i.test((b.textContent || "").trim()) && vis(b));
  const edit = btns.find((b) => /^edit$/i.test((b.textContent || "").trim()) && vis(b));
  const trash = btns.find((b) => /trash/i.test(b.getAttribute("aria-label") || "") || (b.querySelector("svg.lucide-trash, svg[class*='trash']")) && vis(b));
  const pin = btns.find((b) => /pin/i.test(b.getAttribute("aria-label") || ""));
  const pal = btns.find((b) => /color|palette/i.test(b.getAttribute("aria-label") || ""));
  const rowBtns = [...(document.querySelector("aside") ? document.querySelectorAll("aside button") : [])];
  const noteRows = rowBtns.filter((el) => el.querySelector("h3, [class*='font-semibold'], [class*='font-medium']"));
  const btnGeo = (b) => b ? { w: Math.round(b.getBoundingClientRect().width), h: Math.round(b.getBoundingClientRect().height), aria: b.getAttribute("aria-label"), text: (b.textContent || "").trim().slice(0, 18), cls: ((b.className || "").toString().match(/(outline|gradient|text-red-\\d+|rounded-\\w+|px-\\d+|border\\b|border-\\w+-\\d+)/g) || []).slice(0, 8) } : null;
  const asideRowIcons = noteRows.length > 0 ? [...noteRows[0].querySelectorAll("svg")].map((s) => (s.getAttribute("class") || "").match(/lucide-([a-z-]+)/) ? s.getAttribute("class").match(/lucide-([a-z-]+)/)[1] : "?").slice(0, 6) : [];
  return {
    noteRowCount: noteRows.length,
    rowIcons: asideRowIcons,
    titleInput: titleInput ? { disabled: titleInput.disabled, readOnly: titleInput.readOnly, value: (titleInput.value || "").slice(0, 30), placeholder: titleInput.getAttribute("placeholder"), w: Math.round(titleInput.getBoundingClientRect().width), fontSize: getComputedStyle(titleInput).fontSize, fontWeight: getComputedStyle(titleInput).fontWeight, color: getComputedStyle(titleInput).color } : null,
    proseBody: prose ? { tag: prose.tagName.toLowerCase(), cls: (prose.className || "").toString().slice(0, 90), editable: prose.getAttribute("contenteditable"), text: (prose.textContent || "").trim().slice(0, 60), fontSize: getComputedStyle(prose).fontSize, lineHeight: getComputedStyle(prose).lineHeight, color: getComputedStyle(prose).color } : null,
    qlEditor: ql ? { editable: ql.getAttribute("contenteditable"), html: (ql.innerHTML || "").slice(0, 60) } : null,
    hasTagRow: !!tagIn, hasFontRow: !!fontRow, hasAttach: !!attach,
    saveBtn: btnGeo(save), editBtn: btnGeo(edit), trashBtn: btnGeo(trash), pinBtn: btnGeo(pin), palBtn: btnGeo(pal),
    dialogOpen: !!document.querySelector('[role="dialog"]'),
    toast: [...document.querySelectorAll("[class*='toast'], [role='status'], [data-sonner-toast], [class*='Toast']")].filter(vis).map((el) => (el.textContent || "").trim().slice(0, 40)).slice(0, 2),
  };
})()`;

async function login(page) {
  await page.goto(`${REF}/login`);
  await page.fill("input[type=email]", process.env.REF_PROBE_EMAIL);
  await page.fill("input[type=password]", process.env.REF_PROBE_PASSWORD);
  await page.waitForFunction(() => {
    const btn = document.querySelector("button[type=submit]");
    return btn !== null && !btn.disabled;
  }, null, { timeout: 15000 });
  await page.click("button[type=submit]");
  await page.waitForFunction(() => document.querySelector("main") !== null && document.querySelector("nav") !== null, null, { timeout: 30000 });
  await page.waitForTimeout(2000);
}

const out = {};
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await login(page);
await page.getByRole("link", { name: /^Notes/ }).click();
await page.waitForTimeout(2500);
out.start = await page.evaluate(PANE_CENSUS);
await page.screenshot({ path: "/tmp/s178-a-start.png" });

// ---------- Create the probe note through the reference's own draft flow ----------
const cta = page.getByRole("button", { name: "New Note" }).first();
await cta.click({ timeout: 8000 });
await page.locator("input[placeholder='Note title...']").waitFor({ state: "visible", timeout: 8000 });
await page.waitForTimeout(1200);
await page.locator("input[placeholder='Note title...']").fill("S178 probe — delete me");
const body = page.locator(".ql-editor[contenteditable='true']");
await body.click({ timeout: 5000 });
await body.type("view mode probe body one", { delay: 30 });
await page.waitForTimeout(600);
out.preSave = await page.evaluate(`(() => {
  const main = document.querySelector("main");
  const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.display !== "none" && cs.visibility !== "hidden"; };
  const btns = [...(main ? main.querySelectorAll("button") : [])].filter(vis);
  return { savePresent: btns.some((b) => /^Save$/i.test((b.textContent || "").trim())), allVisibleTexts: btns.map((b) => (b.textContent || "").trim().slice(0, 12)), titleVal: (document.querySelector("main input[placeholder*='title']") || {}).value || null, qlHtml: (document.querySelector("main .ql-editor") || {}).innerHTML ? document.querySelector("main .ql-editor").innerHTML.slice(0, 50) : null };
})()`);
console.log("PRE-SAVE STATE:", JSON.stringify(out.preSave));
// Locator-variant diagnostic: which form resolves?
out.locDiag = {
  mainBtnHasText: await page.locator("main button", { hasText: /^Save$/ }).count(),
  mainBtnHasTextSub: await page.locator("main button", { hasText: "Save" }).count(),
  mainSaveBtn: await page.locator("main button:has-text('Save')").count(),
  roleSave: await page.getByRole("button", { name: "Save", exact: true }).count(),
  mainBtnTotal: await page.locator("main button").count(),
};
console.log("LOC-DIAG:", JSON.stringify(out.locDiag));
if (out.locDiag.roleSave > 0) {
  await page.getByRole("button", { name: "Save", exact: true }).first().click({ timeout: 6000 });
} else if (out.locDiag.mainSaveBtn > 0) {
  await page.locator("main button:has-text('Save')").first().click({ timeout: 6000 });
} else {
  await page.locator("main button", { hasText: /^Save$/ }).first().click({ timeout: 6000 });
}
await page.waitForTimeout(2500);

// ---------- VIEW MODE (the post-Save state — the B-3 core) ----------
out.viewMode = await page.evaluate(PANE_CENSUS);
await page.screenshot({ path: "/tmp/s178-b-viewmode.png" });

// The action-row census in full (class-level anatomy of every visible button in the right pane)
out.viewModeActionRow = await page.evaluate(() => {
  const main = document.querySelector("main");
  const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.display !== "none" && cs.visibility !== "hidden"; };
  return [...(main ? main.querySelectorAll("button") : [])].filter(vis).map((b) => {
    const r = b.getBoundingClientRect(); const cs = getComputedStyle(b);
    return { w: Math.round(r.width), h: Math.round(r.height), aria: b.getAttribute("aria-label"), text: (b.textContent || "").trim().slice(0, 14), bg: cs.backgroundColor, border: cs.borderTopColor + " " + cs.borderTopWidth, cls: ((b.className || "").toString().slice(0, 110)) };
  }).slice(0, 12);
});

// The pin + palette quick records (B-4/B-5 ledger re-verify — cheap clicks)
try {
  const pinBtn = page.locator("main button", { hasText: /^$/ }).first();
  const pin = await page.evaluate(() => {
    const btns = [...document.querySelectorAll("main button")];
    return btns.filter((b) => { const r = b.getBoundingClientRect(); return r.width > 30 && r.width < 44 && !b.textContent.trim(); }).map((b) => ({ w: Math.round(b.getBoundingClientRect().width), aria: b.getAttribute("aria-label"), cls: ((b.className || "").toString().slice(0, 70)), svg: b.querySelector("svg") ? (b.querySelector("svg").getAttribute("class") || "").match(/lucide-([a-z-]+)/)?.[1] : null }));
  });
  out.viewModeIconButtons = pin;
  // Click the pin (first icon-only button) — record the state delta + the row icon
  const pinTarget = await page.evaluate(() => {
    const btns = [...document.querySelectorAll("main button")];
    const b = btns.find((el) => { const r = el.getBoundingClientRect(); return r.width > 30 && r.width < 44 && !el.textContent.trim() && el.querySelector("svg[class*='pin']"); });
    if (b) { b.click(); return true; }
    return false;
  });
  await page.waitForTimeout(1200);
  out.pinClicked = { found: !!pinTarget, after: await page.evaluate(PANE_CENSUS) };
  // Toggle back (restore the reference's state — zero residue)
  if (pinTarget) {
    await page.evaluate(() => {
      const btns = [...document.querySelectorAll("main button")];
      const b = btns.find((el) => { const r = el.getBoundingClientRect(); return r.width > 30 && r.width < 44 && !el.textContent.trim() && el.querySelector("svg[class*='pin']"); });
      if (b) b.click();
    });
    await page.waitForTimeout(1200);
  }
  out.pinRestored = await page.evaluate(PANE_CENSUS);
} catch (e) { out.pinError = String(e).slice(0, 120); }

// ---------- The EDIT switch ----------
try {
  const editBtn = page.getByRole("button", { name: "Edit", exact: true }).first();
  await editBtn.click({ timeout: 6000 });
  await page.waitForTimeout(1500);
  out.editMode = await page.evaluate(PANE_CENSUS);
  out.editModeActionRow = await page.evaluate(() => {
    const main = document.querySelector("main");
    const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.display !== "none" && cs.visibility !== "hidden"; };
    return [...(main ? main.querySelectorAll("button") : [])].filter(vis).map((b) => {
      const r = b.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height), aria: b.getAttribute("aria-label"), text: (b.textContent || "").trim().slice(0, 14), cls: ((b.className || "").toString().slice(0, 110)) };
    }).slice(0, 12);
  });
  await page.screenshot({ path: "/tmp/s178-c-editmode.png" });

  // ---------- The X-exit leg: type a change, then X — discard or persist? ----------
  const ed = page.locator(".ql-editor[contenteditable='true']");
  await ed.click({ timeout: 5000 });
  await ed.type(" CHANGED-TEXT", { delay: 30 });
  await page.waitForTimeout(7000); // the autosave window (7s — the S177 measured no-autosave contract)
  const preExit = await page.evaluate(PANE_CENSUS);
  out.editTypedPreExit = { qlHtml: preExit.qlEditor ? preExit.qlEditor.html : null, rowCount: preExit.noteRowCount };
  // X (the icon-only discard/exit button — snapshot-driven per the s177 lesson-2)
  const xClicked = await page.evaluate(() => {
    const btns = [...document.querySelectorAll("main button")];
    const b = btns.find((el) => el.querySelector("svg[class*='x']") && !el.textContent.trim() && el.getBoundingClientRect().width < 60 && !((el.getAttribute("aria-label") || "").match(/tag|notebook/i)));
    if (b) { b.click(); return true; }
    return false;
  });
  await page.waitForTimeout(1800);
  out.xExit = { clicked: xClicked, after: await page.evaluate(PANE_CENSUS) };
  await page.screenshot({ path: "/tmp/s178-d-after-x.png" });
} catch (e) { out.editLegError = String(e).slice(0, 160); }

// ---------- The Save leg: edit → type → Save → view mode returns? ----------
try {
  const editBtn2 = page.getByRole("button", { name: "Edit", exact: true }).first();
  if (await editBtn2.count() > 0) {
    await editBtn2.click({ timeout: 6000 });
    await page.waitForTimeout(1500);
    const ed2 = page.locator(".ql-editor[contenteditable='true']");
    await ed2.click({ timeout: 5000 });
    await ed2.type(" SAVED-TEXT", { delay: 30 });
    await page.getByRole("button", { name: "Save", exact: true }).first().click({ timeout: 6000 });
    await page.waitForTimeout(2500);
    out.saveLeg = await page.evaluate(PANE_CENSUS);
    await page.screenshot({ path: "/tmp/s178-e-after-save.png" });
  }
} catch (e) { out.saveLegError = String(e).slice(0, 160); }

// ---------- The trash leg: view mode → trash → direct delete? ----------
try {
  const preTrash = await page.evaluate(PANE_CENSUS);
  const trashClicked = await page.evaluate(() => {
    const btns = [...document.querySelectorAll("main button")];
    const b = btns.find((el) => (el.getAttribute("aria-label") || "").match(/delete|trash/i)) || btns.find((el) => el.querySelector("svg[class*='trash']"));
    if (b) { b.click(); return true; }
    return false;
  });
  await page.waitForTimeout(1200);
  const dialogState = await page.evaluate(() => !!document.querySelector('[role="dialog"], [role="alertdialog"]'));
  // if a confirm dialog appeared, click it through (record that it did)
  if (dialogState) {
    await page.evaluate(() => {
      const d = document.querySelector('[role="dialog"], [role="alertdialog"]');
      const ok = d ? [...d.querySelectorAll("button")].find((b) => /delete|confirm|remove/i.test(b.textContent || "")) : null;
      if (ok) ok.click();
    });
    await page.waitForTimeout(1500);
  }
  await page.waitForTimeout(1500);
  out.trashLeg = { preCount: preTrash.noteRowCount, clicked: trashClicked, hadConfirmDialog: dialogState, after: await page.evaluate(PANE_CENSUS) };
  await page.screenshot({ path: "/tmp/s178-f-after-trash.png" });
} catch (e) { out.trashLegError = String(e).slice(0, 160); }

// ---------- The mobile view-mode posture (390×844) ----------
try {
  const mctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mpage = await mctx.newPage();
  await login(mpage);
  // Mobile: the nav links live inside the drawer — open it via the app-bar
  // menu button (aria-label or the lucide-menu icon), then click the Notes link.
  let drawerOpened = false;
  try {
    const menuBtn = mpage.locator("button[aria-label*='enu'], button[aria-label*='avigation']").first();
    if (await menuBtn.count() > 0) {
      await menuBtn.click({ timeout: 6000 });
      drawerOpened = true;
    }
  } catch { drawerOpened = false; }
  if (!drawerOpened) {
    await mpage.evaluate(() => {
      const b = [...document.querySelectorAll("button")].find((el) => el.querySelector("svg[class*='menu'], svg[class*='lucide-menu']"));
      if (b) b.click();
    });
    await mpage.waitForTimeout(900);
  }
  await mpage.getByRole("link", { name: /^Notes/ }).click({ timeout: 10000 });
  await mpage.waitForTimeout(2500);
  const mcta = mpage.getByRole("button", { name: "New Note" }).first();
  await mcta.click({ timeout: 8000 });
  await mpage.locator("input[placeholder='Note title...']").waitFor({ state: "visible", timeout: 8000 });
  await mpage.locator("input[placeholder='Note title...']").fill("S178 mobile probe — delete me");
  const mbody = mpage.locator(".ql-editor[contenteditable='true']");
  await mbody.click({ timeout: 5000 });
  await mbody.type("mobile view mode body", { delay: 25 });
  await mpage.getByRole("button", { name: "Save", exact: true }).first().click({ timeout: 6000 });
  await mpage.waitForTimeout(2500);
  out.mobile = await mpage.evaluate(`(() => {
    const prose = document.querySelector("main .prose, main [class*='note-content']");
    return { scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth, prose: prose ? (prose.textContent || "").trim().slice(0, 40) : null };
  })()`);
  await mpage.screenshot({ path: "/tmp/s178-g-mobile-viewmode.png" });
  // cleanup: delete through the reference's own trash
  await mpage.evaluate(() => {
    const btns = [...document.querySelectorAll("main button")];
    const b = btns.find((el) => (el.getAttribute("aria-label") || "").match(/delete|trash/i)) || btns.find((el) => el.querySelector("svg[class*='trash']"));
    if (b) b.click();
  });
  await mpage.waitForTimeout(2500);
  out.mobileAfterCleanup = await mpage.evaluate(`(() => {
    const aside = document.querySelector("aside");
    const rows = aside ? [...aside.querySelectorAll("button")].filter((el) => el.querySelector("h3, [class*='font-semibold'], [class*='font-medium']")) : [];
    return { noteRowCount: rows.length, scrollWidth: document.documentElement.scrollWidth };
  })()`);
  await mctx.close();
} catch (e) { out.mobileError = String(e).slice(0, 200); }

// ---------- Desktop residue check ----------
out.finalResidue = await page.evaluate(PANE_CENSUS);
console.log(JSON.stringify(out, null, 1));
await ctx.close();
await browser.close();
