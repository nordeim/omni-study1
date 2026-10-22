// ---------------------------------------------------------------------------
// The S32 standing-suite verdict seam, extended through S51. The nightly
// production-readiness sweep runs ~30 audit scripts, each printing one JSON
// envelope; this seam (1) parses the stdout with its known prefix noise,
// (2) classifies every envelope against ITS audit's exact shape, and (3)
// folds the stage verdicts into one suite verdict.
//
// The doctrine under test (AP-77, the S28 lesson encoded): a missing key on
// a known audit shape is a LOUD shape-error — NEVER a silent green, NEVER a
// silent zero. That guard is the difference between a tool and a trap.
//
// Pure functions with explicit args — never spawns an audit itself (the
// orchestrator script owns that), so every shape guard, precedence rule,
// exemption signature, and budget boundary is unit-pinnable
// (tests/suite-verdict.test.ts).
// ---------------------------------------------------------------------------

export interface StageVerdict {
  green: boolean;
  findings: number;
  note: string;
}

export interface SuiteStage {
  name: string;
  verdict: StageVerdict;
}

export interface SuiteOutcome {
  green: boolean;
  failed: string[];
  summary: string;
}

export type ParsedAudit =
  | { ok: true; json: unknown }
  | { ok: false; error: string };

// ---- narrowing helpers (unknown over any, per AGENTS.md) ----------------------

type Rec = Record<string, unknown>;

const isRec = (v: unknown): v is Rec =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const isArr = (v: unknown): v is unknown[] => Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === "string";
const isNum = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v);
const isBool = (v: unknown): v is boolean => typeof v === "boolean";

/** Every shape-error carries this exact marker — the aggregate surfaces it. */
const SHAPE_MARKER = "shape not recognized";

const shapeErr = (detail: string): StageVerdict => ({
  green: false,
  findings: 0,
  note: `${SHAPE_MARKER} — ${detail}`,
});

// ---- parseAuditStdout ---------------------------------------------------------

/**
 * Parse an audit's stdout into its JSON envelope. Audit scripts print known
 * prefix noise before the envelope ("MODE: dark", "[cleanup] …", per-scenario
 * progress lines) — drop everything before the first line that opens the JSON
 * object. A crashed audit's stack trace parses to a LOUD error: a crashed
 * audit is never green.
 */
export function parseAuditStdout(stdout: string): ParsedAudit {
  const trimmed = stdout.trim();
  try {
    return { ok: true, json: JSON.parse(trimmed) };
  } catch {
    // fall through to prefix stripping
  }
  const lines = trimmed.split("\n");
  const start = lines.findIndex((l) => l.trimStart().startsWith("{"));
  if (start === -1) {
    return {
      ok: false,
      error: `parse error: no JSON envelope found in the audit output — a crashed audit is never green`,
    };
  }
  // S81/AH7: tolerate trailing prose AFTER a complete envelope — shrink
  // from the END until the joined slice parses (the preflight's human
  // GREEN line followed the JSON on stdout and the slice-to-end parse
  // failed, aborting the orchestrator at stage 0). A TRUNCATED envelope
  // still fails LOUD on every shrink step (the anti-phantom guard is
  // preserved — a crashed audit is never green).
  // S82/AI3: the loop bound is `end > start` — the S81 form
  // (`end > start + 1`) never tested the SINGLE-LINE slice, so a
  // compact one-line envelope followed by prose still failed LOUD (the
  // same AH7 failure class, latent only because the preflight prints
  // multi-line envelopes).
  // S83/AJ3: FIRST-envelope-wins — the first iteration (end =
  // lines.length) tests the slice-to-end, and each shrink step tests a
  // shorter suffix of it, so the first COMPLETE slice from the start
  // line wins (NDJSON-ish output returns its first envelope; pinned in
  // suite-verdict.test.ts). The old post-loop `try` (slice(start)) was
  // byte-identical to the loop's FIRST iteration and could never
  // succeed after the loop failed — dead code, removed.
  for (let end = lines.length; end > start; end--) {
    try {
      return { ok: true, json: JSON.parse(lines.slice(start, end).join("\n")) };
    } catch {
      // keep shrinking
    }
  }
  return {
    ok: false,
    error: `parse error: the audit output is not valid JSON (no complete envelope on any slice from the first "{" line)`,
  };
}

// ---- the signature-strict non-gap exemptions (the S11 families) -----------------

const CTA_WHITE = "rgb(255, 255, 255)";
const SLATE_300 = "rgb(203, 213, 225)";
const YELLOW_500 = "rgb(234, 179, 8)";
const PILL_VOCABULARY: ReadonlySet<string> = new Set(["high", "medium", "low"]);

interface UnreadableTally {
  ctaFace: number;
  calendarDay: number;
  yellowPill: number;
  findings: number;
}

const emptyTally = (): UnreadableTally => ({
  ctaFace: 0,
  calendarDay: 0,
  yellowPill: 0,
  findings: 0,
});

/**
 * Split an unreadable detector array into the signature-strict non-gap
 * exemptions and the genuine findings. In LIGHT mode three documented
 * families ride the note (S6/S8/S11 reference-measured): white-on-accent is
 * the CTA face itself, slate-300 1–2-digit day numbers are the calendar's
 * adjacent-month days, yellow-500 high/medium/low is the priority-pill
 * vocabulary. In DARK mode those surfaces re-theme, so ONLY the CTA-face
 * exemption survives — any other unreadable hit is genuine.
 */
function tallyUnreadable(entries: unknown[], dark: boolean): UnreadableTally {
  const tally = emptyTally();
  for (const entry of entries) {
    const color = isRec(entry) && isStr(entry.color) ? entry.color : null;
    const text = isRec(entry) && isStr(entry.text) ? entry.text : null;
    if (color === CTA_WHITE) {
      tally.ctaFace += 1;
    } else if (
      !dark &&
      color === SLATE_300 &&
      text !== null &&
      /^\d{1,2}$/.test(text)
    ) {
      tally.calendarDay += 1;
    } else if (
      !dark &&
      color === YELLOW_500 &&
      text !== null &&
      PILL_VOCABULARY.has(text)
    ) {
      tally.yellowPill += 1;
    } else {
      tally.findings += 1;
    }
  }
  return tally;
}

const mergeTally = (into: UnreadableTally, from: UnreadableTally): void => {
  into.ctaFace += from.ctaFace;
  into.calendarDay += from.calendarDay;
  into.yellowPill += from.yellowPill;
  into.findings += from.findings;
};

/** The exemption counts ride the note as counts, never the findings. */
function exemptionFragment(t: UnreadableTally): string {
  return `${t.ctaFace} CTA-face exempt; ${t.calendarDay} calendar adjacent-day exempt (${t.calendarDay} calendar-day signatures); ${t.yellowPill} yellow-pill exempt`;
}

// ---- the S32 findings-array family ----------------------------------------------

const FINDINGS_ARRAY_AUDITS = [
  "security",
  "settings-roundtrip",
  "connectivity",
  "upload-edge",
  "data-volume",
  "ai-error",
  "ai-a11y",
] as const;

function classifyFindingsArray(env: unknown): StageVerdict {
  if (!isRec(env)) return shapeErr("envelope is not an object");
  // The exact manual-parse trap of session-65: the findings key ABSENT reads
  // shape-error, never a silent green.
  if (!isArr(env.findings)) {
    return shapeErr(
      "findings key missing or not an Array — a findings-array audit without its findings key is the manual-parse trap",
    );
  }
  const findings = env.findings.length;
  const nonGaps = isArr(env.nonGaps) ? env.nonGaps.length : 0;
  const notes = [`${findings} findings; ${nonGaps} nonGaps`];
  const limiterHit = env.findings.some(
    (f) => isRec(f) && isStr(f.surface) && /limiter/i.test(f.surface),
  );
  if (limiterHit) {
    // The session-65 run-2 differential: a clean-window re-run that
    // reproduces the limiter shape is a genuine defect; a pre-spent budget
    // is an artifact of manual runs inside the same window.
    notes.push(
      "pre-spent-budget differential: if the AI limiter budget was pre-spent by manual audit runs inside the window (cutoffAt below 20 with 429s), restart the dev server for a clean window and re-run — the suite must be the window's ONLY consumer; a clean-window re-run that reproduces the shape is a genuine limiter defect",
    );
  }
  return { green: findings === 0, findings, note: notes.join("; ") };
}

