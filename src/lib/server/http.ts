// ---------------------------------------------------------------------------
// The HTTP layer seam: error responses, the error→status mapper, the
// authed-handler wrappers, the entity CRUD route factories, and the
// download-header builder. Route files stay 3-line shells over the
// factories (AGENTS.md "API pattern").
//
// Error contract (PAD §6.2): Zod → 400, Prisma P2002 → 409, P2025 → 404,
// unauthed → 401, body-too-large → 413 (S129/CD4's BodyTooLargeError — a
// subclass of ValidationError, checked FIRST), unknown → 500 with the
// detail logged server-side ONLY (the response never carries a stack or
// provider message).
// ---------------------------------------------------------------------------

import { NextResponse, type NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { ExportTooLargeError } from "@/lib/data-export";

import { checkRateLimit } from "@/lib/auth";
import type { ZodError, ZodType } from "zod";

import type { SessionUser } from "./auth";
import { requireUser } from "./auth";

// ---- typed control-flow errors -----------------------------------------------

/** Thrown by the auth seam; mapped to 401 by the wrappers below. */
export class UnauthorizedError extends Error {
  constructor() {
    super("Authentication required.");
    this.name = "UnauthorizedError";
  }
}

/** Thrown by the delegates' ownership pre-check; mapped to 404. */
export class NotFoundError extends Error {
  constructor(message = "That record does not exist.") {
    super(message);
    this.name = "NotFoundError";
  }
}

/** Thrown by parseWith; carries the Zod issues for the 400 message. */
export class ValidationError extends Error {
  issues: ZodError["issues"];
  constructor(message: string, issues: ZodError["issues"] = []) {
    super(message);
    this.name = "ValidationError";
    this.issues = issues;
  }
}

/** Format the first Zod issue: `field: message` (the refine copies carry no
 *  path and surface verbatim — the schemas' messages ARE the copy). */
function formatZodError(error: ZodError): string {
  const issue = error.issues[0];
  if (!issue) return "Invalid request.";
  const path = issue.path.join(".");
  return path.length > 0 ? `${path}: ${issue.message}` : issue.message;
}

// ---- responses -----------------------------------------------------------------

export function errorResponse(status: number, message: string): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export function rateLimitedResponse(
  retryAfterSec: number,
  message: string,
): NextResponse {
  return NextResponse.json(
    { error: message },
    { status: 429, headers: { "Retry-After": String(Math.max(1, retryAfterSec)) } },
  );
}

/**
 * S125/BZ8: the file-item METADATA select — the shared shape for the files
 * LIST + BOTH create branches (files POST's JSON link leg AND files/link).
 * S82/AI6's contract: "the base64 `data` column never rides a JSON response
 * body" — bytes go through the per-file download endpoint. The constant
 * moved here from files/route.ts because route files cannot export shared
 * symbols (Next validates route module exports) and files/link had drifted
 * to the FULL row. Route files cannot export shared symbols (Next's
 * route-type validation), so it lives beside buildContentDisposition.
 */
export const FILE_METADATA = {
  id: true,
  userId: true,
  name: true,
  mime: true,
  size: true,
  url: true,
  folderId: true,
  createdAt: true,
  updatedAt: true,
} as const;

/** S133/CH9: the per-file upload ceiling, moved here from files/route.ts —
 * the same S125/BZ8 rule that moved FILE_METADATA (route files cannot
 * export shared symbols; the route was the only exporter and the client
 * twin in files-view.tsx carries a documented mirror). */
export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024; // 2 MiB

/** S146/CU1 (audit B-M1): the multipart upload door's mime cap — the
 * import door's mirror (data-import.ts caps the identical column at
 * "files.mime": 100 with the printable-ASCII charset guard, the CE7
 * bloat class: a poisoned oversized mime rides FILE_METADATA into EVERY
 * files list GET). The interactive door stored `entry.type` verbatim, so
 * a hand-crafted multipart body could write an unbounded mime per row.
 * The admitted set mirrors the import door exactly: printable ASCII
 * (0x20–0x7E); EMPTY still passes (the unknown-type "" shape keeps the
 * route's octet-stream fallback — a legit mime is never non-ASCII per
 * the type/subtype grammar). The charset half is belt-and-suspenders
 * against parser/runtime divergence: undici's formData parser sanitizes
 * the charset family before the route sees it (the drive probes), the
 * same posture as downloadHeaders' clamp standing behind the import
 * guard. */
export const UPLOAD_MIME_MAX_CHARS = 100;

/** See UPLOAD_MIME_MAX_CHARS — the admission predicate (length + charset). */
export function isPrintableAsciiMime(type: string): boolean {
  return type.length <= UPLOAD_MIME_MAX_CHARS && /^[\x20-\x7E]*$/.test(type);
}

/** Parse a request body through its Zod schema; failure → ValidationError. */
export function parseWith<T>(schema: ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new ValidationError(formatZodError(result.error), result.error.issues);
  }
  return result.data;
}

