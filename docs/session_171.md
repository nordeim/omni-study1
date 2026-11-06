# Session 171 — the S149 cycle (Batch CX)

The workspace was the prior session's standing tree at `3fea61c` on
`main` (the Batch CW fix `3d4ac01` + the operator's session_170
transcript commit; pulled fast-forward, working tree clean).
Environment verified standing rather than re-provisioned: `.env` with
`DATABASE_URL="file:../db/custom.db"` (the `.env.example` dev posture)
· `db/custom.db` at the repo root (389 KiB, the seeded demo account) ·
bun 1.3.14 · node 24.22.2 · the dev daemon live on :3000
(`curl /login` → 200).

Cold baseline (before any work): lint ✓ · tsc ✓ · unit **1530/1530**
(48 files — the documented S148 final state exactly) · the drawer
check GREEN (**the 64th consecutive no-Tailwind-v4-mobile-nav-bug
confirmation** — backdrop oklab(0 0 0 / 0.2) + blur(4px); 288px white
panels; 20 links; no footer; Escape-close superset) · the desktop
chrome probe **MATCH** (all five formal checks, live reference
login). Baseline noise: none.

The audits (Mode-C; every M/L finding re-verified by direct read by
the orchestrator before the plan was written):

- **Audit A — the Batch CW recent-changes axis** (the `3d4ac01`
  diff): **0C / 0H / 0M / 0L / 0I — clean**. All four CW claims
  verified DELIVERED at the source level — CW1's budget
  (calculator/history/route.ts:48-56, the POST's checkRateLimit
  between `withUser` and `readJson`; the header comment's exemption
  language retired) + the DELETE twin's comment; CW2's five anchors
  (the seam's EXPORT_MAX_BYTES + exportOverCeiling, the typed
  ExportTooLargeError + the 413 branch with the database-file remedy,
  the throw at the shared renderExportEnvelope seam, the page's narrow
  catch, the panel's derived state + the disabled span); CW3's 502
  (api.ts parse); CW4's census machine-verified (README badge 2144,
  AGENTS/CLAUDE 1530/614, PAD v1.3.56, the SKILL census both sites,
  the vitest header). No new attack surface, no lock-order hazard.

- **Audit B — the FE/views + auth/crypto rotation** (two cycles
  stale — the S147-swept axis; run as two halves). The auth/crypto
  half (orchestrator direct read of src/lib/auth.ts in full, the
  login route in full, the 11-route auth census, the boot guards'
  wiring): **clean — every S147-verified family re-confirmed closed**
  (the CF10/CM3 global containment, the CB12 per-account uniform-401
  with the CG1 equalized burn, the BX4/CI1 uniform scrypt pair +
  rehash drain, the BS1 session-version mint, the route census, the
  instrumentation wiring). The FE/views half (a full breadth scan of
  all 22 views + the store + the client seams + the login surface +
  the export/rum panels + the SPA shell, dispatched as a read-only
  subagent): **0C / 0H / 2M / 3L / 4I** — the historically-real
  families re-verified closed at their anchors (the ABA/per-key
  fetchSeq CAS, the CC11 loadingCounts, the CT1 completion-window
  set, the S130/CE1 deadlines, the unlatch-on-failure finally
  discipline, the auth-surface inline honesty + CA10 in-flight guard,
  the note-HTML two-door sanitizer, the memory-leak census, the key
  discipline). The findings, all five M/L re-verified by direct read:
  **B-M1** the myDay/important row toggles retained the BX10
  stale-base double-toggle race (the S127/CB16 chain fixed ONE
  toggle — `completed`; the siblings PATCHed from the render
  snapshot; tasks-view.tsx:529-538 + myday-view.tsx:91-99);
  **B-M2** the study-group member add/remove ops interleaved on a
  call-time store read with no chain (the S123/BX10 fix narrowed the
  window; a remove during an add's PATCH+refetch window silently
  dropped the add; studygroups-view.tsx:214-253); **B-L1** the
  resend-code catch rendered the success line for TRANSPORT failures
  (login-surface.tsx:211-222); **B-L2** the calculator's three
  history-save affordances carried no in-flight guard
  (calculator-view.tsx:173-206/:502-513/:715-731); **B-L3** the
  Settings me-fetch failure left the Account card stuck on "Loading
  your account…" forever (settings-view.tsx:1085-1097). The Is: the
  mid-session 401 seam, the departed-note flush silence, the in-band
  dev code delivery, the note-tag length-cap drop — all recorded,
  no action. The TaskDialog/GroupDialog edit-form snapshot pattern
  adjudicated designed last-writer-wins (recorded, not a finding).

The plan (`docs/remediation-plan-session149.md`) written BEFORE any
source change and validated against the codebase (every anchor
re-read), then executed TDD-first.

