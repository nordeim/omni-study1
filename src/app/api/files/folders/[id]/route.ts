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
import { sentKeysPatch } from "@/lib/server/entities";

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
    // S83/AJ1: the sent-keys filter — the seventeenth write site joins the
    // sentKeysPatch convention (the AI1 lesson: a fix's coverage claim must
    // hold at EVERY write site; a hand-filtered `!== undefined` check reads
    // a materialized zod default as a sent key, the exact AH8 data-loss
    // class). Sent keys intersected with the schema-validated parsed keys.
    const writes = sentKeysPatch(input, parsed) as {
      name?: string;
      parentId?: string | null;
    };
    if (writes.parentId) {
      const parent = await db.fileFolder.findFirst({
        where: { id: writes.parentId, userId },
        select: { id: true },
      });
      if (!parent) throw new NotFoundError("That folder does not exist.");
    }
    if (Object.keys(writes).length === 0) {
      // An empty patch is a no-op — short-circuit to the existing row
      // (S83/AJ2, verified against Prisma 6.11: an update with an empty
      // data object is ACCEPTED as a no-op; the short-circuit avoids the
      // pointless write, matching the factory and the card delegate).
      return existing;
    }
    return db.fileFolder.update({ where: { id }, data: writes });
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
