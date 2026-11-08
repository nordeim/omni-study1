// S159 measurement probe (DH0 — the create-side gate, the S154/S157
// measurement-first doctrine). The S158 close's recorded deferrals gate the
// raw-SQL create sibling on "IF profiling ever presses the 60 s budget" —
// but the only import-side numbers ever recorded (S154) cover the UPDATE
// loop + the full-row probe. The createMany loop, the mixed worst-case tx,
// and the pre-tx CPU stages were never measured. This probe answers the
// gate empirically against a THROWAWAY db (db/measure-s159.db — never
// custom.db, never e2e.db), riding the REAL seam stages where they matter
// (the S158 precedent: the probe wraps the production functions, not a
// re-implementation):
//
//   1. CREATE loop   — the route's exact chunk shape (createMany in
//                      IMPORT_CREATE_CHUNK=500-row slices) at increasing
//                      row counts, timed cold (fresh ids each pass).
//   2. MIXED tx      — the true worst legal shape at the 100k row cap:
//                      50k sequential per-row updates + 50k chunked creates
//                      inside ONE $transaction({ timeout: 60_000, maxWait:
//                      5_000 }) — the exact route tx options.
//   3. PRE-TX CPU    — the REAL validateImportEnvelope + sanitizeImportRow
//                      pass over a realistic 100k-row envelope (the
//                      client-visible wall-time term vs the 120 s
//                      AbortSignal deadline), including the JSON.parse the
//                      route pays on the raw body.
//
// Run (after `DATABASE_URL="file:../db/measure-s159.db" bunx prisma db push --skip-generate`):
//   DATABASE_URL="file:../db/measure-s159.db" bun scripts/measure-import-create-s159.mjs
// Committed (the S158 measure-export-heap-s158.mjs precedent — the probe IS
// the evidence; the numbers land in the plan + the session log).
import { PrismaClient } from "@prisma/client";
import {
  IMPORT_CREATE_CHUNK,
  sanitizeImportRow,
  validateImportEnvelope,
} from "../src/lib/data-import.ts";

const db = new PrismaClient();

const USER = "measure-user-s159";
const TITLES = 12;

async function seedUser() {
  await db.user.deleteMany({ where: { email: "measure-s159@studyflow.app" } }).catch(() => {});
  return db.user.create({
    data: {
      email: "measure-s159@studyflow.app",
      passwordHash: "x",
      fullName: "Measure",
      id: USER,
    },
  });
}

// Build N task rows with the realistic payload shape the import's
// plan.creates carry (200-char titles, notes, subtasks JSON, dates).
function buildTaskRows(n, tag, offset = 0) {
  const base = new Date("2026-01-05T09:00:00.000Z").getTime();
  const rows = [];
  for (let i = 0; i < n; i++) {
    rows.push({
      id: `m159-${tag}-${offset + i}`,
      userId: USER,
      title: `Task ${i} — ${"x".repeat(80)}`,
      notes: "note body ".repeat(10),
      completed: (offset + i) % 3 === 0,
      important: (offset + i) % 7 === 0,
      dueDate: new Date(base + (offset + i) * 3600_000),
      priority: ["none", "low", "medium", "high"][(offset + i) % 4],
      repeat: "none",
      myDay: (offset + i) % 11 === 0,
      subtasks: JSON.stringify([
        { id: `st-${offset + i}-a`, title: "sub a", done: false },
        { id: `st-${offset + i}-b`, title: "sub b", done: true },
      ]),
    });
  }
  return rows;
}

// 1. The CREATE loop — the route's exact chunk shape, timed cold.
async function timeCreateLoop(n, tag) {
  await db.task.deleteMany({ where: { id: { startsWith: `m159-${tag}-` } } });
  const rows = buildTaskRows(n, tag);
  const t0 = Date.now();
  for (let i = 0; i < rows.length; i += IMPORT_CREATE_CHUNK) {
    await db.task.createMany({ data: rows.slice(i, i + IMPORT_CREATE_CHUNK) });
  }
  return Date.now() - t0;
}

