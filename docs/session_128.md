The repo is at `5a415d5` (the operator's `docs/session_126.md` transcript commit on top of the Batch CB state) — this cycle is **Session-128 / Batch CC (Cycle 78, the s128 cycle)**. Let me set up the plan and verify the environment.
Environment mostly survived: `.env` correct, db present (stale — will reseed before live verification), chromium provisioned, agent-browser ready. The push infra (`/home/z/ssh-infra/`) is gone — will rebuild before the push. Let me check the toolchain and read the key cycle docs.
Environment intact. Starting the cold baseline — lint and typecheck first, while I re-anchor on the doc chain.
Lint ✓, tsc ✓, unit **1171/1171 (42 files)** — exact. Now the canonical build, while I re-anchor the doc chain.
While the build runs, let me re-derive the register tripwire. First, let me find its documented procedure.
My quick derivation (258/132) doesn't match the calibrated instrument. Let me read the exact definitions in the test file.
**Register tripwire: 249 importers / 130 Usage-line carriers / 0 stale / 119 usage-line-free — the EXACT hold (the 33rd consecutive).** Now checking the build.
The background build died with the tool session (the known lesson). Let me re-run it in the foreground, and check the standalone's timestamp first.
The standalone predates the CB commit — per the cold-start discipline I'll run a fresh canonical build in the foreground now.
Build green (exit 0). Baseline: lint ✓ · tsc ✓ · unit 1171/1171 · tripwire 249/130/0/119 · build ✓. Now the cold 5-chunk e2e cert — checking the cert script first.
The cert script header still says 538 — let me check whether the CB cycle updated it.
The CB cycle added `scripts/run-cert-chunk.sh` (per-chunk foreground runner). Now running the cold 5-chunk cert — expectation stated BEFORE the measurement: **144 + 177 + 72 + 93 + 73 = 559**.
**Cold 5-chunk e2e cert: 559/559 — 144+177+72+93+73, every chunk first-pass.** Baseline complete and exact. Now the Mode-C audit of the Batch CB diff.
CB diff: 53 files, +2347/−192. Auditing the production-code hunks (Mode C) — reading the key fixed surfaces.
**Mode-C audit of the Batch CB diff: all 22 CB claims re-verified TRUE against the tree.** Now the live parity phase — fresh dev-db reseed + daemon boot, then the standing battery on both hosts.
Dev daemon healthy on fresh-seeded db. Starting the reference-host battery — checking the agent-browser usage pattern from a recent script first.
Reference login OK ("Good morning, sepnetflix2023"). Running the standing mobile battery — first the hamburger anatomy.
**Reference standing battery GREEN** (unlabeled hamburger · no role=dialog · 288px · blur(4px) · 20 links · landscape 992>290 scroll). Now the clone battery.
Scroll persistence read 0 — let me check the app's scroll-restoration implementation to apply the exact standing procedure.
The /Notes view doesn't document-scroll (self-contained). The persistence probe rides a long view — redoing on Dashboard.
The probe is drawer open/close not resetting page scroll. Testing that interpretation:
**Scroll persistence 600→600 ✓** (drawer cycle preserves scroll). Now the landscape leg.
**Clone mobile battery ALL GREEN — no Tailwind v4 mobile-nav bug (31st consecutive live confirmation).** Now the two rotated deep audits. Checking the coverage rotation history first.
Rotation for this cycle (CC): fresh eyes go to **(A) the client state/transport/lib layer + UI primitives** (last deep-covered BZ; CB just mutated data.ts/date.ts/calculator.ts/validation.ts) and **(B) the test layer itself + schema/seed** (last covered BW; CB added ~1000 lines of pins + import caps). Launching both audits in parallel.
Audit A delivered: **0C/0H/1M/7L/6I** (the M-1: `importProfilePatch` leaks `displayName` into the User update). Now Audit B — the test layer + schema/seed.
Both audits are in: **Audit A 0C/0H/1M/7L/6I** · **Audit B 0C/0H/4M/5L/5I** (with independent census verification 559 ✓). Per Mode-C discipline, verifying every M finding by direct read now.
All four M findings verified by direct read. Now spot-verifying the L-tier items I plan to fix — first the global-setup fallback, the dead store methods, and the CB19 import pins.
Decisive: at 100k rows the single-index GET costs **34.6 ms vs 0.27 ms** with the full composite (128×). Now enumerating exactly which models ride the factory list queries.
The CC10 set: 19 factory-listed models get `@@index([userId])` → `@@index([userId, createdAt, id])` (replace, prefix-safe; PasswordResetToken/Flashcard/RumEvent untouched). Now sizing the remaining L-tier fixes.
All fix surfaces sized. Quick doc-drift spot-check (the standing lens) before writing the plan.
PAD v1.3.35 current; the only stale anchor is the cert-script header (B-M1). All findings are now verified. Writing the remediation plan — first, mirroring the s127 plan's structure.
All conventions captured. Writing the remediation plan now.
Plan written. Pre-execution validation pass — the remaining fix surfaces: the s23 envelope pattern, toast.tsx in full, and the date.test legs.
The helper pattern captured. Now the RED phase — writing the unit pins first. Reading target file conventions.
Writing the RED pins — starting with CC1 in data-import.test.ts.
Now CC6 (date), CC7 (apiGet timeout), and CC13 (calculator) pins:
Now the CC13 calculator pin and the CC8 toast test file:
The toast file is vitest-safe (no CSS imports, esbuild handles TSX). Now the CC10 schema-index census pin:
Now the CC11 loading-overlap pin in data-store.test.ts and the CC2 script-conventions pin:
Now the CC2 cert-script truth pin in script-conventions.test.ts:
CC2 RED verified (2 failed for the right reasons). Verifying the rest of the unit RED batch:
**Unit RED verified: 11 pins failing for the right reasons** (CC1 ×3 displayName rides · CC2 ×2 · CC6 the live RangeError · CC7 ×2 the hung GET · CC8 ×2 the cap + non-monotonic ids · CC10 ×2 · CC11 ×1; CC13 passes as the designed holds-class). Now the e2e RED pin:
The second run hit the documented aged-db class (S46). Clean re-run to capture the CC1 pin's exact RED reason:
The 409 is a pin defect — the spliced envelope reuses the demo session's fixed row ids (P2002 on the global PK). Fixing the pin to use its own unique ids, like the BT1/S117 conventions:
**CC1 e2e RED verified: Expected 200, Received 400** — the finding demonstrated live at the route boundary. RED phase complete (11 unit + 1 e2e, all for the right reasons). Now the GREEN phase — starting with the CC1 whitelist:
CC1 GREEN check, then CC6 + CC5 + CC11 (data.ts/date.ts family):
Now CC5 (chain eviction) + CC11 (loading Set) + CC9 (dead methods) in data.ts, all in one edits pass:
The Set design still races same-key overlaps — upgrading to a per-key count map (the exact discriminator my pin uses):
Expected tsc errors (the CC7 fix pending). Applying CC7 — apiGet timeoutMs + the boot gate deadline:
Now CC8 (the toaster) and CC5 (chain eviction):
Now CC9's minutesToHHMM removal (source + its test legs):
Now CC10 — the schema index swap on the 19 factory-listed models:
PasswordResetToken correct. Now CC2 — the cert script re-tag + exit propagation:
The old S125/BZ block's continuation now dangles — repairing the header stack:
Now the exit-code propagation in the cert loop:
Mechanism verified. Adding the Expected header to run-cert-chunk.sh:
Now CC3 (dots pins settle wait) and CC4 (try/finally cleanup) in the e2e specs:
Now CC12 — global-setup logging + the seed header fixes:
All source fixes are in. Running the full verification: tsc, lint, unit suite:
**Unit GREEN: 1191/1191 (44 files)** — census 1171 → 1191. Getting the per-file counts for the census record:
**Unit GREEN: 1191/1191 (44 files)** — exact by summation. Now the canonical build, then e2e GREEN verification:
Dev db confirms the composite swap. Now the targeted e2e GREEN runs:
All targeted GREEN (10 + 112 passed). Now the cold 5-chunk cert — expectation: **144 + 177 + 72 + 93 + 74 = 560**.
**Cold 5-chunk e2e cert: 560/560 — 144+177+72+93+74, every chunk first-pass.** Now the tripwire re-derivation (expectation stated before: **249/130/0/119** — no new script files):
**Tripwire: 249/130/0/119 — the exact hold (34th consecutive).** Now the live phase: fresh daemon + battery + CC1 round-trip demo + evidence frames.
**Clone battery ALL GREEN (32nd consecutive no-Tailwind-v4-bug confirmation).** Now the CC1 round-trip live demo on the daemon:
**CC1 live round-trip verified: 200, themeMode "dark" applied, the spliced name never rode.** Capturing the 128-* evidence frames:
The export panel frame is nearly blank (1.28% non-white) — re-capturing with a proper settle:
All three frames verified. Now the docs chain — first the exact per-file census deltas from the PAD §8.1 table:
Arithmetic resolved: date is net 0 (−1 it +1 it), so unit = 1171 + 20 = **1191 exact**. Now updating the docs chain. First the PAD §8.1 rows and Total:
Now the PAD updates — version, revision block, §8.1 rows, Total, §8.4 floors:
PAD done. Now the plan §5 execution record, the worklog Session-128 entry, and the session record:
Now the session record `docs/session_127.md`, mirroring the established structure:
The README table has an S127 gap (the CB cycle skipped its row). Backfilling S127 from its worklog record + adding the S128 row:
The gaps comment stays accurate (S127 now backfilled). Final pre-commit review — the diff stat, key-material scan, and placeholder scan:
The `.vitest/` cache dir got staged — removing it and adding to .gitignore:
Email mention matches the established precedent; the password ships nowhere. Now the commit:
No ssh binary — building the paramiko shim (Appendix A of the wrapper doc):
The shim exists at `docs/ssh.sh`. Building the push infra outside the repo:
Dry-run green — remote at `5a415d5`, fast-forward to `37468e3` available. Executing the real push:
**Session-128 / Batch CC (Cycle 78) complete and pushed** — `37468e3` to `main` (remote ref verified equal to local HEAD, deploy key shredded, no branches created).

## Cycle summary

**Baseline (cold, before any work):** lint ✓ · tsc ✓ · unit **1171/1171** (42 files) · canonical build green · cold 5-chunk e2e **559/559** (144+177+72+93+73, every chunk first-pass) · register tripwire **249/130/0/119** (33rd consecutive hold) · Mode-C audit of the Batch CB diff: **all 22 claims TRUE**.

**Live parity (both hosts):** the reference battery held (unlabeled hamburger · no role=dialog · 288px · blur(4px) · 20 links · landscape 992>290); the clone battery GREEN end-to-end — **no Tailwind v4 mobile-nav bug, the 32nd consecutive live confirmation**.

**The rotated audits + the CC set** (client lib/transport/primitives **0C/0H/1M/7L/6I** + test layer/schema/seed **0C/0H/4M/5L/5I**; every M verified by direct read, the index win *measured*):

- **CC1 (M)** the import profile-patch **whitelist** — a hand-edited envelope carrying `displayName` rolled back the *entire* restore behind a misleading 400 (the schema alias, but the User model has no such column); RED demonstrated at the route boundary, then the live round-trip demo (export → splice → import **200**, preferences applied, the name never rode)
- **CC2 (M)** the cert-runner truth pair — the stale 538 header now **machine-enforced** against the census by a new pin; the always-exit-0 fixed with rc accumulation + `exit "$rc"`
- **CC3/CC4 (M)** the CB5 dots pins' data-settle wait + the try/finally cleanup convention restored on 4 pins
- **CC10 (measured)** the factory-list **composite indexes** on 19 models — 34.6 ms → **0.27 ms** per list GET at 100k imported rows (128×), same index count per table, schema-census-pinned
- **CC5–CC13** chain eviction · NaN guard · apiGet timeout + boot-gate deadline · toaster identity/cap · dead-code removals · loading in-flight counts · seed/global-setup docs · the `-2^2 = 4` precedence locked

**TDD:** RED 13 unit + 1 e2e pins, all failing for the right reasons → GREEN. **Final gates:** unit **1191/1191** (44 files) · cold 5-chunk e2e **560/560** (144+177+72+93+74) · tripwire **249/130/0/119** (34th hold) · **1751 green total**. Docs chain updated (PAD v1.3.36, README + backfilled S127 row, SKILL, vitest header, cert re-tags, plan §5, worklog, `docs/session_127.md`, three `128-clone-*.png` evidence frames).

The repo remains a production-ready superset with visual parity; six honest mid-run corrections are recorded in the plan's §5.
