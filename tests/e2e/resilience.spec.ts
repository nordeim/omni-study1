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

  // S119/BT11 — a failed note-TITLE rename surfaces the once-per-streak
  // toast (it was a fully silent .catch before: offline renames were
  // invisible data loss, contradicting the view's own autosave contract).
  test("S119/BT11: a failed title PATCH toasts the title-specific message once per streak", async ({ page }) => {
    await page.goto("/Notes");
    await expect(page.getByRole("heading", { name: "Notes" })).toBeVisible();
    // select a seeded note (the row button carries the note title)
    await page.getByRole('button', { name: /Dot product intuition/ }).click();
    const title = page.getByLabel("Note title");
    await expect(title).toBeVisible();
    // Kill the item PATCHes (the collection GET stays live — the abort
    // pattern routes only the per-id path).
    await page.route("**/api/notes/*", (route) => route.abort("failed"));
    try {
      await title.fill("resilience probe BT11");
      // The abort maps to the S14 offline ApiError, whose message wins
      // (the same instance-message precedence as the content autosave).
      await expect(page.getByText("You appear to be offline. Reconnect and try again — your last action was not saved.")).toBeVisible();
      // the SECOND burst in the same failure streak stays silent (one
      // toast per streak — the S78/AE2 mechanism)
      await title.fill("resilience probe BT11 again");
      await page.waitForTimeout(400);
      await expect(page.getByText("You appear to be offline. Reconnect and try again — your last action was not saved.")).toHaveCount(1);
    } finally {
      await page.unroute("**/api/notes/*");
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

  // S83/AJ1 (the Mode-C audit's L3 — the AI1 lesson's follow-through):
  // `folderDelegate.update` was the seventeenth hand-written PATCH write
  // site, outside the sentKeysPatch convention (safe today ONLY because
  // folderUpdateSchema carries no .default()s — the exact AH8 data-loss
  // preconditions minus the defaults). The pin guards the contract at the
  // LAST uncovered site: a folder rename (a partial PATCH that sends ONLY
  // the name) must never clear its parentId, and an empty PATCH must be a
  // 200 no-op that changes nothing (verified against the resolved Prisma runtime (6.19.3 at the S84 re-probe; the ^6.11.1 range): an
  // empty data object is ACCEPTED as a no-op — updatedAt not bumped — so
  // the short-circuit and the raw call agree).
  test("AJ1: a folder rename preserves the parent and an empty PATCH is a no-op", async ({ page }) => {
    await page.goto("/Files");
    await expect(page.getByRole("heading", { name: "Files", exact: true })).toBeVisible();

    const stamp = `resilience-AJ1-${Date.now()}`;
    const info = await page.evaluate(async (stamp) => {
      // A parent folder, then a child inside it.
      const parent = await fetch("/api/files/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ name: `${stamp}-parent` }),
      });
      const parentRow = await parent.json();
      const child = await fetch("/api/files/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ name: `${stamp}-child`, parentId: parentRow.id }),
      });
      const childRow = await child.json();
      // The rename: a partial PATCH that sends ONLY the name key.
      const rename = await fetch(`/api/files/folders/${childRow.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ name: `${stamp}-renamed` }),
      });
      const renamed = await rename.json();
      // The empty PATCH: must answer 200 and change nothing.
      const empty = await fetch(`/api/files/folders/${childRow.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({}),
      });
      const emptyRow = await empty.json();
      // The LIST round-trip: the child's parent survives the rename.
      const tree = await fetch("/api/files/folders", { credentials: "same-origin" });
      const rows = (await tree.json()) as Array<{ id: string; parentId: string | null }>;
      const listed = rows.find((r) => r.id === childRow.id);
      // Cleanup: delete the child, then the parent.
      await fetch(`/api/files/folders/${childRow.id}`, { method: "DELETE", credentials: "same-origin" });
      await fetch(`/api/files/folders/${parentRow.id}`, { method: "DELETE", credentials: "same-origin" });
      return {
        childStatus: child.status,
        renameStatus: rename.status,
        renamedName: renamed.name,
        renamedParentPreserved: renamed.parentId === parentRow.id,
        emptyStatus: empty.status,
        emptyNameUnchanged: emptyRow.name === `${stamp}-renamed`,
        emptyParentPreserved: emptyRow.parentId === parentRow.id,
        listedParentPreserved: listed?.parentId === parentRow.id,
      };
    }, stamp);

    expect(info.childStatus).toBe(201);
    expect(info.renameStatus).toBe(200);
    expect(info.renamedName).toBe(`${stamp}-renamed`);
    expect(info.renamedParentPreserved).toBe(true);
    expect(info.emptyStatus).toBe(200);
    expect(info.emptyNameUnchanged).toBe(true);
    expect(info.emptyParentPreserved).toBe(true);
    expect(info.listedParentPreserved).toBe(true);
  });

  test("AK1a: a folder cannot be re-parented into itself", async ({ page }) => {
    await page.goto("/Files");
    await expect(page.getByRole("heading", { name: "Files", exact: true })).toBeVisible();

    const stamp = `resilience-AK1a-${Date.now()}`;
    const info = await page.evaluate(async (stamp) => {
      const mk = (name: string, parentId?: string) =>
        fetch("/api/files/folders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify(parentId ? { name, parentId } : { name }),
        });
      const folder = await (await mk(`${stamp}-folder`)).json();
      // Self-parenting: the folder becomes its own parent.
      const self = await fetch(`/api/files/folders/${folder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ parentId: folder.id }),
      });
      const selfBody = await self.json().catch(() => null);
      const tree = await (await fetch("/api/files/folders", { credentials: "same-origin" })).json() as Array<{ id: string; parentId: string | null }>;
      const listed = tree.find((r) => r.id === folder.id);
      await fetch(`/api/files/folders/${folder.id}`, { method: "DELETE", credentials: "same-origin" });
      return {
        selfStatus: self.status,
        selfParentUnchanged: listed?.parentId === null,
        selfBodyHasError: typeof selfBody?.error === "string",
      };
    }, stamp);

    // The guard: 400 + the row unchanged (RED pre-AK1: 200 + parentId === own id).
    expect(info.selfStatus).toBe(400);
    expect(info.selfParentUnchanged).toBe(true);
    expect(info.selfBodyHasError).toBe(true);
  });

  test("AK1b: a two-step A→B→A cycle is rejected at the second step", async ({ page }) => {
    await page.goto("/Files");
    await expect(page.getByRole("heading", { name: "Files", exact: true })).toBeVisible();

    const stamp = `resilience-AK1b-${Date.now()}`;
    const info = await page.evaluate(async (stamp) => {
      const mk = (name: string, parentId?: string) =>
        fetch("/api/files/folders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify(parentId ? { name, parentId } : { name }),
        });
      const a = await (await mk(`${stamp}-a`)).json();
      const b = await (await mk(`${stamp}-b`, a.id)).json();
      // B lives inside A. Now move A under B — closing the A→B→A cycle.
      const cycle = await fetch(`/api/files/folders/${a.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ parentId: b.id }),
      });
      await cycle.json().catch(() => null);
      const tree = await (await fetch("/api/files/folders", { credentials: "same-origin" })).json() as Array<{ id: string; parentId: string | null }>;
      const listedA = tree.find((r) => r.id === a.id);
      const listedB = tree.find((r) => r.id === b.id);
      await fetch(`/api/files/folders/${b.id}`, { method: "DELETE", credentials: "same-origin" });
      await fetch(`/api/files/folders/${a.id}`, { method: "DELETE", credentials: "same-origin" });
      return {
        cycleStatus: cycle.status,
        aParentUnchanged: listedA?.parentId === null,
        bParentUnchanged: listedB?.parentId === a.id,
      };
    }, stamp);

    // The guard: 400 + BOTH rows unchanged (RED pre-AK1: the second PATCH
    // is 200 and the tree contains the cycle that wedges the Files view).
    expect(info.cycleStatus).toBe(400);
    expect(info.aParentUnchanged).toBe(true);
    expect(info.bParentUnchanged).toBe(true);
  });

  test("AK1c: a valid re-parent into an unrelated folder succeeds", async ({ page }) => {
    await page.goto("/Files");
    await expect(page.getByRole("heading", { name: "Files", exact: true })).toBeVisible();

    const stamp = `resilience-AK1c-${Date.now()}`;
    const info = await page.evaluate(async (stamp) => {
      const mk = (name: string) =>
        fetch("/api/files/folders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ name }),
        });
      const target = await (await mk(`${stamp}-target`)).json();
      const mover = await (await mk(`${stamp}-mover`)).json();
      // The valid re-parent: mover (a root folder) moves into target (an
      // unrelated root folder — no cycle, both exist, neither is itself).
      const move = await fetch(`/api/files/folders/${mover.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ parentId: target.id }),
      });
      const moved = await move.json();
      const tree = await (await fetch("/api/files/folders", { credentials: "same-origin" })).json() as Array<{ id: string; parentId: string | null }>;
      const listed = tree.find((r) => r.id === mover.id);
      await fetch(`/api/files/folders/${mover.id}`, { method: "DELETE", credentials: "same-origin" });
      await fetch(`/api/files/folders/${target.id}`, { method: "DELETE", credentials: "same-origin" });
      return {
        moveStatus: move.status,
        movedParentSet: moved.parentId === target.id,
        listedParentSet: listed?.parentId === target.id,
      };
    }, stamp);

    // The happy path the guard must NOT break.
    expect(info.moveStatus).toBe(200);
    expect(info.movedParentSet).toBe(true);
    expect(info.listedParentSet).toBe(true);
  });

  test("AK1d: re-parenting into a nonexistent folder answers 404", async ({ page }) => {
    await page.goto("/Files");
    await expect(page.getByRole("heading", { name: "Files", exact: true })).toBeVisible();

    const stamp = `resilience-AK1d-${Date.now()}`;
    const info = await page.evaluate(async (stamp) => {
      const folder = await (
        await fetch("/api/files/folders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ name: `${stamp}-folder` }),
        })
      ).json();
      const bogus = await fetch(`/api/files/folders/${folder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ parentId: "nonexistent-parent-id" }),
      });
      await bogus.json().catch(() => null);
      const tree = await (await fetch("/api/files/folders", { credentials: "same-origin" })).json() as Array<{ id: string; parentId: string | null }>;
      const listed = tree.find((r) => r.id === folder.id);
      await fetch(`/api/files/folders/${folder.id}`, { method: "DELETE", credentials: "same-origin" });
      return {
        bogusStatus: bogus.status,
        parentUnchanged: listed?.parentId === null,
      };
    }, stamp);

    // The existing 404 contract — pinned (the audit's L3: this branch had
    // zero coverage before AK1).
    expect(info.bogusStatus).toBe(404);
    expect(info.parentUnchanged).toBe(true);
  });

  // S120/BU1 — the FolderDialog key-remount. The dialog's state initializes
  // from props ONCE ("parent key-remount" per its own comment) but the
  // parent never passed a key: the Rename dialog opened with the PREVIOUS
  // session's name (live-reproduced: create A, create B, Rename A → the
  // input shows B; Save silently renames A to B — a data hazard). The fix
  // is the sibling idiom (key={open ? `open-${folder?.id ?? "new"}`}).
  // The pin drives the REAL UI flow — the API-level AJ1 pin above cannot
  // see the dialog's prefilled state.
  test("S120/BU1: the Rename dialog prefills the TARGET folder's name, not the previous session's", async ({ page }) => {
    await page.goto("/Files");
    await expect(page.getByRole("heading", { name: "Files", exact: true })).toBeVisible();
    const stamp = `resilience-BU1-${Date.now()}`;
    const created: string[] = [];
    try {
      // Create two folders through the API (fast, and the dialog flow
      // under test is the RENAME, not the create).
      const ids = await page.evaluate(async (names: string[]) => {
        const out: string[] = [];
        for (const name of names) {
          const res = await fetch("/api/files/folders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify({ name }),
          });
          if (res.ok) out.push(((await res.json()) as { id: string }).id);
        }
        return out;
      }, [`${stamp}-alpha`, `${stamp}-beta`]);
      expect(ids.length).toBe(2);
      created.push(...ids);
      await page.reload();
      await expect(page.getByRole("heading", { name: "Files", exact: true })).toBeVisible();

      // Open Rename on ALPHA (the FIRST created) — the dialog must show
      // ALPHA's name, not BETA's (the most recent session's state).
      await page.getByRole("button", { name: `Rename ${stamp}-alpha` }).click();
      const dlg = page.getByRole("dialog");
      await expect(dlg).toBeVisible();
      await expect(dlg.getByRole("heading", { name: "Rename Folder" })).toBeVisible();
      const input = dlg.getByLabel("Name");
      await expect(input).toHaveValue(`${stamp}-alpha`);
      await page.keyboard.press("Escape");
      await expect(dlg).toHaveCount(0);

      // The fresh New Folder dialog opens EMPTY (not carrying the last
      // session's typed value).
      await page.getByRole("button", { name: "New Folder" }).click();
      const createDlg = page.getByRole("dialog");
      await expect(createDlg).toBeVisible();
      await expect(createDlg.getByRole("heading", { name: "New Folder" })).toBeVisible();
      await expect(createDlg.getByLabel("Name")).toHaveValue("");
      await page.keyboard.press("Escape");
    } finally {
      for (const id of created) {
        await page.evaluate(async (fid) => {
          await fetch(`/api/files/folders/${fid}`, { method: "DELETE", credentials: "same-origin" });
        }, id);
      }
    }
  });
});