// ---- forced-colors ----------------------------------------------------------------

function classifyForcedColors(env: unknown): StageVerdict {
  if (!isRec(env)) return shapeErr("envelope is not an object");
  const clone = env.clone;
  if (!isRec(clone)) return shapeErr("clone record missing (forced-colors)");
  if (!isRec(clone.views)) {
    return shapeErr("clone.views missing (forced-colors)");
  }
  let invisible = 0;
  let unbounded = 0;
  let srOnly = 0;
  for (const [view, vr] of Object.entries(clone.views)) {
    if (!isRec(vr)) return shapeErr(`clone.views.${view} is not a record`);
    if (!isArr(vr.invisible)) {
      return shapeErr(`clone.views.${view}.invisible missing or not an Array`);
    }
    if (!isArr(vr.unbounded)) {
      return shapeErr(`clone.views.${view}.unbounded missing or not an Array`);
    }
    invisible += vr.invisible.length;
    for (const u of vr.unbounded) {
      const cls = isRec(u) && isStr(u.cls) ? u.cls : "";
      // sr-only unbounded controls are the DESIGNED a11y pattern (the
      // Events date input) — excluded from findings, counted in the note.
      if (/\bsr-only\b/.test(cls)) srOnly += 1;
      else unbounded += 1;
    }
  }
  const findings = invisible + unbounded;
  return {
    green: findings === 0,
    findings,
    note: `${findings} finding(s): ${invisible} invisible text, ${unbounded} unbounded control(s); ${srOnly} sr-only exempt (the designed visually-hidden pattern)`,
  };
}

// ---- print ---------------------------------------------------------------------------

function classifyPrint(env: unknown): StageVerdict {
  if (!isRec(env)) return shapeErr("envelope is not an object");
  if (!isRec(env.lightPrint) || !isRec(env.darkPrint)) {
    return shapeErr("lightPrint/darkPrint maps missing (print)");
  }
  let total = 0;
  for (const map of [env.lightPrint, env.darkPrint]) {
    for (const [view, count] of Object.entries(map)) {
      // A mistyped count must never read as a silent zero (AP-77).
      if (!isNum(count)) {
        return shapeErr(`print map ${view} count is not a number`);
      }
      total += count;
    }
  }
  const overflowBits: string[] = [];
  if (isRec(env.overflow)) {
    for (const [view, rec] of Object.entries(env.overflow)) {
      if (!isRec(rec)) continue;
      const rights = isArr(rec.overflowRight) ? rec.overflowRight.length : 0;
      if (rights > 0) {
        overflowBits.push(
          `${view} ${rights} right-overflow element(s) (bodyScrollW ${isNum(rec.bodyScrollW) ? rec.bodyScrollW : "?"})`,
        );
      }
    }
  }
  return {
    green: total === 0,
    findings: total,
    note: `${total} light-in-print text run(s) (light+dark); overflow: ${overflowBits.length > 0 ? overflowBits.join("; ") : "none measured"}`,
  };
}

// ---- focus-order ------------------------------------------------------------------------

function classifyFocusOrder(env: unknown): StageVerdict {
  if (!isRec(env)) return shapeErr("envelope is not an object");
  if (!isRec(env.views)) return shapeErr("views map missing (focus-order)");
  let findings = 0;
  let portal = 0;
  for (const [view, vr] of Object.entries(env.views)) {
    if (!isRec(vr)) return shapeErr(`views.${view} is not a record (focus-order)`);
    if (!isArr(vr.anomalies)) {
      return shapeErr(`views.${view}.anomalies missing or not an Array`);
    }
    for (const a of vr.anomalies) {
      const tag = isRec(a) && isStr(a.tag) ? a.tag : "";
      // NEXTJS-PORTAL anomalies are the dev-tools portal injected by the dev
      // server (dev-mode only, absent from the standalone build) — excluded
      // from findings, counted in the note.
      if (tag === "NEXTJS-PORTAL") portal += 1;
      else findings += 1;
    }
  }
  if (isRec(env.drawer)) {
    if (env.drawer.trap === false) findings += 1;
    if (env.drawer.escapeClosed === false) findings += 1;
  }
  if (isRec(env.skipLink) && env.skipLink.present === false) findings += 1;
  return {
    green: findings === 0,
    findings,
    note: `${findings} focus anomaly finding(s); ${portal} dev-portal artifact(s) excluded (NEXTJS-PORTAL is dev-mode only)`,
  };
}

// ---- dark-sweep ---------------------------------------------------------------------------

function classifyDarkSweep(env: unknown): StageVerdict {
  if (!isRec(env)) return shapeErr("envelope is not an object");
  if (!isStr(env.mode)) return shapeErr("mode key missing or not a string (dark-sweep)");
  if (!isRec(env.views)) return shapeErr("views map missing (dark-sweep)");
  let hits = 0;
  for (const [view, vr] of Object.entries(env.views)) {
    if (!isRec(vr)) return shapeErr(`views.${view} is not a record (dark-sweep)`);
    if (!isArr(vr.flashbulbs) || !isArr(vr.unreadable)) {
      return shapeErr(
        `views.${view} missing the flashbulbs/unreadable detector arrays`,
      );
    }
    hits += vr.flashbulbs.length + vr.unreadable.length;
  }
  if (env.mode !== "dark") {
    return {
      green: false,
      findings: 0,
      note: `mode=${env.mode} — the sweep ran in the wrong mode (S27 rot: dark-sweep owns the dark canvas)`,
    };
  }
  return {
    green: hits === 0,
    findings: hits,
    note: `${hits} dark finding(s) (flashbulbs + unreadable) across ${Object.keys(env.views).length} views; mode=${env.mode}`,
  };
}

// ---- cwv (the S32 seed audit) ---------------------------------------------------------------

const CWV_RATINGS: ReadonlySet<string> = new Set(["GOOD", "NI", "POOR", "BAD"]);

function classifyCwv(env: unknown): StageVerdict {
  if (!isRec(env)) return shapeErr("envelope is not an object");
  if (!isRec(env.verdicts)) return shapeErr("verdicts map missing (cwv)");
  let cloneBad = 0;
  let refPoor = 0;
  for (const [scenario, v] of Object.entries(env.verdicts)) {
    if (!isRec(v)) return shapeErr(`verdicts.${scenario} is not a record`);
    for (const metric of ["lcp", "cls"] as const) {
      const rating = v[metric];
      if (!isStr(rating) || !CWV_RATINGS.has(rating)) {
        return shapeErr(
          `verdicts.${scenario}.${metric} rating outside GOOD/NI/POOR/BAD`,
        );
      }
    }
    const bad = (m: "lcp" | "cls"): boolean => v[m] === "POOR" || v[m] === "BAD";
    if (scenario.startsWith("clone")) {
      // A clone POOR/BAD is a real finding; the reference's own POOR LCP is
      // informational — its performance is not a clone finding.
      if (bad("lcp") || bad("cls")) cloneBad += 1;
    } else if (bad("lcp") || bad("cls")) {
      refPoor += 1;
    }
  }
  return {
    green: cloneBad === 0,
    findings: cloneBad,
    note: `${cloneBad} clone metric finding(s); ref POOR informational (the reference's own performance is not a clone finding); ${refPoor} ref scenario(s) POOR/BAD`,
  };
}

// ---- verdict-string audits (pre15 / dep-audit / dev-server-preflight) -----------

