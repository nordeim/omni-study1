// S183 twin probe — the clone's pre-port Files anatomy (the dev server :3000,
// the demo account). Documents the drift the port closes; the EG pins' RED
// sweep is the systematic companion evidence.
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const store = {};
const save = () => writeFileSync("/tmp/s183-clone-pre.json", JSON.stringify(store, null, 2));
const log = (...a) => { console.log(...a); };

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto("http://localhost:3000/login", { timeout: 60_000, waitUntil: "domcontentloaded" });
await page.waitForTimeout(2500);
await page.fill("input[type=email]", "demo@studyflow.app");
await page.fill("input[type=password]", "Demo1234!");
await page.waitForFunction(() => {
  const btn = document.querySelector("button[type=submit]");
  return btn !== null && !btn.disabled;
}, null, { timeout: 30_000 });
await page.click("button[type=submit]");
await page.waitForTimeout(3000);
await page.waitForFunction(() => document.querySelector("nav a") !== null, null, { timeout: 30_000 });
await page.waitForTimeout(1500);

await page.evaluate(() => {
  const a = [...document.querySelectorAll("nav a")].find((x) => x.textContent.trim().startsWith("Files"));
  if (a) a.click();
});
await page.waitForTimeout(1800);
await page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true", null, { timeout: 15_000 });

store.clonePre = await page.evaluate(() => {
  const main = document.querySelector("main");
  return {
    body: main.textContent.trim().slice(0, 260),
    hasSearch: !!main.querySelector('input[placeholder*="Search"]'),
    hasCombobox: !!main.querySelector('[role=combobox]'),
    hasSectionLabels: [...main.querySelectorAll("main p")].some((p) => /^(Files|Folders)$/.test((p.textContent || "").trim())),
    crumbHomeCls: (() => {
      const b = [...main.querySelectorAll("button")].find((x) => (x.textContent || "").includes("All Files"));
      return b ? String(b.className).slice(0, 180) : null;
    })(),
    toggleCls: (() => {
      const b = main.querySelector('[aria-label="View mode"]');
      return b ? String(b.className).slice(0, 140) : null;
    })(),
  };
});
save();
log(JSON.stringify(store.clonePre, null, 1));

await ctx.close();
await browser.close();
log("S183 TWIN PROBE COMPLETE — store at /tmp/s183-clone-pre.json");
