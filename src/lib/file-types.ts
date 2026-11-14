// ---------------------------------------------------------------------------
// The Files type-filter seam (S183/EG) — the reference's "All Types"
// combobox: the five options and the classification. MEASURED semantics
// (live reference, 2026-11-14): a .txt lands under "Other" — the naive
// text/* → "Documents" guess is wrong (the reference's Documents filter
// showed nothing for a .txt); image/* → "Images"; application/pdf →
// "PDFs"; the office word-processor family → "Documents".
// ----------------------------------------------------------------------------

export type FileTypeFilter = "all" | "images" | "pdfs" | "documents" | "other";

/** The combobox's option list — the reference's five verbatim labels,
 *  in the measured order. */
export const FILE_TYPE_OPTIONS: ReadonlyArray<{
  value: FileTypeFilter;
  label: string;
}> = [
  { value: "all", label: "All Types" },
  { value: "images", label: "Images" },
  { value: "pdfs", label: "PDFs" },
  { value: "documents", label: "Documents" },
  { value: "other", label: "Other" },
];

// The word-processor extension family (the document bucket is the OFFICE
// set — a plain .txt is Other, measured).
const DOCUMENT_EXTENSIONS = new Set(["doc", "docx", "odt", "rtf"]);
const DOCUMENT_MIMES = new Set([
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.oasis.opendocument.text",
  "application/rtf",
]);

function classifyByExtension(name: string): FileTypeFilter | null {
  const dot = name.lastIndexOf(".");
  if (dot < 0 || dot === name.length - 1) return null;
  const ext = name.slice(dot + 1).toLowerCase();
  if (ext === "pdf") return "pdfs";
  if (["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"].includes(ext)) return "images";
  if (DOCUMENT_EXTENSIONS.has(ext)) return "documents";
  return null;
}

/** Classify a stored file row into the filter buckets. The mime leads;
 *  a generic octet-stream falls back to the extension (the same
 *  extension-derived posture the upload route applies at write time —
 *  rows that predate it or arrive through the import door still
 *  classify readably). The link-file mime (text/uri-list) is Other —
 *  links never claim an image/pdf tile. */
export function classifyFileType(mime: string, name: string): FileTypeFilter {
  if (mime.startsWith("image/")) return "images";
  if (mime === "application/pdf") return "pdfs";
  if (DOCUMENT_MIMES.has(mime)) return "documents";
  if (mime === "application/octet-stream" || mime === "") {
    return classifyByExtension(name) ?? "other";
  }
  return "other";
}
