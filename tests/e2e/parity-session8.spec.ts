import { expect, test, type Page } from "@playwright/test";

/**
 * Session-8 parity pins — deep chrome + view-layout parity.
 *
 * Every pin here was re-measured on the live reference
 * (https://omni-study1.base44.app, authed, 1280×800) after the session-8
 * dual-app audit. See docs/remediation-plan-session8.md for the full
 * measured values:
 *
 *  S8-A sidebar chrome: 6 nav icon swaps, active-nav gradient stop 2 =
 *      indigo-500 (avatarTo), untruncated brand tagline, 36px collapse button
 *  S8-B dashboard flush-body rows (divide-y divide-slate-50, edge-to-edge)
 *  S8-C calendar: simple p-6 month card, text-xl h2, 2 chevron nav buttons,
 *      weekday header text-sm, selected=accent fill / today=100-level tint
 *  S8-D MyDay: 56px amber sun header block, suggestions toggle + rows
 *  S8-E timetable: today HEADER tint (violet-50), ghost week-nav chevrons
 *  S8-F tasks: aside icons + single-row main header + search icon
 *  S8-G notes: h1 inside the left pane, gradient dropdown New button,
 *      bare right pane
 *  S8-H study groups: two-pane layout, bare right pane
 *  S8-I analytics: per-card chart icons, Assignment Status donut,
 *      Subject Workload, Active Items by Priority chips
 *  S8-K calculator Clear icon (rotate-ccw)
 *  S8-L math solver: single column, camera/refresh-cw/sparkles buttons
 *  S8-M AI quick-action icons (brain/file-text/calculator/lightbulb)
 *  S8-N focus timer complete button (check)
 *  S8-O settings tab list (bg-white + border)
 *  S8-P assignments/exams search icons, exam card without location row
 */

const hydrated = (page: Page) =>
  page.waitForFunction(() => document.documentElement.style.getPropertyValue("--sf-primary") !== "");

const rgb = (r: number, g: number, b: number) => `rgb(${r}, ${g}, ${b})`;

// Trap 11: rounded-full serializes as 3.35544e+07px in Chromium computed styles.
const isRound = (radius: string) => radius === "9999px" || radius === "3.35544e+07px";

test.describe("S8-A · Sidebar chrome", () => {
  test("nav icons match the reference's lucide set (6 swaps)", async ({ page }) => {
    await page.goto("/Dashboard");
    await hydrated(page);
    const icons = await page.locator("nav a svg").evaluateAll((svgs) =>
      svgs.map((s) => s.getAttribute("class") ?? ""),
    );
    expect(icons).toHaveLength(20);
    expect(icons[2]).toContain("lucide-square-check-big"); // Tasks
    expect(icons[3]).toContain("lucide-calendar"); // Calendar (no -days)
    expect(icons[3]).not.toContain("lucide-calendar-days");
    expect(icons[4]).toContain("lucide-calendar-days"); // Events
    expect(icons[8]).toContain("lucide-book-open"); // Notes
    expect(icons[14]).toContain("lucide-folder-open"); // Files
    expect(icons[16]).toContain("lucide-calculator"); // Math Solver
    expect(icons[16]).not.toContain("lucide-square-radical");
  });

  test("active nav gradient ends at indigo-500 (avatarTo), not violet-600", async ({ page }) => {
    await page.goto("/Dashboard");
    await hydrated(page);
    const active = page.locator('nav a[aria-current="page"] > span').first();
    const bg = await active.evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(bg).toContain("rgba(139, 92, 246, 0.1)"); // violet-500 stop
    expect(bg).toContain("rgba(99, 102, 241, 0.1)"); // indigo-500 stop
    expect(bg).not.toContain("rgba(124, 58, 237");
  });

  test("brand tagline never truncates", async ({ page }) => {
    await page.goto("/Dashboard");
    await hydrated(page);
    const tag = page.getByText("Your study companion", { exact: true });
    const cs = await tag.evaluate((el) => {
      const s = getComputedStyle(el);
      return { overflow: s.overflow, textOverflow: s.textOverflow, whiteSpace: s.whiteSpace };
    });
    expect(cs.textOverflow).toBe("clip");
    expect(cs.overflow).not.toBe("hidden");
  });

  test("collapse button is the reference's h-9 w-9 rounded-lg", async ({ page }) => {
    await page.goto("/Dashboard");
    await hydrated(page);
    const btn = page.locator('button[aria-label="Collapse sidebar"]');
    const cs = await btn.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return { w: r.width, h: r.height, radius: s.borderRadius };
    });
    // The reference's own button flex-shrinks to 34.2×36 inside the header
    // row — accept the 34–36 band (measured live, S8-A).
    expect(cs.w).toBeGreaterThanOrEqual(34);
    expect(cs.w).toBeLessThanOrEqual(36);
    expect(cs.h).toBeGreaterThanOrEqual(34);
    expect(cs.h).toBeLessThanOrEqual(36);
    expect(cs.radius).toBe("8px"); // rounded-lg
  });
});

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

  test("exam rows are p-4 hover rows with a rounded-full red badge", async ({ page }) => {
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
    const badge = row.locator("span").filter({ hasText: /^(?:\d+d|Today|Tomorrow)$/ }).first();
    const badgeCs = await badge.evaluate((el) => {
      const s = getComputedStyle(el);
      return { radius: s.borderRadius, bg: s.backgroundColor };
    });
    expect(isRound(badgeCs.radius)).toBe(true);
    expect(badgeCs.bg).toBe(rgb(254, 226, 226)); // red-100 (urgency badge, measured)
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
    expect(selCs).toBe(rgb(139, 92, 246)); // violet-500 fill
    const selCls = await selected.evaluate((el) => el.className);
    expect(selCls).not.toContain("hover:bg");
    // Click another day: the old day becomes the tinted TODAY cell. The
    // cells carry transition-all — the tint ANIMATES in over ~150ms, so we
    // gate on the final computed color (an immediate read catches a
    // mid-transition blend like rgb(184,157,250)).
    const other = grid.locator("button").filter({ hasText: "15" }).first();
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
    expect(newSelCs).toBe(rgb(139, 92, 246));
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
});

