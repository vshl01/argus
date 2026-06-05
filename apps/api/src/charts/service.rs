//! Read path for /coins/{symbol}/chart.
//!
//! Joins two tables in two queries: pulls candles, then pulls news whose
//! `published` falls inside the candle range, then snaps each article to
//! the candle bucket that contains it. The frontend receives a payload
//! that lightweight-charts can render directly — no client-side join,
//! no per-marker bisect.

use chrono::{DateTime, Utc};
use serde::Serialize;
use sqlx::PgPool;

use crate::error::AppError;
use crate::news::service as news_service;
use crate::prices::service::{self as prices_service, Candle};

/// One news marker, with `time` already snapped to a real candle bucket so
/// lightweight-charts can pin it to a bar through pan/zoom.
#[derive(Debug, Clone, Serialize)]
pub struct ChartMarker {
    pub time: DateTime<Utc>,
    pub title: String,
    pub link: String,
    pub source: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct ChartResponse {
    pub candles: Vec<Candle>,
    pub markers: Vec<ChartMarker>,
}

pub async fn build_chart(
    db: &PgPool,
    coin: &str,
    interval: &str,
    limit: i64,
) -> Result<ChartResponse, AppError> {
    let candles = prices_service::list_candles(db, coin, interval, limit).await?;
    if candles.is_empty() {
        return Ok(ChartResponse {
            candles,
            markers: Vec::new(),
        });
    }

    // `list_candles` returns DESC; build an ASC vec of bar times for
    // snapping. The original `candles` vec stays DESC for the response.
    let mut bars: Vec<DateTime<Utc>> = candles.iter().map(|c| c.ts).collect();
    bars.sort();
    let first = *bars.first().expect("candles non-empty");
    let last = *bars.last().expect("candles non-empty");

    let articles = news_service::list_by_coin_in_range(db, coin, first, last).await?;

    let mut markers: Vec<ChartMarker> = articles
        .into_iter()
        .filter_map(|a| {
            let snapped = snap_to_bar(&bars, a.published?)?;
            Some(ChartMarker {
                time: snapped,
                title: a.title,
                link: a.link,
                source: a.source,
            })
        })
        .collect();
    markers.sort_by_key(|m| m.time);

    Ok(ChartResponse { candles, markers })
}

/// Largest `bars[i]` such that `bars[i] <= t`. `bars` must be sorted
/// ascending. Returns `None` when `t` precedes every bar (shouldn't happen
/// in practice because the SQL filter already clipped to the bar range,
/// but kept defensive so the caller can't crash on a boundary edge).
fn snap_to_bar(bars: &[DateTime<Utc>], t: DateTime<Utc>) -> Option<DateTime<Utc>> {
    match bars.binary_search(&t) {
        Ok(i) => Some(bars[i]),
        Err(0) => None,
        Err(i) => Some(bars[i - 1]),
    }
}
