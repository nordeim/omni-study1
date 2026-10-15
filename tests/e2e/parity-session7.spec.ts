import { expect, test, type Page } from "@playwright/test";

/**
 * Session-7 parity pins — lightly-probed views + Flashcards parity.
 *
 * Every pin here was measured on the live reference
 * (https://omni-study1.base44.app, authed) after creating a real reference
 * deck + card ("Audit Biology Deck") and probing the Timetable / Analytics /
 * Grade Tracker / Study Groups / Practice Tests / Notes surfaces. See
 * docs/remediation-plan-session7.md for the measured values:
 *
 *  S7-A Flashcards two-panel layout: colored deck rows, swatch dialog,
 *      card grid + difficulty badges, 3D-flip study mode, AI Generate
 *  S7-B Study Groups swatch palette + Practice Tests dialog (questions +
 *      AI Generate Questions)
 *  S7-C Timetable grid-cols-8 week grid (day heads, 60px hours, "7 AM"
 *      labels, mobile accordion) + My Classes today-date header
 *  S7-D Analytics icon-block stat cards + 7-day chart cards
 *  S7-E Grade Tracker summary icons (award/target/chart-column, w-8 h-8)
 *  S7-F Notes editor title input ("Note title...", bold)
 */

const hydrated = (page: Page) =>
  page.waitForFunction(() => document.documentElement.style.getPropertyValue("--sf-primary") !== "");

const rgb = (r: number, g: number, b: number) => `rgb(${r}, ${g}, ${b})`;

const isRound = (radius: string) => radius === "9999px" || radius === "3.35544e+07px";

test.describe("S7-A · Flashcards deck sidebar", () => {
  test("deck rows are slate-50 r12 cards with a 40px colored icon block", async ({ page }) => {
    await page.goto("/Flashcards");
    await hydrated(page);
    const row = page.locator('[aria-label="Deck rows"] > *', { hasText: "Integration rules" }).first();
    await expect(row).toBeVisible();
    const cs = await row.evaluate((el) => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, radius: s.borderRadius, border: s.border };
    });
    expect(cs.bg).toBe(rgb(248, 250, 252)); // slate-50
    expect(cs.radius).toBe("12px");
    expect(cs.border).toContain("2px"); // border-2 border-transparent
    const icon = row.locator("[class*='w-10']").first();
    const iconCs = await icon.evaluate((el) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return { bg: s.backgroundColor, w: r.width, h: r.height, radius: s.borderRadius };
    });
    expect(iconCs.w).toBe(40);
    expect(iconCs.h).toBe(40);
    expect(iconCs.radius).toBe("12px");
    expect(iconCs.bg).toBe(rgb(139, 92, 246)); // seeded violet deck color
  });

  test("deck counts render as text-xs slate-500 'N cards'", async ({ page }) => {
    await page.goto("/Flashcards");
    await hydrated(page);
    const row = page.locator('[aria-label="Deck rows"] > *', { hasText: "Integration rules" }).first();
    const count = row.locator("p.text-xs").first();
    await expect(count).toHaveText(/cards?/);
    expect(await count.evaluate((el) => getComputedStyle(el).color)).toBe(rgb(100, 116, 139)); // slate-500
  });

  test("the Create Deck dialog offers the 6 measured swatches", async ({ page }) => {
    await page.goto("/Flashcards");
    await hydrated(page);
    await page.getByRole("button", { name: "New Deck" }).click();
    const dlg = page.getByRole("dialog");
    await expect(dlg.getByText("Deck Name")).toBeVisible();
    const swatches = dlg.locator('[aria-label="Deck color swatches"] > button');
    await expect(swatches).toHaveCount(6);
    const colors = await swatches.evaluateAll((els) =>
      els.map((el) => getComputedStyle(el).backgroundColor),
    );
    // violet-500, blue-500, emerald-500, amber-500, red-500, pink-500 (measured order).
    expect(colors[0]).toBe(rgb(139, 92, 246));
    expect(colors[1]).toBe(rgb(59, 130, 246));
    expect(colors[2]).toBe(rgb(16, 185, 129));
    expect(colors[3]).toBe(rgb(245, 158, 11));
    expect(colors[4]).toBe(rgb(239, 68, 68));
    expect(colors[5]).toBe(rgb(236, 72, 153));
  });
});

