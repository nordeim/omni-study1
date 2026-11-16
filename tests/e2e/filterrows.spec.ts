import { expect, test, type Page } from "@playwright/test";

/**
 * Filter-row separation family parity pins — the consolidated
 * filterrows home, the FOURTH AXIS home (S198/EV).
 *
 * Split out of parity-session7.spec.ts (the S197 close's named next
 * candidate — the cross-view three-family consolidation, executed in
 * the census-clean window the standing audit confirmed, the eighth
 * consecutive clean window). The family's binding axis is the
 * HEADER-SECOND-ROW + CARD-BORDER + SEARCH-WIDTH chrome, not a view:
 * the one describe covers FIVE views (Exams + Assignments + Tasks +
 * Calendar + Grade Tracker), every pin a port from the s187 reference
 * probes. The block moved here BYTE-FAITHFULLY, declaration order
 * preserved — 1 describe / 7 pins:
 *  - S187/EK the filter-row separation + the sf-card border + the
 *    Tasks search width (the Exams and Assignments headers carry ONLY
 *    the add button — the search + selects render in a SEPARATE row
 *    below; the selects stay 160px at both viewports; the search
 *    inputs ride the pl-10 + text-base md:text-sm face; every
 *    measured sf-card surface carries the slate-100 border with the
 *    Calendar and GradeTracker family staying slate-200; the Tasks
 *    search collapses at mobile + 256px at desktop — all read-only).
 *
 * The non-filterrow families stay in parity-session7; the filter-row
 * strays outside it (the a11y-sweep legs, the s17-fresh-user legs,
 * the files-home toolbar pins) stay in their homes (the S189-S197
 * boundary precedent — see docs/remediation-plan-session198.md).
 *
 * The pins' contracts (unchanged by the move):
 *  - CHUNK 2 home (scripts/e2e-chunked-cert.sh) — the SAME chunk as
 *    the split source, so the write budgets hold by construction (the
 *    family issues ZERO writes); the file sorts 6th in the chunk's
 *    alphabetical order (a11y-sweep, analytics, dialogs, files-except
 *    this file sorts after files and before flashcards) — strictly
 *    FEWER predecessors than the split source's 11th position (the
 *    S194/S195 safe direction).
 *  - The full family map: docs/remediation-plan-session198.md.
 */


const hydrated = (page: Page) =>
  page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true");
const rgb = (r: number, g: number, b: number) => `rgb(${r}, ${g}, ${b})`;



