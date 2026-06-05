"use client";

import { Card } from "@/components/atoms/Card";
import { Skeleton } from "@/components/atoms/Skeleton";
import { Text } from "@/components/atoms/Text";
import { NewsCard } from "@/components/molecules/NewsCard";
import { useNews } from "@/hooks/useNews";
import { cn } from "@/lib/cn";

/**
 * Vertical news stream. Pass `coin` to filter to a single ticker, or omit for
 * the global feed.
 *
 * `fill` makes the list grow to its parent's height and scroll internally
 * (header pinned) — used on the coin page so the news column matches the chart
 * height while still listing every article.
 */
export function NewsList({
  coin = null,
  limit = 12,
  title,
  fill = false,
  className,
}: {
  coin?: string | null;
  limit?: number;
  title?: string;
  fill?: boolean;
  className?: string;
}) {
  const { articles, status, error } = useNews({ coin, limit });

  return (
    <section className={cn("flex min-h-0 flex-col gap-3", className)}>
      {title ? (
        <div className="flex shrink-0 items-baseline justify-between">
          <Text variant="subtitle">{title}</Text>
          {articles.length > 0 ? (
            <Text variant="caption" tone="tertiary">
              {articles.length} article{articles.length === 1 ? "" : "s"}
            </Text>
          ) : null}
        </div>
      ) : null}

      <div
        className={cn(
          "flex flex-col gap-3",
          fill && "thin-scrollbar -mr-1 min-h-0 flex-1 overflow-y-auto pr-1",
        )}
      >
        {status === "loading" && articles.length === 0 ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 shrink-0" />
          ))
        ) : status === "error" ? (
          <Card className="p-4">
            <Text variant="caption" tone="secondary">
              {error ?? "Couldn't load news."}
            </Text>
          </Card>
        ) : articles.length === 0 ? (
          <Card className="p-4">
            <Text variant="caption" tone="tertiary">
              No articles {coin ? `for ${coin}` : "yet"}.
            </Text>
          </Card>
        ) : (
          articles.map((article, i) => (
            <NewsCard key={article.link} article={article} index={i} />
          ))
        )}
      </div>
    </section>
  );
}
