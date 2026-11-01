# Remediation Plan — Session 121 / Batch BV (Cycle 71)

**Status: COMPLETE** (executed TDD-style 2026-11-01 — the verification record is §5 below)
**Date:** 2026-11-01 · **Workspace:** refreshed clone at `27be1d4` (the Batch BU state
`92600b0` + the operator's `docs/session_112.md` transcript + the skills-catalog update)
· **Audit-driven hardening session** — the standing rhythm (audit the prior-batch diff,
ride the riders, re-certify cold).

---

## 0. Scope and Method

The operator directed the standing rhythm: refresh the workspace (`git pull` → `27be1d4`,
clean), re-read the full doc chain (`AGENTS.md`, `CLAUDE.md`, `README.md`, `PAD`,
`omni-study1_SKILL.md`, `docs/session_111.md`, `docs/remediation-plan-session120.md`,
`worklog.md`, `docs/session_112.md` — README/PAD + the SKILL doc/master plan digested via
two parallel read-only subagents while AGENTS.md/CLAUDE.md were read direct), re-validate
against the codebase, audit with the repo skills as rubrics
(`skills/web-application/SKILL.md` §5/§6/§7/§16 for the API audit, §8/§9/§12/§13 for the
frontend audit; `skills/` excluded from checking/testing/compilation — verified:
tsconfig/eslint/vitest all exclude it), iterate on visual + functional parity with
`https://omni-study1.base44.app/` (the mobile navigation menu the named focus, Tailwind v4
the named suspicion class), keep the repo a production-ready functional SUPERSET, verify
the `.env`/`db/` contract and the vitest + playwright suites, plan remediation for
everything found, execute with TDD (RED → GREEN), capture evidence, update the docs chain,
and commit + push to `main` via the SSH wrapper.

Method (the six-phase workflow): ANALYZE → PLAN (this document) → VALIDATE (every finding
re-verified by direct read + live probe BEFORE planning the fix — all 13 M/L findings and
the 2 fix-worthy I items were personally re-verified against the tree; the two parity
questions were measured live on the reference) → IMPLEMENT (smallest safe diff, TDD) →
VERIFY (cold re-cert) → DOCUMENT.

### Baseline (cold, BEFORE any work — all green)

lint ✓ · `tsc --noEmit` ✓ (`noImplicitAny` on) · unit **1030/1030** (36 files) · the
canonical build green (exit 0 — the type gate live post-BU22e; the ADR-020 warning the
only stderr) · the cold 5-chunk e2e **497/497** (135+145+61+90+66, fresh `db/e2e.db`,
every chunk first-pass) · the register re-derivation **249 importers / 130 Usage-line
carriers / 0 stale / 119 usage-line-free** (the 22nd consecutive hold, expectation stated
before the measurement) · the Mode-C audit of the Batch BU diff (`92600b0` + the
operator's `27be1d4`): every BU1–BU22 claim re-verified TRUE against the tree (BU1
key-remount line 579, BU2 `inAppDeliveryGates`, BU3 `parseTrustedProxyHops`, BU8
`sf-pill-blue`, BU21 SEED_DEMO gate, BU22e `ignoreBuildErrors` gone — comment-only
mention), zero key material, all seven `120-clone-*.png` frames present.

### Live parity (both hosts — agent-browser + DOM probes)

**No NEW parity gap; no Tailwind v4 mobile-nav bug — s121 re-confirmed (the 22nd
consecutive live confirmation).** The standing reference battery held: the unlabeled
hamburger, no `role=dialog` drawer-closed, 24 visible links drawer-open, backdrop
`blur(4px)`, `/Notes` overflow 416 > 390 (the reference's own defect), the landscape
drawer-nav scroll 992 > 290, the task delete IMMEDIATE (F5 re-confirmed on a live probe
task). The clone battery GREEN: the labeled hamburger (the a11y superset) + drawer
(`role=dialog`, 20 nav links, 288px panel, navigation → /Analytics + auto-close), `/Notes`
clean at 390, landscape 992 > 301, scroll persistence 600px carried through SPA
navigation.

**Three reference measurements settled parity decisions this cycle (the DOM-authority
rule):**

- **N1 (the repeat pill):** the reference's repeat pill is `rgb(237, 233, 254)` bg /
  `rgb(124, 58, 237)` text at 12px — EXACTLY violet-100/violet-600, the clone's current
  light-mode values (byte-identical parity at the default accent). The accent question is
  therefore CLONE-INTERNAL (the reference's accent picker is a measured no-op — it can
  never show a non-violet repeat pill): under the clone's 7-accent superset the pill must
  follow the accent like its sibling chips do (the `sf-subject-chip` precedent — the
  measured-at-violet value expressed through the accent tokens). → **BV15**.
- **N2 (the note editor):** the reference's New Note editor is a PANEL (title + notebook
  combobox + contenteditable + Save + icon close), NO Cancel — the clone matches. The
  s120 dialog-Cancel matrix (Exams/Classes carry Cancel; Events/Flashcards/Notes do not)
  stands; the auditor's "no explicit Cancel" observation on events/notes/flashcards is a
  **documented non-gap**.
- **N3 (the Focus Timer stats):** the reference's Focus Timer stats are a DIFFERENT
  anatomy (`bg-white rounded-xl p-4 text-center border border-slate-100` with a colored
  lucide glyph — no 48px solid tile) — the clone's `StatCard` grid is a SUPERSET surface;
  its violet-500 fallback tile is free to follow the accent. → **BV15**.

### The audits

Two parallel deep audits against the `skills/web-application` rubrics (§5/§6/§7/§16 the
API surface; §8/§9/§12/§13 the frontend), every finding verified by direct read + live
probe: the API audit **3M/6L/8I**, the frontend audit **1M/3L/7I** — consolidated,
de-duplicated, reference-measured, and folded into the BV table below. Verified-clean
areas (stated, not silently dropped): the §5 auth primitives (scrypt/HMAC/revocation/
no-enumeration), the rate-limit coverage (all 9 sensitive auth POSTs + per-user buckets),
the §6 envelope/status mapping, the §7 Zod-at-every-boundary (zero raw `request.json()`
reads), the §16 header/CSRF/bounded-read set, the BU1 stale-props dialog class (fully
closed across the app — every dialog rides the key-remount or set-form-before-open
idiom), the §9 selector discipline (zero fresh-object selectors), the §12 palette pinning
(BU20 holds — zero unpinned steps), the space-y/z-index/gradient traps, the §13 label/
aria-live/focus-lifecycle contracts.

---

## 1. The BV table (findings → fixes)

Severity per the Mode-C taxonomy. Every item was verified by direct read before planning;
the functional ones were additionally reproduced live (BV15 both surfaces, photographed).

### BV1 (High, data-integrity) — the events single-leg PATCH bypasses the BU22 ordering guard

- **Finding:** `eventUpdateSchema`'s `.check()` fires only when BOTH legs arrive together;
  the delegate's `update` does `findFirst` (existence only) → parse → write and never
  compares a single sent leg against the stored row. `PATCH /api/events/:id
  {"endDate": "<earlier-than-stored-start>"}` writes exactly the inverted span BU22 was
  written to prevent. The `validation.ts` comment even documents a "merge with the stored
  row" that no code implements.
- **Fix:** implement the documented merge — a pure `checkEventOrderingMerge(existing,
  writes)` seam in `validation.ts` (throws `ValidationError(END_BEFORE_START)` when a
  single sent leg inverts against the stored row's other leg, comparing `Date.parse`
  values — see BV10) + an optional `beforeWrite?: (existing, writes) => void` hook on
  `makeOwnedDelegate` that the `eventDelegate` config passes. Correct the comment.
- **Tests:** RED unit pins on the pure seam (endDate-only inversion vs a stored startDate;
  startDate-only inversion vs a stored endDate; the legal single-leg moves; the null leg)
  + the wire shape stays `eventUpdateSchema`-validated.

### BV2 (High, security) — `clearSessionCookie` still derives `secure` from NODE_ENV (the BU15 half-fix)

- **Finding:** BU15 made the SET path proxy-aware (`secureCookieFlag`) but the CLEAR path
  still reads `NODE_ENV === "production"` — on the documented plain-HTTP Docker posture a
  logout answers `Set-Cookie: sf_session=; Secure; Max-Age=0`, which browsers on a
  non-secure origin DROP (RFC 6265bis): the 7-day stateless session cookie survives
  "logout". `delete-account` is unaffected in practice (the user row deletion kills the
  token) — `logout` is the live hazard.
- **Fix:** `clearSessionCookie(response, options?: { secure?: boolean })` mirroring
  `setSessionCookie`; the logout route accepts the request and passes
  `secureCookieFlag(request.headers.get("x-forwarded-proto"), request.nextUrl.protocol)`;
  `delete-account` passes the same (it holds the request already).
- **Tests:** RED unit pins (the clear path honors the explicit flag; the default derivation
  unchanged for the fallback form).

### BV3 (Medium, deployment) — the four BU env gates are not wired through docker-compose

- **Finding:** `docker-compose.yml` declares only `AUTH_SECRET` + `NEXT_PUBLIC_SITE_URL`
  (app) and `DATABASE_URL` (init) — `SEED_DEMO`, `DISABLE_IN_APP_OTP`,
  `DISABLE_IN_APP_RESET`, `TRUSTED_PROXY_HOPS` are NOT declared, so the exact commands
  DEPLOYMENT.md §8 instructs (`SEED_DEMO=0 docker compose --profile init up`) are no-ops
  through compose (the env never reaches the container). The BU21/BU2/BU3 gates are
  unreachable on the shipped Docker path.
- **Fix:** app service gains `TRUSTED_PROXY_HOPS`/`DISABLE_IN_APP_OTP`/
  `DISABLE_IN_APP_RESET` (`${VAR:-}` passthrough defaults — each gate's documented
  default semantics preserved); the init service gains `SEED_DEMO` the same way. No
  DEPLOYMENT.md command changes (the commands become TRUE).
- **Tests:** config-only; validated by inspection (compose is not runnable in this
  sandbox — the standing docker-layout-sim posture).

### BV4 (Low, envelope discipline) — `register` + `settings/preferences` return 500 on a JSON `null` body

- **Finding:** both routes dereference the read body BEFORE Zod (`raw.fullName`,
  `raw.displayName`); `readJson` returns `JSON.parse("null") → null` and the property
  access throws → 500 "Something went wrong." Every other route feeds the raw value to
  `parseWith` and gets the correct 400.
- **Fix:** coerce non-object raw values to `{}` at the two deref sites (`raw && typeof raw
  === "object" ? raw : {}`) — the schema then answers the correct 400 with the specific
  field messages (a garbage body is validation-invalid input, not a server error).
- **Tests:** RED unit pins where the routes' helpers live is not practical (thin shells);
  the fix is covered by the existing e2e guard family + a manual curl probe in the
  verification phase (both routes: `null` → 400, never 500).

### BV5 (Low, validation) — `practiceTestSchema.questions` is the only unbounded JSON blob

- **Finding:** `questions: z.string().refine(...)` carries no `.max()` — a ~9.5 MiB
  valid-JSON string passes the schema and the 10 MiB read cap and persists to SQLite;
  every sibling blob field is capped (content 100k, tags 2k, reminders/subtasks/topics
  100k).
- **Fix:** `.max(100_000)` on the questions string (the family's blob convention).
- **Tests:** RED unit pin (a 100_001-char valid-questions string is rejected; the 100k
  boundary passes).

### BV6 (Medium, functional) — re-registering an UNVERIFIED account discards the newly typed password

- **Finding:** the existing-unverified branch re-issues the code but keeps the FIRST
  registration's `passwordHash`/`fullName` — a user who re-registers with a different
  password, verifies, then signs in with the password they last typed gets a 401 and must
  run forgot-password. The e2e pin checks only the 200/code shape.
- **Fix:** the branch also updates `passwordHash: hashPassword(password)` + `fullName`
  (the re-typed values win — the account is unverified, so there is no verified-identity
  to protect; the next re-register self-heals any abuse).
- **Tests:** RED e2e pin (register → re-register with a DIFFERENT password → verify →
  login with the NEW password succeeds; the old password 401s).

### BV7 (Medium, data-integrity) — the delegate factory writes FK ids without ownership validation

- **Finding:** `makeOwnedDelegate` create/update write parsed `subjectId`/`listId`/
  `notebookId` verbatim — a task referencing ANOTHER user's subject row satisfies the
  Prisma FK and persists (reads stay userId-scoped everywhere, so this is not a read
  leak: it is an owner-view dangling FK after the other account deletes the subject).
  The hand-written routes already own this check (files/folders ×4, ai/generate ×2 — the
  404 "That X does not exist." convention); the interactive CRUD path is the gap.
- **Fix:** an optional `ownedFks?: Partial<Record<string, { model: OwnedModel; label:
  string }>>` on `OwnedConfig`; create + update verify every non-null sent FK
  (`findFirst({ where: { id, userId } })`) → `NotFoundError("That <label> does not
  exist.")` on a miss. Delegates wired: task (listId→taskList, subjectId→subject),
  assignment/exam/deck/practiceTest/grade/focusSession/timetable (subjectId→subject),
  note (notebookId→notebook, subjectId→subject). The import route (its own
  account-aware knownIds loop) and the AI routes (their own checks) are unaffected.
- **Tests:** RED e2e pin (a task POST with a random cuid subjectId → 404 with the
  actionable message; a valid own-subject POST still 201s) + a unit census pin (the
  ownedFks map shape per delegate — a new FK-bearing delegate cannot ship unwired).

### BV8 (Low, bounded tables) — `resend-verification` never prunes expired tokens

- **Finding:** register prunes (`deleteMany expired` then create) but resend only creates
  — abandoned unverified accounts accumulate expired rows until a verify/re-register/
  deletion event.
- **Fix:** mirror register's `deleteMany({ userId, expiresAt: { lt: now } })` before the
  create.
- **Tests:** covered by the existing resend pins + the bounded-tables rationale comment;
  no new pin (the prune is opportunistic, not observable through the API contract).

### BV9 (Low, resilience) — the limiter's MAX_BUCKETS is a soft cap under a live-key flood

- **Finding:** the BU6 sweep only deletes EXPIRED windows; ≥2048 distinct live keys within
  one 15-min window (per-request forged XFF under the legacy posture) free nothing and the
  map still grows at request rate. BU6 genuinely closed the expired-residue leak; the
  comment's "bounded memory" claim is only conditionally true.
- **Fix:** when the sweep at cap frees nothing, evict the OLDEST live bucket (min
  windowStart) before inserting — the map becomes hard-bounded at MAX_BUCKETS + 1; the
  evicted key's owner re-gets a fresh window (the limiter fails OPEN for that one key,
  the documented single-node trade-off).
- **Tests:** RED unit pin (fill the cap with live keys; the next distinct key evicts the
  oldest; size never exceeds cap+1; the evicted key gets a fresh window).

### BV10 (Low, correctness) — the event ordering guard compares date STRINGS lexicographically

- **Finding:** `endDate < startDate` on raw strings is correct only for same-format ISO
  inputs; mixed-offset forms (`…T10:00:00+08:00` vs `…T09:00:00Z`) evade or misfire.
- **Fix:** both `.check()`s compare `Date.parse` values (NaN-safe: a NaN on either side
  skips — the dateAtom refine already rejected unparseable strings). Rides BV1's seam.
- **Tests:** RED unit pins (the mixed-offset inversion both directions; the equal-time
  boundary stays legal).

### BV11 (Low, auth hardening) — the verify-email consumption is not conditional; forgot-password leaves sibling tokens live

- **Finding (a):** verify-email reads the token (findFirst) THEN transacts an
  unconditional `deleteMany` — two concurrent replays of a valid code both pass the read
  and both get sessions (the BT3 reset-token class, ~100ms window). **(b):** forgot-password
  prunes only expired/used rows — N requests in 30 min leave N live one-shot takeover
  links.
- **Fix (a):** the conditional single-use consume — `deleteMany({ where: { userId, code:
  normalized, expiresAt: { gt: now } } })` FIRST; `count === 0` → the uniform 400; then
  the emailVerified update + the cookie (the BT3 `updateMany` pattern applied to the OTP
  family). **(b):** the prune widens to ALL prior tokens (`deleteMany({ userId })`) — a
  new issue supersedes; exactly one live link per account.
- **Tests:** RED e2e pin (the concurrent verify pair → exactly {200, 400}, the BT3 pin's
  shape) — the reset sibling already carries its own.

### BV12 (Low, robustness) — `secureCookieFlag` fails on a comma-joined `x-forwarded-proto`

- **Finding:** `headers.get` joins duplicate headers (`"https, https"`), which fails the
  `=== "https"` test → Secure not set behind double proxies.
- **Fix:** take the FIRST comma-separated value (`split(",")[0].trim().toLowerCase()`).
- **Tests:** RED unit pins ("https, https" → true; "http, https" → false; the existing
  single-value legs unchanged).

### BV13 (Informational — RESOLVED AS A NON-GAP at implementation) — the math/solve vision branch omits the `timeoutMs` body field

- **Resolution:** the guard experiment (the BV16 `noUnusedLocals` run) surfaced
  TS2353: the SDK's `CreateChatCompletionVisionBody` type carries NO `timeoutMs`
  field — the text branch's `create` body accepts it, the vision body does not.
  The shipped omission was CORRECT (`withDeadline` owns the vision deadline);
  the audit's recommendation was a type error the build caught. No change —
  documented as the S121 lesson 3 (audit recommendations are hypotheses; the
  type gate is the cheapest discriminator).

### BV14 (Informational, docs) — the Prisma schema comment says exam duration "5..6000"; `examSchema` enforces 5..600

- **Fix:** the comment only.

### BV15 (Medium, superset consistency) — the accent-token family: RepeatPill + StatCard fallback hardcode violet

- **Finding (reproduced live, photographed):** under the blue accent, the repeat pills
  still render violet-100/violet-600 and the Focus Timer's three StatCard tiles still
  render violet-500 — hardcoded classes (`bg-violet-100 text-violet-600
  dark:bg-violet-950 dark:text-violet-300` / `bg-violet-500 dark:bg-violet-500`) that
  ignore the accent. At the default violet the values are EXACT parity (N1 measured
  rgb(237,233,254)/rgb(124,58,237) = violet-100/violet-600); the reference's accent picker
  is a measured no-op, so the non-violet states are clone-internal — and the clone's own
  convention (AGENTS: "never hardcode violet hexes in view code"; the `sf-subject-chip`
  precedent) demands the accent tokens. The same family: `sf-today-cell-tint`'s light
  branch rides `--sf-primary-empty`, which the 16-var accentCssVars set does NOT redefine
  — the calendar today-cell has the same latent drift.
- **Fix:** (1) `accentCssVars` gains `"--sf-primary-empty": t.emptyFrom` (17 entries —
  every accent already carries `emptyFrom`, its 100-step; the S3-J pin and the
  theme.ts comment update in the same change); (2) a new `@utility sf-repeat-pill` in
  globals.css riding the accent tokens (light `rgb(var(--sf-primary-empty))` bg /
  `rgb(var(--sf-primary-strong))` text; dark `rgb(var(--sf-primary-soft-dark))` bg /
  `rgb(var(--sf-primary-strong-dark))` text — at violet these are EXACTLY the current
  hardcoded violet-100/600/950/300 values, byte-identical rendering); (3) `RepeatPill`
  rides the utility; (4) the StatCard fallback becomes `bg-sf-primary`; (5) the
  hue-tokens CONSUMERS census gains the `shared.tsx → sf-repeat-pill` entry (the AP-125
  three-edit contract's census leg — the palette-step legs do not apply: the utility
  rides runtime accent vars, not @theme palette steps); (6) `sf-today-cell-tint`'s light
  branch becomes accent-aware for free through the token.
- **Tests:** RED unit pins (theme: 17 entries, `--sf-primary-empty` present per accent and
  equal to that accent's `emptyFrom`; hue-tokens: the census entry) + the live
  verification (the blue-accent pills/tiles re-measured on the dev server; the violet
  default re-measured byte-identical; screenshots after-state).

### BV16 (Low, hygiene) — the 8 dead imports (the BU18 sweep's residue)

- **Finding:** `apiSend` ×4 (exams/events/assignments/timetable), `formatLongDate`
  (timetable), `StatCard` (gradetracker), `ImagePlus` (mathsolver), `SimpleEmptyState`
  (tasks) — each verified import-line-only. The lint gate cannot catch the class
  (`@typescript-eslint/no-unused-vars` off in the repo's base config — a pre-existing,
  documented posture, not a recent weakening).
- **Fix:** delete the 8 names. Guard experiment: try `noUnusedLocals` in tsconfig — if
  the tree is otherwise clean, ship it (the build is the type gate post-BU22e, so the
  class closes machine-wise); if it surfaces a large diff, document the posture instead.
- **Tests:** the gates themselves (lint/tsc/build stay green).

### BV17 (Low, React correctness) — three non-unique list keys on user-controlled strings

- **Finding:** analytics Subject Workload `key={row.name}` (duplicate subject names are
  allowed by the schema); practicetests MC options `key={option}` ×2 sites ("A, B, A"
  input duplicates); studygroups members `` key={`${member.email}-${member.name}`} ``.
- **Fix:** workload keys by the subject id (present on the mapped row); options key by
  `` `${option}-${i}` `` (the exams topics-chips precedent); members key gains the index.
- **Tests:** the standing suites (no behavioral change); the duplicate-name case noted in
  the plan record.

### BV18 (Informational, docs) — two comment drifts

- **Finding:** globals.css's header comment says the shadcn tokens are consumed "INSIDE
  `@theme inline`" while the block at :34 is a plain `@theme` (functionally correct — the
  comment misstates the mechanism); `view-collections.ts:11` cites `src/lib/files.ts`
  which does not exist (files-view fetches inline).
- **Fix:** both comments corrected.

### BV19 (Informational, perf hygiene) — the analytics `week` useMemo never caches

- **Finding:** the memo keys on `today = startOfDay(new Date())` — a fresh object every
  render, so the memo recomputes each render (harmless at this scale; the shape is the
  smell).
- **Fix:** drop the `useMemo` (the derivation is cheap; a never-caching memo is noise).

### Documented non-gaps (measured, no change)

- **Tasks-view instant delete** — the reference's measured F5 behavior (re-confirmed live
  this session: ellipsis → Delete → gone, zero dialogs); MyDay's confirm is the clone's
  own superset choice. The per-view confirm matrix is reference-driven, not an
  inconsistency to "fix".
