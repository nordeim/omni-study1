// S180 evidence capture — the notes Attach-File wire feature (the cycle's
// surfaces: the draft attach row + the staged chip, the saved view's
// Attachments section + the pill, the edit surface's seeded chip row, the
// closing mobile drawer frame). Self-verifying (the S174-S179 template):
// each frame's DOM content is asserted BEFORE the screenshot settles.
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
// The preflight doctrine: the submit button only ENABLES once hydrated
// React has landed both input events.
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

// The menu-unmount wait (the S179/EB3 lesson).
async function menuGone() {
  await page.waitForFunction(() => document.querySelector('[role="menuitem"]') === null, null, { timeout: 10_000 });
  await page.waitForTimeout(150);
}

// 1) The draft attach row + the staged chip (ED1/ED2's surface) — the pick
// POSTs immediately; the chip renders with the derived download url; the
// B-8 Font-row strip rides above (the measured draft order: Font row →
// tag row → Attach row).
await page.getByRole("button", { name: "New note menu" }).click();
await page.getByRole("menuitem", { name: "New Note", exact: true }).click();
await menuGone();
const pane = page.locator('[aria-label="Note editor pane"]');
await page.locator('input[type="file"].hidden').setInputFiles({
  name: "s180-evidence.txt",
  mimeType: "text/plain",
  buffer: Buffer.from("the S180 evidence attachment payload\n", "utf8"),
});
// The staged upload 201s and the chip renders (the derived url).
await pane.getByRole("link", { name: "s180-evidence.txt" }).waitFor({ state: "visible", timeout: 15_000 });
const draftVerify = await page.evaluate(() => {
  const right = document.querySelector('[aria-label="Note editor pane"]');
  const affordance = right ? [...right.querySelectorAll("span")].find((s) => s.textContent.trim() === "Attach File") : null;
  const chip = right ? [...right.querySelectorAll("a")].find((a) => a.textContent.includes("s180-evidence.txt")) : null;
  const fontStrip = right ? [...right.querySelectorAll("div")].find((d) => String(d.className).includes("bg-slate-50") && d.textContent.trim().startsWith("Font:")) : null;
  const fileInput = right ? right.querySelector('input[type="file"].hidden') : null;
  return {
    affordance: affordance !== null,
    affordanceOutline: affordance ? String(affordance.className).includes("border-input") : false,
    chipHref: chip ? chip.getAttribute("href") : null,
    chipUnderline: chip ? chip.className.includes("hover:underline") : false,
    fontStrip: fontStrip !== null,
    stripClasses: fontStrip ? String(fontStrip.className) : null,
    singleFile: fileInput ? !fileInput.multiple : false,
    removeBtn: right ? !!right.querySelector('button[aria-label="Remove attachment s180-evidence.txt"]') : false,
  };
});
console.log("draft verify:", JSON.stringify(draftVerify));
if (
  !draftVerify.affordance ||
  !draftVerify.affordanceOutline ||
  !draftVerify.chipHref ||
  !draftVerify.chipHref.includes("/api/notes/attachments/") ||
  !draftVerify.chipUnderline ||
  !draftVerify.fontStrip ||
  !draftVerify.stripClasses.includes("rounded-lg") ||
  !draftVerify.singleFile ||
  !draftVerify.removeBtn
) {
  throw new Error("the draft attach row's ED1/ED2 markers failed the self-verification: " + JSON.stringify(draftVerify));
}
await pane.locator('input[placeholder="Note title..."]').fill("S180 Evidence Probe");
await page.waitForTimeout(400);
await page.screenshot({ path: "docs/screenshots/180-clone-notes-attach-draft.png" });
shots.push("180-clone-notes-attach-draft.png");

// 2) The saved note's VIEW mode — the Attachments section below the body
// (ED3's surface: the border-t strip + the heading + the bg-slate-100
// paperclip pill) + the download route serves the bytes.
await pane.getByRole("button", { name: "Save", exact: true }).click();
await page.waitForFunction(
  () => {
    const right = document.querySelector('[aria-label="Note editor pane"]');
    const title = right ? right.querySelector('input[placeholder="Note title..."]') : null;
    const section = right ? [...right.querySelectorAll("p")].find((p) => p.textContent.trim() === "Attachments") : null;
    return title !== null && title.disabled && title.value === "S180 Evidence Probe" && section !== null;
  },
  null,
  { timeout: 15_000 },
);
await page.waitForTimeout(600);
const viewVerify = await page.evaluate(() => {
  const right = document.querySelector('[aria-label="Note editor pane"]');
  const heading = right ? [...right.querySelectorAll("p")].find((p) => p.textContent.trim() === "Attachments") : null;
  const section = heading ? heading.parentElement : null;
  const pill = section ? section.querySelector("a") : null;
  return {
    sectionClasses: section ? section.className : null,
    headingClasses: heading ? heading.className : null,
    pillClasses: pill ? pill.className : null,
    pillHref: pill ? pill.getAttribute("href") : null,
    pillIcon: pill ? (pill.querySelector("svg")?.getAttribute("class") ?? null) : null,
  };
});
console.log("view verify:", JSON.stringify(viewVerify));
if (
  !viewVerify.sectionClasses ||
  !viewVerify.sectionClasses.includes("mt-6 pt-4 border-t border-slate-200") ||
  !viewVerify.headingClasses.includes("text-sm font-medium text-slate-500 mb-2") ||
  !viewVerify.pillClasses.includes("bg-slate-100") ||
  !viewVerify.pillHref.includes("/api/notes/attachments/") ||
  !viewVerify.pillIcon.includes("lucide-paperclip")
) {
  throw new Error("the view section's ED3 markers failed the self-verification: " + JSON.stringify(viewVerify));
}
// The download route serves the staged-then-bound bytes.
const dl = await page.request.get(`${CLONE}${viewVerify.pillHref}`);
if (dl.status() !== 200 || !(await dl.text()).includes("S180 evidence attachment payload")) {
  throw new Error(`the download route answered ${dl.status()} — the ED3 download leg failed`);
}
await page.screenshot({ path: "docs/screenshots/180-clone-notes-attach-view.png" });
shots.push("180-clone-notes-attach-view.png");

