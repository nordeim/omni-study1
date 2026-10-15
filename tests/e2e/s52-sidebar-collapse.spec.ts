import { expect, test, type Page } from "@playwright/test";

/**
 * Session-52 parity pins — the collapsed-sidebar remediation.
 *
 * The reference shipped a collapsible desktop sidebar since the S19–S51
 * sweeps (re-measured live this session, 2026-10-14, operator account,
 * 1280×800 + 390×844 — see docs/remediation-plan-session52.md):
 *
 *  S52-A the expanded default composite (the untouched state): aside
 *       260px, main ml 260px, 20 labeled links, brand + footer visible.
 *  S52-B the collapse geometry: aside w-20 (80px), main ml-20 (80px) with
 *       the content reflowing (main w 1200 at 1280), icon-only links, the
 *       brand unmounted, the expand chevron INSIDE the header row.
 *  S52-C the collapsed icon alignment: left-aligned px-4 (svg x ≈ 32),
 *       NOT centered.
 *  S52-D the collapsed footer: completely empty (clock + user unmounted).
 *  S52-E the persistence round-trip: the preference survives reload in
 *       both directions (localStorage sf-sidebar-collapsed).
 *  S52-F the mobile drawer SHARES the state: collapsed → 20 icon-only
 *       links in the 288px panel, active gradient present, no trailing
 *       dot; expanded (the default) → labeled (already pinned by the
 *       mobile-navigation spec — not re-pinned here).
 *  S52-G the rotated glyph: the expand chevron's svg carries rotate-180
 *       (chevron-left rotated to point right — the reference's exact
 *       glyph behavior).
 *
 * Contexts arrive AUTHENTICATED (the storageState); each test gets a FRESH
 * context with EMPTY localStorage (the S11 lesson), so every test starts
 * at the default expanded state unless it explicitly collapses.
 */

const hydrated = (page: Page) =>
  page.waitForFunction(() => document.documentElement.style.getPropertyValue("--sf-primary") !== "");

