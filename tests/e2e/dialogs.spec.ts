import { expect, test, type Page } from "@playwright/test";

/**
 * Dialog catch-up family parity pins — the consolidated dialogs home,
 * the FIRST AXIS home (S197/EU).
 *
 * Split out of parity-session7.spec.ts (the S196 close's first named
 * next candidate — the dialog catch-up family consolidation, executed in
 * the census-clean window the standing audit confirmed, the seventh
 * consecutive clean window). The family's binding axis is the dialog
 * ANATOMY, not a view: the four describes cover FOUR views (Settings
 * Holidays + Settings Subjects + Events + Tasks), every one a
 * create-dialog parity catch-up ported from a live reference probe.
 * Every block moved here BYTE-FAITHFULLY, declaration order preserved —
 * 4 describes / 5 pins:
 *  - S174/DX4 the holidays create-dialog (the measured asterisked
 *    "Name" + "Start Date" + "End Date" labels + the "Type" selector,
 *    the range fields, the [Cancel][Add Holiday] footer — read-only
 *    anatomy, never submits).
 *  - S175/DY1 the subject create-dialog (the asterisked "Subject Name *"
 *    label, the "e.g., Mathematics" placeholder, the 17-swatch 32px
 *    palette, teacher/room fields, the [Cancel][Add Subject] footer —
 *    read-only anatomy, never submits).
 *  - S176/DZ1 the events create-dialog (DZ1a the placeholder trio, the
 *    six-swatch double-ring palette, the reminders ROWS control, the
 *    five-option repeat select, the "Create Event" submit copy —
 *    read-only; DZ1b the reminders round-trip: a Date.now-stamped event
 *    created through the real dialog, edited, and self-DELETed — zero
 *    residue).
 *  - S176/DZ3 the tasks create-dialog placeholder trio
 *    ("Task name..."/"Add a subtask..."/"Add notes..." — read-only).
 *
 * The non-dialog families stay in parity-session7; the dialog strays
 * outside it (the S171/DU2 + S176/DZ2 studygroups dialogs, the S172/DV2
 * practicetests dialog, the S173/DW2 grades dialog — each already in its
 * dedicated view home from S195/S196; the a11y-sweep dialog legs, the
 * dark-mode washes, the resilience CB8 legs) stay in their coverage-axis
 * homes (the S189-S196 boundary precedent — see
 * docs/remediation-plan-session197.md).
 *
 * The pins' contracts (unchanged by the move):
 *  - CHUNK 2 home (scripts/e2e-chunked-cert.sh) — the SAME chunk as the
 *    split source, so the write budgets hold by construction; the file
 *    sorts 3rd in the chunk's alphabetical order (a11y-sweep <
 *    analytics < dialogs < files) — strictly FEWER predecessors than the
 *    split source's 8th position (the S194/S195 safe direction); the
 *    DZ1b write units (event POST + PATCH + DELETE through the real UI)
 *    ride WITH the pin inside chunk 2 (the chunk is the budget
 *    boundary).
 *  - The full family map: docs/remediation-plan-session197.md.
 */


const hydrated = (page: Page) =>
  page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true");



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
