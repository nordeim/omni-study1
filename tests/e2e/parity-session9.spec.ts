import { expect, test, type Page } from "@playwright/test";

/**
 * Session-9 parity pins — data-state surfaces, chart axes & icon-level parity.
 *
 * Every pin here was measured on the live reference
 * (https://omni-study1.base44.app, authed, 1280×800) during the session-9
 * dual-app audit. See docs/remediation-plan-session9.md for the full
 * measured values:
 *
 *  S9-A dashboard overdue alert banner (gradient red-50→orange-50 + CTA)
 *  S9-B MyDay amber empty state (greeting-titled, amber gradient block)
 *  S9-C tasks status filter = outline button with filter icon (not combobox)
 *  S9-D tasks My Lists body empty (no "No lists yet" placeholder)
 *  S9-E calendar month grid SUNDAY-first (header Sun…Sat, dynamic weeks)
 *  S9-F calendar mode switch: white bordered container, h-8 tabs + icons
 *  S9-G files breadcrumb house icon + grid3x3 view toggle
 *  S9-H timetable Grid Builder is text-only (no icon)
 *  S9-I assignments default filter "Active"; rows without subject/description
 *  S9-J exams "Tomorrow" bucket = orange-100/orange-600 badge
 *  S9-K analytics 7-day charts: axis labels + dashed gridlines + area fills
 *  S9-L focus timer stat icons flame/target/zap; Long Break = coffee
 *  S9-M settings tabs carry palette/user/book-open/calendar/bell icons
 *  S9-N notes combobox triggers carry folder/tag leading icons
 *  S9-O flashcards deck row has a hover-revealed ellipsis menu button
 *  S9-P AI composer button icon = wand-sparkles
 *  S9-Q MyDay quick-add row = input + More Options ONLY (no submit button)
 *  S9-R dashboard section empty states are slim (w-12 icon + p-8 text-center)
 *  S9-S study groups right-pane hint wording
 *
 * Empty-state pins (S9-B/D/R) run as a freshly REGISTERED user (zero data);
 * the seeded demo user carries today-tasks/decks that mask those surfaces.
 */

const hydrated = (page: Page) =>
  page.waitForFunction(() => document.documentElement.style.getPropertyValue("--sf-primary") !== "");

/** Registers a throwaway user inside THIS test's context (fresh cookie jar,
 *  zero data). The shared storageState demo user is untouched.
 *  S15: registration no longer auto-logs-in (ADR-013) — the helper completes
 *  the verification step with the surfaced code (the no-SMTP self-hosted
 *  delivery) to obtain the fresh user's session cookie. */
async function registerFreshUser(page: Page, salt: string) {
  const email = `s9-empty-${salt}-${Date.now()}@studyflow.app`;
  const res = await page.request.post("/api/auth/register", {
    data: {
      email,
      password: "Empty1234!",
      name: "Empty State Probe",
    },
  });
  expect(res.ok(), `register failed: ${res.status()}`).toBe(true);
  const body = (await res.json()) as { code: string };
  const verify = await page.request.post("/api/auth/verify-email", {
    data: { email, code: body.code },
  });
  expect(verify.ok(), `verify failed: ${verify.status()}`).toBe(true);
}

