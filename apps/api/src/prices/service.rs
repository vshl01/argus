//! Read path for /coins/{symbol}/candles. Queries the `candles` table that
//! the background fetcher in `prices::fetcher` keeps populated.

use chrono::{DateTime, Utc};
use serde::Serialize;
use sqlx::PgPool;

use crate::error::AppError;

/// One row of the `candles` table, also the JSON shape returned to clients.
/// `coin` and `interval` are kept in the response so the payload is
/// self-describing — frontends can pass the JSON around without losing
/// context about which series the bars belong to.
#[derive(Debug, Clone, Serialize, sqlx::FromRow)]
pub struct Candle {
    pub coin: String,
    pub interval: String,
    pub ts: DateTime<Utc>,
    pub open: f64,
    pub high: f64,
    pub low: f64,
    pub close: f64,
    pub volume: f64,
}

/// Most recent `limit` candles for the given coin + interval, newest first.
///
/// The query uses the composite index on (coin, interval, ts DESC) created
/// in migration 0003, so it stays cheap even with millions of rows.
pub async fn list_candles(
    db: &PgPool,
    coin: &str,
    interval: &str,
    limit: i64,
) -> Result<Vec<Candle>, AppError> {
    let rows = sqlx::query_as::<_, Candle>(
        "SELECT coin, interval, ts, open, high, low, close, volume
         FROM candles
         WHERE coin = $1 AND interval = $2
         ORDER BY ts DESC
         LIMIT $3",
    )
    .bind(coin)
    .bind(interval)
    .bind(limit)
    .fetch_all(db)
    .await?;
    Ok(rows)
}
