# Session 175 — the S151 cycle (Batch CZ)

The workspace was a FRESH CLONE at `b90c2f2` on `main` (the Batch CY fix
`1d4c293` + the operator's session_174 transcript commit; the sandbox
had reset between sessions). Environment re-provisioned through the
documented fresh-clone path: `bun install` (510 pkgs) · `.env` created
from the current `.env.example`
(`DATABASE_URL="file:../db/custom.db"` +
`NEXT_PUBLIC_SITE_URL=http://localhost:3000` + `AUTH_SECRET=""` — the
dev posture) · `db/` at the repo root (`db:push` + `db:seed` → the 389
KiB seeded demo account) · chromium-1243 re-provisioned after the fresh
install raised Playwright's pinned browser build · the dev daemon on
:3000.

Cold baseline (before any work): lint ✓ · tsc ✓ · the full Vitest run
**1555-shape baseline: 1547/1547** (48 files — the documented S150
final state exactly) · the dev-server preflight GREEN (hydrated,
navigation-stable) · the drawer check GREEN (**the 66th consecutive
no-Tailwind-v4-mobile-nav-bug confirmation** — backdrop oklab(0 0 0 /
0.2) + blur(4px); 288px white panels; 20 links; no footer; Escape-close
superset) · the desktop chrome probe **MATCH** (all five formal checks,
live reference login). Baseline noise: none.

The audits (Mode-C; every M/L finding re-verified by direct read by the
orchestrator before the plan was written):

- **Audit A — the Batch CY recent-changes axis** (the `1d4c293` diff):
  **0C / 0H / 0M / 0L / 0I — clean**. All three CY claims verified
  DELIVERED at the source level — CY1's multipart folderId guard
  (`rawFolder.length > 64` at files/route.ts:202, ordered before the
  `findFirst`, the no-oracle 404 copy) + CY2's schoolName trim at the
  validation ATOM (`z.string().trim().max(120).optional()` at
  validation.ts:226) + CY3's addTag drop-reason toasts
  (notes-view.tsx:440/:444). The doc census machine-verified (README
  badge 2161 + the Session-150 row, AGENTS 1547/614 + the 5-chunk map,
  CLAUDE 1547, PAD v1.3.58, the SKILL census both sites, the vitest
  header). No new attack surface.

