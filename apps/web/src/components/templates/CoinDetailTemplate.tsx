"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { Card } from "@/components/atoms/Card";
import { Text } from "@/components/atoms/Text";
import { ChartPanel } from "@/components/organisms/ChartPanel";
import { CoinHeaderStats } from "@/components/organisms/CoinHeaderStats";
import { Indicators } from "@/components/organisms/Indicators";
import { NewsList } from "@/components/organisms/NewsList";
import { useCoin } from "@/hooks/useCoins";
import { fadeRise, staggerContainer } from "@/lib/motion";
import { PageShell } from "./PageShell";

export function CoinDetailTemplate({ symbol }: { symbol: string }) {
  const upper = symbol.toUpperCase();
  const { coin, status } = useCoin(upper);

  return (
    <PageShell>
      <Link
        href="/"
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
      >
        <span aria-hidden>←</span> All coins
      </Link>

      {status === "error" && !coin ? (
        <Card variant="raised" className="mx-auto max-w-md p-8 text-center">
          <Text variant="title" className="text-2xl">
            Coin not tracked
          </Text>
          <Text variant="body" tone="secondary" className="mt-2 block">
            <span className="font-mono">{upper}</span> isn&apos;t in the tracked
            list yet.
          </Text>
          <Link
            href="/"
            className="mt-5 inline-flex h-10 items-center justify-center rounded-lg bg-accent px-4 text-sm font-medium text-text-inverse shadow-glow transition-colors hover:bg-accent-hover"
          >
            Back to markets
          </Link>
        </Card>
      ) : (
        <motion.div
          variants={staggerContainer(0.08)}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px] xl:items-stretch"
        >
          {/* Left: coin details + chart, sharing one width. */}
          <motion.div
            variants={fadeRise}
            className="flex min-w-0 flex-col gap-6"
          >
            <CoinHeaderStats coin={coin} />
            <ChartPanel symbol={upper} />
          </motion.div>

          {/* Right: indicators on top, news filling the rest. Absolutely
              positioned at xl so its (potentially long) content can't inflate
              the row — the left column defines the height, the news scrolls. */}
          <motion.div variants={fadeRise} className="relative min-h-0">
            <div className="flex flex-col gap-6 xl:absolute xl:inset-0">
              <Indicators symbol={upper} />
              <NewsList
                coin={upper}
                title="News"
                limit={100}
                fill
                className="flex-1"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </PageShell>
  );
}
