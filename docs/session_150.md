# Session 150 — Batch CN (Cycle 89): the audit-driven hardening cycle — the parity-integrality + round-trip-witness + covering-index + bounded-walk set

**Received state:** `d7733c2` (the Batch CM state `cf37e36` + the operator's
two session-log commits adding `docs/session_148.md` + `docs/session_149.md`,
the s138 compact + full records). **Scope:** the audit-driven hardening
cycle per the s138 closing directive — the deep-audit axes rotated onto the
**data/import/export + entities/factory families** (the s137 axes, two
cycles stale).

## 1. The workspace + the cold baseline

The 31st workspace continuation — the sandbox reset; a fresh clone at
`d7733c2`, `bun install` (491 pkgs, foreground), `.env` re-created from the
current `.env.example` (`DATABASE_URL="file:../db/custom.db"` — the
contract, `db/` at the repo root), `db/` pushed + seeded, and
chromium-1243 RE-PROVISIONED — the reset also wiped `~/.cache/ms-playwright`,
so the first chunk-1 cert attempt failed 149× on the missing headless-shell
executable; re-run first-pass after the browser install (the honest
workspace-reset ledger: the browser cache is part of the environment, not
just `node_modules`). The toolchain: Bun 1.3.14 / Node 24.22.2 /
Playwright 1.63.0.

