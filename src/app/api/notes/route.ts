// ---------------------------------------------------------------------------
// /api/notes — the ownership-scoped collection (GET list + POST create),
// the CUSTOM pair over the delegate factory (S180/ED — the plan §3.1): the
// GET carries the attachments include (the bound rows with DERIVED urls);
// the POST parses the S180 noteSchema (validating the attachments wire
// atom), writes the base row through the delegate (the sanitize gate +
// ownedFks + the writeTransform strip ride unchanged), and BINDS the
// attachments list (the staged rows join the note — the reference's
// measured Save wire: the POST body carries attachments: [{name, url}]).
// Every helper is the factory's own (withUser, readJson, parseWith, the
// write budget) — this route differs from makeCollectionRoutes ONLY in the
// bind leg + the include reads.
// ---------------------------------------------------------------------------

import { NextResponse, type NextRequest } from "next/server";

import { checkRateLimit } from "@/lib/auth";
import { noteSchema } from "@/lib/validation";
import {
  bindNoteAttachments,
  listNotesWithAttachments,
  readNoteWithAttachments,
} from "@/lib/server/note-attachments";
import { noteDelegate } from "@/lib/server/entities";
import {
  parseWith,
  rateLimitedResponse,
  readJson,
  withUser,
} from "@/lib/server/http";

export const GET = withUser(async (user) => {
  const rows = await listNotesWithAttachments(user.id);
  return NextResponse.json(rows);
});

export const POST = withUser(async (user, request: NextRequest) => {
  // The BZ5 shared write budget — verbatim from makeCollectionRoutes.
  const limit = checkRateLimit(`write:${user.id}`, 600);
  if (!limit.ok) {
    return rateLimitedResponse(
      limit.retryAfterSec,
      "Too many requests. Please slow down.",
    );
  }
  const raw = await readJson(request);
  // The S180 raw-split: parse the create schema for the attachments list
  // (the 400 family fires HERE on a bad list — the cap, the prefix, the
  // name bound); the delegate parses again internally (the strip composes
  // in its writeTransform, so the atom never reaches Prisma).
  const parsed = parseWith(noteSchema, raw);
  const created = (await noteDelegate.create(user.id, raw)) as { id: string };
  if (parsed.attachments !== undefined) {
    await bindNoteAttachments(user.id, created.id, parsed.attachments);
  }
  // The response carries the include read (the created note + its bound
  // rows) — the view's pills/chips read the derived urls from here.
  const row = await readNoteWithAttachments(user.id, created.id);
  return NextResponse.json(row, { status: 201 });
});
