// ---------------------------------------------------------------------------
// Every API payload contract. Zod v4 in strip mode (unknown keys dropped —
// the repo-wide convention). Unit-pinned by tests/validation.test.ts.
// ---------------------------------------------------------------------------

import { z } from "zod";

import { ACCENTS, AVATAR_EMOJIS } from "./theme";

// ---- shared atoms ----------------------------------------------------------

// S118/BS2: every id is length-bounded (cuids are 25 chars; 64 is the generous
// ceiling) — an unbounded id string reached Prisma verbatim. S119/BT4:
// exported for the route-local schemas (folders/ai) that carry id fields —
// one atom, every consumer (the AH8/S118-BS5 lesson: grep EVERY route that
// writes the same shape when a bound lands at an atom).
export const idField = z.string().min(1).max(64);
// Dialogs send "" for cleared relations — accept it and map to null
// (the schema must not reject the empty string BEFORE the transform).
// S123/BX5: exported — the folder routes' route-local parentId twin carried
// a DEAD ""→null transform (idField's min(1) rejected "" first, so the
// clear-to-root convention 400'd at the folder routes).
export const nullableId = z
  .union([idField, z.literal("")])
  .nullish()
  .transform((v) => (v === "" ? null : (v ?? null)));
// S133/CH8: trim BEFORE the checks — the AM1/BS5 doctrine (members,
// link-file names, multipart uploads already trimmed) applied to the whole
// title/name family: a whitespace-only title is REJECTED here, never
// persisted as a visually blank row; a padded title stores trimmed.
const boundedTitle = z.string().trim().min(1).max(200);
const passwordField = z.string().min(8).max(200);
const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/);
// S118/BS2: the shared email atom — trimmed (a padded paste normalizes
// instead of hard-failing) and bounded at 200 chars. S119/BT4: exported for
// the auth route-local schemas that still hand-rolled z.string().email().
export const emailField = z.string().trim().email().max(200);
/** A date-time string; "" normalizes to null (the dialogs' clear-date path).
 * S118/BS2: the string is bounded and must parse as a date — a garbage
 * value is a 400 at the boundary, never a Prisma Invalid-Date 500. The
 * optional leg keeps its own ""-tolerant union (the clear-date path). */
const dateAtom = z
  .string()
  .min(1)
  .max(40)
  .refine((v) => !Number.isNaN(Date.parse(v)), { message: "Enter a valid date." });
const optionalDate = z
  .union([z.literal(""), dateAtom, z.null()])
  .optional()
  .transform((v) => (v === "" ? null : v));
const requiredDate = dateAtom;
/** A JSON string that parses to an array (the reference's JSON-blob columns).
 * S118/BS2: bounded at 100k chars — the blobs persist to SQLite. */
const jsonArray = z
  .string()
  .max(100_000)
  .refine((v) => {
    try {
      return Array.isArray(JSON.parse(v));
    } catch {
      return false;
    }
  });
const hhmm = z.string().regex(/^\d{1,2}:\d{2}$/).refine((v) => {
  const [h, m] = v.split(":").map(Number);
  return h <= 23 && m <= 59;
});

/**
 * S123/BX1 — minutes-since-midnight for a padded OR unpadded hhmm value
 * ("9:00" and "09:00" both → 540), null for anything malformed or
 * out-of-range. The atom above admits UNPADDED hours, and unpadded hours
 * do NOT compare lexicographically ("11:00" < "9:00" — the seed's own
 * legacy rows carry the unpadded shape), so every ordering comparison on
 * hhmm atoms must normalize through here, never compare raw strings.
 * Exported for the entities.ts single-leg merge (the single source).
 */
