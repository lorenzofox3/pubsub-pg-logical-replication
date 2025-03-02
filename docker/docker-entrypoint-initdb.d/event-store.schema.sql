CREATE TABLE IF NOT EXISTS transaction_events (
    position BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    event_type VARCHAR NOT NULL,
    transaction_id varchar NOT NULL,
    payload JSONB,
    version INTEGER NOT NULL DEFAULT 1,
    created_at timestamp with time zone NOT NULL DEFAULT NOW(),
    UNIQUE (transaction_id, version)
);

CREATE PUBLICATION test_publication FOR TABLE ONLY transaction_events WITH(publish='insert');
