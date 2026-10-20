import { expect, test } from "@playwright/test";

// Desktop navigation + the full view surface: every one of the 20
// PascalCase routes renders its headline surface, the active sidebar item
// carries the accent treatment, and deep links (rewrites onto /) work.
// Contexts arrive AUTHENTICATED.

test.use({ viewport: { width: 1440, height: 900 } });

const VIEWS: { path: string; heading: string | RegExp }[] = [
  { path: "/Dashboard", heading: /Good (morning|afternoon|evening)/ },
  { path: "/MyDay", heading: "My Day" },
  { path: "/Tasks", heading: "All Tasks" },
  { path: "/Calendar", heading: "Calendar" },
  { path: "/Events", heading: "Events & Reminders" },
  { path: "/Timetable", heading: "Timetable" },
  { path: "/Assignments", heading: "Assignments" },
  { path: "/Exams", heading: "Exams" },
  { path: "/Notes", heading: "Notes" },
  { path: "/Flashcards", heading: "Flashcards" },
  { path: "/PracticeTests", heading: "Practice Tests" },
  { path: "/StudyGroups", heading: "Study Groups" },
  { path: "/GradeTracker", heading: "Grade Tracker" },
  { path: "/Analytics", heading: "Analytics" },
  { path: "/Files", heading: "Files" },
  { path: "/Calculator", heading: "Calculator Suite" },
  { path: "/MathSolver", heading: "Math Solver" },
  { path: "/AIAssistant", heading: "AI Study Assistant" },
  { path: "/FocusTimer", heading: "Focus Timer" },
  { path: "/Settings", heading: "Settings" },
];

