# Session 130 — Batch CD (Cycle 79): The Audit-Driven Hardening Cycle — The Overlay-Animation + Pre-Warm-Deadline + Stale-Closure-Guard Set

> Record of worklog **Session-129 / Batch CD**. Workspace: the Batch CC state `37468e3` + the
> operator's `c341120` (`docs/session_128.md`, the CC record) — the workspace survived the
> session break (`.env`, `db/`, chromium-1243, and agent-browser all intact; the push
> infrastructure was rebuilt before the push). Plan + execution record:
> **`docs/remediation-plan-session129.md`**.

## The directive

The operator directed the standing rhythm: refresh the workspace, re-read the doc chain
(`AGENTS.md`, `CLAUDE.md`, `README.md`, `PAD`, `omni-study1_SKILL.md`, `docs/session_127.md`,
`docs/remediation-plan-session128.md`, `worklog.md`, `docs/session_128.md`), re-validate against
the codebase, audit with the repo skills as rubrics (the `skills/` folder excluded from
checking/testing/compilation), iterate on visual + functional parity with
`https://omni-study1.base44.app/` (the mobile navigation menu the named focus, Tailwind v4 the
named suspicion class), keep the repo a production-ready functional SUPERSET, verify the
`.env`/`db/` contract (`DATABASE_URL="file:../db/custom.db"` + `db/` at the repo root) and the
vitest + playwright suites, plan remediation for everything found, execute with TDD (RED →
GREEN), capture evidence, update the docs chain, and commit + push to `main` via the SSH
wrapper.

## Baseline (cold, BEFORE any work)

