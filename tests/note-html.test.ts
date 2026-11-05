import { describe, expect, it } from "vitest";

import { sanitizeNoteHtml } from "@/lib/server/note-html";

// S140/CO1 (Audit C F1 — the standing A-L3 deferral, closed): note HTML is
// unvalidated at BOTH entry points (direct API POST/PATCH + import) and the
// render sink (`quill.clipboard.dangerouslyPasteHTML`) keeps remote URLs
// alive through Quill's Image/Video/Link blots (the tracking-pixel /
// remote-iframe / click-beacon class). Production leaned entirely on the
// S138/CM9 CSP — one layer, production-conditional, one release old.
//
// The fix's shape: an ALLOWLIST sanitizer at a server-only seam
// (src/lib/server/note-html.ts — sanitize-html 2.18 configured from the
// shared policy in src/lib/note-html.ts), applied by the note delegate's
// writeTransform (the API door) AND the import route's write loop (the
// import door — the route writes through the raw tx client, so the
// delegate's hook never fires there), plus a DOMParser render gate in
// quill-editor for pre-fix legacy rows. These pins own the SERVER half —
// the policy invariants any implementation must uphold:
//
//   1. hostile vectors neutralized (script/style, handlers, javascript:
//      hrefs, remote img, iframe/object/embed, srcset, form controls, svg)
//   2. Quill's OWN authoring vocabulary preserved byte-close (the editor
//      emits exactly these tags/attributes — stripping them would corrupt
//      every legitimately-authored note: headers, lists, blockquote, pre/
//      code, strong/em/u/s, ql-* classes, color/background styles, https
//      links, data: images, hr, br)
//   3. plain text round-trips unchanged (the demo seed's notes are plain
//      text — the parity guard: sanitization must not rewrite seed content)
//
// The BW10 authorship fact (Audit C F7) is what makes img-src=data:-only
// lossless: the editor's own image gate inserts images as data: URLs
// exclusively, so no authentic note ever carried a remote img.

describe("sanitizeNoteHtml — hostile vectors neutralized (S140/CO1)", () => {
  it("drops <script> blocks, inline event handlers, and <style> payloads entirely", () => {
    const hostile =
      '<p>ok</p><script>alert("xss")</script>' +
      '<p onclick="steal()">click</p>' +
      '<style>body{background:url(https://evil.example/x)}</style>';
    const out = sanitizeNoteHtml(hostile);
    expect(out).not.toContain("script");
    expect(out).not.toContain("onclick");
    expect(out).not.toContain("<style");
    expect(out).toContain("<p>ok</p>");
  });

  it("neutralizes javascript: and data:text/html hrefs on links (keeps http/https/mailto)", () => {
    const out = sanitizeNoteHtml(
      '<a href="javascript:alert(1)">a</a><a href="data:text/html;base64,PHNjcmlwdD4=">b</a>' +
        '<a href="https://good.example/page" target="_blank">c</a><a href="mailto:x@y.example">d</a>',
    );
    expect(out).not.toContain("javascript:");
    expect(out).not.toContain("data:text/html");
    expect(out).toContain('href="https://good.example/page"');
    expect(out).toContain('href="mailto:x@y.example"');
  });

  it("drops REMOTE img src entirely (the tracking-pixel class) while keeping data: images", () => {
    const out = sanitizeNoteHtml(
      '<p>x</p><img src="https://tracker.example/px.gif"><img src="http://tracker.example/px2.gif">' +
        '<img src="data:image/png;base64,iVBORw0KGgo=" alt="pic">',
    );
    expect(out).not.toContain("tracker.example");
    expect(out).toContain("data:image/png;base64,iVBORw0KGgo=");
  });

  it("drops iframe / object / embed / form / input / svg — the remote-embed and form-injection classes", () => {
    const out = sanitizeNoteHtml(
      '<iframe src="https://evil.example/f"></iframe><object data="https://evil.example/o"></object>' +
        '<embed src="https://evil.example/e"><form action="https://evil.example/f2"><input name="pw" type="password"></form>' +
        '<svg><foreignObject><body><img src="https://evil.example/s"></body></foreignObject></svg>',
    );
    for (const tag of ["iframe", "object", "embed", "form", "input", "svg", "foreignObject", "evil.example"]) {
      expect(out).not.toContain(tag);
    }
  });

  it("strips srcset (the src-adjacent pixel vector) and non-color inline styles on spans", () => {
    const out = sanitizeNoteHtml(
      '<img src="data:image/png;base64,iVBORw0KGgo=" srcset="https://evil.example/a 1x, https://evil.example/b 2x">' +
        '<span style="color: rgb(230, 0, 0); position: fixed; top: 0">red</span>',
    );
    expect(out).not.toContain("srcset");
    expect(out).not.toContain("evil.example");
    expect(out).toContain("color");
    expect(out).not.toContain("position");
  });

  it("drops non-ql- classes on spans (the arbitrary-class injection surface)", () => {
    const out = sanitizeNoteHtml('<span class="ql-size-large ok legit">big</span><span class="evil-payload">x</span>');
    expect(out).toContain("ql-size-large");
    expect(out).not.toContain("evil-payload");
  });
});

