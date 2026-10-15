import { expect, test, type Page } from "@playwright/test";

/**
 * Session-6 parity pins — populated-state row designs.
 *
 * Every pin here was measured on the live reference
 * (https://omni-study1.base44.app, authed) AFTER creating real test data
 * there (tasks with priority/repeat/due dates, an assignment, an exam) —
 * the first session able to measure the reference's POPULATED rows. See
 * docs/remediation-plan-session6.md for the measured values:
 *
 *  S6-A task card rows (round priority checkbox, pill meta, hover actions,
 *      borderless filter panel)   S6-B task dialog fields (priority/repeat/
 *      myDay/subtasks)            S6-C MyDay amber progress card +
 *      Suggestions                S6-D dashboard bare rows
 *  S6-E assignment rows + gradient progress slider
 *      S6-F exam card grid        S6-G calendar cells + legend + day detail
 */

const hydrated = (page: Page) =>
  page.waitForFunction(() => document.documentElement.style.getPropertyValue("--sf-primary") !== "");

const rgb = (r: number, g: number, b: number) => `rgb(${r}, ${g}, ${b})`;

// `rounded-full` (border-radius: 9999px) serializes in exponential form in
// Chromium computed styles — accept both (trap 7/10 serialization family).
const isRound = (radius: string) => radius === "9999px" || radius === "3.35544e+07px";

test.describe("S6-A · populated task card rows", () => {
  test("rows are standalone bordered cards with r12 + slate-200 border", async ({ page }) => {
    await page.goto("/Tasks");
    await hydrated(page);
    const first = page.locator('[aria-label="Task rows"] > *').first();
    await expect(first).toBeVisible();
    const cs = await first.evaluate((el) => {
      const s = getComputedStyle(el);
      return { radius: s.borderRadius, border: s.borderTopColor + " " + s.borderTopWidth, bg: s.backgroundColor };
    });
    expect(cs.radius).toBe("12px");
    expect(cs.border).toContain(rgb(226, 232, 240));
    expect(cs.bg).toBe(rgb(255, 255, 255));
  });

  test("the checkbox is a 24px round control with a 2px priority border", async ({ page }) => {
    await page.goto("/Tasks");
    await hydrated(page);
    // Seeded "Read chapter 4 — vectors" has priority high → red-400 border.
    const row = page.locator('[aria-label="Task rows"] > *', { hasText: "Read chapter 4" }).first();
    const cb = row.locator("button").first();
    const cs = await cb.evaluate((el) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return { w: r.width, h: r.height, radius: s.borderRadius, border: s.border, color: s.borderTopColor };
    });
    expect(cs.w).toBe(24);
    expect(cs.h).toBe(24);
    expect(isRound(cs.radius)).toBe(true);
    expect(cs.border).toContain("2px");
    expect(cs.color).toBe(rgb(248, 113, 113)); // red-400 (high)
  });

  test("the title computes slate-700 and due/repeat render as pills", async ({ page }) => {
    await page.goto("/Tasks");
    await hydrated(page);
    const row = page.locator('[aria-label="Task rows"] > *', { hasText: "Weekly vocabulary review" }).first();
    const title = row.locator("p.font-medium").first();
    expect(await title.evaluate((el) => getComputedStyle(el).color)).toBe(rgb(51, 65, 85)); // slate-700
    // Repeat pill: violet-100 bg / violet-600 text.
    const repeat = row.locator("span", { hasText: "weekly" }).first();
    const pill = await repeat.evaluate((el) => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, color: s.color, radius: s.borderRadius };
    });
    expect(pill.bg).toBe(rgb(237, 233, 254)); // violet-100
    expect(pill.color).toBe(rgb(124, 58, 237)); // violet-600
    expect(isRound(pill.radius)).toBe(true);
  });

  test("row actions are hover-revealed h-8 ghost buttons; the active star is violet", async ({ page }) => {
    await page.goto("/Tasks");
    await hydrated(page);
    const row = page.locator('[aria-label="Task rows"] > *', { hasText: "Read chapter 4" }).first();
    const star = row.locator('[aria-label*="important" i]').first();
    await expect(star).toBeVisible();
    const color = await star.evaluate((el) => getComputedStyle(el).color);
    expect(color).toBe(rgb(139, 92, 246)); // violet-500 — not amber
  });

  test("the filter panel is a borderless bordered-r column with r12 16px buttons", async ({ page }) => {
    await page.goto("/Tasks");
    await hydrated(page);
    const panel = page.locator('[aria-label="Task views"]');
    const cs = await panel.evaluate((el) => {
      const s = getComputedStyle(el);
      return { borderRight: s.borderRightColor + " " + s.borderRightWidth, radius: s.borderRadius, bg: s.backgroundColor };
    });
    expect(cs.borderRight).toContain(rgb(241, 245, 249)); // slate-100 hairline
    expect(cs.radius).toBe("0px");
    expect(cs.bg).toBe("rgba(0, 0, 0, 0)");
    const btn = panel.getByRole("button", { name: /^All Tasks/ }).first();
    const bcs = await btn.evaluate((el) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return { radius: s.borderRadius, font: s.fontSize, h: Math.round(r.height), bg: s.backgroundColor, color: s.color };
    });
    expect(bcs.radius).toBe("12px");
    expect(bcs.font).toBe("16px");
    expect(bcs.h).toBeGreaterThanOrEqual(43);
    expect(bcs.bg).toBe(rgb(245, 243, 255)); // violet-50 active
    expect(bcs.color).toBe(rgb(109, 40, 217)); // violet-700
  });
});

