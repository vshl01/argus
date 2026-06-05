"use client";

import Link from "next/link";
import { useMemo } from "react";

import { Skeleton } from "@/components/atoms/Skeleton";
import { Text } from "@/components/atoms/Text";
import { ChangeBadge } from "@/components/molecules/ChangeBadge";
import { CoinIcon } from "@/components/molecules/CoinIcon";
import { useCoinList } from "@/hooks/useCoins";

/**
 * Horizontally-scrollable ticker of the biggest 24h movers, edge-faded so it
 * reads as a live tape. Everything here is also in the main grid — this is the
 * "at a glance" flourish.
 */
export function TopMovers() {
  const { coins, status } = useCoinList();

  const movers = useMemo(
    () =>
      coins
        .filter((c) => c.change_24h_pct != null)
        .sort(
          (a, b) =>
            Math.abs(b.change_24h_pct ?? 0) - Math.abs(a.change_24h_pct ?? 0),
        )
        .slice(0, 14),
    [coins],
  );

  if (status === "loading" && movers.length === 0) {
    return (
      <div className="no-scrollbar flex gap-2.5 overflow-x-auto">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-11 w-36 shrink-0" />
        ))}
      </div>
    );
  }

  if (movers.length === 0) return null;

  return (
    <div className="flex items-center gap-3">
      <Text variant="label" tone="tertiary" className="shrink-0">
        Top movers
      </Text>
      <div className="fade-x no-scrollbar -my-1 flex flex-1 items-center gap-2.5 overflow-x-auto py-1">
        {movers.map((coin) => (
          <Link
            key={coin.symbol}
            href={`/coins/${coin.symbol}`}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-border-subtle bg-surface px-2.5 py-1.5 transition-colors hover:border-border-strong hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <CoinIcon src={coin.icon_url} symbol={coin.symbol} size={20} />
            <Text variant="caption" className="font-semibold">
              {coin.symbol}
            </Text>
            <ChangeBadge value={coin.change_24h_pct} size="sm" />
          </Link>
        ))}
      </div>
    </div>
  );
}
