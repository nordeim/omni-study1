#!/usr/bin/env bash
# Session-83 cold e2e certification — the 5-chunk map, final post-Batch-AJ
# (census: 30 spec files exactly once; the S83 additions ride in-place —
# resilience 8→9 with the AJ1 folder field-preservation pin [rename preserves
# parentId + empty PATCH no-op, the sentKeysPatch routing's guard] and
# accessibility 73→79 with the AJ5 print-fill family [5 pins: the Calendar
# segmented tab, the Timetable today badge, the Exams topic chips, the
# Calculator History pill, the Settings theme tile] + the AJ6 SectionLink
# focus-ring pin). Expected: 127 + 138 + 53 + 79 + 58 = 455 (each chunk's
# count includes its auth setup; 450 real specs = the S82 444 + the six S83
# pins). Per-chunk: fresh
# db/e2e.db + stale-server kill (fresh in-memory limiter, register budget
# stays <= 9/10 per chunk).
set -uo pipefail
cd "$(dirname "$0")/.."

declare -a CHUNKS=(
  "tests/e2e/navigation.spec.ts tests/e2e/parity-session8.spec.ts tests/e2e/mobile-navigation.spec.ts"
  "tests/e2e/parity-session9.spec.ts tests/e2e/parity-session7.spec.ts tests/e2e/theme-system.spec.ts tests/e2e/parity-session6.spec.ts tests/e2e/a11y-sweep.spec.ts tests/e2e/tasks.spec.ts tests/e2e/s14-hardening.spec.ts"
  "tests/e2e/parity-session5.spec.ts tests/e2e/resilience.spec.ts tests/e2e/s16-perf-parity.spec.ts"
  "tests/e2e/accessibility.spec.ts tests/e2e/calculator.spec.ts tests/e2e/dark-mode.spec.ts tests/e2e/s17-fresh-user.spec.ts tests/e2e/s52-sidebar-collapse.spec.ts"
  "tests/e2e/auth.spec.ts tests/e2e/auth-flows.spec.ts tests/e2e/greeting-clock.spec.ts tests/e2e/s18-rum.spec.ts tests/e2e/s19-rum-panel.spec.ts tests/e2e/s20-rum-export.spec.ts tests/e2e/s21-data-export.spec.ts tests/e2e/s22-boot-guard.spec.ts tests/e2e/s23-import.spec.ts tests/e2e/s24-change-password.spec.ts tests/e2e/s25-delete-account.spec.ts tests/e2e/s26-change-email.spec.ts"
)

i=1
for chunk in "${CHUNKS[@]}"; do
  # stale-server kill (AP-70/AP-95: kill by exact match, never blanket pkill)
  pids=$(ps aux | grep -E "\.next/standalone/server\.js" | grep -v grep | awk '{print $2}')
  for p in $pids; do kill "$p" 2>/dev/null; done
  sleep 1
  rm -f db/e2e.db
  echo "=== CHUNK $i: $(echo $chunk | wc -w) files ==="
  bunx playwright test $chunk --reporter=list 2>&1 | grep -E "^ *[0-9]+ (passed|failed)|passed|failed" | tail -3
  i=$((i + 1))
done
echo "=== DONE — chunked certification complete ==="
