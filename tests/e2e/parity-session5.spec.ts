import { expect, test, type Page } from "@playwright/test";

/**
 * Session-5 parity pins — interactive chrome & view bodies.
 *
 * Every pin here was measured on the live reference
 * (https://omni-study1.base44.app, authed) with computed-style probes:
 * gradient primary CTAs (S5-A), the Events dark panel (S5-B), dialog
 * chrome (S5-C), the gray form-control palette (S5-D), the FocusTimer
 * layout (S5-E), Settings appearance cards (S5-F), the Calendar segmented
 * switch (S5-G), the Calculator keypad/display (S5-H), MyDay's quick-add
 * row (S5-I), the Timetable week bar + All Weeks select (S5-J), Files
 * chrome (S5-K), the Notes left pane (S5-L), GradeTracker's gradient stat
 * card (S5-M) and the AI quick-action cards (S5-N). See
 * docs/remediation-plan-session5.md for the measured values.
 */

const hydrated = (page: Page) =>
  page.waitForFunction(() => document.documentElement.style.getPropertyValue("--sf-primary") !== "");

test.describe("S5-A · gradient primary CTAs", () => {
  test("the Tasks Add Task button renders the violet→indigo gradient", async ({ page }) => {
    await page.goto("/Tasks");
    await hydrated(page);
    const cta = page.getByRole("button", { name: "Add Task" });
    await expect(cta).toBeVisible();
    const bgImage = await cta.evaluate((el) => getComputedStyle(el).backgroundImage);
    // sRGB-exact stops (trap 5): violet-500 → indigo-600 via the accent tokens.
    expect(bgImage).toContain("linear-gradient");
    expect(bgImage).toContain("rgb(139, 92, 246)");
    expect(bgImage).toContain("rgb(79, 70, 229)");
    const shadow = await cta.evaluate((el) => getComputedStyle(el).boxShadow);
    // Trap 7: modern rgb(/) syntax serializes as rgba().
    expect(shadow).toContain("rgba(0, 0, 0, 0.1)");
  });

  test("the empty-state/play tinted shadow-lg carries the accent 25% tint", async ({ page }) => {
    // Pinned on the FocusTimer play button (always rendered): the same
    // accent-tinted shadow-lg family the reference's empty-state CTAs carry
    // (measured shadow-lg shadow-violet-500/25). rgba serialization (trap 7).
    await page.goto("/FocusTimer");
    await hydrated(page);
    const play = page.getByRole("button", { name: /start timer|resume timer|pause timer/i });
    await expect(play).toBeVisible();
    const shadow = await play.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(shadow).toContain("0.25");
    expect(shadow).toContain("10px 15px -3px");
  });
});

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

