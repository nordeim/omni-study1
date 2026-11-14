// S183 probe 2 — the precise card + toolbar DOM capture + the UI-driven
// zero-residue cleanup (probe 1's API fetches met the reference's non-clone
// API surface: HTML 404s. The cleanup path is the reference's own UI —
// the card menus' Delete).
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const REF = "https://omni-study1.base44.app";
const store = {};
const save = () => writeFileSync("/tmp/s183-files-ref2.json", JSON.stringify(store, null, 2));
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

// ---- the card DOMs: walk up from the name leaf to the grid child ----
store.cards = await page.evaluate(() => {
  const main = document.querySelector("main");
  const leaf = (txt) => [...main.querySelectorAll("main *")].find((el) => el.children.length === 0 && (el.textContent || "").trim() === txt);
  const walkGridChild = (el) => {
    let cur = el;
    while (cur && cur !== main) {
      const p = cur.parentElement;
      if (p && /grid|flex flex-wrap/.test(String(p.className))) return cur;
      cur = p;
    }
    return null;
  };
  const pngLeaf = [...main.querySelectorAll("main *")].find((el) => el.children.length === 0 && /\.png$/.test((el.textContent || "").trim()) && (el.textContent || "").startsWith("s183"));
  const pngCard = pngLeaf ? walkGridChild(pngLeaf) : null;
  // every s183 leaf name + its card
  const names = [...main.querySelectorAll("main *")].filter((el) => el.children.length === 0 && /^s183-/.test((el.textContent || "").trim())).map((el) => (el.textContent || "").trim());
  // the folder: any element whose text includes "folder" (probe 1 named it <stamp>-folder)
  const folderLeaf = [...main.querySelectorAll("main *")].find((el) => (el.textContent || "").trim().endsWith("-folder") && el.children.length === 0);
  const folderCard = folderLeaf ? walkGridChild(folderLeaf) : null;
  return {
    names,
    pngCard: pngCard ? pngCard.outerHTML.slice(0, 2600) : null,
    folderCard: folderCard ? folderCard.outerHTML.slice(0, 2600) : null,
    hasFoldersLabel: [...main.querySelectorAll("main *")].some((el) => {
      const t = ((el.childNodes.length && el.textContent) || "").trim();
      return t === "Folders" && el.children.length === 0;
    }),
  };
});
save();
log("cards:", JSON.stringify({ names: store.cards.names, hasFoldersLabel: store.cards.hasFoldersLabel }, null, 1));
log("pngCard:", store.cards.pngCard?.slice(0, 900));
log("folderCard:", store.cards.folderCard?.slice(0, 900));

// ---- the toolbar structure: the parents + boxes ----
store.toolbar = await page.evaluate(() => {
  const main = document.querySelector("main");
  const search = main.querySelector('input[placeholder*="Search"]');
  const combobox = main.querySelector('[role=combobox]');
  const crumb = [...main.querySelectorAll("button")].find((b) => (b.textContent || "").includes("All Files"));
  const box = (el) => el ? { x: Math.round(el.getBoundingClientRect().x), y: Math.round(el.getBoundingClientRect().y), w: Math.round(el.getBoundingClientRect().width), h: Math.round(el.getBoundingClientRect().height) } : null;
  const chain = (el, depth) => {
    const out = [];
    let cur = el;
    for (let i = 0; i < depth && cur; i += 1) {
      out.push({ tag: cur.tagName.toLowerCase(), cls: String(cur.className).slice(0, 200) });
      cur = cur.parentElement;
    }
    return out;
  };
  // the two unnamed toolbar buttons next to the combobox (the view toggle)
  const toggleRow = combobox?.parentElement;
  return {
    searchBox: box(search), comboBox: box(combobox), crumbBox: box(crumb),
    searchChain: chain(search, 3),
    comboChain: chain(combobox, 3),
    crumbChain: chain(crumb, 3),
    toggleRow: toggleRow ? {
      cls: String(toggleRow.className).slice(0, 200),
      children: [...toggleRow.children].map((c) => ({ tag: c.tagName.toLowerCase(), role: c.getAttribute("role"), text: (c.textContent || "").trim().slice(0, 20), cls: String(c.className).slice(0, 120), box: box(c) })),
    } : null,
    searchSiblingCount: search?.parentElement?.parentElement ? [...search.parentElement.parentElement.children].map((c) => ({ tag: c.tagName.toLowerCase(), cls: String(c.className).slice(0, 140) })) : null,
  };
});
save();
log("toolbar:", JSON.stringify(store.toolbar, null, 1));

