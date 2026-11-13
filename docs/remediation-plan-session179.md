# Remediation Plan — Session 179 (Cycle 129, Batch EC)

> Status: PLANNED (pre-change record — the immutable plan; the as-executed
> close lives in §10). Written before any source change, per the standing
> doctrine ("write the cycle plan into docs/remediation-plan-sessionN.md
> BEFORE any source change").
>
> Operator directive: refresh the workspace, re-read the doc chain
> (AGENTS/CLAUDE/README/PAD/SKILL + session_228 + session_229 +
> remediation-plan-session178 + worklog), validate against the codebase,
> audit with the repo-included skills (skills/web-application/SKILL.md the
> primary; the skills catalog for the rotation), iterate toward
> visual/functional parity with omni-study1.base44.app (live reference
> login, mobile-nav attention, the Tailwind v4 bug watch), keep `.env` at
> `DATABASE_URL="file:../db/custom.db"` + the repo-root `db/`, validate the
> vitest/playwright suites, remediate TDD-first, capture evidence frames,
> update the doc chain, push via the SSH wrapper. The repo's `skills/`
> folder stays excluded from code checking, testing, and compilation.
> Proceed with best judgement on the remaining open questions (the
> operator's standing instruction).
>
> Session note: this cycle continues the rotation from the S178/Batch EB
> close (`0659ac1` + the plan-close `e5d098d` + the operator's session_228
> transcript commit `737bbe4`, all pushed + remote-verified). The workspace
> was COLD (a fresh `git clone` at `737bbe4` on `main` — the prior
> session's in-flight S179 work was lost to the sandbox recycle BEFORE any
> commit; every measurement below was RE-measured by a fresh live probe
> THIS session). Every reference fact below was measured by a live gated
> probe THIS session (agent-browser, computed DOM) before this plan was
> written; every clone fact by direct read of the working tree.

## §0 Scope, method, cold baseline, live parity

**Workspace (cold — `git clone` at `737bbe4` on `main`; the working tree
clean).** `bun install` ✓ (510 packages); `bunx playwright install
chromium` ✓ (chromium + chromium-headless-shell v1243); `bun run db:push`
/ `db:seed` ✓ (the seed line "demo account ready — demo@studyflow.app /
Demo1234!"); `cp .env.example .env` ✓ at
`DATABASE_URL="file:../db/custom.db"`; `db/` at the repo root.

**Cold baseline gates (re-run this session before any change):** `bun
run lint` ✓ · `bun run typecheck` ✓ · `bun run test` ✓ **1743/1743 (52
files)** — the documented S178 close state reproduced exactly (the
gate logs re-verified before the implementation legs).

**Method.** Computed-DOM authority (the repo doctrine): every reference
fact below was measured by a live gated probe this session (login →
Notes → create-through-the-reference's-own-UI → measure → cleanup),
every clone fact by the mirrored probe or direct read. Zero residue on
the reference write-path probes (both probe notes deleted, the end
state re-verified at 0 notes / "No notes yet"). Probe lessons from the
prior session's log re-confirmed: Radix popover triggers need NATIVE
pointer events (the agent-browser ref click), and JS `.click()` on the
plain swatch buttons DOES apply (both documented in §9).

## §1 The audits (Mode-C; every finding re-verified by direct read or live probe)

The S178 close (worklog session 189) recorded the S179 candidate ledger:
the rum-write contention fix (the beacon's per-metric POST batching),
the pin/palette (B-4/B-5), the coding notes (B-7), the Attach row
(B-6), the reference's toolbar deltas (B-8). This cycle closes the
four-item head of that ledger — the rum batching + the pin + the
palette + the coding notes — in ONE notes-family rotation (the schema
additions ride one Prisma push + one delegate surface; the Attach row
B-6 stays deferred — §9.6).

### A. The reference measurements (all live-probed this session, computed DOM, zero residue)

**A-1. The header dropdown carries THREE items** —
`[New Note][New Coding Note][New Notebook]` (menuitem roles, measured
in order). The clone ships two (`New Note` / `New Notebook`) — the
`New Coding Note` item is the missing B-7 entry.

**A-2. The coding-note DRAFT editor** (via "New Coding Note"): the
title row is `[title input][Language select 128×36 — "JavaScript"
default][notebook select 128×36 — "None"][palette 36×36][Save 98×36
lucide-save][X 48×36 lucide-x]`; below: the tags row ("Add tag...")
+ the Attach File row (B-6, deferred) + the body — a `textarea`
(placeholder "Write your code notes here...", the shadcn textarea
anatomy `flex min-h-[60px] w-full rounded-md ...`), NO Font row, NO
Divider, NO Quill. The **Language select options (14, in order)**:
JavaScript (default) / Python / Java / C++ / C# / HTML/CSS / SQL /
Ruby / Go / Rust / PHP / Swift / Kotlin / TypeScript.

**A-3. The regular-note DRAFT** now carries the palette too:
`[title][notebook 128][palette 36][Save 98][X 48]` + Font row + tags +
Quill — i.e. the S177-ported draft gains ONLY the palette button (the
clone's current draft has no palette).

**A-4. The VIEW-mode toolbar** (existing note): the title row
container is `flex items-center justify-between mb-4`; the left side
`flex items-center gap-3 flex-1 min-w-0` holds — for a CODING note —
the **language badge** (`inline-flex items-center rounded-md border
px-2.5 py-0.5 text-xs font-semibold ... text-foreground gap-1
flex-shrink-0` + `lucide-code` icon + the language name, e.g.
"JavaScript") BEFORE the disabled title; the right side is the action
row `[pin 36×36 lucide-pin][palette 36×36 lucide-palette][Edit 93×36
lucide-pen + text][trash 50×36 lucide-trash2]`. For a text note the
badge is absent. The pin/palette are icon-only with NO aria-label on
the reference (the clone ships its superset aria-labels — §9.7).

**A-5. The pin behavior**: the toolbar pin toggles instantly
(optimistic, no navigation): unpinned = `lucide-pin w-4 h-4` (plain);
pinned = `lucide-pin w-4 h-4 fill-violet-50` (the toolbar tint). The
LIST row of a pinned note renders `lucide lucide-pin w-4 h-4
text-violet-500 fill-violet-500 flex-shrink-0` at the RIGHT of the
title line (the second child of the row's `flex items-start
justify-between` wrapper). The list becomes SECTIONED: a "Pinned"
section header (`p.text-xs.font-semibold.text-slate-500.mb-2.uppercase`
+ `div.space-y-2` rows) above the "All Notes" section (same header
anatomy) inside a `flex-1 overflow-y-auto space-y-4` scroll container;
with ZERO pinned notes the "Pinned" section disappears ("All Notes"
remains whenever notes exist). **Pinned-first sorting**: the pinned
row sorts ABOVE a NEWER unpinned row (measured: the older pinned note
before the newer unpinned note; within each section the updatedAt-desc
order holds).

**A-6. The palette popover** (all three surfaces — view, edit, draft):
7 swatch buttons, each `w-8 h-8 rounded-full` (32×32) with an INLINE
`style="background-color: <hex>"`; unselected swatch border
`border-2 border-slate-200`; the CURRENT color's swatch carries
`border-2 border-violet-500 scale-110`. The colors (hex measured):
**white #FFFFFF (default)** / yellow #FEF3C7 / red #FECACA / pink
#FBCFE8 / violet #DDD6FE / blue #BFDBFE / emerald #A7F3D0. The popover
container is the shadcn popover anatomy (`z-50 min-w-[8rem]
overflow-hidden rounded-md border bg-popover p-1 ... shadow-md`).

**A-7. The color rendering**: the LIST row carries the color as an
INLINE `style="background-color: <hex>"` (overriding the row's bg-*
classes; the selection state still shows via the border classes —
selected `bg-violet-50 border-2 border-violet-200`, unselected
`bg-slate-50 hover:bg-slate-100 border-2 border-transparent`; the
computed bg of a selected+colored row IS the color, measured
rgb(254,243,199) on the yellow probe). The VIEW-mode body card AND the
draft/edit body card (`flex-1 bg-white rounded-2xl border
border-slate-200 overflow-hidden flex flex-col min-h-0`) carry the
same inline tint.

**A-8. The coding-note body surfaces**: VIEW = the rounded-2xl card >
`div.flex-1.overflow-auto.p-6` > `pre.font-mono.text-sm.
whitespace-pre-wrap` (the stored code, React-escaped — no HTML
rendering); EDIT/DRAFT = the `textarea` (A-2). The text-note surfaces
are unchanged (the S178 prose view + the Quill edit).

**A-9. The EDIT-mode toolbar**: `[Language select 128×36 — coding
notes only][notebook select 128×36][palette 36×36][Save 98×36][X
48×36]` — NO pin in edit mode (the pin is view-mode only, the B-8
record). The text note's edit toolbar: `[notebook 128][palette 36]
[Save 98][X 48]` (the clone's S178 toolbar + the palette).

**A-10. The rum beacon** (clone-side direct read, the S178 lesson-2
record): `src/components/layout/rum-beacon.tsx` fires ONE POST per
metric — up to 5 concurrent POSTs on boot (TTFB/FCP/LCP/CLS/INP each
`reportMetric` → its own `fetch("/api/rum", { events: [one] })`). The
route (`src/app/api/rum/route.ts`) already accepts the multi-event
batch (`rumBatchSchema` + a sequential `for…of` upsert loop) — the
batching fix is CLIENT-side: one flush window coalesces the per-metric
reports into one POST. The s18 e2e spec polls the aggregate for up to
20 s (`samples >= 1`) — a 1.5 s flush window is safe (the spec's own
comment records a 3.5 s trail tolerance).

### B. The clone gaps (direct read against the working tree at `737bbe4`)

- `prisma/schema.prisma` Note: no `pinned`/`color`/`kind`/`language`
  columns. `src/lib/data.ts` NoteRow: same four fields absent.
- `src/lib/validation.ts` noteSchema: no `pinned`/`color`/`kind`/
  `language` atoms; no NOTE_COLORS/NOTE_KINDS/NOTE_LANGUAGES arrays.
- `notes-view.tsx`: the header dropdown lacks "New Coding Note"; the
  draft/edit/view toolbars lack the palette; the view toolbar lacks
  the pin; the list renders one flat unsectioned list (no Pinned/All
  Notes headers, no row pin icon, no code-icon row lead, no inline
  color tint); the coding-note surfaces (badge/textarea/pre body/
  language selects) are absent.
- `src/lib/data-import.ts`: ENUM_VOCABULARIES/IMPORT_FIELD_LENGTHS
  lack the three new note fields (the BT1b third-entry-point doctrine
  — a hand-edited backup must not persist rows the interactive routes
  would 400).
- `rum-beacon.tsx`: the per-metric POST (A-10).
- The e2e/unit pin suites: no EC pins yet (this cycle adds them).

### C. Code-audit findings on the touched seams (Mode-C, this session's direct reads)

- **C-1 (Low, verified by read).** The delegate factory
  (`src/lib/server/entities.ts` noteDelegate) flows schema fields
  generically — `noteSchema` gains the four atoms and the create/PATCH
  legs carry them with NO factory change (the `sentKeysPatch`
  own-keys filter + the AI1/AI5 contracts hold). The
  `writeTransform: sanitizeNoteContent` gate passes PLAIN TEXT through
  byte-identically (the S140 policy) — coding-note bodies (plain code)
  are safe through the same door; no cross-field guard needed (the
  language field rides independently — §9.4).
- **C-2 (Low, verified by read).** `data-export.ts` spreads full rows
  — the four new columns flow into the export automatically; the
  import door needs the enum vocabularies + a length cap for
  `language` (the C census tests pin the key sets — they trip
  honestly RED and are updated with the registries).
- **C-3 (Medium, verified by read).** The prior session's
  implementation was lost UNCOMMITTED (the sandbox recycle). This plan
  re-executes it from the re-measured facts; the prior session's log
  recorded two design decisions that carry forward: the swatch
  selection state ships as UTILITY classes (`border-violet-500
  scale-110` — the reference's OWN implementation, unlike the S176
  events-dialog inline-style measurement), and the pinned-first sort
  is a pure client-side sort (the list query's composite index stays
  the wire contract — §9.3).
- **C-4 (Low, verified by read).** The existing menuitem locators in
  the EA1 e2e pins use `exact: true` by name ("New Note" vs "New
  Notebook") — adding "New Coding Note" does NOT trip them (re-checked
  by direct read; the full-file e2e sweep re-verifies).

## §2 EC1 — the schema + wire layer (the four columns)

1. `prisma/schema.prisma` Note += `pinned Boolean @default(false)` ·
   `color String @default("white")` · `kind String @default("text")` ·
   `language String?` (nullable — text notes carry none; the coding
   surfaces own the "JavaScript" initial). One `bun run db:push`.
2. `src/lib/validation.ts`: `NOTE_COLORS = ["white","yellow","red",
   "pink","violet","blue","emerald"] as const`, `NOTE_KINDS = ["text",
   "coding"] as const`, `NOTE_LANGUAGES = ["JavaScript","Python",
   "Java","C++","C#","HTML/CSS","SQL","Ruby","Go","Rust","PHP","Swift",
   "Kotlin","TypeScript"] as const` (the CA14 single-source doctrine —
   the import seam mirrors these arrays); noteSchema +=
   `pinned: z.boolean().optional().default(false)` · `color:
   z.enum(NOTE_COLORS).optional().default("white")` · `kind:
   z.enum(NOTE_KINDS).optional().default("text")` · `language:
   z.enum(NOTE_LANGUAGES).optional().nullable()` (no default — absent
   stays absent for text notes; null clears it).
3. `src/lib/data.ts` NoteRow += the four fields (`pinned: boolean` ·
   `color: string` · `kind: string` · `language: string | null`). The
   NoteInput type flows from the schema automatically.
4. `src/lib/data-import.ts`: ENUM_VOCABULARIES += `"notes.color":
   NOTE_COLORS`, `"notes.kind": NOTE_KINDS`, `"notes.language":
   NOTE_LANGUAGES`; IMPORT_FIELD_LENGTHS += `"notes.language": 20` (the
   longest value "HTML/CSS" is 8; the cap is the vocabulary bound).
   The census consistency tests update in lockstep.

## §3 EC2 — the notes-view surfaces (the measured port)

All inside `src/components/views/notes-view.tsx` (the S177/S178
lineage surfaces; the smallest diffs that carry the measurements):

1. **The header dropdown** gains the middle item: `[New Note][New
   Coding Note (lucide-code icon)][New Notebook]` — the A-1 order.
2. **The draft state** gains `kind` + `language` + `color` fields
   (`kind: "text" | "coding"`, `language: string` (only read when
   coding), `color: string`); `openDraft(kind)` opens the regular
   draft, `openCodingDraft()` = `openDraft("coding")` with the
   language initial "JavaScript" (the UI owns the default — §9.4).
3. **The draft toolbar**: the coding draft carries the Language
   select (w-32 = 128px, the 14 options) BEFORE the notebook select;
   both drafts carry the palette button (36px) after the notebook
   select; the coding draft's body is the `textarea` (A-2 anatomy) —
   NO Font row, NO Divider, NO Quill; the coding body card carries the
   color tint (A-7).
4. **saveDraft** POSTs `kind`/`language`/`color` with the rest; the
   regular draft POSTs `color` too.
5. **The view-mode toolbar**: the pin button (36px, `Pin` lucide,
   `fill-violet-50` when pinned — the toolbar tint) + the palette
   button (36px) before [Edit][trash]; the coding note renders the
   language badge (the shadcn `Badge` outline anatomy + `Code` lucide
   icon + the language name) before the disabled title; the coding
   body renders the `pre.font-mono.text-sm.whitespace-pre-wrap` inside
   the card (A-8) + the color tint on the card.
6. **The edit-mode toolbar**: the coding note's edit carries the
   Language select (128px) first + the palette after the notebook
   mover; the coding edit body is the textarea; NO pin in edit.
7. **The palette popover** (one shared `NoteColorButton` component —
   the trigger + the 7-swatch popover): the swatches per A-6 (32×32,
   inline bg hex, `border-slate-200` unselected, `border-violet-500
   scale-110` selected); picking a color PATCHes the note (view/edit)
   or sets the draft color (draft); the popover container rides the
   existing shadcn Popover.
8. **The list**: the `filtered` memo re-shapes into the two sections
   (pinned-first per A-5: pinned rows sorted by updatedAt-desc in the
   "Pinned" section, the rest in "All Notes"; with 0 pinned, no
   Pinned section); the row renders the `Code` icon lead (w-3 h-3
   text-slate-400 flex-shrink-0) for coding notes, the violet-filled
   `Pin` icon at the right for pinned rows, and the inline color tint
   (the row `<button style={{ backgroundColor }}>` when color ≠
   white); the section headers per A-5. The row extraction into a
   `NoteListRow` child keeps the sort/tint logic in one place (the
   ~24-block re-anchor family rides the same DOM shape — C-4).
9. **The color hex map** (the clone-side token):
   `NOTE_COLOR_BG: Record<NoteColor, string>` = `{ white:
   "transparent" (no inline style), yellow: "#FEF3C7", red:
   "#FECACA", pink: "#FBCFE8", violet: "#DDD6FE", blue: "#BFDBFE",
   emerald: "#A7F3D0" }` — the measured hexes byte-exact; "white"
   renders NO inline style (the reference's white default row shows
   its class bg — measured).

## §4 EC3 — the rum beacon batching (the S178 lesson-2 candidate)

1. A new pure seam `src/lib/rum-batch.ts` — `createRumBatcher(send,
   windowMs = 1500)`: `push(event)` buffers; a window timer flushes
   ALL buffered events in ONE `send(sessionId, events)` call; an
   immediate flush on the FIRST event is NOT used (the 1.5 s window
   coalesces TTFB+FCP+LCP which land within ~1 s of each other); the
   send errors are swallowed by the CALLER (the beacon's own silent
   contract — the seam propagates the rejection, the beacon catches
   it; the prior session's pin lesson re-applied); a `flushNow()` for
   unmount/pagehide (the keepalive contract on the flush fetch).
2. `rum-beacon.tsx`: the five `on*(onReport)` handlers `push` into the
   batcher instead of POSTing; the flush POSTs `{ sessionId, events:
   [...] }` (keepalive: true, same body shape — the route unchanged).
3. The route stays as-is (the sequential upsert loop over the batch).

## §5 The pins (the TDD specs — RED first at the designed markers)

**Unit (vitest):**

- `tests/rum-batch.test.ts` (NEW, ~6 tests): the window coalesces
  multiple pushes into one send; the timer resets per flush; an empty
  buffer never sends; the send rejection propagates to the caller
  (the beacon owns the silence); flushNow drains pending events; two
  windows send two batches.
- `tests/validation.test.ts` (+= 4 tests in a new `noteSchema S179`
  describe): the defaults parse (`pinned: false`, `color: "white"`,
  `kind: "text"`, `language: undefined`); the coding parse round-trip
  (`kind: "coding", language: "Python"`); the enum rejections
  (color "purple" / kind "rich" / language "Perl" all reject);
  `language: null` parses (the clear leg).
- `tests/data-import.test.ts`: the census consistency pins update
  (the +3 ENUM_VOCABULARIES keys, the +1 IMPORT_FIELD_LENGTHS key) —
  these trip RED against the pre-change registries and GREEN with §2.

**E2E (playwright, `tests/e2e/parity-session7.spec.ts` — the EA/EB
family's home; a new `S179/EC` describe):**

- **EC1 (the pin):** create note A + note B through the real draft
  flow; pin A via the view toolbar's pin button → the "Pinned"
  section header renders, A's row carries the violet pin icon and
  sorts ABOVE B; the toolbar pin shows the filled state; unpin → the
  section disappears. RED pre-fix: no pin button exists.
- **EC2 (the palette):** with A selected, open the palette → the 7
  swatches render; pick yellow → A's row carries the inline
  `background-color: rgb(254, 243, 199)` AND the body card the same
  tint (computed-style reads); reopen the palette → the yellow
  swatch carries the selected border+scale. RED pre-fix: no palette.
- **EC3 (the coding note):** "New Coding Note" menuitem → the draft
  carries the Language select defaulting "JavaScript" + the textarea
  (no Quill, no Font row); save → the row carries the code-icon lead;
  the view renders the language badge + the `pre.font-mono` body;
  edit → the Language select first in the toolbar. RED pre-fix: the
  menuitem doesn't exist.
- **EC4 (the rum batching):** on a fresh shell load, count the
  `/api/rum` POSTs via a route spy over the first ~4 s → the boot's
  metric reports land in ONE POST (≥1 POST, and the first POST's
  body `events` array length ≥ 2 — TTFB+FCP coalesced). RED pre-fix:
  every POST carries exactly one event.

**The standing tripwires** (the cycle's re-verify legs, unchanged
expectations): the mobile drawer check, the desktop parity probe, the
EA1/EB1-3 re-anchors (the full parity-session7 sweep), s18-rum (the
20 s poll tolerance — §A-10).

## §6 The execution order

1. §2 schema + wire (db:push; the Prisma client regenerates).
2. The unit pins (rum-batch + validation + import census) — RED.
3. §4 the batcher + the beacon rewire — the rum pins GREEN.
4. §3 the view surfaces (the smallest-diff edits; the NoteListRow +
   NoteColorButton extraction).
5. `lint` + `typecheck` + `test` — all GREEN (the +11 unit pins).
6. The pre-change e2e build + the EC pins RED sweep (the designed
   markers), then the post-change build + the GREEN sweep.
7. The full e2e chunked cert (the 5-chunk cold map) + the tripwires.
8. The evidence frames (`docs/screenshots/`), the doc-chain lockstep,
   the worklog, the commit + the SSH-wrapper push.

## §7 The verification gates

`bun run lint` ✓ · `bun run typecheck` ✓ · `bun run test` ✓ (the
1743 + ~11 = ~1754 expected, 53 files) · `bun run build` ✓ · the EC
e2e pins GREEN on the post-change standalone build · the 5-chunk cert
map (158+219+101+95+89 = 662) with the honest flake ledger · the
tripwires (drawer + desktop parity + the EA/EB family) · zero residue
on the reference account (re-verified at cycle end).

## §8 The evidence frames + the doc-chain lockstep

`docs/screenshots/` += the 179-cycle frames (the pinned+sectioned
list, the palette popover open, the coding-note view with the badge +
pre body, the coding draft). README row + badge · AGENTS census + the
S179 lessons · CLAUDE pairs · PAD version + the Note model row · the
SKILL sites · the vitest header · the cert runner re-tags ·
`docs/session_230.md` · this plan's §10/§11 · worklog session 190 ·
`.env.example` re-verified (no env changes this cycle).

## §9 The adjudications (the open questions, resolved)

1. **The pin sort is client-side** (the wire's composite index and
   the list query stay untouched — the reference's pinned-first is a
   view-layer sort; the API returns updatedAt-desc as before).
2. **"white" renders no inline style** — the reference's default row
   shows the class bg (measured: no style attribute on uncolored
   rows); the tint map keys on `color !== "white"`.
3. **The swatch selected state ships as utility classes**
   (`border-violet-500 scale-110` — the reference's own classes,
   unlike the S176 events-dialog inline-style measurement; the e2e
   pin asserts the classes + the computed scale where readable).
4. **The language field rides independently** — no cross-field guard
   (a text note MAY carry a language value; the surfaces only read it
   when kind=coding; the UI owns the "JavaScript" initial on the
   coding draft — the reference's select default).
5. **The badge is view-mode only** — the edit surface carries the
   Language select (the A-9 order: select first), the view carries
   the badge (A-4); no badge in edit.
6. **B-6 (Attach File) stays deferred** — the attach row is measured
   (the LabelText + the paperclip button in the draft) but its wire
   feature (file upload on notes) is its own cycle; this plan ships
   the four-item head only.
7. **The clone's superset aria-labels ride the new icon buttons**
   (the S178 lesson-4 posture: "Pin note"/"Unpin note"/"Note color"
   over the reference's unlabeled icon-only buttons — the a11y
   superset family).
8. **The edit-mode pin absence is deliberate** (the B-8 record: the
   reference's pin is view-mode only — measured twice, both modes).
9. **The textarea autosaves like the Quill body** (the clone's
   network-measured superset posture — the EB3 record; the coding
   body PATCHes on the debounced change, Save flushes + returns to
   view).
10. **Probe-tooling record** (carried from the prior session's log,
    re-confirmed): Radix popover TRIGGERS need native pointer events
    (agent-browser ref clicks); plain buttons (swatches) accept JS
    clicks; Playwright `getByRole` exact for the menuitem family.

## §10 The as-executed close (filled at the cycle's end)

Executed as planned across two sessions (the sandbox recycled mid-cycle;
the implementation tree survived intact — the close legs re-verified green
on the resumed tree). The deltas from §6's order:

- **§2** landed exactly (the four columns; one `bun run db:push`; the
  NoteRow type + the import registries in lockstep — the census tests
  tripped RED exactly as designed and re-anchored).
- **§4** landed with one pin correction (the batcher seam PROPAGATES the
  send rejection — the beacon owns the silence; the pin's first shape
  wrongly expected the seam to swallow) and one validation correction
  (the "JavaScript" initial is a UI default, not a schema cross-field
  default — §9.4 re-read; the enum family carries vocabulary entries,
  never length atoms).
- **§3** landed with the `NoteListRow` + `NoteColorButton` extractions as
  planned; the hue-tokens census anchors tripped as designed (the
  selected-row site moved 913 → 262 — the NoteListRow extraction) and
  were re-anchored.
- **§5's honest REDs were PROVEN**: the unit pins ran against the STASHED
  wire layer (9 failed tests + the rum-batch file-load failure at the
  designed markers); the e2e RED sweep ran against the pre-change
  standalone build with the Prisma client REGENERATED for the stash (the
  client is a build input of the bundle).
- **The unplanned leg — the EB3 order-dependent flake** (root-caused at
  the event level, fixed at the TEST level): the Radix menu's
  exit-animation window kept the "New Note" menuitem MOUNTED and FOCUSED
  after the pick — keyboard.type's SPACE re-activated it and openDraft
  fired a second time (the draft reset, the typed title emptied). The
  reference carries the identical exit-animation classes, so the fix is
  the deterministic menu-unmount wait before any keyboard interaction
  after a menu pick (EA1/EA1b/EB3) — 5/5 consecutive GREEN after.
- **The gates**: lint ✓ · tsc ✓ · unit **1761/1761** (53 files, +18) ·
  build ✓ · **the full 5-chunk cert map 666/666 GREEN — FIRST ROLL, ZERO
  FLAKES** (158+223+101+95+89 — the first all-first-roll cert since the
  S176 stall class landed) · the tripwire 138/138 after the lockstep ·
  the drawer check GREEN (the 118th consecutive) · the desktop parity
  probe MATCH (all five structural checks) · zero residue on BOTH
  accounts (the demo db restored to the seed state through the trash;
  the reference re-verified at 0 notes).
- **The evidence frames**: the five §8 frames captured self-verifying
  (`scripts/capture-s179-evidence.mjs` — every frame's DOM markers
  asserted before the shots; the yellow rgb(254,243,199) tint verified
  computed on BOTH the row and the card; the mobile drawer closing
  frame).

## §11 The final checklist (the operator's asks, mapped)

- [x] `.env` at `DATABASE_URL="file:../db/custom.db"`, `db/` at the
      repo root — re-verified this session (§0) and at the close
      (byte-identical to `.env.example` at the documented dev posture).
- [x] The mobile-nav drawer check GREEN (the Tailwind v4 watch) — the
      standing tripwire (§7): the **118th consecutive**, no Tailwind v4
      mobile-nav bug.
- [x] The vitest + playwright suites validated + extended (the EC
      pins) — §5/§7: unit 1743 → **1761** (53 files), e2e 662 → **666**
      (the 5-chunk cold map all-first-roll GREEN).
- [x] The remediation plan saved under `docs/` (this file) + validated
      against the codebase before execution (§0/§1 re-reads).
- [x] The dev-server screenshots under `docs/screenshots/` (§8): the
      five 179-cycle frames, self-verifying.
- [x] `.env.example` matches the codebase (re-verified — no env
      changes this cycle; §8).
- [x] The doc chain updated in lockstep (§8): README row + badge ·
      AGENTS census + the S179 lessons (five) · CLAUDE pairs · PAD
      v1.3.87 · the SKILL sites · the vitest header · the cert runner
      re-tags · `docs/session_230.md` · this §10/§11 · the worklog
      Session-190 entry.
- [x] `worklog.md` updated + included in the final commit (§8).
- [x] The commit + the SSH-wrapper push to
      `git@github.com:nordeim/omni-study1.git` on `main` (§6.8) — the
      push verified (`737bbe4..79ee1a1` on `main`, the remote ref
      re-queried equal to local HEAD, the tracking ref synced).
