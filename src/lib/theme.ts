// ---------------------------------------------------------------------------
// The theme system's pure seam — unit-pinned by tests/theme.test.ts and
// tests/theme-cache.test.ts.
//
// Token convention: RGB-triplet strings ("139 92 246"), applied as CSS vars
// on <html> by the theme store (applyToDocument) and consumed as
// rgb(var(--sf-…)). Every value below was measured on the live reference
// (AGENTS.md + docs/Tailwind-V4-Validation-Report.md) — treat each hex as a
// parity pin. green/orange are the EMERALD/AMBER families (S5-F).
// ---------------------------------------------------------------------------

export type ThemeMode = "light" | "dark" | "system";
export type Accent = "violet" | "blue" | "green" | "orange" | "pink" | "red" | "teal";

export const ACCENTS: Accent[] = [
  "violet",
  "blue",
  "green",
  "orange",
  "pink",
  "red",
  "teal",
];

export type AccentToken = {
  primary: string; // 500 — buttons, active nav, chips
  primaryFg: string; // text on primary
  strong: string; // 600 — "View All" links, active nav text, clock date
  strongDark: string; // 300 — dark-mode strong counterpart
  deep: string; // 700 — clock time text
  soft: string; // 100 — icon chips, active tint layering
  softDark: string; // 900 — dark-mode soft counterpart
  softest: string; // 50 — clock chip gradient start
  softestAdjacent: string; // ADJACENT hue 50 — clock chip gradient END
  gradientTo: string; // ADJACENT hue 600 — brand chips + CTA end
  gradientToStrong: string; // ADJACENT hue 700 — CTA hover end (S5)
  // S80 note (the s80 audit, I2): avatarFrom is a CROSS-CONSUMER token —
  // the avatar gradient start (user-avatar, studygroups) AND the dark-mode
  // clock-DATE text color (globals.css .sf-clock-date, S79/AF5). Retuning
  // the 400 step for avatar aesthetics silently restyles the sidebar date
  // on all 20 views; a dedicated text token is the deferred follow-up.
  avatarFrom: string; // 400 — avatar gradient start + dark clock-date text
  avatarTo: string; // ADJACENT hue 500 — avatar gradient end + nav active stop 2
  emptyFrom: string; // 100 — empty-state block start
  emptyTo: string; // ADJACENT hue 100 — empty-state block end
};

