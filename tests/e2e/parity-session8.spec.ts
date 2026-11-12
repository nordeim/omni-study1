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
  page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true");

const rgb = (r: number, g: number, b: number) => `rgb(${r}, ${g}, ${b})`;

// Trap 11: rounded-full serializes as 3.35544e+07px in Chromium computed styles.
const isRound = (radius: string) => radius === "9999px" || radius === "3.35544e+07px";

test.describe("S8-A · Sidebar chrome", () => {
  test("nav icons match the reference's lucide set (6 swaps)", async ({ page }) => {
    await page.goto("/Dashboard");
    // The nav svg set only exists once the authed shell commits — the
    // --sf-primary wait resolves pre-paint (boot script), so gate on the
    // shell-level hydration marker (S8-A spec hygiene).
    await page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true");
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
    // S122/BW1: the pre-fix body hid behind non-retrying `if (await …count())`
    // guards taken right after hydrated() — when the view hadn't mounted
    // yet the whole test passed vacuously (the false-PASS variant of the
    // BU9 class). The sibling test's toBeVisible() flow gates instead; the
    // demo user's tasks guarantee the suggestions section renders.
    const toggle = page.locator('button[aria-controls="my-day-suggestions"]');
    await expect(toggle).toBeVisible();
    const expanded = await toggle.getAttribute("aria-expanded");
    if (expanded !== "true") await toggle.click();
    const row = page.locator('[aria-label="Suggested tasks"] > div').first();
    await expect(row).toBeVisible();
    const cs = await row.evaluate((el) => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, radius: s.borderRadius, pad: s.padding };
    });
    expect(cs.bg).toBe(rgb(248, 250, 252)); // slate-50
    expect(cs.radius).toBe("12px");
    expect(cs.pad).toBe("12px");
    await expect(row.locator("svg.lucide-circle").first()).toBeVisible();
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
    // Session-64 Batch U: the chevrons moved INTO the week banner (the
    // reference's measured position). The REFERENCE chevron computes a
    // 6px radius (`rounded-md` — probed 2026-10-19: getComputedStyle →
    // "6px", class "rounded-md"); the old 8px expectation here had
    // encoded the clone's `rounded-lg` drift, not the reference.
    expect(cs.radius).toBe("6px");
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
  // S119/BT10 — the "Manage notebooks" superset control lives INSIDE the
  // left pane, below the notebook filter (its documented placement). It
  // was previously a stray third flex child of the root row — a 130px
  // mostly-empty full-height column at the view's right edge squeezing the
  // editor pane. The root row's visible children are exactly the two panes.
  test("S119/BT10: the Manage notebooks dropdown lives in the left pane, and the root row has exactly two children", async ({ page }) => {
    await page.goto("/Notes");
    await hydrated(page);
    const pane = page.locator('[aria-label="Notes list pane"]');
    const manage = page.getByRole("button", { name: "Manage notebooks" });
    await expect(manage).toBeVisible();
    // the trigger is INSIDE the left pane
    await expect(pane.getByRole("button", { name: "Manage notebooks" })).toBeVisible();
    // the root two-pane row's only visible flex children are the panes
    const kids = await page.evaluate(() => {
      const root = [...document.querySelectorAll("div")].find((d) =>
        /flex h-\[calc\(100vh-8rem\)\] gap-6/.test(d.className.toString()),
      );
      if (!root) return null;
      return [...root.children]
        .filter((c) => getComputedStyle(c).display !== "none")
        .map((c) => c.tagName);
    });
    expect(kids).toEqual(["ASIDE", "DIV"]);
  });


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
    // S177/EA3 (re-scoped): the no-selection state's measured copy now
    // rides an h2 heading + hint; the md:hidden mobile-squeeze fallback
    // (the EA3b no-overflow guard) carries the old compact copy and would
    // double-match a plain getByText substring — the heading role is the
    // unique carrier.
    await expect(right.getByRole("heading", { name: "Select a note" })).toBeVisible();
  });

  test("notebook/tag filters are Radix combobox triggers", async ({ page }) => {
    await page.goto("/Notes");
    await hydrated(page);
    const combos = page.locator('[aria-label="Notes list pane"] [role="combobox"]');
    // The `hydrated` gate covers the authed shell + theme, not the Notes
    // collection round-trip — on a cold server the comboboxes mount a beat
    // later. Bound-wait for the first mount; the assertions below are
    // unchanged (exactly two triggers, exact labels).
    await combos.first().waitFor({ state: "visible" });
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

// S85/AL1 (the cycle's live discovery — the e2e page-snapshot evidence): the
// API boundary ships `members` as an ARRAY (membersFromRow, entities.ts) but
// the client's parseMembers ran JSON.parse on it — the array coerces to
// "[object Object]", throws, and the catch returned []. Every group rendered
// "0 members" with an empty list; addMember started from [] and WIPED the
// existing members; the edit-dialog save sent members: [] and wiped them
// too. Invisible since the initial implementation: no pin covered the
// surface. These pins walk the REAL flows through the shipped UI.
test.describe("S85/AL1 · Study Group members render + survive mutation", () => {
  test("AL1a: the seeded members render in the detail pane", async ({ page }) => {
    await page.goto("/StudyGroups");
    await hydrated(page);
    await page.getByRole("button", { name: /Calc Crew/ }).first().click();
    // The row's member count reflects the seeded members (RED pre-fix: "0 members").
    await expect(page.getByRole("button", { name: /Calc Crew/ }).first()).toContainText("2 members");
    const detail = page.locator('[aria-label="Study group detail pane"]');
    await expect(detail.getByText("Ari", { exact: true })).toBeVisible();
    await expect(detail.getByText("Sam", { exact: true })).toBeVisible();
  });

  test("AL1b: adding a member preserves the existing members", async ({ page }) => {
    await page.goto("/StudyGroups");
    await hydrated(page);
    // A fresh stamped group via the API (the e2e DB persists across specs —
    // never mutate the seeded demo rows; the AK1 convention).
    const stamp = `s85-AL1b-${Date.now()}`;
    const info = await page.evaluate(async (stamp) => {
      const res = await fetch("/api/study-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          name: `${stamp}-crew`,
          members: [
            { name: "Ari", email: "ari@example.com" },
            { name: "Sam", email: "sam@example.com" },
          ],
        }),
      });
      return { id: (await res.json()).id, status: res.status };
    }, stamp);
    expect(info.status).toBe(201);

    try {
      await page.goto("/StudyGroups");
      await hydrated(page);
      await page.getByRole("button", { name: new RegExp(`${stamp}-crew`) }).first().click();
      const detail = page.locator('[aria-label="Study group detail pane"]');
      await expect(detail.getByText("Ari", { exact: true })).toBeVisible();
      await expect(detail.getByText("Sam", { exact: true })).toBeVisible();

      // Add a third member through the REAL form.
      await page.locator("#member-name").fill("Pia");
      await page.locator("#member-email").fill("pia@example.com");
      await page.getByRole("button", { name: "Add", exact: true }).click();
      // The refetched list must carry ALL THREE (RED pre-fix: the wipe).
      await expect(detail.getByText("Pia", { exact: true })).toBeVisible();
      await expect(detail.getByText("Ari", { exact: true })).toBeVisible();
      await expect(detail.getByText("Sam", { exact: true })).toBeVisible();
      await expect(page.getByRole("button", { name: new RegExp(`${stamp}-crew`) }).first()).toContainText("3 members");
    } finally {
      // AM5 (the s86 audit's I4): the stamped-row cleanup runs even when an
      // assertion fails mid-pin — a stranded row only ever pollutes a dev
      // iterate run (the cold cert re-creates db/e2e.db per chunk), but the
      // hygiene is free.
      await page.evaluate(async (id) => {
        await fetch(`/api/study-groups/${id}`, { method: "DELETE", credentials: "same-origin" });
      }, info.id);
    }
  });

  test("AL1c: an edit-dialog save preserves the members", async ({ page }) => {
    await page.goto("/StudyGroups");
    await hydrated(page);
    const stamp = `s85-AL1c-${Date.now()}`;
    const info = await page.evaluate(async (stamp) => {
      const res = await fetch("/api/study-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          name: `${stamp}-crew`,
          members: [
            { name: "Ari", email: "ari@example.com" },
            { name: "Sam", email: "sam@example.com" },
          ],
        }),
      });
      return { id: (await res.json()).id, status: res.status };
    }, stamp);
    expect(info.status).toBe(201);

    try {
      await page.goto("/StudyGroups");
      await hydrated(page);
      await page.getByRole("button", { name: new RegExp(`${stamp}-crew`) }).first().click();
      // Open the edit dialog, rename, save.
      await page.getByRole("button", { name: "Edit", exact: true }).click();
      await page.locator("#group-name").fill(`${stamp}-renamed`);
      await page.getByRole("button", { name: "Save changes" }).click();
      // AM5 (the s86 audit's I4): await the SAVE's own success signal — the
      // documented toast — instead of a sleep-sync (the flake surface).
      await expect(page.getByText("Study group updated")).toBeVisible();

      // The saved group still renders BOTH members (RED pre-fix: the save
      // payload carried members: [] — the wipe).
      await page.goto("/StudyGroups");
      await hydrated(page);
      await page.getByRole("button", { name: new RegExp(`${stamp}-renamed`) }).first().click();
      const detail = page.locator('[aria-label="Study group detail pane"]');
      await expect(detail.getByText("Ari", { exact: true })).toBeVisible();
      await expect(detail.getByText("Sam", { exact: true })).toBeVisible();
      await expect(page.getByRole("button", { name: new RegExp(`${stamp}-renamed`) }).first()).toContainText("2 members");
    } finally {
      // AM5: the cleanup always runs (see AL1b).
      await page.evaluate(async (id) => {
        await fetch(`/api/study-groups/${id}`, { method: "DELETE", credentials: "same-origin" });
      }, info.id);
    }
  });
});

