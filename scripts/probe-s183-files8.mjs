// S183 probe 8 — the micro-tail: the Upload control's full anatomy (the
// reference's upload affordance is a LABEL wrapping the hidden input — not
// a button) + the New Folder button's full class. Zero residue (read-only).
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const REF = "https://omni-study1.base44.app";
const store = {};
const save = () => writeFileSync("/tmp/s183-files-ref8.json", JSON.stringify(store, null, 2));
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

store.uploadControl = await page.evaluate(() => {
  const main = document.querySelector("main");
  const input = main.querySelector('input[type=file]');
  const label = input ? input.closest("label") : null;
  const newFolder = [...main.querySelectorAll("button")].find((b) => (b.textContent || "").trim() === "New Folder");
  return {
    inputHtml: input ? input.outerHTML : null,
    labelHtml: label ? label.outerHTML : null,
    newFolderCls: newFolder ? String(newFolder.className) : null,
    uploadSibling: input?.nextElementSibling ? input.nextElementSibling.outerHTML.slice(0, 400) : null,
    uploadPrev: input?.previousElementSibling ? input.previousElementSibling.outerHTML.slice(0, 400) : null,
    actionParent: input?.parentElement ? String(input.parentElement.className).slice(0, 160) : null,
  };
});
save();
log("labelHtml:", store.uploadControl.labelHtml?.slice(0, 500));
log("newFolderCls:", store.uploadControl.newFolderCls);
log("actionParent:", store.uploadControl.actionParent);

await ctx.close();
await browser.close();
log("S183 PROBE 8 COMPLETE — store at /tmp/s183-files-ref8.json");
