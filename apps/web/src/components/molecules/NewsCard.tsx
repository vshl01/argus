"use client";

import { motion } from "framer-motion";

import { Badge } from "@/components/atoms/Badge";
import { Card } from "@/components/atoms/Card";
import { Text } from "@/components/atoms/Text";
import { timeAgo } from "@/lib/formatters/time";
import type { Article } from "@/features/news/newsTypes";

export function NewsCard({ article, index }: { article: Article; index: number }) {
  return (
    <motion.a
      href={article.link}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
      className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-xl"
    >
      <Card interactive className="p-4">
        <div className="flex items-center justify-between gap-3 text-xs text-text-tertiary">
          <span className="font-medium uppercase tracking-wider">
            {article.source}
          </span>
          <span>{timeAgo(article.published)}</span>
        </div>
        <Text
          variant="body"
          className="mt-2 line-clamp-2 text-text-primary font-medium"
        >
          {article.title}
        </Text>
        {article.snippet ? (
          <Text variant="caption" tone="secondary" className="mt-1 line-clamp-2 block">
            {article.snippet}
          </Text>
        ) : null}
        {article.coins.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1">
            {article.coins.slice(0, 4).map((coin) => (
              <Badge key={coin} tone="neutral" className="text-[10px]">
                {coin}
              </Badge>
            ))}
          </div>
        ) : null}
      </Card>
    </motion.a>
  );
}