- **No explicit Cancel on the events/notes/flashcards dialogs** — the s120 measured
  matrix + today's N2 (the reference's note editor: Save + icon close only).
- **The bare `{ error }` envelope + the 401-JSON convention** — the repo's documented
  contract (I4), internally consistent end-to-end.
- **`force-dynamic` only on /api/health** — every data route touches `cookies()` via
  `requireUser`, forcing dynamic rendering in Next 16 (I8).
- **rum-panel effect deps / lateral imports to shared.tsx / the optimistic settings
  PATCH** — stable-by-construction or documented contracts (FE-I5/I6/I7).

---

## 2. The TDD sequence

RED first, every pin verified failing FOR THE RIGHT REASON on the pre-change tree, then
the source, then GREEN. Guardrails held: no test weakened, no lint/type rule loosened,
`noImplicitAny` on, the s117–s120 pins untouched.

1. **Unit RED pins** (new file `tests/event-merge.test.ts` for BV1/BV10's pure seam;
   appends to `tests/validation.test.ts` [BV5], `tests/auth.test.ts` [BV2's cookie
   derivation + BV12's comma header], `tests/theme.test.ts` [BV15's 17-entry set],
   `tests/hue-tokens.test.ts` [BV15's census entry], `tests/rate-limit.test.ts` [BV9's
   hard cap], plus the BV7 ownedFks census pin in `tests/entities.test.ts` if that file
   exists — else a new one).
