# Session 123 — Batch BW (Cycle 72): The Audit-Driven Hardening Cycle — the Race-Class + Solver-Persistence + Title-Debounce Set

> Record of worklog **Session-122 / Batch BW**. Workspace: refreshed clone at `ffbca0f`
> (the Batch BV state `a332384` + the operator's `docs/session_114.md` transcript).
> Plan + execution record: **`docs/remediation-plan-session122.md`**.

## The directive

The operator directed the standing rhythm: refresh the workspace, re-read the full doc chain
(`AGENTS.md`, `CLAUDE.md`, `README.md`, `PAD`, `omni-study1_SKILL.md`,
`docs/session_113.md`, `docs/remediation-plan-session121.md`, `worklog.md`,
`docs/session_114.md`), re-validate against the codebase, audit with the repo skills as
rubrics (the `skills/` folder excluded from checking/testing/compilation), iterate on
visual + functional parity with `https://omni-study1.base44.app/` (the mobile navigation
menu the named focus, Tailwind v4 the named suspicion class), keep the repo a
production-ready functional SUPERSET, verify the `.env`/`db/` contract and the vitest +
playwright suites, plan + execute remediation TDD-style, capture evidence, update the docs
chain, and commit + push to `main` via the SSH wrapper.

## Baseline (cold, BEFORE any work)

lint ✓ · `tsc --noEmit` ✓ (`noImplicitAny` + the unused guards) · unit **1054/1054** (39
files) · the canonical build green · the cold 5-chunk e2e **501/502** — chunk 1's
`S120/BU9` Add-Exam-Cancel pin FAILED (reproduced 4/4 in isolation; root-caused by TRACE
to the non-retrying before-count racing the pre-warm completion — the count ran ~160 ms
before the `/api/exams` response landed, during the Splash; the S16 pre-warm contract
itself HOLDS; the pin had raced green for two cycles on timing luck) · the register
re-derivation **249 importers / 130 Usage-line carriers / 0 stale / 119 usage-line-free**
(the 23rd consecutive hold, the expectation stated BEFORE the measurement) · the Mode-C
audit of the Batch BV diff (`a332384`): **17/17 substantive claims re-verified TRUE**
against the tree (zero key material; the six `121-*.png` frames present; the census
confirmed live), with two claim-text drifts noted — BV1's seam lives in
`src/lib/server/entities.ts:118` (the plan text said `validation.ts`), and the screenshot
count is six, not seven.

## Live parity (both hosts — agent-browser + DOM probes)

**No NEW visual parity gap; no Tailwind v4 mobile-nav bug — s122 re-confirmed (the 23rd
consecutive live confirmation).** The standing reference battery held: the unlabeled
hamburger, no `role=dialog` drawer-open, 24 visible links drawer-open, the 288px drawer
panel (reference-measured this cycle — the clone's `w-72` is exact parity), backdrop
`blur(4px)`, `/Notes` overflow 416 > 390 (the reference's own defect), the landscape
drawer-nav scroll 992 > 290. The clone battery GREEN: the labeled hamburger (the a11y
superset) + drawer (`role="dialog"`, `aria-label="Navigation menu"`, 20 nav links, the
288px panel, the labeled backdrop at `blur(4px)`, navigation → /Analytics + auto-close),
`/Notes` clean at 390, the landscape nav scroll available (992 > 755 at 844×390), the
scroll persistence 600px carried Dashboard → /Analytics.

**Two reference measurements settled parity decisions (the DOM-authority rule):**

- **N1 (the note title):** instrumented fetch+XHR on the reference's note editor — ZERO
  network saves across 10+ s of typing; the reference persists the title on the explicit
  Save only. The clone's per-keystroke PATCH + full-collection refetch (on an input
  controlled only by store state) was a functional deviation with a real defect
  underneath — the snap-back + the request storm → **BW3**.
- **N2 (the solver history):** the reference's Math Solver renders NO history section at
  zero (re-measured live — consistent with the s70 zero-state probe), and the s72 cycle
  measured its POPULATED "Recent Problems". The clone rendered the heading + an invented
  "Problems you solve will be saved here." copy at zero AND its solve route never wrote
  rows — the feature was dead behind a false promise → **BW2**.

## The audits

Two parallel deep audits with ROTATED coverage (the BV cycle had just deep-covered
§5/§6/§7/§16 + §8/§9/§12/§13 on the surfaces it fixed; the fresh eyes went to what BV did
NOT deep-cover): the API audit — the AI/math routes, files/folders, calculator/RUM/
settings/holidays, the import/export seams, the delegate factory's remaining edges, the
schema/seed, and the §14/§15 unpinned-guarantee lens — **0C/0H/2M/5L/4I**; the frontend
audit — the e2e test layer itself as a codebase, the calculator/math-solver/AI-assistant
views, quill-editor + notes, the auth sub-screens, shared.tsx + the SVG charts, and the
export/rum panels — **1H/3M/4L/4I**. Every finding was verified by direct read + live
probe before it entered the plan. Verified-clean areas are stated in the plan's §0 (the
AI family budget/ordering/deadline set, the files 2 MiB triple-enforcement + download
contract + cycle guard, the RUM routes, the settings discipline, the import/export secret
guards + FK pre-emption + topo sort, the delegate factory's ownedFks census [all 12 FK
fields across the 10 registry delegates], the schema cascades + index coverage, the seed
idempotency + SEED_DEMO gate, the calculator/solver/assistant contracts, the Quill
lifecycle + the AE1/AG6/AH1/AH2 machinery, the charts' guards, the auth surface's state
machine + autoComplete types + no-enumeration, and the remaining e2e non-waiting reads).

