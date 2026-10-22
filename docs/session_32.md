# Session 32 — the departed-settlement family + the standing-suite orchestrator seam + the Zod4 partial-defaults data-loss fix + the audit-tools rot repair (Batch AH, Cycle 31)

> Continuation of the omni-study1 remediation. Received state: `8ea4642`
> (Session-80 / Batch AG — 861/861 unit, 431/431 e2e cold, standing debt
> Batch R only). Operator directives re-confirmed: visual/functional parity
> with https://omni-study1.base44.app, the mobile-nav check on both hosts,
> the Tailwind v4 watch, TDD, the docs chain, and the main-only SSH push.

## The workspace resets

The 23rd workspace reset wiped the repo mid-cycle — twice. The first
interruption lost an uncommitted ~90%-complete cycle (its operator log
became the blueprint); the re-cloned redo ran the cycle end-to-end from
the AG baseline. Both interruptions died in tool-call storms around the
standing-suite launch; everything durable (source, pins, docs) was
recreated by the blueprint. The final cycle verified below is the
complete redo.

## The evidence layers (before any source change)

1. **Baseline re-certified cold** — lint ✓ tsc ✓ unit 861/861, build
   green, cold e2e 431/431 (127+127+50+69+58, first pass every chunk).
   chromium-1243 re-provisioned (the reset wiped it).
2. **Mode-C audit of the Batch AG diff** — 0 Critical / 0 High /
   **1 Medium** / 6 Low / 6 Informational. The Medium (M1, the cycle's
   headline): the selection-mirror invariant in notes-view.tsx is
   enforced only by a comment. `selectedIdRef` writes live at
   `selectNote`/`createNote`; `removeNote` never settles the mirror —
   deleting the selected note leaves the ref holding the deleted id
   while the render-derived `effectiveNoteId` falls back to null. The
   QuillEditor unmount-flush (the final PATCH within the ≤600ms dirty
   window, `onChangeRef` captured at render) fires against the deleted
   row; its late rejection then PASSES the stale-mirror guard —
   toasting the "still open" lie onto whatever surface is mounted next
   and re-latching the AF3 streak flag. Verified in source.
3. **The s81 reference re-sweep** (the s80 script re-tagged): ok:true —
   9/9 invariants both hosts, brand tables byte-matched, mobile drawers
   green on both.
4. **agent-browser mobile-nav verification on BOTH hosts** (the
   operator's explicit directive): the reference drawer opens with 20
   links, navigates, closes on navigate, scrollWidth 416 (its own
   overflow on /Notes); the clone drawer 20 links, navigates, closes,
   scrollWidth 390 — **no Tailwind v4 mobile-nav bug**, consistent with
   the standing record.

## The TDD cycle

**RED** (against the pre-change build, at the designed assertions):
AH1a (the delete flow — the "still open" lie toast), AH2a (the
wrong-surface "Note saved." toast + the unlatched streak re-toasting
beta's second failure), AH2b (alpha's late Save-failure toast on
beta's surface), AH6 (the detail pane reading "Biology Chapter 5"
after Enter on the options trigger), AH3b (`lab(90.2247 -31.039
9.47084)` — the unpinned emerald-200, the trap-10 value exactly),
AH8a/AH8b/AH8c (the data-loss assertions: "Empty note", the vanished
tag pill, `notes: ""`), and the AH7 unit pin (the trailing-prose parse
failure). Green-on-arrival as designed: AH3a/AH3c/AH4a/AH4b, the
truncated-envelope LOUD guard.

**Pin-design lessons learned the hard way** (each cost a RED-round
calibration): the seeded decks share one createdAt (the seed's
Promise.all batch — the deck-list tie order is nondeterministic, so
AH6 selects its deck explicitly); a second seeded note carries the
same "calculus" tag (an unscoped text match masks the AH8 wipe — the
pins scope to the target row's `data-note-tag`); there is no GET item
route on the tasks collection (the AH8c proof reads the PATCH's own
response body + the list round-trip); the offline toast's message
("…was not saved") matches a naive /saved/i filter — the AH2a pin
filters on the exact success text.

**GREEN**: the mirror-settlement effect in notes-view.tsx (a ref write
in an effect — the delete flow mutates the collection, not the
selection, so no event-handler write site exists; the lint contract
allows ref writes in effects); the `saveNow` guards on BOTH settle
branches (a departed Save neither toasts onto the next note's surface
nor unlatches its failure streak); the flashcards row's
`e.target !== e.currentTarget` check; the `--color-emerald-200:
#a7f3d0` @theme pin; the preflight's GREEN line moved to stderr (stdout
stays JSON-only); the `parseAuditStdout` shrink-from-the-end
trailing-prose tolerance (a truncated envelope still fails LOUD).

**Mutation proofs**: un-pinning emerald-200 reproduced the exact
`lab(90.2247 -31.039 9.47084)` RED; removing the row's target check
made the AH6 pin fail at the designed assertion. Both restored.

## The mid-cycle discoveries

1. **AH8 (CRITICAL — the Zod4 partial-defaults data-loss)**: surfaced
   by the AH2a GREEN verification — the combined-file run put
   dark-mode's Save-pin before AD6/AD7 and the seeded note's tag pill
   vanished. Root cause: zod@4's `.partial()` does NOT suppress
   create-time `.default()` — `noteSchema.partial().parse({title})`
   returns `{title, content: "", tags: "[]"}` (verified empirically).
   Every partial PATCH on every owned entity reset every defaulted
   field — a title keystroke wiped the note's content AND tags, every
   autosave wiped the tags, a task toggle wiped notes/subtasks/priority
   — invisible to every prior certification through chunk isolation +
   file order. The fix at `makeOwnedDelegate.update`: keep only the
   keys the caller actually sent (the preferences route's own
   `!== undefined` filter, applied at the factory — one site covers
   all sixteen delegates; an empty patch short-circuits to the
   existing row).
2. **AH9–AH12 (the audit-tools rot)**: the orchestrator's FIRST
   end-to-end attempt (after the AH7 seam fix) finished 10/35 and
   unmasked four latent rot families the never-runnable orchestrator
   could never surface: `data-accent` dropped from both theme
   application sites (~16 accent sweeps with dead preconditions); the
   8 stage audits' racy pre-auth login waits (the login page itself
   has a `<main>` — the wait resolved pre-auth and the first goto
   raced the login POST); the register-duplicate 409 expectation (the
   shipped contract is the route's own uniform-200 anti-enumeration
   design); the dead `pinned` seeding field (the volume-sweep family
   has been crashing on the nonexistent column since the schema
   landed). Plus the AI/connectivity/upload probes' rotted DOM
   contracts: the composer is an `<Input>` not a `<textarea>`; the
   transcript bubbles are divs inside the aria-live pane (not ul/li);
   the Toaster's items are plain buttons (the REGION carries the live
   semantics); the D1/A5 mocks must fulfill BOTH the chat POST and the
   messages GET (the view renders the reply from the persisted
   transcript refresh); the connectivity banner is the amber
   role=status pill (`[data-offline]` never existed); the math solver
   schema max is 4000 (the probe sent 2001 and PASSED validation into
   the real SDK); the quick actions are click-to-fill (aria-pressed is
   gone by design); the settings B1 click must hit the display-name
   card's "Save name" (not the study-fields' "Save profile"); the
   settings restore must land on the documented light/violet resting
   state (not "system").
