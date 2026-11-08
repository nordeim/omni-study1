#!/usr/bin/env bash
# (S161/DJ re-tag — census 619 → 623, net +4: chunk 2 +3 [the S161/DJ1
# notes tag-failure toast pin + the S161/DJ2 timetable band hand-guard pin
# in parity-session7 — network-mocked, no server writes; the S161/DJ4
# dark-edge accent leg in theme-system — the CJ3 sweep's dark sibling:
# blue + dark, the notes selected-row border computes blue-800, the
# pre-fix violet-900]; chunk 3 +1 [the S161/DJ5 slider rollback resync
# pageerror-free pin in resilience — the PATCH AND the resync GET abort,
# the keyboard-committed drag, ONE toast + ZERO pageerrors]. The full DJ
# map: docs/remediation-plan-session161.md.)
# (S160/DI re-tag — census 616 → 619, net +3: chunk 1 +2 [the S160/DI5
# CB8 twins in parity-session8 — the solver + flashcards refresh-failure
# soft-toast pins, the chat leg's unpinned siblings, network-mocked, no
# LLM/no budget]; chunk 3 +1 [the S160/DI6 generate-cards pre-LLM wire
# boundary in resilience — anon 401 + count-bound 400 + the foreign-deck
# 404 on ONE fresh TEST-NET user (probe IP 192.0.2.139, the file's per-IP
# total 4/10, registerGlobal 4/40)]. The full DI map:
# docs/remediation-plan-session160.md.)
# (S154/DC re-tag — census 616 UNCHANGED: no new e2e legs by design, the
# CV1 runtime-split precedent. The S154/DC1 no-op update elision is
# wire-invisible by construction (the elided rows count in `updated`, so
# the s23 idempotent re-import pin's created=0/updated=3 holds with all
# three writes elided — that pin IS the elision's behavioral leg, and it
# rides chunk 5's cold boot in this very map; the CL1 equal-times
# round-trip leg rides chunk 3). The cycle's proof instead rides the
# unit layer: the plannedUpdateIsNoOp trio + the DC4 write-only
# negative census + the DC1 elision census in script-conventions. The
# import family's doc reconciliation (ADR-021 + AGENTS.md) carries no
# count change.)
# (S153/DB re-tag — census 614 → 616, net +2: chunk 1 +2 [the S153/DB1
# success-loop trip pin (parity-session8's new TERMINAL describe — the
# capped-discharge wire proof: a throwaway's correct-credential login
# loop self-calibrates to the loginGlobal: 429 within M+D = 60 admits,
# RED pre-fix where the loop never tripped) + the S153/DB2 export-page
# budget pin (navigation.spec.ts — the B-L2-audit close: a throwaway's
# 11th /export view renders the honest amber alert, the first 10 the
# panel; the pin's FIRST home was s21-data-export [chunk 5] but the
# chunk-5 registerGlobal: budget MEASURED 40/40 exactly [37 by
# self-calibrating probe + s26's 3], the pin's throwaway register made
# s26's re-issue the 41st → a codeless 429 → the verify's uniform 400,
# root-caused by trace — the pin relocated to chunk 1 where the
# register arithmetic has 38 of headroom, the CK1 budget-driven
# pin-home doctrine]). The unit census 1578 → 1582 (+4: the auth cap
# pair + the script-conventions census pair) rides the vitest header
# re-anchor.)
# (S146/CU re-tag — census 612 → 614, net +2: chunk 2 +2 [the S146/CU1
# multipart-mime pair in s14-hardening — the derivation tripwire (a
# hostile 150-char DECLARED part Content-Type on a .txt upload stores the
# EXTENSION-derived "text/plain;charset=utf-8" under the e2e runtime's
# Bun parse — pinning the runtime split: the declared part type only
# reaches the write on the Node-parse path, where the new route guard
# 400s it with the length copy; the guard's behavioral RED→GREEN evidence
# rode the dev-daemon probe — the shipped Bun postures derive the mime
# from the filename extension and are structurally bounded) + the clean
# .pdf round-trip (the registry mime echo + the list rendering; the guard
# never over-fires)]. The unit census 1503 → 1513 (+10: the CU1
# admission-set quintet in files.test + the CU1/CU2/CU3 census quintet
# in script-conventions) rides the vitest header re-anchor.)
# (S145/CT re-tag — census 609 → 612, net +3: chunk 3 +2 [the S145/CT1
# focus-timer completion-window pair in resilience — the fake-clock-driven
# phantom/double-log leg (a Play press through the in-flight save + the
# failed save: exactly ONE POST, the Start button disabled through the
# window, the failure re-latches the clock to a fresh 25:00, the retry
# runs a real session with no new POST) + the settle-CAS leg (a
# late-settling save must not clobber a newer Long-Break pick; both ride
# the route-intercepted /api/focus-sessions — no server writes, no
# cleanup, no budget)]; chunk 5 +1 [the S145/CT3 gradient-CTA leg in
# s21-data-export — the Download JSON anchor + the Import button compute
# linear-gradient backgrounds (the house primary-CTA convention; the
# codebase's only two solid-accent CTAs, on the /export owner surface,
# now ride .sf-gradient + .sf-gradient-shadow)]. The S145/CT4 recount
# rides the same edit: s23's demo import budget is 10/10 ZERO HEADROOM
# (9 fixture POSTs + the census-invisible in-app panel-journey POST —
# the S144 header undercounted it as 9), resilience carries 9/10 (8
# fixture + 1 demo.request — the S144 cross-reference said 5); the
# script-conventions CT4 census leg machine-pins both counts. The unit
# census 1500 → 1503 (+3: the CT1/CT2/CT4 source-census legs) rides the
# vitest header re-anchor.)
# (S144/CS re-tag — census 606 → 609, net +3: chunk 3 +2 [the S144/CS1
# appearance-picker sequence-CAS leg — a route-intercepted late-failing
# preference PATCH must not roll back a NEWER accent pick, the ABA the
# per-render instantiation defect shipped (the fix is the React.useRef
# instance-scoped form; the interception isolates the DB — the PATCHes
# never reach the server, no cleanup, no write budget) + the S144/CS5
# row-cap 413 leg — 100,001 minimal folder rows answers the named 413
# (the parse-memory amplification bound; rides the demo session's import
# budget 4 → 5/10, the same budget shape as the BW11 byte-cap leg it
# mirrors)]; chunk 5 +1 [the S144/CS3 merge-guard wiring leg in
# s23-import — a single-leg inverted grade row against a stored partner
# answers the named 400 with the row unchanged; green-on-arrival by
# design (the missing-pin class, the S137/CL9 precedent — the wiring was
# verified correct by direct read; the finding was the ABSENCE of
# pins); rides the demo import budget 8 → 9/10, the header recount
# re-anchored]. The unit census 1490 → 1500 (+10) rides the vitest
# header re-anchor.)
# (S143/CR re-tag — census 606 → 606, net +0: no new e2e tests this cycle;
# the S143 pins re-anchored EXISTING legs in place — the CQ3 mover locator
# in parity-session7 is now the NAMED combobox form (getByRole("combobox",
# { name: "Move note to notebook" }) — the assertion fails if the mover's
# accessible name regresses, pinning the CR3 aria-label behaviorally). The
# chunk-3 cert run observed the DOCUMENTED BU1/P1008 environmental flake
# class (the files-view Rename-prefill leg — the same leg the S142 cycle
# recorded; no parallel suites ran this time, the pure machine-load class,
# co-occurring with SQLite socket timeouts in the WebServer log) — the
# contention-free cold re-run was 87/87 first-pass.)
# (S142/CQ re-tag — census 605 → 606, net +1: chunk 2 +1 [the CQ3
# notebook-mover keyboard-reachability leg in parity-session7 — the
# note-actions surface is a Popover now (the BZ3-pattern conversion), and
# the leg pins the mover Select as the FIRST TAB STOP + the keyboard-only
# open→focus→commit→PATCH path; the AH1 delete leg re-anchored to the new
# button role in the same file]. The chunk-3 cert runs observed the P1008
# socket-timeout flake class UNDER SELF-INFLICTED CONTENTION (the unit
# suite ran in a parallel tool call during the cert — 2 failed, then 1
# failed on the re-run, the BU1 files-view leg both times, passing 2.5s in
# isolation); the contention-free re-run was 87/87 first-pass — run the
# cert ALONE, the documented machine-load class.)
# (S141/CP re-tag — census 605 → 605, net +0: no new e2e tests this cycle;
# the S141 pins EXTENDED existing legs in place — the parity-session9
# render-gate leg now intercepts a SECOND attacker origin (the planted
# corpus grew div/section-WRAPPED payloads — the S140 fixture carried only
# top-level hostile elements, exactly the shape the gate already handled)
# and asserts the wrapped img dies by name; the s21-data-export legs assert
# the X-Export-Bytes header against the actual body size and the /export
# panel's size line + absent over-cap warning. The chunk-2 cert run
# observed the P1008 sandbox I/O-stall flake class (one test, different on
# each run, co-occurring with SQLite socket timeouts) — re-run clean
# 186/186; the documented machine-load class.)
# (S140/CO re-tag — census 603 → 605, net +2: chunk 2 +1 [the S140/CO1
# legacy hostile-note render-gate leg in parity-session9 — the planted
# pre-fix row opens in the Notes view with route interception on the
# attacker origin: zero outbound requests, no live remote img/iframe in
# the editor DOM, the benign text preserved]; chunk 5 +1 [the S140/CO1
# import-door sanitize leg in s23-import — a hostile note imports 200 and
# reads back stripped: no remote img src, no script, no handler, the
# round-trip contract untouched; rides the demo session at import budget
# 9/10 — the chunk-5 register census has zero headroom, so no fresh user].)
# (S132/CG re-tag — census 570 → 575, net +5: chunk 1 +2 [the two CG7
# modified-click legs in navigation — a synthetic ctrl-click on the
# section-action View All CTA and on the Start My Day hero CTA never fires
# the SPA navigation, the CA7 guard mirrored on the dashboard CTAs]; chunk
# 3 +2 [the CG5 boot data-failure bar leg in resilience — every /api/* but
# /api/auth/me aborts, the shell commits, the amber role=alert bar
# surfaces, Retry heals it; and the CG6 Settings loading-gate leg — a held
# /api/subjects renders the Subjects tab spinner, never the false
# "No subjects yet"]; chunk 5 +1 [the CG3 forgot per-email budget leg in
# auth-flows — a rotated-XFF flood on one email trips forgotAcct: the 6th
# ask 429s with the honest copy, known and unknown emails
# identically]. The full CG map: docs/remediation-plan-session132.md.)
# (S133/CH re-tag — census 575 → 578, net +3: chunk 2 +1 [the S133/CH8
# blank-title e2e pin in tasks.spec], chunk 5 +2 [the S133/CH2 import-parity
# pin + the S133/CH7 counts-refresh pin in s23-import.spec — both on fresh
# TEST-NET users, the demo import budget untouched].)
# (S134/CI re-tag — census 578 → 584, net +6: chunk 1 +1 [the S134/CI5
# calculator-history loading-gate pin in navigation.spec], chunk 2 +1 [the
# S134/CI4 MyDay quick-add in-flight-guard pin in tasks.spec], chunk 5 +4
# [the S134/CI3 per-IP 429 quartet in auth-flows — login/register/forgot/
# reset, each on its own TEST-NET IP].)
# (S135/CJ re-tag — census 584 → 588, net +4: chunk 2 +2 [the S135/CJ1
# folders newest-500 window pin in s14-hardening + the S135/CJ3 accent-edge
# discriminator in theme-system], chunk 3 +2 [the S135/CJ4 missing-deckId
# named-400 + the S135/CJ5 wrong-typed-field 400 pins in resilience — the
# BY3 demo-session pattern; the first draft lived in s23 (chunk 5) with
# fresh TEST-NET registrations that pushed chunk 5's registerGlobal: 40
# census over the cap and 429'd s26's register — the pins ride the demo
# session now, account-independent 400s, chunk 3's demo import budget at
# 4/10]).
# (S136/CK re-tag — census 588 → 593, net +5: chunk 2 +1 [the S136/CK5
# KPI accent-gradient discriminator in theme-system — the inline-hex family:
# the first KPI icon block's computed gradient follows the accent switch,
# violet pair → blue pair, the categorical siblings stay fixed]; chunk 3 +3
# [the S136/CK1 rotated-XFF login flood pin in s16-perf-parity — the
# loginGlobal: containment budget proven at the wire, the first 429 at
# global POST 40-or-41; the pin is TERMINAL by design (s16 is the chunk's
# alphabetically-last file, the describe its last test — the spent global
# bucket cannot be cleaned from the wire, so nothing after it may need a
# login; the CLEAN-SLATE pre-reset zeroes the bucket first) +2 the
# S136/CK4 CE3 residual gate legs in resilience — the held
# assignments/exams dashboard section-card gate + the held grades
# gradetracker summary gate, the CG6 idiom at the sites the CG6 sweep
# missed]; chunk 5 +1 [the S136/CK3 session-cookie SET-path leg in
# auth.spec — context.cookies asserts httpOnly + SameSite=Lax + Path=/ on
# a real UI login]. The full CK map: docs/remediation-plan-session136.md.)
# (S137/CL re-tag — census 593 → 596, net +3: chunk 3 +2 [the S137/CL1
# timetable equal-times round-trip leg + the S137/CL7 analytics OR-form
# held-route gate, both in resilience — the CL1 leg rides the demo
# session's request (chunk 3's demo import budget 4 → 5/10; no fresh
# registrations, chunk 5's register census untouched; both sit MID-file —
# resilience is alphabetically before s16-perf-parity, so the S136/CK1
# flood pin stays TERMINAL); the BW11 import-cap 413 leg re-tagged in
# place to the 64 MiB boundary]; chunk 4 +1 [the S137/CL9 cross-user
# ITEM-isolation leg in s17-fresh-user — a fresh user's task PATCHed and
# DELETEd from the demo context answers 404 both ways, the factory's
# ownership-in-the-where-clause invariant finally wire-pinned; a coverage
# pin landing GREEN on the pre-fix tree (the CK3 designed expectation —
# the finding was the missing pin, not a defect)]. The full CL map:
# docs/remediation-plan-session137.md.)
# (S138/CM re-tag — census 596 → 597, net +1: chunk 3 +1 [the S138/CM2
# dashboard KPI OR-form held-route leg in resilience — holding ONLY
# /api/focus-sessions while the other four dashboard families resolve:
# the mixed-landing state where the pre-fix AND-form (tasks alone) let
# the Focus Time card render its false "0h" — the S137/CL7 OR-form
# doctrine extended to the KPI row; MID-file, the CK1 flood pin stays
# TERMINAL in s16 (the chunk's alphabetically-last file); rides the demo
# session, no registrations, no import budget]. The full CM map:
# docs/remediation-plan-session138.md.)
# (S139/CN re-tag — census 597 → 603, net +6: chunk 2 +1 [the S139/CN2
# export→import round-trip witness in s14-hardening — the demo's own GET
# /api/export/data POSTed back verbatim, created: 0 — the family's
# headline promise finally exercised; RELOCATED out of chunk 3's
# resilience (the first draft's export GET 429'd behind S124/BY5's
# deliberately-spent demo export budget mid-chunk — the S135/CJ
# relocation class) to chunk 2 where both budgets run free (import
# 6/10, export 1/10)]; chunk 3 +5 [the S139/CN2 empty-envelope +
# folders-true-index tolerance legs + the CN2 cross-account 409 + the
# CN4 card-delegate foreign-id 404s + the CN10 owned-FK PATCH re-point
# 404 — the last three on ONE fresh TEST-NET user2 each (probe IP
# 192.0.2.139, 3/10 per-IP, 3/40 registerGlobal), the demo import
# budget at 8/10; END-of-file, the CK1 flood pin stays TERMINAL in
# s16]. The full CN map: docs/remediation-plan-session139.md.)
# Expected: 154 + 192 + 93 + 95 + 89 = 623 (each chunk's count includes its
# auth setup — the current census; the historical re-tag blocks beneath.)
# (S131/CF re-tag — census 567 → 570, net +3: chunk 1 +1 [the CF9
# drawer focus-restore leg in mobile-navigation — crossing the lg
# breakpoint hands focus to the desktop chrome, never <body>]; chunk 4 +1
# [the CF11 login-card hairline dark-pair leg in dark-mode — the strip
# re-themes under dark-OS]; chunk 5 +1 [the CF8 resend-429-honesty leg in
# auth-flows — a budget-exhausted Resend surfaces the 429 copy, never the
# success line]. The full CF map: docs/remediation-plan-session131.md.)
# Expected: 147 + 179 + 72 + 94 + 78 = 570 (each chunk's count includes its
# auth setup — the current census; the historical re-tag blocks beneath.)
# (S129/CD re-tag — census 560 → 563, net +3: chunk 1 +1 [the CD2 boot-gate
# stall leg in navigation — all five Dashboard pre-warm keys held forever,
# the Splash still mounted at 5 s, the shell committed by 35 s under the
# 20 s COLLECTION_GET_TIMEOUT_MS]; chunk 2 +1 [the CD1 overlay-animation
# parity leg in theme-system — the Add Task dialog's overlay AND content
# compute animation-name enter / 0.15s, the reference-measured values];
# chunk 5 +1 [the CD6a bare-/reset-password default leg in auth-flows —
# the route renders the missing-token explanation, not the sign-in form].
# The full CD map: docs/remediation-plan-session129.md.)
# Expected: 145 + 178 + 72 + 93 + 75 = 563 (each chunk's count includes its
# auth setup — the current census; the historical re-tag blocks beneath.)
# (S128/CC re-tag — census 559 → 560, net +1: chunk 5 +1 [the CC1
# displayName-bearing envelope pin in s23-import — a spliced displayName
# in the user block restores 200 (the whitelist keeps name-shaped identity
# off the profile patch) with the preferences still applying, on a FRESH
# TEST-NET user per the BT1 convention; the demo import budget stays at
# its documented 9/10]. ALSO S128/CC2: this runner now PROPAGATES a failing
# chunk's exit code (rc accumulation + exit "$rc" — the pre-CC2 loop
# discarded every chunk pipeline's status and the trailing echo returned 0
# unconditionally: a cert script that cannot fail is the resweep-gate trap
# class reborn at the cert layer; pinned by tests/script-conventions.test.ts)
# and the header census is machine-enforced against the same pin.)
# (S127/CB re-tag — census 538 → 559, net +21: chunk 1 +3 [the CB1
# clock-accelerated focus-completion pin in parity-session5 was chunk 3;
# chunk 1's +3 are the CB8 AI-refresh pins in parity-session8]; chunk 2 +16
# [the CB5 calendar category-dot family in parity-session6 + the CB4
# weighted-mean re-anchor + CB6 timetable 14-row pin in parity-session7 +
# the CB2 assignment TZ round-trip + CB9 worksheet pins in parity-session9
# + the CB16 toggle-chain pin in tasks + the CB3/CB7/CB20 pins in
# s14-hardening]; chunk 3 +1 [the CB1 focus-timer pin]; chunk 4 +0; chunk 5
# +1 [the CB12 login per-account lockout pin in auth-flows]. The full CB
# map: docs/remediation-plan-session127.md.)
# Expected: 144 + 177 + 72 + 93 + 74 = 560 (each chunk's count includes its
# auth setup — the current census; the historical re-tag blocks beneath.)
# (S125/BZ re-tag — census 523 → 529, net +6: chunk 1 +2 [parity-session8
# +2: the BZ3 manage-notebooks popover keyboard pin (the content renders
# role=dialog with NO menuitem, Tab reaches the action buttons, Escape
# closes) and the BZ4 duplicate-member pin (a fresh group with two
# IDENTICAL members — removing one keeps the sibling; RED pre-fix: the
# email filter removed both)]; chunk 2 +4 [parity-session7 +1 the BZ1
# Add-Card-on-the-auto-selected-deck pin (the effectiveDeckId guard fix;
# the locator rides .first() — the seed's same-millisecond createdAt ties
# make decks[0] random, and the 0-card Spanish Vocabulary renders a
# second exact-name "Add Card" CTA when it wins the tie); s14-hardening +3
# the BZ6 grade-guard wire pin (the inverted create pair 400s, the
# single-leg PATCH legs guard against the stored row), the BZ8 files/link
# response-shape pin (no data key), and the BZ5 write-budget exhaustion
# pin (a FRESH REGISTERED user's budget — the demo user is never mutated:
# playwright's alphabetical file order runs s14 BEFORE tasks.spec, so the
# first design's demo-budget exhaustion 429'd every later chunk create —
# six collateral tasks.spec failures, the mid-flight-collision class;
# the fresh-user rewrite rides the s25 TEST-NET register convention)])
# (S126/CA re-tag — census 529 → 538, net +9: chunk 1 +3 [the CA4 auth
# view-transition focus pin + the CA9 Google-helper-text pin, both in
# parity-session8, + the CA7 nav modified-click pin in navigation]; chunk 2
# +4 [the CA1 AI-transcript newest-window pin + the CA5 factory-list
# newest-window pin, both via 505-row imports on FRESH TEST-NET users — the
# BZ5 lesson, the demo user is never mutated — + the CA2 import empty-id/
# null-collection 400 pin + the CA8 placeholder AA regression guard, both in
# s14-hardening]; chunk 4 +1 [the CA3 mobile print-chrome pin in
# accessibility — the print family's missing MOBILE-viewport leg: the fixed
# lg:hidden app bar printed at portrait paper width where the lg: query
# stops applying]; chunk 5 +1 [the CA11 reset missing-token pin in
# auth-flows]. ALSO S126/CA6: the seed's mislabeled deck cards re-mapped —
# six study pins re-anchored IN-PLACE to the honest remediated counts
# [Integration rules 1 card, Biology 3, Spanish 2] + explicit distinct deck
# createdAt values make decks[0] deterministic — the S125 lesson-3 flake
# class dead at the root.)
# Expected: 142 + 161 + 71 + 93 + 71 = 538 (each chunk's count includes its
# Session-89 cold e2e certification — the 5-chunk map, final post-Batch-BT
# (census 478 → 488: s119/BT +10 [chunk 1 +1 the BT10 notes manage-notebooks
# placement pin; chunk 2 +1 the BT9 timetable edit-button accessible-name
# pin; chunk 3 +2 the BT6 composer pins (the reference-measured 2-row
# textarea geometry + the Shift+Enter-newline/Enter-send behavior) and +1
# the BT11 failed-title-PATCH streak toast; chunk 4 +2 the BT7 history
# panel Escape/focus-lifecycle pin + the BT12 history-save toast split;
# chunk 5 +2 the BT1 import-perimeter pins (the text/plain Content-Type
# gate + the javascript: files-row guard, on a fresh TEST-NET user) and +1
# the BT3 concurrent reset-token replay pair {200, 400}] — all on fresh
# TEST-NET or held-route budgets where they touch limited routes)
# (census 476 → 478: s118/BS +2 [the BS4 drawer modal focus-lifecycle pin in
# chunk 1 — focus moves to the close button on open, Tab wraps the dialog's
# focusables, focus restores to the hamburger on close; the BS2 readJson-cap
# pin in chunk 5 — an oversized JSON body is rejected before the route reads];
# BS1 rides the reset-journey spec IN-PLACE [the journey's captured pre-reset
# cookie replays to 401 after the reset]. This re-tag also repairs the S117/BR
# delta that was never re-tagged here: 474 → 476, both chunk 5 [the s23 cards
# round-trip pin + the auth-flows verify-429 pin]. The S94/AU map beneath:)
# (census 470 → 474: s14-hardening +1 [the S94/AU1 A0c pin — the offline
# banner's light amber pair computes the pinned v3 hexes; trap-10 closed,
# the RED demonstrated live against the pre-change build — the unpinned
# amber-200 border serialized lab(91.7203…)] and dark-mode +3 [the
# S94/AU3 pins: AU3a the banner's dark amber pair incl. the
# raw-rgb()/0.6 border serialization, AU3b the RUM panel error alert's
# dark pair, AU3c the events dialog error banner's sf-alert-red dark
# pair]. The S89-era map beneath: [the header tag was stale at
# post-Batch-AP through the S90–S93 cycles — the parallel AT session
# updated only the Expected line it needed; re-tagged here honestly])
# (census 469 → 470: parity-session7 +1 [the S89/AP1 partial-empty zombie pin:
# the same rate-refresh external-deletion window as AO4 but a 2-of-3
# deletion — the surviving set is non-empty while the advanced study index
# runs past it; the unlatch condition now reads !studyCard, subsuming the
# all-gone case and the partial deletion. The AP2 s22-boot-guard change
# modifies the negative spawn IN-PLACE (the explicit-empty AUTH_SECRET —
# environment immunity against a real-secret workspace .env leaking
# through Next's standalone auto-load); census unchanged for it. The
# S88 map beneath:])
# (census 468 → 469: parity-session7 +1 [the S88/AO4 study-zombie pin: the
# deterministic external-deletion window drives the exact s80 L1 — mid-study
# the deck's cards empty through rate's own PATCH→GET refresh carrying a
# deletion between its legs; the empty deck's guard fall-through renders;
# a UI refill must NOT resurrect the latched study session — the pin was
# RED on the pre-fix build at the designed discriminator (the card grid
# never returns) and GREEN after the render-phase structural kill]. The
# S87/AO2 wraps modify four stamped pins IN-PLACE (AH8c + AI1a/b/c — the
# try/finally cleanup the AN1/AM5 convention established; dev-iterate
# hygiene only, cold-cert immune). The S87 map beneath:)
# (census UNCHANGED at 468: the S87/AN1 change modified the AM1 pin in-place
# [the stamped-row cleanup — the id rides the evaluate's return, the finally
# deletes it on the failing path; the AM5 convention applied to the pin AM5
# itself shipped], and the AN4 read-side-trim change is unit-pinned only
# [group-members +2 — the seam is pure]. The S86 map beneath:)
# (census: 30 spec files exactly once; the S86 addition rides in-place —
# parity-session8 +1 [the AM1 members-boundary API pin: a blank member
# name is rejected at the API — the seam/server trim alignment, the s86
# audit's L2]; the S85 additions beneath —
# parity-session8 +3 [the AL1 members family: seeded members render,
# add-member preserves, edit-save preserves] and accessibility +1 [the AL2
# Study Groups member avatar chip print pin]; the S84 map beneath: resilience
# 12 tests [the AJ1 folder pin + the AK1 guard family] and accessibility 84
# [the AJ5 print family + AJ6 focus pin + the AK2 print-enumeration closure
# + the AL2 chip]).
# (S120/BU re-tag — census 488 → 497, net +9: chunk 1 +2 [the BU7 dashboard
# badge family pin in navigation + the BU9 Add Exam Cancel pin in
# parity-session8; the S8-B exam-row badge pin re-anchored IN-PLACE to the
# slate far family]; chunk 2 +3 [the BU9 Add Class + Add Assignment Cancel
# pins in parity-session9 + the BU16 security-headers pin in s14-hardening;
# the AC7 exams-view urgency pin re-anchored IN-PLACE to the blue family];
# chunk 3 +1 [the BU1 rename-prefill pin in resilience]; chunk 4 +1 [the
# BU13 expiry aria-live pin in s17-fresh-user; the overdue-badge red-700
# pin re-anchored IN-PLACE to the self-owned-data shape]; chunk 5 +2 [the
# BU14 register uniform-200 pin in auth-flows + the BU4 RUM user-scoping
# pin in s18-rum; the S15 reset-success pin re-anchored IN-PLACE to the
# role=status channel].)
# (S123/BX re-tag — census 508 → 516, net +8: chunk 1 +1 [the BX3
# exam-edit round-trip wiring pin in parity-session8 — create at 14:30,
# the edit dialog shows 14:30 (the local wall-clock, never the UTC
# slice), cancel, API cleanup]; chunk 2 +3 [the BX1 timetable edit-form
# normalize pin in parity-session9 — the seeded legacy row opens at
# "09:00", never a blank input + the BX9 assignments progress string-
# state pin — a cleared field reads "", never the "0" snap-back + the
# BX8 deck-row highlight pin in parity-session7 — deleting the selected
# deck highlights decks[0], API-created probe decks, zero seeded
# residue]; chunk 3 +3 [the BX1 both-legs ordering wire pin + the BX5
# folder parentId clear-to-root wire pin, both in resilience + the BX6
# focus-elapsed pin in parity-session5 — an early manual complete records
# <1500s, never the nominal 25:00, with the trailing DELETE cleanup];
# chunk 5 +1 [the BX2 per-account OTP cap pin in auth-flows — after 10
# wrong codes the CORRECT code also fails (the uniform 400 lockout), one
# more TEST-NET register/verify pair on 192.0.2.123].)
# (S124/BY re-tag — census 516 → 523, net +7: chunk 1 +1 [the BY10
# popstate drawer-close pin in mobile-navigation — Back with the drawer
# open closes it and follows the URL]; chunk 2 +2 [the BY1 gradeLevel
# clear round-trip + the BY9 avatar vocabulary wire pins, both in
# s14-hardening on the shared demo session with finally-restores]; chunk
# 3 +2 [the BY3 between-caps import acceptance — a valid ~12 MiB envelope
# (the padding in the IGNORED user block) imports + the BY5 export-family
# limiter — 10 GETs then the 11th 429s and rum/export shares the family
# key — both in resilience; the BW11 import over-cap pin re-anchored
# IN-PLACE to 25 MiB + the MiB copy leg]; chunk 4 +2 [the BY8
# checked-checkbox print-exact pin + the BY13 forced-colors Appearance
# picker pin, both in accessibility].)
# Expected: 137 + 153 + 71 + 92 + 70 = 523 (each chunk's count includes its
# auth setup. The S123/BX map beneath:)
# (S122/BW re-tag — census 502 → 508, net +6: chunk 2 +1 [the BW3
# debounced-title pin in parity-session7 — char-by-char typing fires ≤2
# PATCHes, never one per keystroke, the final title persisted]; chunk 3 +4
# [the BW2 solver-persistence pin in parity-session5 — a REAL solve through
# /api/math/solve populates the Recent Problems card (surface:"solver"
# rows, the reference's measured zero-state hide + populated anatomy),
# with the trailing DELETE cleanup — + the two BW11 413 wire pins in
# resilience (the files 2 MiB multipart over-cap + the import 10 MiB
# over-cap) + the BW7 timetable single-leg ordering wire pin]; chunk 5 +1
# [the BW9 OTP paste-distribution pin in auth-flows — a synthetic
# clipboard paste fills all six boxes and verifies, one more loopback
# register: 7 of the 10/IP budget].)
# (the S121/BV map beneath:)
# (S121/BV re-tag — census 497 → 502, net +5: chunk 2 +2 [the BV7 owned-FK
# guard pins in tasks.spec — a foreign/nonexistent subjectId AND listId both
# answer the actionable 404 "That X does not exist." on the shared demo
# session]; chunk 3 +1 [the BV1 wire-level events ordering pin in resilience
# — the single-leg inversion PATCH against the stored row, both directions +
# the legal move, finally-cleanup]; chunk 5 +2 [the BV6 re-register password
# pin in auth-flows — the newly typed password signs in, the first 401s, on
# a fresh TEST-NET IP — + the BV11a concurrent verify-code replay pair
# asserting exactly {200, 400}, the BT3 shape on the OTP family].)
# Expected: 135 + 147 + 62 + 90 + 68 = 502 (each chunk's count includes its
# auth setup; 487 real specs = the S82 443 + the seven S83 pins + the eight
# S84 pins + the four S85 pins + the one S86 pin + the one S88 pin + the one
# S89 pin + the four S94 pins [A0c + AU3a/b/c] + the two S117/BR pins [the
# s23 cards round-trip + the verify-429] + the two S118/BS pins [BS4 drawer
# focus in chunk 1 + BS2 oversized-body in chunk 5] + the ten S119/BT pins
# [BT10 notes placement, BT9 timetable name, BT6 composer ×2, BT11 title
# toast, BT7 calc panel, BT12 calc toast split, BT1 import gate + guard,
# BT3 reset replay pair] + the nine S120/BU pins [BU7 dashboard badges,
# BU9 exam Cancel, BU9 class + assignment Cancel ×2, BU16 headers, BU1
# rename prefill, BU13 expiry aria-live, BU14 register 200, BU4 RUM
# user-scoping] + the five S121/BV pins [BV7 owned-FK ×2, BV1 the events
# wire-level ordering, BV6 the re-register password, BV11a the concurrent
# verify pair] — S95/AV4a, the s94
# audit's L3: the AU re-tag updated the sum but left the 470-era "465" stale;
# the S118 re-tag repaired the same class for the 474-era sum the S117 cycle
# left behind).
# Per-chunk: fresh
# db/e2e.db + stale-server kill (fresh in-memory limiter, register budget
# stays <= 9/10 per chunk).
# (S84/AK3 header correction, the audit's L1: the S83 header said
# "resilience 8→9" and "444 + six S83 pins" — the empirical counts were
# 7→8 and 443+7=450; corrected here so the census stays re-derivable.)
set -uo pipefail
cd "$(dirname "$0")/.."