/** The shared JSON body cap (S118/BS2). 10 MiB (the import route alone
 *  carries the higher IMPORT_MAX_BYTES ceiling — 64 MiB since S137/CL2,
 *  the export/import reconciliation; every other JSON route keeps this
 *  shared cap; the import route's own catch answers its route-specific
 *  copy). The largest legitimate JSON body is the math solver's
 *  photographed-problem image (base64, schema-bounded at 7,000,000 chars);
 *  everything else is bounded
 *  far below. The cap converts an unbounded request.text() into a bounded
 *  read (memory) with an actionable 413 (S129/CD4 corrected the status: the
 *  same fault answered 400 here but 413 on the import route — 413 is the
 *  correct signal, and no retry fixes too-large). */
const JSON_BODY_MAX_BYTES = 10 * 1024 * 1024;

/** S129/CD4 — the oversized-body error. A ValidationError SUBCLASS (the
 *  family shape the existing pins assert holds) that toErrorResponse maps
 *  to 413 — the semantically correct status for a body the server will not
 *  read, matching the import route's own over-cap contract. */
export class BodyTooLargeError extends ValidationError {
  constructor(message = "The request body is too large.") {
    super(message);
    this.name = "BodyTooLargeError";
  }
}

/** S148/CW2 (audit B-L3) → S156/DE1: the over-ceiling EXPORT error —
 *  MOVED to the pure seam (src/lib/data-export.ts, beside the ceiling
 *  family it belongs to: EXPORT_MAX_BYTES + exportOverCeiling + the
 *  throw), because the S156/DE1 streaming driver (pure, browser-safe,
 *  import-free) now owns the gate and must throw it without importing
 *  server/ code. Re-exported HERE so every existing consumer (the
 *  /export page's catch, toErrorResponse's instanceof below) keeps its
 *  import green — same class object, same 413 mapping, same `bytes`
 *  payload. NOT a ValidationError subclass (the body was never read from
 *  the client — this is a response-size refusal, the request itself was
 *  fine), so it maps straight to the 413 family with the
 *  database-file remedy. */
export { ExportTooLargeError };

/** The BR5 Content-Type policy as a shared seam (S119/BT1a): a non-JSON
 * Content-Type is unparseable-by-policy — a form POST with `text/plain`
 * (which bypasses the CORS/preflight reasoning behind the sameSite=lax
 * CSRF mitigation) must not reach a JSON parser. Extracted so BOTH JSON
 * body readers (readJson here + the import route's own read, which keeps
 * its 413 response contract) enforce the identical gate. The app's own
 * client sets `Content-Type: application/json` on every JSON call
 * (src/lib/api.ts). An ABSENT Content-Type passes (the historical
 * curl/undici shape — the app's own e2e POSTs and Node fetches). */
export function assertJsonContentType(request: NextRequest | Request): void {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType !== "" && !contentType.toLowerCase().includes("application/json")) {
    throw new ValidationError("The request body must be valid JSON.");
  }
}

/** The counting reader's byte core (S119/BT2): reads a request body
 * chunk-by-chunk with a running byte count and ABORTS at the cap — a
 * `Transfer-Encoding: chunked` request (no Content-Length) is counted AS
 * it is read, never buffered past the cap (the BS2 pre-read check was
 * inert on chunked bodies; the post-read check fired only after
 * request.text() had already buffered everything). Returns the RAW bytes —
 * multipart bodies carry arbitrary binary that a text decode would corrupt
 * (invalid UTF-8 sequences collapse to U+FFFD); text consumers use the
 * readBodyCapped wrapper. */