## The BW set (TDD — RED first, then the source)

**RED:** 17 failing unit pins (timetable-merge +12, ai-helpers +15-import-failure,
import-maps +2) + 4 failing e2e pins (BW2 ×2, BW3, BW9), every pin verified RED for the
right reason on the pre-change tree; the Exams BU9 pin's live red WAS BW1's evidence.
**GREEN: unit 1054 → 1085 (41 files); e2e 502 → 508 (135+148+66+90+69).**

- **BW1** the immediate-read-after-`hydrated()` race class — `hydrated()` resolves
  PRE-PAINT (the boot-script var, during the Splash), so a non-retrying `.count()` races
  the shell flip + the pre-warm: THREE BU9 instances (Exams — the cert's red; Assignments
  + Timetable — latent twins) + the MyDay conditional-guard vacuous-pass variant + the
  day-15 deselect's once-a-month deterministic failure + the s14 D1/D2 unroute leaking a
  held request to the real server + the a11y sweep's pre-data DOM. Closed with the AP-96
  visibility gates, a today-independent computed deselect target, the held-route ABORT
  before unroute, and a networkidle settle after the headline gate.
- **BW2** the Math Solver persistence — the solve route mirrors the chat route's two-row
  `surface:"solver"` `$transaction` (written ONLY on success — a failed solve bounces the
  composer, no orphan rows); the view renders the section ONLY with history (the
  reference's measured zero-state); S5-AB6 flipped; a REAL-solve populated pin
  (retry-once, trailing DELETE cleanup) covers both halves.
- **BW3** the note-title debounce — a key-remounted `NoteTitleInput` child (the BU1
  pattern — the lint gates shaped this twice) owning a local draft + a 600 ms debounce
  (the editor's rhythm), flushing on note switch (the unmount flush), on Save (an
  imperative handle), with the BT11 streak contract preserved verbatim.
- **BW4** the import `$transaction`'s explicit 60 s timeout + the PAD ADR-021 text
  reconciled to the shipped semantics (findFirst+update/create, the shared mapper).
- **BW5** the calculator history bounded (GET take-500 newest-reversed + a per-user
  retention trim on write — no user-visible failure mode).
- **BW6** the assistant reply capped at write (100k, the note-content precedent).
- **BW7** the timetable ordering guard (the events family on the hhmm atoms) — schema
  checks + the single-leg `checkTimetableOrderingMerge` merge; **the live probe caught
  the SEED's unpadded legacy hours** ("9:00" written past the Zod boundary —
  "11:00" < "9:00" lexicographically rejected every LEGAL move); the comparison is
  minutes-since-midnight normalized, pinned with the unpadded-legacy + malformed-legacy
  unit legs + a wire-level e2e pin.
