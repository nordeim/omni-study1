# Session 177 — the S152 cycle (Batch DA)

The workspace was a FRESH CLONE at `7fb8e23` on `main` (the Batch CZ fix
`b9b35f6` + the operator's session_176 transcript commit; the sandbox
had reset between sessions). Environment re-provisioned through the
documented fresh-clone path: `bun install` (510 pkgs) · `.env` created
from the current `.env.example`
(`DATABASE_URL="file:../db/custom.db"` +
`NEXT_PUBLIC_SITE_URL=http://localhost:3000` + `AUTH_SECRET=""` — the
dev posture) · `db/` at the repo root (`db:push` + `db:seed` → the 389
KiB seeded demo account) · chromium-1243 re-provisioned after the fresh
install raised Playwright's pinned browser build · the dev daemon on
:3000 (preflight GREEN — hydrated, navigation-stable).

Cold baseline (before any work): lint ✓ · tsc ✓ · the full Vitest run
**1555-shape baseline: 1555/1555** (48 files — the documented S151
final state exactly) · the drawer check GREEN (**the 67th consecutive
no-Tailwind-v4-mobile-nav-bug confirmation** — backdrop oklab(0 0 0 /
0.2) + blur(4px); 288px white panels; 20 links; no footer; Escape-close
superset) · the desktop chrome probe **MATCH** (all five formal checks,
live reference login). Baseline noise: none.

The audits (Mode-C; every M/L finding re-verified by direct read by the
orchestrator before the plan was written):

- **Audit A — the Batch CZ recent-changes axis** (the `b9b35f6` diff):
  **0C / 0H / 0M / 0L / 0I — clean**. All four CZ claims verified
  DELIVERED at the source level — CZ1's `setNoteTags` chain
  (data.ts:694 + `parseNoteTags` at :484 as the single source + the
  notes-view rewires at :448/:456 + the `saveTags` helper retired,
  grep-clean) + CZ2's files failed-load surface (loadFailed/retryCount
  at :185-:186, the alert + Retry leg ordered before the false-empty
  branch) + CZ3's phantom-session gate (focustimer-view:143 — the
  `durations[mode]` line BYTE-VERIFIED via od; the display pipeline
  eats `[m` as an ANSI reset and renders `durationsode]`, the documented
  S151 false-alarm class) + CZ4's unit-save toast (calculator-view:684).
  The doc census machine-verified: README badge 2169 ✓ · AGENTS 1555 ✓
  · CLAUDE 1555 ✓ · PAD v1.3.59 ✓ · SKILL head ✓ · the vitest header ✓
  — with **five stale PROSE sites found** (the DA6 rider set): README:108
  + README:167 at an S146-era "1513", README:184's import cap at a
  pre-CL2 "10 MiB" (doubly stale — `IMPORT_MAX_BYTES` has been 64 MiB
  since S137/CL2), the SKILL §11 green-state line carrying S150 figures
  under an S151/CZ label, and the SKILL CD3-posture prose at
  "1449+605".

- **Audit B — the entities/factory + data-layer rotation** (two cycles
  stale — the S150/CY-swept axis). The full read dispatched to a
  read-only subagent per the S148/S149/S151 precedent (entities/http/
  auth-server/validation/db-path/group-members + the 615-line schema +
  all API route files, against the web-application skill's §4/§5/§6/§7/
  §16 rubric), every M/L finding re-verified by direct read.

  **Verdict: 0C / 0H / 1M / 2L / 3I.** All eight historically-real
  families re-verified CLOSED (ownership scoping + P2025→404, route
  authz, error taxonomy, the CR7 delegate pattern, bounded readers,
  the CR3 own-keys patch discipline, the rate-limit keying census incl.
  every budget family, the Zod boundary across body/route-param/
  multipart — query params grep-verified consumed NOWHERE); all seven
  past fixes on the S150-context list verified landed (CY1, CY2, CW1,
  CW2, the S144 import caps, the CP3 tx restructure, the CU1 mime
  guard). The findings: **B-M1** the aggregate CPU-containment
  discharge model (`loginGlobal:`/`authBurnGlobal:` net-of-successes)
  is 1:1 dischargable by attacker-mintable successes under the
  documented default posture (forgeable first XFF hop + in-band OTP +
  open registration → scripted own-credentials alternate fail-on-victim
  +1 with self-success −1; ~25× the containment rate; the per-account
  guessing bounds HOLD — not an account-takeover vector; Reasoned —
  mechanics verified by direct read at auth.ts:312-326 + login:147-149
  + the four authBurn routes). **Deferred to its own rate-limit-model
  cycle** — the fix is a design change with e2e budget-arithmetic
  interplay (the s14-C1 exhaustion pin + the one-shared-login design),
  not a rider. **B-L1** `withUserParams` applied the CN11 id bound
  BEFORE `requireUser()` — an unauthenticated >64-char-id request
  answered 404, contradicting the wrapper's own "unauthenticated
  requests still 401" contract (Verified; shape-only, no data
  exposure). **Fixed as DA4.** **B-L2** the `/export` page renders the
  full envelope (20-table read + serialize) per view unbudgeted while
  its route twin rides `export:` 10/15-min (Verified). **Deferred** —
  the s21/s23 page-visit interplay (≥5 visits/boot) needs its own
  budget-arithmetic pass. **B-I1** `registerSchema.fullName` was the
  last untrimmed text atom (Verified). **Fixed as DA5.** **B-I2**
  `force-dynamic` on 1 of 61 routes — adjudicated as documented
  convention (the `cookies()` structural mitigation). **B-I3**
  `IMPORT_MAX_BYTES` is 64 MiB (context refresh — folded into DA6).

