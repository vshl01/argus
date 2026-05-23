import { formatDistanceToNowStrict, parseISO } from "date-fns";

/** "5m ago", "3h ago", "2 days ago" — for news article timestamps. */
export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return `${formatDistanceToNowStrict(parseISO(iso))} ago`;
  } catch {
    return "—";
  }
}

/** Unix epoch SECONDS for TradingView Lightweight Charts. */
export function isoToEpochSeconds(iso: string): number {
  return Math.floor(new Date(iso).getTime() / 1000);
}
