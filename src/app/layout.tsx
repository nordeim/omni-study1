import type { Metadata } from "next";

import "./globals.css";

import { Toaster } from "@/components/ui/toast";
import { siteUrl } from "@/lib/site";
import { THEME_BOOT_SCRIPT } from "@/lib/theme";

// The root layout is a SERVER component: metadata + the pre-paint theme boot
// script + the global toaster. The boot script resolves the cached theme
// against matchMedia BEFORE first paint (no FOUC for dark users, and the
// login route themes for dark-OS visitors) — see S11-1 / theme-system.spec.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: "StudyFlow — Your study companion",
  description:
    "Your study companion — tasks, schedule, notes, flashcards, and focus.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body className="sf-canvas min-h-dvh antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
