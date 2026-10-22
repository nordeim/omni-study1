// ---------------------------------------------------------------------------
// PATCH /api/settings/preferences — theme mode, accent, avatar, display
// name + the S17 study-profile fields. The S14-B3 guard: a whitespace-only
// display name is rejected 400 ("Display name…") and a padded name is
// stored TRIMMED. The `name` field is the client's alias for the schema's
// displayName. The hashless updated user rides the response so the store's
// user slice updates in place.
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { preferencesSchema } from "@/lib/validation";
import { publicUser } from "@/lib/server/auth";
import {
  errorResponse,
  parseWith,
  readJson,
  toErrorResponse,
  withUser,
} from "@/lib/server/http";

type PrefsBody = { name?: unknown; displayName?: unknown };

export const PATCH = withUser(async (user, request) => {
  try {
    const raw = (await readJson(request)) as PrefsBody;

    // The display-name guard runs BEFORE the schema (the schema's strip
    // mode would silently drop an unknown `name` alias otherwise).
    const rawName = raw.displayName !== undefined ? raw.displayName : raw.name;
    if (rawName !== undefined) {
      if (typeof rawName !== "string" || rawName.trim().length === 0) {
        return errorResponse(400, "Display name cannot be empty.");
      }
    }

    // Map the client `name` alias onto the schema key BEFORE parsing — the
    // object schema strips unknown keys, so an unmapped alias silently
    // no-ops (the S14-B3 padded-name lesson).
    const schemaInput =
      rawName !== undefined && typeof rawName === "string"
        ? { ...raw, displayName: rawName }
        : raw;
    const prefs = parseWith(preferencesSchema, schemaInput);
    const data: Record<string, unknown> = {};
    if (prefs.themeMode !== undefined) data.themeMode = prefs.themeMode;
    if (prefs.accentColor !== undefined) data.accentColor = prefs.accentColor;
    if (prefs.avatarEmoji !== undefined) data.avatarEmoji = prefs.avatarEmoji;
    if (prefs.displayName !== undefined) data.fullName = prefs.displayName.trim();
    if (prefs.schoolName !== undefined) data.schoolName = prefs.schoolName;
    if (prefs.gradeLevel !== undefined) data.gradeLevel = prefs.gradeLevel;
    if (prefs.studyGoalHours !== undefined) data.studyGoalHours = prefs.studyGoalHours;
    if (prefs.notificationsEnabled !== undefined) {
      data.notificationsEnabled = prefs.notificationsEnabled;
    }

    // S83/AJ4 (the s83 audit's write-site census — the eighteenth site,
    // certified): this hand-built `!== undefined` filter is the sent-keys
    // filter inlined. It cannot use the shared sentKeysPatch helper
    // because the alias mapping (client `name`/`displayName` → column
    // `fullName`, etc.) breaks the sent-key ↔ parsed-key correspondence
    // the helper's intersection requires. SAFE against the AH8 class
    // because preferencesSchema carries NO create-time defaults — any
    // `.default()` added to it would materialize here as a sent key and
    // silently reset that column on every partial save. An empty data
    // object is ACCEPTED by Prisma 6.11 as a no-op (verified), so a `{}`-
    // body PATCH answers 200 with the user unchanged.

    const updated = await db.user.update({
      where: { id: user.id },
      data,
    });

    return NextResponse.json({ ok: true, user: publicUser(updated) });
  } catch (err: unknown) {
    return toErrorResponse(err);
  }
});
