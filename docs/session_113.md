# Session 122 — Batch BV (Cycle 71): The Audit-Driven Hardening Cycle — the Merge-Guard + Owned-FK + Accent-Token Set

> Record of worklog **Session-121 / Batch BV**. Workspace: refreshed clone at `27be1d4`
> (the Batch BU state `92600b0` + the operator's `docs/session_112.md` transcript).
> Plan + execution record: **`docs/remediation-plan-session121.md`**.

## The directive

The operator directed the standing rhythm: refresh the workspace, re-read the full doc chain
(`AGENTS.md`, `CLAUDE.md`, `README.md`, `PAD`, `omni-study1_SKILL.md`,
`docs/session_111.md`, `docs/remediation-plan-session120.md`, `worklog.md`,
`docs/session_112.md`), re-validate against the codebase, audit with the repo skills as
rubrics (the `skills/` folder excluded from checking/testing/compilation), iterate on
visual + functional parity with `https://omni-study1.base44.app/` (the mobile navigation
menu the named focus, Tailwind v4 the named suspicion class), keep the repo a
production-ready functional SUPERSET, verify the `.env`/`db/` contract and the vitest +
playwright suites, plan + execute remediation TDD-style, capture evidence, update the docs
chain, and commit + push to `main` via the SSH wrapper.

## Baseline (cold, BEFORE any work — all green)

lint ✓ · `tsc --noEmit` ✓ (`noImplicitAny` on) · unit **1030/1030** (36 files) · the
canonical build green (exit 0 — the type gate live post-BU22e) · the cold 5-chunk e2e
**497/497** (135+145+61+90+66, fresh `db/e2e.db`, every chunk first-pass) · the register
re-derivation **249 importers / 130 Usage-line carriers / 0 stale / 119 usage-line-free**
(the 22nd consecutive hold, the expectation stated BEFORE the measurement) · the Mode-C
audit of the Batch BU diff (`92600b0` + the operator's `27be1d4`): every BU1–BU22 claim
re-verified TRUE against the tree, zero key material, all seven `120-clone-*.png` frames
present.

## Live parity (both hosts — agent-browser + DOM probes)

**No NEW parity gap; no Tailwind v4 mobile-nav bug — s121 re-confirmed (the 22nd
consecutive live confirmation).** The standing reference battery held: the unlabeled
hamburger, no `role=dialog` drawer-closed, 24 visible links drawer-open, backdrop
`blur(4px)`, `/Notes` overflow 416 > 390 (the reference's own defect), the landscape
drawer-nav scroll 992 > 290, and the task delete IMMEDIATE (F5 re-confirmed live: the
ellipsis menu → Delete → gone, zero confirmation). The clone battery GREEN: the labeled
hamburger (the a11y superset) + drawer (`role="dialog"`, 20 nav links, the 288px panel,
navigation → /Analytics + auto-close), `/Notes` clean at 390, the landscape 992 > 301,
the scroll persistence 600px carried through SPA navigation.

**Three reference measurements settled parity questions** (the DOM-authority rule):

- **N1 (the repeat pill):** the reference's repeat pill measures
  `rgb(237, 233, 254)` / `rgb(124, 58, 237)` — EXACTLY violet-100/violet-600, the clone's
  light-mode values (byte-identical parity at the default accent). The accent question is
  clone-internal (the reference's accent picker is a measured no-op): under the clone's
  7-accent superset the pill must follow the accent like its sibling chips do —
  **BV15** resolved it the `sf-subject-chip` way (the measured value expressed through
  the accent tokens).
- **N2 (the note editor):** the reference's New Note editor is a PANEL (title + notebook
  combobox + contenteditable + Save + icon close), NO Cancel — the clone matches; the
  s120 dialog-Cancel matrix stands extended.
- **N3 (the Focus Timer stats):** the reference's stats are a DIFFERENT anatomy
  (`bg-white rounded-xl p-4 text-center border border-slate-100` + a colored lucide
  glyph) — the clone's `StatCard` grid is a SUPERSET surface; its fallback tile was free
  to follow the accent (**BV15**).

## The audits

Two parallel deep audits against the `skills/web-application` rubrics (§5/§6/§7/§16 the
API surface; §8/§9/§12/§13 the frontend), every finding verified by direct read + live
probe: the API audit **3M/6L/8I**, the frontend audit **1M/3L/7I** — consolidated,
de-duplicated, reference-measured, and folded into the BV table
(`docs/remediation-plan-session121.md` §1). Verified-clean areas stated in the plan's
§0 (the §5 auth primitives, the rate-limit coverage, the §6 envelope, the §7
Zod-everywhere discipline, the §16 header/CSRF/bounded-read set, the BU1 stale-props
dialog class fully closed, the §9 selector discipline, the §12 palette pinning, the §13
label/aria/focus contracts). The non-gaps documented: the tasks-view instant delete (F5),
the no-Cancel dialogs (the matrix + N2), the bare `{ error }` envelope, the
force-dynamic posture.

## The BV set (TDD — RED first, then the source)

**RED:** 21 failing unit pins (event-merge +11, validation +2, secure-cookie +3, auth +1,
clear-cookie +3, owned-fks +3) + 4 failing e2e pins (BV6, BV11a, BV7 ×2), every pin
verified RED for the right reason on the pre-change tree. **GREEN: unit 1030 → 1054
(39 files); e2e 497 → 502 (135+147+62+90+68).**

- **BV1** the events single-leg ordering merge — `checkEventOrderingMerge` + the
  delegate's `beforeWrite` hook (a single-leg PATCH is compared against the STORED row).
- **BV2** the logout-side Secure derivation — `clearSessionCookie` mirrors the BU15
  `secureCookieFlag` (a plain-HTTP production logout no longer answers a Secure clear
  Set-Cookie that browsers drop).
- **BV3** the four BU env gates wired through `docker-compose.yml`.
- **BV4** the null-body 500s (register + preferences).
- **BV5** the practice-test questions blob bound at 100k.
- **BV6** the re-register password refresh (the newly typed password wins).
- **BV7** the owned-FK guards + the `OWNED_FKS` census registry (ten delegates wired).
- **BV8** the resend-verification prune. **BV9** the limiter HARD cap. **BV10**
  Date.parse ordering. **BV11** the OTP conditional single-use + forgot supersession.
  **BV12** the comma-joined proxy header. **BV13** a documented non-gap (the SDK's
  vision body type carries no `timeoutMs` — the audit's fix was a type error the build
  caught). **BV14** the schema comment.
- **BV15** the accent-token family — the 17-var `accentCssVars` set (the solid
  `--sf-primary-empty`, the AP3 triangle: interface + seven literals + seven boot-script
  lists), the `sf-repeat-pill` utility (the reference's MEASURED violet pill through the
  accent tokens), the StatCard fallback `bg-sf-primary`, the calendar today-cell tint
  accent-aware for free. Live-verified under blue light+dark AND violet byte-parity.
- **BV16** the dead-import sweep extended + the machine guard
  (`noUnusedLocals`/`noUnusedParameters` in tsconfig — the audit's 8 by hand + 13 more
  the compiler surfaced; enforced by typecheck AND the build).
- **BV17** the three non-unique keys. **BV18/19** the comment drifts + the memo.

## The honest mid-run corrections (four)

1. The BV5 pin's own wrapper arithmetic (39 chars, not 44).
2. **The BV1 string-fixture gap — the LIVE PROBE caught what the pins missed**: the
   seam's unit pins passed on string fixtures while the delegate passes the stored Prisma
   row (Date objects) — the `typeof` guard silently skipped and the first curl probe
   wrote the inverted span. Closed: the `epochMs` normalization + a Date-fixture unit
   pin + a wire-level e2e pin; the mid-run cert killed/rebuilt/re-run cold.
3. The BV13 audit recommendation was a type error (TS2353) — the guard experiment caught
   it during implementation; documented as the non-gap it was.
4. The AP3 triangle — the token addition to accentCssVars alone went RED at the S89/AP3 +
   S90/AQ1 pins; the complete three-site edit landed.

## Re-certification (all on the FINAL tree)

lint ✓ · `tsc --noEmit` ✓ (`noImplicitAny` + `noUnusedLocals`/`noUnusedParameters`) ·
unit **1054/1054** (39 files) · the canonical build green (exit 0, the type gate live) ·
the cold 5-chunk e2e **502/502** (135+147+62+90+68 — every chunk first-pass) · the
register tripwire **249/130/0-stale/119** (the exact hold) · the live curl battery (the
null bodies → 400/200-no-op, the single-leg inversion → 400 both directions, the foreign
FK → 404 "That subject does not exist.", the logout Set-Cookie symmetric with login) ·
the live agent-browser battery (the mobile drawer family, the scroll persistence, the
BV15 accent re-theme verified BOTH ways) · the six `docs/screenshots/121-*.png` evidence
frames (the before/after blue-accent pairs md5-distinct) · `.env.example` verified
current. **Standing debt: ZERO.**

## Docs chain

README badge 1556 + the Session-121 row + the census lines; AGENTS commands 1054/502 +
the S121 lessons ×4 + the ownedFks convention; CLAUDE Unit-line seam tail + the 17-var
set; vitest header 1054; PAD v1.3.29; the cert-script 502 census re-tag (after the DONE
line); the master remediation-plan header → Batch BV; the SKILL doc census + AP-127..129;
DEPLOYMENT.md §2/§8; `worklog.md` (this cycle's entry); this record.
