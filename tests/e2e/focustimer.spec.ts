import { expect, test, type Page } from "@playwright/test";

/**
 * FocusTimer view-family parity pins — the consolidated focustimer
 * home, the 12th VIEW home (S199/EW).
 *
 * Split out of parity-session5.spec.ts (the S198 close's named next
 * candidate — the size-debt adjudication of the remaining
 * coverage-axis files, executed in the census-clean window the standing
 * audit confirmed, the ninth consecutive clean window). The family's
 * binding axis is the FOCUS TIMER VIEW: the stats + ring + play layout
 * and the never-measured chrome half (the panel card, the mode row,
 * the preset cards, the ring interior, the subject select, the control
 * row — first measured 2026-11-15 in LIGHT mode). The blocks moved
 * here BYTE-FAITHFULLY, declaration order preserved — 2 describes /
 * 6 pins:
 *  - S5-E the FocusTimer layout (1 pin: the 3 stat cards, the 256px
 *    ring, the 48px mono time, the 64px gradient play button, the
 *    two-line presets).
 *  - S190 the Focus Timer chrome port (5 pins, Batch EN — the
 *    never-measured half; see docs/remediation-plan-session190.md
 *    section 3.3).
 *
 * The non-FocusTimer families stay in parity-session5 (the S123/BX6
 * and S127/CB1 duration-recording legs — write-behavior hardening
 * coverage, NOT chrome); the FocusTimer strays outside it (the S8-N
 * complete-button leg in parity-session8, the S9-L icons leg in
 * parity-session9) stay in their files (the file-boundary doctrine,
 * the S197 lesson-1; a pin's BATCH TAG is not its family when the pin
 * already has a home — the calculator and AI quick-action legs of
 * Batch EN live with their own families) — see
 * docs/remediation-plan-session199.md.
 *
 * The pins' contracts (unchanged by the move):
 *  - CHUNK 3 home (scripts/e2e-chunked-cert.sh) — the SAME chunk as
 *    the split source, so the write budgets hold by construction (the
 *    family issues ZERO writes); the file sorts 2nd in the chunk's
 *    alphabetical order (events, then focustimer, then
 *    parity-session5) — one ZERO-WRITE predecessor, so the state the
 *    read-only chrome pins observe is byte-identical to the pre-split
 *    exposure (the S194/S195 safe direction, the S198 lesson-2
 *    zero-write collapse).
 *  - The full family map: docs/remediation-plan-session199.md.
 */


const hydrated = (page: Page) =>
  page.waitForFunction(() => document.documentElement.dataset.appHydrated === "true");

