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
