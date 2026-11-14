# Session 183 — the Files type-filter/view-mode/move-port cycle (the S183 axis)

## §0 The context and the baseline

The workspace re-derived COLD (a fresh clone at `a2b7163` on `main` — the
S182 close; the operator's session_237 transcript commit). The environment
per the standing recipe: `bun install` (510 pkgs), `.env` from
`.env.example` at `DATABASE_URL="file:../db/custom.db"` with `db/` at the
repo root, `db:push` + `db:seed` (the demo account), `bunx playwright
install chromium` (the pinned 1.63.0's v1243 build — the fresh sandbox
carried only v1200). The cold baseline gates reproduced the S182 close
EXACTLY: lint ✓ · tsc ✓ · unit **1779/1779** (54 files) · build ✓ (the
seven edge-instrumentation warnings pre-existing, untouched). The doc chain
re-read (AGENTS/CLAUDE/README/PAD v1.3.90/SKILL + session_236/237 + the
S182 plan §10 close + the worklog tail); the skills audit refreshed (the
web-application rubric + the catalog + the tdd loop rules + the
clone-app-pat-pro doctrine — computed styles as ground truth; `skills/`
excluded throughout).

The standing chrome at the open: the drawer check GREEN (**the 125th
consecutive** — 20 links, no footer, Escape-close + nav-auto-close
supersets — no Tailwind v4 mobile-nav bug), the desktop parity probe MATCH
(all five structural checks, both hosts). The reference account verified
at TRUE ZERO residue at the close of the measurement pass (§1).

**The 402 finding (recorded)**: the base44 platform's upload endpoint now
answers **402 Payment Required** (`…/integration-endpoints/Core/UploadFile`)
after this cycle's measurement uploads — the reference's own platform
quota, not an app defect. The reference was left at zero rows under it
(the last three upload attempts all 402'd with nothing persisted; the
"Uploading…" latch on the reference's own control is its own defect, not
ported). Future cycles' reference re-probes must budget uploads against
this platform quota.

## §1 The measured reference inventory (re-measured live, 2026-11-14)

Evidence: `docs/probe-evidence/s183/` (nine reference JSONs + the clone
pre-port twin). Zero-residue discipline held throughout (probe 6's
finalBody + probe 7/8 read-only closes: "No files yet", no Folders
section). One prior-session leftover (`SubFolder`) was found and removed
with the cycle's own fixtures (probe 6) — the TRUE zero the standing
posture requires.

The structure (the `space-y-6` wrapper under the view header):

1. **The header**: h1 "Files" + subtitle "Store and organize your
   documents" + actions `[New Folder][Upload]` — the shadcn outline
   (`border border-input bg-background shadow-sm … h-9 px-4 py-2`) and
   the violet→indigo gradient (`bg-gradient-to-r from-violet-500
   to-indigo-600 text-primary-foreground shadow hover:bg-primary/90 h-9
   px-4 py-2 cursor-pointer` — the reference's Upload is a LABEL wrapping
   the hidden input, visually the gradient button the clone already has).
2. **The breadcrumb row** (`flex items-center gap-2 text-sm`): the home
   button `flex items-center gap-1 hover:text-violet-600
   transition-colors` + **`text-slate-800 font-medium` when CURRENT /
   `text-slate-500` when not**, the `lucide-house w-4 h-4` icon; in-folder:
   the `lucide-chevron-right w-4 h-4 text-slate-400` separator + the
   folder crumb (the same button shape, active slate-800; **no pills**).
3. **The toolbar row** (`flex flex-col md:flex-row gap-4`): the search
   wrap `relative flex-1` (the input = the shadcn base + `pl-10
   text-base md:text-sm`, placeholder "Search files...", the
   `lucide-search absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4
   text-slate-400` icon) + the "All Types" select trigger (the shadcn
   SelectTrigger, **w-160 computed = w-40**, options **All Types / Images
   / PDFs / Documents / Other**) + the view-mode toggle group `flex
   border border-slate-200 rounded-lg overflow-hidden` (buttons **h-9
   w-9**, the ACTIVE one carries `bg-slate-100`; icons grid3x3 + list,
   w-4 h-4; **no aria-labels** — the clone's labels are the superset).
4. **The content**: the section block `<div>` + the label `<p
   class="text-xs font-semibold text-slate-500 uppercase mb-3">` —
   **"Folders"** (only when folders exist) and **"Files"** (always) —
   then the grid `grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3`,
   or the empty state at zero files. The "Files" label renders at zero
   files with the empty state inside its block (measured at both states).
5. **The file grid card** (`bg-white rounded-xl border border-slate-200
   p-4 hover:shadow-md transition-shadow group`): the ellipsis row `flex
   justify-end mb-2` (the ghost `h-7 w-7 opacity-0
   group-hover:opacity-100` trigger, `lucide-ellipsis w-4 h-4`) + the
   preview tile — images: `aspect-square rounded-lg overflow-hidden mb-3
   bg-slate-100 cursor-pointer relative group/file` + `img w-full h-full
   object-cover` + the hover overlay (`absolute inset-0 bg-black/40
   opacity-0 group-hover/file:opacity-100 transition-opacity flex items-
   center justify-center` + `lucide-eye w-6 h-6 text-white`); non-images:
   `aspect-square rounded-lg bg-slate-50 flex items-center justify-center
   mb-3 relative cursor-pointer group/file` + the mime icon `w-12 h-12
   text-slate-400` — then the name `font-medium text-slate-800 truncate
   text-sm` + the size `text-xs text-slate-400`. The tile click and the
   menu's View open the preview dialog.
6. **The file menu items**: **View / Download / Move to Folder / Delete**
   (the shadcn item base `relative flex cursor-default select-none
   items-center gap-2 rounded-sm px-2 py-1.5 text-sm …`).
7. **The folder grid card**: `flex items-center gap-3 p-4 bg-white
   rounded-xl border border-slate-200 hover:shadow-md transition-all
   text-left group` — the violet tile `w-10 h-10 rounded-lg flex
   items-center justify-center` at `background-color: rgba(139, 92, 246,
   0.125)` (violet-500 @ 12.5%) + `lucide-folder w-5 h-5` at
   `color: rgb(139, 92, 246)` (violet-500), the name `font-medium
   text-slate-800 truncate`, the count `text-xs text-slate-400` — **"N
   files", never singularized** ("0 files", "1 files" both measured) —
   and the ellipsis (`h-8 w-8 opacity-0 group-hover:opacity-100`)
   whose menu carries **Delete only**. The whole card is a `<button>`
   containing the ellipsis `<button>` — **the reference's own
   nested-button bug (NOT ported; invalid HTML)**.
8. **The list row** (the toggle's second position): `flex items-center
   gap-4 p-4 bg-white rounded-xl border border-slate-200
   hover:shadow-md transition-shadow group` — the icon tile `w-10 h-10
   rounded-lg bg-slate-100 flex items-center justify-center` + the mime
   icon (`lucide-image w-5 h-5 text-slate-500` for images), the name
   `font-medium text-slate-800 truncate`, the meta line `text-xs
   text-slate-400` — **`General • 81 B • Nov 14, 2026`** (the containing
   folder's name — the reference's root pseudo-folder is named
   "General" — then the size, then the `MMM d, yyyy` date) — and the
   hover action group `flex gap-2 opacity-0 group-hover:opacity-100
   transition-opacity`: the eye (h-9 w-9), the **download ANCHOR** (h-9
   w-9, target _blank rel noopener), the **move** button
   (`lucide-move-right`, h-9 w-9), the delete button (`lucide-trash2`,
   h-9 w-9 `text-red-500`).
9. **The preview dialog ("View")**: the file name as the title, the
   image `max-w-full max-h-full object-contain rounded-lg shadow-lg`
   inside `w-full h-full flex items-center justify-center p-4`
   (naturalWidth 8 measured — the img bytes serve INLINE), and the
   controls **Open in New Tab** (anchor, target _blank) / **Download**
   (anchor) / **Close** (button). Non-image files open the same dialog
   with no img. The dialog's exact max-width went unmeasured (the 402
   blocked the last geometry probe — recorded honestly; the content
   anatomy is measured).
10. **The move dialog** (`max-w-sm` Dialog + the `Move to Folder` h2 +
    `space-y-2 mt-4`): the destination buttons `w-full p-3 rounded-lg
    border border-slate-200 hover:bg-slate-50 text-left flex items-center
    gap-3` — **General (Root)** first (`lucide-house w-5 h-5
    text-slate-400`), then each folder (`lucide-folder w-5 h-5` at
    violet-500). **The click IS the move** (executes and closes — no
    confirm step; measured) + the absolute Close X.
11. **The filter/search semantics** (measured with live fixtures): the
    type filter applies to FILES only — **folders stay visible under
    every type filter**; Images ↔ `image/*`; PDFs ↔ `application/pdf`;
    a `.txt` lands under **Other** (NOT Documents — Documents showed
    nothing); the search is a **name substring** (case-insensitive
    prefix/substring match measured); **folders are immune to the
    search** (a non-matching folder stays visible); filter/search state
    is LOCAL (resets on reload). A no-match search renders the empty
    state inside the Files section (the Folders section stays).
12. **The empty state** (the shared family — the S4 component): the
    refreshed live measurement shows the reference DOES wrap the icon
    (`w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-
    100 … mb-6` + `lucide-folder-open w-10 h-10 text-violet-500`) — the
    S182 plan §2.3's "BARE icon" record was a partial-capture
    mis-read, now superseded. The re-port of the shared EmptyState
    family stays its OWN recorded axis (14 views; the px-4-vs-px-6, the
    h3-vs-h2, the mb-2-vs-mt-4 differences are family-wide, not
    files-local).

## §2 The clone's drift (the gap table)

| Surface | The reference | The clone (pre-port) | Class |
| --- | --- | --- | --- |
| The search | `relative flex-1` + pl-10 input + the icon | absent entirely | FUNCTIONAL gap |
| The type filter | The w-40 select, 5 options | absent entirely | FUNCTIONAL gap |
| The toolbar row | `flex flex-col md:flex-row gap-4` under the breadcrumb | absent | structural |
| The breadcrumb | slate-800/500 + hover:text-violet-600, chevron separators, no pills | the sf-primary-strong active accent, "/" separators, pill crumbs | visual |
| The section labels | `Folders` / `Files` p.text-xs uppercase mb-3 | absent | structural |
| The grids | `grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3` | `gap-4 sm:grid-cols-2 lg:grid-cols-3` | visual |
| The file card | the ellipsis + the aspect-square tile + name + size | a horizontal row-card with hover pencil/trash affordances | visual + functional |
| The folder card | the violet tile + "N files" + the ellipsis menu (Delete) | the amber tile + "N items" + hover pencil/trash | visual + functional |
| The list mode | the real branch (rows with the meta line + 4 controls) | `viewMode` state exists but the render NEVER branches (a visual no-op) | FUNCTIONAL gap |
| The View dialog | the name + the inline img + Open/Download/Close | absent | FUNCTIONAL gap |
| The Move dialog | the folder-button list, click-moves | absent (no move at all) | FUNCTIONAL gap |
| The meta line | `folder • size • MMM d, yyyy` | absent (no list rows) | functional |

## §3 The port design (the superset mapping)

All view-layer sites in `src/components/views/files-view.tsx` + one wire
addition. The reference's light-mode classes are the contract; the
clone's established dark pairs ride along (`bg-white → dark:bg-card`,
`border-slate-200 → dark:border-slate-700` — the assignments-view:348
idiom), and every clone a11y superset stays (the toggle's aria-labels +
aria-pressed, the ellipsis aria-labels, the Add Link superset control).

1. **The header actions**: `[Add Link][New Folder][Upload]` — the
   view-mode toggle group MOVES OUT (the S5-K `role="group"` +
   `aria-label="View mode"` keeps its contract in the new home); the Add
   Link icon-only superset stays (its S5-K pin unchanged).
2. **The breadcrumb**: the home button `flex items-center gap-1
   hover:text-violet-600 transition-colors` + (`text-slate-800
   font-medium` when current / `text-slate-500` otherwise) + the Home
   icon `size-4`; the separator `<ChevronRight className="size-4
   text-slate-400" aria-hidden />`; the folder crumbs the SAME button
   shape (the pills drop). The S9-G house pin + the S5-K ≤24px height
   ride unchanged.
3. **The toolbar row** (between the breadcrumb and the content):
   `<div className="flex flex-col gap-4 md:flex-row">` — the search
   (`relative flex-1` + the Search icon `absolute left-3 top-1/2
   -translate-y-1/2 size-4 text-slate-400` + `<Input
   placeholder="Search files…" className="pl-10 text-base md:text-sm" />`
   — the mobile 16px is the reference's own anti-zoom form), the select
   (`<Select value={typeFilter} …><SelectTrigger
   className="w-40"><SelectValue /></SelectTrigger><SelectContent>` with
   the five options), and the toggle group (`flex border
   border-slate-200 rounded-lg overflow-hidden dark:border-slate-700`
   + the two `h-9 w-9` ghost buttons, the active one `bg-slate-100
   dark:bg-slate-800`, icons `size-4`, aria-labels + aria-pressed stay).
4. **The content sections**: the Folders block (label + grid, only when
   folders exist) + the Files block (label always; the grid at >0 files,
   the shared EmptyState at 0 — **the sf-card wrapper around the empty
   state drops**; the shared component itself is untouched, its
   family re-port stays the recorded axis).
5. **The file grid card**: the ellipsis row + the DropdownMenu (View /
   Download (`asChild` anchor — the reference's own idiom) / Move to
   Folder / Delete) + the preview tile (images: the `img` at
   `/api/files/{id}?inline=1` + the hover overlay; non-images + links:
   the mime icon `size-12 text-slate-400` on `bg-slate-50 dark:bg-
   slate-800/60`), the name (`truncate text-sm font-medium`, links keep
   their anchor superset), the size. The ellipsis trigger: the ghost
   `h-7 w-7 opacity-0 group-hover:opacity-100` + `aria-label="File
   options for {name}"`.
6. **The folder card**: a `div` shell (NOT the reference's nested
   button) + the open button (`aria-label="Open folder {name}"` — the
   clone's existing label) + the violet tile `bg-sf-primary-soft` with
   `Folder size-5 text-sf-primary` (the accent-aware superset over the
   reference's fixed violet — the clone's default accent IS violet, and
   the sf tokens are the pinned-utility doctrine) + the name + `{count}
   files` (never singularized) + the ellipsis menu **Rename + Delete**
   (the Rename item is the clone's superset over the reference's
   Delete-only menu — the BU1 contract keeps a home, §9).
7. **The list rows** (the `viewMode === "list"` branch): the reference's
   row anatomy with the meta line `{folderName ?? "General"} • {size} •
   {formatFileDate(createdAt)}` and the four hover controls (the eye
   button, the download anchor, the MoveRight button, the trash button
   `text-red-500 dark:text-red-400`).
8. **The preview dialog**: the name title, the image `max-w-full
   max-h-full object-contain rounded-lg shadow-lg` in the centered
   wrap, the non-image icon fallback, and the three controls (the two
   `asChild` anchors + the Close button + the dialog's own X).
9. **The move dialog**: the destination buttons (General (Root) with
   the House icon, then every folder with the Folder icon) — the click
   moves and closes (`PATCH /api/files/{id}` with `folderId: string |
   null`), plus the Close X.
10. **The wire**: `PATCH` on `src/app/api/files/[id]/route.ts` — the
    `write:600` budget (the CB7 class), `moveFileSchema`
    (`folderId: nullableId`), the ownership re-check, the
    folder-exists re-check when non-null, `folderId` written only
    (files have no children — no cycle class). The GET grows the
    guarded `?inline=1` mode: `previewHeaders` (inline disposition +
    nosniff + private no-store) **only for `image/*` mimes** — the
    attachment disposition stays the default for everything else (the
    XSS-guard: a served HTML/SVG byte stream must never render
    inline).

## §4 The TDD plan (the honest RED first)

**The unit seams (1779 → 1795, 54 → 55 files)**:

- `src/lib/file-types.ts` (NEW — the pure seam): `FILE_TYPE_OPTIONS`
  (all/images/pdfs/documents/other — the five labels), `classifyFileType
  (mime, name)` — `image/*` → images, `application/pdf` → pdfs, the
  document mimes/extensions (`doc/docx/odt/rtf` + `application/msword`
  family + `text/wordprocessingml`) → documents, everything else →
  other (the MEASURED `.txt` → other is the pinned case). Pinned in the
  NEW `tests/file-types.test.ts`.
- `formatFileDate` in `src/lib/date.ts` — the `MMM d, yyyy` list-meta
  formatter ("Nov 14, 2026"). Pinned in `tests/date.test.ts`.
- `moveFileSchema` in `src/lib/validation.ts` (`folderId: nullableId` —
  the clear-to-root convention). Pinned in `tests/validation.test.ts`.
- `previewHeaders` in `src/lib/server/http.ts` — the inline mode for
  image mimes only. Pinned in `tests/files.test.ts` (the image-mime
  inline + the non-image rejection + the default attachment form).

**The e2e pins (684 → 691, chunk 2: 241 → 248)** — the EG block after
EF6 in `parity-session7.spec.ts`, **7 consolidated pins at 11 upload-
budget units** (the demo user's 20/15-min shared files+folders+link+
attachment POST budget — the s183 lesson: the block once consumed 17
units and 429'd the chunk's own s14 pins; 11 units + the chunk's ~8
existing consumers fit under 20):

- **EG1 (0 units)** the zero-row anatomy: the search input (the
  placeholder + pl-10 + the left icon), the All Types trigger (w-40 +
  the five options opened), the toggle group (the h-9 w-9 pair, the
  bg-slate-100 active), the breadcrumb home (slate-800 + the
  hover:text-violet-600 class), the Files section label, the empty
  state present.
- **EG2 (2 units: 1 folder + 1 PNG)** the sectioned grid: the Folders
  label + the Files label, the `grid-cols-2 md:grid-cols-4
  lg:grid-cols-6 gap-3` grid, the folder card (the sf-primary-soft tile
  + the name + the "0 files" count — never singularized), the file card
  (the ellipsis + the aspect-square tile + the name + the size), and
  the two ellipsis menus (the file: View/Download/Move to Folder/
  Delete; the folder: Rename + Delete).
- **EG3 (2 units: 1 PNG + 1 TXT)** the filter/search semantics: Images
  → the PNG only; Other → the TXT only; Documents → neither; the
  search "png" → the PNG only; a no-match search → the empty state
  inside the Files section.
- **EG4 (3 units: 1 folder + 1 subfolder + 1 PNG)** the navigation +
  the move: the in-folder crumb pair (the home slate-500 + the
  chevron separator + the folder crumb slate-800), the in-folder
  Folders label (the subfolder), the folders' filter/search immunity,
  then the move dialog (the title + General (Root) + the two folder
  buttons) — the click moves (the root view loses the PNG, the folder
  count reads "1 files"), and the crumb home returns.
- **EG5 (1 unit: 1 TXT)** the list mode: the toggle branch renders the
  row anatomy (the mime icon tile, the name, the `General • 15 B •
  {date}` meta line, the four hover controls — the eye, the download
  ANCHOR (role=link), the MoveRight, the trash).
- **EG6 (1 unit: 1 PNG)** the preview dialog: the tile click opens it;
  the image loads (naturalWidth > 0 — the `?inline=1` bytes); the name
  title; the Open in New Tab + Download anchors (role=link, the
  hrefs); the Close button closes.
- **EG7 (2 units: 1 PDF + 1 link)** the non-image + link surfaces: the
  PDF's tile (bg-slate-50 + the FileText icon, no img), the PDF's
  preview dialog (no img, the controls present), the link file's name
  anchor + the link card in both modes.

The honest-RED discipline (the S180/S181/S182 doctrine): the pins run
against the TRUE pre-change standalone (built from the §0 tree before
any src edit) — every pin must fail at its designed marker.

**The existing-pin re-anchors (2, contract-preserving)**:

- `resilience.spec.ts` BU1 (the Rename prefill): the `Rename ${name}`
  button locator re-anchors to the menu path (the ellipsis → the
  Rename item → the dialog). The CONTRACT (the dialog prefills the
  TARGET's name, not the previous session's) is untouched — the
  access path follows the ported anatomy.
- `tests/hue-tokens.test.ts` S93/AT1.2 (the files-view folder tile's
  amber dark half): the amber tile RETIRES with the port — the register
  re-anchors to the new tile (`bg-sf-primary-soft` + the
  `text-sf-primary` icon — the accent-utility doctrine, an improvement
  over the raw amber: the tile now rides the pinned sf tokens).

## §5 The execution order

1. The unit REDs (the four seams above) → the GREEN implementations.
2. The e2e EG pins, written against the pre-change standalone → the
   honest RED sweep (all 7 fail at their designed markers).
3. The port (§3 — the view, the wire, the inline mode).
4. The re-anchors (BU1 + the hue register) in lockstep with the port.
5. Rebuild → the GREEN sweep (all 7 EG pins + the full unit run).
6. The census re-tags (verified by `--list`, never estimated) + the
   doc-chain lockstep.
7. The 5-chunk cold cert map + the closing chrome (the drawer check,
   the parity probe, the reference residue re-verify).
8. The evidence frames + the commit/push.

## §6 The adjudications (the open questions, resolved)

1. **The upload-budget ceiling**: the EG block consolidates to 11
   units (the s183 429 lesson — the first design's 17 units 429'd the
   s14 pins mid-chunk). 11 + the chunk's existing ~8 consumers < 20.
2. **The folder tile rides the sf tokens, not raw violet**: the
   reference's tile is a fixed violet-500@12.5%; the clone's is
   `bg-sf-primary-soft` + `text-sf-primary` — the accent-aware
   superset (the clone's default accent IS violet; the measured delta
   at the default accent is ≤4 units/channel, imperceptible), and the
   pinned-utility doctrine prefers the sf tokens over raw hexes.
3. **The nested-button bug is NOT ported**: the reference's folder
   card is a `<button>` containing the ellipsis `<button>` — invalid
   HTML. The clone's shell is a div + the open button + the ellipsis
   (byte-equivalent visuals, valid HTML — the same posture as the
   reference's own file card, which does it correctly).
4. **The root pseudo-folder's name**: the reference's list meta shows
   "General" for root files (its root folder is NAMED "General" —
   the move dialog's "General (Root)" button is the same). The clone
   ports the DISPLAY: root files' meta reads "General" (the measured
   parity); the clone's own root stays null-backed (no data-model
   change — the display maps null → "General").
5. **The `.txt` → Other mapping is measured, not guessed**: Documents
   showed NOTHING for a .txt on the live reference (the naive
   "text/* → Documents" guess is wrong); Other carried it. The
   document family is the office-document mimes/extensions only.
6. **The toggle keeps its superset labels**: the reference's toggle
   buttons carry no aria-labels/pressed states; the clone's
   `aria-label="Grid view"/"List view"` + `aria-pressed` stay (the
   S5-K/S9-G pins pin them).
7. **The lightbox's max-width is unmeasured** (the 402 blocked the
   geometry probe): the content anatomy is measured (the img + wrap +
   the three controls); the clone uses the DialogContent base with
   `max-w-3xl` for the preview area — the recorded honest gap.
8. **The EmptyState family stays deferred**: the refreshed
   measurement (the gradient wrapper EXISTS — the S182 "bare icon"
   record superseded) is recorded in §1.12 for the family's own
   future cycle; only the files-local sf-card wrapper drops this
   cycle.

## §7 The tripwires, the census, the cert map

- The unit census: **1779 → 1795** (54 → 55 files — the new
  `tests/file-types.test.ts`). The e2e census: **684 → 691** (chunk 2:
  241 → 248, +7 — verified by `--list`). The README badge: **2463 →
  2486** (the unit + e2e sum). The tripwire re-tags: the cert runner
  pair + the README (badge + testing line + session row) + the CLAUDE
  pairs + the AGENTS census + the SKILL census sites + the vitest
  header — the lockstep.
- The 5-chunk cold cert map: 158 + 248 + 101 + 95 + 89 = **691** —
  every chunk first-roll is the bar (the reaper-proof detached
  launcher; one chunk at a time — the parallel-run contention lesson).
- The standing chrome at the close: the drawer check (the 126th), the
  desktop parity probe, the reference zero-residue re-verify.

## §8 The doc chain + the evidence

- `docs/remediation-plan-session183.md` (this file) + its §10 close.
- The S183 evidence frames (4, self-verifying — the DOM-asserted
  convention) under `docs/screenshots/`.
- The probe evidence at `docs/probe-evidence/s183/` (done — the ten
  JSONs + the twin).
- README (the Session-183 row + the badge + the testing line) · AGENTS
  (the census + the S183 lessons) · CLAUDE pairs · PAD **v1.3.91** ·
  the SKILL census sites · the vitest header (the S183 block) · the
  cert runner re-tags (both scripts) · `docs/session_238.md` · the
  worklog Session-194 entry.
- `.env.example` re-verified (no env changes this cycle — the DB path
  posture is untouched).

## §9 The risks (watched honestly)

1. **The upload budget** (§4): 11 units; the chunk's existing
   consumers re-counted at the GREEN sweep (the 429 signature is a
   fast-fail — the s183 lesson's diagnostic).
2. **The BU1 re-anchor** must land WITH the port (the pin goes red
   against the ported anatomy otherwise — the same run, never a
   lagging second commit).
3. **The hue register re-anchor** (§4) trips as designed when the
   amber tile retires — re-anchor, never weaken.
4. **The EF6 subtitle pin** (the Files header copy) rides untouched —
   the port keeps the ViewHeader.
5. **The resilience heading pins** (11 × `heading "Files" exact`): the
   ported section label is a `<p>`, NOT a heading — verified no
   strict-mode conflict (the zero-row probes confirmed the label is
   non-heading on the reference too).
6. **The a11y sweep** (chunk 2): the new controls carry labels
   (the toggle keeps its group + labels; the ellipses get
   aria-labels; the search input's placeholder is its accessible
   name) — the sweep should stay green.

## §10 The as-executed close (filled at the cycle's end)

Executed as planned, with four root-caused unplanned legs (all
lesson-recorded in AGENTS.md's S183 block):

- **§3 landed exactly** — the toolbar row, the crumb re-port, the
  sectioned content with the grid/list branch, both card anatomies with
  their menus, the preview + move dialogs, the PATCH move wire, and the
  guarded `?inline=1` mode. The supersets ride as designed.
- **§4's honest RED was PROVEN at both layers** — the four unit seams
  failing at their designed markers (the missing module, the
  not-a-function, the missing schema), then all 7 EG pins failing at
  their designed markers against the pre-change standalone.
- **The unplanned legs**: (1) the EG pins' first RED run hit a
  fixtures-before-goto fetch bug (a blank page cannot resolve a relative
  URL — every pin now gotos before its fixtures). (2) The GREEN sweep's
  three pin bugs — the DropdownMenuItem text carries the icon's leading
  whitespace (trim before the exact match), the search state persists
  across in-app folder navigation (the view never remounts — the pin
  clears the query it set), and the .txt list-row icon is `lucide-file`
  (mimeIconClass's generic File), not file-text. (3) **The cert map's
  chunk-2 failures (245/248) root-caused to TWO real defects**: the
  a11y sweep's `/Files` axe run failed `button-name [critical]` on the
  All Types trigger — the Radix SelectTrigger needs an EXPLICIT label
  (the codebase's own convention: "Week filter" / "Filter by notebook";
  the dialog selects pass unlabelled only because they unmount with the
  closed dialog) — fixed with `aria-label="Filter files by type"`; and
  EG2's page-scoped menu-item query read BOTH open menus under chunk
  load (the Escape-close raced the slower chunk context) — fixed with
  the menu-GONE wait (the ED idiom). (4) The map's chunks 3-5 re-ran on
  the fixed tree for cert integrity (the aria-label postdated the map's
  build) — every chunk first roll again.
- **The gates**: lint ✓ · tsc ✓ · unit **1795/1795** (55 files) ·
  build ✓ (the seven edge-instrumentation warnings pre-existing) · the
  tripwire **138/138** after the doc-chain lockstep · the resilience
  spec 50/50 cold · the a11y sweep 21/21 cold · **the full 5-chunk cold
  cert map 691/691 on the FINAL tree — every chunk first roll** (chunk 1
  158/158 [3.4m] · chunk 2 — the EG home chunk — 248/248 [6.1m] · chunk
  3 101/101 [4.2m] · chunk 4 95/95 [3.0m] · chunk 5 89/89 [1.4m]) · the
  drawer check GREEN (the 125th at the open, **the 126th** at the
  close) · the desktop parity probe MATCH · the reference at TRUE zero
  residue (under its own platform's 402 upload quota — §1's finding).
- **The evidence frames**: the four §8 frames captured self-verifying
  (`scripts/capture-s183-evidence.mjs` — the toolbar + the sectioned
  grid + the list mode + the move dialog all DOM-asserted before every
  shot; zero residue; the frames 87-246KB at 1440×900).
- **The S183 probe evidence** preserved at `docs/probe-evidence/s183/`
  (ten JSON files — the nine reference probes + the clone pre-port
  twin).

## §11 The final checklist (the operator's asks, mapped)

- [x] `.env` at `DATABASE_URL="file:../db/custom.db"`, `db/` at the
      repo root — re-derived this session (§0) and re-verified at the
      close (no env changes this cycle).
- [x] The mobile-nav drawer check GREEN (the Tailwind v4 watch) — the
      standing tripwire (§7): the **125th at the open, the 126th at the
      close**, no Tailwind v4 mobile-nav bug.
- [x] The vitest + playwright suites validated + extended (the four
      unit seams + the seven EG pins) — §4: unit 1779 → 1795, e2e
      684 → 691 (verified by `--list`, never estimated).
- [x] The remediation plan saved under `docs/` (this file) + validated
      against the codebase before execution (§0/§1 re-reads; every site
      read before the plan was written — §2/§3 cite the anchors).
- [x] The dev-server screenshots under `docs/screenshots/` (§8): the
      four 183-cycle frames, self-verifying.
- [x] `.env.example` matches the codebase (re-verified — no env changes
      this cycle; §8).
- [x] The doc chain updated in lockstep (§8): the README row + badge
      (2463 → 2486) + the testing line · AGENTS census + the S183
      lessons (seven) · CLAUDE pairs · PAD v1.3.91 · the SKILL census
      sites (all four) · the vitest header (the S183 block) · the cert
      runner re-tags (both scripts, chunk 2 241 → 248) ·
      `docs/session_238.md` · the worklog Session-194 entry · the S183
      probe evidence at `docs/probe-evidence/s183/`.
- [x] `worklog.md` updated + included in the final commit (§8).
- [x] The commit + the SSH-wrapper push to
      `git@github.com:nordeim/omni-study1.git` on `main` — the
      operator's directive, executed at the cycle's close.
