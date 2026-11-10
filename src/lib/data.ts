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

import { apiGet, apiSend, DEFAULT_GET_TIMEOUT_MS } from "./api";
import { normalizeMembers, type GroupMember } from "./group-members";
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
  // S76/AC5: the ref card's 📍 row — null when unset (the API schema
  // defaults "" but the Prisma column is nullable; the row type models both).
  location: string | null;
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
  description: string;
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
  tags: string; // JSON tag array
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
  // S171/DU2b: the reference's own field, ported bounded (validation.ts
  // caps it at 500). Default-empty at the column — legacy rows read "".
  description: string;
  color: string;
  subjectId: string | null;
  // The API boundary ships members as an ARRAY (entities.ts membersFromRow
  // — the column is a JSON string). S85/AL1: this type claimed `string` for
  // 84 sessions while the API shipped arrays — the lying type was the seam
  // the members defect hid behind.
  members: GroupMember[];
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

// S128/CC9: the RowOf helper left with its dead consumers (addRow/
// updateRow/removeRow — zero callers; see the store body).
type DataState = EntityMap & {
  loading: boolean;
  setSlice: <K extends CollectionKey>(key: K, rows: EntityMap[K]) => void;
  loadAll: () => Promise<void>;
  /** Fetch ONLY the given collections in parallel (the pre-warm path). */
  loadCollections: (keys: ReadonlyArray<CollectionKey>) => Promise<void>;
};

const ALL_KEYS = Object.keys(PATHS) as CollectionKey[];

// S119/BT8 — the per-key sequence guard. Every mutation does apiSend(...)
// then fetchAndSet(key), and nothing serialized them: two in-flight GETs for
// one collection (the live trigger — the Notes title input PATCHes on every
// keystroke, each followed by a notes GET) could resolve OUT OF ORDER and the
// stale response would clobber the fresher slice. A monotonic counter per
// key: capture the ticket before the GET, setSlice only when still the
// latest — a late stale resolution is dropped on the floor.
const fetchSeq: Partial<Record<CollectionKey, number>> = {};

// S129/CD2 — the collection GET deadline. CC7 gave the boot gate's
// /api/auth/me a 20 s timeout, but the gate ALSO awaits the pre-warm, and
// fetchAndSet called apiGet with NO deadline: a stalled connection (accepted
// TCP, no response — no offline event fires) never settled, the prewarm's
// .catch(() => {}) never fired (a non-rejection), and the Splash pulsed
// forever with the retry affordance unreachable (it renders only in the
// gate's error branch). Every collection GET now carries this deadline —
// the pre-warm, loadAll, the view refreshes, and the post-mutation
// refreshes all become bounded (a stall rejects through the existing catch
// paths; the e2e pin holds the boot gate's stall release end-to-end).
// Exported like IMPORT_MAX_BYTES (the BY3 panel-pre-check precedent): the
// seam's consumers and pins read the SAME constant, never a copy.
// S133/CH10: DERIVED from api.ts's DEFAULT_GET_TIMEOUT_MS (the lower layer
// — this module already imports api.ts, so no cycle). The pre-CH10 comment
// claimed "the SAME constant, never a copy" while the value lived as three
// literals in three files; the claim is now true.
export const COLLECTION_GET_TIMEOUT_MS = DEFAULT_GET_TIMEOUT_MS;

async function fetchAndSet<K extends CollectionKey>(key: K): Promise<void> {
  const ticket = (fetchSeq[key] ?? 0) + 1;
  fetchSeq[key] = ticket;
  const rows = await apiGet<EntityMap[K]>(PATHS[key], {
    timeoutMs: COLLECTION_GET_TIMEOUT_MS,
  });
  if (fetchSeq[key] !== ticket) return; // a newer GET superseded this one
  useDataStore.getState().setSlice(key, rows);
}

// S128/CC11 — the in-flight COUNTS behind the `loading` boolean. The
// pre-CC11 store flipped ONE shared boolean in every loadAll/loadCollections
// finally, so the FIRST finisher of two overlapping loads cleared it while
// the second fetch was still in flight (masked today — the view-side
// loadCollections callers don't read s.loading — but 8 views branch
// skeleton-vs-empty on that boolean). A count per key handles BOTH overlap
// shapes: different keys (the masked cross-key race) and the same key
// (two loadCollections(["tasks"]) — the second add increments to 2 and the
// first finisher's decrement lands at 1, still loading).
const loadingCounts = new Map<CollectionKey, number>();

function trackLoadStart(keys: ReadonlyArray<CollectionKey>): void {
  for (const key of keys) loadingCounts.set(key, (loadingCounts.get(key) ?? 0) + 1);
  setLoadingDerived();
}

