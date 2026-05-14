-- Notes: the existing demo resource, now migrated to a real migration file
-- rather than the inline CREATE TABLE that lived in main.rs.

CREATE TABLE notes (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    title       TEXT         NOT NULL,
    body        TEXT         NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
