# Session 184 — the shared EmptyState family re-rotation cycle (the S184 axis)

## §0 The context and the baseline

The S183 close (commit `6818823`, pushed): the Files family ported (the
type filter, the sectioned grid, both cards, the list mode, the preview +
move dialogs, the PATCH move wire), unit 1795/1795 (55 files), e2e 691
across the 5-chunk cold map, badge 2486, the drawer check at its 125th/
126th consecutive, the desktop parity probe MATCH, the reference account
at TRUE ZERO residue (files-local).

This session's cold baseline reproduced that close EXACTLY:
`bun install` (510 pkgs) → `.env` at `DATABASE_URL="file:../db/custom.db"`
with `db/` at the repo root → db push + seed → lint ✓ · tsc ✓ · unit
**1795/1795 (55 files)** · build ✓ (the seven edge-instrumentation
warnings pre-existing). The pinned chromium v1243 re-provisioned (the
fresh sandbox carried only v1200). The standing chrome at the open:
the drawer check GREEN (**the 127th consecutive** — no Tailwind v4
mobile-nav bug), the desktop parity probe MATCH (all five structural
checks, both hosts).

The cycle's axis is the FIRST named S184 candidate recorded in the
S183 worklog tail: **the shared EmptyState family re-rotation** — the
S183 plan §1.12's finding that the S182 "bare icon" record was a
partial-capture mis-read, with the family-wide axes (the px-4-vs-px-6,
the h3-vs-h2, the mb-2-vs-mt-4) recorded for this cycle.

## §1 The measured reference inventory (re-measured live, 2026-11-14)

Eight probe scripts (scripts/ref-probe-s184-empty*.mjs, evidence at
`docs/probe-evidence/s184/`) measured the family live. The account held
**two leftover residue rows** discovered at the open — an "S135 parity
probe task" and the "S79 Probe Deck 1" deck (the S183 close's
"TRUE ZERO" claim was files-local; the task + deck families were not
swept) — both deleted through the reference's own UI; the account ends
this cycle at TRUE ZERO (the 14-view clean census, the deck create/
delete round-trip included).

1. **The shared family anatomy** (measured on Tasks/Assignments/Exams/
    Notes/Practice Tests/Study Groups/Files — identical on every site):
   - the container: `flex flex-col items-center justify-center py-16
     px-4 text-center` — the children in DIRECT order: the wrapper DIV,
     the title H3, the hint P, [the CTA BUTTON]
   - the wrapper: `w-20 h-20 rounded-2xl bg-gradient-to-br
     from-violet-100 to-indigo-100 flex items-center justify-center
     mb-6` — computed `linear-gradient(to right bottom, rgb(237,233,254),
     rgb(224,231,255))` (violet-100 → indigo-100), margin-bottom 24px
   - the icon: `w-10 h-10 text-violet-500` (40px, rgb(139,92,246))
   - the title: **H3** `text-xl font-semibold text-slate-800 mb-2`
     (20px/600, margin-bottom 8px)
   - the hint: **P** `text-slate-500 max-w-sm mb-6` (16px, max-w-sm
     384px, margin-bottom 24px — the CTA gap rides the HINT's mb-6,
     never a wrapper div)
   - the CTA: the shadcn-shaped button — `linear-gradient(to right,
     rgb(139, 92, 246), rgb(79, 70, 229))` (violet-500 → indigo-600),
     36px tall (h-9), px-4 text 14px/500, radius 6px, and the computed
     shadow **`rgba(0,0,0,0.1) 0 1px 3px 0px, rgba(0,0,0,0.1) 0 1px
     2px -1px`** — the PLAIN `sf-gradient-shadow` (the S5 record's
     "empty-state CTAs carry shadow-lg" claim is SUPERSEDED by this
     direct measurement; the FocusTimer play button's lg pin is its
     own surface and stands)
2. **The per-view placements** (all BARE — no card ancestors anywhere;
    the ancestor chains walk container → layout div → `p-4 lg:p-8` →
    main):
   - Tasks: inside the list scroll pane (`flex-1 overflow-y-auto
     space-y-2 pr-2`); copy "No tasks yet / Create your first task to
     get started / **Create Task**" (the CTA reads Create Task — the
     toolbar's own Add Task is a DIFFERENT surface)
   - Assignments: bare in the `space-y-3` content column
   - Exams: bare inside the exam grid's spanning cell
     (`md:col-span-2 lg:col-span-3`) — the 3-col grid renders with the
     empty occupying its cell
   - Notes: inside the LIST pane's scroll area (the w-80 sidebar) — the
     clone already matches (the S177/EA3 pin)
   - Practice Tests: bare in the `space-y-6` column — the clone already
     matches (the S7-P pin)
   - Study Groups: inside the LIST panel (the w-80 sidebar) — the clone
     already matches (the S65 re-measure)
   - Files: bare in the sectioned content — the clone already matches
     (the S183/EG port)
