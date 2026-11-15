import { expect, test, type Page } from "@playwright/test";

/**
 * Files-family parity pins — the consolidated files home (S194/ER).
 *
 * Split out of parity-session7.spec.ts (the S193 close's named
 * next-size candidate, executed in the census-clean window the standing
 * audit confirmed — the fourth consecutive clean window): the
 * Files-pure describe moved here BYTE-FAITHFULLY — 1 describe / 7 pins,
 * the S183/EG measured family (the toolbar search/All-Types/toggle, the
 * sectioned 2/4/6 grid, the type-filter + search semantics, the
 * in-folder navigation + move dialog, the list-mode row anatomy, the
 * View dialog, the non-image + link tiles). The non-files families stay
 * in parity-session7; the Files strays outside it (the EH1 forced-zero
 * EmptyState pin + the EJ6 header-stacking pin in parity-session7, the
 * a11y-sweep /Files leg, the dark-mode Files washes, the drawer-sweep
 * Files legs, the resilience upload edge cases, the s14 /api/files
 * hardening pins) stay in their coverage-axis homes (the S189/S191/S193
 * boundary precedent — see docs/remediation-plan-session194.md).
 *
 * The pins' contracts (unchanged by the move):
 *  - EG1 rides the SEED's empty Files (the S4-C convention — the one
 *    view the seed leaves empty); EG2–EG7 create their own stamped
 *    fixtures (egStamp, unique per run) and leave them behind (the
 *    AN1-cleanup exception: the uploads ride the 20/15-min POST
 *    budget) — order-independent within the family, the residue
 *    audited in the plan §4.
 *  - CHUNK 2 home (scripts/e2e-chunked-cert.sh) — the SAME chunk as
 *    the split source, so the POST/register budgets hold by
 *    construction; the file sorts 2nd in the chunk's alphabetical
 *    order (a11y-sweep < files < flashcards) — strictly FEWER
 *    predecessors than the split source's 5th position (the two
 *    residue directions analyzed in the plan §4).
 *  - The full family map: docs/remediation-plan-session194.md.
 */


const hydrated = (page: Page) =>
  page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true");


// ---------------------------------------------------------------------------
// S183/EG — the Files type-filter / view-mode / move-port family (the S183
// axis, measured live 2026-11-14 — docs/probe-evidence/s183/). SEVEN
// consolidated pins at ELEVEN upload-budget units: the demo user's
// files+folders+link POST budget is 20 per 15 min and the whole chunk
// (this block + the chunk's existing consumers — the ED attach pins, the
// s14 upload/link pins) shares ONE in-memory window per fresh server. The
// first design's 17 units 429'd the chunk's own s14 pins mid-run (the
// s183 lesson); 11 + the existing ~8 fit under 20 with margin.
//
// The fixture shapes (the raw-API idiom, the ED/C3 precedent): a REAL
// decodable 8×8 PNG (naturalWidth 8 — the S183 fixture lesson: signature-
// only bytes decode to naturalWidth 0), a .txt (the measured "Other"
// class), a minimal .pdf, and folders via the JSON POST (the UI path is
// what the pins exercise; the fixtures are setup, not subject).
// ---------------------------------------------------------------------------


