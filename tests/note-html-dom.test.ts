// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";

import { sanitizeNoteHtmlDom } from "@/lib/note-html";

// S141/CP1 — the DOM render gate's unit pins (happy-dom project, the first
// DOM-environment unit file: the S140/CO1 render gate shipped with ZERO
// unit coverage — vitest ran node-only, no DOMParser — and its
// moved-children walk was PROVABLY DEAD CODE: a DocumentFragment is
// EMPTIED by replaceChild (the DOM spec moves children into the insertion
// parent), so the post-insertion `Array.from(frag.children)` iterated
// zero elements and every hostile element nested ONE level deep escaped
// the gate entirely (verified empirically in headless Chromium by the
// s141 audit: a <div>-wrapped remote img, javascript: link, onclick
// handler, and hostile inline style all survived untouched). The e2e
// plant fixture only carried TOP-LEVEL hostile elements — exactly the
// shape that already worked — so the shipped suite was structurally
// unable to catch the regression. These pins close that gap.
//
// Coverage contract (mirroring the server-door pins in note-html.test.ts):
//   1. the NESTED hostile corpus (disallowed wrappers around hostile
//      payloads — the realistic pre-CO1 legacy shape: pasted newsletter
//      content wraps its pixels in <div>/<section> scaffolding)
//   2. the top-level controls (the shapes that already worked, pinned so
//      they can never regress)
//   3. the plain-text passthrough (the looksLikeHtml first line)
//   4. the depth cap (S141/CP6 — ~25k-deep allowed-tag nesting is
//      expressible within the 100k-char content cap and previously
//      threw RangeError inside the editor mount IIFE)
//   5. the tightened image-MIME and style-VALUE rules (S141/CP5 — the
//      DOM door must match the server door's raster-only data: set and
//      the color-grammar value constraint)

describe("sanitizeNoteHtmlDom — the nested hostile corpus (S141/CP1)", () => {
  it("neutralizes a remote img nested inside a disallowed wrapper (the dead-walk bug)", () => {
    const out = sanitizeNoteHtmlDom(
      '<div><img src="https://tracker.example/px.gif" alt="pixel"></div>',
    );
    // The remote URL dies (src removed — the S140 load-neutralization form:
    // the element may stay, alt text readable); the wrapper unwraps.
    expect(out).not.toContain("tracker.example");
    expect(out).not.toContain("src=");
  });

  it("neutralizes a javascript: href nested inside a disallowed wrapper", () => {
    const out = sanitizeNoteHtmlDom(
      '<div><a href="javascript:alert(1)">click</a></div>',
    );
    expect(out).not.toContain("javascript:");
    expect(out).toContain("click");
  });

  it("strips handlers and hostile classes on spans nested inside a disallowed wrapper", () => {
    const out = sanitizeNoteHtmlDom(
      '<div><span onclick="steal()" class="ql-size-large">x</span></div>',
    );
    expect(out).not.toContain("onclick");
    expect(out).toContain("ql-size-large");
  });

  it("filters inline styles on spans nested inside a disallowed wrapper to the color properties", () => {
    const out = sanitizeNoteHtmlDom(
      '<div><span style="color: red; position: fixed; top: 0">z</span></div>',
    );
    expect(out).toContain("color");
    expect(out).not.toContain("position");
    expect(out).not.toContain("top");
  });

  it("neutralizes hostile markup nested TWO disallowed levels deep", () => {
    const out = sanitizeNoteHtmlDom(
      '<section><article><img src="http://tracker.example/deep.gif"></article></section>',
    );
    expect(out).not.toContain("tracker.example");
    expect(out).not.toContain("src=");
  });

  it("drops a nested iframe entirely (the remote-embed class through a wrapper)", () => {
    const out = sanitizeNoteHtmlDom(
      '<div><iframe src="https://tracker.example/f"></iframe></div>',
    );
    expect(out).not.toContain("iframe");
    expect(out).not.toContain("tracker.example");
  });
});

