import { defineConfig, devices } from "@playwright/test";

// E2E layer (v2.4): boots the PRODUCTION standalone server on an isolated
// port with its own scratch database (a THROWAWAY file under /dev/shm —
// see the S176/DZ5 posture below — schema-pushed + seeded by the global
// setup), then drives the real UI in Chromium.
//
// Prerequisites: `bun run build` (the standalone server must exist).
// Run with: `bun run test:e2e`.
//
// Auth strategy: the "setup" project signs the demo user in ONCE and saves
// the session cookie to tests/e2e/.auth/user.json; every spec in the main
// project starts with that storageState. This is not just speed — the auth
// endpoints are rate-limited (10 attempts/IP/15 min), so per-test logins
// would trip the limiter mid-suite. tests/e2e/auth.spec.ts opts back out
// with an empty storageState because it tests the logged-out surface.
//
// The unit layer stays in Vitest (see vitest.config.ts — it matches
// *.test.ts only, so these *.spec.ts / *.setup.ts files are never picked
// up twice).

const PORT = Number(process.env.E2E_PORT ?? 3100);
const BASE_URL = `http://localhost:${PORT}`;
// S175/DY5 (the s175 cert's chunk-3 flake class, trace-diagnosed): the
// ambient P1008 socket-timeout bursts — the app's own /api/rum telemetry
// writes colliding with an interactive route transaction's shared-lock
// window (the folder PATCH's cycle-guard chain walk is the widest), on a
// contended sandbox whose IO intermittently freezes ~5s. The trace
// timeline: three concurrent writes each stalling EXACTLY ~5.04s (the
// connector default) and P1008-ing together, then everything fast again.
// socket_timeout is the documented SQLite busy_timeout knob (quaint:
// SECONDS — verified against the Prisma 6.19.3 CLI) — 30s rides the
// burst out; NO assertion changes, the dev/prod URLs stay bare. The
// class pre-existed as logged noise (S153's RumEvent class, S174's AJ1
// flake, the S216 AK1d class); the s175 sandbox made it cert-blocking.
//
// S176/DZ5 (the s176 cert saga — the freeze class ESCALATED, cured at the
// STORAGE layer): the s175 posture rode the 5s bursts, but the s176
// sandbox's IO freezes escalated to ~30s windows under sustained write
// load (the watcher probe: health SELECTs stalling EXACTLY 30.0s — the
// busy_timeout — three times in a 5.8-min chunk run; a trace timeline
// pinning a trivial /api/auth/me stalling 20s while the server logged
// NOTHING; the idle machine clean for 6 straight minutes). ROOT: with
// journal_mode=delete + synchronous=FULL, every commit fsyncs — a commit
// frozen mid-fsync holds SQLite's EXCLUSIVE lock for the whole window,
// and the browser's apiSend aborts at 20s first → the offline banner →
// the test timeout. THE CURE: the THROWAWAY e2e scratch db moves to
// /dev/shm (tmpfs — RAM) — no disk fsyncs at ALL for the scratch
// database, so the IO-freeze windows cannot stall a commit. Empirically
// validated: a 5-minute ~20-writes/sec rum-upsert hammer against the
// tmpfs db with a concurrent health watcher recorded ZERO stalls (the
// disk-backed runs showed 3 in 5.8 min). The DEV db (db/custom.db) and
// the production posture stay disk-backed — durability is a product
// property; the e2e scratch file is deleted before every run anyway
// (the S46 always-cold doctrine, unchanged).
const E2E_SCRATCH_DIR = "/dev/shm/omni-study1-e2e";
const E2E_DATABASE_URL = `file:${E2E_SCRATCH_DIR}/e2e.db?socket_timeout=30`;
const AUTH_STATE = "tests/e2e/.auth/user.json";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1, // one worker: the specs share a single seeded SQLite file
  // S176/DZ5 (the environmental ride-out posture): ONE retry per test.
  // The s176 sandbox freezes the whole process tree for ~30s windows
  // under the sustained e2e load (the watcher evidence: health SELECTs
  // stalling EXACTLY 30.0s — 3 windows per 5-6 min chunk run — with the
  // tmpfs db already in place, so the stall is process-level, not the
  // db's fsyncs; the idle machine and the no-Chromium write hammer both
  // run clean for 5+ minutes). The S175 posture rode the 5s bursts with
  // socket_timeout=30; the escalated 30s windows need the retry form:
  // a failed test re-runs AFTER the window clears. HONESTY PRESERVED —
  // the reporter still counts "flaky" separately (the class surfaces in
  // every run's output; the cert ledger records the flake inventory),
  // no assertion weakens, and every flake this cycle was
  // isolation-verified green before the posture landed. The DEV db and
  // the production posture are untouched.
  retries: 1,
  reporter: [["list"]],
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    // S176/DZ5 (the load-side lever): Chromium's disk cache churn is the
    // load that trips the sandbox's ~30s process-freeze windows (the
    // no-Chromium write hammer ran 5 min CLEAN; every Chromium-bearing
    // run showed ~3 windows). The cache moves to the same tmpfs scratch
    // volume as the e2e db — the page-asset writes stop hitting disk.
    launchOptions: {
      args: [
        "--disk-cache-dir=/dev/shm/omni-study1-e2e/chrome-disk-cache",
        "--media-cache-dir=/dev/shm/omni-study1-e2e/chrome-media-cache",
      ],
    },
  },
  projects: [
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: "chromium",
      dependencies: ["setup"],
      testIgnore: /auth\.setup\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: AUTH_STATE,
      },
    },
  ],
  globalSetup: "./tests/e2e/global-setup.ts",
  webServer: {
    command: "bun .next/standalone/server.js",
    url: `${BASE_URL}/api/health`,
    timeout: 60_000,
    reuseExistingServer: !process.env.CI,
    env: {
      ...process.env,
      PORT: String(PORT),
      NODE_ENV: "production",
      DATABASE_URL: E2E_DATABASE_URL,
      // S22: 64-hex shape (the documented production form — openssl rand
      // -hex 32) so the boot guard's weak-secret warn stays silent in the
      // suite's own boot. The setup project re-signs-in each run, so the
      // value change invalidates nothing.
      AUTH_SECRET: "5f3a9c1e7b2d4f6a8c0e3b5d7f9a1c3e5b7d9f1a3c5e7b9d1f3a5c7e9b1d3f",
      // S131/CF4: the posture pins. Only AUTH_SECRET was pinned before — an
      // operator who exports SEED_DEMO=0 (a documented Docker workflow)
      // skipped the demo account auth.setup logs in as, DISABLE_IN_APP_*
      // stripped the in-band codes the auth-flows specs read, and
      // TRUSTED_PROXY_HOPS=0 flipped every XFF-keyed limiter spec: all red,
      // none with a diagnosable cause. The suite's green depends on THIS
      // posture, so it is asserted here regardless of the operator's shell
      // (the AP2/AUTH_SECRET precedent extended to every posture var).
      SEED_DEMO: "1",
      DISABLE_IN_APP_OTP: "",
      DISABLE_IN_APP_RESET: "",
      TRUSTED_PROXY_HOPS: "",
    } as Record<string, string>,
  },
});
