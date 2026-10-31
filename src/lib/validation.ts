// ---------------------------------------------------------------------------
// Every API payload contract. Zod v4 in strip mode (unknown keys dropped —
// the repo-wide convention). Unit-pinned by tests/validation.test.ts.
// ---------------------------------------------------------------------------

import { z } from "zod";

import { ACCENTS } from "./theme";

// ---- shared atoms ----------------------------------------------------------

// S118/BS2: every id is length-bounded (cuids are 25 chars; 64 is the generous
// ceiling) — an unbounded id string reached Prisma verbatim.
const idField = z.string().min(1).max(64);
// Dialogs send "" for cleared relations — accept it and map to null
// (the schema must not reject the empty string BEFORE the transform).
const nullableId = z
  .union([idField, z.literal("")])
  .nullish()
  .transform((v) => (v === "" ? null : (v ?? null)));
const boundedTitle = z.string().min(1).max(200);
const passwordField = z.string().min(8).max(200);
const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/);
// S118/BS2: the shared email atom — trimmed (a padded paste normalizes
// instead of hard-failing) and bounded at 200 chars.
const emailField = z.string().trim().email().max(200);
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

const TASK_PRIORITIES = ["none", "low", "medium", "high"] as const;
const ASSIGNMENT_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
const REPEATS = ["none", "daily", "weekly", "monthly"] as const;

// ---- auth ------------------------------------------------------------------

export const loginSchema = z.object({
  email: emailField,
  password: passwordField,
});

export const registerSchema = z.object({
  fullName: z.string().max(100).optional().default(""),
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

export const preferencesSchema = z.object({
  themeMode: z.enum(["light", "dark", "system"]).optional(),
  accentColor: z.enum(ACCENTS).optional(),
  avatarEmoji: z.string().max(8).optional(),
  displayName: z.string().max(100).optional(),
  schoolName: z.string().max(120).optional(),
  gradeLevel: z
    .enum([
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
    ])
    .optional(),
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
    .enum(["homework", "essay", "project", "reading", "lab", "presentation", "other", "worksheet"])
    .optional()
    .default("homework"),
  progress: z.number().int().min(0).max(100).optional().default(0),
  priority: z.enum(ASSIGNMENT_PRIORITIES).optional().default("medium"),
});

export const examSchema = z.object({
  title: boundedTitle,
  date: requiredDate,
  subjectId: nullableId,
  type: z
    .enum(["test", "quiz", "midterm", "final", "oral", "practical"])
    .optional()
    .default("test"),
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

export const timetableClassSchema = z.object({
  name: boundedTitle,
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: hhmm,
  endTime: hhmm,
  subjectId: nullableId,
  room: z.string().max(100).optional().default(""),
  weekType: z.enum(["ALL", "A", "B"]).optional().default("ALL"),
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
  // deckId is injected by the create route from the URL (/api/flashcards/cards
  // is nested under a deck); the schema keeps it optional so update PATCHes
  // that only flip difficulty/mastered validate unchanged.
  deckId: idField.optional(),
  front: z.string().min(1).max(2000),
  back: z.string().min(1).max(2000),
  difficulty: z.enum(["easy", "medium", "hard"]).optional().default("medium"),
  mastered: z.boolean().optional().default(false),
});

export const practiceTestSchema = z.object({
  title: boundedTitle,
  durationMinutes: z.number().int().min(1).max(600).optional().default(60),
  questions: z
    .string()
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
});

export const focusSessionSchema = z.object({
  subjectId: nullableId,
  startedAt: requiredDate,
  durationSeconds: z.number().int().min(1).max(86_400),
  mode: z.enum(["focus", "short-break", "long-break"]).optional().default("focus"),
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
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(10_000),
      }),
    )
    .min(1)
    .max(40),
  surface: z.enum(["assistant", "solver"]).optional().default("assistant"),
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
  mode: z.enum(["basic", "scientific", "gpa", "unit"]).optional().default("basic"),
});