- **BW8** the import FK twin-maps drift hazard closed — the route consumes
  `IMPORT_REQUIRED_FKS`/`IMPORT_OPTIONAL_FKS` DERIVED from the seam's `IMPORT_FK_MAP`
  (single source, derivation-pinned).
- **BW9** the OTP paste distribution (a pasted code fills all six boxes — the in-band
  delivery makes paste the dominant path).
- **BW10** the Quill image gate (the measured toolbar kept; the default unbounded base64
  handler replaced with a 60 KB size gate + toast).
- **BW11** the two unpinned 413 wire guards pinned (files 2 MiB multipart + import
  10 MiB).
- **BW12** the ai.ts helper seams unit-pinned (withDeadline / extractAssistantContent /
  extractJsonBlock + the cap boundary — 15 pins).
- **BW13** the hygiene set (the multipart filename bound at 200, the seed early-return
  disconnect, the export panel's friendly malformed-backup copy, the GPA id counter).

## The honest mid-run corrections (four)

1. The BW3 pin's final assertion missed AH8a's `Date.now()` in the note title (the regex
   widened to match both segments).
2. **The BW7 string-compare gap — the LIVE PROBE caught what the pins missed**: the
   first form compared hhmm strings; the seeded row stores `startTime: "9:00"` (UNPADDED
   — the seed writes past the Zod boundary) and `"11:00" < "9:00"` lexicographically, so
   every LEGAL move against a legacy row 400'd. Closed with minutes normalization + two
   unit pins — the BV1 Date-fixture lesson's hhmm sibling: a guard over STORED rows pins
   the SEED's shapes too.
3. The NoteTitleInput's first draft used a set-state-in-effect — the lint gate caught
   it; rewritten as the key-remounted child (the BU1 pattern), and the render-time
   latest-ref write moved to the AH1 effect-time form.
4. **The AP-130 tooling artifact — a finding retracted by char codes**: the agent
   toolchain's OUTPUT pipeline silently strips bracket-letter sequences (`[m`, `[h`
   observed) — a phantom "corrupted `transition-argin]` class" was actually
   `transition-[margin]` (codes 45,91,109; computed `transition-property: margin /
   0.2s` verified live — the BS10 fix works as designed). Two probe harnesses were
   corrupted by the same artifact before the char-code check exposed it. The rule:
   bracket-bearing evidence is re-read as char codes before it becomes a finding.

## Re-certification (all on the FINAL tree)

lint ✓ · `tsc --noEmit` ✓ (`noImplicitAny` + `noUnusedLocals`/`noUnusedParameters`) ·
unit **1085/1085** (41 files) · the canonical build green · the cold 5-chunk e2e
**508/508** (135+148+66+90+69 — every chunk first-pass) · the register tripwire
**249/130/0-stale/119** — the exact hold · the live curl battery (the timetable inverted
create/single-leg → 400 both directions with the ordering copy, the legal move → 200 ON
THE LEGACY UNPADDED ROW, the calculator GET newest-reversed ordering) · the live
agent-browser battery (BW2's zero + populated states photographed, the BW3 debounced
typing e2e-pinned) · the five `docs/screenshots/122-*.png` evidence frames (the solver
zero + populated pair, the notes editor, the dashboard, the mobile drawer — all
non-blank-verified) · `.env.example` verified current (no new env vars). **Standing
debt: ZERO.**

## Docs chain

README badge 1593 + the Session-122 row + the census lines; AGENTS commands 1085/508 +
the S122 lessons ×4 (the pre-paint hydrated() class, the AP-130 output-stripping
artifact, the seed-past-the-Zod-boundary rule, the controlled-input draft+debounce
pattern); CLAUDE Unit-line 1085 + the S122 seam tail; vitest header 1085 (41 files); PAD
v1.3.30 (the revision block + the ADR-021 reconciliation); the cert-script 508 census
re-tag (AFTER the DONE line); the master remediation-plan header → Batch BW; the SKILL
doc census + AP-130; `worklog.md` (this cycle's entry); this record.
