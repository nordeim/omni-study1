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
  page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true");

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
    // S124/BY15: neutral-200/950, NOT gray — the gray family's 200 is
    // rgb(229,231,233); these measured bytes are the neutral ramp's.
    expect(border).toBe("rgb(229, 229, 229)"); // neutral-200 — measured.
    const color = await outline.evaluate((el) => getComputedStyle(el).color);
    expect(color).toBe("rgb(10, 10, 10)"); // neutral-950 — measured.
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
  test("Clear is a red-text half-width key; '=' is a gradient key; no % key on Basic (S190/EN re-anchored)", async ({ page }) => {
    await page.goto("/Calculator");
    await hydrated(page);
    const clear = page.getByRole("button", { name: "Clear" });
    await expect(clear).toBeVisible();
    // S190/EN: the measured reference key is red-600 (rgb(220,38,38)) on
    // the near-black rgb(10,10,10) — but that pair measures 4.10:1 (axe
    // color-contrast, serious; the a11y-sweep's zero-violation pin). The
    // Family F precedent applies: ONE step for contrast — red-500
    // (rgb(239,68,68)) on the same near-black measures 5.27:1.
    expect(await clear.evaluate((el) => getComputedStyle(el).color)).toBe("rgb(239, 68, 68)");
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

  test("the display area renders the softest gradient behind a 36px value (S190/EN re-anchored)", async ({ page }) => {
    await page.goto("/Calculator");
    await hydrated(page);
    // S190/EN: the 36px face moved onto the RESULT line (the measured
    // anatomy — the container now carries the h-6 expression line + the
    // break-all result; the old container-level text-4xl retired).
    const result = page.locator('[data-testid="calc-result"]');
    await expect(result).toBeVisible();
    expect(await result.evaluate((el) => getComputedStyle(el).fontSize)).toBe("36px");
    const area = page.locator(".sf-calc-display").first();
    const bg = await area.evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(bg).toContain("linear-gradient");
    expect(bg).toContain("rgb(245, 243, 255)"); // softest (violet-50) — measured (the ref's own violet-50→indigo-50 pair).
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
    // The composer hint (measured copy — S192/EP re-anchor: the reference
    // reads "for new line", no article; the old pin held the clone's
    // drifted "for a new line").
    await expect(page.getByText("Press Enter to send, Shift + Enter for new line")).toBeVisible();
  });

  // ---- S119/BT6 — the composer parity decision (P1) ---------------------------
  // The reference's composer is a <textarea rows=2> (measured live:
  // 60px tall, resize-none, the "Ask me anything..." placeholder); the
  // clone's single-line Input made the pinned hint above a lie. The fix
  // ships the reference's element + geometry AND honors the hint's promise
  // (Enter sends, Shift+Enter inserts a real newline — the reference's own
  // Shift+Enter sends, measured; delivering the promised behavior is the
  // superset half of the decision).
  test("S119/BT6: the composer is the reference's 2-row textarea with the measured placeholder", async ({ page }) => {
    await page.goto("/AIAssistant");
    await hydrated(page);
    const composer = page.getByLabel("Message the assistant");
    await expect(composer).toBeVisible();
    await expect(composer).toHaveAttribute("rows", "2");
    expect(await composer.evaluate((el) => getComputedStyle(el).resize)).toBe("none");
    // the reference's measured geometry: 2 text rows + the 8/12 padding
    expect(await composer.evaluate((el) => Math.round(el.getBoundingClientRect().height))).toBeGreaterThanOrEqual(60);
    await expect(composer).toHaveAttribute("placeholder", "Ask me anything...");
  });

  test("S119/BT6: Shift+Enter inserts a newline and Enter sends (the hint's promise, honored)", async ({ page }) => {
    // The send is MOCKED and GATED (the resilience A-family shape): a real
    // AI POST would consume the demo user's 20/15-min AI budget — exhausted
    // by the s14 C1 pin in the earlier chunk (the documented budget
    // ordering) — and the held response makes the optimistic append
    // deterministic to observe.
    let release!: () => void;
    const gate = new Promise<void>((resolve) => (release = resolve));
    await page.route("**/api/ai/chat", async (route) => {
      await gate;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      });
    });
    await page.goto("/AIAssistant");
    await hydrated(page);
    const composer = page.getByLabel("Message the assistant");
    await composer.click();
    await composer.fill("line one");
    await composer.press("Shift+Enter");
    await composer.type("line two");
    await expect(composer).toHaveValue("line one\nline two");
    // Enter (no shift) sends: the composer clears immediately and the
    // optimistic user message renders in the transcript (held route).
    await composer.press("Enter");
    await expect(composer).toHaveValue("");
    // the optimistic user bubble (the transcript renders divs, not list
    // items — the self-end user-message class is the stable shape)
    await expect(page.locator("div.self-end").filter({ hasText: "line one" })).toBeVisible();
    // Release the send: it succeeds, so the composer STAYS cleared (a
    // failure would bounce the text back — the resilience A1 contract).
    release();
    await expect(composer).toHaveValue("");
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

  test("S5-AB6 Math Solver: NO history chrome at zero (the reference's measured zero-state)", async ({ page }) => {
    await page.goto("/MathSolver");
    await hydrated(page);
    // s70 probe #6 + the s122 live re-measure: the reference renders NO
    // history section at zero. The clone's unconditional heading + the
    // invented "Problems you solve will be saved here." copy was the
    // deviation (S122/BW2) — the heading now appears only with history
    // (the populated pin below), matching the reference both ways.
    await expect(page.getByRole("heading", { name: "Recent Problems" })).toHaveCount(0);
    await expect(page.getByText("Problems you solve will be saved here.")).toHaveCount(0);
    await expect(page.getByText("Recent solutions")).toHaveCount(0);
  });

  // S122/BW2 — the persistence half. The solve route never wrote rows
  // (the view's refreshAiMessages fed an empty store forever); it now
  // mirrors the chat route's two-row transaction with surface "solver",
  // written ONLY on a successful reply. This pin solves a trivial problem
  // through the REAL route and asserts the populated anatomy: the s72-
  // measured free-standing h2 (18px/600 slate-800) + the Q/A pair card.
  // The SDK occasionally returns an empty solution (a 502) — retry once.
  // Budget: 1–2 of the demo user's 20/15-min `ai:` requests; nothing else
  // in chunk 3 consumes it (every other AI pin route-mocks, and the s14
  // C1 exhaustion lives in chunk 2 with its own per-chunk-boot limiter).
  // Cleanup: the trailing DELETE keeps the transcript at zero for the
  // next run (the zero-state pin above) — the aged-scratch-db class
  // (S45/S46) applies only to a crashed run; `rm -f db/e2e.db` re-arms it.
  test("S122/BW2: a solved problem persists to Recent Problems (the populated anatomy)", async ({ page }) => {
    await page.goto("/MathSolver");
    await hydrated(page);

    const probe = "BW2 solver persistence probe: what is 2+2? Answer with just the number.";
    let res = await page.request.post("/api/math/solve", { data: { problem: probe } });
    if (!res.ok()) res = await page.request.post("/api/math/solve", { data: { problem: probe } });
    expect(res.ok(), `the solve route answered ${res.status()}`).toBe(true);

    await page.reload();
    await hydrated(page);
    const h2 = page.getByRole("heading", { name: "Recent Problems" });
    await expect(h2).toBeVisible();
    // The measured s72 anatomy: h2 18px/600 slate-800 in the space-y-6
    // stack — not a card header (no borderB, parent pad 0/0).
    const cs = await h2.evaluate((el) => {
      const s = getComputedStyle(el);
      return { fs: s.fontSize, fw: s.fontWeight, color: s.color };
    });
    expect(cs.fs).toBe("18px");
    expect(cs.fw).toBe("600");
    expect(cs.color).toBe("rgb(30, 41, 59)"); // slate-800
    // The pair card: the question + a non-empty answer.
    const card = page
      .locator('[aria-label="Recent Problems"] li', { hasText: "BW2 solver persistence probe" })
      .first();
    await expect(card).toBeVisible();
    const answer = card.locator("p").nth(1);
    await expect(answer).not.toBeEmpty();
    await expect(page.getByText("Recent solutions")).toHaveCount(0);

    // Cleanup — back to the reference's measured zero state.
    await page.request.delete("/api/ai/messages");
  });

  test("S5-AB7 GradeTracker: per-subject cards render chip + avg + the Progress-to-A row", async ({ page }) => {
    await page.goto("/GradeTracker");
    await hydrated(page);
    // Seed (S127/CB4 — the weighted mean): Mathematics 92×1 + 85×0.5 →
    // weighted (92 + 42.5)/1.5 = 89.67 → 90 (was the unweighted 88.5 → 89;
    // the seed's weights are real data the card now honors), Chemistry 78,
    // English 88, Physics 95 — four populated subject cards (the ref's card
    // anatomy measured with one probe subject; the grid cell measured
    // ≈547px on a 1116px canvas = sm:grid-cols-2). The measured logic:
    // progress = avg/90 (50 → 56%).
    const cards = page.getByTestId("gt-subject-card");
    await expect(cards).toHaveCount(4);
    const math = cards.filter({ hasText: "Mathematics" });
    await expect(math).toHaveCount(1);
    await expect(math.getByText("90%", { exact: true })).toBeVisible();
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

// S123/BX6 — the focus timer recorded the NOMINAL duration on an early
// manual complete (start 25:00, complete after 2 minutes → a 1500-second
// session logged: every focus stat silently inflated). The auto path
// (remaining === 0) is unchanged — the full duration. The manual path now
// records the true elapsed (durations.focus - remaining, floored at the
// schema's min-1).
test.describe("S123/BX6: an early manual complete records the elapsed duration", () => {
  test("completing ~1.5s into a 25:00 focus logs < 1500s (was exactly 1500)", async ({ page }) => {
    await page.goto("/FocusTimer");
    await hydrated(page);
    // Start the default 25:00 focus session.
    await page.getByRole("button", { name: /start timer/i }).click();
    // Let ~1.5s elapse (the schema's min-1 bound needs ≥1s).
    await page.waitForTimeout(1500);
    const saved = page.waitForResponse(
      (r) => r.request().method() === "POST" && r.url().includes("/api/focus-sessions"),
    );
    await page.getByRole("button", { name: "Complete session" }).click();
    const res = await saved;
    expect(res.ok()).toBe(true);
    const row = (await res.json()) as { id: string; durationSeconds: number };
    try {
      expect(row.durationSeconds).toBeGreaterThanOrEqual(1);
      // Pre-fix this was exactly 1500 (the nominal 25:00) — any early
      // complete must record the ELAPSED time.
      expect(row.durationSeconds).toBeLessThan(1500);
    } finally {
      // Zero residue on the shared demo user — in a FINALLY (S128/CC4,
      // the AR3 convention).
      await page.request.delete(`/api/focus-sessions/${row.id}`);
    }
  });
});

// S127/CB1 — the focus-timer stale closure (the s127 FE audit's H-1):
// `complete`'s useCallback dep array omitted `remaining`, so the memoized
// callback closed over the MOUNT-time value — `durations.focus - remaining`
// was always 0 and the schema's min-1 floored EVERY session (auto AND
// manual paths) to durationSeconds: 1. The BX6 elapsed fix was dead code
// behind the closure, and the BX6 pin above is blind to it (1 satisfies
// >= 1 && < 1500). This pin drives the AUTO path — the full 25:00 elapsed
// on the fake clock — and demands the exact nominal duration.
test.describe("S127/CB1: the auto-path completion records the full duration", () => {
  test("a 25:00 focus session run to zero logs exactly 1500s (was 1)", async ({ page }) => {
    test.setTimeout(90_000);
    // Fake timers BEFORE boot — the 1s interval rides the fake clock.
    await page.clock.install();
    await page.goto("/FocusTimer");
    await hydrated(page);
    await page.getByRole("button", { name: /start timer/i }).click();
    const saved = page.waitForResponse(
      (r) => r.request().method() === "POST" && r.url().includes("/api/focus-sessions"),
    );
    // Run the full 25:00 — remaining reaches 0, the deferred complete
    // fires (its setTimeout is fake-timer scheduled too), and the POST
    // hits the real network. runFor (NOT fastForward — the jump fires
    // each timer at most ONCE, so the 1s interval would decrement a single
    // step) drains all 1500 interval firings.
    await page.clock.runFor(25 * 60 * 1000);
    const res = await saved;
    expect(res.ok()).toBe(true);
    const row = (await res.json()) as { id: string; durationSeconds: number };
    try {
      // Pre-fix: the stale closure computed 1500 - 1500 = 0 → max(1, 0) = 1.
      expect(row.durationSeconds).toBe(1500);
    } finally {
      // Zero residue on the shared demo user — in a FINALLY (S128/CC4, the
      // AR3 convention): a red assertion must not leak the row into the
      // chunk-shared db.
      await page.request.delete(`/api/focus-sessions/${row.id}`);
    }
  });
});

// S162/DK1 (the s162 audit B/F-1): the events mutation CB8 split. The
// pre-DK1 events mutations rejected on the refresh leg after a COMMITTED
// write — apiSend (the POST) then fetchAndSet (the GET, 20 s CD2
// deadline), and the GET's failure rejected the whole mutation: the
// view's catch showed "Something went wrong." in the STILL-OPEN dialog,
// fired no success toast, and kept the form armed — a RETRY re-POSTed
// and DUPLICATED the event (the CB8 letter: a false mutation-failure
// claim on a committed row). The CB8-twin network-mock shape (the
// S127/S160 family): the POST continues (the write lands server-side),
// the GET aborts (the flaky-refresh condition) — create an event
// through the real dialog and assert the honest success surface. RED
// pre-fix: no toast, the dialog open with the false-failure copy.
test.describe("S162/DK1 · the events CB8 failure-domain split (Batch DK)", () => {
  test("a committed create + a failed refresh answers the success toast (never the false save-failure)", async ({ page }) => {
    await page.goto("/Events");
    await hydrated(page);
    // The committed-write + flaky-refresh condition: the write continues
    // (201 server-side), the refresh GET aborts.
    await page.route("**/api/events**", (route) => {
      if (route.request().method() === "GET") return route.abort();
      return route.continue();
    });
    await page.getByRole("button", { name: "New Event" }).click();
    await page.locator("#event-title").fill("S162-DK1 probe");
    await page.locator("#event-start").fill("2026-11-09T10:00");
    await page.getByRole("button", { name: "Create event" }).click();
    // The write committed: the success toast lands through the aria-live
    // stack and the dialog CLOSES. Pre-fix: the mutation rejected on the
    // aborted refresh → "Something went wrong." in the open dialog, no
    // success toast, the form armed for the duplicate-creating retry.
    await expect(page.getByText("Event created.")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(page.getByText("Something went wrong.")).toBeHidden();
  });
});

// ---------------------------------------------------------------------------
// S190 · Batch EN — the Focus Timer chrome port (the never-measured half:
// the S5-E port measured the stats/ring/play; the panel card, the mode
// row, the preset cards, the ring interior, the subject select, and the
// control row were first measured 2026-11-15 in LIGHT mode). See
// docs/remediation-plan-session190.md §3.3.
// ---------------------------------------------------------------------------
test.describe("S190 · the Focus Timer chrome port", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/FocusTimer");
    await hydrated(page);
  });

  test("EN8: the timer rides a white rounded-3xl panel on the max-w-2xl column", async ({ page }) => {
    const timer = page.getByRole("timer");
    await expect(timer).toBeVisible();
    const panel = await timer.evaluate((el: HTMLElement) => {
      let node: HTMLElement | null = el;
      while (node) {
        const cls = node.getAttribute("class") || "";
        if (/rounded-3xl/.test(cls)) return { cls: cls.slice(0, 120) };
        node = node.parentElement;
      }
      return null;
    });
    expect(panel).not.toBeNull();
    expect(panel?.cls).toContain("bg-white");
    expect(panel?.cls).toContain("shadow-xl");
    // The column is the measured 672px (max-w-2xl), not the old 448px.
    const colW = await timer.evaluate((el: HTMLElement) => {
      let node: HTMLElement | null = el;
      while (node) {
        const cls = node.getAttribute("class") || "";
        if (/max-w-2xl/.test(cls)) return Math.round(node.getBoundingClientRect().width);
        node = node.parentElement;
      }
      return 0;
    });
    expect(colW).toBeGreaterThanOrEqual(670);
  });

  test("EN9: the mode row is freestanding 36px pills with the gradient active state", async ({ page }) => {
    const focus = page.getByRole("button", { name: /Focus/i, exact: true });
    await expect(focus).toBeVisible();
    const cs = await focus.evaluate((el) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return { h: Math.round(r.height), pad: s.padding, bgImage: s.backgroundImage, color: s.color };
    });
    expect(cs.h).toBe(36); // measured (was 46)
    expect(cs.pad).toBe("8px 16px"); // measured px-4 py-2
    expect(cs.bgImage).toContain("linear-gradient"); // the active pill is the sf-gradient
    expect(cs.color).toBe("rgb(255, 255, 255)");
    // The group container is NOT the old slate-100 pill.
    const group = await focus.evaluate((el) => {
      const parent = el.parentElement;
      const s = parent ? getComputedStyle(parent) : null;
      return parent && s ? { bg: s.backgroundColor, cls: (parent.getAttribute("class") || "").slice(0, 80) } : null;
    });
    expect(group?.bg).toBe("rgba(0, 0, 0, 0)"); // transparent row (measured)
    // An inactive pill is the transparent slate-600 text face.
    const short = page.getByRole("button", { name: "Short Break" });
    const shortCs = await short.evaluate((el) => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, color: s.color, h: Math.round(el.getBoundingClientRect().height) };
    });
    expect(shortCs.bg).toBe("rgba(0, 0, 0, 0)");
    expect(shortCs.color).toBe("rgb(71, 85, 105)"); // slate-600
    expect(shortCs.h).toBe(36);
  });

  test("EN10: the preset cards are the 64px tinted two-line family (name first)", async ({ page }) => {
    const pomo = page.getByRole("button", { name: /Pomodoro/ });
    await expect(pomo).toBeVisible();
    const cs = await pomo.evaluate((el) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return { h: Math.round(r.height), pad: s.padding, bg: s.backgroundColor, color: s.color, border: s.borderWidth };
    });
    expect(cs.h).toBe(64); // measured (was 32)
    expect(cs.pad).toBe("12px 24px"); // measured px-6 py-3
    expect(cs.bg).toBe("rgb(237, 233, 254)"); // the ACTIVE violet-100 tint (measured)
    expect(cs.color).toBe("rgb(109, 40, 217)"); // violet-700
    expect(cs.border).toBe("0px"); // borderless (the old outline Button)
    // The two-line typography: the NAME is the semibold line, the durations the faded xs line.
    const lines = await pomo.evaluate((el) =>
      [...el.querySelectorAll("span, p")].filter((c) => c.textContent.trim()).map((c) => {
        const s = getComputedStyle(c);
        return { text: c.textContent.trim(), fs: s.fontSize, fw: s.fontWeight, op: s.opacity };
      }),
    );
    const name = lines.find((l) => l.text === "Pomodoro");
    const durations = lines.find((l) => l.text === "25/5/15");
    expect(name?.fw).toBe("600"); // font-semibold — the name leads (the clone's pair was inverted)
    expect(durations?.fs).toBe("12px"); // text-xs
    // The inactive preset is the slate-100 tint.
    const deep = page.getByRole("button", { name: /Deep Work/ });
    const deepBg = await deep.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(deepBg).toBe("rgb(241, 245, 249)"); // slate-100 (measured)
  });

  test("EN11: the ring interior carries the brain icon, the mono clock and the capitalize label", async ({ page }) => {
    const timer = page.getByRole("timer");
    await expect(timer).toBeVisible();
    const interior = await timer.evaluate((el) => {
      const holder = el.parentElement;
      const icon = holder ? holder.querySelector("svg.lucide-brain") : null;
      return {
        hasBrain: !!icon,
        clockFont: getComputedStyle(el).fontFamily,
        label: holder && holder.lastElementChild ? holder.lastElementChild.textContent.trim() : null,
        labelCls: holder && holder.lastElementChild ? (holder.lastElementChild.getAttribute("class") || "") : "",
      };
    });
    expect(interior.hasBrain).toBe(true); // the measured lucide-brain w-8 mb-2 violet
    expect(interior.clockFont).toContain("mono"); // font-mono (measured; was tabular-nums)
    expect(interior.labelCls).toContain("capitalize"); // the measured label face
  });

  test("EN12: the subject select is compact with the placeholder; the controls flank the play", async ({ page }) => {
    const select = page.getByRole("combobox");
    await expect(select).toBeVisible();
    const cs = await select.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { w: Math.round(r.width), text: el.textContent.trim() };
    });
    // The measured compact trigger (~192px), never the old full-width 360px.
    expect(cs.w).toBeLessThanOrEqual(260);
    // The placeholder face at no-selection — the measured "Select subject"
    // (the old clone rendered the literal "No subject" option as the value).
    expect(cs.text).toBe("Select subject");
    // The control row: Reset (48px near-black) → play (64px gradient) → Complete (48px near-black).
    const play = page.getByRole("button", { name: /start timer|resume timer|pause timer/i });
    const reset = page.getByRole("button", { name: "Reset timer" });
    const complete = page.getByRole("button", { name: "Complete session" });
    for (const [name, btn] of [["reset", reset], ["complete", complete]] as const) {
      const b = await btn.evaluate((el) => {
        const s = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return { w: Math.round(r.width), bg: s.backgroundColor, radius: s.borderRadius };
      });
      expect(b.w).toBe(48); // the measured near-black round controls
      expect(b.bg).toBe("rgb(10, 10, 10)");
      // fully round (the ref's own serialization reads 9999px; the clone's
      // Tailwind v4 rounded-full computes the infinity clamp — both round)
      expect(parseFloat(b.radius)).toBeGreaterThanOrEqual(9999);
      expect(name).toBeTruthy();
    }
    const playW = await play.evaluate((el) => Math.round(el.getBoundingClientRect().width));
    expect(playW).toBe(64); // the standing measured play — unchanged
    // The order: reset LEFT of play, complete RIGHT of play.
    const xs = await Promise.all(
      [reset, play, complete].map((b) => b.evaluate((el) => Math.round(el.getBoundingClientRect().x))),
    );
    expect(xs[0]).toBeLessThan(xs[1]);
    expect(xs[1]).toBeLessThan(xs[2]);
  });
});

