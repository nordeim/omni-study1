# Session 163 — the S145 cycle (Batch CT)

Workspace reset (the 37th continuation). Cloned at `d962537` on `main` (the
Batch CS fix `b4a76a5` + the operator's session_161/162 transcript commit
`d962537`). Environment provisioned per the recipe: `bun install` (510 pkgs),
`.env` from `.env.example` (`DATABASE_URL="file:../db/custom.db"`),
`db:push` + `db:seed` (the demo account + seeded rows, `db/custom.db`
389 KiB), Playwright Chromium (headless-shell 1243, matching the repo's
playwright 1.63.0), the dev daemon live on :3000.

Cold baseline (before any work): lint ✓ · tsc ✓ · unit **1500/1500** (48
files — the documented S144 final state exactly) · the drawer check GREEN
(**the 60th consecutive no-Tailwind-v4-mobile-nav-bug confirmation**) · the
desktop chrome probe **MATCH** (all five formal checks). Baseline noise:
none.

The audits (two read-only Mode-C subagents, every M/L finding re-verified by
direct read):

- **Audit A — the Batch CS recent-changes axis** (the `b4a76a5` diff):
  **0C / 0H / 0M / 1L / 2I**. All seven CS claims verified DELIVERED at the
  source level — the claims table CONFIRMED on every row (the cursor probe:
  0 mismatches over 300 random forests incl. cycles/dangling parents; the
  mime guard probe: CRLF/ESC/non-ASCII/TAB/DEL/NUL all rejected; the census
  arithmetic machine-verified 1500/48 + 150/187/89/95/88 = 609). The L:
  **A-L1** — the demo-import-budget census the s144 commit re-anchored was
  MIS-COUNTED: the s23 header claimed "exactly 9" while the file makes 10
  demo-session POSTs (the enumeration omits the S140/CO1 hostile-note leg
  at :596 and mislabels the panel-journey in-app POST), so the file sits at
  10/10 — ZERO HEADROOM; the resilience cross-reference claimed "5" while
  the file carries 9 (8 fixture + 1 demo.request). The Is: the CS5 row cap
  is post-parse by design (the parse-phase transient allocation is inherent
  to JSON.parse); the CR5/CAS double-failure edge (pre-existing S143
  semantics, self-corrects on the next /api/auth/me hydration).

- **Audit B — the FE/views + auth/crypto/infra axis** (two cycles stale):
  **0C / 0H / 1M / 2L / 6I**. The axis substantially clean: the
  historically-real families re-verified CLOSED (the ABA/late-response
  class — settings/files/notes/aiassistant all carry their tickets; the
  auth core — scrypt fail-closed parse, the login timing equalizer, HMAC
  MAC-first + sessionVersion re-check, XFF fail-closed; the boot guards;
  the route authz — requireUser-first + limiter-before-parse across 18
  factory shells + hand-written routes; the error taxonomy — subclass-first
  ordering, the CS7 log, the downloadHeaders clamp; the ownership scoping;
  the FE structural gates — zero set-state-in-effect violations, the
  18-entry accent set machine-pinned, the CE3 loading gate on all 18 data
  views). The M: **B-M1** — the focus timer's completion window re-armed
  from its own terminal state: after the auto-completion, mode stayed
  "focus" and remaining stayed 0 through the in-flight save (and forever
  after a failed save — the catch only toasts), the Start button stayed
  enabled, and complete() had no saving guard, so a Play press at 00:00
  POSTed a phantom full-duration session from zero elapsed time (a
  double-log inside the window); the late .then/.catch state writes also
  clobbered newer mode picks (the S142–S144 ABA family). The L: **B-L1**
  the forgot-password supersede pair ran as two un-transacted awaits
  (breaking the route's own one-live-link invariant under a concurrent
  same-account race); **B-L2** the export panel's two primary CTAs were
  the codebase's only solid `bg-sf-primary` CTA violations of the house
  gradient convention.

The plan (`docs/remediation-plan-session145.md`) written BEFORE any source
change and validated against the codebase (every M/L anchor re-read), then
executed TDD-first.

**The RED inventory (all as designed):** the three unit census legs RED 3/3;
the e2e REDs against the PRE-FIX build — CT1a at `toBeDisabled` (the Start
button stayed enabled through the in-flight window), CT1b at the Long Break
`aria-pressed` (the late .then clobbered the newer pick), CT3 at
`background-image "none"` (the solid CTAs). The fake-clock drive itself was
validated FIRST by a throwaway probe against the dev daemon (clockText
"00:00" + POST #1 observed before the designed assertion failures were
trusted — the new S145 "prove the drive" doctrine).

**The S145 fixes (all RED-proven first):** CT1 the completion-window set —
the saving latch (`if (saving)` guard + unlatch), `disabled={saving}` on the
Start button, the failure re-latch to a fresh full duration, and the
settle-CAS (the house `React.useRef(createFetchSeq()).current` ticket
minted at POST time, invalidated by switchMode/applyPreset/reset; the
.then/.catch state writes currency-gated, the toasts unconditional). CT2
the forgot-password supersede pair in ONE batch `$transaction` (the
one-live-link invariant). CT3 the export-panel CTAs riding `.sf-gradient` +
`.sf-gradient-shadow` (the house primary-CTA surface). CT4 the budget
recount (the s23 header 10/10 zero-headroom warning, both inline budget
comments, the resilience cross-reference 9/10, the cert-script re-tag
note, + the census leg machine-pinning the census-visible POST counts).

**Final gates: lint ✓ · tsc ✓ · unit 1503/1503 (48 files, +3) · build ✓ ·
e2e 612/612 = census 2115 green** (was 2109). The cold 5-chunk cert:
chunk 1 150 first-pass · chunk 2 187 first-pass · chunk 4 95 first-pass ·
chunk 5 89 first-pass · chunk 3 hit the documented BU1/P1008 environmental
flake class (the files-view empty-PATCH leg at :277 — the same family the
S142/S143 cycles recorded, co-occurring with the WebServer socket-timeout
noise) — the contention-free cold re-run of chunk 3 was **91/91
first-pass** (4.1 m).

**Evidence:** four `docs/screenshots/145-clone-*.png` frames,
machine-verified (the completion-window proof — the Start button disabled
through the window, exactly one POST, the failure toast, the 25:00
re-latch, the fresh-retry press running a real session; the gradient proof
— both CTAs computing
`linear-gradient(to right, rgb(139, 92, 246), rgb(79, 70, 229))`; the
standing desktop + mobile-drawer frames; all frames >10 KiB, byte-diverse,
md5-distinct).

**Docs:** README badge/census (2109 → 2115) + the Session-145 row; AGENTS
census + the S145 lessons block (six lessons); CLAUDE counts; PAD v1.3.53
(the revision block + the §11 closure row); the SKILL census (the head +
the green-state line + the chunk-map line, which was itself found
two-cycles stale at 603 — the s140 doc-drift class reborn); the vitest
header re-anchor; the cert re-tag (chunk 3 89 → 91, chunk 5 88 → 89); the
plan §6 as-executed close; this log; the worklog Session-156 entry; the
`.env.example` contract re-verified (unchanged — no env-var reads changed
this cycle).

**Next cycle:** the rotation continues (the entities/factory axis one
cycle fresh; the FE/views + auth/crypto axis just swept — the next
candidates: the entities/factory axis again after one more cycle, or the
A-M3 stage-2 chunked sub-tx + resume token, the one named standing
deferral — its ADR-021 contract change deserves its own cycle with its own
ADR; the NODE_ENV casing warning is a cheap rider for the next
auth-family cycle).
