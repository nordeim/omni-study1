// Pure text seams. S77/AD7: the note list row renders a plain-text preview
// of the note's HTML content (the Quill editor persists HTML — measured on
// the reference: "<p><strong>Probe paragraph one.</strong></p>").
// S78/AE5 hardening: the entity decoder now covers the forms Quill actually
// emits (numeric decimal/hex + the common named typography entities), and
// the cap slices by CODE POINT so an emoji straddling the cap can never
// split into a replacement character.

/** Decoded form of the entities Quill emits in note HTML. */
const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&apos;": "'",
  "&#39;": "'",
  "&nbsp;": " ",
  "&ldquo;": "“",
  "&rdquo;": "”",
  "&lsquo;": "‘",
  "&rsquo;": "’",
  "&hellip;": "…",
  "&mdash;": "—",
  "&ndash;": "–",
};

const NAMED_ENTITY = /&(?:[a-z]+|#\d+|#x[0-9a-f]+);/gi;

/** Decode one entity token (named, decimal numeric, or hex numeric). */
function decodeEntity(match: string): string {
  const lower = match.toLowerCase();
  if (ENTITIES[lower] !== undefined) return ENTITIES[lower];
  const body = lower.slice(1, -1); // strip & and ;
  const code =
    body.startsWith("#x") || body.startsWith("#X")
      ? Number.parseInt(body.slice(2), 16)
      : body.startsWith("#")
        ? Number.parseInt(body.slice(1), 10)
        : Number.NaN;
  if (!Number.isInteger(code) || code < 1 || code > 0x10ffff) return match;
  return String.fromCodePoint(code);
}

/**
 * Reduce an HTML string (note content) to a readable single-line preview:
 * tags stripped, block boundaries joined with a space, whitespace collapsed,
 * entities decoded (named + numeric), length capped by CODE POINT with an
 * ellipsis. Plain-text content (legacy notes) passes through unchanged.
 */
export function stripHtmlPreview(html: string, max = 60): string {
  const withoutTags = html
    .replace(/<[^>]+>/g, " ")
    .replace(NAMED_ENTITY, decodeEntity);
  const collapsed = withoutTags.replace(/\s+/g, " ").trim();
  // Code-point-aware cap: slice on Array.from so a surrogate pair at the
  // boundary is either kept whole or dropped whole — never split.
  const chars = Array.from(collapsed);
  if (chars.length <= max) return collapsed;
  return `${chars.slice(0, Math.max(0, max - 1)).join("").trimEnd()}…`;
}
