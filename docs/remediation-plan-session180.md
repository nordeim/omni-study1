# The S180 remediation plan — Batch ED: the notes Attach-File wire feature (B-6) + the B-8 toolbar-drift port

## §0 The environment (the cold-clone re-derivation)

The workspace was COLD (a fresh clone at `cbfc8a9` — the sandbox recycled
after the S179 push; the PRIOR session's in-flight S180 work was lost to the
recycle BEFORE any commit, twice). Per the standing doctrine (the worklog's
S190 entry: "every reference fact RE-measured by a fresh live probe"), this
cycle RE-MEASURED every reference fact live — the probes below are fresh,
computed-DOM, zero-residue on the reference account at the close of each.

Environment: bun install (510 pkgs) · `.env` from `.env.example`
(`DATABASE_URL="file:../db/custom.db"`, `db/` at the repo root) ·
`bun run db:push` + `bun run db:seed` (demo account ready) · chromium
installed. Cold baseline gates reproduce the S179 close EXACTLY:
lint ✓ · tsc ✓ · unit **1761/1761** (53 files) — the standing green state.

## §1 The cycle's ledger (the S179 close's named candidates)

The S179 close named the head: **B-6 the Attach row** (the last
measured-deferred notes surface — the file-upload wire feature), **B-8 the
toolbar deltas** (the Font row's measured drift: wrap strip classes, select
size, the missing separator, the black Divider — the S77-era shape), the
notes-family e2e depth (the consolidation candidate), and the standing
Subjects/Holidays rotation. This cycle ships B-6 + B-8 in ONE rotation
(both surfaces live in the same editor rows; one Prisma push + one view
pass). The e2e consolidation and the Subjects/Holidays rotation stay
deferred (the reference re-probe cadence holds).

## §2 The measured inventory (the fresh probes: s180-attach.mjs ×3)

All measurements computed-DOM on the reference (2026-11-13), probe residue
ZERO at each probe's close (verified `No notes yet` + no probe rows).

### B-6 — the Attach File anatomy

- **The row** (draft + edit, identical; sits AFTER the tag row, BEFORE the
  editor card): `div.flex.items-center.gap-2.mb-4.flex-wrap` — children in
  order: the label-affordance, then the chips.
- **The affordance**: a `label.cursor-pointer` wrapping an outline-styled
  SPAN — `inline-flex items-center justify-center gap-2 whitespace-nowrap
  font-medium transition-colors … border border-input bg-background
  shadow-sm hover:bg-accent hover:text-accent-foreground h-8 rounded-md
  px-3 text-xs` with `svg.lucide-paperclip.w-4.h-4.mr-2` + the text
  "Attach File" — and the `input[type=file].hidden` (single-file: NO
  `multiple`, NO `accept`).
- **The wire**: the upload fires IMMEDIATELY on pick — the reference POSTs
  multipart to its platform upload endpoint and receives
  `{"file_url": "<hosted url>"}`. The Save create POST body carries
  `attachments: [{"name": …, "url": …}]` (the probe's captured body:
  `{"title":…,"content":"",…,"attachments":[{"name":"s180-probe-file2.txt",
  "url":"https://base44.app/…/c1a692a36_s180-probe-file2.txt"}]}`).
- **The chip** (draft + edit): a DIV — `inline-flex items-center rounded-md
  border px-2.5 py-0.5 text-xs font-semibold transition-colors …
  text-foreground gap-1` — carrying `a.hover:underline` (href = the file
  url, `target="_blank" rel="noopener noreferrer"`) + the X-remove as a
  BARE `svg.lucide-x.w-3.h-3.cursor-pointer` (the reference's own a11y
  laxity; the clone ships the aria-label button superset — the S178
  lesson-4 posture).
- **The X-remove is LOCAL-only** (the net probe: ZERO network on the click
  — the S178 local-state family; the removal persists through the Save's
  attachments array).
