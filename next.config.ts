import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Pin file tracing to this project so the standalone server always lands
  // at .next/standalone/server.js — even when the repo is cloned inside a
  // parent workspace that has its own lockfile.
  outputFileTracingRoot: path.join(import.meta.dirname, "."),
  // S120/BU22e: the build is the type gate (the §3 "do not set
  // ignoreBuildErrors" doctrine — bun run typecheck stays in the gate as
  // the faster feedback loop). Removed after verifying the build green.
  reactStrictMode: false,
  // Next 16's dev-origin protection silently blocks dev chunks for the
  // 127.0.0.1 origin (unhydrated page, native form GET fallbacks) — restore
  // both origins for local browser/probe access (see
  // docs/Tailwind-V4-Validation-Report.md, session-12 methodology note).
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  // Path-based SPA routing: the reference app's views live at real paths
  // (/Dashboard, /MyDay, /Tasks, ... — PascalCase, measured live). We keep
  // ONE page (src/app/page.tsx) and rewrite those paths onto it; the client
  // store syncs view state with location.pathname (see src/lib/router.ts).
  async rewrites() {
    return [
      { source: "/Dashboard", destination: "/" },
      { source: "/MyDay", destination: "/" },
      { source: "/Tasks", destination: "/" },
      { source: "/Calendar", destination: "/" },
      { source: "/Events", destination: "/" },
      { source: "/Timetable", destination: "/" },
      { source: "/Assignments", destination: "/" },
      { source: "/Exams", destination: "/" },
      { source: "/Notes", destination: "/" },
      { source: "/Flashcards", destination: "/" },
      { source: "/PracticeTests", destination: "/" },
      { source: "/StudyGroups", destination: "/" },
      { source: "/GradeTracker", destination: "/" },
      { source: "/Analytics", destination: "/" },
      { source: "/Files", destination: "/" },
      { source: "/Calculator", destination: "/" },
      { source: "/MathSolver", destination: "/" },
      { source: "/AIAssistant", destination: "/" },
      { source: "/FocusTimer", destination: "/" },
      { source: "/Settings", destination: "/" },
    ];
  },
  // S120/BU16 — the baseline security headers on EVERY route. The shipped
  // app had none: the authenticated SPA was framable (clickjacking on the
  // destructive surfaces), no page-level nosniff, no Referrer-Policy. HSTS
  // is deliberately absent: the documented Docker posture terminates TLS
  // upstream (add it where TLS ends at the app itself — DEPLOYMENT.md).
  // S138/CM9 (audit AI-4): a conservative Content-Security-Policy joins
  // the set — the omission, unlike HSTS, was never documented as
  // deliberate. The profile is matched to the app's VERIFIED resource
  // surface (all scripts/styles/fonts/images same-origin or inline — the
  // only same-origin fetch surface, no blob:/media/worker usage anywhere
  // in src/): 'unsafe-inline' on script/style is required by Next's
  // inline bootstrap, the theme boot script, and the app's inline style
  // attributes (a nonce-based profile needs middleware plumbing the
  // single-page architecture does not warrant); the profile still blocks
  // every EXTERNAL script/style/img/font/connect load, plugins
  // (object-src 'none'), base-url hijacks, framing, and off-origin form
  // posts. PRODUCTION-CONDITIONAL: `next dev`'s HMR websocket and dev
  // chunks stay ungated (the header is baked at `next build`, which sets
  // NODE_ENV=production); the standalone production server — and therefore
  // the full e2e certification — exercises the policy on every route.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          ...(process.env.NODE_ENV === "production"
            ? [
                {
                  key: "Content-Security-Policy",
                  value: [
                    "default-src 'self'",
                    "script-src 'self' 'unsafe-inline'",
                    "style-src 'self' 'unsafe-inline'",
                    "img-src 'self' data:",
                    "font-src 'self' data:",
                    "connect-src 'self'",
                    "object-src 'none'",
                    "base-uri 'self'",
                    "frame-ancestors 'none'",
                    "form-action 'self'",
                  ].join("; "),
                },
              ]
            : []),
        ],
      },
    ];
  },
};

export default nextConfig;
