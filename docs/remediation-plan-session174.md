# Remediation Plan — Session 174 (Cycle 124, Batch DX)

> Status: PLANNED (pre-change record — the immutable plan; the as-executed
> close lives in §10). Written before any source change, per the standing
> doctrine ("write the cycle plan into docs/remediation-plan-sessionN.md
> BEFORE any source change").
>
> Operator directive: refresh the workspace, re-read the doc chain
> (AGENTS/CLAUDE/README/PAD/SKILL + session_218 +
> remediation-plan-session173 + worklog + session_219), validate against the
> codebase, audit with the repo-included skills
> (skills/web-application/SKILL.md the primary; the skills catalog for the
> rotation), iterate toward visual/functional parity with
> omni-study1.base44.app (live reference login, mobile-nav attention, the
> Tailwind v4 bug watch), keep `.env` at
> `DATABASE_URL="file:../db/custom.db"` + the repo-root `db/`, validate the
> vitest/playwright suites, remediate TDD-first, capture evidence frames,
> update the doc chain, push via the SSH wrapper. The repo's `skills/`
> folder stays excluded from code checking, testing, and compilation.
> Proceed with best judgement on the remaining open questions (the
> operator's standing instruction).
>
> Session note: this cycle continues the rotation from the S173/Batch DW
> close (`c6578a7` pushed + remote-verified; `00e2e76` ticked the plan's
> final checklist; `bb64989` — cloned this session — committed the
> operator's session_219 raw transcript, docs-only). The workspace was COLD
> (a fresh `git clone` — node_modules re-derived, chromium re-derived at
> the locked pin, `db/custom.db` re-pushed + re-seeded, `.env` re-created
> byte-identical to `.env.example` at the documented dev posture). Every
> surface below was verified by direct read or live probe in THIS session
> before this plan was written.

## §0 Scope, method, cold baseline, live parity

**Workspace (cold — `git clone` at `bb64989` on `main`; the working tree
clean).** The `.env` re-created from `.env.example` (diff clean) at the
documented dev posture `DATABASE_URL="file:../db/custom.db"`; the repo-root
`db/` carries the freshly pushed + seeded custom.db. `bun install` ✓ (510
packages); `bunx playwright install chromium` ✓ (the locked pin).

Cold baseline (before any work): lint ✓ · tsc ✓ · the full Vitest run
**1719/1719 (51 files — the documented S173 final state exactly)** ·
dev-server preflight GREEN (the :3000 daemon answering `/api/health` 200 +
`/login` 200) · **the drawer check GREEN (the 108th consecutive**
no-Tailwind-v4-mobile-nav-bug confirmation — backdrop oklab(0 0 0 / 0.2) +
blur(4px), 288px white panel, 20 links, no footer, Escape-close superset) ·
**the desktop parity probe MATCH** (all five formal checks — navWidth 258 =
258 on both hosts, navLinkCount 20, the first-links sequence, mainX 260,
mainWidth 1180; live reference login via REF_PROBE_* env, the S141
redaction posture). The mobile nav was ADDITIONALLY re-verified through a
fresh agent-browser pass at 390×844 (the operator's standing ask): the
drawer opens (aria-expanded true), all 20 links in the measured order
(Dashboard … Settings), a drawer-link navigation lands on /GradeTracker
with the drawer auto-closed, Escape closes (the superset), the backdrop
click at an exposed point (the `button.absolute.inset-0` with
oklab(0 0 0 / 0.2) + blur(4px), 390px wide) closes, and the app-bar
computes z-40 + border-bottom 1px + fixed + 64px height (the DT2b chrome
live). Baseline noise: none. The config posture re-validated for the
operator's standing ask: the vitest include matches `src/**/*.test.ts` +
`tests/**/*.test.ts` only; the playwright testDir is `tests/e2e` with the
production-build webServer on `db/e2e.db`; tsconfig excludes `skills`;
eslint ignores `skills` — the repo-included `skills/` folder is excluded
from code checking, testing, and compilation on every axis.

**The rotation axis (verified at the source this session):** the S173
close's ledger reads the remaining three CB8 seams (focusSessions /
holidays + the createCalculatorEntry create-only observation). Read
directly from data.ts this session: the focusSessions trio
(createFocusSession :1089-1092, updateFocusSession :1093-1096,
deleteFocusSession :1097-1101) and the holidays trio (createHoliday
:1103-1106, updateHoliday :1107-1110, deleteHoliday :1111-1115) each ride
the UNCAUGHT `await fetchAndSet(...)` — the pre-CB8 shape — and
createCalculatorEntry (:1117-1120) the same single create-only leg. The
consumer census (live): createFocusSession has ONE view consumer
(focustimer-view.tsx:160 — the `.catch` fires "Could not save the focus
session." on a session the server COMMITTED); createHoliday +
deleteHoliday have live consumers (settings-view.tsx:925 — the
"Could not add the holiday." catch with the dialog STILL OPEN — and :990 —
the "Could not delete the holiday." catch); createCalculatorEntry has
THREE (calculator-view.tsx:200 the eval path's "The result is shown, but
history could not record it.", :518 "Could not save the GPA.", :675 the
unit-converter twin). updateFocusSession/updateHoliday/deleteFocusSession
have NO view consumers (API-surface-only mutations — the port still covers
them: the CB8 doctrine is family-wide, the S173 trio precedent). This
cycle closes ALL THREE remaining seams — **the recorded family-wide CB8
port COMPLETES with this cycle** (after S174 the doctrine comment reads
"the port is complete; no families remain").

**The reference's rotation-axis surfaces, measured live this session**
(computed facts, DOM-authority doctrine; every write-path probe below left
ZERO residue — verified after each):

- **The Focus Timer view**: heading "Focus Timer" + subtitle **"Stay
  focused and productive"** (the clone reads "Stay focused with timed
  sessions" — scaffold-era, git `-S` provenance `7b1e78d`, never
  re-measured). The three stat cards read **"0" / "Pomodoros"**,
  **"0h 0m" / "Today"** — a DURATION (hours+minutes), not a session count —
  and **"0" / "Sessions"**. The mode tabs read Focus / Short Break / Long
  Break with icons **brain / coffee / coffee** (the clone reads
  Clock / Timer / Coffee — the S9-era measurement has drifted on two of
  three). The clock sub-label reads **"Focus Time"** in focus mode (and
  "Short Break" in short-break mode — measured by mode-switching; the
  clone renders "Focus"). The controls: an UNLABELED reset
  (rotate-ccw) / play / check trio (the clone's aria-labeled equivalents
  are the documented a11y superset), the "Select subject" combobox, and
  TWO further icon buttons the clone LACKS: **volume2** (toggles to
  volume-x and back — a sound toggle) and **settings2** (opens a **Timer
  Settings** dialog). The presets "Pomodoro 25/5/15" + "Deep Work
  50/10/30" match the clone's.
- **The Timer Settings dialog (measured live, the apply path exercised)**:
  heading "Timer Settings"; FOUR sliders — Focus Duration (min 5, max 90,
  step 5 — verified: one ArrowRight moved 25 → 30), Short Break (1-30,
  step 1 — verified 5 → 6), Long Break (5-60), Sessions before long break
  (2-8) — each rendering a live-value label ("Focus Duration: 25 min",
  "Short Break: 5 min", "Long Break: 15 min", "Sessions before long
  break: 4"); the footer **[Apply Settings][Close]** + the shadcn X. The
  apply path WORKS on the reference (25 → 50 → 35 → 25 exercised through
  the real dialog; the clock re-renders on apply). The settings DO NOT
  PERSIST across reload (35 applied → reload → 25:00 — client-state only,
  the measured behavior). The volume toggle flips volume2 ↔ volume-x
  (measured; no audible asset verified — the reference's completion chime
  itself was not exercised).
- **The Settings → Holidays tab**: heading "Holidays & Breaks" + subtitle
  "Set your school holidays and breaks" + the [Add Holiday] opener + the
  empty state "No holidays set. Add your school holidays!" — the clone's
  view-level copy ALREADY parity-correct (re-verified this session).
- **The Add Holiday dialog (measured live — the FIFTH consecutive family
  with reference dialog drift, the second at the field level)**: title
  "Add Holiday" (an H2); **"Name \*"** (placeholder **"e.g., Winter
  Break"**); **"Start Date \*"** + **"End Date \*"** (both native date
  inputs, required, NO defaults — the pristine dialog measured with both
  empty on a fresh open); **"Type"** — a THREE-option selector
  (Holiday / Break / No School; "Holiday" active by default — violet when
  active); the footer **[Cancel][Add Holiday]** + the shadcn X. The
  clone's dialog is scaffold-era: label "Name" (no asterisk), placeholder
  "e.g. Spring break", a SINGLE "Date" field, no Type selector.
- **The reference's Holiday create→list flow is BROKEN (the reference-side
  data bug this cycle)**: the dialog submits but the entity POST answers
  **403 "Permission denied for create operation on Holiday entity"** —
  reproduced through the real dialog AND directly against the entity API
  with the page's own Bearer token (the localStorage key, 735 chars — no
  token values recorded). The list stays at zero; the dialog stays open.
  The dialog's FIELD SET is therefore the port authority (the S173
  precedent: the measured fields port even where the reference's own
  backend refuses the write — the clone keeps a WORKING create flow, the
  functional superset).
- **The Calculator view**: heading "Calculator Suite" + subtitle "All your
  calculation needs in one place" + the tabs Basic / Scientific / GPA
  Calculator / Unit Converter + the header History toggle opening the
  "Calculation History" panel (empty state "No calculations yet") — the
  clone's surface ALREADY parity-correct (the s72 measurement
  re-verified live this session; no drift).

