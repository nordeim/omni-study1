"use client";

// The measured auth surface (sub-screens swap client-side — see
// src/components/auth/login-surface.tsx). S129/CD6d: the shared shell
// (this route and /login were byte-identical copies). The route-aware
// default lives in login-surface (S129/CD6a): bare /reset-password
// renders the reset sub-screen with the missing-token explanation.
export { default } from "@/components/auth/auth-route";
