import { expect, test, type Page } from "@playwright/test";

/**
 * Timetable-family parity pins — the consolidated timetable home (S193/EQ).
 *
 * Split out of parity-session7.spec.ts (the S189 close's named candidate,
 * three times deferred by the blast-radius rule — S190's behavior-change
 * axis, S192's, and the S193 open's clean-window confirmation): every
 * pure-timetable describe moved here BYTE-FAITHFULLY, declaration order
 * preserved — 4 describes / 15 pins: the S7-C founding set (the
 * grid-cols-8 week grid, the 60px hour rows, the My Classes today-date
 * header), the S127/CB6 14-hour-row band, the S161/DJ2 typed-path band
 * hand-guard, and the S185/EI week-strip rows port (the flush grid card,
 * the "Time" corner, the mobile flat rows). The non-timetable families
 * stay in parity-session7; the strays outside it (S165/DN1 in
 * parity-session9, the theme-system timetable mobile-tile leg, the
 * a11y-sweep /Timetable leg) stay in their coverage-axis homes (the
 * S189/S191 boundary precedent — see docs/remediation-plan-session193.md).
 *
 * The pins' contracts (unchanged by the move):
 *  - SEED-ANCHORED: every pin starts page.goto("/Timetable") + hydrated()
 *    and asserts the SEED's 5 classes (Calculus II / World History /
 *    Physics / English Literature / Chemistry Lab, ISO Mon–Fri — Sunday
 *    empty at every hour, the deterministic empty column); the family
 *    issues ZERO timetable writes (the DJ2 pin asserts the zero-POST
 *    contract itself), never another spec's residue.
 *  - CHUNK 2 home (scripts/e2e-chunked-cert.sh) — the SAME chunk as the
 *    split source, so the POST/register budgets hold by construction;
 *    the file sorts LAST in the chunk's alphabetical order (the two
 *    residue directions analyzed in the plan §4).
 *  - The full family map: docs/remediation-plan-session193.md.
 */


const hydrated = (page: Page) =>
  page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true");


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

