import type { Metadata } from "next";

import { redirect } from "next/navigation";

import { RumPanel } from "@/components/rum/rum-panel";
import { getCurrentUser } from "@/lib/server/auth";

export const metadata: Metadata = {
  // absolute — the root layout has no template; the panel title is pinned
  // verbatim (S19).
  title: { absolute: "Performance Diagnostics · StudyFlow" },
};

// The /rum gate (ADR-017): a SERVER component — an anonymous visit redirects
// to /login and never renders panel chrome. Linked from nowhere by design;
// owners navigate directly.
export default async function RumPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return <RumPanel />;
}
