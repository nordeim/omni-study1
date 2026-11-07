// S158/DG0 measurement probe (scratch — the single-collection memory
// question). The S157 close's recorded first rotation candidate: the
// S156/DE1 streaming driver reads the 20 collections SEQUENTIALLY (one
// collection's rows in memory at a time), but a single collection with a
// very large row count still FULLY MATERIALIZES in one findMany — all of
// that collection's Prisma row objects live simultaneously on top of the
// retained fragments. The recorded deferral: "the single-collection
// cursor pagination (a >memory single collection still materializes —
// census-breaking, its own cycle)". Per the S154/S157 measurement-first
// doctrine, the FIRST act on this family is the MEASUREMENT, not the
// design: does the single-collection row-object term materially dominate
// the peak at realistic-to-adversarial tails?
//
//  P1 (SPREAD): one user, N rows spread across 10 content collections
//       (tasks, notes, assignments, exams, events, grades, focusSessions,
//       chatMessages, calcHistory, holidays) — the natural-shape baseline.
//  P2 (DOMINANT-notes): the same N rows, ALL in notes (one findMany).
//  P3 (DOMINANT-chat): the same N rows, ALL in chatMessages (the
//       realistic heavy single-collection tail — an AI-assistant-heavy
//       account).
//
//  Around the REAL renderExportEnvelope (the production path — the seam,
//  the READERS map, the driver), measured per shape:
//    - heapUsed before / peak-sampled (25 ms) / after (bun.gc'd baselines)
//    - rss before / peak-sampled / after
//    - wall duration + the returned { bytes, counts }
//    - the ratio (peakHeapDelta / bytes) — the amplification coefficient
//
//  The verdict rule: at roughly equal envelope bytes, DOMINANT's peak
//  minus SPREAD's peak isolates the single-collection row-object term
//  (~19/20 of it at this shape). If the delta is a large fraction of the
//  envelope's own bytes (the row-object term ≥ ~1× the fragment term),
//  cursor pagination is justified NOW; if the delta is bounded/small
//  relative to the envelope, the deferral converts to
//  MEASURED-DEFERRED with the number recorded.
//
// Run (the throwaway db must exist first — schema pushed by the caller):
//   DATABASE_URL="file:<ABS>/db/measure-s158.db" \
//     bun scripts/measure-export-heap-s158.mjs
// NEVER custom.db, never e2e.db (the s154/s157 precedent).
import { PrismaClient } from "@prisma/client";
import { renderExportEnvelope } from "../src/lib/server/export-build.ts";

const db = new PrismaClient();

// ~1.2 KiB serialized payload per row — the constant row-shape control.
const PAYLOAD = "x".repeat(1200);
const N_PER_SHAPE = 50_000; // ≈ 60 MiB serialized per shape
const CH = 5_000; // createMany chunk