export async function readBytesCapped(
  request: NextRequest | Request,
  maxBytes: number,
): Promise<Uint8Array> {
  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new BodyTooLargeError();
  }
  const body = request.body;
  if (!body) return new Uint8Array(0);
  const reader = body.getReader();
  let received = 0;
  const chunks: Uint8Array[] = [];
  let oversized = false;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        received += value.byteLength;
        if (received > maxBytes) {
          oversized = true;
          break; // stop walking the stream at the cap — never buffer past it
        }
        chunks.push(value);
      }
    }
  } finally {
    // Release the lock whether we finished or aborted at the cap; cancelling
    // signals the producer to stop generating the rest of the body.
    await reader.cancel().catch(() => {});
  }
  if (oversized) {
    throw new BodyTooLargeError();
  }
  const out = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return out;
}

/** The counting reader's text form (S119/BT2) — the JSON body path. Multi-
 *  byte codepoints split across chunks decode correctly. */
export async function readBodyCapped(
  request: NextRequest | Request,
  maxBytes: number,
): Promise<string> {
  const bytes = await readBytesCapped(request, maxBytes);
  if (bytes.byteLength === 0) return "";
  return new TextDecoder().decode(bytes);
}

/** Read a JSON body defensively (malformed JSON → the caller's 400 path).
 * S117/BR5 (via assertJsonContentType): a non-JSON Content-Type never
 * reaches the parser.
 * S118/BS2: the body is capped at JSON_BODY_MAX_BYTES — the declared
 * Content-Length pre-read AND the actual length, now through the counting
 * reader (S119/BT2) so chunked bodies are bounded during the read too. */
export async function readJson(request: NextRequest): Promise<unknown> {
  assertJsonContentType(request);
  const text = await readBodyCapped(request, JSON_BODY_MAX_BYTES);
  if (text.length === 0) return {};
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new ValidationError("The request body is not valid JSON.");
  }
}

// ---- the error mapper ------------------------------------------------------------

export function toErrorResponse(err: unknown): NextResponse {
  if (err instanceof UnauthorizedError) {
    return errorResponse(401, err.message);
  }
  // S129/CD4: the subclass checks FIRST (a BodyTooLargeError IS a
  // ValidationError — the generic 400 branch must not shadow the 413).
  if (err instanceof BodyTooLargeError) {
    return errorResponse(413, err.message);
  }
  // S148/CW2 (audit B-L3): the export ceiling — the shared
  // renderExportEnvelope seam throws this when the serialized envelope
  // exceeds EXPORT_MAX_BYTES (256 MiB, 4x the import restore cap). The
  // CU3 discrimination shape: the typed over-cap error answers the
  // honest 413 with the actionable remedy (the database file itself is
  // the full-fidelity backup path past the ceiling — DEPLOYMENT.md §4),
  // never the opaque 500 a raw throw would surface through the
  // unknown-error branch below.
  if (err instanceof ExportTooLargeError) {
    return errorResponse(
      413,
      "That export is too large to build in one pass (over 256 MB). Delete unused files — the heaviest collection — and retry, or copy the database file directly (see docs/DEPLOYMENT.md §4).",
    );
  }
  if (err instanceof ValidationError) {
    return errorResponse(400, err.message);
  }
  if (err instanceof NotFoundError) {
    return errorResponse(404, err.message);
  }
  // S143/CR1 (audit B-L1, the shared BT1b leg): the import route has
  // carried this leg locally since S119/BT1b, but every OTHER route's
  // latent Zod↔Prisma shape drift answered the opaque 500 (with
  // unhandled-error log noise) — the malformed-request family is the
  // honest 400, never 500. The own-keys guard in sentKeysPatch closes
  // the reachable vector; this leg closes the latent drift class for
  // every route in one place.
  // S144/CS7 (audit A-L2): the leg LOGS before answering — the drift
  // family is a SERVER-side bug (the comment's own target), and the
  // silent 400 cost the operator the only production signal that a
  // route was mis-shaping writes (the unknown-error branch this
  // pre-empts logs; the client still gets the honest 400 — the log is
  // for the operator, never the response).
  if (err instanceof Error && err.name === "PrismaClientValidationError") {
    console.error("[api] prisma validation error:", err);
    return errorResponse(
      400,
      "That request contained fields the server could not accept. Try refreshing and re-submitting.",
    );
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return errorResponse(409, "That record already exists.");
    }
    if (err.code === "P2025") {
      return errorResponse(404, "That record does not exist.");
    }
    if (err.code === "P2003") {
      return errorResponse(400, "That record references something that does not exist.");
    }
    // S137/CL10 (audit A-L2) + S138/CM4 (Mode-C F2 + AI-6): the
    // interactive-transaction timeout — a LEGAL body (under the byte cap)
    // can carry enough rows that the time budget binds (the import
    // restore's 60 s window; the many-rows tail). The rollback HOLDS
    // (Prisma rolls the transaction back on the timeout) — the honest 413
    // framing with the actionable remedy, never the opaque 500 (the app's
    // established too-large status, the BodyTooLargeError precedent).
    // The copy is SOURCE-NEUTRAL: this mapper is shared by every route,
    // and P2028's sources include the retention-trim transactions
    // (ai/chat, math/solve, rum, calculator/history) and the merge guards
    // beside the import route — the import-specific "split the backup"
    // remedy lives in the import route's own catch, pinned by census.
    if (err.code === "P2028") {
      return errorResponse(
        413,
        "That request was too large or slow to complete in one pass and was fully rolled back. Try again, or split the work into smaller passes.",
      );
    }
  }
  // Unknown → 500; the detail is logged server-side only (never the body).
  console.error("[api] unhandled error:", err);
  return errorResponse(500, "Something went wrong. Please try again.");
}

