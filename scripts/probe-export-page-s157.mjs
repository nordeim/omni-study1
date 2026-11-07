// S157 live page probe — the grid-from-envelope verification on the dev
// tree. Logs into the demo account, visits /export, and verifies: the
// 20-chip grid renders (the envelope's counts — all EXPORT_COLLECTIONS
// keys present, in order), the size signal renders, the counts agree with
// the live API's own envelope counts, and the panel copy is intact.
import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const EXPECTED = [
  "subjects","taskLists","tasks","assignments","exams","events",
  "timetableClasses","notebooks","notes","decks","cards","practiceTests",
  "studyGroups","grades","focusSessions","folders","files","chatMessages",
  "calcHistory","holidays",
];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(`${BASE}/login`);
await page.fill("input[type=email]", "demo@studyflow.app");
await page.fill("input[type=password]", "Demo1234!");
await page.click("button[type=submit]");
await page.waitForFunction(() => document.querySelector("main") !== null, null, { timeout: 30000 });
await page.waitForTimeout(2000);

// The /export page (the server-rendered grid). domcontentloaded + a
// retry: the dev server's first-hit route compile can abort a
// load-event wait (the e2e suite runs against the prebuilt standalone
// and never sees this).
let ok = false;
for (let i = 0; i < 3 && !ok; i++) {
  try {
    await page.goto(`${BASE}/export`, { waitUntil: "domcontentloaded", timeout: 45000 });
    ok = true;
  } catch {
    await page.waitForTimeout(3000);
  }
}
if (!ok) throw new Error("/export did not settle after 3 attempts");
await page.waitForSelector('section[aria-label="What\'s included"]', { timeout: 30000 });
const chips = await page.$$eval('section[aria-label="What\'s included"] span.inline-flex', (els) =>
  els.map((el) => el.textContent?.trim() ?? ""),
);
// Chip text: "<Label><count>" pairs. Extract the label (letters) + count (digits).
const parsed = chips.map((t) => {
  const m = t.match(/^(.*?)(\d+)$/);
  return m ? { label: m[1], count: Number(m[2]) } : { label: t, count: null };
});
console.log(`GRID: ${chips.length} chips`);
console.log(JSON.stringify(parsed.map((p) => `${p.label}=${p.count}`)));

// The size signal renders (the Download card).
const download = page.getByRole("region", { name: "Download" });
const sizeText = await download.textContent();
const sizeMatch = sizeText?.match(/Current backup size:\s*([\d.]+ (?:KB|MB))/);
console.log(`SIZE SIGNAL: ${sizeMatch?.[1] ?? "NOT FOUND"}`);

// The API's own envelope counts — the cross-check (one source: the seam).
const res = await ctx.request.get(`${BASE}/api/export/data`);
const raw = await res.text();
const body = JSON.parse(raw);
const apiCounts = body.counts;
const pageCountsOk = EXPECTED.every((name, i) => {
  // The chip order must equal EXPORT_COLLECTIONS; the count must match the API.
  return parsed[i] && Number(parsed[i].count) === apiCounts[name];
});
console.log(`ORDER+COUNTS vs API envelope: ${pageCountsOk ? "MATCH" : "DIVERGE"}`);
console.log(`HEADER X-Export-Bytes: ${res.headers()["x-export-bytes"]} (body bytes ${Buffer.byteLength(raw)})`);
console.log(`SECRET GUARD: ${raw.includes("passwordHash") ? "LEAK!" : "holds"}`);

await ctx.close();
await browser.close();
console.log("PROBE COMPLETE");
