-- Refresh tokens: long-lived credentials used to mint new access tokens.
--
-- We store only the SHA-256 hash of the token, never the token itself. The
-- raw token is returned to the client exactly once at issue time. On refresh
-- we look up by hash, verify it is unexpired and not revoked, and rotate it
-- (the old row is marked revoked and a new one is issued).

CREATE TABLE refresh_tokens (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash   TEXT         NOT NULL UNIQUE,
    issued_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    expires_at   TIMESTAMPTZ  NOT NULL,
    revoked_at   TIMESTAMPTZ
);

-- Fast lookup of a user's active sessions (e.g. "log out of all devices").
CREATE INDEX refresh_tokens_user_id_idx ON refresh_tokens (user_id);

-- Helpful for a periodic cleanup job that purges expired/revoked rows.
CREATE INDEX refresh_tokens_expires_at_idx ON refresh_tokens (expires_at);
