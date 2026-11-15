// S192 AI header probe — the reference's AI view header (h1 + subtitle)
// anatomy, completing the port spec. READ-ONLY. Usage:
//   REF_PROBE_EMAIL=… REF_PROBE_PASSWORD=… node scripts/probe-s192-ai-header.mjs
import { chromium } from "playwright";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto("https://omni-study1.base44.app/login", { timeout: 45_000 });
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
await page.waitForFunction(() => document.body.innerText.length > 50, null, { timeout: 30_000 });
await page.waitForTimeout(4000);
await page.evaluate(() => {
  const l = [...document.querySelectorAll("a")].find(
    (a) => a.textContent.trim() === "AI Assistant" && a.getBoundingClientRect().width > 0,
  );
  if (l) l.click();
});
await page.waitForTimeout(3000);
const out = await page.evaluate(() => {
  const main = document.querySelector("main") || document.body;
  const h1 = main.querySelector("h1");
  const sub = h1?.parentElement?.querySelector("p, div:not(:scope)");
  const h1cs = h1 ? getComputedStyle(h1) : null;
  const subcs = sub ? getComputedStyle(sub) : null;
  const wrapper = h1?.parentElement?.parentElement;
  return {
    h1: h1
      ? {
          t: h1.textContent.trim(),
          cls: (h1.getAttribute("class") || "").slice(0, 120),
          fs: h1cs?.fontSize,
          fw: h1cs?.fontWeight,
          mb: h1cs?.marginBottom,
        }
      : null,
    sub: sub
      ? {
          t: sub.textContent.trim().slice(0, 60),
          cls: (sub.getAttribute("class") || "").slice(0, 120),
          fs: subcs?.fontSize,
          color: subcs?.color,
        }
      : null,
    headerWrapCls: wrapper ? (wrapper.getAttribute("class") || "").slice(0, 120) : null,
    headerWrapW: wrapper ? Math.round(wrapper.getBoundingClientRect().width) : null,
  };
});
console.log(JSON.stringify(out, null, 1));
await ctx.close();
await browser.close();