function classifyPre15Preflight(env: unknown): StageVerdict {
  if (!isRec(env)) return shapeErr("envelope is not an object");
  if (!isStr(env.verdict)) return shapeErr("verdict key missing (pre15-preflight)");
  const outdated = isNum(env.outdatedCount) ? env.outdatedCount : "?";
  return {
    green: env.verdict.startsWith("GREEN"),
    findings: 0,
    note: `${env.verdict}; outdatedCount ${outdated}`,
  };
}

function classifyDepAudit(env: unknown): StageVerdict {
  if (!isRec(env)) return shapeErr("envelope is not an object");
  if (!isStr(env.verdict)) return shapeErr("verdict key missing (dep-audit)");
  const advisories = isArr(env.advisories) ? env.advisories.length : 0;
  return {
    green: env.verdict.startsWith("GREEN"),
    findings: 0,
    note: `${env.verdict}; ${advisories} advisories`,
  };
}

function classifyDevServerPreflight(env: unknown): StageVerdict {
  if (!isRec(env)) return shapeErr("envelope is not an object");
  if (!isStr(env.verdict)) {
    return shapeErr("verdict key missing (dev-server-preflight)");
  }
  if (env.verdict === "green") {
    return {
      green: true,
      findings: 0,
      note: `green; navigations ${isNum(env.navigations) ? env.navigations : "?"}; hydrated ${isBool(env.hydrated) ? env.hydrated : "?"}`,
    };
  }
  // The remedy IS the note — the preflight's diagnosis must survive the fold.
  const remedy = isStr(env.remedy) ? env.remedy : "no remedy recorded";
  return {
    green: false,
    findings: 0,
    note: `${env.verdict}; remedy: ${remedy}`,
  };
}

// ---- the flat drawer-navigation sweeps (S33-S36) ---------------------------------

interface FlatSweepConfig {
  expectMode: "light" | "dark";
  width: number;
  height: number;
  requireChrome: boolean;
  requireScrollable: boolean;
  requireClearance: boolean;
  /** S36: the dark detector keys are required AND counted independently. */
  darkDetectors: boolean;
}

const FLAT_SWEEP_CONFIGS: Record<string, FlatSweepConfig> = {
  "mobile-sweep": {
    expectMode: "light",
    width: 390,
    height: 844,
    requireChrome: false,
    requireScrollable: false,
    requireClearance: false,
    darkDetectors: false,
  },
  "midband-sweep": {
    expectMode: "light",
    width: 768,
    height: 1024,
    requireChrome: true,
    requireScrollable: false,
    requireClearance: false,
    darkDetectors: false,
  },
  "landscape-sweep": {
    expectMode: "light",
    width: 844,
    height: 390,
    requireChrome: true,
    requireScrollable: true,
    requireClearance: true,
    darkDetectors: false,
  },
  "dark-mobile-sweep": {
    expectMode: "dark",
    width: 390,
    height: 844,
    requireChrome: true,
    requireScrollable: false,
    requireClearance: false,
    darkDetectors: true,
  },
};

function classifyFlatSweep(audit: string, env: unknown): StageVerdict {
  const cfg = FLAT_SWEEP_CONFIGS[audit];
  if (!isRec(env)) return shapeErr("envelope is not an object");
  if (!isArr(env.findings)) {
    return shapeErr(
      "findings key missing or not an Array (the anti-phantom guard)",
    );
  }
  if (!isStr(env.mode)) return shapeErr("mode key missing or not a string");
  if (
    !isRec(env.viewport) ||
    env.viewport.width !== cfg.width ||
    env.viewport.height !== cfg.height
  ) {
    return shapeErr(
      `viewport ${isRec(env.viewport) ? `${env.viewport.width}×${env.viewport.height}` : "?"} ≠ the ${cfg.width}×${cfg.height} contract — the finding classes are viewport-dependent, never a silent re-scope`,
    );
  }
  if (!isRec(env.drawer)) return shapeErr("drawer record missing (flat sweep)");
  if (cfg.requireChrome) {
    if (!isRec(env.chrome)) {
      return shapeErr("chrome record missing — the vehicle contract rides the envelope");
    }
    if (!isBool(env.chrome.sidebarVisible) || !isBool(env.chrome.hamburgerVisible)) {
      return shapeErr("chrome record missing/non-boolean sidebarVisible|hamburgerVisible");
    }
    if (cfg.requireScrollable && !isBool(env.chrome.drawerNavScrollable)) {
      return shapeErr("chrome record missing/non-boolean drawerNavScrollable");
    }
  }
  if (cfg.darkDetectors) {
    const dark = env.drawer.dark;
    if (!isRec(dark)) {
      return shapeErr("drawer record missing its dark rendering record");
    }
    if (!isNum(dark.flashbulbs) || !isNum(dark.unreadable)) {
      return shapeErr("drawer.dark missing numeric flashbulbs/unreadable counts");
    }
  }
  if (!isRec(env.views)) return shapeErr("views map missing (flat sweep)");
  const viewNames = Object.keys(env.views);
  for (const view of viewNames) {
    const vr = env.views[view];
    if (!isRec(vr)) return shapeErr(`views.${view} is not a record`);
    if (!isNum(vr.scrollWidth)) {
      return shapeErr(
        `view record ${view} missing numeric scrollWidth (the measurement IS the guarantee)`,
      );
    }
    if (!isBool(vr.drawerClosed)) {
      return shapeErr(`view record ${view} missing/non-boolean drawerClosed`);
    }
    if (cfg.requireClearance && !isBool(vr.headingClearance)) {
      return shapeErr(
        `view record ${view} missing/non-boolean headingClearance (this audit's per-view key)`,
      );
    }
    if (cfg.darkDetectors) {
      if (!isArr(vr.flashbulbs)) {
        return shapeErr(
          `view record ${view} missing the flashbulbs detector array (the dark detector keys are this audit's per-view contract)`,
        );
      }
      if (!isArr(vr.unreadable)) {
        return shapeErr(
          `view record ${view} missing the unreadable detector array`,
        );
      }
    }
  }
  if (env.mode !== cfg.expectMode) {
    return {
      green: false,
      findings: env.findings.length,
      note: `mode=${env.mode} — the sweep ran in the wrong mode (S27 rot: ${audit} owns MODE ${cfg.expectMode})`,
    };
  }

  // Counting. The probe pushes its own findings entries (overflow,
  // drawer-stuck, link-count…); the dark sweep ALSO counts its detector
  // arrays independently — a probe that forgets to push a detector hit
  // still fails.
  let findings = env.findings.length;
  const notes: string[] = [];
  const chrome = isRec(env.chrome) ? env.chrome : null;
  if (chrome) {
    if (chrome.sidebarVisible === true) {
      findings += 1;
      notes.push(
        "vehicle contract broken: sidebar visible below lg (lg contract — the drawer is the only vehicle below 1024)",
      );
    }
    if (chrome.hamburgerVisible === false) {
      findings += 1;
      notes.push(
        "vehicle contract broken: hamburger hidden below lg (lg contract — the app bar's hamburger is the vehicle's handle)",
      );
    }
    if (cfg.requireScrollable && chrome.drawerNavScrollable === false) {
      findings += 1;
      notes.push(
        "short-viewport contract broken: drawerNavScrollable=false — the nav geometry cannot fit the 20 nav rows; the nav's scroll is the only path to the below-fold links",
      );
    }
  }
  let darkHits = 0;
  if (cfg.darkDetectors) {
    for (const view of viewNames) {
      const vr = env.views[view] as Rec;
      darkHits += (vr.flashbulbs as unknown[]).length + (vr.unreadable as unknown[]).length;
    }
    const dark = env.drawer.dark as Rec;
    darkHits += (dark.flashbulbs as number) + (dark.unreadable as number);
    if (darkHits > 0) findings += darkHits;
  }
  const viewBit =
    audit === "dark-mobile-sweep"
      ? `${viewNames.length} views swept in dark at ${cfg.width}×${cfg.height}`
      : `${viewNames.length} views swept through the drawer at ${cfg.width}×${cfg.height}`;
  const noteBits = [
    viewBit,
    `${findings} findings`,
    `MODE ${env.mode}`,
    `drawer linkCount ${isNum(env.drawer.linkCount) ? env.drawer.linkCount : "?"}`,
  ];
  if (darkHits > 0) {
    noteBits.push(
      `dark detection: ${darkHits} light-surface hit(s) counted independently of the findings array`,
    );
  }
  if (notes.length > 0) noteBits.push(...notes);
  return { green: findings === 0, findings, note: noteBits.join("; ") };
}

