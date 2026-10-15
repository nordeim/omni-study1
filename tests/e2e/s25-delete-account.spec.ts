import { expect, test, type Page } from "@playwright/test";

// S25 pins — the account-deletion flow (docs/remediation-plan-session25.md):
//
// (1) THE ANON GATE: POST /api/auth/delete-account without a session →
//     401 JSON (the AP-67 explicit EMPTY storageState).
//
// (2) THE WRONG-PASSWORD REJECTION: a signed-in caller posting a wrong
//     password (+ the DELETE confirmation) → 400 "Your password is
//     incorrect." — the guard runs BEFORE any write (the stored hash and
//     the account are never touched: the demo user still signs in with
//     the original password afterwards).
//
// (3) THE WRONG-CONFIRMATION REJECTION: the correct password + a wrong
//     word → 400 with the schema's refine copy ("Type DELETE to
//     confirm.") — a half-confirmed delete never lands.
//
// (4) THE VALIDATION FAMILY: a short password → 400 (the register
//     policy, min 8 — ONE policy, no drift).
//
// (5) THE FULL DELETION JOURNEY (the fresh-user round-trip — the S17/S24
//     ONE-registration convention): register → verify (the surfaced code)
//     → sign in through the login UI → the Settings Profile tab renders
//     the pinned surfaces + the S24 Change password card + the Danger
//     zone card BELOW them → "Delete account…" reveals the confirmation
//     form → a wrong confirmation word → the early inline error → the
//     correct password + DELETE → submit → the redirect lands on
//     /login → the OLD credentials login answers 401 "Invalid email or
//     password" (the account is GONE — the uniform login error, no
//     enumeration signal) → the cleared session's /api/auth/me answers
//     401. The demo user is untouched by construction.
//
// Budgets (counted, documented): the suite's register/verify budgets were
// ALREADY at their 10/IP/15-min caps before this spec — the S24-documented
// count (~8 + 1 = 9/10) was off by two (S9 registers 2, not 1; s16-perf-
// parity also registers 1): the real pre-S25 count was 10/10, so an 11th
// same-IP registration would 429. This spec's fresh user therefore arrives
// from a DISTINCT client IP (x-forwarded-for: 192.0.2.25 — the RFC 5737
// TEST-NET range, never a real client): behind a proxy that is exactly the
// production reality (distinct users, distinct IPs); the loopback pile-up
// is a suite artifact, not a product constraint. No production change, no
// prior pin touched, the limiter logic itself stays pinned by the existing
// 429 specs. 4 delete-account POSTs (3 on the demo user — all rejected
// pre-write — + 1 on the fresh user; well under the 10/15-min per-user
// budget; no other spec POSTs the route); ONE failed login probe
// (post-deletion 401 — successful logins RESET the IP limiter, so the
// login budget is unaffected).

const hydrated = (page: Page) =>
  page.waitForFunction(() => document.documentElement.style.getPropertyValue("--sf-primary") !== "");

/** Registers a throwaway user inside THIS test's context (the S17 pattern:
 *  register + verify with the surfaced code — no SMTP by design). The two
 *  POSTs ride a DISTINCT client IP (RFC 5737 TEST-NET) — the suite's
 *  register/verify budgets were already at their 10/IP caps (the corrected
 *  count above); a second client is the production-realistic condition. */
const PROBE_IP = "192.0.2.25";

async function registerFreshUser(page: Page, salt: string): Promise<string> {
  const email = `s25-${salt}-${Date.now()}@studyflow.app`;
  const res = await page.request.post("/api/auth/register", {
    headers: { "x-forwarded-for": PROBE_IP },
    data: { email, password: "Fresh1234!", name: "S25 Probe" },
  });
  expect(res.ok(), `register failed: ${res.status()}`).toBe(true);
  const body = (await res.json()) as { code: string };
  const verify = await page.request.post("/api/auth/verify-email", {
    headers: { "x-forwarded-for": PROBE_IP },
    data: { email, code: body.code },
  });
  expect(verify.ok(), `verify failed: ${verify.status()}`).toBe(true);
  return email;
}