test.describe("S6-B · task dialog reference fields", () => {
  test("the dialog carries My Day / Important toggles + Priority + Repeat selects + subtask adder", async ({ page }) => {
    await page.goto("/Tasks");
    await hydrated(page);
    await page.getByRole("button", { name: "Add Task" }).click();
    const dlg = page.getByRole("dialog");
    await expect(dlg).toBeVisible();
    await expect(dlg.getByRole("button", { name: /My Day/ })).toBeVisible();
    await expect(dlg.getByRole("button", { name: /Important/ })).toBeVisible();
    await expect(dlg.getByText("Priority", { exact: true })).toBeVisible();
    await expect(dlg.getByText("Repeat", { exact: true })).toBeVisible();
    await expect(dlg.getByPlaceholder("Add a subtask...")).toBeVisible();
    await expect(dlg.getByRole("button", { name: "Create Task" })).toBeVisible();
  });
});

test.describe("S6-C · MyDay amber progress card + Suggestions", () => {
  test("the progress card renders the amber gradient + amber label/value", async ({ page }) => {
    await page.goto("/MyDay");
    await hydrated(page);
    const card = page.locator('[aria-label="Today progress"]');
    await expect(card).toBeVisible();
    const cs = await card.evaluate((el) => {
      const s = getComputedStyle(el);
      return { bgImage: s.backgroundImage, border: s.borderTopColor + " " + s.borderTopWidth, radius: s.borderRadius };
    });
    expect(cs.bgImage).toContain("linear-gradient");
    expect(cs.bgImage).toContain("255, 251, 235"); // amber-50 stop (sRGB-exact inline)
    expect(cs.bgImage).toContain("255, 247, 237"); // orange-50 stop
    expect(cs.border).toContain(rgb(254, 243, 199)); // amber-100
    expect(cs.radius).toBe("16px");
    const label = card.getByText("Today's Progress");
    expect(await label.evaluate((el) => getComputedStyle(el).color)).toBe(rgb(180, 83, 9)); // amber-700
  });

  test("a Suggestions section lists tasks not yet in My Day with Add buttons", async ({ page }) => {
    await page.goto("/MyDay");
    await hydrated(page);
    const toggle = page.getByRole("button", { name: "Suggestions" });
    await expect(toggle).toBeVisible();
    await toggle.click();
    // "Weekly vocabulary review" is seeded WITHOUT myDay → suggested.
    // (S9: the seeded overdue "Return library books" adds a second
    // suggestion row — scope the Add button to the specific row.)
    const suggestion = page.locator('[aria-label="Suggested tasks"]', { hasText: "Weekly vocabulary review" });
    await expect(suggestion).toBeVisible();
    const row = suggestion.locator("> div", { hasText: "Weekly vocabulary review" }).first();
    await expect(row.getByRole("button", { name: "Add", exact: true })).toBeVisible();
  });
});

