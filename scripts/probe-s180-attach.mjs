// S180 reference probe — the B-6 Attach File anatomy + the B-8 toolbar drift,
// RE-MEASURED live (the lost-work doctrine: every reference fact re-measured
// by a fresh probe after a sandbox recycle). One consolidated pass:
//   LEG A  the draft toolbar (Font row classes/select options/separator/
//          Divider classes + the Attach row anatomy)
//   LEG B  the upload WIRE (pick → the immediate POST → the file_url)
//   LEG C  the chip anatomy (draft)
//   LEG D  the Save POST payload (attachments ride the create)
//   LEG E  the view-mode Attachments section anatomy
//   LEG F  the edit-surface Attach row + chip + Font row
//   LEG G  the font select options
//   LEG H  the chip X-remove (network posture)
//   LEG I  the coding draft (Attach row, no Font row)
//   LEG J  cleanup — trash every probe note, verify ZERO residue
// Incremental saves: each leg's measurement lands in /tmp/s180-probe.json
// the moment it is taken (a crash never loses a measurement).
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const REF = "https://omni-study1.base44.app";
const OUT = "/tmp/s180-probe.json";
const store = {};
const save = () => writeFileSync(OUT, JSON.stringify(store, null, 2));
const log = (...a) => { console.log(...a); };

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

// ---- login (the S179 residue-check recipe) ----
await page.goto(`${REF}/login`, { timeout: 60_000, waitUntil: "domcontentloaded" });
await page.waitForTimeout(2500);
await page.fill("input[type=email]", process.env.REF_PROBE_EMAIL);
await page.fill("input[type=password]", process.env.REF_PROBE_PASSWORD);
await page.waitForFunction(
  () => {
    const btn = document.querySelector("button[type=submit]");
    return btn !== null && !btn.disabled;
  },
  null,
  { timeout: 30_000 },
);
await page.click("button[type=submit]");
await page.waitForFunction(() => document.querySelector("nav a") !== null, null, { timeout: 30_000 });
await page.waitForTimeout(1500);
await page.evaluate(() => {
  const a = [...document.querySelectorAll("nav a")].find((x) => x.textContent.trim().startsWith("Notes"));
  if (a) a.click();
});
await page.waitForTimeout(2500);
log("logged in, on Notes");

// ---- LEG A: open the text draft, measure the toolbar rows ----
await page.locator("button:has(svg.lucide-plus)").first().click();
await page.waitForTimeout(600);
await page.getByRole("menuitem", { name: "New Note", exact: true }).click();
await page.waitForFunction(() => !document.querySelector('[role="menuitem"]'), null, { timeout: 10_000 });
await page.waitForTimeout(800);
store.draftRows = await page.evaluate(() => {
  const pane = document.querySelector("main") ?? document.body;
  const rows = [...pane.querySelectorAll("div")].filter((d) => d.textContent.trim().startsWith("Font:"));
  const fontRow = rows[0];
  const attachLabel = [...pane.querySelectorAll("span,label,p")].find((el) => el.textContent.trim() === "Attach File");
  const attachRow = attachLabel ? attachLabel.closest("div") : null;
  const btn = attachRow?.querySelector("button");
  const input = attachRow?.querySelector("input[type=file]") ?? pane.querySelector("input[type=file]");
  return {
    fontRowClasses: fontRow?.className ?? null,
    fontSelectClasses: fontRow?.querySelector("button")?.className ?? null,
    fontSelectText: fontRow?.querySelector("button")?.textContent?.trim() ?? null,
    dividerClasses: [...(fontRow?.querySelectorAll("button") ?? [])].map((b) => b.className),
    dividerText: [...(fontRow?.querySelectorAll("button") ?? [])].map((b) => b.textContent.trim()),
    dividerIcon: [...(fontRow?.querySelectorAll("button svg") ?? [])].map((s) => s.getAttribute("class")),
    separator: [...(fontRow?.querySelectorAll(":scope > *") ?? [])].map((c) => c.className),
    attachRowClasses: attachRow?.className ?? null,
    attachLabelClasses: attachLabel?.className ?? null,
    attachBtnClasses: btn?.className ?? null,
    attachBtnText: btn?.textContent?.trim() ?? null,
    attachBtnIcon: btn?.querySelector("svg")?.getAttribute("class") ?? null,
    fileInputAttrs: input
      ? { multiple: input.multiple, accept: input.getAttribute("accept"), cls: input.className }
      : null,
  };
});
save();
log("LEG A draft rows:", JSON.stringify(store.draftRows, null, 1));

