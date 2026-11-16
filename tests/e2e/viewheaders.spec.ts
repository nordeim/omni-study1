import { expect, test, type Page } from "@playwright/test";

/**
 * View-header row family parity pins — the consolidated viewheaders
 * home, the THIRD AXIS home (S198/EV).
 *
 * Split out of parity-session7.spec.ts (the S197 close's named next
 * candidate — the cross-view three-family consolidation, executed in
 * the census-clean window the standing audit confirmed, the eighth
 * consecutive clean window). The family's binding axis is the
 * view-header ROW ARRANGEMENT, not a view: the one describe covers
 * SIX views (Tasks + Timetable + Files + Dashboard + Exams +
 * Calculator), every pin a header-stacking port from the s186
 * all-20-view reference census (1440x900 + 390x844). The block moved
 * here BYTE-FAITHFULLY, declaration order preserved — 1 describe /
 * 6 pins — with its describe-scoped rowOf ancestor-walk helper:
 *  - S186/EJ the view-header row family (the toolbar views stack the
 *    toolbar BELOW the h1 at mobile — column, 16px gap — and row at
 *    desktop with items-center; the Calculator header stays a row at
 *    mobile, items-center; the Tasks 2-kid restructure + mb-6 rider —
 *    all read-only computed-style asserts).
 *
 * The auth primary-CTA family in tests/e2e/auth.spec.ts carries the
 * SAME S186/EJ batch tag but is a DIFFERENT family (the auth-button
 * anatomy, its own home — the file-boundary doctrine). The
 * non-viewheader families stay in parity-session7; the header strays
 * outside it (the a11y-sweep legs, the mobile-navigation legs, the
 * dark-mode washes) stay in their coverage-axis homes (the S189-S197
 * boundary precedent — see docs/remediation-plan-session198.md).
 *
 * The pins' contracts (unchanged by the move):
 *  - CHUNK 2 home (scripts/e2e-chunked-cert.sh) — the SAME chunk as
 *    the split source, so the write budgets hold by construction (the
 *    family issues ZERO writes); the file sorts 19th — LAST — in the
 *    chunk's alphabetical order, the S196 after-position direction:
 *    every EJ pin is a read-only computed-style assert on view CHROME
 *    that does not depend on any predecessor's data state (immune by
 *    construction), and the family leaves NOTHING behind (zero
 *    writes) for any later file to see.
 *  - The full family map: docs/remediation-plan-session198.md.
 */


const hydrated = (page: Page) =>
  page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true");