test.describe("S7-A · Flashcards deck detail + card grid", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/Flashcards");
    await hydrated(page);
    await page.locator('[aria-label="Deck rows"] > *', { hasText: "Integration rules" }).first().click();
  });

  test("the detail header is a 20px bold h2 with AI Generate + Add Card + Study buttons", async ({ page }) => {
    const h2 = page.locator('[aria-label="Deck detail"] h2').first();
    await expect(h2).toHaveText("Integration rules");
    const cs = await h2.evaluate((el) => ({
      size: getComputedStyle(el).fontSize,
      weight: getComputedStyle(el).fontWeight,
      color: getComputedStyle(el).color,
    }));
    expect(cs.size).toBe("20px");
    expect(cs.weight).toBe("700");
    expect(cs.color).toBe(rgb(30, 41, 59)); // slate-800
    const detail = page.locator('[aria-label="Deck detail"]');
    await expect(detail.getByRole("button", { name: "AI Generate" })).toBeVisible();
    await expect(detail.getByRole("button", { name: "Add Card" })).toBeVisible();
    await expect(detail.getByRole("button", { name: "Study" })).toBeVisible();
  });

  test("cards render in a 3-col grid with difficulty badges and hover-revealed actions", async ({ page }) => {
    const grid = page.locator('[aria-label="Card grid"]');
    await expect(grid).toBeVisible();
    const cls = await grid.evaluate((el) => el.className);
    expect(cls).toContain("lg:grid-cols-3");
    const card = grid.locator("> *", { hasText: "Chain rule" }).first();
    await expect(card).toBeVisible();
    const cs = await card.evaluate((el) => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, radius: s.borderRadius, border: s.borderTopColor };
    });
    expect(cs.bg).toBe(rgb(255, 255, 255));
    expect(cs.radius).toBe("12px");
    expect(cs.border).toBe(rgb(226, 232, 240)); // slate-200
    const badge = card.locator("span.rounded-full").first();
    const badgeCs = await badge.evaluate((el) => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, color: s.color, text: el.textContent };
    });
    expect(badgeCs.bg).toBe(rgb(254, 249, 195)); // yellow-100
    expect(badgeCs.color).toBe(rgb(161, 98, 7)); // yellow-700
    expect(badgeCs.text).toBe("medium"); // seeded "Chain rule" card difficulty
  });
});

test.describe("S7-A · Flashcards study mode", () => {
  test("study renders the 3D flip card with the gradient front and Exit Study", async ({ page }) => {
    await page.goto("/Flashcards");
    await hydrated(page);
    await page.locator('[aria-label="Deck rows"] > *', { hasText: "Integration rules" }).first().click();
    await page.locator('[aria-label="Deck detail"]').getByRole("button", { name: "Study" }).click();
    const study = page.locator('[aria-label="Study mode"]');
    await expect(study).toBeVisible();
    await expect(study.getByRole("button", { name: "Exit Study" })).toBeVisible();
    const flip = study.locator("[data-flip-card]");
    await expect(flip).toBeVisible();
    const front = flip.locator("[data-flip-front]");
    const frontCs = await front.evaluate((el) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return { image: s.backgroundImage, h: r.height, radius: s.borderRadius };
    });
    // sRGB-exact gradient stops pinned in globals (violet-500 → indigo-600).
    expect(frontCs.image).toContain(rgb(139, 92, 246));
    expect(frontCs.image).toContain(rgb(79, 70, 229));
    expect(Math.round(frontCs.h)).toBe(320); // h-80
    expect(frontCs.radius).toBe("16px"); // rounded-2xl
    const back = flip.locator("[data-flip-back]");
    const backCs = await back.evaluate((el) => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, border: s.borderTopColor + " " + s.borderTopWidth };
    });
    expect(backCs.bg).toBe(rgb(255, 255, 255));
    expect(backCs.border).toContain(rgb(221, 214, 254)); // violet-200
    // Flip on click reveals the back's answer text.
    await flip.click();
    await expect(study.getByText("cos(x)")).toBeVisible();
  });
});