declare -a CHUNKS=(
  "tests/e2e/navigation.spec.ts tests/e2e/parity-session8.spec.ts tests/e2e/mobile-navigation.spec.ts"
  "tests/e2e/parity-session9.spec.ts tests/e2e/parity-session7.spec.ts tests/e2e/theme-system.spec.ts tests/e2e/parity-session6.spec.ts tests/e2e/a11y-sweep.spec.ts tests/e2e/tasks.spec.ts tests/e2e/s14-hardening.spec.ts"
  "tests/e2e/parity-session5.spec.ts tests/e2e/resilience.spec.ts tests/e2e/s16-perf-parity.spec.ts"
  "tests/e2e/accessibility.spec.ts tests/e2e/calculator.spec.ts tests/e2e/dark-mode.spec.ts tests/e2e/s17-fresh-user.spec.ts tests/e2e/s52-sidebar-collapse.spec.ts"
  "tests/e2e/auth.spec.ts tests/e2e/auth-flows.spec.ts tests/e2e/greeting-clock.spec.ts tests/e2e/s18-rum.spec.ts tests/e2e/s19-rum-panel.spec.ts tests/e2e/s20-rum-export.spec.ts tests/e2e/s21-data-export.spec.ts tests/e2e/s22-boot-guard.spec.ts tests/e2e/s23-import.spec.ts tests/e2e/s24-change-password.spec.ts tests/e2e/s25-delete-account.spec.ts tests/e2e/s26-change-email.spec.ts"
)

