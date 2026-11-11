// S176 one-shot probe — the multi-family reference dialog sweep (the
// per-cycle dialog re-probe, the axis-finding pattern). This cycle's
// candidates: the OLD families not re-probed recently (Tasks S170,
// Events S162, Notes S166, StudyGroups S171) plus the re-verify set
// (Subjects S175, Holidays S174). Field census per dialog: labels,
// placeholders, input types, button texts, select option counts,
// swatch geometry. Computed DOM is ground truth (the repo doctrine).
import { chromium } from "playwright";

const REF = "https://omni-study1.base44.app";

const CENSUS = `(() => {
  const d = document.querySelector('[role="dialog"]');
  if (!d) return null;
  const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden'; };
  const fields = [...d.querySelectorAll("input, select, textarea")].filter(vis).map((el) => ({
    tag: el.tagName.toLowerCase(),
    type: el.getAttribute("type"),
    placeholder: el.getAttribute("placeholder"),
    value: el.getAttribute("type") === "checkbox" || el.getAttribute("type") === "radio" ? null : (el.getAttribute("value") || ""),
    ariaLabel: el.getAttribute("aria-label"),
  }));
  const buttons = [...d.querySelectorAll("button")].filter(vis).map((el) => ({
    text: el.textContent.replace(/\\s+/g, " ").trim().slice(0, 36),
    variant: (el.className || "").toString().split(" ").filter((c) => /bg-|outline|ghost|destructive/.test(c)).slice(0, 2),
  }));
  const labels = [...d.querySelectorAll("label")].filter(vis).map((l) => l.textContent.replace(/\\s+/g, " ").trim().slice(0, 40));
  const selects = [...d.querySelectorAll("select")].filter(vis).map((s) => ({ options: s.options.length, first: s.options[0] ? s.options[0].textContent.trim() : null }));
  const swatches = [...d.querySelectorAll("button, div")].filter((el) => {
    const r = el.getBoundingClientRect();
    return vis(el) && r.width > 0 && r.width <= 40 && r.height > 0 && r.height <= 40 && (el.getAttribute("aria-pressed") !== null || ((el.className || "").toString().match(/rounded-full|rounded-lg/) && r.width === r.height));
  }).map((el) => ({ w: Math.round(el.getBoundingClientRect().width), h: Math.round(el.getBoundingClientRect().height), pressed: el.getAttribute("aria-pressed"), cls: ((el.className || "").toString().match(/rounded-(full|lg|\\[[0-9]+px\\])/) || [null])[0] }));
  const title = d.querySelector("h1, h2, h3, [class*='title'], [class*='Title']") ? d.querySelector("h1, h2, h3, [class*='title'], [class*='Title']").textContent.trim().slice(0, 40) : null;
  return { title, labels, fields, buttons, selects, swatchCount: swatches.length, swatchShape: swatches[0] || null };
})()`;

const VIEWS = [
  { nav: "Tasks", button: /add task/i, family: "tasks" },
  { nav: "Events", button: /add event/i, family: "events" },
  { nav: "Notes", button: /add note|new note/i, family: "notes" },
  { nav: "Study Groups", button: /add group|create group|new group/i, family: "studygroups" },
  { nav: "Settings", button: /add subject|add new subject/i, family: "subjects" },
  { nav: "Settings", button: /add holiday|add new holiday/i, family: "holidays" },
];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(`${REF}/login`);
await page.fill("input[type=email]", process.env.REF_PROBE_EMAIL);
await page.fill("input[type=password]", process.env.REF_PROBE_PASSWORD);
await page.click("button[type=submit]");
await page.waitForFunction(() => document.querySelector("main") !== null && document.querySelector("nav") !== null, null, { timeout: 30000 });
await page.waitForTimeout(2500);
console.log("# logged into reference");

const out = {};
let lastNav = "";
for (const v of VIEWS) {
  try {
    if (v.nav !== lastNav) {
      const link = await page.evaluate((navText) => {
        const a = [...document.querySelectorAll("nav a")].find((x) => x.textContent.trim().startsWith(navText));
        if (a) a.click();
        return !!a;
      }, v.nav);
      if (!link) { out[v.family] = { error: "nav not found" }; continue; }
      await page.waitForTimeout(2200);
      lastNav = v.nav;
    }
    if (v.family === "subjects") {
      // Settings → Subjects tab first.
      await page.evaluate(() => { const t = [...document.querySelectorAll("[role='tab'], button")].find((b) => b.textContent.trim() === "Subjects"); if (t) t.click(); });
      await page.waitForTimeout(1500);
    }
    if (v.family === "holidays") {
      await page.evaluate(() => { const t = [...document.querySelectorAll("[role='tab'], button")].find((b) => b.textContent.trim() === "Holidays"); if (t) t.click(); });
      await page.waitForTimeout(1500);
    }
    const btn = page.getByRole("button", { name: v.button }).first();
    await btn.click({ timeout: 6000 });
    await page.waitForTimeout(1400);
    const census = await page.evaluate(CENSUS);
    out[v.family] = census || { error: "no dialog" };
    // close
    await page.keyboard.press("Escape");
    await page.waitForTimeout(700);
  } catch (e) {
    out[v.family] = { error: String(e).slice(0, 120) };
    await page.keyboard.press("Escape").catch(() => {});
    await page.waitForTimeout(500);
  }
}
console.log(JSON.stringify(out, null, 1));
await ctx.close();
await browser.close();
