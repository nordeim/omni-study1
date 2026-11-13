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
  page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true");

const rgb = (r: number, g: number, b: number) => `rgb(${r}, ${g}, ${b})`;

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
  // S119/BT9 — the class-cell edit button's accessible name is exactly
  // "Edit <name>": the decorative Pencil/Trash2 glyph pair used to
  // contribute "Edit X Delete X" (a delete action that never existed — the
  // dead remove() is gone with this cycle; the reference's Timetable has
  // no delete affordance in any measured state).
  test("S119/BT9: a class cell announces its visible text + the edit action — never a delete", async ({ page }) => {
    await page.goto("/Timetable");
    await hydrated(page);
    // The seeded timetable carries classes (the demo account's seed). The
    // grid cell's accessible name comes FROM its content (Label in Name —
    // the sr-only action word rides along), and "Delete" is announced
    // NOWHERE on the Timetable anymore (the dead remove() is gone).
    const cell = page.getByRole("button", { name: /Calculus II/ }).first();
    await expect(cell).toBeVisible();
    await expect(cell).toHaveAccessibleName(/Edit class/);
    await expect(page.getByRole("button", { name: /Delete/ })).toHaveCount(0);
    // And the cell opens the edit dialog (the one real action).
    await cell.click();
    await expect(page.getByRole("dialog").getByRole("heading", { name: "Edit Class" })).toBeVisible();
  });


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
    // S178/EB: the note opens in VIEW mode — the editor chrome is the
    // edit toolbar's now (the re-anchor: the Edit switch first).
    await page.locator('[aria-label="Note editor pane"]').getByRole("button", { name: "Edit", exact: true }).click();
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
    // S178/EB: the re-anchor — the Edit switch before the editor surface.
    await page.locator('[aria-label="Note editor pane"]').getByRole("button", { name: "Edit", exact: true }).click();
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

  test("AD5: the Font row — 'Font:' label 12px/500 slate-500 + the OUTLINE Divider button (the B-8 re-anchor)", async ({ page }) => {
    await page.goto("/Notes");
    await hydrated(page);
    await page.getByRole("button", { name: /Dot product intuition/ }).first().click();
    // S178/EB: the re-anchor — the Font row is the edit toolbar's now.
    await page.locator('[aria-label="Note editor pane"]').getByRole("button", { name: "Edit", exact: true }).click();
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
    // S180/ED (B-8, measured 2026-11-13): the Divider is the shadcn OUTLINE
    // variant — the S77 "black" record was the reference's DARK-MODE
    // computed artifact; the light-mode measurement (the e2e seed's theme)
    // shows bg-card white + the outline variant's own #0a0a0a text.
    expect(dCs.bg).toBe(rgb(255, 255, 255)); // bg-card (the outline variant)
    expect(dCs.color).toBe(rgb(10, 10, 10)); // the outline variant's text-[#0a0a0a]
    expect(dCs.radius).toBe("6px");
    expect(dCs.size).toBe("12px");
  });

  test("AD6: the seeded tag renders as a dark pill + the 'Add tag...' input exists", async ({ page }) => {
    await page.goto("/Notes");
    await hydrated(page);
    await page.getByRole("button", { name: /Dot product intuition/ }).first().click();
    // S178/EB: the re-anchor — the tag row is the edit toolbar's now.
    await page.locator('[aria-label="Note editor pane"]').getByRole("button", { name: "Edit", exact: true }).click();
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
    // S178/EB: the re-anchor — the explicit Save is the edit toolbar's now.
    await page.locator('[aria-label="Note editor pane"]').getByRole("button", { name: "Edit", exact: true }).click();
    const save = page.getByRole("button", { name: "Save", exact: true });
    await expect(save).toBeVisible();
    // S178/EB: the view→edit toolbar swap reuses the trash button's DOM
    // node for the Save slot (React reconciliation) — the Button's
    // transition-colors (150 ms) rides the class swap, so the COLOR read
    // must SETTLE (toHaveCSS polls through the transition; a raw evaluate
    // caught it mid-flight and read the interpolated red→white blend).
    const cs = await save.evaluate((el) => {
      const s = getComputedStyle(el);
      return { image: s.backgroundImage, radius: s.borderRadius };
    });
    expect(cs.image).toContain("linear-gradient");
    await expect(save).toHaveCSS("color", "rgb(255, 255, 255)"); // the ref's yellow text is its platform quirk
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

// S161/DJ1 (the s161 audit B/F-1): the notes tag-mutation failure feedback.
// The S151/CZ1 rewire moved the tags onto the per-note chain but dropped
// the pre-CZ error catch — setNoteTags REJECTS to the caller by design
// (data.ts: "the CALLER still gets the real rejection"), so an
// offline/flaky PATCH discarded the rejection entirely: the draft was
// already cleared, nothing landed in the store, NO toast fired (the
// exact "input cleared, nothing happened, no reason" class S150/CY3
// fixed for these handlers' validation guards), plus an unhandled
// promise rejection. The CB8-twin network-mock shape: abort the note
// PATCH, add a tag through the real input, assert the honest failure
// toast IS visible. RED pre-fix: no toast ever fired.
test.describe("S161/DJ1 · the notes tag failure surfaces (Batch DJ)", () => {
  test("a failed tag PATCH toasts the honest failure (never the silent drop)", async ({ page }) => {
    await page.goto("/Notes");
    await hydrated(page);
    await page.getByRole("button", { name: /Dot product intuition/ }).first().click();
    // S178/EB: the re-anchor — the tag surface is the edit toolbar's now.
    await page.locator('[aria-label="Note editor pane"]').getByRole("button", { name: "Edit", exact: true }).click();
    // The tag PATCH fails (the flaky-network condition).
    await page.route("**/api/notes/*", (route) =>
      route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "Service unavailable." }) }),
    );
    const tagInput = page.locator('input[placeholder="Add tag..."]');
    await tagInput.fill("s161-dj1-probe");
    await tagInput.press("Enter");
    // The honest failure toast lands through the aria-live stack (the
    // ApiError message surfaces — a 503 body carries one).
    await expect(page.getByText("Service unavailable.")).toBeVisible({ timeout: 10_000 });
    // The draft stays cleared (the CY3 honesty: the toast explains the
    // drop; the input does not resurrect the typed tag).
    await expect(tagInput).toHaveValue("");
  });
});

// S161/DJ2 (the s161 audit B/F-2): the timetable band hand-guard. The
// S127/CB6b min/max attributes never bound the TYPED path — the form
// carries noValidate, which disables all interactive constraint
// validation on submission, so a typed 06:30 start submitted cleanly
// and the class then matched no HOURS row (7..20): it silently VANISHED
// from the desktop week grid (perceived data loss on the primary
// surface). The submit() hand-guard owns the band now. RED pre-fix: the
// dialog closed with "Class added." and the class was gone from the
// grid.
test.describe("S161/DJ2 · the timetable band hand-guard (Batch DJ)", () => {
  test("a typed out-of-band start answers the named error and never POSTs", async ({ page }) => {
    await page.goto("/Timetable");
    await hydrated(page);
    await page.getByRole("button", { name: "Add Class" }).first().click();
    await page.locator("#class-name").fill("S161-DJ2 probe");
    // TYPE the out-of-band start — page.fill bypasses the picker UI (the
    // exact surface the inert min/max never bound).
    await page.locator("#class-start").fill("06:30");
    await page.locator("#class-end").fill("07:30");
    // No POST may fire: a route probe counts the timetable writes.
    let posts = 0;
    await page.route("**/api/timetable**", (route) => {
      if (route.request().method() !== "GET") posts += 1;
      return route.continue();
    });
    // The dialog's submit is "Add class" (lowercase c — the S120/BU9
    // measured copy; exact:true discriminates it from the toolbar's
    // "Add Class" that opened the dialog).
    await page.getByRole("button", { name: "Add class", exact: true }).click();
    // The named inline error surfaces (the DA2 human copy), the dialog
    // STAYS OPEN, and the count probe reads zero writes.
    await expect(page.getByText("Classes must start between 7 AM and 8 PM.")).toBeVisible();
    await expect(page.getByRole("dialog")).toBeVisible();
    expect(posts).toBe(0);
  });
});