i=1
rc=0
for chunk in "${CHUNKS[@]}"; do
  # stale-server kill (AP-70/AP-95: kill by exact match, never blanket pkill).
  # S91/AR2 (the s90 audit's M1): the standalone server RETITLES its process
  # to `next-server (v1.x)` after boot, so the old command-line grep matched
  # NOTHING for an already-booted server (the S90 lesson 5's own incident) —
  # and in practice it was a BLANKET match that also killed unrelated
  # standalone servers (a parallel :3200 verification host). The listening-
  # port kill replaces it entirely: PID by the E2E port only, curl-verified
  # dead, SIGKILL escalation if the TERM did not land. A non-listening
  # leftover cannot wedge the cert (playwright reuses only a HEALTHY
  # listener; a bind race fails loudly with EADDRINUSE, never silently).
  # S92/AS6 (the s91 audit's I1+I3): the post-escalation re-check — a
  # STILL-answering listener aborts the chunk loudly BEFORE the db delete
  # (never remove db/e2e.db under a live listener). NOTE (I3): the kill
  # toolchain (`ss -tlnp` + `grep -oP`) is Linux/GNU-specific — on BSD/macOS
  # the extraction silently no-ops; run the cert on Linux.
  port="${E2E_PORT:-3100}"
  pids=$(ss -tlnp 2>/dev/null | grep ":${port} " | grep -oP 'pid=\K[0-9]+' | sort -u)
  for p in $pids; do kill "$p" 2>/dev/null; done
  sleep 1
  if curl -s -o /dev/null --max-time 2 "http://localhost:${port}/api/health"; then
    # still listening after SIGTERM — escalate to SIGKILL on the port's PID
    for p in $pids; do kill -9 "$p" 2>/dev/null; done
    sleep 1
    # S92/AS6: the post-escalation dead-check — a still-answering listener
    # is a hard abort (the §18 lesson-16 class), never a silent db delete.
    if curl -s -o /dev/null --max-time 2 "http://localhost:${port}/api/health"; then
      echo "FATAL: :${port} still answers after the SIGKILL escalation — refusing to delete db/e2e.db under a live listener; kill PID(s) ${pids} manually and re-run"
      exit 1
    fi
  fi
  rm -f db/e2e.db
  echo "=== CHUNK $i: $(echo $chunk | wc -w) files ==="
  # S128/CC2: accumulate the chunk pipeline's REAL exit status — the
  # pre-CC2 loop discarded it (a red chunk never failed the script; the
  # trailing echo returned 0 unconditionally). pipefail is set above, so
  # the pipeline's status is playwright's own even through grep/tail.
  bunx playwright test $chunk --reporter=list 2>&1 | grep -E "^ *[0-9]+ (passed|failed)|passed|failed" | tail -3
  rc=$((rc | PIPESTATUS[0]))
  i=$((i + 1))
done
echo "=== DONE — chunked certification complete ==="
exit "$rc"
