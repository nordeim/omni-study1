import { expect, test } from "@playwright/test";

// S13 resilience pins — the AI/upload failure states the happy-path specs
// never exercise. Families from docs/remediation-plan-session13.md:
//   A1  a failed AI send must roll back the optimistic message (bounced back
//       to the composer — the retry affordance) instead of orphaning it
//   A2  a released failure must clear the busy indicator (recovery UX; the
//       120 s timeout MECHANISM is unit-pinned in tests/api-timeout.test.ts)
//   A3  the math solver rejects non-image files client-side (no request)
//   C2  the upload route rejects an empty filename
//   C3  the download Content-Disposition carries the RFC 5987 filename* form

test.describe("AI assistant failure states", () => {
  test("A1: a failed send removes the optimistic message and restores the composer text", async ({ page }) => {
    await page.goto("/AIAssistant");
    await expect(page.getByRole("heading", { name: "AI Study Assistant" })).toBeVisible();

    const composer = page.getByLabel("Message the assistant");
    await composer.fill("resilience probe A1");

    await page.route("**/api/ai/chat", (route) => route.abort("failed"));
    try {
      await composer.press("Enter");
      // The error toast replaces the 6 s window's message; the pin is the
      // composer state once the rejection settles.
      await expect
        .poll(() => composer.inputValue(), { timeout: 5000 })
        .toBe("resilience probe A1");
      // And the optimistic message is REMOVED from the transcript (the
      // composer textarea holding the bounced-back text is NOT a list item).
      await expect(
        page.getByRole("listitem").filter({ hasText: "resilience probe A1" }),
      ).toHaveCount(0);
      // The send button re-enables (busy cleared).
      await expect(page.getByLabel("Send message")).toBeEnabled();
    } finally {
      await page.unroute("**/api/ai/chat");
    }
  });

  test("A2: a slow-then-failing send clears the Thinking indicator and recovers", async ({ page }) => {
    await page.goto("/AIAssistant");
    await expect(page.getByRole("heading", { name: "AI Study Assistant" })).toBeVisible();

    const composer = page.getByLabel("Message the assistant");
    await composer.fill("resilience probe A2");

    let release: ((r: "fail" | "ok") => void) | null = null;
    const gate = new Promise<"fail" | "ok">((resolve) => (release = resolve));
    await page.route("**/api/ai/chat", async (route) => {
      const verdict = await gate;
      if (verdict === "fail") {
        await route.fulfill({
          status: 502,
          contentType: "application/json",
          body: JSON.stringify({ error: "The assistant returned an empty reply. Try again." }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ message: { id: "mock-1", role: "assistant", content: "mock", createdAt: new Date().toISOString() } }),
        });
      }
    });
    try {
      await composer.press("Enter");
      // While held: the busy indicator shows.
      await expect(page.getByText("Thinking…")).toBeVisible();
      // Release with a failure: the indicator must clear and the composer
      // bounce the text back (the A1 rollback composed with recovery).
      release!("fail");
      await expect(page.getByText("Thinking…")).toHaveCount(0, { timeout: 5000 });
      await expect
        .poll(() => composer.inputValue(), { timeout: 5000 })
        .toBe("resilience probe A2");
      await expect(page.getByLabel("Send message")).toBeEnabled();
    } finally {
      release!("ok"); // never leave the gate pending
      await page.unroute("**/api/ai/chat");
    }
  });
});

test.describe("math solver client guard", () => {
  test("A3: picking a non-image file toasts and sends no request", async ({ page }) => {
    await page.goto("/MathSolver");
    await expect(page.getByRole("heading", { name: "Math Solver" })).toBeVisible();

    let solveRequests = 0;
    await page.route("**/api/math/solve", (route) => {
      solveRequests += 1;
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ solution: "1" }) });
    });
    try {
      // Drop a text/plain "image" into the hidden file input.
      await page.setInputFiles('input[type=file][accept="image/*"]', {
        name: "not-an-image.txt",
        mimeType: "text/plain",
        buffer: Buffer.from("just text"),
      });
      // The toast explains the rejection (specific wording — never matches
      // the pre-existing "Upload Image" button label)…
      await expect(page.getByText("Please choose an image file")).toBeVisible({ timeout: 4000 });
      // …and the solver route was never called.
      await page.waitForTimeout(500);
      expect(solveRequests).toBe(0);
    } finally {
      await page.unroute("**/api/math/solve");
    }
  });
});

