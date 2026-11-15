// S192 census adjudication probe — the precision follow-up on the seven
// non-obviously-data-shaped delta classes the fresh 20-view census flagged.
// READ-ONLY on the reference (login + navigation; zero rows touched).
// Usage: REF_PROBE_EMAIL=… REF_PROBE_PASSWORD=… node scripts/probe-s192-adjudicate.mjs
import { chromium } from "playwright";

const REF = "https://omni-study1.base44.app";
const CLONE = "http://localhost:3200";

async function session(browser, base, creds, mobile = false) {
  const ctx = await browser.newContext(
    mobile
      ? { viewport: { width: 390, height: 844 } }
      : { viewport: { width: 1440, height: 900 } },
  );
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
  await page.waitForTimeout(1500);
  return { ctx, page };
}

const nav = async (page, label) => {
  await page.locator("nav a").filter({ hasText: label }).first().click({ timeout: 15_000 });
  await page.waitForTimeout(1400);
};

const browser = await chromium.launch();
const out = {};

// --- 1. Calendar day-detail header (ref vs clone, same selected day) ------
{
  const probe = `(() => {
    const h = [...document.querySelectorAll("main h1, main h2, main h3")].map((e) => e.textContent.trim()).filter(Boolean);
    const day = h.find((t) => /Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday/.test(t)) || null;
    return JSON.stringify({ heads: h.slice(0, 8), dayHeader: day });
  })()`;
  const r = await session(browser, REF, { email: process.env.REF_PROBE_EMAIL, password: process.env.REF_PROBE_PASSWORD });
  await nav(r.page, "Calendar");
  // click today's cell (the out-of-month-safe today marker)
  await r.page.locator("main button").filter({ hasText: "16" }).first().click().catch(() => {});
  await r.page.waitForTimeout(900);
  out.calendarRef = JSON.parse(await r.page.evaluate(probe));
  await r.ctx.close();

  const c = await session(browser, CLONE, { email: "demo@studyflow.app", password: "Demo1234!" });
  await nav(c.page, "Calendar");
  await c.page.locator("main button").filter({ hasText: "16" }).first().click().catch(() => {});
  await c.page.waitForTimeout(900);
  out.calendarClone = JSON.parse(await c.page.evaluate(probe));
  await c.ctx.close();
}

// --- 2. Files view: the Upload affordance ---------------------------------
{
  const probe = `(() => {
    const main = document.querySelector("main") || document.body;
    const btns = [...main.querySelectorAll("button")].map((b) => ({
      t: b.textContent.trim().replace(/\\s+/g, " ").slice(0, 40),
      visible: b.getBoundingClientRect().width > 0,
    })).filter((b) => b.t);
    const heads = [...main.querySelectorAll("h1,h2,h3")].map((e) => e.textContent.trim()).filter(Boolean);
    const empty = main.innerText.replace(/\\s+/g, " ").slice(0, 400);
    return JSON.stringify({ btns: btns.slice(0, 14), heads, empty });
  })()`;
  const r = await session(browser, REF, { email: process.env.REF_PROBE_EMAIL, password: process.env.REF_PROBE_PASSWORD });
  await nav(r.page, "Files");
  out.filesRef = JSON.parse(await r.page.evaluate(probe));
  await r.ctx.close();
}

// --- 3. AI assistant: quick-action elements + Send + greeting -------------
{
  const probe = `(() => {
    const main = document.querySelector("main") || document.body;
    const quick = ["Explain Concept", "Study Tips", "Summarize", "Solve Problem", "Translate", "Essay Ideas"];
    const found = quick.map((q) => {
      const el = [...main.querySelectorAll("button, h1, h2, h3, a, div[role=button]")].find(
        (e) => e.textContent.trim() === q && e.getBoundingClientRect().width > 0,
      );
      if (!el) return { q, el: null };
      const cs = getComputedStyle(el);
      return { q, tag: el.tagName, cls: (el.className || "").toString().slice(0, 90), display: cs.display, fs: cs.fontSize, fw: cs.fontWeight, bg: cs.backgroundColor, color: cs.color, radius: cs.borderRadius, border: cs.borderColor };
    });
    const send = [...main.querySelectorAll("button")].find((b) => /send/i.test(b.textContent || b.getAttribute("aria-label") || "") && b.getBoundingClientRect().width > 0);
    const heads = [...main.querySelectorAll("h1,h2,h3")].map((e) => e.textContent.trim()).filter(Boolean);
    const placeholder = main.querySelector("textarea, input[type=text]")?.placeholder || null;
    const greeting = [...main.querySelectorAll("h1,h2,h3,p,div")].find((e) => /how can i help|study today/i.test(e.textContent || ""))?.textContent?.trim().slice(0, 80) || null;
    return JSON.stringify({ quick: found, send: send ? { tag: send.tagName, label: (send.getAttribute("aria-label") || send.textContent).trim().slice(0, 30) } : null, heads, placeholder, greeting });
  })()`;
  const r = await session(browser, REF, { email: process.env.REF_PROBE_EMAIL, password: process.env.REF_PROBE_PASSWORD });
  await nav(r.page, "AI Assistant");
  out.aiRef = JSON.parse(await r.page.evaluate(probe));
  await r.ctx.close();

  const c = await session(browser, CLONE, { email: "demo@studyflow.app", password: "Demo1234!" });
  await nav(c.page, "AI Assistant");
  out.aiClone = JSON.parse(await c.page.evaluate(probe));
  await c.ctx.close();
}

