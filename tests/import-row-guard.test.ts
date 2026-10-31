// S119/BT1b — the import row guard (docs/remediation-plan-session119.md).
//
// A dedicated RED file: the guard lives in the PURE seam src/lib/data-import.ts
// (sanitized BEFORE the write loop), pinned separately so the S23 seam pins
// stay green while this family demonstrates the RED phase cleanly.
import { describe, expect, it } from "vitest";

import { sanitizeImportRow } from "../src/lib/data-import";

describe("sanitizeImportRow (S119/BT1b — the per-row guard at the import's third entry point)", () => {
  // The export's own serialization contract: every value is a primitive
  // (strings/numbers/booleans/null — Date → ISO, JSON columns → strings).
  // The import write loop historically persisted envelope fields VERBATIM,
  // so a hand-edited "backup" could store a javascript: link URL (the BR4
  // http(s)-only rule's unguarded third entry point — files-view renders
  // href={file.url} target=_blank), wrong field TYPES (a Prisma 500,
  // violating the 400-bad-input contract), and unbounded strings. The
  // guard runs BEFORE the write loop and throws an error naming the
  // collection + index.
  const baseRow = {
    id: "row-1",
    title: "A task",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };

  it("passes a valid row through unchanged", () => {
    expect(sanitizeImportRow("tasks", { ...baseRow })).toEqual(baseRow);
  });

  it("rejects a nested-object value (wrong type → the 400 path, never a Prisma 500)", () => {
    expect(() =>
      sanitizeImportRow("tasks", { ...baseRow, title: { nested: true } }),
    ).toThrow(/tasks\[0\][\s\S]*title|title[\s\S]*tasks\[0\]/);
  });

  it("rejects a string field over the 1,000,000-char guard", () => {
    expect(() =>
      sanitizeImportRow("tasks", { ...baseRow, title: "a".repeat(1_000_001) }),
    ).toThrow();
  });

  it("accepts a string field exactly at the guard boundary", () => {
    expect(() =>
      sanitizeImportRow("tasks", { ...baseRow, title: "a".repeat(1_000_000) }),
    ).not.toThrow();
  });

  it("rejects a files row whose url is a javascript: URI (the stored-href hole)", () => {
    expect(() =>
      sanitizeImportRow("files", {
        id: "f1",
        name: "Evil link",
        mime: "text/plain",
        size: 0,
        url: "javascript:alert(1)",
        folderId: null,
      }),
    ).toThrow();
  });

  it("rejects a files row whose url is a data: URI (the WHATWG-valid smuggling twin)", () => {
    expect(() =>
      sanitizeImportRow("files", {
        id: "f1",
        name: "Evil link",
        mime: "text/plain",
        size: 0,
        url: "data:text/html,<script>alert(1)</script>",
        folderId: null,
      }),
    ).toThrow();
  });

  it("accepts a files row with an https url (the link-file shape)", () => {
    expect(() =>
      sanitizeImportRow("files", {
        id: "f1",
        name: "A link",
        mime: "text/plain",
        size: 0,
        url: "https://example.com/resource",
        folderId: null,
      }),
    ).not.toThrow();
  });

  it("accepts a files row with a null url (the upload shape)", () => {
    expect(() =>
      sanitizeImportRow("files", {
        id: "f1",
        name: "A file",
        mime: "application/pdf",
        size: 1024,
        url: null,
        data: "QUJD",
        folderId: null,
      }),
    ).not.toThrow();
  });

  it("rejects a files row with a whitespace-only name (the AM1 trim convention)", () => {
    expect(() =>
      sanitizeImportRow("files", {
        id: "f1",
        name: "   ",
        mime: "text/plain",
        size: 0,
        url: null,
        folderId: null,
      }),
    ).toThrow();
  });

  it("rejects a files row with a name over 200 chars", () => {
    expect(() =>
      sanitizeImportRow("files", {
        id: "f1",
        name: "a".repeat(201),
        mime: "text/plain",
        size: 0,
        url: null,
        folderId: null,
      }),
    ).toThrow();
  });

  it("rejects a files row whose base64 data exceeds the 2 MiB upload ceiling", () => {
    expect(() =>
      sanitizeImportRow("files", {
        id: "f1",
        name: "Big",
        mime: "application/octet-stream",
        size: 1024,
        url: null,
        data: "A".repeat(2_800_001),
        folderId: null,
      }),
    ).toThrow();
  });

  it("names the collection and row index in the error message", () => {
    try {
      sanitizeImportRow("files", {
        id: "f1",
        name: "x",
        mime: "text/plain",
        size: 0,
        url: "javascript:alert(1)",
        folderId: null,
      });
      expect.unreachable("the guard must throw");
    } catch (err: unknown) {
      expect(err instanceof Error).toBe(true);
      const msg = (err as Error).message;
      expect(msg).toContain("files");
      expect(msg).toMatch(/\b0\b|\[0\]/);
    }
  });
});
