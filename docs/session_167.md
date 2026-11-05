# Session 167 — the S147 cycle (Batch CV)

Workspace pull-refreshed (the 39th continuation) to `443d508` on `main`
(the Batch CU fix `61bc42f` + the operator's session_166 transcript
commit — the fast-forward added only `docs/session_166.md`). Environment
verified standing: the dev daemon live on :3000, `.env` with
`DATABASE_URL="file:../db/custom.db"`, `db/custom.db` 405 KiB, Playwright
Chromium headless-shell 1243 (matching playwright 1.63.0).

Cold baseline (before any work): lint ✓ · tsc ✓ · unit **1513/1513**
(48 files — the documented S146 final state exactly) · the drawer check
GREEN (**the 62nd consecutive no-Tailwind-v4-mobile-nav-bug
confirmation**) · the desktop chrome probe **MATCH** (all five formal
checks). Baseline noise: none.

The audits (two Mode-C passes, every M/L finding re-verified by direct
read — the first dispatch of two read-only subagents returned garbled
transcripts [a model-level glitch], so the orchestrator executed both
audits directly with full tool access, the doctrine's "re-verify every
M/L finding by direct read" collapsing into the audit itself):

- **Audit A — the Batch CU recent-changes axis** (the `61bc42f` diff):
  **0C / 0H / 0M / 1L / 2I**. All thirteen CU claims verified DELIVERED
  at the source level — CU1's seam (the admission set byte-equal to the
  import door's regex + cap, empty admitted, the octet-stream fallback
  preserved); CU2's three transaction sites (the batch triple, the
  interactive pair with the P2002 catch around the whole tx, the resend
  mirror); CU3's discriminating catch (the `instanceof BodyTooLargeError`
  → 413, everything else through `withUser` → `toErrorResponse` → the
  honest 500); CU4's breadcrumbs (the 9/10 arithmetic re-derived: 10 raw
  POST lines = 9 demo + 1 fresh-user); the CT3 shadow pin; the derivation
  tripwire + clean legs; the doc-chain census machine-verified against
  the tree (every number read). The L: **A-L1** — the CU1a tripwire leg's
  cleanup delete after the assertion, not in a finally (CU1b's own
  pattern): the leg's designed failure mode would ALSO leak the probe row
  into the chunk's files surface.

- **Audit B — the FE/views + auth/crypto rotation** (two cycles stale —
  the S144/S145-swept axis): **0C / 0H / 0M / 0L / 2I + the named rider
  adjudicated REAL**. The historically-real families re-verified CLOSED:
  the ABA tickets (the settings/focus CAS + the store's per-id toggle
  chains with the CC5 eviction); the scrypt/HMAC auth core (login,
  register, verify-email, resend re-read route-by-route — the budget
  tower, the timing equalization, the rehash drain, the conditional
  single-use consumption, the CQ8 tx-row mint); the boot guards; the
  route authz (the factories + the shared write budget); the error
  taxonomy; the ownership scoping; the FE structural gates (the drawer
  check + the parity probe above); the CT1 completion-window set intact.
  The rider: **B-R1** — the NODE_ENV casing warning (below).

The plan (`docs/remediation-plan-session147.md`) written BEFORE any
source change and validated against the codebase (every anchor
re-read), then executed TDD-first.

**The RED inventory:** the unit REDs **6/6 as designed** — the five
predicate legs + the wiring census leg, all failing on the absent seam
export (the import failure IS the red: `Tests 6 failed | 33 passed`
before the seam, `39 passed (39)` after).

**THE REACHABILITY FINDING (the cycle's load-bearing probe).** The
NODE_ENV casing rider looked like a plain missing guard — until the
S146 runtime-split doctrine was applied to the env knob itself: the
standalone server.js FORCES `process.env.NODE_ENV = 'production'` at
its line 5 BEFORE requiring next (verified by direct read of
`.next/standalone/server.js`); `next dev`/`next start` force their own
canonical values; the Dockerfile sets the canonical literal; compose
and `.env.example` never set it. The miscased value reaches the guards
ONLY through a hand-rolled custom server — which reframed the fix as
the overdeclaredProxyHopsWarning class (misconfigured-host
defense-in-depth, zero false positives on every documented posture) and
settled the test shape with it: the unit seam legs drive the pure
predicate (the layer where the value is reachable), the census leg
pins the wiring, and there is NO e2e leg BY DESIGN — a spawn-based leg
would drive the FORCED value, not the miscased one, proving nothing.

**The S147 fixes:** CV1 the NODE_ENV casing boot warning — the pure
`nodeEnvCasingWarning` predicate in `env-check.ts` (silent on all three
canonical values + unset; warns on Production/PRODUCTION/padded/
staging/empty — the honest casing+membership shape) + the
instrumentation `console.warn` wiring (the CI6c precedent: "Set
NODE_ENV=production (lowercase) on production hosts"). CV2 the CU1a
tripwire-cleanup finally (A-L1 — the row id captured before the first
throwing expect; the failed-POST branch creates no row). CV3 the doc
chain.

**Final gates: lint ✓ · tsc ✓ · unit 1519/1519 (48 files, +6) · build ✓
(the wiring verified shipped in the standalone chunk) · the targeted
s14+s22 run 29/29 · e2e 614/614 (the cold 5-chunk cert 150+189+91+95+89
— every chunk first-pass, no flake re-run) = census 2133 green** (was
2127).

**Evidence:** three `docs/screenshots/147-clone-*.png` frames (desktop,
mobile drawer, the login surface — the cycle's axis surface),
self-verifying (>10 KiB, byte-diverse, md5-distinct — the capture
script's JSON verdict ok:true) + the CV1 machine proof on the unit
layer (the six env-check legs).

**Docs:** README badge/census (2127 → 2133) + the Session-147 row; AGENTS
census + the S147 lessons block (two lessons: probe-which-runtime-can-
deliver-an-env-value before designing its leg; a tripwire leg's cleanup
is part of its contract); CLAUDE counts + the env-check seam fragment;
PAD v1.3.55 (the revision block + the §11 closure row); the SKILL census
(both sites); the vitest header re-anchor (env-check +6); the cert
runner unchanged (the e2e census untouched); the plan §6 as-executed
close; this log; the worklog Session-158 entry; the `.env.example`
contract re-verified (no env-var reads changed).

**Next cycle:** the rotation continues — the entities/factory +
data-layer axis is now two cycles stale again (swept at S146), or the
A-M3 stage-2 chunked sub-tx + resume token (its ADR-021 contract change
deserves its own cycle); the B-I3 trim rider stays logged for a
validation-family cycle; the FE/views + auth/crypto axis is one cycle
fresh.
