CREATE TABLE IF NOT EXISTS events (
    position BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    event_type VARCHAR NOT NULL,
    stream_id varchar NOT NULL,
    payload JSONB,
    meta JSONB,
    version INTEGER NOT NULL DEFAULT 1,
    created_at timestamp with time zone NOT NULL DEFAULT NOW(),
    UNIQUE (stream_id, version)
);