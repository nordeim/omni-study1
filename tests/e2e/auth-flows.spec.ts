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

    // Check your email (measured): green banner + full-width Back.
    // S129/CD6b: the banner is role="status" (the surface's success channel
    // — its InlineStatus; role="alert" is the ERROR channel). The pin's
    // text purpose is unchanged; the role follows the corrected semantics.
    await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();
    const alert = page.locator("div.shadow-2xl").getByRole("status");
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

  test("an oversized JSON body is rejected before the read (S118/BS2; status corrected 400→413 by S129/CD4)", async ({ request }) => {
    // The shared readJson cap (10 MiB): an 11 MiB login POST answers the
    // 413 from the DECLARED Content-Length check — BEFORE the body is read
    // (bounded memory), and before any validation. The error copy
    // distinguishes the cap from the schema's own rejection. (S129/CD4
    // corrected the status: the same fault answered 400 here but 413 on the
    // import route — 413 is the correct signal, and no retry fixes
    // too-large; the pin's bounded-memory PURPOSE is unchanged.)
    const big = { email: `x@${"y".repeat(11 * 1024 * 1024)}.com`, password: "Whatever123!" };
    const res = await request.post("/api/auth/login", { data: big });
    expect(res.status()).toBe(413);
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

// S127/CB12 — the login per-account budget (the s127 server audit's M-10,
// the BX2 doctrine applied to the credential exchange): login's only brake
// was the per-IP limiter, whose key is client-forgeable in the default
// TRUSTED_PROXY_HOPS-unset posture — while a correct password guess SIGNS
// THE CALLER IN. The route now checks `loginAcct:${user.id}` (10/15-min)
// when the account exists, BEFORE the scrypt burn; an exhausted bucket
// answers the SAME uniform 401 (never a distinguishable 429 — the same
// no-oracle discipline as BX2), and a successful sign-in resets BOTH
// buckets (the progressive model). The pins burn the account bucket from
// DISTINCT TEST-NET IPs so the per-IP limiter never fires first.
test.describe("S127/CB12: the per-account login attempt cap", () => {
  test("after 10 wrong passwords the CORRECT password also fails (the uniform 401 lockout)", async ({ page }) => {
    const email = `s127-cb12-${Date.now()}@studyflow.app`;
    const reg = await page.request.post("/api/auth/register", {
      headers: { "x-forwarded-for": "192.0.2.141" },
      data: { email, password: "Fresh1234!", name: "CB12 Lockout Probe" },
    });
    expect(reg.ok()).toBe(true);
    const { code } = (await reg.json()) as { code: string };
    const verify = await page.request.post("/api/auth/verify-email", {
      headers: { "x-forwarded-for": "192.0.2.141" },
      data: { email, code },
    });
    expect(verify.ok()).toBe(true);

    // Burn the ACCOUNT bucket with 10 wrong passwords, each from a
    // DISTINCT TEST-NET IP (the per-IP buckets stay at 1 charge each —
    // pre-fix these were the ONLY gate and the correct password worked).
    for (let i = 1; i <= 10; i++) {
      const wrong = await page.request.post("/api/auth/login", {
        headers: { "x-forwarded-for": `192.0.2.${150 + i}` },
        data: { email, password: "WrongPass123!" },
      });
      expect(wrong.status()).toBe(401);
    }

    // THE LOCKOUT: the CORRECT password must now fail with the SAME
    // uniform 401 — pre-fix this was 200 (signed in).
    const correct = await page.request.post("/api/auth/login", {
      headers: { "x-forwarded-for": "192.0.2.170" },
      data: { email, password: "Fresh1234!" },
    });
    expect(correct.status()).toBe(401);
    const body = (await correct.json()) as { error?: string };
    // The SAME uniform copy — no oracle, no new message shape.
    expect(body.error).toBe("Invalid email or password");
  });

  test("a successful sign-in resets the account bucket (the progressive model)", async ({ page }) => {
    const email = `s127-cb12r-${Date.now()}@studyflow.app`;
    const reg = await page.request.post("/api/auth/register", {
      headers: { "x-forwarded-for": "192.0.2.171" },
      data: { email, password: "Fresh1234!", name: "CB12 Reset Probe" },
    });
    expect(reg.ok()).toBe(true);
    const { code } = (await reg.json()) as { code: string };
    const verify = await page.request.post("/api/auth/verify-email", {
      headers: { "x-forwarded-for": "192.0.2.171" },
      data: { email, code },
    });
    expect(verify.ok()).toBe(true);

    // 5 wrong → a CORRECT sign-in resets → 5 wrong again → still able to
    // sign in (post-fix the reset keeps legitimate users forever
    // unlocked — the progressive model).
    for (let round = 0; round < 2; round++) {
      for (let i = 1; i <= 5; i++) {
        const wrong = await page.request.post("/api/auth/login", {
          headers: { "x-forwarded-for": `192.0.2.${180 + round * 10 + i}` },
          data: { email, password: "WrongPass123!" },
        });
        expect(wrong.status()).toBe(401);
      }
      const ok = await page.request.post("/api/auth/login", {
        headers: { "x-forwarded-for": `192.0.2.${200 + round}` },
        data: { email, password: "Fresh1234!" },
      });
      expect(ok.status()).toBe(200);
    }
  });
});

// ---------------------------------------------------------------------------
// S129/CD6a — the /reset-password route defaults to the reset view (the
// s129 shell audit's A-L2): the initial view keyed ONLY on query params, so
// a user whose email client stripped the token off
// /reset-password?token=… landed on the SIGN-IN form at the /reset-password
// URL — the CA11 missing-token explanation was reachable only via
// /login?view=reset, never on the route it was written for. The fix: the
// route-aware default — usePathname() sees /reset-password and the initial
// view is "reset" regardless of query (the missing-token guard + disabled
// submit render there); /login keeps the param-keyed behavior.
// ---------------------------------------------------------------------------
test.describe("S129/CD6a · bare /reset-password renders the reset screen", () => {
  test("a stripped query on the reset route shows the missing-token explanation, not the sign-in form (RED pre-fix: the sign-in form)", async ({ page }) => {
    await page.goto("/reset-password");
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByText(/missing its token/i),
    ).toBeVisible();
    // And NOT the sign-in form (the pre-fix surface at this URL). The
    // sign-in screen's identity is its Welcome heading; the button check
    // needs exact:true — getByRole name matching is substring-based, and
    // "Sign in" also matches the reset screen's "Back to sign in".
    await expect(page.getByRole("heading", { name: "Welcome to StudyFlow" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Sign in", exact: true })).toHaveCount(0);
  });
});

// S131/CF8 — the resend 429 honesty (docs/remediation-plan-session131.md).
//
// The s131 shell audit's L1: the resend catch rendered the SUCCESS status
// on a real 429 (the "uniform-200 endpoint — never an error surface"
// comment was factually wrong — the route answers 429 once the resend
// budget is exhausted), so a user who clicked Resend past the budget was
// told a code was on its way while the request was rejected. The leg
// burns the per-EMAIL budget (CF1's resendAcct — 5 asks) through direct
// API posts riding a UNIQUE client IP (the spec family's own technique —
// no interplay with the shared per-IP budget), then the UI click surfaces
// the route's own 429 copy, never the success line. (Own describe — this
// file's S15 block stays WELL under its own budget accounting.)
test.describe("S131/CF8 · the resend 429 honesty", () => {
  test("a rate-limited Resend surfaces the 429 copy, never the success line", async ({ page }) => {
    const ip = { "x-forwarded-for": "192.0.2.181" };
    const email = `cf8-resend-${Date.now()}@example.com`;
    const body = JSON.stringify({ name: "CF8 Leg", email, password: PASSWORD });

    // The account (register rides the same fresh IP budget: 10 — 2 asks).
    const reg = await page.request.post("/api/auth/register", {
      data: body,
      headers: { "content-type": "application/json", ...ip },
    });
    expect(reg.status()).toBe(200);

    // Burn resendAcct:email to its cap (5 asks — the 5th passes, the 6th
    // blocks; the per-IP budget stays untouched at 6 < 10).
    for (let i = 0; i < 5; i++) {
      const res = await page.request.post("/api/auth/resend-verification", {
        data: { email },
        headers: { "content-type": "application/json", ...ip },
      });
      expect(res.status()).toBe(200); // every ask so far is under the cap
    }

    // The UI journey to the verify screen's Resend button: sign up with the
    // same (now-existing, unverified) email → the verify view renders.
    await page.goto("/login");
    await page.getByRole("button", { name: /sign up/i }).click();
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
    await page.getByLabel("Confirm Password").fill(PASSWORD);
    await page.getByRole("button", { name: /create account/i }).click();
    await expect(page.getByRole("heading", { name: /verify/i })).toBeVisible();

    // The 6th ask — through the UI. The per-email budget answers 429 and
    // the honest copy renders (pre-fix: the success line rendered).
    await page.getByRole("button", { name: "Resend code" }).click();
    await expect(
      page.getByRole("status").filter({ hasText: "Too many verification requests. Try again shortly." }),
    ).toBeVisible();
    await expect(
      page.getByRole("status").filter({ hasText: "a new code is on its way" }),
    ).toHaveCount(0);
  });
});

// ---------------------------------------------------------------------------
// S132/CG3 — the forgot per-email budget (docs/remediation-plan-session132.md).
//
// The s132 audit's M3: forgot-password rode NO per-email budget while its
// two siblings (register/resend) got CF1's *Acct: keys — under the legacy
// XFF posture a rotated x-forwarded-for flood minted a fresh per-IP
// `forgot:` key per request, so NOTHING bounded the flood: each request
// deleteMany'd the victim's just-issued one-shot reset link (the
// supersede-DoS — the newest link is the one the user clicks, and an
// attacker rotating faster than the victim reads email owns the mailbox
// window) plus unauthenticated PasswordResetToken write churn. The fix is
// the CF1 pattern: `forgotAcct:${email}` (5/15-min) checked BEFORE the
// user lookup, answering the SAME uniform {ok:true} an unknown email gets
// (a distinguishable 429 for KNOWN emails would be an account oracle —
// the budget keys the payload, so known and unknown burn identically).
//
// The pin rides the spec family's own forged-XFF technique: five asks
// under five DISTINCT client IPs never touch the per-IP budget (10) — the
// sixth (a sixth distinct IP, same email) trips ONLY the per-email key.
// Pre-CG3: the sixth answers 200 {ok:true} (RED — no per-email brake
// existed); post-CG3: 429 with the route's own honest copy.
// ---------------------------------------------------------------------------
test.describe("S132/CG3 · the forgot per-email budget", () => {
  test("a rotated-XFF flood on ONE email trips forgotAcct: the 6th ask 429s with the honest copy (RED pre-fix: 200 — no per-email brake)", async ({
    page,
  }) => {
    const email = `cg3-forgot-${Date.now()}@example.com`;

    // Five asks, five DISTINCT forged client IPs — the per-IP `forgot:`
    // budget (10) stays untouched; every ask answers the uniform 200.
    for (let i = 1; i <= 5; i++) {
      const res = await page.request.post("/api/auth/forgot-password", {
        data: { email },
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": `198.51.100.${i}`,
        },
      });
      expect(res.status(), `ask ${i} (distinct IP ${i}) is under every budget`).toBe(200);
    }

    // The sixth — a sixth distinct IP, the SAME email: only the per-EMAIL
    // key can answer. Pre-CG3 this was 200 (the supersede-DoS window).
    const blocked = await page.request.post("/api/auth/forgot-password", {
      data: { email },
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "198.51.100.99",
      },
    });
    expect(blocked.status()).toBe(429);
    const body = (await blocked.json()) as { error?: string };
    expect(body.error).toContain("Too many reset requests");
    // The anti-enumeration shape holds under the budget: known and unknown
    // emails answer IDENTICALLY (the budget keys the payload, not the DB).
    const known = `cg3-known-${Date.now()}@example.com`;
    const reg = await page.request.post("/api/auth/register", {
      data: { name: "CG3 Known", email: known, password: PASSWORD },
      headers: { "content-type": "application/json", "x-forwarded-for": "198.51.100.120" },
    });
    expect(reg.status()).toBe(200);
    for (let i = 1; i <= 5; i++) {
      await page.request.post("/api/auth/forgot-password", {
        data: { email: known },
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": `198.51.100.${130 + i}`,
        },
      });
    }
    const blockedKnown = await page.request.post("/api/auth/forgot-password", {
      data: { email: known },
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "198.51.100.199",
      },
    });
    expect(blockedKnown.status()).toBe(429);
    const bodyKnown = (await blockedKnown.json()) as { error?: string };
    expect(bodyKnown.error).toBe(body.error);
  });
});

