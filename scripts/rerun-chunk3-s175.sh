#!/usr/bin/env bash
# S175 chunk-3 re-proof — the AJ1 flake re-run (the S174 precedent:
# tests/e2e/resilience.spec.ts AJ1 flaked in the long cert's chunk 3
# [green in isolation in 894ms then, 1.4s now — the load-induced
# class], and the house pattern re-proves the WHOLE chunk cold, never
# just the flaked test). Same prologue as e2e-chunked-cert.sh's
# per-chunk loop: stale-server kill by listening port (AP-70/AP-95/
# AR2/AS6 lineage) + fresh db/e2e.db, then the chunk-3 file set.
set -uo pipefail
cd "$(dirname "$0")/.."

chunk="tests/e2e/parity-session5.spec.ts tests/e2e/resilience.spec.ts tests/e2e/s16-perf-parity.spec.ts"

port="${E2E_PORT:-3100}"
pids=$(ss -tlnp 2>/dev/null | grep ":${port} " | grep -oP 'pid=\K[0-9]+' | sort -u)
for p in $pids; do kill "$p" 2>/dev/null; done
sleep 1
if curl -s -o /dev/null --max-time 2 "http://localhost:${port}/api/health"; then
  for p in $pids; do kill -9 "$p" 2>/dev/null; done
  sleep 1
  if curl -s -o /dev/null --max-time 2 "http://localhost:${port}/api/health"; then
    echo "FATAL: :${port} still answers after SIGKILL — refusing db delete under a live listener"
    exit 1
  fi
fi
rm -f db/e2e.db
echo "=== CHUNK 3 RE-PROOF: 3 files (fresh e2e.db, cold) ==="
bunx playwright test $chunk --reporter=list 2>&1 | grep -E "^ *[0-9]+ (passed|failed)|passed|failed|✗" | tail -6
rc=${PIPESTATUS[0]}
echo "=== chunk 3 re-proof done (playwright rc=${rc}) ==="
exit $rc
