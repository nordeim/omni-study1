// ---------------------------------------------------------------------------
// Next.js instrumentation hook (S22/ADR-020): runs once per server boot —
// dev, next start, and the standalone build (never during next build).
// Asks the PURE seam what to do about the configured AUTH_SECRET:
//
//   - production fatal (missing / blank / the public dev fallback):
//     console.error + process.exit(1). A plain throw is CAUGHT by Next and
//     leaves a degraded 500-everything server — the explicit exit is the
//     validated fail-fast mechanism (pinned by tests/e2e/s22-boot-guard.spec.ts).
//   - warn (weak production secret / dev without a secret): console.warn.
// ---------------------------------------------------------------------------

import { authSecretBootStatus, inBandDeliveryProdWarning } from "./lib/env-check";
import { resolveProcessDatabaseUrl } from "./lib/db-path";

export async function register(): Promise<void> {
  const status = authSecretBootStatus(
    process.env.NODE_ENV,
    process.env.AUTH_SECRET,
  );

  if (status.level === "fatal") {
    console.error(status.message);
    process.exit(1);
  }
  if (status.level === "warn" && status.message) {
    console.warn(status.message);
  }

  // S129/CD5: the affirmative startup line (the §17 boot observable). The
  // three-anchor DATABASE_URL contract is the repo's most fragile invariant
  // — AGENTS.md's own troubleshooting guidance says "check the startup log
  // line" — so the happy path emits one: node_env + the RESOLVED db anchor
  // through the SAME seam the app uses (never a re-derivation). Only the
  // safe shape rides the line: a file: URL prints its path (no credentials
  // exist in a sqlite path), anything else prints just the protocol — a
  // PostgreSQL URL carries credentials and never reaches the log.
  const dbUrl = resolveProcessDatabaseUrl();
  const dbShape = dbUrl.startsWith("file:")
    ? dbUrl
    : `${dbUrl.split(":")[0]}:<redacted>`;
  console.log(
    `[boot] studyflow up — node_env=${process.env.NODE_ENV ?? "unknown"} db=${dbShape}`,
  );

  // S127/CB14: the in-band delivery production warning (the BT5 posture
  // precedent — ADR-013's single-user default stands, but an
  // internet-facing boot must at least be TOLD it is handing one-shot
  // takeover links and OTP codes to any caller who knows an email).
  if (inBandDeliveryProdWarning(process.env, process.env)) {
    console.warn(
      "[boot] WARNING: in-band OTP/reset delivery is ENABLED in production — " +
        "forgot-password returns the live reset link and the OTP routes return " +
        "the code in the response body (the ADR-013 single-user posture: any " +
        "caller who knows an email receives the account's one-shot takeover " +
        "token, and the response shape is an account-existence oracle). " +
        "Multi-user or exposed deployments MUST set DISABLE_IN_APP_RESET=1 and " +
        "DISABLE_IN_APP_OTP=1 and provide real mail transport — see " +
        "DEPLOYMENT.md §8.",
    );
  }
}
