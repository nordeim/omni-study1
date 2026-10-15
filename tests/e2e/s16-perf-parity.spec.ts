import { expect, test } from "@playwright/test";

// S16 pins — the audit's two real families (docs/remediation-plan-session16.md):
//
// (1) AUTH SUB-SCREEN MOBILE GEOMETRY (390×844). The S15 build measured the
//     sub-screens at desktop only; the S16 mobile probe found the reference
//     renders them RESPONSIVELY: h2 `text-xl sm:text-2xl` (20px at <sm), the
//     Sign in button `h-11 sm:h-12` (44px at <sm), the verify circle
//     `mb-3 sm:mb-4` + h2 `mt-2 sm:mt-4` (Back-bottom→h2 76px), the forgot h2
//     `mt-2 sm:mt-4` (Back-top→h2 28px). The clone shipped the desktop values
//     unconditionally. These pins hold the mobile values; the desktop pins
//     (24px h2, 48px button, 96px verify gap — auth.spec/auth-flows.spec)
//     hold the ≥sm side. One registration walks the whole journey.
//
// (2) DASHBOARD LOAD STABILITY (the S16-A pre-warm fix). The pre-fix shell
//     flipped on /api/auth/me with an empty data store; the data arrival
//     re-laid the conditional overdue banner + sections out from under the
//     viewport (CLS 0.117–0.125 — CWV needs-improvement; the reference's own
//     gated first paint measures 0.088). The fix pre-warms the active view's
//     collections IN PARALLEL with auth; the Splash→shell replacement renders
//     with final geometry. This pin observes the SAME buffered layout-shift
//     entries the audit used — the guard the performance skill's workflow
//     demands (MEASURE → FIX → VERIFY → GUARD).
test.use({ storageState: { cookies: [], origins: [] } });

const PASSWORD = "S16Mobile1234!";

test.describe("S16 auth sub-screen mobile geometry (390×844)", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("Sign in button is 44px at <sm (the reference's h-11 sm:h-12)", async ({ page }) => {
    await page.goto("/login");
    const signIn = page.getByRole("button", { name: "Sign in", exact: true });
    await expect(signIn).toHaveCSS("height", "44px");
  });

  test("signup/verify/forgot mobile geometry matches the reference (one journey)", async ({ page }) => {
    const email = `e2e-s16-${Date.now()}@example.com`;
    await page.goto("/login");

    // -- signup: h2 renders the reference's mobile 20px (text-xl) ----------
    await page.getByRole("button", { name: /sign up/i }).click();
    const signupH2 = page.getByRole("heading", { name: "Create your account" });
    await expect(signupH2).toHaveCSS("font-size", "20px");

    // -- register a throwaway → the verify screen -------------------------
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
    await page.getByLabel("Confirm Password").fill(PASSWORD);
    await page.getByRole("button", { name: /create account/i }).click();
    const verifyH2 = page.getByRole("heading", { name: "Verify your email" });
    await expect(verifyH2).toBeVisible();

    // h2: mobile 20px; Back-bottom→h2-top: 76px (circle mb-3 + h2 mt-2).
    await expect(verifyH2).toHaveCSS("font-size", "20px");
    const verifyGap = await page.evaluate(() => {
      const back = [...document.querySelectorAll("button")].find((b) =>
        /back to sign in/i.test(b.textContent ?? ""),
      )!;
      const h2 = document.querySelector("h2")!;
      return Math.round(h2.getBoundingClientRect().y - back.getBoundingClientRect().bottom);
    });
    expect(verifyGap).toBe(76);

    // -- back → forgot: h2 mobile 20px; Back-top→h2-top: 28px --------------
    await page.getByRole("button", { name: /back to sign in/i }).click();
    await page.getByRole("button", { name: /forgot password/i }).click();
    const forgotH2 = page.getByRole("heading", { name: "Reset your password" });
    await expect(forgotH2).toHaveCSS("font-size", "20px");
    const forgotGap = await page.evaluate(() => {
      const back = [...document.querySelectorAll("button")].find((b) =>
        /back to sign in/i.test(b.textContent ?? ""),
      )!;
      const h2 = document.querySelector("h2")!;
      return Math.round(h2.getBoundingClientRect().y - back.getBoundingClientRect().y);
    });
    expect(forgotGap).toBe(28);
  });
});

test.describe("S16-A dashboard load stability (CLS guard)", () => {
  test("cold dashboard load renders without layout shift (CLS ≤ 0.02)", async ({ page }) => {
    // Login first (uninstrumented — the measured surface is the cold
    // /Dashboard load), then register the shift observer BEFORE the
    // navigation so buffered entries are captured from the first frame.
    await page.goto("/login");
    await page.getByLabel("Email", { exact: true }).fill("demo@studyflow.app");
    await page.getByLabel("Password", { exact: true }).fill("Demo1234!");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await page.waitForFunction(() => document.querySelector("main") !== null, null, {
      timeout: 30000,
    });

    await page.addInitScript(() => {
      (window as { __cls?: number }).__cls = 0;
      try {
        new PerformanceObserver((list) => {
          for (const e of list.getEntries() as PerformanceEntry[] & { value: number }[])
            if (!(e as { hadRecentInput?: boolean }).hadRecentInput)
              (window as { __cls?: number }).__cls =
                ((window as { __cls?: number }).__cls ?? 0) + (e as { value: number }).value;
        }).observe({ type: "layout-shift", buffered: true });
      } catch {
        /* engine without layout-shift support */
      }
    });

    await page.goto("/Dashboard");
    await page.waitForFunction(() => /good (morning|afternoon|evening)/i.test(
      document.querySelector("main h1")?.textContent ?? "",
    ), null, { timeout: 30000 });
    // Settle: the S16 audit measured the shift at data-arrival — wait past
    // the fetch window (+ a live-clock tick) before reading the total.
    await page.waitForTimeout(2500);
    const cls = await page.evaluate(() =>
      Math.round(((window as { __cls?: number }).__cls ?? 0) * 1000) / 1000,
    );
    expect(cls).toBeLessThanOrEqual(0.02);
  });
});
