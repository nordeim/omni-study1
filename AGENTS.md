# AGENTS.md

High-signal instructions for coding agents working in this repo. Everything here was learned the hard way — skip it and you will re-derive it.

## Commands

| Command | Purpose |
|---------|---------|
| `bun install` | Install deps (Bun ≥ 1.3) |
| `bun run dev` | Dev server on :3000 (Turbopack), logs tee'd to `dev.log` |
| `bun run lint` / `bun run typecheck` | ESLint / `tsc --noEmit` — both must be clean |
| `bun run test` | Vitest unit layer (936 tests; `*.test.ts` only — never picks up e2e specs) |
| `bun run build` | Production build → `.next/standalone` (**required before e2e**) |
| `bun run test:e2e` | Playwright vs the standalone build on :3100 with `db/e2e.db` (474 tests across the 5-chunk cold map — 131+141+57+87+58, 30 spec files; a single-process full run trips the register rate-limiter budget by design, the chunked map re-boots the server per chunk). NOTE (S45, the day-boundary lesson): the global setup re-seeds every run, but the seed's IDEMPOTENT UPSERTS do NOT refresh day-relative dates on existing rows — a scratch `db/e2e.db` that ages across a UTC midnight keeps its original day-relative dates (today's tasks, the +1-day exam badge, the due-in pills, the import round-trip dates each read one day stale → 4 deterministic failures in parity-session6/parity-session9/s23-import). Delete `db/e2e.db` when a run crosses a day boundary — the global setup re-creates it fresh with current dates. NOTE (S46, TWO more aged-scratch-db classes + a build-input one): (1) ALWAYS run e2e COLD — `rm -f db/e2e.db` before every full run: the s23-import round-trip posts a FIXED-id envelope, so a second consecutive run against the aged db reads `created: 0, updated: 1` instead of `created: 1, updated: 0` and fails — not just across midnights, across ANY re-run; (2) the s22 negative-spawn spec reads the BUNDLED `.env` — Next's standalone output COPIES the repo-root `.env` into `.next/standalone/.env` at build time, so a REAL AUTH_SECRET in the dev `.env` leaks into the bundle and the guard CORRECTLY boots (the spec times out waiting for the exit) — keep the repo-root `.env`'s AUTH_SECRET EMPTY (the `.env.example` dev posture: `AUTH_SECRET=""` — dev falls back to the local constant with the boot warning) when building for e2e |
| `node scripts/capture-studyflow.mjs` | Refresh all 31 `docs/screenshots/` captures from the dev server (24 light + 7 dark) |
| `node scripts/dark-sweep.mjs` | Dark-mode contrast audit over all 20 views (flashbulb/unreadable detector). S27: sets dark mode through the settings API (the real lifecycle) and SELF-VERIFIES the precondition — fails loudly (exit 1, no findings) if the dark class is not applied; the applied mode rides the JSON envelope. Never force the class directly (the session-10 approach silently rotted after S11) |
| `node scripts/accent-dark-sweep.mjs` | Accent × dark-mode audit (S38-extended): all 7 accents × 20 desktop views × 20 MOBILE views at 390×844 + the drawer per accent (FAIL <2.2, WARN <3.2 for accent text; the mobile records also carry scrollWidth — >390 is a finding). The S38 shape is unit-pinned anti-phantom: every view recorded EXPLICITLY on both surfaces (clean views carry empty detector arrays), the per-accent `applied` self-verified readings + `mode: "dark"` + `mobileViewport` ride the envelope, and the seam's ALL-ACCENTS + ALL-VIEWS + drawer-present guards make every silently-skipped dimension a LOUD shape-error (the pre-S38 mobile pass swept only 6 views — MOBILE_VIEWS — and the omission-means-clean recording could not distinguish "clean because measured" from "clean because never rendered") |
| `node scripts/forced-colors-sweep.mjs` | Forced-colors (Windows HC) audit: all 20 views + drawer + reference baseline (invisible-text / unbounded-control / state-probe detectors) |
| `node scripts/print-audit.mjs` | Print audit: print-media text colors in BOTH modes + real A4 `page.pdf()` renders + overflow probes (pre-applies print emulation — the real Ctrl+P pipeline) |
| `node scripts/focus-order-audit.mjs` | Keyboard Tab-stop recording over the two-pane views + dialog/drawer trap verification |
| `node scripts/mobile-sweep.mjs` | The S33 mobile light-mode sweep (390×844): all 20 views navigated THROUGH THE DRAWER (the mobile navigation menu is the vehicle — the manual walkthrough every session ran as prose, encoded as a standing probe; the AP-78 lesson). Per view: the identity heading renders (h1 OR h2 — the two-pane mobile stacks use an h2, the S8-H pattern), NO horizontal overflow (scrollWidth ≤ 390 — the S16 mobile-only-gap class), the drawer closed on navigation, the fixed glass app bar (brand + 2-digit-hour clock), zero console errors. Self-verifying preconditions (the S27 doctrine): the viewport is asserted, light mode is PATCHed through the settings API and verified on `<html>`; the closing restore is an explicit awaited light PATCH
| `node scripts/midband-sweep.mjs` | The S34 mid-band light-mode sweep (768×1024 — the md breakpoint, iPad portrait, the switchiest width in the 391–1023px band the standing surface never probed): all 20 views navigated THROUGH THE DRAWER (the navigation vehicle through the whole band — the sidebar is lg:flex, so below 1024 the drawer is the only vehicle), asserting per view the S33 family (identity heading h1-or-h2, scrollWidth ≤ 768 — the Timetable's min-w-[900px] canvas must live INSIDE its overflow-x-auto container, drawer-closes-on-navigation, the fixed glass app bar, zero console errors) + the chrome vehicle-contract precondition (the desktop sidebar hidden + the hamburger visible at 768 — a broken lg contract aborts loudly). Self-verifying preconditions (the S27/S32/S33 doctrine): the viewport asserted, light mode PATCHed through the settings API and verified on `<html>`; the closing restore is an explicit awaited light PATCH (the AP-79 lesson: a viewport band between pinned widths is a blind band) |
| `node scripts/landscape-sweep.mjs` | The S35 phone-landscape short-viewport sweep (844×390 — the iPhone-class landscape, the representative of the 390–430px-tall band): the HEIGHT axis the standing surface never varied — every pinned viewport was portrait-tall (heights 800–1024), and the height-dependent structures (the drawer nav whose scroll is the ONLY path to links 8–20 at 390 height [measured: scrollHeight 1068 vs clientHeight 301], the fixed h-16 app bar at 16% of the viewport, the pt-* heading clearance under it, the h-[calc(100vh-8rem)] panes at 262px) were guaranteed by nothing. All 20 views navigated THROUGH THE DRAWER, asserting per view the S33/S34 family + the heading CLEARANCE (the heading's top sits at/below the fixed 64px bar), plus the chrome vehicle-contract precondition + the SHORT-VIEWPORT contract (the nav MUST scroll at 390 height — a non-scrolling reading means the drawer geometry changed; the last link operable after scroll). Self-verifying preconditions (both viewport axes asserted, light mode PATCHed + verified; the AP-80 lesson: an axis never varied is an axis never verified) |
| `node scripts/dark-mobile-sweep.mjs` | The S36 dark-mode mobile sweep (390×844 — the S33 mobile sweep's dark sibling): the MODE axis at the mobile viewport the standing surface never varied — dark × mobile was covered for 6 of 20 views (accent-dark-sweep's mobile pass), 14 views had NEVER been rendered in dark at the stacked mobile layout by any standing audit, and every light mobile sweep is mode-rot-guarded by construction. All 20 views navigated THROUGH THE DRAWER in DARK mode (PATCHed through the settings API — the real lifecycle, self-verified on `<html>`), asserting per view the S33/S35 structural family (identity heading h1||h2, heading clearance under the fixed bar, scrollWidth ≤ 390, drawer closed, app bar + clock, zero console errors) PLUS the dark-sweep detector family (flashbulb + unreadable) extended to the mobile chrome (the `header *` scope — the app bar's brand + clock text must read dark-clean); the drawer's own dark rendering measured on the first open (the dark:bg-slate-950 panel). The dark detections are counted INDEPENDENTLY of the findings array at the seam (a probe that forgets to push a detector hit still reads NON-GREEN). The AP-81 lesson: a mode never varied at a viewport is a blind combo |
| `node scripts/accent-light-sweep.mjs` | The S37 accent × light sweep (390×844 — the mobile sweep's accent sibling in LIGHT mode): the ACCENT axis in LIGHT mode the standing surface never varied — the accent-dark-sweep varies the accent ONLY in dark (its own name is the blind spot), every light pin rides the default violet, and the only light × non-violet rendering in any standing artifact was ONE desktop calculator e2e view; NO standing audit had ever rendered ANY view in a non-violet accent in light mode. For EVERY accent (7 — the ALL-ACCENTS seam guard: an accent that silently did not run reads shape-error, never green-by-omission), PATCHed through the settings API and SELF-VERIFIED on `<html data-accent>`: all 20 views at 390×844 (direct goto) asserting per view the identity heading h1||h2, scrollWidth ≤ 390, the LIGHT contrast detector family (unreadable < 2.2 / lowcontrast < 3.2 WARN — the flashbulb class does not apply on the light canvas), zero console errors — PLUS the drawer per accent (the active-link 10%-alpha accent gradient read on the INNER span, the dialog-scoped detectors). Three signature-strict non-gap exemptions at the seam: the CTA-face (white on accent-500 — the S11 family-2), the calendar adjacent-month days (slate-300 1-2-digit text — the S6-G pin, re-verified live on the reference: identical rgb(203,213,225)), and the yellow priority-pill vocabulary (yellow-500 {high,medium,low} — the S6/S8 pin). The reference's accent picker saves but never re-themes (re-verified S3) — a SUPERSET-quality contract. The AP-82 lesson: an accent never varied in light is a blind half of the theme space |
| `node scripts/accent-midband-sweep.mjs` | The S39 accent × mid-band drawer-navigation sweep (768×1024 — the md breakpoint, the switchiest width in the 391–1023px band; the S38 summary's named next step): the accent × mid-band cell of the theme-space matrix the standing surface never probed (midband-sweep is light+violet only; the accent sweeps are 390/1280 only) AND the navigation-interaction gap — the accent sweeps navigate by direct goto, so the drawer's active-link accent tint was only ever read on the DASHBOARD link (once per accent); the active tint on a NON-Dashboard view, applied through the real navigation lifecycle (aria-current moves → the `.sf-nav-active` 10%-alpha `NAV_ACTIVE_GRADIENT_STOPS` gradient re-tints), was verified at ZERO views, ZERO accents, in either mode. For EVERY accent (7 — the ALL-ACCENTS guard), PATCHed through the settings API and SELF-VERIFIED on `<html data-accent>`: all 20 views navigated THROUGH THE DRAWER (the only vehicle below 1024; the chrome vehicle-contract precondition asserts the sidebar hidden + the hamburger visible) asserting per view the identity heading h1||h2, scrollWidth ≤ 768 (the Timetable min-w-[900px] canvas must live INSIDE its container), drawer-closes-on-navigation, the fixed glass app bar, the LIGHT contrast detector family, zero console errors (the 429-RUM filter) — PLUS the per-view interaction evidence: `activeLabel` (the aria-current link when read — MUST equal the view's own label: the active state follows the navigation) and `activeTint` (the inner-span gradient — "none" is the S8 no-var rot class, a FINDING) — PLUS the drawer record per accent (linkCount === 20, the dialog-scoped detectors, the active tint on the FINAL navigated view). Three signature-strict non-gap exemptions at the seam (the S37-exact set): the CTA-face, the calendar adjacent-month days, the yellow priority-pill vocabulary. The dark × mid-band combos remain the documented S36 non-gap family. The AP-84 lesson: an interaction never varied is an interaction never verified |
| `node scripts/accent-landscape-sweep.mjs` | The S40 accent × landscape drawer-navigation sweep (844×390 — the iPhone-class landscape, the 390–430px-tall band's canonical width; the S39 summary's named next step): the accent × landscape cell of the theme-space matrix the standing surface never probed (landscape-sweep is light+violet only; the accent sweeps are 390/768/1280 only) AND the drawer-navigation interaction at the SHORT viewport — the S39 interaction proof (activeLabel/activeTint per view through the drawer) lives at 768×1024 only. Per accent [7 — PATCHed + self-verified on `<html data-accent>`], all 20 views navigated THROUGH THE DRAWER with the S35 short-viewport contracts (the heading CLEARANCE under the fixed 64px bar; the nav scrollable at 390 height — re-measured per accent, the only path to links 8–20) + the S37 light contrast family + the per-view interaction evidence + the drawer record per accent with the tint on the FINAL navigated view; the dark × landscape combos remain the documented S36 non-gap family; the envelope ends with the S39-F flush-callback exit (AP-85 — the ~130KB envelope must ride the write's flush callback, never a bare process.exit) |
| `node scripts/accent-desktop-sweep.mjs` | The S41 desktop light-accent sidebar-navigation sweep (1280×800 — the canonical desktop width the dark family already sweeps; the S40 summary's named next step: the documented S37 bracketed non-gap): the desktop light-accent cell of the theme-space matrix the standing surface never probed (accent-dark covers 1280×800 in DARK only; the light accent sweeps are 390/768/844 only) AND the SIDEBAR-vehicle interaction gap — the desktop vehicle's active-link tint was verified at ZERO views, ZERO accents, in EITHER mode (the e2e pins read the tint on the Dashboard link only, violet only; accent-dark's desktop pass navigates by direct goto and never reads the sidebar's active link). Per accent [7 — PATCHed + self-verified on `<html data-accent>`], all 20 views navigated THROUGH THE SIDEBAR (the vehicle contract INVERTS: sidebarVisible true + hamburgerVisible false — the lg contract) with the sidebar-own scroll contract (the nav MUST be scrollable at 800 height — re-measured per accent, measured scrollHeight 1068 vs clientHeight 534, the only path to links ~13–20) + the per-view headingOffset (the content clears the fixed 260px sidebar — the lg:ml-[260px] contract) + the S37 light contrast family + the per-view interaction evidence (activeLabel/activeTint read DIRECTLY while each view is active — the sidebar is always in the DOM, no next-open indirection) + the sidebar record per accent (the aside-scoped detectors + the tint on the FINAL navigated view); the desktop dark accent family belongs to accent-dark-sweep; the envelope ends with the S39-F flush-callback exit (AP-85) |
| `node scripts/accent-volume-sweep.mjs` | The S42 data-volume × dark × accent stress (1280×800 — the S13 volume audit's own viewport; the S41 summary's named next step): the cross-axis cell the standing surface never probed — the S13 data-volume audit runs LIGHT + VIOLET only (zero theme references) and every theme-space sweep (S27–S41) runs at SEED volume, so the densest renderings (300 task rows / the 250-event terminal panel / the 200-note list) had never carried a theme variation AND the SIDEBAR's active-link tint had never been read through the navigation lifecycle in DARK mode (S41 proved it in light; accent-dark's goto pass never reads it). The probe inserts the S13 profile (300/200/250 marker rows) through Prisma and COUNT-VERIFIES the insert (a sweep that silently measured seed volume must never run — the volume self-verification precondition), then per accent [7 — PATCHed + self-verified on `<html data-accent>` + html.dark] sweeps the 7 volume-affected views (the S13 set: Dashboard, My Day, Tasks, Calendar, Events, Notes, Analytics — the other 13 render no task/note/event rows and stay covered by the S38/S41 seed sweeps) navigated THROUGH THE SIDEBAR, asserting per view the S41 desktop contracts (heading + headingOffset + sidebarVisible + scrollWidth ≤ 1280 + the interaction evidence activeLabel/activeTint in DARK — the never-read cell) PLUS the S38 dark detector family (flashbulbs — ALWAYS findings; unreadable < 2.2 with the CTA-face exemption ONLY — the light-mode calendar-day + yellow-pill exemptions do NOT apply in dark, those surfaces re-theme; lowcontrast = WARN) PLUS the S13 volume measurement family (nodes/mainNodes, the 1500ms long-task budget, the click→heading 1500ms interactivity budget — the sidebar click doubles as the measurement) + the sidebar record per accent (linkCount === 20) + the API stats once (the /api/tasks bytes ≤ 500KB bound — the S13 B1 class). Cleans up every marker row in every failure path (the catch-path restore + cleanup — the finally-race fix: the cleanup completes BEFORE the AP-85 flush-callback exit). The volume × LIGHT family is the documented bracketed non-gap (S13 light × violet × volume + S37–S41 light × accent × seed) |
| `node scripts/accent-volume-light-sweep.mjs` | The S43 data-volume × LIGHT × accent stress (1280×800 — the S13 volume audit's own viewport; the S42 summary's own first named next candidate: the documented bracketed non-gap, now closed): the light half of the volume × theme cross-axis — the S13 data-volume audit runs light + violet only (zero theme references), the S37–S41 light-accent sweeps run at seed volume, and the S42 accent-volume-sweep runs dark only, so the densest renderings had never carried an accent in LIGHT. 7 accents × the 7 volume-affected views (the S13 set) navigated THROUGH THE SIDEBAR under the COUNT-verified 300/200/250 profile (inserted via Prisma + count-verified BEFORE measuring — a sweep that silently measured seed volume must never run), with the S13 budgets (long tasks ≤ 1500ms, click→heading ≤ 1500ms, the /api/tasks ≤ 500KB B1 bound), the LIGHT checker (unreadable < 2.2 with the THREE signature-strict light exemptions — the CTA-face + the calendar adjacent-month slate-300 days + the yellow-500 priority-pill vocabulary; lowcontrast < 3.2 = WARN; NO flashbulbs — that class exists only in dark), and the interaction evidence in LIGHT at volume (activeTint/activeLabel — the light × volume cell: S41 proved light at seed, S42 dark at volume). The S42 finally-race fix from birth (the cleanup completes BEFORE the AP-85 flush-callback exit) |
| `node scripts/accent-volume-dark-mobile-sweep.mjs` | The S44 dark × mobile × volume stress (390×844 — the S33/S36 mobile class; the S43 summary's own first named next candidate: the documented bracketed non-gap, now closed): the mobile half of the volume × theme cross-axis — the S13 data-volume audit runs 1280×800 light+violet only (zero theme references), every mobile-viewport sweep (S33–S37/S39/S40) runs at seed volume, and the S42/S43 volume × accent sweeps run 1280×800 only (their viewport guards read the desktop — the viewport axis is their blind spot), so the densest renderings had never been rendered in dark at the stacked mobile layout under ANY accent. 7 accents × the 7 volume-affected views (the S13 set) navigated THROUGH THE DRAWER (the only vehicle below 1024) under the COUNT-verified 300/200/250 profile (inserted via Prisma + count-verified BEFORE measuring), with the MOBILE vehicle contract (sidebar hidden + hamburger visible — the INVERSE of the desktop seams) + the drawer-own nav-scroll contract (the nav MUST scroll at 844 height — the only path to links ~14–20), the mobile structural family at volume (the drawer closes on navigation, the fixed glass app bar with the 2-digit-hour clock, the heading clearance under the 64px bar), the S13 budgets (long tasks ≤ 1500ms, the drawer-click→heading ≤ 1500ms over the drawer-close + view-mount path, the /api/tasks ≤ 500KB B1 bound), the DARK checker (flashbulbs ALWAYS findings; unreadable < 2.2 with the CTA-face exemption ONLY — the light-mode calendar-day + yellow-pill exemptions do NOT apply in dark, those surfaces re-theme; lowcontrast < 3.2 = WARN), and the interaction evidence in DARK at MOBILE at volume (activeTint/activeLabel read at the NEXT drawer open — the pendingView pattern: S36 proved dark × mobile at seed, S40 accent × drawer at seed light, S42 dark × volume at desktop). The S42 finally-race fix from birth (the cleanup completes BEFORE the AP-85 flush-callback exit) |
| `node scripts/accent-volume-light-mobile-sweep.mjs` | The S45 light × mobile × volume stress (390×844 — the S44 summary's own first named next candidate: the documented bracketed non-gap, now closed): the light half of the mobile volume cross-axis — the S13 data-volume audit runs 1280×800 light+violet only (zero accent references), every mobile-viewport sweep runs at seed volume, the S42/S43 volume × accent sweeps run 1280×800 only, and the S44 dark-mobile volume sweep is DARK only (its mode precondition — the mode axis is its blind spot), so the densest renderings had never been rendered in LIGHT at the stacked mobile layout under ANY accent. 7 accents × the 7 volume-affected views (the S13 set) navigated THROUGH THE DRAWER (the only vehicle below 1024) in LIGHT under the COUNT-verified 300/200/250 profile (inserted via Prisma + count-verified BEFORE measuring), with the MOBILE vehicle contract (sidebar hidden + hamburger visible — the INVERSE of the desktop seams) + the drawer-own nav-scroll contract (the nav MUST scroll at 844 height — the only path to links ~14–20), the mobile structural family at volume (the drawer closes on navigation, the fixed glass app bar with the 2-digit-hour clock, the heading clearance under the 64px bar), the S13 budgets (long tasks ≤ 1500ms, the drawer-click→heading ≤ 1500ms over the drawer-close + view-mount path, the /api/tasks ≤ 500KB B1 bound), the LIGHT checker with the THREE signature-strict light exemptions (the CTA-face white-on-accent + the calendar adjacent-month slate-300 + the yellow priority-pill yellow-500 — the reference's own design in light; NO flashbulbs — the class exists only in dark, light surfaces are by-design on the light canvas), the light-mode hydration gate (the greeting heading — the S43 lesson: `!html.dark` is TRUE at first paint, so the gate is the POST-MOUNT observable), and the interaction evidence in LIGHT at MOBILE at volume (activeTint/activeLabel read at the NEXT drawer open — the pendingView pattern: S37 proved light × accent at mobile at seed, S40 accent × drawer at seed light, S43 light × volume at desktop). The S42 finally-race fix from birth (the cleanup completes BEFORE the AP-85 flush-callback exit) |
| `node scripts/accent-volume-dark-midband-sweep.mjs` | The S46 dark × mid-band × volume stress (768×1024, the md breakpoint — the S45 summary's own first named next candidate: the mid-band/landscape × volume cells, the dark half first, the S42→S43 / S44→S45 family pattern): the dark half of the mid-band volume cross-axis — the S13 data-volume audit runs 1280×800 light+violet only (zero theme references), the S34/S39 mid-band sweeps run LIGHT at SEED volume (the mode + volume axes are their blind spots), the S42–S45 volume × accent sweeps run 1280/390 only (their VIEWPORT constants grep-verified), and NO dark sweep runs at 768 at all, so the densest renderings had never been rendered in DARK at the 768×1024 stacked layout under ANY accent. 7 accents × the 7 volume-affected views (the S13 set) navigated THROUGH THE DRAWER (the only vehicle below 1024) in DARK under the COUNT-verified 300/200/250 profile (inserted via Prisma + count-verified BEFORE measuring), with the MID-BAND vehicle contract (sidebar hidden + hamburger visible — the below-lg family, the S34/S39 doctrine at volume) + the drawer-own nav-scroll contract at the mid-band geometry (the nav MUST scroll at 1024 height — scrollHeight 1068 vs clientHeight ~935, measured: links ~17–20 sit below the fold), the below-lg structural family at volume (the drawer closes on navigation, the fixed glass app bar with the 2-digit-hour clock — lg:hidden, identical at 768, the heading clearance under the 64px bar), the S13 budgets (long tasks ≤ 1500ms, the drawer-click→heading ≤ 1500ms over the drawer-close + view-mount path, the /api/tasks ≤ 500KB B1 bound), the DARK checker (flashbulbs ALWAYS findings — the class exists only in dark; unreadable < 2.2 with the CTA-face exemption ONLY — the calendar-day and yellow-pill light exemptions do NOT apply in dark, those surfaces re-theme; lowcontrast < 3.2 = WARN), the dark-mode precondition through the REAL lifecycle (no first-paint race in dark), the shell-presence guard folded into the per-accent wait from birth (the AP-90 lesson), and the interaction evidence in DARK at MID-BAND at volume (activeTint/activeLabel read at the NEXT drawer open — the pendingView pattern: S34 proved mid-band light+violet at seed, S39 accent × mid-band at seed light, S42 dark × volume at desktop, S44 dark × volume at mobile). The S42 finally-race fix from birth (the cleanup completes BEFORE the AP-85 flush-callback exit) |
| `node scripts/accent-volume-light-midband-sweep.mjs` | The S47 light × mid-band × volume stress (768×1024 — the S46 summary's own first named next candidate: the S47 mirror): the light half of the mid-band volume cross-axis — the S13 data-volume audit runs 1280×800 light+violet only (zero accent references), the S34/S39 mid-band sweeps run LIGHT at SEED volume (the volume axis is their blind spot), the S42/S43 volume × accent sweeps run 1280×800 only, the S44/S45 mobile volume sweeps run 390×844 only, and the S46 dark-midband volume sweep is DARK only (its mode precondition — the mode axis is its blind spot), so the densest renderings had never been rendered in LIGHT at the 768×1024 stacked layout under ANY accent at volume. 7 accents × the 7 volume-affected views (the S13 set) navigated THROUGH THE DRAWER (the only vehicle below 1024) in LIGHT under the COUNT-verified 300/200/250 profile (inserted via Prisma + count-verified BEFORE measuring), with the MID-BAND vehicle contract (sidebar hidden + hamburger visible — the below-lg family, the S34/S39/S46 doctrine at volume) + the drawer-own nav-scroll contract at the mid-band geometry (the nav MUST scroll at 1024 height — scrollHeight 1068 vs clientHeight ~935, measured: links ~17–20 sit below the fold), the below-lg structural family at volume (the drawer closes on navigation, the fixed glass app bar with the 2-digit-hour clock — lg:hidden, identical at 768, the heading clearance under the 64px bar), the S13 budgets (long tasks ≤ 1500ms, the drawer-click→heading ≤ 1500ms over the drawer-close + view-mount path, the /api/tasks ≤ 500KB B1 bound), the LIGHT checker with the THREE signature-strict light exemptions (the CTA-face white-on-accent + the calendar adjacent-month slate-300 + the yellow priority-pill yellow-500 — the reference's own design in light; NO flashbulbs — the class exists only in dark, light surfaces are by-design on the light canvas), the light-mode hydration gate (the greeting heading — the S43/S45 lesson: `!html.dark` is TRUE at first paint, so the gate is the POST-MOUNT observable), and the interaction evidence in LIGHT at MID-BAND at volume (activeTint/activeLabel read at the NEXT drawer open — the pendingView pattern: S34 proved mid-band light+violet at seed, S39 accent × mid-band at seed light, S43 light × volume at desktop, S45 light × volume at mobile). The S42 finally-race fix from birth (the cleanup completes BEFORE the AP-85 flush-callback exit) |
| `node scripts/accent-volume-dark-landscape-sweep.mjs` | The S48 dark × landscape × volume stress (844×390 — the S47 summary's own named next candidate: the landscape × volume cells, the dark half first, the LAST viewport band): the dark half of the landscape volume cross-axis — the S13 data-volume audit runs 1280×800 light+violet only (zero theme references), the S35/S40 landscape sweeps run LIGHT at SEED volume (zero volume markers AND S40's every PATCH carries themeMode "light" — the mode + volume axes are their blind spots), the S42/S43 volume × accent sweeps run 1280×800 only, the S44/S45 mobile volume sweeps run 390×844 only, the S46/S47 mid-band volume sweeps run 768×1024 only, and NO dark sweep runs at 844 at all, so the densest renderings had never been rendered in DARK at the 844×390 landscape layout under ANY accent at volume. 7 accents × the 7 volume-affected views (the S13 set) navigated THROUGH THE DRAWER (the only vehicle below 1024) in DARK under the COUNT-verified 300/200/250 profile (inserted via Prisma + count-verified BEFORE measuring), with the LANDSCAPE vehicle contract (sidebar hidden + hamburger visible — the below-lg family, the S35/S40 doctrine at volume) + the drawer-own nav-scroll contract at the LANDSCAPE geometry (the nav MUST scroll at 390 height — scrollHeight 1068 vs clientHeight ~301, measured: links ~8–20 sit below the fold, the nav's scroll is the only path to them), the below-lg structural family at volume (the drawer closes on navigation, the fixed glass app bar with the 2-digit-hour clock — lg:hidden at 844, the heading clearance under the 64px bar at its tightest — the bar covers 16% of the 390px viewport), the S13 budgets (long tasks ≤ 1500ms, the drawer-click→heading ≤ 1500ms over the drawer-close + view-mount path, the /api/tasks ≤ 500KB B1 bound), the DARK checker (flashbulbs — a light surface on the dark canvas, ALWAYS findings; unreadable < 2.2 with the CTA-face exemption ONLY — the calendar-day and yellow-pill light exemptions do NOT apply in dark, those surfaces re-theme; lowcontrast < 3.2 = WARN), the dark-mode precondition through the REAL lifecycle (no first-paint race in dark; the greeting-heading gate — the S47 initial-gate field correction), the per-accent gate with the shell-presence guard from birth (the AP-90 lesson), and the interaction evidence in DARK at LANDSCAPE at volume (activeTint/activeLabel read at the NEXT drawer open — the pendingView pattern: S35 proved landscape light+violet at seed, S40 accent × landscape at seed light, S42 dark × volume at desktop, S44 dark × volume at mobile, S46 dark × volume at mid-band). The S42 finally-race fix from birth (the cleanup completes BEFORE the AP-85 flush-callback exit) |
| `node scripts/accent-volume-light-landscape-sweep.mjs` | The S49 light × landscape × volume stress (844×390 — the S48 summary's own named next candidate: the S49 mirror, completing the volume × theme × viewport cross-axis's last band): the light half of the landscape volume cross-axis — the S13 data-volume audit runs 1280×800 light+violet only (zero theme references), the S35/S40 landscape sweeps run LIGHT at SEED volume (zero volume markers — the volume axis is their blind spot), the S42/S43 volume × accent sweeps run 1280×800 only, the S44/S45 mobile volume sweeps run 390×844 only, the S46/S47 mid-band volume sweeps run 768×1024 only, and the S48 landscape volume sweep is DARK only, so the densest renderings (the 300-row Tasks list, the 250-event terminal panel, the 200-note list) had never been rendered in LIGHT at the 844×390 landscape layout under ANY non-violet accent at volume. 7 accents × the 7 volume-affected views (the S13 set) navigated THROUGH THE DRAWER (the only vehicle below 1024) in LIGHT under the COUNT-verified 300/200/250 profile (inserted via Prisma + count-verified BEFORE measuring), with the LANDSCAPE vehicle contract (sidebar hidden + hamburger visible — the below-lg family, the S35/S40/S48 doctrine at volume) + the drawer-own nav-scroll contract at the LANDSCAPE geometry (the nav MUST scroll at 390 height — scrollHeight 1068 vs clientHeight ~301, measured: links ~8–20 sit below the fold, the nav's scroll is the only path to them), the below-lg structural family at volume (the drawer closes on navigation, the fixed glass app bar with the 2-digit-hour clock — lg:hidden at 844, the heading clearance under the 64px bar at its tightest — the bar covers 16% of the 390px viewport), the S13 budgets (long tasks ≤ 1500ms, the drawer-click→heading ≤ 1500ms over the drawer-close + view-mount path, the /api/tasks ≤ 500KB B1 bound), the LIGHT checker with the THREE signature-strict light exemptions (the CTA-face white-on-accent + the calendar adjacent-month slate-300 + the yellow priority-pill yellow-500 — the reference's own design in light; NO flashbulbs — the class exists only in dark, light surfaces are by-design on the light canvas), the light-mode hydration gate (the greeting heading — the S43/S45/S47 lesson: `!html.dark` is TRUE at first paint, so the gate is the POST-MOUNT observable), the per-accent gate with the shell-presence guard from birth (the AP-90 lesson applied to the landscape vehicle), and the interaction evidence in LIGHT at LANDSCAPE at volume (activeTint/activeLabel read at the NEXT drawer open — the pendingView pattern: S35 proved landscape light+violet at seed, S40 accent × landscape at seed light, S43 light × volume at desktop, S45 light × volume at mobile, S47 light × volume at mid-band). The S42 finally-race fix from birth (the cleanup completes BEFORE the AP-85 flush-callback exit) |
| `node scripts/accent-dark-landscape-seed-sweep.mjs` | The S50 dark × landscape × SEED sweep for the 13 volume-invariant views (844×390 — the S46 plan's carried note + the S49 plan's own non-gap entry): the 13 views that render no task/note/event rows (Timetable, Assignments, Exams, Flashcards, Practice Tests, Study Groups, Grade Tracker, Files, Calculator, Math Solver, AI Assistant, Focus Timer, Settings) had NEVER been rendered in DARK at the 844×390 landscape layout under ANY accent — the S35/S40 landscape sweeps run LIGHT only, the S36/S38 dark sweeps run 390×844 mobile + 1280×800 desktop only, and the S48/S49 volume sweeps navigate the 7 volume-affected views only. 7 accents × the 13 views at SEED volume navigated THROUGH THE DRAWER (the only vehicle below 1024) in DARK, with the LANDSCAPE vehicle contract (sidebar hidden + hamburger visible — the below-lg family) + the drawer-own nav-scroll contract at the LANDSCAPE geometry (the nav MUST scroll at 390 height — scrollHeight 1068 vs clientHeight ~301, measured) + the shell-presence guard from birth (the AP-90 lesson) + the DARK checker (flashbulbs always findings; unreadable < 2.2 with the CTA-face exemption ONLY — the calendar-day and yellow-pill light exemptions do NOT apply in dark, those surfaces re-theme; lowcontrast < 3.2 = WARN) + the drawer-scoped dark checker + the 20-link census (the drawer always carries ALL 20 links even though only 13 are navigated) + the interaction evidence in DARK at LANDSCAPE at SEED (activeTint/activeLabel via the pendingView pattern — the first per-view dark reading at the landscape at seed on the volume-invariant set) |
| `node scripts/cwv-volume-stress.mjs` | The S51 CWV × volume stress — the RUM-beacon cross-axis (the beacon's five field metrics [TTFB/FCP/LCP/CLS + the INP interaction proxy] under the COUNT-verified 300/200/250 profile on the 7 volume-affected views at 390×844 under the Lighthouse throttle [4x CPU + Slow-4G, cache disabled], against the :3200 standalone build — the S16 doctrine: CWV needs the production bundle): the S16 cwv audit runs login+dashboard at SEED (zero volume references), the S13 volume audit never read LCP/CLS/FCP, and the S42–S49 volume sweeps observe longtask entries ONLY — the cell was ZERO-coverage at every prior audit. 7 views × 2-run medians + the INP proxy re-anchored to the volume destination (Dashboard→Tasks through the desktop sidebar under the full throttle — the 300-row list mount is the heaviest interaction). Budget families (boundary-exact, classified by the `classifyCwvVolumeStress` seam): LCP ≤ 4400 [the PARITY ANCHOR — the reference's own seed-volume mobile dashboard measures 4416–4432ms under the same Lighthouse preset, the standing cwv stage's documented ref scenario: the clone's volume-stressed views must outperform the reference's own seed state; the public 4000ms field-POOR boundary is documented in the seam's note — the Tasks view's genuine ~4000ms boundary-straddling is the recorded NI-to-POOR state; the S51 in-suite correction: the original 4000 pin sat inside the ±64ms system-load noise band], CLS ≤ 0.1 [the ADR-014 load-stability contract at volume], FCP ≤ 1500 [the shell-paint volume-invariance], TTFB ≤ 500, longTaskTotal ≤ 2400 [the S13 B3 load-window sibling, re-anchored S91/AR1: the documented same-tree band 1821–2288ms made the 2000 pin a coin flip], INP proxy ≤ 3000 |
| `node scripts/capture-s12-evidence.mjs` | The S12 accessibility evidence captures (forced-colors renders, print pages, the focused skip link) |
| `node scripts/ai-error-audit.mjs` | AI-surface failure-mode audit (transport failure / hung backend / 500 / payload edges — cleans its probe rows) |
| `node scripts/data-volume-audit.mjs` | Data-volume stress: inserts 300 tasks / 200 notes / 250 events via Prisma, measures payloads + long tasks + click latency, cleans up |
| `node scripts/upload-edge-audit.mjs` | Upload edge cases: the 2 MiB boundary, empty/unicode filenames, download round-trip, concurrency, auth |
| `node scripts/capture-s13-evidence.mjs` | The S13 resilience evidence captures (the AI rollback, the MIME-guard toast, the drawer, Files) |
| `node scripts/drawer-check-s14.mjs` | The standing mobile-drawer probe (both apps, 390×844 — backdrop/panel/links/footer + Escape-close) |
| `node scripts/connectivity-audit.mjs` | Offline/online audit (offline banner, AI rollback under REAL transport failure, task dialog, SPA nav, login, recovery). S28: the A4 login-offline probe asserts the DESIGNED failure channel — the S15 inline `role=alert` on the auth card (scoped to `div.shadow-2xl`, never page-wide), the user stays on `/login`, the button recovers; a toast on the login route is now the WRONG design (the S15 change replaced the S14 toast — asserting the retired toast design produced a phantom finding) |
| `node scripts/settings-roundtrip-audit.mjs` | Settings persistence round-trips (display name, avatar, whitespace guard, second-write-wins, concurrent families) |
| `node scripts/security-audit.mjs` | Security audit (cookie flags, AI-route rate limits, upload MIME decision, download headers, logout, auth-gating) |
| `bun scripts/dep-audit.mjs` | Dependency-security audit (session-30): runs `bun audit`, parses its text report (no JSON reporter in bun 1.3.14), and classifies every advisory by RUNTIME REACHABILITY against the `.next/standalone/node_modules` trace — runtime-reachable → FAIL (exit 1); dev/CLI-surface advisories ride the envelope as DOCUMENTED non-production entries with their classification evidence. Self-verifying preconditions (the S27 doctrine): the trace must exist AND be newer than `bun.lock`, else exit 1 with NO findings. Run with BUN (the `prisma/seed.ts` precedent — plain node cannot import the `src/lib/dep-audit.ts` seam). The seam + parser fixtures are unit-pinned by `tests/dep-audit.test.ts` |
| `bun scripts/dev-server-preflight.mjs` | Dev-server boot-stability preflight (session-31): run BEFORE any dev-server audit suite (connectivity/security/settings/capture) — loads `/login`, counts same-path main-frame navigations over an 8 s post-load window, fills the demo credentials and waits for the submit button to enable (NEVER submits — zero login requests), then classifies through the pure `src/lib/dev-preflight.ts` seam (unit-pinned by `tests/dev-preflight.test.ts`). GREEN = hydrated + navigation-stable; `reload-loop` → the stale-Turbopack-cache remedy (`rm -rf .next/dev` — a daemon restart does NOT clear it); `unreachable` → start the server; `no-hydration` → the staged retry/restart/cache-clear remedy. Liveness ≠ stability ≠ hydration: `/api/health` 200 while a route reload-loops is exactly the trap this probe catches |
| `bun scripts/standing-suite.mjs` | The S32 one-command standing suite (the S31 preflight first — ABORTS loudly on any non-green verdict; then the 33 standing audits in the documented order — the S33 mobile-sweep, the S34 midband-sweep, the S35 landscape-sweep, the S36 dark-mobile-sweep, the S37 accent-light-sweep, the S39 accent-midband-sweep, the S40 accent-landscape-sweep and the S41 accent-desktop-sweep between focus-order and dark-sweep, and the S42 accent-volume-sweep directly after accent-dark-sweep, then the S43 accent-volume-light-sweep directly after its dark sibling, then the S44 accent-volume-dark-mobile-sweep directly after the light sibling, then the S45 accent-volume-light-mobile-sweep directly after the dark sibling (the volume family at the four mobile/desktop halves), then the S46 accent-volume-dark-midband-sweep directly after the light-mobile sibling (the mid-band dark half — the S45 summary's first named next candidate), then the S47 accent-volume-light-midband-sweep directly after its dark mid-band sibling (the S47 mirror — the volume family's sixth half: dark desktop, light desktop, dark mobile, light mobile, dark mid-band, light mid-band), then the S48 accent-volume-dark-landscape-sweep directly after the light mid-band sibling (the landscape dark half — the LAST viewport band: dark desktop, light desktop, dark mobile, light mobile, dark mid-band, light mid-band, then dark landscape), then the S49 accent-volume-light-landscape-sweep directly after its dark landscape sibling (the S49 mirror — the volume × theme × viewport cross-axis COMPLETE: all EIGHT halves), then the S50 accent-dark-landscape-seed-sweep directly after the light landscape volume sibling (the dark × landscape × SEED sweep for the 13 volume-invariant views — the S46 plan's carried note + the S49 plan's own non-gap entry: the views that render no task/note/event rows had never been rendered in dark at 844×390 under any accent; the drawer vehicle at seed volume with the dark checker + the 20-link census), then the S51 cwv-volume-stress directly after its seed-volume cwv sibling (the RUM-beacon cross-axis: the beacon's five field metrics under the 300/200/250 profile on the 7 volume-affected views at 390×844 under the Lighthouse throttle against the :3200 standalone — the S16 audit runs login+dashboard at seed; the S13 volume audit never read LCP/CLS/FCP; the S42–S49 volume sweeps observe longtask entries ONLY) — each spawned EXACTLY ONCE with its stdout classified through the pure `src/lib/suite-verdict.ts` seam — unit-pinned by `tests/suite-verdict.test.ts`; then the demo-theme closing guard via Prisma). Makes the S29/S31/S65 double-run phantom impossible by construction (one spawn, one parse) and the S28 shape-rot impossible (a missing key on a known audit is a LOUD `shape not recognized`, never a silent 0 — five of sixteen envelopes were mis-parsed by careful operators before this seam existed). The CWV stage's :3200 precondition is executable: the runner probes health, starts the standalone server itself if needed (ephemeral AUTH_SECRET — the S22 boot guard), and stops what it started. Documented non-gap signatures encoded in the seam (session-65 verified): NEXTJS-PORTAL focus anomalies (the dev-tools overlay, dev-mode only), sr-only unbounded controls (the Events date input, visually hidden by design), and white-on-accent unreadable entries (the accent CTA face — the S11 family-2 non-gap) . The 35/35 verdict arithmetic (stated here by S96/AW4e, the s95 audit's I-1): the S31 preflight + the 33 standing audits + the demo-theme closing guard = the 35 suite steps |
| `node scripts/ai-a11y-audit.mjs` | AI-surface accessibility audit (transcript live region, busy semantics, solver announcement, composer labels). S32: the D2 probe now reloads BEFORE unrouting (the held `/api/ai/chat` request is aborted by the document unload — the OLD unroute→reload order released it to the REAL server, persisting a probe pair on EVERY run; 4 pairs had accumulated in `db/custom.db` and the dark/accent sweeps surfaced them as flashbulbs through the designed user-bubble inversion `dark:bg-slate-100`), and the script carries a closing Prisma cleanup of any rows created during the audit (the `ai-error-audit.mjs` pattern) |
| `node scripts/ref-auth-probe-s15.mjs` | Capture the reference's auth sub-screen ground truth (login error alert, signup, verify OTP, forgot 3-state) as JSON |
| `node scripts/auth-flow-audit-s15.mjs` | Clone-side auth-flow audit (inline login error, signup form, forgot flow) — GREEN post-S15 |
| `node scripts/keyboard-audit-s15.mjs` | Clone-side calculator physical-keyboard audit (type/evaluate/clear) — GREEN post-S15 |
| `node scripts/auth-journey-probe-s15.mjs` | Full register→verify→gate→forgot→reset journey probe (dev server) |
| `node scripts/pre15-preflight.mjs` | The pre-1.0 dependency/bundle sweep (deps pinned by design, client bundle size) |
| `node scripts/cwv-audit-s16.mjs` | Lighthouse-class CWV matrix (LCP/CLS/FCP/TTFB via buffered PerformanceObserver + CDP 4x-CPU/Slow-4G throttle) — both apps, login + dashboard, mobile + desktop, light + dark; run against the standalone build on :3200 |
| `node scripts/cls-source-probe-s16.mjs` | Layout-shift attribution (records shift entries WITH sources — which node moved, when) |
| `node scripts/mobile-auth-geo-probe-s16.mjs` | Both apps' auth sub-screen geometry at 390x844 (h2 metrics, button heights, overflow, OTP boxes) |
| `node scripts/copy-sweep-s16.mjs` | The 20-view copy diff vs the live reference (h1/subtitle/buttons; logged-in sweep both apps) |
| `node scripts/capture-s16-evidence.mjs` | The S16 evidence captures (6 mobile: auth sub-screens + dashboard) |
| `node scripts/vlm-verify-s16.mjs` | VLM spot-checks of the S16 captures |
| `node scripts/capture-s17-evidence.mjs` | The S17 fresh-user evidence captures (zero-data Analytics/GradeTracker, the Settings Profile/Notifications tabs, the mobile StudyGroups copy) |
| `node scripts/capture-s18-evidence.mjs` | The S18 RUM evidence captures (the beacon-live dashboard + mobile, the GET /api/rum aggregate, the un-instrumented login) |
| `node scripts/capture-s19-evidence.mjs` | The S19 diagnostics-panel captures (the `/rum` surface — desktop light + dark + mobile 390px) |
| `node scripts/capture-s20-evidence.mjs` | The S20 v3 captures (the `/rum` panel with the sparklines + the Export CSV action + the exported CSV head — posts a deterministic trend-rich probe) |
| `node scripts/capture-s21-evidence.mjs` | The S21 portability captures (the `/export` page — desktop light + dark + mobile 390px + the downloaded JSON envelope head) |
| `node scripts/capture-s22-evidence.mjs` | The S22 boot-guard captures (the dev-server dashboard + `/export` + mobile 390px screenshots + the boot-guard evidence JSON: the negative spawn exit + the positive-control health + the dev-boot warn line) |
| `node scripts/vlm-verify-s22.mjs` | VLM spot-checks of the S22 captures |
| `node scripts/capture-s23-evidence.mjs` | The S23 import captures (the `/export` page with the Restore card — light + dark + mobile 390px + the completed-import result state + the API round-trip evidence JSON) |
| `node scripts/capture-s24-evidence.mjs` | The S24 change-password captures (the Settings Profile tab with the Change password card — light + dark + mobile 390px + the success-note state + the API round-trip evidence JSON) |
| `node scripts/capture-s25-evidence.mjs` | The S25 account-deletion captures (the Settings Profile tab with the Danger zone card — light + dark + mobile 390px + the revealed confirmation-form state + the API round-trip evidence JSON incl. the DB-level cascade proof) |
| `node scripts/vlm-verify-s25.mjs` | VLM spot-checks of the S25 captures |
| `node scripts/capture-s26-evidence.mjs` | The S26 email-change captures (the Settings Profile tab with the Email address card — light + dark + mobile 390px + the success-note state with the live identity-block update + the API round-trip evidence JSON incl. the DB-level emailVerified-stays-true proof + the rotate-and-restore demo proof) |
| `node scripts/vlm-verify-s26.mjs` | VLM spot-checks of the S26 captures |
| `node scripts/vlm-verify-s24.mjs` | VLM spot-checks of the S24 captures |
| `node scripts/vlm-verify-s23.mjs` | VLM spot-checks of the S23 captures |
| `node scripts/capture-s15-evidence.mjs` | The S15 evidence captures (5 auth-flow + keyboard screenshots) |
| `node scripts/capture-s14-evidence.mjs` | The S14 hardening evidence captures (offline banner, rate-limit toast, display-name guard, Thinking live region) |
| `bun run db:push` / `db:seed` | Create schema + demo data at `db/custom.db` |
| `bunx vitest run tests/calculator.test.ts` | One unit file |
| `bunx playwright test tests/e2e/tasks.spec.ts --project=chromium` | One e2e file (needs a current build) |

**Gate order before pushing:** `lint → typecheck → test → build → test:e2e`. There is no hosted CI; the local gate is the only gate. Pushes go to `main` only, via `docs/ssh_git_wrapper_v3.py` (see `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`).

## The DATABASE_URL contract (read before touching anything db-related)

`DATABASE_URL="file:../db/custom.db"` in `.env` — the db file lives at **`<repo>/db/custom.db`**. Three tools resolve that relative URL **differently**, all verified empirically:

1. **Runtime** (`next dev`/`build`/standalone): `src/lib/db-path.ts` re-anchors it against the repo that owns `prisma/schema.prisma` → correct.
2. **Prisma CLI with a shell-provided env var**: anchors at the schema file → correct. The `db:*` npm scripts set the var inline for exactly this reason — do NOT call raw `prisma db push` and rely on repo-root `.env` auto-loading.
3. **Prisma CLI with `.env`-loaded var**: anchors at the **CWD** → one directory too high. This is the historical foot-gun.

Also: **Next.js dev (Turbopack) pre-resolves** relative `file:` DATABASE_URLs against the project dir before any app code runs. `db-path.ts` detects the resulting wrong-but-absolute value (target missing + schema-anchored default exists) and corrects it. `tests/db-path.test.ts` pins all of this — if you change resolution rules, update those tests in the same commit.

The e2e suite isolates its own `db/e2e.db` via the same shell-env mechanism (see `tests/e2e/global-setup.ts`).

The **`NEXT_PUBLIC_SITE_URL` contract** (session-10 fix — previously documented but never wired): `src/lib/site.ts` is the single resolution point (`siteUrl()` — whitespace + trailing-slash trimmed, `http://localhost:3000` default, unit-pinned by `tests/site.test.ts`); `src/app/sitemap.ts` (root + the 20 NAV_ITEMS paths + `/login` = 22 URLs), `src/app/robots.ts`, and the `metadataBase` in `layout.tsx` all consume it. The exact-match SPA rewrites never touch `/sitemap.xml` / `/robots.txt` (verified prerendered in the build).

The **`AUTH_SECRET` boot-guard contract** (session-22, ADR-020): `src/instrumentation.ts`'s `register()` runs once per server boot (dev / next start / the standalone build — never during `next build`) and asks the PURE seam `src/lib/env-check.ts` (`authSecretBootStatus(nodeEnv, authSecret)` — unit-pinned, explicit args, zero imports) what to do. In production: a missing/empty/whitespace-only secret, or one equal to the public `DEV_FALLBACK_SECRET` (whose single source is the seam — auth.ts imports it from there), is **FATAL — `console.error` + `process.exit(1)`** (a plain `throw` is CAUGHT by Next and leaves a degraded 500-everything server; the explicit exit is the validated fail-fast mechanism). A present-but-short (< 32 chars) secret boots with a warn. Outside production: no secret → one warn line (the documented dev fallback — dev NEVER blocks). The e2e pins live in `tests/e2e/s22-boot-guard.spec.ts`: the negative spawn (the standalone server WITHOUT the secret exits non-zero with the `openssl rand -hex 32` remedy) + the positive control (the suite's own boot answers `/api/health`). The e2e webServer's secret is a 64-hex value (models the production shape, keeps the weak-secret warn silent).

## Architecture facts you cannot guess from filenames

- **Load-stability contract (session-16, ADR-014):** the authenticated shell pre-warms the ACTIVE view's initial collections IN PARALLEL with `/api/auth/me` (`src/lib/view-collections.ts` — `INITIAL_COLLECTIONS`, the single source of "what does each view need before first paint", unit-pinned so a new view cannot ship without an entry) and flips from the Splash only when BOTH settle — the first paint renders with final geometry (dashboard CLS 0.00; pre-fix 0.117–0.125 when the empty-store shell re-laid the conditional overdue banner + sections on data arrival). A failed pre-warm never blocks the shell (`.catch(() => {})` — the view's own loadAll retries); the three tool views declare `[]` and gate on auth alone. Read the active view from `useAppStore.getState().view` AFTER `hydrate()` — never from the render closure (AP-59 family).
- **RUM observability contract (session-18, ADR-016):** the authed shell mounts `<RumBeacon />` (src/components/layout/rum-beacon.tsx — renders null, ZERO DOM; visual parity is byte-preserved) which dynamic-imports web-vitals and POSTs batched TTFB/FCP/LCP/CLS/INP reports to `/api/rum`. The POST is auth-gated, Zod-validated (rumBatchSchema), rate-limited 1000/15-min per user (the e2e suite itself fires ~500-750 beacon POSTs — do NOT lower it without re-running the full suite), and UPSERTS on the (sessionId, metric) unique pair — final value wins, reposts never duplicate. GET /api/rum answers p75 per metric (nearest-rank over the last 200 events) + recent samples. The beacon swallows ALL failures (no toast, no console spam); the login route is deliberately UN-instrumented (an unauthenticated metrics endpoint is an abuse surface — its CWV is pinned by s16-perf-parity.spec.ts). The RumEvent table grows ~5 rows/pageload (scratch-cleanable via db:reset).
- **RUM diagnostics panel (session-19, ADR-017; v3 session-20, ADR-018):** the auth-gated `/rum` route (src/app/rum/page.tsx — a SERVER component: getCurrentUser + redirect("/login"), so an anonymous visit never renders panel chrome) renders `<RumPanel />` (src/components/rum/rum-panel.tsx) — the five CWV at p75 with rating badges derived from the PUBLIC bounds in the pure seam (src/lib/rum-diagnostics.ts: classifyP75/formatMetricValue/buildPanelRows — the display logic is unit-pinned; the panel itself only renders + refreshes). The panel themes through the PRODUCTION path (the boot script pre-paint + useThemeStore.loadFromUser via /api/auth/me — same as the shell). It is linked from NOWHERE: the sidebar/drawer stay exactly 20 links (an e2e guard pins the shell /rum-link-free); the owner navigates directly (README + DEPLOYMENT.md §8 document it). The ratings on the cards are re-derived from the p75 VALUE (field-data convention) — they will legitimately differ from the per-event `rating` the beacon posted. The v3 additions (S20): GET /api/rum answers the per-metric `trends` series (the ≤ 20 most recent values, oldest → newest) which each sampled card renders as an accent-themed sparkline SVG (the geometry is the pure unit-pinned `buildSparklinePoints` — empty/single/flat edge cases first-class; `vectorEffect="non-scaling-stroke"` under `preserveAspectRatio="none"`); GET /api/rum/export streams the user's most recent 2000 events as a spreadsheet-ready text/csv download (the pure `toRumCsv` seam — RFC-4180 escaping, RAW values; the S13 `buildContentDisposition` + nosniff + private/no-store header contract; 401 JSON for anonymous callers — the API-route convention, not a redirect) — the Export CSV action is a real anchor on the panel (FROM /rum, so the shell's zero-nav-linkage guard is unaffected).
- **Data portability export (session-21, ADR-019):** the auth-gated `/export` route (src/app/export/page.tsx — a SERVER component: getCurrentUser + redirect("/login"), same gate as /rum) computes the per-collection COUNT snapshot server-side and renders `<ExportPanel />` (src/components/export/export-panel.tsx — themes through the production path, the /rum panel pattern) with the 20-collection count grid + the **Download JSON** anchor. The download itself is `GET /api/export/data` (src/app/api/export/data/route.ts): the 20 content collections read in parallel (userId-scoped, chronological; `cards` scoped through its deck), assembled by the PURE seam (src/lib/data-export.ts — `EXPORT_COLLECTIONS` the stable manifest, `serializeExportRow` the row normalizer [userId dropped, Date → ISO], `buildDataExport` the versioned envelope [format `studyflow-data-export`, version 1, hashless `user`, counts + data]; the SECRET GUARD strips passwordHash at the seam AND the route's explicit select never reads it), answered `application/json` with the S13/S14 download-header contract (buildContentDisposition attachment + nosniff + private/no-store). EXCLUDED by decision: VerificationToken/PasswordResetToken (secrets), RumEvent (telemetry — the /api/rum/export CSV covers it), and NO restore/import (the schema + SQLite file are the restore story). Linked from NOWHERE (an e2e guard pins the shell /export-link-free); the owner navigates directly (README + DEPLOYMENT.md §8.2).

- **Data import / restore (session-23, ADR-021):** the inverse of the export — `POST /api/import/data` (src/app/api/import/data/route.ts) restores a `studyflow-data-export` envelope into the importing account. The semantics are upsert-by-id in ONE interactive all-or-nothing transaction: a row whose id exists AND belongs to the importer updates to the envelope's values (the userId-scoped `updateMany` — a foreign row matches nothing; validated), a new id creates WITH the importer's userId (a cross-user id collision dies P2002 → rollback → 400); import NEVER deletes; content only, never identity (the envelope's `user` block is ignored). `cards` (Flashcard — no userId column) scopes its update through the deck relation. The PURE seam (src/lib/data-import.ts — `parseImportEnvelope` + `IMPORT_FK_MAP` + `IMPORT_MAX_BYTES`) pre-validates everything the database would reject OPAQUELY: Prisma enforces FKs on SQLite (P2003, validated empirically), so dangling OPTIONAL FKs are NULLED at the seam (the schema's own SetNull semantics) while a dangling REQUIRED `cards.deckId` is a rejected corrupt envelope; folders.parentId chains are topologically sorted parents-first (a hand-crafted child-first order would hit P2003) with cycle rejection; `passwordHash`/`userId` are stripped (the import-side secret guard); duplicate ids / unknown collections / wrong format / future versions get actionable errors naming the offender. The route caps the body at 10 MiB (413) and rate-limits 10/15-min per user (the S14 seam). The UI is the `/export` page's **Restore from a backup** card (the panel extension — page.tsx untouched, the pinned S21 surfaces byte-identical): a file picker with a client-side size pre-check, the import POST, and the per-collection created/updated report as `role="status"` (errors as `role="alert"`, verbatim). The e2e pins live in `tests/e2e/s23-import.spec.ts` — the file makes exactly 8 import POSTs against the 10-budget (counted; no other spec POSTs the route).
- **The change-password flow (session-24, ADR-022):** the account-security rotation — `POST /api/auth/change-password` (src/app/api/auth/change-password/route.ts) lets a signed-in user rotate their own password: `requireUser` → `checkRateLimit(`changePw:${user.id}`, 10)` (the S14 seam) → the Zod `changePasswordSchema` (src/lib/validation.ts — the register family's min-8/max-200 policy on BOTH fields + the must-differ `.refine` whose message IS the actionable copy) → the current password VERIFIED against the stored scrypt hash FIRST (a wrong current → 400 "Your current password is incorrect.", PRE-WRITE — the stored hash is untouched; the caller is the authenticated owner, no enumeration surface) → `hashPassword(new)` written. The session SURVIVES the rotation BY DESIGN (the cookie is an HMAC over AUTH_SECRET, not the password — revoking OTHER sessions would need a per-request DB epoch check, the rejected alternative). The UI is the Settings Profile tab's **Change password** card (settings-view.tsx — a purely additive sf-card BELOW the pinned S17 surfaces, the S23 Restore-card pattern): three `type="password"` fields (`autoComplete="current-password"` / `"new-password"`), client-side pre-checks (all-filled / min-8 / confirm-match / must-differ — the early inline error, no request), errors INLINE as `role="alert"` (the S15 auth convention — never toasts), success as `role="status"` + the fields cleared. The e2e pins (tests/e2e/s24-change-password.spec.ts) run the guard family on the shared demo session and the mutation journey on a FRESH registered user (ONE registration — the S17 convention; the demo hash is never mutated, the poisoned-record lesson designed out). The reference has NO password surface anywhere in Settings (verified) — a pure superset.
- **The account-deletion flow (session-25, ADR-023):** the ownership exit — `POST /api/auth/delete-account` (src/app/api/auth/delete-account/route.ts) lets a signed-in user permanently erase their own account: `requireUser` → `checkRateLimit(`delAcc:${user.id}`, 10)` (the S14 seam) → the Zod `deleteAccountSchema` (src/lib/validation.ts — the register family's min-8/max-200 policy on the password + the typed-confirmation `.refine` demanding the CASE-EXACT word `DELETE`, whose message IS the actionable copy) → the password VERIFIED against the stored scrypt hash FIRST (a wrong password → 400 "Your password is incorrect.", PRE-WRITE — the account is untouched) → the ONE cascade write `db.user.delete` (every user relation in the schema carries `onDelete: Cascade` — verified by grep + pinned empirically in the capture: content rows exist → delete → user gone + every row gone, queried through Prisma directly) → the session cookie CLEARED (maxAge 0 — the logout route's exact mechanism; a surviving cookie is doubly dead: the user id no longer resolves, `/api/auth/me` 401s). The UI is the Settings Profile tab's **Danger zone** card (settings-view.tsx — a purely additive sf-card BELOW the S24 Change password card): the two-step reveal (the confirmation form is HIDDEN until "Delete account…" is clicked — an accidental Enter on a visible delete form must never fire), the warning copy with the export-first pointer, a Password field + a Confirmation field (placeholder "Type DELETE"), a `variant="destructive"` "Permanently delete my account" button + Cancel (re-hides + clears), client-side pre-checks (the early inline error, no request), errors INLINE as `role="alert"`, and NO success note — the client clears the theme cache (the logout pattern) and `window.location.replace("/login")`; the redirect IS the feedback. The e2e pins (tests/e2e/s25-delete-account.spec.ts) run the guard family on the shared demo session and the terminal journey on a FRESH registered user whose register/verify POSTs ride a DISTINCT client IP (x-forwarded-for — the RFC 5737 TEST-NET range: the suite's register/verify budgets were already at their 10/IP caps, the corrected count; behind a proxy distinct users have distinct IPs — the loopback pile-up is a suite artifact). The reference has NO account-deletion surface anywhere in Settings (verified) — a pure superset.
- **The email-change flow (session-26, ADR-024):** the account-identity rotation — `POST /api/auth/change-email` (src/app/api/auth/change-email/route.ts) lets a signed-in user change the address they log in with: `requireUser` → `checkRateLimit(`changeEmail:${user.id}`, 10)` (the S14 seam) → the Zod `changeEmailSchema` (src/lib/validation.ts — the register family's min-8/max-200 policy on the password + the email shape everywhere + the confirm-match `.refine` whose message IS the actionable copy; a mistyped address is UNRECOVERABLE through the UI) → the password VERIFIED against the stored scrypt hash FIRST (a wrong password → 400 "Your password is incorrect.", PRE-WRITE) → the ROUTE-side guards (the current email is server state, not a body field): must-differ (posting the account's own address → 400 "This is already your email address.") + uniqueness (an address owned by ANY account, verified or not → 409 — claiming an unverified owner's address would lock that owner out of their own re-registration path) → the ONE write `db.user.update` (lowercased; `emailVerified` STAYS TRUE — with no SMTP a re-verification OTP would surface to the same actor who just proved the password, proving nothing, and creating a lockout footgun at the next login) → the session cookie UNTOUCHED (stateless HMAC over the user id survives — the S24 contract); the response carries the new email so the client updates the theme store's user slice. The UI is the Settings Profile tab's **Email address** card (settings-view.tsx — a purely additive sf-card BELOW the main Profile card and ABOVE the S24 Change password card: identity → security → destructive exit; always visible, no two-step reveal — email change is NOT destructive): New email + Confirm new email + Password fields, client-side pre-checks (the early inline error, no request), errors INLINE as `role="alert"`, a `role="status"` success note ("Email address updated.") + the fields cleared + the LIVE identity-block/sidebar update through the store's `setEmail` action (src/lib/store.ts — the setAvatar pattern). The e2e pins (tests/e2e/s26-change-email.spec.ts) run the guard family on the shared demo session and the rotation journey on a FRESH registered user whose register/verify POSTs ride DISTINCT client IPs (192.0.2.26/.27 — the RFC 5737 TEST-NET range; the loopback register budget is at its 10/IP cap, the AP-71-corrected count). The reference has NO email-change surface anywhere in Settings (verified) — a pure superset.
- **Docker packaging (session-18):** `Dockerfile` (multi-stage: prod-deps → build → bun runtime) + `docker-compose.yml` (SQLite on the /data volume via the ABSOLUTE `file:/data/custom.db` URL — §4 form-2; AUTH_SECRET required at boot; the `init` profile pushes schema + seeds). The image carries NO database bytes (.dockerignore + the rm guard). The layout was validated end-to-end OUTSIDE Docker (`scripts/docker-layout-sim-s27.sh` — the sandbox has no daemon); the first real `docker compose --profile init up` on a Docker host is the remaining verification step.
- **Fresh-user journey contract (session-17, ADR-015):** a freshly registered user's zero-data state mirrors the reference's measured fresh account — Analytics and Grade Tracker render their STAT CARDS at zero data (never EmptyState blocks: the reference renders 0/0 · "0% completion rate" … and 0% · 0 · 0 with NO empty-state chrome), every view's empty-state hint carries the reference's verbatim copy (the seven-view table in `docs/remediation-plan-session17.md`), registrations create ZERO subjects (the reference's own behavior — the seeded demo account carries the showcase), and the Settings five-tab content follows the reference: per-tab headers, the Profile tab's School Name / Grade Level (12 options) / 1–12h Daily Study Goal / Account-created line (persisted on the User record), and the Notifications master toggle (`notificationsEnabled`). The study-profile fields ride `/api/auth/me` + the theme store's user slice; the register endpoint is rate-limited 10/IP/15min — e2e fresh-user specs register at most 3 accounts per run (the S16 one-registration-journey convention).
- **One page, twenty views.** The reference app is an SPA with PascalCase routes (`/Dashboard` … `/Settings`). `src/app/page.tsx` is the whole app: auth gate → shell → view switcher; `next.config.ts` rewrites the 20 paths onto `/`; `src/lib/router.ts` is the single view↔path map (unit-tested). Do not create real route folders for views.
- **Sidebar is `fixed` + `hidden lg:flex`** (`w-[260px]`, `.glass`) — and since the reference shipped it (re-measured S52, 2026-10-14): **COLLAPSIBLE**. The chevron toggle lives in the header row in BOTH states (`h-9 w-9 rounded-lg`, ONE `ChevronLeft` glyph with `rotate-180` when collapsed); collapsed is `w-20` (80px) with the brand + footer unmounted and the nav icons LEFT-ALIGNED at `px-4` (svg x=32); the preference persists via `localStorage["sf-sidebar-collapsed"]` (default expanded); `main` offsets with `lg:ml-[260px]` ↔ `lg:ml-20` (collapsed) + `pt-20 lg:pt-8` — the mobile app bar is ALSO `fixed` + `.glass` (64px, brand + live clock), so `pt-20` models the reference's measured 64px bar + 16px breathing room (first heading at y=80 on BOTH apps). Below `lg` everything goes through the mobile drawer (`src/components/layout/mobile-chrome.tsx`) — whose links SHARE the collapsed state (icon-only when collapsed, the reference's own behavior; the clone adds `title` + `aria-label` on icon-only links — the reference's icon-only links carry no accessible name).
- **Nav items have ONE source:** `src/components/layout/nav-items.tsx` (`NAV_ICONS` + `NavItemLink`) is consumed by BOTH the desktop sidebar and the mobile drawer — never re-implement the item markup. The reference drawer has NO footer. The icon set is reference-measured (S8-A): Calendar and Timetable share `calendar`, Events is `calendar-days`, Notes reuses `book-open`, Files is `folder-open`, Math Solver reuses `calculator`, Tasks is `square-check-big`, Analytics is `chart-column` (BarChart3's current lucide name). The ACTIVE tint is a 10%-alpha gradient `--sf-primary` → `--sf-primary-avatar-to` (violet-500 → indigo-500, measured; pinned by `NAV_ACTIVE_GRADIENT_STOPS` in theme.ts — note the `toCssVar` kebab-case suffix; a camelCase var name silently resolves to no var).
- **View headers have ONE source:** `ViewHeader` in `src/components/views/shared.tsx` renders the reference model — `h1 text-2xl font-bold text-slate-800 flex items-center gap-2` with an optional 24px `text-sf-primary` icon (16 views; Tasks/MyDay/Calendar have none), `size="lg"` for the 30px MyDay/FocusTimer titles, and a 16px subtitle with the reference's exact per-view wording. 18 views consume it — the two-pane views render their h1 INSIDE the left pane instead (S8-G/S8-H: Notes = `book-open w-6 h-6` icon, Study Groups = `users w-6 h-6`, both flanked by a 36px gradient dropdown/plus button). Never hand-roll a page header.
- **Primary CTAs are GRADIENT buttons (session-5):** every primary action uses the Button `gradient` variant — `.sf-gradient` (sRGB-exact `linear-gradient(to right, rgb(var(--sf-primary)), rgb(var(--sf-primary-gradient-to)))`, hover via `--sf-primary-gradient-to-strong`) + the v3 `shadow` (`.sf-gradient-shadow`); empty-state CTAs add the accent-tinted `.sf-gradient-shadow-lg`. Never render a solid `bg-sf-primary` CTA. (The reference's own gradient-button text renders YELLOW — a pixel-verified Base44 platform bug; the clone keeps white.)
- **Task rows are standalone CARD rows (session-6, measured with live reference data):** `TaskRowCard` in `views/shared.tsx` renders `group bg-white rounded-xl border border-slate-200 hover:border-violet-200 hover:shadow-md` wrapping `flex items-center gap-3 p-4`, with a 24px ROUND checkbox whose 2px border IS the priority color (slate-300/sky-400/amber-400/red-400), a slate-700 font-medium title, pill meta (due slate-100 future / red-100 due-today, repeat violet-100), and h-8 w-8 hover-revealed sun/star/ellipsis actions (active star = violet-500 + fill). Tasks + MyDay consume it; the Dashboard renders its own bare `p-4 gap-4` row with a 20px round checkbox. The Tasks view itself is a full-height two-pane (S8-F): a `hidden md:flex w-64 border-r pr-6` aside (list/star icon buttons, flex-1 font-medium labels, border-t My Lists split) + a single-row main header (h1 + count left; icon search + filter + gradient Add Task right) over a scrollable row list.
- **The Dashboard renders a conditional overdue-alert banner (S9-A, measured live):** between the greeting header and the stats grid, `bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-4` with a `w-10 h-10 bg-red-100` icon block (`circle-alert` red-500), `text-red-700` "You have N overdue item(s)" + `text-red-600` sub, and a ghost View All link to `/Tasks` — only when overdue incomplete tasks exist (seed: "Return library books"). Empty sections inside the flush cards use the SLIM inline empty (S9-R): `p-8 text-center` + `w-12 h-12 text-slate-300 mb-3` icon + `text-slate-500` message — NOT the 80px-gradient `SimpleEmptyState`.
- **The Tasks status filter is an outline BUTTON, not a combobox (S9-C):** white bg, `border-input`, leading `filter` icon (renders as `lucide-funnel` in this lucide version — same glyph, current name) + current value; opens a DropdownMenu. The Tasks aside renders NO placeholder when My Lists is empty (S9-D). MyDay's quick-add row is input + More Options ONLY — Enter submits, no submit button (S9-Q); its 0-task state is the AMBER greeting empty (S9-B): bare `text-center py-12` (no card) + `w-20 h-20 from-amber-100 to-orange-100` sun block + time-aware "Good morning!" title + amber-500→orange-500 CTA.
- **Assignment rows carry an interactive progress slider (session-6):** Radix slider (h-2 slate-200 track, sRGB-exact violet→indigo gradient fill, 20px white/violet-500 thumb, violet-600 % label); `onValueCommit` PATCHes `progress`. Rows also render the blue due-in pill, bordered priority pill (flag icon), and slate-100 type pill. Exams are a `lg:grid-cols-3` CARD grid with an `h-2` subject-color strip, amber urgency badge, icon detail rows, and a border-t type footer (date + time·duration ONLY — no location row or topics counter on the card; S8-P). Calendar (S8-C): a SIMPLE `rounded-2xl border-slate-200 p-6` month card (no header split) with `text-xl font-bold` h2, exactly two ghost `h-9 w-9 rounded-lg` chevron navs (no Today button), `text-sm font-medium text-slate-500 py-2` weekday header — **SUNDAY-first (S9-E, re-measured: the reference header runs Sun…Sat and its October 2026 grid starts at Sep 27)**; `monthGrid()` in `src/lib/date.ts` leads with `first.getDay()` and sizes the grid dynamically (`ceil((lead + daysInMonth) / 7)` weeks — 35 cells for five-week months; `CALENDAR_WEEKDAYS` is the Sunday-first constant) — and cells where SELECTED = solid accent fill + white text and TODAY (unselected) = 100-level tint (`--sf-primary-empty-from`) + strong text — both states strip the hover class; the day detail is the same simple p-6 card with a font-bold h3 long date and `text-slate-400 text-center py-8` empty text.
- **Flashcards is a TWO-PANEL view (session-7, measured with live reference data):** `flex h-[calc(100vh-8rem)] gap-6` — a `w-80 border-r border-slate-100 pr-6` sidebar (the view h1 + a 36px gradient New Deck icon-button + inline-icon search + `space-y-2` deck rows: `p-4 rounded-xl bg-slate-50 border-2 border-transparent` with 40px colored icon blocks whose inline `backgroundColor` is the deck's `color` swatch, h3 names, `p.text-xs` card counts) and a detail pane (`h2 text-xl font-bold` + description + AI Generate outline + Add Card gradient + Study gradient when cards exist; `md:grid-cols-2 lg:grid-cols-3` card grid of `rounded-xl border p-4 hover:shadow-md` cards with difficulty pills and hover-revealed h-7 edit/delete; a 3D-flip study mode: `h-80 perspective-1000` + `preserve-3d`, sRGB-exact gradient front, white/`border-2 border-violet-200` back, Exit Study, `h-10 px-8` chevron nav). Deck colors + card difficulty live on the model (`color`, `difficulty`); the 6-swatch picker constant is `DECK_COLORS` in `flashcards-view.tsx` (violet/blue/emerald/amber/red/pink-500 — red before pink).
- **Dashboard cards are FLUSH divide-y lists (session-8):** `SectionCard` (shared.tsx) takes `flush` — the body becomes `divide-y divide-slate-50` with NO padding; rows run edge-to-edge as `p-4 hover:bg-slate-50` rows (Today's Tasks bare rows; exam rows with `h3 font-medium text-slate-700` + a rounded-full red-100 urgency badge + calendar-icon date line; assignment rows with a 4px subject-color strip + clock-icon due line + yellow priority pill on the right). Default (padded) SectionCard bodies remain for other views.
- **The Timetable week grid is a grid-cols-8 time table (session-7):** Time column + 7 day heads (`p-3 text-center border-l` + full day name `text-sm font-medium text-slate-600` + `text-lg font-bold` date); `h-[60px] border-b border-slate-50` hour cells labelled **"7 AM"** (trimmed hour, no minutes); `min-w-[900px]` inside `overflow-x-auto`; a `md:hidden` mobile accordion (40px rounded-xl date chips + "N classes" + rotating chevron). **Column→ISO mapping is `(col + 6) % 7`** — Sunday-first display columns vs ISO storage (0=Monday); the previous `(col+1)%7` form silently rendered every column two days ahead of its header. My Classes = `p-6` + header row (h2 `text-lg font-bold` + today's long date) + 3-col grid. The TODAY tint rides the column HEADER cell (`bg-violet-50` = `--sf-primary-softest`, S8-E) — body columns stay transparent (the old body-column `bg-sf-primary-softest/50` class was a DEAD utility — the only sf-primary color utilities defined in `@theme` are `--color-sf-primary{,-foreground,-soft,-soft-dark,-strong,-strong-dark}`); week-nav chevrons are ghost `h-9 w-9 rounded-lg`.
- **Analytics stat cards are icon-block cards (session-7):** `rounded-xl bg-white shadow-sm` (r12, border-0) + `p-6` + 48px `w-12 h-12 rounded-xl` tinted blocks — Tasks Completed (square-check-big, **violet-100**), Assignments (book-open, **blue-100**), Focus Time (clock, **green-100** — the measured tint; NOT emerald-100), Upcoming Exams (graduation-cap, **orange-100**) — with fraction values + rate subs, on a `grid-cols-2 lg:grid-cols-4` grid (S8-I). Chart cards carry PER-CARD icons (S8-I): trending-up (Task Activity), clock (Focus Time), book-open (Assignment Status — an SVG donut, Not-Started sector #94a3b8 measured), target (Subject Workload — h-[250px] body); plus an "Active Items by Priority" card (flame icon, slate-50 r12 chips with color dot + count + label, medium #f59e0b / high #ef4444 measured); grade-trend stays as a superset chart. **The 7-day charts are SVG AREA charts with axes (S9-K, measured):** `AreaChart` in `analytics-view.tsx` renders X-axis day labels (12px `#666`), Y-axis ticks, horizontal `stroke-dasharray="3 3"` gridlines; Task Activity = single area filled `#e2e8f0` (slate-200); Focus Time = `#8b5cf6` line over a `url(#focusGradient)` violet area. Assignment rows default the status filter to "Active" (S9-I) and render NO subject span / description paragraph (title + pills + slider + ellipsis only); the exam 1-day bucket reads "Tomorrow" in `bg-orange-100 text-orange-600` (S9-J; ≥2 days stays amber).
- **Events view is a DARK terminal panel (session-5):** `bg-slate-900 rounded-2xl shadow-2xl`, intentionally dark in BOTH themes — do not add dark: overrides inside it. Day sections run 7 days from the selected day with year-less labels; the header carries the `CW <n>` calendar-week (`isoWeekNumber`). Recurring events (repeat) expand into occurrences inside the visible window.
- **Notes and Study Groups are TWO-PANE views (S8-G/S8-H, measured):** `flex h-[calc(100vh-8rem)] gap-6` — a `w-80 border-r border-slate-100 pr-6` left pane (h1 + icon INSIDE, 36px gradient New button — Notes uses a DropdownMenu with New Note / New Notebook items; icon search; Radix Select comboboxes for notebook/tag filters on Notes) and a BARE right pane (`flex-1 flex flex-col min-w-0`, no card wrapper) holding the centered empty state or the editor (the editor itself keeps sf-card chrome). MyDay (S8-D): a 56px amber-gradient sun block + text-3xl h1 header, quick-add with an inline plus icon, space-y-3 task rows, and a BARE suggestions toggle (sparkles + rotating chevron) expanding bg-slate-50 rounded-xl rows. MathSolver (S8-L) is a single max-w-4xl column: input card (borderless min-h-[120px] text-lg textarea + border-t footer with camera/refresh-cw/sparkles icon buttons), solution below.
- **The form-control palette is GRAY, not zinc/slate (session-5):** `--foreground` gray-950, `--input`/`--border` gray-200, `--muted-foreground` gray-400 (the reference's shadcn theme). View-level text stays slate. Dialogs are `max-w-md` + `rounded-lg` with `h-9` transparent inputs.
- **Heading hierarchy (reference-measured):** h1 view titles → h2 card titles (SectionCard) → h3 stat values (StatCard) + empty-state titles + micro-labels ("My Lists" = `text-sm font-semibold text-slate-500 uppercase tracking-wider`). Views orchestrate; `shared.tsx` owns the patterns.
- **Empty states follow ONE design:** `EmptyState`/`SimpleEmptyState` (shared.tsx) — 80px rounded-2xl gradient block (`--sf-primary-empty-from` → `-empty-to`, violet-100 → indigo-100 measured) + 40px accent icon + h3 20px/600 + 16px slate-500 hint.
- **State:** three Zustand stores — `useAppStore` (view/sidebar/drawer), `useThemeStore` (mode/accent/avatar, applied to `<html>` as RGB-triplet CSS vars via `accentCssVars` — the COMPLETE set, or non-violet accents leave stale violet tokens), `useDataStore` (per-entity client cache) + a `mutations` object that refreshes touched collections. No React Context, no react-query.
- **The THEME-APPLICATION lifecycle (S11-1, the session-11 root cause):** the theme class used to be applied ONLY by client store code after `/api/auth/me` resolved — dark users flashed light, the login route never themed, and System mode never reacted to OS switches at runtime. Now: `applyToDocument` (store.ts) persists `{ mode, accent }` to `localStorage["sf-theme"]` on every apply, and a self-contained inline boot script (`THEME_BOOT_SCRIPT` in `src/lib/theme.ts`, injected into `<head>` by the root layout) resolves the cached mode against `matchMedia` BEFORE first paint (no cache → system fallback → the login themes for dark-OS visitors). `installSystemThemeTracking()` re-applies when mode==system and the OS changes (explicit light/dark are user intent — never OS-followed). Sign-out clears the cache (fresh-visitor login state). A plain non-media `meta[name=theme-color]` (appended after Next's media ones — last match wins) tracks the effective mode. The cache format is unit-pinned (`tests/theme-cache.test.ts`) — the boot script is a hand-maintained string that cannot import the resolver, so a format change must update both in one commit. The accent scope is a measured cut: pre-auth surfaces keep the violet `:root` defaults (the reference's own login is platform-default-styled).
- **The DARK-MODE contract (S10-1, the session-10 root cause):** the reference's own Dark/System options are a Base44 platform NO-OP (measured: `html.dark` + a dark `body`, but the reference's app markup — canvas gradient, glass sidebar, white cards — never re-themes), so the clone's full dark mode is the documented superset and INTERNAL consistency is the standard. In `globals.css`, the shadcn base tokens MUST stay routed through raw triplet vars (`:root`/`.dark` `--card`, `--popover`, `--muted` …) consumed as `hsl(var(--x))` inside `@theme inline` — a LITERAL value there is inlined into the utility at build time and the `.dark` overrides can never reach it (that exact bug shipped white dialogs + invisible outline buttons for nine sessions; the shadows route through `--sf-shadow-sm` the same way). Exact-SRGB gradients/tints that must re-theme live in globals.css classes with `.dark` overrides (`.sf-overdue-banner`, `.sf-amber-card`, `.sf-today-tint`/`-cell`, `.sf-clock-chip` + `.sf-clock-time/date`, `.sf-selected-tint` — the `.sf-calc-display` precedent) — NEVER as inline styles, which cannot carry `dark:` variants. SVG charts re-theme via `dark:fill-*`/`dark:stroke-slate-800` utilities (CSS presentation properties override the SVG attributes).
- **The ACCESSIBILITY contract (S12):** forced-colors (Windows HC) and print both strip the author's color story — state must survive WITHOUT fills. The `@media (forced-colors: active)` block restores state with system colors: inset `2px solid Highlight` outlines on `[aria-label="Calendar days"]/[aria-label="Calendar mode"] [aria-pressed=true]`, `[role=tab][data-state=active]`, `[data-today]`, `.sf-today-tint`; `font-weight: 700` on `nav a[aria-current=page]` (+ its `span` — the inner `font-medium`/500 utility beats any INHERITED weight); `forced-color-adjust: none` on `.sf-slider-fill` (essential non-text graphic, WCAG 1.4.11). Do NOT add bare `[aria-pressed]` rules — 12 files use it. PRINT: the theme boot script's `beforeprint`/`afterprint` handlers remove/restore the `dark` class around the print duration (the print media never un-themes — measured 2–8 light-text elements per view otherwise); `.sf-gradient` + the `sf-print-exact` utility class carry `print-color-adjust: exact` (inherited — apply to the CONTAINER of white-text-on-color surfaces: events panel, timetable canvas, calendar month card, Button default variant, the checked checkboxes, the dashboard/myday raw CTAs); `.sf-timetable-canvas` (the `min-w-[900px]` wrapper) resets to `min-width: 0` in print so all 8 columns fit A4. The skip link (`.sf-skip-link`, the first focusable in page.tsx → `main#main-content` tabIndex -1) is off-screen NOT display:none — it must stay focusable. Reduced-motion: the standard global `@media (prefers-reduced-motion: reduce)` collapse block. The reference has NONE of these — all pure superset; the reference's own forced-colors degradation is identical (its active-nav marker wipes too).
- **The RESILIENCE contract (S13):** failure states are first-class. **AI deadlines:** every `z-ai-web-dev-sdk` call site (chat, solver, generate-cards, generate-questions) passes `{ timeoutMs: 120_000 }` to `apiSend` — LLM completions legitimately run 30–60 s, but a hung backend must never disable a composer forever; `isTimeoutError(err)` (in `src/lib/api.ts`) maps the deadline to a specific "took too long" toast. **Optimistic rollback:** the AI chat appends the user's message locally BEFORE the POST — on failure, `removeChatMessage(localId)` + `setInput(content)` bounce the text back (the restored text IS the retry affordance; never leave an orphan that silently vanishes on reload). Capture the optimistic id in a variable BEFORE the try. **Upload guards:** reject empty/whitespace filenames server-side (the Bun standalone's multipart parser surfaces an empty name as `undefined` — a 500 crash, worse than the dev runtime's stored `""`); downloads use `buildContentDisposition()` (`src/lib/server/http.ts`) — ASCII-safe fallback + RFC 5987 `filename*=UTF-8''…`, never a raw percent-encoded string inside the quoted form. **Data volume:** unbounded `findMany` lists are a VERIFIED non-gap at 300 tasks/200 notes/250 events (zero long tasks, ~370 B/row payloads) — do not add pagination/virtualization without re-running `scripts/data-volume-audit.mjs` first.
- **The CONNECTIVITY contract (S14):** the offline state is ambient, not per-request. A `ConnectivityBanner` (`src/components/layout/connectivity-banner.tsx`, mounted in `page.tsx`) bridges `navigator.onLine` via `useSyncExternalStore` — it renders NULL while online (the online DOM stays byte-identical; do not add offline chrome that renders online) and a floating amber `role="status"` pill while offline. Transport failures map to a human message at the ONE seam: `doFetch` in `src/lib/api.ts` turns a fetch `TypeError` ("Failed to fetch") into `ApiError(0, "You appear to be offline…")` — the S13 `isTimeoutError` classification is checked FIRST and propagates untouched. No service worker / offline queue BY DECISION (the per-request paths already preserve the user's work — documented in the S14 plan).
- **The SECURITY-HARDENING contract (S14):** the four AI routes (`ai/chat`, `ai/generate-cards`, `ai/generate-questions`, `math/solve`) each enforce `checkRateLimit(`ai:${user.id}`, 20)` after `requireUser`, before validation — 429 + `Retry-After` + "Too many AI requests" (the budget is ~3× the heaviest realistic burst; a full service worker off-session queue does not exist). The limiter generalizes: `checkRateLimit(key, max = 10)` — login/register keep the default. File downloads carry `X-Content-Type-Options: nosniff` + `Cache-Control: private, no-store` next to the S13 disposition. NO upload MIME allowlist BY DECISION — the reference stores arbitrary types (parity over restriction); the residual risk is documented as mitigated by nosniff + no-store + attachment. The settings route rejects whitespace-only display names (mirroring the S13 empty-filename guard) and stores padded names trimmed.
- **The AI-ACCESSIBILITY contract (S14):** AI output is announced — the assistant transcript pane (`aiassistant-view.tsx`) and the solver's "Math solution" card (`mathsolver-view.tsx`) are `aria-live="polite"` regions with `aria-busy={busy}`: while busy the region suppresses churn (the spinner/Thinking row stays sighted-only), and the completed reply/solution announces when busy flips false. Errors were already covered (the toast stack is aria-live). New AI output surfaces must follow the same pattern — never land async content into a static container.
- **API pattern:** route files are 3-line shells over `makeCollectionRoutes`/`makeItemRoutes` + an entity delegate in `src/lib/server/entities.ts`. Every query is scoped `where: { userId }` — ownership by construction. Every payload passes its Zod schema in `src/lib/validation.ts` first.
- **Auth:** scrypt hashes + HMAC-signed stateless cookie sessions (`src/lib/auth.ts`), login rate-limited 10/IP/15 min (in-memory — single instance only). No auth framework.
- **AI:** `z-ai-web-dev-sdk` is imported **only** inside `src/app/api/{ai,math}/route.ts` files (server-side). Never import it from client code. Three AI surface routes: `/api/ai/chat` (assistant), `/api/ai/generate-cards` (deck flashcards — S7-A superset), `/api/ai/generate-questions` (practice-test questions — S7-B superset; the reference's AI generation works but its test creation is broken).
- **Calculator:** `src/lib/calculator.ts` implements a tokenizer + shunting-yard evaluator (incl. a `u-` unary operator). There is no `eval` anywhere.

## Tailwind v4 traps (all live in this repo — see docs/Tailwind-V4-Validation-Report.md + docs/remediation-plan*.md)

1. Theme vars under `@theme inline` must be **full `hsl()` colors** — bare triplets silently resolve to transparent.
2. The v3-era palette is **pinned** in `@theme` (v4's oklch defaults drift 1–3 units/channel).
3. `--shadow-sm` is **pinned** to v3's `0 1px 2px 0 rgb(0 0 0 / 0.05)` — v4 shifted the whole scale one notch.
4. **Never** put `mt-*`/`mb-*` children inside `space-y/x-*` containers — v4's `:where()` rewrite flips the specificity outcome. The codebase convention is `flex gap-*` only.
5. Gradients that need exact sRGB parity use inline-style `linear-gradient(...)` (v4 interpolates utility gradients in oklab). E.g. the `.sf-canvas` background and stat-card chips.
6. The **radius scale did NOT shift** in v4 (md…3xl are v3-identical; only `rounded-sm` changed meaning — v3's 2px value is now `rounded-xs`). `globals.css` pins `--radius-sm: 0.125rem` for the v3 semantics and NOTHING else — a previous one-notch-up pin block inflated every corner (~33%) and silently broke parity (cards 20px vs the reference's 16px). Pinned by the e2e "corner radii" spec.
7. **v4 opacity utilities serialize as oklab/oklch in computed styles** — `bg-black/20` computes as `oklab(0 0 0 / 0.2)` in Chromium, not `rgba(0,0,0,0.2)`; `bg-white/95` as `oklab(0.999994 … / 0.95)` and `bg-slate-50/50` as `lab(98.16 … / 0.5)`. Same rendered colors; e2e assertions must accept both serializations (drawer backdrop + login pins).
8. **`p-4 pt-16` is NOT `p-4 + 16px more top`** — the later `pt-*` utility REPLACES the shorthand's top padding. The mobile offset models the reference's measured y=80 as a single `pt-20`; assert OBSERVABLE positions (heading y-coordinate), not internal padding distribution.
9. **The BLUR scale shifted one notch in v4** (session-4 discovery): v4 inserted `blur-xs` (4px) at the bottom, so v3's `backdrop-blur-sm` (4px) is now v4's `backdrop-blur-xs`; v4's `backdrop-blur-sm` computes 8px. Same family as the radius trap. The drawer backdrop and the login card's blur use `backdrop-blur-xs` (e2e-pinned at blur(4px)).
10. **Colors written in modern syntax serialize as their LEGACY forms in computed styles** (session-5): `rgb(0 0 0 / 0.1)` in box-shadow reads back as `rgba(0, 0, 0, 0.1)`, and any UNPINNED palette class (v4's oklch defaults) reads back as `lab(...)` — `text-cyan-400` computed `lab(76.6 -40.9 -29.6)` before `cyan-400` got pinned to `#22d3ee`. Pin every palette color you assert on (trap 2/7 family) and write e2e expectations in the serialized form. The S6 pins extend the pin block to sky/amber/red/blue/emerald/yellow (the priority/urgency palette); S7 adds blue/green/orange/red-100s, yellow-100/700, pink-500 — including **green-100 `#dcfce7`, NOT emerald-100** (the reference's measured Focus Time tint); S9 adds the overdue-banner family **red-50/red-200/orange-50** (the banner's gradient/border serialized as `lab()` before the pins).
11. **`rounded-full` serializes in EXPONENTIAL form** (session-6): `border-radius: 9999px` reads back as `3.35544e+07px` in Chromium computed styles — e2e pins on round controls accept both forms (see `isRound` in `tests/e2e/parity-session6.spec.ts`).
12. **Same-hue families are NOT interchangeable** (session-7): the reference's "green-looking" tints are exact v3 hexes — the Analytics Focus Time block is green-100 `#dcfce7` (measured rgb(220,252,231)), NOT emerald-100 `#d1fae5`, and its deck/group swatches are emerald-500/amber-500, NOT green-500/orange-500. Always convert measured `rgb()` to the hex before picking the utility class.
13. **`@theme inline` INLINES literal values into utilities at build time (S10, the biggest dark-mode trap):** `--color-card: hsl(0 0% 100%)` under `@theme inline` compiles `bg-card` to `background-color: hsl(0 0% 100%)` — NO var() indirection — so a `.dark { --color-card: … }` override of the same name can never reach the utility (it only re-themes custom CSS that references `var(--color-card)` directly, like `.sf-card`). The fix shape is shadcn's own v4 pattern: raw triplets in `:root`/`.dark` consumed as `hsl(var(--card))` inside `@theme inline` — the utilities then inline the `hsl(var(…))` STRING, which resolves at runtime. The same applies to any token that must re-theme (shadows route through `--sf-shadow-sm`). Empirical tell: `getComputedStyle(html).getPropertyValue('--color-card')` resolves the .dark value while the utility still renders light — the var exists, the utility just never reads it.

Hover-parity probing must run in Playwright, not a touch-emulating browser — v4 wraps `hover:` in `@media (hover: hover)` and produces false failures on touch emulation.

## Zod4 + certification-isolation lessons (S81, the Batch AH findings)

1. **zod@4's `.partial()` does NOT suppress create-time `.default()`** — `noteSchema.partial().parse({title})` returns `{title, content: "", tags: "[]"}`: every partial PATCH on every owned entity reset every defaulted field (a title keystroke wiped the note's content AND tags; a task toggle wiped notes/subtasks/priority). Partial-PATCH endpoints must filter to the SENT keys (see `makeOwnedDelegate.update`) or build defaults-free update schemas.
2. **Certification chunk isolation can hide cross-file state corruption** — the wipe was invisible to 80+ green certifications because no single run executed the mutating spec before the asserting spec; a combined-file run is what exposed it. When a data-loss bug is possible, run the combined order at least once.
3. **A login wait must prove AUTHENTICATION, not main-element presence** — the login page itself has a `<main>`, so `waitForFunction(main !== null)` resolves pre-auth and the next navigation races the login POST. Wait for the post-login redirect (`waitForURL(/Dashboard)`).
4. **Probe the SHIPPED contract, never a retired expectation** — audit probes that assert a design that no longer exists produce findings their own measured evidence disproves (the register-409 rot, the A4c 2000-char boundary, the C5 400-vs-404 folder contract). When a probe fails, read the route's current source and its OWN comments before "fixing" the app.
5. **An audit-tools seam that never ran live rots silently** — the standing-suite orchestrator had never completed stage 0 (the preflight-parse seam), so its stage scripts' login waits, DOM locators, and mock shapes drifted with every refactor. Fixing the seam unmasked four rot families at once. Never trust an orchestrator that has never run end-to-end.
## Coverage-claim + assertion-quality lessons (S82, the Batch AI findings)

1. **A fix's "covers all N sites" claim must be verified PER WRITE SITE** — the AH8 sent-keys
   fix landed in `makeOwnedDelegate.update` and its commit message claimed "one site covers
   all sixteen delegates"; the sixteenth (the hand-written `flashcardCardDelegate`, hand-written
   precisely because `Flashcard` carries no `userId`) still wrote the full parsed object. Every
   study-mode "Correct" rating silently reverted a hard card's difficulty to the schema default;
   every card-edit save silently un-mastered a mastered card. When a fix lives at a factory,
   enumerate the NON-factory siblings before claiming coverage — the exception that forced the
   hand-written delegate (the ownership join) is exactly where the exception to the fix hides.
2. **A tautological assertion is worse than a missing one** — `expect(w).toBeGreaterThanOrEqual(2 * (w / 2) - 1)`
   reduces to `w ≥ w − 1` (always true). The pin LOOKED like a guard, passed every re-cert, and
   verified nothing. Sibling-relative assertions (measure the Backspace cell, assert the Equals
   spans ≥ 2× it) are self-evident algebraically — reduce every structural assertion by hand.
3. **A tolerance fix's loop bounds must include the degenerate slice** — the AH7
   `parseAuditStdout` shrink loop (`end > start + 1`) never tested the single-line slice, so the
   exact failure class it was written to tolerate still failed on one-line envelopes. When a
   parser tolerates N shapes, pin the N=1 boundary too.

## Verified-behavior + tooling-interference lessons (S83, the Batch AJ findings)

1. **A comment's causal claim is a hypothesis until probed** — the S82-era
   short-circuit comments said "a Prisma update with an empty data object is
   rejected"; probing the live standalone AND the client directly
   (`db.user.update({data:{}})`) proved Prisma 6.11 ACCEPTS it as a no-op
   (@updatedAt not bumped). The short-circuit was right; its REASON was
   wrong. Probe the shipped contract before repeating a documented reason —
   the same doctrine as probing a retired expectation (S81 lesson 4), aimed
   at comments this time.
2. **An execution record's "green in sequence" claim must be re-derivable
   from the raw envelopes** — the S82 record claimed print + focus-order
   green in the orchestrator sequence, but both carried REAL findings on the
   exact S82 tree (A/B-verified with changes stashed; the audit scripts
   unchanged since scaffolding). The S82 verification step re-checked ONE
   stage's flake and took the rest at face value. Read every stage's raw
   envelope, not the one that surprised you.
3. **The Next.js dev overlay's `<nextjs-portal>` intercepts drawer-bottom
   clicks** — the element is dev-mode-only (absent from production), but the
   standing sweeps run against the dev server: any click whose target needs
   the drawer's nav scroll lands under the portal's hit area and hangs the
   sweep (six sweeps, identical crash, clean tree). The suppression
   (`nextjs-portal { display:none !important }` via addInitScript) is a
   no-op against production — audit tools must neutralize dev-mode-only
   overlays before clicking through the DOM they shadow.
4. **A nested focusable is its own tab stop** — wrapping a `<button>` in a
   focusable `<a>` gives ONE visual control TWO tab stops, and the inner
   element needs its OWN focus-visible indicator (the anchor's ring never
   renders when the button holds focus). Enumerate tab stops per control,
   not per component.
5. **`print-color-adjust: exact` is per-SURFACE, not per-view** — the S12-C2
   convention was pinned on the gradient CTAs/canvas/month-card, while five
   OTHER white-text surfaces (segmented tabs, today badges, topic chips,
   theme tiles) silently dropped their fills in print. When a print
   contract exists, enumerate every white-text-on-fill surface — the fill
   class utilities (`sf-selected-tint`) are the right fix point (one utility
   covers its every consumer).


## Stale-server + print-enumeration lessons (S84, the Batch AK findings)

1. **Kill a running server by EVERY matching PID — then verify the port is
   actually free.** The dev server is TWO processes (`node …/next dev` +
   `next-server`); killing the wrapper leaves the worker serving. The
   :3200 standalone's command line is bare `bun server.js` — a path-shaped
   grep (`\.next/standalone/server\.js`) never matches it. Two S84 restart
   attempts failed this way (EADDRINUSE swallowed into a log file while the
   STALE server kept answering health checks 200). Always: kill by PID,
   `ss -tlnp | grep <port>` to confirm free, THEN start, and verify the
   new PID's start time.
2. **A rebuild invalidates a running standalone's chunks.** The running
   server serves its loaded module graph, but the on-disk
   `/_next/static/chunks/*` were replaced by `bun run build` — the served
   HTML's chunk requests 500 (`net::ERR_ABORTED`), the shell wedges at
   Splash ("This page couldn't load"), and a fresh login looks BROKEN on a
   perfectly good build. Restart the standalone after EVERY rebuild (and
   re-copy `.next/static` + `public` + `db` into `.next/standalone/`) —
   the S9 stale-inode lesson's modern guise.
3. **A print-contract enumeration must verify the surface PRINTS, not just
   that it exists in source.** The Flashcards deck swatch (white initial
   on `deck.color`) lives inside the deck-list `<aside>` — print-hidden by
   the S12 design — so it never prints at all; same class as the sidebar
   avatar. `print-color-adjust: exact` on such surfaces is convention
   completeness only: pin the HIDING rule (the aside's `display:none`
   under print media), not the fill contract.
4. **Standing audits share the demo user's AI budget — order matters.**
   The security audit's 22-request invalid-payload spam exhausts
   `ai:<demo-user>` (20/15 min); the ai-error audit running right after
   sees 429-instead-of-400 phantom findings ("limiter shape wrong",
   "expected 400"). Restart the dev server (fresh in-memory limiter)
   before re-running a budget-consuming audit — and treat any
   limiter-shaped finding on a shared server as an ordering artifact
   until reproduced on a fresh boot.
5. **Tool-rendered output can eat bracket sequences.** `transition-[margin]`
   displayed as `transition-argin]` through the whole tool-result pipeline
   (`[m` parsed as an ANSI reset) — the source looked corrupted in every
   grep/print view. The hex dump (`od -c` / python `.hex()`) is the
   authority when a "garbage" class name contains `[m…`.

## Lying-type + probe-tooling lessons (S85, the Batch AL findings)

1. **A client type that disagrees with the API boundary hides live data
   loss.** The store typed `StudyGroupRow.members: string` ("JSON") for
   84 sessions while the API shipped an ARRAY (the documented
   `membersFromRow` boundary) — the client's JSON.parse-on-array threw
   and returned [], every group rendered "0 members", addMember WIPED
   the existing members, and the edit-dialog save wiped them too. The
   runtime defect was invisible because no pin covered the surface; the
   TYPE was the seam that knew. When a store type disagrees with the
   API boundary's documented contract, that is exactly where an
   unpinned data-loss class lives — fix the type AND pin the flow.
2. **A pin that fails at PRESENCE (not at its assertion) is a discovery
   signal.** The AL2 print pin's chip locator resolved nothing — not
   "wrong fill," NOTHING. The AK2a precedent reframed such a RED as a
   print-hidden surface; this time the surface should have rendered and
   the empty members list was a live defect. Read the error-context
   page snapshot before reframing a presence-failure: a locator that
   finds nothing where CONTENT should be means the content is missing.
3. **agent-browser viewport flags do not persist across `open` calls.**
   `open <url> --viewport 390x844` applies only to that navigation;
   a later `open` resets to the default. Use `agent-browser set viewport
   390 844` for a persistent mobile viewport. And beware the
   "first button at y<80, x<120" probe at DESKTOP width: that region is
   the SIDEBAR's collapse chevron, not the mobile hamburger — clicking
   it persists the collapsed state, which the reference's drawer then
   honors (icon-only links, the S52 shared-state contract). Verify WHICH
   button a geometry-based probe resolved before drawing conclusions
   from its effects.


## Boundary-alignment + pin-isolation lessons (S86, the Batch AM findings)

1. **A defensive client seam stricter than the server schema is a
   silent-deletion edge.** `normalizeMembers` dropped blank-after-trim
   names while `studyGroupSchema` (length-based `min(1)`) accepted
   them: a direct-API write persisted an invisible member, and the
   next member write (addMember/removeMember/edit-save) wrote back the
   normalized array — permanently deleting the row. When a client
   validator drops what the server accepts, fix the SERVER boundary
   (trim+reject at the schema) so the persistence layer never stores
   what any consumer would drop; the client drop stays as
   defense-in-depth for legacy rows only.
2. **A pin green for the WRONG reason verifies nothing.** The first
   AM1 blank-name pin passed because its `"a@b.c"` email failed zod4's
   `.email()` (1-char TLDs are invalid) — the parse failed on the
   email, not the blank name, so the pin discriminated nothing it
   named. Every OTHER field in a pin's payload must be unimpeachable
   so the named field is the only possible failure cause (the S82
   tautology lesson's sibling: a pin that passes for an unstated
   reason is as vacuous as one that always passes).
3. **A daemon's spawn form is the first suspect when it dies.** The
   S32 recipe's subshell — `( setsid cmd </dev/null >log 2>&1 & )` —
   is load-bearing: the intermediate exits WHILE the tool shell lives
   so the daemon reparents to PID 1 before the reaper walks the tree.
   The bare `setsid nohup … &` form died within a call or two this
   session (the cold cert 12 minutes in, the :3200 standalone twice,
   the dev server mid-audit) before the recipe was re-read verbatim.
   When a daemon dies, re-check the spawn FORM before suspecting the
   server.
4. **A relative-URL fetch inside `page.evaluate` needs a loaded
   page.** `page.evaluate(() => fetch("/api/x"))` resolves the URL
   against the page's origin — `about:blank` throws "Failed to parse
   URL". `goto` a real route before the first evaluate (the AL1 pins
   always did; the AM1 pin initially didn't).

## Record-accuracy + read-side-symmetry lessons (S87, the Batch AN findings)

1. **A summary record that overclaims its RED evidence contradicts the
   execution record it summarizes.** The AM1 summaries said "all
   RED-first" while the cycle's own execution record correctly said
   "3 RED + 2 green-by-design regression guards" — the record-accuracy
   class AM3 was closing, reintroduced by AM's own summary layer. When
   a pin family mixes RED-first pins with green-by-design regression
   guards, the SUMMARY must carry both counts verbatim (the accurate
   phrasing already exists in the execution record — copy it, never
   compress it to "all RED").
2. **A pin shipped in the same batch as a hygiene convention must
   follow that convention.** AM5 wrapped the AL1 pins' cleanups in
   try/finally — and the AM1 e2e pin shipped in the same Batch AM
   WITHOUT the cleanup (its RED path strands the stamped row). When a
   batch establishes a test-hygiene rule, audit the batch's OWN new
   pins against it before the commit (the rule and the pin rode in the
   same diff).
3. **A duplicate-frame census must cover the OLD evidence, not just
   the current cycle's.** AM2 eliminated the s85 byte-identical pair
   while four OLDER pairs survived (s11/s77/s84) — the same class,
   outside the audit's diff window. An evidence-hygiene fix should
   sweep the whole capture directory (a blob-hash census is cheap),
   not only the frames the current audit happened to touch.
4. **A write-side trim without a read-side trim leaves legacy rows
   displaying pre-fix values.** The AM1 schema trims every NEW write,
   but rows stored pre-fix keep their padded values until re-written —
   the seam now trims on read too (the symmetry), so both sides of the
   boundary normalize identically. When a boundary fix changes the
   write path, ask which READ path still returns the old shape.
5. **The agent-browser profile persists localStorage across sessions
   — the reference's `sidebarOpen` survived a `close`/`open` cycle.**
   The drawer's first open rendered ICON-ONLY because a previous
   session's collapsed-state probe left `sidebarOpen:"false"` in the
   persistent profile. When a probe's rendering depends on persisted
   keys, READ the key before interpreting the rendering (the S52
   shared-state contract applies across agent-browser sessions too),
   and restore the key after the probe.


## Zombie-kill + noise-floor-budget lessons (S88, the Batch AO findings)

1. **`npx next build` is NOT the repo's build command — the postbuild
   static copy is load-bearing for e2e.** `bun run build` runs
   `next build && cp -r .next/static .next/standalone/.next/ && cp -r
   public .next/standalone/`; invoking `npx next build` directly skips
   the copy, and the standalone server then boots GREEN (SSR HTML,
   health 200) while every `/_next/static/chunks/*` answers 404 — the
   client never hydrates, and e2e tests hang at hydration-waits
   (45.1s timeouts, "element not found") with nothing pointing at the
   missing assets. When a whole e2e family times out at once, curl one
   static chunk BEFORE suspecting the source; and always build with the
   package-manager script.
2. **A performance budget sitting at the measurement's noise floor
   flips verdicts run-to-run — the discriminator is a stash-A/B against
   the RECEIVED tree, not a re-run-until-green.** The
   cwv-volume-stress Tasks longTaskTotal budget (2000ms) measured
   1978/2073 on the AN tree and 2250/2288/2098 on the AO tree — the
   received tree breaches its OWN budget run-to-run, and no AO diff
   touches the Tasks load path. Record the marginal class honestly (the
   S82 precedent), keep the budget (never weaken a guardrail to make a
   gate pass), and name the re-anchoring (more RUNS for a stabler
   median, or a budget re-baseline) as future-cycle work.
3. **The React-documented render-phase state adjustment is the
   lint-compliant kill for latched-boolean zombies.** Three cycles
   deferred the study-zombie fix because the obvious remedy is an
   effect + setState (`react-hooks/set-state-in-effect` is a gate). The
   documented alternative — setState DURING render of the same
   component, guarded so the next render's state makes the condition
   false — passes the repo's ESLint config verbatim (probe-first with a
   scratch file before relying on it) and kills the zombie
   structurally: the unlatch happens in the same render that observes
   the precondition, so no later refresh can resurrect the session.
4. **A cross-consumer token is closed by DEDUPLICATION at the seam, not
   by careful consumers.** avatarFrom served the avatar gradient AND
   the dark clock-date text; the fix adds the dedicated clockDateDark
   token carrying the SAME value (computed colors byte-identical —
   every existing pin stays green as the regression guard), updates the
   count pin in place, and extends the boot script's TOKENS lists at
   the SAME index (the VALUES `Object.values` insertion-order sync
   contract). The two consumers can now be retuned independently.


## Variant-coverage + env-immunity + mechanical-sync lessons (S89, the Batch AP findings)

1. **A negative boot-guard spawn must set the variable EMPTY, not rely
   on its ABSENCE — the standalone server auto-loads the repo-root
   `.env`.** The s22 spec's negative spawn omitted AUTH_SECRET from an
   explicit env object, but Next's loadEnvConfig reads the workspace
   `.env` through the spawn: a repo carrying a REAL secret (a legal
   production posture — `.env.example`'s own guidance!) leaked through
   and the guard saw a valid boot — the spec hung at its 20s exit-wait
   with nothing pointing at the leak. Dotenv-class loaders do NOT
   overwrite an already-set variable, so `AUTH_SECRET: ""` survives
   the `.env` load and the guard's documented missing/empty semantics
   fire — the negative case is now environment-immune. When a spec
   spawns the app with a deliberately-absent variable, ask what the
   app's own config loading will inject behind the spawn's back.
2. **A structural zombie kill must make the unlatch condition a
   SUPERSET of the render condition it guards.** AO4's unlatch read
   `deckCards.length === 0` while the study pane's render guard read
   `studyCard` (the indexed card) — two conditions that differ in
   shape. The partial external deletion (0 < length <= studyIndex)
   fell in the gap: no card at the index, deck non-empty, `studying`
   latched behind a fall-through render. The kill reads `!studyCard`
   now — the same value the render branch decides on, so every input
   that falls through the render branch also unlatches the session.
   When killing a latched-state zombie, enumerate the render guard's
   fall-through inputs and make the unlatch decide on the SAME
   expression, not a sibling approximation.
3. **A hand-maintained list × generated-data sync contract needs a
   machine pin at the STRING level — value equality hides index
   slips.** The boot script's seven TOKENS name-lists ride the
   `Object.values(ACCENT_TOKENS[a])` insertion-order contract with no
   guard; every accent's clockDateDark === avatarFrom today, so an
   index slip between value-equal neighbors would stay green forever.
   The AP3 pin parses the lists out of the script string and asserts
   they equal the accentCssVars key order AND the Object.values
   length for every accent — MUTATION-PROVEN (dropping one name goes
   RED). One string-level pin retires a whole class of future
   misalignment.


## Third-leg pins + fixture-scope + rendered-doc lessons (S90, the Batch AQ findings)

1. **A multi-site sync pin must pin EVERY site the generated data rides
   — a two-leg pin leaves the third site's reorder free.** The AP3 pin
   pinned script-names ↔ accentCssVars key order (accentCssVars reads the
   literal BY NAME, so its key order is fixed by the accentCssVars CODE,
   not the literal's line order) and length ↔ Object.values length — but
   never the ACCENT_TOKENS literal's OWN key insertion order, the exact
   order the boot script's VALUES generator (`Object.values`) emits. A
   value-equal key REORDER inside a literal kept both legs green while
   the pre-paint script paired names with wrong values (the auditor
   probe-reproduced it). The AQ1 third leg closes the triangle
   transitively: accentCssVars keys == script names == literal insertion
   order == Object.values order. When pinning a hand-maintained ×
   generated sync, enumerate EVERY site the data passes through and pin
   each leg against its OWN source of order.
2. **A "green-by-design" pin that goes RED on its first run is either a
   pin bug or a REAL discovery — investigate before adjusting the pin.**
   The AQ1 pin's first run failed at `primaryFg`: the ONE literal key
   whose script name is not the mechanical kebab (it reads
   `--sf-primary-foreground` → `foreground`, verified against
   accentCssVars). The pin was right to fail — the vocabulary exception
   is now mapped and comment-documented AT the assertion. Do not
   "fix" a RED green-by-design pin into vagueness (dropping the
   name-equality for a weaker length check would have re-opened the
   blind spot); make the exception explicit and keep the strong form.
3. **Stamped fixtures must be created INSIDE the try whose finally
   cleans them — a setup failure outside the try leaks them.** The
   AO4/AP1 pins created their stamped CARDS before the try: a failed
   card-create (4xx) aborted before the finally, leaking the deck into
   `db/e2e.db` despite the "deletes on EVERY path" comment. The AQ2
   restructure moves the card creates inside the try (the DECK stays
   before it — the finally's `deck.id` dependency). The convention for
   future pins: the try opens immediately after the fixture the finally
   references; everything else the test creates rides inside.
4. **A docs table row glued onto its predecessor's physical line is
   INVISIBLE in rendered markdown — count the pipes.** The Session-89
   row was appended without a newline: one 12,349-byte line carrying 8
   pipes (two 3-column rows), plus a stray blank line that broke the
   table before the Docs row — GFM silently drops body cells beyond the
   header's column count, so the row existed only in raw source. The
   AQ3 fix split the line and dropped the blank. The class rule: append
   session rows with a real newline and verify pipe parity per row
   (4 pipes for the 3-column sessions table) after editing.
5. **The standalone server RETITLES its process (`next-server (v1.x)`)
   — a command-line grep for `standalone/server.js` will not find it.**
   The S84 kill-by-matching-PID lesson has a sharper form: after the
   standalone boots, `ps` shows the RETITLED name, so the cert script's
   `server.js` grep matches nothing and a stale :3200 server survives
   across rebuilds (S84 lesson 2's stale-chunk wedge class). Kill by the
   LISTENING PORT's PID (`ss -tlnp | grep :3200`), then verify the port
   dead by curl — the process title is not the command line.

## Noise-floor budgets + port-kill discipline + escaped-pipe auditing lessons (S91, the Batch AR findings)

1. **A budget pinned INSIDE a measurement's noise band is a coin flip, not
   a guardrail — re-anchor it on the documented band, never on one green
   run.** The cwv-volume-stress longTaskTotal budget (2000ms) sat inside
   the documented same-tree band 1821–2288ms (S82/S88/S89/S90/S91 — the
   S88 stash A/B measured the SAME tree 1978 green / 2073 red): the same
   healthy codebase read green or red on machine-load conditions alone,
   and three consecutive cycles measured green and deferred. The AR1
   re-anchor (2400ms — 112ms above the max documented reading) follows the
   S51 LCP in-suite-correction precedent: measure the band across runs AND
   machines, set the budget OUTSIDE it, document the derivation at every
   sync site (the seam, the script's BUDGETS, the boundary pin's own
   title), and keep the boundary exact (2400 green / 2401 exactly one
   finding). A fresh triple measuring green (1821/1836/1849) is evidence
   ABOUT the band, not a reason to skip the re-anchor — the S88 readings
   came from the same class of tree on a busier machine.
2. **A kill-by-command-line grep is dead code against a server that
   RETITLES — kill by the LISTENING PORT, and scope it to the port you
   own.** The cert script's per-chunk `ps aux | grep server.js` kill
   matched nothing after boot (the S90 lesson 5's own incident, never
   applied to the script) AND in practice matched EVERY standalone server
   on the box — killing a parallel :3200 verification host between chunks.
   The AR2 fix: PID by `ss -tlnp` on the E2E port ONLY, curl-verified
   dead, SIGKILL escalation; the command-line grep is gone (a non-listening
   leftover cannot wedge the cert — playwright reuses only a HEALTHY
   listener, and a bind race fails LOUD with EADDRINUSE, never silently).
   A stale-server guard that cannot name its own target port is a
   false guard.
3. **Count pipes with ESCAPES in mind — `\|` inside a cell is a legal GFM
   literal, and a raw `|` inside inline code still splits the row.** The
   s90 audit's README pipe-parity finding was one-third wrong: its awk
   pipe count flagged Session-64's row (7 raw `|` chars), but three of
   them were `\|` escapes — legal GFM, the row rendered fine. The two
   REAL defects: a row missing its status/docs cells entirely (Session-70)
   and a row split by a raw pipe inside `` `getContent(): string | null` ``
   (Session-78 — GFM splits table rows on `|` BEFORE parsing inline code,
   so even code-span pipes need the `\|` escape). The verified method:
   count UNESCAPED pipes only (a `|` not preceded by a backslash), expect
   4 per 3-column row, and fix by escaping or adding cells — never by
   trusting the raw count.
4. **A probe tool's own failure path is part of its contract — a cleanup
   that only runs on success is a leak with a comment on it.** The s90
   resweep deleted its probe user only at the end of the success path: any
   mid-run throw (a nav-label change tripping a 15s click timeout) jumped
   straight to the catch and stranded the row in the PERSISTENT custom.db
   — while the script's own comment claimed "the scratch DB no longer
   accumulates one probe user per run". The AR4 restructure: hoist the
   fixture handle (the registered email), run the cleanup in a FINALLY
   keyed on it, and print the result envelope AFTER the cleanup so the
   reported probeCleanup reflects the delete's real outcome on every path.
   The same convention as the e2e stamped fixtures (AQ2), applied to the
   operator-facing scripts.
5. **An eyeball gate is not a gate — make the distinct-frame check FAIL the
   run.** The s90 capture script printed "DUPLICATE PRESENT" and exited 0:
   a byte-identical evidence pair (the AN3 class) could ship while the
   script reported success. The AR7 hardening: the md5 check sets
   `process.exitCode = 1`, and the script pins its own DATABASE_URL
   (a wrong env fails loud at the demo-user check instead of silently
   targeting another db). Evidence gates that only print are decoration;
   gates that exit non-zero are contracts.

## Hue-consumer tokens + measurement-isolation + pin-discriminator lessons (S92, the Batch AS findings)

1. **A source-scan pin must discriminate a CONSUMER from a MENTION — the
   quote adjacency is the discriminator, never a bare substring.** The
   AS1 consumer-sweep pin's first form (`toContain("sf-pill-red")`) passed
   the live mutation proof for the WRONG reason: reverting a consumer to
   raw classes left the file's COMMENT ("the family rides the sf-pill-red
   utility") satisfying the substring. The mutation-proven form requires
   a quote immediately BEFORE the class (`"sf-pill-red` — the whole value
   or the first class of a composed string): prose mentions have a word
   boundary, never a quote. Every source-scan pin needs its own
   mutation proof BEFORE its first green is trusted (the S82 tautology
   lesson's structural sibling — a pin that cannot fail its own mutant
   is documentation, not a guard).
2. **The centralized hue family makes drift a one-site fix instead of a
   27-site re-derivation — but the divergent single-site variants stay
   site-local ON PURPOSE.** The 29 canonical consumers of the AG-pinned
   hue families now ride `sf-pill-*` / `sf-alert-*` utilities
   (color-only, `.dark &` branches, palette-var references so the @theme
   pin stays the single source); the 3 divergent variants (the login
   `bg-red-50/70` alert, the RUM panel's borderless red-600 alert, the
   dashboard overdue icon chip's bg-only pair) are documented residuals —
   file:line-anchored in the residual register and machine-guarded by
   the S93/AT1 negative sweep (a raw `dark:bg-*-950` family site outside
   the register fails the pin) — a utility per single-site variant would
   be speculative scaffolding. The register's first TREATED entry: the
   connectivity banner (S94/AU2 — it rides `sf-connectivity-pill` now,
   its entry removed in the same change; treatment and register-update
   ride one commit or the anchor pin fails on the stale row). A NEW
   consumer of these hue families rides the utility
   (the sweep pin + the negative sweep enforce it); a new FAMILY earns
   its own utility only at its second consumer.
3. **A measurement protocol IS part of the budget's noise band — never
   run the cwv stage concurrently with other spawns.** The S92
   band-gathering triple read Tasks longTaskTotal 1865ms idle, then
   2102–2411ms in the two runs that overlapped vitest worker spawns —
   the 2411 reading would have "disconfirmed" the freshly re-anchored
   2400 budget if the concurrency had gone unrecorded. The standing
   suite's sequential design already enforces isolation; the lesson for
   ad-hoc evidence runs: an idle machine is a precondition of the
   measurement, and any concurrent spawn (a test suite, a lint, a build)
   belongs in the record next to the reading it contaminated. The other
   four S51 families (lcp 2464–3728 vs 4400 / cls 0 vs 0.1 / fcp
   592–784 vs 1500 / ttfb 7–33 vs 500) sit FAR outside their bands —
   no coin-flip classes there.
4. **A latent dark-mode gap hides in the states a sweep never drives —
   census the CONDITIONAL branches, not just the rendered views.** The
   RUM rating badges (`/rum`, outside the 20-view dark sweep) and the
   PracticeTests timer's red branch (a state that renders only in a
   test's final 60 seconds) both carried NO dark half and the timer rode
   the WCAG-failing red-600-on-red-100 pair (3.95:1) — the exact class
   the DuePill's Lighthouse-61 lesson fixed once already. The census that
   found them was a grep over the raw `dark:bg-*-950` family, not a
   browser pass: rg finds the branches the user never renders.

## Residual-registers + re-tag-filenames + constrained-environments lessons (S93, the Batch AT findings)

1. **A residual register without an anchoring pin is prose.** The s92
   hue-family residual register (4 divergent sites) existed as a
   documented convention — but nothing verified the documented sites
   still carried their raw classes, and nothing failed when a NEW raw
   site appeared outside the register. The S93/AT1 fix: the register is
   now file:line-anchored IN the pin, verified from both directions (a
   treated residual fails loudly with the "update the register" remedy;
   an unregistered raw `dark:bg-*-950` site fails the negative sweep).
   Prose becomes a guard only when the guard tests the prose.
2. **The S89 re-tag lesson has a second surface: the capture
   FILENAMES.** Re-tagging the s93 resweep replaced the probe email,
   the marker prefixes, and the headers — but missed the `92-`
   screenshot filename prefix, and the first run overwrote 18 committed
   s92 evidence frames (restored via `git checkout`, the prefix swept,
   the run repeated clean). A re-tag must sweep EVERY session-numbered
   string; when a re-tagged evidence script writes into the screenshots
   dir, run `git status docs/screenshots/` after the FIRST run.
3. **The verification environment is part of the protocol.** An
   environment whose background processes die at the command window's
   edge forces honesty into the tooling: the e2e cert runs per-chunk
   (the AS6 kill + fresh-db logic replicated exactly per chunk), the
   standing suite runs grouped (each audit still EXACTLY once, the
   documented order preserved, envelopes persisted across windows), and
   the ONE stage that cannot fit the window (accent-dark-sweep, >9.3
   min here) is recorded NOT-RUN with its leaked state restored by the
   closing guard — never green-by-omission. Design verification to be
   honest under constraint, not to pretend the constraint away.

## Treated-residual + pin-carrier + running-script lessons (S94, the Batch AU findings)

1. **A residual register earns a TREATED direction the day the first site
   is treated — update the register IN THE SAME CHANGE.** The s93
   register's own note said "update the register if the site was
   treated," and its second direction (every documented site still
   carries its raw class at the recorded line) fails loudly on a stale
   entry: treating the connectivity banner (AU2) without removing its
   register row would have broken leg 4 in the same commit. A register
   with a treatment path needs the removal to ride the treatment — never
   a follow-up.
2. **A utility can be the PIN'S CARRIER, not a consumer-deduplication.**
   The S92 lesson 2 bar ("a new FAMILY earns its own utility only at its
   second consumer") guards against speculative scaffolding for
   single-site variants — but the connectivity banner's utility exists
   for a different reason: the pinned pair needs a home that references
   the @theme vars (the single-source contract), and the alpha border
   needs the raw-rgb() convention (legacy rgba serialization — never
   color-mix). Site-local raw classes were the drift liability itself
   (trap-10: the two steps the banner rode were the family's only
   unpinned ones). The discriminator: a utility that exists so a PIN can
   live somewhere central is not scaffolding.
3. **Never edit a RUNNING bash script — bash reads incrementally by file
   offset.** Editing the cert script's header between chunks shifted the
   parser's offsets: every chunk had already passed (the counts were
   real), but the final DONE echo misparsed as a syntax error. The
   file-offset class of the S90 lesson 5 (the retitled process), now on
   the script file itself: queue doc edits to a script until its run
   completes, or copy-then-swap.
4. **A parallel-session push rebase is a RE-SCOPE, not a merge — the
   interrupted cycle's work re-executes on the new base with new labels.**
   The S94 cycle is the S93-interrupted session's AT work re-executed on
   the parallel AT's base (their cycle closed the audit riders and never
   touched the trap-10; this cycle closes the trap-10 and rides their
   register). The census arithmetic composes: their 921 + this cycle's
   2 = 923 unit; their 470 + this cycle's 4 = 474 e2e. The alternative —
   merging two same-numbered sessions — would have produced two
   Session-93 rows and a session_56 collision; the labels are cheap, the
   audit trail is not.

## Guard-coverage + re-tag-completeness + rejected-by-ADR-closure lessons (S95, the Batch AV findings)

1. **A uniqueness guard must cover every record its sibling pins read
   FIRST-occurrence on.** The S93/AT2 duplicate-later-definition guard
   looped `FAMILY_STEPS` while the S94 leg-5 palette pin read the
   AU_STEPS pair through `CSS.match` (first occurrence) — so a later
   duplicate `--color-amber-200` would win at runtime while every pin
   stayed green (the s94 audit's L1, demonstrated live: the plant left
   all 923 green). The fix is the IN-PLACE loop extension to the union
   of every first-occurrence-read record (the AR1 boundary-pin
   precedent) — one guard, no near-duplicate its, and the mutation
   proof re-runs against the extended pin.
2. **A re-tag must carry the gate's exit-code semantics AND the derived
   decomposition, not just the headline sum.** The s94 capture re-tag
   kept the boolean md5 gate but dropped `process.exitCode = 1` (the
   s93 shape, the S91/AR7 semantics — an exit-code-checking wrapper saw
   success on a duplicate-frame run); the cert header re-tag updated
   470 → 474 but left the 470-era "465 real specs" parenthetical stale
   (474 − 5 setups = 469). Diff a re-tag against its source's FAILURE
   branches and DERIVED numbers — the parts nobody re-reads are the
   parts a re-tag silently rots.
3. **Standing debt that is REJECTED-BY-ADR is not debt — close it, with
   an operational reopen trigger.** Batch R (RSC structural perf) sat on
   the standing-debt list through three cycles of re-validation while
   both candidate implementations were architecturally rejected
   (per-view code-splitting = ADR-014-REJECTED; a staged RSC conversion
   breaks the ADR-001 SPA-parity contract that 474 e2e pins + the
   standing suite ride on) and the eager bundle beat the reference on
   every axis (288 KB vs 634–1087 KB). Keeping rejected work listed as
   debt misrepresents it as pending. The closure names its reopen
   trigger — a budget landing inside its band — which the standing
   suite's cwv + cwv-volume-stress stages already machine-check every
   cycle: the guard is operational, not documentary.
4. **A machine's noise band is part of the closure evidence — record
   the reading set, not just the verdict.** The Batch R closure's fresh
   triple read Tasks longTaskTotal 2064/2418/2844 on THIS machine (the
   2844 carried settling load) vs the prior machine's documented
   1821–2288 band: the 2400 pin straddles here. The honest record: the
   straddling budget is the AR1 noise-band-adjacent class by design,
   the dominant cost of that metric is the 300-row list MOUNT (not
   bundle eval — bundle-splitting would not move it), and a budget
   straddling on one machine does not reopen rejected-by-ADR structural
   work. What DOES reopen it: a budget landing inside its band on the
   certifying machine with the isolation protocol honored.
5. **Re-anchor the LIVING convention prose; the historical revision
   blocks stay as history.** The AGENTS lesson-2 still claimed "the 4
   divergent variants … the connectivity banner … are documented
   residuals" in present tense while the machine-guarded register held
   3 (the banner TREATED at S94/AU2). The fix targets the living
   statement only — the PAD v1.3.0 block and the cycle records carry
   the 4-variant list as what was true at their revision (over-scrubbing
   history would falsify the record the register's own treatment
   direction depends on).

## S96 lessons (Batch AW — the standing rhythm: audit → riders → re-certify)

1. **A first-occurrence read guards its record class, not the whole
   file.** AV1 extended the palette-step uniqueness guard to the union
   of every first-occurrence-read STEP record — but leg-2's
   `utilityBlock()` ALSO reads the first occurrence, and a planted
   duplicate later `@utility` block left all 923 pins green (the blind
   spot demonstrated live with orange-content mutant). The AW1 pin
   closes the class in the completeness form: EVERY `@utility` header
   exactly once — all 38+ blocks guarded, a new utility joins the kill
   set for free (no contract-map enumeration to forget).
2. **A script-behavior contract belongs at a pure src/lib seam.** The
   resweep exit-code class had been flagged three cycles running (AR7
   s91, AV2 s95, the s95 audit's L2) because the re-tag class kept
   shipping without the gate — a two-line fix re-tagged away. The
   permanent shape is the suite-verdict precedent: `src/lib/resweep-gate.ts`
   (pure, unit-pinned, 6 legs RED-first) imported by the script — the
   census-visible import makes a gate-dropping re-tag fail the unit
   layer, and the live wiring proof (planted in-try throw → exit 1
   observed; green run → exit 0) demonstrates the gate discriminates.
3. **The plan is a hypothesis; the execution record owns the census.**
   The Cycle-46 plan projected +1/+1 pins; the reality shipped +1/+6
   (six focused legs beat one composite assertion — one failed leg, one
   precise RED). Recorded as the correction in the execution record,
   the AT precedent — never silently trimmed to match the projection.
4. **A plan-side evidence paragraph must carry the cycle's OWN
   numbers.** The Cycle-45 plan quoted the S93/AT4-era reading set as
   "re-validated fresh this cycle" while the fresh triple lived only in
   the execution record — the evidentiary record contradicted itself
   within one commit (the s95 audit's M1). Plans are written before
   evidence exists; when the evidence lands, the plan's quoted numbers
   follow it or the plan labels its numbers as the prior receipt.
5. **Read the persisted key before interpreting a rendering — and know
   WHICH key each host owns.** The reference's collapse key is
   `sidebarOpen`; the clone's is `sf-sidebar-collapsed` (this session's
   own first-attempt miss: the reference's key is inert on the clone).
   The dual-host mobile-nav protocol now records both key names.

## S97 lessons (Batch AX — the audit-rider cycle: census hardening + runner reconciliation + capture-exit ownership)

1. **An audit's recommended fix can itself be wrong — falsify it live
   before shipping it.** The s96 audit's L2 offered two closes for the
   resweep runner convention (re-tag the usage line to bun, OR document
   the node constraint). The bun-first re-tag was tried live and
   FALSIFIED: under bun 1.3.14, playwright-core's APIRequestContext
   crashes in `_parseSetCookieHeader` during the verify-email POST — the
   SAME script passes under node (both directions observed the same
   cycle; the bun crash doubled as an unplanned live failure-path proof
   of the AW2 exit gate: exit 1 on the real envelope, probeCleanup
   "delete answered 401"). The shipped fix documents the node ≥ 23.6
   type-stripping constraint and marks bun INCOMPATIBLE for this script
   class. A recommendation is a hypothesis; the live run is the
   authority.
2. **A census guard's regex IS the contract — its blind spots are SHAPE
   blind spots.** The AW1 completeness pin demanded exactly one
   conventional header shape (`@utility name {`), so a duplicate written
   `@utility sf-pill-red{` (no space before the brace) escaped BOTH the
   census and the dupe guard — demonstrated live: all 930 pins green
   while the CSS cascade would let the later block win at runtime. The
   widened regex (`/@utility\s+([A-Za-z0-9_-]+)\s*\{/g`) + the NEW
   token-reconciliation pin (the `@utility` token count must equal the
   matched-header count) close the class: every header shape counts, and
   any token the regex cannot parse fails LOUDLY instead of silently
   falling out of the census. The two-plant mutation matrix proves each
   pin's OWN discriminator (the variant-shape plant trips exactly the
   widened dupe check; the unparseable-form plant trips exactly the
   reconciliation pin).
3. **Every failure path a script can take should be GATE-OWNED, not
   runtime-owned.** The capture class's mid-run throws exited 1 through
   node's unhandled-rejection semantics — fail-safe, but with a raw
   stack spew and no script-owned failure line. The AX3 catch
   generalizes the md5Failed shape: the failure prints its own line,
   sets `process.exitCode = 1`, and the completion line keys on the
   explicit booleans (both observed live, before and after the fix).
4. **The reference probe account's credentials are hardcoded across
   every committed re-tag script** (the dedicated probe-account posture,
   standing since the s7x era). Rotating that account is a sweep-list
   run, not a one-file edit: `grep -l sepnetflix scripts/` → every
   `ref-resweep-sNN.mjs` re-tag + the standing drawer probe — update all
   hits in one pass, or the next resweep registers with a dead account.
   Documented here (AX5) so a future rotation is a checklist, not
   archaeology.

## S98 lessons (Batch AY — the audit-rider cycle: the capture-lineage runner-convention reconciliation + the census comment-immunity)

1. **A convention shipped into ONE lineage is not shipped into the class — census the whole class, then pin it.** The AX2 node-runner convention was swept into the resweep lineage (32 files) and the s97 capture, while TEN capture scripts (s87–s96) still said `Usage: bun` — and the AX commit itself had modified capture-s96 (the AX3 catch) without fixing that file's own contradictory usage line. The close: the ten lines swept AND the new `tests/script-conventions.test.ts` census pin (every Usage line in the capture/resweep lineages documents node — a future re-tag copied from a stale template fails the unit layer). The pin is existential by design: files WITHOUT a Usage line are the pre-s87 historical era, out of scope — the pin guards every line that exists, and its sanity leg proves the census ran.

2. **A census that counts tokens in COMMENTS counts prose as CSS — strip the comments before the count.** The AX1 token-reconciliation pin matched `@utility` anywhere in the file, so a future prose comment (`/* the @utility census note */`) would inflate the token count into a loud FALSE failure (demonstrated live: 39 tokens vs 38 headers). The fix runs both census counts on comment-stripped CSS — and the semantics are CORRECT, not a workaround: a commented-out `@utility` block is not real CSS, it does not win at runtime, so it must not count. The three-plant mutation matrix after the fix: the shape-variant duplicate trips exactly the dupe check, the unparseable form trips exactly the reconciliation pin, the comment trips NOTHING.

3. **Scope every claim to the run that produced it — an over-scoped crash claim is a small lie with a long life.** capture-s97's header claimed the bun crash occurred "on this flow's page.request calls" — but the live evidence was the RESWEEP's verify-email POST (a Set-Cookie response); the capture flow's own requests were never tested under bun. The honest header now says exactly that, and the s98 re-tag inherits the corrected wording. The genus generalizes: when documenting a falsification, name the exact repro — the next reader will otherwise over-trust the scope.

4. **The evidence-capture gate earns its keep on the FIRST draft, not just the regressions.** The s98 capture's leg-2 first draft gated on the Flashcards STUDY pane — the wrong surface (the study card carries no pill family; the difficulty pills live on the deck-detail card grid). The AX3 catch caught it live: exit 1, the script-owned `FAILED:` line, no frames written, the demo surface restored by the finally — and the leg was re-designed against the real DOM. A capture script whose gates are wrong is a screenshot of nothing; the gate is the assertion.

## S99 lessons (Batch AZ — the audit-rider cycle: the mutation-record shape-true re-scope + the playwright-class census widening)

1. **A guard fix that changes normalization semantics RE-MAPS the mutation matrix — re-run the plants on the FINAL tree, not the pre-fix one.** The S98 record claimed "Plant B (unparseable form) trips exactly the reconciliation pin" — true on the PRE-AY3 tree (raw CSS, the header regex never matched the inline-comment form). After AY3's comment-strip, the SAME plant shape normalizes to a conventional duplicate and trips the DUPE check instead — the record described a discriminator mapping that no longer replicates. The genus is the S98 lesson-3 itself: scope every claim to the run that produced it — and a mutation matrix is a claim about a tree, so it goes stale exactly when the guard it proves changes. The close: the record healed in place with a dated correction (the AX4 precedent) AND the shape-true matrix machine-checked by the NEW normalization pin (the inline-comment form → dupe; the wildcard form → reconciliation; the comment → NOTHING).

2. **A lineage is a proxy for a class — when the class has a mechanical definition, pin the class.** The AY1 convention census guarded the two re-tag lineages (the scripts that get re-tagged each cycle) — but the AX2 runner convention governs every script that IMPORTS PLAYWRIGHT (the crash is a playwright-core behavior), and 129 playwright importers lived outside the lineages, 49 of them carrying Usage lines, all unguarded. The blind spot was demonstrated live: a planted bun line in z-probe-s70.mjs left the lineage-scoped pin GREEN. The widened census uses the import statement as the class discriminator — mechanical, not naming-convention-based — so a future script of any name joins the guard automatically. The frozen-historical-era doctrine stays honest: scripts that import NO playwright may document any runner.

3. **A grep-sweep trap in committed prose is a one-line fix — fix it when the audit hits it.** capture-s98's header contained the literal string `Usage: bun` inside a sentence DESCRIBING the AY1 sweep. The convention pin could not trip on it (line-prefix match), but this audit's own rotation sweep (`grep -l "Usage: bun" scripts/`) false-positived on it — exactly the sweep the AX5 rotation checklist prescribes. The reword (one line, zero behavior) removes the trap; the lesson: when prose quotes a forbidden shape, paraphrase it.

## S100 lessons (Batch BA — the audit-rider cycle at the plateau: the census-count register note + the evidence-frame rotation)

1. **A census count is a claim about a tree — and the tree GROWS after the measurement when the cycle's own riders join the guarded class.** The AZ2 widening was measured at 213 playwright importers / 94 Usage-line carriers; the AZ5 riders then created two more playwright importers, and the final tree carries 215/96. Nothing is wrong — the threshold-form pins (>200 />40) absorb growth BY DESIGN (the widening's own doctrine: a future script of any name joins the guard automatically) — but the NEXT audit's re-derivation lands on numbers the record never mentions. The close is a dated register note (the AZ4 latent-register precedent), NOT an exact-count pin: pinning 215 would contradict the silent-absorption intent and manufacture conscious-update friction on every future re-tag. The instrument rule: when a guard is threshold-form by design, the record carries the measured count AND the growth mechanism, and the audit re-derives expecting drift upward, never silent drift downward.

2. **A clean audit (0 findings across all six claim-classes) is itself the deliverable — ride the rotation, do not manufacture a headline.** The s99 audit found every AZ claim TRUE with working discriminators on every guard (the full shape-true matrix replicated live: every plant tripped exactly its owning pin). The honest cycle then ships the riders (the re-tag + the evidence-frame rotation onto surfaces no prior frame covered, both ALREADY e2e-pinned — the AG3 calculator AC key, the AU3c events dialog banner), the register note, and an EXACT-BY-CONSTRUCTION census projection (936/474 unchanged: documentation + scripts only, src/ untouched). Inventing a pin to justify a "headline" would be the anti-pattern — the platform's value is the verified plateau, and the record's job is to say so plainly.

3. **The mobile-nav link-count instrument must match the prior sessions' semantics or the drift is the INSTRUMENT's, not the site's.** The s100 drawer-panel-scoped count found "20 labeled links" where S97–S99 recorded 24 — the reference's drawer PANEL carries 20 nav links, and the recorded 24 counts the links visible through the translucent backdrop on the whole MOBILE VIEWPORT (20 drawer + 4 page-behind on the Dashboard home). Both numbers are true under their own instrument; the verification contract's numbers (reference 24 / clone 26) are viewport-scoped, and an auditor switching instruments mid-protocol manufactures a false parity drift. Pin the instrument's scope in the record when the count is the contract (the same genus as the S96/AW4 lesson: arithmetic must stay re-derivable).

## S101 lessons (Batch BB — the audit-rider cycle at the plateau: the register rotation + the s101 evidence-frame rotation)

1. **A register note is itself a census about a tree — the rotation is the mechanism, not a repetition to re-discover.** The BA1 note recorded 215/96, and the BA2 riders then joined the guarded class exactly as the S100 lesson-1 doctrine predicted: the s101 audit's re-derivation landed on 217/98 with the frozen era unchanged at 119 — the doctrine's own arithmetic (the register's counts + this cycle's riders), verified live rather than re-derived as a surprise. The operational rule: an audit that finds the register drifted UP by exactly the riders named in the prior record closes with the NEXT register note (the register rotates forward); an audit that finds any OTHER drift (downward, or upward beyond the named riders) has found a real finding — the register is a tripwire whose expected movement is documented, not a number to keep current by pin.

2. **A route-intercept theming convention is only as real as the consumer that fetches it — verify the mechanism reaches the surface before reusing it.** The S21 capture themed the /export page "dark" by fulfilling `/api/auth/me` with themeMode overridden — but the /export route is a SERVER component with NO `/api/auth/me` consumer: the intercept was inert, the recorded `darkRootClass` was printed but never gated, and the s101 first attempt re-inherited the dead pattern verbatim (a 15 s timeout that debugged to a permanently-light html class). The honest mechanism for theming a server-gated surface with no me-fetch is the boot script's SYSTEM FALLBACK — clear the `sf-theme` cache key and let the context's colorScheme emulation drive the documented pre-paint path (the S11 cache contract). The general lesson: when a capture's theming rides interception, name the CONSUMER whose fetch you are intercepting; if no consumer exists, the interception is theater.

3. **Zero-persistent-state captures are designed at the API contract, not asserted after the fact.** The s101 rotation frames are the cleanest pair yet because their determinism was chosen at the seam: the forgot-password API answers the identical 200 for a NON-EXISTENT email (no account oracle — no row, no token), and the import API skips every ABSENT collection key (an empty `{data: {}}` envelope → 0 created / 0 updated / 0 total — the result state renders with nothing written). Both frames render their guarded surfaces with no cleanup owed, no finally-restore beyond the context's own death — the capture convention's "zero probe rows" upgraded from "deleted in the finally" to "never existed". The design rule: prefer driving a pinned UI state through an input the API treats as a no-op over driving it through a mutation you then undo.

## S102 lessons (Batch BC — the audit-rider cycle at the plateau: the register rotation + the s102 evidence-frame rotation)

1. **The register's arithmetic is VERIFIED each cycle, not re-derived as a surprise — the audit closes the loop the prior note opened.** The BB1 note recorded 217/98 and NAMED the growth mechanism (the two s101 riders joining the guarded class post-measurement); the s102 audit's instrument-identical re-derivation landed on exactly 219/100/0-stale/119-frozen — the register's counts + the named riders, nothing more, nothing less. The S101 lesson-1 rule ("expecting drift upward, never silent drift downward") is operationalized by stating the EXPECTED number before the re-derivation runs: the audit that can say "I expect 219/100 and measured 219/100" has verified the doctrine; the audit that measures 219/100 without the expectation has merely re-discovered it. The discipline costs one line in the audit notes and converts the register from a record into a tripwire with a documented trigger shape.

2. **A seeded-data frame is the cleanest zero-persistent-state rotation — when the CONSUMERS-map surface renders from the seed, prefer it over any mutation-driven surface.** The s99–s101 rotations drove their frames through carefully designed API no-ops (the non-existent forgot email, the empty import envelope — zero rows at the API contract); the s102 rotation renders BOTH frames from the seed itself: the grade rows' scoreBadgeClass ramp (emerald/sky/amber from the seeded scores) and the assignments' soft pills (soft-blue due-in + soft-yellow priority from the seeded due dates). No API contract to design, no dialog to open, no route to abort, no probe rows to delete — the only mutation on the surface is the theme PATCH, restored awaited in the finally. The selection rule for future rotations: survey the CONSUMERS map for entries whose families render from seeded rows BEFORE reaching for a driven state; the seed is the deterministic driver that already ran.

3. **The 7-location re-tag is verified by normalization diff, never by eyeball — a sed pattern that "looks right" can silently miss the capture-path prefixes.** The s102 re-tag's first pass updated the four prose tokens (provenance, usage, probe email, probe name) but the backtick-anchored capture-path sed (`s|\`/101-|\`/102-|g`) matched NOTHING — the three `${OUT}/101-` prefixes survived untouched, and only the normalization diff (`diff <(sed s/101-tokens/SNAP/g s101) <(sed s/102-tokens/SNAP/g s102)` → must be EMPTY) exposed the miss. The verification IS the instrument: re-tag exactness is a machine property (the s100–s101 audits' "7-location re-tag diff EXACT" claim is exactly this diff being empty), so the rider that creates the re-tag must run the same diff before the audit does — the s102 workflow now does, and the lesson generalizes: any mechanical copy whose exactness is a recorded claim should ship with the copy's own verification command, not wait for the next session's audit to catch it.



4. **A cold-start failure that reproduces three consecutive times is a DEFECT with a weak gate, not a flake to wave off — probe the app state at the gate before choosing the treatment.** The final re-cert's one chunk-4 failure (the S12-B skip-link focus test) failed 3x consecutively, then passed warm — the temptation was the S84-class "re-run green standalone" precedent. The cold-start probe (the test's exact flow: storageState, setMode PATCH, goto, the gate, Tab, Enter) measured the app AT the weak gate: `appHydrated: ABSENT, mainExists: false` — the LOADING state. The test gated on `--sf-primary` (set PRE-PAINT by the boot script — the S8-A lesson's own documented trap) while the auth gate was still resolving; the loading state renders the skip link WITHOUT `main#main-content`, so the Enter's hash navigation found no focus target and the 15s ceiling expired. The S81/AH5 raise (10s→15s) had treated the late-hydration TAIL, not the weak-GATE root. The honest close: the gate strengthened IN-PLACE to the status-gated `data-app-hydrated` marker (the S8-A marker, fires ONLY when the authed shell renders) — RED 3x → cold GREEN 3x → the chunk re-certified 87/87. The rule: when a keyboard-driven test (no auto-waiting locator) gates on hydration, the gate must be the STATUS-GATED marker — and a reproducible cold failure always gets the probe before the precedent.

## S103 lessons (Batch BD — the audit-rider cycle at the plateau: the register rotation + the s103 evidence-frame rotation)

1. **A fresh workspace's browser cache is a PROVISIONING state, not a repo state — the locked
   package resolves the browser BUILD, and a stale cache fails as 130 consecutive
   `browserType.launch` errors that look like a code regression.** The 27th reset's first cold-cert
   chunk failed 130/131 with "Executable doesn't exist at
   chromium_headless_shell-1243/…" — the cache held build 1200 from an earlier era while the
   locked playwright-core 1.63.0's browsers.json pins revision 1243. The fix is `bunx playwright
   install chromium` (a required provisioning step on a reset workspace, BEFORE any e2e run); the
   tell that separates infrastructure from regression is the error CLASS (every test failing at
   launch, zero app-side assertions reached — a code regression never fails 130 tests in
   2ms each). The lesson generalizes the S46 doctrine: classify the gate (browser
   infrastructure) before reading the failures as source debt.

2. **The rotation-candidate survey follows the CONSUMERS map + the coverage ledger TOGETHER —
   the seeded-data doctrine's selection rule is a two-set intersection.** The s103 rotation
   (Exams dark urgency pills + Flashcards dark difficulty badges) was selected by intersecting
   [every CONSUMERS-map entry] with [the frames NO prior evidence run covered — the s87–s102
   rotation ledger AND the standing 31's five dark views (Dashboard/Tasks/Calendar/Analytics/
   Settings)] and keeping only the entries whose guarded families render from the SEED (the
   S102 lesson-2 rule). The exams entry's orange family had waited since s100's Events frame;
   the flashcards entry since the rotation program began. Two views whose ONLY guarded family
   is the error-alert (`sf-alert-red` on notes/timetable/practicetests) fail the seeded-data
   rule — their frames would need a DRIVEN failure state, the rotation program's deliberately
   avoided class.

3. **A view's pill-family COVERAGE must be read from the SEED's date math, not from the
   component's full ramp.** The exams view's urgency() renders four families (past-slate /
   today-red / tomorrow-orange / ≥2-days-yellow), but the SEED's dates (+1/+3/+4/+12 days)
   render exactly TWO of them — the orange "Tomorrow" + the yellow "N days"; no seeded exam is
   today or past, so the red and slate families stay unrendered BY SEED CONSTRUCTION. The
   capture's waitForFunction gates on the families the seed actually renders (orange ≥ 1,
   yellow ≥ 2) — gating on an unrendered family would be a guaranteed timeout, and claiming
   "four families covered" in the record would be a false coverage claim. State the rendered
   subset in the capture's own comment (the s103 capture does) so the next rotation reads the
   truth, not the component's potential.

## S104 lessons (Batch BE — the audit-rider cycle at the plateau: the register rotation + the s104 evidence-frame rotation onto the structural-family class)

1. **The normalization-diff instrument must carry BOTH bare predecessor tokens — the s104 audit's
   own first attempt is the proof.** Verifying the s103→s104 re-tag exactness, the diff under
   {s103, S103, s102, S102, 103-, 102-} still showed one residual line: the s102 script's header
   comment says "from the s101 tag" and s101 was NOT in the token set. The complete instrument
   normalizes the NEW tag, the OLD tag, AND both scripts' own bare predecessors (for an sN re-tag
   from sN-1: sN, sN-1, and the sN-1 script's own predecessor sN-2). A "residual" under an
   incomplete token set is not evidence of a bad re-tag — re-run with the full set before
   concluding. (The S102 lesson-3 doctrine, sharpened by its own instrument's gap.)

2. **The rotation-candidate survey WIDENS to the structural-family CONSUMERS map when the
   pill/alert class exhausts — the S103 lesson-2's own anticipated end-state.** After s103 the
   pill/alert class ∩ the coverage ledger ∩ the seeded-family rule is EMPTY: every seeded pill
   family has a rotation frame, and the only uncovered views (notes/timetable/practicetests) fail
   the seeded rule IN THAT CLASS (their only pill/alert family is the error-alert). The honest
   next step is not a driven-state frame (the deliberately avoided class) but a WIDER map: the
   @utility families beyond pills/alerts — sf-today-tint, sf-progress-card, the canvas/chip
   structural families — have consumer components and e2e pins of their own. The s104 rotation
   (Timetable dark today-header + MyDay dark progress card) selected by the SAME two-set
   intersection + seeded rule, applied to the widened map. The rotation program's rule survives
   the class change; only the map's enumeration grows.

3. **Read a view's chip COMPONENTS, not their text — the MyDay gate's own first failure.** The
   s104 capture's first MyDay gate counted .sf-subject-chip >= 1 because the seeded rows show a
   "Mathematics" tag — but the task rows render the PLAIN SubjectChip (slate), while the
   sf-subject-chip accent family rides SubjectTagChip on the Exams and Assignments rows. The
   probe-first discipline (a debug probe against the live host BEFORE the gate is trusted) caught
   it in one run; the gate then counted exactly the two families the view renders
   (sf-progress-card + sf-pill-red). Same shape as the S103 lesson-3: gate on what renders, and
   verify the component (grep the JSX), not the rendered text.

## S105 lessons (Batch BF — the audit-rider cycle at the plateau: the register rotation + the s105 MOBILE evidence-frame rotation — the viewport axis the program never varied)

1. **The evidence-frame program's own blind axis is the VIEWPORT — eighteen rotation frames at
   one width is a coverage ledger with a hole.** Every s87–s104 evidence frame is a desktop
   1280×800 capture; the standing mobile captures are LIGHT dashboard/drawer/tasks only. The
   rotation ledger's "surface no prior evidence frame covered" claim was true per-frame but
   systematically false per-AXIS: the Timetable's `md:hidden` day accordion cannot exist at
   desktop, so NO rotation frame could ever have shown it, and the mobile DARK surface of the
   Dashboard was never captured anywhere. The AP-79/AP-80 lesson class (a viewport band never
   varied is a blind band; an axis never varied is an axis never verified) applies to the
   evidence program itself, not just the sweep program. The s105 rotation (Timetable mobile
   accordion dark + Dashboard mobile dark at 390×844) closes the axis hole with the SAME
   two-set intersection + seeded rule, applied at the new viewport; the lesson generalizes —
   when a coverage ledger enumerates surfaces, ask which RENDERING AXIS the ledger itself was
   never varied along.

2. **A mobile-only surface is the STRONGEST rotation candidate — it fails the "already covered"
   check by CONSTRUCTION, not by bookkeeping.** The rotation candidate survey ranks surfaces
   that CANNOT render at the already-captured viewport above surfaces that merely were not
   chosen: the `md:hidden` accordion (desktop-uncapturable) carries its own guaranteed-novel
   evidence, while a desktop-re-renderable surface at mobile relies on the ledger's
   completeness for its novelty claim. When the map allows it, prefer the responsive-exclusive
   surface — the same ranking rule that made the s104 structural families stronger than
   re-treading a covered view's second family.

3. **The collapsed-sidebar persistence key is a BOOLEAN STRING, not a truthy marker — the
   mobile-nav verification's own first attempt is the proof.** Setting
   `localStorage["sf-sidebar-collapsed"] = "1"` renders the sidebar EXPANDED (the store reads
   `=== "true"`, src/lib/store.ts hydrate), and a rail measurement taken at the wrong width
   reads 20 text links with ZERO title/aria — exactly the REFERENCE's own rail shape, a
   false-parity reading in the wrong direction. When driving a persisted UI state through
   localStorage, read the consumer's exact comparison FIRST (grep the store), then set the
   key to the value the comparison expects; verify the geometry (aside width 80px) before
   measuring the links.

## Testing quirks

- E2E specs run against the **production standalone build** — rebuild after any component change or you will chase ghosts.
- **`transition-all` cells animate color reads (S8 lesson):** clicking a calendar cell then immediately reading its computed background catches a MID-TRANSITION blend (e.g. rgb(184,157,250) between violet-500 and violet-100). Gate state-dependent color asserts on `waitForFunction` polling the FINAL computed value, not on a DOM text change that renders in the same frame.
- **Post-click evaluates race React's re-render:** an evaluate issued right after `click()` can read pre-render state even when hydration completed earlier. Poll for the observable end state (see the theme-accent spec's `waitForFunction` hardening).
- **Dynamically-built CSS var names must be kebab-case (S8 lesson):** `var(--sf-primary-${tokenName})` with a camelCase `tokenName` ("avatarTo") silently resolves NO var — the gradient computed to `none`. `NAV_ACTIVE_GRADIENT_STOPS.toCssVar` carries the kebab suffix; unit-pinned.
- The e2e database **persists across runs** — give created rows unique titles (see `stamp` in `tasks.spec.ts`) or strict-mode locators will trip on stale rows. Changing seed values requires deleting `db/e2e.db` (the seed short-circuits when the demo user exists). This quirk covers the MID-SESSION re-run case only — the full-run mandate is ALWAYS COLD (`rm -f db/e2e.db` before EVERY full run, the Testing section's S45/S46 doctrine; re-anchored here by S96/AW4f, the s95 audit's I-4).
- **Hydration gate before clicking:** SSR HTML renders buttons before React attaches handlers — a click right after `goto` can silently no-op (order-dependent flake). Gate on the theme store's inline `--sf-primary` var on `<html>` (see `hydrated()` in `calculator.spec.ts`).
- Tests share ONE signed-in storageState (the rate limiter!). `auth.spec.ts` opts out with an empty `storageState`. Keep total real logins ≪ 10 per run.
- The theme spec mutates the shared user record — it **restores the violet accent** at the end AND awaits the settings PATCH response before ending (ending right after the click can abort the in-flight request, persisting teal and poisoning every later violet pin — an order-dependent flake pinned in session 4; the post-click var reads were further hardened with `waitForFunction` polls in session 8).
- Radix tabs use `data-state="active"` (not `"selected"`); hidden TabsContent panes stay mounted — scope role lookups to `getByRole("tabpanel", { name })`.
- Playwright `getByRole({ name })` is case-insensitive AND substring-based — "New note" also matches "New notebook" (strict-mode violations). Use `exact: true` when names collide. The SAME substring behavior applies to `getByLabel` (S24 lesson: `getByLabel("New password")` also matched "Confirm new password" — exact: true again). `getByLabel` only resolves controls with a real label association — a label wrapping a control GROUP must be asserted via `getByText`.
- `next dev` OOMs in ~4 GB containers when several headless browsers run — close extra sessions before long e2e/dev sessions.
- **`count()` does NOT auto-wait (S9 lesson):** chart-pin locators counted right after `goto` raced the async data fetch and failed intermittently — gate SVG/chart assertions on auto-waiting `expect(...).toBeVisible()`/`toHaveCount()` + polling, never a bare `count()` snapshot. Likewise the dashboard banner renders only after the tasks fetch resolves — `await expect(banner).toBeVisible()` instead of asserting presence immediately.
- **Never keep a debug server on :3100 (S9 lesson):** a manually-started standalone server collides with the Playwright `webServer` — it keeps serving the DELETED `db/e2e.db` inode (readonly-looking writes, POST /api/tasks 500s) and poisons the whole suite. Kill every `:3100` listener before `test:e2e`.
- **VLM pairwise screenshot comparison can SWAP image attributions (S9 discovery):** the model labeled the reference's account as "clone" and vice versa, systematically. Treat every VLM finding as a hypothesis and re-verify with direct DOM computed-style probes on BOTH apps before acting; VLM is a hypothesis generator, DOM probes are the authority.
- **A long-lived dev daemon accumulates stale Turbopack state (S9 discovery; extended S31):** after dozens of HMR edits the dev server entered a Fast Refresh rebuild loop (inputs refused to fill — React never hydrated). Restart the daemon cleanly before capture scripts. **The S31 extension: a daemon restart alone does NOT clear the reload-loop variant** — an unclean kill mid-cache-write leaves the `.next/dev` Turbopack cache stale, the loop SURVIVES a clean restart (verified: health 200 + `/login` 200 while the route reload-looped 17+ navs/15 s), and only `rm -rf .next/dev` + restart clears it. The failure is intermittent and OPAQUE from inside an audit (a 30 s click timeout naming the disabled login button) — run `bun scripts/dev-server-preflight.mjs` first; it diagnoses the class loudly and names the remedy.
- **The dev-server daemon-start recipe (S32, written down at last — re-derived by trial in sessions 59, 62, and 65):** in this environment, processes spawned by a tool call are REAPED when the call's shell exits — a bare `nohup … &` or `nohup setsid … &` dies within a call or two (the intermediate must exit WHILE the tool shell still lives so the daemon reparents to PID 1 before the reaper walks the tree). The working recipe, verbatim, from the repo root: `( setsid bun run dev </dev/null >/dev/null 2>&1 & )` — the subshell backgrounds `setsid bun run dev` and exits immediately; verify with `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health` (~12 s boot) and `bun scripts/dev-server-preflight.mjs` before any suite. To STOP it: find the PID with `ps aux | grep "next dev"` and `kill` it (the AP-70 lesson — by PID, never a blanket pkill while another session's daemon may own the port).
- Greeting buckets are reference-probed: morning 0–11, afternoon 12–16, evening 17–23 — **"Good night" never renders** (faked-clock probe of the live reference; pinned in `tests/router.test.ts`).
- **Adjacent-sibling margins COLLAPSE (S16 lesson):** a `mb-*` on element A plus `mt-*` on its next block sibling compute as max(), not the sum — the S16 verify-screen spacing first measured 68px instead of 76px for exactly this reason. When a measured rhythm decomposes into two sibling margins, put the whole spacing on ONE element (`mb-5 sm:mb-8`) or verify against the box-top the measurement actually reads (padding moves text, not the box top).
- **Mobile-only parity gaps hide behind desktop pins (S16 lesson):** a responsive reference (`h-11 sm:h-12`, `text-xl sm:text-2xl`) and a fixed-value clone measure IDENTICAL at desktop — the drift is only visible at <sm. Audit new surfaces at BOTH viewports; fix with responsive classes so every desktop pin keeps passing byte-identically (that is the whole trick: `sm:` variants preserve ≥sm values by construction).
- **Dark-mode specs toggle the theme via the API, not the UI** (S10 pattern): `page.request.patch("/api/settings/preferences", { data: { themeMode: "dark" } })` (the storageState cookie rides the request context), then `waitForFunction(() => html.classList.contains("dark"))` — and an `afterEach` that PATCHes `light` back and awaits the response, so a failed pin can never poison the shared user record for later spec files (the S4 accent-restore lesson, applied per-hook). See `tests/e2e/dark-mode.spec.ts`.
- `formatTime12h` renders a 2-digit hour ("03:43 AM") — the reference clock format (sidebar + mobile app bar).
- **A leaked `page.route` abort poisons every later `goto` (S11 lesson):** a route that aborts `/api/auth/me` makes the app's auth gate bounce every navigation to `/login` — unroute in a `finally` (the theme-system spec's pre-paint pin does exactly this; the same trap was observed live with agent-browser's persistent network routes).
- **Playwright contexts start with EMPTY localStorage (S11):** the storageState carries cookies only — the theme boot script's `matchMedia` fallback (default `colorScheme` = light) therefore never fights the specs' API-driven mode changes; and the light-regression guards that poll `waitForFunction(!dark)` tolerate the cache-dark → auth-light correction window on load.
- **The avatar emoji grid lives on the Settings APPEARANCE tab (S11):** its buttons are labelled `"Choose avatar <emoji>"` (not the bare emoji) — `getByRole("button", { name: "Choose avatar 🎓" })` is the stable locator; the swatch `transition-all` animates its background mid-read (gate the final value with `waitForFunction` — the S8 lesson re-hit).
- **Playwright `page.pdf()` applies the print stylesheet faithfully only when print emulation is already active (S12):** `page.emulateMedia({ media: "print" })` BEFORE `page.pdf()` models the real Ctrl+P pipeline — without it the layout can keep the screen-width geometry and clip wide content (the timetable rendered at min-w-900 and cut Saturday; with emulation all 8 columns fit). `page.emulateMedia({ media: "print" })` alone does NOT fire `beforeprint`/`afterprint` — dispatch `window.dispatchEvent(new Event("beforeprint"))` to exercise the boot script's print handlers (page.pdf() DOES fire both, measured).
- **Forced-colors e2e pins use `page.emulateMedia({ forcedColors: "active" })` (S12):** computed colors become the forced palette (CanvasText/Canvas/LinkText — `rgb(0,0,159)` links), focus outlines are auto-provided (`1px/2px auto rgba(5,0,73,0.8)`) even over `focus-visible:outline-none`, and SVG strokes SURVIVE (presentation properties are not color-forced). The `NEXTJS-PORTAL` element is a dev-mode-only Tab stop (absent from the production build) — ignore it in focus-order audits against the dev server.
- **A held-open `page.route` poisons later probes in the SAME audit run (S13 lesson):** a route handler that never fulfills keeps the app's `busy` state latched after `unroute` (the request never settles) — reload the page between audit probes that hang routes, or later sends silently no-op (`send()` early-returns on `busy`). The ai-error-audit script does exactly this between its A2 and A3 probes; its first run's "no toast for 500" finding was exactly this artifact.
- **Bun's standalone multipart parser surfaces an empty filename as `undefined` (S13):** the same `new File([bytes], "")` upload that stores `name: ""` under `next dev` (Node undici) CRASHES the route with a 500 under the Bun standalone server (`file.name.slice` on undefined) — runtime-dependent behavior is why upload guards must be tested at BOTH layers (see `tests/e2e/resilience.spec.ts` C2).
- **`getByText` matches a textarea's bounced-back VALUE (S13):** asserting "the message was removed from the transcript" with a page-wide `getByText` also matches the composer holding the rolled-back text — scope removal assertions to `getByRole("listitem").filter({ hasText })` (the transcript items), never the whole page.
- **Unrouting a HELD route lets the pending request proceed to the real server (S14):** a `page.route` handler that never fulfills keeps the request pending — `unroute()` releases it to the destination, so the REAL AI route fires and PERSISTS a reply mid-audit (probe rows in the chat history). Kill the in-flight request FIRST (reload the page — document unload aborts the fetch), THEN unroute. The S13 lesson covered the busy-state latch; this is the network-side twin.
- **`typeof window.onoffline !== "undefined"` is ALWAYS true (S14):** the property exists (null) on every Chromium window — a probe checking `typeof` finds "offline handling" where none exists. Check `window.onoffline !== null` (assigned) or use `useSyncExternalStore`'s subscription as the marker.
- **Radix TabsContent UNMOUNTS inactive panes (S14):** `document.querySelector("#display-name")` on a freshly-loaded Settings page finds nothing — the Profile tab pane is not in the DOM until its tab is clicked (the "hidden panes stay mounted" note applies to kept-alive compositions, not the default). Click the tab before reading pane-scoped DOM.
- **The e2e AI-rate-limit pin poisons its own budget (by design):** the C1 pin exhausts `ai:<demo-user>` (20/15 min) on the :3100 standalone server — verified NO other spec makes a real (non-intercepted) AI request, and the server restarts fresh per run. If a future spec needs real AI calls, it must run BEFORE the s14 file or reset the limiter.

## Conventions

- TypeScript strict; `unknown` over `any`; early returns; no unused imports (lint is a gate).
- Components: `"use client"` at top; views live in `src/components/views/*-view.tsx` and export `<Name>View`.
- Dates: `src/lib/date.ts` (local-time semantics, Monday-first weeks). Icons: lucide-react, `strokeWidth={2}` in chrome.
- Styling: shadcn-style primitives in `src/components/ui/*`; accent colors via `rgb(var(--sf-*))` inline styles or the `text-sf-primary-*`/`bg-sf-primary-*` utilities — never hardcode violet hexes in view code. Brand gradients end at the ADJACENT hue (`--sf-primary-gradient-to`, indigo-600 for violet) and the avatar uses the lighter `--sf-primary-avatar-from/to` pair (violet-400 → indigo-500, measured) — never route them through primary/strong. Primary CTAs use the Button `gradient` variant (`.sf-gradient` classes) — never solid violet. The green/orange accents are the EMERALD/AMBER families (session-5 — the reference's swatch faces). The semantic hue families (status pills, soft pills, alert boxes) ride the `sf-pill-*` / `sf-pill-soft-*` / `sf-alert-*` utilities (S92/AS1) — a new consumer of those families rides the utility (machine-guarded by tests/hue-tokens.test.ts: the quoted-class consumer sweep + the S93/AT1 raw-family negative sweep with the file:line-anchored residual register); only single-site divergent variants stay site-local.
- Errors: API handlers return `{ error }` JSON via `errorResponse()`; client shows `toast.error(err.message)`.
- Commits: Conventional Commits, atomic units. Never commit `.env`, `db/*.db`, `dev.log`, or SSH keys (all gitignored — keep it that way).

## Rebuild session additions (verified contracts)

- `/api/auth/me` answers `{ ok: true, user: {…} }` — unwrap `.user` before `loadFromUser`, or every reload re-defaults the theme to violet/system.
- `mutations` lives at `src/lib/data.ts` as a STANDALONE export — import it; it is not on the store state.
- The `react-hooks/set-state-in-effect` rule is a gate: populate dialog forms via key-remounted components (`key={dialogOpen ? \`open-${id}\` : "closed"}`), derive selections at render, defer reactions to a macrotask, inline initial fetches.
- Never `bun run build` during a `test:e2e` run — the booting webServer serves deleted inodes; the S9 lesson re-verified.
- `formatCalcResult` renders 12 significant digits (`3.28083989501` for m→ft) — converter pins may assert the long form.
- The calculator's `=` REPLACES the expression with the result and the next DIGIT starts fresh (chaining contract pinned by calculator.spec).