test.describe("S7-AD · the Flashcards study mode rework (Batch AD)", () => {
  test("AD8/AD9: study renders IN-PAGE (no fixed overlay) with the black Exit Study + '1 / 1' counter (S126/CA6 re-anchor)", async ({ page }) => {
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
    // Counter (S126/CA6 re-anchor): "1 / 1" — the seed fix moved the 3
    // mislabeled biology cards out of "Integration rules", leaving the
    // calculus deck's ONE real card. The measured SHAPE (spaces, no deck
    // name), 16px/400 slate-500, is what this pins.
    const counter = study.getByText(/^1 \/ 1$/);
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
    // S126/CA6: the advancement demo rides the 3-card Biology deck (the
    // seed fix returned the mislabeled cards — Integration rules is a
    // 1-card deck now, and a 1-card deck cannot demonstrate advancement).
    await page.locator('[aria-label="Deck rows"] > *', { hasText: "Biology Chapter 5" }).first().click();
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
    // Correct advances the counter (Biology's 3 cards: 1/3 → 2/3).
    await correct.click();
    await expect(study.getByText(/^2 \/ 3$/)).toBeVisible();
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
    // S178/EB: the note opens in VIEW — the Quill (and its dynamic
    // import) mounts on the EDIT switch, so the load window rides the
    // Edit click now; the Save clicks DURING it (the same race).
    await page.getByRole("button", { name: /Dot product intuition/ }).first().click();
    await page.locator('[aria-label="Note editor pane"]').getByRole("button", { name: "Edit", exact: true }).click();
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
    // S178/EB: the note opens in VIEW — the autosave surface is the edit
    // toolbar now (the re-anchor: the Edit switch first).
    await page.locator('[aria-label="Note editor pane"]').getByRole("button", { name: "Edit", exact: true }).click();
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

    // S79/AF3 (the s79 audit, F2): switching notes resets the streak flag
    // — note B's FIRST failure must get its own toast (the pre-fix flag
    // latched across the switch and silently swallowed B's failure).
    // S178/EB: the switch lands in VIEW — note B's Edit switch rides too.
    await page.getByRole("button", { name: /Kinetics summary/ }).first().click();
    await page.locator('[aria-label="Note editor pane"]').getByRole("button", { name: "Edit", exact: true }).click();
    const editorB = page.locator(".ql-editor");
    await expect(editorB).toBeVisible();
    await editorB.click();
    await page.keyboard.type("note b burst");
    await page.waitForTimeout(1100);
    await expect(toasts).toHaveCount(2);

    await page.unroute(/\/api\/notes\//);
  });

  // S79/AF1 REWRITE: the s78 pin assumed the deck list stays interactive
  // during study — the s79 reference re-measure showed the ref's study
  // mode REPLACES the whole view (the deck list is ABSENT during study at
  // BOTH viewports; the ref's innerText during study is exactly
  // "Exit Study N / M [card] Click card to flip"). The switch semantics
  // the old pin drove (a mid-study deck click) cannot happen on the ref's
  // UI; the index-reset contract now lives in the exit → switch → Study
  // path (startStudy always resets to card 1 of the newly selected deck).
  test("AE4/S79: during study the deck list is absent; Study after switching decks starts the new deck at card 1", async ({ page }) => {
    await page.goto("/Flashcards");
    await hydrated(page);
    // S126/CA6: the journey rides Biology (3 cards) → Spanish (2 cards) —
    // the remediated seed's honest multi-card decks (the old leg pinned
    // the mislabeled 4-card "Integration rules" + the mislabeled 2-card
    // "Biology" that actually held the Spanish cards).
    await page.locator('[aria-label="Deck rows"] > *', { hasText: "Biology Chapter 5" }).first().click();
    await page.locator('[aria-label="Deck detail"]').getByRole("button", { name: "Study" }).click();
    const study = page.locator('[aria-label="Study mode"]');
    await expect(study.getByText(/^1 \/ 3$/)).toBeVisible();
    await study.locator("[data-flip-card]").click();
    await study.getByRole("button", { name: "Correct", exact: true }).click();
    await expect(study.getByText(/^2 \/ 3$/)).toBeVisible();

    // During study the deck list is ABSENT (the ref's measured
    // full-replacement shape — the whole two-pane layout swaps out).
    await expect(page.locator('[aria-label="Deck list pane"]')).toHaveCount(0);
    await expect(page.locator('[aria-label="Deck detail"]')).toHaveCount(0);

    // Exit Study restores the two-pane layout…
    await study.getByRole("button", { name: "Exit Study" }).click();
    await expect(page.locator('[aria-label="Deck list pane"]')).toBeVisible();
    await expect(page.locator('[aria-label="Deck detail"]')).toBeVisible();

    // …and switching decks THEN studying starts the new deck from card 1
    // — never the stale 2-of-3 index into the 2-card Spanish deck.
    await page.locator('[aria-label="Deck rows"] > *', { hasText: "Spanish Vocabulary" }).first().click();
    await page.locator('[aria-label="Deck detail"]').getByRole("button", { name: "Study" }).click();
    await expect(study.getByText(/^1 \/ 2$/)).toBeVisible();
  });

  // S79/AF1 (measured on the reference at 1280×800): the study column
  // centers in the CONTENT area (not the squeezed right pane) — the Exit
  // button anchors the `w-full max-w-2xl` column's LEFT edge and the
  // counter rides the same justify-between row's RIGHT edge (the ref
  // measured Exit x=434, counter x=1070, one row, y-aligned).
  test("AF1: the study chrome centers in the content area with the Exit+counter on one justify-between row", async ({ page }) => {
    await page.goto("/Flashcards");
    await hydrated(page);
    // S126/CA6: the chrome geometry rides the 3-card Biology deck.
    await page.locator('[aria-label="Deck rows"] > *', { hasText: "Biology Chapter 5" }).first().click();
    await page.locator('[aria-label="Deck detail"]').getByRole("button", { name: "Study" }).click();
    const study = page.locator('[aria-label="Study mode"]');
    await expect(study).toBeVisible();

    // The Exit + counter share ONE row: y-aligned, counter to the RIGHT
    // of the Exit button (the ref's justify-between chrome).
    const exit = study.getByRole("button", { name: "Exit Study" });
    const counter = study.getByText(/^1 \/ 3$/);
    await expect(exit).toBeVisible();
    await expect(counter).toBeVisible();
    const exitBox = await exit.boundingBox();
    const counterBox = await counter.boundingBox();
    expect(exitBox).not.toBeNull();
    expect(counterBox).not.toBeNull();
    expect(Math.abs(exitBox!.y - counterBox!.y)).toBeLessThan(12); // one row
    expect(counterBox!.x).toBeGreaterThan(exitBox!.x + exitBox!.width); // counter right

    // The study column centers in the viewport's content area (the shell
    // sidebar owns the left 260px at 1280): the column's center ≈ the
    // content area's center (770 ± 40px tolerance for the pane padding).
    const flip = study.locator("[data-flip-card]");
    const flipBox = await flip.boundingBox();
    expect(flipBox).not.toBeNull();
    const columnCenter = flipBox!.x + flipBox!.width / 2;
    expect(Math.abs(columnCenter - 770)).toBeLessThan(40);
  });
});

// S80/AG6 (the s80 audit, M1): the AF3 streak reset races an in-flight
// autosave from the PREVIOUS note — a PATCH scheduled for note A whose
// rejection lands AFTER the user switched to note B re-latches the shared
// flag, silently swallowing note B's first autosave failure (the exact
// symptom AF3 set out to fix, resurfacing through ordering) and toasting
// a lie ("the note is still open" — A no longer is). The fix scopes the
// streak to the note: a rejection for a note the user already left is
// ignored. This pin drives the ordering with a DELAYED route (the PATCH
// is held until after the switch), which the AF3 pin could not do (it
// let note A's failure settle before switching).
test.describe("S80 · the autosave streak is scoped to the note (AG6)", () => {
  test("a late rejection from the departed note neither toasts nor swallows the next note's first failure", async ({ page }) => {
    const stamp = Date.now();
    await page.goto("/Notes");
    await hydrated(page);

    // Two fresh notes through the real flow (no seed-row dependence).
    const createNote = async (name: string) => {
      await page.getByRole("button", { name: "New note menu" }).click();
      await page.getByRole("menuitem", { name: "New Note", exact: true }).click();
      // S177/EA1 (re-anchored): the reference's inline DRAFT — no dialog;
      // the draft title input renders, the Save POSTs, the editor follows.
      const draftTitle = page.locator('input[placeholder="Note title..."]');
      await expect(draftTitle).toBeVisible();
      await draftTitle.fill(name);
      await page.getByRole("button", { name: "Save", exact: true }).click();
      // S178/EB: the created note opens in VIEW (the measured Save→view
      // contract) — the typing surfaces need the Edit switch (re-anchor).
      await page.locator('[aria-label="Note editor pane"]').getByRole("button", { name: "Edit", exact: true }).click();
      const editor = page.locator(".ql-editor");
      await expect(editor).toBeVisible();
    };
    await createNote(`AG6 alpha ${stamp}`);
    const editorA = page.locator(".ql-editor");
    await editorA.click();

    // Hold every note PATCH ~900ms before aborting — the rejection for
    // note A lands AFTER the switch to note B (the M1 ordering).
    await page.route(/\/api\/notes\//, async (route) => {
      if (route.request().method() === "PATCH") {
        await new Promise((r) => setTimeout(r, 900));
        await route.abort("failed");
      } else {
        await route.continue();
      }
    });

    // Type in A, then switch notes IMMEDIATELY (create B — the selection
    // moves and A's editor unmounts, flushing A's dirty content as the
    // in-flight PATCH). The route stays installed: it holds ONLY PATCHes;
    // the create POST rides the continue() branch.
    await page.keyboard.type("alpha content");
    await createNote(`AG6 beta ${stamp}`);

    // A's late rejection settles (~900ms) — the departed note must NOT
    // toast (pre-fix: ONE toast appears here, latching the flag). The
    // read is INSTANT (locator.count()) — a toHaveCount(0) would retry
    // past the toast's 5s auto-dismiss and pass on the dismissal (the
    // pin's first draft did exactly that and hid the M1 symptom).
    const toasts = page.getByRole("region", { name: "Notifications" }).locator("button");
    await page.waitForTimeout(1600);
    const earlyCount = await toasts.count();
    expect(earlyCount).toBe(0);

    // Note B's FIRST autosave failure must get its own toast (pre-fix:
    // the latched flag swallowed it — the count stays 0 forever).
    const editorB = page.locator(".ql-editor");
    await editorB.click();
    await page.keyboard.type("beta content");
    await page.waitForTimeout(1900);
    await expect(toasts).toHaveCount(1);
    await expect(toasts.first()).toContainText(/offline|autosave/i);

    await page.unroute(/\/api\/notes\//);
  });
});

// S80/AG9 (the s80 audit, L3 — the safe half): during study the wrapper
// div carried aria-label="Study mode" with NO role — aria-label is not
// permitted on a generic element, so it served tests, not assistive
// tech. role="region" makes the label valid and the study surface a
// navigable landmark. (The sr-only h1 option was REJECTED: it would
// change the AF1-measured innerText contract "Exit Study N / M …".)
test.describe("S80 · the study surface is a labeled region (AG9)", () => {
  test("the study-mode wrapper exposes role=region with its Study mode name", async ({ page }) => {
    await page.goto("/Flashcards");
    await hydrated(page);
    // S126/CA6: rides the 3-card Biology deck (the remediated seed).
    await page.locator('[aria-label="Deck rows"] > *', { hasText: "Biology Chapter 5" }).first().click();
    await page.locator('[aria-label="Deck detail"]').getByRole("button", { name: "Study" }).click();
    const study = page.getByRole("region", { name: "Study mode" });
    await expect(study).toBeVisible();
    await expect(study.getByText(/^1 \/ 3$/)).toBeVisible();
    await study.getByRole("button", { name: "Exit Study" }).click();
    await expect(page.locator('[aria-label="Deck list pane"]')).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// S81 · Batch AH (session-81) — the departed-settlement family. See
// docs/remediation-plan.md Cycle 31. Three defects, all verified in source:
//   AH1  removeNote never settles the selection mirror — the stale ref
//        lets a deleted note's late rejection pass the AG6 guard (toast
//        lie + flag re-latch). Fix: an effect clears the mirror when the
//        render-derived selection falls back to null.
//   AH2  saveNow guards NEITHER settle branch — a departed Save's late
//        success toasts "Note saved." onto the next note's surface AND
//        unlatches its failure streak; a departed Save's late failure
//        toasts the offline lie. Fix: capture the note id at call time
//        and gate both branches on the mirror.
//   AH6  the flashcards deck row's onKeyDown lacks a target check — Enter
//        on the options DropdownMenuTrigger bubbles to the row and
//        selects the deck while the menu opens. Fix: e.target !==
//        e.currentTarget.
//   AH4b the calculator footer structural guard (green-on-arrival).
//   AH8  the Zod4 partial-defaults data-loss family (see the AH8 block).
// ---------------------------------------------------------------------------

test.describe("S81 · the delete flow settles the selection mirror (AH1)", () => {
  test("AH1a: deleting the dirty selected note surfaces no autosave-failure lie", async ({ page }) => {
    const stamp = Date.now();
    await page.goto("/Notes");
    await hydrated(page);

    // PATCHes are held 900ms then aborted (the late rejection); every
    // other method (the create POST, the DELETE) rides continue.
    await page.route(/\/api\/notes\//, async (route) => {
      if (route.request().method() === "PATCH") {
        await new Promise((r) => setTimeout(r, 900));
        await route.abort("failed");
      } else {
        await route.continue();
      }
    });

    const createNote = async (name: string) => {
      await page.getByRole("button", { name: "New note menu" }).click();
      await page.getByRole("menuitem", { name: "New Note", exact: true }).click();
      // S177/EA1 (re-anchored): the reference's inline DRAFT — no dialog;
      // the draft title input renders, the Save POSTs, the editor follows.
      const draftTitle = page.locator('input[placeholder="Note title..."]');
      await expect(draftTitle).toBeVisible();
      await draftTitle.fill(name);
      await page.getByRole("button", { name: "Save", exact: true }).click();
      // S178/EB: the created note opens in VIEW (the measured Save→view
      // contract) — the typing surfaces need the Edit switch (re-anchor).
      await page.locator('[aria-label="Note editor pane"]').getByRole("button", { name: "Edit", exact: true }).click();
      const editor = page.locator(".ql-editor");
      await expect(editor).toBeVisible();
    };
    await createNote(`AH1 alpha ${stamp}`);
    await page.locator(".ql-editor").click();
    // The dirty window: a debounced autosave PATCH (and, on unmount, the
    // editor's final flush PATCH) will be held and rejected late.
    await page.keyboard.type("doomed content");

    // Delete the SELECTED note through the real actions surface.
    // S178/EB: the trash is the VIEW-mode affordance now — X exits edit
    // first (the pending debounced autosave rides; the editor's unmount
    // flush fires — the SAME held-and-rejected-late window), then the
    // view-mode trash deletes directly (the measured no-confirm; the
    // clone's superset aria-label — the S177 lesson-2 class).
    await page.getByRole("button", { name: "Exit edit mode" }).click();
    await page.getByRole("button", { name: "Delete note" }).click();

    // The benign "Note deleted." success toast may appear; the LIE (an
    // autosave/offline failure for a note that no longer exists) must
    // not. Read after the held rejection has landed (900ms hold + the
    // debounce margin).
    await page.waitForTimeout(1800);
    const lieToasts = await page
      .getByRole("region", { name: "Notifications" })
      .locator("button")
      .filter({ hasText: /autosave|offline|not saved|Save failed/i })
      .count();
    expect(lieToasts).toBe(0);

    await page.unroute(/\/api\/notes\//);
  });
});

test.describe("S81 · the departed-Save settlement (AH2)", () => {
  test("AH2a: a departed Save's late success neither toasts nor unlatches beta's failure streak", async ({ page }) => {
    const stamp = Date.now();
    await page.goto("/Notes");
    await hydrated(page);

    // Phase A ("hold-success"): PATCHes held 2500ms then CONTINUE — alpha's
    // Save settles AFTER the switch to beta and after beta's first
    // failure. Phase B ("abort"): PATCHes abort instantly (beta's
    // failures). The unmount-flush and autosave PATCHes are already
    // guarded (AG6); only saveNow's branches are the AH2 defect.
    let patchMode: "hold-success" | "abort" = "hold-success";
    await page.route(/\/api\/notes\//, async (route) => {
      if (route.request().method() === "PATCH") {
        if (patchMode === "hold-success") {
          await new Promise((r) => setTimeout(r, 2500));
          await route.continue();
        } else {
          await route.abort("failed");
        }
      } else {
        await route.continue();
      }
    });

    const createNote = async (name: string) => {
      await page.getByRole("button", { name: "New note menu" }).click();
      await page.getByRole("menuitem", { name: "New Note", exact: true }).click();
      // S177/EA1 (re-anchored): the reference's inline DRAFT — no dialog;
      // the draft title input renders, the Save POSTs, the editor follows.
      const draftTitle = page.locator('input[placeholder="Note title..."]');
      await expect(draftTitle).toBeVisible();
      await draftTitle.fill(name);
      await page.getByRole("button", { name: "Save", exact: true }).click();
      // S178/EB: the created note opens in VIEW (the measured Save→view
      // contract) — the typing surfaces need the Edit switch (re-anchor).
      await page.locator('[aria-label="Note editor pane"]').getByRole("button", { name: "Edit", exact: true }).click();
      const editor = page.locator(".ql-editor");
      await expect(editor).toBeVisible();
    };
    await createNote(`AH2a alpha ${stamp}`);
    await page.locator(".ql-editor").click();
    await page.keyboard.type("alpha one");

    // The explicit Save — its PATCH is held (2500ms, success).
    await page.getByRole("button", { name: "Save", exact: true }).click();

    // Alpha departs (create beta through the real dialog).
    await createNote(`AH2a beta ${stamp}`);

    // Beta's FIRST autosave failure (abort phase). The editor debounces
    // ~600ms; the abort is instant; the toast lands ~1s.
    patchMode = "abort";
    await page.locator(".ql-editor").click();
    await page.keyboard.type("beta one");
    await page.waitForTimeout(1900);

    // Alpha's held Save settles (~2500ms from the click) — pre-fix it
    // toasts "Note saved." onto beta's surface AND unlatches the streak
    // flag. Give it margin, then read BOTH counts text-filtered (the
    // offline message contains "not saved" — the success filter must be
    // the exact toast text).
    await page.waitForTimeout(1200);
    const toasts = page.getByRole("region", { name: "Notifications" }).locator("button");
    let texts = await toasts.allTextContents();
    const savedLies = texts.filter((t) => /Note saved\./.test(t)).length;
    const failures1 = texts.filter((t) => /offline|autosave|not saved|Save failed/i.test(t)).length;
    expect(savedLies).toBe(0);
    expect(failures1).toBe(1); // beta's OWN first failure

    // Dismiss the surviving toasts (explicit dismissal — the 5s
    // auto-dismiss would otherwise race the second read).
    for (let i = await toasts.count(); i > 0; i--) {
      await toasts.first().click();
      await page.waitForTimeout(150);
    }

    // Beta's SECOND autosave failure — the flag must still be latched
    // (alpha's departed success must NOT have unlatched it).
    await page.locator(".ql-editor").click();
    await page.keyboard.type("beta two");
    await page.waitForTimeout(1900);
    texts = await toasts.allTextContents();
    const failures2 = texts.filter((t) => /offline|autosave|not saved|Save failed/i.test(t)).length;
    expect(failures2).toBe(0);

    await page.unroute(/\/api\/notes\//);
  });

  test("AH2b: a departed Save's late failure is silent on beta's surface", async ({ page }) => {
    const stamp = Date.now();
    await page.goto("/Notes");
    await hydrated(page);

    // PATCHes held 2500ms then ABORTED — alpha's Save fails LATE (after
    // the switch to beta).
    await page.route(/\/api\/notes\//, async (route) => {
      if (route.request().method() === "PATCH") {
        await new Promise((r) => setTimeout(r, 2500));
        await route.abort("failed");
      } else {
        await route.continue();
      }
    });

    const createNote = async (name: string) => {
      await page.getByRole("button", { name: "New note menu" }).click();
      await page.getByRole("menuitem", { name: "New Note", exact: true }).click();
      // S177/EA1 (re-anchored): the reference's inline DRAFT — no dialog;
      // the draft title input renders, the Save POSTs, the editor follows.
      const draftTitle = page.locator('input[placeholder="Note title..."]');
      await expect(draftTitle).toBeVisible();
      await draftTitle.fill(name);
      await page.getByRole("button", { name: "Save", exact: true }).click();
      // S178/EB: the created note opens in VIEW (the measured Save→view
      // contract) — the typing surfaces need the Edit switch (re-anchor).
      await page.locator('[aria-label="Note editor pane"]').getByRole("button", { name: "Edit", exact: true }).click();
      const editor = page.locator(".ql-editor");
      await expect(editor).toBeVisible();
    };
    await createNote(`AH2b alpha ${stamp}`);
    await page.locator(".ql-editor").click();
    await page.keyboard.type("alpha one");
    await page.getByRole("button", { name: "Save", exact: true }).click();

    // Alpha departs — its Save's rejection lands on beta's surface.
    await createNote(`AH2b beta ${stamp}`);
    await page.waitForTimeout(3000);

    const texts = await page
      .getByRole("region", { name: "Notifications" })
      .locator("button")
      .allTextContents();
    const failures = texts.filter((t) => /offline|autosave|not saved|Save failed/i.test(t)).length;
    expect(failures).toBe(0);

    await page.unroute(/\/api\/notes\//);
  });
});

test.describe("S81 · the flashcards row keyboard guard (AH6)", () => {
  test("AH6: Enter on a deck row's options trigger opens the menu without selecting the deck", async ({ page }) => {
    await page.goto("/Flashcards");
    await hydrated(page);

    // Select the deck EXPLICITLY (never trust the initial fallback — the
    // AG9 pattern; S126/CA6 made the seeded deck order deterministic with
    // explicit createdAt values, but explicit selection stays the
    // robust form).
    await page.locator('[aria-label="Deck rows"] > *', { hasText: "Integration rules" }).first().click();
    const detailH2 = page.locator('[aria-label="Deck detail"] h2');
    await expect(detailH2).toHaveText("Integration rules");

    // Keyboard-activate the options trigger of a DIFFERENT row: the
    // dropdown opens (Radix handles Enter); the bubbled keydown must NOT
    // reach the row's selectDeck. (exact: true — the row's own accessible
    // name concatenates the trigger's label, so a substring match resolves
    // to both elements.)
    const trigger = page.getByRole("button", { name: "Deck options for Biology Chapter 5", exact: true });
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("menu")).toBeVisible();

    // The selection must NOT have moved.
    await expect(detailH2).toHaveText("Integration rules");

    await page.keyboard.press("Escape");
  });
});

test.describe("S81 · the calculator footer structural guard (AH4b)", () => {
  test("AH4b: the Basic footer row is Backspace + ^ + the col-span-2 gradient Equals", async ({ page }) => {
    await page.goto("/Calculator");
    await hydrated(page);

    const backspace = page.getByRole("button", { name: "Backspace" });
    await expect(backspace).toBeVisible();
    const bs = await backspace.evaluate((el) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return { bg: s.backgroundColor, border: s.borderColor, color: s.color, h: r.height };
    });
    expect(bs.bg).toBe("rgb(255, 255, 255)"); // bg-white
    expect(bs.border).toBe("rgb(226, 232, 240)"); // border-slate-200
    expect(bs.color).toBe("rgb(71, 85, 105)"); // text-slate-600
    expect(bs.h).toBe(56); // h-14

    const caret = page.getByRole("button", { name: "Insert ^" });
    await expect(caret).toBeVisible();

    // The Equals button rides the gradient inside a col-span-2 cell and
    // fills it (w-full) — the footer's structural contract. S82/AI4: the
    // original assertion here was a tautology (w ≥ 2·(w/2) − 1 reduces to
    // w ≥ w − 1); the col-span-2 fill is now pinned against the Backspace
    // SIBLING cell — a col-span-1 Equals measures ≈ one cell and fails.
    const equals = page.getByRole("button", { name: "Equals" });
    await expect(equals).toBeVisible();
    const eqBox = await equals.boundingBox();
    expect(eqBox).not.toBeNull();
    const bsBox = await backspace.boundingBox();
    expect(bsBox).not.toBeNull();
    expect(eqBox!.width).toBeGreaterThanOrEqual(2 * bsBox!.width - 2); // the col-span-2 fill vs the single-cell sibling (gap-2 tolerant)
    const eqBg = await equals.evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(eqBg).toContain("linear-gradient"); // the sf-gradient
  });
});

// ---------------------------------------------------------------------------
// S81 · AH8 — the Zod4 partial-defaults data-loss family. zod@4's
// `.partial()` does NOT suppress create-time `.default()`: every partial
// PATCH on every owned entity parsed to the FULL defaulted object, so a
// `{title}` PATCH wiped content AND tags, an autosave `{content}` PATCH
// wiped the tags, a task `{completed}` toggle wiped notes/subtasks/priority
// — invisible to every prior certification through chunk isolation + file
// order (the class proof rode the API seam). The fix lives at the factory
// (makeOwnedDelegate.update keeps only the sent keys).
// ---------------------------------------------------------------------------

test.describe("S81 · the partial-PATCH keeps what the caller did not send (AH8)", () => {
  test("AH8a: a title edit keeps the note's content AND tags", async ({ page }) => {
    await page.goto("/Notes");
    await hydrated(page);

    const row = page.getByRole("button", { name: /Dot product intuition/ }).first();
    await row.click();
    // S178/EB: the note opens in VIEW — the title is editable in the edit
    // toolbar now (the re-anchor: the Edit switch first).
    await page.locator('[aria-label="Note editor pane"]').getByRole("button", { name: "Edit", exact: true }).click();
    await expect(page.locator(".ql-editor")).toBeVisible();

    // The seeded tag pill rides the TARGET note's list row (data-note-tag —
    // never an unscoped text match: a second seeded note carries the same
    // tag and would mask the wipe).
    const rowPill = page
      .getByRole("button", { name: /Dot product intuition/ })
      .first()
      .locator('[data-note-tag="calculus"]');
    await expect(rowPill).toBeVisible();

    // Edit the title (a {title}-only PATCH through the real input).
    // S122/BW3: the PATCH is debounced (600 ms, the editor's rhythm) —
    // wait for it deterministically, never a fixed timeout.
    const titleInput = page.getByLabel("Note title");
    const patched = page.waitForResponse(
      (r) => r.request().method() === "PATCH" && /\/api\/notes\//.test(r.url()),
    );
    await titleInput.fill(`Dot product intuition ${Date.now()}`);
    await patched; // the debounced title PATCH completed

    // The content and the tags must BOTH survive (pre-fix: the PATCH's
    // parsed defaults wiped them — content "", tags "[]").
    await page.reload();
    await hydrated(page);
    await page.getByRole("button", { name: /Dot product intuition/ }).first().click();
    // S178/EB: the reload lands in VIEW — the re-open needs the Edit switch
    // for the editor-text read.
    await page.locator('[aria-label="Note editor pane"]').getByRole("button", { name: "Edit", exact: true }).click();
    const editorText = await page.locator(".ql-editor").innerText();
    expect(editorText).toContain("dot product measures alignment");
    await expect(
      page.getByRole("button", { name: /Dot product intuition/ }).first().locator('[data-note-tag="calculus"]'),
    ).toBeVisible();
  });

  test("AH8b: an autosave content PATCH keeps the note's tags", async ({ page }) => {
    await page.goto("/Notes");
    await hydrated(page);

    await page.getByRole("button", { name: /Dot product intuition/ }).first().click();
    // S178/EB: the note opens in VIEW — the autosave surface is the edit
    // toolbar now (the re-anchor: the Edit switch first).
    await page.locator('[aria-label="Note editor pane"]').getByRole("button", { name: "Edit", exact: true }).click();
    await expect(page.locator(".ql-editor")).toBeVisible();
    const rowPill = page
      .getByRole("button", { name: /Dot product intuition/ })
      .first()
      .locator('[data-note-tag="calculus"]');
    await expect(rowPill).toBeVisible();

    // Type in the editor — the debounced {content} PATCH fires.
    const editor = page.locator(".ql-editor");
    await editor.click();
    await page.keyboard.type(" appended");
    await page.waitForTimeout(1500);

    // The tag pill must survive the content PATCH (pre-fix: tags "[]").
    await page.reload();
    await hydrated(page);
    await page.getByRole("button", { name: /Dot product intuition/ }).first().click();
    // S178/EB: the reload lands in VIEW — the re-open needs the Edit switch
    // for the editor-text read.
    await page.locator('[aria-label="Note editor pane"]').getByRole("button", { name: "Edit", exact: true }).click();
    await expect(
      page.getByRole("button", { name: /Dot product intuition/ }).first().locator('[data-note-tag="calculus"]'),
    ).toBeVisible();
    const editorText = await page.locator(".ql-editor").innerText();
    expect(editorText).toContain("appended");
  });

  // S122/BW3 — the note title PATCH is debounced. The pre-fix input fired
  // updateNote on EVERY keystroke (a PATCH + a full-collection GET per
  // character, on an input controlled only by store state — interleaved
  // refetches snapped the visible text back mid-typing, and the reference
  // persists the title on Save only [measured live: zero saves during
  // 10+ s of typing]). The fix mirrors the editor's own 600 ms rhythm
  // with a local draft. This pin types character-by-character and bounds
  // the request count — the old behavior fired one PATCH per character.
  test("S122/BW3: typing a title fires at most two PATCHes — never one per keystroke", async ({ page }) => {
    await page.goto("/Notes");
    await hydrated(page);

    const row = page.getByRole("button", { name: /Dot product intuition/ }).first();
    await row.click();
    // S178/EB: the note opens in VIEW — the debounced title PATCH surface
    // is the edit toolbar's now (the re-anchor: the Edit switch first).
    await page.locator('[aria-label="Note editor pane"]').getByRole("button", { name: "Edit", exact: true }).click();
    await expect(page.locator(".ql-editor")).toBeVisible();

    const patches: string[] = [];
    page.on("request", (req) => {
      if (req.method() === "PATCH" && /\/api\/notes\//.test(req.url())) patches.push(req.url());
    });

    const titleInput = page.getByLabel("Note title");
    await titleInput.click();
    // S178/EB: the edit toolbar's title row is narrower than the old
    // always-editable editor's (the notebook select + Save + X ride the
    // same row) — a bare click's caret lands MID-STRING on the long
    // post-AH8a title and mangles every later test's row locator.
    // The deterministic form: park the caret at the END (the burst-typing
    // intent, position-independent).
    await page.keyboard.press("End");
    // 8 keystrokes at 40 ms ≈ 320 ms of typing — one continuous burst that
    // never crosses the 600 ms debounce window mid-typing.
    await titleInput.pressSequentially(" revised", { delay: 40 });
    await page.waitForTimeout(1_500); // the debounce fires + completes

    expect(patches.length, `fired ${patches.length} PATCHes`).toBeGreaterThanOrEqual(1);
    expect(patches.length, "the debounced title PATCH — never per-keystroke").toBeLessThanOrEqual(2);

    // The final title persisted (the debounced PATCH completed). AH8a ran
    // first on this same note (a Date.now() rename), so the row reads
    // "Dot product intuition <stamp> revised" — match both segments.
    await page.reload();
    await hydrated(page);
    await expect(
      page.getByRole("button", { name: /Dot product intuition.*revised/ }).first(),
    ).toBeVisible();
  });

  test("AH8c: an API task completed toggle keeps notes, priority and subtasks", async ({ page }) => {
    // The class proof at the API seam (the factory covers every owned
    // entity — one representative is the class proof).
    const stamp = Date.now();
    const create = await page.request.post("/api/tasks", {
      data: { title: `AH8c task ${stamp}`, notes: "bring the textbook", priority: "high" },
    });
    expect(create.ok()).toBeTruthy();
    const task = (await create.json()) as { id: string; notes: string; priority: string };

    // AN1-style cleanup (S88/AO2): the stamped row deletes on EVERY
    // path, not just the happy one — a RED iterate strands no rows.
    try {
      // The {completed}-only PATCH must not reset the defaulted fields. The
      // PATCH's own response IS the updated row (there is no GET item route —
      // makeItemRoutes exports PATCH + DELETE only), so the response body
      // directly proves what the update wrote.
      const patch = await page.request.patch(`/api/tasks/${task.id}`, { data: { completed: true } });
      expect(patch.ok()).toBeTruthy();
      const body = (await patch.json()) as { notes: string; priority: string; completed: boolean };
      expect(body.completed).toBe(true);
      expect(body.notes).toBe("bring the textbook");
      expect(body.priority).toBe("high");

      // And the LIST round-trip confirms the stored state (not just the
      // response echo).
      const list = await page.request.get("/api/tasks");
      expect(list.ok()).toBeTruthy();
      const rows = (await list.json()) as Array<{ id: string; notes: string; priority: string }>;
      const stored = rows.find((r) => r.id === task.id);
      expect(stored?.notes).toBe("bring the textbook");
      expect(stored?.priority).toBe("high");
    } finally {
      // Cleanup: delete the row so the suite stays idempotent.
      await page.request.delete(`/api/tasks/${task.id}`);
    }
  });
});

// S82 · Batch AI (session-82) — the sixteenth delegate. The AH8
// sent-keys filter lives ONLY in makeOwnedDelegate.update; the
// hand-written flashcardCardDelegate (Flashcard carries no userId —
// ownership rides the deck join) still writes the FULL parsed object,
// and flashcardSchema carries create-time defaults
// (difficulty:"medium", mastered:false) that zod@4's .partial()
// materializes on every partial PATCH:
//   AI1a the study-rating payload {mastered:true} silently reverts a
//        hard card's difficulty to "medium" (flashcards-view rate()).
//   AI1b the edit-dialog payload {front,back,difficulty} silently
//        un-masters a mastered card (mastered resets to false).
//   AI1c the study-mode UI round-trip — Correct on a hard card keeps
//        the card hard end-to-end (the full user path).
// ---------------------------------------------------------------------------

test.describe("S82 · the sixteenth delegate (the flashcard card partial-PATCH family)", () => {
  test("AI1a: an API mastered-toggle PATCH keeps the card's difficulty (the study-rating payload)", async ({ page }) => {
    const stamp = Date.now();
    const deckRes = await page.request.post("/api/flashcards/decks", {
      data: { name: `AI1a deck ${stamp}` },
    });
    expect(deckRes.ok()).toBeTruthy();
    const deck = (await deckRes.json()) as { id: string };
    const cardRes = await page.request.post("/api/flashcards/cards", {
      data: { deckId: deck.id, front: "AI1a front", back: "AI1a back", difficulty: "hard" },
    });
    expect(cardRes.ok()).toBeTruthy();
    const card = (await cardRes.json()) as { id: string; difficulty: string; mastered: boolean };
    expect(card.difficulty).toBe("hard");

    // AN1-style cleanup (S88/AO2): the stamped deck (and its cascaded
    // cards) deletes on EVERY path, not just the happy one.
    try {
      // The study-mode "Correct" rating sends EXACTLY {mastered:true} — a
      // partial PATCH that must not touch difficulty. Pre-fix: the delegate
      // wrote the FULL parsed object and the materialized default reset the
      // hard card to "medium". The PATCH response IS the updated row.
      const patch = await page.request.patch(`/api/flashcards/cards/${card.id}`, { data: { mastered: true } });
      expect(patch.ok()).toBeTruthy();
      const body = (await patch.json()) as { difficulty: string; mastered: boolean };
      expect(body.mastered).toBe(true);
      expect(body.difficulty).toBe("hard");

      // LIST round-trip: the stored state, not the response echo.
      const list = await page.request.get("/api/flashcards/cards");
      expect(list.ok()).toBeTruthy();
      const rows = (await list.json()) as Array<{ id: string; difficulty: string; mastered: boolean }>;
      const stored = rows.find((r) => r.id === card.id);
      expect(stored?.difficulty).toBe("hard");
      expect(stored?.mastered).toBe(true);
    } finally {
      // Cleanup: deleting the deck cascades its cards (onDelete: Cascade).
      await page.request.delete(`/api/flashcards/decks/${deck.id}`);
    }
  });

  test("AI1b: an API card-edit PATCH keeps the card's mastered flag (the edit-dialog payload)", async ({ page }) => {
    const stamp = Date.now();
    const deckRes = await page.request.post("/api/flashcards/decks", {
      data: { name: `AI1b deck ${stamp}` },
    });
    expect(deckRes.ok()).toBeTruthy();
    const deck = (await deckRes.json()) as { id: string };
    const cardRes = await page.request.post("/api/flashcards/cards", {
      data: { deckId: deck.id, front: "AI1b front", back: "AI1b back", difficulty: "easy", mastered: true },
    });
    expect(cardRes.ok()).toBeTruthy();
    const card = (await cardRes.json()) as { id: string; difficulty: string; mastered: boolean };
    expect(card.mastered).toBe(true);

    // AN1-style cleanup (S88/AO2): the stamped deck (and its cascaded
    // cards) deletes on EVERY path, not just the happy one.
    try {
      // The card-edit dialog sends {front, back, difficulty} — a partial
      // PATCH that must not touch mastered. Pre-fix: the materialized
      // default reset a mastered card to false on every edit save.
      const patch = await page.request.patch(`/api/flashcards/cards/${card.id}`, {
        data: { front: "AI1b front edited", back: "AI1b back", difficulty: "hard" },
      });
      expect(patch.ok()).toBeTruthy();
      const body = (await patch.json()) as { difficulty: string; mastered: boolean; front: string };
      expect(body.front).toBe("AI1b front edited");
      expect(body.difficulty).toBe("hard");
      expect(body.mastered).toBe(true);

      const list = await page.request.get("/api/flashcards/cards");
      expect(list.ok()).toBeTruthy();
      const rows = (await list.json()) as Array<{ id: string; difficulty: string; mastered: boolean }>;
      const stored = rows.find((r) => r.id === card.id);
      expect(stored?.difficulty).toBe("hard");
      expect(stored?.mastered).toBe(true);
    } finally {
      await page.request.delete(`/api/flashcards/decks/${deck.id}`);
    }
  });

  test("AI1c: study-mode Correct keeps a hard card hard end-to-end (the UI rating path)", async ({ page }) => {
    const stamp = Date.now();
    const deckRes = await page.request.post("/api/flashcards/decks", {
      data: { name: `AI1c deck ${stamp}` },
    });
    expect(deckRes.ok()).toBeTruthy();
    const deck = (await deckRes.json()) as { id: string };
    const cardRes = await page.request.post("/api/flashcards/cards", {
      data: { deckId: deck.id, front: "AI1c front", back: "AI1c back", difficulty: "hard" },
    });
    expect(cardRes.ok()).toBeTruthy();
    const card = (await cardRes.json()) as { id: string };

    // AN1-style cleanup (S88/AO2): the stamped deck (and its cascaded
    // cards) deletes on EVERY path, not just the happy one.
    try {
      // UI: open Flashcards, select the dedicated deck, enter study mode.
      await page.goto("/Flashcards");
      await hydrated(page);
      await page.locator('[aria-label="Deck rows"] > *', { hasText: `AI1c deck ${stamp}` }).first().click();
      await page.locator('[aria-label="Deck detail"]').getByRole("button", { name: "Study" }).click();
      const study = page.locator('[aria-label="Study mode"]');
      await expect(study).toBeVisible();

      // Rate Correct — the rating pair appears after the flip (AD11), so
      // flip the card first; the UI then sends exactly {mastered:true}.
      // Wait for the PATCH round-trip before reading the stored state.
      await study.locator("[data-flip-card]").click();
      const patchDone = page.waitForResponse(
        (r) => r.url().includes(`/api/flashcards/cards/${card.id}`) && r.request().method() === "PATCH",
      );
      await study.getByRole("button", { name: "Correct" }).click();
      const patch = await patchDone;
      expect(patch.ok()).toBeTruthy();

      // API read-back: the card is mastered AND still hard.
      const patchBody = (await patch.json()) as { difficulty: string; mastered: boolean };
      expect(patchBody.mastered).toBe(true);
      expect(patchBody.difficulty).toBe("hard");
    } finally {
      await page.request.delete(`/api/flashcards/decks/${deck.id}`);
    }
  });
});

// S88 · Batch AO (session-88) — the study-zombie structural kill. The s80
// audit's L1, deferred three cycles because the obvious fix is an effect +
// setState (the repo's lint gate forbids react-hooks/set-state-in-effect):
// mid-study external emptying of the deck's cards makes the render guard
// fall through silently while `studying` stays latched — a later refill
// auto-resurrects study mode the user never re-entered. The fix is the
// React-documented render-phase state adjustment (setState during render of
// the same component, guarded to terminate — no effect); this pin is its
// RED-first proof, driving the exact external-deletion window the s80
// auditor described.
// ---------------------------------------------------------------------------

test.describe("S88 · the study-zombie structural kill (Batch AO)", () => {
  test("AO4: the session dies with the deck's last card — a refill never resurrects study", async ({ page }) => {
    const stamp = Date.now();
    const deckRes = await page.request.post("/api/flashcards/decks", {
      data: { name: `AO4 deck ${stamp}` },
    });
    expect(deckRes.ok()).toBeTruthy();
    const deck = (await deckRes.json()) as { id: string };

    // AN1-style cleanup (S88/AO2): the stamped deck (and its cascaded cards)
    // deletes on EVERY path; the route is released in the same finally (the
    // S11/S13/S14 route-hygiene lessons — the handler never holds a route).
    // S90/AQ2: the card create rides INSIDE the try — a failed card-create
    // (the s89 audit's I1: the stamped create sat before the try, so a 4xx
    // aborted before the finally and leaked the deck into db/e2e.db) now
    // cascades through the cleanup on every path.
    try {
      const cardRes = await page.request.post("/api/flashcards/cards", {
        data: { deckId: deck.id, front: "AO4 front", back: "AO4 back", difficulty: "medium" },
      });
      expect(cardRes.ok()).toBeTruthy();
      const card = (await cardRes.json()) as { id: string };

      await page.goto("/Flashcards");
      await hydrated(page);
      await page.locator('[aria-label="Deck rows"] > *', { hasText: `AO4 deck ${stamp}` }).first().click();
      await page.locator('[aria-label="Deck detail"]').getByRole("button", { name: "Study" }).click();
      const study = page.locator('[aria-label="Study mode"]');
      await expect(study).toBeVisible();

      // The deterministic external-deletion window: rate's refresh is
      // PATCH → GET; the ARMED GET carries the deletion between its two
      // legs (delete first, then continue — the collection returns []) so
      // deckCards goes empty while the view stays mounted and studying.
      let armed = true;
      await page.route("**/api/flashcards/cards*", async (route) => {
        if (armed && route.request().method() === "GET") {
          armed = false;
          await page.request.delete(`/api/flashcards/cards/${card.id}`);
        }
        await route.continue();
      });

      // Rate Correct on the (still-existing) card — the PATCH succeeds, and
      // the refresh's GET lands AFTER the deletion.
      await study.locator("[data-flip-card]").click();
      await study.getByRole("button", { name: "Correct" }).click();

      // The empty deck's two-pane state renders — the guard's own
      // fall-through, identical pre/post-fix; this proves the store really
      // went empty mid-study (the zombie precondition).
      await expect(page.getByText("No cards in this deck")).toBeVisible();

      // The refill: a UI Add Card while the view stays mounted. Pre-fix
      // (the zombie): the latched `studying` resurrects study mode the user
      // never re-entered — the card grid NEVER returns (the RED
      // discriminator). Post-fix: the grid renders the new card and study
      // mode stays gone.
      await page.locator('[aria-label="Deck detail"]').getByRole("button", { name: "Add Card" }).first().click();
      const dlg = page.getByRole("dialog");
      await dlg.getByLabel("Front (question)").fill("AO4 refill front");
      await dlg.getByLabel("Back (answer)").fill("AO4 refill back");
      await dlg.getByRole("button", { name: "Add card" }).click();

      const grid = page.locator('[aria-label="Card grid"]');
      await expect(grid).toBeVisible();
      await expect(grid).toContainText("AO4 refill front");
      await expect(study).not.toBeVisible();
    } finally {
      await page.unroute("**/api/flashcards/cards*").catch(() => {});
      await page.request.delete(`/api/flashcards/decks/${deck.id}`);
    }
  });
});

// ---------------------------------------------------------------------------
// S89 · Batch AP (session-89) — the partial-empty zombie variant (the s88
// audit's L1, AO4's coverage gap): the unlatch condition covered ONLY the
// all-gone case (`deckCards.length === 0`), but a PARTIAL external deletion
// (`0 < deckCards.length <= studyIndex`) leaves `studyCard === undefined`
// — the study pane's render guard falls through to two-pane while
// `studying` stays latched, and a later refill (UI Add Card, AI Generate's
// N-card batch) passively resurrects study mode the user never re-entered.
// This pin drives the same rate-refresh deletion window as the AO4 pin,
// with a 2-of-3 deletion so the surviving set is non-empty while the
// advanced study index runs past it.
// ---------------------------------------------------------------------------

test.describe("S89 · the partial-empty zombie variant (Batch AP)", () => {
  test("AP1: the session dies when the study index runs past the remaining cards — a refill never resurrects study", async ({ page }) => {
    const stamp = Date.now();
    const deckRes = await page.request.post("/api/flashcards/decks", {
      data: { name: `AP1 deck ${stamp}` },
    });
    expect(deckRes.ok()).toBeTruthy();
    const deck = (await deckRes.json()) as { id: string };

    // AN1-style cleanup (the AO2 convention): the stamped deck (and its
    // cascaded cards) deletes on EVERY path; the route is released in the
    // same finally (the S11/S13/S14 route-hygiene lessons).
    // S90/AQ2: the 3-card create loop rides INSIDE the try — a failed
    // card-create (the s89 audit's I1: the stamped creates sat before the
    // try, so a 4xx aborted before the finally and leaked the deck) now
    // cascades through the cleanup on every path.
    try {
      const cardIds: string[] = [];
      for (let i = 0; i < 3; i++) {
        const cardRes = await page.request.post("/api/flashcards/cards", {
          data: { deckId: deck.id, front: `AP1 front ${i}`, back: `AP1 back ${i}`, difficulty: "medium" },
        });
        expect(cardRes.ok()).toBeTruthy();
        cardIds.push(((await cardRes.json()) as { id: string }).id);
      }

      await page.goto("/Flashcards");
      await hydrated(page);
      await page.locator('[aria-label="Deck rows"] > *', { hasText: `AP1 deck ${stamp}` }).first().click();
      await page.locator('[aria-label="Deck detail"]').getByRole("button", { name: "Study" }).click();
      const study = page.locator('[aria-label="Study mode"]');
      await expect(study).toBeVisible();

      // The deterministic PARTIAL-deletion window: rate's refresh is
      // PATCH → GET; the ARMED GET carries the 2-of-3 deletion between its
      // two legs (delete two, then continue — the collection returns the
      // ONE surviving card while studyIndex has advanced to 1, past the
      // surviving set: deckCards[1] === undefined, the partial-empty state).
      let armed = true;
      await page.route("**/api/flashcards/cards*", async (route) => {
        if (armed && route.request().method() === "GET") {
          armed = false;
          await page.request.delete(`/api/flashcards/cards/${cardIds[1]}`);
          await page.request.delete(`/api/flashcards/cards/${cardIds[2]}`);
        }
        await route.continue();
      });

      // Rate Correct on the FIRST (still-existing) card — the PATCH
      // succeeds, and the refresh's GET lands AFTER the two deletions;
      // the surviving set is [card0] while studyIndex has advanced to 1.
      await study.locator("[data-flip-card]").click();
      await study.getByRole("button", { name: "Correct" }).click();

      // The partial-empty state falls through to the two-pane (the
      // surviving card renders in the card grid) WITHOUT the deck going
      // empty — the zombie precondition: `studying` stays latched behind
      // the two-pane render (identical pre/post-fix; this proves the
      // store really went PARTIALLY empty mid-study).
      const grid = page.locator('[aria-label="Card grid"]');
      await expect(grid).toBeVisible();
      await expect(grid).toContainText("AP1 front 0");
      await expect(study).not.toBeVisible();

      // The refill: a UI Add Card while the view stays mounted. Pre-fix
      // (the partial zombie): the latched `studying` + the refilled index
      // (deckCards[1] === the NEW card) resurrects study mode the user
      // never re-entered — the card grid NEVER returns (the RED
      // discriminator, the AO4 family). Post-fix: the grid renders the
      // new card and study mode stays gone.
      await page.locator('[aria-label="Deck detail"]').getByRole("button", { name: "Add Card" }).first().click();
      const dlg = page.getByRole("dialog");
      await dlg.getByLabel("Front (question)").fill("AP1 refill front");
      await dlg.getByLabel("Back (answer)").fill("AP1 refill back");
      await dlg.getByRole("button", { name: "Add card" }).click();

      await expect(grid).toBeVisible();
      await expect(grid).toContainText("AP1 refill front");
      await expect(study).not.toBeVisible();
    } finally {
      await page.unroute("**/api/flashcards/cards*").catch(() => {});
      await page.request.delete(`/api/flashcards/decks/${deck.id}`);
    }
  });
});

// S123/BX8 — the deck-row highlight read the raw selectedDeckId while the
// detail pane falls back to effectiveDeckId (decks[0]): after deleting the
// selected deck, NO row was highlighted while decks[0]'s cards rendered.
// The highlight now reads effectiveDeckId — the fallback and the highlight
// can never disagree. Probe decks via the API (zero seeded-deck residue);
// the delete rides the real UI path (the instant delete — the reference's
// measured F5 parity).
test.describe("S123/BX8: the deck-row highlight follows the fallback selection", () => {
  test("deleting the selected deck highlights the first deck's row", async ({ page }) => {
    const stamp = Date.now();
    const mk = async (name: string) => {
      const res = await page.request.post("/api/flashcards/decks", {
        data: { name, description: "", color: "#8b5cf6", subjectId: null },
      });
      expect(res.ok()).toBe(true);
      return (await res.json()) as { id: string };
    };
    const a = await mk(`BX8-A-${stamp}`);
    const b = await mk(`BX8-B-${stamp}`);
    try {
      await page.goto("/Flashcards");
      await hydrated(page);
      const rows = page.locator('[aria-label="Deck rows"] > *');
      await expect(rows.first()).toBeVisible();
      // Select deck B (the second probe deck).
      await rows.filter({ hasText: `BX8-B-${stamp}` }).first().click();
      const selectedClass = "border-sf-primary/30";
      const rowB = rows.filter({ hasText: `BX8-B-${stamp}` }).first();
      await expect(rowB).toHaveClass(new RegExp(selectedClass.replace("/", "\\/")));
      // Delete deck B through the row's ellipsis menu (the real UI path —
      // the trigger is opacity-0 until row hover, but Playwright's action
      // visibility check passes on opacity-0; hover anyway for fidelity).
      await rowB.hover();
      await rowB
        .getByRole("button", { name: `Deck options for BX8-B-${stamp}` })
        .click();
      const menu = page.getByRole("menu");
      await expect(menu).toBeVisible();
      await menu.getByRole("menuitem", { name: "Delete" }).click();
      await page.waitForTimeout(300);
      // Post-fix: the highlight follows the fallback to decks[0] — the
      // FIRST row (a seeded deck; the probe decks were appended) carries
      // the selected styling. Pre-fix NO row was highlighted while
      // decks[0]'s cards rendered in the detail pane.
      const firstRow = rows.first();
      await expect(firstRow).toHaveClass(new RegExp(selectedClass.replace("/", "\\/")));
      // And the stale id no longer matches anything (deck B is gone).
      const rowA = rows.filter({ hasText: `BX8-A-${stamp}` }).first();
      await expect(rowA).not.toHaveClass(new RegExp(selectedClass.replace("/", "\\/")));
      await expect(rows.filter({ hasText: `BX8-B-${stamp}` })).toHaveCount(0);
    } finally {
      await page.request.delete(`/api/flashcards/decks/${b.id}`).catch(() => {});
      await page.request.delete(`/api/flashcards/decks/${a.id}`).catch(() => {});
    }
  });
});

// S125/BZ1 — the Add Card / AI Generate guards read the RENDER-DERIVED
// selection. The S123/BX8 selection model falls back to the first deck
// (effectiveDeckId) while selectedDeckId stays null until an explicit
// click — but the two action guards read the RAW selectedDeckId, so a
// user with existing decks (the first-visit state of every session:
// detail pane rendering the auto-selected deck) submitting the Add Card
// dialog or clicking AI Generate got a SILENT no-op (verified live: the
// dialog stayed open, no toast, no POST at the wire). Both guards + the
// create/generate payloads now read effectiveDeckId.
test.describe("S125/BZ1 · the Add Card dialog on the auto-selected deck", () => {
  test("BZ1: creating a card on the AUTO-SELECTED first deck works (pre-fix: the silent no-op)", async ({ page }) => {
    await page.goto("/Flashcards");
    await hydrated(page);
    // Nothing has been clicked: the render auto-selects the first seeded
    // deck (effectiveDeckId) while selectedDeckId is still null — the
    // exact state the bug needs. Derive the deck id at the wire so the
    // pin never hard-codes seed data.
    const decks = (await (await page.request.get("/api/flashcards/decks")).json()) as {
      id: string;
      name: string;
    }[];
    expect(decks.length).toBeGreaterThan(0);
    const stamp = Date.now();
    const front = `BZ1 auto-select front ${stamp}`;
    // The seed writes the three decks with same-millisecond createdAt
    // ties, so WHICH deck wins the effectiveDeckId fallback is random per
    // seed — and when the 0-card "Spanish Vocabulary" lands first, the
    // empty grid renders its OWN "Add Card" CTA beside the header's: two
    // exact-name matches. The header button is deterministically
    // DOM-first (the .first() of the strict-mode aka in the failure
    // snapshot), and both open the SAME dialog, so .first() is
    // order-agnostic.
    const addCard = page
      .getByRole("button", { name: "Add Card", exact: true })
      .first();
    await expect(addCard).toBeVisible();
    await addCard.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByLabel("Front (question)").fill(front);
    await dialog.getByLabel("Back (answer)").fill(`BZ1 back ${stamp}`);
    await dialog.getByRole("button", { name: "Add card", exact: true }).click();
    // Post-fix: the dialog closes and the card renders in the auto-selected
    // deck's grid. Pre-fix: the guard returned silently — the dialog stayed
    // open and no POST fired.
    await expect(dialog).not.toBeVisible();
    await expect(page.getByText(front)).toBeVisible();
    // Cleanup: the created card (unique front text → unique row).
    const cards = (await (await page.request.get("/api/flashcards/cards")).json()) as {
      id: string;
      front: string;
    }[];
    const mine = cards.find((c) => c.front === front);
    if (mine) await page.request.delete(`/api/flashcards/cards/${mine.id}`);
  });
});

// S127/CB6 — the timetable hour-band parity (the s127 reference battery):
// the reference's desktop week grid renders FOURTEEN hour rows — 7 AM
// through 8 PM (measured live 2026-11-02); the clone rendered twelve
// (7 AM–6 PM). The band guard (CB6b, the FE audit's M-4) rides the same
// fix: a class whose start hour falls outside the rendered band matches no
// row and silently VANISHED from the grid — the dialog's start input now
// carries the band bounds so no new class can be saved outside it.
test.describe("S127/CB6 · the timetable renders the reference's 14 hour rows", () => {
  test("the week grid renders 7 AM through 8 PM — 14 hour rows, was 12", async ({ page }) => {
    await page.goto("/Timetable");
    await hydrated(page);
    // The hour-cells container is FLAT: each hour renders one label div +
    // seven day-cell divs as direct children (12 hours × 8 = 96 pre-fix).
    // The hour ROWS are the label divs — count those.
    const labels = await page
      .locator('[aria-label="Week grid"] [aria-label="Hour cells"] > div')
      .evaluateAll((els) =>
        els
          .map((el) => el.textContent?.trim() ?? "")
          .filter((t) => /^(1?[0-9]|2[0-3]) (AM|PM)$/.test(t)),
      );
    expect(labels.length).toBe(14);
    expect(labels[0]).toBe("7 AM");
    expect(labels[13]).toBe("8 PM");
  });

  test("the Add Class dialog bounds the start time to the rendered band", async ({ page }) => {
    await page.goto("/Timetable");
    await hydrated(page);
    await page.getByRole("button", { name: "Add Class" }).first().click();
    const start = page.locator("#class-start");
    await expect(start).toBeVisible();
    // Pre-fix: no bounds — a 06:30 or 21:00 start saved fine and then
    // matched no rendered row (perceived data loss on the primary surface).
    await expect(start).toHaveAttribute("min", "07:00");
    await expect(start).toHaveAttribute("max", "20:59");
  });
});

// S127/CB13 — the analytics "avg progress" derivation (the s127 FE audit's
// M-7): the caption computed the completion RATIO (the share of
// assignments at 100%) while the label promises the average progress. The
// seeded state: 80/40/45/25/60/0 → mean 41.67 → "42% avg progress" (the
// pre-fix completion ratio rendered "0% avg progress" — 0 of 6 at 100%).
// The reference's own populated semantics are unmeasurable (its demo data
// carries no assignments — verified live 2026-11-02: its Tasks view reads
// 0 tasks, its calendar only the one Nov 12 exam), so the label-honest
// derivation ships.
test.describe("S127/CB13 · the analytics Assignments card renders the true average progress", () => {
  test("the seeded state renders the mean of progress (42%), not the completion ratio", async ({ page }) => {
    await page.goto("/Analytics");
    await hydrated(page);
    const stats = page.locator('[aria-label="Analytics stats"]');
    const assignments = stats.locator("> *", { hasText: "Assignments" }).first();
    await expect(assignments.getByText("42% avg progress")).toBeVisible();
    // The fraction stays the completion census: 0 of 6 seeded assignments
    // sit at 100%.
    await expect(assignments.getByText("0/6")).toBeVisible();
  });
});

// S130/CE2 — the True/False default answer (docs/remediation-plan-session130.md).
//
// The s130 FE audit: the question editor's True/False Select rendered
// `value={draft.correctAnswer || "True"}` — the UI SHOWED "True" selected
// while the stored draft kept correctAnswer "" — and the submit loop then
// rejected with "Question N needs a correct answer" even though the user
// saw an answer selected (the user had to re-pick True to unstick it).
// The fix seeds the stored default at the type switch (switching a draft
// TO true_false sets correctAnswer "True" — the displayed default becomes
// the stored default). The pin builds a one-question True/False test
// WITHOUT ever touching the correct-answer Select and asserts the save
// succeeds — pre-fix the toast error blocks it (RED).
test.describe("S130/CE2 · the True/False default answer", () => {
  test("a True/False question saves without touching the correct-answer select (the displayed default is the stored default)", async ({ page }) => {
    await page.goto("/PracticeTests");
    await hydrated(page);
    await page.getByRole("button", { name: "Create Test" }).first().click();
    const dlg = page.getByRole("dialog");
    await expect(dlg).toBeVisible();
    await dlg.getByLabel("Test Title").fill("CE2 True/False default probe");
    await dlg.getByLabel("Time Limit (minutes)").fill("10");
    await dlg.getByRole("button", { name: "Add question" }).click();
    // Switch the single question's type to True / False.
    await dlg.getByRole("combobox", { name: "Question 1 type" }).click();
    await page.getByRole("option", { name: "True / False" }).click();
    await dlg.getByLabel("Question 1 text").fill("The stored default matches the displayed default.");
    // Save WITHOUT touching the correct-answer Select — the displayed
    // "True" must be the stored value. (The submit button inside the
    // dialog reads "Create Test" — same name as the page's opener, so the
    // locator is dialog-scoped.)
    await dlg.getByRole("button", { name: "Create Test" }).click();
    await expect(dlg).not.toBeVisible();
    // The saved card surfaces in the list with its question count.
    await expect(page.locator("main").getByText("CE2 True/False default probe").first()).toBeVisible();
  });
});

test.describe("S142 · the notebook mover is keyboard-reachable (CQ3)", () => {
  test("the inline mover select is a named keyboard-operated combobox that moves the note", async ({ page }) => {
    // The B-M1 defect (S142): the mover Select lived inside role="menu"
    // (DropdownMenuContent) — Radix roving-focus only reaches
    // DropdownMenuItem-family elements and Tab closes the menu, so a
    // keyboard-only user could NEVER move a note to a notebook (WCAG
    // 2.1.1 Level A on a real affordance). The BZ3-pattern Popover
    // conversion fixed it then; S178/EB retires the popover entirely —
    // the mover is now the INLINE w-32 select on the edit toolbar (the
    // reference's own measured placement), a real tab stop by
    // construction. The pin re-scopes: the NAMED combobox (S143/CR3,
    // WCAG 4.1.2) + the keyboard-operated commit + the PATCH landing.
    await page.goto("/Notes");
    await hydrated(page);

    // Select a seeded note ("Essay sources" lives in Reading Journal).
    await page.getByText("Essay sources", { exact: true }).first().click();
    // S178/EB: the note opens in VIEW — the mover is the edit toolbar's
    // inline select now (the re-anchor: the Edit switch first).
    await page.locator('[aria-label="Note editor pane"]').getByRole("button", { name: "Edit", exact: true }).click();
    await expect(page.locator(".ql-editor")).toBeVisible();

    // Watch the PATCH the mover will fire.
    const patches: string[] = [];
    await page.route(/\/api\/notes\//, async (route) => {
      if (route.request().method() === "PATCH") {
        patches.push(route.request().postData() ?? "");
      }
      await route.continue();
    });

    // THE REACHABILITY PIN: the mover is a NAMED combobox (S143/CR3 —
    // the accessible name the CQ3 surface was missing for screen
    // readers, WCAG 4.1.2) sitting INLINE on the toolbar — a real tab
    // stop by construction (no menu nesting to escape, no popover to
    // open first; focus lands on it directly).
    const moverCombobox = page.getByRole("combobox", { name: "Move note to notebook" });
    await expect(moverCombobox).toBeVisible();

    // Operate it by keyboard alone: focus the trigger, ArrowDown opens
    // the listbox (the option roles render — focus rides the options
    // asynchronously), then the target option is focused directly (the
    // same DOM focus arrow-navigation produces — Radix's roving arrow
    // order varies with settle timing, probed; the deterministic form)
    // and committed with Enter. S143/CR8: the full open → focus → commit
    // path stays keyboard-driven.
    await moverCombobox.focus();
    await expect(moverCombobox).toBeFocused();
    await page.keyboard.press("ArrowDown");
    const target = page.getByRole("option", { name: "Lecture Notes" });
    await expect(target).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(() => document.activeElement?.getAttribute("role") ?? ""),
      )
      .toBe("option");
    await target.focus();
    await expect
      .poll(() =>
        page.evaluate(
          () => document.activeElement?.textContent?.trim().slice(0, 20) ?? "",
        ),
      )
      .toBe("Lecture Notes");
    await page.keyboard.press("Enter");

    // The wire contract: the keyboard commit fired the notebookId PATCH.
    await expect
      .poll(() => patches.length)
      .toBeGreaterThanOrEqual(1);
    expect(patches.join("|")).toContain("notebookId");

    await page.unroute(/\/api\/notes\//);
  });
});

// S166/DP3 — the notes search matches the RENDERED text, never the markup
// (the s166 audit B/L-2). The filtered memo matched n.content (the raw
// Quill-persisted HTML) while the row preview renders
// stripHtmlPreview(content) — so a query like "strong" (or the single
// letter "p", inside every <p> wrapper) false-matched EVERY formatted
// note while the visible text showed no such word. The reference's own
// search was measured THIS cycle (the residue-zero probe,
// scripts/ref-notes-search-semantics-s166.mjs): it is TITLE-ONLY — the
// clone's title+content search is the kept SUPERSET, and this leg pins
// the superset's own consistency: the content leg matches what the
// preview SHOWS. The formatted probe note is planted through the real
// API (strong is in the CO1 allowlist, src/lib/note-html.ts) and
// deleted in the finally (the CC4/AR3 zero-residue convention).
test.describe("S166/DP3 · the notes search matches the rendered text, not the HTML source", () => {
  test("a tag-name query never matches; the visible word always does", async ({ page }) => {
    await page.goto("/Notes");
    await hydrated(page);
    // The settled proof: a seeded row renders before the probe plants.
    await expect(page.getByRole("button", { name: /Dot product intuition/ }).first()).toBeVisible();

    const res = await page.request.post("/api/notes", {
      data: {
        title: "S166 DP3 probe",
        content: "<p>xylophone <strong>quartz</strong> bridge</p>",
        tags: "[]",
        notebookId: "",
        subjectId: "",
      },
    });
    expect(res.ok(), `plant failed: ${res.status()}`).toBe(true);
    const { id } = (await res.json()) as { id: string };
    const row = page.getByRole("button", { name: /S166 DP3 probe/ });
    try {
      // The store refetches on view entry — reload to pick up the
      // planted row (the direct API write bypasses the client store).
      await page.reload();
      await hydrated(page);
      await expect(page.getByRole("button", { name: /Dot product intuition/ }).first()).toBeVisible();
      await expect(row).toBeVisible({ timeout: 10_000 });

      const search = page.getByLabel("Search notes");
      // The TAG NAME is not in the rendered text — the row must NOT
      // match. RED pre-fix: the raw-HTML search matched "strong".
      await search.fill("strong");
      await expect(row).toHaveCount(0);

      // The rendered word IS in the text — the row MUST match (the
      // superset's content-search contract, on the stripped form).
      await search.fill("xylophone");
      await expect(row).toBeVisible();

      // And the title leg is untouched.
      await search.fill("DP3 probe");
      await expect(row).toBeVisible();
    } finally {
      await page.request.delete(`/api/notes/${id}`);
    }
  });
});

// ---------------------------------------------------------------------------
// S171/DU2 — the studygroups create-dialog parity catch-up + the
// description port (the s171 audit B/L-1 + I-1). Measured live at the
// s171 gated write-path probe (one throwaway row created, captured,
// DELETEd — zero residue verified): the reference's create dialog reads
// title "Create Study Group", a name INPUT (placeholder "e.g., Math
// Study Squad"), a description TEXTAREA (placeholder "What's this group
// about?"), the six swatches (the clone's GROUP_COLORS already match
// exactly), and the footer's DOM order submit-then-secondary ("Create
// Group" then "Close"). The clone's copy was scaffold-era (git -S
// provenance: the "New Study Group" title + "e.g. Calculus cram crew"
// placeholder date from the initial 7b1e78d implementation and were
// never re-measured) and the family carried NO description field
// end-to-end. The description ports bounded at 500 (the deck family's
// 1_000-char description the precedent; the bounded-everything posture)
// with the clone's visible-Label superset over the reference's
// placeholder-only inputs. The reference's own create→list flow is
// BROKEN (the POST commits, the list GET returns [] — measured), so the
// round-trip leg pins the CLONE's working surface (the documented
// superset posture).
// ---------------------------------------------------------------------------
test.describe("S171/DU2 · the studygroups create-dialog parity catch-up + the description round-trip", () => {
  test("the create dialog carries the reference's measured title, placeholders, and footer", async ({ page }) => {
    await page.goto("/StudyGroups");
    await hydrated(page);
    await page.getByRole("button", { name: "Create study group" }).click();
    const dlg = page.getByRole("dialog");
    await expect(dlg).toBeVisible();
    // The measured title (RED pre-fix: the scaffold-era "New Study
    // Group").
    await expect(dlg.getByRole("heading", { name: "Create Study Group" })).toBeVisible();
    // The measured name placeholder (S176/DZ2 re-measured the label —
    // "Group Name \*" now, the scaffold-era "Name" retired).
    await expect(dlg.getByLabel("Group Name *")).toHaveAttribute("placeholder", "e.g., Math Study Squad");
    // The measured description textarea (the clone's visible-Label
    // superset over the reference's placeholder-only input).
    const description = dlg.getByLabel("Description");
    await expect(description).toHaveAttribute("placeholder", "What's this group about?");
    await expect(description).toBeVisible();
    // The measured footer: submit "Create Group" + secondary "Close".
    // The secondary is scoped to the FORM — the clone's shared shadcn
    // dialog chrome adds a top-right X whose sr-only name is also
    // "Close" (the documented superset; the reference carries no X —
    // its measured dialog has ONE Close, the footer text button).
    const submit = dlg.getByRole("button", { name: "Create Group", exact: true });
    const close = dlg.locator("form").getByRole("button", { name: "Close", exact: true });
    await expect(submit).toBeVisible();
    await expect(close).toBeVisible();
    // The measured DOM ORDER: the submit renders BEFORE the secondary
    // (both scoped to the form's footer).
    const order = await dlg
      .locator("form")
      .getByRole("button")
      .evaluateAll((els) =>
        els
          .map((el, i) => ({ i, text: (el.textContent ?? "").trim() }))
          .filter((b) => b.text === "Create Group" || b.text === "Close"),
      );
    expect(order.map((b) => b.text)).toEqual(["Create Group", "Close"]);
  });

  test("a description entered in the create dialog survives the round-trip into the detail pane", async ({ page }) => {
    const stamp = `s171-du2-${Date.now()}`;
    await page.goto("/StudyGroups");
    await hydrated(page);
    await page.getByRole("button", { name: "Create study group" }).click();
    const dlg = page.getByRole("dialog");
    await expect(dlg).toBeVisible();
    await dlg.getByLabel("Group Name *").fill(`S171-DU2 description probe ${stamp}`);
    await dlg.getByLabel("Description").fill("We drill problem sets every Tuesday before the bus leaves.");
    const saved = page.waitForResponse(
      (r) => r.request().method() === "POST" && r.url().includes("/api/study-groups"),
    );
    await dlg.getByRole("button", { name: "Create Group", exact: true }).click();
    const res = await saved;
    expect(res.ok()).toBe(true);
    const createdId = ((await res.json()) as { id: string }).id;
    try {
      // The success toast + the closed dialog (the create resolved).
      await expect(page.getByText("Study group created")).toBeVisible({ timeout: 10_000 });
      await expect(dlg).toBeHidden();
      // Select the new group — the detail pane renders the description.
      await page.getByRole("button", { name: new RegExp(`S171-DU2 description probe ${stamp}`) }).first().click();
      const detail = page.locator('[aria-label="Study group detail pane"]');
      await expect(detail.getByText("We drill problem sets every Tuesday before the bus leaves.")).toBeVisible();
    } finally {
      // Zero residue on the shared demo user (the CC4/AR3 convention).
      await page.request.delete(`/api/study-groups/${createdId}`);
    }
  });
});

// S172/DV2 — the practiceTests create-dialog parity catch-up (the s172
// audit B/L-1). Measured live at the s172 gated write-path probe (TWO
// throwaway rows created through the real dialog, captured, DELETEd —
// zero residue verified after each): the reference's create dialog reads
// title "Create Practice Test" (an H2), a title INPUT with label
// "Test Title *" (the required asterisk) and placeholder "e.g., Biology
// Chapter 5 Review", a "N questions added" counter (the clone's
// "{n} questions added" already matches exactly), and the footer's DOM
// order submit-then-secondary ("Create Test" then "Close"). The clone's
// copy was scaffold-era (git -S provenance: the "Create Test" title +
// "e.g. Algebra Chapter 4 Quiz" placeholder date from the initial
// 7b1e78d implementation and were never re-measured) and the footer was
// Cancel-BEFORE-submit. The reference carries NO manual add-question
// affordance, NO subject picker, and NO edit affordance at all (the card
// menu measured Delete-only twice) — the clone's manual editor + Subject
// select + Edit leg are the documented supersets and stay. The submit
// stays "Create Test" on both hosts — identical pre-fix and post-fix.
// ---------------------------------------------------------------------------
test.describe("S172/DV2 · the practiceTests create-dialog parity catch-up", () => {
  test("the create dialog carries the reference's measured title, label, placeholder, and footer", async ({ page }) => {
    await page.goto("/PracticeTests");
    await hydrated(page);
    await page.getByRole("button", { name: "Create Test" }).first().click();
    const dlg = page.getByRole("dialog");
    await expect(dlg).toBeVisible();
    // The measured title (RED pre-fix: the scaffold-era "Create Test").
    await expect(dlg.getByRole("heading", { name: "Create Practice Test" })).toBeVisible();
    // The measured label — the required asterisk included (exact).
    await expect(dlg.getByText("Test Title *", { exact: true })).toBeVisible();
    // The measured title placeholder.
    await expect(dlg.locator("#test-title")).toHaveAttribute(
      "placeholder",
      "e.g., Biology Chapter 5 Review",
    );
    // The measured footer: submit "Create Test" + secondary "Close".
    // The secondary is scoped to the FORM — the clone's shared shadcn
    // dialog chrome adds a top-right X whose sr-only name is also
    // "Close" (the documented superset; the reference carries no X —
    // its measured dialog has ONE Close, the footer text button).
    const submit = dlg.getByRole("button", { name: "Create Test", exact: true });
    const close = dlg.locator("form").getByRole("button", { name: "Close", exact: true });
    await expect(submit).toBeVisible();
    await expect(close).toBeVisible();
    // The measured DOM ORDER: the submit renders BEFORE the secondary
    // (both scoped to the form's footer).
    const order = await dlg
      .locator("form")
      .getByRole("button")
      .evaluateAll((els) =>
        els
          .map((el, i) => ({ i, text: (el.textContent ?? "").trim() }))
          .filter((b) => b.text === "Create Test" || b.text === "Close"),
      );
    expect(order.map((b) => b.text)).toEqual(["Create Test", "Close"]);
  });
});

// S173/DW2 — the grades create-dialog parity catch-up + the type/date
// field port (the s173 audit B/L-1). Measured live at the s173 gated
// write-path probe (TWO throwaway grade rows created through the real
// dialog — one without a subject, one with a throwaway "Probe Math"
// subject created through the reference's own Settings → Subjects
// surface — captured, DELETEd via the entity API, zero residue verified
// after each): the reference's create dialog reads title "Add New Grade"
// (an H2), a SUBJECT select FIRST, a TYPE select defaulting "Homework"
// with the six measured options (Homework / Quiz / Test / Midterm /
// Final / Project), placeholder-labeled number inputs "Score" (required)
// / "Max Score" (required) / "Weight (optional, default 1)", a NATIVE
// date input defaulting to today, and the footer's DOM order
// Cancel-then-submit ([Cancel][Add Grade]). The clone's copy was
// scaffold-era (git -S provenance: the "Add Grade" title + "e.g.
// Midterm exam" placeholder date from the initial 7b1e78d implementation
// and were never re-measured) and its Grade model could record NEITHER
// the reference's type NOR its date. The port: the GRADE_TYPES
// vocabulary + the `type`/`date` columns (schema + validation + row +
// dialog + seed + the import vocabulary — the S171/DU2b description-port
// precedent). The reference's surface carries NO title field, NO edit
// affordance, and NO delete affordance (measured: the "Add Grade" opener
// is the ONLY interactive element in main; the grade pills are read-only
// spans) — the clone's Title input + Edit icon + AlertDialog confirm are
// the documented supersets and stay. The visible-Label pattern is the
// clone's a11y superset (the S172/DV2 adjudication-7 precedent) — the
// label COPY ports ("Max Score", "Weight (optional, default 1)").
// The submit stays "Add Grade" on both hosts — identical pre-fix and
// post-fix.
// ---------------------------------------------------------------------------
test.describe("S173/DW2 · the grades create-dialog parity catch-up + the type/date field port", () => {
  test("the create dialog carries the reference's measured title, labels, type select, date input, and footer", async ({ page }) => {
    await page.goto("/GradeTracker");
    await hydrated(page);
    await page.getByRole("button", { name: "Add Grade" }).first().click();
    const dlg = page.getByRole("dialog");
    await expect(dlg).toBeVisible();
    // The measured title (RED pre-fix: the scaffold-era "Add Grade").
    await expect(dlg.getByRole("heading", { name: "Add New Grade" })).toBeVisible();
    // The measured label copy — the capital-S "Max Score" and the
    // "(optional, default 1)" weight hint (exact).
    await expect(dlg.getByText("Max Score", { exact: true })).toBeVisible();
    await expect(dlg.getByText("Weight (optional, default 1)", { exact: true })).toBeVisible();
    // The measured TYPE select: the trigger renders the "homework" default
    // capitalized — the GRADE_TYPES single source's lowercase value with
    // the exams-view `capitalize` idiom (the CSS transform owns the visual
    // "Homework"; the DOM text carries the schema value).
    await expect(dlg.locator("#grade-type")).toHaveText(/homework/);
    await expect(dlg.locator("#grade-type")).toHaveClass(/capitalize/);
    // The measured NATIVE date input (type="date"), defaulting to today.
    const dateInput = dlg.locator("#grade-date");
    await expect(dateInput).toHaveAttribute("type", "date");
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    await expect(dateInput).toHaveValue(`${yyyy}-${mm}-${dd}`);
    // The measured footer: [Cancel][Add Grade] — the secondary renders
    // BEFORE the submit (both scoped to the form's footer).
    const submit = dlg.getByRole("button", { name: "Add Grade", exact: true });
    const cancel = dlg.locator("form").getByRole("button", { name: "Cancel", exact: true });
    await expect(submit).toBeVisible();
    await expect(cancel).toBeVisible();
    const order = await dlg
      .locator("form")
      .getByRole("button")
      .evaluateAll((els) =>
        els
          .map((el, i) => ({ i, text: (el.textContent ?? "").trim() }))
          .filter((b) => b.text === "Add Grade" || b.text === "Cancel"),
      );
    expect(order.map((b) => b.text)).toEqual(["Cancel", "Add Grade"]);
  });
});

// S174/DX4 — the holidays create-dialog parity catch-up + the
// start/end/type field port (the s174 audit B/L-3). Measured live at the
// s174 gated probe (the reference's Add Holiday dialog opened on a fresh
// account: title "Add Holiday" (an H2), "Name *" (placeholder "e.g.,
// Winter Break"), "Start Date *" + "End Date *" (both native date
// inputs, required, NO defaults — the pristine dialog measured empty),
// "Type" (a three-option selector: Holiday / Break / No School; the
// default reads "Holiday"), and the footer's DOM order
// Cancel-then-submit ([Cancel][Add Holiday])). The clone's dialog was
// scaffold-era (label "Name" + placeholder "e.g. Spring break" + a
// SINGLE "Date" field + no Type selector). The port: the HOLIDAY_TYPES
// vocabulary + the `endDate`/`type` columns (schema + validation + row +
// dialog + list render + seed + the import vocabulary — the S173/DW2
// field-port precedent). The reference's own create flow is BROKEN (the
// entity POST answers 403 "Permission denied for create operation on
// Holiday entity" — reproduced through the real dialog AND directly
// against the entity API with the page's own Bearer token) — the
// reference's list could not be measured; the dialog's FIELD SET is the
// port authority and the clone's create flow keeps working (the
// functional superset). The visible-Label pattern is the clone's a11y
// superset (the S172/DV2 adjudication-7 precedent) — the label COPY
// ports ("Name *", "Start Date *", "End Date *", "Type"). The submit
// stays "Add Holiday" on both hosts — identical pre-fix and post-fix.
// ---------------------------------------------------------------------------
test.describe("S174/DX4 · the holidays create-dialog parity catch-up + the start/end/type field port", () => {
  test("the create dialog carries the reference's measured labels, range fields, type selector, and footer", async ({ page }) => {
    await page.goto("/Settings");
    await hydrated(page);
    await page.getByRole("tab", { name: "Holidays" }).click();
    await expect(page.getByRole("heading", { name: "Holidays & Breaks" })).toBeVisible();
    await page.getByRole("button", { name: "Add Holiday" }).first().click();
    const dlg = page.getByRole("dialog");
    await expect(dlg).toBeVisible();
    // The measured label copy (RED pre-fix: the scaffold-era "Name"
    // without the asterisk + the placeholder "e.g. Spring break").
    await expect(dlg.getByText("Name *", { exact: true })).toBeVisible();
    await expect(dlg.locator("#holiday-name")).toHaveAttribute("placeholder", "e.g., Winter Break");
    // The measured RANGE fields — both native date inputs, required,
    // with NO defaults (the pristine measurement: both empty).
    const start = dlg.locator("#holiday-start");
    const end = dlg.locator("#holiday-end");
    await expect(start).toHaveAttribute("type", "date");
    await expect(end).toHaveAttribute("type", "date");
    await expect(start).toHaveValue("");
    await expect(end).toHaveValue("");
    await expect(dlg.getByText("Start Date *", { exact: true })).toBeVisible();
    await expect(dlg.getByText("End Date *", { exact: true })).toBeVisible();
    // The measured TYPE selector: three buttons in the measured order
    // with "Holiday" active by default (the aria-pressed idiom).
    await expect(dlg.getByText("Type", { exact: true })).toBeVisible();
    const typeButtons = dlg.getByRole("button", { name: /^(Holiday|Break|No School)$/ });
    await expect(typeButtons).toHaveCount(3);
    await expect(typeButtons.nth(0)).toHaveAttribute("aria-pressed", "true");
    await expect(typeButtons.nth(1)).toHaveAttribute("aria-pressed", "false");
    await expect(typeButtons.nth(2)).toHaveAttribute("aria-pressed", "false");
    // The measured footer: [Cancel][Add Holiday] — the secondary renders
    // BEFORE the submit (both scoped to the form's footer).
    const submit = dlg.getByRole("button", { name: "Add Holiday", exact: true });
    const cancel = dlg.locator("form").getByRole("button", { name: "Cancel", exact: true });
    await expect(submit).toBeVisible();
    await expect(cancel).toBeVisible();
    const order = await dlg
      .locator("form")
      .getByRole("button")
      .evaluateAll((els) =>
        els
          .map((el, i) => ({ i, text: (el.textContent ?? "").trim() }))
          .filter((b) => b.text === "Add Holiday" || b.text === "Cancel"),
      );
    expect(order.map((b) => b.text)).toEqual(["Cancel", "Add Holiday"]);
  });
});

// S175/DY1 — the subject-dialog parity catch-up + the teacher/room field
// port (the s175 audit B/M-1). Measured live at the s175 reference probe
// (the reference's Add Subject dialog opened on the seeded account: the
// asterisked "Subject Name *" label + the "e.g., Mathematics" placeholder;
// the "Color" field over a SEVENTEEN-swatch palette at 32px/rounded-lg —
// the Tailwind v3 500-ramp order red #ef4444 → … → rose #f43f5e, the
// violet #8b5cf6 pristine default at index 12 carrying the white-ring +
// scale(1.1) selection state; the "Teacher (optional)" field + the
// "e.g., Mr. Smith" placeholder; the "Room (optional)" field + the
// "e.g., Room 101" placeholder; the footer [Cancel][Add Subject]). The
// clone's dialog was s169-era (label "Name" + placeholder "e.g. Biology" +
// 8-color scaffold palette at 28px rounded-full + no teacher/room). The
// port: the `teacher`/`room` columns (schema + validation + row + the
// row's teacher/room metadata render + seed — the S174/DX4 field-port
// precedent). The reference's write path WORKS this time (the probe
// exercised create → row render → delete live, zero residue — the H3
// name 16px/600 + teacher 14px slate-500 + room 12px slate-400), so both
// the FIELD SET and the ROW RENDER are measured authorities. The clone's
// aria-pressed swatches + aria-labels + the Custom color input + the
// labeled-controls a11y surface STAY (the documented superset — the
// S172/DV2 adjudication-7 precedent); the swatch GEOMETRY ports (the
// fresh s175 measurement supersedes the s169-era guess — the DX2
// icon-drift precedent).
// ---------------------------------------------------------------------------
test.describe("S175/DY1 · the subject create-dialog parity catch-up + the teacher/room field port", () => {
  test("the create dialog carries the reference's measured labels, 17-swatch palette, teacher/room fields, and footer", async ({ page }) => {
    await page.goto("/Settings");
    await hydrated(page);
    await page.getByRole("tab", { name: "Subjects" }).click();
    await expect(page.getByRole("heading", { name: "Subjects" })).toBeVisible();
    await page.getByRole("button", { name: "Add Subject" }).first().click();
    const dlg = page.getByRole("dialog");
    await expect(dlg).toBeVisible();
    // The measured label copy (RED pre-fix: the s169-era "Name" without
    // the asterisk).
    await expect(dlg.getByText("Subject Name *", { exact: true })).toBeVisible();
    await expect(dlg.locator("#subject-name")).toHaveAttribute("placeholder", "e.g., Mathematics");
    // The measured TEACHER + ROOM fields — both optional, both absent
    // pre-fix (RED at the label assertions).
    await expect(dlg.getByText("Teacher (optional)", { exact: true })).toBeVisible();
    await expect(dlg.locator("#subject-teacher")).toHaveAttribute("placeholder", "e.g., Mr. Smith");
    await expect(dlg.getByText("Room (optional)", { exact: true })).toBeVisible();
    await expect(dlg.locator("#subject-room")).toHaveAttribute("placeholder", "e.g., Room 101");
    // The measured palette: SEVENTEEN swatches (RED pre-fix: the
    // 8-color scaffold set renders).
    const swatches = dlg.locator("button[aria-label^='Color #']");
    await expect(swatches).toHaveCount(17);
    // The measured pristine default: violet #8b5cf6 pressed (the s175
    // probe measured the index-12 swatch selected on a fresh open).
    const pressed = dlg.locator("button[aria-label^='Color #'][aria-pressed='true']");
    await expect(pressed).toHaveCount(1);
    await expect(pressed.first()).toHaveAttribute("aria-label", "Color #8b5cf6");
    // The measured swatch geometry: 32px rounded-lg (the s175 probe's
    // computed width/radius — the s169-era 28px rounded-full was the
    // scaffold guess).
    const box = await swatches.first().boundingBox();
    expect(box?.width).toBe(32);
    await expect(swatches.first()).toHaveCSS("border-radius", "8px");
    // The measured footer: [Cancel][Add Subject] — the secondary renders
    // BEFORE the submit (both scoped to the form's footer).
    const submit = dlg.getByRole("button", { name: "Add Subject", exact: true });
    const cancel = dlg.locator("form").getByRole("button", { name: "Cancel", exact: true });
    await expect(submit).toBeVisible();
    await expect(cancel).toBeVisible();
    const order = await dlg
      .locator("form")
      .getByRole("button")
      .evaluateAll((els) =>
        els
          .map((el) => ({ text: (el.textContent ?? "").trim() }))
          .filter((b) => b.text === "Add Subject" || b.text === "Cancel"),
      );
    expect(order.map((b) => b.text)).toEqual(["Cancel", "Add Subject"]);
  });
});

// S175/DY4 — the gradetracker/settings-CRUD + AlertDialog-confirm e2e legs
// (the recorded coverage gap since the S168-era ledger). Four legs, each
// owning its data (the unique-stamp doctrine) and leaving zero residue
// (the delete-through-the-UI cleanup). DY4a/DY4b (the grade edit + delete
// journeys) and DY4d (the subject delete + the SetNull-consequences
// confirm) are green-on-arrival coverage — the behavior works, the gap is
// the missing spec; DY4c additionally exercises the DY1 port's round-trip
// (create-with-fields → row metadata → edit → update) — the same
// round-trip the reference probe exercised live, now pinned on the clone.
// ---------------------------------------------------------------------------
const dyStamp = () => `DY Probe ${Date.now()}-${Math.floor(Math.random() * 1000)}`;

test.describe("S175/DY4 · the gradetracker/settings-CRUD + AlertDialog-confirm journeys", () => {
  test("DY4a: a created grade edits through the dialog and the updated row + toast render", async ({ page }) => {
    await page.goto("/GradeTracker");
    await hydrated(page);
    await expect(page.getByRole("heading", { name: "Grade Tracker" })).toBeVisible();
    // Create the owned row (the unique stamp — the spec owns its data).
    const title = dyStamp();
    await page.getByRole("button", { name: "Add Grade" }).first().click();
    const dlg = page.getByRole("dialog");
    await dlg.locator("#grade-title").fill(title);
    await dlg.locator("#grade-score").fill("80");
    await dlg.locator("#grade-max").fill("100");
    await dlg.getByRole("button", { name: "Add Grade", exact: true }).click();
    await expect(dlg).toHaveCount(0);
    const row = page.locator("div.group", { hasText: title });
    await expect(row).toBeVisible();
    // The edit journey: the hover-revealed Edit button opens the dialog
    // seeded with the row's values; a score change lands the toast + the
    // updated badge.
    await row.getByRole("button", { name: `Edit ${title}` }).click();
    await expect(dlg.getByRole("heading", { name: "Edit Grade" })).toBeVisible();
    await expect(dlg.locator("#grade-title")).toHaveValue(title);
    await dlg.locator("#grade-score").fill("95");
    await dlg.getByRole("button", { name: "Save changes" }).click();
    await expect(dlg).toHaveCount(0);
    await expect(page.getByText("Grade updated")).toBeVisible();
    await expect(page.locator("div.group", { hasText: title }).first()).toContainText("95/100");
    // Zero residue: the edit leg's row is DY4b's input; deleted there.
  });

  test("DY4b: the grade delete journey confirms through the AlertDialog and the row is gone", async ({ page }) => {
    await page.goto("/GradeTracker");
    await hydrated(page);
    await expect(page.getByRole("heading", { name: "Grade Tracker" })).toBeVisible();
    const title = dyStamp();
    await page.getByRole("button", { name: "Add Grade" }).first().click();
    const dlg = page.getByRole("dialog");
    await dlg.locator("#grade-title").fill(title);
    await dlg.locator("#grade-score").fill("50");
    await dlg.locator("#grade-max").fill("100");
    await dlg.getByRole("button", { name: "Add Grade", exact: true }).click();
    await expect(dlg).toHaveCount(0);
    const row = page.locator("div.group", { hasText: title });
    await expect(row).toBeVisible();
    // The delete journey: the AlertDialog confirms with the measured
    // copy ("Delete this grade?" + the will-be-removed sentence).
    await row.getByRole("button", { name: `Delete ${title}` }).click();
    const confirm = page.getByRole("alertdialog");
    await expect(confirm.getByRole("heading", { name: "Delete this grade?" })).toBeVisible();
    await expect(confirm.getByText(`${title} will be removed from your tracker. This cannot be undone.`)).toBeVisible();
    await confirm.getByRole("button", { name: "Delete", exact: true }).click();
    await expect(confirm).toHaveCount(0);
    // Zero residue: the row is gone (the delete has no success toast —
    // the honest silence the S145 posture documents).
    await expect(page.locator("div.group", { hasText: title })).toHaveCount(0);
  });

  test("DY4c: a created subject carries the ported teacher/room fields through the row and the edit round-trip", async ({ page }) => {
    await page.goto("/Settings");
    await hydrated(page);
    await page.getByRole("tab", { name: "Subjects" }).click();
    await expect(page.getByRole("heading", { name: "Subjects" })).toBeVisible();
    // The DY1 port's round-trip: create with the measured fields.
    const name = dyStamp();
    await page.getByRole("button", { name: "Add Subject" }).first().click();
    const dlg = page.getByRole("dialog");
    await dlg.locator("#subject-name").fill(name);
    await dlg.locator("#subject-teacher").fill("Mr. Probe");
    await dlg.locator("#subject-room").fill("Room 101");
    await dlg.getByRole("button", { name: "Add Subject", exact: true }).click();
    await expect(dlg).toHaveCount(0);
    await expect(page.getByText("Subject created")).toBeVisible();
    // The row renders the ported metadata (the measured typography
    // shape: the teacher + the room under the name).
    const row = page.locator("li", { hasText: name });
    await expect(row).toBeVisible();
    await expect(row).toContainText("Mr. Probe");
    await expect(row).toContainText("Room 101");
    // The edit round-trip: the dialog seeds the ported fields; a
    // teacher change lands the toast + the updated row.
    await row.getByRole("button", { name: `Edit ${name}` }).click();
    await expect(dlg.getByRole("heading", { name: "Edit Subject" })).toBeVisible();
    await expect(dlg.locator("#subject-teacher")).toHaveValue("Mr. Probe");
    await dlg.locator("#subject-teacher").fill("Ms. Probe");
    await dlg.getByRole("button", { name: "Save changes" }).click();
    await expect(dlg).toHaveCount(0);
    await expect(page.getByText("Subject updated")).toBeVisible();
    await expect(page.locator("li", { hasText: name })).toContainText("Ms. Probe");
    // Zero residue: the row is DY4d's input; deleted there.
  });

  test("DY4d: the subject delete journey confirms through the AlertDialog's SetNull-consequences copy and the row is gone", async ({ page }) => {
    await page.goto("/Settings");
    await hydrated(page);
    await page.getByRole("tab", { name: "Subjects" }).click();
    await expect(page.getByRole("heading", { name: "Subjects" })).toBeVisible();
    const name = dyStamp();
    await page.getByRole("button", { name: "Add Subject" }).first().click();
    const dlg = page.getByRole("dialog");
    await dlg.locator("#subject-name").fill(name);
    await dlg.getByRole("button", { name: "Add Subject", exact: true }).click();
    await expect(dlg).toHaveCount(0);
    const row = page.locator("li", { hasText: name });
    await expect(row).toBeVisible();
    // The delete journey: the AlertDialog's SetNull-consequences copy
    // ("every task, exam, and note in it becomes unassigned").
    await row.getByRole("button", { name: `Delete ${name}` }).click();
    const confirm = page.getByRole("alertdialog");
    await expect(confirm.getByRole("heading", { name: "Delete this subject?" })).toBeVisible();
    await expect(confirm.getByText(`${name} will be removed and every task, exam, and note in it becomes unassigned. This cannot be undone.`)).toBeVisible();
    await confirm.getByRole("button", { name: "Delete", exact: true }).click();
    await expect(confirm).toHaveCount(0);
    // Zero residue: the row is gone (the seeded subjects stay — the
    // spec owned only its stamped row).
    await expect(page.locator("li", { hasText: name })).toHaveCount(0);
  });
});

// ---------------------------------------------------------------------------
// S176/DZ — the events/studygroups/tasks dialog catch-up (the s176
// reference probe: the FIRST placeholder-level + geometry-level
// measurement of the older families' dialogs — the events dialog's
// placeholder trio ["Event title"/"Room or meeting URL"/"Event
// details..."], the SIX-swatch 32px rounded-full palette with the white
// 2px + slate 4px double-ring + scale(1.1) selected state, the
// repeating-ROWS reminders control [number + unit select + Add], the
// FIVE-option repeat select (Yearly present), the "Create Event"
// submit copy; the studygroups "Group Name *" + "Description" labels +
// the same swatch idiom; the tasks "Task name..." placeholder). The
// notes create-flow port (the reference's inline-draft editor) is the
// recorded deferral — one rotation's worth on its own.
// ---------------------------------------------------------------------------
test.describe("S176/DZ1 · the events create-dialog parity catch-up + the reminders-rows port", () => {
  test("the New Event dialog carries the reference's measured placeholders, palette, reminders rows, repeat options, and submit copy", async ({ page }) => {
    await page.goto("/Events");
    await hydrated(page);
    await page.getByRole("button", { name: "New Event" }).first().click();
    const dlg = page.getByRole("dialog");
    await expect(dlg).toBeVisible();
    // The measured placeholder trio (RED pre-fix: the scaffold-era
    // "Study group — calculus" / "Room 210 or https://…" / no description
    // placeholder).
    await expect(dlg.locator("#event-title")).toHaveAttribute("placeholder", "Event title");
    await expect(dlg.locator("#event-location")).toHaveAttribute("placeholder", "Room or meeting URL");
    await expect(dlg.locator("#event-description")).toHaveAttribute("placeholder", "Event details...");
    // The measured SIX-swatch palette (RED pre-fix: the eight-color
    // scaffold set with teal/slate extras) at 32px rounded-full. The
    // geometry assert reads an UNSELECTED swatch — the selected one
    // scales 1.1 (the reference's own first-swatch reading was 35px for
    // exactly this reason; the base is 32).
    const swatches = dlg.locator("button[aria-label^='Choose color #']");
    await expect(swatches).toHaveCount(6);
    // A rounded read (the dialog's x lands fractionally — 31.99px
    // measured in the full-file run; the base is 32).
    const box = await swatches.nth(1).boundingBox();
    expect(Math.round(box?.width ?? 0)).toBe(32);
    const radius = await swatches.nth(1).evaluate((el) => getComputedStyle(el).borderRadius);
    expect(Number.parseFloat(radius)).toBeGreaterThan(1000); // rounded-full
    // The measured pristine default: violet #8b5cf6 pressed.
    const pressed = dlg.locator("button[aria-label^='Choose color #'][aria-pressed='true']");
    await expect(pressed).toHaveCount(1);
    await expect(pressed.first()).toHaveAttribute("aria-label", "Choose color #8b5cf6");
    // The measured selected-swatch state: the white 2px + slate 4px
    // double ring + the scale(1.1) transform (RED pre-fix: the plain
    // ring-2 ring-slate-900 with no transform).
    const sel = await pressed.first().evaluate((el) => {
      const s = getComputedStyle(el);
      return { shadow: s.boxShadow, transform: s.transform };
    });
    expect(sel.shadow).toContain("rgb(255, 255, 255) 0px 0px 0px 2px");
    expect(sel.shadow).toContain("148, 163, 184) 0px 0px 0px 4px");
    expect(sel.transform).toContain("1.1");
    // The measured reminders ROWS: a number input + a unit select on a
    // fresh open, with the Add button appending a new row (RED pre-fix:
    // the [15/30/60] toggle chips).
    await expect(dlg.getByLabel("Reminder value 1")).toBeVisible();
    await expect(dlg.getByLabel("Reminder unit 1")).toBeVisible();
    await dlg.getByRole("button", { name: "Add", exact: true }).click();
    await expect(dlg.getByLabel("Reminder value 2")).toBeVisible();
    await expect(dlg.getByLabel("Remove reminder 1")).toBeVisible();
    // The measured FIVE-option repeat select — Yearly present (RED
    // pre-fix: the four-option REPEATS vocabulary).
    await dlg.locator("#event-repeat").click();
    await expect(page.getByRole("option", { name: "Yearly", exact: true })).toBeVisible();
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    // The measured submit copy: "Create Event" (RED pre-fix: the
    // lower-case "Create event"). The clone's All-day superset stays.
    await expect(dlg.getByRole("button", { name: "Create Event", exact: true })).toBeVisible();
    await expect(dlg.getByText("All day", { exact: true })).toBeVisible();
    await dlg.getByRole("button", { name: "Close" }).click();
  });

  test("DZ1b: the reminders rows round-trip — 20 minutes + 2 hours persist and re-render through the edit dialog", async ({ page }) => {
    await page.goto("/Events");
    await hydrated(page);
    const name = `DZ Probe ${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    await page.getByRole("button", { name: "New Event" }).first().click();
    const dlg = page.getByRole("dialog");
    await expect(dlg).toBeVisible();
    await dlg.locator("#event-title").fill(name);
    // Today at 16:00 local — inside the day-focus window the list reads.
    const pad = (n: number) => String(n).padStart(2, "0");
    const now = new Date();
    const dt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T16:00`;
    await dlg.locator("#event-start").fill(dt);
    // Row 1: 20 minutes (the fresh-open default row).
    await dlg.getByLabel("Reminder value 1").fill("20");
    // Row 2: 2 hours via the Add button + the unit select (the Radix
    // select — click the trigger, then the option).
    await dlg.getByRole("button", { name: "Add", exact: true }).click();
    await dlg.getByLabel("Reminder value 2").fill("2");
    await dlg.getByLabel("Reminder unit 2").click();
    await page.getByRole("option", { name: "hours", exact: true }).click();
    await dlg.getByRole("button", { name: "Create Event", exact: true }).click();
    await expect(dlg).toHaveCount(0);
    // The created row renders in the day list (the day-focus window
    // includes today).
    const row = page.locator("article", { hasText: name });
    await expect(row).toBeVisible();
    // The edit round-trip: the stored minutes [20, 120] re-render as
    // the seam's rows (the largest-clean-unit derivation — 120 → "2
    // hours").
    await row.getByRole("button", { name: `Edit ${name}` }).click();
    await expect(dlg).toBeVisible();
    await expect(dlg.locator("#event-title")).toHaveValue(name);
    await expect(dlg.getByLabel("Reminder value 1")).toHaveValue("20");
    await expect(dlg.getByLabel("Reminder unit 1")).toHaveText("minutes");
    await expect(dlg.getByLabel("Reminder value 2")).toHaveValue("2");
    await expect(dlg.getByLabel("Reminder unit 2")).toHaveText("hours");
    // The events dialog carries no Cancel (the measured reference footer
    // = [Create Event] + the header Close) — close via the Close button.
    await dlg.getByRole("button", { name: "Close" }).click();
    await expect(dlg).toHaveCount(0);
    // Zero residue: the row is this leg's own; deleted through the UI.
    await row.getByRole("button", { name: `Delete ${name}` }).click();
    await expect(page.locator("article", { hasText: name })).toHaveCount(0);
  });
});

test.describe("S176/DZ2 · the studygroups create-dialog parity catch-up + the swatch idiom port", () => {
  test("the Create Study Group dialog carries the reference's measured labels, palette geometry, and selected state", async ({ page }) => {
    await page.goto("/StudyGroups");
    await hydrated(page);
    await page.getByRole("button", { name: "Create study group" }).first().click();
    const dlg = page.getByRole("dialog");
    await expect(dlg).toBeVisible();
    // The measured labels (RED pre-fix: the scaffold-era "Name" and
    // "Description (optional)").
    await expect(dlg.getByText("Group Name *", { exact: true })).toBeVisible();
    await expect(dlg.locator("#group-name")).toHaveAttribute("placeholder", "e.g., Math Study Squad");
    await expect(dlg.getByText("Description", { exact: true })).toBeVisible();
    await expect(dlg.locator("#group-description")).toHaveAttribute("placeholder", "What's this group about?");
    // The measured swatch idiom: SIX 32px rounded-full swatches with the
    // white 2px + slate 4px double-ring + scale(1.1) selected state
    // (RED pre-fix: the 28px size-7 with the plain slate ring). The
    // geometry assert reads an UNSELECTED swatch (the selected scales).
    const swatches = dlg.locator("button[aria-label^='Choose color #']");
    await expect(swatches).toHaveCount(6);
    // A rounded read (the dialog's flex layout lands the swatch at a
    // fractional x — 31.95px measured; the base is 32).
    const box = await swatches.nth(1).boundingBox();
    expect(Math.round(box?.width ?? 0)).toBe(32);
    const sel = await dlg.locator("button[aria-label^='Choose color #'][aria-pressed='true']").first().evaluate((el) => {
      const s = getComputedStyle(el);
      return { shadow: s.boxShadow, transform: s.transform };
    });
    expect(sel.shadow).toContain("rgb(255, 255, 255) 0px 0px 0px 2px");
    expect(sel.transform).toContain("1.1");
    // The S171-measured footer holds: [Create Group] submit. The dialog
    // carries TWO "Close" buttons (the footer secondary + the header ×) —
    // scope to the form's footer.
    await expect(dlg.getByRole("button", { name: "Create Group", exact: true })).toBeVisible();
    await dlg.locator("form").getByRole("button", { name: "Close" }).click();
  });
});

test.describe("S176/DZ3 · the tasks create-dialog placeholder catch-up", () => {
  test("the Create Task dialog carries the reference's measured placeholder trio", async ({ page }) => {
    await page.goto("/Tasks");
    await hydrated(page);
    await page.getByRole("button", { name: "Add Task" }).first().click();
    const dlg = page.getByRole("dialog");
    await expect(dlg).toBeVisible();
    // The measured placeholder (RED pre-fix: "Task name" without the
    // ellipsis) + the holding pair re-pinned.
    await expect(dlg.locator("#task-title")).toHaveAttribute("placeholder", "Task name...");
    await expect(dlg.getByLabel("Add a subtask")).toHaveAttribute("placeholder", "Add a subtask...");
    await expect(dlg.locator("textarea")).toHaveAttribute("placeholder", "Add notes...");
    await dlg.getByRole("button", { name: "Cancel", exact: true }).click();
    await expect(dlg).toHaveCount(0);
  });
});

// S177/EA — the notes create-flow port (the s177 measured cycle: the
// reference's "New Note" opens the INLINE DRAFT editor directly — no
// dialog, no POST until Save, the X discards; the empty state lives in
// the LEFT list pane while the right pane carries its own no-selection
// state). The measured authority: docs/remediation-plan-session177.md §1
// (B-1/B-2, probed live 2026-11-12, computed DOM, zero residue).
test.describe("S177/EA1 · the notes inline-draft create flow", () => {
  test("EA1: 'New Note' opens the inline draft — no dialog, no POST until Save, the row lands after", async ({ page }) => {
    await page.goto("/Notes");
    await hydrated(page);

    // The POST spy rides the whole flow (the route-continue doctrine —
    // the AG6 pattern; the create POST is counted, everything else
    // passes through untouched).
    const posts: string[] = [];
    await page.route(/\/api\/notes/, async (route) => {
      if (route.request().method() === "POST") posts.push(route.request().postData() ?? "");
      await route.continue();
    });

    // Open the draft through the left-pane dropdown affordance.
    await page.getByRole("button", { name: "New note menu" }).click();
    // exact: true — "New Note" substring-matches "New Notebook" too.
    await page.getByRole("menuitem", { name: "New Note", exact: true }).click();

    // THE FLOW PIN: the draft editor renders INLINE — no dialog (RED
    // pre-fix: the create-only name dialog opens instead, the count
    // reads 1), the title input carries the measured placeholder, and
    // the Quill body mounts blank.
    await expect(page.getByRole("dialog")).toHaveCount(0);
    const draftTitle = page.locator('input[placeholder="Note title..."]');
    await expect(draftTitle).toBeVisible();
    await expect(page.locator(".ql-editor")).toBeVisible();

    // Type the title + a body line, then settle — the draft must NOT
    // POST during typing (RED pre-fix: the dialog's create POST fired
    // on submit; the draft's persistence rides the explicit Save only
    // — the measured no-autosave-during-draft contract).
    await draftTitle.fill("S177 EA1 probe note");
    // S179: the menu-unmount wait — the Radix exit-animation window
    // keeps the closed menu's items focused; a keyboard.type inside it
    // re-activates the item (the EB3 race, root-caused live — see the
    // EB3 comment for the full mechanism).
    await expect(page.getByRole("menu")).toHaveCount(0);
    await page.locator(".ql-editor").click();
    await page.keyboard.type("draft body content");
    await page.waitForTimeout(1800);
    expect(posts.length).toBe(0);

    // Save — exactly ONE create POST, the row lands in the list, and
    // the editor continues on the saved note in VIEW MODE (the measured
    // Save→view contract — the S80/AG6 lineage + the S178/EB port).
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await page.waitForTimeout(1400);
    expect(posts.length).toBe(1);
    expect(posts[0]).toContain("S177 EA1 probe note");
    const row = page.locator('[aria-label="Notes list pane"] button').filter({ hasText: "S177 EA1 probe note" });
    await expect(row).toBeVisible();
    const rightPane = page.locator('[aria-label="Note editor pane"]');
    await expect(rightPane.locator('input[placeholder="Note title..."]')).toBeDisabled();
    await expect(rightPane.locator(".note-content")).toContainText("draft body content");
    await expect(rightPane.getByRole("button", { name: "Edit", exact: true })).toBeVisible();

    // Zero-residue cleanup through the UI (the standing doctrine — the
    // S178/EB view-mode trash, the same Delete-note locator).
    await rightPane.getByRole("button", { name: "Delete note" }).click();
    await expect(row).toHaveCount(0);
    await page.unroute(/\/api\/notes/);
  });

  test("EA1b: the draft's X discards — no POST, no row, the no-selection state returns", async ({ page }) => {
    await page.goto("/Notes");
    await hydrated(page);
    const posts: string[] = [];
    await page.route(/\/api\/notes/, async (route) => {
      if (route.request().method() === "POST") posts.push(route.request().postData() ?? "");
      await route.continue();
    });

    await page.getByRole("button", { name: "New note menu" }).click();
    await page.getByRole("menuitem", { name: "New Note", exact: true }).click();
    const draftTitle = page.locator('input[placeholder="Note title..."]');
    await expect(draftTitle).toBeVisible();

    // Type into BOTH surfaces, then discard (RED pre-fix: the discard
    // affordance does not exist — the aria-label locator times out).
    await draftTitle.fill("S177 EA1b discarded draft");
    // S179: the menu-unmount wait (the EB3 race — see the EB3 comment).
    await expect(page.getByRole("menu")).toHaveCount(0);
    await page.locator(".ql-editor").click();
    await page.keyboard.type("typed then thrown away");
    await page.getByRole("button", { name: "Discard new note" }).click();

    // No POST ever fired, no row landed, and the pane state returned.
    await page.waitForTimeout(1200);
    expect(posts.length).toBe(0);
    await expect(
      page.locator('[aria-label="Notes list pane"] button').filter({ hasText: "S177 EA1b discarded draft" }),
    ).toHaveCount(0);
    await expect(
      page.locator('[aria-label="Note editor pane"]').getByRole("heading", { name: "Select a note" }),
    ).toBeVisible();
    await page.unroute(/\/api\/notes/);
  });

  test("EA1c: Save on an empty draft trips the hand guard — no POST, the draft stays open", async ({ page }) => {
    await page.goto("/Notes");
    await hydrated(page);
    const posts: string[] = [];
    await page.route(/\/api\/notes/, async (route) => {
      if (route.request().method() === "POST") posts.push(route.request().postData() ?? "");
      await route.continue();
    });

    await page.getByRole("button", { name: "New note menu" }).click();
    await page.getByRole("menuitem", { name: "New Note", exact: true }).click();
    const draftTitle = page.locator('input[placeholder="Note title..."]');
    await expect(draftTitle).toBeVisible();

    // Save with an EMPTY title (RED pre-fix: the guard copy rendered
    // inside the create dialog — the pane-scoped locator times out).
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.locator('[aria-label="Note editor pane"]').getByText("Please enter a name.")).toBeVisible();

    // The reference's measured behavior here is a SILENT no-op; the
    // clone's DA2 hand-guard is the recorded superset — the guard must
    // still never POST and never close the draft.
    await page.waitForTimeout(800);
    expect(posts.length).toBe(0);
    await expect(draftTitle).toBeVisible();
    await page.unroute(/\/api\/notes/);
  });

  test("EA3: the empty state lives in the LEFT list pane; the right pane carries the no-selection state", async ({ page }) => {
    await page.goto("/Notes");
    await hydrated(page);

    // Zero-data form: the collection GET routes to an empty list (the
    // S17 fresh-user pattern's lighter twin — the store lands 0 notes,
    // the empty state surfaces). Only the GET is intercepted; every
    // other method passes through.
    await page.route(/\/api\/notes$/, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
      } else {
        await route.continue();
      }
    });
    await page.reload();
    await hydrated(page);
    await page.waitForTimeout(800);

    // THE PLACEMENT PIN: the measured empty state renders INSIDE the
    // list pane (RED pre-fix: it rendered in the right pane's sf-card
    // — the left-pane-scoped locator times out) with the measured copy
    // — the hint carries NO "to start capturing ideas." tail and the
    // CTA reads "New Note" (the case).
    const listPane = page.locator('[aria-label="Notes list pane"]');
    await expect(listPane.getByText("No notes yet", { exact: true })).toBeVisible();
    await expect(listPane.getByText("Create your first note", { exact: true })).toBeVisible();
    await expect(listPane.getByRole("button", { name: "New Note", exact: true })).toBeVisible();

    // The right pane: the measured no-selection state (icon tile +
    // "Select a note" + "Choose a note from the sidebar or create a
    // new one" — RED pre-fix: the copy read "Select a note from the
    // list."), rendered BARE (no sf-card wrapper — the measured bare
    // pane; the S8 pin's bg/border contract). The heading-scoped
    // locator: the md:hidden mobile-squeeze fallback (the EA3b
    // no-overflow guard) carries the old compact copy and would
    // double-match a plain getByText substring.
    const rightPane = page.locator('[aria-label="Note editor pane"]');
    await expect(rightPane.getByRole("heading", { name: "Select a note" })).toBeVisible();
    await expect(rightPane.getByText("Choose a note from the sidebar or create a new one")).toBeVisible();
    const cardCount = await rightPane.locator(".sf-card").count();
    expect(cardCount).toBe(0);

    // The CTA opens the draft (the placement is functional, not just
    // visual — the EA1 flow reachable from the empty state).
    await listPane.getByRole("button", { name: "New Note", exact: true }).click();
    await expect(page.locator('input[placeholder="Note title..."]')).toBeVisible();
    await page.unroute(/\/api\/notes$/);
  });
});

