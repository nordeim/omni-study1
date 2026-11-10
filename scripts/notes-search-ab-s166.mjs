// S166 parity probe — the Notes search vocabulary A/B (reference vs clone).
// The clone's search matches n.content.toLowerCase() (RAW HTML source) while
// its own list preview renders stripHtmlPreview(content) — a query like
// "span" would match every formatted note in the clone. This probe measures
// BOTH hosts' behavior for the same queries to adjudicate §8 (parity truth
// before any fix).
import { chromium } from "playwright";

const REF = "https://omni-study1.base44.app";
const CLONE = "http://localhost:3000";

async function probe(browser, base, creds) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${base}/login`);
  await page.fill("input[type=email]", creds.email);
  await page.fill("input[type=password]", creds.password);
  await page.waitForFunction(
    () => {
      const btn = document.querySelector("button[type=submit]");
      return btn !== null && !btn.disabled;
    },
    null,
    { timeout: 15_000 },
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
  await page.goto(`${base}/Notes`);
  await page.waitForTimeout(2500);

  const search = page.locator('input[aria-label="Search notes"], input[placeholder*="Search notes"]').first();
  const searchVisible = await search.isVisible().catch(() => false);
  const out = { base, searchVisible, queries: {} };
  if (!searchVisible) {
    await ctx.close();
    return out;
  }

  const rowCount = async () => {
    // List pane rows: the notes-view renders <button> rows with an h2 title.
    const pane = page.locator('[aria-label="Notes list pane"]').first();
    if (await pane.count()) {
      return await pane.locator("button").count();
    }
    return -1;
  };

  out.queries.empty = await rowCount();
  for (const q of ["span", "div", "integration", "zzz-not-a-word"]) {
    await search.fill(q);
    await page.waitForTimeout(700);
    out.queries[q] = await rowCount();
  }
  await ctx.close();
  return out;
}

const browser = await chromium.launch();
const reference = await probe(browser, REF, {
  email: process.env.REF_PROBE_EMAIL,
  password: process.env.REF_PROBE_PASSWORD,
});
const clone = await probe(browser, CLONE, { email: "demo@studyflow.app", password: "Demo1234!" });
await browser.close();
console.log(JSON.stringify({ reference, clone }, null, 2));