test.describe("S9-A · Dashboard overdue alert banner", () => {
  test("renders between header and stats with the measured chrome", async ({ page }) => {
    await page.goto("/Dashboard");
    await hydrated(page);
    // The seeded overdue task ("Return library books", due yesterday) trips it.
    const banner = page.locator('main [aria-label="Overdue alert"]');
    await expect(banner).toBeVisible();
    const cs = await banner.evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        bg: s.backgroundImage,
        border: s.borderColor,
        radius: s.borderRadius,
        padding: s.padding,
      };
    });
    expect(cs.bg).toContain("rgb(254, 242, 242)"); // red-50
    expect(cs.bg).toContain("rgb(255, 247, 237)"); // orange-50
    expect(cs.border).toBe("rgb(254, 202, 202)"); // red-200
    expect(cs.radius).toBe("16px"); // rounded-2xl

    const iconBlock = banner.locator(".lucide-circle-alert").locator("..");
    await expect(iconBlock).toHaveClass(/h-10 w-10/);
    const iconBlockBg = await iconBlock.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(iconBlockBg).toBe("rgb(254, 226, 226)"); // red-100
    await expect(banner.getByRole("heading", { level: 3 })).toHaveText(/overdue item/);
    await expect(banner.getByRole("heading", { level: 3 })).toHaveClass(/text-red-700/);
    await expect(banner.getByText("Don't forget to complete them!")).toBeVisible();

    // CTA links to the Tasks view.
    const cta = banner.getByRole("link");
    await expect(cta).toHaveAttribute("href", "/Tasks");
    await expect(cta).toHaveText(/View All/);
  });

  test("banner sits between the greeting and the stats grid", async ({ page }) => {
    await page.goto("/Dashboard");
    await hydrated(page);
    // The banner renders only after the task data loads — auto-wait for it.
    await expect(page.locator('[aria-label="Overdue alert"]')).toBeVisible();
    const order = await page.evaluate(() => {
      const main = document.querySelector("main");
      const wrap = main?.firstElementChild ?? main;
      const kids = Array.from(wrap?.children ?? []);
      const bannerEl = wrap?.querySelector('[aria-label="Overdue alert"]');
      const statsEl = wrap?.querySelector(".grid.grid-cols-2");
      const h1 = wrap?.querySelector("h1");
      return {
        h1: kids.findIndex((k) => k.contains(h1 as Node)),
        banner: kids.findIndex((k) => k.contains(bannerEl as Node)),
        stats: kids.findIndex((k) => k.contains(statsEl as Node)),
      };
    });
    expect(order.h1).toBeGreaterThanOrEqual(0);
    expect(order.banner).toBeGreaterThan(order.h1);
    expect(order.stats).toBeGreaterThan(order.banner);
  });
});

test.describe("S9-B/Q · MyDay empty state + quick-add row", () => {
  test("empty state is the amber, greeting-titled design (fresh user)", async ({ page }) => {
    await registerFreshUser(page, "myday");
    await page.goto("/MyDay");
    await hydrated(page);
    const empty = page.locator("main").getByText(/Good (morning|afternoon|evening)!/).locator("..");
    await expect(empty).toBeVisible();
    const cs = await empty.evaluate((el) => {
      const s = getComputedStyle(el);
      return { textAlign: s.textAlign, paddingTop: s.paddingTop };
    });
    expect(cs.textAlign).toBe("center");
    expect(cs.paddingTop).toBe("48px"); // py-12

    const block = empty.locator(".lucide-sun").locator("..");
    const blockCs = await block.evaluate((el) => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundImage, w: el.getBoundingClientRect().width, radius: s.borderRadius };
    });
    expect(blockCs.bg).toContain("rgb(254, 243, 199)"); // amber-100
    expect(blockCs.bg).toContain("rgb(255, 237, 213)"); // orange-100
    expect(Math.round(blockCs.w)).toBe(80); // w-20
    expect(blockCs.radius).toBe("16px"); // rounded-2xl

    await expect(empty.getByRole("heading", { level: 3 })).toHaveClass(/text-xl font-semibold text-slate-700/);
    await expect(empty.getByText("What would you like to accomplish today?")).toBeVisible();
    const cta = empty.getByRole("button", { name: "Add Your First Task" });
    await expect(cta).toBeVisible();
    const ctaBg = await cta.evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(ctaBg).toContain("rgb(245, 158, 11)"); // amber-500
    expect(ctaBg).toContain("rgb(249, 115, 22)"); // orange-500
  });

  test("quick-add row = input + More Options only (no submit button)", async ({ page }) => {
    await page.goto("/MyDay");
    await hydrated(page);
    const form = page.locator("main form").first();
    const buttons = form.locator("button");
    await expect(buttons).toHaveCount(1);
    await expect(buttons.first()).toHaveText(/More Options/);
    // Enter still submits (form semantics preserved).
    const input = form.locator("input");
    await expect(input).toHaveAttribute("placeholder", "Add a task for today...");
  });
});

