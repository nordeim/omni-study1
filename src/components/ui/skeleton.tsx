import { cn } from "@/lib/utils";

/** The shimmer placeholder (globals.css .sf-skeleton + sf-shimmer keyframes). */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("sf-skeleton rounded-md", className)}
      {...props}
    />
  );
}

export { Skeleton };
