import { expect, test, type Page } from "@playwright/test";

/**
 * Analytics-family parity pins — the consolidated analytics home (S195/ES).
 *
 * Split out of parity-session7.spec.ts (the S194 close's named next
 * candidate — the last S7-era founding strays + their same-file pure
 * siblings — executed in the census-clean window the standing audit
 * confirmed, the fifth consecutive clean window): every pure-Analytics
 * describe in the split source moved here BYTE-FAITHFULLY, declaration
 * order preserved — 2 describes / 4 pins: the S7-D founding set (the
 * icon-block stat cards — r12 border-0 cards, the four measured 48px
 * tinted blocks violet/blue/green/orange-100, the fraction values +
 * completion-rate subs, the 7-day chart titles) and the S127/CB13
 * Assignments-card derivation (the true average progress, the seeded
 * "0/6" fraction). The non-analytics families stay in parity-session7;
 * the Analytics strays outside it (the a11y-sweep /Analytics leg, the
 * dark-mode Analytics washes, the navigation legs, the
 * parity-session5/8/9 batch homes, the s17-fresh-user zero-data legs,
 * the resilience legs) stay in their coverage-axis homes (the
 * S189/S191/S193/S194 boundary precedent — see
 * docs/remediation-plan-session195.md).
 *
 * The pins' contracts (unchanged by the move):
 *  - SEED-ANCHORED + READ-ONLY: every pin starts page.goto("/Analytics")
 *    + hydrated() and asserts the SEED's deterministic state (the four
 *    stat cards, the seeded assignment-progress mean); the family issues
 *    ZERO writes — never another spec's residue, no budget units at all.
 *  - CHUNK 2 home (scripts/e2e-chunked-cert.sh) — the SAME chunk as the
 *    split source, so the POST/register budgets hold by construction;
 *    the file sorts 2nd in the chunk's alphabetical order (a11y-sweep <
 *    analytics < files) — strictly FEWER predecessors than the split
 *    source's 6th position (the two residue directions analyzed in the
 *    plan §4).
 *  - The full family map: docs/remediation-plan-session195.md.
 */


const hydrated = (page: Page) =>
  page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true");

const rgb = (r: number, g: number, b: number) => `rgb(${r}, ${g}, ${b})`;

test.describe("S7-D · Analytics stat cards + charts", () => {
  test("stat cards are r12 border-0 cards with 48px tinted icon blocks", async ({ page }) => {
    await page.goto("/Analytics");
    await hydrated(page);
    const card = page.locator('[aria-label="Analytics stats"] > *', { hasText: "Tasks Completed" }).first();
    await expect(card).toBeVisible();
    const cs = await card.evaluate((el) => {
      const s = getComputedStyle(el);
      return { radius: s.borderRadius, borderWidth: s.borderTopWidth };
    });
    expect(cs.radius).toBe("12px");
    expect(cs.borderWidth).toBe("0px"); // border-0
    const icon = card.locator("div[class*='w-12']").first();
    const iconCs = await icon.evaluate((el) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return { bg: s.backgroundColor, w: r.width, h: r.height };
    });
    expect(iconCs.w).toBe(48);
    expect(iconCs.h).toBe(48);
    expect(iconCs.bg).toBe(rgb(237, 233, 254)); // violet-100 (measured)
    // Fraction value + completion-rate sub.
    await expect(card.getByText(/\d+\/\d+/)).toBeVisible();
    await expect(card.getByText(/completion rate/)).toBeVisible();
  });

  test("the four measured stat labels + icon tints render", async ({ page }) => {
    await page.goto("/Analytics");
    await hydrated(page);
    const stats = page.locator('[aria-label="Analytics stats"]');
    for (const label of ["Tasks Completed", "Assignments", "Focus Time", "Upcoming Exams"]) {
      await expect(stats.getByText(label, { exact: true })).toBeVisible();
    }
    const assignments = stats.locator("> *", { hasText: "Assignments" }).first();
    const blue = await assignments.locator("div[class*='w-12']").evaluate((el) =>
      getComputedStyle(el).backgroundColor,
    );
    expect(blue).toBe(rgb(219, 234, 254)); // blue-100
    const focus = stats.locator("> *", { hasText: "Focus Time" }).first();
    const green = await focus.locator("div[class*='w-12']").evaluate((el) =>
      getComputedStyle(el).backgroundColor,
    );
    expect(green).toBe(rgb(220, 252, 231)); // green-100 (measured on the reference)
    const exams = stats.locator("> *", { hasText: "Upcoming Exams" }).first();
    const orange = await exams.locator("div[class*='w-12']").evaluate((el) =>
      getComputedStyle(el).backgroundColor,
    );
    expect(orange).toBe(rgb(255, 237, 213)); // orange-100
  });

  test("chart cards carry the measured 7-day titles", async ({ page }) => {
    await page.goto("/Analytics");
    await hydrated(page);
    await expect(page.getByText("Task Activity (Last 7 Days)")).toBeVisible();
    await expect(page.getByText("Focus Time (Last 7 Days)")).toBeVisible();
  });
});


// S127/CB13 — the analytics "avg progress" derivation (the s127 FE audit's
// M-7): the caption computed the completion RATIO (the share of
// assignments at 100%) while the label promises the average progress. The
// seeded state: 80/40/45/25/60/0 → mean 41.67 → "42% avg progress" (the
// pre-fix completion ratio rendered "0% avg progress" — 0 of 6 at 100%).
// The reference's own populated semantics are unmeasurable (its demo data
// carries no assignments — verified live 2026-11-02: its Tasks view reads
// 0 tasks, its calendar only the one Nov 12 exam), so the label-honest
// derivation ships.
test.describe("S127/CB13 · the analytics Assignments card renders the true average progress", () => {
  test("the seeded state renders the mean of progress (42%), not the completion ratio", async ({ page }) => {
    await page.goto("/Analytics");
    await hydrated(page);
    const stats = page.locator('[aria-label="Analytics stats"]');
    const assignments = stats.locator("> *", { hasText: "Assignments" }).first();
    await expect(assignments.getByText("42% avg progress")).toBeVisible();
    // The fraction stays the completion census: 0 of 6 seeded assignments
    // sit at 100%.
    await expect(assignments.getByText("0/6")).toBeVisible();
  });
});
