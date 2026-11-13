// ---------------------------------------------------------------------------
// /api/notes/attachments — POST the STAGED multipart upload (S180/ED — the
// plan §3.1). The reference's measured posture: the upload fires
// IMMEDIATELY on pick (its own platform endpoint, {file_url} back); the
// clone mints a STAGED NoteAttachment row (noteId null — the draft's
// upload scratch) and answers the row + the DERIVED download url, which
// the draft chip's href renders LIVE before the Save binds it.
//
// The guards are the Files POST's multipart branch VERBATIM (the S13/S14
// contract): the `upload:${user.id}` 20/15-min budget (ONE shared bucket
// with the files uploads — the BZ5 one-budget-per-user posture), the
// bounded raw-byte read (MAX_UPLOAD_BYTES + the 64 KiB multipart
// envelope), the empty-name / 200-char name / printable-ASCII mime /
// 2 MiB size family. NO MIME allowlist by the ADR-012 decision (the
// download contract — attachment + nosniff + private no-store — is the
// mitigation).
// ---------------------------------------------------------------------------

import { NextResponse, type NextRequest } from "next/server";

import { checkRateLimit } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  noteAttachmentUrl,
  NOTE_ATTACHMENT_METADATA,
} from "@/lib/server/note-attachments";
import {
  BodyTooLargeError,
  errorResponse,
  isPrintableAsciiMime,
  MAX_UPLOAD_BYTES,
  rateLimitedResponse,
  readBytesCapped,
  UPLOAD_MIME_MAX_CHARS,
  withUser,
} from "@/lib/server/http";

export const POST = withUser(async (user, request: NextRequest) => {
  const limit = checkRateLimit(`upload:${user.id}`, 20);
  if (!limit.ok) {
    return rateLimitedResponse(limit.retryAfterSec, "Too many uploads. Try again shortly.");
  }

  // S119/BT2 — the bounded raw-byte read, then formData() over the bounded
  // buffer (byte-exact, never text-decoded; the boundary rides the
  // original headers).
  const UPLOAD_BODY_MAX_BYTES = MAX_UPLOAD_BYTES + 64 * 1024;
  let rawBytes: Uint8Array;
  try {
    rawBytes = await readBytesCapped(request, UPLOAD_BODY_MAX_BYTES);
  } catch (err: unknown) {
    // S146/CU3: only the genuine over-cap error answers 413.
    if (err instanceof BodyTooLargeError) {
      return errorResponse(413, "Files are limited to 2 MiB.");
    }
    throw err;
  }
  const form = await new Request(request.url, {
    method: "POST",
    headers: request.headers,
    body: new Blob([rawBytes.buffer as ArrayBuffer]),
  })
    .formData()
    .catch(() => null);
  if (!form) {
    return errorResponse(400, "Upload the file as multipart form data.");
  }

  const entry = form.get("file");
  if (!entry || typeof entry === "string") {
    return errorResponse(400, "The upload is missing its file field.");
  }
  const name = typeof entry.name === "string" ? entry.name.trim() : "";
  if (!name) {
    return errorResponse(400, "The uploaded file needs a name.");
  }
  if (name.length > 200) {
    return errorResponse(400, "File names are limited to 200 characters.");
  }
  // S146/CU1: the mime guard (the CE7 bloat class — the column answers
  // every download's Content-Type).
  if (typeof entry.type === "string" && entry.type.length > 0) {
    if (entry.type.length > UPLOAD_MIME_MAX_CHARS) {
      return errorResponse(400, "File types are limited to 100 characters.");
    }
    if (!isPrintableAsciiMime(entry.type)) {
      return errorResponse(
        400,
        "File types must be printable ASCII — control characters and non-ASCII text cannot be stored as a file type.",
      );
    }
  }
  if (entry.size > MAX_UPLOAD_BYTES) {
    return errorResponse(413, "Files are limited to 2 MiB.");
  }

  const bytes = Buffer.from(await entry.arrayBuffer());
  // The staged row: noteId null (the draft's scratch). The Save's bind
  // (the custom note routes, through the seam) sets the noteId; a
  // picked-but-never-saved row stays staged — the reference's own
  // posture (its probe uploads linger on its CDN; the export NEVER
  // carries staged rows, and the 20/15-min budget bounds growth).
  const created = await db.noteAttachment.create({
    data: {
      userId: user.id,
      noteId: null,
      name,
      mime: entry.type || "application/octet-stream",
      size: entry.size,
      data: bytes.toString("base64"),
    },
    select: NOTE_ATTACHMENT_METADATA,
  });
  return NextResponse.json(
    { ...created, url: noteAttachmentUrl(created.id) },
    { status: 201 },
  );
});
