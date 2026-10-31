// ---------------------------------------------------------------------------
// /api/files/folders — the folder collection (GET list + POST create).
// Folder nesting is self-referential (parentId → FileFolder, SetNull); a
// dangling parent id is rejected here so the tree never renders a ghost.
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import {
  errorResponse,
  parseWith,
  readJson,
  toErrorResponse,
  withUser,
} from "@/lib/server/http";
import { idField } from "@/lib/validation";

const folderCreateSchema = z.object({
  name: z.string().min(1).max(200),
  // S119/BT4: the shared idField bound (was z.string().min(1) — unbounded).
  parentId: idField
    .nullish()
    .transform((v) => (v === "" ? null : v)),
});

export const GET = withUser(async (user) => {
  const folders = await db.fileFolder.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(folders);
});

export const POST = withUser(async (user, request) => {
  try {
    const { name, parentId } = parseWith(
      folderCreateSchema,
      await readJson(request),
    );
    if (parentId) {
      const parent = await db.fileFolder.findFirst({
        where: { id: parentId, userId: user.id },
        select: { id: true },
      });
      if (!parent) return errorResponse(404, "That folder does not exist.");
    }
    const folder = await db.fileFolder.create({
      data: { userId: user.id, name, parentId: parentId ?? null },
    });
    return NextResponse.json(folder, { status: 201 });
  } catch (err: unknown) {
    return toErrorResponse(err);
  }
});