3. **The Flashcards two-pane split at zero** (measured at TRUE zero):
   - the SIDEBAR (w-80) carries the family empty: "No decks yet /
     Create your first flashcard deck / **Create Deck**" (the full
     anatomy — the w-20 wrapper, the H3, the hint, the CTA)
   - the MAIN pane carries the family empty: "Select a deck / Choose a
     flashcard deck from the sidebar" (NO CTA) — rendered whenever no
     deck is selected, INCLUDING at zero decks
   - the deck-detail zero-cards state: the family empty "No cards in
     this deck / **Add flashcards to start studying** / Add Card"
     (measured via a disposable deck create → capture → delete
     round-trip; deck create is NOT the 402-blocked upload endpoint)
4. **The non-family empties (measured, no port)**: the Calendar
   day-detail "No events for this day" (p.text-slate-400 text-center
   py-8) ✓ the clone matches; the Events "No events" list rows ✓; the
   Timetable renders the FULL GRID at zero subjects with the slim
   "No subjects added yet. Go to Settings to add subjects." empty in
   the My Classes side panel (p.text-center text-slate-400 py-8) —
   the clone instead renders the family EmptyState INSTEAD of the grid
   (the §2 drift); Grade Tracker/Analytics/My Day render their
   unconditional stat cards/inline empties ✓ (the S17 posture).

## §2 The clone's drift (the gap table)

| Surface | The reference | The clone (pre-port) | Class |
| --- | --- | --- | --- |
| Container padding | `py-16 px-4` | `py-16 px-6` | visual |
| Wrapper spacing | `mb-6` on the wrapper | no mb-6 (the title carries mt-4) | visual |
| Title tag/spacing | H3 `… mb-2` | h2 `mt-4` (no mb-2) | visual (the tag: adjudicated §6.1) |
| Hint | `text-slate-500 max-w-sm mb-6` | `mt-1 text-base` (no max-w-sm, no mb-6) | visual |
| CTA placement | direct child | wrapped in `<div className="mt-6">` | structural |
| CTA shadow | the plain `sf-gradient-shadow` | `sf-gradient-shadow-lg` on 8 sites | visual |
| Tasks CTA copy | "Create Task" | "Add Task" | copy |
| Flashcards zero-decks placement | the SIDEBAR carries the family empty ("Create Deck") | the MAIN pane carries it (inside sf-card); the sidebar shows a slim p | structural |
| Flashcards select-a-deck | the family empty (H3 + hint) | a bare `<p>Select a deck.</p>` | structural + visual |
| Flashcards zero-decks CTA copy | "Create Deck" | "New Deck" | copy |
| Flashcards deck-detail hint | "Add flashcards to start studying" | "Add cards manually or let the AI draft them for you." | copy |
| Assignments wrapper | bare | `sf-card` wrapper | visual |
| Exams wrapper | bare, inside the grid's spanning cell | `sf-card` replacing the grid | structural |
| Timetable zero-state | the grid ALWAYS renders + the slim empty in the My Classes panel | the EmptyState replaces the grid | structural |
| Notes / Practice Tests / Study Groups / Files | bare / bare / list-panel / sectioned | ✓ already match | — |

## §3 The port design (the superset mapping)

All view-layer sites; NO new seams, NO wire changes, NO schema touches.

1. **`src/components/views/shared.tsx` `EmptyState`** — the five class
   changes: `px-6` → `px-4`; the wrapper gains `mb-6`; the title gains
   `mb-2` and DROPS `mt-4` (keeps h2 — §6.1); the hint gains
   `max-w-sm mb-6` and drops `mt-1`; the CTA renders as the direct
   child (the wrapping `<div className="mt-6">` retires). The
   accent-aware tokens stay (the icon `text-sf-primary`, the
   inline-style empty-from/to gradient — §6.2). The dark classes stay
   (§6.7).
2. **The 8 CTA sites** (assignments, exams, flashcards x2, notes,
   practicetests, tasks, timetable): drop `sf-gradient-shadow-lg` —
   the gradient variant's own `sf-gradient-shadow` IS the measured
   value. Study Groups already carries none (accidentally correct —
   becomes correct by doctrine).