// S86/AM1 (the s86 audit's L2): the server schema and the client seam must
// agree on blank-after-trim member names. Pre-fix, the length-based
// min(1) ACCEPTED "   " at the API while normalizeMembers dropped it on
// read — a direct-API write persisted an invisible member whose row the
// next member write (addMember/removeMember/edit-save) permanently
// deleted. The trimmed boundary rejects the write at the source.
// S87/AN1 (the s87 audit's L2): the pin's own stamped-row cleanup — the
// id rides the evaluate's return, the finally deletes it whenever the
// write unexpectedly SUCCEEDED (the AM5 convention applied to the pin
// AM5 itself shipped in the same batch: a RED pin must not strand its
// row in a dev-iterate run).
test.describe("S86/AM1 · the members boundary alignment", () => {
  test("AM1: a blank member name is rejected at the API boundary", async ({ page }) => {
    // The fetch below rides the page's own origin (relative URL) — a page
    // must be loaded first (about:blank cannot resolve it).
    await page.goto("/StudyGroups");
    await hydrated(page);
    const stamp = `s86-AM1-${Date.now()}`;
    const res = await page.evaluate(async (stamp) => {
      const r = await fetch("/api/study-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          name: `${stamp}-crew`,
          members: [{ name: "   ", email: "member@example.com" }],
        }),
      });
      // The created id rides the return so the finally can clean up even
      // on the failing path (201 = the boundary regressed).
      const body = await r.json().catch(() => null);
      return { status: r.status, id: body?.id ?? null };
    }, stamp);
    try {
      // RED pre-fix: 201 — the blank name passed the length-based check and
      // persisted (the silent-deletion edge the audit flagged).
      expect(res.status).toBe(400);
      // The group must not exist (the write rejected at the boundary).
      await page.goto("/StudyGroups");
      await hydrated(page);
      await expect(page.getByRole("button", { name: new RegExp(`${stamp}-crew`) })).toHaveCount(0);
    } finally {
      if (res.id) {
        await page.evaluate(async (id) => {
          await fetch(`/api/study-groups/${id}`, { method: "DELETE", credentials: "same-origin" });
        }, res.id).catch(() => {});
      }
    }
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
    // ^="Clear" — the name became "Clear: AC" in the Family F fix
    // (label-content-name-mismatch: the visible "AC" must be in the name).
    const clear = page.locator('button[aria-label^="Clear"]');
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

  // Session-63 drift finds (Batch T, re-measured 2026-10-18): the
  // reference's Exams header carries a LIVE-COUNT subtitle ("<n> upcoming
  // · <m> this week" — "0 · 0" on its empty account; the clone's seed has
  // 4 upcoming of which 3 fall inside the +6-day window) and an
  // All Exams/Upcoming/Past status filter defaulting to Upcoming; the
  // Assignments subtitle is "Track your homework and projects" — the old
  // strings were clone-invented and never pinned.
  test("the exams header reads the reference's live-count subtitle", async ({ page }) => {
    await page.goto("/Exams");
    await hydrated(page);
    await expect(page.getByText("4 upcoming · 3 this week")).toBeVisible();
  });

  test("the exams header carries the reference's status filter (default Upcoming)", async ({ page }) => {
    await page.goto("/Exams");
    await hydrated(page);
    const filter = page.getByRole("combobox", { name: "Exam filter" });
    await expect(filter).toBeVisible();
    await filter.click();
    await expect(page.getByRole("option", { name: "All Exams" })).toBeVisible();
    await expect(page.getByRole("option", { name: "Upcoming", exact: true })).toBeVisible();
    await expect(page.getByRole("option", { name: "Past", exact: true })).toBeVisible();
    await page.keyboard.press("Escape");
  });

  test("the assignments header subtitle reads the reference's measured copy", async ({ page }) => {
    await page.goto("/Assignments");
    await hydrated(page);
    await expect(page.getByText("Track your homework and projects", { exact: true })).toBeVisible();
  });

  test("exams search input has the inline search icon", async ({ page }) => {
    await page.goto("/Exams");
    await hydrated(page);
    const wrap = page.locator(".relative", { has: page.locator('input[aria-label="Search exams"]') });
    await expect(wrap.locator("svg.lucide-search")).toHaveCount(1);
  });

  test("exam card renders date + time rows only (no location row) — the SEEDED no-location card", async ({ page }) => {
    await page.goto("/Exams");
    await hydrated(page);
    await page.waitForSelector('[aria-label="Exam cards"]');
    const card = page.locator('[aria-label="Exam cards"] > div').first();
    await expect(card.locator("svg.lucide-map-pin")).toHaveCount(0);
    // Footer carries only the type pill.
    const footer = card.locator(".border-t");
    await expect(footer.locator("span.rounded-full")).toHaveCount(1);
    await expect(footer).not.toContainText(/topic/i);
    // S76/AC5 rationale amendment: the "no location row" reading encoded a
    // DATA ARTIFACT — the decode-era reference exams carried no locations.
    // The s76 populated re-measure proved the reference DOES render a 📍
    // row when the field is set (and its dialog carries a Location input),
    // so this pin now asserts the SEEDED first card ("Calculus II
    // Midterm", no location) only; the positive case is pinned by S8-AC4
    // on the seeded "Physics Final" (location "Examination Hall A").
  });
});

