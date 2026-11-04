import { defineConfig } from "vitest/config";
import path from "node:path";

// Unit-test layer for the pure domain seams — 45 files / 1332 tests
// (re-anchored S135/CJ — the audit-driven hardening cycle + the violet
// accent-edge token family: census 1314 → 1332, +18 net [data-import +9:
// the S135/CJ2 IMPORT_ORDER seam-move family (the export pin + the
// manifest set-equality + the parents-first shape) + the S135/CJ4
// required-FK null/non-string trio + the S135/CJ5 parseImportRaceMessage
// trio; script-conventions +3: the S135/CJ2 route-side collection censuses
// (the export findMany count + the buildDataExport literal-key census +
// the import consumption census); theme +2: the S135/CJ3 accent-edge
// family (the per-accent 200-step emission + the violet byte-identity) +
// the S3-J pin's 17 → 18 re-anchor riding the existing leg;
// hue-tokens +2: the treated-light-half consumer census + the re-shaped
// dark-half register's clean-sweep leg; validation +1: the S135/CJ7
// preferencesSchema default-free pin; data-export +1: the S135/CJ7
// user-block Date→ISO pin].)
// (re-anchored S134/CI — the audit-driven hardening cycle + the KDF
// migration: census 1291 → 1314, +23 net [auth +14: the S134/CI1 scrypt
// KDF migration family (the 6-part format round-trip — which is ALSO the
// maxmem regression pin, both runtimes throw at N=2^17 without the
// explicit cap; the legacy 3-part dual-verify; the needsRehash semantics;
// the 6-part fail-closed family; the scryptBurns census — the transition
// equalizer's exactly-one-2^14-and-one-2^17-per-login-attempt invariant
// across the branch matrix, via a vi.hoisted+vi.mock node:crypto wrapper
// around the REAL scryptSync; the burnLoginScryptWork pair; the CI2
// session-expiry pair — the forged-signed-expired-payload pins) — plus the
// three format pins re-anchored in place (the round-trip regex, the
// DUMMY_LOGIN_HASH regex, the malformed legs); script-conventions +3: the
// S134/CI1 route censuses (the login rehash drain + the CG1 exhausted
// branch re-anchored to burnLoginScryptWork + the reset-password mint
// hoisted outside the $transaction); secure-cookie +2: the SESSION_TTL
// lockstep pair (the derivation + the value); view-collections +1: the
// S134/CI7a flashcards pre-warm subjects leg; env-check +4: the S134/CI6c
// overdeclaredProxyHopsWarning family; hue-tokens +2: the S134/CI8
// accent-semantic violet register (the negative sweep + the anchored
// legs)].)
// (prior cycle — re-anchored S133/CH — the audit-driven hardening cycle: census 1251 →
// 1291, +40 net [data-import +29: the S133/CH1 manifest-key family (the
// dead flashcardDecks.* keys renamed to decks.*, the deck-cap behavior
// pin, the five-registry manifest-consistency census) + the S133/CH2
// parity-contract family (five enum vocabularies, the hexColor atoms,
// the four length atoms, the grades 1000 ceiling, the min-1 trim mirror,
// the 64-char key bound) + the S133/CH5 JSON-registry correction (the
// phantom practiceTests.topics dropped, exams.topics added, the
// array-ness census) + the S133/CH6 echo-bound pins + the S133/CH4
// validateImportEnvelope family (the seam twin closed — the drifted
// missing-data pin re-anchored to the route's 400, the version-folding
// pin, the direct seam legs) — the CE7 key census re-anchored in place
// to the 33-key registry, the "unknown field" leg re-anchored in place;
// schema-indexes +1: the S133/CH3 FK-column index census (every relation
// column machine-checked for leftmost index coverage — the ten subjectId
// additions); script-conventions +3: the S133/CH4 caller census (the
// route consumes validateImportEnvelope, no inline twin) + the S133/CH9
// route-file shared-symbol census; api-timeout +3: the S133/CH10
// deadline single-source legs (the identity, the data.ts derivation, the
// page.tsx source); validation +4: the S133/CH8 trim-before-check pins
// + the S133/CH2 exported-vocabulary atoms; the data-store mock widened
// for the DEFAULT_GET_TIMEOUT_MS export (no count change)].
// (prior cycle — re-anchored S132/CG — the audit-driven hardening cycle: census 1236 →
// 1251, +15 net [auth +4: the S132/CG2 peppered OTP digest family
// (deterministic 64-hex, the pepper property, the secret-change
// brute-force-resistance property, the no-collision leg);
// script-conventions +4: the S132/CG1+CG3+CG11 auth-hardening census
// (login's exhausted loginAcct scrypt burn before the uniform 401;
// forgotAcct: per-email budget before the lookup + the honest-429 shape;
// registerGlobal: containment budget before the per-IP key) — the two
// S131/CF7 census legs RE-ANCHORED in place to the hashOtpCode mint/compare
// (no count change); env-check +4: the S132/CG4 parse-seam truth table
// (" 0"/"00"/"-1"/"two" all warn; " 1"/unset silent) + the relocation
// census (env-check hosts parseTrustedProxyHops, auth re-exports) + the
// re-run S120/BU3 behavior pins at the new home; theme-cache +3: the
// S132/CG9 BOOT_TOKEN_SUFFIXES derivation pins (the single source, the
// per-accent deep-equal alignment, the 17-token census)].
// (prior cycle — re-anchored S131/CF — the audit-driven hardening cycle:
// census 1217 → 1236, +19 net [script-conventions +10: the S131/CF1 per-email auth
// budget census (register/resend Acct keys before every DB read/scrypt
// burn, the payload-normalized no-oracle shape) + the S131/CF7 OTP
// digest-at-rest census (the digest mint at both create sites, the
// timingSafeEqual compare, the schema comment) + the S131/CF4+CF5 e2e
// posture + always-cold censuses (the four pinned webServer env vars; the
// cold-reset script chained into test:e2e — the DESIGN CORRECTION leg:
// global-setup must carry NO rm/port-kill, Playwright boots the webServer
// before globalSetup) + the S131/CF6 per-chunk cert-runner truth pair
// (byte-identical CHUNKS + the PIPESTATUS exit); env-check +4: the S131/CF2
// directExposureProdWarning truth table + the instrumentation wiring; site
// +3: the S131/CF10 siteUrl canParse self-heal matrix; auth +2: the
// S131/CF7 OTP digest family behavior pins (deterministic 64-hex, the
// normalize-then-digest pipeline)]. The S130/CE additions beneath:)
// (re-anchored S130/CE — the audit-driven hardening cycle: census 1202 →
// 1217, +15 net [api-timeout net +2: +4 the S130/CE1 default-deadline
// family (the structural live-signal legs + the constants + the
// override-wins discriminator) −2 the "does NOT time out" legs tombstoned
// (their patient-default premise is inverted by design); data-import +7:
// the S130/CE7 length-cap family (the 64-char id atom, the per-field
// registry legs + the key census + the unknown-field 1 M default);
// script-conventions +4: the S130/CE6 write-route budget census + the
// S130/CE5 transactional merge-guard census + the re-tag tripwire pair;
// hue-tokens +2: the S130/CE8 analytics tokenization sweep + the token-
// presence census; schema-indexes +1: the S130/CE9 FileFolder parentId
// index pin; import-row-guard net 0: the 1 M boundary legs corrected to
// an unregistered field (the registry caps tasks.title at 200 now — the
// documented correction the source change demands)]. The S129/CD
// additions beneath:)
// (re-anchored S129/CD — the audit-driven hardening cycle: census 1191 →
// 1202, +11 net [overlay-animation.test.ts the 45th file, +4: the S129/CD1
// tw-animate-css wiring pin + the overlay-class census + the dead-v3-dep
// guard; data-store +2: the S129/CD2 collection-GET deadline at the seam
// boundary (loadCollections + loadAll both hand apiGet the 20 s
// COLLECTION_GET_TIMEOUT_MS); http-body +3: the S129/CD4 BodyTooLargeError
// family + the 413 mapping + the plain-ValidationError 400 hold;
// script-conventions +2: the S129/CD8 api-route dynamic census (every
// route declares force-dynamic or routes through a dynamic-by-construction
// seam — a holds-class pin on the current tree)]. The S128/CC additions
// beneath:)
// (re-anchored S128/CC — the audit-driven hardening cycle: census 1171 →
// 1191, +20 net [toast.test.ts the 43rd file, +3: the S128/CC8 toaster
// identity/cap/auto-dismiss family; schema-indexes.test.ts the 44th, +4:
// the S128/CC10 factory-list composite-index census; api-timeout +3: the
// CC7 apiGet timeoutMs mirror; data-import +3: the CC1 profile-patch
// whitelist; data-store +3: the CC11 loading-flag in-flight counts;
// script-conventions +3: the CC2 cert-runner truth pair; calculator +1:
// the CC13 unary-minus-vs-^ convention lock; date net 0: +1 CC6 NaN-guard
// pin −1 the dead minutesToHHMM leg removed with its export]. The S127/CB
// additions beneath:)
// (re-anchored S125/BZ — the audit-driven hardening cycle: census 1113 →
// 1127, +14 [grade-merge.test.ts the 42nd file, +7: the checkGradeRangeMerge
// effective-pair legs — the single-leg score-over-stored rejection, the
// maxScore-under-stored rejection, the both-legs-inverted rejection (the
// merge owns the both-sent case for grades), the legal single-leg pass, the
// legal both-legs pass, the title-only no-op, the non-numeric stored legacy
// skip; validation +4: the gradeCreateSchema inverted pair, the legal pair,
// the 900/1000 heavy case, the bare-900 defaulted-denominator rejection;
// group-members +3: the removeOneMember one-occurrence seam — exactly one
// identical duplicate removed, the composite (email,name) disambiguation,
// the no-match no-op]).
// (re-anchored S124/BY — the audit-driven hardening cycle: census 1099 →
// 1113, +14. The additions: validation +7 [the S124/BY1 gradeLevel
// clearable union — the "" clear form accepted (RED pre-fix: the
// ZodError), the enum legs, the out-of-vocabulary rejection — and the
// S124/BY9 avatarEmoji vocabulary — a listed emoji accepted, the ""
// clear form legal, unlisted 6/8-code-point strings rejected (RED
// pre-fix: accepted)], db-path +2 [the S124/BY2 production gate — a
// missing absolute target passes through untouched in production (RED
// pre-fix: the silent dev-DB redirect), the dev correction leg
// parameterized], and rum-diagnostics +5 [the S124/BY6 buildTrends seam
// — the day's newest sample wins order-independently, an unsampled day
// is a null GAP never a fabricated 0, the 7-day window shape, the
// route's skip semantics, and the panel's seam-to-seam gap tolerance].
// The S123/BX additions beneath: validation +9 [the S123/BX1 both-legs family —
// the LEGAL unpadded span accepted ("9:00" → "11:00", the seeded shape
// the raw string compare falsely 400'd), the INVERTED padded/unpadded
// mix rejected (the "8:30" > "09:00" lexicographic bypass), the update
// both-legs twin, the malformed-atom coverage leg, the hhmmMinutes
// padded/unpadded/out-of-range family, the normalizeHhmmForInput
// padding legs, and the S123/BX5 exported nullableId atom pins] and
// date +5 [the S123/BX3 datetime-local round-trip helpers — the full-ISO
// from-local contract, the 16-char local wall-clock (never the Z-suffixed
// UTC clock), the TZ-independent round-trip instant preservation (the
// drift-kill property), the sub-minute truncation bound, and the
// empty/malformed legs]. The additions: timetable-merge +14 [the S122/BW7 ordering guard —
// the pure merge seam's single-leg inversions both directions, the legal
// moves, the null/neither-leg skips, the equal-legs legality, the
// UNPADDED legacy seeded hours ("9:00" vs "11:00" — the live-probe catch:
// a raw string compare rejects every legal move on a legacy row), the
// malformed-legacy skip, and the create/update schema checks], ai-helpers
// +15 [the S122/BW12 unit pins for src/lib/server/ai.ts — withDeadline
// (resolve, deadline rejection, the loser's rejection suppression, timer
// cleanup), extractAssistantContent (the shape-walker family), and
// extractJsonBlock (fences, bare JSON, the balanced-block fallback, the
// nulls) + the S122/BW6 capPersistedContent boundary (100_000 exact)],
// data-import +2 [the S122/BW8 derived-map pins — IMPORT_REQUIRED_FKS/
// IMPORT_OPTIONAL_FKS derived from IMPORT_FK_MAP, the drift-hazard close].)
//
// Unit-test layer for the pure domain seams — 39 files / 1054 tests
// (re-anchored S121/BV — the audit-driven hardening cycle: census 1030 →
// 1054. The additions: event-merge +12 [the S121/BV1 single-leg ordering
// merge — the pure seam's endDate-only/startDate-only inversions against
// the stored row, the legal moves, the null clear, the both-legs handoff
// to the update schema, the Date-fixture leg (the stored Prisma row's
// value type — the live-probe catch), the S121/BV10 mixed-offset family
// (Date.parse comparisons, a string-compare-passing inversion)], secure-
// cookie +3 [the S121/BV12 comma-joined x-forwarded-proto family], clear-
// cookie +3 [the S121/BV2 logout-side Secure derivation — the explicit
// flag honored both ways, the optionless NODE_ENV default preserved],
// owned-fks +3 [the S121/BV7 census registry — every FK-bearing delegate
// declares its owned FK targets, the field names match the schema
// vocabulary], auth +1 [the S121/BV9 limiter HARD cap — the all-live
// flood evicts the oldest bucket at cap, the map never exceeds 2048, the
// evicted key re-arms fresh], validation +2 [the S121/BV5 questions blob
// bound at 100k, the boundary exact]. The theme +0 in-place [the S121/
// BV15 17-var accentCssVars re-anchor — the solid --sf-primary-empty
// entry]; the wiring halves (the BV6 re-register password, the BV7
// owned-FK guards, the BV11a concurrent verify pair) ride the e2e layer.)
//
// Unit-test layer for the pure domain seams — 36 files / 1030 tests
// (re-anchored S120/BU — the parity-superset hardening cycle: census 990 →
// 1030. The additions: client-ip +14 [the S120/BU3 declared proxy-hop
// contract — parseTrustedProxyHops unset/0/N with the unparsable FAIL-CLOSED
// leg, clientIpFromForwarded first-hop/Nth-from-right/short-header/forged-
// longer-header], delivery-gate +6 [the S120/BU2 in-band delivery
// off-switches — DISABLE_IN_APP_OTP/RESET, kind isolation, the placeholder-
// empty and unparsable shapes], secure-cookie +6 [the S120/BU15
// secureCookieFlag seam — x-forwarded-proto beats the upstream protocol,
// case/whitespace/empty tolerance], hue-pairs +2 [the S120/BU10/BU11 slate
// text-pair guard — every static text-slate-500/400 site carries its
// dark:text-slate- sibling, the 51+8 site sweep machine-guarded], seed-gate
// +5 [the S120/BU21 SEED_DEMO fail-safe gate — default ON, 0/false/no OFF,
// unrecognized OFF], auth +2 appends [the S120/BU6 limiter bucket eviction —
// the lazy sweep at the 2,048 cap, expired windows die, live windows
// survive, the size observable + drain seam], validation +5 appends [the
// S120/BU22a eventSchema endDate>=startDate ordering refine],
// hue-tokens appends [the S120/BU8 sf-pill-blue family + the blue-100/700
// @theme pins — the reference's measured yellow→blue drift]. The
// route-level halves (the BU1 folder-dialog remount, the BU7 dashboard
// badge family, the BU8 exams-view badge, the BU9 Cancel buttons, the
// BU13 expiry announcement, the BU14 register shape, the BU16 headers, the
// BU4 RUM user-scoping) ride the e2e layer.)
//
// Unit-test layer for the pure domain seams — 31 files / 990 tests
// (re-anchored S119/BT — the audit-rider hardening cycle: census 963 → 990.
// The additions: http-body +9 [the S119/BT2 counting-reader family — the
// chunked-body cap aborts AT the cap without reading past it (the pull-
// count proof), the at-cap boundary, the multi-byte split-codepoint decode
// + the S119/BT1a assertJsonContentType family], import-row-guard +12
// [the S119/BT1b sanitizeImportRow family — the primitive-value contract,
// the 1M field guard, the files rows' javascript:/data: URL rejection, the
// name/data shape rules, the collection+index error naming], data-store +3
// [the S119/BT8 fetchAndSet sequence-guard family — the stale out-of-order
// resolution never clobbers], env-check +3 [the S119/BT5 forgeable-key
// band — <16 chars FATAL in production, the 16-char warn boundary].
// The route-level halves of BT1/BT2/BT3 ride the e2e layer (the s23
// perimeter pins + the auth-flows concurrent replay pair).
//
// Prior cycle (S118/BS — census 944 → 963):
// The additions: auth +3 [the S118/BS1 session-version family — the token
// embeds v, a missing v reads 0 (deploy compat), differing versions sign
// differently], validation +13 [the S118/BS2 bounded-reads family — the
// email atom trims+bounds, jsonArray 100k, requiredDate parses as a date,
// idField 64, mathSolve image 7M — + the S118/BS5 linkFileSchema trim
// family + the S118/BS7 RUM re-anchor family (4 pins carrying the ROUTE's
// enforced bounds: navType free-string, path 500, UA 400, value 6M, events
// 20)], rum-diagnostics +2 [the S118/BS6 CSV formula-neutralization family],
// view-collections +1 [the S118/BS8 settings-holidays pin]. The re-anchors:
// the RUM event/batch pins re-shaped to the enforced bounds (the old pins
// asserted the dead twin) + the theme-cache boot-script pin re-anchored to
// the var-KEY consumption (S118/BS12). The route-level halves of BS1/BS2/
// BS3 ride the e2e layer (the auth-flows reset-revocation + oversized-body
// pins, the mobile-navigation focus-lifecycle pin).
//
// Unit-test layer for the pure domain seams — 28 files / 944 tests
// (re-anchored S117/BR — the hardening cycle: census 936 → 944.
// The additions: auth +5 [the S117/BR3 timing-equalizer family —
// verifyLoginCredentials's matching/miss semantics + the DUMMY_LOGIN_HASH
// scrypt-shape pin that fails the "dummy = malformed string" mutant
// which would silently reinstate the login enumeration oracle — and the
// S117/BR6 hashResetToken family (deterministic 64-hex digest, differs
// from the raw token, differs between tokens)] and validation +3
// [the S117/BR4 linkFileSchema family — http/https accepted,
// javascript:/data:/file:/ftp:/mailto: rejected, the name/folderId
// shape preserved]. The route-level halves of BR1/BR2/BR5 ride the
// e2e layer (the s23 cards round-trip pin + the auth-flows verify-429
// TEST-NET pin); the seam exports BR1 reconnected (IMPORT_MAX_BYTES,
// NEVER_IMPORT_FIELDS, sortFoldersParentsFirst) were already pinned by
// the 30-test data-import family.
//
// Unit-test layer for the pure domain seams — 28 files / 936 tests
// (re-anchored S116/BQ — the rotation program's SECOND PASS's cycle
// four, the LIGHT QUARTET's closing cell: census UNCHANGED at 936.
// The BQ cycle touched documentation + scripts only: the BP1 record's
// dated register note [the post-BP final-tree playwright-class counts
// 247 importers / 128 Usage-line carriers — the two s115 riders
// joined the guarded class after the BP1 measurement; the register
// rotates forward, the threshold-form pins absorb growth by design,
// the exact-count pin stays rejected] and the s116 riders
// [ref-resweep-s116.mjs + capture-s116-evidence.mjs — the
// MOBILE-LANDSCAPE LIGHT evidence-frame rotation, the second pass's
// cycle four: the landscape cell 844×390, the light quartet's LAST
// never-second-passed cell, with the s107 pair both taking their
// FIRST light-side frames — the drawer nav-scroll (the
// landscape-only structural discriminator: the 20-link nav list
// MUST scroll at the 390px viewport height, scrollHeight >
// clientHeight, while the portrait list fits unscrolled; the 288px
// w-72 panel over the light surface, the S3-L brand header, the
// dialog semantics) + the Tasks light (the active-list h1 "All
// Tasks" — the derived value; the md:flex two-pane layout rendered
// AT 844; the red-pill family on the overdue row + the violet
// RepeatPill + slate SubjectChip on the boundary row, NEVER the
// exact date)]. No new pins; src/ and tests/ untouched — the census
// projection exact.)
// Unit-test layer for the pure domain seams — 28 files / 936 tests
// (re-anchored S114/BO — the rotation program's SECOND PASS's cycle
// two: census UNCHANGED at 936. The BO cycle touched documentation +
// scripts only: the BN1 record's dated register note [the post-BN
// final-tree playwright-class counts 243 importers / 124 Usage-line
// carriers — the two s113 riders joined the guarded class after the
// BN1 measurement; the register rotates forward, the threshold-form
// pins absorb growth by design, the exact-count pin stays rejected]
// and the s114 riders [ref-resweep-s114.mjs + capture-s114-evidence.mjs
// — the MOBILE-PORTRAIT LIGHT evidence-frame rotation, the second
// pass's cycle two: the mobile home band 390×844, now the tied-thinnest
// light coverage, with the Dashboard light (the view's FIRST light-side
// frame; the greeting-bucket h1 + the long-date subtitle at the live
// clock's own signature, the sf-overdue-banner Overdue alert, the
// Today's tasks region, the four stat cards, the Upcoming Exams +
// Assignments sections, the fixed glass app bar) + the Notes light (the
// view's FIRST light-side frame; the Notes list pane's four seeded
// rows, the All Notebooks / All Tags comboboxes, the Search notes
// input, the Filter-by-tag button, the sf-gradient create FAB — the
// reference's own /Notes mobile overflow defect NOT reproduced, now on
// the light side too)]. No new pins; src/ and tests/ untouched — the
// census projection exact.)
// Unit-test layer for the pure domain seams — 28 files / 936 tests
// (re-anchored S113/BN — the rotation program's SECOND PASS's opening
// cycle: census UNCHANGED at 936. The BN cycle touched documentation +
// scripts only: the BM1 record's dated register note [the post-BM
// final-tree playwright-class counts 241 importers / 122 Usage-line
// carriers — the two s112 riders joined the guarded class after the BM1
// measurement; the register rotates forward, the threshold-form pins
// absorb growth by design, the exact-count pin stays rejected] and the
// s113 riders [ref-resweep-s113.mjs + capture-s113-evidence.mjs — the
// DESKTOP LIGHT evidence-frame rotation, the second pass's opening
// cycle: the theme axis AND the view-level rotation program both
// completed at s112 [the exhaustion cycle — all four viewport cells ×
// both sides + every nav view carrying at least one rotation frame];
// the second pass re-probes any cell, any view, fresh — the desktop
// light cell [1280×800, its light coverage the thinnest of the four:
// Events + Analytics at s109] with the Flashcards light [the view's
// FIRST light-side frame; the h1, the Deck list pane, the three seeded
// decks, the auto-selected first deck's detail, the Card grid's four
// seeded cards at their raw-textContent difficulty pills] + the
// Timetable light [the view's FIRST light-side frame; the h1 +
// subtitle, the Week filter combobox, the month-label h2 at the live
// clock's own signature, the Week grid's five seeded classes, the My
// Classes panel]. No new pins; src/ and tests/ untouched — the census
// projection exact.)
// Unit-test layer for the pure domain seams — 28 files / 936 tests
// (re-anchored S112/BM — the exhaustion cycle: census UNCHANGED at
// 936. The BM cycle touched documentation + scripts only: the BL1
// record's dated register note [the post-BL final-tree playwright-class
// counts 239 importers / 120 Usage-line carriers — the two s111 riders
// joined the guarded class after the BL1 measurement; the register
// rotates forward, the threshold-form pins absorb growth by design,
// the exact-count pin stays rejected] and the s112 riders
// [ref-resweep-s112.mjs + capture-s112-evidence.mjs — the MID-BAND
// LIGHT evidence-frame rotation, the theme axis's LAST never-varied
// cell, the exhaustion cycle: with these two frames both the theme
// axis (all four viewport cells × both sides) AND the view-level
// rotation program (every nav view carrying at least one rotation
// frame) complete; the rotation program's 24 committed frames cover
// all four viewport cells on dark (1280×800 desktop ×10 + 390×844
// mobile-portrait ×4 + 844×390 mobile-landscape ×2 + 768×1024
// mid-band ×2) plus three light cells (1280×800 desktop ×2, s109;
// 390×844 mobile-portrait ×2, s110; 844×390 mobile-landscape ×2,
// s111); the MathSolver mid-band light [the view's FIRST rotation
// frame; the h1 "Math Solver" + subtitle, the aria-label="Math
// problem" textarea, the Solve button disabled at rest, the "Math
// solution" region's rest copy, the "Recent Problems"
// seed-deterministic empty state] + the AIAssistant mid-band light
// [the view's FIRST rotation frame; the h1 "AI Study Assistant" +
// subtitle, the empty-transcript intro, the aria-label="Quick
// actions" six sf-card prompt buttons, the aria-label="Message the
// assistant" composer — the shadcn Input, an <input> element NOT a
// textarea, the S112 lesson-2 element-tag doctrine — with the Send
// message button disabled at rest]. No new pins; src/ and tests/
// untouched — the census projection exact.)
// Unit-test layer for the pure domain seams — 28 files / 936 tests
// (re-anchored S111/BL — the honest-zero-cycle: census UNCHANGED at
// 936. The BL cycle touched documentation + scripts only: the BK1
// record's dated register note [the post-BK final-tree playwright-class
// counts 237 importers / 118 Usage-line carriers — the two s110 riders
// joined the guarded class after the BK1 measurement; the register
// rotates forward, the threshold-form pins absorb growth by design,
// the exact-count pin stays rejected] and the s111 riders
// [ref-resweep-s111.mjs + capture-s111-evidence.mjs — the
// MOBILE-LANDSCAPE LIGHT evidence-frame rotation, the theme axis's
// never-varied LANDSCAPE cell: the rotation program's 22 committed
// frames cover all four viewport cells on dark (1280×800 desktop ×10
// + 390×844 mobile-portrait ×4 + 844×390 mobile-landscape ×2 +
// 768×1024 mid-band ×2) plus the home band and the mobile band on
// light (1280×800 desktop ×2, s109; 390×844 mobile-portrait ×2,
// s110); the theme axis's remaining never-varied cells —
// mobile-landscape×light, mid-band×light; the Calendar landscape
// light [the view's FIRST rotation frame; the A4/S5-G/S9-F mode
// switch — the Calendar tab aria-pressed=true in the sf-selected-tint
// violet-600 rgb(124, 58, 237), the 7-column weekday header, the
// today cell data-today=true selected by default] + the FocusTimer
// landscape light [the view's FIRST rotation frame; the seeded stats
// 7/7 with the Today card at the 0-or-1 midnight boundary, the
// Pomodoro preset's border-sf-primary violet, the role=timer 25:00
// rest state]]. No new pins; src/ and tests/ untouched — the census
// projection exact.)
// Unit-test layer for the pure domain seams — 28 files / 936 tests
// (re-anchored S110/BK — the honest-zero-cycle: census UNCHANGED at
// 936. The BK cycle touched documentation + scripts only: the BJ1
// record's dated register note [the post-BJ final-tree playwright-class
// counts 235 importers / 116 Usage-line carriers — the two s109 riders
// joined the guarded class after the BJ1 measurement; the register
// rotates forward, the threshold-form pins absorb growth by design,
// the exact-count pin stays rejected] and the s110 riders
// [ref-resweep-s110.mjs + capture-s110-evidence.mjs — the
// MOBILE-PORTRAIT LIGHT evidence-frame rotation, the theme axis's
// never-varied MOBILE cell: the rotation program's 20 committed frames
// cover all four viewport cells on dark + the home band on light
// (1280×800 desktop ×10 dark + ×2 light, s109); the theme axis's
// remaining never-varied cells — mobile-portrait×light,
// mobile-landscape×light, mid-band×light — the S109 lesson-3 axis
// enumeration applied one cell deeper; the Settings mobile light [the
// view's FIRST rotation frame; the Appearance tab's measured chrome —
// the selected Light theme button's violet border rgb(139, 92, 246),
// the 7 accent swatches with Violet aria-pressed — deterministic from
// the seed, zero interaction] + the Files mobile light [the view's
// FIRST rotation frame; the S17-pinned zero-data EmptyState the seed
// produces — the seed creates no folders/files: the "No files yet"
// card with the gradient Upload CTA; the stacked mobile two-pane at
// 390]]. No new pins; src/ and tests/ untouched — the census
// projection exact.)

