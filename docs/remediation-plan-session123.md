# Remediation Plan — Session 123 / Batch BX (Cycle 73)

**Status: COMPLETE** (executed TDD-style 2026-11-01 — the verification record is §5 below)
**Date:** 2026-11-01 · **Workspace:** refreshed clone at `d5e6130` (the Batch BW state
`728dbf5` + the operator's `docs/session_116.md` transcript) · **Audit-driven hardening
session** — the standing rhythm (audit the prior-batch diff, ride the riders, re-certify
cold).

---

## 0. Scope and Method

The operator directed the standing rhythm: refresh the workspace (`git pull` → `d5e6130`,
clean), re-read the full doc chain (`AGENTS.md`, `CLAUDE.md`, `README.md`, `PAD`,
`omni-study1_SKILL.md`, `docs/session_115.md`, `docs/remediation-plan-session122.md`,
`worklog.md`, `docs/session_116.md` — README/PAD + the SKILL doc digested via parallel
read-only subagents, AGENTS.md/CLAUDE.md read direct), re-validate against the codebase,
audit with the repo skills as rubrics (`skills/web-application/SKILL.md` §5/§6/§7/§16
the API surface, §8/§9/§12/§13 the frontend; `skills/` excluded from checking/testing/
compilation), iterate on visual + functional parity with `https://omni-study1.base44.app/`
(the mobile navigation menu the named focus, Tailwind v4 the named suspicion class), keep
the repo a production-ready functional SUPERSET, verify the `.env`/`db/` contract and the
vitest + playwright suites, plan remediation for everything found, execute with TDD (RED →
GREEN), capture evidence, update the docs chain, and commit + push to `main` via the SSH
wrapper.

Method (the six-phase workflow): ANALYZE → PLAN (this document) → VALIDATE (every finding
re-verified by direct read + live probe BEFORE planning the fix — all 4 M/H findings and
the fix-worthy L items were personally re-verified against the tree; M1's three halves are
wire-verified AND live-verified) → IMPLEMENT (smallest safe diff, TDD) → VERIFY (cold
re-cert) → DOCUMENT.

### Baseline (cold, BEFORE any work)

lint ✓ · `tsc --noEmit` ✓ (`noImplicitAny` + `noUnusedLocals`/`noUnusedParameters`) ·
unit **1085/1085** (41 files) · the canonical build green (exit 0) · the cold 5-chunk e2e
**508/508 — 135+148+66+90+69, every chunk first-pass** (run per-chunk in the foreground —
the sandbox reaps daemonized processes between tool calls; each chunk replicated the
script's exact kill→fresh-db→run procedure) · the register re-derivation **249 importers /
130 Usage-line carriers / 0 stale / 119 usage-line-free** (the 25th consecutive hold, the
expectation stated BEFORE the measurement) · the Mode-C audit of the Batch BW diff
(`728dbf5`): **13/13 substantive claims re-verified TRUE** against the tree (BW1's
visibility gates ×3 sites + networkidle + the s14 abort, BW2's two-row transaction + the
zero-state hide, BW3's NoteTitleInput + 600 ms, BW4's 60 s timeout, BW5's HISTORY_WINDOW
500 + trim, BW6's capPersistedContent 100k wired in the chat route, BW7's
checkTimetableOrderingMerge minutes-normalized, BW8's derived FK maps, BW9's paste
distribution, BW10's 60 KB gate, BW13's filename-200 + seed disconnect; the five
`122-*.png` frames present; the vitest header census current; zero key material in the
diff).

### Live parity (both hosts — agent-browser + DOM probes)

**No NEW visual parity gap; no Tailwind v4 mobile-nav bug — s123 re-confirmed (the 24th
consecutive live confirmation).** The standing reference battery held: the unlabeled
hamburger, no `role=dialog` drawer-open, 24 visible links drawer-open, the 288px drawer
panel, backdrop `blur(4px)` (the true `bg-black/20 backdrop-blur-sm` layer re-measured —
a wrapper element with an inherited 20px filter must not be mistaken for the backdrop),
`/Notes` overflow 416 > 390 (the reference's own defect), the landscape drawer-nav scroll
992 > 290. The clone battery GREEN: the labeled hamburger (the a11y superset) + drawer
(`role="dialog"`, `aria-label="Navigation menu"`, 20 nav links, the 288px `w-72` panel
with `max-w-[85vw]`, the backdrop BUTTON `bg-black/20 backdrop-blur-xs` at `blur(4px)`),
navigation → /Analytics + auto-close, `/Notes` clean at 390, the scroll persistence 600px
carried Dashboard → /Analytics. Probe residue: ZERO on the reference (this cycle's probes
were read-only — no notes, no solves, no writes) and zero on the clone dev db (the two
BX-M1 timetable probe rows deleted and verified gone).

**Two reference-side observations recorded this cycle (no action):**

- **The reference's demo data has DRIFTED from the original snapshot the clone's seed
  mirrors.** Its Flashcards view no longer lists the seeded decks (Integration rules /
  Biology Chapter 5 / Spanish Vocabulary) — an `S79 Probe Deck` (Session-79's own
  leftover, not this cycle's) is the only deck remaining. Consequence: data-shaped
  reference measurements are increasingly unreliable; chrome-level measurements (layout,
  classes, geometry) remain authoritative. Not our residue to clean (44 cycles old, the
  operator's asset).
- The API audit's seed-content informational (biology cards seeded into "Integration
  rules") is **reference-inherited demo data** (the seed mirrors the original snapshot;
  no pin asserts cards-per-deck) — kept as-is, documented here.

### The audits

Two parallel deep audits against the `skills/web-application` rubrics with ROTATED
coverage (the BW cycle had just deep-covered the AI/math/files/calculator/import routes,
the notes/quill/solver/calculator/login surfaces, and the e2e race class; this cycle's
fresh eyes went to what BW did NOT deep-cover): the API audit focused on the auth family
(the session/OTP/reset machinery, register/verify/resend, change-password/email,
delete-account), the delegate factory + all 26 entity route shells, the schema + seed
(with the seed-past-Zod lens), the http seam, and settings/RUM lightly — **0C/0H/2M/2L/8I**;
the frontend audit focused on the data layer (store, router, view-collections), the layout
chrome (sidebar/drawer/app bar), the 15 rotated views, the UI primitives, and the charts
— **0C/1H/3M/7L/9I**. Every finding was verified by direct read before it entered the
plan; the M/H items were additionally wire-verified or live-verified (below). Verified-
clean areas: the session-token machinery (HMAC + timingSafeEqual + the sessionVersion
chain end-to-end), login (uniform 401 + the timing equalizer), the OTP/reset lifecycle
(conditional single-use, supersession, pruning), the cookie contract, the refine gates,
publicUser hashless at all 5 call sites, the http seam (capped reads, the error mapper),
the delegate factory (ownership, ownedFks census, sentKeysPatch, datesOnWrite), all 26
route shells, the schema's cascades/indexes, the seed beyond the timetable rows, db-path,
settings/RUM/export, the store's selector discipline (zero derived selectors), the
fetchSeq sequencing + cascade-refresh completeness, the router/pre-warm seams, the drawer
state machine, the vehicle contract, z-scale, the UI primitives, effect hygiene (no
set-state-in-effect in any rotated view), all five Tailwind v4 traps, the SVG chart
doctrine, zero-data surfaces, and the a11y basics.

## 1. The verified findings (consolidated, de-duplicated)

**API M1 — the timetable both-legs ordering guard compares RAW STRINGS (the BW7
half-finished class).** `src/lib/validation.ts`'s two `.check()`s compare
`endTime < startTime` lexicographically; the `hhmm` atom admits UNPADDED hours
(`/^\d{1,2}:\d{2}$/`), so the comment's zero-padded premise is false. **Wire-verified both
directions on the dev server:** `{startTime:"9:00", endTime:"11:00"}` (a LEGAL span) →
**400 "End time must be after the start time"** (the false rejection — `"11:00" <
"9:00"` lexicographically); `{startTime:"09:00", endTime:"8:30"}` (an INVERTED span) →
**201 CREATED** (the guard bypassed — `"8:30" > "09:00"` lexicographically). The probe
rows were deleted (zero residue). **Third half, live-verified:** the timetable edit dialog
on the seeded "Calculus II" (`startTime: "9:00"`) opens with a BLANK start input —
`<input type="time">`'s HTML value sanitization blanks a non-`HH:MM` value — so editing a
seeded class requires retyping the time. The BW7 single-leg merge normalizes minutes; the
schema-level both-legs path never got the same treatment.

**API M2 — no per-account OTP attempt cap; the verify gate keys on the client-forgeable
default.** `verify-email`'s only brake is `checkRateLimit(`verify:${ip}`, 20)`; in the
shipped default posture (`TRUSTED_PROXY_HOPS` unset) `clientIp` trusts the first
(client-supplied) XFF hop, so a forged header mints fresh keys. The code space is 10⁶,
the TTL 15 min, and a correct guess SIGNS THE CALLER IN. No per-account counter exists
anywhere. Fix design (oracle-free): a per-USER budget AFTER the user lookup — exhausted
returns the SAME uniform 400 (never a distinguishable 429 — a per-account 429 would be a
worse enumeration oracle than the guessing surface it closes).

**API L1 — the register verified-existing fast path skips the scrypt burn every other
branch pays** (`register/route.ts:63-69` returns before any `hashPassword`), a ~50-100 ms
timing asymmetry that undermines BU14's uniform-200 enumeration hardening. The
`verifyLoginCredentials`/`DUMMY_LOGIN_HASH` equalizer precedent exists in-repo.

**API L2 — the folder schemas' `parentId` `""`→null transform is DEAD CODE** — `idField`'s
min(1) rejects `""` BEFORE the transform, so the app's own clear-to-root convention
(every other entity FK via the shared `nullableId` atom) 400s at the folder routes.

**FE H1 — the exam/event datetime round-trip violates the repo's own local-time
contract.** `exams-view`/`events-view` populate the edit dialog with
`row.date.slice(0, 16)` — the UTC WALL-CLOCK of the stored instant — and submit the
datetime-local string RAW, which the server's `datesOnWrite` re-interprets in the SERVER's
zone. For any non-UTC deployment: the card renders `toLocaleTimeString` (correct local)
while the dialog shows the UTC wall-clock (they disagree), and each untouched edit cycle
re-interprets the UTC wall-clock as local — **a per-save drift of the UTC offset**. The
correct pattern exists in-repo (`tasks-view`'s `toDateInputValue`/`fromDueDateInput`
local-noon anchors). Invisible in the all-UTC dev/e2e environment — the "dev server lies
about production" class.

**FE M2/M3/L2/L3/L7 + the hygiene set** — the practicetests question-drafts list uses
INDEX KEYS with mid-list removal (focus/IME can land on the wrong row); the focus timer
records the NOMINAL duration on early manual complete (a 25-min timer completed after 2
min logs 1500 s — every focus stat inflated; the auto path is unaffected); the flashcards
deck-row highlight reads raw `selectedDeckId` while the detail pane falls back to
`effectiveDeckId` (no row highlighted after deleting the selected deck); the exams
duration + assignments progress NUMBER inputs coerce mid-typing (clearing snaps to
60/0 — the controlled-input snap-back class); the practicetests countdown calls
side effects INSIDE a `setSecondsLeft` updater (impure — React may double-invoke); the
myday delete-confirm comment claims a "pattern shared with TasksView" that does not exist
(Tasks is instant-delete BY PARITY — the S120 reference measurement "no task-delete
confirm"; MyDay's confirm is the superset deviation); the study-group members
read-modify-write computes from the stale `selected` snapshot (the add path is guarded by
`savingMember`; add/remove interleaving can lose one op).

**Doc drift (7 verified items)** — README:169 says 502 (should be 508); README:108 says
1030 tests (should be 1085); PAD §8.1's Total row says 49 files/1133 tests (three epochs
stale — should be 71 files/1593); PAD §8.4's checklist says 258+/290+; **ADR-003 says
"30-day TTL" while the shipped `SESSION_TTL_MS` is 7 days** (BV2's narrative already says
7-day — the ADR body was never reconciled); ADR-020's Decision text says
"shorter-than-32-chars is a WARN" while BT5's shipped band is <16 FATAL / 16-31 WARN
(PAD:984 has it right); SKILL:584's chunk map says `135+145+61+90+66 = 497` (the S120-era
map — the header says 508).

**Dismissed as documented non-gaps (with reasons):** FE L4 (events/flashcards dialogs
lack Cancel — the S120 measured matrix: "Events/Flashcards do not" carry Cancel; the
clone matches the reference); FE M1's behavior half (adding confirms to Tasks would BREAK
the measured parity — only the comment is wrong); FE L1 (the global loading boolean race —
cosmetic-transient, the fetchSeq ticket protects all data, the first-finisher clear only
suppresses a spinner); FE L5 (the 44px touch floor on size-6/size-7 icon controls —
reference-measured parity, to be DOCUMENTED as an exception rather than padded); the API
audit's I3/I5/I6/I7/I8 (reference-inherited demo data; ADR-022's documented
session-survives decision; the self-healing RUM loop; the accepted import boundary; the
SQLite-scale unindexed FKs + the no-leak files/link shape); the FE audit's I1/I2/I3/I4/I7/I8/I9
(all pinned-parity or documented classes).

## 2. The BX set (TDD — RED first, then the source)

- **BX1 the timetable both-legs normalization (the M1 family, three halves).** Export
  `hhmmMinutes` from `validation.ts` (single source; `entities.ts` reuses it for the
  single-leg merge); both `.check()`s compare minutes (the legal unpadded span accepted,
  the inverted mixed form rejected). Pad the SEED's timetable times ("09:00") — new dbs
  clean, the normalization keeps legacy rows working (the BW7 tolerance pins stay).
  Normalize on edit-populate (`normalizeHhmmForInput` — pad 1-digit hours — exported from
  `validation.ts`, unit-pinned) so a legacy row's time inputs SHOW instead of blanking.
  **Pins:** unit (the both-legs family: legal-unpadded accepted [RED], inverted-mixed
  rejected [RED], malformed rejected as today, the normalize-helper legs) + wire e2e
  (resilience: unpadded-legal create → 201 + cleanup, inverted → 400) + e2e (parity-9:
  the seeded Calculus II edit dialog shows "09:00" in the start input [RED — live-verified
  "" today]).
- **BX2 the per-account OTP attempt cap (M2).** `verifyAcct:${user.id}` budget 10/15-min
  after the user lookup; exhausted → the SAME uniform 400 (no new oracle). The IP limiter
  stays first (the BR2 pin untouched — it probes a NON-EXISTENT email). **Pin:** e2e
  (auth-flows, fresh TEST-NET user: 10 wrong codes then the CORRECT code → 400 [RED
  pre-fix: 200]).
- **BX3 the datetime-local round-trip (H1, the tasks-view pattern).** `toDatetimeLocalValue`
  + `fromDatetimeLocalInput` in `src/lib/date.ts` (the pure seam); exams + events populate
  through the former, submit through the latter. **Pins:** unit (date.test: the
  TZ-independent round-trip instant preservation — `Date.parse(from(to(iso))) ===
  Date.parse(iso)` for minute-aligned instants; the ""/malformed legs; the 16-char no-Z
  local format) + e2e wiring pin (parity-8: create an exam at a fixed time → the edit
  dialog's input shows the entered local time → cancel; GREEN-on-arrival in the UTC suite
  — the BW11 coverage-pin style, documented honestly: the drift itself is code-verified,
  the pin locks the wiring).
- **BX4 the register fast-path scrypt burn (L1).** Burn the dummy hash before the
  verified-existing early return (the BR3 equalizer precedent). No new pin — BU14's
  uniform-200 register pins guard the shape; the timing asymmetry is code-verified.
- **BX5 the folder parentId clear-to-root (L2).** Both folder schemas adopt the shared
  `nullableId` atom. **Pin:** wire e2e (resilience: create folder with `parentId: ""` →
  201 + cleanup [RED pre-fix: 400]).
- **BX6 the focus-timer elapsed recording (M3).** `complete()` records
  `durations.focus - remaining` (the auto path at remaining=0 is unchanged); the manual
  early-complete records the true elapsed. **Pin:** e2e (parity-5: start → complete
  within ~1.5 s → the created session's durationSeconds < 1500 [RED pre-fix: exactly
  1500] + trailing DELETE cleanup).
