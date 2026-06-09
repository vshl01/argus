"use client";

import { motion } from "framer-motion";

import { Button } from "@/components/atoms/Button";
import { Kbd } from "@/components/atoms/Kbd";
import { Text } from "@/components/atoms/Text";
import { useCommandPalette } from "@/components/organisms/CommandPalette";
import { fadeRise, staggerContainer } from "@/lib/motion";

/**
 * Landing band at the top of the home page. Frames the product in two lines,
 * gives one clear primary action (open search) and one secondary (scroll to
 * the live markets). Confident and compact — not a marketing wall.
 */
export function HomeHero() {
  const palette = useCommandPalette();

  return (
    <motion.section
      variants={staggerContainer(0.08)}
      initial="hidden"
      animate="show"
      className="relative flex flex-col items-start gap-6 py-10 md:py-16"
    >
      <motion.div variants={fadeRise}>
        <span className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface/60 px-3 py-1 text-xs text-text-secondary backdrop-blur">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-positive opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-positive" />
          </span>
          Live market data · no predictions
        </span>
      </motion.div>

      <motion.h1
        variants={fadeRise}
        className="max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl"
      >
        <span className="text-gradient">Read the signals.</span>
        <br />
        Decide for yourself.
      </motion.h1>

      <motion.div variants={fadeRise}>
        <Text variant="body" tone="secondary" className="block max-w-xl text-base">
          Argus puts prices, news, and indicators in one calm view — and overlays
          every headline right on the chart. A thinking tool, not a prediction
          tool.
        </Text>
      </motion.div>

      <motion.div variants={fadeRise} className="flex flex-wrap items-center gap-3">
        <Button size="lg" onClick={palette.open}>
          <SearchGlyph />
          Search a coin
          <span className="ml-1 hidden items-center gap-0.5 opacity-80 sm:flex">
            <Kbd className="border-text-inverse/20 bg-black/10 text-text-inverse">
              ⌘
            </Kbd>
            <Kbd className="border-text-inverse/20 bg-black/10 text-text-inverse">
              K
            </Kbd>
          </span>
        </Button>
        <a
          href="#markets"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-border-default bg-surface-raised px-6 text-base font-medium text-text-primary shadow-sm transition-colors hover:border-border-strong hover:bg-overlay focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Explore markets ↓
        </a>
      </motion.div>
    </motion.section>
  );
}

function SearchGlyph() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