// S121/BV1 — the events single-leg ordering merge, at the WIRE.
//
// The unit seam is pinned with string fixtures; this pin covers the WIRING
// (the delegate passes the STORED Prisma row — Date objects — to the seam).
// The first live probe caught the string-only form silently skipping: the
// PATCH below wrote the inverted span pre-fix.
test.describe("S121/BV1: the events single-leg ordering merge", () => {
  test("a single-leg endDate PATCH earlier than the stored startDate is rejected at the API", async ({ request }) => {
    const stamp = `${Date.now()}`;
    const created = await request.post("/api/events", {
      data: {
        title: `E2E — BV1 ordering probe ${stamp}`,
        startDate: "2026-11-02T09:00:00",
        endDate: "2026-11-02T10:00:00",
      },
    });
    expect(created.ok()).toBe(true);
    const { id } = (await created.json()) as { id: string };
    try {
      // The single-leg inversion (endDate alone, earlier than the stored start).
      const inverted = await request.patch(`/api/events/${id}`, {
        data: { endDate: "2026-11-02T08:00:00" },
      });
      expect(inverted.status()).toBe(400);
      expect((await inverted.json()) as { error?: string }).toMatchObject({
        error: "End date must be after the start date",
      });
      // The other direction: startDate alone, later than the stored end.
      const invertedStart = await request.patch(`/api/events/${id}`, {
        data: { startDate: "2026-11-02T12:00:00" },
      });
      expect(invertedStart.status()).toBe(400);
      // The legal single-leg move passes.
      const legal = await request.patch(`/api/events/${id}`, {
        data: { endDate: "2026-11-02T11:00:00" },
      });
      expect(legal.ok()).toBe(true);
    } finally {
      await request.delete(`/api/events/${id}`);
    }
  });
});

