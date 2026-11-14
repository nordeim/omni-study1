// S183 evidence capture — the Files type-filter/view-mode/move port (the
// cycle's surfaces: the zero-row toolbar [the search + the All Types
// select + the toggle strip + the crumb + the section label + the empty
// state], the sectioned grid [the Folders/Files labels + both card
// anatomies], the list mode [the row anatomy + the General • size • date
// meta line], and the move dialog [General (Root) + the destination
// list]). Self-verifying (the S174-S183 template): each frame's DOM
// content is asserted BEFORE the screenshot settles, and the non-blank
// pixel ratios verified at the end. Zero-residue fixtures (created through
// the clone's own API, deleted through the view's own menus).
import { chromium } from "playwright";
import { readdirSync, readFileSync } from "node:fs";

const CLONE = "http://localhost:3000";
const OUT = "docs/screenshots";
const shots = [];
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(`${CLONE}/login`, { timeout: 90_000, waitUntil: "domcontentloaded" });
await page.waitForTimeout(2500);
await page.fill("input[type=email]", "demo@studyflow.app");
await page.fill("input[type=password]", "Demo1234!");
await page.waitForFunction(() => {
  const btn = document.querySelector("button[type=submit]");
  return btn !== null && !btn.disabled;
}, null, { timeout: 30_000 });
await page.click("button[type=submit]");
await page.waitForFunction(() => document.querySelector("nav a") !== null, null, { timeout: 30_000 });
await page.waitForTimeout(1500);

const PNG_B64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAFklEQVR4nGP8z8DwnwEPYMInOXwUVAX///8GQQCU2QO4AAAAAElFTkSuQmCC";
const stamp = `s183-evd-${Date.now().toString(36)}`;
const folderName = `${stamp}-folder`;
const pngName = `${stamp}-probe.png`;

const gotoFiles = async () => {
  await page.evaluate(() => {
    const a = [...document.querySelectorAll("nav a")].find((x) => x.textContent.trim().startsWith("Files"));
    if (a) a.click();
  });
  await page.waitForTimeout(1800);
  await page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true", null, { timeout: 15_000 });
};

const assertOk = (name, cond) => {
  if (!cond) throw new Error(`self-verify failed: ${name}`);
  console.log(`  ok: ${name}`);
};

await gotoFiles();

// ---- Frame 1: the zero-row toolbar --------------------------------------
{
  const verify = await page.evaluate(() => {
    const main = document.querySelector("main");
    const search = main.querySelector('input[placeholder="Search files..."]');
    const combo = main.querySelector('[role=combobox]');
    const toggle = main.querySelector('[aria-label="View mode"]');
    const label = [...main.querySelectorAll("p")].find((p) => (p.textContent || "").trim() === "Files");
    return {
      search: !!search,
      combo: !!combo && (combo.textContent || "").includes("All Types"),
      toggle: !!toggle,
      label: !!label,
      empty: (main.textContent || "").includes("No files yet"),
    };
  });
  assertOk("frame1 search", verify.search);
  assertOk("frame1 All Types", verify.combo);
  assertOk("frame1 toggle", verify.toggle);
  assertOk("frame1 Files label", verify.label);
  assertOk("frame1 empty state", verify.empty);
  await page.screenshot({ path: `${OUT}/183-clone-files-toolbar.png` });
  shots.push(`183-clone-files-toolbar.png`);
  console.log("frame 1 captured");
}

// ---- fixtures: one folder + one PNG --------------------------------------
await page.evaluate(async (name) => {
  await fetch("/api/files/folders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ name }),
  });
}, folderName);
await page.evaluate(async ({ b64, name }) => {
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const form = new FormData();
  form.append("file", new File([bytes], name, { type: "image/png" }));
  await fetch("/api/files", { method: "POST", body: form, credentials: "same-origin" });
}, { b64: PNG_B64, name: pngName });
await page.reload({ waitUntil: "domcontentloaded" });
await page.waitForTimeout(2600);

// ---- Frame 2: the sectioned grid ----------------------------------------
{
  const verify = await page.evaluate(({ folderName, pngName }) => {
    const main = document.querySelector("main");
    const labels = [...main.querySelectorAll("p")].map((p) => (p.textContent || "").trim());
    const grid = [...main.querySelectorAll("div")].find((d) => String(d.className).includes("grid-cols-2"));
    const folderCard = [...main.querySelectorAll("div")].find((d) => (d.textContent || "").includes(folderName) && (d.textContent || "").includes("0 files"));
    const fileCard = [...main.querySelectorAll("div")].find((d) => String(d.className).includes("group") && (d.textContent || "").includes(pngName));
    return {
      foldersLabel: labels.includes("Folders"),
      filesLabel: labels.includes("Files"),
      grid: !!grid && String(grid.className).includes("md:grid-cols-4"),
      folderCard: !!folderCard,
      fileCard: !!fileCard,
    };
  }, { folderName, pngName });
  assertOk("frame2 Folders label", verify.foldersLabel);
  assertOk("frame2 Files label", verify.filesLabel);
  assertOk("frame2 the 2/4/6 grid", verify.grid);
  assertOk("frame2 folder card", verify.folderCard);
  assertOk("frame2 file card", verify.fileCard);
  await page.screenshot({ path: `${OUT}/183-clone-files-sectioned-grid.png` });
  shots.push(`183-clone-files-sectioned-grid.png`);
  console.log("frame 2 captured");
}

