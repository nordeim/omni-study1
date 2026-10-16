// ---------------------------------------------------------------------------
// /api/files — GET the file list, POST a multipart upload (≤ 2 MiB → base64
// `data`). Guards (S13/S14): empty/whitespace filenames are rejected 400 —
// the Bun standalone multipart parser surfaces an empty name as `undefined`,
// and a 500 crash is worse than a clean rejection. NO MIME allowlist BY
// DECISION (ADR-012: the reference stores arbitrary types; the residual
// risk is mitigated by the download contract — attachment + nosniff +
// private, no-store).
// ---------------------------------------------------------------------------

import { NextResponse, type NextRequest } from "next/server";

import { db } from "@/lib/db";
import { errorResponse, toErrorResponse, withUser } from "@/lib/server/http";

export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024; // 2 MiB

export const GET = withUser(async (user) => {
  const files = await db.fileItem.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(files);
});

export const POST = withUser(async (user, request: NextRequest) => {
  const form = await request.formData().catch(() => null);
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
  });

  return NextResponse.json(created, { status: 201 });
});
