import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Surface primitive. Every panel/tile/card in the app composes from this.
 *
 * `interactive` adds a subtle hover lift — use it on clickable cards
 * (e.g. the coin tiles on the home page).
 */
export function Card({
  interactive = false,
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & {
  interactive?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border-subtle bg-surface",
        interactive &&
          "transition-all duration-200 hover:border-border-default " +
            "hover:bg-surface-raised hover:-translate-y-0.5",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