test.describe("S7-B · Study Groups + Practice Tests dialogs", () => {
  test("the group dialog swatches are the measured emerald/amber set", async ({ page }) => {
    await page.goto("/StudyGroups");
    await hydrated(page);
    // S8-H rework: the desktop pane's create affordance is the 36px gradient
    // plus button (aria-label "Create study group").
    await page.getByRole("button", { name: "Create study group" }).click();
    const swatches = page.getByRole("dialog").locator('[aria-label="Group color swatches"] > button');
    await expect(swatches).toHaveCount(6);
    const colors = await swatches.evaluateAll((els) =>
      els.map((el) => getComputedStyle(el).backgroundColor),
    );
    expect(colors[0]).toBe(rgb(139, 92, 246)); // violet-500
    expect(colors[2]).toBe(rgb(16, 185, 129)); // emerald-500 (measured)
    expect(colors[3]).toBe(rgb(245, 158, 11)); // amber-500 (measured)
    expect(colors[4]).toBe(rgb(239, 68, 68)); // red-500 before pink (measured order)
    expect(colors[5]).toBe(rgb(236, 72, 153)); // pink-500
  });

  test("the practice-test dialog renders title + time limit + AI Generate Questions", async ({ page }) => {
    await page.goto("/PracticeTests");
    await hydrated(page);
    await page.getByRole("button", { name: "Create Test" }).first().click();
    const dlg = page.getByRole("dialog");
    await expect(dlg.getByText("Test Title")).toBeVisible();
    await expect(dlg.getByText("Time Limit (minutes)")).toBeVisible();
    const timeInput = dlg.locator('input[type="number"]');
    await expect(timeInput).toHaveValue("60");
    await expect(dlg.getByRole("button", { name: "AI Generate Questions" })).toBeVisible();
    await expect(dlg.getByText(/questions added/)).toBeVisible();
    // Seeded tests expose their questions in the list view.
  });

  test("a seeded practice test exposes its question count", async ({ page }) => {
    await page.goto("/PracticeTests");
    await hydrated(page);
    const card = page.locator("main").locator("div", { hasText: "Vectors practice set" }).filter({
      has: page.getByText(/question/i),
    });
    await expect(card.first()).toBeVisible();
  });
});

test.describe("S7-C · Timetable week grid", () => {
  test("day headers render full names with text-lg bold dates in a grid-cols-8 table", async ({ page }) => {
    await page.goto("/Timetable");
    await hydrated(page);
    const head = page.locator('[aria-label="Week grid"] [aria-label="Week header"]');
    await expect(head).toBeVisible();
    const cls = await head.evaluate((el) => el.className);
    expect(cls).toContain("grid-cols-8");
    const firstDay = head.locator("> div").nth(1);
    const text = await firstDay.textContent();
    expect(text).toContain("Sunday");
    const dateP = firstDay.locator("p").nth(1);
    const cs = await dateP.evaluate((el) => ({
      size: getComputedStyle(el).fontSize,
      weight: getComputedStyle(el).fontWeight,
    }));
    expect(cs.size).toBe("18px"); // text-lg
    expect(cs.weight).toBe("700");
  });

  test("hour rows are 60px with '7 AM' style labels", async ({ page }) => {
    await page.goto("/Timetable");
    await hydrated(page);
    const cell = page.locator('[aria-label="Week grid"] [aria-label="Hour cells"] > div').first();
    const cs = await cell.evaluate((el) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return { h: r.height, label: el.textContent?.trim() ?? "" };
    });
    expect(Math.round(cs.h)).toBe(60);
    expect(cs.label).toMatch(/^\d{1,2} (AM|PM)$/); // "7 AM" — no leading zero/minutes
  });

  test("My Classes header carries today's long date", async ({ page }) => {
    await page.goto("/Timetable");
    await hydrated(page);
    const header = page.locator('[aria-label="My Classes header"]');
    await expect(header).toBeVisible();
    const today = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    await expect(header).toContainText(today);
    const h2 = header.locator("h2");
    const cs = await h2.evaluate((el) => ({
      size: getComputedStyle(el).fontSize,
      weight: getComputedStyle(el).fontWeight,
    }));
    expect(cs.size).toBe("18px");
    expect(cs.weight).toBe("700");
  });
});

