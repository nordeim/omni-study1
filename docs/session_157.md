# Session 157 — the s142 cycle transcript (Batch CQ / Cycle 92)

> The compact record of the S142 remediation cycle. The formal plan:
> `docs/remediation-plan-session142.md`. The worklog entry: the Session-153
> block in `worklog.md`. This transcript follows the session-log
> conventions pinned from git (the s150-s156 lineage).

## The directive

Refresh the workspace; re-read the doc chain (AGENTS/CLAUDE/README/PAD/
SKILL + session_155/156 + remediation-plan-session141 + worklog);
validate against the codebase; audit with the repo-included skills
(`skills/web-application/SKILL.md` the primary), particularly the
recent code changes; iterate toward visual/functional parity with
`omni-study1.base44.app` (live comparison, mobile-navigation attention,
the Tailwind v4 bug watch); provision `.env` with
`DATABASE_URL="file:../db/custom.db"` + the repo-root `db/`; validate
the vitest/playwright suites; remediate TDD-first; capture evidence;
update the doc chain; push via the SSH wrapper. The repo's `skills/`
folder stays excluded from code checking, testing, and compilation.

## The workspace (the 34th continuation)

A fresh clone at `10d5a33` on `main`. The environment provisioned from
scratch (bun install 510 pkgs, `.env` from `.env.example`, db:push +
db:seed — the repo-root `db/custom.db` 389 KiB, Playwright Chromium
installed, the dev daemon live on :3000 via the S32 subshell recipe).

## The cold baseline

lint ✓ · tsc ✓ · unit **1449/1449** (47 files) · the dev-server
preflight GREEN · the drawer check GREEN (**the 57th consecutive
no-Tailwind-v4-mobile-nav-bug confirmation**) · mobile-navigation cold
**20/20**.

## The live parity battery (both hosts)

The reference logged in (the operator account). The mobile drawer
computed styles byte-matched (the 288px `w-72` white panel, black/20
backdrop at blur(4px), exactly 20 links, no footer; the clone's
Escape-close superset). The desktop chrome probe reworked this cycle
after the s141 probe's artifacts were diagnosed: (1) the reference's
login click renders a SPLASH containing `<main>` while the URL is still
`/login` — the s141 main-wait resolved on the splash and evaluated
inside the re-render window (the all-nulls artifact); (2) the reference
redirects its SPA shell to `/Dashboard` (the clone serves `/`); (3) the
reference's first `<nav>` is an inner 258px div (the s156-documented
probe artifact). The s142 probe settles on nav-links + heading
(pathname-agnostic), waits for the enabled submit button before
clicking, and checks the OUTER sidebar footprint:
`scripts/parity-probe-s142.mjs` — **MATCH** (260=260, 20 links in
identical order, mainX 260=260, mainWidth 1180=1180). **No mobile-nav
gap; no Tailwind v4 bug.**

## The audits (read-only subagents; every M/L re-verified by direct read)

1. The Batch CP recent-changes axis: **0C/0H/2M/3L/3I** — the Ms: the
   CP6 depth cap never counted the UNWRAP path (a purely disallowed
   chain recursed unbounded — the editor-mount RangeError class still
   open), and the export size signal counted UTF-16 code units while
   every cap counts bytes.
2. The FE/views + auth/crypto/infra rotation (two cycles stale):
   **0C/0H/1M/1L/2I**, substantially clean (every SPECIAL-ATTENTION
   invariant re-verified holding) — the M: the note-actions menu nested
   the notebook-mover Select inside `role="menu"` (keyboard-unreachable,
   the BZ3 class missed for 17 sessions); the L: the non-CAS appearance
   rollbacks.

## The cycle (the plan's §2-§3, executed)

CQ1 the unwrap-path depth increment + the explicit-stack subtreeText
collector (the rescue mechanism must not itself be the thrower —
happy-dom's own serializer/cascade throw at ≥4 000 nesting, probed and
recorded; the unit pin covers the cap semantics); CQ2 the byte-based
size signal (exportByteSize via TextEncoder — the client-imported seam
never reaches for Buffer; the seam returns `{json, bytes}` consumed by
the route header, the page prop, and the panel threshold; the s21 pin
re-anchored to real bytes); CQ3 the BZ3-pattern Popover conversion of
the note-actions surface + the keyboard-reachability e2e leg (the mover
is the FIRST tab stop; the AH1 delete leg re-anchored to the button
role); CQ4 the P2025 named-409 leg; CQ5 the two-door anchor alignment
(http/https/mailto at both doors — data:/relative hrefs die, rel rides
every survivor, whitespace-only src dies); CQ6 the AGENTS.md census
machine gate (the 603-vs-605 drift class, two cycles old, now
structurally loud); CQ7 the CAS-guarded appearance rollbacks; CQ8 the
verify-email tx-fresh sessionVersion mint; CQ9 the doc chain.

## The honest corrections ledger

1. The CQ1 pin design — the first RED shape (an 8 000-deep chain
   asserting not.toThrow) is NOT demonstrable under happy-dom: probes
   isolated the throw to happy-dom's OWN library JS (the
   [connectedToNode] mutation cascade and the innerHTML serializer
   recurse natively and throw at ≥4 000 nesting; the parser never
   throws). The ≥4k guarantee is browser-only; the shipped pin covers
   the cap SEMANTICS at a happy-dom-safe depth. And the depth-cap
   collapse's own `child.textContent` was a native recursion that would
   throw the same way — subtreeText (explicit stack) is the real fix.
2. The CQ2 first draft used Buffer.byteLength in the client-imported
   seam — caught by the import-graph check (the export panel imports
   data-export browser-side); shipped as TextEncoder.
3. The CQ3 e2e leg raced Radix's asynchronous roving focus — an Enter
   fired immediately after an Arrow key committed the still-focused
   CURRENT option (same value → no PATCH), and the arrow-landing point
   varied between runs. The deterministic shape polls for the landed
   focus (role, then text) before the commit key.
4. The chunk-3 cert failures were SELF-INFLICTED CONTENTION — the unit
   suite ran in a parallel tool call during the cert (2 failed, then 1
   on the re-run, the same BU1 files-view leg, green in 2.5s isolation,
   with the P1008 socket-timeout co-symptom). The contention-free re-run
   was 87/87 first-pass. Lesson recorded: run the cert ALONE.

## The final gate

lint ✓ · tsc ✓ · unit **1466/1466** (47 files) · build ✓ · the cold
5-chunk e2e **606/606** (150+187+87+95+87; the chunk-3 contention class
above, re-run clean) · **census 2072 green**. Evidence: four
`docs/screenshots/142-clone-*.png` frames (the notes-actions frame
machine-verifies the mover combobox holding focus inside the open
popover; the export frame shows the byte-based size signal). Docs: the
full chain re-anchored (README/AGENTS/CLAUDE/PAD v1.3.50/SKILL/vitest
header/cert re-tags/plan §6/worklog/this record).

## Next cycle

The audit rotation continues (import/export + data-portability one
cycle fresh; FE/views + auth/crypto just swept), or the A-M3 stage-2
with operator direction on the ADR-021 contract change.
