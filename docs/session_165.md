# Session 165 — the S146 cycle (Batch CU)

Workspace reset (the 38th continuation). Cloned at `dd656e0` on `main` (the
Batch CT fix `a680eb8` + the operator's session_163/164 transcript commit
`dd656e0`). Environment provisioned per the recipe: `bun install` (510 pkgs),
`.env` from `.env.example` (`DATABASE_URL="file:../db/custom.db"`),
`db:push` + `db:seed` (the demo account + seeded rows, `db/custom.db`
389 KiB), Playwright Chromium 153 (headless-shell 1243, matching the repo's
playwright 1.63.0), the dev daemon live on :3000.

Cold baseline (before any work): lint ✓ · tsc ✓ · unit **1503/1503** (48
files — the documented S145 final state exactly) · the drawer check GREEN
(**the 61st consecutive no-Tailwind-v4-mobile-nav-bug confirmation**) · the
desktop chrome probe **MATCH** (all five formal checks). Baseline noise:
none.

The audits (two read-only Mode-C subagents, every M/L finding re-verified by
direct read):

- **Audit A — the Batch CT recent-changes axis** (the `a680eb8` diff):
  **0C / 0H / 0M / 2L / 2I**. All thirteen CT claims verified DELIVERED at
  the source level — the claims table CONFIRMED on every row (the census
  arithmetic machine-verified 1503/48 + 612 = 150+187+91+95+89; every CT
  e2e leg traced assertion-by-assertion against the pre-fix behavior — no
  unfalsifiable leg, no duplicate pin). The Ls: **A-L1** — the
  verification-token supersede siblings remain un-transacted (the CT2
  family residual): resend-verification's deleteMany+create pair and
  register's re-issue triple (deleteMany → user.update → create) plus the
  fresh-account pair (user.create → token.create, the BZ9 P2002 branch);
  **A-L2** — five stale in-file budget breadcrumbs in resilience.spec.ts
  understate the recounted 9/10 demo import POSTs (one miscounted at write
  time — "4 → 5/10" when the CS5 POST was the 9th). The Is: the break-mode
  terminal re-latch (cosmetic, no POST path — deferred); the CT3 shadow
  half unpinned (taken as the rider).

- **Audit B — the entities/factory + data-layer axis** (two cycles stale —
  the S143/CR-era sweep): **0C / 0H / 1M / 2L / 4I**. All eight
  historically-real families re-verified CLOSED (the ownership scoping +
  P2025→404; the route authz across 59 shells; the error taxonomy; the
  CR7 delegate pattern — zero `as any` in src; the sequence-CAS family;
  the rate-limit keying; the cascade integrity — all 22 userId relations;
  the validation completeness — field-by-field across the 16 factory
  schemas). The M: **B-M1** — the multipart upload stores the
  client-controlled part Content-Type (`mime`) with no length/charset
  bound (`files/route.ts:174`) while the sibling import door caps the
  identical column at 100 printable-ASCII chars with the stated CE7
  bloat rationale — the interactive door never got the cap. The Ls:
  **B-L1** (= A-L1); **B-L2** — the files multipart branch answers 413
  for ANY body-read failure (the S139/CN6 discrimination taught the
  import route, never adopted here). The Is: the calculator POST
  documented exception + the file-granularity census blind spot; the two
  sequence-CAS implementations; schoolName/fullName untrimmed; the
  id-length-guard-before-requireUser documented deviation.

The plan (`docs/remediation-plan-session146.md`) written BEFORE any source
change and validated against the codebase (every M/L anchor re-read), then
executed TDD-first.

**The RED inventory:** the unit REDs 10/10 as designed (the five CU1
admission-set predicate legs — the seam exports did not exist yet, the
import failure IS the red; the five census legs — the route markers
absent). The e2e RED against the pre-fix route: the hostile 150-char
declared type answered 201 — which began the diagnosis that reshaped the
leg (below). The dev-daemon probes: pre-guard the 150-char declared type
stored VERBATIM (status 201, stored len 150 — the defect proven at the
layer where it is reachable); post-guard the same probe answers 400 with
the guard's copy.

