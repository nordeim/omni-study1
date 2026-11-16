import { expect, test, type Page } from "@playwright/test";

/**
 * Dashboard view-family parity pins — the consolidated dashboard home, the
 * 14th VIEW home (S200/EX).
 *
 * Split out of parity-session8.spec.ts (the S199 close's named next
 * candidate — the size-debt re-adjudication of the remaining
 * coverage-axis files, executed in the census-clean window the standing
 * audit confirmed, the tenth consecutive clean window). The family's
 * binding axis is the DASHBOARD VIEW: the flush-row card bodies and
 * the exam/assignment row anatomy, every pin a computed-style port
 * measured on the live reference (the S8-B flush rows describe, 3
 * pins: the flush divide-y card bodies, the p-4 exam hover rows with
 * the rounded-full badge on the S120/BU7 slate far family, and the
 * assignment rows' 4px color strip). The block moved
 * here BYTE-FAITHFULLY, declaration order preserved.
 *
 * The other same-view families stay in their files (the file-boundary
 * doctrine, the S197 lesson-1 — see docs/remediation-plan-session200.md
 * for the full boundary ledger).
 *
 * The pins' contracts (unchanged by the move):
 *  - CHUNK 1 home (scripts/e2e-chunked-cert.sh) — the SAME chunk as
 *    the split source, so the write budgets hold by construction (the
 *    family issues ZERO writes); the file sorts STRICTLY BEFORE the
 *    split source in the chunk's alphabetical order — strictly FEWER
 *    predecessors than the pins' old exposure inside parity-session8
 *    (the S194/S195 safe direction).
 *  - The full family map: docs/remediation-plan-session200.md.
 */


const hydrated = (page: Page) =>
  page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true");

const rgb = (r: number, g: number, b: number) => `rgb(${r}, ${g}, ${b})`;

// Trap 11: rounded-full serializes as 3.35544e+07px in Chromium computed styles.
const isRound = (radius: string) => radius === "9999px" || radius === "3.35544e+07px";

test.describe("S8-B · Dashboard flush rows", () => {
  test("card bodies are flush divide-y lists (rows edge-to-edge)", async ({ page }) => {
    await page.goto("/Dashboard");
    await hydrated(page);
    await page.waitForSelector('h2:has-text("Upcoming Exams")');
    const cs = await page
      .locator("section", { has: page.locator('h2:has-text("Upcoming Exams")') })
      .first()
      .evaluate((el) => {
        // The body is the card's LAST child (after the p-6 header).
        const body = el.children[el.children.length - 1] as HTMLElement;
        const s = getComputedStyle(body);
        return { pad: s.padding, borderTop: s.borderTopWidth, cls: body.className };
      });
    expect(cs.pad).toBe("0px");
    expect(cs.cls).toContain("divide-y");
    expect(cs.cls).toContain("divide-slate-50");
  });

  // S120/BU7 re-anchor: the badge family followed the reference measurement
  // (2026-11-01) — the TODAY badge alone rides the red family ("Today!");
  // every other distance renders the NEUTRAL slate pill. The seeded first
  // row is "Calculus II Midterm" at +1d ("Tomorrow") → slate-100. The
  // geometric intent of the original pin (rounded-full pill, p-4 row, no
  // card chrome) is unchanged.
  test("exam rows are p-4 hover rows with a rounded-full badge (the slate far family — S120/BU7)", async ({ page }) => {
    await page.goto("/Dashboard");
    await hydrated(page);
    await page.waitForSelector('h2:has-text("Upcoming Exams")');
    const row = page.locator('[aria-label="Upcoming exams"] > li').first();
    await expect(row).toBeVisible();
    const cs = await row.evaluate((el) => {
      const s = getComputedStyle(el);
      return { pad: s.padding, radius: s.borderRadius, borderLeft: s.borderLeftWidth, borderRight: s.borderRightWidth };
    });
    expect(cs.pad).toBe("16px");
    expect(cs.radius).toBe("0px"); // no rounded card
    // No CARD chrome — the only border allowed is the divide-y hairline
    // (vertical sides stay bare; the divider rides top/bottom).
    expect(cs.borderLeft).toBe("0px");
    expect(cs.borderRight).toBe("0px");
    // The label set the reference renders: "Today!" (the measured "!"),
    // "Tomorrow", or "Nd" — the old "Today" form no longer exists.
    const badge = row.locator("span").filter({ hasText: /^(?:\d+d|Today!|Tomorrow)$/ }).first();
    const badgeCs = await badge.evaluate((el) => {
      const s = getComputedStyle(el);
      return { radius: s.borderRadius, bg: s.backgroundColor, fg: s.color, text: el.textContent?.trim() };
    });
    expect(isRound(badgeCs.radius)).toBe(true);
    // The seeded first row is +1d ("Tomorrow") → the NEUTRAL slate family
    // (measured on the reference: bg rgb(241,245,249) / text rgb(71,85,105)).
    expect(badgeCs.text).toBe("Tomorrow");
    expect(badgeCs.bg).toBe(rgb(241, 245, 249)); // slate-100 (S120/BU7 measured)
    expect(badgeCs.fg).toBe(rgb(71, 85, 105)); // slate-600 (S120/BU7 measured)
  });

  test("assignment rows carry the 4px color strip and priority pill", async ({ page }) => {
    await page.goto("/Dashboard");
    await hydrated(page);
    await page.waitForSelector('h2:has-text("Upcoming Assignments")');
    const row = page.locator('[aria-label="Upcoming assignments"] > li').first();
    await expect(row).toBeVisible();
    const strip = row.locator("span, div").first();
    const stripCs = await strip.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return { w: Math.round(r.width), h: Math.round(r.height), radius: s.borderRadius };
    });
    expect(stripCs.w).toBe(4);
    expect(stripCs.h).toBe(48);
    expect(isRound(stripCs.radius)).toBe(true);
  });
});
