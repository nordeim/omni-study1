import { describe, expect, it } from "vitest";

import { stripHtmlPreview } from "@/lib/text";

// S77/AD7 (measured on the reference): the note list row renders a plain-
// text preview of the note's HTML content — tags stripped, whitespace
// collapsed, length-capped. The reference's Quill editor persists content
// as HTML (`<p><strong>Probe paragraph one.</strong></p>`), so the preview
// seam must reduce HTML to readable text.
describe("stripHtmlPreview — the note list-row preview seam (S77/AD7)", () => {
  it("strips tags from simple paragraph HTML", () => {
    expect(stripHtmlPreview("<p><strong>Probe paragraph one.</strong></p>")).toBe(
      "Probe paragraph one.",
    );
  });

  it("joins block elements with a single space and collapses whitespace", () => {
    expect(stripHtmlPreview("<p>One.</p><p>Two.</p>")).toBe("One. Two.");
    expect(stripHtmlPreview("<p>A\n\nB</p>")).toBe("A B");
  });

  it("decodes the common HTML entities", () => {
    expect(stripHtmlPreview("<p>a &amp; b &lt;c&gt; &quot;d&quot;</p>")).toBe('a & b <c> "d"');
  });

  it("caps the preview length (default 60 chars) without cutting mid-word unnecessarily long", () => {
    const long = `<p>${"word ".repeat(30).trim()}</p>`;
    const out = stripHtmlPreview(long);
    expect(out.length).toBeLessThanOrEqual(60);
    expect(out.endsWith("…")).toBe(true);
  });

  it("respects a custom max length", () => {
    expect(stripHtmlPreview("<p>abcdefghij</p>", 5)).toBe("abcd…");
  });

  it("returns the empty string for empty/blank content", () => {
    expect(stripHtmlPreview("")).toBe("");
    expect(stripHtmlPreview("<p></p>")).toBe("");
    expect(stripHtmlPreview("<p>&nbsp;</p>")).toBe("");
  });

  it("passes plain text through untouched (legacy notes)", () => {
    // The seeded notes carry plain text (pre-Quill contract); the preview
    // must not mangle them.
    expect(stripHtmlPreview("The dot product of two vectors")).toBe(
      "The dot product of two vectors",
    );
  });
});

// S78/AE5 (the s78 code audit): the entity decoder must cover the forms
// Quill actually emits — numeric decimal/hex entities (&#8212; &#x2014;)
// and the common named typography entities (&ldquo; &rsquo; &hellip;) —
// and the cap must slice by CODE POINT, never by UTF-16 unit (an emoji
// straddling the cap would otherwise render as a replacement character).
describe("stripHtmlPreview — entity + surrogate hardening (S78/AE5)", () => {
  it("decodes numeric decimal entities", () => {
    expect(stripHtmlPreview("<p>a &#8212; b</p>")).toBe("a — b");
  });

  it("decodes numeric hex entities", () => {
    expect(stripHtmlPreview("<p>x &#x2014; y</p>")).toBe("x — y");
  });

  it("decodes the common named typography entities Quill emits", () => {
    expect(stripHtmlPreview("<p>&ldquo;quote&rdquo; it&rsquo;s &hellip; end</p>")).toBe(
      "\u201Cquote\u201D it\u2019s \u2026 end",
    );
  });

  it("caps by code point — an emoji straddling the cap never splits", () => {
    // 55 ASCII chars + one 2-unit emoji (🎓) + trailing text: the cap at 56
    // would slice the surrogate pair in half under a bare String.slice.
    const text = `${"a".repeat(55)}🎓tail`;
    const out = stripHtmlPreview(text, 56);
    expect(out.endsWith("…")).toBe(true);
    // No lone surrogate / replacement character may appear in the output.
    expect(out).not.toContain("\uFFFD");
    expect(out.includes("🎓")).toBe(false); // the emoji was pushed past the cap
  });

  it("keeps a cap-fitting emoji intact", () => {
    const out = stripHtmlPreview(`${"a".repeat(54)}🎓`, 56);
    expect(out.endsWith("🎓")).toBe(true);
    expect(out).not.toContain("\uFFFD");
  });
});
