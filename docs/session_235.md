Now let me study the probe conventions and write the S181 reference probe. First, let me examine the existing probe script structure:
Now I'll write the S181 reference probe following the repo's probe conventions:
The probe ran clean with zero residue, but some selectors were mis-scoped (found the row wrapper instead of the pill; the Settings tab click didn't register). The placeholder color suggests the reference may be in dark mode. Let me run a diagnostic follow-up probe:
The reference account is in **dark mode** (persisted theme), and the tag row/pill/input anatomy is now clear. The Settings tabs DID switch (Add Subject / Add Holiday buttons visible). Let me run a final measurement pass for the corrected gap matrix, the edit-surface tag row, and the Settings tab surfaces in detail:
Now let me compare against the clone's current implementation. Let me examine the clone's Settings view and the notes surfaces:
The S177 record confirms the reference has been in dark mode for many sessions, and mentions "the h-7 px-3 add button" in the tag row — an element my probes haven't captured. Let me run a final micro-probe for the tag row's complete children and the view-mode tag pills:
The right pane is a flex column (margins don't collapse in flex — they add). Let me measure the clone's row stack with the same probe to complete the drift evidence:
The clone-side evidence is complete. Let me check the S77/S177 records for the list-tile tag pills to complete the inventory:
One more micro-probe to capture the add button's variant and the list-tile pill classes:
The add button is the **ghost variant** (`h-7 px-3 text-xs`, Plus `w-3 h-3`, transparent bg). The list-tile probe failed to find the tile (probe 4's data covers it). Let me check the clone's edit-surface editor card and tag row regions to complete the port map:
Now writing the S181 remediation plan (plan-first doctrine):
Plan written and validated against the codebase (every site was read during measurement). Now the TDD execution — first the e2e pins RED-first. Let me study the ED block conventions:
Now let me write the EE e2e pin block (appended after the ED block at the file tail):
The pins parse. Now the honest RED sweep — the current standalone IS the pre-change build (no src/ changes yet):
**The honest RED is PROVEN** — all 6 EE pins fail at their designed markers against the pre-change standalone. Now the port. Let me check the add-tag handler functions and imports first:
The Button's `[&_svg]` base in the reference forces size-4 (16px) — explaining the 40px width (24px px-3 + 16px icon). Now applying the port:
Pin bug — `page.evaluate` already returns the object; the `JSON.parse` wrapper is wrong. Fixing both EE1 and EE4:
All 7 GREEN. Now the census verification by `--list` (never estimated):
The map verifies: **158 + 235 + 101 + 95 + 89 = 678**. Now the census re-tags:
The tripwire is green (138/138). Now fix the tsc error in the EE4 pin (the `unknown` type from evaluate):
All green. Now the 5-chunk cold cert map. Let me create the S181 launcher (mirroring the S180 pattern):
The cert is running (the transient resource warning is the known class). While it runs, let me build the evidence capture. Let me study the S180 capture convention:
Same draft-still-open issue — need to discard the draft before opening the note. Fixing:
All 4 frames captured. Let me visually verify them (the visual-check requirement):
The cert is running (server up on :3100). While it goes, the doc chain. First the README Session-181 row:
The cert is actively running (chunk 1 worker + chromium busy). Continuing the doc chain — PAD v1.3.89:
**Chunk 1: 158/158 GREEN — first roll.** Now the worklog Session-192 entry:
Now the session close doc (session_234.md, mirroring session_232's structure):
While chunk 2 runs, let me write the plan §10/§11 close:
While chunk 2 runs, let me check the vitest config header convention (the doc-chain lockstep includes it):
**Chunk 2: 235/235 GREEN — first roll** (the EE pins' home chunk). While chunks 3-5 run, let me prepare the push infrastructure:
Now let me set up the operator key for the push (following the skill doc's field-tested sequence — the key lives outside the repo, shredded after):
**Chunk 3: 101/101 GREEN — first roll.** Waiting for chunks 4-5:
**THE FULL 5-CHUNK COLD CERT MAP: 678/678 GREEN — EVERY CHUNK FIRST ROLL, ZERO FLAKES.** Now the closing chrome checks:
All closing checks GREEN. Now the final commit. Let me review the change surface:
The diff is exactly as designed. Now the commit:
Now the SSH push. Let me check the wrapper's CLI first:
Dry-run green (auth OK, fast-forward `31d92ff..f110017`). The real push:
The push was already verified by the wrapper itself (`remote verified: refs/heads/main @ f110017 == local HEAD`). Let me complete the verification and shred the key:
All done — the push verified, the key shredded. Final verification pass against the user's requirements:
The S181 cycle is complete, committed as `f110017` on `main`, pushed via the SSH wrapper (remote verified, operator key shredded), with all gates green.

**What shipped (Batch EE — the notes tag-row family port):**

- **Root cause found and fixed**: the tag row carried `mt-2` where the reference carries `mb-4` — and since the editor pane is a flex column (margins *add*, never collapse), the clone's stack rendered **24px / 0px / 28px** gaps vs the reference's **16 / 16 / 16**, leaving the tag row flush against the Attach row. Now measured exactly 16/16/16.
- **The pill** re-ported to the Badge-secondary anatomy (content-sized, 600 weight, neutral-800 in both modes — the old `dark:bg-neutral-700` was a real dark-mode drift); **the input** re-ported to the shared shadcn form control (`w-24 h-7`, border-input); **the ghost add button** (40×28) added — a measured *functional* gap: the reference adds tags by click, the clone was Enter-only.
- The list tile's tags row `mt-1.5 → mt-2`; the standing **Subjects/Holidays rotation re-probed: MATCH, no drift**.

**Verification** (all live, this session): honest RED proven (6 pins failing pre-change), then all-green — lint ✓ · tsc ✓ · unit 1779/1779 · the full 5-chunk cold cert map **678/678, every chunk first roll** · drawer check GREEN (121st + 122nd — no Tailwind v4 mobile-nav bug) · desktop parity MATCH · zero residue on both accounts. Four self-verifying evidence frames under `docs/screenshots/`; the plan at `docs/remediation-plan-session181.md`; `.env` at `file:../db/custom.db` with `db/` at the repo root, matching `.env.example`.

**Suggested next cycle** (recorded in the worklog): the notes e2e consolidation pass (EA–EE now 24 pins deep), the reference's title-row re-probe (the s181 probe's titleRow leg needs a walk-up selector fix), and the Timetable/Files rotation.
