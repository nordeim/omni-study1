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

test.describe("S7-P · Practice Tests bare empty state", () => {
  // The demo seed ships practice tests — the zero state needs a fresh
  // account (the S17 pattern: empty storageState + register/verify).
  test.use({ storageState: { cookies: [], origins: [] } });

  test("the empty state sits BARE on the canvas with the file-question icon (S7-P pin)", async ({ page }) => {
    // Reference (measured s69): the PT zero state floats directly on the
    // canvas — NO white card wrapper — and the icon block carries
    // file-question (the clone wrapped EmptyState in an sf-card and used
    // the pre-Y1 file-text glyph).
    const email = `s7p-${Date.now()}@studyflow.app`;
    const res = await page.request.post("/api/auth/register", {
      data: { email, password: "Fresh1234!", name: "S7P Probe" },
    });
    expect(res.ok(), `register failed: ${res.status()}`).toBe(true);
    const { code } = (await res.json()) as { code: string };
    await page.request.post("/api/auth/verify-email", { data: { email, code } });
    await page.goto("/PracticeTests");
    await hydrated(page);
    const title = page.getByRole("heading", { name: "No practice tests yet" });
    await expect(title).toBeVisible();
    const boxed = await title.evaluate((el) => {
      let node: Element | null = el;
      for (let i = 0; i < 6 && node; i++) {
        node = node.parentElement;
        if (!node) break;
        const cs = getComputedStyle(node);
        if (cs.borderTopWidth !== "0px" && cs.backgroundColor !== "rgba(0, 0, 0, 0)") {
          return { found: true, cls: node.className.slice(0, 120) };
        }
      }
      return { found: false, cls: "" };
    });
    expect(boxed.found).toBe(false);
    const icon = title.locator("xpath=preceding-sibling::div[1]").locator("svg");
    const cls = await icon.evaluate((el) => el.getAttribute("class") ?? "");
    expect(cls).toContain("lucide-file-question");
  });
});

// ---------------------------------------------------------------------------
// S7-AD · Batch AD (session-77) — the Notes inline editor + the Flashcards
// study mode, computed-style measured on the reference 2026-10-21 (see
// docs/remediation-plan.md Cycle 27). The ref ships a FUNCTIONAL Quill
// rich-text editor (content persisted as HTML) and an in-page study pane
// with a Wrong/Correct rating mechanic — both were missing entirely.
// ---------------------------------------------------------------------------

