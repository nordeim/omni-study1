import { describe, expect, it } from "vitest";
import {
  assignmentSchema,
  aiChatSchema,
  changeEmailSchema,
  changePasswordSchema,
  deleteAccountSchema,
  eventCreateSchema,
  eventSchema,
  eventUpdateSchema,
  examSchema,
  flashcardDeckSchema,
  flashcardSchema,
  forgotPasswordSchema,
  gradeCreateSchema,
  gradeSchema,
  holidaySchema,
  linkFileSchema,
  loginSchema,
  mathSolveSchema,
  noteSchema,
  practiceTestSchema,
  preferencesSchema,
  timetableClassCreateSchema,
  timetableClassUpdateSchema,
  hhmmMinutes,
  normalizeHhmmForInput,
  nullableId,
  resetPasswordSchema,
  registerSchema,
  rumBatchSchema,
  rumEventSchema,
  studyGroupSchema,
  subjectSchema,
  taskSchema,
  timetableClassSchema,
  verifyEmailSchema,
} from "@/lib/validation";

describe("loginSchema", () => {
  it("accepts a valid login and rejects short passwords / bad emails", () => {
    expect(loginSchema.safeParse({ email: "demo@studyflow.app", password: "Demo1234!" }).success).toBe(true);
    expect(loginSchema.safeParse({ email: "demo@studyflow.app", password: "short" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "not-an-email", password: "Demo1234!" }).success).toBe(false);
    expect(loginSchema.safeParse({}).success).toBe(false);
  });
});

describe("taskSchema", () => {
  it("applies defaults and bounds the title", () => {
    const parsed = taskSchema.parse({ title: "Read chapter 4" });
    expect(parsed.completed).toBe(false);
    expect(parsed.important).toBe(false);
    expect(parsed.notes).toBe("");
    expect(taskSchema.safeParse({ title: "" }).success).toBe(false);
    expect(taskSchema.safeParse({ title: "x".repeat(201) }).success).toBe(false);
  });

  it("normalizes empty date strings to null", () => {
    const parsed = taskSchema.parse({ title: "t", dueDate: "" });
    expect(parsed.dueDate).toBeNull();
  });

  it("carries the S6-B reference dialog fields: priority, repeat, myDay, subtasks", () => {
    // The reference's Add/Edit Task dialog (measured live) has a Priority
    // combobox (None/Low/Medium/High), a Repeat combobox (No repeat/Daily/
    // Weekly/Monthly), a My Day toggle, and a subtask adder. Subtasks
    // persist as a JSON array of {id,title,done} objects.
    const parsed = taskSchema.parse({ title: "t" });
    expect(parsed.priority).toBe("none");
    expect(parsed.repeat).toBe("none");
    expect(parsed.myDay).toBe(false);
    expect(parsed.subtasks).toBe("[]");

    const full = taskSchema.parse({
      title: "t",
      priority: "high",
      repeat: "weekly",
      myDay: true,
      subtasks: '[{"id":"s1","title":"First","done":false}]',
    });
    expect(full.priority).toBe("high");
    expect(full.repeat).toBe("weekly");
    expect(full.myDay).toBe(true);
    expect(full.subtasks).toBe('[{"id":"s1","title":"First","done":false}]');

    expect(taskSchema.safeParse({ title: "t", priority: "urgent" }).success).toBe(false);
    expect(taskSchema.safeParse({ title: "t", repeat: "sometimes" }).success).toBe(false);
    expect(taskSchema.safeParse({ title: "t", subtasks: "not-json" }).success).toBe(false);
    expect(taskSchema.safeParse({ title: "t", subtasks: "[{\"id\":1" }).success).toBe(false);
  });
});

describe("assignmentSchema", () => {
  it("carries the S6-E reference row fields: type, progress, urgent priority", () => {
    // The reference's assignment row (measured) shows a type pill
    // (homework/essay/project/...) and an interactive progress slider
    // (0-100), and its dialog Priority combobox offers Low/Medium/High/Urgent.
    const parsed = assignmentSchema.parse({ title: "Problem set" });
    expect(parsed.type).toBe("homework");
    expect(parsed.progress).toBe(0);
    expect(parsed.priority).toBe("medium");

    const full = assignmentSchema.parse({ title: "P", type: "essay", progress: 65, priority: "urgent" });
    expect(full.type).toBe("essay");
    expect(full.progress).toBe(65);
    expect(full.priority).toBe("urgent");

    expect(assignmentSchema.safeParse({ title: "P", type: "unknown-kind" }).success).toBe(false);
    expect(assignmentSchema.safeParse({ title: "P", progress: 101 }).success).toBe(false);
    expect(assignmentSchema.safeParse({ title: "P", progress: -1 }).success).toBe(false);
  });

  it("accepts the seeded \"worksheet\" type (AC10 — the enum missed a seed value)", () => {
    // The seed ships "Problem set 6" with type "worksheet" — outside the
    // enum since the S6 era, so editing that row 400s. The row renders
    // (the API only validates writes) and is pinned by S6-E; the enum
    // catches up to the seed.
    expect(assignmentSchema.safeParse({ title: "P", type: "worksheet" }).success).toBe(true);
  });
});

describe("subjectSchema", () => {
  it("validates the hex color format", () => {
    expect(subjectSchema.safeParse({ name: "Math" }).success).toBe(true);
    expect(subjectSchema.parse({ name: "Math" }).color).toBe("#8b5cf6");
    expect(subjectSchema.safeParse({ name: "Math", color: "violet" }).success).toBe(false);
    expect(subjectSchema.safeParse({ name: "Math", color: "#8b5c" }).success).toBe(false);
  });
});

describe("examSchema", () => {
  it("requires a date and accepts optional fields", () => {
    const ok = examSchema.safeParse({ title: "Midterm", date: "2026-10-13T09:00:00" });
    expect(ok.success).toBe(true);
    expect(examSchema.safeParse({ title: "Midterm" }).success).toBe(false);
  });

  it("carries the S6-F reference card fields: type, duration, topics", () => {
    // The reference's exam cards (measured) show a type footer pill
    // (test/quiz/midterm/final/oral/practical) and a "12:00 AM · 60 min"
    // clock line; its dialog has a duration spinbutton (default 60) and a
    // topics adder. Topics persist as a JSON string array.
    const parsed = examSchema.parse({ title: "Midterm", date: "2026-10-13T09:00:00" });
    expect(parsed.type).toBe("test");
    expect(parsed.duration).toBe(60);
    expect(parsed.topics).toBe("[]");

    const full = examSchema.parse({
      title: "Midterm",
      date: "2026-10-13T09:00:00",
      type: "oral",
      duration: 120,
      topics: '["Integrals","Series"]',
    });
    expect(full.type).toBe("oral");
    expect(full.duration).toBe(120);
    expect(full.topics).toBe('["Integrals","Series"]');

    expect(examSchema.safeParse({ title: "M", date: "2026-10-13T09:00:00", type: "final-exam" }).success).toBe(false);
    expect(examSchema.safeParse({ title: "M", date: "2026-10-13T09:00:00", duration: 4 }).success).toBe(false);
    expect(examSchema.safeParse({ title: "M", date: "2026-10-13T09:00:00", duration: 6000 }).success).toBe(false);
    expect(examSchema.safeParse({ title: "M", date: "2026-10-13T09:00:00", topics: "not-json" }).success).toBe(false);
  });

  it("carries the S76 location field (AC5 — the ref card's \ud83d\udccd row + dialog Location input)", () => {
    // Measured on the reference (2026-10-21, ref-ac-remeasure-s76.mjs): the
    // Add Exam dialog has a Location input (placeholder "e.g., Room 101,
    // Hall A") and the card renders a map-pin row when it is set. The
    // eventSchema location pattern: optional string, max 200, default "".
    const parsed = examSchema.parse({ title: "Midterm", date: "2026-10-13T09:00:00" });
    expect(parsed.location).toBe("");
    const withLoc = examSchema.parse({
      title: "Midterm",
      date: "2026-10-13T09:00:00",
      location: "Room 3B",
    });
    expect(withLoc.location).toBe("Room 3B");
    expect(
      examSchema.safeParse({ title: "M", date: "2026-10-13T09:00:00", location: "x".repeat(201) }).success,
    ).toBe(false);
  });
});

