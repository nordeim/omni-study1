# Remediation Plan — Session 145 (Cycle 95, Batch CT)

> Status: PLANNED (pre-change record — the immutable plan; the as-executed
> close lives in §6). Written before any source change, per the standing
> doctrine ("write the cycle plan into docs/remediation-plan-sessionN.md
> BEFORE any source change").
>
> Operator directive: refresh the workspace, re-read the doc chain
> (AGENTS/CLAUDE/README/PAD/SKILL + session_161/162 +
> remediation-plan-session144 + worklog), validate against the codebase,
> audit with the repo-included skills (skills/web-application/SKILL.md the
> primary; the skills catalog for the rotation), iterate toward
> visual/functional parity with omni-study1.base44.app (agent-browser-era
> scripts, live reference login, mobile-navigation attention, the
> Tailwind v4 bug watch), provision `.env` with
> `DATABASE_URL="file:../db/custom.db"` + the repo-root `db/`, validate
> the vitest/playwright suites, remediate TDD-first, capture evidence
> frames, update the doc chain, push via the SSH wrapper. The repo's
> `skills/` folder stays excluded from code checking, testing, and
> compilation. Proceed with best judgement on the remaining open
> questions (the operator's standing instruction).

## §0 Scope, method, cold baseline, live parity

**Workspace (the 37th continuation).** Fresh clone at `d962537` on `main`
(the Batch CS fix `b4a76a5` + the operator's session_161/162 transcript
commit `d962537`). Environment provisioned per the recipe: `bun install`
(510 pkgs), `.env` from `.env.example` (`DATABASE_URL="file:../db/custom.db"`),
`db:push` + `db:seed` (the demo account + seeded rows, `db/custom.db`
389 KiB), Playwright Chromium 153 (headless-shell 1243, matching the
repo's playwright 1.63.0), the dev daemon live on :3000 (verified stable
across tool calls; `curl /login` → 200).

**Cold baseline (before any work):**

| Gate | Result |
|---|---|
| `bun run lint` | ✓ 0 errors |
| `bun run typecheck` | ✓ 0 errors |
| `bun run test` (Vitest) | ✓ 1500/1500 (48 files) — the documented S144 final state exactly |
| `node scripts/drawer-check-s14.mjs` (both hosts, live reference login) | GREEN — **the 60th consecutive no-Tailwind-v4-mobile-nav-bug confirmation** (backdrop oklab(0 0 0 / 0.2) + blur(4px); 288px white panels; 20 links; no footer; Escape-close superset) |
| `node scripts/parity-probe-s142.mjs` (both hosts, live reference login; REF_PROBE_* exported) | **DESKTOP CHROME: MATCH** — all five formal checks (sidebar outer width, nav link count, first-links order, mainX, mainWidth) |

**Baseline noise observed (recorded, not findings):** none.

**Probes run BEFORE the plan (the doctrine — probe, don't guess):** the
two audit subagents carried their own probes; every M/L finding below
was then re-verified by direct read of the current tree before this
plan was written (the anchors are in §1).

## §1 The audits (Mode-C, read-only subagents; every M/L finding re-verified by direct read)

Per the s144 closing directive — "the audit rotation continues (the
FE/views + auth/crypto/infra axis two cycles stale after S142's sweep —
the next rotation candidate; the import/export + data-portability axis
just swept; the entities/factory axis one cycle fresh)" — plus the
standing recent-changes focus ("particularly on the recent code
changes"):

1. **Audit A — the Batch CS recent-changes audit** (the `b4a76a5` diff
   itself: the CS1 useRef CAS wiring, the CS2 cursor dequeue, the CS4
   mime charset guard + downloadHeaders clamp, the CS5 row ceiling, the
   CS6 template collector, the CS7 drift log, and every delivered test
   leg audited for honesty): **0C / 0H / 0M / 1L / 2I**. **All seven CS
   claims verified DELIVERED at the source level** — the claims table
   CONFIRMED on every row (the cursor probe: 0 mismatches over 300
   random forests incl. cycles/dangling parents/duplicate ids; the mime
   guard probe: CRLF/ESC/non-ASCII/TAB/DEL/NUL all rejected, the
   browser's own emission grammar passes; the census arithmetic
   machine-verified 1500/48 + 150/187/89/95/88 = 609). The L: **A-L1**
   — the demo-import-budget census this very commit re-anchored is
   MIS-COUNTED: s23 makes **10** demo-session import POSTs (the header
   says "exactly 9" — the enumeration omits the S140/CO1 hostile-note
   leg at :596 AND mislabels the panel-journey in-app POST), so the file
   sits at **10/10 — zero headroom** against `checkRateLimit("import:",
   10)`; resilience carries **9** demo-session POSTs (the s23 header's
   cross-reference says "5" — it omits the S137/CL1 at :1236, the
   S139/CN2-empty at :1343, the S139/CN7 at :1359, and the S139
   cross-account demo POST at :1429); the two inline "budget #N"
   comments (:263 "#8", :569 "#9") are stale with them. The Is: I-1 the
   CS5 row cap is post-parse by design (the parse-phase transient
   allocation is inherent to JSON.parse — the byte cap bounds the
   input; no action); I-2 the CR5/CAS double-failure edge (two
   concurrent FAILURES of the same field roll back to the first's value
   — pre-existing S143 semantics, self-corrects on the next
   /api/auth/me hydration; carried §5).

2. **Audit B — the FE/views + auth/crypto/infra axis** (two cycles
   stale — the S142-era sweep): **0C / 0H / 1M / 2L / 6I**. The axis is
   substantially clean: the historically-real families re-verified
   CLOSED (the ABA/late-response class — settings/files/notes/AI all
   carry their tickets; the auth core — scrypt fail-closed parse, the
   login timing equalizer, HMAC MAC-first + sessionVersion re-check,
   XFF fail-closed; the boot guards — whitespace-fatal, dev-fallback
   fatal; the route authz — requireUser-first + limiter-before-parse
   sampled across 18 factory shells + hand-written routes; the error
   taxonomy — subclass-first ordering, the CS7 log, the downloadHeaders
   clamp; the ownership scoping — every factory query userId-scoped,
   TOCTOU windows fail closed via P2025→404; the FE structural gates —
   zero set-state-in-effect violations, the 18-entry accent set
   machine-pinned, the CE3 loading gate on all 18 data views). The M:
   **B-M1** — the focus timer's completion window re-arms from its own
   terminal state: after the auto-completion fires, `mode` stays
   `"focus"` and `remaining` stays `0` until the save POST's `.then`
   lands; in that window — and INDEFINITELY after a failed save (the
   catch only toasts) — the big Play button is enabled (no `disabled`
   prop; only Complete carries `disabled={saving}`) and `complete()`
   has no `saving` guard, so pressing Play at `remaining===0` re-fires
   the completion effect and POSTs another
   `createFocusSession({ durationSeconds: durations.focus - 0 })` — a
   PHANTOM FULL-DURATION session from zero elapsed time (and a
   double-log when pressed inside the in-flight window); the secondary
   face is the ABA class itself — the save's late `.then`
   (setMode/setRemaining) clobbers any newer mode/preset pick made
   during the window. The L: **B-L1** — the forgot-password supersede
   pair (`deleteMany` + `create`) runs as two separate awaits, breaking
   the route's own documented invariant ("exactly one live link per
   account is the bounded, least-surprise posture", the S121/BV11b
   comment) under a concurrent same-account race
   (delete/delete/create/create → two live one-shot tokens); **B-L2**
   — the export panel's two primary CTAs (the Download JSON anchor +
   the Import button) are hand-rolled SOLID `bg-sf-primary` elements —
   the only violations of the repo's own convention ("every primary
   action uses the Button `gradient` variant … Never render a solid
   `bg-sf-primary` CTA", AGENTS.md:119); the other `bg-sf-primary`
   sites are checkbox fills and chat bubbles (not CTAs — verified). The
   Is: NODE_ENV casing (guards key on exact `=== "production"`; a
   hand-rolled `NODE_ENV=Production` host degrades to the dev posture —
   §5); the register re-issue transactional triple (the S142-carried
   deferral, unchanged); the analytics `#666` axis labels carry no dark
   variant (≈3.1:1 contrast — S9-K reference-measured values, dark is
   the superset; §5 polish); the DropdownMenuItem onClick-vs-onSelect
   note (keyboard reachability identical — verified against the Radix
   dist); the unthrottled authenticated collection GETs (the BZ5
   deliberate posture, reads bounded by take: 500); the prewarm
   fire-and-forget before the auth verdict (correct today; noted so a
   future read-budget doesn't re-open the load-stability contract).

**Every M/L finding above was re-verified by direct read of the
current tree before this plan was written** — B-M1 at
focustimer-view.tsx:112-154 (the completion effect at :150-154 re-fires
`complete` whenever `running` flips true at `remaining===0`;
`complete` at :112-148 has no `saving` guard; the catch at :137 only
toasts — `mode` stays `"focus"`, `remaining` stays `0`; the Play
button at :306-317 carries no `disabled` prop while the Complete
button at :321-329 does) — A-L1 by recount (s23: 9 `request.post`
fixture sites [:87/:121/:152/:197/:204/:213/:225/:304/:596] + the
panel-journey in-app POST [:264-271, the app's own fetch through the
demo page] = 10; resilience: 8 `request.post` sites
[:642/:663/:779/:830/:855/:1236/:1343/:1359 — the project storageState
is the demo user, playwright.config.ts:50] + the `demo.request.post`
at :1429 = 9; `checkRateLimit("import:", 10)` at the route :195) —
B-L1 at forgot-password/route.ts:78-90 (two awaits, no `$transaction`;
the BV11b comment at :73-77 states the invariant the pair breaks) —
B-L2 at export-panel.tsx:172-178/:214-222 (both carry
`bg-sf-primary … hover:bg-sf-primary-strong`).

## §2 Findings → the CT set

| ID | Source | Severity | Defect | Fix |
|---|---|---|---|---|
| CT1 | B-M1 | Medium (data integrity: phantom/duplicate persisted focus sessions from a natural interaction; the ABA face) | The focus timer's completion window re-arms: `remaining===0 && mode==="focus"` persists through the in-flight save and forever after a failed save; Play is enabled; `complete()` unguarded → a Play press at 00:00 POSTs a full-nominal-duration session from zero elapsed (double-log inside the window); the late `.then`/`.catch` state writes clobber newer mode/preset picks (the S142/S143/S144 family, this file's own settle path) | The completion-window set: (a) `if (saving) return` guard in `complete()` (+ unlatch `running`); (b) `disabled={saving}` on the Start button (parity with Complete); (c) the failure path re-latches `remaining` to `durations[mode]` so a retry starts a FRESH session, never a phantom; (d) the settle-CAS — the house `React.useRef(createFetchSeq()).current` ticket minted at POST time and invalidated by `switchMode`/`applyPreset`/`reset`, gating the `.then`/`.catch` state writes (toasts stay unconditional) |
| CT2 | B-L1 | Low (concurrent-same-account race breaks the route's own one-live-link invariant; no new attacker capability under ADR-013's in-band posture) | The forgot-password supersede pair is two un-transacted awaits | `db.$transaction([deleteMany, create])` (the batch form, the BZ7/CE5 family) |
| CT3 | B-L2 | Low (style/consistency — the only two solid-accent CTAs in the codebase, on the /export owner surface) | The export panel's Download JSON anchor + Import button are solid `bg-sf-primary` CTAs | Both ride `.sf-gradient` + `.sf-gradient-shadow` (the house primary-CTA surface; the anchor keeps its `<a download>` shape, the button keeps `disabled:opacity-50`) |
| CT4 | A-L1 | Low (test-hygiene doc inaccuracy with a future 429 tripwire — s23 at 10/10 zero headroom, the documented "1 slot free" is fiction) | The s23 budget header + inline comments + the resilience cross-reference miscount the demo import POSTs (9 documented vs 10 actual in s23; 5 documented vs 9 actual in resilience) | The recount set: the s23 header (10/10 zero-headroom, loudly), both inline budget comments (#8→#9, #9→#10), the resilience cross-reference (9/10 one slot), the resilience header's own arithmetic, the cert-script comment — + a census leg machine-pinning the census-visible POST counts per file |
| CT5 | The doc chain | — | Census/lesson/revision updates for the whole cycle | README badge/census + Session-145 row; AGENTS census + the S145 lessons; CLAUDE counts; PAD v1.3.53; SKILL census; vitest header re-anchor; the cert re-tag (the new chunk map); the plan §6 as-executed close; `docs/session_163.md`; the worklog Session-156 entry; the `.env.example` contract re-verified |

## §3 Per-item design

### CT1 — the focus-timer completion-window set (B-M1)

`src/components/views/focustimer-view.tsx`. Four changes, one theme
(the terminal state must not re-arm, and the settle path must respect
currency):

- **(a) the guard:** `complete()` opens with
  `if (saving) { setRunning(false); return; }` — the unlatch keeps the
  state sane if the effect ever fires while a save is in flight
  (running=true at 00:00 must not keep the interval alive); the early
  return prevents the second POST (the double-log).
- **(b) the affordance:** the Start/Pause button gains
  `disabled={saving}` + `disabled:opacity-50` — parity with the
  Complete button; the primary entry to the phantom is closed at the
  UI surface too.
- **(c) the failure re-latch:** the `.catch` — after the unconditional
  toast — resets `remaining` to `durations[mode]` under the ticket (see
  d): a failed save leaves the timer at a FRESH full duration, so the
  retry press starts a real session; the phantom entry
  (`remaining===0` + Play) is unreachable after failure.
- **(d) the settle-CAS:** `const settleSeq = React.useRef(createFetchSeq()).current;`
  (the CS1 idiom); `complete()` mints `const settle = settleSeq.begin();`
  at POST time; the `.then`/`.catch` state writes gate on
  `settleSeq.isCurrent(settle)` (the toasts fire unconditionally — the
  user learns the outcome either way); `switchMode`, `applyPreset`, and
  `reset` each mint `settleSeq.begin()` at entry — every newer timer
  interaction invalidates the in-flight settle, so a late success can
  never clobber a newer mode/preset pick, and the catch's re-latch can
  never write a stale mode's duration over a newer pick.

**Pins (the CS1 precedent — the census cannot see wiring scope; the
behavioral legs carry the semantics):**
- (i) the census leg in `tests/script-conventions.test.ts`: the view
  contains the `React.useRef(createFetchSeq()).current` marker + the
  `settleSeq.begin()` pair + `disabled={saving}` on the start button's
  aria-label line — the drift guard.
- (ii) **the CT1a e2e leg** (`tests/e2e/resilience.spec.ts`, the
  route-interception idiom + the fake-clock drive): intercept
  `**/api/focus-sessions` (the first POST waits ~700 ms then answers
  500; later POSTs answer 201); drive the timer to 00:00
  (`page.clock.install` before goto → Start →
  `page.clock.fastForward(25*60*1000 + slack)` — the interval ticks to
  0, the completion effect fires, POST#1 in flight); then: the Start
  button must be DISABLED (RED pre-fix: enabled); a press attempt
  during the window must not produce a second POST (RED pre-fix: the
  phantom/double-log — assert the POST count stays 1 through the
  window AND past the failure's settle); after the 500 lands: the
  failure toast renders AND the clock re-latches to `25:00` (RED
  pre-fix: stays `00:00`); a Start press now runs a FRESH session
  (Pause label visible) with no new POST (RED pre-fix: the effect
  re-fires complete() → POST#2 with `durationSeconds: 1500`).
- (iii) **the CT1b e2e leg** (the ABA face, no clock needed — the
  manual early-complete path): Start → Complete (early, elapsed POST#1
  intercepted, delayed 200); during the window switch the mode tab to
  Long Break; past the settle, the Long Break tab still carries
  `aria-pressed="true"` and the clock reads the long-break duration
  (RED pre-fix: the late `.then` clobbers mode to short-break —
  Long Break un-pressed, Short Break pressed). Both legs ride the
  intercepted route — no server writes, no cleanup, no budget.

### CT2 — the forgot-password supersede transaction (B-L1)

`src/app/api/auth/forgot-password/route.ts:78-90`. The pair becomes
`await db.$transaction([ db.passwordResetToken.deleteMany({ where: { userId: user.id } }), db.passwordResetToken.create({ data: { userId: user.id, token: hashResetToken(token), expiresAt: new Date(Date.now() + TOKEN_TTL_MS) } } ]);`
— the batch array form (the BZ7/CE5 precedent; the create's input
shape unchanged, the token generation stays outside). **Pin:** the
census leg in `tests/script-conventions.test.ts` — the route source
contains `db.$transaction` with the deleteMany+create pair inside (the
cheap drift guard; a behavioral concurrency pin is not externally
drivable — the two-requests-interleaved window cannot be forced from
an e2e client; the existing forgot-flow e2e legs re-prove the flow
itself, and the census holds the wiring against silent regression).
Green-on-arrival in the census sense (the missing-pin class, the
S137/CL9 precedent — the wiring lands WITH this fix).

### CT3 — the export-panel gradient CTAs (B-L2)

`src/components/export/export-panel.tsx:172-178` (the Download JSON
anchor) and `:214-222` (the Import button). Both class strings swap the
solid pair (`bg-sf-primary … hover:bg-sf-primary-strong`) for the house
primary-CTA surface: `sf-gradient sf-gradient-shadow` (the sRGB-exact
`linear-gradient` + the v3 shadow; hover is CSS-baked into
`.sf-gradient`) — the anchor keeps `href`/`download`, the button keeps
`disabled:opacity-50` + the Spinner slot. **Pin:** the new e2e leg in
`tests/e2e/s21-data-export.spec.ts` — on `/export`, the Download JSON
anchor and the Import button each compute a `background-image`
containing `linear-gradient` (the computed-style form — RED pre-fix:
the solid CTA computes `background-image: "none"`; the assertion
accepts the serialized gradient form the engine emits). This closes
the convention residual the audit found by making the /export CTA
family visually grammatical with every other view's CTAs.

### CT4 — the budget recount set (A-L1)

Four doc surfaces + one machine leg:
- `tests/e2e/s23-import.spec.ts` header: "exactly 9" → **10/10 — zero
  headroom** (the corrected enumeration: the 400 family 4 + round-trip
  1 + re-import 1 + the panel journey 1 + the S117 cards round-trip 1 +
  the S144/CS3 merge-guard leg 1 + the S140/CO1 hostile-note leg 1 —
  the LAST one rides the demo session too; the dangling-FK probe rides
  the round-trip envelope) with the loud warning that ANY new
  demo-session import POST in this file 429s at the limiter — a future
  leg must ride a fresh user or a different chunk.
- The two inline comments: `:263` "budget #8" → #9; `:569` "budget #9"
  → #10.
- The s23 header's resilience cross-reference: "5 demo-user POSTs" →
  **9** (the corrected enumeration: the BW11 over-cap 413 + the BY3
  acceptance + the S135/CJ4+CJ5 400-message pins + the S137/CL1
  equal-times leg + the S139/CN2-empty + CN7 pins + the CS5 row-cap
  413 + the S139 cross-account demo-context POST — 9, one slot free).
- The resilience header's own budget arithmetic line + the
  `scripts/e2e-chunked-cert.sh` S144 re-tag note ("rides the demo
  session's import budget 4 → 5/10" — the honest resilience count at
  the CS5 leg's landing was 5 → now 9 after the recount; re-anchored
  per the count-the-things doctrine, the S84/AK3 header-correction
  class).
- **The census leg** (`tests/script-conventions.test.ts`): count the
  census-visible demo-session import POST call sites per file — s23's
  `request.post("/api/import/data"` occurrences === 9; resilience's
  `request.post("/api/import/data"` + `demo.request.post("/api/import/data")`
  occurrences === 9 — pinned to the recounted headers so the next
  budget-consuming commit re-anchors the docs in the same edit (the
  machine gate finding its own catch; the S144 tripwire-re-anchor
  class). The in-app panel-journey POST is documented in prose (a
  source census cannot see the app's own fetch).

### CT5 — the doc chain

README badge `2109` → **2115** + the Session-145 row; AGENTS.md
commands-table census (1500 → 1503 unit, 609 → 612 e2e, the 5-chunk
map 150+187+**91**+95+**89**) + the S145 lessons block; CLAUDE.md
counts; PAD v1.3.53 (the revision block + the §11 closure row); the
SKILL census (both sites); the vitest header re-anchor (per-file:
script-conventions +3); the cert re-tag (chunk 3 89 → 91, chunk 5 88 →
89, census 609 → 612); the plan §6 as-executed close;
`docs/session_163.md`; the worklog Session-156 entry; the
`.env.example` contract re-verified against every env var the code
reads (unchanged unless the audit found drift — it found none).

## §4 Execution order (TDD)

1. RED legs first: the CT1 census leg + the two CT1 e2e legs (against
   the pre-fix tree — the CT1a leg needs a current BUILD: `bun run
   build` before the e2e RED run), the CT2 census leg (RED against the
   pre-fix route — no `$transaction` yet), the CT3 e2e leg (RED: the
   solid CTAs compute `background-image: none`), the CT4 census leg
   (RED against the stale headers... GREEN-on-arrival is EXPECTED for
   the recount arithmetic itself — the census leg pins the CURRENT
   counts which are already true in the source; the header TEXT edits
   are the fix. The census leg lands with the recount — the
   missing-pin class).
2. Implementation: CT1 (a)→(d) in focustimer-view; CT2 the tx pair;
   CT3 the two class strings; CT4 the recount edits.
3. Interim gates: lint → typecheck → unit (expect 1503/1503).
4. The evidence capture (the S144 precedent —
   `scripts/capture-s145-evidence.mjs`): desktop + mobile drawer frames
   + the focus-timer completion-window proof (the ABA/re-latch through
   the live UI, machine-verified on the frame) + the /export gradient
   CTA frame.
5. Final tree: build → the cold 5-chunk cert (150 + 187 + 91 + 95 + 89
   = 612) → the census re-anchors → §6 close → commit + SSH push.

## §5 Riders considered, deferred (with reasons)

- **B-I1 (NODE_ENV casing):** a boot warning when NODE_ENV is set but
  not exactly one of production|development|test — the
  overdeclaredProxyHopsWarning precedent. Cheap, but it touches the
  boot-guard seam whose blast radius (instrumentation tests, the s22
  boot-guard e2e family) deserves its own audit-verified cycle; the
  documented deployment paths (Dockerfile, next start) normalize the
  value. Deferred to the next auth-family cycle.
- **B-I3 (analytics dark axis labels):** the `#666` labels are the
  S9-K reference-measured values; dark mode is the documented
  superset, so a `dark:fill-*` rider is polish, not drift. Deferred
  until a uniform dark-chart design pass (touching the reference-
  measured tokens deserves its own parity review).
- **A-I2 (the CR5/CAS double-failure edge):** pre-existing S143
  semantics; both-fail interleavings self-correct on the next
  /api/auth/me hydration. A last-confirmed-value redesign is a
  design change for its own cycle if ever wanted.
- **The carried S142/S144 deferrals:** the A-M3 stage-2 chunked
  sub-tx + resume token (needs its own ADR), the export streaming
  half, the register re-issue transactional triple (B-I2 — the BT3
  pattern when it lands), the post-sanitize entity-expansion re-check,
  the parseImportEnvelope duplication, the login stale-mint sibling,
  the delete-note popover no-auto-close rider, the unthrottled
  authenticated GET posture (B-I5 — the multi-instance PostgreSQL
  posture owns it), the prewarm/auth-verdict note (B-I6).

## §6 As-executed close

(to be filled at execution end — the honest deltas: what ran RED, what
ran green-on-arrival, what the cert said, the evidence inventory.)
