// S186 evidence capture — the five self-verifying frames (the dev server
// at :3000 carries the current ported code). Each frame DOM-asserts its
// markers BEFORE the shot (the self-verifying convention): Frame 1 the
// auth card's solid slate-900 Sign in (desktop); Frame 2 the auth card's
// sub-screen CTA (the signup Create account at h-10 sm:h-11); Frame 3 the
// mobile 390 STACKED Tasks header (the toolbar below the h1, column, 16px
// gap); Frame 4 the mobile stacked Timetable header; Frame 5 the desktop
// Tasks header row (the 2-kid form + mb-6).
// Usage: node scripts/capture-s186-evidence.mjs
import { chromium } from "playwright";
import { mkdirSync, statSync } from "node:fs";

const CLONE = "http://localhost:3000";
const OUT = "docs/screenshots";

const browser = await chromium.launch();
try {
  // ---- Frames 1-2: the auth card (anon, fresh context) ----
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${CLONE}/login`);
  await page.waitForTimeout(2200);

  // Frame 1: the Sign in solid family.
  const f1 = await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find(b => (b.textContent || "").trim() === "Sign in");
    if (!btn) return null;
    const cs = getComputedStyle(btn);
    return { bg: cs.backgroundColor, bi: cs.backgroundImage, radius: cs.borderRadius, h: Math.round(btn.getBoundingClientRect().height) };
  });
  if (!f1 || f1.bg !== "rgb(15, 23, 42)" || f1.bi !== "none") throw new Error(`Frame 1 markers failed: ${JSON.stringify(f1)}`);
  await page.screenshot({ path: `${OUT}/186-auth-signin-solid.png` });

  // Frame 2: the signup Create account.
  await page.getByText("Need an account? Sign up").click();
  await page.waitForTimeout(1200);
  const f2 = await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find(b => /create account/i.test(b.textContent || ""));
    if (!btn) return null;
    const cs = getComputedStyle(btn);
    return { bg: cs.backgroundColor, h: Math.round(btn.getBoundingClientRect().height), radius: cs.borderRadius };
  });
  if (!f2 || f2.bg !== "rgb(15, 23, 42)" || f2.h !== 44) throw new Error(`Frame 2 markers failed: ${JSON.stringify(f2)}`);
  await page.screenshot({ path: `${OUT}/186-auth-signup-cta.png` });
  await ctx.close();
  console.log("frames 1-2 ok:", JSON.stringify({ f1, f2 }));

  // ---- Frames 3-5: the authed headers ----
  const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page2 = await ctx2.newPage();
  await page2.goto(`${CLONE}/login`);
  await page2.fill("input[type=email]", "demo@studyflow.app");
  await page2.fill("input[type=password]", "Demo1234!");
  await page2.waitForFunction(() => { const b = document.querySelector("button[type=submit]"); return b && !b.disabled; }, null, { timeout: 15_000 });
  await page2.click("button[type=submit]");
  await page2.waitForFunction(() => document.querySelector("nav a") !== null && document.querySelector("h1, h2") !== null, null, { timeout: 30_000 });
  await page2.waitForTimeout(1500);

  // Frame 3: the stacked Tasks header at 390.
  await page2.goto(`${CLONE}/Tasks`);
  await page2.waitForTimeout(1800);
  const f3 = await page2.evaluate(() => {
    const header = document.querySelector("[aria-label='Tasks header']");
    if (!header) return null;
    const cs = getComputedStyle(header);
    return { dir: cs.flexDirection, gap: cs.gap, kids: header.children.length };
  });
  if (!f3 || f3.dir !== "column" || f3.gap !== "16px" || f3.kids !== 2) throw new Error(`Frame 3 markers failed: ${JSON.stringify(f3)}`);
  await page2.screenshot({ path: `${OUT}/186-tasks-header-stacked-390.png` });

  // Frame 4: the stacked Timetable header at 390.
  await page2.goto(`${CLONE}/Timetable`);
  await page2.waitForTimeout(1800);
  const f4 = await page2.evaluate(() => {
    const h1 = document.querySelector("main h1");
    let el = h1 ? h1.parentElement : null;
    for (let i = 0; i < 6 && el; i++) {
      const ctrl = "button, a, select, input, [role=combobox]";
      const sib = [...el.children].some(k => !k.contains(h1) && (k.matches(ctrl) || k.querySelector(ctrl) !== null));
      if (getComputedStyle(el).display === "flex" && sib) break;
      el = el.parentElement;
    }
    if (!el) return null;
    const cs = getComputedStyle(el);
    const t = el.children[1] ? getComputedStyle(el.children[1]) : null;
    return { dir: cs.flexDirection, gap: cs.gap, toolbarGap: t ? t.gap : null };
  });
  if (!f4 || f4.dir !== "column" || f4.gap !== "16px" || f4.toolbarGap !== "12px") throw new Error(`Frame 4 markers failed: ${JSON.stringify(f4)}`);
  await page2.screenshot({ path: `${OUT}/186-timetable-header-stacked-390.png` });
  await ctx2.close();

  // Frame 5: the desktop Tasks header row.
  const ctx3 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page3 = await ctx3.newPage();
  await page3.goto(`${CLONE}/login`);
  await page3.fill("input[type=email]", "demo@studyflow.app");
  await page3.fill("input[type=password]", "Demo1234!");
  await page3.waitForFunction(() => { const b = document.querySelector("button[type=submit]"); return b && !b.disabled; }, null, { timeout: 15_000 });
  await page3.click("button[type=submit]");
  await page3.waitForFunction(() => document.querySelector("nav a") !== null && document.querySelector("h1, h2") !== null, null, { timeout: 30_000 });
  await page3.waitForTimeout(1500);
  await page3.goto(`${CLONE}/Tasks`);
  await page3.waitForTimeout(1800);
  const f5 = await page3.evaluate(() => {
    const header = document.querySelector("[aria-label='Tasks header']");
    if (!header) return null;
    const cs = getComputedStyle(header);
    return { dir: cs.flexDirection, items: cs.alignItems, mb: cs.marginBottom, kids: header.children.length };
  });
  if (!f5 || f5.dir !== "row" || f5.items !== "center" || f5.mb !== "24px" || f5.kids !== 2) throw new Error(`Frame 5 markers failed: ${JSON.stringify(f5)}`);
  await page3.screenshot({ path: `${OUT}/186-tasks-header-desktop-row.png` });
  await ctx3.close();
  console.log("frames 3-5 ok:", JSON.stringify({ f3, f4, f5 }));

  for (const f of ["186-auth-signin-solid.png", "186-auth-signup-cta.png", "186-tasks-header-stacked-390.png", "186-timetable-header-stacked-390.png", "186-tasks-header-desktop-row.png"]) {
    const st = statSync(`${OUT}/${f}`);
    console.log(`${f}: ${st.size} bytes`);
  }
} finally {
  await browser.close();
}
console.log("S186 evidence capture complete — 5 self-verifying frames");
