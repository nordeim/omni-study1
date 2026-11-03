# Remediation Plan — Session 133 / Batch CH (Cycle 83)

**Status: COMPLETE** (executed TDD-style 2026-11-03 — the verification record is §5;
the drafted §2/§3 held through GREEN with the divergences recorded inline in §5, the
s132 precedent)
**Date:** 2026-11-03 · **Workspace:** the Batch CG state (`a3907e3`) + the operator's
`2743cd9` (`docs/session_136.md`, the CG transcript). The workspace SURVIVED this time (the
tree, `.env`, `db/`, and the :3000 dev daemon all carried over; every baseline number
re-derived on the surviving tree). **Audit-driven hardening session** — the standing rhythm
(audit the prior-batch diff, rotate two fresh-eyes deep audits, re-certify cold).

---

## 0. Scope and Method

The operator directed the standing rhythm (the same charter as s125–s132): refresh the
workspace (`git pull` — the operator's `2743cd9` landed clean), re-read the doc chain
(`AGENTS.md`, `CLAUDE.md`, `README.md`, `PAD`, `omni-study1_SKILL.md`,
`docs/session_135.md`, `docs/remediation-plan-session132.md`, `worklog.md`,
`docs/session_136.md`), re-validate against the codebase, audit with the repo skills as
rubrics (`skills/` excluded from checking/testing/compilation), iterate on visual +
functional parity with `https://omni-study1.base44.app/` (the mobile navigation menu the
named focus, Tailwind v4 the named suspicion class), keep the repo a production-ready
functional SUPERSET with visual parity, keep the `.env`/`db/` contract
(`DATABASE_URL="file:../db/custom.db"`, `db/` at the repo root, `.env.example` tracked +
current), maintain the vitest + playwright suites, plan remediation for everything found,
execute with TDD (RED → GREEN), capture evidence under `docs/screenshots/`, update the docs
chain, and commit + push to `main` via the SSH wrapper.

**The s132 closing suggestion executed this cycle:** the deep-audit axes rotated onto the
data/import/export family and the entities/factory server family (the two axes last
deep-covered the earliest); the scrypt KDF parameter migration remains the standing
next-cycle candidate (deferred again — §4).

### Baseline (cold, BEFORE any work — re-derived on the surviving tree)

lint ✓ · `tsc --noEmit` ✓ · unit **1251/1251** (45 files) · the canonical build green
(exit 0, foreground) · the cold 5-chunk e2e **575/575 — 149+179+74+94+79, every chunk
first-pass** (per-chunk via `scripts/run-cert-chunk.sh`; zero flakes this cycle — the
S81/AH2a class did not recur) · the Mode-C audit of the Batch CG diff (`a3907e3`, 40
files, +1545/−146): **all 11 CG claims re-verified TRUE against the tree, zero key
material** (CG1's `verifyPassword(password, DUMMY_LOGIN_HASH)` burn inside the exhausted
`loginAcct:` branch at login/route.ts:70; CG2's `hashOtpCode` seam at auth.ts:238 with all
three call sites flipped [register:130, resend:85, verify-email:94]; CG3's
`forgotAcct:${email}` budget at forgot-password/route.ts:58; CG4's
`parseTrustedProxyHops` hosted in env-check.ts:175 with auth re-exporting and
`directExposureProdWarning` deciding through the parser at env-check.ts:154; CG5's
`bootDataFailed` state + the `BootDataFailureBar` with `role="alert"` + Retry in page.tsx;
CG6's five loading gates [settings 793/973, analytics 406, calendar 190/371]; CG7's three
modified-click guards at dashboard-view.tsx:68/190/225; CG8's Splash `role="alert"` at
page.tsx:110; CG9's `BOOT_TOKEN_SUFFIXES` at theme.ts:273 + the script embed at :342;
CG10's DEPLOYMENT.md §2/§3 + `.env.example` port-isolation notes; CG11's
`registerGlobal:` 40-budget at register/route.ts:51).

### Live parity (both hosts — agent-browser, mobile 390×844 + desktop 1280×800)

**Reference** (logged in `sepnetflix2023@outlook.com`): the standing battery held — the
mobile drawer panel **288px** (`w-72`), white, `z-50`, `shadow-2xl` final layer
`rgba(0,0,0,0.25) 0px 25px 50px -12px` (identical to the clone's trap-13 serialization),
backdrop sibling **`bg-black/20 backdrop-blur-sm`** (4px), exactly **20 nav links**
(firstLink "Dashboard"), `animation: none` (instant open), nav **scrollHeight 992 >
clientHeight 744** (scrollable), drawer nav-click → URL `/Tasks` + drawer unmounts, body
scroll stays `visible` while open (the clone's `overflow: hidden` lock is the documented
superset), desktop sidebar **260px / 20 links / main offset 260px**.

**Clone** (dev :3000, demo account): `node scripts/drawer-check-s14.mjs` → **DRAWER CHECK:
GREEN** (backdropMatch, panelWidthMatch, panelWhite, linkCountMatch, noFooter,
escapeCloseSuperset — all true) — the **41st consecutive no-Tailwind-v4-mobile-nav-bug
confirmation** at baseline. The agent-browser live walk (real clicks, not synthetic — the
synthetic `.click()` carries no focus, so the focus-restore leg must use the real path):
hamburger labeled "Open navigation menu" + `aria-expanded` toggling ✓, open lands focus on
the panel's "Close menu" button ✓, Escape closes + restores body scroll + **returns focus
to the hamburger** (verified via a real agent-browser click — the synthetic-click path
correctly leaves focus on BODY because a synthetic click never focuses the trigger) ✓,
drawer "Tasks" → `/Tasks` + drawer unmounts ✓, desktop chrome **260/20/260 identical to
the reference** ✓.

### The audits (rotated fresh eyes — the s132 closing recommendation)

- **Audit A — the data/import/export/persistence axis** (data.ts, data-import.ts,
  data-export.ts, api.ts, store.ts, view-collections.ts, the export/import routes + panel +
  page boot, the localStorage sweep, the s21/s23/resilience e2e contracts):
  **0 Critical / 0 High / 3 Medium / 2 Low / 3 Informational**. The persistence plane
  affirmed clean on: auth/CSRF/body-cap/rate budgets on both data routes; the secret guards
  (passwordHash never selected/stripped, token tables excluded, userId re-attached from
  the session); the one-transaction all-or-nothing import with envelope∪owned FK
  resolution; prototype-pollution and injection surfaces; client persistence hygiene and
  the race-condition unit pins.
- **Audit B — the entities/factory server axis** (all 60 route files in full, schema.prisma,
  seed.ts, db.ts, server/{http,auth,entities,ai}.ts, validation.ts, the guard tests):
  **0 Critical / 0 High / 1 Medium / 3 Low / 2 Informational**. The factory plane affirmed
  clean on: IDOR (every query userId-scoped by construction, cards deck-scoped, FK
  re-pointing blocked on create AND patch); input validation (parseWith everywhere, zero
  unvalidated query params, integer bounds, closed vocabularies); transactions/cascades
  (22-relation delete cascade, P2002/P2025/P2003 mapping, the four CE5 merge guards); date
  round-trips; error shapes; secret hygiene; seed idempotency.

**Every M finding re-verified by direct read BEFORE this plan** (CH-A1: the
`parseImportEnvelope` export consumed only by tests + the route's inline twin diverging on
the missing-data and version stages; CH-A2: `IMPORT_FIELD_LENGTHS` keys
`"flashcardDecks.name"`/`"flashcardDecks.description"` vs the route's manifest name
`"decks"` at route.ts:95 with `fieldCapFor` looking up `${collection}.${field}` — the keys
can never match, and the census pin at tests/data-import.test.ts:791-820 machine-enforces
the wrong key list; CH-A3: `ENUM_VOCABULARIES` missing `events.repeat`, `exams.type`,
`timetableClasses.weekType`, `focusSessions.mode`, `calculatorHistory.mode` — all verified
present as route-enforced z.enums in validation.ts:281/262/330/501/577 — plus the four
hexColor fields (validation.ts:224/279/392/444), the four missing length atoms
(validation.ts:575-576, files/folders/route.ts:23, server/ai.ts:31), the grades 1000
ceiling (validation.ts:463-464), and the min-1 atoms; CH-B1: `subjectId` columns on ten
child models [Task:149, Assignment:180, Exam:206, TimetableClass:263, Note:307,
FlashcardDeck:331, PracticeTest:369, StudyGroup:390, Grade:416, FocusSession:435] with
`onDelete: SetNull` and ZERO `@@index([subjectId])` anywhere — the only FK indexes are
listId/notebookId/deckId/folderId/parentId, the exact CE9 class 10× wider).

## 1. Findings → the CH set

| # | Finding | Severity | Fix |
|---|---------|----------|-----|
| CH1 | the CE7 length registry keys `"flashcardDecks.name"`/`"flashcardDecks.description"` can NEVER match the import route's manifest collection name `"decks"` — the deck caps are inert (a hand-edited backup stores a 999,999-char deck name every interactive route 400s at 200), and the census pin machine-enforces the WRONG key list | Medium | rename to `decks.*` + a manifest-derived key census |
| CH2 | the CA14/CB11 "import is a first-class citizen" contract is incomplete: 5 enum vocabularies (events.repeat, exams.type, timetableClasses.weekType, focusSessions.mode, calculatorHistory.mode), 4 hexColor atoms (subjects/events/decks/studyGroups `.color`), 4 length atoms (calcHistory.expression/result 500, holidays.name 200, folders.name 200, chatMessages.content 100k), the grades ≤1000 ceiling, min-1 lengths, and JSON key lengths are unmirrored — imported `weekType: "Z"` classes are invisible in every timetable week view; 99999/99999 grades import | Medium | extend the registries + the per-row guard |
| CH3 | ten `subjectId` FK columns carry NO index — every Subject DELETE fires 10 unindexed SetNull full-table scans (the S130/CE9 class, 10× wider; the CE9 comment claims "every sibling FK carries one" — hand-asserted, not machine-checked) | Medium | `@@index([subjectId])` ×10 + the FK-index census |
| CH4 | `parseImportEnvelope` is a unit-pinned seam with ZERO production callers while the route runs a drifted inline twin (the S126 lesson-2 hazard class): the seam tolerates a missing `data` block (imports zero rows, ok:true) while the route 400s; the seam distinguishes "no readable version" while the route folds non-integer into the newer-version 400 | Medium | the stateless envelope validator moves into the seam (aligned to the route's shipped contract), the route consumes it, caller census |
| CH5 | the JSON-column registry drift: `exams.topics` unguarded (a real JSON column), phantom `practiceTests.topics` (PracticeTest has no topics column), and no array-ness check despite the interactive `jsonArray` atom's contract | Low | fix the registry + mirror the array-ness |
| CH6 | unbounded attacker-controlled echo in import 400 bodies: the folder-cycle offender list joins EVERY un-emitted id (a 25 MiB cyclic-folder envelope yields a ~30 MB error string) and `${field}` interpolates the raw unbounded JSON key | Low | truncate both |
| CH7 | the /export "What's included" count grid goes stale after an in-panel import — the server-rendered counts show pre-import numbers while the panel says "Import complete — 3 created" | Low | `router.refresh()` on import success |
| CH8 | whitespace-only titles/names pass every entity boundary (`boundedTitle` is `min(1)` with no trim — `{"title":"   "}` persists as a visually blank row), inconsistent with the repo's own AM1/BS5 trim-before-check doctrine (members, link-file names, multipart upload names all trim) | Low | `.trim().min(1)` on boundedTitle + the folder-name schemas |
| CH9 | `files/route.ts` exports `MAX_UPLOAD_BYTES` — the repo's own documented "route files cannot export shared symbols" rule (the S125/BZ8 lesson), with a hand-copied client twin in files-view.tsx:53 already drifted-adjacent | Low | move to `src/lib/server/http.ts` (the FILE_METADATA precedent), route imports it |
| CH10 | the 20 s GET deadline exists as three literals in three files (data.ts:341, api.ts:80, page.tsx:194) while data.ts's comment claims "consumers and pins read the SAME constant, never a copy" — only two-thirds true | Informational | single-source in api.ts (the lower layer; data.ts already imports api.ts — no cycle) |

**Deferred with documented rationale** → §4.

## 2. The CH set — design

### CH1 (M) — the dead registry keys renamed + the manifest-derived census

`src/lib/data-import.ts:438-439`: `"flashcardDecks.name": 200` → `"decks.name": 200`;
`"flashcardDecks.description": 1_000` → `"decks.description": 1_000` (the manifest name
the route iterates — `IMPORT_ORDER`/`EXPORT_COLLECTIONS` carry `"decks"`, never
`"flashcardDecks"`). The census pin in `tests/data-import.test.ts` re-anchors to the
renamed keys. NEW guard so the class never recurs: a **manifest-consistency census** —
every key of `IMPORT_FIELD_LENGTHS`, `ENUM_VOCABULARIES`, `JSON_STRING_FIELDS`, and the
new CH2 registries must have its collection prefix ∈ `EXPORT_COLLECTIONS` (derived from
the single manifest source — a future `"modelish.name"` key fails loudly). The
provenance comment at data-import.ts:408-416 gains the honest note that the keys ride the
MANIFEST names (the pre-CH1 `"flashcardDecks.*"` entries were dead for their whole life —
the CE7 entry shipped unmatched because no census derived the valid prefixes).

### CH2 (M) — the import parity contract completed (the CA14 doctrine's missing atoms)

All in `src/lib/data-import.ts` (+ the vocabulary single-sources in `src/lib/validation.ts`):

1. **Enums** — export the four inline vocabularies from validation.ts as
   `EXAM_TYPES`, `WEEK_TYPES`, `FOCUS_SESSION_MODES`, `CALCULATOR_MODES` (the
   `TASK_PRIORITIES` precedent — the z.enum call sites switch to the exported arrays,
   values byte-identical), then extend `ENUM_VOCABULARIES` with
   `"events.repeat": REPEATS`, `"exams.type": EXAM_TYPES`,
   `"timetableClasses.weekType": WEEK_TYPES`, `"focusSessions.mode": FOCUS_SESSION_MODES`,
   `"calcHistory.mode": CALCULATOR_MODES`.
2. **hexColor** — a `HEX_COLOR_FIELDS` set (`subjects.color`, `events.color`,
   `decks.color`, `studyGroups.color`): a present non-null string must match
   `^#[0-9a-fA-F]{6}$` (the validation.ts:29 atom); nulls already die at the
   non-nullable column (PrismaClientValidationError → the honest 400).
3. **Length atoms** — `IMPORT_FIELD_LENGTHS` += `"calcHistory.expression": 500`,
   `"calcHistory.result": 500`, `"holidays.name": 200`, `"folders.name": 200`,
   `"chatMessages.content": 100_000` (the `PERSISTED_CONTENT_MAX` atom).
4. **The grades ceiling** — `checkDomainCaps`'s grades block adds the validation.ts
   ceiling: `score > 1000` and `maxScore > 1000` both reject (the atom's own bound).
5. **Min-lengths** — a `IMPORT_FIELD_MIN_LENGTHS` registry mirroring validation.ts's
   min-1 atoms (the title/name family: subjects.name, taskLists.name, tasks.title,
   assignments.title, exams.title, events.title, timetableClasses.name, notebooks.name,
   notes.title, decks.name, cards.front, cards.back, practiceTests.title,
   studyGroups.name, grades.title, folders.name, calcHistory.expression,
   calcHistory.result — the exact list re-derived from validation.ts at implementation
   time); the check trims before comparing (`value.trim().length < min` → reject), so
   CH8's tightened interactive boundary and the import boundary agree on blank strings.
   Non-blank values import VERBATIM (no silent trim-mutation of the user's backup rows —
   the interactive route trims on write, the import restores what the file carries; the
   parity contract is "no row the interactive routes would REJECT", documented here).
6. **Key length** — `sanitizeImportRow`'s `Object.entries` loop bounds every JSON key at
   64 chars (the `idField` bound — the longest real field name is ~20; a 900k-char key
   currently passes every check and dies only as PrismaClientValidationError).
7. **The census** — the manifest-consistency census (CH1) covers every registry; the
   vocabulary/length key sets pin exactly; new behavior pins: out-of-vocab
   `timetableClasses.weekType` rejects, in-vocab passes; a bad hex `subjects.color`
   rejects; a 501-char `calcHistory.expression` rejects; `99999/99999` grades reject; a
   `"   "` tasks.title rejects; a 100-char key rejects.

### CH3 (M) — the subjectId FK-index family (the CE9 class closed machine-wide)

`prisma/schema.prisma`: `@@index([subjectId])` added to the ten child models — Task,
Assignment, Exam, TimetableClass, Note, FlashcardDeck, PracticeTest, StudyGroup, Grade,
FocusSession (mirroring `@@index([listId])` / `@@index([notebookId])` / `@@index([deckId])`
/ `@@index([folderId])` / `@@index([parentId])`). The CE9 comment at schema.prisma:455-459
updates honestly (the "every sibling FK carries one" claim was true only for the five it
named — the ten `subjectId` columns were the wider family; this closes it and the census
below makes the claim machine-checked). `tests/schema-indexes.test.ts` gains the
**FK-column census**: every model declaring an FK relation column with `onDelete: SetNull`
or `onDelete: Cascade` (the schema's own text, parsed) must carry an index on that column
— the parentId/FileFolder precedent generalized, so a future FK column without its index
fails loudly. DB rollout: `bun run db:push` for `db/custom.db` (index adds — no data loss;
`--accept-data-loss` is the script's standing flag but nothing is lost); `db/e2e.db` gets
the indexes via its own always-cold `prisma db push` in `tests/e2e/global-setup.ts`
(verified live: the e2e webServer boots from the standalone build while global-setup pushes
the schema into the fresh scratch db — every cert chunk re-derives it).

### CH4 (M) — the envelope-validator twin closed (the route consumes the seam)

The stateless stages (isPlainObject → format identity → version floor/ceiling →
data-object required → unknown-collections → per-collection array check) move into ONE
exported seam function `validateImportEnvelope(input: unknown): { ok: true; data:
Record<string, unknown> } | { ok: false; error: string }` in `src/lib/data-import.ts`,
**aligned to the route's shipped contract** (the e2e-visible behavior wins — the s23 pins
`toContain("studyflow-data-export")` and `toContain("newer version")`):
- non-object → `Expected a ${DATA_EXPORT_FORMAT} envelope.` (the route's message; a
  malformed-JSON body already collapsed to null upstream in the route, which keeps its own
  parse+collapse because the seam takes the parsed value)
- format mismatch → `Unrecognized export format — expected "${DATA_EXPORT_FORMAT}".`
- version non-number OR non-integer OR > max → the route's newer-version message (the
  seam's separate "no readable version number" branch folds in — the honest reconciliation
  of the drifted twin, recorded in §5); < min → the older-version message (identical
  already)
- `data` missing or non-object → `The envelope carries no data object.` (the seam's
  tolerate-and-import-zero-rows branch is REMOVED — the drifted behavior, not the
  contract; its unit pin re-anchors to the 400)
- unknown collection → the by-name message (already identical)
- non-array collection → `The "X" collection must be an array.` (the route's phrasing)

`parseImportEnvelope` becomes a thin wrapper: it calls `validateImportEnvelope`, then
continues its row normalization (importRowIdError + dup-id + secrets-strip) + the
envelope-only FK pre-emption — the unit-pin harness. Its header comment states the honest
split: the stateless stages are PRODUCTION-consumed (the route calls
`validateImportEnvelope`), the row/FK stages are the seam's own richer contract (the
route's FK resolution is account-aware — envelope ∪ owned-existing — and cannot live in a
pure seam; the envelope-only stage stays as the documented divergence, NOT a drift). The
route's inline stages 1-5 are REPLACED by the seam call (messages byte-identical — the s23
e2e legs stay green without modification). The dup-id message twin also closes: the route
adopts the seam's phrasing? NO — the route's shipped message
(`${collection}: duplicate id "${id}" — every row needs a unique id.`) is the e2e-visible
one (`.toContain("s23-dup")` passes either way, but the honest single-source picks ONE) —
an exported `duplicateIdError(collection, id)` helper in the seam carries the route's
phrasing, both callers use it. Pins: the seam's ~30 envelope-stage unit pins re-anchor to
the aligned messages/behaviors; NEW pins: `validateImportEnvelope` direct legs (the
data-object 400, the version folding, the non-object 400); the **caller census**
(script-conventions or data-import.test style): the route source must reference
`validateImportEnvelope(` — the seam can never silently go dead again (the S126 lesson-2
machine guard).

### CH5 (L) — the JSON-column registry fixed + the array-ness mirrored

`JSON_STRING_FIELDS` → `{ tasks: ["subtasks"], practiceTests: ["questions"], exams:
["topics"], events: ["reminders"], notes: ["tags"], studyGroups: ["members"] }` (the
phantom `practiceTests.topics` dropped — PracticeTest's only JSON column is `questions`;
`exams.topics` added — schema.prisma:210). The parse check upgrades to the `jsonArray`
atom's contract: the string must parse to an ARRAY (mirroring the existing members-only
array check at data-import.ts:726-734 — that special case folds into the general check).
Pins: the registry key census + `exams.topics: "not json"` rejects +
`events.reminders: '{"a":1}'` (valid JSON, non-array) rejects + `tasks.subtasks: "[]"`
passes.

### CH6 (L) — the 400-body echo bounded

`sortFoldersParentsFirst`'s cycle message lists the first 10 offenders + `…and N more`
(the full join of every un-emitted id amplifies a 25 MiB cyclic envelope into a ~30 MB
error body). `ImportRowError`'s field interpolation caps the raw key at 64 chars
(`field.slice(0, 64)` + an ellipsis marker). Pins: a 15-folder cycle message contains
"and 5 more" and stays < 1 KB; a 100-char field name's message caps at 64.

### CH7 (L) — the /export counts refresh after an in-panel import

`src/components/export/export-panel.tsx` `onImport` success path: `setResult(summary)` +
`router.refresh()` (the `useRouter` hook — the App Router re-renders the server
component tree of `src/app/export/page.tsx`, re-running its 20 `db.*.count()` calls; the
panel keeps its client state, the grid goes honest). E2e pin (s23-import): read the Tasks
count cell on /export, import a unique-id task envelope through the panel's file input,
await the success line, assert the count cell incremented WITHOUT a page reload.

### CH8 (L) — the trim-before-check on the title/name family

`src/lib/validation.ts:27`: `boundedTitle = z.string().trim().min(1).max(200)` (the AM1
doctrine — a blank name is REJECTED at the boundary, and a padded name stores trimmed).
The folder-name schemas in `src/app/api/files/folders/route.ts:23-26` gain the same
`.trim().min(1)` (matching the multipart branch's existing trim). Blast-radius sweep at
implementation time: grep the e2e/unit suites for posted whitespace-only or
padded-expected titles (none expected — the sweep is the verification); the store's
create/edit forms POST what the user types, the server now normalizes it. Pins: unit —
`taskSchema.parse({title: "   ", ...})` throws, `parse({title: " x "})` → `"x"`; e2e —
a `{"title":"   "}` task POST answers 400 with the field message.

### CH9 (L) — the shared-symbol export moved out of the route file

`MAX_UPLOAD_BYTES` moves from `src/app/api/files/route.ts:31` to
`src/lib/server/http.ts` (beside `FILE_METADATA` — the S125/BZ8 precedent and the
documented rule at http.ts:79-84); the route imports it. The client twin in
`files-view.tsx:53` keeps its documented mirror (http.ts is server-plane; a client
import would bundle server helpers — the mirror comment stays the honest bound). Pin: a
script-conventions census leg — `src/app/api/**/route.ts` files must not `export const`
anything beyond the Next handler/config surface (`GET/POST/PATCH/DELETE/HEAD/revalidate/
dynamic/runtime` — a grep census with the known-clean baseline; the finding's own
evidence is the only current violation).

### CH10 (I) — the 20 s GET deadline single-sourced

`src/lib/api.ts` exports `DEFAULT_GET_TIMEOUT_MS = 20_000` (already exists as a module
const — gains the export); `data.ts`'s `COLLECTION_GET_TIMEOUT_MS` becomes a re-export of
it (`export { DEFAULT_GET_TIMEOUT_MS as COLLECTION_GET_TIMEOUT_MS }` — the pins that read
`COLLECTION_GET_TIMEOUT_MS` keep passing; the comment's "SAME constant" claim becomes
true), and `page.tsx:194`'s inline `timeoutMs: 20_000` consumes the api.ts export. Pin:
`COLLECTION_GET_TIMEOUT_MS === DEFAULT_GET_TIMEOUT_MS` (the identity leg).

## 3. TDD plan (RED → GREEN) + census projection

RED pins (all fail against the CH0 state, all for the RIGHT reason — each verified failing
before any source change):

- **Unit** (`tests/data-import.test.ts`): CH1 — the renamed-key census (fails on
  `"flashcardDecks.*"` present) + the manifest-consistency census (fails: the
  `"flashcardDecks"` prefix ∉ `EXPORT_COLLECTIONS`); CH2 — the extended
  vocabulary/length/min/HEX registries (the census pins fail on the absent keys) + the
  behavior pins (out-of-vocab weekType passes today → pin expects the throw; bad hex
  passes; 501-char expression passes; 99999/99999 passes; `"   "` title passes; the
  100-char key passes); CH5 — `exams.topics` unguarded + the phantom key + non-array
  JSON passes; CH6 — the unbounded offender join + field interpolation.
- **Unit** (`tests/schema-indexes.test.ts`): CH3 — the FK-column census (ten models
  missing `@@index([subjectId])`).
- **Unit** (`tests/data-import.test.ts` + `tests/script-conventions.test.ts`): CH4 — the
  caller census (the route references `validateImportEnvelope`) + the direct seam pins
  (the data-object 400, the version folding) — all fail for the absent export/absent
  call; the ~30 existing parseImportEnvelope pins that asserted the drifted behaviors
  (missing-data tolerance, "no readable version") get RE-ANCHORED in the same RED commit
  (they fail against the new expectations — the designed reason).
- **Unit** (`tests/validation.test.ts` or the schema-adjacent file): CH8 — the trim pins;
  CH9 — the route-export census; CH10 — the deadline identity leg.
- **E2e** (`tests/e2e/s23-import.spec.ts`): CH2 — a hand-edited envelope with an
  out-of-vocab `timetableClasses.weekType` answers the actionable 400 (the live
  third-entry-point proof); CH7 — the counts-refresh journey.
- **E2e** (`tests/e2e/tasks.spec.ts`): CH8 — the whitespace-only title 400.

Census projection: unit 1251 → **~1277** (45 files; +26 estimated: data-import +18,
schema-indexes +1, validation +3, script-conventions +2, api/deadline +1, ±1 honest
drift); e2e 575 → **~578** (chunk map 149+180+74+94+81 — +1 chunk 2 [tasks], +2 chunk 5
[import legs]; the byte-identical-CHUNKS pin updated in lockstep with
`scripts/e2e-chunked-cert.sh`, `scripts/run-cert-chunk.sh`, and the script-conventions
census). The projections are estimates — §5 records the executed census honestly (the
s132 lesson: the projection was 1246/574, the execution 1251/575).

## 4. Deferrals → next-cycle register

- **B-L3 scrypt KDF parameter/versioning migration** (deferred the SIXTH time): the OWASP
  ≥2^17 N-raise is an availability trade-off needing a measured cycle of its own (format
  versioning + `DUMMY_LOGIN_HASH` regeneration + the `tests/auth.test.ts:233` pin
  re-anchor). This cycle was sized by the four M findings from the rotated axes (the
  s132 directive); the KDF seam itself re-affirmed clean by Audit B's full read of
  auth.ts. **The standing candidate for s134** — or the next axis rotation.
- **CH-B5 pre-CE5 unguarded delegates** (the thirteen delegates' ownership-check + write
  as two statements): theoretical only (exploiting the window needs a cross-owner
  delete+recreate race on serialized SQLite by the user against themselves); converts
  only if the CE5 transactional pattern is ever generalized.
- **CH-B6 write-budget census per-file granularity**: the shipped budget posture is
  documented and defensible (single-user; the calculator-POST trimmed-table exception is
  stated in-route); the census tightening is a test-layer nicety.
- **CH-A6 boot double-fetch** (pre-warm + loadAll overlap): ADR-014's contract is about
  parallelism, not fetch-skipping; ~18 extra local GETs per boot; the per-key sequence
  guard makes it safe.
- **CH-A8 newest-500 window vs import minting**: the documented, pinned bounded-read
  posture; flagged because the import is the one feature that can legitimately push a
  single-user account past the window — a surfaced-hint UX improvement, not a defect.
- The standing list: Docker non-root runtime (needs the deploy axis), resend/forgot
  ms-scale timing equalization, drawer-link emission-order coupling, flashcards
  render-phase unlatch, iOS scroll-lock nuance, RFC 7239 signed-proxy posture.

## 5. Execution record (as executed — the honest version)

**RED phase — every pin verified failing for the DESIGNED reason.** Unit: 40 new pins
RED across five files (data-import 26 new `it`s + the drifted missing-data pin re-anchored
and split in two; schema-indexes +1 — the FK-column census naming exactly the ten
`Task/Assignment/Exam/TimetableClass/Note/FlashcardDeck/PracticeTest/StudyGroup/Grade/FocusSession.subjectId`
columns; script-conventions +3 — the CH4 caller census (`expected … to contain
'validateImportEnvelope(''`), the no-inline-twin leg, and the CH9 route-export census naming
exactly `src/app/api/files/route.ts: export MAX_UPLOAD_BYTES` (the finding's own evidence,
the only violation); api-timeout +3 — the data.ts derivation + page.tsx source legs (the
identity leg was NEVER red — the two literals already held the same value; the source legs
are the discriminators); validation +4 — the trim pins + the vocabulary atoms). E2e: 3 pins
RED (CH2 — the Z-week class imported, 200; CH7 — the Tasks chip stayed "Tasks0" for the
full 10 s; CH8 — the whitespace-only title answered 201). The 1251 baseline stayed
otherwise green throughout the RED phase.

**GREEN phase** — the dependency order held: the registry/guard wave (CH1's key rename +
the manifest-census exports, CH2's five vocabularies + HEX_COLOR_FIELDS +
IMPORT_FIELD_MIN_LENGTHS + the four length atoms + the grades ceiling + the key bound,
CH5's registry fix + the generalized array-ness, CH6's truncations) landed in
data-import.ts + validation.ts first; then CH3's ten `@@index([subjectId])` lines + the
honest CE9 comment correction + `db:push` (19 ms, index adds only — zero data loss; the
e2e scratch db re-derives via its own global-setup push); then CH4's
`validateImportEnvelope` seam + the route consumption + the `duplicateIdError` helper;
then CH8's `boundedTitle` trim + the two folder-name schemas; CH9's constant move to
http.ts; CH10's derivation chain; CH7's `router.refresh()`.

**The honest mid-run corrections** (every divergence between the drafted plan and the
executed reality):

1. **The unit census projection was ~1277 (+26); the executed census is 1291 (+40).**
   The CH2 block landed FOURTEEN pins (the drafted §3 sketched "behavior pins" as ~8);
   the CH4 re-anchor split the missing-data pin into two (+1); the per-file arithmetic:
   data-import 73 → 102 (+29), schema-indexes 5 → 6, script-conventions 25 → 28,
   api-timeout 9 → 12, validation 98 → 102, data-store 8 → 8 (mock widened, no count
   change). 1251 + 40 = **1291/1291 (45 files)**.
2. **The e2e census projection was 578; the executed census is exactly 578** —
   149+180+74+94+81, every chunk first-pass. The chunk map re-tagged in both cert scripts
   + the machine-enforced Expected pin in lockstep.
3. **Test-infrastructure corrections caught by the gates themselves**: the manifest
   census initially typed its registry list as `Iterable<string>` (tsc rejected the null
   union — retyped `[string, string[] | null]`); the HEX_COLOR_FIELDS census needed Set
   handling (`[...set]`, not `Object.keys`); the data-store `vi.mock("@/lib/api")` needed
   the `DEFAULT_GET_TIMEOUT_MS: 20_000` export added (the CH10 derivation broke the mock
   contract — the mock now carries the real value so the CD2 deadline pin keeps asserting
   `timeoutMs: 20_000`); and the route refactor's leftover `envelope.user` reference (tsc
   caught it — the profile patch now reads the user block off the validated `raw`).
4. **The CE7 key census re-anchored in place** to the 33-key registry (the dead
   `flashcardDecks.*` twins gone, the four CH2 atoms present, with six spot-asserted
   values); the "unknown field keeps the 1 M default" leg re-anchored in place (its
   example field `focusSessions.mode` is now a mirrored enum — the contract moved to a
   genuinely unknown field name).
5. **The CH2 e2e pin's fixed-id collision on re-runs** (the S46 class — a standalone
   re-run against a non-cold scratch db answered 409 instead of the designed 200): a
   Date.now-stamped probe id adopted; the designed RED reason (the 200) was observed on
   the first run and is the recorded one.
6. **The capture-script flakes**: the first frame-3 attempt timed out on the /export
   goto (dev cold-compile) and the second raced React hydration (the Import button
   stayed disabled — a server-rendered `disabled` before the onChange handler attached);
   the fix is the API-level login on the context jar (the s132 capture precedent's own
   lesson, now twice-learned) + the warmed route; the third run GREEN first-pass — the
   frame shows the summary AND the refreshed Tasks chip (12 → 13), the probe row deleted
   after (the quiescence discipline).
7. **The tripwire instrument lesson**: the register's "usage-line-free" leg is
   importers − carriers (the s77-era definition), NOT "all files without Usage lines"
   (the first reading produced a bogus 143); the reconciled instrument (the census's own
   regexes): **251 / 132 / 0 / 119 — the 44th consecutive hold** (the +1/+1 over the
   prior 250/131 is this cycle's own `capture-s133-evidence.mjs`, Usage line per the
   S97/AX2 convention).

**Re-cert** — lint ✓ · `tsc --noEmit` ✓ · unit **1291/1291** (45 files) · the canonical
build green (foreground, exit 0) · the cold 5-chunk e2e **578/578 — 149+180+74+94+81,
every chunk first-pass** · the live drawer battery re-run GREEN on the remediated tree —
**the 42nd consecutive no-Tailwind-v4-mobile-nav-bug confirmation** (the focus-restore
leg verified through a REAL agent-browser click after the synthetic-click path correctly
demonstrated that `.click()` carries no focus) · three evidence frames under
`docs/screenshots/133-clone-*` (the desktop dashboard, the mobile drawer, the NEW CH7
counts-refresh surface — the capture script's own chip-flip wait `12 → 13` + the passing
e2e pin are the machine proof) · `.env.example` verified current (no new env vars in the
CH set). **Census: 1291 unit + 578 e2e = 1869 green.**
