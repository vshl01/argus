/**
 * Domain types for the coins feature.
 *
 * `Coin` mirrors the shape returned by `GET /coins` and `GET /coins/{symbol}`.
 * The backend serializes nullable NUMERIC columns as `number | null`, so we
 * use `null` here (not `undefined`) to match the wire format exactly.
 */

export interface Coin {
  symbol: string;
  coingecko_id: string;
  binance_pair: string;
  name: string;
  icon_url: string | null;
  market_cap_usd: number | null;
  circulating: number | null;
  change_1h_pct: number | null;
  change_24h_pct: number | null;
  change_7d_pct: number | null;
  refreshed_at: string;
}
