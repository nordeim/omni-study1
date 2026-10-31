# Remediation Plan — Session 117 / Batch BR (Cycle 67)

**Status: EXECUTED** (all items closed — see the execution record per item)
**Date:** 2026-10-31 · **Workspace:** fresh clone at `b55affb` · **Operator-directed remediation session**

---

## 0. Scope and Method

The operator directed: refresh the workspace, re-read the full doc chain, re-validate
against the codebase, audit (repo skills as rubrics — `skills/web-application/SKILL.md`
§5/§6/§16 security checklist, §2/§3/§15 config checklist), achieve/verify visual +
functional parity with `https://omni-study1.base44.app/` (mobile navigation menu the
named focus, Tailwind v4 the named suspicion class), keep the repo a production-ready
functional SUPERSET, set up `.env`/`db/` per the documented contract, verify the
vitest + playwright suites, plan remediation for everything found, execute with TDD,
capture evidence, update docs, commit + push to `main` via the SSH wrapper.

Method (the six-phase workflow): ANALYZE (read affected files completely; reproduce
before theorizing) → PLAN (this document) → VALIDATE (every finding re-verified
against code, with live reproductions where possible) → IMPLEMENT (smallest safe
diff, TDD: red → green → refactor) → VERIFY (cold re-cert of the full gate) →
DOCUMENT (docs chain + worklog + session record).

**Baseline established BEFORE any change (all green):**

| Gate | Result |
|---|---|
| `bun run lint` | 0 errors |
| `bun run typecheck` | 0 errors |
| `bun run test` (Vitest) | **936/936**, 28 files |
| `bun run build` | clean; standalone assembled; bundled `.env` carries `AUTH_SECRET=""` (the S22/S112 contract) |
| `bun run test:e2e` (cold, 5-chunk map via `scripts/e2e-chunked-cert.sh`) | **474/474** (131 + 141 + 57 + 87 + 58) |
| `bun scripts/dev-server-preflight.mjs` | GREEN (hydrated, navigation-stable) |
| Register re-derivation | **249 importers / 130 Usage-line carriers / 0 stale** — the 18th tripwire held (drift UP by named riders only) |
| Mode-C audit of the Batch BQ diff (`e6b540a..2b06b09` + `b55affb`) | 0C/0H/0M/0L/1I — zero src/tests changes (claim TRUE), zero key material, zero 64-hex secrets, 20 s116 evidence frames md5-distinct |

**Live parity re-verification (both hosts, agent-browser + DOM probes):**