// S122/BW11 — the two 413 wire guards were unpinned: no test ever posted an
// over-cap upload or an over-cap import (only the shared reader's unit pin
// and an 11 MiB LOGIN post covered the reader itself; the routes' own caps
// and copies could regress green). Request-level pins, no UI.
test.describe("S122/BW11: the over-cap 413 contracts", () => {
  test("an upload past the 2 MiB envelope answers 413 with the files copy", async ({ request }) => {
    // The route's envelope math: 2 MiB + 64 KiB (the multipart overhead
    // allowance) — one byte over is the boundary-exact probe.
    const overCap = 2 * 1024 * 1024 + 64 * 1024 + 1;
    const res = await request.post("/api/files", {
      multipart: {
        file: {
          name: "bw11-over-cap.bin",
          mimeType: "application/octet-stream",
          buffer: Buffer.alloc(overCap, 65),
        },
      },
    });
    expect(res.status()).toBe(413);
    expect((await res.json()) as { error?: string }).toMatchObject({
      error: "Files are limited to 2 MiB.",
    });
  });

  test("an import past the 64 MiB cap answers 413 with the MiB copy (the JSON content-type passes the BR5 gate first)", async ({ request }) => {
    // S124/BY3 re-anchor: the cap moved 10 → 25 MiB (the export/import
    // reconciliation — the export emits base64 file payloads inline, so the
    // old cap rejected ~4-5 max-size uploads' worth of the user's OWN
    // backup). S137/CL2 re-tag: 25 → 64 MiB — the BY3-era "~18 max-size
    // files at 25 MiB" arithmetic was ~2x off (a 2 MiB upload inflates to
    // 2,796,204 base64 chars; 25 MiB covers ~9.4 files), so a user with
    // 10+ near-cap files downloaded a backup their own in-app restore
    // then 413'd. 64 MiB covers ~23 — the realistic round-trip with
    // margin. 64 MiB + 1 byte of JSON — the cap fires at the body read,
    // before parsing. Content-Type must be application/json (the BR5 gate
    // runs before the cap and would otherwise answer a misleading 400).
    const res = await request.post("/api/import/data", {
      headers: { "content-type": "application/json" },
      data: "x".repeat(64 * 1024 * 1024 + 1),
    });
    expect(res.status()).toBe(413);
    const body = (await res.json()) as { error?: string };
    expect(body.error).toContain("64 MiB");
  });

  // S144/CS5 (audit B-L2): the byte cap bounds the BODY, not the parsed
  // object tree — a 64 MiB envelope of minimal rows parses into ~10⁶ row
  // objects (several hundred MB resident per hostile request, no
  // deadline). The row-count ceiling (100,000 — pinned in
  // tests/data-import.test.ts, census-pinned in script-conventions)
  // bounds the amplification at the cheapest post-parse point. Rides
  // the demo session (the file's demo import POSTs now total 9/10 —
  // the S146/CU4 recount: this leg was tallied "4 → 5/10" at landing
  // but the CS5 POST was the 9th demo POST, not the 5th; the header
  // arithmetic is census-pinned in script-conventions).
  test("an import past the row cap answers 413 with the rows copy (the parse-memory amplification bound)", async ({ request }) => {
    const folders = Array.from({ length: 100_001 }, (_, i) => ({
      id: `s144-rowcap-${i}`,
      name: "F",
    }));
    const res = await request.post("/api/import/data", {
      headers: { "content-type": "application/json" },
      data: {
        format: "studyflow-data-export",
        version: 1,
        exportedAt: "2026-11-05T00:00:00.000Z",
        counts: {},
        data: { folders },
      },
    });
    expect(res.status()).toBe(413);
    const body = (await res.json()) as { error?: string };
    expect(body.error).toContain("100,000");
    expect(body.error).toContain("rows");
  });
});

// S144/CS1 (audit A-M1) — the appearance pickers' sequence-CAS was
// structurally defeated at the call sites: createFetchSeq() ran in the
// AppearanceCard FUNCTION BODY, so every render minted fresh seq
// instances — each pick's ticket was 1 on its OWN instance, isCurrent
// degraded to always-true, and the guard was the unconditional S127/
// CB15 rollback again (the ABA CR5 claimed to close; the S142
// different-value protection regressed with it). The behavioral pin —
// the route-interception idiom this file already carries: the FIRST
// preference PATCH settles LAST and fails; a NEWER pick made in between
// must survive the stale failure. The interception isolates the DB (the
// PATCHes never reach the server — no cleanup, no write budget).
test.describe("S144/CS1: the appearance-picker sequence CAS (the instance-scoped form)", () => {
  test("a late-failing preference PATCH must not roll back a newer accent pick (the ABA)", async ({ page }) => {
    await page.goto("/Settings");
    const blue = page.getByRole("button", { name: "Blue accent" });
    await expect(blue).toBeVisible();

    let calls = 0;
    await page.route("**/api/settings/preferences", async (route) => {
      calls += 1;
      if (calls === 1) {
        // The FIRST pick's PATCH settles LAST and fails — the stale
        // failure window (a ~700 ms in-flight lag is the realistic
        // shape; the pre-fix catch sees isCurrent(1) === true on its
        // own fresh-instance seq and rolls the store back to the
        // PRE-pick value, clobbering the newer pick).
        await page.waitForTimeout(700);
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "late failure (S144/CS1 probe)" }),
        });
      } else {
        await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
      }
    });
    try {
      await blue.click(); // pick 1 — Blue (PATCH1 in flight, will fail late)
      await page.getByRole("button", { name: "Green accent" }).click(); // pick 2 — Green (PATCH2 → 200)
      // Wait PAST the first PATCH's late failure settling.
      await page.waitForTimeout(1600);
      // The newer pick's optimism survives the stale failure — RED
      // pre-fix: the stale catch rolled the store back to VIOLET (the
      // pre-pick value), un-pressing Green.
      await expect(page.getByRole("button", { name: "Green accent" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      await expect(page.getByRole("button", { name: "Violet accent" })).toHaveAttribute(
        "aria-pressed",
        "false",
      );
      await expect(page.getByRole("button", { name: "Blue accent" })).toHaveAttribute(
        "aria-pressed",
        "false",
      );
    } finally {
      await page.unroute("**/api/settings/preferences");
    }
  });
});

