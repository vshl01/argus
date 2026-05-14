//! HTTP handlers for `/auth/*`.
//!
//! Endpoints:
//!   POST /auth/register   — create a new account, return tokens
//!   POST /auth/login      — exchange credentials for tokens
//!   POST /auth/refresh    — exchange a refresh token for a new pair
//!   GET  /auth/me         — return the authenticated user (protected)

use axum::{
    Json, Router,
    extract::State,
    routing::{get, post},
};
use tokio::sync::OnceCell;

use crate::auth::extractor::AuthUser;
use crate::auth::models::{AuthResponse, Credentials, RefreshRequest, User, UserResponse};
use crate::auth::{jwt, password, refresh};
use crate::error::AppError;
use crate::state::AppState;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/auth/register", post(register))
        .route("/auth/login", post(login))
        .route("/auth/refresh", post(refresh_tokens))
        .route("/auth/me", get(me))
}

async fn register(
    State(state): State<AppState>,
    Json(creds): Json<Credentials>,
) -> Result<Json<AuthResponse>, AppError> {
    let email = normalize_email(&creds.email)?;
    validate_password(&creds.password)?;

    let password_hash = password::hash(creds.password).await.map_err(AppError::from)?;

    let user: User = sqlx::query_as(
        "INSERT INTO users (email, password_hash) VALUES ($1, $2)
         RETURNING id, email, password_hash, created_at, updated_at",
    )
    .bind(&email)
    .bind(&password_hash)
    .fetch_one(&state.db)
    .await
    .map_err(map_unique_violation)?;

    Ok(Json(issue_tokens(&state, &user).await?))
}

async fn login(
    State(state): State<AppState>,
    Json(creds): Json<Credentials>,
) -> Result<Json<AuthResponse>, AppError> {
    let email = normalize_email(&creds.email)?;

    let user: Option<User> = sqlx::query_as(
        "SELECT id, email, password_hash, created_at, updated_at
         FROM users
         WHERE email = $1",
    )
    .bind(&email)
    .fetch_optional(&state.db)
    .await?;

    // Always run the Argon2 verification — even when the email is unknown —
    // so attackers can't tell registered vs. unregistered accounts apart by
    // measuring response time.
    let dummy = dummy_hash().await;
    let (candidate, hash_to_check) = match &user {
        Some(u) => (Some(u), u.password_hash.as_str()),
        None => (None, dummy.as_str()),
    };

    let is_valid = password::verify(creds.password, hash_to_check.to_string())
        .await
        .map_err(AppError::from)?;

    let user = match (candidate, is_valid) {
        (Some(u), true) => u.clone(),
        _ => return Err(AppError::InvalidCredentials),
    };

    Ok(Json(issue_tokens(&state, &user).await?))
}

async fn refresh_tokens(
    State(state): State<AppState>,
    Json(req): Json<RefreshRequest>,
) -> Result<Json<AuthResponse>, AppError> {
    let (user_id, new_refresh) =
        refresh::rotate(&state.db, &req.refresh_token, state.config.refresh_token_ttl).await?;

    let user: User = sqlx::query_as(
        "SELECT id, email, password_hash, created_at, updated_at
         FROM users
         WHERE id = $1",
    )
    .bind(user_id)
    .fetch_one(&state.db)
    .await?;

    let access_token = jwt::issue(
        &state.config.jwt_secret,
        user.id,
        &user.email,
        state.config.access_token_ttl,
    )
    .map_err(AppError::from)?;

    Ok(Json(AuthResponse {
        access_token,
        refresh_token: new_refresh,
        token_type: "Bearer",
        expires_in: state.config.access_token_ttl.as_secs() as i64,
        user: UserResponse::from(&user),
    }))
}

async fn me(
    user: AuthUser,
    State(state): State<AppState>,
) -> Result<Json<UserResponse>, AppError> {
    let row: User = sqlx::query_as(
        "SELECT id, email, password_hash, created_at, updated_at
         FROM users
         WHERE id = $1",
    )
    .bind(user.id)
    .fetch_optional(&state.db)
    .await?
    .ok_or(AppError::Unauthorized)?;

    Ok(Json(UserResponse::from(&row)))
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async fn issue_tokens(state: &AppState, user: &User) -> Result<AuthResponse, AppError> {
    let access_token = jwt::issue(
        &state.config.jwt_secret,
        user.id,
        &user.email,
        state.config.access_token_ttl,
    )
    .map_err(AppError::from)?;

    let refresh_token =
        refresh::issue(&state.db, user.id, state.config.refresh_token_ttl).await?;

    Ok(AuthResponse {
        access_token,
        refresh_token,
        token_type: "Bearer",
        expires_in: state.config.access_token_ttl.as_secs() as i64,
        user: UserResponse::from(user),
    })
}

fn normalize_email(raw: &str) -> Result<String, AppError> {
    let trimmed = raw.trim().to_lowercase();
    if trimmed.is_empty() || !trimmed.contains('@') || trimmed.len() > 254 {
        return Err(AppError::BadRequest("invalid email address".into()));
    }
    Ok(trimmed)
}

fn validate_password(password: &str) -> Result<(), AppError> {
    if password.len() < 8 {
        return Err(AppError::BadRequest(
            "password must be at least 8 characters".into(),
        ));
    }
    if password.len() > 1024 {
        return Err(AppError::BadRequest("password is too long".into()));
    }
    Ok(())
}

fn map_unique_violation(err: sqlx::Error) -> AppError {
    if let sqlx::Error::Database(db_err) = &err {
        if db_err.code().as_deref() == Some("23505") {
            return AppError::EmailTaken;
        }
    }
    AppError::from(err)
}

/// A real, valid Argon2id PHC hash computed once and reused for timing
/// protection on logins where the email is unknown. `password::verify` will
/// return false against it, but the verifier still pays the full CPU cost.
async fn dummy_hash() -> &'static String {
    static CACHE: OnceCell<String> = OnceCell::const_new();
    CACHE
        .get_or_init(|| async {
            password::hash("timing-protection-placeholder".to_string())
                .await
                .expect("hashing a constant string with Argon2 defaults cannot fail")
        })
        .await
}
