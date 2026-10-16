import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** shadcn's class merge helper (components.json alias "@/lib/utils"). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
