import { expect, test } from "@playwright/test";
import { DEMO_EMAIL, DEMO_PASSWORD } from "./helpers";

// Login surface: the /login route renders the StudyFlow auth card, rejects
// bad credentials, signs the demo user in, and redirects unauthenticated
// visitors. This file OPTS OUT of the shared storageState (empty cookies)
// because it tests the logged-out surface. (Deliberately does NOT probe the
// rate limiter — 10 attempts/IP/15 min would poison the whole suite.)

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("login route", () => {
  test("renders the StudyFlow auth card", async ({ page }) => {
    await page.goto("/login");
    await expect(
      page.getByRole("heading", { name: "Welcome to StudyFlow" }),
    ).toBeVisible();
    await expect(page.getByText("Sign in to continue")).toBeVisible();
    await expect(page.getByRole("button", { name: "Continue with Google" })).toBeVisible();
    await expect(page.getByLabel("Email", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in", exact: true })).toBeVisible();
  });

  test("the auth card mirrors the reference's measured chrome (S4-F pin)", async ({ page }) => {
    // Reference (measured at 1280×800): shadow-2xl card, NO border,
    // bg-white/95 + backdrop-blur, a 1px gradient top strip, a 448px
    // (max-w-md) card, a 30px h1, 48px/r12 inputs, a 48px sign-in button,
    // and a 54px Google button.
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /Welcome to StudyFlow/ })).toBeVisible();
    const card = page.locator("div.shadow-2xl").first();
    await expect(card).toBeVisible();
    await expect(card).toHaveCSS("border-width", "0px");
    // bg-white/95 serializes as oklab(...) in Chromium — same rendered color
    // (trap 7, the documented oklab-serialization family).
    await expect(card).toHaveCSS("background-color", /rgba\(255, 255, 255, 0\.95\)|oklab\([^)]* \/ 0\.95\)/);
    await expect(card).toHaveCSS("backdrop-filter", /blur/);
    const box = await card.boundingBox();
    expect(Math.round(box?.width ?? 0)).toBe(448);

    // The gradient top strip (h-1, slate-200 → 300 → 200).
    const strip = card.locator("div.absolute.top-0").first();
    const stripBg = await strip.evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(stripBg).toContain("linear-gradient");
    await expect(strip).toHaveCSS("height", "4px");

    // h1 renders text-2xl sm:text-3xl → 30px at desktop.
    const h1 = page.getByRole("heading", { name: /Welcome to StudyFlow/ });
    await expect(h1).toHaveCSS("font-size", "30px");

    // Inputs: h-11 sm:h-12 (48px at desktop) + rounded-xl (12px) +
    // bg-slate-50/50.
    const email = page.getByLabel("Email", { exact: true });
    await expect(email).toHaveCSS("height", "48px");
    await expect(email).toHaveCSS("border-radius", "12px");
    // bg-slate-50/50 serializes as lab(...) in Chromium — same rendered color.
    await expect(email).toHaveCSS("background-color", /rgba\(248, 250, 252, 0\.5\)|lab\([^)]* \/ 0\.5\)/);

    // Buttons: sign-in 48px/r12; Google 54px (py-3.5) + rounded-xl.
    const signIn = page.getByRole("button", { name: "Sign in", exact: true });
    await expect(signIn).toHaveCSS("height", "48px");
    await expect(signIn).toHaveCSS("border-radius", "12px");
    const google = page.getByRole("button", { name: "Continue with Google" });
    await expect(google).toHaveCSS("height", "54px");
    await expect(google).toHaveCSS("border-radius", "12px");

    // The logo is a circle (h-20 w-20 = 80px at base, sm:h-24 = 96px at
    // desktop — the reference measures 96px at 1280) with a white ring.
    const logo = card.locator("span.rounded-full").first();
    const logoBox = await logo.boundingBox();
    expect(Math.round(logoBox?.width ?? 0)).toBe(96);
  });

  test("wrong password is rejected without a session", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email", { exact: true }).fill(DEMO_EMAIL);
    await page.getByLabel("Password", { exact: true }).fill("WrongPassword99");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    // S15-A1 — the reference renders auth errors INLINE (a role=alert block
    // with the red wash) between the Password field and the Sign in button,
    // with the reference's copy (no trailing period). The toast is gone.
    // Scoped to the auth card: Next.js's __next-route-announcer__ ALSO
    // carries role=alert (a strict-mode collision).
    const alert = page.locator("div.shadow-2xl").getByRole("alert");
    await expect(alert).toBeVisible();
    await expect(alert).toContainText("Invalid email or password");
    await expect(page).toHaveURL(/\/login/);
    // trap 10: unpinned palette classes serialize as lab() in Chromium —
    // accept both serializations of red-50/70.
    await expect(alert).toHaveCSS(
      "background-color",
      /rgba\(254, 242, 242, 0\.7\)|lab\([^)]* \/ 0\.7\)/,
    );
    await expect(alert).toHaveCSS("border-color", "rgb(254, 202, 202)"); // red-200
    await expect(alert).toHaveCSS("border-radius", "12px");
  });

  test("valid credentials sign in and land on the dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email", { exact: true }).fill(DEMO_EMAIL);
    await page.getByLabel("Password", { exact: true }).fill(DEMO_PASSWORD);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(/\/Dashboard\/?$/);
    await expect(
      page.getByRole("heading", { name: /Good (morning|afternoon|evening|night)/ }),
    ).toBeVisible();
  });

  test("unauthenticated visits redirect to /login", async ({ page }) => {
    await page.goto("/Dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("logout clears the session", async ({ page }) => {
    // Sign in first (fresh context), then sign out via Settings.
    await page.goto("/login");
    await page.getByLabel("Email", { exact: true }).fill(DEMO_EMAIL);
    await page.getByLabel("Password", { exact: true }).fill(DEMO_PASSWORD);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(/\/Dashboard\/?$/);

    await page.goto("/Settings");
    await page.getByRole("tab", { name: "Profile" }).click();
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
