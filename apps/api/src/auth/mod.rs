//! Authentication: registration, login, refresh, and a protected `/me` route.
//!
//! Layout:
//!   - `models`    request/response/db structs and JWT claims
//!   - `password`  Argon2id password hashing & verification
//!   - `jwt`       access-token encode / decode
//!   - `refresh`   opaque refresh-token issue / verify / rotate
//!   - `extractor` `AuthUser` extractor for protected routes
//!   - `routes`    HTTP handlers and the auth `Router`

pub mod extractor;
pub mod jwt;
pub mod models;
pub mod password;
pub mod refresh;
pub mod routes;

pub use routes::router;