3. **The copy fixes**: the tasks empty CTA → "Create Task" (the
   toolbar's Add Task stays — a different surface); the flashcards
   empty-state CTA → "Create Deck"; the flashcards deck-detail hint →
   "Add flashcards to start studying".
4. **The wrapper drops**: assignments + exams lose their `sf-card`
   wrappers; the exams empty moves INSIDE the grid's spanning cell
   (`md:col-span-2 lg:col-span-3`) so the 3-col grid renders with the
   empty as its cell.
5. **The flashcards view restructure** (the §1.3 split): the sidebar's
   zero-decks branch renders the family empty ("No decks yet" + hint +
   the "Create Deck" CTA) replacing the slim p; the main pane's
   zero-decks family empty + sf-card RETIRE; the main pane's
   unselected state renders the family empty ("Select a deck" +
   "Choose a flashcard deck from the sidebar", no CTA) replacing the
   bare p; the deck-detail zero-cards keeps the family empty but loses
   its sf-card wrapper (bare in the pane). The loading gates stay
   untouched (the CE3 family).
6. **The timetable zero-state port**: the `classes.length === 0`
   EmptyState branch retires; the grid renders always (the reference's
   own zero-subjects shape); the My Classes panel renders the slim
   empty (`text-center text-slate-400 py-8`, the measured SHAPE) when
   no class exists. The COPY is clone-accurate, not the reference's
   verbatim "No subjects added yet. Go to Settings to add subjects."
   (§6.9 — the reference derives its timetable from subjects; the
   clone's TimetableClass is standalone, and the toolbar's Add Class
   is the create path). The toolbar's Add Class stays.

## §4 The TDD plan (the honest RED first)

No new pure seams (a view-layer port) — the unit census stays
**1795/1795 (55 files)**. The e2e pins (the EH family, parity-session7
convention — route-interception fixtures, zero upload/write budget
consumption):

- **EH1** (Files — the always-empty view): the family anatomy — the
  container's computed padding-left 16px (px-4), the wrapper's
  margin-bottom 24px, the title's margin-bottom 8px, the hint's
  max-width 384px, NO CTA button.
- **EH2** (Tasks — the intercepted empty list): the CTA reads
  "Create Task" and computes the PLAIN shadow (`0 1px 3px` present,
  NO `10px 15px -3px`).
- **EH3** (Flashcards — the intercepted zero-decks): the SIDEBAR
  renders the family empty with the "Create Deck" CTA; the MAIN pane
  renders the "Select a deck" family empty (the H3 + the measured
  hint).
- **EH4** (Exams — the intercepted empty list): the empty sits BARE
  inside the grid's spanning cell (the grid renders, no sf-card
  ancestor).
- **EH5** (Timetable — the intercepted zero classes): the grid
  canvas renders + the My Classes panel carries the slim empty copy.
- **EH6** (Assignments — the intercepted empty list): the empty is
  BARE (no sf-card ancestor) + the hint's max-width 384px.

The honest RED: every pin runs against the PRE-change standalone (the
§0 build) and must fail at its designed marker. The GREEN sweep
re-runs them on the post-port build. The s17-fresh-user spec + the
S4-C navigation pin + the EA3/parity-session7 pins re-run unchanged
(the re-anchor census: NONE — the s17 locators (`main.getByText`)
match the sidebar's family empty; the S4-C assertions all hold
post-port; the "No cards in this deck" pin asserts the title only).

## §5 The execution order

1. The e2e RED pins (EH1–EH6) against the pre-change standalone.
2. shared.tsx (§3.1).
3. The CTA sites + the copy fixes (§3.2/§3.3).
4. The wrapper drops + the exams grid cell (§3.4).
5. The flashcards restructure (§3.5).
6. The timetable port (§3.6).
7. The GREEN sweep (EH1–EH6 + the s17 + S4-C + EA3 + the Files-family
   resilience re-run).
8. lint · tsc · unit · build · the closing drawer check + the parity
   probe.
9. The doc chain + the evidence frames + the commit/push.

## §6 The adjudications (the open questions, resolved)

1. **The h2 stays over the reference's h3** — the recorded
   heading-laxity deviation (the S77/AD7 precedent the notes-view
   already documents; the S61 StatCard h2 is the same class):
   an h1→h3 skip trips heading-order, the tags are visually identical
   (the classes carry the real styling), and the clone's a11y
   superset owns the deviation. The spacing (mb-2) still ports.
