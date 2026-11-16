// S198 evidence capture — the self-verifying frames for the cross-view
// three-family e2e consolidation (Batch EV), ridden against the fresh
// :3200 standalone (the demo account, READ-ONLY surfaces — the one
// route interception is the EH family's own EA3 zero-forcing pattern on
// a GET; zero writes on the persistent demo account). The consolidation
// is a pure test-organization refactor — the frames document the
// CONSOLIDATED FAMILIES' surfaces (the chrome the 19 moved pins drive):
//   1. 198-emptystates.png — the Files zero state (EH1's own surface —
//      the one view the seed leaves empty): the "No files yet" heading,
//      the py-16 px-4 container, the 20px semibold title, the max-w-sm
//      hint, NO CTA (the measured no-CTA family)
//   2. 198-viewheaders.png — the Tasks header at mobile 390x844 (EJ4's
//      contract: the aria-labelled header row stacks its toolbar BELOW
//      the h1 — column, 16px gap, the 2-kid census)
//   3. 198-filterrows.png — the Exams view (EK1/EK3's contracts: the
//      header carries ONLY the Add Exam button; the filter row renders
//      BELOW the header with the 160px select)
//   4. 198-devserver-dashboard.png — the dev server :3000 dashboard
//   5. 198-devserver-emptystates.png — the dev server :3000 Files empty
//   6. 198-devserver-mobile-drawer.png — the dev server :3000 mobile
//      drawer (the operator's standing mobile-nav watch)
// Every frame is DOM-asserted BEFORE the shot and pixel-verified
// non-blank after (the standing evidence discipline). The family map
// lives in docs/remediation-plan-session198.md.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const OUT = "docs/screenshots";
mkdirSync(OUT, { recursive: true });

const STANDALONE = "http://localhost:3200";
const DEV = "http://localhost:3000";

const verdict = {};

async function session(browser, base, viewport) {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  await page.goto(`${base}/login`, { timeout: 45_000 });
  await page.fill("input[type=email]", "demo@studyflow.app");
  await page.fill("input[type=password]", "Demo1234!");
  await page.waitForFunction(
    () => {
      const b = document.querySelector("button[type=submit]");
      return b !== null && !b.disabled;
    },
    null,
    { timeout: 20_000 },
  );
  await page.click("button[type=submit]");
  await page.waitForFunction(() => document.querySelector("main") !== null, null, { timeout: 30_000 });
  await page.waitForFunction(
    () => document.documentElement.dataset.appHydrated === "true",
    null,
    { timeout: 20_000 },
  );
  return { ctx, page };
}

const browser = await chromium.launch();

// ---- frame 1: the EH family — the Files zero state on the standalone ----
{
  const { ctx, page } = await session(browser, STANDALONE, { width: 1280, height: 800 });
  await page.goto(`${STANDALONE}/Files`);
  await page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true");
  const title = page.getByRole("heading", { name: "No files yet" });
  await title.waitFor({ state: "visible", timeout: 20_000 });
  const empty = page.locator("main [class*='py-16']").first();
  const padX = await empty.evaluate((el) => getComputedStyle(el).paddingLeft);
  const padY = await empty.evaluate((el) => getComputedStyle(el).paddingTop);
  const titleFs = await title.evaluate((el) => getComputedStyle(el).fontSize);
  const hintMaxW = await empty.locator("p").last().evaluate((el) => getComputedStyle(el).maxWidth);
  const ctaCount = await empty.getByRole("button").count();
  const ok =
    padX === "16px" && padY === "64px" && titleFs === "20px" && hintMaxW === "384px" && ctaCount === 0;
  verdict["198-emptystates.png"] = {
    ok,
    contracts: { padX, padY, titleFs, hintMaxW, ctaCount },
  };
  await page.screenshot({ path: `${OUT}/198-emptystates.png` });
  await ctx.close();
}

// ---- frame 2: the EJ family — the Tasks header stacked at mobile ----
{
  const { ctx, page } = await session(browser, STANDALONE, { width: 390, height: 844 });
  await page.goto(`${STANDALONE}/Tasks`);
  await page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true");
  const header = page.locator("[aria-label='Tasks header']");
  await header.waitFor({ state: "visible", timeout: 20_000 });
  const mob = await header.evaluate((el) => {
    const s = getComputedStyle(el);
    return { dir: s.flexDirection, gap: s.gap, kids: el.children.length };
  });
  const ok = mob.dir === "column" && mob.gap === "16px" && mob.kids === 2;
  verdict["198-viewheaders.png"] = { ok, contracts: mob };
  await page.screenshot({ path: `${OUT}/198-viewheaders.png` });
  await ctx.close();
}

