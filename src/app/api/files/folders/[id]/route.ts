// ---------------------------------------------------------------------------
// /api/files/folders/[id] — folder item routes (PATCH rename/re-parent +
// DELETE; the folder's items and children are SetNull by the schema).
// ---------------------------------------------------------------------------

import { z } from "zod";

import { db } from "@/lib/db";
import { wouldCreateCycle } from "@/lib/folder-tree";
import { nullableId } from "@/lib/validation";
import {
  makeItemRoutes,
  NotFoundError,
  parseWith,
  ValidationError,
  type EntityDelegate,
} from "@/lib/server/http";
import { sentKeysPatch } from "@/lib/server/entities";

// S123/BX5: the shared nullableId atom — the route-local twin's ""→null
// transform was DEAD CODE (idField's min(1) rejected "" first, so the
// clear-to-root convention every other entity FK honors 400'd here).
const folderUpdateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(), // S133/CH8: trim-before-check
  parentId: nullableId.optional(),
});

/** The folders delegate (same ownership contract as the entity delegates —
 *  the parent re-check keeps the tree sane from the client's view). */
const folderDelegate: EntityDelegate = {
  list: async () => [],
  create: async () => {
    throw new NotFoundError();
  },
  update: async (userId, id, input) => {
    const existing = await db.fileFolder.findFirst({
      where: { id, userId },
    });
    if (!existing) throw new NotFoundError();
    const parsed = parseWith(folderUpdateSchema, input);
    // S83/AJ1: the sent-keys filter — the seventeenth write site joins the
    // sentKeysPatch convention (the AI1 lesson: a fix's coverage claim must
    // hold at EVERY write site; a hand-filtered `!== undefined` check reads
    // a materialized zod default as a sent key, the exact AH8 data-loss
    // class). Sent keys intersected with the schema-validated parsed keys.
    const writes = sentKeysPatch(input, parsed) as {
      name?: string;
      parentId?: string | null;
    };
    // S125/BZ7: the cycle check + the update now run inside ONE
    // transaction. The pre-fix shape read the chain, checked it, then
    // updated non-atomically — two concurrent PATCHes (A→B, B→A) both
    // passed against the pre-write snapshot (TOCTOU: the guard's promise
    // was false under concurrency). SQLite serializes interactive
    // transactions, so the chain re-read inside the transaction is
    // authoritative.
    if (Object.keys(writes).length === 0) {
      // An empty patch is a no-op — short-circuit to the existing row
      // (S83/AJ2, verified against the resolved Prisma runtime (6.19.3 at the S84 re-probe; the ^6.11.1 range): an update with an empty
      // data object is ACCEPTED as a no-op; the short-circuit avoids the
      // pointless write, matching the factory and the card delegate).
      return existing;
    }
    return db.$transaction(async (tx) => {
      if (writes.parentId) {
        // S84/AK1: the folder-tree integrity guard. Verified live pre-guard:
        // a self-parent or A→B→A cycle PATCH answered 200 and, once the user
        // opened the cycled folder, the Files view's breadcrumb walk wedged
        // the renderer PERMANENTLY (one authenticated API call froze the
        // tab). Reject self-parenting and any re-parent that would close a
        // cycle — the ancestor chain walked with a visited set (also
        // terminates on a pre-existing cycled row set from an imported DB).
        // S85/AL3 (the s85 audit's L4): the walk lives in the shared pure
        // seam now (wouldCreateCycle, src/lib/folder-tree.ts — unit-pinned
        // against the pre-existing-cycle shapes; the inline twin's
        // termination property was unpinned and mutation-surviving).
        // S139/CN5 (audit B-M3): the walk is now BOUNDED — one findFirst
        // per HOP up the ancestor chain (depth-bounded), not the user's
        // whole folder table per PATCH. The pre-CN5 form read EVERY folder
        // the user owned inside this default-5 s transaction (the folders
        // GET is bounded at 500 precisely because the import route can
        // mint ~10^5 folders in one envelope — the guard itself was the
        // family's unbounded read). The collected chain feeds the
        // UNCHANGED wouldCreateCycle seam (its unit pins stay live), and
        // the first hop doubles as the parent-existence check: for the
        // cycle question only the ancestor chain of the candidate parent
        // matters, so the bounded chain and the full table answer
        // identically.
        if (writes.parentId === id) {
          throw new ValidationError("A folder cannot be its own parent.");
        }
        const chain: { id: string; parentId: string | null }[] = [];
        const seen = new Set<string>();
        let cursor: string | null = writes.parentId;
        while (cursor !== null && !seen.has(cursor)) {
          const row: { id: string; parentId: string | null } | null =
            await tx.fileFolder.findFirst({
              where: { id: cursor, userId },
              select: { id: true, parentId: true },
            });
          if (!row) break; // a dangling ancestor terminates the walk (the seam's own rule)
          chain.push(row);
          seen.add(row.id);
          cursor = row.parentId;
        }
        if (!chain.some((row) => row.id === writes.parentId)) {
          throw new NotFoundError("That folder does not exist.");
        }
        if (wouldCreateCycle(chain, id, writes.parentId)) {
          throw new ValidationError(
            "A folder cannot be moved inside its own subtree.",
          );
        }
      }
      return tx.fileFolder.update({ where: { id }, data: writes });
    });
  },
  remove: async (userId, id) => {
    const existing = await db.fileFolder.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!existing) throw new NotFoundError();
    await db.fileFolder.delete({ where: { id } });
    return { ok: true };
  },
};

export const { PATCH, DELETE } = makeItemRoutes(folderDelegate);