// ---- LEG B: the upload wire (pick → immediate POST) ----
const requests = [];
page.on("request", (r) => requests.push({ m: r.method(), u: r.url() }));
const responses = [];
page.on("response", async (r) => {
  if (r.url().includes("UploadFile") || r.url().includes("upload")) {
    try { responses.push({ u: r.url(), s: r.status(), b: (await r.text()).slice(0, 500) }); } catch {}
  }
});
writeFileSync("/tmp/s180-probe-file.txt", "s180 attach probe payload\n");
await page.setInputFiles("input[type=file]", "/tmp/s180-probe-file.txt");
await page.waitForTimeout(4000);
store.uploadWire = { requests: requests.slice(-8), responses };
save();
log("LEG B upload wire:", JSON.stringify(store.uploadWire, null, 1));

// ---- LEG C: the chip anatomy (draft) ----
store.chip = await page.evaluate(() => {
  const a = [...document.querySelectorAll("a")].find((x) => x.textContent.includes("s180-probe-file.txt"));
  const chip = a ? a.closest("span,div") : null;
  const row = chip ? chip.parentElement : null;
  const xBtn = chip?.querySelector("button");
  return {
    chipClasses: chip?.className ?? null,
    chipTag: chip?.tagName ?? null,
    chipHref: a?.getAttribute("href") ?? null,
    chipLinkClasses: a?.className ?? null,
    chipTarget: a?.getAttribute("target") ?? null,
    rowClasses: row?.className ?? null,
    xBtnClasses: xBtn?.className ?? null,
    xIcon: xBtn?.querySelector("svg")?.getAttribute("class") ?? null,
  };
});
save();
log("LEG C chip:", JSON.stringify(store.chip, null, 1));

// ---- LEG D: fill the title, Save, capture the create POST ----
const createPosts = [];
page.on("request", (r) => {
  if (r.method() === "POST" && r.url().match(/\/api\/v1\/entities\/note/) && !r.url().includes("notebook")) {
    createPosts.push({ u: r.url().slice(-80), b: r.postData()?.slice(0, 1200) });
  }
});
await page.fill("input[placeholder*='Title' i], input[placeholder*='title' i]", "S180 Attach Probe");
await page.waitForTimeout(300);
await page.getByRole("button", { name: "Save", exact: true }).first().click();
await page.waitForTimeout(3500);
store.createPost = createPosts;
save();
log("LEG D create POST:", JSON.stringify(store.createPost, null, 1));

// ---- LEG E: view mode — the Attachments section anatomy ----
store.viewSection = await page.evaluate(() => {
  const h = [...document.querySelectorAll("p,div,h2,h3,span")].find((el) => el.textContent.trim() === "Attachments");
  const section = h ? h.parentElement : null;
  const pills = section ? [...section.querySelectorAll("a")] : [];
  return {
    sectionClasses: section?.className ?? null,
    headingClasses: h?.className ?? null,
    headingTag: h?.tagName ?? null,
    pillClasses: pills[0]?.className ?? null,
    pillHref: pills[0]?.getAttribute("href") ?? null,
    pillTarget: pills[0]?.getAttribute("target") ?? null,
    pillText: pills[0]?.textContent.trim() ?? null,
    pillIcon: pills[0]?.querySelector("svg")?.getAttribute("class") ?? null,
    pillChildren: pills[0] ? [...pills[0].children].map((c) => c.className) : [],
  };
});
save();
log("LEG E view section:", JSON.stringify(store.viewSection, null, 1));

// ---- LEG F: the edit surface — Attach row + chip + Font row ----
await page.getByRole("button", { name: "Edit", exact: true }).click();
await page.waitForTimeout(1200);
store.editSurface = await page.evaluate(() => {
  const pane = document.querySelector("main") ?? document.body;
  const attachLabel = [...pane.querySelectorAll("span,label,p")].find((el) => el.textContent.trim() === "Attach File");
  const attachRow = attachLabel ? attachLabel.closest("div") : null;
  const chip = [...pane.querySelectorAll("a")].find((x) => x.textContent.includes("s180-probe-file.txt"));
  const fontRow = [...pane.querySelectorAll("div")].filter((d) => d.textContent.trim().startsWith("Font:"))[0];
  return {
    attachRowClasses: attachRow?.className ?? null,
    attachBtnClasses: attachRow?.querySelector("button")?.className ?? null,
    chipClasses: chip ? (chip.closest("span,div")?.className ?? null) : null,
    fontRowPresent: !!fontRow,
  };
});
save();
log("LEG F edit surface:", JSON.stringify(store.editSurface, null, 1));