// ---- the file card ellipsis menu ----
store.fileMenu = null;
try {
  const card = page.locator("main div", { hasText: /\.png$/ }).filter({ has: page.locator("svg") }).last();
  const ellipsis = page.locator("main button", { has: page.locator("svg.lucide-ellipsis, svg.lucide-more-horizontal, svg.lucide-more-vertical") }).last();
  const count = await page.locator("main button svg[class*='lucide-ellipsis'], main button svg[class*='lucide-more']").count();
  log("ellipsis count:", count);
  if (count > 0) {
    await page.locator("main button").filter({ has: page.locator("svg[class*='lucide-ellipsis'], svg[class*='lucide-more']") }).first().click();
    await page.waitForTimeout(900);
    store.fileMenu = await page.evaluate(() => ({
      items: [...document.querySelectorAll('[role=menuitem]')].map((i) => ({ text: i.textContent.trim(), cls: String(i.className).slice(0, 140) })),
      menuPresent: !!document.querySelector('[role=menu]'),
    }));
    save();
    log("fileMenu:", JSON.stringify(store.fileMenu, null, 1));
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);
  }
} catch (err) {
  log("fileMenu probe error:", String(err).slice(0, 200));
}

// ---- the UI cleanup: every s183 card through its own menu ----
const cleanupLoop = async () => {
  for (let round = 0; round < 12; round += 1) {
    const remaining = await page.evaluate(() => {
      const main = document.querySelector("main");
      const leaves = [...main.querySelectorAll("main *")].filter((el) => el.children.length === 0 && /^s183-/.test((el.textContent || "").trim()));
      return leaves.map((el) => (el.textContent || "").trim());
    });
    if (remaining.length === 0) return remaining.length;
    log(`cleanup round ${round}: ${remaining.length} rows left`);
    // delete files first (a folder with files may block or absorb)
    const pngFirst = [...remaining].sort((a, b) => Number(b.match(/\.(png|pdf|txt)$/) ? 1 : 0) - Number(a.match(/\.(png|pdf|txt)$/) ? 1 : 0));
    const target = pngFirst[0];
    await page.evaluate((name) => {
      const main = document.querySelector("main");
      const leaf = [...main.querySelectorAll("main *")].find((el) => el.children.length === 0 && (el.textContent || "").trim() === name);
      if (!leaf) return;
      let card = leaf;
      while (card && card !== main) {
        const p = card.parentElement;
        if (p && /grid/.test(String(p.className))) break;
        card = p;
      }
      if (!card) return;
      const btn = [...card.querySelectorAll("button")].find((b) => {
        const svg = b.querySelector("svg");
        return svg && /lucide-(ellipsis|more-horizontal|more-vertical)/.test(String(svg.getAttribute("class")));
      });
      if (btn) btn.click();
    }, target);
    await page.waitForTimeout(800);
    const delItem = await page.$('[role=menuitem]:has-text("Delete")');
    if (delItem) {
      await delItem.click();
      await page.waitForTimeout(1200);
      // a confirm dialog may appear
      const confirm = await page.$('[role=dialog] button:has-text("Delete"), [role=alertdialog] button:has-text("Delete")');
      if (confirm) { await confirm.click(); await page.waitForTimeout(1200); }
    } else {
      log("no Delete menuitem for", target);
      return -1;
    }
  }
  return -1;
};
const cleaned = await cleanupLoop();
store.cleanupRounds = cleaned;
await page.waitForTimeout(1200);
store.finalBody = await page.evaluate(() => document.querySelector("main").textContent.trim().slice(0, 300));
save();
log("cleanup:", cleaned, "finalBody:", JSON.stringify(store.finalBody));

await ctx.close();
await browser.close();
log("S183 PROBE 2 COMPLETE — store at /tmp/s183-files-ref2.json");
