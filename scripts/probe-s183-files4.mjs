// S183 probe 4 — the last anatomy legs (the full list row, the move dialog's
// execution, the in-folder breadcrumb, the lightbox, the folder menu) + the
// COMPLETE zero-residue cleanup (the probe-1/3 fixture files + the probe
// folder + the prior session's leftover "SubFolder").
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const REF = "https://omni-study1.base44.app";
const store = {};
const save = () => writeFileSync("/tmp/s183-files-ref4.json", JSON.stringify(store, null, 2));
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
await page.keyboard.press("Escape").catch(() => {});
await page.waitForTimeout(400);

const stamp = "s183-1794626452684";
const cardOf = (name) => page.locator("main div.group").filter({ hasText: name }).first();

// ---- 1. the full list row ----
const toggleGroup = page.locator("main div.flex.border.border-slate-200.rounded-lg").first();
await toggleGroup.locator("button").nth(1).click();
await page.waitForTimeout(900);
store.listRowFull = await page.evaluate((name) => {
  const main = document.querySelector("main");
  const leaf = [...main.querySelectorAll("main *")].find((el) => el.children.length === 0 && (el.textContent || "").trim() === name);
  if (!leaf) return null;
  let row = leaf;
  while (row && row !== main) {
    if (/group/.test(String(row.className)) && /rounded-xl/.test(String(row.className))) break;
    row = row.parentElement;
  }
  return row ? row.outerHTML : null;
}, `${stamp}.png`);
save();
log("listRowFull len:", store.listRowFull?.length);
await toggleGroup.locator("button").nth(0).click();
await page.waitForTimeout(700);

// the search wrap icon (the exact position + svg class)
store.searchWrap = await page.evaluate(() => {
  const main = document.querySelector("main");
  const search = main.querySelector('input[placeholder*="Search"]');
  return search ? search.parentElement.outerHTML : null;
});
save();

// ---- 2. the move dialog: full HTML + the execution ----
await cardOf(`${stamp}.png`).locator('button[aria-haspopup="menu"]').click();
await page.waitForTimeout(800);
store.moveDialogHtml = null;
const moveTo = await page.$('[role=menuitem]:has-text("Move to Folder")');
if (moveTo) {
  await moveTo.click();
  await page.waitForTimeout(1400);
  store.moveDialogHtml = await page.evaluate(() => document.querySelector('[role=dialog]')?.outerHTML.slice(0, 4200) ?? null);
  save();
  log("moveDialogHtml len:", store.moveDialogHtml?.length);
  const dest = await page.$(`[role=dialog] button:has-text("s183-probe-folder")`);
  if (dest) { await dest.click(); await page.waitForTimeout(1800); }
}
store.afterMove = await page.evaluate((fname) => {
  const main = document.querySelector("main");
  const folderCard = [...main.querySelectorAll("main *")].find((el) => (el.textContent || "").includes(fname) && /0 files|1 file/.test((el.textContent || "")));
  return { body: main.textContent.trim().slice(0, 300), folderCardText: folderCard ? folderCard.textContent.trim().slice(0, 80) : null };
}, "s183-probe-folder");
save();
log("afterMove:", JSON.stringify(store.afterMove, null, 1));

// ---- 3. the in-folder breadcrumb + separator ----
await page.evaluate(() => {
  const main = document.querySelector("main");
  const leaf = [...main.querySelectorAll("main *")].find((el) => el.children.length === 0 && (el.textContent || "").trim() === "s183-probe-folder");
  if (!leaf) return;
  let card = leaf;
  while (card && card !== main) {
    if (/group/.test(String(card.className)) && /rounded-xl/.test(String(card.className))) break;
    card = card.parentElement;
  }
  const open = card ? [...card.querySelectorAll("button")].find((b) => (b.textContent || "").includes("s183-probe-folder")) : null;
  if (open) open.click();
}, {});
await page.waitForTimeout(2000);
store.inFolder = await page.evaluate(() => {
  const main = document.querySelector("main");
  const crumbRow = [...main.querySelectorAll("div")].find((d) => String(d.className) === "flex items-center gap-2 text-sm");
  return {
    body: main.textContent.trim().slice(0, 320),
    crumbRowHtml: crumbRow ? crumbRow.outerHTML : null,
    labels: [...main.querySelectorAll("main *")].filter((el) => {
      const t = ((el.childNodes.length && el.textContent) || "").trim();
      return (t === "Files" || t === "Folders") && el.children.length === 0;
    }).map((el) => el.textContent.trim()),
  };
});
save();
log("inFolder body:", store.inFolder?.body?.slice(0, 200));
log("crumbRowHtml:", store.inFolder?.crumbRowHtml?.slice(0, 700));