// S145/CT1 (audit B-M1) — the focus timer's completion window re-armed
// from its own terminal state: after the auto-completion fired,
// mode stayed "focus" and remaining stayed 0 until the save POST's
// .then landed; in that window — and indefinitely after a FAILED save
// (the catch only toasts) — the Start button was enabled (no disabled
// prop; only Complete carried it) and complete() had no saving guard,
// so a Play press at 00:00 re-fired the completion effect and POSTed
// another createFocusSession with durationSeconds = durations.focus
// (the FULL nominal duration from zero elapsed time — the phantom
// session; a double-log inside the in-flight window). The secondary
// face is the ABA class itself: the save's late .then (setMode/
// setRemaining) clobbered any newer mode pick made during the window.
// Both legs ride the route-interception idiom — the POSTs never reach
// the server (no rows, no cleanup, no write budget); the follow-up
// collection GETs pass through (reads only).
test.describe("S145/CT1: the focus-timer completion window (the terminal state must not re-arm)", () => {
  test("a Play press through the in-flight save + a failed save never double-logs; the failure re-latches for a fresh session", async ({ page }) => {
    // The fake clock drives the countdown to 00:00 (the only honest way
    // to reach the completion window — the pomodoro is 25 real minutes).
    await page.clock.install({ time: new Date("2026-11-05T10:00:00Z") });
    await page.goto("/FocusTimer");
    await expect(page.getByRole("heading", { name: "Focus Timer" })).toBeVisible();

    let posts = 0;
    await page.route("**/api/focus-sessions", async (route) => {
      if (route.request().method() !== "POST") {
        // The follow-up collection GET (fetchAndSet) passes through.
        await route.continue();
        return;
      }
      posts += 1;
      if (posts === 1) {
        // The FIRST (real, elapsed-full-duration) POST settles LAST and
        // fails — the completion window opens at dispatch and stays open
        // past the failure until the re-latch.
        await page.waitForTimeout(700);
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "late failure (S145/CT1 probe)" }),
        });
      } else {
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({ ok: true }),
        });
      }
    });
    try {
      const start = page.getByRole("button", { name: "Start timer" });
      const clock = page.getByRole("timer");
      await start.click();
      // Drive the full pomodoro countdown to 00:00 — the completion
      // effect fires, POST#1 goes in flight (delayed failure).
      await page.clock.runFor(25 * 60 * 1000);
      // Real-time slack for the React flush + the 0ms settle timer.
      await page.waitForTimeout(500);
      // THE COMPLETION WINDOW: the Start button is disabled (the CT1b
      // affordance — RED pre-fix: enabled, the phantom's primary entry).
      await expect(start).toBeDisabled();
      // ...and past the late failure's settle:
      await page.waitForTimeout(1200);
      // Exactly ONE POST through the whole window (RED pre-fix: a Play
      // press at 00:00 re-fires complete() — the phantom double-log).
      expect(posts).toBe(1);
      // The failure toast + THE RE-LATCH: the clock reads 25:00 again —
      // a fresh session, never the phantom entry at 00:00 (RED pre-fix:
      // the catch only toasted; remaining stayed 0 forever). The toast
      // surfaces the server's error-body message (the apiSend extraction
      // — the probe's marker text, not the generic fallback).
      await expect(page.getByText("late failure (S145/CT1 probe)")).toBeVisible();
      await expect(clock).toHaveText("25:00");
      // The retry press starts a REAL session — running, no new POST
      // (RED pre-fix: running=true at remaining===0 re-fires the
      // completion effect → POST#2 with durationSeconds: 1500).
      await start.click();
      await expect(page.getByRole("button", { name: "Pause timer" })).toBeVisible();
      await page.waitForTimeout(400);
      expect(posts).toBe(1);
    } finally {
      await page.unroute("**/api/focus-sessions");
    }
  });

  test("a late-settling save must not clobber a newer mode pick (the settle-CAS)", async ({ page }) => {
    await page.goto("/FocusTimer");
    await expect(page.getByRole("heading", { name: "Focus Timer" })).toBeVisible();

    let posts = 0;
    await page.route("**/api/focus-sessions", async (route) => {
      if (route.request().method() !== "POST") {
        await route.continue();
        return;
      }
      posts += 1;
      // Every POST settles late AND SUCCEEDS — the ABA shape: the late
      // .then's mode switch must respect a newer pick made in between.
      await page.waitForTimeout(700);
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      });
    });
    try {
      const start = page.getByRole("button", { name: "Start timer" });
      await start.click();
      // ~1s of real elapsed time so the early-complete is a real session.
      await page.waitForTimeout(1100);
      // The manual early-complete (elapsed-duration POST#1, in flight).
      await page.getByRole("button", { name: "Complete session" }).click();
      // DURING the in-flight save: a NEWER mode pick — Long Break.
      await page.getByRole("button", { name: "Long Break" }).click();
      // Wait PAST the late settle.
      await page.waitForTimeout(1600);
      // The newer pick survives the late success — RED pre-fix: the
      // stale .then clobbered mode to short-break (Long Break
      // un-pressed, Short Break pressed, the clock reset to 05:00).
      await expect(page.getByRole("button", { name: "Long Break" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      await expect(page.getByRole("button", { name: "Short Break" })).toHaveAttribute(
        "aria-pressed",
        "false",
      );
      await expect(page.getByRole("timer")).toHaveText("15:00");
      expect(posts).toBe(1);
    } finally {
      await page.unroute("**/api/focus-sessions");
    }
  });
});

// S124/BY3 — the export/import size reconciliation's ACCEPTANCE leg. The
// between-caps envelope: a small valid task + padding in an UNKNOWN field —
// Zod strip mode drops the key at parse (verified: zero .strict() in the
// schemas), so the BYTES count for the cap while the written row stays
// small. Pre-fix the 10 MiB cap 413'd everything between 10 and 25 MiB.
test.describe("S124/BY3: the between-caps import acceptance", () => {
  test("a valid ~12 MiB envelope imports (RED pre-fix: 413 at the old 10 MiB cap)", async ({ request }) => {
    const envelope = {
      format: "studyflow-data-export",
      version: 1,
      exportedAt: "2026-11-01T00:00:00.000Z",
      // The padding rides the envelope's USER block — the documented
      // IGNORED block ("content only, never identity": the parse reads
      // format/version/data and never touches user), so the BYTES count
      // at the capped read while the written row stays small. (The first
      // pad design put it in an unknown ROW field — sanitizeImportRow caps
      // EVERY string field incl. unknowns, the BR1 guard, so the row leg
      // 400'd; the byte-count mechanism at the read is shape-independent,
      // so the RED reason (413 at 10 MiB) is unchanged.)
      user: {
        id: "u-by3",
        email: "by3@probe.dev",
        name: "BY3 Probe",
        pad: "x".repeat(12 * 1024 * 1024),
      },
      counts: {},
      data: {
        tasks: [
          {
            id: "by3-between-caps-task",
            title: "BY3 between-caps probe",
            createdAt: "2026-11-01T00:00:00.000Z",
            updatedAt: "2026-11-01T00:00:00.000Z",
          },
        ],
      },
    };
    const res = await request.post("/api/import/data", { data: envelope });
    expect(res.status()).toBe(200); // RED pre-fix: 413
    const body = (await res.json()) as { imported: Record<string, { created: number; updated: number }> };
    expect(body.imported.tasks.created).toBe(1);

    // Zero residue (the AM1/AN1 finally-cleanup convention).
    const cleanup = await request.delete(`/api/tasks/${envelope.data.tasks[0].id}`);
    expect([200, 204]).toContain(cleanup.status());
  });
});

// ---------------------------------------------------------------------------
// S135/CJ4+CJ5 (audits A-L2 + A-L5) — the import 400-message contract's
// two degraded/unpinned paths. CJ4: a NEW-branch cards row with deckId
// MISSING sailed both FK guards (the seam's undefined early-continue + the
// route's typeof-string guard) and died as PrismaClientValidationError →
// the GENERIC "fields do not match" message — the ADR-021 actionable-
// message contract silently degraded for that one hand-crafted shape; the
// route now names the field. CJ5: the PrismaClientValidationError → 400
// mapping itself (the route's last line of defense for "never 500 for bad
// input") had NO wire-level pin — a wrong-typed KNOWN field (title: 42, a
// primitive that survives the seam's type guard) exercises exactly that
// fallback. The pins ride the DEMO session (the BY3 pattern — the 400
// message shape is account-independent, the guards fire before any
// user-specific write; the demo import budget carries 9/10 in this chunk
// — the S146/CU4 recount; one slot free, and the s23 family's 10 live in
// chunk 5's separate process). The first draft
// lived in s23 with fresh TEST-NET registrations — wasted (the file-level
// storageState put the POSTs on the demo session anyway) and fatal to the
// chunk-5 registerGlobal: 40 cap; the relocation is the fix.
// ---------------------------------------------------------------------------
test.describe("S135/CJ4+CJ5 the import 400-message contract (the demo session, the BY3 pattern)", () => {
  test("CJ4: a new-branch cards row MISSING deckId → the NAMED 400 (RED pre-fix: the generic fields-do-not-match)", async ({ request }) => {
    const evil = {
      format: "studyflow-data-export",
      version: 1,
      exportedAt: "2026-11-01T00:00:00.000Z",
      user: { id: "u-cj4", email: "cj4@probe.dev", name: "CJ4 Probe" },
      counts: {},
      data: {
        decks: [{ id: "cj4-deck", name: "CJ4 Deck", createdAt: "2026-09-01T00:00:00.000Z" }],
        cards: [
          {
            id: "cj4-card",
            // deckId ABSENT — the create branch cannot satisfy the required FK.
            front: "front",
            back: "back",
            createdAt: "2026-09-01T00:00:00.000Z",
          },
        ],
      },
    };
    const res = await request.post("/api/import/data", { data: evil });
    expect(res.status()).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toContain("deckId");
    expect(body.error).toContain("cj4-card");
  });

  test("CJ5: a wrong-typed KNOWN field (title: 42) → 400 fields-do-not-match — the PrismaClientValidationError mapping's wire pin (coverage: the mapping exists untested)", async ({ request }) => {
    const evil = {
      format: "studyflow-data-export",
      version: 1,
      exportedAt: "2026-11-01T00:00:00.000Z",
      user: { id: "u-cj5", email: "cj5@probe.dev", name: "CJ5 Probe" },
      counts: {},
      data: {
        subjects: [],
        tasks: [
          {
            id: "cj5-task",
            title: 42 as unknown as string, // a primitive — survives the seam's type guard
            createdAt: "2026-09-01T00:00:00.000Z",
          },
        ],
      },
    };
    const res = await request.post("/api/import/data", { data: evil });
    expect(res.status()).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toContain("fields do not match");
  });
});

