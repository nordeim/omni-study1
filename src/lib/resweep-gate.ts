// ---------------------------------------------------------------------------
// The S96 resweep exit-gate seam. The reference-resweep script class
// (scripts/ref-resweep-sNN.mjs) prints a JSON verdict envelope but — through
// the s93/s94/s95 re-tags — never carried exit-code semantics: a FAILED
// sweep (ok:false) or a failed probe cleanup exited 0, so an
// exit-code-checking wrapper saw success (the s95 audit's L2, the exact
// consumer class the AR7 capture-gate hardening was restored for at S95/
// AV2). This seam is the machine-guard behind the gate the re-tags now
// import: 0 ONLY on a fully-green sweep (verdict ok AND probe cleanup ok —
// the catch-path envelope { ok: false, error } included).
//
// Pure function with an explicit envelope arg — never touches a process
// itself (scripts/ref-resweep-s96.mjs owns the wiring:
// `process.exitCode = resweepExitCode({ ...resultEnvelope, probeCleanup })`
// after the envelope print), so every leg is unit-pinnable
// (tests/resweep-gate.test.ts). The suite-verdict precedent: a
// script-behavior contract pinned at a pure src/lib seam.
// ---------------------------------------------------------------------------

/** The envelope shape the resweep finally-block prints. */
export interface ResweepEnvelope {
  ok: boolean;
  /** "ok" | "not-run (registration never reached)" | `delete answered NNN` | `delete threw …` */
  probeCleanup?: string;
  error?: string;
}

/**
 * The process exit code for a resweep run: 0 only when the verdict is ok
 * AND the probe cleanup answered ok (a leaked probe user is a failed run —
 * the S91/AR4 doctrine). Everything else — a failed invariant, the
 * catch-path envelope, a 500-answering delete, a thrown delete, or a run
 * that never reached registration (probeCleanup undefined) — exits 1.
 */
export function resweepExitCode(envelope: ResweepEnvelope): number {
  return envelope.ok && envelope.probeCleanup === "ok" ? 0 : 1;
}
