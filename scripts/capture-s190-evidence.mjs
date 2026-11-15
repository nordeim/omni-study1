// S190 evidence capture — the measured three-family parity port frames.
// Frame 1: the remediated Calculator's Basic card at 1440x900 with the
// measured anatomy DOM-asserted before the shot (the Clear/backspace
// near-black row-1 pair, the 18-key census, the max-w-md card, the
// slate-800 operators, the near-black active tab). Frame 2: the
// remediated Focus Timer panel with its measured chrome DOM-asserted
// (the rounded-3xl panel, the 36px mode pills, the 64px tinted presets,
// the brain-icon ring, the near-black controls flanking the play, the
// "Select subject" placeholder).
// Usage: node scripts/capture-s190-evidence.mjs  (the dev server at
// :3000 carries the current tree)
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const CLONE = "http://localhost:3000";
const OUT = "docs/screenshots";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${CLONE}/login`);
  await page.fill("input[type=email]", "demo@studyflow.app");
  await page.fill("input[type=password]", "Demo1234!");
  await page.waitForFunction(
    () => { const b = document.querySelector("button[type=submit]"); return b && !b.disabled; },
    null, { timeout: 30_000 },
  );
  await page.click("button[type=submit]");
  await page.waitForFunction(
    () => document.querySelector("nav a") !== null && document.querySelector("h1, h2") !== null,
    null, { timeout: 30_000 },
  );
  await page.waitForTimeout(1500);

  // ---- Frame 1: the calculator card ----
  await page.locator("nav a").filter({ hasText: "Calculator" }).first().click();
  await page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true", null, { timeout: 15_000 });
  await page.waitForTimeout(800);
  const calcAssert = await page.evaluate(`(() => {
    const basic = document.querySelector('[role=tabpanel][data-state=active]');
    const keys = [...basic.querySelectorAll("button")].filter((b) => b.getBoundingClientRect().width > 0 && b.getBoundingClientRect().y > 150);
    const clear = keys.find((b) => b.getAttribute("aria-label") === "Clear");
    const bs = keys.find((b) => b.getAttribute("aria-label") === "Backspace");
    const op = keys.find((b) => b.textContent.trim() === "÷");
    const card = clear.closest("div[class*=max-w-md]");
    return JSON.stringify({
      keyCount: keys.length,
      clearBg: clear ? getComputedStyle(clear).backgroundColor : null,
      bsIconOnly: bs ? bs.textContent.trim() === "" : null,
      bsBg: bs ? getComputedStyle(bs).backgroundColor : null,
      opBg: op ? getComputedStyle(op).backgroundColor : null,
      cardCls: card ? card.getAttribute("class").slice(0, 40) : null,
      display: !!basic.querySelector('[aria-label="Calculator display"]'),
    });
  })()`);
  const calc = JSON.parse(calcAssert);
  if (calc.keyCount !== 18) throw new Error(`key census ${calc.keyCount} != 18`);
  if (calc.clearBg !== "rgb(10, 10, 10)") throw new Error(`Clear bg ${calc.clearBg}`);
  if (calc.bsIconOnly !== true || calc.bsBg !== "rgb(10, 10, 10)") throw new Error(`backspace ${calc.bsIconOnly}/${calc.bsBg}`);
  if (calc.opBg !== "rgb(30, 41, 59)") throw new Error(`op bg ${calc.opBg}`);
  if (!calc.cardCls || !calc.cardCls.includes("max-w-md")) throw new Error(`card ${calc.cardCls}`);
  if (!calc.display) throw new Error("display missing");
  console.log("calculator card verified: 18 keys, the near-black row-1 pair, slate-800 ops, the max-w-md card");
  await page.screenshot({ path: `${OUT}/190-calculator-card-desktop.png` });

  // ---- Frame 2: the focus timer panel ----
  await page.locator("nav a").filter({ hasText: "Focus Timer" }).first().click();
  await page.waitForTimeout(1800);
  const focusAssert = await page.evaluate(`(() => {
    const timer = document.querySelector('[role=timer]');
    let panel = timer;
    while (panel && !/rounded-3xl/.test(panel.getAttribute("class") || "")) panel = panel.parentElement;
    const holder = timer.parentElement;
    const pomo = [...document.querySelectorAll("button")].find((b) => /Pomodoro/.test(b.textContent));
    const focus = [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "Focus");
    const select = document.querySelector('[role=combobox]');
    return JSON.stringify({
      panel: !!panel,
      brain: !!holder.querySelector("svg.lucide-brain"),
      mono: getComputedStyle(timer).fontFamily.includes("mono"),
      pomoH: Math.round(pomo.getBoundingClientRect().height),
      pomoBg: getComputedStyle(pomo).backgroundColor,
      modeH: Math.round(focus.getBoundingClientRect().height),
      modeGrad: getComputedStyle(focus).backgroundImage.includes("linear-gradient"),
      selectText: select.textContent.trim(),
    });
  })()`);
  const focus = JSON.parse(focusAssert);
  if (!focus.panel) throw new Error("panel missing");
  if (!focus.brain) throw new Error("brain icon missing");
  if (!focus.mono) throw new Error("mono clock missing");
  if (focus.pomoH !== 64) throw new Error(`preset h ${focus.pomoH}`);
  if (focus.pomoBg !== "rgb(237, 233, 254)") throw new Error(`preset bg ${focus.pomoBg}`);
  if (focus.modeH !== 36) throw new Error(`mode h ${focus.modeH}`);
  if (!focus.modeGrad) throw new Error("mode gradient missing");
  if (focus.selectText !== "Select subject") throw new Error(`select ${focus.selectText}`);
  console.log("focus timer verified: the panel, the brain-icon mono ring, the 64px tinted presets, the 36px gradient mode pill, the placeholder select");
  await page.screenshot({ path: `${OUT}/190-focus-timer-panel-desktop.png` });

  // Pixel verification: both frames carry rendered content (non-blank).
  // A file:// page per image (same-origin — the localhost page would taint
  // the canvas / block the cross-origin load).
  const pixel = async (p) => {
    const p2 = await ctx.newPage();
    await p2.goto("file:///home/z/my-project/omni-study1/" + p);
    const ratio = await p2.evaluate(async () => {
      const img = document.querySelector("img");
      if (!img) return -1;
      const c = document.createElement("canvas");
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      c.getContext("2d").drawImage(img, 0, 0);
      const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
      let nonWhite = 0;
      for (let i = 0; i < d.length; i += 4) if (d[i] < 245 || d[i + 1] < 245 || d[i + 2] < 245) nonWhite++;
      return nonWhite / (d.length / 4);
    });
    await p2.close();
    return ratio;
  };
  const r1 = await pixel("docs/screenshots/190-calculator-card-desktop.png");
  const r2 = await pixel("docs/screenshots/190-focus-timer-panel-desktop.png");
  console.log(`pixel-probe: calculator ${(r1 * 100).toFixed(1)}% non-white · focus ${(r2 * 100).toFixed(1)}% non-white`);
  if (r1 < 0.05 || r2 < 0.05) throw new Error("a frame reads blank");
  console.log("S190 evidence frames captured + verified");
} finally {
  await browser.close();
}
