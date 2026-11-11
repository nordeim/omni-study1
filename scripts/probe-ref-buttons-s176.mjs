// S176 diagnostic — dump the reference's view button inventory for the
// families whose openers the main probe missed (Events, Notes, Settings
// tabs + Add Subject/Add Holiday). One-shot, read-only.
import { chromium } from "playwright";

const REF = "https://omni-study1.base44.app";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(`${REF}/login`);
await page.fill("input[type=email]", process.env.REF_PROBE_EMAIL);
await page.fill("input[type=password]", process.env.REF_PROBE_PASSWORD);
await page.click("button[type=submit]");
await page.waitForFunction(() => document.querySelector("main") !== null && document.querySelector("nav") !== null, null, { timeout: 30000 });
await page.waitForTimeout(2500);

async function dump(navText, label) {
  const ok = await page.evaluate((t) => { const a = [...document.querySelectorAll("nav a")].find((x) => x.textContent.trim().startsWith(t)); if (a) a.click(); return !!a; }, navText);
  if (!ok) { console.log(`## ${label}: nav "${navText}" NOT FOUND`); return; }
  await page.waitForTimeout(2200);
  const inv = await page.evaluate(() => {
    const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && cs.display !== "none'"; };
    const btns = [...document.querySelectorAll("main button")].filter((b) => b.getBoundingClientRect().width > 0).map((b) => ({
      text: b.textContent.replace(/\s+/g, " ").trim().slice(0, 40) || null,
      aria: b.getAttribute("aria-label"),
      title: b.getAttribute("title"),
    })).filter((b) => b.text || b.aria || b.title);
    const tabs = [...document.querySelectorAll("[role='tab']")].map((t) => t.textContent.trim());
    const h = document.querySelector("main h1, main h2, main h3");
    return { heading: h ? h.textContent.trim().slice(0, 40) : null, tabs, btnCount: btns.length, btns: btns.slice(0, 22) };
  });
  console.log(`## ${label}: ` + JSON.stringify(inv, null, 1));
}

await dump("Events", "EVENTS");
await dump("Notes", "NOTES");
await dump("Settings", "SETTINGS");
await ctx.close();
await browser.close();
