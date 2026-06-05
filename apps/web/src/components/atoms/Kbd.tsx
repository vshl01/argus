import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Keyboard-key hint pill (e.g. ⌘ K). Decorative — not focusable. */
export function Kbd({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded",
        "border border-border-default bg-surface-inset px-1.5",
        "font-sans text-[10px] font-medium text-text-tertiary",
        className,
      )}
    >
      {children}
    </kbd>
  );
}
