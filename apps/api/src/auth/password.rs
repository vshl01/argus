//! Password hashing using Argon2id with per-password random salts.
//!
//! Argon2id is the current OWASP-recommended algorithm for password storage.
//! Hashing is CPU-bound (~50ms by default), so we run it on Tokio's blocking
//! pool to keep the async runtime responsive.

use argon2::{
    Argon2,
    password_hash::{
        PasswordHash, PasswordHasher, PasswordVerifier, SaltString, rand_core::OsRng,
    },
};

/// Hash a plaintext password. Returns the full PHC string (algorithm,
/// parameters, salt, and hash all embedded), which is what we store in the
/// `users.password_hash` column.
pub async fn hash(password: String) -> anyhow::Result<String> {
    tokio::task::spawn_blocking(move || {
        let salt = SaltString::generate(&mut OsRng);
        Argon2::default()
            .hash_password(password.as_bytes(), &salt)
            .map(|h| h.to_string())
            .map_err(|e| anyhow::anyhow!("failed to hash password: {e}"))
    })
    .await?
}

/// Verify a plaintext password against a stored PHC hash. Returns `Ok(true)`
/// on match, `Ok(false)` on mismatch, and `Err` only if the stored hash is
/// malformed (which would indicate database corruption).
pub async fn verify(password: String, hash: String) -> anyhow::Result<bool> {
    tokio::task::spawn_blocking(move || {
        let parsed = PasswordHash::new(&hash)
            .map_err(|e| anyhow::anyhow!("stored password hash is malformed: {e}"))?;
        Ok(Argon2::default()
            .verify_password(password.as_bytes(), &parsed)
            .is_ok())
    })
    .await?
}
