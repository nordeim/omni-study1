# Session 118 — Batch BR (Cycle 67): The Operator-Directed Hardening Cycle — the Import Cards Fix + the Auth-Hardening Quartet

> Record of worklog **Session-117 / Batch BR**. Workspace: fresh clone at `b55affb`.
> Plan + execution record: **`docs/remediation-plan-session117.md`**.

## The directive

Refresh the workspace; re-read the full doc chain; re-validate against the codebase;
audit with the repo-vendored skills (`skills/web-application/SKILL.md` the named
rubric, `skills/skills-catalog.md` the index); iterate toward visual + functional
parity with the live reference (the mobile navigation menu the named focus,
Tailwind v4 the named suspicion class); keep the clone a production-ready functional
SUPERSET; set up `.env`/`db/` per the documented contract; verify the vitest +
playwright suites; write a remediation plan for everything found; execute it TDD;
capture evidence; update the docs; commit + push `main` via the SSH wrapper.

## Baseline (cold, BEFORE any work — all green)

lint ✓ · `tsc --noEmit` ✓ · unit **936/936** (28 files) · the canonical build green
(bundled-`.env` contract intact) · the cold 5-chunk e2e **474/474**
(131+141+57+87+58) · dev-server preflight GREEN · the register re-derivation
**249/130/0-stale** (the 18th tripwire, holding exactly) · the Mode-C audit of the
Batch BQ diff **0C/0H/0M/0L/1I** — every BQ claim verified TRUE (zero src/tests
changes, no key material, the 20 s116 frames md5-distinct).

## Live parity (both hosts — agent-browser + DOM probes + a VLM spot-check)

**No NEW parity gap; no Tailwind v4 mobile-nav bug — s117 re-confirmed** (the 18th
consecutive live confirmation). Reproduced live on the reference: 24 links
drawer-open, no `role=dialog`, the unlabeled hamburger, `/Notes` `scrollWidth 416`
(its own overflow defect), the landscape nav-scroll 992 > 290. Verified on the
clone: 26 labeled links, `role=dialog` + "Navigation menu", the labeled hamburger +
labeled backdrop close at computed `blur(4px)` (the v4 `backdrop-blur-xs` pin),
REAL Escape close + scroll-lock release, nav auto-close, `/Notes` clean at 390, the
landscape discriminator 992 > 301, the sidebar 260→80px collapse with 20/20
icon-only links titled, the boolean-string localStorage contract. The VLM drawer
pair read "visually equivalent"; its two dashboard flags were disproven by DOM
measurement (the reference DOES carry all 20 links incl. Practice Tests; the
overdue banner is data-driven) — the documented VLM-hypothesis/DOM-authority class.

## The findings (every one verified against code, reproduced live where applicable)

| ID | Severity | The finding | The verification |
|---|---|---|---|
| BR1 | **Critical (functional)** | The import write loop probed `{ id, userId }` on the flashcard delegate — Flashcard has NO `userId` → PrismaClientValidationError → the all-or-nothing rollback → **HTTP 500 on any envelope containing cards. The export→import round-trip was broken for every account with flashcards.** Plus five documented S23 contracts the route never implemented (10 MiB cap, secret strip, unknown-collection rejection, folders topo sort, version floor) — and the S23 seam (`src/lib/data-import.ts`, 30 unit pins) was **dead code, zero importers**. | Reproduced live (demo export 3 decks/6 cards → 500, the exact trace in dev.log); invisible to 94 green sessions because the s23 envelope only ever posted a DANGLING-deckId card — the write loop's cards branch had zero coverage. |
| BR2 | High (hardening) | verify-email: no rate limit, no OTP attempt counter — a 10⁶ code space, a 15-min window, and success signs the caller in. | Route read; not in the threat model; no ADR. |
| BR3 | Medium | Login lacks the timing equalizer — the short-circuit miss branch returns in ~1ms vs ~50-100ms of scrypt: a measurable enumeration oracle under the uniform 401. | Route read; live timing compared post-fix. |
| BR4 | Low | `files/link` accepts `z.string().url()` — WHATWG-valid `javascript:` URLs stored as `href` + `target="_blank"`; the upload route has enforced `^https?://` since S14 (the inconsistent near-duplicate). | Both routes read; the render site confirmed. |
| BR5 | Low | `readJson` has no Content-Type gate — a `text/plain` form POST (the login-CSRF class) reaches the JSON parser. | Confirmed safe to fix first: the app's client sets the header; zero e2e string-bodies. |
| BR6 | Medium | Reset tokens stored **plaintext** at rest — a DB read yields live account-takeover links for their 30-min TTL. | Both routes read; stored form verified live post-fix (64-hex digest). |
| BR7 | Documentation | The XFF first-hop limiter keying and the in-response OTP/reset delivery were implicit decisions, not written ones; `E2E_PORT` undocumented; the Docker "serve time" sitemap claim FALSE (build-time prerendered); AGENTS.md's import paragraph described the seam's contract, not the route's. | Built-artifact inspection (`sitemap.xml.body` carries the baked default). |

