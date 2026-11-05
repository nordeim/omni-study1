# Session 159 — the s143 cycle transcript (Batch CR / Cycle 93)

> The compact record of the S143 remediation cycle. The formal plan:
> `docs/remediation-plan-session143.md`. The worklog entry: the Session-154
> block in `worklog.md`. This transcript follows the session-log
> conventions pinned from git (the s150-s158 lineage).

## The directive

Refresh the workspace; re-read the doc chain (AGENTS/CLAUDE/README/PAD/
SKILL + session_157/158 + remediation-plan-session142 + worklog);
validate against the codebase; audit with the repo-included skills
(`skills/web-application/SKILL.md` the primary), particularly the
recent code changes; iterate toward visual/functional parity with
`omni-study1.base44.app` (live comparison, mobile-navigation attention,
the Tailwind v4 bug watch); provision `.env` with
`DATABASE_URL="file:../db/custom.db"` + the repo-root `db/`; validate
the vitest/playwright suites; remediate TDD-first; capture evidence
frames; update the doc chain; push via the SSH wrapper. The repo's
`skills/` folder stays excluded from code checking, testing, and
compilation.

## The workspace (the 35th continuation)

A fresh clone at `d0af6cb` on `main` (the Batch CQ fix `4184366` + the
operator's session_157 transcript commit — the s142 final state). The
environment provisioned from scratch (bun install 510 pkgs, `.env` from
`.env.example`, db:push + db:seed — the repo-root `db/custom.db`
389 KiB, Playwright Chromium installed, the dev daemon live on :3000 via
the S32 subshell recipe).

## The cold baseline

lint ✓ · tsc ✓ · unit **1466/1466** (47 files) · the drawer check GREEN
(**the 58th consecutive no-Tailwind-v4-mobile-nav-bug confirmation**) ·
the desktop chrome probe **MATCH** (all five formal checks via
`scripts/parity-probe-s142.mjs`, REF_PROBE_* exported per the s141
secret-scan posture).

## The audits (read-only subagents; every M/L re-verified by direct read)

1. The Batch CQ recent-changes axis: **0C/0H/1M/4L/5I** — all eight CQ
   claims verified TRUE at the source level (the recursive-edge
   enumeration of the DOM walker: every edge bounded). The M: three of
   the eight fixes (CQ4/CQ7/CQ8) carried only source-text census pins,
   not behavior. The Ls: the vitest header's per-file arithmetic ("+7",
   actual +6), the CQ3 e2e leg's stale comment, the CAS value-compare
   ABA, the verify-email dead column.
2. The entities/factory rotation (five cycles stale): **0C/0H/0M/1L/3I**
   — the axis substantially clean, all eight SPECIAL-ATTENTION invariants
   re-verified holding. The L: sentKeysPatch's `key in parsed` walks the
   prototype chain — hostile PATCH bodies inject inherited functions
   into the write data → the 500 the 400-family taxonomy forbids
   (probed empirically pre-fix: the five-key write set, functions and
   all).

