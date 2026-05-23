//! Background fetcher: pulls OHLCV candles from Binance on a timer and
//! upserts into the `candles` table. The HTTP read path in `prices::service`
//! never touches Binance — Postgres is the contract between the two halves.

use std::time::Duration;

use anyhow::Result;
use chrono::{DateTime, Utc};
use sqlx::PgPool;

use crate::prices::service::Candle;
use crate::prices::sources::{INTERVALS, PAIRS, Source};

/// Raw shape Binance's /klines endpoint returns: a 12-element heterogeneous
/// array in a fixed order. We only consume the first six fields; the rest
/// (close time, quote volume, trade count, taker buy stats) are useful for
/// microstructure analytics we aren't doing yet.
type RawKline = (
    i64,    // 0: open time (ms since epoch)
    String, // 1: open
    String, // 2: high
    String, // 3: low
    String, // 4: close
    String, // 5: volume (base asset)
    i64,    // 6: close time
    String, // 7: quote asset volume
    i64,    // 8: number of trades
    String, // 9: taker buy base volume
    String, // 10: taker buy quote volume
    String, // 11: unused (legacy)
);

pub fn spawn(db: PgPool, interval: Duration) {
    tokio::spawn(async move {
        // `tokio::time::interval` fires immediately on the first tick, so the
        // DB gets populated at startup before users can hit the read path.
        let mut ticker = tokio::time::interval(interval);
        loop {
            ticker.tick().await;
            if let Err(err) = run_once(&db).await {
                tracing::warn!(error = ?err, "prices fetcher tick failed");
            }
        }
    });
}

async fn run_once(db: &PgPool) -> Result<()> {
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(5))
        .user_agent("Mozilla/5.0 (compatible; CryptoBackend/0.1)")
        .build()?;

    let mut total = 0usize;
    let mut inserted = 0usize;

    for src in PAIRS {
        for &interval in INTERVALS {
            match fetch_pair(&client, src, interval).await {
                Ok(candles) => {
                    for c in candles {
                        total += 1;
                        if upsert(db, &c).await? {
                            inserted += 1;
                        }
                    }
                }
                Err(err) => {
                    tracing::warn!(
                        error = ?err, coin = src.coin, interval,
                        "kline fetch failed",
                    );
                }
            }
        }
    }

    tracing::info!(total, inserted, "prices fetch complete");
    Ok(())
}

/// Pull recent klines for one (pair, interval) and convert to `Candle` rows
/// ready to upsert. Drops the last kline since it's the in-progress bar —
/// we'd rather wait one tick and ingest it as a finalized candle than store
/// a moving target.
async fn fetch_pair(
    client: &reqwest::Client,
    src: &Source,
    interval: &str,
) -> Result<Vec<Candle>> {
    let url = format!(
        "https://api.binance.com/api/v3/klines?symbol={}&interval={}&limit=500",
        src.binance_pair, interval,
    );

    let mut raw: Vec<RawKline> = client.get(&url).send().await?.json().await?;

    // Drop the in-progress bar (always the last element in chronological order).
    raw.pop();

    let mut candles = Vec::with_capacity(raw.len());
    for r in raw {
        candles.push(parse_kline(src.coin, interval, r)?);
    }
    Ok(candles)
}

fn parse_kline(coin: &str, interval: &str, raw: RawKline) -> Result<Candle> {
    Ok(Candle {
        coin: coin.to_string(),
        interval: interval.to_string(),
        ts: DateTime::<Utc>::from_timestamp_millis(raw.0)
            .ok_or_else(|| anyhow::anyhow!("binance returned invalid timestamp: {}", raw.0))?,
        open: raw.1.parse()?,
        high: raw.2.parse()?,
        low: raw.3.parse()?,
        close: raw.4.parse()?,
        volume: raw.5.parse()?,
    })
}

/// Insert one candle. Returns true if a new row was written, false if the
/// (coin, interval, ts) was already present (almost always the case on
/// every tick except for the newest one or two bars).
async fn upsert(db: &PgPool, c: &Candle) -> Result<bool> {
    let result = sqlx::query(
        "INSERT INTO candles (coin, interval, ts, open, high, low, close, volume)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (coin, interval, ts) DO NOTHING",
    )
    .bind(&c.coin)
    .bind(&c.interval)
    .bind(c.ts)
    .bind(c.open)
    .bind(c.high)
    .bind(c.low)
    .bind(c.close)
    .bind(c.volume)
    .execute(db)
    .await?;

    Ok(result.rows_affected() == 1)
}