## The fixes (TDD: red → green; the smallest safe diff)

- **BR1** — every cards ownership probe scopes through `{ deck: { userId } }` (the
  knownIds loop's own pattern); the documented contracts restored using the SEAM's
  exports (`IMPORT_MAX_BYTES` → 413 on both the declared and actual length,
  `NEVER_IMPORT_FIELDS` stripped per-row, unknown collections rejected by name,
  `sortFoldersParentsFirst` — now exported — for the parents-first folder order,
  the version floor). The seam is no longer dead code; `parseImportEnvelope`
  deliberately stays unused end-to-end (its FK pass is envelope-local — it would
  null FKs that resolve against existing account rows; the route's account-aware
  `knownIds` is the shipped semantic, now written down where the seam lives).
  RED: the live 500 (demonstrated pre-change). GREEN: the round-trip → 200 with
  `cards: { updated: 6 }`; the e2e pin — a stamped-id card under an EXISTING owned
  deck (the account-aware REQUIRED-FK path) with finally-cleanup; the s23 budget
  8 → 9 POSTs (≤ 9 convention held).
- **BR2** — `checkRateLimit("verify:" + ip, 20)`, limiter-before-validation, the
  uniform rejection copy unchanged. Verified live: 20 × 400 then **429 +
  `retry-after: 890`**; the e2e pin rides the RFC 5737 TEST-NET technique
  (192.0.2.117) so the shared localhost budget is never touched.
- **BR3** — `verifyLoginCredentials(user, password)` + `DUMMY_LOGIN_HASH` in
  `src/lib/auth.ts`; the route hoists the burn BEFORE the null check (TS narrowing
  would otherwise invite the oracle back). Live: unknown-email ≈ wrong-password ≈
  40ms. Unit pins (5): the helper's matching/miss semantics + the dummy's scrypt
  SHAPE — the observable that fails the malformed-dummy mutant.
- **BR4** — `linkFileSchema` in `src/lib/validation.ts` (`.url()` AND
  `^https?://`), consumed by `files/link`; unit pins (3).
- **BR5** — the `readJson` CT gate (absent-header requests parse; browser form
  POSTs never omit it — the browser-reachable class closed).
- **BR6** — `hashResetToken` (SHA-256): forgot stores the digest, reset looks up
  the digest. Live: the stored row is 64-hex, the raw-token reset 200, the
  one-shot consumption intact; unit pins (2). Outstanding plaintext tokens die at
  deploy (30-min TTL, dev-only — documented in the plan).
- **BR7** — PAD §6.4 gained the timing/OTP/reset/XSS/CT rows + the two documented
  decisions with REOPEN TRIGGERS (XFF first-hop keying: an Internet-facing
  reverse-proxy deployment; in-response delivery: a real mail transport) + the
  RUM upsert Low accepted with its trigger. `E2E_PORT` documented in
  `.env.example`. The Dockerfile gained the `NEXT_PUBLIC_SITE_URL` BUILD ARG and
  the DEPLOYMENT/compose claims were corrected (sitemap/robots/metadataBase are
  build-time). AGENTS.md's import paragraph rewritten to the now-true contract.
  **`tsconfig.json` `noImplicitAny: true`** — verified zero new `tsc` errors: a
  guardrail strengthened, not weakened (the flip surfaced one pre-existing
  implicit-any in the import route's transaction delegate, now explicit).

## The standing suite (the honest sequence)

First run **27/35** — 8 accent-volume family failures, every one
"page.evaluate: Target crashed" or a post-crash timeout, with TWO agent-browser
sessions open (the documented 4GB-sandbox OOM class) and the same-family
light-midband stage GREEN mid-run. **Re-run quiet (browsers closed, sequential):
all 8 green, zero findings.** The S117 lesson-4 protocol (a crash-mode failure is
never a code finding until it reproduces quiet) is now in AGENTS.md.

## Re-certification (the FINAL tree)

lint ✓ · `tsc --noEmit` ✓ (`noImplicitAny` on) · unit **944/944** (28 files —
auth +5, validation +3) · the canonical build green (the standalone asset
contract intact) · the cold 5-chunk e2e **476/476** (131+141+57+87+60 — chunk
five +2: the s23 cards round-trip pin + the auth-flows verify-429 pin) ·
`.env.example` verified current · 6 fresh evidence frames in
`docs/screenshots/` (117-ref-dashboard / 117-ref-mobile-drawer /
117-clone-dashboard / 117-clone-mobile-drawer / 117-clone-export-restore /
117-clone-tasks — all md5-distinct, DOM-verified states).

**Standing debt: ZERO.** The docs chain re-anchored at every anchor: README badge
1420 + the Session-117 row, AGENTS 944/476 + the S117 lessons ×4 + the import
paragraph, CLAUDE Unit-line seam tail S117/BR, vitest header 944, PAD v1.3.25,
the remediation-plan header → Batch BR, the worklog entry, this record.