test.describe("S8-D · MyDay header + suggestions", () => {
  test("header carries the 56px amber gradient sun block", async ({ page }) => {
    await page.goto("/MyDay");
    await hydrated(page);
    const block = page.locator('[aria-label="My Day header block"]');
    const cs = await block.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return {
        w: Math.round(r.width),
        h: Math.round(r.height),
        radius: s.borderRadius,
        bg: s.backgroundImage,
        shadow: s.boxShadow,
      };
    });
    expect(cs.w).toBe(56);
    expect(cs.h).toBe(56);
    expect(cs.radius).toBe("16px");
    expect(cs.bg).toContain("rgb(251, 191, 36)"); // amber-400
    expect(cs.bg).toContain("rgb(249, 115, 22)"); // orange-500
    expect(cs.shadow).toContain("rgba(245, 158, 11, 0.3)");
  });

  test("suggestions is a bare toggle button (sparkles + rotating chevron)", async ({ page }) => {
    await page.goto("/MyDay");
    await hydrated(page);
    const toggle = page.locator('button[aria-controls="my-day-suggestions"]');
    await expect(toggle).toBeVisible();
    const cs = await toggle.evaluate((el) => {
      const s = getComputedStyle(el);
      return { color: s.color };
    });
    expect(cs.color).toBe(rgb(100, 116, 139));
    // The label SPAN carries text-sm font-medium (the button inherits base).
    const label = toggle.locator("span");
    const labelCs = await label.evaluate((el) => {
      const s = getComputedStyle(el);
      return { size: s.fontSize, weight: s.fontWeight };
    });
    expect(labelCs.size).toBe("14px");
    expect(labelCs.weight).toBe("500");
    await expect(toggle.locator("svg.lucide-sparkles")).toHaveCount(1);
    // No card chrome around the section.
    const section = toggle.locator("..");
    const secBg = await section.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(secBg).toBe("rgba(0, 0, 0, 0)");
  });

  test("suggestion rows are bg-slate-50 rounded-xl with circle icons", async ({ page }) => {
    await page.goto("/MyDay");
    await hydrated(page);
    const toggle = page.locator('button[aria-controls="my-day-suggestions"]');
    if (await toggle.count()) {
      const expanded = await toggle.getAttribute("aria-expanded");
      if (expanded !== "true") await toggle.click();
      const row = page.locator('[aria-label="Suggested tasks"] > div').first();
      if (await row.count()) {
        const cs = await row.evaluate((el) => {
          const s = getComputedStyle(el);
          return { bg: s.backgroundColor, radius: s.borderRadius, pad: s.padding };
        });
        expect(cs.bg).toBe(rgb(248, 250, 252)); // slate-50
        expect(cs.radius).toBe("12px");
        expect(cs.pad).toBe("12px");
        await expect(row.locator("svg.lucide-circle").first()).toBeVisible();
      }
    }
  });
});

