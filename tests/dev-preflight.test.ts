import { describe, expect, it } from "vitest";

import {
  classifyBootStability,
  NAV_LOOP_THRESHOLD,
} from "@/lib/dev-preflight";

// The S31 dev-server boot-stability seam: the browser-context audits assume
// a hydrated, navigation-stable dev server as a PRECONDITION; when a stale
// Turbopack `.next/dev` cache puts a route into a full-page reload loop the
// audits fail OPAQUELY (a 30 s click timeout that names the symptom — a
// disabled button — not the cause). This seam classifies the measured boot
// signals into the honest verdict + remedy (the S27 doctrine: loud
// failures, self-describing output; the S28 doctrine: the louder finding
// wins). Pure function, explicit args (never touches a browser itself —
// scripts/dev-server-preflight.mjs owns the measurement), so every
// precedence pair and boundary is pinnable.

describe("classifyBootStability", () => {
  // ---- the healthy family ---------------------------------------------------

  it("is GREEN when the server is reachable, navigation-stable, and hydrated", () => {
    const r = classifyBootStability({ reachable: true, navigations: 0, hydrated: true });
    expect(r.verdict).toBe("green");
    expect(r.remedy).toBeNull();
  });

  it("is GREEN at the navigation boundary minus one (legit HMR full-reloads tolerated)", () => {
    // A first-compile may legitimately full-reload once or twice; the
    // threshold sits above that with margin.
    const r = classifyBootStability({ reachable: true, navigations: NAV_LOOP_THRESHOLD - 1, hydrated: true });
    expect(r.verdict).toBe("green");
  });

  // ---- the reload-loop family (the captured failure state) ------------------

  it("is RELOAD-LOOP at the navigation threshold (the boundary pin)", () => {
    const r = classifyBootStability({ reachable: true, navigations: NAV_LOOP_THRESHOLD, hydrated: false });
    expect(r.verdict).toBe("reload-loop");
  });

  it("is RELOAD-LOOP well inside the captured failure state (17 navs / 15 s)", () => {
    const r = classifyBootStability({ reachable: true, navigations: 17, hydrated: false });
    expect(r.verdict).toBe("reload-loop");
  });

  it("gives the reload-loop remedy the full cache-clear sequence (the S9-lesson extension)", () => {
    const r = classifyBootStability({ reachable: true, navigations: 17, hydrated: false });
    expect(r.remedy).toContain(".next/dev");
    expect(r.remedy).toContain("rm -rf");
  });

  it("RELOAD-LOOP beats a mid-window hydration reading (a page that keeps reloading is not stable)", () => {
    const r = classifyBootStability({ reachable: true, navigations: 8, hydrated: true });
    expect(r.verdict).toBe("reload-loop");
  });

  it("RELOAD-LOOP beats no-hydration (the loop is the louder, more actionable diagnosis)", () => {
    // A looping page also never hydrates — both signals fire; the loop
    // names the actual cause and the actual remedy.
    const r = classifyBootStability({ reachable: true, navigations: 6, hydrated: false });
    expect(r.verdict).toBe("reload-loop");
    expect(r.remedy).toContain(".next/dev");
  });

  // ---- the no-hydration family (the S9 silent class) ------------------------

  it("is NO-HYDRATION when navigation-stable but React never attached", () => {
    const r = classifyBootStability({ reachable: true, navigations: 0, hydrated: false });
    expect(r.verdict).toBe("no-hydration");
    // The staged remedy: retry (slow first compile) → restart → cache clear.
    expect(r.remedy).toContain("retry");
  });

  it("is NO-HYDRATION below the loop threshold even without hydration (4 navs alone is not a loop)", () => {
    const r = classifyBootStability({ reachable: true, navigations: 4, hydrated: false });
    expect(r.verdict).toBe("no-hydration");
  });

  // ---- the unreachable family (the honest dead-server diagnosis) ------------

  it("is UNREACHABLE and beats every other signal (no measurement is possible)", () => {
    const r = classifyBootStability({ reachable: false, navigations: 9, hydrated: true });
    expect(r.verdict).toBe("unreachable");
  });

  it("gives UNREACHABLE the start-the-server remedy, NOT the cache clear (honest diagnosis)", () => {
    const r = classifyBootStability({ reachable: false, navigations: 0, hydrated: false });
    expect(r.remedy).toContain("bun run dev");
    expect(r.remedy).not.toContain(".next/dev");
  });
});
