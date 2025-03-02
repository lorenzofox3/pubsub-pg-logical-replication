import { SQL } from '../../packages/db/index.js';

export const createSaveTransaction =
  ({ db }) =>
  ({ transaction }) => {
    const {
      transactionId,
      status,
      version,
      date,
      authority = null,
      amount,
    } = transaction;
    return db.query(SQL`
MERGE INTO transactions t
USING (VALUES (${transactionId}, ${status}, ${version}::integer, ${authority}, ${date}::timestamp, ${amount}::float)) AS source(transaction_id, status, version, authority, date, amount)
ON source.transaction_id = t.transaction_id
WHEN MATCHED AND source.version > t.version THEN
    UPDATE SET
        version = source.version,
        status = source.status,
        authority = source.authority,
        date = source.date,
        amount = source.amount
WHEN NOT MATCHED THEN
    INSERT (transaction_id, status, version, authority, date, amount)
    VALUES (source.transaction_id, source.status, source.version, source.authority, source.date, source.amount)
`);
  };
