# Remediation Plan — Session 120 / Batch BU (Cycle 70)

**Status: COMPLETE** (executed TDD-style 2026-11-01; the verification record is §4 below)
**Date:** 2026-11-01 · **Workspace:** fresh clone at `da5942d` (the Batch BT state + the
operator's `docs/session_109.md`/`docs/session_110.md` transcripts) · **Operator-directed
audit + remediation session**

---

## 0. Scope and Method

The operator directed the standing rhythm: refresh the workspace (`git clone` — the sandbox
was reset — landing at `da5942d`, clean), re-read the full doc chain (`AGENTS.md`,
`CLAUDE.md`, `README.md`, `PAD`, `omni-study1_SKILL.md`, `docs/session_109.md`,
`docs/session_110.md`, `docs/remediation-plan-session119.md`, `worklog.md` — README/PAD and
the SKILL doc/master plan digested via two parallel read-only subagents while AGENTS.md was
read direct), re-validate against the codebase, audit with the repo skills as rubrics
(`skills/web-application/SKILL.md` §5/§6/§7/§14/§16/§17/§20 for the API audit, §8/§9/§12/§13
for the frontend audit; `skills/` excluded from checking/testing/compilation — verified:
tsconfig/eslint/vitest all exclude it), iterate on visual + functional parity with
`https://omni-study1.base44.app/` (the mobile navigation menu the named focus, Tailwind v4
the named suspicion class), keep the repo a production-ready functional SUPERSET, verify the
`.env`/`db/` contract and the vitest + playwright suites, plan remediation for everything
found, execute with TDD (RED → GREEN), capture evidence, update the docs chain, and commit +
push to `main` via the SSH wrapper.

Method (the six-phase workflow): ANALYZE → PLAN (this document) → VALIDATE (every finding
re-verified by direct read + live probe BEFORE planning the fix) → IMPLEMENT (smallest safe
diff, TDD) → VERIFY (cold re-cert) → DOCUMENT.

**Baseline established BEFORE any change (all green, cold):**

| Gate | Result |
|---|---|
| `bun run lint` / `bun run typecheck` | 0 errors (`noImplicitAny` on) |
| `bun run test` (Vitest) | **990/990**, 31 files |
| `bun run build` | clean; standalone assembled; bundled `.env` carries `AUTH_SECRET=""` (the s22 contract); the ADR-020 Edge-Runtime boot-guard warning the only stderr line |
| `bun run test:e2e` (cold 5-chunk map, fresh `db/e2e.db`) | **488/488** (133 + 142 + 60 + 89 + 64) — NOTE: the first cert launch failed 100% on INFRASTRUCTURE (the fresh sandbox lacked the Playwright browser binary — `chromium_headless_shell-1243` absent; `bunx playwright install chromium` remedied it; the re-run was fully green. The infrastructure-failure-vs-source-debt classification per the Appendix-B lesson-2) |
| Register re-derivation (the pin's own regex, instrument-identical) | **249 importers / 130 Usage-line carriers / 0 stale / 119 usage-line-free** — the 21st consecutive hold |
| Mode-C audit of the Batch BT diff (`80298b5` + `d024631` + `da5942d`) | 64 files / +1870/−211; every spot-checked claim verified TRUE against the tree (BT1a/BT2 seams in `http.ts`, BT3 conditional consumption, BT6 composer, the sanitizeImportRow guard); zero key material (the 64-hex + delimiter sweeps on src/scripts/tests empty); the 6 s119 evidence frames present |

**Live parity re-verification (both hosts, agent-browser + DOM probes):**

- Reference (the probe account, 2026-11-01): **unlabeled hamburger**; **no `role=dialog`**;
  **24 visible links** drawer-open; `/Notes` `scrollWidth 416 > 390` (its own overflow
  defect, re-confirmed); landscape drawer nav `scrollHeight 992 > 290`; drawer backdrop
  `blur(4px)`. **No NEW parity gap; no Tailwind v4 mobile-nav bug — s120 re-confirmed (the
  21st consecutive live confirmation).**
- Clone: labeled hamburger (`aria-label="Open navigation menu"` + `aria-expanded`);
  `role="dialog"` + `aria-label="Navigation menu"`; **26 visible links**; `/Notes` clean at
  390 (`390 = 390`); landscape nav `992 > 301`; **the BS4 focus lifecycle re-verified live
  with a real keyboard flow** (burger `focus()` → Enter → focus lands on the panel's "Close
  menu" button → Escape → dialog gone + focus restored to the hamburger); **scroll
  persistence parity re-verified** (600 px carried /Dashboard → /Analytics onto the 2584 px
  page — identical to the reference's measured carry; a 600 px scroll onto the 844 px
  /Tasks page clamps to 0 by the browser, not a defect).

**Parity decisions this session (the DOM-authority rule — measured on the reference BEFORE
any fix was planned):**

- **P1 (F5 — the delete-confirmation question — a documented NON-GAP).** The auditor
  recommended confirmation dialogs on the unconfirmed destructive deletes. Measured on the
  reference: the task row's ellipsis → **Delete menuitem fires IMMEDIATELY — no
  confirmation dialog, the task is gone** (the probe task vanished with zero intermediate
  chrome). The clone's instant deletes (Tasks/Events/Exams/Assignments/Notes/Flashcards)
  ARE parity; the MyDay `DeleteConfirm` is a shipped superset affordance, not a debt. The
  reference's own add-dialog Cancel matrix (P3) shows the same per-surface variance — the
  reference is the contract, not internal consistency.
- **P2 (F11 — the Radix Select nested in the Notes "Move to notebook" DropdownMenu — a
  documented NON-GAP).** The auditor flagged the nested-portal pattern as a fragility risk
  (Reasoned, not runtime-verified). Verified LIVE on the clone: the dropdown opens, the
  nested Select trigger opens its option list, the pick applies (the select's value flips to
  the picked notebook while the menu stays open), Escape closes the layer cleanly. The
  pattern functions end-to-end; no e2e covers it (noted — the surface is a superset control
  the reference lacks entirely, so no parity pin applies).
- **P3 (F12 — the dialog Cancel matrix — THREE REAL GAPS).** Measured per-dialog on the
  reference (button census inside each `[role=dialog]`): **Tasks "Add Task" HAS Cancel**
  (clone matches ✓); **Events "New Event" has NO Cancel** (submit + Close — clone matches
  ✓); **Flashcards "New Deck" has NO Cancel** (clone matches ✓); **Study Groups "Create
  Group" has NO Cancel** (clone's Cancel = a benign superset affordance, kept);
  **Practice Tests "Create Test" has NO Cancel** (clone's Cancel = benign superset, kept);
  **Exams "Add Exam" HAS Cancel** — the clone LACKS it → **GAP**; **Assignments "Add
  Assignment" HAS Cancel** — the clone LACKS it → **GAP**; **Timetable "Add Class" HAS
  Cancel** — the clone LACKS it → **GAP**. The fix adds Cancel to exactly those three
  dialogs.
- **P4 (F17 — the exam badge families — a REAL parity gap + REFERENCE DRIFT).** Measured on
  the reference with two live-created exams (today + 12 days out):
  - **Dashboard**: the Today badge reads **"Today!"** on `bg-red-100 text-red-600`
    (`rgb(254,226,226)/rgb(220,38,38)`); the 12-day badge reads **"12d"-form ("11d") on
    `bg-slate-100 text-slate-600`** (`rgb(241,245,249)/rgb(71,85,105)`) — the NEUTRAL slate
    family. The clone renders **every dashboard exam badge `sf-pill-red`** with labels
    "Today"/"Tomorrow"/"Nd" — the non-today badges are a parity GAP (red vs the reference's
    slate) and the "Today" label misses the measured "Today!".
  - **Exams view**: the reference's card badge for the 12-day exam reads "11 days" on
    **`bg-blue-100 text-blue-600`** — the **BLUE family**, NOT the yellow-100/yellow-700
    family the S76/AC7 pin measured and the clone ships. This is **REFERENCE DRIFT** (the
    live app changed its ≥2-bucket badge color between S76 and now). Per the re-crawl
    doctrine (Appendix A lesson 6: "specs age between sessions") and the DOM-authority
    rule, the clone follows the CURRENT reference: the ≥2 bucket moves to the blue family.
    The AA check: blue-600 on blue-100 = **4.24:1 (fails AA)** — the repo's
    one-step-darker-for-AA precedent (red-600→red-700 at S92/AS1; yellow-700 at S76)
    applies: **blue-700 on blue-100 = 5.49:1, AA-clean** — element parity (the blue family)
    + the AA superset (700-weight text), exactly the sf-pill-red shape. The two AC7 pins
    (parity-session6:258, parity-session8:1227) re-anchor to blue (the BS7 re-anchor
    precedent). `sf-pill-yellow` keeps its other consumers (the flashcards difficulty pill
    + the dashboard assignments priority pill — their own measured surfaces).
    The Tomorrow bucket could not be re-measured this session (the reference's date picker
    rejected the probe twice); the clone's sf-pill-orange stays (its own measured era),
    flagged for the next rotation.
- **P5 (F3's flashcards:381 — a color-pinned NON-GAP).** The "Click card to flip" hint's
  slate-400 IS a measured parity pin (parity-session7:645-648: `rgb(148,163,184)` —
  "measured"); the light-mode AA recommendation is a documented non-gap (the Q1/Q2
  precedent). The other F3 sites (no color pins) get the fix.

---

## 1. Audit Findings (every one verified by direct read + live probe — Mode C)

Sources: two parallel deep audits (API/security against the §5/§6/§7/§14/§16/§17/§20
rubrics; frontend/quality against the §8/§9/§12/§13 rubrics), then per-finding verification
(by direct read; the functional ones reproduced live). Auditor items the reference
measurement disproved or the repo already documents are recorded as non-gaps (P1/P2/P5
above; I-level trio below), not defects.

| ID | Severity | The finding (verified) | The evidence |
|---|---|---|---|
| BU1 | **High (functional)** | The Files `FolderDialog` is missing the key-remount its own state-initializer comment claims — `useState(folder?.name ?? "")` captures the FIRST mount's props forever, so the Rename dialog opens with the PREVIOUS session's name (REPRODUCED LIVE: create "S120 Folder Alpha" → create "S120 Folder Beta" → click Rename on **Alpha** → the dialog shows **"S120 Folder Beta"**; a Save silently renames Alpha to Beta — a data hazard. The New Folder dialog also re-opens pre-filled with the stale name). | `src/components/views/files-view.tsx:573-578` (the render site — no `key`) vs `:109-110` (the initializer + its "parent key-remount" comment); the live repro sequence above; every sibling dialog carries the key (`tasks-view.tsx:775`, `settings-view.tsx:822`, `studygroups-view.tsx:475`, `practicetests-view.tsx:793`). |
| BU2 | **High (security, closes a documented reopen trigger)** | The PAD §6.4 documents the in-response OTP/reset delivery posture with the reopen trigger "a multi-user deployment needs real mail transport + **off-switches**" — but no off-switch exists anywhere (grep `DISABLE_IN_APP\|SMTP\|mailer` → comments only). The forgot route returns the live `resetUrl` and register/resend return the OTP `code` to whoever asks. | `src/app/api/auth/forgot-password/route.ts:59-64`; `register/route.ts:75,93`; `resend-verification/route.ts:53`; the web-application skill §16 ("In-app OTP/reset delivery OFF in production — mandatory"); PAD §6.4's own trigger text. |
| BU3 | **Medium (security, closes a documented reopen trigger)** | `clientIp()` trusts the raw FIRST `x-forwarded-for` hop — the PAD §6.4 documents the reopen trigger ("an Internet-facing deployment behind a reverse proxy must adopt a declared proxy-hop depth") but no depth declaration exists; every per-IP budget (login 10, verify 20 — the ONLY throttle on the 6-digit OTP space, forgot 10, reset 10, register 10) is bypassable with a per-request forged XFF. | `src/lib/server/auth.ts:156-160`; the app's own e2e weaponizes it (`auth-flows.spec.ts:252` — XFF `192.0.2.117` for a virgin verify budget). |
| BU4 | **Medium (data integrity)** | The RUM upsert is not user-scoped: `RumEvent`'s unique is `@@unique([sessionId, metric])` (GLOBAL) and the beacon POST's update leg carries no `userId` — user B posting user A's `sessionId+metric` OVERWRITES A's row (the one write path in the app violating the ownership-by-construction invariant; the AP-120 class at the RUM site). The PAD carries it as an accepted-Low with the trigger "reopen if sessionIds become guessable" — the fix is cheap and closes the row properly. | `src/app/api/rum/route.ts:40-61`; `prisma/schema.prisma:442`. |
| BU5 | **Medium (doc/code drift + DoS)** | `GET /api/rum/export` reads ALL the user's RumEvents (no `take`) while AGENTS.md:106 documents "streams the user's most recent **2000** events" — the cap does not exist in code. Unbounded CSV assembly in memory on the single-node SQLite deployment. | `src/app/api/rum/export/route.ts:19-22` vs AGENTS.md:106. |
| BU6 | **Medium (resource leak)** | The rate-limiter `buckets` Map is never evicted — every distinct key (every IP, and via BU3 every forged XFF string) creates a permanent entry; a remotely-driven unbounded memory leak on a public deployment. | `src/lib/auth.ts:118-140` (insert without sweep; `resetRateLimit` deletes only on demand). |
| BU7 | **Medium (parity, P4a)** | The dashboard exam badges render `sf-pill-red` for EVERY distance while the reference ships red for Today and the NEUTRAL slate family (`bg-slate-100 text-slate-600`) for the rest; the clone's "Today" label misses the measured "Today!". | `src/components/views/dashboard-view.tsx:335,350` vs the P4 measurements. |
| BU8 | **Medium (parity, P4b — reference drift)** | The exams-view ≥2-days urgency badge ships the S76-measured yellow family while the CURRENT reference renders the BLUE family (`bg-blue-100 text-blue-600`, measured `rgb(219,234,254)/rgb(37,99,235)` on an 11-day exam) — the live reference drifted; the clone follows. | `src/components/views/exams-view.tsx:55-63`; the P4 measurement; the pins `parity-session6.spec.ts:258-269` + `parity-session8.spec.ts:1227-1245`. |
| BU9 | **Medium (parity, P3)** | The Exams, Assignments, and Timetable dialogs lack the Cancel button the reference carries (measured in all three); Tasks/Events/Flashcards match. | `exams-view.tsx:528-533`; `assignments-view.tsx:482-487`; `timetable-view.tsx:628-632`; the P3 matrix. |
| BU10 | **Medium (a11y, systemic)** | **51 `text-slate-500` body-text sites with no `dark:text-slate-400` pair** (census re-derived with the exact-class scan — the audit's count confirmed) — dark-mode contrast ~4.0:1, below AA, against the codebase's own 82-paired convention. | The census list (settings ×12, practicetests ×12, studygroups ×5, notes ×4, timetable ×3, analytics ×2, aiassistant ×2, mathsolver ×2, files ×2, calculator ×2, + singles). |
| BU11 | **Medium (a11y)** | The inverse family: **8 text sites shipping `text-slate-400`-on-light** (2.56:1 — the repo's own documented axe-failure value; sidebar.tsx:81 deliberately avoids it): the calendar's two empty hints, myday's "Nothing to suggest", flashcards' "No decks yet."/"Select a deck.", studygroups' "Select a group" pane variant, the aiassistant Enter-hint, the rum-panel caption + table headers. | `calendar-view.tsx:145,326`; `myday-view.tsx:310`; `flashcards-view.tsx:450,591`; `studygroups-view.tsx:371`; `aiassistant-view.tsx:232`; `rum-panel.tsx:117,207`. (flashcards:381 excluded — P5.) |
| BU12 | **Medium (a11y)** | The practicetests True/False container carries `role="radiogroup"` whose owned children are `aria-pressed` BUTTONS — an ARIA required-children violation (a radiogroup requires radio descendants); the MC sibling uses real radios correctly. | `practicetests-view.tsx:613-625`. |
| BU13 | **Medium (a11y)** | The timed-test expiry auto-submit is silent to assistive tech — the countdown hitting zero swaps the entire view to the results screen with no `aria-live` announcement (the S14 contract's own pattern class, implemented at mathsolver/aiassistant). | `practicetests-view.tsx:473-486,495`. |
| BU14 | **Low (enumeration)** | The register route's response shapes split account states: existing-verified → `200 {ok}` (no code), existing-unverified → `200 {ok, code}`, new → `201 {ok, code}` — the 201-vs-200 split and the code-presence split each distinguish account states, contradicting the route family's own no-enumeration discipline (login is uniform). Resend-verification carries the same code-presence split. | `register/route.ts:60,75,93`; `resend-verification/route.ts:53,57`. |
| BU15 | **Low (security, doc/code drift)** | The session-cookie `Secure` flag derives from `request.nextUrl.protocol` — behind a TLS-terminating proxy (the documented Docker posture) the upstream request is plain HTTP → the cookie ships without `Secure` over the public HTTPS origin. DEPLOYMENT.md:28 instructs operators to forward `X-Forwarded-Proto` — but NO code reads that header (grep: zero matches) — the documented mitigation does nothing. | `login/route.ts:64`; `verify-email/route.ts:85`; DEPLOYMENT.md:28. |
| BU16 | **Low (security headers)** | No security headers anywhere (no `headers()` in next.config.ts, no middleware): the authenticated SPA is framable (clickjacking on the destructive surfaces), no `nosniff` at the page level, no Referrer-Policy. | `next.config.ts` (no headers block — grep verified). |
| BU17 | **Low (a11y polish)** | (a) The calculator unit-select labels dangle (`htmlFor="unit-from"/"unit-to"` point at ids that never exist — the triggers are aria-labeled instead); (b) the flashcards raw `<textarea>`s hand-roll classes instead of the shared `Textarea` primitive; (c) the flashcards icon-button names are generic ("Edit card"/"Delete card" on repeated rows — the repo convention is `Edit ${name}`); (d) the login reset-success renders through the error channel (`role="alert"` red) — a status, not an alert; (e) the rum-panel rating-badge fallback is light-only. | `calculator-view.tsx:656-671` vs `:611-624`; `flashcards-view.tsx:774-792`; `:657,665,838,846`; `login-surface.tsx:181`; `rum-panel.tsx:162,231`. |
| BU18 | **Low (dead code)** | The tasks-view `AlertDialog` + 8 sub-component imports are dead (the remnant of the never-shipped delete-confirm) — corroborates P1 (the confirm was deliberately NOT shipped; the imports should have gone with it). | `tasks-view.tsx:26-34` (imported; zero other usages in the file). |
| BU19 | **Low (design system)** | The §12 base-layer `button, [role="button"] { cursor: pointer }` rule is missing (Tailwind v4 preflight sets none) — only three ad-hoc `cursor-pointer` utilities exist. | `globals.css:318-331` (the base layer carries only `*`/`html`/`body`); the web-application skill §12 line 282. |
| BU20 | **Low (unpinned palette steps)** | Eight chart-adjacent sites ride unpinned palette steps (trap 2/10 — the oklch drift class the repo fixed at S80/S92): `dark:bg-violet-950`, `dark:bg-blue-900/50`, `dark:bg-green-900/50`, `dark:bg-orange-900/50`, `dark:border-emerald-800`, `dark:border-red-800`, `text-neutral-400`, `hover:text-cyan-300`. | `shared.tsx:307`; `analytics-view.tsx:395,402,409`; `practicetests-view.tsx:514`; `notes-view.tsx:729`; `events-view.tsx:305`. |
| BU21 | **Low (deployment hygiene)** | The documented Docker first-run (`init` profile) seeds `demo@studyflow.app / Demo1234!` (verified, `emailVerified: true`) into the production `/data` volume with no warning and no off-switch — an operator following DEPLOYMENT.md ships a live public-credentials login. | `prisma/seed.ts:13-14`; `docker-compose.yml:48-50`; DEPLOYMENT.md:113-115. |
| BU22 | **Info (fixed in passing)** | (a) `eventSchema` accepts `endDate < startDate` (no ordering refine); (b) the validation.ts `deckId` comment claims route-injection that is not the route's shape; (c) expired VerificationToken/PasswordResetToken rows are never pruned (unbounded-but-slow auth-table growth); (d) the z-index scale is documented nowhere; (e) `typescript.ignoreBuildErrors: true` in next.config.ts (the local `typecheck` gate covers it — test the removal). | `validation.ts:203-213,244-247`; the token routes; AGENTS.md conventions; `next.config.ts:10-12`. |
| I-1 | **Info (documented, no fix)** | The CRUD write endpoints are unthrottled — the ACCEPTED single-user posture (payloads schema-bounded at a few KB; the S118/BS3 upload bucket rationale was payload-size abuse, not row creation; a per-user CRUD bucket would trip the e2e suite's own documented creation volume — the import round-trip alone writes 71 rows). Documented here as the accepted decision, per the auditor's own alternative. | The L3 finding + the s23 import pin's 71-row write. |
| I-2 | **Info (documented, no fix)** | The audit's H1 framing ("account takeover by anyone who can reach the API") describes the DOCUMENTED ADR-013 self-hosted single-user posture (the PAD §6.4 row + `src/lib/auth.ts:74-79`'s own possible-attacker comment) — the actionable part is the missing off-switch (BU2), not the posture itself. | PAD §6.4; ADR-013. |

---

## 2. The Fixes (TDD: RED → GREEN; the smallest safe diff)

- **BU1 — the FolderDialog key-remount.** `key={folderDialogOpen ? `open-${renamingFolder?.id ?? "new"}` : "closed"}` on the `<FolderDialog>` render (the sibling idiom verbatim). RED: an e2e pin driving the REAL UI flow — create folder A, create folder B, open Rename on A, the input value must be A's name (pre-fix it shows B — the live-reproduced discriminator).
- **BU2 — the in-band delivery off-switches (the production gate).** A pure seam `src/lib/server/delivery.ts`: `inAppDeliveryDisabled(kind)` reading `DISABLE_IN_APP_OTP` / `DISABLE_IN_APP_RESET` (both documented in `.env.example` + PAD §6.4 — the reopen trigger closes). When the gate is ON: register/resend responses omit `code`; forgot omits `resetPath`/`resetUrl` (the response stays `200 {ok:true}` — the no-enumeration shape). Default OFF = the current single-user dev/demo posture (every existing pin untouched). RED: unit pins on the seam + the route response shapes under the env.
- **BU3 — the declared proxy-hop contract.** `clientIp(request)` gains the `TRUSTED_PROXY_HOPS` dimension: unset → the documented first-hop single-node posture (unchanged — every e2e XFF pin keeps its semantics); `0` → the direct connection only (XFF ignored); `N≥1` → the Nth-from-right XFF hop, FAILING CLOSED to the direct address when the header is missing/short (a spoofed header can never widen the key). RED: unit pins on the pure extraction seam (unset/0/1/2/short-header/forged-longer-header).
- **BU4 — the RUM upsert user-scoping.** The schema's unique becomes `@@unique([userId, sessionId, metric])` + the upsert `where` carries the compound; `db push` re-applies (dev/e2e databases — additive for existing rows). RED: an e2e pin on the s18 pattern — the demo user's beacon row, then a fresh TEST-NET user posting the SAME sessionId+metric → the demo row's value is unchanged (pre-fix the update leg overwrites).
- **BU5 — the export cap.** `take: 2000` on the export `findMany` (the documented AGENTS.md contract — the code now matches the doc). Verified live via curl (the probe row count stays exact under the cap).
- **BU6 — the limiter eviction.** A lazy sweep in `checkRateLimit`: when `buckets.size` crosses a cap (2,048), delete every expired-window bucket before inserting (bounded memory, no timers, no behavior change for live windows). RED: unit pins (the sweep clears expired buckets; live-window buckets survive; the size is bounded across many distinct keys).
- **BU7 — the dashboard badge parity.** The badge family: `diff === 0` keeps `sf-pill-red` + the label "Today!" (the measured form); every other distance renders the neutral slate pill (`bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300` — the measured light values + the superset dark pairs; the exams-view Past pill's own idiom). RED: e2e pins — the seeded today-exam badge is the red family; a far exam's badge is the slate family (the seeded demo carries both distances).
- **BU8 — the exams-view ≥2 badge follows the drifted reference.** A new `sf-pill-blue` utility (`--color-blue-100` bg / `--color-blue-700` text — the measured blue-100 + the AA-clean 700-weight text per the one-step-darker precedent, 5.49:1; blue-100/blue-700 pinned in `@theme` — closing BU20's blue-900 unpinned consumer too); the `urgency()` ≥2 leg swaps `sf-pill-yellow` → `sf-pill-blue`. The TWO AC7 pins re-anchor to the blue family (the BS7 re-anchor precedent — the pins carry the measured contract). `sf-pill-yellow` keeps its flashcards/assignments consumers.
- **BU9 — the three Cancel buttons.** Exams, Assignments, Timetable dialogs gain `<DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>` (the tasks-view idiom — the measured reference shape). RED: e2e pins — each dialog's Cancel closes without creating (the row count unchanged).
- **BU10 — the 51-site dark-pair sweep + the guard.** RED FIRST: a new `tests/hue-pairs.test.ts` — a source-scan guard flagging every `text-slate-500`/`text-slate-400` className without a `dark:text-slate-` sibling (the exact-class scan this session's census ran; a documented exception list for color-pinned parity sites — flashcards:381). The guard ships RED listing the 51, then the sweep pairs them all (GREEN). The guard makes the class self-enforcing (the hue-tokens doctrine extended to the slate text family).
- **BU11 — the 8 light-mode slate-400 text sites.** Each flips to the paired family (`text-slate-500 dark:text-slate-400` — the sibling-branch idiom at studygroups:365). The BU10 guard subsumes them (no dedicated pins; the a11y/dark-mode specs re-certify).
- **BU12 — the True/False container.** `role="radiogroup"` → `role="group"` (the aria-required-children violation closes at the minimal diff; the aria-pressed buttons stay — the documented I-B superset semantics).
- **BU13 — the expiry announcement.** An `aria-live="polite"` region announcing "Time is up — your test was submitted" on the countdown-zero transition (the S14 pattern; focus unchanged — the results heading is the next tab stop).
- **BU14 — the uniform register/resend shapes.** Register: every branch answers `200` (the 201/200 split closes; the `code` presence stays gated by BU2 — in hardened deployments ALL branches are shape-identical, closing the oracle where it matters). RED: the auth-flows register pin re-anchored to 200 + a shape pin.
- **BU15 — the Secure-flag derivation.** A pure seam `deriveSecureFlag(request)`: `x-forwarded-proto === "https"` → secure; no header → the request protocol (the current behavior). Login + verify-email consume it. DEPLOYMENT.md's X-Forwarded-Proto instruction becomes TRUE. RED: unit pins on the seam (proxy-https, proxy-http, no-header-http, no-header-https).
- **BU16 — the security headers.** `next.config.ts` gains the `headers()` block: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin` on every route (HSTS documented as the TLS-at-app posture's addition — the Docker posture terminates TLS upstream). RED: an e2e pin asserting the three headers on a page response.
- **BU17 — the polish set.** (a) The calculator unit-select triggers gain `id`s (the dangling `htmlFor`s bind); (b) the flashcards textareas swap to the shared `Textarea` primitive; (c) the four generic icon-button names carry the entity (`Edit card ${front}` / `Delete card ${front}` / `Edit deck ${name}` / `Delete deck ${name}` — the §13 convention); (d) the login reset-success renders through a status shape (not the red `role="alert"`); (e) the rum-panel fallback badge + header text gain their dark pairs.
- **BU18 — the dead imports.** The tasks-view AlertDialog import block removed (lint-verified clean).
- **BU19 — the cursor rule.** `button, [role="button"] { cursor: pointer; }` in `@layer base`; the three ad-hoc `cursor-pointer` utilities removed.
- **BU20 — the unpinned steps.** The eight sites move onto pinned steps: violet-950/blue-900/green-900/orange-900/emerald-800/red-800/neutral-400/cyan-300 pinned in `@theme` (the single source) — the S92/AS1 doctrine.
- **BU21 — the demo-seed gate + the warning.** `prisma/seed.ts` honors `SEED_DEMO` (default `1` — every documented flow unchanged: dev quickstart, e2e global-setup, the Docker init profile); DEPLOYMENT.md documents `SEED_DEMO=0` + the remove-the-demo-account step for exposed deployments; `.env.example` carries the note.
- **BU22 — the smalls.** (a) `eventSchema` gains the `endDate >= startDate` refine (unit-pinned; the dialogs' clear-date path unaffected — the S118/BS2 union lesson re-checked); (b) the stale `deckId` comment corrected; (c) the register/forgot routes opportunistically `deleteMany` the account's expired tokens (bounded auth tables); (d) the z-index scale documented in AGENTS.md conventions; (e) `ignoreBuildErrors` removal TESTED — kept only if the canonical build stays green (else documented).

**Guardrails held:** no test weakened (the two AC7 re-anchors follow the measured contract — the BS7 precedent; every other pin is additive); no lint/type rule loosened; `noImplicitAny` stays on; the s117–s119 pins ride untouched (the register journey's `reg.ok()` survives the 200-uniform change; the XFF e2e pins keep their semantics under the unset-hop default).

---

## 3. Verification Plan (the FINAL tree)

1. lint + typecheck clean; the Vitest census grows by the new pins (RED-first verified).
2. The canonical build green (the bundled-`.env` contract intact; `ignoreBuildErrors` outcome recorded either way).
3. `bun run db:push` re-applies the RUM unique (dev + a fresh e2e db).
4. The cold 5-chunk e2e re-cert with the new census re-tagged in `scripts/e2e-chunked-cert.sh` (the re-tag lands BEFORE the launch — the s119 lesson).
5. Live curl verification on :3000 — the delivery gates (otp/reset envs on → the code/resetUrl absent), the proxy-hop keying (unset = first hop; declared depths), the rum/export cap (the probe row count), the headers (the three security headers on /), the BU1 rename round-trip (the UI flow).
6. Evidence frames: `docs/screenshots/120-clone-*` (post-change: the dashboard badge families, the exams blue badge, a Cancel dialog, the rename dialog) — md5-distinct, DOM-verified states.
7. `.env.example` verified current (the new envs documented); the docs chain re-anchored (README badge + the Session-120 row, AGENTS census + the S120 lessons + the z-index scale, CLAUDE seam tail, vitest header, PAD v1.3.28 + §6.4 rows, the cert-script census, the master remediation-plan header → Batch BU, the SKILL doc's census re-anchor + the AP-124.. lessons); the worklog entry + `docs/session_111.md` (the structured record, titled "Session 121"); commit + push to `main` via the SSH wrapper.

---

## 4. The Verification Record (executed)

**TDD discipline.** RED first: **40 failing unit pins** (client-ip +14, delivery-gate +6,
secure-cookie +6, hue-pairs +2, seed-gate +5, auth eviction +2, validation event-ordering +5 —
the hue-tokens additions ride the existing pins) and **9 e2e pins** (BU7 dashboard badges,
BU9 exam/class/assignment Cancel ×3, BU1 rename prefill, BU13 expiry aria-live, BU14 register
uniform-200, BU16 headers, BU4 RUM user-scoping), every pin verified RED for the right reason
on the pre-change tree, then the source, then GREEN. **Unit census 990 → 1030 (36 files)**;
**e2e census 488 → 497** (135+145+61+90+66). Guardrails held: no test weakened, no lint/type
rule loosened, `noImplicitAny` on, the s117–s119 pins untouched.

**The BU set — all items landed:**

- **BU1 — DONE.** The `key={folderDialogOpen ? \`open-${renamingFolder?.id ?? "new"}\` : "closed"}`
  remount at the FolderDialog render site (the sibling idiom). Live-verified BOTH directions
  (create Alpha → create Beta → Rename Alpha shows **Alpha**; the reverse order shows Beta);
  e2e-pinned in resilience (the rename-prefill journey); the probe state cleaned up.
- **BU2 — DONE.** `inAppDeliveryGates(env)` in env-check (DISABLE_IN_APP_OTP/RESET, "1"/"true"
  case-insensitive); register/resend/forgot consume it (the code/resetUrl omitted when gated —
  the shape-identical no-enumeration form); unit-pinned ×6; `.env.example` + DEPLOYMENT.md §3
  carry the operator note.
- **BU3 — DONE.** `parseTrustedProxyHops` + `clientIpFromForwarded` in server/auth (unset → the
  legacy first hop; 0 → never trust; N≥1 → the Nth-from-right, FAILING CLOSED on short/missing
  headers; unparsable → 0); unit-pinned ×14; the env documented (`.env.example` + DEPLOYMENT.md
  §2/§3); the PAD §6.4 proxy-hop reopen trigger closed.
- **BU4 — DONE.** The `RumEvent` unique widened to `@@unique([userId, sessionId, metric])` +
  the upsert `where` carries the compound; `db push` re-applied (dev + e2e fresh); e2e-pinned
  (the second user's same sessionId+metric never touches the first user's row).
- **BU5 — DONE.** `take: 2000` on the rum/export findMany — the AGENTS.md:106 documented
  contract now true in code.
- **BU6 — DONE.** The lazy sweep at the 2,048-bucket cap (expired windows deleted before the
  insert; live windows survive); the `rateLimiterBucketCount` size observable + the
  `drainRateLimiterBuckets` test/ops drain exported; unit-pinned ×2.
- **BU7 — DONE.** The dashboard badge family per the live reference measurement: `diff===0`
  keeps sf-pill-red + the measured **"Today!"** label; every other distance renders the neutral
  slate pill (bg-slate-100/slate-600 + the superset dark pairs). E2e-pinned (self-owned-data:
  the today-exam created through the API, both families asserted, finally-cleanup).
- **BU8 — DONE.** The new `sf-pill-blue` utility (blue-100 bg / **blue-700** text — the AA
  superset at 5.49:1, the reference's own blue-600 measures 4.24:1; blue-100/blue-700 pinned
  in @theme — closing BU20's blue-900 unpinned consumer family too); the `urgency()` ≥2 leg
  swapped yellow → blue; the AC7 pins re-anchored to the blue family; the hue-tokens census
  updated coherently (FAMILY_STEPS + UTILITY_CONTRACT + CONSUMERS); the stale
  sf-pill-yellow comment healed.
- **BU9 — DONE.** The three Cancel buttons (Exams/Assignments/Timetable dialogs, the
  DialogClose+outline idiom); e2e-pinned ×3 (Cancel closes, the row count unchanged).
- **BU10 — DONE.** The 51-site `text-slate-500` dark-pair sweep + the machine guard
  (`tests/hue-pairs.test.ts` — every static slate text site carries its dark sibling; the
  documented exception list for color-pinned parity sites).
- **BU11 — DONE.** The 8 slate-400-on-light sites flipped to the paired family (subsumed by
  the BU10 guard).
- **BU12 — DONE.** The True/False container `role="radiogroup"` → `role="group"` (the
  aria-required-children violation closed at the minimal diff).
- **BU13 — DONE.** The countdown-zero transition announces "Time is up — your test was
  submitted" through an `aria-live="polite"` region; e2e-pinned.
- **BU14 — DONE.** Register answers 200 on every branch (the 201/200 enumeration split
  closed); e2e-pinned (the same-200 shape pin).
- **BU15 — DONE.** `secureCookieFlag(xForwardedProto, protocol)` in auth — the DEPLOYMENT.md
  X-Forwarded-Proto instruction is now true in code; login + verify-email consume it;
  unit-pinned ×6.
- **BU16 — DONE.** The `headers()` block in next.config.ts (nosniff / X-Frame-Options: DENY /
  Referrer-Policy: strict-origin-when-cross-origin on every route; HSTS documented as the
  TLS-at-app addition). **Live-verified on the standalone production server**: all three
  headers on /login AND on the API routes (the 400 login-validation and the 401 RUM responses
  both carry them); e2e-pinned.
- **BU17 — DONE.** (a) the calculator unit-select ids bound; (b) the flashcards textareas on
  the shared Textarea primitive; (c) the four icon-button names carry the entity; (d) the
  login reset-success rides the emerald `role="status"` channel (InlineStatus); (e) the
  rum-panel fallback badge + headers dark-paired.
- **BU18 — DONE.** The tasks-view AlertDialog dead-import block removed.
- **BU19 — DONE.** The `button, [role="button"] { cursor: pointer }` base rule; the three
  ad-hoc cursor-pointer utilities removed.
- **BU20 — DONE.** The eight unpinned steps pinned in @theme (violet-950/blue-900/green-900/
  orange-900/emerald-800/red-800/neutral-400/cyan-300).
- **BU21 — DONE (caught by the docs-phase re-derivation — the S120 lesson-4).** The
  `shouldSeedDemo(env)` fail-safe gate in env-check + the seed.ts wiring; **live-verified both
  directions** (SEED_DEMO=0 → "the demo account is SKIPPED", users=0 on a scratch db; unset →
  seeded, users=1 — every documented flow unchanged); unit-pinned ×5; DEPLOYMENT.md §8 note +
  §3 env row; `.env.example` carries the block.
- **BU22 — DONE.** (a) the eventSchema endDate≥startDate ordering refine (via the restructured
  create/update schemas — the Zod-4 `.refine()`-wraps-`.partial()` incompatibility avoided);
  (b) the deckId comment corrected to the route's real shape; (c) register/forgot
  opportunistically prune the account's expired tokens; (d) the z-index scale documented in
  AGENTS.md Conventions (five layers, ascending); (e) `ignoreBuildErrors` REMOVED — the
  canonical build is now the type gate (green, exit 0).
- **I-1 / I-2 — documented** (the accepted single-user CRUD posture; the ADR-013 delivery
  posture with its BU2 off-switch now shipped).

**The honest mid-run corrections (the first full cert was the stale-pin discovery pass):**

1. The parity-session8 S8-B exam-row pin asserted the pre-BU7 red badge — **re-anchored** to
   the measured slate far family (the "Tomorrow" first row: bg rgb(241,245,249)/text
   rgb(71,85,105); the regex widened for the measured "Today!" label).
2. The accessibility overdue-badge pin found ZERO sf-pill-red on the seeded dashboard (BU7
   collapsed the family to the today-exam badge, which the seed never produces) —
   **re-anchored** to the self-owned-data shape (the BU7 pin's mechanism: create → assert →
   finally-cleanup).
3. The auth-flows S15 reset-success pin located `getByRole("alert")` — BU17d moved the success
   to `role="status"` — **re-anchored** to the status channel.
4. The BU21 miss: the prior context window was interrupted mid-GREEN; the plan's Status field
   stayed "PLANNED" with no execution record. Caught at the docs phase by the per-BU grep
   matrix; closed TDD-style (RED ×5 → the seam → GREEN; live-verified both directions).

**Re-certification (all on the FINAL tree):** lint ✓ tsc ✓ (`noImplicitAny` on) unit
**1030/1030** (36 files); the canonical build green (exit 0 — the type gate live post-BU22e;
the ADR-020 warning the only stderr); the standalone smoke: AUTH_SECRET enforcement at boot
(refuses the empty secret, boots with a real one), the three security headers on the page AND
API routes, login validation + RUM auth live; the register tripwire **249/130/0-stale/119** —
the exact hold, the expectation stated BEFORE the measurement (no playwright scripts added
this cycle); the cold 5-chunk e2e re-cert **497/497** (135+145+61+90+66, every chunk
first-pass on the final tree); the live agent-browser battery: the mobile drawer (288px panel,
labeled hamburger — the a11y superset, drawer navigation → /Analytics + auto-close, scroll
lock), the F1 rename fix verified live both directions, the BU8 blue badges (Today red-100/
red-700; 2/3/11-days blue-100/blue-700), the BU9 Cancel buttons ×3, the scroll-persistence
590px carried through SPA navigation; the seven `docs/screenshots/120-clone-*.png` evidence
frames (pixel-sane, non-blank, DOM-verified states); `.env.example` verified current
(DATABASE_URL / NEXT_PUBLIC_SITE_URL / AUTH_SECRET / SEED_DEMO / DISABLE_IN_APP_* /
TRUSTED_PROXY_HOPS / E2E_PORT).

**Standing debt after BU: ZERO.**
