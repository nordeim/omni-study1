// ---------------------------------------------------------------------------
// The canonical public origin (README "Site", DEPLOYMENT.md §2, PAD env
// table). Single resolution point for metadata, sitemap.xml and robots.txt.
// Unit-pinned by tests/site.test.ts.
// ---------------------------------------------------------------------------

export const DEFAULT_SITE_URL = "http://localhost:3000";

/** Resolve the canonical origin: explicit override wins, then the env var;
 *  whitespace-trimmed, trailing-slash-stripped, empty-after-trim → default. */
export function siteUrl(override?: string): string {
  const raw = (override ?? process.env.NEXT_PUBLIC_SITE_URL ?? "").trim();
  if (!raw) return DEFAULT_SITE_URL;
  return raw.replace(/\/+$/, "") || DEFAULT_SITE_URL;
}