- **BX7 the practicetests hygiene pair (M2 + L7).** Stable `crypto.randomUUID()` draft
  ids (the BV17 class); the countdown zero-detection moves to the effect shape (the
  focustimer pattern — no side effects inside the updater). Code-verified fixes; guarded
  by the existing countdown/expiry pins.
- **BX8 the deck-row highlight sync (FE L2).** Highlight on `effectiveDeckId === deck.id`.
  **Pin:** e2e (parity-7: API-create two probe decks → UI-select the second → UI-delete it
  → the first row carries the selected styling → API-cleanup — zero seeded-deck residue).
- **BX9 the number-input string state (FE L3).** Exams duration + assignments progress
  hold STRINGS in form state, parse on submit (the gradetracker/practicetests pattern).
  **Pin:** e2e (parity-9: the Add Assignment dialog's progress field, cleared, reads ""
  [RED pre-fix: "0"]).
- **BX10 the hygiene set.** The myday comment corrected (Tasks is instant BY PARITY);
  the study-group members read from the store's fresh state at mutation time; the
  touch-target parity exception documented (AGENTS.md); the reference-demo-data-drift
  doctrine note (AGENTS/SKILL — data-shaped reference measurements are no longer
  authoritative; chrome-level measurements remain so).
- **BX11 the docs-drift set.** README:169 → 508; README:108 → 1085; PAD §8.1 Total row →
  the re-measured census (71 files = 41 unit + 30 e2e; 1085 + 508 = 1593); PAD §8.4 →
  the current counts; ADR-003 → the 7-day TTL; ADR-020 → the BT5 band; SKILL:584 → the
  508 map; the resend=10 budget documented; plus the standard census re-tags riding the
  final counts (AGENTS, CLAUDE, the vitest header, the cert script, the master plan
  header, the SKILL census).