// ---- accent-light-sweep (S37) -------------------------------------------------------

const ACCENTS = ["violet", "blue", "green", "orange", "pink", "red", "teal"] as const;

function classifyAccentLightSweep(env: unknown): StageVerdict {
  if (!isRec(env)) return shapeErr("envelope is not an object");
  if (!isArr(env.findings)) {
    return shapeErr("findings key missing or not an Array (the anti-phantom guard)");
  }
  if (!isStr(env.mode)) return shapeErr("mode key missing or not a string");
  if (
    !isRec(env.viewport) ||
    env.viewport.width !== 390 ||
    env.viewport.height !== 844
  ) {
    return shapeErr(
      "viewport ≠ the 390×844 mobile contract — the accent-light finding classes are mobile-width-dependent",
    );
  }
  if (!isRec(env.chrome)) return shapeErr("chrome record missing (accent-light-sweep)");
  if (!isBool(env.chrome.sidebarVisible) || !isBool(env.chrome.hamburgerVisible)) {
    return shapeErr("chrome record missing/non-boolean sidebarVisible|hamburgerVisible");
  }
  if (!isRec(env.accents)) {
    return shapeErr("accents map missing — the ALL-ACCENTS guard requires all 7 accents");
  }
  const missingAccents = ACCENTS.filter((a) => !isRec((env.accents as Rec)[a]));
  if (missingAccents.length > 0) {
    return shapeErr(
      `accents map missing accent(s): ${missingAccents.join(", ")} — the ALL-ACCENTS guard requires all 7 accents (${ACCENTS.join(", ")})`,
    );
  }

  let viewCount = 0;
  let warns = 0;
  const tally = emptyTally();
  let findings = env.findings.length;
  const notes: string[] = [];
  for (const accent of ACCENTS) {
    const rec = (env.accents as Rec)[accent] as Rec;
    if (!isStr(rec.applied)) {
      return shapeErr(`accent ${accent} missing its applied self-verified reading`);
    }
    if (!isRec(rec.views)) return shapeErr(`accent ${accent} missing its views map`);
    if (!isRec(rec.drawer)) {
      return shapeErr(`accent ${accent} missing its drawer record`);
    }
    if (!isArr(rec.drawer.unreadable) || !isArr(rec.drawer.lowcontrast)) {
      return shapeErr(`accent ${accent} drawer record missing the unreadable/lowcontrast arrays`);
    }
    if (rec.applied !== accent) {
      findings += 1;
      notes.push(
        `applied mismatch: accent ${accent} self-read "${rec.applied}" — the accent did not take`,
      );
    }
    for (const [view, vr] of Object.entries(rec.views)) {
      viewCount += 1;
      if (!isRec(vr)) return shapeErr(`accent ${accent} view ${view} is not a record`);
      if (!isArr(vr.unreadable)) {
        return shapeErr(`accent ${accent} view ${view} missing the unreadable array`);
      }
      if (!isArr(vr.lowcontrast)) {
        return shapeErr(`accent ${accent} view ${view} missing the lowcontrast array`);
      }
      if (!isNum(vr.scrollWidth)) {
        return shapeErr(`accent ${accent} view ${view} missing numeric scrollWidth`);
      }
      const ut = tallyUnreadable(vr.unreadable, false);
      mergeTally(tally, ut);
      if (ut.findings > 0) {
        findings += ut.findings;
        notes.push(`unreadable: ${accent}/${view} ${ut.findings} non-exempt entr(ies)`);
      }
      warns += vr.lowcontrast.length;
      if (vr.scrollWidth > 390) {
        findings += 1;
        notes.push(`overflow: ${accent}/${view} scrollWidth ${vr.scrollWidth} > 390`);
      }
    }
  }
  if (env.mode !== "light") {
    return {
      green: false,
      findings: 0,
      note: `mode=${env.mode} — the accent × dark family belongs to accent-dark-sweep (S27 rot: this seam owns light)`,
    };
  }
  const chrome = env.chrome as Rec;
  if (chrome.sidebarVisible === true) {
    findings += 1;
    notes.push(
      "vehicle contract broken: sidebar visible below lg (lg contract — the drawer is the only vehicle below 1024)",
    );
  }
  if (chrome.hamburgerVisible === false) {
    findings += 1;
    notes.push(
      "vehicle contract broken: hamburger hidden below lg (lg contract — the app bar's hamburger is the vehicle's handle)",
    );
  }
  const noteBits = [
    `7 accents × ${viewCount} view renderings swept at 390×844`,
    exemptionFragment(tally),
    `${warns} WARN`,
    `${findings} findings`,
    `MODE ${env.mode}`,
    ...notes,
  ];
  return { green: findings === 0, findings, note: noteBits.join("; ") };
}

// ---- accent-dark-sweep (S38 — the mobile 20-view matrix) ------------------------------

const S38_VIEWS = [
  "Dashboard", "MyDay", "Tasks", "Calendar", "Events", "Timetable",
  "Assignments", "Exams", "Notes", "Flashcards", "PracticeTests",
  "StudyGroups", "GradeTracker", "Analytics", "Files", "Calculator",
  "MathSolver", "AIAssistant", "FocusTimer", "Settings",
] as const;

