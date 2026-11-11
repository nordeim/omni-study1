import { defineConfig } from "vitest/config";
import path from "node:path";

// Unit-test layer for the pure domain seams — 51 files / 1733 tests
// (re-anchored S175/DY — the subjects-family field-port cycle: census
// 1731 → 1733, +2 net [script-conventions +2: the S175/DY3 CLAUDE.md
// census cross-read PAIR — the unit line + the e2e line, the CQ6
// family extended to the last unpinned doc; the stale 641 the audit
// found is the pin's own RED proof]. The e2e census moves 645 → 650
// [+5: the S175/DY1 subject create-dialog parity pin + teacher/room
// field port in parity-session7 — the reference's dialog re-deployment
// measured live at the s175 gated write-path probe (the write path
// WORKS this time — create → row render → delete exercised live,
// zero residue): the "Subject Name *" label + the "e.g., Mathematics"
// placeholder + the SEVENTEEN-swatch 32px/rounded-lg palette (the
// violet #8b5cf6 pristine default) + the "Teacher (optional)" +
// "Room (optional)" fields + the [Cancel][Add Subject] footer] + the
// four S175/DY4 gradetracker/settings-CRUD + AlertDialog-confirm
// legs — the grade edit round-trip, the grade delete confirm, the
// subject create-with-fields → row metadata → edit round-trip, the
// subject delete SetNull-consequences confirm; green-on-arrival
// coverage].)
// (re-anchored S174/DX — the CB8 COMPLETION cycle: the focusSessions +
// holidays + calculatorHistory families close the recorded family-wide
// port; census 1719 → 1731, +12 net [data-store +10: the S174/DX1
// family mutation CB8 splits — a committed write + a failed refresh
// RESOLVES for the focusSessions trio + the holidays trio + the
// createCalculatorEntry create-only observation (RED pre-fix ×7: the
// mutations rejected on the refresh leg — the false "Could not save the
// focus session." on a committed session with the CT1 re-latch armed,
// the false "Could not add the holiday." with the form armed for the
// duplicate-creating retry, the false history-failure on a committed
// calculator entry; the DK1…DW1 ports to the THIRTEENTH + FOURTEENTH +
// FIFTEENTH + FINAL families — after this cycle the port is COMPLETE,
// no family rides an uncaught refresh leg) + the three failed-write
// guards (green-on-arrival — the honest failure reaches the caller);
// enum-single-source +2: the EIGHTH census site — settings-view imports
// the S174/DX4-promoted HOLIDAY_TYPES single source (the measured
// reference type vocabulary — holiday/break/no-school — the import +
// no-local-twin pair)]. The e2e census moves 641 → 645 [+4: the
// S174/DX1a/DX1b/DX1c family CB8 legs in resilience (the POST
// continues, the collection GET aborts, a committed write answers each
// family's own success surface — the saved-session toast / the closed
// dialog / the result-on-display — never the false save-failure; the
// DX1c leg's observable is the SINGLE-SHOT toast count at +600ms after
// the refresh dispatch: the retrying toHaveCount(0) passed vacuously
// through the toast's 5s auto-dismiss — the s174 pin-correction
// lesson, both halves: the raw abort surfaces as the OFFLINE_MESSAGE
// never the fallback string, AND the negative retry-assertion on a
// self-dismissing element always passes eventually) + the S174/DX4
// create-dialog parity pin + start/end/type field port in
// parity-session7 (the reference's range-model dialog re-deployment,
// measured live at the s174 gated write-path probe — the reference's
// own create flow answers 403, a reference-side data bug recorded not
// ported: the "Start Date"/"End Date" native date inputs (both
// required, no defaults) + the three-button Type selector + the
// "e.g., Winter Break" placeholder + the footer's measured
// [Cancel][Add Holiday] order)].)
//
// (prior re-anchor, S173/DW — the grades-family hardening cycle: census
// 1713 → 1719, +6 net [data-store +4: the S173/DW1 grades-family
// mutation CB8 split — a committed write + a failed refresh RESOLVES
// for the create/update/delete trio (RED pre-fix ×3: the mutations
// rejected on the refresh leg — the false "Could not save the grade."
// that armed the duplicate-creating retry, the DK1/DL1/DM1/DN1/DP1/
// DQ1/DR1/DS1/DT1/DU1/DV1 events/exams/assignments/timetable/notes/
// flashcards/tasks/subjects/task-lists/study-groups/practice-tests
// ports to the TWELFTH family of the recorded family-wide port, the
// fifth of the eight remaining seams the S172 close's
// ledger-corrected order names; like the studygroups + practiceTests
// axes this family's mutations ALL have live view consumers) + the
// createGrade failed-write guard (green-on-arrival — the honest
// failure reaches the caller); enum-single-source +2: the SEVENTH
// census site — gradetracker-view imports the S173/DW2-promoted
// GRADE_TYPES single source (the measured reference type vocabulary —
// Homework/Quiz/Test/Midterm/Final/Project — the import + no-local-
// twin pair)]. The e2e census moves 639 → 641 [+2: the S173/DW1
// grades CB8 leg in resilience (the POST continues, the collection GET
// aborts, a committed create answers the "Grade added" success toast +
// the CLOSED dialog, never the false save-failure — the DW2 type/date
// fields carry deterministic defaults so the leg fills only the title
// + score + max) + the S173/DW2 create-dialog parity pin +
// type/date field port in parity-session7 (the reference's
// post-scaffold dialog re-deployment, measured live at the s173 gated
// write-path probe: the title "Add New Grade" + the capital-S "Max
// Score" label + the "Weight (optional, default 1)" hint + the Type
// select's "Homework" default + the native date input defaulting
// today + the footer's measured [Cancel][Add Grade] order)].)
//
// (prior re-anchor, S172/DV — the practicetests-family hardening cycle: census
// 1709 → 1713, +4 net [data-store +4: the S172/DV1 practiceTests-family
// mutation CB8 split — a committed write + a failed refresh RESOLVES
// for the create/update/delete trio (RED pre-fix ×3: the mutations
// rejected on the refresh leg — the false "Could not save the practice
// test." that armed the duplicate-creating retry, the DK1/DL1/DM1/
// DN1/DP1/DQ1/DR1/DS1/DT1/DU1 events/exams/assignments/timetable/
// notes/flashcards/tasks/subjects/task-lists/study-groups ports to
// the ELEVENTH family of the recorded family-wide port, the fourth of
// the eight remaining seams the S171 close's ledger-corrected order
// names; like the studygroups axis this family's mutations ALL have
// live view consumers) + the createPracticeTest failed-write guard
// (green-on-arrival — the honest failure reaches the caller)]. The
// e2e census moves 637 → 639 [+2: the S172/DV1 practiceTests CB8 leg
// in resilience (the POST continues, the collection GET aborts, a
// committed create answers the "Practice test created" success toast +
// the CLOSED dialog, never the false save-failure — the one question
// rides the clone's manual Add-question editor, the superset the
// reference's AI-only editor lacks) + the S172/DV2 create-dialog
// parity pin in parity-session7 (the reference's post-scaffold dialog
// re-deployment, measured live at the s172 gated write-path probe:
// the title "Create Practice Test" + the label "Test Title *" + the
// title placeholder "e.g., Biology Chapter 5 Review" + the footer's
// measured [Create Test][Close] order)].)
//
// (prior re-anchor, S171/DU — the studygroups-family hardening cycle: census
// 1701 → 1709, +8 net [data-store +6: the S171/DU1 studygroups-family
// mutation CB8 split — a committed write + a failed refresh RESOLVES
// for the create/update/delete trio + the setStudyGroupMembers chain
// entry (RED pre-fix ×4: the mutations rejected on the refresh leg —
// the false save-failure that armed the duplicate-creating retry, the
// DK1/DL1/DM1/DN1/DP1/DQ1/DR1/DS1/DT1 events/exams/assignments/
// timetable/notes/flashcards/tasks/subjects/task-lists ports to the
// TENTH family of the recorded family-wide port, the third of the
// eight remaining seams once the S170 close's stale "deck" ledger
// entry is corrected — the decks have carried the DQ1 catches since
// S167; unlike the task-lists axis this family's mutations ALL have
// live view consumers, so the pair set pins resolve through the
// members CHAIN too) + the two failed-write-still-rejects guards
// (the plain mutation AND the chain entry). data-import +2: the
// S171/DU2b studygroups description import cap — the registry key +
// the beyond-the-500-atom rejection leg (the ported field, the
// deck-description precedent)]. The e2e census moves 634 → 637 [+3:
// the S171/DU1 studygroups CB8 leg in resilience (the POST continues,
// the collection GET aborts, a committed create answers the "Study
// group created" success toast + the CLOSED dialog, never the false
// "Could not save the study group.") + the two S171/DU2 parity legs
// in parity-session7 (the reference's post-scaffold dialog
// re-deployment measured live at the s171 gated write-path probe:
// the title "Create Study Group" + the name placeholder "e.g., Math
// Study Squad" + the description textarea "What's this group
// about?" + the footer's measured [Create Group][Close] order; + the
// description round-trip — a create through the dialog lands the
// description in the detail pane)].)
//
// (prior re-anchor, S170/DT — the task-lists-family hardening cycle: census
// 1697 → 1701, +4 net [data-store +4: the S170/DT1 task-lists-family
// mutation CB8 split — a committed write + a failed refresh RESOLVES
// for the create/update/delete trio (RED pre-fix ×3: the mutations
// rejected on the refresh leg — the false save-failure that armed the
// duplicate-creating retry, the DK1/DL1/DM1/DN1/DP1/DQ1/DR1/DS1
// events/exams/assignments/timetable/notes/flashcards/tasks/subjects
// ports to the NINTH family of the recorded family-wide port, the
// second of the eight remaining seams the S168 close's ledger names;
// the family has NO view consumer — the tasks-view aside is read-only
// and the reference's own task dialog carries no list picker — so the
// pair set pins the mutation CONTRACT itself; the deleteTaskList leg's
// TWO-collection Promise.all [taskLists + tasks, the Task.listId
// SetNull reconciliation] gains ONE contained catch on the whole
// expression) + the failed-write-still-rejects guard]. The e2e census
// moves 632 → 634 [+2: the two S170/DT2 chrome-parity pins — the DT2a
// desktop-sidebar leg in navigation (the reference's post-S169
// shell-chrome deployment: border-x + shadow-xl + z-40 +
// transition-all 0.3s + the border-box 260/258 contract) + the DT2b
// mobile app-bar leg in mobile-navigation (border-b + shadow-sm +
// z-40 — the reference's measured classes, a longstanding clone miss
// the s170 parity-probe divergence pass converted into a finding)].)
//
// (prior re-anchor, S169/DS — the subjects-family hardening cycle:
// census 1693 → 1697, +4 net [data-store +4: the S169/DS1 subjects-family
// mutation CB8 split — a committed write + a failed refresh RESOLVES
// for the create/update/delete trio (RED pre-fix ×3: the mutations
// rejected on the refresh leg — the false save-failure that armed the
// duplicate-creating retry, the DK1/DL1/DM1/DN1/DP1/DQ1/DR1 events/
// exams/assignments/timetable/notes/flashcards/tasks ports to the
// EIGHTH family of the recorded family-wide port, the first of the
// eight remaining seams the S168 close's ledger names; the
// deleteSubject leg's ELEVEN-collection SUBJECT_TOUCHED Promise.all —
// the widest refresh blast radius in the codebase — gains ONE
// contained catch on the whole expression) + the
// failed-write-still-rejects guard]. The e2e census moves 631 → 632
// [+1: the S169/DS1 subjects CB8 leg in resilience — the POST
// continues, the collection GET aborts, a committed create answers
// the "Subject created" success toast + the CLOSED dialog, never the
// false "Could not save the subject."].)
//
// (prior re-anchor, S168/DR — the tasks-family hardening cycle:
// census 1686 → 1693, +7 net [data-store +7: the S168/DR1 tasks-family
// mutation CB8 split — a committed write + a failed refresh RESOLVES
// for the create/update/delete trio + the three chained toggles (RED
// pre-fix ×6: the mutations rejected on the refresh leg — the false
// save-failure that armed the duplicate-creating retry, the
// DK1/DL1/DM1/DN1/DP1/DQ1 events/exams/assignments/timetable/notes/
// flashcards ports to the SEVENTH family of the recorded family-wide
// port; the three toggle refreshes sit INSIDE the chained closures —
// each gained its own contained catch, so a flaky refresh neither
// rejects `await chained` nor poisons the chain) + the
// failed-write-still-rejects guard]. The e2e census moves 630 → 631
// [+1: the S168/DR1 tasks CB8 leg in tasks.spec — the POST continues,
// the collection GET aborts, a committed create answers the "Task
// created" success toast + the CLOSED dialog, never the false "Could
// not save the task."].)
//
// (prior re-anchor, S167/DQ — the flashcards-family hardening cycle:
// census 1679 → 1686, +7 net [data-store +7: the S167/DQ1
// flashcards-family mutation CB8 split — a committed write + a failed
// refresh RESOLVES for the deck trio + the card trio (RED pre-fix ×6:
// the mutations rejected on the refresh leg — the false save-failure
// that armed the duplicate-creating retry, the DK1/DL1/DM1/DN1/DP1
// events/exams/assignments/timetable/notes ports to the SIXTH family
// of the recorded family-wide port; the deleteFlashcardDeck double
// refresh catches BOTH legs) + the failed-write-still-rejects guard].
// The e2e census moves 629 → 630 [+1: the S167/DQ1 flashcards CB8 leg
// in parity-session8 — the deck POST continues, the collection GET
// aborts, a committed create answers the "Deck created." success
// toast + the CLOSED dialog, never the false "Something went
// wrong."].)
//
// (prior re-anchor, S166/DP — the notes-family hardening cycle: census
// 1669 → 1679, +10 net [data-store +8: the S166/DP1 notes-family
// mutation CB8 split — a committed write + a failed refresh RESOLVES
// for the notebooks trio + the notes trio + the setNoteTags chain
// (RED pre-fix ×7: the mutations rejected on the refresh leg — the
// false save-failure that armed the duplicate-creating retry, the
// DK1/DL1/DM1/DN1 events/exams/assignments/timetable ports to the
// FIFTH family of the recorded family-wide port; the deleteNotebook
// double refresh catches BOTH legs; the chain's write leg still
// rejects honestly) + the failed-write-still-rejects guard;
// text +2: the S166/DP3 htmlToText seam pins — the search's
// rendered-text form (tags stripped, entities decoded, NO cap — the
// full-body coverage; the capped stripHtmlPreview delegates to it
// unchanged)].
// The e2e census moves 627 → 629 [+2: the S166/DP1 notes CB8 leg in
// parity-session9 — the POST continues, the refresh GET aborts, a
// committed create answers the CLOSED dialog, never the false
// "Something went wrong." + the S166/DP3 notes-search rendered-text
// leg in parity-session7 — a tag-name query never matches a formatted
// note, the visible word always does].)
//
// (prior re-anchor, S165/DN — the timetable-family hardening cycle: census
// 1663 → 1669, +6 net [data-store +4: the S165/DN1 timetable mutation
// CB8 split — a committed write + a failed refresh RESOLVES for
// create/update/delete (RED pre-fix: the mutation rejected on the
// refresh leg — the false save-failure that armed the
// duplicate-creating retry, the DK1/DL1/DM1 events/exams/assignments
// ports to the FOURTH family of the recorded family-wide port) + the
// failed-write-still-rejects guard; enum-single-source +2: the
// S165/DN3 WEEK_TYPES census site — the view's hard-coded ALL/A/B
// triple (two Selects + the state type + the label-map keys) beside
// validation.ts:123's S133/CH2-promoted single source (the
// inline-twin form, the DM3 census-blind-spot class) converted to
// the map-over-the-import form, pinned by the import +
// no-local-twin pair].
// The e2e census moves 626 → 627 [+1: the S165/DN1 timetable CB8
// leg in parity-session9 — the POST continues, the refresh GET aborts,
// a committed create answers the success toast + the closed dialog].)
//
// (prior re-anchor, S164/DM — the assignments-family hardening cycle: census
// 1657 → 1663, +6 net [data-store +4: the S164/DM1 assignments mutation
// CB8 split — a committed write + a failed refresh RESOLVES for
// create/update/delete (RED pre-fix: the mutation rejected on the
// refresh leg — the false save-failure that armed the
// duplicate-creating retry, the DK1/DL1 events/exams ports to the
// third family of the recorded family-wide port) + the
// failed-write-still-rejects guard; enum-single-source +2: the
// S164/DM3 ASSIGNMENT_PRIORITIES census site — the view's local
// 4-value PRIORITIES twin beside validation.ts:101's single source
// (value-equal, the aliased-twin form the four prior sites never
// guarded) converted to the import alias, pinned by the import +
// no-local-twin pair].
// The e2e census moves 625 → 626 [+1: the S164/DM1 assignments CB8
// leg in parity-session9 — the POST continues, the refresh GET aborts,
// a committed create answers the success toast + the closed dialog;
// the cycle also carries the count-neutral S164/DM4 test-honesty fix —
// the S161/DJ5 leg's route glob `**/api/assignments*` → `**` (the
// single star never crossed `/`, so the designed PATCH-abort never
// fired)].)
//
// (prior re-anchor, S163/DL — the exams-family hardening cycle: census
// 1648 → 1657, +9 net [data-store +9: the S163/DL1 exams mutation
// CB8 split — a committed write + a failed refresh RESOLVES for
// create/update/delete (RED pre-fix: the mutation rejected on the
// refresh leg — the false save-failure that armed the
// duplicate-creating retry, the DK1 events port to the second family
// of the recorded family-wide port) + the failed-write-still-rejects
// guard; +5: the S163/DL3 promoted parseExamTopics seam — the topics
// safe-parse twin lived byte-identical twice in exams-view.tsx
// (openEdit + the card render), the S151/CZ1 parseNoteTags precedent
// executed for exams (the helper preserves the twins' semantics
// verbatim — every string passes, no length guard) with the pin set:
// valid-array/mixed-array-filter/non-array/invalid-JSON/empty-string].
// The e2e census moves 624 → 625 [+1: the S163/DL1 exams CB8 leg in
// parity-session8 — the POST continues, the refresh GET aborts, a
// committed create answers the success toast + the closed dialog].)
//
// (prior re-anchor, S162/DK — the events-family hardening cycle: census
// 1632 → 1648, +16 net [events +10: the S162/DK5 promoted recurrence
// seam — expandOccurrences moved VERBATIM from events-view.tsx to
// src/lib/events.ts (the S161-recorded F-7 deferral executed) with the
// full recurrence-rule pin set: none/daily/weekly-across-the-month-
// boundary/monthly-date-of-month (+ the Jan-31-skips-February
// short-month semantics)/past-start-guard/DST-rounding-absorption/
// start-day-only-parity-rule/return-contract/Date-typed-startDate;
// data-store +4: the S162/DK1 events mutation CB8 split — a committed
// write + a failed refresh RESOLVES for create/update/delete (RED
// pre-fix: the mutation rejected on the refresh leg — the false
// save-failure that armed the duplicate-creating retry) + the
// failed-write-still-rejects guard; enum-single-source +2: the
// census's FOURTH site — events-view imports REPEATS from
// validation.ts's single source (the four hard-coded SelectItems were
// the inline-twin form of the CB9 drift class) + the no-local-twin
// guard]. The e2e census moves 623 → 624 [+1: the S162/DK1 events CB8
// leg in parity-session5 — the POST continues, the refresh GET aborts,
// a committed create answers the success toast + the closed dialog].)
//
// (prior re-anchor, S161/DJ — the FE/views hardening cycle: census 1622 →
// 1632, +10 net [enum-single-source +6: the S161/DJ3 view enum
// single-source census — every view that renders a schema-enum's
// options must import it from validation.ts and declare no local twin
// (RED pre-fix on the exams-view EXAM_TYPES twin — the exact S127/CB9
// drift class; the assignments/settings siblings green-on-arrival, the
// guards); theme +2: the S161/DJ4 dark-edge token family pins — all 7
// accents emit --sf-primary-edge-dark at the 800-level step of their
// own hue family, violet exactly the measured violet-800; hue-tokens +2:
// the VIOLET_RESIDUALS closure pin (the register is EMPTY and stays
// empty — the harmonization pass executed) + the treated-dark-half
// census (the four migrated sites pinned to their edge-dark utilities)].
// The e2e census moved 619 → 623 [+4: the S161/DJ1 notes tag-failure
// toast + the S161/DJ2 timetable band hand-guard in parity-session7 +
// the S161/DJ4 dark-accent leg in theme-system + the S161/DJ5 slider
// resync pageerror-free pin in resilience]. The theme-cache 19-token
// census re-tagged in the same lockstep.)
//
// (prior re-anchor, S160/DI — the AI-routes hardening cycle: census
// 1619 → 1622, +3 net [validation +1: the S160/DI2 aiChatSchema
// user-message refine; ai-routes-census +2: the S160/DI3 AI-family
// source census]; the e2e census moved 616 → 619 [+3: the S160/DI5 CB8
// solver/flashcards twins + the S160/DI6 generate-cards pre-LLM wire
// pin].)
//
// (prior re-anchor, S159/DH — the optional-FK-mirror + value-parity-census
// cycle: census 1611 → 1619, +8 net [data-import +8: the S159/DH1
// optional-FK non-string rejection family — the CJ4 mirror at the
// optional boundary (a number/boolean/object optional-FK value now
// answers the NAMED 400 at validateImportEnvelope instead of riding to
// Prisma's generic "fields do not match" — 3 rejection legs + the
// null/undefined acceptance guards proving the SetNull semantics and
// the update-branch untouched case survive, + the parseImportEnvelope
// delegation leg) and the S159/DH2 length-cap VALUE-parity census — the
// IMPORT_FIELD_LENGTHS mirror made self-guarding against its FIVE
// hand-mirrored source sites (validation.ts's boundedTitle/jsonArray
// atoms + per-schema .max() literals, the folders route-local atom,
// ai.ts's PERSISTED_CONTENT_MAX, http.ts's UPLOAD_MIME_MAX_CHARS): a
// future relaxation in ANY source trips the census before the import
// bricks a restore the app itself minted — 3 census legs (the map
// completeness, the validation.ts parity, the other-source parity)].
// The e2e census stays 616 — no new e2e legs by design, the CV1
// runtime-split precedent: the route consumes the seam's error
// verbatim (already wired), and the S158 DG2/DG3 precedent held unit
// pins only. The DH0 measurement probe
// scripts/measure-import-create-s159.mjs records the create-side
// budget numbers (0.046 ms/row creates; the worst mixed tx 19.6 s of
// the 60 s budget — 3.07× headroom; pre-tx CPU 747 ms at the 100k-row
// cap), rejecting the raw-SQL create sibling ON MEASUREMENT.
//
// (prior re-anchor, S158/DG — the keyset-batched-reads cycle: census 1604 →
// 1611, +7 net [data-export +3: the S158/DG1 paged-reader family — the
// multi-batch byte-identity weld (batchSize 2 pages concatenate to
// EXACTLY the object form — the separator-across-pages correctness),
// the paging-contract leg (every continuation anchored at the previous
// page's LAST row; counts page-sum; the terminal hasMore), and the
// defensive-terminal leg (an empty page ends the collection even under
// a misbehaving empty+hasMore reader — the no-infinite-loop pin);
// script-conventions +4: the DG1 driver-mechanism census (the paged
// contract, the accumulation, the defensive break, the separator
// scaffolding), the DG1 server-wiring census (the BATCH+1 page, the
// unique-id keyset cursor + skip 1, all 20 readers ride pageAfter),
// the DG2 scoped-update census (the import tx's update where carries
// { id, userId } for the 19 userId-carrying collections — cards
// excepted, no userId column), and the DG3 panel-reset census (the
// Restore card's file input resets its value on EVERY pick — the
// stale-snapshot guard)]. The e2e census stays 616 — no new e2e legs
// by design, the CV1 runtime-split precedent: the three live consumers
// re-certify the wire (s21's page leg + the raw-body size pin — the
// wire is byte-identical through the pagination; s23's import legs —
// the DG2 update path re-certified compatible; navigation's DB2 twin).
// The REAL-Prisma keyset continuation (cursor + skip + orderBy at
// multi-batch scale) is verified by the committed probe
// scripts/measure-export-heap-s158.mjs's keyset-verify pass (counts ✓ ·
// unique ✓ · order ✓ at 50k rows per shape — the unit fakes cannot
// prove Prisma's cursor semantics and the e2e data is single-batch).)
// (re-anchored S156/DE — the streaming-export cycle: census 1594 → 1602,
// +8 net [data-export +9: the S156/DE1 driver family — the two ORACLE
// legs (the streaming form's concatenation is byte-identical to
// JSON.stringify(buildDataExport(...)) on the empty + the populated
// edge fixtures — the weld that keeps buildDataExport meaningful as the
// executable reference), the read-order leg, the SEQUENTIAL-reads leg
// (deferred-promise readers — the one-collection-at-a-time mechanism,
// the I-A fix's load-bearing property), the counts leg, the byte-count
// leg (the A-M2 carry-over: bytes === the whole body's UTF-8 count on
// the multi-byte fixture — · 👋), the name-safety leg, the user-block
// leg, the exportedAt leg; script-conventions +1: the route-streaming
// census (ReadableStream + enqueue + close, never fragments.join);
// data-export −2: the superseded exportByteSize its — the S142/CQ2
// whole-body encode-for-length is structurally gone (the F2 finding),
// its A-M2 lesson carried into the driver's byte leg]. The e2e census
// stays 616 — no new e2e legs by design, the CV1 runtime-split
// precedent: the four live consumers re-certify the wire (s21's
// strengthened RAW-BODY size pin — S156/DE3, the F4 finding; the
// s14/S139-CN2 live round-trip; resilience's budget family;
// navigation's page-budget twin), and the behavioral proof rides the
// unit oracle + the live stream probe (chunked transfer, exact header,
// idempotent restore) + the full cert.)
// (re-anchored S155/DD — the module-anchor percent-decode + db-path-family
// doc-reconciliation set: census 1588 → 1594, +6 net [db-path +4: the
// S155/DD1 module-anchor percent-decode family in the INTEGRATION form —
// each leg copies the REAL module into a fixture repo whose path carries
// the class trigger (a space, non-ASCII, plain-ASCII, a planted malformed
// URL literal), imports the copy through its own percent-encoded
// import.meta.url, and asserts resolution through the real candidateRoots
// (the spaced/non-ASCII legs are the B-I3 class's behavioral proof; the
// plain leg is the identity regression guard; the mutated-copy leg proves
// the URIError guard — the anchor skipped, the CWD fallback, never a
// throw); script-conventions +2: the S155/DD1 census pair (the DIRECT
// fileURLToPath call form — the import + the inline `const self =` shape +
// the marker, pinning the measured-design record: a helper-wrapped form is
// opaque to Turbopack's file tracer and grew the standalone output 144M →
// 699M — + the raw-pathform negative census, the assignment-anchored
// `= new URL(import.meta.url).pathname` shape, the DC4 precedent)]. The
// e2e census stays 616 — no new e2e legs by design, the CV1 runtime-split
// precedent: the decode is wire-invisible for every non-percent-encodable
// runner path (the decoded path is byte-identical where the pathname form
// worked), and the behavioral proof rides the integration legs + the
// live spaced-path probe + the full cert (every chunk boots the standalone
// through db-path).)
// (re-anchored S154/DC — the no-op-elision + questions-mirror +
// import-doc-reconciliation set: census 1582 → 1588, +6 net
// [data-import +4: the S154/DC2 questions item-shape mirror leg (the
// members twin — the non-object item, the wrong type vocabulary, the
// missing type, and the three valid shapes) + the S154/DC1
// plannedUpdateIsNoOp trio (the identical-row elides leg — Date↔ISO
// exact-ms + nulls + primitives, the re-import shape; the
// changed-value-never-elides leg — string/date/number/boolean; the
// every-doubt-keeps-the-write leg — the missing stored key, the typeof
// mismatch, null-vs-value both directions, the unparseable date, the
// object value, with the Prisma-skip undefined leg holding true);
// script-conventions +2: the S154/DC4 write-only negative census (no
// `.findFirst(` call form anywhere in the import route — green-on-
// arrival by design, the CS3/CL9 precedent) + the S154/DC1 elision
// census (the marker + the plannedUpdateIsNoOp call + the
// counted-as-updated `updated: u + ` wire)]. The e2e census stays 616 —
// no new e2e legs by design, the CV1 runtime-split precedent: the
// elision is wire-invisible by construction, and the s23 idempotent
// re-import pin IS the behavioral leg [all three rows elide, the wire
// still says updated: 3 — verified in the chunk-5 cert].)
// (re-anchored S153/DB — the rate-limit-model + export-page-budget set:
// census 1578 → 1582, +4 net [auth +2: the S153/DB1 capped-discharge pair
// (the discharge ceiling's 21st-decrement no-op leg — the success-only
// loop bound at the seam — + the window-rollover re-arm leg with the
// fresh-bucket allowance witness); script-conventions +2: the S153/DB1
// structural census (MAX_DISCHARGES_PER_WINDOW = 20 declared + the
// Bucket.discharges counter + the decrement's ceiling guard) + the
// S153/DB2 page-budget census (the exportPage: key + the
// redirect→budget→counts→envelope ordering + the honest rate-limited
// render markers)]. The e2e census 614 → 616 rides the two new pins:
// the S153/DB1 success-loop trip pin [parity-session8, chunk 1's new
// terminal] + the S153/DB2 page-budget pin [navigation.spec.ts, chunk
// 1 — relocated from its first s21 home when the chunk-5 registerGlobal:
// budget measured 40/40 exactly, the pin's throwaway register making
// s26's re-issue the 41st].)
// (re-anchored S152/DA — the delete-latch + hand-guard + replace-confirm
// + order-letter set: census 1555 → 1578, +23 net [validation +2: the
// S152/DA5 registerSchema fullName-trim pair (the padded-value-trims leg
// + the whitespace-only→cleared-state leg with the post-trim bound
// witness — the CY2 schoolName shape on the register atom);
// script-conventions +21: the S152/DA1 delete double-fire latch census
// (the seven fire-and-forget sites — the per-view deletingIds set, the
// membership guard before the DELETE, the finally removal keeping retry
// honest) + the S152/DA2 noValidate hand-guard census (the seven dialogs
// — the required-field guard with human copy before setBusy, never the
// server's raw Zod issue text) + the S152/DA3 replace-confirm census
// pair (the drafts.length gate before the AI call + the AlertDialog
// Replace action) + the S152/DA4 withUserParams 401-order census
// (requireUser before the CN11 id bound) + the S152/DA6 doc-counts
// cross-read pins ×4 (the CQ6 family, self-anchoring: the README
// unit-count sites + the import-cap prose vs IMPORT_MAX_BYTES + the
// SKILL green-state line + the CD3-posture census prose — each deriving
// its expectation from the vitest header / the cert map / the seam
// constant so the next count change forces the doc update in the same
// commit). The hue-tokens notes-view register re-anchored 705 → 711 and
// the flashcards-view registers re-anchored in the same cycle — the
// anchored legs tripped as designed when the DA1/DA2 edits added lines
// above the sites; the census maintenance, not a count change.])
// (re-anchored S151/CZ — the tags-chain + load-honesty + phantom-row +
// save-feedback set: census 1547 → 1555, +8 net [data-store +3: the
// S151/CZ1 notes-tags chain triple (the add-then-remove post-settle-base
// leg + the failed-first-op chain-hygiene leg + the missing-note no-op
// leg); script-conventions +5: the S151/CZ1 wiring census pair (the
// updater-form wiring + the saveTags-helper retirement) + the S151/CZ2
// files failed-load surface census (the loadFailed state + the alert +
// Retry leg ordered BEFORE the false-empty branch) + the S151/CZ3
// phantom-session gate census (the never-started gate BEFORE the session
// POST + `running` joining the deps) + the S151/CZ4 unit-save success
// toast census. The hue-tokens notes-view register re-anchored 700 → 705
// in the same cycle — the anchored leg tripped as designed when the CZ1
// rewire added lines above the site; the census maintenance, not a count
// change.])
// (re-anchored S150/CY — the folderId-bound + schoolName-trim +
// tag-honesty set: census 1543 → 1547, +4 net [validation +2: the
// S150/CY2 schoolName-trim pair (the padded-value-trims leg + the
// whitespace-only→cleared-state leg with the post-trim bound witness —
// the trim rides the validation ATOM, one source for the settings
// route AND the import profile patch); script-conventions +2: the
// S150/CY1 multipart folderId 64-char-bound census (the guard BEFORE
// the ownership query, the no-oracle 404 copy) + the S150/CY3 note-tag
// honest-feedback census (the two drop-reason toasts). The hue-tokens
// notes-view register re-anchored 686 → 700 in the same cycle — the
// anchored leg tripped as designed when the CY3 block added lines
// above the site; the census maintenance, not a count change.])
// (re-anchored S149/CX — the sibling-toggle-chain + members-chain +
// resend-transport + calc-save-latch + settings-me-failure set:
// census 1530 → 1543, +13 net [data-store +8: the S149/CX1
// sibling-chain trio (the myDay double-toggle opposite-value leg +
// the important twin + the failed-toggle-no-poison leg) + the two
// CX1 wiring censuses (tasks-view + myday-view ride the chained
// mutations, the render-snapshot PATCH shapes gone) + the S149/CX2
// members-chain pair (the add/remove interleave landing BOTH effects
// from the post-settle base + the missing-group no-op) + the CX2
// wiring census (the members panel handlers off the call-time store
// reads); script-conventions +5: the CX3 resend transport-branch
// census (timeout + offline distinguished from account state) + the
// CX4 calculator trio (the '=' re-press no-op guard + the GPA
// disable + the unit disable) + the CX5 settings me-fetch failure
// census (the loadFailed state + the alert + the Retry)].)
// (re-anchored S148/CW — the write-budget-completion +
// export-byte-ceiling + parse-status set: census 1519 → 1530, +11 net
// [data-export +9: the S148/CW2 export-byte-ceiling quintet (the
// EXPORT_MAX_BYTES 256-MiB value pin + the exportOverCeiling boundary
// legs — zero far-under / at-cap-last-allowed / one-past / the
// multi-GB tail) + the four CW2 wiring censuses (the seam throw, the
// toErrorResponse 413 branch, the page catch, the panel's derived
// state); script-conventions +1: the S148/CW1 per-method budget census
// (the calculator-history POST block sliced + asserted for its own
// checkRateLimit — the per-file CE6 census's structural blind spot);
// api-offline +1: the S148/CW3 malformed-2xx parse leg (ApiError 502,
// never the pretend-200)].)
// (re-anchored S147/CV — the node-env-casing-boot-warning +
// tripwire-cleanup set: census 1513 → 1519, +6 net
// [env-check +6: the S147/CV1 nodeEnvCasingWarning quintet (the
// canonical-silence + unset-silence + the capital-P host + the padded
// spellings + the arbitrary non-canonical values — the miscased NODE_ENV
// made loud, silent on every documented posture) + the S147/CV1
// instrumentation-wiring census leg (the CI6c 4th-leg precedent)].)
// (re-anchored S146/CU — the multipart-mime + OTP-tx + 413-discrimination
// + breadcrumb-recount set: census 1503 → 1513, +10 net
// [files +5: the S146/CU1 multipart mime admission-set quintet (the
// import door's mirrored cap — printable-ASCII ≤ 100, empty admitted;
// the length + CRLF + non-ASCII + control-family rejections); 
// script-conventions +5: the S146/CU1 files-route mime-guard wiring
// census, the S146/CU2a register re-issue-triple transaction census,
// the S146/CU2b register fresh-pair interactive-transaction census, the
// S146/CU2c resend supersede-pair transaction census (the CT2 mirror),
// the S146/CU3 files body-read BodyTooLargeError discrimination census
// (the CN6 shape)]. The S145/CT re-anchor blocks follow.)
// (re-anchored S145/CT — the completion-window + supersede-tx +
// gradient-CTA + budget-recount set: census 1500 → 1503, +3 net
// [script-conventions +3: the S145/CT1 focus-timer completion-window
// census (the saving-latch + settle-CAS markers — the behavioral legs
// ride the resilience e2e pair), the S145/CT2 forgot-password
// supersede-transaction census (the one-live-link invariant's batch
// $transaction wiring), the S145/CT4 demo-import-budget census (the
// census-visible POST call-site counts machine-pinned to the recounted
// headers — s23 9 fixture + the census-invisible in-app panel POST =
// 10/10 zero headroom; resilience 8 fixture + 1 demo.request = 9/10)].)
// (re-anchored S144/CS — the cursor-dequeue + row-ceiling + mime-charset +
// template-collector + drift-log + instance-scoped-CAS set: census
// 1490 → 1500, +10 net [data-import +4: the S144/CS2 250k-star topo-sort
// linearity leg (the O(n²) shift dequeue re-measured on this Node — 27 ms
// at 2×10⁴ → 2,842 ms at 2×10⁵, 25x rows 104x time; the cursor form runs
// 317 ms at the 250k probe, 30x) + the S144/CS4 mime-charset quadruple
// (the stored-CRLF 500-on-read class) + the S144/CS5 IMPORT_MAX_ROWS
// constant pair (the value + the byte-cap reconciliation); files +2: the
// downloadHeaders Content-Type clamp pair (the header-safe construction
// for pre-fix stored rows); http-body +1: the PrismaValidation drift-log
// spy (the silent-server-bug class stays observable); note-html-dom +1:
// the template-beyond-cap collector leg (the .content source — probed in
// BOTH happy-dom 21.0.4 and Chromium); script-conventions +2: the CS3
// merge-guard wiring census (the unpinned third site, green-on-arrival)
// + the CS5 route-wiring census]. The S144/CS1 CR5 census re-anchor (the
// React.useRef instance-scoped markers) rides in place.
// The prior re-anchor blocks follow.)
// (re-anchored S142/CQ — the unwrap-depth + door-alignment + byte-signal +
// named-P2025 + count-gate + CAS-rollback set: census 1449 → 1466, +17 net
// [note-html-dom +6: the CQ1 unwrap-path depth-cap legs (the disallowed
// chain collapses at the cap — markup beyond it dies, text survives; the
// honest environment-boundary record: happy-dom's own serializer/connected
// cascades throw at ≥4k nesting, so the ≥4k not.toThrow shape is browser-
// only — the cap-semantics pin is the unit-observable) + the CQ5 aligned
// anchor legs (data: hrefs die, relative/fragment hrefs die, rel injected,
// whitespace-only src dies); note-html +3: the server-door CQ5 twins (the
// relative/fragment href drop, the whitespace-src drop, the vocabulary
// quartet with rel); data-export +2: the CQ2 exportByteSize byte-vs-code-
// unit family (TextEncoder — the client-imported seam must never reach for
// Buffer); script-conventions +6: the CQ1/CQ2/CQ4/CQ6/CQ7/CQ8 censuses (the
// unwrap depth+subtreeText markers, the byte-signal chain seam→route→page,
// the P2025 named-409 leg, the AGENTS.md↔cert-map count-claims machine
// gate, the three CAS-rollback markers, the verify-email tx-fresh mint)]. The S143/CR re-anchor: census 1466 → 1490,
// +24 net [note-html-dom +4: the non-text-tag family dies whole (the
// five-tag set — script/style/textarea/option/xmp — RED-probed: their
// text survived the DOM door pre-fix, the CQ5-family residual; the
// container family unchanged; the depth-cap collector honors the set);
// note-html +2: the server-door nonTextTags drift pins; sent-keys-patch
// +1: the hostile-body own-keys leg; http-body +1: the shared
// PrismaClientValidationError→400 leg; fetch-seq +4: the sequence-ticket
// CAS seam (the value-compare ABA closed); data-import +6: the
// importRestoreError behavioral family (P2025/P2028/the BT1b
// PrismaValidation leg/the delegation contract); script-conventions +6:
// the CR1/CR2/CR4/CR5/CR3 markers + the CR7/CQ8 select-shape re-anchor].
// The prior S141/CP re-anchor block follows.)
// (re-anchored S141/CP — the render-gate snapshot + plain-text gate +
// restore-availability + size-signal set: census 1409 → 1449, +40 net
// [note-html-dom +17: the NEW happy-dom environment project — the first
// DOM-environment unit file (the S140 DOM render gate shipped with zero
// unit coverage; its moved-children walk was provably dead code — a
// DocumentFragment is EMPTIED by replaceChild — and every hostile
// element one nesting level deep escaped; the nested corpus + the depth
// cap + the tightened MIME/style rules on the DOM door); note-html +6:
// the CP2 entity-bearing passthrough pair + the CP5 svg/data-text-html
// img legs + the url()/expression() style legs + the rel injection;
// data-import +8: the CP3 probe-set derivation (cards→decks, folders
// self-FK, IMPORT_ORDER ordering) + the chunk constants + chunkImportIds;
// data-export +3: the CP4 formatExportBytes size-signal family;
// script-conventions +5+1: the CP3 route censuses (the timeout/maxWait
// pair, the probe-set markers, createMany, the hoisted-sanitize +
// collision-pre-flight markers) + the CP4 both-consumers-ride-the-seam
// leg + the CJ2 export-route census re-anchor onto the export-build
// seam]. The prior S140/CO re-anchor block follows.)
// (re-anchored S140/CO — the audit-driven hardening cycle: the note-HTML
// sanitize + authed-scrypt containment + checkbox-cn + FE-hardening set:
// census 1391 → 1409, +18 net [note-html +10: the S140/CO1 server-sanitizer
// pins — the hostile sextet (script/style blocks, inline handlers,
// javascript: and data:text/html hrefs, remote img src, iframe/object/
// embed/form/input/svg, srcset + non-color styles, non-ql- classes) + the
// Quill-vocabulary quartet + the plain-text/seed round-trip pair; auth +3:
// the S140/CO2 authBurnGlobal containment + CM3-decrement + the
// eviction-exemption census re-tag; script-conventions +5: the S140/CO2
// four-route authBurnGlobal census pair + the S140/CO5 AGENTS.md
// contract-line pin + the S140/CO1 import-route/delegate sanitize census
// pair; hue-tokens re-anchored: the dashboard residual's file:line shifted
// +1 by the CO3 cn() import]. The prior S139/CN re-anchor block follows.)
// (re-anchored S139/CN — the audit-driven hardening cycle: the parity-
// integrality + round-trip-witness + covering-index + bounded-walk set: census
// 1369 → 1391, +22 net [data-import +8: the S139/CN1 parity
// integrality sextet (progress/dayOfWeek integrality + maxScore ≥ 1 +
// files mime/size + the members item shape) + the S139/CN2 version-floor
// leg + the CE7 registry census re-anchor (files.mime joined);
// schema-indexes +1: the S139/CN3 Flashcard [createdAt, id] covering-
// index census; http-body +3: the S139/CN10 P2002/P2025/P2003 mapper
// legs (real PrismaClientKnownRequestErrors, the P2028 template);
// script-conventions +11: the S139/CN censuses (the bounded ancestor
// walk + the typed 413 catch + the sanitize-before-sort order + the
// panel timeout branch + the login SUCCESS-RESET ban + the register
// asymmetry + the Dockerfile init-user honesty + the USER bun pin + the
// route-param id bound + the dead orderBy branch + the txModelName
// resolution + the stale package-lock absence)]. The prior S138/CM
// re-anchor block follows.)
// (re-anchored S138/CM — the audit-driven hardening cycle: the exemption-
// hardening + KPI-gate + containment-decrement + honest-form set: census
// 1356 → 1369, +13 net [auth +4: the S138/CM1 crafted-key injection leg
// (a 'Global:'-substring forged-per-IP flood cannot grow the map past the
// cap — the exact-key whitelist's pin) + the S138/CM3 decrementRateLimit
// seam trio (decrement-without-re-arm + the zero floor + the missing-key
// no-op); http-body ±0: the S137/CL10 P2028 leg re-tagged in place to the
// source-neutral copy; script-conventions +9: the S138/CM censuses (the
// login decrement wire + the import route's route-local P2028 copy + the
// no-stale-'25 MiB'-outside-the-doc-block walk + the analytics OR-form
// comment + the entities window-honesty comment + the timetable stateless
// Grid Builder + the 14-consumed-ui-directory listing + the Dockerfile
// non-root USER + the conservative CSP profile)]. The prior S137/CL
// re-anchor block follows.)
// (re-anchored S137/CL — the audit-driven hardening cycle: the import-
// symmetry + cap-sizing + cards-bound + honest-copy set: census
// 1344 → 1356, +12 net [data-import +7: the S137/CL1 equal-times
// round-trip leg + the S137/CL2 cap-arithmetic pair (the 64 MiB const
// re-tag + the machine-checked >= 18-files bound) + the S137/CL6 date
// sanity band quintet (the far-future/pre-2000/far-future-updatedAt
// rejections + the old-but-legit + user-facing-un-banded acceptances);
// auth +1: the S137/CL8 global-bucket eviction-exemption leg (the
// loginGlobal: bucket SURVIVES a distinct-key flood past the cap);
// http-body +1: the S137/CL10 P2028 → 413 mapping (the real
// PrismaClientKnownRequestError, the named rollback copy);
// script-conventions +3: the S137/CL3 cards-take census + the S137/CL5
// folder-dialog copy census + the S137/CL10 409-copy census]. The prior
// S136/CK re-anchor block follows.)
// (re-anchored S136/CK — the audit-driven hardening cycle: the login-
// containment + files-race + CE3-residual + accent-literal set: census
// 1332 → 1344, +12 net [script-conventions +2: the S136/CK1 loginGlobal
// source census + the S136/CK10 verify-email emailVerified guard census;
// data-store +3: the S136/CK2 files-view loader sequence censuses (the
// ticket + the refresh capture-before-GET + the mount-effect supersede);
// secure-cookie +4: the S136/CK3 SET-path attribute pins (httpOnly +
// sameSite + path + the TTL maxAge, the behavioral NextResponse form);
// hue-tokens +3: the S136/CK5 inline-hex register (the zero-literal sweep
// with the comment-line discriminator + the KPI token-pair consumer + the
// sf-canvas soft-dark wash)]. The prior S135/CJ re-anchor block follows.)
// (re-anchored S135/CJ — the audit-driven hardening cycle + the violet
// accent-edge token family: census 1314 → 1332, +18 net [data-import +9:
// the S135/CJ2 IMPORT_ORDER seam-move family (the export pin + the
// manifest set-equality + the parents-first shape) + the S135/CJ4
// required-FK null/non-string trio + the S135/CJ5 parseImportRaceMessage
// trio; script-conventions +3: the S135/CJ2 route-side collection censuses
// (the export findMany count + the buildDataExport literal-key census +
// the import consumption census); theme +2: the S135/CJ3 accent-edge
// family (the per-accent 200-step emission + the violet byte-identity) +
// the S3-J pin's 17 → 18 re-anchor riding the existing leg;
// hue-tokens +2: the treated-light-half consumer census + the re-shaped
// dark-half register's clean-sweep leg; validation +1: the S135/CJ7
// preferencesSchema default-free pin; data-export +1: the S135/CJ7
// user-block Date→ISO pin].)
// (re-anchored S134/CI — the audit-driven hardening cycle + the KDF
// migration: census 1291 → 1314, +23 net [auth +14: the S134/CI1 scrypt
// KDF migration family (the 6-part format round-trip — which is ALSO the
// maxmem regression pin, both runtimes throw at N=2^17 without the
// explicit cap; the legacy 3-part dual-verify; the needsRehash semantics;
// the 6-part fail-closed family; the scryptBurns census — the transition
// equalizer's exactly-one-2^14-and-one-2^17-per-login-attempt invariant
// across the branch matrix, via a vi.hoisted+vi.mock node:crypto wrapper
// around the REAL scryptSync; the burnLoginScryptWork pair; the CI2
// session-expiry pair — the forged-signed-expired-payload pins) — plus the
// three format pins re-anchored in place (the round-trip regex, the
// DUMMY_LOGIN_HASH regex, the malformed legs); script-conventions +3: the
// S134/CI1 route censuses (the login rehash drain + the CG1 exhausted
// branch re-anchored to burnLoginScryptWork + the reset-password mint
// hoisted outside the $transaction); secure-cookie +2: the SESSION_TTL
// lockstep pair (the derivation + the value); view-collections +1: the
// S134/CI7a flashcards pre-warm subjects leg; env-check +4: the S134/CI6c
// overdeclaredProxyHopsWarning family; hue-tokens +2: the S134/CI8
// accent-semantic violet register (the negative sweep + the anchored
// legs)].)
// (prior cycle — re-anchored S133/CH — the audit-driven hardening cycle: census 1251 →
// 1291, +40 net [data-import +29: the S133/CH1 manifest-key family (the
// dead flashcardDecks.* keys renamed to decks.*, the deck-cap behavior
// pin, the five-registry manifest-consistency census) + the S133/CH2
// parity-contract family (five enum vocabularies, the hexColor atoms,
// the four length atoms, the grades 1000 ceiling, the min-1 trim mirror,
// the 64-char key bound) + the S133/CH5 JSON-registry correction (the
// phantom practiceTests.topics dropped, exams.topics added, the
// array-ness census) + the S133/CH6 echo-bound pins + the S133/CH4
// validateImportEnvelope family (the seam twin closed — the drifted
// missing-data pin re-anchored to the route's 400, the version-folding
// pin, the direct seam legs) — the CE7 key census re-anchored in place
// to the 33-key registry, the "unknown field" leg re-anchored in place;
// schema-indexes +1: the S133/CH3 FK-column index census (every relation
// column machine-checked for leftmost index coverage — the ten subjectId
// additions); script-conventions +3: the S133/CH4 caller census (the
// route consumes validateImportEnvelope, no inline twin) + the S133/CH9
// route-file shared-symbol census; api-timeout +3: the S133/CH10
// deadline single-source legs (the identity, the data.ts derivation, the
// page.tsx source); validation +4: the S133/CH8 trim-before-check pins
// + the S133/CH2 exported-vocabulary atoms; the data-store mock widened
// for the DEFAULT_GET_TIMEOUT_MS export (no count change)].
// (prior cycle — re-anchored S132/CG — the audit-driven hardening cycle: census 1236 →
// 1251, +15 net [auth +4: the S132/CG2 peppered OTP digest family
// (deterministic 64-hex, the pepper property, the secret-change
// brute-force-resistance property, the no-collision leg);
// script-conventions +4: the S132/CG1+CG3+CG11 auth-hardening census
// (login's exhausted loginAcct scrypt burn before the uniform 401;
// forgotAcct: per-email budget before the lookup + the honest-429 shape;
// registerGlobal: containment budget before the per-IP key) — the two
// S131/CF7 census legs RE-ANCHORED in place to the hashOtpCode mint/compare
// (no count change); env-check +4: the S132/CG4 parse-seam truth table
// (" 0"/"00"/"-1"/"two" all warn; " 1"/unset silent) + the relocation
// census (env-check hosts parseTrustedProxyHops, auth re-exports) + the
// re-run S120/BU3 behavior pins at the new home; theme-cache +3: the
// S132/CG9 BOOT_TOKEN_SUFFIXES derivation pins (the single source, the
// per-accent deep-equal alignment, the 17-token census)].
// (prior cycle — re-anchored S131/CF — the audit-driven hardening cycle:
// census 1217 → 1236, +19 net [script-conventions +10: the S131/CF1 per-email auth
// budget census (register/resend Acct keys before every DB read/scrypt
// burn, the payload-normalized no-oracle shape) + the S131/CF7 OTP
// digest-at-rest census (the digest mint at both create sites, the
// timingSafeEqual compare, the schema comment) + the S131/CF4+CF5 e2e
// posture + always-cold censuses (the four pinned webServer env vars; the
// cold-reset script chained into test:e2e — the DESIGN CORRECTION leg:
// global-setup must carry NO rm/port-kill, Playwright boots the webServer
// before globalSetup) + the S131/CF6 per-chunk cert-runner truth pair
// (byte-identical CHUNKS + the PIPESTATUS exit); env-check +4: the S131/CF2
// directExposureProdWarning truth table + the instrumentation wiring; site
// +3: the S131/CF10 siteUrl canParse self-heal matrix; auth +2: the
// S131/CF7 OTP digest family behavior pins (deterministic 64-hex, the
// normalize-then-digest pipeline)]. The S130/CE additions beneath:)
// (re-anchored S130/CE — the audit-driven hardening cycle: census 1202 →
// 1217, +15 net [api-timeout net +2: +4 the S130/CE1 default-deadline
// family (the structural live-signal legs + the constants + the
// override-wins discriminator) −2 the "does NOT time out" legs tombstoned
// (their patient-default premise is inverted by design); data-import +7:
// the S130/CE7 length-cap family (the 64-char id atom, the per-field
// registry legs + the key census + the unknown-field 1 M default);
// script-conventions +4: the S130/CE6 write-route budget census + the
// S130/CE5 transactional merge-guard census + the re-tag tripwire pair;
// hue-tokens +2: the S130/CE8 analytics tokenization sweep + the token-
// presence census; schema-indexes +1: the S130/CE9 FileFolder parentId
// index pin; import-row-guard net 0: the 1 M boundary legs corrected to
// an unregistered field (the registry caps tasks.title at 200 now — the
// documented correction the source change demands)]. The S129/CD
// additions beneath:)
// (re-anchored S129/CD — the audit-driven hardening cycle: census 1191 →
// 1202, +11 net [overlay-animation.test.ts the 45th file, +4: the S129/CD1
// tw-animate-css wiring pin + the overlay-class census + the dead-v3-dep
// guard; data-store +2: the S129/CD2 collection-GET deadline at the seam
// boundary (loadCollections + loadAll both hand apiGet the 20 s
// COLLECTION_GET_TIMEOUT_MS); http-body +3: the S129/CD4 BodyTooLargeError
// family + the 413 mapping + the plain-ValidationError 400 hold;
// script-conventions +2: the S129/CD8 api-route dynamic census (every
// route declares force-dynamic or routes through a dynamic-by-construction
// seam — a holds-class pin on the current tree)]. The S128/CC additions
// beneath:)
// (re-anchored S128/CC — the audit-driven hardening cycle: census 1171 →
// 1191, +20 net [toast.test.ts the 43rd file, +3: the S128/CC8 toaster
// identity/cap/auto-dismiss family; schema-indexes.test.ts the 44th, +4:
// the S128/CC10 factory-list composite-index census; api-timeout +3: the
// CC7 apiGet timeoutMs mirror; data-import +3: the CC1 profile-patch
// whitelist; data-store +3: the CC11 loading-flag in-flight counts;
// script-conventions +3: the CC2 cert-runner truth pair; calculator +1:
// the CC13 unary-minus-vs-^ convention lock; date net 0: +1 CC6 NaN-guard
// pin −1 the dead minutesToHHMM leg removed with its export]. The S127/CB
// additions beneath:)
// (re-anchored S125/BZ — the audit-driven hardening cycle: census 1113 →
// 1127, +14 [grade-merge.test.ts the 42nd file, +7: the checkGradeRangeMerge
// effective-pair legs — the single-leg score-over-stored rejection, the
// maxScore-under-stored rejection, the both-legs-inverted rejection (the
// merge owns the both-sent case for grades), the legal single-leg pass, the
// legal both-legs pass, the title-only no-op, the non-numeric stored legacy
// skip; validation +4: the gradeCreateSchema inverted pair, the legal pair,
// the 900/1000 heavy case, the bare-900 defaulted-denominator rejection;
// group-members +3: the removeOneMember one-occurrence seam — exactly one
// identical duplicate removed, the composite (email,name) disambiguation,
// the no-match no-op]).
// (re-anchored S124/BY — the audit-driven hardening cycle: census 1099 →
// 1113, +14. The additions: validation +7 [the S124/BY1 gradeLevel
// clearable union — the "" clear form accepted (RED pre-fix: the
// ZodError), the enum legs, the out-of-vocabulary rejection — and the
// S124/BY9 avatarEmoji vocabulary — a listed emoji accepted, the ""
// clear form legal, unlisted 6/8-code-point strings rejected (RED
// pre-fix: accepted)], db-path +2 [the S124/BY2 production gate — a
// missing absolute target passes through untouched in production (RED
// pre-fix: the silent dev-DB redirect), the dev correction leg
// parameterized], and rum-diagnostics +5 [the S124/BY6 buildTrends seam
// — the day's newest sample wins order-independently, an unsampled day
// is a null GAP never a fabricated 0, the 7-day window shape, the
// route's skip semantics, and the panel's seam-to-seam gap tolerance].
// The S123/BX additions beneath: validation +9 [the S123/BX1 both-legs family —
// the LEGAL unpadded span accepted ("9:00" → "11:00", the seeded shape
// the raw string compare falsely 400'd), the INVERTED padded/unpadded
// mix rejected (the "8:30" > "09:00" lexicographic bypass), the update
// both-legs twin, the malformed-atom coverage leg, the hhmmMinutes
// padded/unpadded/out-of-range family, the normalizeHhmmForInput
// padding legs, and the S123/BX5 exported nullableId atom pins] and
// date +5 [the S123/BX3 datetime-local round-trip helpers — the full-ISO
// from-local contract, the 16-char local wall-clock (never the Z-suffixed
// UTC clock), the TZ-independent round-trip instant preservation (the
// drift-kill property), the sub-minute truncation bound, and the
// empty/malformed legs]. The additions: timetable-merge +14 [the S122/BW7 ordering guard —
// the pure merge seam's single-leg inversions both directions, the legal
// moves, the null/neither-leg skips, the equal-legs legality, the
// UNPADDED legacy seeded hours ("9:00" vs "11:00" — the live-probe catch:
// a raw string compare rejects every legal move on a legacy row), the
// malformed-legacy skip, and the create/update schema checks], ai-helpers
// +15 [the S122/BW12 unit pins for src/lib/server/ai.ts — withDeadline
// (resolve, deadline rejection, the loser's rejection suppression, timer
// cleanup), extractAssistantContent (the shape-walker family), and
// extractJsonBlock (fences, bare JSON, the balanced-block fallback, the
// nulls) + the S122/BW6 capPersistedContent boundary (100_000 exact)],
// data-import +2 [the S122/BW8 derived-map pins — IMPORT_REQUIRED_FKS/
// IMPORT_OPTIONAL_FKS derived from IMPORT_FK_MAP, the drift-hazard close].)
//
// Unit-test layer for the pure domain seams — 39 files / 1054 tests
// (re-anchored S121/BV — the audit-driven hardening cycle: census 1030 →
// 1054. The additions: event-merge +12 [the S121/BV1 single-leg ordering
// merge — the pure seam's endDate-only/startDate-only inversions against
// the stored row, the legal moves, the null clear, the both-legs handoff
// to the update schema, the Date-fixture leg (the stored Prisma row's
// value type — the live-probe catch), the S121/BV10 mixed-offset family
// (Date.parse comparisons, a string-compare-passing inversion)], secure-
// cookie +3 [the S121/BV12 comma-joined x-forwarded-proto family], clear-
// cookie +3 [the S121/BV2 logout-side Secure derivation — the explicit
// flag honored both ways, the optionless NODE_ENV default preserved],
// owned-fks +3 [the S121/BV7 census registry — every FK-bearing delegate
// declares its owned FK targets, the field names match the schema
// vocabulary], auth +1 [the S121/BV9 limiter HARD cap — the all-live
// flood evicts the oldest bucket at cap, the map never exceeds 2048, the
// evicted key re-arms fresh], validation +2 [the S121/BV5 questions blob
// bound at 100k, the boundary exact]. The theme +0 in-place [the S121/
// BV15 17-var accentCssVars re-anchor — the solid --sf-primary-empty
// entry]; the wiring halves (the BV6 re-register password, the BV7
// owned-FK guards, the BV11a concurrent verify pair) ride the e2e layer.)
//
// Unit-test layer for the pure domain seams — 36 files / 1030 tests
// (re-anchored S120/BU — the parity-superset hardening cycle: census 990 →
// 1030. The additions: client-ip +14 [the S120/BU3 declared proxy-hop
// contract — parseTrustedProxyHops unset/0/N with the unparsable FAIL-CLOSED
// leg, clientIpFromForwarded first-hop/Nth-from-right/short-header/forged-
// longer-header], delivery-gate +6 [the S120/BU2 in-band delivery
// off-switches — DISABLE_IN_APP_OTP/RESET, kind isolation, the placeholder-
// empty and unparsable shapes], secure-cookie +6 [the S120/BU15
// secureCookieFlag seam — x-forwarded-proto beats the upstream protocol,
// case/whitespace/empty tolerance], hue-pairs +2 [the S120/BU10/BU11 slate
// text-pair guard — every static text-slate-500/400 site carries its
// dark:text-slate- sibling, the 51+8 site sweep machine-guarded], seed-gate
// +5 [the S120/BU21 SEED_DEMO fail-safe gate — default ON, 0/false/no OFF,
// unrecognized OFF], auth +2 appends [the S120/BU6 limiter bucket eviction —
// the lazy sweep at the 2,048 cap, expired windows die, live windows
// survive, the size observable + drain seam], validation +5 appends [the
// S120/BU22a eventSchema endDate>=startDate ordering refine],
// hue-tokens appends [the S120/BU8 sf-pill-blue family + the blue-100/700
// @theme pins — the reference's measured yellow→blue drift]. The
// route-level halves (the BU1 folder-dialog remount, the BU7 dashboard
// badge family, the BU8 exams-view badge, the BU9 Cancel buttons, the
// BU13 expiry announcement, the BU14 register shape, the BU16 headers, the
// BU4 RUM user-scoping) ride the e2e layer.)
//
// Unit-test layer for the pure domain seams — 31 files / 990 tests
// (re-anchored S119/BT — the audit-rider hardening cycle: census 963 → 990.
// The additions: http-body +9 [the S119/BT2 counting-reader family — the
// chunked-body cap aborts AT the cap without reading past it (the pull-
// count proof), the at-cap boundary, the multi-byte split-codepoint decode
// + the S119/BT1a assertJsonContentType family], import-row-guard +12
// [the S119/BT1b sanitizeImportRow family — the primitive-value contract,
// the 1M field guard, the files rows' javascript:/data: URL rejection, the
// name/data shape rules, the collection+index error naming], data-store +3
// [the S119/BT8 fetchAndSet sequence-guard family — the stale out-of-order
// resolution never clobbers], env-check +3 [the S119/BT5 forgeable-key
// band — <16 chars FATAL in production, the 16-char warn boundary].
// The route-level halves of BT1/BT2/BT3 ride the e2e layer (the s23
// perimeter pins + the auth-flows concurrent replay pair).
//
// Prior cycle (S118/BS — census 944 → 963):
// The additions: auth +3 [the S118/BS1 session-version family — the token
// embeds v, a missing v reads 0 (deploy compat), differing versions sign
// differently], validation +13 [the S118/BS2 bounded-reads family — the
// email atom trims+bounds, jsonArray 100k, requiredDate parses as a date,
// idField 64, mathSolve image 7M — + the S118/BS5 linkFileSchema trim
// family + the S118/BS7 RUM re-anchor family (4 pins carrying the ROUTE's
// enforced bounds: navType free-string, path 500, UA 400, value 6M, events
// 20)], rum-diagnostics +2 [the S118/BS6 CSV formula-neutralization family],
// view-collections +1 [the S118/BS8 settings-holidays pin]. The re-anchors:
// the RUM event/batch pins re-shaped to the enforced bounds (the old pins
// asserted the dead twin) + the theme-cache boot-script pin re-anchored to
// the var-KEY consumption (S118/BS12). The route-level halves of BS1/BS2/
// BS3 ride the e2e layer (the auth-flows reset-revocation + oversized-body
// pins, the mobile-navigation focus-lifecycle pin).
//
// Unit-test layer for the pure domain seams — 28 files / 944 tests
// (re-anchored S117/BR — the hardening cycle: census 936 → 944.
// The additions: auth +5 [the S117/BR3 timing-equalizer family —
// verifyLoginCredentials's matching/miss semantics + the DUMMY_LOGIN_HASH
// scrypt-shape pin that fails the "dummy = malformed string" mutant
// which would silently reinstate the login enumeration oracle — and the
// S117/BR6 hashResetToken family (deterministic 64-hex digest, differs
// from the raw token, differs between tokens)] and validation +3
// [the S117/BR4 linkFileSchema family — http/https accepted,
// javascript:/data:/file:/ftp:/mailto: rejected, the name/folderId
// shape preserved]. The route-level halves of BR1/BR2/BR5 ride the
// e2e layer (the s23 cards round-trip pin + the auth-flows verify-429
// TEST-NET pin); the seam exports BR1 reconnected (IMPORT_MAX_BYTES,
// NEVER_IMPORT_FIELDS, sortFoldersParentsFirst) were already pinned by
// the 30-test data-import family.
//
// Unit-test layer for the pure domain seams — 28 files / 936 tests
// (re-anchored S116/BQ — the rotation program's SECOND PASS's cycle
// four, the LIGHT QUARTET's closing cell: census UNCHANGED at 936.
// The BQ cycle touched documentation + scripts only: the BP1 record's
// dated register note [the post-BP final-tree playwright-class counts
// 247 importers / 128 Usage-line carriers — the two s115 riders
// joined the guarded class after the BP1 measurement; the register
// rotates forward, the threshold-form pins absorb growth by design,
// the exact-count pin stays rejected] and the s116 riders
// [ref-resweep-s116.mjs + capture-s116-evidence.mjs — the
// MOBILE-LANDSCAPE LIGHT evidence-frame rotation, the second pass's
// cycle four: the landscape cell 844×390, the light quartet's LAST
// never-second-passed cell, with the s107 pair both taking their
// FIRST light-side frames — the drawer nav-scroll (the
// landscape-only structural discriminator: the 20-link nav list
// MUST scroll at the 390px viewport height, scrollHeight >
// clientHeight, while the portrait list fits unscrolled; the 288px
// w-72 panel over the light surface, the S3-L brand header, the
// dialog semantics) + the Tasks light (the active-list h1 "All
// Tasks" — the derived value; the md:flex two-pane layout rendered
// AT 844; the red-pill family on the overdue row + the violet
// RepeatPill + slate SubjectChip on the boundary row, NEVER the
// exact date)]. No new pins; src/ and tests/ untouched — the census
// projection exact.)
// Unit-test layer for the pure domain seams — 28 files / 936 tests
// (re-anchored S114/BO — the rotation program's SECOND PASS's cycle
// two: census UNCHANGED at 936. The BO cycle touched documentation +
// scripts only: the BN1 record's dated register note [the post-BN
// final-tree playwright-class counts 243 importers / 124 Usage-line
// carriers — the two s113 riders joined the guarded class after the
// BN1 measurement; the register rotates forward, the threshold-form
// pins absorb growth by design, the exact-count pin stays rejected]
// and the s114 riders [ref-resweep-s114.mjs + capture-s114-evidence.mjs
// — the MOBILE-PORTRAIT LIGHT evidence-frame rotation, the second
// pass's cycle two: the mobile home band 390×844, now the tied-thinnest
// light coverage, with the Dashboard light (the view's FIRST light-side
// frame; the greeting-bucket h1 + the long-date subtitle at the live
// clock's own signature, the sf-overdue-banner Overdue alert, the
// Today's tasks region, the four stat cards, the Upcoming Exams +
// Assignments sections, the fixed glass app bar) + the Notes light (the
// view's FIRST light-side frame; the Notes list pane's four seeded
// rows, the All Notebooks / All Tags comboboxes, the Search notes
// input, the Filter-by-tag button, the sf-gradient create FAB — the
// reference's own /Notes mobile overflow defect NOT reproduced, now on
// the light side too)]. No new pins; src/ and tests/ untouched — the
// census projection exact.)
// Unit-test layer for the pure domain seams — 28 files / 936 tests
// (re-anchored S113/BN — the rotation program's SECOND PASS's opening
// cycle: census UNCHANGED at 936. The BN cycle touched documentation +
// scripts only: the BM1 record's dated register note [the post-BM
// final-tree playwright-class counts 241 importers / 122 Usage-line
// carriers — the two s112 riders joined the guarded class after the BM1
// measurement; the register rotates forward, the threshold-form pins
// absorb growth by design, the exact-count pin stays rejected] and the
// s113 riders [ref-resweep-s113.mjs + capture-s113-evidence.mjs — the
// DESKTOP LIGHT evidence-frame rotation, the second pass's opening
// cycle: the theme axis AND the view-level rotation program both
// completed at s112 [the exhaustion cycle — all four viewport cells ×
// both sides + every nav view carrying at least one rotation frame];
// the second pass re-probes any cell, any view, fresh — the desktop
// light cell [1280×800, its light coverage the thinnest of the four:
// Events + Analytics at s109] with the Flashcards light [the view's
// FIRST light-side frame; the h1, the Deck list pane, the three seeded
// decks, the auto-selected first deck's detail, the Card grid's four
// seeded cards at their raw-textContent difficulty pills] + the
// Timetable light [the view's FIRST light-side frame; the h1 +
// subtitle, the Week filter combobox, the month-label h2 at the live
// clock's own signature, the Week grid's five seeded classes, the My
// Classes panel]. No new pins; src/ and tests/ untouched — the census
// projection exact.)
// Unit-test layer for the pure domain seams — 28 files / 936 tests
// (re-anchored S112/BM — the exhaustion cycle: census UNCHANGED at
// 936. The BM cycle touched documentation + scripts only: the BL1
// record's dated register note [the post-BL final-tree playwright-class
// counts 239 importers / 120 Usage-line carriers — the two s111 riders
// joined the guarded class after the BL1 measurement; the register
// rotates forward, the threshold-form pins absorb growth by design,
// the exact-count pin stays rejected] and the s112 riders
// [ref-resweep-s112.mjs + capture-s112-evidence.mjs — the MID-BAND
// LIGHT evidence-frame rotation, the theme axis's LAST never-varied
// cell, the exhaustion cycle: with these two frames both the theme
// axis (all four viewport cells × both sides) AND the view-level
// rotation program (every nav view carrying at least one rotation
// frame) complete; the rotation program's 24 committed frames cover
// all four viewport cells on dark (1280×800 desktop ×10 + 390×844
// mobile-portrait ×4 + 844×390 mobile-landscape ×2 + 768×1024
// mid-band ×2) plus three light cells (1280×800 desktop ×2, s109;
// 390×844 mobile-portrait ×2, s110; 844×390 mobile-landscape ×2,
// s111); the MathSolver mid-band light [the view's FIRST rotation
// frame; the h1 "Math Solver" + subtitle, the aria-label="Math
// problem" textarea, the Solve button disabled at rest, the "Math
// solution" region's rest copy, the "Recent Problems"
// seed-deterministic empty state] + the AIAssistant mid-band light
// [the view's FIRST rotation frame; the h1 "AI Study Assistant" +
// subtitle, the empty-transcript intro, the aria-label="Quick
// actions" six sf-card prompt buttons, the aria-label="Message the
// assistant" composer — the shadcn Input, an <input> element NOT a
// textarea, the S112 lesson-2 element-tag doctrine — with the Send
// message button disabled at rest]. No new pins; src/ and tests/
// untouched — the census projection exact.)
// Unit-test layer for the pure domain seams — 28 files / 936 tests
// (re-anchored S111/BL — the honest-zero-cycle: census UNCHANGED at
// 936. The BL cycle touched documentation + scripts only: the BK1
// record's dated register note [the post-BK final-tree playwright-class
// counts 237 importers / 118 Usage-line carriers — the two s110 riders
// joined the guarded class after the BK1 measurement; the register
// rotates forward, the threshold-form pins absorb growth by design,
// the exact-count pin stays rejected] and the s111 riders
// [ref-resweep-s111.mjs + capture-s111-evidence.mjs — the
// MOBILE-LANDSCAPE LIGHT evidence-frame rotation, the theme axis's
// never-varied LANDSCAPE cell: the rotation program's 22 committed
// frames cover all four viewport cells on dark (1280×800 desktop ×10
// + 390×844 mobile-portrait ×4 + 844×390 mobile-landscape ×2 +
// 768×1024 mid-band ×2) plus the home band and the mobile band on
// light (1280×800 desktop ×2, s109; 390×844 mobile-portrait ×2,
// s110); the theme axis's remaining never-varied cells —
// mobile-landscape×light, mid-band×light; the Calendar landscape
// light [the view's FIRST rotation frame; the A4/S5-G/S9-F mode
// switch — the Calendar tab aria-pressed=true in the sf-selected-tint
// violet-600 rgb(124, 58, 237), the 7-column weekday header, the
// today cell data-today=true selected by default] + the FocusTimer
// landscape light [the view's FIRST rotation frame; the seeded stats
// 7/7 with the Today card at the 0-or-1 midnight boundary, the
// Pomodoro preset's border-sf-primary violet, the role=timer 25:00
// rest state]]. No new pins; src/ and tests/ untouched — the census
// projection exact.)
// Unit-test layer for the pure domain seams — 28 files / 936 tests
// (re-anchored S110/BK — the honest-zero-cycle: census UNCHANGED at
// 936. The BK cycle touched documentation + scripts only: the BJ1
// record's dated register note [the post-BJ final-tree playwright-class
// counts 235 importers / 116 Usage-line carriers — the two s109 riders
// joined the guarded class after the BJ1 measurement; the register
// rotates forward, the threshold-form pins absorb growth by design,
// the exact-count pin stays rejected] and the s110 riders
// [ref-resweep-s110.mjs + capture-s110-evidence.mjs — the
// MOBILE-PORTRAIT LIGHT evidence-frame rotation, the theme axis's
// never-varied MOBILE cell: the rotation program's 20 committed frames
// cover all four viewport cells on dark + the home band on light
// (1280×800 desktop ×10 dark + ×2 light, s109); the theme axis's
// remaining never-varied cells — mobile-portrait×light,
// mobile-landscape×light, mid-band×light — the S109 lesson-3 axis
// enumeration applied one cell deeper; the Settings mobile light [the
// view's FIRST rotation frame; the Appearance tab's measured chrome —
// the selected Light theme button's violet border rgb(139, 92, 246),
// the 7 accent swatches with Violet aria-pressed — deterministic from
// the seed, zero interaction] + the Files mobile light [the view's
// FIRST rotation frame; the S17-pinned zero-data EmptyState the seed
// produces — the seed creates no folders/files: the "No files yet"
// card with the gradient Upload CTA; the stacked mobile two-pane at
// 390]]. No new pins; src/ and tests/ untouched — the census
// projection exact.)