const gc = () => {
  if (typeof Bun !== "undefined" && typeof Bun.gc === "function") Bun.gc(true);
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function makeUser(email, id) {
  return { email, passwordHash: "x", fullName: "Heap Probe", id };
}

async function seedSpread(userId) {
  const per = N_PER_SHAPE / 10;
  const at = (i) => new Date(Date.UTC(2024, 0, 1) + i * 1000); // distinct createdAt for stable order
  await db.task.createMany({
    data: Array.from({ length: per }, (_, i) => ({
      id: `${userId}-task-${i}`,
      userId,
      title: PAYLOAD.slice(0, 200),
      notes: PAYLOAD,
      subtasks: "[]",
      createdAt: at(i),
    })),
  });
  await db.note.createMany({
    data: Array.from({ length: per }, (_, i) => ({
      id: `${userId}-note-${i}`,
      userId,
      title: PAYLOAD.slice(0, 200),
      content: PAYLOAD,
      tags: "[]",
      createdAt: at(i),
    })),
  });
  await db.assignment.createMany({
    data: Array.from({ length: per }, (_, i) => ({
      id: `${userId}-asg-${i}`,
      userId,
      title: PAYLOAD.slice(0, 200),
      description: PAYLOAD,
      createdAt: at(i),
    })),
  });
  await db.exam.createMany({
    data: Array.from({ length: per }, (_, i) => ({
      id: `${userId}-exam-${i}`,
      userId,
      title: PAYLOAD.slice(0, 200),
      date: at(i),
      createdAt: at(i),
    })),
  });
  await db.event.createMany({
    data: Array.from({ length: per }, (_, i) => ({
      id: `${userId}-evt-${i}`,
      userId,
      title: PAYLOAD.slice(0, 200),
      description: PAYLOAD,
      startDate: at(i),
      createdAt: at(i),
    })),
  });
  await db.grade.createMany({
    data: Array.from({ length: per }, (_, i) => ({
      id: `${userId}-grd-${i}`,
      userId,
      title: PAYLOAD.slice(0, 200),
      score: 90,
      maxScore: 100,
      createdAt: at(i),
    })),
  });
  await db.focusSession.createMany({
    data: Array.from({ length: per }, (_, i) => ({
      id: `${userId}-foc-${i}`,
      userId,
      startedAt: at(i),
      durationSeconds: 1500,
      mode: "pomodoro",
      createdAt: at(i),
    })),
  });
  await db.aiChatMessage.createMany({
    data: Array.from({ length: per }, (_, i) => ({
      id: `${userId}-chat-${i}`,
      userId,
      role: i % 2 === 0 ? "user" : "assistant",
      content: PAYLOAD,
      createdAt: at(i),
    })),
  });
  await db.calculatorHistoryEntry.createMany({
    data: Array.from({ length: per }, (_, i) => ({
      id: `${userId}-calc-${i}`,
      userId,
      expression: PAYLOAD.slice(0, 200),
      result: PAYLOAD,
      createdAt: at(i),
    })),
  });
  await db.holiday.createMany({
    data: Array.from({ length: per }, (_, i) => ({
      id: `${userId}-hol-${i}`,
      userId,
      name: PAYLOAD.slice(0, 200),
      date: at(i),
      createdAt: at(i),
    })),
  });
}

async function seedDominantNotes(userId) {
  const at = (i) => new Date(Date.UTC(2024, 0, 1) + i * 1000);
  for (let c = 0; c < N_PER_SHAPE / CH; c++) {
    await db.note.createMany({
      data: Array.from({ length: CH }, (_, i) => {
        const g = c * CH + i;
        return {
          id: `${userId}-note-${g}`,
          userId,
          title: PAYLOAD.slice(0, 200),
          content: PAYLOAD,
          tags: "[]",
          createdAt: at(g),
        };
      }),
    });
  }
}

async function seedDominantChat(userId) {
  const at = (i) => new Date(Date.UTC(2024, 0, 1) + i * 1000);
  for (let c = 0; c < N_PER_SHAPE / CH; c++) {
    await db.aiChatMessage.createMany({
      data: Array.from({ length: CH }, (_, i) => {
        const g = c * CH + i;
        return {
          id: `${userId}-chat-${g}`,
          userId,
          role: g % 2 === 0 ? "user" : "assistant",
          content: PAYLOAD,
          createdAt: at(g),
        };
      }),
    });
  }
}

async function measure(label, user) {
  gc();
  await sleep(100);
  gc();
  await sleep(50);
  const before = process.memoryUsage();
  let peakHeap = before.heapUsed;
  let peakRss = before.rss;
  const sampler = setInterval(() => {
    const m = process.memoryUsage();
    if (m.heapUsed > peakHeap) peakHeap = m.heapUsed;
    if (m.rss > peakRss) peakRss = m.rss;
  }, 25);
  const t0 = Date.now();
  const rendered = await renderExportEnvelope({
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    createdAt: new Date(),
  });
  const durationMs = Date.now() - t0;
  clearInterval(sampler);
  const after = process.memoryUsage();
  const peakHeapDelta = peakHeap - before.heapUsed;
  const peakRssDelta = peakRss - before.rss;
  const mb = (n) => `${(n / 1024 / 1024).toFixed(1)} MiB`;
  console.log(`\n[${label}]`);
  console.log(`  envelope bytes      : ${mb(rendered.bytes)} (${rendered.bytes})`);
  console.log(`  peak heap delta     : ${mb(peakHeapDelta)}  (before ${mb(before.heapUsed)} → peak ${mb(peakHeap)})`);
  console.log(`  peak rss delta      : ${mb(peakRssDelta)}`);
  console.log(`  heap after          : ${mb(after.heapUsed)}`);
  console.log(`  duration            : ${durationMs} ms`);
  console.log(`  amplification (peakHeapDelta/bytes): ${(peakHeapDelta / rendered.bytes).toFixed(2)}x`);
  // ---------------------------------------------------------------------
  // S158/DG1 KEYSET CORRECTNESS VERIFICATION (the real-Prisma leg — the
  // unit layer rides fakes, the e2e data is single-batch; THIS is the
  // only place the actual cursor+skip+orderBy continuation is exercised
  // at multi-batch scale): parse the assembled envelope and assert, per
  // collection — (1) the row count equals the counts record; (2) ids are
  // unique (no row lost, no row duplicated across page boundaries);
  // (3) the (createdAt, id) order is non-decreasing (the wire order
  // contract holds across pages).
  // ---------------------------------------------------------------------
  const total = rendered.bytes;
  const buf = new Uint8Array(total);
  let off = 0;
  for (const frag of rendered.fragments) {
    buf.set(frag, off);
    off += frag.byteLength;
  }
  const envelope = JSON.parse(new TextDecoder().decode(buf));
  let rowsVerified = 0;
  let orderOk = true;
  let uniqOk = true;
  for (const [name, rows] of Object.entries(envelope.data)) {
    if (envelope.counts[name] !== rows.length) {
      throw new Error(`KEYSET VERIFY FAIL [${label}] ${name}: counts ${envelope.counts[name]} !== rows ${rows.length}`);
    }
    const seen = new Set();
    let prev = null;
    for (const row of rows) {
      if (seen.has(row.id)) uniqOk = false;
      seen.add(row.id);
      const key = `${row.createdAt}|${row.id}`;
      if (prev !== null && key < prev) orderOk = false;
      prev = key;
    }
    rowsVerified += rows.length;
  }
  console.log(`  keyset verify       : ${rowsVerified} rows — counts ✓ · unique ${uniqOk ? "✓" : "FAIL"} · order ${orderOk ? "✓" : "FAIL"}`);
  if (!uniqOk || !orderOk) {
    console.error("KEYSET VERIFY FAIL — the pagination is lossy/disordered");
    process.exit(1);
  }
  return {
    label,
    bytes: rendered.bytes,
    peakHeapDelta,
    peakRssDelta,
    durationMs,
    ratio: peakHeapDelta / rendered.bytes,
    counts: rendered.counts,
  };
}

// ---- the loud self-verification (the S27 doctrine) -------------------------
const url = process.env.DATABASE_URL ?? "";
if (!url.includes("measure-s158.db")) {
  console.error("REFUSING: DATABASE_URL must point at the throwaway db/measure-s158.db");
  process.exit(1);
}

const SPREAD = "heap-spread-user";
const DOM_NOTES = "heap-dom-notes-user";
const DOM_CHAT = "heap-dom-chat-user";

// Re-runnable: cascade-wipe the three probe users first (the fixed-id
// createManys would P2022 on a second run against the same scratch db).
console.log("wiping prior probe users (cascade)…");
for (const id of [SPREAD, DOM_NOTES, DOM_CHAT]) {
  await db.user.deleteMany({ where: { id } }).catch(() => {});
}

console.log("seeding SPREAD (10 collections × 5k rows)…");
await db.user.create({ data: makeUser("heap-spread@studyflow.app", SPREAD) }).catch(() => {});
await seedSpread(SPREAD);
console.log("seeding DOMINANT-notes (50k rows, one collection)…");
await db.user.create({ data: makeUser("heap-notes@studyflow.app", DOM_NOTES) }).catch(() => {});
await seedDominantNotes(DOM_NOTES);
console.log("seeding DOMINANT-chat (50k rows, one collection)…");
await db.user.create({ data: makeUser("heap-chat@studyflow.app", DOM_CHAT) }).catch(() => {});
await seedDominantChat(DOM_CHAT);

// SHAPES env (comma list of spread|notes|chat) isolates a shape per
// process — the prior pass's uncollected fragments otherwise contaminate
// the next baseline and GC-suppress the observed peak (the P2 artifact
// this probe's first two runs recorded: dom-notes read 1.48x only
// because P1's ~52 MiB of unreachable fragments were reclaimed
// mid-render under the sampler).
const shapes = (process.env.SHAPES ?? "spread,notes,chat").split(",");

const results = [];
if (shapes.includes("spread")) {
  results.push(await measure("P1 SPREAD — 10 collections × 5k rows", makeUser("heap-spread@studyflow.app", SPREAD)));
}
if (shapes.includes("notes")) {
  results.push(await measure("P2 DOMINANT-notes — 50k rows in ONE collection", makeUser("heap-notes@studyflow.app", DOM_NOTES)));
}
if (shapes.includes("chat")) {
  results.push(await measure("P3 DOMINANT-chat — 50k rows in ONE collection", makeUser("heap-chat@studyflow.app", DOM_CHAT)));
}
const [r1, r2, r3] = [results.find((r) => r.label.startsWith("P1")), results.find((r) => r.label.startsWith("P2")), results.find((r) => r.label.startsWith("P3"))];

const mb = (n) => `${(n / 1024 / 1024).toFixed(1)} MiB`;
console.log("\n==== VERDICT INPUTS ====");
for (const r of results) {
  console.log(`${r.label} → peak delta ${mb(r.peakHeapDelta)} @ ${mb(r.bytes)} envelope (${r.ratio.toFixed(2)}x), ${r.durationMs} ms`);
}
if (r1 && r2) console.log(`dominant-vs-spread excess (the row-object term, notes): ${mb(r2.peakHeapDelta - r1.peakHeapDelta)}`);
if (r1 && r3) console.log(`dominant-vs-spread excess (the row-object term, chat) : ${mb(r3.peakHeapDelta - r1.peakHeapDelta)}`);

await db.$disconnect();
console.log("\nMEASUREMENT COMPLETE");
