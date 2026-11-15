I'll start by setting up a structured plan for this large multi-phase task, then work through it methodically.
Repo cloned successfully. Now let me read the core documentation files.
核心文档非常庞大（积累了 251 个会话）。我将采取策略进行阅读——先阅读前言以了解目的和架构，然后是最近的部分以了解当前状态。
现在让我阅读 worklog 尾部和 AGENTS.md 的关键部分，以了解当前的状态和规范。
我现在对项目状态有了清晰的认识。让我阅读一下 AGENTS.md 的结构和关键部分，以及技能目录。
Now let me examine the skills catalog and key repo skills, plus the environment state.
Fresh clone — no `.env` or `db/` yet (git-ignored). Let me set up the environment now.
Environment ready. Now running the cold baseline (lint → typecheck → unit tests), and checking Playwright chromium in parallel.
Unit suite green (1799/1799, matches S189 close). Now the production build — I'll run it in the background while reading the remaining docs and skills.
现在让我找一下仓库所需的 chrome 调试脚本（drawer check + parity probe）以及 ref-probe 基础设施。
后台构建进程已终止（这是该环境中已知会导致进程失效的问题）。正在按照文档中的清理（reaper-proof）方案重新在前台运行它。
Cold baseline fully reproduced (lint ✓ · tsc ✓ · unit 1799/1799 · build ✓). Now starting the dev server with the reaper-proof recipe and running the standing chrome checks.
The pinned chromium revision (v1243) is missing from the browser cache. Let me check what the repo expects and install it.
Preflight GREEN. Now running the standing chrome checks — drawer check and desktop parity probe (with the reference credentials).
Drawer check GREEN — the 139th consecutive (no Tailwind v4 mobile-nav bug). Now the desktop parity probe against the live reference.
Desktop parity probe: MATCH on all five structural checks. The reference heading reads "StudyFlow" (vs the greeting on clone) — worth investigating as a possible reference change. Let me login to the reference with agent-browser for a deeper look.
Major finding: the reference app has been rebranded — now "AcademiaFlow (Copy)" with new Google OAuth and Sign-up options on the login page. Let me login and investigate the current reference state.
Logged into the reference. Key observations: in-app brand is still "StudyFlow" but the login page now says "AcademiaFlow (Copy)" with a Google OAuth option. Let me compare with the clone's login page.
The clone already has Google/Sign-up/Forgot surfaces. The delta is the login heading text. Let me check the repo's academiaflow doc and probe the reference login page's measured geometry.
The login title is the documented Base44 project name ("AcademiaFlow (Copy)") — the clone deliberately carries the "StudyFlow" brand per the recon dossier. Not a regression. Now let me run the full reference resweep to detect any reference changes since S189. First, checking the resweep's login mechanism.
The full standing suite is heavy; for this session I'll follow the S189-era recipe: drawer check ✓, parity probe ✓, plus a fresh reference census. Let me check the latest ref-census script and boot the standalone on :3200.
Reference resweep: ALL GREEN — 9/9 invariants on both hosts, brand tables match, zero residue. The reference is unchanged. Let me do a comprehensive all-20-views census on the reference to catch any surface the resweep doesn't cover.
16 deltas flagged, but most look like data-state artifacts (reference account at zero data vs seeded clone). Let me verify the five real candidates directly on the reference: Tasks "Create Task", Timetable desktop accordions, Calculator "Clear", AI "Summarize", Focus Timer "Select subject".
The Timetable accordions are hidden mobile DOM (not a change — desktop grid intact). Real candidates: Tasks empty-state "Create Task" CTA, Calculator "Clear" button, AI quick modes, Focus Timer surface. Let me check the clone's equivalents.
Clone has the Tasks CTA and AI modes mostly match (clone says "Summarize Notes" vs reference "Summarize"). Let me probe the calculator keypad, AI modes, and Focus Timer on both hosts precisely.
Significant findings. The reference calculator keypad shows `Clear | backspace` on row 1 + a 4×4 grid, while the clone has `AC | ± | ÷` layout. Let me check the e2e pins and the clone's actual rendered keypad to see if this is drift or measured parity.
The clone's clear key shows "AC" visually while the reference shows "Clear". Let me check the git history of the calculator view and any reference measurement records to determine if this is reference drift.
The original recon dossier records the reference's AI prompt as "Summarize" — the clone says "Summarize Notes". A real parity delta. Let me check the calculator's rebuild-era reference measurements and the clone's keypad layout.
Session-2 measured the reference keypad as "AC col-span-2" — but the reference NOW shows "Clear" + an icon key. Let me verify with a direct visual check and examine the reference keypad closely.
Now let me read the clone's calculator render to compare its keypad layout precisely.
There's a session-72 reference calculator capture. Let me compare it with today's reference state to determine if the reference keypad changed.
The s72 reference capture confirms: the reference keypad has had "Clear"+backspace top row with dark operators since at least session 72 — the clone's "AC | ± | ÷" layout is drifted (never re-measured since session 2). This is a real parity gap. Let me probe the remaining details: Scientific tab, "=" gradient, Focus Timer combobox, and AI modes on the clone.
All deltas confirmed with hard evidence. The reference's Scientific tab carries the parens/%/xʸ keys (clone has them on Basic — misplaced). Let me do one final precision probe: key radii, gaps, Clear icon color, and Focus Timer geometry on both hosts.
Complete evidence table captured. Let me finalize the remaining measurement details: the clone's scientific extras, the reference's display area, backspace icon color, and capture reference screenshots for the record.
The reference Focus Timer has notable chrome: purple filled active mode pill, carousel dots, sound/settings buttons. Let me compare with the clone's current Focus Timer surface.
Almost complete evidence. Two final probes: the reference's scientific grid layout, the timer ring interior, and whether the carousel dots are interactive.
The Focus Timer needs a fuller port (panel card, container width, inverted preset typography, ring icon). Let me survey the existing test pins that these three families touch.
The hue-tokens CONSUMERS register will need a lockstep update. Now let me check the e2e chunk map to understand the cert composition before writing the plan.
The run-cert-chunk.sh header line is stale (705 vs the live 723) — a doc-rot site for the lockstep sweep. Now let me check the unit test layer convention for the calculator.
The complete measured truth table is ready. Let me check the vitest header structure, then write the remediation plan.
All evidence gathered. Now writing the S190 remediation plan.
Plan written. Now validating the plan's edit targets against the codebase before executing.
The dark-mode pins AG3/AH4a will need re-anchoring. Let me check the reference's dark-mode protocol from S186/S188 and measure the reference's dark calculator.
The reference account now persists in LIGHT mode (my captures confirm — the S188-era dark state changed by the owner). Per protocol clause (a), I'll record the mode. Let me update the plan with the dark-mode re-anchor decisions and the protocol note.
Plan validated and updated. Now executing TDD — writing the RED pins first. Let me examine the spec file structures.
Now writing the RED pins to the three spec files.
Now the RED proof — running the new pins against the un-ported tree.
Calculator pins: 6/6 RED (the 1 passed is the setup test). Now the AI and focus pins RED proofs.
**RED proof complete: 12/12 new pins RED.** Now the GREEN implementation. Let me read the full calculator view render sections first.
Now implementing. Let me check the remaining focus timer internals (CLOCK_LABELS, subjectId usage) before editing.
Now implementing the calculator port (F1).
Now updating the keyButton renderer and the tabpanels.
Now replacing the Basic and Scientific tabpanels.
Calculator ported. Checking for other spec references to the old key labels before moving to F2.
Now F2 — the AI quick-action port.
Now F3 — the Focus Timer chrome port. Let me apply the edits.
Now the mode row, presets, and panel wrapper.
Now the subject select, controls, and the panel closing tag.
Now the re-anchors: hue-tokens CONSUMERS register and the dark-mode AG3/AH4a pins.
Now running typecheck + lint, then rebuilding for the GREEN proof.
The hue-tokens inline-hex guard caught raw hex values in my comment. Fixing to use color names instead.
Unit 1799/1799 green. Rebuilding and running the GREEN proof.
EN1-EN3 green; EN4-EN6 need investigation. Let me see the failure details.
The clone's keypad spans the full 1116px main width; the reference's is a centered ~415px column. Let me measure the reference's calculator container structure precisely.
The reference wraps display+keypad in a centered `max-w-md` white card column. Let me view the captured reference screenshot to confirm the layout.
Key finding: the reference calculator is a centered max-w-md card layout. Let me probe the display card's inner structure and the tab strip precisely.
The reference card anatomy is now complete. Let me check the clone's current display utility and tab strip to scope the remaining port.
The GPA/Unit panels are full-width on the reference — only Basic/Scientific ride the max-w-md card. Before porting the tab colors, let me check whether the a11y sweep runs axe color-contrast (the reference's inactive tabs are neutral-400, ~2.2:1 on white).
The inactive tab color stays slate-600 (the axe-clean contract wins — the reference's neutral-400 fails WCAG AA; documented as a non-replicated reference defect). Now restructuring the calculator layout.
Let me clean up the structure properly — the display+keypad cards go inside each TabsContent (Radix unmounts inactive panes, so no duplicate-locator issue).
The icon-only backspace is filtered out by `.filter(Boolean)`. Fixing the census assertion.
All 20 calculator pins green. Now the AI and focus timer GREEN proofs.
All 12 EN pins GREEN. Now running the full touched spec files to verify the re-anchors and neighbors.
Two S5-H pins need re-anchoring. Also, the measured red-600 on near-black computes 4.10:1 (axe fail) — following the Family F precedent, one step to red-500 (5.27:1, axe-clean). Applying.
All 260 pins across the five touched files green. Now verifying the census by `--list` and updating the cert chain.
Census verified: **159+275+108+101+92 = 735**. Now the doc-chain lockstep — starting with the cert scripts and tripwire.
The cross-read tripwire chain caught the un-updated doc sites — working as designed. Updating all census sites now.
Unit 1799/1799 green with all cross-reads satisfied. Now the vitest header re-anchor and PAD bump.
Now launching the full 5-chunk cold cert map (reaper-proof, per the standing pattern) while I continue the doc lockstep.
Cert map chunk 1 running. Continuing the doc lockstep — the AGENTS S190 lessons block.
Chunk 1: 159/159 GREEN. While the map runs, writing the session transcript and worklog entry.
While chunk 2 runs, updating the plan's §5 checklist and §9 close-out, and preparing the evidence capture.
Chunk 2 still running. Preparing the evidence capture script following the S189 pattern.
Chunk 2 has 1 failure — the a11y-sweep. Let me investigate immediately.
The cert's grep filter hid the failing view. Waiting for the map to finish, then reproducing the a11y failure directly.
Cert map: 734/735 — one a11y-sweep failure to diagnose. Reproducing it now.
The reference's own `opacity-70` durations line fails axe contrast (another reference defect). Applying the documented one-step adjustment: drop the opacity, keep the text-xs hierarchy.
a11y sweep green (21/21). Re-certifying chunk 2 cold.
**Chunk 2 re-certified: 275/275 — the full map is 735/735.** Updating the plan §9 with the live catch, then capturing evidence.
Login works (the debug crash was just a navigation race — the capture timed out on the earlier cold compile). Retrying the capture on the warm server.
The dev daemon hit the documented S31 reload-loop class (stale Turbopack cache surviving restarts). Applying the documented remedy: `rm -rf .next/dev` + restart + preflight.
The frames captured and DOM-asserted; only the pixel probe's image loading failed (relative path on the app origin). Fixing it to use file:// URLs.
Evidence frames captured and verified. Now the closing chrome — drawer check (140th) + parity probe.
Closing chrome GREEN (drawer 140th + MATCH). Adding the honest a11y-catch record to the transcript and worklog, then the final review.
Final verification pass on the final tree before committing.
Commit `fbe9130` created. Now the SSH-wrapper push — reading the procedure first.
No ssh binary — deploying the paramiko shim per Appendix A, then running the field-tested sequence.
Dry-run green — fast-forward accepted. Executing the real push.
The S190 cycle is complete and delivered. Final summary:

## Session 252 — the S190 cycle (Batch EN), commit `fbe9130` pushed to `main` (remote verified)

**What I found** — After reproducing the S189 baseline exactly (lint ✓ · tsc ✓ · unit 1799/1799 · build ✓) and verifying the standing chrome (mobile drawer GREEN — 139th consecutive, **no Tailwind v4 mobile-nav bug**; desktop parity probe MATCH; reference resweep 9/9, zero residue), a fresh 20-view reference census plus five precision probes (logged into the reference with your credentials) found **three never-re-measured parity gaps**:

1. **Calculator Basic keypad** — 188 cycles stale: the reference ships an 18-key pad (near-black `Clear` + icon-only backspace row 1, dark slate-800 operators, 6px radii, single-cell gradient `=`, max-w-md display card, near-black active tabs)
2. **AI quick actions** — "Summarize Notes" → "Summarize" + tail order fixed
3. **Focus Timer chrome** — the white rounded-3xl panel, 36px mode pills, 64px tinted presets (typography was inverted), brain-icon mono ring, placeholder select, near-black controls

**What I did** — TDD: 12 honest-RED e2e pins → three measured ports → GREEN; 5 re-anchored pins + the hue-tokens register; doc-rot fix in the paired cert runner. The cert map's a11y sweep caught the reference's own `opacity-70` contrast fail live (not replicated — §6.9). Full gates: **735/735 e2e** (chunk 2 re-certified cold after the a11y fix), unit 1799, a11y 21/21.

**Deliverables** — `docs/remediation-plan-session190.md`, `docs/session_252.md`, worklog Session-201, PAD v1.3.98, 2 self-verifying screenshots, refreshed resweep captures, `.env` at `file:../db/custom.db` with `db/` at root, `.env.example` verified. Pushed via the SSH wrapper (key shredded; tree clean; no branches).

**Next (S191):** the flashcards-family e2e consolidation (deferred this cycle by the behavior-change axis, per the blast-radius rule).
