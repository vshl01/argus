"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { springSnappy } from "@/lib/motion";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium " +
  "transition-colors focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-accent focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-canvas disabled:opacity-50 " +
  "disabled:pointer-events-none";

const variantClass: Record<Variant, string> = {
  primary:
    "bg-accent text-text-inverse shadow-glow " +
    "hover:bg-accent-hover",
  secondary:
    "bg-surface-raised text-text-primary border border-border-default " +
    "shadow-sm hover:border-border-strong hover:bg-overlay",
  ghost: "text-text-secondary hover:text-text-primary hover:bg-overlay",
};

const sizeClass: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = "primary", size = "md", className, children, ...rest },
    ref,
  ) {
    return (
      <motion.button
        ref={ref}
        whileHover={{ y: -1 }}
        whileTap={{ y: 0, scale: 0.98 }}
        transition={springSnappy}
        className={cn(base, variantClass[variant], sizeClass[size], className)}
        {...rest}
      >
        {children}
      </motion.button>
    );
  },
);
