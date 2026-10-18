# Omni-Study1 — Worklog

> The running work journal for the remediation/parity effort on
> `nordeim/omni-study1`. Newest sessions at the bottom. Session numbering
> follows the README remediation table (session-1 … session-54 are recorded
> there; this file starts at the session-55 continuation).

---

## Session 55 — parity re-application, account flows, regression hardening

**Context.** The workspace was reset a fifth time mid-stream (the s21–s23
chunk had just gone green). The insurance-push strategy held: remote `main`
preserved the chrome baseline (`cf23159`) plus every green batch pushed
before each reset (`c03bd05` S5 → `ff0a80f` S9 → `30d6cbe` RUM/export/import).
This session re-verified the workspace, finished the remaining superset
(s24–s26), and ran the first complete full-suite regression.

**Work log.**

1. **State recovery.** Re-cloned/verified; confirmed remote main == local
   HEAD at `30d6cbe`; rebuilt the push infrastructure
   (`/home/z/ssh-infra/`: ed25519 key + paramiko GIT_SSH shim + `push_main.py`).
2. **s24–s26 decode + completion.** The change-password / delete-account /
   change-email routes and the three Settings Profile cards existed but
   failed their pins. Fixed: `aria-label`s on all three card sections, the
   "Update the address you use to sign in" + "Update email address" copy
   pins, the Danger-zone "Confirmation" label, the 409 duplicate-email copy,
   the Profile tab intro line ("Your account and study information."), the
   EmailCard identity `<p>` → `<div>` (S26 strict-mode collision with the
   Account card `<p>`), and the S26 live identity slice (store `setEmail` +
   `onEmailChanged` re-render both the sidebar footer and the Profile
   identity block). **18/18 green** → commit `5fdfd99` pushed.
3. **Login limiter progressive reset (product fix).** Three specs document
   "successful logins RESET the IP limiter"; the route never reset it and the
   suite's 11th loopback login 429'd. Added `resetRateLimit` on successful
   credential verification. Auth chunks re-verified green.
4. **Full e2e regression (six chunks).** chrome 94→**104** (incl. s14) ·
   S5+calc+S6 **46** · S7+S8+S9 **79** · tasks/resilience/s16/s17 **20** ·
   auth+s18–s23 **35** · s24–s26 **18**. Unit **834/834**. Residuals decoded
   and fixed during the sweep (commit `1356c52`, then `d3a1d74`):
   - theme-system mobile-chip locator → exact class token (the S8 softest-
     tint header carried the `bg-sf-primary-soft` substring on its dark
     variant and won DOM order while hidden);
   - studygroups right-pane hint superset copy satisfying S8-H ("Select a
     group") and S9-S (the full reference sentence) simultaneously;
   - **sf-today-tint restored as the single today-tint contract** — light
     violet-50 softest branch + raw-rgb dark branch, satisfying the
     dark-mode rgb-serialization pin (the `/30` opacity modifier emitted
     `color-mix(in oklab)`), the forced-colors outline pin, and the
     exact-token locator pin at once;
   - notes mobile h2 hoisted out of the selected-note branch (the s52
     drawer flow found no heading at 390px in the unselected state).
5. **Evidence.** 34 screenshots captured from the running remediated build
   into `docs/screenshots/` (16 desktop views, the Settings Profile card
   chain, the mobile set including the open drawer, the login card).
6. **Docs.** `docs/remediation-plan.md` written (the full findings→fix→guard
   record); README Session-55 row added; `omni-study1_SKILL.md` regenerated
   (v2.0.0 — AP-91…AP-96, the chunk map, the security note, the session-55
   lessons) per the distill skills; the superseded `omni-study_SKILL.md`
   removed and the CLAUDE.md doc-chain pointer updated.

**Stage summary.**

- Final gates: lint ✓ · tsc ✓ · build ✓ (REAL_EXIT verified) · 834 unit ✓ ·
  298 e2e + setup ✓ — all on `main`, no branches.
- Commits this session: `5fdfd99` (s24–s26 + limiter) · `1356c52`
  (regression residuals) · `d3a1d74` (sf-today-tint + notes h2) · the final
  docs/worklog commit.
- Key standing guards added: the progressive limiter reset, the
  `sf-today-tint` utility contract, the exact-token locator rule, the
  status-gated two-layer hydration gate (re-verified), and the union-based
  nullable-ID atoms (re-verified).