export function hhmmMinutes(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/**
 * S123/BX1 — pad a 1-digit hour for `<input type="time">`: the HTML value
 * sanitization algorithm BLANKS a non-HH:MM value, so a stored legacy
 * "9:00" opened the edit dialog with an EMPTY start input (live-verified).
 * Values that are already well-formed (or unparseable — the form's own
 * required gate owns those) pass through unchanged.
 */
export function normalizeHhmmForInput(value: string): string {
  const match = /^(\d):(\d{2})$/.exec(value);
  if (!match) return value;
  return `0${match[1]}:${match[2]}`;
}

export const TASK_PRIORITIES = ["none", "low", "medium", "high"] as const;
export const ASSIGNMENT_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export const REPEATS = ["none", "daily", "weekly", "monthly"] as const;
// S126/CA14: the vocabulary single-source — the route schemas AND the
// import seam's domain caps consume the SAME arrays (the twin-validator
// hazard the s126 audit closed for the row-id rule, applied to the enums).
export const ASSIGNMENT_TYPES = [
  "homework",
  "essay",
  "project",
  "reading",
  "lab",
  "presentation",
  "other",
  "worksheet",
] as const;
export const CARD_DIFFICULTIES = ["easy", "medium", "hard"] as const;
export const CHAT_ROLES = ["user", "assistant"] as const;
export const CHAT_SURFACES = ["assistant", "solver"] as const;
// S133/CH2: the four remaining inline vocabularies promoted to the same
// single-source contract — the import seam's ENUM_VOCABULARIES mirrors
// these arrays instead of re-typing them (the CA14 doctrine completed).
export const EXAM_TYPES = ["test", "quiz", "midterm", "final", "oral", "practical"] as const;
// S173/DW2 (measured live at the s173 gated write-path probe): the
// reference's grade create dialog carries a Type select with exactly
// these six options (Homework / Quiz / Test / Midterm / Final /
// Project), defaulting Homework. Lowercase per the house enum
// convention (the EXAM_TYPES/ASSIGNMENT_TYPES precedent); the view
// renders the capitalized form (the exams-view capitalize idiom).
export const GRADE_TYPES = ["homework", "quiz", "test", "midterm", "final", "project"] as const;
export const WEEK_TYPES = ["ALL", "A", "B"] as const;
export const FOCUS_SESSION_MODES = ["focus", "short-break", "long-break"] as const;
export const CALCULATOR_MODES = ["basic", "scientific", "gpa", "unit"] as const;

// ---- auth ------------------------------------------------------------------

export const loginSchema = z.object({
  email: emailField,
  password: passwordField,
});

export const registerSchema = z.object({
  // S152/DA5 (Audit B B-I1): the trim at the ATOM — the trim-before-store
  // doctrine's last gap (the CY2 schoolName shape verbatim; Zod 4 orders
  // .trim() BEFORE .max(), and the transformed key survives the parsed
  // object). A whitespace-padded or whitespace-only name now lands trimmed
  // ("" = the column's natural cleared state) instead of persisting
  // verbatim.
  fullName: z.string().trim().max(100).optional().default(""),
  email: emailField,
  password: passwordField,
});

export const verifyEmailSchema = z.object({
  email: emailField,
  code: z.string().regex(/^\d{6}$/),
});

export const forgotPasswordSchema = z.object({
  email: emailField,
});

export const resetPasswordSchema = z.object({
  token: z.string().regex(/^[0-9a-f]{48}$/),
  password: passwordField,
});

export const changePasswordSchema = z
  .object({
    currentPassword: passwordField,
    newPassword: passwordField,
  })
  .refine((v) => v.currentPassword !== v.newPassword, {
    message: "The new password must be different from your current password.",
  });

export const deleteAccountSchema = z
  .object({
    password: passwordField,
    confirmation: z.string(),
  })
  .refine((v) => v.confirmation === "DELETE", {
    message: "Type DELETE to confirm.",
  });

export const changeEmailSchema = z
  .object({
    password: passwordField,
    newEmail: emailField,
    confirmEmail: emailField,
  })
  .refine((v) => v.newEmail === v.confirmEmail, {
    message: "The email addresses do not match.",
  });

// ---- settings (S17 study profile + theme preferences) ------------------------

// S124/BY1: the 12 grade labels — the enum's vocabulary, kept adjacent to the
// schema so the clearable union below stays self-explanatory.
export const GRADE_LEVELS = [
  "6th Grade",
  "7th Grade",
  "8th Grade",
  "9th Grade",
  "10th Grade",
  "11th Grade",
  "12th Grade",
  "College Freshman",
  "College Sophomore",
  "College Junior",
  "College Senior",
  "Graduate",
] as const;

export const preferencesSchema = z.object({
  themeMode: z.enum(["light", "dark", "system"]).optional(),
  accentColor: z.enum(ACCENTS).optional(),
  // S124/BY9: the avatar vocabulary at the API boundary — the picker is
  // unit-pinned to these 24 emojis; an arbitrary string used to store +
  // render as the avatar (React-escaped, but the Settings grid then showed
  // no selected tile). "" stays legal: the reference default state (the
  // initial-letter avatar).
  avatarEmoji: z
    .string()
    .max(8)
    .refine(
      (v) => v === "" || AVATAR_EMOJIS.includes(v),
      "Choose one of the available avatars",
    )
    .optional(),
  displayName: z.string().max(100).optional(),
  // S150/CY2 (the S146/B-I3 trim rider): the trim-before-store doctrine at
  // the atom — boundedTitle/emailField carry it; schoolName was the one
  // untrimmed text field, so a whitespace-only value persisted verbatim
  // while the DB's natural cleared state is "" (the BY1 gradeLevel
  // convention in the same card). Zod 4 orders .trim() BEFORE .max(), so
  // the 120-char bound applies to the STORED value. One canonical atom:
  // both the settings route and the import profile patch
  // (importProfilePatch) parse through this schema.
  schoolName: z.string().trim().max(120).optional(),
  // S124/BY1: the clearable form — the Study Profile card ships a "Not set"
  // option, but the bare enum had no clearable leg: the UI mapped "none" →
  // undefined (JSON.stringify drops the key, the route's sent-keys filter
  // skips it) while "" 400'd — a user picked "Not set", saved, got the
  // success toast, and the stored grade silently persisted. "" now stores
  // as "" (the DB column's natural cleared state — the schoolName
  // convention in the same card).
  gradeLevel: z.union([z.enum(GRADE_LEVELS), z.literal("")]).optional(),
  studyGoalHours: z.number().int().min(1).max(12).optional(),
  notificationsEnabled: z.boolean().optional(),
});

// ---- entities ---------------------------------------------------------------

export const subjectSchema = z.object({
  name: boundedTitle,
  color: hexColor.optional().default("#8b5cf6"),
});

export const taskListSchema = z.object({
  name: boundedTitle,
});

export const taskSchema = z.object({
  title: boundedTitle,
  notes: z.string().max(5000).optional().default(""),
  listId: nullableId,
  subjectId: nullableId,
  completed: z.boolean().optional().default(false),
  important: z.boolean().optional().default(false),
  dueDate: optionalDate,
  priority: z.enum(TASK_PRIORITIES).optional().default("none"),
  repeat: z.enum(REPEATS).optional().default("none"),
  myDay: z.boolean().optional().default(false),
  subtasks: jsonArray.optional().default("[]"),
});

export const assignmentSchema = z.object({
  title: boundedTitle,
  description: z.string().max(5000).optional().default(""),
  subjectId: nullableId,
  dueDate: optionalDate,
  type: z
    .enum(ASSIGNMENT_TYPES)
    .optional()
    .default("homework"),
  progress: z.number().int().min(0).max(100).optional().default(0),
  priority: z.enum(ASSIGNMENT_PRIORITIES).optional().default("medium"),
});

export const examSchema = z.object({
  title: boundedTitle,
  date: requiredDate,
  subjectId: nullableId,
  // S133/CH2: the promoted single-source array (was inline).
  type: z.enum(EXAM_TYPES).optional().default("test"),
  duration: z.number().int().min(5).max(600).optional().default(60),
  topics: jsonArray.optional().default("[]"),
  // S76/AC5 (measured on the reference): the Add Exam dialog carries a
  // Location input ("e.g., Room 101, Hall A") and the card renders a
  // map-pin row when set — the eventSchema location pattern.
  location: z.string().max(200).optional().default(""),
});

export const eventSchema = z.object({
  title: boundedTitle,
  startDate: requiredDate,
  endDate: optionalDate,
  allDay: z.boolean().optional().default(false),
  color: hexColor.optional().default("#8b5cf6"),
  location: z.string().max(200).optional().default(""),
  repeat: z.enum(REPEATS).optional().default("none"),
  reminders: jsonArray.optional().default("[]"),
  description: z.string().max(1000).optional().default(""),
});

// S120/BU22: the ordering guard — an endDate before the startDate is a
// data-quality defect (the views render nonsense spans). zod@4 forbids
// .partial() on refined object schemas, so the PURE eventSchema stays
// unwrapped (the client type inference + the partial-update base) and the
// ordering check rides the two CONSUMED shapes: the create schema (full
// payload) and the update schema (a partial payload validates the ordering
// only when both legs arrive together — a single-leg PATCH is guarded by
// the delegate's checkEventOrderingMerge against the STORED row
// [S121/BV1, src/lib/server/entities.ts]).
// S121/BV10: the comparisons use Date.parse values, never raw string
// ordering — a mixed-offset ISO string can sort LATER lexicographically
// while being EARLIER in time ("…T10:00:00+14:00" vs "…T09:00:00Z");
// a NaN on either side skips (the dateAtom refine already rejected
// unparseable strings at the boundary).
const END_BEFORE_START = "End date must be after the start date";

function isoBefore(a: string, b: string): boolean {
  const aMs = Date.parse(a);
  const bMs = Date.parse(b);
  if (Number.isNaN(aMs) || Number.isNaN(bMs)) return false;
  return aMs < bMs;
}

export const eventCreateSchema = eventSchema.check((ctx) => {
  const { endDate, startDate } = ctx.value;
  if (endDate && startDate && isoBefore(endDate, startDate)) {
    ctx.issues.push({ code: "custom", input: ctx.value, message: END_BEFORE_START, path: ["endDate"] });
  }
});

export const eventUpdateSchema = eventSchema.partial().check((ctx) => {
  const { endDate, startDate } = ctx.value;
  if (endDate && startDate && isoBefore(endDate, startDate)) {
    ctx.issues.push({ code: "custom", input: ctx.value, message: END_BEFORE_START, path: ["endDate"] });
  }
});

export const timetableClassSchema = z.object({
  name: boundedTitle,
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: hhmm,
  endTime: hhmm,
  subjectId: nullableId,
  room: z.string().max(100).optional().default(""),
  // S133/CH2: the promoted single-source array (was inline).
  weekType: z.enum(WEEK_TYPES).optional().default("ALL"),
});

// S122/BW7 + S123/BX1: the timetable ordering guard — the events family
// (BU22/BV1) applied to the hhmm atoms. The comparison is MINUTES-SINCE-
// MIDNIGHT (hhmmMinutes), never raw strings: the atom admits UNPADDED
// hours ("9:00" — the seed's own legacy shape), and "11:00" < "9:00"
// lexicographically, so the pre-BX1 raw compare BOTH falsely rejected
// legal spans AND accepted inverted ones (wire-verified both directions).
// The reference has no such guard; this is superset hardening (the
// owned-FK precedent).
const TIMETABLE_END_BEFORE_START = "End time must be after the start time";

function hhmmEndBeforeStart(startTime?: string, endTime?: string): boolean {
  if (!endTime || !startTime) return false;
  const startMin = hhmmMinutes(startTime);
  const endMin = hhmmMinutes(endTime);
  // A malformed leg skips here — the ATOM's own regex/refine rejects it
  // with the field-level message (the schema's first issue wins).
  if (startMin === null || endMin === null) return false;
  return endMin < startMin;
}

export const timetableClassCreateSchema = timetableClassSchema.check((ctx) => {
  const { endTime, startTime } = ctx.value;
  if (endTime && startTime && hhmmEndBeforeStart(startTime, endTime)) {
    ctx.issues.push({
      code: "custom",
      input: ctx.value,
      message: TIMETABLE_END_BEFORE_START,
      path: ["endTime"],
    });
  }
});

export const timetableClassUpdateSchema = timetableClassSchema.partial().check((ctx) => {
  const { endTime, startTime } = ctx.value;
  if (endTime && startTime && hhmmEndBeforeStart(startTime, endTime)) {
    ctx.issues.push({
      code: "custom",
      input: ctx.value,
      message: TIMETABLE_END_BEFORE_START,
      path: ["endTime"],
    });
  }
});

export const notebookSchema = z.object({
  name: boundedTitle,
});

export const noteSchema = z.object({
  title: boundedTitle,
  content: z.string().max(100_000).optional().default(""),
  tags: z.string().max(2000).optional().default("[]"),
  notebookId: nullableId,
  subjectId: nullableId,
});

export const flashcardDeckSchema = z.object({
  name: boundedTitle,
  description: z.string().max(1000).optional().default(""),
  color: hexColor.optional().default("#8b5cf6"),
  subjectId: nullableId,
});

export const flashcardSchema = z.object({
  // S125/BZ12: deckId arrives in the BODY — the route is the FLAT
  // /api/flashcards/cards (never nested under a deck path); the delegate
  // enforces presence at create ("A flashcard needs a deck."). The schema
  // keeps it optional so update PATCHes that only flip
  // difficulty/mastered validate unchanged.
  deckId: idField.optional(),
  front: z.string().min(1).max(2000),
  back: z.string().min(1).max(2000),
  difficulty: z.enum(CARD_DIFFICULTIES).optional().default("medium"),
  mastered: z.boolean().optional().default(false),
});

export const practiceTestSchema = z.object({
  title: boundedTitle,
  durationMinutes: z.number().int().min(1).max(600).optional().default(60),
  questions: z
    .string()
    // S121/BV5: the blob bound (the family convention — content 100k, tags
    // 2k, reminders/subtasks/topics 100k). `questions` was the only
    // unbounded JSON-blob field: a ~9.5 MiB valid-questions JSON passed
    // the schema AND the import read cap (10 MiB at the time —
    // IMPORT_MAX_BYTES since S124/BY3, 64 MiB since S137/CL2) and
    // persisted to SQLite.
    .max(100_000)
    .refine((v) => {
      try {
        const parsed: unknown = JSON.parse(v);
        if (!Array.isArray(parsed)) return false;
        return parsed.every(
          (item) =>
            typeof item === "object" &&
            item !== null &&
            typeof (item as { question?: unknown }).question === "string" &&
            ["multiple_choice", "true_false", "short_answer"].includes(
              String((item as { type?: unknown }).type),
            ),
        );
      } catch {
        return false;
      }
    })
    .optional()
    .default("[]"),
  subjectId: nullableId,
});

export const studyGroupSchema = z.object({
  name: boundedTitle,
  // S171/DU2b: the reference's own field (the create dialog's "What's
  // this group about?" textarea, measured live at the s171 gated
  // write-path probe). Bounded at 500 — the bounded-everything posture;
  // the deck family's 1_000-char description is the precedent family.
  description: z.string().max(500).optional().default(""),
  color: hexColor.optional().default("#8b5cf6"),
  subjectId: nullableId,
  members: z
    .array(
      z.object({
        // AM1 (the s86 audit's L2): trim BEFORE the checks — a blank name
        // must be REJECTED here, not persisted for the client seam to drop
        // on read (the silent next-write deletion edge), and padded values
        // are stored trimmed. This keeps the server boundary in agreement
        // with normalizeMembers' blank-after-trim drop.
        name: z.string().trim().min(1).max(100),
        email: z.string().trim().email().max(200),
      }),
    )
    .max(50),
});

export const gradeSchema = z.object({
  title: boundedTitle,
  score: z.number().min(0).max(1000),
  maxScore: z.number().min(1).max(1000).optional().default(100),
  weight: z.number().min(0).max(100).optional().default(1),
  subjectId: nullableId,
  // S173/DW2: the measured reference fields (the type select + the date
  // input). The type defaults "homework" (the measured combobox default);
  // PATCH-safe by the S82/AI1 sentKeysPatch doctrine (absent keys are not
  // writes). The date rides the optionalDate atom (the assignments
  // dueDate pattern — ""-tolerant, null when cleared).
  type: z.enum(GRADE_TYPES).optional().default("homework"),
  date: optionalDate,
});

// S125/BZ6: the score ≤ maxScore ordering guard (the events BU22+BV1
// pattern on the numeric pair). The schema capped each leg independently —
// 900/100 persisted and rendered 900%. The CREATE shape carries the
// .check(): score is required and an unsent maxScore defaults to 100, so
// the injected denominator IS the honest row state at create time (a bare
// 900 is honestly "900 out of the default 100" — rejected). The UPDATE
// path deliberately owns NO schema check: zod@4's .partial() injects the
// maxScore default into every parsed payload (the S81 lesson), so a
// schema-side compare would read the injected 100 instead of the stored
// denominator — the sent-keys filter drops the injected key BEFORE the
// write but .check() runs INSIDE parse, outside the filter's reach. The
// checkGradeRangeMerge beforeWrite seam owns BOTH legs on PATCH (one
// unified compare over the effective pair — src/lib/server/entities.ts,
// pinned by tests/grade-merge.test.ts).
export const GRADE_SCORE_ABOVE_MAX = "Score cannot be higher than the maximum score.";

export const gradeCreateSchema = gradeSchema.check((ctx) => {
  const { score, maxScore } = ctx.value;
  if (score > maxScore) {
    ctx.issues.push({
      code: "custom",
      input: ctx.value,
      message: GRADE_SCORE_ABOVE_MAX,
      path: ["score"],
    });
  }
});

export const focusSessionSchema = z.object({
  subjectId: nullableId,
  startedAt: requiredDate,
  durationSeconds: z.number().int().min(1).max(86_400),
  // S133/CH2: the promoted single-source array (was inline).
  mode: z.enum(FOCUS_SESSION_MODES).optional().default("focus"),
  completed: z.boolean().optional().default(true),
});

// S117/BR4 — the link-file schema, extracted from the route so the unit layer
// can pin the http(s)-only URL rule. z.string().url() alone accepts
// WHATWG-valid javascript:/data: URLs; a stored href rendered with
// target="_blank" is script execution in the app origin on click. The upload
// route (files/route.ts POST) has enforced the same ^https?:// rule since
// S14 — this schema holds BOTH file-link entry points to it (S118/BS5:
// the files POST's JSON branch consumes it too; name trims before the
// checks — the AM1 members convention — so a whitespace-only name is
// rejected, never stored).
export const linkFileSchema = z.object({
  name: z.string().trim().min(1).max(200),
  url: z
    .string()
    .url()
    .max(2000)
    .regex(/^https?:\/\//i, "The link needs a valid http(s) URL."),
  folderId: nullableId,
});

export const holidaySchema = z.object({
  name: boundedTitle,
  date: requiredDate,
});

// ---- AI + RUM + calculator ---------------------------------------------------

export const aiChatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(CHAT_ROLES),
        content: z.string().min(1).max(10_000),
      }),
    )
    .min(1)
    .max(40)
    // S160/DI2 (the s160 audit B/L-2): an all-assistant payload would
    // persist a content-less user row (the chat route's lastUserMessage
    // fallback answers ""), so the schema demands at least one user
    // message — the client always appends a trailing user turn, so only
    // crafted API payloads ever hit the refine.
    .refine((msgs) => msgs.some((m) => m.role === "user"), {
      message: "A conversation needs at least one message from you.",
    }),
  surface: z.enum(CHAT_SURFACES).optional().default("assistant"),
});

