// S192 mobile probe — the reference's MOBILE surface for the two port
// targets (AI Assistant + Calendar day-detail), so the S192 port is
// mobile-complete. READ-ONLY. Usage:
//   REF_PROBE_EMAIL=… REF_PROBE_PASSWORD=… node scripts/probe-s192-mobile.mjs
import { chromium } from "playwright";

const REF = "https://omni-study1.base44.app";

async function loginMobile(browser) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
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
    () => document.body.innerText.length > 50,
    null,
    { timeout: 30_000 },
  );
  await page.waitForTimeout(5000);
  return { ctx, page };
}

const AI = `(() => {
  const main = document.querySelector("main") || document.body;
  const card = [...main.querySelectorAll("button")].find((b) => b.textContent.trim().startsWith("Explain Concept"));
  const out = { found: !!card };
  if (card) {
    const cs = getComputedStyle(card);
    out.cls = (card.className || "").toString().slice(0, 130);
    out.w = Math.round(card.getBoundingClientRect().width);
    out.gridCols = getComputedStyle(card.parentElement).gridTemplateColumns;
    out.gap = getComputedStyle(card.parentElement).gap;
    out.colsCls = (card.parentElement.className || "").toString().slice(0, 80);
    const inner = card.querySelector("h1,h2,h3,h4,[role=heading],span,div");
    out.innerTag = inner?.tagName; out.innerCls = inner ? (inner.className || "").toString().slice(0, 80) : null;
  }
  const greet = [...main.querySelectorAll("h1,h2,h3,h4,p,span,div")].find((e) => e.children.length === 0 && /how can i help you study today/i.test(e.textContent || ""));
  out.greet = greet ? { tag: greet.tagName, cls: (greet.className || "").toString().slice(0, 80) } : null;
  const ta = main.querySelector("textarea");
  out.taCls = ta ? (ta.className || "").toString().slice(0, 130) : null;
  out.text = main.innerText.replace(/\\s+/g, " ").slice(0, 400);
  return JSON.stringify(out);
})()`;

const CAL = `(() => {
  const h = [...document.querySelectorAll("main h1, main h2, main h3")].map((e) => e.textContent.trim()).filter(Boolean);
  const day = h.find((t) => /(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday),/.test(t)) || null;
  return JSON.stringify({ dayHeader: day, heads: h.slice(0, 6) });
})()`;

const browser = await chromium.launch();
const { ctx, page } = await loginMobile(browser);

// AI via the mobile drawer (the ref's app-bar button carries no aria-label —
// the clone's "Open navigation menu" label is a superset; click the first
// header icon button instead)
const openDrawer = async () => {
  // The ref's hamburger: the top-left icon button in the app bar (x < 60,
  // y < 130) — dump-filtered rather than named (the ref carries no label).
  const candidates = page.locator("button");
  const n = await candidates.count();
  for (let i = 0; i < n; i++) {
    const b = candidates.nth(i);
    const box = await b.boundingBox();
    if (box && box.x < 60 && box.y < 130 && box.width > 0) {
      await b.click();
      break;
    }
  }
  await page.waitForTimeout(1000);
};
await openDrawer();
// The ref's drawer is a plain slide-over (no [role=dialog] — the clone's
// dialog semantics + labels are the a11y superset); the DESKTOP nav links
// stay in the DOM (hidden) at 390px, so click the VISIBLE link by text
// through an evaluate-walk (Playwright's a.first() picks the hidden one).
const clickLink = async (label) => {
  await page.evaluate((l) => {
    const link = [...document.querySelectorAll("a")].find(
      (a) => a.textContent.trim().includes(l) && a.getBoundingClientRect().width > 0,
    );
    if (link) link.click();
  }, label);
  await page.waitForTimeout(2500);
};
await clickLink("AI Assistant");
const ai = JSON.parse(await page.evaluate(AI));

// Calendar
await openDrawer();
await clickLink("Calendar");
const cal = JSON.parse(await page.evaluate(CAL));

console.log(JSON.stringify({ mobile: { ai, cal } }, null, 1));
await ctx.close();
await browser.close();
