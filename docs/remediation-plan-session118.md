# Remediation Plan — Session 118 / Batch BS (Cycle 68)

**Status: EXECUTED** (all items closed — see the execution record per item)
**Date:** 2026-10-31 · **Workspace:** continued clone at `5f2a19b` · **Operator-directed audit + remediation session**

---

## 0. Scope and Method

The operator directed: refresh the workspace (`git pull`), re-read the full doc chain
(`AGENTS.md`, `CLAUDE.md`, `README.md`, `PAD`, `omni-study1_SKILL.md`,
`docs/session_103.md`–`104.md`, `docs/remediation-plan.md`, `worklog.md`), re-validate
against the codebase, audit (repo skills as rubrics — `skills/web-application/SKILL.md`
§5/§16 security checklist, `skills/skills-catalog.md` the index), achieve/verify visual +
functional parity with `https://omni-study1.base44.app/` (mobile navigation menu the
named focus, Tailwind v4 the named suspicion class), keep the repo a production-ready
functional SUPERSET, verify the `.env`/`db/` contract and the vitest + playwright
suites, plan remediation for everything found, execute with TDD, capture evidence,
update docs, commit + push to `main` via the SSH wrapper.

Method (the six-phase workflow): ANALYZE → PLAN (this document) → VALIDATE (every
finding re-verified against code, live reproductions where applicable) → IMPLEMENT
(smallest safe diff, TDD red → green) → VERIFY (cold re-cert) → DOCUMENT.

**Baseline established BEFORE any change (all green, cold):**

| Gate | Result |
|---|---|
| `bun run lint` / `bun run typecheck` | 0 errors (noImplicitAny on) |
| `bun run test` (Vitest) | **944/944**, 28 files |
| `bun run build` | clean; standalone assembled; bundled `.env` carries `AUTH_SECRET=""` |
| `bun run test:e2e` (cold 5-chunk map, `scripts/e2e-chunked-cert.sh`) | **476/476** (131 + 141 + 57 + 87 + 60) |
| `bun scripts/dev-server-preflight.mjs` | GREEN (after the documented `.next/dev` reload-loop remedy) |
| Register re-derivation (non-rider instrument) | **249 importers / 130 Usage-line carriers / 0 stale / 119 usage-line-free** — the recorded tripwire held exactly |
| Mode-C audit of the Batch BR diff (`2b7222e` + `5f2a19b`) | 34 files / 830 insertions; every BR claim verified TRUE against the tree; zero key material (the 64-hex sweep empty); all six s117 evidence frames present |

**Live parity re-verification (both hosts, agent-browser + DOM probes):**