// ---------------------------------------------------------------------------
// S134/CI3 (audit A-M2) — the per-IP 429 behavioral pins for the four
// routes whose availability brake had only STATIC source pins (the key
// spellings in script-conventions) but no behavioral leg: login, register,
// forgot, reset. The verify-email 429 pin above (S117/BR2) is the shape;
// these four ride their own RFC 5737 TEST-NET IPs (the budget-isolation
// convention — the localhost budgets the journeys share stay untouched).
// Each route's per-IP budget is 10/15-min (checked BEFORE validation per
// the C1 convention — invalid payloads consume budget too), so the 11th
// request from one IP answers 429 + Retry-After + the route's own copy.
// The login leg doubles as the S134/CI1 timing-equalizer soak: ten
// dummy-branch attempts, each burning the full 2^14+2^17 scrypt pair.
// ---------------------------------------------------------------------------
test.describe("S134/CI3 · the per-IP 429 budgets (login / register / forgot / reset)", () => {
  test("login: the 11th attempt from one IP answers 429 + Retry-After + the login copy", async ({
    request,
  }) => {
    const headers = { "x-forwarded-for": "192.0.2.201" };
    const data = { email: "ci3-no-such-user@example.com", password: "WrongPassword1!" };
    for (let i = 0; i < 10; i++) {
      const res = await request.post("/api/auth/login", { headers, data });
      // The uniform 401 — no account-state oracle, budget consumed.
      expect(res.status()).toBe(401);
    }
    const blocked = await request.post("/api/auth/login", { headers, data });
    expect(blocked.status()).toBe(429);
    const body = (await blocked.json()) as { error: string };
    expect(body.error).toContain("Too many login attempts");
    const retryAfter = blocked.headers()["retry-after"];
    expect(retryAfter).toBeTruthy();
    expect(Number(retryAfter)).toBeGreaterThan(0);
  });

  test("register: the 11th attempt from one IP answers 429 + Retry-After + the register copy", async ({
    request,
  }) => {
    const headers = { "x-forwarded-for": "192.0.2.202" };
    // A DISTINCT email per request: the route's registerAcct: per-EMAIL
    // budget (5/15-min) would otherwise trip at the 6th request — this pin
    // measures the per-IP `register:${ip}` key (10/15-min), the outer
    // availability brake.
    for (let i = 0; i < 10; i++) {
      const res = await request.post("/api/auth/register", {
        headers,
        data: { email: `ci3-register-${i}@example.com`, password: "Fresh1234!", name: "CI3 Probe" },
      });
      // The uniform 200 (the no-enumeration family — the unverified
      // re-register branch answers the same shape).
      expect(res.status()).toBe(200);
    }
    const blocked = await request.post("/api/auth/register", {
      headers,
      data: { email: "ci3-register-final@example.com", password: "Fresh1234!", name: "CI3 Probe" },
    });
    expect(blocked.status()).toBe(429);
    const body = (await blocked.json()) as { error: string };
    expect(body.error).toContain("Too many registration attempts");
    const retryAfter = blocked.headers()["retry-after"];
    expect(retryAfter).toBeTruthy();
    expect(Number(retryAfter)).toBeGreaterThan(0);
  });

  test("forgot: the 11th request from one IP answers 429 + Retry-After + the reset-request copy", async ({
    request,
  }) => {
    const headers = { "x-forwarded-for": "192.0.2.203" };
    // Distinct emails per request — the forgotAcct: per-EMAIL budget (5)
    // must not shadow the per-IP `forgot:${ip}` key (10) this pin measures.
    for (let i = 0; i < 10; i++) {
      const res = await request.post("/api/auth/forgot-password", {
        headers,
        data: { email: `ci3-forgot-${i}@example.com` },
      });
      // The always-200 no-enumeration shape.
      expect(res.status()).toBe(200);
    }
    const blocked = await request.post("/api/auth/forgot-password", {
      headers,
      data: { email: "ci3-forgot-final@example.com" },
    });
    expect(blocked.status()).toBe(429);
    const body = (await blocked.json()) as { error: string };
    expect(body.error).toContain("Too many reset requests");
    const retryAfter = blocked.headers()["retry-after"];
    expect(retryAfter).toBeTruthy();
    expect(Number(retryAfter)).toBeGreaterThan(0);
  });

  test("reset: the 11th request from one IP answers 429 + Retry-After + the reset copy (the limiter precedes validation)", async ({
    request,
  }) => {
    const headers = { "x-forwarded-for": "192.0.2.204" };
    const data = { token: "0".repeat(48), password: "Fresh1234!" };
    for (let i = 0; i < 10; i++) {
      const res = await request.post("/api/auth/reset-password", { headers, data });
      // The invalid-token 400 — the C1 convention sits the limiter BEFORE
      // validation, so garbage payloads consume the per-IP budget.
      expect(res.status()).toBe(400);
    }
    const blocked = await request.post("/api/auth/reset-password", { headers, data });
    expect(blocked.status()).toBe(429);
    const body = (await blocked.json()) as { error: string };
    expect(body.error).toContain("Too many reset attempts");
    const retryAfter = blocked.headers()["retry-after"];
    expect(retryAfter).toBeTruthy();
    expect(Number(retryAfter)).toBeGreaterThan(0);
  });
});
