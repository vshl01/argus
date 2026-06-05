"use client";

import { motion } from "framer-motion";
import { useId, type ReactNode } from "react";

import { cn } from "@/lib/cn";
import { springSoft } from "@/lib/motion";

export interface SegmentOption<T extends string> {
  value: T;
  label: ReactNode;
  /** Accessible name when `label` is an icon. */
  title?: string;
}

/**
 * Pill-style segmented control with a sliding active indicator (shared via
 * framer's `layoutId`). One component for the chart interval picker, the
 * grid⇄table view toggle, and the sort selector.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = "md",
  className,
}: {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (next: T) => void;
  size?: "sm" | "md";
  className?: string;
}) {
  const layoutId = useId();
  const h = size === "sm" ? "h-7" : "h-8";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-lg border border-border-subtle bg-surface-inset p-1",
        className,
      )}
      role="tablist"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            title={opt.title}
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative inline-flex items-center justify-center gap-1.5 rounded-md px-3",
              h,
              "text-xs font-medium transition-colors",
              active
                ? "text-text-primary"
                : "text-text-tertiary hover:text-text-secondary",
            )}
          >
            {active ? (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-md bg-surface shadow-sm"
                transition={springSoft}
              />
            ) : null}
            <span className="relative flex items-center gap-1.5">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
