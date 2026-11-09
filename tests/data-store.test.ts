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
// S149/CX1+CX2: apiSend routed through a CAPTURED mock so the chain legs can
// hold the first PATCH resolution (the apiGetMock pattern — a bare vi.fn()
// cannot be controlled per-call; no existing leg exercises apiSend, so the
// mock shape change is behavior-neutral for the S119/S128 pins).
const apiSendMock = vi.fn();
vi.mock("@/lib/api", () => ({
  apiGet: (...args: unknown[]) => apiGetMock(...(args as [])),
  apiSend: (...args: unknown[]) => apiSendMock(...(args as [])),
  // S133/CH10: data.ts now derives COLLECTION_GET_TIMEOUT_MS from this
  // export (the single source) — the mock carries the real value so the
  // CD2 deadline pin keeps asserting timeoutMs: 20_000.
  DEFAULT_GET_TIMEOUT_MS: 20_000,
}));

import { mutations, parseExamTopics, useDataStore } from "@/lib/data";

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

// S149/CX1 (audit B-M1): the sibling toggle chains — the S127/CB16 per-id
// chain fixed ONE toggle (`completed`); the myDay/important row toggles
// PATCHed from the RENDER-SNAPSHOT task, so two rapid clicks inside the
// PATCH+refetch window both read the same stale base and sent the SAME
// value (the second toggle silently lost — the exact BX10 class, one
// generation behind). These legs pin the chained store contract directly:
// the second toggle must re-read the POST-SETTLE base and send the
// OPPOSITE value. Pre-fix RED: `mutations.toggleTaskMyDay` does not exist
// (the TypeError is the red — the CW2 import-failure precedent).
describe("S149/CX1: the sibling toggle chains (B-M1 — myDay/important double-toggle)", () => {
  const taskRow = {
    id: "t1",
    userId: "u1",
    title: "Chain pin",
    notes: "",
    listId: null,
    subjectId: null,
    completed: false,
    important: false,
    dueDate: null,
    priority: "medium" as const,
    repeat: "none" as const,
    myDay: false,
    subtasks: "[]",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };

  beforeEach(() => {
    apiGetMock.mockReset();
    apiSendMock.mockReset();
    apiGetMock.mockResolvedValue([]);
    apiSendMock.mockResolvedValue(undefined);
    useDataStore.setState({ tasks: [taskRow] });
  });

  it("two rapid myDay toggles send OPPOSITE values (the second re-reads the post-settle base)", async () => {
    // Hold the FIRST PATCH so the second toggle enters while the first has
    // not settled — the exact double-click window the audit found.
    let releaseFirst: (() => void) | undefined;
    const held = new Promise<void>((resolve) => {
      releaseFirst = resolve;
    });
    apiSendMock.mockReturnValueOnce(held).mockReturnValueOnce(Promise.resolve());
    // The post-settle refetch lands the UPDATED row (myDay: true) — the
    // second chain link must read THIS base, not the render-time snapshot.
    apiGetMock.mockResolvedValue([{ ...taskRow, myDay: true }]);

    const first = mutations.toggleTaskMyDay("t1");
    const second = mutations.toggleTaskMyDay("t1");
    releaseFirst?.();
    await Promise.all([first, second]);

    expect(apiSendMock).toHaveBeenCalledTimes(2);
    const firstPatch = apiSendMock.mock.calls[0]?.[2] as Record<string, unknown>;
    const secondPatch = apiSendMock.mock.calls[1]?.[2] as Record<string, unknown>;
    expect(firstPatch.myDay).toBe(true); // the pre-toggle base was false
    expect(secondPatch.myDay).toBe(false); // the post-settle base was true
  });

  it("the important twin chains the same way", async () => {
    let releaseFirst: (() => void) | undefined;
    const held = new Promise<void>((resolve) => {
      releaseFirst = resolve;
    });
    apiSendMock.mockReturnValueOnce(held).mockReturnValueOnce(Promise.resolve());
    apiGetMock.mockResolvedValue([{ ...taskRow, important: true }]);

    const first = mutations.toggleTaskImportant("t1");
    const second = mutations.toggleTaskImportant("t1");
    releaseFirst?.();
    await Promise.all([first, second]);

    expect(apiSendMock).toHaveBeenCalledTimes(2);
    const firstPatch = apiSendMock.mock.calls[0]?.[2] as Record<string, unknown>;
    const secondPatch = apiSendMock.mock.calls[1]?.[2] as Record<string, unknown>;
    expect(firstPatch.important).toBe(true);
    expect(secondPatch.important).toBe(false);
  });

  it("a FAILED first toggle does not poison the chain (the caller still gets the rejection)", async () => {
    apiSendMock.mockRejectedValueOnce(new Error("offline"));
    apiSendMock.mockResolvedValueOnce(undefined);
    apiGetMock.mockResolvedValue([taskRow]);

    // The first toggle rejects (the caller sees it)…
    await expect(mutations.toggleTaskMyDay("t1")).rejects.toThrow("offline");
    // …and the second still runs against the post-settle base (myDay: false
    // — the failed PATCH never landed, so the base is unchanged).
    await mutations.toggleTaskMyDay("t1");
    const secondPatch = apiSendMock.mock.calls[1]?.[2] as Record<string, unknown>;
    expect(secondPatch.myDay).toBe(true);
  });
});