// ---------------------------------------------------------------------------
// S8-U3 · Assignments subject filter + status select (session-64 Batch U).
//
// Measured on the live reference (2026-10-19): the header is TWO rows —
// [h1 + subtitle | Add Assignment] then [search (flex-1) | Active select
// (w-160) | All Subjects select (w-160)] — the status control is a SELECT
// whose options read All/Active/Completed (that exact order), and a second
// select lists the user's subjects ("All Subjects" + dynamic entries; the
// reference's account had none, so its list was "All Subjects" alone — the
// clone's seed carries six). Both triggers are unnamed on the reference;
// the clone supersets with aria-labels.
// ---------------------------------------------------------------------------
test.describe("S8-U3 · Assignments subject filter + status select", () => {
  test("the header carries the reference's subject filter (default All Subjects)", async ({ page }) => {
    await page.goto("/Assignments");
    await hydrated(page);
    const filter = page.getByRole("combobox", { name: "Subject filter" });
    await expect(filter).toBeVisible();
    await expect(filter).toHaveText(/All Subjects/);
    await filter.click();
    await expect(page.getByRole("option", { name: "All Subjects" })).toBeVisible();
    await expect(page.getByRole("option", { name: "Mathematics" })).toBeVisible();
    await expect(page.getByRole("option", { name: "Biology" })).toBeVisible();
    await page.keyboard.press("Escape");
  });

  test("selecting a subject narrows the rows and All Subjects restores them", async ({ page }) => {
    await page.goto("/Assignments");
    await hydrated(page);
    const rows = page.locator('[aria-label="Assignment rows"] > *');
    // AP-96: the --sf-primary gate resolves pre-paint — wait for an actual
    // row before counting (the bare count raced the data load and flaked
    // once in the s76 cycle).
    await expect(rows.first()).toBeVisible();
    const before = await rows.count();
    expect(before).toBeGreaterThan(0);
    const filter = page.getByRole("combobox", { name: "Subject filter" });
    await filter.click();
    await page.getByRole("option", { name: "Mathematics" }).click();
    // Seeded active mathematics rows only (both math assignments are <100).
    expect(await rows.count()).toBe(2);
    await expect(page.getByText("Problem set 7 — integrals")).toBeVisible();
    await expect(page.getByText("Kinetics lab write-up")).toHaveCount(0);
    await filter.click();
    await page.getByRole("option", { name: "All Subjects" }).click();
    expect(await rows.count()).toBe(before);
  });

  test("the status filter renders as the reference's select with All/Active/Completed", async ({ page }) => {
    await page.goto("/Assignments");
    await hydrated(page);
    const status = page.locator('[aria-label^="Filter assignments by status"]');
    await expect(status).toHaveText(/Active/);
    await status.click();
    // Reference-measured option order: All, Active, Completed.
    await expect(page.getByRole("option", { name: "All", exact: true })).toBeVisible();
    await expect(page.getByRole("option", { name: "Active", exact: true })).toBeVisible();
    await expect(page.getByRole("option", { name: "Completed", exact: true })).toBeVisible();
    await page.keyboard.press("Escape");
  });
});

test.describe("S8-Z · Study Groups right pane at zero", () => {
  // The demo seed ships a study group — the zero state needs a fresh
  // account (the S17 pattern: empty storageState + register/verify).
  test.use({ storageState: { cookies: [], origins: [] } });

  test("the zero-group right pane is the reference's icon EmptyState, top-anchored (S8-Z pin)", async ({ page }) => {
    // Reference (re-measured s69): at zero the right pane renders the
    // 80px gradient users block ABOVE the h3, top-anchored (icon y≈96,
    // h3 y≈200) — NOT the centered bold-hint-only variant the s65 cycle
    // recorded (the reference's own rendering moved; AP-108: re-probe
    // and re-pin from the live measurement).
    const email = `s8z-${Date.now()}@studyflow.app`;
    const res = await page.request.post("/api/auth/register", {
      data: { email, password: "Fresh1234!", name: "S8Z Probe" },
    });
    expect(res.ok(), `register failed: ${res.status()}`).toBe(true);
    const { code } = (await res.json()) as { code: string };
    await page.request.post("/api/auth/verify-email", { data: { email, code } });
    await page.goto("/StudyGroups");
    await hydrated(page);
    const right = page.locator('[aria-label="Study group detail pane"]');
    const h3 = right.getByRole("heading", { level: 3, name: "Select a group" });
    await expect(h3).toBeVisible();
    const geo = await h3.evaluate((el) => {
      const pane = el.closest('[aria-label="Study group detail pane"]')!;
      const prev = el.parentElement!.querySelector("div");
      const svg = prev?.querySelector("svg");
      return {
        h3y: Math.round(el.getBoundingClientRect().y),
        paneTop: Math.round(pane.getBoundingClientRect().y),
        icon: svg ? (svg.getAttribute("class") ?? "").match(/lucide-[a-z0-9-]+/g)?.join(",") : null,
        blockW: prev ? Math.round(prev.getBoundingClientRect().width) : 0,
      };
    });
    expect(geo.icon).toContain("lucide-users");
    expect(geo.blockW).toBe(80);
    expect(geo.h3y - geo.paneTop).toBeLessThan(320); // top-anchored, not centered
  });
});

// ---------------------------------------------------------------------------
// S8-AC · Batch AC — the populated-row drift layer (session-76).
//
// Computed-style measured on the live reference 2026-10-20/21
// (scripts/ref-ac-remeasure{,3,4}-s76.mjs — login → populate through the
// ref's own UI → measure → residue-zero cleanup; the AP-118/119 probe
// protocol). The S75 prose table carried three transcription errors these
// pins correct: the assignment due pill is BLUE (not violet), the exam
// date month is SHORT ("Wednesday, Oct 28, 2026" — not "October"), and the
// ≥2-day exam bucket is the YELLOW family (not amber).
// ---------------------------------------------------------------------------

