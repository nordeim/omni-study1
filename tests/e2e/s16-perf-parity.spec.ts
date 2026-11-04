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
    // main#main-content — the authed shell's landmark. Plain "main" also
    // matches the login page's own <main> (session-61 landmark fix), which
    // resolved this wait before the post-login redirect and aborted the
    // measured goto (ERR_ABORTED).
    await page.waitForFunction(() => document.querySelector("main#main-content") !== null, null, {
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

// ---------------------------------------------------------------------------
// S136/CK1 (audit A-H1) — the login global containment budget, pinned at
// the WIRE with the actual attack shape: a rotated-XFF flood of
// non-existent-email logins. Under the default TRUSTED_PROXY_HOPS-unset
// posture each forged x-forwarded-for hop is its own per-IP bucket (10/
// 15-min each — never tripped by 1 request), and the non-existent emails
// skip the per-account bucket entirely (it only fires when the user
// exists) — pre-CK1 NOTHING bounded the flood while every request burned
// the full synchronous scrypt pair. The process-wide loginGlobal: bucket
// (40/15-min, the registerGlobal doctrine of S132/CG11) is the bound this
// pin proves: the first 429 lands at global request 40-or-41, with the
// honest copy.
//
// TERMINAL-POSITION RULE (the mid-run correction): the spent global bucket
// cannot be cleaned up from the wire (a post-flood login is itself gated —
// the lockout-by-design; the success-reset only boots under the cap), so
// this pin MUST be its chunk's TERMINAL test: this file is chunk 3's
// alphabetically-LAST file, this describe is the file's LAST, and nothing
// after it in the chunk needs a login. The CLEAN-SLATE PRE-RESET below
// (one successful demo login) zeroes the bucket first, so first429 is
// exactly 41 — deterministic regardless of whatever failures preceded it
// in the chunk. (The first draft lived mid-chunk in resilience.spec.ts:
// the flood poisoned every subsequent login in its chunk — the S135
// correction-8 class on the BUDGET side.)
// ---------------------------------------------------------------------------
test.describe("S136/CK1: the login global containment budget", () => {
  test("a rotated-XFF flood of non-existent-email logins trips the process-wide bucket (RED pre-fix: all 41 answer the uniform 401 — no global bound existed)", async ({ request }) => {
    // CLEAN-SLATE PRE-RESET: one successful demo login zeroes the global
    // bucket (the route's success-reset — the progressive model extended
    // to the global budget). Without it the pin's arithmetic would depend
    // on whatever failures preceded it in the chunk; with it the count
    // starts at 0 and first429 is exactly 41.
    const warm = await request.post("/api/auth/login", {
      data: { email: "demo@studyflow.app", password: "Demo1234!" },
    });
    expect(warm.status(), "the clean-slate login succeeds (and resets the global window)").toBe(200);

    const statuses: number[] = [];
    let first429Body = "";
    for (let i = 1; i <= 41; i++) {
      const res = await request.post("/api/auth/login", {
        data: {
          email: `ck1-flood-${i}@nonexistent.invalid`,
          password: "WrongPassword123!",
        },
        // The attack shape: a UNIQUE TEST-NET hop per request — each
        // per-IP bucket sees exactly 1 request (under its 10 cap), so only
        // the GLOBAL bucket accumulates.
        headers: { "x-forwarded-for": `192.0.2.${100 + i}` },
      });
      statuses.push(res.status());
      if (res.status() === 429 && !first429Body) {
        first429Body = String((await res.json() as { error?: string }).error ?? "");
      }
    }
    // The uniform miss: the first POST is the ordinary invalid-credentials
    // 401 (the no-user branch — no per-account bucket, the burn paid).
    expect(statuses[0]).toBe(401);
    // The containment: the first 429 lands at global request 40-or-41.
    const first429 = statuses.indexOf(429) + 1;
    expect(first429, `the first 429 index (statuses: ${statuses.slice(35).join(",")})`).toBeGreaterThanOrEqual(40);
    expect(first429).toBeLessThanOrEqual(41);
    // Every request from the first 429 onward stays contained (the window
    // holds — POST 41 is a 429 too).
    expect(statuses[40]).toBe(429);
    // The honest copy (identical to the per-IP limit's — no new oracle).
    expect(first429Body).toContain("Too many login attempts");
  });
});
