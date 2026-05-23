/** OHLCV candle returned by `GET /coins/{symbol}/candles`. */
export interface Candle {
  coin: string;
  interval: string;
  ts: string; // ISO 8601 UTC
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/** Supported chart intervals — matches the backend `INTERVALS` constant. */
export const SUPPORTED_INTERVALS = ["1h"] as const;
export type Interval = (typeof SUPPORTED_INTERVALS)[number];

/**
 * Compound key used by the candles slice — same (coin, interval) can be
 * loaded by both the chart and a future widget without colliding in state.
 */
export interface CandlesSeriesKey {
  symbol: string;
  interval: string;
}

export function seriesId({ symbol, interval }: CandlesSeriesKey): string {
  return `${symbol.toUpperCase()}:${interval}`;
}