function classifyAccentDarkSweep(env: unknown): StageVerdict {
  if (!isRec(env)) return shapeErr("envelope is not an object");
  if (!isStr(env.mode)) return shapeErr("mode key missing or not a string");
  if (
    !isRec(env.mobileViewport) ||
    env.mobileViewport.width !== 390 ||
    env.mobileViewport.height !== 844
  ) {
    return shapeErr(
      "mobileViewport ≠ the 390×844 mobile contract — never a silent re-scope",
    );
  }
  if (!isRec(env.applied)) return shapeErr("applied map missing (the self-verified readings)");
  const missingApplied = ACCENTS.filter((a) => !isStr((env.applied as Rec)[a]));
  if (missingApplied.length > 0) {
    return shapeErr(
      `applied map missing accent(s): ${missingApplied.join(", ")} — the ALL-ACCENTS guard`,
    );
  }
  if (!isRec(env.desktop) || !isRec(env.mobile)) {
    return shapeErr("desktop/mobile surface maps missing (accent-dark-sweep)");
  }

  interface SurfaceRecord {
    flashbulbs: unknown[];
    unreadable: unknown[];
    lowcontrast: unknown[];
    scrollWidth: number | null;
  }
  const readRecord = (raw: unknown, surface: string): SurfaceRecord | string => {
    if (!isRec(raw)) return `${surface} record is not a record`;
    if (!isArr(raw.flashbulbs)) return `${surface} record missing the flashbulbs array`;
    if (!isArr(raw.unreadable)) return `${surface} record missing the unreadable array`;
    if (!isArr(raw.lowcontrast)) return `${surface} record missing the lowcontrast array`;
    const scrollWidth =
      surface.startsWith("mobile") && isNum(raw.scrollWidth) ? raw.scrollWidth : null;
    return { flashbulbs: raw.flashbulbs, unreadable: raw.unreadable, lowcontrast: raw.lowcontrast, scrollWidth };
  };

  const surfaces: Record<string, Record<string, SurfaceRecord>> = {};
  for (const accent of ACCENTS) {
    const desktopMap = (env.desktop as Rec)[accent];
    const mobileMap = (env.mobile as Rec)[accent];
    if (!isRec(desktopMap) || !isRec(mobileMap)) {
      return shapeErr(
        `surface missing accent ${accent} — the ALL-ACCENTS guard requires all 7 accents on BOTH surfaces`,
      );
    }
    const drawer = mobileMap["(drawer)"];
    if (!isRec(drawer)) {
      return shapeErr(`accent ${accent} missing its (drawer) record — the drawer is part of the mobile contract`);
    }
    if (!isArr(drawer.flashbulbs) || !isArr(drawer.unreadable) || !isArr(drawer.lowcontrast)) {
      return shapeErr(`accent ${accent} (drawer) record missing the detector arrays`);
    }
    const acc: Record<string, SurfaceRecord> = {};
    for (const view of S38_VIEWS) {
      const d = readRecord(desktopMap[view], `desktop ${accent}/${view}`);
      if (isStr(d)) return shapeErr(d);
      const m = readRecord(mobileMap[view], `mobile ${accent}/${view}`);
      if (isStr(m)) return shapeErr(m);
      if (m.scrollWidth === null) {
        return shapeErr(`mobile ${accent}/${view} record missing numeric scrollWidth (the measurement IS the guarantee)`);
      }
      acc[`d:${view}`] = d;
      acc[`m:${view}`] = m;
    }
    acc["drawer"] = {
      flashbulbs: drawer.flashbulbs,
      unreadable: drawer.unreadable,
      lowcontrast: drawer.lowcontrast,
      scrollWidth: null,
    };
    surfaces[accent] = acc;
  }
  if (env.mode !== "dark") {
    return {
      green: false,
      findings: 0,
      note: `mode=${env.mode} — the accent × light family belongs to accent-light-sweep (S27 rot: this seam owns dark)`,
    };
  }

  let findings = 0;
  let warns = 0;
  const tally = emptyTally();
  const notes: string[] = [];
  for (const accent of ACCENTS) {
    if ((env.applied as Rec)[accent] !== accent) {
      findings += 1;
      notes.push(
        `applied mismatch: accent ${accent} self-read "${(env.applied as Rec)[accent]}"`,
      );
    }
    for (const [key, rec] of Object.entries(surfaces[accent])) {
      if (key === "drawer") {
        const drawer = (env.mobile as Rec)[accent] as Rec;
        const drawerRec = (drawer["(drawer)"] ?? {}) as Rec;
        if (isStr(drawerRec.error)) {
          // A drawer that failed to open is a FINDING, never a swallow.
          findings += 1;
          notes.push(`drawer error on ${accent}: ${drawerRec.error}`);
          continue;
        }
      }
      findings += rec.flashbulbs.length;
      if (rec.flashbulbs.length > 0) {
        notes.push(`flashbulb: ${accent}/${key} — light surface(s) on the dark canvas`);
      }
      const ut = tallyUnreadable(rec.unreadable, true);
      mergeTally(tally, ut);
      if (ut.findings > 0) {
        findings += ut.findings;
        notes.push(`unreadable: ${accent}/${key} ${ut.findings} non-exempt entr(ies)`);
      }
      warns += rec.lowcontrast.length;
      if (rec.scrollWidth !== null && rec.scrollWidth > 390) {
        findings += 1;
        notes.push(`overflow: ${accent}/${key} scrollWidth ${rec.scrollWidth} > 390`);
      }
    }
  }
  const renderings = ACCENTS.length * S38_VIEWS.length * 2;
  const noteBits = [
    `${renderings} view renderings (desktop+mobile)`,
    `7 drawer records`,
    exemptionFragment(tally),
    `${warns} WARN`,
    `${findings} findings`,
    `MODE ${env.mode}`,
    ...notes,
  ];
  return { green: findings === 0, findings, note: noteBits.join("; ") };
}

// ---- the accent navigation sweeps (S39-S41 seed, S42-S49 volume, S50 seed-13) ---------

const DISPLAY_VIEWS_20 = [
  "Dashboard", "My Day", "Tasks", "Calendar", "Events", "Timetable",
  "Assignments", "Exams", "Notes", "Flashcards", "Practice Tests",
  "Study Groups", "Grade Tracker", "Analytics", "Files", "Calculator",
  "Math Solver", "AI Assistant", "Focus Timer", "Settings",
] as const;

const VOLUME_VIEWS = [
  "Dashboard", "My Day", "Tasks", "Calendar", "Events", "Notes", "Analytics",
] as const;

const SEED_DARK_VIEWS_13 = [
  "Timetable", "Assignments", "Exams", "Flashcards", "Practice Tests",
  "Study Groups", "Grade Tracker", "Files", "Calculator", "Math Solver",
  "AI Assistant", "Focus Timer", "Settings",
] as const;

interface AccentSweepConfig {
  mode: "light" | "dark";
  width: number;
  height: number;
  vehicle: "drawer" | "sidebar";
  layout: "below-lg" | "desktop";
  views: readonly string[];
  headingClearance: boolean;
  volume: boolean;
  api: boolean;
  scrollable: "drawerNavScrollable" | "sidebarNavScrollable" | null;
}

const ACCENT_SWEEP_CONFIGS: Record<string, AccentSweepConfig> = {
  "accent-midband-sweep": {
    mode: "light", width: 768, height: 1024, vehicle: "drawer", layout: "below-lg",
    views: DISPLAY_VIEWS_20, headingClearance: false, volume: false, api: false, scrollable: null,
  },
  "accent-landscape-sweep": {
    mode: "light", width: 844, height: 390, vehicle: "drawer", layout: "below-lg",
    views: DISPLAY_VIEWS_20, headingClearance: true, volume: false, api: false, scrollable: "drawerNavScrollable",
  },
  "accent-desktop-sweep": {
    mode: "light", width: 1280, height: 800, vehicle: "sidebar", layout: "desktop",
    views: DISPLAY_VIEWS_20, headingClearance: false, volume: false, api: false, scrollable: "sidebarNavScrollable",
  },
  "accent-volume-sweep": {
    mode: "dark", width: 1280, height: 800, vehicle: "sidebar", layout: "desktop",
    views: VOLUME_VIEWS, headingClearance: false, volume: true, api: true, scrollable: "sidebarNavScrollable",
  },
  "accent-volume-light-sweep": {
    mode: "light", width: 1280, height: 800, vehicle: "sidebar", layout: "desktop",
    views: VOLUME_VIEWS, headingClearance: false, volume: true, api: true, scrollable: "sidebarNavScrollable",
  },
  "accent-volume-dark-mobile-sweep": {
    mode: "dark", width: 390, height: 844, vehicle: "drawer", layout: "below-lg",
    views: VOLUME_VIEWS, headingClearance: true, volume: true, api: true, scrollable: "drawerNavScrollable",
  },
  "accent-volume-light-mobile-sweep": {
    mode: "light", width: 390, height: 844, vehicle: "drawer", layout: "below-lg",
    views: VOLUME_VIEWS, headingClearance: true, volume: true, api: true, scrollable: "drawerNavScrollable",
  },
  "accent-volume-dark-midband-sweep": {
    mode: "dark", width: 768, height: 1024, vehicle: "drawer", layout: "below-lg",
    views: VOLUME_VIEWS, headingClearance: true, volume: true, api: true, scrollable: "drawerNavScrollable",
  },
  "accent-volume-light-midband-sweep": {
    mode: "light", width: 768, height: 1024, vehicle: "drawer", layout: "below-lg",
    views: VOLUME_VIEWS, headingClearance: true, volume: true, api: true, scrollable: "drawerNavScrollable",
  },
  "accent-volume-dark-landscape-sweep": {
    mode: "dark", width: 844, height: 390, vehicle: "drawer", layout: "below-lg",
    views: VOLUME_VIEWS, headingClearance: true, volume: true, api: true, scrollable: "drawerNavScrollable",
  },
  "accent-volume-light-landscape-sweep": {
    mode: "light", width: 844, height: 390, vehicle: "drawer", layout: "below-lg",
    views: VOLUME_VIEWS, headingClearance: true, volume: true, api: true, scrollable: "drawerNavScrollable",
  },
  "accent-dark-landscape-seed-sweep": {
    mode: "dark", width: 844, height: 390, vehicle: "drawer", layout: "below-lg",
    views: SEED_DARK_VIEWS_13, headingClearance: true, volume: false, api: false, scrollable: "drawerNavScrollable",
  },
};

