// S183 probe 3 — the full anatomy pass + the UI-driven zero-residue cleanup.
// The probe-1 residue (5 files) are the fixtures — no new uploads (the
// reference's 20/15-min upload budget is a shared, in-window resource).
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const REF = "https://omni-study1.base44.app";
const store = {};
const save = () => writeFileSync("/tmp/s183-files-ref3.json", JSON.stringify(store, null, 2));
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

const stamp = "s183-1794626452684"; // one of the residue stamps
const cardOf = (name) => page.locator("main div.group").filter({ hasText: name }).first();

// ---- 1. the full file card HTML (grid mode) ----
store.fileCardHtml = await page.evaluate((name) => {
  const main = document.querySelector("main");
  const leaf = [...main.querySelectorAll("main *")].find((el) => el.children.length === 0 && (el.textContent || "").trim() === name);
  if (!leaf) return null;
  let card = leaf;
  while (card && card !== main) {
    if (/group/.test(String(card.className)) && /rounded-xl/.test(String(card.className))) break;
    card = card.parentElement;
  }
  return card ? card.outerHTML : null;
}, `${stamp}.png`);
save();
log("fileCardHtml len:", store.fileCardHtml?.length);

// ---- 2. create a folder through the UI dialog ----
await page.getByRole("button", { name: "New Folder" }).click();
await page.waitForTimeout(800);
const folderName = "s183-probe-folder";
await page.locator('[role=dialog] input').fill(folderName);
await page.waitForTimeout(300);
const createBtn = await page.$('[role=dialog] button:has-text("Create")');
if (createBtn) { await createBtn.click(); } else {
  const anyBtn = await page.$('[role=dialog] button[type=submit]');
  if (anyBtn) await anyBtn.click();
}
await page.waitForTimeout(1800);

// ---- 3. the folder card + the Folders section label + the counts ----
store.folderSection = await page.evaluate((fname) => {
  const main = document.querySelector("main");
  const labels = [...main.querySelectorAll("main *")].filter((el) => {
    const t = ((el.childNodes.length && el.textContent) || "").trim();
    return (t === "Files" || t === "Folders") && el.children.length === 0;
  }).map((el) => ({ tag: el.tagName.toLowerCase(), text: el.textContent.trim(), cls: String(el.className).slice(0, 160) }));
  const folderLeaf = [...main.querySelectorAll("main *")].find((el) => el.children.length === 0 && (el.textContent || "").trim() === fname);
  let card = folderLeaf;
  while (card && card !== main) {
    if (/group/.test(String(card.className)) && /rounded-xl/.test(String(card.className))) break;
    card = card.parentElement;
  }
  const counts = [...main.querySelectorAll("main *")].filter((el) => /^\d+\s+(files?|items?)$/.test((el.textContent || "").trim()) && el.children.length === 0)
    .map((el) => ({ text: el.textContent.trim(), cls: String(el.className).slice(0, 120) }));
  return { labels, folderCardHtml: card ? card.outerHTML : null, counts };
}, folderName);
save();
log("folderSection labels:", JSON.stringify(store.folderSection.labels), "counts:", JSON.stringify(store.folderSection.counts));
log("folderCardHtml len:", store.folderSection.folderCardHtml?.length);

// ---- 4. the filter + folder interplay (folders immune?) ----
await page.click('[role=combobox]');
await page.waitForTimeout(600);
await page.click('[role=option]:has-text("Images")');
await page.waitForTimeout(1000);
store.filterWithFolder = await page.evaluate((fname) => {
  const main = document.querySelector("main");
  const visible = (txt) => [...main.querySelectorAll("main *")].some((el) => el.children.length === 0 && (el.textContent || "").trim() === txt);
  return { png: visible("s183-1794626452684.png"), folder: visible(fname) };
}, folderName);
save();
log("filterWithFolder:", JSON.stringify(store.filterWithFolder));
await page.click('[role=combobox]');
await page.waitForTimeout(500);
await page.click('[role=option]:has-text("All Types")');
await page.waitForTimeout(800);

