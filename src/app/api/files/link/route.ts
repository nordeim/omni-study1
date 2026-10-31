// ---------------------------------------------------------------------------
// /api/files/link — POST a link-item: the URL is stored, `data` stays null
// (the download route answers 404 for them — there is nothing to stream).
// The Files view renders links with the item's name; the mime is the URI
// list type so the record self-describes. S117/BR4: the URL rule lives in
// the shared linkFileSchema (src/lib/validation.ts) — http(s) only, the
// same rule the upload route has enforced since S14.
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";

import { checkRateLimit } from "@/lib/auth";
import { db } from "@/lib/db";
import { linkFileSchema } from "@/lib/validation";
import {
  errorResponse,
  parseWith,
  rateLimitedResponse,
  readJson,
  toErrorResponse,
  withUser,
} from "@/lib/server/http";

export const POST = withUser(async (user, request) => {
  try {
    // S118/BS3 — the SHARED upload budget (the files POST's own bucket:
    // both routes write the same table with the same class of payload).
    const limit = checkRateLimit(`upload:${user.id}`, 20);
    if (!limit.ok) {
      return rateLimitedResponse(limit.retryAfterSec, "Too many uploads. Try again shortly.");
    }

    const { name, url, folderId } = parseWith(linkFileSchema, await readJson(request));
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