test.describe("S8-AC · the assignment row's measured S76 anatomy", () => {
  test("AC1: the due pill rides the TITLE line — \"N days\" on blue-50/blue-600", async ({ page }) => {
    await page.goto("/Assignments");
    await hydrated(page);
    // "Problem set 7 — integrals" is seeded due +2 → the far form "2 days".
    const row = page.locator('[aria-label="Assignment rows"] > *', { hasText: "Problem set 7" }).first();
    await expect(row).toBeVisible();
    const due = row.locator("span", { hasText: /^2 days$/ }).first();
    const geo = await due.evaluate((el) => {
      const s = getComputedStyle(el);
      const pill = el.getBoundingClientRect();
      const title = el.closest("div")!.querySelector("h2")!;
      const t = title.getBoundingClientRect();
      return { bg: s.backgroundColor, color: s.color, fw: s.fontWeight, pillY: Math.round(pill.y), titleY: Math.round(t.y) };
    });
    expect(geo.bg).toBe(rgb(239, 246, 255)); // blue-50 (measured — NOT violet)
    expect(geo.color).toBe(rgb(37, 99, 235)); // blue-600
    expect(geo.fw).toBe("500");
    // INLINE with the title: the pill's top sits within one line of the
    // h2's top (the ref measured titleY 17 / pillY 19).
    expect(Math.abs(geo.pillY - geo.titleY)).toBeLessThanOrEqual(8);
    // The ref's pill carries NO icon (the task pill does — S8-AC6).
    await expect(due.locator("svg")).toHaveCount(0);
  });

  test("AC1 honest labels: due-today reads \"Today\" amber; +1 reads \"Tomorrow\" blue (documented deviations)", async ({ page }) => {
    // The ref's own mapping is quirky — its due-today slot renders
    // "Tomorrow" (amber) and its +1 slot renders "1 days" (blue). The
    // clone ships the honest labels in the SAME tint slots (the
    // superset-not-clone-of-quirks doctrine; see the remediation plan's
    // deviations ledger). Pin the behavior on API-created rows so the
    // labels are deterministic regardless of seed age.
    const stamp = Date.now();
    const iso = (d: number) => {
      const dt = new Date();
      dt.setDate(dt.getDate() + d);
      return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
    };
    const mk = async (title: string, dueDate: string) => {
      const res = await page.request.post("/api/assignments", { data: { title, dueDate, priority: "medium", type: "homework" } });
      expect(res.ok(), `create ${title}: ${res.status()}`).toBe(true);
      return (await res.json()) as { id: string };
    };
    const today = { id: "" } as { id: string };
    const tmrw = { id: "" } as { id: string };
    const far = { id: "" } as { id: string };
    // S91/AR3 (the s90 audit's L1, the AQ2 convention): the stamped creates
    // ride INSIDE the try whose finally deletes them — a failed 2nd/3rd
    // create (the expect inside mk throws) cascades through the finally and
    // the earlier rows still clean up on every path.
    try {
      today.id = (await mk(`S76 Today pill ${stamp}`, iso(0))).id;
      tmrw.id = (await mk(`S76 Tomorrow pill ${stamp}`, iso(1))).id;
      far.id = (await mk(`S76 Far pill ${stamp}`, iso(5))).id;
      await page.goto("/Assignments");
      await hydrated(page);
      const todayRow = page.locator('[aria-label="Assignment rows"] > *', { hasText: `S76 Today pill ${stamp}` });
      const todayPill = todayRow.locator("span", { hasText: /^Today$/ });
      await expect(todayPill).toBeVisible();
      expect(await todayPill.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(rgb(255, 251, 235)); // amber-50 (the ref's tint for due-today data)
      const tmrwRow = page.locator('[aria-label="Assignment rows"] > *', { hasText: `S76 Tomorrow pill ${stamp}` });
      const tmrwPill = tmrwRow.locator("span", { hasText: /^Tomorrow$/ });
      await expect(tmrwPill).toBeVisible();
      expect(await tmrwPill.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(rgb(239, 246, 255)); // blue-50
      const farRow = page.locator('[aria-label="Assignment rows"] > *', { hasText: `S76 Far pill ${stamp}` });
      await expect(farRow.locator("span", { hasText: /^5 days$/ })).toBeVisible();
    } finally {
      await page.request.delete(`/api/assignments/${today.id}`);
      await page.request.delete(`/api/assignments/${tmrw.id}`);
      await page.request.delete(`/api/assignments/${far.id}`);
    }
  });

  test("AC2: the meta row — accent subject chip, bell priority on yellow-50, slate type", async ({ page }) => {
    await page.goto("/Assignments");
    await hydrated(page);
    // "Problem set 7 — integrals" → Mathematics (seed color #8b5cf6).
    const row = page.locator('[aria-label="Assignment rows"] > *', { hasText: "Problem set 7" }).first();
    const chip = row.locator("span", { hasText: "Mathematics" }).first();
    const chipCs = await chip.evaluate((el) => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, color: s.color, borderColor: s.borderTopColor };
    });
    // The ref's inline rgba(139,92,246,…) — accent-aware here through the
    // runtime triplet var (the raw-triplet pattern; violet accent default).
    // Text: the ref's violet-500 reads 3.9:1 on the tint — the clone's
    // a11y-win precedent takes the TEXT one step darker (violet-600,
    // --sf-primary-strong), like the calendar's today fill.
    expect(chipCs.bg).toBe("rgba(139, 92, 246, 0.08)");
    expect(chipCs.color).toBe(rgb(124, 58, 237));
    expect(chipCs.borderColor).toBe("rgba(139, 92, 246, 0.19)");
    // The w-2 dot inside the chip.
    const dot = chip.locator("span");
    expect(await dot.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(rgb(139, 92, 246)); // seeded math color #8b5cf6
    // Priority: the bell glyph + yellow-50 bg (yellow-700 text — the
    // ref's yellow-500 reads 1.9:1 and fails AA; the documented
    // one-step-darker a11y-win precedent).
    const prio = row.locator("span", { hasText: /^high$/ });
    await expect(prio.locator("svg.lucide-bell")).toHaveCount(1);
    const prioCs = await prio.evaluate((el) => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, color: s.color };
    });
    expect(prioCs.bg).toBe(rgb(254, 252, 232)); // yellow-50 (measured)
    expect(prioCs.color).toBe(rgb(161, 98, 7)); // yellow-700 (AA deviation, documented)
    // Type pill: slate-100 bg / slate-600 text (the ref's slate-400 reads
    // 2.56:1 — the documented a11y-win family, same as the brand subtitle).
    const type = row.locator("span", { hasText: /^homework$/ });
    const typeCs = await type.evaluate((el) => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, color: s.color };
    });
    expect(typeCs.bg).toBe(rgb(241, 245, 249)); // slate-100
    expect(typeCs.color).toBe(rgb(71, 85, 105)); // slate-600 (AA deviation, documented)
  });

  test("AC2 superset: the Add Assignment dialog carries the Subject select", async ({ page }) => {
    await page.goto("/Assignments");
    await hydrated(page);
    await page.getByRole("button", { name: "Add Assignment" }).click();
    const dlg = page.getByRole("dialog");
    await expect(dlg.getByLabel("Subject")).toBeVisible();
    await dlg.getByLabel("Subject").click();
    // Radix portals the listbox to the document body — page-level (the
    // S8-U3 pin's own convention).
    await expect(page.getByRole("option", { name: "Mathematics" })).toBeVisible();
    await expect(page.getByRole("option", { name: "No subject" })).toBeVisible();
    await page.keyboard.press("Escape");
    await page.keyboard.press("Escape");
  });
});

test.describe("S8-AC · the exam card's measured S76 anatomy", () => {
  test("AC3/AC9: full weekday date with SHORT month, text-lg title, slate-400 minute suffix", async ({ page }) => {
    await page.goto("/Exams");
    await hydrated(page);
    // "Quiz — Integration" is seeded at(4, 9) — four days out.
    const card = page.locator('[aria-label="Exam cards"] > div', { hasText: "Quiz — Integration" }).first();
    await expect(card).toBeVisible();
    // AC9: the title is text-lg 18px/600 (measured on the ref).
    const title = card.locator("h2").first();
    const titleCs = await title.evaluate((el) => {
      const s = getComputedStyle(el);
      return { fs: s.fontSize, fw: s.fontWeight };
    });
    expect(titleCs.fs).toBe("18px");
    expect(titleCs.fw).toBe("600");
    // AC3: "Wednesday, Oct 28, 2026" — weekday LONG + month SHORT + year.
    const expected = new Date();
    expected.setDate(expected.getDate() + 4);
    const dateRow = card.locator("p", { hasText: /, 20\d\d$/ }).first();
    await expect(dateRow).toHaveText(
      expected.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" }),
    );
    // The "· 45 min" suffix rides its own span — slate-500 in the clone
    // (the ref's slate-400 reads 2.56:1 on white; the documented a11y-win
    // family — one step darker for text, same as the brand subtitle).
    const suffix = card.locator("span", { hasText: /· 45 min/ });
    expect(await suffix.evaluate((el) => getComputedStyle(el).color)).toBe(rgb(100, 116, 139)); // slate-500
  });

  test("AC4: the accent subject chip renders between the title and the detail rows", async ({ page }) => {
    await page.goto("/Exams");
    await hydrated(page);
    // "Quiz — Integration" → Mathematics.
    const card = page.locator('[aria-label="Exam cards"] > div', { hasText: "Quiz — Integration" }).first();
    const chip = card.locator("span", { hasText: "Mathematics" }).first();
    await expect(chip).toBeVisible();
    const chipCs = await chip.evaluate((el) => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, color: s.color };
    });
    expect(chipCs.bg).toBe("rgba(139, 92, 246, 0.08)");
    // violet-600 (the AA one-step-darker text; see the AC2 pin's note).
    expect(chipCs.color).toBe(rgb(124, 58, 237));
    // Geometry: the chip sits BELOW the title row and ABOVE the date row.
    const geo = await chip.evaluate((el) => {
      const card = el.closest('[aria-label="Exam cards"] > div'.replace(" > div", ""))!;
      const title = card.querySelector("h2")!;
      const dateRow = [...card.querySelectorAll("p")].find((p) => /, 20\d\d/.test(p.textContent ?? ""))!;
      return {
        chipY: Math.round(el.getBoundingClientRect().y),
        titleY: Math.round(title.getBoundingClientRect().y),
        dateY: Math.round(dateRow.getBoundingClientRect().y),
      };
    });
    expect(geo.chipY).toBeGreaterThan(geo.titleY);
    expect(geo.chipY).toBeLessThan(geo.dateY);
  });

  test("AC5: the seeded Physics Final renders the 📍 row; the dialog carries the Location input", async ({ page }) => {
    await page.goto("/Exams");
    await hydrated(page);
    // The seeded location card ("Examination Hall A").
    const card = page.locator('[aria-label="Exam cards"] > div', { hasText: "Physics Final" }).first();
    await expect(card).toBeVisible();
    const locRow = card.locator("p", { hasText: "Examination Hall A" });
    await expect(locRow).toBeVisible();
    await expect(locRow.locator("svg.lucide-map-pin")).toHaveCount(1);
    // The row matches the date row's chrome (slate-600 text + slate-400 icon).
    const rowCs = await locRow.evaluate((el) => {
      const s = getComputedStyle(el);
      return { color: s.color, fs: s.fontSize };
    });
    expect(rowCs.color).toBe(rgb(71, 85, 105)); // slate-600
    expect(rowCs.fs).toBe("14px");
    // The dialog's Location field (the ref's measured placeholder).
    await page.getByRole("button", { name: "Add Exam" }).click();
    const dlg = page.getByRole("dialog");
    const loc = dlg.getByLabel("Location");
    await expect(loc).toBeVisible();
    await expect(loc).toHaveAttribute("placeholder", "e.g., Room 101, Hall A");
    await page.keyboard.press("Escape");
  });

  // S120/BU9 — the dialog Cancel parity matrix (the P3 decision). The
  // reference's Add Exam dialog carries an explicit Cancel button
  // (measured 2026-11-01: ["Select","Test","Pick",...,"Cancel","Add Exam",
  // "Close"]); the clone shipped submit + X only. The pin asserts the
  // affordance exists AND cancels without creating (the row count is
  // unchanged after the round-trip).
  test("S120/BU9: the Add Exam dialog carries a Cancel that closes without creating", async ({ page }) => {
    await page.goto("/Exams");
    await hydrated(page);
    const cards = page.locator('[aria-label="Exam cards"] > div');
    // S122/BW1: the before-count is a non-retrying read — gate on the
    // seeded content first (the AP-96 pattern). hydrated() resolves
    // pre-paint (the boot-script var), so an immediate count raced the
    // shell flip + the pre-warm and read 0 during the Splash (the cert's
    // 134≠135 — reproduced 4/4; the seeded 4 exams guarantee a first row).
    await expect(cards.first()).toBeVisible();
    const before = await cards.count();
    await page.getByRole("button", { name: "Add Exam" }).click();
    const dlg = page.getByRole("dialog");
    await expect(dlg).toBeVisible();
    const title = dlg.getByLabel("Title");
    await title.fill("S120-BU9-never-created");
    await dlg.getByRole("button", { name: "Cancel" }).click();
    await expect(dlg).toHaveCount(0);
    // Nothing was created by the cancelled session.
    expect(await cards.count()).toBe(before);
    await expect(page.locator('[aria-label="Exam cards"]', { hasText: "S120-BU9-never-created" })).toHaveCount(0);
  });

  test("AC6: the topics block — \"Topics to study:\" label + dark chips (NOT the count row)", async ({ page }) => {
    await page.goto("/Exams");
    await hydrated(page);
    // "Physics Final" ships topics ["Mechanics", "Thermo"].
    const card = page.locator('[aria-label="Exam cards"] > div', { hasText: "Physics Final" }).first();
    await expect(card.getByText("Topics to study:")).toBeVisible();
    const labelCs = await card.locator("p", { hasText: "Topics to study:" }).evaluate((el) => {
      const s = getComputedStyle(el);
      return { fs: s.fontSize, fw: s.fontWeight, color: s.color };
    });
    expect(labelCs.fs).toBe("12px");
    expect(labelCs.fw).toBe("500");
    expect(labelCs.color).toBe(rgb(100, 116, 139)); // slate-500
    const chip = card.locator("span", { hasText: /^Mechanics$/ });
    const chipCs = await chip.evaluate((el) => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, color: s.color, radius: s.borderRadius, fw: s.fontWeight };
    });
    expect(chipCs.bg).toBe(rgb(38, 38, 38)); // neutral-800 (measured #262626)
    expect(chipCs.color).toBe(rgb(250, 250, 250)); // neutral-50
    expect(chipCs.radius).toBe("6px"); // rounded-md
    expect(chipCs.fw).toBe("600");
    // The invented count row ("2 topics") is gone.
    await expect(card.getByText(/2 topics/)).toHaveCount(0);
  });

  test("AC7 (S120/BU8 re-anchor): the far urgency pill reads \"12 days\" in the BLUE family", async ({ page }) => {
    await page.goto("/Exams");
    await hydrated(page);
    // "Physics Final" is seeded at(12, 9) — twelve days out.
    const card = page.locator('[aria-label="Exam cards"] > div', { hasText: "Physics Final" }).first();
    const badge = card.locator("span", { hasText: /^12 days$/ });
    await expect(badge).toBeVisible();
    const cs = await badge.evaluate((el) => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, color: s.color, fw: s.fontWeight };
    });
    // The live reference drifted the ≥2 bucket yellow → blue (measured
    // 2026-11-01: bg rgb(219,234,254) / fg rgb(37,99,235), an 11-day
    // exam). The clone follows the CURRENT reference with the AA superset:
    // blue-700 text (29,78,216) at 5.49:1 — the reference's own blue-600
    // measures 4.24:1, below AA (the one-step-darker precedent).
    expect(cs.bg).toBe(rgb(219, 234, 254)); // blue-100 (measured s120)
    expect(cs.color).toBe(rgb(29, 78, 216)); // blue-700 (AA superset)
    expect(cs.fw).toBe("600"); // font-semibold (measured)
  });
});