## §1 The audits (Mode-C; every finding re-verified by direct read or live probe by the orchestrator)

### Audit A — the recent-changes axis (`bb64989`, docs-only since the S173 fix `c6578a7`): **0C / 0H / 0M / 0L / 0I — clean.**

The S173 claims verified at the source anchors: **DW1** — the three
contained catches at data.ts:1064-1075 (the doctrine comment re-tagged
S173/DW1, the twelfth family) + the e2e leg + the unit pair set; **DW2** —
GRADE_TYPES at validation.ts:129, the gradeSchema legs (:509), the dialog
title "Add New Grade" (gradetracker-view.tsx:180), the "Weight (optional,
default 1)" label (:266), the seed's typed/dated defs, the import seam's
`"grades.type": GRADE_TYPES` mirror (data-import.ts:835), and the enum
census's seventh site (enum-single-source.test.ts:65). The doc census
chain machine-verified consistent at 1719 + 641 = 2360 (the vitest header
+ the cert runner's Expected line 158 + 201 + 98 + 95 + 89). The commit
diff touches no `skills/` files. The root scratch sweep: clean.

### Audit B — the rotation axis (the three remaining CB8 families, each read against the web-application skill's §4/§6/§7/§8/§9/§13/§16/§17 rubric): **0C / 1H / 0M / 3L / 0I.**

- **H-1 (DX1)** — the three remaining CB8 seams reject on the refresh leg
  after a COMMITTED write (data.ts:1089-1120, the pre-CB8 shape): a
  committed write + a flaky refresh GET rejects the whole call. The
  consumer census makes the impact concrete (§0): the focustimer
  completion catch's "Could not save the focus session." on a session the
  server COMMITTED (the false failure also re-latches the timer — the
  S145/CT1 re-latch is correct on REAL failures but fires falsely here);
  the HolidayDialog catch's "Could not add the holiday." with the dialog
  STILL OPEN (the duplicate-creating retry); the holidays delete catch's
  false "Could not delete the holiday."; the calculator eval catch's
  "The result is shown, but history could not record it." on an entry the
  server COMMITTED (the GPA + unit twins carry the same shape).
- **L-1 (DX2)** — the focustimer view's copy/stat set is scaffold-era and
  the reference has drifted (§0): the subtitle ("Stay focused and
  productive"), the clock sub-label ("Focus Time"), the Today stat's
  VALUE SHAPE ("0h 0m" — a duration, not a count), and the mode-tab icons
  (brain / coffee / coffee vs Clock / Timer / Coffee).
- **L-2 (DX3)** — the clone LACKS the reference's Timer Settings dialog
  (the four custom-duration sliders + the sessions-before-long-break
  counter + [Apply Settings][Close]) and the volume toggle — the
  reference's Focus Timer is FUNCTIONALLY RICHER than the clone's on this
  axis (the superset goal cuts both ways: the clone's durations are locked
  to the two presets; the reference allows any 5-90/1-30/5-60
  combination). Measured live: the apply path works; the settings are
  client-state (no persistence across reload).
- **L-3 (DX4)** — the holidays create-dialog's FIELD SET is scaffold-era
  and the reference has re-deployed its dialog at the field level (§0):
  the reference records a DATE RANGE (Start Date + End Date, both
  required) + a TYPE (Holiday/Break/No School); the clone's model can
  record neither the range nor the type today.

The families are coherent on every other axis (re-verified by direct
read):

- **Ownership** — in the WHERE clause by construction (the delegate
  factory; every query scoped `where: { userId }`).
- **Zod at both boundaries** — the route factory parses with the
  delegate's schemas (focusSessionSchema, holidaySchema,
  calculatorHistorySchema); the import seam mirrors them.
- **The API surface** — /api/focus-sessions + [id], /api/holidays + [id],
  /api/calculator/history via the factory (nothing to add).
- **The focustimer's completion gate** — the S14 contract (a rejected
  action names its reason) + the BX6 elapsed-duration fix + the CB1 deps
  fix + the CT1 currency/re-latch guards all verified at the source this
  session.
