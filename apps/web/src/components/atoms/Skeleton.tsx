import { cn } from "@/lib/cn";

/**
 * Placeholder shown while a request is in flight. A shimmer sweeps across the
 * block — reads as "loading" more clearly than a flat pulse. Shape it with
 * `className` so the skeleton matches the final content's footprint and there's
 * no layout shift on swap.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-overlay",
        "after:absolute after:inset-0 after:-translate-x-full",
        "after:bg-linear-to-r after:from-transparent after:via-overlay-strong after:to-transparent",
        "after:animate-[shimmer_1.6s_infinite]",
        className,
      )}
      aria-hidden="true"
    />
  );
}
