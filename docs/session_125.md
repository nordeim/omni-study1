# Session 128 — Batch CB (Cycle 77): The Audit-Driven Hardening Cycle — the Focus-Closure + Date-Round-Trip + Category-Dots Set

> Record of worklog **Session-127 / Batch CB**. Workspace: the Batch CA state `3176437` + the
> operator's `cde890e` (`docs/session_124.md`, the CA transcript) — the prior working window was
> interrupted after the parity-measurement phase (its plan and audit reports were never
> persisted; this window re-ran the full baseline, re-ran both rotated deep audits, re-verified
> every finding by direct read, and executed). Plan + execution record:
> **`docs/remediation-plan-session127.md`**.

## The directive

The operator directed the standing rhythm: refresh the workspace, re-read the full doc chain
(`AGENTS.md`, `CLAUDE.md`, `README.md`, `PAD`, `omni-study1_SKILL.md`, `docs/session_123.md`,
`docs/remediation-plan-session126.md`, `worklog.md`, `docs/session_124.md`), re-validate against
the codebase, audit with the repo skills as rubrics (the `skills/` folder excluded from
checking/testing/compilation), iterate on visual + functional parity with
`https://omni-study1.base44.app/` (the mobile navigation menu the named focus, Tailwind v4 the
named suspicion class), keep the repo a production-ready functional SUPERSET, verify the
`.env`/`db/` contract (`DATABASE_URL="file:../db/custom.db"` + `db/` at the repo root) and the
vitest + playwright suites, plan remediation for everything found, execute with TDD (RED →
GREEN), capture evidence, update the docs chain, and commit + push to `main` via the SSH
wrapper.

## Baseline (cold, BEFORE any work)

lint ✓ · `tsc --noEmit` ✓ · unit **1145/1145** (42 files) · the canonical build green · the cold
5-chunk e2e **538/538 — 142+161+71+93+71, every chunk first-pass** · the register re-derivation
**249 importers / 130 Usage-line carriers / 0 stale / 119 usage-line-free** (the 31st consecutive
hold, the expectation stated BEFORE the measurement) · the Mode-C audit of the Batch CA diff
(`3176437`, 51 files, +1819/−258): all 22 CA claims re-verified TRUE.

## Live parity (both hosts — agent-browser, mobile 390×844)

**Reference** (logged in `sepnetflix2023@outlook.com`): the standing battery held (the unlabeled
hamburger, no `role=dialog`, the 288px panel, `blur(4px)`, 20 links, the landscape 992>744
scroll). The cycle's probes: the calendar renders per-CATEGORY presence dots (the Nov 12 exam
cell carries one `w-1.5 h-1.5 rounded-full bg-red-500` inside a `div.flex.gap-0.5.mt-1`;
**events are dotless**; the dots go `bg-white` on the selected fill), the day detail groups by
uppercase category label (`p.text-xs.font-semibold.text-slate-500.uppercase.mb-2`) over tinted
`p-3 bg-red-50 rounded-lg border-l-4 border-red-500` rows inside `div.space-y-4`, the empty
copy reads "No events for this day", and the timetable renders **14 hour rows (7 AM–8 PM)**. The
reference's Tasks view carries 0 tasks (the task-row anatomy and the populated-Analytics
semantics unmeasurable there — the clone's pinned task-row superset stands; CB13 ships the
label-honest derivation).

**Clone** (`:3000`, demo session): the full battery GREEN at baseline and again post-fix —
**no Tailwind v4 mobile-nav bug — the 30th consecutive live confirmation.**

## The audits (rotated dual deep — the FE views family + the server/persistence family)

FE: **0C/0H/4M/4L**; server: **1C/4M/3L** (plus the known-findings set carried in from the
baseline window's lost reports — all re-derived and re-verified by direct read; every C/H/M
finding personally re-read line-by-line, the L set spot-verified). The consolidated set:
`docs/remediation-plan-session127.md` §1.

## TDD execution (RED → GREEN)

**RED**: 23 failing unit pins + 21 failing e2e pins, every one verified for the RIGHT reason —
the headline findings demonstrated live: CB1 `Expected: 1500, Received: 1` (the stale closure),
CB2 `Expected …T12:00:00.000Z, Received …T00:00:00.000Z` (the UTC-midnight storage), CB12
`Expected: 401, Received: 200` (no lockout), CB8's failure snapshot showing the delivered
message bounced back into the composer. **GREEN**: CB1–CB22 implemented; unit **1145 → 1171**
(42 files), e2e **538 → 559** (144+177+72+93+73).

## The honest mid-run corrections (the ledger)

(1) The CB1 clock API needed `runFor`, not `fastForward` (the jump fires each timer at most
once). (2) The CB4 "90%" needed `{ exact: true }` (the substring hit the "Progress to A (90%)"
label). (3) The CB6 row count needed the LABEL census (the container is flat — 96 children
pre-fix). (4) The CB8 composer assertion needed a settle window (the rollback landed inside the
poll window). (5) The CB9 edit pin needed the raw lowercase textContent (the "capitalize" class
is CSS-only). (6) The CB7-DELETE cap 620→310 (the POST-budget collision). (7) One census
arithmetic error corrected before commit (1171+559 = **1730**, not 1752). (8) A 24h-stale dev db
made the first live calendar probe read shifted dates — the live verification re-ran on a
FRESH `rm db/custom.db` + push + seed. Plus one LOST EDIT caught by the re-cert: the 14-row
HOURS change was swallowed by a failed batch script before its write — chunk 2's first
post-GREEN run read 12 rows; re-applied, rebuilt, re-run, exact.

## Re-certification (the FINAL tree)

The cold 5-chunk e2e **559/559 — every chunk first-pass**. The register tripwire
**249/130/0/119 — the exact hold (the 32nd consecutive)**. The live battery on the
fresh-seeded dev daemon: the standing mobile battery ALL GREEN, the calendar's four-dot
legend-order render + the grouped day detail + the dotless event, the 14-row timetable, the 90%
Math card, the "42% avg progress" Analytics card — all live-verified; five evidence frames in
`docs/screenshots/127-clone-*.png`, all verified non-blank.

## Docs chain

README (the chunk map + the import 10→25 MiB cap drift + the census), AGENTS.md + CLAUDE.md
(census), PAD **v1.3.35** (the revision block + §8.1 per-file rows re-measured, the table sums
verified: 1171 unit + 554 e2e), omni-study1_SKILL.md (the chunk map + the census anchors),
DEPLOYMENT.md §3 + `.env.example` (the CB14 production-warning guidance), the plan's §5, the
worklog Session-127 entry, and this record. **Census: 1171 unit + 559 e2e = 1730 green.**
