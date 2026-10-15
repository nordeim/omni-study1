import { expect, test } from "@playwright/test";

// S15 auth-flow depth pins — the reference-measured sub-screen family
// (docs/remediation-plan-session15.md): the signup form, the verify-email
// OTP screen (with the self-hosted code note — no SMTP in this app), the
// unverified login gate, and the forgot→check-email→reset journey.
// This file OPTS OUT of the shared storageState (empty cookies) like
// auth.spec.ts — it tests the logged-out surface. The whole file stays
// WELL under the login rate budget (10/IP/15 min): one 403 gate login and
// one successful reset login per run (success resets the budget).
test.use({ storageState: { cookies: [], origins: [] } });

const PASSWORD = "FlowPass1234!";

test.describe("S15 auth flows", () => {
  test("Sign up opens the reference's Create-your-account form", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /sign up/i }).click();
    await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();
    await expect(page.getByRole("button", { name: /back to sign in/i })).toBeVisible();
    await expect(page.getByLabel("Email", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Confirm Password")).toBeVisible();
    await expect(page.getByPlaceholder("Min. 8 characters")).toBeVisible();
    await expect(page.getByPlaceholder("Re-enter password")).toBeVisible();
    await expect(page.getByRole("button", { name: /create account/i })).toBeVisible();
    // The sub-screen REPLACES the brand block (measured: no h1/logo).
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(0);
  });

  test("register → verify OTP → signed in (the self-hosted code note)", async ({ page }) => {
    const email = `e2e-verify-${Date.now()}@example.com`;
    await page.goto("/login");
    await page.getByRole("button", { name: /sign up/i }).click();
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
    await page.getByLabel("Confirm Password").fill(PASSWORD);
    await page.getByRole("button", { name: /create account/i }).click();

    // The verify screen (measured shape): shield icon, h2, the email, six
    // numeric boxes (first = one-time-code), the surfaced code note.
    await expect(page.getByRole("heading", { name: "Verify your email" })).toBeVisible();
    await expect(page.getByText("We've sent a 6-digit code to")).toBeVisible();
    await expect(page.getByText(email)).toBeVisible();
    const boxes = page.locator("input[inputmode=numeric]");
    await expect(boxes).toHaveCount(6);
    await expect(boxes.first()).toHaveAttribute("autocomplete", "one-time-code");
    const note = page.getByText(/your code is/);
    await expect(note).toBeVisible();
    const code = ((await note.textContent()) ?? "").match(/\d{6}/)![0]!;

    for (let i = 0; i < 6; i++) {
      await boxes.nth(i).fill(code.charAt(i));
    }
    await page.getByRole("button", { name: /verify email/i }).click();
    // Verified = signed in: the app shell renders.
    await expect(page.getByRole("heading", { name: /Good (morning|afternoon|evening|night)/ })).toBeVisible({
      timeout: 20000,
    });
  });

  test("unverified accounts are gated at login with the reference copy", async ({ page }) => {
    const email = `e2e-gate-${Date.now()}@example.com`;
    // Register WITHOUT verifying.
    await page.goto("/login");
    await page.getByRole("button", { name: /sign up/i }).click();
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
    await page.getByLabel("Confirm Password").fill(PASSWORD);
    await page.getByRole("button", { name: /create account/i }).click();
    await expect(page.getByRole("heading", { name: "Verify your email" })).toBeVisible();
    await page.getByRole("button", { name: /back to sign in/i }).click();

    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();

    // Scoped to the auth card — Next's route announcer also uses role=alert.
    const alert = page.locator("div.shadow-2xl").getByRole("alert");
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(
      "Please verify your email before logging in. Check your email for the verification code.",
    );
    await expect(page).toHaveURL(/\/login/);
  });

  test("forgot → check-email → reset link → new password → sign in", async ({ page }) => {
    const email = `e2e-reset-${Date.now()}@example.com`;
    const newPassword = "NewFlowPass123!";
    // Create + verify an account (so the reset target exists and the demo
    // password is never touched).
    await page.goto("/login");
    await page.getByRole("button", { name: /sign up/i }).click();
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
    await page.getByLabel("Confirm Password").fill(PASSWORD);
    await page.getByRole("button", { name: /create account/i }).click();
    const note = page.getByText(/your code is/);
    await expect(note).toBeVisible();
    const code = ((await note.textContent()) ?? "").match(/\d{6}/)![0]!;
    const boxes = page.locator("input[inputmode=numeric]");
    for (let i = 0; i < 6; i++) {
      await boxes.nth(i).fill(code.charAt(i));
    }
    await page.getByRole("button", { name: /verify email/i }).click();
    await expect(page.getByRole("heading", { name: /Good (morning|afternoon|evening|night)/ })).toBeVisible({
      timeout: 20000,
    });
    await page.context().clearCookies();

    // The forgot flow (measured): Reset your password → Send reset link.
    await page.goto("/login");
    await page.getByRole("button", { name: /forgot password/i }).click();
    await expect(page.getByRole("heading", { name: "Reset your password" })).toBeVisible();
    await expect(
      page.getByText("Enter your email and we'll send you a link to reset your password"),
    ).toBeVisible();
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByRole("button", { name: /send reset link/i }).click();

    // Check your email (measured): green alert + full-width Back.
    await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();
    const alert = page.locator("div.shadow-2xl").getByRole("alert");
    await expect(alert).toContainText(
      "Please check your email for the password reset link. It may take a few minutes to arrive.",
    );

    // The self-hosted reset link (no SMTP — the response IS the delivery).
    const link = page.getByRole("link", { name: /open your reset link/i });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page.getByRole("heading", { name: "Reset your password" })).toBeVisible();

    await page.getByLabel("Password", { exact: true }).fill(newPassword);
    await page.getByLabel("Confirm Password").fill(newPassword);
    await page.getByRole("button", { name: /^Reset password$/i }).click();

    // Back at sign-in with the success note, then the new password works.
    await expect(page.getByRole("button", { name: "Sign in", exact: true })).toBeVisible();
    await expect(page.locator("div.shadow-2xl").getByRole("alert")).toContainText(
      "Password reset successfully. Sign in with your new password.",
    );
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Password", { exact: true }).fill(newPassword);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page.getByRole("heading", { name: /Good (morning|afternoon|evening|night)/ })).toBeVisible({
      timeout: 20000,
    });
  });

  test("the login card's chrome is unchanged in the sign-in state (byte-parity guard)", async ({ page }) => {
    // The S4-F pins that the S15 redesign had to preserve: the brand block
    // (h1 + subtitle + logo) and the Google + divider composition.
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Welcome to StudyFlow" })).toBeVisible();
    await expect(page.getByText("Sign in to continue")).toBeVisible();
    await expect(page.getByRole("button", { name: "Continue with Google" })).toBeVisible();
    const h1 = page.getByRole("heading", { name: /Welcome to StudyFlow/ });
    await expect(h1).toHaveCSS("font-size", "30px");
  });
});
