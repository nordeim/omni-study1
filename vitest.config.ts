import { defineConfig } from "vitest/config";
import path from "node:path";

// Unit-test layer for the pure domain seams — 26 files / 921 tests
// (re-anchored S93: +5 — the palette-uniqueness pin [matchAll length
// exactly 1 per family step, the duplicate-later-definition mutant
// killed], the raw-family negative sweep + the residual-register
// anchoring [both directions machine-guarded], the files-tile dark-half
// pin + the dashboard-pill consumer pin [the two L2 orphan closures,
// RED-first], and the S51 dedupe-map completeness pin [the AP3
// source-scan precedent]; mutation-proven x3)
// (re-anchored S90: +the AQ1 third-leg pin in theme [the seven
// hand-maintained TOKENS lists must equal the ACCENT_TOKENS literals' OWN
// key insertion order — the exact order the boot script's VALUES generator
// rides; the AP3 pin's blind spot closed: a value-equal key reorder inside
// a literal kept both AP3 assertions green while the pre-paint script
// paired names with wrong values; MUTATION-PROVEN — the violet
// emptyTo/emptyFrom reorder turned EXACTLY the new pin RED with AP3 green,
// and the pin's own first run caught the primaryFg→foreground vocabulary
// exception live];
// re-anchored S89: +the AP3 boot-script sync pin in theme
// [the seven hand-maintained TOKENS lists must equal the accentCssVars key
// order and the Object.values length for every accent — the mechanical
// guard the insertion-order sync contract never had; MUTATION-PROVEN];
// re-anchored S88: +the three AO3 read-symmetry pins in group-members
// [a padded legacy row and a blank-padded legacy member normalize through
// the exported membersFromRow seam — the API GET boundary no longer ships
// legacy padded members verbatim; the s87 audit's Info 1, closed one layer
// deeper]; re-anchored S87: +the two AN4 read-side-trim pins in group-members
// [a padded member name/email returns trimmed through the seam — the
// AM1 write-side symmetry; the s87 audit's I4]; re-anchored S86: +the five AM1 members-boundary pins in validation
// [blank/padded member names and emails — the seam/server trim alignment;
// the s86 audit's L2]; re-anchored S85: +group-members [the S85/AL1 members seam — the API
// ships an ARRAY; the pre-seam JSON.parse-on-array "0 members" + wipe
// defect], +the wouldCreateCycle pins in folder-tree [S85/AL3 — the
// server PATCH guard's walk, unit-pinned; the guard-removal mutant WEDGES
// the runner], +the value-source pins in sent-keys-patch [S85/AL4 — the
// source-substitution mutant failed exactly the two new pins];
// re-anchored S79; S80/AG12 fixed the stale "834" header — AGENTS.md/
// CLAUDE.md/README stay the authoritative count keepers): router, theme,
// theme-cache, date, calculator, auth, validation, db-path,
// site, api-timeout, api-offline, files (content-disposition),
// rum-diagnostics, data-export, data-import, env-check, view-collections,
// dep-audit (the S30 bun-audit parser/classifier seam), dev-preflight
// (the S31 dev-server boot-stability classifier seam), suite-verdict
// (the S32 standing-suite verdict seam — the anti-phantom shape guard —
// extended in S33 with the mobile-sweep classifier pins: the light-mode
// 390×844 drawer-navigation sweep; extended in S34 with the midband-sweep
// classifier pins: the light-mode 768×1024 drawer-navigation sweep at the
// md breakpoint, the 391–1023px band's representative width, with the
// chrome vehicle-contract class; extended in S35 with the landscape-sweep
// classifier pins: the light-mode 844×390 phone-landscape drawer-navigation
// sweep — the HEIGHT axis the standing surface never varied — with the
// per-view heading-clearance key and the drawerNavScrollable short-viewport
// contract class; extended in S36 with the dark-mobile-sweep classifier
// pins: the dark-mode 390×844 drawer-navigation sweep — the MODE axis at
// the mobile viewport the standing surface never varied — with the
// per-view flashbulbs/unreadable detector keys, the drawer dark record,
// and the INDEPENDENT dark-detection counting [a non-empty detector array
// with an empty findings array still reads non-green]; extended in S37
// with the accent-light-sweep classifier pins: the ACCENT axis in LIGHT
// mode — the theme dimension the standing surface never varies in light
// [the accent-dark-sweep varies the accent ONLY in dark; every light pin
// rides the default violet] — with the ALL-ACCENTS guard [a missing
// accent key is a shape-error, never green-by-omission], the per-accent
// applied self-verification, the per-view contrast detector keys
// [unreadable / lowcontrast — the flashbulb class does not apply on the
// light canvas], the drawer record per accent, and the three
// signature-strict non-gap exemptions [the CTA-face, the calendar
// adjacent-month days, and the yellow priority-pill vocabulary];
// extended in S38 with the accent-dark-sweep classifier rebuild pins: the
// accent × dark MOBILE 20-view matrix [the pre-S38 mobile pass swept only
// 6 views — MOBILE_VIEWS — and 14 views had never been rendered in dark ×
// accent at the stacked mobile layout by any standing audit] — with the
// ALL-ACCENTS guard on both surfaces + the applied map, the ALL-VIEWS
// guard [the omission-means-clean recording RETIRED — every view recorded
// explicitly, clean views carry empty detector arrays], the drawer-present
// guard with the drawer-open failure counted as a FINDING, the mode rot
// guard [mode MUST be dark — the INVERSE of accent-light's], the
// mobileViewport 390×844 contract, the per-accent applied
// self-verification, and the mobile scrollWidth overflow class].
// Extended in S50 with the accent-dark-landscape-seed-sweep classifier
// pins: the dark × landscape × SEED sweep for the 13 volume-invariant
// views — the views that render no task/note/event rows had never been
// rendered in dark at 844×390 under any accent (the S46 plan's carried
// note + the S49 plan's own non-gap entry) — with the mode rot guard
// [mode MUST be dark — the light half at seed is the S40 audit's own], the
// 13-view ALL-VIEWS guard, the drawer 20-link census, and the dark detector
// family [flashbulbs always findings; the CTA-face exemption ONLY]. Extended in
// S51 with the cwv-volume-stress classifier pins: the CWV x volume stress —
// the RUM-beacon cross-axis (the beacon's five field metrics under the
// COUNT-verified 300/200/250 profile on the 7 volume-affected views at
// 390x844 under the Lighthouse throttle against the standalone build) —
// with the volume-EXACT + throttle + ALL-VIEWS guards, the LCP <= 4400
// parity anchor (the reference's own seed dashboard measures 4416-4432ms
// under the same preset) / CLS <= 0.1 / FCP <= 1500 / TTFB <= 500 /
// longTaskTotal <= 2400 budget families with boundary-exact pins (re-anchored
// S91/AR1: the documented same-tree band 1821–2288ms made the 2000 pin a coin
// flip — the S51 LCP class; the boundary pin now reads 2400/2401), and the
// INP proxy <= 3000 budget. S92/AS4 added the live-tally dedupe pin (a
// script-side S51-* finding matching a recomputed breach counts once).
// S92/AS1 added tests/hue-tokens.test.ts (+3: the pill/alert palette
// contract, the utility contract, the consumer sweep).
// Browser/E2E coverage lives in tests/e2e/*.spec.ts (Playwright — never
// picked up by this config, which matches *.test.ts only; the standalone
// server is booted by playwright.config.ts's webServer).
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts", "tests/**/*.test.ts"],
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
});