// ---- the authed-handler wrappers ---------------------------------------------------

type AuthedHandler = (
  user: SessionUser,
  request: NextRequest,
) => Promise<NextResponse | Response>;

/** Wrap a context-less route handler with the requireUser gate + error map. */
export function withUser(handler: AuthedHandler) {
  return async (request: NextRequest): Promise<Response> => {
    try {
      const user = await requireUser();
      return await handler(user, request);
    } catch (err: unknown) {
      return toErrorResponse(err);
    }
  };
}

type ItemRouteContext = { params: Promise<{ id: string }> };
type AuthedItemHandler = (
  user: SessionUser,
  request: NextRequest,
  id: string,
) => Promise<NextResponse | Response>;

/** Wrap an item route handler (Next 15+/16: params arrive as a Promise). */
export function withUserParams(handler: AuthedItemHandler) {
  return async (request: NextRequest, context: ItemRouteContext): Promise<Response> => {
    try {
      // S152/DA4 (audit B-L1): the auth gate fires FIRST — the 401
      // envelope answers every unauthenticated path, malformed id
      // included (the wrapper's own "unauthenticated requests still
      // 401" contract, previously false on this path: the CN11 bound
      // below answered 404 to unauthenticated >64-char ids). The
      // no-oracle 404 semantics for authed callers are unchanged.
      const user = await requireUser();
      const { id } = await context.params;
      // S139/CN11 (audit B-L1): the route-param id honors the same 64-char
      // bound the body atoms enforce (validation.ts idField) — an 8 KB
      // path segment previously reached the delegate's findFirst verbatim
      // (Prisma parameterizes, so no injection — purely the inconsistency;
      // a >64-char id cannot exist, so the honest status is the no-oracle
      // 404, identical to a missing row).
      if (id.length === 0 || id.length > 64) {
        throw new NotFoundError();
      }
      return await handler(user, request, id);
    } catch (err: unknown) {
      return toErrorResponse(err);
    }
  };
}

// ---- the CRUD route factories -------------------------------------------------------

export type EntityDelegate = {
  list: (userId: string) => Promise<unknown[]>;
  create: (userId: string, input: unknown) => Promise<unknown>;
  update: (userId: string, id: string, input: unknown) => Promise<unknown>;
  remove: (userId: string, id: string) => Promise<unknown>;
};