test.describe("S6-D · dashboard Today's Tasks bare rows", () => {
  test("today's tasks render bare p-4 rows with a 20px round checkbox and slate-700 title", async ({ page }) => {
    await page.goto("/Dashboard");
    await hydrated(page);
    const row = page.locator('[aria-label="Today\'s tasks"] > *', { hasText: "Read chapter 4" }).first();
    await expect(row).toBeVisible();
    const cs = await row.evaluate((el) => {
      const s = getComputedStyle(el);
      return { border: s.borderTopWidth, radius: s.borderRadius, gap: s.columnGap || s.gap };
    });
    expect(cs.border).toBe("0px");
    expect(cs.radius).toBe("0px");
    expect(cs.gap).toBe("16px"); // gap-4
    const cb = row.locator('[aria-label*="complete" i]').first();
    const cbcs = await cb.evaluate((el) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return { w: r.width, h: r.height, radius: s.borderRadius, border: s.borderTopWidth };
    });
    expect(cbcs.w).toBe(20);
    expect(cbcs.h).toBe(20);
    expect(isRound(cbcs.radius)).toBe(true);
    expect(cbcs.border).toContain("2px");
    const title = row.locator("p").first();
    expect(await title.evaluate((el) => getComputedStyle(el).color)).toBe(rgb(51, 65, 85)); // slate-700
  });
});

test.describe("S6-E · assignment rows with progress slider", () => {
  test("rows render the blue due-in pill, priority + type pills, and a slider", async ({ page }) => {
    await page.goto("/Assignments");
    await hydrated(page);
    const row = page.locator('[aria-label="Assignment rows"] > *', { hasText: "Problem set 6" }).first();
    await expect(row).toBeVisible();
    // h3 title (not p).
    expect(await row.locator("h3").first().evaluate((el) => getComputedStyle(el).fontWeight)).toBe("600");
    // Due-in pill: blue-50 bg / blue-600 text.
    const due = row.locator("span", { hasText: "days" }).first();
    const dueCs = await due.evaluate((el) => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, color: s.color, radius: s.borderRadius };
    });
    expect(dueCs.bg).toBe(rgb(239, 246, 255)); // blue-50
    expect(dueCs.color).toBe(rgb(37, 99, 235)); // blue-600
    expect(isRound(dueCs.radius)).toBe(true);
    // Priority pill (high → red family; renders lowercase + capitalize).
    await expect(row.getByText("high", { exact: true })).toBeVisible();
    // Type pill.
    await expect(row.getByText("worksheet", { exact: true })).toBeVisible();
    // The interactive slider with a violet % label.
    const slider = row.locator('[role="slider"]');
    await expect(slider).toBeVisible();
    const pct = row.locator("span", { hasText: "%" }).last();
    expect(await pct.evaluate((el) => getComputedStyle(el).color)).toBe(rgb(124, 58, 237)); // violet-600 (measured)
  });

  test("the slider fill renders the violet→indigo gradient", async ({ page }) => {
    await page.goto("/Assignments");
    await hydrated(page);
    const row = page.locator('[aria-label="Assignment rows"] > *', { hasText: "Problem set 6" }).first();
    const fill = row.locator('[data-slot="slider-fill"], .sf-slider-fill').first();
    const bg = await fill.evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(bg).toContain("linear-gradient");
    expect(bg).toContain("139, 92, 246");
    expect(bg).toContain("79, 70, 229");
  });
});