describe("sanitizeNoteHtml — Quill's authoring vocabulary preserved (S140/CO1)", () => {
  it("keeps the full block/inline format set Quill's snow toolbar emits", () => {
    const quillHtml =
      '<h1>Title</h1><h2>Sub</h2><p>plain <strong>bold</strong> <em>italic</em> <u>under</u> <s>strike</s>' +
      ' <code>inline-code</code></p><ol><li>one</li><li>two</li></ol><ul><li>bullet</li></ul>' +
      '<blockquote>quoted</blockquote><pre>code block\nsecond line</pre><hr><p><br></p>' +
      '<span class="ql-font-serif ql-size-large">font+size</span>' +
      '<span style="background-color: rgb(255, 235, 59);">highlight</span>';
    const out = sanitizeNoteHtml(quillHtml);
    for (const fragment of [
      "<h1>Title</h1>",
      "<h2>Sub</h2>",
      "<strong>bold</strong>",
      "<em>italic</em>",
      "<u>under</u>",
      "<s>strike</s>",
      "<code>inline-code</code>",
      "<ol><li>one</li><li>two</li></ol>",
      "<ul><li>bullet</li></ul>",
      "<blockquote>quoted</blockquote>",
      "<pre>code block",
      // sanitize-html serializes void elements self-closing (<hr />) —
      // pin the serialized form (trap-10 doctrine: pin what reads back).
      "<hr /",
      "ql-font-serif ql-size-large",
      "background-color",
    ]) {
      expect(out).toContain(fragment);
    }
  });

  it("keeps https links with their target attribute (Quill's own link form)", () => {
    const out = sanitizeNoteHtml('<p><a href="https://docs.example/guide" target="_blank" rel="noopener noreferrer">guide</a></p>');
    expect(out).toContain('href="https://docs.example/guide"');
    expect(out).toContain('target="_blank"');
  });

  it("round-trips plain text byte-identically (the demo seed parity guard)", () => {
    const plain = "Rate laws: zero/first/second order.\nArrhenius: k = A·e^(−Ea/RT).";
    expect(sanitizeNoteHtml(plain)).toBe(plain);
    expect(sanitizeNoteHtml("")).toBe("");
  });

  it("round-trips the seed's markdown-ish note content unchanged", () => {
    const seedLike = "# Integration\n\n- substitution\n- by parts: ∫u dv = uv − ∫v du\n- partial fractions";
    expect(sanitizeNoteHtml(seedLike)).toBe(seedLike);
  });
});

// S141/CP2 — the plain-text passthrough gate. The S140 server door ran
// sanitize-html UNCONDITIONALLY: its parser re-serializes text nodes with
// entity encoding, so a plain-text row containing & or < was silently
// rewritten ("AT&T" → "AT&amp;T", "5 < 6" → "5 &lt; 6") — the documented
// "plain-text rows round-trip byte-identically" contract was FALSE, and
// the entities rendered as visible text through quill.setText (the
// s141 audit's empirical probe). The S140 pins never caught it: both
// byte-identity samples were entity-free. The fix: the server door adopts
// the DOM gate's own first line (looksLikeHtml) — plain text passes
// through untouched at BOTH doors.
describe("sanitizeNoteHtml — the plain-text passthrough gate (S141/CP2)", () => {
  it("round-trips entity-bearing plain text byte-identically (the mangled-ampersand class)", () => {
    const plain = "AT&T rules — Q&A, R&D; 5 < 6 and 7 > 3";
    expect(sanitizeNoteHtml(plain)).toBe(plain);
  });

  it("round-trips the entity-bearing entity-free boundary: markup detection is the gate, not entity escaping", () => {
    // "5 < 6" alone is NOT markup (no <[a-z]…> shape) — it passes through;
    // a row that IS markup re-serializes canonically (text-node entity
    // escaping inside markup is HTML-correct and renders identically).
    expect(sanitizeNoteHtml("5 < 6")).toBe("5 < 6");
    const markup = "<p>AT&T rules</p>";
    expect(sanitizeNoteHtml(markup)).toBe("<p>AT&amp;T rules</p>");
  });
});

