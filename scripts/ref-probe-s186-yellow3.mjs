// S186 reference probe 3 — the YELLOW-text + Sign-in-color disambiguation.
// Full outerHTML + complete class attributes for: the Tasks Add Task
// button, the Calendar active tab, the Timetable Add Class, the anon
// login Sign in + Continue with Google buttons. Plus the :root vs .dark
// CSS var table from a fresh anon context (light default) vs the authed
// context (dark). Decisive DOM evidence, zero residue.
// Usage (node >= 23.6 — bun INCOMPATIBLE):
//   REF_PROBE_EMAIL=… REF_PROBE_PASSWORD=… node scripts/ref-probe-s186-yellow3.mjs
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const REF = "https://omni-study1.base44.app";
const OUT = "docs/probe-evidence/s186";
mkdirSync(OUT, { recursive: true });

const PICK = (names) => `(() => {
  const out = {};
  const entries = ${JSON.stringify(Object.entries(names))}.map(([k, s]) => [k, new RegExp(s)]);
  for (const [key, re] of entries) {
    const btn = [...document.querySelectorAll("button")].find(b => re.test((b.textContent || "").trim()));
    if (!btn) { out[key] = null; continue; }
    const cs = getComputedStyle(btn);
    out[key] = {
      cls: (btn.className || "").toString(),
      bg: cs.backgroundColor,
      color: cs.color,
      backgroundImage: cs.backgroundImage.slice(0, 90),
      h: Math.round(btn.getBoundingClientRect().height),
      html: btn.outerHTML.slice(0, 700),
    };
  }
  return JSON.stringify(out);
})()`;

const VARS = `(() => {
  const html = document.documentElement;
  const s = getComputedStyle(html);
  const vars = {};
  for (const sheet of document.styleSheets) {
    let rules; try { rules = sheet.cssRules; } catch { continue; }
    for (const r of rules || []) {
      if (r.selectorText === ":root" || r.selectorText === ".dark" || (r.selectorText || "").includes("dark")) {
        for (const st of r.style) {
          if (st.startsWith("--")) vars[(r.selectorText || "?") + " " + st] = r.style.getPropertyValue(st).trim().slice(0, 44);
        }
      }
    }
  }
  return JSON.stringify({ htmlClass: html.className, vars });
})()`;

const browser = await chromium.launch();

// ---- 1. The authed (dark-state) surfaces ----
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(`${REF}/login`);
await page.fill("input[type=email]", process.env.REF_PROBE_EMAIL);
await page.fill("input[type=password]", process.env.REF_PROBE_PASSWORD);
await page.waitForFunction(() => { const b = document.querySelector("button[type=submit]"); return b && !b.disabled; }, null, { timeout: 15_000 });
await page.click("button[type=submit]");
await page.waitForFunction(() => document.querySelector("nav a") !== null && (document.querySelector("h1") || document.querySelector("h2")), null, { timeout: 30_000 });
await page.waitForTimeout(1500);

const authed = {};
await page.goto(`${REF}/Tasks`);
await page.waitForTimeout(2400);
authed.tasks = JSON.parse(await page.evaluate(PICK({ addTask: "^Add Task$", active: "^Active$", createTask: "^Create Task$" })));
authed.tasksVars = JSON.parse(await page.evaluate(VARS));

await page.goto(`${REF}/Calendar`);
await page.waitForTimeout(2400);
authed.calendar = JSON.parse(await page.evaluate(PICK({ calTab: "^Calendar$", timelineTab: "^Timeline$" })));

await page.goto(`${REF}/Timetable`);
await page.waitForTimeout(2400);
authed.timetable = JSON.parse(await page.evaluate(PICK({ gridBuilder: "^Grid Builder$", addClass: "^Add Class$" })));
await ctx.close();

// ---- 2. The anon login surface (fresh context = light default) ----
const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page2 = await ctx2.newPage();
await page2.goto(`${REF}/login`);
await page2.waitForTimeout(2600);
const anon = {};
anon.login = JSON.parse(await page2.evaluate(PICK({ signIn: "^Sign in$", google: "^Continue with Google$" })));
anon.vars = JSON.parse(await page2.evaluate(VARS));
await page2.screenshot({ path: `${OUT}/ref-login-anon.png` });
await ctx2.close();
await browser.close();

writeFileSync(`${OUT}/ref-yellow-signin.json`, JSON.stringify({ authed, anon }, null, 2));
console.log("== AUTHED (dark state) Tasks ==");
console.log(JSON.stringify(authed.tasks, null, 1).slice(0, 2400));
console.log("== ANON login ==");
console.log(JSON.stringify(anon.login, null, 1).slice(0, 1600));
console.log("== ANON vars (light default) ==");
console.log(JSON.stringify(anon.vars, null, 1).slice(0, 1200));
