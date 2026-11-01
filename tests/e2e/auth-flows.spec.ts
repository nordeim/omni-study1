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

  // S120/BU14 — the uniform register status. The shipped route split its
  // response shapes by account state (existing-verified → 200 {ok} no code;
  // existing-unverified → 200 {ok, code}; new → 201 {ok, code}) — the
  // 201-vs-200 split and the code-presence split each distinguished
  // account states, contradicting the family's own no-enumeration
  // discipline (login answers a uniform 401). The fix: every branch
  // answers 200 (the code presence stays the documented self-hosted
  // delivery — gated OFF in hardened deployments by DISABLE_IN_APP_OTP).
  test("S120/BU14: register answers the SAME 200 status for a new and a re-registered account", async ({ page }) => {
    const ip = { "x-forwarded-for": "192.0.2.121" };
    const email = `s120-bu14-${Date.now()}@studyflow.app`;
    const first = await page.request.post("/api/auth/register", {
      headers: ip,
      data: { email, password: "Fresh1234!", name: "BU14 Probe" },
    });
    expect(first.status()).toBe(200); // was 201 — the split closed
    const second = await page.request.post("/api/auth/register", {
      headers: ip,
      data: { email, password: "Other1234!", name: "BU14 Probe" },
    });
    expect(second.status()).toBe(200);
    // The re-register still re-issues the code (the S25/S26 flow's own
    // contract — the shape is uniform, the delivery is not gated here).
    const body = (await second.json()) as { ok: boolean; code?: string };
    expect(body.ok).toBe(true);
    expect(typeof body.code).toBe("string");
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

  // S122/BW9 — the OTP paste distributes across the boxes. The pre-fix
  // setBox took `value.replace(/\D/g,"").slice(-1)`: a pasted 6-digit code
  // landed as ONE character in the focused box (browsers clip a paste to
  // maxLength=1) — yet the code is surfaced right above the input (the
  // in-band delivery), so paste is the dominant entry path. The fix
  // distributes the clipboard digits left-to-right from the focused box.
  // Superset (invisible statically — the reference has no such handler).
  test("S122/BW9: pasting the 6-digit code fills all six boxes", async ({ page }) => {
    const email = `e2e-paste-${Date.now()}@example.com`;
    await page.goto("/login");
    await page.getByRole("button", { name: /sign up/i }).click();
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
    await page.getByLabel("Confirm Password").fill(PASSWORD);
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page.getByRole("heading", { name: "Verify your email" })).toBeVisible();
    const note = page.getByText(/your code is/);
    await expect(note).toBeVisible();
    const code = ((await note.textContent()) ?? "").match(/\d{6}/)![0]!;

    const boxes = page.locator("input[inputmode=numeric]");
    await boxes.first().click();
    // A real clipboard paste into the focused box.
    await boxes.first().evaluate((el, text) => {
      const dt = new DataTransfer();
      dt.setData("text/plain", text);
      el.dispatchEvent(
        new ClipboardEvent("paste", { clipboardData: dt, bubbles: true, cancelable: true }),
      );
    }, code);

    for (let i = 0; i < 6; i++) {
      await expect(boxes.nth(i)).toHaveValue(code.charAt(i));
    }

    // The distributed code verifies (the paste carried the REAL code).
    await page.getByRole("button", { name: /verify email/i }).click();
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
    // S118/BS1 — capture the PRE-RESET session cookie (verify signs the
    // fresh account in): the reset below must REVOKE it (the sessionVersion
    // bump) — replayed after the reset it must 401.
    const cookies = await page.context().cookies();
    const preReset = cookies.find((c) => c.name === "sf_session");
    expect(preReset?.value).toBeTruthy();
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
    // S120/BU17d re-anchor: the reset SUCCESS rides the status channel
    // (role="status", the emerald InlineStatus) — it rode the red
    // role="alert" error channel since S15; a success is a status, not an
    // alert, for assistive tech.
    await expect(page.locator("div.shadow-2xl").getByRole("status")).toContainText(
      "Password reset successfully. Sign in with your new password.",
    );

    // S118/BS1 — the pre-reset session is REVOKED: replaying the captured
    // cookie against /api/auth/me must 401 (the reset's sessionVersion bump
    // — the canonical compromise-recovery contract).
    const meWithOldCookie = await page.request.get("/api/auth/me", {
      headers: { cookie: `sf_session=${preReset!.value}` },
    });
    expect(meWithOldCookie.status()).toBe(401);

    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Password", { exact: true }).fill(newPassword);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page.getByRole("heading", { name: /Good (morning|afternoon|evening|night)/ })).toBeVisible({
      timeout: 20000,
    });
  });

  // S119/BT3 — the reset token's single-use consumption is CONDITIONAL.
  // The pre-S119 shape read usedAt BEFORE the transaction and consumed
  // unconditionally inside it: two concurrent replays both passed the
  // pre-check (the ~50-100ms scrypt window between the findUnique and the
  // commit) and BOTH committed — {200, 200}. The conditional updateMany
  // (`usedAt: null AND expiresAt > now` inside the transaction) makes
  // exactly one win; the loser reads count 0 and takes the invalid-token
  // 400. API-level on a fresh TEST-NET user (192.0.2.119) so the loopback
  // register budget and the journey's own budgets are untouched.
  test("S119/BT3: a concurrent reset-token replay pair yields exactly {200, 400}", async ({ page }) => {
    const ip = { "x-forwarded-for": "192.0.2.119" };
    const email = `s119-bt3-${Date.now()}@studyflow.app`;
    const reg = await page.request.post("/api/auth/register", {
      headers: ip,
      data: { email, password: "Fresh1234!", name: "BT3 Probe" },
    });
    expect(reg.ok()).toBe(true);
    const { code } = (await reg.json()) as { code: string };
    const verify = await page.request.post("/api/auth/verify-email", {
      headers: ip,
      data: { email, code },
    });
    expect(verify.ok()).toBe(true);

    // The self-hosted delivery: the forgot response IS the link.
    const forgot = await page.request.post("/api/auth/forgot-password", {
      headers: ip,
      data: { email },
    });
    expect(forgot.ok()).toBe(true);
    const { resetUrl } = (await forgot.json()) as { resetUrl: string };
    const token = new URL(resetUrl).searchParams.get("token");
    expect(token).toBeTruthy();

    // THE PAIR: two simultaneous POSTs of the same token. Pre-fix both
    // pass the pre-check and both commit ({200, 200}); post-fix exactly
    // one consumption wins.
    const newPassword = "PairPass123!";
    const [a, b] = await Promise.all([
      page.request.post("/api/auth/reset-password", {
        headers: ip,
        data: { token, password: newPassword },
      }),
      page.request.post("/api/auth/reset-password", {
        headers: ip,
        data: { token, password: newPassword },
      }),
    ]);
    expect([a.status(), b.status()].sort()).toEqual([200, 400]);

    // The winner's password signs in (the reset landed exactly once) and
    // a THIRD sequential replay is the plain invalid-token 400.
    const login = await page.request.post("/api/auth/login", {
      headers: ip,
      data: { email, password: newPassword },
    });
    expect(login.ok()).toBe(true);
    const replay = await page.request.post("/api/auth/reset-password", {
      headers: ip,
      data: { token, password: newPassword },
    });
    expect(replay.status()).toBe(400);
  });

  // S121/BV6 — the re-register password refresh.
  //
  // The existing-unverified branch re-issued the code but kept the FIRST
  // registration's passwordHash/fullName: a user who re-registered with a
  // different password, verified, then signed in with the password they
  // last typed got a 401 and had to run forgot-password. The fix: the
  // re-typed values win on re-register.
  test("S121/BV6: a re-registered UNVERIFIED account signs in with the NEWLY typed password", async ({ page }) => {
    const ip = { "x-forwarded-for": "192.0.2.121" };
    const email = `s121-bv6-${Date.now()}@studyflow.app`;
    const first = await page.request.post("/api/auth/register", {
      headers: ip,
      data: { email, password: "First1234!", name: "BV6 Probe" },
    });
    expect(first.ok()).toBe(true);
    // The re-register with a DIFFERENT password (the BU14 shape — 200 + code).
    const second = await page.request.post("/api/auth/register", {
      headers: ip,
      data: { email, password: "Second1234!", name: "BV6 Renamed" },
    });
    expect(second.ok()).toBe(true);
    const { code } = (await second.json()) as { code: string };
    // Verify with the re-issued code.
    const verify = await page.request.post("/api/auth/verify-email", {
      headers: ip,
      data: { email, code },
    });
    expect(verify.ok()).toBe(true);
    // The NEWLY typed password signs in (pre-fix: 401 — the FIRST hash won).
    const loginNew = await page.request.post("/api/auth/login", {
      headers: ip,
      data: { email, password: "Second1234!" },
    });
    expect(loginNew.ok()).toBe(true);
    // The FIRST password is dead.
    const loginOld = await page.request.post("/api/auth/login", {
      headers: ip,
      data: { email, password: "First1234!" },
    });
    expect(loginOld.status()).toBe(401);
  });

  // S121/BV11a — the OTP's conditional single-use consumption.
  //
  // The shipped verify-email read the token (findFirst) THEN transacted an
  // unconditional deleteMany — two concurrent replays of a valid code both
  // passed the read and BOTH got sessions (the BT3 reset-token class, the
  // ~100ms window). The fix is the BT3 shape applied to the OTP family: the
  // conditional deleteMany (code + unexpired in the WHERE) is the consume.
  test("S121/BV11a: a concurrent verify-code replay pair yields exactly {200, 400}", async ({ page }) => {
    const ip = { "x-forwarded-for": "192.0.2.121" };
    const email = `s121-bv11-${Date.now()}@studyflow.app`;
    const reg = await page.request.post("/api/auth/register", {
      headers: ip,
      data: { email, password: "Fresh1234!", name: "BV11 Probe" },
    });
    expect(reg.ok()).toBe(true);
    const { code } = (await reg.json()) as { code: string };
    // THE PAIR: two simultaneous verify POSTs of the same code. Pre-fix
    // both read the live token and both transact ({200, 200}); post-fix
    // exactly one consumption wins.
    const [a, b] = await Promise.all([
      page.request.post("/api/auth/verify-email", { headers: ip, data: { email, code } }),
      page.request.post("/api/auth/verify-email", { headers: ip, data: { email, code } }),
    ]);
    expect([a.status(), b.status()].sort()).toEqual([200, 400]);
    // A THIRD sequential replay is the plain invalid-code 400 (the winner
    // consumed it; the loser's 400 already proved the same).
    const replay = await page.request.post("/api/auth/verify-email", {
      headers: ip,
      data: { email, code },
    });
    expect(replay.status()).toBe(400);
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

  test("verify-email is rate-limited: the 21st attempt from one IP 429s (S117/BR2)", async ({
    request,
  }) => {
    // The OTP brute-force gate: the 6-digit code space is small and a
    // successful verify SIGNS THE CALLER IN — pre-S117 the route had no
    // limiter at all. The 20/15-min per-IP budget mirrors the login route's
    // limiter-before-validation convention (invalid payloads consume
    // budget). The 21 attempts ride a DISTINCT client IP (x-forwarded-for:
    // 192.0.2.117 — the RFC 5737 TEST-NET range, the documented s25
    // technique) so the localhost verify budget that the other specs'
    // register→verify journeys share is never touched.
    const headers = { "x-forwarded-for": "192.0.2.117" };
    const body = { email: "s117-no-such-user@example.com", code: "000000" };

    for (let i = 0; i < 20; i++) {
      const res = await request.post("/api/auth/verify-email", { headers, data: body });
      // Uniform rejection (no account-state oracle) — but never 429 for the
      // first 20: the budget is consumed, not exceeded.
      expect(res.status()).toBe(400);
    }

    const blocked = await request.post("/api/auth/verify-email", { headers, data: body });
    expect(blocked.status()).toBe(429);
    const blockedBody = (await blocked.json()) as { error: string };
    expect(blockedBody.error).toContain("Too many verification attempts");
    const retryAfter = blocked.headers()["retry-after"];
    expect(retryAfter).toBeTruthy();
    expect(Number(retryAfter)).toBeGreaterThan(0);
  });

  test("an oversized JSON body is rejected before the read (S118/BS2)", async ({ request }) => {
    // The shared readJson cap (10 MiB): an 11 MiB login POST answers the
    // actionable 400 from the DECLARED Content-Length check — BEFORE the
    // body is read (bounded memory), and before any validation. The error
    // copy distinguishes the cap from the schema's own rejection.
    const big = { email: `x@${"y".repeat(11 * 1024 * 1024)}.com`, password: "Whatever123!" };
    const res = await request.post("/api/auth/login", { data: big });
    expect(res.status()).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toContain("too large");
  });
});