lint ✓ · `tsc --noEmit` ✓ · unit **1191/1191** (44 files) · the canonical build green (REAL_EXIT,
foreground — the re-learned S128 lesson applied) · the cold 5-chunk e2e **560/560 —
144+177+72+93+74, every chunk first-pass** (per-chunk via `scripts/run-cert-chunk.sh`, the
kill-by-port → curl-verify → fresh-db procedure) · the register re-derivation **249 importers /
130 Usage-line carriers / 0 stale / 119 usage-line-free** (the 35th consecutive hold, the
expectation stated BEFORE the measurement; the calibrated instrument: `scripts/*.mjs` matching
`from "playwright(-core)"` exactly) · the Mode-C audit of the Batch CC diff (`37468e3`, 37 files,
+1367/−132): **all 13 CC claims re-verified TRUE against the tree** (CC1's whitelist iterating
`PROFILE_PATCH_KEYS`; CC2's rc accumulation + `exit "$rc"`; CC5's eviction-on-settle; CC6's NaN
guard; CC7's timeoutMs + the 20 s gate deadline; CC8's module counter + 5-cap; CC9's removals;
CC10's 19 composite swaps in the diff; CC11's per-key counts; CC12's docs; zero key material).

## Live parity (both hosts)

The standing reference battery held: the unlabeled hamburger (36px at [17,14], no
`aria-haspopup`), no `role=dialog`, the 288px (`w-72`) panel, the true-layer backdrop
`blur(4px)`, exactly 20 links, the landscape nav scroll 992 > 290. **This cycle's new
reference-specific probe (the CD1 measurement):** the reference's dialog overlay AND content
both compute `animation-name: enter`, `animation-duration: 0.15s` — the tailwindcss-animate
family (`.animate-in { animation: enter 0.15s }`, `.fade-in-0`, `.zoom-in-95` verified present
in its stylesheets); the overlay carries `data-[state=open]:animate-in fade-in-0
data-[state=closed]:animate-out fade-out-0` and the content the full shadcn family with an
inert 0.2s `transition-duration` (nothing transitions on a mounted dialog).

The clone battery on a FRESH reseed (kill-by-PID + `rm db/custom.db` + push + seed, the S32
daemon recipe, preflight GREEN): the labeled hamburger **"Open navigation menu"** (36×36 at
[16,14]), **`role=dialog` + "Navigation menu"**, **288px**, **20 links**, the true-layer
backdrop **blur(4px) + oklab(0 0 0 / 0.2)**, nav auto-close, /Notes clean (**390 = 390**),
scroll persistence **600 → 600**, landscape **992 > 301, scrolls** — **no Tailwind v4
mobile-nav bug, the 33rd consecutive live confirmation at baseline (the 34th at the post-fix
re-verification)**. Pre-CD1, the clone's dialog content measured `animation-name: none,
animation-duration: 0s` — the parity gap the audits surfaced.

## The audits (rotated fresh eyes)

- **Audit A — the app shell + routing + design tokens + auth screens** (last deep-covered CA,
  three cycles ago): `layout.tsx`, `page.tsx`, the full `globals.css`, `router.ts`, `theme.ts`,
  `site.ts`, the five-component shell family, the 688-line login surface, `lib/auth.ts`, the
  route wrappers. **0C/0H/2M/6L/6I.** The Ms: M1 the pre-warm deadline (CC7's fix stopped at
  `/api/auth/me`); M2 the inert animation family (the deps declared, the PAD documenting them,
  the import never existing — and the reference animating).
- **Audit B — the persistence + crypto/auth core + infrastructure configs** (also last covered
  CA): the schema in full, seed, db/db-path, server/auth, env-check, server/ai,
  instrumentation, all the configs, Dockerfile/compose, health/robots/sitemap, the export +
  import internals, the rate-limiter census, package.json, .env.example. **0C/0H/0M/4L/4I** —
  every prior-cycle fix verified HOLDING at the line level; the one brief-vs-code divergence
  was the code AHEAD (CB7's PATCH/DELETE write budget had landed; AGENTS.md's census line was
  the stale side — a doc-drift finding in its own right, folded into CD7).

Every M finding re-verified by direct read; the CD1 parity question settled by LIVE
MEASUREMENT on both hosts (not assumption), including the `translate` vs `transform`
composition question (Tailwind v4's `-translate-x-1/2` emits the standalone `translate`
property — the `enter` keyframes' `transform` composes with the centering; no
`slide-in-from-*` baking needed).

## The CD set (TDD — 8 unit + 4 e2e RED pins, all for the right reasons)

**CD1 (M, parity)** the overlay animation family WIRED: `@import "tw-animate-css";` after the
tailwind import; the reference's overlay fade classes restored on `DialogOverlay` +
`AlertDialogOverlay` (the clone's overlays carried NO animation classes at all); the notes
popover's exit family added (the census pin caught its absence); `duration-200` DROPPED from
the two primitives (**measured**: v4's `--tw-duration` feeds tw-animate-css — 0.2s vs the
reference's 0.15s); the dead v3 `tailwindcss-animate` dep removed. The clone now computes
**enter/0.15s on both nodes** — the e2e parity leg (the computed-style assertions) + the unit
census (the wiring + the class families + the dep guard). **CD2 (M)** the collection GET
deadline: `COLLECTION_GET_TIMEOUT_MS = 20_000` exported from data.ts (the `IMPORT_MAX_BYTES`
public-seam precedent) and threaded through `fetchAndSet` — the pre-warm, loadAll, the view
refreshes, and the post-mutation refreshes all bounded; the e2e stall leg holds all five
Dashboard pre-warm keys (the Splash still mounted at 5 s — the pre-fix-forever shape — and the
shell committed by 35 s). **CD3 (L-promoted)** the stale-closure guard:
`react-hooks/exhaustive-deps` re-enabled as an error (the scaffold's wholesale disable
predates every session of work; the probe found 6 live violations — one the exact CB1 class)
+ the six fixes (rum-panel `[load]`→`[refresh]`; calculator-view's ref-in-cleanup copy;
files-view's stable `toast` ×2; focustimer's outer-scope `mutations` dropped; notes-view's
stable `updateNote`) — all zero-behavior-change or mechanical, verified by read. **CD4 (L)**
the body-cap truth pair: the corrupted comment repaired + `BodyTooLargeError extends
ValidationError` mapped **413** in `toErrorResponse` (the same fault answered 400 here but 413
on the import route; the subclass checks first so the generic 400 branch cannot shadow it);
the BS2 e2e pin's status corrected with the rationale in-line. **CD5 (L)** the affirmative
boot line in `register()` — node_env + the db anchor through the same db-path seam the app
uses; a file: URL prints its path, anything else redacts to its protocol (a PostgreSQL URL
carries credentials and never reaches the log). **CD6 (L)** the auth-surface set: bare
`/reset-password` defaults to the reset view (the CA11 missing-token explanation finally
renders on the route it was written for); the forgot-success banner `role="status"`; the six
auth POSTs get the 20 s deadline; the two byte-identical route pages deduplicated into the
shared `AuthRoutePage`; the drawer backdrop's focus-visible ring (the pinned BS4 cycle asserts
order, not styling); the needless post-BY11 fragment; the OTP select-on-focus. **CD7 (L)** the
doc-drift set: CLAUDE.md 15→17-var (the S88/S121 provenance); AGENTS.md's rate-limiter census
refreshed to the CB7 truth. **CD8 (I)** the api-route dynamic census pin: every
`src/app/api/**/route.ts` declares `force-dynamic` or imports a dynamic-by-construction seam
(`@/lib/server/http` factories, `@/lib/server/auth`, `@/lib/auth`, `next/headers`) — zero
production diff (the current tree satisfies the invariant), the guard machine-enforced.

## The honest mid-run corrections

(1) The overlay-class unit pin's first shape was non-discriminating — a whole-file
`includes()` matched the CONTENT's animation classes (both live in one file and share the
family tokens), so the overlay leg passed pre-fix for the wrong reason; re-scoped to the
overlay component blocks. (2) The e2e overlay locator named `[data-radix-dialog-overlay]`, an
attribute this Radix version never sets (verified live: the overlay carries data-state, class,
data-aria-hidden, aria-hidden, style); re-scoped to the scrim class shape
`div[class*="bg-black/80"]`. (3) The CD6a pin's count-0 assertion hit the documented
substring-matching quirk (`getByRole("button", { name: "Sign in" })` also matches "Back to
sign in"); fixed with `exact: true` + the Welcome-heading identity. (4) The forgot-banner
journey pin needed the role=status correction applied to it (its text purpose unchanged). (5)
The rum-panel CD3 comment shifted hue-tokens' line-anchored residual register (134 → 138) —
both register directions failed loudly, the guard working as designed; re-anchored with the
provenance note.

## The re-cert

lint ✓ (the CD3 rule active, zero violations) · tsc ✓ · unit **1202/1202 (45 files — census
1191 → 1202, +11 exact: overlay-animation +4 the 45th file, data-store +2, http-body +3,
script-conventions +2)** · the canonical build green (REAL_EXIT) · the cold 5-chunk e2e
**563/563 — 145+178+72+93+75, every chunk first-pass on the final tree** (chunk 1 +1 the CD2
stall leg; chunk 2 +1 the CD1 parity leg; chunk 5 +1 the CD6a reset-default leg). The register
tripwire **249/130/0/119 — the exact hold (the 36th consecutive)**. The live battery ALL GREEN
on the fresh-seeded daemon — **the 34th consecutive no-Tailwind-v4-bug confirmation** — plus
the CD1 animation parity demoed LIVE (the Add Task dialog's overlay AND content computing
`enter`/`0.15s`, the reference-matched values). Three evidence frames in
`docs/screenshots/129-clone-*.png` (the mobile drawer; the open Add Task dialog; the desktop
dashboard), all verified non-blank.

## Final state

lint ✓ · tsc ✓ · unit **1202/1202 (45 files)** · build green (REAL_EXIT) · e2e **563/563**
(145+178+72+93+75) · tripwire **249/130/0/119** · **1765 green total**. Docs chain updated:
README (the chunk map + the badge 1765 + the S129 row), AGENTS.md (the census anchors + the
CB7-truth line), CLAUDE.md (the 17-var fix), PAD **v1.3.37** (the revision block + the §8.1
rows + the Total), the SKILL doc (the chunk map + the census + the animation-row wiring note +
the eslint posture + the three deliberate-variant notes), the vitest header, the cert-script
re-tags, the plan's §5, the worklog Session-129 entry, and this record. Committed to `main`
and pushed via the SSH wrapper (the remote ref verified equal to the local HEAD).
