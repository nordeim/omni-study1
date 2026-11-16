import { expect, test, type Page } from "@playwright/test";

/**
 * Calendar view-family parity pins — the consolidated calendar home, the
 * 13th VIEW home (S200/EX).
 *
 * Split out of parity-session8.spec.ts (the S199 close's named next
 * candidate — the size-debt re-adjudication of the remaining
 * coverage-axis files, executed in the census-clean window the standing
 * audit confirmed, the tenth consecutive clean window). The family's
 * binding axis is the CALENDAR VIEW: the month-card chrome and the day-detail
 * surface, every pin a computed-style port measured on the live
 * reference (the S8-C rework describe, 6 pins: the simple p-6
 * border-slate-200 month card, the text-xl h2 with exactly two chevron
 * nav buttons, the weekday header family, the selected-cell accent
 * fill + today 100-level tint + hover stripped, the day-detail p-6
 * card with the font-bold h3 long date, and the EP7 year-omission
 * port). The block moved
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

test.describe("S8-C · Calendar rework", () => {
  test("month card is a simple p-6 card with border-slate-200", async ({ page }) => {
    await page.goto("/Calendar");
    await hydrated(page);
    const card = page.locator('[aria-label="Calendar month"]');
    const cs = await card.evaluate((el) => {
      const s = getComputedStyle(el);
      return { pad: s.padding, border: s.borderColor, overflow: s.overflow };
    });
    expect(cs.pad).toBe("24px");
    expect(cs.border).toBe(rgb(226, 232, 240)); // slate-200
  });

  test("month title is text-xl font-bold with exactly 2 chevron nav buttons", async ({ page }) => {
    await page.goto("/Calendar");
    await hydrated(page);
    const h2 = page.locator('[aria-label="Calendar month"] h2');
    const cs = await h2.evaluate((el) => {
      const s = getComputedStyle(el);
      return { size: s.fontSize, weight: s.fontWeight };
    });
    expect(cs.size).toBe("20px"); // text-xl
    expect(cs.weight).toBe("700");
    // The month NAV carries exactly the two chevron buttons (day cells are
    // also buttons — scope to the aria-labelled pair).
    await expect(page.getByRole("button", { name: "Previous month" })).toHaveCount(1);
    await expect(page.getByRole("button", { name: "Next month" })).toHaveCount(1);
    await expect(page.getByRole("button", { name: "Today", exact: true })).toHaveCount(0);
  });

  test("weekday header is text-sm font-medium text-slate-500 py-2", async ({ page }) => {
    await page.goto("/Calendar");
    await hydrated(page);
    const head = page.locator('[aria-label="Calendar weekdays"]');
    const cell = head.locator("*").first();
    const cs = await cell.evaluate((el) => {
      const s = getComputedStyle(el);
      return { size: s.fontSize, weight: s.fontWeight, color: s.color, pad: s.padding, align: s.textAlign };
    });
    expect(cs.size).toBe("14px");
    expect(cs.weight).toBe("500");
    expect(cs.color).toBe(rgb(100, 116, 139));
    expect(cs.align).toBe("center");
  });

  test("selected cell = accent fill; today (unselected) = 100-level tint; hover stripped", async ({ page }) => {
    await page.goto("/Calendar");
    await hydrated(page);
    const grid = page.locator('[aria-label="Calendar days"]');
    await expect(grid).toBeVisible();
    // Selected = today by default (the reference initializes on today).
    const selected = grid.locator("button[aria-pressed=true]");
    await expect(selected).toHaveCount(1);
    const selCs = await selected.evaluate((el) => getComputedStyle(el).backgroundColor);
    // violet-600 — was violet-500 (139,92,246): the Family F a11y sweep
    // measured white-on-violet-500 at 4.23:1 (axe color-contrast, serious);
    // the selected fill moved one step to --sf-primary-strong (5.70:1).
    expect(selCs).toBe(rgb(124, 58, 237));
    const selCls = await selected.evaluate((el) => el.className);
    expect(selCls).not.toContain("hover:bg");
    // Click another day: the old day becomes the tinted TODAY cell. The
    // cells carry transition-all — the tint ANIMATES in over ~150ms, so we
    // gate on the final computed color (an immediate read catches a
    // mid-transition blend like rgb(184,157,250)).
    // S122/BW1: the deselect target must never be TODAY — the calendar's
    // onClick SETS the selection (no toggle-off), so on the 15th of any
    // month the fixed "15" click re-selected today and the unselected
    // tint poll timed out (a deterministic once-a-month suite failure).
    const alt = new Date().getDate() === 15 ? 14 : 15;
    const other = grid.locator("button").filter({ hasText: String(alt) }).first();
    await other.click();
    await page.waitForFunction(
      () =>
        getComputedStyle(
          document.querySelector('[aria-label="Calendar days"] button[data-today]') as HTMLElement,
        ).backgroundColor === "rgb(237, 233, 254)",
    );
    const today = grid.locator("button[data-today]");
    await expect(today).toHaveCount(1);
    const todayCs = await today.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(todayCs).toBe(rgb(237, 233, 254)); // violet-100 (emptyFrom)
    const todayCls = await today.evaluate((el) => el.className);
    expect(todayCls).not.toContain("hover:bg");
    const newSel = grid.locator("button[aria-pressed=true]");
    await expect(newSel).toHaveCount(1);
    const newSelCs = await newSel.evaluate((el) => getComputedStyle(el).backgroundColor);
    // violet-600 — the sf-selected-tint a11y fix (see the S8-C note above).
    expect(newSelCs).toBe(rgb(124, 58, 237));
  });

  test("day detail is a simple p-6 card with a font-bold h3 long date", async ({ page }) => {
    await page.goto("/Calendar");
    await hydrated(page);
    const aside = page.locator('[aria-label="Day detail"]');
    const cs = await aside.evaluate((el) => {
      const s = getComputedStyle(el);
      return { pad: s.padding, border: s.borderColor, overflow: s.overflow };
    });
    expect(cs.pad).toBe("24px");
    expect(cs.border).toBe(rgb(226, 232, 240));
    const h3 = aside.locator("h3").first();
    const h3cs = await h3.evaluate((el) => {
      const s = getComputedStyle(el);
      return { weight: s.fontWeight, size: s.fontSize };
    });
    expect(h3cs.weight).toBe("700");
    await expect(h3).toHaveText(/day, /i);
  });

  // S192/EP7 (Batch EP — the calendar day-header port): the reference's
  // day-detail h3 renders weekday + month + day with NO year ("Sunday,
  // November 15" — measured live desktop AND mobile 2026-11-16; the clone
  // shipped formatLongDateWithWeekday's trailing ", 2026"). The MyDay
  // subtitle already omits the year (the S4-D pin) — the calendar now
  // matches the same measured family.
  test("EP7: the day-detail date omits the year (the measured weekday-month-day form)", async ({ page }) => {
    await page.goto("/Calendar");
    await hydrated(page);
    const aside = page.locator('[aria-label="Day detail"]');
    await expect(aside).toBeVisible();
    const h3 = aside.locator("h3").first();
    // The exact measured shape: "Weekday, Month Day" — no trailing year.
    await expect(h3).toHaveText(/^(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday), (January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}$/);
  });
});
