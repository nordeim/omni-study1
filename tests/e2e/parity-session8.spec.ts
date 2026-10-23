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
      return { status: r.status };
    }, stamp);
    // RED pre-fix: 201 — the blank name passed the length-based check and
    // persisted (the silent-deletion edge the audit flagged).
    expect(res.status).toBe(400);
    // The group must not exist (the write rejected at the boundary).
    await page.goto("/StudyGroups");
    await hydrated(page);
    await expect(page.getByRole("button", { name: new RegExp(`${stamp}-crew`) })).toHaveCount(0);
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
    const today = await mk(`S76 Today pill ${stamp}`, iso(0));
    const tmrw = await mk(`S76 Tomorrow pill ${stamp}`, iso(1));
    const far = await mk(`S76 Far pill ${stamp}`, iso(5));
    try {
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

  test("AC7: the far urgency pill reads \"12 days\" in the yellow family", async ({ page }) => {
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
    expect(cs.bg).toBe(rgb(254, 249, 195)); // yellow-100 (measured s76)
    expect(cs.color).toBe(rgb(161, 98, 7)); // yellow-700 (measured)
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