test.describe("S6-F · exam card grid", () => {
  test("exams render a 3-col card grid with an h-2 color strip and amber badge", async ({ page }) => {
    await page.goto("/Exams");
    await hydrated(page);
    const grid = page.locator('[aria-label="Exam cards"]');
    await expect(grid).toBeVisible();
    const cols = await grid.evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(" ").length);
    expect(cols).toBe(3); // lg:grid-cols-3 at 1280px
    const card = grid.locator("> *", { hasText: "Quiz — Integration" }).first();
    await expect(card).toBeVisible();
    const cardCs = await card.evaluate((el) => {
      const s = getComputedStyle(el);
      return { radius: s.borderRadius, overflow: s.overflow };
    });
    expect(cardCs.radius).toBe("16px");
    // The color strip: h-2 with the subject color (math = #8b5cf6 seeded).
    const strip = card.locator('[aria-label="Subject color strip"]').first();
    const stripCs = await strip.evaluate((el) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return { h: r.height, bg: s.backgroundColor };
    });
    expect(stripCs.h).toBe(8);
    expect(stripCs.bg).toBe(rgb(139, 92, 246));
    // Amber urgency badge.
    const badge = card.locator("span", { hasText: /days/ }).first();
    const badgeCs = await badge.evaluate((el) => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, color: s.color };
    });
    expect(badgeCs.bg).toBe(rgb(254, 243, 199)); // amber-100
    expect(badgeCs.color).toBe(rgb(217, 119, 6)); // amber-600
    // Type footer pill + duration line.
    await expect(card.getByText("quiz", { exact: true })).toBeVisible();
    await expect(card.getByText(/45 min/)).toBeVisible();
  });
});

test.describe("S6-G · calendar grid + legend + day detail", () => {
  test("day cells are aspect-square centered with a solid-accent today fill", async ({ page }) => {
    await page.goto("/Calendar");
    await hydrated(page);
    const cell = page.locator('[aria-label="Calendar days"] > button').first();
    await expect(cell).toBeVisible();
    const cs = await cell.evaluate((el) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return { ratio: Math.abs(r.width / r.height - 1), display: s.display, alignItems: s.alignItems };
    });
    expect(cs.ratio).toBeLessThan(0.05);
    expect(cs.display).toContain("flex");
    expect(cs.alignItems).toBe("center");
    // Today = solid accent fill + white text.
    const today = page.locator('[aria-label="Calendar days"] > button[aria-label*="Today" i], [data-today="true"]').first();
    const todayCs = await today.evaluate((el) => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, color: s.color };
    });
    expect(todayCs.bg).toBe(rgb(139, 92, 246));
    expect(todayCs.color).toBe(rgb(255, 255, 255));
  });

  test("the legend renders four colored dot labels", async ({ page }) => {
    await page.goto("/Calendar");
    await hydrated(page);
    const legend = page.locator('[aria-label="Calendar legend"]');
    await expect(legend).toBeVisible();
    for (const label of ["Tasks", "Assignments", "Exams", "Classes"]) {
      await expect(legend.getByText(label, { exact: true })).toBeVisible();
    }
    const dots = await legend.locator("span.rounded-full").evaluateAll((els) =>
      els.map((el) => getComputedStyle(el).backgroundColor),
    );
    expect(dots).toContain(rgb(59, 130, 246)); // blue-500 tasks
    expect(dots).toContain(rgb(245, 158, 11)); // amber-500 assignments
    expect(dots).toContain(rgb(239, 68, 68)); // red-500 exams
    expect(dots).toContain(rgb(16, 185, 129)); // emerald-500 classes
  });

  test("the day detail renders border-l-4 colored rows for today's tasks", async ({ page }) => {
    await page.goto("/Calendar");
    await hydrated(page);
    const detail = page.locator('[aria-label="Day detail"]');
    await expect(detail).toBeVisible();
    // Today is selected by default; the seeded due-today task renders as a
    // blue-50 row with a 4px blue-500 left border.
    const taskRow = detail.locator("button.border-l-4, div.border-l-4", { hasText: "Read chapter 4" }).first();
    await expect(taskRow).toBeVisible();
    const cs = await taskRow.evaluate((el) => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, borderLeft: s.borderLeftColor + " " + s.borderLeftWidth, radius: s.borderRadius };
    });
    expect(cs.bg).toBe(rgb(239, 246, 255)); // blue-50
    expect(cs.borderLeft).toContain(rgb(59, 130, 246)); // blue-500
    expect(cs.borderLeft).toContain("4px");
    expect(cs.radius).toBe("8px");
  });
});
