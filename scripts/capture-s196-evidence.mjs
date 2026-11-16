// S196 evidence capture — the self-verifying frames for the studygroups +
// practicetests two-family e2e consolidation (Batch ET), ridden against the
// fresh :3200 standalone (the demo account, READ-ONLY surfaces — the dialogs
// are opened, asserted, and Escape-closed WITHOUT ever submitting; zero
// writes on the persistent demo account). The consolidation is a pure
// test-organization refactor — the frames document the CONSOLIDATED
// FAMILIES' surfaces (the views the 6 moved pins drive):
//   1. 196-studygroups-dialog.png — the seeded StudyGroups view at 1440
//      with the create dialog open (S171/DU2 + S176/DZ2's contracts: the
//      "Create Study Group" title, the "Group Name *" label + placeholder,
//      the Description label + placeholder, the SIX 32px swatches with the
//      white-ring scale(1.1) selected state, the Create-Group-then-Close
//      footer order)
//   2. 196-practicetests-dialog.png — the seeded PracticeTests view at
//      1440 with the create dialog open (S172/DV2's contract: the
//      "Create Practice Test" title, the "Test Title *" label, the measured
//      placeholder, the questions counter, the Create-Test-then-Close
//      footer order)
//   3. 196-devserver-studygroups.png — the dev server :3000 StudyGroups
//      view (the operator's standing dev-server screenshot request)
//   4. 196-devserver-practicetests.png — the dev server :3000
//      PracticeTests view (the second family's surface)
// Every frame is DOM-asserted BEFORE the shot and pixel-verified non-blank
// after (the standing evidence discipline). The assertions mirror the moved
// pins' own contracts (S171/DU2/S176/DZ2/S172/DV2) — the family map lives
// in docs/remediation-plan-session196.md. The S7-P zero-state contract
// rides its own fresh-account spec on the THROWAWAY e2e db (no persistent
// frame by the residue discipline); the S130/CE2 round-trip is a WRITE pin
// (self-cleaning on the e2e db) — likewise no persistent frame.
import { chromium } from "playwright";
import { mkdirSync, statSync } from "node:fs";

const OUT = "docs/screenshots";
mkdirSync(OUT, { recursive: true });

async function session(browser, base, viewport) {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  await page.goto(`${base}/login`, { timeout: 45_000 });
  await page.fill("input[type=email]", "demo@studyflow.app");
  await page.fill("input[type=password]", "Demo1234!");
  await page.waitForFunction(
    () => {
      const b = document.querySelector("button[type=submit]");
      return b !== null && !b.disabled;
    },
    null,
    { timeout: 20_000 },
  );
  await page.click("button[type=submit]");
  await page.waitForFunction(
    () =>
      document.querySelector("nav a") !== null &&
      (document.querySelector("h1") !== null || document.querySelector("h2") !== null),
    null,
    { timeout: 30_000 },
  );
  await page.waitForTimeout(1800);
  return { ctx, page };
}

const nonBlank = (path) => statSync(path).size > 50_000;

const browser = await chromium.launch();
const results = {};

// ---- Frame 1: the StudyGroups view + create dialog (S171/DU2 + S176/DZ2) --
{
  const { ctx, page } = await session(browser, "http://localhost:3200", {
    width: 1440,
    height: 900,
  });
  await page.locator("nav a").filter({ hasText: "Study Groups" }).first().click();
  await page.waitForTimeout(2400);
  await page.getByRole("button", { name: "Create study group" }).first().click();
  await page.waitForTimeout(900);
  const asserts = await page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"]');
    if (!dlg || !dlg.checkVisibility()) return { visible: false };
    const text = dlg.textContent || "";
    const name = dlg.querySelector("#group-name");
    const desc = dlg.querySelector("#group-description");
    const swatches = [...dlg.querySelectorAll("button[aria-label^='Choose color #']")];
    const sel = swatches.find((b) => b.getAttribute("aria-pressed") === "true");
    const selCs = sel ? getComputedStyle(sel) : null;
    const unselected = swatches.find((b) => b.getAttribute("aria-pressed") !== "true");
    const unRect = unselected ? unselected.getBoundingClientRect() : null;
    const form = dlg.querySelector("form");
    const buttons = form
      ? [...form.querySelectorAll("button")].map((b) => (b.textContent || "").trim())
      : [];
    const filtered = buttons.filter((t) => t === "Create Group" || t === "Close");
    return {
      visible: true,
      title: !!dlg.querySelector('h2, [role="heading"]') && text.includes("Create Study Group"),
      nameLabel: text.includes("Group Name *"),
      namePlaceholder: name ? name.getAttribute("placeholder") === "e.g., Math Study Squad" : false,
      descLabel: text.includes("Description"),
      descPlaceholder: desc ? desc.getAttribute("placeholder") === "What's this group about?" : false,
      swatchCount: swatches.length,
      swatchW: unRect ? Math.round(unRect.width) : null,
      selShadow: selCs ? selCs.boxShadow.includes("rgb(255, 255, 255) 0px 0px 0px 2px") : false,
      selScale: selCs ? selCs.transform.includes("1.1") : false,
      footerOrder:
        filtered.length === 2 && filtered[0] === "Create Group" && filtered[1] === "Close",
    };
  });
  const ok =
    asserts.visible &&
    asserts.title &&
    asserts.nameLabel &&
    asserts.namePlaceholder &&
    asserts.descLabel &&
    asserts.descPlaceholder &&
    asserts.swatchCount === 6 &&
    asserts.swatchW === 32 &&
    asserts.selShadow &&
    asserts.selScale &&
    asserts.footerOrder;
  await page.screenshot({
    path: `${OUT}/196-studygroups-dialog.png`,
    fullPage: false,
  });
  // Close the dialog without submitting (read-only discipline).
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);
  results.studygroups = {
    ok,
    asserts,
    nonBlank: nonBlank(`${OUT}/196-studygroups-dialog.png`),
  };
  await ctx.close();
}

