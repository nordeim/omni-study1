// S166 parity probe — the REFERENCE's notes search semantics (raw HTML vs
// rendered text). The reference persists note content as HTML (measured
// S77/AD7: "<p><strong>Probe paragraph one.</strong></p>"), and its account
// currently has ZERO notes — so the semantics are measurable only by
// creating a probe note. The decisive query: content "quartz jest vigil"
// contains NO letter "p", but its stored HTML wrapper (<p>...</p>) does —
// searching "p" matches the row IFF the reference searches raw HTML source.
// Residue-zero: the probe note is deleted via the same API, verified.
import { chromium } from "playwright";

const REF = "https://omni-study1.base44.app";
const APP = "6969efea366cba53524cde3f";
const TITLE = "s166 search probe";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const api = (method, path, body) =>
  page.evaluate(async ({ method, url, body }) => {
    let token = null;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      const v = localStorage.getItem(k);
      if (v && v.startsWith("ey") && v.split(".").length === 3) { token = v; break; }
    }
    const r = await fetch(url, {
      method,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    let parsed = null;
    try { parsed = await r.json(); } catch {}
    return { status: r.status, body: parsed };
  }, { method, url: `/api/apps/${APP}${path}`, body });

try {
  await page.goto(`${REF}/login`, { timeout: 45000 });
  await page.waitForTimeout(2500);
  await page.fill("input[type=email]", process.env.REF_PROBE_EMAIL);
  await page.fill("input[type=password]", process.env.REF_PROBE_PASSWORD);
  await page.waitForFunction(() => { const b = document.querySelector("button[type=submit]"); return b && !b.disabled; }, null, { timeout: 15000 });
  await page.click("button[type=submit]");
  await page.waitForFunction(() => document.querySelector("main") !== null, null, { timeout: 45000 });
  await page.waitForTimeout(2000);

  // pre-state: verify zero notes (do not touch anything else)
  const pre = await api("GET", "/entities/Note");
  const preRows = Array.isArray(pre?.body) ? pre.body : pre?.body?.data;
  console.log("PRE notes:", Array.isArray(preRows) ? preRows.length : `status:${pre.status}`);

  // create the probe note via the reference's own API
  const created = await api("POST", "/entities/Note", {
    title: TITLE,
    content: "quartz jest vigil",
    tags: [],
  });
  const id = created?.body?.id ?? created?.body?._id ?? null;
  console.log("CREATE:", created.status, "id:", id);
  if (!id) throw new Error("create failed: " + JSON.stringify(created).slice(0, 300));

  // open the Notes view and run the queries
  await page.goto(`${REF}/Notes`, { timeout: 45000 });
  await page.waitForTimeout(3000);
  const search = page.locator("input[placeholder*='earch']").first();
  const rowVisible = async () =>
    (await page.getByText(TITLE, { exact: false }).count()) > 0;
  const results = {};
  for (const q of ["", "quartz", "p", "vigil"]) {
    await search.fill(q);
    await page.waitForTimeout(900);
    results[q || "empty"] = await rowVisible();
  }
  console.log("SEARCH RESULTS:", JSON.stringify(results));

  // cleanup + verify zero residue
  const del = await api("DELETE", `/entities/Note/${id}`);
  const post = await api("GET", "/entities/Note");
  const postRows = Array.isArray(post?.body) ? post.body : post?.body?.data;
  console.log("DELETE:", del.status, "POST notes:", Array.isArray(postRows) ? postRows.length : `status:${post.status}`);
} finally {
  await browser.close();
}