test.describe("S25 the account-deletion flow — the guards (shared demo session)", () => {
  test.use({ storageState: "tests/e2e/.auth/user.json" });

  test("the anon gate: 401 JSON for anonymous callers", async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const res = await ctx.request.post("/api/auth/delete-account", {
      data: { password: "Demo1234!", confirmation: "DELETE" },
    });
    expect(res.status()).toBe(401);
    expect(((await res.json()) as { error: string }).error).toContain("Authentication required");
    await ctx.close();
  });

  test("the wrong-password rejection: 400 pre-write (the demo account untouched)", async ({ request }) => {
    const res = await request.post("/api/auth/delete-account", {
      data: { password: "WrongPass999!", confirmation: "DELETE" },
    });
    expect(res.status()).toBe(400);
    expect(((await res.json()) as { error: string }).error).toBe("Your password is incorrect.");

    // The guard ran BEFORE any write — the demo user still signs in.
    const login = await request.post("/api/auth/login", {
      data: { email: "demo@studyflow.app", password: "Demo1234!" },
    });
    expect(login.status()).toBe(200);
  });

  test("the wrong-confirmation rejection: 400 with the refine copy", async ({ request }) => {
    const res = await request.post("/api/auth/delete-account", {
      data: { password: "Demo1234!", confirmation: "delete" },
    });
    expect(res.status()).toBe(400);
    expect(((await res.json()) as { error: string }).error).toBe("Type DELETE to confirm.");
  });

  test("the validation family: a short password → 400 (the register policy)", async ({ request }) => {
    const res = await request.post("/api/auth/delete-account", {
      data: { password: "short", confirmation: "DELETE" },
    });
    expect(res.status()).toBe(400);
  });
});

test.describe("S25 the account-deletion flow — the deletion round-trip (fresh user)", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("register → sign in → the panel deletes → redirect → login 401, me 401", async ({ page }) => {
    const email = await registerFreshUser(page, "exit");

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

    // …the S24 Change password card still renders…
    await expect(page.locator('section[aria-label="Change password"]')).toBeVisible();

    // …and the Danger zone card renders BELOW them (the additive-below
    // pattern — the S23/S24 card chain).
    const card = page.locator('section[aria-label="Danger zone"]');
    await expect(card).toBeVisible();
    await expect(card.getByText(/permanently delete your account/i)).toBeVisible();

    // The form is HIDDEN until "Delete account…" reveals it (the two-step
    // reveal — the accidental-Enter guardrail).
    await expect(card.getByLabel("Password")).toHaveCount(0);
    await card.getByRole("button", { name: /delete account…/i }).click();
    await expect(card.getByLabel("Password")).toBeVisible();
    await expect(card.getByLabel("Confirmation")).toBeVisible();
    await expect(card.getByPlaceholder("Type DELETE")).toBeVisible();
    await expect(card.getByRole("button", { name: /permanently delete my account/i })).toBeVisible();
    await expect(card.getByRole("button", { name: /cancel/i })).toBeVisible();

    // The early inline error: a wrong confirmation word never sends a request.
    await card.getByLabel("Password").fill("Fresh1234!");
    await card.getByLabel("Confirmation").fill("remove");
    await card.getByRole("button", { name: /permanently delete my account/i }).click();
    await expect(card.getByRole("alert")).toContainText(/Type DELETE to confirm/i);

    // The correct submission → the account deleted → the redirect to /login.
    await card.getByLabel("Confirmation").fill("DELETE");
    await card.getByRole("button", { name: /permanently delete my account/i }).click();
    await page.waitForURL(/\/login$/, { timeout: 30000 });

    // The session cookie died with the account (the route cleared it).
    const me = await page.request.get("/api/auth/me");
    expect(me.status()).toBe(401);

    // The OLD credentials no longer sign in (the uniform login error — no
    // enumeration signal: unknown email == wrong password); a session-free
    // context so the cookie never rides.
    const ctx = await page.context();
    const oldLogin = await ctx.request.post("/api/auth/login", {
      data: { email, password: "Fresh1234!" },
    });
    expect(oldLogin.status()).toBe(401);
    expect(((await oldLogin.json()) as { error: string }).error).toBe("Invalid email or password");
  });
});