test.describe("sidebar navigation (desktop)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/Dashboard");
  });

  test("all 20 nav links are present", async ({ page }) => {
    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav).toBeVisible();
    const NAV_LABELS = [
      "Dashboard", "My Day", "Tasks", "Calendar", "Events", "Timetable",
      "Assignments", "Exams", "Notes", "Flashcards", "Practice Tests",
      "Study Groups", "Grade Tracker", "Analytics", "Files", "Calculator",
      "Math Solver", "AI Assistant", "Focus Timer", "Settings",
    ];
    for (const label of NAV_LABELS) {
      await expect(nav.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
  });

  test("the active item carries the accent tint and trailing dot", async ({ page }) => {
    const active = page.getByRole("navigation", { name: "Primary" }).getByRole("link", {
      name: "Dashboard",
      exact: true,
    });
    await expect(active).toHaveAttribute("aria-current", "page");
    const chip = active.locator("span").first();
    const bg = await chip.evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(bg).toContain("linear-gradient");
    const color = await chip.evaluate((el) => getComputedStyle(el).color);
    expect(color).toBe("rgb(124, 58, 237)"); // violet-600 (measured live)
    await expect(active.locator(".rounded-full.ml-auto")).toBeVisible();
  });

  test("clicking a nav link switches views and moves the active state", async ({ page }) => {
    const nav = page.getByRole("navigation", { name: "Primary" });
    await nav.getByRole("link", { name: "Tasks", exact: true }).click();
    await expect(page).toHaveURL(/\/Tasks\/?$/);
    await expect(
      page.getByRole("navigation", { name: "Primary" }).getByRole("link", {
        name: "Tasks",
        exact: true,
      }),
    ).toHaveAttribute("aria-current", "page");
    // Dashboard lost the active state.
    await expect(
      page.getByRole("navigation", { name: "Primary" }).getByRole("link", {
        name: "Dashboard",
        exact: true,
      }),
    ).not.toHaveAttribute("aria-current", "page");
  });

  test("the sidebar can collapse and expand", async ({ page }) => {
    await page.getByRole("button", { name: "Collapse sidebar" }).click();
    const aside = page.locator("aside");
    // S52: the reference's collapsed rail measures w-20 (80px) — the
    // session-8-era 76px pin was corrected to the live measurement.
    await expect(aside).toHaveCSS("width", "80px");
    await page.getByRole("button", { name: "Expand sidebar" }).click();
    await expect(aside).toHaveCSS("width", "260px");
  });

  test("the brand header typography matches the measured reference (S3-H pin)", async ({ page }) => {
    // Reference (measured 1440×900, session-67 node dump): the sidebar
    // brand is h1.text-lg — v4 defaults render 18px bold / 28px lh — with
    // a text-xs (12px/16px) subtitle. The clone had the right 18px SIZE
    // but crushed the lh to 22.5 via leading-tight; the subtitle lh read
    // 15px for the same reason. (An earlier probe's 16px read was a
    // mis-measurement — corrected per AP-108 before pinning.)
    const title = page.locator("aside").getByText("StudyFlow", { exact: true });
    await expect(title).toBeVisible();
    await expect(title).toHaveCSS("font-size", "18px");
    await expect(title).toHaveCSS("font-weight", "700");
    await expect(title).toHaveCSS("line-height", "28px");

    const subtitle = page.locator("aside").getByText("Your study companion", { exact: true });
    await expect(subtitle).toBeVisible();
    await expect(subtitle).toHaveCSS("font-size", "12px");
    await expect(subtitle).toHaveCSS("line-height", "16px");
  });

  test("the nav icon glyphs match the s68-measured reference set (S8-Y pin)", async ({ page }) => {
    // Reference (measured s68, drawer + sidebar DOM lucide classes — the
    // icon source is shared so one surface proves both): six glyphs had
    // drifted from the S8-A-era records — Timetable calendar-range→calendar,
    // Assignments clipboard-list→book-open, Practice Tests file-text→
    // file-question, Grade Tracker list-checks→trending-up, AI Assistant
    // bot→sparkles, Focus Timer clock→timer. The other fourteen match.
    const EXPECTED: Array<[string, string]> = [
      ["Dashboard", "lucide-layout-dashboard"],
      ["My Day", "lucide-sun"],
      ["Tasks", "lucide-square-check-big"],
      ["Calendar", "lucide-calendar"],
      ["Events", "lucide-calendar-days"],
      ["Timetable", "lucide-calendar"],
      ["Assignments", "lucide-book-open"],
      ["Exams", "lucide-graduation-cap"],
      ["Notes", "lucide-book-open"],
      ["Flashcards", "lucide-layers"],
      ["Practice Tests", "lucide-file-question"],
      ["Study Groups", "lucide-users"],
      ["Grade Tracker", "lucide-trending-up"],
      ["Analytics", "lucide-chart-column"],
      ["Files", "lucide-folder-open"],
      ["Calculator", "lucide-calculator"],
      ["Math Solver", "lucide-calculator"],
      ["AI Assistant", "lucide-sparkles"],
      ["Focus Timer", "lucide-timer"],
      ["Settings", "lucide-settings"],
    ];
    const nav = page.getByRole("navigation", { name: "Primary" });
    for (const [label, icon] of EXPECTED) {
      const link = nav.getByRole("link", { name: label, exact: true });
      const cls = await link.locator("svg").evaluate((el) => el.getAttribute("class") ?? "");
      expect(cls, `${label} icon`).toContain(icon);
    }
  });

  test("the expanded sidebar chrome matches the s68-measured reference (S3-J pin)", async ({ page }) => {
    // Reference (measured s68, 1440×900): the sidebar brand header is
    // p-6 with a border-b (1px slate-100) and renders ~109px tall — the
    // subtitle WRAPS to two lines in its ~124px text container (the clone's
    // h-16/px-4 header was 64px with a one-line slate-500 subtitle). The
    // nav rows sit FLUSH (48px pitch — the reference's own space-y-1 class
    // is inert on its markup; the clone's gap-1 produced 52px pitch). The
    // active pill is the FULL 48px row (the reference paints px-4 py-3 +
    // bg on the row box; the clone painted a 24px inner span). The footer
    // clock reads 24px/700 under a border-t p-4 block (the clone read
    // 14px/600 with no divider).
    const header = page.locator("aside > div").first();
    await expect(header).toHaveCSS("padding-top", "24px");
    await expect(header).toHaveCSS("border-bottom-width", "1px");
    await expect(header).toHaveCSS("border-bottom-color", "rgb(241, 245, 249)");
    const headerH = await header.evaluate((el) => el.getBoundingClientRect().height);
    expect(headerH).toBeGreaterThanOrEqual(100); // 109 with the wrapped subtitle

    const subtitle = page.locator("aside").getByText("Your study companion", { exact: true });
    // The reference renders slate-400 (2.56:1 — an axe color-contrast
    // failure); the clone keeps slate-500 (4.76:1) — the documented
    // a11y-superset deviation (the Batch-R/S seven-surface family's call).
    await expect(subtitle).toHaveCSS("color", "rgb(100, 116, 139)"); // slate-500
    const subH = await subtitle.evaluate((el) => el.getBoundingClientRect().height);
    expect(subH).toBeGreaterThanOrEqual(30); // wraps to two lines (32)

    // FLUSH 48px nav pitch.
    const rows = page.locator("aside nav a");
    const pitch = await rows.evaluateAll((as) => {
      const vis = as.filter((a) => a.getBoundingClientRect().width > 0);
      return vis.length >= 2
        ? vis[1].getBoundingClientRect().y - vis[0].getBoundingClientRect().y
        : -1;
    });
    expect(pitch).toBe(48);

    // The active pill is the full 48px row (the S8-A chip's box).
    const active = page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: "Dashboard", exact: true });
    const chipH = await active.locator("span").first().evaluate((el) => el.getBoundingClientRect().height);
    expect(chipH).toBe(48);

    // Footer: the clock block carries a border-t divider; the time is 24px/700.
    const clockBlock = page.locator("aside > div").last().locator("div").first();
    await expect(clockBlock).toHaveCSS("border-top-width", "1px");
    await expect(clockBlock).toHaveCSS("padding-top", "16px");
    const time = page.locator("aside").getByText(/^\d{2}:\d{2} (AM|PM)$/).first();
    await expect(time).toHaveCSS("font-size", "24px");
    await expect(time).toHaveCSS("font-weight", "700");
  });

  test("the collapsed sidebar chrome matches the s68-measured reference (S3-K pin)", async ({ page }) => {
    // Reference (measured s68, collapsed via the header chevron): the
    // header keeps the SAME p-6 + border-b classes (85px tall — the clone's
    // collapsed branch was h-16/64px with a centered chevron; the reference
    // left-aligns the lone chevron at the p-6 edge, x ≈ 25). Collapsed rows
    // are 44px tall and FLUSH (44px pitch).
    await page.getByRole("button", { name: "Collapse sidebar" }).click();
    const header = page.locator("aside > div").first();
    await expect(header).toHaveCSS("padding-top", "24px");
    await expect(header).toHaveCSS("border-bottom-width", "1px");
    const headerH = await header.evaluate((el) => el.getBoundingClientRect().height);
    expect(headerH).toBeGreaterThanOrEqual(80); // 85 = p-6*2 + 36 chevron + 1 border

    const chevronX = await page
      .getByRole("button", { name: "Expand sidebar" })
      .evaluate((el) => el.getBoundingClientRect().x);
    expect(chevronX).toBeGreaterThanOrEqual(22);
    expect(chevronX).toBeLessThanOrEqual(27); // left-aligned at the p-6 edge (ref 25)

    const rows = page.locator("aside nav a");
    const pitch = await rows.evaluateAll((as) => {
      const vis = as.filter((a) => a.getBoundingClientRect().width > 0);
      return vis.length >= 2
        ? vis[1].getBoundingClientRect().y - vis[0].getBoundingClientRect().y
        : -1;
    });
    expect(pitch).toBe(44);
  });
});

