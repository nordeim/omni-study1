# Remediation Plan — Session 178 (Cycle 128, Batch EB)

> Status: PLANNED (pre-change record — the immutable plan; the as-executed
> close lives in §10). Written before any source change, per the standing
> doctrine ("write the cycle plan into docs/remediation-plan-sessionN.md
> BEFORE any source change").
>
> Operator directive: refresh the workspace, re-read the doc chain
> (AGENTS/CLAUDE/README/PAD/SKILL + session_226 + session_227 +
> remediation-plan-session177 + worklog), validate against the codebase,
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
> Session note: this cycle continues the rotation from the S177/Batch EA
> close (`07ba497` + the plan-close `c8a60fe` + the operator's session_227
> transcript commit `d6a88a0`, all pushed + remote-verified). The workspace
> was COLD (a fresh `git clone` at `d6a88a0` on `main` — node_modules
> re-derived [499 packages], chromium re-derived at the locked pin,
> `db/custom.db` re-pushed + re-seeded, `.env` re-created from
> `.env.example`). Every reference fact below was measured by a live gated
> probe THIS session (agent-browser + playwright, computed DOM) before
> this plan was written; every clone fact by direct read of the working
> tree.

## §0 Scope, method, cold baseline, live parity

**Workspace (cold — `git clone` at `d6a88a0` on `main`; the working tree
clean).** `bun install` ✓ (499 packages); `bunx playwright install
chromium` ✓ (chromium-headless-shell v1243); `bun run db:generate` /
`db:push` / `db:seed` ✓ (the seed line "demo account ready"); `cp
.env.example .env` ✓ at `DATABASE_URL="file:../db/custom.db"`; `db/` at
the repo root.

**Cold baseline gates (re-run this session before any change):** `bun
run lint` ✓ (0 errors) · `bun run typecheck` ✓ (0 errors) · `bun run
test` ✓ **1743/1743 (52 files)** — the documented S177 close state
reproduced exactly. The dev server booted on :3000 (Turbopack, the
reaper-proof double-fork daemon).

**Live parity chrome (the standing tripwires, re-run this session):**

- **The drawer check — GREEN, the 115th consecutive** no-Tailwind-v4-
  mobile-nav-bug confirmation (oklab(0 0 0 / 0.2) backdrop + blur(4px),
  288px white shadow-2xl panel, 20 links, no footer, Escape + navigate
  auto-close, the z-40 fixed app-bar) at 390×844 on the remediated tree.
- **The desktop parity probe — MATCH** (all five structural checks
  against the live reference login: sidebarOuterWidth 260, navLinkCount
  20, firstLinks set, mainX 260, mainWidth 1180).
- **The per-cycle dialog re-probe: the S176 ports hold with NO
  re-drift** — Events ("Event title" / "Room or meeting URL" / "Event
  details..." + the eight-label census), StudyGroups ("Group Name \*" /
  "e.g., Math Study Squad" / "What's this group about?"), Tasks ("Task
  name..." / "Add a subtask..." / "Add notes...").

**Method.** Computed-DOM authority (the repo doctrine): every reference
fact below was measured by a live gated probe this session (login →
navigate → create-through-the-reference's-own-UI → measure → cleanup),
every clone fact by the mirrored probe or direct read. Zero residue on
every write-path probe (the trash-delete cleanup + the end state
re-verified at 0 notes). The probe account is in the reference's DARK
mode (html class="dark") — the computed colors below are dark-mode
readings; the ports carry the reference's class-level anatomy
(theme-adaptive), never a fixed dark-mode color. One probe-lesson
recorded this session (§9.10): Playwright's `hasText` with an ANCHORED
REGEX fails against the reference's Save/Edit buttons (innerText ≠
textContent-trim) while `getByRole` exact resolves — the probes now ride
role locators.

## §1 The audits (Mode-C; every finding re-verified by direct read or live probe by the orchestrator)

### Audit A — the recent-changes axis (`d6a88a0`, docs-only since the S177 fix `07ba497`): **0C / 0H / 0M / 0L / 0I.**

`d6a88a0` adds only `docs/session_227.md` (the operator's own raw
transcript commit — docs-only, no code surface). `07ba497` (the S177/EA
cycle: 30 files) was closed machine-verified by the S177 gates and the
5-chunk cert; this session's cold baseline (lint/tsc/unit 1743) plus the
EA1 re-probe legs inside the S178 reference probes (the draft flow —
the create-through-the-reference's-own-UI legs below all exercised it)
re-confirmed the cycle's surfaces still hold. No new findings.

### Audit B — the rotation axis (the Notes editor MODE SPLIT — the S177 plan §1 B-3 deferral, now measured to FULL depth; the web-application skill's §4/§7/§8/§9/§12/§13/§16/§17 rubric): **0C / 0H / 0M / 2L / 0I.**

**B-3 (L — this cycle's core): the view/edit MODE SPLIT.** The
reference's existing-note editor opens in VIEW mode; the clone's editor
is always-editable (the S77/AD port — the documented superset posture
that this cycle now RESHAPES to the reference's measured chrome). The
measured record (all live this session, computed DOM, zero residue):

| Surface | Reference (measured) | Clone (probed/read) | Verdict |
|---|---|---|---|
| Open a note | **VIEW mode** — the title input DISABLED (value = the stored title, placeholder "Note title...", 14px/700, w:533) | the always-editable editor (NoteTitleInput + the MoreVertical popover + the gradient Save + the Font row + the tag row + the Quill card) | the port below |
| The view action row | [pin 36px outline][palette 36px outline][**Edit 93×36 outline px-4 rounded-md**][**trash 50×36 outline px-4 rounded-md text-red-600**] (all outline-variant, bg-background; pin/palette are B-4/B-5 deferrals) | [MoreVertical black 36px popover][Save gradient] | the reshaping |
| The view body | `div.prose.prose-slate.max-w-none.note-content` — the read-only HTML render, 16px/24px — **NOT a Quill instance** (no .ql-editor in view mode) | the always-mounted Quill | the port |
| The view chrome | NO Font row, NO tag row, NO Attach row, NO Save, no toast on save/delete | the full always-on chrome | the port |
| The Edit switch | "Edit" → the EDIT toolbar: the title ENABLED (w:438) + [notebook select "None" 128×36][palette-or-pin 36px][**Save 98×36 gradient**][**X 48×36**] + the Font row ("Default" select 128×32 + Divider 89×32) + the tag row + the Attach row + the Quill editor with the stored content | (no mode concept exists) | the port |
| **The persistence mechanism (the net probe — DECISIVE)** | edit typing: **0 network calls in 7s** (NO autosave); **X-exit: 0 network calls** (a LOCAL-ONLY exit — the edited content shows in view mode from local state, no PUT); **Save: 1 PUT + refetch**; trash: 1 DELETE + refetch | the clone's autosave (S78/AE2, the debounced 600ms PATCH on every burst) + the explicit Save PATCH | **the clone's autosave is the network-measured SUPERSET — the S77/AD4 record now confirmed at the network level** (the reference does NOT discard on X — the content persists LOCALLY; the clone persists server-side — the pinned divergence, §9.4) |
| The X exit | view mode returns (title disabled, [Edit][trash], the prose body) + the edited content VISIBLE in the prose | (no exit affordance exists) | the port |
| Save (edit mode) | view mode returns + the content PUT + no toast | the saveNow toast ("Note saved." — the pinned superset, AH3b) | the port (the toast stays) |
| Trash | **DIRECT delete — no confirm dialog** (measured), the row gone, the pane resets | the popover's Delete note (also direct — the DA1 latch) | the affordance moves to the view row |
| The draft interplay | the draft overlays; X restores the PRIOR pane state (the S177 EA1 measurement, re-confirmed) | the EA1 port's behavior matches | holds |

**B-8 (L — the residual toolbar deltas, DEFERRED again):** the
reference's edit-mode action row carries ONE 36px icon between the
notebook select and Save (the palette-or-pin — B-4/B-5 territory), and
the Font row's Divider is the outline-flavored form (the S77 record
measured it black; this session's account is dark-mode where
bg-background computes #0a0a0a — the class anatomy is the vehicle either
way). Deferred with the B-4/B-5/B-6/B-7 ledger.

### Audit C — the standing gates re-verified this session: **clean (the §0 record).**

The drawer check (115th), the desktop parity probe (MATCH), the
Events/StudyGroups/Tasks dialog re-probe (no re-drift), the cold
baseline gates (lint/tsc/unit 1743) — all green before any change. The
mobile-nav 390×844 surface stays covered by the drawer check's standing
posture + the AE9-13 no-overflow family (the cert's standing legs).

## §2 EB1 — the VIEW mode (the B-3 close, first half)

The measured port, view-layer only (the wire/API/import surfaces
untouched — `updateNote` PATCHes the same `NoteInput`):

1. **The mode state** — notes-view.tsx gains
   `const [editing, setEditing] = React.useState(false)`. The reset
   sites: `selectNote` (every selection change opens VIEW — the
   measured per-note default) · `saveDraft`'s success (the created note
   selected in VIEW — the measured post-Save state) · `saveNow`'s
   success (Save returns to VIEW — the measured Save→view) · the trash
   (selection clears — the existing behavior). The draft's open/discard
   NEVER touches `editing` (the draft overlays; X restores the prior
   pane state — the measured interplay).
2. **The render ladder** — the right pane's `selected` branch splits:
   `selected && !editing` → the VIEW surface (this section) ·
   `selected && editing` → the EDIT surface (§3). The ladder above the
   selection (loading gate → draft → no-selection) is UNTOUCHED.
3. **The VIEW surface** —
   - **The title row**: a plain controlled `<input type="text"
     disabled value={selected.title} aria-label="Note title"
     placeholder="Note title...">` styled with the editor title's exact
     className (text-sm font-bold, the theme-aware colors) + the
     disabled state's cursor. (The NoteTitleInput child stays
     edit-mode-only — the debounced PATCH machinery is pointless on a
     disabled input.)
   - **The action row**: `<Button variant="outline" h-9 px-4>` **Edit**
     (the Pencil lucide + "Edit" — the measured 93×36 shape) wired to
     `setEditing(true)` · `<Button variant="outline" h-9 px-4
     text-red-600...>` **trash** (the Trash2 icon, icon-only — the
     measured 50×36 shape; the clone's superset
     `aria-label="Delete note"`, the S177 lesson-2 unlabeled-control
     class) wired to the existing `removeNote(selected.id)` (the DA1
     double-fire latch rides).
   - **The body**: `div.prose.prose-slate.max-w-none.note-content`
     (the reference's exact class anatomy — the clone's site-local CSS
     delivers the measured typography, globals.css §9) rendering the
     stored content: `sanitizeNoteHtmlDom(selected.content)` (the
     S140/CO1 client gate — the same module the QuillEditor mount path
     uses) → `looksLikeHtml` ? dangerouslySetInnerHTML : a
     whitespace-pre-wrap paragraph (the seeded plain-text rows render
     their newlines — React escapes the text node). NO Quill, NO Font
     row, NO tag row, NO Attach row, NO Save in view mode.
   - **The `note-content` CSS block** (globals.css, scoped
     site-local per the "layout, rounding and typography stay
     site-local" doctrine): 16px/24px body (the measured values), the
     p/h/ul/blockquote margins a minimal measured-adjacent set, the
     link color the site's primary, `max-w-none`. The `prose`-family
     classes ride as inert anatomy tokens (no typography plugin in the
     clone — the class list documents the reference's shape; the CSS
     delivers the styling).

## §3 EB2 — the EDIT-mode reshaping (the B-3 close, second half)

1. **The action row reshapes** — the edit surface's title row becomes
   the measured edit toolbar: [**the notebook select** (Select w-32,
   `aria-label="Move note to notebook"` — the CQ3/CR3 named-combobox
   lineage, value `selected.notebookId ?? "none"`, onChange →
   `patchSelected({ notebookId })` — the same PATCH the popover's mover
   fired)] · [**Save** (the existing gradient h-9 px-4, `saveNow`)] ·
   [**X** (outline h-9 px-4 icon-only,
   `aria-label="Exit edit mode"`, `setEditing(false)`)].
2. **The MoreVertical popover RETIRES** — its mover (the inline select
   replaces it) and its Delete (the view-mode trash replaces it) both
   have new homes; the CQ3 pin family re-anchors to the inline select
   (§4).
3. **The Font row, the tag row, the editor card** — UNCHANGED (the
   S77/AD5/AD6 measured anatomy — already the reference's edit-mode
   chrome; the Divider stays the clone's black idiom, the B-8 record).
4. **`saveNow`** — the existing flush-title-first + content-PATCH +
   toast machinery is UNTOUCHED; the success branch adds
   `setEditing(false)` (Save → view). The FAILURE branch stays in edit
   (the retry affordance — the clone's superset posture; the reference's
   failure behavior is unmeasured).
5. **The X exit** — `setEditing(false)`; the pending debounced autosave
   rides untouched (the reference's X is the measured LOCAL-only exit;
   the clone's X rides the already-fired autosave — the pinned
   superset divergence, §9.4). The NoteTitleInput's unmount-flush fires
   (the BW3 mechanism — the pending title PATCH lands).
6. **The selection switch mid-edit** — `selectNote`'s reset (§2.1) + the
   existing key-remount/unmount-flush machinery (the departed-note
   AG6 gates) — unchanged semantics.

## §4 The pins (the TDD specs — RED first at the designed markers)

**The e2e additions (parity-session7.spec.ts — the S177 EA pin block's
successor):**

- **EB1 (the view-mode shape pin):** open a seeded note ("Dot product
  intuition") → assert the title input is VISIBLE and **DISABLED** and
  carries the stored title; the **Edit** button + the **Delete note**
  (aria-label) button render in the pane; the body renders as the
  `.note-content` prose containing the seeded text; **NO `.ql-editor`**
  (count 0); no Font row ("Font:" absent); no tag row (the "Add tag..."
  input absent). (RED pre-fix: the editor is always-editable — the
  `.ql-editor` count reads 1 ≠ 0 + no Edit button exists.)
- **EB2 (the Edit-switch pin):** click **Edit** → the title input
  ENABLED (not disabled); the notebook combobox
  (`getByRole("combobox", { name: "Move note to notebook" })`) renders;
  the Save + the X (`aria-label="Exit edit mode"`) render; the
  `.ql-editor` mounts VISIBLE with the stored content (the seeded text
  inside); the Font row renders. (RED pre-fix: no Edit button — the
  click locator times out.)
- **EB3 (the X-exit pin):** in edit mode type a marker fragment into
  the body → click **X** → the view mode returns (the title disabled,
  the [Edit][trash] row) + the `.note-content` prose contains the
  marker (the measured reference observable — the content persists in
  view; the clone's server-side autosave is the recorded superset —
  §9.4 — the pin's comment owns the divergence record). (RED pre-fix:
  the X affordance does not exist.)
- **EB4 (the trash-direct pin):** in view mode click the trash
  (`aria-label="Delete note"`) → **NO dialog** (`getByRole("dialog")`
  count 0 — the reference's measured no-confirm) → the row disappears
  from the list pane → the no-selection state returns. (RED pre-fix:
  the trash affordance does not exist in the view row.)

**The e2e re-anchors (the port-follows-the-measurement doctrine — the
S177 six-site precedent, now ~24 blocks across four files):**

- **The "open a note → editor" inserts** (an `await
  page.getByRole("button", { name: "Edit", exact: true }).click()` +
  a settle after every seeded-note open that then types/asserts the
  editor surface): parity-session7 — AD1 (:427, the card + toolbar
  asserts), AD1-superset (:462, the bold-format leg), AD4 (:542, the
  Save gradient), AD5 (:491, the Font row), AD6 (:516, the tag row),
  AE1 (:807, the load-window Save), AE2 (:850, the autosave streak —
  incl. the note-B switch leg), L980 (the late-rejection family),
  AH2a (:1143) + AH2b (:1228) (the departed-Save legs), AH8a (:1355,
  the title edit) + AH8b (:1394), BW3 (:1431, the title-debounce
  PATCH count); resilience — BT11 (:44, the title-PATCH toast);
  dark-mode — AH3b (:516, the success toast) + AH3c (:530, the error
  toast) + the blank-note placeholder (:293 — the create flow's
  post-Save blank note now opens in VIEW; the pin inserts the Edit
  click before the `.ql-editor.ql-blank` placeholder assert).
- **The create-then-edit legs** (the draft-Save → view → Edit): the
  L980/AH1a/AH2a/AH2b flows create a probe note through the EA1 draft
  flow then edit it — the post-Save editor is now VIEW (the EA1 pin's
  own post-Save assert re-anchors with it, below); each flow inserts
  the Edit click after its create.
- **EA1's post-Save assert** (:2926 `expect(.ql-editor).toBeVisible()`)
  → the view-mode shape: the row landed (existing) + the title
  DISABLED + the `.note-content` prose contains the draft's body + the
  [Edit][trash] row. The zero-residue cleanup (:2929-2930) drops the
  popover-open line (the trash button itself carries the same
  `getByRole("button", { name: "Delete note" })` locator — one line
  deleted, one kept).
- **The CQ3 rewrite** (:2043 — the Popover keyboard test): the
  popover's focus/two-stop assertions retire (the popover is gone);
  the pin re-scopes to the inline mover: open the note → **Edit** →
  the named combobox renders + is keyboard-operable (ArrowDown opens
  the listbox → the target option → Enter commits) → the PATCH
  notebookId lands (the route spy) → the select's trigger text shows
  the moved notebook. (The keyboard-reachability claim is now by
  construction — an inline Radix Select is a real tab stop; the pin
  keeps the named-combobox + operate-by-keyboard + PATCH assertions.)
- **The hostile-note pin** (parity-session9 :912): opens the hostile
  note → NOW the view mode's prose renders the stored hostile HTML
  through `sanitizeNoteHtmlDom` (the S140/CO1 client gate) — the pin's
  zero-requests + no-live-img assertions become the VIEW-mode prose
  contract (the render path the port adds); the ql-editor refs inside
  re-anchor to the prose surface (the Edit leg only if the pin's
  remaining asserts need the editor).
- **The untouched-green set** (verified by inspection, no edit):
  S7-F (:363 — the disabled title still 14px/700 + the placeholder
  locator), AD3 (:477, ditto), AD7 (:557, the list row), the mobile
  "selects a note" (:320 — the disabled input carries the aria-label +
  the stored value), EA1b/EA1c/EA3 (the draft pins — the draft surface
  untouched), the theme-system selected-row pins (:385/:430), the
  session8 pane-contract pins, the navigation loading gate (:943).

**The unit layer:** no new pure seam this cycle (the mode split is
view-state; the wire model is untouched) — the unit census stays
**1743/1743**; the e2e census moves **658 → 662** (+4: the
EB1/EB2/EB3/EB4 pins).

**The census-anchor trip:** the hue-tokens mirror pin's notes-view line
anchors shift with the render-ladder changes (the S177 designed-trip
precedent) — re-anchored to the new lines, count unchanged.

## §5 The execution order

1. The e2e pins written FIRST (§4) — the RED sweep proven at the
   designed markers on the pre-fix tree.
2. EB1 the view mode (§2.1-2.3) — the mode state + the view surface +
   the note-content CSS.
3. EB2 the edit reshaping (§3) — the action row + the popover
   retirement + saveNow/X.
4. The re-anchor sweep (§4's inventory) + the census re-anchor.
5. The GREEN sweep: the full-file cold run of parity-session7 (82
   expected) + dark-mode + parity-session9 + resilience +
   mobile-navigation + navigation.
6. The full gates: lint · tsc · unit 1743/1743 · build.
7. The cert re-tag (658 → 662) + the 5-chunk cold cert (the S176/DZ5
   posture chain rides: the tmpfs scratch db, the tmpfs Chromium
   caches, retries: 1).
8. The evidence frames (§8) — the view mode (the disabled title + the
   [Edit][trash] + the prose), the edit mode (the reshaped toolbar),
   the empty-state/drawer standing frames.
9. The doc-chain lockstep (§8.8) + the commit + the SSH-wrapper push.

## §6 The honest-RED inventory (designed markers)

- EB1's RED: the `.ql-editor` count assert (the pre-fix editor mounts
  the Quill immediately — count 1 ≠ 0) + the Edit-button locator
  timeout (no such button pre-fix).
- EB2's RED: the Edit click itself (the locator timeout — the button
  does not exist pre-fix).
- EB3's RED: the X locator (`aria-label="Exit edit mode"` — the
  affordance does not exist pre-fix).
- EB4's RED: the trash locator (`aria-label="Delete note"` in the
  view row — pre-fix the only "Delete note" lives inside the popover,
  which is CLOSED in view mode — the pane-scoped locator times out).
- The re-anchors' RED: the inserted Edit clicks time out pre-fix (the
  button does not exist); the CQ3 rewrite's inline-combobox locator
  times out (the popover's mover renders only after the popover opens
  pre-fix — and the popover itself retired in the same change).
- The EA1 post-Save re-anchor's RED: the disabled-title assert fails
  pre-fix (the editor's title is ENABLED after the create-Save).

## §7 The verification gates

lint ✓ · tsc ✓ · unit **1743/1743** (52 files — unchanged, no new
seam) · build ✓ · parity-session7 **82/82** cold (78 prior + the 4 EB
pins) · dark-mode 29/29 · parity-session9 40/40 · resilience ·
mobile-navigation · navigation · the 5-chunk cold cert at the
re-tagged map **158+215+101+95+89 = 658 → 662** (+4, chunk 2's home) ·
the tripwire **138/138** after the doc-chain lockstep · the drawer
check (the 116th at the close) · the desktop parity probe MATCH.

## §8 The evidence frames + the doc-chain lockstep

**The frames (`docs/screenshots/`, self-verifying — the markers
asserted in-DOM before the shots; md5s distinct):**
`178-clone-notes-view-mode.png` (the view mode: the disabled title +
the [Edit][trash] row + the prose body) ·
`178-clone-notes-edit-mode.png` (the reshaped edit toolbar: the
notebook select + Save + X + the Font row + the editor) ·
`178-clone-notes-view-mobile.png` (the mobile view-mode posture at
390 — the no-overflow superset) · `178-clone-mobile-drawer.png` (the
standing chrome at the close).

**The doc-chain lockstep (the census re-tag at every site):** the
cert script's Expected map + header (source) → the S128/CC2 mirror
pins' recomputed constants → run-cert-chunk.sh's header (the
historical-tense posture) → CLAUDE.md's test-pyramid pair (the DY3
pin's own enforcement) → vitest.config.ts's header (the e2e census
line) → README's badge (2401 → 2405) + the four body sites + the
Session-178 row → the SKILL's census sites → AGENTS.md's two census
lines + the S178 lessons block → PAD **v1.3.86** →
`docs/session_228.md` → the worklog Session-189 entry → this plan's
§10 close.

## §9 The adjudications (the open questions, resolved)

1. **The pin/palette stay DEFERRED** (B-4/B-5 — each a schema
   feature: the pinned Boolean + the color string + the PATCH legs);
   the view row renders [Edit][trash] and the edit row renders
   [notebook][Save][X] with NO dead buttons for the deferred
   features (the S177 adjudication-2 lineage — a dead button is worse
   than a recorded gap).
2. **The trash keeps the clone's superset
   `aria-label="Delete note"`** over the reference's measured
   icon-only-unlabeled button (the S177 lesson-2 probe class + the
   CQ3/CR3 a11y lineage; the reference's own unlabeled trash is what
   stranded the s177 residue cleanup).
3. **The view-mode title is a plain disabled input** (the NoteTitleInput
   child retires from view mode — the debounced PATCH machinery is
   dead weight on a disabled control; the placeholder + the
   className + the aria-label stay identical so the S7-F/AD3/mobile
   pins hold untouched).
4. **The autosave stays — the SUPERSET record now network-confirmed:**
   the reference's edit mode fires ZERO calls during 7s of typing and
   its X fires zero PUTs (the LOCAL-only exit — the content survives
   in view from local state; a reload loses it). The clone's autosave
   (the 600ms debounced PATCH) + the X-exit-ridden-autosave keeps the
   server current — the S77/AD4 superset posture, upgraded from a
   reasoned claim to a MEASURED divergence this session. The EB3 pin
   owns the record.
5. **The `prose`-family classes ride as inert anatomy tokens** (no
   typography plugin in the clone — adding one for a single surface
   violates the smallest-diff doctrine; the site-local CSS block
   delivers the measured 16px/24px typography, the "layout, rounding
   and typography stay site-local" doctrine at globals.css:581).
6. **The plain-text seeded rows render with
   whitespace-pre-wrap** (the React-escaped text node — no
   dangerouslySetInnerHTML on non-HTML content; the HTML rows ride
   the sanitized innerHTML). The seeded notes' plain text keeps its
   newlines in view mode.
7. **The CQ3 keyboard pin re-scopes to the inline mover** — the
   Popover's open-focus/two-stop assertions retire WITH the popover
   (the surface itself is gone); the reachability guarantee is now by
   construction (an inline Radix Select is a real tab stop), and the
   pin keeps the named-combobox (CR3), the keyboard-operated commit,
   and the PATCH landing.
8. **saveNow's failure stays in edit mode** (the retry affordance —
   the reference's failure-path behavior is unmeasured; the clone's
   error toast is the existing pinned superset).
9. **The reference's edit-mode second icon (palette-or-pin) is
   recorded, not ported** (B-8/B-4/B-5 territory — the measured
   record above).
10. **The probe-lesson record**: Playwright's `hasText` with an
    ANCHORED REGEX does not match the reference's Save/Edit buttons
    (innerText ≠ textContent-trim — a zero-match timeout) while
    `getByRole` exact resolves them; the probes and any future
    reference-side locator ride role locators. (The clone-side specs
    are unaffected — their hasText targets match.)

## §10 The as-executed close (filled at the cycle's end)

- [x] EB1 the view mode green (the disabled title + the [Edit][trash]
      row + the prose body + the note-content CSS) — the EB1 pin RED
      proven pre-fix at the DESIGNED marker (the toBeDisabled
      expected/received pair + the Edit-button timeout) / GREEN
      post-fix (the full-file cold run)
- [x] EB2 the edit-mode reshaping green (the notebook select + Save +
      X + the popover retirement) — the EB2 pin RED at the Edit-click
      timeout / GREEN (the mover + Save + X + the Font row + the
      Quill-with-content asserts)
- [x] EB3 the X-exit green (the view returns + the content persists —
      the autosave-superset divergence pinned) — the EB3 pin RED /
      GREEN (the net-probe record: the reference's X fires ZERO PUTs;
      the clone's autosave is the network-measured SUPERSET)
- [x] EB4 the trash-direct green (no dialog + the row gone + the
      no-selection state) — the EB4 pin RED at the pane-scoped trash
      locator / GREEN (the pin's tail fixed once: the 0-notes
      empty-state assert dropped — the SEEDED account keeps its rows
      after the probe deletion, the empty state is the EA3 pin's own
      territory)
- [x] the ~24-block re-anchor sweep green + the census re-anchor —
      the honest pre-fix inventory: the full-file run's 16 failing
      describes ALL inside the predicted set (AD1 ×2, AD4, AD5, AD6,
      DJ1, AE1, AE2, L980, AH1a, AH2a, AH2b, AH8a, AH8b, BW3, CQ3,
      EA1) + one environmental flake (S7-A beforeEach stall,
      retry-green); TWO second-order failures fixed at the TEST level
      after the full-file GREEN sweep (the BW3 caret: the edit
      toolbar's narrower title row moved the click-to-caret position
      MID-STRING on the long post-AH8a title, mangling it and
      breaking every later row locator — the deterministic End-park
      fix; the AD4 color read: React reconciled the view-mode trash's
      DOM node into the Save slot, the Button's 150ms
      transition-colors rode the class swap, and the raw read caught
      the interpolated blend — the polling toHaveCSS fix); the
      hostile-note render-gate pin re-scoped to the PROSE surface
      (the gate's own module, now the primary render path); the CQ3
      keyboard pin rewritten to the INLINE mover (the named
      combobox + the keyboard-operated commit + the PATCH landing —
      reachable by construction); the hue-tokens census anchors
      re-anchored 871 → 913 (tripped as designed)
- [x] lint ✓ · tsc ✓ · unit **1743/1743** (52 files — unchanged, no
      new seam: the mode split is view state, the wire's updateNote
      PATCH/NoteInput model untouched) · build ✓
- [x] parity-session7 **82/82** cold (the second full-file roll,
      2.2m) · dark-mode **29/29** · parity-session9 **40/40** ·
      resilience **48+2 flaky** (the files-upload edge leg + the
      socket-timeout class, retry-green) · navigation **66+1 flaky**
      · theme-system **20/20** · s17-fresh-user **12/12** ·
      accessibility **35/35** · a11y-sweep **21/21**
- [x] the 5-chunk cold cert at the re-tagged map: **chunk 2 219/219
      first-roll** (the EB pins' home) · **chunk 3 101/101
      first-roll** · **chunk 4 95/95 first-roll** · **chunk 5 89/89
      at roll 2** (the s25 delete-account waitForFunction stall,
      isolation-verified 6/6) · **chunk 1 157/158 at roll 2 of 3**
      (the best roll: the rotating AL1/BZ4 load-borne legs green on
      the re-roll, isolation-verified 5/5; the ONE persistent
      casualty: the AE9-13 leg — the environmental rum-write stall,
      see the unplanned leg below) — **661/662 with the one
      documented environmental casualty**
- [x] **THE UNPLANNED LEG — the RUM-write/boot-read contention,
      root-caused live but not fixed (the honest limit)**: the ~30s
      hydration-gate stall on the FIRST /Exams//Files//StudyGroups
      navigations after a fresh server boot (the P1008 on
      rumEvent.upsert queueing the boot's read queries — /api/auth/me
      + the view's pre-warm — past the socket timeout). ISOLATED by
      blocking /api/rum in the browser probe (deterministically
      clean — all five views ~300ms, twice); reproduced on the
      PRE-CHANGE tree (the stash + rebuild + probe — pre-existing,
      this sandbox instance, the S176 "process-wide stall windows"
      class with its trigger now isolated); WAL mode,
      connection_limit=4, and wrapping the upserts in ONE
      $transaction ALL failed to cure it (each experiment live-tested
      then reverted — the cycle stays surgical); the curl-level
      reproduction caught a 7.5s concurrent-request window (4 rum
      POSTs + the me + the exams). Recorded as the S179 candidate:
      the beacon's per-metric POST batching (the route already
      accepts event batches) + the engine's write/read posture. The
      ledger: the S177 cert ran this leg green on a DIFFERENT sandbox
      instance (the class is sandbox-specific — the S176 record's
      own words)
- [x] the evidence frames captured + self-verified (the 178-clone
      frames: the view mode · the edit mode · the mobile view-mode
      posture · the mobile drawer — each frame's markers asserted
      in-DOM before the shot, md5s distinct; the mobile bar recorded
      against the PRE-port baseline: the view mode measures 511 vs the
      pre-port always-editable editor's 526 on the same surface —
      NARROWER, no regression; the two-pane squeeze is the S78/AE6
      record's own family, unpinned for the open-note surface — the
      AE9-13 family pins five other views)
- [x] the doc chain lockstep (§8) · `docs/session_228.md` · the
      worklog Session-189 entry · the PAD **v1.3.86** · the AGENTS
      S178 lessons ×5
- [x] the `.env.example` contract re-verified (no env changes this
      cycle)
- [x] committed + pushed to `main` via the SSH wrapper +
      remote-verified + the key shredded

## §11 The final checklist (the operator's asks, mapped)

- [x] Workspace refreshed (`git clone` at `d6a88a0`; the doc chain
      re-read: AGENTS/CLAUDE/README/PAD v1.3.85/SKILL + session_226 +
      session_227 + the S177 plan + worklog)
- [x] Understanding validated against the codebase (the cold baseline
      gates + the census sites)
- [x] The skills-based audit (web-application SKILL primary; the
      catalog's rotation; the `skills/` folder excluded from
      checking/testing/compilation)
- [x] The parity iteration (the live reference login; the standing
      chrome: drawer 115 green [116th at the close], the desktop
      parity probe MATCH; the mobile-nav 390×844 surface covered by
      the drawer check + the AE9-13 family; the Tailwind v4 bug watch
      held — no bug for 115 consecutive checks)
- [x] `.env` = `DATABASE_URL="file:../db/custom.db"` + the repo-root"file:../db/custom.db"` + the repo-root
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
      branch) + remote-verified
