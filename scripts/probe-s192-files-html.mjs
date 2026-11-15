// S192 files-header dump — the reference's Files view header/toolbar HTML,
// to adjudicate the toolbar drift against the S183 records (New Folder was
// outline + Upload was gradient then; today's probe suggests solid + icon).
// READ-ONLY. Usage:
//   REF_PROBE_EMAIL=… REF_PROBE_PASSWORD=… node scripts/probe-s192-files-html.mjs
import { chromium } from "playwright";

const REF = "https://omni-study1.base44.app";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(`${REF}/login`, { timeout: 45_000 });
await page.fill("input[type=email]", process.env.REF_PROBE_EMAIL);
await page.fill("input[type=password]", process.env.REF_PROBE_PASSWORD);
await page.waitForFunction(
  () => {
    const b = document.querySelector("button[type=submit]");
    return b !== null && !b.disabled;
  },
  null,
  { timeout: 20_000 },
);
await page.click("button[type=submit]");
await page.waitForFunction(
  () =>
    document.querySelector("nav a") !== null &&
    (document.querySelector("h1") !== null || document.querySelector("h2") !== null),
  null,
  { timeout: 30_000 },
);
await page.waitForTimeout(1500);
await page.locator("nav a").filter({ hasText: "Files" }).first().click();
await page.waitForTimeout(1600);

const dump = await page.evaluate(() => {
  const main = document.querySelector("main") || document.body;
  // The header region: from the h1 up to the content section
  const h1 = main.querySelector("h1");
  const section = main.querySelector("section, [aria-label]");
  const region = h1?.parentElement?.parentElement ?? main;
  const html = region.innerHTML
    .replace(/<svg[\s\S]*?<\/svg>/g, "<svg…/>")
    .replace(/\s+/g, " ")
    .slice(0, 3500);
  const order = [...main.querySelectorAll("button, label, input[type=file], select")].map((el) => ({
    kind: el.tagName.toLowerCase() + (el.getAttribute("type") ? `[${el.getAttribute("type")}]` : ""),
    text: (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 24),
    aria: el.getAttribute("aria-label")?.slice(0, 30) ?? "",
    w: Math.round(el.getBoundingClientRect().width),
    visible: el.getBoundingClientRect().width > 0,
  }));
  return { html, order };
});
console.log(JSON.stringify(dump, null, 1));
await ctx.close();
await browser.close();