// ---- 4. the lightbox (the image tile click) ----
store.lightbox = null;
const tile = page.locator("main div.aspect-square.cursor-pointer").first();
if (await tile.count()) {
  await tile.click();
  await page.waitForTimeout(2200);
  store.lightbox = await page.evaluate(() => {
    const dlg = document.querySelector('[role=dialog]');
    if (!dlg) return null;
    const img = dlg.querySelector("img");
    return {
      dlgCls: String(dlg.className).slice(0, 200),
      texts: (dlg.textContent || "").trim().slice(0, 160),
      img: img ? { src: img.src.slice(0, 140), naturalW: img.naturalWidth, cls: String(img.className).slice(0, 160) } : null,
      controls: [...dlg.querySelectorAll("button, a")].map((b) => ({ tag: b.tagName.toLowerCase(), text: (b.textContent || "").trim().slice(0, 24), ariaLabel: b.getAttribute("aria-label"), href: (b.getAttribute("href") || "").slice(0, 90) })).slice(0, 8),
    };
  });
  save();
  log("lightbox:", JSON.stringify(store.lightbox, null, 1));
  await page.keyboard.press("Escape");
  await page.waitForTimeout(700);
}

// ---- 5. the folder card's ellipsis menu ----
await page.getByRole("button", { name: "All Files" }).click();
await page.waitForTimeout(1500);
store.folderMenu = null;
const folderCardBtn = page.locator("main div.group").filter({ hasText: "s183-probe-folder" }).first().locator('button[aria-haspopup="menu"]');
if (await folderCardBtn.count()) {
  await folderCardBtn.click();
  await page.waitForTimeout(900);
  store.folderMenu = await page.evaluate(() => [...document.querySelectorAll('[role=menuitem]')].map((i) => i.textContent.trim()));
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);
}
save();
log("folderMenu:", JSON.stringify(store.folderMenu));

// ---- 6. the move dialog's root option ("General (Root)") + the SubFolder question ----
// (already captured in moveDialogHtml; just note SubFolder exists at root level)

// ---- 7. the COMPLETE zero-residue cleanup ----
const deleteCard = async (name) => {
  const card = page.locator("main div.group").filter({ hasText: name }).first();
  if (!(await card.count())) return `MISSING ${name}`;
  await card.locator('button[aria-haspopup="menu"]').click();
  await page.waitForTimeout(800);
  const del = await page.$('[role=menuitem]:has-text("Delete")');
  if (!del) return `NO-DELETE ${name}`;
  await del.click();
  await page.waitForTimeout(1400);
  const confirm = await page.$('[role=dialog] button:has-text("Delete"), [role=alertdialog] button:has-text("Delete")');
  if (confirm) { await confirm.click(); await page.waitForTimeout(1400); }
  return `DELETED ${name}`;
};
const results = [];
// the png lives INSIDE s183-probe-folder now — delete it from the in-folder view first? It shows on root view too (folders immune). Try root view first.
results.push(await deleteCard(`${stamp}.png`));
for (const name of [`${stamp}.pdf`, "s183-1794626393213.txt", "s183-1794626393213.pdf", "s183-1794626393213.png"]) {
  results.push(await deleteCard(name));
}
results.push(await deleteCard("s183-probe-folder"));
results.push(await deleteCard("SubFolder"));
log("cleanup:", JSON.stringify(results));
await page.waitForTimeout(1200);
store.cleanupResults = results;
store.finalBody = await page.evaluate(() => document.querySelector("main").textContent.trim().slice(0, 280));
save();
log("finalBody:", JSON.stringify(store.finalBody));

await ctx.close();
await browser.close();
log("S183 PROBE 4 COMPLETE — store at /tmp/s183-files-ref4.json");
