# Session 234 (S181/Batch EE — the full cycle): the notes tag-row family port (the B-8-family audit's remaining rows) + the standing Subjects/Holidays rotation (clean)

The workspace was COLD (a fresh clone at `31d92ff` on `main` — the S180 close
plus the operator's session_233 transcript commit). The environment re-derived
per the standing recipe; the cold baseline reproduced the S180 close exactly
(lint ✓ · tsc ✓ · unit 1779/1779 [54 files] · build ✓). The doc chain re-read
(AGENTS/CLAUDE/README/PAD v1.3.88/SKILL + session_232/233 + the S180 plan's
§10 close + the worklog tail); the skills audit refreshed (the
web-application SKILL's rubric + the catalog + the tdd loop rules; `skills/`
excluded from checking/testing/compilation throughout).

The standing chrome re-run at the open: the drawer check **GREEN — the 121st
consecutive** (oklab backdrop + 4px blur, 288px panel, 20 links, no footer,
Escape-close superset) · the desktop parity probe **MATCH** (all five
structural checks) · the reference account re-verified at **ZERO residue**
(0 notes / "No notes yet").

**The rotation axis — the S180 close's named candidate head, closed in ONE
view-layer rotation** (five reference probes `probe-s181-rows{,2,3,4,5}.mjs` +
the clone-side stack probe `probe-s181-clone.mjs`, all incremental-save, all
zero-residue at their closes):

- **EE the TAG-ROW FAMILY** (the B-8-family audit of the remaining toolbar
  rows — the S180 plan's recorded out-of-scope posture, "its own cycle if the
  standing probes flag it"): the measured drift is REAL and larger than the
  S180 record suggested — the tag row wrapper carried `mt-2` (the WRONG margin
  axis) where the reference carries `flex flex-wrap items-center gap-2 mb-4`,
  and because the editor pane is a FLEX COLUMN (margins ADD, never collapse —
  the S16 lesson's mirror image), the clone's row stack computed
  **24px/0px/28px** where the reference computes **16px/16px/16px** — the tag
  row sat FLUSH against the Attach row. The port: the wrapper at both sites
  (draft + edit) + the editor card's `mt-3` dropped (the attach row's mb-4 IS
  the 16px gap) + the pill re-ported to the **Badge-secondary anatomy**
  (`px-2.5 py-0.5 text-xs font-semibold`, content-sized — neutral-800 in BOTH
  modes; the reference's own --secondary IS neutral-800/neutral-50 in both
  modes, measured this cycle in dark + the S178 light record; the old
  `dark:bg-neutral-700` was a real dark-mode drift) + the input re-ported to
  the **shared shadcn form control** (`w-24 h-7`, border-input/px-3/shadow-sm
  — the old bespoke `w-32 border-neutral-800` shipped a near-black border in
  light mode) + **the ghost ADD BUTTON** (h-7 px-3, Plus size-4 → 40×28
  computed): the measured FUNCTIONAL gap — the reference adds tags by button
  click, the clone was Enter-only; the button rides the same addDraftTag/
  addTag path (Enter stays), with the aria-label + disabled-when-empty
  superset. The list tile's tags container `mt-1.5 → mt-2` (the pill colors
  stay the AD7-recorded readable deviation).
- **The standing Subjects/Holidays rotation re-probed: MATCH, no drift** (the
  tab copy, the empty states, the Add Subject/Add Holiday dialogs incl. the
  Holiday/Break/No School type family — the reference's account holds no
  subjects/holidays; the empty states render and match the S174/S175 ports;
  no code rode it).

`docs/remediation-plan-session181.md` written plan-first and validated against
the codebase (every site read before the plan). The TDD execution — **the
honest RED PROVEN**: the EE pins (6, parity-session7 after the ED block) ran
against the TRUE pre-change standalone (the standalone was pre-change by
construction — no src edit before the RED sweep); all 6 failed at their
designed markers, with one unplanned leg root-caused: EE1/EE4's first RED was
a JSON.parse pin bug (`page.evaluate(string)` already returns the object —
fixed; the designed-marker RED evidence is the clone probe's own pre-change
24/0/28 measurement, recorded in the plan §2.1 before any source change).

**The unplanned legs, root-caused**: (1) the add button's icon renders 16px
not 12px — the reference's shadcn Button base carries `[&_svg]:size-4` whose
descendant selector (0,1,1) beats the utility class (0,1,0); the measured
40px button width (px-3 24 + icon 16) is the proof, the class list alone
would predict 36px — the port ships `Plus size-4`. (2) The add button's
`disabled={!tagDraft.trim()}` — the honest-form superset over the reference's
always-enabled bare icon button. (3) The evidence capture's frame-2 leg: with
the draft mounted the right pane never swaps to the note view (the Edit
button never renders) — the draft discard comes FIRST (the clone probe's own
lesson, re-derived).

The gates: lint ✓ · tsc ✓ · unit **1779/1779** (54 files — unchanged, a
view-layer port with no new seam) · build ✓ · the tripwire **138/138** after
the doc-chain lockstep (the census re-tags: AGENTS/CLAUDE/SKILL/README + both
cert scripts) · **the full 5-chunk cold cert map 678/678** (the chunk records
in the plan §10) · the drawer check GREEN (**the 121st at the open, the
122nd at the close** — no Tailwind v4 mobile-nav bug) · the desktop parity
probe MATCH · zero residue on BOTH accounts (the demo db never left the seed
state — the EE pins' ee3tag round-trips locally; the reference re-verified at
0 notes).

The evidence frames: `docs/screenshots/181-clone-tagrow-draft.png` (the
ported tag row + the 16px gap matrix + the pill + the input-group + the add
button) · `181-clone-tagrow-edit.png` (the seeded calculus pill + the w-24
input) · `181-clone-tagrow-addbutton.png` (the click path — a typed tag lands
by BUTTON, the input clears) · `181-clone-tagrow-list-tile.png` (the tile's
mt-2 tags row) — self-verifying (the mb-4 wrapper + the 16/16/16 matrix + the
pill 600/10px/≤24 + the button 40×28 + the input w96 + the tile mt-2 all
asserted in-DOM before every shot; the frames 217-226KB at 1440×900).

The doc-chain lockstep: the README row + badge (2451 → 2457) + the testing
line (672 → 678) → CLAUDE.md's e2e pair → AGENTS.md's census line + the S181
lessons (five — the flex-column margin-ADD mirror, the [&_svg] specificity
override, the flex-wrap-ancestor walk, the persisted-dark-mode account, the
pin-bug RED) → PAD **v1.3.89** (the revision block) → the SKILL's census
sites (all three) → the cert runner re-tags (both scripts, chunk 2 229 → 235,
machine-pinned) → this log · the worklog Session-192 entry · the plan §10/§11
closed · the `.env.example` contract re-verified (no env changes this cycle).

Then the local commit + the SSH-wrapper push to `main` (the operator's
directive).