2. **E2e RED pins** (appends to `tests/e2e/auth-flows.spec.ts` [BV6 re-register password,
   BV11a concurrent verify pair], `tests/e2e/tasks.spec.ts` or a resilience append [BV7's
   foreign-FK 404]).
3. **GREEN** in dependency order: the pure seams (BV1/BV10 seam, BV5, BV12) → the
   delegate factory (BV7, BV1's hook) → the auth routes (BV2, BV4, BV6, BV8, BV11) →
   the limiter (BV9) → the frontend (BV15, BV16, BV17, BV18, BV19) → the config/docs
   (BV3, BV13, BV14).
4. **Stale-pin sweep** (the AP-124 lesson): `grep` the pin layer for every changed
   contract's OLD values (the 16-entry count, the raw string comparisons, the NODE_ENV
   clear derivation) in the SAME change.

## 3. Verification checklist (the cold re-cert)

lint · tsc · unit (census re-derived: 1030 + the new pins) · build (the type gate) · the
cold 5-chunk e2e (census re-derived: 497 + the new pins; the cert-script re-tag lands
AFTER the final cert, never mid-run — the S119/S120 lesson) · the register tripwire
re-derivation (expect 249/130 + this cycle's riders if any playwright script is added —
none planned) · the live curl battery on :3000 (BV4's null bodies → 400; BV7's foreign FK
→ 404; BV1's single-leg inversion → 400) · the live agent-browser battery (the mobile
drawer family, the BU fixes still green, BV15's accent re-theme measured on BOTH the
blue accent and the byte-identical violet default) · the evidence frames
(`docs/screenshots/121-clone-*.png`) · `.env.example` re-verified against the codebase
contract.

