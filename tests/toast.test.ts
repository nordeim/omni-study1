import { describe, expect, it, vi } from "vitest";

// S128/CC8 — the toaster's deterministic identity + bounded stack (the s128
// client-layer audit's L-tier). The pre-CC8 store minted ids with
// `Date.now() + Math.floor(Math.random() * 1000)`: two pushes in the same
// millisecond collide ~1/1000 of the time (duplicate React keys; one
// dismiss kills both), the auto-dismiss timer was scheduled INSIDE the
// zustand `set` reducer (purity smell — state mutation in waiting), and the
// stack had no cap (an error loop piles toasts for each one's 5s lifetime).
// The fix: a module counter for ids, the timer scheduled outside `set`, and
// a 5-toast cap that drops the OLDEST (the standard viewport convention).
import { useToastStore } from "@/components/ui/toast";

describe("the toaster (S128/CC8)", () => {
  it("mints DISTINCT ids for same-tick pushes (the counter, not Date.now+random)", () => {
    const before = useToastStore.getState().items.length;
    const store = useToastStore.getState();
    store.push("info", "one");
    store.push("info", "two");
    store.push("error", "three");
    const items = useToastStore.getState().items.slice(before);
    const ids = items.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    // Deterministic identity: the counter only ever moves forward.
    store.push("info", "four");
    const last = useToastStore.getState().items[useToastStore.getState().items.length - 1];
    expect(last.id).toBeGreaterThan(Math.max(...ids));
  });

  it("caps the stack at five toasts, dropping the OLDEST", () => {
    vi.useFakeTimers();
    try {
      useToastStore.setState({ items: [] });
      const store = useToastStore.getState();
      for (let i = 0; i < 6; i += 1) {
        store.push("info", `toast ${i}`);
        vi.advanceTimersByTime(0);
      }
      const items = useToastStore.getState().items;
      // Pre-fix: SIX items (no cap). Post-fix: five, the oldest gone.
      expect(items.length).toBe(5);
      expect(items.map((t) => t.message)).toEqual([
        "toast 1",
        "toast 2",
        "toast 3",
        "toast 4",
        "toast 5",
      ]);
    } finally {
      vi.useRealTimers();
    }
  });

  it("auto-dismisses after 5s and dismiss(id) removes immediately", () => {
    vi.useFakeTimers();
    try {
      useToastStore.setState({ items: [] });
      useToastStore.getState().push("info", "fleeting");
      expect(useToastStore.getState().items.length).toBe(1);
      const id = useToastStore.getState().items[0].id;
      vi.advanceTimersByTime(5000);
      expect(useToastStore.getState().items.length).toBe(0);

      useToastStore.getState().push("error", "manual");
      const manualId = useToastStore.getState().items[0].id;
      useToastStore.getState().dismiss(manualId);
      expect(useToastStore.getState().items.length).toBe(0);
      void id;
    } finally {
      vi.useRealTimers();
    }
  });
});
