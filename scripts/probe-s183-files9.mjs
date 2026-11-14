// S183 micro-probe 9 — the lightbox geometry (the dialog's exact box + full
// class + title/controls structure). One PNG round-trip, zero residue.
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const REF = "https://omni-study1.base44.app";
const store = {};
const save = () => writeFileSync("/tmp/s183-files-ref9.json", JSON.stringify(store, null, 2));
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
await page.waitForTimeout(2600);

const name = `s183-lightbox-${Date.now()}.png`;
await page.setInputFiles('input[type=file]', {
  name,
  mimeType: "image/png",
  buffer: Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAFklEQVR4nGP8z8DwnwEPYMInOXwUVAX///8GQQCU2QO4AAAAAElFTkSuQmCC",
    "base64",
  ),
});
await page.waitForTimeout(2600);
await page.locator("main div.aspect-square.cursor-pointer").first().click();
await page.waitForTimeout(2200);

store.lightbox = await page.evaluate(() => {
  const dlg = document.querySelector('[role=dialog]');
  if (!dlg) return null;
  const r = dlg.getBoundingClientRect();
  const img = dlg.querySelector("img");
  return {
    box: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
    dlgCls: String(dlg.className),
    titleHtml: dlg.querySelector("h2, h3")?.outerHTML ?? null,
    imgWrapHtml: img?.parentElement?.outerHTML.slice(0, 400) ?? null,
    footerHtml: (() => {
      const controls = [...dlg.querySelectorAll("a, button")].filter((c) => /Open in New Tab|Download|Close/.test((c.textContent || "").trim()));
      return controls[0]?.parentElement?.outerHTML.slice(0, 600) ?? null;
    })(),
  };
});
save();
log("lightbox box:", JSON.stringify(store.lightbox?.box), "cls tail:", store.lightbox?.dlgCls?.slice(-180));

// cleanup: close, delete, verify
const closeBtn = await page.$('[role=dialog] button:has-text("Close")');
if (closeBtn) { await closeBtn.click(); await page.waitForTimeout(900); }
const card = page.locator("main div.group").filter({ hasText: name }).first();
await card.locator('button[aria-haspopup="menu"]').click();
await page.waitForTimeout(800);
const del = await page.$('[role=menuitem]:has-text("Delete")');
if (del) {
  await del.click();
  await page.waitForTimeout(1500);
  const confirm = await page.$('[role=dialog] button:has-text("Delete"), [role=alertdialog] button:has-text("Delete")');
  if (confirm) { await confirm.click(); await page.waitForTimeout(1500); }
}
store.finalBody = await page.evaluate(() => document.querySelector("main").textContent.trim().slice(0, 200));
save();
log("finalBody:", JSON.stringify(store.finalBody));

await ctx.close();
await browser.close();
log("S183 PROBE 9 COMPLETE — store at /tmp/s183-files-ref9.json");