## 4. Documentation chain (the same-commit updates)

README (badge + census lines + the Session-121 row) · AGENTS (commands census + the S121
lessons + Conventions if any scale changes) · CLAUDE (the Unit-line seam tail) ·
vitest.config.ts header · PAD (version bump + §6.4 rows for BV2/BV3/BV11 if the threat
posture lines move) · the SKILL doc (census + AP lessons) · DEPLOYMENT.md (§8's compose
commands become true — BV3) · the cert-script census re-tag · the master
`docs/remediation-plan.md` header → Batch BV · this plan's §5 execution record ·
`worklog.md` (the Session-121 entry) · `docs/session_113.md` (the session record, titled
"Session 122").

---

## 5. Execution record (2026-11-01)

**TDD discipline.** RED first: **21 failing unit pins** (event-merge +11 across
the new `tests/event-merge.test.ts`, validation +2, secure-cookie +3, auth +1
[the hard cap], clear-cookie +3 [the new `tests/clear-cookie.test.ts`],
owned-fks +3 [the new `tests/owned-fks.test.ts`]) + **4 failing e2e pins**
(BV6 the re-register password, BV11a the concurrent verify pair, BV7 the
foreign-FK 404s ×2), every pin verified RED for the right reason on the
pre-change tree (BV6: the new password 401s; BV11a: the pair reads {200,200};
BV7: the foreign FK 201s). GREEN in dependency order: the pure seams → the
delegate factory → the auth routes → the limiter → the frontend → the configs.
Guardrails held: no test weakened, no lint/type rule loosened — the type rules
were STRENGTHENED (`noUnusedLocals`/`noUnusedParameters` on, the BV16 guard).