// The CX1 wiring censuses (the CV1 precedent): the four view call sites
// must ride the CHAINED mutations, never the render-snapshot updateTask.
describe("S149/CX1: the sibling-toggle view wiring census", () => {
  const TASKS_VIEW = path.resolve(process.cwd(), "src/components/views/tasks-view.tsx");
  const MYDAY_VIEW = path.resolve(process.cwd(), "src/components/views/myday-view.tsx");

  for (const [label, file] of [
    ["tasks-view", TASKS_VIEW],
    ["myday-view", MYDAY_VIEW],
  ] as const) {
    it(`${label}: the row toggles ride the chained mutations (never the snapshot updateTask)`, () => {
      const src = readFileSync(file, "utf8");
      expect(src).toContain("mutations.toggleTaskMyDay(");
      expect(src).toContain("mutations.toggleTaskImportant(");
      // The stale-base call shapes are GONE (the BX10 snapshot PATCHes).
      expect(src).not.toContain("{ myDay: !task.myDay }");
      expect(src).not.toContain("{ important: !task.important }");
    });
  }
});

// S149/CX2 (audit B-M2): the study-group members chain — the S123/BX10
// fix moved the members base from the render snapshot to a call-time
// store read, but a call-time read still loses ops to in-flight
// interleaving (a remove during an add's PATCH+refetch window computed
// from the pre-add base and silently dropped the add). The chain idiom
// (the toggleTask precedent) is what makes it correct: each link computes
// from the POST-SETTLE base. Pre-fix RED: `mutations.setStudyGroupMembers`
// does not exist (the TypeError is the red).
describe("S149/CX2: the study-group members chain (B-M2 — add/remove interleave)", () => {
  const groupRow = {
    id: "g1",
    userId: "u1",
    name: "Chain pin",
    color: "#7c3aed",
    subjectId: null,
    members: [{ name: "Ari", email: "ari@example.com" }],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };

  beforeEach(() => {
    apiGetMock.mockReset();
    apiSendMock.mockReset();
    apiGetMock.mockResolvedValue([]);
    apiSendMock.mockResolvedValue(undefined);
    useDataStore.setState({ studyGroups: [groupRow] });
  });

  it("a remove during an add's in-flight window lands BOTH effects (never the remove-alone array)", async () => {
    // Hold the add's PATCH so the remove enters while the add has not
    // settled — the exact interleave the audit found.
    let releaseAdd: (() => void) | undefined;
    const held = new Promise<void>((resolve) => {
      releaseAdd = resolve;
    });
    apiSendMock.mockReturnValueOnce(held).mockReturnValueOnce(Promise.resolve());
    // The post-settle refetch lands the group WITH the added member — the
    // remove link must read THIS base (the server's truth), not the
    // pre-add store snapshot.
    apiGetMock.mockResolvedValue([
      { ...groupRow, members: [{ name: "Ari", email: "ari@example.com" }, { name: "Sam", email: "sam@example.com" }] },
    ]);

    const add = mutations.setStudyGroupMembers("g1", (members) => [
      ...members,
      { name: "Sam", email: "sam@example.com" },
    ]);
    const remove = mutations.setStudyGroupMembers("g1", (members) =>
      members.filter((m) => m.email !== "ari@example.com"),
    );
    releaseAdd?.();
    await Promise.all([add, remove]);

    expect(apiSendMock).toHaveBeenCalledTimes(2);
    const addPatch = apiSendMock.mock.calls[0]?.[2] as { members: { email: string }[] };
    const removePatch = apiSendMock.mock.calls[1]?.[2] as { members: { email: string }[] };
    // The add computed from the seeded base (Ari).
    expect(addPatch.members.map((m) => m.email)).toEqual(["ari@example.com", "sam@example.com"]);
    // The remove computed from the POST-ADD-SETTLE base (Ari + Sam) — the
    // pre-fix call-time read would have dropped Sam from the array.
    expect(removePatch.members.map((m) => m.email)).toEqual(["sam@example.com"]);
  });

  it("a missing group is a no-op (a deleted group's chain link never PATCHes)", async () => {
    useDataStore.setState({ studyGroups: [] });
    await mutations.setStudyGroupMembers("g1", (members) => members);
    expect(apiSendMock).not.toHaveBeenCalled();
  });
});

