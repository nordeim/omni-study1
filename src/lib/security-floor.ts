// ---------------------------------------------------------------------------
// The S202/EZ security-floor seam: the dependency-security floor pins.
//
// WHY THIS EXISTS: the standing suite's dep-audit stage (the S30 seam,
// src/lib/dep-audit.ts) classifies advisories by RUNTIME REACHABILITY
// against the production standalone trace — the ground truth for "does
// this ship" at the SERVER. That classifier has a documented blind spot:
// deps webpack INTERNALIZES into the route chunks (zod) never appear in
// .next/standalone/node_modules, so a direct prod dependency can read
// "dev" through bun's displayed advisory path. This seam closes the
// blind spot from the other side: the LOCKFILE floor gate. Every
// resolved occurrence of a floored package in bun.lock must satisfy its
// floor or `bun run test` fails — the downgrade class becomes impossible
// to ship, and the upgrade that closes an advisory carries its own
// regression tripwire in the same commit.
//
// The floors (each a published, fixed GHSA advisory — see the comments):
//   next >= 16.4.5 — GHSA-mfr8-8qww-v76h (moderate: information
//     disclosure across root params via unstable_cache; vulnerable
//     >=16.3.0 <=16.4.4; fixed 16.4.5). next SHIPS in the standalone
//     trace — the S202 cycle's runtime-reachable dep-audit finding.
//   zod >= 4.6.6 — GHSA-mrhx-c7xc-m3w5 (high: memory exhaustion while
//     validating oversized constrained collections; fixed 4.6.6). A
//     direct prod dependency at every API boundary, bundled into the
//     server chunks (the trace classifier's blind-spot class).
//
// Pure functions with explicit args — never reads fs itself (the test
// passes the lockfile text), the dep-audit seam precedent.
// ---------------------------------------------------------------------------

/** The minimum RESOLVED version each floored package may carry in
 * bun.lock. A resolution the comparator cannot prove satisfies its
 * floor is a violation (fail closed). */
export const SECURITY_FLOORS: Readonly<Record<string, string>> = {
  // GHSA-mfr8-8qww-v76h (fixed 16.4.5); the S202/EZ floor.
  next: "16.4.5",
  // GHSA-mrhx-c7xc-m3w5 (fixed 4.6.6); the S202/EZ floor.
  zod: "4.6.6",
};

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Every RESOLVED occurrence of `pkg` in bun.lock's text, extracted from
 * the packages section's array-entry shape:
 *   "pkg": ["pkg@X.Y.Z", "", { … }],
 * The exact-key anchor kills the prefix trap (a probe for `next` cannot
 * match `eslint-config-next` — the key AND the array head both carry the
 * full package name); the `: ["` anchor kills the workspaces section's
 * manifest-range lines (those are string entries like "next": "^16.4.2",
 * never arrays). Multiple occurrences (a future multi-version lock) all
 * surface — the caller asserts the floor on every one.
 */
export function parseResolvedVersions(lockText: string, pkg: string): string[] {
  const re = new RegExp(`"${escapeRegex(pkg)}": \\["${escapeRegex(pkg)}@([^"]+)"`, "g");
  return [...lockText.matchAll(re)].map((m) => m[1]);
}

/**
 * A plain X.Y.Z triple, or null. Prerelease/build suffixes and any
 * non-numeric segment → null: a version the comparator cannot prove is
 * not floor-satisfying (fail closed — the honest-RED shape for a
 * missing or exotic resolution).
 */
export function parseSemverTriple(v: string): [number, number, number] | null {
  const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(v);
  if (!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

function compareTriples(
  a: [number, number, number],
  b: [number, number, number],
): number {
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] < b[i] ? -1 : 1;
  }
  return 0;
}

/**
 * True only when `resolved` is a provable X.Y.Z >= `floor` (also X.Y.Z).
 * Anything unparsable on either side → false (fail closed).
 */
export function satisfiesFloor(resolved: string, floor: string): boolean {
  const r = parseSemverTriple(resolved);
  const f = parseSemverTriple(floor);
  if (!r || !f) return false;
  return compareTriples(r, f) >= 0;
}
