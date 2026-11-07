# Session 179 — the S153 cycle (Batch DB)

The workspace was a CONTINUATION at `73c51eb` on `main` (the Batch DA
fix `028271d` + the operator's session_178 transcript commit; the
sandbox preserved the tree, so the environment re-validated in place:
`.env` at the documented dev posture, `db/` at the repo root with both
scratch files, node_modules intact, the dev daemon on :3000 preflight
GREEN).

Cold baseline (before any work): lint ✓ · tsc ✓ · the full Vitest run
**1578/1578 (48 files — the documented S152 final state exactly)** · the
drawer check GREEN (**the 68th consecutive no-Tailwind-v4-mobile-nav-bug
confirmation** — backdrop oklab(0 0 0 / 0.2) + blur(4px); 288px white
panels; 20 links; no footer; Escape-close superset) · the desktop chrome
probe **MATCH** (all five formal checks, live reference login). Baseline
noise: none.

The audits (Mode-C; every M/L finding re-verified by direct read by the
orchestrator):

- **Audit A — the Batch DA recent-changes axis** (the `028271d` diff):
  **0C / 0H / 0M / 0L / 0I — clean.** All six DA claims verified
  DELIVERED at the source level (DA1's `deletingIds` latch at all five
  view files with the membership guard + finally removal + the
  plain-button `disabled`s; DA2's hand-guard heptet before `setBusy`
  with the field-naming copy; DA3's `replaceConfirmOpen` gate + the
  AlertDialog inside the TestDialog scope; DA4's `requireUser()` before
  the CN11 bound; DA5's fullName trim; DA6's doc sites). The doc census
  machine-verified: README badge 2192 ✓ · the unit-count prose at 1578 ✓
  · the import-cap prose at 64 MiB ✓ · AGENTS/CLAUDE 1578 ✓ · PAD
  v1.3.60 ✓ · the SKILL green-state + CD3 prose ✓ · the vitest header ✓
  — **zero stale sites** (the DA6 self-anchoring pins holding on their
  first re-read).

