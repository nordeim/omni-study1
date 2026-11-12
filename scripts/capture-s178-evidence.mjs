// S178 evidence capture — the remediated notes view/edit MODE-SPLIT surface
// (the cycle's ports: the VIEW mode + the EDIT toolbar reshaping). Self-
// verifying (the S174-S177 template): each frame's DOM content is asserted
// BEFORE the screenshot settles.
import { chromium } from "playwright";

const CLONE = "http://localhost:3000";
const shots = [];
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
// domcontentloaded + a generous timeout: a cold Turbopack boot can hold
// the load event past the default 30s while the chunks compile.
await page.goto(`${CLONE}/login`, { timeout: 90_000, waitUntil: "domcontentloaded" });
// Hydration settle FIRST (the s177 capture's own lesson, twice over): a
// fill that lands before hydrated React re-controls the inputs gets its
// values snapped back to "" on the hydration commit.
await page.waitForTimeout(2500);
await page.fill("input[type=email]", "demo@studyflow.app");
await page.fill("input[type=password]", "Demo1234!");
// The preflight doctrine (scripts/dev-server-preflight.mjs): the submit
// button only ENABLES once hydrated React has landed both input events.
await page.waitForFunction(
  () => {
    const btn = document.querySelector("button[type=submit]");
    return btn !== null && !btn.disabled;
  },
  null,
  { timeout: 30_000 },
);
// The double-fill guard: if the first pair pre-dated hydration, the second
// pair lands on the live controlled inputs.
await page.fill("input[type=email]", "demo@studyflow.app");
await page.fill("input[type=password]", "Demo1234!");
await page.click("button[type=submit]");
await page.waitForFunction(() => document.querySelector("main") !== null && document.querySelector("nav") !== null, null, { timeout: 30000 });
await page.waitForTimeout(1500);

// 1) The VIEW mode — the EB1 port's surface (a seeded note).
await page.evaluate(() => { const a = [...document.querySelectorAll("nav a")].find((x) => x.textContent.trim().startsWith("Notes")); if (a) a.click(); });
await page.waitForTimeout(1600);
await page.getByRole("button", { name: /Dot product intuition/ }).first().click();
await page.waitForTimeout(900);
// Self-verify the port's markers before the frame.
const viewMode = await page.evaluate(() => {
  const right = document.querySelector('[aria-label="Note editor pane"]');
  const title = right ? right.querySelector('input[placeholder="Note title..."]') : null;
  return {
    titleDisabled: title ? title.disabled : false,
    titleValue: title ? title.value : null,
    editBtn: right ? [...right.querySelectorAll("button")].some((b) => b.textContent.trim() === "Edit") : false,
    trashAria: right ? !!right.querySelector('[aria-label="Delete note"]') : false,
    prose: right ? right.querySelector(".note-content") !== null : false,
    proseText: right && right.querySelector(".note-content") ? (right.querySelector(".note-content").textContent || "").includes("dot product measures alignment") : false,
    noQuill: right ? !right.querySelector(".ql-editor") : true,
    noFontRow: right ? !right.textContent.includes("Font:") : true,
    noTagRow: right ? !right.querySelector('input[placeholder="Add tag..."]') : true,
  };
});
console.log("view verify:", JSON.stringify(viewMode));
if (!viewMode.titleDisabled || !viewMode.editBtn || !viewMode.trashAria || !viewMode.prose || !viewMode.proseText || !viewMode.noQuill || !viewMode.noFontRow || !viewMode.noTagRow) {
  throw new Error("the view mode's EB1 markers failed the self-verification");
}
await page.screenshot({ path: "docs/screenshots/178-clone-notes-view-mode.png" });
shots.push("178-clone-notes-view-mode.png");