describe("event date ordering (S120/BU22)", () => {
  it("accepts an endDate after the startDate", () => {
    const parsed = eventCreateSchema.parse({
      title: "Two-hour exam block",
      startDate: "2026-11-01T09:00:00",
      endDate: "2026-11-01T11:00:00",
    });
    expect(parsed.endDate).toBe("2026-11-01T11:00:00");
  });

  it("accepts an equal endDate (a zero-length marker event is a valid span)", () => {
    expect(() =>
      eventCreateSchema.parse({
        title: "Marker",
        startDate: "2026-11-01T09:00:00",
        endDate: "2026-11-01T09:00:00",
      }),
    ).not.toThrow();
  });

  it("rejects an endDate BEFORE the startDate at CREATE (the data-quality guard)", () => {
    expect(() =>
      eventCreateSchema.parse({
        title: "Inverted span",
        startDate: "2026-11-01T09:00:00",
        endDate: "2026-11-01T08:00:00",
      }),
    ).toThrow(/end/i);
  });

  it("rejects an inverted PAIR at UPDATE while accepting single-leg partials", () => {
    expect(() =>
      eventUpdateSchema.parse({ startDate: "2026-11-01T09:00:00", endDate: "2026-11-01T08:00:00" }),
    ).toThrow(/end/i);
    // A single-leg PATCH is valid on its own (it merges with the stored row).
    expect(() => eventUpdateSchema.parse({ endDate: "2026-11-01T08:00:00" })).not.toThrow();
    expect(() => eventUpdateSchema.parse({ startDate: "2026-11-01T10:00:00" })).not.toThrow();
  });

  it("keeps an absent endDate valid (the optional leg)", () => {
    expect(() =>
      eventCreateSchema.parse({ title: "Open-ended", startDate: "2026-11-01T09:00:00" }),
    ).not.toThrow();
  });
});

describe("eventSchema", () => {
  it("keeps the color default and the allDay flag", () => {
    const parsed = eventSchema.parse({ title: "Study group", startDate: "2026-10-06T17:00:00" });
    expect(parsed.allDay).toBe(false);
    expect(parsed.color).toBe("#8b5cf6");
  });

  it("carries the S5-B2 reference dialog fields: location, repeat, reminders", () => {
    // The reference's New Event dialog (measured) has Location / Link,
    // Repeat (combobox, "No repeat" default) and multi-reminders (minutes
    // before). Reminders persist as a JSON array of minute offsets.
    const parsed = eventSchema.parse({ title: "Study group", startDate: "2026-10-06T17:00:00" });
    expect(parsed.location).toBe("");
    expect(parsed.repeat).toBe("none");
    expect(parsed.reminders).toBe("[]");

    const full = eventSchema.parse({
      title: "Advising",
      startDate: "2026-10-06T17:00:00",
      location: "Room 210",
      repeat: "weekly",
      reminders: "[15,60]",
    });
    expect(full.location).toBe("Room 210");
    expect(full.repeat).toBe("weekly");
    expect(full.reminders).toBe("[15,60]");

    expect(eventSchema.safeParse({ title: "X", startDate: "2026-10-06T17:00:00", repeat: "sometimes" }).success).toBe(false);
    expect(eventSchema.safeParse({ title: "X", startDate: "2026-10-06T17:00:00", reminders: "not-json" }).success).toBe(false);
    expect(eventSchema.safeParse({ title: "X", startDate: "2026-10-06T17:00:00", reminders: "[15," }).success).toBe(false);
  });
});

describe("timetableClassSchema", () => {
  it("defaults weekType to ALL and accepts Week A / Week B (S5-J)", () => {
    // The reference's Timetable header carries an "All Weeks" select with
    // options All Weeks / Week A / Week B (measured) — alternating-week
    // timetables. The schema models it as weekType ALL|A|B.
    const parsed = timetableClassSchema.parse({
      name: "Calculus II",
      dayOfWeek: 0,
      startTime: "9:00",
      endTime: "10:30",
    });
    expect(parsed.weekType).toBe("ALL");
    expect(parsed.room).toBe("");

    const weekA = timetableClassSchema.parse({
      name: "Lab",
      dayOfWeek: 1,
      startTime: "14:00",
      endTime: "16:00",
      weekType: "A",
    });
    expect(weekA.weekType).toBe("A");

    expect(
      timetableClassSchema.safeParse({
        name: "Lab",
        dayOfWeek: 1,
        startTime: "14:00",
        endTime: "16:00",
        weekType: "C",
      }).success,
    ).toBe(false);
  });
});

describe("studyGroupSchema", () => {
  it("caps members at 50 and validates emails", () => {
    const ok = studyGroupSchema.safeParse({
      name: "Calc Crew",
      members: [{ name: "Ari", email: "ari@example.com" }],
    });
    expect(ok.success).toBe(true);
    expect(
      studyGroupSchema.safeParse({
        name: "Crew",
        members: [{ name: "X", email: "not-an-email" }],
      }).success,
    ).toBe(false);
    expect(
      studyGroupSchema.safeParse({
        name: "Crew",
        members: Array.from({ length: 51 }, () => ({ name: "x", email: "" })),
      }).success,
    ).toBe(false);
  });

  // AM1 (the s86 audit's L2): the server schema must agree with the
  // client seam's blank-after-trim drop — a blank member name passes
  // length-based min(1) and persists, the seam drops it on read, and
  // the next member write permanently deletes the row. Trim runs BEFORE
  // the checks, so blanks are rejected and padded values are stored
  // trimmed (the boundary both sides now share).
  it("AM1: rejects a blank member name (the seam/server alignment)", () => {
    // The email must be unimpeachable (zod4 rejects 1-char TLDs like
    // a@b.c) so the pin discriminates ONLY the blank name — a pin that
    // fails for the wrong reason verifies nothing (the S82 lesson).
    expect(
      studyGroupSchema.safeParse({
        name: "Crew",
        members: [{ name: "   ", email: "member@example.com" }],
      }).success,
    ).toBe(false);
  });

  it("AM1: trims a padded member name before persisting", () => {
    const parsed = studyGroupSchema.safeParse({
      name: "Crew",
      members: [{ name: "  Ari  ", email: "ari@example.com" }],
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.members[0]?.name).toBe("Ari");
    }
  });

  it("AM1: trims a padded member email before validating", () => {
    const parsed = studyGroupSchema.safeParse({
      name: "Crew",
      members: [{ name: "Ari", email: "  ari@example.com " }],
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.members[0]?.email).toBe("ari@example.com");
    }
  });

  it("AM1: the valid baseline is unchanged (regression guard)", () => {
    const parsed = studyGroupSchema.safeParse({
      name: "Crew",
      members: [{ name: "Ari", email: "ari@example.com" }],
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.members[0]).toEqual({
        name: "Ari",
        email: "ari@example.com",
      });
    }
  });

  it("AM1: a blank member email stays rejected (regression guard)", () => {
    expect(
      studyGroupSchema.safeParse({
        name: "Crew",
        members: [{ name: "Ari", email: "   " }],
      }).success,
    ).toBe(false);
  });
});