test.describe("S7-AD · the Notes rich-text editor (Batch AD)", () => {
  test("AD1: the Quill editor renders inside the white rounded-2xl card with the 20-control toolbar", async ({ page }) => {
    await page.goto("/Notes");
    await hydrated(page);
    await page.getByRole("button", { name: /Dot product intuition/ }).first().click();
    const editor = page.locator(".ql-editor");
    await expect(editor).toBeVisible();
    // The card: white, rounded-2xl, 1px slate-200 border (measured w:772).
    const cardCs = await editor.evaluate((el) => {
      const card = el.closest("div[class*=rounded-2xl]");
      if (!card) return null;
      const s = getComputedStyle(card);
      return { bg: s.backgroundColor, radius: s.borderRadius, border: `${s.borderTopWidth} ${s.borderTopColor}` };
    });
    expect(cardCs).toEqual({ bg: rgb(255, 255, 255), radius: "16px", border: "1px rgb(226, 232, 240)" });
    // The toolbar: the full snow set — 3 pickers + 5 format groups (measured
    // 20 controls on slate-50, pad 8px).
    const toolbar = page.locator(".ql-toolbar");
    await expect(toolbar).toBeVisible();
    const tbCs = await toolbar.evaluate((el) => {
      const s = getComputedStyle(el);
      const controls = el.querySelectorAll("button, .ql-picker-label").length;
      return { bg: s.backgroundColor, pad: s.paddingTop, controls };
    });
    expect(tbCs.bg).toBe(rgb(248, 250, 252)); // slate-50 strip
    expect(tbCs.pad).toBe("8px");
    expect(tbCs.controls).toBeGreaterThanOrEqual(20);
    // The editor body: pad 24px, 16px text (measured).
    const edCs = await editor.evaluate((el) => {
      const s = getComputedStyle(el);
      return { pad: s.padding, fontSize: s.fontSize };
    });
    expect(edCs.pad).toBe("24px");
    expect(edCs.fontSize).toBe("16px");
  });

  test("AD1 superset: the toolbar bold actually formats (rich text is functional, like the ref)", async ({ page }) => {
    await page.goto("/Notes");
    await hydrated(page);
    await page.getByRole("button", { name: /Dot product intuition/ }).first().click();
    const editor = page.locator(".ql-editor");
    await expect(editor).toBeVisible();
    await editor.click();
    await page.keyboard.type("Bold probe.");
    await page.keyboard.press("Control+a");
    await page.locator(".ql-toolbar button.ql-bold").click();
    await page.keyboard.press("Control+End");
    const hasStrong = await editor.evaluate((el) => el.querySelector("strong") !== null);
    expect(hasStrong).toBe(true);
  });

  test("AD3: the title input is 14px/700 (text-sm, measured)", async ({ page }) => {
    await page.goto("/Notes");
    await hydrated(page);
    await page.getByRole("button", { name: /Dot product intuition/ }).first().click();
    const title = page.locator('input[placeholder="Note title..."]');
    await expect(title).toBeVisible();
    const cs = await title.evaluate((el) => ({
      weight: getComputedStyle(el).fontWeight,
      size: getComputedStyle(el).fontSize,
    }));
    expect(cs.weight).toBe("700");
    expect(cs.size).toBe("14px");
  });

  test("AD5: the Font row — 'Font:' label 12px/500 slate-500 + the black Divider button", async ({ page }) => {
    await page.goto("/Notes");
    await hydrated(page);
    await page.getByRole("button", { name: /Dot product intuition/ }).first().click();
    const label = page.getByText("Font:", { exact: true });
    await expect(label).toBeVisible();
    const labelCs = await label.evaluate((el) => {
      const s = getComputedStyle(el);
      return { size: s.fontSize, weight: s.fontWeight, color: s.color };
    });
    expect(labelCs.size).toBe("12px");
    expect(labelCs.weight).toBe("500");
    expect(labelCs.color).toBe(rgb(100, 116, 139)); // slate-500
    const divider = page.getByRole("button", { name: /Divider/i });
    await expect(divider).toBeVisible();
    const dCs = await divider.evaluate((el) => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, color: s.color, radius: s.borderRadius, size: s.fontSize };
    });
    expect(dCs.bg).toBe(rgb(10, 10, 10)); // neutral-950 black button
    expect(dCs.color).toBe(rgb(250, 250, 250)); // neutral-50 text
    expect(dCs.radius).toBe("6px");
    expect(dCs.size).toBe("12px");
  });

  test("AD6: the seeded tag renders as a dark pill + the 'Add tag...' input exists", async ({ page }) => {
    await page.goto("/Notes");
    await hydrated(page);
    await page.getByRole("button", { name: /Dot product intuition/ }).first().click();
    // Seeded tag "calculus" → editor pill: neutral-800 bg + neutral-50 text,
    // radius 6px, 12px (measured on the reference).
    const pill = page.locator('[aria-label="Note tags"] span', { hasText: "calculus" });
    await expect(pill).toBeVisible();
    const cs = await pill.evaluate((el) => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, color: s.color, radius: s.borderRadius, size: s.fontSize };
    });
    expect(cs.bg).toBe(rgb(38, 38, 38)); // neutral-800
    expect(cs.color).toBe(rgb(250, 250, 250)); // neutral-50
    expect(cs.radius).toBe("6px");
    expect(cs.size).toBe("12px");
    const tagInput = page.locator('input[placeholder="Add tag..."]');
    await expect(tagInput).toBeVisible();
    const tCs = await tagInput.evaluate((el) => ({
      size: getComputedStyle(el).fontSize,
      h: Math.round(el.getBoundingClientRect().height),
    }));
    expect(tCs.size).toBe("14px");
    expect(tCs.h).toBeLessThanOrEqual(32); // measured h:28
  });

  test("AD4: the Save button is a gradient button with white text (honest deviation: no yellow quirk)", async ({ page }) => {
    await page.goto("/Notes");
    await hydrated(page);
    await page.getByRole("button", { name: /Dot product intuition/ }).first().click();
    const save = page.getByRole("button", { name: "Save", exact: true });
    await expect(save).toBeVisible();
    const cs = await save.evaluate((el) => {
      const s = getComputedStyle(el);
      return { image: s.backgroundImage, color: s.color, radius: s.borderRadius };
    });
    expect(cs.image).toContain("linear-gradient");
    expect(cs.color).toBe(rgb(255, 255, 255)); // the ref's yellow text is its platform quirk
    expect(cs.radius).toBe("6px");
  });

  test("AD7: the list row — violet-50 + 2px violet-200 selected, 16px/600 title, 12px preview, tag pill", async ({ page }) => {
    await page.goto("/Notes");
    await hydrated(page);
    const row = page.getByRole("button", { name: /Dot product intuition/ }).first();
    await row.click();
    // transition-colors races the class swap — the bg rounds clean mid-
    // flight but the border alpha exposes it (measured rgba(…,0.97) at
    // t≈150ms·0.97); settle before reading computed styles.
    await page.waitForTimeout(300);
    const cs = await row.evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        bg: s.backgroundColor,
        border: `${s.borderTopWidth} ${s.borderTopColor}`,
        radius: s.borderRadius,
        pad: s.padding,
      };
    });
    expect(cs.bg).toBe(rgb(245, 243, 255)); // violet-50
    // transition-colors races the border-transparent → violet-200 fill
    // (interpolated alpha — the family's toContain precedent, S7-A back).
    expect(cs.border).toContain("2px");
    expect(cs.border).toContain(rgb(221, 214, 254)); // violet-200
    expect(cs.radius).toBe("12px");
    expect(cs.pad).toBe("12px"); // p-3 (measured — the ref's row is tighter than the old p-4)
    const h3 = row.locator("h2").first();
    const h3Cs = await h3.evaluate((el) => {
      const s = getComputedStyle(el);
      return { size: s.fontSize, weight: s.fontWeight, color: s.color };
    });
    expect(h3Cs.size).toBe("16px");
    expect(h3Cs.weight).toBe("600");
    expect(h3Cs.color).toBe(rgb(30, 41, 59)); // slate-800
    // The ref ships an H3 here (measured) — axe flags the h1→h3 skip, so the
    // clone ships the heading-order-clean H2 with identical styling (the
    // documented a11y-win precedent).
    await expect(row.locator("h3")).toHaveCount(0);
    const preview = row.locator("p").first();
    const pCs = await preview.evaluate((el) => {
      const s = getComputedStyle(el);
      return { size: s.fontSize, color: s.color, text: (el.textContent || "").slice(0, 20) };
    });
    expect(pCs.size).toBe("12px");
    expect(pCs.color).toBe(rgb(100, 116, 139)); // slate-500
    expect(pCs.text).toBe("The dot product meas"); // HTML-stripped preview via stripHtmlPreview
    // The tag pill in the row (readable text — honest deviation from the
    // ref's invisible white-on-slate pill).
    const pill = row.locator('span[data-note-tag="calculus"]');
    await expect(pill).toBeVisible();
  });
});