## 3. Verification checklist (the cold re-cert)

lint ✓ · `tsc --noEmit` ✓ · unit (new census — 1085 + BX1/BX3 pins, exact count at RED
time) · the canonical build · the cold 5-chunk e2e (new census — projection: 508 + 8 =
**516** [chunk 1 +1 BX3, chunk 2 +3 BX1/BX8/BX9, chunk 3 +3 BX1-wire/BX5/BX6, chunk 5 +1
BX2] = 136+151+69+90+70) · the register tripwire re-derivation (**249/130/0/119 expected
to hold — no new playwright scripts; the pins ride existing spec files**) · the live curl
battery (the timetable unpadded-legal create → 201, inverted → 400 both directions; the
folder parentId "" create → 201; the verify lockout) · the live agent-browser battery
(the mobile drawer family, the timetable edit dialog showing 09:00, the exam edit dialog
showing the entered time) · the evidence screenshots (the timetable edit dialog, the exam
edit dialog, the dashboard, the mobile drawer, the focus timer) · `.env.example` verified
current. **Standing debt: ZERO.**

## 4. Documentation chain (the same-commit updates)

README (the census lines + the Session-123 row) · AGENTS.md (the commands census + the
S123 lessons: the both-legs half-lesson [a guard family must be normalized at EVERY
enforcement site], the oracle-free per-account budget design, the reference-data-drift
doctrine, the touch-target exception) · CLAUDE.md (the Unit line census + the BX seams) ·
vitest.config.ts header (the new census) · PAD (v1.3.31: the revision block + the
ADR-003/ADR-020/§8.1/§8.4 reconciliations) · the cert-script census re-tag (AFTER the
DONE line) · the master remediation-plan header → Batch BX · the SKILL doc (the census +
the drift doctrine) · `worklog.md` (this cycle's entry) · `docs/session_117.md` (the
session record, titled "Session 124").

