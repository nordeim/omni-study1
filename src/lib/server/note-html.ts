/**
 * The server-side note-HTML sanitizer (S140/CO1 — the A-L3 deferral,
 * closed; S141/CP2/CP5 re-tuned). sanitize-html 2.18 configured FROM the
 * shared policy module (`src/lib/note-html.ts`), so the server write gate
 * and the browser render gate enforce the SAME allowlist — including the
 * S141 shared constants (the raster-only image MIME pattern, the style
 * VALUE grammar) that both doors import rather than re-declare.
 *
 * WHERE this runs (the load-bearing placement): `validation.ts` and
 * `data-import.ts` are client-imported, so the sanitizer lives here —
 * a server-only seam consumed by exactly two doors:
 *   1. the note delegate's writeTransform (src/lib/server/entities.ts) —
 *      every POST/PATCH /api/notes write;
 *   2. the import route's pre-transaction sanitize pass
 *      (src/app/api/import/data/route.ts) — the raw-Prisma-tx door the
 *      delegate's hook cannot reach.
 * The browser render gate (quill-editor) covers pre-fix legacy rows with
 * the DOM walk from the same policy module.
 *
 * WHY an allowlist (not a strip-list): Quill's Delta round-trip already
 * drops scripts and handlers, but its Image/Video/Link blots keep REMOTE
 * urls alive — the tracking-pixel / remote-iframe / click-beacon class
 * survives "Quill filtering". The allowlist is also lossless by
 * construction: everything it strips is markup the 20-control snow
 * toolbar can never author (the BW10 image gate emits data: urls only).
 *
 * S141/CP2 — the plain-text first line: `looksLikeHtml` gates the
 * sanitize-html call itself. The S140 door ran it unconditionally and its
 * parser re-serialized text nodes with entity encoding — a plain-text
 * note containing & or < was silently rewritten ("AT&T" → "AT&amp;T") and
 * the entities rendered as visible text through quill.setText. Plain
 * text now passes through byte-identically at BOTH doors (the DOM gate's
 * own contract); markup rows still re-serialize canonically (text-node
 * entity escaping inside markup is HTML-correct and renders identically).
 */
import sanitizeHtml from "sanitize-html";

import {
  looksLikeHtml,
  NOTE_HTML_ALLOWED_ATTRS,
  NOTE_HTML_ALLOWED_TAGS,
  NOTE_HTML_CLASS_PATTERN,
  NOTE_HTML_IMAGE_MIME_PATTERN,
  NOTE_HTML_LINK_SCHEMES,
  NOTE_HTML_STYLE_PROPS,
  NOTE_HTML_STYLE_VALUE_PATTERN,
} from "../note-html";

const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [...NOTE_HTML_ALLOWED_TAGS],
  // Quill emits class on span/code (ql-* formats) and style on span (its
  // color/background pickers) — the attribute allowlist carries those.
  allowedAttributes: {
    a: [...NOTE_HTML_ALLOWED_ATTRS.a],
    img: [...NOTE_HTML_ALLOWED_ATTRS.img],
    span: [...NOTE_HTML_ALLOWED_ATTRS.span],
    code: [...NOTE_HTML_ALLOWED_ATTRS.code],
  },
  // Link schemes: Quill's toolbar vocabulary (http/https/mailto). tel/sms
  // never appear in toolbar-authored content, so the narrower set is
  // lossless — and the scheme gate kills javascript:/data:text/html.
  allowedSchemes: [...NOTE_HTML_LINK_SCHEMES],
  // Images are data: ONLY — the tracking-pixel class dies here (the BW10
  // authorship fact: editor images are always data: urls). S141/CP5: the
  // transformTags filter below additionally enforces the RASTER MIME set
  // (png/gif/jpeg/webp) — svg+xml is script-capable and text/html is not
  // an image at all, and the scheme gate alone accepted both.
  allowedSchemesByTag: { img: ["data"] },
  allowProtocolRelative: false,
  // The ql-* class namespace only (an arbitrary class is an injection
  // surface); keep the style gate to the editor's color properties.
  // S141/CP7: both consume the SHARED pattern/props from the policy
  // module — the inline re-declarations here could drift from the DOM
  // door's copy.
  allowedClasses: {
    span: [NOTE_HTML_CLASS_PATTERN],
    code: [NOTE_HTML_CLASS_PATTERN],
  },
  // S141/CP5: style VALUES join the property filter — the color grammar
  // (hex/rgb()/hsl()/named) kills url()/expression()/gradient() at the
  // VALUE level; the /.*/ wildcard the S140 config carried kept them.
  // S141/CP7: the property KEYS derive from the shared NOTE_HTML_STYLE_PROPS
  // (the DOM door reads the same list).
  allowedStyles: {
    span: Object.fromEntries(
      NOTE_HTML_STYLE_PROPS.map((prop) => [prop, [NOTE_HTML_STYLE_VALUE_PATTERN]]),
    ),
  },
  // Drop nothing silently at the top level: note bodies are inline flow.
  // (Mode note: "discard" drops the DISALLOWED TAG while keeping its
  // text/children — the container-unwrapping form, matching the DOM
  // gate's fragment-unwrapping behavior.)
  disallowedTagsMode: "discard",
  // S141/CP5: the img MIME enforcement + the anchor rel injection ride
  // transformTags (the pre-attribute-filter pass where a payload-level
  // rule can DROP an attribute rather than merely refuse to allow one).
  transformTags: {
    img: (tagName, attribs) => {
      const src = attribs.src ?? "";
      // Raster-only data: payload set (svg excluded). A src outside the
      // set is REMOVED (the element stays, alt text readable — the same
      // load-neutralization form the DOM gate uses).
      if (src.trim() && !NOTE_HTML_IMAGE_MIME_PATTERN.test(src.trim())) {
        delete attribs.src;
      }
      return { tagName, attribs };
    },
    a: (tagName, attribs) => ({
      tagName,
      attribs: { ...attribs, rel: "noopener noreferrer" },
    }),
  },
};

/**
 * Sanitize a note's HTML content against the shared policy. Plain text
 * (the demo seed's note bodies — and any note authored before the editor
 * round-tripped it into HTML) passes through BYTE-IDENTICALLY (the
 * S141/CP2 first line); hostile markup (scripts, handlers, remote
 * images, iframes, forms, svg) is neutralized; Quill's own authoring
 * vocabulary survives intact.
 */
export function sanitizeNoteHtml(html: string): string {
  if (!looksLikeHtml(html)) return html;
  return sanitizeHtml(html, OPTIONS);
}
