// S140 (Batch CO) evidence capture — the note-HTML sanitize + authed-scrypt
// containment + checkbox-cn + FE-hardening set. Four frames on the
// REMEDIATED tree:
//   1. the standing desktop dashboard (1440x900) — carries the CO3 cn()
//      checkbox fix (a completed task row in Today's Tasks renders the
//      accent fill as the author intended, not the emission-order winner).
//   2. the standing mobile drawer (390x844) — the 55th consecutive drawer
//      check ran this cycle (no Tailwind v4 mobile-nav bug).
//   3. the cycle's own surface — the Notes view with the LEGACY hostile
//      note open (the CO1 render gate: the planted pre-fix row — a remote
//      tracking pixel + iframe + handler bait — renders sanitized: benign
//      text visible, zero remote assets live). The fixture must already be
//      planted in the DEV db:
//        DATABASE_URL="file:../db/custom.db" bun scripts/e2e-plant-legacy-note.ts
//   4. the Timetable "My Classes" surface (CO4c) — the silent 9-card cap
//      removed; the demo seed's classes render complete.
// Usage: node scripts/capture-s140-evidence.mjs
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
const page = await authedPage({ width: 1440, height: 900 });
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/140-clone-desktop-dashboard.png` });
console.log("captured 140-clone-desktop-dashboard.png");

// ---- 2. the mobile drawer ------------------------------------------------
const mobile = await authedPage({ width: 390, height: 844 });
await mobile.waitForTimeout(500);
await mobile.getByRole("button", { name: "Open navigation menu" }).click();
await mobile.waitForTimeout(600);
await mobile.screenshot({ path: `${OUT}/140-clone-mobile-drawer.png` });
console.log("captured 140-clone-mobile-drawer.png");

// ---- 3. the legacy hostile note (CO1's render gate) ----------------------
await mobile.keyboard.press("Escape");
await mobile.waitForTimeout(400);
await mobile.goto(`${CLONE}/Notes`);
await mobile.waitForTimeout(1200);
const hostileRow = mobile
  .locator('[aria-label="Notes list pane"]')
  .getByRole("button", { name: /A-L3 legacy hostile note/ });
if ((await hostileRow.count()) > 0) {
  await hostileRow.first().click();
  await mobile.waitForTimeout(1200);
  await mobile.screenshot({ path: `${OUT}/140-clone-notes-render-gate.png` });
  console.log("captured 140-clone-notes-render-gate.png");
} else {
  console.log(
    "legacy hostile note not present in the dev db — plant with: DATABASE_URL='file:../db/custom.db' bun scripts/e2e-plant-legacy-note.ts",
  );
}

// ---- 4. the Timetable My Classes surface (CO4c) ---------------------------
await page.goto(`${CLONE}/Timetable`);
await page.waitForTimeout(1000);
await page.screenshot({ path: `${OUT}/140-clone-timetable-my-classes.png` });
console.log("captured 140-clone-timetable-my-classes.png");

await browser.close();
console.log("S140 evidence capture complete");
