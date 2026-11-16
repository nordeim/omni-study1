import { expect, test, type Page } from "@playwright/test";

/**
 * StudyGroups-family parity pins — the consolidated studygroups home
 * (S196/ET).
 *
 * Split out of parity-session7.spec.ts (the S195 close's named next
 * candidate — the studygroups + practicetests two-family consolidation,
 * the SECOND two-family cycle, executed in the census-clean window the
 * standing audit confirmed, the sixth consecutive clean window): every
 * pure-StudyGroups describe in the split source moved here
 * BYTE-FAITHFULLY, declaration order preserved — 2 describes / 3 pins:
 * the S171/DU2 create-dialog parity catch-up + the description
 * round-trip (the "Create Study Group" title, the measured name/
 * description labels + placeholders, the footer DOM order
 * submit-then-secondary, and the create → select → detail-pane
 * description round-trip on the clone's working surface — the
 * reference's own create-to-list flow is BROKEN, measured) and the
 * S176/DZ2 create-dialog + swatch idiom port (the measured labels, the
 * palette geometry, the selected state's white ring). The
 * non-studygroups families stay in parity-session7; the StudyGroups
 * strays outside it (the a11y-sweep /StudyGroups leg, the navigation
 * legs, the parity-session5/8/9 batch homes, the s17-fresh-user
 * zero-data legs, the resilience legs, the mobile-navigation leg) stay
 * in their coverage-axis homes (the S189-S195 boundary precedent — see
 * docs/remediation-plan-session196.md).
 *
 * The pins' contracts (unchanged by the move):
 *  - S171/DU2 WRITES a Date.now-stamped group and self-DELETEs it in a
 *    finally block (zero residue on the shared demo user — the CC4/AR3
 *    convention); S176/DZ2 is READ-ONLY dialog anatomy (never submits).
 *  - CHUNK 2 home (scripts/e2e-chunked-cert.sh) — the SAME chunk as the
 *    split source, so the POST/register budgets hold by construction;
 *    the file sorts 12th in the chunk's alphabetical order
 *    (s14-hardening < studygroups < tasks) — AFTER the split source's
 *    8th position, so the direction-1 immunity proof rides each pin's
 *    own isolation (unique stamps / self-cleanup / read-only anatomy —
 *    the both-directions analysis in the plan §4).
 *  - The full family map: docs/remediation-plan-session196.md.
 */


const hydrated = (page: Page) =>
  page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true");

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
