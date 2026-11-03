// ---------------------------------------------------------------------------
// S16-A — the per-view initial-collections seam: the single source of "what
// does each view need before its first paint". The authenticated shell
// pre-warms the ACTIVE view's collections IN PARALLEL with /api/auth/me
// (ADR-014) and flips from the Splash only when BOTH settle, so the first
// paint renders with final geometry (dashboard CLS 0.00).
//
// Unit-pinned by tests/view-collections.test.ts: an entry for every view id
// (a missing entry regresses to the load shift), keys validated against
// PATHS in src/lib/data.ts. The three tool views declare [] and gate on
// auth alone. Files manages its own collections inline in
// src/components/views/files-view.tsx (its fetch effect).
// ---------------------------------------------------------------------------

import type { CollectionKey } from "./data";
import type { ViewId } from "./router";

export const INITIAL_COLLECTIONS: Record<ViewId, CollectionKey[]> = {
  dashboard: ["tasks", "assignments", "exams", "focusSessions", "subjects"],
  myday: ["tasks", "subjects"],
  tasks: ["tasks", "taskLists", "subjects"],
  calendar: ["events", "exams", "assignments", "tasks", "timetable", "subjects"],
  events: ["events"],
  timetable: ["timetable", "subjects"],
  assignments: ["assignments", "subjects"],
  exams: ["exams", "subjects"],
  notes: ["notes", "notebooks", "subjects"],
  // S134/CI7a (audit B-L1, the S118/BS8 class): "subjects" joined the
  // flashcards entry — the deck dialog's Subject select reads s.subjects
  // (flashcards-view.tsx), so a cold /Flashcards boot showed a bare "No
  // subject" until the background loadAll landed.
  flashcards: ["flashcardDecks", "flashcards", "subjects"],
  practicetests: ["practiceTests", "subjects"],
  studygroups: ["studyGroups", "subjects"],
  gradetracker: ["grades", "subjects"],
  analytics: ["tasks", "focusSessions", "grades", "assignments", "exams", "subjects"],
  files: [],
  calculator: [],
  mathsolver: [],
  aiassistant: [],
  focustimer: ["focusSessions", "subjects"],
  settings: ["subjects", "holidays"],
};
