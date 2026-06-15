use axum::{Router, routing::get};

use crate::state::AppState;

pub mod handler;
pub mod service;

pub fn router() -> Router<AppState> {
    Router::new().route("/coins/{symbol}/chart", get(handler::chart))
}
