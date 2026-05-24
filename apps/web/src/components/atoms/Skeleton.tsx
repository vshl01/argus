import { cn } from "@/lib/cn";

/**
 * Pulsing placeholder used while a request is in flight.
 * Pure presentation — no animation library needed, Tailwind's `animate-pulse`
 * keeps loading states cheap.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-overlay",
        className,
      )}
      aria-hidden="true"
    />
  );
}
