// ---------------------------------------------------------------------------
// /api/exams/[id] — the ownership-scoped item routes (PATCH + DELETE) over
// the delegate factory. The delegate verifies ownership BEFORE mutating.
// ---------------------------------------------------------------------------

import { makeItemRoutes } from "@/lib/server/http";
import { examDelegate } from "@/lib/server/entities";

export const { PATCH, DELETE } = makeItemRoutes(examDelegate);
