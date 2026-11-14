// S183 probe 7 — the structural tail: the grid containers, the label+count
// rows, the true-zero empty state, the header action buttons. One folder
// round-trip (create via UI, measure, delete via UI) — zero residue at close.
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const REF = "https://omni-study1.base44.app";
const store = {};
const save = () => writeFileSync("/tmp/s183-files-ref7.json", JSON.stringify(store, null, 2));
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

await page.evaluate(() => {
  const a = [...document.querySelectorAll("nav a")].find((x) => x.textContent.trim().startsWith("Files"));
  if (a) a.click();
});
await page.waitForTimeout(2800);

// ---- 1. the true-zero state: the Files label row + the empty state ----
store.zeroState = await page.evaluate(() => {
  const main = document.querySelector("main");
  const label = [...main.querySelectorAll("main *")].find((el) => {
    const t = ((el.childNodes.length && el.textContent) || "").trim();
    return t === "Files" && el.children.length === 0;
  });
  return {
    labelRowHtml: label ? label.parentElement.outerHTML : null,
    emptyHtml: (() => {
      const h3 = [...main.querySelectorAll("h3")].find((h) => h.textContent.trim() === "No files yet");
      return h3 ? h3.parentElement.outerHTML.slice(0, 1500) : null;
    })(),
    headerActions: [...main.querySelectorAll("button")].filter((b) => /New Folder|Upload/.test((b.textContent || "").trim())).map((b) => String(b.className).slice(0, 240)),
  };
});
save();
log("labelRowHtml:", store.zeroState.labelRowHtml?.slice(0, 300));
log("emptyHtml:", store.zeroState.emptyHtml?.slice(0, 600));
log("headerActions:", JSON.stringify(store.zeroState.headerActions, null, 1));

// ---- 2. one folder round-trip: the folders label row + the grid container ----
await page.getByRole("button", { name: "New Folder" }).click();
await page.waitForTimeout(800);
await page.locator('[role=dialog] input').fill("s183-structure-probe");
await page.waitForTimeout(300);
const createBtn = await page.$('[role=dialog] button:has-text("Create")');
if (createBtn) await createBtn.click();
await page.waitForTimeout(1800);

store.withFolder = await page.evaluate(() => {
  const main = document.querySelector("main");
  const folderLabel = [...main.querySelectorAll("main *")].find((el) => {
    const t = ((el.childNodes.length && el.textContent) || "").trim();
    return t === "Folders" && el.children.length === 0;
  });
  const filesLabel = [...main.querySelectorAll("main *")].find((el) => {
    const t = ((el.childNodes.length && el.textContent) || "").trim();
    return t === "Files" && el.children.length === 0;
  });
  // the grid containers: the folder card's parent + the (empty) files area
  const folderCard = main.querySelector("button.group");
  return {
    folderLabelRowHtml: folderLabel ? folderLabel.parentElement.outerHTML : null,
    filesLabelRowHtml: filesLabel ? filesLabel.parentElement.outerHTML : null,
    folderGridCls: folderCard?.parentElement ? String(folderCard.parentElement.className).slice(0, 160) : null,
    gridSiblings: folderCard?.parentElement ? String(folderCard.parentElement.outerHTML).slice(0, 300) : null,
  };
});
save();
log("folderLabelRowHtml:", store.withFolder.folderLabelRowHtml?.slice(0, 240));
log("filesLabelRowHtml:", store.withFolder.filesLabelRowHtml?.slice(0, 300));
log("folderGridCls:", store.withFolder.folderGridCls);

// ---- 3. cleanup: delete the structure-probe folder ----
const card = page.locator("main button.group").filter({ hasText: "s183-structure-probe" }).first();
await card.locator('button[aria-haspopup="menu"]').click();
await page.waitForTimeout(900);
const del = await page.$('[role=menuitem]:has-text("Delete")');
if (del) {
  await del.click();
  await page.waitForTimeout(1500);
  const confirm = await page.$('[role=dialog] button:has-text("Delete"), [role=alertdialog] button:has-text("Delete")');
  if (confirm) { await confirm.click(); await page.waitForTimeout(1500); }
}
store.finalBody = await page.evaluate(() => document.querySelector("main").textContent.trim().slice(0, 240));
save();
log("finalBody:", JSON.stringify(store.finalBody));

await ctx.close();
await browser.close();
log("S183 PROBE 7 COMPLETE — store at /tmp/s183-files-ref7.json");