// the Other leg: the txt file
await page.click('[role=combobox]');
await page.waitForTimeout(500);
await page.click('[role=option]:has-text("Other")');
await page.waitForTimeout(1000);
store.otherFilter = await page.evaluate(() => {
  const main = document.querySelector("main");
  const visible = (txt) => [...main.querySelectorAll("main *")].some((el) => el.children.length === 0 && (el.textContent || "").trim() === txt);
  return { txt: visible("s183-1794626393213.txt"), png: visible("s183-1794626452684.png") };
});
save();
log("otherFilter:", JSON.stringify(store.otherFilter));
await page.click('[role=combobox]');
await page.waitForTimeout(500);
await page.click('[role=option]:has-text("All Types")');
await page.waitForTimeout(800);

// the search + folder interplay
await page.fill('input[placeholder*="Search"]', "s183-1794626452");
await page.waitForTimeout(900);
store.searchWithFolder = await page.evaluate((fname) => {
  const main = document.querySelector("main");
  const visible = (txt) => [...main.querySelectorAll("main *")].some((el) => el.children.length === 0 && (el.textContent || "").trim() === txt);
  return { png: visible("s183-1794626452684.png"), folder: visible(fname) };
}, folderName);
save();
log("searchWithFolder:", JSON.stringify(store.searchWithFolder));
await page.fill('input[placeholder*="Search"]', "");
await page.waitForTimeout(800);

// ---- 5. the list mode (the toggle's second button) ----
const toggleGroup = page.locator("main div.flex.border.border-slate-200.rounded-lg").first();
store.toggleHtml = await toggleGroup.evaluate((el) => el.outerHTML);
log("toggleHtml:", store.toggleHtml.slice(0, 700));
await toggleGroup.locator("button").nth(1).click();
await page.waitForTimeout(1000);
store.listRowHtml = await page.evaluate((name) => {
  const main = document.querySelector("main");
  const leaf = [...main.querySelectorAll("main *")].find((el) => el.children.length === 0 && (el.textContent || "").trim() === name);
  if (!leaf) return null;
  let row = leaf;
  while (row && row !== main) {
    const p = row.parentElement;
    if (p && /space-y|divide-y/.test(String(p.className))) break;
    row = p;
  }
  return row ? row.outerHTML.slice(0, 2200) : null;
}, `${stamp}.png`);
save();
log("listRowHtml len:", store.listRowHtml?.length);
// back to grid
await toggleGroup.locator("button").nth(0).click();
await page.waitForTimeout(700);

// ---- 6. the move dialog ----
await cardOf(`${stamp}.png`).locator('button[aria-haspopup="menu"]').click();
await page.waitForTimeout(800);
store.moveDialog = null;
const moveTo = await page.$('[role=menuitem]:has-text("Move to Folder")');
if (moveTo) {
  await moveTo.click();
  await page.waitForTimeout(1200);
  store.moveDialog = await page.evaluate(() => {
    const dlg = document.querySelector('[role=dialog]');
    if (!dlg) return null;
    return {
      title: dlg.querySelector("h1, h2, h3")?.textContent?.trim() ?? null,
      texts: (dlg.textContent || "").trim().slice(0, 320),
      comboBoxes: dlg.querySelectorAll('[role=combobox]').length,
      buttons: [...dlg.querySelectorAll("button")].map((b) => (b.textContent || "").trim().slice(0, 24)).filter(Boolean),
    };
  });
  await page.click('[role=dialog] [role=combobox]').catch(() => {});
  await page.waitForTimeout(800);
  store.moveOptions = await page.evaluate(() => [...document.querySelectorAll('[role=option]')].map((o) => o.textContent.trim()));
  save();
  log("moveDialog:", JSON.stringify(store.moveDialog, null, 1));
  log("moveOptions:", JSON.stringify(store.moveOptions));
  const opt = await page.$(`[role=option]:has-text("${folderName}")`);
  if (opt) { await opt.click(); await page.waitForTimeout(500); }
  const mv = await page.$('[role=dialog] button:has-text("Move")');
  if (mv) { await mv.click(); await page.waitForTimeout(1600); }
}