test.describe("S8-AC · the task pill's measured date form", () => {
  test("AC8: the due pill always renders the calendar glyph + \"Oct N\" date form", async ({ page }) => {
    await page.goto("/Tasks");
    await hydrated(page);
    // "Finish calculus problem set" is seeded due TODAY (20:00) — the red
    // date form; "Outline history essay" is due +1 — the slate date form.
    const shortDate = (offset: number) => {
      const d = new Date();
      d.setDate(d.getDate() + offset);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };
    const todayRow = page.locator('[aria-label="Task rows"] > *', { hasText: "Finish calculus problem set" }).first();
    const todayPill = todayRow.locator("span", { hasText: shortDate(0) }).first();
    await expect(todayPill).toBeVisible();
    await expect(todayPill.locator("svg.lucide-calendar")).toHaveCount(1);
    expect(await todayPill.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(rgb(254, 226, 226)); // red-100
    expect(await todayPill.evaluate((el) => getComputedStyle(el).color)).toBe(rgb(185, 28, 28)); // red-700 (AA deviation, documented)
    const tmrwRow = page.locator('[aria-label="Task rows"] > *', { hasText: "Outline history essay" }).first();
    const tmrwPill = tmrwRow.locator("span", { hasText: shortDate(1) }).first();
    await expect(tmrwPill).toBeVisible();
    await expect(tmrwPill.locator("svg.lucide-calendar")).toHaveCount(1);
    expect(await tmrwPill.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(rgb(241, 245, 249)); // slate-100
    // The relative labels are GONE from the row pills (the ref renders the
    // date form for every bucket).
    await expect(todayRow.getByText("Today", { exact: true })).toHaveCount(0);
    await expect(tmrwRow.getByText("Tomorrow", { exact: true })).toHaveCount(0);
    await expect(todayRow.getByText(/Wed, /)).toHaveCount(0);
  });
});

// S123/BX3 — the exam edit dialog populated with `row.date.slice(0, 16)` —
// the UTC WALL-CLOCK of the stored instant — and submitted the datetime-
// local string raw (re-interpreted in the SERVER's zone on save). The
// dialog now converts through the user's zone on both boundaries
// (src/lib/date.ts toDatetimeLocalValue / fromDatetimeLocalInput — the
// tasks-view local-noon pattern). In the UTC suite this pin is a wiring
// guard (GREEN-on-arrival, the BW11 coverage-pin style — the drift itself
// is code-verified and unit-pinned at the seam); on any non-UTC host it is
// the drift proof.
test.describe("S123/BX3: the exam edit dialog shows the stored time in the local wall-clock", () => {
  test("create at 14:30, edit shows 14:30 (the round-trip through the user's zone)", async ({ page }) => {
    await page.goto("/Exams");
    await hydrated(page);
    const cards = page.locator('[aria-label="Exam cards"] > div');
    await expect(cards.first()).toBeVisible();
    // Create the probe exam at a fixed local time.
    await page.getByRole("button", { name: "Add Exam" }).click();
    let dlg = page.getByRole("dialog");
    await expect(dlg).toBeVisible();
    await dlg.locator("#exam-title").fill("S123-BX3-probe");
    await dlg.locator("#exam-date").fill("2031-03-15T14:30");
    await dlg.getByRole("button", { name: /add exam/i }).click();
    await expect(dlg).toHaveCount(0);
    const card = page.locator('[aria-label="Exam cards"] > div', { hasText: "S123-BX3-probe" });
    await expect(card).toBeVisible();
    try {
      // The edit dialog must show the LOCAL wall-clock (the entered time),
      // never the raw UTC slice.
      await card.getByRole("button", { name: "Edit S123-BX3-probe" }).click();
      dlg = page.getByRole("dialog");
      await expect(dlg).toBeVisible();
      await expect(dlg.locator("#exam-date")).toHaveValue("2031-03-15T14:30");
      // Cancel — no mutation of the probe row.
      await dlg.getByRole("button", { name: "Cancel" }).click();
      await expect(dlg).toHaveCount(0);
      // The card still renders the entered time (the full round-trip).
      await expect(card.getByText("2:30 PM")).toBeVisible();
    } finally {
      const rows = (await page.request.get("/api/exams").then((r) => r.json())) as { id: string; title: string }[];
      const probe = rows.find((r) => r.title === "S123-BX3-probe");
      if (probe) await page.request.delete(`/api/exams/${probe.id}`);
    }
  });
});

// S125/BZ3 — the S119/BT10 "Manage notebooks" surface is keyboard-operable.
// The DropdownMenu nested Rename/Delete <button>s inside DropdownMenuItem
// (role="menuitem") — a WAI-ARIA nested-interactive violation: menu
// arrow-keys focus the ITEM (never the buttons), and Tab CLOSES the menu,
// so both actions were effectively mouse-only. The surface is now a Radix
// Popover (the content keeps the menu's exact geometry classes; the rows
// are plain divs; the actions are real tab stops; Escape closes and
// restores focus). The BT10 placement pin above is unchanged — the
// trigger's name and its in-pane placement are byte-identical.
test.describe("S125/BZ3 · the Manage notebooks surface is keyboard-operable", () => {
  test("BZ3: the notebook actions are real tab stops inside a popover (pre-fix: nested in role=menuitem — Tab closed the menu)", async ({ page }) => {
    // A fresh stamped notebook (the control renders only when notebooks
    // exist; the e2e DB persists across specs — never mutate seeded rows).
    // The page context is established FIRST (the AL1b convention: a
    // relative-URL fetch inside evaluate needs a real origin, and the
    // post-create goto re-hydrates the store with the fresh notebook).
    await page.goto("/Notes");
    await hydrated(page);
    const stamp = `s125-BZ3-${Date.now()}`;
    const info = await page.evaluate(async (stamp) => {
      const res = await fetch("/api/notebooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ name: stamp }),
      });
      return { id: (await res.json()).id, status: res.status };
    }, stamp);
    expect(info.status).toBe(201);
    try {
      await page.goto("/Notes");
      await hydrated(page);
      const manage = page.getByRole("button", { name: "Manage notebooks" });
      await expect(manage).toBeVisible();
      await manage.click();
      // Post-fix: the popover content carries role=dialog and NO menuitem
      // roles. Pre-fix (RED): the DropdownMenu rendered role=menu with
      // menuitems — the dialog expect fails right here.
      const content = page.getByRole("dialog");
      await expect(content).toBeVisible();
      await expect(content.getByRole("menuitem")).toHaveCount(0);
      // Keyboard operability: Tab from the trigger reaches the FIRST
      // action button (pre-fix: Tab closed the menu — the buttons were
      // unreachable by keyboard).
      await page.keyboard.press("Tab");
      const focusedAction = await page.evaluate(() => {
        const active = document.activeElement;
        return (
          active !== null &&
          active.tagName === "BUTTON" &&
          active.closest('[role="dialog"]') !== null
        );
      });
      expect(focusedAction).toBe(true);
      // Escape closes and restores focus to the trigger (the popover
      // lifecycle contract).
      await page.keyboard.press("Escape");
      await expect(content).toHaveCount(0);
    } finally {
      await page.evaluate(async (id) => {
        await fetch(`/api/notebooks/${id}`, { method: "DELETE", credentials: "same-origin" });
      }, info.id);
    }
  });
});

// S125/BZ4 — duplicate members are schema-legal (BV17: the render key
// disambiguates by index), but the view's removal filtered by email alone
// — clicking one member's X removed EVERY row sharing that email in one
// write. The removal now goes through the removeOneMember seam: exactly
// the FIRST (email, name) composite occurrence.
test.describe("S125/BZ4 · duplicate-member removal removes ONE", () => {
  test("BZ4: removing one identical duplicate keeps the sibling (pre-fix: the email filter removed both)", async ({ page }) => {
    // The page context is established FIRST (the AL1b convention: a
    // relative-URL fetch inside evaluate needs a real origin, and the
    // post-create goto re-hydrates the store with the fresh row).
    await page.goto("/StudyGroups");
    await hydrated(page);
    const stamp = `s125-BZ4-${Date.now()}`;
    const info = await page.evaluate(async (stamp) => {
      const res = await fetch("/api/study-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          name: `${stamp}-crew`,
          members: [
            { name: "Dup BZ4", email: "dup-bz4@example.com" },
            { name: "Dup BZ4", email: "dup-bz4@example.com" },
          ],
        }),
      });
      return { id: (await res.json()).id, status: res.status };
    }, stamp);
    expect(info.status).toBe(201);
    try {
      await page.goto("/StudyGroups");
      await hydrated(page);
      await page.getByRole("button", { name: new RegExp(`${stamp}-crew`) }).first().click();
      const detail = page.locator('[aria-label="Study group detail pane"]');
      // Two identical member rows render (duplicates are legal).
      const removeButtons = detail.locator('[aria-label="Remove Dup BZ4"]');
      await expect(removeButtons).toHaveCount(2);
      // Remove ONE: click the first X.
      await removeButtons.first().click();
      // Post-fix: exactly one duplicate remains. Pre-fix (RED): the email
      // filter removed BOTH in one write.
      await expect(detail.locator('[aria-label="Remove Dup BZ4"]')).toHaveCount(1);
    } finally {
      await page.evaluate(async (id) => {
        await fetch(`/api/study-groups/${id}`, { method: "DELETE", credentials: "same-origin" });
      }, info.id);
    }
  });
});

