// Pure text seams. S77/AD7: the note list row renders a plain-text preview
// of the note's HTML content (the Quill editor persists HTML — measured on
// the reference: "<p><strong>Probe paragraph one.</strong></p>").

/** Decoded form of the entities Quill emits in note HTML. */
const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&nbsp;": " ",
};

/**
 * Reduce an HTML string (note content) to a readable single-line preview:
 * tags stripped, block boundaries joined with a space, whitespace collapsed,
 * common entities decoded, length capped with an ellipsis. Plain-text
 * content (legacy notes) passes through unchanged.
 */
export function stripHtmlPreview(html: string, max = 60): string {
  const withoutTags = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;|&lt;|&gt;|&quot;|&#39;|&nbsp;/g, (m) => ENTITIES[m] ?? m);
  const collapsed = withoutTags.replace(/\s+/g, " ").trim();
  if (collapsed.length <= max) return collapsed;
  return `${collapsed.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}
