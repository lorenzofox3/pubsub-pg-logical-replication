SELECT *
FROM pg_create_logical_replication_slot('test_slot', 'pgoutput');

CREATE UNLOGGED TABLE IF NOT EXISTS transactions
(
    transaction_id varchar PRIMARY KEY,
    amount         FLOAT                    NOT NULL,
    status         TEXT                     NOT NULL,
    date           TIMESTAMP WITH TIME ZONE NOT NULL,
    version        INTEGER                  NOT NULL,
    authority      TEXT
);