2. **The accent-aware tokens stay** — `text-sf-primary` (violet-500 at
   the default accent) and the inline `rgb(var(--sf-primary-empty-from/to))`
   gradient (violet-100 → indigo-100 at default): byte-identical to
   the measured values at the default accent, accent-aware across the
   7-accent superset (the S4-G doctrine).
3. **The S5 record's empty-state-CTA-shadow-lg claim is superseded**
   by the S184 direct computed-style measurement (the plain
   `sf-gradient-shadow`); the FocusTimer play pin stands untouched
   (its own measured surface).
4. **The flashcards toolbar's "New Deck" button stays** — the pinned
   superset affordance (the parity-session7 dialog-entry path); the
   reference's own create path is the empty-state CTA ("Create Deck")
   — both entry points co-exist (the functional-superset posture).
5. **The "No decks yet" main-pane family empty RETIRES** — the
   reference's main pane shows "Select a deck" even at zero decks;
   the sidebar owns the zero-decks family empty. The clone's
   sf-card wrappers around the flashcards empties retire (the
   reference renders the family bare in both panes).
6. **The timetable EmptyState branch retires entirely** — the
   reference's zero-state is the always-rendering grid + the slim
   panel empty; the Add Class toolbar affordance keeps the create
   path. The clone's authored hint copy ("Add your first class to
   build your weekly timetable.") retires with it.
7. **The dark-mode classes stay** — the reference has no dark mode
   (the measured platform no-op); the clone's dark superset keeps
   `dark:text-slate-100`/`dark:text-slate-400` on the family.
