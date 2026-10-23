// group-members.ts — the pure study-group members seam (S85/AL1).
//
// The API boundary ships `members` as an ARRAY (entities.ts membersFromRow:
// "the API boundary carries members as an ARRAY; the column is a JSON
// string"). The client's original parseMembers ran JSON.parse on that array — the argument coerced
// to "[object Object]", threw, and the catch returned [] — so every group
// rendered "0 members", addMember started from [] and WIPED the existing
// members, and the edit-dialog save sent members: [] (the wipe again).
// The store's type now tells the truth (StudyGroupRow.members:
// GroupMember[]); this seam is the defensive validator the view consumes —
// malformed items drop, never throw, and the legacy JSON-STRING shape (a
// future/alternate boundary, or a stale cache) is tolerated rather than
// trusted.
//
// S86/AM1: the server schema now AGREES with this seam's blank-after-trim
// drop (studyGroupSchema members[].name/.email are .trim()-first — blank
// writes are rejected at the API, padded values persist trimmed). The drop
// below is defense-in-depth for legacy/corrupt rows only; it can no longer
// silently delete a row the server would have persisted.
//
// S87/AN4: the seam now trims on READ too (the AM1 write-side symmetry) —
// legacy rows stored pre-AM1 with padded values display normalized
// instead of waiting for their first re-write. Both sides of the boundary
// share the same normalization.

export interface GroupMember {
  name: string;
  email: string;
}

/** Validate a members value in either boundary shape (the API's array, or
 *  the legacy JSON string). Invalid items drop; garbage drops to []. */
export function normalizeMembers(value: unknown): GroupMember[] {
  let parsed: unknown = value;
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(parsed)) return [];
  return parsed.flatMap((item) => {
    if (typeof item !== "object" || item === null) return [];
    const { name, email } = item as Record<string, unknown>;
    if (typeof name !== "string" || typeof email !== "string") return [];
    if (!name.trim() || !email.trim()) return [];
    return [{ name: name.trim(), email: email.trim() }];
  });
}
