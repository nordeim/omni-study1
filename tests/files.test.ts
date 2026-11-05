import { describe, expect, it } from "vitest";

import {
  buildContentDisposition,
  downloadHeaders,
  isPrintableAsciiMime,
} from "@/lib/server/http";

// S13-C3: the file-download Content-Disposition must speak BOTH filename
// dialects — an ASCII-safe quoted fallback (RFC 2183) AND the RFC 5987
// filename*=UTF-8'' extended form (which every modern browser prefers for
// non-ASCII names). The pre-fix code percent-encoded the name INSIDE the
// quoted string, so browsers saved "%D1%84%D0%B0%D0%B9%D0%BB.txt" as the
// literal filename.

describe("buildContentDisposition", () => {
  it("passes a plain ASCII filename through both forms unchanged", () => {
    const header = buildContentDisposition("notes.txt");
    expect(header).toContain('filename="notes.txt"');
    expect(header).toContain("filename*=UTF-8''notes.txt");
  });

  it("percent-encodes a unicode filename in the RFC 5987 form only", () => {
    const header = buildContentDisposition("файл.txt");
    // The extended form carries the UTF-8 percent-encoding…
    expect(header).toContain("filename*=UTF-8''%D1%84%D0%B0%D0%B9%D0%BB.txt");
    // …and the quoted fallback stays ASCII-safe (no raw Cyrillic inside quotes).
    expect(header).toMatch(/filename="[^"]*"/);
    expect(header.match(/filename="([^"]*)"/)![1]).not.toMatch(/[^\x20-\x7e]/);
  });

  it("neutralizes embedded quotes and backslashes in the ASCII fallback", () => {
    const header = buildContentDisposition('she said "hi"\\bad.txt');
    const fallback = header.match(/filename="([^"]*)"/)![1];
    // No raw quote may terminate the quoted-string early.
    expect(fallback).not.toContain('"');
    // The RFC 5987 form still encodes the exact original name.
    expect(header).toContain(
      "filename*=UTF-8''she%20said%20%22hi%22%5Cbad.txt",
    );
  });

  it("falls back to a usable name when the input is empty", () => {
    const header = buildContentDisposition("");
    expect(header).toContain('filename="download"');
    expect(header).toContain("filename*=UTF-8''download");
  });

  it("keeps spaces percent-encoded in the extended form (not raw)", () => {
    const header = buildContentDisposition("my notes v2.txt");
    expect(header).toContain("filename*=UTF-8''my%20notes%20v2.txt");
    expect(header).toContain('filename="my notes v2.txt"');
  });
});

// S144/CS4 (audit B-L1, probed): the download door's Content-Type header
// value comes from the STORED files.mime — a pre-fix row imported through
// the length-only mime guard could carry CR/LF, and Node/undici's
// Headers.append THROWS on control characters in header VALUES
// (empirically verified: `Headers.append: "…" is an invalid header
// value`), turning that file's every download into the generic 500 (the
// taxonomy break — the import door now rejects the charset going
// forward; this clamp keeps the CONSTRUCTION header-safe even for
// pre-fix stored rows — the throw fails closed, so this was never a
// header-injection vector, only a 500-on-read one).
describe("downloadHeaders clamps the Content-Type value (S144/CS4)", () => {
  it("strips control characters from a stored CRLF mime (the header value stays constructable)", () => {
    const headers = downloadHeaders("a.txt", "text/html\r\nSet-Cookie: pwn=1") as Record<string, string>;
    expect(headers["Content-Type"]).not.toMatch(/[\r\n\x00-\x1f]/);
    expect(headers["Content-Type"]).toBe("text/htmlSet-Cookie: pwn=1");
    // The RFC 5987 disposition family is untouched by the clamp.
    expect(headers["Content-Disposition"]).toContain('filename="a.txt"');
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
  });

  it("falls back to application/octet-stream when the clamp empties the value (and passes clean values through)", () => {
    const blank = downloadHeaders("a.txt", "\r\n\r\n") as Record<string, string>;
    expect(blank["Content-Type"]).toBe("application/octet-stream");
    // The browser-real shape rides through byte-identical.
    const clean = downloadHeaders("a.txt", "text/html; charset=utf-8") as Record<string, string>;
    expect(clean["Content-Type"]).toBe("text/html; charset=utf-8");
  });
});

// S146/CU1 (audit B-M1): the multipart upload door's mime guard — the
// import door caps the identical column at 100 printable-ASCII chars
// ("files.mime": 100 + the charset guard in data-import.ts, the CE7
// bloat class: a poisoned oversized mime rides FILE_METADATA into EVERY
// files list GET); the interactive door stored `entry.type` verbatim —
// a hand-crafted multipart body writes a ~2 MiB mime per row. The seam
// mirrors the import door's admitted set exactly: printable ASCII
// (0x20–0x7E), empty still admitted (the unknown-type "" shape keeps
// falling back to the octet-stream default at the route).
describe("isPrintableAsciiMime — the multipart mime admission set (S146/CU1)", () => {
  it("admits the browser-real shapes: parameters, long vendor types, and the empty unknown-type shape", () => {
    expect(isPrintableAsciiMime("text/html; charset=utf-8")).toBe(true);
    expect(isPrintableAsciiMime("application/vnd.openxmlformats-officedocument.wordprocessingml.document")).toBe(true);
    expect(isPrintableAsciiMime("")).toBe(true);
  });

  it("rejects the over-length mime (the import door's 100-char cap mirrored at the interactive door)", () => {
    expect(isPrintableAsciiMime("a".repeat(100))).toBe(true);
    expect(isPrintableAsciiMime("a".repeat(101))).toBe(false);
    expect(isPrintableAsciiMime("a".repeat(150))).toBe(false);
  });

  it("rejects CRLF in the part Content-Type (the header-injection probe)", () => {
    expect(isPrintableAsciiMime("text/html\r\nSet-Cookie: pwn=1")).toBe(false);
    expect(isPrintableAsciiMime("text/plain\r")).toBe(false);
    expect(isPrintableAsciiMime("text/plain\n")).toBe(false);
  });

  it("rejects non-ASCII text (a legit mime is never non-ASCII per the type/subtype grammar)", () => {
    expect(isPrintableAsciiMime("текст/plain")).toBe(false);
    expect(isPrintableAsciiMime("text/plaiñ")).toBe(false);
    expect(isPrintableAsciiMime("application/pdf🙂")).toBe(false);
  });

  it("rejects the other control family — TAB, ESC, DEL, NUL (the s144 mime-probe set)", () => {
    expect(isPrintableAsciiMime("text/plain\t")).toBe(false);
    expect(isPrintableAsciiMime("text/plain\x1b")).toBe(false);
    expect(isPrintableAsciiMime("text/plain\x7f")).toBe(false);
    expect(isPrintableAsciiMime("text/\x00plain")).toBe(false);
  });
});