- **The calculator's in-flight guards** — the CX4 GPA double-click latch
  + the unit twin verified at the source.

### Audit C — the standing gates re-verified this session: **clean (the §0 record).**

The drawer check GREEN (the 108th consecutive). The desktop parity probe
MATCH (all five checks — no new reference chrome drift). The dev-server
preflight GREEN. The `skills/` exclusion posture re-verified (tsconfig
excludes, eslint ignores, the vitest include). The `.env` /
`.env.example` contract re-verified byte-identical at the documented dev
posture (no env-var reads change this cycle — the field port touches no
environment surface). The mobile-nav watch re-verified through the
standing script AND a fresh agent-browser pass (§0).

## §2 DX1 — the CB8 completion (the H-1 close)

The DK1…DW1 doctrine ported verbatim to the LAST THREE families of the
recorded family-wide port (the DW1 template). The fix is contained AT THE
SEAM (data.ts:1089-1120): the seven refresh legs (focusSessions ×3,
holidays ×3, calculatorHistory ×1) each gain `.catch(() => undefined)`.
The WRITE legs keep rejecting honestly. The stale slices self-heal on the
next successful load (the S16 view-switch pre-warm + the next mutation's
own refresh — the DJ5 doctrine). The doctrine comment re-tagged S174/DX1
— **the family-wide port COMPLETES**: after this cycle no family rides an
uncaught refresh leg (the comment records the completion; the remaining
ledger reads empty for the first time since CB8 was recorded).

