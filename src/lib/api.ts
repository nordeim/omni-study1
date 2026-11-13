// ---------------------------------------------------------------------------
// The client API seam. All views talk to the backend through here — never a
// bare fetch (AGENTS.md store rules). Unit-pinned by tests/api-timeout.test.ts
// (S13) and tests/api-offline.test.ts (S14).
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const OFFLINE_MESSAGE =
  "You appear to be offline. Reconnect and try again — your last action was not saved.";

/** S13: the AI surfaces' deadline classification (DOMException TimeoutError,
 *  the AbortSignal.timeout rejection reason). Anything else is not a timeout. */
export function isTimeoutError(err: unknown): boolean {
  return (
    err instanceof DOMException &&
    err.name === "TimeoutError"
  );
}

type SendOptions = { timeoutMs?: number };

async function doFetch(path: string, init: RequestInit): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(path, init);
  } catch (err: unknown) {
    // S14: classify the transport failure FIRST — but the timeout error
    // propagates UNWRAPPED so call sites' isTimeoutError branches keep working.
    if (isTimeoutError(err)) throw err;
    if (err instanceof TypeError) throw new ApiError(0, OFFLINE_MESSAGE);
    throw err;
  }
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body: unknown = await res.json();
      if (
        typeof body === "object" &&
        body !== null &&
        "error" in body &&
        typeof (body as { error: unknown }).error === "string"
      ) {
        message = (body as { error: string }).error;
      }
    } catch {
      // non-JSON error body — keep the generic message
    }
    throw new ApiError(res.status, message);
  }
  return res;
}

async function parse<T>(res: Response): Promise<T> {
  try {
    return (await res.json()) as T;
  } catch {
    // S148/CW3 (audit B-I2): a 2xx body that fails res.json() is a
    // server-side fault (garbage answered where JSON was promised) — the
    // thrown ApiError carried the SUCCESS status verbatim, honest to no
    // consumer that ever branches on err.status. 502 says what happened;
    // the human message is unchanged.
    throw new ApiError(502, "The server returned a malformed response.");
  }
}

// S130/CE1 — the DEFAULT deadline family (docs/remediation-plan-session130.md).
// The s130 FE audit's M1: the timeoutMs infrastructure existed (CD wired
// collection GETs at 20 s, CC the auth POSTs, S13 the AI surfaces) but every
// MUTATION write path rode no deadline — a stalled write (accepted TCP, no
// response — no offline event fires) latched every busy state (dialog Save
// spinners, the delete-account button, the upload button) with no error
// branch reachable until reload. The defaults install INSIDE the seam so
// all ~50 mutation call sites in data.ts plus the view-level twins inherit
// them at once; an explicit timeoutMs still wins (the AI surfaces' 120 s,
// the import POST's 120 s, the auth POSTs' 20 s).
export const DEFAULT_GET_TIMEOUT_MS = 20_000;
export const DEFAULT_WRITE_TIMEOUT_MS = 30_000;

export async function apiGet<T>(
  path: string,
  // S128/CC7: the apiSend mirror — the boot gate's `await apiGet("/api/auth/me")`
  // had no deadline, so a stalled connection (accepted TCP, no response — no
  // `offline` event fires) held the Splash spinner for the browser's own
  // connection timeout while the retry affordance sat in the gate's error
  // branch, unreachable.
  options?: { timeoutMs?: number },
): Promise<T> {
  const init: RequestInit = { method: "GET" };
  // S130/CE1: the default GET deadline (the CD2 collection constant's value).
  init.signal = AbortSignal.timeout(options?.timeoutMs ?? DEFAULT_GET_TIMEOUT_MS);
  const res = await doFetch(path, init);
  return parse<T>(res);
}

export async function apiSend<T = unknown>(
  method: "POST" | "PATCH" | "PUT" | "DELETE",
  path: string,
  body?: unknown,
  options?: SendOptions,
): Promise<T> {
  const init: RequestInit = { method };
  if (body !== undefined) {
    if (body instanceof FormData) {
      // S180/ED: the multipart branch — the BROWSER owns the boundary
      // (Content-Type carries the random delimiter; a hand-set
      // application/json header would break the multipart envelope, and
      // setting multipart/form-data manually without the boundary breaks
      // it too). No header override at all: fetch derives it from the
      // FormData object.
      init.body = body;
    } else {
      init.headers = { "Content-Type": "application/json" };
      init.body = JSON.stringify(body);
    }
  }
  // S130/CE1: the default WRITE deadline — every mutation call site that
  // passes no options inherits the 30 s bound (a stalled write rejects
  // through the existing catch paths instead of latching the busy state).
  init.signal = AbortSignal.timeout(options?.timeoutMs ?? DEFAULT_WRITE_TIMEOUT_MS);
  const res = await doFetch(path, init);
  return parse<T>(res);
}
