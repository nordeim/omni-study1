// S186 reference probe 7 — the AUTH BUTTON FAMILY census. The Sign in
// button measured solid slate-900 (bg-slate-900 hover:bg-slate-800
// text-white rounded-xl shadow-sm — never color-measured before; the
// clone's gradient was the app-wide CTA assumption). This probe censuses
// EVERY auth sub-screen's primary + secondary buttons: signin, signup
// (fresh throwaway registration — the S15 precedent), verify (the
// registration's own OTP screen), forgot (from the signin link).
// Zero content residue on the operator account (the throwaway account is
// the probe vehicle; nothing on the operator account is touched).
// Usage (node >= 23.6 — bun INCOMPATIBLE):
//   REF_PROBE_EMAIL=… REF_PROBE_PASSWORD=… node scripts/ref-probe-s186-auth7.mjs
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const REF = "https://omni-study1.base44.app";
const OUT = "docs/probe-evidence/s186";
mkdirSync(OUT, { recursive: true });

const BTN_DUMP = `(() => {
  const card = document.querySelector("div.shadow-2xl") || document.body;
  const out = [];
  for (const b of card.querySelectorAll("button")) {
    const r = b.getBoundingClientRect();
    if (r.width === 0) continue;
    const cs = getComputedStyle(b);
    out.push({
      text: (b.textContent || "").trim().slice(0, 40),
      type: b.type,
      bg: cs.backgroundColor,
      color: cs.color,
      bi: cs.backgroundImage.slice(0, 80),
      h: Math.round(r.height),
      radius: cs.borderRadius,
      shadow: cs.boxShadow === "none" ? "none" : cs.boxShadow.slice(0, 46),
      fw: cs.fontWeight,
      fullCls: (b.className || "").toString(),
    });
  }
  return JSON.stringify(out);
})()`;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

// ---- 1. signin (anon) ----
await page.goto(`${REF}/login`);
await page.waitForTimeout(2600);
const signin = JSON.parse(await page.evaluate(BTN_DUMP));
await page.screenshot({ path: `${OUT}/ref-auth-signin.png` });

// ---- 2. signup (the Sign up link) ----
await page.getByText("Need an account? Sign up").click();
await page.waitForTimeout(2200);
const signup = JSON.parse(await page.evaluate(BTN_DUMP));
await page.screenshot({ path: `${OUT}/ref-auth-signup.png` });
const signupHeadings = await page.evaluate(() => [...document.querySelectorAll("h1, h2")].map(h => h.textContent.trim()));

// Fill the signup form with a throwaway probe account (S15 precedent).
const PROBE_EMAIL = `s186probe${Date.now()}@outlook.com`;
const PROBE_PASSWORD = "S186probe-Pass1";
await page.fill("input[type=email]", PROBE_EMAIL);
await page.fill("#password, input[name=password]", PROBE_PASSWORD);
await page.fill("#confirmPassword, input[name=confirmPassword]", PROBE_PASSWORD);
await page.waitForFunction(() => { const b = [...document.querySelectorAll("button")].find(x => /sign up|create/i.test(x.textContent || "")); return b && !b.disabled; }, null, { timeout: 10_000 });
const submitBtn = [...await page.locator("button").all()].find(async (b) => false);
// click the primary submit (type=submit preferred)
await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find(x => x.type === "submit" && (x.textContent || "").trim().length > 0);
  if (b) b.click();
});
await page.waitForTimeout(3000);
const verify = JSON.parse(await page.evaluate(BTN_DUMP)).filter(b => b.text.length > 0);
await page.screenshot({ path: `${OUT}/ref-auth-verify.png` });
const verifyText = await page.evaluate(() => (document.querySelector("div.shadow-2xl")?.textContent || "").slice(0, 300));

// ---- 3. forgot (from a fresh signin) ----
await page.goto(`${REF}/login`);
await page.waitForTimeout(2200);
await page.getByText("Forgot password?").click();
await page.waitForTimeout(2200);
const forgot = JSON.parse(await page.evaluate(BTN_DUMP));
await page.screenshot({ path: `${OUT}/ref-auth-forgot.png` });
// Escape back — no submit on the forgot form (zero residue on the operator account).
await page.goto(`${REF}/login`);
await ctx.close();
await browser.close();

writeFileSync(`${OUT}/ref-auth-buttons.json`, JSON.stringify({ signin, signup, signupHeadings, verify, verifyText, forgot }, null, 2));
console.log("== signin =="); console.log(JSON.stringify(signin.map(b => ({ t: b.text, bg: b.bg, c: b.color, h: b.h, r: b.radius })), null, 1));
console.log("== signup =="); console.log(JSON.stringify(signup.map(b => ({ t: b.text, bg: b.bg, c: b.color, h: b.h, r: b.radius })), null, 1));
console.log("== verify =="); console.log(JSON.stringify(verify.map(b => ({ t: b.text, bg: b.bg, c: b.color, h: b.h, r: b.radius })), null, 1));
console.log("== forgot =="); console.log(JSON.stringify(forgot.map(b => ({ t: b.text, bg: b.bg, c: b.color, h: b.h, r: b.radius })), null, 1));
console.log("signupHeadings:", JSON.stringify(signupHeadings));
console.log("verifyText:", verifyText.slice(0, 200));
