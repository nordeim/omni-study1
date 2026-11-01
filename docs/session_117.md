# Session 124 — Batch BX (Cycle 73): The Audit-Driven Hardening Cycle — the Both-Legs-Guard + Per-Account-OTP-Cap + Datetime-Round-Trip Set

> Record of worklog **Session-123 / Batch BX**. Workspace: refreshed clone at `d5e6130`
> (the Batch BW state `728dbf5` + the operator's `docs/session_116.md` transcript).
> Plan + execution record: **`docs/remediation-plan-session123.md`**.

## The directive

The operator directed the standing rhythm: refresh the workspace, re-read the full doc chain
(`AGENTS.md`, `CLAUDE.md`, `README.md`, `PAD`, `omni-study1_SKILL.md`,
`docs/session_115.md`, `docs/remediation-plan-session122.md`, `worklog.md`,
`docs/session_116.md`), re-validate against the codebase, audit with the repo skills as
rubrics (the `skills/` folder excluded from checking/testing/compilation), iterate on
visual + functional parity with `https://omni-study1.base44.app/` (the mobile navigation
menu the named focus, Tailwind v4 the named suspicion class), keep the repo a
production-ready functional SUPERSET, verify the `.env`/`db/` contract and the vitest +
playwright suites, plan + execute remediation TDD-style, capture evidence, update the docs
chain, and commit + push to `main` via the SSH wrapper.

## Baseline (cold, BEFORE any work)

lint ✓ · `tsc --noEmit` ✓ (`noImplicitAny` + the unused guards) · unit **1085/1085** (41
files) · the canonical build green · the cold 5-chunk e2e **508/508** (135+148+66+90+69,
every chunk first-pass — run per-chunk in the foreground: the sandbox reaps daemonized
processes between tool calls, so each chunk replicated the cert script's exact
kill→fresh-db→run procedure) · the register re-derivation **249 importers / 130 Usage-line
carriers / 0 stale / 119 usage-line-free** (the 25th consecutive hold, the expectation
stated BEFORE the measurement) · the Mode-C audit of the Batch BW diff (`728dbf5`): **13/13
substantive claims re-verified TRUE** against the tree (the three BW1 visibility-gate
sites + the a11y networkidle + the s14 abort; BW2's two-row transaction + the zero-state
hide; BW3's NoteTitleInput; BW4's 60 s timeout; BW5's HISTORY_WINDOW 500 + trim; BW6's
cap wired in the chat route; BW7's normalized merge; BW8's derived FK maps; BW9's paste
distribution; BW10's 60 KB gate; BW13's filename-200 + seed disconnect — plus the five
`122-*.png` frames present, the vitest header census current, and zero key material in
the diff).

## Live parity (both hosts — agent-browser + DOM probes)

**No NEW visual parity gap; no Tailwind v4 mobile-nav bug — s123 re-confirmed (the 24th
consecutive live confirmation).** The standing reference battery held: the unlabeled
hamburger, no `role=dialog` drawer-open, 24 visible links drawer-open, the 288px drawer
panel, backdrop `blur(4px)` (measured on the TRUE `bg-black/20 backdrop-blur-sm` layer —
a wrapper element carrying an inherited 20px filter must not be mistaken for the
backdrop), `/Notes` overflow 416 > 390 (the reference's own defect), the landscape
drawer-nav scroll 992 > 290. The clone battery GREEN: the labeled hamburger (the a11y
superset) + drawer (`role="dialog"`, `aria-label="Navigation menu"`, 20 nav links, the
288px `w-72` panel with `max-w-[85vw]`, the backdrop BUTTON `bg-black/20
backdrop-blur-xs` at `blur(4px)`), navigation → /Analytics + auto-close, `/Notes` clean
at 390, the scroll persistence 600px carried Dashboard → /Analytics.

**A reference observation recorded (no action):** the reference's demo DATA has DRIFTED
from the original snapshot the clone's seed mirrors — its Flashcards view no longer lists
the seeded decks (an `S79 Probe Deck` from Session-79 is all that remains; not this
cycle's residue — this cycle's reference probes were read-only). Consequence (the S123
lesson-3 doctrine): data-shaped reference measurements are no longer authoritative;
chrome-level measurements (layout, classes, geometry, dialog matrices) remain so. Probe
residue: zero on both hosts.

## The audits

Two parallel deep audits with ROTATED coverage (the BW cycle had just deep-covered the
AI/math/files/calculator/import routes, the notes/quill/solver/calculator/login surfaces,
and the e2e race class; the fresh eyes went to what BW did NOT deep-cover): the API audit
— the auth family (the session/OTP/reset machinery end-to-end, register/verify/resend,
the rotation gates), the delegate factory + all 26 entity route shells, the schema + seed
(with the seed-past-Zod lens), the http seam, and settings/RUM lightly — **0C/0H/2M/2L/8I**;
the frontend audit — the data layer (store sequencing, router, pre-warm), the layout
chrome (sidebar/drawer/app bar), the 15 rotated views, the UI primitives, and the charts
— **0C/1H/3M/7L/9I**. Every finding was verified by direct read before it entered the
plan; the M/H items were additionally wire-verified or live-verified. Verified-clean
areas are stated in the plan's §0 (the session-token machinery + the revocation chain,
login's uniform 401 + equalizer, the OTP/reset lifecycle, the cookie contract, the http
seam, the delegate factory's ownership/ownedFks/sentKeysPatch/datesOnWrite set, the
schema's cascades/indexes, the store's selector + sequencing discipline, the drawer state
machine, the vehicle contract, z-scale, the UI primitives, effect hygiene across the
rotated views, all five Tailwind v4 traps, the SVG chart doctrine, zero-data surfaces,
and the a11y basics).

## The BX set (TDD — RED first, then the source)

**RED:** 13 failing unit pins (validation 8 [the BX1 both-legs family — the legal-
unpadded leg failed with the production ZodError itself — + the helper family + the
nullableId pair] + date 5 [the BX3 round-trip family]) + 7 failing e2e pins (BX1-edit,
BX9, BX8, BX6, BX2, BX1-wire, BX5 — every one verified RED for the right reason) + BX3's
exam-edit wiring pin GREEN-on-arrival in the UTC suite (the BW11 coverage-pin style — the
drift itself is code-verified and seam-pinned on the TZ-independent property).
**GREEN: unit 1085 → 1099 (41 files); e2e 508 → 516 (136+151+69+90+70).**

- **BX1** the timetable BOTH-LEGS ordering guard normalized — the S122/BW7 single-leg
  merge was normalized but the schema-level both-legs `.check()` still compared RAW
  strings; the atom admits UNPADDED hours, so the legal "9:00"→"11:00" span FALSELY
  400'd and the inverted "09:00"→"8:30" mix PERSISTED (both wire-verified on the dev
  server: 400 + 201). Every enforcement site now routes through the exported
  `hhmmMinutes` single source (the schema checks AND the entities.ts merge);
  `normalizeHhmmForInput` pads legacy rows on edit-populate (the seeded "9:00" opened
  the edit dialog with a BLANK start input — `<input type="time">`'s HTML value
  sanitization blanks a non-HH:MM value; live-verified); the seed pads its times so no
  new legacy rows are minted.