test.describe("S8-E · Timetable today tint + nav", () => {
  test("today's column HEADER carries the violet-50 tint (not the body)", async ({ page }) => {
    await page.goto("/Timetable");
    await hydrated(page);
    const head = page.locator('[aria-label="Week header"]').locator('[data-today-header]');
    await expect(head).toHaveCount(1);
    const cs = await head.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(cs).toBe(rgb(245, 243, 255)); // violet-50 (softest)
    const others = page.locator('[aria-label="Week header"] [data-today-header]');
    // The day body columns below stay transparent:
    const bodyCols = page.locator('[aria-label="Week grid"] .grid.grid-cols-8 > div').filter({
      has: page.locator("button.absolute"),
    });
    const firstBodyBg = await bodyCols.first().evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(firstBodyBg).toBe("rgba(0, 0, 0, 0)");
  });

  test("week-nav chevrons are ghost h-9 w-9 (not outline/round)", async ({ page }) => {
    await page.goto("/Timetable");
    await hydrated(page);
    const prev = page.locator('button[aria-label="Previous week"]');
    const cs = await prev.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return { w: Math.round(r.width), h: Math.round(r.height), radius: s.borderRadius, bg: s.backgroundColor, border: s.borderWidth };
    });
    expect(cs.w).toBe(36);
    expect(cs.h).toBe(36);
    expect(cs.radius).toBe("8px"); // rounded-md ghost, NOT rounded-full
    expect(cs.bg).toBe("rgba(0, 0, 0, 0)");
    expect(cs.border).toBe("0px");
  });
});

test.describe("S8-F · Tasks panel + search", () => {
  test("aside filter buttons carry list/star icons and flex-1 labels", async ({ page }) => {
    await page.goto("/Tasks");
    await hydrated(page);
    const all = page.locator('[aria-label="Task views"] button', { hasText: "All Tasks" }).first();
    await expect(all.locator("svg.lucide-list")).toHaveCount(1);
    const imp = page.locator('[aria-label="Task views"] button', { hasText: "Important" }).first();
    await expect(imp.locator("svg.lucide-star")).toHaveCount(1);
    const label = all.locator("span.flex-1");
    await expect(label).toHaveText("All Tasks");
  });

  test("main header is a single row: title + search + filter + Add Task", async ({ page }) => {
    await page.goto("/Tasks");
    await hydrated(page);
    const header = page.locator('[aria-label="Tasks header"]');
    await expect(header).toBeVisible();
    await expect(header.locator("h1")).toHaveText("All Tasks");
    // Search icon inside the header's search field.
    await expect(header.locator(".relative svg.lucide-search")).toHaveCount(1);
    // Add Task button lives in the same row.
    await expect(header.getByRole("button", { name: "Add Task" })).toBeVisible();
  });
});

test.describe("S8-G · Notes two-pane", () => {
  test("h1 lives INSIDE the left pane with a book-open icon", async ({ page }) => {
    await page.goto("/Notes");
    await hydrated(page);
    const pane = page.locator('[aria-label="Notes list pane"]');
    const h1 = pane.locator("h1");
    await expect(h1).toHaveText("Notes");
    await expect(h1.locator("svg.lucide-book-open")).toHaveCount(1);
    // No page-level header above the two-pane layout.
    await expect(page.locator("main h1")).toHaveCount(1);
  });

  test("the New button is a single 36px gradient dropdown trigger", async ({ page }) => {
    await page.goto("/Notes");
    await hydrated(page);
    const btn = page.locator('[aria-label="New note menu"]');
    const cs = await btn.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return { w: Math.round(r.width), h: Math.round(r.height), bg: s.backgroundImage };
    });
    expect(cs.w).toBe(36);
    expect(cs.h).toBe(36);
    expect(cs.bg).toContain("rgb(139, 92, 246)");
    await btn.click();
    await expect(page.getByRole("menuitem", { name: "New Note", exact: true })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "New Notebook" })).toBeVisible();
  });

  test("right pane is bare (no card) with the centered empty state", async ({ page }) => {
    await page.goto("/Notes");
    await hydrated(page);
    const right = page.locator('[aria-label="Note editor pane"]');
    const cs = await right.evaluate((el) => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, border: s.borderWidth, radius: s.borderRadius };
    });
    expect(cs.bg).toBe("rgba(0, 0, 0, 0)");
    expect(cs.border).toBe("0px");
    await expect(right.getByText("Select a note")).toBeVisible();
  });

  test("notebook/tag filters are Radix combobox triggers", async ({ page }) => {
    await page.goto("/Notes");
    await hydrated(page);
    const combos = page.locator('[aria-label="Notes list pane"] [role="combobox"]');
    expect(await combos.count()).toBe(2);
    await expect(combos.first()).toContainText("All Notebooks");
    await expect(combos.nth(1)).toContainText("All Tags");
  });
});

