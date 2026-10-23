#!/usr/bin/env bash
# Session-88 cold e2e certification — the 5-chunk map, final post-Batch-AO
# (census 468 → 469: parity-session7 +1 [the S88/AO4 study-zombie pin: the
# deterministic external-deletion window drives the exact s80 L1 — mid-study
# the deck's cards empty through rate's own PATCH→GET refresh carrying a
# deletion between its legs; the empty deck's guard fall-through renders;
# a UI refill must NOT resurrect the latched study session — the pin was
# RED on the pre-fix build at the designed discriminator (the card grid
# never returns) and GREEN after the render-phase structural kill]. The
# S87/AO2 wraps modify four stamped pins IN-PLACE (AH8c + AI1a/b/c — the
# try/finally cleanup the AN1/AM5 convention established; dev-iterate
# hygiene only, cold-cert immune). The S87 map beneath:)
# (census UNCHANGED at 468: the S87/AN1 change modified the AM1 pin in-place
# [the stamped-row cleanup — the id rides the evaluate's return, the finally
# deletes it on the failing path; the AM5 convention applied to the pin AM5
# itself shipped], and the AN4 read-side-trim change is unit-pinned only
# [group-members +2 — the seam is pure]. The S86 map beneath:)
# (census: 30 spec files exactly once; the S86 addition rides in-place —
# parity-session8 +1 [the AM1 members-boundary API pin: a blank member
# name is rejected at the API — the seam/server trim alignment, the s86
# audit's L2]; the S85 additions beneath —
# parity-session8 +3 [the AL1 members family: seeded members render,
# add-member preserves, edit-save preserves] and accessibility +1 [the AL2
# Study Groups member avatar chip print pin]; the S84 map beneath: resilience
# 12 tests [the AJ1 folder pin + the AK1 guard family] and accessibility 84
# [the AJ5 print family + AJ6 focus pin + the AK2 print-enumeration closure
# + the AL2 chip]).
# Expected: 131 + 139 + 57 + 84 + 58 = 469 (each chunk's count includes its
# auth setup; 464 real specs = the S82 443 + the seven S83 pins + the eight
# S84 pins + the four S85 pins + the one S86 pin + the one S88 pin). Per-chunk: fresh
# db/e2e.db + stale-server kill (fresh in-memory limiter, register budget
# stays <= 9/10 per chunk).
# (S84/AK3 header correction, the audit's L1: the S83 header said
# "resilience 8→9" and "444 + six S83 pins" — the empirical counts were
# 7→8 and 443+7=450; corrected here so the census stays re-derivable.)
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