describe("sanitizeNoteHtmlDom — the top-level controls (S141/CP1 regression pins)", () => {
  it("neutralizes a top-level remote img (the shape that already worked)", () => {
    const out = sanitizeNoteHtmlDom(
      '<img src="https://tracker.example/px.gif" alt="pixel">',
    );
    expect(out).not.toContain("tracker.example");
  });

  it("keeps allowed structure and data: images (the allowlist is not scorched earth)", () => {
    const out = sanitizeNoteHtmlDom(
      '<p>hello <strong>world</strong></p><p><img src="data:image/png;base64,iVBORw0KGgo="></p>',
    );
    expect(out).toContain("<p>hello <strong>world</strong></p>");
    expect(out).toContain("data:image/png;base64,iVBORw0KGgo=");
  });

  it("keeps a benign unwrapped paragraph untouched", () => {
    expect(sanitizeNoteHtmlDom("<p>ok</p>")).toBe("<p>ok</p>");
  });
});

describe("sanitizeNoteHtmlDom — the plain-text passthrough (the first-line contract)", () => {
  it("passes plain text through byte-identically (incl. entities the server door once mangled)", () => {
    const plain = "AT&T rules — Q&A, R&D, 5 < 6 and 7 > 3";
    expect(sanitizeNoteHtmlDom(plain)).toBe(plain);
    expect(sanitizeNoteHtmlDom("")).toBe("");
  });
});

describe("sanitizeNoteHtmlDom — the depth cap (S141/CP6)", () => {
  it("collapses a pathological allowed-tag chain instead of throwing RangeError", () => {
    const depth = 600;
    const chain = "<span>".repeat(depth) + "deep" + "</span>".repeat(depth);
    const run = (): string => sanitizeNoteHtmlDom(chain);
    expect(run).not.toThrow();
    const out = run();
    // The text content survives (escaped text form is acceptable — the
    // chain is not editor-authored); no unbounded markup survives.
    expect(out).toContain("deep");
    expect((out.match(/<span>/g) ?? []).length).toBeLessThan(600);
  });

  it("keeps sane nesting depths (an 8-deep list structure round-trips)", () => {
    const sane =
      "<ol><li>a<ul><li>b<ol><li>c<ul><li>d<ol><li>e</li></ol></li></ul></li></ol></li></ul></li></ol>";
    expect(sanitizeNoteHtmlDom(sane)).toContain("<li>e");
  });
});

describe("sanitizeNoteHtmlDom — the tightened policy rules (S141/CP5, DOM door)", () => {
  it("drops a data:image/svg+xml img src (script-capable MIME excluded from the raster set)", () => {
    const out = sanitizeNoteHtmlDom(
      '<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==">',
    );
    expect(out).not.toContain("image/svg+xml");
  });

  it("drops a data:text/html img src (the non-image data: payload)", () => {
    const out = sanitizeNoteHtmlDom(
      '<img src="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">',
    );
    expect(out).not.toContain("data:text/html");
  });

  it("keeps the raster data: MIME set (png/gif/jpeg/webp)", () => {
    for (const mime of ["png", "gif", "jpeg", "webp"]) {
      const out = sanitizeNoteHtmlDom(
        `<img src="data:image/${mime};base64,iVBORw0KGgo=">`,
      );
      expect(out).toContain(`data:image/${mime};base64,`);
    }
  });

  it("drops style values outside the color grammar (url() / expression() exfiltration vectors)", () => {
    const out = sanitizeNoteHtmlDom(
      '<span style="color: url(https://evil.example/x); background-color: expression(alert(1))">v</span>',
    );
    expect(out).not.toContain("url(");
    expect(out).not.toContain("expression");
    expect(out).not.toContain("evil.example");
  });

  it("keeps grammar-valid color values", () => {
    for (const value of ["red", "#ff0000", "rgb(255, 0, 0)", "rgba(255, 0, 0, 0.5)", "hsl(0, 100%, 50%)"]) {
      const out = sanitizeNoteHtmlDom(`<span style="color: ${value}">v</span>`);
      expect(out).toContain(`color: ${value}`);
    }
  });
});
