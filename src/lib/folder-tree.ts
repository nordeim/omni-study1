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

/**
 * Would re-parenting `folderId` under `newParentId` close a cycle in the
 * row set? (S85/AL3 — the s85 audit's L4: the server's PATCH guard walked
 * this inline, unpinned; the extraction to the shared seam makes the walk's
 * termination a unit-pinned contract instead of an inline assumption.)
 *
 * Walks the candidate parent's ancestor chain with a visited set — the
 * chain is linear-bounded over ANY row set, acyclic or not (a pre-existing
 * cycled/imported DB terminates the walk rather than hanging it). Returns
 * true when the chain reaches the folder being moved (a descendant cycle)
 * or when the parent IS the folder (self-parenting). A dangling ancestor
 * row simply terminates the walk (allowed — the caller's own
 * parent-existence check governs the direct parent).
 */
export function wouldCreateCycle(
  rows: readonly FolderLike[],
  folderId: string,
  newParentId: string,
): boolean {
  if (newParentId === folderId) return true;
  const parentById = new Map(rows.map((row) => [row.id, row.parentId]));
  let cursor: string | null = newParentId;
  const seen = new Set<string>();
  while (cursor && !seen.has(cursor)) {
    if (cursor === folderId) return true;
    seen.add(cursor);
    cursor = parentById.get(cursor) ?? null;
  }
  return false;
}