- **The S151-carried FE/views findings** (the named fix set): **B-L5**
  the seven fire-and-forget delete handlers (events:206, exams:212,
  assignments:179, flashcards removeDeck/removeCard, notes
  removeNote/removeNotebook — all Verified by direct read; the four
  confirm-gated deletes already latch via the `setDeleting(null)`
  pre-call pattern and were out of scope by design). **B-L6** the
  noValidate dialogs surfacing Zod's raw copy (seven forms across six
  views — events/assignments/exams/notes/timetable/flashcards
  deck+card; the files-view Add-Link dialog already hand-guards per
  S127/CB17). **B-L2/S151** the AI-generate silent replace
  (practicetests-view:220).

The plan (`docs/remediation-plan-session152.md`) written BEFORE any
source change and validated against the codebase (every anchor re-read;
the e2e-interplay probe of every spec touching the cycle's surfaces —
the parity-session7 practice-test dialog leg asserts the Generate
button's VISIBILITY only, the s127-CB3 generate pin drives the API
directly, the s127-CB7 anon probe uses a VALID id so the 401-order
reorder is safe, no spec double-clicks a delete, no spec pins the raw
Zod dialog copy). The product decision adjudicated per the operator's
standing best-judgement instruction: **the B-L2 replace-confirm —
replace semantics KEPT, gated by an AlertDialog when drafts exist**
(the app's delete-confirm family pattern; the confirm BEFORE the AI
call so a cancel never burns the `ai:` budget; the fresh-test path
unchanged).

**The RED inventory (as it ran):** the unit REDs **23/23** — the DA1
latch heptet (one census leg per site, each failing on "the membership
guard exists" — the handler found by its signature, the latch absent)
+ the DA2 hand-guard heptet (each failing on its designed marker copy)
+ the DA3 replace-confirm pair + the DA4 401-order census + the DA5
functional pair (validation.test.ts — the padded fullName returned
verbatim pre-fix) + the DA6 doc-pins quartet (each failing on the
stale prose values). Exactly the planned inventory.

**The S152 fixes:** DA1 the seven-site delete double-fire latch — the
per-view `deletingIds: ReadonlySet<string>` state; each remove handler
guards on membership, adds on start, and removes in the finally (a
FAILED delete re-arms for retry; a successful one removes the row via
the store refresh); the plain-button sites (events/exams/flashcards
cards) additionally gain `disabled={deletingIds.has(id)}` +
`disabled:opacity-50`; the menu-item sites (notes Popover, flashcards
deck menu, assignments dropdown) close on click, so the handler latch
alone covers them. DA2 the noValidate hand-guard sweep — each of the
seven submit handlers gains the required-field guard AFTER the busy
guard and BEFORE `setBusy(true)` (an early return after arming the
latch strands it — the finally lives inside the skipped try), with the
copy naming the FIELD (the CB17 tone): "Please enter a title." /
"Please pick a start date." / "Please pick an exam date." / "Please
enter a name." / "Please pick a start/end time." / "Please enter a
deck name." / "Please enter the card front/back."; the guards mirror
the SCHEMA's required set (dueDate is optional — only the title guards
there); the server's Zod boundary stays. DA3 the AI-generate
replace-confirm — the `replaceConfirmOpen` state; the Generate click
gates on `drafts.length > 0` → the confirm opens (the AlertDialog
inside TestDialog — the drafts/generateQuestions scope), else
`generateQuestions()` runs directly; the confirm's Replace action
closes the dialog and runs the generate (replace semantics kept,
confirmed). DA4 the withUserParams 401-order — `requireUser()` moved
before the CN11 id bound (the documented 401 contract true again; the
no-oracle 404 for authed callers unchanged). DA5 the registerSchema
fullName trim at the atom (`z.string().trim().max(100).optional()
.default("")` — the CY2 shape). DA6 the five doc sites corrected
(README:108/:167 → 1578; README:52/:184 → 64 MiB; SKILL:630 →
1578/614/2192; SKILL:138 → 1578+614; the historical Session-23 row's
"10 MiB" left verbatim — session rows record their own era) + four
SELF-ANCHORING count-claims pins (the CQ6 cross-read family: the
README unit-count sites vs the vitest header; the import-cap prose vs
`IMPORT_MAX_BYTES` itself [the byte EXPRESSION evaluated]; the SKILL
green-state line vs the header + the cert map; the CD3 prose vs the
same pair).

