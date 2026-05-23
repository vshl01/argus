//! Which (coin, binance pair) combinations the prices fetcher tracks, and
//! which intervals to keep candles for. Start narrow — one coin, one
//! interval — and widen by editing these constants as the chart needs grow.

pub struct Source {
    pub coin: &'static str,         // 'BTC' — our canonical uppercase ticker
    pub binance_pair: &'static str, // 'BTCUSDT' — Binance's trading pair
}

pub const PAIRS: &[Source] = &[
    Source { coin: "BTC", binance_pair: "BTCUSDT" },
];

/// Intervals to fetch for each pair, expressed as Binance's interval codes.
/// Must also be present in the `candles_interval_known` check constraint
/// in migration `0003_candles.sql`.
pub const INTERVALS: &[&str] = &["1h"];