// ---- Frame 2: the PracticeTests view + create dialog (S172/DV2) ----------
{
  const { ctx, page } = await session(browser, "http://localhost:3200", {
    width: 1440,
    height: 900,
  });
  await page.locator("nav a").filter({ hasText: "Practice Tests" }).first().click();
  await page.waitForTimeout(2400);
  await page.getByRole("button", { name: "Create Test" }).first().click();
  await page.waitForTimeout(900);
  const asserts = await page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"]');
    if (!dlg || !dlg.checkVisibility()) return { visible: false };
    const text = dlg.textContent || "";
    const title = dlg.querySelector("#test-title");
    const form = dlg.querySelector("form");
    const buttons = form
      ? [...form.querySelectorAll("button")].map((b) => (b.textContent || "").trim())
      : [];
    const filtered = buttons.filter((t) => t === "Create Test" || t === "Close");
    return {
      visible: true,
      title: text.includes("Create Practice Test"),
      titleLabel: text.includes("Test Title *"),
      titlePlaceholder: title
        ? title.getAttribute("placeholder") === "e.g., Biology Chapter 5 Review"
        : false,
      counter: /0 questions added/.test(text),
      footerOrder:
        filtered.length === 2 && filtered[0] === "Create Test" && filtered[1] === "Close",
    };
  });
  const ok =
    asserts.visible &&
    asserts.title &&
    asserts.titleLabel &&
    asserts.titlePlaceholder &&
    asserts.counter &&
    asserts.footerOrder;
  await page.screenshot({
    path: `${OUT}/196-practicetests-dialog.png`,
    fullPage: false,
  });
  // Close the dialog without submitting (read-only discipline).
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);
  results.practicetests = {
    ok,
    asserts,
    nonBlank: nonBlank(`${OUT}/196-practicetests-dialog.png`),
  };
  await ctx.close();
}

// ---- Frames 3+4: the dev server :3000 (the operator's standing request) ---
for (const [key, nav, file] of [
  ["devserverStudygroups", "Study Groups", "196-devserver-studygroups.png"],
  ["devserverPracticetests", "Practice Tests", "196-devserver-practicetests.png"],
]) {
  const { ctx, page } = await session(browser, "http://localhost:3000", {
    width: 1440,
    height: 900,
  });
  await page.locator("nav a").filter({ hasText: nav }).first().click();
  await page.waitForTimeout(2400);
  const heading = await page.evaluate(() => {
    const h = document.querySelector("h1");
    return h ? h.textContent.trim() : null;
  });
  await page.screenshot({ path: `${OUT}/${file}`, fullPage: false });
  results[key] = {
    ok: heading !== null && nonBlank(`${OUT}/${file}`),
    heading,
    nonBlank: nonBlank(`${OUT}/${file}`),
  };
  await ctx.close();
}

await browser.close();
console.log(JSON.stringify(results, null, 2));
const allOk = Object.values(results).every((r) => r.ok && r.nonBlank);
console.log(allOk ? "S196 EVIDENCE: ALL FRAMES GREEN" : "S196 EVIDENCE: FAILURES PRESENT");
process.exitCode = allOk ? 0 : 1;