// ---- 7. the in-folder breadcrumb pair ----
await page.evaluate((fname) => {
  const main = document.querySelector("main");
  const leaf = [...main.querySelectorAll("main *")].find((el) => el.children.length === 0 && (el.textContent || "").trim() === fname);
  if (!leaf) return;
  let card = leaf;
  while (card && card !== main) {
    if (/group/.test(String(card.className)) && /rounded-xl/.test(String(card.className))) break;
    card = card.parentElement;
  }
  const open = card ? [...card.querySelectorAll("button")].find((b) => (b.textContent || "").includes(fname)) : null;
  if (open) open.click();
}, folderName);
await page.waitForTimeout(1800);
store.inFolder = await page.evaluate((fname) => {
  const main = document.querySelector("main");
  const crumbRow = [...main.querySelectorAll("div")].find((d) => String(d.className) === "flex items-center gap-2 text-sm");
  return {
    body: main.textContent.trim().slice(0, 350),
    crumbRowHtml: crumbRow ? crumbRow.outerHTML : null,
    hasFoldersLabel: [...main.querySelectorAll("main *")].some((el) => {
      const t = ((el.childNodes.length && el.textContent) || "").trim();
      return t === "Folders" && el.children.length === 0;
    }),
    folderName,
  };
}, folderName);
save();
log("inFolder body:", store.inFolder?.body?.slice(0, 200));
log("crumbRowHtml:", store.inFolder?.crumbRowHtml?.slice(0, 600));

// ---- 8. the view lightbox ----
await page.getByRole("button", { name: "All Files" }).click();
await page.waitForTimeout(1400);
await cardOf(`${stamp}.png`).locator('button[aria-haspopup="menu"]').click();
await page.waitForTimeout(700);
store.lightbox = null;
const viewItem = await page.$('[role=menuitem]:has-text("View")');
if (viewItem) {
  await viewItem.click();
  await page.waitForTimeout(2000);
  store.lightbox = await page.evaluate(() => {
    const dlg = document.querySelector('[role=dialog]');
    if (!dlg) return null;
    const img = dlg.querySelector("img");
    return {
      dlgCls: String(dlg.className).slice(0, 200),
      texts: (dlg.textContent || "").trim().slice(0, 160),
      img: img ? { src: img.src.slice(0, 140), naturalW: img.naturalWidth, cls: String(img.className).slice(0, 160) } : null,
      controls: [...dlg.querySelectorAll("button, a")].map((b) => ({ tag: b.tagName.toLowerCase(), text: (b.textContent || "").trim().slice(0, 24), ariaLabel: b.getAttribute("aria-label"), href: b.getAttribute("href")?.slice(0, 80) ?? null })).slice(0, 8),
    };
  });
  save();
  log("lightbox:", JSON.stringify(store.lightbox, null, 1));
  await page.keyboard.press("Escape");
  await page.waitForTimeout(700);
}

// ---- 9. the folder card's ellipsis menu ----
store.folderMenu = null;
await cardOf(folderName).locator('button[aria-haspopup="menu"]').click();
await page.waitForTimeout(800);
store.folderMenu = await page.evaluate(() => [...document.querySelectorAll('[role=menuitem]')].map((i) => i.textContent.trim()));
save();
log("folderMenu:", JSON.stringify(store.folderMenu));
await page.keyboard.press("Escape");
await page.waitForTimeout(500);

// ---- 10. the zero-residue cleanup (UI: card menu Delete per row) ----
const deleteCard = async (name) => {
  const card = cardOf(name);
  if (!(await card.count())) return `MISSING ${name}`;
  await card.locator('button[aria-haspopup="menu"]').click();
  await page.waitForTimeout(800);
  const del = await page.$('[role=menuitem]:has-text("Delete")');
  if (!del) return `NO-DELETE ${name}`;
  await del.click();
  await page.waitForTimeout(1300);
  const confirm = await page.$('[role=dialog] button:has-text("Delete"), [role=alertdialog] button:has-text("Delete")');
  if (confirm) { await confirm.click(); await page.waitForTimeout(1300); }
  return `DELETED ${name}`;
};
const results = [];
for (const name of [`${stamp}.pdf`, `${stamp}.png`, "s183-1794626393213.txt", "s183-1794626393213.pdf", "s183-1794626393213.png"]) {
  results.push(await deleteCard(name));
}
results.push(await deleteCard(folderName));
log("cleanup:", JSON.stringify(results));
await page.waitForTimeout(1200);
store.cleanupResults = results;
store.finalBody = await page.evaluate(() => document.querySelector("main").textContent.trim().slice(0, 260));
save();
log("finalBody:", JSON.stringify(store.finalBody));

await ctx.close();
await browser.close();
log("S183 PROBE 3 COMPLETE — store at /tmp/s183-files-ref3.json");