// 3) The EDIT surface — the chip seeds from the note (ED4's surface) + the
// B-8 Font-row strip on the edit toolbar.
await pane.getByRole("button", { name: "Edit", exact: true }).click();
await pane.getByRole("link", { name: "s180-evidence.txt" }).waitFor({ state: "visible", timeout: 10_000 });
const editVerify = await page.evaluate(() => {
  const right = document.querySelector('[aria-label="Note editor pane"]');
  const chip = right ? [...right.querySelectorAll("a")].find((a) => a.textContent.includes("s180-evidence.txt")) : null;
  const fontStrip = right ? [...right.querySelectorAll("div")].find((d) => String(d.className).includes("bg-slate-50") && d.textContent.trim().startsWith("Font:")) : null;
  const divider = right ? [...right.querySelectorAll("button")].find((b) => b.textContent.trim() === "Divider") : null;
  return {
    chip: chip !== null,
    chipBadge: chip ? chip.parentElement.className.includes("rounded-md border px-2.5 py-0.5 text-xs font-semibold") : false,
    fontStrip: fontStrip !== null,
    dividerOutline: divider ? String(divider.className).includes("border-input") : false,
  };
});
console.log("edit verify:", JSON.stringify(editVerify));
if (!editVerify.chip || !editVerify.chipBadge || !editVerify.fontStrip || !editVerify.dividerOutline) {
  throw new Error("the edit surface's ED4/B-8 markers failed the self-verification: " + JSON.stringify(editVerify));
}
await page.waitForTimeout(400);
await page.screenshot({ path: "docs/screenshots/180-clone-notes-attach-edit.png" });
shots.push("180-clone-notes-attach-edit.png");

// Exit edit (the local-only X) + zero-residue cleanup through the
// view-mode trash (the demo db restores to its 4 seed notes).
await pane.getByRole("button", { name: "Exit edit mode" }).click();
await page.waitForTimeout(700);
await pane.getByRole("button", { name: "Delete note" }).click();
// POLL the zero-residue state (the run-2 lesson: a single snapshot races
// the DELETE's refetch — the trash lands, the list re-render lags).
await page.waitForFunction(
  () => ![...document.querySelectorAll("button")].some((b) => b.textContent.includes("S180 Evidence Probe")),
  null,
  { timeout: 15_000 },
);
await page.waitForTimeout(300);

// 4) The closing mobile drawer frame (the standing companion — the S179
// template: resize the ALREADY-hydrated page, no fresh mobile login).
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(800);
await page.getByRole("button", { name: "Open navigation menu" }).click();
await page.waitForTimeout(900);
const drawerVerify = await page.evaluate(() => {
  // The drawer-check-s14 probe's own scoping (the dialog root + the
  // visibility gate — a document-wide w-72 search matches the closed
  // drawer's hidden wrapper).
  const visible = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && cs.display !== "none" && cs.visibility !== "hidden"; };
  const dialog = document.querySelector('[role="dialog"][aria-label*="avigation"], [role="dialog"]');
  const root = dialog && visible(dialog) ? dialog : document.body;
  const panel = [...root.querySelectorAll("div")].find((el) => String(el.className || "").includes("w-72") && visible(el)) || null;
  const links = panel ? [...panel.querySelectorAll("a")] : [];
  return {
    panel: panel !== null,
    links: links.length,
    firstLink: links[0] ? links[0].textContent.trim().slice(0, 20) : null,
  };
});
console.log("drawer verify:", JSON.stringify(drawerVerify));
if (!drawerVerify.panel || drawerVerify.links !== 20) {
  throw new Error("the mobile drawer's markers failed the self-verification: " + JSON.stringify(drawerVerify));
}
await page.screenshot({ path: "docs/screenshots/180-clone-mobile-drawer.png" });
shots.push("180-clone-mobile-drawer.png");
await page.keyboard.press("Escape");
await page.setViewportSize({ width: 1440, height: 900 });
await page.waitForTimeout(800);

console.log("ALL FRAMES CAPTURED:", JSON.stringify(shots));
await ctx.close();
await browser.close();
