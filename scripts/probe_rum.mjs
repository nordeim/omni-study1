import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const ctx = await browser.newContext({
  storageState: "tests/e2e/.auth/user.json",
  baseURL: "http://localhost:3100",
});
const page = await ctx.newPage();
const resp = await page.request.get("http://localhost:3100/api/rum");
console.log("GET /api/rum:", resp.status());
const body = await resp.json();
console.log("samples:", body.samples, "p75 keys:", Object.keys(body.p75).length);
console.log("recent[0]:", JSON.stringify(body.recent[0] ?? null));
await page.goto("http://localhost:3100/rum");
await page.waitForTimeout(2500);
const diag = await page.evaluate(() => {
  const region = document.querySelector('[aria-label="Core Web Vitals at p75"]');
  const h1 = document.querySelector("main h1");
  const alert = document.querySelector('[role="alert"]');
  return {
    h1: h1?.textContent ?? null,
    regionFound: !!region,
    cardLabels: region ? [...region.querySelectorAll("p")].slice(0, 10).map((p) => p.textContent) : null,
    alert: alert?.textContent ?? null,
    loading: document.body.textContent?.includes("Loading the field metrics") ?? false,
  };
});
console.log(JSON.stringify(diag, null, 1));
await browser.close();
