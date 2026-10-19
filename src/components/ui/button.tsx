"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// The session-5 chrome rule: primary CTAs use variant="gradient" (the
// .sf-gradient classes — sRGB-exact stops through the runtime accent vars).
// The default variant stays the plain solid token button.

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-sf-primary text-sf-primary-foreground shadow-sm hover:bg-sf-primary-strong sf-print-exact",
        gradient: "sf-gradient sf-gradient-shadow text-sf-primary-foreground",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-[#e5e5e5] bg-card text-[#0a0a0a] shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-card dark:text-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-sf-primary-strong underline-offset-4 hover:underline",
        // S9-R2 (measured s69): the reference's More Options button is the
        // shadcn default shape on a neutral-950 fill (rgb(10,10,10), 6px
        // radius) — the dark superset inverts the ramp. Arbitrary hexes on
        // purpose: the neutral ramp is unpinned (v4 trap 10 — unpinned
        // palette classes serialize as lab()).
        neutral: "bg-[#0a0a0a] text-[#fafafa] shadow-sm hover:bg-[#262626] sf-print-exact dark:bg-[#f5f5f5] dark:text-[#0a0a0a] dark:hover:bg-[#d4d4d4]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, type, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : (type ?? "button")}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
