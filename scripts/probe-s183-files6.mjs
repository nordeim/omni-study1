// S183 probe 6 — the folder menu capture + the last two folder deletes
// (the folder card is a <button>, not a div — the probe-5 selector bug).
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const REF = "https://omni-study1.base44.app";
const store = {};
const save = () => writeFileSync("/tmp/s183-files-ref6.json", JSON.stringify(store, null, 2));
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

const folderCardOf = (name) => page.locator("main button.group").filter({ hasText: name }).first();

// ---- 1. the folder card's ellipsis menu ----
store.folderMenu = null;
const ellipsis = folderCardOf("s183-probe-folder").locator('button[aria-haspopup="menu"]');
if (await ellipsis.count()) {
  await ellipsis.click();
  await page.waitForTimeout(900);
  store.folderMenu = await page.evaluate(() => ({
    items: [...document.querySelectorAll('[role=menuitem]')].map((i) => i.textContent.trim()),
    folderCardCls: document.querySelector("main button.group") ? String(document.querySelector("main button.group").className).slice(0, 160) : null,
  }));
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);
}
save();
log("folderMenu:", JSON.stringify(store.folderMenu, null, 1));

// ---- 2. delete the two folders ----
const deleteFolder = async (name) => {
  const card = folderCardOf(name);
  if (!(await card.count())) return `MISSING ${name}`;
  await card.locator('button[aria-haspopup="menu"]').click();
  await page.waitForTimeout(900);
  const del = await page.$('[role=menuitem]:has-text("Delete")');
  if (!del) return `NO-DELETE ${name}`;
  await del.click();
  await page.waitForTimeout(1500);
  const confirm = await page.$('[role=dialog] button:has-text("Delete"), [role=alertdialog] button:has-text("Delete"), [role=dialog] button:has-text("OK"), [role=alertdialog] button:has-text("OK")');
  if (confirm) { await confirm.click(); await page.waitForTimeout(1500); }
  return `DELETED ${name}`;
};
const results = [];
results.push(await deleteFolder("s183-probe-folder"));
results.push(await deleteFolder("SubFolder"));
log("folder cleanup:", JSON.stringify(results));
store.cleanupResults = results;
await page.waitForTimeout(1500);
store.finalBody = await page.evaluate(() => document.querySelector("main").textContent.trim().slice(0, 300));
save();
log("finalBody:", JSON.stringify(store.finalBody));

await ctx.close();
await browser.close();
log("S183 PROBE 6 COMPLETE — store at /tmp/s183-files-ref6.json");