## 5. Execution record (2026-11-01)

**Status: COMPLETE — standing debt ZERO.** Executed TDD-style in the plan's order; the census
projection held exactly.

- **RED verified:** 13 unit pins (validation 8 [the BX1 both-legs family ×3 + the helpers ×3 +
  the nullableId ×2 — the legal-unpadded leg failed with the production ZodError itself] + date 5
  [the BX3 round-trip family, missing exports]) + 7 e2e pins (BX1-edit, BX9, BX8, BX6, BX2,
  BX1-wire, BX5 — every one verified RED for the RIGHT reason: the blank "09:00" input, the "0"
  snap-back, the border-transparent row, the exactly-1500 duration, the 200-on-correct-code, the
  false 400, the dead-transform 400) + BX3's exam-edit wiring pin GREEN-on-arrival in the UTC
  suite (the BW11 coverage-pin style, as the plan stated — the drift itself is code-verified and
  seam-pinned).
- **GREEN:** unit **1085 → 1099** (41 files); e2e **508 → 516** (136+151+69+90+70 — the plan's
  per-chunk projection exact).
- **The mid-run catches (the honest corrections, five):** (1) the BX9 pin's first locator named a
  non-existent "New Assignment" button (the real label is "Add Assignment" — the 45 s timeout was
  the wrong-reason red, re-verified for the right one); (2) the BX1-edit pin's end-time
  expectation came from the DEV db's older seed ("11:00") while the e2e seed's Calculus II ends
  "10:30"; (3) the BX1-wire pin demanded the BARE merge copy where the schema path legitimately
  carries the Zod field prefix ("endTime: …") — toContain now accepts both enforcement sites'
  shapes; (4) the BX8 pin asserted the WRONG ROW — the fallback highlights decks[0] (a seeded
  deck; the probe decks were appended), so the pin now asserts the first row carries the selected
  class AND the probe row does not; (5) a BX3 unit pin expected "" for a date-only ISO string
  that Date legitimately parses (UTC midnight — the formatter renders it; the pin now pins the
  parse behavior instead of inventing a rejection).
