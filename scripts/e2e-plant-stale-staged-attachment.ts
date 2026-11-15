/**
 * S188/EL e2e fixture — plants TWO staged NoteAttachment rows on the demo
 * user (docs/remediation-plan-session188.md §3.3): **A**
 * `s188el-stale-staged-fixture-01` backdated 25h (the GC sweep target)
 * + **B** `s188el-fresh-staged-fixture-01` at now (the plant-integrity
 * probe — nothing in-suite can sweep a FRESH staged row, so its download
 * 200 proves the plant ran; see the plan's two-fixture race analysis).
 *
 * The FIXED ids are the spec contract (tests/e2e/parity-session7.spec.ts's
 * S188/EL block holds the same literals — the demo@studyflow.app
 * two-site-literal precedent). Both timestamps are EXPLICIT: Prisma's
 * @updatedAt honors a provided value over its auto-set (the create
 * contract), so fixture A reads genuinely stale to the GC's cutoff.
 *
 * Idempotent: deletes both prior fixture rows before creating. Target db:
 * DATABASE_URL if the caller pinned one, else the e2e scratch db (the
 * e2e-plant-legacy-note.ts posture — the env must be pinned BEFORE the db
 * module import, db.ts reads DATABASE_URL at module scope).
 *
 * Usage: bun scripts/e2e-plant-stale-staged-attachment.ts   (e2e db)
 *    or: DATABASE_URL="file:../db/custom.db" bun scripts/e2e-plant-stale-staged-attachment.ts
 */

process.env.DATABASE_URL ??= "file:../db/e2e.db";

const STALE_ID = "s188el-stale-staged-fixture-01";
const FRESH_ID = "s188el-fresh-staged-fixture-01";
const STALE_MS = 25 * 60 * 60 * 1000; // 25h — past the 24h retention
const BODY = "s188 el staged fixture";

async function main(): Promise<void> {
  const { db } = await import("../src/lib/db");

  const demo = await db.user.findUnique({ where: { email: "demo@studyflow.app" } });
  if (!demo) {
    console.error("[plant-s188-el] demo user missing — run the seed first");
    process.exit(1);
  }

  await db.noteAttachment.deleteMany({ where: { id: { in: [STALE_ID, FRESH_ID] } } });
  const now = new Date();
  const bytes = Buffer.from(BODY, "utf8");
  await db.noteAttachment.create({
    data: {
      id: STALE_ID,
      userId: demo.id,
      noteId: null,
      name: `${STALE_ID}.txt`,
      mime: "text/plain",
      size: bytes.byteLength,
      data: bytes.toString("base64"),
      createdAt: new Date(now.getTime() - STALE_MS),
      updatedAt: new Date(now.getTime() - STALE_MS),
    },
  });
  await db.noteAttachment.create({
    data: {
      id: FRESH_ID,
      userId: demo.id,
      noteId: null,
      name: `${FRESH_ID}.txt`,
      mime: "text/plain",
      size: bytes.byteLength,
      data: bytes.toString("base64"),
      createdAt: now,
      updatedAt: now,
    },
  });

  await db.$disconnect();
  console.log(`[plant-s188-el] staged fixtures planted (db: ${process.env.DATABASE_URL})`);
}

void main();

// Module marker: the legacy plant script is a global script (no imports/
// exports) — two global `main()` declarations collide at TS2393 under the
// scripts/ include (the e2e-plant-nontext-note.ts precedent), so THIS
// file is a module instead.
export {};
