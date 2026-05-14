//! Data shapes used across the auth module:
//!   - `User`                   the row stored in the `users` table
//!   - `Credentials`            register/login request body
//!   - `RefreshRequest`         /auth/refresh request body
//!   - `AuthResponse`           tokens + user returned on register/login/refresh
//!   - `UserResponse`           public user view (no password hash)
//!   - `Claims`                 the JWT payload

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, sqlx::FromRow)]
pub struct User {
    pub id: Uuid,
    pub email: String,
    pub password_hash: String,
    pub created_at: DateTime<Utc>,
    /// Read by sqlx into the struct but not used in Rust today; kept so the
    /// SELECT lists stay aligned with the table columns.
    #[allow(dead_code)]
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct Credentials {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Deserialize)]
pub struct RefreshRequest {
    pub refresh_token: String,
}

#[derive(Debug, Serialize)]
pub struct AuthResponse {
    pub access_token: String,
    pub refresh_token: String,
    pub token_type: &'static str,
    pub expires_in: i64,
    pub user: UserResponse,
}

#[derive(Debug, Serialize)]
pub struct UserResponse {
    pub id: Uuid,
    pub email: String,
    pub created_at: DateTime<Utc>,
}

impl From<&User> for UserResponse {
    fn from(user: &User) -> Self {
        Self {
            id: user.id,
            email: user.email.clone(),
            created_at: user.created_at,
        }
    }
}

/// JWT payload. Field names follow the standard claim conventions so any
/// off-the-shelf JWT debugger can decode them.
#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    /// Subject — the user id.
    pub sub: Uuid,
    pub email: String,
    /// Issued at (Unix seconds).
    pub iat: i64,
    /// Expires at (Unix seconds).
    pub exp: i64,
}
