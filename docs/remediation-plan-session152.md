# Remediation Plan — Session 152 (Cycle 102, Batch DA)

> Status: PLANNED (pre-change record — the immutable plan; the as-executed
> close lives in §6). Written before any source change, per the standing
> doctrine ("write the cycle plan into docs/remediation-plan-sessionN.md
> BEFORE any source change").
>
> Operator directive: refresh the workspace, re-read the doc chain
> (AGENTS/CLAUDE/README/PAD/SKILL + session_175/176 +
> remediation-plan-session151 + worklog), validate against the codebase,
> audit with the repo-included skills (skills/web-application/SKILL.md the
> primary; the skills catalog for the rotation — security-and-hardening,
> agent-browser, tdd, clone-app-pat-pro), iterate toward visual/functional
> parity with omni-study1.base44.app (live reference login, mobile-nav
> attention, the Tailwind v4 bug watch), provision `.env` with
> `DATABASE_URL="file:../db/custom.db"` + the repo-root `db/`, validate the
> vitest/playwright suites, remediate TDD-first, capture evidence frames,
> update the doc chain, push via the SSH wrapper. The repo's `skills/`
> folder stays excluded from code checking, testing, and compilation.
> Proceed with best judgement on the remaining open questions (the
> operator's standing instruction).

## §0 Scope, method, cold baseline, live parity

**Workspace (a FRESH CLONE at `7fb8e23` on `main` — the Batch CZ fix
`b9b35f6` + the operator's session_176 transcript commit; the sandbox
had reset).** Environment re-provisioned through the documented
fresh-clone path: `bun install` (510 pkgs) · `.env` created from the
current `.env.example` (`DATABASE_URL="file:../db/custom.db"` +
`NEXT_PUBLIC_SITE_URL=http://localhost:3000` + `AUTH_SECRET=""` — the
dev posture) · `db/` at the repo root (`db:push` + `db:seed` → the 389
KiB seeded demo account) · chromium-1243 re-provisioned after the fresh
install raised Playwright's pinned browser build · the dev daemon on
:3000 (preflight GREEN — hydrated, navigation-stable).

**Cold baseline (before any work): lint ✓ · tsc ✓ · the full Vitest run
1555/1555 (48 files — the documented S151 final state exactly) · the
drawer check GREEN (the 67th consecutive no-Tailwind-v4-mobile-nav-bug
confirmation — backdrop oklab(0 0 0 / 0.2) + blur(4px); 288px white
panels; 20 links; no footer; Escape-close superset) · the desktop chrome
probe MATCH (all five formal checks, live reference login).** Baseline
noise: none.

**The fix scope (the S151 close's named candidates, adjudicated).** The
S151 record named two candidate sets for this cycle: the AI-generate
replace guard (the B-L2 rider — "a product decision") and the
delete-latch + noValidate pair (the B-L5 + B-L6 "dialog/deck-honesty
cycle"). Adjudication (the operator's standing best-judgement
instruction): BOTH land — the B-L2 product decision is resolved as
**replace semantics kept, confirmed** (an AlertDialog confirm when
drafts exist — the app's own delete-confirm family pattern, the
reference-matching replace behavior preserved, the destructive
irreversibility gated); the B-L5/B-L6 pair is the cycle core. The
S152-AUDIT-B riders join where verified and small (the 401-order letter
fix + the fullName trim atom); the audit's one M (the discharge model)
and the export-page budget deferral carry explicit reasons (§5).

## §1 The audits (Mode-C; every M/L finding re-verified by direct read)

### Audit A — the Batch CZ recent-changes axis (the `b9b35f6` diff)

**0C / 0H / 0M / 0L / 0I — clean.** All four CZ claims verified
DELIVERED at the source level: CZ1's `setNoteTags` chain
(`src/lib/data.ts:694` + `parseNoteTags` at `:484` as the single source
+ the notes-view rewires at `:448`/`:456` + the `saveTags` helper
retired — grep-clean) + CZ2's files failed-load surface
(`loadFailed`/`retryCount` state at files-view `:185`-`:186`, the alert
+ Retry leg ordered before the false-empty branch at `:504`) + CZ3's
phantom-session gate (focustimer-view `:143`, byte-verified
`durations[mode]` via od — the display-pipeline `[m`-eating artifact
produced the documented phantom "durationsode]" in tool output; the
`running` dep joined the useCallback) + CZ4's unit-save success toast
(calculator-view `:684`). The doc census machine-verified: README badge
2169 ✓ · AGENTS 1555 ✓ · CLAUDE 1555 ✓ · PAD v1.3.59 ✓ · SKILL head
(2169/1555/614) ✓ · the vitest header (S151/CZ re-anchor) ✓ — with FIVE
stale prose sites found (the DA6 rider set, §5): README:108 + README:167
("1513" — an S146-era unit count, three cycles stale), README:184 (the
import cap "10 MiB" — doubly stale: the actual `IMPORT_MAX_BYTES` is 64
MiB since S137/CL2), SKILL:630 (the §11 green-state line still carrying
the S150 figures "1547 unit … 2161 green" under an S151/CZ label), and
SKILL:138 (the CD3-posture prose "the 1449+605 test suites" — a
much-older census). No new attack surface in the diff.

### Audit B — the entities/factory + data-layer rotation (two cycles stale — the S150/CY-swept axis)

The axis read followed the S150 precedent: the full read of
`src/lib/server/entities.ts` + `http.ts` + `auth.ts` +
`src/lib/validation.ts` + `db-path.ts` + `group-members.ts` + the 615-line
schema + all route files under `src/app/api/**`, dispatched as a
read-only subagent against the web-application skill's §4/§5/§6/§7/§16
rubric; every M/L finding re-verified by direct read by the orchestrator.

**Verdict: 0C / 0H / 1M / 2L / 3I.** All eight historically-real
families re-verified CLOSED at their anchors (ownership scoping +
P2025→404, route authz, error taxonomy, the CR7 delegate pattern,
bounded readers, the CR3 own-keys patch discipline, rate-limit keying
incl. the full `write:`/`upload:`/`ai:`/`export:`/`import:`/`rum:`
budget census, the Zod boundary across body/route-param/multipart —
query params grep-verified CONSUMED NOWHERE). All seven past fixes on
the S150-context list verified landed (CY1, CY2, CW1, CW2, the S144
import caps, the CP3 tx restructure, the CU1 mime guard). The findings:

- **B-M1** (Reasoned — mechanics verified by direct read at
  `src/lib/auth.ts:312-326` + login `:147-149` + the four authBurn
  routes): the aggregate CPU-containment budgets (`loginGlobal:` /
  `authBurnGlobal:`, 40/15-min) are 1:1 dischargable by
  attacker-mintable successes under the documented default posture
  (forgeable first XFF hop + in-band OTP + open registration →
  scripted own-credentials alternate fail-on-victim +1 with
  self-success −1; the aggregate never trips; each cycle burns the full
  synchronous scrypt pair — ~25× the intended containment rate). The
  per-account guessing bounds hold (`loginAcct:${victim.id}` is
  resettable only by a successful login AS the victim) — this is not an
  account-takeover vector; it is a CPU-availability containment gap.
  **Deferred to its own rate-limit-model cycle (§5)** — the fix is a
  design change to the discharge model with e2e budget-arithmetic
  interplay (the s14-C1 exhaustion pin + the shared-login design), not a
  rider.
- **B-L1** (Verified at `http.ts:388-405`): `withUserParams` applies the
  CN11 id bound BEFORE `requireUser()` — an unauthenticated request with
  a malformed (>64-char) id answers 404, not the documented 401
  envelope (`http.ts:433` "unauthenticated requests still 401" — false
  on this path). Shape-only (no DB read; no data exposure); the letter
  of the contract. **Fixed as DA4.**
- **B-L2** (Verified at `src/app/export/page.tsx:104-113`): the `/export`
  page renders the full envelope (20-table read + full serialize) per
  view with no rate budget while its route twin rides `export:` 10/15-min
  — a scripted session loops the page door at line rate. **Deferred
  (§5)**: the e2e interplay study (s21 visits `/export` ≥3× + s23 ≥2×
  per boot; adding the page to the SHARED `export:` key risks tripping
  mid-suite) needs its own budget-arithmetic pass — the dedicated-key
  design + cert verification.
- **B-I1** (Verified at `validation.ts:134-138`): `registerSchema.fullName`
  is the one remaining untrimmed text field at a write boundary (the
  trim-at-the-atom doctrine's last gap — boundedTitle/emailField/
  schoolName/members/upload names all trim). **Fixed as DA5.**
- **B-I2** (Verified): `force-dynamic` on 1 of 61 route files (health
  only) — the risk it guards is structurally mitigated (every handler
  resolves the session through `cookies()`, a dynamic API). **Adjudicated
  as documented convention** (recorded here + the session log; the
  60-file mechanical diff adds churn with zero runtime change under
  current versions).
- **B-I3** (Verified): audit-context drift — `IMPORT_MAX_BYTES` is 64 MiB
  (S137/CL2), not the S144-era 25 MiB the rotation context cited; folded
  into the DA6 doc fix (README:184's "10 MiB" is doubly stale).

**The S151-carried FE/views findings (the named fix set):**

- **B-L5** (Verified at all seven sites — events-view `:204-212`,
  exams-view `:210-218`, assignments-view `:177-185`, flashcards-view
  `:208-224` [removeDeck + removeCard], notes-view `:380-396`
  [removeNote + removeNotebook]): seven fire-and-forget delete handlers
  carry no in-flight guard — a double-click fires the second DELETE into
  the first's window and toasts its 404 as an error (the delete-family
  race; the four confirm-gated deletes — grades/subjects/holidays/groups
  — already latch via the `setDeleting(null)` pre-call pattern and are
  out of scope). **Fixed as DA1.**
- **B-L6** (Verified across the seven noValidate forms — events `:425`,
  assignments `:416`, exams `:429`, notes `:972`, timetable `:559`,
  flashcards deck `:738` + card `:816`): the empty-required-field submit
  goes to the server and surfaces Zod's raw library copy through the
  dialog's `setError` (e.g. `title: Too small: expected string to have
  >=1 characters` — `formatZodError` passes the default issue copy) —
  the files-view Add-Link dialog already hand-guards (S127/CB17 "Name
  and URL are both required."), the pattern this sweep generalizes.
  **Fixed as DA2.**
- **B-L2/S151** (Verified at practicetests-view `:220`):
  `setDrafts(drafts)` silently REPLACES the edit dialog's pre-populated
  drafts (an editing user's whole question list) with no confirmation.
  **Fixed as DA3** (the product decision adjudicated in §0).

## §2 DA1 + DA2 — the dialog/deck-honesty pair (the cycle core)

### DA1 — the seven-site delete double-fire latch (B-L5)

Per view, a `deletingIds: Set<string>` state; each remove handler:

```tsx
const [deletingIds, setDeletingIds] = React.useState<ReadonlySet<string>>(new Set());
const remove = async (id: string) => {
  if (deletingIds.has(id)) return;            // the latch — the in-flight window is a no-op
  setDeletingIds((prev) => new Set(prev).add(id));
  try {
    await deleteEvent(id);
    toast.success("Event deleted.");
  } catch (err: unknown) {
    toast.error(err instanceof ApiError ? err.message : "Delete failed.");
  } finally {
    setDeletingIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
  }
};
```

The `finally` removal keeps retry honest (a FAILED delete re-arms; a
successful one removes the row via the store refresh). The latch is the
load-bearing fix; the plain-button call sites (events `:402`, the
exams/assignments twins, flashcards card `:711`) additionally gain
`disabled={deletingIds.has(id)}` + the `disabled:opacity-50` feedback —
the menu-item sites (notes `:653`/`:843`, flashcards deck `:588`/`:670`)
close their Popover on click, so the handler latch alone covers them.

### DA2 — the noValidate hand-guard copy sweep (B-L6)

Each of the seven submit handlers gains the required-field guard AFTER
the busy guard and BEFORE the try (the CB17 pattern — the copy names
the field, never the library):

| Form | Required-empty fields | The guard copy |
|---|---|---|
| events `submit` | `title`, `startDate` | "Please enter a title." / "Please pick a start date." |
| assignments `submit` | `title` (dueDate is optional) | "Please enter a title." |
| exams `submit` | `title`, `date` | "Please enter a title." / "Please pick an exam date." |
| notes `submit` | `name` (note title / notebook name) | "Please enter a name." |
| timetable `submit` | `name` (`startTime`/`endTime` carry dialog defaults; still guarded — "Please pick a start/end time.") | "Please enter a name." |
| flashcards `submitDeck` | `name` | "Please enter a deck name." |
| flashcards `submitCard` | `front`, `back` | "Please enter the card front." / "Please enter the card back." |

The guards `setError(...)` into the dialog's existing inline error slot
(the a11y path the ApiError branch already rides) and `return` — no
network round-trip for an empty form, no raw Zod copy reachable from
the dialog surface. The server's Zod boundary stays (the API door keeps
its validation — the guard is the dialog's hand-copy mirror).

## §3 DA3 — the AI-generate replace-confirm (B-L2, the product decision)

The adjudication: **replace semantics kept, gated by an AlertDialog
confirm** — matching the app's delete-confirm family (the reference's
own generate behavior replaces; the clone's superset duty is to make
the destruction explicit, not to change the semantics).

- A `replaceConfirmOpen` state; the Generate button's onClick gates:
  `drafts.length > 0` → `setReplaceConfirmOpen(true)` (the confirm
  BEFORE the AI call — a cancel never burns the `ai:` budget);
  otherwise `void generateQuestions()` directly (the fresh-test path is
  unchanged — no confirm on an empty editor).
- The AlertDialog (the view's existing delete-confirm template at
  `:859`): title "Replace current questions?", description naming the
  count ("Generating new questions will replace the {N} questions
  currently in the editor."), Cancel + "Replace" actions; the action
  runs `void generateQuestions()` and closes.
- `generateQuestions` itself is unchanged (the confirm gates entry, not
  the flow — the s127-CB3 API-level pin and the `generating` latch stay
  intact).

## §4 DA4 + DA5 — the server-side riders (the audit's verified small set)

### DA4 — the withUserParams 401-order (B-L1)

`requireUser()` moves BEFORE the CN11 id bound in `withUserParams`
(`http.ts:388-405`): unauthenticated callers answer the 401 envelope on
EVERY path (the documented contract at `:433` becomes true again); the
no-oracle 404 semantics for authed callers are unchanged (a >64-char id
still cannot exist). The s127-CB7 anon probe (a VALID id → 401) is
unaffected; the CN11 bound itself stays (its census leg untouched).

### DA5 — the registerSchema fullName trim at the atom (B-I1)

`z.string().max(100).optional().default("")` →
`z.string().trim().max(100).optional().default("")` at
`validation.ts:135` — the CY2 schoolName shape verbatim (Zod 4 orders
`.trim()` before `.max()`; the transformed key survives the parsed
object). One canonical source: the register route, and any future
consumer.

## §5 DA6 — the doc-drift riders + the count-claims pins; scoping and deferrals

### DA6 — five stale prose sites + four self-anchoring census pins

The doc fixes (landing with the cycle's own re-anchored counts —
1578 unit / 614 e2e / 2192 census after this plan's +23 legs):

1. README:108 — "(1513 tests, 48 files)" → "(1578 tests, 48 files)"
2. README:167 — "Vitest — 1513 unit tests" → "1578 unit tests"
3. README:184 — the `/api/import/data` row's "10 MiB body cap" → the
   actual 64 MiB (`IMPORT_MAX_BYTES` since S137/CL2)
4. SKILL:630 — "1547 unit ✓ … 614 e2e ✓ (2161 green)" → the current
   counts (re-anchored at S152/DA)
5. SKILL:138 — "the 1449+605 test suites" → the current census prose

The pins (script-conventions.test.ts, the CQ6 cross-read family —
self-anchoring: each leg derives the expected value from the SAME
sources the docs should cite, so the next count change forces the doc
update in the same commit or the leg fails):

1. **The README unit-count pin**: both README sites (the tree diagram's
   "Vitest unit layer (N tests, M files)" + the testing section's
   "Vitest — N unit tests") must equal the vitest.config.ts header's
   counts (the `(\d+) files \/ (\d+) tests` match).
2. **The README import-cap pin**: the `/api/import/data` row's "N MiB
   body cap" must equal `IMPORT_MAX_BYTES` from data-import.ts
   (converted bytes→MiB).
3. **The SKILL green-state pin**: the §11 "Current green state" line's
   "N unit ✓ … M e2e ✓ (T green)" must satisfy N = the vitest header
   count, M = the cert script's expected total, T = N + M.
4. **The SKILL prose-census pin**: the CD3-posture line's "N+M test
   suites" must equal the same derived pair.

### Scoping and deferrals (recorded, with reasons)

- **B-M1 (the discharge model)** — its own rate-limit-model cycle: the
  fix is a design change (the CN9 never-discharge shape re-sized for
  the e2e shared-login arithmetic, or a gated/capped discharge) with
  live e2e budget interplay (the s14-C1 exhaustion pin + the one-login
  design + the fresh-user register budget). Not a rider.
- **B-L2/audit (the export-page budget)** — the dedicated-key design +
  the cert arithmetic study (s21 + s23 visit `/export` ≥5× per boot;
  the shared-key variant risks mid-suite 429s).
- **B-I2 (force-dynamic)** — adjudicated as documented convention (the
  `cookies()` structural mitigation); recorded here and in the session
  log.
- **The A-M3 ADR-021 stage-2 cycle** and the **db-path percent-decode**
  stay recorded (the standing deferrals).
- **B-L5's confirm-gated cousins** (grades/subjects/holidays/groups)
  already latch via `setDeleting(null)` — out of scope by design.

## §6 As-executed close

**Executed as planned (the RED inventory exactly as designed: 23/23).**
The DA1 latch heptet + the DA2 hand-guard heptet + the DA3
replace-confirm pair + the DA4 401-order census + the DA5 functional
pair + the DA6 doc-pins quartet — every leg failing on its designed
marker pre-fix (the latch "membership guard exists" absence, the guard
copy absence, the confirm-state absence, the auth-after-bound order,
the padded fullName returned verbatim, the stale prose values).

**Two census tripwires tripped and closed as designed** (the third
consecutive cycle for the anchored legs): the hue-tokens registers
re-anchored flashcards-view 394 → 437 and notes-view 705 → 736 (the
DA1/DA2 edits added lines above the sites; the sites byte-unchanged).
Two RED-leg authoring bugs fixed DURING the RED phase (before the
implementation landed): the handler-extraction close anchor `\n  };`
(a nested payload object's `    };` must not end the slice early) and
the handler-relative finallyAt index.

**Interim gates: lint ✓ · tsc ✓** (after the AlertDialog relocated
into the TestDialog scope — the first placement compiled into the
outer component where drafts/generateQuestions do not exist; the
typecheck caught it) **· unit 1578/1578** (48 files, +23 exactly as
designed: validation +2, script-conventions +21).

**Build + targeted e2e.** Build ✓ (exit 0; the 6 documented warnings;
every fix wiring verified shipped in the standalone chunks — the copy
markers in the client chunks, the minifier renaming the deletingIds
identifier so the census legs + the same files' markers carry the
wiring proof). The targeted run — four cold-booted per-chunk groups:
chunk 2's parity-session7 + s14-hardening **83 green**; chunk 4's
s17-fresh-user + calculator **24 green + 1 P1008 flake** (the
accent-recolor leg; 6 P1008 lines clustering the run; the clean 2/2
cold re-run at 2.5s); chunk 1's parity-session8 + mobile-navigation
**85 green + 1 P1008 flake** (the BZ3 create-POST 500; the exact
`prisma.notebook`/`rumEvent` P1008 lines captured; the clean 2/2 cold
re-run at 1.8s); chunk 3's parity-session5 **47 green** — 241 legs,
both flakes root-caused three ways and closed.

**The cold 5-chunk cert (the FINAL tree).** Chunk 1's first attempt
carried the same BZ3 leg failing (a 500 on the create POST, no P1008
lines in the runner's filtered log) — root-caused as the same
machine-load class by the three-granularity re-verification: the
isolated leg 2/2 clean cold · parity-session8 alone 67/67 clean cold
· the EXACT chunk-1 file combination re-run directly **150/150
clean** (with the Group-3 twin of the same failure having captured
the exact P1008 Prisma error naming the call). The clean cold runs:
chunk 2 **189 first-pass** · chunk 3 **91 first-pass** · chunk 4
**95 first-pass** · chunk 5 **89 first-pass** — **the e2e census
614/614 unchanged · census 2192 green** (was 2169).

**Evidence.** Five `docs/screenshots/152-clone-*.png` frames (the
standing desktop + mobile drawer + the Events dialog with the
hand-guard's inline "Please enter a title." error — DA2's visible
proof, the guard text awaited before the frame — + the Flashcards
deck grid [DA1] + the practice-test editor with the gated Generate
[DA3]), self-verifying (ok:true; dimensions machine-checked
1440x900 / 390x844). The DA4/DA5 proofs ride the unit layer (the CW2
runtime-split precedent).

**Docs.** README badge/census (2169 → 2192) + the Session-152 row +
the two unit-count sites + the two import-cap sites; AGENTS census
(1555 → 1578) + the S152 lessons block (four lessons); CLAUDE counts;
PAD v1.3.60 (the revision block + the six §11 closure rows); the
SKILL census (both sites + the CD3 prose); the vitest header
re-anchor (+23); the cert runner unchanged; `docs/session_177.md`;
the worklog Session-163 entry; this close; the `.env.example`
contract re-verified (no env-var reads changed this cycle).