export const ACCENT_TOKENS: Record<Accent, AccentToken> = {
  violet: {
    primary: "139 92 246", // #8b5cf6
    primaryFg: "255 255 255",
    strong: "124 58 237", // #7c3aed
    strongDark: "196 181 253", // violet-300
    deep: "109 40 217", // #6d28d9
    soft: "243 232 255", // violet-100
    softDark: "76 29 149", // violet-900
    softest: "245 243 255", // violet-50
    softestAdjacent: "238 242 255", // indigo-50
    gradientTo: "79 70 229", // indigo-600
    gradientToStrong: "67 56 202", // indigo-700
    avatarFrom: "167 139 250", // violet-400
    avatarTo: "99 102 241", // indigo-500
    emptyFrom: "237 233 254", // violet-100
    emptyTo: "224 231 255", // indigo-100
  },
  blue: {
    primary: "59 130 246", // #3b82f6
    primaryFg: "255 255 255",
    strong: "37 99 235", // blue-600
    strongDark: "147 197 253", // blue-300
    deep: "29 78 216", // blue-700
    soft: "219 234 254", // blue-100
    softDark: "30 58 138", // blue-900
    softest: "239 246 255", // blue-50
    softestAdjacent: "240 249 255", // sky-50
    gradientTo: "2 132 199", // sky-600
    gradientToStrong: "3 105 161", // sky-700
    avatarFrom: "96 165 250", // blue-400
    avatarTo: "14 165 233", // sky-500
    emptyFrom: "219 234 254", // blue-100
    emptyTo: "224 242 254", // sky-100
  },
  green: {
    primary: "16 185 129", // emerald-500 (the reference swatch)
    primaryFg: "255 255 255",
    strong: "5 150 105", // emerald-600
    strongDark: "110 231 183", // emerald-300
    deep: "4 120 87", // emerald-700
    soft: "209 250 229", // emerald-100
    softDark: "6 78 59", // emerald-900
    softest: "236 253 245", // emerald-50
    softestAdjacent: "240 253 250", // teal-50
    gradientTo: "13 148 136", // teal-600
    gradientToStrong: "15 118 110", // teal-700
    avatarFrom: "52 211 153", // emerald-400
    avatarTo: "20 184 166", // teal-500
    emptyFrom: "209 250 229", // emerald-100
    emptyTo: "204 251 241", // teal-100
  },
  orange: {
    primary: "245 158 11", // amber-500 (the reference swatch)
    primaryFg: "255 255 255",
    strong: "217 119 6", // amber-600
    strongDark: "252 211 77", // amber-300
    deep: "180 83 9", // amber-700
    soft: "254 243 199", // amber-100
    softDark: "120 53 15", // amber-900
    softest: "255 251 235", // amber-50
    softestAdjacent: "255 247 237", // orange-50
    gradientTo: "234 88 12", // orange-600
    gradientToStrong: "194 65 12", // orange-700
    avatarFrom: "251 191 36", // amber-400
    avatarTo: "249 115 22", // orange-500
    emptyFrom: "254 243 199", // amber-100
    emptyTo: "255 237 213", // orange-100
  },
  pink: {
    primary: "236 72 153", // #ec4899
    primaryFg: "255 255 255",
    strong: "219 39 119", // pink-600
    strongDark: "249 168 212", // pink-300
    deep: "190 24 93", // pink-700
    soft: "252 231 243", // pink-100
    softDark: "131 24 67", // pink-900
    softest: "253 242 248", // pink-50
    softestAdjacent: "255 241 242", // rose-50
    gradientTo: "225 29 72", // rose-600
    gradientToStrong: "190 18 60", // rose-700
    avatarFrom: "244 114 182", // pink-400
    avatarTo: "244 63 94", // rose-500
    emptyFrom: "252 231 243", // pink-100
    emptyTo: "255 228 230", // rose-100
  },
  red: {
    primary: "239 68 68", // #ef4444
    primaryFg: "255 255 255",
    strong: "220 38 38", // red-600
    strongDark: "252 165 165", // red-300
    deep: "185 28 28", // red-700
    soft: "254 226 226", // red-100
    softDark: "127 29 29", // red-900
    softest: "254 242 242", // red-50
    softestAdjacent: "255 247 237", // orange-50
    gradientTo: "234 88 12", // orange-600
    gradientToStrong: "194 65 12", // orange-700
    avatarFrom: "248 113 113", // red-400
    avatarTo: "249 115 22", // orange-500
    emptyFrom: "254 226 226", // red-100
    emptyTo: "255 237 213", // orange-100
  },
  teal: {
    primary: "20 184 166", // #14b8a6
    primaryFg: "255 255 255",
    strong: "13 148 136", // teal-600
    strongDark: "94 234 212", // teal-300
    deep: "15 118 110", // teal-700
    soft: "204 251 241", // teal-100
    softDark: "19 78 74", // teal-900
    softest: "240 253 250", // teal-50
    softestAdjacent: "236 254 255", // cyan-50
    gradientTo: "8 145 178", // cyan-600
    gradientToStrong: "14 116 144", // cyan-700
    avatarFrom: "45 212 191", // teal-400
    avatarTo: "6 182 212", // cyan-500
    emptyFrom: "204 251 241", // teal-100
    emptyTo: "207 250 254", // cyan-100
  },
};

export function isAccent(value: unknown): value is Accent {
  return typeof value === "string" && (ACCENTS as string[]).includes(value);
}

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system";
}

/** Resolve a stored mode against the OS preference (system follows the OS). */
export function resolveMode(mode: ThemeMode, systemPrefersDark: boolean): "light" | "dark" {
  if (mode === "system") return systemPrefersDark ? "dark" : "light";
  return mode;
}

/**
 * The COMPLETE --sf-* variable set for an accent (S3-J regression pin: exactly
 * 15 entries — a partial set leaves stale violet tokens on non-violet accents).
 * Keys are kebab-case (the S8 e2e lesson: camelCase suffixes resolve no var).
 */
export function accentCssVars(accent: Accent): Record<string, string> {
  const t = ACCENT_TOKENS[accent];
  return {
    "--sf-primary": t.primary,
    "--sf-primary-foreground": t.primaryFg,
    "--sf-primary-strong": t.strong,
    "--sf-primary-strong-dark": t.strongDark,
    "--sf-primary-deep": t.deep,
    "--sf-primary-soft": t.soft,
    "--sf-primary-soft-dark": t.softDark,
    "--sf-primary-softest": t.softest,
    "--sf-primary-softest-adjacent": t.softestAdjacent,
    "--sf-primary-gradient-to": t.gradientTo,
    "--sf-primary-gradient-to-strong": t.gradientToStrong,
    "--sf-primary-avatar-from": t.avatarFrom,
    "--sf-primary-avatar-to": t.avatarTo,
    "--sf-primary-empty-from": t.emptyFrom,
    "--sf-primary-empty-to": t.emptyTo,
  };
}

/** The measured active-nav gradient (S8-A): primary → avatarTo at 10% alpha. */
export const NAV_ACTIVE_GRADIENT_STOPS = {
  from: "primary",
  to: "avatarTo",
  toCssVar: "avatar-to", // kebab-case CSS suffix — never camelCase
  alpha: 0.1,
} as const;

/** The reference's 24-emoji avatar picker (re-dumped s70, S11-7c — the
 *  s69 Z12 dump reported 22 but dropped ⭐ (index 6) and ⚽ (index 19);
 *  the scoped visible-tile dump is the authority). */