**The honest mid-run corrections (four):**

1. **The BV5 pin's own arithmetic** — the JSON wrapper around one short_answer
   question is 39 chars, not the 44 the first draft assumed (the boundary
   assertion failed on the pin's own construction, not the schema; re-derived
   with a wrap-length self-check).
2. **The BV1 string-fixture gap — caught by the LIVE PROBE, not the pins.**
   The seam's unit pins passed on string fixtures while the delegate passes
   the STORED Prisma row (Date objects): the seam's `typeof !== "string"`
   guard silently skipped and the first curl probe wrote the inverted span the
   guard existed to block. Closed: the seam normalizes both shapes
   (`epochMs`), a Date-fixture unit pin (+1 → 22 unit pins), AND a
   wire-level e2e pin in resilience (the S121 lesson 1). The cert was
   mid-run against the pre-fix build — killed, rebuilt, re-run cold (the
   S119 doctrine).
3. **The BV13 audit recommendation was a TYPE ERROR** — the SDK's
   `CreateChatCompletionVisionBody` carries no `timeoutMs` field (TS2353 at
   the guard experiment; the original omission was correct — `withDeadline`
   owns the vision deadline). BV13 became a documented non-gap the build
   itself proved; the plan's §1 entry is annotated.
4. **The AP3 triangle** — the token addition to accentCssVars alone went RED
   at the S89/AP3 + S90/AQ1 pins (the insertion-order sync contract): the
   complete edit is the interface + the seven ACCENT_TOKENS literals + the
   seven boot-script TOKENS lists (the value-equal `empty` ≡ `emptyFrom`
   pair, the AO5 precedent).