test.describe("S52 · the collapsed-sidebar parity", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test.beforeEach(async ({ page }) => {
    await page.goto("/Dashboard");
    await hydrated(page);
  });

  test("S52-A the expanded default composite (the untouched state)", async ({ page }) => {
    const aside = page.locator("aside");
    await expect(aside).toHaveCSS("width", "260px");
    const main = page.locator("main#main-content");
    await expect(main).toHaveCSS("margin-left", "260px");
    // 20 labeled links.
    const labels = await aside.evaluate((el) =>
      Array.from(el.querySelectorAll("nav a")).filter((a) => (a.textContent ?? "").trim().length > 0),
    );
    expect(labels).toHaveLength(20);
    // Brand + tagline visible; footer clock + user row present.
    await expect(page.getByText("StudyFlow", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Your study companion", { exact: true })).toBeVisible();
    const footer = aside.locator(":scope > div:last-child");
    await expect(footer.getByText(/:/)).toBeVisible(); // the clock time
    await expect(footer.getByText("demo@studyflow.app")).toBeVisible();
  });

  test("S52-B the collapse geometry (aside 80, main reflows, chevron in the header)", async ({ page }) => {
    await page.getByRole("button", { name: "Collapse sidebar" }).click();
    const aside = page.locator("aside");
    await expect(aside).toHaveCSS("width", "80px");
    const main = page.locator("main#main-content");
    await expect(main).toHaveCSS("margin-left", "80px");
    await expect(main).toHaveCSS("width", "1200px");
    // Icon-only links: 20 anchors, zero with text.
    const labeled = await aside.evaluate((el) =>
      Array.from(el.querySelectorAll("nav a")).filter((a) => (a.textContent ?? "").trim().length > 0),
    );
    expect(labeled).toHaveLength(0);
    expect(await aside.locator("nav a").count()).toBe(20);
    // The brand text is unmounted; the tagline is unmounted.
    await expect(page.getByText("Your study companion", { exact: true })).toHaveCount(0);
    // The expand chevron lives INSIDE the header row (the aside's first
    // child) — no separate expand row below the header.
    const expandBtn = page.getByRole("button", { name: "Expand sidebar" });
    await expect(expandBtn).toBeVisible();
    const inHeader = await expandBtn.evaluate((btn) => {
      const aside = document.querySelector("aside")!;
      const header = aside.firstElementChild!;
      return header.contains(btn) && header.querySelector("h1") === null;
    });
    expect(inHeader).toBe(true);
    const asideChildren = await aside.evaluate((el) => el.children.length);
    expect(asideChildren).toBe(3); // header + nav + footer — no extra row
  });

  test("S52-C the collapsed icons stay left-aligned (px-4, svg x ≈ 32)", async ({ page }) => {
    await page.getByRole("button", { name: "Collapse sidebar" }).click();
    const geometry = await page.locator("aside nav a").nth(1).evaluate((a) => {
      const div = a.firstElementChild as HTMLElement;
      const svg = a.querySelector("svg")!;
      const divR = div.getBoundingClientRect();
      const svgR = svg.getBoundingClientRect();
      const cs = getComputedStyle(div);
      return {
        divX: divR.x,
        svgX: svgR.x,
        justify: cs.justifyContent,
        paddingLeft: cs.paddingLeft,
      };
    });
    // nav p-4 (16) + div px-4 (16) → svg x = 32; left-aligned, not centered.
    expect(geometry.svgX).toBeGreaterThanOrEqual(30);
    expect(geometry.svgX).toBeLessThanOrEqual(34);
    expect(geometry.justify).toBe("normal");
    expect(geometry.paddingLeft).toBe("16px");
  });

  test("S52-D the collapsed footer is completely empty", async ({ page }) => {
    await page.getByRole("button", { name: "Collapse sidebar" }).click();
    const footer = await page.locator("aside").evaluate((el) => {
      const f = el.lastElementChild as HTMLElement;
      return {
        childCount: f.children.length,
        text: (f.textContent ?? "").trim(),
        height: Math.round(f.getBoundingClientRect().height),
        borderBottom: getComputedStyle(f).borderTopWidth,
      };
    });
    expect(footer.childCount).toBe(0);
    expect(footer.text).toBe("");
    expect(footer.height).toBe(0);
    // No clock, no avatar text anywhere in the rail.
    await expect(page.locator("aside").getByText("demo@studyflow.app")).toHaveCount(0);
  });

  test("S52-E the preference survives reload in both directions", async ({ page }) => {
    await page.getByRole("button", { name: "Collapse sidebar" }).click();
    await expect(page.locator("aside")).toHaveCSS("width", "80px");
    await page.reload();
    await hydrated(page);
    // Still collapsed after the mount-time localStorage read.
    await expect(page.locator("aside")).toHaveCSS("width", "80px");
    await expect(page.locator("main#main-content")).toHaveCSS("margin-left", "80px");
    // Expand → reload → expanded.
    await page.getByRole("button", { name: "Expand sidebar" }).click();
    await expect(page.locator("aside")).toHaveCSS("width", "260px");
    await page.reload();
    await hydrated(page);
    await expect(page.locator("aside")).toHaveCSS("width", "260px");
    await expect(page.locator("main#main-content")).toHaveCSS("margin-left", "260px");
  });

  test("S52-G the expand glyph is the rotated chevron (rotate-180)", async ({ page }) => {
    await page.getByRole("button", { name: "Collapse sidebar" }).click();
    const svgCls = await page
      .getByRole("button", { name: "Expand sidebar" })
      .locator("svg")
      .evaluate((svg) => svg.getAttribute("class") ?? "");
    expect(svgCls).toContain("rotate-180");
  });
});

test.describe("S52-F · the mobile drawer shares the collapsed state", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("collapsed → the drawer renders icon-only links in the 288px panel", async ({ page }) => {
    // Collapse from the desktop geometry first (the toggle only exists in
    // the ≥lg sidebar), then go mobile on the SAME context so the stored
    // preference rides along.
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/Dashboard");
    await hydrated(page);
    await page.getByRole("button", { name: "Collapse sidebar" }).click();
    await expect(page.locator("aside")).toHaveCSS("width", "80px");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/Dashboard");
    await hydrated(page);
    await page.getByRole("button", { name: "Open navigation menu" }).click();
    const drawer = page.locator('[role="dialog"]');
    await expect(drawer).toBeVisible();
    const panelW = await drawer
      .locator(":scope > div")
      .evaluate((el) => Math.round(el.getBoundingClientRect().width));
    // w-72 = 288 CSS px; fractional layout at the 390px viewport can round
    // to 287 — the standing drawer-check's own <2px tolerance (S14).
    expect(Math.abs(panelW - 288)).toBeLessThan(2);
    const probe = await drawer.evaluate((el) => {
      const links = Array.from(el.querySelectorAll("nav a"));
      const active = links.find((a) => a.getAttribute("aria-current") === "page");
      const activeDiv = active?.firstElementChild as HTMLElement | undefined;
      return {
        linkCount: links.length,
        withText: links.filter((a) => (a.textContent ?? "").trim().length > 0).length,
        activeBg: activeDiv ? getComputedStyle(activeDiv).backgroundImage : "none",
        activeDot: active ? active.querySelectorAll('[class*="rounded-full"]').length : -1,
        activeTitle: active?.getAttribute("title") ?? null,
        activeAria: active?.getAttribute("aria-label") ?? null,
      };
    });
    expect(probe.linkCount).toBe(20);
    expect(probe.withText).toBe(0);
    expect(probe.activeBg).toContain("linear-gradient");
    expect(probe.activeDot).toBe(0);
    // The superset: the icon-only links keep an accessible name.
    expect(probe.activeTitle).toBeTruthy();
    expect(probe.activeAria).toBeTruthy();
    // Drawer auto-close still works from the icon-only state.
    await drawer.locator('nav a[href="/Notes"]').click();
    await expect(drawer).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Notes" })).toBeVisible();
  });

  test("expanded (the default) → the drawer renders labeled links", async ({ page }) => {
    await page.goto("/Dashboard");
    await hydrated(page);
    await page.getByRole("button", { name: "Open navigation menu" }).click();
    const drawer = page.locator('[role="dialog"]');
    await expect(drawer).toBeVisible();
    const withText = await drawer.evaluate((el) =>
      Array.from(el.querySelectorAll("nav a")).filter((a) => (a.textContent ?? "").trim().length > 0).length,
    );
    expect(withText).toBe(20);
  });
});
