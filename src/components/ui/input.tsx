"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

// The S5 form-control palette: GRAY ramp (gray-200 borders, gray-950 text),
// h-9, transparent background. NOTE (S126/CA8): the placeholder rides
// --muted-foreground (hsl(220 9% 46%)) which COMPUTES to gray-500
// (rgb(107,114,128), 4.82:1 on white — AA-compliant), NOT gray-400 as this
// comment claimed for 100+ sessions (the s126 audit's A-L4 conversion
// error traced straight to the stale comment — computed styles are the
// ground truth).

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm text-foreground transition-colors",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
