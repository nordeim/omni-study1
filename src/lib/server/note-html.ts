/**
 * The server-side note-HTML sanitizer (S140/CO1 — the A-L3 deferral,
 * closed). sanitize-html 2.18 configured FROM the shared policy module
 * (`src/lib/note-html.ts`), so the server write gate and the browser
 * render gate enforce the SAME allowlist.
 *
 * WHERE this runs (the load-bearing placement): `validation.ts` and
 * `data-import.ts` are client-imported, so the sanitizer lives here —
 * a server-only seam consumed by exactly two doors:
 *   1. the note delegate's writeTransform (src/lib/server/entities.ts) —
 *      every POST/PATCH /api/notes write;
 *   2. the import route's write loop (src/app/api/import/data/route.ts) —
 *      the raw-Prisma-tx door the delegate's hook cannot reach.
 * The browser render gate (quill-editor) covers pre-fix legacy rows with
 * the DOM walk from the same policy module.
 *
 * WHY an allowlist (not a strip-list): Quill's Delta round-trip already
 * drops scripts and handlers, but its Image/Video/Link blots keep REMOTE
 * urls alive — the tracking-pixel / remote-iframe / click-beacon class
 * survives " Quill filtering". The allowlist is also lossless by
 * construction: everything it strips is markup the 20-control snow
 * toolbar can never author (the BW10 image gate emits data: urls only).
 */
import sanitizeHtml from "sanitize-html";

import { NOTE_HTML_ALLOWED_ATTRS, NOTE_HTML_ALLOWED_TAGS, NOTE_HTML_LINK_SCHEMES } from "../note-html";

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
  // authorship fact: editor images are always data: urls).
  allowedSchemesByTag: { img: ["data"] },
  allowProtocolRelative: false,
  // The ql-* class namespace only (an arbitrary class is an injection
  // surface); keep the style gate to the editor's color properties.
  allowedClasses: {
    span: [/^ql-[a-z0-9-]+$/],
    code: [/^ql-[a-z0-9-]+$/],
  },
  allowedStyles: {
    span: {
      color: [/.*/],
      "background-color": [/.*/],
    },
  },
  // Drop nothing silently at the top level: note bodies are inline flow.
  disallowedTagsMode: "discard",
};

/**
 * Sanitize a note's HTML content against the shared policy. Plain text
 * (the demo seed's note bodies — and any note authored before the editor
 * round-tripped it into HTML) passes through byte-identically; hostile
 * markup (scripts, handlers, remote images, iframes, forms, svg) is
 * neutralized; Quill's own authoring vocabulary survives intact.
 */
export function sanitizeNoteHtml(html: string): string {
  return sanitizeHtml(html, OPTIONS);
}
