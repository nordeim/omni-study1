"use client";

// ---------------------------------------------------------------------------
// The app + theme Zustand stores (§6). No React Context anywhere — views
// subscribe with selectors; the stores are the only mutation path.
//
// useAppStore  — SPA view state + chrome (sidebar collapse, mobile drawer).
// useThemeStore — mode/accent/avatar/identity applied to <html> as RGB
//                 triplet CSS vars via accentCssVars (the COMPLETE set).
// ---------------------------------------------------------------------------

import { create } from "zustand";

import {
  accentCssVars,
  isAccent,
  isThemeMode,
  resolveMode,
  themeCachePayload,
  THEME_CACHE_KEY,
  type Accent,
  type ThemeMode,
} from "./theme";
import { pathForView, viewFromPath, type ViewId } from "./router";

const SIDEBAR_COLLAPSED_KEY = "sf-sidebar-collapsed";

// ---- the authenticated user's /api/auth/me shape (camelCase User row) ------

export type AppUser = {
  id: string;
  email: string;
  fullName: string;
  avatarEmoji: string;
  themeMode: string;
  accentColor: string;
  notificationsEnabled: boolean;
  schoolName: string;
  gradeLevel: string;
  studyGoalHours: number;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

// ---- useAppStore ------------------------------------------------------------

type AppStore = {
  view: ViewId;
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;
  /** SPA navigation: pushes the canonical PascalCase path + flips the view. */
  navigate: (view: ViewId) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setMobileMenu: (open: boolean) => void;
  /** Mount-time sync: read the URL + the persisted collapse preference. */
  hydrate: () => void;
};

let popstateBound = false;

export const useAppStore = create<AppStore>((set, get) => ({
  view: "dashboard",
  sidebarCollapsed: false,
  mobileMenuOpen: false,

  navigate: (view) => {
    try {
      window.history.pushState({}, "", pathForView(view));
    } catch {
      // history unavailable (SSR/tests) — the view flip still happens
    }
    set({ view, mobileMenuOpen: false });
  },

  setSidebarCollapsed: (collapsed) => {
    set({ sidebarCollapsed: collapsed });
    try {
      window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? "true" : "false");
    } catch {
      // private mode — the preference just doesn't persist
    }
  },

  toggleSidebar: () => {
    get().setSidebarCollapsed(!get().sidebarCollapsed);
  },

  setMobileMenu: (open) => set({ mobileMenuOpen: open }),

  hydrate: () => {
    set({ view: viewFromPath(window.location.pathname) });
    try {
      set({ sidebarCollapsed: window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true" });
    } catch {
      // ignore — default expanded
    }
    if (!popstateBound) {
      popstateBound = true;
      window.addEventListener("popstate", () => {
        useAppStore.setState({ view: viewFromPath(window.location.pathname) });
      });
    }
  },
}));

// ---- useThemeStore ----------------------------------------------------------

type ThemeStore = {
  mode: ThemeMode;
  accent: Accent;
  avatar: string;
  userName: string;
  email: string;
  setMode: (mode: ThemeMode) => void;
  setAccent: (accent: Accent) => void;
  setEmail: (email: string) => void;
  setAvatar: (avatar: string) => void;
  setUserName: (userName: string) => void;
  /** Hydrate from the /api/auth/me user row, then apply to the document. */
  loadFromUser: (user: AppUser) => void;
  /** Stamp the --sf-* vars + dark class + theme-color meta + the cache. */
  applyToDocument: () => void;
  /** Re-apply on OS scheme changes while mode === "system". */
  installSystemThemeTracking: () => void;
  /** Sign-out: drop the localStorage cache (the boot script re-defaults). */
  clearThemeCache: () => void;
};

function systemPrefersDark(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function updateThemeColorMeta(dark: boolean): void {
  const metas = document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]:not([media])');
  const trailing = metas.length > 0 ? metas[metas.length - 1] : null;
  const content = dark ? "#020617" : "#ffffff";
  if (trailing) {
    trailing.setAttribute("content", content);
    return;
  }
  const meta = document.createElement("meta");
  meta.name = "theme-color";
  meta.content = content;
  document.head.appendChild(meta);
}

let systemTrackingInstalled = false;

export const useThemeStore = create<ThemeStore>((set, get) => ({
  mode: "system",
  accent: "violet",
  avatar: "",
  userName: "",
  email: "",

  setMode: (mode) => {
    set({ mode });
    get().applyToDocument();
  },

  setAccent: (accent) => {
    set({ accent });
    get().applyToDocument();
  },

  setEmail: (email) => set({ email }),
  setAvatar: (avatar) => set({ avatar }),
  setUserName: (userName) => set({ userName }),

  loadFromUser: (user) => {
    set({
      mode: isThemeMode(user.themeMode) ? user.themeMode : "system",
      accent: isAccent(user.accentColor) ? user.accentColor : "violet",
      avatar: typeof user.avatarEmoji === "string" ? user.avatarEmoji : "",
      userName: typeof user.fullName === "string" ? user.fullName : "",
      email: typeof user.email === "string" ? user.email : "",
    });
    get().applyToDocument();
  },

  applyToDocument: () => {
    if (typeof document === "undefined") return;
    const { mode, accent } = get();
    const dark = resolveMode(mode, systemPrefersDark()) === "dark";
    const root = document.documentElement;
    root.classList.toggle("dark", dark);
    const style = root.style;
    for (const [name, value] of Object.entries(accentCssVars(accent))) {
      style.setProperty(name, value);
    }
    try {
      window.localStorage.setItem(THEME_CACHE_KEY, themeCachePayload(mode, accent));
    } catch {
      // private mode — the cache just doesn't persist
    }
    updateThemeColorMeta(dark);
  },

  installSystemThemeTracking: () => {
    if (typeof window === "undefined" || systemTrackingInstalled) return;
    systemTrackingInstalled = true;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", () => {
      // Explicit light/dark are user intent — never OS-followed; system
      // mode re-resolves (and re-applies) whenever the OS flips.
      if (useThemeStore.getState().mode === "system") {
        useThemeStore.getState().applyToDocument();
      }
    });
  },

  clearThemeCache: () => {
    try {
      window.localStorage.removeItem(THEME_CACHE_KEY);
    } catch {
      // ignore
    }
  },
}));
