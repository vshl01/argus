//! `AuthUser` — an Axum extractor that protects a route with a valid JWT.
//!
//! Usage in a handler:
//!
//! ```ignore
//! async fn me(user: AuthUser, State(state): State<AppState>) -> Result<Json<...>, AppError> {
//!     // `user.id` and `user.email` are guaranteed valid here.
//! }
//! ```
//!
//! If the `Authorization: Bearer <token>` header is missing, malformed, or
//! the JWT fails verification, the request is rejected with 401 before the
//! handler is ever called.

use axum::{
    extract::FromRequestParts,
    http::{header::AUTHORIZATION, request::Parts},
};
use uuid::Uuid;

use crate::auth::jwt;
use crate::error::AppError;
use crate::state::AppState;

#[derive(Debug, Clone)]
pub struct AuthUser {
    pub id: Uuid,
    /// Carried for downstream logging / audit; the source of truth for the
    /// user's email is still the `users` table.
    #[allow(dead_code)]
    pub email: String,
}

impl FromRequestParts<AppState> for AuthUser {
    type Rejection = AppError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        let token = bearer_token(parts).ok_or(AppError::Unauthorized)?;
        let claims = jwt::verify(&state.config.jwt_secret, token)?;
        Ok(AuthUser {
            id: claims.sub,
            email: claims.email,
        })
    }
}

fn bearer_token(parts: &Parts) -> Option<&str> {
    let header = parts.headers.get(AUTHORIZATION)?.to_str().ok()?;
    let (scheme, token) = header.split_once(' ')?;
    if !scheme.eq_ignore_ascii_case("Bearer") {
        return None;
    }
    let token = token.trim();
    if token.is_empty() { None } else { Some(token) }
}