describe("preferencesSchema", () => {
  it("only accepts the documented enum values", () => {
    expect(preferencesSchema.safeParse({ themeMode: "dark", accentColor: "teal" }).success).toBe(true);
    expect(preferencesSchema.safeParse({ themeMode: "auto" }).success).toBe(false);
    expect(preferencesSchema.safeParse({ accentColor: "purple" }).success).toBe(false);
    expect(preferencesSchema.safeParse({ avatarEmoji: "🎓" }).success).toBe(true);
    expect(preferencesSchema.safeParse({ avatarEmoji: "🎓".repeat(9) }).success).toBe(false); // 9 code points > 8 (zod v4 counts code points)
  });

  // S135/CJ7 (audit B-I3) — the default-free invariant is LOAD-BEARING: the
  // settings route patches with the SENT-KEYS intersection (the AH8 guard),
  // so any .default() added to preferencesSchema would materialize as a
  // sent key on every partial save and silently reset that column. The
  // invariant was guarded by the route's AJ4 comment alone — prose. This
  // leg makes it a machine guard: parse {} and the output must carry NO
  // keys (the moment a default lands, this fails).
  it("S135/CJ7: parses {} to a NO-KEY result — the default-free invariant (a .default() would silently reset a column on every partial save)", () => {
    const parsed = preferencesSchema.parse({});
    expect(Object.keys(parsed)).toEqual([]);
  });

  // S17-A — the reference's Profile tab persists four study-profile fields
  // on its User entity (captured from the reference's own PUT body):
  // school_name / grade_level / study_goal_hours / notifications_enabled.
  it("accepts the S17 study-profile fields (school, grade, goal, notifications)", () => {
    expect(
      preferencesSchema.safeParse({
        schoolName: "Lincoln High",
        gradeLevel: "9th Grade",
        studyGoalHours: 4,
        notificationsEnabled: false,
      }).success,
    ).toBe(true);
    // all optional — a partial PATCH still parses
    expect(preferencesSchema.safeParse({ schoolName: "" }).success).toBe(true);
    expect(preferencesSchema.safeParse({ notificationsEnabled: true }).success).toBe(true);
  });

  it("accepts every reference-measured Grade Level option (12 total)", () => {
    const grades = [
      "6th Grade", "7th Grade", "8th Grade", "9th Grade", "10th Grade", "11th Grade", "12th Grade",
      "College Freshman", "College Sophomore", "College Junior", "College Senior", "Graduate",
    ];
    for (const g of grades) {
      expect(preferencesSchema.safeParse({ gradeLevel: g }).success).toBe(true);
    }
    expect(preferencesSchema.safeParse({ gradeLevel: "13th Grade" }).success).toBe(false);
    expect(preferencesSchema.safeParse({ gradeLevel: "Kindergarten" }).success).toBe(false);
  });

  it("bounds the study goal to the reference's 1–12 hour slider range", () => {
    expect(preferencesSchema.safeParse({ studyGoalHours: 1 }).success).toBe(true);
    expect(preferencesSchema.safeParse({ studyGoalHours: 12 }).success).toBe(true);
    expect(preferencesSchema.safeParse({ studyGoalHours: 0 }).success).toBe(false);
    expect(preferencesSchema.safeParse({ studyGoalHours: 13 }).success).toBe(false);
    expect(preferencesSchema.safeParse({ studyGoalHours: 2.5 }).success).toBe(false);
  });

  it("bounds the school name length", () => {
    expect(preferencesSchema.safeParse({ schoolName: "x".repeat(120) }).success).toBe(true);
    expect(preferencesSchema.safeParse({ schoolName: "x".repeat(121) }).success).toBe(false);
  });
});

describe("flashcardDeckSchema", () => {
  it("carries the S7-A reference dialog fields: color swatch picker", () => {
    // The reference's Create Deck dialog (measured live) offers a 6-swatch
    // Color picker (violet/blue/emerald/amber/red/pink-500); the deck row's
    // 40px icon block renders the picked color inline.
    const parsed = flashcardDeckSchema.parse({ name: "Biology Chapter 5" });
    expect(parsed.color).toBe("#8b5cf6");
    expect(parsed.description).toBe("");

    const blue = flashcardDeckSchema.parse({ name: "B", color: "#3b82f6" });
    expect(blue.color).toBe("#3b82f6");

    expect(flashcardDeckSchema.safeParse({ name: "B", color: "blue" }).success).toBe(false);
    expect(flashcardDeckSchema.safeParse({ name: "B", color: "#8b5cf" }).success).toBe(false);
    expect(flashcardDeckSchema.safeParse({ name: "" }).success).toBe(false);
  });
});

describe("flashcardSchema", () => {
  it("carries the S7-A reference card field: difficulty", () => {
    // The reference's populated card grid renders a difficulty badge
    // (measured "medium" on a live card, bg-yellow-100 text-yellow-700).
    const parsed = flashcardSchema.parse({ front: "Q", back: "A" });
    expect(parsed.difficulty).toBe("medium");
    expect(parsed.mastered).toBe(false);

    const hard = flashcardSchema.parse({ front: "Q", back: "A", difficulty: "hard" });
    expect(hard.difficulty).toBe("hard");

    expect(flashcardSchema.safeParse({ front: "Q", back: "A", difficulty: "impossible" }).success).toBe(false);
  });
});

describe("practiceTestSchema", () => {
  it("carries the S7-B reference dialog field: questions array", () => {
    // The reference's Create Practice Test dialog (measured) builds a
    // scrollable question list (multiple_choice / true_false / short_answer)
    // via AI Generate; questions persist as a JSON array of {question,type}.
    const parsed = practiceTestSchema.parse({ title: "Bio Review" });
    expect(parsed.questions).toBe("[]");
    expect(parsed.durationMinutes).toBe(60);

    const full = practiceTestSchema.parse({
      title: "Bio Review",
      durationMinutes: 45,
      questions: '[{"question":"What is DNA?","type":"short_answer"}]',
    });
    expect(full.questions).toBe('[{"question":"What is DNA?","type":"short_answer"}]');

    expect(practiceTestSchema.safeParse({ title: "T", questions: "not-json" }).success).toBe(false);
    expect(practiceTestSchema.safeParse({ title: "T", questions: '[{"question":"Q","type":"essay"}]' }).success).toBe(false);
  });
});

describe("aiChatSchema", () => {
  it("requires 1..40 well-formed messages", () => {
    expect(
      aiChatSchema.safeParse({ messages: [{ role: "user", content: "hi" }] }).success,
    ).toBe(true);
    expect(aiChatSchema.safeParse({ messages: [] }).success).toBe(false);
    expect(
      aiChatSchema.safeParse({ messages: [{ role: "system", content: "hi" }] }).success,
    ).toBe(false);
    expect(
      aiChatSchema.safeParse({ messages: [{ role: "user", content: "" }] }).success,
    ).toBe(false);
  });
});

