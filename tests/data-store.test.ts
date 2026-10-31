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

const apiGetMock = vi.fn();
vi.mock("@/lib/api", () => ({
  apiGet: (...args: unknown[]) => apiGetMock(...(args as [])),
  apiSend: vi.fn(),
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
