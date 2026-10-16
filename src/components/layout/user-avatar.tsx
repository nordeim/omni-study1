"use client";

// ---------------------------------------------------------------------------
// The footer/settings avatar (§5 chrome anatomy): a gradient circle whose
// default state is the user's initial (the reference's own default) and an
// emoji once one is picked. The gradient is the measured LIGHTER pair —
// avatar-from → avatar-to (violet-400 → indigo-500), never the brand chips'
// 500→600 (S4-G pin: rgb(167,139,250) → rgb(99,102,241)).
//
// Trap 5: the sRGB-exact stops ride an inline backgroundImage through the
// runtime accent vars — never a utility gradient (v4 interpolates in oklab).
// ---------------------------------------------------------------------------

import { initialFor } from "@/components/views/shared";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/lib/store";

type UserAvatarProps = {
  /** 36px rail/footer chip ("sm") or the 56px settings tile ("lg"). */
  size?: "sm" | "lg";
  className?: string;
};

export function UserAvatar({ size = "sm", className }: UserAvatarProps) {
  const avatar = useThemeStore((s) => s.avatar);
  const userName = useThemeStore((s) => s.userName);
  const email = useThemeStore((s) => s.email);

  const label = avatar !== "" ? avatar : initialFor(userName, email);

  return (
    <span
      className={cn(
        "flex shrink-0 select-none items-center justify-center rounded-full text-white",
        size === "lg" ? "h-14 w-14 text-xl" : "h-9 w-9 text-sm font-semibold",
        className,
      )}
      style={{
        backgroundImage:
          "linear-gradient(to right, rgb(var(--sf-primary-avatar-from)), rgb(var(--sf-primary-avatar-to)))",
      }}
    >
      {label}
    </span>
  );
}
