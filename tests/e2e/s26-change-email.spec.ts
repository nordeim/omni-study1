import { expect, test, type Page } from "@playwright/test";

// S26 pins — the email-change flow (docs/remediation-plan-session26.md):
//
// (1) THE ANON GATE: POST /api/auth/change-email without a session →
//     401 JSON (the AP-67 explicit EMPTY storageState).
//
// (2) THE WRONG-PASSWORD REJECTION: a signed-in caller posting a wrong
//     password → 400 "Your password is incorrect." — the guard runs
//     BEFORE any write (the demo user still signs in with the original
//     password afterwards — the S24/S25 pre-write proof).
//
// (3) THE MISMATCHED-CONFIRM REJECTION: valid password + a mismatched
//     confirm → 400 with the schema's refine copy (a half-confirmed
//     change never lands).
//
// (4) THE VALIDATION FAMILY: a short password → 400 (the register
//     policy, min 8 — ONE policy, no drift).
//
// (5) THE SAME-EMAIL REJECTION: posting the account's OWN address → 400
//     "This is already your email address." (a no-op change the user
//     thinks happened — the S24 must-differ posture, route-side).
//
// (6) THE DUPLICATE-EMAIL REJECTION: posting an address owned by ANY
//     existing account (a throwaway unverified registration) → 409 (the
//     register route's conflict family).
//
// (7) THE FULL CHANGE ROUND-TRIP (the fresh-user journey — the S17/S24/
//     S25 ONE-registration convention): register → verify (the surfaced
//     code) → sign in through the login UI → the Settings Profile tab
//     renders the pinned surfaces + the Email address card (below the
//     Profile card, above the S24 card) + the S24 Change password card +
//     the S25 Danger zone card → a mismatched confirm → the early inline
//     error → the correct submission → the success note (role="status")
//     → the identity block shows the NEW email (the live store update)
//     → the session SURVIVES (/api/auth/me 200 with the NEW email —
//     stateless HMAC) → the OLD email login answers 401 "Invalid email
//     or password" → the NEW email login answers 200 (the demo user is
//     untouched by construction — the poisoned-record lesson designed
//     out).
//
// Budgets (counted, AP-71-corrected): the suite's LOOPBACK register
// budget is 10/10 (parity-session9 2 + s16-perf-parity 1 + s17 3 +
// auth-flows 3 + s24 1; s25 rides 192.0.2.25). TWO new registrations,
// BOTH on DISTINCT client IPs (RFC 5737 TEST-NET): 192.0.2.26 for the
// 409 target, 192.0.2.27 for the fresh-user journey. 6 change-email
// POSTs on the demo user (all rejected pre-write) + 1 on the fresh user
// — under the 10/15-min per-user budget; no other spec POSTs the route.
// ONE failed login probe (the old-email 401 — successful logins RESET
// the IP limiter, so the login budget is unaffected).

const hydrated = (page: Page) =>
  page.waitForFunction(() => document.documentElement.style.getPropertyValue("--sf-primary") !== "");

/** Registers a throwaway user on a DISTINCT client IP (the AP-71
 *  technique — the loopback register budget is at its 10/IP cap). */
async function registerOnIp(page: Page, salt: string, ip: string): Promise<string> {
  const email = `s26-${salt}-${Date.now()}@studyflow.app`;
  const res = await page.request.post("/api/auth/register", {
    headers: { "x-forwarded-for": ip },
    data: { email, password: "Fresh1234!", name: "S26 Probe" },
  });
  expect(res.ok(), `register failed: ${res.status()}`).toBe(true);
  return email;
}

/** Registers + VERIFIES a throwaway (the surfaced code — no SMTP by
 *  design) on a DISTINCT client IP. */
async function registerVerifiedOnIp(page: Page, salt: string, ip: string): Promise<string> {
  const email = await registerOnIp(page, salt, ip);
  const reg = await page.request.post("/api/auth/register", {
    headers: { "x-forwarded-for": ip },
    data: { email, password: "Fresh1234!", name: "S26 Probe" },
  });
  const body = (await reg.json()) as { code: string };
  const verify = await page.request.post("/api/auth/verify-email", {
    headers: { "x-forwarded-for": ip },
    data: { email, code: body.code },
  });
  expect(verify.ok(), `verify failed: ${verify.status()}`).toBe(true);
  return email;
}