export const mathSolveSchema = z.object({
  problem: z.string().min(1).max(4000),
  image: z
    .string()
    .max(7_000_000) // S118/BS2: ≈5 MiB binary as base64 — above the client's 5 MiB picker gate
    .regex(/^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/=]+$/)
    .optional(),
});

// S118/BS7: these bounds are the ROUTE's enforced shape (the pre-S118
// validation.ts twin was dead code with DIFFERENT bounds — navType enum,
// path ≤200, UA ≤300, value unbounded, events ≤10 — a future consumer
// following the "one validation.ts" convention would have inherited the
// weaker value cap). The route now imports THESE schemas; the twin is gone.
export const rumEventSchema = z.object({
  metric: z.enum(["TTFB", "FCP", "LCP", "CLS", "INP"]),
  value: z.number().min(0).max(6_000_000),
  rating: z.enum(["good", "needs-improvement", "poor"]),
  // navigationType is the beacon's free-form label (soft-navigation,
  // prerender, …) — a bounded free string, not an enum.
  navigationType: z.string().min(1).max(40),
  path: z.string().max(500).optional().default("/"),
  userAgent: z.string().max(400).optional().default(""),
});

export const rumBatchSchema = z.object({
  sessionId: z.string().min(1).max(100),
  events: z.array(rumEventSchema).min(1).max(20),
});

export const calculatorHistorySchema = z.object({
  expression: z.string().min(1).max(500),
  result: z.string().min(1).max(500),
  // S133/CH2: the promoted single-source array (was inline).
  mode: z.enum(CALCULATOR_MODES).optional().default("basic"),
});