- **Audit B — the rate-limiter/auth-family + export/data-portability
  rotation** (the fix surfaces, swept at S124 and 28 cycles grown). The
  full axis read dispatched to a read-only subagent against the
  web-application skill's §4/§5/§6/§7/§16 rubric (auth.ts + server/auth
  + all 11 auth routes + the export page + both export routes +
  export-build + http.ts + data-import + the export panel), every M/L
  finding re-verified by direct read.

  **Verdict: 0C / 0H / 2M / 2L / 2I.** The full 30-key rate-limit
  census re-verified consistent (every scrypt-burning route carries a
  40/15-min process-wide global checked first; the non-scrypt auth
  routes carry none; the write/upload/ai/export/import/rum families
  unchanged; `auth/logout` the one documented exemption). No injection,
  authz, enumeration, or secret-handling defect in the axis. The
  findings:

  - **B-M1 (the S152 deferral — mechanics CORRECTED by the audit's
    direct read, the cycle's load-bearing finding):** a success NETS 0 —
    `checkRateLimit` increments every admitted request and the decrement
    fires on the success's own path after that increment, so the −1
    lands on the success's OWN +1, never a prior fail's. The S152 plan's
    stated alternation attack ("fail-on-victim +1 with self-success
    −1") was mis-modeled — that shape nets +1 per pair and trips at 80
    requests (the designed 2× bound). **The REAL unbounded door is the
    SUCCESS-ONLY loop**: under the documented default posture (open
    registration + the in-band OTP → scriptable own credentials), one
    attacker account loops correct-credential logins — each burning the
    full synchronous scrypt pair while netting 0 on `loginGlobal:` AND
    resetting both per-keys (`login:${ip}`, `loginAcct:`) — so NOTHING
    binds the loop (~24-37× the intended 40/15-min containment, the CK1
    single-worker-starvation shape reopened by the S138/CM3 decrement).
    The `authBurnGlobal:` family carries the same shape (per-user keys
    cap one account at 10/15-min but the fleet grows +40/15-min through
    the never-discharged `registerGlobal:`).
  - **B-L2-audit (Verified):** the `/export` page renders the full
    envelope per authed view (20 counts + the 20-findMany serialize,
    byte-identical work to the budgeted download) with NO budget while
    its route twin rides `export:${user.id}` 10/15-min. The e2e
    interplay measured: 3 demo renders + 1 fresh-user render + 2 anon
    redirects per chunk-5 boot — the shared-key variant would spend
    3-of-10 on the demo key.
  - **N1 (L, new):** the three process-wide globals gate BEFORE body
    validation (the documented convention), so a ~40-request
    garbage-body flood (zero scrypt cost) pins the respective global for
    its window — sitewide 15-min lockouts renewable at ~40 cheap
    requests. Adjudicated: documented as the accepted fixed-window
    trade-off (the re-order alternative would un-bound the garbage
    flood).
  - **N2 (L, new):** the pre-CM3 "success-RESET" semantics survived at
    three sites (change-password's "a success nets -1" comment,
    DEPLOYMENT.md's TRUSTED_PROXY_HOPS cell, the s16 CK1 pin's
    clean-slate comment) — all false since CM3.
  - **N3/N4 (I):** the verifyEmailSchema reference-pin note + the
    data-import path correction — recorded.

The plan (`docs/remediation-plan-session153.md`) written BEFORE any
source change and validated against the codebase (every anchor re-read;
the chunk-5 login POST tally derived by direct read of every login leg —
52 posts/boot, 13 successes + 39 fails, the live count 39/40 — and the
D-cap sizing derived from it: D = 20 > 13 keeps the cert arithmetic
byte-identical by construction).

**The RED inventory (as it ran): the unit REDs 4/4** — the DB1 cap pair
(auth.test.ts: the 21st-decrement no-op + the rollover re-arm, each
failing on the count-returned-to-0 pre-fix shape) + the DB1/DB2 census
pair (script-conventions: the MAX_DISCHARGES_PER_WINDOW declaration +
the exportPage: ordering, each failing on the absent markers) — **+ the
e2e pins RED-verified on the pre-fix build** (the DB1 success-loop pin:
the 80-iteration loop never tripped, `tripped=false` — the designed
discriminator; the DB2 page pin: all 11 views rendered the panel). One
e2e RED-leg authoring bug found and fixed DURING the RED phase (the
DB2 pin's "What's included" locator — the apostrophe HTML-escapes to
`&#x27;`; the discriminator moved to "Download JSON").

**The S153 fixes:** DB1 the capped discharge — `MAX_DISCHARGES_PER_WINDOW
= 20` on the new `Bucket.discharges` counter; the decrement applies only
while the window's discharges sit under the ceiling (successes 1-20 net
0, past the ceiling +1 each → every discharge-bearing aggregate bounded
at M+D = 60 admitted requests per window); the five call sites unchanged
(the cap internal to the seam — the existing census legs stay green);
the fresh-window rollover re-arms the allowance. DB2 the export-page
budget — the dedicated `exportPage:${user.id}` 10/15-min after the auth
gate (the DA4 doctrine) and before the counts + envelope, answering the
honest amber alert render (a page cannot 429; the render is cheap by
construction); the hue-tokens CONSUMERS register gains the page entry.
DB3 the N2 drift sweep (the corrected net-0 language at auth.ts + the
login route + change-password + DEPLOYMENT.md + the s16 pin's comment —
the pin's own arithmetic preserved: first429 = 41, fails never
discharge). DB4 the N1 note in DEPLOYMENT.md's limiter cell.

**The mid-cycle correction (the honest record — the plan's §5 placement
died on measured reality):** the DB2 pin's first home (s21-data-export,
chunk 5) broke s26's round-trip — TWICE, deterministic in the full-chunk
context. Root-caused by TRACE (not by spec-grepping): register #1 → 200,
register #2 (the s26 helper's re-issue) → **429 "Too many registration
attempts"** → a codeless response → the verify's uniform 400. The
chunk-5 `registerGlobal:` budget sits at **40/40 EXACTLY** (37 measured
by a self-calibrating probe spec across the pre-s26 files + s26's 3 —
the S136-era "≤ 3 per chunk" sizing comment had rotted 13 cycles), so
the pin's throwaway register made s26's re-issue the 41st. The pin
relocated to **navigation.spec.ts (chunk 1, before the DB1 terminal
pin)** — the CK1 budget-driven pin-home doctrine; the stale sizing
comment corrected to the measured arithmetic; the vitest header + the
cert re-tag carry the relocation note.