// Unit-test layer for the pure domain seams — 28 files / 936 tests
// (re-anchored S109/BJ — the honest-zero-cycle: census UNCHANGED at
// 936. The BJ cycle touched documentation + scripts only: the BI1
// record's dated register note [the post-BI final-tree playwright-class
// counts 233 importers / 114 Usage-line carriers — the two s108 riders
// joined the guarded class after the BI1 measurement; the register
// rotates forward, the threshold-form pins absorb growth by design,
// the exact-count pin stays rejected] and the s109 riders
// [ref-resweep-s109.mjs + capture-s109-evidence.mjs — the LIGHT
// evidence-frame rotation, the theme axis's NEVER-VARIED side: the
// rotation program's 18 committed frames covered all four viewport
// cells — 1280×800 desktop + 390×844 mobile-portrait + 844×390
// mobile-landscape + 768×1024 mid-band — and 18/18 are DARK, LIGHT
// NEVER varied; the Events desktop light [the view's FIRST rotation
// frame; the WITHIN-VIEW THEME BOUNDARY = the light-only discriminator:
// the bg-slate-900 terminal panel is intentionally dark in BOTH themes,
// the boundary asserted both sides — the panel computes rgb(15, 23, 42)
// while the page h1 computes the light-side slate-800 rgb(30, 41, 59)] +
// the Analytics desktop light [the view's FIRST rotation frame; the
// light-side WITHIN-ELEMENT reads — the chart axis text at the
// light-only #666 rgb(102, 102, 102), the StatBlock cards at the
// light-only bg-white rgb(255, 255, 255); the seeded stat values
// 2/12 + 0/6 + 4; the stat grid's EXACTLY 4 px tracks at the desktop
// band]]. No new pins; src/ and tests/ untouched — the census
// projection exact.)