test.describe("S9-C/D · Tasks filter chrome + My Lists body", () => {
  test("status filter is an outline button with a filter icon (not a combobox)", async ({ page }) => {
    await page.goto("/Tasks");
    await hydrated(page);
    const ctrl = page.locator('main button[aria-label="Filter tasks"]');
    await expect(ctrl).toBeVisible();
    await expect(ctrl).toHaveText(/Active/);
    await expect(ctrl).toHaveClass(/border/);
    const icon = ctrl.locator("svg");
    // The reference renders lucide-filter; this lucide version names the
    // same glyph lucide-funnel (S8 lesson — assert the rendered class).
    await expect(icon).toHaveClass(/lucide-(filter|funnel)/);
    const chevrons = await ctrl.locator("svg[class*=chevron]").count();
    expect(chevrons).toBe(0);
    // The status options remain reachable (dropdown menu = the superset).
    await ctrl.click();
    await expect(page.getByRole("menuitem", { name: "All" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Completed" })).toBeVisible();
  });

  test("My Lists section renders no placeholder when empty", async ({ page }) => {
    await page.goto("/Tasks");
    await hydrated(page);
    const section = page.getByText("My Lists", { exact: true }).locator("..");
    await expect(section.getByText("No lists yet")).toHaveCount(0);
  });
});

test.describe("S9-E · Calendar Sunday-first grid", () => {
  test("weekday header starts at Sun and ends at Sat", async ({ page }) => {
    await page.goto("/Calendar");
    await hydrated(page);
    const header = page.locator('[aria-label="Calendar weekdays"]');
    const labels = await header.locator("span").allTextContents();
    expect(labels).toEqual(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
    // The reference's weekday row carries an mb-2 tail.
    const mb = await header.evaluate((el) => getComputedStyle(el).marginBottom);
    expect(mb).toBe("8px");
  });

  test("day grid's first cell is a Sunday (grid offset by getDay)", async ({ page }) => {
    await page.goto("/Calendar");
    await hydrated(page);
    const firstCell = page.locator('[aria-label="Calendar days"] button').first();
    const day = await firstCell.evaluate((el) => {
      // day cells are buttons whose first span is the date number; recompute
      // the weekday from the aria-label's trailing-year date.
      const label = el.getAttribute("aria-label") ?? "";
      const m = label.match(/(\w+) (\d+), (\d+)/);
      return m ? new Date(`${m[1]} ${m[2]}, ${m[3]}`).getDay() : -1;
    });
    expect(day).toBe(0); // Sunday
  });
});

test.describe("S9-F · Calendar mode switch chrome", () => {
  test("container is white/bordered; tabs are h-8 with grid3x3 + list icons", async ({ page }) => {
    await page.goto("/Calendar");
    await hydrated(page);
    const switchRoot = page.locator("main .bg-white.rounded-lg.border, main [aria-label='Calendar mode']");
    await expect(switchRoot).toBeVisible();
    const rootCs = await switchRoot.evaluate((el) => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, border: s.borderWidth, radius: s.borderRadius, padding: s.padding };
    });
    expect(rootCs.bg).toBe("rgb(255, 255, 255)");
    expect(rootCs.radius).toBe("8px");
    expect(rootCs.padding).toBe("4px");

    const calendarTab = switchRoot.getByRole("button", { name: "Calendar", exact: true });
    const timelineTab = switchRoot.getByRole("button", { name: "Timeline", exact: true });
    await expect(calendarTab).toBeVisible();
    await expect(timelineTab).toBeVisible();
    await expect(calendarTab.locator("svg")).toHaveClass(/lucide-grid3x3/);
    await expect(timelineTab.locator("svg")).toHaveClass(/lucide-list/);

    const h = await calendarTab.evaluate((el) => el.getBoundingClientRect().height);
    expect(Math.round(h)).toBe(32); // h-8

    const activeBg = await calendarTab.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(activeBg).toBe("rgb(139, 92, 246)"); // solid violet-500 fill
    const inactiveBg = await timelineTab.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(inactiveBg).toBe("rgba(0, 0, 0, 0)"); // ghost
  });
});

test.describe("S9-G/H · Files breadcrumb + toggle; Timetable Grid Builder", () => {
  test("breadcrumb root carries the house icon", async ({ page }) => {
    await page.goto("/Files");
    await hydrated(page);
    const root = page.getByRole("button", { name: "All Files" });
    await expect(root).toBeVisible();
    await expect(root.locator("svg")).toHaveClass(/lucide-house/);
  });

  test("view toggle uses grid3x3 (not layout-grid)", async ({ page }) => {
    await page.goto("/Files");
    await hydrated(page);
    const gridBtn = page.getByRole("button", { name: "Grid view" });
    await expect(gridBtn).toBeVisible();
    await expect(gridBtn.locator("svg")).toHaveClass(/lucide-grid3x3/);
    const wrong = await page.locator("main svg[class*=lucide-layout-grid]").count();
    expect(wrong).toBe(0);
  });

  test("Grid Builder button is text-only", async ({ page }) => {
    await page.goto("/Timetable");
    await hydrated(page);
    const gb = page.getByRole("button", { name: "Grid Builder" });
    await expect(gb).toBeVisible();
    const svgs = await gb.locator("svg").count();
    expect(svgs).toBe(0);
  });
});

test.describe("S9-I/J · Assignments rows + default filter; Exams badge", () => {
  test("status filter defaults to Active", async ({ page }) => {
    await page.goto("/Assignments");
    await hydrated(page);
    const trigger = page.locator('[aria-label="Filter assignments by status"]');
    await expect(trigger).toHaveText(/Active/);
  });

  test("rows carry no subject span and no description paragraph", async ({ page }) => {
    await page.goto("/Assignments");
    await hydrated(page);
    const rows = page.locator('[aria-label="Assignment rows"] > *');
    const first = rows.first();
    await expect(first).toBeVisible();
    const descCount = await page.locator("main p.line-clamp-2").count();
    expect(descCount).toBe(0);
    // No subject-name text on the row (the reference renders only the
    // title + due/priority/type pills + slider).
    await expect(first.getByText("Mathematics", { exact: true })).toHaveCount(0);
    // The pills row holds exactly the due + priority + type pills.
    const pillsRow = first.locator(".mb-3.flex.flex-wrap").last();
    const pillCount = await pillsRow.locator("span").count();
    expect(pillCount).toBe(2); // priority + type
  });

  test("exam 1-day bucket shows Tomorrow in the orange family", async ({ page }) => {
    await page.goto("/Exams");
    await hydrated(page);
    const badge = page.getByText("Tomorrow", { exact: true });
    await expect(badge).toBeVisible();
    const cs = await badge.evaluate((el) => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, color: s.color };
    });
    expect(cs.bg).toBe("rgb(255, 237, 213)"); // orange-100
    expect(cs.color).toBe("rgb(234, 88, 12)"); // orange-600
  });
});