- Reference (logged in as the probe account): 24 visible links drawer-open; **no
  `role=dialog`**; **unlabeled hamburger**; `/Notes` `scrollWidth 416 > 390` (the
  reference's own overflow defect, re-confirmed); landscape nav `scrollHeight 992 >
  clientHeight 290`; **the drawer panel computes `transition: all 0s` — NO open
  animation** (the parity decision that closed audit question Q1); **scroll position
  PERSISTS across drawer navigation** (600 px carried Dashboard → /Analytics on a
  2166 px-tall page — the parity decision that closed audit question Q2).
- Clone: **26 labeled links**; `role="dialog"` + `aria-label="Navigation menu"`
  (live-verified: opening the drawer leaves focus on the hamburger — the BS4
  finding); labeled hamburger + `aria-expanded`; labeled backdrop close computing
  `blur(4px)` — **the Tailwind v4 `backdrop-blur-xs` pin holds: no Tailwind v4
  mobile-nav bug, s118 re-confirmed (the 19th consecutive live confirmation)**;
  REAL Escape close + scroll-lock release; nav auto-close; `/Notes` clean at 390;
  landscape nav `992 > 301`; sidebar 260 px → 80 px with **20/20 icon-only rail
  links titled**; scroll persists across navigation **identically to the reference**.

**No NEW parity gap. Two auditor recommendations DISPROVEN by reference measurement
(the DOM-authority rule) and converted to non-gap documentation:**

- Q1 (the `sf-slide-in` dead class): the auditor recommended WIRING the animation.
  The reference's drawer panel measures `transition: all 0s` — it opens instantly.
  The clone's instant open IS parity; wiring an animation would BREAK it. The fix
  is dead-code removal (BS11), not wiring.
- Q2 (scroll-to-top on navigate): the auditor recommended `window.scrollTo(0,0)`
  in `navigate()`. The reference PERSISTS scroll across drawer navigation (600 px
  carried onto a 2166 px-tall /Analytics; the clone carries 600 px identically onto
  its 2584 px /Analytics). The clone's behavior IS parity; the reset would BREAK
  it. Documented as a non-gap; no fix.

---

## 1. Audit Findings (every one verified against code — Mode C)

Sources: two parallel deep audits (API/security + frontend/quality) against the
`skills/web-application/SKILL.md` §5/§16 rubrics, then per-finding verification by
direct read + live probe. Findings the reference measurement disproved are recorded
as non-gaps (Q1/Q2 above), not defects.

| ID | Severity | The finding (verified) | The evidence |
|---|---|---|---|
| BS1 | **Medium (security)** | A password reset does NOT revoke existing sessions: the token payload is `{uid, iat, exp}` (no version), `getCurrentUser` checks HMAC + expiry + user-exists only, and the reset transaction writes only `passwordHash` + `usedAt`. A session cookie issued before a reset (the canonical compromise-recovery action) stays valid up to 7 days. The rubric §16 requires token-version revocation on reset. | `src/lib/auth.ts:74-79`; `src/lib/server/auth.ts:85-96`; `src/app/api/auth/reset-password/route.ts` (transaction body); `rg tokenVersion\|sessionVersion` → 0 matches. ADR-022 documents session survival for CHANGE-password only; reset is the possible-attacker path. |
| BS2 | **Medium (DoS)** | `readJson` reads an unbounded body (`await request.text()` with no cap), and several schema fields are length-unbounded: `mathSolveSchema.image` (base64, forwarded upstream), the `jsonArray` atom (subtasks/topics/reminders — persisted to SQLite), `requiredDate`/`optionalDate` (no max, no date-format check → an invalid date reaches `new Date()` → Prisma error → 500, violating the 400-bad-input contract), `idField`, member/log-in emails. | `src/lib/server/http.ts:92`; `src/lib/validation.ts:336-339, 23-27, 11-12, 275-279, 46-63`. |
| BS3 | **Medium (documented contract)** | The upload routes lack the rate limit the rubric documents ("upload 20 per 15 min" — the neo-crm in-family shape): `POST /api/files` (both the multipart and JSON-link branches) and `POST /api/files/link` are unthrottled — unbounded authenticated writes of ≤2.7 MiB base64 rows into the single-node SQLite. | `src/app/api/files/route.ts` (no `checkRateLimit` anywhere in the file); `skills/web-application/SKILL.md:138,512`. |
| BS4 | **Medium (a11y)** | The mobile drawer declares `role="dialog" aria-modal="true"` but never moves focus into the dialog on open, contains Tab, or restores focus on close. Live-verified: opening the drawer leaves `document.activeElement` on the hamburger (outside the dialog). Keyboard users tab through background content behind the announced modal. | `src/components/layout/mobile-chrome.tsx:103-171` (verified live: `activeInDialog: false`); the repo's own WCAG 2.2 AA superset standard. |
| BS5 | **Low** | `POST /api/files`'s JSON-link branch hand-rolls its validation (name: trim only, no max; url: regex only, no max, no `.url()` check) — a divergent second write path to the same table as `files/link` (which uses `linkFileSchema` since S117/BR4). Companion gap: `linkFileSchema.name` uses bare `boundedTitle` (no trim) — a whitespace-only name passes `min(1)`, unlike the AM1 members convention. | `src/app/api/files/route.ts:56-62`; `src/lib/validation.ts:304-312`; the client uses this branch live (`files-view.tsx:284`). |
| BS6 | **Low** | CSV formula injection in `toRumCsv`: `csvField` escapes only `" , \n \r`; a leading `=`, `+`, `-`, `@` or tab in a client-controlled beacon field (`navigationType` is a free string ≤40, plus `path`/`userAgent`/`sessionId`) executes as a formula when the owner opens the export in Excel/LibreOffice. | `src/lib/rum-diagnostics.ts:174-181`; `src/app/api/rum/route.ts:29-41`. Owner-only ingestion (self-inflicted) — Low. |
| BS7 | **Low** | RUM schema drift: `validation.ts`'s `rumEventSchema`/`rumBatchSchema` are a DEAD, weaker twin (navType enum, path ≤200, UA ≤300, value UNBOUNDED, events ≤10) while the route enforces a stronger INLINE schema (navType free ≤40, path ≤500, UA ≤400, value ≤6M, events ≤20). A future route following the validation.ts convention gets the weaker bounds. | `src/lib/validation.ts:342-362` vs `src/app/api/rum/route.ts:29-41` (zero imports of the twin). |
| BS8 | **Low** | The settings view's pre-warm omits `holidays` (`settings: ["subjects"]`) while the Holidays tab reads `s.holidays` — a fast tab click after boot flashes a false "No holidays set" until the post-ready `loadAll` lands. | `src/lib/view-collections.ts:37`; `src/components/views/settings-view.tsx:930`. |
| BS9 | **Low** | `loadAll` has try/finally but no catch, and the boot call site is `void useDataStore.getState().loadAll()` — any failed fetch (offline boot) rejects into an unhandled promise rejection. | `src/lib/data.ts:371-378`; `src/app/page.tsx:161`. |
| BS10 | **Low** | Sidebar/main collapse transition desync: the rail animates `transition-[width] duration-200` while `main` animates `transition-[margin]` with no duration (Tailwind's 150 ms default) — the margin finishes 50 ms early during collapse. | `src/components/layout/sidebar.tsx:48` vs `src/app/page.tsx:214`. |
| BS11 | **Low** | Dead animation code + missing client pre-check: `sf-slide-in` is used on the drawer panel but NO `@utility`/selector exists (only `@keyframes`) — the class is inert (correct parity per Q1, but the class + keyframes + the "slide-in" header comment are dead code that mislead). And the export panel's file picker accepts any size (reads the whole file + uploads before the server's 413). | `src/components/layout/mobile-chrome.tsx:6,116`; `src/app/globals.css:892-901`; `src/components/export/export-panel.tsx:135-141`. |
| BS12 | **Info** | `reset-password` has no rate limiter (the rubric's "reset 10" — token-gated, brute-force infeasible, coverage only); a stale comment ("exactly 15 entries" — the set is 16, test-pinned); the boot script's `var KEY` is defined then bypassed by a `localStorage.getItem("sf-theme")` literal (a rename would silently desync the hand-maintained script). | `src/app/api/auth/reset-password/route.ts`; `src/lib/theme.ts:190-191,273-276`. |
| I1 | **Info (documented, no fix)** | `apiGet` has no timeout path (only `apiSend` takes `timeoutMs`); a stalled gate request leaves the Splash without a retry affordance. Documented: the S13 resilience contract covers the AI deadlines; adding a gate timeout changes the auth-gate failure UX and needs its own design pass. | `src/lib/api.ts:70-73`. |
| I2 | **Info (documented, no fix)** | The settings view refetches `/api/auth/me` (the theme store lacks the full AppUser — partly unavoidable), and the splash-branch skip link is a no-op until `#main-content` mounts. Both cosmetic; documented. | `settings-view.tsx:1036-1048`; `page.tsx:186-189`. |

---

## 2. The Fixes (TDD: red → green; the smallest safe diff)

- **BS1 — session revocation on reset (`sessionVersion`).** `prisma/schema.prisma`
  User gains `sessionVersion Int @default(0)`; `createSessionToken(userId,
  sessionVersion = 0)` embeds `v` in the payload; `readSessionToken` returns it
  (missing `v` reads as 0 — existing cookies survive the deploy); `getCurrentUser`
  compares `(payload.v ?? 0) === user.sessionVersion` (the select gains the
  column); the reset transaction also `sessionVersion: { increment: 1 }`. RED:
  unit pins (token embeds v; missing-v reads 0) + the e2e pin (the journey's
  pre-reset cookie → `/api/auth/me` 401 after the reset, then the new-password
  sign-in 200). change-password/change-email keep their documented
  session-survives contracts (ADR-022/ADR-024 — the owner-rotation paths).
- **BS2 — bounded reads + bounded fields.** `readJson` gains the 10 MiB cap
  (declared content-length pre-read + actual text length → `ValidationError` →
  400 with actionable copy; the import route keeps its own 413 — it predates and
  is separately pinned). `mathSolveSchema.image` gains `.max(7_000_000)` (≈5 MiB
  binary — above the new client gate); the mathsolver picker gains a 5 MiB
  client-side pre-check (fast feedback, no read). `jsonArray` gains
  `.max(100_000)`; `requiredDate`/`optionalDate` gain `.max(40)` + a
  `Date.parse`-valid refinement (garbage → 400, never a Prisma 500); `idField`
  gains `.max(64)`; a shared `emailField = z.string().trim().email().max(200)`
  atom replaces the bare `z.string().email()` uses (login, register, verify,
  resend, change-email, the forgot route's inline schema, members). RED: the
  validation pins for each bound (boundary-exact: max passes at the limit, fails
  at +1).
- **BS3 — the upload rate limit.** `checkRateLimit(`upload:${user.id}`, 20)` at
  the top of `POST /api/files` (one shared bucket for both branches) and
  `POST /api/files/link` — the rubric's 20/15-min shape, keyed per-user (the
  repo's authenticated-route convention). Verified live on the dev server with a
  scratch registered user (21st POST → 429 + `Retry-After`) — the e2e suite's
  own upload counts (≈10/run, fresh server per chunk) stay far under budget.
- **BS4 — the drawer focus lifecycle.** On open: focus the panel's close button;
  a Tab handler in the existing keydown listener cycles the dialog's focusables
  (wrap at both edges; an escaped focus is pulled back); on close/unmount:
  restore focus to the opener (the hamburger). No animation, no geometry change
  — the visual surface is byte-identical. RED: the e2e pins (open → close button
  focused; Tab wraps inside; Escape → focus returns to the hamburger).
- **BS5 — one schema, both entry points.** `linkFileSchema.name` becomes
  `z.string().trim().min(1).max(200)` (the AM1 trim-before-check convention —
  a whitespace-only name is now rejected at BOTH entry points); the files POST
  JSON branch consumes the shared schema (`parseWith(linkFileSchema, …)`),
  deleting the hand-rolled divergent copy (the folder-404 guard stays). RED: the
  validation pins (trim/blank-reject) + the route's live behavior.
- **BS6 — the CSV formula guard.** `csvField` prefixes a leading `'` when the
  field starts with `=`, `+`, `-`, `@`, tab, or CR (the standard spreadsheet
  neutralization, applied uniformly — the numeric/enum fields never start with
  those). RED: the unit pins (each dangerous prefix neutralized; normal fields
  byte-identical).
- **BS7 — the RUM twin reconciled to the enforced shape.** `validation.ts`'s
  `rumEventSchema`/`rumBatchSchema` adopt the ROUTE's live bounds (navType free
  string 1-40, path ≤500, UA ≤400, value ≤6M, events ≤20) and the route imports
  them (the inline copy deleted). RED: the validation pins re-anchored to the
  live bounds (the old pins asserted the dead twin's tighter-elsewhere,
  looser-on-value shape).
- **BS8 — holidays pre-warmed.** `INITIAL_COLLECTIONS.settings` becomes
  `["subjects", "holidays"]` + the view-collections pin updated in the same
  commit (the documented same-commit rule).
- **BS9 — loadAll never rejects.** The boot call site gains `.catch(() => {})`
  (the pre-warm's own convention — a failed boot fetch surfaces through the
  connectivity banner and heals on the first view switch's `loadCollections`).
- **BS10 — the collapse transition synced.** `main` gains `duration-200`
  (matching the rail; the end-state geometry pins are unaffected).
- **BS11 — dead code removed + the client pre-check.** The inert `sf-slide-in`
  class, its orphaned `@keyframes`, and the "slide-in" header comment are
  removed (parity is the measured instant open — Q1); the export picker rejects
  a >10 MiB file inline (the same message family as the server's 413) without
  reading it.
- **BS12 — the Info trio.** `checkRateLimit(`reset:${ip}`, 10)` on reset-password
  (the rubric's shape; the journey makes 1-2 POSTs — no e2e impact); the stale
  "exactly 15 entries" comment → 16; the boot script consumes its own `var KEY`.

**Guardrails held:** no test weakened (the RUM pin re-anchor is a re-shape to the
ENFORCED contract — the old pins pinned dead code); no lint/type rule loosened;
`noImplicitAny` stays on; the s117 e2e pins ride untouched.

---

## 3. Verification Plan (the FINAL tree)

1. lint + typecheck clean.
2. Vitest: the census grows by the new pins (RED-first verified), 28 files.
3. The canonical build green (bundled-`.env` contract intact).
4. `db/custom.db` schema-pushed (the sessionVersion column) + the cold 5-chunk
   e2e re-cert (the s23-import + auth-flows pins now include the BS1/BS2
   additions).
5. Live curl verification on :3000 — the readJson cap (an 11 MiB login body →
   400), the upload limiter (a scratch user's 21st POST → 429), the reset
   limiter, and the import round-trip still green.
6. The standing suite (35 stages) fresh single run.
7. Evidence frames: `docs/screenshots/118-ref-*` (captured pre-change) +
   `118-clone-*` (post-change), md5-distinct, DOM-verified states.
8. `.env.example` verified current; docs chain re-anchored; worklog + session
   record written; commit + push to `main` via the SSH wrapper.

---

## 4. The Verification Record (executed — the FINAL tree, 2026-10-31)

1. **lint + typecheck: clean** (`noImplicitAny` on, zero errors).
2. **Vitest: 963/963** (28 files — auth +3, validation +13, rum-diagnostics +2,
   view-collections +1; the RUM event/batch pins re-shaped to the enforced bounds, the
   theme-cache boot-script pin re-anchored to the var-KEY consumption). RED-first
   verified: the 18 new pins failed on the pre-change tree.
3. **The canonical build: green** — the standalone assembled, the bundled `.env`
   carries `AUTH_SECRET=""` (the s22 boot-guard contract intact; the documented
   ADR-020 Edge-Runtime boot-guard warning the only stderr line).
4. **The cold 5-chunk e2e re-cert: 478/478** (132+141+57+87+61 — chunk one +1 the BS4
   drawer focus-lifecycle pin, chunk five +1 the BS2 oversized-body pin; BS1 rides the
   reset journey in-place: the captured pre-reset cookie replays to 401 after the
   reset, then the new-password sign-in 200). Census re-tagged in
   `scripts/e2e-chunked-cert.sh` (also repairing the S117 474-era Expected sum the
   BR cycle never re-tagged).
5. **Live curl verifications on :3000** — the readJson cap (an 11 MiB login body → 400
   before the read); the upload limiter (a scratch registered user: 20 × 201 → the
   21st 429 + `Retry-After`; `files/link` shares the bucket); the reset revocation (the
   pre-reset cookie → 401 after the reset; the new-password sign-in 200); the files
   JSON branch (the shared schema's rejections live); the reset limiter; the BR1
   import round-trip regression (the demo export's 6 cards → import updated 6 — the
   S117 fix holds).
6. **The standing suite (35 stages): effectively 35/35 green.** The first launch (the
   bare `nohup … &` form) was reaped mid-stage-2 — the S110 lesson-1 live again; its
   security stage had already consumed the demo user's 20/15-min AI budget on the
   shared :3000 process. The double-fork orphan re-launch: **34/35** — the security
   stage alone failed, `AI-route limiter shape wrong: cutoffAt=1, statuses=429` — the
   DOUBLE-RUN PHANTOM (the S32 fixture-harvested class live: the killed run's own
   probe had pre-exhausted the in-memory budget the re-run's probe measures).
   Diagnosis by failure MODE (the S117 lesson-4 protocol): an assertion-mode finding
   whose mechanism is the per-process budget, not the code. A standalone re-run on
   the same process read `cutoffAt=16` (the suite's own ai-error/ai-a11y stages had
   consumed 5 within the window — the second consumption class, confirming the
   mechanism); a FRESH dev-server boot (the S32 recipe) + the standalone re-run:
   **0 findings, 7 nonGaps — GREEN.**
7. **Evidence frames: 6 in `docs/screenshots/`** — `118-ref-dashboard.png` +
   `118-ref-mobile-drawer.png` (the reference, logged in as the probe account,
   captured pre-change) + `118-clone-dashboard.png`, `118-clone-mobile-drawer.png`,
   `118-clone-settings-holidays.png`, `118-clone-files.png` (the remediated tree) —
   all md5-distinct, DOM-verified states (the drawer frame's capture session itself
   re-verified the BS4 lifecycle live: open → focus on the close button, Escape →
   closed + focus restored to the hamburger; the settings frame shows the Holidays
   tab rendering its 2 seeded rows — the BS8 pre-warm, never the false empty state).
8. **`.env.example` verified current** (tracked; `DATABASE_URL="file:../db/custom.db"`
   with the db-path re-anchoring note, the AUTH_SECRET boot-guard posture, `E2E_PORT`)
   — committed unchanged from BR7 (re-verified against the BS tree; included in the
   commit). The docs chain re-anchored (README badge 1441 + the Session-118 row,
   AGENTS 963/478 + the S118 lessons ×4, CLAUDE Unit-line seam tail S118/BS, vitest
   header 963, PAD v1.3.26 + the §6.4 rows, the cert-script census 478, the
   remediation-plan header → Batch BS); the worklog entry + `docs/session_105.md`
   written; committed + pushed to `main` via the SSH wrapper.

**Standing debt: ZERO.**
