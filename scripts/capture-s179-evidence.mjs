// S179 evidence capture — the notes family's feature ports (the cycle's
// surfaces: the pinned+sectioned list, the palette popover + the picked
// tint, the coding draft, the coding-note view + badge, the closing
// mobile drawer frame). Self-verifying (the S174-S178 template): each
// frame's DOM content is asserted BEFORE the screenshot settles.
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

// Navigate to Notes.
await page.evaluate(() => { const a = [...document.querySelectorAll("nav a")].find((x) => x.textContent.trim().startsWith("Notes")); if (a) a.click(); });
await page.waitForTimeout(1600);

// The menu-unmount wait (the S179/EB3 lesson): a Radix menu's exit
// animation lingers mounted after the item click — typing before the
// unmount can re-activate the item and re-fire its handler. Wait for the
// menu to be GONE before any draft interaction.
async function menuGone() {
  await page.waitForFunction(() => document.querySelector('[role="menuitem"]') === null, null, { timeout: 10_000 });
  await page.waitForTimeout(150);
}

// Create a probe note through the REAL draft flow (the EA1 path).
async function createProbeNote(title, viaCoding) {
  await page.getByRole("button", { name: "New note menu" }).click();
  await page.getByRole("menuitem", { name: viaCoding ? "New Coding Note" : "New Note", exact: true }).click();
  await menuGone();
  const pane = page.locator('[aria-label="Note editor pane"]');
  await pane.locator('input[placeholder="Note title..."]').fill(title);
  await pane.getByRole("button", { name: "Save", exact: true }).click();
  // The saved note opens selected in VIEW mode (the measured post-Save
  // state) — poll for the disabled title carrying the new name.
  await page.waitForFunction(
    (t) => {
      const right = document.querySelector('[aria-label="Note editor pane"]');
      const title2 = right ? right.querySelector('input[placeholder="Note title..."]') : null;
      return title2 !== null && title2.disabled && title2.value === t;
    },
    title,
    { timeout: 15_000 },
  );
  await page.waitForTimeout(600);
}

// 1) The pinned + sectioned list (EC1's surface).
await createProbeNote("EC1 Pin Probe A", false);
await createProbeNote("EC1 Pin Probe B", false);
// Select A through the list row, then pin it via the view toolbar.
await page.getByRole("button", { name: /EC1 Pin Probe A/ }).first().click();
await page.waitForTimeout(700);
await page.locator('[aria-label="Note editor pane"]').getByRole("button", { name: "Pin note" }).click();
// The PATCH + refetch renders the sectioned list — poll for the section.
await page
  .locator('[aria-label="Notes list pane"]')
  .getByText("Pinned", { exact: true })
  .waitFor({ state: "visible", timeout: 15_000 });
await page.waitForTimeout(500);
const pinnedVerify = await page.evaluate(() => {
  const list = document.querySelector('[aria-label="Notes list pane"]');
  const headers = list ? [...list.querySelectorAll("p")].filter((p) => p.textContent.trim() === "Pinned" || p.textContent.trim() === "All Notes").map((p) => p.textContent.trim()) : [];
  const rowA = list ? [...list.querySelectorAll("button")].find((b) => b.textContent.includes("EC1 Pin Probe A")) : null;
  const rowB = list ? [...list.querySelectorAll("button")].find((b) => b.textContent.includes("EC1 Pin Probe B")) : null;
  const pinBtn = document.querySelector('[aria-label="Note editor pane"] button[aria-label="Unpin note"]');
  // The pinned row's violet-filled pin svg rides the row's right side.
  const rowPinSvg = rowA ? rowA.querySelector("svg.fill-violet-500") : null;
  return {
    headers,
    aInPinnedSection: !!(rowA && rowA.closest("div.space-y-2") && headers[0] === "Pinned"),
    bInAllNotes: !!(rowB && rowB.closest("div.space-y-2") && headers.includes("All Notes")),
    toolbarPinFilled: pinBtn ? pinBtn.className.includes("fill-violet-50") : false,
    rowPinIcon: rowPinSvg !== null,
  };
});
console.log("pinned verify:", JSON.stringify(pinnedVerify));
if (
  JSON.stringify(pinnedVerify.headers) !== JSON.stringify(["Pinned", "All Notes"]) ||
  !pinnedVerify.aInPinnedSection ||
  !pinnedVerify.bInAllNotes ||
  !pinnedVerify.toolbarPinFilled ||
  !pinnedVerify.rowPinIcon
) {
  throw new Error("the pinned/sectioned list's EC1 markers failed the self-verification: " + JSON.stringify(pinnedVerify));
}
await page.screenshot({ path: "docs/screenshots/179-clone-notes-pinned-sectioned.png" });
shots.push("179-clone-notes-pinned-sectioned.png");