const VOLUME_PROFILE = { tasks: 300, notes: 200, events: 250 };
const LINK_CENSUS = 20;
const LONG_TASK_BUDGET = 1500;
const CLICK_LATENCY_BUDGET = 1500;
const PAYLOAD_BUDGET = 500_000;

function classifyAccentSweep(audit: string, env: unknown): StageVerdict {
  const cfg = ACCENT_SWEEP_CONFIGS[audit];
  if (!isRec(env)) return shapeErr("envelope is not an object");
  if (!isArr(env.findings)) {
    return shapeErr("findings key missing or not an Array (the anti-phantom guard)");
  }
  if (!isStr(env.mode)) return shapeErr("mode key missing or not a string");
  if (
    !isRec(env.viewport) ||
    env.viewport.width !== cfg.width ||
    env.viewport.height !== cfg.height
  ) {
    return shapeErr(
      `viewport ${isRec(env.viewport) ? `${env.viewport.width}×${env.viewport.height}` : "?"} ≠ the ${cfg.width}×${cfg.height} contract — the sibling families own those surfaces, never a silent re-scope`,
    );
  }
  if (!isRec(env.chrome)) return shapeErr(`chrome record missing (${audit})`);
  if (!isBool(env.chrome.sidebarVisible) || !isBool(env.chrome.hamburgerVisible)) {
    return shapeErr("chrome record missing/non-boolean sidebarVisible|hamburgerVisible");
  }
  if (cfg.scrollable && !isBool(env.chrome[cfg.scrollable])) {
    return shapeErr(`chrome record missing/non-boolean ${cfg.scrollable}`);
  }
  if (cfg.volume) {
    if (!isRec(env.volume)) {
      return shapeErr("volume key missing — the density evidence is part of the contract");
    }
    const v = env.volume;
    if (!isNum(v.tasks) || !isNum(v.notes) || !isNum(v.events)) {
      return shapeErr("volume profile missing numeric tasks/notes/events legs");
    }
  }
  if (cfg.api && !isRec(env.api)) {
    return shapeErr("api map missing (the payload evidence is part of the contract)");
  }
  if (!isRec(env.accents)) {
    return shapeErr(
      "accents map missing — the historical flat-sweep shape reads shape-error, never green-by-resemblance",
    );
  }
  const missingAccents = ACCENTS.filter((a) => !isRec((env.accents as Rec)[a]));
  if (missingAccents.length > 0) {
    return shapeErr(
      `accents map missing accent(s): ${missingAccents.join(", ")} — the ALL-ACCENTS guard requires all 7 accents (${ACCENTS.join(", ")})`,
    );
  }

  // Strict per-record shape validation. Required keys — never reject extras
  // (the dark shape is a superset of the light shape; its dark-only keys
  // ride along when the sibling light seam reads it).
  for (const accent of ACCENTS) {
    const rec = (env.accents as Rec)[accent] as Rec;
    if (!isStr(rec.applied)) {
      return shapeErr(`accent ${accent} missing its applied self-verified reading`);
    }
    if (!isRec(rec.views)) return shapeErr(`accent ${accent} missing its views map`);
    const vehicleRec = rec[cfg.vehicle];
    if (!isRec(vehicleRec)) {
      return shapeErr(`accent ${accent} missing its ${cfg.vehicle} record (the per-accent contract)`);
    }
    if (!isNum(vehicleRec.linkCount)) {
      return shapeErr(`accent ${accent} ${cfg.vehicle} record missing numeric linkCount`);
    }
    if (!isArr(vehicleRec.unreadable) || !isArr(vehicleRec.lowcontrast)) {
      return shapeErr(`accent ${accent} ${cfg.vehicle} record missing the unreadable/lowcontrast arrays`);
    }
    if (vehicleRec.activeTint !== null && !isStr(vehicleRec.activeTint)) {
      return shapeErr(`accent ${accent} ${cfg.vehicle} record has a non-string activeTint`);
    }
    if (cfg.mode === "dark" && cfg.vehicle === "drawer" && !isArr(vehicleRec.flashbulbs)) {
      return shapeErr(`accent ${accent} drawer record missing the flashbulbs array (the dark detector family)`);
    }
    for (const view of cfg.views) {
      const vr = rec.views[view];
      if (!isRec(vr)) {
        return shapeErr(
          `accent ${accent} missing view record ${view} — a view that silently did not run must never read green-by-omission`,
        );
      }
      if (!isStr(vr.heading)) return shapeErr(`${accent}/${view} record missing heading`);
      if (!isNum(vr.scrollWidth)) {
        return shapeErr(`${accent}/${view} record missing numeric scrollWidth (the measurement IS the guarantee)`);
      }
      if (!isArr(vr.unreadable) || !isArr(vr.lowcontrast) || !isArr(vr.consoleErrors)) {
        return shapeErr(`${accent}/${view} record missing the unreadable/lowcontrast/consoleErrors arrays`);
      }
      if (!isStr(vr.activeTint)) {
        return shapeErr(`${accent}/${view} record missing activeTint (the interaction evidence is part of the record)`);
      }
      if (!isStr(vr.activeLabel)) {
        return shapeErr(`${accent}/${view} record missing activeLabel`);
      }
      if (cfg.layout === "below-lg") {
        if (!isBool(vr.drawerClosed) || !isBool(vr.appBar)) {
          return shapeErr(`${accent}/${view} record missing/non-boolean drawerClosed|appBar`);
        }
        if (cfg.headingClearance && !isBool(vr.headingClearance)) {
          return shapeErr(`${accent}/${view} record missing/non-boolean headingClearance (the landscape-own clearance)`);
        }
      } else {
        if (!isBool(vr.sidebarVisible) || !isBool(vr.headingOffset)) {
          return shapeErr(`${accent}/${view} record missing/non-boolean sidebarVisible|headingOffset (the desktop vehicle evidence)`);
        }
      }
      if (cfg.volume) {
        if (!isNum(vr.nodes) || !isNum(vr.mainNodes)) {
          return shapeErr(`${accent}/${view} record missing numeric nodes|mainNodes (the density evidence)`);
        }
        if (!isNum(vr.longTaskTotal) || !isNum(vr.clickLatencyMs)) {
          return shapeErr(`${accent}/${view} record missing numeric longTaskTotal|clickLatencyMs (the volume measurement is part of the record)`);
        }
      }
      if (cfg.mode === "dark" && !isArr(vr.flashbulbs)) {
        return shapeErr(`${accent}/${view} record missing the flashbulbs array (the dark detector family is part of the record)`);
      }
    }
  }
  if (env.mode !== cfg.mode) {
    return {
      green: false,
      findings: 0,
      note: `mode=${env.mode} — the sweep ran in the wrong mode (S27 rot: ${audit} owns MODE ${cfg.mode})`,
    };
  }

  // ---- counting (shape validated; mode correct) -------------------------------
  const dark = cfg.mode === "dark";
  let findings = env.findings.length;
  let warns = 0;
  const tally = emptyTally();
  const notes: string[] = [];
  let tintReadings = 0;

  const chrome = env.chrome as Rec;
  if (cfg.layout === "below-lg") {
    if (chrome.sidebarVisible === true) {
      findings += 1;
      notes.push(
        "vehicle contract broken: sidebar visible below lg (lg contract — the drawer is the only vehicle below 1024)",
      );
    }
    if (chrome.hamburgerVisible === false) {
      findings += 1;
      notes.push(
        "vehicle contract broken: hamburger hidden below lg (lg contract — the app bar's hamburger is the vehicle's handle)",
      );
    }
  } else {
    if (chrome.sidebarVisible === false) {
      findings += 1;
      notes.push(
        "vehicle contract broken: the desktop sidebar is hidden (the sidebar is the desktop vehicle; the app bar is lg:hidden)",
      );
    }
    if (chrome.hamburgerVisible === true) {
      findings += 1;
      notes.push(
        "vehicle contract broken: the hamburger is visible at desktop (the sidebar is the desktop vehicle; the app bar is lg:hidden)",
      );
    }
  }
  if (cfg.scrollable && chrome[cfg.scrollable] === false) {
    findings += 1;
    notes.push(
      `short-viewport contract broken: ${cfg.scrollable}=false — the nav geometry cannot fit the nav rows; the nav's scroll is the only path to the below-fold links`,
    );
  }
  if (cfg.volume) {
    const v = env.volume as Rec;
    if (v.tasks !== VOLUME_PROFILE.tasks || v.notes !== VOLUME_PROFILE.notes || v.events !== VOLUME_PROFILE.events) {
      findings += 1;
      notes.push(
        `volume rot: profile ${v.tasks}/${v.notes}/${v.events} ≠ the 300/200/250 S13 contract — the sweep measured the wrong density and must never read green`,
      );
    }
    for (const [path, stat] of Object.entries(env.api as Rec)) {
      if (isRec(stat) && isNum(stat.bytes) && stat.bytes > PAYLOAD_BUDGET) {
        findings += 1;
        notes.push(
          `payload bound: ${path} ${stat.bytes} bytes > ${PAYLOAD_BUDGET} (the unbounded-payload guard)`,
        );
      }
    }
  }

  for (const accent of ACCENTS) {
    const rec = (env.accents as Rec)[accent] as Rec;
    if (rec.applied !== accent) {
      findings += 1;
      notes.push(`applied mismatch: accent ${accent} self-read "${rec.applied}"`);
    }
    const vehicleRec = rec[cfg.vehicle] as Rec;
    if (isStr(vehicleRec.error)) {
      findings += 1;
      notes.push(`${cfg.vehicle} error on ${accent}: ${vehicleRec.error}`);
    } else {
      if (vehicleRec.linkCount !== LINK_CENSUS) {
        findings += 1;
        notes.push(
          `${cfg.vehicle} link census broke on ${accent}: ${vehicleRec.linkCount} links (expected ${LINK_CENSUS})`,
        );
      }
      const vt = tallyUnreadable(vehicleRec.unreadable as unknown[], dark);
      mergeTally(tally, vt);
      if (vt.findings > 0) {
        findings += vt.findings;
        notes.push(`unreadable: ${accent} ${cfg.vehicle} ${vt.findings} non-exempt entr(ies)`);
      }
      if (dark && isArr(vehicleRec.flashbulbs) && vehicleRec.flashbulbs.length > 0) {
        findings += vehicleRec.flashbulbs.length;
        notes.push(`flashbulb: ${accent} ${cfg.vehicle} — light surface(s) on the dark canvas`);
      }
    }
    warns += (vehicleRec.lowcontrast as unknown[]).length;

    for (const view of cfg.views) {
      const vr = (rec.views as Rec)[view] as Rec;
      tintReadings += 1;
      if (dark && (vr.flashbulbs as unknown[]).length > 0) {
        findings += (vr.flashbulbs as unknown[]).length;
        notes.push(`flashbulb: ${accent}/${view} — light surface(s) on the dark canvas`);
      }
      const ut = tallyUnreadable(vr.unreadable as unknown[], dark);
      mergeTally(tally, ut);
      if (ut.findings > 0) {
        findings += ut.findings;
        notes.push(`unreadable: ${accent}/${view} ${ut.findings} non-exempt entr(ies)`);
      }
      warns += (vr.lowcontrast as unknown[]).length;
      if (vr.activeTint === "none" || vr.activeTint === null) {
        findings += 1;
        notes.push(
          `active-link gradient did not resolve on ${accent}/${view} (the S8 no-var rot class — the gradient pair did not resolve)`,
        );
      }
      if (isStr(vr.activeLabel) && vr.activeLabel !== "" && vr.activeLabel !== view) {
        findings += 1;
        notes.push(
          `active state did not follow the navigation on ${accent}/${view}: read "${vr.activeLabel}"`,
        );
      }
      if ((vr.scrollWidth as number) > cfg.width) {
        findings += 1;
        notes.push(`overflow: ${accent}/${view} scrollWidth ${vr.scrollWidth} > ${cfg.width}`);
      }
      if (cfg.layout === "below-lg") {
        if (vr.drawerClosed === false) {
          findings += 1;
          notes.push(`drawer did not close on navigation at ${accent}/${view}`);
        }
        if (vr.appBar === false) {
          findings += 1;
          notes.push(`app bar missing at ${accent}/${view}`);
        }
        if (cfg.headingClearance && vr.headingClearance === false) {
          findings += 1;
          notes.push(`heading clearance broken at ${accent}/${view} (under the fixed bar)`);
        }
      } else {
        if (vr.sidebarVisible === false) {
          findings += 1;
          notes.push(`sidebar vanished during navigation at ${accent}/${view}`);
        }
        if (vr.headingOffset === false) {
          findings += 1;
          notes.push(`heading offset broken at ${accent}/${view} (content under the fixed sidebar)`);
        }
      }
      if (cfg.volume) {
        if ((vr.longTaskTotal as number) > LONG_TASK_BUDGET) {
          findings += 1;
          notes.push(
            `long-task budget: ${accent}/${view} longTaskTotal ${vr.longTaskTotal} > ${LONG_TASK_BUDGET} (main-thread blocking under stress)`,
          );
        }
        if ((vr.clickLatencyMs as number) > CLICK_LATENCY_BUDGET) {
          findings += 1;
          notes.push(
            `click-latency budget: ${accent}/${view} clickLatencyMs ${vr.clickLatencyMs} > ${CLICK_LATENCY_BUDGET} (nav interactivity under stress)`,
          );
        }
      }
    }
  }

  const noteBits = [
    `${ACCENTS.length * cfg.views.length} view renderings`,
    `${tintReadings} active-tint readings`,
    `7 ${cfg.vehicle} records`,
    `viewport ${cfg.width}×${cfg.height}`,
    ...(cfg.volume ? [`volume ${VOLUME_PROFILE.tasks}/${VOLUME_PROFILE.notes}/${VOLUME_PROFILE.events}`] : []),
    exemptionFragment(tally),
    `${warns} WARN`,
    `${findings} findings`,
    `MODE ${cfg.mode}`,
    ...notes,
  ];
  return { green: findings === 0, findings, note: noteBits.join("; ") };
}

