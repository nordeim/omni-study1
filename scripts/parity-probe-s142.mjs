// S142 live parity probe — desktop chrome + dashboard structure, both hosts.
// Computed styles are ground truth (the repo doctrine). One-shot probe.
//
// Fixes the s141 probe's timing artifact (verified by trace, s142): the
// reference's login click renders a SPLASH containing <main> while the URL
// is still /login — the s141 main-wait resolved on the splash and evaluated
// inside the re-render window (nulls). The settled-state contract here:
// URL === "/" AND nav present AND the dashboard heading present, THEN
// probe. The heading wait also guarantees the view (not the splash) is the
// thing measured.
import { chromium } from "playwright";

const REF = "https://omni-study1.base44.app";
const CLONE = "http://localhost:3000";

const PROBE = `(() => {
  const nav = document.querySelector("nav") || document.querySelector("aside");
  const navLinks = nav ? [...nav.querySelectorAll("a")] : [];
  const main = document.querySelector("main");
  const h1 = document.querySelector("h1, h2");
  const stats = [...document.querySelectorAll("main [class*='grid'] > div, main .grid > div")].length;
  // The OUTER sidebar footprint: the reference's first <nav> is an inner
  // scrollable div (258px inside a 260px shell — the s141/s142 probe
  // artifact); the parent's width is the shell measurement both hosts
  // share. mainX is the independent authority (both hosts pin 260).
  const sidebarOuter = nav && nav.parentElement ? Math.round(nav.parentElement.getBoundingClientRect().width) : null;
  return JSON.stringify({
    navWidth: nav ? getComputedStyle(nav).width : null,
    sidebarOuterWidth: sidebarOuter,
    navPosition: nav ? getComputedStyle(nav).position : null,
    navLinkCount: navLinks.length,
    firstNavLinks: navLinks.slice(0, 5).map((a) => a.textContent.trim().slice(0, 18)),
    mainX: main ? Math.round(main.getBoundingClientRect().x) : null,
    mainWidth: main ? Math.round(main.getBoundingClientRect().width) : null,
    heading: h1 ? h1.textContent.trim().slice(0, 40) : null,
    statCards: stats,
  });
})()`;

async function probe(browser, base, creds) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${base}/login`);
  await page.fill("input[type=email]", creds.email);
  await page.fill("input[type=password]", creds.password);
  // The preflight doctrine (scripts/dev-server-preflight.mjs): the submit
  // button only ENABLES once hydrated React has landed both input events —
  // clicking a pre-hydration disabled button is a silent no-op (the s142
  // reference-host timeout root cause).
  await page.waitForFunction(
    () => {
      const btn = document.querySelector("button[type=submit]");
      return btn !== null && !btn.disabled;
    },
    null,
    { timeout: 15_000 },
  );
  await page.click("button[type=submit]");
  // Settled-state contract: the nav (with links) AND a heading rendered —
  // pathname-agnostic (the reference redirects its SPA shell to
  // "/Dashboard" post-login while the clone serves "/" — both are the
  // settled dashboard surface; the geometry probe below measures the
  // chrome, not the URL). Immune to the splash-main artifact.
  try {
    await page.waitForFunction(
      () =>
        document.querySelector("nav a") !== null &&
        (document.querySelector("h1") !== null || document.querySelector("h2") !== null),
      null,
      { timeout: 30000 },
    );
  } catch {
    const dbg = await page
      .evaluate(() => ({
        url: location.pathname,
        hasNav: !!document.querySelector("nav"),
        hasMain: !!document.querySelector("main"),
        h1: document.querySelector("h1")?.textContent?.slice(0, 40) ?? null,
        alert: document.querySelector('[role="alert"]')?.textContent?.trim().slice(0, 120) ?? null,
        submitDisabled: document.querySelector("button[type=submit]")?.disabled ?? null,
        emailVal: document.querySelector("input[type=email]")?.value?.slice(0, 3) ?? null,
      }))
      .catch(() => "evaluate-failed");
    console.error("SETTLE-TIMEOUT-DEBUG:", JSON.stringify(dbg));
    throw new Error(`settled-state timeout on ${base}: ${JSON.stringify(dbg)}`);
  }
  await page.waitForTimeout(1500);
  const result = JSON.parse(await page.evaluate(PROBE));
  await ctx.close();
  return result;
}

const browser = await chromium.launch();
// Secret-scan posture (the s141 contract): the reference-host probe
// account's literal credentials stay OUT of the tree — re-run with
// REF_PROBE_EMAIL / REF_PROBE_PASSWORD exported.
const reference = await probe(browser, REF, {
  email: process.env.REF_PROBE_EMAIL,
  password: process.env.REF_PROBE_PASSWORD,
});
const clone = await probe(browser, CLONE, { email: "demo@studyflow.app", password: "Demo1234!" });
await browser.close();

console.log(JSON.stringify({ reference, clone }, null, 2));
const checks = {
  sidebarOuterWidthMatch: reference.sidebarOuterWidth === clone.sidebarOuterWidth,
  navLinkCountMatch: reference.navLinkCount === clone.navLinkCount,
  firstLinksMatch: JSON.stringify(reference.firstNavLinks) === JSON.stringify(clone.firstNavLinks),
  mainXMatch: reference.mainX === clone.mainX,
  mainWidthMatch: reference.mainWidth === clone.mainWidth,
};
console.log(checks);
console.log(
  Object.values(checks).every(Boolean) ? "DESKTOP CHROME: MATCH" : "DESKTOP CHROME: DIVERGENCE",
);
