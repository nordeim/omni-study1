import { expect, test, type Page } from "@playwright/test";

/**
 * Events view-family parity pins — the consolidated events home, the
 * 11th VIEW home (S199/EW).
 *
 * Split out of parity-session5.spec.ts (the S198 close's named next
 * candidate — the size-debt adjudication of the remaining coverage-axis
 * files, executed in the census-clean window the standing audit
 * confirmed, the ninth consecutive clean window). The family's binding
 * axis is the EVENTS VIEW: the dark terminal panel chrome and the
 * day-focus carousel interactions, every pin a computed-style or
 * behavior port measured on the live reference. The blocks moved here
 * BYTE-FAITHFULLY, declaration order preserved — 2 describes / 11 pins:
 *  - S5-B the Events dark terminal panel (7 pins: the slate-900
 *    rounded-2xl panel, the EVENTS label, the big date, the cyan
 *    full-width New Event row, the create-dialog anatomy opened and
 *    Escape-closed WITHOUT ever submitting, the day-section labels).
 *  - S5-U1 the Events day-focus carousel (4 pins: the four a11y-named
 *    focus controls, the big-date + weekday + CW tracking, the
 *    re-anchoring 7-day list, the one-line month + CW header).
 *
 * The non-Events families stay in parity-session5 (the S162/DK1 events
 * CB8 failure-domain split leg — a hardening coverage leg, NOT chrome);
 * the Events strays outside it (the S176/DZ1 events create-dialog in
 * the dialogs axis home) stay in their homes (the S189-S198 boundary
 * precedent — see docs/remediation-plan-session199.md).
 *
 * The pins' contracts (unchanged by the move):
 *  - CHUNK 3 home (scripts/e2e-chunked-cert.sh) — the SAME chunk as
 *    the split source, so the write budgets hold by construction (the
 *    family issues ZERO writes); the file sorts 1st in the chunk's
 *    alphabetical order (events, then focustimer, then
 *    parity-session5) — the identical zero-predecessor exposure the
 *    Events pins had inside the 1st-position split source (the
 *    S194/S195 safe direction).
 *  - The full family map: docs/remediation-plan-session199.md.
 */


const hydrated = (page: Page) =>
  page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true");