// Unit-test layer for the pure domain seams — 28 files / 936 tests
// (re-anchored S108/BI — the honest-zero-cycle: census UNCHANGED at
// 936. The BI cycle touched documentation + scripts only: the BH1
// record's dated register note [the post-BH final-tree playwright-class
// counts 231 importers / 112 Usage-line carriers — the two s107 riders
// joined the guarded class after the BH1 measurement; the register
// rotates forward, the threshold-form pins absorb growth by design,
// the exact-count pin stays rejected] and the s108 riders
// [ref-resweep-s108.mjs + capture-s108-evidence.mjs — the MID-BAND
// evidence-frame rotation, the viewport-band matrix's LAST never-varied
// cell: the rotation program's 16 committed frames covered exactly
// 1280×800 desktop + 390×844 mobile-portrait + 844×390 mobile-landscape,
// and 768×1024 mid-band NEVER varied — the S107 lesson-1's own
// band-matrix enumeration; the PracticeTests view [the view's FIRST
// rotation frame; the 2-COLUMN grid = the MID-BAND-ONLY structural
// discriminator — the computed gridTemplateColumns carries EXACTLY 2
// tracks at 768, never 1 (mobile-portrait) and never 3 (desktop-lg),
// the column-count boundary asserted BOTH sides] + the StudyGroups view
// [the view's FIRST rotation frame; the two-pane flex negotiation at
// full 320px w-80 — the S78/AE13 floor shrinks the aside to ~222px at
// 390; the S8-Z two-variant empty-state boundary asserted on the
// seeded side — ONE group + null selection renders the PLAIN variant,
// the 80px gradient EmptyState renders ONLY at zero groups]]. No new
// pins; src/ and tests/ untouched — the census projection exact.)

