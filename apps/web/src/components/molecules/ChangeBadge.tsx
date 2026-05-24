import { Badge } from "@/components/atoms/Badge";
import { directionOf, formatPercent } from "@/lib/formatters/percent";

/**
 * Percent-change pill colored by sign. Used in coin tiles, the header
 * stat strip, and the top-movers ticker — wherever a change figure shows up.
 */
export function ChangeBadge({
  value,
  size = "md",
}: {
  value: number | null | undefined;
  size?: "sm" | "md";
}) {
  const dir = directionOf(value);
  const tone = dir === "positive" ? "positive" : dir === "negative" ? "negative" : "neutral";

  return (
    <Badge
      tone={tone}
      className={size === "sm" ? "text-[10px] px-1.5 py-0" : undefined}
    >
      <span className="num">{formatPercent(value)}</span>
    </Badge>
  );
}
