// S156/DE1 live probe — the streamed export endpoint on the dev tree.
// Verifies empirically what the unit oracle pins abstractly:
//   1. GET /api/export/data answers 200 with the download headers.
//   2. The CHUNKED/streamed body is byte-complete: X-Export-Bytes ===
//      the actual received body's UTF-8 byte count (the strengthened
//      s21/DE3 contract, live).
//   3. The body parses as the versioned envelope (format/version/counts/
//      data with all 20 manifest keys).
//   4. The LIVE round-trip: POST the streamed body back to /api/import
//      → idempotent restore (created: 0 — the S139-CN2 witness class).
// Usage: node scripts/probe-export-stream-s156.mjs (node ≥ 23.6).
import { chromium } from "playwright";

const BASE = "http://localhost:3000";

const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();

// The demo sign-in (the drawer-check precedent).
await page.goto(`${BASE}/login`);
await page.fill("input[type=email]", "demo@studyflow.app");
await page.fill("input[type=password]", "Demo1234!");
await page.waitForFunction(
  () => {
    const btn = document.querySelector("button[type=submit]");
    return btn !== null && !btn.disabled;
  },
  null,
  { timeout: 15_000 },
);
await page.click("button[type=submit]");
await page.waitForFunction(
  () => document.querySelector("nav a") !== null && document.querySelector("h1, h2") !== null,
  null,
  { timeout: 30_000 },
);

const res = await page.request.get(`${BASE}/api/export/data`);
const checks = {};

checks.status200 = res.status() === 200;
const headers = res.headers();
checks.contentType = (headers["content-type"] ?? "").includes("application/json");
checks.disposition = (headers["content-disposition"] ?? "").includes("attachment");
checks.nosniff = headers["x-content-type-options"] === "nosniff";

const raw = await res.text();
const declared = Number(headers["x-export-bytes"] ?? "-1");
const actual = new TextEncoder().encode(raw).length;
checks.headerExact = declared === actual;
checks.transferMode = headers["transfer-encoding"] ?? "(none — content-length)";

let envelope = null;
try {
  envelope = JSON.parse(raw);
  checks.parses = true;
} catch {
  checks.parses = false;
}
if (envelope) {
  checks.format = envelope.format === "studyflow-data-export";
  checks.version = envelope.version === 1;
  checks.manifestKeys = Object.keys(envelope.data ?? {}).length === 20;
  checks.countsMatch =
    typeof envelope.counts === "object" &&
    Object.keys(envelope.counts ?? {}).length === 20 &&
    Object.entries(envelope.counts).every(([k, n]) => (envelope.data?.[k] ?? []).length === n);
  checks.secretGuard = !raw.includes("passwordHash");
}

// The LIVE round-trip: the streamed body must restore idempotently.
const rt = await page.request.post(`${BASE}/api/import/data`, { data: envelope });
const rtBody = await rt.json();
checks.roundTrip200 = rt.status() === 200;
checks.roundTripIdempotent = rtBody.created === 0;

await ctx.close();
await browser.close();

console.log(JSON.stringify({
  declaredBytes: declared,
  actualBytes: actual,
  bodyPreview: raw.slice(0, 120),
  checks,
}, null, 2));

const ok = Object.entries(checks)
  .filter(([k]) => !["transferMode"].includes(k))
  .every(([, v]) => v === true);
console.log(ok ? "EXPORT STREAM PROBE: GREEN" : "EXPORT STREAM PROBE: RED");
process.exit(ok ? 0 : 1);
