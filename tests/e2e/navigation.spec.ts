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
    await expect(page.getByRole("button", { name: "Start My Day" })).toBeVisible();
  });

  test("Start My Day navigates to MyDay", async ({ page }) => {
    await page.goto("/Dashboard");
    await page.getByRole("button", { name: "Start My Day" }).click();
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

    const button = page.getByRole("button", { name: "Start My Day" });
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
    const cta = page.getByRole("button", { name: "Start My Day" });
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
});
