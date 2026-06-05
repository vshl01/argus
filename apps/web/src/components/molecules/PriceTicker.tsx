"use client";

import { motion } from "framer-motion";

import { formatPrice } from "@/lib/formatters/price";
import { cn } from "@/lib/cn";

/**
 * Big animated price readout for the coin detail header. Keying the motion
 * element on the value means a fresh instance mounts whenever the price
 * changes, which triggers the soft fade — a subtle "tick" on update.
 */
export function PriceTicker({
  price,
  size = "xl",
}: {
  price: number | null | undefined;
  size?: "lg" | "xl";
}) {
  const sizeClass = size === "xl" ? "text-4xl md:text-5xl" : "text-3xl";

  return (
    <motion.span
      key={price}
      initial={{ opacity: 0.5, y: 2 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "num inline-block font-semibold tracking-tight text-text-primary",
        sizeClass,
      )}
    >
      {formatPrice(price)}
    </motion.span>
  );
}
