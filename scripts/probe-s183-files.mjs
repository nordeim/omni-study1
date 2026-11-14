// S183 probe — the Files type-filter/view-mode port's reference axis, re-measured
// live (the standing re-probe cadence; the s182 §2.3 records are the prior
// measurement). Zero-residue: every uploaded row is deleted before close.
// Incremental saves to /tmp/s183-files-ref.json.
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const REF = "https://omni-study1.base44.app";
const store = {};
const save = () => writeFileSync("/tmp/s183-files-ref.json", JSON.stringify(store, null, 2));
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

const gotoFiles = async () => {
  await page.evaluate(() => {
    const a = [...document.querySelectorAll("nav a")].find((x) => x.textContent.trim().startsWith("Files"));
    if (a) a.click();
  });
  await page.waitForTimeout(2400);
};

// ---- 1. the zero-residue check + the zero-rows anatomy ----
await gotoFiles();
store.zeroRows = await page.evaluate(() => {
  const main = document.querySelector("main");
  const inputs = [...main.querySelectorAll("input")].map((i) => ({
    type: i.type, placeholder: i.placeholder, cls: String(i.className).slice(0, 160),
  }));
  // The toolbar region: everything between the h1's parent card and the content.
  const all = [...main.querySelectorAll("button, [role=combobox], input, h1, h2, h3")].map((el) => ({
    tag: el.tagName.toLowerCase(),
    role: el.getAttribute("role"),
    text: (el.textContent || "").trim().slice(0, 40),
    cls: String(el.className).slice(0, 160),
    ariaLabel: el.getAttribute("aria-label"),
  }));
  const sectionLabels = [...main.querySelectorAll("main *")].filter((el) => {
    const t = (el.childNodes.length && el.textContent || "").trim();
    return (t === "Files" || t === "Folders") && el.children.length === 0;
  }).map((el) => ({ tag: el.tagName.toLowerCase(), text: el.textContent.trim(), cls: String(el.className).slice(0, 160) }));
  return { inputs, all: all.slice(0, 30), sectionLabels, body: main.textContent.trim().slice(0, 400) };
});
save();
log("zeroRows:", JSON.stringify(store.zeroRows, null, 1));

