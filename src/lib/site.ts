// ---------------------------------------------------------------------------
// The canonical public origin (README "Site", DEPLOYMENT.md §2, PAD env
// table). Single resolution point for metadata, sitemap.xml and robots.txt.
// Unit-pinned by tests/site.test.ts.
// ---------------------------------------------------------------------------

export const DEFAULT_SITE_URL = "http://localhost:3000";

/** Resolve the canonical origin: explicit override wins, then the env var;
 *  whitespace-trimmed, trailing-slash-stripped, empty-after-trim → default.
 *  S131/CF10: a malformed env value (no scheme, no host) self-heals to the
 *  default too — siteUrl() feeds `new URL()` at layout module scope, and a
 *  bare "studyflow" used to throw there, 500-ing every route at evaluation
 *  (the sitemap's build-time consumption caught most cases first; this
 *  guards the runtime path). */
export function siteUrl(override?: string): string {
  const raw = (override ?? process.env.NEXT_PUBLIC_SITE_URL ?? "").trim();
  if (!raw) return DEFAULT_SITE_URL;
  const candidate = raw.replace(/\/+$/, "");
  if (!candidate || !URL.canParse(candidate)) return DEFAULT_SITE_URL;
  return candidate;
}