// S124/BY5 — the export-family limiter. The two heaviest enumerations
// (export/data: 20 tables + base64 payloads + the fragment-streamed
// serialization [S156/DE1 — was "the full in-memory JSON.stringify"];
// rum/export: 2000 rows → CSV) answered unlimited GETs
// while every other write/enumeration family is budgeted (the S14
// posture). One shared per-user key `export:${user.id}` 10/15-min — the
// ai: shared-key precedent; the family shape is the pin (exhausting one
// route 429s the sibling).
test.describe("S124/BY5: the export-family limiter", () => {
  test("10 export GETs then the 11th 429s with Retry-After, and the family budget covers rum/export (RED pre-fix: 200s)", async ({ request }) => {
    for (let i = 0; i < 10; i++) {
      const r = await request.get("/api/export/data");
      expect(r.status()).toBe(200);
    }
    const r11 = await request.get("/api/export/data");
    expect(r11.status()).toBe(429); // RED pre-fix: 200
    expect(r11.headers()["retry-after"]).toBeTruthy();

    // The sibling on the same family key — also 429 (one budget, both routes).
    const csv = await request.get("/api/rum/export");
    expect(csv.status()).toBe(429); // RED pre-fix: 200
  });
});

// S122/BW7 — the timetable single-leg ordering merge at the wire (the
// events BV1 pin's sibling). The create schema rejects the inverted span;
// the single-leg PATCH merges against the STORED row — including the
// SEED's unpadded legacy hours ("9:00"), which a raw string compare would
// misread ("11:00" < "9:00" lexicographically, rejecting every legal move).
test.describe("S122/BW7: the timetable single-leg ordering merge", () => {
  test("an inverted create is rejected; the single-leg PATCH merges against the stored row", async ({ request }) => {
    const stamp = `${Date.now()}`;
    // The inverted create → 400 with the ordering copy.
    const inverted = await request.post("/api/timetable", {
      data: {
        name: `BW7 inverted ${stamp}`,
        dayOfWeek: 1,
        startTime: "10:00",
        endTime: "09:00",
        subjectId: null,
        room: "",
        weekType: "ALL",
      },
    });
    expect(inverted.status()).toBe(400);

    // The legal create → 201; then the single-leg inversions both ways.
    const created = await request.post("/api/timetable", {
      data: {
        name: `BW7 probe ${stamp}`,
        dayOfWeek: 1,
        startTime: "09:00",
        endTime: "10:00",
        subjectId: null,
        room: "",
        weekType: "ALL",
      },
    });
    expect(created.ok()).toBe(true);
    const { id } = (await created.json()) as { id: string };
    try {
      const earlyEnd = await request.patch(`/api/timetable/${id}`, { data: { endTime: "08:00" } });
      expect(earlyEnd.status()).toBe(400);
      expect((await earlyEnd.json()) as { error?: string }).toMatchObject({
        error: "End time must be after the start time",
      });
      const lateStart = await request.patch(`/api/timetable/${id}`, { data: { startTime: "11:00" } });
      expect(lateStart.status()).toBe(400);
      const legal = await request.patch(`/api/timetable/${id}`, { data: { endTime: "11:30" } });
      expect(legal.ok()).toBe(true);
    } finally {
      await request.delete(`/api/timetable/${id}`);
    }
  });
});

// S123/BX1 — the both-legs half of the timetable ordering guard at the
// wire. The S122/BW7 wire pin above covers the SINGLE-leg merge; the
// schema-level both-legs path compared raw strings, so the UNPADDED legal
// span ("9:00" → "11:00" — the seeded shape) 400'd (wire-verified
// pre-fix) while the INVERTED padded/unpadded mix ("09:00" → "8:30")
// persisted (201). Both legs now compare minutes.
test.describe("S123/BX1: the both-legs timetable ordering at the wire", () => {
  test("the unpadded legal span creates; the inverted mix 400s", async ({ request }) => {
    const stamp = Date.now();
    // The legal unpadded span — pre-fix this was the false 400.
    const legal = await request.post("/api/timetable", {
      data: {
        name: `BX1 legal ${stamp}`,
        dayOfWeek: 3,
        startTime: "9:00",
        endTime: "11:00",
        subjectId: null,
        room: "",
        weekType: "ALL",
      },
    });
    expect(legal.status()).toBe(201);
    const { id } = (await legal.json()) as { id: string };
    try {
      // The both-legs PATCH with the inverted mix — pre-fix this
      // persisted (the "8:30" > "09:00" lexicographic bypass).
      const inverted = await request.patch(`/api/timetable/${id}`, {
        data: { startTime: "09:00", endTime: "8:30" },
      });
      expect(inverted.status()).toBe(400);
      // The both-legs path rejects at the SCHEMA (the Zod message carries
      // the field prefix — "endTime: …"); the single-leg merge above
      // rejects at the delegate with the bare copy. Same words, two
      // enforcement sites.
      expect(((await inverted.json()) as { error?: string }).error ?? "").toContain(
        "End time must be after the start time",
      );
      // The both-legs legal move with unpadded hours still succeeds.
      const move = await request.patch(`/api/timetable/${id}`, {
        data: { startTime: "10:00", endTime: "12:30" },
      });
      expect(move.ok()).toBe(true);
    } finally {
      await request.delete(`/api/timetable/${id}`);
    }
    // And the inverted CREATE stays rejected.
    const bad = await request.post("/api/timetable", {
      data: {
        name: `BX1 inverted ${stamp}`,
        dayOfWeek: 3,
        startTime: "09:00",
        endTime: "8:30",
        subjectId: null,
        room: "",
        weekType: "ALL",
      },
    });
    expect(bad.status()).toBe(400);
  });
});

