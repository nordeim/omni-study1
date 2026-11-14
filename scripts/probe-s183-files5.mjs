// S183 probe 5 — the final legs (the in-folder crumb pair, the image
// lightbox, the folder menu, the non-image tile) + the COMPLETE zero-residue
// cleanup (the moved png + 4 root files + s183-probe-folder + SubFolder).
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const REF = "https://omni-study1.base44.app";
const store = {};
const save = () => writeFileSync("/tmp/s183-files-ref5.json", JSON.stringify(store, null, 2));
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

// ---- 1. the non-image (pdf) grid tile ----
store.pdfTile = await page.evaluate(() => {
  const main = document.querySelector("main");
  const leaf = [...main.querySelectorAll("main *")].find((el) => el.children.length === 0 && (el.textContent || "").trim().endsWith(".pdf") && (el.textContent || "").startsWith("s183-1794626452"));
  if (!leaf) return null;
  let card = leaf;
  while (card && card !== main) {
    if (/group/.test(String(card.className)) && /rounded-xl/.test(String(card.className))) break;
    card = card.parentElement;
  }
  if (!card) return null;
  const tile = card.querySelector(".aspect-square");
  return tile ? tile.outerHTML : null;
});
save();
log("pdfTile:", store.pdfTile?.slice(0, 500));

// ---- 2. navigate INTO s183-probe-folder (click the card button itself) ----
await page.evaluate(() => {
  const main = document.querySelector("main");
  const leaf = [...main.querySelectorAll("main *")].find((el) => el.children.length === 0 && (el.textContent || "").trim() === "s183-probe-folder");
  if (!leaf) return;
  let card = leaf;
  while (card && card !== main) {
    if (String(card.tagName).toLowerCase() === "button" && /rounded-xl/.test(String(card.className))) break;
    card = card.parentElement;
  }
  if (card) card.click();
});
await page.waitForTimeout(2200);
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
log("inFolder body:", store.inFolder?.body?.slice(0, 220));
log("crumbRowHtml:", store.inFolder?.crumbRowHtml?.slice(0, 1100));

// ---- 3. the image lightbox (the png inside the folder) ----
store.lightboxImg = null;
const pngTile = page.locator("main div.aspect-square.cursor-pointer").first();
if (await pngTile.count()) {
  await pngTile.click();
  await page.waitForTimeout(2400);
  store.lightboxImg = await page.evaluate(() => {
    const dlg = document.querySelector('[role=dialog]');
    if (!dlg) return null;
    const img = dlg.querySelector("img");
    return {
      texts: (dlg.textContent || "").trim().slice(0, 120),
      img: img ? { src: img.src.slice(0, 120), naturalW: img.naturalWidth, cls: String(img.className).slice(0, 140), wrapCls: img.parentElement ? String(img.parentElement.className).slice(0, 160) : null } : null,
      controls: [...dlg.querySelectorAll("button, a")].map((b) => ({ tag: b.tagName.toLowerCase(), text: (b.textContent || "").trim().slice(0, 24) })).slice(0, 6),
    };
  });
  save();
  log("lightboxImg:", JSON.stringify(store.lightboxImg, null, 1));
  const closeBtn = await page.$('[role=dialog] button:has-text("Close")');
  if (closeBtn) { await closeBtn.click(); await page.waitForTimeout(900); }
}

// ---- 4. the folder card's ellipsis menu (root view) ----
await page.getByRole("button", { name: "All Files" }).click();
await page.waitForTimeout(1600);
store.folderMenu = null;
const folderEllipsis = page.locator("main div.group").filter({ hasText: "s183-probe-folder" }).first().locator('button[aria-haspopup="menu"]');
if (await folderEllipsis.count()) {
  await folderEllipsis.click();
  await page.waitForTimeout(900);
  store.folderMenu = await page.evaluate(() => [...document.querySelectorAll('[role=menuitem]')].map((i) => i.textContent.trim()));
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);
}
save();
log("folderMenu:", JSON.stringify(store.folderMenu));

// ---- 5. the COMPLETE zero-residue cleanup ----
const deleteCardByName = async (name) => {
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
// the png lives inside s183-probe-folder — navigate in, delete it, come back
await page.evaluate(() => {
  const main = document.querySelector("main");
  const leaf = [...main.querySelectorAll("main *")].find((el) => el.children.length === 0 && (el.textContent || "").trim() === "s183-probe-folder");
  if (!leaf) return;
  let card = leaf;
  while (card && card !== main) {
    if (String(card.tagName).toLowerCase() === "button" && /rounded-xl/.test(String(card.className))) break;
    card = card.parentElement;
  }
  if (card) card.click();
});
await page.waitForTimeout(2000);
results.push(await deleteCardByName("s183-1794626452684.png"));
await page.getByRole("button", { name: "All Files" }).click();
await page.waitForTimeout(1600);
for (const name of ["s183-1794626452684.pdf", "s183-1794626393213.txt", "s183-1794626393213.pdf", "s183-1794626393213.png"]) {
  results.push(await deleteCardByName(name));
}
results.push(await deleteCardByName("s183-probe-folder"));
results.push(await deleteCardByName("SubFolder"));
log("cleanup:", JSON.stringify(results));
await page.waitForTimeout(1400);
store.cleanupResults = results;
store.finalBody = await page.evaluate(() => document.querySelector("main").textContent.trim().slice(0, 280));
save();
log("finalBody:", JSON.stringify(store.finalBody));

await ctx.close();
await browser.close();
log("S183 PROBE 5 COMPLETE — store at /tmp/s183-files-ref5.json");
