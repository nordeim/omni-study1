"use client";

// ---------------------------------------------------------------------------
// The client data layer (§6): one Zustand store with a per-entity cache
// slice per collection, plus the typed `mutations` object — the ONLY path
// views take to read or write data (never an ad-hoc fetch).
//
// Collection GETs answer plain JSON arrays (pinned by tests/e2e/s23);
// every write PATCH/POST/DELETEs through /api/<entity> and refreshes the
// touched slice(s) — a delete with SetNull FKs refreshes every collection
// the cascade can reach.
// ---------------------------------------------------------------------------

import { create } from "zustand";
import type { z } from "zod";

import { apiGet, apiSend } from "./api";
import {
  assignmentSchema,
  calculatorHistorySchema,
  eventSchema,
  examSchema,
  flashcardDeckSchema,
  flashcardSchema,
  focusSessionSchema,
  gradeSchema,
  holidaySchema,
  noteSchema,
  notebookSchema,
  practiceTestSchema,
  studyGroupSchema,
  subjectSchema,
  taskListSchema,
  taskSchema,
  timetableClassSchema,
} from "./validation";

// ---- collection registry (the view-collections seam's PATHS) ----------------

export const PATHS = {
  subjects: "/api/subjects",
  taskLists: "/api/task-lists",
  tasks: "/api/tasks",
  assignments: "/api/assignments",
  exams: "/api/exams",
  events: "/api/events",
  timetable: "/api/timetable",
  notebooks: "/api/notebooks",
  notes: "/api/notes",
  flashcardDecks: "/api/flashcards/decks",
  flashcards: "/api/flashcards/cards",
  practiceTests: "/api/practice-tests",
  studyGroups: "/api/study-groups",
  grades: "/api/grades",
  focusSessions: "/api/focus-sessions",
  holidays: "/api/holidays",
  calculatorHistory: "/api/calculator/history",
  aiMessages: "/api/ai/messages",
} as const;

export type CollectionKey = keyof typeof PATHS;

// ---- entity rows (camelCase mirrors of the Prisma models; ISO date strings)

export type SubjectRow = {
  id: string;
  userId: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
};

