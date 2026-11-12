// S177 probe 5 — diagnostic: the notes view's full button census with
// accessible names + visibility, right after a trusted nav click.
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

// Trusted nav click via locator
const notesLink = page.locator("nav a").filter({ hasText: /^Notes/ }).first();
const n = await notesLink.count();
console.log("nav Notes link count:", n);
await notesLink.click({ timeout: 8000 });
await page.waitForTimeout(3000);

const census = await page.evaluate(() => {
  const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden'; };
  const all = [...document.querySelectorAll("button")];
  return {
    url: location.pathname,
    h1: document.querySelector("h1") ? document.querySelector("h1").textContent.trim().slice(0, 30) : null,
    totalButtons: all.length,
    newNoteButtons: all.filter((b) => /new note/i.test(b.textContent || "")).map((b) => ({
      text: (b.textContent || "").replace(/\s+/g, " ").trim().slice(0, 20),
      visible: vis(b),
      rect: (() => { const r = b.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; })(),
      disabled: b.disabled,
      pointerEvents: getComputedStyle(b).pointerEvents,
      ariaLabel: b.getAttribute("aria-label"),
    })),
    emptyStateText: (() => { const m = document.querySelector("main"); const t = m ? m.textContent.replace(/\s+/g, " ").trim() : ""; const i = t.search(/no notes yet/i); return i >= 0 ? t.slice(i, i + 150) : "(no empty-state text)"; })(),
  };
});
console.log(JSON.stringify(census, null, 1));
await page.screenshot({ path: "/tmp/s177-p5.png" });
await ctx.close();
await browser.close();
