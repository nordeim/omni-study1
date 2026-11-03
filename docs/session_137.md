# Session 137 — Batch CH (Cycle 83): The Audit-Driven Hardening Cycle — The Manifest-Key + Import-Parity + SubjectId-Index + Envelope-Seam Set

> Record of worklog **Session-133 / Batch CH**. Workspace: the Batch CG state (`a3907e3`)
> + the operator's `2743cd9` (`docs/session_136.md`, the CG transcript) — the workspace
> SURVIVED this time (the tree, `.env`, `db/`, and the :3000 dev daemon all carried over;
> every baseline number re-derived on the surviving tree). Plan + execution record:
> **`docs/remediation-plan-session133.md`**.

---

## 1. The baseline (cold, BEFORE any work)

lint ✓ · `tsc --noEmit` ✓ · unit **1251/1251** (45 files) · the canonical build green
(foreground, exit 0) · the cold 5-chunk e2e **575/575 — 149+179+74+94+79, every chunk
first-pass** (per-chunk via `scripts/run-cert-chunk.sh`; zero flakes — the S81/AH2a class
did not recur) · the Mode-C audit of the Batch CG diff (`a3907e3`, 40 files, +1545/−146):
**all 11 CG claims re-verified TRUE against the tree, zero key material** (CG1's burn at
login/route.ts:70; CG2's `hashOtpCode` seam + all three call sites; CG3's `forgotAcct:`
budget; CG4's parse seam in env-check; CG5's BootDataFailureBar + tracked state; CG6's
five loading gates; CG7's three modified-click guards; CG8's Splash `role="alert"`; CG9's
BOOT_TOKEN_SUFFIXES + embed; CG10's DEPLOYMENT/.env.example notes; CG11's
`registerGlobal:` budget).

## 2. Live parity (both hosts — agent-browser, mobile 390×844 + desktop 1280×800)

**Reference** (logged in): the standing battery held — the mobile drawer panel **288px**
(`w-72`), white, `z-50`, `shadow-2xl` final layer `rgba(0,0,0,0.25) 0px 25px 50px -12px`,
backdrop **`bg-black/20 backdrop-blur-sm`** (4px), exactly **20 nav links**, instant open
(`animation: none`), nav scrollable (992/744), drawer nav-click → `/Tasks` + drawer
unmounts, body scroll `visible` while open (the clone's lock is the documented superset),
desktop **260px sidebar / 20 links / main offset 260px**.

**Clone** (dev :3000, demo account): `node scripts/drawer-check-s14.mjs` → **DRAWER
CHECK: GREEN** (all six checks) — the **41st consecutive no-Tailwind-v4-mobile-nav-bug
confirmation** at baseline. The agent-browser live walk: hamburger labeled +
`aria-expanded` toggling ✓, open lands focus on "Close menu" ✓, Escape closes + restores
body scroll + **returns focus to the hamburger** (verified through a REAL click — the
synthetic `.click()` path carries no focus, a probing nuance recorded) ✓, drawer Tasks →
`/Tasks` + unmounts ✓, desktop **260/20/260 identical to the reference** ✓.

## 3. The audits (rotated fresh eyes — the s132 closing recommendation: the
data/import/export + entities/factory axes, the two last deep-covered the earliest)

- **Audit A — the data/import/export/persistence axis** (data.ts, data-import.ts,
  data-export.ts, api.ts, store.ts, view-collections.ts, the export/import routes +
  panel + boot page, the localStorage sweep): **0 Critical / 0 High / 3 Medium / 2 Low /
  3 Informational**. The persistence plane affirmed clean on auth/CSRF/body-cap/budgets,
  the secret guards, the one-transaction import, prototype-pollution and injection
  surfaces, client persistence hygiene, and the race-condition pins.
- **Audit B — the entities/factory server axis** (all 60 route files in full, schema,
  seed, db/server seams, validation): **0 Critical / 0 High / 1 Medium / 3 Low / 2
  Informational**. The factory plane affirmed clean on IDOR (userId-scoping by
  construction), input validation (parseWith everywhere, zero unvalidated query params),
  transactions/cascades, date round-trips, error shapes, secret hygiene, seed
  idempotency.