export type TaskListRow = {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type TaskPriority = "none" | "low" | "medium" | "high";
export type RepeatMode = "none" | "daily" | "weekly" | "monthly";

export type TaskRow = {
  id: string;
  userId: string;
  title: string;
  notes: string;
  listId: string | null;
  subjectId: string | null;
  completed: boolean;
  important: boolean;
  dueDate: string | null;
  priority: TaskPriority;
  repeat: RepeatMode;
  myDay: boolean;
  subtasks: string; // JSON "[{id,title,done}]"
  createdAt: string;
  updatedAt: string;
};

export type AssignmentRow = {
  id: string;
  userId: string;
  title: string;
  description: string;
  subjectId: string | null;
  dueDate: string | null;
  type: string;
  progress: number;
  priority: "low" | "medium" | "high" | "urgent";
  createdAt: string;
  updatedAt: string;
};

export type ExamRow = {
  id: string;
  userId: string;
  title: string;
  date: string;
  subjectId: string | null;
  type: string;
  duration: number;
  topics: string; // JSON string array
  createdAt: string;
  updatedAt: string;
};

export type EventRow = {
  id: string;
  userId: string;
  title: string;
  startDate: string;
  endDate: string | null;
  allDay: boolean;
  color: string;
  location: string;
  repeat: RepeatMode;
  reminders: string; // JSON minutesBefore[]
  createdAt: string;
  updatedAt: string;
};

export type TimetableClassRow = {
  id: string;
  userId: string;
  name: string;
  dayOfWeek: number; // 0=Monday … 6=Sunday (ISO minus one)
  startTime: string; // "9:00"
  endTime: string;
  subjectId: string | null;
  room: string;
  weekType: "ALL" | "A" | "B";
  createdAt: string;
  updatedAt: string;
};

export type NotebookRow = {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type NoteRow = {
  id: string;
  userId: string;
  title: string;
  content: string;
  notebookId: string | null;
  subjectId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FlashcardDeckRow = {
  id: string;
  userId: string;
  name: string;
  description: string;
  color: string;
  subjectId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FlashcardRow = {
  id: string;
  deckId: string;
  front: string;
  back: string;
  difficulty: "easy" | "medium" | "hard";
  mastered: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PracticeTestRow = {
  id: string;
  userId: string;
  title: string;
  durationMinutes: number;
  questions: string; // JSON [{question,type,...}]
  subjectId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StudyGroupRow = {
  id: string;
  userId: string;
  name: string;
  subjectId: string | null;
  members: string; // JSON [{name,email}]
  createdAt: string;
  updatedAt: string;
};

export type GradeRow = {
  id: string;
  userId: string;
  title: string;
  score: number;
  maxScore: number;
  weight: number;
  subjectId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FocusSessionRow = {
  id: string;
  userId: string;
  subjectId: string | null;
  startedAt: string;
  durationSeconds: number;
  mode: "focus" | "short-break" | "long-break";
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

export type HolidayRow = {
  id: string;
  userId: string;
  name: string;
  date: string;
  createdAt: string;
  updatedAt: string;
};

export type CalculatorHistoryRow = {
  id: string;
  userId: string;
  expression: string;
  result: string;
  mode: "basic" | "scientific" | "gpa" | "unit";
  createdAt: string;
  updatedAt: string;
};

export type AiChatMessageRow = {
  id: string;
  userId: string;
  role: "user" | "assistant";
  content: string;
  surface: "assistant" | "solver";
  createdAt: string;
  updatedAt: string;
};

// ---- the slice map ----------------------------------------------------------

export type EntityMap = {
  subjects: SubjectRow[];
  taskLists: TaskListRow[];
  tasks: TaskRow[];
  assignments: AssignmentRow[];
  exams: ExamRow[];
  events: EventRow[];
  timetable: TimetableClassRow[];
  notebooks: NotebookRow[];
  notes: NoteRow[];
  flashcardDecks: FlashcardDeckRow[];
  flashcards: FlashcardRow[];
  practiceTests: PracticeTestRow[];
  studyGroups: StudyGroupRow[];
  grades: GradeRow[];
  focusSessions: FocusSessionRow[];
  holidays: HolidayRow[];
  calculatorHistory: CalculatorHistoryRow[];
  aiMessages: AiChatMessageRow[];
};

type RowOf<K extends CollectionKey> = EntityMap[K][number];

type DataState = EntityMap & {
  loading: boolean;
  setSlice: <K extends CollectionKey>(key: K, rows: EntityMap[K]) => void;
  addRow: <K extends CollectionKey>(key: K, row: RowOf<K>) => void;
  updateRow: <K extends CollectionKey>(key: K, id: string, patch: Partial<RowOf<K>>) => void;
  removeRow: <K extends CollectionKey>(key: K, id: string) => void;
  loadAll: () => Promise<void>;
  /** Fetch ONLY the given collections in parallel (the pre-warm path). */
  loadCollections: (keys: ReadonlyArray<CollectionKey>) => Promise<void>;
};

const ALL_KEYS = Object.keys(PATHS) as CollectionKey[];

async function fetchAndSet<K extends CollectionKey>(key: K): Promise<void> {
  const rows = await apiGet<EntityMap[K]>(PATHS[key]);
  useDataStore.getState().setSlice(key, rows);
}

export const useDataStore = create<DataState>((set, get) => ({
  subjects: [],
  taskLists: [],
  tasks: [],
  assignments: [],
  exams: [],
  events: [],
  timetable: [],
  notebooks: [],
  notes: [],
  flashcardDecks: [],
  flashcards: [],
  practiceTests: [],
  studyGroups: [],
  grades: [],
  focusSessions: [],
  holidays: [],
  calculatorHistory: [],
  aiMessages: [],

  loading: false,

  setSlice: (key, rows) => set((state) => ({ ...state, [key]: rows }) as DataState),

  addRow: (key, row) =>
    set(
      (state) => ({ ...state, [key]: [...state[key], row] }) as DataState,
    ),

  updateRow: (key, id, patch) =>
    set((state) => {
      const rows = state[key].map((row) =>
        row.id === id ? { ...row, ...patch } : row,
      );
      return { ...state, [key]: rows } as DataState;
    }),

  removeRow: (key, id) =>
    set((state) => {
      const rows = state[key].filter((row) => row.id !== id);
      return { ...state, [key]: rows } as DataState;
    }),

  loadAll: async () => {
    set({ loading: true });
    try {
      await Promise.all(ALL_KEYS.map((key) => fetchAndSet(key)));
    } finally {
      set({ loading: false });
    }
  },

  loadCollections: async (keys) => {
    set({ loading: true });
    try {
      await Promise.all(keys.map((key) => fetchAndSet(key)));
    } finally {
      set({ loading: false });
    }
  },
}));

// ---- mutations ---------------------------------------------------------------
// Every mutation performs the API call AND refreshes the touched collection(s)
// (a cascade delete refreshes every SetNull target). Views read snapshots.

export type SubjectInput = z.input<typeof subjectSchema>;
export type TaskListInput = z.input<typeof taskListSchema>;
export type TaskInput = z.input<typeof taskSchema>;
export type AssignmentInput = z.input<typeof assignmentSchema>;
export type ExamInput = z.input<typeof examSchema>;
export type EventInput = z.input<typeof eventSchema>;
export type TimetableClassInput = z.input<typeof timetableClassSchema>;
export type NotebookInput = z.input<typeof notebookSchema>;
export type NoteInput = z.input<typeof noteSchema>;
export type FlashcardDeckInput = z.input<typeof flashcardDeckSchema>;
export type FlashcardInput = z.input<typeof flashcardSchema>;
export type PracticeTestInput = z.input<typeof practiceTestSchema>;
export type StudyGroupInput = z.input<typeof studyGroupSchema>;
export type GradeInput = z.input<typeof gradeSchema>;
export type FocusSessionInput = z.input<typeof focusSessionSchema>;
export type HolidayInput = z.input<typeof holidaySchema>;
export type CalculatorHistoryInput = z.input<typeof calculatorHistorySchema>;

/** The collections a deleted subject's SetNull FKs reach. */
const SUBJECT_TOUCHED: CollectionKey[] = [
  "subjects",
  "tasks",
  "assignments",
  "exams",
  "timetable",
  "flashcardDecks",
  "practiceTests",
  "studyGroups",
  "grades",
  "focusSessions",
  "notes",
];

export const mutations = {
  // ---- tasks (the S6 reference flows) --------------------------------------
  createTask: async (input: TaskInput): Promise<void> => {
    await apiSend("POST", PATHS.tasks, input);
    await fetchAndSet("tasks");
  },
  updateTask: async (id: string, patch: Partial<TaskInput>): Promise<void> => {
    await apiSend("PATCH", `${PATHS.tasks}/${id}`, patch);
    await fetchAndSet("tasks");
  },
  toggleTask: async (id: string): Promise<void> => {
    const task = useDataStore.getState().tasks.find((t) => t.id === id);
    if (!task) return;
    await apiSend("PATCH", `${PATHS.tasks}/${id}`, { completed: !task.completed });
    await fetchAndSet("tasks");
  },
  deleteTask: async (id: string): Promise<void> => {
    await apiSend("DELETE", `${PATHS.tasks}/${id}`);
    await fetchAndSet("tasks");
  },

  // ---- subjects -------------------------------------------------------------
  createSubject: async (input: SubjectInput): Promise<void> => {
    await apiSend("POST", PATHS.subjects, input);
    await fetchAndSet("subjects");
  },
  updateSubject: async (id: string, patch: Partial<SubjectInput>): Promise<void> => {
    await apiSend("PATCH", `${PATHS.subjects}/${id}`, patch);
    await fetchAndSet("subjects");
  },
  deleteSubject: async (id: string): Promise<void> => {
    await apiSend("DELETE", `${PATHS.subjects}/${id}`);
    await Promise.all(SUBJECT_TOUCHED.map((key) => fetchAndSet(key)));
  },

  // ---- task lists -----------------------------------------------------------
  createTaskList: async (input: TaskListInput): Promise<void> => {
    await apiSend("POST", PATHS.taskLists, input);
    await fetchAndSet("taskLists");
  },
  updateTaskList: async (id: string, patch: Partial<TaskListInput>): Promise<void> => {
    await apiSend("PATCH", `${PATHS.taskLists}/${id}`, patch);
    await fetchAndSet("taskLists");
  },
  deleteTaskList: async (id: string): Promise<void> => {
    await apiSend("DELETE", `${PATHS.taskLists}/${id}`);
    await Promise.all([fetchAndSet("taskLists"), fetchAndSet("tasks")]);
  },

  // ---- assignments ----------------------------------------------------------
  createAssignment: async (input: AssignmentInput): Promise<void> => {
    await apiSend("POST", PATHS.assignments, input);
    await fetchAndSet("assignments");
  },
  updateAssignment: async (id: string, patch: Partial<AssignmentInput>): Promise<void> => {
    await apiSend("PATCH", `${PATHS.assignments}/${id}`, patch);
    await fetchAndSet("assignments");
  },
  deleteAssignment: async (id: string): Promise<void> => {
    await apiSend("DELETE", `${PATHS.assignments}/${id}`);
    await fetchAndSet("assignments");
  },

  // ---- exams ------------------------------------------------------------------
  createExam: async (input: ExamInput): Promise<void> => {
    await apiSend("POST", PATHS.exams, input);
    await fetchAndSet("exams");
  },
  updateExam: async (id: string, patch: Partial<ExamInput>): Promise<void> => {
    await apiSend("PATCH", `${PATHS.exams}/${id}`, patch);
    await fetchAndSet("exams");
  },
  deleteExam: async (id: string): Promise<void> => {
    await apiSend("DELETE", `${PATHS.exams}/${id}`);
    await fetchAndSet("exams");
  },

  // ---- events -----------------------------------------------------------------
  createEvent: async (input: EventInput): Promise<void> => {
    await apiSend("POST", PATHS.events, input);
    await fetchAndSet("events");
  },
  updateEvent: async (id: string, patch: Partial<EventInput>): Promise<void> => {
    await apiSend("PATCH", `${PATHS.events}/${id}`, patch);
    await fetchAndSet("events");
  },
  deleteEvent: async (id: string): Promise<void> => {
    await apiSend("DELETE", `${PATHS.events}/${id}`);
    await fetchAndSet("events");
  },

  // ---- timetable --------------------------------------------------------------
  createTimetableClass: async (input: TimetableClassInput): Promise<void> => {
    await apiSend("POST", PATHS.timetable, input);
    await fetchAndSet("timetable");
  },
  updateTimetableClass: async (id: string, patch: Partial<TimetableClassInput>): Promise<void> => {
    await apiSend("PATCH", `${PATHS.timetable}/${id}`, patch);
    await fetchAndSet("timetable");
  },
  deleteTimetableClass: async (id: string): Promise<void> => {
    await apiSend("DELETE", `${PATHS.timetable}/${id}`);
    await fetchAndSet("timetable");
  },

  // ---- notebooks + notes --------------------------------------------------------
  createNotebook: async (input: NotebookInput): Promise<void> => {
    await apiSend("POST", PATHS.notebooks, input);
    await fetchAndSet("notebooks");
  },
  updateNotebook: async (id: string, patch: Partial<NotebookInput>): Promise<void> => {
    await apiSend("PATCH", `${PATHS.notebooks}/${id}`, patch);
    await fetchAndSet("notebooks");
  },
  deleteNotebook: async (id: string): Promise<void> => {
    await apiSend("DELETE", `${PATHS.notebooks}/${id}`);
    await Promise.all([fetchAndSet("notebooks"), fetchAndSet("notes")]);
  },

  createNote: async (input: NoteInput): Promise<void> => {
    await apiSend("POST", PATHS.notes, input);
    await fetchAndSet("notes");
  },
  updateNote: async (id: string, patch: Partial<NoteInput>): Promise<void> => {
    await apiSend("PATCH", `${PATHS.notes}/${id}`, patch);
    await fetchAndSet("notes");
  },
  deleteNote: async (id: string): Promise<void> => {
    await apiSend("DELETE", `${PATHS.notes}/${id}`);
    await fetchAndSet("notes");
  },

  // ---- flashcards (decks cascade their cards) ------------------------------------
  createFlashcardDeck: async (input: FlashcardDeckInput): Promise<void> => {
    await apiSend("POST", PATHS.flashcardDecks, input);
    await fetchAndSet("flashcardDecks");
  },
  updateFlashcardDeck: async (id: string, patch: Partial<FlashcardDeckInput>): Promise<void> => {
    await apiSend("PATCH", `${PATHS.flashcardDecks}/${id}`, patch);
    await fetchAndSet("flashcardDecks");
  },
  deleteFlashcardDeck: async (id: string): Promise<void> => {
    await apiSend("DELETE", `${PATHS.flashcardDecks}/${id}`);
    await Promise.all([fetchAndSet("flashcardDecks"), fetchAndSet("flashcards")]);
  },

  createFlashcard: async (deckId: string, input: Omit<FlashcardInput, "deckId">): Promise<void> => {
    await apiSend("POST", PATHS.flashcards, { ...input, deckId });
    await fetchAndSet("flashcards");
  },
  updateFlashcard: async (id: string, patch: Partial<FlashcardInput>): Promise<void> => {
    await apiSend("PATCH", `${PATHS.flashcards}/${id}`, patch);
    await fetchAndSet("flashcards");
  },
  deleteFlashcard: async (id: string): Promise<void> => {
    await apiSend("DELETE", `${PATHS.flashcards}/${id}`);
    await fetchAndSet("flashcards");
  },

  // ---- practice tests --------------------------------------------------------------
  createPracticeTest: async (input: PracticeTestInput): Promise<void> => {
    await apiSend("POST", PATHS.practiceTests, input);
    await fetchAndSet("practiceTests");
  },
  updatePracticeTest: async (id: string, patch: Partial<PracticeTestInput>): Promise<void> => {
    await apiSend("PATCH", `${PATHS.practiceTests}/${id}`, patch);
    await fetchAndSet("practiceTests");
  },
  deletePracticeTest: async (id: string): Promise<void> => {
    await apiSend("DELETE", `${PATHS.practiceTests}/${id}`);
    await fetchAndSet("practiceTests");
  },

  // ---- study groups ------------------------------------------------------------------
  createStudyGroup: async (input: StudyGroupInput): Promise<void> => {
    await apiSend("POST", PATHS.studyGroups, input);
    await fetchAndSet("studyGroups");
  },
  updateStudyGroup: async (id: string, patch: Partial<StudyGroupInput>): Promise<void> => {
    await apiSend("PATCH", `${PATHS.studyGroups}/${id}`, patch);
    await fetchAndSet("studyGroups");
  },
  deleteStudyGroup: async (id: string): Promise<void> => {
    await apiSend("DELETE", `${PATHS.studyGroups}/${id}`);
    await fetchAndSet("studyGroups");
  },

  // ---- grades -----------------------------------------------------------------------
  createGrade: async (input: GradeInput): Promise<void> => {
    await apiSend("POST", PATHS.grades, input);
    await fetchAndSet("grades");
  },
  updateGrade: async (id: string, patch: Partial<GradeInput>): Promise<void> => {
    await apiSend("PATCH", `${PATHS.grades}/${id}`, patch);
    await fetchAndSet("grades");
  },
  deleteGrade: async (id: string): Promise<void> => {
    await apiSend("DELETE", `${PATHS.grades}/${id}`);
    await fetchAndSet("grades");
  },

  // ---- focus sessions ------------------------------------------------------------------
  createFocusSession: async (input: FocusSessionInput): Promise<void> => {
    await apiSend("POST", PATHS.focusSessions, input);
    await fetchAndSet("focusSessions");
  },
  updateFocusSession: async (id: string, patch: Partial<FocusSessionInput>): Promise<void> => {
    await apiSend("PATCH", `${PATHS.focusSessions}/${id}`, patch);
    await fetchAndSet("focusSessions");
  },
  deleteFocusSession: async (id: string): Promise<void> => {
    await apiSend("DELETE", `${PATHS.focusSessions}/${id}`);
    await fetchAndSet("focusSessions");
  },

  // ---- holidays -----------------------------------------------------------------------
  createHoliday: async (input: HolidayInput): Promise<void> => {
    await apiSend("POST", PATHS.holidays, input);
    await fetchAndSet("holidays");
  },
  updateHoliday: async (id: string, patch: Partial<HolidayInput>): Promise<void> => {
    await apiSend("PATCH", `${PATHS.holidays}/${id}`, patch);
    await fetchAndSet("holidays");
  },
  deleteHoliday: async (id: string): Promise<void> => {
    await apiSend("DELETE", `${PATHS.holidays}/${id}`);
    await fetchAndSet("holidays");
  },

  // ---- calculator history ---------------------------------------------------------------
  createCalculatorEntry: async (input: CalculatorHistoryInput): Promise<void> => {
    await apiSend("POST", PATHS.calculatorHistory, input);
    await fetchAndSet("calculatorHistory");
  },
  deleteCalculatorEntry: async (id: string): Promise<void> => {
    await apiSend("DELETE", `${PATHS.calculatorHistory}/${id}`);
    await fetchAndSet("calculatorHistory");
  },

  // ---- AI chat history --------------------------------------------------------------------
  /** Refresh the persisted transcript after an /api/ai/chat round-trip. */
  refreshAiMessages: async (): Promise<void> => {
    await fetchAndSet("aiMessages");
  },
};
