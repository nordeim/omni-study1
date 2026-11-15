// S194 evidence capture — the two self-verifying frames for the
// files-family e2e consolidation (Batch ER), ridden against the fresh
// :3200 standalone (the demo account). The consolidation is a pure
// test-organization refactor — the frames document the CONSOLIDATED
// FAMILY'S surfaces (the view the 7 moved pins drive), on the final tree:
//   1. 194-files-desktop.png — the seeded zero-state Files view at 1440
//      (EG1's contract: the All Files crumb, the search, the All Types
//      select at 160px, the grid/list toggle, the "No files yet" empty)
//   2. 194-files-sectioned.png — the fixture-populated sectioned grid at
//      1440 (EG2's contract: the Folders/Files labels, the folder + file
//      cards, the ellipsis menus, the 6-column grid) — the fixtures are
//      created via the EG idiom (stamped) and DELETED after the shot
//      (the leave-no-residue discipline for the persistent custom.db —
//      the EG pins' own residue rides the THROWAWAY e2e scratch db, this
//      host does not get to keep them)
// Every frame is DOM-asserted BEFORE the shot and pixel-verified non-blank
// after (the standing evidence discipline). The assertions mirror the
// moved pins' own contracts (EG1/EG2) — the family map lives in
// docs/remediation-plan-session194.md.
import { chromium } from "playwright";
import { mkdirSync, statSync } from "node:fs";

const CLONE = "http://localhost:3200";
const OUT = "docs/screenshots";
mkdirSync(OUT, { recursive: true });