Every M finding re-verified by direct read BEFORE the plan (CH-A1's zero-caller seam +
the route twin's divergences; CH-A2's dead `"flashcardDecks.*"` keys vs the route's
manifest name `"decks"` with the census pin machine-enforcing the wrong list; CH-A3's
five missing enums + four hexColors + four length atoms + the grades ceiling + min-1s +
key bounds, all verified against validation.ts's atoms; CH-B1's ten unindexed
`subjectId` columns against the schema's own `@relation` map).

## 4. The CH set (TDD)

**RED**: 40 unit pins + 3 e2e pins, every one verified failing for the DESIGNED reason
(the census regexes missing the absent keys; the FK census naming exactly the ten
subjectId columns; the route census missing the seam call; the behavior pins failing on
the absent guards; the e2e discriminators — the Z-week class importing 200, the Tasks
chip staying "Tasks0", the blank title answering 201) — with the 1251 baseline otherwise
green throughout.

**GREEN** (unit **1251 → 1291**, 45 files; e2e **575 → 578**, chunk map
**149+180+74+94+81**):

- **CH1 (M)** — the CE7 length registry's dead keys renamed to the manifest names
  (`"decks.name"`/`"decks.description"` — the route iterates manifest names; the
  `"flashcardDecks.*"` keys could never match and the deck caps were inert their whole
  life, machine-enforced wrong by the census pin) + the **manifest-consistency census**:
  every registry key's collection prefix must be a real `EXPORT_COLLECTIONS` entry — the
  class can never silently recur.
- **CH2 (M)** — the CA14/CB11 import-parity contract completed: the five missing enum
  vocabularies (`events.repeat`, `exams.type`, `timetableClasses.weekType`,
  `focusSessions.mode`, `calcHistory.mode` — single-sourced as exported arrays in
  validation.ts), the four hexColor fields, the four missing length atoms
  (`calcHistory.expression/result` 500, `holidays.name`, `folders.name`,
  `chatMessages.content` 100k), the grades ≤1000 ceiling, the min-1 registry (the
  trim-aware blank check — whitespace-only rejects, padded-but-nonblank imports
  VERBATIM, the documented no-silent-mutation choice), and the 64-char JSON-key bound.
  An imported `weekType: "Z"` class (invisible in every timetable week view) or a
  `99999/99999` grade now answers the actionable 400.
- **CH3 (M)** — the ten `subjectId` FK indexes (`@@index([subjectId])` on Task,
  Assignment, Exam, TimetableClass, Note, FlashcardDeck, PracticeTest, StudyGroup, Grade,
  FocusSession — every Subject DELETE previously ran TEN unindexed SetNull full-table
  scans, the CE9 class 10× wider) + the **FK-column index census** (every `@relation`
  column machine-checked for leftmost index coverage — the CE9 "every sibling FK carries
  one" claim is no longer hand-asserted) + the honest CE9 comment correction + `db:push`
  (index adds, zero data loss).
- **CH4 (M)** — the envelope-validator twin closed: `validateImportEnvelope` is THE
  stateless single source (format identity, version folding, data-object required,
  unknown collections, per-collection array-ness — aligned to the route's SHIPPED
  contract), the route consumes it (the S126 lesson-2 hazard: the unit-pinned
  `parseImportEnvelope` had ZERO production callers while the inline twin had drifted —
  the seam tolerated a missing data block and split the version 400s), the
  `duplicateIdError` helper unifies the last twin message, and the **caller census**
  machine-guards the consumption. The account-aware FK resolution stays route-side BY
  DESIGN (a pure seam cannot see the DB) — documented at the seam header.
- **CH5 (L)** — the JSON-column registry corrected (the phantom `practiceTests.topics`
  dropped, the real `exams.topics` added) + the `jsonArray` atom's array-ness generalized
  (the members-only special case folded into the general check).
- **CH6 (L)** — the 400-body echo bounded: the folder-cycle offender list truncates to
  the first 10 + "…and N more" (a 25 MiB cyclic envelope previously amplified into a
  ~30 MB error body), and the field-name interpolations cap at 64 chars.
- **CH7 (L)** — the /export count grid refreshes after an in-panel import
  (`router.refresh()` re-runs the page's 20 db counts; pre-CH7 the grid showed stale
  pre-import numbers while the panel said "Import complete").
- **CH8 (L)** — the trim-before-check on the title/name family (`boundedTitle` +
  the two folder-name schemas — the AM1/BS5 doctrine's gap: `{"title": "   "}` persisted
  as a visually blank row; now 400, and padded titles store trimmed).
- **CH9 (L)** — `MAX_UPLOAD_BYTES` moved from `files/route.ts` to `http.ts` (the
  S125/BZ8 rule — route files cannot export shared symbols; it was the repo's one live
  violation) + the route-export census guarding the whole route tree.
- **CH10 (I)** — the 20 s GET deadline single-sourced (api.ts exports, data.ts derives,
  page.tsx consumes — the "SAME constant, never a copy" comment is now true).

## 5. The re-cert

lint ✓ · `tsc --noEmit` ✓ · unit **1291/1291** (45 files) · the canonical build green ·
the cold 5-chunk e2e **578/578 — 149+180+74+94+81, every chunk first-pass** · the live
drawer battery GREEN on the remediated tree — **the 42nd consecutive
no-Tailwind-v4-mobile-nav-bug confirmation** · the register tripwire re-measured
**251/132/0/119** (the 44th consecutive hold; the +1/+1 is this cycle's own
`capture-s133-evidence.mjs`, Usage line per the S97/AX2 convention) · three evidence
frames under `docs/screenshots/133-clone-*` (the desktop dashboard, the mobile drawer,
and the NEW CH7 counts-refresh surface — the capture script's own chip-flip wait 12 → 13
+ the passing e2e pin are the machine proof; the probe row deleted after, the quiescence
discipline). **Census: 1291 unit + 578 e2e = 1869 green.**

## 6. The honest mid-run corrections

1. The unit projection was ~1277 (+26); the executed census is **1291 (+40)** — the CH2
   block landed fourteen pins and the CH4 re-anchor split one; the per-file arithmetic
   is in the plan §5.
2. The e2e projection was 578; executed **exactly 578** — the chunk map re-tagged in
   both cert scripts + the machine-enforced Expected pin in lockstep.
3. The gates caught the test-infrastructure drift themselves: the census typing, the Set
   handling, the data-store mock's missing `DEFAULT_GET_TIMEOUT_MS` export, and the
   route refactor's leftover `envelope.user` — each fixed before GREEN closed (the full
   honest list in the plan §5).
4. The CE7 key census and the "unknown field" leg re-anchored in place (their contracts
   carry; their examples moved to the new registry shape).
5. The CH2 e2e pin's fixed-id collision on standalone re-runs (the S46 class) — a
   stamped probe id adopted.
6. The capture script's two dev-mode flakes (the /export cold-compile goto timeout; the
   hydration race on the Import button) — the API-level login adopted (the s132
   precedent's own lesson, twice-learned); the third run GREEN first-pass.
7. The tripwire instrument lesson: "usage-line-free" = importers − carriers (the s77-era
   definition) — the first reading (all usage-free files, 143) was wrong; the reconciled
   register reads **251/132/0/119**.

## 7. The docs set (same commit)

README (the badge 1869 + the census lines + the S133 row), AGENTS.md (the census
anchors), PAD **v1.3.41** (the revision block + the §8.1 Total row), the SKILL doc (the
census anchors), the vitest header (45/1291 + the S133/CH re-anchor block), the
cert-script re-tags (the S133/CH block + Expected 578 in both), the plan's §5 (the
as-executed record), this record, and the worklog entry.

## 8. Deferrals (documented, with rationale — the plan's §4)

The scrypt KDF parameter/versioning migration (deferred the SIXTH time — the standing
next-cycle candidate; this cycle was sized by the rotated axes' four M findings, exactly
the s132 directive), the pre-CE5 unguarded delegates (theoretical), the write-budget
census per-method granularity, the boot double-fetch (ADR-014's contract), the
newest-500 window vs import minting (the documented bounded-read posture), Docker
non-root runtime, the resend/forgot ms-scale timing equalization, the drawer-link
emission order, the flashcards render-phase unlatch, the iOS scroll-lock nuance, the RFC
7239 signed-proxy posture.

**Next cycle suggestion (the s132 closing rhythm): the KDF migration is now the
front-of-queue standing candidate (sixth deferral — it needs a measured availability
cycle of its own), or rotate the deep-audit axes onto the auth/crypto/infra + FE/views
families again (the s131 axes, three cycles stale).**