// The CX2 wiring census: the members PANEL's add/remove handlers must ride
// the chain — the call-time `useDataStore.getState().studyGroups.find` reads
// leave the handlers with the stale-base math. (The GroupDialog's own
// submit-time read is the edit-form full-payload pattern — designed
// last-writer-wins, out of this census's scope by the plan's §5.)
describe("S149/CX2: the study-group members view wiring census", () => {
  it("addMember/removeMember ride mutations.setStudyGroupMembers (the stale-base reads are gone)", () => {
    const src = readFileSync(
      path.resolve(process.cwd(), "src/components/views/studygroups-view.tsx"),
      "utf8",
    );
    // Slice the members-panel handlers: addMember through removeMember's
    // close (the next `return (` after removeMember ends the handler pair).
    const addAt = src.indexOf("const addMember = async (event: React.FormEvent) => {");
    expect(addAt, "the addMember handler exists").toBeGreaterThan(-1);
    const removeAt = src.indexOf("const removeMember = (member: Member) => {", addAt);
    expect(removeAt, "the removeMember handler exists").toBeGreaterThan(-1);
    const handlersEnd = src.indexOf("\n  return (", removeAt);
    const handlers = src.slice(addAt, handlersEnd === -1 ? undefined : handlersEnd);
    expect(handlers).toContain("mutations.setStudyGroupMembers(");
    expect(handlers).not.toContain("useDataStore.getState().studyGroups.find");
    expect(handlers).not.toContain("mutations.updateStudyGroup(");
  });
});