3. **AH13 (the files-list payload)**: the repaired upload-edge audit's
   C8 probe found the files LIST leaking the base64 `data` column —
   every stored ≤2 MiB file adds ~2.7 MiB to every list fetch (an
   unbounded payload as the library grows). RED-pinned; fixed with a
   metadata `select`; the view's `isLinkFile` reads `url !== null`.
4. **The light-family checker's transparent-body fallback**: the
   accent-light sweep's first live run (another never-live stage)
   reported phantom unreadable entries — the glass rail's 0.8 alpha
   fails the checker's > 0.85 walk, and the body fallback
   `bodyBg || {white}` never fired because parse() returns a truthy
   {0,0,0,a:0} for a transparent body: every glass-backed text
   measured against phantom BLACK. The dark family's own near-black
   fallback masked the same bug. Fixed across all 13 checker
   embeddings (the fallback now fires on alpha ≤ 0.85).

## The verification record

- **Fast gates**: lint ✓ `tsc --noEmit` ✓ unit **863/863** (861 + the
  2 AH7 pins).
- **Cold 5-chunk e2e certification**: **444/444** (127+135+51+73+58,
  first pass every chunk — parity-session7 +8, dark-mode +4,
  resilience +1; the S12-B focus-poll ceiling bumped to 15s for the
  cold-hydration tail).
- **The standing suite**: the orchestrator's stage-0 preflight parse
  PASSES (the AH7 integration proof — the suite had never been
  runnable; S78–S80 ran the individual sweeps because the seam bug
  aborted stage 0). Its live run took stages 0–12 green in sequence
  (security, settings-roundtrip, connectivity, upload-edge,
  data-volume, forced-colors, print, focus-order, mobile, midband,
  landscape, dark-mobile — all findings []). The remaining stages were
  verified individually (the S78–S80 convention, plus the repaired
  probes): accent-light (exit 0 after the checker fix), dark, the
  8-sweep volume family, the landscape-seed sweep, the desktop +
  midband + landscape accent sweeps, cwv-audit-s16, cwv-volume-stress,
  ai-error, ai-a11y, pre15-preflight, dep-audit — all green. The
  23rd-reset environment reaps long-lived daemons at tool-call
  boundaries, so the 17-minute accent-dark sweep and a single-process
  full orchestration cannot complete; its dark-family siblings (dark,
  dark-mobile, the four dark volume sweeps, the dark landscape-seed
  sweep — same checker, same mode contracts) all ran green. Recorded
  honestly in the remediation plan.
- **The s81 resweep** re-ran after the final build: ok:true.
- **Evidence**: `docs/screenshots/81-{ref|clone}-*.png` (the resweep
  set: 9 views × 2 hosts + the mobile drawer/dashboard pairs) +
  `81-clone-ah*.png` (the overdue-banner/success-toast/calculator-
  footer dark family, the flashcards rows, the notes tag row).
- **Docs**: README (badge 1307, counts 863/444, the S81 session row),
  AGENTS.md + CLAUDE.md counts + the S81 lessons section,
  vitest.config.ts header, the remediation-plan Cycle-31 plan + the
  mid-cycle amendments + the execution record + the header, the
  worklog Session-81 entry, this transcript. `.env.example` verified
  current (no env surface changed this cycle).

## Standing debt (unchanged)

Batch R (the RSC structural perf deferral — the S75 CWV evidence);
the s80 audit's L1 (the study zombie — the lint-gated effect
precondition), L4's ~27 AG-pinned-hue consumer sites (uniform
re-theme, no observable diverges), I2's dedicated text token.