// Unit-test layer for the pure domain seams — 28 files / 936 tests
// (re-anchored S109/BJ — the honest-zero-cycle: census UNCHANGED at
// 936. The BJ cycle touched documentation + scripts only: the BI1
// record's dated register note [the post-BI final-tree playwright-class
// counts 233 importers / 114 Usage-line carriers — the two s108 riders
// joined the guarded class after the BI1 measurement; the register
// rotates forward, the threshold-form pins absorb growth by design,
// the exact-count pin stays rejected] and the s109 riders
// [ref-resweep-s109.mjs + capture-s109-evidence.mjs — the LIGHT
// evidence-frame rotation, the theme axis's NEVER-VARIED side: the
// rotation program's 18 committed frames covered all four viewport
// cells — 1280×800 desktop + 390×844 mobile-portrait + 844×390
// mobile-landscape + 768×1024 mid-band — and 18/18 are DARK, LIGHT
// NEVER varied; the Events desktop light [the view's FIRST rotation
// frame; the WITHIN-VIEW THEME BOUNDARY = the light-only discriminator:
// the bg-slate-900 terminal panel is intentionally dark in BOTH themes,
// the boundary asserted both sides — the panel computes rgb(15, 23, 42)
// while the page h1 computes the light-side slate-800 rgb(30, 41, 59)] +
// the Analytics desktop light [the view's FIRST rotation frame; the
// light-side WITHIN-ELEMENT reads — the chart axis text at the
// light-only #666 rgb(102, 102, 102), the StatBlock cards at the
// light-only bg-white rgb(255, 255, 255); the seeded stat values
// 2/12 + 0/6 + 4; the stat grid's EXACTLY 4 px tracks at the desktop
// band]]. No new pins; src/ and tests/ untouched — the census
// projection exact.)