// S178/EB — the notes view/edit MODE SPLIT (the s178 measured cycle: the
// reference's existing-note editor opens in VIEW mode — the disabled
// title + the [Edit][trash] action row + the read-only prose body; "Edit"
// switches to the edit toolbar — the notebook select + Save + X; the X
// exits back to view; the trash deletes DIRECTLY — no confirm. The net
// probe: the reference's edit typing fires ZERO calls in 7s and its X
// fires ZERO PUTs — a LOCAL-only exit; the clone's autosave stays the
// network-measured SUPERSET. The measured authority:
// docs/remediation-plan-session178.md §1 (B-3, probed live 2026-11-12,
// computed DOM, zero residue).
test.describe("S178/EB · the notes view/edit mode split", () => {
  test("EB1: opening a note renders VIEW mode — the disabled title, the [Edit][trash] row, the read-only prose, NO editor chrome", async ({ page }) => {
    await page.goto("/Notes");
    await hydrated(page);

    // Open the seeded note (the pre-fix tree opens the always-editable
    // editor — RED lands at the first view-mode marker below).
    await page.getByRole("button", { name: /Dot product intuition/ }).first().click();
    const rightPane = page.locator('[aria-label="Note editor pane"]');

    // THE VIEW PIN: the title input is DISABLED and carries the stored
    // title (RED pre-fix: the always-editable editor's title is enabled).
    // The regex form: the upstream AH8a/BW3 tests rename the seeded note
    // (the file's own order) — the PREFIX is the stable contract.
    const title = rightPane.locator('input[placeholder="Note title..."]');
    await expect(title).toBeVisible();
    await expect(title).toBeDisabled();
    await expect(title).toHaveValue(/Dot product intuition/);

    // The measured action row: [Edit outline][trash outline-red] (the
    // pin/palette are the recorded B-4/B-5 deferrals — no dead buttons).
    await expect(rightPane.getByRole("button", { name: "Edit", exact: true })).toBeVisible();
    await expect(rightPane.getByRole("button", { name: "Delete note" })).toBeVisible();

    // The measured body: the read-only prose container renders the
    // stored content (RED pre-fix: no .note-content exists — the Quill
    // editor mounts instead).
    const prose = rightPane.locator(".note-content");
    await expect(prose).toBeVisible();
    await expect(prose).toContainText("dot product measures alignment");

    // NO editor chrome in view mode (the measured absences — RED
    // pre-fix: the always-on editor violates every one).
    await expect(rightPane.locator(".ql-editor")).toHaveCount(0);
    await expect(rightPane.getByText("Font:", { exact: true })).toHaveCount(0);
    await expect(rightPane.getByLabel("Add tag")).toHaveCount(0);
    await expect(rightPane.getByRole("button", { name: "Save", exact: true })).toHaveCount(0);
  });

  test("EB2: 'Edit' switches to the edit toolbar — the enabled title, the inline notebook mover, Save + X, the Quill with the stored content", async ({ page }) => {
    await page.goto("/Notes");
    await hydrated(page);
    await page.getByRole("button", { name: /Dot product intuition/ }).first().click();
    const rightPane = page.locator('[aria-label="Note editor pane"]');

    // THE SWITCH PIN (RED pre-fix: no Edit button exists — the click
    // locator times out on the always-editable editor).
    await rightPane.getByRole("button", { name: "Edit", exact: true }).click();

    // The title is now ENABLED (the measured edit-mode shape — the regex
    // form tolerates the upstream renames, the file's own order).
    const title = rightPane.locator('input[placeholder="Note title..."]');
    await expect(title).toBeVisible();
    await expect(title).toBeEnabled();
    await expect(title).toHaveValue(/Dot product intuition/);

    // The measured edit toolbar: the inline notebook select (the CQ3/CR3
    // named-combobox lineage — the MoreVertical popover's mover, now
    // inline where the reference measures it) + Save + the X exit.
    await expect(rightPane.getByRole("combobox", { name: "Move note to notebook" })).toBeVisible();
    await expect(rightPane.getByRole("button", { name: "Save", exact: true })).toBeVisible();
    await expect(rightPane.getByRole("button", { name: "Exit edit mode" })).toBeVisible();

    // The Quill mounts with the stored content + the Font row (the
    // S77/AD5 anatomy — now edit-mode-only).
    const editor = rightPane.locator(".ql-editor");
    await expect(editor).toBeVisible();
    await expect(editor).toContainText("dot product measures alignment");
    await expect(rightPane.getByText("Font:", { exact: true })).toBeVisible();
  });

  test("EB3: the X exits edit mode — the view returns, the typed content persists in the prose (the reference's measured observable; the clone's autosave is the pinned superset)", async ({ page }) => {
    await page.goto("/Notes");
    await hydrated(page);

    // Create the probe note through the real EA1 draft flow, then enter
    // edit mode on it (the post-Save state is VIEW — the measured
    // Save→view contract).
    await page.getByRole("button", { name: "New note menu" }).click();
    await page.getByRole("menuitem", { name: "New Note", exact: true }).click();
    const draftTitle = page.locator('input[placeholder="Note title..."]');
    await draftTitle.fill("S178 EB3 probe note");
    // S179 (the timing race, root-caused live): the Radix DropdownMenu's
    // EXIT ANIMATION keeps the closed menu's items mounted + focused for
    // ~150ms+ after the menuitem click — a keyboard.type landing inside
    // that window routes to the still-focused menu ITEM, and the SPACE in
    // the typed text ACTIVATES it ("New Note" → openDraft fires a SECOND
    // time → the draft silently resets: title blanked, Quill remounted).
    // The reference carries the identical Radix anatomy (measured: its
    // menu content ships the same data-[state=closed]:animate-out classes)
    // — the S178 lesson-3 doctrine: fix the TEST's implicit assumption,
    // not the product. The menu-unmount wait collapses the window.
    await expect(page.getByRole("menu")).toHaveCount(0);
    await page.locator(".ql-editor").click();
    await page.keyboard.type("view then edit then exit");
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await page.waitForTimeout(1400);

    // The created note is selected in VIEW mode (the measured
    // post-Save state) — the Edit switch enters edit mode.
    const rightPane = page.locator('[aria-label="Note editor pane"]');
    await rightPane.getByRole("button", { name: "Edit", exact: true }).click();
    await expect(rightPane.locator(".ql-editor")).toBeVisible();

    // Type a marker into the body, then X (RED pre-fix: the exit
    // affordance does not exist — the aria-label locator times out).
    await rightPane.locator(".ql-editor").click();
    await page.keyboard.type(" EB3-MARKED");
    await rightPane.getByRole("button", { name: "Exit edit mode" }).click();

    // THE EXIT PIN: the view mode returns (the disabled title + the
    // [Edit][trash] row) and the typed fragment shows in the prose —
    // the reference's MEASURED observable (its X is a local-only exit
    // — 0 PUTs on the net probe; the clone's autosave keeps the server
    // current — the recorded superset, this pin owns the divergence
    // record).
    await expect(rightPane.locator('input[placeholder="Note title..."]')).toBeDisabled();
    await expect(rightPane.getByRole("button", { name: "Edit", exact: true })).toBeVisible();
    await expect(rightPane.locator(".note-content")).toContainText("EB3-MARKED");
    await expect(rightPane.locator(".ql-editor")).toHaveCount(0);

    // Zero-residue cleanup through the view-mode trash (the EB4
    // affordance — the standing doctrine).
    await rightPane.getByRole("button", { name: "Delete note" }).click();
    await expect(page.locator('[aria-label="Notes list pane"] button').filter({ hasText: "S178 EB3 probe note" })).toHaveCount(0);
  });

  test("EB4: the view-mode trash deletes DIRECTLY — no confirm dialog, the row lands gone, the no-selection state returns", async ({ page }) => {
    await page.goto("/Notes");
    await hydrated(page);

    // Create the probe note through the real EA1 draft flow (the trash
    // is the view-mode affordance — the created note's post-Save state).
    await page.getByRole("button", { name: "New note menu" }).click();
    await page.getByRole("menuitem", { name: "New Note", exact: true }).click();
    const draftTitle = page.locator('input[placeholder="Note title..."]');
    await draftTitle.fill("S178 EB4 trash probe");
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await page.waitForTimeout(1400);
    const rightPane = page.locator('[aria-label="Note editor pane"]');
    const row = page.locator('[aria-label="Notes list pane"] button').filter({ hasText: "S178 EB4 trash probe" });
    await expect(row).toBeVisible();

    // THE DIRECT-DELETE PIN (RED pre-fix: the pane-scoped trash locator
    // times out — the only "Delete note" lives inside the closed
    // MoreVertical popover). No confirm dialog ever opens (the
    // reference's measured no-confirm — one click, the row gone).
    await rightPane.getByRole("button", { name: "Delete note" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(row).toHaveCount(0);

    // The pane resets to the no-selection state (the seeded account
    // keeps its rows — the 0-notes empty state is the EA3 pin's own
    // territory, not this trash leg's).
    await expect(rightPane.getByRole("heading", { name: "Select a note" })).toBeVisible();
  });
});

// S179/EC — the notes pin/palette/coding-note port (the s179 measured
// cycle: the reference's Notes feature columns — the view-toolbar pin +
// the pinned-first sectioned list, the 7-swatch palette on all three
// toolbars, and the coding-note editor: the 14-option Language select +
// the textarea body + the code badge + the code-icon row lead). The
// measured authority: docs/remediation-plan-session179.md §1 (A-1..A-9,
// probed live 2026-11-13, computed DOM, zero residue).
test.describe("S179/EC · the notes pin/palette/coding-note port", () => {
  test("EC1: the pin toggle sections the list — Pinned first, the violet row pin, the filled toolbar pin", async ({ page }) => {
    await page.goto("/Notes");
    await hydrated(page);

    // Two probe notes through the real EA1 draft flow — A first, B second
    // (B is the NEWER row; the pinned A must sort ABOVE it — the measured
    // pinned-first contract).
    for (const title of ["S179 EC1 note A", "S179 EC1 note B"]) {
      await page.getByRole("button", { name: "New note menu" }).click();
      await page.getByRole("menuitem", { name: "New Note", exact: true }).click();
      const draftTitle = page.locator('input[placeholder="Note title..."]');
      await draftTitle.fill(title);
      await page.getByRole("button", { name: "Save", exact: true }).click();
      await page.waitForTimeout(1400);
    }
    const listPane = page.locator('[aria-label="Notes list pane"]');
    const rightPane = page.locator('[aria-label="Note editor pane"]');
    const rowA = listPane.locator("button").filter({ hasText: "S179 EC1 note A" });
    const rowB = listPane.locator("button").filter({ hasText: "S179 EC1 note B" });

    // Select A (the older note — B lands above it in the updatedAt-desc
    // order pre-pin), then pin it through the view toolbar.
    // RED pre-fix: the "Pin note" button does not exist on the toolbar.
    await rowA.click();
    await rightPane.getByRole("button", { name: "Pin note" }).click();
    await page.waitForTimeout(900);

    // THE SECTION PIN: the "Pinned" section header renders above "All
    // Notes" (RED pre-fix: no section headers exist), A's row carries the
    // violet-filled pin icon, and A sorts ABOVE the newer B.
    await expect(listPane.getByText("Pinned", { exact: true })).toBeVisible();
    await expect(listPane.getByText("All Notes", { exact: true })).toBeVisible();
    await expect(rowA.locator("svg.lucide-pin")).toHaveClass(/fill-violet-500/);
    const aTop = await rowA.boundingBox();
    const bTop = await rowB.boundingBox();
    expect(aTop && bTop && aTop.y < bTop.y).toBe(true);

    // The toolbar pin shows the filled state; the aria-label flips.
    await expect(rightPane.getByRole("button", { name: "Unpin note" })).toBeVisible();

    // Unpin: the Pinned section disappears (the measured zero-pinned
    // state — only "All Notes" remains).
    await rightPane.getByRole("button", { name: "Unpin note" }).click();
    await page.waitForTimeout(900);
    await expect(listPane.getByText("Pinned", { exact: true })).toHaveCount(0);
    await expect(listPane.getByText("All Notes", { exact: true })).toBeVisible();

    // Zero-residue cleanup through the view-mode trash.
    await rowA.click();
    await rightPane.getByRole("button", { name: "Delete note" }).click();
    await rowB.click();
    await rightPane.getByRole("button", { name: "Delete note" }).click();
    await expect(listPane.locator("button").filter({ hasText: "S179 EC1" })).toHaveCount(0);
  });

  test("EC2: the palette pick tints the row + the body card — the 7-swatch popover, the selected swatch state", async ({ page }) => {
    await page.goto("/Notes");
    await hydrated(page);

    // The probe note through the real EA1 draft flow.
    await page.getByRole("button", { name: "New note menu" }).click();
    await page.getByRole("menuitem", { name: "New Note", exact: true }).click();
    const draftTitle = page.locator('input[placeholder="Note title..."]');
    await draftTitle.fill("S179 EC2 palette probe");
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await page.waitForTimeout(1400);
    const listPane = page.locator('[aria-label="Notes list pane"]');
    const rightPane = page.locator('[aria-label="Note editor pane"]');
    const row = listPane.locator("button").filter({ hasText: "S179 EC2 palette probe" });

    // Open the view toolbar's palette (RED pre-fix: the "Note color"
    // button does not exist — the locator times out).
    await rightPane.getByRole("button", { name: "Note color" }).click();

    // THE SWATCH PIN: the 7 measured swatches render (white default +
    // yellow/red/pink/violet/blue/emerald) with the white default
    // selected (the violet border + the scale state). The popover
    // portals to the body level (the Radix contract) — the swatches
    // are page-scoped, never pane-scoped.
    const swatches = page.getByRole("button", { name: / note color$/ });
    await expect(swatches).toHaveCount(7);
    await expect(page.getByRole("button", { name: "white note color" })).toHaveClass(/border-violet-500/);

    // Pick yellow — the row + the body card carry the measured inline
    // tint (rgb(254, 243, 199) = #FEF3C7). The popover STAYS OPEN after
    // the pick (the reference's measured behavior — probed live).
    await page.getByRole("button", { name: "yellow note color" }).click();
    await page.waitForTimeout(900);
    await expect(row).toHaveCSS("background-color", "rgb(254, 243, 199)");
    await expect(rightPane.locator(".note-content")).toHaveCSS("background-color", "rgb(254, 243, 199)");

    // The yellow swatch now carries the selected state on the STILL-OPEN
    // popover (the CURRENT color's marker moved — the measured selection
    // contract; no reopen — the pick never closed it).
    await expect(page.getByRole("button", { name: "yellow note color" })).toHaveClass(/border-violet-500/);

    // Zero-residue cleanup through the view-mode trash.
    await page.keyboard.press("Escape");
    await rightPane.getByRole("button", { name: "Delete note" }).click();
    await expect(listPane.locator("button").filter({ hasText: "S179 EC2" })).toHaveCount(0);
  });

  test("EC3: the coding note — the draft's Language select + textarea, the saved badge + pre body, the edit select", async ({ page }) => {
    await page.goto("/Notes");
    await hydrated(page);

    // THE ENTRY PIN: the header dropdown carries the middle "New Coding
    // Note" item (RED pre-fix: the menuitem does not exist).
    await page.getByRole("button", { name: "New note menu" }).click();
    await page.getByRole("menuitem", { name: "New Coding Note", exact: true }).click();

    // THE DRAFT PIN: the Language select defaults "JavaScript" (the
    // 14-option vocabulary), the body is the plain TEXTAREA (no Quill
    // toolbar, no Font row, no Divider).
    const rightPane = page.locator('[aria-label="Note editor pane"]');
    const draftTitle = page.locator('input[placeholder="Note title..."]');
    await expect(draftTitle).toBeVisible();
    await expect(rightPane.getByRole("combobox", { name: "New coding note language" })).toHaveText("JavaScript");
    await expect(rightPane.locator("textarea")).toBeVisible();
    await expect(rightPane.locator(".ql-editor")).toHaveCount(0);
    await expect(rightPane.getByText("Font:", { exact: true })).toHaveCount(0);

    // Fill + save; the create POST carries the kind + language.
    const posts: string[] = [];
    await page.route(/\/api\/notes/, async (route) => {
      if (route.request().method() === "POST") posts.push(route.request().postData() ?? "");
      await route.continue();
    });
    await draftTitle.fill("S179 EC3 coding probe");
    await rightPane.locator("textarea").fill('const sorted = (xs) => [...xs].sort();');
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await page.waitForTimeout(1400);
    expect(posts[0]).toContain('"kind":"coding"');
    expect(posts[0]).toContain('"language":"JavaScript"');

    // THE VIEW PIN: the row leads with the lucide-code icon, the view
    // carries the language badge + the pre.font-mono body (no prose, no
    // Quill).
    const listPane = page.locator('[aria-label="Notes list pane"]');
    const row = listPane.locator("button").filter({ hasText: "S179 EC3 coding probe" });
    await expect(row.locator("svg.lucide-code")).toHaveCount(1);
    await expect(rightPane.getByText("JavaScript", { exact: true })).toBeVisible();
    await expect(rightPane.locator("pre.font-mono")).toContainText("sorted");
    await expect(rightPane.locator(".ql-editor")).toHaveCount(0);

    // THE EDIT PIN: the Language select rides FIRST in the edit toolbar.
    await rightPane.getByRole("button", { name: "Edit", exact: true }).click();
    await expect(rightPane.getByRole("combobox", { name: "Code note language" })).toHaveText("JavaScript");
    await expect(rightPane.locator("textarea")).toBeVisible();
    await rightPane.getByRole("button", { name: "Exit edit mode" }).click();

    // Zero-residue cleanup through the view-mode trash.
    await rightPane.getByRole("button", { name: "Delete note" }).click();
    await expect(listPane.locator("button").filter({ hasText: "S179 EC3" })).toHaveCount(0);
  });

  test("EC4: the rum beacon batches the boot's metric reports — one POST carries multiple events", async ({ page }) => {
    // The S178 rum-write/boot-read contention fix (the plan §4): the
    // pre-fix beacon fired ONE POST PER METRIC (up to 5 concurrent on
    // boot); the batcher coalesces the burst into ONE POST per 1.5s
    // window. RED pre-fix: every POST carries exactly one event.
    const rumPosts: string[] = [];
    await page.route(/\/api\/rum/, async (route) => {
      if (route.request().method() === "POST") rumPosts.push(route.request().postData() ?? "");
      await route.continue();
    });

    await page.goto("/");
    // Ride past the batch window (1.5s) + the vitals dynamic import —
    // the s18 spec's own trail tolerance (3.5s+) is the budget here.
    await page.waitForTimeout(4200);

    expect(rumPosts.length).toBeGreaterThanOrEqual(1);
    // THE BATCH PIN: the FIRST POST carries ≥ 2 events (TTFB + FCP
    // coalesced — the boot's own burst shape, measured by the metric
    // names on the events array).
    const first = JSON.parse(rumPosts[0]) as { events: Array<{ metric: string }> };
    expect(first.events.length).toBeGreaterThanOrEqual(2);
    for (const post of rumPosts) {
      const body = JSON.parse(post) as { events: Array<{ metric: string }> };
      for (const event of body.events) {
        expect(["TTFB", "FCP", "LCP", "CLS", "INP"]).toContain(event.metric);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// S180/ED · the notes Attach-File wire feature (B-6) + the B-8 toolbar
// drift port — the s180 measured record (probed live 2026-11-13, computed
// DOM + the net probe, zero residue; docs/remediation-plan-session180.md
// §2): the pick uploads IMMEDIATELY (the staged POST answers {id, name,
// url} — the url is the clone's own flat download route); the Save POST
// carries attachments: [{name, url}] (the authoritative desired list —
// the bind joins the staged rows, the removal leg deletes the
// unlisted); the chip X-remove is LOCAL (zero network); the view pills
// render the Attachments section below the body on BOTH kinds; the
// Font row is the bg-slate-50 strip (gap-3, the w-32 h-8 select, the
// h-6 w-px separator, the OUTLINE Divider) with the 5-option
// vocabulary.
// ---------------------------------------------------------------------------
test.describe("S180/ED · the notes Attach-File wire + the B-8 Font-row port", () => {
  const ATTACH_BODY = "S180 ED attach payload";
  const pickFixture = (page: Page) =>
    page.locator("input[type=\"file\"].hidden").first()
      .setInputFiles({
        name: "s180-ed-probe.txt",
        mimeType: "text/plain",
        buffer: Buffer.from(ATTACH_BODY, "utf8"),
      });
  // Every pin is SELF-CONTAINED (open the draft → pick → title → Save →
  // the view state) + zero-residue (the view-mode trash at the end).
  const createAttachedNote = async (page: Page, title: string) => {
    await page.getByRole("button", { name: "New note menu" }).click();
    await page.getByRole("menuitem", { name: "New Note", exact: true }).click();
    await page.waitForFunction(() => !document.querySelector('[role="menuitem"]'), null, { timeout: 10_000 });
    await pickFixture(page);
    const rightPane = page.locator('[aria-label="Note editor pane"]');
    await expect(rightPane.getByRole("link", { name: "s180-ed-probe.txt" })).toBeVisible();
    await rightPane.locator('input[placeholder="Note title..."]').fill(title);
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await page.waitForTimeout(1500);
  };

  test("ED1: the draft Attach row — the outline affordance + the hidden single-file input, below the tag row", async ({ page }) => {
    await page.goto("/Notes");
    await hydrated(page);
    await page.getByRole("button", { name: "New note menu" }).click();
    await page.getByRole("menuitem", { name: "New Note", exact: true }).click();
    await page.waitForFunction(() => !document.querySelector('[role="menuitem"]'), null, { timeout: 10_000 });

    const rightPane = page.locator('[aria-label="Note editor pane"]');
    const fileInput = rightPane.locator('input[type="file"].hidden');
    await expect(fileInput).toHaveCount(1);
    // The measured single-file contract: NO multiple, NO accept.
    const attrs = await fileInput.evaluate((el) => ({
      multiple: (el as HTMLInputElement).multiple,
      accept: el.getAttribute("accept"),
    }));
    expect(attrs.multiple).toBe(false);
    expect(attrs.accept).toBeNull();

    // The outline affordance: the label-wrapped span with the paperclip.
    const affordance = rightPane.getByText("Attach File", { exact: true });
    await expect(affordance).toBeVisible();
    const cs = await affordance.evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        h: Math.round(el.getBoundingClientRect().height),
        bg: s.backgroundColor,
        border: s.borderStyle,
        radius: s.borderRadius,
      };
    });
    expect(cs.h).toBe(32); // h-8
    expect(cs.bg).toBe(rgb(255, 255, 255)); // bg-background (outline)
    expect(cs.border).toBe("solid");
    expect(cs.radius).toBe("6px");
    const icon = affordance.locator("svg");
    await expect(icon).toHaveClass(/lucide-paperclip/);
  });

  test("ED2: the wire — the pick POSTs immediately, the chip renders, the Save POST carries the attachments array", async ({ page }) => {
    let uploadPosts = 0;
    await page.route(/\/api\/notes\/attachments/, async (route) => {
      if (route.request().method() === "POST") uploadPosts += 1;
      await route.continue();
    });
    const notePosts: string[] = [];
    await page.route(/\/api\/notes(\?|$)/, async (route) => {
      if (route.request().method() === "POST") notePosts.push(route.request().postData() ?? "");
      await route.continue();
    });

    await page.goto("/Notes");
    await hydrated(page);
    await page.getByRole("button", { name: "New note menu" }).click();
    await page.getByRole("menuitem", { name: "New Note", exact: true }).click();
    await page.waitForFunction(() => !document.querySelector('[role="menuitem"]'), null, { timeout: 10_000 });
    const rightPane = page.locator('[aria-label="Note editor pane"]');

    await pickFixture(page);
    await expect(uploadPosts, "the pick POSTs the staged upload immediately").toBe(1);
    // THE CHIP PIN: the staged row renders with its derived download url.
    const chip = rightPane.getByRole("link", { name: "s180-ed-probe.txt" });
    await expect(chip).toBeVisible();
    const href = await chip.getAttribute("href");
    expect(href).toMatch(/\/api\/notes\/attachments\/.+/);
    await expect(chip).toHaveClass(/hover:underline/);

    // Fill + Save — the create POST carries the measured wire shape.
    await rightPane.locator('input[placeholder="Note title..."]').fill("S180 ED2 wire probe");
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await page.waitForTimeout(1500);
    const body = JSON.parse(notePosts[0] ?? "{}") as { attachments?: Array<{ name: string; url: string }> };
    expect(body.attachments).toEqual([
      { name: "s180-ed-probe.txt", url: expect.stringMatching(/\/api\/notes\/attachments\/.+/) },
    ]);

    // Zero-residue cleanup through the view-mode trash.
    await rightPane.getByRole("button", { name: "Delete note" }).click();
    await expect(
      page.locator('[aria-label="Notes list pane"]').locator("button").filter({ hasText: "S180 ED2 wire probe" }),
    ).toHaveCount(0);
  });

  test("ED3: the view pills — the Attachments section below the body + the download route serves the bytes", async ({ page }) => {
    await page.goto("/Notes");
    await hydrated(page);
    await createAttachedNote(page, "S180 ED3 view probe");
    const rightPane = page.locator('[aria-label="Note editor pane"]');
    // THE SECTION PIN: the saved note's view carries the Attachments
    // section below the body (the measured strip + heading + pill).
    const section = rightPane.getByText("Attachments", { exact: true }).locator("..");
    await expect(section).toBeVisible();
    await expect(section).toHaveClass(/mt-6 pt-4 border-t border-slate-200/);
    const pill = section.getByRole("link", { name: "s180-ed-probe.txt" });
    await expect(pill).toBeVisible();
    await expect(pill).toHaveClass(/bg-slate-100/);
    await expect(pill.locator("svg")).toHaveClass(/lucide-paperclip/);

    // THE DOWNLOAD PIN: the derived url serves the bytes with the
    // S13/S14 download contract (attachment + nosniff + no-store).
    const href = (await pill.getAttribute("href")) ?? "";
    const res = await page.request.get(href);
    expect(res.status()).toBe(200);
    const headers = res.headers();
    expect(headers["content-disposition"]).toContain("attachment");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect((await res.body()).toString("utf8")).toBe(ATTACH_BODY);
    // A bogus id answers the ownership-scoped 404.
    const missing = await page.request.get("/api/notes/attachments/nonexistent-id-404");
    expect(missing.status()).toBe(404);

    // Zero-residue cleanup.
    await rightPane.getByRole("button", { name: "Delete note" }).click();
    await expect(
      page.locator('[aria-label="Notes list pane"]').locator("button").filter({ hasText: "S180 ED3 view probe" }),
    ).toHaveCount(0);
  });

  test("ED4: the edit surface — the chip seeds from the note, the X removes LOCALLY, the Save persists the removal", async ({ page }) => {
    await page.goto("/Notes");
    await hydrated(page);
    await createAttachedNote(page, "S180 ED4 edit probe");
    const listPane = page.locator('[aria-label="Notes list pane"]');
    const rightPane = page.locator('[aria-label="Note editor pane"]');

    let patches = 0;
    await page.route(/\/api\/notes\/[a-z0-9]+(\?|$)/i, async (route) => {
      if (route.request().method() === "PATCH") patches += 1;
      await route.continue();
    });

    // THE SEED PIN: the Edit click seeds the working list from the note.
    await rightPane.getByRole("button", { name: "Edit", exact: true }).click();
    await expect(rightPane.getByRole("link", { name: "s180-ed-probe.txt" })).toBeVisible();

    // THE LOCAL-X PIN: the remove fires ZERO network (the measured
    // posture — the removal persists through the Save's array).
    await rightPane.getByRole("button", { name: "Remove attachment s180-ed-probe.txt" }).click();
    await page.waitForTimeout(900);
    await expect(rightPane.getByRole("link", { name: "s180-ed-probe.txt" })).toHaveCount(0);
    expect(patches, "the chip X is local-only — zero PATCHes on the click").toBe(0);

    // THE SAVE PIN: the Save PATCHes the authoritative (now-empty) array.
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await page.waitForTimeout(1200);
    expect(patches).toBeGreaterThanOrEqual(1);
    // Back in VIEW mode: zero attachments → NO Attachments section.
    await expect(rightPane.getByText("Attachments", { exact: true })).toHaveCount(0);

    // Zero-residue cleanup through the view-mode trash.
    await rightPane.getByRole("button", { name: "Delete note" }).click();
    await expect(listPane.locator("button").filter({ hasText: "S180 ED4 edit probe" })).toHaveCount(0);
  });

  test("ED5: the coding draft carries the Attach row (no Font row); the coding view's section sits below the pre body", async ({ page }) => {
    await page.goto("/Notes");
    await hydrated(page);
    await page.getByRole("button", { name: "New note menu" }).click();
    await page.getByRole("menuitem", { name: "New Coding Note", exact: true }).click();
    await page.waitForFunction(() => !document.querySelector('[role="menuitem"]'), null, { timeout: 10_000 });
    const rightPane = page.locator('[aria-label="Note editor pane"]');
    await expect(rightPane.getByText("Attach File", { exact: true })).toBeVisible();
    await expect(rightPane.getByText("Font:", { exact: true })).toHaveCount(0);

    await pickFixture(page);
    await rightPane.locator("textarea").fill("const probe = 's180-ed5';");
    await rightPane.locator('input[placeholder="Note title..."]').fill("S180 ED5 coding probe");
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await page.waitForTimeout(1500);
    // THE VIEW PIN: the coding note's section renders below the pre body.
    const listPane = page.locator('[aria-label="Notes list pane"]');
    await listPane.locator("button").filter({ hasText: "S180 ED5 coding probe" }).click();
    await expect(rightPane.locator("pre.font-mono")).toBeVisible();
    const section = rightPane.getByText("Attachments", { exact: true }).locator("..");
    await expect(section).toBeVisible();
    await expect(rightPane.getByRole("link", { name: "s180-ed-probe.txt" })).toBeVisible();

    // Zero-residue cleanup.
    await rightPane.getByRole("button", { name: "Delete note" }).click();
    await expect(listPane.locator("button").filter({ hasText: "S180 ED5 coding probe" })).toHaveCount(0);
  });

  test("ED6: the B-8 Font-row port — the bg-slate-50 strip, the w-32 h-8 select, the separator, the 5 options", async ({ page }) => {
    await page.goto("/Notes");
    await hydrated(page);
    await page.getByRole("button", { name: /Dot product intuition/ }).first().click();
    await page.locator('[aria-label="Note editor pane"]').getByRole("button", { name: "Edit", exact: true }).click();

    // THE STRIP: bg-slate-50 + rounded-lg (8px) + the measured order.
    const strip = page.getByText("Font:", { exact: true }).locator("..").locator("..");
    const stripCs = await strip.evaluate((el) => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, radius: s.borderRadius };
    });
    expect(stripCs.bg).toBe(rgb(248, 250, 252)); // slate-50
    expect(stripCs.radius).toBe("8px"); // rounded-lg

    // THE SELECT: w-32 (128px) × h-8 (32px), the default text-sm size.
    const select = page.getByRole("combobox", { name: "Editor font" });
    const selectBox = await select.boundingBox();
    expect(Math.round(selectBox?.height ?? 0)).toBe(32);
    expect(Math.round(selectBox?.width ?? 0)).toBe(128);
    const selectCs = await select.evaluate((el) => getComputedStyle(el).fontSize);
    expect(selectCs).toBe("14px");

    // THE SEPARATOR: h-6 w-px bg-slate-200 between the select and the Divider.
    const separator = page.getByText("Font:", { exact: true }).locator("..").locator("..").locator("div[aria-hidden]");
    const sepCs = await separator.evaluate((el) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return { bg: s.backgroundColor, w: Math.round(r.width), h: Math.round(r.height) };
    });
    expect(sepCs.bg).toBe(rgb(226, 232, 240)); // slate-200
    expect(sepCs.w).toBe(1);
    expect(sepCs.h).toBe(24);

    // THE 5-OPTION VOCABULARY (measured labels + order) — textContent()
    // is exact by nature (the run-2 lesson: it takes no `exact` option).
    await select.click();
    const options = page.getByRole("option");
    await expect(options).toHaveCount(5);
    expect(await options.nth(0).textContent()).toBe("Default");
    expect(await options.nth(1).textContent()).toBe("Serif");
    expect(await options.nth(2).textContent()).toBe("Sans-serif");
    expect(await options.nth(3).textContent()).toBe("Monospace");
    expect(await options.nth(4).textContent()).toBe("Cursive");
    await page.keyboard.press("Escape");
  });
});
