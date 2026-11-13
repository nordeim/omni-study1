// S180 probe 2 — the completion legs + cleanup (probe 1's incremental saves
// captured LEG A-H; this closes the gaps): the attach row's full innerHTML
// (the paperclip affordance), the create POST body (the attachments array
// shape), the chip X button, the "Font:" label classes, the coding draft
// census, and the zero-residue cleanup of EVERY probe note.
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const REF = "https://omni-study1.base44.app";
const OUT = "/tmp/s180-probe2.json";
const store = {};
const save = () => writeFileSync(OUT, JSON.stringify(store, null, 2));

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

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
console.log("logged in");

// If probe 1's note survived its timeout, open it in VIEW mode first and
// measure the Attachments section zero-pill case is NOT needed — instead
// capture its persisted state directly (the note list).
store.preexisting = await page.evaluate(() => {
  const rows = [...document.querySelectorAll("button")].filter((b) =>
    b.textContent.includes("S180 Attach Probe"),
  );
  return { probeNoteCount: rows.length };
});
save();

// ---- open the existing probe note (view mode) to confirm persistence ----
if (store.preexisting.probeNoteCount > 0) {
  await page.locator("button", { hasText: "S180 Attach Probe" }).first().click();
  await page.waitForTimeout(1500);
  store.persistedView = await page.evaluate(() => {
    const h = [...document.querySelectorAll("p,div")].find((el) => el.textContent.trim() === "Attachments");
    const section = h ? h.parentElement : null;
    return {
      section: !!section,
      pills: section ? section.querySelectorAll("a").length : 0,
      pillText: section?.querySelector("a")?.textContent?.trim() ?? null,
    };
  });
  save();
  console.log("persistedView:", JSON.stringify(store.persistedView));

  // ---- the edit surface: the attach row innerHTML + the chip X ----
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  await page.waitForTimeout(1200);
  store.editAttachRowHtml = await page.evaluate(() => {
    const label = [...document.querySelectorAll("span,label,p")].find((el) => el.textContent.trim() === "Attach File");
    const row = label ? label.closest("div") : null;
    return row ? row.outerHTML.slice(0, 2200) : null;
  });
  store.fontLabel = await page.evaluate(() => {
    const span = [...document.querySelectorAll("span")].find((el) => el.textContent.trim() === "Font:");
    return span?.className ?? null;
  });
  save();
  console.log("edit attach row captured:", store.editAttachRowHtml ? "yes" : "no");
  console.log("font label:", store.fontLabel);
  // exit edit
  await page.getByRole("button", { name: "X", exact: true }).first().click().catch(() => {});
  await page.waitForTimeout(700);
}

// ---- the create POST body: fresh draft + pick + Save with the body spy ----
const notePosts = [];
page.on("request", (r) => {
  if (r.method() === "POST" && /entities\/Note(\?|$)/.test(r.url())) {
    notePosts.push({ b: r.postData()?.slice(0, 1500) });
  }
});
await page.locator("button:has(svg.lucide-plus)").first().click();
await page.waitForTimeout(700);
await page.getByRole("menuitem", { name: "New Note", exact: true }).click();
await page.waitForFunction(() => !document.querySelector('[role="menuitem"]'), null, { timeout: 10_000 });
await page.waitForTimeout(900);
store.draftAttachRowHtml = await page.evaluate(() => {
  const label = [...document.querySelectorAll("span,label,p")].find((el) => el.textContent.trim() === "Attach File");
  const row = label ? label.closest("div") : null;
  return row ? row.outerHTML.slice(0, 2200) : null;
});
save();
console.log("draft attach row captured:", store.draftAttachRowHtml ? "yes" : "no");
writeFileSync("/tmp/s180-probe-file2.txt", "s180 probe 2 payload\n");
await page.setInputFiles("input[type=file]", "/tmp/s180-probe-file2.txt");
await page.waitForTimeout(3500);
// the chip + its X (inside the attach row, after the label)
store.chipX = await page.evaluate(() => {
  const a = [...document.querySelectorAll("a")].find((x) => x.textContent.includes("s180-probe-file2.txt"));
  const row = a ? a.closest("div.flex") : null;
  const xBtn = row ? [...row.querySelectorAll("button")].find((b) => b.querySelector("svg.lucide-x")) : null;
  return {
    xBtnClasses: xBtn?.className ?? null,
    xIcon: xBtn?.querySelector("svg")?.getAttribute("class") ?? null,
    rowChildren: row ? [...row.children].map((c) => c.tagName + "." + String(c.className).split(" ").slice(0, 4).join(".")) : null,
  };
});
save();
console.log("chipX:", JSON.stringify(store.chipX));
await page.fill("input[placeholder*='Title' i], input[placeholder*='title' i]", "S180 Attach Probe 2");
await page.waitForTimeout(300);
await page.getByRole("button", { name: "Save", exact: true }).first().click();
await page.waitForTimeout(3500);
store.createPostBody = notePosts;
save();
console.log("create POST body:", JSON.stringify(store.createPostBody, null, 1));

// ---- the coding draft census ----
await page.locator("button:has(svg.lucide-plus)").first().click();
await page.waitForTimeout(700);
await page.getByRole("menuitem", { name: /New Coding Note/i }).click();
await page.waitForFunction(() => !document.querySelector('[role="menuitem"]'), null, { timeout: 10_000 });
await page.waitForTimeout(900);
store.codingDraft = await page.evaluate(() => {
  const label = [...document.querySelectorAll("span,label,p")].find((el) => el.textContent.trim() === "Attach File");
  const fontRow = [...document.querySelectorAll("div")].filter((d) => d.textContent.trim().startsWith("Font:"))[0];
  return { attachRow: !!label, fontRow: !!fontRow, textarea: !!document.querySelector("textarea") };
});
save();
console.log("codingDraft:", JSON.stringify(store.codingDraft));
await page.getByRole("button", { name: "X", exact: true }).first().click().catch(() => {});
await page.waitForTimeout(700);

// ---- cleanup: trash EVERY probe note (both runs) ----
for (const title of ["S180 Attach Probe 2", "S180 Attach Probe"]) {
  for (let round = 0; round < 5; round++) {
    const present = await page.evaluate((t) =>
      [...document.querySelectorAll("button")].some((b) => b.textContent.includes(t)), title);
    if (!present) break;
    await page.locator("button", { hasText: title }).first().click();
    await page.waitForTimeout(1300);
    const trash = page.locator("button:has(svg.lucide-trash2), button:has(svg.lucide-trash)").last();
    await trash.click({ timeout: 8000 }).catch(async (e) => {
      console.log("trash click retry for", title, e.message.split("\n")[0]);
      await page.getByRole("button", { name: "Edit", exact: true }).click().catch(() => {});
      await page.waitForTimeout(600);
      await page.locator("button:has(svg.lucide-trash2), button:has(svg.lucide-trash)").last().click().catch(() => {});
    });
    await page.waitForTimeout(2500);
  }
}
store.residue = await page.evaluate(() => {
  const rows = [...document.querySelectorAll("button")].filter((b) =>
    b.textContent.includes("S180 Attach Probe"),
  );
  return { probeRows: rows.length, noNotesYet: (document.body.textContent || "").includes("No notes yet") };
});
save();
console.log("residue:", JSON.stringify(store.residue));
await ctx.close();
await browser.close();
if (store.residue.probeRows !== 0) throw new Error("RESIDUE on the reference account");
console.log("PROBE 2 COMPLETE — zero residue");