- **The a11y/BU13 regression checks:** the countdown rewrite preserved the S120/BU13 expiry
  announcement pin (chunk 4 first-pass green through the real 60 s clock); the seed's padded
  times changed no pinned surface (the timetable cell text renders from the stored rows; no pin
  asserts the seeded time strings).
- **Live curl battery:** the unpadded-legal create → 201 (was the false 400); the inverted mix →
  400 with the ordering copy (was 201); the folder parentId "" → 201 (was 400); the probe rows
  deleted (zero residue).
- **Live agent-browser battery:** the LEGACY dev-db "9:00" row opens its edit dialog at "09:00"
  (the normalize on a real legacy row); the exam create→edit round-trip shows the entered local
  time; the five `123-*.png` evidence frames captured (non-blank-verified).
- **Final re-cert (the §3 checklist):** lint ✓ · tsc ✓ (`noImplicitAny` +
  `noUnusedLocals`/`noUnusedParameters`) · unit **1099/1099** (41 files) · the canonical build
  green (the ADR-020 warning the only stderr) · the cold 5-chunk e2e **516/516** (every chunk
  first-pass, run per-chunk in the foreground — the sandbox reaps daemons) · the register
  tripwire **249/130/0/119** (the exact hold, the expectation stated BEFORE the measurement —
  no new playwright scripts) · `.env.example` current (the diff carries no new env reads).
