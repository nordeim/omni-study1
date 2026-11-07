// S157/F3 measurement probe (scratch — the lock-mode question). The S156
// deferral record says a $transaction export snapshot would hold "a read
// transaction open across the serialization CPU work, against the import
// route's 60 s write-tx family." Audit B/M-1 sharpened the premise: the
// repo's own query engine binary carries BEGIN IMMEDIATE (x2) and NOT
// BEGIN DEFERRED — so a Prisma SQLite interactive $transaction may take
// the RESERVED (WRITE) lock at BEGIN, sitewide, for the whole read+hold
// window. This probe answers it EMPIRICALLY on a throwaway db
// (db/measure.db — never custom.db, never e2e.db):
//
//  P1 — which lock does an open interactive $transaction(read-only) hold?
//       While client A holds the tx open (post-first-read), client B:
//         (a) writes a row (implicit tx: BEGIN...write...COMMIT)
//         (b) reads a row
//       Timed + outcome-recorded. If B's write blocks ~busy_timeout then
//       P2028/SQLITE_BUSY → A holds a lock that starves writers (IMMEDIATE
//       or the SHARED-vs-EXCLUSIVE commit tail). If B's write returns
//       promptly → A holds nothing that blocks a short write (deferred
//       read snapshot coexisting with a fast writer... only possible in
//       WAL — journal_mode=delete SHARED blocks EXCLUSIVE commit).
//  P2 — the reverse posture: B holds a write tx open (post-first-write,
//       not committed); can A READ? (The export-under-import window.)
//  P3 — the real-shape rehearsal: A opens the export-shaped read tx
//       (20 findMany reads, then CPU-hold ~1.5 s simulating the
//       serialization), while B fires 5 short writes at 250 ms spacing —
//       how many succeed / block / fail, at what latencies?
//
// Run: DATABASE_URL="file:../db/measure.db" bun /home/z/my-project/scripts/measure-export-lock-s157.mjs
import { PrismaClient } from "@prisma/client";

const A = new PrismaClient(); // the export-shaped reader
const B = new PrismaClient(); // the concurrent writer (another request)

const USER = "lock-user";
const now = () => Date.now();
const ms = (t0) => `${now() - t0} ms`;

async function seed() {
  await A.user.deleteMany({ where: { email: "lock@studyflow.app" } }).catch(() => {});
  await A.user.create({
    data: { email: "lock@studyflow.app", passwordHash: "x", fullName: "Lock", id: USER },
  });
  await A.task.deleteMany({ where: { userId: USER } }).catch(() => {});
  await A.task.createMany({
    data: Array.from({ length: 200 }, (_, i) => ({
      id: `lock-task-${i}`,
      userId: USER,
      title: `Task ${i} — ${"x".repeat(80)}`,
      notes: "note body ".repeat(10),
      dueDate: new Date(Date.now() + i * 3600_000),
      subtasks: "[]",
    })),
  });
  await A.subject.createMany({
    data: Array.from({ length: 20 }, (_, i) => ({
      id: `lock-subj-${i}`,
      userId: USER,
      name: `Subject ${i}`,
      color: "#7c3aed",
    })),
  }).catch(() => {});
}

const sleep = (n) => new Promise((r) => setTimeout(r, n));

