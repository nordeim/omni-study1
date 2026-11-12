# Remediation Plan — Session 177 (Cycle 127, Batch EA)

> Status: PLANNED (pre-change record — the immutable plan; the as-executed
> close lives in §10). Written before any source change, per the standing
> doctrine ("write the cycle plan into docs/remediation-plan-sessionN.md
> BEFORE any source change").
>
> Operator directive: refresh the workspace, re-read the doc chain
> (AGENTS/CLAUDE/README/PAD/SKILL + session_224 + session_225 +
> remediation-plan-session176 + worklog), validate against the codebase,
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
> Session note: this cycle continues the rotation from the S176/Batch DZ
> close (`10a2081` + the plan-close `d935638` pushed + remote-verified;
> `1e5f389` — cloned this session — committed the operator's session_225
> raw transcript, docs-only). The workspace was COLD (a fresh `git clone`
> — node_modules re-derived [510 packages], chromium re-derived at the
> locked pin, `db/custom.db` re-pushed + re-seeded, `.env` re-created from
> `.env.example`). Every reference fact below was measured by a live gated
> probe THIS session (agent-browser + playwright, computed DOM) before
> this plan was written; every clone fact by direct read of the working
> tree.

## §0 Scope, method, cold baseline, live parity

**Workspace (cold — `git clone` at `1e5f389` on `main`; the working tree
clean).** `bun install` ✓ (510 packages); `bunx playwright install
chromium` ✓; `bun run db:generate` / `db:push` / `db:seed` ✓ (the seed
line "demo account ready"); `cp .env.example .env` ✓ at
`DATABASE_URL="file:../db/custom.db"`; `db/` at the repo root.

**Cold baseline gates (re-run this session before any change):** `bun
run lint` ✓ (0 errors) · `bun run typecheck` ✓ (0 errors) · `bun run
test` ✓ **1743/1743 (52 files)** — the documented S176 close state
reproduced exactly. The dev server booted on :3000 (Turbopack,
reaper-proof double-fork daemon).

**Live parity chrome (the standing tripwires, re-run this session):**

- **The drawer check — GREEN, the 113th consecutive** no-Tailwind-v4-
  mobile-nav-bug confirmation (oklab(0 0 0 / 0.2) backdrop + blur(4px),
  288px white shadow-2xl panel, 20 links, no footer, Escape + navigate
  auto-close, the z-40 fixed app-bar) at 390×844 on the remediated tree.
- **The desktop parity probe — MATCH** (all five structural checks
  against the live reference login: sidebarOuterWidth 260, navLinkCount
  20, firstLinks set, mainX 260, mainWidth 1180).
- **The per-cycle dialog re-probe (the axis-finding pattern):** the
  reference re-verified at the computed-DOM level — the **Events dialog
  (S176's port) holds with NO re-drift** (the placeholder trio, the
  six-swatch 32px palette with the white+slate double-ring + scale(1.1)
  selected state, the repeating-ROWS reminders control, the
  five-option repeat select with Yearly, the "Create Event" case), the
  **StudyGroups dialog (S176's port) holds with NO re-drift** ("Group
  Name \*" / "Description" / the six-swatch idiom / "Create Group"), and
  the **Tasks dialog (S176's port) holds with NO re-drift** ("Task
  name..." / "Add a subtask..." / "Add notes..." / "Create Task").
  The re-probe then went DEEP on the Notes family — the audit that
  defines this cycle (§1 Audit B).

**Method.** Computed-DOM authority (the repo doctrine): every reference
fact below was measured by a live gated probe this session (login →
navigate → interact → census), every clone fact by the mirrored probe
or direct read. Zero residue on every reference write-path probe (the
one probe-created note — an artifact of the s177 probe 2's failed
cleanup leg — was deleted through the reference's own UI before the
audit closed; the end state re-verified: 0 notes, "No notes yet" +
"Select a note"). The `skills/` folder excluded from
checking/testing/compilation throughout. The probe account is in the
reference's DARK mode (html class="dark", body bg #0a0a0a) — the
computed colors below are dark-mode readings; the ports below carry the
reference's class-level anatomy (theme-adaptive), never a fixed
dark-mode color.

## §1 The audits (Mode-C; every finding re-verified by direct read or live probe by the orchestrator)

### Audit A — the recent-changes axis (`1e5f389`, docs-only since the S176 fix `10a2081`): **0C / 0H / 0M / 0L / 0I.**

`1e5f389` adds only `docs/session_225.md` (the operator's own raw
transcript commit — docs-only, no code surface). `10a2081` (the
S176/DZ cycle: 40 files) was closed machine-verified by the S176 gates
and the 5-chunk cert; this session's cold baseline (lint/tsc/unit
1743) plus the Events/StudyGroups/Tasks dialog re-probe (no re-drift on
the DZ1/DZ2/DZ3 ports) re-confirmed the cycle's surfaces still hold. No
new findings.

### Audit B — the rotation axis (the Notes family — the S176 B-5 deferral, now measured to FULL depth; the web-application skill's §4/§7/§8/§9/§12/§13/§16/§17 rubric): **0C / 0H / 0M / 8L / 0I.**

The S176 plan recorded the Notes create flow as the deferral
("one rotation's worth on its own") with a first-pass measurement. This
session re-measured the family end-to-end (the create flow, the saved
lifecycle, the mode split, the feature inventory, the empty states) —
the full record below. **All eight findings are parity-level (L) — no
correctness, no security, no data surface.**

**B-1 (L) — the create flow (the B-5 close, fully measured 2026-11-12;
the reference probed live, zero residue at the close):** the
reference's "New Note" affordances (the left-pane empty-state CTA and
the left-pane dropdown item) open the INLINE DRAFT editor
immediately — **no dialog, no API call, no list row**. The measured
draft anatomy:

| Surface | Reference (measured) | Clone (probed) | Verdict |
|---|---|---|---|
| The flow | "New Note" → the right pane switches to the draft editor directly | "New Note" → the S125/BZ14 create-only NAME dialog → `createNote` POST → the editor | the B-5 drift — this cycle's core |
| Persistence | NO POST during the draft (measured: no row + no network save after 7s of title+body typing); the note is created ONLY on explicit Save | the dialog POSTs on submit (title from the dialog, content always "") | the write-path drift |
| The draft title | input `placeholder="Note title..."`, enabled, text-xl font-bold (the dark-mode computed text color is the theme's — class-level port) | the editor's title input already carries "Note title..." (notes-view :146) | the placeholder matches; the flow doesn't |
| The draft's action row | [the notebook select w-32 "None"] [the palette 36px] [Save h-9 gradient] [X h-9 discard] | (no draft surface exists) | the port below |
| Save | POST {title, content} → the row appears in the list → the editor continues on the saved note | the dialog's POST → the same select-the-created-note | the post-Save state matches |
| Save on an EMPTY draft | a SILENT no-op (measured: no note, no toast, the draft stays open) | the dialog's DA2 hand-guard ("Please enter a name.") | the clone's superset guard stays (adjudication 4) |
| X (discard) | the draft closes — no row, no POST, zero residue (measured from both the empty state and the coding draft) | (no discard affordance exists) | the port below |

**B-2 (L) — the empty-state placement + the no-selection copy (measured
2026-11-12):** the reference's EMPTY state lives in the LEFT list pane
— the 80×80 rounded-2xl violet-100→indigo-100 icon tile + `<h3
class="text-xl font-semibold">No notes yet</h3>` + `<p
class="text-slate-500">Create your first note</p>` + the "New Note"
gradient CTA (from-violet-500 to-indigo-600, shadow-lg
shadow-violet-500/25) — while the RIGHT pane carries its OWN
no-selection state (the same icon tile + `<h3>Select a note</h3>` +
`<p>Choose a note from the sidebar or create a new one</p>`). The
clone ships the empty state in the RIGHT pane wrapped in an sf-card
(`notes-view :841-854`, hint "Create your first note to start
capturing ideas.", CTA "New note") and the no-selection state as a
plain `<p>Select a note from the list.</p>` (:855-858); the LEFT list
area renders a plain `<p>No notes yet.</p>` (:770-772). Three copy
drifts ride the same finding: the hint tail, the CTA case, and the
no-selection copy.

**B-3 (L, DEFERRED — the measured record for the S178+ rotation): the
view/edit MODE SPLIT.** The reference's existing-note editor opens in
VIEW mode — the title input DISABLED (showing the stored title) + the
action row [pin 36px][palette 36px][Edit h-9 px-4][trash h-9
text-red-600] + the read-only body (a `.prose.prose-slate.note-content`
div rendering the stored HTML — NOT a Quill instance). "Edit" switches
to the edit toolbar (the draft anatomy minus the language controls);
X exits edit mode back to view; trash deletes the note DIRECTLY (no
confirm dialog — measured). The clone's editor is always-editable
(autosave + Save + the MoreVertical actions popover — the S77/AD port)
— the documented superset posture. DEFERRED (adjudication 7) — a
mode-split port touches ~10 e2e pins (the AH/AE1/BW3/CQ3/DJ1 families
all open a note and type immediately) and is one rotation's worth on
its own; the record above is the S178 candidate's measured authority.

**B-4 (L, DEFERRED): the PIN feature.** The view-mode pin button
(36px outline) toggles a pinned state (the button bg violet-50 + the
pin icon filled violet-500, measured) + a pin icon renders inside the
list row's title row. A schema feature (pinned Boolean + PATCH) —
deferred with the full measurement.

**B-5 (L, DEFERRED): the note COLOR palette.** The palette menu
(every mode's toolbar) — SEVEN 32px rounded-full swatches: the white
default (rgb(255,255,255), selected at matrix(1.1)) + six pastels
(#fef3c7 / #fecaca / #fbcfe8 / #ddd6fe / #bfdbfe / #a7f3d0). The note
color tints the body card's background (the measured
style="background-color: rgb(255, 255, 255)" on the default). A schema
feature — deferred.

**B-6 (L, DEFERRED): the "Attach File" feature.** The edit toolbar's
own row (`flex items-center gap-2 mb-4 flex-wrap`): a cursor-pointer
label wrapping a button-styled span (h-8 px-3 text-xs outline,
paperclip icon, "Attach File") + a hidden file input. A schema +
storage feature — deferred.

**B-7 (L, DEFERRED): the CODING notes.** The left-pane dropdown
carries THREE items ("New Note" / **"New Coding Note"** / "New
Notebook" — the S77 record knew two). "New Coding Note" opens a draft
with: a language BADGE (rounded-md border px-2.5 py-0.5 text-xs
font-semibold, "JavaScript") + a language select (w-32, FOURTEEN
options: JavaScript/Python/Java/C++/C#/HTML-CSS/SQL/Ruby/Go/Rust/PHP/
Swift/Kotlin/TypeScript) + the notebook select + a TEXTAREA body
(`min-h-[60px]`, placeholder "Write your code notes here...") instead
of the Quill editor. A note-type feature — deferred with the full
measured inventory.

**B-8 (L, DEFERRED): the reference's editor toolbar deltas.** The
Font row's measured shape (`p-3 bg-slate-50 rounded-lg` wrapper + "Font:"
+ the w-32 h-8 select + the h-6 w-px separator + the h-8 px-3 text-xs
outline Divider — the reference's Divider is an OUTLINE button, the
clone's is the S77-measured black one) and the tag row's shape
("Add tag..." w-24 h-7 + the h-7 px-3 add button + an Attach row) —
recorded for the S178 anatomy cycle; the clone's S77/AD port holds
its own measured lineage (the S77 record measured the Divider as
black; the reference's account is in dark mode this session where
bg-background computes #0a0a0a — the class-level anatomy is the port
vehicle either way).

### Audit C — the standing gates re-verified this session: **clean (the §0 record).**

The drawer check (113th), the desktop parity probe (MATCH), the
Events/StudyGroups/Tasks dialog re-probe (no re-drift), the cold
baseline gates (lint/tsc/unit 1743) — all green before any change.
The mobile-nav 390×844 surface stays covered by the drawer check's
standing posture.

## §2 EA1 — the inline-draft create flow (the B-1 close)

The measured port, view-layer only (the wire/API/import surfaces
untouched — `createNote` POSTs the same `NoteInput`):

1. **The draft state** — notes-view.tsx gains
   `const [draft, setDraft] = React.useState<{ title: string; content:
   string; tags: string[]; notebookId: string } | null>(null)`. The
   DialogState narrows: the `{kind: "note"}` branch retires (the
   notebook dialog — create + rename — stays, S125/BZ14's own lineage);
   `openNewNote` becomes `openDraft()` — sets the draft with the
   notebook default from the active filter
   (`notebookFilter === "all" ? "" : notebookFilter` — the same
   defaulting the dialog carried), NO dialog, NO POST.
2. **The draft render** — the right pane's branch ladder becomes:
   the loading gate (unchanged, the DP2 aria contract) → `draft ?`
   the draft editor → `!selected ?` the no-selection state (§3) →
   the existing editor (UNCHANGED — the mode split is deferred). The
   draft editor: the title row (the plain controlled title input,
   `placeholder="Note title..."`, `aria-label="Note title"` — the
   existing editor's input idiom) + the action row (the notebook
   Select w-32 with `aria-label="New note notebook"` + the "None"
   option + the notebooks; the gradient Save h-9; the X discard h-9
   `aria-label="Discard new note"` with the lucide X icon) + the
   inline error slot (the DA2 guard copy — "Please enter a name." +
   the busy-disable latch) + the Font row + the tag row (the draft's
   OWN tag pills + the "Add tag..." input — the tags land in the
   create POST) + the editor card (the same sf-note-editor card +
   QuillEditor `key="draft"`, `value=""`, `onChange` → the draft's
   content).
3. **`saveDraft()`** — the hand-guard (the empty title answers with
   the DA2 human copy, never a POST — the reference's silent no-op is
   the recorded deviation, adjudication 4) → `busy` latch →
   `createNote({ title, content, tags: JSON.stringify(draft.tags),
   notebookId })` → `setDraft(null)` → select the created note (the
   AG6/AH flow's select-the-created idiom preserved: `setSelectedId`,
   `selectedIdRef.current`, `autosaveFailedRef.current = false` — the
   S79/AF3 + S80/AG6 lineage) → the error surface (ApiError.message /
   "Something went wrong." — the dialog's idiom).
4. **The discard** — `setDraft(null)`; NO POST, NO row, NO residue
   (the measured reference behavior). The selection underneath is
   untouched (the draft overlays; X restores the prior state).
5. **The affordances** — the empty-state CTA (§3, `openDraft()`) and
   the dropdown's "New Note" item (`onSelect={openDraft}` — the
   existing DropdownMenuItem site :623). The dialog's "note" submit
   branch retires; the notebook branches stay.

## §3 EA3 — the empty-state placement + the no-selection state (the B-2 close)

1. **The LEFT list area** — the `filtered.length === 0 && notes.length
   === 0` branch (:769-772, the plain `<p>No notes yet.</p>`) becomes
   the measured empty state: the shared `EmptyState` component (the
   80×80 tile + the h2 — the clone's shared-idiom heading level, the
   reference's h3 recorded as the deviation) with
   `title="No notes yet"` + `hint="Create your first note"` (the tail
   retired) + `cta={<Button variant="gradient">+ New Note</Button>`
   wired to `openDraft()`. The "No notes match." (filtered-empty of a
   non-empty account) branch stays the plain `<p>` (the clone's
   idiom; the reference's filtered-empty surface is unmeasured).
2. **The RIGHT pane** — the `notes.length === 0` sf-card EmptyState
   branch (:841-854) RETIRES; the `!selected` branch (:855-858)
   becomes the measured no-selection state: `EmptyState icon={BookOpen}
   title="Select a note" hint="Choose a note from the sidebar or
   create a new one"` (no CTA — the reference's right pane carries
   none), rendered BARE (no sf-card wrapper — the measured bare pane;
   the S8 pin's bg/border asserts stay green). The loading gate
   (DP2's aria "Loading note editor") stays first in the ladder.

## §4 The pins (the TDD specs — RED first at the designed markers)

**The e2e additions (parity-session7.spec.ts — the S176 DZ pin
block's successor):**

- **EA1 (the draft copy/shape pin):** open the dropdown → the "New
  Note" item → assert NO dialog (`getByRole("dialog")` count 0) + the
  draft title input (`placeholder="Note title..."`) + the .ql-editor
  visible; fill the title; assert NO POST during typing (the route
  spy — 0 POSTs after the fill + a 1.5s settle); Save → the row
  appears with the title + exactly ONE POST; the editor continues
  (the .ql-editor still visible — the created note selected). Cleanup
  through the UI (the delete — zero residue, the standing doctrine).
- **EA1b (the discard leg):** open the draft → fill the title + type
  body → X (`aria-label="Discard new note"`) → NO POST fired (the
  route spy) + NO row appeared (the list count unchanged) + the
  no-selection state returns.
- **EA1c (the guard leg):** open the draft → Save with an EMPTY
  title → the inline DA2 copy ("Please enter a name.") + NO POST (the
  route spy) + the draft stays open. (The clone's superset guard over
  the reference's silent no-op — the pin owns the divergence record.)
- **EA3 (the placement pin):** route the notes GET to `[]` → the LEFT
  pane renders the empty state ("No notes yet" + "Create your first
  note" + the "New Note" CTA — the CTA opens the draft) + the RIGHT
  pane renders the no-selection state ("Select a note" + "Choose a
  note from the sidebar or create a new one") + the right pane stays
  bare (no sf-card). (The routed-GET form — the S17 fresh-user
  pattern's lighter twin; the fresh-user spec itself keeps its own
  green lineage.)

**The e2e re-anchors (the port-follows-the-measurement doctrine — the
S176 S171-pin precedent):** the create-note dialog-flow helper at SIX
sites (parity-session7 ×4 [AG6 :986, AH1a :1097, AH2a :1159, AH2b
:1232] + dark-mode :296 + parity-session9 :871) re-anchors to the
draft flow (menu → "New Note" item → the draft title input fill →
Save → the editor visible). The two menu-shape pins (parity-session5
:539, parity-session8 :465) stay green untouched (the dropdown
trigger + items unchanged). The S8 "right pane is bare + Select a
note" pin stays green (the substring + the bare pane both hold). The
S17 fresh-user empty-state pin stays green (the copy assertions are
substring-tolerant and the empty state stays inside main).

**The unit layer:** no new pure seam this cycle (the draft is
view-state; the wire model is untouched) — the unit census stays
**1743/1743**; the e2e census moves **654 → 658** (+4: the EA1/EA1b/
EA1c/EA3 pins).

## §5 The execution order

1. The e2e pins written FIRST (§4) — the RED sweep proven at the
   designed markers on the pre-fix tree (the staged-fix build — the
   S176 stash-and-build doctrine; the unit layer untouched).
2. EA1 the draft state machine (§2.1) + the draft render (§2.2) +
   saveDraft/discard (§2.3-2.4) + the affordance rewires (§2.5).
3. EA3 the empty-state placement (§3) — the left list area + the
   right pane's no-selection state.
4. The create-helper re-anchors (§4's six sites).
5. The GREEN sweep: the full-file cold run of parity-session7 (78
   expected) + dark-mode + parity-session9's DP1 leg.
6. The full gates: lint · tsc · unit 1743/1743 · build.
7. The cert re-tag (654 → 658) + the 5-chunk cold cert (the S176/DZ5
   posture chain rides: the tmpfs scratch db, the tmpfs Chromium
   caches, retries: 1).
8. The evidence frames (§8) — the draft editor (the title + the
   toolbar + the empty body), the saved-note round trip (the row
   appearing), the empty-state placement (the left tile + the right
   no-selection), the drawer frame (the standing chrome).
9. The doc-chain lockstep (§8.8) + the commit + the SSH-wrapper
   push.

## §6 The honest-RED inventory (designed markers)

- EA1's RED: the dialog-count assert fails pre-fix (the dialog IS
  the pre-fix flow — `getByRole("dialog")` count 1 ≠ 0) + the POST-
  during-typing assert (the pre-fix dialog POSTs on submit; the draft
  never POSTs during typing) — the marker: the no-dialog + no-POST-
  until-Save shape.
- EA1b's RED: the "Discard new note" aria-label doesn't exist
  pre-fix (the locator timeout at the X button).
- EA1c's RED: the guard-copy assert (the pre-fix dialog surfaces
  the same copy in the DIALOG — the pin's inline-slot locator fails).
- EA3's RED: the left-pane "Create your first note" exact-hint
  assert (the pre-fix hint carries the tail — the substring assert
  passes, so the pin pins the PLACEMENT: the empty state inside the
  LIST pane's `[aria-label="Notes list pane"]` scope — pre-fix it
  renders in the right pane — the scoped locator times out) + the
  right-pane "Choose a note from the sidebar or create a new one"
  assert (the pre-fix copy is "Select a note from the list.").
- The re-anchors' RED: the pre-fix helpers fail at the draft-title
  fill (the input exists pre-fix only AFTER the dialog's Save — the
  helper's fill-before-Save order times out).

## §7 The verification gates

lint ✓ · tsc ✓ · unit **1743/1743** (52 files — unchanged, no new
seam) · build ✓ · parity-session7 **78/78** cold (74 prior + the 4 EA
pins) · the 5-chunk cold cert at the re-tagged map
**158+211+101+95+89 = 654 → 658** (+4, chunk 2's home) · the
tripwire **138/138** after the doc-chain lockstep · the drawer check
(the 114th at the close) · the desktop parity probe MATCH.

## §8 The evidence frames + the doc-chain lockstep

**The frames (`docs/screenshots/`, self-verifying — the markers
asserted in-DOM before the shots; md5s distinct):**
`177-clone-notes-draft.png` (the draft editor: the title row + the
toolbar + the empty body) · `177-clone-notes-saved.png` (the round
trip: the row in the list + the editor on the saved note) ·
`177-clone-notes-empty-state.png` (the left tile + the right
no-selection state) · `177-clone-mobile-drawer.png` (the standing
chrome at the close).

**The doc-chain lockstep (the census re-tag at every site):** the
cert script's Expected map + header (source) → the S128/CC2 mirror
pins' recomputed constants → run-cert-chunk.sh's header (the
historical-tense posture) → CLAUDE.md's test-pyramid pair (the DY3
pin's own enforcement) → vitest.config.ts's header (the e2e census
line) → README's badge (2397 → 2401) + the four body sites + the
Session-177 row → the SKILL's census sites → AGENTS.md's two census
lines + the S177 lessons block → PAD **v1.3.85** →
`docs/session_226.md` → the worklog Session-188 entry → this
plan's §10 close.

## §9 The adjudications (the open questions, resolved)

1. **The mode split (B-3) is DEFERRED to its own rotation** — the
   always-editable editor (autosave + Save) is the clone's S77-era
   documented superset; the split's ~10-pin re-anchor surface (the
   AH/AE1/BW3/CQ3/DJ1 families) is one rotation alone. The measured
   record (§1 B-3) is the S178 candidate's authority. The pin/palette
   (B-4/B-5), Attach (B-6), and the coding notes (B-7) ride the same
   ledger — each a schema feature.
2. **The draft's action row ports the measured shape minus the
   deferred features** — the notebook select + Save + X render; the
   palette does not (its feature is deferred; a dead button is worse
   than a recorded gap). The existing editor's MoreVertical popover
   row is UNTOUCHED this cycle (the CQ3 keyboard-reachability pins
   stay green as-is).
3. **The draft keeps the DA2 hand-guard** (the inline "Please enter a
   name." + no POST) over the reference's measured SILENT no-op — the
   S127/CB17 files-view pattern's lineage; the EA1c pin owns the
   divergence record.
4. **The empty state's heading level stays the shared component's
   h2** (the reference's h3 — its own heading-order laxity, the
   S77/AD7 "the clone ships the a11y-clean heading with the identical
   computed styling" precedent) and the shared EmptyState's geometry
   (the 80×80 tile — measured-equal) renders both states; the hint
   tail ("to start capturing ideas.") retires to the measured short
   copy.
5. **The draft's notebook select defaults from the notebookFilter**
   (the dialog's own defaulting lineage — the reference's "None"
   default is the empty-filter equivalent; the measured select shape
   ports with the notebooks list + the "None" option).
6. **The tags land in the create POST** (`tags:
   JSON.stringify(draft.tags)` — the wire's `tags` JSON string, the
   same format the PATCH path writes; the draft's tag row is the
   measured "Add tag..." idiom with the clone's a11y labels).
7. **The e2e census re-tag rides the self-anchoring chain** — the
   cert script's map leads, the doc chain follows (the S175/S176
   lockstep order); the unit census is UNCHANGED (1743 — no new seam)
   and its header records the e2e move only.
8. **The reference's dark-mode account state is recorded, not
   fought** — the class-level anatomy is the port vehicle (the
   clone's theme system owns both modes); no fixed dark-mode color
   ships in any port.

## §10 The as-executed close (filled at the cycle's end)

- [x] EA1 the inline-draft create flow green (the draft state + the
      title row + the notebook select + Save/X + the guard + the
      tags-in-POST) — the EA1/EA1b/EA1c pins RED proven pre-fix /
      GREEN post-fix (the pre-fix build ran the RED sweep at the
      designed markers: the dialog-count assert [the create-only
      dialog WAS the pre-fix flow — count 1 ≠ 0], the
      no-POST-during-typing assert, the "Discard new note" locator
      timeout, the pane-scoped guard-copy timeout, the
      left-pane-scoped empty-state timeout + the right-pane copy
      assert)
- [x] EA3 the empty-state placement green (the left tile + the right
      no-selection state) — the EA3 pin RED/GREEN · **the unplanned
      third leg (EA3b — the overflow regression)**: the no-selection
      EmptyState's fixed 80px tile forced a 128px min-content into
      the ~14px squeezed right pane at 390 (scrollWidth 431 — the
      reference itself overflows to 416 there, its own bug; the
      clone's ≤390 posture is the pinned superset, the AE9-13
      family). Root-caused by an in-DOM offender bisect; fixed with
      the md+ measured affordance (hidden md:flex) + the sub-md
      compact fallback (the old proven text-sm copy — the pre-S77
      shape that measured-fit at 388); the strict-mode double-matches
      re-scoped to heading-role locators (the EA1b/EA3 pins + the S8
      pin in parity-session8 — the DOM shape legitimately changed);
      the mobile posture re-verified in-DOM at exactly 390
- [x] the six create-helper re-anchors green (the AG6/AH1a/AH2a/AH2b
      + dark-mode + DP1 legs — the port-follows-the-measurement
      doctrine; the hue-tokens census anchors re-anchored 784 → 871,
      tripped as designed)
- [x] lint ✓ · tsc ✓ · unit **1743/1743** (52 files — unchanged,
      no new seam: the draft is view state, the wire's createNote
      POST/NoteInput model untouched)
- [x] build ✓ · parity-session7 **78/78** cold (74 prior + 4 EA pins;
      the second full roll 78/78 clean) · parity-session8 **72/72** ·
      dark-mode 29/29 (28 + 1 flaky ridden out — the AE3 ::before-""
      flake under a concurrent agent-browser + dev-server load,
      isolation-verified green ×7 + 2 full-spec 29/29 runs) ·
      parity-session9 **40/40** · s17-fresh-user **12/12**
- [x] the 5-chunk cold cert at the re-tagged map **658** — chunk 1
      GREEN at roll 10 of 10 (the S176-class lottery: rolls 1-9 at
      155-157 with the rotating P1008/socket-timeout casualties, every
      one isolation-verified green — the AE9-13 timeout signature ×2
      isolated green, the AL1a family green on the re-run) · chunk 2
      **215/215 first-roll** (the EA pins' home) · chunk 3 **101/101
      first-roll** · chunk 4 **95/95 at roll 2** (the first roll's
      AE3 dark-mode flake, the same isolation ledger) · chunk 5
      **89/89 first-roll** — every chunk's posture recorded, the
      S176/DZ5 posture chain rode (the tmpfs scratch db + the tmpfs
      Chromium caches + retries: 1), no assertion weakened
- [x] the tripwire green after the doc-chain lockstep — **138/138**
      (the script-conventions mirror pin re-anchored to the 658 map;
      the CQ6/DY3 cross-reads green on the re-tagged pair)
- [x] the evidence frames captured + self-verified (the 177-clone
      frames: the draft · the saved round-trip · the empty-state
      placement · the mobile drawer — each frame's markers asserted
      in-DOM before the shot, the mobile no-selection posture
      verified at scrollWidth exactly 390, md5s distinct)
- [x] the doc chain lockstep (the §8 list) · `docs/session_226.md` ·
      the worklog Session-188 entry · the capture script's own lesson
      recorded (the pre-hydration fill trap: a fill before the
      hydration commit gets its values snapped back to "" — the
      browser POSTs empty fields while the DOM .value reads filled)
- [x] the `.env.example` contract re-verified (no env changes this
      cycle)
- [x] committed + pushed to `main` via the SSH wrapper +
      remote-verified + the key shredded (the cycle commit `07ba497` —
      30 files, +2197/−90 — pushed 1e5f389..07ba497, remote verified
      refs/heads/main @ 07ba497 == local HEAD; the operator key
      shredded — and this session's key block parsed CLEAN on arrival,
      no reconstruction needed, unlike the s176 paste)

## §11 The final checklist (the operator's asks, mapped)

- [x] Workspace refreshed (`git clone` at `1e5f389`; the doc chain
      re-read: AGENTS/CLAUDE/README/PAD/SKILL + session_224 +
      remediation-plan-session176 + worklog + session_225)
- [x] Understanding validated against the codebase (the cold baseline
      gates + the census sites)
- [x] The skills-based audit (web-application SKILL primary; the
      catalog's rotation; the `skills/` folder excluded from
      checking/testing/compilation)
- [x] The parity iteration (the live reference login; the standing
      chrome: drawer 113 green [114th at the close, post-EA3b], the
      desktop parity probe MATCH; the mobile-nav 390×844 surface
      covered by the drawer check + the EA3b no-overflow posture
      verified; the Tailwind v4 bug watch held — no bug for 114
      consecutive checks)
- [x] `.env` = `DATABASE_URL="file:../db/custom.db"` + the repo-root
      `db/` (verified; the runtime boot line resolves it)
- [x] The vitest/playwright configs validated (the standing suites;
      the e2e posture legs unchanged)
- [x] The remediation plan written into `docs/` BEFORE any source
      change (this document)
- [x] TDD execution (the §4 pins RED→GREEN; the §6 honest-RED
      inventory at the designed markers on the pre-fix build)
- [x] The evidence frames under `docs/screenshots/`
- [x] `.env.example` in the commit (re-verified, no changes)
- [x] The doc chain + worklog updated; the session log written
- [x] `git commit` + the SSH-wrapper `git push` to `main` (no new
      branch) + remote-verified (07ba497; this plan-close tick is the
      S170-era follow-up commit)
