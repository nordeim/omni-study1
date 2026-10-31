// ---------------------------------------------------------------------------
// The HTTP layer seam: error responses, the error→status mapper, the
// authed-handler wrappers, the entity CRUD route factories, and the
// download-header builder. Route files stay 3-line shells over the
// factories (AGENTS.md "API pattern").
//
// Error contract (PAD §6.2): Zod → 400, Prisma P2002 → 409, P2025 → 404,
// unauthed → 401, unknown → 500 with the detail logged server-side ONLY
// (the response never carries a stack or provider message).
// ---------------------------------------------------------------------------

import { NextResponse, type NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
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

/** Parse a request body through its Zod schema; failure → ValidationError. */
export function parseWith<T>(schema: ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new ValidationError(formatZodError(result.error), result.error.issues);
  }
  return result.data;
}

/** The shared JSON body cap (S118/BS2). 10 MiB — the same ceiling the import
 * route enforces (its own 413 contract predates this and stays). The largest
 * legitimate JSON body is the math solver's photographed-problem image
 * (base64, schema-bounded at 7,000,000 chars); everything else is bounded
 * far below. The cap converts an unbounded request.text() into a bounded
 * read (memory) with an actionable 400. */
const JSON_BODY_MAX_BYTES = 10 * 1024 * 1024;

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
    throw new ValidationError("The request body is too large.");
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
    throw new ValidationError("The request body is too large.");
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
  if (err instanceof ValidationError) {
    return errorResponse(400, err.message);
  }
  if (err instanceof NotFoundError) {
    return errorResponse(404, err.message);
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
      const { id } = await context.params;
      const user = await requireUser();
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
    const row = await delegate.create(user.id, await readJson(request));
    return NextResponse.json(row, { status: 201 });
  });
  return { GET, POST };
}

/** Item routes: PATCH update + DELETE remove. */
export function makeItemRoutes(delegate: EntityDelegate) {
  const PATCH = withUserParams(async (user, request, id) => {
    const row = await delegate.update(user.id, id, await readJson(request));
    return NextResponse.json(row);
  });
  const DELETE = withUserParams(async (user, _request, id) => {
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
  return {
    "Content-Type": contentType,
    "Content-Disposition": buildContentDisposition(filename),
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "private, no-store",
  };
}
