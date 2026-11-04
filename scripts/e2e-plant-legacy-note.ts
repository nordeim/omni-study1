/**
 * S140/CO1 e2e fixture — plants ONE hostile "legacy" note row on the demo
 * user, simulating a PRE-FIX row (written before the note-HTML sanitize
 * seam existed). The render-gate e2e leg opens this note in the Notes view
 * and asserts ZERO outbound requests to the attacker origin: the
 * quill-editor mount gate (sanitizeNoteHtmlDom) must neutralize the remote
 * img/iframe BEFORE the Quill paste.
 *
 * Idempotent: deletes any prior fixture note (same distinctive title)
 * before creating it, so re-seeding never duplicates it.
 *
 * Target db: DATABASE_URL if the caller pinned one (e.g. the DEV db for
 * the evidence capture — `DATABASE_URL="file:../db/custom.db" bun
 * scripts/e2e-plant-legacy-note.ts`), else the e2e scratch db (the
 * global-setup's own posture). The env must be pinned BEFORE the db module
 * import (db.ts reads DATABASE_URL at module scope through
 * resolveProcessDatabaseUrl()).
 *
 * Usage: bun scripts/e2e-plant-legacy-note.ts   (e2e db — the global-setup)
 *    or: DATABASE_URL="file:../db/custom.db" bun scripts/e2e-plant-legacy-note.ts
 */

process.env.DATABASE_URL ??= "file:../db/e2e.db";

async function main(): Promise<void> {
  const { db } = await import("../src/lib/db");

  const title = "A-L3 legacy hostile note (render-gate fixture)";
  const hostile =
    "<p>Legacy row planted pre-fix — the render gate must neutralize:</p>" +
    '<img src="https://a-l3-legacy.example/px.gif" alt="pixel">' +
    '<iframe src="https://a-l3-legacy.example/frame"></iframe>' +
    '<script>alert("never")</script>' +
    '<p onclick="steal()">handler bait</p>';

  const demo = await db.user.findUnique({ where: { email: "demo@studyflow.app" } });
  if (!demo) {
    console.error("[plant-a-l3] demo user missing — run the seed first");
    process.exit(1);
  }

  await db.note.deleteMany({ where: { userId: demo.id, title } });
  await db.note.create({
    data: {
      title,
      content: hostile,
      userId: demo.id,
    },
  });

  await db.$disconnect();
  console.log(`[plant-a-l3] hostile legacy note planted (db: ${process.env.DATABASE_URL})`);
}

void main();
