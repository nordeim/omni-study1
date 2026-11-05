"use client";

// ---------------------------------------------------------------------------
// QuillEditor (S77/AD1) — the rich-text note editor wrapper.
//
// The reference ships a FUNCTIONAL Quill snow editor (measured 2026-10-21:
// 20-control toolbar on a slate-50 strip, editor pad 24px, 16px text, content
// persisted as HTML — "<p><strong>…</strong></p>"). This wrapper mounts the
// same engine client-side (dynamic import — Quill touches `document`), emits
// debounced HTML changes for the parent's autosave, and exposes a
// `insertDivider` handle for the Font row's black Divider button (a custom
// `hr` blot — Quill ships none).
// ---------------------------------------------------------------------------

import * as React from "react";
import type QuillType from "quill";

import "quill/dist/quill.snow.css";

import { useToastStore } from "@/components/ui/toast";
// S140/CO1: the legacy-row render gate (same policy module as the server
// sanitizer — pure data + a DOMParser walk, no node deps).
import { sanitizeNoteHtmlDom, looksLikeHtml } from "@/lib/note-html";

/** The reference's measured snow toolbar: 3 pickers + 5 format groups = 20 controls. */
const TOOLBAR: unknown[] = [
  [{ header: [] }, { font: [] }, { size: [] }],
  ["bold", "italic", "underline", "strike"],
  [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
  [{ indent: "-1" }, { indent: "+1" }],
  [{ color: [] }, { background: [] }, { align: [] }],
  ["blockquote", "code-block", "link", "image", "clean"],
];

export const EDITOR_FONTS = {
  sans: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  serif: "Georgia, Cambria, Times New Roman, serif",
  mono: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
} as const;

export type EditorFont = keyof typeof EDITOR_FONTS;

export interface QuillEditorHandle {
  /** Insert a horizontal rule at the cursor (the Divider button). */
  insertDivider(): void;
  /** The live editor HTML (the Save button's flush source) — `null`
   * until the dynamically-imported Quill instance exists, so a Save
   * clicked in the load window falls back to the note's stored content
   * (S78/AE1 — returning "" there let Save overwrite a populated note). */
  getContent(): string | null;
}

interface QuillEditorProps {
  /** Initial content — HTML (Quill round-trips) or legacy plain text. */
  value: string;
  /** Debounced HTML changes (user edits only). */
  onChange: (html: string) => void;
  /** The Font row's editor typeface (functional-lite superset). */
  font: EditorFont;
  className?: string;
}

/** Minimal structural shape of a parchment BlockEmbed constructor. */
type BlockEmbedCtor = new (domNode: HTMLElement) => object & { create: () => HTMLElement };

/**
 * S122/BW10 — the image-insert budget. The measured snow toolbar includes
 * `image` (parity — the reference's own toolbar has it), but Quill 2's
 * DEFAULT handler inserts base64 data-URLs unbounded: a typical screenshot
 * (~200 KB → ~270 KB base64) blows the note-content schema cap (100_000)
 * and the autosave then 400s — the editor was permitting content the
 * server rejects. The gate keeps the toolbar intact and rejects inserts
 * whose base64 would not leave room for text in the content budget.
 */
const MAX_IMAGE_BYTES = 60_000; // ≈80 KB base64 — leaves 20 KB for text

function installImageSizeGate(quill: QuillType) {
  const toolbar = quill.getModule("toolbar") as
    | { handlers?: Record<string, (...args: unknown[]) => void> }
    | undefined;
  if (!toolbar) return;
  toolbar.handlers = {
    ...(toolbar.handlers ?? {}),
    image: () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) return;
        if (file.size > MAX_IMAGE_BYTES) {
          useToastStore
            .getState()
            .push(
              "error",
              `Images are limited to ${Math.round(MAX_IMAGE_BYTES / 1000)} KB in notes — the note would exceed its save limit.`,
            );
          return;
        }
        const reader = new FileReader();
        reader.onerror = () => {
          useToastStore.getState().push("error", "Could not read that image. Try again.");
        };
        reader.onload = () => {
          const url = typeof reader.result === "string" ? reader.result : null;
          if (!url) return;
          const sel = quill.getSelection(true);
          const index = sel ? sel.index : Math.max(0, quill.getLength() - 1);
          quill.insertEmbed(index, "image", url);
          quill.setSelection(index + 1);
        };
        reader.readAsDataURL(file);
      };
      input.click();
    },
  };
}

