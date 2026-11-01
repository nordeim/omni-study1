import { describe, expect, it } from "vitest";

import { shouldSeedDemo } from "@/lib/env-check";

// S120/BU21 — the demo-seed gate. The documented Docker first-run (`init`
// profile) seeds demo@studyflow.app / Demo1234! (emailVerified: true) into
// the production /data volume with no off-switch — an operator following
// DEPLOYMENT.md ships a live public-credentials login. The gate: SEED_DEMO
// honors an explicit off ("0"/"false", case-insensitive); unset or empty
// keeps the default ON (every documented flow — the dev quickstart, the
// e2e global-setup, the Docker init profile — unchanged). The contract is
// FAIL-SAFE: any unrecognized value is treated as OFF (a typo never ships
// the public-credentials account).
describe("shouldSeedDemo (S120/BU21)", () => {
  it("unset → ON (the documented default — dev quickstart, e2e global-setup, Docker init)", () => {
    expect(shouldSeedDemo({})).toBe(true);
  });

  it("empty string → ON (the .env.example placeholder posture)", () => {
    expect(shouldSeedDemo({ SEED_DEMO: "" })).toBe(true);
  });

  it("SEED_DEMO=1 / true (case-insensitive) → ON (the explicit opt-in)", () => {
    expect(shouldSeedDemo({ SEED_DEMO: "1" })).toBe(true);
    expect(shouldSeedDemo({ SEED_DEMO: "true" })).toBe(true);
    expect(shouldSeedDemo({ SEED_DEMO: "TRUE" })).toBe(true);
  });

  it("SEED_DEMO=0 / false / no (case-insensitive) → OFF (the documented off-switch)", () => {
    expect(shouldSeedDemo({ SEED_DEMO: "0" })).toBe(false);
    expect(shouldSeedDemo({ SEED_DEMO: "false" })).toBe(false);
    expect(shouldSeedDemo({ SEED_DEMO: "FALSE" })).toBe(false);
    expect(shouldSeedDemo({ SEED_DEMO: "no" })).toBe(false);
  });

  it("an unrecognized value → OFF (fail-safe: a typo never ships the public-credentials account)", () => {
    expect(shouldSeedDemo({ SEED_DEMO: "off" })).toBe(false);
    expect(shouldSeedDemo({ SEED_DEMO: "yes please" })).toBe(false);
    expect(shouldSeedDemo({ SEED_DEMO: "2" })).toBe(false);
  });
});
