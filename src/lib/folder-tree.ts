// folder-tree.ts — the pure folder-tree walk seam (S84/AK1).
//
// Extracted from files-view.tsx's breadcrumb useMemo so the walk's
// termination is a PINNED unit contract instead of an inline assumption.
// The wedge class (verified live against the pre-guard API): a cycled
// row set (self-parent or A→B→A, creatable through the API before the
// server-side guard) fed the unbounded `while (cursor)` walk and froze
// the renderer permanently. The visited set here bounds the walk by
// construction — a pre-existing cycled DB (imported, or poisoned before
// the guard) can render a weird-but-bounded breadcrumb, never a wedge.

export interface FolderLike {
  id: string;
  parentId: string | null;
}

/**
 * Walk parents from the current folder to the root, returning the chain
 * ordered root-first. Terminates on: the root (parentId null), a missing
 * parent row (dangling), or a revisit (a cycled row set) — the visited
 * set makes the walk linear-bounded over any row set, acyclic or not.
 */
export function buildBreadcrumbChain<F extends FolderLike>(
  folders: readonly F[],
  currentFolderId: string | null,
): F[] {
  if (!currentFolderId) return [];
  const byId = new Map(folders.map((folder) => [folder.id, folder]));
  const seen = new Set<string>();
  const chain: F[] = [];
  let cursor: F | undefined = byId.get(currentFolderId);
  while (cursor && !seen.has(cursor.id)) {
    seen.add(cursor.id);
    chain.unshift(cursor);
    cursor = cursor.parentId ? byId.get(cursor.parentId) : undefined;
  }
  return chain;
}