// (re-anchored S106/BG — the honest-zero-cycle: census UNCHANGED at
// 936. The BG cycle touched documentation + scripts only: the BF1
// record's dated register note [the post-BF final-tree playwright-class
// counts 227 importers / 108 Usage-line carriers — the two s105 riders
// joined the guarded class after the BF1 measurement; the register
// rotates forward, the threshold-form pins absorb growth by design,
// the exact-count pin stays rejected] and the s106 riders
// [ref-resweep-s106.mjs + capture-s106-evidence.mjs — the MOBILE
// evidence-frame rotation, the SECOND mobile cycle, EXHAUSTING the
// views' mobile-only md:hidden class: the Flashcards in-row Study
// affordance [the neutral-950 family's first rotation-frame subject;
// the seeded 0-card deck renders NO affordance — the boundary-row
// discriminator] + the Notes create FAB [the gradient family's first
// MOBILE evidence frame, the S79/AF6 surface]]. No new pins; src/
// and tests/ untouched by the PLANNED riders — the BG4 reserved rider
// then exercised legitimately: the seam label + the boundary-test note
// carry the co-residency context fix [the standing-suite runner stops
// :3000 for the cwv-volume-stress stage — the pin stays 2400; modified
// NOTES only, the census projection exact].)

// (re-anchored S105/BF — the honest-zero-cycle: census UNCHANGED at
// 936. The BF cycle touched documentation + scripts only: the BE1
// record's dated register note [the post-BE final-tree playwright-class
// counts 225 importers / 106 Usage-line carriers — the two s104 riders
// joined the guarded class after the BE1 measurement; the register
// rotates forward, the threshold-form pins absorb growth by design,
// the exact-count pin stays rejected] and the s105 riders
// [ref-resweep-s105.mjs + capture-s105-evidence.mjs — the MOBILE
// evidence-frame rotation at 390×844 in dark onto the Timetable
// md:hidden day accordion [the sf-chip-dark Today chip — the family's
// first rotation-frame subject; a surface that cannot exist at desktop]
// + the Dashboard mobile [the sf-overdue-banner from the seeded overdue
// task — the family's first mobile evidence frame; the viewport axis
// the program never varied, the S105 lesson-1]. No new pins; src/
// and tests/ untouched.)
// (re-anchored S104/BE — the honest-zero-cycle: census UNCHANGED at
// 936. The BE cycle touched documentation + scripts only: the BD1
// record's dated register note [the post-BD final-tree playwright-class
// counts 223 importers / 104 Usage-line carriers — the two s103 riders
// joined the guarded class after the BD1 measurement; the register
// rotates forward, the threshold-form pins absorb growth by design,
// the exact-count pin stays rejected] and the s104 riders
// [ref-resweep-s104.mjs + capture-s104-evidence.mjs — the
// evidence-frame rotation onto the Timetable dark today-header + the
// MyDay dark progress card, both already e2e-pinned surfaces, both
// rendered from the seed — the structural-family class's first
// rotation frame, the S104 lesson-2 widened map]. No new pins; src/
// and tests/ untouched.)
// (re-anchored S103/BD — the honest-zero-cycle: census UNCHANGED at
// 936. The BD cycle touched documentation + scripts only: the BC1
// record's dated register note [the post-BC final-tree playwright-class
// counts 221 importers / 102 Usage-line carriers — the two s102 riders
// joined the guarded class after the BC1 measurement; the register
// rotates forward, the threshold-form pins absorb growth by design,
// the exact-count pin stays rejected] and the s103 riders
// [ref-resweep-s103.mjs + capture-s103-evidence.mjs — the
// evidence-frame rotation onto the Exams dark urgency pills + the
// Flashcards dark difficulty badges, both already e2e-pinned surfaces,
// both rendered from the seed]. No new pins; src/ and tests/
// untouched.)
// (re-anchored S102/BC — the honest-zero-cycle: census UNCHANGED at
// 936. The BC cycle touched documentation + scripts only: the BB1
// record's dated register note [the post-BB final-tree playwright-class
// counts 219 importers / 100 Usage-line carriers — the two s101 riders
// joined the guarded class after the BB1 measurement; the register
// rotates forward, the threshold-form pins absorb growth by design,
// the exact-count pin stays rejected] and the s102 riders
// [ref-resweep-s102.mjs + capture-s102-evidence.mjs — the
// evidence-frame rotation onto the GradeTracker dark score pills + the
// Assignments dark soft pills, both already e2e-pinned surfaces]. No
// new pins. The BC4 rider (found by the final re-cert): the S12-B
// skip-link test's hydration gate strengthened IN-PLACE to the
// status-gated data-app-hydrated marker — ONE test file touched, the
// census UNCHANGED, the count projection exact.)
// (re-anchored S101/BB — the honest-zero-cycle: census UNCHANGED at
// 936. The BB cycle touched documentation + scripts only: the BA1
// record's dated register note [the post-BA final-tree playwright-class
// counts 217 importers / 98 Usage-line carriers — the two s100 riders
// joined the guarded class after the BA1 measurement; the register
// rotates forward, the threshold-form pins absorb growth by design,
// the exact-count pin stays rejected] and the s101 riders
// [ref-resweep-s101.mjs + capture-s101-evidence.mjs — the
// evidence-frame rotation onto the Login check-email alert + the
// /export import-success alert, both already e2e-pinned surfaces]. No
// new pins; src/ untouched.)
// (re-anchored S100/BA — the honest-zero-cycle: census UNCHANGED at
// 936. The BA cycle touched documentation + scripts only: the AZ2
// record's dated register note [the final-tree playwright-class counts
// 215 importers / 96 Usage-line carriers — the two s99 riders joined
// the guarded class after the 213/94 widening measurement; the
// threshold-form pins absorb growth by design, an exact-count pin
// explicitly rejected as contradicting the silent-absorption intent]
// and the s100 riders [ref-resweep-s100.mjs + capture-s100-evidence.mjs
// — the evidence-frame rotation onto the Calculator dark AC key + the
// Events dialog error banner, both already e2e-pinned surfaces]. No
// new pins; src/ untouched.)
// (re-anchored S99: +2 — the AZ riders: the AZ1 normalization pin in
// hue-tokens [the inline-comment plant shape normalizes under the AY3
// strip to a conventional duplicate — the shape-true mutation matrix
// machine-checked: the variant-shape plant AND the inline-comment plant
// both trip the dupe check, the wildcard form trips the reconciliation
// pin, a prose comment trips NOTHING; the strip-disabled mutation fails
// BOTH comment-immunity pins] and the AZ2 playwright-class census
// widening in script-conventions [the AY1 convention pin's class widened
// IN-PLACE from the two-lineage proxy to every playwright-importing
// script — 213 importers, 94 Usage-line carriers; the blind spot
// demonstrated live on a planted z-probe-s70.mjs bun line that left the
// lineage-scoped pin GREEN, the widened pin catching it, restored green;
// the new sanity leg proves the playwright-class census ran])
// (re-anchored S98: +3 — the AY riders: the NEW
// tests/script-conventions.test.ts (+2: the re-tag script-class
// runner-convention census [every Usage line in the capture/resweep
// lineages documents the node runner — the ten stale bun lines
// swept, the class self-guarding] + its class-census sanity leg)
// and the AY3 census comment-immunity in hue-tokens (+1: the strip
// helper's discrimination pin; both census counts re-anchored
// IN-PLACE onto the comment-stripped CSS — a prose @utility mention
// can no longer inflate the token census into a loud false failure;
// the three-plant mutation matrix: the variant-shape plant trips
// exactly the widened dupe check, the unparseable-form plant trips
// exactly the reconciliation pin, the comment plant trips NOTHING)
// (re-anchored S97: +1 — the AX1 @utility census hardening in hue-tokens:
// the AW1 completeness pin's header regex widened IN-PLACE to every header
// shape + hoisted to its own describe, and the NEW token-reconciliation
// pin [the @utility token count must equal the matched-header count — an
// unparseable header form fails LOUDLY, never silently out of the census];
// the shape-variant blind spot demonstrated live (a planted
// `@utility sf-pill-red{` left all 930 green), the two-plant mutation
// matrix proving each pin's OWN discriminator: the variant-shape plant
// trips exactly the widened dupe check, the unparseable-form plant trips
// exactly the reconciliation pin)
// (re-anchored S96: +7 — the AW1 @utility-block uniqueness pin in
// hue-tokens [the completeness form: EVERY @utility header in globals.css
// exactly once — the duplicate-later-block blind spot demonstrated live
// (a planted later sf-pill-red block with orange content left all 923
// green), mutation-proven (the plant tripped EXACTLY the new pin with the
// leg-2 contract pins green — they read the first occurrence, which is
// the point)] + the AW2 resweep-gate seam tests/resweep-gate.test.ts
// [+6 legs: 0 ONLY on ok AND probeCleanup "ok" — the pure seam the s96
// resweep re-tag imports; RED-first, mutation-proven at the seam, live
// wiring-proofed (planted in-try throw → exit 1 observed, green → 0)] —
// the plan projected +1/+1, the reality +1/+6, owned in the execution
// record per the AT precedent)
// (re-anchored S95: census UNCHANGED — the AV1 uniqueness-guard completion
// modifies the S93/AT2 pin IN-PLACE [the AR1 boundary-pin precedent]: the
// duplicate-later-definition guard's loop now covers the union of every
// first-occurrence-read record — FAMILY_STEPS + AU_STEPS — after the s94
// audit's L1 found the amber-200/800 steps outside the guard's kill set;
// the blind spot demonstrated live [a planted later duplicate left all
// 923 green], mutation-proven [the plant then tripped EXACTLY the extended
// pin with the leg-5 palette pin green — it reads the first occurrence])
// — the S94 +2 beneath:
// (re-anchored S94: +2 — the AU1 leg-5 pair in hue-tokens [the connectivity
// banner's amber-200/amber-800 @theme pins — the LAST unpinned steps of
// the amber family, the trap-10 drift liability the S14 offline banner
// rode; and the sf-connectivity-pill utility contract + the banner
// consumer — the residual register's first TREATED entry, the register
// updated in the same change]) — the S93 +5 beneath:
// (re-anchored S93: +5 — the palette-uniqueness pin [matchAll length
// exactly 1 per family step, the duplicate-later-definition mutant
// killed], the raw-family negative sweep + the residual-register
// anchoring [both directions machine-guarded], the files-tile dark-half
// pin + the dashboard-pill consumer pin [the two L2 orphan closures,
// RED-first], and the S51 dedupe-map completeness pin [the AP3
// source-scan precedent]; mutation-proven x3)
// (re-anchored S90: +the AQ1 third-leg pin in theme [the seven
// hand-maintained TOKENS lists must equal the ACCENT_TOKENS literals' OWN
// key insertion order — the exact order the boot script's VALUES generator
// rides; the AP3 pin's blind spot closed: a value-equal key reorder inside
// a literal kept both AP3 assertions green while the pre-paint script
// paired names with wrong values; MUTATION-PROVEN — the violet
// emptyTo/emptyFrom reorder turned EXACTLY the new pin RED with AP3 green,
// and the pin's own first run caught the primaryFg→foreground vocabulary
// exception live];
// re-anchored S89: +the AP3 boot-script sync pin in theme
// [the seven hand-maintained TOKENS lists must equal the accentCssVars key
// order and the Object.values length for every accent — the mechanical
// guard the insertion-order sync contract never had; MUTATION-PROVEN];
// re-anchored S88: +the three AO3 read-symmetry pins in group-members
// [a padded legacy row and a blank-padded legacy member normalize through
// the exported membersFromRow seam — the API GET boundary no longer ships
// legacy padded members verbatim; the s87 audit's Info 1, closed one layer
// deeper]; re-anchored S87: +the two AN4 read-side-trim pins in group-members
// [a padded member name/email returns trimmed through the seam — the
// AM1 write-side symmetry; the s87 audit's I4]; re-anchored S86: +the five AM1 members-boundary pins in validation
// [blank/padded member names and emails — the seam/server trim alignment;
// the s86 audit's L2]; re-anchored S85: +group-members [the S85/AL1 members seam — the API
// ships an ARRAY; the pre-seam JSON.parse-on-array "0 members" + wipe
// defect], +the wouldCreateCycle pins in folder-tree [S85/AL3 — the
// server PATCH guard's walk, unit-pinned; the guard-removal mutant WEDGES
// the runner], +the value-source pins in sent-keys-patch [S85/AL4 — the
// source-substitution mutant failed exactly the two new pins];
// re-anchored S79; S80/AG12 fixed the stale "834" header — AGENTS.md/
// CLAUDE.md/README stay the authoritative count keepers): router, theme,
// theme-cache, date, calculator, auth, validation, db-path,
// site, api-timeout, api-offline, files (content-disposition),
// rum-diagnostics, data-export, data-import, env-check, view-collections,
// dep-audit (the S30 bun-audit parser/classifier seam), dev-preflight
// (the S31 dev-server boot-stability classifier seam), suite-verdict
// (the S32 standing-suite verdict seam — the anti-phantom shape guard —
// extended in S33 with the mobile-sweep classifier pins: the light-mode
// 390×844 drawer-navigation sweep; extended in S34 with the midband-sweep
// classifier pins: the light-mode 768×1024 drawer-navigation sweep at the
// md breakpoint, the 391–1023px band's representative width, with the
// chrome vehicle-contract class; extended in S35 with the landscape-sweep
// classifier pins: the light-mode 844×390 phone-landscape drawer-navigation
// sweep — the HEIGHT axis the standing surface never varied — with the
// per-view heading-clearance key and the drawerNavScrollable short-viewport
// contract class; extended in S36 with the dark-mobile-sweep classifier
// pins: the dark-mode 390×844 drawer-navigation sweep — the MODE axis at
// the mobile viewport the standing surface never varied — with the
// per-view flashbulbs/unreadable detector keys, the drawer dark record,
// and the INDEPENDENT dark-detection counting [a non-empty detector array
// with an empty findings array still reads non-green]; extended in S37
// with the accent-light-sweep classifier pins: the ACCENT axis in LIGHT
// mode — the theme dimension the standing surface never varies in light
// [the accent-dark-sweep varies the accent ONLY in dark; every light pin
// rides the default violet] — with the ALL-ACCENTS guard [a missing
// accent key is a shape-error, never green-by-omission], the per-accent
// applied self-verification, the per-view contrast detector keys
// [unreadable / lowcontrast — the flashbulb class does not apply on the
// light canvas], the drawer record per accent, and the three
// signature-strict non-gap exemptions [the CTA-face, the calendar
// adjacent-month days, and the yellow priority-pill vocabulary];
// extended in S38 with the accent-dark-sweep classifier rebuild pins: the
// accent × dark MOBILE 20-view matrix [the pre-S38 mobile pass swept only
// 6 views — MOBILE_VIEWS — and 14 views had never been rendered in dark ×
// accent at the stacked mobile layout by any standing audit] — with the
// ALL-ACCENTS guard on both surfaces + the applied map, the ALL-VIEWS
// guard [the omission-means-clean recording RETIRED — every view recorded
// explicitly, clean views carry empty detector arrays], the drawer-present
// guard with the drawer-open failure counted as a FINDING, the mode rot
// guard [mode MUST be dark — the INVERSE of accent-light's], the
// mobileViewport 390×844 contract, the per-accent applied
// self-verification, and the mobile scrollWidth overflow class].
// Extended in S50 with the accent-dark-landscape-seed-sweep classifier
// pins: the dark × landscape × SEED sweep for the 13 volume-invariant
// views — the views that render no task/note/event rows had never been
// rendered in dark at 844×390 under any accent (the S46 plan's carried
// note + the S49 plan's own non-gap entry) — with the mode rot guard
// [mode MUST be dark — the light half at seed is the S40 audit's own], the
// 13-view ALL-VIEWS guard, the drawer 20-link census, and the dark detector
// family [flashbulbs always findings; the CTA-face exemption ONLY]. Extended in
// S51 with the cwv-volume-stress classifier pins: the CWV x volume stress —
// the RUM-beacon cross-axis (the beacon's five field metrics under the
// COUNT-verified 300/200/250 profile on the 7 volume-affected views at
// 390x844 under the Lighthouse throttle against the standalone build) —
// with the volume-EXACT + throttle + ALL-VIEWS guards, the LCP <= 4400
// parity anchor (the reference's own seed dashboard measures 4416-4432ms
// under the same preset) / CLS <= 0.1 / FCP <= 1500 / TTFB <= 500 /
// longTaskTotal <= 2400 budget families with boundary-exact pins (re-anchored
// S91/AR1: the documented same-tree band 1821–2288ms made the 2000 pin a coin
// flip — the S51 LCP class; the boundary pin now reads 2400/2401), and the
// INP proxy <= 3000 budget. S92/AS4 added the live-tally dedupe pin (a
// script-side S51-* finding matching a recomputed breach counts once).
// S92/AS1 added tests/hue-tokens.test.ts (+3: the pill/alert palette
// contract, the utility contract, the consumer sweep).
// Browser/E2E coverage lives in tests/e2e/*.spec.ts (Playwright — never
// picked up by this config, which matches *.test.ts only; the standalone
// server is booted by playwright.config.ts's webServer).
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts", "tests/**/*.test.ts"],
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
});