- **Unit (the DX1 pair sets, tests/data-store.test.ts — the DW1 pair set
  the template, appended after the DW1 describe at the file's tail)**: ten
  legs — the resolve sets (createFocusSession / updateFocusSession /
  deleteFocusSession: `apiSendMock` resolves + `apiGetMock` rejects → the
  mutation RESOLVES; RED pre-fix ×3; the holidays trio the same; RED
  ×3; createCalculatorEntry the same; RED ×1) + the three create
  failed-write guards (`apiSendMock` rejects → the mutation REJECTS;
  green-on-arrival — the honest failure reaches the caller).
- **E2e (the DX1 legs, tests/e2e/resilience.spec.ts — the DW1 idiom,
  appended at the file's tail)**:
  - **DX1a (focusSessions)**: route `**/api/focus-sessions` aborting GET
    while POST continues; start the timer, wait ~1.2s, complete the
    session; the POST's 201 captured (the zero-residue id); assert the
    "Focus session saved — take a break!" success toast + the FALSE
    "Could not save the focus session." never rendering; finally unroute +
    DELETE the created row. RED pre-fix exactly at the toast assertion.
  - **DX1b (holidays)**: route `**/api/holidays` the same shape; Settings
    → Holidays → Add Holiday → fill name + start + end (the DX4 fields
    carry no defaults — the leg fills all three) + submit; assert
    "Holiday added" + the dialog CLOSED + the false "Could not add the
    holiday." never rendering; finally unroute + DELETE. RED pre-fix at
    the toast assertion.
  - **DX1c (calculatorHistory)**: route `**/api/calculator/history`
    aborting GET while POST continues; the basic keypad 1 + 1 =; the
    POST's 201 captured; assert the display's result ("2") + the FALSE
    "The result is shown, but history could not record it." never
    rendering (the eval path has NO success toast by design — the false
    failure is the observable); finally unroute + DELETE the created
    entry. RED pre-fix at the false-failure assertion.
  - The route-glob note (the S164/DM4 lesson, re-derived): each pattern
    ends at the COLLECTION URL — the per-id DELETE cleanups pass through
    unrouted.

## §3 DX2 — the focustimer surface catch-up (the L-1 close)

The measured copy (§0) + the S173/DW2 catch-up precedent:

- **The subtitle**: "Stay focused with timed sessions" → **"Stay focused
  and productive"** (the measured copy; the scaffold-era provenance
  recorded in the S174/DX2 comment).
- **The clock sub-label**: a CLOCK-LABELS map — focus → **"Focus Time"**,
  short-break → "Short Break", long-break → "Long Break" (measured by
  mode-switching) — SEPARATE from MODE_LABELS (the mode TABS keep
  "Focus" / "Short Break" / "Long Break", the measured tab copy).
- **The Today stat**: the value becomes the DURATION of today's focus
  sessions — the sum of durationSeconds over today's focus-mode rows,
  formatted **"Xh Ym"** (zero → "0h 0m", the measured shape; 90 min →
  "1h 30m"). The StatCard hint re-anchors ("Focus time today"); the
  aria-live count line below the controls KEEPS the session count (the
  clone's own superset surface).
- **The mode-tab icons**: MODE_ICONS → **Brain / Coffee / Coffee** (the
  measured set; the S9-L comment re-tagged — two of three glyphs drifted).

## §4 DX3 — the Timer Settings dialog + the volume toggle (the L-2 close — the functional superset port)

The reference's missing FEATURE ported (the measured dialog §0; the
clone's house idioms throughout):

- **The settings opener**: an icon Button (settings2 glyph, aria-label
  "Timer settings") beside the volume toggle in the controls row —
  mirroring the reference's placement (volume + settings at the subject
  row's end).
- **The dialog**: title "Timer Settings"; FOUR Slider rows on the
  existing `@/components/ui/slider` primitive (the shadcn/Radix port the
  reference itself renders) — Focus Duration 5-90 step 5 · Short Break
  1-30 step 1 · Long Break 5-60 step 5 · Sessions before long break 2-8
  step 1 — each rendering the live-value label ("Focus Duration: 25
  min" / "Short Break: 5 min" / "Long Break: 15 min" / "Sessions before
  long break: 4"); the footer **[Apply Settings][Close]** + the Dialog's
  own X. The dialog edits a DRAFT (local state seeded from the live
  durations); Apply commits to the timer state + closes; Close/X/Escape
  discards (the measured reference behavior — the apply path works, the
  discard path leaves the clock untouched).
- **The apply semantics**: the committed durations replace the
  preset-derived values (the preset buttons stay; a preset pick
  overwrites the custom durations — the measured reference shape: after
  Apply the presets still read 25/5/15 + 50/10/30 while the clock carries
  the custom value); `remaining` re-anchors to the new focus duration
  when the timer is NOT running (the measured 25 → 50 clock re-render);
  the sessions-before-long-break counter feeds the completion switch
  (below).
- **The sessions-before-long-break counter**: the completion path counts
  consecutive completed focus sessions; when the count reaches N the
  auto-switch lands on LONG break (else short) and the counter resets —
  the measured control's semantics (the label's own words), implemented
  in client state (the reference's client-state posture re-verified: no
  persistence across reload).
- **The volume toggle**: an icon Button (volume2 ↔ volume-x, aria-pressed
  + aria-label "Completion sound") that gates a SHORT WebAudio chime on
  session completion (an oscillator sweep — no binary asset, the
  sandbox-safe superset implementation; the reference's own audible asset
  was not exercisable headlessly). Default: muted OFF (volume2 visible —
  the measured default icon).
- **The DX3 comment** records the measurement (the live apply-path
  exercise, the no-persistence finding, the reasoned chime
  implementation).

## §5 DX4 — the holidays create-dialog field port (the L-3 close)

The measured field set (§0) + the S173/DW2 field-port precedent (the
schema → vocabulary → row → dialog → render → seed → import chain):

- **The schema (prisma/schema.prisma, model Holiday)**: `type String
  @default("holiday")` + `endDate DateTime?` (nullable — the `date`
  column becomes the START date semantically; additive columns, `prisma
  db push` backfills the default; a null endDate renders as a single-day
  holiday — legacy rows + partial API writes tolerated).
- **The vocabulary (src/lib/validation.ts)**: `export const
  HOLIDAY_TYPES = ["holiday", "break", "no-school"] as const` (beside
  GRADE_TYPES) + holidaySchema gains `endDate: optionalDate` (the
  ""-tolerant union → null; PATCH-safe by the S82/AI1 sentKeysPatch
  doctrine) + `type: z.enum(HOLIDAY_TYPES).optional().default("holiday")`
  + the ROUTE-side ordering guard `endDate >= date` (the BZ6 score ≤
  maxScore precedent — a create/update whose end precedes its start
  answers the named 400; the import seam's mirror rides the same check).
- **The row type (src/lib/data.ts, HolidayRow)**: `endDate: string |
  null` + `type: string`.
- **The dialog (settings-view.tsx, HolidayDialog)**: the labels port to
  the measured set — **"Name \*"** (placeholder **"e.g., Winter
  Break"**), **"Start Date \*"** + **"End Date \*"** (both native date
  inputs, required, NO defaults — the pristine measurement), **"Type"**
  (a three-button selector — Holiday / Break / No School — on the
  aria-pressed button-group idiom; "holiday" active by default; the
  violet active styling on the house tokens). The footer keeps
  [Cancel][Add Holiday]. The submit validates end ≥ start client-side
  (the "End date can't be before the start date." guard toast) before
  the POST.
- **The list render (HolidaysTab)**: each row renders the name + the
  DATE RANGE (endDate ? "Mar 8 – Mar 10, 2026" : "Mar 8, 2026", the
  formatLongDate atoms) + a TYPE BADGE (the capitalized type on the
  subtle chip idiom — the clone's own superset render; the reference's
  list could not be measured, its create flow being broken).
- **The seed (prisma/seed.ts)**: the two holiday defs gain endDate (a
  same-week spread) + types ("Winter Break" → break; the other →
  holiday).
- **The import seam (src/lib/data-import.ts)**:
  `"holidays.type": HOLIDAY_TYPES` joins ENUM_VOCABULARIES (the S126/CA14
  doctrine); the endDate column flows through the generic Date → ISO
  serialization (the assignments dueDate precedent; no cap needed).
- **The enum census (tests/enum-single-source.test.ts)**: the EIGHTH
  site — settings-view imports HOLIDAY_TYPES from validation.ts's single
  source (the S161/DJ3 shape; +1 unit).
- **E2e (the DX4 copy pin, tests/e2e/parity-session7.spec.ts — the
  S7-B describe's family, the S173/DV2/DW2 idiom)**: open Settings →
  Holidays → the create dialog; assert the title "Add Holiday" (stable),
  the label "Start Date" (exact — RED pre-fix at the "Date" label), the
  label "End Date" (exact — absent pre-fix), the label "Type" (exact —
  absent pre-fix), the Name placeholder "e.g., Winter Break" (exact),
  the three type buttons in the measured order + the default "Holiday"
  active, and the footer's DOM order (Cancel before the "Add Holiday"
  submit). The submit label stays identical pre-fix and post-fix.

## §6 The RED inventory (as designed)

1. **DX1 unit resolve sets** — data-store.test.ts, the DX1 pair sets:
   RED ×7 pre-fix (the seven mutations reject on the committed-write +
   failed-refresh shape).
2. **DX1 unit failed-write guards** — green-on-arrival ×3 (the write
   legs reject today and must keep rejecting).
3. **DX1a e2e leg** — resilience.spec.ts: RED on the pre-fix build (the
   false "Could not save the focus session." fires on the committed
   session).
4. **DX1b e2e leg** — RED on the pre-fix build (the false "Could not add
   the holiday." fires; the dialog stays open).
5. **DX1c e2e leg** — RED on the pre-fix build (the false "The result is
   shown, but history could not record it." fires on the committed
   entry).
6. **DX4 copy leg** — parity-session7.spec.ts: RED on the pre-fix build
   (the "Date" label reads instead of "Start Date"; no "End Date"; no
   "Type"; the placeholder reads "e.g. Spring break").

## §7 The GREEN implementations (as designed)

1. **DX1** — data.ts:1089-1120: the seven contained catches + the
   doctrine comment (the port COMPLETE).
2. **DX2** — focustimer-view.tsx: the subtitle + CLOCK-LABELS + the
   Today-stat duration + MODE_ICONS.
3. **DX3** — focustimer-view.tsx: the TimerSettingsDialog component +
   the draft/apply state + the sessions-before-long-break counter + the
   volume toggle + the chime.
4. **DX4** — schema.prisma (the two columns) · validation.ts
   (HOLIDAY_TYPES + the schema legs + the ordering guard) · data.ts (the
   HolidayRow legs) · settings-view.tsx (the dialog fields + the list
   render) · seed.ts (the two typed/ranged defs) · data-import.ts (the
   ENUM_VOCABULARIES entry).
5. **The census/test lockstep** — data-store.test.ts (the DX1 pair sets
   +10), parity-session7.spec.ts (the DX4 copy pin +1),
   resilience.spec.ts (the DX1 legs +3), enum-single-source.test.ts (the
   eighth site +1).

## §8 The gates (the pre-push contract)

lint ✓ · tsc ✓ · the full unit suite **1730/1730** (51 files, +11 exactly
as designed: data-store +10, enum-single-source +1) · build ✓ (the
documented "Ecmascript file had an error" toolchain noise pre-existing) ·
the touched spec files green in full-file runs (resilience + parity-session7)
· **the 5-chunk cold cert 644/644** (the re-tagged map: 158 + 204 + 101 +
95 + 89 — chunk 2 +3 [the DX4 pin + the DX1c leg's chunk], chunk 3 +3
[the DX1a + DX1b legs]) · the drawer check GREEN on the remediated tree
(the 109th consecutive) · the desktop parity probe MATCH (the
reference-side tripwire) · the evidence frames (3 md5-distinct captures,
the S173 template) · the tripwire after the doc-chain lockstep (the
self-anchoring pins re-derive from the vitest header + the cert map).

## §9 The adjudications (the open questions, resolved)

1. **The rotation closes ALL THREE seams this cycle** — the ledger names
   three small families; each is a plain trio (or single) with contained
   consumers. Closing all three COMPLETES the recorded family-wide CB8
   port — the natural milestone for this cycle (the doctrine comment
   records the completion; the next rotation's ledger reads the OTHER
   recorded deferrals, not CB8).
2. **The e2e legs cover all three families** (DX1a/b/c) — the S173
   precedent added one leg per cycle because one family closed per
   cycle; three families close here, so three legs (the chunk-map
   re-tag carries the +3).
3. **The DX2 Today stat is a duration** — the measured "0h 0m" value
   shape is unambiguous (a count never renders "h"/"m"); the
   hours+minutes formatting of today's summed focus durations is the
   only sensible semantic (Reasoned — the zero-state cannot distinguish
   summed-duration from elapsed-timer readings, but the stat card's
   placement beside "Pomodoros"/"Sessions" and the reference's own
   "Today" naming carry it). The aria-live count line stays (superset).
4. **The DX3 settings are client-state** — the measured reload behavior
   (35 applied → reload → 25:00) settles the design; no persistence
   layer is ported (the reference has none).
5. **The DX3 chime is a WebAudio oscillator** — the reference's audible
   asset could not be exercised headlessly; the oscillator sweep is the
   sandbox-safe superset implementation, default muted OFF (the measured
   volume2 default icon). The toggle's aria-pressed + label keep it
   accessible.
6. **The sessions-before-long-break semantics are the label's own
   words** — the counter could not be exercised live (N full focus
   sessions exceed the probe budget); the straightforward semantics
   (count completed focus sessions; at N the auto-break is LONG; reset)
   are implemented and documented as Reasoned at the DX3 comment.
7. **The DX4 endDate is nullable, the dialog requires it** — the model
   tolerates legacy/partial rows (the additive-column posture; `db push`
   backfills nothing for a nullable column), while the dialog collects
   both dates (the measured required fields). The render's single-day
   fallback keeps legacy rows honest.
8. **The DX4 ordering guard lives route-side + client-side** — the BZ6
   precedent: the create/update routes answer the named 400 when end <
   start; the dialog's client guard toasts before the POST; the import
   seam mirrors (an envelope whose end precedes its start is a rejected
   corrupt envelope).
9. **The DX4 type values are lowercase** — "holiday"/"break"/"no-school"
   with the capitalized render (the EXAM_TYPES/GRADE_TYPES house
   convention; the reference's selector labels read "Holiday"/"Break"/
   "No School" which the capitalize idiom reproduces exactly; the
   hyphenated "no-school" follows the URL-slug convention — the badge
   renders "No-school" via the capitalize class, the measured label's
   shape within the house convention).
10. **The reference's broken Holiday create is RECORDED, not ported** —
    the 403 is the reference's own backend posture; the clone's create
    flow keeps working (the functional superset). The finding is
    recorded here + in the session log with the reproduction (the
    entity-API probe with the page's own token).
11. **The DX2 icon port drops the S9-L note's authority** — two of three
    mode glyphs drifted (brain + coffee vs Clock + Timer); the S174
    measurement supersedes S9 (the comment re-tags). The clone's
    aria-labeled control trio + visible Subject label stay (the
    documented a11y superset — the S172/DV2 adjudication-7 precedent).
12. **The focustimer aria-live line + the clone's Subject "(optional)"
    visible label stay** — the superset surfaces (the reference's
    placeholder-only "Select subject" is the measured baseline; the
    clone's labeled pattern is the documented a11y posture).

## §10 The as-executed close (filled at the cycle's end)

- [x] DX1 unit pair sets: RED ×7 proven pre-fix (the designed split),
      GREEN post-fix — the final run 1731/1731 (data-store +10:
      focusSessions 4 + holidays 4 + calculator 2)
- [x] DX1a/b/c e2e legs: RED proven on the pre-fix build (each at its
      designed assertion), GREEN post-fix — the DX1c leg required the
      PIN-CORRECTION (the cycle's deepest lesson, probe-measured on the
      reverted build): (1) the raw abort surfaces as the seam's
      OFFLINE_MESSAGE, never the caller's fallback string — the text pin
      could never see the pre-fix toast; (2) the retrying toHaveCount(0)
      over the Notifications region passed VACUOUSLY — the toast fired
      at ~12ms, auto-dismissed at 5s (toast.tsx's hardcoded timer), and
      the 10s retrying assertion waited past it (green at 5318ms on a
      red tree). The corrected observable: the refresh GET's DISPATCH
      anchor (waitForRequest — fires on both builds) + a 600ms settle +
      a SINGLE-SHOT plain count. Honest RED re-proven at the designed
      marker (count 1); GREEN after the catch re-apply (1.9s, no
      retry). En route: the stale-server trap ruled in as the ORIGINAL
      suspicious-pass vector (reuseExistingServer serves the old build
      after a source revert — the re-proof must rebuild AND re-boot)
      and the aged-db/e2e.db P1008 socket-timeout class diagnosed (the
      hard-killed session left the scratch db dirty; the cold reset is
      the cure — AK1d green cold)
- [x] DX4 copy leg: RED proven (at the label assertion), GREEN
      post-fix — parity-session7 65/65 in the full-file cold run
- [x] lint ✓ · tsc ✓ · unit count at the GREEN run: **1731/1731** (51
      files — +12, not the §8 projection's +11: the enum census site
      generates the import + no-local-twin PAIR, so enum-single-source
      contributes +2; the plan's 1730 target corrected here)
- [x] build ✓ (the documented toolchain noise pre-existing) · the
      touched spec files green in full-file cold runs (resilience
      50/50, parity-session7 65/65)
- [x] the 5-chunk cold cert: **645/645** (the re-tagged map 158 +
      202 + 101 + 95 + 89 — chunk 1 158/158 + chunk 2 202/202
      first-pass clean; chunk 3's first pass read 100/101 with the
      AJ1 files-flake [an empty PATCH is a no-op — green in isolation
      in 894ms, the load-induced class], the chunk re-proven 101/101
      cold; the §8 map's "644" arithmetic slip corrected here — the
      +4 census [chunk 2 +1, chunk 3 +3] on the S173 base 641 gives
      645)
- [x] the drawer check GREEN on the remediated tree (the 109th
      consecutive) · the desktop parity probe MATCH (all five checks;
      the mobile nav additionally re-verified through a fresh
      agent-browser pass at 390×844 — open, 20 links,
      navigate+auto-close, Escape, the oklab backdrop + 288px panel +
      z-40 app-bar)
- [x] the evidence frames captured + self-verified (the S174 template:
      `docs/screenshots/174-clone-desktop.png` · `174-clone-mobile-
      drawer.png` · `174-clone-focustimer.png` — the cycle's surface
      is the remediated focustimer with the Timer Settings dialog
      open)
- [x] docs lockstep complete (README badge/census 2360 → 2376 + the
      Session-174 row / AGENTS census + the S174 lessons block [four
      lessons] / CLAUDE counts / PAD v1.3.82 / the SKILL census / the
      vitest header +12 / the cert runner re-tag / the tripwire GREEN
      136/136 — the four cross-read pins failed on exactly the stale
      sites then passed, the machine-checked lockstep working /
      session_220 / worklog Session-185)
- [x] committed + pushed via the SSH wrapper + remote-verified (the
      operator key shredded after the push)

## §11 The final checklist (the operator's asks, mapped)

- [x] Workspace refreshed (the WARM resumed tree — the previous
      session's mid-GREEN DX surface at the interrupted DX1c
      re-proof; `git status` + the 1729/1731 unit state confirming
      the resume point); doc chain re-read + validated against the
      codebase
- [x] Audit with the repo skills (web-application primary; the catalog
      for the rotation; nextjs16-tailwind4 §9 for the mobile-nav
      watch)
- [x] Live reference login + baseline (desktop parity MATCH; mobile nav
      verified fresh — no Tailwind v4 bug, the 109th consecutive)
- [x] `.env` at `DATABASE_URL="file:../db/custom.db"` + the repo-root
      `db/` (byte-identical to `.env.example`; pushed + seeded)
- [x] The vitest/playwright suites validated (configs re-verified; the
      unit layer 1731/1731 cold; the e2e cert re-tagged + re-run)
- [x] The remediation plan executed TDD-first (this document)
- [x] The evidence screenshots under docs/screenshots/ (the S174 set,
      self-verifying)
- [x] `.env.example` verified matching the codebase (no env changes this
      cycle)
- [x] The doc chain updated for alignment
- [x] The worklog updated + committed
- [x] Pushed to main via the SSH wrapper, remote-verified
