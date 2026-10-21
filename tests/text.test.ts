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