test.describe("S8-H · Study Groups two-pane", () => {
  test("layout is a two-pane flex with a bare right pane", async ({ page }) => {
    await page.goto("/StudyGroups");
    await hydrated(page);
    const pane = page.locator('[aria-label="Study groups pane"]');
    await expect(pane.locator("h1")).toHaveText("Study Groups");
    await expect(pane.locator("h1 svg.lucide-users")).toHaveCount(1);
    const right = page.locator('[aria-label="Study group detail pane"]');
    const cs = await right.evaluate((el) => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, border: s.borderWidth };
    });
    expect(cs.bg).toBe("rgba(0, 0, 0, 0)");
    expect(cs.border).toBe("0px");
    await expect(right.getByText("Select a group")).toBeVisible();
    // No page-level header.
    await expect(page.locator("main h1")).toHaveCount(1);
  });
});

test.describe("S8-I · Analytics additions", () => {
  test("chart cards carry per-card icons", async ({ page }) => {
    await page.goto("/Analytics");
    await hydrated(page);
    const taskCard = page.locator("section", { hasText: "Task Activity (Last 7 Days)" }).first();
    await expect(taskCard.locator("svg.lucide-trending-up")).toHaveCount(1);
    const focusCard = page.locator("section", { hasText: "Focus Time (Last 7 Days)" }).first();
    await expect(focusCard.locator("svg.lucide-clock")).toHaveCount(1);
  });

  test("Assignment Status donut renders with a 250px plot", async ({ page }) => {
    await page.goto("/Analytics");
    await hydrated(page);
    const card = page.locator("section", { hasText: "Assignment Status" }).first();
    await expect(card).toBeVisible();
    await expect(card.locator("svg.lucide-book-open")).toHaveCount(1);
    const plot = card.locator('[aria-label="Assignment status chart"]');
    const h = await plot.evaluate((el) => Math.round(el.getBoundingClientRect().height));
    expect(h).toBe(250);
  });

  test("Subject Workload card renders (250px body)", async ({ page }) => {
    await page.goto("/Analytics");
    await hydrated(page);
    const card = page.locator("section", { hasText: "Subject Workload" }).first();
    await expect(card).toBeVisible();
    await expect(card.locator("svg.lucide-target")).toHaveCount(1);
    const body = card.locator('[aria-label="Subject workload chart"]');
    const h = await body.evaluate((el) => Math.round(el.getBoundingClientRect().height));
    expect(h).toBe(250);
  });

  test("Active Items by Priority renders flame header + slate-50 chips", async ({ page }) => {
    await page.goto("/Analytics");
    await hydrated(page);
    const card = page.locator("section", { hasText: "Active Items by Priority" }).first();
    await expect(card).toBeVisible();
    await expect(card.locator("svg.lucide-flame")).toHaveCount(1);
    const chip = card.locator('[aria-label="Priority chips"] > div').first();
    const cs = await chip.evaluate((el) => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, radius: s.borderRadius };
    });
    expect(cs.bg).toBe(rgb(248, 250, 252));
    expect(cs.radius).toBe("12px");
  });
});

test.describe("S8-K · Calculator Clear icon", () => {
  test("Clear key renders the rotate-ccw icon", async ({ page }) => {
    await page.goto("/Calculator");
    await hydrated(page);
    const clear = page.locator('button[aria-label="Clear"]');
    await expect(clear.locator("svg.lucide-rotate-ccw")).toHaveCount(1);
  });
});