// ---------------------------------------------------------------------------
// S126/CA4 · the auth sub-screen swaps manage focus (the s126 shell audit's
// A-M2): every view transition was triggered from a button that unmounts in
// the swap, so focus fell to <body> and nothing announced the context change
// (WCAG 2.4.3/4.1.3 — axe cannot catch this class). The fix: the incoming
// screen's heading carries tabIndex={-1} and receives focus on every CHANGE
// (the initial mount is skipped — the signin h1 must not steal the email
// input's focus).
// ---------------------------------------------------------------------------
test.describe("S126/CA4 · auth view transitions focus the incoming heading", () => {
  test("signin → signup → signin → forgot: each swap lands focus on the heading (RED pre-fix: activeElement is body)", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    // The initial mount does NOT move focus (the email input keeps it).
    const initial = await page.evaluate(() => document.activeElement?.tagName ?? "none");
    expect(initial).not.toBe("H1");

    // signin → signup: the signup h2 receives focus.
    await page.getByRole("button", { name: /need an account\? sign up/i }).click();
    const signupH2 = page.getByRole("heading", { name: "Create your account" });
    await expect(signupH2).toBeVisible();
    await expect
      .poll(async () =>
        page.evaluate(() => ({
          tag: document.activeElement?.tagName ?? "none",
          text: (document.activeElement?.textContent ?? "").trim(),
        })),
      )
      .toEqual({ tag: "H2", text: "Create your account" });

    // signup → signin: the signin h1 receives focus.
    await page.getByRole("button", { name: /back to sign in/i }).click();
    await expect
      .poll(async () =>
        page.evaluate(() => ({
          tag: document.activeElement?.tagName ?? "none",
          text: (document.activeElement?.textContent ?? "").trim(),
        })),
      )
      .toEqual({ tag: "H1", text: "Welcome to StudyFlow" });

    // signin → forgot: the forgot h2 receives focus.
    await page.getByRole("button", { name: /forgot password\?/i }).click();
    await expect
      .poll(async () =>
        page.evaluate(() => ({
          tag: document.activeElement?.tagName ?? "none",
          text: (document.activeElement?.textContent ?? "").trim(),
        })),
      )
      .toEqual({ tag: "H2", text: "Reset your password" });
  });
});

// ---------------------------------------------------------------------------
// S126/CA9 · the disabled Google button's explanation is reachable (the s126
// shell audit's A-L5): the explanation lived only in a `title` attribute on a
// `disabled:pointer-events-none` button — no hover, no focus, no tooltip, a
// dead button with no discoverable reason. The fix: persistent small helper
// text under the button.
// ---------------------------------------------------------------------------
test.describe("S126/CA9 · the Google sign-in unavailability is visible", () => {
  test("the helper text renders under the disabled button (RED pre-fix: only the unreachable title)", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByText("Google sign-in is not available in this deployment"),
    ).toBeVisible();
  });
});

