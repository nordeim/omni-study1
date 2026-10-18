import { expect, test, type Page } from "@playwright/test";

/**
 * Family G — the greeting is time-of-day aware (session-63 drift find).
 *
 * The reference renders the greeting from the CURRENT wall clock: at 19:08
 * local it showed "Good evening, sepnetflix2023 👋"
 * (docs/screenshots/63-ref-desktop-dashboard-evening-greeting.png). The
 * clone showed "Good morning" at every hour because both greeting sites
 * (dashboard h1 + MyDay's zero-task empty state) fed `greetingForHour` a
 * midnight-anchored `today = startOfDay(new Date())` whose getHours() is
 * always 0 — present since the original implementation and masked by the
 * sandbox's UTC clock (nearly all sessions ran in the UTC morning).
 *
 * The pins use Playwright's fake clock (`page.clock.setFixedTime`) so all
 * three buckets are deterministic at any wall-clock hour. The
 * morning/afternoon/evening dashboard pins + the MyDay evening pin: on the
 * pre-fix code the afternoon and evening pins fail ("Good morning"
 * rendered), which is the RED that drove the fix.
 *
 * The fake clock is applied to the PAGE only — API calls via
 * `page.request` (the fresh-user registration) run on the real server
 * clock, so session-cookie validity is unaffected.
 */

const hydrated = (page: Page) =>
  page.waitForFunction(() => document.documentElement.style.getPropertyValue("--sf-primary") !== "");

/** The S17 pattern: register + verify a throwaway user inside THIS
 *  context's cookie jar (zero data ⇒ MyDay renders the greeting-titled
 *  amber empty state). */
async function registerFreshUser(page: Page, salt: string) {
  const email = `s63-${salt}-${Date.now()}@studyflow.app`;
  const res = await page.request.post("/api/auth/register", {
    data: { email, password: "Fresh1234!", name: "Greeting Probe" },
  });
  expect(res.ok(), `register failed: ${res.status()}`).toBe(true);
  const body = (await res.json()) as { code: string };
  const verify = await page.request.post("/api/auth/verify-email", {
    data: { email, code: body.code },
  });
  expect(verify.ok(), `verify failed: ${verify.status()}`).toBe(true);
}

test.use({ viewport: { width: 1440, height: 900 } });

test.describe("Family G · the greeting reads the live clock", () => {
  for (const [hour, bucket] of [
    [8, "Good morning"],
    [14, "Good afternoon"],
    [19, "Good evening"],
  ] as const) {
    test(`dashboard h1 reads "${bucket}" at ${hour}:00 local`, async ({ page }) => {
      await page.clock.setFixedTime(new Date(2026, 9, 19, hour, 0, 0));
      await page.goto("/Dashboard");
      await hydrated(page);
      const h1 = page.locator("main").getByRole("heading", { level: 1 });
      await expect(h1).toHaveText(`${bucket}, Demo 👋`);
    });
  }

  test("the MyDay zero-task empty state carries the current-hour bucket", async ({ page }) => {
    await page.clock.setFixedTime(new Date(2026, 9, 19, 19, 0, 0));
    await registerFreshUser(page, "greeting");
    await page.goto("/MyDay");
    await hydrated(page);
    const empty = page.getByRole("heading", { name: "Good evening!" });
    await expect(empty).toBeVisible();
  });
});