test.describe("S8-L · Math Solver layout", () => {
  test("single-column input card with border-t footer + button icons", async ({ page }) => {
    await page.goto("/MathSolver");
    await hydrated(page);
    const card = page.locator('[aria-label="Math solver input"]');
    const cs = await card.evaluate((el) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return { radius: s.borderRadius, pad: s.padding, w: Math.round(r.width) };
    });
    expect(cs.radius).toBe("16px"); // rounded-2xl
    expect(cs.pad).toBe("24px");
    await expect(card.locator("button", { hasText: "Upload Image" }).locator("svg.lucide-camera")).toHaveCount(1);
    await expect(card.locator("button", { hasText: "Clear" }).locator("svg.lucide-refresh-cw")).toHaveCount(1);
    await expect(card.locator("button", { hasText: "Solve" }).locator("svg.lucide-sparkles")).toHaveCount(1);
    // Single column: the solution pane sits BELOW, not beside (width ~= card).
    const solution = page.locator('[aria-label="Math solution"]');
    const [cardX, solutionX] = await Promise.all([
      card.evaluate((el) => Math.round(el.getBoundingClientRect().x)),
      solution.evaluate((el) => Math.round(el.getBoundingClientRect().x)),
    ]);
    expect(solutionX).toBeGreaterThanOrEqual(cardX - 2);
    expect(solutionX - cardX).toBeLessThan(40);
  });
});

test.describe("S8-M · AI quick-action icons", () => {
  test("quick actions use the reference icon set", async ({ page }) => {
    await page.goto("/AIAssistant");
    await hydrated(page);
    const grid = page.locator('[aria-label="Quick actions"]');
    await expect(grid.locator("button", { hasText: "Study Tips" }).locator("svg.lucide-brain")).toHaveCount(1);
    await expect(grid.locator("button", { hasText: "Summarize" }).locator("svg.lucide-file-text")).toHaveCount(1);
    await expect(grid.locator("button", { hasText: "Solve Problem" }).locator("svg.lucide-calculator")).toHaveCount(1);
    await expect(grid.locator("button", { hasText: "Essay Ideas" }).locator("svg.lucide-lightbulb")).toHaveCount(1);
    // Unchanged pair.
    await expect(grid.locator("button", { hasText: "Explain Concept" }).locator("svg.lucide-book-open")).toHaveCount(1);
    await expect(grid.locator("button", { hasText: "Translate" }).locator("svg.lucide-languages")).toHaveCount(1);
  });
});

test.describe("S8-N · Focus timer complete button", () => {
  test("the complete button renders a check icon", async ({ page }) => {
    await page.goto("/FocusTimer");
    await hydrated(page);
    const complete = page.locator('button[aria-label="Complete session"]');
    await expect(complete.locator("svg.lucide-check")).toHaveCount(1);
  });
});

test.describe("S8-O · Settings tab list", () => {
  test("tab list is bg-white with a border and wraps", async ({ page }) => {
    await page.goto("/Settings");
    await hydrated(page);
    const list = page.locator('[role="tablist"]');
    const cs = await list.evaluate((el) => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, border: s.borderWidth, borderColor: s.borderColor, wrap: s.flexWrap, h: s.height };
    });
    expect(cs.bg).toBe(rgb(255, 255, 255));
    expect(cs.border).toBe("1px");
    expect(cs.borderColor).toBe(rgb(226, 232, 240));
    expect(cs.wrap).toBe("wrap");
  });
});

test.describe("S8-P · Search icons + exam card", () => {
  test("assignments search input has the inline search icon", async ({ page }) => {
    await page.goto("/Assignments");
    await hydrated(page);
    const wrap = page.locator(".relative", { has: page.locator('input[aria-label="Search assignments"]') });
    await expect(wrap.locator("svg.lucide-search")).toHaveCount(1);
  });

  test("exams search input has the inline search icon", async ({ page }) => {
    await page.goto("/Exams");
    await hydrated(page);
    const wrap = page.locator(".relative", { has: page.locator('input[aria-label="Search exams"]') });
    await expect(wrap.locator("svg.lucide-search")).toHaveCount(1);
  });

  test("exam card renders date + time rows only (no location row)", async ({ page }) => {
    await page.goto("/Exams");
    await hydrated(page);
    await page.waitForSelector('[aria-label="Exam cards"]');
    const card = page.locator('[aria-label="Exam cards"] > div').first();
    await expect(card.locator("svg.lucide-map-pin")).toHaveCount(0);
    // Footer carries only the type pill.
    const footer = card.locator(".border-t");
    await expect(footer.locator("span.rounded-full")).toHaveCount(1);
    await expect(footer).not.toContainText(/topic/i);
  });
});
