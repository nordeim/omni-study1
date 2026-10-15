import { expect, test, type Page } from "@playwright/test";

// S24 pins — the change-password flow (docs/remediation-plan-session24.md):
//
// (1) THE ANON GATE: POST /api/auth/change-password without a session →
//     401 JSON (the AP-67 explicit EMPTY storageState).
//
// (2) THE WRONG-CURRENT REJECTION: a signed-in caller posting a wrong
//     current password → 400 "Your current password is incorrect." — the
//     guard runs BEFORE any write (the stored hash is never touched: the
//     demo user still signs in with the original password afterwards).
//
// (3) THE SAME-PASSWORD REJECTION: current == new → 400 with the schema's
//     refine copy (a no-op rotation never lands).
//
// (4) THE VALIDATION FAMILY: a short new password → 400 (the register
//     policy, min 8 — ONE policy, no drift).
//
// (5) THE FULL ROTATION ROUND-TRIP (the fresh-user journey — the S17
//     ONE-registration convention): register → verify (the surfaced code) →
//     sign in through the login UI → the Settings Profile tab renders the
//     pinned surfaces + the Change password card BELOW them → a mismatched
//     confirm → the early inline error → the correct submission → the
//     success note (role="status") → the rotation verified through the
//     API: the session SURVIVES (/api/auth/me 200 — stateless HMAC), the
//     OLD password login answers 401 "Invalid email or password", the NEW
//     password login answers 200 (the demo user is untouched by
//     construction — the poisoned-record lesson designed out).
//
// Budgets (counted, documented): ONE fresh registration (≈9 of the
// 10/IP/15-min register budget — the suite's other specs spend ~8: S9
// registers 1 by API, S17 3 by API, auth-flows 4 through the UI); 4
// change-password POSTs (3 on the demo user, 1 on the fresh user — well
// under the 10/15-min per-user budget; no other spec POSTs the route); 2
// failed logins total (the old-password 401 probe — successful logins
// RESET the IP limiter, so the login budget is unaffected).

const hydrated = (page: Page) =>
  page.waitForFunction(() => document.documentElement.style.getPropertyValue("--sf-primary") !== "");

/** Registers a throwaway user inside THIS test's context (the S17 pattern:
 *  register + verify with the surfaced code — no SMTP by design). */
async function registerFreshUser(page: Page, salt: string): Promise<string> {
  const email = `s24-${salt}-${Date.now()}@studyflow.app`;
  const res = await page.request.post("/api/auth/register", {
    data: { email, password: "Fresh1234!", name: "S24 Probe" },
  });
  expect(res.ok(), `register failed: ${res.status()}`).toBe(true);
  const body = (await res.json()) as { code: string };
  const verify = await page.request.post("/api/auth/verify-email", {
    data: { email, code: body.code },
  });
  expect(verify.ok(), `verify failed: ${verify.status()}`).toBe(true);
  return email;
}

test.describe("S24 the change-password flow — the guards (shared demo session)", () => {
  test.use({ storageState: "tests/e2e/.auth/user.json" });

  test("the anon gate: 401 JSON for anonymous callers", async ({ browser }) => {
    // The AP-67 lesson: an explicit EMPTY storageState — browser.newContext()
    // inherits the describe-level one otherwise.
    const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await ctx.newPage();
    const res = await page.request.post("/api/auth/change-password", {
      data: { currentPassword: "Demo1234!", newPassword: "NewPass5678!" },
    });
    expect(res.status()).toBe(401);
    expect(((await res.json()) as { error: string }).error).toContain("Authentication required");
    await ctx.close();
  });

  test("the wrong-current rejection: 400 with the actionable copy, pre-write", async ({
    request,
    browser,
  }) => {
    // The signed-in demo session (the describe's storageState) POSTs a
    // wrong current password.
    const res = await request.post("/api/auth/change-password", {
      data: { currentPassword: "DefinitelyWrong99!", newPassword: "NewPass5678!" },
    });
    expect(res.status()).toBe(400);
    expect(((await res.json()) as { error: string }).error).toBe("Your current password is incorrect.");

    // The guard ran BEFORE any write: the demo user still signs in with the
    // original password (a session-free context — never the storageState).
    const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const probe = await ctx.newPage();
    const login = await probe.request.post("/api/auth/login", {
      data: { email: "demo@studyflow.app", password: "Demo1234!" },
    });
    expect(login.status()).toBe(200);
    await ctx.close();
  });

  test("the same-password rejection: 400 with the schema's refine copy", async ({ request }) => {
    const res = await request.post("/api/auth/change-password", {
      data: { currentPassword: "Demo1234!", newPassword: "Demo1234!" },
    });
    expect(res.status()).toBe(400);
    expect(((await res.json()) as { error: string }).error).toBe(
      "The new password must be different from your current password.",
    );
  });

  test("the validation family: a short new password → 400 (the register policy)", async ({ request }) => {
    const res = await request.post("/api/auth/change-password", {
      data: { currentPassword: "Demo1234!", newPassword: "short" },
    });
    expect(res.status()).toBe(400);
  });
});

