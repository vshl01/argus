//! HTTP handler for `/news`.
//!
//! Reads only — the work of pulling articles off the wire is done by the
//! background fetcher in `news::fetcher`. This handler just queries the
//! `articles` table that the fetcher keeps populated.

use axum::{
    Json,
    extract::{Query, State},
};
use serde::Deserialize;

use crate::error::AppError;
use crate::news::service::{self, Article};
use crate::state::AppState;

const DEFAULT_LIMIT: i64 = 50;
const MAX_LIMIT: i64 = 200;

#[derive(Debug, Deserialize)]
pub struct SearchParams {
    /// Optional coin ticker filter. Case-insensitive — we uppercase before
    /// looking up because tags are stored uppercase.
    pub coin: Option<String>,
    /// Optional page size, clamped to [1, MAX_LIMIT].
    pub limit: Option<i64>,
}

pub async fn search_news(
    State(state): State<AppState>,
    Query(params): Query<SearchParams>,
) -> Result<Json<Vec<Article>>, AppError> {
    let limit = params.limit.unwrap_or(DEFAULT_LIMIT).clamp(1, MAX_LIMIT);

    let articles = match params.coin.as_deref() {
        Some(coin) if !coin.is_empty() => {
            service::list_by_coin(&state.db, &coin.to_uppercase(), limit).await?
        }
        _ => service::list_recent(&state.db, limit).await?,
    };

    Ok(Json(articles))
}