/** Collection routes: GET list + POST create. */
export function makeCollectionRoutes(delegate: EntityDelegate) {
  const GET = withUser(async (user) => {
    const rows = await delegate.list(user.id);
    return NextResponse.json(rows);
  });
  const POST = withUser(async (user, request) => {
    // S125/BZ5: the shared write budget — every makeCollectionRoutes
    // create (16 routes) rides `write:${user.id}` 600/15-min. Before this,
    // only login-family, upload, AI, export/import, and rum were
    // throttled: an authenticated script grew the single-node SQLite at
    // line rate (the exact rationale S118/BS3 documented for uploads;
    // noteSchema.content alone is 100 KB/row). 600 ≈ 40 sustained
    // writes/min — 12x the heaviest realistic human burst; a flooding
    // script consumes it in seconds. After auth, BEFORE readJson (the C1
    // convention: the limiter never parses a flooded body); unauthenticated
    // requests still 401. S127/CB7: PATCH/DELETE now ride the SAME shared
    // bucket (makeItemRoutes below) — the one-budget-per-user posture.
    const limit = checkRateLimit(`write:${user.id}`, 600);
    if (!limit.ok) {
      return rateLimitedResponse(
        limit.retryAfterSec,
        "Too many requests. Please slow down.",
      );
    }
    const row = await delegate.create(user.id, await readJson(request));
    return NextResponse.json(row, { status: 201 });
  });
  return { GET, POST };
}

/** Item routes: PATCH update + DELETE remove.
 * S127/CB7: both mutations join the SHARED write budget (`write:${user.id}`
 * 600/15-min) — the BZ5 collection-POST budget's documented next-cycle
 * candidate, closed. Before this, an authenticated script could churn
 * PATCH/DELETE at line rate (bounded only by existing rows, but unbounded
 * in REQUEST rate — the same single-node SQLite exposure). After auth,
 * BEFORE readJson (the C1 convention: the limiter never parses a flooded
 * body); unauthenticated requests still 401. ONE bucket per user across
 * all write endpoints — a flooded leg exhausts the whole write budget,
 * which is exactly the point. */
export function makeItemRoutes(delegate: EntityDelegate) {
  const PATCH = withUserParams(async (user, request, id) => {
    const limit = checkRateLimit(`write:${user.id}`, 600);
    if (!limit.ok) {
      return rateLimitedResponse(
        limit.retryAfterSec,
        "Too many requests. Please slow down.",
      );
    }
    const row = await delegate.update(user.id, id, await readJson(request));
    return NextResponse.json(row);
  });
  const DELETE = withUserParams(async (user, _request, id) => {
    const limit = checkRateLimit(`write:${user.id}`, 600);
    if (!limit.ok) {
      return rateLimitedResponse(
        limit.retryAfterSec,
        "Too many requests. Please slow down.",
      );
    }
    await delegate.remove(user.id, id);
    return NextResponse.json({ ok: true });
  });
  return { PATCH, DELETE };
}

// ---- the download-header builder (S13-C3) --------------------------------------------

/**
 * Content-Disposition for downloads: an ASCII-safe quoted fallback
 * (RFC 2183 — quotes/backslashes/non-ASCII neutralized, never terminated
 * early) plus the RFC 5987 extended form `filename*=UTF-8''…` carrying the
 * exact original name percent-encoded. The quoted form NEVER carries raw
 * percent-encoding of a unicode name (the historical bug: browsers saved
 * the literal "%D1%84..." filename).
 */
export function buildContentDisposition(filename: string): string {
  const safe = filename.trim().length > 0 ? filename : "download";
  const fallback = safe
    .replace(/[^\x20-\x7E]/g, "_")
    .replace(/["\\]/g, "_");
  const extended = encodeURIComponent(safe);
  return `attachment; filename="${fallback}"; filename*=UTF-8''${extended}`;
}

// ---- shared download-header sets -------------------------------------------------------

/** The S13/S14 download contract: attachment + nosniff + private no-store. */
export function downloadHeaders(filename: string, contentType: string): HeadersInit {
  // S144/CS4 (audit B-L1, probed): the Content-Type value can carry
  // STORED data (the files/[id] download passes files.mime — a column
  // the import door once admitted with control characters). Node/undici
  // THROWS on CR/LF in header VALUES at Response construction (the
  // 500-on-read taxonomy break), so the builder clamps the value to
  // printable ASCII — belt-and-suspenders for any pre-fix stored row
  // (the import door now rejects the charset at the boundary); the
  // throw always failed closed, so this was never a header-injection
  // vector, only a 500-on-read one. The all-control shape falls back to
  // the generic binary type (an empty Content-Type is not constructable
  // advice either). The export/rum callers pass literals — unaffected.
  const safeContentType =
    contentType.replace(/[^\x20-\x7E]/g, "") || "application/octet-stream";
  return {
    "Content-Type": safeContentType,
    "Content-Disposition": buildContentDisposition(filename),
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "private, no-store",
  };
}