// S123/BX5 — the folder routes' parentId carried a DEAD ""→null transform:
// idField's min(1) rejected "" BEFORE the transform, so the app's own
// clear-to-root convention (every other entity FK via the shared
// nullableId atom) 400'd at the folder routes. The routes now consume the
// shared atom.
test.describe("S123/BX5: the folder parentId clear-to-root at the wire", () => {
  test("creating a folder with parentId \"\" lands at the root (201, not 400)", async ({ request }) => {
    const stamp = Date.now();
    const created = await request.post("/api/files/folders", {
      data: { name: `BX5 root ${stamp}`, parentId: "" },
    });
    expect(created.status()).toBe(201);
    const { id } = (await created.json()) as { id: string };
    const row = (await (await request.get("/api/files/folders")).json()) as {
      id: string;
      parentId: string | null;
    }[];
    expect(row.find((r) => r.id === id)?.parentId).toBeNull();
    await request.delete(`/api/files/folders/${id}`);
    const after = (await (await request.get("/api/files/folders")).json()) as { id: string }[];
    expect(after.some((r) => r.id === id)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// S132/CG5 — the boot data-failure surface (docs/remediation-plan-session132.md,
// the BT12 residual closed).
//
// The s132 audit's M5: a boot where the pre-warm AND the background
// loadAll BOTH fail left every view in false empty states ("No tasks
// yet" on data that simply never loaded) with NO error surface and NO
// retry — the Splash had already lifted (a failed pre-warm never blocks
// the shell, ADR-014) and the loadAll rejection vanished into the bare
// .catch(() => {}). The fix tracks the first loadAll result: a failure
// renders a non-blocking bottom-center bar (the connectivity-banner
// family — role="alert", amber, z-[70]) with honest copy and a Retry
// that re-runs loadAll and clears the bar on success.
//
// The pin: every /api/* route EXCEPT /api/auth/me aborts (the
// authenticated boot with a dead data plane — the gate itself succeeds
// so the Splash lifts), the shell commits, the bar appears; then the
// routes unroute, Retry re-runs loadAll, and the bar clears. Pre-CG5:
// the shell commits into silent false-empty states — the bar never
// renders (RED).
// ---------------------------------------------------------------------------
test.describe("S132/CG5 · the boot data-failure surface", () => {
  test("a dead data plane at boot surfaces the failure bar, and Retry heals it (RED pre-fix: silent false-empty states)", async ({ page }) => {
    await page.route("**/api/*", (route) => {
      const url = new URL(route.request().url());
      if (url.pathname === "/api/auth/me") return route.continue();
      return route.abort("failed");
    });
    try {
      await page.goto("/Dashboard");
      // The gate itself succeeded (/api/auth/me passed) — the shell
      // commits even though every data route is dead.
      await page.waitForFunction(
        () => document.documentElement.dataset.appHydrated === "true",
        undefined,
        { timeout: 30_000 },
      );
      // The failure bar: role="alert", honest copy, a Retry affordance.
      const bar = page.getByRole("alert").filter({ hasText: /couldn't load/i });
      await expect(bar).toBeVisible({ timeout: 15_000 });
      await expect(bar.getByRole("button", { name: "Retry" })).toBeVisible();
    } finally {
      await page.unroute("**/api/*");
    }

    // The heal: Retry re-runs loadAll over the now-live routes and the
    // bar clears on success.
    await page.getByRole("alert").filter({ hasText: /couldn't load/i }).getByRole("button", { name: "Retry" }).click();
    await expect(
      page.getByRole("alert").filter({ hasText: /couldn't load/i }),
    ).toHaveCount(0, { timeout: 15_000 });
    // And the data actually arrived — the KPI row renders real counts
    // (the false-empty state healed, not just the bar dismissed).
    await expect(page.getByText("Today's Progress")).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// S132/CG6 — the CE3 gate sweep, Settings leg (docs/remediation-plan-session132.md).
//
// The s130 CE3 sweep gated eight sibling views' empty states on
// s.loading; the s132 audit found four more: the Settings Subjects and
// Holidays tabs, the Analytics stat row (false zero-stats on in-flight
// data), and the Calendar empty messages. The pin holds the Settings
// view's own pre-warmed /api/subjects GET stalled (the accepted-TCP
// shape within the 20 s window — the S129/CD2 deadline releases the
// gate), then asserts the Subjects tab renders the loading branch while
// the collection is in flight. Pre-CG6: the FALSE "No subjects yet"
// renders live (RED).
// ---------------------------------------------------------------------------
test.describe("S132/CG6 · the Settings loading gates", () => {
  test("an in-flight subjects GET renders the Subjects tab loading branch, never the false 'No subjects yet' empty state (RED pre-fix)", async ({ page }) => {
    const HELD = "**/api/subjects";
    await page.route(HELD, () => {
      /* never fulfills — the accepted-TCP stall shape (within the 20 s window) */
    });
    try {
      // /Settings pre-warms subjects + holidays — the held subjects fetch
      // holds the Splash until the CD2 deadline (~20 s) releases it; the
      // background loadAll's subjects fetch is STILL held, so the tab
      // renders with s.loading true and an empty collection.
      await page.goto("/Settings");
      await page.waitForFunction(
        () => document.documentElement.dataset.appHydrated === "true",
        undefined,
        { timeout: 35_000 },
      );
      await page.getByRole("tab", { name: "Subjects" }).click();
      await expect(page.getByRole("heading", { level: 2, name: "Subjects" })).toBeVisible();
      // The in-flight window: the loading branch owns the tab pane, the
      // false empty state renders NOWHERE.
      await expect(page.getByText("No subjects yet")).toHaveCount(0);
      await expect(page.locator(".animate-spin").first()).toBeVisible();
    } finally {
      // The S13/S14 lesson: unroute held routes in finally.
      await page.unroute(HELD);
    }
  });
});

// ---------------------------------------------------------------------------
// S136/CK4 (audits B-M1/M2) — the CE3 residual gates: the dashboard's
// section cards and the gradetracker's summary grid render FALSE
// empty-states/zeros during in-flight loads (the S132/CG6 class at the
// sites the CG6 sweep missed). Same idiom as the CG6 Settings leg: a held
// never-fulfilling route, the hydrated wait (the held pre-warm collection
// holds the Splash until the CD2 deadline releases it), then the in-flight
// window assertions.
// ---------------------------------------------------------------------------
test.describe("S136/CK4: the CE3 residual gates (dashboard + gradetracker legs)", () => {
  test("an in-flight assignments/exams load renders the dashboard section gates, never the false 'No upcoming exams'/'No upcoming assignments' (RED pre-fix)", async ({ page }) => {
    const HELD_A = "**/api/assignments";
    const HELD_E = "**/api/exams";
    await page.route(HELD_A, () => {
      /* never fulfills — the accepted-TCP stall shape */
    });
    await page.route(HELD_E, () => {
      /* never fulfills */
    });
    try {
      // The dashboard pre-warms tasks+assignments+exams+focusSessions+
      // subjects — the held pair holds the Splash until the CD2 deadline
      // (~20 s), then the app commits with both collections still loading.
      await page.goto("/Dashboard");
      await page.waitForFunction(
        () => document.documentElement.dataset.appHydrated === "true",
        undefined,
        { timeout: 35_000 },
      );
      // The in-flight window: the section-card gates own the cards — the
      // false empty states render NOWHERE.
      await expect(page.getByText("No upcoming exams")).toHaveCount(0);
      await expect(page.getByText("No upcoming assignments")).toHaveCount(0);
      await expect(page.locator(".animate-spin").first()).toBeVisible();
    } finally {
      await page.unroute(HELD_A);
      await page.unroute(HELD_E);
    }
  });

  test("an in-flight grades load renders the gradetracker summary gate, never the false '0%' zero row (RED pre-fix)", async ({ page }) => {
    const HELD = "**/api/grades";
    await page.route(HELD, () => {
      /* never fulfills */
    });
    try {
      // The gradetracker pre-warms grades+subjects — the held grades fetch
      // holds the Splash until the CD2 deadline, then commits with the
      // summary grid still loading (the OR-form gate: either primary
      // source empty during load owns the row).
      await page.goto("/GradeTracker");
      await page.waitForFunction(
        () => document.documentElement.dataset.appHydrated === "true",
        undefined,
        { timeout: 35_000 },
      );
      // The in-flight window: the summary gate owns the grid — the settled
      // zero-state copy ("Overall Average") renders NOWHERE while loading.
      await expect(page.getByText("Overall Average")).toHaveCount(0);
      await expect(page.locator(".animate-spin").first()).toBeVisible();
    } finally {
      await page.unroute(HELD);
    }
  });
});

// ---------------------------------------------------------------------------
// S137/CL1 (audit B-M1) — the timetable equal-times import asymmetry. The
// interactive boundary (hhmmEndBeforeStart) rejects only endMin < startMin:
// a zero-length 09:00–09:00 class is creatable through the API and
// persists — but the import seam rejected endTime <= startTime, so ONE such
// row in an export bricked the ENTIRE all-or-nothing restore with a message
// blaming a row the app itself minted. The wire pin proves the asymmetry
// live (the create 200s), then the round-trip on that very row. Rides the
// DEMO session's request (chunk 3's import budget now totals 9/10 — the
// S146/CU4 recount; no fresh registrations — chunk 5's register census
// stays untouched).
// ---------------------------------------------------------------------------
test.describe("S137/CL1: the timetable equal-times import symmetry (the round-trip contract)", () => {
  test("a zero-length class the API itself admits round-trips through the import (RED pre-fix: the restore 400s on the app's own row)", async ({ request }) => {
    // 1. The interactive boundary ADMITS the zero-length class — the
    // asymmetry proven live at the wire (the route's schema rejects only
    // strict inversion). 201 — the collection-POST convention.
    const create = await request.post("/api/timetable", {
      data: { name: "CL1 zero-length probe", dayOfWeek: 1, startTime: "09:00", endTime: "09:00" },
    });
    expect(create.status()).toBe(201);
    const row = (await create.json()) as { id: string; createdAt: string; updatedAt: string };

    // 2. The export→import round-trip on that SAME row: the envelope
    // carrying it restores clean (pre-fix: 400 'field "endTime" must be
    // after "startTime"' — the all-or-nothing rollback of the whole
    // restore for one legally-created row).
    const envelope = {
      format: "studyflow-data-export",
      version: 1,
      exportedAt: new Date().toISOString(),
      counts: {},
      data: {
        timetableClasses: [
          {
            id: row.id,
            name: "CL1 zero-length probe",
            dayOfWeek: 1,
            startTime: "09:00",
            endTime: "09:00",
            room: "",
            weekType: "ALL",
            subjectId: null,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
          },
        ],
      },
    };
    const res = await request.post("/api/import/data", { data: envelope });
    expect(res.status()).toBe(200); // RED pre-fix: 400
    const body = (await res.json()) as { imported: Record<string, { created: number; updated: number }> };
    expect(body.imported.timetableClasses.updated).toBe(1);

    // 3. Zero residue (the AM1/AN1 finally-cleanup convention).
    const cleanup = await request.delete(`/api/timetable/${row.id}`);
    expect([200, 204]).toContain(cleanup.status());
  });
});

// ---------------------------------------------------------------------------
// S137/CL7 (Mode-C audit F4) — the analytics OR-form stat gate. The CK4
// widening left this one site in the AND-form: with five of the six
// pre-warmed families landed and assignments in flight, the AND was false
// and the stat row rendered its false "0" Assignments card — the exact
// mixed-landing zero the widening claimed to fix. The OR-form (the
// gradetracker doctrine: any primary source empty while loading owns the
// row) is the fix. Same held-route idiom as the CK4 legs.
// ---------------------------------------------------------------------------
test.describe("S137/CL7: the analytics OR-form stat gate (the mixed-landing false zero)", () => {
  test("an in-flight assignments load renders the stat gate, never the false '0' Assignments stat (RED pre-fix)", async ({ page }) => {
    const HELD = "**/api/assignments";
    await page.route(HELD, () => {
      /* never fulfills — the accepted-TCP stall shape */
    });
    try {
      // The analytics pre-warms six stat families — the held assignments
      // fetch holds the Splash until the CD2 deadline, then the app
      // commits with the OTHER five landed and assignments still loading
      // (the mixed-landing state where the AND-form rendered the false
      // "0" Assignments card).
      await page.goto("/Analytics");
      await page.waitForFunction(
        () => document.documentElement.dataset.appHydrated === "true",
        undefined,
        { timeout: 35_000 },
      );
      // The in-flight window: the OR-form gate owns the stat row — the
      // group renders NOWHERE (pre-fix: visible with the false zero).
      await expect(page.locator('[aria-label="Analytics stats"]')).toHaveCount(0);
      await expect(page.locator(".animate-spin").first()).toBeVisible();
    } finally {
      await page.unroute(HELD);
    }
  });
});

// ---------------------------------------------------------------------------
// S138/CM2 (audit FE-1) — the dashboard KPI stat row's OR-form gate. The
// 4-stat KPI row is fed by TWO collections (tasks → 3 stats;
// focusSessions → the Focus Time card), but the gate tested only
// `tasks.length === 0` — the exact mixed-landing shape the S137/CL7
// doctrine was written for: booting anywhere whose pre-warm excludes
// focusSessions, then navigating to /Dashboard while the background
// focusSessions GET is in flight rendered a false "0h" Focus Time (up to
// the 20 s GET deadline on a stalled transport). The wire pin holds ONLY
// /api/focus-sessions (the other four dashboard families resolve) — the
// pre-fix gate passed on tasks and the false zero rendered; the OR-form
// owns the row. Same held-route idiom as the CK4/CL7 legs; rides the demo
// session (no registrations, no import budget); MID-file by design (the
// CK1 flood pin stays TERMINAL in s16 — resilience sorts before it).
// ---------------------------------------------------------------------------
test.describe("S138/CM2: the dashboard KPI OR-form gate (the mixed-landing false '0h')", () => {
  test("an in-flight focusSessions load owns the KPI row, never the false '0h' Focus Time card (RED pre-fix)", async ({ page }) => {
    const HELD = "**/api/focus-sessions";
    await page.route(HELD, () => {
      /* never fulfills — the accepted-TCP stall shape */
    });
    try {
      // The dashboard pre-warms tasks+assignments+exams+focusSessions+
      // subjects — the held focus-sessions fetch holds the Splash until
      // the CD2 deadline (~20 s), then the app commits with the other
      // four landed and focusSessions still loading: the mixed-landing
      // state where the pre-fix gate passed on tasks.length > 0 and the
      // Focus Time card rendered its false "0h".
      await page.goto("/Dashboard");
      await page.waitForFunction(
        () => document.documentElement.dataset.appHydrated === "true",
        undefined,
        { timeout: 35_000 },
      );
      // The in-flight window: the OR-form gate owns the KPI row — the
      // Focus Time card renders NOWHERE (pre-fix: visible, "0h").
      await expect(page.locator("main").getByText("Focus Time", { exact: true })).toHaveCount(0);
      // And its false zero renders nowhere in the main column.
      await expect(page.locator("main").getByText(/^0h$/)).toHaveCount(0);
      // The gate's spinner IS visible (the row's honest in-flight form).
      await expect(page.locator(".animate-spin").first()).toBeVisible();
    } finally {
      await page.unroute(HELD);
    }
  });
});

// ---------------------------------------------------------------------------
// S139/CN2 · the import tolerance edges. The import-family pin net
// (audit A-M2) never exercised: the empty envelope (`data: {}` → 200,
// zero rows — the tolerance edge) and the folders rejection copy's row
// index (CN7). Rides the demo session (the project storageState).
// Budget: the CN2 pair's two demo import POSTs (the file's total now
// 9/10 after the S146/CU4 recount — the historical "5/10 → 7/10" tally
// undercounted; the 409 probe below is one of the 9); no export GETs
// (BY5 at :780 spends the demo export budget
// mid-chunk — the headline round-trip leg relocated to chunk 2's
// s14-hardening for exactly that reason, the S135/CJ relocation class).
// ---------------------------------------------------------------------------
test.describe("S139/CN2 · the import tolerance edges", () => {
  test("an EMPTY envelope restores 200 with zero rows (the tolerance edge, finally pinned)", async ({ request }) => {
    const res = await request.post("/api/import/data", {
      data: { format: "studyflow-data-export", version: 1, data: {} },
    });
    expect(res.status()).toBe(200);
    const body = (await res.json()) as { created: number; updated: number };
    expect(body.created).toBe(0);
    expect(body.updated).toBe(0);
  });

  test("the folders rejection copy names the BACKUP FILE's row index, never the topo-sorted one (S139/CN7)", async ({ request }) => {
    // folders[0] is the INVALID child (an over-cap name — the deterministic
    // registry rejection) whose parentId points at its envelope sibling
    // (folders[1], the valid parent). The topo sort moves the parent
    // FIRST — so the pre-fix sanitize loop ran on the sorted array and its
    // message said "folders[1]", sending the operator to the wrong line
    // of their backup.
    const res = await request.post("/api/import/data", {
      data: {
        format: "studyflow-data-export",
        version: 1,
        data: {
          folders: [
            { id: "s139-bad-child", name: "x".repeat(201), parentId: "s139-parent" },
            { id: "s139-parent", name: "S139 parent" },
          ],
        },
      },
    });
    expect(res.status()).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toContain("folders[0]");
  });
});

// ---------------------------------------------------------------------------
// S139/CN2+CN4+CN10 · the cross-user import/factory wire pins. The import
// route's 409 collision branch (its own comment calls the cross-account
// global-PK collision "the dominant real trigger") was never pinned at
// the HTTP level; the hand-written CARD delegate's ownership guard (the
// one CRUD path that does not share the factory's where-clause) had ZERO
// behavioral pins (the CL9 class); the owned-FK PATCH re-point leg ("a
// task at a foreign subject") was pinned at CREATE only. One fresh
// TEST-NET user per test (the s23 BT1 budget-isolation convention, probe
// IP 192.0.2.139 — 3/10 per-IP, 3/40 registerGlobal; the demo import
// budget gains only the 409 probe — the file's demo POST total is 9/10
// after the S146/CU4 recount, one slot free).
// ---------------------------------------------------------------------------
const CN_PROBE_IP = "192.0.2.139";

async function registerFreshUser(page: import("@playwright/test").Page, salt: string): Promise<void> {
  const email = `s139-${salt}-${Date.now()}@studyflow.app`;
  const res = await page.request.post("/api/auth/register", {
    headers: { "x-forwarded-for": CN_PROBE_IP },
    data: { email, password: "Fresh1234!", name: "S139 Probe" },
  });
  expect(res.ok(), `register failed: ${res.status()}`).toBe(true);
  const body = (await res.json()) as { code: string };
  const verify = await page.request.post("/api/auth/verify-email", {
    headers: { "x-forwarded-for": CN_PROBE_IP },
    data: { email, code: body.code },
  });
  expect(verify.ok(), `verify failed: ${verify.status()}`).toBe(true);
}

test.describe("S139/CN2+CN4+CN10 · the cross-user import/factory wire pins", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("the cross-account 409: importing an id another user owns answers the named collision copy (S139/CN2)", async ({ page, browser }) => {
    await registerFreshUser(page, "cn2-409");
    const demo = await browser.newContext({ storageState: "tests/e2e/.auth/user.json" });
    try {
      const envelope = {
        format: "studyflow-data-export",
        version: 1,
        data: {
          subjects: [{ id: "s139-409-subject", name: "CN2 collision probe", color: "#8b5cf6" }],
        },
      };
      // user2 mints the fixed-id row (the import is the only id-specifying
      // entry point — the interactive POSTs mint cuids).
      const mine = await page.request.post("/api/import/data", { data: envelope });
      expect(mine.status()).toBe(200);
      const minted = (await mine.json()) as { created: number };
      expect(minted.created).toBe(1);
      // The demo session imports the SAME id: the ownership probe misses
      // ({id, userId: demo} finds nothing) → the write falls to CREATE →
      // the global PK collides → P2002 → the route's named 409.
      const theirs = await demo.request.post("/api/import/data", { data: envelope });
      expect(theirs.status()).toBe(409);
      const body = (await theirs.json()) as { error: string };
      expect(body.error).toContain("collides with an existing record");
    } finally {
      // Zero residue (the AM1/AN1 convention — user2 deletes their OWN row).
      await page.request.delete("/api/subjects/s139-409-subject");
      await demo.close();
    }
  });

  test("the card delegate's ownership guard: foreign card PATCH/DELETE → 404, foreign deckId POST → 404 (S139/CN4)", async ({ page, browser }) => {
    await registerFreshUser(page, "cn4-iso");
    const deckRes = await page.request.post("/api/flashcards/decks", {
      data: { name: "CN4 isolation deck" },
    });
    expect(deckRes.status()).toBe(201);
    const deck = (await deckRes.json()) as { id: string };
    const cardRes = await page.request.post("/api/flashcards/cards", {
      data: { deckId: deck.id, front: "CN4 front", back: "CN4 back" },
    });
    expect(cardRes.status()).toBe(201);
    const card = (await cardRes.json()) as { id: string };
    const demo = await browser.newContext({ storageState: "tests/e2e/.auth/user.json" });
    try {
      // The card delegate is the family's ONE hand-written CRUD path — the
      // only guard is its own `deck: { userId }` where-clauses (update/
      // remove) and the deck-ownership probe (create). A regression
      // dropping the userId from any of the three would pass every
      // existing test (the CL9 rationale, applied to the sibling).
      const patch = await demo.request.patch(`/api/flashcards/cards/${card.id}`, {
        data: { front: "hijacked" },
      });
      expect(patch.status()).toBe(404);
      const del = await demo.request.delete(`/api/flashcards/cards/${card.id}`);
      expect(del.status()).toBe(404);
      const create = await demo.request.post("/api/flashcards/cards", {
        data: { deckId: deck.id, front: "Q2", back: "A2" },
      });
      expect(create.status()).toBe(404);
    } finally {
      await demo.close();
      // Deleting the deck cascades its cards (onDelete: Cascade).
      await page.request.delete(`/api/flashcards/decks/${deck.id}`);
    }
  });

  test("the owned-FK re-point: PATCHing an OWNED task at a foreign subjectId → 404 (S139/CN10)", async ({ page, browser }) => {
    await registerFreshUser(page, "cn10-fk");
    const subjRes = await page.request.post("/api/subjects", {
      data: { name: "CN10 foreign subject", color: "#8b5cf6" },
    });
    expect(subjRes.status()).toBe(201);
    const subject = (await subjRes.json()) as { id: string };
    const demo = await browser.newContext({ storageState: "tests/e2e/.auth/user.json" });
    try {
      const taskRes = await demo.request.post("/api/tasks", {
        data: { title: "CN10 re-point probe" },
      });
      expect(taskRes.status()).toBe(201);
      const task = (await taskRes.json()) as { id: string };
      // assertOwnedFks runs on PATCH too ("re-pointing a task at a foreign
      // subject is the same hazard") — pinned here at the wire for the
      // first time (BV7 pinned the CREATE verb only).
      const patch = await demo.request.patch(`/api/tasks/${task.id}`, {
        data: { subjectId: subject.id },
      });
      expect(patch.status()).toBe(404);
      await demo.request.delete(`/api/tasks/${task.id}`);
    } finally {
      await demo.close();
      await page.request.delete(`/api/subjects/${subject.id}`);
    }
  });
});