8. **The hint's mb-6 stays even without a CTA** (the Files shape) —
   the measured Files hint carries `max-w-sm mb-6` with no following
   CTA (the trailing margin is part of the family's shape).
9. **The timetable slim copy is clone-accurate** — the reference's
   "No subjects added yet. Go to Settings to add subjects." is
   data-shaped (its timetable derives from subjects); the clone's
   TimetableClass is standalone with the toolbar's Add Class as the
   create path — the slim SHAPE ports, the copy stays honest to the
   clone's model ("No classes yet. Use Add Class to build your
   weekly timetable.").

## §7 The tripwires, the census, the cert map

- The unit census: UNCHANGED at **1795/1795 (55 files)** (no new
  seams). The e2e census: **691 → 697** (+6 the EH pins in
  parity-session7 — chunk 2: 248 → 254). The README badge: **2486 →
  2492**. The tripwire re-tags: the cert-runner pair + the README
  (badge + testing line + session row) + the CLAUDE pairs + the
  AGENTS census + the SKILL census sites + the vitest header.
- The cert map: the 5-chunk cold re-run (158 + 254 + 101 + 95 + 89 =
  697) — every chunk first-roll is the bar. Fallback under sandbox
  pressure: the chunk-2 re-run in isolation + the standing-chrome
  close, with the full map recorded as deferred debt.
- The standing chrome at the close: the drawer check (the 128th) +
  the desktop parity probe.

## §8 The doc chain + the evidence

The README row + badge + testing line · the AGENTS S184 lessons · the
PAD v1.3.92 revision · `docs/session_240.md` · the worklog Session-195
entry · this plan's §10/§11 close · the four S184 evidence frames
(zero-states: the flashcards sidebar + select-a-deck main; the
assignments bare empty; the timetable grid-at-zero) under
`docs/screenshots/` · the probe evidence under
`docs/probe-evidence/s184/` · `.env.example` re-verified (no env
changes this cycle).

## §9 The risks (watched honestly)

1. **The flashcards double-empty a11y** — the sidebar's family empty
   + the main pane's family empty render simultaneously at zero
   decks: two H3s + two hint Ps in one view. Multiple same-level
   headings are legal; the a11y sweep re-runs to confirm no
   button-name/label regressions (the S183 aria-label lesson).
2. **The EA3/notes pins** — the notes view's empty placement is
   untouched (bare in the list pane ✓); the re-run guards against
   accidental ripples from the shared-component change.
3. **The s17 fresh-user spec** — its "No decks yet"/"Create your
   first flashcard deck" locators must keep matching INSIDE the
   sidebar (the `main.getByText` scope still owns the aside).
4. **The timetable grid-at-zero** — rendering an empty grid must not
   regress the mobile day-accordion (the s7 pin family) — the
   Timetable spec re-runs.
5. **The exams grid-cell empty** — the spanning cell must not break
   the 3-col geometry pins (the S6 exam-card grid).

## §10 The as-executed close (filled at the cycle's end)

Executed as designed, with two pin-level fixes en route (both pin bugs, not port defects):

1. **The honest RED**: all 6 EH pins failed at their designed markers against the pre-change standalone — EH1 at the container padding (px-6's 24px received), EH2 at the "Create Task" locator (the clone read "Add Task"), EH3 at the sidebar's family-empty heading (the slim p), EH4 at the exam grid locator (the sf-card replacing the grid), EH5 at the "Week grid" locator (the EmptyState replacing the grid), EH6 at the sf-card ancestor count (1 vs 0).
2. **The port**: shared.tsx + the 8 CTA sites + the copy fixes + the wrapper drops + the exams spanning cell + the Flashcards two-pane split + the Timetable grid-always — the full §3 map, no scope creep.
3. **The pin fixes**: EH1's settled-state heading-wait (the Files view's loading gate carries py-16 itself — the .first() locator raced the in-flight window and read the gate's paddingLeft 0; the S142 settled-state lesson generalized: the heading's toBeVisible precedes any computed-style read on a locator both branches satisfy) + EH1's order-independent Files interception (the file's OWN EG pins leave uploaded files in the demo account — the EA3 route-interception makes the pin chunk-order-proof).
4. **The GREEN sweep**: all 6 EH pins GREEN; the full parity-session7 file 117/117 (the EG + EH families together); s17-fresh-user 78/78; navigation, tasks, greeting-clock, a11y-sweep, dark-mode, and parity-session5 all green; lint ✓ · tsc ✓ · unit 1795/1795 (55 files — the census UNCHANGED as designed) · build ✓.
5. **The census** (verified by `--list`, never estimated): chunk 2 = 254; 158+254+101+95+89 = 697; the badge 1795 + 697 = 2492.
6. **The residue discipline**: the reference account ends the cycle at TRUE zero (the 14-view census after the S135 task + the S79 deck cleanup; the S184 Probe Deck round-trip included).
7. **The evidence**: the four self-verifying frames under `docs/screenshots/` (the Files empty, the Flashcards zero split, the Assignments bare empty, the Timetable grid-always) + the eight reference probe JSONs under `docs/probe-evidence/s184/`.
8. **The doc chain**: the README (badge + testing line + the design-table row + the Session-184 row), AGENTS (census + the S184 lessons — six), CLAUDE (the census + the new Empty-state family contract line), PAD v1.3.92, the SKILL census sites, the vitest header, the cert runner re-tags (both scripts) + the tripwire expectation, session_240.md, the worklog Session-195 entry, and this close.
9. **The cert map**: the 5-chunk cold run (158 + 254 + 101 + 95 + 89 = 697 — the chunk records below); the closing chrome: the drawer check (the 128th) + the desktop parity probe.
10. **The hand-off**: the commit on `main` + the SSH-wrapper push (the operator's standing sequence).

## §11 The final checklist (the operator's asks, mapped)

- [x] Workspace refreshed (the fresh clone at the S183 close; the
      baseline reproduced exactly)
- [x] The core docs read (AGENTS/CLAUDE/README/PAD/SKILL)
- [x] The session docs + worklog read (238/239 + the S183 plan)
- [x] The validation against the codebase (the cold baseline gates +
      the standing chrome)
- [x] The audit (the S184 reference measurement, the residue cleanup,
      the gap table §2)
- [x] The mobile navigation menu check (the drawer check — the 127th
      consecutive GREEN; no Tailwind v4 mobile-nav bug)
- [x] `.env` at `DATABASE_URL="file:../db/custom.db"` with `db/` at
      the repo root (verified; the db-path contract pins the
      resolution; the code files already reference it correctly)
- [x] The vitest + playwright suites (the configs verified standing;
      the EH pins extend the e2e layer this cycle)
- [x] The remediation plan saved under docs/ (this document) + the
      validation against the codebase
- [x] The TDD execution (the EH REDs → the port → the GREEN sweep)
- [x] The dev-server screenshots under docs/screenshots/ (four
      self-verifying 184 frames)
- [x] `.env.example` re-verified (no changes this cycle) + committed
- [x] The doc-chain lockstep (the tripwire 138/138)
- [x] worklog.md updated (the Session-195 entry) + committed
- [x] The local commit on main + the SSH-wrapper push (the closing
      sequence)