// ---- 2. fixtures: one folder + a real decodable PNG + a tiny PDF + a TXT ----
const stamp = `s183-${Date.now()}`;
await page.setInputFiles('input[type=file]', {
  name: `${stamp}.png`,
  mimeType: "image/png",
  buffer: Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAFklEQVR4nGP8z8DwnwEPYMInOXwUVAX///8GQQCU2QO4AAAAAElFTkSuQmCC",
    "base64",
  ),
});
await page.waitForTimeout(2500);
await page.setInputFiles('input[type=file]', {
  name: `${stamp}.pdf`,
  mimeType: "application/pdf",
  buffer: Buffer.from("%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]>>endobj\nxref\n0 4\ntrailer<</Size 4/Root 1 0 R>>\n%%EOF", "utf8"),
});
await page.waitForTimeout(2500);
await page.setInputFiles('input[type=file]', {
  name: `${stamp}.txt`,
  mimeType: "text/plain",
  buffer: Buffer.from("s183 probe text", "utf8"),
});
await page.waitForTimeout(2500);
await page.evaluate(async (name) => {
  const res = await fetch("/api/files/folders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  return res.ok;
}, `${stamp}-folder`);
await page.waitForTimeout(2200);
await page.reload({ waitUntil: "domcontentloaded" });
await page.waitForTimeout(3000);

// ---- 3. the populated anatomy: section labels + toolbar + cards ----
store.populated = await page.evaluate((st) => {
  const main = document.querySelector("main");
  const q = (sel) => main.querySelector(sel);
  const sectionLabels = [...main.querySelectorAll("main *")].filter((el) => {
    const t = ((el.childNodes.length && el.textContent) || "").trim();
    return (t === "Files" || t === "Folders") && el.children.length === 0;
  }).map((el) => ({ tag: el.tagName.toLowerCase(), text: el.textContent.trim(), cls: String(el.className).slice(0, 160) }));
  const search = q('input[placeholder*="Search"]');
  const searchWrap = search ? search.parentElement : null;
  const combobox = q('[role=combobox]');
  const crumbHome = [...main.querySelectorAll("button")].find((b) => (b.textContent || "").includes("All Files"));
  const card = [...main.querySelectorAll("main div")].find((d) => String(d.className).includes("cursor-pointer") && (d.textContent || "").includes(`${st}.png`));
  const fileCard = card ?? [...main.querySelectorAll("main div")].find((d) => (d.textContent || "").includes(`${st}.png`) && d.querySelector("svg"));
  const folderCard = [...main.querySelectorAll("main div")].find((d) => (d.textContent || "").includes(`${st}-folder`) && (d.textContent || "").includes("item"));
  return {
    sectionLabels,
    search: search ? {
      placeholder: search.placeholder, cls: String(search.className).slice(0, 200),
      wrapCls: searchWrap ? String(searchWrap.className).slice(0, 200) : null,
      iconCls: search.previousElementSibling ? String(search.previousElementSibling.className).slice(0, 120) : null,
      iconIsSvg: !!(searchWrap && searchWrap.querySelector("svg")),
      svgCls: searchWrap?.querySelector("svg") ? String(searchWrap.querySelector("svg").className).slice(0, 120) : null,
    } : null,
    combobox: combobox ? { text: combobox.textContent.trim(), cls: String(combobox.className).slice(0, 200), ariaExpanded: combobox.getAttribute("aria-expanded") } : null,
    crumbHome: crumbHome ? { text: crumbHome.textContent.trim(), cls: String(crumbHome.className).slice(0, 200), svgCls: crumbHome.querySelector("svg") ? String(crumbHome.querySelector("svg").className).slice(0, 100) : null, parentCls: String(crumbHome.parentElement.className).slice(0, 160) } : null,
    fileCard: fileCard ? { cls: String(fileCard.className).slice(0, 200), html: fileCard.outerHTML.slice(0, 1400) } : null,
    folderCard: folderCard ? { cls: String(folderCard.className).slice(0, 200), html: folderCard.outerHTML.slice(0, 1400) } : null,
    counts: [...main.querySelectorAll("main *")].filter((el) => /^\d+ (files?|items?)$/.test((el.textContent || "").trim()) && el.children.length === 0).map((el) => ({ text: el.textContent.trim(), cls: String(el.className).slice(0, 120) })),
  };
}, stamp);
save();
log("populated:", JSON.stringify(store.populated, null, 1));

// ---- 4. the type filter semantics (open the listbox, read the options) ----
await page.click('[role=combobox]');
await page.waitForTimeout(800);
store.filterOptions = await page.evaluate(() => {
  const opts = [...document.querySelectorAll('[role=option]')];
  return opts.map((o) => ({ text: o.textContent.trim(), state: o.getAttribute("aria-selected"), cls: String(o.className).slice(0, 140) }));
});
save();
log("filterOptions:", JSON.stringify(store.filterOptions, null, 1));

// select Images
await page.click('[role=option]:has-text("Images")');
await page.waitForTimeout(1200);
store.imagesFilter = await page.evaluate((st) => {
  const main = document.querySelector("main");
  const visible = (txt) => [...main.querySelectorAll("main *")].some((el) => el.children.length === 0 && (el.textContent || "").trim() === txt);
  return {
    pngVisible: visible(`${st}.png`), pdfVisible: visible(`${st}.pdf`), txtVisible: visible(`${st}.txt`),
    folderVisible: visible(`${st}-folder`),
  };
}, stamp);
save();
log("imagesFilter:", JSON.stringify(store.imagesFilter, null, 1));

// back to All Types
await page.click('[role=combobox]');
await page.waitForTimeout(500);
await page.click('[role=option]:has-text("All Types")');
await page.waitForTimeout(800);

// PDFs
await page.click('[role=combobox]');
await page.waitForTimeout(500);
await page.click('[role=option]:has-text("PDFs")');
await page.waitForTimeout(800);
store.pdfsFilter = await page.evaluate((st) => {
  const main = document.querySelector("main");
  const visible = (txt) => [...main.querySelectorAll("main *")].some((el) => el.children.length === 0 && (el.textContent || "").trim() === txt);
  return { pngVisible: visible(`${st}.png`), pdfVisible: visible(`${st}.pdf`), txtVisible: visible(`${st}.txt`), folderVisible: visible(`${st}-folder`) };
}, stamp);
save();
log("pdfsFilter:", JSON.stringify(store.pdfsFilter, null, 1));
await page.click('[role=combobox]');
await page.waitForTimeout(500);
await page.click('[role=option]:has-text("All Types")');
await page.waitForTimeout(800);

// Documents
await page.click('[role=combobox]');
await page.waitForTimeout(500);
await page.click('[role=option]:has-text("Documents")');
await page.waitForTimeout(800);
store.documentsFilter = await page.evaluate((st) => {
  const main = document.querySelector("main");
  const visible = (txt) => [...main.querySelectorAll("main *")].some((el) => el.children.length === 0 && (el.textContent || "").trim() === txt);
  return { pngVisible: visible(`${st}.png`), pdfVisible: visible(`${st}.pdf`), txtVisible: visible(`${st}.txt`), folderVisible: visible(`${st}-folder`) };
}, stamp);
save();
log("documentsFilter:", JSON.stringify(store.documentsFilter, null, 1));
await page.click('[role=combobox]');
await page.waitForTimeout(500);
await page.click('[role=option]:has-text("All Types")');
await page.waitForTimeout(800);

// ---- 5. the search semantics ----
await page.fill('input[placeholder*="Search"]', stamp.slice(0, 8));
await page.waitForTimeout(900);
store.search = await page.evaluate((st) => {
  const main = document.querySelector("main");
  const visible = (txt) => [...main.querySelectorAll("main *")].some((el) => el.children.length === 0 && (el.textContent || "").trim() === txt);
  return { pngVisible: visible(`${st}.png`), folderVisible: visible(`${st}-folder`) };
}, stamp);
save();
log("search:", JSON.stringify(store.search, null, 1));
await page.fill('input[placeholder*="Search"]', "zzz-no-match-zzz");
await page.waitForTimeout(900);
store.searchEmpty = await page.evaluate(() => {
  const main = document.querySelector("main");
  return { body: main.textContent.trim().slice(0, 300) };
});
save();
log("searchEmpty:", JSON.stringify(store.searchEmpty, null, 1));
await page.fill('input[placeholder*="Search"]', "");
await page.waitForTimeout(800);

// ---- 6. the file card ellipsis menu + the view lightbox ----
await page.evaluate((st) => {
  const main = document.querySelector("main");
  const card = [...main.querySelectorAll("main div")].find((d) => (d.textContent || "").includes(`${st}.png`) && d.querySelector("svg"));
  const btn = card ? [...card.querySelectorAll("button")].find((b) => (b.getAttribute("aria-label") || "").toLowerCase().includes("more") || b.querySelector("svg.lucide-ellipsis")) : null;
  if (btn) btn.click();
}, stamp);
await page.waitForTimeout(900);
store.fileMenu = await page.evaluate(() => {
  const items = [...document.querySelectorAll('[role=menuitem]')];
  return items.map((i) => ({ text: i.textContent.trim(), cls: String(i.className).slice(0, 140) }));
});
save();
log("fileMenu:", JSON.stringify(store.fileMenu, null, 1));

// View → the lightbox
const viewItem = await page.$('[role=menuitem]:has-text("View")');
if (viewItem) {
  await viewItem.click();
  await page.waitForTimeout(1600);
  store.lightbox = await page.evaluate(() => {
    const dlg = document.querySelector('[role=dialog]');
    if (!dlg) return null;
    const img = dlg.querySelector("img");
    return {
      dlgCls: String(dlg.className).slice(0, 200),
      texts: (dlg.textContent || "").trim().slice(0, 200),
      img: img ? { src: img.src.slice(0, 120), naturalW: img.naturalWidth, cls: String(img.className).slice(0, 160) } : null,
      buttons: [...dlg.querySelectorAll("button, a")].map((b) => ({ tag: b.tagName.toLowerCase(), text: (b.textContent || "").trim().slice(0, 30), ariaLabel: b.getAttribute("aria-label"), cls: String(b.className).slice(0, 120) })).slice(0, 8),
    };
  });
  save();
  log("lightbox:", JSON.stringify(store.lightbox, null, 1));
  await page.keyboard.press("Escape");
  await page.waitForTimeout(900);
}

// ---- 7. Move to Folder → the dialog anatomy ----
await page.evaluate((st) => {
  const main = document.querySelector("main");
  const card = [...main.querySelectorAll("main div")].find((d) => (d.textContent || "").includes(`${st}.png`) && d.querySelector("svg"));
  const btn = card ? [...card.querySelectorAll("button")].find((b) => (b.getAttribute("aria-label") || "").toLowerCase().includes("more") || b.querySelector("svg.lucide-ellipsis")) : null;
  if (btn) btn.click();
}, stamp);
await page.waitForTimeout(800);
const moveItem = await page.$('[role=menuitem]:has-text("Move to Folder")');
if (moveItem) {
  await moveItem.click();
  await page.waitForTimeout(1200);
  store.moveDialog = await page.evaluate(() => {
    const dlg = document.querySelector('[role=dialog]');
    if (!dlg) return null;
    return {
      title: dlg.querySelector("h2, [role=dialog] h1")?.textContent?.trim() ?? null,
      texts: (dlg.textContent || "").trim().slice(0, 250),
      comboboxCount: dlg.querySelectorAll('[role=combobox]').length,
      buttons: [...dlg.querySelectorAll("button")].map((b) => (b.textContent || b.getAttribute("aria-label") || "").trim().slice(0, 30)).slice(0, 6),
    };
  });
  // open the combobox — the listbox portals outside the dialog
  await page.click('[role=dialog] [role=combobox]').catch(() => {});
  await page.waitForTimeout(800);
  store.moveOptions = await page.evaluate(() => [...document.querySelectorAll('[role=option]')].map((o) => o.textContent.trim()));
  save();
  log("moveDialog:", JSON.stringify(store.moveDialog, null, 1));
  log("moveOptions:", JSON.stringify(store.moveOptions, null, 1));
  // execute the move into the probe folder
  const opt = await page.$(`[role=option]:has-text("-folder")`);
  if (opt) { await opt.click(); await page.waitForTimeout(600); }
  const moveBtn = await page.$('[role=dialog] button:has-text("Move")');
  if (moveBtn) { await moveBtn.click(); await page.waitForTimeout(1500); }
}

// ---- 8. the in-folder breadcrumb pair + the list mode ----
await page.evaluate((st) => {
  const main = document.querySelector("main");
  const folderCard = [...main.querySelectorAll("main div")].find((d) => (d.textContent || "").includes(`${st}-folder`) && (d.textContent || "").includes("item"));
  const openBtn = folderCard ? [...folderCard.querySelectorAll("button")].find((b) => (b.textContent || "").includes(st)) : null;
  if (openBtn) openBtn.click();
}, stamp);
await page.waitForTimeout(1800);
store.inFolder = await page.evaluate((st) => {
  const main = document.querySelector("main");
  const crumbs = [...main.querySelectorAll("button, span")].map((el) => ({ tag: el.tagName.toLowerCase(), text: (el.textContent || "").trim().slice(0, 40), cls: String(el.className).slice(0, 160) }));
  const body = main.textContent.trim().slice(0, 350);
  const visible = (txt) => [...main.querySelectorAll("main *")].some((el) => el.children.length === 0 && (el.textContent || "").trim() === txt);
  return { body, crumbs: crumbs.slice(0, 14), pngVisible: visible(`${st}.png`), hasFoldersLabel: (main.textContent || "").includes("Folders") };
}, stamp);
save();
log("inFolder:", JSON.stringify(store.inFolder, null, 1));

// list mode: the toggle buttons
store.listToggle = await page.evaluate(() => {
  const main = document.querySelector("main");
  const ariaBtns = [...main.querySelectorAll("button[aria-label]")].map((b) => ({ ariaLabel: b.getAttribute("aria-label"), cls: String(b.className).slice(0, 160), pressed: b.getAttribute("aria-pressed"), svg: b.querySelector("svg") ? String(b.querySelector("svg").className).slice(0, 80) : null }));
  return ariaBtns;
});
save();
log("listToggle:", JSON.stringify(store.listToggle, null, 1));

const listBtn = await page.$('button[aria-label*="list" i], button[aria-label*="List"]');
if (listBtn) {
  await listBtn.click();
  await page.waitForTimeout(1000);
  store.listMode = await page.evaluate((st) => {
    const main = document.querySelector("main");
    const row = [...main.querySelectorAll("main div")].find((d) => (d.textContent || "").includes(`${st}.png`) && (d.textContent || "").includes("B"));
    return row ? { cls: String(row.className).slice(0, 160), html: row.outerHTML.slice(0, 1200) } : null;
  }, stamp);
  save();
  log("listMode:", JSON.stringify(store.listMode, null, 1));
}

// ---- 9. the folder card's ellipsis menu ----
await page.evaluate(() => {
  const a = [...document.querySelectorAll("nav a")].find((x) => x.textContent.trim().startsWith("Files"));
  if (a) a.click();
});
await page.waitForTimeout(2200);
await page.evaluate((st) => {
  const main = document.querySelector("main");
  const folderCard = [...main.querySelectorAll("main div")].find((d) => (d.textContent || "").includes(`${st}-folder`) && (d.textContent || "").includes("item"));
  const btn = folderCard ? [...folderCard.querySelectorAll("button")].find((b) => (b.getAttribute("aria-label") || "").toLowerCase().includes("more") || b.querySelector("svg.lucide-ellipsis")) : null;
  if (btn) btn.click();
}, stamp);
await page.waitForTimeout(900);
store.folderMenu = await page.evaluate(() => [...document.querySelectorAll('[role=menuitem]')].map((i) => i.textContent.trim()));
save();
log("folderMenu:", JSON.stringify(store.folderMenu, null, 1));
await page.keyboard.press("Escape");
await page.waitForTimeout(500);

// ---- 10. zero-residue cleanup ----
const cleanup = await page.evaluate(async (st) => {
  const list = await (await fetch("/api/files", { credentials: "same-origin" })).json();
  const rows = Array.isArray(list) ? list : (list.files ?? []);
  let deleted = 0;
  for (const row of rows) {
    if (String(row.name).startsWith(st)) {
      const r = await fetch(`/api/files/${row.id}`, { method: "DELETE", credentials: "same-origin" });
      if (r.ok) deleted += 1;
    }
  }
  const folders = await (await fetch("/api/files/folders", { credentials: "same-origin" })).json();
  let foldersDeleted = 0;
  for (const f of (Array.isArray(folders) ? folders : [])) {
    if (String(f.name).startsWith(st)) {
      const r = await fetch(`/api/files/folders/${f.id}`, { method: "DELETE", credentials: "same-origin" });
      if (r.ok) foldersDeleted += 1;
    }
  }
  return { deleted, foldersDeleted };
}, stamp);
await page.waitForTimeout(1500);
store.cleanup = cleanup;
await page.reload({ waitUntil: "domcontentloaded" });
await page.waitForTimeout(2600);
store.finalBody = await page.evaluate(() => document.querySelector("main").textContent.trim().slice(0, 260));
save();
log("cleanup:", JSON.stringify(cleanup), "finalBody:", JSON.stringify(store.finalBody));

await ctx.close();
await browser.close();
log("S183 PROBE COMPLETE — store at /tmp/s183-files-ref.json");
