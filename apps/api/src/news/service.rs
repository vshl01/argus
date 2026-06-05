//! Read path for `/news`.
//!
//! The handler calls into here to query the `articles` table that the
//! background fetcher in `news::fetcher` keeps populated. No external HTTP,
//! no RSS parsing, no in-memory filtering — Postgres does the work.

use chrono::{DateTime, Utc};
use serde::Serialize;
use sqlx::PgPool;

use crate::error::AppError;

/// One row of the `articles` table, also the JSON shape returned to clients.
#[derive(Debug, Clone, Serialize, sqlx::FromRow)]
pub struct Article {
    pub source: String,
    pub title: String,
    pub link: String,
    pub snippet: String,
    pub published: Option<DateTime<Utc>>,
    pub coins: Vec<String>,
}

/// Most recent `limit` articles across all sources and coins.
pub async fn list_recent(db: &PgPool, limit: i64) -> Result<Vec<Article>, AppError> {
    let rows = sqlx::query_as::<_, Article>(
        "SELECT source, title, link, snippet, published, coins
         FROM articles
         ORDER BY published DESC NULLS LAST
         LIMIT $1",
    )
    .bind(limit)
    .fetch_all(db)
    .await?;
    Ok(rows)
}

/// Most recent `limit` articles tagged with `coin` (uppercase ticker).
///
/// Uses the GIN index on `articles.coins`, so this stays fast even with
/// millions of rows.
pub async fn list_by_coin(db: &PgPool, coin: &str, limit: i64) -> Result<Vec<Article>, AppError> {
    let rows = sqlx::query_as::<_, Article>(
        "SELECT source, title, link, snippet, published, coins
         FROM articles
         WHERE $1 = ANY(coins)
         ORDER BY published DESC NULLS LAST
         LIMIT $2",
    )
    .bind(coin)
    .bind(limit)
    .fetch_all(db)
    .await?;
    Ok(rows)
}

/// Articles tagged with `coin` whose `published` falls inside
/// `[first, last]` inclusive, ordered ascending. Used by the chart
/// endpoint to pull exactly the news that overlaps the visible bars.
pub async fn list_by_coin_in_range(
    db: &PgPool,
    coin: &str,
    first: DateTime<Utc>,
    last: DateTime<Utc>,
) -> Result<Vec<Article>, AppError> {
    let rows = sqlx::query_as::<_, Article>(
        "SELECT source, title, link, snippet, published, coins
         FROM articles
         WHERE $1 = ANY(coins)
           AND published BETWEEN $2 AND $3
         ORDER BY published ASC",
    )
    .bind(coin)
    .bind(first)
    .bind(last)
    .fetch_all(db)
    .await?;
    Ok(rows)
}