test.describe("S187/EK · the filter-row separation + the sf-card border + the Tasks search width", () => {
  // The S187 measurements (docs/probe-evidence/s187/, three reference
  // probes 2026-11-15, zero residue): the reference's Assignments/Exams
  // headers carry ONLY the add button — the search + selects render in a
  // SEPARATE row below (`flex flex-col md:flex-row gap-4`, selects w-40
  // at BOTH viewports, never full-width); the search inputs ride
  // pl-10 (40px) + text-base md:text-sm (16/14 — the S183 Files
  // convention, now measured on all three views); every measured sf-card
  // surface carries border-slate-100 (rgb(241,245,249)); the Tasks search
  // wrapper is `relative flex-1 md:w-64` (256 desktop / the flex-1
  // collapse at mobile — one-line toolbar).

  test("EK1: the Exams header carries only the Add Exam button (RED pre-fix: the search + select bundled in the toolbar)", async ({ page }) => {
    await page.goto("/Exams");
    await hydrated(page);
    await expect(page.getByRole("heading", { name: "Exams" })).toBeVisible();
    const hdr = (await page.evaluate(`(() => {
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
      const inputs = el.querySelectorAll("input").length;
      const combos = el.querySelectorAll("[role=combobox]").length;
      const buttons = [...el.querySelectorAll("button")].filter((b) => b.getBoundingClientRect().width > 0);
      return { kids: el.children.length, inputs, combos, buttons: buttons.length, btnTexts: buttons.map((b) => (b.textContent || "").trim()) };
    })()`)) as { kids: number; inputs: number; combos: number; buttons: number; btnTexts: string[] } | null;
    expect(hdr).not.toBeNull();
    expect(hdr!.kids).toBe(2); // the h1 block + the add button (the measured 2-kid form)
    expect(hdr!.inputs).toBe(0); // the search lives OUTSIDE the header
    expect(hdr!.combos).toBe(0); // the filter select lives OUTSIDE the header
    expect(hdr!.buttons).toBe(1);
    expect(hdr!.btnTexts[0]).toContain("Add Exam");
  });

  test("EK2: the Exams filter row stacks below the header (RED pre-fix: no filter row — the first sibling is the card grid)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/Exams");
    await hydrated(page);
    await expect(page.getByRole("heading", { name: "Exams" })).toBeVisible();
    const row = (await page.evaluate(`(() => {
      const h1 = document.querySelector("main h1");
      let el = h1 ? h1.parentElement : null;
      for (let i = 0; i < 6 && el; i++) {
        const cs = getComputedStyle(el);
        const ctrl = "button, a, select, input, [role=combobox]";
        const sibling = [...el.children].some((k) => !k.contains(h1) && (k.matches(ctrl) || k.querySelector(ctrl) !== null));
        if (cs.display === "flex" && sibling) break;
        el = el.parentElement;
      }
      const sib = el ? el.nextElementSibling : null;
      if (!sib) return null;
      const s = getComputedStyle(sib);
      return { cls: (sib.className || "").toString(), display: s.display, dir: s.flexDirection, gap: s.gap,
        inputs: sib.querySelectorAll("input").length, combos: sib.querySelectorAll("[role=combobox]").length };
    })()`)) as { cls: string; display: string; dir: string; gap: string; inputs: number; combos: number } | null;
    // The measured filter-row family: flex flex-col md:flex-row gap-4.
    expect(row).not.toBeNull();
    expect(row!.display).toBe("flex");
    expect(row!.dir).toBe("column"); // stacks at mobile (RED pre-fix: the sibling is the card GRID — display grid)
    expect(row!.gap).toBe("16px"); // gap-4
    expect(row!.inputs).toBe(1); // the search
    expect(row!.combos).toBe(1); // the ONE status select
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(400);
    const deskRow = (await page.evaluate(`(() => {
      const h1 = document.querySelector("main h1");
      let el = h1 ? h1.parentElement : null;
      for (let i = 0; i < 6 && el; i++) {
        const cs = getComputedStyle(el);
        const ctrl = "button, a, select, input, [role=combobox]";
        const sibling = [...el.children].some((k) => !k.contains(h1) && (k.matches(ctrl) || k.querySelector(ctrl) !== null));
        if (cs.display === "flex" && sibling) break;
        el = el.parentElement;
      }
      const sib = el ? el.nextElementSibling : null;
      if (!sib) return null;
      const s = getComputedStyle(sib);
      return { dir: s.flexDirection, gap: s.gap };
    })()`)) as { dir: string; gap: string } | null;
    expect(deskRow).not.toBeNull();
    expect(deskRow!.dir).toBe("row"); // md:flex-row
    expect(deskRow!.gap).toBe("16px");
  });

  test("EK3: the Exams select trigger is 160px at both viewports (RED pre-fix: 130px)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/Exams");
    await hydrated(page);
    const trigger = page.locator("[role=combobox]").first();
    await expect(trigger).toBeVisible();
    const mobW = await trigger.evaluate((el) => Math.round(el.getBoundingClientRect().width));
    expect(mobW).toBe(160); // w-40 (RED pre-fix: 130px w-[130px])
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(400);
    const deskW = await trigger.evaluate((el) => Math.round(el.getBoundingClientRect().width));
    expect(deskW).toBe(160); // w-40 at desktop too (never full-width)
  });

  test("EK4: the Assignments selects stay 160px at mobile (RED pre-fix: full-width 358px)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/Assignments");
    await hydrated(page);
    const combos = page.locator("[role=combobox]");
    await expect(combos.first()).toBeVisible();
    expect(await combos.count()).toBe(2); // status + subject
    const ws = await combos.evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().width)));
    expect(ws[0]).toBe(160); // w-40 (RED pre-fix: 358px w-full)
    expect(ws[1]).toBe(160); // w-40
  });

  test("EK5: the search inputs render pl-10 + text-base md:text-sm (RED pre-fix: pl-9 + text-sm)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const readSearch = (page: Page) =>
      page.evaluate(`(() => {
        const input = [...document.querySelectorAll("main input")].find((i) => (i.placeholder || "").toLowerCase().includes("search"));
        if (!input) return null;
        const s = getComputedStyle(input);
        return { pl: s.paddingLeft, fs: s.fontSize };
      })()`);
    for (const view of ["Assignments", "Exams", "Tasks"]) {
      await page.goto(`/${view}`);
      await hydrated(page);
      const mob = (await readSearch(page)) as Record<string, string>;
      expect(mob, `${view} mobile search`).not.toBeNull();
      expect(mob.pl, `${view} mobile padding-left`).toBe("40px"); // pl-10 (RED pre-fix: 36px pl-9)
      expect(mob.fs, `${view} mobile font-size`).toBe("16px"); // text-base (RED pre-fix: 14px)
    }
    await page.setViewportSize({ width: 1280, height: 800 });
    for (const view of ["Assignments", "Exams", "Tasks"]) {
      await page.goto(`/${view}`);
      await hydrated(page);
      const desk = (await readSearch(page)) as Record<string, string>;
      expect(desk.fs, `${view} desktop font-size`).toBe("14px"); // md:text-sm
      expect(desk.pl, `${view} desktop padding-left`).toBe("40px"); // pl-10 holds
    }
  });

  test("EK6: the sf-card border reads slate-100 + the Calendar/GT family stays slate-200 (the measured two-family boundary)", async ({ page }) => {
    // The complete S187 census (probes 2/4/5): the reference's card
    // surfaces split BY VIEW — the Dashboard stat cards + the Timetable
    // trio + the FocusTimer cards carry border-slate-100 (the sf-card
    // utility's family, rgb(241,245,249)); the Calendar cards + the
    // GradeTracker stat cards carry border-slate-200 with NO shadow
    // (their own component classes, the S8-era record re-measured).
    await page.goto("/Dashboard");
    await hydrated(page);
    const statCard = page.locator("main .sf-card").first();
    await expect(statCard).toBeVisible();
    const bc = await statCard.evaluate((el) => getComputedStyle(el).borderTopColor);
    expect(bc).toBe(rgb(241, 245, 249)); // border-slate-100 (RED pre-fix: rgb(226,232,240))
    await page.goto("/Calendar");
    await hydrated(page);
    const monthCard = page.locator('[aria-label="Calendar month"]');
    await expect(monthCard).toBeVisible();
    const calBc = await monthCard.evaluate((el) => getComputedStyle(el).borderTopColor);
    expect(calBc).toBe(rgb(226, 232, 240)); // the slate-200 side of the boundary (the S8 pin's family, re-measured S187)
    const calShadow = await monthCard.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(calShadow).toBe("none"); // the measured no-shadow form (the sf-card shadow-sm retired on this family)
    await page.goto("/GradeTracker");
    await hydrated(page);
    const gtCard = page.locator("[data-testid='gt-stat'], main .rounded-2xl.border-slate-200").first();
    const gtBc = await gtCard.evaluate((el) => getComputedStyle(el).borderTopColor);
    expect(gtBc).toBe(rgb(226, 232, 240)); // the GT stat cards ride the measured slate-200 family
  });

  test("EK7: the Tasks search collapses at mobile + 256px at desktop, one-line toolbar (RED pre-fix: w-48 fixed + 2-line toolbar)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/Tasks");
    await hydrated(page);
    const mob = (await page.evaluate(`(() => {
      const input = [...document.querySelectorAll("main input")].find((i) => (i.placeholder || "").toLowerCase().includes("search"));
      if (!input) return null;
      const wrap = input.closest("div");
      let tb = wrap;
      while (tb && !(getComputedStyle(tb).display === "flex" && getComputedStyle(tb).flexWrap === "wrap")) tb = tb.parentElement;
      return { wrapW: Math.round(wrap.getBoundingClientRect().width), tbH: tb ? Math.round(tb.getBoundingClientRect().height) : null };
    })()`)) as { wrapW: number; tbH: number | null } | null;
    expect(mob).not.toBeNull();
    expect(mob!.wrapW).toBeLessThanOrEqual(130); // the flex-1 collapse (RED pre-fix: 192px w-48)
    expect(mob!.tbH).toBe(36); // ONE line (RED pre-fix: 84 — the wrapped 2-line toolbar)
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(400);
    const desk = (await page.evaluate(`(() => {
      const input = [...document.querySelectorAll("main input")].find((i) => (i.placeholder || "").toLowerCase().includes("search"));
      if (!input) return null;
      const wrap = input.closest("div");
      return { wrapW: Math.round(wrap.getBoundingClientRect().width) };
    })()`)) as { wrapW: number } | null;
    expect(desk).not.toBeNull();
    expect(desk!.wrapW).toBe(256); // md:w-64 (RED pre-fix: 192px)
  });
});
