// S186 reference probe 9 — the toolbar internals + the mobile auth CTA
// heights. Feeds the S186-B port's exact spacing: the Tasks/Timetable
// toolbar rows (item widths + computed gap) at desktop and mobile, and the
// auth sub-screen CTA heights at 390x844 (the desktop h-44 record needs
// its mobile half). Zero residue.
// Usage (node >= 23.6 — bun INCOMPATIBLE):
//   REF_PROBE_EMAIL=… REF_PROBE_PASSWORD=… node scripts/ref-probe-s186-tools9.mjs
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const REF = "https://omni-study1.base44.app";
const OUT = "docs/probe-evidence/s186";
mkdirSync(OUT, { recursive: true });

const TOOLBAR = `(() => {
  const main = document.querySelector("main") || document.body;
  const h1 = main.querySelector("h1, h2");
  if (!h1) return JSON.stringify({ err: "no-h1" });
  let row = h1.parentElement;
  for (let i = 0; i < 4 && row; i++) {
    const cs = getComputedStyle(row);
    if (cs.display === "flex" && row.querySelectorAll("button, select, input").length > 0) break;
    row = row.parentElement;
  }
  const toolbar = row ? [...row.children].find(k => /search|filter|button|select/i.test(k.innerHTML.slice(0, 400)) || k.querySelectorAll("button, input, [role=combobox]").length >= 2) : null;
  if (!toolbar) return JSON.stringify({ err: "no-toolbar", rowCls: row ? row.className.toString().slice(0, 80) : null });
  const cs = getComputedStyle(toolbar);
  const items = [...toolbar.children].map(k => ({ tag: k.tagName, cls: (k.className || "").toString().slice(0, 44), w: Math.round(k.getBoundingClientRect().width), text: (k.textContent || "").trim().slice(0, 18) }));
  return JSON.stringify({ toolbarCls: (toolbar.className || "").toString().slice(0, 90), display: cs.display, wrap: cs.flexWrap, gap: cs.gap, w: Math.round(toolbar.getBoundingClientRect().width), items });
})()`;

const AUTH_MOBILE = `(() => {
  const card = document.querySelector("div.shadow-2xl") || document.body;
  const out = [];
  for (const b of card.querySelectorAll("button")) {
    const r = b.getBoundingClientRect();
    if (r.width === 0) continue;
    const cs = getComputedStyle(b);
    out.push({ text: (b.textContent || "").trim().slice(0, 30), bg: cs.backgroundColor, h: Math.round(r.height), radius: cs.borderRadius, fs: cs.fontSize });
  }
  return JSON.stringify(out);
})()`;

const browser = await chromium.launch();

// ---- 1. auth mobile (390x844): signin + signup + forgot ----
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
await page.goto(`${REF}/login`);
await page.waitForTimeout(2600);
const mobileSignin = JSON.parse(await page.evaluate(AUTH_MOBILE));
await page.getByText("Need an account? Sign up").click();
await page.waitForTimeout(2200);
const mobileSignup = JSON.parse(await page.evaluate(AUTH_MOBILE));
await page.goto(`${REF}/login`);
await page.waitForTimeout(2000);
await page.getByText("Forgot password?").click();
await page.waitForTimeout(2200);
const mobileForgot = JSON.parse(await page.evaluate(AUTH_MOBILE));
await ctx.close();

// ---- 2. toolbar internals (desktop 1440 + mobile 390) ----
const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page2 = await ctx2.newPage();
await page2.goto(`${REF}/login`);
await page2.fill("input[type=email]", process.env.REF_PROBE_EMAIL);
await page2.fill("input[type=password]", process.env.REF_PROBE_PASSWORD);
await page2.waitForFunction(() => { const b = document.querySelector("button[type=submit]"); return b && !b.disabled; }, null, { timeout: 15_000 });
await page2.click("button[type=submit]");
await page2.waitForFunction(() => document.querySelector("nav a") !== null && (document.querySelector("h1") || document.querySelector("h2")), null, { timeout: 30_000 });
await page2.waitForTimeout(1500);
const tools = { desktop: {}, mobile: {} };
for (const view of ["Tasks", "Timetable", "Files", "Exams", "Calendar", "Assignments"]) {
  await page2.goto(`${REF}/${view}`);
  await page2.waitForTimeout(2100);
  tools.desktop[view] = JSON.parse(await page2.evaluate(TOOLBAR));
}
await page2.setViewportSize({ width: 390, height: 844 });
for (const view of ["Tasks", "Timetable", "Files", "Exams", "Calendar", "Assignments"]) {
  await page2.goto(`${REF}/${view}`);
  await page2.waitForTimeout(2100);
  tools.mobile[view] = JSON.parse(await page2.evaluate(TOOLBAR));
}
await ctx2.close();
await browser.close();

writeFileSync(`${OUT}/ref-toolbars-auth-mobile.json`, JSON.stringify({ mobileSignin, mobileSignup, mobileForgot, tools }, null, 2));
console.log("== mobile auth ==");
for (const [k, v] of Object.entries({ mobileSignin, mobileSignup, mobileForgot })) {
  console.log(k, JSON.stringify(v.map(b => ({ t: b.text.slice(0, 18), h: b.h, bg: b.bg.slice(0, 22), r: b.radius }))));
}
console.log("== toolbars ==");
for (const [vp, views] of Object.entries(tools)) {
  for (const [v, d] of Object.entries(views)) {
    console.log(`${vp} ${v}: ${d.err ? d.err : `cls="${d.toolbarCls}" gap=${d.gap} w=${d.w} items=${JSON.stringify((d.items || []).map(i => i.w))}`}`);
  }
}
