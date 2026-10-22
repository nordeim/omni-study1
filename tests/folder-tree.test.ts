import { describe, expect, it } from "vitest";
import { buildBreadcrumbChain } from "@/lib/folder-tree";

// The breadcrumb seam (S84/AK1): the walk from the current folder to the
// root must terminate over ANY row set — the wedge class it replaces was
// verified live (a cycled row set fed the unbounded inline walk and froze
// the renderer permanently). Every case here pins termination + order.

interface TestFolder {
  id: string;
  parentId: string | null;
  name?: string;
}

describe("buildBreadcrumbChain", () => {
  const root: TestFolder = { id: "root", parentId: null };
  const child: TestFolder = { id: "child", parentId: "root" };
  const grandchild: TestFolder = { id: "grand", parentId: "child" };

  it("walks a linear chain root-first", () => {
    const chain = buildBreadcrumbChain([root, child, grandchild], "grand");
    expect(chain.map((f) => f.id)).toEqual(["root", "child", "grand"]);
  });

  it("returns only the current folder when it is the root", () => {
    const chain = buildBreadcrumbChain([root, child, grandchild], "root");
    expect(chain.map((f) => f.id)).toEqual(["root"]);
  });

  it("returns an empty chain for a null current folder", () => {
    expect(buildBreadcrumbChain([root, child], null)).toEqual([]);
  });

  it("returns an empty chain when the current folder is not in the row set", () => {
    expect(buildBreadcrumbChain([root, child], "missing")).toEqual([]);
  });

  it("bounds the walk on a self-parenting row (the verified wedge class)", () => {
    const selfCycle: TestFolder = { id: "poisoned", parentId: "poisoned" };
    // Pre-guard, this row set froze the tab: cursor never left the folder.
    const chain = buildBreadcrumbChain([selfCycle], "poisoned");
    expect(chain.map((f) => f.id)).toEqual(["poisoned"]);
  });

  it("bounds the walk on a mutual A→B→A cycle", () => {
    const a: TestFolder = { id: "a", parentId: "b" };
    const b: TestFolder = { id: "b", parentId: "a" };
    const chain = buildBreadcrumbChain([a, b], "a");
    // Bounded (no wedge); the chain contains each cycled row at most once.
    expect(chain.map((f) => f.id)).toEqual(["b", "a"]);
    expect(chain.length).toBeLessThanOrEqual(2);
  });

  it("terminates on a dangling parent id", () => {
    const orphan: TestFolder = { id: "orphan", parentId: "deleted-folder" };
    const chain = buildBreadcrumbChain([orphan, root], "orphan");
    expect(chain.map((f) => f.id)).toEqual(["orphan"]);
  });

  it("stops the ascent at the cycle when a healthy branch feeds into one", () => {
    // A real pre-poisoned shape: a valid folder whose ANCESTORS are cycled.
    const a: TestFolder = { id: "a", parentId: "b" };
    const b: TestFolder = { id: "b", parentId: "a" };
    const healthy: TestFolder = { id: "good", parentId: "a" };
    const chain = buildBreadcrumbChain([a, b, healthy], "good");
    // good → a → b → (a revisited: stop) — every row at most once.
    expect(chain.map((f) => f.id)).toEqual(["b", "a", "good"]);
  });
});