test.describe("S7-AD · the Flashcards study mode rework (Batch AD)", () => {
  test("AD8/AD9: study renders IN-PAGE (no fixed overlay) with the black Exit Study + '1 / 4' counter", async ({ page }) => {
    await page.goto("/Flashcards");
    await hydrated(page);
    await page.locator('[aria-label="Deck rows"] > *', { hasText: "Integration rules" }).first().click();
    await page.locator('[aria-label="Deck detail"]').getByRole("button", { name: "Study" }).click();
    const study = page.locator('[aria-label="Study mode"]');
    await expect(study).toBeVisible();
    // IN-PAGE: the container is not a fixed overlay (measured overlayFound:false).
    const pos = await study.evaluate((el) => getComputedStyle(el).position);
    expect(pos).not.toBe("fixed");
    // Exit Study: neutral-950 bg + neutral-50 text + radius 6 (measured
    // w:137 h:36, 14px/500).
    const exit = study.getByRole("button", { name: "Exit Study" });
    await expect(exit).toBeVisible();
    const exitCs = await exit.evaluate((el) => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, color: s.color, radius: s.borderRadius, size: s.fontSize };
    });
    expect(exitCs.bg).toBe(rgb(10, 10, 10));
    expect(exitCs.color).toBe(rgb(250, 250, 250));
    expect(exitCs.radius).toBe("6px");
    expect(exitCs.size).toBe("14px");
    // Counter: "1 / 4" (spaces, no deck name), 16px/400 slate-500 (measured).
    const counter = study.getByText(/^1 \/ 4$/);
    await expect(counter).toBeVisible();
    const cCs = await counter.evaluate((el) => {
      const s = getComputedStyle(el);
      return { size: s.fontSize, weight: s.fontWeight, color: s.color };
    });
    expect(cCs.size).toBe("16px");
    expect(cCs.weight).toBe("400");
    expect(cCs.color).toBe(rgb(100, 116, 139)); // slate-500
    // The hint: "Click card to flip" 16px slate-400 (measured).
    const hint = study.getByText("Click card to flip");
    await expect(hint).toBeVisible();
    expect(await hint.evaluate((el) => getComputedStyle(el).color)).toBe(rgb(148, 163, 184));
  });

  test("AD10: the study card is max-w-2xl with 24px/500 front text and 20px/400 slate-700 back", async ({ page }) => {
    await page.goto("/Flashcards");
    await hydrated(page);
    await page.locator('[aria-label="Deck rows"] > *', { hasText: "Integration rules" }).first().click();
    await page.locator('[aria-label="Deck detail"]').getByRole("button", { name: "Study" }).click();
    const study = page.locator('[aria-label="Study mode"]');
    const flip = study.locator("[data-flip-card]");
    await expect(flip).toBeVisible();
    const w = await flip.evaluate((el) => {
      const btn = el.closest("button");
      if (!btn) return { max: "none", w: 0 };
      const s = getComputedStyle(btn);
      return { max: s.maxWidth, w: Math.round(btn.getBoundingClientRect().width) };
    });
    // max-w-2xl (measured 672px on the ref at 1440 — the 1280 e2e viewport
    // narrows the pane to ~580, so the CAP is the viewport-independent
    // assertion; the old clone shipped max-w-lg = 512).
    expect(w.max).toBe("672px");
    expect(w.w).toBeGreaterThanOrEqual(512);
    const front = flip.locator("[data-flip-front] p");
    const frontCs = await front.evaluate((el) => {
      const s = getComputedStyle(el);
      return { size: s.fontSize, weight: s.fontWeight, color: s.color };
    });
    expect(frontCs.size).toBe("24px");
    expect(frontCs.weight).toBe("500");
    expect(frontCs.color).toBe(rgb(255, 255, 255));
    await flip.click();
    const back = flip.locator("[data-flip-back] p");
    await expect(back).toBeVisible();
    const backCs = await back.evaluate((el) => {
      const s = getComputedStyle(el);
      return { size: s.fontSize, weight: s.fontWeight, color: s.color };
    });
    expect(backCs.size).toBe("20px");
    expect(backCs.weight).toBe("400");
    expect(backCs.color).toBe(rgb(51, 65, 85)); // slate-700
  });

  test("AD11: the Wrong/Correct rating — Wrong neutral-950/red-600, Correct green-500; Correct advances; no Prev/Next", async ({ page }) => {
    await page.goto("/Flashcards");
    await hydrated(page);
    await page.locator('[aria-label="Deck rows"] > *', { hasText: "Integration rules" }).first().click();
    await page.locator('[aria-label="Deck detail"]').getByRole("button", { name: "Study" }).click();
    const study = page.locator('[aria-label="Study mode"]');
    // Prev/Next are gone — the rating IS the navigation (measured: the ref
    // has no prev/next buttons).
    await expect(study.getByRole("button", { name: "Previous card" })).toHaveCount(0);
    await expect(study.getByRole("button", { name: "Next card" })).toHaveCount(0);
    // Rating buttons only after the flip (measured).
    await expect(study.getByRole("button", { name: "Wrong", exact: true })).toHaveCount(0);
    await study.locator("[data-flip-card]").click();
    const wrong = study.getByRole("button", { name: "Wrong", exact: true });
    const correct = study.getByRole("button", { name: "Correct", exact: true });
    await expect(wrong).toBeVisible();
    await expect(correct).toBeVisible();
    const wCs = await wrong.evaluate((el) => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, color: s.color, radius: s.borderRadius };
    });
    expect(wCs.bg).toBe(rgb(10, 10, 10)); // neutral-950
    expect(wCs.color).toBe(rgb(220, 38, 38)); // red-600 text (measured)
    expect(wCs.radius).toBe("6px");
    const cCs = await correct.evaluate((el) => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, color: s.color, radius: s.borderRadius };
    });
    expect(cCs.bg).toBe(rgb(34, 197, 94)); // green-500
    expect(cCs.color).toBe(rgb(255, 255, 255)); // honest deviation: no yellow quirk
    expect(cCs.radius).toBe("6px");
    // Correct advances the counter.
    await correct.click();
    await expect(study.getByText(/^2 \/ 4$/)).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// S78 · Batch AE (session-78) — the s78 code-audit hardening of the Batch AD