The cold baseline, BEFORE any work: lint ✓ · `tsc --noEmit` ✓ · unit
**1369/1369** (45 files) ✓ — the documented S138 final state exactly · the
canonical build green (the six Turbopack warnings pre-existing — the
db-path/instrumentation traces) · the cold 5-chunk e2e **597/597 —
150+184+82+95+86, every chunk first-pass** (the socket-timeout log lines the
documented machine-load noise class; the `[ai/chat] generation failed` lines
the resilience specs' own failure-injection noise). The audits ran as three
parallel read-only subagents while the chunks certified.

## 2. The audits (every H/M/L finding re-verified by direct read)

- **Mode-C (the Batch CM diff `f158877..cf37e36`): 0C/0H/1M/4L/3I — all
  NINE CM claims verified TRUE.** The findings are residuals OF the fixes:
  the M is the Docker init-profile story (the compose `init` service has
  no `user:` override, so the "still runs as root" comment is FALSE — the
  init runs as the image's bun user; the named-volume path works, a
  bind-mounted /data owned by root now fails the SQLite open at first
  boot); the L quartet is the login route's stale SUCCESS-RESET paragraph,
  the `^USER ` census that accepts `USER root`, the SKILL doc's deleted
  tooltip row, and the un-annotated S136 lesson that teaches the doctrine
  CM3 overturned; the I trio is the s138 plan's CSP prose, the undocumented
  register/login discharge asymmetry, and the stale package-lock.json
  (still pinning five CM7-removed Radix deps).
- **Audit A — data/import/export (the s137 axes, rotated back):
  0C/0H/3M/4L/5I.** The verified-clean surfaces first: the cross-user write
  model (every probe `{id, userId}` / `{id, deck:{userId}}` — no path
  updates another user's row; a foreign id falls to create → P2002 → the
  named 409), the all-or-nothing transaction, the secret guards both
  directions, SetNull + topo-sort + cycle rejection, the CL6 date band, the
  CL1 equal-times symmetry, the files.url protocol guard, auth + the
  10/15-min budgets. **A-M1** the parity contract missed six cheap route
  invariants (non-integer progress/dayOfWeek → the generic Prisma 400; a
  Float 0.5 maxScore and a negative files.size PERSIST; a 1 M-char mime
  rides FILE_METADATA into every files list GET; members item shapes
  unvalidated). **A-M2** the pin-net holes: the version FLOOR, the 409
  collision branch, the empty envelope — and **the headline: no test
  anywhere downloads the export and POSTs it back** (the S117 cards break
  would have been caught by exactly this pin). **A-M3** the
  restore-availability half (the 60 s lock-holding N+1 write loop; the
  time-bounded restore ceiling vs the unbounded export; no split tooling) —
  deferred as its own performance family. The L quartet: the catch-all
  413 (transport errors mislabeled "too large"), the folders row-index
  drift (the rejection names the SORTED index), the note-HTML Quill paste
  (a pre-existing surface — deferred with the seam named), the panel's raw
  timeout message.
- **Audit B — entities/factory (the s137 axes, rotated back):
  0C/0H/3M/5L/2I.** The verified-clean surfaces first: all 16 schemas
  field-match their models; ownership-by-construction on every write path;
  the window idioms correct everywhere. **B-M1** the CL3 cards window
  re-opened the CC10 sort class (no covering index for the ORDER BY — the
  exact class CC10 measured at 34.6 ms/100k and closed with composites on
  19 models, on the one model the census called out of scope). **B-M2**
  the hand-written card delegate's ownership guard had ZERO behavioral pins
  (the CL9 class for the one CRUD path outside the factory). **B-M3** the
  folder cycle guard read the user's ENTIRE folder table inside the PATCH
  transaction (the family's own unbounded read beside GETs bounded at 500
  for exactly the import-mint reason). The L quintet: the unbounded
  route-param id, the dead orderBy config branch, the unchecked
  txModelName resolution, the unpinned P2002/P2025/P2003 mappings, the
  CREATE-only owned-FK pin.

## 3. Live parity (both hosts)

**Clone** — `drawer-check-s14` **GREEN — the 53rd consecutive
no-Tailwind-v4-mobile-nav-bug confirmation at baseline; the 54th on the
remediated tree** (every match-check true both times; the dev daemon
started and killed inside the same command each time — the S138 lesson-5
discipline). **Reference** (logged in with the operator account): the
desktop chrome battery held — the sidebar column at **258px computed (the
standing 260px box)**, **exactly 20 nav items** with the standing labels,
the main column offset at x=260. No reference-shared surface is modified
by the CN set (every item is backend seam, test, schema-index, or
documentation), so the drawer + chrome batteries are the cycle's live
witnesses and no new reference measurement was required.

## 4. The CN set, executed TDD

RED: **18 unit + 1 e2e defect pins verified failing for the designed
reasons** + 10 coverage pins GREEN-on-arrival (the CL9/CK3 pattern — the
round-trip witness among them: the promise HOLDS, now witnessed). GREEN:
unit **1369 → 1391** (45 files), e2e **597 → 603**.

- **CN1 (M)** the parity-integrality sextet — progress/dayOfWeek
  integrality, maxScore ≥ 1, files mime ≤ 100, files size 0..2 MiB (the
  MAX_UPLOAD_BYTES mirror constant), the members item shape; the REJECTED
  sub-leg documented (chatMessages.content stays 100 K — the PERSISTED
  bound the assistant mints; the round-trip contract outranks the
  interactive bound).
- **CN2 (M)** the round-trip witness quartet — the version-floor unit leg,
  the empty-envelope and cross-account-409 e2e legs (a fresh TEST-NET
  user2 mints the fixed-id row; the demo's import answers the named 409),
  and **the headline export→import round-trip** (the demo's own export,
  posted back verbatim, created: 0 — the family's "own your data" promise
  finally exercised across all 20 collections).
- **CN3 (M)** the Flashcard `@@index([createdAt, id])` covering index (+
  the census leg + db push; [deckId] stays for the FK/cascade scans).
- **CN4 (M)** the card-delegate ownership wire pins (foreign card
  PATCH/DELETE → 404, foreign deckId POST → 404).
- **CN5 (M)** the folder cycle-guard's bounded ancestor walk (one
  findFirst per hop, the visited set, the UNCHANGED wouldCreateCycle seam;
  the AK1 e2e family re-proves the guard through the wire).
- **CN6 (L)** the typed BodyTooLargeError 413 catch. **CN7 (L)** the
  sanitize-before-sort reorder (the true row index in the rejection copy,
  e2e-pinned). **CN8 (L)** the panel's isTimeoutError branch. **CN9 (L)**
  the doc-accuracy sextet (Dockerfile + DEPLOYMENT.md §8 bind-mount note +
  login paragraph + USER-bun regex + SKILL row + AGENTS annotation +
  register-asymmetry comment). **CN10 (L)** the P2002/P2025/P2003 mapper
  trio + the owned-FK PATCH re-point leg. **CN11 (L)** the route-param
  64-char bound + the dead orderBy branch deleted + the txModelName
  resolution check + the stale package-lock.json deleted.

**The honest mid-run corrections (the full ledger is the plan's §6):** the
round-trip leg's first home 429'd behind BY5's deliberately-spent demo
export budget mid-chunk (relocated to chunk 2 — the S135/CJ class,
elevated to the S139 lesson 2); the CN7 marker re-scoped to the
deterministic over-cap form; the CE7 registry census re-tagged; two
typings caught by typecheck; the chunk-3 first re-run's two AK1 500s were
the machine-load class (standalone-clean, re-run first-pass); the capture
script's /export wait re-scoped to the panel's own headings.

## 5. The re-cert + the close

lint ✓ · tsc ✓ · unit **1391/1391** (45 files) · the canonical build green
· the cold 5-chunk e2e **603/603 — 150+185+87+95+86, every chunk
first-pass** · the register tripwire rider arithmetic exact (importers
256 → 257, Usage-line carriers 137 → 138, stale 0 — the
capture-s139-evidence.mjs rider; the 50th consecutive hold) · the drawer
check GREEN (**the 54th consecutive**) · three evidence frames in
`docs/screenshots/139-clone-*.png` (desktop, mobile drawer, the /export
portability panel — self-verifying waits). **Census: 1391 unit + 603 e2e =
1994 green.** The docs set: README (badge 1994 + the S139 row), AGENTS (the
census anchors + the S136 annotation + the S139 lessons), PAD **v1.3.47**
(the revision block + the §8.1 re-count), the SKILL doc, the vitest header,
the cert re-tags (Expected 603 + the tripwire), the plan §6, this record,
and the worklog entry.

**Deferrals:** A-M3 (the restore-availability family), A-L3 (the note-HTML
sanitization — both entry points, its own cycle), A-I2/I3/I4/I5, B-I1,
MC-I1 (corrected in this cycle's docs), and the standing s133–s138 set.
**Next cycle:** the FE/views + auth/crypto/infra axes (the s138 axes, two
cycles stale by then), or the A-M3 restore-availability performance cycle.