// Unit-test layer for the pure domain seams — 28 files / 936 tests
// (re-anchored S108/BI — the honest-zero-cycle: census UNCHANGED at
// 936. The BI cycle touched documentation + scripts only: the BH1
// record's dated register note [the post-BH final-tree playwright-class
// counts 231 importers / 112 Usage-line carriers — the two s107 riders
// joined the guarded class after the BH1 measurement; the register
// rotates forward, the threshold-form pins absorb growth by design,
// the exact-count pin stays rejected] and the s108 riders
// [ref-resweep-s108.mjs + capture-s108-evidence.mjs — the MID-BAND
// evidence-frame rotation, the viewport-band matrix's LAST never-varied
// cell: the rotation program's 16 committed frames covered exactly
// 1280×800 desktop + 390×844 mobile-portrait + 844×390 mobile-landscape,
// and 768×1024 mid-band NEVER varied — the S107 lesson-1's own
// band-matrix enumeration; the PracticeTests view [the view's FIRST
// rotation frame; the 2-COLUMN grid = the MID-BAND-ONLY structural
// discriminator — the computed gridTemplateColumns carries EXACTLY 2
// tracks at 768, never 1 (mobile-portrait) and never 3 (desktop-lg),
// the column-count boundary asserted BOTH sides] + the StudyGroups view
// [the view's FIRST rotation frame; the two-pane flex negotiation at
// full 320px w-80 — the S78/AE13 floor shrinks the aside to ~222px at
// 390; the S8-Z two-variant empty-state boundary asserted on the
// seeded side — ONE group + null selection renders the PLAIN variant,
// the 80px gradient EmptyState renders ONLY at zero groups]]. No new
// pins; src/ and tests/ untouched — the census projection exact.)

