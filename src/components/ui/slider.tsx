"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

/**
 * The reference's assignment slider: h-2 slate-200 track with an sRGB-exact
 * violet→indigo gradient fill (the .sf-slider-fill element the S12
 * forced-colors contract restores) and a 20px white/violet thumb.
 */
function Slider({
  className,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      className={cn(
        "relative flex w-full touch-none items-center select-none",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="relative h-2 w-full grow overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
      >
        <SliderPrimitive.Range
          data-slot="slider-fill"
          className="sf-slider-fill absolute h-full"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgb(var(--sf-primary)), rgb(var(--sf-primary-gradient-to)))",
          }}
        />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        data-slot="slider-thumb"
        className="block size-5 rounded-full border-2 border-sf-primary bg-white shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-sf-primary/40 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
      />
    </SliderPrimitive.Root>
  );
}

export { Slider };