async function p1() {
  console.log("\n=== P1: which lock does an open read-only interactive $transaction hold? ===");
  let release;
  const gate = new Promise((r) => (release = r));
  const held = (async () => {
    await A.$transaction(async (tx) => {
      await tx.subject.findMany({ where: { userId: USER } }); // first read — the tx is live
      console.log("[A] read tx open (post-first-read)");
      release();
      await sleep(2500); // the hold: serialization-CPU stand-in
      console.log("[A] read tx closing");
    });
  })();
  await gate;
  await sleep(150); // let A's read fully land

  const t0 = now();
  let writeOutcome;
  try {
    await B.task.create({
      data: { id: `p1-write-${now()}`, userId: USER, title: "P1 concurrent write", subtasks: "[]" },
    });
    writeOutcome = `SUCCESS in ${ms(t0)}`;
  } catch (err) {
    writeOutcome = `FAIL in ${ms(t0)} — ${String(err).slice(0, 300)}`;
  }
  console.log(`[B] concurrent WRITE while A's tx open: ${writeOutcome}`);

  const t1 = now();
  let readOutcome;
  try {
    const n = await B.task.count({ where: { userId: USER } });
    readOutcome = `SUCCESS in ${ms(t1)} (count=${n})`;
  } catch (err) {
    readOutcome = `FAIL in ${ms(t1)} — ${String(err).slice(0, 200)}`;
  }
  console.log(`[B] concurrent READ while A's tx open: ${readOutcome}`);

  await held;
  // If B's write failed above, retry now to prove the lock released.
  const t2 = now();
  try {
    await B.task.create({
      data: { id: `p1-after-${now()}`, userId: USER, title: "P1 after close", subtasks: "[]" },
    });
    console.log(`[B] write AFTER A's tx closed: SUCCESS in ${ms(t2)} (lock released)`);
  } catch (err) {
    console.log(`[B] write AFTER A's tx closed: FAIL — ${String(err).slice(0, 200)}`);
  }
}

async function p2() {
  console.log("\n=== P2: can a read coexist with an open WRITE tx (pre-commit)? ===");
  let release;
  const gate = new Promise((r) => (release = r));
  const held = (async () => {
    await B.$transaction(async (tx) => {
      await tx.task.create({
        data: { id: `p2-write-${now()}`, userId: USER, title: "P2 write-tx row", subtasks: "[]" },
      });
      console.log("[B] write tx open (post-first-write, uncommitted)");
      release();
      await sleep(1500);
      console.log("[B] write tx committing");
    });
  })();
  await gate;
  await sleep(150);
  const t0 = now();
  let readOutcome;
  try {
    const n = await A.task.count({ where: { userId: USER } });
    readOutcome = `SUCCESS in ${ms(t0)} (count=${n})`;
  } catch (err) {
    readOutcome = `FAIL in ${ms(t0)} — ${String(err).slice(0, 200)}`;
  }
  console.log(`[A] concurrent READ while B's write tx open: ${readOutcome}`);
  await held;
}

async function p3() {
  console.log("\n=== P3: the export-shaped rehearsal (A: 20 reads + 1.5s hold; B: 5 writes @250ms) ===");
  const results = [];
  let release;
  const gate = new Promise((r) => (release = r));
  const held = (async () => {
    await A.$transaction(async (tx) => {
      // The export shape: 20 sequential collection reads (small here; the
      // lock posture is the question, not the data volume).
      for (let i = 0; i < 20; i++) {
        await tx.task.findMany({ where: { userId: USER }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] });
      }
      console.log("[A] export-shaped read tx open (20 reads done)");
      release();
      await sleep(1500); // serialization CPU stand-in
      console.log("[A] export-shaped tx closing");
    });
  })();
  await gate;

  for (let i = 0; i < 5; i++) {
    await sleep(250);
    const t0 = now();
    try {
      await B.task.create({
        data: { id: `p3-write-${i}-${now()}`, userId: USER, title: `P3 write ${i}`, subtasks: "[]" },
      });
      results.push(`write ${i}: SUCCESS in ${ms(t0)}`);
    } catch (err) {
      results.push(`write ${i}: FAIL in ${ms(t0)} — ${String(err).split("\n").slice(0, 2).join(" | ").slice(0, 220)}`);
    }
  }
  for (const r of results) console.log(`[B] ${r}`);
  await held;
}

await seed();
await p1();
await p2();
await p3();
await A.$disconnect();
await B.$disconnect();
console.log("\nMEASUREMENT COMPLETE");
