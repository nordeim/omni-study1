import { defineConfig, devices } from "@playwright/test";

// E2E layer (v2.3): boots the PRODUCTION standalone server on an isolated
// port with its own scratch database (db/e2e.db, schema-pushed + seeded by
// the global setup), then drives the real UI in Chromium.
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
const E2E_DATABASE_URL = "file:../db/e2e.db?socket_timeout=30";
const AUTH_STATE = "tests/e2e/.auth/user.json";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1, // one worker: the specs share a single seeded SQLite file
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
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
