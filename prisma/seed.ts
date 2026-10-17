// ---------------------------------------------------------------------------
// StudyFlow seed — idempotent demo data.
//
// Contract (AGENTS.md / omni-study_SKILL.md §7): early-returns when the demo
// user already exists. Changing seed VALUES requires deleting the target db
// (db/custom.db or db/e2e.db) first — the upsert will not refresh them.
// Run via `bun run db:seed` (the script sets DATABASE_URL inline, schema-
// anchored; this file resolves the same env var through src/lib/db.ts).
// ---------------------------------------------------------------------------
import { hashPassword } from "../src/lib/auth";
import { db } from "../src/lib/db";

const DEMO_EMAIL = "demo@studyflow.app";
const DEMO_PASSWORD = "Demo1234!";

function at(dayOffset: number, hour = 9, minute = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d;
}

async function main(): Promise<void> {
  const existing = await db.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (existing) {
    console.log(`Seed: demo user already exists (${DEMO_EMAIL}) — nothing to do.`);
    return;
  }

  const user = await db.user.create({
    data: {
      email: DEMO_EMAIL,
      passwordHash: hashPassword(DEMO_PASSWORD),
      fullName: "Demo Student",
      themeMode: "light",
      accentColor: "violet",
      avatarEmoji: "", // reference default state — initial-letter avatar
      emailVerified: true,
      schoolName: "Lincoln High",
      gradeLevel: "9th Grade",
      studyGoalHours: 4,
    },
  });

  const subjects = await Promise.all(
    [
      { name: "Mathematics", color: "#8b5cf6" },
      { name: "Physics", color: "#3b82f6" },
      { name: "Chemistry", color: "#10b981" },
      { name: "History", color: "#f59e0b" },
      { name: "English", color: "#ec4899" },
      { name: "Biology", color: "#ef4444" },
    ].map((s) => db.subject.create({ data: { ...s, userId: user.id } })),
  );
  const [math, physics, chemistry, history, english, biology] = subjects;

  const lists = await Promise.all(
    ["My Tasks", "Homework", "Errands"].map((name) =>
      db.taskList.create({ data: { name, userId: user.id } }),
    ),
  );
  const [myTasks, homework, errands] = lists;

  // Tasks — includes the overdue row behind the dashboard overdue banner
  // ("Return library books") and a today/+1 spread for the KPI cards.
  const taskDefs = [
    { title: "Return library books", listId: errands.id, dueDate: at(-2, 17), priority: "medium", important: true },
    { title: "Finish calculus problem set", listId: homework.id, subjectId: math.id, dueDate: at(0, 20), priority: "high", myDay: true },
    { title: "Read chapter 4 — kinetics", listId: homework.id, subjectId: chemistry.id, dueDate: at(0, 22), priority: "medium", myDay: true },
    { title: "Outline history essay", listId: homework.id, subjectId: history.id, dueDate: at(1, 18), priority: "low" },
    { title: "Lab report draft", listId: homework.id, subjectId: physics.id, dueDate: at(3, 17), priority: "medium" },
    { title: "Practice French vocabulary", listId: myTasks.id, repeat: "daily", myDay: true },
    { title: "Book dentist appointment", listId: errands.id, important: true },
    { title: "Set up study group chat", listId: myTasks.id, completed: true },
    { title: "Submit scholarship form", listId: myTasks.id, completed: true, dueDate: at(-1, 12) },
  ];
  for (const t of taskDefs) {
    await db.task.create({ data: { ...t, userId: user.id } });
  }

  const assignmentDefs = [
    { title: "Problem set 7 — integrals", subjectId: math.id, type: "homework", progress: 80, priority: "high", dueDate: at(2, 17) },
    { title: "Kinetics lab write-up", subjectId: chemistry.id, type: "lab", progress: 45, priority: "urgent", dueDate: at(4, 17) },
    { title: "Romeo & Juliet analysis", subjectId: english.id, type: "essay", progress: 25, priority: "medium", dueDate: at(6, 17) },
    { title: "Cold War timeline", subjectId: history.id, type: "project", progress: 60, priority: "medium", dueDate: at(8, 17) },
    { title: "Physics reading — ch. 12", subjectId: physics.id, type: "reading", progress: 0, priority: "low", dueDate: at(1, 17) },
  ];
  for (const a of assignmentDefs) {
    await db.assignment.create({ data: { ...a, userId: user.id } });
  }

  const examDefs = [
    { title: "Calculus II Midterm", subjectId: math.id, date: at(1, 9), type: "midterm", duration: 90, topics: JSON.stringify(["Integration by parts", "Series"]) },
    { title: "Chemistry Quiz 5", subjectId: chemistry.id, date: at(3, 10), type: "quiz", duration: 30, topics: JSON.stringify(["Equilibrium"]) },
    { title: "Physics Final", subjectId: physics.id, date: at(12, 9), type: "final", duration: 120, topics: JSON.stringify(["Mechanics", "Thermo"]) },
  ];
  for (const e of examDefs) {
    await db.exam.create({ data: { ...e, userId: user.id } });
  }

  const eventDefs = [
    { title: "Study group — calculus", startDate: at(0, 16), endDate: at(0, 17, 30), location: "Library room 2B", repeat: "weekly", reminders: "[15,60]" },
    { title: "Advisor meeting", startDate: at(2, 13), endDate: at(2, 13, 30), location: "Room 210" },
    { title: "Chemistry lab session", startDate: at(4, 14), endDate: at(4, 16), location: "Science hall", repeat: "weekly" },
  ];
  for (const ev of eventDefs) {
    await db.event.create({ data: { ...ev, userId: user.id } });
  }

  const classDefs = [
    { name: "Calculus II", dayOfWeek: 0, startTime: "9:00", endTime: "10:30", subjectId: math.id, room: "M201" },
    { name: "Physics", dayOfWeek: 1, startTime: "11:00", endTime: "12:30", subjectId: physics.id, room: "P105", weekType: "A" },
    { name: "World History", dayOfWeek: 2, startTime: "9:00", endTime: "10:30", subjectId: history.id, room: "H14" },
    { name: "English Literature", dayOfWeek: 3, startTime: "13:00", endTime: "14:30", subjectId: english.id, room: "E3" },
    { name: "Chemistry Lab", dayOfWeek: 4, startTime: "14:00", endTime: "16:00", subjectId: chemistry.id, room: "Sci 2", weekType: "B" },
  ];
  for (const c of classDefs) {
    await db.timetableClass.create({ data: { ...c, userId: user.id } });
  }

  const notebooks = await Promise.all(
    ["Lecture Notes", "Reading Journal"].map((name) =>
      db.notebook.create({ data: { name, userId: user.id } }),
    ),
  );
  const noteDefs = [
    { title: "Integration techniques", content: "# Integration\n\n- substitution\n- by parts: ∫u dv = uv − ∫v du\n- partial fractions for rational functions", notebookId: notebooks[0].id, subjectId: math.id, tags: '["calculus","exam-prep"]' },
    { title: "Kinetics summary", content: "Rate laws: zero/first/second order.\nArrhenius: k = A·e^(−Ea/RT).", notebookId: notebooks[0].id, subjectId: chemistry.id },
    { title: "Essay sources", content: "Primary: letters collection.\nSecondary: two journal articles (2009, 2015).", notebookId: notebooks[1].id, subjectId: history.id, tags: '["research"]' },
  ];
  for (const n of noteDefs) {
    await db.note.create({ data: { ...n, userId: user.id } });
  }

  const decks = await Promise.all(
    [
      { name: "Biology Chapter 5", description: "Cell energy and enzymes", color: "#10b981", subjectId: biology.id },
      { name: "Spanish Vocabulary", description: "Unit 4 — travel", color: "#3b82f6", subjectId: null },
    ].map((d) => db.flashcardDeck.create({ data: { ...d, userId: user.id } })),
  );
  const cardDefs = [
    { deckId: decks[0].id, front: "What does ATP stand for?", back: "Adenosine triphosphate", difficulty: "easy" },
    { deckId: decks[0].id, front: "Enzyme function definition", back: "A biological catalyst that lowers activation energy", difficulty: "medium" },
    { deckId: decks[0].id, front: "Krebs cycle location", back: "Mitochondrial matrix", difficulty: "hard" },
    { deckId: decks[1].id, front: "the airport", back: "el aeropuerto", difficulty: "easy" },
    { deckId: decks[1].id, front: "to travel", back: "viajar", difficulty: "medium" },
  ];
  for (const c of cardDefs) {
    await db.flashcard.create({ data: c });
  }

  await db.practiceTest.create({
    data: {
      userId: user.id,
      title: "Biology Review",
      durationMinutes: 45,
      questions: JSON.stringify([
        { question: "What is DNA?", type: "short_answer" },
        { question: "Mitochondria are the powerhouse of the cell.", type: "true_false" },
        { question: "Which organelle synthesizes proteins?", type: "multiple_choice" },
      ]),
      subjectId: biology.id,
    },
  });

  await db.studyGroup.create({
    data: {
      userId: user.id,
      name: "Calc Crew",
      subjectId: math.id,
      members: JSON.stringify([
        { name: "Ari", email: "ari@example.com" },
        { name: "Sam", email: "sam@example.com" },
      ]),
    },
  });

  const gradeDefs = [
    { title: "Problem set 6", score: 92, maxScore: 100, weight: 1, subjectId: math.id },
    { title: "Quiz 4", score: 85, maxScore: 100, weight: 0.5, subjectId: math.id },
    { title: "Kinetics quiz", score: 78, maxScore: 100, weight: 1, subjectId: chemistry.id },
    { title: "Midterm essay", score: 88, maxScore: 100, weight: 2, subjectId: english.id },
    { title: "Lab practical", score: 95, maxScore: 100, weight: 1, subjectId: physics.id },
  ];
  for (const g of gradeDefs) {
    await db.grade.create({ data: { ...g, userId: user.id } });
  }

  // Focus sessions across the last 7 days (the Analytics charts' data).
  const focusDefs = [
    { dayOffset: 0, durationSeconds: 1500 },
    { dayOffset: 1, durationSeconds: 3000 },
    { dayOffset: 2, durationSeconds: 4500 },
    { dayOffset: 3, durationSeconds: 1500 },
    { dayOffset: 4, durationSeconds: 6000 },
    { dayOffset: 5, durationSeconds: 3000 },
    { dayOffset: 6, durationSeconds: 4500 },
  ];
  for (const f of focusDefs) {
    await db.focusSession.create({
      data: {
        userId: user.id,
        startedAt: at(-f.dayOffset, 15),
        durationSeconds: f.durationSeconds,
        mode: "focus",
        completed: true,
      },
    });
  }

  await db.holiday.createMany({
    data: [
      { userId: user.id, name: "Fall break", date: at(21, 0) },
      { userId: user.id, name: "Thanksgiving", date: at(38, 0) },
    ],
  });

  console.log("Seed: demo account ready — demo@studyflow.app / Demo1234!");
  await db.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