// S141/CP5 — the server-door policy tightening: the raster-only data:
// image MIME set (svg+xml excluded — script-capable; data:text/html is
// not an image), the color VALUE grammar on styles (url()/expression()
// die at the value level), and the rel injection on surviving anchors.
describe("sanitizeNoteHtml — the tightened policy pair (S141/CP5, server door)", () => {
  it("drops data:image/svg+xml and data:text/html img srcs (raster-only payload set)", () => {
    const out = sanitizeNoteHtml(
      '<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==">' +
        '<img src="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">' +
        '<img src="data:image/png;base64,iVBORw0KGgo=">',
    );
    expect(out).not.toContain("image/svg+xml");
    expect(out).not.toContain("data:text/html");
    expect(out).toContain("data:image/png;base64,iVBORw0KGgo=");
  });

  it("drops style values outside the color grammar (the url()/expression() vectors)", () => {
    const out = sanitizeNoteHtml(
      '<span style="color: url(https://evil.example/x); background-color: expression(alert(1))">v</span>',
    );
    expect(out).not.toContain("url(");
    expect(out).not.toContain("expression");
    expect(out).not.toContain("evil.example");
  });

  it("keeps grammar-valid color values on spans", () => {
    const out = sanitizeNoteHtml(
      '<span style="color: #ff0000; background-color: rgba(255, 0, 0, 0.5)">v</span>',
    );
    expect(out).toContain("#ff0000");
    expect(out).toContain("rgba(255, 0, 0, 0.5)");
  });

  it("injects rel=noopener noreferrer on surviving target=_blank anchors", () => {
    const out = sanitizeNoteHtml('<p><a href="https://docs.example/g" target="_blank">g</a></p>');
    expect(out).toContain('rel="noopener noreferrer"');
  });
});

describe("sanitizeNoteHtml — the aligned anchor policy (S142/CQ5, server door)", () => {
  // The A-L2 alignment: the two doors accept the SAME anchor payload set —
  // http/https/mailto survive; data: and relative hrefs die at BOTH doors;
  // rel rides every survivor; whitespace-only img src dies at both.
  it("drops relative and fragment-only anchor hrefs (the DOM door's aligned form)", () => {
    for (const href of ["/admin", "#anchor", "relative-page", "  "]) {
      const out = sanitizeNoteHtml(`<p><a href="${href}">r</a></p>`);
      expect(out).not.toMatch(/href="[^"]*"/);
      expect(out).toContain("r");
    }
  });

  it("drops a whitespace-only img src (aligned with the DOM door's MIME gate)", () => {
    const out = sanitizeNoteHtml('<img src="   " alt="blank">');
    expect(out).not.toMatch(/src="[^"]*"/);
    expect(out).toContain('alt="blank"');
  });

  it("keeps the toolbar vocabulary's http/https/mailto trio with rel injected (S143/CR8: the count-word corrected — three schemes, not four)", () => {
    for (const href of ["https://example.com/x", "http://example.com/y", "mailto:z@example.com"]) {
      const out = sanitizeNoteHtml(`<a href="${href}">l</a>`);
      expect(out).toContain(href);
      expect(out).toContain('rel="noopener noreferrer"');
    }
  });
});

// S143/CR2 (the server-door twin of the DOM door's non-text policy): the
// OPTIONS now sets `nonTextTags` EXPLICITLY from the shared
// NOTE_HTML_NON_TEXT_TAGS constant — behavior-identical to sanitize-html's
// default (the five-tag set verified in the library source), but
// drift-immune and machine-censused: the shared contract "the two doors
// accept the SAME payload set" (the CQ5 comments) now includes the
// non-text family explicitly, not by library default.
describe("sanitizeNoteHtml — the non-text-tag policy (S143/CR2, server door)", () => {
  it("each non-text tag dies WHOLE at the server door (the corpus pinned against default drift)", () => {
    for (const [tag, text] of [
      ["script", "alert(1)"],
      ["style", ".x{}"],
      ["textarea", "ta"],
      ["option", "opt"],
      ["xmp", "xmp"],
    ] as const) {
      const out = sanitizeNoteHtml(`<p>a</p><${tag}>${text}</${tag}><p>b</p>`);
      expect(out).toBe("<p>a</p><p>b</p>");
    }
  });

  it("OPTIONS sets nonTextTags explicitly from the shared constant (the drift census)", () => {
    // The module-level OPTIONS object: the import is value-typed, so the
    // array identity check pins the SHARED constant (not a copy that can
    // drift). Behavior: nonTextTags contains exactly the five-tag set.
    const src = sanitizeNoteHtml("<p>probe</p>");
    expect(src).toBe("<p>probe</p>");
    // The census shape: OPTIONS.nonTextTags === [...NOTE_HTML_NON_TEXT_TAGS]
    // — pinned textually by the script-conventions census (the options
    // object is not exported); the behavioral backstop is the corpus leg
    // above. Here: the five-tag set is exactly what dies whole.
    for (const tag of ["script", "style", "textarea", "option", "xmp"]) {
      expect(sanitizeNoteHtml(`<p>a</p><${tag}>x</${tag}>`)).toBe("<p>a</p>");
    }
    // And nothing ELSE newly dies: the container family still unwraps.
    expect(sanitizeNoteHtml("<p>a</p><noscript>ns</noscript>")).toBe("<p>a</p>ns");
  });
});
