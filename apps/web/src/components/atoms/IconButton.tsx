"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface IconButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  label: string;
  children: ReactNode;
}

/**
 * Square button for icon-only controls. `label` becomes the accessible name
 * (passed to `aria-label`) — non-optional so a screen reader user always knows
 * what the control does.
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton({ label, className, children, ...rest }, ref) {
    return (
      <motion.button
        ref={ref}
        type="button"
        aria-label={label}
        whileTap={{ scale: 0.94 }}
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-md " +
            "text-text-secondary transition-colors " +
            "hover:bg-overlay hover:text-text-primary " +
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
          className,
        )}
        {...rest}
      >
        {children}
      </motion.button>
    );
  },
);