- **BX2** the per-account OTP attempt cap — verify-email's only brake was the per-IP
  limiter (client-forgeable in the default TRUSTED_PROXY_HOPS-unset posture), and a
  correct guess SIGNS THE CALLER IN. A 10/15-min per-USER budget now fires after the
  user lookup, answering the SAME uniform 400 when exhausted — never a distinguishable
  429 (a per-account 429 would be a WORSE account-existence oracle than the guessing
  surface it closes). E2e-pinned by the correct-code-after-10-wrongs lockout.
- **BX3** the exam/event datetime round-trip — the edit dialogs populated the UTC
  WALL-CLOCK via `slice(0,16)` and submitted the TZ-less datetime-local string raw; the
  server re-anchored it in ITS zone, drifting the stored instant by the UTC offset on
  every untouched edit cycle on any non-UTC host (invisible in the all-UTC dev/e2e
  environment — the "dev server lies" class). `toDatetimeLocalValue` /
  `fromDatetimeLocalInput` now own both boundaries in the user's zone (the tasks-view
  local-noon pattern), unit-pinned on the TZ-INDEPENDENT round-trip property.
- **BX4** the register verified-existing fast path burns the dummy scrypt (the
  ~50-100 ms timing enumeration asymmetry — the BR3 equalizer precedent; guarded by
  BU14's existing uniform-200 pins).
- **BX5** the folder routes' `parentId` adopts the shared exported `nullableId` atom —
  the route-local twin's ""→null transform was DEAD CODE (idField's min(1) rejected ""
  first), so the clear-to-root convention 400'd; wire-pinned.
