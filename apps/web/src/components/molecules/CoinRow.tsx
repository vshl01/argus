"use client";

import Link from "next/link";

import { Text } from "@/components/atoms/Text";
import { CoinIcon } from "./CoinIcon";
import { ChangeBadge } from "./ChangeBadge";
import { formatCompactCurrency, formatCompactNumber } from "@/lib/formatters/price";

/** One row in the markets table view. */
export function CoinRow({ coin, rank }: { coin: import("@/features/coins/coinsTypes").Coin; rank: number }) {
  return (
    <Link
      href={`/coins/${coin.symbol}`}
      className="grid grid-cols-[28px_1.6fr_1fr_1fr] items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-overlay focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:grid-cols-[28px_1.6fr_1fr_0.8fr_0.8fr_0.8fr]"
    >
      <span className="num text-xs text-text-tertiary">{rank}</span>

      <div className="flex min-w-0 items-center gap-3">
        <CoinIcon src={coin.icon_url} symbol={coin.symbol} size={30} />
        <div className="min-w-0">
          <Text variant="body" className="block truncate font-medium leading-tight">
            {coin.name}
          </Text>
          <Text variant="caption" tone="tertiary">
            {coin.symbol}
          </Text>
        </div>
      </div>

      <div className="text-right">
        <Text variant="body" numeric className="font-medium">
          {formatCompactCurrency(coin.market_cap_usd)}
        </Text>
        <Text variant="caption" tone="tertiary" className="block sm:hidden">
          {formatCompactNumber(coin.circulating)} {coin.symbol}
        </Text>
      </div>

      <div className="hidden justify-end sm:flex">
        <ChangeBadge value={coin.change_1h_pct} size="sm" />
      </div>
      <div className="flex justify-end">
        <ChangeBadge value={coin.change_24h_pct} size="sm" />
      </div>
      <div className="hidden justify-end sm:flex">
        <ChangeBadge value={coin.change_7d_pct} size="sm" />
      </div>
    </Link>
  );
}