/** a11y-win (the repo's standing doctrine): Quill's snow toolbar buttons
 * ship with no accessible names — label them from their classes. */
const TOOLBAR_LABELS: Record<string, string> = {
  bold: "Bold",
  italic: "Italic",
  underline: "Underline",
  strike: "Strikethrough",
  blockquote: "Block quote",
  "code-block": "Code block",
  link: "Insert link",
  image: "Insert image",
  clean: "Clear formatting",
};

const toolbarLabelFor = (btn: HTMLButtonElement): string => {
  const base = [...btn.classList].find(
    (c) => /^ql-[a-z-]+$/.test(c) && c !== "ql-active" && c !== "ql-hidden",
  );
  if (!base) return "";
  const key = base.slice(3);
  const value = btn.getAttribute("value") ?? "";
  if (key === "list") {
    if (value === "ordered") return "Numbered list";
    if (value === "check") return "Checklist";
    return "Bulleted list";
  }
  if (key === "indent") return value === "-1" ? "Decrease indent" : "Increase indent";
  return TOOLBAR_LABELS[key] ?? "";
};

function labelToolbarButtons(toolbar: Element | null) {
  if (!toolbar) return;
  for (const btn of toolbar.querySelectorAll<HTMLButtonElement>("button[class^=ql-]")) {
    if (btn.getAttribute("aria-label")) continue;
    const label = toolbarLabelFor(btn);
    if (label) btn.setAttribute("aria-label", label);
  }
}

/** Picker group names for the snow dropdown groups (S78/AE7). */
const PICKER_LABELS: Record<string, string> = {
  header: "Text style",
  font: "Font",
  size: "Text size",
  color: "Text color",
  background: "Background color",
  align: "Alignment",
};

function labelToolbarPickers(toolbar: Element | null) {
  if (!toolbar) return;
  for (const picker of toolbar.querySelectorAll<HTMLElement>(".ql-picker")) {
    const base = [...picker.classList].find((c) => /^ql-[a-z-]+$/.test(c) && c !== "ql-picker");
    if (!base) continue;
    const name = PICKER_LABELS[base.slice(3)];
    if (!name) continue;
    picker.setAttribute("role", "group");
    picker.setAttribute("aria-label", name);
  }
}

let blotRegistered = false;