// 2. The MIXED tx — 50% updates + 50% creates in ONE tx with the route's
// exact options. n rows pre-exist (seeded via the chunked shape); the loop
// updates the first n/2 and creates n/2 fresh rows.
async function timeMixedTx(n) {
  const tag = "mix";
  await db.task.deleteMany({ where: { id: { startsWith: `m159-${tag}-` } } });
  const seeded = buildTaskRows(n, tag);
  for (let i = 0; i < seeded.length; i += IMPORT_CREATE_CHUNK) {
    await db.task.createMany({ data: seeded.slice(i, i + IMPORT_CREATE_CHUNK) });
  }
  const updates = buildTaskRows(n / 2, tag); // same ids → the update set
  // offset n → ids BEYOND the seeded range (fresh ids for the create set —
  // an overlapping offset collides with the seeded rows and throws P2002)
  const creates = buildTaskRows(n / 2, tag, n);
  const t0 = Date.now();
  await db.$transaction(
    async (tx) => {
      for (let i = 0; i < updates.length; i++) {
        await tx.task.update({
          where: { id: updates[i].id },
          data: { title: `Task ${i} — ${"y".repeat(80)}` },
        });
      }
      for (let i = 0; i < creates.length; i += IMPORT_CREATE_CHUNK) {
        await tx.task.createMany({ data: creates.slice(i, i + IMPORT_CREATE_CHUNK) });
      }
    },
    { timeout: 60_000, maxWait: 5_000 },
  );
  const ms = Date.now() - t0;
  await db.task.deleteMany({ where: { id: { startsWith: `m159-${tag}-` } } });
  return ms;
}

// 3. The PRE-TX CPU — the REAL seam stages over a realistic 100k-row
// envelope: JSON.parse of the serialized body, validateImportEnvelope,
// then the per-row sanitizeImportRow pass (the route's own pre-tx order:
// parse → validate → per-row guard, all OUTSIDE the tx).
async function timePreTxCpu(n) {
  const rows = buildTaskRows(n, "cpu").map((r) => ({ ...r, dueDate: r.dueDate.toISOString() }));
  const body = JSON.stringify({
    format: "studyflow-data-export",
    version: 1,
    exportedAt: new Date().toISOString(),
    data: { tasks: rows },
  });
  const tParse0 = Date.now();
  const parsed = JSON.parse(body);
  const parseMs = Date.now() - tParse0;
  const tValidate0 = Date.now();
  const verdict = validateImportEnvelope(parsed);
  const validateMs = Date.now() - tValidate0;
  if (!verdict.ok) throw new Error(`validateImportEnvelope rejected the fixture: ${verdict.error}`);
  const tSanitize0 = Date.now();
  const collection = "tasks";
  for (let i = 0; i < parsed.data.tasks.length; i++) {
    sanitizeImportRow(collection, parsed.data.tasks[i], i);
  }
  const sanitizeMs = Date.now() - tSanitize0;
  return { parseMs, validateMs, sanitizeMs, totalMs: parseMs + validateMs + sanitizeMs };
}

const user = await seedUser();
console.log(`user: ${user.id}`);

// ---- 1. the create-loop curve -------------------------------------------
const CREATE_SIZES = [1_000, 10_000, 25_000, 50_000, 100_000];
const createResults = [];
for (const n of CREATE_SIZES) {
  const ms = await timeCreateLoop(n, `c${n}`);
  const perRowMs = ms / n;
  createResults.push({ rows: n, createMs: ms, perRowMs: +perRowMs.toFixed(4) });
  console.log(`CREATE rows=${n} createLoop=${ms}ms (${perRowMs.toFixed(3)}ms/row)`);
}

// ---- 2. the mixed worst-case tx ------------------------------------------
const MIXED_SIZES = [10_000, 50_000, 100_000];
const mixedResults = [];
for (const n of MIXED_SIZES) {
  const ms = await timeMixedTx(n);
  mixedResults.push({ totalRows: n, halfUpdates: n / 2, halfCreates: n / 2, txMs: ms });
  console.log(`MIXED tx rows=${n} (u=${n / 2}/c=${n / 2}) txWindow=${ms}ms`);
}

// ---- 3. the pre-tx CPU stages at the cap ---------------------------------
const cpu = await timePreTxCpu(100_000);
console.log(
  `PRE-TX rows=100000 parse=${cpu.parseMs}ms validate=${cpu.validateMs}ms sanitize=${cpu.sanitizeMs}ms total=${cpu.totalMs}ms`,
);

const worstMixedTx = mixedResults[mixedResults.length - 1];
const summary = {
  verdict: "measured",
  createLoop: createResults,
  mixedTx: mixedResults,
  preTxCpuAtCap: cpu,
  gate: {
    txBudgetMs: 60_000,
    worstMixedTxMs: worstMixedTx.txMs,
    txHeadroom: +(60_000 / worstMixedTx.txMs).toFixed(2),
    clientDeadlineMs: 120_000,
    worstEndToEndMs: worstMixedTx.txMs + cpu.totalMs,
    clientHeadroom: +(120_000 / (worstMixedTx.txMs + cpu.totalMs)).toFixed(2),
  },
};
console.log(JSON.stringify(summary, null, 2));
await db.$disconnect();