// 2) The palette popover open on A (EC2's surface — the popover portals to
// the body level, the EC2 e2e lesson).
await page.locator('[aria-label="Note editor pane"]').getByRole("button", { name: "Note color" }).click();
await page.locator('[aria-label="Note colors"]').waitFor({ state: "visible", timeout: 10_000 });
await page.waitForTimeout(600);
const popoverVerify = await page.evaluate(() => {
  const group = document.querySelector('[aria-label="Note colors"]');
  const swatches = group ? [...group.querySelectorAll("button")] : [];
  const selected = swatches.find((b) => b.className.includes("border-violet-500"));
  return {
    swatchCount: swatches.length,
    swatchLabels: swatches.map((b) => b.getAttribute("aria-label")),
    selectedLabel: selected ? selected.getAttribute("aria-label") : null,
    selectedScale: selected ? selected.className.includes("scale-110") : false,
    yellowHex: swatches.find((b) => b.getAttribute("aria-label") === "yellow note color")?.style.backgroundColor ?? null,
  };
});
console.log("popover verify:", JSON.stringify(popoverVerify));
if (
  popoverVerify.swatchCount !== 7 ||
  popoverVerify.selectedLabel !== "white note color" ||
  !popoverVerify.selectedScale ||
  popoverVerify.yellowHex !== "rgb(254, 243, 199)"
) {
  throw new Error("the palette popover's EC2 markers failed the self-verification: " + JSON.stringify(popoverVerify));
}
await page.screenshot({ path: "docs/screenshots/179-clone-notes-palette-popover.png" });
shots.push("179-clone-notes-palette-popover.png");
// Pick yellow — the row AND the body card carry the inline tint (the
// reference's popover STAYS OPEN after a pick — the measured behavior).
await page.getByRole("button", { name: "yellow note color" }).click();
await page.waitForTimeout(900);
const tintVerify = await page.evaluate(() => {
  const list = document.querySelector('[aria-label="Notes list pane"]');
  const rowA = list ? [...list.querySelectorAll("button")].find((b) => b.textContent.includes("EC1 Pin Probe A")) : null;
  const card = document.querySelector('[aria-label="Note editor pane"] .note-content');
  return {
    rowBg: rowA ? getComputedStyle(rowA).backgroundColor : null,
    cardBg: card ? getComputedStyle(card).backgroundColor : null,
    popoverStillOpen: document.querySelector('[aria-label="Note colors"]') !== null,
  };
});
console.log("tint verify:", JSON.stringify(tintVerify));
if (tintVerify.rowBg !== "rgb(254, 243, 199)" || tintVerify.cardBg !== "rgb(254, 243, 199)") {
  throw new Error("the yellow tint's EC2 markers failed the self-verification: " + JSON.stringify(tintVerify));
}
await page.keyboard.press("Escape");
await page.waitForTimeout(400);

// 3) The coding draft (EC3's surface — the B-7 entry).
await page.getByRole("button", { name: "New note menu" }).click();
await page.getByRole("menuitem", { name: "New Coding Note", exact: true }).click();
await menuGone();
await page.waitForTimeout(500);
const draftVerify = await page.evaluate(() => {
  const right = document.querySelector('[aria-label="Note editor pane"]');
  const langTrigger = right ? right.querySelector('[aria-label="New coding note language"]') : null;
  return {
    langSelect: langTrigger !== null,
    langDefault: langTrigger ? langTrigger.textContent.trim() : null,
    textarea: right ? right.querySelector('textarea[aria-label="Code note body"]') !== null : false,
    noQuill: right ? !right.querySelector(".ql-editor") : true,
    noFontRow: right ? !right.textContent.includes("Font:") : true,
    paletteInDraft: right ? !!right.querySelector('button[aria-label="New note color"]') : false,
  };
});
console.log("draft verify:", JSON.stringify(draftVerify));
if (!draftVerify.langSelect || draftVerify.langDefault !== "JavaScript" || !draftVerify.textarea || !draftVerify.noQuill || !draftVerify.noFontRow || !draftVerify.paletteInDraft) {
  throw new Error("the coding draft's EC3 markers failed the self-verification: " + JSON.stringify(draftVerify));
}
await page.locator('[aria-label="Note editor pane"]').locator('input[placeholder="Note title..."]').fill("EC3 Coding Probe");
await page.locator('textarea[aria-label="Code note body"]').fill("const parity = 'measured';\nconsole.log(parity);");
await page.waitForTimeout(400);
await page.screenshot({ path: "docs/screenshots/179-clone-notes-coding-draft.png" });
shots.push("179-clone-notes-coding-draft.png");
await page.locator('[aria-label="Note editor pane"]').getByRole("button", { name: "Save", exact: true }).click();
await page.waitForFunction(
  () => {
    const right = document.querySelector('[aria-label="Note editor pane"]');
    const title = right ? right.querySelector('input[placeholder="Note title..."]') : null;
    return title !== null && title.disabled && title.value === "EC3 Coding Probe";
  },
  null,
  { timeout: 15_000 },
);
await page.waitForTimeout(600);