// S151/CZ1 (audit B-M1): the notes tags chain — the CX2 updater-form
// treatment on the tags field (the members fix, one field over). The view's
// addTag/removeTag PATCHed ABSOLUTE JSON arrays computed from the
// RENDER-SNAPSHOT selected note (notes-view.tsx:423-452), so a tag add
// followed by a tag remove inside one PATCH+refetch window computed the
// remove from the PRE-ADD base and silently dropped the add while both
// PATCHes succeeded (tag adds carry no success toast — a fully silent
// loss). These legs pin the chained store contract directly: the second op
// must compute from the POST-SETTLE base. Pre-fix RED:
// `mutations.setNoteTags` does not exist (the TypeError is the red — the
// CX1 precedent).
describe("S151/CZ1: the notes tags chain (B-M1 — add/remove interleave)", () => {
  const noteRow = {
    id: "n1",
    userId: "u1",
    title: "Chain pin",
    content: "<p>probe</p>",
    tags: JSON.stringify(["zulu"]),
    notebookId: null,
    subjectId: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };

  beforeEach(() => {
    apiGetMock.mockReset();
    apiSendMock.mockReset();
    apiGetMock.mockResolvedValue([]);
    apiSendMock.mockResolvedValue(undefined);
    useDataStore.setState({ notes: [noteRow] });
  });

  it("an add then a remove inside one window BOTH survive (the remove reads the post-settle base)", async () => {
    // Hold the FIRST PATCH (the add) so the remove enters while the add has
    // not settled — the exact two-action window the audit found.
    let releaseAdd: (() => void) | undefined;
    const held = new Promise<void>((resolve) => {
      releaseAdd = resolve;
    });
    apiSendMock.mockReturnValueOnce(held).mockReturnValueOnce(Promise.resolve());
    // The post-settle refetch lands the note WITH the added tag — the
    // remove link must read THIS base, not the render-time snapshot.
    apiGetMock.mockResolvedValue([{ ...noteRow, tags: JSON.stringify(["zulu", "alpha"]) }]);

    const add = mutations.setNoteTags("n1", (tags) => [...tags, "alpha"]);
    const remove = mutations.setNoteTags("n1", (tags) => tags.filter((t) => t !== "zulu"));
    releaseAdd?.();
    await Promise.all([add, remove]);

    expect(apiSendMock).toHaveBeenCalledTimes(2);
    const addPatch = apiSendMock.mock.calls[0]?.[2] as { tags: string };
    const removePatch = apiSendMock.mock.calls[1]?.[2] as { tags: string };
    // The add computed from the seeded base (["zulu"]).
    expect(JSON.parse(addPatch.tags)).toEqual(["zulu", "alpha"]);
    // The remove computed from the POST-ADD-SETTLE base (["zulu","alpha"]) —
    // the pre-fix snapshot PATCH would have carried ["alpha"] without zulu
    // ever being removed… or dropped "alpha" entirely from the stale base.
    expect(JSON.parse(removePatch.tags)).toEqual(["alpha"]);
  });

  it("a FAILED first tag PATCH does not poison the chain (the caller still gets the rejection)", async () => {
    apiSendMock.mockRejectedValueOnce(new Error("offline"));
    apiSendMock.mockResolvedValueOnce(undefined);
    // The failed PATCH never landed — the refetch returns the unchanged row.
    apiGetMock.mockResolvedValue([noteRow]);

    // The first op rejects (the caller sees it)…
    await expect(
      mutations.setNoteTags("n1", (tags) => [...tags, "alpha"]),
    ).rejects.toThrow("offline");
    // …and the second still runs against the post-settle base (the seeded
    // tags — the failed PATCH never landed).
    await mutations.setNoteTags("n1", (tags) => [...tags, "bravo"]);
    const secondPatch = apiSendMock.mock.calls[1]?.[2] as { tags: string };
    expect(JSON.parse(secondPatch.tags)).toEqual(["zulu", "bravo"]);
  });

  it("a missing note is a no-op (a deleted note's chain link never PATCHes)", async () => {
    useDataStore.setState({ notes: [] });
    await mutations.setNoteTags("n1", (tags) => [...tags, "alpha"]);
    expect(apiSendMock).not.toHaveBeenCalled();
  });
});

