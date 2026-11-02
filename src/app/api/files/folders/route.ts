// ---------------------------------------------------------------------------
// /api/files/folders — the folder collection (GET list + POST create).
// Folder nesting is self-referential (parentId → FileFolder, SetNull); a
// dangling parent id is rejected here so the tree never renders a ghost.
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";
import { z } from "zod";

import { checkRateLimit } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  rateLimitedResponse,
  errorResponse,
  parseWith,
  readJson,
  toErrorResponse,
  withUser,
} from "@/lib/server/http";
import { nullableId } from "@/lib/validation";

const folderCreateSchema = z.object({
  name: z.string().min(1).max(200),
  // S123/BX5: the shared nullableId atom — the route-local twin's
  // ""→null transform was DEAD CODE (idField's min(1) rejected "" first,
  // so the clear-to-root convention every other entity FK honors 400'd
  // at the folder routes).
  parentId: nullableId,
});

export const GET = withUser(async (user) => {
  // S127/CB10: the CA5 bounded window, asc-shaped (the tree's roots-first
  // order preserved) + the id tiebreak — the import route can mint ~10^5
  // folder rows in a single envelope, the exact growth vector CA5 bounded
  // for the 16 factory collections; these two hand-written file-family
  // GETs were the stragglers.
  const folders = await db.fileFolder.findMany({
    where: { userId: user.id },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    take: 500,
  });
  return NextResponse.json(folders);
});

export const POST = withUser(async (user, request) => {
  // S130/CE6: the folder-create budget — the file-family write path (the
  // upload bucket: a folder is a file-system row the same way a link-file
  // is; pre-fix this was the only table-writing POST with NO budget — an
  // authenticated script churned folder creates at line rate on the
  // single-node SQLite).
  const limit = checkRateLimit(`upload:${user.id}`, 20);
  if (!limit.ok) {
    return rateLimitedResponse(limit.retryAfterSec, "Too many uploads. Try again shortly.");
  }
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