test.describe("S5-C · dialog chrome", () => {
  test("dialogs render at max-w-md with the 8px radius and 36px inputs", async ({ page }) => {
    await page.goto("/Tasks");
    await hydrated(page);
    await page.getByRole("button", { name: "Add Task" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    const box = await dialog.boundingBox();
    expect(box?.width).toBeLessThanOrEqual(448);
    const radius = await dialog.evaluate((el) => getComputedStyle(el).borderRadius);
    expect(radius).toBe("8px"); // rounded-lg — measured on the reference dialog.
    const input = dialog.getByLabel("Title");
    const h = await input.evaluate((el) => getComputedStyle(el).height);
    expect(h).toBe("36px"); // h-9 inputs — measured.
    await dialog.getByRole("button", { name: "Close" }).click();
  });
});

test.describe("S5-D · gray form-control palette", () => {
  test("outline buttons render gray-200 borders + gray-950 text + v3 shadow-sm", async ({ page }) => {
    await page.goto("/Timetable");
    await hydrated(page);
    const outline = page.getByRole("button", { name: "Grid Builder" });
    await expect(outline).toBeVisible();
    const border = await outline.evaluate((el) => getComputedStyle(el).borderColor);
    expect(border).toBe("rgb(229, 229, 229)"); // gray-200 — measured.
    const color = await outline.evaluate((el) => getComputedStyle(el).color);
    expect(color).toBe("rgb(10, 10, 10)"); // gray-950 — measured.
    const shadow = await outline.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(shadow).toContain("rgba(0, 0, 0, 0.05)"); // v3 shadow-sm pin (rgba serialization — trap 7).
  });
});

test.describe("S5-E · FocusTimer layout", () => {
  test("renders the 3 stat cards, 256px ring, gradient play button and two-line presets", async ({ page }) => {
    await page.goto("/FocusTimer");
    await hydrated(page);
    // Stats: Pomodoros / Today / Sessions.
    await expect(page.getByText("Pomodoros", { exact: true })).toBeVisible();
    await expect(page.getByText("Sessions", { exact: true })).toBeVisible();
    // Ring: 256px box.
    const ring = page.locator(".h-64.w-64, [class*='h-64'][class*='w-64']").first();
    await expect(ring).toBeVisible();
    const ringBox = await ring.boundingBox();
    expect(Math.round(ringBox?.width ?? 0)).toBeGreaterThanOrEqual(255);
    // Time: 48px mono.
    const time = page.getByRole("timer");
    expect(await time.evaluate((el) => getComputedStyle(el).fontSize)).toBe("48px");
    // Play: 64px gradient circle.
    const play = page.getByRole("button", { name: /start timer|resume timer|pause timer/i });
    const playBox = await play.boundingBox();
    expect(Math.round(playBox?.width ?? 0)).toBe(64);
    const playBg = await play.evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(playBg).toContain("linear-gradient");
    expect(playBg).toContain("rgb(79, 70, 229)");
    // Presets: two-line with the durations line.
    await expect(page.getByText("25/5/15")).toBeVisible();
    await expect(page.getByText("50/10/30")).toBeVisible();
  });
});

test.describe("S5-F · Settings appearance", () => {
  test("theme cards are 88px border-2 tiles; swatches are 48px", async ({ page }) => {
    await page.goto("/Settings");
    await hydrated(page);
    const light = page.getByRole("button", { name: "Light", exact: true });
    await expect(light).toBeVisible();
    const box = await light.boundingBox();
    expect(Math.round(box?.height ?? 0)).toBeGreaterThanOrEqual(84); // 88px measured.
    const border = await light.evaluate((el) => getComputedStyle(el).borderWidth);
    expect(border).toBe("2px");
    // Selected card: accent border + softest tint.
    const borderColor = await light.evaluate((el) => getComputedStyle(el).borderColor);
    expect(borderColor).toBe("rgb(139, 92, 246)");
    const swatch = page.getByRole("button", { name: "Blue accent" });
    const sw = await swatch.boundingBox();
    expect(Math.round(sw?.width ?? 0)).toBe(48); // w-12 — measured.
    expect(Math.round(sw?.height ?? 0)).toBe(48);
  });

  test("the emerald + amber swatch faces match the reference (S5-F migration)", async ({ page }) => {
    await page.goto("/Settings");
    await hydrated(page);
    const green = page.getByRole("button", { name: "Green accent" });
    expect(await green.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe("rgb(16, 185, 129)");
    const orange = page.getByRole("button", { name: "Orange accent" });
    expect(await orange.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe("rgb(245, 158, 11)");
  });
});

test.describe("S5-G · Calendar segmented switch", () => {
  test("the Calendar/Timeline toggle is a bordered segmented control with a solid active tab", async ({ page }) => {
    await page.goto("/Calendar");
    await hydrated(page);
    // S9-F re-measure: the tab labels are now capitalized ("Calendar") and
    // carry icons (grid3x3 / list) on h-8 tabs inside a white bordered
    // container — the solid-accent active tab is unchanged.
    const active = page.getByRole("button", { name: "Calendar", exact: true });
    await expect(active).toBeVisible();
    const bg = await active.evaluate((el) => getComputedStyle(el).backgroundColor);
    // violet-600 — was violet-500: the Family F a11y sweep measured
    // white-on-violet-500 at 4.23:1 (axe color-contrast, serious); the
    // sf-selected-tint fill moved to --sf-primary-strong (5.70:1).
    expect(bg).toBe("rgb(124, 58, 237)");
    expect(await active.evaluate((el) => getComputedStyle(el).fontSize)).toBe("12px");
  });
});

test.describe("S5-H · Calculator keypad + display", () => {
  test("Clear is a red-text half-width key; '=' is a gradient key; no % key", async ({ page }) => {
    await page.goto("/Calculator");
    await hydrated(page);
    const clear = page.getByRole("button", { name: "Clear" });
    await expect(clear).toBeVisible();
    // red-700 — was red-600 (220,38,38): the Family F sweep measured 3.99:1
    // on red-100 (axe color-contrast, serious); one step darker = 4.61:1.
    expect(await clear.evaluate((el) => getComputedStyle(el).color)).toBe("rgb(185, 28, 28)");
    const clearBox = await clear.boundingBox();
    expect(Math.round(clearBox?.width ?? 0)).toBeGreaterThanOrEqual(190); // half the 448px card.
    const eq = page.getByRole("button", { name: "Equals" });
    const eqBg = await eq.evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(eqBg).toContain("linear-gradient");
    expect(eqBg).toContain("rgb(79, 70, 229)");
    await expect(page.getByRole("button", { name: "Insert %" })).toHaveCount(0);
    // The minus key is ASCII "-" (codepoint 45 — measured).
    await expect(page.getByRole("button", { name: "Insert -" })).toBeVisible();
  });

  test("the display area renders the softest gradient behind a 36px value", async ({ page }) => {
    await page.goto("/Calculator");
    await hydrated(page);
    const display = page.locator('[aria-label="Calculator display"]');
    await expect(display).toBeVisible();
    expect(await display.evaluate((el) => getComputedStyle(el).fontSize)).toBe("36px");
    const area = page.locator(".sf-calc-display").first();
    const bg = await area.evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(bg).toContain("linear-gradient");
    expect(bg).toContain("rgb(245, 243, 255)"); // softest (violet-50) — measured.
  });
});

test.describe("S5-I · MyDay quick-add", () => {
  test("the quick-add input is 48px with a 12px radius", async ({ page }) => {
    await page.goto("/MyDay");
    await hydrated(page);
    const input = page.getByLabel("Add a task for today");
    await expect(input).toBeVisible();
    expect(await input.evaluate((el) => getComputedStyle(el).height)).toBe("48px");
    expect(await input.evaluate((el) => getComputedStyle(el).borderRadius)).toBe("12px");
    await expect(page.getByRole("button", { name: "More Options" })).toBeVisible();
  });
});

test.describe("S5-J · Timetable chrome", () => {
  test("week-nav bar, All Weeks select options and the My Classes card grid", async ({ page }) => {
    await page.goto("/Timetable");
    await hydrated(page);
    // Week nav bar with the range subtitle.
    await expect(page.getByRole("button", { name: "Previous week" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Next week" })).toBeVisible();
    await expect(page.getByText(/ - /)).toBeVisible(); // "Oct 4 - Oct 10" style range.
    // All Weeks / Week A / Week B options (measured on the reference).
    const select = page.getByRole("combobox", { name: "Week filter" });
    await select.click();
    await expect(page.getByRole("option", { name: "All Weeks" })).toBeVisible();
    await expect(page.getByRole("option", { name: "Week A" })).toBeVisible();
    await expect(page.getByRole("option", { name: "Week B" })).toBeVisible();
    await page.keyboard.press("Escape");
    // Day headers carry full day names + big date numbers (Sunday-first,
    // measured; S7-C upgraded the compact "Sun 4" chips to the reference's
    // grid-cols-8 "Sunday / 4" heads).
    await expect(
      page.locator('[aria-label="Week header"]').getByText("Sunday", { exact: true }),
    ).toBeVisible();
    // My Classes renders the alternating-week badges (seeded).
    await expect(page.getByText(/Week A/).first()).toBeVisible();
  });

  // Session-63 drift find: the reference's week is SUNDAY-START (Sun
  // 2026-10-18's week reads "Oct 18 - Oct 24" with today in the FIRST
  // column); the clone rendered a Monday-start range (Oct 12 - Oct 18)
  // under Sunday-first labels, misaligning every head's date by one day
  // ("Sunday 12" for a Monday). The clock pin makes it deterministic.
  test("the week grid aligns Sunday-first: today leads the range and the Sunday head carries today's date", async ({ page }) => {
    await page.clock.setFixedTime(new Date(2026, 9, 18, 12, 0, 0));
    await page.goto("/Timetable");
    await hydrated(page);
    await expect(page.getByText("Oct 18 - Oct 24")).toBeVisible();
    const sunday = page.locator('[aria-label="Week header"] > div').nth(1); // first day head (after the time cell)
    await expect(sunday.getByText("Sunday", { exact: true })).toBeVisible();
    await expect(sunday.getByText("18", { exact: true })).toBeVisible();
  });

  // Session-63: the reference-measured subtitle (the invented
  // "Your weekly class schedule." was never reference-measured).
  test("the header subtitle reads the reference's measured copy", async ({ page }) => {
    await page.goto("/Timetable");
    await hydrated(page);
    await expect(page.getByText("Manage your class schedule", { exact: true })).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// S5-U2 · Timetable centered week banner (session-64 Batch U).
//
// Measured on the live reference (2026-10-19): a white card (rounded-xl,
// p-4, shadow-sm, border-slate-100, flex items-center justify-between) sits
// between the header row and the grid, carrying [‹] [centered h2 month-year
// + p range] [›] — the week navigation lives INSIDE the banner (chevrons at
// the card's padding edges, 36px, unnamed on the reference; the h2 reads
// the week's FIRST-DAY month: the spanning week Sep 27 - Oct 3 rendered
// "September 2026"). The clone's old chevrons lived in the page header row.
// ---------------------------------------------------------------------------
test.describe("S5-U2 · Timetable week banner", () => {
  test("the centered month/week banner carries the range and the week nav", async ({ page }) => {
    await page.clock.setFixedTime(new Date(2026, 9, 18, 12, 0, 0));
    await page.goto("/Timetable");
    await hydrated(page);
    const banner = page.locator('[aria-label="Week banner"]');
    await expect(banner).toBeVisible();
    await expect(banner.getByText("October 2026")).toBeVisible();
    await expect(banner.getByText("Oct 18 - Oct 24")).toBeVisible();
    // The nav buttons live INSIDE the banner (measured ref position).
    await expect(banner.getByRole("button", { name: "Previous week" })).toBeVisible();
    await expect(banner.getByRole("button", { name: "Next week" })).toBeVisible();
  });

  test("the banner month reads the week's first-day month across a month boundary", async ({ page }) => {
    await page.clock.setFixedTime(new Date(2026, 9, 18, 12, 0, 0));
    await page.goto("/Timetable");
    await hydrated(page);
    const banner = page.locator('[aria-label="Week banner"]');
    await banner.getByRole("button", { name: "Previous week" }).click();
    await expect(banner.getByText("Oct 11 - Oct 17")).toBeVisible();
    await banner.getByRole("button", { name: "Previous week" }).click();
    await banner.getByRole("button", { name: "Previous week" }).click();
    // Reference-measured: Sep 27 - Oct 3 renders "September 2026" (the
    // first day's month), NOT "October 2026".
    await expect(banner.getByText("September 2026")).toBeVisible();
    await expect(banner.getByText("Sep 27 - Oct 3")).toBeVisible();
  });
});

test.describe("S5-K · Files chrome", () => {
  test("breadcrumb is a text link and the view toggle is a bordered strip", async ({ page }) => {
    await page.goto("/Files");
    await hydrated(page);
    const crumb = page.getByRole("button", { name: "All Files" });
    const h = await crumb.evaluate((el) => getComputedStyle(el).height);
    expect(Math.round(Number.parseFloat(h))).toBeLessThanOrEqual(24); // text-link height (20px measured).
    const toggle = page.getByRole("group", { name: "View mode" });
    await expect(toggle).toBeVisible();
    const r = await toggle.evaluate((el) => getComputedStyle(el).borderRadius);
    expect(r).toBe("8px"); // rounded-lg — measured.
    // Add Link is icon-only (superset, demoted — S5-K; exact match avoids
    // the case-insensitive collision with the aria-label "Add link").
    await expect(page.getByRole("button", { name: "Add link", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Add Link", exact: true })).toHaveCount(0);
  });
});

test.describe("S5-L · Notes left pane", () => {
  test("the left pane carries two comboboxes and a gradient New dropdown (S8-G re-measured)", async ({ page }) => {
    await page.goto("/Notes");
    await hydrated(page);
    await expect(page.getByRole("combobox", { name: "Filter by notebook" })).toBeVisible();
    await expect(page.getByRole("combobox", { name: "Filter by tag" })).toBeVisible();
    // S8-G (re-measured): ONE 36px gradient dropdown trigger replaces the
    // old pair of icon buttons — menu: New Note / New Notebook.
    const newMenu = page.getByRole("button", { name: "New note menu" });
    await expect(newMenu).toBeVisible();
    const bg = await newMenu.evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(bg).toContain("linear-gradient");
    // Pane divider (border-r) — the pane is NOT a card.
    const pane = page.locator(".w-80.border-r").first();
    await expect(pane).toBeVisible();
  });
});

test.describe("S5-M · GradeTracker stat cards", () => {
  test("the first stat card is a full gradient card with white text", async ({ page }) => {
    await page.goto("/GradeTracker");
    await hydrated(page);
    const gradientCard = page.locator(".sf-gradient.rounded-2xl").first();
    await expect(gradientCard).toBeVisible();
    await expect(gradientCard.getByText("Overall Average")).toBeVisible();
    const bg = await gradientCard.evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(bg).toContain("rgb(139, 92, 246)");
    expect(bg).toContain("rgb(79, 70, 229)");
    expect(await gradientCard.evaluate((el) => getComputedStyle(el).color)).toBe("rgb(255, 255, 255)");
    // Exactly three stat cards.
    await expect(page.getByText("Total Grades", { exact: true })).toBeVisible();
    await expect(page.getByText("Subjects Tracked", { exact: true })).toBeVisible();
  });
});

test.describe("S5-N · AI quick-action cards", () => {
  test("quick actions carry a 32px accent icon and a 16px/600 title, no description line", async ({ page }) => {
    await page.goto("/AIAssistant");
    await hydrated(page);
    const card = page.getByRole("button", { name: "Explain Concept" });
    await expect(card).toBeVisible();
    const heading = card.getByRole("heading", { name: "Explain Concept" });
    expect(await heading.evaluate((el) => getComputedStyle(el).fontSize)).toBe("16px");
    expect(await heading.evaluate((el) => getComputedStyle(el).fontWeight)).toBe("600");
    const icon = card.locator("svg").first();
    expect(await icon.evaluate((el) => getComputedStyle(el).width)).toBe("32px");
    // The composer hint (measured copy).
    await expect(page.getByText("Press Enter to send, Shift + Enter for a new line")).toBeVisible();
  });
});

test.describe("S5-V · session-65 reference drift fixes (measured on the live reference 2026-10-19)", () => {
  test("S5-V1 GradeTracker: the reference's 3-card stat row — no Highest Grade, no sub-captions, measured colors", async ({ page }) => {
    await page.goto("/GradeTracker");
    await hydrated(page);
    // The reference's stat row is THREE cards (measured DOM: grid
    // md:grid-cols-3 gap-4) — the Highest Grade card and every sub-caption
    // ("N grades logged" / "Best score so far" / "Across all subjects" /
    // "This semester") were clone inventions (probed zero AND seeded).
    await expect(page.getByText("Highest Grade")).toHaveCount(0);
    await expect(page.getByText(/grades logged/)).toHaveCount(0);
    await expect(page.getByText("Best score so far")).toHaveCount(0);
    await expect(page.getByText("Across all subjects")).toHaveCount(0);
    await expect(page.getByText("This semester")).toHaveCount(0);
    // The reference header subtitle (measured copy — was "Track your grades
    // across subjects", clone-invented).
    await expect(page.getByText("Monitor your academic performance")).toBeVisible();
    // The stat grid computes THREE equal tracks at the desktop viewport.
    const grid = page.locator('main [aria-label="Grade summary"]');
    await expect(grid).toBeVisible();
    const cols = await grid.evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(" ").length);
    expect(cols).toBe(3);
    // Values read text-4xl (36px) — the clone's text-3xl was drift.
    const avgValue = grid.locator("p", { hasText: /^0%$|^\d+(\.\d+)?%$/ }).first();
    await expect(avgValue).toBeVisible();
    expect(await avgValue.evaluate((el) => getComputedStyle(el).fontSize)).toBe("36px");
    // Measured icon colors: the Total Grades target is emerald-500, the
    // Subjects Tracked chart-column is blue-500 (the clone's violet sf icons
    // were drift); the gradient card's award rides white.
    const totalCard = grid.locator("div").filter({ hasText: /^Total Grades/ }).last();
    const targetIcon = totalCard.locator("svg.lucide-target");
    await expect(targetIcon).toBeVisible();
    expect(await targetIcon.evaluate((el) => getComputedStyle(el).color)).toBe("rgb(16, 185, 129)");
    const subjectsCard = grid.locator("div").filter({ hasText: /^Subjects Tracked/ }).last();
    const chartIcon = subjectsCard.locator("svg.lucide-chart-column, svg.lucide-bar-chart-3").first();
    await expect(chartIcon).toBeVisible();
    expect(await chartIcon.evaluate((el) => getComputedStyle(el).color)).toBe("rgb(59, 130, 246)");
  });

  test("S5-V2 PracticeTests: the reference's measured subtitle copy", async ({ page }) => {
    await page.goto("/PracticeTests");
    await hydrated(page);
    // Measured on the live reference 2026-10-19 (the clone's "Build and
    // take practice tests" was invented).
    await expect(page.getByText("Test yourself with practice exams")).toBeVisible();
  });
});

test.describe("S5-AB · the populated-surface drift layer (measured on the POPULATED reference 2026-10-20 — the s72 endpoint-learning probes)", () => {
  // The zero-state probes (s70 probe #6) could never see these surfaces:
  // the reference renders NO history/recent/subject chrome at zero, so
  // Batch AA shipped with this layer explicitly unmeasured. The s72 cycle
  // populated the reference account through its own UI (subject + grade +
  // task + a keyed evaluation + a solved problem), measured the populated
  // anatomy, and cleaned up to zero residue. Three drift items:
  // the calculator's header button + slide-in panel (the bottom SectionCard
  // was a clone invention), the solver's free-standing "Recent Problems"
  // h2, and GradeTracker's bare per-subject cards.

  test("S5-AB1 Calculator: the measured header subtitle", async ({ page }) => {
    await page.goto("/Calculator");
    await hydrated(page);
    // Measured 2026-10-20 (72-ref-populated-calculator.png): the subtitle
    // sits under the h1; the clone rendered the h1 alone.
    await expect(page.getByText("All your calculation needs in one place")).toBeVisible();
  });

  test("S5-AB2 Calculator: the header History toggle, panel hidden by default", async ({ page }) => {
    await page.goto("/Calculator");
    await hydrated(page);
    const toggle = page.getByRole("button", { name: "History" });
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    // the ref's panel only exists while toggled (72-ref-populated-
    // calculator2.png: display "5", NO history chrome until the click)
    await expect(page.getByRole("complementary", { name: "Calculation History" })).toHaveCount(0);
  });

  test("S5-AB3 Calculator: the toggle opens the Calculation History panel; the bottom h2 card is gone", async ({ page }) => {
    await page.goto("/Calculator");
    await hydrated(page);
    await page.getByRole("button", { name: "History" }).click();
    const panel = page.getByRole("complementary", { name: "Calculation History" });
    await expect(panel).toBeVisible();
    // the ref's title reads "Calculation History" (h3 16px/700 on the ref —
    // the clone renders the same text at the same size as an h2: the R1
    // heading-order contract owns the level, the measurement owns the copy)
    await expect(panel.getByRole("heading", { name: "Calculation History" })).toBeVisible();
    await expect(panel.getByRole("button", { name: "Clear History" })).toBeVisible();
    // the zero-era bottom SectionCard (h2 "History" + "Empty history") is gone
    await expect(page.getByRole("heading", { name: "History", exact: true })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Empty history/ })).toHaveCount(0);
  });

  test("S5-AB4 Calculator: an evaluated entry renders the ref's expr / = result card", async ({ page }) => {
    await page.goto("/Calculator");
    await hydrated(page);
    await page.getByRole("button", { name: "Insert 2" }).click();
    await page.getByRole("button", { name: "Insert +" }).click();
    await page.getByRole("button", { name: "Insert 3" }).click();
    await page.getByRole("button", { name: "Equals" }).click();
    await page.getByRole("button", { name: "History" }).click();
    const panel = page.getByRole("complementary", { name: "Calculation History" });
    // the ref's entry: the expression spaced ("2 + 3") above the bold result ("= 5").
    // Residue-tolerant (the e2e db is a living scratch db): assert on the
    // NEWEST entry — the panel sorts descending by createdAt, so the first
    // listitem is the entry this test just evaluated.
    const newest = panel.getByRole("listitem").first();
    await expect(newest.getByText("2 + 3")).toBeVisible();
    await expect(newest.getByText("= 5")).toBeVisible();
  });

  test("S5-AB5 Math Solver: the measured header subtitle", async ({ page }) => {
    await page.goto("/MathSolver");
    await hydrated(page);
    // Measured 2026-10-20: "Type a problem or upload an image to get
    // step-by-step solutions" (the clone's "Snap a photo or type a problem"
    // was invented copy).
    await expect(
      page.getByText("Type a problem or upload an image to get step-by-step solutions"),
    ).toBeVisible();
  });

  test("S5-AB6 Math Solver: Recent Problems is a free-standing h2; the SectionCard title is gone", async ({ page }) => {
    await page.goto("/MathSolver");
    await hydrated(page);
    // Measured: h2 18px/600 slate-800 in the space-y-6 stack — not a card
    // header (the chain read: no borderB, parent pad 0/0).
    await expect(page.getByRole("heading", { name: "Recent Problems" })).toBeVisible();
    await expect(page.getByText("Recent solutions")).toHaveCount(0);
  });

  test("S5-AB7 GradeTracker: per-subject cards render chip + avg + the Progress-to-A row", async ({ page }) => {
    await page.goto("/GradeTracker");
    await hydrated(page);
    // Seed: Mathematics 92+85 → 89, Chemistry 78, English 88, Physics 95 —
    // four populated subject cards (the ref's card anatomy measured with
    // one probe subject; the grid cell measured ≈547px on a 1116px canvas
    // = sm:grid-cols-2). The measured logic: progress = avg/90 (50 → 56%).
    const cards = page.getByTestId("gt-subject-card");
    await expect(cards).toHaveCount(4);
    const math = cards.filter({ hasText: "Mathematics" });
    await expect(math).toHaveCount(1);
    await expect(math.getByText("89%")).toBeVisible();
    await expect(math.getByText("Progress to A (90%)")).toBeVisible();
    // Chemistry has ONE seeded grade (78/100), so its avg and its Recent
    // Grades pill are both "78%" — the ref dodges the collision with a 1dp
    // avg ("50.0%"), but the clone's integer convention (the measured
    // Overall card) cannot; the avg hook scopes the assertion. (AP-117)
    await expect(cards.filter({ hasText: "Chemistry" }).getByTestId("gt-subject-avg")).toHaveText("78%");
    // the invented "By subject" wrapper is gone
    await expect(page.getByRole("heading", { name: "By subject" })).toHaveCount(0);
  });

  test("S5-AB8 GradeTracker: each subject card carries the Recent Grades pills", async ({ page }) => {
    await page.goto("/GradeTracker");
    await hydrated(page);
    const cards = page.getByTestId("gt-subject-card");
    const math = cards.filter({ hasText: "Mathematics" });
    await expect(math.getByText("Recent Grades")).toBeVisible();
    // Mathematics has two seeded grades → two percent pills
    await expect(math.getByText("92%")).toBeVisible();
    await expect(math.getByText("85%")).toBeVisible();
  });
});
