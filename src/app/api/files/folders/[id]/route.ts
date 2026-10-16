// ---------------------------------------------------------------------------
// /api/files/folders/[id] — folder item routes (PATCH rename/re-parent +
// DELETE; the folder's items and children are SetNull by the schema).
// ---------------------------------------------------------------------------

import { z } from "zod";

import { db } from "@/lib/db";
import {
  makeItemRoutes,
  NotFoundError,
  parseWith,
  type EntityDelegate,
} from "@/lib/server/http";

const folderUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  parentId: z
    .string()
    .min(1)
    .nullish()
    .transform((v) => (v === "" ? null : v))
    .optional(),
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
    if (parsed.parentId) {
      const parent = await db.fileFolder.findFirst({
        where: { id: parsed.parentId, userId },
        select: { id: true },
      });
      if (!parent) throw new NotFoundError("That folder does not exist.");
    }
    // Only the provided keys move — an absent parentId never clears.
    const data: { name?: string; parentId?: string | null } = {};
    if (parsed.name !== undefined) data.name = parsed.name;
    if (parsed.parentId !== undefined) data.parentId = parsed.parentId;
    return db.fileFolder.update({ where: { id }, data });
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
