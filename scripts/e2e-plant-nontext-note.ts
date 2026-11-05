/**
 * S143/CR2 evidence fixture — plants ONE "legacy" note row on the demo
 * user carrying the NON-TEXT family corpus (script/style/textarea/option/
 * xmp) beside the CONTAINER control family (noscript/template), the exact
 * asymmetry the cycle closed: pre-fix the non-text tags' TEXT survived the
 * DOM render door (unwrap) while the server write door killed it whole.
 *
 * Idempotent: deletes any prior fixture note (same distinctive title)
 * before creating it. Same env-pinning posture as the S140 plant
 * (DATABASE_URL must be set BEFORE the db module import).
 *
 * Usage: bun scripts/e2e-plant-nontext-note.ts
 *    or: DATABASE_URL="file:../db/custom.db" bun scripts/e2e-plant-nontext-note.ts
 */

process.env.DATABASE_URL ??= "file:../db/e2e.db";

async function main(): Promise<void> {
  const { db } = await import("../src/lib/db");

  const title = "CR2 non-text legacy note (door-policy fixture)";
  const content =
    "<p>Legacy row planted pre-fix — the two-door non-text policy:</p>" +
    '<script>alert("die-whole")</script>' +
    '<style>.steal{color:red}</style>' +
    "<textarea>ta-secret</textarea>" +
    "<option>opt-secret</option>" +
    "<xmp>xmp-secret</xmp>" +
    // The container control family — the UNCHANGED semantics (text
    // survives at both doors; the frame shows the contrast).
    "<noscript>noscript-kept</noscript>" +
    "<template>template-kept</template>" +
    "<p>end of the planted corpus</p>";

  const demo = await db.user.findUnique({ where: { email: "demo@studyflow.app" } });
  if (!demo) {
    console.error("[plant-cr2] demo user missing — run the seed first");
    process.exit(1);
  }

  await db.note.deleteMany({ where: { userId: demo.id, title } });
  await db.note.create({
    data: {
      title,
      content,
      userId: demo.id,
    },
  });

  await db.$disconnect();
  console.log(`[plant-cr2] non-text legacy note planted (db: ${process.env.DATABASE_URL})`);
}

void main();

// Module marker: the legacy plant script is a global script (no imports/
// exports) — two global `main()` declarations collide at TS2393 under the
// scripts/ include, so THIS file is a module instead.
export {};
