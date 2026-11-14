// S186 reference probe 4 — the YELLOW source. rgb(255,255,0) on
// text-primary-foreground buttons in the authed dark state. The :root app
// tokens are RGB triplets ("255 255 255") while the .dark platform tokens
// are HSL ("0 0% 9%") — the cascade + format interplay is the suspect.
// This probe: reads the CASCADED var values ON the button, tests what
// rgb(var(--x)) / hsl(var(--x)) compute to, and walks the ancestor chain
// for any intermediate re-definitions. Zero residue.
// Usage (node >= 23.6 — bun INCOMPATIBLE):
//   REF_PROBE_EMAIL=… REF_PROBE_PASSWORD=… node scripts/ref-probe-s186-yellow4.mjs
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const REF = "https://omni-study1.base44.app";
const OUT = "docs/probe-evidence/s186";
mkdirSync(OUT, { recursive: true });

const PROBE = `(() => {
  const btn = [...document.querySelectorAll("button")].find(b => (b.textContent || "").trim() === "Add Task");
  if (!btn) return JSON.stringify({ err: "no-btn" });
  const cs = getComputedStyle(btn);
  const htmlCs = getComputedStyle(document.documentElement);
  // Cascaded values ON the button element:
  const casc = {};
  for (const v of ["--primary", "--primary-foreground", "--background", "--foreground", "--accent"]) {
    casc[v] = { onBtn: cs.getPropertyValue(v).trim(), onHtml: htmlCs.getPropertyValue(v).trim() };
  }
  // Compute rgb(var(--x)) and hsl(var(--x)) for both candidate formats:
  const test = (fn) => { const d = document.createElement("div"); d.style.color = fn; document.body.appendChild(d); const c = getComputedStyle(d).color; d.remove(); return c; };
  const formats = {
    "rgb(onBtn --primary-foreground)": test("rgb(" + casc["--primary-foreground"].onBtn + ")"),
    "hsl(onBtn --primary-foreground)": test("hsl(" + casc["--primary-foreground"].onBtn + ")"),
    "rgb(onBtn --primary)": test("rgb(" + casc["--primary"].onBtn + ")"),
    "hsl(onBtn --primary)": test("hsl(" + casc["--primary"].onBtn + ")"),
  };
  // Ancestor walk: where does color change?
  const chain = [];
  let el = btn;
  for (let i = 0; i < 8 && el; i++) {
    const ecs = getComputedStyle(el);
    chain.push({ tag: el.tagName, cls: (el.className || "").toString().slice(0, 60), color: ecs.color });
    el = el.parentElement;
  }
  // The matched stylesheet rules containing text-primary-foreground:
  let utilityDefs = [];
  for (const sheet of document.styleSheets) {
    let rules; try { rules = sheet.cssRules; } catch { continue; }
    const scan = (rs) => {
      for (const r of rs || []) {
        if (r.cssRules) { scan(r.cssRules); continue; }
        if (r.selectorText && r.selectorText.includes("text-primary-foreground")) {
          utilityDefs.push({ sel: r.selectorText.slice(0, 70), css: (r.cssText || "").slice(0, 160) });
        }
      }
    };
    scan(rules);
  }
  return JSON.stringify({ btnColor: cs.color, casc, formats, chain, utilityDefs: utilityDefs.slice(0, 5) });
})()`;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(`${REF}/login`);
await page.fill("input[type=email]", process.env.REF_PROBE_EMAIL);
await page.fill("input[type=password]", process.env.REF_PROBE_PASSWORD);
await page.waitForFunction(() => { const b = document.querySelector("button[type=submit]"); return b && !b.disabled; }, null, { timeout: 15_000 });
await page.click("button[type=submit]");
await page.waitForFunction(() => document.querySelector("nav a") !== null && (document.querySelector("h1") || document.querySelector("h2")), null, { timeout: 30_000 });
await page.waitForTimeout(1500);
await page.goto(`${REF}/Tasks`);
await page.waitForTimeout(2400);
const result = await page.evaluate(PROBE);
writeFileSync(`${OUT}/ref-yellow-source.json`, result);
console.log(JSON.stringify(JSON.parse(result), null, 2));
await ctx.close();
await browser.close();