// ---- LEG G: the font select options (open on the edit surface) ----
const fontTrigger = page.locator("button[aria-label='Font' i], div:has(> span:text-is('Font:')) button").first();
await fontTrigger.click();
await page.waitForTimeout(800);
store.fontOptions = await page.evaluate(() =>
  [...document.querySelectorAll('[role="option"]')].map((o) => o.textContent.trim()),
);
await page.keyboard.press("Escape");
await page.waitForTimeout(400);
save();
log("LEG G font options:", JSON.stringify(store.fontOptions));

// ---- LEG H: the chip X-remove (network posture) ----
const netBefore = requests.length;
const xBtn = page.locator("button:has(svg.lucide-x)", { hasText: "" }).filter({ has: page.locator("a") });
// the chip's X sits inside the chip row: locate via the anchor's parent
const chipRow = page.locator("div", { has: page.locator("a", { hasText: "s180-probe-file.txt" }) }).first();
await chipRow.locator("button").last().click();
await page.waitForTimeout(2500);
store.xRemove = { netDelta: requests.length - netBefore, lastRequests: requests.slice(-4) };
save();
log("LEG H x-remove net delta:", store.xRemove.netDelta);

// exit edit without saving the removal (X)
const xBtns = page.getByRole("button", { name: "X", exact: true });
await xBtns.first().click().catch(() => {});
await page.waitForTimeout(800);

// ---- LEG I: the coding draft (Attach row, no Font row) ----
await page.locator("button:has(svg.lucide-plus)").first().click();
await page.waitForTimeout(600);
await page.getByRole("menuitem", { name: /New Coding Note/i }).click();
await page.waitForFunction(() => !document.querySelector('[role="menuitem"]'), null, { timeout: 10_000 });
await page.waitForTimeout(800);
store.codingDraft = await page.evaluate(() => {
  const pane = document.querySelector("main") ?? document.body;
  const attachLabel = [...pane.querySelectorAll("span,label,p")].find((el) => el.textContent.trim() === "Attach File");
  const fontRow = [...pane.querySelectorAll("div")].filter((d) => d.textContent.trim().startsWith("Font:"))[0];
  const textarea = pane.querySelector("textarea");
  return { attachRow: !!attachLabel, fontRow: !!fontRow, textarea: !!textarea };
});
save();
log("LEG I coding draft:", JSON.stringify(store.codingDraft));
// discard the coding draft (X)
await page.getByRole("button", { name: "X", exact: true }).first().click().catch(() => {});
await page.waitForTimeout(600);

// ---- LEG J: cleanup — trash EVERY probe note, verify zero residue ----
for (let round = 0; round < 6; round++) {
  const gone = await page.evaluate(() => {
    const rows = [...document.querySelectorAll("button")].filter(
      (b) => b.textContent.includes("S180 Attach Probe"),
    );
    return rows.length === 0;
  });
  if (gone) break;
  const row = page.locator("button", { hasText: "S180 Attach Probe" }).first();
  await row.click();
  await page.waitForTimeout(1200);
  await page.getByRole("button", { name: "Edit", exact: true }).click().catch(() => {});
  await page.waitForTimeout(600);
  // the view-mode trash (outline red) — delete direct
  const trashBtn = page.locator("button:has(svg.lucide-trash2), button:has(svg.lucide-trash)").last();
  await trashBtn.click().catch(async () => {
    // maybe still in edit — exit then retry
    await page.getByRole("button", { name: "X", exact: true }).first().click().catch(() => {});
    await page.waitForTimeout(500);
    await page.locator("button:has(svg.lucide-trash2), button:has(svg.lucide-trash)").last().click().catch(() => {});
  });
  await page.waitForTimeout(2000);
}
store.residue = await page.evaluate(() => {
  const rows = [...document.querySelectorAll("button")].filter((b) =>
    b.textContent.includes("S180 Attach Probe"),
  );
  return { probeRows: rows.length, noNotesYet: (document.body.textContent || "").includes("No notes yet") };
});
save();
log("LEG J residue:", JSON.stringify(store.residue));

await ctx.close();
await browser.close();
if (store.residue.probeRows !== 0) {
  throw new Error("RESIDUE on the reference account — probe notes present");
}
console.log("PROBE COMPLETE — zero residue. Measurements in", OUT);
