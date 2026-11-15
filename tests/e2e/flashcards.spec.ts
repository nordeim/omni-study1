import { expect, test, type Page } from "@playwright/test";

/**
 * Flashcards-family parity pins — the consolidated flashcards home (S191/EO).
 *
 * Split out of parity-session7.spec.ts (the S189 close's named candidate,
 * twice deferred by the blast-radius rule — S190's behavior-change axis,
 * this cycle's clean window): every pure-flashcards describe moved here
 * BYTE-FAITHFULLY, declaration order preserved — 11 describes / 18 pins,
 * the S7-A founding set (deck sidebar, deck detail + card grid, study
 * mode) through the S125/BZ1 Add Card dialog. The non-flashcards families
 * stay in parity-session7; the two strays outside it (S167/DQ1 in
 * parity-session8, S9-O in parity-session9) stay in their session-lineage
 * homes (the S189 boundary precedent — see §6.3 of the plan).
 *
 * The pins' contracts (unchanged by the move):
 *  - SEED-ANCHORED: every pin starts page.goto("/Flashcards") +
 *    hydrated() and creates/cleans up its own probe decks (the
 *    zero-residue doctrine — the API-created decks ride finally deletes);
 *    the S7-A/S7-AD fixtures ride the SEED (prisma/seed.ts: "Integration
 *    rules" [the 4-card calculus deck], "Biology Chapter 5" [3 cards],
 *    "Spanish Vocabulary" [2 cards]), never another spec's residue.
 *  - CHUNK 2 home (scripts/e2e-chunked-cert.sh) — the file list order
 *    runs this file directly after parity-session7: the SAME chunk as
 *    before the split, so the budget posture and the after-neighbor
 *    timelines are unchanged; the family issues NO /api/upload POSTs.
 *  - The full family map: docs/remediation-plan-session191.md.
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