- **The view mode** (BOTH kinds — text and coding): an "Attachments"
  section BELOW the body — `div.mt-6.pt-4.border-t.border-slate-200`
  (the coding view's section sibling is the `pre.font-mono` body) with
  `p.text-sm.font-medium.text-slate-500.mb-2` "Attachments" and the pills:
  `a.flex.items-center.gap-2.px-3.py-2.bg-slate-100.rounded-lg
  .hover:bg-slate-200.transition-colors` (target=_blank) carrying
  `svg.lucide-paperclip.w-4.h-4.text-slate-400` + `span.text-sm` name.
- **The coding draft carries the row** (textarea pane: title row → tag row
  → Attach row → editor card — NO Font row); the text draft: title row →
  Font row → tag row → Attach row → editor card.

### B-8 — the Font-row drift (the toolbar deltas)

- **The strip**: `flex items-center gap-3 mb-4 p-3 bg-slate-50 rounded-lg
  flex-wrap` (the clone's `mt-2 flex flex-wrap items-center gap-2` drifts:
  no strip, no gap-3, no mb-4).
- **The label**: `span.text-xs.text-slate-500.font-medium` "Font:" (inside
  a wrapper `div.flex.items-center.gap-2` with the select).
- **The select trigger**: the shadcn default trigger classes verbatim
  (`… border border-input bg-transparent px-3 py-2 text-sm shadow-sm …`)
  with `w-32 h-8` (the clone's `h-7 w-28 text-xs` drifts).
- **The separator**: `div.h-6.w-px.bg-slate-200` between the select and
  the Divider (the clone carries none).
- **The Divider button**: the shadcn OUTLINE variant — `… border
  border-input bg-background shadow-sm hover:bg-accent
  hover:text-accent-foreground rounded-md px-3 text-xs h-8 gap-1` with
  `svg.lucide-minus.w-4.h-4` — the clone's `bg-neutral-950` black button
  was the S77 dark-mode computed artifact, corrected by this measurement.
- **The options**: [Default, Serif, Sans-serif, Monospace, Cursive] — 5
  (the clone ships 3: Sans/Serif/Mono).

## §3 The port design (the superset mapping)

### §3.1 The wire layer

- **Prisma**: the new `NoteAttachment` model — `id cuid`, `userId`,
  `noteId String?` (null = STAGED — the draft's upload scratch), `name`,
  `mime`, `size Int`, `data String?` (base64 ≤ 2 MiB — the files-table
  posture), `createdAt`, `updatedAt`; relations: `user` (Cascade),
  `note` (Cascade, optional). Composites: `@@index([noteId, createdAt,
  id])` (noteId leftmost — the list composite) + `@@index([userId,
  createdAt, id])` (userId leftmost — the sweep composite; the schema
  FK-census contract). `Note` gains `attachments NoteAttachment[]`; `User`
  gains `noteAttachments NoteAttachment[]`. One `bun run db:push`.
- **The url is DERIVED, never stored** (no drift hazard): the row's url is
  `/api/notes/attachments/<id>` — minted at the read boundary (the upload
  response, the note GETs). The export carries no url column; the import
  lands rows whose url derives from the id.
- **validation.ts** (client-safe, single source): `NOTE_ATTACHMENT_CAP =
  10`, `NOTE_ATTACHMENT_URL_PREFIX = "/api/notes/attachments/"`, the
  `noteAttachmentRefSchema` atom (`{name: trim ≤200, url: startsWith the
  prefix, ≤200}`), and `noteSchema.attachments =
  z.array(noteAttachmentRefSchema).max(NOTE_ATTACHMENT_CAP).optional()` —
  OPTIONAL, NEVER `.default([])`: the run-2 lesson — Zod 4's `.partial()`
  fires defaults, so a defaulted atom would erase the sent-key
  distinction and every field-scoped PATCH (title/content/tags) would
  carry `attachments: []` and WIPE the note's attachments. Absent =
  untouched; sent = the authoritative desired list.
- **The pure seam** `src/lib/server/note-attachments.ts`:
  `NOTE_ATTACHMENT_METADATA` (the read select: id, name, createdAt),
  `noteAttachmentUrl(id)` (the derived url), `attachmentIdFromUrl(url)`
  (prefix strip + id shape validation — the 400 family), the
  ownership-verified bind transaction
  (`bindNoteAttachments(userId, noteId, refs)` — every listed id must be
  owned + (staged OR already this note's); bind the staged (`noteId:
  null → noteId`), delete this note's rows NOT in the list (the removal
  leg)), and the include reads (`listNotesWithAttachments(userId)` — the
  factory's newest-500 window + reverse + the attachments include,
  url-derived; `readNoteWithAttachments(userId, id)`).
- **The routes** (all reuse the factory's helpers verbatim — `withUser`,
  `withUserParams`, `readJson`, `parseWith`, `checkRateLimit`,
  `rateLimitedResponse`, `errorResponse`):
  - `src/app/api/notes/route.ts` — REPLACES the delegate pair: GET (the
    include list) + POST (the write budget → readJson → parseWith the
    create schema → `noteDelegate.create` (the sanitize gate + ownedFks
    ride unchanged; the delegate's writeTransform STRIPS the wire-only
    atom) → the bind if `parsed.attachments !== undefined` → the include
    re-read, 201).
  - `src/app/api/notes/[id]/route.ts` — PATCH (the write budget → the
    raw-split: `parseWith(noteSchema.partial(), raw)` for the atom + the
    delegate update for the base write → the bind if sent → the include
    re-read) + DELETE (the delegate remove; the schema's Cascade deletes
    the attachments).
  - `src/app/api/notes/attachments/route.ts` — POST the staged multipart
    upload (the Files POST guards VERBATIM: `upload:${user.id}` 20/15-min
    budget, `readBytesCapped` at MAX_UPLOAD_BYTES + 64 KiB, the
    empty-name/length/mime-printable/size guards) → the staged row + the
    derived url, 201.
  - `src/app/api/notes/attachments/[id]/route.ts` — GET the FLAT download
    (the `files/[id]` contract verbatim: ownership-scoped, serves STAGED
    AND bound rows — the draft chip's href is LIVE before the Save binds;
    `downloadHeaders(name, mime)`; `withUserParams`' `id` param name).
- **The delegate strip**: `noteDelegate`'s writeTransform composes —
  `sanitizeNoteContent(stripNoteAttachments(data))` — the wire-only atom
  never reaches Prisma (both write paths flow through toWrite; the
  delegate stays the write engine: the ownedFks + the empty-patch
  short-circuit + the CO1 sanitize gate ride unchanged).
- **Import/export lockstep** (the BT1b third-entry-point doctrine):
  - export: `noteAttachments` joins `EXPORT_COLLECTIONS` (20 → 21) + the
    `export-build.ts` reader — `where: { userId, noteId: { not: null } }`
    (STAGED ROWS NEVER EXPORT — the run-2 caught bug: a staged orphan
    rides the export and the import's REQUIRED-FK guard 400s the user's
    own backup; staged scratch is not the user's persisted data).
  - import: `IMPORT_ORDER` + `IMPORT_FK_MAP`
    (`noteAttachments: [{ field: "noteId", target: "notes", required:
    true }]`), `IMPORT_FIELD_LENGTHS` (`name: 200`, `mime: 100`),
  `ENUM`… none (the attachment has no enum fields), the route `MODEL` map
  (`noteAttachments: "noteAttachment"`), and the `sanitizeImportRow` block
  (the files twin: non-empty name ≤ 200, the data ≤ base64 cap, the size ≤
  2 MiB, the mime printability — a hand-edited backup must not persist
  rows the interactive routes would 400).

### §3.2 The client layer

- `apiSend` gains the FormData branch (the browser owns the multipart
  boundary — NO JSON Content-Type override).
- `NoteRow` gains `attachments: { id: string; name: string; url: string
  }[]`; the mutation `uploadNoteAttachment(file): Promise<{id, name,
  url}>` (FormData POST → the staged row).
- The staged rows ride the draft's local list; the Save's POST/PATCH
  carries `attachments: [{name, url}]` (the reference's own wire shape).

### §3.3 The view surfaces (notes-view.tsx)

- **`NoteAttachRow`** (the shared component, after `NoteColorButton`):
  the label + outline-span affordance (aria-label "Attach file" — the
  superset over the reference's bare label; the hidden single-file input)
  + the chip list (the badge-family DIV with the `a.hover:underline`
  target=_blank + the aria-label X-remove button — the S178 lesson-4
  superset posture).
- **The draft**: the attach row AFTER the tag row (the measured order),
  the local staged list state, the pick → `uploadNoteAttachment` →
  append, the X → local remove, the Save POST carries the list.
- **The edit surface**: the same row (after the edit tag row); the Edit
  click SEEDS the working list from `selected.attachments`; the Save
  (`saveNow`) PATCHes the list after the content leg; the X-exit is
  local-only (the measured posture — the removal never persists without
  the Save).
- **The view mode**: the Attachments section below the body (BOTH kinds —
  the coding view's section sits below the `pre`): the border-t strip +
  the heading + the pills, rendered only at ≥ 1 attachment.
- **The B-8 Font-row port** (draft + edit — both sites): the bg-slate-50
  strip (`flex items-center gap-3 mb-4 p-3 bg-slate-50 rounded-lg
  flex-wrap`), the wrapper (label + select), the `w-32 h-8` select
  trigger (the default text-sm), the `h-6 w-px bg-slate-200` separator,
  the outline Divider (`Button variant="outline"` + `h-8 px-3 text-xs
  gap-1` + `Minus size-4`).
- **`EDITOR_FONTS`** (quill-editor.tsx): 3 → 5 —
  `default` ("Default" — REMOVE the font-family property; the inherited
  stack), `serif` ("Serif"), `sans` ("Sans-serif"), `mono`
  ("Monospace"), `cursive` ("Cursive") — the labels + the order measured;
  the font state's initial moves to "default"; the empty stack uses
  `removeProperty` (an empty `setProperty` leaves the old value — the
  run-2 lesson).

## §4 The TDD plan (the RED markers, watched honestly)

- **Unit pins** (vitest):
  - `tests/note-attachments.test.ts` (the NEW 54th file — the pure-seam
    spec): the url derivation round-trip, `attachmentIdFromUrl`'s
    rejection family (bad prefix, empty id, > 64-char id), the metadata
    select shape, the bind's transactional semantics (staged bind,
    removal leg, the foreign-note rejection, the foreign-user
    rejection), the cap enforcement through the schema atom. RED
    pre-implementation: the file fails to LOAD (the seam does not exist).
  - `tests/validation.test.ts`: the atom's shape pins (the sent-array
    parse, the > cap 400, the bad-prefix url 400, the bad name 400) +
    the OPTIONALity pin (a field-scoped PATCH body without the key
    parses with `attachments === undefined`).
  - `tests/data-import.test.ts` + `tests/data-export.test.ts` + the
    census pins: the 21st collection in the manifest, the FK-map entry,
    the FIELD_LENGTHS keys, the row-guard twin block, the REQUIRED-FK
    noteId.
  - `tests/schema-indexes.test.ts`: the FK census (noteId leftmost on
    the list composite; userId leftmost on the sweep composite).
  - `tests/script-conventions.test.ts`: the findMany count 20 → 21, the
    cert-runner census re-tags.
  - The unit census moves 1761 → **1780** (+19: the seam spec +10, the
    validation atoms +4, the import/export/registry re-anchors +5 — the
    final count verified at the close, the plan's §7 record).
- **The honest RED discipline** (the S179 §5 doctrine): the unit pins run
  against the STASHED pre-change tree (the source stashed; the Prisma
  client REGENERATED for the stash — the client is a build input), and
  every pin's failure is WATCHED at its designed marker before the
  implementation lands.
- **e2e pins** (parity-session7, the ED block after EC4):
  - ED1 the attach-row anatomy (the draft: the label affordance + the
    hidden single-file input, the outline span classes).
  - ED2 the wire (the pick → the staged POST 201 → the chip renders →
    the Save POST carries `attachments:[{name,url}]`).
  - ED3 the view pills (the save → the Attachments section + the pill
    link + the paperclip icon; the download route serves the bytes
    200).
  - ED4 the edit surface (the Edit seeds the chip; the X removes
    locally — zero PATCH; the Save persists the removal — the note's
    list re-reads without the row).
  - ED5 the coding draft carries the row (no Font row) + the coding
    view's section below the pre body.
  - ED6 the B-8 Font-row port (the strip classes, the w-32 h-8 select,
    the separator, the outline Divider computed light-mode tokens, the
    5 options — `exact: true` on the option names: "Sans-serif" is a
    substring of nothing, but "Serif" matches "Sans-serif" under the
    default substring matching — the run-2 pin bug).
  - ED7 the staged download route's ownership (a foreign user's staged
    id 404s; the flat route serves the staged row to its owner).
  - The AD5 re-anchor: the retired black-Divider assertions → the
    outline variant's computed light-mode tokens (bg rgb(255,255,255)
    — `bg-card` on the outline variant; text rgb(10,10,10)).
- **The e2e census moves 666 → 673** (chunk 2: 223 → 230, +7 — the ED
  block; AD5 is a re-anchor, count-neutral). The cert runner scripts +
  the census pins re-tag in lockstep (the machine-enforced map:
  158 + 230 + 101 + 95 + 89 = 673).

## §5 The execution order

1. The unit pins, RED-first (the stash discipline — the honest RED).
2. The Prisma push + the client regen (the schema is every layer's input).
3. The validation atoms + the pure seam + the delegate strip.
4. The four routes (the custom note pair + the staged upload + the flat
   download).
5. The import/export lockstep (the registries + the row guard + the
   reader).
6. The client layer (apiSend FormData + NoteRow + the mutation).
7. The surfaces (the NoteAttachRow + the three placements + the B-8 port
   at both sites + EDITOR_FONTS).
8. The unit GREEN + lint + tsc + build.
9. The e2e pins (the honest RED on the pre-change build → the GREEN on
   the post-change build) + the AD5 re-anchor.
10. The census re-tags + the doc-chain lockstep.
11. The 5-chunk cold cert map. The evidence frames. The cycle gates.

## §6 The adjudications (the open questions, resolved)

1. **The url is DERIVED from the id** (never stored) — the chip/pill href
   is the clone's own download route; the reference's hosted-CDN url is
   its platform's storage detail, not a portable contract. The wire SHAPE
   (`attachments:[{name,url}]`) is the parity contract.
2. **The staged row is the draft's scratch** — a picked-but-never-saved
   upload leaves an owned, ≤ 2-MiB, invisible staged row (the reference's
   own posture: its probe uploads linger on its CDN). The export EXCLUDES
   staged rows (never the user's persisted data); no GC ships this cycle
   (the 20/15-min upload budget bounds growth).
3. **The bind is transactional + ownership-verified** — a listed url whose
   row is foreign, missing, or bound to ANOTHER note answers the 400
   family (the CN10 owned-FK re-point posture; the reference's own
   platform resolves ids opaquely — the clone's honest-status superset).
4. **The atom is OPTIONAL, never defaulted** — the run-2 lesson (§3.1);
   the field-scoped PATCHes must not wipe attachments.
5. **The X-remove is local** (measured zero-network) — the removal rides
   the Save's array; the a11y superset rides the X (the aria-label
   button over the bare svg).
6. **The Divider is the outline variant** — the S77 "black" record was the
   dark-mode computed artifact; the light-mode computed tokens pin AD5.
7. **The 5-option font select** rides the measured labels [Default,
   Serif, Sans-serif, Monospace, Cursive]; "default" REMOVEs the
   font-family property (the empty stack — the inherited editor font).
   The cursive VALUE is the clone's own stack (the functional-lite
   superset posture — the reference's own applied stack is its platform
   CSS, unmeasured and non-portable): `'Segoe Script', 'Brush Script MT',
   cursive`.
8. **The tag row's mb-4 vs mt-2 drift is OUT OF SCOPE** — the S77/AD6
   recorded anatomy stays (the B-6/B-8 scope discipline; a full-row
   re-port is its own cycle if the standing probes flag it).
9. **The row ORDER is measured**: Font row → tag row → Attach row (the
   attach row sits AFTER the tag row on every surface — draft text,
   draft coding, edit).
10. **The probe-tooling record**: Radix triggers need trusted clicks
    (Playwright locators, not evaluate-JS clicks); the menu-unmount wait
    before any keyboard interaction after a menu pick (the EB3 lesson);
    `getByRole` `exact: true` for the "New Note"/"New Notebook" pair and
    the font option family; the reference's X-remove is a BARE SVG (a
    `button` locator never finds it).

## §7 The cycle gates (the standing contract)

lint ✓ · tsc ✓ · unit (the §4 count) · build ✓ · the tripwire 138/138
after the doc-chain lockstep · **the full 5-chunk cold cert map 673/673**
(158 + 230 + 101 + 95 + 89 — every flake isolation-verified, no assertion
weakened) · the drawer check GREEN (the standing Tailwind v4 mobile-nav
watch) · the desktop parity probe MATCH (all five structural checks) ·
zero residue on BOTH accounts (the demo db restored through the trash;
the reference re-verified at 0 notes) · the evidence frames
self-verifying (the DOM markers asserted before every shot; the non-blank
pixel ratios verified).

## §8 The doc chain

`docs/screenshots/` += the 180-cycle frames (the draft attach row + the
chip, the saved note's view pills, the edit chip row, the mobile drawer).
README row + badge · AGENTS census + the S180 lessons · CLAUDE pairs ·
PAD version + the NoteAttachment model row + the route rows · the SKILL
sites · the vitest header · the cert runner re-tags (both scripts) ·
`docs/session_232.md` · this plan's §10/§11 · worklog Session-191 ·
`.env.example` re-verified (no env changes this cycle).

## §9 The risks (the recorded environmental posture)

- The 5-chunk cert's known flake classes (the S176 stall windows, the
  register-budget ordering) — every flake isolation-verified, the count
  never weakened.
- The dev server's stale-Turbopack reload loop after a mid-session
  restart — `bun scripts/dev-server-preflight.mjs` BEFORE any capture
  (the documented remedy: `rm -rf .next/dev` + restart).
- The e2e webServer boots the PRE-BUILT standalone — the honest e2e RED
  needs the PRE-CHANGE build + the Prisma client REGENERATED for the
  stash (the S179 §5 doctrine; the client is a build input).
- NEVER two :3100 listeners (the run-2 collision lesson: a manual cert
  chunk run against the running cert map poisons the chunk — one cert
  map at a time, kill by port before every chunk).

## §10 The as-executed close (filled at the cycle's end)

Executed as planned, with three root-caused unplanned legs (all
lesson-recorded):

- **§2/§3.1 landed exactly** — the NoteAttachment model (one `bun run
  db:push`), the derived-url design (no drift hazard, the url minted at
  the read boundary), the pure seam, the four routes (the custom note
  pair replacing the factory pair with the bind leg; the staged upload
  on the SHARED upload budget; the flat download serving staged AND
  bound rows), the delegate strip composing with the sanitize gate (the
  CR1 own-keys fix en route), and the import/export lockstep (the
  REQUIRED-FK noteId, the staged-rows-never-export reader, the
  row-guard twins, the FIELD_LENGTHS parity sources).
- **§3.2/§3.3 landed exactly** — the FormData branch (the browser owns
  the boundary), the NoteRow + the mutation, the NoteAttachRow
  component (the aria-label superset over the reference's bare svg),
  the three placements at the measured row order, the view section on
  both kinds, the B-8 strip port at both sites, and EDITOR_FONTS 5 with
  the removeProperty fix for the "default" stack.
- **§4's honest REDs were PROVEN at both layers**: the unit pins against
  the pre-change tree (8 failed tests + the seam file-load failure at
  the designed markers — the missing atom, the required-FK pair, the
  FIELD_LENGTHS keys, the row-guard block, the 20-vs-21 findMany); the
  e2e pins against the TRUE pre-change standalone — **the
  tests-stashed build mechanics** (the §9 discovery: `next build`
  typechecks tests/ with the app, so stashing only src/ leaves the new
  specs referencing not-yet-existing exports and the build dies at
  "Failed to type check"; the stash carries the tests too, then
  restores ONLY the tests for the sweep), all 7 pins (AD5 + ED1-ED6)
  failing at their designed markers.
- **The unplanned legs**: (1) the Zod-4 `.partial()` default-fires
  lesson — the atom ships `.optional()`, never `.default([])` (a
  defaulted atom fires on every field-scoped PATCH and the bind
  executes the empty array as a wipe; the sent-key distinction lives
  in the raw body); (2) the census verified by `--list`, never
  estimated — the plan's §4 projected +7 e2e pins; the implementation
  folded the download-ownership leg into ED3, and the map is
  **158+229+101+95+89 = 672**, not the projected 673; (3) one
  parity-probe reference leg returned all nulls (the settled-state wait
  raced the reference's login/splash) — the direct login diagnosis
  (200, nav + main) confirmed the account healthy and the re-run
  MATCHED.
- **The gates**: lint ✓ · tsc ✓ · unit **1779/1779** (53 → 54 files,
  +18: the seam spec +12, the validation atoms +3, the row-guard twins
  +4, the re-anchored census pins) · build ✓ · **the full 5-chunk
  cold cert map 672/672 GREEN — FIRST ROLL, ZERO FLAKES**
  (158/158 · 229/229 · 101/101 · 95/95 · 89/89 — every chunk
  first-pass) · the tripwire 138/138 after the doc-chain lockstep ·
  the drawer check GREEN (**the 119th at the open, the 120th at the
  close** — no Tailwind v4 mobile-nav bug) · the desktop parity
  probe MATCH (all five structural checks) · zero residue on BOTH
  accounts (the demo db restored to the seed state through the trash;
  the reference re-verified at 0 notes).
- **The evidence frames**: the four §8 frames captured self-verifying
  (`scripts/capture-s180-evidence.mjs` — every frame's DOM markers
  asserted before the shots: the outline affordance + the staged
  chip's derived href + the B-8 strip classes + the single-file input;
  the section + heading + pill classes + the paperclip icon + the
  download 200 with the exact payload; the seeded chip + the badge
  classes + the outline Divider; the 20-link drawer panel; the
  non-blank pixel ratios 46-62%). The capture's own unplanned fix: the
  zero-residue check POLLS (a single snapshot raced the DELETE's
  refetch — the trash worked, the list re-render lagged; the run-2
  lesson re-derived), and the mobile-drawer leg reuses the
  drawer-check's dialog-root scoping (a document-wide w-72 search
  matches a hidden wrapper).

## §11 The final checklist (the operator's asks, mapped)

- [x] `.env` at `DATABASE_URL="file:../db/custom.db"`, `db/` at the
      repo root — re-verified this session (§0) and at the close
      (byte-identical to `.env.example` at the documented dev posture;
      no env changes this cycle).
- [x] The mobile-nav drawer check GREEN (the Tailwind v4 watch) — the
      standing tripwire (§7): the **119th consecutive at the open, the
      120th at the close**, no Tailwind v4 mobile-nav bug.
- [x] The vitest + playwright suites validated + extended (the ED
      pins) — §4/§7: unit 1761 → **1779** (54 files), e2e 666 → **672**
      (the 5-chunk cold map all-first-roll GREEN).
- [x] The remediation plan saved under `docs/` (this file) + validated
      against the codebase before execution (§0/§1 re-reads; every seam
      read before the plan was written).
- [x] The dev-server screenshots under `docs/screenshots/` (§8): the
      four 180-cycle frames, self-verifying.
- [x] `.env.example` matches the codebase (re-verified — no env
      changes this cycle; §8).
- [x] The doc chain updated in lockstep (§8): README row + badge ·
      AGENTS census + the S180 lessons (five) · CLAUDE pairs · PAD
      v1.3.88 · the SKILL sites · the vitest header · the cert runner
      re-tags · `docs/session_232.md` · this §10/§11 · the worklog
      Session-191 entry.
- [x] `worklog.md` updated + included in the final commit (§8).
- [x] The commit + the SSH-wrapper push to
      `git@github.com:nordeim/omni-study1.git` on `main` — the
      operator's directive, executed at the cycle's close.
