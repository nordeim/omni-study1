// S179 cycle-end residue check — the reference account's Notes surface
// re-verified at ZERO probe residue (the plan §7 contract; the probe
// notes were deleted through the reference's own UI last session — this
// re-confirms the end state survives).
import { chromium } from "playwright";

const REF = "https://omni-study1.base44.app";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(`${REF}/login`, { timeout: 60_000, waitUntil: "domcontentloaded" });
await page.waitForTimeout(2500);
await page.fill("input[type=email]", process.env.REF_PROBE_EMAIL);
await page.fill("input[type=password]", process.env.REF_PROBE_PASSWORD);
await page.waitForFunction(
  () => {
    const btn = document.querySelector("button[type=submit]");
    return btn !== null && !btn.disabled;
  },
  null,
  { timeout: 30_000 },
);
await page.click("button[type=submit]");
await page.waitForFunction(() => document.querySelector("nav a") !== null, null, { timeout: 30_000 });
await page.waitForTimeout(1500);
await page.evaluate(() => { const a = [...document.querySelectorAll("nav a")].find((x) => x.textContent.trim().startsWith("Notes")); if (a) a.click(); });
await page.waitForTimeout(2500);
const state = await page.evaluate(() => {
  const text = document.body.textContent || "";
  const rows = [...document.querySelectorAll("button")].filter((b) => b.textContent.includes("EC1 Pin Probe") || b.textContent.includes("EC3 Coding Probe"));
  return {
    noNotesYet: text.includes("No notes yet"),
    probeRows: rows.length,
    anyNoteRow: text.includes("Select a note"),
  };
});
console.log("reference notes end state:", JSON.stringify(state));
await ctx.close();
await browser.close();
if (state.probeRows !== 0 || !state.noNotesYet) {
  throw new Error("RESIDUE on the reference account — probe notes present");
}
console.log("REFERENCE RESIDUE: ZERO — the account holds 0 notes");