// S123/BX2 — the per-account OTP attempt cap. The verify route's only
// brake was the per-IP limiter (20/15-min), whose key is client-forgeable
// in the default TRUSTED_PROXY_HOPS-unset posture (a forged
// x-forwarded-for mints a fresh key per request). The code space is 10^6,
// the TTL 15 minutes, and a correct guess SIGNS THE CALLER IN. The route
// now carries a per-USER budget (10/15-min) after the user lookup — and
// it answers the SAME uniform 400 when exhausted (never a distinguishable
// 429: a per-account 429 would be a WORSE enumeration oracle than the
// guessing surface it closes). Fresh TEST-NET user + IP (192.0.2.123) so
// no shared budget is touched.
test.describe("S123/BX2: the per-account OTP attempt cap", () => {
  test("after 10 wrong codes the CORRECT code also fails (the uniform 400 lockout)", async ({ page }) => {
    const ip = { "x-forwarded-for": "192.0.2.123" };
    const email = `s123-bx2-${Date.now()}@studyflow.app`;
    const reg = await page.request.post("/api/auth/register", {
      headers: ip,
      data: { email, password: "Fresh1234!", name: "BX2 Probe" },
    });
    expect(reg.ok()).toBe(true);
    const { code } = (await reg.json()) as { code: string };
    expect(code).toBeTruthy();

    // Burn the per-account budget with 10 wrong codes (all uniform 400s —
    // the IP budget of 20 is not yet reached, so pre-fix these were the
    // ONLY gate and the correct code still worked).
    for (let i = 0; i < 10; i++) {
      const wrong = await page.request.post("/api/auth/verify-email", {
        headers: ip,
        data: { email, code: "000000" },
      });
      expect(wrong.status()).toBe(400);
    }

    // THE LOCKOUT: the CORRECT code must now fail — pre-fix this was 200
    // (the account verified + signed in).
    const correct = await page.request.post("/api/auth/verify-email", {
      headers: ip,
      data: { email, code },
    });
    expect(correct.status()).toBe(400);
    const body = (await correct.json()) as { error?: string };
    // The SAME uniform copy — no oracle, no new message shape.
    expect(body.error).toBe("That code is invalid or has expired.");
  });
});

// ---------------------------------------------------------------------------
// S126/CA11 · the reset screen without a token is not a dead end (the s126
// shell audit's A-L7): `view` initialized to "reset" whenever ?view=reset
// was present even WITHOUT a token — a permanently-disabled submit with no
// explanation (users whose email client stripped the query string), and a
// consumed token lingered in the URL after a successful reset. The fix: an
// InlineError names the problem when the token is missing.
// ---------------------------------------------------------------------------
test.describe("S126/CA11 · the reset screen explains a missing token", () => {
  test("/login?view=reset without a token renders the missing-link message (RED pre-fix: a bare disabled submit)", async ({ page }) => {
    await page.goto("/login?view=reset");
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByText(/missing its token/i),
    ).toBeVisible();
  });
});
