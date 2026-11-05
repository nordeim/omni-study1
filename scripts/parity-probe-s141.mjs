// S141 live parity probe — desktop chrome + dashboard structure, both hosts.
// Computed styles are ground truth (the repo doctrine). One-shot probe.
import { chromium } from "playwright";

const REF = "https://omni-study1.base44.app";
const CLONE = "http://localhost:3000";

const PROBE = `(() => {
  const nav = document.querySelector("nav") || document.querySelector("aside");
  const navLinks = nav ? [...nav.querySelectorAll("a")] : [];
  const main = document.querySelector("main");
  const h1 = document.querySelector("h1, h2");
  const stats = [...document.querySelectorAll("main [class*='grid'] > div, main .grid > div")].length;
  return JSON.stringify({
    navWidth: nav ? getComputedStyle(nav).width : null,
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
  await page.click("button[type=submit]");
  await page.waitForFunction(() => document.querySelector("main") !== null, null, { timeout: 30000 });
  await page.waitForTimeout(1500);
  const result = JSON.parse(await page.evaluate(PROBE));
  await ctx.close();
  return result;
}

const browser = await chromium.launch();
// S141 secret-scan redaction: the reference-host probe account's literal
// credentials stay OUT of the tree (the operator contract — new files carry
// no credential material; the pre-s141 probe scripts keep their historical
// literals). Re-run this one-shot probe with REF_PROBE_EMAIL /
// REF_PROBE_PASSWORD exported.
const reference = await probe(browser, REF, {
  email: process.env.REF_PROBE_EMAIL,
  password: process.env.REF_PROBE_PASSWORD,
});
const clone = await probe(browser, CLONE, { email: "demo@studyflow.app", password: "Demo1234!" });
await browser.close();

console.log(JSON.stringify({ reference, clone }, null, 2));
const checks = {
  navWidthMatch: reference.navWidth === clone.navWidth,
  navLinkCountMatch: reference.navLinkCount === clone.navLinkCount,
  firstLinksMatch: JSON.stringify(reference.firstNavLinks) === JSON.stringify(clone.firstNavLinks),
  mainXMatch: reference.mainX === clone.mainX,
};
console.log(checks);
console.log(Object.values(checks).every(Boolean) ? "DESKTOP CHROME: MATCH" : "DESKTOP CHROME: DIVERGENCE");
