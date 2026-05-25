"use client";

import { motion } from "framer-motion";
import { useId } from "react";

import { cn } from "@/lib/cn";

/**
 * Pill-style segmented control. Wraps a sliding "indicator" pill behind the
 * active option using `layoutId` so framer-motion does the animation across
 * siblings. Used for the chart's interval selector.
 */
export function IntervalSwitcher<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (next: T) => void;
}) {
  const layoutId = useId();

  return (
    <div className="inline-flex items-center gap-1 rounded-md border border-border-subtle bg-surface p-1">
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              "relative h-7 rounded-sm px-3 text-xs font-medium transition-colors",
              active ? "text-text-primary" : "text-text-tertiary hover:text-text-secondary",
            )}
          >
            {active ? (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-sm bg-overlay"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            ) : null}
            <span className="relative">{opt}</span>
          </button>
        );
      })}
    </div>
  );
}