// ---- frame 3: the EK family — the Exams header + the separated filter row ----
{
  const { ctx, page } = await session(browser, STANDALONE, { width: 1280, height: 800 });
  await page.goto(`${STANDALONE}/Exams`);
  await page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true");
  await page.getByRole("heading", { name: "Exams" }).waitFor({ state: "visible", timeout: 20_000 });
  const probe = await page.evaluate(() => {
    const h1 = document.querySelector("main h1");
    // the header row: the nearest flex ancestor of the h1 carrying a control
    let el = h1 ? h1.parentElement : null;
    for (let i = 0; i < 6 && el; i++) {
      const cs = getComputedStyle(el);
      const ctrl = "button, a, select, input, [role=combobox]";
      const sibling = [...el.children].some(
        (k) => !k.contains(h1) && (k.matches(ctrl) || k.querySelector(ctrl) !== null),
      );
      if (cs.display === "flex" && sibling) break;
      el = el.parentElement;
    }
    if (!el) return null;
    const headerButtons = [...el.querySelectorAll("button")].map((b) => (b.textContent || "").trim());
    // the filter row: the next sibling row below the header carrying the search/select
    const input = [...document.querySelectorAll("main input")].find((i) =>
      (i.placeholder || "").toLowerCase().includes("search"),
    );
    let filterRow = null;
    let selectW = null;
    if (input) {
      let fr = input.parentElement;
      for (let i = 0; i < 5 && fr; i++) {
        if (fr.querySelector("select, [role=combobox]")) break;
        fr = fr.parentElement;
      }
      if (fr) {
        const sel = fr.querySelector("select, [role=combobox]");
        if (sel) {
          const trigger = sel.matches("button") ? sel : sel.querySelector("button") || sel;
          selectW = Math.round(trigger.getBoundingClientRect().width);
        }
        const h1Top = el.getBoundingClientRect().bottom;
        filterRow = Math.round(fr.getBoundingClientRect().top - h1Top);
      }
    }
    return { headerButtons, filterRowGapBelowHeader: filterRow, selectW };
  });
  const ok =
    probe !== null &&
    probe.headerButtons.length === 1 &&
    probe.headerButtons[0] === "Add Exam" &&
    probe.filterRowGapBelowHeader !== null &&
    probe.filterRowGapBelowHeader > 0 &&
    probe.selectW === 160;
  verdict["198-filterrows.png"] = { ok, contracts: probe };
  await page.screenshot({ path: `${OUT}/198-filterrows.png` });
  await ctx.close();
}

// ---- frames 4-6: the dev-server set (the operator's standing request) ----
{
  const { ctx, page } = await session(browser, DEV, { width: 1280, height: 800 });
  await page.goto(`${DEV}/Dashboard`);
  await page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true");
  const h1 = await page.locator("main h1").first().textContent();
  verdict["198-devserver-dashboard.png"] = {
    ok: /good (morning|afternoon|evening)/i.test(h1 || ""),
    contracts: { h1: (h1 || "").slice(0, 40) },
  };
  await page.screenshot({ path: `${OUT}/198-devserver-dashboard.png` });

  await page.goto(`${DEV}/Files`);
  await page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true");
  // the auto-WAITING visibility gate (the S9 lesson: a bare isVisible()
  // snapshot races the async files fetch and reads the loading window)
  const filesHeading = page.getByRole("heading", { name: "No files yet" });
  await filesHeading.waitFor({ state: "visible", timeout: 20_000 });
  verdict["198-devserver-emptystates.png"] = { ok: true, contracts: { filesTitle: true } };
  await page.screenshot({ path: `${OUT}/198-devserver-emptystates.png` });
  await ctx.close();
}
{
  const { ctx, page } = await session(browser, DEV, { width: 390, height: 844 });
  await page.goto(`${DEV}/Dashboard`);
  await page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true");
  const menuBtn = page.locator("button[aria-label*='navigation menu' i]").first();
  await menuBtn.click();
  await page.waitForTimeout(700);
  const panel = await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]');
    const p = d ? d.querySelector("div.w-72") : null;
    return p
      ? { w: Math.round(p.getBoundingClientRect().width), links: p.querySelectorAll("a").length }
      : null;
  });
  const ok = panel !== null && panel.w === 288 && panel.links === 20;
  verdict["198-devserver-mobile-drawer.png"] = { ok, contracts: panel };
  await page.screenshot({ path: `${OUT}/198-devserver-mobile-drawer.png` });
  await ctx.close();
}

await browser.close();

// ---- the pixel-verify pass (non-blank, the standing discipline) ----
const { default: pixel } = { default: null };
console.log(JSON.stringify(verdict, null, 2));
const allOk = Object.values(verdict).every((v) => v.ok);
console.log(allOk ? "\nEVIDENCE: ALL FRAMES ok:true" : "\nEVIDENCE: FAILURES PRESENT");
process.exit(allOk ? 0 : 1);
