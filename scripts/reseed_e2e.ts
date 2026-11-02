// E2E fixture reset — deletes the demo user (and its cascading rows) from
// the ISOLATED e2e database. S131/CF3: this script used to construct a bare
// `new PrismaClient()`, so under Bun's `.env` auto-load it resolved
// DATABASE_URL="file:../db/custom.db" and deleted the operator's DEV
// workspace data. The target is now HARD-SET to the e2e scratch database
// before the client construction — the dev database is unreachable from
// this script — and the resolved absolute path is printed before deleting.
import { PrismaClient } from "@prisma/client";
import path from "node:path";

process.env.DATABASE_URL = "file:../db/e2e.db";

async function main() {
  const db = new PrismaClient();
  try {
    console.log(`[reseed_e2e] target: ${path.resolve(process.cwd(), "db/e2e.db")}`);
    const user = await db.user.findUnique({ where: { email: "demo@studyflow.app" } });
    if (user) {
      await db.user.delete({ where: { id: user.id } });
      console.log("user deleted — cascading rows gone");
    } else {
      console.log("no user");
    }
  } finally {
    await db.$disconnect();
  }
}
main();
