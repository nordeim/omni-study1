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

    const prefs = parseWith(preferencesSchema, raw);
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

    const updated = await db.user.update({
      where: { id: user.id },
      data,
    });

    return NextResponse.json({ ok: true, user: publicUser(updated) });
  } catch (err: unknown) {
    return toErrorResponse(err);
  }
});
