// ---------------------------------------------------------------------------
// GET /api/export/data — the full-data export (S21/ADR-019). The 20 content
// collections read in parallel (userId-scoped, chronological; cards scoped
// through their deck), assembled by the pure data-export seam into the
// versioned envelope, answered as a JSON attachment under the S13/S14
// download contract. The user block comes from requireUser's hashless
// session select — passwordHash is never read, and the seam strips it
// anyway (the double guard).
//
// S141/CP4: the 20-read assembly moved to the shared server seam
// (src/lib/server/export-build.ts) — the /export page renders the SAME
// envelope for the size signal, so the download and the warning can never
// drift apart (the BW8 single-source doctrine). The response carries
// X-Export-Bytes (the exact serialized size — observable by ops/e2e
// without parsing the body).
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";

import { checkRateLimit } from "@/lib/auth";
import { publicUser, requireUser } from "@/lib/server/auth";
import { renderExportEnvelope } from "@/lib/server/export-build";
import { downloadHeaders, rateLimitedResponse, toErrorResponse } from "@/lib/server/http";

export const GET = async () => {
  try {
    const user = await requireUser();

    // S124/BY5: the heaviest enumeration in the app (20 tables + base64
    // file payloads + the full in-memory JSON.stringify) answers a budgeted
    // 10/15-min — the S14 posture every other enumeration family already
    // carries. ONE shared `export:${user.id}` key covers both export GETs
    // (the ai: shared-key precedent): exhausting one route 429s the sibling.
    const limit = checkRateLimit(`export:${user.id}`, 10);
    if (!limit.ok) {
      return rateLimitedResponse(limit.retryAfterSec, "Too many export requests");
    }

    const { json, bytes } = await renderExportEnvelope(publicUser(user));

    const stamp = new Date().toISOString().slice(0, 10);
    return new NextResponse(json, {
      status: 200,
      headers: {
        ...downloadHeaders(`studyflow-data-${stamp}.json`, "application/json"),
        // S141/CP4 + S142/CQ2: the exact UTF-8 BYTE size of the body below
        // (the size-signal observable; the /export page renders the same
        // number for the panel's warning — bytes, not json.length: code
        // units under-report non-ASCII bodies up to 3x).
        "X-Export-Bytes": String(bytes),
      },
    });
  } catch (err: unknown) {
    return toErrorResponse(err);
  }
};
