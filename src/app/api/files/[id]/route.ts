// ---------------------------------------------------------------------------
// /api/files/[id] — GET the download (the S13/S14 contract: attachment with
// the RFC 5987 disposition, nosniff, private no-store; data streams from
// the base64 column) + DELETE. Link-files (data null) have nothing to
// download — 404 with the actionable message.
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";
import { Buffer } from "node:buffer";

import { db } from "@/lib/db";
import { downloadHeaders, errorResponse, withUserParams } from "@/lib/server/http";

export const GET = withUserParams(async (user, _request, id) => {
  const file = await db.fileItem.findFirst({ where: { id, userId: user.id } });
  if (!file || !file.data) {
    return errorResponse(404, "This item has no downloadable content.");
  }
  const bytes = Buffer.from(file.data, "base64");
  return new NextResponse(bytes, {
    status: 200,
    headers: downloadHeaders(file.name, file.mime || "application/octet-stream"),
  });
});

export const DELETE = withUserParams(async (user, _request, id) => {
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
