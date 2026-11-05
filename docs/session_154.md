I'll start working through this complex task systematically. Let me first set up my task plan and then refresh the workspace.
仓库克隆成功。文档非常大（README 477KB，AGENTS.md 285KB，worklog 696KB）。让我先检查一下仓库结构：
The repo is large with extensive docs. Let me dispatch parallel agents to read the huge documentation files while I review the core configs myself:
Excellent! I now have a comprehensive understanding of the project. Let me update my todos and proceed with provisioning and skills review:
Bun 1.3.14 可用。现在让我使用文档中记载的 double-fork 守护进程模式来配置工作区（以便我可以并行审查技能），然后阅读关键配置文件：
现在让我检查安装进度并读取技能目录：
Dependencies installed (491 packages in 6.77s). Now let me set up `.env` and provision the database:
Database provisioned at repo-root `db/custom.db` exactly per the contract. Now installing chromium and reviewing the skills catalog:
Let me read the key skills for the audit. Starting with web-application (the primary code-review skill):
Now let me establish the cold baseline (the repo's doctrine: re-certify before any work). Running the gates:
Baseline green: lint ✓, tsc ✓, 1391/1391 unit ✓. Now starting the build in the background and dispatching the deep audits in parallel:
agent-browser 0.41.1 available. Now dispatching the rotated deep audits (FE/views + auth/crypto/infra — the two-cycles-stale axes per the closing directive) in parallel:
Outstanding audit results. Let me check the build status and then compare against the reference site:
Build ✓, chromium ✓. Now starting the dev server and logging into the reference site for the parity comparison:
Dev server is green. Now let me use agent-browser to login to the reference site:
Logged into the reference site. Let me capture the reference dashboard state and screenshots:
Now let me test the reference site's mobile navigation:
Let me view the reference screenshots to understand the visual state:
Let me use computed styles (the repo's ground-truth doctrine) instead of visual inspection:
Reference drawer measured: 288px (w-72) white panel z-50, 20 links, backdrop black/20 + blur. Now let me compare the clone's mobile drawer side-by-side:
Clone login works. Now opening the clone's mobile drawer for comparison:
**Mobile drawer parity confirmed**: clone matches reference exactly (288px w-72 panel, white bg, black/20 backdrop with blur(4px) — correctly handling the Tailwind v4 blur-scale shift trap, 20 nav links) plus a11y supersets (role=dialog, aria-label, Escape close). Let me run the repo's formal drawer-check script:
Formal drawer check: **GREEN** (55th consecutive confirmation). Now let me verify the desktop chrome parity and run the e2e config validation:
Desktop parity also confirmed (260px sidebar, 20 links in order, main at x=260). Now let me validate the Playwright config with the mobile-navigation spec (the highest-regression-risk chrome spec):
All 20 mobile-navigation e2e tests passed. Let me validate the vitest config:
Both test configs validated. Let me do a final reference check on the Timetable view (to adjudicate the audit's L-3 finding about the 9-card cap):
The reference's "My Classes" is an empty state on this account (data-shaped probes are non-authoritative per S123 doctrine). Let me examine the clone's cap implementation directly:
My decision on L-3: render all classes (no silent truncation — data honesty over an unmeasured cap). Now let me read the critical files to design the remediation plan precisely:
Now let me check where validation schemas are consumed (client vs server) to design the sanitization seam correctly:
validation.ts is client-imported — so the sanitizer must live server-side. Let me study the delegate structure:
Critical discovery: the import route writes through the raw Prisma tx client, NOT the delegate — so `writeTransform` won't cover the import path. Let me check the seed notes and Quill's format vocabulary to design the allowlist:
Now let me check the e2e spec inventory and data-import.ts's import surface to finalize the design:
data-import.ts is client-imported too — so the import-path transform goes in the route file (server-only). Let me add the sanitize-html dependency:
Dependency added. Now let me check the e2e certification runner mechanics before writing the plan:
Let me check which specs assert note counts (to design the e2e pin without breaking existing assertions):
Now let me read the exact code sites for the FE fixes (calculator defaults, PriorityCheckbox pattern, onSelect usage):
I have the complete design. Now let me write the remediation plan (the repo's doctrine: plan BEFORE source changes):
Plan saved. Now validating the plan against the codebase before execution (per the directive):
All plan anchors validated. Let me read global-setup.ts and the remaining fix sites before starting TDD:
Let me find the notes-view e2e spec for the render-gate leg placement:
Now I begin TDD execution. First, let me study the existing test conventions:
Now writing the RED tests (TDD — failing first). Starting with the note-html sanitizer pins:
RED confirmed (module missing). Now adding the authBurnGlobal RED pins to auth.test.ts:
2/3 pass (generic limiter semantics), the eviction-exemption leg is RED for the right reason (PROTECTED_BUCKETS lacks the key). Now the census legs:
All 5 census legs RED. Now implementing CO1 — the policy module first:
Now the server sanitizer configured from the shared policy:
9/10 — the one failure is a serialization detail (`<hr />` vs `<hr>`). Test-side fix (the sanitizer output is correct):
CO1 unit pins GREEN (10/10). Now wiring the two doors — the delegate's writeTransform first:
Now the import door — applying the sanitizer in the route's write loop:
Now the render gate in quill-editor.tsx (legacy rows):
CO1 implementation complete. Now CO2 — the authBurnGlobal containment on all four routes:
Now the other three routes. Let me read them first:
Now register the key in PROTECTED_BUCKETS:
Now updating the existing exemption census pins that reference the old ≤2 bound:
Only the AGENTS.md CO5 pin remains RED (as designed). Applying the fix:
All censuses GREEN. Now CO3 — the dashboard checkbox fix:
Now CO4a — the exam chips keys:
Now CO4b — the calendar OR-form gates:
Now CO4c (timetable cap) and CO4d (calculator defaults):
Now CO4e (rum-beacon comment) and CO4f (nav-items Map):
Now CO4g (flashcards rename) and CO4h (onSelect sweep):
The flashcards sites use `onClick` with `stopPropagation` (load-bearing — prevents the deck-row activation). Keeping those and documenting why:
All CO items implemented. Running the verification gates:
My 1-line import addition shifted a registered residual's line number. Updating the anchored register:
Unit suite 1409/1409 GREEN (46 files, +18). Now the e2e pins — first the legacy-note plant script:
Now wiring the plant into global-setup:
Now the s23-import e2e legs. Let me study its conventions first:
Now writing the e2e legs — first the s23-import CO1 leg:
Now the render-gate leg in parity-session9 (the legacy hostile note):
Now rebuilding (source changed) and running the new e2e legs:
GREEN. Now the honest RED verification — temporarily disabling the render gate to prove the pin catches the defect:
The type gate caught the unused import (working as designed). Let me RED-probe at the function level instead:
**RED verification complete** — with the gate disabled, the live remote pixel renders (test fails exactly as designed); restored, it passes. Now the s23 import leg:
All 14 s23 tests pass. Now running the full 5-chunk cold certification (the final gate):
Chunk 1: 150/150 ✓. While the cert runs, let me locate the register tripwire script:
The tripwire is pinned inside script-conventions (already GREEN in the unit run). Polling cert progress:
Chunks 1-3: 150/186/87 ✓ (chunk 2: 185+1 = the render-gate leg landed). Waiting for chunks 4-5:
**FULL COLD CERT: 605/605** (150+186+87+95+87). Final census: 1409 unit + 605 e2e = **2014 green**. Now capturing evidence screenshots per the repo convention:
Let me simplify the plant script (respect a pre-set DATABASE_URL) and clean up the capture script:
All 4 frames captured (md5-distinct, non-blank). Cleaning the probe row from the dev db (the demo-surface-restoration convention):
Now the doc-chain updates. Finding the census anchors across the doc set:
The doc-chain update needs surgical precision (historical session records must NOT change — only current-tense census sites). Let me examine all matches:
Now executing the doc-chain updates. Part 1 — the census re-anchors:
Part 1 complete. Now Part 2 — the PAD revision block and census anchor:
Now the vitest header re-anchor block and README Session-140 row:
Mojibake from the escape decoding — fixing by rewriting the row directly:
Now the AGENTS.md S140 lessons block:
Now the worklog entry and session record:
Now the session record (docs/session_153.md) and the plan's as-executed close:
Now let me check whether the census pins read the cert script's Expected values (my re-tag may need matching):
All gates green after doc updates. Now preparing the commit — checking the full change set:
All files present, diff is secret-clean. Now let me commit and set up the SSH push infrastructure per the wrapper skill:
Shim deployed. Now let me commit the remediation (following the repo's Conventional Commits pattern):
Committed (9cb5a10), tree clean. Now setting up the operator key and pushing via the wrapper:
Dry-run green (auth verified, fast-forward). Real push:
Push verified — `main @ 9cb5a10` on the remote, key shredded, tree clean. Let me close the browser sessions and finalize:
The full S140 remediation cycle is complete and pushed to `main @ 9cb5a10` on `nordeim/omni-study1`. Summary of the session:

## Workspace & understanding
- Fresh clone provisioned per the repo recipe (bun install 491 pkgs, `.env` with `DATABASE_URL="file:../db/custom.db"`, repo-root `db/custom.db` pushed + seeded, chromium re-provisioned, build green — the three-anchor db-path contract validated, no code change needed)
- Full doc chain digested (README/AGENTS/CLAUDE/PAD/SKILL + sessions 150-152 + worklog) via parallel read-only agents; cold baseline re-certified before any work (1391/1391 unit, 20/20 mobile-nav e2e)

## Live parity (agent-browser, both hosts)
- Logged into the reference with your account; **mobile drawer byte-matched** (288px `w-72` white panel, black/20 backdrop at blur(4px) — the v3 `backdrop-blur-sm` ≡ v4 `backdrop-blur-xs` equivalence verified live; 20 links) — **the 55th consecutive no-Tailwind-v4-mobile-nav-bug confirmation**; desktop chrome matched (260px sidebar, main at x=260)

## Audits → remediation (TDD, plan first: `docs/remediation-plan-session140.md`)
- **CO1 (A-L3 closed)**: note-HTML sanitization — one allowlist policy at both write doors (API delegate + import route) + a Quill render gate for legacy rows; `sanitize-html 2.18` as the repo's first new runtime dependency (server-only seam)
- **CO2**: `authBurnGlobal:` aggregate containment on the four scrypt-burning auth routes (the unswept CK1 family)
- **CO3/CO4/CO5**: dashboard checkbox `cn()` conflict fix + the FE-hardening octet + the AGENTS.md contract-line fix — all RED-verified first, then GREEN

## Final gate
lint ✓ · tsc ✓ · unit **1409/1409** (46 files) · build ✓ · cold 5-chunk e2e **605/605** — **census 2014 green**; 4 evidence frames in `docs/screenshots/`; full doc chain re-anchored (PAD v1.3.48, README badge + Session-140 row, worklog, `docs/session_153.md`); pushed via the SSH wrapper with remote-ref verification and key shredding.

**Next steps**: the A-M3 restore-availability performance cycle is the only remaining M-family deferral — a good candidate for the next session.
