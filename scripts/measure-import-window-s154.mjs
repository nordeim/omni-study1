// S154 measurement probe (scratch — the B-L2 residual-window question).
// The S141 deferral made the A-M3 stage-2 conditional: "Stage-2 remains
// the named candidate if measurement shows a residual window." This probe
// answers it empirically: it times the EXACT tx shape the import route
// runs (sequential per-row updates + chunked createMany inside ONE
// $transaction with { timeout: 60_000, maxWait: 5_000 }) at increasing
// row counts, against a THROWAWAY db (db/measure.db — never custom.db,
// never e2e.db). Deleted after the measurement is recorded.
//
// Run: DATABASE_URL="file:../db/measure.db" bun scripts/measure-import-window-s154.mjs
// (after DATABASE_URL="file:../db/measure.db" bunx prisma db push --skip-generate)
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const USER = "measure-user";
const TITLES = 12;

async function seedUser() {
  await db.user.deleteMany({ where: { email: "measure@studyflow.app" } }).catch(() => {});
  return db.user.create({
    data: {
      email: "measure@studyflow.app",
      passwordHash: "x",
      fullName: "Measure",
      id: USER,
    },
  });
}

// Build N tasks with realistic payloads (200-char titles, notes, subtasks
// JSON, dates) — the shape the import's plan.creates/plan.updates carry.
async function seedTasks(n) {
  await db.task.deleteMany({ where: { userId: USER } });
  const base = new Date("2026-01-05T09:00:00.000Z").getTime();
  const rows = [];
  for (let i = 0; i < n; i++) {
    rows.push({
      id: `measure-task-${i}`,
      userId: USER,
      title: `Task ${i} — ${"x".repeat(80)}`,
      notes: "note body ".repeat(10),
      completed: i % 3 === 0,
      important: i % 7 === 0,
      dueDate: new Date(base + i * 3600_000),
      priority: ["none", "low", "medium", "high"][i % 4],
      repeat: "none",
      myDay: i % 11 === 0,
      subtasks: JSON.stringify([
        { id: `st-${i}-a`, title: "sub a", done: false },
        { id: `st-${i}-b`, title: "sub b", done: true },
      ]),
    });
  }
  // The route's own chunk size (IMPORT_CREATE_CHUNK = 500)
  for (let i = 0; i < rows.length; i += 500) {
    await db.task.createMany({ data: rows.slice(i, i + 500) });
  }
  return rows.length;
}

// The EXACT route tx shape: sequential per-row updates (one changed
// field — the realistic re-import-over-changed-account shape) inside
// ONE $transaction with the route's explicit options.
async function timeUpdateLoop(n) {
  const t0 = Date.now();
  await db.$transaction(
    async (tx) => {
      for (let i = 0; i < n; i++) {
        await tx.task.update({
          where: { id: `measure-task-${i}` },
          data: { title: `Task ${i} — ${"y".repeat(80)}` },
        });
      }
    },
    { timeout: 60_000, maxWait: 5_000 },
  );
  return Date.now() - t0;
}

// The no-op elision comparator's cost: reading full rows pre-tx (what
// the elision's probe extension would pay) at the same scale.
async function timeFullRowProbe(n) {
  const t0 = Date.now();
  for (let i = 0; i < n; i += 5000) {
    const ids = Array.from(
      { length: Math.min(5000, n - i) },
      (_, j) => `measure-task-${i + j}`,
    );
    await tx_read(ids);
  }
  return Date.now() - t0;
}

async function tx_read(ids) {
  return db.task.findMany({ where: { id: { in: ids } } });
}

const SIZES = [1_000, 10_000, 50_000, 100_000];

const user = await seedUser();
console.log(`user: ${user.id}`);
const results = [];
for (const n of SIZES) {
  const seeded = await seedTasks(n);
  // warm the pool
  await timeUpdateLoop(Math.min(50, n));
  const updateMs = await timeUpdateLoop(n);
  const probeMs = await timeFullRowProbe(n);
  const perRowMs = updateMs / n;
  results.push({ rows: seeded, updateMs, probeMs, perRowMs: +perRowMs.toFixed(4) });
  console.log(
    `rows=${n} updateLoop=${updateMs}ms (${perRowMs.toFixed(3)}ms/row) fullRowProbe=${probeMs}ms`,
  );
}
console.log(JSON.stringify({ verdict: "measured", results }, null, 2));
await db.$disconnect();
