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
  // S81/AH13: the list carries METADATA only — the base64 `data` column
  // belongs to the per-file download endpoint (`GET /api/files/[id]`). The
  // view's link-file distinction reads `url !== null`; nothing client-side
  // consumes the data column from the list. With the 2 MiB-per-file cap,
  // including it would add ~2.7 MiB of base64 to EVERY list fetch — an
  // unbounded payload as the library grows (the upload-edge audit's C8).
  const files = await db.fileItem.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      userId: true,
      name: true,
      mime: true,
      size: true,
      url: true,
      folderId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return NextResponse.json(files);
});

export const POST = withUser(async (user, request: NextRequest) => {
  // Link-files arrive as JSON (name + url, no binary payload).
  if ((request.headers.get("content-type") ?? "").includes("application/json")) {
    const raw: unknown = await request.json().catch(() => null);
    if (typeof raw !== "object" || raw === null) {
      return errorResponse(400, "The link payload must be a JSON object.");
    }
    const body = raw as { name?: unknown; url?: unknown; folderId?: unknown };
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const url = typeof body.url === "string" ? body.url.trim() : "";
    if (!name) return errorResponse(400, "The link needs a name.");
    if (!/^https?:\/\//i.test(url)) {
      return errorResponse(400, "The link needs a valid http(s) URL.");
    }
    let folderId: string | null = null;
    if (typeof body.folderId === "string" && body.folderId.length > 0) {
      const folder = await db.fileFolder.findFirst({
        where: { id: body.folderId, userId: user.id },
        select: { id: true },
      });
      if (!folder) return errorResponse(404, "That folder does not exist.");
      folderId = folder.id;
    }
    const link = await db.fileItem.create({
      data: {
        userId: user.id,
        name,
        mime: "text/uri-list",
        size: 0,
        data: null,
        url,
        folderId,
      },
    });
    return NextResponse.json(link, { status: 201 });
  }

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