// S162/DK1 (the s162 audit B/F-1): the events mutation CB8 split — the
// write and the post-write refresh are SEPARATE failure domains. The
// pre-DK1 events mutations were `await apiSend(...)` then
// `await fetchAndSet("events")`, and fetchAndSet REJECTS when its GET
// fails (the CD2 20 s deadline): a write that COMMITTED server-side
// followed by a flaky refresh rejected the WHOLE mutation — the view's
// catch showed "Something went wrong." in the still-open dialog, fired
// no success toast, and kept the form armed, so a RETRY re-POSTed and
// duplicated the event (the CB8 letter: a false mutation-failure claim
// on a committed row). The fix contains the refresh rejection AT THE
// SEAM (the DJ5 .catch doctrine: the write's own success toast is the
// surfacing; the stale slice self-heals on the next load — the S16
// view-switch pre-warm + the next mutation's own refresh). These legs
// pin the behavioral contract with the CZ1 mock shape: apiSend resolves
// (the committed write) + apiGet rejects (the flaky refresh) → the
// mutation RESOLVES; and apiSend itself rejecting still rejects (the
// honest save-failure contract the view's dialog catch depends on).
describe("S162/DK1: the events mutation CB8 split (B-M1 — committed write + failed refresh)", () => {
  const eventInput = {
    title: "DK1 probe",
    startDate: "2026-11-09T10:00",
    endDate: null,
    allDay: false,
    color: "#8b5cf6",
    location: "",
    repeat: "none",
    reminders: "[]",
    description: "",
  } as const;

  beforeEach(() => {
    apiGetMock.mockReset();
    apiSendMock.mockReset();
    apiGetMock.mockResolvedValue([]);
    apiSendMock.mockResolvedValue(undefined);
    useDataStore.setState({ events: [] });
  });

  it("createEvent: a committed write + a failed refresh RESOLVES (never the false save-failure)", async () => {
    apiSendMock.mockResolvedValueOnce(undefined); // the POST 201s
    apiGetMock.mockRejectedValueOnce(new Error("offline")); // the refresh GET fails
    // RED pre-fix: the mutation rejected with "offline" — the caller's
    // catch claimed a save failure on a row the server committed.
    await expect(mutations.createEvent(eventInput as never)).resolves.toBeUndefined();
  });

  it("updateEvent: a committed write + a failed refresh RESOLVES", async () => {
    apiSendMock.mockResolvedValueOnce(undefined);
    apiGetMock.mockRejectedValueOnce(new Error("offline"));
    await expect(mutations.updateEvent("e1", { title: "renamed" })).resolves.toBeUndefined();
  });

  it("deleteEvent: a committed write + a failed refresh RESOLVES", async () => {
    apiSendMock.mockResolvedValueOnce(undefined);
    apiGetMock.mockRejectedValueOnce(new Error("offline"));
    await expect(mutations.deleteEvent("e1")).resolves.toBeUndefined();
  });

  it("createEvent: a FAILED write still rejects (the honest save-failure reaches the caller)", async () => {
    apiSendMock.mockRejectedValueOnce(new Error("offline"));
    // The write leg keeps rejecting — the view's dialog stays open with
    // the honest error, and the retry is legitimate (nothing committed).
    await expect(mutations.createEvent(eventInput as never)).rejects.toThrow("offline");
  });
});