**Two census tripwires tripped and closed as designed:** the
hue-tokens registers re-anchored (flashcards-view 394 → 437,
notes-view 705 → 736 — the DA1/DA2 edits added lines above the sites;
the third consecutive cycle the anchored legs have tripped on
view-line drift, the designed move-detector). Two RED-leg authoring
bugs found and fixed DURING the RED phase (the handler-extraction
anchor `\n  };` so a nested payload object's `    };` cannot end the
slice early; the handler-relative finallyAt index) — the legs were
hardened before the implementation landed, not after.

**Interim gates: lint ✓ · tsc ✓ (after the AlertDialog relocated into
the TestDialog scope — the first placement compiled into the outer
component where drafts/generateQuestions do not exist) · unit
1578/1578 (48 files, +23 exactly as designed).**

**The build + targeted e2e:** build ✓ (exit 0; the 6 documented
db-path/instrumentation warnings; every fix wiring verified shipped in
the standalone chunks — the DA2/DA1 copy markers present in the client
chunks [the minifier renames the deletingIds identifier, so the
census legs + the same files' copy markers are the wiring proof], the
register/http server chunks compiled). The targeted run — four
cold-booted per-chunk groups: chunk 2's parity-session7 +
s14-hardening **83 green**, chunk 4's s17-fresh-user + calculator
**24 green + 1 P1008 flake** (the accent-recolor leg timed out at 45s
with 6 P1008 socket-timeout lines clustering the run's webServer log —
root-caused three ways: the exact Prisma error lines, the same-shape
theme siblings passing in the same run, the clean 2/2 cold re-run at
2.5s), chunk 1's parity-session8 + mobile-navigation **85 green + 1
P1008 flake** (the BZ3 notebook leg's create POST 500'd — the exact
`prisma.notebook`/`rumEvent` P1008 lines captured in the log; the
same-shape siblings passing; the clean 2/2 cold re-run at 1.8s), and
chunk 3's parity-session5 **47 green** — 241 legs, both flakes
root-caused and closed.

**The cold 5-chunk cert (the FINAL tree):** chunk 1's first attempt
carried ONE failure — the same BZ3 leg, a 500 on the create POST —
root-caused as the same machine-load class by the three-granularity
re-verification (the isolated leg 2/2 clean · parity-session8 alone
67/67 clean cold · the EXACT chunk-1 file combination re-run directly
**150/150 clean**; the Group-3 twin of the same failure had captured
the exact P1008 Prisma error naming the call). The clean cold runs:
chunk 2 **189 first-pass** (4.6 m) · chunk 3 **91 first-pass**
(4.2 m) · chunk 4 **95 first-pass** (3.3 m) · chunk 5 **89
first-pass** (1.5 m) — **the e2e census 614/614 unchanged · census
2192 green** (was 2169).

**Evidence:** five `docs/screenshots/152-clone-*.png` frames (the
standing desktop 234 KiB + the standing mobile drawer 64 KiB — the
67th drawer-GREEN companion frame + the Events create dialog with the
hand-guard's inline "Please enter a title." error 128 KiB [DA2's
visible proof — the capture script awaited the guard text before the
frame] + the Flashcards deck grid 236 KiB [DA1's surface] + the
practice-test editor with one draft question and the gated Generate
99 KiB [DA3's surface]), self-verifying (exists, >10 KiB,
byte-diverse, dominant-share < 95%, md5-distinct — the capture
script's JSON verdict ok:true; dimensions machine-checked
1440x900 / 390x844). The DA4/DA5 proofs ride the unit layer (the
CW2 runtime-split precedent: a status-code order and a schema
transform are not screenshot-provable).

**Docs:** README badge/census (2169 → 2192) + the Session-152 row +
the two stale unit-count sites + the two stale import-cap sites;
AGENTS census (1555 → 1578) + the S152 lessons block (four lessons:
a count claimed in prose rots as fast as one in a badge — pin the
prose to the source it cites; a hand-guard belongs BEFORE the busy
latch and its copy names the FIELD; a destructive replace is a delete
wearing a different verb — gate it with the same confirm family, and
the confirm belongs BEFORE the expensive call; auth precedes shape at
every wrapper); CLAUDE counts; PAD v1.3.60 (the revision block + the
six §11 closure rows); the SKILL census (both sites + the CD3 prose);
the vitest header re-anchor (+23 with the register re-anchor note);
the cert runner unchanged (the e2e census untouched);
`docs/session_177.md` (this log); the worklog Session-163 entry; the
plan §6 as-executed close; the `.env.example` contract re-verified
(no env-var reads changed this cycle).

**Next cycle:** the rotation continues — the **B-M1 rate-limit-model
cycle** is the named candidate (the discharge-model design change with
the e2e budget-arithmetic study: the CN9 never-discharge shape
re-sized, or a gated/capped discharge); the **export-page budget**
(B-L2-audit: the dedicated `exportPage:` key + the s21/s23 page-visit
cert arithmetic) pairs with it as the budget-family cycle; the
A-M3 stage-2 chunked sub-tx + resume token stays its own ADR-021
cycle (carrying the S150/B-L2 import lock-hold finding); the db-path
percent-decode stays recorded for a db-path-family cycle.