async function session(browser, viewport) {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  await page.goto(`${CLONE}/login`, { timeout: 45_000 });
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

// Frame 1: the seeded zero-state toolbar at 1440 (EG1's contract — the
// seed leaves Files empty, the S4-C convention).
{
  const { ctx, page } = await session(browser, { width: 1440, height: 900 });
  await page.locator("nav a").filter({ hasText: "Files" }).first().click();
  await page.waitForTimeout(2200);
  // DOM-assert the family's contracts before the shot (EG1).
  const asserts = await page.evaluate(() => {
    const home = [...document.querySelectorAll("button")].find(
      (b) => (b.textContent || "").trim() === "All Files",
    );
    const homeCls = home ? String(home.className) : "";
    const search = document.querySelector('input[placeholder="Search files..."]');
    const combo = document.querySelector('[role=combobox]');
    const comboW = combo ? Math.round(combo.getBoundingClientRect().width) : 0;
    const toggle = [...document.querySelectorAll('button[aria-label]')].find((b) =>
      /grid view|list view/i.test(b.getAttribute("aria-label") || ""),
    );
    const empty = [...document.querySelectorAll("main p, main h1, main h2, main h3")].find(
      (el) => (el.textContent || "").trim() === "No files yet",
    );
    return {
      homeCrumb: !!home && homeCls.includes("hover:text-violet-600"),
      search: !!search && String(search.className).includes("pl-10"),
      allTypes: !!combo && /All Types/.test(combo.textContent || ""),
      comboW,
      toggle: !!toggle,
      emptyState: !!empty,
    };
  });
  const ok =
    asserts.homeCrumb &&
    asserts.search &&
    asserts.allTypes &&
    asserts.comboW >= 155 &&
    asserts.comboW <= 165 &&
    asserts.toggle &&
    asserts.emptyState;
  const path = `${OUT}/194-files-desktop.png`;
  await page.screenshot({ path, fullPage: false });
  results.desktop = { ok, asserts, nonBlank: nonBlank(path), path };
  await ctx.close();
}

// Frame 2: the fixture-populated sectioned grid at 1440 (EG2's contract)
// — the fixtures ride the EG idiom (stamped, raw-API) and are DELETED in
// the finally (zero residue in the persistent custom.db).
{
  const { ctx, page } = await session(browser, { width: 1440, height: 900 });
  const stamp = `s194er${Date.now().toString(36)}`;
  const folderName = `${stamp}-folder`;
  const pngName = `${stamp}-probe.png`;
  const EG_PNG_B64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAFklEQVR4nGP8z8DwnwEPYMInOXwUVAX///8GQQCU2QO4AAAAAElFTkSuQmCC";
  let folderId = null;
  let fileId = null;
  try {
    const folder = await page.evaluate(
      async ({ name }) => {
        const res = await fetch("/api/files/folders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ name }),
        });
        return { status: res.status, row: await res.json() };
      },
      { name: folderName },
    );
    folderId = folder.row?.id || null;
    const png = await page.evaluate(
      async ({ name, mime, b64 }) => {
        const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
        const form = new FormData();
        form.append("file", new File([bytes], name, { type: mime }));
        const res = await fetch("/api/files", { method: "POST", body: form, credentials: "same-origin" });
        return { status: res.status, row: await res.json() };
      },
      { name: pngName, mime: "image/png", b64: EG_PNG_B64 },
    );
    fileId = png.row?.id || null;
    await page.goto(`${CLONE}/Files`, { timeout: 45_000 });
    await page.waitForTimeout(2200);
    // DOM-assert the family's contracts before the shot (EG2).
    const asserts = await page.evaluate(
      ({ folderProbeName, fileProbeName }) => {
        const labels = [...document.querySelectorAll("main p")]
          .map((p) => (p.textContent || "").trim())
          .filter((t) => t === "Folders" || t === "Files");
        const folderCard = [...document.querySelectorAll("main button, main div")].find((el) =>
          (el.textContent || "").includes(folderProbeName),
        );
        const fileCard = [...document.querySelectorAll("main button, main div")].find((el) =>
          (el.textContent || "").includes(fileProbeName),
        );
        const menus = [...document.querySelectorAll('main button[aria-haspopup="menu"]')];
        const grids = [...document.querySelectorAll("main [class*='grid-cols']")];
        // EG2's own contract form: the measured 2/4/6 ladder rides the
        // responsive variants (lg:grid-cols-6 at 1440) — containment, the
        // pin's own assertion shape.
        const sixCol = grids.some(
          (g) => String(g.className).includes("lg:grid-cols-6") && g.children.length > 0,
        );
        return {
          bothLabels: labels.includes("Folders") && labels.includes("Files"),
          folderCard: !!folderCard,
          fileCard: !!fileCard,
          ellipsisMenus: menus.length >= 2,
          sixCol,
        };
      },
      { folderProbeName: folderName, fileProbeName: pngName },
    );
    const ok =
      asserts.bothLabels &&
      asserts.folderCard &&
      asserts.fileCard &&
      asserts.ellipsisMenus &&
      asserts.sixCol;
    const path = `${OUT}/194-files-sectioned.png`;
    await page.screenshot({ path, fullPage: false });
    results.sectioned = { ok, asserts, nonBlank: nonBlank(path), path };
  } finally {
    // the leave-no-residue discipline (the persistent custom.db)
    const cleanup = [];
    if (fileId) {
      cleanup.push(
        page.evaluate(
          async (id) => {
            const res = await fetch(`/api/files/${id}`, { method: "DELETE", credentials: "same-origin" });
            return res.status;
          },
          fileId,
        ),
      );
    }
    if (folderId) {
      cleanup.push(
        page.evaluate(
          async (id) => {
            const res = await fetch(`/api/files/folders/${id}`, { method: "DELETE", credentials: "same-origin" });
            return res.status;
          },
          folderId,
        ),
      );
    }
    const codes = await Promise.all(cleanup);
    results.sectioned = results.sectioned || {};
    results.sectioned.cleanup = codes;
    await ctx.close();
  }
}

await browser.close();
console.log(JSON.stringify(results, null, 2));
const allOk =
  results.desktop.ok &&
  results.desktop.nonBlank &&
  results.sectioned.ok &&
  results.sectioned.nonBlank;
console.log(allOk ? "S194 EVIDENCE: ALL FRAMES GREEN" : "S194 EVIDENCE: A FRAME FAILED");
process.exitCode = allOk ? 0 : 1;
