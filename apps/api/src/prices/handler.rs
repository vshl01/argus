//! HTTP handler for /coins/{symbol}/candles. Pure DB read — the fetcher
//! in `prices::fetcher` is the only thing that talks to Binance.

use axum::{
    Json,
    extract::{Path, Query, State},
};
use serde::Deserialize;

use crate::error::AppError;
use crate::prices::service::{self, Candle};
use crate::state::AppState;

const DEFAULT_INTERVAL: &str = "1h";
const DEFAULT_LIMIT: i64 = 200;
const MAX_LIMIT: i64 = 1000;

#[derive(Debug, Deserialize)]
pub struct CandlesParams {
    /// Bar size. Defaults to "1h". Must match an interval the fetcher tracks.
    pub interval: Option<String>,
    /// Page size, clamped to [1, MAX_LIMIT].
    pub limit: Option<i64>,
}

pub async fn candles(
    State(state): State<AppState>,
    Path(symbol): Path<String>,
    Query(params): Query<CandlesParams>,
) -> Result<Json<Vec<Candle>>, AppError> {
    let coin = symbol.to_uppercase();
    let interval = params.interval.as_deref().unwrap_or(DEFAULT_INTERVAL);
    let limit = params.limit.unwrap_or(DEFAULT_LIMIT).clamp(1, MAX_LIMIT);

    let candles = service::list_candles(&state.db, &coin, interval, limit).await?;
    Ok(Json(candles))
}