**THE RUNTIME SPLIT (the cycle's hard-won finding).** The e2e RED refused
to flip after the fix. The diagnosis ladder: a stale-standalone suspect
(a `| head` SIGPIPE had killed a build mid-write — the standalone kept
serving pre-fix code; captured-to-file builds from then on), then the
runtime-divergence hunt — a minimal repro (the route's Request/Blob
reconstruction idiom run under node AND bun), a Playwright-serializer dump
(lowercase part headers), an extension-matrix probe (.txt/.html/.pdf
names × declared types), and a live e2e-server process dump (bun, cwd
`.next/standalone`) — isolated the truth: **the declared part
Content-Type reaches the write only on the NODE-parse path** (the dev
daemon — where the probe proved the defect and the fix); **the BUN-parse
path (the e2e standalone, `bun run start`, and the oven/bun Docker image)
DERIVES the stored mime from the FILENAME EXTENSION through Bun's
registry** (.txt → "text/plain;charset=utf-8", .pdf → "application/pdf",
unknown → "" → the octet-stream fallback) and never delivers the declared
type — the write is structurally bounded on every shipped Bun posture.
The CU1 fix is the runtime-divergence belt-and-suspenders (the documented
Bun-vs-Node name behavior, now with a mime twin); its e2e leg became the
**derivation tripwire** (a .txt upload with a hostile declared type → 201
+ the registry mime — pinned so a future runtime switch fails loudly).

**The S146 fixes (all RED-proven at their reachable layers):** CU1 the
multipart mime guard — the `UPLOAD_MIME_MAX_CHARS` + `isPrintableAsciiMime`
seam in `http.ts` (the import door's admitted set exactly; empty admitted)
+ the route guard (the BW13 name-cap copy pattern; the unknown-type ""
shape keeps the octet-stream fallback). CU2 the OTP re-issue
transactional set (the S142-carried standing deferral landing): the
register re-issue triple in ONE batch `$transaction`, the fresh-account
pair in the interactive `$transaction(async (tx) => …)` (the folders/[id]
precedent; the P2002 catch moves around the whole tx — the loser's
rollback shape externally identical), the resend pair in the batch form
(the CT2 mirror). CU3 the files body-read catch discriminating
`BodyTooLargeError` from transport failures (the CN6 shape — only the
genuine over-cap answers 413). CU4 the five resilience breadcrumbs
re-anchored to the present-tense 9/10 arithmetic. The rider: the CT3 e2e
leg's shadow half (both /export CTAs compute a non-"none" box-shadow —
the sf-gradient-shadow utility was unpinned).

**Final gates: lint ✓ · tsc ✓ · unit 1513/1513 (48 files, +10) · build ✓ ·
e2e 614/614 = census 2127 green** (was 2115). The cold 5-chunk cert
(150 + 189 + 91 + 95 + 89): recorded in the §6 close below.

**Evidence:** three `docs/screenshots/146-clone-*.png` frames (desktop,
mobile drawer, the Files view with the clean upload row), self-verifying
(>10 KiB, byte-diverse, md5-distinct) + the machine proofs on the frame:
the hostile declared type → 400 with the guard's copy on the dev daemon
(the Node-parse path — the behavioral RED→GREEN), the clean .pdf upload
→ 201 with the registry mime echo rendering in the view.

**Docs:** README badge/census (2115 → 2127) + the Session-146 row; AGENTS
census + the S146 lessons block (four lessons: the runtime-split
reachability doctrine; the transaction family extends sideways; the
`| head` SIGPIPE build killer; the breadcrumb-is-part-of-the-budget);
CLAUDE counts; PAD v1.3.54 (the revision block + the §11 closure row);
the SKILL census (all three sites); the vitest header re-anchor; the cert
re-tag (chunk 2 187 → 189, census 612 → 614) + the runner's stale Expected
line (three cycles old — the doc-drift class); the plan §6 as-executed
close; this log; the worklog Session-157 entry; the `.env.example`
contract re-verified (no env-var reads changed this cycle).

**Next cycle:** the rotation continues (the entities/factory axis just
swept; the FE/views + auth/crypto axis two cycles stale again) — or the
A-M3 stage-2 chunked sub-tx + resume token (the one named standing
deferral — its ADR-021 contract change deserves its own cycle with its
own ADR). The NODE_ENV casing warning stays the cheap rider for the next
auth-family cycle; the B-I census-granularity design change and the
B-I3 trim rider are logged in the plan's §5.
