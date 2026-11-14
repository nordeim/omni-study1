// ---------------------------------------------------------------------------
// /api/files/[id] — GET the download (the S13/S14 contract: attachment with
// the RFC 5987 disposition, nosniff, private no-store; data streams from
// the base64 column) + the S183/EG guarded ?inline=1 preview mode (image
// mimes only — the previewHeaders seam) + PATCH the move (the S183/EG
// click-moves wire) + DELETE. Link-files (data null) have nothing to
// download — 404 with the actionable message.
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";
import { Buffer } from "node:buffer";

import { checkRateLimit } from "@/lib/auth";
import { db } from "@/lib/db";
import { moveFileSchema } from "@/lib/validation";
import {
  downloadHeaders,
  errorResponse,
  parseWith,
  previewHeaders,
  rateLimitedResponse,
  readJson,
  withUserParams,
} from "@/lib/server/http";

export const GET = withUserParams(async (user, request, id) => {
  const file = await db.fileItem.findFirst({ where: { id, userId: user.id } });
  if (!file || !file.data) {
    return errorResponse(404, "This item has no downloadable content.");
  }
  const bytes = Buffer.from(file.data, "base64");
  // S183/EG: the guarded inline mode — the preview tile + the "View" dialog
  // render through <img>, which will not decode an attachment-disposition
  // response. The guard is the SERVER's: ?inline=1 flips the disposition
  // for IMAGE mimes only (previewHeaders); everything else keeps the
  // attachment contract whatever the caller asks.
  const wantsInline = new URL(request.url).searchParams.get("inline") === "1";
  const headers = wantsInline
    ? previewHeaders(file.name, file.mime || "application/octet-stream")
    : downloadHeaders(file.name, file.mime || "application/octet-stream");
  return new NextResponse(bytes, { status: 200, headers });
});

// S183/EG — the move: the reference's click-moves dialog wire. The
// destination folder is ownership-re-checked (a foreign folderId is a 404,
// never a silent cross-user write); null moves the row to the root.
export const PATCH = withUserParams(async (user, request, id) => {
  // The CB7 class: the mutate budget (PATCH + DELETE share write:600).
  const limit = checkRateLimit(`write:${user.id}`, 600);
  if (!limit.ok) {
    return rateLimitedResponse(limit.retryAfterSec, "Too many requests. Please slow down.");
  }
  const { folderId } = parseWith(moveFileSchema, await readJson(request));
  const file = await db.fileItem.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  });
  if (!file) {
    return errorResponse(404, "That record does not exist.");
  }
  let folderIdOrNull: string | null = null;
  if (folderId) {
    const folder = await db.fileFolder.findFirst({
      where: { id: folderId, userId: user.id },
      select: { id: true },
    });
    if (!folder) {
      return errorResponse(404, "That folder does not exist.");
    }
    folderIdOrNull = folder.id;
  }
  const updated = await db.fileItem.update({
    where: { id: file.id },
    data: { folderId: folderIdOrNull },
    // The move answer carries the metadata shape (the AH13/AI6 contract —
    // the base64 column never rides a JSON response).
    select: { id: true, name: true, mime: true, size: true, url: true, folderId: true },
  });
  return NextResponse.json(updated);
});

export const DELETE = withUserParams(async (user, _request, id) => {
  // S130/CE6: the delete budget (the CB7 class — the factory DELETEs ride
  // write:600; this hand-written twin rode nothing).
  const limit = checkRateLimit(`write:${user.id}`, 600);
  if (!limit.ok) {
    return rateLimitedResponse(limit.retryAfterSec, "Too many requests. Please slow down.");
  }
  const file = await db.fileItem.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  });
  if (!file) {
    return errorResponse(404, "That record does not exist.");
  }
  await db.fileItem.delete({ where: { id: file.id } });
  return NextResponse.json({ ok: true });
});