- **Audit B — the FE/views + auth/crypto rotation** (two cycles stale —
  the S149/CX-swept axis; the named next axis in the S150 closing
  directive). The axis read was split per the S148/S149 precedent: the
  FE/views breadth scan dispatched to a read-only subagent (all 23 view
  files ≈13,320 lines + the 6 layout files + login-surface 752 +
  auth-route 39), the auth/crypto core audited by the orchestrator by
  direct read (src/lib/auth.ts 503, src/lib/server/auth.ts 183, all 11
  auth route files 1,112 lines, src/lib/api.ts 121); every M/L finding
  re-verified by direct read.

  **Auth/crypto half: 0C / 0H / 0M / 0L — clean.** Every
  historically-real family re-verified CLOSED at its anchors: the
  scrypt parameter/versioning migration (the 6-part form + the legacy
  dual-verify window + the rehash drain on successful login + the
  explicit maxmem at every call site), the login timing equalizer (the
  uniform scrypt PAIR on every branch — burnLoginScryptWork +
  burnComplement, the exhausted-account and verified-exists branches
  included), session tokens (HMAC-SHA256 + timingSafeEqual + expiry +
  the sessionVersion embedding — readSessionToken rejects a stale v,
  getCurrentUser re-checks the live row's), rate limiting (the
  process-wide containment budgets loginGlobal:/registerGlobal:/
  authBurnGlobal: 40 + per-IP + per-account keys, the exact-key
  PROTECTED_BUCKETS whitelist, the net-of-successes decrement, the
  hard-cap eviction + lazy sweep), the OTP family (peppered HMAC
  digests at rest, the timing-safe compare, the conditional single-use
  deleteMany consumption, the per-account attempt budget with the
  uniform 400, the already-verified guard, the transactional re-issue
  triple), the reset family (24-byte tokens hashed at rest, the
  sessionVersion bump, single-use, per-IP + per-account budgets),
  cookies (httpOnly + lax + the proxy-aware Secure derivation on set
  AND clear, maxAge derived from the single SESSION_TTL_MS source),
  and the hashless select + the proxy-hop client-IP contract.

  **FE/views half: 0C / 0H / 1M / 6L / 4I.** The two S149-fixed
  families re-verified FULLY LANDED at every consumer site (all
  toggle-style PATCHes ride the per-id chains — zero stale
  render-snapshot call sites remain; the study-group members ops ride
  setStudyGroupMembers); the XSS posture clean (zero
  dangerouslySetInnerHTML in scope; the Quill mount routes through the
  sanitizer; link files server-gated to ^https?://; rel="noreferrer");
  a11y thorough (aria-labels everywhere, Radix focus/Escape, the
  drawer's WCAG-2.2 focus trap, aria-live toaster); the CX4
  save-latches present. The finding, re-verified by direct read:
  **B-M1** the notes tags PATCHed ABSOLUTE JSON arrays computed from
  the RENDER-SNAPSHOT selected note (notes-view.tsx:423-452 — the
  CX2 members-fix family, one field over: two tag ops in one
  PATCH+refetch window silently lost the first, and tag adds carry no
  success toast, so the loss was fully silent). The Ls: **B-L1** the
  files view's failed initial GET settled into the permanent false
  "No files yet" EmptyState with no retry (the one view with a private
  loader — the shell's BootDataFailureBar cannot cover it; the
  CG5/CX5 class one view over); **B-L2** the practice-tests AI
  Generate silently REPLACES the edit dialog's pre-populated drafts
  (deferred — a product decision); **B-L3** a stray Complete on a
  never-started timer minted a phantom 1-second completed session
  (stats +1, a spurious row, an auto-switch to Short Break);
  **B-L4** the unit Save was silent on success while the GPA twin
  speaks; **B-L5** seven fire-and-forget delete handlers carry no
  in-flight guard (a double-click toasts the second DELETE's 404 as an
  error — deferred, a delete-family cycle); **B-L6** six noValidate
  dialogs surface Zod's default copy for empty required fields
  (deferred, a copy-family cycle). The Is: the Grid-Builder no-op (the
  S138/CM6 parity adjudication), the solver subtitle nit, the Due-Soon
  hint (the S4-K/s68 MEASURED reference parity — the hint/icon are
  measured, the value source is the clone's documented choice), and
  the anchor>button anatomy (the documented S4-Q/AJ6 parity) — all
  recorded, no action.

The plan (`docs/remediation-plan-session151.md`) written BEFORE any
source change and validated against the codebase (every anchor
re-read; the e2e-interplay probe of every spec touching the cycle's
four surfaces — the three Complete-session spec sites all START the
timer first, the s17-fresh-user "No files yet" pin rides the EMPTY
success path, no calculator spec pins a toast count), then executed
TDD-first. The plan's arithmetic was amended TWICE before execution
(the S150 precedent — validating the count math against the written
legs): the CX2-shaped missing-note no-op leg joined the functional
triple (2 → 3), and the CZ1 wiring census carried two legs (the
wiring + the saveTags-helper retirement), so the RED inventory grew
6 → 7 → **8** (3 functional + 5 census) and the unit count 1553 →
1554 → **1555**.

**The RED inventory (as it ran):** the unit REDs **8/8** — the CZ1
functional triple (data-store.test.ts: an add-then-remove inside one
window must BOTH survive — the remove's updater receives the
POST-SETTLE base `["zulu","alpha"]` and PATCHes `["alpha"]` — pre-fix
`mutations.setNoteTags` did not exist, the TypeError RED, the CX1
precedent; the failed-first-op chain-hygiene leg; the missing-note
no-op leg) + the CZ1 wiring-census pair (the updater-form wiring + the
`saveTags` absolute-array helper retirement) + the CZ2 files
failed-load census + the CZ3 phantom-session-gate census + the CZ4
unit-save-success census. Exactly the amended inventory, every census
leg failing on its designed marker (the handler slices resolved; the
markers did not exist).

**The S151 fixes:** CZ1 the note-tags updater chain — `setNoteTags(
noteId, update)` on a per-note chain map in data.ts (the CX2 updater
form verbatim: the caller declares the effect, the chain supplies the
post-settle base; the chain entry never rejects; field-scoped like its
siblings so the autosave title/content PATCHes need no serialization);
`parseNoteTags` moved to data.ts as the single source (the view rows
and the chain updater share one parsed base); the view's addTag/
removeTag declare effects (`tags.includes(tag) ? tags : [...tags, tag]`
— the idempotent belt-and-braces dedupe), the view-level guards stay
(the CY3 honest toasts), the `saveTags` helper retired. CZ2 the files
failed-load surface (the CX5 loadFailed + retryCount pattern — the
catch sets loadFailed beside the transient toast; the render's error
leg with the sf-alert-red role="alert" + Retry ordered BEFORE the
false-empty branch, so a failed GET can never prove an empty account;
a successful retry clears it). CZ3 the phantom-session gate (the gate
`!running && remaining >= durations[mode]` fires after the saving
guard and BEFORE any state change, with its reason toast; `running`
joins the useCallback deps — the CD3 discipline; the break-mode branch
rides the same gate: nothing ran, so nothing is "over"). CZ4 the
unit-save success toast (the GPA twin's mirror).

**One census tripwire, tripped and closed as designed:** the CZ1
rewire's net +5 lines moved the hue-tokens notes-view register site
700 → 705 — the anchored leg failed on the full-unit run (the
census's designed mechanism, the second consecutive cycle it has
tripped on a notes-view edit). Re-anchored with the maintenance note;
the site itself is byte-unchanged.

**Interim gates: lint ✓ · tsc ✓ (after the `selected` null guards —
the patchSelected idiom — joined the two handlers) · unit 1555/1555
(48 files, +8 exactly as designed).**

**The build + targeted e2e:** build ✓ (exit 0, output captured to
file; the four fix wirings verified shipped in the standalone chunks —
`setNoteTags` + `Couldn't load your files.` [the JSX entity compiled
to the apostrophe] + `no session to save yet` + `Conversion saved to
history`, all in the client + SSR page chunks; the 6 Turbopack
warnings are the documented db-path/instrumentation baseline — files
untouched this cycle). The targeted run — four cold-booted per-chunk
groups (the S150 chunk-mix lesson applied from the start): chunk 3's
resilience + parity-session5 **87 green**, chunk 4's calculator +
s17-fresh-user **25 green**, chunk 2's parity-session7 **57 green**,
chunk 1's parity-session8 + mobile-navigation **86 green** — 255 legs,
zero failures, zero artificial chunk mixes.

**The cold 5-chunk cert (the FINAL tree):** chunk 1's first attempt
carried ONE failure — the S120/BU7 dashboard-exam-badges leg —
root-caused as the documented P1008 SQLite socket-timeout
machine-load class by three independent signals (the exact Prisma
error line in the server log naming `prisma.exam.create()` — the
BU7 probe's own POST; the same-shape sibling exam-badge test passing
in the same run; the clean 2/2 cold re-run of the single leg), with
13 P1008 noise lines clustering in the same run (the dev daemon +
the e2e server + the sandbox's I/O contention). The clean cold
re-runs: chunk 1 **150 first-pass** (3.3 m) · chunk 2 **189
first-pass** (4.6 m) · chunk 3 **91 first-pass** (4.1 m) · chunk 4
**95 first-pass** (3.4 m) · chunk 5 **89 first-pass** (1.5 m) —
**every chunk first-pass, ZERO code flakes** = the e2e census
614/614 unchanged · **census 2169 green** (was 2161).

**Evidence:** five `docs/screenshots/151-clone-*.png` frames (the
standing desktop 235 KiB + the standing mobile drawer 65 KiB — the
66th drawer-GREEN companion frame + the Notes editor tag row 208 KiB
[CZ1's surface] + the Files view 213 KiB [CZ2's surface] + the Focus
timer 259 KiB [CZ3's surface]), self-verifying (exists, >10 KiB,
byte-diverse, dominant-share < 95%, md5-distinct — the capture
script's JSON verdict ok:true; dimensions machine-checked
1440x900 / 390x844). The CZ4 transient-toast proof rides the census
layer (the S151/CZ4 leg — the CW2 runtime-split precedent: a
transient toast is not screenshot-provable).

**Docs:** README badge/census (2161 → 2169) + the Session-151 row;
AGENTS census (1547 → 1555) + the S151 lessons block (three lessons:
a chain family is closed when the last FIELD joins it — grep for every
absolute-array mutation off render state, and the parse the chain
needs belongs at the single source; a false empty state is a claim
about the SERVER — enumerate the loaders, not just the store slices,
every private loader needs the loadFailed + Retry shape ordered before
the empty branch; a state-derived action needs a state-derived gate —
check what the derived value means at the initial state and gate on
the initial state itself); CLAUDE counts; PAD v1.3.59 (the revision
block + the four §11 closure rows); the SKILL census (both sites); the
vitest header re-anchor (+8 with the hue-tokens re-anchor note); the
cert runner unchanged (the e2e census untouched); `docs/session_175.md`
(this log); the worklog Session-162 entry; the plan §6 as-executed
close; the `.env.example` contract re-verified (no env-var reads
changed this cycle).

**Next cycle:** the rotation continues — the AI-generate replace
guard (the B-L2 rider, a product decision: the AlertDialog
replace-confirm vs append semantics) is the named candidate; the
delete double-fire latch family (B-L5, seven sites) pairs with the
noValidate hand-guard copy sweep (B-L6, six dialogs) as a
dialog/deck-honesty cycle; the A-M3 stage-2 chunked sub-tx + resume
token stays its own ADR-021 cycle (carrying the S150/B-L2 import
lock-hold finding); the db-path percent-decode stays recorded for a
db-path-family cycle.
