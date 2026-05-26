"use client";

import { AnimatePresence, motion } from "framer-motion";

import { Card } from "@/components/atoms/Card";
import { Skeleton } from "@/components/atoms/Skeleton";
import { Text } from "@/components/atoms/Text";
import { CoinTile } from "@/components/molecules/CoinTile";
import { useCoinList } from "@/hooks/useCoins";

const SKELETON_COUNT = 8;

/**
 * The home page's centerpiece — a responsive grid of coin tiles, staggered
 * in on first paint.
 */
export function CoinGrid() {
  const { coins, status, error } = useCoinList();

  if (status === "loading" && coins.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <Skeleton key={i} className="h-[120px]" />
        ))}
      </div>
    );
  }

  if (status === "error") {
    return (
      <Card className="p-6 text-center">
        <Text variant="subtitle" tone="primary">
          Couldn&apos;t load coins
        </Text>
        <Text variant="caption" tone="secondary" className="mt-1 block">
          {error ?? "Try refreshing the page."}
        </Text>
      </Card>
    );
  }

  if (coins.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Text variant="subtitle">No coins tracked yet</Text>
        <Text variant="caption" tone="secondary" className="mt-1 block">
          Background fetcher hasn&apos;t populated the database. Check back in
          a moment.
        </Text>
      </Card>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.04 } },
        }}
      >
        {coins.map((coin) => (
          <motion.div
            key={coin.symbol}
            variants={{
              hidden: { opacity: 0, y: 12 },
              show: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <CoinTile coin={coin} />
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