// 4) The coding-note VIEW (the badge + the pre body + the row's code-icon
// lead — EC3's saved surface).
const codingViewVerify = await page.evaluate(() => {
  const right = document.querySelector('[aria-label="Note editor pane"]');
  const badge = right ? [...right.querySelectorAll("div")].find((d) => d.className.includes("inline-flex") && d.textContent.trim() === "JavaScript") : null;
  const pre = right ? right.querySelector("pre.font-mono") : null;
  const list = document.querySelector('[aria-label="Notes list pane"]');
  const row = list ? [...list.querySelectorAll("button")].find((b) => b.textContent.includes("EC3 Coding Probe")) : null;
  return {
    badge: badge !== null,
    badgeLeadsTitle: !!(badge && right.querySelector("input[placeholder=\"Note title...\"]") && badge.compareDocumentPosition(right.querySelector("input[placeholder=\"Note title...\"]")) & Node.DOCUMENT_POSITION_FOLLOWING),
    preBody: pre !== null,
    preText: pre ? pre.textContent.includes("const parity = 'measured';") : false,
    rowCodeLead: row ? row.querySelector("svg.lucide-code") !== null : false,
  };
});
console.log("coding view verify:", JSON.stringify(codingViewVerify));
if (!codingViewVerify.badge || !codingViewVerify.badgeLeadsTitle || !codingViewVerify.preBody || !codingViewVerify.preText || !codingViewVerify.rowCodeLead) {
  throw new Error("the coding view's EC3 markers failed the self-verification: " + JSON.stringify(codingViewVerify));
}
await page.screenshot({ path: "docs/screenshots/179-clone-notes-coding-view.png" });
shots.push("179-clone-notes-coding-view.png");

// 5) The closing mobile drawer frame (the standing chrome evidence).
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(800);
await page.getByRole("button", { name: "Open navigation menu" }).click();
await page.waitForTimeout(900);
await page.screenshot({ path: "docs/screenshots/179-clone-mobile-drawer.png" });
shots.push("179-clone-mobile-drawer.png");
await page.keyboard.press("Escape");
await page.setViewportSize({ width: 1440, height: 900 });
await page.waitForTimeout(800);

// Cleanup — zero residue on the demo db too (the trash deletes DIRECTLY,
// the measured no-confirm; each probe row leaves through the real door).
for (const title of ["EC1 Pin Probe A", "EC1 Pin Probe B", "EC3 Coding Probe"]) {
  await page.getByRole("button", { name: new RegExp(title) }).first().click();
  await page.waitForTimeout(600);
  await page.locator('[aria-label="Note editor pane"]').getByRole("button", { name: "Delete note" }).click();
  await page.waitForFunction(
    (t) => {
      const list = document.querySelector('[aria-label="Notes list pane"]');
      return list !== null && ![...list.querySelectorAll("button")].some((b) => b.textContent.includes(t));
    },
    title,
    { timeout: 15_000 },
  );
  await page.waitForTimeout(400);
}
const residue = await page.evaluate(() => {
  const list = document.querySelector('[aria-label="Notes list pane"]');
  return {
    probeRows: list ? [...list.querySelectorAll("button")].filter((b) => b.textContent.includes("EC1 Pin Probe") || b.textContent.includes("EC3 Coding Probe")).length : -1,
    seedNotesBack: list ? ["Dot product intuition", "Integration techniques"].every((t) => list.textContent.includes(t)) : false,
  };
});
console.log("residue verify:", JSON.stringify(residue));
if (residue.probeRows !== 0 || !residue.seedNotesBack) {
  throw new Error("the probe cleanup left residue: " + JSON.stringify(residue));
}

console.log("captured:", shots.join(", "));
await ctx.close();
await browser.close();