**Two more operational traps hit and closed (both self-inflicted, both
documented):** (1) the first cert-runner launch was REAPED (the tool-call
shell exits — the daemon-start lesson applies to the cert runner too;
the setsid recipe fixed it); (2) **editing the cert script WHILE bash
was running it** — bash reads scripts incrementally, so the header
insertion shifted the offsets and the runner died mid-chunk-5 with a
syntax error (the chunk-5 result itself was already complete: 89/89).
The never-build-during-e2e lesson's sibling: never EDIT the runner
during a run. And the BU7 investigation host hit the documented
deleted-inode + CWD-anchoring traps in sequence (a bare `prisma db push`
anchored at the CWD created a stray `../db/custom.db` — cleaned; the
:3200 repro server booted against a 0-byte db and served the deleted
inode — restarted after the proper push+seed).

**Interim gates: lint ✓ · tsc ✓ · unit 1582/1582 (48 files, +4 exactly
as designed: auth +2, script-conventions +2 — one census-leg authoring
bug fixed during GREEN: the DB2 envelope anchor matched the IMPORT, not
the call — the anchor moved to the call form) · build ✓ (exit 0; the 6
documented warnings; the cap guard `discharges<20&&…` + the page render
verified shipped in the standalone chunks).**

**The targeted e2e + the cert:** chunk 1 **152/152 first-pass** on the
clean environment (the earlier 151/152 carried the BU7 leg —
root-caused by a live 5-round repro on an isolated :3200 host: the
create POST 500s under co-resident load [the P1008 machine-load class,
round 4] while the clean rounds pass byte-exact; closed by the clean
first-pass); chunk 2 **189/189 first-pass**; chunk 3 **91/91
first-pass** on the re-run (the cert-run attempt was contaminated by
the orchestrator's own parallel repro — 11 failures under the
self-inflicted load, invalid by construction; the standalone attempt
carried one AK1d P1008 flake closed by the isolation pass + the
identical-combo first-pass); chunk 4 **95/95 first-pass**; chunk 5
**89/89 first-pass** (the s26 round-trip green after the relocation).
**The e2e census 616/616 (was 614) · census 2198 green** (was 2192).

**Evidence:** three `docs/screenshots/153-clone-*.png` frames (the
standing desktop 239 KiB + the standing mobile drawer 65 KiB — the 68th
drawer-GREEN companion frame — + the export page's rate-limited amber
render 188 KiB [DB2's visible proof — the capture script awaited the
alert text before the frame, the first 10 views the panel]),
self-verifying (exists, >10 KiB, byte-diverse, dominant-share < 95%,
md5-distinct — the capture script's JSON verdict ok:true; dimensions
machine-checked 1440x900 / 390x844). The DB1 cap's proof rides the unit
pair + the wire pin (the CW2 runtime-split precedent).

**Docs:** README badge/census (2192 → 2198) + the unit/e2e prose sites
+ the Session-153 row; AGENTS census (1578 → 1582, 614 → 616, the chunk
map) + the S153 lessons block (four lessons: re-derive the discharge
arithmetic from the increment semantics, never the prose; cap the
discharge — free successes are the unbounded door; budget the WORK not
the endpoint — a page door that renders an API's work needs its own
key; a chunk's budget ceiling is a pin-home constraint — measure it
empirically); CLAUDE counts; PAD v1.3.61 (the revision block); the
SKILL census (all four sites); the vitest header re-anchor (+4 with the
relocation note); the cert runner re-tag (Expected 616 + the S153
block) + the CC2 tripwire re-anchor; `docs/session_179.md` (this log);
the worklog Session-164 entry; the plan §6 as-executed close; the
`.env.example` contract re-verified (no env-var reads changed this
cycle).

**Next cycle:** the rotation continues — the **A-M3 ADR-021 stage-2
chunked sub-tx + resume token** stays the named candidate (carrying the
S150/B-L2 import lock-hold finding); the **db-path percent-decode**
stays recorded for the db-path-family cycle; the N1 re-order
alternative (validation before the global) stays rejected-and-documented
(DEPLOYMENT.md's limiter cell); the N3/N4 informational notes ride the
next rotation's file list.
