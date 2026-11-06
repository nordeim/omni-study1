# Remediation Plan — Session 150 (Cycle 100, Batch CY)

> Status: PLANNED (pre-change record — the immutable plan; the as-executed
> close lives in §6). Written before any source change, per the standing
> doctrine ("write the cycle plan into docs/remediation-plan-sessionN.md
> BEFORE any source change").
>
> Operator directive: refresh the workspace, re-read the doc chain
> (AGENTS/CLAUDE/README/PAD/SKILL + session_171/172 +
> remediation-plan-session149 + worklog), validate against the codebase,
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

**Workspace (a FRESH CLONE at `669c83e` on `main` — the Batch CX fix
`3410ff1` + the operator's session_172 transcript commit; working tree
clean).** The sandbox had reset, so the environment was re-provisioned
through the documented fresh-clone path: `bun install` (510 pkgs) ·
`.env` created from the current `.env.example`
(`DATABASE_URL="file:../db/custom.db"` +
`NEXT_PUBLIC_SITE_URL=http://localhost:3000` + `AUTH_SECRET=""` — the
dev posture) · `db/` at the repo root (`db:push` + `db:seed` → the 389
KiB seeded demo account) · chromium-1243 re-provisioned after the
fresh install raised Playwright's pinned browser build · the dev
daemon on :3000.

**Cold baseline (before any work):**

| Gate | Result |
|---|---|
| `bun run lint` | ✓ 0 errors |
| `bun run typecheck` | ✓ 0 errors |
| `bun run test` (Vitest) | ✓ 1543/1543 (48 files) — the documented S149 final state exactly |
| `bun scripts/dev-server-preflight.mjs` | GREEN — hydrated, navigation-stable (1 navigation, no reload loop) |
| `node scripts/drawer-check-s14.mjs` (live reference login) | GREEN — **the 65th consecutive no-Tailwind-v4-mobile-nav-bug confirmation** (backdrop oklab(0 0 0 / 0.2) + blur(4px); 288px white panels; 20 links; no footer; Escape-close superset) |
| `node scripts/parity-probe-s142.mjs` (live reference login; REF_PROBE_* exported) | **DESKTOP CHROME: MATCH** — all five formal checks (sidebar outer width 260, nav link count 20, first-links order, mainX 260, mainWidth 1180) |

**Baseline noise observed (recorded, not findings):** none.

**Probes run BEFORE the plan (the doctrine — probe, don't guess):** the
fresh-environment provisioning leg itself (dev daemon alive, db seeded,
gates green), the reference login + drawer + parity probes above, the
Zod-4 trim-ordering scratch verification (trim applies BEFORE `.max()`,
whitespace-only → `""`, `undefined` passes — deleted after the probe),
plus every audit M/L finding re-verified by direct read of the current
tree before this plan was written (the anchors are in §1).

## §1 The audits (Mode-C, read-only; every M/L finding re-verified by direct read)

Per the S149 closing directive — "the rotation continues — the
entities/factory + data-layer axis, or the A-M3 stage-2 chunked sub-tx
+ resume token (its own ADR-021 cycle, now carrying the B-L2 import
lock-hold finding)" — this cycle takes the axis. The A-M3 family stays
its own ADR-021 cycle (the standing scoping doctrine; §5).

1. **Audit A — the Batch CX recent-changes audit** (the `3410ff1` diff
   itself: the CX1 sibling-toggle chains [the store mutations + the
   four view rewires], the CX2 members chain [the updater-form mutation
   + the add/remove rewires + the savingMember latch retention], the
   CX3 resend transport branch, the CX4 calculator save guards [the `=`
   re-press no-op + the GPA/unit latches], the CX5 settings me-fetch
   failure surface, the capture script, the vitest header, the doc
   chain, every delivered test leg): **0C / 0H / 0M / 0L / 0I —
   clean**. All five CX claims verified **DELIVERED** at the source
   level — CX1 (`toggleTaskMyDay`/`toggleTaskImportant` riding the
   shared `taskToggleChains` map at src/lib/data.ts:510-543 + the four
   call sites tasks-view.tsx:533/:535 + myday-view.tsx:95/:97, the
   render-snapshot PATCH shapes gone) + CX2
   (`setStudyGroupMembers(groupId, update)` at data.ts:718-750 with the
   `groupMemberChains` map + `normalizeMembers`, the handlers at
   studygroups-view.tsx:230/:252) + CX3 (login-surface.tsx:222-227 —
   the 429/`isTimeoutError`/`status === 0`/uniform partition, in that
   order) + CX4 (calculator-view.tsx:180 the `justEvaluated.current`
   re-press no-op + :512/:515/:603 the GPA latch + :659/:672/:757 the
   unit latch) + CX5 (settings-view.tsx:1091-1112 the
   `loadFailed`/`retryCount` effect in the boot() inner-async shape +
   :1162-1163 the honest copy + :1184+ the `sf-alert-red`
   role="alert" + Retry). The doc census machine-verified (README
   badge 2157, AGENTS 1530→1543 + e2e 614 + the 5-chunk map
   150+189+91+95+89, CLAUDE 1543/614, PAD v1.3.57, the SKILL census
   both sites [lines 28 + 630], the vitest header re-anchored +13).
   No new attack surface, no lock-order hazard (the two chain maps
   are disjoint key-spaces; the CX1/CX2 chains never nest).

2. **Audit B — the entities/factory + data-layer rotation** (three
   cycles stale — the S146/CU-swept axis). The full axis read:
   `src/lib/server/entities.ts` (687 lines), `src/lib/server/http.ts`
   (526), `src/lib/server/auth.ts` (183), `src/lib/validation.ts`
   (591), `src/lib/db-path.ts` (131), `src/lib/group-members.ts` (76),
   `prisma/schema.prisma` (616), and all 39 in-scope route files
   (the 16 entity collections + their `[id]` children + files×5 +
   settings + calculator): **0C / 0H / 0M / 1L / 5I**. Every
   historically-real family re-verified **CLOSED** at its anchors:
   - ownership scoping (every list `where:{userId}` + the
     `[createdAt:desc, id:desc]` + `take:500` order at
     entities.ts:305-324; the pre-check `findFirst` → NotFoundError at
     :339-340/:388-389; the guarded delegates re-read inside the tx at
     :369-375; Flashcard scopes through `deck:{userId}` at
     :606-607/:648-650/:680-682; P2025→404 at http.ts:330-331);
   - route authz (the 39-file census: zero ungated handlers);
   - the error taxonomy (http.ts:277-358 — Zod→400,
     BodyTooLargeError→413 BEFORE its ValidationError parent,
     ExportTooLargeError→413, P2002→409, P2025→404, P2003→400,
     P2028→413, the static 500; uniform `{ error }` everywhere);
   - the CR7 delegate pattern (one factory + 15 delegates + the two
     hand-written delegates sharing the conventions — zero drift);
   - bounded readers (readJson 10 MiB counting reader; multipart
     2 MiB+64 KiB with the CU3 typed-error discrimination; every list
     take-bounded);
   - the S143/CR3 own-keys patch discipline (entities.ts:268
     `hasOwnProperty` in `sentKeysPatch`; all write sites route through
     it or the certified inlined settings twin);
   - rate-limit keying (write:${user.id} 600/15-min after auth before
     readJson at every write site incl. the S148/CW1 calculator
     completion; upload:${user.id} 20/15-min on both upload branches +
     link + folders);
   - the Zod boundary (every JSON route parses through
     validation.ts; the multipart file fields hand-validated to the
     same bounds — the one residual is the L below).

   **The finding (the L, re-verified by direct read):**
   - **B-L1 — the multipart `folderId` is the one remaining unbounded
     id atom** (src/app/api/files/route.ts:191-199). Every other id
     input is length-bounded at 64 (S118/BS2 `idField` at
     validation.ts:17-19; S139/CN11 the route-param bound at
     http.ts:395-400) — the multipart branch reads the raw form value
     and passes it verbatim to `findFirst`. Prisma parameterizes (no
     injection), the upload budget caps frequency (20/15-min) and the
     counting reader caps the body (2.1 MiB) — so a ~2.1 MB parameter
     can reach SQLite per request. Purely the boundary inconsistency
     the two prior cycles closed everywhere else: the one id atom the
     schemas never owned.

   **The Is (recorded, adjudicated in §5):** **B-I1** the limiter
   hard-cap eviction can re-arm a `write:` bucket (the documented
   single-node trade-off, S121/BV9 — unchanged); **B-I2** the
   unthrottled authenticated GET posture (the documented BZ5 family
   posture — reads are take-bounded + covered by composite indexes);
   **B-I3** `db-path.ts` does not percent-decode `import.meta.url`
   (dev-only; mis-resolves only when CWD is neither repo root nor a
   standalone dir AND the path is percent-encodable — no production
   effect); **B-I4** `withUserParams` answers 404 before the auth gate
   for malformed ids (no oracle; the length test carries zero
   existence signal); **B-I5** the settings-route `schoolName` is
   stored untrimmed (see the rider below — promoted into this cycle's
   fix set as the S146-carried B-I3 trim rider).

**Every M/L finding above was re-verified by direct read of the
current tree before this plan was written** — B-L1 at
src/app/api/files/route.ts:185-199 (the raw form value → `findFirst`
verbatim; the 64-bound absent; the 404 no-oracle copy already present
for the missing-row case); the rider anchors at
src/lib/validation.ts:218 (`schoolName: z.string().max(120).optional()`
— no `.trim()`, while `boundedTitle`/`emailField` carry the house
trim-first convention and the settings route trims `displayName` at
route:62), src/app/api/settings/preferences/route.ts:63 (stored
verbatim), src/components/views/notes-view.tsx:429-434 (the silent
drop), src/lib/data-import.ts:1213-1236 (the import profile patch
routes through `preferencesSchema` — the trim lands at the one
canonical atom).

## §2 The cycle (Batch CY — the folderId-bound + schoolName-trim + tag-honesty set)

The axis contributes its one actionable L as CY1 (the last unbounded
id atom joining the two-cycle-old 64-char convention). The cycle also
carries the **named validation-family riders** the S146/S149 plans
deferred to exactly this rotation: the S146/B-I3 schoolName trim rider
("a cheap rider for a validation-family cycle — watch the
sent-keys/sentinel interplay", verified below) as CY2, and the
S149/B-I4 note-tag silent-drop honesty nit ("stays with the B-I3 trim
rider's validation-family cycle") as CY3. Three one-family fixes, one
theme: input-boundary honesty — an unbounded atom, an untrimmed atom,
and a silent drop.

## §3 The fixes (design, anchors verified)

### CY1 — the multipart folderId 64-char bound (B-L1)

**The finding (verified by direct read):** the multipart `folderId`
reaches `findFirst` verbatim; every other id atom is 64-bounded.

**The fix (the S139/CN11 route-param convention, verbatim shape):**
in `src/app/api/files/route.ts`, inside the existing
`if (typeof rawFolder === "string" && rawFolder.length > 0)` branch,
a length guard BEFORE the query:

```ts
if (rawFolder.length > 64) {
  return errorResponse(404, "That folder does not exist.");
}
```

A >64-char id cannot exist (cuids are 25 chars), so the honest status
is the no-oracle 404 — byte-identical to the missing-row branch it
precedes (the CN11 doctrine: the bound never invents a new status
class; it just answers the impossible id the way the nonexistent id
answers).

**The test leg (tests/script-conventions.test.ts, the CV1
wiring-census precedent):** files/route.ts's multipart branch matches
the `rawFolder.length > 64` guard BEFORE the `fileFolder.findFirst`
call (ordered anchors — the guard's index < the query's index) — RED
pre-fix (the marker does not exist).

### CY2 — the schoolName trim at the validation atom (S146/B-I3, the settings rider)

**The finding (verified by direct read):** `schoolName` persists
whitespace verbatim at the API boundary while every sibling text atom
(`boundedTitle`, `emailField`, the route-side `displayName.trim()`)
carries the trim-before-store doctrine; a whitespace-only
`schoolName` stores as `"   "` (the DB's natural cleared state is
`""` — the BY1 gradeLevel convention in the same card).

**The fix (one canonical atom):**
`src/lib/validation.ts:218` —
`schoolName: z.string().trim().max(120).optional()`.
Verified by the pre-plan probe: Zod 4's `.trim()` applies BEFORE
`.max()` (a padded 125-char raw value that trims to ≤120 passes), a
whitespace-only value parses to `""` (the natural cleared state, the
same schoolName:"" convention the S17 pins already carry), and
`undefined` legs stay untouched (the sent-keys/sentinel interplay the
S146 plan flagged — the key SURVIVES the transform with its trimmed
value, so the settings route's `!== undefined` filter and the import
seam's `PROFILE_PATCH_KEYS` whitelist both keep working verbatim).

**Blast radius (verified by direct read + pin census):** the settings
route stores `prefs.schoolName` (:63 — now trimmed); the import
profile patch (`importProfilePatch` → `preferencesSchema.safeParse`)
lands the trim at the same atom (a padded schoolName in a hand-edited
envelope arrives normalized — round-trip integrity preserved, the
re-exported value is the stored value); the Study Profile card already
trims client-side (:348 — idempotent); the existing pins all use
unpadded values ("Lincoln High", "Springfield High", "S", "" — none
break); the 120/121 bound pins stay true under trim-first ordering.

**The test legs (tests/validation.test.ts, functional):**
- `schoolName: "  Lincoln High  "` parses to `"Lincoln High"` (the
  trim);
- `schoolName: "   "` parses to `""` (the cleared state, not
  whitespace), and the bound still holds post-trim (the trimmed
  value must exceed 120 to fail — the ordering witness).
(Both RED pre-fix: the current schema returns the padded value
verbatim.)

### CY3 — the note-tag honest feedback (S149/B-I4, the tag rider)

**The finding (verified by direct read):**
`src/components/views/notes-view.tsx:429-434` — `addTag` clears the
draft BEFORE the guards, then silently returns on the >24-char and
duplicate cases: the user's text is destroyed with zero feedback (the
S149 audit's honesty nit — the exact "input cleared, nothing
happened, no reason" class).

**The fix (the empty case stays a no-op; the two real drops get their
toast):**

```ts
const addTag = () => {
  const tag = tagDraft.trim().replace(/^#/, "");
  setTagDraft("");
  if (!tag) return;
  if (tag.length > 24) {
    toast.error("Tags are limited to 24 characters.");
    return;
  }
  if (selectedTags.includes(tag)) {
    toast.error("That tag is already on this note.");
    return;
  }
  saveTags([...selectedTags, tag]);
};
```

`toast` is already in scope (NotesView's :184 hook). The aria-live
toast stack announces both (the S14 contract); the happy path is
byte-identical; the copy style matches the "Files are limited to 2
MiB." family.

**The test leg (tests/script-conventions.test.ts, wiring census):**
notes-view.tsx's addTag block matches both honest-feedback markers
(`Tags are limited to 24 characters.` + `That tag is already on this
note.`) — RED pre-fix.

### CY4 — the doc chain

README badge `2157` → **2161** + the Session-150 row; AGENTS.md
commands-table census (1543 → **1547** unit; e2e 614 unchanged — the
5-chunk map untouched) + the S150 lessons block; CLAUDE counts
(1543 → 1547); PAD v1.3.58 (the revision block + the §11 closure
rows for B-L1 + the S146/S149 rider closures); the SKILL census (both
sites); the vitest header re-anchor (+4: validation +2, script-
conventions +2); the cert runner unchanged (the e2e census untouched
this cycle); `docs/session_173.md`; the worklog Session-161 entry;
the plan §6 as-executed close; the `.env.example` contract
re-verified (no env-var reads change this cycle).

## §4 Execution order (TDD)

1. **RED legs first** (against the pre-fix tree): the CY2 functional
   pair (validation.test.ts — the padded-trim leg + the
   whitespace-to-cleared-state leg with its post-trim bound witness),
   the CY1 wiring-census leg, the CY3 wiring-census leg. Expect
   **4 RED** (2 functional + 2 census).
2. **Implementation:** CY1 the folderId guard → CY2 the one-line
   schema trim → CY3 the addTag toasts.
3. **Interim gates:** lint → typecheck → unit (expect 1547/1547,
   48 files, +4).
4. **The e2e GREEN run:** build (output captured to file — the S146
   SIGPIPE lesson) → the targeted files + notes + settings + parity
   specs on the final tree → the full cold 5-chunk cert
   (150+189+91+95+89 = 614, per-chunk ALONE in the foreground — the
   S142 lesson, the S149 re-learn).
5. **The evidence capture** (`scripts/capture-s150-evidence.mjs`, the
   s149 precedent): the standing desktop frame + the standing mobile
   drawer frame + the cycle's surface frames (the Files view + the
   Notes tag row — the CY1/CY3 surfaces); self-verifying (exists,
   >10 KiB, byte-diverse, md5-distinct).
6. **Final tree:** the census re-anchors → §6 close → commit + the
   SSH wrapper push (the wrapper's own procedure doc unchanged).

## §5 Riders considered, deferred (with reasons)

- **B-I1 (the limiter hard-cap eviction):** the documented
  single-node trade-off (S121/BV9) — the protection-set widening is
  a design change to the limiter's eviction contract; recorded, no
  action this cycle.
- **B-I2 (the unthrottled authenticated GET posture):** the
  documented BZ5 family posture — reads are take-bounded and covered
  by the composite indexes; no action.
- **B-I3 (the db-path percent-decode):** dev-only, and db-path is the
  repo's most fragile invariant (CLAUDE: "treat changes to it as
  high-risk") — an I-class cosmetic fix does not justify touching the
  three-anchor contract; recorded for a db-path-family cycle.
- **B-I4 (the withUserParams 404-before-401):** no oracle, zero
  existence signal, and reordering the gates is a taxonomy-wide
  behavior change for zero observable correctness gain; recorded.
- **The A-M3 stage-2 chunked sub-tx + resume token (carrying the
  B-L2 import lock-hold finding):** its own ADR-021 cycle (the
  standing scoping doctrine; unchanged).
- **B-I1/B-I2/B-I3/B-I4 of the S149 audit** (the mid-session 401
  SPA seam, the departed-note flush silence, the in-band dev code
  delivery, and — with this cycle — the note-tag silent drop CLOSED):
  recorded; the first three unchanged.
- **The TaskDialog/GroupDialog edit-form snapshot pattern:** designed
  last-writer-wins (the S149 adjudication — recorded so no audit
  re-litigates).
- **The B-I census-granularity design change, the login stale-mint
  sibling, A-F3, the export streaming half, the post-sanitize
  entity-expansion re-check, the parseImportEnvelope duplication,
  the delete-note popover no-auto-close rider, the B-I2 data.ts
  inline CAS twin, the unthrottled authenticated GET posture (BZ5),
  the prewarm/auth-verdict note:** all unchanged (the carried
  S142–S149 deferrals).

## §6 As-executed close

**The RED inventory (as it ran):** the unit REDs **4/4** — the CY2
functional pair (validation.test.ts: the padded school name must
parse TRIMMED — pre-fix the schema returned `"  Lincoln High  "` —
and the whitespace-only value must parse to the `""` cleared state,
with the bound still post-trim in the same leg) + the CY1
wiring-census leg (the `rawFolder.length > 64` guard ordered BEFORE
the `fileFolder.findFirst` call, carrying the no-oracle 404 copy) +
the CY3 wiring-census leg (the addTag block's two drop-reason
markers). Exactly the §4 inventory.

**Interim gates:** lint ✓ · tsc ✓ · unit **1547/1547** (48 files, +4
exactly as designed) — after one census tripwire tripped and closed
as designed: the CY3 block's +13 lines moved the hue-tokens
notes-view register site 686 → 700, the anchored leg failing exactly
as its contract states ("the anchored leg fails when a registered
site moves"); re-anchored with the maintenance note, the site itself
byte-unchanged.

**The build + targeted e2e:** build ✓ (exit 0, output captured to
file; the three fix wirings verified shipped in the standalone
chunks — the CY1 404 copy in the files route chunks, the CY2
`.trim().max(120)` in both schema consumers' chunks [the settings
route + the import seam], the CY3 toast in the client chunk; the 6
Turbopack warnings are the documented db-path/instrumentation
baseline — files untouched this cycle). The targeted run —
parity-session5 + parity-session7 + parity-session8 + s17-fresh-user
+ tasks + s14-hardening + mobile-navigation (the cycle's six
surfaces): **236 legs — 235 green + 1 documented interplay**: the
ad-hoc run combined chunk 3's parity-session5 (the math/solve
`ai:` budget consumer — 1-2 real requests BY DESIGN, its own
comment documenting "the s14 C1 exhaustion lives in chunk 2 with its
own per-chunk-boot limiter") with chunk 2's s14-C1 exhaustion pin in
ONE boot — an artificial mix the 5-chunk map's per-chunk re-boot
exists to prevent (the AGENTS commands-table note: "a single-process
full run trips the register rate-limiter budget by design, the
chunked map re-boots the server per chunk"). The C1 pin re-verified
**27/27 on its own cold boot** (the designed isolation restored).

**The cold 5-chunk cert (the FINAL tree):** chunk 1 **150 first-pass**
(3.2 m) · chunk 2 **189 first-pass** (4.5 m) · chunk 3 **91 first-pass
on the cold re-run** (4.1 m — the first attempt's single failure was
the P1008 SQLite socket-timeout machine-load class, root-caused by
three independent signals: the exact Prisma error line in the server
log naming `prisma.fileFolder.create()`, the same-shape folder tests
passing immediately after in the same run, and the clean 91/91 cold
re-run; the co-occurring socket-timeout/ai-chat noise lines are the
documented classes) · chunk 4 **95 first-pass** (3.5 m) · chunk 5
**89 first-pass** (1.4 m) — **every chunk first-pass, ZERO code
flakes**. The e2e census **614/614 unchanged** (no e2e-count change
this cycle, exactly as planned). **Census 2161 green** (1547 unit +
614 e2e; was 2157).

**Evidence:** four `docs/screenshots/150-clone-*.png` frames (the
standing desktop 235 KiB + the standing mobile drawer 65 KiB — the
65th drawer-GREEN companion frame + the Files view 213 KiB [CY1's
surface] + the Notes editor tag row 208 KiB [CY3's surface]),
self-verifying (exists, >10 KiB, byte-diverse, dominant-share < 95%,
md5-distinct — the capture script's JSON verdict `ok: true`;
dimensions machine-checked 1440x900 / 390x844). The CY2 boundary
atom's machine proof rides the unit layer (the trim pair — a schema
transform is not screenshot-provable, the CW2 runtime-split
precedent; the Settings Profile card's own save already trimmed
client-side, so no visual changed).

**The doc chain:** README badge 2157 → 2161 + the Session-150 row;
AGENTS census (1543 → 1547) + the S150 lessons block (three lessons:
a boundary convention is only closed when the LAST channel joins it
— enumerate body/route-param/query/AND multipart, the grep is
`form.get`/`formData()` not just `readJson`; a trim belongs at the
ATOM, not at each consumer — the S146 "watch the sent-keys/sentinel
interplay" warning resolved to a non-issue BECAUSE the trim preserves
key presence; a destroyed input demands its reason — the empty case
stays a no-op, the two real drops speak); CLAUDE counts; PAD v1.3.58
(the revision block + the three §11 closure rows); the SKILL census
(both sites); the vitest header re-anchor (+4 with the hue-tokens
re-anchor note); the cert runner unchanged (the e2e census
untouched); `docs/session_173.md`; the worklog Session-161 entry;
this §6 close; the `.env.example` contract re-verified (no env-var
reads changed this cycle).

**The honest residuals:** the §5 deferrals stand unchanged (the
limiter hard-cap eviction trade-off, the unthrottled GET posture, the
db-path percent-decode [recorded for a db-path-family cycle], the
withUserParams 404-before-401 taxonomy nit, B-L2 + A-M3 to the A-M3
ADR-021 cycle, the S149 B-I1/B-I2/B-I3 records, the
TaskDialog/GroupDialog edit-form adjudication, the carried
S142–S149 family). The `skills/` folder untouched by every check,
test, and compile this cycle.
