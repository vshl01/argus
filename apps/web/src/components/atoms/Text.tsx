import { type HTMLAttributes, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Typography primitive — one place to set the type scale.
 *
 * Variants describe *semantic* roles, not raw sizes. Adjusting the scale
 * later means editing this file once, not every screen.
 */

type Variant =
  | "display"
  | "title"
  | "subtitle"
  | "body"
  | "caption"
  | "label"
  | "mono";

type Tone = "primary" | "secondary" | "tertiary" | "accent";

interface TextProps extends Omit<HTMLAttributes<HTMLElement>, "color"> {
  as?: ElementType;
  variant?: Variant;
  tone?: Tone;
  numeric?: boolean;
  children: ReactNode;
}

const variantClass: Record<Variant, string> = {
  display: "text-4xl md:text-5xl font-semibold tracking-tight",
  title: "text-2xl md:text-3xl font-semibold tracking-tight",
  subtitle: "text-lg font-medium",
  body: "text-sm",
  caption: "text-xs",
  label: "text-xs uppercase tracking-wider font-medium",
  mono: "text-sm font-mono",
};

const toneClass: Record<Tone, string> = {
  primary: "text-text-primary",
  secondary: "text-text-secondary",
  tertiary: "text-text-tertiary",
  accent: "text-accent",
};

export function Text({
  as: Component = "span",
  variant = "body",
  tone = "primary",
  numeric = false,
  className,
  children,
  ...rest
}: TextProps) {
  return (
    <Component
      className={cn(
        variantClass[variant],
        toneClass[tone],
        numeric && "num",
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}
