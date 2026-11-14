import { describe, expect, it } from "vitest";

import { classifyFileType, FILE_TYPE_OPTIONS } from "@/lib/file-types";

// S183/EG — the Files type-filter seam (the reference's "All Types"
// combobox, measured live 2026-11-14). The five options are the reference's
// verbatim labels; the classification is the MEASURED semantics: a .txt
// lands under "Other" (NOT "Documents" — the live reference's Documents
// filter showed nothing for a .txt), image/* maps to "Images",
// application/pdf to "PDFs". The office-document family is the
// word-processor set (doc/docx/odt/rtf + their MIME types).
describe("FILE_TYPE_OPTIONS", () => {
  it("carries the reference's five verbatim labels in the measured order", () => {
    expect(FILE_TYPE_OPTIONS).toEqual([
      { value: "all", label: "All Types" },
      { value: "images", label: "Images" },
      { value: "pdfs", label: "PDFs" },
      { value: "documents", label: "Documents" },
      { value: "other", label: "Other" },
    ]);
  });
});

describe("classifyFileType", () => {
  it("maps image mimes to images (the measured PNG case)", () => {
    expect(classifyFileType("image/png", "probe.png")).toBe("images");
    expect(classifyFileType("image/jpeg", "photo.jpg")).toBe("images");
    expect(classifyFileType("image/webp", "art.webp")).toBe("images");
    expect(classifyFileType("image/svg+xml", "vector.svg")).toBe("images");
  });

  it("maps application/pdf to pdfs (the measured PDF case)", () => {
    expect(classifyFileType("application/pdf", "paper.pdf")).toBe("pdfs");
  });

  it("maps the office word-processor family to documents", () => {
    expect(classifyFileType("application/msword", "doc.doc")).toBe("documents");
    expect(
      classifyFileType("application/vnd.openxmlformats-officedocument.wordprocessingml.document", "doc.docx"),
    ).toBe("documents");
    expect(classifyFileType("application/vnd.oasis.opendocument.text", "doc.odt")).toBe("documents");
    expect(classifyFileType("application/rtf", "doc.rtf")).toBe("documents");
  });

  it("maps a plain .txt to OTHER — the measured reference semantics (Documents showed nothing for it)", () => {
    expect(classifyFileType("text/plain", "notes.txt")).toBe("other");
  });

  it("maps unrecognized mimes to other", () => {
    expect(classifyFileType("application/zip", "bundle.zip")).toBe("other");
    expect(classifyFileType("application/octet-stream", "blob.bin")).toBe("other");
    expect(classifyFileType("video/mp4", "clip.mp4")).toBe("other");
    expect(classifyFileType("audio/mpeg", "song.mp3")).toBe("other");
  });

  it("falls back to the EXTENSION when the mime is generic but the name speaks (the upload mime-derivation posture)", () => {
    // A generic octet-stream row whose name ends .pdf still filters under
    // PDFs — the same extension-derived mime posture the upload route
    // (S146/CU1) applies at write time, applied at read time for rows
    // that predate it or arrive through the import door.
    expect(classifyFileType("application/octet-stream", "paper.pdf")).toBe("pdfs");
    expect(classifyFileType("application/octet-stream", "photo.png")).toBe("images");
    expect(classifyFileType("application/octet-stream", "notes.txt")).toBe("other");
  });

  it("classifies the link-file mime as other (links never claim an image/pdf tile)", () => {
    expect(classifyFileType("text/uri-list", "a link")).toBe("other");
  });

  it("handles an empty mime via the name, and an empty name via the mime", () => {
    expect(classifyFileType("", "paper.pdf")).toBe("pdfs");
    expect(classifyFileType("image/png", "")).toBe("images");
    expect(classifyFileType("", "")).toBe("other");
  });
});
