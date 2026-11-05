// ---------------------------------------------------------------------------
// /api/files — GET the file list, POST a multipart upload (≤ 2 MiB → base64
// `data`). Guards (S13/S14): empty/whitespace filenames are rejected 400 —
// the Bun standalone multipart parser surfaces an empty name as `undefined`,
// and a 500 crash is worse than a clean rejection. NO MIME allowlist BY
// DECISION (ADR-012: the reference stores arbitrary types; the residual
// risk is mitigated by the download contract — attachment + nosniff +
// private, no-store).
// S118/BS3: POST is rate-limited 20/15 min per user (the rubric's upload
// shape — unthrottled authenticated writes fill the single-node SQLite).
// S118/BS5: the JSON link branch consumes the SHARED linkFileSchema (the
// hand-rolled near-duplicate diverged from files/link — unbounded name,
// no .url() check).
// ---------------------------------------------------------------------------

import { NextResponse, type NextRequest } from "next/server";

import { checkRateLimit } from "@/lib/auth";
import { db } from "@/lib/db";
import { linkFileSchema } from "@/lib/validation";
import {
  FILE_METADATA,
  MAX_UPLOAD_BYTES,
  UPLOAD_MIME_MAX_CHARS,
  BodyTooLargeError,
  errorResponse,
  isPrintableAsciiMime,
  parseWith,
  rateLimitedResponse,
  readBytesCapped,
  readJson,
  withUser,
} from "@/lib/server/http";

// S133/CH9: MAX_UPLOAD_BYTES now lives in http.ts (the S125/BZ8 rule —
// route files cannot export shared symbols; it sat exported here, the
// repo's own documented layering violation, with a hand-copied client
// twin in files-view.tsx).

// S82/AI6: the shared metadata select — the LIST (S81/AH13) and BOTH
// create responses (S82/AI6) carry the same shape: the base64 `data`
// column never rides a JSON response body; bytes go through the per-file
// download endpoint (`GET /api/files/[id]`).
// S125/BZ8: the select moved to src/lib/server/http.ts (FILE_METADATA) —
// route files cannot export shared symbols, and files/link had drifted to
// the full row.

export const GET = withUser(async (user) => {
  // S81/AH13: the list carries METADATA only — the base64 `data` column
  // belongs to the per-file download endpoint (`GET /api/files/[id]`). The
  // view's link-file distinction reads `url !== null`; nothing client-side
  // consumes the data column from the list. With the 2 MiB-per-file cap,
  // including it would add ~2.7 MiB of base64 to EVERY list fetch — an
  // unbounded payload as the library grows (the upload-edge audit's C8).
  // S127/CB10: the CA5 bounded window (desc + the id tiebreak + take:
  // 500) — the two hand-written file-family GETs were the only collection
  // enumerations without it, and the import route can mint ~10^5 rows in
  // a single envelope (the growth vector CA5 bounded for the factory).
  const files = await db.fileItem.findMany({
    where: { userId: user.id },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 500,
    select: FILE_METADATA,
  });
  return NextResponse.json(files);
});

