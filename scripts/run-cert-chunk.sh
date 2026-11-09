#!/usr/bin/env bash
# Per-chunk cold e2e certification runner — replicates the exact procedure
# from scripts/e2e-chunked-cert.sh (kill by port → curl-verify dead →
# SIGKILL escalation → rm db/e2e.db → run the chunk), one chunk per
# invocation so each foreground run fits the tool timeout.
# Usage: bash /home/z/my-project/omni-study1/scripts/run-cert-chunk.sh <1-5>
# Expected (S165/DN re-tag): 155 + 194 + 94 + 95 + 89 = 627 — the same
# census as scripts/e2e-chunked-cert.sh (machine-enforced by
# tests/script-conventions.test.ts, including the identical-CHUNKS pin).
# (S165/DN net +1: chunk 2 +1 [the S165/DN1 timetable CB8
# failure-domain split pin in parity-session9 — the POST continues, the
# refresh GET aborts: a committed create answers the success toast + the
# closed dialog, never the false save-failure that armed the
# duplicate-creating retry; the DK1/DL1/DM1 events/exams/assignments
# ports to the FOURTH family of the recorded family-wide port]. The
# full DN map: docs/remediation-plan-session165.md.)
# (S164/DM net +1: chunk 2 +1 [the S164/DM1 assignments CB8
# failure-domain split pin in parity-session9 — the POST continues, the
# refresh GET aborts: a committed create answers the success toast + the
# closed dialog, never the false save-failure that armed the
# duplicate-creating retry; the DK1/DL1 events/exams ports to the third
# family of the recorded family-wide port; the cycle also carries the
# count-neutral S164/DM4 test-honesty fix — the DJ5 leg's route glob
# `**/api/assignments*` → `**`, Playwright's single star never crossed
# `/`]. The full DM map: docs/remediation-plan-session164.md.)
# (S139/CN net +6: chunk 2 +1 [the S139/CN2 export→import round-trip
# witness in s14-hardening — the demo's own export POSTed back verbatim,
# created: 0; relocated out of resilience where BY5's deliberately-spent
# demo export budget mid-chunk 429'd the leg — the S135/CJ relocation
# class; chunk 2 runs it at import 6/10, export 1/10]; chunk 3 +5 [the
# CN2 empty-envelope + folders-true-index tolerance legs + the CN2
# cross-account 409 + the CN4 card-delegate foreign-id 404s + the CN10
# owned-FK PATCH re-point 404 — one fresh TEST-NET user2 each (probe IP
# 192.0.2.139), the demo import budget at 8/10; END-of-file, the CK1
# flood pin stays TERMINAL in s16].)
# (S138/CM net +1: chunk 3 +1 [the S138/CM2 dashboard KPI OR-form
# held-route leg in resilience — holding ONLY /api/focus-sessions while
# the other four dashboard families resolve: the mixed-landing where the
# pre-fix AND-form rendered the false '0h' Focus Time card; MID-file, the
# CK1 flood pin stays TERMINAL in s16; rides the demo session, no
# registrations, no import budget].)
# (S135/CJ net +4: chunk 2 +2 [CJ1 folders window + CJ3 accent-edge], chunk
# 3 +2 [CJ4 missing-deckId + CJ5 wrong-typed-field — the s23 first draft
# tripped chunk 5's registerGlobal: 40 cap; relocated to resilience].)
# S131/CF6: the exit is PIPESTATUS[0] (the playwright status), never the
# trailing grep's.
set -uo pipefail
cd "$(dirname "$0")/.."

declare -a CHUNKS=(
  "tests/e2e/navigation.spec.ts tests/e2e/parity-session8.spec.ts tests/e2e/mobile-navigation.spec.ts"
  "tests/e2e/parity-session9.spec.ts tests/e2e/parity-session7.spec.ts tests/e2e/theme-system.spec.ts tests/e2e/parity-session6.spec.ts tests/e2e/a11y-sweep.spec.ts tests/e2e/tasks.spec.ts tests/e2e/s14-hardening.spec.ts"
  "tests/e2e/parity-session5.spec.ts tests/e2e/resilience.spec.ts tests/e2e/s16-perf-parity.spec.ts"
  "tests/e2e/accessibility.spec.ts tests/e2e/calculator.spec.ts tests/e2e/dark-mode.spec.ts tests/e2e/s17-fresh-user.spec.ts tests/e2e/s52-sidebar-collapse.spec.ts"
  "tests/e2e/auth.spec.ts tests/e2e/auth-flows.spec.ts tests/e2e/greeting-clock.spec.ts tests/e2e/s18-rum.spec.ts tests/e2e/s19-rum-panel.spec.ts tests/e2e/s20-rum-export.spec.ts tests/e2e/s21-data-export.spec.ts tests/e2e/s22-boot-guard.spec.ts tests/e2e/s23-import.spec.ts tests/e2e/s24-change-password.spec.ts tests/e2e/s25-delete-account.spec.ts tests/e2e/s26-change-email.spec.ts"
)

n="$1"
chunk="${CHUNKS[$((n - 1))]}"

# stale-server kill (AP-70/AP-95 + S91/AR2 + S92/AS6: kill by port, verify
# dead, escalate, re-check; never blanket pkill)
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
rm -f db/e2e.db
echo "=== CHUNK $n: $(echo $chunk | wc -w) files ==="
# S131/CF6: exit on the PLAYWRIGHT status, never the trailing grep's —
# pipefail made this script's status the last pipeline's, so a grep that
# matched NOTHING (an all-skipped run, a reporter-format change) exited 1
# despite a green run (the safe direction, but a false RED). PIPESTATUS[0]
# is the honest exit; a red run still propagates.
bunx playwright test $chunk --reporter=list 2>&1 | grep -E "passed|failed|Error" | tail -5
rc=${PIPESTATUS[0]}
exit "$rc"
