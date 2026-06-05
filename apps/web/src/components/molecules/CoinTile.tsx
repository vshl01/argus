"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { Card } from "@/components/atoms/Card";
import { Text } from "@/components/atoms/Text";
import { CoinIcon } from "./CoinIcon";
import { ChangeBadge } from "./ChangeBadge";
import { formatCompactCurrency } from "@/lib/formatters/price";
import { directionOf } from "@/lib/formatters/percent";
import { cn } from "@/lib/cn";
import type { Coin } from "@/features/coins/coinsTypes";

/** One clickable card on the home grid. */
export function CoinTile({ coin }: { coin: Coin }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <Link
        href={`/coins/${coin.symbol}`}
        className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <Card interactive className="p-4">
          <div className="flex items-center gap-3">
            <CoinIcon src={coin.icon_url} symbol={coin.symbol} size={36} />
            <div className="min-w-0 flex-1">
              <Text variant="subtitle" className="block truncate leading-tight">
                {coin.name}
              </Text>
              <Text variant="caption" tone="tertiary">
                {coin.symbol}
              </Text>
            </div>
            <ChangeBadge value={coin.change_24h_pct} />
          </div>

          <div className="mt-4 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <Text variant="label" tone="tertiary">
                Market cap
              </Text>
              <Text variant="subtitle" numeric className="block truncate">
                {formatCompactCurrency(coin.market_cap_usd)}
              </Text>
            </div>
            <ChangeBar value={coin.change_24h_pct} />
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}

/**
 * Honest 24h-change visualization: a bar whose width tracks the *magnitude*
 * of the move and whose color tracks its direction. No fabricated price
 * series — just a faithful rendering of the one number we actually have.
 * Saturates at ±10% so a single outlier doesn't flatten the rest.
 */
function ChangeBar({ value }: { value: number | null | undefined }) {
  const dir = directionOf(value);
  const pct = Math.min(Math.abs(value ?? 0) / 10, 1) * 100;
  const color =
    dir === "positive"
      ? "bg-positive"
      : dir === "negative"
        ? "bg-negative"
        : "bg-border-strong";

  return (
    <div className="h-1.5 w-20 shrink-0 overflow-hidden rounded-full bg-overlay">
      <div
        className={cn("h-full rounded-full transition-[width]", color)}
        style={{ width: `${Math.max(pct, 6)}%` }}
      />
    </div>
  );
}