test.describe("S26 the email-change flow — the guards (shared demo session)", () => {
  test.use({ storageState: "tests/e2e/.auth/user.json" });

  test("the anon gate: 401 JSON for anonymous callers", async ({ browser }) => {
    // The AP-67 lesson: an explicit EMPTY storageState — browser.newContext()
    // inherits the describe-level one otherwise.
    const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const res = await ctx.request.post("/api/auth/change-email", {
      data: {
        password: "Demo1234!",
        newEmail: "newaddress@example.com",
        confirmEmail: "newaddress@example.com",
      },
    });
    expect(res.status()).toBe(401);
    expect(((await res.json()) as { error: string }).error).toContain("Authentication required");
    await ctx.close();
  });

  test("the wrong-password rejection: 400 pre-write (the demo account untouched)", async ({ request }) => {
    const res = await request.post("/api/auth/change-email", {
      data: {
        password: "WrongPass999!",
        newEmail: "newaddress@example.com",
        confirmEmail: "newaddress@example.com",
      },
    });
    expect(res.status()).toBe(400);
    expect(((await res.json()) as { error: string }).error).toBe("Your password is incorrect.");

    // The guard ran BEFORE any write — the demo user still signs in.
    const login = await request.post("/api/auth/login", {
      data: { email: "demo@studyflow.app", password: "Demo1234!" },
    });
    expect(login.status()).toBe(200);
  });

  test("the mismatched-confirm rejection: 400 with the refine copy", async ({ request }) => {
    const res = await request.post("/api/auth/change-email", {
      data: {
        password: "Demo1234!",
        newEmail: "newaddress@example.com",
        confirmEmail: "different@example.com",
      },
    });
    expect(res.status()).toBe(400);
    expect(((await res.json()) as { error: string }).error).toBe("The email addresses do not match.");
  });

  test("the validation family: a short password → 400 (the register policy)", async ({ request }) => {
    const res = await request.post("/api/auth/change-email", {
      data: {
        password: "short",
        newEmail: "newaddress@example.com",
        confirmEmail: "newaddress@example.com",
      },
    });
    expect(res.status()).toBe(400);
  });

  test("the same-email rejection: 400 (a no-op change never lands)", async ({ request }) => {
    const res = await request.post("/api/auth/change-email", {
      data: {
        password: "Demo1234!",
        newEmail: "demo@studyflow.app",
        confirmEmail: "demo@studyflow.app",
      },
    });
    expect(res.status()).toBe(400);
    expect(((await res.json()) as { error: string }).error).toBe("This is already your email address.");
  });

  test("the duplicate-email rejection: 409 (an address owned by any account)", async ({ page, request }) => {
    // A throwaway UNVERIFIED registration on a DISTINCT client IP (the
    // AP-71 technique — the loopback budget is at its 10/IP cap).
    const taken = await registerOnIp(page, "dup", "192.0.2.26");

    const res = await request.post("/api/auth/change-email", {
      data: {
        password: "Demo1234!",
        newEmail: taken,
        confirmEmail: taken,
      },
    });
    expect(res.status()).toBe(409);
    expect(((await res.json()) as { error: string }).error).toContain(
      "An account with this email already exists",
    );

    // The demo record is untouched — still signs in.
    const login = await request.post("/api/auth/login", {
      data: { email: "demo@studyflow.app", password: "Demo1234!" },
    });
    expect(login.status()).toBe(200);
  });
});

test.describe("S26 the email-change flow — the change round-trip (fresh user)", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("register → sign in → the panel changes the email → me 200 new email, old login 401", async ({ page }) => {
    const originalEmail = await registerVerifiedOnIp(page, "identity", "192.0.2.27");
    const newEmail = `s26-identity-new-${Date.now()}@studyflow.app`;

    // Sign in through the login UI (the panel journey needs the real shell).
    await page.goto("/login");
    await page.fill("input[type=email]", originalEmail);
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

    // …the Email address card renders (the S26 superset — below the Profile
    // card, above the S24 card: identity → security → destructive exit)…
    const card = page.locator('section[aria-label="Email address"]');
    await expect(card).toBeVisible();
    await expect(card.getByText(/update the address you use to sign in/i)).toBeVisible();
    await expect(card.getByLabel("New email", { exact: true })).toBeVisible();
    await expect(card.getByLabel("Confirm new email")).toBeVisible();
    await expect(card.getByLabel("Password")).toBeVisible();
    await expect(card.getByRole("button", { name: /update email address/i })).toBeVisible();

    // …and the S24/S25 cards still render (the additive chain intact).
    await expect(page.locator('section[aria-label="Change password"]')).toBeVisible();
    await expect(page.locator('section[aria-label="Danger zone"]')).toBeVisible();

    // The early inline error: a mismatched confirm never sends a request.
    await card.getByLabel("New email", { exact: true }).fill(newEmail);
    await card.getByLabel("Confirm new email").fill(`${newEmail}typo`);
    await card.getByLabel("Password").fill("Fresh1234!");
    await card.getByRole("button", { name: /update email address/i }).click();
    await expect(card.getByRole("alert")).toContainText(/email addresses do not match/i);

    // The correct submission → the success note + the identity block shows
    // the NEW email — the live theme-store update drives BOTH surfaces that
    // render the slice: the Profile tab's identity block AND the sidebar
    // footer's user line (scoped locators — the page-wide p filter resolves
    // to both and trips strict mode).
    await card.getByLabel("Confirm new email").fill(newEmail);
    await card.getByRole("button", { name: /update email address/i }).click();
    await expect(card.getByRole("status")).toContainText(/email address updated/i);
    await expect(
      page.getByRole("tabpanel", { name: "Profile" }).locator("p", { hasText: newEmail }),
    ).toBeVisible();
    await expect(
      page.getByRole("complementary").locator("p", { hasText: newEmail }),
    ).toBeVisible();

    // …the fields cleared after the success.
    await expect(card.getByLabel("New email", { exact: true })).toHaveValue("");

    // The SESSION SURVIVES the rotation (stateless HMAC over the user id)
    // and now reports the NEW email.
    const me = await page.request.get("/api/auth/me");
    expect(me.status()).toBe(200);
    expect(((await me.json()) as { user: { email: string } }).user.email).toBe(newEmail);

    // The OLD email no longer signs in (the uniform login error — no
    // enumeration signal); a session-free context so the cookie never rides.
    const ctx = await page.context();
    const oldLogin = await ctx.request.post("/api/auth/login", {
      data: { email: originalEmail, password: "Fresh1234!" },
    });
    expect(oldLogin.status()).toBe(401);
    expect(((await oldLogin.json()) as { error: string }).error).toBe("Invalid email or password");

    // The NEW email signs in with the SAME password (only the identity moved).
    const newLogin = await ctx.request.post("/api/auth/login", {
      data: { email: newEmail, password: "Fresh1234!" },
    });
    expect(newLogin.status()).toBe(200);
  });
});