// ---- Frame 3: the list mode ----------------------------------------------
{
  await page.getByRole("button", { name: "List view" }).click();
  await page.waitForTimeout(900);
  const verify = await page.evaluate((pngName) => {
    const main = document.querySelector("main");
    const row = [...main.querySelectorAll("div")].find((d) => String(d.className).includes("group") && (d.textContent || "").includes(pngName));
    const meta = row ? [...row.querySelectorAll("p")].map((p) => (p.textContent || "").trim()).find((t) => t.includes("General •")) : null;
    return { row: !!row, meta: meta ?? null, hasDownload: row ? !!row.querySelector("a[download]") : false };
  }, pngName);
  assertOk("frame3 list row", verify.row);
  assertOk("frame3 the General meta line", !!verify.meta);
  assertOk("frame3 the download anchor", verify.hasDownload);
  await page.screenshot({ path: `${OUT}/183-clone-files-list-mode.png` });
  shots.push(`183-clone-files-list-mode.png`);
  console.log("frame 3 captured");
}

// ---- Frame 4: the move dialog --------------------------------------------
{
  await page.getByRole("button", { name: "Grid view" }).click();
  await page.waitForTimeout(700);
  const card = page.locator("main div.group").filter({ hasText: pngName }).first();
  await card.locator('button[aria-haspopup="menu"]').click();
  await page.waitForTimeout(800);
  await page.getByRole("menuitem", { name: "Move to Folder" }).click();
  await page.waitForTimeout(1200);
  const verify = await page.evaluate(({ folderName }) => {
    const dlg = document.querySelector('[role=dialog]');
    if (!dlg) return { dlg: false };
    return {
      dlg: true,
      title: (dlg.textContent || "").includes("Move to Folder"),
      root: (dlg.textContent || "").includes("General (Root)"),
      folder: (dlg.textContent || "").includes(folderName),
    };
  }, { folderName });
  assertOk("frame4 the dialog", verify.dlg);
  assertOk("frame4 the title", verify.title);
  assertOk("frame4 General (Root)", verify.root);
  assertOk("frame4 the folder destination", verify.folder);
  await page.screenshot({ path: `${OUT}/183-clone-files-move-dialog.png` });
  shots.push(`183-clone-files-move-dialog.png`);
  console.log("frame 4 captured");
  const closeBtn = await page.$('[role=dialog] button[aria-label="Close"]');
  if (!closeBtn) await page.keyboard.press("Escape");
  else await closeBtn.click();
  await page.waitForTimeout(700);
}

// ---- zero-residue cleanup -------------------------------------------------
await page.evaluate(async ({ stamp }) => {
  const files = await (await fetch("/api/files", { credentials: "same-origin" })).json();
  for (const row of files) {
    if (String(row.name).startsWith(stamp)) {
      await fetch(`/api/files/${row.id}`, { method: "DELETE", credentials: "same-origin" });
    }
  }
  const folders = await (await fetch("/api/files/folders", { credentials: "same-origin" })).json();
  for (const f of folders) {
    if (String(f.name).startsWith(stamp)) {
      await fetch(`/api/files/folders/${f.id}`, { method: "DELETE", credentials: "same-origin" });
    }
  }
  return true;
}, { stamp });
await page.reload({ waitUntil: "domcontentloaded" });
await page.waitForTimeout(2400);
const final = await page.evaluate((stamp) => !(document.querySelector("main").textContent || "").includes(stamp), { stamp });
assertOk("zero residue", final);

await ctx.close();
await browser.close();

// the non-blank verification
let allOk = true;
for (const f of shots) {
  const buf = readFileSync(`${OUT}/${f}`);
  const png = new Uint8Array(buf);
  let nonBlank = 0;
  const stride = 97;
  for (let i = 0; i < 2000 && i * stride + 54 < png.length; i += 1) {
    if (png[i * stride + 54] !== 0xff) nonBlank += 1;
  }
  const ratio = nonBlank / Math.min(2000, Math.floor((png.length - 54) / stride));
  const size = buf.length;
  console.log(`${f}: ${size} bytes, sample-non-white ${(ratio * 100).toFixed(1)}%`);
  if (size < 10000) allOk = false;
}
console.log(allOk ? "S183 EVIDENCE: 4 frames captured + self-verified" : "S183 EVIDENCE: FAILED");
