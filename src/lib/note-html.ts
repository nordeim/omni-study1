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

/** S141/CP5 — the raster-only data: image pattern (svg+xml excluded —
 * script-capable; text/html is not an image at all): shared by the DOM
 * gate's src rule and the server door's transformTags filter so the two
 * doors accept the SAME payload set. */
export const NOTE_HTML_IMAGE_MIME_PATTERN = /^data:image\/(?:png|gif|jpeg|webp)[;,]/i;

/** Quill's own class namespace — the only classes a span/code may carry. */
export const NOTE_HTML_CLASS_PATTERN = /^ql-[a-z0-9-]+$/;

/** Inline style properties the editor emits (its color/background pickers);
 * every other property (position, url(), …) is an injection surface. */
export const NOTE_HTML_STYLE_PROPS: readonly string[] = Object.freeze(["color", "background-color"]);

/** S141/CP5 — the color VALUE grammar shared by both doors: hex,
 * rgb()/rgba(), hsl()/hsla(), or a named color. url()/expression()/
 * gradient() and every other function-token dies at the VALUE level, not
 * just the property level. */
export const NOTE_HTML_STYLE_VALUE_PATTERN =
  /^(?:#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\)|[a-zA-Z]+)$/;

/** S141/CP6 — the walk depth cap. The 100k-char content cap admits ~25k
 * nesting levels; beyond 500 the subtree collapses to its text (a note
 * that deep is not editor-authored, and the unbounded recursion
 * previously threw RangeError inside the editor mount IIFE). */
export const NOTE_HTML_MAX_WALK_DEPTH = 500;

/** Quick shape probe the editor mount uses: does this string carry markup? */
export function looksLikeHtml(html: string): boolean {
  return /<[a-z][^>]*>/i.test(html);
}

/**
 * S142/CQ1 — the depth-cap collapse's text collector. An EXPLICIT work
 * stack, never native recursion: `element.textContent` and the
 * `innerHTML` serializer walk the subtree recursively in DOM
 * implementations (happy-dom's serializer empirically throws RangeError
 * at ≥4 000 nesting; browser engines sit higher but are not unbounded),
 * and the collapse exists precisely for the pathological-depth case —
 * the mechanism that saves the editor must not itself be the thrower.
 * Document-order output; comments/PIs contribute nothing.
 */
function subtreeText(root: Element): string {
  let out = "";
  const stack: Node[] = [root];
  while (stack.length > 0) {
    const node = stack.pop() as Node;
    if (node.nodeType === 3 /* Node.TEXT_NODE */) {
      out += node.nodeValue ?? "";
      continue;
    }
    // Push children in REVERSE so pops yield document order.
    const kids = node.childNodes;
    for (let i = kids.length - 1; i >= 0; i -= 1) stack.push(kids[i] as Node);
  }
  return out;
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
  walk(doc.body, 0);
  return doc.body.innerHTML;

  function allowedAttrFor(tag: string, attr: string): boolean {
    const allow = NOTE_HTML_ALLOWED_ATTRS[tag];
    return allow !== undefined && allow.includes(attr);
  }

  function cleanUrl(href: string): string | null {
    const trimmed = href.trim().toLowerCase();
    // S142/CQ5: anchors carry http/https/mailto ONLY — the toolbar's own
    // vocabulary. data: hrefs die here too (the raster carve-out was the
    // A-L2 asymmetry: the server door's allowedSchemes already killed
    // them; anchors are not images), and scheme-less relative/fragment
    // hrefs die (never toolbar-authored; the server door aligns the same
    // way in its transformTags filter). The two doors accept the SAME
    // anchor payload set.
    if (trimmed.startsWith("data:")) return null;
    const scheme = trimmed.split(":")[0];
    if (scheme === "http" || scheme === "https" || scheme === "mailto") return href;
    return null; // javascript:, vbscript:, relative, fragment, whitespace-only, unknown — gone.
  }

  function walk(node: Element, depth: number): void {
    for (const child of Array.from(node.children)) {
      processElement(child, depth);
    }
  }

  /** The per-element gate: unwrap disallowed tags (processing their moved
   * children as ELEMENTS — attribute gate and all), or run the attribute
   * gate and recurse. S141/CP1: the S140 shape called walk() on the moved
   * children, which processes each moved element's CHILDREN only — the
   * moved element's own attributes (a remote img src, a javascript: href)
   * and disallowed moved wrappers escaped untouched. */
  function processElement(child: Element, depth: number): void {
    // S141/CP6 — the hostile-depth posture: a chain this deep is not
    // editor-authored; collapse the subtree to its text content before
    // recursing (the pre-cap walk threw RangeError on ~25k-deep
    // nesting, killing the editor mount with an unhandled rejection).
    if (depth >= NOTE_HTML_MAX_WALK_DEPTH) {
      child.replaceWith(subtreeText(child));
      return;
    }
    const tag = child.tagName.toLowerCase();
    if (!NOTE_HTML_ALLOWED_TAGS.includes(tag)) {
      // Disallowed node: keep its TEXT (containers) but drop the element
      // itself — the document replaces it with its children/text.
      // S141/CP1: snapshot the moved children BEFORE the insertion — a
      // DocumentFragment is EMPTIED by replaceChild (the DOM spec MOVES
      // its children into the insertion parent), so the S140 code's
      // post-insertion Array.from(frag.children) iterated zero elements
      // and every hostile element one nesting level deep escaped the
      // gate entirely (the dead-walk bug, verified empirically in
      // headless Chromium by the s141 audit).
      const parent = child.parentElement;
      if (!parent) return;
      const frag = child.ownerDocument.createDocumentFragment();
      while (child.firstChild) frag.appendChild(child.firstChild);
      const moved = Array.from(frag.children);
      parent.replaceChild(frag, child);
      // S142/CQ1: the unwrap consumes a depth level too — the S141 shape
      // passed `depth` unchanged, so a purely disallowed chain (<div>×N)
      // recursed unbounded (the cap never fired; the max-expressible
      // ~9090-level chain within the 100k content cap threw RangeError
      // inside the editor mount — empirically probed: 6000 survives,
      // 8000 throws). Every hop through markup costs one level, allowed
      // or not.
      for (const m of moved) processElement(m, depth + 1);
      return;
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
        // S141/CP5: the raster-only data: MIME set (svg excluded — the
        // script-capable MIME must die at BOTH doors, not just the
        // remote-URL class).
        if (!NOTE_HTML_IMAGE_MIME_PATTERN.test(attr.value.trim())) {
          // Remote (or non-raster data:) src — the tracking-pixel class.
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
        // S141/CP5: the VALUE grammar joins the property filter — a
        // url()/expression() value riding an allowed property name is
        // an exfiltration vector the property-only filter kept.
        const kept = attr.value
          .split(";")
          .map((decl) => decl.trim())
          .filter((decl) => {
            const colon = decl.indexOf(":");
            if (colon === -1) return false;
            const prop = decl.slice(0, colon).trim().toLowerCase();
            if (!NOTE_HTML_STYLE_PROPS.includes(prop)) return false;
            const value = decl.slice(colon + 1).trim();
            return NOTE_HTML_STYLE_VALUE_PATTERN.test(value);
          })
          .join("; ");
        if (kept !== attr.value) child.setAttribute("style", kept);
      }
    }
    // S142/CQ5: the rel injection — the server door's transformTags twin.
    // Every SURVIVING anchor rides noopener+noreferrer at both doors
    // (href-bearing or not — the server injects on every <a>; a
    // target=_blank survivor without rel was the A-L2 asymmetry).
    if (tag === "a") child.setAttribute("rel", "noopener noreferrer");
    walk(child, depth + 1);
  }
}
