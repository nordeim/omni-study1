import { expect, test, type Page } from "@playwright/test";

/**
 * MyDay view-family parity pins — the consolidated myday home, the
 * 15th VIEW home (S200/EX).
 *
 * Split out of parity-session8.spec.ts (the S199 close's named next
 * candidate — the size-debt re-adjudication of the remaining
 * coverage-axis files, executed in the census-clean window the standing
 * audit confirmed, the tenth consecutive clean window). The family's
 * binding axis is the MYDAY VIEW: the amber sun header block and
 * the suggestions surface, every pin a computed-style port measured
 * on the live reference (the S8-D header + suggestions describe, 3
 * pins: the 56px amber gradient sun block, the bare suggestions
 * toggle with its rotating chevron, and the bg-slate-50 suggestion
 * rows with circle icons). The block moved
 * here BYTE-FAITHFULLY, declaration order preserved.
 *
 * The other same-view families stay in their files (the file-boundary
 * doctrine, the S197 lesson-1 — see docs/remediation-plan-session200.md
 * for the full boundary ledger).
 *
 * The pins' contracts (unchanged by the move):
 *  - CHUNK 1 home (scripts/e2e-chunked-cert.sh) — the SAME chunk as
 *    the split source, so the write budgets hold by construction (the
 *    family issues ZERO writes); the file sorts STRICTLY BEFORE the
 *    split source in the chunk's alphabetical order — strictly FEWER
 *    predecessors than the pins' old exposure inside parity-session8
 *    (the S194/S195 safe direction).
 *  - The full family map: docs/remediation-plan-session200.md.
 */


const hydrated = (page: Page) =>
  page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true");

const rgb = (r: number, g: number, b: number) => `rgb(${r}, ${g}, ${b})`;

test.describe("S8-D · MyDay header + suggestions", () => {
  test("header carries the 56px amber gradient sun block", async ({ page }) => {
    await page.goto("/MyDay");
    await hydrated(page);
    const block = page.locator('[aria-label="My Day header block"]');
    const cs = await block.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return {
        w: Math.round(r.width),
        h: Math.round(r.height),
        radius: s.borderRadius,
        bg: s.backgroundImage,
        shadow: s.boxShadow,
      };
    });
    expect(cs.w).toBe(56);
    expect(cs.h).toBe(56);
    expect(cs.radius).toBe("16px");
    expect(cs.bg).toContain("rgb(251, 191, 36)"); // amber-400
    expect(cs.bg).toContain("rgb(249, 115, 22)"); // orange-500
    expect(cs.shadow).toContain("rgba(245, 158, 11, 0.3)");
  });

  test("suggestions is a bare toggle button (sparkles + rotating chevron)", async ({ page }) => {
    await page.goto("/MyDay");
    await hydrated(page);
    const toggle = page.locator('button[aria-controls="my-day-suggestions"]');
    await expect(toggle).toBeVisible();
    const cs = await toggle.evaluate((el) => {
      const s = getComputedStyle(el);
      return { color: s.color };
    });
    expect(cs.color).toBe(rgb(100, 116, 139));
    // The label SPAN carries text-sm font-medium (the button inherits base).
    const label = toggle.locator("span");
    const labelCs = await label.evaluate((el) => {
      const s = getComputedStyle(el);
      return { size: s.fontSize, weight: s.fontWeight };
    });
    expect(labelCs.size).toBe("14px");
    expect(labelCs.weight).toBe("500");
    await expect(toggle.locator("svg.lucide-sparkles")).toHaveCount(1);
    // No card chrome around the section.
    const section = toggle.locator("..");
    const secBg = await section.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(secBg).toBe("rgba(0, 0, 0, 0)");
  });

  test("suggestion rows are bg-slate-50 rounded-xl with circle icons", async ({ page }) => {
    await page.goto("/MyDay");
    await hydrated(page);
    // S122/BW1: the pre-fix body hid behind non-retrying `if (await …count())`
    // guards taken right after hydrated() — when the view hadn't mounted
    // yet the whole test passed vacuously (the false-PASS variant of the
    // BU9 class). The sibling test's toBeVisible() flow gates instead; the
    // demo user's tasks guarantee the suggestions section renders.
    const toggle = page.locator('button[aria-controls="my-day-suggestions"]');
    await expect(toggle).toBeVisible();
    const expanded = await toggle.getAttribute("aria-expanded");
    if (expanded !== "true") await toggle.click();
    const row = page.locator('[aria-label="Suggested tasks"] > div').first();
    await expect(row).toBeVisible();
    const cs = await row.evaluate((el) => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, radius: s.borderRadius, pad: s.padding };
    });
    expect(cs.bg).toBe(rgb(248, 250, 252)); // slate-50
    expect(cs.radius).toBe("12px");
    expect(cs.pad).toBe("12px");
    await expect(row.locator("svg.lucide-circle").first()).toBeVisible();
  });
});