test.describe("S185/EI · the Timetable week-strip rows port", () => {
  // The S185 axis (docs/remediation-plan-session185.md): the reference's
  // week-strip rows measured live (eleven probes, the evidence at
  // docs/probe-evidence/s185/) — the desktop strip + grid family and the
  // reference's own mobile surface (measured for the first time; the
  // prior "mobile anatomy already recorded" was the CLONE's own
  // accordion). The pins run against the SEEDED demo account (5 classes,
  // ISO Mon–Fri; Sunday is empty at every hour — the deterministic empty
  // column for the click + expanded-day pins).

  test("EI1: the desktop grid card renders FLUSH — no card padding (the measured wrapper)", async ({ page }) => {
    await page.goto("/Timetable");
    await hydrated(page);
    const grid = page.locator('[aria-label="Week grid"]');
    await expect(grid).toBeVisible();
    // The card wrapper: the reference's grid card carries NO padding — the
    // header strip + the grid render flush to the card's edges (the
    // measured parent chain, probe 3). The pre-change clone reads p-6.
    const card = grid.locator("xpath=ancestor::section").first();
    const cs = await card.evaluate((el) => {
      const s = getComputedStyle(el);
      return { pl: s.paddingLeft, pt: s.paddingTop, pr: s.paddingRight, pb: s.paddingBottom, overflow: s.overflow };
    });
    expect(cs.pl).toBe("0px");
    expect(cs.pt).toBe("0px");
    expect(cs.pr).toBe("0px");
    expect(cs.pb).toBe("0px");
    expect(cs.overflow).toBe("hidden");
  });

  test("EI2: the header strip carries the 'Time' corner label + the border-b separator", async ({ page }) => {
    await page.goto("/Timetable");
    await hydrated(page);
    const head = page.locator('[aria-label="Week header"]');
    await expect(head).toBeVisible();
    // The strip's own bottom border (the reference's separator between
    // the day heads and the hour grid — the pre-change strip has none).
    const stripCs = await head.evaluate((el) => {
      const s = getComputedStyle(el);
      return { bw: s.borderBottomWidth, bc: s.borderBottomColor };
    });
    expect(stripCs.bw).toBe("1px");
    expect(stripCs.bc).toBe("rgb(241, 245, 249)"); // slate-100
    // The corner cell: the reference renders "Time" (p-3 text-center
    // text-sm font-medium text-slate-500) — the pre-change corner is an
    // EMPTY div.
    const corner = head.locator("> div").first();
    const cornerCs = await corner.evaluate((el) => {
      const s = getComputedStyle(el);
      return { text: (el.textContent || "").trim(), size: s.fontSize, weight: s.fontWeight, color: s.color, ta: s.textAlign, pl: s.paddingLeft };
    });
    expect(cornerCs.text).toBe("Time");
    expect(cornerCs.size).toBe("14px");
    expect(cornerCs.weight).toBe("500");
    expect(cornerCs.color).toBe("rgb(100, 116, 139)"); // slate-500
    expect(cornerCs.ta).toBe("center");
    expect(cornerCs.pl).toBe("12px"); // p-3
  });

  test("EI3: the date reads slate-700 + the today cell's UNROUNDED violet pair", async ({ page }) => {
    await page.goto("/Timetable");
    await hydrated(page);
    const head = page.locator('[aria-label="Week header"]');
    const cells = await head.evaluate((el) =>
      [...el.children].map((c) => {
        const today = c.hasAttribute("data-today-header");
        const ps = [...c.querySelectorAll("p")];
        const nameP = ps[0];
        const dateP = ps[1];
        return {
          today,
          text: (c.textContent || "").trim().slice(0, 12),
          radius: getComputedStyle(c).borderRadius,
          nameColor: nameP ? getComputedStyle(nameP).color : null,
          dateColor: dateP ? getComputedStyle(dateP).color : null,
        };
      }),
    );
    // A non-today day cell: the date reads slate-700 (rgb 51,65,85 — the
    // pre-change slate-800 reads 30,41,59). The "Time" corner cell carries
    // no P children — excluded from the day-cell set.
    const nonToday = cells.filter((c) => !c.today && c.text !== "Time" && c.text.length > 3);
    expect(nonToday.length).toBeGreaterThanOrEqual(1);
    expect(nonToday[0].dateColor).toBe("rgb(51, 65, 85)");
    expect(nonToday[0].nameColor).toBe("rgb(71, 85, 105)"); // slate-600 (unchanged)
    // The today cell: UNROUNDED (the reference's bg-violet-50 carries no
    // rounding — the pre-change rounded-lg reads 8px) + the measured violet
    // name/date pair (the pre-change reads slate-600/slate-800).
    const todayCell = cells.find((c) => c.today);
    if (!todayCell) throw new Error("no today header cell found (the [data-today-header] attribute is missing)");
    expect(todayCell.radius).toBe("0px");
    expect(todayCell.nameColor).toBe("rgb(124, 58, 237)"); // violet-600
    // violet-700: the clone's pinned v3-era hex ramp computes
    // rgb(109,40,217); the reference's own unpinned oklch renders 219 —
    // the standing trap-2/10 palette-pin deviation (sub-visible, the
    // documented pin posture), recorded here.
    expect(todayCell.dateColor).toBe("rgb(109, 40, 217)"); // violet-700 (the pinned-ramp form)
  });

  test("EI4: the hour labels render slate-400 LEFT at px-3 — the span carrier", async ({ page }) => {
    await page.goto("/Timetable");
    await hydrated(page);
    // The S7-C contract rides: the first label cell reads "7 AM" at 60px.
    // The reference's carrier: the CELL (h-[60px] border-b border-slate-50
    // px-3 py-1) wraps a SPAN text-xs text-slate-400 — 12px slate-400 at
    // the LEFT (the pixel probe: ink rgb(148,163,184) at x306). The
    // pre-change clone: a bare right-aligned slate-500 div (pr-2 pt-1).
    const firstLabel = page.locator('[aria-label="Hour cells"] > div').first();
    const cellCs = await firstLabel.evaluate((el) => {
      const s = getComputedStyle(el);
      const span = el.querySelector("span");
      const scs = span ? getComputedStyle(span) : null;
      return {
        text: (el.textContent || "").trim(),
        h: Math.round(el.getBoundingClientRect().height),
        pl: s.paddingLeft,
        pt: s.paddingTop,
        align: s.textAlign,
        spanColor: scs ? scs.color : null,
        spanSize: scs ? scs.fontSize : null,
        spanWeight: scs ? scs.fontWeight : null,
      };
    });
    expect(cellCs.text).toBe("7 AM");
    expect(cellCs.h).toBe(60);
    expect(cellCs.pl).toBe("12px"); // px-3 — the pre-change reads 0px
    expect(cellCs.pt).toBe("4px"); // py-1
    expect(cellCs.align).toBe("start"); // LEFT — the pre-change reads "right"
    // The span's color is the readable superset: the reference's own
    // slate-400 ink (rgb(148,163,184), pixel-verified) fails WCAG at
    // 2.85:1 on white — an axe color-contrast serious (the a11y-sweep
    // gate caught it on the first port); the clone keeps its prior
    // slate-500 (4.76:1) per the S83/AJ5 precedent, the reference's own
    // defect recorded.
    expect(cellCs.spanColor).toBe("rgb(100, 116, 139)"); // slate-500 (the readable form)
    expect(cellCs.spanSize).toBe("12px");
    expect(cellCs.spanWeight).toBe("400");
  });

  test("EI5: an empty cell CLICK opens Add Class prefilled with the DAY only (not the hour)", async ({ page }) => {
    await page.goto("/Timetable");
    await hydrated(page);
    // The Sunday 7 AM cell — the first relative cell of the hour rows (the
    // seed's classes sit on ISO Mon–Fri; Sunday is empty at every hour).
    const cell = page.locator('[aria-label="Hour cells"] > div.relative').first();
    await expect(cell).toBeVisible();
    // The affordance: cursor-pointer (the reference's columns carry it; the
    // pre-change cells read "auto").
    const cursor = await cell.evaluate((el) => getComputedStyle(el).cursor);
    expect(cursor).toBe("pointer");
    await cell.click();
    const dlg = page.getByRole("dialog");
    await expect(dlg).toBeVisible();
    await expect(dlg.getByRole("heading", { name: "Add Class" })).toBeVisible();
    // The DAY prefilled (the reference's measured semantics — probe 10:
    // Tuesday's 11 AM cell opened the day select at Tuesday; the pre-change
    // cell never opens anything).
    await expect(dlg.locator("#class-day")).toHaveText("Sunday");
    // The hour NOT prefilled: the times stay the form's 09:00/10:00
    // defaults (probe 10's disambiguation — the clicked hour never leaks
    // into the dialog).
    await expect(dlg.locator("#class-start")).toHaveValue("09:00");
    await expect(dlg.locator("#class-end")).toHaveValue("10:00");
    await page.keyboard.press("Escape");
    await expect(dlg).toHaveCount(0);
  });

  test("EI6: the mobile rows render the reference's flat anatomy (the stacked tile, 14px counts, no chevron, ALL collapsed)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/Timetable");
    await hydrated(page);
    const section = page.locator('section[class~="md:hidden"]');
    await expect(section).toBeVisible();
    // NO Today chip (the reference carries none above its rows — the
    // pre-change clone renders the sf-chip-dark chip).
    expect(await section.locator("text=/^Today$/i").count()).toBe(0);
    const rows = section.locator("button[aria-expanded]");
    await expect(rows).toHaveCount(7);
    // ALL collapsed (the reference's measured initial state — probe 5: the
    // click EXPANDED the today row, so nothing was pre-open; the
    // pre-change clone pre-opens today).
    const expandedStates = await rows.evaluateAll((els) => els.map((el) => el.getAttribute("aria-expanded")));
    expect(expandedStates.every((s) => s === "false")).toBe(true);
    // The flat anatomy: hairline separators between the rows (the
    // reference's border-b rows in one overflow-hidden card — Tailwind
    // v4's divide-y emits border-BOTTOM on every child except the last,
    // the same six separators; the pre-change carried 7 separate
    // rounded-xl bordered cards).
    const firstWrapper = rows.first().locator("xpath=..");
    const lastWrapper = rows.last().locator("xpath=..");
    const wrapperCs = await firstWrapper.evaluate((el) => {
      const s = getComputedStyle(el);
      return { bb: s.borderBottomWidth, bbc: s.borderBottomColor, radius: s.borderRadius };
    });
    expect(wrapperCs.bb).toBe("1px");
    expect(wrapperCs.bbc).toBe("rgb(241, 245, 249)"); // slate-100 hairline
    expect(wrapperCs.radius).toBe("0px"); // the pre-change rounded-xl reads 12px
    const lastCs = await lastWrapper.evaluate((el) => getComputedStyle(el).borderBottomWidth);
    expect(lastCs).toBe("0px"); // the :not(:last-child) exclusion — six hairlines
    // The first row's button: the p-4 breathing room + NO rounding.
    const btnCs = await rows.first().evaluate((el) => {
      const s = getComputedStyle(el);
      return { pl: s.paddingLeft, radius: s.borderRadius };
    });
    expect(btnCs.pl).toBe("16px"); // p-4 — the pre-change p-3 reads 12px
    expect(btnCs.radius).toBe("0px");
    // The tile: the two stacked spans (the abbreviated weekday at
    // text-xs/500 over the date at text-sm/700 — the reference's w-10 h-10
    // flex-col; the pre-change renders the date number only).
    const tile = rows.first().locator("span.flex");
    const tileCs = await tile.evaluate((el) => {
      const s = getComputedStyle(el);
      const spans = [...el.querySelectorAll("span")].map((k) => ({
        text: (k.textContent || "").trim().slice(0, 4),
        size: getComputedStyle(k).fontSize,
        weight: getComputedStyle(k).fontWeight,
      }));
      return { fd: s.flexDirection, spans };
    });
    expect(tileCs.fd).toBe("column");
    expect(tileCs.spans.length).toBe(2);
    expect(tileCs.spans[0].size).toBe("12px"); // text-xs
    expect(tileCs.spans[0].weight).toBe("500");
    expect(tileCs.spans[1].size).toBe("14px"); // text-sm
    expect(tileCs.spans[1].weight).toBe("700");
    // NO chevron (the reference's rows carry no expand glyph — the
    // pre-change renders the rotating ChevronDown).
    expect(await rows.first().locator("svg").count()).toBe(0);
    // The count reads text-sm (14px — the reference's form; the
    // pre-change text-xs reads 12px). The exact-form match picks the count
    // span itself (the flex-1 wrapper's text also contains "classes").
    const countCs = await rows.first().evaluate((el) => {
      const spans = [...el.querySelectorAll("span")];
      const count = spans.find((s) => /^\d+ (class|classes)$/.test((s.textContent || "").trim()));
      return count ? getComputedStyle(count).fontSize : null;
    });
    expect(countCs).toBe("14px");
    // The today row's tile + name: the violet marking (the today tile's
    // sf-selected-tint = violet-600, the a11y superset over the reference's
    // violet-500; the today name violet-700 — the reference's visible
    // today form; NO row-level tint — the reference tints no row).
    const todayRow = rows.filter({ has: page.locator(".sf-selected-tint") });
    await expect(todayRow).toHaveCount(1);
    const todayCs = await todayRow.first().evaluate((el) => {
      const tile = el.querySelector("span.sf-selected-tint");
      const name = [...el.querySelectorAll("span.block")][0];
      return {
        tileBg: tile ? getComputedStyle(tile).backgroundColor : null,
        rowBg: getComputedStyle(el).backgroundColor,
        nameColor: name ? getComputedStyle(name).color : null,
      };
    });
    expect(todayCs.tileBg).toBe("rgb(124, 58, 237)"); // sf-selected-tint (violet-600)
    expect(todayCs.rowBg).toBe("rgba(0, 0, 0, 0)"); // NO row tint
    expect(todayCs.nameColor).toBe("rgb(109, 40, 217)"); // violet-700 (the pinned-ramp form — the reference's oklch renders 219, the trap-2/10 deviation)
  });

  test("EI7: the expanded EMPTY day carries the slate-50 block + 'No classes' + the Add Class button", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/Timetable");
    await hydrated(page);
    // Sunday's row (the seed's classes sit on ISO Mon–Fri — Sunday is the
    // deterministic empty day).
    const sundayRow = page.locator('section[class~="md:hidden"] button[aria-expanded]').first();
    await sundayRow.click();
    // The expanded block: the measured family (p-4 space-y-2 bg-slate-50 —
    // the pre-change renders a transparent px-3 pb-3 wrapper).
    const block = page.locator('section[class~="md:hidden"] div.bg-slate-50').first();
    await expect(block).toBeVisible();
    const bcs = await block.evaluate((el) => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, pl: s.paddingLeft };
    });
    expect(bcs.bg).toBe("rgb(248, 250, 252)"); // slate-50 (#f8fafc — the measured class's own token)
    expect(bcs.pl).toBe("16px"); // p-4
    // The "No classes" line (the measured copy — the pre-change reads "No
    // classes this day."; the reference's P is centered at py-4).
    const line = block.getByText("No classes", { exact: true });
    await expect(line).toBeVisible();
    const lcs = await line.evaluate((el) => {
      const s = getComputedStyle(el);
      return { align: s.textAlign, pt: s.paddingTop, color: s.color, size: s.fontSize };
    });
    expect(lcs.align).toBe("center");
    expect(lcs.pt).toBe("16px"); // py-4
    expect(lcs.color).toBe("rgb(100, 116, 139)"); // slate-500
    expect(lcs.size).toBe("16px");
    // The Add Class button (the measured near-black family — the
    // reference's --background token renders its outline family at
    // rgb(10,10,10)/rgb(250,250,250); the clone's neutral variant IS that
    // family; h-8 text-xs full-width mt-2 + the Plus icon).
    const btn = block.getByRole("button", { name: "Add Class" });
    await expect(btn).toBeVisible();
    const btnCs = await btn.evaluate((el) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return { bg: s.backgroundColor, color: s.color, h: Math.round(r.height), size: s.fontSize, radius: s.borderRadius };
    });
    expect(btnCs.bg).toBe("rgb(10, 10, 10)");
    expect(btnCs.color).toBe("rgb(250, 250, 250)");
    expect(btnCs.h).toBe(32); // h-8
    expect(btnCs.size).toBe("12px"); // text-xs (the sm size)
    expect(btnCs.radius).toBe("6px");
    // Clicking it opens the dialog (the reference's measured create path —
    // the pre-change empty day carries no create affordance).
    await btn.click();
    const dlg = page.getByRole("dialog");
    await expect(dlg).toBeVisible();
    await expect(dlg.getByRole("heading", { name: "Add Class" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dlg).toHaveCount(0);
  });

  test("EI8: the dialog's DEFAULT day is today (the measured reference default) + the 09:00/10:00 time defaults", async ({ page }) => {
    await page.goto("/Timetable");
    await hydrated(page);
    await page.getByRole("button", { name: "Add Class" }).first().click();
    const dlg = page.getByRole("dialog");
    await expect(dlg).toBeVisible();
    // The reference's dialog opens with today's day + its own 09:00/10:00
    // time defaults (measured fresh-context: day 6 on Saturday 2026-11-14;
    // the pre-change clone defaults to Monday).
    const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
    await expect(dlg.locator("#class-day")).toHaveText(todayName);
    await expect(dlg.locator("#class-start")).toHaveValue("09:00");
    await expect(dlg.locator("#class-end")).toHaveValue("10:00");
    await page.keyboard.press("Escape");
    await expect(dlg).toHaveCount(0);
  });
});