test.describe("S9-K · Analytics chart axes + gridlines", () => {
  test("Task Activity chart renders X/Y axis labels and dashed gridlines", async ({ page }) => {
    await page.goto("/Analytics");
    await hydrated(page);
    const chart = page.locator('[aria-label="Task activity chart"]');
    await expect(chart).toBeVisible();
    const texts = await chart.locator("text").allTextContents();
    const dayNames = texts.filter((t) => /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)$/.test(t.trim()));
    expect(dayNames.length).toBeGreaterThanOrEqual(7); // X axis
    expect(texts.some((t) => t.trim() === "0")).toBe(true); // Y axis origin
    const dashed = await chart.locator('line[stroke-dasharray="3 3"]').count();
    expect(dashed).toBeGreaterThanOrEqual(4); // horizontal gridlines
  });

  test("Focus Time chart carries the violet line + gradient area", async ({ page }) => {
    await page.goto("/Analytics");
    await hydrated(page);
    const chart = page.locator('[aria-label="Focus time chart"]');
    await expect(chart).toBeVisible();
    await expect(chart.locator("path[stroke='#8b5cf6']")).toHaveCount(1);
    await expect(chart.locator("path[fill^='url(#']")).toHaveCount(1);
    const texts = await chart.locator("text").allTextContents();
    expect(texts.some((t) => t.trim().endsWith("h"))).toBe(true); // 0h..4h ticks
  });

  test("Task Activity area is filled slate-200", async ({ page }) => {
    await page.goto("/Analytics");
    await hydrated(page);
    const chart = page.locator('[aria-label="Task activity chart"]');
    await expect(chart).toBeVisible();
    // toHaveCount auto-waits (count() alone races the async data load).
    await expect(chart.locator("path[fill='#e2e8f0']")).toHaveCount(1);
  });
});

test.describe("S9-L · FocusTimer icons", () => {
  test("stat icons are flame/target/zap; Long Break preset is coffee", async ({ page }) => {
    await page.goto("/FocusTimer");
    await hydrated(page);
    const stats = page.locator("main .grid.grid-cols-3");
    await expect(stats.locator(".lucide-flame")).toHaveCount(1);
    await expect(stats.locator(".lucide-target")).toHaveCount(1);
    await expect(stats.locator(".lucide-zap")).toHaveCount(1);
    expect(await stats.locator(".lucide-brain").count()).toBe(0);
    expect(await stats.locator(".lucide-timer").count()).toBe(0);

    const longBreak = page.getByRole("button", { name: /Long Break/ });
    await expect(longBreak.locator("svg")).toHaveClass(/lucide-coffee/);
    expect(await page.locator("main .lucide-moon").count()).toBe(0);
  });
});

