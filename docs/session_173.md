# Session 173 — the S150 cycle (Batch CY)

The workspace was a FRESH CLONE at `669c83e` on `main` (the Batch CX
fix `3410ff1` + the operator's session_172 transcript commit; the
sandbox had reset between sessions). Environment re-provisioned
through the documented fresh-clone path: `bun install` (510 pkgs) ·
`.env` created from the current `.env.example`
(`DATABASE_URL="file:../db/custom.db"` +
`NEXT_PUBLIC_SITE_URL=http://localhost:3000` + `AUTH_SECRET=""` — the
dev posture) · `db/` at the repo root (`db:push` + `db:seed` → the
389 KiB seeded demo account) · chromium-1243 re-provisioned after the
fresh install raised Playwright's pinned browser build · the dev
daemon on :3000.

Cold baseline (before any work): lint ✓ · tsc ✓ · the full Vitest run
**1543/1543** (48 files — the documented S149 final state exactly) ·
the dev-server preflight GREEN (hydrated, navigation-stable) · the
drawer check GREEN (**the 65th consecutive no-Tailwind-v4-mobile-nav-
bug confirmation** — backdrop oklab(0 0 0 / 0.2) + blur(4px); 288px
white panels; 20 links; no footer; Escape-close superset) · the
desktop chrome probe **MATCH** (all five formal checks, live
reference login). Baseline noise: none.

The audits (Mode-C; every M/L finding re-verified by direct read by
the orchestrator before the plan was written):

- **Audit A — the Batch CX recent-changes axis** (the `3410ff1`
  diff): **0C / 0H / 0M / 0L / 0I — clean**. All five CX claims
  verified DELIVERED at the source level — CX1's sibling chains
  (`toggleTaskMyDay`/`toggleTaskImportant` riding the shared
  `taskToggleChains` map + the four view call sites rewired, the
  render-snapshot PATCH shapes gone) + CX2's members chain
  (`setStudyGroupMembers(groupId, update)` with the updater form +
  the add/remove rewires + the `savingMember` latch retention) +
  CX3's transport partition (429 / `isTimeoutError` /
  `status === 0` / the CF8 uniform line, in that order) + CX4's
  calculator guards (the `justEvaluated.current` `=` re-press no-op +
  the GPA/unit Save latches) + CX5's settings failure surface (the
  `loadFailed`/`retryCount` effect in the boot() inner-async shape +
  the honest copy + the `sf-alert-red` alert + Retry). The doc census
  machine-verified (README badge 2157, AGENTS 1543/614 + the chunk
  map, CLAUDE 1543, PAD v1.3.57, the SKILL census both sites, the
  vitest header +13). No new attack surface, no lock-order hazard.

- **Audit B — the entities/factory + data-layer rotation** (three
  cycles stale — the S146/CU-swept axis; the named next axis in the
  S149 closing directive). The full axis read — entities.ts (687),
  http.ts (526), server/auth.ts (183), validation.ts (591),
  db-path.ts (131), group-members.ts (76), the 616-line schema, and
  all 39 in-scope route files (dispatched as a read-only subagent,
  every M/L finding re-verified by direct read by the orchestrator):
  **0C / 0H / 0M / 1L / 5I**. All eight historically-real families
  re-verified CLOSED at their anchors: ownership scoping (every list
  `where:{userId}` + `[createdAt:desc, id:desc]` + `take:500`; the
  pre-check findFirst → NotFoundError; the guarded delegates re-read
  inside the tx; Flashcard through `deck:{userId}`; P2025→404),
  route authz (the 39-file census — zero ungated handlers), the
  error taxonomy (Zod→400, the 413 discrimination ordered before its
  parent, P2002→409/P2025→404/P2003→400/P2028→413, the static 500),
  the CR7 delegate pattern (one factory, zero drift), bounded
  readers (readJson 10 MiB; multipart 2 MiB+64 KiB; every list
  take-bounded), the CR3 own-keys patch discipline
  (`hasOwnProperty` in sentKeysPatch at every write site), the
  rate-limit keying (write 600 / upload 20, after auth before
  readJson at every site incl. the CW1 calculator completion), the
  Zod boundary (every JSON route parses through validation.ts). The
  finding, re-verified by direct read: **B-L1** the multipart
  `folderId` was the one remaining unbounded id atom
  (files/route.ts:191-199 — the raw form value reached `findFirst`
  verbatim while every other id rides the 64-char bound; the
  hand-validated multipart branch cannot Zod-parse binary, so it
  silently escaped both schema-family fixes). The Is: the limiter
  hard-cap eviction (the documented S121/BV9 trade-off), the
  unthrottled authenticated GET posture (the documented BZ5 family),
  the db-path percent-decode (dev-only), the withUserParams
  404-before-401 (no oracle), and the settings-route schoolName
  stored untrimmed — **the S146/B-I3 trim rider, PROMOTED into this
  cycle's fix set as its named validation-family cycle**, together
  with the S149/B-I4 note-tag silent-drop rider.

The plan (`docs/remediation-plan-session150.md`) written BEFORE any
source change and validated against the codebase (every anchor
re-read; the Zod-4 trim-ordering semantics probed empirically before
the design was frozen), then executed TDD-first.