// ---- cwv-volume-stress (S51) ---------------------------------------------------------

const S51_BUDGETS: ReadonlyArray<{ metric: string; limit: number; label: string }> = [
  { metric: "lcp", limit: 4400, label: "the parity-anchor budget (the reference's own seed LCP under the same preset)" },
  { metric: "cls", limit: 0.1, label: "the ADR-014 load-stability contract at volume" },
  { metric: "fcp", limit: 1500, label: "the shell-paint volume-invariance" },
  { metric: "ttfb", limit: 500, label: "the server sanity bound" },
  { metric: "longTaskTotal", limit: 2000, label: "the load-window sibling of the S13 B3 budget" },
];

function classifyCwvVolumeStress(env: unknown): StageVerdict {
  if (!isRec(env)) return shapeErr("envelope is not an object");
  if (!isArr(env.findings)) {
    return shapeErr("findings key missing or not an Array (the anti-phantom guard)");
  }
  if (!isStr(env.mode)) return shapeErr("mode key missing or not a string");
  if (!isStr(env.target) || env.target === "") {
    return shapeErr("target missing/empty — the standalone-build origin is part of the record");
  }
  if (
    !isRec(env.viewport) ||
    env.viewport.width !== 390 ||
    env.viewport.height !== 844
  ) {
    return shapeErr("viewport ≠ the 390×844 stress contract — never a silent re-scope");
  }
  if (env.throttle !== true) {
    return shapeErr(
      "throttle must be true — the Lighthouse mobile preset (4x CPU + Slow-4G, cache disabled) is the contract; an unthrottled run is a different cell",
    );
  }
  if (!isRec(env.volume)) {
    return shapeErr("volume key missing — the density evidence is part of the contract");
  }
  const vol = env.volume;
  if (
    vol.tasks !== VOLUME_PROFILE.tasks ||
    vol.notes !== VOLUME_PROFILE.notes ||
    vol.events !== VOLUME_PROFILE.events
  ) {
    return shapeErr(
      `volume profile ${isNum(vol.tasks) ? vol.tasks : "?"}/${isNum(vol.notes) ? vol.notes : "?"}/${isNum(vol.events) ? vol.events : "?"} ≠ the exact 300/200/250 S13 contract — a different profile is a different audit, never a silent re-scope`,
    );
  }
  if (!isRec(env.views)) return shapeErr("views map missing (cwv-volume-stress)");
  const missingViews = VOLUME_VIEWS.filter((v) => !isRec((env.views as Rec)[v]));
  if (missingViews.length > 0) {
    return shapeErr(
      `views map missing view(s): ${missingViews.join(", ")} — a view that silently did not run must never read green-by-omission`,
    );
  }
  if (!isRec(env.inpProxy)) return shapeErr("inpProxy record missing (the interaction proxy is part of the record)");
  const proxy = env.inpProxy;
  if (!isNum(proxy.ms)) return shapeErr("inpProxy.ms missing (the volume-stressed interaction measurement)");
  if (!isStr(proxy.from) || !isStr(proxy.to)) {
    return shapeErr("inpProxy.from/to must be strings (the proxy's identity is part of the record)");
  }
  for (const view of VOLUME_VIEWS) {
    const vr = (env.views as Rec)[view] as Rec;
    if (!isNum(vr.lcp)) return shapeErr(`views.${view}.lcp missing or mistyped (a string metric must never read as a green zero)`);
    if (!isStr(vr.lcpEl)) return shapeErr(`views.${view}.lcpEl missing (the LCP element attribution rides the record)`);
    if (!isNum(vr.fcp) || !isNum(vr.cls) || !isNum(vr.ttfb)) {
      return shapeErr(`views.${view} missing numeric fcp|cls|ttfb`);
    }
    if (!isNum(vr.longTaskTotal)) return shapeErr(`views.${view}.longTaskTotal missing (the volume measurement is part of the record)`);
    if (!isNum(vr.mainNodes)) return shapeErr(`views.${view}.mainNodes missing (the density evidence is part of the record)`);
    if (!isNum(vr.runs)) return shapeErr(`views.${view}.runs missing (each view carries its run count — the 2-run median)`);
  }
  if (env.mode !== "light") {
    return {
      green: false,
      findings: 0,
      note: `mode=${env.mode} — the sweep ran in the wrong mode (S27 rot: cwv-volume-stress owns MODE light; the dark half is the documented non-gap)`,
    };
  }

  let breaches = 0;
  const breachNotes: string[] = [];
  for (const view of VOLUME_VIEWS) {
    const vr = (env.views as Rec)[view] as Rec;
    for (const budget of S51_BUDGETS) {
      const value = vr[budget.metric] as number;
      if (value > budget.limit) {
        breaches += 1;
        breachNotes.push(`${view} ${budget.metric}=${value} >${budget.limit} (${budget.label})`);
      }
    }
  }
  if (proxy.ms > 3000) {
    breaches += 1;
    breachNotes.push(
      `INP proxy ${proxy.from}→${proxy.to} ${proxy.ms}ms >3000ms volume interaction budget (Dashboard→Tasks under the full throttle)`,
    );
  }
  const findings = env.findings.length + breaches;
  const noteBits = [
    "7 volume-affected views × 5 field metrics at 390×844 under the Lighthouse throttle (4x CPU + Slow-4G)",
    `against the standalone build (${env.target})`,
    `volume ${VOLUME_PROFILE.tasks}/${VOLUME_PROFILE.notes}/${VOLUME_PROFILE.events}`,
    `MODE ${env.mode}`,
    `INP proxy ${proxy.from}→${proxy.to} ${proxy.ms}ms`,
    `${breaches} budget breach(es)`,
    ...breachNotes,
  ];
  return { green: findings === 0, findings, note: noteBits.join("; ") };
}

