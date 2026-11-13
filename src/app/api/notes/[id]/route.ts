// ---------------------------------------------------------------------------
// /api/notes/[id] — the ownership-scoped item routes (PATCH + DELETE), the
// CUSTOM pair over the delegate factory (S180/ED — the plan §3.1): the
// PATCH parses noteSchema.partial() for the attachments wire atom (the
// SENT-key distinction — an ABSENT key leaves the note's attachments
// untouched; a SENT array is the authoritative desired list that binds),
// writes the base row through the delegate (the sent-keys filter + the
// sanitize gate + the strip ride unchanged), and BINDS the list; the
// DELETE rides the delegate (the schema's Cascade clears the note's
// attachment rows). The response bodies carry the include read (the note
// + its bound rows with derived urls).
// ---------------------------------------------------------------------------

import { NextResponse, type NextRequest } from "next/server";

import { checkRateLimit } from "@/lib/auth";
import { noteSchema } from "@/lib/validation";
import {
  bindNoteAttachments,
  readNoteWithAttachments,
} from "@/lib/server/note-attachments";
import { noteDelegate } from "@/lib/server/entities";
import {
  parseWith,
  rateLimitedResponse,
  readJson,
  withUserParams,
} from "@/lib/server/http";

export const PATCH = withUserParams(async (user, request: NextRequest, id) => {
  // The CB7 shared write budget — verbatim from makeItemRoutes.
  const limit = checkRateLimit(`write:${user.id}`, 600);
  if (!limit.ok) {
    return rateLimitedResponse(
      limit.retryAfterSec,
      "Too many requests. Please slow down.",
    );
  }
  const raw = await readJson(request);
  // The S180 raw-split: the PARTIAL schema validates the field-scoped
  // patch AND the attachments atom (a bad list 400s before any write);
  // `parsed.attachments === undefined` is the ABSENT case (the run-2
  // lesson: a .default([]) atom would fire under .partial() and turn
  // every title/content/tags PATCH into an attachments wipe — the atom
  // stays optional, the sent-key distinction lives in the raw body).
  const parsed = parseWith(noteSchema.partial(), raw);
  // The delegate's update owns the ownership check (NotFoundError for a
  // foreign id), the sent-keys filter, and the strip + sanitize write.
  await noteDelegate.update(user.id, id, raw);
  if (parsed.attachments !== undefined) {
    await bindNoteAttachments(user.id, id, parsed.attachments);
  }
  const row = await readNoteWithAttachments(user.id, id);
  return NextResponse.json(row);
});

export const DELETE = withUserParams(async (user, _request: NextRequest, id) => {
  const limit = checkRateLimit(`write:${user.id}`, 600);
  if (!limit.ok) {
    return rateLimitedResponse(
      limit.retryAfterSec,
      "Too many requests. Please slow down.",
    );
  }
  // The delegate's remove verifies ownership; the NoteAttachment.note
  // relation's onDelete: Cascade clears the bound rows in the same write.
  await noteDelegate.remove(user.id, id);
  return NextResponse.json({ ok: true });
});
