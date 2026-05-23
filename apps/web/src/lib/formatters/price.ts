/**
 * Currency / number formatters shared by every price display.
 *
 * Always go through these — never call `toLocaleString` ad-hoc in components.
 * Centralizing the rounding rules avoids price tiles disagreeing about
 * whether to show 2, 4, or 6 decimal places for the same coin.
 */

const FIAT = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const FIAT_PRECISE = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 4,
  maximumFractionDigits: 6,
});

const COMPACT = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 2,
});

const COMPACT_CURRENCY = new Intl.NumberFormat("en-US", {
  notation: "compact",
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

/** $80,234.50 — for prices above $1. Switches to precise mode below. */
export function formatPrice(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return value < 1 ? FIAT_PRECISE.format(value) : FIAT.format(value);
}

/** $1.45T, $850.2B, $12.3M — for market cap, volume, etc. */
export function formatCompactCurrency(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return COMPACT_CURRENCY.format(value);
}

/** 19.84M, 1,029 — for non-currency counts (circulating supply, trades). */
export function formatCompactNumber(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return COMPACT.format(value);
}
