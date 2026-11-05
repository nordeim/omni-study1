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

describe("sanitizeNoteHtmlDom — the unwrap-path depth cap (S142/CQ1)", () => {
  // The A-M1 defect: the CP6 cap only counted the ALLOWED-tag path — the
  // unwrap branch recursed at the SAME depth, so a purely disallowed
  // chain (<div>×N) ran unbounded and the max-expressible chain (≈9090
  // <div> levels within the 100k content cap) threw RangeError inside
  // the editor mount IIFE (JS walk recursion — the S140-recorded class,
  // reachable pre-fix in the real browser where the engine's parser and
  // mutation cascades are iterative).
  //
  // Environment boundary, probed and recorded honestly: happy-dom's own
  // library JS recurses on deep-tree mutations and serialization
  // ([connectedToNode] / innerHTML — RangeError at ≥4 000 nesting), so
  // the ≥4k-deep not.toThrow shape is NOT demonstrable under happy-dom
  // regardless of the walk's bound (the browser-level guarantee rides
  // the capped-walk code shape + the render-gate e2e leg). The unit pin
  // below pins the cap SEMANTICS at a happy-dom-safe depth — exactly the
  // existing CP6 allowed-chain leg's pattern, applied to the unwrap path.
  it("collapses a pathological DISALLOWED-element chain at the cap (markup beyond the cap dies, its text survives)", () => {
    const depth = 550;
    const chain = "<div>".repeat(depth) + "<strong>bold</strong>" + "</div>".repeat(depth);
    const run = (): string => sanitizeNoteHtmlDom(chain);
    expect(run).not.toThrow();
    const out = run();
    // Pre-fix (RED): all 550 levels unwrap and <strong> SURVIVES as
    // markup — the cap never fired on the unwrap path. Post-fix: the
    // collapse at depth 500 takes the whole remaining subtree to its
    // text ("bold"), the same posture as the allowed-chain leg below.
    expect(out).toContain("bold");
    expect(out).not.toContain("<strong>");
    expect((out.match(/<div>/g) ?? []).length).toBe(0);
  });

  it("collapses a mixed allowed/disallowed chain at the cap (no throw, text survives)", () => {
    const depth = 600;
    const chain =
      "<span>".repeat(10) + "<div>".repeat(depth) + "core" + "</div>".repeat(depth) + "</span>".repeat(10);
    const run = (): string => sanitizeNoteHtmlDom(chain);
    expect(run).not.toThrow();
    expect(run()).toContain("core");
  });
});

describe("sanitizeNoteHtmlDom — the aligned anchor policy (S142/CQ5, DOM door)", () => {
  // The A-L2 alignment: the two doors accept the SAME anchor payload set
  // — http/https/mailto survive; data: and relative hrefs die at BOTH
  // doors; rel rides every survivor.
  it("drops an anchor data: href (raster or not — anchors are not images)", () => {
    const out = sanitizeNoteHtmlDom(
      '<a href="data:image/png;base64,iVBORw0KGgo=">exfil</a>',
    );
    expect(out).not.toContain("data:");
    expect(out).toContain("exfil");
  });

  it("drops relative and fragment-only anchor hrefs (never toolbar-authored)", () => {
    for (const href of ["/admin", "#anchor", "relative-page", "  "]) {
      const out = sanitizeNoteHtmlDom(`<a href="${href}">r</a>`);
      expect(out).not.toMatch(/href="[^"]*"/);
      expect(out).toContain("r");
    }
  });

  it("injects rel=noopener noreferrer on every surviving anchor (the server door's twin)", () => {
    for (const href of ["https://example.com/x", "http://example.com/y", "mailto:z@example.com"]) {
      const out = sanitizeNoteHtmlDom(`<a href="${href}">l</a>`);
      expect(out).toContain('rel="noopener noreferrer"');
      expect(out).toContain(href);
    }
  });

  it("drops a whitespace-only img src (the server door's aligned form)", () => {
    const out = sanitizeNoteHtmlDom('<img src="   " alt="blank">');
    expect(out).not.toMatch(/src="[^"]*"/);
    expect(out).toContain('alt="blank"');
  });
});
