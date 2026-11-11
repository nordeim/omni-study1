# Remediation Plan — Session 176 (Cycle 126, Batch DZ)

> Status: PLANNED (pre-change record — the immutable plan; the as-executed
> close lives in §10). Written before any source change, per the standing
> doctrine ("write the cycle plan into docs/remediation-plan-sessionN.md
> BEFORE any source change").
>
> Operator directive: refresh the workspace, re-read the doc chain
> (AGENTS/CLAUDE/README/PAD/SKILL + session_222 + session_223 +
> remediation-plan-session175 + worklog), validate against the codebase,
> audit with the repo-included skills (skills/web-application/SKILL.md the
> primary; the skills catalog for the rotation), iterate toward
> visual/functional parity with omni-study1.base44.app (live reference
> login, mobile-nav attention, the Tailwind v4 bug watch), keep `.env` at
> `DATABASE_URL="file:../db/custom.db"` + the repo-root `db/`, validate the
> vitest/playwright suites, remediate TDD-first, capture evidence frames,
> update the doc chain, push via the SSH wrapper. The repo's `skills/`
> folder stays excluded from code checking, testing, and compilation.
> Proceed with best judgement on the remaining open questions (the
> operator's standing instruction).
>
> Session note: this cycle continues the rotation from the S175/Batch DY
> close (`6e612af` + the plan-close `925e2b9` pushed + remote-verified;
> `acf8ca2` — cloned this session — committed the operator's session_223
> raw transcript, docs-only). The workspace was COLD (a fresh `git clone`
> — node_modules re-derived, chromium re-derived at the locked pin,
> `db/custom.db` re-pushed + re-seeded with the S175 teacher/room schema,
> `.env` re-created byte-identical to `.env.example` at the documented
> dev posture). Every surface below was verified by direct read or live
> probe in THIS session before this plan was written.

## §0 Scope, method, cold baseline, live parity

**Workspace (cold — `git clone` at `acf8ca2` on `main`; the working tree
clean).** `bun install` ✓ (509 packages); `bunx playwright install
chromium` ✓; `bun run db:generate` / `db:push` / `db:seed` ✓ (the seed
line "demo account ready" — the S175 teacher/room-enriched subjects
seeded; the seed's early-return idempotence means the re-seed ran against
a FRESH db file, no stale-row risk). `.env` = `.env.example` (diff clean)
at `DATABASE_URL="file:../db/custom.db"`; `db/` at the repo root (the
boot line resolves `db=file:/home/z/my-project/omni-study1/db/custom.db`).

**Cold baseline gates (re-run this session before any change):** `bun
run lint` ✓ (0 errors) · `bun run typecheck` ✓ (0 errors) · `bun run
test` ✓ **1733/1733 (51 files)** — the documented S175 close state
reproduced exactly. The dev server booted on :3000 (Turbopack, reaper-proof
daemon) with the seeded db.

**Live parity chrome (the standing tripwires, re-run this session):**

- **The drawer check — GREEN, the 112th consecutive** no-Tailwind-v4-
  mobile-nav-bug confirmation (oklab(0 0 0 / 0.2) backdrop + blur(4px),
  288px white shadow-2xl panel, 20 links, no footer, Escape + navigate
  auto-close, the z-40 fixed app-bar) at 390×844 on the remediated tree.
- **The desktop parity probe — MATCH** (all five structural checks
  against the live reference login: sidebarOuterWidth 260, navLinkCount
  20, firstLinks set, mainX 260, mainWidth 1180; the heading/statCards
  fields are data-derived non-gaps per the standing adjudication).
- **The per-cycle dialog re-probe (the axis-finding pattern):** the
  reference re-verified — the **Subjects dialog (S175's port) holds with
  NO re-drift** (labels/fields/placeholders/footer byte-equal the S175
  port: "Subject Name *" / "e.g., Mathematics" / "Teacher (optional)" /
  "Room (optional)" / "e.g., Mr. Smith" / "e.g., Room 101" / [Cancel][Add
  Subject]) and the **Holidays dialog (S174's port) holds with NO
  re-drift** ("Name *" / "Start Date *" / "End Date *" / "Type" + the
  Holiday/Break/No School type buttons + "e.g., Winter Break"). The
  re-probe then measured the OLDER dialog families for the first time at
  the placeholder/label level — the audit that defines this cycle (§1
  Audit B).

**Method.** Computed-DOM authority (the repo doctrine): every reference
fact below was measured by a live gated probe this session (login →
navigate → open dialog → census), every clone fact by the mirrored probe
against :3000. Zero residue on every reference write-path probe. The
`skills/` folder excluded from checking/testing/compilation throughout.

## §1 The audits (Mode-C; every finding re-verified by direct read or live probe by the orchestrator)

### Audit A — the recent-changes axis (`acf8ca2`, docs-only since the S175 fix `6e612af`): **0C / 0H / 0M / 0L / 0I.**

`acf8ca2` adds only `docs/session_223.md` (the operator's own raw
transcript commit — docs-only, no code surface). `6e612af` (the S175/DY
cycle: 38 files) was closed machine-verified by the S175 gates and the
5-chunk cert; this session's cold baseline (lint/tsc/unit 1733) plus the
Subjects/Holidays re-probe (no re-drift on the DY1/DX4 ports)
re-confirmed the cycle's surfaces still hold. No new findings.

### Audit B — the rotation axis (the never-measured dialog surface of the older families: events S162-era, studygroups S171-era, tasks S168-era — each read against the web-application skill's §4/§7/§8/§9/§12/§13/§16/§17 rubric): **0C / 0H / 0M / 6L / 0I.**

The per-cycle dialog probe swept FIVE families this cycle (the axis
families: **Events, StudyGroups, Tasks** — plus the re-verify set:
Subjects, Holidays). The Events/StudyGroups/Tasks dialogs were last
field-measured at the label level only (S171) or never at the
placeholder/geometry level (Events, Tasks); the reference TODAY carries
measured shapes the clone never ported. **All six findings are
parity-copy/geometry level (L) — no correctness, no security, no data
surface.**

**B-1 (L) — the Events dialog (events-view.tsx, the "New Event" dialog;
reference measured 2026-11-11, gated probe, computed DOM):**

| Surface | Reference (measured) | Clone (probed) | Verdict |
|---|---|---|---|
| Title placeholder | `Event title` | `Study group — calculus` (:445) | scaffold-era copy, never measured |
| Location placeholder | `Room or meeting URL` | `Room 210 or https://…` (:503) | scaffold-era copy |
| Description placeholder | `Event details...` | (none — the textarea carries no placeholder) | never ported |
| Color palette | **SIX** swatches — #8b5cf6/#3b82f6/#10b981/#f59e0b/#ef4444/#ec4899 (the clone's EVENT_COLORS first six, EXACT) | EIGHT (:59-67 — + #14b8a6 teal, #64748b slate) | two extra scaffold swatches |
| Swatch geometry | w-8 h-8 (32px) rounded-full; the selected state = white 2px ring + slate 4px ring + scale(1.1) (the measured box-shadow `rgb(255,255,255) 0 0 0 2px, rgb(148,163,184) 0 0 0 4px` + `matrix(1.1,0,0,1.1,0,0)`) | size-7 (28px) rounded-full, ring-2 ring-slate-900 (:481-493) | geometry + selection-state drift |
| Reminders control | **repeating rows** — a number input (min=1, w-20=80px) + a unit select (`minutes`/`hours`/`days`) per row + an "Add" button that APPENDS a new row (default 30 minutes); the stored model stays minutes | three toggle chips `[15 min][30 min][60 min]` (REMINDER_CHOICES :70, toggleReminder :235) | structural drift (the shape, not the model) |
| Repeat select | FIVE options — No repeat/Daily/Weekly/Monthly/**Yearly** | FOUR (REPEATS validation.ts:102 = none/daily/weekly/monthly) | the vocabulary gap |
| Submit button | `Create Event` | `Create event` (:574) | case drift |
| All-day | (absent — the reference dialog carries NO all-day control, verified: no checkbox, no toggle button) | "All day" checkbox (the schema + calendar all-day rendering depend on it) | the clone's documented superset — KEEP (adjudication 4) |

**B-2 (L) — the StudyGroups dialog (studygroups-view.tsx GroupDialog :64;
reference measured 2026-11-11):** the reference's labels read **"Group
Name \*"** and **"Description"** (no "(optional)" suffix); the clone ships
"Name" (:136) and "Description (optional)" (:149). The swatches: the
reference carries the SAME six hexes (measured at S171, re-confirmed) at
w-8 h-8 (32px) rounded-full with the white+slate double-ring + scale(1.1)
selected state; the clone ships size-7 (28px) with ring-2
ring-slate-900 (:171-178). The title ("Create Study Group"), the
placeholders ("e.g., Math Study Squad" / "What's this group about?"), and
the footer ("Create Group" then "Close") all hold (the S171 port intact).

**B-3 (L) — the Tasks dialog (tasks-view.tsx TaskDialog :241; reference
measured 2026-11-11):** the title input placeholder reads **"Task
name..."** on the reference (with the ellipsis); the clone ships "Task
name" (:319). The "Add a subtask..." (:456) and "Add notes..." (:470)
placeholders hold. The reference's due-date surface is a popover-calendar
("Add due date" button → a Radix-style z-50 calendar popover; picking a
day replaces the button's label with the short date, e.g. "Nov 15", and
reveals a "Remind me" control); the clone ships a native date input —
the a11y-superior superset (adjudication 5, KEEP). The reference's dialog
carries no DialogTitle and no subject picker; the clone's "Create Task"
heading (an accessible dialog NAME — Radix warns without one) and Subject
select are the documented superset (KEEP).

**B-4 (L) — the subject-swatch selection-state divergence (found by
re-reading the S175 record against the code this session):** the S175
measurement recorded the reference's selected-swatch state as "the
white-ring + scale(1.1)" (worklog Session-186: "the white ring +
slate-400 outer ring, the white-ring + scale(1.1) selection state"), but
the S175 PORT shipped `ring-2 ring-sf-primary ring-offset-2` (settings-view
:798) — a visual divergence from its own measurement, unadjudicated.
This cycle's DZ2 aligns the events/groups swatches to the MEASURED
state, and DZ2b aligns the subject swatches in the same pass.

**B-5 (L) — the Notes create flow (measured, recorded as a DEFERRAL):**
the reference's "New Note" header button renders the inline editor as a
fresh draft immediately (the two-pane shell's right pane switches to
"Note title..." + "Add tag..." + the contenteditable body — no dialog);
the clone opens the S125/BZ14 create-only name dialog, then the editor.
A UX-flow port (the draft-inline lifecycle on top of the autosave/selected-
note machinery) — bigger than a copy/geometry catch-up, one rotation's
worth on its own. RECORDED, deferred (adjudication 8).

**B-6 (L) — the remaining recorded deferrals re-confirmed:** the
task-lists e2e leg, the F-8 files toast copy, the S160 import-architecture
ledger — all stay deferred per their standing adjudications (the S175
§9.9 re-confirmation).

### Audit C — the standing gates re-verified this session: **clean (the §0 record).**

The drawer check (112th), the desktop parity probe (MATCH), the
Subjects/Holidays re-verify (no re-drift), the cold baseline gates
(lint/tsc/unit 1733) — all green before any change. The mobile-nav
390×844 surface stays covered by the drawer check's standing posture.

## §2 DZ1 — the Events dialog catch-up (the B-1 close)

The measured port, source-first with the e2e pin (§5):

1. **The placeholder set** — events-view.tsx :445 `"Study group —
   calculus"` → `"Event title"`; :503 `"Room 210 or https://…"` →
   `"Room or meeting URL"`; the description textarea (:507-515) gains
   `placeholder="Event details..."`.
2. **The palette + geometry** — EVENT_COLORS (:59-67) drops the
   scaffold teal/slate extras → the SIX measured hexes (the schema's
   `hexColor` validation stays open — existing teal/slate ROWS keep
   rendering; the functional superset lives at the schema, the visual
   parity at the dialog). The swatch render (:481-493) ports to
   `size-8 rounded-full` (32px) with the MEASURED selection state — the
   white 2px + slate 4px double ring + `scale-110` — as an inline-style
   boxShadow on the selected swatch (the plain-declaration route, the
   SKILL §12 cascade-law posture; the ring utilities cannot stack two
   rings). The `aria-label="Choose color ${hex}"` + `aria-pressed` stay
   (the DV2 adjudication-7 a11y superset, the S175 precedent).
3. **The reminders rows** — the [15,30,60] chip row (:538-556) becomes
   the measured repeating-rows control: each row = a number input
   (`min=1`, `w-20`, `aria-label="Reminder value N"`) + a unit select
   (minutes/hours/days, `aria-label="Reminder unit N"`) + an
   `aria-label="Remove reminder N"` × button; an "Add" button appends a
   new row (the measured 30-minutes default). The model stays the
   minutes JSON array (EventInput.reminders unchanged — the wire/API/
   import surfaces untouched). The conversion lives in a NEW pure seam
   (§2.4) per the "pure seams, tested" law.
4. **The reminder-rows seam** — `src/lib/reminder-rows.ts`:
   `ReminderUnit` ("minutes"|"hours"|"days"), `ReminderRow {value,
   unit}`, `rowToMinutes`, `minutesToRow` (the largest-clean-unit
   derivation: ≥1440 and %1440 → days; ≥60 and %60 → hours; else
   minutes), `minutesToRows`, `rowsToMinutes` (defensive: non-positive/
   non-finite filtered; sorted + deduped). TDD: the spec (§6) REDs first.
5. **The Yearly repeat leg** — `REPEATS` (validation.ts:102) gains
   `"yearly"`; `RepeatMode` (data.ts:88) follows; `expandOccurrences`
   (events.ts:34-51) gains the `case "yearly"` — the same month+day hit
   (a pure month/day match across years; a Feb-29 start hits Feb-29 in
   leap years only — the monthly seam's Jan-31-skips-February precedent
   governs: no synthetic shifting, the calendar truth). The events-view
   select renders it free (REPEATS.map, the DK2 single source). The
   import seam's domain caps consume the same array (widened acceptance,
   no other site to edit). The enum-single-source census already pins
   the view↔validation agreement (the DK2 pin — adding a value to the
   single source keeps it green).
6. **The button case** — :574 `"Create event"` → `"Create Event"` (the
   submit; the "Save changes" edit leg stays — the reference's edit
   dialog is unmeasured, the S171 posture).
7. **The superset stays** — "All day" (the schema + the calendar
   all-day rendering), the labeled-field posture (every input labeled —
   the a11y superset over the reference's placeholder-only rows), the
   hand-guard + the busy latch + the delete double-fire latch (all
   unchanged).

## §3 DZ2 — the StudyGroups dialog catch-up + the subject-swatch alignment (the B-2/B-4 close)

1. **The label copy** — studygroups-view.tsx :136 `Name` → `Group Name
   *`; :149 `Description (optional)` → `Description` (the required-mark
   posture follows the reference's asterisk idiom; the input itself
   stays `required` — the clone's existing guard).
2. **The swatch geometry + selection state** — :171-178 `size-7` →
   `size-8 rounded-full` + the measured inline-style double-ring +
   `scale-110` selected state (identical to DZ1's; the reference's two
   dialogs share the idiom). The aria-label/aria-pressed stay.
3. **DZ2b — the subject-swatch selection-state alignment** (the B-4
   close): settings-view.tsx :789-805's selected class (`ring-2
   ring-sf-primary ring-offset-2 ring-offset-background`) → the measured
   white+slate double-ring + `scale-110` inline style (the S175-recorded
   measurement finally shipped; the geometry `size-8 rounded-lg` stays —
   the S175-measured shape).

## §4 DZ3 — the Tasks dialog placeholder (the B-3 close)

tasks-view.tsx :319 `"Task name"` → `"Task name..."` (the ellipsis; the
rest of the dialog holds — the S6-era field set + the S168 hardening
surface verified this session by the clone census).

## §5 DZ4 — the pins (the TDD layer)

**Unit (the designed REDs at the designed markers):**

1. `tests/events.test.ts` — the yearly pins: (a) the yearly window hits
   the same month+day each year; (b) a Feb-29 start hits ONLY leap-year
   Feb-29s (the Jan-31 precedent's calendar truth); (c) the past-start
   guard + the window return contract hold for yearly (the family's
   existing contract legs re-proven at the new enum value).
2. `tests/reminder-rows.test.ts` (NEW file) — the seam spec: (a)
   `rowToMinutes` across the three units; (b) `minutesToRow`'s
   largest-clean-unit derivation (1440 → 1 day; 120 → 2 hours; 90 → 90
   minutes; 15 → 15 minutes); (c) the round-trip; (d) the defensive
   filter (non-positive/non-finite); (e) the sort+dedup contract.

**E2e (parity-session7.spec.ts — the S-cycle's spec, chunk 2; the
designed REDs):**

3. **The events-dialog copy pin** — the New Event dialog carries the
   measured placeholder trio + the six-swatch palette + the "Add"
   reminders control + the five-option repeat select (Yearly present) +
   the "Create Event" submit copy.
4. **The studygroups label pin** — the Create Study Group dialog carries
   "Group Name \*" + "Description" + the six 32px swatches.
5. **The tasks placeholder pin** — the Create Task dialog's title input
   placeholder reads "Task name..." (with "Add a subtask..." / "Add
   notes..." re-pinned).
6. **The reminders round-trip leg** — create an event through the dialog
   with two reminder rows (20 minutes + 2 hours), then read the row back
   (the stored minutes [20, 120] round-trip through the seam; the row
   renders its reminders) — the DY1-style live-journey proof of the
   DZ1 port, zero residue (the leg deletes its event through the UI).

## §6 The RED inventory (as designed)

| Marker | RED proof (pre-fix, at the designed marker) |
|---|---|
| The events placeholders | the copy pin fails: `Event title` placeholder absent (the dialog ships "Study group — calculus") |
| The swatch palette/geometry | the copy pin fails: 8 swatches ≠ 6; the computed 28px ≠ 32px |
| The reminders rows | the copy pin fails: no number input / no "Add" button (the chips); the round-trip leg fails at the row shape |
| Yearly | the events.test.ts yearly pins fail to compile (the enum lacks "yearly") — the type-level RED; the copy pin fails (the select lacks the option) |
| The reminder-rows seam | the new spec fails to import (the module does not exist) — the module-level RED |
| The studygroups labels | the label pin fails: "Name" ≠ "Group Name \*" |
| The subject swatch state | the source-read assertion in the studygroups pin's prose (no e2e pin — the visual state rides the §3 source change; the existing S175 pins keep the geometry/aria green) |
| The tasks placeholder | the pin fails: "Task name" ≠ "Task name..." |
| The button case | the copy pin fails: "Create event" ≠ "Create Event" |

Honest-RED doctrine: every RED above is proven by a cold run at the
designed marker BEFORE its fix lands (the S175 discipline; no
green-on-arrival claim without its recorded inventory).

## §7 The GREEN implementations (as designed)

The source changes as specified in §2-§4 (the minimal diff per site);
the seam + the spec + the pins as specified in §5. No guardrail weakens:
no lint rule, no type loosening, no skipped hook, no deleted test. The
existing pins that reference the changed surfaces: the parity-session5
events-dialog pin asserts the LABEL set (unchanged — the labels hold);
the S5-U1 carousel pins (unchanged); the tasks.spec dialog flows assert
by ROLE ("Create Task" — the submit's accessible name unchanged; the
placeholder is not pinned there); the navigation.spec "Manage your
events with custom reminders" sub-header (unchanged copy). The
REMINDER_CHOICES chips carry NO existing e2e pin (verified by grep —
only the Reminders LABEL is pinned) — the port removes no coverage.

## §8 The gates (the pre-push contract)

1. `bun run lint` ✓ · `bun run typecheck` ✓ (0 errors each).
2. `bun run test` ✓ — the designed count **1741** (51→**52** files; +3
   yearly + 5 seam pins). The actual count recorded at the close; any
   delta from the design is explained in §10.
3. `bun run build` ✓ (the standalone assembly, required before e2e).
4. The touched spec files green cold (`rm -f db/e2e.db` + the
   e2e-cold-reset chain — the parity-session7 full-file cold run).
5. The 5-chunk cold cert at the re-tagged map — designed
   **158+211+101+95+89 = 654** (chunk 2 carries the +4 DZ pins). The
   chunk-3 boundary-freeze posture (the S175 lesson-5 cure): direct
   synchronous single-tool-call runs for any chunk that flakes; the
   `socket_timeout=30` e2e posture stays (the S175 config leg).
6. The tripwire (script-conventions.test.ts) green after the doc-chain
   lockstep — the DY3 self-anchoring pair enforces the CLAUDE.md count
   against the vitest header + the cert Expected map.
7. Evidence frames (`docs/screenshots/`) — this cycle's surface: the
   remediated New Event dialog (the placeholders + the reminders rows +
   the six swatches + the selected ring state), the Settings→Subjects
   swatch state if captured, the drawer frame. Self-verifying script
   (the S174/S175 template), md5s distinct.
8. The doc-chain lockstep (§11's checklist) — the census re-tag at every
   site: the cert script's Expected map + header (source) → the S128/CC2
   + CF6 mirror pins' recomputed constants → run-cert-chunk.sh's header
   (the historical-tense posture) → CLAUDE.md's test-pyramid pair (the
   DY3 pin's own enforcement) → vitest.config.ts's header → README's
   badge + the four body sites + the Session-176 row → the SKILL's
   census sites → AGENTS.md's two census lines + the S176 lessons block
   → PAD v1.3.84 revision block → `docs/session_224.md` → the worklog
   Session-187 entry → this plan's §10 close.
9. `git commit` (conventional, one cycle commit + the plan-tick follow-up
   per the S170-era precedent) → the SSH-wrapper push to `main` →
   remote-verified → the operator key shredded.

## §9 The adjudications (the open questions, resolved)

1. **The swatch palette drops to the measured SIX** (the visual-parity
   posture at the dialog; the schema's `hexColor` stays open so
   existing teal/slate rows keep rendering — the functional superset
   lives at the schema, not the dialog; the S175 subject-palette
   precedent: the measured count replaces the scaffold count).
2. **The selection state ports as the measured double-ring + scale** —
   an inline-style boxShadow (`0 0 0 2px #fff, 0 0 0 4px #94a3b8`) +
   `scale-110`, NOT a ring-utility stack (two rings cannot stack in
   Tailwind; the arbitrary-shadow route risks the v4 cascade trap on
   custom-class carriers — the plain inline style is the byte-exact,
   trap-free route). The aria-label/aria-pressed stay (the DV2
   adjudication-7 swatch-level precedent).
3. **The reminders rows REPLACE the chips** — the reference's measured
   shape is the authority (the S175 subject-dialog precedent: the
   measured field set wins); the minutes JSON model is untouched (the
   wire/API/import surfaces unchanged); the a11y labels on each row are
   the clone's superset over the reference's unlabeled rows. No existing
   pin covers the chips (grep-verified) — the port removes no coverage.
4. **"All day" STAYS** — the reference's dialog carries none (measured:
   no checkbox, no toggle), but the clone's all-day is schema-deep (the
   calendar's all-day rendering + the import seam) — the documented
   functional superset, the S171 tasks-dialog-subject precedent class.
5. **The task due-date popover is NOT ported** — the clone's native date
   input is the a11y-superior control (keyboard + screen-reader + form
   semantics over a pointer-oriented popover); the reference's
   popover+button-label flow is recorded as a measured, adjudicated
   deviation. Same posture for the reference's missing DialogTitle and
   missing subject picker (the clone's heading = the accessible dialog
   name; the Subject select = the S171 precedent).
6. **Yearly joins REPEATS at the single source** — the vocabulary
   widens at validation.ts (the schema + the select + the import caps
   all consume it); `expandOccurrences`'s yearly case follows the
   monthly seam's calendar-truth posture (no synthetic Feb-29 shifting).
7. **DZ2b is in-scope** (the S175 subject-swatch state alignment) — the
   B-4 finding is this cycle's own audit product (the S175 record vs
   the code re-read); the fix is one className/style site, no new
   surface.
8. **The Notes create-flow port is DEFERRED** (B-5) — the inline-draft
   lifecycle is a UX-flow port on the autosave/selected-note machinery,
   one rotation's worth on its own (the S160-ledger class); the clone's
   create-only dialog stays the documented interim posture. The
   task-lists e2e leg, the F-8 toast copy, and the S160 ledger stay
   deferred per their standing adjudications.
9. **The reference re-probe cadence holds** — the Subjects/Holidays
   re-verify (no re-drift) is this cycle's confirmation the six-family
   drift streak has NOT extended to a seventh; the per-cycle probe
   continues (the axis-finding discipline).
10. **The census re-tag rides the self-anchoring chain** — the vitest
    header + the cert script lead, CLAUDE.md follows (the DY3 pin
    enforces), then the prose sites; the tripwire re-run closes the
    loop (the S175 lockstep order).

## §10 The as-executed close (filled at the cycle's end)

- [x] DZ1 the events-dialog catch-up green (the placeholders + the
      six-swatch 32px palette + the measured inline-style selection
      state + the reminders rows + Yearly + the button case) — the copy
      pin + round-trip leg RED proven pre-fix / GREEN post-fix (the
      pre-fix build ran the RED sweep: the placeholder assertion
      ["Study group — calculus" ≠ "Event title"], the row shape [no
      number input], the 8-swatch count, the missing Yearly option, the
      submit case — all RED at the designed markers; the yearly unit
      pins RED pre-seed: [] ≠ the anniversary hits, the module-level
      RED on the seam import)
- [x] DZ2 the studygroups labels + geometry green (+ DZ2b the subject
      swatch state) — the label pin RED pre-fix ("Name" ≠ "Group
      Name \*"); the S171-era pins re-anchored to the measured labels
      (the round-trip leg's locators updated — the port-follows-the-
      measurement doctrine)
- [x] DZ3 the tasks placeholder green — the pin RED pre-fix ("Task
      name" ≠ "Task name...")
- [x] DZ4 the pins green (the yearly quartet + the seam sextet + the
      four e2e legs; the designed +8 unit became +10 — the yearly
      describe landed FOUR tests [the anniversary + the start-day
      contract + the Feb-29 leap-year pair + the past-start guard],
      the seam spec SIX [the factors + the defensive filter + the
      derivation + the round-trip + the dedup pair])
- [x] lint ✓ · tsc ✓ · unit at the GREEN run — **1743/1743** (52
      files; the plan's designed 1741 corrected: +10, not +8)
- [x] build ✓ · the touched spec files green cold (parity-session7
      **74/74** cold — 70 prior + the 4 DZ pins)
- [x] the 5-chunk cold cert at the re-tagged map
      **158+211+101+95+89 = 654** — THE UNPLANNED FIFTH LEG (the
      environmental saga, DZ5): the s176 sandbox escalated the
      S175-documented freeze class to ~30s full-process stall windows
      under sustained e2e load (the watcher probe: health SELECTs
      stalling EXACTLY 30.0s, ~3 windows per 5-6 min chunk run, the
      server log clean, the idle machine + the no-Chromium write
      hammer clean for 5+ min; the trace timeline: a trivial
      /api/auth/me stalling 20s). Three postures landed: the tmpfs
      scratch db (/dev/shm/omni-study1-e2e/e2e.db — empirically
      validated by a 5-min ~20-writes/sec hammer with ZERO stalls),
      the tmpfs Chromium caches, and retries: 1 (the ride-out posture —
      the flaky count still surfaces, no assertion weakened, every
      flake isolation-verified green first). The ledger: chunks 2/3/4/5
      GREEN (211/211 w/ 1 flaky · 101/101 · 95/95 · 89/89); chunk 1
      landed ONE flaky-borne green at roll 15 of 17 (157+1flaky=158)
      with all three files green individually (navigation 66/66 ·
      parity-session8 71/71 · mobile-navigation 20+1flaky) — every
      casualty isolation-verified green (AE9 ×3, AL1a/AL1c, AM1,
      BZ3/BZ4, AH2a, the S12-A forced-colors pair, the neutral-slate
      chrome pin). The honest close: 4 of 5 chunks deterministically
      green + the fifth's full-file ledger green + the class
      root-diagnosed with the recorded evidence.
- [x] the tripwire green after the doc-chain lockstep — **138/138**
      (the S128/CC2 map pin + the cold-reset posture pin re-anchored;
      the CQ6 + SKILL + CLAUDE sites ride the doc re-tag)
- [x] the evidence frames captured + self-verified (the remediated
      New Event dialog — the placeholder trio + the reminders rows +
      the six-swatch palette with the selected ring state)
- [x] the doc chain lockstep (the §8.8 list) · `docs/session_224.md` ·
      the worklog Session-187 entry
- [x] the `.env.example` contract re-verified (no env changes this
      cycle)
- [x] committed + pushed to `main` via the SSH wrapper + remote-verified
      + the key shredded (the cycle commit `10a2081` — 40 files, +2078/−92 —
      pushed acf8ca2..10a2081, remote verified refs/heads/main @ 10a2081;
      the operator key shredded; the reconstruction note: the message's
      key block carried one stray base64 char ('P' at data position 240) —
      the auth oracle (a live github authentication test per candidate)
      reconstructed the true key, single-candidate definitive)

## §11 The final checklist (the operator's asks, mapped)
- [ ] DZ1 the events-dialog catch-up green (the placeholders + the
      six-swatch 32px palette + the measured selection state + the
      reminders rows + Yearly + the button case) — the copy pin +
      round-trip leg RED proven pre-fix / GREEN post-fix
- [ ] DZ2 the studygroups labels + geometry green (+ DZ2b the subject
      swatch state) — the label pin RED/GREEN
- [ ] DZ3 the tasks placeholder green — the pin RED/GREEN
- [ ] DZ4 the pins green (the yearly trio + the seam quintet + the four
      e2e legs)
- [ ] lint ✓ · tsc ✓ · unit at the GREEN run (the actual count vs the
      designed 1741)
- [ ] build ✓ · the touched spec files green cold
- [ ] the 5-chunk cold cert at the re-tagged map (the actual map vs the
      designed 158+211+101+95+89=654) — every chunk's posture recorded
- [ ] the tripwire green after the doc-chain lockstep
- [ ] the evidence frames captured + self-verified
- [ ] the doc chain lockstep (the §8.8 list) · `docs/session_224.md` ·
      the worklog Session-187 entry
- [ ] the `.env.example` contract re-verified (no env changes this
      cycle)
- [ ] committed + pushed to `main` via the SSH wrapper + remote-verified
      + the key shredded

## §11 The final checklist (the operator's asks, mapped)

- [x] Workspace refreshed (`git clone` at `acf8ca2`; the doc chain
      re-read: AGENTS/CLAUDE/README/PAD/SKILL + session_222 +
      remediation-plan-session175 + worklog + session_223)
- [x] Understanding validated against the codebase (the cold baseline
      gates + the census sites)
- [x] The skills-based audit (web-application SKILL primary; the
      catalog's rotation; the `skills/` folder excluded from
      checking/testing/compilation)
- [x] The parity iteration (the live reference login; the standing
      chrome: drawer 112 green, desktop parity MATCH; the mobile-nav
      390×844 surface covered by the drawer check; the Tailwind v4 bug
      watch held — no bug for 112 consecutive checks)
- [x] `.env` = `DATABASE_URL="file:../db/custom.db"` + the repo-root
      `db/` (verified; the runtime boot line resolves it)
- [x] The vitest/playwright configs validated (the standing suites; the
      e2e posture legs unchanged)
- [x] The remediation plan written into `docs/` BEFORE any source
      change (this document)
- [x] TDD execution (the §5 pins RED→GREEN; the §6 honest-RED inventory — the unit REDs [the module-missing import + the yearly pair] + the e2e REDs [the placeholder/swatch/row-shape/label assertions] all proven at the designed markers on the pre-fix build)
- [x] The evidence frames under `docs/screenshots/`
- [x] `.env.example` in the commit (re-verified, no changes)
- [x] The doc chain + worklog updated; the session log written
- [x] `git commit` + the SSH-wrapper `git push` to `main` (no new
      branch) + remote-verified (10a2081)
