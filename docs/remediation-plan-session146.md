# Remediation Plan — Session 146 (Cycle 96, Batch CU)

> Status: PLANNED (pre-change record — the immutable plan; the as-executed
> close lives in §6). Written before any source change, per the standing
> doctrine ("write the cycle plan into docs/remediation-plan-sessionN.md
> BEFORE any source change").
>
> Operator directive: refresh the workspace, re-read the doc chain
> (AGENTS/CLAUDE/README/PAD/SKILL + session_163/164 +
> remediation-plan-session145 + worklog), validate against the codebase,
> audit with the repo-included skills (skills/web-application/SKILL.md the
> primary; the skills catalog for the rotation), iterate toward
> visual/functional parity with omni-study1.base44.app (agent-browser-era
> scripts, live reference login, mobile-navigation attention, the
> Tailwind v4 bug watch), provision `.env` with
> `DATABASE_URL="file:../db/custom.db"` + the repo-root `db/`, validate
> the vitest/playwright suites, remediate TDD-first, capture evidence
> frames, update the doc chain, push via the SSH wrapper. The repo's
> `skills/` folder stays excluded from code checking, testing, and
> compilation. Proceed with best judgement on the remaining open
> questions (the operator's standing instruction).

## §0 Scope, method, cold baseline, live parity

**Workspace (the 38th continuation).** Fresh clone at `dd656e0` on `main`
(the Batch CT fix `a680eb8` + the operator's session_163/164 transcript
commit `dd656e0`). Environment provisioned per the recipe: `bun install`
(510 pkgs), `.env` from `.env.example` (`DATABASE_URL="file:../db/custom.db"`),
`db:push` + `db:seed` (the demo account + seeded rows, `db/custom.db`
389 KiB), Playwright Chromium 153 (headless-shell 1243, matching the
repo's playwright 1.63.0), the dev daemon live on :3000 (verified stable
across tool calls; `curl /login` → 200).

**Cold baseline (before any work):**

| Gate | Result |
|---|---|
| `bun run lint` | ✓ 0 errors |
| `bun run typecheck` | ✓ 0 errors |
| `bun run test` (Vitest) | ✓ 1503/1503 (48 files) — the documented S145 final state exactly |
| `node scripts/drawer-check-s14.mjs` (both hosts, live reference login) | GREEN — **the 61st consecutive no-Tailwind-v4-mobile-nav-bug confirmation** (backdrop oklab(0 0 0 / 0.2) + blur(4px); 288px white panels; 20 links; no footer; Escape-close superset) |
| `node scripts/parity-probe-s142.mjs` (both hosts, live reference login; REF_PROBE_* exported) | **DESKTOP CHROME: MATCH** — all five formal checks (sidebar outer width, nav link count, first-links order, mainX, mainWidth) |

**Baseline noise observed (recorded, not findings):** none.

**Probes run BEFORE the plan (the doctrine — probe, don't guess):** the
two audit subagents carried their own probes; every M/L finding below
was then re-verified by direct read of the current tree before this
plan was written (the anchors are in §1).

## §1 The audits (Mode-C, read-only subagents; every M/L finding re-verified by direct read)

Per the s145 closing directive — "the audit rotation continues (the
FE/views + auth/crypto/infra axis just swept; the entities/factory axis
one cycle fresh)" — plus the standing recent-changes focus ("particularly
on the recent code changes"):

1. **Audit A — the Batch CT recent-changes audit** (the `a680eb8` diff
   itself: the CT1 completion-window set, the CT2 supersede tx, the CT3
   gradient CTAs, the CT4 budget recount, and every delivered test leg
   audited for honesty): **0C / 0H / 0M / 2L / 2I**. **All thirteen CT
   claims verified DELIVERED at the source level** — the claims table
   CONFIRMED on every row (the census arithmetic machine-verified
   1503/48 + 612 = 150+187+91+95+89 = 2115; every CT e2e leg traced
   assertion-by-assertion against the pre-fix behavior — no
   unfalsifiable leg, no duplicate pin). The Ls: **A-L1** — the
   verification-token supersede siblings remain un-transacted (the
   CT2 family residual): `resend-verification/route.ts:79-88`
   (deleteMany + create) and `register/route.ts:146-161`
   (deleteMany + user.update + create — three sequential un-transacted
   writes in the existing-unverified branch; the fresh branch's
   `user.create` + `token.create` pair at :180-205 rides the same
   family) — concurrent same-account requests interleave
   delete/delete/create/create and leave TWO live 15-min OTP codes
   (materially weaker than CT2: the prune is expired-only,
   verify-email consumes ALL tokens inside its own `$transaction` on
   first verify, so the extra code dies at verification — but it is
   the same BZ7/CE5 interleave family the CT2 rationale names);
   **A-L2** — the stale local budget breadcrumbs in
   `resilience.spec.ts` contradict the recounted 9/10 (the CT4 recount
   fixed the s23-header cross-reference but left the in-file
   per-cycle breadcrumbs understating the count: `:657` "4 → 5/10",
   `:938` "4/10", `:1331` "4 → 5/10", `:1471` "5/10 → 7/10 … the 409
   probe below is the 8th", `:1521-1522` "8/10 → stays under the cap"
   — machine count = 9, both now and at `b4a76a5`, so `:657` was
   miscounted at write time; a future author trusting "5/10" could add
   ~4 demo import POSTs and 429 chunk 3 — the exact hazard the recount
   exists to prevent; the s140 doc-drift class reborn). The Is: I-1 the
   break-mode terminal state has no re-latch (cosmetic — no POST path
   in break completion; §5); I-2 the CT3 e2e leg pins the gradient but
   not the shadow (taken as the §3 rider).

2. **Audit B — the entities/factory + data-layer axis** (two cycles
   stale — the S143/CR-era sweep): **0C / 0H / 1M / 2L / 4I**. The axis
   is fundamentally sound: **all eight historically-real families
   re-verified CLOSED** (ownership scoping — every factory query
   userId-scoped, P2025→404 fail-closed, the in-tx re-read, the
   folders cycle-guard chain; route authz — requireUser-first +
   limiter-before-parse across 59 route shells, the one documented
   S139/CN11 id-length deviation; error taxonomy — subclass-first,
   uniform `{error}`, zero stack/message leaks; the CR7 delegate
   pattern — zero `as any` in src, the one documented import cast, the
   construction-time resolution check; the sequence-CAS family — the
   per-collection ticket in `fetchAndSet`, the per-id toggle chains,
   the picker-view tickets; the rate-limit budget keying — every write
   family keyed per-user, the auth laddering intact; the cascade
   integrity — all 22 userId relations Cascade, delete-account the one
   cascade write; validation completeness — field-by-field coverage of
   all 16 factory schemas vs schema.prisma, the refinements intact).
   The M: **B-M1** — the multipart upload stores the client-controlled
   part Content-Type (`mime`) with no length/charset bound
   (`files/route.ts:174` — `mime: entry.type || "application/octet-stream"`
   verbatim): the sibling import door caps the IDENTICAL column at 100
   printable-ASCII chars (`data-import.ts:731` `"files.mime": 100` +
   the charset guard at :1400-1415) with the stated rationale "a
   poisoned oversized mime rode FILE_METADATA into EVERY files list
   GET (the CE7 bloat class)" — that rationale applies equally here,
   but the interactive door was never given the cap; a hand-crafted
   multipart body writes a ~2 MiB mime per row, and ~500 rows × every
   `GET /api/files` list serializes ~1 GB of JSON per read (the
   unbudgeted read posture amplifying row bloat sitewide). The Ls:
   **B-L1** (= A-L1, the OTP re-issue pairs); **B-L2** — the files
   multipart branch answers 413 for ANY body-read failure
   (`files/route.ts:119-124` — the bare `catch` labels a mid-stream
   client abort or proxy hiccup "too large" with size-remediation copy
   that cannot help it; the S139/CN6 discrimination taught the import
   route exactly this — `import/data/route.ts:221-235` — and the files
   POST never adopted it). The Is: I-1 calculator/history POST is the
   sole unthrottled write method (documented trim exception) + the
   census is file-granularity so a per-method gap is invisible (§5);
   I-2 the two parallel sequence-CAS implementations (data.ts inline
   vs the extracted `createFetchSeq` — semantics identical; §5);
   I-3 `schoolName`/`fullName` stored untrimmed at the boundary (§5);
   I-4 the `withUserParams` id-length-guard-before-requireUser
   deviation (the documented S139/CN11 no-oracle posture — no action).

**Every M/L finding above was re-verified by direct read of the
current tree before this plan was written** — B-M1 at
files/route.ts:143-152 (the BW13 name cap — the 200-char/400
precedent the mime guard mirrors) + :169-184 (the verbatim mime write;
`FILE_METADATA` selects `mime: true`, riding every list GET) +
data-import.ts:726-735 (the `"files.mime": 100` cap with the CE7
rationale) + :1395-1415 (the printable-ASCII admission set, empty
still passes) — A-L1/B-L1 at register/route.ts:141-168 (the
deleteMany → user.update → create triple, un-transacted) + :170-205
(the BZ9 P2002-catch create pair) + resend-verification/route.ts:69-88
(the deleteMany → create pair) + forgot-password/route.ts:78-97 (the
CT2 batch-`$transaction` precedent this fix mirrors) +
files/folders/[id]/route.ts:64 (the interactive `$transaction(async (tx)`
precedent for the data-dependent pair) — A-L2 by grep of the five
stale breadcrumb lines — B-L2 at files/route.ts:119-124 (the bare
catch) + import/data/route.ts:221-235 (the CN6 discrimination shape
this fix copies) + `tests/http-body.test.ts:124-136` (the
BodyTooLargeError → 413 mapping unit-pinned).

## §2 Findings → the CU set

| ID | Source | Severity | Defect | Fix |
|---|---|---|---|---|
| CU1 | B-M1 | Medium (data-integrity/bloat: a hand-crafted multipart part Content-Type writes an unbounded `mime` that rides every files list GET — the import door caps the identical column, the interactive door never got the cap) | `files/route.ts:174` stores `entry.type` verbatim (no length, no charset bound) | The multipart mime guard: the `UPLOAD_MIME_MAX_CHARS = 100` + `isPrintableAsciiMime` seam in `http.ts` (the import door's admitted set exactly); the route rejects a non-empty over-long or non-printable mime with 400 (the BW13 name-cap copy pattern); the unknown-type `""` shape keeps falling back to the octet-stream default |
| CU2 | A-L1 + B-L1 (the S142-carried standing deferral, finally landing) | Low (concurrent same-account race leaves two live OTP codes — the older inert by the findFirst-desc + the consume-all verify tx; no new attacker capability; the CT2 interleave family) | The register re-issue triple (:146-161), the register fresh pair (:180-205), and the resend pair (:79-88) run as un-transacted awaits | The OTP re-issue transactional set: the register existing-branch triple in ONE batch `$transaction([deleteMany, user.update, create])`; the fresh-branch pair in the interactive `$transaction(async (tx) => …)` (the folders/[id] precedent — the token data depends on the created user's id; the P2002 catch moves around the tx, same external shape); the resend pair in the batch `$transaction([deleteMany, create])` (the CT2 mirror exactly) |
| CU3 | B-L2 | Low (a mid-stream client abort answers a confident 413 with size-remediation copy — the wrong status on an edge path) | The files multipart body-read catch is bare (`files/route.ts:119-124`) | The CN6 discrimination: `if (err instanceof BodyTooLargeError) return errorResponse(413, …); throw err;` — the import route's exact shape |
| CU4 | A-L2 | Low (doc-drift: five in-file budget breadcrumbs understate the demo import count — the miscounted-at-write-time class the CT4 recount hunts) | resilience.spec.ts's per-cycle breadcrumbs say 4/10, 5/10, 7/10, 8/10 while the file carries 9 | The breadcrumb recount: re-anchor the five lines to the present-tense 9/10 arithmetic (the AK3 header-correction class — the census already machine-pins the census-visible 9) |
| CU5 | The doc chain | — | Census/lesson/revision updates for the whole cycle | README badge/census + the Session-146 row; AGENTS census + the S146 lessons; CLAUDE counts; PAD v1.3.54; SKILL census; the vitest header re-anchor; the cert re-tag (the new chunk map); the plan §6 as-executed close; `docs/session_165.md`; the worklog Session-157 entry; the `.env.example` contract re-verified |

## §3 Per-item design

### CU1 — the multipart mime guard (B-M1)

**The seam** (`src/lib/server/http.ts`, beside `MAX_UPLOAD_BYTES` — the
files-family constants' home; unit-tested via `tests/files.test.ts`):
`export const UPLOAD_MIME_MAX_CHARS = 100;` and
`export function isPrintableAsciiMime(type: string): boolean` — the
import door's admission set exactly (`/^[\x20-\x7E]*$/` — EMPTY still
passes: the unknown-type `""` shape must keep importing/falling back;
a legit mime is never non-ASCII per the type/subtype grammar).

**The route** (`src/app/api/files/route.ts`, after the BW13 name cap at
:150-152): the non-empty `entry.type` is checked — over-100 answers 400
"File types are limited to 100 characters." (the name-cap copy
pattern); non-printable answers 400 "File types must be printable ASCII
— control characters and non-ASCII text cannot be stored as a file
type."; the write keeps `entry.type || "application/octet-stream"` (the
empty/undefined fallback unchanged). The comment cites the import-door
mirror (the CE7 bloat class) and the audited rationale.

**The unit legs** (`tests/files.test.ts`, +5 — the file already imports
from `@/lib/server/http`): (a) admits the browser-real shapes
(`"text/html; charset=utf-8"`, `"application/vnd.openxmlformats-… "`,
the `""` unknown shape); (b) rejects the >100 length (150 printable
chars); (c) rejects CRLF (`"text/html\r\nSet-Cookie: pwn=1"`); (d)
rejects non-ASCII (`"текст/plain"`); (e) rejects the other control
family (TAB, ESC, DEL, NUL — the s144 mime-probe set).

**The census leg** (`tests/script-conventions.test.ts`, +1): the
FILES_ROUTE wiring pin — the route source contains
`isPrintableAsciiMime` + `UPLOAD_MIME_MAX_CHARS` (the drift guard; the
predicate semantics live in the unit layer).

**The e2e legs** (`tests/e2e/s14-hardening.spec.ts` — chunk 2; the
budget note: chunk 2's demo-user upload consumption is 2
(:139 the C3 multipart probe + :347 the link POST) → 4/20 with this
pair — free): (A) **the derivation tripwire**: a hostile 150-printable-char
declared part Content-Type on a .txt-named upload → 201 + the stored
mime `text/plain;charset=utf-8` — pinning that the e2e runtime's parse
path derives the mime from the FILENAME EXTENSION (Bun's registry) and
never delivers the declared type to the route, so a runtime switch
(a Node-hosted standalone, where the declared type rides verbatim and
the guard 400s it) fails HERE and forces the re-anchor instead of
surfacing as mystery behavior; (C) the clean round-trip: a .pdf-named
upload with `mimeType: "application/pdf"` → 201 + the row's `mime`
echo (`"application/pdf"` — the registry value) + the finally-delete
cleanup (green-on-arrival — the no-regression pin; the C3-leg
pattern).

**THE RUNTIME SPLIT (the drive-probe findings — the S145
prove-the-drive doctrine, applied until the truth surfaced):** the
multipart part's DECLARED Content-Type reaches the write only on the
NODE-parse path — the dev daemon stored a 150-char declared type
VERBATIM pre-guard (the probe: status 201, stored len 150 — the defect
and the drive both proven), and answers 400 with the guard's copy
post-guard (the RED→GREEN behavioral evidence for CU1 lives at the
dev-daemon layer — the layer where the defect is reachable). The
BUN-parse path (the e2e standalone — and every SHIPPED production
posture: `bun run start` + the oven/bun Docker image) DERIVES the
stored mime from the FILENAME EXTENSION through Bun's registry
(.txt → `text/plain;charset=utf-8`, .pdf → `application/pdf`,
.html → `text/html;charset=utf-8`; an unknown extension → "" → the
octet-stream fallback) and NEVER delivers the declared type to the
route — the write is structurally bounded on every Bun path (the
B-M1 bloat is unreachable there; the guard is the runtime-divergence
belt-and-suspenders for the Node-parse path — the documented
Bun-vs-Node name behavior is the exact precedent, now with a mime
twin). The misread that cost the diagnosis: the first probes looked
like "undici sanitizes the charset family" and "Bun replaces part
types" — the minimal repro + the extension-matrix probes
(.txt/.html/.pdf names vs declared types) isolated the registry
derivation. The unit legs pin the admission set; the census pins the
wiring; the derivation tripwire pins the e2e runtime's actual
semantics.

### CU2 — the OTP re-issue transactional set (A-L1/B-L1)

`src/app/api/auth/register/route.ts` + `resend-verification/route.ts`.
Three changes, one family (the S142-carried "register re-issue
transactional triple" deferral landing with its named BT3 pattern):

- **The register existing-unverified branch** (:146-161): the
  deleteMany → user.update → create triple becomes ONE batch
  `await db.$transaction([db.verificationToken.deleteMany(…),
  db.user.update(…), db.verificationToken.create(…)])` — the CT2
  mirror (the data is all known up-front; the batch form).
- **The register fresh branch** (:179-205): the create pair becomes
  the interactive `await db.$transaction(async (tx) => { const user =
  await tx.user.create(…); await tx.verificationToken.create({ data:
  { …tokenData, userId: user.id } }); })` — the folders/[id] precedent
  (the token data depends on the created id); the S125/BZ9 P2002 catch
  moves around the WHOLE tx (the unique-constraint rejection rolls the
  pair back identically — the loser's token was never stored, the
  uniform `{ok:true}` shape unchanged); `hashPassword(password)` stays
  inside the update/create data as today.
- **The resend pair** (:79-88): the CT2 mirror exactly — the batch
  `db.$transaction([deleteMany, create])`; `generateVerificationCode()`
  + `hashOtpCode(code)` stay outside (the mint precedes the tx, as
  the forgot-password token mint does).

**Pins (the CT2 doctrine — the interleave is not externally drivable
from an e2e client; the census holds the wiring; the auth-flows
register/resend journeys re-prove the flows):** three census legs in
`tests/script-conventions.test.ts` — the existing-branch marker
(`db.$transaction([` + the triple inside register's source), the
fresh-branch marker (the interactive form + `tx.user.create` +
`tx.verificationToken.create`), the resend marker (the CT2-leg shape
against the resend route). RED pre-fix: zero `$transaction` markers in
either route.

### CU3 — the files 413 discrimination (B-L2)

`src/app/api/files/route.ts:119-124`. The catch becomes
`catch (err: unknown) { if (err instanceof BodyTooLargeError) return
errorResponse(413, "Files are limited to 2 MiB."); throw err; }` —
the import route's exact CN6 shape (the typed seam exists; the import
of `BodyTooLargeError` joins the existing `@/lib/server/http` import
line). **Pin:** one census leg — the FILES_ROUTE contains
`instanceof BodyTooLargeError` (the CN6-leg mirror). The behavioral
leg is not drivable (a mid-stream abort cannot be forced from the
Playwright API deterministically — the CN6 precedent was census-pinned
for the same reason).

### CU4 — the resilience breadcrumb recount (A-L2)

Five prose edits in `tests/e2e/resilience.spec.ts` (:657, :938, :1331,
:1471, :1521-1522): each stale "X/10" breadcrumb re-anchored to the
present-tense 9/10 arithmetic (collapse the per-cycle history into the
current count with the dated note — the AK3 header-correction class;
the CT4 census already machine-pins the census-visible 9 so the count
stays re-derivable). No test-count change (comments only).

### The rider — the CT3 shadow pin (A-F4, taken)

The existing S145/CT3 e2e leg in `tests/e2e/s21-data-export.spec.ts`
gains two computed-style assertions: both CTAs' `boxShadow` is not
`"none"` (the `.sf-gradient-shadow` half of the CT3 convention —
previously unpinned; dropping the class would have passed green).
GREEN-on-arrival (the class landed at CT3); a regression pin, not a
RED leg. No test-count change (assertions inside the existing test).

### CU5 — the doc chain

README badge `2115` → **2127** + the Session-146 row; AGENTS.md
commands-table census (1503 → **1513** unit, 612 → **614** e2e, the
5-chunk map 150+**189**+91+95+89) + the S146 lessons block; CLAUDE.md
counts; PAD v1.3.54 (the revision block + the §11 closure row); the
SKILL census (both sites); the vitest header re-anchor (per-file:
files +5, script-conventions +5); the cert re-tag (chunk 2 187 → 189,
census 612 → 614); the plan §6 as-executed close;
`docs/session_165.md`; the worklog Session-157 entry; the
`.env.example` contract re-verified against every env var the code
reads (unchanged unless the audit found drift — it found none).

## §4 Execution order (TDD)

1. **RED legs first** (against the pre-fix tree):
   - The unit REDs: the five CU1 predicate legs (the seam exports do
     not exist yet — the import failure IS the red) + the five census
     legs (CU1/CU2×3/CU3 markers absent in the routes).
   - The drive probes: DONE at plan time (the two hostile-mime probes
     against the dev daemon — the 150-char mime stored verbatim; the
     charset family sanitized by the parser — see §3 CU1).
   - The e2e REDs: the CU1 leg A against the PRE-FIX build
     (`bun run build` first; `rm -f db/e2e.db` + the targeted
     s14 spec run) — 201 vs the expected 400.
2. **Implementation:** CU1 the seam + the route guard; CU2 the three
   tx sites; CU3 the discriminating catch; CU4 the five prose edits;
   the rider the two shadow assertions.
3. **Interim gates:** lint → typecheck → unit (expect 1513/1513).
4. **The e2e GREEN runs:** build → the targeted s14 legs + the
   rider-extended s21 leg (+ the auth-flows register/resend legs — the
   CU2 behavioral net).
5. **The evidence capture** (`scripts/capture-s146-evidence.mjs`, the
   s144/s145 precedent): the standing desktop + mobile-drawer frames +
   the mime-guard proof frames (the hostile length 400 with its copy +
   the clean 201 echo — machine-verified on the frame) + the files-view
   frame (the upload surface intact); self-verifying (exists, >10 KiB,
   byte-diverse, md5-distinct).
6. **Final tree:** build → the cold 5-chunk cert (150 + 189 + 91 + 95 +
   89 = 614) → the census re-anchors → §6 close → commit + SSH push.

## §5 Riders considered, deferred (with reasons)

- **A-F3 (the break-mode re-latch):** cosmetic — the break completion
  has no POST path (the branch toasts and returns), so the 00:00
  terminal state carries zero data risk; the reference's own
  terminal-state behavior is UNMEASURED (driving the live reference's
  break to completion costs wall-clock minutes and no probe pins it),
  so a behavioral change without a parity measurement is its own risk.
  Deferred to a focus-timer-family cycle with a reference probe.
- **B-I1 (calculator POST unthrottled + the file-granularity census
  blind spot):** the documented S130/CE6 trim exception — storage
  bounded at 500 rows by the in-tx trim; tightening the census to
  per-method granularity is a census-design change for its own cycle.
- **B-I2 (the two sequence-CAS implementations):** semantics
  identical, zero behavioral gain — a pure refactor; a
  refactor-cycle candidate (the S143 extraction left data.ts's inline
  twin deliberately).
- **B-I3 (schoolName/fullName trim):** cosmetic storage hygiene
  touching the validation seam with existing unit pins — a cheap
  rider for a validation-family cycle (watch the sent-keys/sentinel
  interplay).
- **B-I4 (the id-length-guard-before-requireUser deviation):** the
  documented S139/CN11 no-oracle posture — no change.
- **The NODE_ENV casing warning (the carried s145 deferral):** still
  deferred — it touches the boot-guard seam (instrumentation tests +
  the s22 boot-guard e2e family) which this cycle's audits did NOT
  sweep; deserves its own audit-verified cycle.
- **The carried S142/S145 deferrals:** the A-M3 stage-2 chunked sub-tx
  + resume token (needs its own ADR-021 contract-change cycle), the
  export streaming half, the post-sanitize entity-expansion re-check,
  the parseImportEnvelope duplication, the login stale-mint sibling,
  the delete-note popover no-auto-close rider, the unthrottled
  authenticated GET posture (BZ5 — the multi-instance PostgreSQL
  posture owns it), the prewarm/auth-verdict note. The register
  re-issue transactional triple — the named standing deferral — LANDS
  this cycle as CU2.

## §6 As-executed close

**The RED inventory (as it ran):** the unit REDs 10/10 as designed — the
five CU1 admission-set predicate legs (the seam exports absent: the
import failure IS the red, evidenced by the vitest run BEFORE the seam
landed) + the five census legs (the route markers absent). The e2e RED
against the PRE-FIX route: the hostile 150-char declared type answered
201 — the assertion RED held, but the post-fix leg refused to flip, and
the honest diagnosis reshaped it (the runtime-split finding below). The
DEV-DAEMON probes carry CU1's behavioral RED→GREEN: pre-guard the
150-char declared type stored VERBATIM (status 201, stored len 150 — the
defect at the layer where it is reachable); post-guard the same probe
answers 400 with the guard's exact copy.

**The runtime-split delta (the one place the plan's design changed under
execution):** the plan's §3 originally designed the e2e RED as "the
150-char declared type → 400" — under the e2e server that is UNDRIVABLE:
the BUN parse path derives the stored mime from the FILENAME EXTENSION
(Bun's registry) and never delivers the declared part Content-Type to
the route (the Node-parse path — the dev daemon — is where the declared
type rides verbatim; every SHIPPED production posture is Bun). The
diagnosis ladder (the §3 update records it in full): a `| head`
SIGPIPE-killed build serving a stale standalone (the interim REDs
"passed" against a tree that no longer existed — builds captured to
file from then on); the minimal repro + the Playwright-serializer dump
+ the extension-matrix probe + the live process dump isolating the
registry derivation. The CU1 e2e leg became the DERIVATION TRIPWIRE
(a .txt upload with a hostile declared type → 201 + the registry mime —
fails loudly if a runtime switch ever changes the semantics); CU1b
(the clean .pdf round-trip) ran green-on-arrival as designed. The leg
COUNT is unchanged from the plan (2) — the census math held.

**Green-on-arrival (as designed):** the CU2 census trio (the wiring
landed with the fix — the missing-pin class); the CU3 census leg; the
CU1b clean leg; the CT3 shadow rider (a regression pin, not a RED).

**Interim gates:** lint ✓ · tsc ✓ · unit 1513/1513 (48 files, +10) —
including the CQ6 machine gate catching AGENTS.md's stale census row
mid-edit (the doc-chain update and the cert re-tag rode the same edit,
as the gate demands).

**The cold 5-chunk cert (the FINAL tree):** chunk 1 **150 first-pass**
(3.0 m) · chunk 2 **189 first-pass** (4.3 m — the CU1 pair's chunk,
exactly the re-tagged 187 → 189) · chunk 4 **95 first-pass** (3.2 m) ·
chunk 5 **89 first-pass** (1.4 m) · chunk 3 hit the documented
BU1/P1008 environmental flake class (3 failures co-occurring with the
WebServer socket-timeout noise — the files-view family, the same class
S142/S143/S145 recorded) — the contention-free cold re-run was **91/91
first-pass** (4.0 m). **Census 2127 green** (1513 unit + 614 e2e).

**Evidence:** three `docs/screenshots/146-clone-*.png` frames (desktop
235 KiB, mobile drawer 64 KiB, the Files view with the clean upload row
209 KiB), self-verifying (exists, >10 KiB, byte-diverse, md5-distinct)
+ the machine proofs on the frame: the hostile declared type → 400
with the guard's copy (the dev daemon — the Node-parse path), the clean
.pdf upload → 201 + the registry mime echo rendering in the Files view,
the probe rows cleaned up after capture.

**The honest residuals:** A-F3 (the break-mode re-latch) and the §5
deferrals stand unchanged. The B-I2 data.ts inline CAS twin, the B-I3
trim rider, and the NODE_ENV casing warning remain logged for their
named future cycles.