**Two pre-plan probes** (the doctrine — probe, don't guess): the
11-tag two-door corpus (the five NON-TEXT tags — script/style/textarea/
option/xmp, exactly sanitize-html's default nonTextTags — died whole at
the server door while their TEXT survived the DOM door's unwrap branch:
the CQ5-family residual, promoted to CR2) and the hostile-body
sentKeysPatch probe (B-L1 confirmed behaviorally).

**The prior-session hypothesis sweep** (the interrupted s143 run's
named items, re-verified independently): the mover Select's missing
accessible name VERIFIED (the only unlabeled combobox in the tree); the
import-router's three inline any-casts VERIFIED; the non-text asymmetry
VERIFIED by probe. Considered and declined: the quill-mount
"last-line-of-defense" guard (the mount's disposed/container guards
hold, the render-gate call is depth-bounded and browser-safe by
construction, and a swallow-the-throw shape risks masking the exact
regression class the CO1 gate exists to surface — recorded in the plan
§5).

## The cycle (the plan's §2-§3, executed)

CR1 the own-keys guard (hasOwnProperty.call — Zod strip-mode never
emits inherited keys as own keys, so the guard is lossless) + the
shared toErrorResponse PrismaClientValidationError→400 leg (the import
route's local BT1b, now every route's); CR2 the shared
NOTE_HTML_NON_TEXT_TAGS policy (the five-tag set constant in the policy
module — the DOM walker kills the set whole at ANY depth (before the
depth-cap collapse), the depth-cap collector skips non-text subtrees
(the cap branch was resurrecting script text past the cap — found by
the RED leg, fixed in the collector), and the server's nonTextTags is
explicit from the same constant (behavior-identical to the library
default, drift-immune)); CR3 the mover's aria-label + the
named-combobox e2e locator; CR4 the typed ImportDelegateOps lookup (one
documented index cast replacing three inline any-casts — `keyof
PrismaClient` is string|symbol, so the index key narrows through
`as string`); CR5 the sequence-ticket CAS (the per-field createFetchSeq
seam — the true fetchSeq idiom, a value never entering the comparison);
CR6 the importRestoreError pure seam (the catch's four named legs
extracted to data-import.ts, every leg behaviorally pinned against
synthetic errors — the censuses stay as marker backstops); CR7 the
verify-email dead-column drop; CR8 the comment-accuracy trio; CR9 the
doc chain.

## The honest corrections ledger

0. **The template rider (found LAST — by the evidence capture's live
   machine proof in real Chromium)**: a `<template>`'s children live in
   its inert `.content` fragment, never as direct children — the
   unwrap branch moved nothing and the container-family text died at
   the DOM door in real browsers while the server door keeps it.
   happy-dom keeps template children direct, so the unit corpus was
   structurally blind to it (the environment-boundary class again).
   Fixed with the `.content ?? child` source; re-verified by the full
   unit suite, a fresh tsc, a rebuild, and the affected e2e families
   re-run green (the render-gate corpus carries no templates).
1. The CR2 depth-cap leg's first RED exposed a second leak the plan's
   design had not named: the non-text check before the depth cap stops
   the WALKER's resurrection, but the cap branch's own subtreeText
   collector was re-collecting script text from BEYOND the cap — the
   collector now honors the non-text set too (skip the subtree entirely).
   The two-door contract holds past the cap, not just under it.
2. The CR1 http-body leg's first draft fired `void expect(...)` on a
   `.resolves` assertion (vitest rejects un-awaited promise assertions)
   and then `await` inside a non-async callback — both caught by the
   test runner itself before the GREEN run.
3. The CR6 delegation design: the first draft had the seam mapping
   ValidationError/unknown to their statuses; the honest boundary is
   NULL-delegation (the seam returns null for the shared-mapper
   families — toErrorResponse stays the single source, pinned in
   http-body; the seam's tests pin the delegation contract instead).
4. The CR4 comment's first draft quoted the old `(db as any)[model]`
   shape verbatim — which would have false-failed the new no-any-cast
   census (comments mentioning a pattern look like the pattern to a
   source-text census); reworded to describe the shape without the
   literal.

## The final gate

lint ✓ · tsc ✓ · unit **1490/1490** (48 files, +24) · build ✓ · the
cold 5-chunk e2e (the cert map unchanged at 150+187+87+95+87 — the
S143 pins re-anchored existing legs in place) · **census 2096 green**
(was 2072). Evidence: four `docs/screenshots/143-clone-*.png` frames —
the desktop, the mobile drawer, the notes-actions popover with the
mover combobox holding focus AND carrying its accessible name
(machine-verified in the capture), and the planted non-text legacy note
rendering (the five non-text texts machine-verified ABSENT from the
editor while the container family's text is present; the probe row
cleaned from the dev db after the capture — the demo-surface
convention). Docs: the full chain re-anchored (README badge/census +
Session-143 row, AGENTS census + the S143 lessons block, CLAUDE counts,
PAD v1.3.51, SKILL census, vitest header, cert re-tag, plan §6, the
worklog Session-154 entry, this record).

## Next cycle

The audit rotation continues (the FE/views + auth/crypto/infra axis is
one cycle fresh again after S142; the import/export + data-portability
axis is two cycles stale; the entities/factory axis just swept) — or
the A-M3 stage-2 with operator direction on the ADR-021 contract
change.