// ---------------------------------------------------------------------------
// S186/EJ — the view-header ROW family (Batch EJ, the S186 cycle). The
// reference's toolbar-carrying headers measured `flex flex-col md:flex-row
// md:items-center justify-between gap-4` — at mobile the toolbar STACKS
// BELOW the h1 block (column, 16px gap); at desktop a row (items-center).
// The clone's flex-wrap rows (the S78/AE9-AE12 records) wrapped the
// toolbar INSIDE a row and reflowed at sm (640) not md (768). Evidence:
// docs/probe-evidence/s186/ref-header-rows.json (all 20 views censused at
// 1440x900 + 390x844, 2026-11-15).
// ---------------------------------------------------------------------------
test.describe("S186/EJ · the view-header row family (mobile-stacked)", () => {
  // The ancestor walk: from the h1, up to the nearest flex container that
  // carries a toolbar (button/select/input) — the view-header row.
  const rowOf = () => `(() => {
    const h1 = document.querySelector("main h1");
    let el = h1 ? h1.parentElement : null;
    for (let i = 0; i < 6 && el; i++) {
      const cs = getComputedStyle(el);
      const ctrl = "button, a, select, input, [role=combobox]";
      const sibling = [...el.children].some((k) => !k.contains(h1) && (k.matches(ctrl) || k.querySelector(ctrl) !== null));
      if (cs.display === "flex" && sibling) break;
      el = el.parentElement;
    }
    if (!el) return null;
    const s = getComputedStyle(el);
    const r = { dir: s.flexDirection, gap: s.gap, items: s.alignItems, wrap: s.flexWrap, cls: (el.className || "").toString(), toolbarGap: null };
    const second = el.children[1];
    if (second) { const sc = getComputedStyle(second); if (sc.display === "flex") r.toolbarGap = sc.gap; }
    return r;
  })()`;

  test("EJ4: the Tasks header stacks its toolbar below the h1 at mobile and rows at desktop (RED pre-fix: flex-wrap row + gap 12px)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/Tasks");
    await hydrated(page);
    const header = page.locator("[aria-label='Tasks header']");
    await expect(header).toBeVisible();
    const mob = await header.evaluate((el) => {
      const s = getComputedStyle(el);
      return { dir: s.flexDirection, gap: s.gap };
    });
    expect(mob.dir).toBe("column"); // the stacked form
    expect(mob.gap).toBe("16px"); // gap-4
    // The h1 block is the FIRST child; the toolbar (search/filter/Add Task) stacks below.
    const kids = await header.evaluate((el) => [...el.children].map((k) => k.tagName));
    expect(kids.length).toBe(2); // h1-block + toolbar (the measured 2-kid form)
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(400);
    const desk = await header.evaluate((el) => {
      const s = getComputedStyle(el);
      return { dir: s.flexDirection, items: s.alignItems, mb: s.marginBottom };
    });
    expect(desk.dir).toBe("row"); // md:flex-row
    expect(desk.items).toBe("center"); // md:items-center
    expect(desk.mb).toBe("24px"); // mb-6 (the measured Tasks rider)
  });

  test("EJ5: the Timetable header stacks + the toolbar gap reads 12px (RED pre-fix: row + 8px)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/Timetable");
    await hydrated(page);
    await expect(page.getByRole("heading", { name: "Timetable" })).toBeVisible();
    const mob = (await page.evaluate(rowOf())) as Record<string, string | null>;
    expect(mob.dir).toBe("column");
    expect(mob.gap).toBe("16px");
    expect(mob.toolbarGap).toBe("12px"); // gap-3 — the measured toolbar family
  });

  test("EJ6: the Files header stacks at mobile (RED pre-fix: ViewHeader row-always)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/Files");
    await hydrated(page);
    await expect(page.getByRole("heading", { name: "Files", exact: true })).toBeVisible();
    const mob = (await page.evaluate(rowOf())) as Record<string, string | null>;
    expect(mob.dir).toBe("column");
    expect(mob.gap).toBe("16px");
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(400);
    const desk = (await page.evaluate(rowOf())) as Record<string, string | null>;
    expect(desk.dir).toBe("row");
    expect(desk.items).toBe("center");
  });

  test("EJ7: the Dashboard greeting header stacks at mobile (RED pre-fix: flex-wrap)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/Dashboard");
    await hydrated(page);
    await expect(page.getByRole("heading", { name: /Good (morning|afternoon|evening)/ })).toBeVisible();
    const mob = (await page.evaluate(rowOf())) as Record<string, string | null>;
    expect(mob.dir).toBe("column");
    expect(mob.gap).toBe("16px");
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(400);
    const desk = (await page.evaluate(rowOf())) as Record<string, string | null>;
    expect(desk.dir).toBe("row");
  });

  test("EJ8: the Exams header stacks at mobile (RED pre-fix: row-always)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/Exams");
    await hydrated(page);
    await expect(page.getByRole("heading", { name: "Exams" })).toBeVisible();
    const mob = (await page.evaluate(rowOf())) as Record<string, string | null>;
    expect(mob.dir).toBe("column");
    expect(mob.gap).toBe("16px");
  });

  test("EJ9: the Calculator header stays a row at mobile, items-center (RED pre-fix: items-start + flex-wrap)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/Calculator");
    await hydrated(page);
    await expect(page.getByRole("heading", { name: "Calculator Suite" })).toBeVisible();
    const mob = (await page.evaluate(rowOf())) as Record<string, string | null>;
    expect(mob.dir).toBe("row"); // the row family — Calculator never stacks
    expect(mob.items).toBe("center"); // items-center (was items-start)
    expect(mob.wrap).toBe("nowrap"); // the wrap retired
  });
});