test.describe("S5-B · Events dark terminal panel", () => {
  test("renders the slate-900 panel with the EVENTS label, big date and cyan New Event", async ({ page }) => {
    await page.goto("/Events");
    await hydrated(page);
    const panel = page.locator('[aria-label="Events panel"]');
    await expect(panel).toBeVisible();
    const bg = await panel.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).toBe("rgb(15, 23, 42)"); // slate-900 — measured.
    const radius = await panel.evaluate((el) => getComputedStyle(el).borderRadius);
    expect(radius).toBe("16px");
    await expect(panel.getByText("Events", { exact: true })).toBeVisible();
    // The big day number renders in the panel header (text-4xl/700).
    const big = panel.locator("span.text-4xl");
    await expect(big).toBeVisible();
    expect(await big.evaluate((el) => getComputedStyle(el).fontSize)).toBe("36px");
    // Cyan New Event button (text-cyan-400 — measured).
    const newEvent = panel.getByRole("button", { name: "New Event" });
    const color = await newEvent.evaluate((el) => getComputedStyle(el).color);
    expect(color).toBe("rgb(34, 211, 238)");
    // Day sections: 7 buckets, slate-800/50 headers, slate-300 titles.
    await expect(panel.getByRole("heading", { name: "Today" })).toBeVisible();
    await expect(panel.getByRole("heading", { name: "Tomorrow" })).toBeVisible();
  });

  test("the day rows carry the reference's banded chrome (S5-V2 pin)", async ({ page }) => {
    // Reference (measured s69): each day label sits in a FULL-WIDTH
    // slate-800/50 band row (px-4 py-2, 36px) rendered slate-300/600 at
    // 14px; the "No events" row reads slate-500 with NO trailing period;
    // consecutive labels sit ~92-102px apart. The clone rendered bare
    // cyan-400 labels with no band and "No events." (period).
    await page.goto("/Events");
    await hydrated(page);
    const panel = page.locator('[aria-label="Events panel"]');
    const today = panel.getByRole("heading", { name: "Today" });
    await expect(today).toBeVisible();
    const band = await today.evaluate((el) => {
      const row = el.parentElement!;
      const cs = getComputedStyle(row);
      const pr = row.parentElement!;
      return {
        bandBg: cs.backgroundColor,
        bandW: Math.round(row.getBoundingClientRect().width),
        panelW: Math.round(pr.getBoundingClientRect().width),
        color: getComputedStyle(el).color,
        fw: getComputedStyle(el).fontWeight,
        fs: getComputedStyle(el).fontSize,
      };
    });
    // bg-slate-800/50 serializes as oklab (v4 trap 7) — accept both it and
    // the reference's rgba form; the rendered colors are identical.
    const isBandBg = (s: string) => s.includes("30, 41, 59") || s.startsWith("oklab");
    expect(isBandBg(band.bandBg)).toBe(true);
    expect(band.bandW).toBe(band.panelW);
    expect(band.color).toBe("rgb(203, 213, 225)");
    expect(band.fw).toBe("600");
    expect(band.fs).toBe("14px");
    const noEv = panel.getByText("No events", { exact: true }).first();
    await expect(noEv).toBeVisible();
    // slate-400, not the reference's slate-500 — the reference's 3.48:1 on
    // slate-900 fails WCAG AA at 14px (the Batch-R/S/Y a11y-wins precedent).
    expect(await noEv.evaluate((el) => getComputedStyle(el).color)).toBe("rgb(148, 163, 184)");
    await expect(panel.getByText("No events.", { exact: true })).toHaveCount(0);
    // band + empty-row heights imply the measured 96px group pitch (the
    // seeded events sit on today/+2/+4, so a cross-group pitch assert would
    // be data-dependent).
    const heights = await noEv.evaluate((el) => {
      const row = el.parentElement!;
      const band = row.previousElementSibling!;
      return {
        row: Math.round(row.getBoundingClientRect().height),
        band: Math.round(band.getBoundingClientRect().height),
      };
    });
    expect(heights.band).toBeGreaterThanOrEqual(32);
    expect(heights.band).toBeLessThanOrEqual(40);
    expect(heights.row).toBeGreaterThanOrEqual(50);
    expect(heights.row).toBeLessThanOrEqual(68);
  });

  test("the New Event row is the reference's left-aligned calendar row (S5-V2 pin)", async ({ page }) => {
    // Reference (measured s69): the full-width New Event button carries a
    // CALENDAR icon (not plus) and left-aligned content (justify-start,
    // px-4) — the clone centered a plus-icon row.
    await page.goto("/Events");
    await hydrated(page);
    const newEvent = page
      .locator('[aria-label="Events panel"]')
      .getByRole("button", { name: "New Event" });
    await expect(newEvent).toBeVisible();
    const cs = await newEvent.evaluate((el) => {
      const svg = el.querySelector("svg")!;
      return {
        justify: getComputedStyle(el).justifyContent,
        icon: (svg.getAttribute("class") ?? "").match(/lucide-[a-z0-9-]+/g)?.join(",") ?? "",
        w: Math.round(el.getBoundingClientRect().width),
      };
    });
    expect(cs.justify).toBe("flex-start");
    expect(cs.icon).toContain("lucide-calendar");
    const vw = await page.evaluate(() => window.innerWidth);
    expect(cs.w).toBeGreaterThan(0.6 * (vw - 260)); // the full-width strip row
  });

  test("the day sections render the CW (calendar week) label", async ({ page }) => {
    await page.goto("/Events");
    await hydrated(page);
    await expect(page.getByText(/CW \d+/)).toBeVisible();
  });

  // Session-63 drift finds (Batch T): the reference renders the CW in its
  // OWN convention — US week-of-year, Sunday-start (Sun 2026-10-18 →
  // "CW 43", carousel-verified; ISO says 42) — and its day-group headings
  // use the full weekday-month format ("Tuesday, October 20", measured).
  test("the CW label reads the reference's US Sunday-start week number", async ({ page }) => {
    await page.clock.setFixedTime(new Date(2026, 9, 18, 12, 0, 0));
    await page.goto("/Events");
    await hydrated(page);
    await expect(page.getByText("CW 43", { exact: true })).toBeVisible();
  });

  test("the day-group headings use the reference's full weekday-month format", async ({ page }) => {
    await page.clock.setFixedTime(new Date(2026, 9, 18, 12, 0, 0));
    await page.goto("/Events");
    await hydrated(page);
    await expect(page.getByRole("heading", { name: "Tuesday, October 20" })).toBeVisible();
  });

  test("the New Event dialog carries the reference field set (location, repeat, reminders)", async ({ page }) => {
    await page.goto("/Events");
    await hydrated(page);
    // .first() = the header CTA (the panel's own "New Event" text button
    // now shares the visible name — the CTA's mismatched aria-label
    // "Create event" was removed in the Family F a11y fix).
    await page.getByRole("button", { name: "New Event" }).first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByLabel("Title *")).toBeVisible();
    await expect(dialog.getByLabel("Location / Link")).toBeVisible();
    await expect(dialog.getByLabel("Description")).toBeVisible();
    await expect(dialog.getByLabel("Start")).toBeVisible();
    await expect(dialog.getByLabel("End")).toBeVisible();
    await expect(dialog.getByLabel("Repeat")).toBeVisible();
    // The Reminders label wraps a control GROUP (no single htmlFor target),
    // so assert its text rather than a labeled control.
    await expect(dialog.getByText("Reminders", { exact: true })).toBeVisible();
    await dialog.getByRole("button", { name: "Close" }).click();
  });
});