describe("mathSolveSchema", () => {
  it("accepts text problems and validates base64 data URLs", () => {
    expect(mathSolveSchema.safeParse({ problem: "2x + 5 = 15" }).success).toBe(true);
    expect(
      mathSolveSchema.safeParse({ problem: "x", image: "data:image/png;base64,AAAA" }).success,
    ).toBe(true);
    expect(
      mathSolveSchema.safeParse({ problem: "x", image: "https://example.com/x.png" }).success,
    ).toBe(false);
    expect(mathSolveSchema.safeParse({ problem: "" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// S15 — the auth-flow depth schemas: verify-email (6-digit OTP), forgot
// password, reset password (48-hex token). registerSchema is UNCHANGED (the
// signup form just stops sending a name; the default "" covers it).
// ---------------------------------------------------------------------------

describe("verifyEmailSchema (S15)", () => {
  it("accepts a valid email + 6-digit code", () => {
    expect(
      verifyEmailSchema.safeParse({ email: "demo@studyflow.app", code: "012345" }).success,
    ).toBe(true);
    expect(
      verifyEmailSchema.safeParse({ email: "a@b.co", code: "999999" }).success,
    ).toBe(true);
  });

  it("rejects wrong-length, non-digit, and malformed codes", () => {
    expect(verifyEmailSchema.safeParse({ email: "a@b.co", code: "12345" }).success).toBe(false);
    expect(verifyEmailSchema.safeParse({ email: "a@b.co", code: "1234567" }).success).toBe(false);
    expect(verifyEmailSchema.safeParse({ email: "a@b.co", code: "12a456" }).success).toBe(false);
    expect(verifyEmailSchema.safeParse({ email: "a@b.co", code: 123456 }).success).toBe(false);
    expect(verifyEmailSchema.safeParse({ email: "not-an-email", code: "123456" }).success).toBe(false);
    expect(verifyEmailSchema.safeParse({ code: "123456" }).success).toBe(false);
  });
});

describe("forgotPasswordSchema (S15)", () => {
  it("accepts any well-formed email (the route answers uniformly)", () => {
    expect(forgotPasswordSchema.safeParse({ email: "demo@studyflow.app" }).success).toBe(true);
    expect(forgotPasswordSchema.safeParse({ email: "stranger@example.com" }).success).toBe(true);
  });

  it("rejects malformed emails and missing bodies", () => {
    expect(forgotPasswordSchema.safeParse({ email: "nope" }).success).toBe(false);
    expect(forgotPasswordSchema.safeParse({}).success).toBe(false);
    // Unknown keys are stripped (the repo-wide Zod convention — strip mode).
    expect(forgotPasswordSchema.safeParse({ email: "a@b.co", extra: 1 }).success).toBe(true);
  });
});

describe("resetPasswordSchema (S15)", () => {
  it("accepts a 48-hex token with a strong-enough password", () => {
    const token = "a".repeat(48);
    expect(
      resetPasswordSchema.safeParse({ token, password: "NewPass1234!" }).success,
    ).toBe(true);
  });

  it("rejects short/weak passwords and malformed tokens", () => {
    const token = "a".repeat(48);
    expect(resetPasswordSchema.safeParse({ token, password: "short" }).success).toBe(false);
    expect(resetPasswordSchema.safeParse({ token: "XYZ!", password: "NewPass1234!" }).success).toBe(false);
    expect(resetPasswordSchema.safeParse({ token: "a".repeat(47), password: "NewPass1234!" }).success).toBe(false);
    expect(resetPasswordSchema.safeParse({ password: "NewPass1234!" }).success).toBe(false);
  });
});

describe("rumEventSchema (S18 — the RUM hook)", () => {
  it("accepts each web-vitals metric with a rating and navigation type", () => {
    for (const metric of ["TTFB", "FCP", "LCP", "CLS", "INP"] as const) {
      const r = rumEventSchema.safeParse({
        metric,
        value: 123.4,
        rating: "good",
        navigationType: "navigate",
        path: "/",
        sessionId: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
        userAgent: "Mozilla/5.0 (X11; Linux x86_64)",
      });
      expect(r.success).toBe(true);
    }
  });

  it("accepts every rating and navigationType the library emits", () => {
    for (const rating of ["good", "needs-improvement", "poor"] as const) {
      expect(
        rumEventSchema.safeParse({ metric: "LCP", value: 1, rating, navigationType: "reload" }).success,
      ).toBe(true);
    }
    for (const navigationType of [
      "navigate",
      "reload",
      "back-forward",
      "back-forward-cache",
      "prerender",
      "restore",
      "soft-navigation",
    ] as const) {
      expect(
        rumEventSchema.safeParse({ metric: "CLS", value: 0, rating: "good", navigationType }).success,
      ).toBe(true);
    }
  });

  it("rejects unknown metrics, negative values, and unknown ratings", () => {
    const base = { metric: "LCP", value: 100, rating: "good", navigationType: "navigate" };
    expect(rumEventSchema.safeParse({ ...base, metric: "SI" }).success).toBe(false);
    expect(rumEventSchema.safeParse({ ...base, value: -1 }).success).toBe(false);
    expect(rumEventSchema.safeParse({ ...base, rating: "excellent" }).success).toBe(false);
    // S118/BS7 re-anchor: navigationType is the ENFORCED bounded free string
    // (a non-enum label the beacon may coin) — an EMPTY or 41-char label is
    // rejected, an unknown-but-short one is fine (the route's own contract).
    expect(rumEventSchema.safeParse({ ...base, navigationType: "" }).success).toBe(false);
    expect(rumEventSchema.safeParse({ ...base, navigationType: "n".repeat(41) }).success).toBe(false);
    expect(rumEventSchema.safeParse({ ...base, navigationType: "unknown" }).success).toBe(true);
  });

  it("bounds the path and userAgent strings (the store stays tidy)", () => {
    const base = { metric: "FCP", value: 50, rating: "good", navigationType: "navigate" };
    // S118/BS7 re-anchor: the ENFORCED bounds are path<=500 / UA<=400 (the
    // route's own inline shape, now the validation.ts source of truth).
    expect(rumEventSchema.safeParse({ ...base, path: "x".repeat(501) }).success).toBe(false);
    expect(rumEventSchema.safeParse({ ...base, path: "/".repeat(500) }).success).toBe(true);
    expect(rumEventSchema.safeParse({ ...base, userAgent: "u".repeat(401) }).success).toBe(false);
    // The sessionId is bounded on the BATCH schema (one per POST body).
    expect(rumBatchSchema.safeParse({ sessionId: "s".repeat(101), events: [{ ...base }] }).success).toBe(false);
    expect(rumBatchSchema.safeParse({ sessionId: "s".repeat(100), events: [{ ...base }] }).success).toBe(true);
  });
});

describe("changePasswordSchema (S24 — the account-security rotation)", () => {
  it("accepts a valid differing pair", () => {
    expect(
      changePasswordSchema.safeParse({ currentPassword: "Demo1234!", newPassword: "NewPass5678!" }).success,
    ).toBe(true);
  });

  it("applies the register family's policy to BOTH fields (min 8 / max 200)", () => {
    expect(
      changePasswordSchema.safeParse({ currentPassword: "short", newPassword: "NewPass5678!" }).success,
    ).toBe(false);
    expect(
      changePasswordSchema.safeParse({ currentPassword: "Demo1234!", newPassword: "short" }).success,
    ).toBe(false);
    expect(
      changePasswordSchema.safeParse({ currentPassword: "a".repeat(201), newPassword: "NewPass5678!" }).success,
    ).toBe(false);
    expect(
      changePasswordSchema.safeParse({ currentPassword: "Demo1234!", newPassword: "a".repeat(201) }).success,
    ).toBe(false);
    expect(changePasswordSchema.safeParse({ currentPassword: "Demo1234!" }).success).toBe(false);
    expect(changePasswordSchema.safeParse({}).success).toBe(false);
  });

  it("rejects the same-password pair with the actionable copy (the refine rule)", () => {
    const r = changePasswordSchema.safeParse({ currentPassword: "Demo1234!", newPassword: "Demo1234!" });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues[0].message).toBe(
        "The new password must be different from your current password.",
      );
    }
  });

  it("strips unknown keys (the repo-wide Zod convention — strip mode)", () => {
    const r = changePasswordSchema.safeParse({
      currentPassword: "Demo1234!",
      newPassword: "NewPass5678!",
      email: "attacker@evil.test",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data).not.toHaveProperty("email");
    }
  });
});

describe("rumBatchSchema (S18 — the beacon POST body)", () => {
  const event = {
    metric: "TTFB",
    value: 42,
    rating: "good",
    navigationType: "navigate",
    path: "/",
  };

  it("accepts a sessionId with up to 20 events (S118/BS7 re-anchor: the enforced cadence)", () => {
    const r = rumBatchSchema.safeParse({
      sessionId: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      events: [{ ...event }, { ...event, metric: "FCP", value: 90 }],
    });
    expect(r.success).toBe(true);
    expect(rumBatchSchema.safeParse({ sessionId: "abc", events: Array(20).fill(event) }).success).toBe(true);
  });

  it("rejects a missing sessionId, an empty batch, and >20 events", () => {
    expect(rumBatchSchema.safeParse({ events: [event] }).success).toBe(false);
    expect(rumBatchSchema.safeParse({ sessionId: "abc", events: [] }).success).toBe(false);
    expect(rumBatchSchema.safeParse({ sessionId: "abc", events: Array(21).fill(event) }).success).toBe(false);
  });

  it("rejects an invalid event inside the batch (per-item validation)", () => {
    expect(
      rumBatchSchema.safeParse({ sessionId: "abc", events: [{ ...event, metric: "NOPE" }] }).success,
    ).toBe(false);
  });
});

describe("deleteAccountSchema (S25 — the ownership exit)", () => {
  it("accepts a valid password + typed DELETE confirmation", () => {
    expect(deleteAccountSchema.safeParse({ password: "Demo1234!", confirmation: "DELETE" }).success).toBe(true);
  });

  it("applies the register family's password policy (min 8 / max 200)", () => {
    expect(deleteAccountSchema.safeParse({ password: "short", confirmation: "DELETE" }).success).toBe(false);
    expect(deleteAccountSchema.safeParse({ password: "a".repeat(201), confirmation: "DELETE" }).success).toBe(false);
    expect(deleteAccountSchema.safeParse({ confirmation: "DELETE" }).success).toBe(false);
    expect(deleteAccountSchema.safeParse({}).success).toBe(false);
  });

  it("rejects a wrong confirmation word with the actionable copy (the refine rule — case-exact)", () => {
    for (const bad of ["delete", "REMOVE", "", "DELETE ", "confirm"]) {
      const r = deleteAccountSchema.safeParse({ password: "Demo1234!", confirmation: bad });
      expect(r.success, `confirmation "${bad}" should fail`).toBe(false);
      if (!r.success) {
        expect(r.error.issues[0].message).toBe("Type DELETE to confirm.");
      }
    }
  });

  it("strips unknown keys (the repo-wide Zod convention — strip mode)", () => {
    const r = deleteAccountSchema.safeParse({
      password: "Demo1234!",
      confirmation: "DELETE",
      email: "attacker@evil.test",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data).not.toHaveProperty("email");
    }
  });
});

describe("changeEmailSchema (S26 — the account-identity rotation)", () => {
  it("accepts a valid triple (password + matching emails)", () => {
    expect(
      changeEmailSchema.safeParse({
        password: "Demo1234!",
        newEmail: "student@example.com",
        confirmEmail: "student@example.com",
      }).success,
    ).toBe(true);
  });

  it("applies the register family's policy (password min 8 / max 200; email max 200)", () => {
    expect(
      changeEmailSchema.safeParse({
        password: "short",
        newEmail: "student@example.com",
        confirmEmail: "student@example.com",
      }).success,
    ).toBe(false);
    expect(
      changeEmailSchema.safeParse({
        password: "a".repeat(201),
        newEmail: "student@example.com",
        confirmEmail: "student@example.com",
      }).success,
    ).toBe(false);
    expect(changeEmailSchema.safeParse({ newEmail: "student@example.com", confirmEmail: "student@example.com" }).success).toBe(
      false,
    );
    expect(changeEmailSchema.safeParse({}).success).toBe(false);
  });

  it("rejects a malformed new email (the email field's own shape)", () => {
    for (const bad of ["not-an-email", "missing@tld", "a".repeat(200) + "@x.test", ""]) {
      const r = changeEmailSchema.safeParse({
        password: "Demo1234!",
        newEmail: bad,
        confirmEmail: bad,
      });
      expect(r.success, `newEmail "${bad.slice(0, 30)}" should fail`).toBe(false);
    }
  });

  it("rejects the mismatched confirm with the actionable copy (the refine rule)", () => {
    const r = changeEmailSchema.safeParse({
      password: "Demo1234!",
      newEmail: "student@example.com",
      confirmEmail: "student@typo.example",
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues[0].message).toBe("The email addresses do not match.");
    }
  });

  it("strips unknown keys (the repo-wide Zod convention — strip mode)", () => {
    const r = changeEmailSchema.safeParse({
      password: "Demo1234!",
      newEmail: "student@example.com",
      confirmEmail: "student@example.com",
      userId: "attacker-injection",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data).not.toHaveProperty("userId");
    }
  });
});

// S117/BR4 — the link-file URL guard. z.string().url() alone accepts
// WHATWG-valid javascript:/data: URLs; a stored href rendered with
// target="_blank" is script execution in the app origin on click. The
// upload route (files/route.ts POST) has enforced ^https?:// since S14 —
// this pin holds the LINK route (files/link/route.ts) to the same rule
// through the shared schema (the near-duplicate inconsistency the s117
// audit closed).
describe("linkFileSchema (S117/BR4 — http(s)-only link URLs)", () => {
  it("accepts http and https URLs", () => {
    const ok = (url: string) => linkFileSchema.safeParse({ name: "Docs", url }).success;
    expect(ok("https://example.com/study-guide.pdf")).toBe(true);
    expect(ok("http://localhost:8080/notes.txt")).toBe(true);
    expect(ok("https://developer.mozilla.org/en-US/docs/Web/HTTP")).toBe(true);
  });

  it("rejects javascript:, data:, and other non-http(s) schemes", () => {
    const bad = (url: string) => linkFileSchema.safeParse({ name: "X", url }).success;
    expect(bad("javascript:alert(document.cookie)")).toBe(false);
    expect(bad("JavaScript:alert(1)")).toBe(false);
    expect(bad("data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==")).toBe(false);
    expect(bad("file:///etc/passwd")).toBe(false);
    expect(bad("ftp://example.com/file")).toBe(false);
    expect(bad("mailto:someone@example.com")).toBe(false);
  });

  it("keeps the name/folderId shape of the route's original schema", () => {
    expect(linkFileSchema.safeParse({ name: "", url: "https://example.com" }).success).toBe(false);
    expect(
      linkFileSchema.safeParse({ name: "x".repeat(201), url: "https://example.com" }).success,
    ).toBe(false);
    expect(
      linkFileSchema.safeParse({ name: "Ok", url: "https://example.com", folderId: "folder-1" })
        .success,
    ).toBe(true);
  });
});

// ---- S118/BS2 + BS5 + BS7: the bounded-reads / shared-link / RUM families ----

describe("the email atom trims and bounds (S118/BS2)", () => {
  it("accepts a padded email and parses it trimmed", () => {
    const r = loginSchema.safeParse({ email: "  demo@studyflow.app  ", password: "Demo1234!" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.email).toBe("demo@studyflow.app");
  });

  it("rejects an email longer than 200 chars", () => {
    const long = `${"a".repeat(190)}@example.com`;
    expect(loginSchema.safeParse({ email: long, password: "Demo1234!" }).success).toBe(false);
  });
});

describe("jsonArray is length-bounded (S118/BS2)", () => {
  it("accepts a <=100k-char JSON array and rejects a longer one", () => {
    // Both bodies must be VALID JSON arrays — only the length crosses the cap.
    const under = "[" + `"x",`.repeat(24_998) + '"x"' + "]"; // 99,997 chars
    expect(under.length).toBe(99_997);
    expect(taskSchema.safeParse({ title: "t", subtasks: under }).success).toBe(true);
    const over = "[" + `"x",`.repeat(25_001) + '"x"' + "]"; // 100,007 chars
    expect(over.length).toBeGreaterThan(100_000);
    expect(taskSchema.safeParse({ title: "t", subtasks: over }).success).toBe(false);
  });
});

describe("requiredDate validates as a date (S118/BS2)", () => {
  it("rejects garbage date strings (a 400 at the boundary, never a Prisma 500)", () => {
    expect(holidaySchema.safeParse({ name: "Break", date: "not-a-date" }).success).toBe(false);
    expect(holidaySchema.safeParse({ name: "Break", date: "" }).success).toBe(false);
  });

  it("rejects an over-long date string and accepts a real ISO date", () => {
    expect(holidaySchema.safeParse({ name: "B", date: "x".repeat(41) }).success).toBe(false);
    expect(holidaySchema.safeParse({ name: "B", date: "2026-11-01T00:00:00.000Z" }).success).toBe(true);
  });
});

describe("idField is length-bounded (S118/BS2)", () => {
  it("rejects a 65-char id (cuids are 25)", () => {
    const body = { deckId: "d".repeat(65), front: "f", back: "b" };
    expect(flashcardSchema.safeParse(body).success).toBe(false);
    expect(
      flashcardSchema.safeParse({ deckId: "d".repeat(64), front: "f", back: "b" }).success,
    ).toBe(true);
  });
});

describe("mathSolveSchema.image is length-bounded (S118/BS2)", () => {
  const url = (n: number) => `data:image/png;base64,${"A".repeat(n)}`;
  it("rejects a data-URL image over 7,000,000 chars (boundary-exact incl. the prefix)", () => {
    expect(mathSolveSchema.safeParse({ problem: "p", image: url(7_000_000 - 22) }).success).toBe(true);
    expect(mathSolveSchema.safeParse({ problem: "p", image: url(7_000_000 - 21) }).success).toBe(false);
  });
});

describe("linkFileSchema.name trims before the checks (S118/BS5 — the AM1 convention)", () => {
  it("rejects a whitespace-only name at BOTH file-link entry points", () => {
    expect(linkFileSchema.safeParse({ name: "   ", url: "https://example.com" }).success).toBe(false);
  });

  it("stores a padded name trimmed", () => {
    const r = linkFileSchema.safeParse({ name: "  Docs  ", url: "https://example.com" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.name).toBe("Docs");
  });
});

describe("rumEventSchema/rumBatchSchema carry the ROUTE's enforced bounds (S118/BS7)", () => {
  const base = {
    metric: "LCP",
    value: 1,
    rating: "good",
    navigationType: "navigate",
    path: "/Dashboard",
    userAgent: "ua",
  } as const;

  it("navigationType is a bounded free string, not an enum (the enforced shape)", () => {
    expect(rumEventSchema.safeParse({ ...base, navigationType: "unknown" }).success).toBe(true);
    expect(rumEventSchema.safeParse({ ...base, navigationType: "" }).success).toBe(false);
    expect(rumEventSchema.safeParse({ ...base, navigationType: "n".repeat(41) }).success).toBe(false);
  });

  it("path allows 500 and rejects 501; userAgent allows 400 and rejects 401", () => {
    expect(rumEventSchema.safeParse({ ...base, path: "/".repeat(500) }).success).toBe(true);
    expect(rumEventSchema.safeParse({ ...base, path: "/".repeat(501) }).success).toBe(false);
    expect(rumEventSchema.safeParse({ ...base, userAgent: "u".repeat(400) }).success).toBe(true);
    expect(rumEventSchema.safeParse({ ...base, userAgent: "u".repeat(401) }).success).toBe(false);
  });

  it("value is bounded at 6,000,000 (the DoS cap the route enforces)", () => {
    expect(rumEventSchema.safeParse({ ...base, value: 6_000_000 }).success).toBe(true);
    expect(rumEventSchema.safeParse({ ...base, value: 6_000_001 }).success).toBe(false);
  });

  it("the batch allows up to 20 events (the beacon's real cadence)", () => {
    const events = Array.from({ length: 20 }, () => ({ ...base }));
    expect(rumBatchSchema.safeParse({ sessionId: "s", events }).success).toBe(true);
    expect(
      rumBatchSchema.safeParse({ sessionId: "s", events: [...events, { ...base }] }).success,
    ).toBe(false);
  });
});

// S121/BV5 — the practice-test questions blob bound.
//
// `questions` was the only JSON-blob field with no `.max()`: a ~9.5 MiB
// valid-questions JSON passed the schema AND the 10 MiB read cap and
// persisted to SQLite (every sibling blob is capped: content 100k, tags 2k,
// reminders/subtasks/topics 100k). The bound is the family convention.
describe("practiceTestSchema.questions bound (S121/BV5)", () => {
  it("accepts a valid questions JSON at the 100,000-char boundary", () => {
    // The JSON wrapper around one short_answer question is exactly 39 chars:
    // [{"question":"…","type":"short_answer"}] — pad the question so the
    // WHOLE body lands on exactly 100,000.
    const wrap = (question: string) =>
      JSON.stringify([{ question, type: "short_answer" }]);
    expect(wrap("").length).toBe(39);
    const body = wrap("q".repeat(100_000 - 39));
    expect(body.length).toBe(100_000);
    expect(practiceTestSchema.safeParse({ title: "Bound probe", questions: body }).success).toBe(true);
  });

  it("rejects a VALID questions JSON longer than 100,000 chars (the max, not the refine)", () => {
    const wrap = (question: string) =>
      JSON.stringify([{ question, type: "short_answer" }]);
    const body = wrap("q".repeat(100_000 - 39 + 1));
    expect(body.length).toBe(100_001);
    // The refine itself passes (valid shape) — the length cap is the rejection.
    const parsed = JSON.parse(body) as unknown[];
    expect(Array.isArray(parsed)).toBe(true);
    expect(practiceTestSchema.safeParse({ title: "Bound probe", questions: body }).success).toBe(false);
  });
});

// S123/BX1 — the both-legs timetable ordering guard must compare MINUTES,
// never raw strings. The hhmm atom admits UNPADDED hours ("9:00" — the
// seed's own legacy shape, written past the Zod boundary), and
// "11:00" < "9:00" lexicographically, so the raw compare BOTH falsely
// rejects legal spans AND accepts inverted ones (wire-verified both ways
// on the dev server pre-fix). The single-leg merge normalized minutes in
// S122/BW7; the schema-level both-legs path never got the same treatment.
describe("S123/BX1: the both-legs timetable ordering compares minutes, not strings", () => {
  it("accepts a LEGAL span with an unpadded start (9:00 → 11:00 — the seeded shape)", () => {
    const parsed = timetableClassCreateSchema.parse({
      name: "BX1 legal unpadded",
      dayOfWeek: 1,
      startTime: "9:00",
      endTime: "11:00",
    });
    expect(parsed.startTime).toBe("9:00");
  });

  it("rejects an INVERTED span with a padded start and an unpadded earlier end (09:00 → 8:30)", () => {
    // "8:30" > "09:00" lexicographically — the raw compare let this row
    // PERSIST pre-fix (wire-verified: 201 CREATED).
    const res = timetableClassCreateSchema.safeParse({
      name: "BX1 inverted",
      dayOfWeek: 1,
      startTime: "09:00",
      endTime: "8:30",
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0].message).toBe("End time must be after the start time");
    }
  });

  it("rejects an inverted span on the update schema's both-legs path too", () => {
    const res = timetableClassUpdateSchema.safeParse({ startTime: "10:00", endTime: "9:30" });
    expect(res.success).toBe(false);
  });

  it("still rejects malformed times at the atom (the regex leg, unchanged)", () => {
    expect(
      timetableClassCreateSchema.safeParse({
        name: "BX1 malformed",
        dayOfWeek: 1,
        startTime: "9:0",
        endTime: "10:00",
      }).success,
    ).toBe(false);
    expect(
      timetableClassCreateSchema.safeParse({
        name: "BX1 malformed",
        dayOfWeek: 1,
        startTime: "24:00",
        endTime: "25:00",
      }).success,
    ).toBe(false);
  });
});

// S123/BX1 — the exported normalization helpers (the single source the
// entities.ts merge and the timetable edit form both consume).
describe("S123/BX1: hhmmMinutes + normalizeHhmmForInput", () => {
  it("maps padded and unpadded forms to the same minutes-since-midnight", () => {
    expect(hhmmMinutes("9:00")).toBe(540);
    expect(hhmmMinutes("09:00")).toBe(540);
    expect(hhmmMinutes("8:30")).toBe(510);
    expect(hhmmMinutes("23:59")).toBe(1439);
    expect(hhmmMinutes("0:00")).toBe(0);
  });

  it("returns null for malformed or out-of-range values (the skip legs)", () => {
    expect(hhmmMinutes("24:00")).toBeNull();
    expect(hhmmMinutes("9:60")).toBeNull();
    expect(hhmmMinutes("9:0")).toBeNull();
    expect(hhmmMinutes("09:00:00")).toBeNull();
    expect(hhmmMinutes("")).toBeNull();
  });

  it("pads a 1-digit hour for <input type=time> and leaves valid values untouched", () => {
    // The HTML value-sanitization algorithm blanks a non-HH:MM value —
    // the seeded legacy rows ("9:00") opened the edit dialog with an
    // EMPTY start input (live-verified on the pre-fix tree).
    expect(normalizeHhmmForInput("9:00")).toBe("09:00");
    expect(normalizeHhmmForInput("09:00")).toBe("09:00");
    expect(normalizeHhmmForInput("10:30")).toBe("10:30");
    // A value that is already unparseable passes through unchanged — the
    // input's own required gate owns that case; this seam never invents
    // validation.
    expect(normalizeHhmmForInput("bad")).toBe("bad");
    expect(normalizeHhmmForInput("")).toBe("");
  });
});

// S123/BX5 — nullableId exported for the folder routes (the "" → null
// clear-to-root convention the atom's min(1) twin rejected BEFORE the
// transform — the dead-code leg the API audit found).
describe("S123/BX5: the exported nullableId atom", () => {
  it("maps the empty string to null (the clear-to-root convention)", () => {
    expect(nullableId.parse("")).toBeNull();
    expect(nullableId.parse(undefined)).toBeNull();
    expect(nullableId.parse(null)).toBeNull();
  });

  it("passes valid ids and still rejects over-length garbage", () => {
    expect(nullableId.parse("abc123")).toBe("abc123");
    expect(nullableId.safeParse("x".repeat(65)).success).toBe(false);
  });
});

// S124/BY1 — the gradeLevel clearable form. The Study Profile card ships a
// "Not set" option, but the schema's enum had no clearable leg: the UI
// mapped "none" → undefined, JSON.stringify dropped the key, and the route's
// sent-keys filter skipped it — the stored grade silently persisted behind a
// success toast. The DB column is String @default("") (the natural cleared
// state — schoolName: "" already clears fine in the same card).
describe("S124/BY1: the gradeLevel clearable form", () => {
  it("still accepts the 12 documented grades (the shipped enum leg, unchanged)", () => {
    expect(preferencesSchema.safeParse({ gradeLevel: "9th Grade" }).success).toBe(true);
    expect(preferencesSchema.safeParse({ gradeLevel: "Graduate" }).success).toBe(true);
  });

  it('accepts the "" clear form and parses it to the stored-empty state (RED pre-fix: the ZodError itself)', () => {
    const out = preferencesSchema.safeParse({ gradeLevel: "" });
    expect(out.success).toBe(true);
    if (out.success) expect(out.data.gradeLevel).toBe("");
  });

  it("still rejects values outside the vocabulary", () => {
    expect(preferencesSchema.safeParse({ gradeLevel: "Kindergarten" }).success).toBe(false);
    expect(preferencesSchema.safeParse({ gradeLevel: " " }).success).toBe(false);
  });
});

// S124/BY9 — the avatarEmoji vocabulary at the API boundary. The picker is
// unit-pinned to 24 emojis, but the schema accepted ANY ≤8-code-point string
// — an arbitrary string stored + rendered as the avatar (React-escaped, no
// XSS — but the Settings grid then shows no selected tile). The "" clear
// form stays legal (the seed's own default state).
describe("S124/BY9: the avatarEmoji vocabulary at the boundary", () => {
  it("accepts a listed emoji (the picker's 24)", () => {
    expect(preferencesSchema.safeParse({ avatarEmoji: "🎓" }).success).toBe(true);
    expect(preferencesSchema.safeParse({ avatarEmoji: "🏆" }).success).toBe(true);
  });

  it('accepts the "" clear form (the reference default state)', () => {
    expect(preferencesSchema.safeParse({ avatarEmoji: "" }).success).toBe(true);
  });

  it("rejects an unlisted string (RED pre-fix: accepted at ≤8 code points)", () => {
    expect(preferencesSchema.safeParse({ avatarEmoji: "sneaky" }).success).toBe(false);
  });

  it("rejects an unlisted 8-code-point string — max-length alone never sufficed", () => {
    expect(preferencesSchema.safeParse({ avatarEmoji: "sneaky12" }).success).toBe(false);
  });
});

// S125/BZ6 — the grade ordering guard (the events BU22+BV1 pattern on the
// score/maxScore pair). The schema capped each leg independently but never
// checked the pair: 900/100 persisted and rendered 900%. The CREATE shape
// carries the .check() (score is required; an unsent maxScore defaults to
// 100 — the injected value IS the honest row state at create time, so a
// bare 900 is honestly "900 out of the default 100"). The UPDATE path
// deliberately owns NO schema check: zod4's .partial() injects the
// maxScore default into every parsed payload, so a schema-side compare
// would read the injected 100 instead of the stored pair (the sent-keys
// filter drops the injected key before the write, but .check() runs
// INSIDE parse) — the checkGradeRangeMerge beforeWrite seam owns BOTH legs
// on PATCH (the single unified compare — tests/grade-merge.test.ts).
describe("S125/BZ6: the grade score ≤ maxScore guard (the create shape)", () => {
  it("rejects an inverted pair (a score above the maximum)", () => {
    expect(
      gradeCreateSchema.safeParse({ title: "Midterm", score: 900, maxScore: 100 }).success,
    ).toBe(false);
  });

  it("accepts the legal pair", () => {
    expect(
      gradeCreateSchema.safeParse({ title: "Midterm", score: 90, maxScore: 100 }).success,
    ).toBe(true);
  });

  it("accepts a 900-point score under a 1000-point maximum (the measured heavy case)", () => {
    expect(
      gradeCreateSchema.safeParse({ title: "Final", score: 900, maxScore: 1000 }).success,
    ).toBe(true);
  });

  it("rejects a bare 900 (the defaulted 100 denominator — the honest create semantics)", () => {
    expect(gradeCreateSchema.safeParse({ title: "Final", score: 900 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// S133/CH8 — the trim-before-check on the title/name family (the AM1/BS5
// doctrine applied to boundedTitle + the folder-name schemas). A
// whitespace-only `{"title": "   "}` passed min(1) and persisted as a
// visually blank row; a padded `"  x  "` stored untrimmed. The interactive
// boundary now normalizes exactly like the members/link-file/multipart
// names the doctrine already covered.
// ---------------------------------------------------------------------------
describe("the boundedTitle trim-before-check (S133/CH8)", () => {
  it("rejects a whitespace-only title (blank rows no longer persist)", () => {
    expect(taskSchema.safeParse({ title: "   " }).success).toBe(false);
    expect(noteSchema.safeParse({ title: " \t " }).success).toBe(false);
    expect(eventSchema.safeParse({ title: " " }).success).toBe(false);
    expect(examSchema.safeParse({ title: "   " }).success).toBe(false);
    expect(subjectSchema.safeParse({ name: "   " }).success).toBe(false);
    expect(studyGroupSchema.safeParse({ name: "   " }).success).toBe(false);
    expect(gradeSchema.safeParse({ title: "   ", score: 1 }).success).toBe(false);
  });

  it("stores a padded title TRIMMED (the AM1 normalization)", () => {
    expect(taskSchema.parse({ title: "  Read chapter 4  " }).title).toBe("Read chapter 4");
    expect(subjectSchema.parse({ name: "  Math  " }).name).toBe("Math");
  });

  it("the 200-char cap applies to the TRIMMED value (a padded-at-boundary title rejects on the untrimmed length first — the atom's own order)", () => {
    // 199 chars + 2 spaces = 201 raw: min passes after trim (199), and the
    // z.string().trim() chain trims BEFORE max applies — 199 <= 200 passes.
    const padded = "x".repeat(199) + "  ";
    expect(taskSchema.safeParse({ title: padded }).success).toBe(true);
    expect(taskSchema.safeParse({ title: "x".repeat(201) }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// S133/CH2's vocabulary single-source — the four inline z.enum literals
// (exams.type, timetableClasses.weekType, focusSessions.mode,
// calculatorHistory.mode) became exported arrays (the TASK_PRIORITIES
// precedent) so the import seam can mirror them without re-typing the
// vocabularies.
// ---------------------------------------------------------------------------
describe("the exported vocabulary atoms (S133/CH2 single-source)", () => {
  it("EXAM_TYPES / WEEK_TYPES / FOCUS_SESSION_MODES / CALCULATOR_MODES carry the route vocabularies verbatim", async () => {
    const { EXAM_TYPES, WEEK_TYPES, FOCUS_SESSION_MODES, CALCULATOR_MODES } = await import("@/lib/validation");
    expect([...EXAM_TYPES]).toEqual(["test", "quiz", "midterm", "final", "oral", "practical"]);
    expect([...WEEK_TYPES]).toEqual(["ALL", "A", "B"]);
    expect([...FOCUS_SESSION_MODES]).toEqual(["focus", "short-break", "long-break"]);
    expect([...CALCULATOR_MODES]).toEqual(["basic", "scientific", "gpa", "unit"]);
  });
});

// ---------------------------------------------------------------------------
// S150/CY2 (the S146/B-I3 trim rider, landed at its named validation-family
// cycle): the schoolName trim at the validation ATOM. Every sibling text
// field carries the trim-before-store doctrine (boundedTitle, emailField,
// the route-side displayName.trim()); schoolName was the one untrimmed text
// atom — a whitespace-only value persisted verbatim while the DB's natural
// cleared state is "" (the BY1 gradeLevel convention in the same card). One
// canonical atom: the settings route stores prefs.schoolName, the import
// profile patch parses through the same schema — both paths land the trim.
// Pre-fix RED: the schema returned the padded value verbatim.
// ---------------------------------------------------------------------------
describe("S150/CY2: the schoolName trim at the validation atom", () => {
  it("trims a padded school name before the store (the boundedTitle convention)", () => {
    const out = preferencesSchema.safeParse({ schoolName: "  Lincoln High  " });
    expect(out.success).toBe(true);
    if (out.success) expect(out.data.schoolName).toBe("Lincoln High");
  });

  it("normalizes a whitespace-only school name to the cleared state (not verbatim whitespace), with the bound still post-trim", () => {
    const out = preferencesSchema.safeParse({ schoolName: "   " });
    expect(out.success).toBe(true);
    if (out.success) expect(out.data.schoolName).toBe("");
    // The trim orders BEFORE .max(): a padded raw value that trims within
    // 120 passes (pre-trim the raw length would have failed) — the
    // ordering witness.
    const padded = preferencesSchema.safeParse({
      schoolName: ` ${"x".repeat(120)} `,
    });
    expect(padded.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// S152/DA5 (Audit B B-I1): the registerSchema fullName trim at the
// validation ATOM — the trim-before-store doctrine's last gap (the CY2
// schoolName shape verbatim). boundedTitle, emailField, schoolName, the
// group members, the upload names, and the route-side displayName.trim()
// all trim; fullName was the one untrimmed text atom at a write boundary —
// a whitespace-padded or whitespace-only name persisted verbatim (the
// register response + the /api/auth/me card render it). One canonical
// atom: the register route parses through this schema and every future
// consumer lands the trim for free.
// Pre-fix RED: the schema returns the padded value verbatim.
// ---------------------------------------------------------------------------
describe("S152/DA5: the registerSchema fullName trim at the validation atom", () => {
  it("trims a padded full name before the store (the boundedTitle convention)", () => {
    const out = registerSchema.safeParse({
      fullName: "  Ada Lovelace  ",
      email: "ada@studyflow.app",
      password: "Demo1234!",
    });
    expect(out.success).toBe(true);
    if (out.success) expect(out.data.fullName).toBe("Ada Lovelace");
  });

  it("normalizes a whitespace-only full name to the default cleared state, with the bound still post-trim", () => {
    const out = registerSchema.safeParse({
      fullName: "   ",
      email: "ada@studyflow.app",
      password: "Demo1234!",
    });
    expect(out.success).toBe(true);
    if (out.success) expect(out.data.fullName).toBe("");
    // The trim orders BEFORE .max(): a padded raw value that trims within
    // 100 passes (pre-trim the raw length would have failed) — the
    // ordering witness (the CY2 probe shape).
    const padded = registerSchema.safeParse({
      fullName: ` ${"x".repeat(100)} `,
      email: "ada@studyflow.app",
      password: "Demo1234!",
    });
    expect(padded.success).toBe(true);
  });
});
