// ---------------------------------------------------------------------------
// The S30 dependency-security seam. `bun audit` (bun 1.3.14) has no JSON
// reporter and emits a text report; this seam parses that text, classifies
// every advisory by RUNTIME REACHABILITY against the production standalone
// trace (.next/standalone/node_modules — the ground truth for "does this
// ship"), and assembles the self-describing envelope.
//
// Pure functions with explicit args — never reads fs or spawns itself (the
// runner script owns that), so the parser format, the classification matrix,
// and the envelope contract are all unit-pinnable (tests/dep-audit.test.ts).
// The fixture there is today's byte-exact output: if a future bun release
// changes the text format, those pins fail and force the parser update in
// the same change (the format-change guard).
// ---------------------------------------------------------------------------

export interface AuditAdvisory {
  module: string;
  vulnerableRange: string;
  severity: string;
  title: string;
  /** Dependency chains ("a › b › c") the vulnerable module was reached through. */
  paths: string[];
  url: string;
}

export interface DepAuditContext {
  /** Modules present in .next/standalone/node_modules — the runtime trace. */
  runtimeModules: string[];
  prodDependencies: string[];
  devDependencies: string[];
}

export type AdvisorySurface = "runtime" | "dev" | "cli" | "unclassified";

export interface AdvisoryClassification {
  module: string;
  severity: string;
  surface: AdvisorySurface;
  runtimeReachable: boolean;
  verdict: "FAIL" | "NON-PRODUCTION";
  rationale: string;
}

export interface DepAuditEnvelope {
  ranAt: string;
  source: "bun audit";
  /** The ground truth rides the envelope — self-describing output (S27). */
  runtimeModules: string[];
  totalAdvisories: number;
  runtimeFindings: AdvisoryClassification[];
  nonProductionFindings: AdvisoryClassification[];
  verdict: string;
}

// ---- parser ------------------------------------------------------------------

// A block header sits at column 0: "<module>  <version-range>". The range
// must start version-ish (<, >, =, ~, ^, or a digit) — this is what keeps
// the summary ("2 vulnerabilities (2 high)") and the trailer ("To update
// all dependencies…") from manufacturing phantom advisories.
const RANGE_START = /^[<>=~^\d]/;

const SEVERITY_LINE =
  /^\s+(critical|high|moderate|low):\s+(.+?)\s+-\s+(\S+)\s*$/;

/**
 * Parse `bun audit` text output into advisories. Tolerates the
 * "(direct dependency)" marker (it is not a path), collects multi-path
 * chains, and never manufactures advisories from summary/trailer lines.
 */
export function parseBunAuditOutput(output: string): AuditAdvisory[] {
  const advisories: AuditAdvisory[] = [];
  let current: AuditAdvisory | null = null;

  for (const line of output.split("\n")) {
    if (line.length === 0 || line.trim().length === 0) {
      current = null; // a blank line closes the advisory block
      continue;
    }
    const indented = /^\s/.test(line);
    if (!indented) {
      const header = /^(\S+)\s+(.+)$/.exec(line);
      if (header && RANGE_START.test(header[2])) {
        current = {
          module: header[1],
          vulnerableRange: header[2].trim(),
          severity: "unknown",
          title: "",
          paths: [],
          url: "",
        };
        advisories.push(current);
      } else {
        current = null; // summary / trailer — never an advisory
      }
      continue;
    }
    if (current === null) continue;
    const severity = SEVERITY_LINE.exec(line);
    if (severity) {
      current.severity = severity[1];
      current.title = severity[2].trim();
      current.url = severity[3];
      continue;
    }
    const trimmed = line.trim();
    if (trimmed === "(direct dependency)") continue; // marker, not a path
    if (trimmed.includes("›")) current.paths.push(trimmed);
  }
  return advisories;
}

// ---- classifier ------------------------------------------------------------------

const pathRoot = (path: string): string => path.split("›")[0].trim();

/**
 * Classify one advisory by runtime reachability. THE TRACE IS THE TRUTH: a
 * module present in .next/standalone/node_modules is FAIL even when every
 * reported path roots in devDependencies (the trace is the production
 * artifact; the dependency lists are declarations). Everything else is
 * NON-PRODUCTION, labeled by where its paths root — dev-only tooling (dev),
 * prod-declared tooling the runtime never imports (cli, the stricter label
 * for mixed roots), or honestly unclassified provenance.
 */
export function classifyAdvisory(
  advisory: AuditAdvisory,
  ctx: DepAuditContext,
): AdvisoryClassification {
  if (ctx.runtimeModules.includes(advisory.module)) {
    return {
      module: advisory.module,
      severity: advisory.severity,
      surface: "runtime",
      runtimeReachable: true,
      verdict: "FAIL",
      rationale:
        "In the standalone runtime trace (.next/standalone/node_modules) — the module ships to production; runtime-reachable.",
    };
  }

  const roots = advisory.paths.map(pathRoot).filter((r) => r.length > 0);
  const devRoots = roots.filter((r) => ctx.devDependencies.includes(r));
  const prodRoots = roots.filter((r) => ctx.prodDependencies.includes(r));

  let surface: AdvisorySurface;
  let rationale: string;
  if (prodRoots.length > 0) {
    surface = "cli";
    rationale = `Not in the standalone trace, but reached from the prod-declared tooling ${prodRoots.join(", ")} (the CLI/build class — the app runtime never imports it); documented non-production risk.`;
  } else if (roots.length > 0 && devRoots.length === roots.length) {
    surface = "dev";
    rationale = `Not in the standalone trace; every path roots in a devDependency (${devRoots.join(", ")}) — dev-time tooling only; documented non-production risk.`;
  } else {
    surface = "unclassified";
    rationale = `Not in the standalone trace; path root(s) (${roots.join(", ")}) sit outside both dependency lists — unclassified provenance; documented non-production risk.`;
  }
  return {
    module: advisory.module,
    severity: advisory.severity,
    surface,
    runtimeReachable: false,
    verdict: "NON-PRODUCTION",
    rationale,
  };
}

// ---- envelope -----------------------------------------------------------------------

/**
 * Assemble the self-describing audit envelope: the runtime-family split, the
 * verdict string (GREEN when nothing is runtime-reachable), and the runtime
 * trace that decided it. `ranAt` is injected by the caller so output stays
 * deterministic and pinnable.
 */
export function buildDepAuditEnvelope(
  advisories: AuditAdvisory[],
  ctx: DepAuditContext,
  ranAt: string,
): DepAuditEnvelope {
  const classified = advisories.map((a) => classifyAdvisory(a, ctx));
  const runtimeFindings = classified.filter((c) => c.verdict === "FAIL");
  const nonProductionFindings = classified.filter((c) => c.verdict === "NON-PRODUCTION");
  const verdict =
    runtimeFindings.length > 0
      ? `FAIL — ${runtimeFindings.length} runtime-reachable advisory(ies) — action needed`
      : `GREEN — ${nonProductionFindings.length} advisory(ies) documented as non-production (dev/CLI surface), 0 runtime-reachable`;
  return {
    ranAt,
    source: "bun audit",
    runtimeModules: ctx.runtimeModules,
    totalAdvisories: advisories.length,
    runtimeFindings,
    nonProductionFindings,
    verdict,
  };
}