export const POST = withUser(async (user, request: NextRequest) => {
  // S118/BS3 — the upload budget (both branches: the multipart upload AND
  // the JSON link creation write the same table; ONE shared bucket).
  const limit = checkRateLimit(`upload:${user.id}`, 20);
  if (!limit.ok) {
    return rateLimitedResponse(limit.retryAfterSec, "Too many uploads. Try again shortly.");
  }

  // Link-files arrive as JSON (name + url, no binary payload).
  if ((request.headers.get("content-type") ?? "").includes("application/json")) {
    // S118/BS5 — the shared schema (bounded + trimmed name, WHATWG .url()
    // AND ^https?://, bounded folderId): the same contract files/link holds.
    const { name, url, folderId } = parseWith(linkFileSchema, await readJson(request));
    let folderIdOrNull: string | null = null;
    if (folderId) {
      const folder = await db.fileFolder.findFirst({
        where: { id: folderId, userId: user.id },
        select: { id: true },
      });
      if (!folder) return errorResponse(404, "That folder does not exist.");
      folderIdOrNull = folder.id;
    }
    const link = await db.fileItem.create({
      data: {
        userId: user.id,
        name,
        mime: "text/uri-list",
        // S127/CB20: the twin entry points agree — the dedicated
        // files/link route stores url.length (an informative proxy for a
        // link's footprint); the JSON leg here stored 0, so identical user
        // actions produced rows that rendered different sizes.
        size: url.length,
        data: null,
        url,
        folderId: folderIdOrNull,
      },
      // S82/AI6: the create responses carry the SAME metadata shape as
      // the LIST (the AH13 select) — the base64 `data` column never
      // rides a JSON response body; bytes go through the per-file
      // download endpoint. The view consumes only res.ok + refresh().
      select: FILE_METADATA,
    });
    return NextResponse.json(link, { status: 201 });
  }

  // S119/BT2 — the multipart branch reads BOUNDED bytes. request.formData()
  // buffered the whole body inside the parser with no cap in any form (a
  // chunked multipart POST with no Content-Length reached the parser
  // unbounded); now the counting reader caps the RAW bytes first (the
  // 2 MiB file ceiling + the multipart envelope overhead), then formData()
  // parses the bounded buffer — byte-exact, never text-decoded (binary
  // uploads survive intact). The reconstructed Request keeps the original
  // headers (the multipart boundary lives in Content-Type).
  const UPLOAD_BODY_MAX_BYTES = MAX_UPLOAD_BYTES + 64 * 1024;
  let rawBytes: Uint8Array;
  try {
    rawBytes = await readBytesCapped(request, UPLOAD_BODY_MAX_BYTES);
  } catch (err: unknown) {
    // S146/CU3 (audit B-L2): discriminate the TYPED over-cap error from
    // transport failures — the bare catch answered a confident 413 for
    // ANY read failure (the S139/CN6 lesson the import route adopted;
    // a mid-stream client abort or a proxy hiccup is not "too large",
    // and the size-remediation copy cannot help it). Only the genuine
    // BodyTooLargeError answers 413; everything else propagates to the
    // honest 500 handler.
    if (err instanceof BodyTooLargeError) {
      return errorResponse(413, "Files are limited to 2 MiB.");
    }
    throw err;
  }
  const form = await new Request(request.url, {
    method: "POST",
    headers: request.headers,
    // TS 5.7's BlobPart wants ArrayBufferView<ArrayBuffer>; the counting
    // reader always allocates a fresh ArrayBuffer-backed view.
    body: new Blob([rawBytes.buffer as ArrayBuffer]),
  })
    .formData()
    .catch(() => null);
  if (!form) {
    return errorResponse(400, "Upload the file as multipart form data.");
  }

  const entry = form.get("file");
  // A File in every runtime — but the name can be undefined (Bun) or "".
  if (!entry || typeof entry === "string") {
    return errorResponse(400, "The upload is missing its file field.");
  }
  const name = typeof entry.name === "string" ? entry.name.trim() : "";
  if (!name) {
    return errorResponse(400, "The uploaded file needs a name.");
  }
  // S122/BW13: the name contract of the JSON/link branch (linkFileSchema:
  // trim + max 200) — the multipart branch only trimmed, leaving the
  // length unbounded (row bloat; serve-time was already safe).
  if (name.length > 200) {
    return errorResponse(400, "File names are limited to 200 characters.");
  }
  // S146/CU1 (audit B-M1): the multipart mime guard — the import door
  // caps the identical column at 100 printable-ASCII chars (the CE7
  // bloat class: a poisoned oversized mime rides FILE_METADATA into
  // EVERY files list GET), but this door stored `entry.type` verbatim;
  // a hand-crafted multipart body writes the part Content-Type into the
  // row (the drive probe: a 150-char printable mime stored verbatim;
  // the parser sanitizes the charset family itself, the
  // belt-and-suspenders posture). The unknown-type "" shape keeps the
  // octet-stream fallback below.
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

  // Optional folder placement — ownership-checked like everything else.
  const rawFolder = form.get("folderId");
  let folderId: string | null = null;
  if (typeof rawFolder === "string" && rawFolder.length > 0) {
    const folder = await db.fileFolder.findFirst({
      where: { id: rawFolder, userId: user.id },
      select: { id: true },
    });
    if (!folder) return errorResponse(404, "That folder does not exist.");
    folderId = folder.id;
  }

  const bytes = Buffer.from(await entry.arrayBuffer());
  const created = await db.fileItem.create({
    data: {
      userId: user.id,
      name,
      mime: entry.type || "application/octet-stream",
      size: entry.size,
      data: bytes.toString("base64"),
      url: null,
      folderId,
    },
    // S82/AI6: the upload's 201 echoed the FULL row including the base64
    // `data` column (a 2 MiB upload returned a ~2.7 MiB response body) —
    // the create response now carries the LIST's metadata shape.
    select: FILE_METADATA,
  });

  return NextResponse.json(created, { status: 201 });
});