**The RED inventory (as it ran):** the unit REDs **13/13** — the
CX1/CX2 functional legs (the import failure IS the red — the CW2
precedent: `mutations.toggleTaskMyDay`/`toggleTaskImportant`/
`setStudyGroupMembers` did not exist) + the six wiring-census legs
(the four CX1 view sites + the CX2 members-panel handlers) + the
CX3/CX4/CX5 census legs. The plan's §4 inventory line said "12"
— it undercounted by the CX1 failed-toggle-no-poison leg (the legs
themselves are the inventory; recorded here for the honest count).

**The S149 fixes:** CX1 `toggleTaskMyDay`/`toggleTaskImportant` ride
the SHARED `taskToggleChains` map (the toggleTask idiom — one chain
per task id; cross-field PATCHes are field-scoped so the shared map
is harmless and the CC5 eviction stays single; the four view call
sites rewired off the render-snapshot PATCHes). CX2
`setStudyGroupMembers(groupId, update)` — the per-group members chain
(the `groupMemberChains` map beside `taskToggleChains`) with the
UPDATER form: the caller declares the effect, the chain supplies the
POST-SETTLE base through `normalizeMembers` (the S85/AL1 seam) — the
load-bearing choice that generalizes the idiom from toggles to
arbitrary members math; the add/remove handlers rewired (the add's
`savingMember` latch stays — it guards the form's own duplicate
submits). CX3 the resend catch splits TRANSPORT first — the 20 s
deadline renders the deadline copy, the offline `ApiError(0)` renders
the human offline message (a request that never left the browser has
zero enumeration surface; the CF8 uniform line stays for every
account-state failure). CX4 the calculator save guards — the `=`
re-press no-op (a synchronous justEvaluated ref read, so even a
same-tick double-press cannot append the derived "5 = 5" noise row)
+ the GPA/unit Save latches (`disabled={savingGpa}`/
`disabled={savingUnit}`, the CI4 pattern). CX5 the Settings Account
card's failed me-fetch renders the honest copy (never a stuck
loading claim) + the red `sf-alert-red` `role="alert"` block with a
real Retry (the effect re-runs on retryCount through the page.tsx
boot() inner-async shape — the react-hooks/set-state-in-effect
contract, caught by lint and fixed at the root, never by weakening
the rule).

**Final gates: lint ✓ · tsc ✓ · unit 1543/1543 (48 files, +13) ·
build ✓ (exit 0; the new wiring verified shipped in the standalone
client + SSR chunks; the 6 Turbopack warnings are the documented
db-path/instrumentation baseline — files untouched this cycle) · the
targeted e2e run (calculator + parity-session5 + parity-session8 +
s17-fresh-user + tasks — the cycle's five surfaces) **148/148
green** · the cold 5-chunk cert on the FINAL tree **150 + 189 + 91 +
95 + 89 — every chunk FIRST-PASS, ZERO flakes** (the SQLite
socket-timeout and ai/chat noise lines co-occurring are the
documented machine-load/AI-key-less classes) = the e2e census 614/614
unchanged · **census 2157 green** (was 2144).**

**Evidence:** four `docs/screenshots/149-clone-*.png` frames (desktop
237 KiB, the mobile drawer 64 KiB, the study-groups detail 182 KiB —
the CX2 surface, the settings profile tab 221 KiB — the CX5 surface),
self-verifying (exists, >10 KiB, byte-diverse, dominant-share < 95%,
md5-distinct — the capture script's JSON verdict ok:true; dimensions
machine-checked 1440x900 / 390x844, non-white center-band shares
29.9–47.9%). The CX1 machine proof rides the unit layer (the three
chain legs + the two wiring censuses — a double-click race is not
screenshot-provable); the CX2/CX5 surfaces additionally ride the
cert's parity/s17 pins.

**Docs:** README badge/census (2144 → 2157) + the Session-149 row;
AGENTS census (1530 → 1543) + the S149 lessons block (two lessons:
a chain fixed at one call site leaves its siblings a generation
behind; an anti-enumeration catch must not swallow transport
failures — with the loading-surface twin); CLAUDE counts; PAD v1.3.57
(the revision block + the five §11 closure rows); the SKILL census
(both sites); the vitest header re-anchor (+13: data-store +8,
script-conventions +5); the cert runner unchanged (the e2e census
untouched); `docs/session_171.md` (this log); the worklog Session-160
entry; the plan §6 as-executed close; the `.env.example` contract
re-verified (no env-var reads changed this cycle).

**Next cycle:** the rotation continues — the entities/factory +
data-layer axis or the A-M3 stage-2 chunked sub-tx + resume token
(its own ADR-021 cycle, now carrying the B-L2 import lock-hold
finding); the B-I3 trim rider stays logged for a validation-family
cycle; the B-I census-granularity design change stays the named
deferral (CX1's focused pins closed the found gaps without
redesigning the census walk).