// S127/CB8 — the AI post-send refresh split (the s127 FE audit's M-5): the
// send POST and the post-success transcript refresh shared ONE try — a
// refresh failure ran the SEND-failure rollback: the delivered message
// bounced back into the composer with a false "could not respond" toast
// (the solver twin toasted "could not solve" while the solution was on
// screen; a flashcards retry duplicated the drafted cards). The pin mocks
// the send as a SUCCESS and aborts the transcript GET — the exact S13
// flaky-network condition — and demands the composer stay empty.
test.describe("S127/CB8 · a failed post-send refresh is not a failed send", () => {
  test("a refresh failure after a delivered message never bounces the composer", async ({ page }) => {
    await page.goto("/AIAssistant");
    await hydrated(page);
    // The send is a SUCCESS — the message IS delivered server-side.
    await page.route("**/api/ai/chat", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          message: {
            id: "s127-cb8-probe",
            role: "assistant",
            content: "delivered",
            createdAt: new Date().toISOString(),
          },
        }),
      }),
    );
    // The transcript refresh fails (the flaky-network condition).
    await page.route("**/api/ai/messages*", (route) => route.abort("failed"));
    const composer = page.getByLabel("Message the assistant");
    await composer.fill("S127-CB8 delivered probe");
    await composer.press("Enter");
    // Let the flow settle — the rollback (pre-fix) or the refresh retry
    // (post-fix) lands within the window; toasts outlive it.
    await page.waitForTimeout(1500);
    // Pre-fix: the rollback bounced the text back into the composer (the
    // failure snapshot of the RED run showed exactly that). Post-fix: the
    // composer stays empty.
    await expect(composer).toHaveValue("");
    // The false send-failure toast NEVER appears; the honest soft toast
    // does (the retry leg of the refresh also aborts).
    await expect(page.getByText("The assistant could not respond. Try again.")).toHaveCount(0);
    await expect(page.getByText(/refresh/i)).toBeVisible();
  });

  // S160/DI5 (the s160 audit B/M-2): the CB8 split-failure-domain pins for
  // the two UNPINNED surfaces — the chat leg above was the family's only
  // pin ("didn't refresh" matched ZERO e2e assertions), so a refactor
  // collapsing the solver's or the flashcards view's nested try/catch
  // would re-open the exact pre-CB8 bug class (the false "could not
  // solve"/"Generation failed" toast after a DELIVERED write; a retry
  // duplicating the drafted cards) with no failing test. Both twins mock
  // the send as SUCCESS and abort the refresh — the chat pin's exact
  // shape, on the twin surfaces.
  test("a failed post-solve history refresh never toasts a failed solve (the solver twin)", async ({ page }) => {
    await page.goto("/MathSolver");
    await hydrated(page);
    // The solve is a SUCCESS — the solution IS delivered server-side.
    await page.route("**/api/math/solve", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ solution: "x = 5 (the s160-di5 delivered probe)" }),
      }),
    );
    // The history refresh fails (the flaky-network condition — both the
    // first attempt and the retry).
    await page.route("**/api/ai/messages*", (route) => route.abort("failed"));
    const problem = page.getByLabel("Math problem");
    await problem.fill("S160-DI5 solver probe");
    await page.getByRole("button", { name: "Solve" }).click();
    // Let the flow settle — the refresh retry window lands well inside
    // it; toasts outlive it.
    await page.waitForTimeout(1500);
    // The solution IS rendered (the write was delivered).
    await expect(page.getByText("x = 5 (the s160-di5 delivered probe)")).toBeVisible();
    // The false solve-failure toast NEVER appears; the honest soft toast
    // does (the retry leg of the refresh also aborts).
    await expect(page.getByText(/could not solve that problem/i)).toHaveCount(0);
    await expect(page.getByText("Solved — but the history didn't refresh. Reload to catch up.")).toBeVisible();
  });

  test("a failed post-generate deck refresh never toasts a failed generation (the flashcards twin)", async ({ page }) => {
    await page.goto("/Flashcards");
    await hydrated(page);
    // The generation is a SUCCESS — the cards ARE drafted server-side.
    await page.route("**/api/ai/generate-cards", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ cards: [] }),
      }),
    );
    // The deck refresh fails (loadCollections(["flashcards"]) fetches
    // decks + cards in one Promise.all — one abort fails the pair; both
    // the first attempt and the retry).
    await page.route("**/api/flashcards/cards*", (route) => route.abort("failed"));
    // A deck is selected by the render-derived default (list[0]) — the
    // AI Generate button is enabled in the deck detail pane.
    await page.getByRole("button", { name: "AI Generate" }).click();
    // Let the flow settle — the refresh retry window lands well inside
    // it; toasts outlive it.
    await page.waitForTimeout(1500);
    // The false generation-failure toast NEVER appears; the honest soft
    // toast does (the retry leg of the refresh also aborts).
    await expect(page.getByText(/generation failed/i)).toHaveCount(0);
    await expect(
      page.getByText("Drafted — but the deck didn't refresh. Reload to see the new cards."),
    ).toBeVisible();
  });
});

// S127/CB17 — the Add Link dialog's dead required contract (the s127 FE
// audit's L-3): the form declared noValidate, which killed the native
// constraint validation on BOTH required inputs — an empty submit
// round-tripped to the server and surfaced as a raw 400 toast. The JS
// guard (trim + non-empty name and URL, inline error) now owns the
// contract noValidate promised.
test.describe("S127/CB17 · the Add Link dialog guards its own required fields", () => {
  test("an empty submit fires no POST and shows the inline error", async ({ page }) => {
    await page.goto("/Files");
    await hydrated(page);
    let posts = 0;
    await page.route("**/api/files", (route) => {
      if (route.request().method() === "POST") posts += 1;
      return route.continue();
    });
    await page.getByLabel("Add link").click();
    const dlg = page.getByRole("dialog");
    await expect(dlg).toBeVisible();
    // Empty name + empty URL, straight to submit.
    await dlg.getByRole("button", { name: "Save Link" }).click();
    // Pre-fix: the empty pair POSTed and the server's 400 surfaced as a
    // toast. Post-fix: the guard blocks before any request.
    await expect(dlg.getByText("Name and URL are both required.")).toBeVisible();
    await page.waitForTimeout(400);
    expect(posts).toBe(0);
    await dlg.getByRole("button", { name: "Close" }).click();
  });
});

