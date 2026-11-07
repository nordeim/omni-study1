#!/usr/bin/env bash
# S131/CF5 — the ALWAYS-COLD reset for the default e2e runner (the AGENTS.md
# S46 doctrine, until now cert-path-only): kill any stale server on the e2e
# port (by port — curl-verify dead — SIGKILL escalation — re-check; never
# blanket pkill), then delete the scratch database. Chained into the
# `test:e2e` npm script BEFORE playwright boots anything — the only pre-boot
# seam (Playwright starts the webServer before globalSetup, so the reset
# cannot live in global-setup; empirically verified the hard way).
#
# Why the reset: the seed's IDEMPOTENT UPSERTS do not refresh day-relative
# dates on existing rows (the S45 day-boundary class) and the s23-import
# round-trip posts a FIXED-id envelope (the S46 re-run class) — ANY run
# against the aged scratch db fails deterministically. Cold, every time.
#
# Usage: invoked by `bun run test:e2e` (no arguments needed).
set -uo pipefail
cd "$(dirname "$0")/.."

port="${E2E_PORT:-3100}"
pids=$(ss -tlnp 2>/dev/null | grep ":${port} " | grep -oP 'pid=\K[0-9]+' | sort -u)
for p in $pids; do kill "$p" 2>/dev/null; done
sleep 1
if curl -s -o /dev/null --max-time 2 "http://localhost:${port}/api/health"; then
  for p in $pids; do kill -9 "$p" 2>/dev/null; done
  sleep 1
  if curl -s -o /dev/null --max-time 2 "http://localhost:${port}/api/health"; then
    echo "FATAL: :${port} still answers after the SIGKILL escalation — refusing to delete db/e2e.db under a live listener"
    exit 1
  fi
fi
# S155/DD4a: the glob (not the bare db/e2e.db) — a crash-left -journal
# sidecar survives a bare rm and would hot-journal-recover against the
# freshly pushed db; the -wal/-shm patterns are the same hygiene (nothing
# else matches this glob).
rm -f db/e2e.db*
echo "[e2e-cold-reset] port ${port} clear, db/e2e.db removed — the run starts cold"
