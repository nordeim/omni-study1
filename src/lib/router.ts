// ---------------------------------------------------------------------------
// The single view ↔ path map (AGENTS.md: "src/lib/router.ts is the single
// view↔path map (unit-tested)"). The 20 PascalCase paths are rewritten onto
// `/` by next.config.ts; the SPA store syncs view state with the pathname.
// Pure — unit-pinned by tests/router.test.ts.
// ---------------------------------------------------------------------------

export type ViewId =
  | "dashboard"
  | "myday"
  | "tasks"
  | "calendar"
  | "events"
  | "timetable"
  | "assignments"
  | "exams"
  | "notes"
  | "flashcards"
  | "practicetests"
  | "studygroups"
  | "gradetracker"
  | "analytics"
  | "files"
  | "calculator"
  | "mathsolver"
  | "aiassistant"
  | "focustimer"
  | "settings";

export const VIEWS: ViewId[] = [
  "dashboard",
  "myday",
  "tasks",
  "calendar",
  "events",
  "timetable",
  "assignments",
  "exams",
  "notes",
  "flashcards",
  "practicetests",
  "studygroups",
  "gradetracker",
  "analytics",
  "files",
  "calculator",
  "mathsolver",
  "aiassistant",
  "focustimer",
  "settings",
];

export type NavItem = { id: ViewId; label: string; path: string };

/** All 20 reference views in sidebar order. */
export const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", path: "/Dashboard" },
  { id: "myday", label: "My Day", path: "/MyDay" },
  { id: "tasks", label: "Tasks", path: "/Tasks" },
  { id: "calendar", label: "Calendar", path: "/Calendar" },
  { id: "events", label: "Events", path: "/Events" },
  { id: "timetable", label: "Timetable", path: "/Timetable" },
  { id: "assignments", label: "Assignments", path: "/Assignments" },
  { id: "exams", label: "Exams", path: "/Exams" },
  { id: "notes", label: "Notes", path: "/Notes" },
  { id: "flashcards", label: "Flashcards", path: "/Flashcards" },
  { id: "practicetests", label: "Practice Tests", path: "/PracticeTests" },
  { id: "studygroups", label: "Study Groups", path: "/StudyGroups" },
  { id: "gradetracker", label: "Grade Tracker", path: "/GradeTracker" },
  { id: "analytics", label: "Analytics", path: "/Analytics" },
  { id: "files", label: "Files", path: "/Files" },
  { id: "calculator", label: "Calculator", path: "/Calculator" },
  { id: "mathsolver", label: "Math Solver", path: "/MathSolver" },
  { id: "aiassistant", label: "AI Assistant", path: "/AIAssistant" },
  { id: "focustimer", label: "Focus Timer", path: "/FocusTimer" },
  { id: "settings", label: "Settings", path: "/Settings" },
];

/** Canonical PascalCase path for a view (unknown ids fall back to /Dashboard). */
export function pathForView(view: ViewId): string {
  return NAV_ITEMS.find((item) => item.id === view)?.path ?? "/Dashboard";
}

/** Map a pathname to its view id — first segment wins, case-insensitive,
 *  trailing slashes tolerated; root/unknown → dashboard. */
export function viewFromPath(pathname: string): ViewId {
  const segment = pathname.split("/").filter(Boolean)[0]?.toLowerCase();
  if (!segment) return "dashboard";
  const hit = NAV_ITEMS.find((item) => item.path.toLowerCase() === `/${segment}`);
  return hit?.id ?? "dashboard";
}

/** Reference-probed greeting buckets (AGENTS.md): 0–11 morning,
 *  12–16 afternoon, 17–23 evening — "Good night" never renders. */
export function greetingForHour(hour: number): string {
  if (hour <= 11) return "Good morning";
  if (hour <= 16) return "Good afternoon";
  return "Good evening";
}

/** The greeting the reference renders: the CURRENT wall-clock hour's
 *  bucket. Call sites must hand this the live clock (`currentGreeting()`),
 *  never a day-anchored date — `startOfDay(new Date()).getHours()` is
 *  always 0, which froze the clone's greeting at "Good morning" around the
 *  clock (session-63 drift find; Family G pins it with a fake clock). */
export function currentGreeting(now: Date = new Date()): string {
  return greetingForHour(now.getHours());
}