// ---- the dispatch table -----------------------------------------------------------------

export const AUDIT_NAMES = [
  ...FINDINGS_ARRAY_AUDITS,
  "forced-colors",
  "print",
  "focus-order",
  "dark-sweep",
  "accent-dark-sweep",
  "cwv",
  "pre15-preflight",
  "dep-audit",
  "dev-server-preflight",
  ...Object.keys(FLAT_SWEEP_CONFIGS),
  "accent-light-sweep",
  ...Object.keys(ACCENT_SWEEP_CONFIGS),
  "cwv-volume-stress",
] as const;

export type AuditName = (typeof AUDIT_NAMES)[number];

/**
 * Classify one audit envelope against ITS audit's exact shape. An unknown
 * audit name is itself a loud shape-error — never a silent pass-through.
 */
export function classifyAudit(audit: string, envelope: unknown): StageVerdict {
  if ((FINDINGS_ARRAY_AUDITS as readonly string[]).includes(audit)) {
    return classifyFindingsArray(envelope);
  }
  switch (audit) {
    case "forced-colors":
      return classifyForcedColors(envelope);
    case "print":
      return classifyPrint(envelope);
    case "focus-order":
      return classifyFocusOrder(envelope);
    case "dark-sweep":
      return classifyDarkSweep(envelope);
    case "accent-dark-sweep":
      return classifyAccentDarkSweep(envelope);
    case "cwv":
      return classifyCwv(envelope);
    case "pre15-preflight":
      return classifyPre15Preflight(envelope);
    case "dep-audit":
      return classifyDepAudit(envelope);
    case "dev-server-preflight":
      return classifyDevServerPreflight(envelope);
    case "accent-light-sweep":
      return classifyAccentLightSweep(envelope);
    case "cwv-volume-stress":
      return classifyCwvVolumeStress(envelope);
    default:
      if (audit in FLAT_SWEEP_CONFIGS) return classifyFlatSweep(audit, envelope);
      if (audit in ACCENT_SWEEP_CONFIGS) return classifyAccentSweep(audit, envelope);
      return shapeErr(`unknown audit name "${audit}"`);
  }
}

// ---- the aggregate -------------------------------------------------------------------------

/**
 * Fold the stage verdicts into the suite outcome: green only when every
 * stage is green; failed lists the non-green stages; shape-errors ride the
 * summary so a seam/audit drift is impossible to miss in the headline.
 */
export function suiteVerdict(stages: SuiteStage[]): SuiteOutcome {
  const failed = stages.filter((s) => !s.verdict.green).map((s) => s.name);
  const greenCount = stages.length - failed.length;
  const shapeBroken = stages.filter((s) =>
    /shape not recognized/i.test(s.verdict.note),
  );
  const bits = [`${greenCount}/${stages.length} green`];
  if (failed.length > 0) bits.push(`failed: ${failed.join(", ")}`);
  if (shapeBroken.length > 0) {
    bits.push(
      `shape-error in ${shapeBroken.map((s) => s.name).join(", ")}: ${shapeBroken[0].verdict.note}`,
    );
  }
  return { green: failed.length === 0, failed, summary: bits.join("; ") };
}