// ---------------------------------------------------------------------------
// S5-U1 · Events day-focus carousel (session-64 Batch U).
//
// Measured on the live reference (2026-10-18/19, empty account): the Events
// header carries FOUR unnamed controls (‹ ○ › ∨, lucide size-4 in h-6 w-6
// ghost buttons); the big date, the weekday abbrev and the "Oct 2026 CW 43"
// line all track the FOCUSED day; the day list re-anchors to the focused
// day (focused day + 6) while the Today/Tomorrow labels stay anchored to
// the REAL today (stepping back to Sat Oct 17 rendered "Saturday, October
// 17" first, then "Today"); the CW followed the focused day (18→43, 17→42).
// The reference's controls have NO accessible names — the clone supersets.
// ---------------------------------------------------------------------------
test.describe("S5-U1 · Events day-focus carousel", () => {
  test("the header carries the day-focus controls with accessible names", async ({ page }) => {
    await page.goto("/Events");
    await hydrated(page);
    const panel = page.locator('[aria-label="Events panel"]');
    await expect(panel.getByRole("button", { name: "Previous day" })).toBeVisible();
    await expect(panel.getByRole("button", { name: "Jump to today" })).toBeVisible();
    await expect(panel.getByRole("button", { name: "Next day" })).toBeVisible();
    await expect(panel.getByRole("button", { name: "Toggle day list" })).toBeVisible();
  });

  test("the big date, weekday and CW track the focused day and the list re-anchors", async ({ page }) => {
    await page.clock.setFixedTime(new Date(2026, 9, 18, 12, 0, 0));
    await page.goto("/Events");
    await hydrated(page);
    const panel = page.locator('[aria-label="Events panel"]');
    await panel.getByRole("button", { name: "Previous day" }).click();
    // Reference-measured step (‹ from Sun Oct 18): "17 | Sat | CW 42".
    await expect(panel.locator("span.text-4xl")).toHaveText("17");
    await expect(panel.getByText("Sat", { exact: true })).toBeVisible();
    await expect(panel.getByText("CW 42", { exact: true })).toBeVisible();
    // The list re-anchors to the focused day (full-format heading, NOT
    // "Today" — the relative labels stay anchored to the real today).
    await expect(panel.getByRole("heading", { name: "Saturday, October 17" })).toBeVisible();
    await expect(panel.getByRole("heading", { name: "Today" })).toBeVisible();
    await expect(panel.getByRole("heading", { name: "Tomorrow" })).toBeVisible();
    // Stepping forward returns to today (CW 43).
    await panel.getByRole("button", { name: "Next day" }).click();
    await expect(panel.locator("span.text-4xl")).toHaveText("18");
    await expect(panel.getByText("CW 43", { exact: true })).toBeVisible();
  });

  test("the circle control jumps back to today from a focused offset", async ({ page }) => {
    await page.clock.setFixedTime(new Date(2026, 9, 18, 12, 0, 0));
    await page.goto("/Events");
    await hydrated(page);
    const panel = page.locator('[aria-label="Events panel"]');
    await panel.getByRole("button", { name: "Previous day" }).click();
    await panel.getByRole("button", { name: "Previous day" }).click();
    await expect(panel.locator("span.text-4xl")).toHaveText("16");
    await panel.getByRole("button", { name: "Jump to today" }).click();
    await expect(panel.locator("span.text-4xl")).toHaveText("18");
  });

  test("the month-year line uses the reference's short-month form beside the CW", async ({ page }) => {
    await page.clock.setFixedTime(new Date(2026, 9, 18, 12, 0, 0));
    await page.goto("/Events");
    await hydrated(page);
    const panel = page.locator('[aria-label="Events panel"]');
    // Measured: "Oct 2026 CW 43" in ONE slate-400 line — the old stacked
    // long-month header ("October 2026" + CW on the right) is gone.
    await expect(panel.getByText("Oct 2026")).toBeVisible();
    await expect(panel.getByText("October 2026")).toHaveCount(0);
  });
});
