"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { Card } from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { Skeleton } from "@/components/atoms/Skeleton";
import { Text } from "@/components/atoms/Text";
import { CoinTile } from "@/components/molecules/CoinTile";
import { CoinRow } from "@/components/molecules/CoinRow";
import { SegmentedControl } from "@/components/molecules/SegmentedControl";
import { useCoinList } from "@/hooks/useCoins";
import { staggerContainer, staggerItem } from "@/lib/motion";
import type { Coin } from "@/features/coins/coinsTypes";

type SortKey = "mcap" | "24h" | "7d" | "name";
type View = "grid" | "table";

const SORTS = [
  { value: "mcap" as const, label: "Market cap" },
  { value: "24h" as const, label: "24h" },
  { value: "7d" as const, label: "7d" },
  { value: "name" as const, label: "Name" },
];

function sortCoins(coins: Coin[], key: SortKey): Coin[] {
  const by = [...coins];
  switch (key) {
    case "name":
      return by.sort((a, b) => a.name.localeCompare(b.name));
    case "24h":
      return by.sort(
        (a, b) => (b.change_24h_pct ?? -Infinity) - (a.change_24h_pct ?? -Infinity),
      );
    case "7d":
      return by.sort(
        (a, b) => (b.change_7d_pct ?? -Infinity) - (a.change_7d_pct ?? -Infinity),
      );
    case "mcap":
    default:
      return by.sort((a, b) => (b.market_cap_usd ?? 0) - (a.market_cap_usd ?? 0));
  }
}

/**
 * The home page's market browser: live coin list with client-side search,
 * sort, and a grid⇄table view toggle. This is what makes the dashboard usable
 * past a handful of coins.
 */
export function MarketsPanel() {
  const { coins, status, error } = useCoinList();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("mcap");
  const [view, setView] = useState<View>("grid");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? coins.filter(
          (c) =>
            c.symbol.toLowerCase().includes(q) ||
            c.name.toLowerCase().includes(q),
        )
      : coins;
    return sortCoins(filtered, sort);
  }, [coins, query, sort]);

  const loading = status === "loading" && coins.length === 0;

  return (
    <section id="markets" className="scroll-mt-20">
      <div className="mb-5 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <Text variant="title" className="text-2xl">
            Markets
          </Text>
          <ViewToggle view={view} onChange={setView} />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter coins…"
            className="sm:max-w-xs"
            leading={<SearchGlyph />}
          />
          <div className="flex items-center gap-2">
            <Text variant="caption" tone="tertiary" className="hidden sm:inline">
              Sort
            </Text>
            <SegmentedControl options={SORTS} value={sort} onChange={setSort} />
          </div>
        </div>
      </div>

      {loading ? (
        <GridSkeleton />
      ) : status === "error" ? (
        <Card className="p-8 text-center">
          <Text variant="subtitle">Couldn&apos;t load coins</Text>
          <Text variant="caption" tone="secondary" className="mt-1 block">
            {error ?? "Try refreshing the page."}
          </Text>
        </Card>
      ) : visible.length === 0 ? (
        <Card className="p-8 text-center">
          <Text variant="subtitle">
            {query ? "No matches" : "No coins tracked yet"}
          </Text>
          <Text variant="caption" tone="secondary" className="mt-1 block">
            {query
              ? `Nothing matches “${query}”.`
              : "The background fetcher hasn't populated the database yet."}
          </Text>
        </Card>
      ) : view === "grid" ? (
        <motion.div
          key="grid"
          variants={staggerContainer(0.035)}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {visible.map((coin) => (
            <motion.div key={coin.symbol} variants={staggerItem}>
              <CoinTile coin={coin} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <Card className="overflow-hidden p-2">
          {/* Header row (desktop only) */}
          <div className="hidden grid-cols-[28px_1.6fr_1fr_0.8fr_0.8fr_0.8fr] gap-3 px-3 pb-2 pt-1 sm:grid">
            <span />
            <Text variant="label" tone="tertiary">
              Coin
            </Text>
            <Text variant="label" tone="tertiary" className="text-right">
              Market cap
            </Text>
            <Text variant="label" tone="tertiary" className="text-right">
              1h
            </Text>
            <Text variant="label" tone="tertiary" className="text-right">
              24h
            </Text>
            <Text variant="label" tone="tertiary" className="text-right">
              7d
            </Text>
          </div>
          <div className="flex flex-col divide-y divide-border-subtle">
            <AnimatePresence initial={false}>
              {visible.map((coin, i) => (
                <CoinRow key={coin.symbol} coin={coin} rank={i + 1} />
              ))}
            </AnimatePresence>
          </div>
        </Card>
      )}
    </section>
  );
}

function ViewToggle({
  view,
  onChange,
}: {
  view: View;
  onChange: (v: View) => void;
}) {
  return (
    <SegmentedControl
      size="sm"
      value={view}
      onChange={onChange}
      options={[
        { value: "grid", label: <GridGlyph />, title: "Grid view" },
        { value: "table", label: <ListGlyph />, title: "Table view" },
      ]}
    />
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-[124px]" />
      ))}
    </div>
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

function GridGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function ListGlyph() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}
