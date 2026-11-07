// ---------------------------------------------------------------------------
// GET /api/export/data — the full-data export (S21/ADR-019). The 20
// content collections (userId-scoped, chronological; cards scoped
// through their deck) assemble through the shared seam into the
// versioned envelope, answered as a JSON attachment under the S13/S14
// download contract. The user block comes from requireUser's hashless
// session select — passwordHash is never read, and the seam strips it
// anyway (the double guard).
//
// S141/CP4: the assembly lives in the shared server seam
// (src/lib/server/export-build.ts) — the /export page renders the SAME
// envelope for the size signal, so the download and the warning can
// never drift apart (the BW8 single-source doctrine). The response
// carries X-Export-Bytes (the exact serialized size — observable by
// ops/e2e without parsing the body).
//
// S156/DE1: the seam answers FRAGMENTS (the pure driver's streaming
// form — one collection's rows in memory at a time) and this route
// STREAMS them as the body (the I-A peak-memory fix — the build peak
// drops from ~3-4x the body to ~1x + one collection; the serve peak
// from 2-3x to ~1x). The wire is byte-identical to the materializing
// form (the unit oracle + the s21 raw-body pin + the s14/S139-CN2
// live round-trip weld it).
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
    // file payloads + the fragment-streamed serialization — S156/DE1)
    // answers a budgeted 10/15-min — the S14 posture every other
    // enumeration family already carries. ONE shared `export:${user.id}`
    // key covers both export GETs (the ai: shared-key precedent):
    // exhausting one route 429s the sibling.
    const limit = checkRateLimit(`export:${user.id}`, 10);
    if (!limit.ok) {
      return rateLimitedResponse(limit.retryAfterSec, "Too many export requests");
    }

    const { fragments, bytes } = await renderExportEnvelope(publicUser(user));

    const stamp = new Date().toISOString().slice(0, 10);
    // S156/DE1: the body STREAMS from the retained fragments — the
    // ordered chunks enqueue one-by-one and the response never joins
    // them into a second full-body string (serve-time peak ≈ 1x the
    // body + chunk transients, vs the materializing form's 2-3x). No
    // explicit Content-Length (chunked transfer — nothing pins it);
    // X-Export-Bytes below carries the exact size (the pinned contract).
    // ReadableStream + TextEncoder are globals — no new imports, no fs,
    // no import.meta wrappers (the S155 tracing lesson, honored).
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        for (const chunk of fragments) controller.enqueue(chunk);
        controller.close();
      },
    });
    return new NextResponse(stream, {
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
