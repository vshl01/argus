import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Surface primitive. Every panel/tile/card in the app composes from this.
 *
 * `variant` sets the resting elevation:
 *   - "flat"    flush with the canvas, hairline border (default)
 *   - "raised"  lifted surface with a soft shadow
 *   - "inset"   recessed well (e.g. chart area, code blocks)
 * `interactive` layers a hover lift + accent-aware border on top — use it on
 * clickable cards (the coin tiles, news cards).
 */
type Variant = "flat" | "raised" | "inset";

const variantClass: Record<Variant, string> = {
  flat: "border border-border-subtle bg-surface",
  raised: "border border-border-subtle bg-surface-raised shadow-md",
  inset: "border border-border-subtle bg-surface-inset",
};

export function Card({
  variant = "flat",
  interactive = false,
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & {
  variant?: Variant;
  interactive?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl",
        variantClass[variant],
        interactive &&
          "transition-[transform,border-color,box-shadow,background-color] " +
            "duration-200 ease-out-expo " +
            "hover:-translate-y-0.5 hover:border-border-strong " +
            "hover:bg-surface-raised hover:shadow-lg",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
