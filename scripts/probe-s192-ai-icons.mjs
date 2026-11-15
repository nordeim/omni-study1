// S192 AI icon detail probe — the empty-state greeting icon, the composer
// send icon, and the quick-action card inner HTML on the reference.
// READ-ONLY. Usage:
//   REF_PROBE_EMAIL=… REF_PROBE_PASSWORD=… node scripts/probe-s192-ai-icons.mjs
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
  const greet = [...main.querySelectorAll("div")].find((d) =>
    (d.className || "").toString().includes("py-20"),
  );
  const gsvg = greet?.querySelector("svg");
  const ta = main.querySelector("textarea");
  const sendBtn = ta?.closest("div")?.querySelector("button");
  const ssvg = sendBtn?.querySelector("svg");
  const quickCard = [...main.querySelectorAll("button")].find((b) =>
    b.textContent.trim().startsWith("Explain Concept"),
  );
  const qsvg = quickCard?.querySelector("svg");
  const cs = (el) =>
    el
      ? {
          w: getComputedStyle(el).width,
          h: getComputedStyle(el).height,
          color: getComputedStyle(el).color,
          classes: (el.getAttribute("class") || "").slice(0, 90),
        }
      : null;
  return {
    greetSvg: cs(gsvg),
    sendSvg: cs(ssvg),
    sendBtnCls: sendBtn ? (sendBtn.getAttribute("class") || "").slice(0, 220) : null,
    sendBtnHTML: sendBtn
      ? sendBtn.innerHTML.replace(/<svg[\s\S]*?<\/svg>/g, "<svg…/>").replace(/\s+/g, " ").slice(0, 300)
      : null,
    quickSvg: cs(qsvg),
    quickBtnHTML: quickCard
      ? quickCard.innerHTML.replace(/<svg[\s\S]*?<\/svg>/g, "<svg…/>").replace(/\s+/g, " ").slice(0, 420)
      : null,
  };
});
console.log(JSON.stringify(out, null, 1));
await ctx.close();
await browser.close();
