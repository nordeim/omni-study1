// S137 (Batch CL) evidence capture — the import-symmetry + cap-sizing +
// cards-bound + honest-copy set. Three frames on the REMEDIATED tree:
//   1. the standing desktop dashboard (1440x900)
//   2. the standing mobile drawer (390x844)
//   3. the cycle's own surface — the folder-delete AlertDialog with the
//      CL5 honest SetNull copy ("Files and subfolders inside are kept and
//      move to All Files"), self-verifying on the corrected text before
//      the frame (the pre-fix copy said "the enclosing folder" — the
//      mispredicted destructive outcome). The probe folder is deleted by
//      the same dialog (self-cleaning).
// Usage: node scripts/capture-s137-evidence.mjs
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const CLONE = "http://localhost:3000";
const OUT = "docs/screenshots";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

// The demo sign-in (the drawer-check precedent — a fresh context carries no
// session, and /api/auth/me 401s straight to /login before hydration).
async function authedPage(viewport) {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  await page.goto(`${CLONE}/login`);
  await page.fill("input[type=email]", "demo@studyflow.app");
  await page.fill("input[type=password]", "Demo1234!");
  await page.click("button[type=submit]");
  await page.waitForFunction(() => document.querySelector("main") !== null, null, { timeout: 30_000 });
  await page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true", null, { timeout: 30_000 });
  return page;
}

// ---- 1. the desktop dashboard -------------------------------------------
let page = await authedPage({ width: 1440, height: 900 });
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/137-clone-desktop-dashboard.png` });
console.log("captured 137-clone-desktop-dashboard.png");
await page.close();

// ---- 2. the mobile drawer ------------------------------------------------
page = await authedPage({ width: 390, height: 844 });
await page.getByRole("button", { name: "Open navigation menu" }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/137-clone-mobile-drawer.png` });
console.log("captured 137-clone-mobile-drawer.png");
await page.close();

// ---- 3. the CL5 folder-delete honest-copy dialog --------------------------
{
  const page3 = await authedPage({ width: 1280, height: 900 });
  try {
    await page3.goto(`${CLONE}/Files`);
    await page3.waitForFunction(() => document.documentElement.dataset.appHydrated === "true", null, { timeout: 30_000 });
    // Create the probe folder through the REAL dialog (the reference's own
    // New Folder flow).
    await page3.getByRole("button", { name: "New Folder" }).click();
    await page3.getByLabel("Name").fill("S137 Evidence Probe");
    await page3.getByRole("button", { name: "Create Folder" }).click();
    await page3.waitForTimeout(600);
    // Open the delete dialog on the probe folder's row button.
    await page3.getByRole("button", { name: "Delete S137 Evidence Probe" }).click();
    // The SELF-VERIFYING wait: the frame only captures once the AlertDialog
    // carries the CORRECTED copy — the CL5 evidence (the pre-fix copy read
    // "Files inside are kept and move to the enclosing folder", mispredicting
    // the schema's SetNull outcome).
    await page3.waitForFunction(() => {
      const dlg = document.querySelector('[role="alertdialog"]');
      return !!dlg && /move to All Files/.test(dlg.textContent || "");
    }, null, { timeout: 15_000 });
    await page3.waitForTimeout(300);
    await page3.screenshot({ path: `${OUT}/137-clone-folder-delete-dialog.png` });
    console.log("captured 137-clone-folder-delete-dialog.png");
    // Confirm the delete — the probe folder self-cleans (empty folder, the
    // SetNull path has nothing to move).
    await page3.getByRole("button", { name: "Delete" }).click();
    await page3.waitForTimeout(600);
    const gone = await page3.getByRole("button", { name: "Delete S137 Evidence Probe" }).count();
    console.log(`probe folder removed after confirm: ${gone === 0}`);
  } finally {
    await page3.close();
  }
}

await browser.close();
console.log("S137 evidence capture complete.");
