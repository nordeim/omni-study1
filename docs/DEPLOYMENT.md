# Deployment Guide

ORBITAL ships as a single Next.js **standalone** build with a SQLite file
database — one process, zero external services. This guide covers the
supported production paths and the environment contract.

## 1. Build

```bash
bun install
bun run build          # next build + standalone assembly (.next/standalone)
```

The build compiles the page shell and the 16 API route handlers, then copies
`.next/static` and `public/` into `.next/standalone/` (see the `build`
script in `package.json`). `next.config.ts` pins `outputFileTracingRoot` to
the repo root — keep it; the standalone trace depends on it.

## 2. Run

```bash
bun run start          # NODE_ENV=production bun .next/standalone/server.js
```

The server listens on port 3000 by default (`PORT` overrides). Always start
it from the repo root via the npm/bun script — the scripts guarantee the
working directory that the SQLite path resolution and the standalone trace
rely on. Behind a reverse proxy, forward `X-Forwarded-Proto` so cookie
attributes derive the right scheme (S120/BU15 — the app reads it), and
declare `TRUSTED_PROXY_HOPS` so the auth rate-limiter's per-IP budgets
key on the REAL client address, not a forged `x-forwarded-for` hop
(S120/BU3 — the PAD §6.4 proxy-hop reopen trigger's off-switch).
**S132/CG10 — the port-isolation presumption:** `TRUSTED_PROXY_HOPS≥1`
presumes the app's port is reachable ONLY through the declared proxies.
Bind the app to loopback / an internal interface (or firewall the port)
so clients cannot reach it directly — a DIRECTLY-reachable app accepts a
wholly forged `x-forwarded-for`, including the trusted rightmost hop, and
every per-IP budget keys on attacker-chosen strings. The hop count
declares your proxy chain's depth; the network boundary is what makes the
declaration true.

## 3. Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | SQLite connection string. See §4. |
| `AUTH_SECRET` | **Yes in production — enforced at boot** | HMAC secret for session cookies. Generate with `openssl rand -hex 32`. **The session-22 boot guard refuses to start the production server without a real secret** (missing/empty/the public dev constant → the process exits with the remedy message; dev/test keep the zero-config fallback with a one-line boot warning). |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical public origin, used for metadata URLs and `sitemap.xml` (e.g. `https://orbital.example.com`). |
| `SEED_DEMO` | No (default: on) | `0` skips the demo account in `bun run db:seed` and the Docker `init` profile — see §8 "The demo account" (S120/BU21; fail-safe: unrecognized values skip too). |
| `TRUSTED_PROXY_HOPS` | No (behind a proxy: recommended) | The `x-forwarded-for` hop depth for the auth limiter's per-IP keys: unset → first-hop default; `0` → never trust; `N≥1` → Nth hop from the right, failing closed (S120/BU3). NOTE (S132/CG10): N≥1 presumes PORT ISOLATION — the app port must be reachable only through the declared proxies (bind loopback / an internal interface, or firewall it); a directly-reachable app accepts a wholly forged x-forwarded-for, including the trusted rightmost hop. NOTE (S131/CF2): `0` in production boots with a WARNING — the direct-exposure posture shares ONE rate-limit bucket per auth family (login/register/verify/resend/forgot/reset), so ten anonymous requests lock out sitewide auth for 15-minute windows; the App Router exposes no per-connection address, so the remedy is the proxy + hop depth, not a code change. The per-ACCOUNT budgets (login/verify) still contain the credential-guessing halves. NOTE (S136/CK1): login also carries a process-wide `loginGlobal:` containment budget (40/15-min, the registerGlobal doctrine mirrored) — every login burns ~0.5 s of synchronous scrypt by design, so a rotated-XFF flood of non-existent emails (the shape that skips every per-key budget) is bounded sitewide; only FAILED logins accumulate (the attack shape never succeeds), and the volume-containment 429 copies the per-IP 429 exactly. A sustained burst of >40 net FAILED logins sitewide trips it (a 429 on the next attempt); the window resets with the 15-minute rollover. NOTE (S153/DB1): the success-side discharge is CAPPED per window (20) — a success NETS 0 on the global (the S138/CM3 discharge returns the success's own increment, never a prior fail's), and under the cap a SUCCESS-ONLY loop of scripted own credentials (the default in-band posture makes credentials scriptable) still trips the aggregate within 40+20 admitted requests per window; without the cap such a loop burned the scrypt pair per request with nothing bounding it. NOTE (S153/DB4, the accepted fixed-window trade-off): the three process-wide budgets (loginGlobal:/registerGlobal:/authBurnGlobal:) gate BEFORE body validation by design (the bounded-reader + anti-bypass convention), so a ~40-request garbage-body flood — zero scrypt cost, the burn sits after the parse — pins the respective global for the rest of its window: sitewide login/register/auth-rotation answer 429 for up to 15 minutes, renewable at ~40 cheap requests. The window self-heals at rollover, every 429 serves Retry-After, and the per-account guessing bounds are unaffected; the alternative (validating before the global) would un-bound the garbage flood entirely and is rejected. |
| `DISABLE_IN_APP_OTP` / `DISABLE_IN_APP_RESET` | No (exposed deployments: REQUIRED) | Gate the in-response OTP/reset-link delivery (the ADR-013 posture's off-switch — responses become shape-identical `{ok:true}`, S120/BU2). All four gates are declared in `docker-compose.yml`'s environments (S121/BV3) — the host env reaches the container. **S127/CB14**: with either gate unset in production, the server boot WARNS — the in-band channels hand the one-shot takeover link / OTP code to any caller who knows an email, and the response shape is an account-existence oracle. Registration is open, so any internet-facing deployment is multi-user BY CONSTRUCTION: set both gates and provide real mail transport before exposing the app. |

## 4. Database location (§4 — the `.env.example` reference)

`DATABASE_URL` accepts three forms:

1. **Relative `file:` URL (the default, zero-config local story).**
   ```
   DATABASE_URL="file:../db/custom.db"
   ```
   Relative URLs resolve against the **`prisma/` directory that owns
   `schema.prisma`** — exactly like the Prisma CLI — so this string points
   at `<repo>/db/custom.db` for `prisma db push`, `prisma/seed.ts`,
   `next build` and the running server alike, regardless of the process
   working directory. The resolution rule lives in
   `src/lib/db-path.ts` and is pinned by `tests/db-path.test.ts`.

2. **Absolute `file:` URL (recommended for production).**
   ```
   DATABASE_URL="file:/var/lib/orbital/custom.db"
   ```
   Absolute paths pass through untouched — immune to any working-directory
   ambiguity across service managers, containers, or cron wrappers. Point
   them at a persisted volume and back the file up.

3. **PostgreSQL.** Switch `provider = "postgresql"` in
   `prisma/schema.prisma`, set a `postgresql://` URL, then
   `bun run db:push && bun run db:seed`.

Initialize (or reset) the database with:

```bash
bun run db:push        # apply schema (db push — no migrations folder)
bun run db:seed        # idempotent demo workspace (S155/DD2a: early-returns if
                       # the demo user exists — to reseed, delete db/custom.db
                       # then re-push + re-seed; wiping is db:reset)
```

`db/*.db` is gitignored; every fresh clone recreates it from the two
commands above.

## 4b. Password hashing (S134/CI1 — the scrypt KDF contract)

Stored password hashes ride the versioned 6-part format
`scrypt$<N>$<r>$<p>$<salt>$<key>` at the OWASP floor (N=2^17, r=8, p=1).
Two operational facts:

- **Aged deployments (pre-S134 rows, the legacy 3-part form) need NO
  migration step**: the legacy form still verifies, and every successful
  login upgrades the row in place (the rehash-on-login drain). The drain
  is transparent and per-account.
- **The login path costs ~0.5–1 s of scrypt per attempt by design** (the
  timing-equalizer pair: one legacy-parameter burn + one current-parameter
  burn on every branch — the account-existence timing-oracle closure).
  This is imperceptible interactively and bounded by the 10/IP/15-min and
  10/account/15-min budgets; do NOT "optimize" it away. Register /
  change-password / reset burn once (~0.5–0.9 s).

## 5. Updating

```bash
git pull
bun install
bunx prisma generate   # after schema changes
bun run db:push
bun run build
# restart the server process
```

## 6. Verification checklist

```bash
curl -s https://your-host/api/health          # {"status":"ok",...}
bun run lint && bun run typecheck && bun run test
bun run test:e2e                              # Playwright suite (local)
```

(S155/DD2b: this checklist previously carried `./scripts/smoke-test.sh` —
a pre-clone scaffold residue that never existed in this tree; the
`test:e2e` line above is the real local e2e gate.)

## 7. Common production issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| `Error code 14: Unable to open the database file` | Server started from a directory that has no `prisma/schema.prisma` and no absolute `DATABASE_URL` | Start via `bun run start`, or set an absolute `file:` URL (§4) |
| Logins loop back to `/login` | `AUTH_SECRET` changed between restarts | Keep the secret stable across restarts |
| The server exits at boot: `AUTH_SECRET is required in production` | The session-22 boot guard fired — the server refuses to sign sessions with the public dev constant | Generate a real secret (`openssl rand -hex 32`), export `AUTH_SECRET`, restart (this section + §4) |
| Rate-limited logins (429) | 10 attempts/IP/15 min fixed window | Wait for `Retry-After`, or restart to clear the in-memory buckets (single-node) |

## 8. Docker (one-command containerized deployment)

The repo ships a production `Dockerfile` + `docker-compose.yml`
(session-18). The container runs the same standalone server as
`bun run start` — the app code is unchanged by containerization; only
the environment contract moves (§4 form-2: the absolute `file:` URL).

```bash
# 1. First run — initialize the SQLite volume (schema + demo seed),
#    then start the app:
AUTH_SECRET="$(openssl rand -hex 32)" docker compose --profile init up -d

# 2. Subsequent runs:
docker compose up -d

# 3. Verify:
curl -s http://localhost:3000/api/health     # {"status":"ok","db":"up",...}
```

What the compose file does:

| Piece | Purpose |
|---|---|
| `studyflow` service | The standalone server on :3000 (`STUDYFLOW_PORT` remaps), `/data` volume for SQLite, healthcheck on `/api/health` |
| `init` service (`--profile init`) | One-shot `prisma db push` + the idempotent seed onto the same volume |
| `db-data` volume | The SQLite file (`file:/data/custom.db`) — survives container rebuilds |
| `AUTH_SECRET` | **Required** — compose refuses to boot with the placeholder (§3) |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for metadata URLs and `sitemap.xml`. **Two surfaces (S117/BR7):** the runtime env var covers the API routes that read it at request time (e.g. the forgot-password reset URL), while `sitemap.xml`/`robots.txt`/`metadataBase` are **statically prerendered at build time** — set the same value as a Docker BUILD ARG (`docker build --build-arg NEXT_PUBLIC_SITE_URL=https://…`, wired in the Dockerfile) or those artifacts ship with the baked `localhost:3000` default |

Notes:

- **The image carries no database bytes.** The build context ignores
  `db/`, the output tracer's stale `.next/standalone/db/` snapshot is
  removed in the runtime stage, and the absolute `DATABASE_URL` points
  at the volume regardless.
- **Validation status (honest caveat):** the layout was validated
  end-to-end OUTSIDE Docker (a local simulation of the exact runtime
  filesystem: prod-deps overlay + standalone + `src/lib` + `prisma/`,
  then `db push` → seed → boot → health/login/RUM checks — see
  `scripts/docker-layout-sim-s27.sh`), but the dev sandbox that
  authored it has no Docker daemon. The first
  `docker compose --profile init up` on a Docker host is the remaining
  verification step; report any divergence as an issue.
- **Schema updates:** re-run the init profile after `git pull` +
  rebuild (`docker compose build && docker compose --profile init run
  --rm init` — the push is additive/idempotent). **S126/CA20 — the
  upgrade-path caution:** the init profile runs `prisma db push
  --accept-data-loss` against the production `/data` volume; after an
  image upgrade that carries a BREAKING schema change (a dropped/retyped
  column), that flag silently discards the affected data. Review the new
  image's schema diff (or the push command's drift report) before
  re-running init on a valued volume; the no-migrations-folder posture is
  the documented single-node trade-off (§"Known limitations"). Also note
  the first-boot race: the app starts concurrently with the one-shot push
  + seed, so early requests 500 until the schema lands (absorbed by the
  healthcheck's start period).
- **The demo account + `SEED_DEMO` (S120/BU21).** The idempotent seed
  creates a public-credentials login — `demo@studyflow.app` /
  `Demo1234!`, `emailVerified: true` — which is right for a local
  quickstart but is a live public login on an exposed deployment. Set
  `SEED_DEMO=0` to skip it entirely: `AUTH_SECRET="$(openssl rand -hex
  32)" SEED_DEMO=0 docker compose --profile init up -d` (the variable is
  declared in the compose `init` service's environment, so the command
  reaches the seed through compose — S121/BV3 wired the passthrough; also
  honored by `bun run db:seed`; unset/empty keeps the documented default —
  seed; the gate is fail-safe, an unrecognized value skips too). To
  remove the account after a seeded first run, register your own
  account, then delete the demo rows (they are all scoped by
  `userId`): the account settings' delete-account flow at
  `/Settings` removes the demo user and its rows once you are signed
  in as it — or, before any real data exists, stop the stack, delete
  the volume (`docker volume rm …db-data`), and re-run the init
  profile with `SEED_DEMO=0`.
- **The non-root runtime + volume ownership (S138/CM8 + S139/CN9).** The
  runtime stage drops to the base image's non-root `bun` user and chowns
  `/data` (the only writable path the server needs). The compose `init`
  service carries no `user:` override, so it runs as the same image user —
  the **named-volume** path (`db-data`, the documented default) works
  because the image's chown rides into a fresh named volume. A
  **bind-mounted** `/data` (a host directory) does NOT get that chown:
  a root-owned host dir fails the SQLite open/write at first boot with
  EACCES as the `bun` user. Chown the host directory to the container's
  bun uid before first run (on the oven/bun base that is uid 1000), or
  run the one-shot init once with `--user 0:0` and an explicit
  `chown -R 1000:1000 /data` step before starting the runtime.
- **PostgreSQL** (§4 form-3) works in containers too: set the
  `DATABASE_URL` service environment to the postgres URL and leave the
  volume unmounted.

### 8.1 After deployment: see your field data

Once the app is up and you (or your users) have visited it, the RUM
beacon has been collecting real Core Web Vitals. The visible inspection
surface is the auth-gated **diagnostics panel at `/rum`** (session-19) —
sign in, then navigate to `https://your-host/rum`: the five metrics at
p75 with rating badges derived from the public CWV bounds, the samples
line, and the ten most recent events. The panel is URL-direct (it is
deliberately linked from nowhere — the app shell's parity is
byte-preserved) and themes with your account's dark mode + accent. The
scriptable contract remains `GET /api/rum` (same auth, JSON) for
curl/monitoring use.

Session-20 (v3) additions: each sampled card carries a **sparkline**
(the metric's 20 most recent samples, oldest → newest — the trend at a
glance: "is my LCP drifting?"), and the panel's **Export CSV** action
downloads your most recent 2000 events as a spreadsheet-ready CSV
(`GET /api/rum/export` — same auth, `text/csv`, RFC-4180 escaping, raw
values) for offline analysis.

### 8.2 After deployment: take your data with you

The full-data export (session-21) is the "own your data" exit: the
auth-gated **export page at `/export`** — sign in, then navigate to
`https://your-host/export` — previews the 20 content collections as a
count grid and documents the format. The **Download JSON** action (or
the scriptable `GET /api/export/data` — same auth, `application/json`)
returns the complete versioned envelope: every collection in
chronological order with ids and foreign keys intact, your profile
(without the password hash), uploaded files with their payloads, and a
per-collection count summary. VerificationToken/PasswordResetToken and
RUM telemetry are excluded by design (the RUM CSV on `/rum` is the
telemetry dump). The export is a point-in-time download, not a sync —
re-download after meaningful changes; the SQLite volume (§4) remains
the full-fidelity backup.

**Restoring (session-23):** the same file imports back — the
**Restore from a backup** card on the `/export` page takes a downloaded
`studyflow-data-*.json` (up to 25 MiB) and restores it into the signed-in
account. Rows match by id: existing rows update to the file's values,
new ones are created, nothing is ever deleted, and the whole import
either completes or rolls back completely (a failed import changes
nothing). Your account identity, password, and sign-in are never
touched — an import restores content only. Because the envelope carries
no user ids, it imports into ANY account: the data-loss recovery story
is register fresh → sign in → import (`POST /api/import/data` is the
scriptable form — same auth, a 10-import/15-minute budget). For a full
reset-to-snapshot restore, stop the server, wipe the SQLite volume (or
`bun run db:reset` locally), re-create the account, then import.

### 8.3 After deployment: rotate your password (session-24)

A signed-in owner rotates their own password from **Settings → Profile**
— the **Change password** card below the profile fields: current
password, new password, confirm. The route (`POST /api/auth/change-password`)
verifies the current password FIRST (a wrong current password is
rejected with 400 and changes nothing), applies the same policy as
registration (8–200 characters), and rejects a new password identical
to the current one. Rate-limited to 10 changes per 15 minutes per
account. Your session stays signed in across your own rotation (the
cookie is signed with `AUTH_SECRET`, not the password) — other already
issued sessions also remain valid; if you ever need to invalidate
them, rotate `AUTH_SECRET` and restart (all sessions re-validate
against the new secret). No email is sent on change (no SMTP by
design, §3) — the on-screen "Password updated." note is the
acknowledgment.

### 8.4 After deployment: delete an account (session-25)

A signed-in owner permanently deletes their own account from
**Settings → Profile** — the **Danger zone** card below the Change
password card. The flow is deliberately two-step: click **Delete
account…** to reveal the confirmation form, then enter the account
password and type the word `DELETE` (case-exact) before the
**Permanently delete my account** button fires. The route
(`POST /api/auth/delete-account`) verifies the password FIRST (a
wrong password is rejected with 400 and changes nothing), is
rate-limited to 10 attempts per 15 minutes per account, then performs
ONE cascade write: every owned row goes — subjects, tasks, notes,
flashcards, grades, files, chat history, telemetry, and the account
record itself. The session cookie is cleared with the account and the
browser lands on `/login`. There is no soft-delete and no undo: to keep
a copy, download your data from the `/export` page FIRST (§8.2) — the
card's warning copy points there. Deleting a household member's
account is the same flow signed in as them (there is deliberately no
admin-deletes-others surface); for bulk/manual removal the SQLite file
remains the operator's escape hatch.

### 8.5 After deployment: change the sign-in email (session-26)

A signed-in owner changes the address they log in with from
**Settings → Profile** — the **Email address** card above the Change
password card. Enter the new address TWICE (the confirm field guards
the typo lockout: a mistyped address is unrecoverable through the UI —
the next sign-in needs the new address) plus the account password,
then click **Update email address**. The route
(`POST /api/auth/change-email`) verifies the password FIRST (a wrong
password is rejected with 400 and changes nothing), is rate-limited to
10 attempts per 15 minutes per account, then checks that the new
address differs from the current one (400 otherwise) and is not owned
by ANY existing account (409 otherwise — including unverified ones).
The write moves the login identifier (stored lowercased);
`emailVerified` STAYS true — with no SMTP, a re-verification code
would surface to the same person who just proved the password, so the
password proof IS the verification. The current session SURVIVES the
change (the cookie is signed over the user id, not the email) and the
Profile identity block + sidebar footer update live. **Sign in with
the NEW address next time** — the old address no longer resolves (the
uniform "Invalid email or password" error, no enumeration signal).
