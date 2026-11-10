// S170 one-shot probe — the reference's COLLAPSED sidebar state + the
// mobile header bar, so the drift catch-up covers both shell states.
import { chromium } from "playwright";

const REF = "https://omni-study1.base44.app";

const browser = await chromium.launch();

// --- Desktop collapsed state ---
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${REF}/login`);
  await page.fill("input[type=email]", process.env.REF_PROBE_EMAIL);
  await page.fill("input[type=password]", process.env.REF_PROBE_PASSWORD);
  await page.click("button[type=submit]");
  await page.waitForFunction(() => document.querySelector("main") !== null, null, { timeout: 30000 });
  await page.waitForTimeout(2500);
  const before = await page.evaluate(`(() => {
    const a = document.querySelector("aside");
    return a ? getComputedStyle(a).width : null;
  })()`);
  // The collapse chevron: aria-label on the reference?
  const btns = await page.evaluate(`(() => {
    const a = document.querySelector("aside");
    if (!a) return [];
    return [...a.querySelectorAll("button")].map((b) => ({ label: b.getAttribute("aria-label"), text: b.textContent.trim().slice(0, 20) }));
  })()`);
  console.log("expanded aside width:", before, "buttons:", JSON.stringify(btns));
  // Try collapsing via the chevron (aria-label containing 'ollapse' or the last button).
  const chev = page.locator("aside button[aria-label*='ollapse']").first();
  if (await chev.count()) {
    await chev.click();
    await page.waitForTimeout(600);
    const after = await page.evaluate(`(() => {
      const a = document.querySelector("aside");
      if (!a) return null;
      const cs = getComputedStyle(a);
      return { width: cs.width, borderL: cs.borderLeftWidth, shadow: cs.boxShadow.slice(0, 60) };
    })()`);
    console.log("collapsed:", JSON.stringify(after));
    // main offset when collapsed
    const mainX = await page.evaluate(`(() => { const m = document.querySelector("main"); return m ? Math.round(m.getBoundingClientRect().x) : null; })()`);
    console.log("collapsed mainX:", mainX);
  } else {
    console.log("no collapse chevron found");
  }
  await ctx.close();
}

// --- Mobile header (390x844) ---
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto(`${REF}/login`);
  await page.fill("input[type=email]", process.env.REF_PROBE_EMAIL);
  await page.fill("input[type=password]", process.env.REF_PROBE_PASSWORD);
  await page.click("button[type=submit]");
  await page.waitForFunction(() => document.querySelector("main") !== null, null, { timeout: 30000 });
  await page.waitForTimeout(2500);
  const hdr = await page.evaluate(`(() => {
    const h = document.querySelector("header");
    if (!h) return null;
    const cs = getComputedStyle(h);
    return { cls: String(h.className).slice(0, 150), h: cs.height, pos: cs.position, z: cs.zIndex, bg: cs.backgroundColor, blur: cs.backdropFilter, borderB: cs.borderBottomWidth, borderBColor: cs.borderBottomColor };
  })()`);
  console.log("mobile header:", JSON.stringify(hdr, null, 1));
  await ctx.close();
}

await browser.close();