test.describe("files upload edge cases", () => {
  test("C2: an empty filename upload is rejected with 400", async ({ page }) => {
    await page.goto("/Files");
    await expect(page.getByRole("heading", { name: "Files", exact: true })).toBeVisible();

    const res = await page.evaluate(async () => {
      const form = new FormData();
      form.append("file", new File([new Uint8Array([1, 2, 3])], ""));
      const r = await fetch("/api/files", { method: "POST", body: form, credentials: "same-origin" });
      return { status: r.status, body: await r.json() };
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/name/i);
  });

  test("C3: a unicode filename downloads with the RFC 5987 filename* header", async ({ page }) => {
    await page.goto("/Files");
    await expect(page.getByRole("heading", { name: "Files", exact: true })).toBeVisible();

    const stamp = `resilience-C3-${Date.now()}`;
    const info = await page.evaluate(async (stamp) => {
      const form = new FormData();
      form.append("file", new File([new Uint8Array(8)], `${stamp}-файл.txt`, { type: "text/plain" }));
      const up = await fetch("/api/files", { method: "POST", body: form, credentials: "same-origin" });
      const record = await up.json();
      const dl = await fetch(`/api/files/${record.id}`, { credentials: "same-origin" });
      const disposition = dl.headers.get("content-disposition") || "";
      // Cleanup: delete the row so the suite stays idempotent.
      await fetch(`/api/files/${record.id}`, { method: "DELETE", credentials: "same-origin" });
      return { disposition };
    }, stamp);

    expect(info.disposition).toContain("filename*=UTF-8''");
    expect(info.disposition).toContain(encodeURIComponent(`${stamp}-файл.txt`));
    // The ASCII-safe fallback never carries raw non-ASCII inside the quotes.
    const fallback = info.disposition.match(/filename="([^"]*)"/);
    expect(fallback).not.toBeNull();
    expect(fallback![1]).not.toMatch(/[^\x20-\x7e]/);
  });

  // S81/AH13 (found by the repaired upload-edge audit's C8 probe): the files
  // LIST must carry metadata only — the base64 `data` column belongs to the
  // per-file download endpoint. Every stored ≤2 MiB file otherwise adds
  // ~2.7 MiB of base64 to every list fetch (an unbounded payload as the
  // library grows). The view's link-file distinction rides `url !== null`.
  test("AH13: the file list omits the base64 data column while the per-file download serves it", async ({ page }) => {
    await page.goto("/Files");
    await expect(page.getByRole("heading", { name: "Files", exact: true })).toBeVisible();

    const stamp = `resilience-AH13-${Date.now()}`;
    const info = await page.evaluate(async (stamp) => {
      const form = new FormData();
      form.append("file", new File([new Uint8Array([0x53, 0x46])], `${stamp}.txt`, { type: "text/plain" }));
      const up = await fetch("/api/files", { method: "POST", body: form, credentials: "same-origin" });
      const record = await up.json();
      // The LIST: metadata only — `data` must be absent (undefined), not
      // merely empty. A present-but-null field would still be a contract
      // smell; the stripped column is the design.
      const list = await fetch("/api/files", { credentials: "same-origin" });
      const rows = (await list.json()) as Array<{ id: string; name?: string; data?: unknown; url?: unknown }>;
      const mine = rows.find((r) => r.id === record.id) ?? null;
      // The per-file download still carries the bytes (the C3 contract).
      const dl = await fetch(`/api/files/${record.id}`, { credentials: "same-origin" });
      const dlBody = await dl.text();
      // Cleanup: delete the row so the suite stays idempotent.
      await fetch(`/api/files/${record.id}`, { method: "DELETE", credentials: "same-origin" });
      return {
        listed: !!mine,
        dataAbsent: mine ? !("data" in mine) : false,
        urlNull: mine ? mine.url === null : false,
        dlStatus: dl.status,
        dlHasBytes: dlBody.length > 0,
      };
    }, stamp);

    expect(info.listed).toBe(true);
    expect(info.dataAbsent).toBe(true);
    expect(info.urlNull).toBe(true);
    expect(info.dlStatus).toBe(200);
    expect(info.dlHasBytes).toBe(true);
  });

  // S82/AI6 (the Mode-C audit's I1): the upload POST's 201 response echoed
  // the FULL row including the base64 `data` column — a 2 MiB upload
  // returned a ~2.7 MiB response body (the LIST-side leak AH13 stripped;
  // the create-side echo remained). The create response must carry the
  // same metadata shape as the LIST; the view's FileItemRow.data? already
  // anticipates rows without it, and the per-file download serves the bytes.
  test("AI6: the upload POST response omits the base64 data column while the row lands in the list", async ({ page }) => {
    await page.goto("/Files");
    await expect(page.getByRole("heading", { name: "Files", exact: true })).toBeVisible();

    const stamp = `resilience-AI6-${Date.now()}`;
    const info = await page.evaluate(async (stamp) => {
      const form = new FormData();
      form.append("file", new File([new Uint8Array([0x41, 0x49, 0x36])], `${stamp}.txt`, { type: "text/plain" }));
      const up = await fetch("/api/files", { method: "POST", body: form, credentials: "same-origin" });
      const record = await up.json();
      // The LIST round-trip: the row must still land (metadata shape) and
      // the per-file download must still serve the uploaded bytes.
      const list = await fetch("/api/files", { credentials: "same-origin" });
      const rows = (await list.json()) as Array<{ id: string }>;
      const listed = rows.some((r) => r.id === record.id);
      const dl = await fetch(`/api/files/${record.id}`, { credentials: "same-origin" });
      const dlBody = await dl.text();
      // Cleanup: delete the row so the suite stays idempotent.
      await fetch(`/api/files/${record.id}`, { method: "DELETE", credentials: "same-origin" });
      return {
        upStatus: up.status,
        dataAbsent: !("data" in record),
        urlNull: record.url === null,
        listed,
        dlStatus: dl.status,
        dlHasBytes: dlBody.length > 0,
      };
    }, stamp);

    expect(info.upStatus).toBe(201);
    expect(info.dataAbsent).toBe(true);
    expect(info.urlNull).toBe(true);
    expect(info.listed).toBe(true);
    expect(info.dlStatus).toBe(200);
    expect(info.dlHasBytes).toBe(true);
  });
});
