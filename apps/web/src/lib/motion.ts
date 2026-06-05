import type { Transition, Variants } from "framer-motion";

/**
 * One motion vocabulary for the whole app.
 *
 * Components import from here instead of hand-rolling `initial`/`animate` props,
 * so reveals, stagger timing, and easing stay consistent everywhere. The
 * `prefers-reduced-motion` media query in globals.css neutralizes the actual
 * durations for users who ask for less motion, so these can stay expressive.
 */

/** Snappy spring for hover/tap micro-interactions. */
export const springSnappy: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
};

/** Softer spring for layout/position shifts (segmented control, lifts). */
export const springSoft: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 26,
};

/** Default eased tween for opacity/translate reveals. */
export const easeOut: Transition = {
  duration: 0.5,
  ease: [0.16, 1, 0.3, 1],
};

/** Fade + rise — the canonical "section appears" reveal. */
export const fadeRise: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: easeOut },
};

/** Container that staggers its `fadeRise` children in. */
export function staggerContainer(stagger = 0.05, delayChildren = 0): Variants {
  return {
    hidden: {},
    show: {
      transition: { staggerChildren: stagger, delayChildren },
    },
  };
}

/** Single grid/list item — pairs with `staggerContainer`. */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};