// ---------------------------------------------------------------------------
// S153/DB1 · the capped aggregate discharge (the corrected B-M1 mechanics),
// pinned at the WIRE with the actual attack shape: a SUCCESS-ONLY login
// loop. Under the S138/CM3 net-of-successes model a success nets 0 on
// loginGlobal: (checkRateLimit's +1, the decrement's −1) while resetting
// both per-keys — so under the default in-band posture (open registration
// + the OTP in the response → scriptable own credentials) a loop of
// CORRECT-credential logins burned the full synchronous scrypt pair per
// request with NOTHING binding it: the aggregate never tripped (~24-37×
// the intended 40/15-min containment, the CK1 single-worker-starvation
// shape reopened by the discharge). The S153/DB1 per-window discharge
// ceiling (MAX_DISCHARGES_PER_WINDOW = 20) bounds the loop: successes
// 1-20 net 0, every success past the ceiling nets +1, and the loop trips
// at M+D = 60 admitted requests per window.
//
// TERMINAL-POSITION RULE (the CK1 doctrine): this pin SPENDS loginGlobal:
// to its trip point and cannot clean it from the wire (a post-trip login
// is itself gated), so it MUST be its chunk's TERMINAL test — this file
// is chunk 1's alphabetically-LAST file (mobile-navigation < navigation <
// parity-session8) and this describe is the file's LAST; nothing after it
// in the chunk logs in. The pin's own budget fit: chunk 1's prior
// loginGlobal spends are the setup project's ONE success (net 0, one
// discharge consumed) and this file's earlier tests carry no login POSTs
// — the self-calibrating loop absorbs the exact prior count either way.
// The throwaway rides the request fixture (the BZ5 pattern — the demo
// user is never mutated; the register is registerGlobal's 2nd of 40 in
// this chunk's boot).
// ---------------------------------------------------------------------------
test.describe("S153/DB1: the capped aggregate discharge (the success-only loop bound)", () => {
  test("a success-only login loop trips loginGlobal: within M+D (RED pre-fix: the loop never trips — every success nets 0, unlimited discharges)", async ({ request }) => {
    test.setTimeout(120_000);
    const stamp = Date.now();
    const email = `s153-db1-${stamp}@studyflow.app`;
    const ip = { "x-forwarded-for": "192.0.2.153" };

    // Register + verify the throwaway (the s125/BZ5 pattern); its
    // credentials are the loop's fuel — the exact attacker posture the
    // default in-band posture makes scriptable.
    const reg = await request.post("/api/auth/register", {
      headers: ip,
      data: { email, password: "Fresh1234!", name: "S153 DB1 Probe" },
    });
    expect(reg.ok(), `register failed: ${reg.status()}`).toBe(true);
    const { code } = (await reg.json()) as { code: string };
    const verify = await request.post("/api/auth/verify-email", {
      headers: ip,
      data: { email, code },
    });
    expect(verify.ok(), `verify failed: ${verify.status()}`).toBe(true);

    // The SUCCESS-ONLY loop: correct credentials every time. Each
    // iteration burns the full synchronous scrypt pair; pre-fix each
    // nets 0 on the global (and resets both per-keys) so the loop never
    // trips — post-fix the discharge ceiling caps the netting and the
    // 429 lands by request ~60 (M 40 + D 20, minus the chunk's prior
    // discharge consumption). Self-calibrating to the 429 (the BZ5
    // pattern), bounded at 80.
    let first429 = 0;
    let tripped = false;
    for (let i = 1; i <= 80; i++) {
      const res = await request.post("/api/auth/login", {
        headers: ip,
        data: { email, password: "Fresh1234!" },
      });
      if (res.status() === 429) {
        expect(res.headers()["retry-after"], "the honest Retry-After header").toBeTruthy();
        const body = (await res.json()) as { error?: string };
        expect(body.error).toContain("Too many login attempts");
        first429 = i;
        tripped = true;
        break;
      }
      // Every admitted iteration is a SUCCESS (the loop's premise) —
      // any 401/403 here means the loop lost its credentials, not that
      // the budget tripped.
      expect(res.status(), `login ${i} status`).toBe(200);
    }
    // The containment: the loop trips (pre-fix: tripped stays false at
    // 80 iterations — the RED discriminator), and the trip point sits
    // at the M+D bound (≤ 61 admits the chunk's prior discharge
    // consumption; the loop's own 40-fail twin is the CK1 pin's shape).
    expect(tripped, "the success-only loop trips the aggregate (the S153/DB1 bound)").toBe(true);
    expect(first429).toBeLessThanOrEqual(61);
    expect(first429).toBeGreaterThanOrEqual(40);
  });
});

// S163/DL1 (the s163 audit B/M-1): the exams mutation CB8 split. The
// pre-DL1 exams mutations rejected on the refresh leg after a COMMITTED
// write — apiSend (the POST) then fetchAndSet (the GET, 20 s CD2
// deadline), and the GET's failure rejected the whole mutation: the
// view's catch showed "Something went wrong." in the STILL-OPEN dialog,
// fired no success toast, and kept the form armed — a RETRY re-POSTed
// and DUPLICATED the exam (the CB8 letter: a false mutation-failure
// claim on a committed row; the DK1 events twin's exact shape, this
// family's port — the first of the recorded family-wide CB8 port). The
// CB8-twin network-mock shape (the S127/S160 family): the POST
// continues (the write lands server-side), the GET aborts (the
// flaky-refresh condition) — create an exam through the real dialog and
// assert the honest success surface. RED pre-fix: no toast, the dialog
// open with the false-failure copy.
test.describe("S163/DL1 · the exams CB8 failure-domain split (Batch DL)", () => {
  test("a committed create + a failed refresh answers the success toast (never the false save-failure)", async ({ page }) => {
    await page.goto("/Exams");
    await hydrated(page);
    // The committed-write + flaky-refresh condition: the write continues
    // (201 server-side), the refresh GET aborts.
    await page.route("**/api/exams**", (route) => {
      if (route.request().method() === "GET") return route.abort();
      return route.continue();
    });
    await page.getByRole("button", { name: "Add Exam" }).first().click();
    await page.locator("#exam-title").fill("S163-DL1 probe");
    await page.locator("#exam-date").fill("2026-11-16T09:00");
    await page.getByRole("button", { name: "Add exam" }).click();
    // The write committed: the success toast lands through the aria-live
    // stack and the dialog CLOSES. Pre-fix: the mutation rejected on the
    // aborted refresh → "Something went wrong." in the open dialog, no
    // success toast, the form armed for the duplicate-creating retry.
    await expect(page.getByText("Exam added.")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(page.getByText("Something went wrong.")).toBeHidden();
  });
});

// S167/DQ1 — the flashcards family CB8 failure-domain split (the s167
// audit B/H-1): the write and the post-write refresh are SEPARATE failure
// domains (the DK1/DL1/DM1/DN1/DP1 doctrine ported to the SIXTH family of
// the recorded family-wide port — the deck trio and the card trio all rode
// the uncaught refresh). Pre-DQ1 the create mutation was `await
// apiSend(POST)` then `await fetchAndSet("flashcardDecks")`, and the flaky
// refresh rejected the WHOLE mutation — the dialog stayed open with
// "Something went wrong." on a row the server COMMITTED (and the armed
// retry re-POSTed → the duplicate-creating loop). The pin drives the real
// condition: the collection GET (the refresh) ABORTS, the POST (the write)
// CONTINUES — a committed create answers the "Deck created." success toast
// + the CLOSED dialog, never the false save-failure. RED pre-fix: the
// dialog stayed open with the alert, the toast never fired.
// Route-glob note (the S164/DM4 lesson, re-derived): the pattern
// `**/api/flashcards/decks` ends at the COLLECTION URL — per-id
// PATCH/DELETE URLs do not match (Playwright's full-URL glob), so the
// interception is collection-only by construction and the finally DELETE
// (the zero-residue cleanup) passes through unrouted.
test.describe("S167/DQ1 · the flashcards save succeeds through a failed refresh (CB8 split)", () => {
  test("a committed create + an aborted refresh answers the success toast + closed dialog, never the false save-failure", async ({ page }) => {
    await page.goto("/Flashcards");
    await hydrated(page);
    // The settled proof: a seeded deck row renders (the slice has loaded
    // before the interception installs).
    await expect(page.getByRole("button", { name: /Integration rules/ }).first()).toBeVisible();
    // Abort the collection GET (the refresh leg) — the POST (the write
    // leg) continues through the same URL, discriminated by method.
    await page.route("**/api/flashcards/decks", (route) => {
      if (route.request().method() === "GET") route.abort("failed");
      else route.continue();
    });
    let createdId: string | null = null;
    try {
      await page.getByRole("button", { name: "New Deck" }).click();
      const dlg = page.getByRole("dialog");
      await expect(dlg).toBeVisible();
      await dlg.getByLabel("Deck Name").fill("S167-DQ1 committed-write probe");
      const saved = page.waitForResponse(
        (r) => r.request().method() === "POST" && r.url().includes("/api/flashcards/decks"),
      );
      await dlg.getByRole("button", { name: "Create deck" }).click();
      const res = await saved;
      // The write itself COMMITTED server-side.
      expect(res.ok()).toBe(true);
      createdId = ((await res.json()) as { id: string }).id;
      // The success toast lands through the aria-live stack (the
      // flashcards create DOES toast — unlike the notes BZ14 dialog)…
      await expect(page.getByText("Deck created.")).toBeVisible({ timeout: 10_000 });
      // …the dialog CLOSES — the mutation resolved, the form is not
      // armed for the duplicate-creating retry.
      await expect(dlg).toBeHidden();
      // The FALSE save-failure never renders (the contained refresh
      // rejection must not claim a save failure on the committed row).
      await expect(page.getByText("Something went wrong.")).toHaveCount(0);
    } finally {
      await page.unroute("**/api/flashcards/decks");
      // Zero residue on the shared demo user (the CC4/AR3 convention).
      if (createdId) await page.request.delete(`/api/flashcards/decks/${createdId}`);
    }
  });
});