export const QuillEditor = React.forwardRef<QuillEditorHandle, QuillEditorProps>(
  function QuillEditor({ value, onChange, font, className }, forwarded) {
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const quillRef = React.useRef<QuillType | null>(null);
    const initialRef = React.useRef(value);
    const onChangeRef = React.useRef(onChange);
    const dirtyRef = React.useRef(false);
    const lastHtmlRef = React.useRef<string | null>(null);
    const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    // S130/CE9: the latest-ref write moves OUT of render (the
    // NoteTitleInput sibling's idiom — the repo's own contract is
    // event-handler/effect writes only; a render-phase ref write is a
    // React-Compiler hazard).
    React.useEffect(() => {
      onChangeRef.current = onChange;
    }, [onChange]);

    React.useImperativeHandle(
      forwarded,
      () => ({
        insertDivider() {
          const q = quillRef.current;
          if (!q) return;
          const sel = q.getSelection(true);
          const index = sel ? sel.index : Math.max(0, q.getLength() - 1);
          q.insertEmbed(index, "hr", true);
          q.setSelection(index + 1);
        },
        getContent() {
          // null (not "") while the Quill instance is still importing — the
          // S78/AE1 guard: the caller's `?? stored` fallback must fire.
          return quillRef.current?.root.innerHTML ?? null;
        },
      }),
      [],
    );

    React.useEffect(() => {
      let disposed = false;
      let quill: QuillType | null = null;

      void (async () => {
        const { default: Quill } = await import("quill");
        if (disposed || !containerRef.current) return;

        if (!blotRegistered) {
          const BlockEmbed = Quill.import("blots/block/embed") as unknown as BlockEmbedCtor;
          class Hr extends (BlockEmbed as new () => object) {
            static readonly blotName = "hr";
            static readonly tagName = "hr";
          }
          // Path-form registration (the documented Quill pattern for custom
          // blots) — keeps the class typing out of the registry overloads.
          Quill.register("formats/hr", Hr);
          blotRegistered = true;
        }

        quill = new Quill(containerRef.current, {
          theme: "snow",
          placeholder: "Start writing...",
          modules: { toolbar: TOOLBAR },
        }) as QuillType;
        quillRef.current = quill;
        // S122/BW10: the size-gated image insert (the default handler's
        // unbounded base64 broke the note-content cap on save).
        installImageSizeGate(quill);

        // a11y-win: the snow theme ships nameless toolbar buttons.
        labelToolbarButtons(containerRef.current.parentElement?.querySelector(".ql-toolbar") ?? null);
        // a11y-win (S78/AE7): the snow pickers (header/font/size/…)
        // render label SPANS with no accessible name — label them from
        // their ql-* classes ("Normal" reads as the value, not a name).
        labelToolbarPickers(containerRef.current.parentElement?.querySelector(".ql-toolbar") ?? null);

        // S140/CO1 (the A-L3 closure) — the legacy-row render gate: every
        // server write path (the note delegate + the import loop) now
        // sanitizes note HTML, but rows stored BEFORE that fix ride this
        // mount path straight into dangerouslyPasteHTML. Quill's Delta
        // round-trip drops scripts/handlers, but its Image/Video/Link blots
        // keep REMOTE urls alive (the tracking-pixel class) — the DOM walk
        // (same policy module, browser-native DOMParser) neutralizes them
        // BEFORE the paste. Defense-in-depth under the production CSP.
        const initial = sanitizeNoteHtmlDom(initialRef.current);
        // S141/CP7: the shared shape probe (the S140 code re-inlined the
        // regex — a drift hazard against the policy module's own gate).
        if (looksLikeHtml(initial)) {
          quill.clipboard.dangerouslyPasteHTML(initial, Quill.sources.SILENT);
        } else if (initial) {
          quill.setText(initial, Quill.sources.SILENT);
        }

        quill.on("text-change", (_delta, _old, source) => {
          if (source !== "user") return;
          const html = quill ? quill.root.innerHTML : "";
          dirtyRef.current = true;
          lastHtmlRef.current = html;
          if (timerRef.current) clearTimeout(timerRef.current);
          timerRef.current = setTimeout(() => {
            dirtyRef.current = false;
            onChangeRef.current(html);
          }, 600);
        });
      })();

      return () => {
        disposed = true;
        if (timerRef.current) clearTimeout(timerRef.current);
        // Flush unsaved edits on unmount (note switch) — the captured
        // onChange still routes to the note this instance was mounted for.
        if (dirtyRef.current && lastHtmlRef.current !== null) {
          onChangeRef.current(lastHtmlRef.current);
        }
        quillRef.current = null;
      };
      // Mount-once per instance — the parent keys this component by note id.
    }, []);

    React.useEffect(() => {
      const root = quillRef.current?.root;
      if (root) root.style.setProperty("font-family", EDITOR_FONTS[font]);
      else if (containerRef.current) {
        containerRef.current.style.setProperty("font-family", EDITOR_FONTS[font]);
      }
    }, [font]);

    return <div role="group" ref={containerRef} className={className} aria-label="Rich text note editor" />;
  },
);