test.describe("S24 the change-password flow — the rotation round-trip (fresh user)", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("register → sign in → the panel rotates → old login 401, new login 200", async ({ page }) => {
    const email = await registerFreshUser(page, "rotation");
    const newPassword = "Rotated5678!";

    // Sign in through the login UI (the panel journey needs the real shell).
    await page.goto("/login");
    await page.fill("input[type=email]", email);
    await page.fill("input[type=password]", "Fresh1234!");
    await page.click("button[type=submit]");
    await page.waitForFunction(() => document.querySelector("main") !== null, null, { timeout: 30000 });

    // The Settings Profile tab — the pinned surfaces still render FIRST…
    await page.goto("/Settings");
    await hydrated(page);
    await page.getByRole("tab", { name: /profile/i }).click();
    await expect(page.getByText("Your account and study information")).toBeVisible();
    await expect(page.getByLabel("School Name")).toBeVisible();
    await expect(page.getByRole("button", { name: /save profile/i })).toBeVisible();

    // …and the Change password card renders BELOW them (the additive-below
    // pattern — the S23 Restore card).
    const card = page.locator('section[aria-label="Change password"]');
    await expect(card).toBeVisible();
    await expect(card.getByLabel("Current password")).toBeVisible();
    // exact: "New password" is a substring of "Confirm new password" (the
    // substring-matching locator quirk — AGENTS.md Testing quirks).
    await expect(card.getByLabel("New password", { exact: true })).toBeVisible();
    await expect(card.getByLabel("Confirm new password")).toBeVisible();

    // The early inline error: a mismatched confirm never sends a request.
    await card.getByLabel("Current password").fill("Fresh1234!");
    await card.getByLabel("New password", { exact: true }).fill(newPassword);
    await card.getByLabel("Confirm new password").fill("Different9999!");
    await card.getByRole("button", { name: /update password/i }).click();
    await expect(card.getByRole("alert")).toContainText(/match/i);

    // The correct submission → the success note (role="status"), fields cleared.
    await card.getByLabel("Confirm new password").fill(newPassword);
    await card.getByRole("button", { name: /update password/i }).click();
    await expect(card.getByRole("status")).toContainText(/updated/i);
    await expect(card.getByLabel("Current password")).toHaveValue("");

    // The session SURVIVES the rotation (stateless HMAC — documented).
    const me = await page.request.get("/api/auth/me");
    expect(me.status()).toBe(200);

    // The OLD password no longer signs in (the uniform login error — no
    // enumeration signal); a session-free context so the cookie never rides.
    const ctx = await page.context();
    const oldLogin = await ctx.request.post("/api/auth/login", {
      data: { email, password: "Fresh1234!" },
    });
    expect(oldLogin.status()).toBe(401);
    expect(((await oldLogin.json()) as { error: string }).error).toBe("Invalid email or password");

    // The NEW password signs in (the rotation landed).
    const newLogin = await ctx.request.post("/api/auth/login", {
      data: { email, password: newPassword },
    });
    expect(newLogin.status()).toBe(200);
  });
});
