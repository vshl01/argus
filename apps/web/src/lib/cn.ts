import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Compose Tailwind class names. Resolves conflicting utilities to the last-
 * declared one (e.g. `cn("p-2", "p-4")` -> `"p-4"`), and accepts conditional
 * arrays/objects like clsx does.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