test.describe("all views render (desktop)", () => {
  for (const view of VIEWS) {
    test(`/${view.path.replace("/", "")} renders`, async ({ page }) => {
      await page.goto(view.path);
      await expect(page).toHaveURL(new RegExp(view.path.replace("/", "\\/") + "\\/?$"));
      await expect(
        page.getByRole("heading", { name: view.heading }).first(),
      ).toBeVisible();
    });
  }

  test("dashboard shows the seeded stat cards and sections", async ({ page }) => {
    await page.goto("/Dashboard");
    await expect(page.getByText("Today's Progress", { exact: true })).toBeVisible();
    await expect(page.getByText("Pending Tasks", { exact: true })).toBeVisible();
    await expect(page.getByText("Due Soon", { exact: true })).toBeVisible();
    await expect(page.getByText("Focus Time", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Today's Tasks" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Upcoming Exams" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Upcoming Assignments" })).toBeVisible();
    // S4-K (measured s68): the reference's hero CTA is an ANCHOR (a real
    // /MyDay link, the overdue View All pattern) with a sparkles icon —
    // the clone shipped an iconless button.
    await expect(page.getByRole("link", { name: "Start My Day" })).toBeVisible();
  });

  test("Start My Day navigates to MyDay", async ({ page }) => {
    await page.goto("/Dashboard");
    await page.getByRole("link", { name: "Start My Day" }).click();
    await expect(page).toHaveURL(/\/MyDay\/?$/);
    await expect(page.getByRole("heading", { name: "My Day" })).toBeVisible();
  });
});

test.describe("view chrome (computed parity pins)", () => {
  test("cards render the v3-pinned shadow-sm geometry", async ({ page }) => {
    await page.goto("/Dashboard");
    const card = page.locator("main .overflow-hidden.rounded-2xl").first();
    const shadow = await card.evaluate((el) => getComputedStyle(el).boxShadow);
    // v3 shadow-sm: 0 1px 2px 0 rgba(0,0,0,0.05) — pinned in globals.css
    // (TRAP 5: v4's default shadow-sm is one notch heavier).
    expect(shadow.replace(/\s+/g, " ")).toContain("rgba(0, 0, 0, 0.05) 0px 1px 2px 0px");
  });

  test("the canvas carries the measured app gradient", async ({ page }) => {
    await page.goto("/Dashboard");
    // Wait for the hydrated app shell: the SSR splash (also .sf-canvas) is
    // removed on auth, and a locator resolved against it would go detached
    // (computed styles read as "" mid-removal).
    await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
    const canvas = page.locator(".sf-canvas").first();
    await expect(canvas).toBeAttached();
    const bg = await canvas.evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(bg).toContain("linear-gradient");
    expect(bg).toContain("rgb(248, 250, 252)"); // slate-50 first stop (measured)
    // Third stop measured live on the reference: rgba(245,243,255,0.3)
    // (violet-50). A previous approximation rendered rgb(241,237,255).
    expect(bg).toContain("rgba(245, 243, 255, 0.3)");
  });

  test("corner radii match the reference's v3 semantics (radius trap pin)", async ({ page }) => {
    await page.goto("/Dashboard");
    // Tailwind v4 did NOT shift the radius scale above the small end:
    // rounded-2xl is 16px in v3 AND v4; the reference (a v3 app) measures
    // cards at 16px and buttons (rounded-md) at 6px. A one-notch-up pin
    // block previously inflated these to 20px / 8px — this spec pins the
    // corrected contract (see docs/remediation-plan.md R1).
    const card = page.locator("main .overflow-hidden.rounded-2xl").first();
    await expect(card).toHaveCSS("border-radius", "16px");

    // S4-K (measured s68): the reference's hero CTA is an anchor with a
    // sparkles icon — the button locator corrected per AP-108.
    const button = page.getByRole("link", { name: "Start My Day" });
    await expect(button).toHaveCSS("border-radius", "6px");

    // Sidebar nav items use rounded-xl → 12px (reference inner div measured).
    const navItem = page.getByRole("navigation", { name: "Primary" }).locator("span.rounded-xl").first();
    await expect(navItem).toHaveCSS("border-radius", "12px");
  });

  test("the sidebar footer avatar renders the reference default state", async ({ page }) => {
    await page.goto("/Dashboard");
    // The reference shows a 36px gradient circle with the user's initial
    // when no emoji avatar is set (w-9 h-9, gradient, white letter).
    const avatar = page.locator("aside span.rounded-full").filter({ hasText: /./ }).first();
    const box = await avatar.boundingBox();
    expect(Math.round(box?.width ?? 0)).toBe(36);
    const style = await avatar.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { bg: cs.backgroundImage || cs.backgroundColor, color: cs.color };
    });
    expect(style.bg).toContain("linear-gradient");
    expect(style.color).toBe("rgb(255, 255, 255)");
    expect(await avatar.textContent()).toMatch(/^[A-Za-z]$/); // single initial
  });

  test("stat card icons render at the reference's 24px (S3-A pin)", async ({ page }) => {
    await page.goto("/Dashboard");
    // Reference stat chips: 48px chip with a w-6 h-6 (24px) white glyph —
    // the clone previously rendered h-5 w-5 (20px).
    const chip = page.locator("main .overflow-hidden.rounded-2xl span.rounded-xl").first();
    await expect(chip).toBeVisible();
    const icon = chip.locator("svg").first();
    const box = await icon.boundingBox();
    expect(Math.round(box?.width ?? 0)).toBe(24);
  });

  test("stat card text metrics mirror the reference (S4-B pin)", async ({ page }) => {
    await page.goto("/Dashboard");
    // Reference (measured): label text-sm font-medium slate-500 mb-1;
    // value <h3 class="text-3xl font-bold"> — 30px/700 with the 36px
    // text-3xl line-height and NORMAL tracking; hint text-sm slate-400 mt-1.
    // The clone previously rendered p.text-[30px].leading-none.tracking-tight
    // with a 12px hint.
    const value = page.getByRole("heading", { name: /^[\d/]+/ }).first();
    await expect(value).toBeVisible();
    await expect(value).toHaveCSS("font-size", "30px");
    await expect(value).toHaveCSS("line-height", "36px");
    await expect(value).toHaveCSS("letter-spacing", "normal");
    const valueBox = await value.evaluate((el) => {
      const label = el.previousElementSibling!;
      const hint = el.nextElementSibling!;
      const cs = getComputedStyle;
      return {
        labelWeight: cs(label).fontWeight,
        labelMB: cs(label).marginBottom,
        hintSize: cs(hint).fontSize,
        hintMT: cs(hint).marginTop,
      };
    });
    expect(valueBox.labelWeight).toBe("500");
    expect(valueBox.labelMB).toBe("4px");
    expect(valueBox.hintSize).toBe("14px");
    expect(valueBox.hintMT).toBe("4px");
  });

  test("view titles render the reference model: h1, slate-800, icon (S4-D pin)", async ({ page }) => {
    // Reference (measured on every view): <h1 class="text-2xl font-bold
    // text-slate-800 flex items-center gap-2"> with a 24px text-violet-500
    // lucide icon on 16 views; MyDay/FocusTimer titles are text-3xl (30px).
    await page.goto("/Events");
    const h1 = page.getByRole("heading", { name: "Events & Reminders", exact: true });
    await expect(h1).toBeVisible();
    await expect(h1).toHaveCSS("color", "rgb(30, 41, 59)"); // slate-800
    await expect(h1).toHaveCSS("letter-spacing", "normal"); // NOT tracking-tight
    const icon = h1.locator("svg").first();
    const box = await icon.boundingBox();
    expect(Math.round(box?.width ?? 0)).toBe(24);
    const iconColor = await icon.evaluate((el) => getComputedStyle(el).color);
    expect(iconColor).toBe("rgb(139, 92, 246)"); // violet-500 = --sf-primary

    // Subtitle: 16px slate-500 with the reference's exact wording.
    const sub = h1.locator("xpath=following-sibling::p").first();
    await expect(sub).toHaveText("Manage your events with custom reminders");
    await expect(sub).toHaveCSS("font-size", "16px");
  });

  test("FocusTimer renders the reference's larger text-3xl title (S4-D pin)", async ({ page }) => {
    await page.goto("/FocusTimer");
    const h1 = page.getByRole("heading", { name: "Focus Timer", exact: true });
    await expect(h1).toBeVisible();
    await expect(h1).toHaveCSS("font-size", "30px");
    await expect(h1.locator("svg").first()).toBeVisible();
  });

  test("the MyDay subtitle omits the year (S4-D pin)", async ({ page }) => {
    await page.goto("/MyDay");
    // Reference (measured): "Wednesday, October 7" — no year on MyDay
    // (the DASHBOARD date keeps the year; this one does not).
    const sub = page.locator("main h1 + p").first();
    await expect(sub).toHaveText(/^[A-Z][a-z]+, [A-Z][a-z]+ \d{1,2}$/);
  });

  test("empty states render the reference's gradient-block design (S4-C pin)", async ({ page }) => {
    // Reference (measured on Tasks/Notes): an 80px rounded-2xl block with
    // linear-gradient(to right bottom, rgb(237,233,254), rgb(224,231,255))
    // (violet-100 → indigo-100), a 40px violet icon, an h3 20px/600 title,
    // and a 16px slate-500 hint, inside py-16 px-4. Verified on /Files —
    // the one view the seed leaves empty (files/folders are never seeded).
    await page.goto("/Files");
    const empty = page.locator("main [class*='py-16']").first();
    await expect(empty).toBeVisible();
    const block = empty.locator("div.rounded-2xl").first();
    const box = await block.boundingBox();
    expect(Math.round(box?.width ?? 0)).toBe(80);
    const grad = await block.evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(grad.replace(/\s+/g, " ")).toContain("rgb(237, 233, 254)");
    expect(grad.replace(/\s+/g, " ")).toContain("rgb(224, 231, 255)");
    const icon = block.locator("svg").first();
    const iconBox = await icon.boundingBox();
    expect(Math.round(iconBox?.width ?? 0)).toBe(40);
    const iconColor = await icon.evaluate((el) => getComputedStyle(el).color);
    expect(iconColor).toBe("rgb(139, 92, 246)");
    const title = empty.getByRole("heading", { name: /no files yet/i });
    await expect(title).toHaveCSS("font-size", "20px");
    await expect(title).toHaveCSS("font-weight", "600");
    const hint = empty.locator("p").last();
    await expect(hint).toHaveCSS("font-size", "16px");
  });

  test("brand gradients end at the measured indigo stops (S4-G pin)", async ({ page }) => {
    await page.goto("/Dashboard");
    // CTA: linear-gradient(to right, rgb(139,92,246), rgb(79,70,229)) —
    // violet-500 → indigo-600 (the clone previously ended violet-600).
    // S4-K (measured s68): the CTA is an anchor (the button locator
    // corrected per AP-108).
    const cta = page.getByRole("link", { name: "Start My Day" });
    const ctaBg = await cta.evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(ctaBg.replace(/\s+/g, " ")).toContain("rgb(139, 92, 246)");
    expect(ctaBg.replace(/\s+/g, " ")).toContain("rgb(79, 70, 229)");

    // Sidebar brand chip: same measured pair.
    const chip = page.locator("aside span.rounded-xl").first();
    const chipBg = await chip.evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(chipBg.replace(/\s+/g, " ")).toContain("rgb(79, 70, 229)");
  });

  test("the footer avatar renders the measured violet-400 → indigo-500 pair (S4-G pin)", async ({ page }) => {
    await page.goto("/Dashboard");
    // Reference avatar gradient (measured): rgb(167,139,250) → rgb(99,102,241)
    // — the LIGHTER pair, unlike the brand chips' 500→600.
    const avatar = page.locator("aside span.rounded-full").filter({ hasText: /./ }).first();
    const bg = await avatar.evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(bg.replace(/\s+/g, " ")).toContain("rgb(167, 139, 250)");
    expect(bg.replace(/\s+/g, " ")).toContain("rgb(99, 102, 241)");
  });

  test("the dashboard date renders at 16px like the reference (S4-I pin)", async ({ page }) => {
    await page.goto("/Dashboard");
    const date = page.locator("main h1 + p").first();
    await expect(date).toHaveCSS("font-size", "16px");
    await expect(date).toHaveText(/^[A-Z][a-z]+, [A-Z][a-z]+ \d{1,2}, \d{4}$/);
  });

  test("dashboard section titles resolve as h2 (S4-J pin)", async ({ page }) => {
    await page.goto("/Dashboard");
    // Reference: "Today's Tasks" & co are <h2> (18px/600 + 20px icon);
    // stat values are the h3 level (S4-B).
    const h2 = page.getByRole("heading", { level: 2, name: "Today's Tasks" });
    await expect(h2).toBeVisible();
    await expect(h2).toHaveCSS("font-size", "18px");
  });

  test("View All buttons carry the lucide arrow icon (S4-E pin)", async ({ page }) => {
    await page.goto("/Dashboard");
    const viewAll = page.getByRole("button", { name: /^View All/ }).first();
    await expect(viewAll.locator("svg").first()).toBeVisible();
    const box = await viewAll.locator("svg").first().boundingBox();
    expect(Math.round(box?.width ?? 0)).toBe(16);
  });

  test("the dashboard stat cards match the measured reference copy and focus semantics (S4-K pin)", async ({ page }) => {
    // Reference (measured s68, zero state): the four stat hints read
    // "tasks completed" / "to be done" / "assignments" / "this month" —
    // the clone's "tasks done today" / "to complete" / "next 7 days" /
    // "logged today" were invented copy no pin guarded. The Focus Time
    // VALUE is month-scoped HOURS ("0h"), not today-minutes ("0m").
    await page.goto("/Dashboard");
    for (const hint of ["tasks completed", "to be done", "assignments", "this month"]) {
      await expect(page.getByText(hint, { exact: true })).toBeVisible();
    }
    for (const stale of ["tasks done today", "logged today"]) {
      await expect(page.getByText(stale, { exact: true })).toHaveCount(0);
    }
    // The Focus Time VALUE is month-scoped hours — the demo account holds
    // focus sessions, so the exact value varies; assert the HOURS FORMAT
    // (the zero-state "0h" equality is the sweep probes' cross-check).
    const focusValue = page.getByRole("heading", { level: 2, name: /^\d+(\.\d+)?h$/ });
    await expect(focusValue).toBeVisible();
    // The hero CTA carries the reference's sparkles icon.
    const cta = page.getByRole("link", { name: "Start My Day" });
    const iconCls = await cta.locator("svg").evaluate((el) => el.getAttribute("class") ?? "");
    expect(iconCls).toContain("lucide-sparkles");
  });

  test("the sidebar clock chip and time format match the reference (S3-B/S3-C pins)", async ({ page }) => {
    await page.goto("/Dashboard");
    // Reference (measured): linear-gradient(to right bottom,
    // rgb(245,243,255), rgb(238,242,255)) — violet-50 → indigo-50 EXACTLY.
    // The time text renders a 2-digit hour ("03:43 AM").
    const clockChip = page.locator("aside div.rounded-xl").filter({ hasText: /AM|PM/ }).first();
    await expect(clockChip).toBeVisible();
    const grad = await clockChip.evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(grad.replace(/\s+/g, " ")).toContain("rgb(245, 243, 255)");
    expect(grad.replace(/\s+/g, " ")).toContain("rgb(238, 242, 255)");

    const time = clockChip.locator("p").first();
    await expect(time).toHaveText(/^\d{2}:\d{2} (AM|PM)$/);
  });

  test("the dashboard section grid matches the reference's 3-track row (S4-L pin)", async ({ page }) => {
    // Reference (measured s69): the section row is `grid lg:grid-cols-3
    // gap-6` with Today's Tasks spanning TWO tracks (736px) and Upcoming
    // Exams one (356px). The clone's lg:grid-cols-2 rendered 546/546.
    await page.goto("/Dashboard");
    const tasksCard = page
      .locator("section", { has: page.getByRole("heading", { name: "Today's Tasks" }) })
      .first();
    await expect(tasksCard).toBeVisible();
    const span = await tasksCard.evaluate((el) => getComputedStyle(el).gridColumn);
    expect(span).toBe("span 2 / span 2");
    const grid = tasksCard.evaluate((el) => getComputedStyle(el.parentElement!).gridTemplateColumns);
    expect((await grid).split(" ")).toHaveLength(3);
  });

  test("the dashboard section header icons match the reference map (S4-M pin)", async ({ page }) => {
    // Reference (measured s69): Today's Tasks = square-check-big,
    // Upcoming Exams = graduation-cap, Upcoming Assignments = book-open.
    // The clone's sun/clipboard-list were S8-era guesses.
    await page.goto("/Dashboard");
    for (const [title, icon] of [
      ["Today's Tasks", "lucide-square-check-big"],
      ["Upcoming Exams", "lucide-graduation-cap"],
      ["Upcoming Assignments", "lucide-book-open"],
    ] as const) {
      const h2 = page.getByRole("heading", { level: 2, name: title });
      const cls = await h2.locator("svg").evaluate((el) => el.getAttribute("class") ?? "");
      expect(cls).toContain(icon);
    }
  });

  test("the Upcoming Exams header carries the reference's All anchor (S4-N pin)", async ({ page }) => {
    // Reference (RE-measured s70, probe #3 node dump — AP-108): the s69
    // probe read the ANCHOR's inherited styles (16px neutral-950); the
    // dump revealed the anchor wraps a BUTTON (shadcn base) whose visible
    // text renders 12px/500 violet-600 rgb(124,58,237) at h-32 — all three
    // section headers share this anchor>button anatomy.
    await page.goto("/Dashboard");
    const examsCard = page
      .locator("section", { has: page.getByRole("heading", { name: "Upcoming Exams" }) })
      .first();
    const all = examsCard.locator("a").filter({ hasText: /^All/ });
    await expect(all).toBeVisible();
    const href = await all.getAttribute("href");
    expect(href).toBe("/Exams");
    const cls = await all.locator("svg").evaluate((el) => el.getAttribute("class") ?? "");
    expect(cls).toContain("lucide-arrow-right");
    const btn = all.locator("button");
    const cs = await btn.evaluate((el) => {
      const s = getComputedStyle(el);
      return { fs: s.fontSize, fw: s.fontWeight, color: s.color, h: Math.round(el.getBoundingClientRect().height) };
    });
    expect(cs.fs).toBe("12px");
    expect(cs.fw).toBe("500");
    expect(cs.color).toBe("rgb(124, 58, 237)");
    expect(cs.h).toBe(32);
  });

  test("all three dashboard section actions share the anchor>button anatomy (S4-Q pin)", async ({ page }) => {
    // Reference (measured s70, probes #2/#3): Today's Tasks → <a href="/MyDay">,
    // Upcoming Exams → <a href="/Exams">, Upcoming Assignments →
    // <a href="/Assignments"> — each wrapping a 12px/500 violet-600 h-8
    // button labelled "View All" / "All" / "View All" with the arrow icon.
    // The clone's Tasks action was a bare button; the Assignments card had
    // NO action at all.
    await page.goto("/Dashboard");
    const cases = [
      { head: "Today's Tasks", href: "/MyDay", label: /^View All/ },
      { head: "Upcoming Exams", href: "/Exams", label: /^All$/ },
      { head: "Upcoming Assignments", href: "/Assignments", label: /^View All/ },
    ];
    for (const c of cases) {
      const card = page
        .locator("section", { has: page.getByRole("heading", { name: c.head }) })
        .first();
      const a = card.locator("a").filter({ hasText: c.label }).first();
      await expect(a).toBeVisible();
      expect(await a.getAttribute("href")).toBe(c.href);
      const btn = a.locator("button");
      const cs = await btn.evaluate((el) => {
        const s = getComputedStyle(el);
        return {
          text: (el.textContent ?? "").trim(),
          fs: s.fontSize,
          fw: s.fontWeight,
          color: s.color,
          h: Math.round(el.getBoundingClientRect().height),
        };
      });
      expect(cs.text).toMatch(c.label);
      expect(cs.fs).toBe("12px");
      expect(cs.fw).toBe("500");
      expect(cs.color).toBe("rgb(124, 58, 237)");
      expect(cs.h).toBe(32);
      const svg = await a.locator("svg").evaluate((el) => el.getAttribute("class") ?? "");
      expect(svg).toContain("lucide-arrow-right");
    }
  });

  test("the Upcoming Assignments card sits OUTSIDE the section grid (S4-R pin)", async ({ page }) => {
    // Reference (measured s70, probes #3/#4): the assignments card is a
    // DIRECT child of the root flow (a sibling of the 3-track grid, which
    // holds only Tasks col-span-2 + Exams), so it renders FULL-width
    // (1116px at 1440). The clone had it as a grid item (row 2, track 1).
    await page.goto("/Dashboard");
    const tasksCard = page
      .locator("section", { has: page.getByRole("heading", { name: "Today's Tasks" }) })
      .first();
    const assignmentsCard = page
      .locator("section", { has: page.getByRole("heading", { name: "Upcoming Assignments" }) })
      .first();
    await expect(assignmentsCard).toBeVisible();
    const inside = await tasksCard.evaluate((tasks, assign) => {
      const grid = tasks.parentElement!;
      return grid.contains(assign);
    }, await assignmentsCard.elementHandle());
    expect(inside).toBe(false);
    // full width = the grid's own width
    const widths = await tasksCard.evaluate((tasks, assign) => ({
      grid: Math.round(tasks.parentElement!.getBoundingClientRect().width),
      card: Math.round(assign.getBoundingClientRect().width),
    }), await assignmentsCard.elementHandle());
    expect(widths.card).toBe(widths.grid);
  });

  test("the dashboard root rhythm is the reference's 32px stack (S4-S pin)", async ({ page }) => {
    // Reference (measured s70, probe #4): the root container stacks the
    // greeting / stats / section grid / assignments card with space-y-8
    // (32px) gaps — the clone's gap-6 rendered 24px (the stat row sat 8px
    // high: y=120 vs the reference's y=128).
    await page.goto("/Dashboard");
    const tasksCard = page
      .locator("section", { has: page.getByRole("heading", { name: "Today's Tasks" }) })
      .first();
    const rootGap = await tasksCard.evaluate((el) => {
      const root = el.parentElement!.parentElement!;
      return getComputedStyle(root).rowGap;
    });
    expect(rootGap).toBe("32px");
  });

  test("the dashboard section headers carry the reference's bordered block (S4-T pin)", async ({ page }) => {
    // Reference (measured s70, probe #5): the section header is an OUTER
    // div `p-6 border-b border-slate-100` (24/24 + a 1px slate-100 divider
    // spanning the card) wrapping an inner `flex items-center
    // justify-between` row (h=32, no gap) — the clone's single `p-6 pb-4`
    // row rendered 24/16 with no divider (card 218px vs the ref's 231px).
    await page.goto("/Dashboard");
    const tasksCard = page
      .locator("section", { has: page.getByRole("heading", { name: "Today's Tasks" }) })
      .first();
    const header = tasksCard.locator("div").first();
    const cs = await header.evaluate((el) => {
      const s = getComputedStyle(el);
      const row = el.firstElementChild!;
      const rs = getComputedStyle(row);
      return {
        pt: s.paddingTop, pb: s.paddingBottom,
        bbw: s.borderBottomWidth, bbc: s.borderBottomColor,
        rowDisplay: rs.display, rowGap: rs.columnGap,
        rowH: Math.round(row.getBoundingClientRect().height),
      };
    });
    expect(cs.pt).toBe("24px");
    expect(cs.pb).toBe("24px");
    expect(cs.bbw).toBe("1px");
    expect(cs.bbc).toBe("rgb(241, 245, 249)"); // slate-100
    expect(cs.rowDisplay).toBe("flex");
    expect(cs.rowGap).toBe("normal");
    expect(cs.rowH).toBe(32);
  });

  test("the dashboard section empties match the reference icons and copy (S4-O pin)", async ({ page }) => {
    // Reference (measured s69, zero state): "No upcoming exams" (NO
    // period) and "No upcoming assignments" (the clone's "No active
    // assignments." was invented); the empty icons mirror the header
    // icons (square-check-big / graduation-cap / book-open); the message
    // renders 16px (the reference's measured size). Zero state = the S17
    // fresh-user pattern (the demo seed ships exams/assignments); the
    // cookie clear detaches the shared demo storageState first.
    await page.context().clearCookies();
    const email = `s4o-${Date.now()}@studyflow.app`;
    const res = await page.request.post("/api/auth/register", {
      data: { email, password: "Fresh1234!", name: "S4O Probe" },
    });
    expect(res.ok(), `register failed: ${res.status()}`).toBe(true);
    const { code } = (await res.json()) as { code: string };
    await page.request.post("/api/auth/verify-email", { data: { email, code } });
    await page.goto("/Dashboard");
    await expect(page.getByText("No upcoming exams", { exact: true })).toBeVisible();
    await expect(page.getByText("No upcoming assignments", { exact: true })).toBeVisible();
    await expect(page.getByText("No active assignments.", { exact: true })).toHaveCount(0);
    const examsCard = page
      .locator("section", { has: page.getByRole("heading", { name: "Upcoming Exams" }) })
      .first();
    const msg = examsCard.getByText("No upcoming exams", { exact: true });
    await expect(msg).toHaveCSS("font-size", "16px");
    const assignCard = page
      .locator("section", { has: page.getByRole("heading", { name: "Upcoming Assignments" }) })
      .first();
    const iconCls = await assignCard
      .locator("svg")
      .filter({ hasNot: page.locator("h2 svg") })
      .evaluateAll((svgs) => svgs.map((s) => s.getAttribute("class") ?? "").join(","));
    expect(iconCls).toContain("lucide-book-open");
  });

  test("the view header icons match the re-dumped reference map (S3-M pin)", async ({ page }) => {
    // Reference (measured s69): Grade Tracker's h1 icon is trending-up,
    // Practice Tests' is file-question — the Batch-Y NAV_ICONS fix never
    // reached the ViewHeader call sites (they kept the pre-Y1 glyphs).
    await page.goto("/GradeTracker");
    const gt = page.getByRole("heading", { level: 1, name: "Grade Tracker" });
    expect(await gt.locator("svg").evaluate((el) => el.getAttribute("class") ?? "")).toContain(
      "lucide-trending-up",
    );
    await page.goto("/PracticeTests");
    const pt = page.getByRole("heading", { level: 1, name: "Practice Tests" });
    expect(await pt.locator("svg").evaluate((el) => el.getAttribute("class") ?? "")).toContain(
      "lucide-file-question",
    );
  });

  test("the Settings subtitle reads the reference's copy (S4-P pin)", async ({ page }) => {
    // Reference (measured s69): "Customize your StudyFlow experience" —
    // the clone's "Personalize your study companion" was invented.
    await page.goto("/Settings");
    await expect(page.getByText("Customize your StudyFlow experience", { exact: true })).toBeVisible();
  });
});
