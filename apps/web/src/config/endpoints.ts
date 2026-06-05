/**
 * Centralized backend route map — the single place every API path is defined.
 *
 * Combine with `env.apiUrl` (the single place the *domain* is defined) and you
 * have one spot for the whole backend surface: change the host in `env.ts` /
 * `.env.local`, change a path here. The per-feature modules in `lib/api/*Api.ts`
 * reference these builders instead of writing path strings inline.
 */

export const endpoints = {
  /** Liveness probe. */
  health: "/health",

  /** All tracked coins. */
  coins: "/coins",
  /** A single coin by ticker. */
  coin: (symbol: string) => `/coins/${encodeURIComponent(symbol)}`,
  /** OHLCV candles for a coin. */
  candles: (symbol: string) => `/coins/${encodeURIComponent(symbol)}/candles`,
  /** Candles + news markers in one payload (server-side join). */
  chart: (symbol: string) => `/coins/${encodeURIComponent(symbol)}/chart`,

  /** News feed (optionally filtered by coin via query params). */
  news: "/news",
} as const;
