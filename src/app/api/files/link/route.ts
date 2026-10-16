// ---------------------------------------------------------------------------
// /api/files/link — POST a link-item: the URL is stored, `data` stays null
// (the download route answers 404 for them — there is nothing to stream).
// The Files view renders links with the item's name; the mime is the URI
// list type so the record self-describes.
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

const linkSchema = z.object({
  name: z.string().min(1).max(200),
  url: z.string().url().max(2000),
  folderId: z.string().min(1).nullish().transform((v) => (v === "" ? null : v)),
});

export const POST = withUser(async (user, request) => {
  try {
    const { name, url, folderId } = parseWith(linkSchema, await readJson(request));
    if (folderId) {
      const folder = await db.fileFolder.findFirst({
        where: { id: folderId, userId: user.id },
        select: { id: true },
      });
      if (!folder) return errorResponse(404, "That folder does not exist.");
    }
    const created = await db.fileItem.create({
      data: {
        userId: user.id,
        name,
        mime: "text/uri-list",
        size: url.length,
        data: null,
        url,
        folderId: folderId ?? null,
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    return toErrorResponse(err);
  }
});
