// S101 · Batch BB surface evidence captures — the register rotation + the
// evidence-frame rotation (the BB1 register note: the BA1-era census counts
// [215 importers / 96 carriers] describe the pre-rider tree — the post-BA
// final-tree re-derivation is 217/98, the two s100 riders having joined the
// guarded class after the BA1 measurement; the register rotates forward so
// the next audit's re-derivation has the scoped expectation) rendered live
// on consumer surfaces the s87–s100 frames did not cover.
//
// BB frames (the GUARDED surfaces, on the final build): Frame 1: the LOGIN
// route's check-email alert in DARK — the CONSUMERS map's login-surface
// entry (login-surface.tsx's sf-alert-emerald, role=alert — the
// auth-flows-pinned surface ["Check your email" + the exact alert prose]),
// driven deterministically with a NON-EXISTENT email: the forgot API answers
// the identical 200 with no link (no account oracle — no PasswordResetToken
// row, no register), the client's forgotDone state renders the alert
// regardless — ZERO persistent rows by construction; DARK via the context's
// colorScheme emulation (the documented dark-OS login theming — the boot
// script's system fallback; no persisted preference to restore). Frame 2:
// the /EXPORT page's import-success alert in DARK — the CONSUMERS map's
// export-panel entry (export-panel.tsx's sf-alert-emerald, role=status —
// the s23-import-pinned surface ["the result summary renders with the
// upsert counts"]), driven deterministically with an EMPTY envelope
// {format, version: 1, data: {}} — every collection key absent → skipped →
// 0 created / 0 updated / 0 total, the emerald result state renders, ZERO
// persistent mutation by construction; DARK via the boot script's SYSTEM
// FALLBACK (the theme-cache key cleared + the context's colorScheme
// emulation — the documented pre-paint path for a cache-less dark-OS
// visitor; the /export server route has no /api/auth/me consumer, so the
// theming is local to the context, nothing restored). Both frames md5-DISTINCT (the
// AR7 gate; the s93 I5 shape: the explicit boolean gate, the failure path
// prints its own line, the completion line only on green — the S95/AV2
// exit-code semantics: process.exitCode = 1 on the failure branch; the AX3
// catch generalized to EVERY failed path, carried here).
//
// Usage: node scripts/capture-s101-evidence.mjs
//        (clone :3200 standalone first — the S86 daemon recipe; node
//        >= 23.6 for uniformity with the resweep class — NOT bun: the
//        S97/AX2 finding observed on the RESWEEP's verify-email POST [a
//        Set-Cookie response], playwright-core's APIRequestContext
//        crashing in _parseSetCookieHeader under bun 1.3.14; this
//        capture flow's own requests are untested under bun — node is
//        the uniform class convention, the AY2-honest scope)
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

const BASE = "http://localhost:3200";
const OUT = "docs/screenshots";
mkdirSync(OUT, { recursive: true });

// The env pin — this script owns its own DATABASE_URL, never the caller's
// environment (the cwv-volume-stress convention).
const prisma = new PrismaClient({ datasources: { db: { url: "file:../db/custom.db" } } });

const browser = await chromium.launch();
// DARK for Frame 1 through the OS emulation itself (the boot script's
// system fallback — the login route themes for dark-OS visitors; the
// authenticated shell's user record wins later, so Frame 2 drives dark
// through the S10 API PATCH like every capture since).
const context = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  colorScheme: "dark",
});
const page = await context.newPage();
let md5Failed = false; // the s93 I5 shape: the explicit completion gate
let thrown = false; // the AX3 shape: the catch path's completion-gate boolean

