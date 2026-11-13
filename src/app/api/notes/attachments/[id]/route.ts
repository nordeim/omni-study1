// ---------------------------------------------------------------------------
// /api/notes/attachments/[id] — GET the FLAT download (S180/ED — the plan
// §3.1): the files/[id] contract VERBATIM (the S13/S14 download posture —
// attachment with the RFC 5987 disposition, nosniff, private no-store),
// serving STAGED and BOUND rows alike — the draft chip's href is LIVE
// before the Save binds the row to a note, so the route must answer both.
// Ownership-scoped like every read (a staged row belongs to its uploader
// until the bind).
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";
import { Buffer } from "node:buffer";

import { db } from "@/lib/db";
import { downloadHeaders, errorResponse, withUserParams } from "@/lib/server/http";

export const GET = withUserParams(async (user, _request, id) => {
  const attachment = await db.noteAttachment.findFirst({
    where: { id, userId: user.id },
  });
  if (!attachment || !attachment.data) {
    return errorResponse(404, "This attachment has no downloadable content.");
  }
  const bytes = Buffer.from(attachment.data, "base64");
  return new NextResponse(bytes, {
    status: 200,
    headers: downloadHeaders(
      attachment.name,
      attachment.mime || "application/octet-stream",
    ),
  });
});
