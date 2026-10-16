// ---------------------------------------------------------------------------
// /api/grades — the ownership-scoped CRUD collection (GET list + POST create)
// over the delegate factory. Every query is scoped where:{userId} by the
// delegate; every payload passes its Zod schema.
// ---------------------------------------------------------------------------

import { makeCollectionRoutes } from "@/lib/server/http";
import { gradeDelegate } from "@/lib/server/entities";

export const { GET, POST } = makeCollectionRoutes(gradeDelegate);