test.describe("S183/EG · the Files toolbar + sections + cards + the filter/search/move ports", () => {
  // A real 8×8 grayscale PNG — decodable by <img> (naturalWidth 8).
  const EG_PNG_B64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAFklEQVR4nGP8z8DwnwEPYMInOXwUVAX///8GQQCU2QO4AAAAAElFTkSuQmCC";

  const egStamp = () => `s183eg${Date.now().toString(36)}`;

  const egPost = (page: Page, path: string, body: unknown) =>
    page.evaluate(
      async ({ path, body }) => {
        const res = await fetch(path, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify(body),
        });
        return { status: res.status, row: (await res.json()) as { id?: string } };
      },
      { path, body },
    );

  const egUpload = (page: Page, name: string, mime: string, b64: string) =>
    page.evaluate(
      async ({ name, mime, b64 }) => {
        const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
        const form = new FormData();
        form.append("file", new File([bytes], name, { type: mime }));
        const res = await fetch("/api/files", { method: "POST", body: form, credentials: "same-origin" });
        return { status: res.status, row: (await res.json()) as { id?: string } };
      },
      { name, mime, b64 },
    );

  const egTextUpload = (page: Page, name: string, mime: string, text: string) =>
    page.evaluate(
      async ({ name, mime, text }) => {
        const form = new FormData();
        form.append("file", new File([text], name, { type: mime }));
        const res = await fetch("/api/files", { method: "POST", body: form, credentials: "same-origin" });
        return { status: res.status, row: (await res.json()) as { id?: string } };
      },
      { name, mime, text },
    );

  const gotoFiles = async (page: Page) => {
    await page.goto("/Files");
    await hydrated(page);
  };

  test("EG1: the zero-row toolbar — the search, the All Types select, the toggle, the section label, the empty state", async ({ page }) => {
    await gotoFiles(page);
    // The breadcrumb home: the reference's crumb contract (slate-800 at
    // root + the violet HOVER accent — the active-accent drift closes).
    const home = page.getByRole("button", { name: "All Files" });
    await expect(home).toBeVisible();
    const homeCls = await home.evaluate((el) => String(el.className));
    expect(homeCls).toContain("hover:text-violet-600");
    expect(homeCls).toContain("text-slate-800");
    expect(homeCls).toContain("font-medium");

    // The toolbar row: the search wrap + the icon + the pl-10 input.
    const search = page.locator('input[placeholder="Search files..."]');
    await expect(search).toBeVisible();
    const wrapCls = await search.evaluate((el) => String(el.parentElement?.className));
    expect(wrapCls).toContain("relative");
    expect(wrapCls).toContain("flex-1");
    const iconCls = await search.evaluate((el) => {
      const sib = el.parentElement?.querySelector("svg");
      return sib ? String(sib.getAttribute("class")) : null;
    });
    expect(iconCls).toContain("lucide-search");
    expect(iconCls).toContain("left-3");
    const searchCls = await search.evaluate((el) => String(el.className));
    expect(searchCls).toContain("pl-10");

    // The All Types select: the shadcn trigger at the measured w-40 (160px).
    const combo = page.locator('[role=combobox]');
    await expect(combo).toBeVisible();
    await expect(combo).toHaveText(/All Types/);
    const comboW = await combo.evaluate((el) => Math.round(el.getBoundingClientRect().width));
    expect(comboW).toBeGreaterThanOrEqual(155);
    expect(comboW).toBeLessThanOrEqual(165);

    // The five options (opened — the reference's verbatim labels).
    await combo.click();
    await expect(page.getByRole("option", { name: "All Types", exact: true })).toBeVisible();
    await expect(page.getByRole("option", { name: "Images", exact: true })).toBeVisible();
    await expect(page.getByRole("option", { name: "PDFs", exact: true })).toBeVisible();
    await expect(page.getByRole("option", { name: "Documents", exact: true })).toBeVisible();
    await expect(page.getByRole("option", { name: "Other", exact: true })).toBeVisible();
    await page.keyboard.press("Escape");

    // The view toggle: the reference's bordered strip, h-9 w-9 pair, the
    // slate-100 active face (the sf-primary-soft active closes out). The
    // aria-labels are the clone's a11y superset (the S5-K/S9-G pins).
    const toggle = page.getByRole("group", { name: "View mode" });
    await expect(toggle).toBeVisible();
    const stripCls = await toggle.evaluate((el) => String(el.className));
    expect(stripCls).toContain("rounded-lg");
    expect(stripCls).toContain("overflow-hidden");
    const gridBtn = page.getByRole("button", { name: "Grid view" });
    const activeCls = await gridBtn.evaluate((el) => String(el.className));
    expect(activeCls).toContain("bg-slate-100");
    const btnBox = await gridBtn.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height) };
    });
    expect(btnBox.w).toBe(36);
    expect(btnBox.h).toBe(36);

    // The Files section label: the measured p.text-xs uppercase mb-3 (a
    // <p>, NEVER a heading — the resilience heading pins ride on that).
    const label = page.locator("main p", { hasText: /^Files$/ }).first();
    await expect(label).toBeVisible();
    const labelCls = await label.evaluate((el) => String(el.className));
    expect(labelCls).toContain("text-xs");
    expect(labelCls).toContain("uppercase");
    expect(labelCls).toContain("mb-3");

    // The empty state lives INSIDE the Files section (measured).
    await expect(page.getByText("No files yet", { exact: true })).toBeVisible();
  });

  test("EG2: the sectioned grid — the labels, the 2/4/6 grid, both cards, the two ellipsis menus", async ({ page }) => {
    await gotoFiles(page);
    const stamp = egStamp();
    const folderName = `${stamp}-folder`;
    const pngName = `${stamp}-probe.png`;
    const folder = await egPost(page, "/api/files/folders", { name: folderName });
    expect(folder.status).toBe(201);
    const png = await egUpload(page, pngName, "image/png", EG_PNG_B64);
    expect(png.status).toBe(201);
    await page.reload();
    await hydrated(page);

    // The Folders label joins the Files label (both p.text-xs uppercase).
    const foldersLabel = page.locator("main p", { hasText: /^Folders$/ }).first();
    await expect(foldersLabel).toBeVisible();
    await expect(page.locator("main p", { hasText: /^Files$/ }).first()).toBeVisible();

    // The grids: the measured 2/4/6 columns at gap-3 (the 2/3-at-gap-4
    // drift closes).
    const gridCls = await foldersLabel.evaluate((el) => String(el.nextElementSibling?.className));
    expect(gridCls).toContain("grid-cols-2");
    expect(gridCls).toContain("md:grid-cols-4");
    expect(gridCls).toContain("lg:grid-cols-6");
    expect(gridCls).toContain("gap-3");

    // The folder card: the accent tile + the name + the NEVER-singularized
    // count (the reference renders "0 files" — measured, twice).
    const folderCard = page.locator("main div.group").filter({ hasText: folderName }).first();
    await expect(folderCard.getByText("0 files", { exact: true })).toBeVisible();
    const tileCls = await folderCard.evaluate((el) => {
      const tile = el.querySelector("span[class*=sf-primary-soft], [class*=bg-violet]");
      return tile ? String(tile.className) : null;
    });
    expect(tileCls).toContain("sf-primary-soft");

    // The folder menu: Delete + the clone's Rename superset (the item texts
    // carry the icon's whitespace — trim before the exact match).
    await folderCard.locator('button[aria-haspopup="menu"]').click();
    const menuItems = (await page.locator("[role=menuitem]").allTextContents()).map((t) => t.trim());
    expect(menuItems).toContain("Delete");
    expect(menuItems).toContain("Rename");
    await page.keyboard.press("Escape");
    // The menu-GONE wait (the ED idiom): the page-scoped item query below
    // sees BOTH menus if the first's close races under chunk load — the
    // S183 cert finding (the chunk context is slower than the isolated
    // run; Escape + 500ms lost the race and the file items read the
    // folder menu's items too).
    await page.waitForFunction(() => !document.querySelector('[role="menuitem"]'), null, { timeout: 10_000 });
    await page.waitForTimeout(150);

    // The file card: the ellipsis row + the aspect-square image tile
    // (the inline preview src) + the name + the size.
    const fileCard = page.locator("main div.group").filter({ hasText: pngName }).first();
    await expect(fileCard).toBeVisible();
    const tile = fileCard.locator(".aspect-square").first();
    const tileInfo = await tile.evaluate((el) => {
      const img = el.querySelector("img");
      return { cls: String(el.className), imgSrc: img?.getAttribute("src") ?? null };
    });
    expect(tileInfo.cls).toContain("cursor-pointer");
    expect(tileInfo.imgSrc).toMatch(/\/api\/files\/.+\?inline=1/);
    await expect(fileCard.getByText("81 B", { exact: true })).toBeVisible();

    // The file menu: the reference's measured four items.
    await fileCard.locator('button[aria-haspopup="menu"]').click();
    const fileItems = (await page.locator("[role=menuitem]").allTextContents()).map((t) => t.trim());
    expect(fileItems).toEqual(["View", "Download", "Move to Folder", "Delete"]);
    await page.keyboard.press("Escape");
    await page.waitForFunction(() => !document.querySelector('[role="menuitem"]'), null, { timeout: 10_000 });
    await page.waitForTimeout(150);
  });

  test("EG3: the type filter + the search — the measured semantics (the .txt is Other, folders immune, no-match empties)", async ({ page }) => {
    await gotoFiles(page);
    const stamp = egStamp();
    const pngName = `${stamp}-alpha.png`;
    const txtName = `${stamp}-beta.txt`;
    expect((await egUpload(page, pngName, "image/png", EG_PNG_B64)).status).toBe(201);
    expect((await egTextUpload(page, txtName, "text/plain", "s183 eg3 probe")).status).toBe(201);
    await page.reload();
    await hydrated(page);

    // Images → the PNG, never the TXT.
    await page.locator('[role=combobox]').click();
    await page.getByRole("option", { name: "Images", exact: true }).click();
    await expect(page.getByText(pngName, { exact: true })).toBeVisible();
    await expect(page.getByText(txtName, { exact: true })).toHaveCount(0);

    // Other → the TXT (the naive text/*→Documents guess is WRONG — measured).
    await page.locator('[role=combobox]').click();
    await page.getByRole("option", { name: "Other", exact: true }).click();
    await expect(page.getByText(txtName, { exact: true })).toBeVisible();
    await expect(page.getByText(pngName, { exact: true })).toHaveCount(0);

    // Documents → neither (the office set only).
    await page.locator('[role=combobox]').click();
    await page.getByRole("option", { name: "Documents", exact: true }).click();
    await expect(page.getByText(pngName, { exact: true })).toHaveCount(0);
    await expect(page.getByText(txtName, { exact: true })).toHaveCount(0);

    // Back to All Types → both (the state is local, every filter pass).
    await page.locator('[role=combobox]').click();
    await page.getByRole("option", { name: "All Types", exact: true }).click();
    await expect(page.getByText(pngName, { exact: true })).toBeVisible();
    await expect(page.getByText(txtName, { exact: true })).toBeVisible();

    // The search: a name substring narrows to the PNG.
    await page.locator('input[placeholder="Search files..."]').fill(`${stamp}-alpha`);
    await expect(page.getByText(pngName, { exact: true })).toBeVisible();
    await expect(page.getByText(txtName, { exact: true })).toHaveCount(0);

    // A no-match search renders the empty state INSIDE the Files section.
    await page.locator('input[placeholder="Search files..."]').fill(`${stamp}-zzz-no-match`);
    await expect(page.getByText("No files yet", { exact: true })).toBeVisible();

    // Filter state resets on reload (local state, measured).
    await page.reload();
    await hydrated(page);
    await expect(page.getByText(pngName, { exact: true })).toBeVisible();
    await expect(page.getByText(txtName, { exact: true })).toBeVisible();
  });

  test("EG4: the in-folder navigation + the move — the crumb pair, the separator, the folders' immunity, the click-moves dialog", async ({ page }) => {
    await gotoFiles(page);
    const stamp = egStamp();
    const parentName = `${stamp}-parent`;
    const subName = `${stamp}-sub`;
    const pngName = `${stamp}-file.png`;
    const parent = await egPost(page, "/api/files/folders", { name: parentName });
    expect(parent.status).toBe(201);
    const sub = await egPost(page, "/api/files/folders", { name: subName, parentId: parent.row?.id });
    expect(sub.status).toBe(201);
    expect((await egUpload(page, pngName, "image/png", EG_PNG_B64)).status).toBe(201);
    await page.reload();
    await hydrated(page);

    // Navigate INTO the parent (the whole card opens — the reference's own
    // card anatomy, the clone's valid-HTML form).
    await page.getByRole("button", { name: `Open folder ${parentName}` }).click();
    await expect(page.getByRole("button", { name: `Open folder ${subName}` })).toBeVisible();

    // The crumb pair: the home goes slate-500 (inactive) + the chevron
    // separator + the folder crumb carries slate-800 font-medium.
    const home = page.getByRole("button", { name: "All Files" });
    const homeCls = await home.evaluate((el) => String(el.className));
    expect(homeCls).toContain("text-slate-500");
    const crumb = page.getByRole("button", { name: parentName, exact: true }).first();
    const crumbCls = await crumb.evaluate((el) => String(el.className));
    expect(crumbCls).toContain("text-slate-800");
    expect(crumbCls).toContain("font-medium");
    const separator = await crumb.evaluate((el) => {
      const sib = el.previousElementSibling;
      return sib && sib.tagName.toLowerCase() === "svg" ? String(sib.getAttribute("class")) : null;
    });
    expect(separator).toContain("lucide-chevron-right");

    // The in-folder Folders section: the subfolder card renders inside.
    await expect(page.locator("main p", { hasText: /^Folders$/ }).first()).toBeVisible();

    // The folders' immunity: a no-match search keeps BOTH folder cards
    // visible while the Files section empties (measured).
    await page.locator('input[placeholder="Search files..."]').fill(`${stamp}-zzz-no-match`);
    await expect(page.getByRole("button", { name: `Open folder ${subName}` })).toBeVisible();
    await expect(page.getByText("No files yet", { exact: true })).toBeVisible();

    // Clear the search before the move — the query is COMPONENT state and
    // survives the in-app folder navigation (the view never remounts); the
    // row would stay hidden and the move's card menu unreachable.
    await page.locator('input[placeholder="Search files..."]').fill("");

    // Back to root, then the MOVE: the card menu → the dialog → the click.
    await page.getByRole("button", { name: "All Files" }).click();
    await expect(page.getByRole("button", { name: `Open folder ${parentName}` })).toBeVisible();
    const fileCard = page.locator("main div.group").filter({ hasText: pngName }).first();
    await fileCard.locator('button[aria-haspopup="menu"]').click();
    await page.getByRole("menuitem", { name: "Move to Folder" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText("Move to Folder", { exact: true })).toBeVisible();
    // The destination list: General (Root) first, every folder after.
    await expect(dialog.getByRole("button", { name: /General \(Root\)/ })).toBeVisible();
    await expect(dialog.getByRole("button", { name: parentName, exact: true })).toBeVisible();
    await expect(dialog.getByRole("button", { name: subName, exact: true })).toBeVisible();
    await dialog.getByRole("button", { name: parentName, exact: true }).click();

    // The click IS the move: the root view loses the row, the folder's
    // count reads "1 files" (never singularized).
    await expect(page.getByText(pngName, { exact: true })).toHaveCount(0);
    const parentCard = page.locator("main div.group").filter({ hasText: parentName }).first();
    await expect(parentCard.getByText("1 files", { exact: true })).toBeVisible();
  });

  test("EG5: the list mode — the row anatomy, the General-root meta line, the four hover controls", async ({ page }) => {
    await gotoFiles(page);
    const stamp = egStamp();
    const txtName = `${stamp}-row.txt`;
    expect((await egTextUpload(page, txtName, "text/plain", "s183 eg5 list row")).status).toBe(201);
    await page.reload();
    await hydrated(page);

    // The toggle branches NOW (the pre-fix viewMode state was a visual
    // no-op — the S183 head).
    await page.getByRole("button", { name: "List view" }).click();
    const row = page.locator("main div.group").filter({ hasText: txtName }).first();
    await expect(row).toBeVisible();
    const rowCls = await row.evaluate((el) => String(el.className));
    expect(rowCls).toContain("flex");
    expect(rowCls).toContain("items-center");
    expect(rowCls).toContain("gap-4");
    expect(rowCls).toContain("p-4");

    // The meta line: the measured folder • size • MMM d, yyyy (the root's
    // display name is "General" — the reference's own root pseudo-folder).
    const meta = await row.locator("p.text-xs").first().textContent();
    expect(meta).toMatch(/^General • \d+ B • [A-Z][a-z]{2} \d{1,2}, \d{4}$/);

    // The mime icon tile + the four hover controls: the eye button, the
    // download ANCHOR (role=link — the reference's own idiom), the move
    // button, the red trash.
    await expect(row.locator("svg.lucide-file, svg.lucide-image, svg.lucide-link2").first()).toBeVisible();
    await expect(row.getByRole("button", { name: `View ${txtName}` })).toBeVisible();
    await expect(row.getByRole("link", { name: `Download ${txtName}` })).toBeVisible();
    await expect(row.getByRole("button", { name: `Move ${txtName} to a folder` })).toBeVisible();
    const trash = row.getByRole("button", { name: `Delete ${txtName}` });
    await expect(trash).toBeVisible();
    const trashCls = await trash.evaluate((el) => String(el.className));
    expect(trashCls).toContain("text-red-500");

    // The grid toggle returns the card anatomy.
    await page.getByRole("button", { name: "Grid view" }).click();
    const cardAgain = page.locator("main div.group").filter({ hasText: txtName }).first();
    await expect(cardAgain.locator(".aspect-square").first()).toBeVisible();
  });

  test("EG6: the View dialog — the tile click, the inline img loads, the anchor controls, the Close", async ({ page }) => {
    await gotoFiles(page);
    const stamp = egStamp();
    const pngName = `${stamp}-view.png`;
    expect((await egUpload(page, pngName, "image/png", EG_PNG_B64)).status).toBe(201);
    await page.reload();
    await hydrated(page);

    const fileCard = page.locator("main div.group").filter({ hasText: pngName }).first();
    await fileCard.locator('button[aria-label^="Preview"]').click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(pngName, { exact: true })).toBeVisible();

    // The img serves INLINE (the ?inline=1 bytes — a real decodable PNG,
    // naturalWidth 8; the attachment disposition would 0 it).
    const imgInfo = await dialog.locator("img").first().evaluate((el) => ({
      src: el.getAttribute("src") ?? "",
      naturalW: (el as HTMLImageElement).naturalWidth,
    }));
    expect(imgInfo.src).toMatch(/\/api\/files\/.+\?inline=1/);
    expect(imgInfo.naturalW).toBe(8);

    // The measured controls: the two ANCHORS + the Close button.
    await expect(dialog.getByRole("link", { name: "Open in New Tab" })).toHaveAttribute(
      "href",
      /\/api\/files\/.+\?inline=1/,
    );
    await expect(dialog.getByRole("link", { name: "Download" })).toHaveAttribute("href", /\/api\/files\/[^?]+$/);
    await dialog.getByRole("button", { name: "Close" }).click();
    await expect(dialog).toHaveCount(0);
  });

  test("EG7: the non-image tile + the link file — the icon tile, the no-img dialog, the link anchor", async ({ page }) => {
    await gotoFiles(page);
    const stamp = egStamp();
    const pdfName = `${stamp}-doc.pdf`;
    const linkName = `${stamp}-link`;
    const pdfBytes = btoa(
      "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]>>endobj\ntrailer<</Size 4/Root 1 0 R>>\n%%EOF",
    );
    expect((await egUpload(page, pdfName, "application/pdf", pdfBytes)).status).toBe(201);
    expect((await egPost(page, "/api/files", { name: linkName, url: "https://example.com/s183" })).status).toBe(201);
    await page.reload();
    await hydrated(page);

    // The PDF's tile: the icon form (bg-slate-50 + the file-text icon,
    // no img — measured).
    const pdfCard = page.locator("main div.group").filter({ hasText: pdfName }).first();
    const pdfTile = pdfCard.locator(".aspect-square").first();
    expect(await pdfTile.locator("img").count()).toBe(0);
    const pdfTileCls = await pdfTile.evaluate((el) => String(el.className));
    expect(pdfTileCls).toContain("bg-slate-50");
    await expect(pdfTile.locator("svg.lucide-file-text").first()).toBeVisible();

    // The PDF's View dialog: no img, the controls present (measured).
    await pdfCard.locator('button[aria-haspopup="menu"]').click();
    await page.getByRole("menuitem", { name: "View", exact: true }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(pdfName, { exact: true })).toBeVisible();
    expect(await dialog.locator("img").count()).toBe(0);
    await expect(dialog.getByRole("link", { name: "Download" })).toBeVisible();
    await dialog.getByRole("button", { name: "Close" }).click();

    // The link file: the name renders as the anchor to the stored URL
    // (the clone's link superset), and classifies under no image tile.
    const linkCard = page.locator("main div.group").filter({ hasText: linkName }).first();
    await expect(linkCard.getByRole("link", { name: linkName })).toHaveAttribute(
      "href",
      "https://example.com/s183",
    );
    expect(await linkCard.locator(".aspect-square img").count()).toBe(0);
  });
});