// ---------------------------------------------------------------------------
// S192 · Batch EP — the AI-chrome parity port (the never-measured half:
// the S5-N/S8-M/S119/S190 pins measured the quick-action titles/icons, the
// composer element and the copy — the grid anatomy, the card anatomy, the
// empty-state hero, the big chat card, the header row and the subtitle
// were first measured 2026-11-16; see docs/remediation-plan-session192.md).
// ---------------------------------------------------------------------------
test.describe("S192 · the AI-chrome + calendar-day-header parity port", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/AIAssistant");
    await hydrated(page);
  });

  test("EP1: the quick-action grid is 3 columns at desktop with a 16px gap", async ({ page }) => {
    const grid = page.locator('[aria-label="Quick actions"]');
    await expect(grid.locator("button").first()).toBeVisible();
    const cs = await grid.evaluate((el) => {
      const s = getComputedStyle(el);
      return { cols: s.gridTemplateColumns.split(" ").length, gap: s.gap };
    });
    expect(cs.cols).toBe(3); // measured grid-cols-3 @1440 (was 2)
    expect(cs.gap).toBe("16px"); // measured gap-4 (was 8px)
  });

  test("EP2: the quick card carries the measured anatomy with the a11y-safe heading face", async ({ page }) => {
    const card = page.getByRole("button", { name: "Explain Concept" });
    await expect(card).toBeVisible();
    const cs = await card.evaluate((el) => {
      const s = getComputedStyle(el);
      return { border: s.borderColor, radius: s.borderRadius, pad: s.padding, bg: s.backgroundColor };
    });
    expect(cs.border).toBe("rgb(226, 232, 240)"); // slate-200 (measured; sf-card was slate-100)
    expect(cs.radius).toBe("12px"); // rounded-xl
    expect(cs.pad).toBe("16px"); // p-4
    // The title face: the reference ships a REAL h3, but its own heading
    // order (h1 view header → h3 card titles) trips axe's heading-order
    // rule — the clone's stand-in is the span heading role at level 2
    // (visually byte-identical: the same classes, the same computed
    // styles). The S190 Clear-key precedent: the axe-clean contract
    // outranks exact DOM parity.
    const title = card.getByRole("heading", { name: "Explain Concept" });
    const tcs = await title.evaluate((el) => {
      const s = getComputedStyle(el);
      return { tag: el.tagName, role: el.getAttribute("role"), level: el.getAttribute("aria-level"), mt: s.marginTop, fs: s.fontSize, fw: s.fontWeight };
    });
    expect(tcs.tag).toBe("SPAN");
    expect(tcs.role).toBe("heading");
    expect(tcs.level).toBe("2");
    expect(tcs.mt).toBe("0px"); // the icon's mb-3 owns the spacing (the old span carried mt-2)
    expect(tcs.fs).toBe("16px");
    expect(tcs.fw).toBe("600");
    // The icon: 32px + the measured mb-3 gap to the title.
    const icon = card.locator("svg").first();
    const ics = await icon.evaluate((el) => {
      const s = getComputedStyle(el);
      return { w: s.width, mb: s.marginBottom };
    });
    expect(ics.w).toBe("32px");
    expect(ics.mb).toBe("12px");
  });

  test("EP3: the AI header is the measured 24px row with the tutor subtitle", async ({ page }) => {
    const h1 = page.getByRole("heading", { name: "AI Study Assistant" });
    await expect(h1).toBeVisible();
    const fs = await h1.evaluate((el) => getComputedStyle(el).fontSize);
    expect(fs).toBe("24px"); // text-2xl (measured; the clone's size="lg" was 30px)
    await expect(page.getByText("Your personal AI tutor, available 24/7")).toBeVisible();
  });

  test("EP4: the empty-state hero is the measured py-20 wand-sparkles block INSIDE the chat card", async ({ page }) => {
    const hero = page.getByRole("heading", { name: "How can I help you study today?" });
    await expect(hero).toBeVisible();
    const hcs = await hero.evaluate((el) => {
      const s = getComputedStyle(el);
      return { fs: s.fontSize, fw: s.fontWeight, tag: el.tagName, role: el.getAttribute("role") };
    });
    // The S192/EP axe-clean adjudication: the span heading role at level 2
    // (the reference's h3 trips heading-order after the h1 view header —
    // its own a11y gap, not replicated).
    expect(hcs.tag).toBe("SPAN");
    expect(hcs.role).toBe("heading");
    expect(hcs.fs).toBe("20px"); // text-xl
    expect(hcs.fw).toBe("600");
    await expect(page.getByText("Ask me anything - explanations, summaries, problem solving, and more!")).toBeVisible();
    // The 64px violet-300 wand-sparkles icon (the @theme-pinned step).
    const icon = hero.evaluate((el) => {
      const svg = el.parentElement?.querySelector("svg") ?? null;
      return svg
        ? { w: getComputedStyle(svg).width, color: getComputedStyle(svg).color, mb: getComputedStyle(svg).marginBottom }
        : null;
    });
    const ics = await icon;
    expect(ics?.w).toBe("64px");
    expect(ics?.color).toBe("rgb(196, 181, 253)"); // violet-300 #c4b5fd
    expect(ics?.mb).toBe("16px"); // mb-4
    // The hero wrapper carries the measured py-20 + centering.
    const wrap = await hero.evaluate((el) => {
      const w = el.parentElement;
      const s = w ? getComputedStyle(w) : null;
      return w && s ? { cls: w.getAttribute("class") || "", pt: s.paddingTop, ta: s.textAlign } : null;
    });
    expect(wrap?.pt).toBe("80px"); // py-20
    expect(wrap?.ta).toBe("center");
    // The hero sits INSIDE the chat card (an ancestor carries rounded-2xl).
    const inCard = await hero.evaluate((el) => {
      let node: Element | null = el;
      while (node) {
        const cls = node.getAttribute("class") || "";
        if (/rounded-2xl/.test(cls)) return true;
        node = node.parentElement;
      }
      return false;
    });
    expect(inCard).toBe(true);
  });

  test("EP5: the chat card is the measured min-h-500 rounded-2xl panel with the composer INSIDE", async ({ page }) => {
    const composer = page.getByLabel("Message the assistant");
    await expect(composer).toBeVisible();
    const card = await composer.evaluate((el: HTMLElement) => {
      let node: HTMLElement | null = el;
      while (node) {
        const cls = node.getAttribute("class") || "";
        if (/rounded-2xl/.test(cls) && /min-h-\[500px\]|flex/.test(cls)) {
          const s = getComputedStyle(node);
          return { cls: cls.slice(0, 140), h: Math.round(node.getBoundingClientRect().height), radius: s.borderRadius, border: s.borderColor, minH: s.minHeight };
        }
        node = node.parentElement;
      }
      return null;
    });
    expect(card).not.toBeNull();
    expect(card?.radius).toBe("16px"); // rounded-2xl
    expect(card?.border).toBe("rgb(226, 232, 240)"); // border-slate-200
    expect(card?.minH).toBe("500px"); // min-h-[500px]
    expect(card?.h).toBeGreaterThanOrEqual(500);
    // The composer rides the card's border-t footer (measured p-4).
    const footer = await composer.evaluate((el) => {
      const f = el.closest("form");
      const s = f ? getComputedStyle(f) : null;
      return f && s ? { pad: s.padding, borderTop: s.borderTopWidth + " " + s.borderTopColor } : null;
    });
    expect(footer?.pad).toBe("16px"); // p-4
    expect(footer?.borderTop).toBe("1px rgb(241, 245, 249)"); // border-t border-slate-100
    // The composer row gap is the measured gap-3.
    const rowGap = await composer.evaluate((el) => {
      const row = el.parentElement;
      return row ? getComputedStyle(row).gap : null;
    });
    expect(rowGap).toBe("12px");
  });

  test("EP6: the composer is the measured textarea + icon-only gradient send + left hint", async ({ page }) => {
    const composer = page.getByLabel("Message the assistant");
    await expect(composer).toBeVisible();
    const ccs = await composer.evaluate((el) => {
      const s = getComputedStyle(el);
      return { minH: s.minHeight, maxH: s.maxHeight, fs: s.fontSize };
    });
    expect(ccs.minH).toBe("60px"); // min-h-[60px]
    expect(ccs.maxH).toBe("120px"); // max-h-[120px] (measured; the clone had none)
    expect(ccs.fs).toBe("14px"); // md:text-sm at desktop
    const send = page.getByLabel("Send message");
    await expect(send).toBeVisible();
    const scs = await send.evaluate((el) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height), bg: s.backgroundImage, text: el.textContent.trim() };
    });
    expect(scs.h).toBe(60); // h-[60px]
    expect(scs.bg).toContain("linear-gradient"); // the gradient send
    expect(scs.text).toBe(""); // ICON-ONLY — the "Send" text retires (measured)
    const icon = send.locator("svg");
    await expect(icon).toHaveCount(1);
    // The hint: the reference's exact copy, LEFT-aligned under the row.
    const hint = page.getByText("Press Enter to send, Shift + Enter for new line");
    await expect(hint).toBeVisible();
    const hcs = await hint.evaluate((el) => {
      const s = getComputedStyle(el);
      return { ta: s.textAlign, fs: s.fontSize };
    });
    expect(hcs.ta).toBe("start"); // not centered (measured)
    expect(hcs.fs).toBe("12px"); // text-xs
  });

  test("EP8: the view rides the measured max-w-5xl wrapper", async ({ page }) => {
    // The reference was measured at 1440x900 (the wrapper caps at 1024);
    // the suite's default viewport is narrower, so widen first — at 1440
    // the content box is 1116px and the max-w-5xl cap engages.
    await page.setViewportSize({ width: 1440, height: 900 });
    const h1 = page.getByRole("heading", { name: "AI Study Assistant" });
    await expect(h1).toBeVisible();
    const wrapW = await h1.evaluate((el: HTMLElement) => {
      let node: HTMLElement | null = el;
      while (node) {
        const cls = node.getAttribute("class") || "";
        if (/max-w-5xl/.test(cls)) return Math.round(node.getBoundingClientRect().width);
        node = node.parentElement;
      }
      return 0;
    });
    expect(wrapW).toBe(1024); // max-w-5xl @1440 (measured; the transcript was max-w-3xl)
  });

  test("EP6b: the quick grid is 2 columns at mobile (the md:grid-cols-3 breakpoint)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const grid = page.locator('[aria-label="Quick actions"]');
    await expect(grid.locator("button").first()).toBeVisible();
    const cols = await grid.evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(" ").length);
    expect(cols).toBe(2); // measured 171px×2 @390 (the reference's own mobile grid)
  });
});