// 2) The EDIT toolbar — the EB2 port's surface (the Edit switch).
await page.locator('[aria-label="Note editor pane"]').getByRole("button", { name: "Edit", exact: true }).click();
await page.locator(".ql-editor").waitFor({ state: "visible", timeout: 10000 });
await page.waitForTimeout(900);
const editMode = await page.evaluate(() => {
  const right = document.querySelector('[aria-label="Note editor pane"]');
  const title = right ? right.querySelector('input[placeholder="Note title..."]') : null;
  return {
    titleEnabled: title ? !title.disabled : false,
    mover: right ? !!right.querySelector('[aria-label="Move note to notebook"]') : false,
    saveBtn: right ? [...right.querySelectorAll("button")].some((b) => b.textContent.trim() === "Save") : false,
    xBtn: right ? !!right.querySelector('[aria-label="Exit edit mode"]') : false,
    quill: right ? !!right.querySelector(".ql-editor") : false,
    quillText: right && right.querySelector(".ql-editor") ? (right.querySelector(".ql-editor").textContent || "").includes("dot product measures alignment") : false,
    fontRow: right ? right.textContent.includes("Font:") : false,
    tagRow: right ? !!right.querySelector('input[placeholder="Add tag..."]') : false,
    noPopover: right ? !right.querySelector('[aria-label="Note actions"]') : true,
  };
});
console.log("edit verify:", JSON.stringify(editMode));
if (!editMode.titleEnabled || !editMode.mover || !editMode.saveBtn || !editMode.xBtn || !editMode.quill || !editMode.quillText || !editMode.fontRow || !editMode.tagRow || !editMode.noPopover) {
  throw new Error("the edit toolbar's EB2 markers failed the self-verification");
}
await page.screenshot({ path: "docs/screenshots/178-clone-notes-edit-mode.png" });
shots.push("178-clone-notes-edit-mode.png");

// 3) The X exit — the EB3 port's surface (the view returns, the typed
// fragment persists in the prose — the reference's measured observable).
await page.locator(".ql-editor").click();
await page.keyboard.type(" The mode-split probe body.");
await page.locator('[aria-label="Note editor pane"]').getByRole("button", { name: "Exit edit mode" }).click();
// The prose re-renders from the STORE (the autosave PATCH + the refetch
// + the re-render) — poll the fragment, never a fixed sleep.
await page
  .locator('[aria-label="Note editor pane"] .note-content')
  .getByText("mode-split probe body")
  .waitFor({ state: "visible", timeout: 10000 });
await page.waitForTimeout(400);
const afterX = await page.evaluate(() => {
  const right = document.querySelector('[aria-label="Note editor pane"]');
  const title = right ? right.querySelector('input[placeholder="Note title..."]') : null;
  return {
    titleDisabled: title ? title.disabled : false,
    viewBack: right ? [...right.querySelectorAll("button")].some((b) => b.textContent.trim() === "Edit") : false,
    proseHasFragment: right && right.querySelector(".note-content") ? (right.querySelector(".note-content").textContent || "").includes("mode-split probe body") : false,
    noQuill: right ? !right.querySelector(".ql-editor") : true,
  };
});
console.log("afterX verify:", JSON.stringify(afterX));
if (!afterX.titleDisabled || !afterX.viewBack || !afterX.proseHasFragment || !afterX.noQuill) {
  throw new Error("the X-exit's EB3 markers failed the self-verification");
}

// 4) The mobile view-mode posture at 390 — the two-pane squeeze class
// (the S78/AE6 record: the w-80 list + the squeezed right pane — the
// reference's own overflow family; the PRE-port always-editable editor
// measured 526 on this exact surface, the port's view mode measures
// NARROWER — the no-worse-than-pre-port bar, the honest record of the
// unpinned class).
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(800);
const mobile = await page.evaluate(() => {
  const right = document.querySelector('[aria-label="Note editor pane"]');
  const title = right ? right.querySelector('input[placeholder="Note title..."]') : null;
  return {
    scrollWidth: document.documentElement.scrollWidth,
    titleDisabled: title ? title.disabled : false,
    viewRow: right ? [...right.querySelectorAll("button")].some((b) => b.textContent.trim() === "Edit") : false,
    proseVisible: right ? right.querySelector(".note-content") !== null : false,
  };
});
console.log("mobile view verify:", JSON.stringify(mobile));
if (mobile.scrollWidth > 526 || !mobile.titleDisabled || !mobile.viewRow || !mobile.proseVisible) {
  throw new Error("the mobile view-mode posture regressed past the pre-port bar (scrollWidth " + mobile.scrollWidth + ")");
}
await page.screenshot({ path: "docs/screenshots/178-clone-notes-view-mobile.png" });
shots.push("178-clone-notes-view-mobile.png");

// The standing drawer frame (the closing chrome evidence).
await page.getByRole("button", { name: "Open navigation menu" }).click();
await page.waitForTimeout(900);
await page.screenshot({ path: "docs/screenshots/178-clone-mobile-drawer.png" });
shots.push("178-clone-mobile-drawer.png");

console.log("captured:", shots.join(", "));
await ctx.close();
await browser.close();
