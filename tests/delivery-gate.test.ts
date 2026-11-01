// S120/BU2 — the in-band delivery off-switches (the production gate).
//
// The PAD §6.4 documents the in-response OTP/reset delivery posture with the
// reopen trigger "a multi-user deployment needs real mail transport +
// off-switches" — this seam IS that off-switch. When the gate is on, the
// auth routes omit the `code` / `resetPath` + `resetUrl` from their
// responses (the no-enumeration {ok:true} shape); unset keeps the shipped
// single-user dev/demo posture byte-identical (every existing pin rides).
import { describe, expect, it } from "vitest";

import { inAppDeliveryGates } from "@/lib/env-check";

describe("inAppDeliveryGates (S120/BU2)", () => {
  it("defaults to delivery ON for both kinds when the envs are unset", () => {
    expect(inAppDeliveryGates({})).toEqual({ otp: false, reset: false });
  });

  it("treats empty strings as unset (the .env.example placeholder shape)", () => {
    expect(
      inAppDeliveryGates({ DISABLE_IN_APP_OTP: "", DISABLE_IN_APP_RESET: "" }),
    ).toEqual({ otp: false, reset: false });
  });

  it("DISABLE_IN_APP_OTP=1 gates ONLY the otp kind", () => {
    expect(inAppDeliveryGates({ DISABLE_IN_APP_OTP: "1" })).toEqual({
      otp: true,
      reset: false,
    });
  });

  it("DISABLE_IN_APP_RESET=true gates ONLY the reset kind (case-insensitive)", () => {
    expect(inAppDeliveryGates({ DISABLE_IN_APP_RESET: "TRUE" })).toEqual({
      otp: false,
      reset: true,
    });
  });

  it("both envs gate both kinds", () => {
    expect(
      inAppDeliveryGates({ DISABLE_IN_APP_OTP: "1", DISABLE_IN_APP_RESET: "1" }),
    ).toEqual({ otp: true, reset: true });
  });

  it("an unparsable value is NOT a gate (only 1/true/falsey-off are meaningful)", () => {
    expect(inAppDeliveryGates({ DISABLE_IN_APP_OTP: "yes" })).toEqual({
      otp: false,
      reset: false,
    });
  });
});