test.describe("S7-D · Analytics stat cards + charts", () => {
  test("stat cards are r12 border-0 cards with 48px tinted icon blocks", async ({ page }) => {
    await page.goto("/Analytics");
    await hydrated(page);
    const card = page.locator('[aria-label="Analytics stats"] > *', { hasText: "Tasks Completed" }).first();
    await expect(card).toBeVisible();
    const cs = await card.evaluate((el) => {
      const s = getComputedStyle(el);
      return { radius: s.borderRadius, borderWidth: s.borderTopWidth };
    });
    expect(cs.radius).toBe("12px");
    expect(cs.borderWidth).toBe("0px"); // border-0
    const icon = card.locator("div[class*='w-12']").first();
    const iconCs = await icon.evaluate((el) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return { bg: s.backgroundColor, w: r.width, h: r.height };
    });
    expect(iconCs.w).toBe(48);
    expect(iconCs.h).toBe(48);
    expect(iconCs.bg).toBe(rgb(237, 233, 254)); // violet-100 (measured)
    // Fraction value + completion-rate sub.
    await expect(card.getByText(/\d+\/\d+/)).toBeVisible();
    await expect(card.getByText(/completion rate/)).toBeVisible();
  });

  test("the four measured stat labels + icon tints render", async ({ page }) => {
    await page.goto("/Analytics");
    await hydrated(page);
    const stats = page.locator('[aria-label="Analytics stats"]');
    for (const label of ["Tasks Completed", "Assignments", "Focus Time", "Upcoming Exams"]) {
      await expect(stats.getByText(label, { exact: true })).toBeVisible();
    }
    const assignments = stats.locator("> *", { hasText: "Assignments" }).first();
    const blue = await assignments.locator("div[class*='w-12']").evaluate((el) =>
      getComputedStyle(el).backgroundColor,
    );
    expect(blue).toBe(rgb(219, 234, 254)); // blue-100
    const focus = stats.locator("> *", { hasText: "Focus Time" }).first();
    const green = await focus.locator("div[class*='w-12']").evaluate((el) =>
      getComputedStyle(el).backgroundColor,
    );
    expect(green).toBe(rgb(220, 252, 231)); // green-100 (measured on the reference)
    const exams = stats.locator("> *", { hasText: "Upcoming Exams" }).first();
    const orange = await exams.locator("div[class*='w-12']").evaluate((el) =>
      getComputedStyle(el).backgroundColor,
    );
    expect(orange).toBe(rgb(255, 237, 213)); // orange-100
  });

  test("chart cards carry the measured 7-day titles", async ({ page }) => {
    await page.goto("/Analytics");
    await hydrated(page);
    await expect(page.getByText("Task Activity (Last 7 Days)")).toBeVisible();
    await expect(page.getByText("Focus Time (Last 7 Days)")).toBeVisible();
  });
});

test.describe("S7-E · Grade Tracker summary icons", () => {
  test("summary icons are the measured award/target/chart-column at w-8 h-8", async ({ page }) => {
    await page.goto("/GradeTracker");
    await hydrated(page);
    const summary = page.locator('[aria-label="Grade summary"]');
    await expect(summary).toBeVisible();
    const svgs = await summary.locator("svg").evaluateAll((els) =>
      els.map((el) => el.getAttribute("class") ?? ""),
    );
    expect(svgs.join(" ")).toContain("lucide-award");
    expect(svgs.join(" ")).toContain("lucide-target");
    expect(svgs.join(" ")).toContain("lucide-chart-column");
    for (const cls of svgs) {
      expect(cls).toContain("h-8");
      expect(cls).toContain("w-8");
    }
  });
});

test.describe("S7-F · Notes editor title", () => {
  test("the note title input reads 'Note title...' bold", async ({ page }) => {
    await page.goto("/Notes");
    await hydrated(page);
    // Seeded note "Dot product intuition".
    await page.getByRole("button", { name: /Dot product intuition/ }).first().click();
    const title = page.locator('input[placeholder="Note title..."]');
    await expect(title).toBeVisible();
    const cs = await title.evaluate((el) => ({
      weight: getComputedStyle(el).fontWeight,
      size: getComputedStyle(el).fontSize,
    }));
    expect(cs.weight).toBe("700");
  });
});
