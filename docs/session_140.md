I'll continue the multi-phase task. Let me first check the current workspace state and refresh it.
Workspace was reset. Let me clone the repo fresh and check the uploaded files.
Repo cloned fresh. Let me set up the task plan and examine the repo state.
Remote has advanced significantly — batches up to CH (s133 cycle) are pushed. Let me check the docs structure.
Key findings: session_137/138, remediation-plan-session133, worklog.md, .env.example all exist; but `db/` and `.env` are missing (gitignored — need to recreate locally). Let me read the latest session docs.
The project is StudyFlow — Next.js 16 + React 19 + Prisma/SQLite. Let me read the latest session docs to confirm current status.
session_137/138 confirm: Batch CH (s133 cycle) is complete and pushed. Now I'll run the next cycle. Let me read the remediation plan and worklog tail.
Now let me read the core docs to internalize conventions. Starting with AGENTS.md and README.md.
I have full context now. The state: Batch CH (s133) complete/pushed; next cycle per closing suggestion is **Session-134 / Batch CI (Cycle 84)** — the scrypt KDF migration (front-of-queue, 6th deferral) + rotated audits (auth/crypto/infra + FE/views). Since the workspace reset, I must recreate the environment. Let me set up in parallel with reading the KDF deferral details.
Now let me install dependencies and study the KDF seam in parallel.
Dependencies installed. Now let me set up the database, dev daemon, and verify the environment.
Database ready. Now start the dev daemon (S32 recipe) and check Playwright browser availability.
Environment healthy. Now run the dev-server preflight and start the cold baseline gates.
The fresh install updated Playwright, which now needs chromium build 1243. Let me provision it.
Preflight GREEN. Now the cold baseline — lint and typecheck first.
Unit 1291/1291 (45 files) ✓ — matches documented baseline. Now the production build.
Build green. Now the cold 5-chunk e2e certification. Let me check the runner script first.
Now the 5-chunk e2e certification. I'll daemonize chunk 1 and run the Mode-C audit of the Batch CH diff in parallel.
Chunk 1 running. Now the Mode-C audit — batch-verifying the CH claims against the tree.
All 10 CH claims verified TRUE. Let me check zero key material in the CH diff and chunk 1 progress.
**Chunk 1: 149 ✓ (2.9m)** — first-pass. Launching chunk 2 while studying the KDF seam details.
Login route understood. Let me read the register route's equalizer branch and the auth test pins.
Now the critical KDF feasibility measurement — the maxmem trap and Bun/Node equivalence. Let me write the measurement script.
Measurements confirm the maxmem trap on both runtimes and heavy costs (Node 537ms, Bun 857ms at N=2^17). Let me verify cross-runtime byte-equality — critical since seed (Bun) writes hashes that Node servers verify.
Cross-runtime byte-equality CONFIRMED — the migration is viable. Let me scope the codebase structure for the rotated deep audits.
Now launching the two rotated deep audits as parallel read-only subagents while e2e chunks continue.
Both audits complete: **A: 0C/0H/2M/5L/7I; B: 0C/0H/2M/5L/4I**. Per doctrine, every M finding must be re-verified by direct read before the plan. Let me verify now.
Both B-M findings verified TRUE. Let me check chunk 2 and launch chunk 3.
**Chunk 2: 180 ✓ (4.0m)** — first-pass. Verifying the remaining L findings while chunk 3 runs.
All findings verified TRUE. Let me check chunk 3 and gather the remaining implementation-critical facts.
**Chunk 3: 74 ✓ (1.8m)** — first-pass. Launching chunk 4 while gathering design facts.
Let me verify node:crypto mockability in this vitest setup with a scratch probe.
Classic hoisting issue — fix with `vi.hoisted`.
The mock mechanism **works** — and the probe doubles as a RED demonstration (current code burns at default N=16384). Let me check chunk 4 and gather the last design facts.
**Chunk 4: 94 ✓ (3.1m)** — first-pass. Launching chunk 5 (final) and starting the remediation plan draft.
**FULL COLD BASELINE: 578/578 — 149+180+74+94+81, every chunk first-pass.** Now the live parity phase — clone drawer battery first.
**DRAWER CHECK: GREEN — 43rd consecutive confirmation.** Now the reference-site parity probe via agent-browser.
Reference logged in. Now the mobile drawer battery on the reference.
Reference drawer contract verified. Now nav-click + desktop chrome on the reference.
Reference battery complete. Now the clone live walk on dev :3000.
Focus lands on "Close menu" ✓. The dialog wrapper is full-viewport; let me measure the inner panel and complete the walk.
**Live parity complete — both hosts GREEN.** Now writing the remediation plan for Session-134 / Batch CI.
Plan drafted. Now the VALIDATE phase — checking the design-critical insertion points against the code.
Line 110 of calculator-view.tsx looks corrupted — but typecheck/build passed. Let me verify precisely.
False alarm — file is fine (grep artifact). All facts validated. Now the **TDD RED phase** — starting with the auth.test.ts pins.
Now writing the RED pins. First the auth.test.ts CI1+CI2 family — studying the remaining structure.
The census style is clear — and the CG1 pin will need re-anchoring in place. Now writing the RED pins in auth.test.ts.
Now the CI2 expiry pins and the DUMMY re-anchor.
Now appending the CI1 migration family at the file end.
Fixing a bug in my legacyHash helper — the salt must be 16 bytes (32 hex chars), not 8.
Now the unit RED verification — the new pins must fail for designed reasons.
**RED verified — 10 failures, all designed reasons** (3-part mint, missing exports, single-burn censuses). The CI2 expiry pins pass on current code (coverage pins for correct behavior). Now the script-conventions censuses.
Now appending the new CI1 route-census pins at the file tail.
All 3 RED failures designed. Now the CI6b/CI7a/CI6c/CI8 pins — checking the residual register shape first.
The residual register targets a different family — CI8 gets its own anchored census. Now writing the remaining unit RED pins.
Writing the CI6c over-declaration warning pins in env-check.test.ts.
Now the CI6b TTL lockstep pin, CI7a flashcards pre-warm pin, and CI8 violet register.
Fixing a typo — a stray `*` broke the comment block.
Now the RED verification for the four unit test files.
Unit RED complete (env-check import-error is the designed first-RED for new exports). Now the e2e RED pins — checking the exact locators.
Writing the CI3 429 quartet in auth-flows.spec.ts.
Now the CI4 MyDay pin and CI5 calculator pin.
All e2e pins written. Now the e2e RED verification — targeted runs against the current build.
**CI4 RED verified — "resolved to 2 elements"** (the designed discriminator). Now CI5.
**CI5 RED verified — false empty copy renders (count 1).** Now the CI3 quartet (coverage pins, expected green on current code).
2 of 4 CI3 pins FAILED — possibly real defects. Investigating.
The pins tripped the per-EMAIL budgets (5/15-min) before the per-IP budgets (10) — my design error. Fixing with distinct emails per request.
**CI3 quartet green** (coverage pins, as designed). RED phase complete. Now the **GREEN phase** — starting with the CI1 KDF migration in auth.ts.
Now the transition equalizer — updating `verifyLoginCredentials` and adding `burnLoginScryptWork`.
Now retiring `secureRandomBytes` (CI6a) and checking the misc section.
Now the login route — the rehash drain + the exhausted-branch burn upgrade.
Now the reset-password hoist.
Now CI6b (TTL derivation) and CI6c (over-declaration warning).
Now CI6c — the over-declaration warning in env-check.ts and its instrumentation wiring.
The instrumentation wiring is complete. Now the FE edits — CI4 MyDay busy guard first.
Now CI5 — the calculator history loading gate.
Let me check the repo's Spinner idiom for consistency.
Refactoring to the shared Spinner idiom.
Now CI7a (flashcards pre-warm), CI7b (notes mirror), CI7c (files alert), CI7d (slider resync).
All source edits applied. Running the full unit suite for the GREEN check.
Three mechanical drifts: the notes-view edit shifted line numbers (register re-anchor needed) and the census slice ends too early. Fixing both.
Now fixing the reset census slicing.
**UNIT GREEN: 1314/1314 (45 files)** — census 1291 → 1314 (+23). Now lint + typecheck.
TS errors — `burnLoginScryptWork`'s second param must be optional.
tsc ✓ lint ✓. Now the production build, then e2e GREEN verification.
**CI4 + CI5 e2e GREEN.** Now re-tagging the cert scripts for the new census (578 → 584: 150+181+74+94+85).
Now updating the vitest header census comment.
Census pins green. Now the full cold 5-chunk re-certification.
**Chunk 1: 150 ✓ (3.0m)** — first-pass. Launching chunks 2 and 3 sequentially.
**FULL COLD RE-CERT: 584/584 — 150+181+74+94+85, every chunk first-pass.** Chunk 5: 49s → 1.4m (the honest KDF availability delta). Now restarting the dev daemon on the remediated code.
**DRAWER CHECK: GREEN — 44th consecutive confirmation.** Now the evidence capture — studying the s133 capture script pattern first.
Writing the s134 evidence capture script.
Frame 3 missed auth — the fresh context bounced to /login. Fixing with the authed-page pattern.
The cold-compile goto timeout (the s133 lesson). Warming the route first, then holding.
`ERR_ABORTED` — the auth gate re-navigates mid-goto. Adding hydration wait + one retry.
All three frames captured. Visual verification of the new CI5 surface.
Pixel stats confirm non-blank frames; the capture script's own spinner-wait + passing e2e pin are the machine proof (s133 precedent). Now the tripwire re-measurement.
The machine pin held. Now the numeric register re-derivation with the census's own instrument.
**Register: 252/133/0/119 — the 45th consecutive hold** (+1/+1 = this cycle's capture script). Now the docs chain. Starting with README.
Now appending the S134 row to the README Project Status table.
Now AGENTS.md census anchors and the KDF note.
Now the SKILL doc and PAD.
Now the PAD revision block + §8.1 Total row.
Fixing the Total row's test-count column arithmetic (1291+578+1=1870 → 1314+584+1=1899).
Now .env.example (CI6c note) and DEPLOYMENT.md (KDF note).
Now the plan §5 as-executed record.
Now the formal session record — docs/session_139.md.
Now the worklog entry.
Docs chain complete. Final pre-commit verification pass.
Clean changeset, zero key material. Committing.
Committed `0b5afb1` on main. Now the SSH-wrapper push — reading the runbook first.
No ssh binary, no paramiko. Installing paramiko and deploying the shim.
Key verified. Now the wrapper dry-run.
Dry-run clean — fast-forward `32a15c0..0b5afb1`. Executing the real push.
Push verified by the wrapper (remote main @ 0b5afb1 == local HEAD), key shredded. Final integrity check on the new docs.
**Session-134 / Batch CI (Cycle 84) complete and pushed** — commit `0b5afb1` on `main`, verified on the remote via the SSH wrapper, operator key destroyed per the runbook.

**Delivered** (31 modified + 6 new files, +1,004/−56):

**CI1 — the scrypt KDF migration** (the sixth-time-deferred B-L3, now closed): versioned 6-part format at the OWASP floor (N=2¹⁷), legacy dual-verify + rehash-on-login drain, explicit maxmem everywhere (verified: both runtimes throw without it), cross-runtime byte-equality verified, and a **transition timing equalizer** — every login attempt burns exactly one 2¹⁴ + one 2¹⁷ scrypt so the migration can't reopen the account-existence oracle. Measured availability: login ~0.6–0.95 s, chunk-5 e2e 49 s → 1.4 m.

**The audit riders** (from the rotated dual deep audits — auth/crypto/infra 0C/0H/2M/5L/7I; FE/views 0C/0H/2M/5L/4I): session-token expiry pins, per-IP 429 quartet, MyDay double-submit guard, calculator-history loading gate, plus the hygiene/FE/violet-register L sets.

**Verification record**: lint ✓ · tsc ✓ · unit **1291 → 1314** · build ✓ · cold e2e **578 → 584** (150+181+74+94+85, all first-pass) · drawer battery GREEN (**44th consecutive** no-Tailwind-v4-bug confirmation) · tripwire 252/133/0/119 (45th hold) · 3 evidence frames. **Census: 1,898 green.**

Docs updated end-to-end (README/AGENTS/PAD v1.3.42/SKILL/DEPLOYMENT/.env.example/plan §5/session_139/worklog). Next-cycle candidates: rotate audits to data/import/export + entities/factory, or the violet-200 token family.
