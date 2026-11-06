# Remediation Plan — Session 151 (Cycle 101, Batch CZ)

> Status: PLANNED (pre-change record — the immutable plan; the as-executed
> close lives in §6). Written before any source change, per the standing
> doctrine ("write the cycle plan into docs/remediation-plan-sessionN.md
> BEFORE any source change").
>
> Operator directive: refresh the workspace, re-read the doc chain
> (AGENTS/CLAUDE/README/PAD/SKILL + session_173/174 +
> remediation-plan-session150 + worklog), validate against the codebase,
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

**Workspace (a FRESH CLONE at `b90c2f2` on `main` — the Batch CY fix
`1d4c293` + the operator's session_174 transcript commit; the sandbox had
reset).** Environment re-provisioned through the documented fresh-clone
path: `bun install` (510 pkgs) · `.env` created from the current
`.env.example` (`DATABASE_URL="file:../db/custom.db"` +
`NEXT_PUBLIC_SITE_URL=http://localhost:3000` + `AUTH_SECRET=""` — the
dev posture) · `db/` at the repo root (`db:push` + `db:seed` → the 389
KiB seeded demo account) · chromium-1243 re-provisioned after the fresh
install raised Playwright's pinned browser build · the dev daemon on
:3000.

**Cold baseline (before any work):**

| Gate | Result |
|---|---|
| `bun run lint` | ✓ 0 errors |
| `bun run typecheck` | ✓ 0 errors |
| `bun run test` (Vitest) | ✓ 1547/1547 (48 files) — the documented S150 final state exactly |
| `node scripts/dev-server-preflight.mjs` | GREEN — hydrated, navigation-stable (1 navigation, no reload loop) |
| `node scripts/drawer-check-s14.mjs` (live reference login) | GREEN — **the 66th consecutive no-Tailwind-v4-mobile-nav-bug confirmation** (backdrop oklab(0 0 0 / 0.2) + blur(4px); 288px white panels; 20 links; no footer; Escape-close superset) |
| `node scripts/parity-probe-s142.mjs` (live reference login; REF_PROBE_* exported) | **DESKTOP CHROME: MATCH** — all five formal checks (sidebar outer width 260, nav link count 20, first-links order, mainX 260, mainWidth 1180) |

**Baseline noise observed (recorded, not findings):** none.

**Probes run BEFORE the plan (the doctrine — probe, don't guess):** the
fresh-environment provisioning leg itself (dev daemon alive, db seeded,
gates green), the reference login + drawer + parity probes above, plus
every audit M/L finding re-verified by direct read of the current tree
before this plan was written (the anchors are in §1) — including the
e2e-interplay probe of every spec that touches the cycle's four surfaces
(the three Complete-session spec sites all START the timer first, so the
CZ3 gate passes for all; the s17-fresh-user "No files yet" pin rides the
EMPTY success path, so the CZ2 error branch is additive; no calculator
spec pins a toast count, so the CZ4 success toast rides free; the
parity-session7 seeded-tag pill and the parity-session9 combobox pins
ride the unchanged happy-path render).

## §1 The audits (Mode-C, read-only; every M/L finding re-verified by direct read)

Per the S150 closing directive — "the rotation continues — the FE/views +
auth/crypto axis (swept at S149) ages first" — this cycle takes that
axis (two cycles stale — the S149/CX-swept surface). The A-M3 family
stays its own ADR-021 cycle (the standing scoping doctrine; §5).

1. **Audit A — the Batch CY recent-changes audit** (the `1d4c293` diff
   itself: the CY1 multipart folderId guard, the CY2 schoolName trim at
   the validation atom, the CY3 addTag honest feedback, the hue-tokens
   register re-anchor, the capture script, the vitest header, the doc
   chain, every delivered test leg): **0C / 0H / 0M / 0L / 0I —
   clean**. All three CY claims verified **DELIVERED** at the source
   level — CY1 (the `rawFolder.length > 64` guard at
   src/app/api/files/route.ts:202, ordered before the `findFirst`, the
   no-oracle 404 copy) + CY2 (`schoolName: z.string().trim().max(120)
   .optional()` at src/lib/validation.ts:226 — the trim at the atom) +
   CY3 (the two drop-reason toasts at
   src/components/views/notes-view.tsx:440/:444 — "Tags are limited to
   24 characters." + "That tag is already on this note.", the empty
   case a no-op). The doc census machine-verified (README badge 2161 +
   the Session-150 row, AGENTS 1547/614 + the 5-chunk map 150+189+91+95
   +89, CLAUDE 1547, PAD v1.3.58, the SKILL census both sites [lines
   28 + 630], the vitest header 48 files/1547 tests). No new attack
   surface, no lock-order hazard (the three fixes touch disjoint
   surfaces).

2. **Audit B — the FE/views + auth/crypto rotation** (two cycles stale —
   the S149/CX-swept axis; the named next axis). The axis read was
   split per the S148/S149 precedent: the FE/views breadth scan
   dispatched to a read-only subagent (all 23 view files ≈13,320 lines +
   the 6 layout files + login-surface 752 + auth-route 39), the
   auth/crypto core audited by the orchestrator by direct read
   (src/lib/auth.ts 503 — the scrypt/HMAC/rate-limit primitives;
   src/lib/server/auth.ts 183 — the session gate; all 11 auth route
   files 1,112 lines; src/lib/api.ts 121). Every M/L finding from the
   subagent re-verified by direct read before this plan was written.

   **Auth/crypto half: 0C / 0H / 0M / 0L — clean.** Every
   historically-real family re-verified **CLOSED** at its anchors:
   - the scrypt parameter/versioning migration (S134/CI1): the 6-part
     parameter-carrying form + the legacy 3-part dual-verify window +
     the rehash drain on successful login (auth.ts:101-153, login
     route :120-125) + the explicit maxmem at every call site;
   - the login timing equalizer: the uniform scrypt PAIR on every
     branch (burnLoginScryptWork + burnComplement — auth.ts:181-221;
     the exhausted-account branch pays it too, login :102; the
     register verified-exists branch :121);
   - session tokens: HMAC-SHA256 + timingSafeEqual + expiry + the
     sessionVersion embedding (BS1 — readSessionToken rejects a stale
     v; getCurrentUser re-checks the live row's sessionVersion at
     server/auth.ts:111);
   - rate limiting: the process-wide containment budgets
     (loginGlobal:/registerGlobal:/authBurnGlobal: 40) + per-IP +
     per-account keys, the exact-key PROTECTED_BUCKETS whitelist (the
     CM1 fix), the net-of-successes decrement (CM3), the hard-cap
     eviction + lazy sweep (BV9/BU6);
   - the OTP family: peppered HMAC digests at rest (CG2), the
     timing-safe compare (CF7), the conditional single-use deleteMany
     consumption (BV11a — verify-email :127-136), the per-account
     attempt budget with the uniform 400 (BX2), the already-verified
     guard (CK10), the transactional re-issue triple (CU2);
   - the reset family: 24-byte tokens hashed at rest (BR6), the
     sessionVersion bump on reset (BS1), single-use conditional
     consumption, per-IP + per-account budgets;
   - cookies: httpOnly + lax + the proxy-aware Secure derivation
     (BU15 — set AND clear, BV2), maxAge derived from the single
     SESSION_TTL_MS source (CI6b);
   - the hashless select (SESSION_USER_SELECT never touches
     passwordHash; publicUser the single mapper) + the proxy-hop
     client-IP contract (fail-closed, BU3).

   **FE/views half: 0C / 0H / 1M / 6L / 4I.** The two S149-fixed
   families re-verified FULLY LANDED at every consumer site: all
   toggle-style PATCHes ride the per-id chains (toggleTask/
   toggleTaskMyDay/toggleTaskImportant at tasks-view:528-535,
   myday-view:90-97, dashboard-view:155, calendar-view:457 — zero
   stale render-snapshot call sites remain) and the study-group members
   ops ride setStudyGroupMembers (studygroups-view:230/:252). The XSS
   posture is clean (zero dangerouslySetInnerHTML in scope; the Quill
   mount routes through the sanitizer; link files server-gated to
   ^https?://; rel="noreferrer"). A11y thorough (aria-labels on every
   icon-only button, Radix focus/Escape, the drawer's WCAG-2.2 focus
   trap, aria-live toaster). The CX4 save-latches present (the
   calculator justEvaluated no-op + the GPA/unit latches, busy/saving
   guards on every dialog submit).

   **The finding (the M, re-verified by direct read):**
   - **B-M1 — the note-tag add/remove PATCHes ride the stale render
     snapshot** (src/components/views/notes-view.tsx:423-452). The
     S149/CX2 chain fixed the study-group members field; the notes
     tags field is the same family one field over: `selectedTags` is
     derived from the render's `selected.tags` (:423), and every tag
     mutation PATCHes an ABSOLUTE JSON array computed from it
     (`saveTags([...selectedTags, tag])` :447,
     `saveTags(selectedTags.filter(...))` :451 — no chain, no queue,
     no optimistic store write). Two tag operations inside one
     PATCH+fetchAndSet round-trip compute from the same pre-op base;
     the second PATCH silently discards the first op's effect (both
     succeed; tag adds carry no success toast, so the loss is fully
     silent). The tag row renders from the store, so it stays
     visually stale until the refetch lands — the stale visual invites
     the second action.

   **The Ls (re-verified by direct read):**
   - **B-L1** the files view's failed INITIAL load settles into a
     persistent false "No files yet" (files-view.tsx:237-264 — the
     catch fires only the transient toast, the finally flips loading
     false, and the render :478-494 has no error branch: the
     EmptyState claims an empty account; the only recovery is
     navigating away and back. Files is the one view with a private
     loader — the shell's BootDataFailureBar doesn't cover it. The
     exact CG5/CX5 class, one view over).
   - **B-L2** the practice-tests "AI Generate Questions" silently
     REPLACES the edit dialog's pre-populated drafts
     (practicetests-view.tsx:220 `setDrafts(drafts)` — no confirm, the
     success toast doesn't say "replaced"; a save without noticing
     permanently discards the authored questions).
   - **B-L3** the focus timer's "Complete session" on a never-started
     timer logs a phantom 1-second completed session
     (focustimer-view.tsx:121-151 + :369-377 — the button gates only
     on `saving`; a fresh timer computes `Math.max(1, durations.focus
     - remaining)` = `Math.max(1, 0)` = 1, POSTs the phantom row,
     toasts success, and auto-switches to Short Break — stats +1, a
     spurious saved row, polluted Focus Time analytics, from one
     stray click).
   - **B-L4** the unit converter's "Save to history" gives no success
     feedback (calculator-view.tsx:671-685 — the error branch toasts,
     the success branch is silent; the GPA twin toasts "GPA saved to
     history" at :523. The user cannot tell whether the conversion
     was recorded, especially with the history panel closed).
   - **B-L5** the seven fire-and-forget delete handlers
     (events-view:206, exams-view:212, assignments-view:179,
     flashcards-view:209 + :218, notes-view:387 + :396) carry no
     in-flight guard: a double-click inside the DELETE→refetch window
     sends two DELETEs for the same id; the first succeeds, the
     second 404s and the catch toasts the 404's "…does not exist."
     copy — spurious error feedback on top of a successful delete.
   - **B-L6** six `noValidate` dialogs (timetable:559, flashcards:738
     + :816, exams:429, events:425, assignments:416, notes:967) submit
     with no empty-field client guard, so an empty required title
     round-trips to the server and surfaces Zod's default copy
     verbatim in the inline role="alert" ("title: String must contain
     at least 1 character(s)") — honest but machine-worded,
     inconsistent with the sibling dialogs' hand-written copy (the
     tasks-view:277 `if (!title.trim()) return;` and the files link
     dialog's CB17 guard are the in-repo precedents), plus one wasted
     round-trip.

   **The Is (recorded, adjudicated in §5):** **B-I1** the timetable
   "Grid Builder" outline button is a rendered no-op — the documented
   S138/CM6 parity adjudication (the reference's own button is a
   no-op); **B-I2** the math solver subtitle says "or upload an image"
   while the API contract requires a typed problem (a copy nit — the
   button honestly disables; recorded); **B-I3** the dashboard "Due
   Soon" hint/icon say "assignments" while the value counts tasks due
   in 0-7 days — the hint + icon + gradient are the S4-K/s68
   MEASURED reference parity (the reference's own quirk reproduced
   faithfully), and the value source is the clone's documented choice
   (unknowable from outside the reference); **B-I4** the dashboard
   CTA anchor>nested-button anatomy — the documented S4-Q/AJ6 parity
   decision with the CG7 click guard correctly implemented at all
   three sites.

**Every M/L finding above was re-verified by direct read of the
current tree before this plan was written** — B-M1 at
notes-view.tsx:423-452 (the absolute-array PATCH shapes; no chain in
data.ts's notes block :654-667); B-L1 at files-view.tsx:237-264 + the
:478-494 render branch (no error branch; the CX5 settings
loadFailed/retryCount pattern at settings-view.tsx:1091-1112 +
:1184+ the in-repo template); B-L2 at practicetests-view.tsx:167-177
(the draft initialization) + :220 (the replace); B-L3 at
focustimer-view.tsx:121-151 (the Math.max(1, …) floor) + :369-377
(the ungated button) + :194-216 (switchMode/applyPreset/reset all
reset remaining to the full preset with running=false — the
never-started state is exactly `!running && remaining >=
durations[mode]`); B-L4 at calculator-view.tsx:671-685 + :523 (the
GPA twin); B-L5 at all seven handler sites; B-L6 at all six dialog
sites + src/lib/server/http.ts:53-58 (formatZodError surfaces
`field: message`) + src/lib/validation.ts:31 (boundedTitle carries no
custom min message).

## §2 The cycle (Batch CZ — the tags-chain + load-honesty + phantom-row + save-feedback set)

The axis contributes its one actionable M as CZ1 (the tags field joins
the CX2 updater-form chain family — the last unfixed member of the
BX10/CX1/CX2 race class). The cycle also carries the three honest-L
fixes the same axis surfaced: CZ2 the files failed-load surface (the
CG5/CX5 failure-surface family, the one view the shell bar doesn't
cover), CZ3 the phantom-session gate (a stray click must not mint a
phantom analytics row — the BX6 elapsed-honesty family), and CZ4 the
unit-save success feedback (the consistency rider — one line, the GPA
twin's mirror). Four one-family fixes, one theme: the FE's honest
reaction to what actually happened — a chained base, a surfaced
failure, a gated phantom, a spoken success.

## §3 The fixes (design, anchors verified)

### CZ1 — the note-tags updater chain (B-M1)

**The finding (verified by direct read):** the tag mutations PATCH
absolute arrays computed from the render snapshot; two ops in one
PATCH+refetch window silently lose one.

**The fix (the CX2 updater-form idiom, verbatim shape):**

1. `src/lib/data.ts` — export the tags parse as the single source
   (moved from notes-view.tsx:92 — the same safe-parse body, the
   `NoteRow.tags` JSON contract → a sorted-unique-list equivalent;
   notes-view imports it from data.ts and drops its local copy; the
   list-row parse at :691 and the selectedTags parse at :423 ride the
   same export):

   ```ts
   /** The NoteRow.tags JSON contract → a string list (safe parse —
    *  the single source for the view rows AND the tags chain). */
   export function parseNoteTags(raw: string): string[] { … }
   ```

2. `src/lib/data.ts` — the per-note chain map (beside the two
   existing maps at :470-475) + the updater-form mutation (in the
   notes block, beside updateNote):

   ```ts
   const noteTagsChains = new Map<string, Promise<void>>();

   // S151/CZ1 (audit B-M1): the per-note tags chain — the CX2
   // updater form on the notes tags field (the members fix, one
   // field over: the view's addTag/removeTag PATCHed ABSOLUTE arrays
   // computed from the RENDER-SNAPSHOT selected note, so two tag ops
   // inside one PATCH+refetch window computed from the same stale
   // base and silently dropped the first). The caller declares the
   // effect (add/remove); the chain supplies the post-settle base.
   setNoteTags: async (
     noteId: string,
     update: (tags: string[]) => string[],
   ): Promise<void> => {
     const chained = (noteTagsChains.get(noteId) ?? Promise.resolve()).then(async () => {
       const note = useDataStore.getState().notes.find((n) => n.id === noteId);
       if (!note) return;
       const tags = update(parseNoteTags(note.tags));
       await apiSend("PATCH", `${PATHS.notes}/${noteId}`, { tags: JSON.stringify(tags) });
       await fetchAndSet("notes");
     });
     const stored = chained.catch(() => undefined);
     noteTagsChains.set(noteId, stored);
     stored.finally(() => {
       if (noteTagsChains.get(noteId) === stored) noteTagsChains.delete(noteId);
     });
     await chained;
   },
   ```

3. `src/components/views/notes-view.tsx` — the view declares effects,
   never computes absolute arrays; the view-level guards stay (the
   24-char cap + the duplicate toast — user feedback is the caller's
   job), and the updater is idempotent (the belt-and-braces dedupe —
   a double-Enter on the same tag inside the window must not append a
   duplicate when the chain's fresh base already carries it):

   ```ts
   const addTag = () => {
     const tag = tagDraft.trim().replace(/^#/, "");
     setTagDraft("");
     if (!tag) return;
     if (tag.length > 24) { toast.error("Tags are limited to 24 characters."); return; }
     if (selectedTags.includes(tag)) { toast.error("That tag is already on this note."); return; }
     void mutations.setNoteTags(selected.id, (tags) =>
       tags.includes(tag) ? tags : [...tags, tag]);
   };

   const removeTag = (tag: string) => {
     void mutations.setNoteTags(selected.id, (tags) => tags.filter((t) => t !== tag));
   };
   ```

   The `saveTags` helper (:425-427) is REMOVED (its two call sites
   were the only consumers). The addTag/removeTag handlers render
   only inside the selected-note editor pane (`selected` non-null —
   the same invariant patchSelected already relies on).

**Blast radius (verified by direct read):** the happy-path render is
byte-identical (a single op computes the same array); the
parity-session7 seeded-tag pill pin and the parity-session9 combobox
pins ride the unchanged render; the tags PATCH payload stays a JSON
string within the noteSchema 2000-char bound (max ~50 tags at 24
chars — no bound interplay); the CY3 toasts stay verbatim; the
autosave title/content PATCHes are unaffected (different fields, no
chain needed — a field-scoped chain per the CX1 cross-field note).

**The test legs (tests/data-store.test.ts, functional — the CX1/CX2
pattern with the captured apiSend/apiGet mocks):**
- two rapid tag ops inside one window send from the POST-SETTLE base:
  hold the first PATCH (add "alpha"), run the second (remove "zulu")
  while in flight, land the refetch with BOTH tags — the remove's
  updater must receive `["zulu", "alpha"]` (the post-settle base) so
  the second PATCH carries `["alpha"]` — both ops survive. RED
  pre-fix: `mutations.setNoteTags` does not exist (the TypeError is
  the red — the CX1 precedent);
- a FAILED first tag PATCH does not poison the chain (the caller gets
  the rejection; the second op still runs against the unchanged base
  — the stored `.catch(() => undefined)` chain hygiene pin);
- a missing note is a no-op (a deleted note's chain link never
  PATCHes — the CX2 missing-group shape).

**The test leg (tests/script-conventions.test.ts, wiring census — the
CV1/CX1 precedent):** notes-view's addTag/removeTag ride
`mutations.setNoteTags(selected.id, …)` with updater-form calls; the
absolute-array shapes (`saveTags([...selectedTags`, `saveTags(
selectedTags.filter`) are GONE; the idempotent add updater carries
the `tags.includes(tag)` guard. RED pre-fix (the marker does not
exist).

### CZ2 — the files failed-load surface (B-L1)

**The finding (verified by direct read):** a failed initial files GET
toasts once (transient) then permanently renders the "No files yet"
EmptyState — a false claim of an empty account, no retry.

**The fix (the CX5 settings pattern, verbatim shape):**
`src/components/views/files-view.tsx` —
- `loadFailed` + `retryCount` state; the initial-load effect's deps
  gain `retryCount` (the retry re-runs the effect; the existing
  ticket + cancelled discipline already covers supersession);
- the catch keeps the toast (the immediate aria-live announcement)
  AND sets `loadFailed(true)`; a successful load sets `loadFailed(
  false)` (the retry clears the alert on success — the CX5 shape);
- the render branch gains the error leg BEFORE the empty branch:
  `loading ? spinner : loadFailed ? (the sf-alert-red role="alert"
  card: "Couldn't load your files." + a Retry button wired to
  setRetryCount((c) => c + 1)) : empty ? EmptyState : grid` — the
  false "No files yet" can no longer render on a failed load.

The upload/list error paths are untouched (their toasts stay; only
the INITIAL load gains the persistent surface — the loader's `error`
state is per-fetch, not per-row).

**The test leg (tests/script-conventions.test.ts, census — the CX5
precedent):** files-view's body carries `loadFailed`, the
`setLoadFailed(true)` in the initial-load catch, the
`setRetryCount` retry wiring, and the render's error leg ordered
BEFORE the "No files yet" EmptyState branch (ordered anchors — the
loadFailed branch's index < the EmptyState title's index). RED
pre-fix.

**e2e interplay (probed):** the s17-fresh-user "No files yet" pin
rides the EMPTY success path (a fresh account, loadFailed false) —
unaffected.

### CZ3 — the phantom-session gate (B-L3)

**The finding (verified by direct read):** "Complete session" on a
never-started timer POSTs `Math.max(1, 0)` = a phantom 1-second
completed focus session + a success toast + an auto-switch to Short
Break.

**The fix (the honest gate, at the top of `complete` — after the
saving window guard, before any state change):**
`src/components/views/focustimer-view.tsx` —

```ts
// S151/CZ3 (audit B-L3): the phantom-session gate — a Complete on a
// never-started timer (running never flipped, remaining at the full
// preset — the state after every mount/switchMode/applyPreset/reset)
// has NO elapsed interval; the old path floored the zero elapsed to
// 1 s and minted a phantom completed session (stats +1, a spurious
// saved row, an auto-switch to Short Break) from one stray click.
// A real interval exists iff the timer ran (running) or any time
// came off the preset (remaining < durations[mode]).
if (!running && remaining >= durations[mode]) {
  toast.info("Start the timer first — there's no session to save yet.");
  return;
}
```

`running` JOINS the useCallback deps (the CD3 discipline — the
existing array `[saving, mode, durations, remaining, subjectId,
settleSeq, toast]` gains it; the deps comment gains the reason). The
auto-completion path (the effect at remaining===0, running true) and
the paused-with-elapsed manual path (remaining < durations[mode])
both pass the gate unchanged. The break-mode complete (a never-run
break now toasts the gate line instead of "Break's over") is the
same honesty fix — nothing ran, so nothing is over.

**e2e interplay (probed):** all three Complete-session spec sites
(resilience:856, parity-session5:876, parity-session8:804) START the
timer and let ≥1 s elapse before completing — the gate passes for
all three, byte-identical behavior.

**The test leg (tests/script-conventions.test.ts, census — the CX4
precedent):** the complete handler's body carries the gate marker
(`!running && remaining >= durations[mode]`) BEFORE the
`createFocusSession` call (ordered anchors), and the callback's deps
array carries `running` alongside `saving`. RED pre-fix.

### CZ4 — the unit-save success feedback (B-L4)

**The finding (verified by direct read):** `saveUnitToHistory` toasts
only on error; the GPA twin toasts "GPA saved to history" — the unit
save is silent on success.

**The fix (one line, the GPA twin's mirror):**
`src/components/views/calculator-view.tsx` — after the
`createCalculatorEntry` await in `saveUnitToHistory`:

```ts
toast.success("Conversion saved to history");
```

**The test leg (tests/script-conventions.test.ts, census — the CX4
precedent):** the saveUnitToHistory body carries the success toast
marker after the createCalculatorEntry call (ordered anchors). RED
pre-fix.

### CZ5 — the doc chain

README badge `2161` → **2169** + the Session-151 row; AGENTS.md
commands-table census (1547 → **1555** unit; e2e 614 unchanged — the
5-chunk map untouched) + the S151 lessons block; CLAUDE counts
(1547 → 1555); PAD v1.3.59 (the revision block + the §11 closure
rows for B-M1 + B-L1/B-L3/B-L4); the SKILL census (both sites); the
vitest header re-anchor (+8: data-store +3, script-conventions +5);
the cert runner unchanged (the e2e census untouched this cycle);
`docs/session_175.md`; the worklog Session-162 entry; the plan §6
as-executed close; the `.env.example` contract re-verified (no
env-var reads change this cycle).

## §4 Execution order (TDD)

1. **RED legs first** (against the pre-fix tree): the CZ1 functional
   triple (data-store.test.ts — the add-then-remove post-settle-base
   leg + the failed-first-op chain-hygiene leg + the missing-note
   no-op leg, the CX2 triple shape), the CZ1 wiring census (two legs:
   the updater-form wiring + the saveTags-helper retirement), the CZ2
   census, the CZ3 census, the CZ4 census. Expect **8 RED** (3
   functional + 5 census).
2. **Implementation:** CZ1 (the parseNoteTags move + the chain + the
   view rewires) → CZ2 (the files error surface) → CZ3 (the timer
   gate + the deps gain) → CZ4 (the one-line toast).
3. **Interim gates:** lint → typecheck → unit (expect 1555/1555,
   48 files, +8).
4. **The e2e GREEN run:** build (output captured to file — the S146
   SIGPIPE lesson) → the targeted specs on the cycle's four surfaces
   (resilience [the timer settle-CAS + offline legs],
   parity-session5 [the elapsed-duration + notes/calculator pins],
   parity-session7 [the seeded-tag pill + files pins],
   parity-session8 [the complete-button icon], calculator, s17-fresh
   -user [the files empty pin], mobile-navigation) with the manual
   cold discipline (kill :3100 + `rm db/e2e.db` — the direct-
   invocation rule) → the full cold 5-chunk cert (150+189+91+95+89 =
   614, per-chunk ALONE in the foreground — the S142/S149/S150
   lesson).
5. **The evidence capture** (`scripts/capture-s151-evidence.mjs`, the
   s150 template): the standing desktop frame + the standing mobile
   drawer frame + the cycle's surface frames (the Notes editor tag
   row — CZ1's surface; the Files view — CZ2's surface; the Focus
   timer — CZ3's surface); self-verifying (exists, >10 KiB,
   byte-diverse, md5-distinct).
6. **Final tree:** the census re-anchors → §6 close → commit + the
   SSH wrapper push (the wrapper's own procedure doc unchanged).

## §5 Riders considered, deferred (with reasons)

- **B-L2 (the AI-generate replace guard):** a product decision (an
  AlertDialog replace-confirm vs append semantics — a new dialog
  pattern in that view), not a mechanical fix; recorded as the named
  next-cycle candidate.
- **B-L5 (the delete double-fire latch, 7 sites):** a coherent
  family sweep of its own (the deletingId in-flight idiom across the
  five views' seven handlers); pairs with B-L6 as a future
  dialog/deck-honesty cycle. Recorded.
- **B-L6 (the noValidate hand-guards, 6 dialogs):** a coherent
  copy-family sweep (the tasks-view guard shape across six dialogs —
  each needs its own hand-written copy per field); recorded with
  B-L5.
- **B-I1 (the Grid Builder no-op):** the documented S138/CM6 parity
  adjudication (the reference's own button is a no-op) — unchanged.
- **B-I2 (the math solver subtitle):** a copy nit on a superset
  feature; the button honestly disables and the contract is
  documented; recorded.
- **B-I3 (the Due Soon hint):** the hint/icon/gradient are the
  S4-K/s68 MEASURED reference parity; the value source is the
  clone's documented choice (unknowable from outside the reference);
  unchanged.
- **B-I4 (the anchor>button anatomy):** the documented S4-Q/AJ6
  parity decision; the CG7 click guard verified at all three sites;
  unchanged.
- **B-I1/B-I2/B-I3/B-I4 of the S149 audit** (the mid-session 401 SPA
  seam, the departed-note flush silence, the in-band dev code
  delivery, the note-tag silent drop — the last CLOSED by S150/CY3):
  recorded; the first three unchanged.
- **The TaskDialog/GroupDialog edit-form snapshot pattern:** designed
  last-writer-wins (the S149 adjudication — recorded so no audit
  re-litigates).
- **The A-M3 stage-2 chunked sub-tx + resume token (carrying the
  S150/B-L2 import lock-hold finding):** its own ADR-021 cycle (the
  standing scoping doctrine; unchanged).
- **The db-path percent-decode (the S150 B-I3):** dev-only, db-path
  is the repo's most fragile invariant — recorded for a db-path-
  family cycle.
- **The limiter hard-cap eviction trade-off (S121/BV9), the
  unthrottled authenticated GET posture (BZ5), the withUserParams
  404-before-401 taxonomy nit (S150 B-I4), the B-I
  census-granularity design change, the login stale-mint sibling,
  A-F3, the export streaming half, the post-sanitize
  entity-expansion re-check, the parseImportEnvelope duplication,
  the B-I2 data.ts inline CAS twin:** all unchanged (the carried
  S142–S150 deferrals).

## §6 As-executed close

**The RED inventory (as it ran):** the unit REDs **8/8** — the CZ1
functional triple (data-store.test.ts: the add-then-remove leg — the
remove's updater must receive the post-settle base `["zulu","alpha"]`
and PATCH `["alpha"]`, pre-fix `mutations.setNoteTags` did not exist,
the TypeError RED, the CX1 precedent; the failed-first-op
chain-hygiene leg; the CX2-shaped missing-note no-op leg) + the CZ1
wiring-census pair (the updater-form wiring + the `saveTags`
absolute-array helper retirement) + the CZ2 files failed-load census +
the CZ3 phantom-session-gate census + the CZ4 unit-save-success
census. Exactly the amended inventory (the plan's arithmetic was
amended twice before execution per the S150 precedent — the functional
pair grew to the CX2-shaped triple and the wiring census carried two
legs, 6 → 7 → 8 RED, the unit count 1553 → 1554 → 1555).

**Interim gates:** lint ✓ · tsc ✓ (after the `selected` null guards —
the patchSelected idiom — joined the two tag handlers) · unit
**1555/1555** (48 files, +8 exactly as designed) — after one census
tripwire tripped and closed as designed: the CZ1 rewire's net +5 lines
moved the hue-tokens notes-view register site 700 → 705 (the second
consecutive cycle the anchored leg has tripped on a notes-view edit —
the census maintenance, the site itself byte-unchanged).

**The build + targeted e2e:** build ✓ (exit 0, output captured to
file; the four fix wirings verified shipped in the standalone chunks —
`setNoteTags` in the client + SSR page chunks, `Couldn't load your
files.` [the JSX entity compiled to the apostrophe], `no session to
save yet`, `Conversion saved to history`; the 6 Turbopack warnings are
the documented db-path/instrumentation baseline — files untouched
this cycle). The targeted run — four cold-booted per-chunk groups (the
S150 chunk-mix lesson applied from the start): chunk 3's resilience +
parity-session5 **87 green** · chunk 4's calculator + s17-fresh-user
**25 green** · chunk 2's parity-session7 **57 green** · chunk 1's
parity-session8 + mobile-navigation **86 green** — 255 legs, zero
failures, zero artificial chunk mixes.

**The cold 5-chunk cert (the FINAL tree):** chunk 1's first attempt
carried ONE failure — the S120/BU7 dashboard-exam-badges leg —
root-caused as the documented P1008 SQLite socket-timeout
machine-load class by three independent signals (the exact Prisma
error line in the server log naming `prisma.exam.create()` — the BU7
probe's own POST; the same-shape sibling exam-badge test passing in
the same run; the clean 2/2 cold re-run of the single leg), with 13
P1008 noise lines clustering in the same run. The clean cold re-runs:
chunk 1 **150 first-pass** (3.3 m) · chunk 2 **189 first-pass**
(4.6 m) · chunk 3 **91 first-pass** (4.1 m) · chunk 4 **95 first-pass**
(3.4 m) · chunk 5 **89 first-pass** (1.5 m) — **every chunk
first-pass, ZERO code flakes** = the e2e census **614/614 unchanged**
(no e2e-count change this cycle, exactly as planned). **Census 2169
green** (1555 unit + 614 e2e; was 2161).

**Evidence:** five `docs/screenshots/151-clone-*.png` frames (the
standing desktop 235 KiB + the standing mobile drawer 65 KiB — the
66th drawer-GREEN companion frame + the Notes editor tag row 208 KiB
[CZ1's surface] + the Files view 213 KiB [CZ2's surface] + the Focus
timer 259 KiB [CZ3's surface]), self-verifying (exists, >10 KiB,
byte-diverse, dominant-share < 95%, md5-distinct — the capture
script's JSON verdict `ok: true`; dimensions machine-checked
1440x900 / 390x844). The CZ4 transient-toast proof rides the census
layer (the S151/CZ4 leg — the CW2 runtime-split precedent: a
transient toast is not screenshot-provable).

**The doc chain:** README badge 2161 → 2169 + the Session-151 row;
AGENTS census (1547 → 1555) + the S151 lessons block (three lessons:
a chain family is closed when the last FIELD joins it — grep for
every absolute-array mutation off render state, and the parse the
chain needs belongs at the single source; a false empty state is a
claim about the SERVER — enumerate the loaders, not just the store
slices, every private loader needs the loadFailed + Retry shape
ordered before the empty branch; a state-derived action needs a
state-derived gate — check what the derived value means at the
initial state and gate on the initial state itself, with the reason
named); CLAUDE counts; PAD v1.3.59 (the revision block + the four
§11 closure rows); the SKILL census (both sites); the vitest header
re-anchor (+8 with the hue-tokens re-anchor note); the cert runner
unchanged (the e2e census untouched); `docs/session_175.md`; the
worklog Session-162 entry; this §6 close; the `.env.example`
contract re-verified (no env-var reads changed this cycle).

**The honest residuals:** the §5 deferrals stand (the AI-generate
replace guard — the named next-cycle candidate, a product decision;
the seven-site delete double-fire latch + the six-dialog noValidate
hand-guards — the dialog/deck-honesty cycle pair; the A-M3/B-L2
ADR-021 cycle; the db-path percent-decode [a db-path-family cycle];
the four FE Is [the Grid-Builder parity adjudication, the solver
subtitle nit, the Due-Soon measured-hint parity, the anchor>button
documented parity]; the carried S142–S150 family — the limiter
hard-cap eviction trade-off, the unthrottled GET posture, the
withUserParams 404-before-401 taxonomy nit, the B-I
census-granularity design change, and the rest unchanged). The
`skills/` folder untouched by every check, test, and compile this
cycle.
