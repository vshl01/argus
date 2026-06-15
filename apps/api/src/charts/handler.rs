//! HTTP handler for /coins/{symbol}/chart.
//!
//! Combined read of candles + news markers in one round-trip. Mirrors the
//! parameter shape of /coins/{symbol}/candles so callers can swap one for
//! the other without learning a new contract.

use axum::{
    Json,
    extract::{Path, Query, State},
};
use serde::Deserialize;

use crate::charts::service::{self, ChartResponse};
use crate::error::AppError;
use crate::state::AppState;

const DEFAULT_INTERVAL: &str = "1h";
const DEFAULT_LIMIT: i64 = 200;
const MAX_LIMIT: i64 = 1000;

#[derive(Debug, Deserialize)]
pub struct ChartParams {
    pub interval: Option<String>,
    pub limit: Option<i64>,
}

pub async fn chart(
    State(state): State<AppState>,
    Path(symbol): Path<String>,
    Query(params): Query<ChartParams>,
) -> Result<Json<ChartResponse>, AppError> {
    let coin = symbol.to_uppercase();
    let interval = params.interval.as_deref().unwrap_or(DEFAULT_INTERVAL);
    let limit = params.limit.unwrap_or(DEFAULT_LIMIT).clamp(1, MAX_LIMIT);

    let payload = service::build_chart(&state.db, &coin, interval, limit).await?;
    Ok(Json(payload))
}