// S163/DL1 (the s163 audit B/M-1): the exams mutation CB8 split — the
// DK1 pair set ported to the second family of the recorded family-wide
// port ("exams/assignments/timetable/notes/flashcards/tasks share the
// M-1 shape — each family gets its own rotation-axis audit + pin set,
// the events pin set is the template"). The pre-DL1 exams mutations
// were `await apiSend(...)` then `await fetchAndSet("exams")`
// (data.ts:614-625), and fetchAndSet REJECTS when its GET fails (the
// CD2 20 s deadline): a write that COMMITTED server-side followed by a
// flaky refresh rejected the WHOLE mutation — the view's catch showed
// "Something went wrong." in the still-open dialog (exams-view.tsx:229),
// fired no success toast, and kept the form armed, so a RETRY re-POSTed
// and duplicated the exam (the CB8 letter: a false mutation-failure
// claim on a committed row). The fix contains the refresh rejection AT
// THE SEAM (the DK1/DJ5 .catch doctrine, ported verbatim): the write's
// own success toast ("Exam added.") is the surfacing; the stale slice
// self-heals on the next load. These legs pin the behavioral contract
// with the CZ1 mock shape: apiSend resolves (the committed write) +
// apiGet rejects (the flaky refresh) → the mutation RESOLVES; and
// apiSend itself rejecting still rejects (the honest save-failure
// contract the view's dialog catch depends on).
describe("S163/DL1: the exams mutation CB8 split (B-M1 — committed write + failed refresh)", () => {
  const examInput = {
    title: "DL1 probe",
    date: "2026-11-16T09:00",
    subjectId: null,
    type: "test",
    duration: 90,
    topics: "[]",
    location: "",
  } as const;

  beforeEach(() => {
    apiGetMock.mockReset();
    apiSendMock.mockReset();
    apiGetMock.mockResolvedValue([]);
    apiSendMock.mockResolvedValue(undefined);
    useDataStore.setState({ exams: [] });
  });

  it("createExam: a committed write + a failed refresh RESOLVES (never the false save-failure)", async () => {
    apiSendMock.mockResolvedValueOnce(undefined); // the POST 201s
    apiGetMock.mockRejectedValueOnce(new Error("offline")); // the refresh GET fails
    // RED pre-fix: the mutation rejected with "offline" — the caller's
    // catch claimed a save failure on a row the server committed.
    await expect(mutations.createExam(examInput as never)).resolves.toBeUndefined();
  });

  it("updateExam: a committed write + a failed refresh RESOLVES", async () => {
    apiSendMock.mockResolvedValueOnce(undefined);
    apiGetMock.mockRejectedValueOnce(new Error("offline"));
    await expect(mutations.updateExam("x1", { title: "renamed" })).resolves.toBeUndefined();
  });

  it("deleteExam: a committed write + a failed refresh RESOLVES", async () => {
    apiSendMock.mockResolvedValueOnce(undefined);
    apiGetMock.mockRejectedValueOnce(new Error("offline"));
    await expect(mutations.deleteExam("x1")).resolves.toBeUndefined();
  });

  it("createExam: a FAILED write still rejects (the honest save-failure reaches the caller)", async () => {
    apiSendMock.mockRejectedValueOnce(new Error("offline"));
    // The write leg keeps rejecting — the view's dialog stays open with
    // the honest error, and the retry is legitimate (nothing committed).
    await expect(mutations.createExam(examInput as never)).rejects.toThrow("offline");
  });
});

// S163/DL3 (the s163 audit B/I-1): the promoted topics seam — the topics
// safe-parse twin lived BYTE-IDENTICAL in exams-view.tsx twice (openEdit's
// JSON.parse(row.topics) + the card render's JSON.parse(exam.topics)), the
// exact duplication class the S151/CZ1 fix removed for notes
// (parseNoteTags → src/lib/data.ts). A future edit to one copy would drift
// the dialog vs the card; the promotion puts the semantics in one place
// with this pin set. The helper preserves the TWINS' semantics verbatim —
// the filter keeps every string (NO t.length > 0 guard: parseNoteTags'
// length guard is the NOTES twins' semantics, deliberately different); the
// raw || "[]" empty-string guard is behavior-identical to the twins' catch
// path (JSON.parse("") throws → []).
describe("S163/DL3: parseExamTopics (the promoted topics seam)", () => {
  it("a valid JSON string array parses", () => {
    expect(parseExamTopics('["integration","differentiation"]')).toEqual([
      "integration",
      "differentiation",
    ]);
  });

  it("non-string entries filter out (the mixed array)", () => {
    expect(parseExamTopics('["ok", 42, null, true, {"nested": 1}, "also-ok"]')).toEqual([
      "ok",
      "also-ok",
    ]);
  });

  it("a non-array JSON payload answers []", () => {
    expect(parseExamTopics('{"not":"an array"}')).toEqual([]);
    expect(parseExamTopics('"a json string"')).toEqual([]);
  });

  it("invalid JSON answers [] (the twins' catch path)", () => {
    expect(parseExamTopics("not json at all")).toEqual([]);
  });

  it("the empty string answers [] (the raw || \"[]\" guard)", () => {
    expect(parseExamTopics("")).toEqual([]);
  });
});
