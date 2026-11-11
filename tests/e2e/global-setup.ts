import { execSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";

/**
 * Playwright global setup: guarantee the isolated e2e database exists and
 * carries the demo seed, so every spec run starts from the same state.
 *
 * S176/DZ5: the database lives at /dev/shm/omni-study1-e2e/e2e.db — a
 * THROWAWAY tmpfs (RAM) scratch file (the IO-freeze cure; see
 * playwright.config.ts's S176/DZ5 comment for the full trace-timeline
 * diagnosis). DATABASE_URL is SHELL-provided here; the ABSOLUTE `file:`
 * URL needs no anchor (the db-path seam passes absolute URLs through
 * untouched). The seed resolves the same env var at runtime through
 * src/lib/db-path.ts. The /dev/shm volume evaporates on sandbox recycle —
 * harmless: the cold reset deletes the scratch db before every run
 * anyway (the S46 always-cold doctrine).
 *
 * S131/CF5 (the design correction): the COLD reset (port-guard + rm of the
 * scratch db) does NOT live here — Playwright boots the webServer BEFORE
 * globalSetup (empirically verified the hard way: the first CF5 shape
 * killed the suite's own server mid-run), so deleting the db from here
 * would race a live listener and strand its connection pool on a deleted
 * inode. The reset rides scripts/e2e-cold-reset.sh, chained into the
 * `test:e2e` npm script BEFORE playwright boots anything — the only
 * pre-boot seam in the default runner (the cert scripts own their whole
 * lifecycle already). This file keeps the schema push + seed (writes to
 * the same inode the server pool holds — proven safe by every prior run).
 */
export default function globalSetup(): void {
  const repo = path.resolve(__dirname, "..", "..");

  // The tmpfs scratch dir must exist before ANY consumer opens the db —
  // SQLite creates a missing FILE, never a missing DIRECTORY.
  mkdirSync("/dev/shm/omni-study1-e2e", { recursive: true });

  const env = {
    ...process.env,
    DATABASE_URL: "file:/dev/shm/omni-study1-e2e/e2e.db",
    // S131/CF4: the demo account is auth.setup's login — an operator's
    // exported SEED_DEMO=0 must not skip it (the config pins the server
    // posture; the seed leg pins its own).
    SEED_DEMO: "1",
  } as NodeJS.ProcessEnv;

  const run = (cmd: string) => execSync(cmd, { cwd: repo, env, stdio: "pipe" }).toString();

  // S128/CC12: log the PRIMARY failure before each fallback — a schema-drift
  // error from the bunx leg used to surface only as the fallback's own
  // unrelated npx error (the cause masked, the diagnosis misdirected).
  try {
    run("bunx prisma db push --skip-generate");
  } catch (err) {
    console.error("[global-setup] bunx prisma db push failed — retrying with npx:", err);
    run("npx prisma db push --skip-generate");
  }
  try {
    run("bun prisma/seed.ts");
  } catch (err) {
    console.error("[global-setup] bun prisma/seed.ts failed — retrying with npx tsx:", err);
    run("npx tsx prisma/seed.ts");
  }

  // S140/CO1: the hostile LEGACY note fixture — a pre-fix row (written
  // before the note-HTML sanitize seam) the render-gate e2e leg opens in
  // the Notes view, asserting zero outbound requests to the attacker
  // origin. Idempotent; rides the same shell-pinned DATABASE_URL.
  try {
    run("bun scripts/e2e-plant-legacy-note.ts");
  } catch (err) {
    console.error("[global-setup] bun scripts/e2e-plant-legacy-note.ts failed — retrying with npx tsx:", err);
    run("npx tsx scripts/e2e-plant-legacy-note.ts");
  }
}
