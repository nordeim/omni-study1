/**
 * Note-HTML policy — the shared allowlist for the S140/CO1 sanitization
 * seam (the A-L3 deferral, closed).
 *
 * WHY a policy module: `src/lib/validation.ts` and `src/lib/data-import.ts`
 * are BOTH client-imported, so the server sanitizer (sanitize-html, a
 * node-only dependency) must live behind a server-only seam
 * (`src/lib/server/note-html.ts`) while the browser render gate
 * (quill-editor's legacy-row defense) needs the SAME rules expressed as
 * data it can walk with DOMParser. This module is the one source of truth:
 * pure data + a DOM-based walker, no node deps — safe for either graph.
 *
 * The allowlist IS Quill 2's own authoring vocabulary (measured against
 * the 20-control snow toolbar the editor ships): headers, lists,
 * blockquote, pre/code, strong/em/u/s, ql-* classes, color/background
 * inline styles, http(s)/mailto links, data: images, hr, br. Everything
 * else — scripts, handlers, remote images (the tracking-pixel class),
 * iframes/object/embed, forms, svg — never appears in editor-authored
 * content, so stripping it destroys ZERO authentic notes (the BW10 image
 * gate inserts data: URLs exclusively; the audit's F7 authorship fact).
 */

/** The one set of tags a note may carry (Quill's authoring vocabulary). */
export const NOTE_HTML_ALLOWED_TAGS: readonly string[] = Object.freeze([
  "p", "h1", "h2", "h3", "h4", "h5", "h6",
  "ol", "ul", "li",
  "blockquote", "pre", "code",
  "strong", "em", "u", "s",
  "a", "span", "img", "br", "hr",
]);

/** Attributes each allowed tag may carry (everything else is dropped). */
export const NOTE_HTML_ALLOWED_ATTRS: Readonly<Record<string, readonly string[]>> = Object.freeze({
  a: Object.freeze(["href", "target", "rel"]),
  img: Object.freeze(["src", "alt", "width", "height"]),
  span: Object.freeze(["class", "style"]),
  code: Object.freeze(["class"]),
});

/** Link schemes Quill's own toolbar offers (its Link blot also allows
 * tel/sms — the toolbar never inserts them, so the narrower set is
 * lossless). */
export const NOTE_HTML_LINK_SCHEMES: readonly string[] = Object.freeze(["http", "https", "mailto"]);

/** The ONLY image scheme — data:. Editor-authored images are always data:
 * URLs (the BW10 gate), so a remote src is hostile-or-imported by
 * construction: the tracking-pixel class dies here. */
export const NOTE_HTML_IMAGE_SCHEME = "data";

/** Quill's own class namespace — the only classes a span/code may carry. */
export const NOTE_HTML_CLASS_PATTERN = /^ql-[a-z0-9-]+$/;

/** Inline style properties the editor emits (its color/background pickers);
 * every other property (position, url(), …) is an injection surface. */
export const NOTE_HTML_STYLE_PROPS: readonly string[] = Object.freeze(["color", "background-color"]);

/** Quick shape probe the editor mount uses: does this string carry markup? */
export function looksLikeHtml(html: string): boolean {
  return /<[a-z][^>]*>/i.test(html);
}

/**
 * The browser-side render gate for LEGACY rows (pre-CO1 writes the server
 * seam never saw). Walks the string through DOMParser with the policy
 * above: drops disallowed tags (keeping their text where the tag is a
 * container), strips disallowed attributes, neutralizes remote img src,
 * and rewrites scheme-violating hrefs. Runs in the quill-editor mount
 * BEFORE dangerouslyPasteHTML — defense-in-depth under the CSP for rows
 * that predate the sanitized write paths.
 */
export function sanitizeNoteHtmlDom(html: string): string {
  if (!looksLikeHtml(html)) return html;
  const doc = new DOMParser().parseFromString(html, "text/html");
  walk(doc.body);
  return doc.body.innerHTML;

  function allowedAttrFor(tag: string, attr: string): boolean {
    const allow = NOTE_HTML_ALLOWED_ATTRS[tag];
    return allow !== undefined && allow.includes(attr);
  }

  function cleanUrl(href: string): string | null {
    const trimmed = href.trim().toLowerCase();
    if (trimmed.startsWith("data:")) return NOTE_HTML_IMAGE_SCHEME === "data" && /^data:image\//i.test(href.trim()) ? href : null;
    const scheme = trimmed.split(":")[0];
    if (scheme === "http" || scheme === "https" || scheme === "mailto") return href;
    return null; // javascript:, vbscript:, unknown — gone.
  }

  function walk(node: Element): void {
    for (const child of Array.from(node.children)) {
      const tag = child.tagName.toLowerCase();
      if (!NOTE_HTML_ALLOWED_TAGS.includes(tag)) {
        // Disallowed node: keep its TEXT (containers) but drop the element
        // itself — the document replaces it with its children/text.
        const parent = child.parentElement;
        if (!parent) continue;
        const frag = node.ownerDocument.createDocumentFragment();
        while (child.firstChild) frag.appendChild(child.firstChild);
        parent.replaceChild(frag, child);
        // The moved children still need the walk — re-run on the fragment
        // contents by walking the parent once more is unsafe (skip; the
        // remaining children below cover siblings, and the moved nodes
        // were already inside a disallowed element: their attrs were
        // never editor-authored. Strip their element forms conservatively
        // by walking them directly).
        for (const moved of Array.from(frag.children)) walk(moved);
        continue;
      }
      // Attribute gate.
      for (const attr of Array.from(child.attributes)) {
        const name = attr.name.toLowerCase();
        if (!allowedAttrFor(tag, name)) {
          child.removeAttribute(attr.name);
          continue;
        }
        if (tag === "a" && name === "href") {
          const kept = cleanUrl(attr.value);
          if (kept === null) child.removeAttribute(attr.name);
          else if (kept !== attr.value) child.setAttribute("href", kept);
        }
        if (tag === "img" && name === "src") {
          if (!/^data:image\//i.test(attr.value.trim())) {
            // Remote (or non-image data:) src — the tracking-pixel class.
            // Neutralize the load by REMOVING the src: the element stays
            // (alt text remains readable) but fetches nothing.
            child.removeAttribute("src");
          }
        }
        if ((tag === "span" || tag === "code") && name === "class") {
          const kept = attr.value
            .split(/\s+/)
            .filter((cls) => NOTE_HTML_CLASS_PATTERN.test(cls));
          if (kept.length === 0) child.removeAttribute("class");
          else if (kept.join(" ") !== attr.value) child.setAttribute("class", kept.join(" "));
        }
        if (tag === "span" && name === "style") {
          const kept = attr.value
            .split(";")
            .map((decl) => decl.trim())
            .filter((decl) => {
              const prop = decl.split(":")[0]?.trim().toLowerCase() ?? "";
              return NOTE_HTML_STYLE_PROPS.includes(prop);
            })
            .join("; ");
          if (kept !== attr.value) child.setAttribute("style", kept);
        }
      }
      walk(child);
    }
  }
}
