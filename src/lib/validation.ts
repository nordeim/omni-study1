// ---------------------------------------------------------------------------
// Every API payload contract. Zod v4 in strip mode (unknown keys dropped —
// the repo-wide convention). Unit-pinned by tests/validation.test.ts.
// ---------------------------------------------------------------------------

import { z } from "zod";

import { ACCENTS } from "./theme";

// ---- shared atoms ----------------------------------------------------------

const idField = z.string().min(1);
// Dialogs send "" for cleared relations — accept it and map to null
// (the schema must not reject the empty string BEFORE the transform).
const nullableId = z
  .union([idField, z.literal("")])
  .nullish()
  .transform((v) => (v === "" ? null : (v ?? null)));
const boundedTitle = z.string().min(1).max(200);
const passwordField = z.string().min(8).max(200);
const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/);
/** A date-time string; "" normalizes to null (the dialogs' clear-date path). */
const optionalDate = z
  .union([z.string(), z.null()])
  .optional()
  .transform((v) => (v === "" ? null : v));
const requiredDate = z.string().min(1);
/** A JSON string that parses to an array (the reference's JSON-blob columns). */
const jsonArray = z
  .string()
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
  email: z.string().email(),
  password: passwordField,
});

export const registerSchema = z.object({
  fullName: z.string().max(100).optional().default(""),
  email: z.string().email(),
  password: passwordField,
});

export const verifyEmailSchema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{6}$/),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
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
    newEmail: z.string().max(200).email(),
    confirmEmail: z.string().max(200).email(),
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
    .enum(["homework", "essay", "project", "reading", "lab", "presentation", "other"])
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
  subjectId: nullableId,
  members: z
    .array(
      z.object({
        name: z.string().min(1).max(100),
        email: z.string().email(),
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
    .regex(/^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/=]+$/)
    .optional(),
});

export const rumEventSchema = z.object({
  metric: z.enum(["TTFB", "FCP", "LCP", "CLS", "INP"]),
  value: z.number().min(0),
  rating: z.enum(["good", "needs-improvement", "poor"]),
  navigationType: z.enum([
    "navigate",
    "reload",
    "back-forward",
    "back-forward-cache",
    "prerender",
    "restore",
    "soft-navigation",
  ]),
  path: z.string().max(200).optional().default("/"),
  userAgent: z.string().max(300).optional().default(""),
});

export const rumBatchSchema = z.object({
  sessionId: z.string().min(1).max(100),
  events: z.array(rumEventSchema).min(1).max(10),
});

export const calculatorHistorySchema = z.object({
  expression: z.string().min(1).max(500),
  result: z.string().min(1).max(500),
  mode: z.enum(["basic", "scientific", "gpa", "unit"]).optional().default("basic"),
});