// surfaces: the Save empty-overwrite guard (AE1), the surfaced autosave
// failure (AE2), and the mid-study deck-switch index reset (AE4). See
// docs/remediation-plan.md Cycle 28.
// ---------------------------------------------------------------------------

test.describe("S78 · Batch AE hardening (the s78 audit)", () => {
  test("AE1: an immediate Save during the editor's load window never PATCHes empty content", async ({ page }) => {
    await page.goto("/Notes");
    await hydrated(page);

    // Capture every note PATCH's body.
    const patches: { url: string; body: string }[] = [];
    await page.route(/\/api\/notes\//, async (route) => {
      const req = route.request();
      if (req.method() === "PATCH") {
        patches.push({ url: req.url(), body: req.postData() ?? "" });
      }
      await route.continue();
    });
    // Delay every not-yet-loaded chunk — the next chunk request after the
    // note click IS the Quill dynamic import, so the editor's load window
    // becomes deterministic (~1.5s).
    await page.route(/\/static\/chunks\/.+\.js$/, async (route) => {
      await new Promise((r) => setTimeout(r, 1500));
      await route.continue();
    });

    // Select the populated note, then click Save DURING the load window
    // (before the Quill instance exists — the empty-overwrite scenario).
    await page.getByRole("button", { name: /Dot product intuition/ }).first().click();
    await page.getByRole("button", { name: "Save", exact: true }).click();

    // The Save PATCH must have fired — carrying the ORIGINAL content (the
    // `?? selected.content` fallback), never "" (the data-loss bug).
    await page.waitForTimeout(400);
    expect(patches.length).toBeGreaterThanOrEqual(1);
    const savePatch = patches[0];
    const payload = JSON.parse(savePatch.body) as { content?: string };
    expect(payload.content).toBeTruthy();
    expect(payload.content).toContain("dot product measures alignment");
    for (const p of patches) {
      const body = JSON.parse(p.body) as { content?: string };
      expect(body.content).not.toBe("");
    }

    await page.unroute(/\/api\/notes\//);
    await page.unroute(/\/static\/chunks\/.+\.js$/);
  });

  test("AE2: an aborted autosave PATCH surfaces exactly one failure toast per streak", async ({ page }) => {
    await page.goto("/Notes");
    await hydrated(page);
    await page.getByRole("button", { name: /Dot product intuition/ }).first().click();
    const editor = page.locator(".ql-editor");
    await expect(editor).toBeVisible();

    // Abort every note PATCH — the transport failure class (offline).
    await page.route(/\/api\/notes\//, async (route) => {
      if (route.request().method() === "PATCH") await route.abort("failed");
      else await route.continue();
    });

    const toasts = page.getByRole("region", { name: "Notifications" }).locator("button");
    // First burst: type → debounce (600ms) → the PATCH aborts → ONE toast.
    await editor.click();
    await page.keyboard.type("first burst");
    await page.waitForTimeout(1100);
    await expect(toasts).toHaveCount(1);
    await expect(toasts.first()).toContainText(/offline|autosave/i);

    // Second burst in the same failure streak: another debounce + abort,
    // but NO second toast (once per streak — the dedup).
    await page.keyboard.type(" more");
    await page.waitForTimeout(1100);
    await expect(toasts).toHaveCount(1);

    await page.unroute(/\/api\/notes\//);
  });

  test("AE4: switching decks mid-study resets the study counter to the new deck's card 1", async ({ page }) => {
    await page.goto("/Flashcards");
    await hydrated(page);
    // Integration rules (4 cards) → Study → flip → Correct → card 2.
    await page.locator('[aria-label="Deck rows"] > *', { hasText: "Integration rules" }).first().click();
    await page.locator('[aria-label="Deck detail"]').getByRole("button", { name: "Study" }).click();
    const study = page.locator('[aria-label="Study mode"]');
    await expect(study.getByText(/^1 \/ 4$/)).toBeVisible();
    await study.locator("[data-flip-card]").click();
    await study.getByRole("button", { name: "Correct", exact: true }).click();
    await expect(study.getByText(/^2 \/ 4$/)).toBeVisible();

    // Switch to Biology Chapter 5 (2 cards) mid-study: the sidebar stays
    // interactive (measured) and the study continues with the NEW deck from
    // card 1 — never a stale index into the wrong deck.
    await page.locator('[aria-label="Deck rows"] > *', { hasText: "Biology Chapter 5" }).first().click();
    await expect(study.getByText(/^1 \/ 2$/)).toBeVisible();
  });
});