// --- 4. Settings: the Appearance section ----------------------------------
{
  const probe = `(() => {
    const heads = [...document.querySelectorAll("main h1, main h2, main h3")].map((e) => ({ t: e.textContent.trim(), tag: e.tagName })).filter((h) => h.t);
    const tabs = [...document.querySelectorAll("[role=tab]")].map((t) => t.textContent.trim()).filter(Boolean);
    const text = (document.querySelector("main")?.innerText || "").replace(/\\s+/g, " ").slice(0, 500);
    return JSON.stringify({ heads, tabs, text });
  })()`;
  const r = await session(browser, REF, { email: process.env.REF_PROBE_EMAIL, password: process.env.REF_PROBE_PASSWORD });
  await nav(r.page, "Settings");
  out.settingsRef = JSON.parse(await r.page.evaluate(probe));
  await r.ctx.close();
}

// --- 5. Math solver at rest -----------------------------------------------
{
  const probe = `(() => {
    const heads = [...document.querySelectorAll("main h1, main h2, main h3")].map((e) => e.textContent.trim()).filter(Boolean);
    const text = (document.querySelector("main")?.innerText || "").replace(/\\s+/g, " ").slice(0, 400);
    return JSON.stringify({ heads, text });
  })()`;
  const r = await session(browser, REF, { email: process.env.REF_PROBE_EMAIL, password: process.env.REF_PROBE_PASSWORD });
  await nav(r.page, "Math Solver");
  out.mathRef = JSON.parse(await r.page.evaluate(probe));
  await r.ctx.close();
}

// --- 6. My Day at zero (ref) — the full zero-state surface ----------------
{
  const probe = `(() => {
    const btns = [...document.querySelectorAll("main button")].map((b) => b.textContent.trim().replace(/\\s+/g, " ")).filter(Boolean).slice(0, 14);
    const heads = [...document.querySelectorAll("main h1, main h2, main h3")].map((e) => e.textContent.trim()).filter(Boolean);
    const text = (document.querySelector("main")?.innerText || "").replace(/\\s+/g, " ").slice(0, 500);
    return JSON.stringify({ btns, heads, text });
  })()`;
  const r = await session(browser, REF, { email: process.env.REF_PROBE_EMAIL, password: process.env.REF_PROBE_PASSWORD });
  await nav(r.page, "My Day");
  out.mydayRef = JSON.parse(await r.page.evaluate(probe));
  await r.ctx.close();
}

// --- 7. Tasks aside: the My Lists element ---------------------------------
{
  const probe = `(() => {
    const el = [...document.querySelectorAll("main p, main h1, main h2, main h3, main div")].find((e) => e.textContent.trim() === "My Lists" && e.children.length === 0);
    if (!el) return JSON.stringify({ found: false });
    const cs = getComputedStyle(el);
    return JSON.stringify({ found: true, tag: el.tagName, cls: (el.className || "").toString().slice(0, 100), fs: cs.fontSize, fw: cs.fontWeight, tt: cs.textTransform, ls: cs.letterSpacing, color: cs.color });
  })()`;
  const r = await session(browser, REF, { email: process.env.REF_PROBE_EMAIL, password: process.env.REF_PROBE_PASSWORD });
  await nav(r.page, "Tasks");
  out.myListsRef = JSON.parse(await r.page.evaluate(probe));
  await r.ctx.close();

  const c = await session(browser, CLONE, { email: "demo@studyflow.app", password: "Demo1234!" });
  await nav(c.page, "Tasks");
  out.myListsClone = JSON.parse(await c.page.evaluate(probe));
  await c.ctx.close();
}

await browser.close();
console.log(JSON.stringify(out, null, 1));
