// S170 one-shot probe — full computed-style comparison of the desktop
// sidebar shell: reference vs clone (border-color, bg, backdrop, shadow, z).
import { chromium } from "playwright";

const REF = "https://omni-study1.base44.app";
const CLONE = "http://localhost:3000";

const PROBE = `(() => {
  const aside = document.querySelector("aside");
  if (!aside) return null;
  const cs = getComputedStyle(aside);
  return {
    cls: String(aside.className).slice(0, 200),
    width: cs.width, position: cs.position, zIndex: cs.zIndex,
    borderL: cs.borderLeftWidth, borderR: cs.borderRightWidth,
    borderLColor: cs.borderLeftColor, borderRColor: cs.borderRightColor,
    background: cs.backgroundImage ? cs.backgroundImage.slice(0, 120) : cs.backgroundColor,
    backgroundColor: cs.backgroundColor,
    backdrop: cs.backdropFilter,
    boxShadow: cs.boxShadow,
    transition: cs.transitionProperty + " " + cs.transitionDuration,
    display: cs.display,
  };
})()`;

async function probe(browser, base, creds) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${base}/login`);
  await page.fill("input[type=email]", creds.email);
  await page.fill("input[type=password]", creds.password);
  await page.click("button[type=submit]");
  await page.waitForFunction(() => document.querySelector("main") !== null, null, { timeout: 30000 });
  let result = null;
  for (let i = 0; i < 6 && !result; i++) {
    await page.waitForTimeout(2000);
    result = await page.evaluate(PROBE);
  }
  await ctx.close();
  return result;
}

const browser = await chromium.launch();
const reference = await probe(browser, REF, { email: process.env.REF_PROBE_EMAIL, password: process.env.REF_PROBE_PASSWORD });
const clone = await probe(browser, CLONE, { email: "demo@studyflow.app", password: "Demo1234!" });
await browser.close();
console.log(JSON.stringify({ reference, clone }, null, 1));