export const AVATAR_EMOJIS: string[] = [
  "🎓", "📚", "🧠", "💡", "🎯", "🚀", "⭐", "🌟",
  "🦊", "🐱", "🐶", "🐼", "🦁", "🐸", "🦉", "🐧",
  "🎨", "🎵", "🎮", "⚽", "🏀", "🎾", "🏆", "🎪",
];

// ---------------------------------------------------------------------------
// The localStorage theme cache (S11) — the writer is applyToDocument in
// store.ts; the reader is THEME_BOOT_SCRIPT (a hand-maintained inline string
// that cannot import this module). These helpers + the tests ARE the sync
// contract: change the payload shape and update the script in the same commit.
// ---------------------------------------------------------------------------

export const THEME_CACHE_KEY = "sf-theme";

export function themeCachePayload(mode: ThemeMode, accent: Accent): string {
  return JSON.stringify({ mode, accent });
}

export function parseThemeCache(
  raw: string | null | undefined,
): { mode: ThemeMode; accent: Accent } | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return null;
    const { mode, accent } = parsed as Record<string, unknown>;
    if (!isThemeMode(mode) || !isAccent(accent)) return null;
    return { mode, accent };
  } catch {
    return null;
  }
}

/**
 * The pre-paint boot script (injected into <head> by layout.tsx). Hand-maintained
 * string — resolves the cached mode against matchMedia BEFORE first paint (no
 * cache → system fallback), registers the S12 print handlers (beforeprint
 * forces light, afterprint restores the pre-print state via __sfPrintDark),
 * and re-applies the cached accent tokens. The presence pins in
 * tests/theme-cache.test.ts are its sync contract.
 */
export const THEME_BOOT_SCRIPT = `
(function(){
  try {
    var KEY = "${THEME_CACHE_KEY}";
    var ACCENTS = ${JSON.stringify(ACCENTS)};
    var raw = localStorage.getItem("sf-theme");
    var mode = "system";
    var accent = "violet";
    if (raw) {
      try {
        var p = JSON.parse(raw);
        if (p && (p.mode === "light" || p.mode === "dark" || p.mode === "system") &&
            ACCENTS.indexOf(p.accent) !== -1) {
          mode = p.mode; accent = p.accent;
        }
      } catch (e) {}
    }
    var dark = mode === "dark" || (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (dark) document.documentElement.classList.add("dark");
    var TOKENS = {
      violet: ["primary","foreground","strong","strong-dark","deep","soft","soft-dark","softest","softest-adjacent","gradient-to","gradient-to-strong","avatar-from","avatar-to","empty-from","empty-to"],
      blue: ["primary","foreground","strong","strong-dark","deep","soft","soft-dark","softest","softest-adjacent","gradient-to","gradient-to-strong","avatar-from","avatar-to","empty-from","empty-to"],
      green: ["primary","foreground","strong","strong-dark","deep","soft","soft-dark","softest","softest-adjacent","gradient-to","gradient-to-strong","avatar-from","avatar-to","empty-from","empty-to"],
      orange: ["primary","foreground","strong","strong-dark","deep","soft","soft-dark","softest","softest-adjacent","gradient-to","gradient-to-strong","avatar-from","avatar-to","empty-from","empty-to"],
      pink: ["primary","foreground","strong","strong-dark","deep","soft","soft-dark","softest","softest-adjacent","gradient-to","gradient-to-strong","avatar-from","avatar-to","empty-from","empty-to"],
      red: ["primary","foreground","strong","strong-dark","deep","soft","soft-dark","softest","softest-adjacent","gradient-to","gradient-to-strong","avatar-from","avatar-to","empty-from","empty-to"],
      teal: ["primary","foreground","strong","strong-dark","deep","soft","soft-dark","softest","softest-adjacent","gradient-to","gradient-to-strong","avatar-from","avatar-to","empty-from","empty-to"]
    };
    var VALUES = ${JSON.stringify(Object.fromEntries(ACCENTS.map((a) => [a, Object.values(ACCENT_TOKENS[a])])))};
    var st = document.documentElement.style;
    var names = TOKENS[accent] || TOKENS.violet;
    var vals = VALUES[accent] || VALUES.violet;
    for (var i = 0; i < names.length; i++) st.setProperty("--sf-primary" + (names[i] === "primary" ? "" : "-" + names[i]), vals[i]);
    var meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.content = dark ? "#020617" : "#ffffff";
    document.head.appendChild(meta);
    var __sfPrintDark = false;
    window.addEventListener("beforeprint", function () {
      __sfPrintDark = document.documentElement.classList.contains("dark");
      document.documentElement.classList.remove("dark");
    });
    window.addEventListener("afterprint", function () {
      if (__sfPrintDark) document.documentElement.classList.add("dark");
      __sfPrintDark = false;
    });
  } catch (e) {}
})();
`;
