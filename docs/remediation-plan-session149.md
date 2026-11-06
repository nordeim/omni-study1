# Remediation Plan — Session 149 (Cycle 99, Batch CX)

> Status: PLANNED (pre-change record — the immutable plan; the as-executed
> close lives in §6). Written before any source change, per the standing
> doctrine ("write the cycle plan into docs/remediation-plan-sessionN.md
> BEFORE any source change").
>
> Operator directive: refresh the workspace, re-read the doc chain
> (AGENTS/CLAUDE/README/PAD/SKILL + session_169/170 +
> remediation-plan-session148 + worklog), validate against the codebase,
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

**Workspace (a continuation of the prior session's tree at `3fea61c` on
`main` — the Batch CW fix `3d4ac01` + the operator's session_170
transcript commit; pulled fast-forward, working tree clean).**
Environment verified standing: `.env` with
`DATABASE_URL="file:../db/custom.db"` +
`NEXT_PUBLIC_SITE_URL=http://localhost:3000` + `AUTH_SECRET=""` (the
`.env.example` dev posture) · `db/custom.db` at the repo root (389 KiB,
the seeded demo account) · bun 1.3.14 · node 24.22.2 · the dev daemon
live on :3000 (`curl /login` → 200).

**Cold baseline (before any work):**

| Gate | Result |
|---|---|
| `bun run lint` | ✓ 0 errors |
| `bun run typecheck` | ✓ 0 errors |
| `bun run test` (Vitest) | ✓ 1530/1530 (48 files) — the documented S148 final state exactly |
| `node scripts/drawer-check-s14.mjs` (live reference login) | GREEN — **the 64th consecutive no-Tailwind-v4-mobile-nav-bug confirmation** (backdrop oklab(0 0 0 / 0.2) + blur(4px); 288px white panels; 20 links; no footer; Escape-close superset) |
| `node scripts/parity-probe-s142.mjs` (live reference login; REF_PROBE_* exported) | **DESKTOP CHROME: MATCH** — all five formal checks (sidebar outer width, nav link count, first-links order, mainX, mainWidth) |

**Baseline noise observed (recorded, not findings):** none.

**Probes run BEFORE the plan (the doctrine — probe, don't guess):** the
standing-environment verification leg itself (dev daemon alive, db
seeded, gates green), the reference login + drawer + parity probes
above, plus every audit M/L finding re-verified by direct read of the
current tree before this plan was written (the anchors are in §1).

## §1 The audits (Mode-C, read-only; every M/L finding re-verified by direct read)

Per the S148 closing directive — "the rotation continues — the
FE/views + auth/crypto axis is now two cycles stale (swept at S147), or
the A-M3 stage-2 chunked sub-tx + resume token (its own ADR-021 cycle)"
— plus the standing recent-changes focus ("particularly on the recent
code changes"):

1. **Audit A — the Batch CW recent-changes audit** (the `3d4ac01` diff
   itself: the CW1 calculator-history POST budget, the CW2 export byte
   ceiling [the seam + the typed error + the throw + the page catch +
   the panel state], the CW3 parse status normalization, the CW4
   doc-chain census, the capture script, every delivered test leg):
   **0C / 0H / 0M / 0L / 0I — clean**. All four CW claims verified
   **CONFIRMED** at the source level — CW1's budget
   (calculator/history/route.ts:48-56 — the POST's checkRateLimit
   between `withUser` and `readJson`, the CE6 pattern; the header
   comment retires the S122/BW5 exemption language) + the DELETE twin's
   comment updated (:99-100); CW2's five anchors (data-export.ts:169-176
   — EXPORT_MAX_BYTES 256 MiB + exportOverCeiling;
   http.ts:168-174/:294-298 — ExportTooLargeError + the 413 branch with
   the database-file remedy; export-build.ts:127-138 — the
   `const bytes` + the throw at the SHARED seam; app/export/page.tsx:108-109
   — the narrow catch feeding err.bytes; export-panel.tsx:92/:189-197 —
   the derived overCeiling state + the red role="alert" + the disabled
   span); CW3's 502 (api.ts:62-70); CW3's census machine-verified
   (README badge 2144, AGENTS 1530/614 + the 5-chunk map, CLAUDE
   1530/614, PAD v1.3.56, the SKILL census both sites, the vitest
   header). No new attack surface, no lock-order hazard.

2. **Audit B — the FE/views + auth/crypto rotation** (two cycles stale —
   the S147-swept axis). Run as two halves:
   **the auth/crypto half** (orchestrator direct read: src/lib/auth.ts
   in full — the scrypt/HMAC core, the S134/CI1 parameter migration with
   its transition equalizer, the rate limiter's eviction/exemption
   containment, the peppered OTP digest, the timing-safe compares, the
   proxy-hop contract, the Secure-flag derivation; the login route in
   full; the 11-route auth census; the boot guards' wiring):
   **0C / 0H / 0M / 0L / 0I — clean**. Every S147-verified family
   re-confirmed closed at its anchors: the CF10 loginGlobal containment
   + the CM3 net-of-successes decrement (login/route.ts:52-58/:149);
   the CB12 per-account uniform-401 with the CG1 equalized burn
   (:88-104); the BX4/CI1 uniform scrypt pair + the CI1 rehash drain
   (:110-125); the BS1 session-version mint (:156); the route census
   (register 4 limits, verify/resend/forgot/reset/change-password/
   delete-account/change-email 3 each, logout 1, `me` gated through the
   `withUser` factory); the instrumentation wiring
   (authSecretBootStatus at :23, nodeEnvCasingWarning at :117).

   **the FE/views half** (a full breadth scan of all 22 view files +
   the store + the client seams + the login surface + the export/rum
   panels + the SPA shell, dispatched as a read-only subagent, every
   M/L finding re-verified by direct read by the orchestrator before
   this plan was written): **0C / 0H / 2M / 3L / 4I**. The
   historically-real families re-verified CLOSED (with anchors): the
   ABA/per-key fetchSeq CAS family (data.ts:347-355, the S143/CR5 picker
   instances at settings-view.tsx:162-192, the CK2 files-view private
   seq at :212-258); the CC11 loadingCounts; the CT1 completion-window
   set (focustimer-view.tsx:120-173/:357/:374); the S130/CE1 deadline
   family (api.ts:85-118 + every AI call site + the upload's own 120 s);
   the unlatch-on-failure finally discipline (every dialog surface); the
   auth-surface inline honesty + the CA10 in-flight resend guard; the
   note-HTML two-door sanitizer policy; the memory-leak census (every
   timer/listener); the key discipline. The findings, all five M/L
   re-verified by direct read:

   - **B-M1 — the myDay/important row toggles retain the BX10
     stale-base double-toggle race** (tasks-view.tsx:529-538 +
     myday-view.tsx:91-99). The S127/CB16 fix chained ONE toggle
     (`completed` — toggleTask at data.ts:489-505, the per-id
     taskToggleChains map); the sibling toggles PATCH
     `{ myDay: !task.myDay }` / `{ important: !task.important }` from
     the RENDER-SNAPSHOT task — two rapid clicks inside the
     PATCH+refetch window both read the same stale base and send the
     SAME value; the second toggle is silently lost. (The TaskDialog's
     full-payload save at tasks-view.tsx:281-291 is the edit-form
     last-writer-wins pattern — designed, not in this finding's scope;
     myday-view.tsx:343's `{ myDay: true }` is an idempotent absolute
     add, not a toggle.)
   - **B-M2 — the study-group member add/remove ops interleave on a
     call-time store read, not a chain**
     (studygroups-view.tsx:214-253). The S123/BX10 fix moved the
     members base from the render snapshot to a mutation-time store
     read; but `removeMember` is fire-and-forget with NO latch, and
     `addMember`'s `savingMember` latch does not serialize against it:
     a remove during addMember's in-flight window (or two rapid
     removes) computes its absolute members array from the
     not-yet-refreshed store — the first op is silently lost while
     both fire success toasts. The chain idiom exists precisely
     because a call-time read is insufficient (the toggleTask
     precedent).
   - **B-L1 — the resend-code catch renders the success line for
     TRANSPORT failures** (login-surface.tsx:211-222). The S131/CF8
     anti-enumeration design maps every non-429 failure to "If that
     account needs verification, a new code is on its way." — including
     `isTimeoutError` (the 20 s deadline) and the offline
     `ApiError(0, …)`. A request that never left the browser is
     reported as delivered — the user waits for a code that was never
     sent. Transport failure is distinguishable from account state
     with zero enumeration surface; the surface's own authErrorMessage
     helper (:130-136) already encodes the distinction for its
     siblings.
   - **B-L2 — the calculator's three history-save affordances carry no
     in-flight guard** (calculator-view.tsx:173-206 the `=` press,
     :502-513 the GPA Save, :715-731 the unit Save to history). The
     CI4 pattern (myday quick-add at myday-view.tsx:54-59) guards every
     sibling composer; these three fire one POST per activation: a
     rapid double-`=` re-evaluates the committed result and appends a
     derived "5 = 5" noise row; a rapid double-click on either Save
     duplicates the row.
   - **B-L3 — the SettingsView me-fetch failure is a full silent
     swallow with a stuck loading surface** (settings-view.tsx:1085-1097).
     The mount fetch's `.catch(() => {})` documents only the 401
     delegation; a 500 or timeout (bounded at 20 s) leaves
     `user === null` forever — the Account card reads "Loading your
     account…" / "Account created: —" with no error and no retry. The
     BootDataFailureBar idiom (page.tsx:135-151) is the established
     pattern for exactly this failure class.
   - The Is: **B-I1** no mid-session 401 seam in the SPA (deliberate-
     looking; recorded); **B-I2** the departed-note unmount-flush
     silence (the documented S80/AG6 tradeoff); **B-I3** the in-band
     dev delivery of auth codes/reset links (the documented no-SMTP
     posture); **B-I4** the note-tag >24-char silent drop (a minor
     honesty nit).

**Every M/L finding above was re-verified by direct read of the current
tree before this plan was written** — B-M1 at
src/components/views/tasks-view.tsx:519-547 + myday-view.tsx:85-105 (the
four toggle call sites riding `mutations.updateTask(task.id, { myDay:
!task.myDay })` from the render snapshot; the toggleTask chain at
src/lib/data.ts:483-505 for contrast); B-M2 at
src/components/views/studygroups-view.tsx:214-253 (the call-time
`useDataStore.getState().studyGroups.find` reads at :225/:241; the
`savingMember` latch serializing adds only); B-L1 at
src/components/auth/login-surface.tsx:199-226 (the catch's else branch)
+ the authErrorMessage helper at :130-136; B-L2 at
src/components/views/calculator-view.tsx:173-206/:502-513/:715-731 (no
busy state on any of the three sites; the CI4 precedent at
myday-view.tsx:54-59); B-L3 at settings-view.tsx:1084-1097 + the
Account card render at :1146-1159 + the BootDataFailureBar at
src/app/page.tsx:135-151.

## §2 The cycle (Batch CX — the sibling-toggle-chain + members-chain + resend-transport + calc-save-latch + settings-me-failure set)

The rotation's named axis (FE/views + auth/crypto) contributes its two
actionable Ms as CX1 + CX2 (one family — the per-id chain idiom the
store already carries, extended to its two unfixed consumers), the
auth-surface's transport branch as CX3 (the L1 rider on the axis's own
login surface), the calculator save guards as CX4, and the settings
me-fetch failure surface as CX5. The B-I4 tag-length nit, the B-I1
mid-session 401 seam, and the A-M3 chunked sub-tx stay with their named
deferral cycles (§5); the TaskDialog/GroupDialog edit-form snapshot
pattern is designed last-writer-wins (recorded, not a finding).

## §3 The fixes (design, anchors verified)

### CX1 — the sibling toggle chains (B-M1)

**The finding (verified by direct read):** the myDay/important row
toggles PATCH from the render snapshot; the per-id chain exists only
for `completed`.

**The fix (the toggleTask idiom, verbatim shape):** two new mutations
in `src/lib/data.ts`, riding the SAME `taskToggleChains` map (one chain
per task id serializes every toggle kind for that task — cross-field
PATCHes are field-scoped so cross-field serialization is unnecessary
but harmless, and one shared map keeps the S128/CC5 eviction single):

```ts
toggleTaskMyDay: async (id: string): Promise<void> => {
  const chained = (taskToggleChains.get(id) ?? Promise.resolve()).then(async () => {
    const task = useDataStore.getState().tasks.find((t) => t.id === id);
    if (!task) return;
    await apiSend("PATCH", `${PATHS.tasks}/${id}`, { myDay: !task.myDay });
    await fetchAndSet("tasks");
  });
  const stored = chained.catch(() => undefined);
  taskToggleChains.set(id, stored);
  stored.finally(() => {
    if (taskToggleChains.get(id) === stored) taskToggleChains.delete(id);
  });
  await chained;
},
```

plus `toggleTaskImportant` (the `{ important: !task.important }` twin).
The chain entry never rejects; the CALLER gets the real rejection (the
toggleTask contract).

**The view rewiring (the four sites):** tasks-view.tsx:531/:536 and
myday-view.tsx:93/:98 — `onToggleMyDay: (task) => void
run(mutations.toggleTaskMyDay(task.id), "Could not update the task.")`
and the `toggleTaskImportant` twin. The `TaskRowActions` signatures stay
(the task prop still names the row; the id is the payload).

**The test legs (tests/data-store.test.ts, the S119/BT8 mock pattern —
apiSend + apiGet mocked, the store imported directly):**
- two functional legs: `toggleTaskMyDay` — seed the store with one task
  (`useDataStore.setState({ tasks: [task] })`), hold the FIRST apiSend
  resolution, call twice, assert the two PATCH bodies carry OPPOSITE
  `myDay` values (the second re-read the post-settle base — pre-fix,
  the mutation does not exist and the import fails, which IS the red);
  the `toggleTaskImportant` twin leg.
- two wiring-census legs (readFileSync + regex, the CV1 precedent):
  tasks-view.tsx and myday-view.tsx each match `mutations.toggleTaskMyDay(`
  + `mutations.toggleTaskImportant(` and no longer match
  `updateTask(task.id, { myDay: !task.myDay })` or
  `updateTask(task.id, { important: !task.important })`.

### CX2 — the study-group members chain (B-M2)

**The finding (verified by direct read):** add/remove members compute
absolute arrays from a call-time store read with no chain; a remove
during an add's in-flight window (or two rapid removes) silently loses
the first op.

**The fix (the taskToggleChains idiom on the members field):** one new
mutation in `src/lib/data.ts`:

```ts
setStudyGroupMembers: async (
  groupId: string,
  update: (members: GroupMember[]) => GroupMember[],
): Promise<void> => {
  const chained = (groupMemberChains.get(groupId) ?? Promise.resolve()).then(async () => {
    const group = useDataStore.getState().studyGroups.find((g) => g.id === groupId);
    if (!group) return;
    const members = update(normalizeMembers(group.members));
    await apiSend("PATCH", `${PATHS.studyGroups}/${groupId}`, { members });
    await fetchAndSet("studyGroups");
  });
  const stored = chained.catch(() => undefined);
  groupMemberChains.set(groupId, stored);
  stored.finally(() => {
    if (groupMemberChains.get(groupId) === stored) groupMemberChains.delete(groupId);
  });
  await chained;
},
```

with a module-level `groupMemberChains = new Map<string, Promise<void>>()`
beside `taskToggleChains`, importing `normalizeMembers`/`GroupMember`
from `@/lib/group-members` (the client-safe seam — the S85/AL1 members
boundary). The updater form (not a value) is what makes the chain
correct: each link computes from the POST-SETTLE base.

**The view rewiring:** addMember's try body becomes
`await mutations.setStudyGroupMembers(selected.id, (current) => [...current, { name, email }])`
(the `savingMember` latch stays — it guards the form's own duplicate
submits and owns the input clearing); removeMember becomes
`mutations.setStudyGroupMembers(selected.id, (current) =>
removeOneMember(current, member.email, member.name)).then(toast).catch(toast)`
— the call-time store reads and the inline array math leave both
handlers.

**The test legs (tests/data-store.test.ts):**
- one functional leg: seed the store with one group; hold the FIRST
  apiSend; an add followed by a remove must land BOTH effects (the
  remove computed from the post-add-settle base — two members in the
  first PATCH, one in the second), never the remove-alone array
  (pre-fix: the mutation does not exist — the import failure is the
  red).
- one wiring-census leg: studygroups-view.tsx matches
  `mutations.setStudyGroupMembers(` and no longer matches
  `useDataStore.getState().studyGroups.find` (the stale-base reads
  leave the view).

### CX3 — the resend transport-failure branch (B-L1, the auth-surface rider)

**The finding (verified by direct read):** the resend catch renders the
uniform success line for timeout/offline — the user waits for a code
that was never sent.

**The fix (login-surface.tsx:211-222):** the catch's else family splits
on TRANSPORT first — 429 keeps the rate copy;
`isTimeoutError(err)` renders the deadline copy ("That took too long.
Check your connection and try again." — the authErrorMessage
vocabulary); `err instanceof ApiError && err.status === 0` renders
`err.message` (the human offline message the doFetch seam already
mapped); every OTHER ApiError status keeps the uniform no-enumeration
line (the CF8 contract — account-state failures stay indistinguishable;
transport failures never were account state).

**The test leg (tests/script-conventions.test.ts, the CV1 wiring-census
precedent):** login-surface.tsx's resend catch matches
`isTimeoutError(err)` AND `err.status === 0` (the transport branch
markers) — RED pre-fix (the catch carries only the 429 branch).

### CX4 — the calculator history-save guards (B-L2)

**The finding (verified by direct read):** the `=` re-press derives a
noise row ("5 = 5"); the GPA/unit Saves duplicate rows on rapid
double-clicks.

**The fix (calculator-view.tsx):**
1. The `=` branch's first guard (after the empty-expression check):
   `if (justEvaluated.current) return;` — a second `=` immediately
   after an evaluation is a no-op (the display already holds the
   result; the re-evaluation changes nothing visible; the derived row
   was pure noise). The ref write is synchronous before the history
   await, so even a same-tick double-press is guarded.
2. GpaPanel: `const [savingGpa, setSavingGpa] = React.useState(false)`
   — the CI4 guard (`if (savingGpa) return` + finally unlatch) on
   `saveGpaToHistory`, `disabled={savingGpa}` on the Save button.
3. UnitPanel: the inline onClick becomes a guarded
   `saveUnitToHistory` with the same latch +
   `disabled={savingUnit}` on the Save-to-history button.

**The test legs (tests/script-conventions.test.ts, wiring censuses):**
three legs — the `=` branch contains the `justEvaluated.current`
re-press guard marker; the GPA Save button carries
`disabled={savingGpa}`; the unit Save carries `disabled={savingUnit}`
(all RED pre-fix — none of the markers exist).

### CX5 — the Settings me-fetch failure surface (B-L3)

**The finding (verified by direct read):** a non-401 me-fetch failure
leaves the Account card on "Loading your account…" forever with no
retry.

**The fix (settings-view.tsx:1084-1097 + the Account card at
:1146-1159, the BootDataFailureBar idiom scoped to the card):**
- state: `const [loadFailed, setLoadFailed] = React.useState(false)`
  + `const [retryCount, setRetryCount] = React.useState(0)`;
- the effect re-runs on retryCount, resets `loadFailed` at the top of
  each attempt, and sets it in the catch (the `cancelled` guard stays);
- the email line renders `"Couldn't load your account."` when
  `loadFailed` (never a loading claim for a failed load) — the
  in-flight state keeps "Loading your account…";
- below the createdAt line, the failed card renders the red
  `role="alert"` block (`sf-alert-red`, the S15 auth convention) with
  the message + a real Retry button
  (`onClick={() => setRetryCount((c) => c + 1)}`).

The child cards keep their theme-store fallbacks (unchanged); the S17
e2e pins ride the success path (the alert is purely additive below the
pinned lines).

**The test leg (tests/script-conventions.test.ts, wiring census):**
settings-view.tsx matches `loadFailed` + the alert's
`Couldn&apos;t load your account.` marker + the Retry handler — RED
pre-fix.

### CX6 — the doc chain

README badge `2144` → **2156** + the Session-149 row; AGENTS.md
commands-table census (1530 → **1542** unit; e2e 614 unchanged — the
5-chunk map 150+189+91+95+89 untouched) + the S149 lessons block;
CLAUDE counts (1530 → 1542); PAD v1.3.57 (the revision block + the §11
closure rows for B-M1/B-M2); the SKILL census (both sites); the vitest
header re-anchor (+12: data-store +6, script-conventions +6); the cert
runner unchanged (the e2e census is untouched this cycle);
`docs/session_171.md`; the worklog Session-160 entry; the plan §6
as-executed close; the `.env.example` contract re-verified (no env-var
reads change this cycle).

## §4 Execution order (TDD)

1. **RED legs first** (against the pre-fix tree): the CX1/CX2
   functional legs (the import failure IS the red — the CW2 precedent)
   + the six wiring-census legs across the five files; the CX3/CX4/CX5
   census legs. Expect 12 RED (2 import-failure files + 10 census
   legs).
2. **Implementation:** CX1 the two store chains + the four view
   rewires → CX2 the members chain + the two view rewires → CX3 the
   transport branch → CX4 the three calculator guards → CX5 the
   settings failure surface.
3. **Interim gates:** lint → typecheck → unit (expect 1542/1542,
   48 files, +12).
4. **The e2e GREEN run:** build (output captured to file — the S146
   SIGPIPE lesson) → the targeted calculator + parity-session5 (the
   tasks surface) + parity-session8 (the study-groups surface) +
   s17-auth (the login/settings surface) specs on the final tree →
   the full cold 5-chunk cert (150+189+91+95+89 = 614, per-chunk
   ALONE — the S142 lesson).
5. **The evidence capture** (`scripts/capture-s149-evidence.mjs`, the
   s148 precedent): the standing desktop frame + the standing mobile
   drawer frame + the cycle's surface frames (the study-groups detail
   + the settings profile tab — the CX2/CX5 surfaces); self-verifying
   (exists, >10 KiB, byte-diverse, md5-distinct).
6. **Final tree:** the census re-anchors → §6 close → commit + the
   SSH wrapper push (the wrapper's own procedure doc unchanged).

## §5 Riders considered, deferred (with reasons)

- **B-I1 (the mid-session 401 SPA seam):** a deliberate-looking design
  (server-gated routes redirect; sessions are 7-day) — recorded by the
  audit, no action this cycle.
- **B-I2 (the departed-note unmount-flush silence):** the documented
  S80/AG6 tradeoff — unchanged.
- **B-I3 (the in-band dev delivery of auth codes):** the documented
  no-SMTP posture (ADR-013) — unchanged.
- **B-I4 (the note-tag >24-char silent drop):** a validation-family
  honesty nit — stays with the B-I3 trim rider's validation-family
  cycle.
- **The TaskDialog/GroupDialog edit-form snapshot pattern:** the
  explicit full-form save is designed last-writer-wins (the user edited
  the form and saved) — not a finding; recorded here so the next audit
  does not re-litigate it.
- **B-L2 (the import lock-hold) + A-M3 (the chunked sub-tx + resume
  token):** the A-M3 family's own ADR-021 cycle (the standing scoping
  doctrine).
- **The B-I census-granularity design change, the login stale-mint
  sibling, A-F3, B-I2-reclass, the export streaming half, the
  post-sanitize entity-expansion re-check, the parseImportEnvelope
  duplication, the delete-note popover no-auto-close rider, the
  unthrottled authenticated GET posture (BZ5), the prewarm/auth-verdict
  note:** all unchanged (the carried S142–S148 deferrals).

## §6 As-executed close

**The RED inventory (as it ran):** the unit REDs **13/13** — the
CX1/CX2 functional legs (the import failure IS the red — the CW2
precedent: `mutations.toggleTaskMyDay`/`toggleTaskImportant`/
`setStudyGroupMembers` did not exist, the TypeError against the
pre-fix tree) + the six wiring-census legs (the four CX1 view sites +
the CX2 members-panel handlers — the census re-scoped mid-run to the
addMember/removeMember handler slice: the GroupDialog's own
submit-time read is the edit-form full-payload pattern, designed
last-writer-wins per §5, and the whole-file shape would have flagged
it) + the CX3/CX4/CX5 census legs. The plan's §4 inventory line said
"12" — it undercounted by the CX1 failed-toggle-no-poison leg (the
legs themselves are the inventory; the count is recorded here
honestly).

**Interim gates:** lint ✓ (after one root-cause fix: the CX5 effect's
synchronous `setLoadFailed(false)` tripped the
react-hooks/set-state-in-effect ERROR — restructured to the page.tsx
boot() inner-async shape, the rule never weakened) · tsc ✓ · unit
**1543/1543** (48 files, +13 exactly as designed).

**The build + targeted e2e:** build ✓ (exit 0, output captured to
file; the new wiring verified shipped in the standalone client + SSR
chunks — the CX5 alert copy present in both; the 6 Turbopack warnings
are the documented db-path/instrumentation baseline — files untouched
this cycle) · the targeted run — calculator + parity-session5 +
parity-session8 + s17-fresh-user + tasks (the cycle's five surfaces)
— **148/148 green** (the S127/CB16 double-toggle pin, the S134/CI4
quick-add guard pin, the calculator history legs, the parity pins,
the s17 Settings-Profile surfaces).

**The cold 5-chunk cert (the FINAL tree):** chunk 1 **150 first-pass**
(3.1 m) · chunk 2 **189 first-pass** (4.3 m) · chunk 3 **91
first-pass** (4.1 m) · chunk 4 **95 first-pass** (3.0 m) · chunk 5
**89 first-pass** (1.4 m) — **every chunk first-pass, ZERO flakes**
(the co-occurring SQLite socket-timeout + ai/chat generation-failed
noise lines are the documented machine-load / AI-key-less classes;
the chunks ran per-chunk ALONE — the S142 lesson, re-learned once
this cycle: the sandbox reaped two detached background runs of the
full cert script before the per-chunk foreground runner completed it
cleanly). The e2e census **614/614 unchanged** (no e2e-count change
this cycle, exactly as planned). **Census 2157 green** (1543 unit +
614 e2e; was 2144).

**Evidence:** four `docs/screenshots/149-clone-*.png` frames (the
standing desktop 237 KiB + the standing mobile drawer 64 KiB + the
cycle's axis surfaces: the study-groups detail 182 KiB [CX2] + the
settings profile tab 221 KiB [CX5]), self-verifying (exists, >10 KiB,
byte-diverse, dominant-share < 95%, md5-distinct — the capture
script's JSON verdict `ok: true`; dimensions + non-white center-band
shares machine-checked: 1440x900 / 390x844, 29.9–47.9%). The CX1
machine proof rides the unit layer (the double-toggle
opposite-value legs + the failed-toggle-no-poison leg + the two
wiring censuses — a double-click race is not screenshot-provable,
the CW2 runtime-split precedent); the CX3/CX4 proofs ride their
census legs + the targeted e2e suites.

**The doc chain:** README badge 2144 → 2157 + the Session-149 row;
AGENTS census (1530 → 1543) + the S149 lessons block (two lessons: a
chain fixed at one call site leaves its siblings a generation
behind — grep the field family in the same change, and the updater
form is what generalizes the idiom; an anti-enumeration catch must
not swallow transport failures — partition by "did the server decide
about the account?", with the loading-surface twin: a failed fetch
must never keep rendering its loading claim); CLAUDE counts; PAD
v1.3.57 (the revision block + the five §11 closure rows for
B-M1/B-M2/B-L1/B-L2/B-L3); the SKILL census (both sites); the vitest
header re-anchor (+13); the cert runner unchanged (the e2e census
untouched); `docs/session_171.md`; the worklog Session-160 entry;
this §6 close; the `.env.example` contract re-verified (no env-var
reads changed this cycle).

**The honest residuals:** the §5 deferrals stand unchanged (B-I1/B-I2/
B-I3 recorded; the TaskDialog/GroupDialog edit-form snapshot pattern
recorded as designed; B-L2 + A-M3 to the A-M3 ADR-021 cycle; the
carried S142–S148 family). The `skills/` folder untouched by every
check, test, and compile this cycle.