test.describe("S5-E · FocusTimer layout", () => {
  test("renders the 3 stat cards, 256px ring, gradient play button and two-line presets", async ({ page }) => {
    await page.goto("/FocusTimer");
    await hydrated(page);
    // Stats: Pomodoros / Today / Sessions.
    await expect(page.getByText("Pomodoros", { exact: true })).toBeVisible();
    await expect(page.getByText("Sessions", { exact: true })).toBeVisible();
    // Ring: 256px box.
    const ring = page.locator(".h-64.w-64, [class*='h-64'][class*='w-64']").first();
    await expect(ring).toBeVisible();
    const ringBox = await ring.boundingBox();
    expect(Math.round(ringBox?.width ?? 0)).toBeGreaterThanOrEqual(255);
    // Time: 48px mono.
    const time = page.getByRole("timer");
    expect(await time.evaluate((el) => getComputedStyle(el).fontSize)).toBe("48px");
    // Play: 64px gradient circle.
    const play = page.getByRole("button", { name: /start timer|resume timer|pause timer/i });
    const playBox = await play.boundingBox();
    expect(Math.round(playBox?.width ?? 0)).toBe(64);
    const playBg = await play.evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(playBg).toContain("linear-gradient");
    expect(playBg).toContain("rgb(79, 70, 229)");
    // Presets: two-line with the durations line.
    await expect(page.getByText("25/5/15")).toBeVisible();
    await expect(page.getByText("50/10/30")).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// S190 · Batch EN — the Focus Timer chrome port (the never-measured half:
// the S5-E port measured the stats/ring/play; the panel card, the mode
// row, the preset cards, the ring interior, the subject select, and the
// control row were first measured 2026-11-15 in LIGHT mode). See
// docs/remediation-plan-session190.md §3.3.
// ---------------------------------------------------------------------------
test.describe("S190 · the Focus Timer chrome port", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/FocusTimer");
    await hydrated(page);
  });

  test("EN8: the timer rides a white rounded-3xl panel on the max-w-2xl column", async ({ page }) => {
    const timer = page.getByRole("timer");
    await expect(timer).toBeVisible();
    const panel = await timer.evaluate((el: HTMLElement) => {
      let node: HTMLElement | null = el;
      while (node) {
        const cls = node.getAttribute("class") || "";
        if (/rounded-3xl/.test(cls)) return { cls: cls.slice(0, 120) };
        node = node.parentElement;
      }
      return null;
    });
    expect(panel).not.toBeNull();
    expect(panel?.cls).toContain("bg-white");
    expect(panel?.cls).toContain("shadow-xl");
    // The column is the measured 672px (max-w-2xl), not the old 448px.
    const colW = await timer.evaluate((el: HTMLElement) => {
      let node: HTMLElement | null = el;
      while (node) {
        const cls = node.getAttribute("class") || "";
        if (/max-w-2xl/.test(cls)) return Math.round(node.getBoundingClientRect().width);
        node = node.parentElement;
      }
      return 0;
    });
    expect(colW).toBeGreaterThanOrEqual(670);
  });

  test("EN9: the mode row is freestanding 36px pills with the gradient active state", async ({ page }) => {
    const focus = page.getByRole("button", { name: /Focus/i, exact: true });
    await expect(focus).toBeVisible();
    const cs = await focus.evaluate((el) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return { h: Math.round(r.height), pad: s.padding, bgImage: s.backgroundImage, color: s.color };
    });
    expect(cs.h).toBe(36); // measured (was 46)
    expect(cs.pad).toBe("8px 16px"); // measured px-4 py-2
    expect(cs.bgImage).toContain("linear-gradient"); // the active pill is the sf-gradient
    expect(cs.color).toBe("rgb(255, 255, 255)");
    // The group container is NOT the old slate-100 pill.
    const group = await focus.evaluate((el) => {
      const parent = el.parentElement;
      const s = parent ? getComputedStyle(parent) : null;
      return parent && s ? { bg: s.backgroundColor, cls: (parent.getAttribute("class") || "").slice(0, 80) } : null;
    });
    expect(group?.bg).toBe("rgba(0, 0, 0, 0)"); // transparent row (measured)
    // An inactive pill is the transparent slate-600 text face.
    const short = page.getByRole("button", { name: "Short Break" });
    const shortCs = await short.evaluate((el) => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, color: s.color, h: Math.round(el.getBoundingClientRect().height) };
    });
    expect(shortCs.bg).toBe("rgba(0, 0, 0, 0)");
    expect(shortCs.color).toBe("rgb(71, 85, 105)"); // slate-600
    expect(shortCs.h).toBe(36);
  });

  test("EN10: the preset cards are the 64px tinted two-line family (name first)", async ({ page }) => {
    const pomo = page.getByRole("button", { name: /Pomodoro/ });
    await expect(pomo).toBeVisible();
    const cs = await pomo.evaluate((el) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return { h: Math.round(r.height), pad: s.padding, bg: s.backgroundColor, color: s.color, border: s.borderWidth };
    });
    expect(cs.h).toBe(64); // measured (was 32)
    expect(cs.pad).toBe("12px 24px"); // measured px-6 py-3
    expect(cs.bg).toBe("rgb(237, 233, 254)"); // the ACTIVE violet-100 tint (measured)
    expect(cs.color).toBe("rgb(109, 40, 217)"); // violet-700
    expect(cs.border).toBe("0px"); // borderless (the old outline Button)
    // The two-line typography: the NAME is the semibold line, the durations the faded xs line.
    const lines = await pomo.evaluate((el) =>
      [...el.querySelectorAll("span, p")].filter((c) => c.textContent.trim()).map((c) => {
        const s = getComputedStyle(c);
        return { text: c.textContent.trim(), fs: s.fontSize, fw: s.fontWeight, op: s.opacity };
      }),
    );
    const name = lines.find((l) => l.text === "Pomodoro");
    const durations = lines.find((l) => l.text === "25/5/15");
    expect(name?.fw).toBe("600"); // font-semibold — the name leads (the clone's pair was inverted)
    expect(durations?.fs).toBe("12px"); // text-xs
    // The inactive preset is the slate-100 tint.
    const deep = page.getByRole("button", { name: /Deep Work/ });
    const deepBg = await deep.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(deepBg).toBe("rgb(241, 245, 249)"); // slate-100 (measured)
  });

  test("EN11: the ring interior carries the brain icon, the mono clock and the capitalize label", async ({ page }) => {
    const timer = page.getByRole("timer");
    await expect(timer).toBeVisible();
    const interior = await timer.evaluate((el) => {
      const holder = el.parentElement;
      const icon = holder ? holder.querySelector("svg.lucide-brain") : null;
      return {
        hasBrain: !!icon,
        clockFont: getComputedStyle(el).fontFamily,
        label: holder && holder.lastElementChild ? holder.lastElementChild.textContent.trim() : null,
        labelCls: holder && holder.lastElementChild ? (holder.lastElementChild.getAttribute("class") || "") : "",
      };
    });
    expect(interior.hasBrain).toBe(true); // the measured lucide-brain w-8 mb-2 violet
    expect(interior.clockFont).toContain("mono"); // font-mono (measured; was tabular-nums)
    expect(interior.labelCls).toContain("capitalize"); // the measured label face
  });

  test("EN12: the subject select is compact with the placeholder; the controls flank the play", async ({ page }) => {
    const select = page.getByRole("combobox");
    await expect(select).toBeVisible();
    const cs = await select.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { w: Math.round(r.width), text: el.textContent.trim() };
    });
    // The measured compact trigger (~192px), never the old full-width 360px.
    expect(cs.w).toBeLessThanOrEqual(260);
    // The placeholder face at no-selection — the measured "Select subject"
    // (the old clone rendered the literal "No subject" option as the value).
    expect(cs.text).toBe("Select subject");
    // The control row: Reset (48px near-black) → play (64px gradient) → Complete (48px near-black).
    const play = page.getByRole("button", { name: /start timer|resume timer|pause timer/i });
    const reset = page.getByRole("button", { name: "Reset timer" });
    const complete = page.getByRole("button", { name: "Complete session" });
    for (const [name, btn] of [["reset", reset], ["complete", complete]] as const) {
      const b = await btn.evaluate((el) => {
        const s = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return { w: Math.round(r.width), bg: s.backgroundColor, radius: s.borderRadius };
      });
      expect(b.w).toBe(48); // the measured near-black round controls
      expect(b.bg).toBe("rgb(10, 10, 10)");
      // fully round (the ref's own serialization reads 9999px; the clone's
      // Tailwind v4 rounded-full computes the infinity clamp — both round)
      expect(parseFloat(b.radius)).toBeGreaterThanOrEqual(9999);
      expect(name).toBeTruthy();
    }
    const playW = await play.evaluate((el) => Math.round(el.getBoundingClientRect().width));
    expect(playW).toBe(64); // the standing measured play — unchanged
    // The order: reset LEFT of play, complete RIGHT of play.
    const xs = await Promise.all(
      [reset, play, complete].map((b) => b.evaluate((el) => Math.round(el.getBoundingClientRect().x))),
    );
    expect(xs[0]).toBeLessThan(xs[1]);
    expect(xs[1]).toBeLessThan(xs[2]);
  });
});
