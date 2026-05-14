//! Refresh tokens.
//!
//! Design:
//!   - We hand the client a random 32-byte token, URL-safe base64 encoded.
//!   - The database stores only the SHA-256 hash of that token. A DB leak
//!     therefore cannot be used to forge sessions.
//!   - On `/auth/refresh` we look up by hash, verify it is unexpired and not
//!     revoked, then **rotate**: mark the old row revoked and insert a new one.
//!     If the same refresh token is presented twice, the second attempt fails
//!     because the row is already revoked.

use base64::Engine;
use base64::engine::general_purpose::URL_SAFE_NO_PAD;
use chrono::{DateTime, Duration, Utc};
use rand::RngCore;
use rand::rngs::OsRng;
use sha2::{Digest, Sha256};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;

const TOKEN_BYTES: usize = 32;

/// A refresh-token row as it sits in the database.
#[derive(Debug, sqlx::FromRow)]
pub struct RefreshTokenRecord {
    pub id: Uuid,
    pub user_id: Uuid,
    pub expires_at: DateTime<Utc>,
    pub revoked_at: Option<DateTime<Utc>>,
}

/// Issue a brand-new refresh token for `user_id`. Returns the **plaintext**
/// token (to be returned to the client exactly once) after persisting the hash.
pub async fn issue(
    db: &PgPool,
    user_id: Uuid,
    ttl: std::time::Duration,
) -> Result<String, AppError> {
    let token = generate_token();
    let hash = hash_token(&token);
    let expires_at = Utc::now() + Duration::from_std(ttl).map_err(|e| anyhow::anyhow!(e))?;

    sqlx::query(
        "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)",
    )
    .bind(user_id)
    .bind(&hash)
    .bind(expires_at)
    .execute(db)
    .await?;

    Ok(token)
}

/// Rotate a refresh token: verify the presented token, revoke it, and issue
/// a fresh one. Returns `(user_id, new_refresh_token)`.
pub async fn rotate(
    db: &PgPool,
    presented_token: &str,
    ttl: std::time::Duration,
) -> Result<(Uuid, String), AppError> {
    let hash = hash_token(presented_token);

    let mut tx = db.begin().await?;

    // Look up and atomically lock the row so two concurrent refreshes can't
    // both succeed with the same token.
    let record: Option<RefreshTokenRecord> = sqlx::query_as(
        "SELECT id, user_id, expires_at, revoked_at
         FROM refresh_tokens
         WHERE token_hash = $1
         FOR UPDATE",
    )
    .bind(&hash)
    .fetch_optional(&mut *tx)
    .await?;

    let record = record.ok_or(AppError::InvalidRefreshToken)?;

    if record.revoked_at.is_some() || record.expires_at <= Utc::now() {
        return Err(AppError::InvalidRefreshToken);
    }

    sqlx::query("UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = $1")
        .bind(record.id)
        .execute(&mut *tx)
        .await?;

    let new_token = generate_token();
    let new_hash = hash_token(&new_token);
    let new_expires_at = Utc::now() + Duration::from_std(ttl).map_err(|e| anyhow::anyhow!(e))?;

    sqlx::query(
        "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)",
    )
    .bind(record.user_id)
    .bind(&new_hash)
    .bind(new_expires_at)
    .execute(&mut *tx)
    .await?;

    tx.commit().await?;

    Ok((record.user_id, new_token))
}

fn generate_token() -> String {
    let mut buf = [0u8; TOKEN_BYTES];
    OsRng.fill_bytes(&mut buf);
    URL_SAFE_NO_PAD.encode(buf)
}

fn hash_token(token: &str) -> String {
    let digest = Sha256::digest(token.as_bytes());
    // Hex-encode the digest so it lives in a plain TEXT column.
    let mut out = String::with_capacity(digest.len() * 2);
    for byte in digest {
        use std::fmt::Write;
        let _ = write!(&mut out, "{byte:02x}");
    }
    out
}
