/**
 * Lightweight technical indicators computed client-side from candle closes.
 *
 * These are *descriptive* (what the series has done), never predictive. Each
 * returns `null` when there isn't enough data, so callers can render an honest
 * "—" instead of a misleading number.
 */

/** Simple moving average of the last `period` closes. */
export function sma(closes: number[], period: number): number | null {
  if (closes.length < period) return null;
  const slice = closes.slice(closes.length - period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

/**
 * Wilder's RSI over `period` bars (default 14). Returns 0–100, or null when
 * there aren't enough closes.
 */
export function rsi(closes: number[], period = 14): number | null {
  if (closes.length < period + 1) return null;

  let gain = 0;
  let loss = 0;
  // Seed with the first `period` deltas.
  for (let i = 1; i <= period; i++) {
    const delta = closes[i]! - closes[i - 1]!;
    if (delta >= 0) gain += delta;
    else loss -= delta;
  }
  let avgGain = gain / period;
  let avgLoss = loss / period;

  // Smooth across the remaining closes.
  for (let i = period + 1; i < closes.length; i++) {
    const delta = closes[i]! - closes[i - 1]!;
    const up = delta > 0 ? delta : 0;
    const down = delta < 0 ? -delta : 0;
    avgGain = (avgGain * (period - 1) + up) / period;
    avgLoss = (avgLoss * (period - 1) + down) / period;
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

export type RsiZone = "oversold" | "neutral" | "overbought";

/** Conventional RSI interpretation: <30 oversold, >70 overbought. */
export function rsiZone(value: number): RsiZone {
  if (value < 30) return "oversold";
  if (value > 70) return "overbought";
  return "neutral";
}