// (re-anchored S106/BG — the honest-zero-cycle: census UNCHANGED at
// 936. The BG cycle touched documentation + scripts only: the BF1
// record's dated register note [the post-BF final-tree playwright-class
// counts 227 importers / 108 Usage-line carriers — the two s105 riders
// joined the guarded class after the BF1 measurement; the register
// rotates forward, the threshold-form pins absorb growth by design,
// the exact-count pin stays rejected] and the s106 riders
// [ref-resweep-s106.mjs + capture-s106-evidence.mjs — the MOBILE
// evidence-frame rotation, the SECOND mobile cycle, EXHAUSTING the
// views' mobile-only md:hidden class: the Flashcards in-row Study
// affordance [the neutral-950 family's first rotation-frame subject;
// the seeded 0-card deck renders NO affordance — the boundary-row
// discriminator] + the Notes create FAB [the gradient family's first
// MOBILE evidence frame, the S79/AF6 surface]]. No new pins; src/
// and tests/ untouched by the PLANNED riders — the BG4 reserved rider
// then exercised legitimately: the seam label + the boundary-test note
// carry the co-residency context fix [the standing-suite runner stops
// :3000 for the cwv-volume-stress stage — the pin stays 2400; modified
// NOTES only, the census projection exact].)

// (re-anchored S105/BF — the honest-zero-cycle: census UNCHANGED at
// 936. The BF cycle touched documentation + scripts only: the BE1
// record's dated register note [the post-BE final-tree playwright-class
// counts 225 importers / 106 Usage-line carriers — the two s104 riders
// joined the guarded class after the BE1 measurement; the register
// rotates forward, the threshold-form pins absorb growth by design,
// the exact-count pin stays rejected] and the s105 riders
// [ref-resweep-s105.mjs + capture-s105-evidence.mjs — the MOBILE
// evidence-frame rotation at 390×844 in dark onto the Timetable
// md:hidden day accordion [the sf-chip-dark Today chip — the family's
// first rotation-frame subject; a surface that cannot exist at desktop]
// + the Dashboard mobile [the sf-overdue-banner from the seeded overdue
// task — the family's first mobile evidence frame; the viewport axis
// the program never varied, the S105 lesson-1]. No new pins; src/
// and tests/ untouched.)
// (re-anchored S104/BE — the honest-zero-cycle: census UNCHANGED at
// 936. The BE cycle touched documentation + scripts only: the BD1
// record's dated register note [the post-BD final-tree playwright-class
// counts 223 importers / 104 Usage-line carriers — the two s103 riders
// joined the guarded class after the BD1 measurement; the register
// rotates forward, the threshold-form pins absorb growth by design,
// the exact-count pin stays rejected] and the s104 riders
// [ref-resweep-s104.mjs + capture-s104-evidence.mjs — the
// evidence-frame rotation onto the Timetable dark today-header + the
// MyDay dark progress card, both already e2e-pinned surfaces, both
// rendered from the seed — the structural-family class's first
// rotation frame, the S104 lesson-2 widened map]. No new pins; src/
// and tests/ untouched.)
// (re-anchored S103/BD — the honest-zero-cycle: census UNCHANGED at
// 936. The BD cycle touched documentation + scripts only: the BC1
// record's dated register note [the post-BC final-tree playwright-class
// counts 221 importers / 102 Usage-line carriers — the two s102 riders
// joined the guarded class after the BC1 measurement; the register
// rotates forward, the threshold-form pins absorb growth by design,
// the exact-count pin stays rejected] and the s103 riders
// [ref-resweep-s103.mjs + capture-s103-evidence.mjs — the
// evidence-frame rotation onto the Exams dark urgency pills + the
// Flashcards dark difficulty badges, both already e2e-pinned surfaces,
// both rendered from the seed]. No new pins; src/ and tests/
// untouched.)
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
