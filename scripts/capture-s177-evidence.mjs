// S177 evidence capture — the remediated notes create-flow surface (the
// cycle's ports: the inline DRAFT editor + the empty-state placement).
// Self-verifying (the S174/S175/S176 template): each frame's DOM content
// is asserted BEFORE the screenshot settles.
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
// values snapped back to "" on the hydration commit — the browser then
// POSTs empty fields and the client validation answers "email: Invalid
// email address" while the DOM .value reads filled (the trap that broke
// the first two capture attempts on the freshly-recompiled login chunk).
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
// The double-fill guard: if the first pair pre-dated hydration (warm
// chunk recompiled), the second pair lands on the live controlled inputs.
await page.fill("input[type=email]", "demo@studyflow.app");
await page.fill("input[type=password]", "Demo1234!");
await page.click("button[type=submit]");
await page.waitForFunction(() => document.querySelector("main") !== null && document.querySelector("nav") !== null, null, { timeout: 30000 });
await page.waitForTimeout(1500);

// 1) The inline DRAFT — the EA1 port's surface.
await page.evaluate(() => { const a = [...document.querySelectorAll("nav a")].find((x) => x.textContent.trim().startsWith("Notes")); if (a) a.click(); });
await page.waitForTimeout(1600);
await page.getByRole("button", { name: "New note menu" }).click();
await page.getByRole("menuitem", { name: "New Note", exact: true }).click();
const draftTitle = page.locator('input[placeholder="Note title..."]');
await draftTitle.waitFor({ state: "visible", timeout: 10000 });
// Self-verify the port's markers before the frame.
const draft = await page.evaluate(() => {
  const right = document.querySelector('[aria-label="Note editor pane"]');
  return {
    noDialog: !document.querySelector('[role="dialog"]'),
    titlePh: right.querySelector('input[placeholder="Note title..."]') !== null,
    tagPh: [...right.querySelectorAll("input")].some((i) => i.getAttribute("placeholder") === "Add tag..."),
    editor: !!right.querySelector(".ql-editor.ql-blank"),
    notebookSelect: !!right.querySelector('[aria-label="New note notebook"]'),
    discardBtn: !!right.querySelector('[aria-label="Discard new note"]'),
    saveBtn: [...right.querySelectorAll("button")].some((b) => b.textContent.trim() === "Save"),
    fontRow: right.textContent.includes("Font:"),
    divider: [...right.querySelectorAll("button")].some((b) => b.textContent.trim() === "Divider"),
  };
});
console.log("draft verify:", JSON.stringify(draft));
if (!draft.noDialog || !draft.titlePh || !draft.tagPh || !draft.editor || !draft.notebookSelect || !draft.discardBtn || !draft.saveBtn || !draft.fontRow || !draft.divider) {
  throw new Error("the draft's EA1 markers failed the self-verification");
}
await draftTitle.fill("Integration techniques — session notes");
await page.locator(".ql-editor").click();
await page.keyboard.type("The substitution patterns for trigonometric integrals.");
await page.waitForTimeout(600);
await page.screenshot({ path: "docs/screenshots/177-clone-notes-draft.png" });
shots.push("177-clone-notes-draft.png");

// 2) The Save round trip — the row lands, the editor continues.
const saved = page.waitForResponse((r) => r.request().method() === "POST" && r.url().includes("/api/notes"));
await page.getByRole("button", { name: "Save", exact: true }).click();
await saved;
await page.waitForTimeout(1500);
const after = await page.evaluate(() => {
  const left = document.querySelector('[aria-label="Notes list pane"]');
  const rows = [...left.querySelectorAll("button")].filter((b) => b.querySelector("h2"));
  const right = document.querySelector('[aria-label="Note editor pane"]');
  return {
    rowCount: rows.length,
    probeRow: rows.some((r) => r.textContent.includes("Integration techniques — session notes")),
    editorContinues: !!right.querySelector(".ql-editor"),
    draftGone: !right.querySelector('input[placeholder="Note title..."]') || right.querySelector('input[placeholder="Note title..."]') === null,
  };
});
console.log("saved verify:", JSON.stringify(after));
if (!after.probeRow || !after.editorContinues) {
  throw new Error("the Save round-trip markers failed the self-verification");
}
await page.screenshot({ path: "docs/screenshots/177-clone-notes-saved.png" });
shots.push("177-clone-notes-saved.png");

// Zero-residue cleanup through the UI (the standing doctrine).
await page.getByRole("button", { name: "Note actions" }).click();
await page.getByRole("button", { name: "Delete note" }).click();
await page.waitForTimeout(1500);

// 3) The empty-state placement — the EA3 port's surface (routed empty GET).
await page.route(/\/api\/notes$/, async (route) => {
  if (route.request().method() === "GET") {
    await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
  } else {
    await route.continue();
  }
});
await page.reload({ waitUntil: "domcontentloaded" });
await page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true", null, { timeout: 30000 });
await page.waitForTimeout(1200);
const empty = await page.evaluate(() => {
  const left = document.querySelector('[aria-label="Notes list pane"]');
  const right = document.querySelector('[aria-label="Note editor pane"]');
  return {
    leftEmpty: left.textContent.includes("No notes yet") && left.textContent.includes("Create your first note"),
    leftCta: [...left.querySelectorAll("button")].some((b) => b.textContent.trim() === "New Note"),
    rightNoSelect: right.textContent.includes("Select a note") && right.textContent.includes("Choose a note from the sidebar or create a new one"),
    rightBare: !right.querySelector(".sf-card"),
  };
});
console.log("empty verify:", JSON.stringify(empty));
if (!empty.leftEmpty || !empty.leftCta || !empty.rightNoSelect || !empty.rightBare) {
  throw new Error("the empty-state placement's EA3 markers failed the self-verification");
}
await page.screenshot({ path: "docs/screenshots/177-clone-notes-empty-state.png" });
shots.push("177-clone-notes-empty-state.png");
await page.unroute(/\/api\/notes$/);

// 4) The mobile drawer frame (the standing chrome evidence) + the
// no-overflow no-selection posture at 390 (the EA3b guard).
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(600);
const noSel = await page.evaluate(() => {
  const right = document.querySelector('[aria-label="Note editor pane"]');
  return {
    scrollWidth: document.documentElement.scrollWidth,
    compactFallback: right.textContent.includes("Select a note from the list."),
  };
});
console.log("mobile noSel verify:", JSON.stringify(noSel));
if (noSel.scrollWidth > 390 || !noSel.compactFallback) {
  throw new Error("the mobile no-selection posture failed (scrollWidth " + noSel.scrollWidth + ")");
}
await page.getByRole("button", { name: "Open navigation menu" }).click();
await page.waitForTimeout(900);
await page.screenshot({ path: "docs/screenshots/177-clone-mobile-drawer.png" });
shots.push("177-clone-mobile-drawer.png");

console.log("captured:", shots.join(", "));
await ctx.close();
await browser.close();
