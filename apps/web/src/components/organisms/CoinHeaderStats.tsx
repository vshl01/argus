"use client";

import { useMemo } from "react";

import { Card } from "@/components/atoms/Card";
import { Skeleton } from "@/components/atoms/Skeleton";
import { Text } from "@/components/atoms/Text";
import { ChangeBadge } from "@/components/molecules/ChangeBadge";
import { CoinIcon } from "@/components/molecules/CoinIcon";
import { PriceTicker } from "@/components/molecules/PriceTicker";
import { StatTile } from "@/components/molecules/StatTile";
import { useCandles } from "@/hooks/useCandles";
import type { Coin } from "@/features/coins/coinsTypes";
import {
  formatCompactCurrency,
  formatCompactNumber,
  formatPrice,
} from "@/lib/formatters/price";

/**
 * Top-of-page stat strip on the coin detail screen.
 *
 * The big number is the *real* last price — the close of the most recent 1h
 * candle (the API has no dedicated "last price" field, so we derive it from
 * the candle series the chart already loads). 24h high/low/volume are computed
 * from the trailing 24 bars.
 */
export function CoinHeaderStats({ coin }: { coin: Coin | undefined }) {
  const { candles } = useCandles({
    symbol: coin?.symbol ?? "",
    interval: "1h",
  });

  const derived = useMemo(() => {
    if (candles.length === 0) return null;
    const last = candles[candles.length - 1]!;
    const window = candles.slice(-24);
    const high = Math.max(...window.map((c) => c.high));
    const low = Math.min(...window.map((c) => c.low));
    const volume = window.reduce((sum, c) => sum + c.volume, 0);
    return { price: last.close, high, low, volume };
  }, [candles]);

  if (!coin) {
    return (
      <Card variant="raised" className="p-6">
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
    <Card variant="raised" className="p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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
              {coin.binance_pair} · Binance
            </Text>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {derived ? (
            <PriceTicker price={derived.price} size="lg" />
          ) : (
            <Text variant="title" tone="tertiary" className="text-3xl">
              —
            </Text>
          )}
          <ChangeBadge value={coin.change_24h_pct} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 lg:grid-cols-6">
        <StatTile label="1h">
          <ChangeBadge value={coin.change_1h_pct} />
        </StatTile>
        <StatTile label="24h">
          <ChangeBadge value={coin.change_24h_pct} />
        </StatTile>
        <StatTile label="7d">
          <ChangeBadge value={coin.change_7d_pct} />
        </StatTile>
        <StatTile label="24h high">
          <Text variant="subtitle" numeric>
            {derived ? formatPrice(derived.high) : "—"}
          </Text>
        </StatTile>
        <StatTile label="24h low">
          <Text variant="subtitle" numeric>
            {derived ? formatPrice(derived.low) : "—"}
          </Text>
        </StatTile>
        <StatTile label="24h volume">
          <Text variant="subtitle" numeric>
            {derived ? formatCompactNumber(derived.volume) : "—"}
          </Text>
        </StatTile>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-border-subtle pt-5 sm:grid-cols-4">
        <StatTile label="Market cap">
          <Text variant="subtitle" numeric>
            {formatCompactCurrency(coin.market_cap_usd)}
          </Text>
        </StatTile>
        <StatTile label="Circulating supply">
          <Text variant="subtitle" numeric>
            {formatCompactNumber(coin.circulating)}
          </Text>
          <Text variant="caption" tone="tertiary">
            {coin.symbol}
          </Text>
        </StatTile>
        <StatTile
          label="Last synced"
          hint={new Date(coin.refreshed_at).toLocaleString()}
        >
          <Text variant="subtitle">Live</Text>
        </StatTile>
        <StatTile label="Coverage">
          <Text variant="subtitle">News + Chart</Text>
        </StatTile>
      </div>
    </Card>
  );
}
