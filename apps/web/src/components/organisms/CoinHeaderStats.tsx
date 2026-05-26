"use client";

import { Card } from "@/components/atoms/Card";
import { Skeleton } from "@/components/atoms/Skeleton";
import { Text } from "@/components/atoms/Text";
import { ChangeBadge } from "@/components/molecules/ChangeBadge";
import { CoinIcon } from "@/components/molecules/CoinIcon";
import { PriceTicker } from "@/components/molecules/PriceTicker";
import { StatTile } from "@/components/molecules/StatTile";
import type { Coin } from "@/features/coins/coinsTypes";
import { formatCompactCurrency, formatCompactNumber } from "@/lib/formatters/price";

/**
 * Top-of-page stat strip on the coin detail screen.
 *
 * Note: the API gives us a 24h *change percentage* and we don't store the
 * last price separately yet — so the big number on the left is the 24h
 * change percent rendered as a price-like display. Once a "last price"
 * field is added to the backend, swap in `PriceTicker` directly.
 */
export function CoinHeaderStats({ coin }: { coin: Coin | undefined }) {
  if (!coin) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <CoinIcon src={coin.icon_url} symbol={coin.symbol} size={48} />
          <div>
            <div className="flex items-center gap-2">
              <Text variant="title">{coin.name}</Text>
              <Text variant="caption" tone="tertiary" className="font-mono">
                {coin.symbol}
              </Text>
            </div>
            <Text variant="caption" tone="tertiary" className="block">
              Pair: {coin.binance_pair}
            </Text>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <PriceTicker price={coin.market_cap_usd} size="lg" />
          <ChangeBadge value={coin.change_24h_pct} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label="1h change">
          <ChangeBadge value={coin.change_1h_pct} />
        </StatTile>
        <StatTile label="24h change">
          <ChangeBadge value={coin.change_24h_pct} />
        </StatTile>
        <StatTile label="7d change">
          <ChangeBadge value={coin.change_7d_pct} />
        </StatTile>
        <StatTile label="Circulating supply">
          <Text variant="subtitle" numeric>
            {formatCompactNumber(coin.circulating)}
          </Text>
          <Text variant="caption" tone="tertiary">
            {coin.symbol}
          </Text>
        </StatTile>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 border-t border-border-subtle pt-4 sm:grid-cols-3">
        <StatTile label="Market cap">
          <Text variant="subtitle" numeric>
            {formatCompactCurrency(coin.market_cap_usd)}
          </Text>
        </StatTile>
        <StatTile label="Tracked since" hint={new Date(coin.refreshed_at).toLocaleString()}>
          <Text variant="subtitle">Live</Text>
        </StatTile>
        <StatTile label="Coverage">
          <Text variant="subtitle">News + Chart</Text>
        </StatTile>
      </div>
    </Card>
  );
}