- **BX6** the focus timer records the ELAPSED duration on early manual complete (was
  the NOMINAL 25:00 — every focus stat silently inflated; the auto path unchanged;
  e2e-pinned <1500 with cleanup).
- **BX7** the practicetests hygiene pair (stable `crypto.randomUUID()` draft ids — the
  BV17 index-key class; the countdown zero-detection moved out of the state updater
  into the effect shape — the focustimer pattern, the S120/BU13 expiry pin preserved
  through the real 60 s clock).
- **BX8** the deck-row highlight follows the fallback selection (`effectiveDeckId` —
  after deleting the selected deck NO row was highlighted while decks[0]'s cards
  rendered; e2e-pinned with API-created probe decks, zero seeded residue).
- **BX9** the exams duration + assignments progress number inputs hold STRINGS in form
  state, parsing on submit (the mid-typing 60/0 snap-back class; e2e-pinned on the
  cleared field reading "").
- **BX10** the hygiene set (the myday stale "pattern shared with TasksView" comment
  corrected — Tasks is instant-delete BY PARITY, the S120 measurement; the study-group
  members read the store's fresh state at mutation time; the touch-target parity
  exception + the reference-data-drift doctrine documented in AGENTS.md).
- **BX11** the docs-drift set (README's stale 502/1030 census lines; PAD §8.1's
  three-epochs-stale Total row re-measured to 71 files/1615 + §8.4's 258+/290+
  checklist; **ADR-003's "30-day TTL" reconciled to the shipped 7-day
  `SESSION_TTL_MS`**; ADR-020's weak-secret band reconciled to BT5's
  <16-FATAL/16-31-WARN; the SKILL doc's stale 497 chunk map; the full limiter census
  documented at ADR-003).

## The honest mid-run corrections (five, all pin-side)

1. The BX9 pin's first locator named a non-existent "New Assignment" button (the real
   label is "Add Assignment") — the 45 s timeout was a wrong-reason red, re-verified
   for the right one (the "0" snap-back).
2. The BX1-edit pin's end-time expectation came from the DEV db's older seed ("11:00")
   while the e2e seed's Calculus II ends "10:30" — the dev db and the e2e seed are
   different vintages; pin against the SEED the suite actually boots.
3. The BX1-wire pin demanded the BARE merge copy where the schema path legitimately
   carries the Zod field prefix ("endTime: …") — `toContain` now accepts both
   enforcement sites' shapes.
4. The BX8 pin asserted the WRONG ROW — the fallback highlights decks[0] (a seeded
   deck; the probe decks were appended by creation order), so the pin now asserts the
   first row carries the selected class AND the probe row does not.
5. A BX3 unit pin expected "" for a date-only ISO string that `Date` legitimately
   parses (UTC midnight) — the formatter renders it rather than inventing a rejection;
   the pin now pins the parse behavior.

## Re-certification (all on the FINAL tree)

lint ✓ · `tsc --noEmit` ✓ (`noImplicitAny` + `noUnusedLocals`/`noUnusedParameters`) ·
unit **1099/1099** (41 files) · the canonical build green (the ADR-020 warning the only
stderr) · the cold 5-chunk e2e **516/516** (136+151+69+90+70 — every chunk first-pass) ·
the register tripwire **249/130/0-stale/119** — the exact hold (no new playwright
scripts; the expectation stated BEFORE the measurement) · the live curl battery (the
unpadded-legal create → 201 [was the false 400], the inverted mix → 400 with the
ordering copy [was 201], the folder parentId "" → 201 [was 400], the probe rows
deleted) · the live agent-browser battery (the LEGACY dev-db "9:00" row opening its
edit dialog at "09:00", the exam create→edit round-trip showing the entered local
time) · the five `docs/screenshots/123-*.png` evidence frames (non-blank-verified) ·
`.env.example` verified current (no new env vars). **Standing debt: ZERO.**

## Docs chain

README badge 1615 + the Session-123 row + the census lines (incl. the two stale spots
the doc digests surfaced); AGENTS commands 1099/516 + the S123 lessons ×4 + the
touch-target exception + the reference-measurement doctrine in Conventions; CLAUDE
Unit-line 1099 + the BX seam tail; vitest header 1099 (41 files); PAD v1.3.31 (the
revision block + the ADR-003/ADR-020/§8.1/§8.4 reconciliations + the limiter census);
the cert-script 516 census re-tag; the master remediation-plan header → Batch BX; the
SKILL doc census + the §11 map fix + AP-131; `worklog.md` (this cycle's entry); this
record.
