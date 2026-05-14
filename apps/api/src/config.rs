//! Loads runtime configuration from environment variables exactly once at
//! startup. Anything that varies between dev/staging/prod lives here.

use std::time::Duration;

#[derive(Clone, Debug)]
pub struct Config {
    pub database_url: String,
    pub server_addr: String,
    pub jwt_secret: String,
    pub access_token_ttl: Duration,
    pub refresh_token_ttl: Duration,
}

impl Config {
    pub fn from_env() -> Result<Self, ConfigError> {
        Ok(Self {
            database_url: require("DATABASE_URL")?,
            server_addr: optional("SERVER_ADDR", "0.0.0.0:3000"),
            jwt_secret: require("JWT_SECRET")?,
            access_token_ttl: Duration::from_secs(parse_u64(
                "JWT_ACCESS_TOKEN_TTL_SECONDS",
                86_400, // 1 day
            )?),
            refresh_token_ttl: Duration::from_secs(parse_u64(
                "REFRESH_TOKEN_TTL_SECONDS",
                30 * 86_400, // 30 days
            )?),
        })
    }
}

fn require(key: &'static str) -> Result<String, ConfigError> {
    std::env::var(key).map_err(|_| ConfigError::Missing(key))
}

fn optional(key: &str, default: &str) -> String {
    std::env::var(key).unwrap_or_else(|_| default.to_string())
}

fn parse_u64(key: &'static str, default: u64) -> Result<u64, ConfigError> {
    match std::env::var(key) {
        Ok(raw) => raw.parse().map_err(|_| ConfigError::Invalid(key)),
        Err(_) => Ok(default),
    }
}

#[derive(Debug, thiserror::Error)]
pub enum ConfigError {
    #[error("required environment variable `{0}` is not set")]
    Missing(&'static str),
    #[error("environment variable `{0}` is not a valid integer")]
    Invalid(&'static str),
}
