// S119/BT8 — the fetchAndSet sequence guard (docs/remediation-plan-session119.md).
//
// Every mutation does apiSend(...) then fetchAndSet(key), which
// unconditionally setSlice'd whatever arrived LAST. With no per-key
// request sequence, two in-flight GETs for one collection can resolve
// out of order and the STALE response overwrites the fresher state (the
// live trigger: the Notes title input PATCHes on every keystroke, each
// followed by a notes GET). The guard: a module-level monotonic counter
// per collection key — capture ++seq[key] before the GET, setSlice only
// when still the latest. Pinned here with a controlled apiGet mock whose
// first (stale) resolution is DELAYED past the second (fresh) one.
import { describe, expect, it, vi, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const apiGetMock = vi.fn();
vi.mock("@/lib/api", () => ({
  apiGet: (...args: unknown[]) => apiGetMock(...(args as [])),
  apiSend: vi.fn(),
  // S133/CH10: data.ts now derives COLLECTION_GET_TIMEOUT_MS from this
  // export (the single source) — the mock carries the real value so the
  // CD2 deadline pin keeps asserting timeoutMs: 20_000.
  DEFAULT_GET_TIMEOUT_MS: 20_000,
}));

import { useDataStore } from "@/lib/data";

describe("fetchAndSet sequence guard (S119/BT8 — out-of-order GETs)", () => {
  beforeEach(() => {
    apiGetMock.mockReset();
  });

  it("a delayed STALE resolution never clobbers the fresher slice", async () => {
    const stale = [{ id: "stale-row" }];
    const fresh = [{ id: "fresh-row" }];
    let releaseStale: ((rows: unknown[]) => void) | undefined;
    const stalePromise = new Promise<unknown[]>((resolve) => {
      releaseStale = resolve;
    });
    // call 1 (stale, held) then call 2 (fresh, immediate)
    apiGetMock.mockReturnValueOnce(stalePromise);
    apiGetMock.mockReturnValueOnce(Promise.resolve(fresh));

    const first = useDataStore.getState().loadCollections(["tasks"]);
    const second = useDataStore.getState().loadCollections(["tasks"]);
    await second; // the fresh rows land first
    expect(useDataStore.getState().tasks).toEqual(fresh);

    releaseStale?.(stale); // the stale rows resolve LAST
    await first;
    expect(useDataStore.getState().tasks).toEqual(fresh); // NOT clobbered
  });

  it("an in-order pair still lands the final value (the normal path)", async () => {
    const first = [{ id: "r1" }];
    const second = [{ id: "r1" }, { id: "r2" }];
    apiGetMock
      .mockReturnValueOnce(Promise.resolve(first))
      .mockReturnValueOnce(Promise.resolve(second));
    const p1 = useDataStore.getState().loadCollections(["tasks"]);
    const p2 = useDataStore.getState().loadCollections(["tasks"]);
    await Promise.all([p1, p2]);
    expect(useDataStore.getState().tasks).toEqual(second);
  });

  it("independent collections do not interfere (the guard is per-key)", async () => {
    const heldNotes = new Promise<unknown[]>((resolve) =>
      setTimeout(() => resolve([{ id: "n1" }]), 0),
    );
    apiGetMock
      .mockReturnValueOnce(heldNotes) // notes — slow
      .mockReturnValueOnce(Promise.resolve([{ id: "t1" }])); // tasks — fast
    const notesP = useDataStore.getState().loadCollections(["notes"]);
    const tasksP = useDataStore.getState().loadCollections(["tasks"]);
    await Promise.all([notesP, tasksP]);
    expect(useDataStore.getState().notes).toEqual([{ id: "n1" }]);
    expect(useDataStore.getState().tasks).toEqual([{ id: "t1" }]);
  });
});

// S128/CC11 — the loading flag's in-flight truth (the s128 client-layer
// audit's L-tier). The pre-CC11 store set ONE shared boolean around every
// loadAll/loadCollections: two overlapping loads let the FIRST finisher's
// finally flip `loading` to false while the second fetch was still in
// flight. Currently masked (the view-side loadCollections callers don't
// read s.loading), but 8 views branch skeleton-vs-empty on that boolean —
// one new consumer away from a flash-of-empty-state. The fix tracks the
// in-flight KEYS (a module Set) and derives the boolean at each transition.
describe("the loading flag under overlapping loads (S128/CC11)", () => {
  beforeEach(() => {
    apiGetMock.mockReset();
    useDataStore.setState({ loading: false });
  });

  it("stays true until the LAST overlapping load settles", async () => {
    let releaseHeld: ((rows: unknown[]) => void) | undefined;
    const held = new Promise<unknown[]>((resolve) => {
      releaseHeld = resolve;
    });
    // call 1 (tasks — held) then call 2 (notes — immediate)
    apiGetMock.mockReturnValueOnce(held);
    apiGetMock.mockReturnValueOnce(Promise.resolve([{ id: "n1" }]));

    const tasksP = useDataStore.getState().loadCollections(["tasks"]);
    const notesP = useDataStore.getState().loadCollections(["notes"]);
    await notesP; // the FIRST finisher settles
    // Pre-fix: the shared boolean already flipped false here.
    expect(useDataStore.getState().loading).toBe(true);

    releaseHeld?.([{ id: "t1" }]);
    await tasksP;
    expect(useDataStore.getState().loading).toBe(false);
  });

  it("a single load still clears the flag (the normal path)", async () => {
    apiGetMock.mockReturnValueOnce(Promise.resolve([{ id: "t1" }]));
    await useDataStore.getState().loadCollections(["tasks"]);
    expect(useDataStore.getState().loading).toBe(false);
  });

  it("a REJECTED load still clears the flag (the finally path)", async () => {
    apiGetMock.mockReturnValueOnce(Promise.reject(new Error("offline")));
    await useDataStore
      .getState()
      .loadCollections(["notes"])
      .catch(() => undefined);
    expect(useDataStore.getState().loading).toBe(false);
  });
});

// S129/CD2 — the collection GET deadline (docs/remediation-plan-session129.md).
//
// The audit's M1: CC7 gave the boot gate's /api/auth/me a 20 s deadline, but
// the gate ALSO awaits the pre-warm, whose fetchAndSet called apiGet with NO
// timeout — a stalled connection (accepted TCP, no response — no offline
// event fires) never settles, the prewarm .catch(() => {}) never fires (a
// non-rejection), and the Splash pulses forever with the retry affordance
// unreachable. The fix threads COLLECTION_GET_TIMEOUT_MS through EVERY
// collection GET (the pre-warm, loadAll, the view refreshes, the
// post-mutation refresh) — pinned here at the seam boundary: fetchAndSet
// must hand apiGet the deadline option (the mechanism itself —
// AbortSignal.timeout — is pinned by tests/api-timeout.test.ts, the CC7
// family).
describe("the collection GET deadline (S129/CD2)", () => {
  beforeEach(() => {
    apiGetMock.mockReset();
    useDataStore.setState({ loading: false });
  });

  it("fetchAndSet hands apiGet the 20 s deadline (pre-fix: the bare path — a stalled GET held the Splash forever)", async () => {
    apiGetMock.mockReturnValue(Promise.resolve([{ id: "t1" }]));
    await useDataStore.getState().loadCollections(["tasks"]);
    expect(apiGetMock).toHaveBeenCalledWith("/api/tasks", {
      timeoutMs: 20_000,
    });
  });

  it("the deadline rides loadAll's fetches too (the background refresh is bounded the same way)", async () => {
    apiGetMock.mockReturnValue(Promise.resolve([]));
    await useDataStore.getState().loadAll();
    // Every collection key was fetched, every one with the deadline option.
    const calls = apiGetMock.mock.calls as unknown as [string, unknown][];
    expect(calls.length).toBeGreaterThan(10);
    for (const call of calls) {
      expect(call[1]).toEqual({ timeoutMs: 20_000 });
    }
  });
});

// ---------------------------------------------------------------------------
// S136/CK2 (audit B-H1) — the files-view private loader carries the SAME
// sequence discipline. Files is the one view that bypasses the guarded
// useDataStore seam (a local loadFileRows()/refresh() pair); refresh() —
// fired after EVERY mutation (delete/rename/upload) — had NO ticket, so an
// older in-flight GET settling after a newer one clobbered fresher state
// (a just-deleted row resurrects; the retry 404s) — the exact S119/BT8
// class the store fixed with fetchSeq, never ported here. The component
// shape (React.useCallback) keeps this a source census: the ticket idiom
// must exist with the apply-when-latest guard, in BOTH settle paths.
// ---------------------------------------------------------------------------
describe("the files-view loader sequence census (S136/CK2)", () => {
  const FILES_VIEW = path.resolve(process.cwd(), "src/components/views/files-view.tsx");
  const src = readFileSync(FILES_VIEW, "utf8");

  it("a component-scoped sequence ticket exists (the fetchSeq idiom ported to the private loader)", () => {
    // Pre-CK2: no ticket counter existed — the RED discriminator.
    expect(src).toMatch(/fileRowsSeq|fileLoadSeq/);
  });

  it("refresh() captures the ticket BEFORE the GET pair and applies only when still latest", () => {
    // Pre-CK2: refresh() set state unconditionally — the RED discriminator.
    const refreshAt = src.indexOf("const refresh = React.useCallback");
    expect(refreshAt).toBeGreaterThan(-1);
    const refreshBody = src.slice(refreshAt, src.indexOf("}, [loadFileRows, toast]", refreshAt));
    expect(refreshBody).toMatch(/ticket/);
    expect(
      refreshBody.indexOf("ticket"),
      "the ticket is captured BEFORE the GET pair (loadFileRows awaits after the capture)",
    ).toBeLessThan(refreshBody.indexOf("await loadFileRows()"));
    expect(refreshBody).toMatch(/still latest|!== ticket|seq !== ticket/);
  });

  it("the mount effect respects the SAME ticket (a superseded mount GET never lands)", () => {
    // Pre-CK2: the effect keyed only on `cancelled` (unmount) — a superseded
    // response still landed. RED: no ticket mention inside the effect body.
    const effectAt = src.indexOf("React.useEffect(() => {");
    const effectBody = src.slice(effectAt, src.indexOf("}, [loadFileRows, toast]", effectAt));
    expect(effectBody).toMatch(/ticket/);
  });
});
