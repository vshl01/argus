//! Access-token encode / decode using HS256.
//!
//! We use a symmetric secret (HS256) because this service issues and verifies
//! its own tokens — there's no third party that needs a public key. To rotate
//! the secret without invalidating every session, switch to an asymmetric key
//! (RS256/EdDSA) and serve a JWKS endpoint.

use chrono::{Duration, Utc};
use jsonwebtoken::{
    Algorithm, DecodingKey, EncodingKey, Header, TokenData, Validation, decode, encode,
};
use uuid::Uuid;

use crate::auth::models::Claims;
use crate::error::AppError;

const ALGORITHM: Algorithm = Algorithm::HS256;

/// Sign a JWT for `user_id` / `email`, valid for `ttl`.
pub fn issue(
    secret: &str,
    user_id: Uuid,
    email: &str,
    ttl: std::time::Duration,
) -> anyhow::Result<String> {
    let now = Utc::now();
    let exp = now + Duration::from_std(ttl)?;

    let claims = Claims {
        sub: user_id,
        email: email.to_string(),
        iat: now.timestamp(),
        exp: exp.timestamp(),
    };

    let token = encode(
        &Header::new(ALGORITHM),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )?;
    Ok(token)
}

/// Verify a JWT and return its claims. Maps any signature/expiry failure to
/// `AppError::Unauthorized` so handlers don't have to disambiguate.
pub fn verify(secret: &str, token: &str) -> Result<Claims, AppError> {
    let mut validation = Validation::new(ALGORITHM);
    // `exp` is required and validated by default; make `sub` required too.
    validation.set_required_spec_claims(&["exp", "sub"]);

    let TokenData { claims, .. } = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &validation,
    )
    .map_err(|_| AppError::Unauthorized)?;

    Ok(claims)
}
