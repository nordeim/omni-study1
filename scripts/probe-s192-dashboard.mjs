// S192 dashboard probe — the census's dashboard delta class: the parity
// probe's statCards counter (ref 6 vs clone 4) and the heading (ref
// "StudyFlow" vs clone greeting). READ-ONLY on the reference.
// Usage: REF_PROBE_EMAIL=… REF_PROBE_PASSWORD=… node scripts/probe-s192-dashboard.mjs
import { chromium } from "playwright";

const REF = "https://omni-study1.base44.app";
const CLONE = "http://localhost:3200";

async function session(browser, base, creds) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${base}/login`, { timeout: 45_000 });
  await page.fill("input[type=email]", creds.email);
  await page.fill("input[type=password]", creds.password);
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
  await page.waitForTimeout(1800);
  return { ctx, page };
}

const DASH = `(() => {
  const main = document.querySelector("main") || document.body;
  const heads = [...main.querySelectorAll("h1,h2,h3")].map((e) => {
    const cs = getComputedStyle(e);
    return { tag: e.tagName, t: e.textContent.trim().replace(/\\s+/g, " ").slice(0, 60), fs: cs.fontSize, fw: cs.fontWeight, cls: (e.className || "").toString().slice(0, 90) };
  }).filter((h) => h.t);
  // the stat-card row: find the grid whose children look like stat cards
  const grids = [...main.querySelectorAll("[class*='grid']")];
  let statRow = null;
  for (const g of grids) {
    const kids = [...g.children];
    if (kids.length >= 3 && kids.length <= 8 && g.getBoundingClientRect().width > 600) {
      const k0 = getComputedStyle(kids[0]);
      if (k0.borderRadius && kids.every((k) => k.tagName === "DIV" || k.tagName === "SECTION")) {
        statRow = {
          n: kids.length,
          cols: getComputedStyle(g).gridTemplateColumns.split(" ").length,
          cls: (g.className || "").toString().slice(0, 90),
          cards: kids.map((k) => k.textContent.trim().replace(/\\s+/g, " ").slice(0, 50)),
        };
        break;
      }
    }
  }
  const btns = [...main.querySelectorAll("button")].map((b) => b.textContent.trim().replace(/\\s+/g, " ")).filter(Boolean).slice(0, 12);
  const text = main.innerText.replace(/\\s+/g, " ").slice(0, 1100);
  return JSON.stringify({ heads, statRow, btns, text });
})()`;

const browser = await chromium.launch();
const out = {};

const r = await session(browser, REF, { email: process.env.REF_PROBE_EMAIL, password: process.env.REF_PROBE_PASSWORD });
out.ref = JSON.parse(await r.page.evaluate(DASH));
await r.ctx.close();

const c = await session(browser, CLONE, { email: "demo@studyflow.app", password: "Demo1234!" });
out.clone = JSON.parse(await c.page.evaluate(DASH));
await c.ctx.close();

await browser.close();
console.log(JSON.stringify(out, null, 1));
