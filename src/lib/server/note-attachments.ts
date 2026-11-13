// ---------------------------------------------------------------------------
// S180/ED — the note-attachments server seam (docs/remediation-plan-session180.md
// §3.1). The Attach-File wire feature's server half: the derived download
// url (never stored — no drift hazard), the url→id parse, the
// ownership-verified bind transaction (the Save's attachments array is the
// AUTHORITATIVE DESIRED LIST — staged rows join the note, rows no longer
// listed leave it), and the include reads (the note GETs carry the bound
// rows with derived urls).
//
// The reference's measured wire (2026-11-13, computed DOM + the net probe,
// zero residue): the pick uploads IMMEDIATELY (the reference POSTs multipart
// to its platform endpoint and receives {file_url}); the Save's POST body
// carries attachments: [{name, url}]; the chip X-remove is LOCAL-only (zero
// network); the view pills render the persisted list. The clone's mapping:
// the staged upload route mints the row + the derived url, the flat
// download route serves STAGED and bound rows (the draft chip's href is
// live before the Save binds), and the bind rides the create POST / the
// update PATCH through this seam.
//
// Layering: the URL PREFIX and the CAP live in validation.ts (the
// client-safe single source — the wire atom validates the shape there);
// this seam imports them. NEVER factory-listed — no standalone collection
// route exists for attachments (the staged upload POST + the flat download
// GET + the note include are the surface).
// ---------------------------------------------------------------------------

import { db } from "@/lib/db";
import { ValidationError } from "@/lib/server/http";
import { NOTE_ATTACHMENT_URL_PREFIX } from "@/lib/validation";

/** The read select for every noteAttachment JSON body (the AH13/FILE_METADATA
 * doctrine — the base64 `data` column NEVER rides a JSON response; bytes go
 * through the flat download route). */
export const NOTE_ATTACHMENT_METADATA = {
  id: true,
  name: true,
  createdAt: true,
} as const;

/** The wire shape the Save carries (the reference's own {name, url}). */
export type NoteAttachmentRef = { name: string; url: string };

/** The derived download url — the single source of the chip/pill href. */
export function noteAttachmentUrl(id: string): string {
  return `${NOTE_ATTACHMENT_URL_PREFIX}${id}`;
}

/** The url → id parse (the bind leg's input guard — the atom mirrors the
 * prefix at the schema; this recovers the id the seam itself minted).
 * Throws ValidationError (the 400 family) on a foreign prefix or an
 * id shape no route can serve. */
export function attachmentIdFromUrl(url: string): string {
  if (!url.startsWith(NOTE_ATTACHMENT_URL_PREFIX)) {
    throw new ValidationError(
      "Attachment links must point at the note-attachment download route.",
    );
  }
  const id = url.slice(NOTE_ATTACHMENT_URL_PREFIX.length);
  // The idField shape (64) — a longer id matches no row any route owns.
  if (id.length === 0 || id.length > 64) {
    throw new ValidationError("Attachment links carry an invalid file id.");
  }
  return id;
}

/** The include read shape: the note's bound rows, oldest-first (the chip
 * order matches the reference's upload order), metadata only. (No
 * `as const` on the ARRAY — Prisma's orderBy wants the mutable literal
 * form; the literals themselves carry the "asc" types.) */
const NOTE_ATTACHMENT_INCLUDE = {
  attachments: {
    orderBy: [{ createdAt: "asc" as const }, { id: "asc" as const }],
    select: NOTE_ATTACHMENT_METADATA,
  },
};

/** Derive the url onto every bound row (the read boundary — the column
 * never stores it). */
function withAttachmentUrls<
  T extends { id: string; attachments?: Array<{ id: string }> },
>(
  row: T,
): T & { attachments: Array<{ id: string; name?: string; createdAt?: Date; url: string }> } {
  return {
    ...row,
    attachments: (row.attachments ?? []).map((a) => ({
      ...a,
      url: noteAttachmentUrl(a.id),
    })),
  };
}

/** The note list GET's read: the factory's newest-500 window (desc + the id
 * tiebreak + take 500) reversed to the asc presentation, with the
 * attachments include + the derived urls. */
export async function listNotesWithAttachments(userId: string) {
  const rows = await db.note.findMany({
    where: { userId },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 500,
    include: NOTE_ATTACHMENT_INCLUDE,
  });
  return rows.reverse().map((row) => withAttachmentUrls(row));
}

/** The single-note include read (the POST/PATCH response body) — null for a
 * foreign or missing note (the caller maps the NotFoundError family). */
export async function readNoteWithAttachments(userId: string, id: string) {
  const row = await db.note.findFirst({
    where: { id, userId },
    include: NOTE_ATTACHMENT_INCLUDE,
  });
  return row ? withAttachmentUrls(row) : null;
}

/**
 * The ownership-verified bind (the Save leg). The list is the
 * AUTHORITATIVE DESIRED SET of the note's attachments:
 * 1. every listed url must recover an id this seam minted (the prefix +
 *    id-shape guard);
 * 2. every listed row must exist AND belong to the caller (the ownership
 *    verification — a foreign id answers the 400 family, never a
 *    silent bind) AND be either STAGED (noteId null) or already bound to
 *    THIS note (the idempotent re-list; a row bound to ANOTHER note
 *    rejects — the CN10 owned-FK re-point posture);
 * 3. the staged rows bind (noteId null → the note);
 * 4. the note's rows NOT in the list LEAVE (the removal leg — the measured
 *    local X-remove persists through the Save's array).
 * All inside ONE transaction: a mid-list failure leaves the note's set
 * untouched.
 */
export async function bindNoteAttachments(
  userId: string,
  noteId: string,
  refs: NoteAttachmentRef[],
): Promise<void> {
  const ids = [...new Set(refs.map((r) => attachmentIdFromUrl(r.url)))];
  await db.$transaction(async (tx) => {
    const rows = await tx.noteAttachment.findMany({
      where: { id: { in: ids }, userId },
      select: { id: true, noteId: true },
    });
    const boundTo = new Map(rows.map((r) => [r.id, r.noteId]));
    for (const id of ids) {
      const current = boundTo.get(id);
      if (current === undefined) {
        throw new ValidationError("That attachment does not exist.");
      }
      if (current !== null && current !== noteId) {
        throw new ValidationError(
          "That attachment belongs to another note.",
        );
      }
    }
    if (ids.length > 0) {
      await tx.noteAttachment.updateMany({
        where: { id: { in: ids }, userId, noteId: null },
        data: { noteId },
      });
    }
    // The removal leg — an empty list deletes every row of the note (the
    // authoritative-desired-set contract).
    await tx.noteAttachment.deleteMany({
      where: { noteId, userId, id: { notIn: ids } },
    });
  });
}