try {
  const demo = await prisma.user.findUnique({ where: { email: "demo@studyflow.app" } });
  if (!demo) throw new Error("demo user missing — run bun run db:seed");

  // ============ BB · the guarded surface, leg 1 (dark login check-email) ==
  // Anonymous, dark-OS context: the boot script's system fallback applies
  // the dark class pre-paint on the login route. The forgot flow on a
  // NON-EXISTENT email: the API answers the identical 200 with no link (no
  // oracle), the forgotDone state renders the alert — zero rows anywhere.
  await page.goto(`${BASE}/login`);
  await page.waitForFunction(
    () => document.documentElement.classList.contains("dark"),
    null,
    { timeout: 15000 },
  );
  await page.getByRole("button", { name: /forgot password/i }).click();
  await page.getByRole("heading", { name: "Reset your password" }).waitFor({ state: "visible", timeout: 15000 });
  await page.getByLabel("Email", { exact: true }).fill("s101-nonexistent-probe@studyflow.app");
  await page.getByRole("button", { name: /send reset link/i }).click();
  // The auth-flows-pinned surface: the Check your email heading + the
  // role=alert carrying the family live (the CONSUMERS map's
  // login-surface entry — the frame's surface proof).
  await page.waitForFunction(
    () => {
      const alerts = [...document.querySelectorAll('[role="alert"]')];
      return (
        /check your email/i.test(document.querySelector("h2")?.textContent ?? "") &&
        alerts.some((el) => el.classList.contains("sf-alert-emerald"))
      );
    },
    null,
    { timeout: 15000 },
  );
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/101-clone-bb-rotation-dark-login-checkemail.png` });

  // ============ BB · leg 2 — the /export import-success alert ============
  // Fresh navigation resets the client-side view state to signin (the
  // check-email view carries TWO "Back to sign in" buttons — the S16
  // back-link at top plus the outline Button — a strict-mode collision;
  // the reload sidesteps it), then the demo login. DARK for the /export
  // surface rides the boot script's SYSTEM FALLBACK — the documented
  // pre-paint truth path for a cache-less dark-OS visitor (the S11 cache
  // contract): the login's loadFromUser cached the demo record's light,
  // so the cache key is cleared before the navigation and the context's
  // colorScheme emulation drives the fallback. (The /export route is a
  // server component with NO /api/auth/me consumer — the S21 capture's
  // me-route fulfill was inert there, recorded but never gated; the
  // cache/system path is the honest production mechanism.) The user
  // record is never mutated — no S4 restore is owed.
  await page.goto(`${BASE}/login`);
  await page.fill("input[type=email]", "demo@studyflow.app");
  await page.fill("input[type=password]", "Demo1234!");
  await page.click("button[type=submit]");
  await page.waitForURL(`${BASE}/Dashboard`, { timeout: 20000 });
  await page.waitForFunction(() => !!document.querySelector(".sf-clock-date"), null, { timeout: 15000 });

  // The dark-OS visitor's pre-paint truth: the cache gone, the system
  // fallback applies dark BEFORE first paint (no light flash).
  await page.evaluate(() => localStorage.removeItem("sf-theme"));
  await page.goto(`${BASE}/export`);
  await page.waitForFunction(
    () =>
      document.documentElement.classList.contains("dark") &&
      document.documentElement.style.getPropertyValue("--sf-primary") !== "",
    null,
    { timeout: 15000 },
  );
  await page.getByRole("heading", { name: "Export Your Data" }).waitFor({ state: "visible", timeout: 15000 });

  // The empty envelope: every collection key absent → the import loop
  // skips → 0 created / 0 updated / 0 total — the emerald result state
  // renders with ZERO persistent mutation (the s23-pinned surface).
  const EMPTY_ENVELOPE = JSON.stringify({
    format: "studyflow-data-export",
    version: 1,
    exportedAt: "2026-10-26T00:00:00.000Z",
    user: { id: "s101-empty", email: "s101-empty@studyflow.app", name: "S101 Empty" },
    counts: {},
    data: {},
  });
  await page.getByLabel("Choose a backup file").setInputFiles({
    name: "studyflow-data-s101-empty.json",
    mimeType: "application/json",
    buffer: Buffer.from(EMPTY_ENVELOPE),
  });
  const importBtn = page.getByRole("button", { name: "Import", exact: true });
  await importBtn.waitFor({ state: "visible", timeout: 15000 });
  await importBtn.click();
  // The s23-import-pinned surface: the role=status result summary — the
  // CONSUMERS map's export-panel entry carrying the family live (the
  // frame's surface proof).
  await page.waitForFunction(
    () => {
      const statuses = [...document.querySelectorAll('[role="status"]')];
      return statuses.some(
        (el) => el.classList.contains("sf-alert-emerald") && /import complete/i.test(el.textContent ?? ""),
      );
    },
    null,
    { timeout: 20000 },
  );
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/101-clone-bb-rotation-dark-export-import.png` });

  // ---- The distinct-frame verification — the AR7 gate, the s93 I5 shape --
  const md5 = (p) => createHash("md5").update(readFileSync(p)).digest("hex");
  const frames = [
    `${OUT}/101-clone-bb-rotation-dark-login-checkemail.png`,
    `${OUT}/101-clone-bb-rotation-dark-export-import.png`,
  ].map(md5);
  const distinct = new Set(frames).size === frames.length;
  if (!distinct) {
    // The failure path prints its OWN line — no success-shaped prose on a
    // failed gate. The S95/AV2 semantics: process.exitCode = 1 (the
    // S91/AR7 gate semantics — an exit-code-checking wrapper must see
    // the failure).
    console.log(`S101 BB frames DUPLICATE: ${frames.join(" ")} — the md5 gate FAILS this run`);
    process.exitCode = 1;
    md5Failed = true;
  } else {
    console.log(`S101 BB frames: ${frames.join(" ")} — all DISTINCT`);
  }
} catch (err) {
  // The AX3 shape (the s96 audit's I3): the failure path is gate-OWNED — a
  // mid-run throw exits 1 through this catch with a script-owned failure
  // line, not through node's unhandled-rejection spew. The md5Failed
  // shape generalized: every failure path sets process.exitCode = 1, and
  // the completion line below keys on the explicit booleans.
  console.error(`S101 BB surface captures FAILED: ${err?.message ?? err}`);
  process.exitCode = 1;
  thrown = true;
} finally {
  // The S11/S14 leak lessons where routes were held (none this cycle —
  // the Frame 2 theming rides the cache/system fallback, no route
  // interception at all). No S4 restore is owed: the dark theming was
  // LOCAL (the theme-cache key in this context's localStorage, dead with
  // the context), the forgot probe used a NON-EXISTENT email (no oracle,
  // no token row), and the import envelope was EMPTY (0/0/0) — zero
  // persistent state on every path, by construction.
  await context.close().catch(() => {});
  await browser.close().catch(() => {});
  await prisma.$disconnect().catch(() => {});
}
// The s93 I5 shape: the completion line is gated on the explicit boolean
// (the AX3 shape: both of them — no success-shaped prose on any failed path).
if (!md5Failed && !thrown) console.log("S101 BB surface captures complete");