**The BV16 guard experiment** — `noUnusedLocals`/`noUnusedParameters` in
tsconfig surfaced 13 MORE dead identifiers beyond the audit's 8 (four dead
`requireUser` imports in the AI/math routes, `siteUrl`, `toErrorResponse`, the
`STUDY_TIPS` block, the `eventSchema` remnant, three leftover test locals, the
zustand `get` param) — all removed, the tree compiles clean with the guards
on, and the class is now machine-enforced by BOTH gates (`typecheck` and the
canonical build, itself the type gate post-BU22e).

**Re-certification (all on the FINAL tree).** lint ✓ tsc ✓ (`noImplicitAny` +
the new unused guards on) unit **1054/1054** (39 files — 1030 + 24: the 22
RED pins + the BV1 Date-fixture leg + the theme pin's value-equal pair
in-place); the canonical build green (exit 0, the type gate live); the cold
5-chunk e2e **502/502** (135+147+62+90+68 — chunk 2 +2 [the BV7 pins],
chunk 3 +1 [the BV1 wire pin], chunk 5 +2 [the BV6 + BV11a pins]); the
register tripwire **249/130/0-stale/119** — the exact hold, no new playwright
scripts this cycle; the live curl battery on :3000: the register null body →
400 with the field message, the preferences null body → 200 (the coerced
no-op, the documented empty-patch semantics — never a 500), the events
single-leg inversion → 400 "End date must be after the start date" (both
directions) while the legal single-leg move → 200, the foreign subjectId →
404 "That subject does not exist.", the logout Set-Cookie symmetric with
login (no Secure over plain http, Secure behind `x-forwarded-proto: https`);
the live agent-browser battery: the mobile drawer (288px panel, labeled
hamburger, navigation → /Analytics + auto-close), /Notes clean at 390, the
landscape nav 992 > 301, the scroll persistence 600px carried, **the BV15
accent re-theme verified live BOTH ways** (under blue: the repeat pills
blue-100/blue-600, the Focus Timer tiles blue-500, the dark pair
blue-950/blue-300; at violet: the pills byte-identical to the reference's
measured rgb(237,233,254)/rgb(124,58,237)); the six `docs/screenshots/
121-*.png` evidence frames (the before/after blue-accent pairs md5-distinct +
the dashboard + the mobile drawer); `.env.example` verified current (no new
env vars — BV3 wired compose only).

**Standing debt after BV: ZERO.**
