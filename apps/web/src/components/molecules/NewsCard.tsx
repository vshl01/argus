"use client";

import { motion } from "framer-motion";

import { Badge } from "@/components/atoms/Badge";
import { Card } from "@/components/atoms/Card";
import { Text } from "@/components/atoms/Text";
import { useNewsModal } from "@/components/organisms/NewsModal";
import { timeAgo } from "@/lib/formatters/time";
import { htmlToText } from "@/lib/formatters/html";
import type { Article } from "@/features/news/newsTypes";

/**
 * Compact news item: a meta row plus the headline clamped to two lines, with a
 * "View more" trigger that opens the full story in the shared reader popup.
 * Keeping every card to the same short height makes the rail scan cleanly.
 */
export function NewsCard({ article, index }: { article: Article; index: number }) {
  const { open } = useNewsModal();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
    >
      <Card
        interactive
        role="button"
        tabIndex={0}
        onClick={() => open(article)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            open(article);
          }
        }}
        className="cursor-pointer p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <div className="flex items-center justify-between gap-3 text-xs text-text-tertiary">
          <span className="truncate font-medium uppercase tracking-wider">
            {article.source}
          </span>
          <span className="shrink-0">{timeAgo(article.published)}</span>
        </div>

        <Text
          variant="body"
          className="mt-2 line-clamp-2 font-medium text-text-primary"
        >
          {htmlToText(article.title) || article.title}
        </Text>

        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap gap-1">
            {article.coins.slice(0, 3).map((coin) => (
              <Badge key={coin} tone="neutral" className="text-[10px]">
                {coin}
              </Badge>
            ))}
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-accent">
            View more
            <ArrowGlyph />
          </span>
        </div>
      </Card>
    </motion.div>
  );
}

function ArrowGlyph() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
