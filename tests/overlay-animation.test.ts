import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// S129/CD1 — the overlay animation family (docs/remediation-plan-session129.md).
//
// The audit's M2: package.json declared tw-animate-css (and the dead v3
// tailwindcss-animate) and the PAD's design-system table documented the pair
// as "Radix enter/exit transitions" — but globals.css never imported it, and
// Tailwind v4 silently drops unknown utilities, so every animate-in/out
// class on the Radix overlays was INERT: all dialogs/dropdowns/selects
// opened and closed instantly while the REFERENCE measured
// animation-name: enter / animation-duration: 0.15s on both its overlay and
// content (the tailwindcss-animate family, live-measured at
// docs/remediation-plan-session129.md §0). The fix wires the v4 port
// (`@import "tw-animate-css";` — same class names, same enter/exit
// keyframes, same 150 ms default) and restores the overlay classes the
// reference carries (fade-in-0 + fade-out-0 — the clone's DialogOverlay and
// AlertDialogOverlay carried NO animation classes at all).
//
// These are SOURCE-SHAPE pins (the AP3/hue-tokens precedent): the
// computed-style truth is pinned end-to-end by the theme-system e2e parity
// leg (the enter/0.15s assertions against the live dialog); this unit layer
// guards the WIRING (the import) and the CLASS CENSUS (the four primitives
// + the notes popover keep carrying the family; the two overlays carry the
// reference-measured set) so a future refactor cannot silently orphan
// either half.

const CSS = readFileSync(
  path.resolve(process.cwd(), "src/app/globals.css"),
  "utf8",
);

function readComponent(rel: string): string {
  return readFileSync(path.resolve(process.cwd(), rel), "utf8");
}

// The reference-measured overlay set (live-probed on omni-study1.base44.app,
// s129): the overlay fades IN and OUT. The clone's pre-CD1 overlay had none
// of these — it appeared and vanished instantly.
const OVERLAY_ANIMATION_CLASSES = [
  "data-[state=open]:animate-in",
  "data-[state=open]:fade-in-0",
  "data-[state=closed]:animate-out",
  "data-[state=closed]:fade-out-0",
] as const;

// The surfaces that carry the animate-in family (the pre-CD1 census: the
// four Radix primitives' CONTENT nodes + the BZ3 notes popover panel).
const ANIMATED_SURFACES = [
  "src/components/ui/dialog.tsx",
  "src/components/ui/alert-dialog.tsx",
  "src/components/ui/dropdown-menu.tsx",
  "src/components/ui/select.tsx",
  "src/components/views/notes-view.tsx",
] as const;

describe("the overlay animation family wiring (S129/CD1)", () => {
  it("globals.css imports tw-animate-css after the tailwind import (the v4 port of the reference's animation layer)", () => {
    const tailwindIdx = CSS.indexOf("@import \"tailwindcss\";");
    const animateIdx = CSS.indexOf("@import \"tw-animate-css\";");
    expect(animateIdx, "the @import \"tw-animate-css\"; line is present").toBeGreaterThan(-1);
    expect(tailwindIdx).toBeGreaterThan(-1);
    expect(
      animateIdx,
      "the animate import rides after the tailwind import (the family extends the generated utilities)",
    ).toBeGreaterThan(tailwindIdx);
  });

  it("the dialog and alert-dialog OVERLAYS carry the reference-measured fade set (pre-CD1: no animation classes at all)", () => {
    // Scope to the OVERLAY component block — a whole-file includes() cannot
    // discriminate the overlay from the content (both live in one file and
    // share the family tokens).
    const overlayBlock = (rel: string, marker: string) => {
      const src = readComponent(rel);
      const start = src.indexOf(marker);
      expect(start, `${rel} defines ${marker}`).toBeGreaterThan(-1);
      const end = src.indexOf("displayName", start);
      expect(end).toBeGreaterThan(start);
      return src.slice(start, end);
    };
    const blocks = [
      overlayBlock("src/components/ui/dialog.tsx", "const DialogOverlay"),
      overlayBlock("src/components/ui/alert-dialog.tsx", "const AlertDialogOverlay"),
    ];
    for (const block of blocks) {
      for (const cls of OVERLAY_ANIMATION_CLASSES) {
        expect(
          block.includes(cls),
          `the overlay block carries ${cls} (the reference overlay fades in AND out)`,
        ).toBe(true);
      }
    }
  });

  it("every animate-in consumer keeps carrying the family (the census — a refactor cannot silently orphan the classes)", () => {
    for (const rel of ANIMATED_SURFACES) {
      const src = readComponent(rel);
      expect(
        /data-\[state=open\]:animate-in/.test(src),
        `${rel} still carries the enter family`,
      ).toBe(true);
      expect(
        /data-\[state=closed\]:animate-out/.test(src),
        `${rel} still carries the exit family`,
      ).toBe(true);
    }
  });

  it("the dead v3 plugin is not re-declared (tw-animate-css is the v4 line — tailwindcss-animate was removed with the wiring)", () => {
    const pkg = readFileSync(path.resolve(process.cwd(), "package.json"), "utf8");
    expect(
      pkg.includes("\"tailwindcss-animate\""),
      "tailwindcss-animate (the v3 plugin) must not ride package.json under Tailwind v4",
    ).toBe(false);
    expect(pkg.includes("\"tw-animate-css\"")).toBe(true);
  });
});
