import { defineConfig } from "vitest/config";
import path from "node:path";

// Unit-test layer for the pure domain seams — 28 files / 936 tests
// (re-anchored S102/BC — the honest-zero-cycle: census UNCHANGED at
// 936. The BC cycle touched documentation + scripts only: the BB1
// record's dated register note [the post-BB final-tree playwright-class
// counts 219 importers / 100 Usage-line carriers — the two s101 riders
// joined the guarded class after the BB1 measurement; the register
// rotates forward, the threshold-form pins absorb growth by design,
// the exact-count pin stays rejected] and the s102 riders
// [ref-resweep-s102.mjs + capture-s102-evidence.mjs — the
// evidence-frame rotation onto the GradeTracker dark score pills + the
// Assignments dark soft pills, both already e2e-pinned surfaces]. No
// new pins. The BC4 rider (found by the final re-cert): the S12-B
// skip-link test's hydration gate strengthened IN-PLACE to the
// status-gated data-app-hydrated marker — ONE test file touched, the
// census UNCHANGED, the count projection exact.)
// (re-anchored S101/BB — the honest-zero-cycle: census UNCHANGED at
// 936. The BB cycle touched documentation + scripts only: the BA1
// record's dated register note [the post-BA final-tree playwright-class
// counts 217 importers / 98 Usage-line carriers — the two s100 riders
// joined the guarded class after the BA1 measurement; the register
// rotates forward, the threshold-form pins absorb growth by design,
// the exact-count pin stays rejected] and the s101 riders
// [ref-resweep-s101.mjs + capture-s101-evidence.mjs — the
// evidence-frame rotation onto the Login check-email alert + the
// /export import-success alert, both already e2e-pinned surfaces]. No
// new pins; src/ untouched.)
// (re-anchored S100/BA — the honest-zero-cycle: census UNCHANGED at
// 936. The BA cycle touched documentation + scripts only: the AZ2
// record's dated register note [the final-tree playwright-class counts
// 215 importers / 96 Usage-line carriers — the two s99 riders joined
// the guarded class after the 213/94 widening measurement; the
// threshold-form pins absorb growth by design, an exact-count pin
// explicitly rejected as contradicting the silent-absorption intent]
// and the s100 riders [ref-resweep-s100.mjs + capture-s100-evidence.mjs
// — the evidence-frame rotation onto the Calculator dark AC key + the
// Events dialog error banner, both already e2e-pinned surfaces]. No
// new pins; src/ untouched.)
// (re-anchored S99: +2 — the AZ riders: the AZ1 normalization pin in
// hue-tokens [the inline-comment plant shape normalizes under the AY3
// strip to a conventional duplicate — the shape-true mutation matrix
// machine-checked: the variant-shape plant AND the inline-comment plant
// both trip the dupe check, the wildcard form trips the reconciliation
// pin, a prose comment trips NOTHING; the strip-disabled mutation fails
// BOTH comment-immunity pins] and the AZ2 playwright-class census
// widening in script-conventions [the AY1 convention pin's class widened
// IN-PLACE from the two-lineage proxy to every playwright-importing
// script — 213 importers, 94 Usage-line carriers; the blind spot
// demonstrated live on a planted z-probe-s70.mjs bun line that left the
// lineage-scoped pin GREEN, the widened pin catching it, restored green;
// the new sanity leg proves the playwright-class census ran])
// (re-anchored S98: +3 — the AY riders: the NEW
// tests/script-conventions.test.ts (+2: the re-tag script-class
// runner-convention census [every Usage line in the capture/resweep
// lineages documents the node runner — the ten stale bun lines
// swept, the class self-guarding] + its class-census sanity leg)
// and the AY3 census comment-immunity in hue-tokens (+1: the strip
// helper's discrimination pin; both census counts re-anchored
// IN-PLACE onto the comment-stripped CSS — a prose @utility mention
// can no longer inflate the token census into a loud false failure;
// the three-plant mutation matrix: the variant-shape plant trips
// exactly the widened dupe check, the unparseable-form plant trips
// exactly the reconciliation pin, the comment plant trips NOTHING)
// (re-anchored S97: +1 — the AX1 @utility census hardening in hue-tokens:
// the AW1 completeness pin's header regex widened IN-PLACE to every header
// shape + hoisted to its own describe, and the NEW token-reconciliation
// pin [the @utility token count must equal the matched-header count — an
// unparseable header form fails LOUDLY, never silently out of the census];
// the shape-variant blind spot demonstrated live (a planted
// `@utility sf-pill-red{` left all 930 green), the two-plant mutation
// matrix proving each pin's OWN discriminator: the variant-shape plant
// trips exactly the widened dupe check, the unparseable-form plant trips
// exactly the reconciliation pin)
// (re-anchored S96: +7 — the AW1 @utility-block uniqueness pin in
// hue-tokens [the completeness form: EVERY @utility header in globals.css
// exactly once — the duplicate-later-block blind spot demonstrated live
// (a planted later sf-pill-red block with orange content left all 923
// green), mutation-proven (the plant tripped EXACTLY the new pin with the
// leg-2 contract pins green — they read the first occurrence, which is
// the point)] + the AW2 resweep-gate seam tests/resweep-gate.test.ts
// [+6 legs: 0 ONLY on ok AND probeCleanup "ok" — the pure seam the s96
// resweep re-tag imports; RED-first, mutation-proven at the seam, live
// wiring-proofed (planted in-try throw → exit 1 observed, green → 0)] —
// the plan projected +1/+1, the reality +1/+6, owned in the execution
// record per the AT precedent)
// (re-anchored S95: census UNCHANGED — the AV1 uniqueness-guard completion
// modifies the S93/AT2 pin IN-PLACE [the AR1 boundary-pin precedent]: the
// duplicate-later-definition guard's loop now covers the union of every
// first-occurrence-read record — FAMILY_STEPS + AU_STEPS — after the s94
// audit's L1 found the amber-200/800 steps outside the guard's kill set;
// the blind spot demonstrated live [a planted later duplicate left all
// 923 green], mutation-proven [the plant then tripped EXACTLY the extended
// pin with the leg-5 palette pin green — it reads the first occurrence])
// — the S94 +2 beneath:
// (re-anchored S94: +2 — the AU1 leg-5 pair in hue-tokens [the connectivity
// banner's amber-200/amber-800 @theme pins — the LAST unpinned steps of
// the amber family, the trap-10 drift liability the S14 offline banner
// rode; and the sf-connectivity-pill utility contract + the banner
// consumer — the residual register's first TREATED entry, the register
// updated in the same change]) — the S93 +5 beneath:
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
