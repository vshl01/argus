"use client";

import Link from "next/link";
import { useMemo } from "react";

import { Card } from "@/components/atoms/Card";
import { Skeleton } from "@/components/atoms/Skeleton";
import { Text } from "@/components/atoms/Text";
import { ChangeBadge } from "@/components/molecules/ChangeBadge";
import { CoinIcon } from "@/components/molecules/CoinIcon";
import { useCoinList } from "@/hooks/useCoins";
import { formatCompactCurrency } from "@/lib/formatters/price";
import { timeAgo } from "@/lib/formatters/time";
import type { Coin } from "@/features/coins/coinsTypes";

/**
 * Global market context strip — the at-a-glance summary every crypto
 * dashboard opens with. All values are derived from the live `/coins` list,
 * nothing fabricated.
 */
export function MarketStats() {
  const { coins, status } = useCoinList();

  const stats = useMemo(() => {
    if (coins.length === 0) return null;

    const totalCap = coins.reduce((sum, c) => sum + (c.market_cap_usd ?? 0), 0);
    const withChange = coins.filter((c) => c.change_24h_pct != null);
    const ranked = [...withChange].sort(
      (a, b) => (b.change_24h_pct ?? 0) - (a.change_24h_pct ?? 0),
    );
    const gainer = ranked[0];
    const loser = ranked[ranked.length - 1];
    const lastRefresh = coins.reduce<string | null>((latest, c) => {
      if (!c.refreshed_at) return latest;
      if (!latest || c.refreshed_at > latest) return c.refreshed_at;
      return latest;
    }, null);

    return { totalCap, count: coins.length, gainer, loser, lastRefresh };
  }, [coins]);

  if (status === "loading" && !stats) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[88px]" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard label="Total market cap">
        <Text variant="title" numeric className="text-2xl">
          {formatCompactCurrency(stats.totalCap)}
        </Text>
        <Text variant="caption" tone="tertiary" className="mt-0.5 block">
          across {stats.count} tracked {stats.count === 1 ? "coin" : "coins"}
        </Text>
      </StatCard>

      <MoverCard label="Top gainer · 24h" coin={stats.gainer} />
      <MoverCard label="Top loser · 24h" coin={stats.loser} />

      <StatCard label="Last updated">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-positive opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-positive" />
          </span>
          <Text variant="title" className="text-2xl">
            Live
          </Text>
        </div>
        <Text variant="caption" tone="tertiary" className="mt-0.5 block">
          {stats.lastRefresh ? `synced ${timeAgo(stats.lastRefresh)}` : "—"}
        </Text>
      </StatCard>
    </div>
  );
}

function StatCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-4">
      <Text variant="label" tone="tertiary">
        {label}
      </Text>
      <div className="mt-2">{children}</div>
    </Card>
  );
}

function MoverCard({
  label,
  coin,
}: {
  label: string;
  coin: Coin | undefined;
}) {
  if (!coin) {
    return (
      <StatCard label={label}>
        <Text variant="title" className="text-2xl text-text-tertiary">
          —
        </Text>
      </StatCard>
    );
  }

  return (
    <Card interactive className="p-4">
      <Link href={`/coins/${coin.symbol}`} className="block">
        <Text variant="label" tone="tertiary">
          {label}
        </Text>
        <div className="mt-2 flex items-center gap-2.5">
          <CoinIcon src={coin.icon_url} symbol={coin.symbol} size={28} />
          <div className="min-w-0 flex-1">
            <Text variant="subtitle" className="block truncate leading-tight">
              {coin.symbol}
            </Text>
          </div>
          <ChangeBadge value={coin.change_24h_pct} />
        </div>
      </Link>
    </Card>
  );
}
