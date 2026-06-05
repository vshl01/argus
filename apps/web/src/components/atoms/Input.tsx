"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Text input with optional leading/trailing slots (icons, shortcut hints).
 * Used by the coin search and command palette. Styling is token-driven so it
 * sits right on both themes.
 */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leading?: ReactNode;
  trailing?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { leading, trailing, className, ...rest },
  ref,
) {
  return (
    <div
      className={cn(
        "group flex h-10 items-center gap-2 rounded-lg border border-border-default",
        "bg-surface px-3 text-sm transition-colors",
        "focus-within:border-accent focus-within:ring-2 focus-within:ring-accent-soft",
        className,
      )}
    >
      {leading ? (
        <span className="shrink-0 text-text-tertiary">{leading}</span>
      ) : null}
      <input
        ref={ref}
        className={cn(
          "h-full w-full bg-transparent text-text-primary outline-none",
          "placeholder:text-text-tertiary",
        )}
        {...rest}
      />
      {trailing ? <span className="shrink-0">{trailing}</span> : null}
    </div>
  );
});
