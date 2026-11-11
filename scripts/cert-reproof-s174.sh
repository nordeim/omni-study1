#!/usr/bin/env bash
# S174 cert re-proof — chunks 3 + 4 re-run cold after the two documented
# first-pass flakes (the AJ1 files-flake + the S11 nav-chip cold-db flake,
# both green in isolation). Mirrors the cert's own per-chunk hygiene:
# port-guard kill + fresh db/e2e.db per chunk.
set -uo pipefail
cd "$(dirname "$0")/.."

port="${E2E_PORT:-3100}"
kill_port_server() {
  pids=$(ss -tlnp 2>/dev/null | grep ":${port} " | grep -oP 'pid=\K[0-9]+' | sort -u)
  for p in $pids; do kill "$p" 2>/dev/null; done
  sleep 1
  if curl -s -o /dev/null --max-time 2 "http://localhost:${port}/api/health"; then
    for p in $pids; do kill -9 "$p" 2>/dev/null; done
    sleep 1
    if curl -s -o /dev/null --max-time 2 "http://localhost:${port}/api/health"; then
      echo "FATAL: :${port} still answers — refusing to delete db/e2e.db under a live listener"
      exit 1
    fi
  fi
}

rc=0
for chunk in \
  "tests/e2e/parity-session5.spec.ts tests/e2e/resilience.spec.ts tests/e2e/s16-perf-parity.spec.ts" \
  "tests/e2e/accessibility.spec.ts tests/e2e/calculator.spec.ts tests/e2e/dark-mode.spec.ts tests/e2e/s17-fresh-user.spec.ts tests/e2e/s52-sidebar-collapse.spec.ts"; do
  kill_port_server
  rm -f db/e2e.db
  echo "=== RE-PROOF: $(echo $chunk | wc -w) files ==="
  bunx playwright test $chunk --reporter=list 2>&1 | grep -E "passed|failed" | tail -3
  rc=$((rc | PIPESTATUS[0]))
done
echo "=== RE-PROOF DONE ==="
exit "$rc"