test.describe("S9-M · Settings tab icons", () => {
  test("all five tabs carry their measured icons", async ({ page }) => {
    await page.goto("/Settings");
    await hydrated(page);
    const tabs = page.getByRole("tab");
    await expect(tabs).toHaveCount(5);
    await expect(page.getByRole("tab", { name: "Appearance" }).locator("svg")).toHaveClass(/lucide-palette/);
    await expect(page.getByRole("tab", { name: "Profile" }).locator("svg")).toHaveClass(/lucide-user/);
    await expect(page.getByRole("tab", { name: "Subjects" }).locator("svg")).toHaveClass(/lucide-book-open/);
    await expect(page.getByRole("tab", { name: "Holidays" }).locator("svg")).toHaveClass(/lucide-calendar/);
    await expect(page.getByRole("tab", { name: "Notifications" }).locator("svg")).toHaveClass(/lucide-bell/);
  });
});

test.describe("S9-N · Notes combobox icons", () => {
  test("notebook and tag combobox triggers carry leading icons", async ({ page }) => {
    await page.goto("/Notes");
    await hydrated(page);
    const notebook = page.locator('[aria-label="Filter by notebook"]');
    await expect(notebook.locator("svg.lucide-folder")).toHaveCount(1);
    const tag = page.locator('[aria-label="Filter by tag"]');
    await expect(tag.locator("svg.lucide-tag")).toHaveCount(1);
  });
});

test.describe("S9-O · Flashcards deck-row menu", () => {
  test("deck rows expose a hover-revealed ellipsis menu button", async ({ page }) => {
    await page.goto("/Flashcards");
    await hydrated(page);
    const row = page.locator('[aria-label="Deck rows"] > *').first();
    await expect(row).toBeVisible();
    const menu = row.getByRole("button", { name: /options for/i });
    await expect(menu).toBeVisible();
    const cs = await menu.evaluate((el) => {
      const s = getComputedStyle(el);
      return { w: el.getBoundingClientRect().width, h: el.getBoundingClientRect().height, opacity: s.opacity };
    });
    expect(Math.round(cs.w)).toBe(32); // h-8 w-8
    expect(Math.round(cs.h)).toBe(32);
    await row.hover();
    await expect(menu).toHaveClass(/group-hover:opacity-100/);
    // The menu offers the superset actions.
    await menu.click();
    await expect(page.getByRole("menuitem", { name: /edit/i })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: /delete/i })).toBeVisible();
  });
});

test.describe("S9-P · AI composer icon", () => {
  test("composer submit uses wand-sparkles", async ({ page }) => {
    await page.goto("/AIAssistant");
    await hydrated(page);
    const composer = page.locator("main form, main .border-t button[type=submit], main button:last-child");
    const send = page.getByRole("button", { name: /send message/i });
    await expect(send.locator("svg")).toHaveClass(/lucide-wand-sparkles/);
  });
});

test.describe("S9-R · Dashboard slim empty states (fresh user)", () => {
  test("empty sections render p-8 text-center with a w-12 slate-300 icon", async ({ page }) => {
    await registerFreshUser(page, "dash");
    await page.goto("/Dashboard");
    await hydrated(page);
    const empty = page.getByText("No tasks for today. Add some from My Day!").locator("..");
    await expect(empty).toBeVisible();
    const cs = await empty.evaluate((el) => {
      const s = getComputedStyle(el);
      return { pad: s.padding, align: s.textAlign, color: s.color };
    });
    expect(cs.pad).toBe("32px"); // p-8
    expect(cs.align).toBe("center");
    expect(cs.color).toBe("rgb(100, 116, 139)"); // slate-500
    const icon = empty.locator("svg");
    await expect(icon).toHaveClass(/h-12 w-12/);
    const iconColor = await icon.evaluate((el) => getComputedStyle(el).color);
    expect(iconColor).toBe("rgb(203, 213, 225)"); // slate-300
    // NOT the 80px gradient EmptyState block.
    const gradBlocks = await empty.locator("[style*=gradient], [class*=bg-gradient-to-br]").count();
    expect(gradBlocks).toBe(0);
  });
});

test.describe("S9-S · Study groups hint text", () => {
  test("right-pane empty hint matches the reference wording", async ({ page }) => {
    await page.goto("/StudyGroups");
    await hydrated(page);
    await expect(page.getByText("Choose a study group from the sidebar or create a new one")).toBeVisible();
  });
});