- Reference (logged in as the probe account): 24 visible links drawer-open; **no
  `role=dialog`**; **unlabeled hamburger**; `/Notes` `scrollWidth 416 > 390` (the
  reference's own overflow defect, reproduced live); landscape drawer nav
  `scrollHeight 992 > clientHeight 290` (the nav MUST scroll).
- Clone: **26 labeled links**; `role="dialog"` + `aria-label="Navigation menu"`;
  labeled hamburger ("Open navigation menu"); REAL Escape close (dialog hidden +
  body scroll-lock released); nav auto-close on navigation; labeled backdrop close
  button computing `blur(4px)` — **the Tailwind v4 `backdrop-blur-xs` pin holds**
  (v3's `backdrop-blur-sm` = 4px = v4's `backdrop-blur-xs`, the AP-17 pin);
  `/Notes` `scrollWidth 390 == 390` (clean — documented superset deviation);
  landscape nav `scrollHeight 992 > clientHeight 301`; sidebar 260 px → 80 px
  collapse with all 20/20 icon-only links carrying `title`/`aria-label`;
  `localStorage["sf-sidebar-collapsed"]` boolean-string `"true"`.
- VLM spot-check (drawer pair): "visually equivalent — no structural or visual
  differences." Two VLM flags on the dashboard pair were **disproven by DOM
  measurement** (the reference DOES have all 20 links incl. Practice Tests; the
  overdue-items banner is data-driven, not structural) — the documented
  "VLM findings are hypotheses; DOM probes are the authority" class.

**Verdict: NO new parity gap. NO Tailwind v4 mobile-nav bug — s117 re-confirmed
(the 18th consecutive live confirmation).**

---

## 1. Audit Findings (Mode-C, all re-verified against code)

Two audit sweeps ran with the repo-vendored skills as rubrics: a security sweep
(`skills/web-application/SKILL.md` §5/§6/§16) over the auth/AI/import/files/RUM
surface, and a config/test-infra sweep (§2/§3/§15) over the configs, `.env.example`,
doc-count claims, and isolation contracts. Every finding below was independently
re-verified in this session (code read + live reproduction where applicable) —
none is taken on the auditor's word alone.

### Verified-clean contracts (no action)

scrypt + `timingSafeEqual` with strict format checks; HMAC-SHA256 session cookie
(httpOnly/lax/secure-in-prod/TTL/malformed-token nulls); AUTH_SECRET boot guard
(prod `exit(1)` incl. dev-fallback rejection); Zod at every boundary via `parseWith`;
delegate-factory ownership by construction (`where: { userId }` + pre-write
ownership probes, flashcards deck-scoped in `entities.ts`); error envelopes with
server-side-only detail; no `dangerouslySetInnerHTML` with dynamic content; no path
traversal (uploads are base64 DB rows); no secrets logged; `/rum` owner-gated
server-side. Doc-count claims all TRUE (936 unit / 474 e2e / 28 files / 31 spec
files / 1410 badge / chunk sums re-derived exactly). `.env.example` ↔ code env
parity holds for DATABASE_URL / AUTH_SECRET / NEXT_PUBLIC_SITE_URL. Docker
deliberately absolute-pathed (`file:/data/custom.db`) with `.dockerignore` guards.
`.gitignore` covers `.env`, `db/*.db`, logs, keys.

### Findings → Batch BR items

| ID | Severity | Finding | Evidence (verified) |
|---|---|---|---|
| **BR1** | **Critical (functional)** | **The import route's write-loop probes `cards` with `{ id, userId }` — `Flashcard` has NO `userId` column → `PrismaClientValidationError` → the whole all-or-nothing transaction rolls back → HTTP 500.** The export→import round-trip — the core data-portability promise — fails for ANY account with flashcards. Also: no 10 MiB body cap (documented 413 contract unimplemented); `passwordHash`/`userId` not stripped (documented secret guard unimplemented — unknown fields reach Prisma as opaque 500s); unknown collections silently ignored (documented: rejected by name); folders imported in envelope order (documented: parents-first topo sort — a child-first order dies P2003); version floor missing (old versions accepted). `src/lib/data-import.ts` (the S23 seam, 30 unit pins) is **dead code — zero importers**. | Live repro this session: export (3 decks/6 cards) → POST import → **HTTP 500**; dev.log carries the exact `Invalid delegate.findFirst() invocation … userId … Available options are marked with ?` trace at the `flashcard` delegate. The `knownIds` loop 20 lines above correctly special-cases cards (`{ deck: { userId } }`) — the write loop forgot. s23 e2e envelope contains no valid card → suite green while the feature is broken. |
| **BR2** | **High (hardening)** | `POST /api/auth/verify-email` has **no rate limit and no OTP attempt counter** — the 6-digit code (10^6 space, 15-min window) can be brute-forced unthrottled, and success signs the attacker in. | Route read: no `checkRateLimit`, no attempt counter, direct `token.code !== normalized` compare. Not covered by any ADR; not in the PAD threat-model table. |
| **BR3** | **Medium (hardening)** | Login lacks the **timing equalizer**: `if (!user || !verifyPassword(...))` short-circuits — unknown-email returns in ~0 scrypt time, wrong-password burns ~50–100 ms of scrypt. A remotely measurable enumeration oracle that undermines the uniform 401. | `login/route.ts:47`. The skill's §16 checklist names this exact class; no ADR covers it. |
| **BR4** | **Low (hardening)** | `POST /api/files/link` accepts `z.string().url()` — WHATWG-valid for `javascript:` URLs → stored `href` + `target="_blank"` = script execution in the app origin on click. `files/route.ts` POST (the same feature's other entry point) already enforces `/^https?:\/\//i` — the link route is the inconsistent duplicate. | Route read + `files-view.tsx:503` render site. |
| **BR5** | **Low (hardening)** | `readJson` performs no Content-Type check (the login-CSRF class: a `text/plain` form POST bypasses the CORS/preflight reasoning in the threat-model's CSRF row) and no length bound. | `src/lib/server/http.ts:82-90`. Safe to fix: the app's single HTTP client sets `Content-Type: application/json` (`src/lib/api.ts:83`); zero e2e specs post stringified bodies (grep-verified). |
| **BR6** | **Medium (hardening)** | Password-reset tokens are stored **plaintext** at rest (`PasswordResetToken.token` = the raw 24-byte token that rides the reset URL). A DB read (backup leak, file access) yields live account-takeover tokens for their 30-min TTL. | `forgot-password/route.ts:44-51` (stores raw), `reset-password/route.ts:22` (looks up raw). The skill's §16 mandates hashed-at-rest; no ADR documents the plaintext choice. |
| **BR7** | **Documentation** | (a) The PAD threat-model table does not state the **XFF first-hop limiter keying** decision (parity-load-bearing: the limiter "mirrors the reference's limiter shape" and the e2e suite's RFC 5737 TEST-NET technique depends on it) — an implicit assumption, not a written decision. (b) Same for the in-response reset-URL/OTP delivery (ADR-013's no-SMTP model — decided, but the threat-model row should say so). (c) `E2E_PORT` is read by `playwright.config.ts` + `e2e-chunked-cert.sh` but absent from `.env.example`. (d) `docker-compose.yml`/`Dockerfile`/`DEPLOYMENT.md` claim `NEXT_PUBLIC_SITE_URL` affects sitemap/robots "at serve time" — **false**: sitemap.ts/robots.ts are statically prerendered at build (`.next/standalone/.../sitemap.xml.body` bakes `http://localhost:3000`). (e) AGENTS.md's import paragraph documents contracts the route did not implement (fixed with BR1). | Grep + built-artifact inspection (the `.body` files carry the baked default). |

### Explicitly NOT remediated (documented decisions, reopen triggers recorded)

- **XFF first-hop limiter keying** — parity-load-bearing (mirrors the reference's
  limiter shape; the e2e TEST-NET technique rides it) and single-user-threat-model
  bounded. Changing it would break the documented e2e technique and diverge from the
  reference. **Reopen trigger:** an Internet-facing multi-user deployment or a real
  reverse-proxy hop — then adopt the hops contract (rightmost untrusted hop, fail
  closed) and re-key the suite's technique. Documented in the PAD threat model (BR7a).
- **In-response OTP/reset delivery** (ADR-013) — the only way the flows complete in
  a no-SMTP self-hosted deployment; decided. **Reopen trigger:** real mail transport
  (then add the `*_DISABLE_IN_APP_*` knobs). Documented (BR7b).
- **RUM upsert update-branch ownership** (a cross-user `sessionId`+`metric`
  collision can overwrite another user's sample) — diagnostics-only surface,
  client-UUID sessionIds (unguessable), GET/export correctly scoped. **Reopen
  trigger:** any change that makes sessionIds user-supplied-guessable or RUM data
  user-visible. Left as a written Low in the plan; not worth the churn this cycle.
- **`tsconfig.json` `noImplicitAny: false` under `strict: true`** — tested this
  session: flipping to `true` surfaced zero new `tsc` errors, so it was flipped
  (see BR-extras) — no guardrail weakened, one strengthened.

---

## 2. The ToDo List (executed in TDD order)

Each item: RED (the failing pin first, demonstrated against the pre-change tree
where possible) → GREEN (the smallest safe diff) → REFACTOR → docs chain.

- [x] **BR-0 Environment + baseline** — `.env` with `DATABASE_URL="file:../db/custom.db"`
      (`db/` at repo root, git-ignored); `db:push` + `db:seed`; `bunx playwright install
      chromium` (chromium-1243 for locked Playwright 1.63); cold gate green (table above).
      The db path needs NO code change — the three-anchor contract
      (`src/lib/db-path.ts`, 16 unit pins) already resolves `file:../db/custom.db`
      to `<repo>/db/custom.db` in every mode; verified live (dev server + standalone
      + Prisma CLI all agree — the seeded demo data served through the UI).
- [x] **BR1 The import fix** (Critical):
  - [x] RED: new e2e pin in `tests/e2e/s23-import.spec.ts` — a card under an EXISTING
        seeded deck (account-aware REQUIRED-FK resolution) → pre-fix tree: HTTP 500
        (demonstrated live this session via the export→import round-trip).
  - [x] GREEN: the route's write-loop probe special-cases `cards` exactly like the
        `knownIds` loop (`{ id, deck: { userId: user.id } }`).
  - [x] The documented S23 contracts the route never implemented, restored with the
        smallest diffs: 10 MiB body cap → 413 (`IMPORT_MAX_BYTES` from the seam);
        `passwordHash`/`userId` stripped from every row (`NEVER_IMPORT_FIELDS`);
        unknown collections rejected BY NAME (the seam's copy); folders imported
        parents-first (export `sortFoldersParentsFirst` from the seam — envelope-local
        parents sort first, out-of-envelope parents are already-validated roots);
        version floor (reject `version < DATA_EXPORT_VERSION` with the seam's copy).
  - [x] The seam is no longer dead code (the route imports its constants + sorter).
  - [x] Budget: +1 import POST → 9/10 per chunk (≤ 9 convention held).
- [x] **BR2 verify-email rate limit** — `checkRateLimit(`verify:${ip}`, 20)` before
      parsing (limiter-before-validation, the login route's own convention); the
      uniform rejection copy unchanged. RED: new e2e pin (21st attempt from a RFC
      5737 TEST-NET IP → 429 + `Retry-After`) riding the documented distinct-IP
      technique (never poisons the localhost budget). Per-chunk localhost verify
      count ≤ 6 — the 20/IP window is safe for the suite.
- [x] **BR3 login timing equalizer** — new pure helper in `src/lib/auth.ts`
      (`verifyLoginCredentials`): the miss branch burns the same scrypt work against
      a module-level dummy hash. RED: unit pins (helper semantics + the dummy hash's
      scrypt shape — the mutant "early-return without scrypt" fails the shape pin).
- [x] **BR4 files/link http(s) guard** — the `^https?://` check with `files/route.ts`'s
      exact message copy ("The link needs a valid http(s) URL."). RED: unit pin on the
      schema shape (regex rejects `javascript:`/`data:` while accepting http/https).
- [x] **BR5 readJson CT gate** — reject non-`application/json` Content-Types with a
      400 ("...expects a JSON body") — the login-CSRF class closed at the shared
      boundary. (No generic length cap: the upload route legitimately posts ~2.7 MiB
      JSON; the import cap rides BR1's seam constant.)
- [x] **BR6 reset tokens hashed at rest** — new pure helper (`hashResetToken`,
      SHA-256 hex) in `src/lib/server/auth.ts`; `forgot-password` stores the hash;
      `reset-password` looks up the hash. RED: unit pins (deterministic 64-hex,
      differs from raw). Existing outstanding plaintext tokens die at deploy
      (30-min TTL; dev-only data; noted in the plan).
- [x] **BR7 documentation + config** — PAD threat-model rows (XFF keying decision +
      reopen trigger; in-response delivery decision + reopen trigger; the RUM Low +
      reopen trigger; verify/OTP brute-force row now mitigated); `.env.example`
      gains the commented `E2E_PORT` entry; DEPLOYMENT/Dockerfile/compose claims
      corrected to build-time for sitemap/robots (+ the Dockerfile build ARG);
      AGENTS.md import paragraph rewritten to the ACTUAL (now-conformant) contract;
      `tsconfig.json` `noImplicitAny: true` (verified zero new errors).
- [x] **BR8 evidence** — s117 screenshots (117-ref-* fresh reference pairs +
      117-clone-* remediated-tree frames incl. the import round-trip surfaces) into
      `docs/screenshots/`, md5-distinct.
- [x] **BR9 re-cert** — lint → typecheck → unit (new census) → build → **cold**
      5-chunk e2e (new census; `rm -f db/e2e.db` first) — all green before commit.
- [x] **BR10 docs chain + commit + push** — README session row + badge count,
      AGENTS S117 lessons, CLAUDE seam tail, vitest header census, PAD revision,
      `docs/remediation-plan.md` status header re-anchor, worklog entry,
      `docs/session_103.md` (the session record; the odd-file record convention),
      conventional-commit on `main`, push via `docs/ssh_git_wrapper_v3.py`
      (`--remote git@github.com:nordeim/omni-study1.git`), operator key shredded.

---

## 3. Validation record (filled at execution)

- BR1 RED demonstrated live (HTTP 500 + the exact PrismaClientValidationError trace
  in dev.log, the `flashcard` delegate's `userId` probe) — pre-change.
- BR1 GREEN verified live: export→import round-trip → 200 `{created: 0, updated: …}`
  with the demo account's 6 cards (`cards: {updated: 6}`); the s23 e2e pin green in
  the cold map (one iteration needed: the first pin draft posted a bare `{data:{cards}}`
  without the format/version envelope wrapper → the route's own 400 — the pin's bug,
  fixed to ride the `envelope()` helper; the s23 budget 8 → 9 POSTs).
- BR2 verified live: 20 × 400 then **429 + `retry-after: 890`**; the e2e pin (21
  attempts from TEST-NET 192.0.2.117) green cold.
- BR3 verified live: unknown-email ≈ wrong-password ≈ 40ms post-fix (the pre-fix miss
  branch returned in ~1-5ms); unit pins RED-first (missing exports), then green.
- BR4/BR6 unit pins RED-first (missing exports), then green. BR6 live: the stored
  PasswordResetToken is a 64-hex SHA-256 digest; the raw-token reset 200; one-shot
  consumption intact; the auth-flows forgot→reset e2e journey green cold.
- BR5 verified by the full e2e re-cert (no spec posts a non-JSON CT; the app's own
  client sets the header).
- The standing suite: first run 27/35 (8 accent-volume failures — every one the
  documented 4GB-sandbox browser-OOM class, "Target crashed", with two agent-browser
  sessions open and the same-family light-midband stage GREEN mid-run); **re-run
  quiet: all 8 green, zero findings** (exit 0 each) — environmental, not code (the
  S117 lesson-4 protocol).
- Census movement: unit 936 → **944** (+8: auth +5, validation +3); e2e 474 → **476**
  (+2: the s23 cards round-trip pin, the auth-flows verify-429 pin).

## 4. Final census (the authoritative numbers — re-derived, not projected)

- **Vitest unit: 944/944** — 28 files (`bun run test`, cold).
- **Playwright e2e: 476/476** — the cold 5-chunk map **131 + 141 + 57 + 87 + 60**
  (`scripts/e2e-chunked-cert.sh`, fresh `db/e2e.db` per chunk), 30 spec files.
- **Total: 1420** (the README badge).
- lint clean; `tsc --noEmit` clean with **`noImplicitAny: true`**; the canonical
  build green with the standalone asset contract + the bundled `AUTH_SECRET=""`
  contract intact.
- Register: 249 importers / 130 Usage-line carriers / 0 stale (the 18th tripwire,
  holding exactly; the S117 cycle adds no new playwright-class scripts).
- Count-lockstep re-grepped before commit: README badge 1420 + the Session-117 row;
  AGENTS commands 944/476 (131+141+57+87+60); CLAUDE Unit bullet 944;
  vitest.config.ts header 944; PAD v1.3.25 revision block; the remediation-plan
  status header → Batch BR; the worklog entry; `docs/session_103.md`.

**Standing debt after Batch BR: ZERO.**