function trackLoadSettle(key: CollectionKey): void {
  const n = (loadingCounts.get(key) ?? 1) - 1;
  if (n <= 0) loadingCounts.delete(key);
  else loadingCounts.set(key, n);
  setLoadingDerived();
}

function setLoadingDerived(): void {
  useDataStore.setState({ loading: loadingCounts.size > 0 });
}

export const useDataStore = create<DataState>((set) => ({
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

  // S128/CC9: the addRow/updateRow/removeRow trio REMOVED — zero callers
  // since the refresh-after-write pattern landed (every mutation goes
  // apiSend → fetchAndSet), and they bypassed the fetchSeq stale-guard: a
  // future caller doing optimistic updateRow + refresh would reintroduce
  // the S119 ordering hazard through the back door.

  loadAll: async () => {
    trackLoadStart(ALL_KEYS);
    // Each fetch's own finally owns its decrement — a rejected fetchAndSet
    // still decrements (no count ever leaks), and overlapping loads never
    // clear the flag while a sibling fetch is still in flight.
    await Promise.all(
      ALL_KEYS.map((key) => fetchAndSet(key).finally(() => trackLoadSettle(key))),
    );
  },

  loadCollections: async (keys) => {
    trackLoadStart(keys);
    await Promise.all(
      keys.map((key) => fetchAndSet(key).finally(() => trackLoadSettle(key))),
    );
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

// S127/CB16: the per-task in-flight toggle chains (see toggleTask).
const taskToggleChains = new Map<string, Promise<void>>();

// S149/CX2 (audit B-M2): the per-group in-flight members chains (the
// taskToggleChains idiom on the members field — see setStudyGroupMembers).
const groupMemberChains = new Map<string, Promise<void>>();

// S151/CZ1 (audit B-M1): the per-note in-flight tags chains (the same
// idiom on the notes tags field — see setNoteTags).
const noteTagsChains = new Map<string, Promise<void>>();

/** The NoteRow.tags JSON contract → a string list (safe parse) — the
 *  single source for the view rows AND the tags chain (moved from
 *  notes-view.tsx at S151/CZ1 so the chain's updater receives the same
 *  parsed base the view renders). */
export function parseNoteTags(raw: string): string[] {
  try {
    const parsed: unknown = JSON.parse(raw || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((t): t is string => typeof t === "string" && t.length > 0);
  } catch {
    return [];
  }
}

/** The ExamRow.topics JSON contract → a string list (safe parse) — the
 *  single source for the edit dialog AND the card render (moved from
 *  exams-view.tsx at S163/DL3 where the twin lived byte-identical twice
 *  — the parseNoteTags/CZ1 precedent). The twins' semantics preserved
 *  VERBATIM: every string passes (no length guard — parseNoteTags'
 *  t.length > 0 is the NOTES twins' semantics, deliberately different);
 *  the raw || "[]" guard is behavior-identical to the twins' catch path
 *  (JSON.parse("") throws → []). Pinned by tests/data-store.test.ts. */
export function parseExamTopics(raw: string): string[] {
  try {
    const parsed: unknown = JSON.parse(raw || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((t): t is string => typeof t === "string");
  } catch {
    return [];
  }
}

export const mutations = {
  // ---- tasks (the S6 reference flows) (S168/DR1: the CB8 --------------
  // failure-domain split) — the write and the post-write refresh are
  // SEPARATE failure domains (the S127/CB8 doctrine, the DK1 events +
  // DL1 exams + DM1 assignments + DN1 timetable + DP1 notes + DQ1
  // flashcards ports — the recorded family-wide port, this the seventh
  // family): a refresh GET that fails after a COMMITTED write must not
  // reject the mutation — the caller's catch would claim a save failure
  // on a saved row (the TaskDialog submit catch's "Could not save the
  // task." toast with the dialog still open and the form armed — the
  // retry that DUPLICATES the task; the row-action catches' false
  // "Could not update/delete the task." toasts after the toggle or the
  // delete already committed) and arm the duplicate-creating retry. The
  // three chained toggles carry the refresh INSIDE their closures —
  // each gains its own contained catch, so a flaky refresh neither
  // rejects `await chained` nor poisons the chain. The refresh
  // rejection is contained here; the stale slice self-heals on the next
  // successful load (the S16 view-switch pre-warm + the next mutation's
  // own refresh — the DJ5 doctrine: the write's own success surfacing
  // is the toast/dialog-close; a second toast for the same offline
  // window is noise). The WRITE legs keep rejecting honestly. Pinned by
  // tests/data-store.test.ts (the DR1 pair set).
  createTask: async (input: TaskInput): Promise<void> => {
    await apiSend("POST", PATHS.tasks, input);
    await fetchAndSet("tasks").catch(() => undefined);
  },
  updateTask: async (id: string, patch: Partial<TaskInput>): Promise<void> => {
    await apiSend("PATCH", `${PATHS.tasks}/${id}`, patch);
    await fetchAndSet("tasks").catch(() => undefined);
  },
  // S127/CB16: the per-id chain — two rapid toggles before the first
  // refetch landed both read the SAME stale base and both PATCHed the same
  // value (the second toggle was silently lost; the BX10 stale-base class
  // closed at the store). Each toggle re-reads the store AFTER the
  // previous one for the SAME id settles. The chain entry itself never
  // rejects (a failed toggle must not poison the chain); the CALLER
  // still gets the real rejection.
  toggleTask: async (id: string): Promise<void> => {
    const chained = (taskToggleChains.get(id) ?? Promise.resolve()).then(async () => {
      const task = useDataStore.getState().tasks.find((t) => t.id === id);
      if (!task) return;
      await apiSend("PATCH", `${PATHS.tasks}/${id}`, { completed: !task.completed });
      await fetchAndSet("tasks").catch(() => undefined);
    });
    // S128/CC5: evict on settle when still latest — a deleted task's settled
    // chain otherwise lives in the module map for the whole page session
    // (hygiene; the settled-promise entry is tiny but never reclaimed).
    const stored = chained.catch(() => undefined);
    taskToggleChains.set(id, stored);
    stored.finally(() => {
      if (taskToggleChains.get(id) === stored) taskToggleChains.delete(id);
    });
    await chained;
  },
  // S149/CX1 (audit B-M1): the sibling toggles join the same chain — the
  // S127/CB16 fix chained ONE toggle (`completed`); the myDay/important row
  // toggles PATCHed from the RENDER-SNAPSHOT task (the views passed
  // `{ myDay: !task.myDay }` off the row prop), so two rapid clicks inside
  // the PATCH+refetch window both read the same stale base and sent the
  // SAME value — the second toggle silently lost (the exact BX10 class one
  // generation behind). Same map, same shape: cross-field PATCHes are
  // field-scoped so cross-field serialization is unnecessary but harmless,
  // and ONE shared map keeps the CC5 eviction single.
  toggleTaskMyDay: async (id: string): Promise<void> => {
    const chained = (taskToggleChains.get(id) ?? Promise.resolve()).then(async () => {
      const task = useDataStore.getState().tasks.find((t) => t.id === id);
      if (!task) return;
      await apiSend("PATCH", `${PATHS.tasks}/${id}`, { myDay: !task.myDay });
      await fetchAndSet("tasks").catch(() => undefined);
    });
    const stored = chained.catch(() => undefined);
    taskToggleChains.set(id, stored);
    stored.finally(() => {
      if (taskToggleChains.get(id) === stored) taskToggleChains.delete(id);
    });
    await chained;
  },
  // S149/CX1: the important twin (see toggleTaskMyDay).
  toggleTaskImportant: async (id: string): Promise<void> => {
    const chained = (taskToggleChains.get(id) ?? Promise.resolve()).then(async () => {
      const task = useDataStore.getState().tasks.find((t) => t.id === id);
      if (!task) return;
      await apiSend("PATCH", `${PATHS.tasks}/${id}`, { important: !task.important });
      await fetchAndSet("tasks").catch(() => undefined);
    });
    const stored = chained.catch(() => undefined);
    taskToggleChains.set(id, stored);
    stored.finally(() => {
      if (taskToggleChains.get(id) === stored) taskToggleChains.delete(id);
    });
    await chained;
  },
  deleteTask: async (id: string): Promise<void> => {
    await apiSend("DELETE", `${PATHS.tasks}/${id}`);
    await fetchAndSet("tasks").catch(() => undefined);
  },

  // ---- subjects (S169/DS1: the CB8 failure-domain split) --------------
  // The write and the post-write refresh are SEPARATE failure domains
  // (the S127/CB8 doctrine, the DK1 events + DL1 exams + DM1 assignments
  // + DN1 timetable + DP1 notes + DQ1 flashcards + DR1 tasks ports —
  // the recorded family-wide port, this the EIGHTH family, the first of
  // the eight remaining seams the S168 close's ledger names): a refresh
  // GET that fails after a COMMITTED write must not reject the mutation
  // — the caller's catch would claim a save failure on a saved row (the
  // SubjectDialog submit catch's "Could not save the subject." toast
  // with the dialog still open and the form armed — the retry that
  // DUPLICATES the subject; the AlertDialogAction delete catch's false
  // "Could not delete the subject." toast after the delete already
  // committed, on a row the SetNull children already released).
  // deleteSubject's refresh is the ELEVEN-collection Promise.all over
  // SUBJECT_TOUCHED (the SetNull FK reconciliation set — the widest
  // refresh blast radius in the codebase): the ONE contained catch rides
  // the whole Promise.all — the multi-collection refresh is one failure
  // domain, and any single failed GET among the eleven must not reject
  // the committed delete. The refresh rejection is contained here; the
  // stale slices self-heal on the next successful load (the S16
  // view-switch pre-warm + the next mutation's own refresh — the DJ5
  // doctrine: the write's own success surfacing is the toast/dialog-
  // close; a second toast for the same offline window is noise). The
  // WRITE legs keep rejecting honestly. Pinned by tests/data-store.test.ts
  // (the DS1 pair set).
  createSubject: async (input: SubjectInput): Promise<void> => {
    await apiSend("POST", PATHS.subjects, input);
    await fetchAndSet("subjects").catch(() => undefined);
  },
  updateSubject: async (id: string, patch: Partial<SubjectInput>): Promise<void> => {
    await apiSend("PATCH", `${PATHS.subjects}/${id}`, patch);
    await fetchAndSet("subjects").catch(() => undefined);
  },
  deleteSubject: async (id: string): Promise<void> => {
    await apiSend("DELETE", `${PATHS.subjects}/${id}`);
    await Promise.all(SUBJECT_TOUCHED.map((key) => fetchAndSet(key))).catch(() => undefined);
  },

  // ---- task lists (S170/DT1: the CB8 failure-domain split) ------------------
  // The write and the post-write refresh are SEPARATE failure domains
  // (the S127/CB8 doctrine, the DK1 events + DL1 exams + DM1 assignments
  // + DN1 timetable + DP1 notes + DQ1 flashcards + DR1 tasks + DS1
  // subjects ports — the recorded family-wide port, this the NINTH
  // family, the second of the eight remaining seams the S168 close's
  // ledger names): a refresh GET that fails after a COMMITTED write must
  // not reject the mutation — the caller's catch would claim a save
  // failure on a saved row, arming the duplicate-creating retry on the
  // create leg and the false delete-failure claim on a row the server
  // deleted. deleteTaskList's refresh is the TWO-collection Promise.all
  // ([taskLists, tasks] — the Task.listId SetNull reconciliation set):
  // the ONE contained catch rides the whole Promise.all — the
  // multi-collection refresh is one failure domain (the S169/DS1
  // lesson), and either failed GET must not reject the committed
  // delete. The family has NO view consumer today (the tasks-view aside
  // is read-only navigation; the TaskDialog carries no list picker —
  // the reference's own shape), so the pinned surface is the mutation
  // CONTRACT itself. The refresh rejection is contained here; the stale
  // slices self-heal on the next successful load (the S16 view-switch
  // pre-warm + the next mutation's own refresh — the DJ5 doctrine).
  // The WRITE legs keep rejecting honestly. Pinned by
  // tests/data-store.test.ts (the DT1 pair set).
  createTaskList: async (input: TaskListInput): Promise<void> => {
    await apiSend("POST", PATHS.taskLists, input);
    await fetchAndSet("taskLists").catch(() => undefined);
  },
  updateTaskList: async (id: string, patch: Partial<TaskListInput>): Promise<void> => {
    await apiSend("PATCH", `${PATHS.taskLists}/${id}`, patch);
    await fetchAndSet("taskLists").catch(() => undefined);
  },
  deleteTaskList: async (id: string): Promise<void> => {
    await apiSend("DELETE", `${PATHS.taskLists}/${id}`);
    await Promise.all([fetchAndSet("taskLists"), fetchAndSet("tasks")]).catch(() => undefined);
  },

  // ---- assignments (S164/DM1: the CB8 failure-domain split) ------------------
  // The write and the post-write refresh are SEPARATE failure domains (the
  // S127/CB8 doctrine, the DK1 events + DL1 exams ports — the recorded
  // family-wide port, this the third family): a refresh GET that fails
  // after a COMMITTED write must not reject the mutation — the caller's
  // catch would claim a save failure on a saved row ("Something went
  // wrong." in the still-open dialog, no success toast) and arm the retry
  // that DUPLICATES the assignment. The slider's onValueCommit leg routes
  // through the same updateAssignment — a flaky refresh after a COMMITTED
  // progress drag fired the error toast on a SAVED row. The refresh
  // rejection is contained here; the stale slice self-heals on the next
  // successful load (the S16 view-switch pre-warm + the next mutation's
  // own refresh — the DJ5 doctrine: the write's own success toast is the
  // surfacing; a second toast for the same offline window is noise). The
  // WRITE leg keeps rejecting honestly — the view's dialog catch still
  // sees real save failures. Pinned by tests/data-store.test.ts (the
  // DM1 pair set).
  createAssignment: async (input: AssignmentInput): Promise<void> => {
    await apiSend("POST", PATHS.assignments, input);
    await fetchAndSet("assignments").catch(() => undefined);
  },
  updateAssignment: async (id: string, patch: Partial<AssignmentInput>): Promise<void> => {
    await apiSend("PATCH", `${PATHS.assignments}/${id}`, patch);
    await fetchAndSet("assignments").catch(() => undefined);
  },
  deleteAssignment: async (id: string): Promise<void> => {
    await apiSend("DELETE", `${PATHS.assignments}/${id}`);
    await fetchAndSet("assignments").catch(() => undefined);
  },

  // ---- exams (S163/DL1: the CB8 failure-domain split) ------------------------
  // The write and the post-write refresh are SEPARATE failure domains (the
  // S127/CB8 doctrine, the DK1 events port — the first family of the
  // recorded family-wide port): a refresh GET that fails after a COMMITTED
  // write must not reject the mutation — the caller's catch would claim a
  // save failure on a saved row ("Something went wrong." in the still-open
  // dialog, no success toast) and arm the retry that DUPLICATES the exam.
  // The refresh rejection is contained here; the stale slice self-heals on
  // the next successful load (the S16 view-switch pre-warm + the next
  // mutation's own refresh — the DJ5 doctrine: the write's own success
  // toast is the surfacing; a second toast for the same offline window is
  // noise). The WRITE leg keeps rejecting honestly — the view's dialog
  // catch still sees real save failures. Pinned by tests/data-store.test.ts
  // (the DL1 pair set).
  createExam: async (input: ExamInput): Promise<void> => {
    await apiSend("POST", PATHS.exams, input);
    await fetchAndSet("exams").catch(() => undefined);
  },
  updateExam: async (id: string, patch: Partial<ExamInput>): Promise<void> => {
    await apiSend("PATCH", `${PATHS.exams}/${id}`, patch);
    await fetchAndSet("exams").catch(() => undefined);
  },
  deleteExam: async (id: string): Promise<void> => {
    await apiSend("DELETE", `${PATHS.exams}/${id}`);
    await fetchAndSet("exams").catch(() => undefined);
  },

  // ---- events (S162/DK1: the CB8 failure-domain split) ----------------------
  // The write and the post-write refresh are SEPARATE failure domains (the
  // S127/CB8 doctrine, ported to the CRUD mutation seam): a refresh GET
  // that fails after a COMMITTED write must not reject the mutation — the
  // caller's catch would claim a save failure on a saved row ("Something
  // went wrong." in the still-open dialog, no success toast) and arm the
  // retry that DUPLICATES the event. The refresh rejection is contained
  // here; the stale slice self-heals on the next successful load (the S16
  // view-switch pre-warm + the next mutation's own refresh — the DJ5
  // doctrine: the write's own success toast is the surfacing; a second
  // toast for the same offline window is noise). The WRITE leg keeps
  // rejecting honestly — the view's dialog catch still sees real save
  // failures. Pinned by tests/data-store.test.ts (the DK1 pair set).
  createEvent: async (input: EventInput): Promise<void> => {
    await apiSend("POST", PATHS.events, input);
    await fetchAndSet("events").catch(() => undefined);
  },
  updateEvent: async (id: string, patch: Partial<EventInput>): Promise<void> => {
    await apiSend("PATCH", `${PATHS.events}/${id}`, patch);
    await fetchAndSet("events").catch(() => undefined);
  },
  deleteEvent: async (id: string): Promise<void> => {
    await apiSend("DELETE", `${PATHS.events}/${id}`);
    await fetchAndSet("events").catch(() => undefined);
  },

  // ---- timetable (S165/DN1: the CB8 failure-domain split) -------------------
  // The write and the post-write refresh are SEPARATE failure domains (the
  // S127/CB8 doctrine, the DK1 events + DL1 exams + DM1 assignments ports —
  // the recorded family-wide port, this the fourth family): a refresh GET
  // that fails after a COMMITTED write must not reject the mutation — the
  // caller's catch would claim a save failure on a saved row ("Something
  // went wrong." in the still-open dialog, no success toast) and arm the
  // retry that DUPLICATES the class. The refresh rejection is contained
  // here; the stale slice self-heals on the next successful load (the S16
  // view-switch pre-warm + the next mutation's own refresh — the DJ5
  // doctrine: the write's own success toast is the surfacing; a second
  // toast for the same offline window is noise). The WRITE leg keeps
  // rejecting honestly — the view's dialog catch still sees real save
  // failures. Pinned by tests/data-store.test.ts (the DN1 pair set).
  createTimetableClass: async (input: TimetableClassInput): Promise<void> => {
    await apiSend("POST", PATHS.timetable, input);
    await fetchAndSet("timetable").catch(() => undefined);
  },
  updateTimetableClass: async (id: string, patch: Partial<TimetableClassInput>): Promise<void> => {
    await apiSend("PATCH", `${PATHS.timetable}/${id}`, patch);
    await fetchAndSet("timetable").catch(() => undefined);
  },
  deleteTimetableClass: async (id: string): Promise<void> => {
    await apiSend("DELETE", `${PATHS.timetable}/${id}`);
    await fetchAndSet("timetable").catch(() => undefined);
  },

  // ---- notebooks + notes (S166/DP1: the CB8 failure-domain split) -----------
  // The write and the post-write refresh are SEPARATE failure domains (the
  // S127/CB8 doctrine, the DK1 events + DL1 exams + DM1 assignments + DN1
  // timetable ports — the recorded family-wide port, this the fifth
  // family): a refresh GET that fails after a COMMITTED write must not
  // reject the mutation — the caller's catch would claim a save failure on
  // a saved row (the submit catch's "Something went wrong." in the
  // still-open dialog with the form armed — the retry that DUPLICATES the
  // note/notebook; the autosave/tag/delete surfaces' false failure claims)
  // and arm the duplicate-creating retry. The refresh rejection is
  // contained here (the deleteNotebook double refresh catches BOTH legs;
  // the setNoteTags chain's refresh is caught while its `await chained`
  // still surfaces the WRITE leg's rejection to the caller — the honest
  // save-failure contract the view's catches depend on); the stale slice
  // self-heals on the next successful load (the S16 view-switch pre-warm
  // + the next mutation's own refresh — the DJ5 doctrine: the write's own
  // success surfacing is the toast/dialog-close; a second toast for the
  // same offline window is noise). The WRITE legs keep rejecting
  // honestly. Pinned by tests/data-store.test.ts (the DP1 pair set).
  createNotebook: async (input: NotebookInput): Promise<void> => {
    await apiSend("POST", PATHS.notebooks, input);
    await fetchAndSet("notebooks").catch(() => undefined);
  },
  updateNotebook: async (id: string, patch: Partial<NotebookInput>): Promise<void> => {
    await apiSend("PATCH", `${PATHS.notebooks}/${id}`, patch);
    await fetchAndSet("notebooks").catch(() => undefined);
  },
  deleteNotebook: async (id: string): Promise<void> => {
    await apiSend("DELETE", `${PATHS.notebooks}/${id}`);
    await Promise.all([
      fetchAndSet("notebooks").catch(() => undefined),
      fetchAndSet("notes").catch(() => undefined),
    ]);
  },

  // Returns the created row's id — the notes view auto-selects the new note
  // (S78/AE8: the create flow's setSelectedId(created) intent previously
  // received void here, so a freshly created note was never selected).
  createNote: async (input: NoteInput): Promise<string | null> => {
    const row = await apiSend<NoteRow>("POST", PATHS.notes, input);
    await fetchAndSet("notes").catch(() => undefined);
    return row?.id ?? null;
  },
  updateNote: async (id: string, patch: Partial<NoteInput>): Promise<void> => {
    await apiSend("PATCH", `${PATHS.notes}/${id}`, patch);
    await fetchAndSet("notes").catch(() => undefined);
  },
  // S151/CZ1 (audit B-M1): the per-note tags chain — the CX2 updater form
  // on the notes tags field (the members fix, one field over: the view's
  // addTag/removeTag PATCHed ABSOLUTE JSON arrays computed from the
  // RENDER-SNAPSHOT selected note, so a tag add followed by a tag remove
  // inside one PATCH+refetch window computed the remove from the PRE-ADD
  // base and silently dropped the add while both PATCHes succeeded — tag
  // adds carry no success toast, so the loss was fully silent). The
  // UPDATER form is the load-bearing choice (the CX2 doctrine): the caller
  // declares the effect (add/remove), the chain supplies the fresh
  // POST-SETTLE base. The chain entry never rejects (a failed PATCH must
  // not poison the chain); the CALLER still gets the real rejection.
  // Field-scoped like its siblings: the autosave title/content PATCHes are
  // different fields and need no serialization (the CX1 cross-field note).
  setNoteTags: async (
    noteId: string,
    update: (tags: string[]) => string[],
  ): Promise<void> => {
    const chained = (noteTagsChains.get(noteId) ?? Promise.resolve()).then(async () => {
      const note = useDataStore.getState().notes.find((n) => n.id === noteId);
      if (!note) return;
      const tags = update(parseNoteTags(note.tags));
      await apiSend("PATCH", `${PATHS.notes}/${noteId}`, { tags: JSON.stringify(tags) });
      // S166/DP1: the refresh leg is a separate failure domain — a
      // committed tags PATCH + a flaky GET must not surface "Tag not
      // saved" to the caller (the `await chained` below resolves; the
      // WRITE leg above still rejects through it honestly).
      await fetchAndSet("notes").catch(() => undefined);
    });
    const stored = chained.catch(() => undefined);
    noteTagsChains.set(noteId, stored);
    stored.finally(() => {
      if (noteTagsChains.get(noteId) === stored) noteTagsChains.delete(noteId);
    });
    await chained;
  },
  deleteNote: async (id: string): Promise<void> => {
    await apiSend("DELETE", `${PATHS.notes}/${id}`);
    await fetchAndSet("notes").catch(() => undefined);
  },

  // ---- flashcards (decks cascade their cards) (S167/DQ1: the CB8 --------
  // failure-domain split) — the write and the post-write refresh are
  // SEPARATE failure domains (the S127/CB8 doctrine, the DK1 events +
  // DL1 exams + DM1 assignments + DN1 timetable + DP1 notes ports — the
  // recorded family-wide port, this the sixth family): a refresh GET
  // that fails after a COMMITTED write must not reject the mutation —
  // the caller's catch would claim a save failure on a saved row (the
  // deck/card submit catches' "Something went wrong." in the
  // still-open dialog with the form armed — the retry that DUPLICATES
  // the deck/card; the delete catches' false "Delete failed." toast
  // after the delete — or the whole cascade — already committed) and
  // arm the duplicate-creating retry. The refresh rejection is
  // contained here (the deleteFlashcardDeck double refresh catches BOTH
  // legs); the stale slice self-heals on the next successful load (the
  // S16 view-switch pre-warm + the next mutation's own refresh — the
  // DJ5 doctrine: the write's own success surfacing is the
  // toast/dialog-close; a second toast for the same offline window is
  // noise). The WRITE legs keep rejecting honestly. Pinned by
  // tests/data-store.test.ts (the DQ1 pair set).
  createFlashcardDeck: async (input: FlashcardDeckInput): Promise<void> => {
    await apiSend("POST", PATHS.flashcardDecks, input);
    await fetchAndSet("flashcardDecks").catch(() => undefined);
  },
  updateFlashcardDeck: async (id: string, patch: Partial<FlashcardDeckInput>): Promise<void> => {
    await apiSend("PATCH", `${PATHS.flashcardDecks}/${id}`, patch);
    await fetchAndSet("flashcardDecks").catch(() => undefined);
  },
  deleteFlashcardDeck: async (id: string): Promise<void> => {
    await apiSend("DELETE", `${PATHS.flashcardDecks}/${id}`);
    await Promise.all([
      fetchAndSet("flashcardDecks").catch(() => undefined),
      fetchAndSet("flashcards").catch(() => undefined),
    ]);
  },

  createFlashcard: async (deckId: string, input: Omit<FlashcardInput, "deckId">): Promise<void> => {
    await apiSend("POST", PATHS.flashcards, { ...input, deckId });
    await fetchAndSet("flashcards").catch(() => undefined);
  },
  updateFlashcard: async (id: string, patch: Partial<FlashcardInput>): Promise<void> => {
    await apiSend("PATCH", `${PATHS.flashcards}/${id}`, patch);
    await fetchAndSet("flashcards").catch(() => undefined);
  },
  deleteFlashcard: async (id: string): Promise<void> => {
    await apiSend("DELETE", `${PATHS.flashcards}/${id}`);
    await fetchAndSet("flashcards").catch(() => undefined);
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

  // ---- study groups (S171/DU1: the CB8 failure-domain split) ------------------
  // The write and the post-write refresh are SEPARATE failure domains
  // (the S127/CB8 doctrine, the DK1 events + DL1 exams + DM1 assignments
  // + DN1 timetable + DP1 notes + DQ1 flashcards + DR1 tasks + DS1
  // subjects + DT1 task lists ports — the recorded family-wide port,
  // this the TENTH family, the third of the eight remaining seams once
  // the S170 close's stale "deck" ledger entry is corrected: the deck
  // family has carried the DQ1 catches + pair set since S167, verified
  // at the source in the s171 audit): a refresh GET that fails after a
  // COMMITTED write must not reject the mutation — the caller's catch
  // would claim a save failure on a saved row (the StudyGroupDialog
  // submit catch's "Could not save the study group." toast with the
  // dialog still open and the form armed — the retry that DUPLICATES
  // the group; the AlertDialogAction delete catch's false "Could not
  // delete the study group." toast after the delete already committed).
  // setStudyGroupMembers' chain entry rides the same contained catch on
  // its OWN refresh — the rejection must not propagate through `chained`
  // to the caller's `await chained` either (the addMember/removeMember
  // catches' false "Could not add/remove the member." toasts on members
  // the server committed); the chain entry's WRITE leg keeps rejecting
  // honestly to the caller. The refresh rejection is contained here; the
  // stale slices self-heal on the next successful load (the S16
  // view-switch pre-warm + the next mutation's own refresh — the DJ5
  // doctrine: the write's own success surfacing is the toast/dialog-
  // close; a second toast for the same offline window is noise). The
  // WRITE legs keep rejecting honestly. Pinned by
  // tests/data-store.test.ts (the DU1 pair set) + the DU1 e2e leg in
  // tests/e2e/resilience.spec.ts (the create-through-failed-refresh
  // journey — this family's mutations ALL have live view consumers,
  // unlike the S170 taskLists axis).
  createStudyGroup: async (input: StudyGroupInput): Promise<void> => {
    await apiSend("POST", PATHS.studyGroups, input);
    await fetchAndSet("studyGroups").catch(() => undefined);
  },
  updateStudyGroup: async (id: string, patch: Partial<StudyGroupInput>): Promise<void> => {
    await apiSend("PATCH", `${PATHS.studyGroups}/${id}`, patch);
    await fetchAndSet("studyGroups").catch(() => undefined);
  },
  // S149/CX2 (audit B-M2): the per-group members chain — the S123/BX10 fix
  // moved the members base from the render snapshot to a CALL-TIME store
  // read, but a call-time read still loses ops to in-flight interleaving:
  // a remove during an add's PATCH+refetch window (or two rapid removes)
  // computed its absolute members array from the not-yet-refreshed store
  // and silently dropped the first op while both fired success toasts. The
  // chain (the toggleTask precedent) is what makes it correct: each link
  // computes from the POST-SETTLE base. The UPDATER form (not a value) is
  // the load-bearing choice — the caller declares the effect, the chain
  // supplies the fresh base. The chain entry never rejects (a failed PATCH
  // must not poison the chain); the CALLER still gets the real rejection.
  setStudyGroupMembers: async (
    groupId: string,
    update: (members: GroupMember[]) => GroupMember[],
  ): Promise<void> => {
    const chained = (groupMemberChains.get(groupId) ?? Promise.resolve()).then(async () => {
      const group = useDataStore.getState().studyGroups.find((g) => g.id === groupId);
      if (!group) return;
      // The S85/AL1 members seam: either boundary shape normalizes to the
      // array the PATCH must carry (membersFromRow already normalized the
      // API boundary; this tolerates any legacy/row shape).
      const members = update(normalizeMembers(group.members));
      await apiSend("PATCH", `${PATHS.studyGroups}/${groupId}`, { members });
      // S171/DU1: the chain entry's refresh leg — contained (the
      // committed-PATCH + flaky-refresh call must resolve to the caller;
      // the failed PATCH above still rejects through `chained`).
      await fetchAndSet("studyGroups").catch(() => undefined);
    });
    const stored = chained.catch(() => undefined);
    groupMemberChains.set(groupId, stored);
    stored.finally(() => {
      if (groupMemberChains.get(groupId) === stored) groupMemberChains.delete(groupId);
    });
    await chained;
  },
  deleteStudyGroup: async (id: string): Promise<void> => {
    await apiSend("DELETE", `${PATHS.studyGroups}/${id}`);
    await fetchAndSet("studyGroups").catch(() => undefined);
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

  // ---- AI chat history --------------------------------------------------------------------
  /** Refresh the persisted transcript after an /api/ai/chat round-trip. */
  refreshAiMessages: async (): Promise<void> => {
    await fetchAndSet("aiMessages");
  },
};
