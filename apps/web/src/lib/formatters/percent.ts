/**
 * Percentage formatting + sign helpers for change displays.
 *
 * The API returns percent values already scaled (e.g. 2.34 means +2.34%),
 * so we just format and tag the sign.
 */

const PERCENT = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: "always",
});

export function formatPercent(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return `${PERCENT.format(value)}%`;
}

/** "positive" | "negative" | "neutral" — drives status coloring. */
export type Direction = "positive" | "negative" | "neutral";

export function directionOf(value: number | null | undefined): Direction {
  if (value == null || !Number.isFinite(value) || value === 0) return "neutral";
  return value > 0 ? "positive" : "negative";
}
