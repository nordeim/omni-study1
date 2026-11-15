// S188 evidence capture — the staged-row GC lifecycle proof frames.
// Frame 1: the API lifecycle rendered as a self-verifying proof table (the
// rows are generated FROM the live API responses — fixture B 200 [the
// plant integrity], the trigger upload 201, fixture A 404 [THE SWEEP],
// the trigger's own row 200 [the fresh boundary], the second upload 201 +
// the first row still 200 [the repeated-GC boundary]). Frame 2: the Notes
// editor draft with a freshly staged attachment chip — the visible
// feature whose scratch the GC governs, DOM-asserted before the shot.
// Usage: node scripts/capture-s188-evidence.mjs   (the dev server at
// :3000 carries the current ported code; run the plant against the DEV db
// first: DATABASE_URL="file:../db/custom.db" bun
// scripts/e2e-plant-stale-staged-attachment.ts)
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const CLONE = "http://localhost:3000";
const OUT = "docs/screenshots";
mkdirSync(OUT, { recursive: true });

const STALE_URL = "/api/notes/attachments/s188el-stale-staged-fixture-01";
const FRESH_URL = "/api/notes/attachments/s188el-fresh-staged-fixture-01";

const browser = await chromium.launch();
try {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${CLONE}/login`);
  await page.fill("input[type=email]", "demo@studyflow.app");
  await page.fill("input[type=password]", "Demo1234!");
  await page.waitForFunction(() => { const b = document.querySelector("button[type=submit]"); return b && !b.disabled; }, null, { timeout: 15_000 });
  await page.click("button[type=submit]");
  await page.waitForFunction(() => document.querySelector("nav a") !== null && document.querySelector("h1, h2") !== null, null, { timeout: 30_000 });
  await page.waitForTimeout(1500);

  // ---- Frame 1: the GC lifecycle proof table (live API responses) ----
  const upload = (name) => page.request.post(`${CLONE}/api/notes/attachments`, {
    multipart: {
      file: {
        name,
        mimeType: "text/plain",
        buffer: Buffer.from(`${name} body`, "utf8"),
      },
    },
  });
  const steps = [];
  const get = (path) => page.request.get(`${CLONE}${path}`);
  const plantB = await get(FRESH_URL);
  steps.push(["GET fixture B (fresh, planted now)", plantB.status(), "200 — the plant ran; nothing can sweep a fresh row"]);
  const trigger = await upload("s188-el-evidence-trigger.txt");
  const trigRow = trigger.status() === 201 ? await trigger.json() : null;
  steps.push(["POST the trigger upload (the GC fires)", trigger.status(), "201 — the staged row minted; the sweep ran inside this request"]);
  const staleA = await get(STALE_URL);
  steps.push(["GET fixture A (25h stale, staged)", staleA.status(), "404 — THE SWEEP (was 200 pre-fix: nothing swept it)"]);
  const trigGet = trigRow ? await get(trigRow.url) : null;
  steps.push(["GET the trigger's own row", trigGet ? trigGet.status() : 0, "200 — the fresh row survives its own upload's sweep"]);
  const second = await upload("s188-el-evidence-second.txt");
  steps.push(["POST a second upload (the GC fires again)", second.status(), "201 — minted; the sweep re-ran"]);
  const firstAgain = trigGet ? await get(trigRow.url) : null;
  steps.push(["GET the trigger's row again", firstAgain ? firstAgain.status() : 0, "200 — the repeated-GC boundary holds"]);

  // The self-verification: the sweep + both boundaries must hold before
  // the frame is shot (the table rows carry the LIVE statuses).
  if (staleA.status() !== 404) throw new Error(`frame-1 self-check failed: the stale fixture answered ${staleA.status()}, expected 404`);
  if (trigGet?.status() !== 200) throw new Error(`frame-1 self-check failed: the trigger row answered ${trigGet?.status()}, expected 200`);
  if (firstAgain?.status() !== 200) throw new Error(`frame-1 self-check failed: the repeated-GC boundary answered ${firstAgain?.status()}, expected 200`);

  await page.goto(`${CLONE}/login`);
  await page.evaluate((rows) => {
    document.body.innerHTML = `
      <div style="font-family: ui-sans-serif, system-ui, sans-serif; max-width: 880px; margin: 40px auto; padding: 32px; background: #fff; border: 1px solid #f1f5f9; border-radius: 16px; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);">
        <h1 style="font-size: 20px; font-weight: 700; color: #1e293b; margin: 0 0 4px;">S188/EL — the staged-row GC lifecycle (the superset hygiene feature)</h1>
        <p style="font-size: 13px; color: #64748b; margin: 0 0 24px;">Live API responses against the remediated dev server · the demo account · the two-fixture plant (A 25h stale / B fresh) · 2026-11-15</p>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <thead>
            <tr style="text-align: left; color: #64748b; border-bottom: 1px solid #e2e8f0;">
              <th style="padding: 8px 12px;">Step</th>
              <th style="padding: 8px 12px;">Status</th>
              <th style="padding: 8px 12px;">Reading</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(([step, status, reading]) => `
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 12px; color: #334155;">${step}</td>
                <td style="padding: 10px 12px; font-weight: 700; color: ${status === 404 ? "#b91c1c" : "#15803d"};">${status}</td>
                <td style="padding: 10px 12px; color: #64748b;">${reading}</td>
              </tr>`).join("")}
          </tbody>
        </table>
        <p style="font-size: 12px; color: #94a3b8; margin: 24px 0 0;">The unit pins (tests/note-attachments.test.ts · the S188/EL block) + the e2e pins (tests/e2e/resilience.spec.ts · EL1/EL2) carry the machine proof; this frame is the human-readable record.</p>
      </div>`;
    document.title = "S188 GC lifecycle proof";
  }, steps);
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/188-gc-lifecycle-proof.png`, fullPage: true });
  console.log("frame 1: the GC lifecycle proof table — self-verified (swept 404 / boundaries 200/200)");

  // ---- Frame 2: the Notes draft with a staged attachment chip ----
  await page.goto(`${CLONE}/Notes`);
  await page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true", null, { timeout: 15_000 });
  await page.waitForTimeout(1200);
  await page.getByRole("button", { name: "New note menu" }).click();
  await page.getByRole("menuitem", { name: "New Note", exact: true }).click();
  await page.waitForFunction(() => !document.querySelector('[role="menuitem"]'), null, { timeout: 10_000 });
  const rightPane = page.locator('[aria-label="Note editor pane"]');
  await rightPane.locator('input[type="file"].hidden').first().setInputFiles({
    name: "s188-el-evidence-chip.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("the staged chip the GC governs", "utf8"),
  });
  const chip = rightPane.getByRole("link", { name: "s188-el-evidence-chip.txt" });
  await chip.waitFor({ state: "visible", timeout: 10_000 });
  const href = await chip.getAttribute("href");
  const chipLive = await page.request.get(`${CLONE}${href}`);
  if (chipLive.status() !== 200) throw new Error(`frame-2 self-check failed: the staged chip href answered ${chipLive.status()}, expected 200`);
  await page.screenshot({ path: `${OUT}/188-notes-staged-chip.png` });
  console.log("frame 2: the staged attachment chip (the GC's subject) — self-verified (the href answers 200 live)");

  await ctx.close();
} finally {
  await browser.close();
}
