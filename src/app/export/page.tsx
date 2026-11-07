import type { Metadata } from "next";

import { redirect } from "next/navigation";

import { ExportPanel } from "@/components/export/export-panel";
import { checkRateLimit } from "@/lib/auth";
import { getCurrentUser, publicUser } from "@/lib/server/auth";
import { renderExportEnvelope } from "@/lib/server/export-build";
import { ExportTooLargeError } from "@/lib/server/http";

export const metadata: Metadata = { title: "Export Your Data" };

// The /export gate (ADR-019): a SERVER component — an anonymous visit
// redirects to /login and never renders panel chrome. Linked from nowhere
// by design (the zero-nav-linkage guard); owners navigate directly.
export default async function ExportPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // S153/DB2 (audit B-L2): the page's OWN dedicated budget — the page
  // renders the SAME envelope the route serves (the S141/CP4 size
  // signal: the full 20-findMany serialize) per view, so a scripted
  // authed session looping this linked-from-nowhere door drove
  // byte-identical work to the budgeted download at line rate, unbudgeted
  // (the route twin rides export:${user.id} 10/15-min). The key is
  // DEDICATED (exportPage:) — the shared-key variant would spend the
  // demo user's export: budget the e2e s21/s23 legs need (3 of 10 per
  // boot). Checked AFTER the auth gate (the DA4 doctrine — the anon
  // redirect above stays budget-free) and BEFORE the expensive work:
  // the rate-limited render below skips the envelope render entirely, so
  // past the budget a view costs one cookie verify and a ~200-byte body
  // (a page cannot answer 429 — the honest amber alert is the documented
  // shape; the in-process single-node limiter is the family posture).
  const pageLimit = checkRateLimit(`exportPage:${user.id}`, 10);
  if (!pageLimit.ok) {
    return (
      <main className="mx-auto w-full max-w-3xl p-6 pt-10">
        <div role="alert" className="sf-alert-amber rounded-lg px-3 py-2 text-sm">
          Too many export page views. Please wait a few minutes and try again.
        </div>
      </main>
    );
  }

  // S157/DF1 (grid-from-envelope, the F5 close): ONE read pass feeds the
  // grid AND the size signal. The page's own 20-count query family is
  // GONE — the chip grid rides the envelope's structured `counts` (the
  // same loop-local record the head fragment serializes; insertion order
  // = EXPORT_COLLECTIONS, byte-identical to the hand-written literal it
  // replaces), which (a) halves the per-view query count (20 count() +
  // 20 findMany → 20 findMany), (b) eliminates the page-internal skew
  // class (the old grid's counts read before the envelope's reads — a
  // mid-view write could make the two disagree; now they derive from one
  // pass by construction), and (c) closes the L-1 manifest-completeness
  // gap STRUCTURALLY (the grid derives from EXPORT_COLLECTIONS through
  // the seam — a dropped collection is a READERS compile error, never a
  // 19-chip grid).
  //
  // S141/CP4: the size signal — the page renders the SAME envelope the
  // download answers (the shared export-build seam), so the panel's
  // warning can never drift from what the route actually serves. Cost
  // honesty: the full serialize per view on the linked-from-nowhere
  // owner surface is accepted (the asymmetry's detection half — an
  // export past the restore cap must be knowable BEFORE the user
  // collects a 413 on restore, and each blind retry burns import
  // budget).
  //
  // S148/CW2 (audit B-L3): the seam THROWS ExportTooLargeError past the
  // 256 MiB ceiling (the served-body bound). The narrow catch renders
  // the SAME panel with the error's computed bytes + its COMPLETE counts
  // record (the driver counts every collection before it throws — the
  // over-ceiling grid survives), and the panel derives the over-ceiling
  // state itself from the predicate (exportOverCeiling), so the
  // over-ceiling render and the route's 413 can never drift (one source:
  // the seam's gate). Everything else re-throws — the honest 500 path is
  // unchanged.
  let exportBytes: number;
  let counts: Record<string, number>;
  try {
    const rendered = await renderExportEnvelope(publicUser(user));
    exportBytes = rendered.bytes;
    counts = rendered.counts;
  } catch (err: unknown) {
    if (err instanceof ExportTooLargeError) {
      exportBytes = err.bytes;
      counts = err.counts;
    } else {
      throw err;
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl p-6 pt-10">
      <ExportPanel
        counts={Object.entries(counts).map(([name, count]) => ({ name, count }))}
        email={user.email}
        exportBytes={exportBytes}
      />
    </main>
  );
}