**The RED inventory (as it ran):** the unit REDs **4/4** — the CY2
functional pair (validation.test.ts: the padded school name must
parse TRIMMED — pre-fix the schema returned `"  Lincoln High  "` —
and the whitespace-only value must parse to the `""` cleared state
with the bound still post-trim) + the CY1 wiring-census leg
(script-conventions: the `rawFolder.length > 64` guard ordered
BEFORE the `fileFolder.findFirst` call, carrying the no-oracle 404
copy) + the CY3 wiring-census leg (the addTag block's two drop-reason
markers).

**The S150 fixes:** CY1 the multipart folderId 64-char guard — the
S139/CN11 route-param convention verbatim (a >64-char id cannot
exist, so the honest status is the no-oracle 404, byte-identical to
the missing-row branch it precedes). CY2 the schoolName trim at the
validation ATOM — `z.string().trim().max(120).optional()`; one
canonical source now serves the settings route (stores
`prefs.schoolName` now-trimmed), the client card (already trimmed —
idempotent), AND the import profile patch (`importProfilePatch`
parses through the same schema; a padded schoolName in a hand-edited
envelope arrives normalized with round-trip integrity preserved);
the S146 plan's "watch the sent-keys/sentinel interplay" warning
resolved to a non-issue — the trim preserves key presence, so the
route's `!== undefined` filter and the import seam's
`PROFILE_PATCH_KEYS` whitelist keep working verbatim. CY3 the
note-tag honest feedback — the empty draft stays a no-op (nothing
was lost); the >24-char and duplicate drops now name their reason
through the aria-live toast stack (the "input cleared, nothing
happened, no reason" class closed).

**One census tripwire, tripped and closed as designed:** the CY3
block's +13 lines moved the hue-tokens notes-view register site
686 → 700 — the anchored leg failed on the full-unit run (the
census's designed mechanism: "the anchored leg fails when a
registered site moves"). Re-anchored with the maintenance note; the
site itself is byte-unchanged.

**Final gates: lint ✓ · tsc ✓ · unit 1547/1547 (48 files, +4:**
validation +2, script-conventions +2, plus the hue-tokens re-anchor)
· build ✓ (exit 0; the three fix wirings verified shipped in the
standalone chunks — the CY1 404 copy in the files route chunks, the
CY2 `.trim().max(120)` in both schema consumers' chunks, the CY3
toast in the client chunk; the 6 Turbopack warnings are the
documented db-path/instrumentation baseline — files untouched this
cycle) · the targeted e2e on the cycle's six surfaces (parity-5/7/8
+ s17-fresh-user + tasks + s14-hardening + mobile-navigation)
**236 legs: 235 green + 1 documented interplay** — the ad-hoc run
combined chunk 3's parity-session5 (the math/solve budget consumer,
1-2 real `ai:` requests by design) with chunk 2's s14-C1 exhaustion
pin in ONE boot, an artificial mix the 5-chunk map's per-chunk
re-boot exists to prevent; the C1 pin re-verified **27/27 on its own
cold boot** (the designed isolation restored) · the cold 5-chunk cert
on the FINAL tree **150 + 189 + 91 + 95 + 89 — every chunk
first-pass, ZERO code flakes** (chunk 3's single first-attempt
failure was the P1008 SQLite socket-timeout machine-load class —
root-caused by the exact Prisma error line naming
`prisma.fileFolder.create()` + the same-shape folder tests passing
immediately after + the clean 91/91 cold re-run; the co-occurring
socket-timeout/ai-chat noise lines are the documented classes) = the
e2e census 614/614 unchanged · **census 2161 green** (was 2157).**

**Evidence:** four `docs/screenshots/150-clone-*.png` frames (the
standing desktop 235 KiB + the standing mobile drawer 65 KiB — the
65th drawer-GREEN companion frame + the Files view 213 KiB [CY1's
surface] + the Notes editor tag row 208 KiB [CY3's surface]),
self-verifying (exists, >10 KiB, byte-diverse, dominant-share < 95%,
md5-distinct — the capture script's JSON verdict ok:true; dimensions
machine-checked 1440x900 / 390x844). The CY2 boundary atom's machine
proof rides the unit layer (the trim pair — a schema transform is
not screenshot-provable, the CW2 runtime-split precedent; the
Settings Profile card's own save already trimmed client-side, so no
visual changed).

**Docs:** README badge/census (2157 → 2161) + the Session-150 row;
AGENTS census (1543 → 1547) + the S150 lessons block (three lessons:
a boundary convention is only closed when the LAST channel joins it
— enumerate body/route-param/query/AND multipart; a trim belongs at
the ATOM, not at each consumer; a destroyed input demands its
reason); CLAUDE counts; PAD v1.3.58 (the revision block + the three
§11 closure rows); the SKILL census (both sites); the vitest header
re-anchor (+4 with the hue-tokens re-anchor note); the cert runner
unchanged (the e2e census untouched); `docs/session_173.md` (this
log); the worklog Session-161 entry; the plan §6 as-executed close;
the `.env.example` contract re-verified (no env-var reads changed
this cycle).

**Next cycle:** the rotation continues — the FE/views + auth/crypto
axis (swept at S149) ages first; the A-M3 stage-2 chunked sub-tx +
resume token stays its own ADR-021 cycle (carrying the B-L2 import
lock-hold finding); the db-path percent-decode (B-I3 of this
cycle's audit) is recorded for a db-path-family cycle; the
B-I census-granularity design change stays the named deferral.
